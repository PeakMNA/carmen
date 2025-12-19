/**
 * Document Generation Service
 *
 * Service for processing approved Store Requisitions to the Issue stage.
 * In the new architecture:
 * - ST (Stock Transfer) = SR at Issue stage with INVENTORY destination (filtered view)
 * - SI (Stock Issue) = SR at Issue stage with DIRECT destination (filtered view)
 * - PR (Purchase Request) = Still created separately for shortages
 *
 * Core Functions:
 * - determineDocumentType: Determine outcome type based on locations
 * - generateDocumentPlan: Create a plan showing what will happen
 * - executeIssueStage: Advance SR to Issue stage
 *
 * @see docs/app/store-operations/sr-business-rules.md
 */

import {
  StoreRequisition,
  DocumentGenerationPlan,
  PendingStockTransfer,
  PendingStockIssue,
  PendingPurchaseRequest,
  GeneratedDocumentType,
  GeneratedDocumentReference,
  SRStatus,
  SRStage
} from '@/lib/types/store-requisition'
import { InventoryLocationType } from '@/lib/types/location-management'
import { getNextDocumentNumber } from '@/lib/mock-data/document-sequences'

// ====== SERVICE TYPES ======

export interface IssueStageResult {
  success: boolean
  requisitionId: string
  newStage: SRStage
  documentType: 'transfer' | 'issue'
  generatedDocuments: GeneratedDocumentReference[]
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
   * Execute Issue stage - advances the SR to Issue stage
   * In the new architecture, ST/SI are filtered views of SRs at Issue stage
   */
  async executeIssueStage(
    requisition: StoreRequisition
  ): Promise<IssueStageResult> {
    const errors: string[] = []
    const generatedDocuments: GeneratedDocumentReference[] = []
    const purchaseRequestIds: string[] = []

    // Validate requisition status and stage
    if (requisition.status !== SRStatus.InProgress) {
      return {
        success: false,
        requisitionId: requisition.id,
        newStage: requisition.stage,
        documentType: 'transfer',
        generatedDocuments: [],
        purchaseRequestIds: [],
        errors: [`Cannot issue requisition with status: ${requisition.status}`]
      }
    }

    if (requisition.stage !== SRStage.Approve) {
      return {
        success: false,
        requisitionId: requisition.id,
        newStage: requisition.stage,
        documentType: 'transfer',
        generatedDocuments: [],
        purchaseRequestIds: [],
        errors: [`Requisition must be at Approve stage to issue. Current stage: ${requisition.stage}`]
      }
    }

    // Generate document plan
    const plan = await this.generateDocumentPlan(requisition)

    // Determine document type based on destination
    const documentType: 'transfer' | 'issue' =
      requisition.destinationLocationType === InventoryLocationType.DIRECT ? 'issue' : 'transfer'

    // Track the SR itself as the "generated document"
    // In new architecture, the SR at Issue stage IS the stock transfer or issue
    const totalQuantity = requisition.items.reduce((sum, item) => sum + item.approvedQty, 0)
    const totalValue = requisition.items.reduce((sum, item) => sum + item.totalCost, 0)

    generatedDocuments.push({
      id: `gd-${requisition.id}`,
      documentType: documentType === 'transfer'
        ? GeneratedDocumentType.STOCK_TRANSFER
        : GeneratedDocumentType.STOCK_ISSUE,
      refNo: requisition.refNo,
      status: 'issued',
      lineItemIds: requisition.items.map(i => i.id),
      totalQuantity,
      totalValue: { amount: totalValue, currency: 'USD' },
      createdAt: new Date(),
      documentId: requisition.id
    })

    // Generate Purchase Requests if needed
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
      newStage: SRStage.Issue,
      documentType,
      generatedDocuments,
      purchaseRequestIds,
      errors
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
   * Validate a requisition can be issued
   */
  validateForIssue(requisition: StoreRequisition): {
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

    if (requisition.status !== SRStatus.InProgress) {
      errors.push(`Invalid status for issuing: ${requisition.status}`)
    }

    if (requisition.stage !== SRStage.Approve) {
      errors.push(`Requisition must be at Approve stage. Current: ${requisition.stage}`)
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
