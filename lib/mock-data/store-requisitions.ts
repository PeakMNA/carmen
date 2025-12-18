/**
 * Mock Data - Store Requisitions, Stock Transfers, Stock Issues
 *
 * Sample data for the integrated Store Requisition system supporting:
 * - Store Requisitions with various statuses and workflow types
 * - Stock Transfers (ST) - between inventory locations
 * - Stock Issues (SI) - to direct/expense locations
 * - Generated document references and fulfillment tracking
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
  SRStatus,
  SRWorkflowType,
  TransferStatus,
  IssueStatus,
  GeneratedDocumentType,
  GeneratedDocumentReference,
  SRLineItemFulfillment,
  ReplenishmentSuggestion
} from '@/lib/types/store-requisition'
import { InventoryLocationType } from '@/lib/types/location-management'
import type { ApprovalStatus } from '@/lib/types/common'
import { getNextDocumentNumber, initializeSequenceCounters } from './document-sequences'

// ====== MOCK STORE REQUISITIONS ======

export const mockStoreRequisitions: StoreRequisition[] = [
  // SR-001: Completed Main Store Transfer
  {
    id: 'sr-001',
    refNo: 'SR-2412-001',
    requestDate: new Date('2024-12-01'),
    requiredDate: new Date('2024-12-03'),
    status: SRStatus.Completed,
    workflowType: SRWorkflowType.MAIN_STORE,
    // Source: Main Warehouse
    sourceLocationId: 'loc-004',
    sourceLocationCode: 'WH-001',
    sourceLocationName: 'Main Warehouse',
    sourceLocationType: InventoryLocationType.INVENTORY,
    // Destination: Central Kitchen
    destinationLocationId: 'loc-003',
    destinationLocationCode: 'CK-001',
    destinationLocationName: 'Central Kitchen',
    destinationLocationType: InventoryLocationType.INVENTORY,
    // Requestor
    requestedBy: 'Chef Maria Rodriguez',
    requestorId: 'user-chef-001',
    departmentId: 'dept-003',
    departmentName: 'Food & Beverage',
    // Items
    items: [
      {
        id: 'sri-001-01',
        productId: 'product-001',
        productCode: 'OIL-OLIVE-001',
        productName: 'Premium Olive Oil',
        categoryId: 'cat-oils',
        categoryName: 'Oils & Fats',
        unit: 'bottle',
        requestedQty: 10,
        approvedQty: 10,
        issuedQty: 10,
        unitCost: 8.50,
        totalCost: 85.00,
        sourceAvailableQty: 50,
        fulfillment: {
          fromStock: 10,
          toPurchase: 0,
          documentType: GeneratedDocumentType.STOCK_TRANSFER,
          sourceLocationId: 'loc-004',
          sourceLocationName: 'Main Warehouse'
        },
        approvalStatus: 'approved' as ApprovalStatus
      },
      {
        id: 'sri-001-02',
        productId: 'product-003',
        productCode: 'DRY-FLR-003',
        productName: 'All-Purpose Flour',
        categoryId: 'cat-dry-goods',
        categoryName: 'Dry Goods',
        unit: 'kg',
        requestedQty: 25,
        approvedQty: 25,
        issuedQty: 25,
        unitCost: 2.10,
        totalCost: 52.50,
        sourceAvailableQty: 100,
        fulfillment: {
          fromStock: 25,
          toPurchase: 0,
          documentType: GeneratedDocumentType.STOCK_TRANSFER,
          sourceLocationId: 'loc-004',
          sourceLocationName: 'Main Warehouse'
        },
        approvalStatus: 'approved' as ApprovalStatus
      }
    ],
    totalItems: 2,
    totalQuantity: 35,
    estimatedValue: { amount: 137.50, currency: 'USD' },
    generatedDocuments: [
      {
        id: 'gd-001',
        documentType: GeneratedDocumentType.STOCK_TRANSFER,
        refNo: 'ST-2412-001',
        status: 'received',
        lineItemIds: ['sri-001-01', 'sri-001-02'],
        totalQuantity: 35,
        totalValue: { amount: 137.50, currency: 'USD' },
        createdAt: new Date('2024-12-01'),
        documentId: 'st-001'
      }
    ],
    description: 'Weekly kitchen restock',
    approvedAt: new Date('2024-12-01'),
    approvedBy: 'Department Manager',
    // Links to source replenishment suggestions
    sourceReplenishmentIds: ['rep-004', 'rep-005'],
    createdAt: new Date('2024-12-01'),
    createdBy: 'user-chef-001'
  },

  // SR-002: Approved with Partial Fulfillment (needs PR)
  {
    id: 'sr-002',
    refNo: 'SR-2412-002',
    requestDate: new Date('2024-12-05'),
    requiredDate: new Date('2024-12-08'),
    status: SRStatus.PartialComplete,
    workflowType: SRWorkflowType.MAIN_STORE,
    sourceLocationId: 'loc-004',
    sourceLocationCode: 'WH-001',
    sourceLocationName: 'Main Warehouse',
    sourceLocationType: InventoryLocationType.INVENTORY,
    destinationLocationId: 'loc-003',
    destinationLocationCode: 'CK-001',
    destinationLocationName: 'Central Kitchen',
    destinationLocationType: InventoryLocationType.INVENTORY,
    requestedBy: 'Chef Maria Rodriguez',
    requestorId: 'user-chef-001',
    departmentId: 'dept-003',
    departmentName: 'Food & Beverage',
    items: [
      {
        id: 'sri-002-01',
        productId: 'product-002',
        productCode: 'VEG-TOM-002',
        productName: 'Organic Tomatoes',
        categoryId: 'cat-vegetables',
        categoryName: 'Fresh Vegetables',
        unit: 'kg',
        requestedQty: 50,
        approvedQty: 50,
        issuedQty: 20,
        unitCost: 3.25,
        totalCost: 162.50,
        sourceAvailableQty: 20,
        fulfillment: {
          fromStock: 20,
          toPurchase: 30,
          documentType: GeneratedDocumentType.STOCK_TRANSFER,
          sourceLocationId: 'loc-004',
          sourceLocationName: 'Main Warehouse'
        },
        approvalStatus: 'approved' as ApprovalStatus,
        notes: 'Partial stock - PR created for shortage'
      }
    ],
    totalItems: 1,
    totalQuantity: 50,
    estimatedValue: { amount: 162.50, currency: 'USD' },
    generatedDocuments: [
      {
        id: 'gd-002a',
        documentType: GeneratedDocumentType.STOCK_TRANSFER,
        refNo: 'ST-2412-002',
        status: 'received',
        lineItemIds: ['sri-002-01'],
        totalQuantity: 20,
        totalValue: { amount: 65.00, currency: 'USD' },
        createdAt: new Date('2024-12-05'),
        documentId: 'st-002'
      },
      {
        id: 'gd-002b',
        documentType: GeneratedDocumentType.PURCHASE_REQUEST,
        refNo: 'PR-2412-015',
        status: 'submitted',
        lineItemIds: ['sri-002-01'],
        totalQuantity: 30,
        totalValue: { amount: 97.50, currency: 'USD' },
        createdAt: new Date('2024-12-05'),
        documentId: 'pr-015'
      }
    ],
    description: 'Weekend prep - tomatoes for sauce production',
    approvedAt: new Date('2024-12-05'),
    approvedBy: 'Department Manager',
    createdAt: new Date('2024-12-05'),
    createdBy: 'user-chef-001'
  },

  // SR-003: Store-to-Store Transfer (No Approval Required)
  {
    id: 'sr-003',
    refNo: 'SR-2412-003',
    requestDate: new Date('2024-12-10'),
    requiredDate: new Date('2024-12-10'),
    status: SRStatus.Completed,
    workflowType: SRWorkflowType.STORE_TO_STORE,
    sourceLocationId: 'loc-003',
    sourceLocationCode: 'CK-001',
    sourceLocationName: 'Central Kitchen',
    sourceLocationType: InventoryLocationType.INVENTORY,
    destinationLocationId: 'loc-006',
    destinationLocationCode: 'CORP-001',
    destinationLocationName: 'Corporate Office',
    destinationLocationType: InventoryLocationType.INVENTORY,
    requestedBy: 'John Doe',
    requestorId: 'user-default-001',
    departmentId: 'dept-001',
    departmentName: 'Administration',
    items: [
      {
        id: 'sri-003-01',
        productId: 'product-001',
        productCode: 'OIL-OLIVE-001',
        productName: 'Premium Olive Oil',
        unit: 'bottle',
        requestedQty: 2,
        approvedQty: 2,
        issuedQty: 2,
        unitCost: 8.50,
        totalCost: 17.00,
        sourceAvailableQty: 15,
        fulfillment: {
          fromStock: 2,
          toPurchase: 0,
          documentType: GeneratedDocumentType.STOCK_TRANSFER,
          sourceLocationId: 'loc-003',
          sourceLocationName: 'Central Kitchen'
        },
        approvalStatus: 'approved' as ApprovalStatus
      }
    ],
    totalItems: 1,
    totalQuantity: 2,
    estimatedValue: { amount: 17.00, currency: 'USD' },
    generatedDocuments: [
      {
        id: 'gd-003',
        documentType: GeneratedDocumentType.STOCK_TRANSFER,
        refNo: 'ST-2412-003',
        status: 'received',
        lineItemIds: ['sri-003-01'],
        totalQuantity: 2,
        totalValue: { amount: 17.00, currency: 'USD' },
        createdAt: new Date('2024-12-10'),
        documentId: 'st-003'
      }
    ],
    notes: 'For corporate event',
    createdAt: new Date('2024-12-10'),
    createdBy: 'user-default-001'
  },

  // SR-004: Direct Issue (Stock Issue to Expense)
  {
    id: 'sr-004',
    refNo: 'SR-2412-004',
    requestDate: new Date('2024-12-12'),
    requiredDate: new Date('2024-12-12'),
    status: SRStatus.Completed,
    workflowType: SRWorkflowType.DIRECT_ISSUE,
    sourceLocationId: 'loc-004',
    sourceLocationCode: 'WH-001',
    sourceLocationName: 'Main Warehouse',
    sourceLocationType: InventoryLocationType.INVENTORY,
    destinationLocationId: 'loc-bar-direct',
    destinationLocationCode: 'BAR-001',
    destinationLocationName: 'Restaurant Bar Direct',
    destinationLocationType: InventoryLocationType.DIRECT,
    requestedBy: 'Bar Manager',
    requestorId: 'user-bar-001',
    departmentId: 'dept-003',
    departmentName: 'Food & Beverage',
    items: [
      {
        id: 'sri-004-01',
        productId: 'product-wine-001',
        productCode: 'BEV-WIN-001',
        productName: 'House Red Wine',
        unit: 'bottle',
        requestedQty: 12,
        approvedQty: 12,
        issuedQty: 12,
        unitCost: 15.00,
        totalCost: 180.00,
        sourceAvailableQty: 48,
        fulfillment: {
          fromStock: 12,
          toPurchase: 0,
          documentType: GeneratedDocumentType.STOCK_ISSUE,
          sourceLocationId: 'loc-004',
          sourceLocationName: 'Main Warehouse'
        },
        approvalStatus: 'approved' as ApprovalStatus
      }
    ],
    totalItems: 1,
    totalQuantity: 12,
    estimatedValue: { amount: 180.00, currency: 'USD' },
    generatedDocuments: [
      {
        id: 'gd-004',
        documentType: GeneratedDocumentType.STOCK_ISSUE,
        refNo: 'SI-2412-001',
        status: 'issued',
        lineItemIds: ['sri-004-01'],
        totalQuantity: 12,
        totalValue: { amount: 180.00, currency: 'USD' },
        createdAt: new Date('2024-12-12'),
        documentId: 'si-001'
      }
    ],
    description: 'Bar restock - direct expense',
    approvedAt: new Date('2024-12-12'),
    approvedBy: 'F&B Manager',
    createdAt: new Date('2024-12-12'),
    createdBy: 'user-bar-001'
  },

  // SR-005: Draft - Pending Submission
  {
    id: 'sr-005',
    refNo: 'SR-2412-005',
    requestDate: new Date('2024-12-15'),
    requiredDate: new Date('2024-12-18'),
    status: SRStatus.Draft,
    workflowType: SRWorkflowType.MAIN_STORE,
    sourceLocationId: 'loc-004',
    sourceLocationCode: 'WH-001',
    sourceLocationName: 'Main Warehouse',
    sourceLocationType: InventoryLocationType.INVENTORY,
    destinationLocationId: 'loc-003',
    destinationLocationCode: 'CK-001',
    destinationLocationName: 'Central Kitchen',
    destinationLocationType: InventoryLocationType.INVENTORY,
    requestedBy: 'Chef Maria Rodriguez',
    requestorId: 'user-chef-001',
    departmentId: 'dept-003',
    departmentName: 'Food & Beverage',
    items: [
      {
        id: 'sri-005-01',
        productId: 'product-004',
        productCode: 'HRB-BAS-004',
        productName: 'Fresh Basil',
        unit: 'bunch',
        requestedQty: 15,
        approvedQty: 0,
        issuedQty: 0,
        unitCost: 2.50,
        totalCost: 37.50,
        sourceAvailableQty: 20,
        fulfillment: {
          fromStock: 15,
          toPurchase: 0,
          documentType: GeneratedDocumentType.STOCK_TRANSFER,
          sourceLocationId: 'loc-004',
          sourceLocationName: 'Main Warehouse'
        },
        approvalStatus: 'pending' as ApprovalStatus
      }
    ],
    totalItems: 1,
    totalQuantity: 15,
    estimatedValue: { amount: 37.50, currency: 'USD' },
    generatedDocuments: [],
    description: 'Fresh herbs for weekend menu',
    createdAt: new Date('2024-12-15'),
    createdBy: 'user-chef-001'
  },

  // SR-006: Submitted - Awaiting Approval
  {
    id: 'sr-006',
    refNo: 'SR-2412-006',
    requestDate: new Date('2024-12-16'),
    requiredDate: new Date('2024-12-19'),
    status: SRStatus.Submitted,
    workflowType: SRWorkflowType.MAIN_STORE,
    sourceLocationId: 'loc-004',
    sourceLocationCode: 'WH-001',
    sourceLocationName: 'Main Warehouse',
    sourceLocationType: InventoryLocationType.INVENTORY,
    destinationLocationId: 'loc-003',
    destinationLocationCode: 'CK-001',
    destinationLocationName: 'Central Kitchen',
    destinationLocationType: InventoryLocationType.INVENTORY,
    requestedBy: 'Sous Chef',
    requestorId: 'user-sous-001',
    departmentId: 'dept-003',
    departmentName: 'Food & Beverage',
    items: [
      {
        id: 'sri-006-01',
        productId: 'product-003',
        productCode: 'DRY-FLR-003',
        productName: 'All-Purpose Flour',
        unit: 'kg',
        requestedQty: 50,
        approvedQty: 0,
        issuedQty: 0,
        unitCost: 2.10,
        totalCost: 105.00,
        sourceAvailableQty: 75,
        fulfillment: {
          fromStock: 50,
          toPurchase: 0,
          documentType: GeneratedDocumentType.STOCK_TRANSFER,
          sourceLocationId: 'loc-004',
          sourceLocationName: 'Main Warehouse'
        },
        approvalStatus: 'pending' as ApprovalStatus
      },
      {
        id: 'sri-006-02',
        productId: 'product-sugar-001',
        productCode: 'DRY-SGR-001',
        productName: 'White Sugar',
        unit: 'kg',
        requestedQty: 25,
        approvedQty: 0,
        issuedQty: 0,
        unitCost: 1.50,
        totalCost: 37.50,
        sourceAvailableQty: 40,
        fulfillment: {
          fromStock: 25,
          toPurchase: 0,
          documentType: GeneratedDocumentType.STOCK_TRANSFER,
          sourceLocationId: 'loc-004',
          sourceLocationName: 'Main Warehouse'
        },
        approvalStatus: 'pending' as ApprovalStatus
      }
    ],
    totalItems: 2,
    totalQuantity: 75,
    estimatedValue: { amount: 142.50, currency: 'USD' },
    generatedDocuments: [],
    description: 'Pastry section restock',
    createdAt: new Date('2024-12-16'),
    createdBy: 'user-sous-001'
  },

  // SR-007: Zero Stock - Full PR Generation
  {
    id: 'sr-007',
    refNo: 'SR-2412-007',
    requestDate: new Date('2024-12-17'),
    requiredDate: new Date('2024-12-22'),
    status: SRStatus.Processed,
    workflowType: SRWorkflowType.MAIN_STORE,
    sourceLocationId: 'loc-004',
    sourceLocationCode: 'WH-001',
    sourceLocationName: 'Main Warehouse',
    sourceLocationType: InventoryLocationType.INVENTORY,
    destinationLocationId: 'loc-003',
    destinationLocationCode: 'CK-001',
    destinationLocationName: 'Central Kitchen',
    destinationLocationType: InventoryLocationType.INVENTORY,
    requestedBy: 'Chef Maria Rodriguez',
    requestorId: 'user-chef-001',
    departmentId: 'dept-003',
    departmentName: 'Food & Beverage',
    items: [
      {
        id: 'sri-007-01',
        productId: 'product-truffle-001',
        productCode: 'SPE-TRF-001',
        productName: 'Black Truffle',
        categoryId: 'cat-specialty',
        categoryName: 'Specialty Items',
        unit: 'g',
        requestedQty: 100,
        approvedQty: 100,
        issuedQty: 0,
        unitCost: 5.00,
        totalCost: 500.00,
        sourceAvailableQty: 0,
        fulfillment: {
          fromStock: 0,
          toPurchase: 100,
          documentType: GeneratedDocumentType.PURCHASE_REQUEST
        },
        approvalStatus: 'approved' as ApprovalStatus,
        notes: 'No stock - PR generated for full quantity'
      }
    ],
    totalItems: 1,
    totalQuantity: 100,
    estimatedValue: { amount: 500.00, currency: 'USD' },
    generatedDocuments: [
      {
        id: 'gd-007',
        documentType: GeneratedDocumentType.PURCHASE_REQUEST,
        refNo: 'PR-2412-016',
        status: 'submitted',
        lineItemIds: ['sri-007-01'],
        totalQuantity: 100,
        totalValue: { amount: 500.00, currency: 'USD' },
        createdAt: new Date('2024-12-17'),
        documentId: 'pr-016'
      }
    ],
    description: 'Special order - truffle for holiday menu',
    approvedAt: new Date('2024-12-17'),
    approvedBy: 'Executive Chef',
    createdAt: new Date('2024-12-17'),
    createdBy: 'user-chef-001'
  }
]

// ====== MOCK STOCK TRANSFERS ======

export const mockStockTransfers: StockTransfer[] = [
  {
    id: 'st-001',
    refNo: 'ST-2412-001',
    transferDate: new Date('2024-12-01'),
    status: TransferStatus.Received,
    fromLocationId: 'loc-004',
    fromLocationCode: 'WH-001',
    fromLocationName: 'Main Warehouse',
    fromLocationType: InventoryLocationType.INVENTORY,
    toLocationId: 'loc-003',
    toLocationCode: 'CK-001',
    toLocationName: 'Central Kitchen',
    toLocationType: InventoryLocationType.INVENTORY,
    items: [
      {
        id: 'sti-001-01',
        transferId: 'st-001',
        productId: 'product-001',
        productCode: 'OIL-OLIVE-001',
        productName: 'Premium Olive Oil',
        unit: 'bottle',
        requestedQty: 10,
        issuedQty: 10,
        receivedQty: 10,
        unitCost: { amount: 8.50, currency: 'USD' },
        totalValue: { amount: 85.00, currency: 'USD' },
        sourceRequisitionId: 'sr-001',
        sourceRequisitionItemId: 'sri-001-01'
      },
      {
        id: 'sti-001-02',
        transferId: 'st-001',
        productId: 'product-003',
        productCode: 'DRY-FLR-003',
        productName: 'All-Purpose Flour',
        unit: 'kg',
        requestedQty: 25,
        issuedQty: 25,
        receivedQty: 25,
        unitCost: { amount: 2.10, currency: 'USD' },
        totalValue: { amount: 52.50, currency: 'USD' },
        sourceRequisitionId: 'sr-001',
        sourceRequisitionItemId: 'sri-001-02'
      }
    ],
    totalItems: 2,
    totalQuantity: 35,
    totalValue: { amount: 137.50, currency: 'USD' },
    priority: 'normal',
    sourceRequisitionId: 'sr-001',
    sourceRequisitionRefNo: 'SR-2412-001',
    issuedAt: new Date('2024-12-01T09:00:00'),
    issuedBy: 'Warehouse Staff',
    receivedAt: new Date('2024-12-01T10:30:00'),
    receivedBy: 'Kitchen Staff',
    createdAt: new Date('2024-12-01'),
    createdBy: 'system'
  },
  {
    id: 'st-002',
    refNo: 'ST-2412-002',
    transferDate: new Date('2024-12-05'),
    status: TransferStatus.Received,
    fromLocationId: 'loc-004',
    fromLocationCode: 'WH-001',
    fromLocationName: 'Main Warehouse',
    fromLocationType: InventoryLocationType.INVENTORY,
    toLocationId: 'loc-003',
    toLocationCode: 'CK-001',
    toLocationName: 'Central Kitchen',
    toLocationType: InventoryLocationType.INVENTORY,
    items: [
      {
        id: 'sti-002-01',
        transferId: 'st-002',
        productId: 'product-002',
        productCode: 'VEG-TOM-002',
        productName: 'Organic Tomatoes',
        unit: 'kg',
        requestedQty: 50,
        issuedQty: 20,
        receivedQty: 20,
        unitCost: { amount: 3.25, currency: 'USD' },
        totalValue: { amount: 65.00, currency: 'USD' },
        notes: 'Partial transfer - 30kg pending from PR',
        sourceRequisitionId: 'sr-002',
        sourceRequisitionItemId: 'sri-002-01'
      }
    ],
    totalItems: 1,
    totalQuantity: 20,
    totalValue: { amount: 65.00, currency: 'USD' },
    priority: 'normal',
    notes: 'Partial fulfillment - remainder via PR-2412-015',
    sourceRequisitionId: 'sr-002',
    sourceRequisitionRefNo: 'SR-2412-002',
    issuedAt: new Date('2024-12-05T08:00:00'),
    issuedBy: 'Warehouse Staff',
    receivedAt: new Date('2024-12-05T09:00:00'),
    receivedBy: 'Kitchen Staff',
    createdAt: new Date('2024-12-05'),
    createdBy: 'system'
  },
  {
    id: 'st-003',
    refNo: 'ST-2412-003',
    transferDate: new Date('2024-12-10'),
    status: TransferStatus.Received,
    fromLocationId: 'loc-003',
    fromLocationCode: 'CK-001',
    fromLocationName: 'Central Kitchen',
    fromLocationType: InventoryLocationType.INVENTORY,
    toLocationId: 'loc-006',
    toLocationCode: 'CORP-001',
    toLocationName: 'Corporate Office',
    toLocationType: InventoryLocationType.INVENTORY,
    items: [
      {
        id: 'sti-003-01',
        transferId: 'st-003',
        productId: 'product-001',
        productCode: 'OIL-OLIVE-001',
        productName: 'Premium Olive Oil',
        unit: 'bottle',
        requestedQty: 2,
        issuedQty: 2,
        receivedQty: 2,
        unitCost: { amount: 8.50, currency: 'USD' },
        totalValue: { amount: 17.00, currency: 'USD' },
        sourceRequisitionId: 'sr-003',
        sourceRequisitionItemId: 'sri-003-01'
      }
    ],
    totalItems: 1,
    totalQuantity: 2,
    totalValue: { amount: 17.00, currency: 'USD' },
    priority: 'normal',
    notes: 'Store-to-store transfer for corporate event',
    sourceRequisitionId: 'sr-003',
    sourceRequisitionRefNo: 'SR-2412-003',
    issuedAt: new Date('2024-12-10T14:00:00'),
    issuedBy: 'Kitchen Staff',
    receivedAt: new Date('2024-12-10T15:00:00'),
    receivedBy: 'Office Admin',
    createdAt: new Date('2024-12-10'),
    createdBy: 'system'
  },
  {
    id: 'st-004',
    refNo: 'ST-2412-004',
    transferDate: new Date('2024-12-17'),
    status: TransferStatus.InTransit,
    fromLocationId: 'loc-004',
    fromLocationCode: 'WH-001',
    fromLocationName: 'Main Warehouse',
    fromLocationType: InventoryLocationType.INVENTORY,
    toLocationId: 'loc-003',
    toLocationCode: 'CK-001',
    toLocationName: 'Central Kitchen',
    toLocationType: InventoryLocationType.INVENTORY,
    items: [
      {
        id: 'sti-004-01',
        transferId: 'st-004',
        productId: 'product-005',
        productCode: 'DRY-RIC-001',
        productName: 'Jasmine Rice',
        unit: 'kg',
        requestedQty: 50,
        issuedQty: 50,
        receivedQty: 0,
        unitCost: { amount: 3.00, currency: 'USD' },
        totalValue: { amount: 150.00, currency: 'USD' }
      }
    ],
    totalItems: 1,
    totalQuantity: 50,
    totalValue: { amount: 150.00, currency: 'USD' },
    priority: 'urgent',
    issuedAt: new Date('2024-12-17T07:00:00'),
    issuedBy: 'Warehouse Staff',
    createdAt: new Date('2024-12-17'),
    createdBy: 'system'
  }
]

// ====== MOCK STOCK ISSUES ======

export const mockStockIssues: StockIssue[] = [
  {
    id: 'si-001',
    refNo: 'SI-2412-001',
    issueDate: new Date('2024-12-12'),
    status: IssueStatus.Issued,
    fromLocationId: 'loc-004',
    fromLocationCode: 'WH-001',
    fromLocationName: 'Main Warehouse',
    toLocationId: 'loc-bar-direct',
    toLocationCode: 'BAR-001',
    toLocationName: 'Restaurant Bar Direct',
    items: [
      {
        id: 'sii-001-01',
        issueId: 'si-001',
        productId: 'product-wine-001',
        productCode: 'BEV-WIN-001',
        productName: 'House Red Wine',
        unit: 'bottle',
        requestedQty: 12,
        issuedQty: 12,
        unitCost: { amount: 15.00, currency: 'USD' },
        totalValue: { amount: 180.00, currency: 'USD' },
        sourceRequisitionId: 'sr-004',
        sourceRequisitionItemId: 'sri-004-01'
      }
    ],
    totalItems: 1,
    totalQuantity: 12,
    totalValue: { amount: 180.00, currency: 'USD' },
    expenseAccountId: 'exp-fnb-001',
    expenseAccountName: 'F&B Cost - Bar',
    departmentId: 'dept-003',
    departmentName: 'Food & Beverage',
    notes: 'Bar restock - direct expense to F&B',
    sourceRequisitionId: 'sr-004',
    sourceRequisitionRefNo: 'SR-2412-004',
    issuedAt: new Date('2024-12-12T16:00:00'),
    issuedBy: 'Warehouse Staff',
    createdAt: new Date('2024-12-12'),
    createdBy: 'system'
  },
  {
    id: 'si-002',
    refNo: 'SI-2412-002',
    issueDate: new Date('2024-12-15'),
    status: IssueStatus.Issued,
    fromLocationId: 'loc-004',
    fromLocationCode: 'WH-001',
    fromLocationName: 'Main Warehouse',
    toLocationId: 'loc-maint-direct',
    toLocationCode: 'MAINT-001',
    toLocationName: 'Maintenance Direct',
    items: [
      {
        id: 'sii-002-01',
        issueId: 'si-002',
        productId: 'product-clean-001',
        productCode: 'SUP-CLN-001',
        productName: 'Industrial Cleaner',
        unit: 'liter',
        requestedQty: 20,
        issuedQty: 20,
        unitCost: { amount: 4.50, currency: 'USD' },
        totalValue: { amount: 90.00, currency: 'USD' }
      },
      {
        id: 'sii-002-02',
        issueId: 'si-002',
        productId: 'product-gloves-001',
        productCode: 'SUP-GLV-001',
        productName: 'Disposable Gloves',
        unit: 'box',
        requestedQty: 10,
        issuedQty: 10,
        unitCost: { amount: 12.00, currency: 'USD' },
        totalValue: { amount: 120.00, currency: 'USD' }
      }
    ],
    totalItems: 2,
    totalQuantity: 30,
    totalValue: { amount: 210.00, currency: 'USD' },
    expenseAccountId: 'exp-maint-001',
    expenseAccountName: 'Maintenance Supplies',
    departmentId: 'dept-006',
    departmentName: 'Maintenance',
    notes: 'Monthly maintenance supplies',
    issuedAt: new Date('2024-12-15T10:00:00'),
    issuedBy: 'Warehouse Staff',
    createdAt: new Date('2024-12-15'),
    createdBy: 'system'
  }
]

// ====== MOCK REPLENISHMENT SUGGESTIONS ======

export const mockReplenishmentSuggestions: ReplenishmentSuggestion[] = [
  {
    id: 'rep-001',
    productId: 'product-002',
    productCode: 'VEG-TOM-002',
    productName: 'Organic Tomatoes',
    categoryName: 'Fresh Vegetables',
    unit: 'kg',
    locationId: 'loc-003',
    locationName: 'Central Kitchen',
    locationType: InventoryLocationType.INVENTORY,
    currentStock: 5,
    parLevel: 30,
    reorderPoint: 10,
    minOrderQty: 10,
    maxOrderQty: 50,
    suggestedQty: 25,
    urgency: 'critical',
    sourceAvailability: [
      {
        locationId: 'loc-004',
        locationName: 'Main Warehouse',
        availableQty: 15,
        canFulfill: false
      }
    ],
    estimatedUnitCost: 3.25,
    estimatedTotalCost: 81.25,
    isSelected: false
  },
  {
    id: 'rep-002',
    productId: 'product-003',
    productCode: 'DRY-FLR-003',
    productName: 'All-Purpose Flour',
    categoryName: 'Dry Goods',
    unit: 'kg',
    locationId: 'loc-003',
    locationName: 'Central Kitchen',
    locationType: InventoryLocationType.INVENTORY,
    currentStock: 15,
    parLevel: 50,
    reorderPoint: 20,
    minOrderQty: 25,
    maxOrderQty: 100,
    suggestedQty: 35,
    urgency: 'warning',
    sourceAvailability: [
      {
        locationId: 'loc-004',
        locationName: 'Main Warehouse',
        availableQty: 100,
        canFulfill: true
      }
    ],
    estimatedUnitCost: 2.10,
    estimatedTotalCost: 73.50,
    isSelected: false
  },
  {
    id: 'rep-003',
    productId: 'product-001',
    productCode: 'OIL-OLIVE-001',
    productName: 'Premium Olive Oil',
    categoryName: 'Oils & Fats',
    unit: 'bottle',
    locationId: 'loc-003',
    locationName: 'Central Kitchen',
    locationType: InventoryLocationType.INVENTORY,
    currentStock: 8,
    parLevel: 15,
    reorderPoint: 10,
    minOrderQty: 5,
    maxOrderQty: 20,
    suggestedQty: 7,
    urgency: 'low',
    sourceAvailability: [
      {
        locationId: 'loc-004',
        locationName: 'Main Warehouse',
        availableQty: 50,
        canFulfill: true
      }
    ],
    estimatedUnitCost: 8.50,
    estimatedTotalCost: 59.50,
    isSelected: false
  },
  // Fulfilled replenishment suggestions (used to create SRs)
  {
    id: 'rep-004',
    productId: 'product-001',
    productCode: 'OIL-OLIVE-001',
    productName: 'Premium Olive Oil',
    categoryName: 'Oils & Fats',
    unit: 'bottle',
    locationId: 'loc-003',
    locationName: 'Central Kitchen',
    locationType: InventoryLocationType.INVENTORY,
    currentStock: 2,
    parLevel: 15,
    reorderPoint: 10,
    minOrderQty: 5,
    maxOrderQty: 20,
    suggestedQty: 10,
    urgency: 'critical',
    sourceAvailability: [
      {
        locationId: 'loc-004',
        locationName: 'Main Warehouse',
        availableQty: 50,
        canFulfill: true
      }
    ],
    estimatedUnitCost: 8.50,
    estimatedTotalCost: 85.00,
    isSelected: true,
    generatedRequisitionId: 'sr-001',
    generatedRequisitionRefNo: 'SR-2412-001'
  },
  {
    id: 'rep-005',
    productId: 'product-003',
    productCode: 'DRY-FLR-003',
    productName: 'All-Purpose Flour',
    categoryName: 'Dry Goods',
    unit: 'kg',
    locationId: 'loc-003',
    locationName: 'Central Kitchen',
    locationType: InventoryLocationType.INVENTORY,
    currentStock: 5,
    parLevel: 50,
    reorderPoint: 20,
    minOrderQty: 25,
    maxOrderQty: 100,
    suggestedQty: 25,
    urgency: 'critical',
    sourceAvailability: [
      {
        locationId: 'loc-004',
        locationName: 'Main Warehouse',
        availableQty: 100,
        canFulfill: true
      }
    ],
    estimatedUnitCost: 2.10,
    estimatedTotalCost: 52.50,
    isSelected: true,
    generatedRequisitionId: 'sr-001',
    generatedRequisitionRefNo: 'SR-2412-001'
  }
]

// ====== HELPER FUNCTIONS ======

/**
 * Get store requisition by ID
 */
export function getStoreRequisitionById(id: string): StoreRequisition | undefined {
  return mockStoreRequisitions.find(sr => sr.id === id)
}

/**
 * Get store requisitions by status
 */
export function getStoreRequisitionsByStatus(status: SRStatus): StoreRequisition[] {
  return mockStoreRequisitions.filter(sr => sr.status === status)
}

/**
 * Get store requisitions by destination location
 */
export function getStoreRequisitionsByDestination(locationId: string): StoreRequisition[] {
  return mockStoreRequisitions.filter(sr => sr.destinationLocationId === locationId)
}

/**
 * Get store requisitions by source location
 */
export function getStoreRequisitionsBySource(locationId: string): StoreRequisition[] {
  return mockStoreRequisitions.filter(sr => sr.sourceLocationId === locationId)
}

/**
 * Get store requisitions by workflow type
 */
export function getStoreRequisitionsByWorkflowType(workflowType: SRWorkflowType): StoreRequisition[] {
  return mockStoreRequisitions.filter(sr => sr.workflowType === workflowType)
}

/**
 * Get store requisitions by department
 */
export function getStoreRequisitionsByDepartment(departmentId: string): StoreRequisition[] {
  return mockStoreRequisitions.filter(sr => sr.departmentId === departmentId)
}

/**
 * Get store requisitions by requestor
 */
export function getStoreRequisitionsByRequestor(requestorId: string): StoreRequisition[] {
  return mockStoreRequisitions.filter(sr => sr.requestorId === requestorId)
}

/**
 * Get stock transfer by ID
 */
export function getStockTransferById(id: string): StockTransfer | undefined {
  return mockStockTransfers.find(st => st.id === id)
}

/**
 * Get stock transfers by status
 */
export function getStockTransfersByStatus(status: TransferStatus): StockTransfer[] {
  return mockStockTransfers.filter(st => st.status === status)
}

/**
 * Get stock transfers by source location
 */
export function getStockTransfersBySource(locationId: string): StockTransfer[] {
  return mockStockTransfers.filter(st => st.fromLocationId === locationId)
}

/**
 * Get stock transfers by destination location
 */
export function getStockTransfersByDestination(locationId: string): StockTransfer[] {
  return mockStockTransfers.filter(st => st.toLocationId === locationId)
}

/**
 * Get stock issue by ID
 */
export function getStockIssueById(id: string): StockIssue | undefined {
  return mockStockIssues.find(si => si.id === id)
}

/**
 * Get stock issues by status
 */
export function getStockIssuesByStatus(status: IssueStatus): StockIssue[] {
  return mockStockIssues.filter(si => si.status === status)
}

/**
 * Get replenishment suggestions by location
 */
export function getReplenishmentSuggestionsByLocation(locationId: string): ReplenishmentSuggestion[] {
  return mockReplenishmentSuggestions.filter(rs => rs.locationId === locationId)
}

/**
 * Get replenishment suggestions by urgency
 */
export function getReplenishmentSuggestionsByUrgency(
  urgency: 'critical' | 'warning' | 'low'
): ReplenishmentSuggestion[] {
  return mockReplenishmentSuggestions.filter(rs => rs.urgency === urgency)
}

/**
 * Get all pending replenishment suggestions (not yet created as SR)
 */
export function getPendingReplenishmentSuggestions(): ReplenishmentSuggestion[] {
  return mockReplenishmentSuggestions.filter(rs => !rs.isSelected)
}

/**
 * Get documents linked to a store requisition
 */
export function getDocumentsForRequisition(srId: string): {
  transfers: StockTransfer[]
  issues: StockIssue[]
} {
  return {
    transfers: mockStockTransfers.filter(st => st.sourceRequisitionId === srId),
    issues: mockStockIssues.filter(si => si.sourceRequisitionId === srId)
  }
}

/**
 * Get all generated document references for a store requisition
 * Returns ST, SI, and PR document references
 */
export function getGeneratedDocumentReferences(srId: string): GeneratedDocumentReference[] {
  const sr = getStoreRequisitionById(srId)
  return sr?.generatedDocuments || []
}

/**
 * Get stock transfer by source requisition ID
 */
export function getStockTransfersByRequisition(srId: string): StockTransfer[] {
  return mockStockTransfers.filter(st => st.sourceRequisitionId === srId)
}

/**
 * Get stock issues by source requisition ID
 */
export function getStockIssuesByRequisition(srId: string): StockIssue[] {
  return mockStockIssues.filter(si => si.sourceRequisitionId === srId)
}

// Initialize sequence counters with existing document numbers
// Note: PR sequence numbers are managed separately in purchase-requests.ts
initializeSequenceCounters([
  ...mockStoreRequisitions.map(sr => sr.refNo),
  ...mockStockTransfers.map(st => st.refNo),
  ...mockStockIssues.map(si => si.refNo),
  // Include PRs referenced in generated documents
  'PR-2412-015',
  'PR-2412-016'
])
