/**
 * Mock Data - Store Requisitions
 *
 * Sample data for the integrated Store Requisition system.
 * Stock Transfers (ST) and Stock Issues (SI) are now filtered views of SRs at the Issue stage:
 * - ST: SRs where stage = Issue AND destinationLocationType = INVENTORY
 * - SI: SRs where stage = Issue AND destinationLocationType = DIRECT
 *
 * @see docs/app/store-operations/sr-business-rules.md
 */

import {
  StoreRequisition,
  StoreRequisitionItem,
  SRStatus,
  SRStage,
  SRWorkflowType,
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
    stage: SRStage.Complete,
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
    issuedAt: new Date('2024-12-01T09:00:00'),
    issuedBy: 'Warehouse Staff',
    completedAt: new Date('2024-12-01T10:30:00'),
    completedBy: 'System',
    // Links to source replenishment suggestions
    sourceReplenishmentIds: ['rep-004', 'rep-005'],
    createdAt: new Date('2024-12-01'),
    createdBy: 'user-chef-001'
  },

  // SR-002: At Issue stage with Partial Fulfillment (needs PR)
  {
    id: 'sr-002',
    refNo: 'SR-2412-002',
    requestDate: new Date('2024-12-05'),
    requiredDate: new Date('2024-12-08'),
    status: SRStatus.InProgress,
    stage: SRStage.Issue,
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
    issuedAt: new Date('2024-12-05T08:00:00'),
    issuedBy: 'Warehouse Staff',
    createdAt: new Date('2024-12-05'),
    createdBy: 'user-chef-001'
  },

  // SR-003: Store-to-Store Transfer (No Approval Required) - Completed
  {
    id: 'sr-003',
    refNo: 'SR-2412-003',
    requestDate: new Date('2024-12-10'),
    requiredDate: new Date('2024-12-10'),
    status: SRStatus.Completed,
    stage: SRStage.Complete,
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
    issuedAt: new Date('2024-12-10T14:00:00'),
    issuedBy: 'Kitchen Staff',
    completedAt: new Date('2024-12-10T15:00:00'),
    completedBy: 'System',
    createdAt: new Date('2024-12-10'),
    createdBy: 'user-default-001'
  },

  // SR-004: Direct Issue (Stock Issue to Expense) - Completed
  {
    id: 'sr-004',
    refNo: 'SR-2412-004',
    requestDate: new Date('2024-12-12'),
    requiredDate: new Date('2024-12-12'),
    status: SRStatus.Completed,
    stage: SRStage.Complete,
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
    issuedAt: new Date('2024-12-12T16:00:00'),
    issuedBy: 'Warehouse Staff',
    completedAt: new Date('2024-12-12T16:30:00'),
    completedBy: 'System',
    expenseAccountId: 'exp-fnb-001',
    expenseAccountName: 'F&B Cost - Bar',
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
    stage: SRStage.Draft,
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

  // SR-006: Submitted - Awaiting Approval (stage: Submit, status: InProgress)
  {
    id: 'sr-006',
    refNo: 'SR-2412-006',
    requestDate: new Date('2024-12-16'),
    requiredDate: new Date('2024-12-19'),
    status: SRStatus.InProgress,
    stage: SRStage.Submit,
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

  // SR-007: Zero Stock - Full PR Generation (stage: Issue, status: InProgress)
  {
    id: 'sr-007',
    refNo: 'SR-2412-007',
    requestDate: new Date('2024-12-17'),
    requiredDate: new Date('2024-12-22'),
    status: SRStatus.InProgress,
    stage: SRStage.Issue,
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
    issuedAt: new Date('2024-12-17T10:00:00'),
    issuedBy: 'System',
    createdAt: new Date('2024-12-17'),
    createdBy: 'user-chef-001'
  },

  // SR-008: Direct Issue at Issue stage (for Stock Issue view testing)
  {
    id: 'sr-008',
    refNo: 'SR-2412-008',
    requestDate: new Date('2024-12-18'),
    requiredDate: new Date('2024-12-18'),
    status: SRStatus.InProgress,
    stage: SRStage.Issue,
    workflowType: SRWorkflowType.DIRECT_ISSUE,
    sourceLocationId: 'loc-004',
    sourceLocationCode: 'WH-001',
    sourceLocationName: 'Main Warehouse',
    sourceLocationType: InventoryLocationType.INVENTORY,
    destinationLocationId: 'loc-maint-direct',
    destinationLocationCode: 'MAINT-001',
    destinationLocationName: 'Maintenance Direct',
    destinationLocationType: InventoryLocationType.DIRECT,
    requestedBy: 'Maintenance Manager',
    requestorId: 'user-maint-001',
    departmentId: 'dept-006',
    departmentName: 'Maintenance',
    items: [
      {
        id: 'sri-008-01',
        productId: 'product-clean-001',
        productCode: 'SUP-CLN-001',
        productName: 'Industrial Cleaner',
        unit: 'liter',
        requestedQty: 20,
        approvedQty: 20,
        issuedQty: 20,
        unitCost: 4.50,
        totalCost: 90.00,
        sourceAvailableQty: 50,
        fulfillment: {
          fromStock: 20,
          toPurchase: 0,
          documentType: GeneratedDocumentType.STOCK_ISSUE,
          sourceLocationId: 'loc-004',
          sourceLocationName: 'Main Warehouse'
        },
        approvalStatus: 'approved' as ApprovalStatus
      },
      {
        id: 'sri-008-02',
        productId: 'product-gloves-001',
        productCode: 'SUP-GLV-001',
        productName: 'Disposable Gloves',
        unit: 'box',
        requestedQty: 10,
        approvedQty: 10,
        issuedQty: 10,
        unitCost: 12.00,
        totalCost: 120.00,
        sourceAvailableQty: 30,
        fulfillment: {
          fromStock: 10,
          toPurchase: 0,
          documentType: GeneratedDocumentType.STOCK_ISSUE,
          sourceLocationId: 'loc-004',
          sourceLocationName: 'Main Warehouse'
        },
        approvalStatus: 'approved' as ApprovalStatus
      }
    ],
    totalItems: 2,
    totalQuantity: 30,
    estimatedValue: { amount: 210.00, currency: 'USD' },
    generatedDocuments: [],
    description: 'Monthly maintenance supplies',
    approvedAt: new Date('2024-12-18T08:00:00'),
    approvedBy: 'Facilities Manager',
    issuedAt: new Date('2024-12-18T10:00:00'),
    issuedBy: 'Warehouse Staff',
    expenseAccountId: 'exp-maint-001',
    expenseAccountName: 'Maintenance Supplies',
    createdAt: new Date('2024-12-18'),
    createdBy: 'user-maint-001'
  },

  // SR-009: Transfer at Issue stage (for Stock Transfer view testing)
  {
    id: 'sr-009',
    refNo: 'SR-2412-009',
    requestDate: new Date('2024-12-17'),
    requiredDate: new Date('2024-12-17'),
    status: SRStatus.InProgress,
    stage: SRStage.Issue,
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
        id: 'sri-009-01',
        productId: 'product-005',
        productCode: 'DRY-RIC-001',
        productName: 'Jasmine Rice',
        unit: 'kg',
        requestedQty: 50,
        approvedQty: 50,
        issuedQty: 50,
        unitCost: 3.00,
        totalCost: 150.00,
        sourceAvailableQty: 100,
        fulfillment: {
          fromStock: 50,
          toPurchase: 0,
          documentType: GeneratedDocumentType.STOCK_TRANSFER,
          sourceLocationId: 'loc-004',
          sourceLocationName: 'Main Warehouse'
        },
        approvalStatus: 'approved' as ApprovalStatus
      }
    ],
    totalItems: 1,
    totalQuantity: 50,
    estimatedValue: { amount: 150.00, currency: 'USD' },
    generatedDocuments: [],
    description: 'Urgent rice restock',
    approvedAt: new Date('2024-12-17T06:30:00'),
    approvedBy: 'F&B Manager',
    issuedAt: new Date('2024-12-17T07:00:00'),
    issuedBy: 'Warehouse Staff',
    createdAt: new Date('2024-12-17'),
    createdBy: 'user-chef-001'
  }
]

// ====== STOCK TRANSFER & STOCK ISSUE FILTERED VIEWS ======
//
// IMPORTANT: Stock Transfers (ST) and Stock Issues (SI) are NOT separate entities.
// They are filtered views of Store Requisitions at the Issue stage.
//
// Stock Transfer View: SRs where stage = Issue AND destinationLocationType = INVENTORY
// Stock Issue View: SRs where stage = Issue AND destinationLocationType = DIRECT
//
// Use the helper functions below to get the filtered data:
// - getStoreRequisitionsForStockTransfer()
// - getStoreRequisitionsForStockIssue()

// The old mockStockTransfers and mockStockIssues arrays have been removed.
// See the helper functions below for filtered views.

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

// ====== FILTERED VIEW HELPER FUNCTIONS ======
// Stock Transfers and Stock Issues are filtered views of Store Requisitions

/**
 * Get store requisitions for Stock Transfer view
 *
 * Stock Transfers are SRs at the Issue stage with INVENTORY destination.
 * These represent transfers between inventory locations.
 */
export function getStoreRequisitionsForStockTransfer(): StoreRequisition[] {
  return mockStoreRequisitions.filter(
    sr => sr.stage === SRStage.Issue && sr.destinationLocationType === InventoryLocationType.INVENTORY
  )
}

/**
 * Get store requisitions for Stock Issue view
 *
 * Stock Issues are SRs at the Issue stage with DIRECT destination.
 * These represent issues to expense/direct locations.
 */
export function getStoreRequisitionsForStockIssue(): StoreRequisition[] {
  return mockStoreRequisitions.filter(
    sr => sr.stage === SRStage.Issue && sr.destinationLocationType === InventoryLocationType.DIRECT
  )
}

/**
 * Get store requisition by ID for Stock Transfer view
 * Returns SR if it qualifies as a Stock Transfer (Issue stage + INVENTORY destination)
 */
export function getStoreRequisitionForStockTransferById(id: string): StoreRequisition | undefined {
  const sr = mockStoreRequisitions.find(sr => sr.id === id)
  if (sr && sr.stage === SRStage.Issue && sr.destinationLocationType === InventoryLocationType.INVENTORY) {
    return sr
  }
  return undefined
}

/**
 * Get store requisition by ID for Stock Issue view
 * Returns SR if it qualifies as a Stock Issue (Issue stage + DIRECT destination)
 */
export function getStoreRequisitionForStockIssueById(id: string): StoreRequisition | undefined {
  const sr = mockStoreRequisitions.find(sr => sr.id === id)
  if (sr && sr.stage === SRStage.Issue && sr.destinationLocationType === InventoryLocationType.DIRECT) {
    return sr
  }
  return undefined
}

/**
 * Get store requisitions by stage
 */
export function getStoreRequisitionsByStage(stage: SRStage): StoreRequisition[] {
  return mockStoreRequisitions.filter(sr => sr.stage === stage)
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
 * Get all generated document references for a store requisition
 * Returns ST, SI, and PR document references
 */
export function getGeneratedDocumentReferences(srId: string): GeneratedDocumentReference[] {
  const sr = getStoreRequisitionById(srId)
  return sr?.generatedDocuments || []
}

// Initialize sequence counters with existing document numbers
// Note: PR sequence numbers are managed separately in purchase-requests.ts
// ST/SI reference numbers are no longer separate - they use SR reference numbers
initializeSequenceCounters([
  ...mockStoreRequisitions.map(sr => sr.refNo),
  // Include PRs referenced in generated documents
  'PR-2412-015',
  'PR-2412-016'
])
