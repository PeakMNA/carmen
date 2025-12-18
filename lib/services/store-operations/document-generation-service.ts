/**
 * Document Generation Service
 *
 * Service for generating documents (Stock Transfer, Stock Issue, Purchase Request)
 * from approved Store Requisitions.
 *
 * Core Functions:
 * - determineDocumentType: Determine document type based on locations
 * - generateDocumentPlan: Create a plan of documents to generate
 * - executeDocumentGeneration: Create the actual documents
 *
 * Document Type Determination:
 * - Source has stock + Destination is INVENTORY → Stock Transfer (ST)
 * - Source has stock + Destination is DIRECT → Stock Issue (SI)
 * - No source stock → Purchase Requisition (PR)
 * - Partial stock → ST/SI for available + PR for shortage
 *
 * @see docs/app/store-operations/sr-business-rules.md
 */

import {
  StoreRequisition,
  StoreRequisitionItem,
  StockTransfer,
  StockTransferItem,
  StockIssue,
  StockIssueItem,
  DocumentGenerationPlan,
  PendingStockTransfer,
  PendingStockIssue,
  PendingPurchaseRequest,
  GeneratedDocumentType,
  GeneratedDocumentReference,
  TransferStatus,
  IssueStatus,
  SRStatus
} from '@/lib/types/store-requisition'
import { InventoryLocationType } from '@/lib/types/location-management'
import { getNextDocumentNumber } from '@/lib/mock-data/document-sequences'
import { stockAvailabilityService } from './stock-availability-service'

// ====== SERVICE TYPES ======

export interface DocumentGenerationResult {
  success: boolean
  requisitionId: string
  generatedDocuments: GeneratedDocumentReference[]
  stockTransfers: StockTransfer[]
  stockIssues: StockIssue[]
  purchaseRequestIds: string[]
  errors: string[]
}

export interface DocumentTypeResult {
  documentType: GeneratedDocumentType
  reason: string
}

// ====== SERVICE CLASS ======

export class DocumentGenerationService {
  /**
   * Determine document type based on source/destination and stock availability
   */
  determineDocumentType(
    sourceLocationType: InventoryLocationType,
    destinationLocationType: InventoryLocationType,
    hasStock: boolean
  ): DocumentTypeResult {
    if (!hasStock) {
      return {
        documentType: GeneratedDocumentType.PURCHASE_REQUEST,
        reason: 'No stock available - purchase required'
      }
    }

    if (destinationLocationType === InventoryLocationType.DIRECT) {
      return {
        documentType: GeneratedDocumentType.STOCK_ISSUE,
        reason: 'Destination is a direct/expense location'
      }
    }

    if (destinationLocationType === InventoryLocationType.INVENTORY) {
      return {
        documentType: GeneratedDocumentType.STOCK_TRANSFER,
        reason: 'Transfer between inventory locations'
      }
    }

    // Consignment or other types
    return {
      documentType: GeneratedDocumentType.STOCK_TRANSFER,
      reason: 'Default to stock transfer'
    }
  }

  /**
   * Generate a document plan from a Store Requisition
   * This creates a plan showing what documents will be generated
   */
  async generateDocumentPlan(
    requisition: StoreRequisition
  ): Promise<DocumentGenerationPlan> {
    const stockTransfers: PendingStockTransfer[] = []
    const stockIssues: PendingStockIssue[] = []
    const purchaseRequests: PendingPurchaseRequest[] = []

    // Group items by source location for transfers/issues
    const transferItems: Map<string, {
      productId: string
      productName: string
      quantity: number
      unitCost: number
      sourceItemId: string
    }[]> = new Map()

    const issueItems: Map<string, {
      productId: string
      productName: string
      quantity: number
      unitCost: number
      sourceItemId: string
    }[]> = new Map()

    const prItems: {
      productId: string
      productName: string
      quantity: number
      estimatedUnitCost: number
      sourceItemId: string
    }[] = []

    // Process each line item
    for (const item of requisition.items) {
      const { fulfillment } = item

      // Handle stock portion (Transfer or Issue)
      if (fulfillment.fromStock > 0) {
        const sourceKey = fulfillment.sourceLocationId || requisition.sourceLocationId

        if (requisition.destinationLocationType === InventoryLocationType.DIRECT) {
          // Stock Issue
          const existing = issueItems.get(sourceKey) || []
          existing.push({
            productId: item.productId,
            productName: item.productName,
            quantity: fulfillment.fromStock,
            unitCost: item.unitCost,
            sourceItemId: item.id
          })
          issueItems.set(sourceKey, existing)
        } else {
          // Stock Transfer
          const existing = transferItems.get(sourceKey) || []
          existing.push({
            productId: item.productId,
            productName: item.productName,
            quantity: fulfillment.fromStock,
            unitCost: item.unitCost,
            sourceItemId: item.id
          })
          transferItems.set(sourceKey, existing)
        }
      }

      // Handle shortage portion (PR)
      if (fulfillment.toPurchase > 0) {
        prItems.push({
          productId: item.productId,
          productName: item.productName,
          quantity: fulfillment.toPurchase,
          estimatedUnitCost: item.unitCost,
          sourceItemId: item.id
        })
      }
    }

    // Build pending stock transfers
    for (const [sourceLocationId, items] of transferItems.entries()) {
      const sourceLocation = this.getLocationName(sourceLocationId)
      const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0)
      const totalValue = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0)

      stockTransfers.push({
        fromLocationId: sourceLocationId,
        fromLocationName: sourceLocation,
        toLocationId: requisition.destinationLocationId,
        toLocationName: requisition.destinationLocationName,
        items,
        totalQuantity,
        totalValue
      })
    }

    // Build pending stock issues
    for (const [sourceLocationId, items] of issueItems.entries()) {
      const sourceLocation = this.getLocationName(sourceLocationId)
      const totalQuantity = items.reduce((sum, i) => sum + i.quantity, 0)
      const totalValue = items.reduce((sum, i) => sum + i.quantity * i.unitCost, 0)

      stockIssues.push({
        fromLocationId: sourceLocationId,
        fromLocationName: sourceLocation,
        toLocationId: requisition.destinationLocationId,
        toLocationName: requisition.destinationLocationName,
        departmentId: requisition.departmentId,
        items,
        totalQuantity,
        totalValue
      })
    }

    // Build pending purchase request
    if (prItems.length > 0) {
      const totalQuantity = prItems.reduce((sum, i) => sum + i.quantity, 0)
      const estimatedTotalValue = prItems.reduce(
        (sum, i) => sum + i.quantity * i.estimatedUnitCost,
        0
      )

      purchaseRequests.push({
        deliverToLocationId: this.getPRDeliveryLocation(requisition),
        deliverToLocationName: this.getLocationName(this.getPRDeliveryLocation(requisition)),
        departmentId: requisition.departmentId,
        items: prItems,
        totalQuantity,
        estimatedTotalValue
      })
    }

    return {
      requisitionId: requisition.id,
      stockTransfers,
      stockIssues,
      purchaseRequests
    }
  }

  /**
   * Execute document generation from an approved Store Requisition
   */
  async executeDocumentGeneration(
    requisition: StoreRequisition
  ): Promise<DocumentGenerationResult> {
    const errors: string[] = []
    const generatedDocuments: GeneratedDocumentReference[] = []
    const stockTransfers: StockTransfer[] = []
    const stockIssues: StockIssue[] = []
    const purchaseRequestIds: string[] = []

    // Validate requisition status
    if (requisition.status !== SRStatus.Approved && requisition.status !== SRStatus.Processing) {
      return {
        success: false,
        requisitionId: requisition.id,
        generatedDocuments: [],
        stockTransfers: [],
        stockIssues: [],
        purchaseRequestIds: [],
        errors: [`Cannot generate documents for requisition with status: ${requisition.status}`]
      }
    }

    // Generate document plan
    const plan = await this.generateDocumentPlan(requisition)

    // Generate Stock Transfers
    for (const pending of plan.stockTransfers) {
      try {
        const transfer = await this.createStockTransfer(pending, requisition)
        stockTransfers.push(transfer)
        generatedDocuments.push({
          id: `gd-${transfer.id}`,
          documentType: GeneratedDocumentType.STOCK_TRANSFER,
          refNo: transfer.refNo,
          status: transfer.status,
          lineItemIds: pending.items.map(i => i.sourceItemId),
          totalQuantity: pending.totalQuantity,
          totalValue: { amount: pending.totalValue, currency: 'USD' },
          createdAt: new Date(),
          documentId: transfer.id
        })
      } catch (error) {
        errors.push(`Failed to create stock transfer: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Generate Stock Issues
    for (const pending of plan.stockIssues) {
      try {
        const issue = await this.createStockIssue(pending, requisition)
        stockIssues.push(issue)
        generatedDocuments.push({
          id: `gd-${issue.id}`,
          documentType: GeneratedDocumentType.STOCK_ISSUE,
          refNo: issue.refNo,
          status: issue.status,
          lineItemIds: pending.items.map(i => i.sourceItemId),
          totalQuantity: pending.totalQuantity,
          totalValue: { amount: pending.totalValue, currency: 'USD' },
          createdAt: new Date(),
          documentId: issue.id
        })
      } catch (error) {
        errors.push(`Failed to create stock issue: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Generate Purchase Requests
    for (const pending of plan.purchaseRequests) {
      try {
        const prId = await this.createPurchaseRequest(pending, requisition)
        purchaseRequestIds.push(prId)
        generatedDocuments.push({
          id: `gd-${prId}`,
          documentType: GeneratedDocumentType.PURCHASE_REQUEST,
          refNo: getNextDocumentNumber('PR'),
          status: 'submitted',
          lineItemIds: pending.items.map(i => i.sourceItemId),
          totalQuantity: pending.totalQuantity,
          totalValue: { amount: pending.estimatedTotalValue, currency: 'USD' },
          createdAt: new Date(),
          documentId: prId
        })
      } catch (error) {
        errors.push(`Failed to create purchase request: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return {
      success: errors.length === 0,
      requisitionId: requisition.id,
      generatedDocuments,
      stockTransfers,
      stockIssues,
      purchaseRequestIds,
      errors
    }
  }

  /**
   * Create a Stock Transfer document
   */
  private async createStockTransfer(
    pending: PendingStockTransfer,
    requisition: StoreRequisition
  ): Promise<StockTransfer> {
    const id = `st-${Date.now()}`
    const refNo = getNextDocumentNumber('ST')

    const items: StockTransferItem[] = pending.items.map((item, index) => ({
      id: `sti-${id}-${index + 1}`,
      transferId: id,
      productId: item.productId,
      productCode: item.productId, // Would be looked up in production
      productName: item.productName,
      unit: 'unit', // Would be looked up in production
      requestedQty: item.quantity,
      issuedQty: 0,
      receivedQty: 0,
      unitCost: { amount: item.unitCost, currency: 'USD' },
      totalValue: { amount: item.quantity * item.unitCost, currency: 'USD' },
      sourceRequisitionId: requisition.id,
      sourceRequisitionItemId: item.sourceItemId
    }))

    return {
      id,
      refNo,
      transferDate: new Date(),
      status: TransferStatus.Pending,
      fromLocationId: pending.fromLocationId,
      fromLocationCode: pending.fromLocationId,
      fromLocationName: pending.fromLocationName,
      fromLocationType: InventoryLocationType.INVENTORY,
      toLocationId: pending.toLocationId,
      toLocationCode: pending.toLocationId,
      toLocationName: pending.toLocationName,
      toLocationType: requisition.destinationLocationType,
      items,
      totalItems: items.length,
      totalQuantity: pending.totalQuantity,
      totalValue: { amount: pending.totalValue, currency: 'USD' },
      priority: 'normal',
      sourceRequisitionId: requisition.id,
      sourceRequisitionRefNo: requisition.refNo,
      createdAt: new Date(),
      createdBy: 'system'
    }
  }

  /**
   * Create a Stock Issue document
   */
  private async createStockIssue(
    pending: PendingStockIssue,
    requisition: StoreRequisition
  ): Promise<StockIssue> {
    const id = `si-${Date.now()}`
    const refNo = getNextDocumentNumber('SI')

    const items: StockIssueItem[] = pending.items.map((item, index) => ({
      id: `sii-${id}-${index + 1}`,
      issueId: id,
      productId: item.productId,
      productCode: item.productId,
      productName: item.productName,
      unit: 'unit',
      requestedQty: item.quantity,
      issuedQty: 0,
      unitCost: { amount: item.unitCost, currency: 'USD' },
      totalValue: { amount: item.quantity * item.unitCost, currency: 'USD' },
      sourceRequisitionId: requisition.id,
      sourceRequisitionItemId: item.sourceItemId
    }))

    return {
      id,
      refNo,
      issueDate: new Date(),
      status: IssueStatus.Pending,
      fromLocationId: pending.fromLocationId,
      fromLocationCode: pending.fromLocationId,
      fromLocationName: pending.fromLocationName,
      toLocationId: pending.toLocationId,
      toLocationCode: pending.toLocationId,
      toLocationName: pending.toLocationName,
      items,
      totalItems: items.length,
      totalQuantity: pending.totalQuantity,
      totalValue: { amount: pending.totalValue, currency: 'USD' },
      departmentId: pending.departmentId,
      departmentName: requisition.departmentName,
      sourceRequisitionId: requisition.id,
      sourceRequisitionRefNo: requisition.refNo,
      createdAt: new Date(),
      createdBy: 'system'
    }
  }

  /**
   * Create a Purchase Request (stub - returns ID)
   * In production, this would integrate with the PR module
   */
  private async createPurchaseRequest(
    pending: PendingPurchaseRequest,
    requisition: StoreRequisition
  ): Promise<string> {
    // In production, this would create a PR record
    // For now, return a mock ID
    return `pr-${Date.now()}`
  }

  /**
   * Get the PR delivery location based on configuration
   * Default: Deliver to source location (Main Store)
   */
  private getPRDeliveryLocation(requisition: StoreRequisition): string {
    // Configuration could be: FROM_LOCATION, TO_LOCATION, or USER_SELECT
    // Default behavior: FROM_LOCATION (Main Store)
    return requisition.sourceLocationId
  }

  /**
   * Helper to get location name
   */
  private getLocationName(locationId: string): string {
    const locationNames: Record<string, string> = {
      'loc-003': 'Central Kitchen',
      'loc-004': 'Main Warehouse',
      'loc-006': 'Corporate Office',
      'loc-bar-direct': 'Restaurant Bar Direct',
      'loc-maint-direct': 'Maintenance Direct'
    }
    return locationNames[locationId] || locationId
  }

  /**
   * Validate a requisition can have documents generated
   */
  validateForGeneration(requisition: StoreRequisition): {
    valid: boolean
    errors: string[]
  } {
    const errors: string[] = []

    if (!requisition.id) {
      errors.push('Requisition ID is required')
    }

    if (requisition.items.length === 0) {
      errors.push('Requisition has no items')
    }

    if (requisition.status !== SRStatus.Approved && requisition.status !== SRStatus.Processing) {
      errors.push(`Invalid status for document generation: ${requisition.status}`)
    }

    // Check each item has fulfillment data
    for (const item of requisition.items) {
      if (!item.fulfillment) {
        errors.push(`Item ${item.id} is missing fulfillment data`)
      }
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Export singleton instance
export const documentGenerationService = new DocumentGenerationService()
