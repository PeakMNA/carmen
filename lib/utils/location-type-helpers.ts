/**
 * Location Type Helper Utilities
 *
 * Provides utility functions for location-aware business logic across Store Operations modules.
 * Location types determine inventory tracking, costing methods, and financial treatment.
 *
 * LOCATION TYPES:
 * - INVENTORY: Full tracking with FIFO costing, requires stock-in, tracks batch numbers
 *   Use case: Main Warehouse, Central Kitchen, Corporate Office
 *
 * - DIRECT: No inventory tracking, immediate expense on receipt, no stock-in required
 *   Use case: Restaurant Bar Direct, Maintenance Direct, Production areas
 *
 * - CONSIGNMENT: Vendor-owned inventory with FIFO tracking, vendor liability until consumption
 *   Use case: Beverage Consignment, Linen Consignment
 *
 * @module lib/utils/location-type-helpers
 */

import {
  InventoryLocationType,
  LOCATION_TYPE_DEFAULTS,
  LOCATION_TYPE_LABELS,
  LOCATION_TYPE_DESCRIPTIONS,
  type InventoryLocationConfig
} from '@/lib/types/location-management'

// ====== CONFIGURATION ACCESS ======

/**
 * Get the configuration for a specific location type
 * @param locationType - The location type (INVENTORY, DIRECT, CONSIGNMENT)
 * @returns InventoryLocationConfig with all behavioral settings
 */
export function getLocationTypeConfig(locationType: InventoryLocationType): InventoryLocationConfig {
  return LOCATION_TYPE_DEFAULTS[locationType]
}

// ====== STOCK-IN BEHAVIOR ======

/**
 * Check if a location type requires stock-in processing
 *
 * Business Rule:
 * - INVENTORY: YES - Items must be formally received and tracked
 * - DIRECT: NO - Items are expensed immediately on receipt, no tracking needed
 * - CONSIGNMENT: YES - Vendor-owned items must be tracked for liability
 *
 * @param locationType - The location type to check
 * @returns true if stock-in processing is required
 */
export function requiresStockIn(locationType: InventoryLocationType): boolean {
  return LOCATION_TYPE_DEFAULTS[locationType].requiresStockIn
}

/**
 * Check if a location type allows physical count operations
 *
 * Business Rule:
 * - INVENTORY: YES - Physical counts required for balance verification
 * - DIRECT: NO - No balance to count (items already expensed)
 * - CONSIGNMENT: YES - Physical counts for vendor reconciliation
 *
 * @param locationType - The location type to check
 * @returns true if physical counts are allowed
 */
export function allowsPhysicalCount(locationType: InventoryLocationType): boolean {
  return LOCATION_TYPE_DEFAULTS[locationType].allowsPhysicalCount
}

/**
 * Check if a location type tracks batch/lot numbers
 *
 * Business Rule:
 * - INVENTORY: YES - Batch tracking for FIFO costing and traceability
 * - DIRECT: NO - No tracking (immediate expense)
 * - CONSIGNMENT: YES - Batch tracking for vendor accountability
 *
 * @param locationType - The location type to check
 * @returns true if batch numbers are tracked
 */
export function tracksBatchNumbers(locationType: InventoryLocationType): boolean {
  return LOCATION_TYPE_DEFAULTS[locationType].tracksBatchNumbers
}

/**
 * Check if items should be expensed immediately on receipt
 *
 * Business Rule:
 * - INVENTORY: NO - Items are assets until consumed/issued
 * - DIRECT: YES - Immediate expense, no inventory asset created
 * - CONSIGNMENT: NO - Items are vendor liability until consumed
 *
 * @param locationType - The location type to check
 * @returns true if items are expensed on receipt
 */
export function expenseOnReceipt(locationType: InventoryLocationType): boolean {
  return LOCATION_TYPE_DEFAULTS[locationType].expenseOnReceipt
}

/**
 * Get the costing method for a location type
 *
 * Business Rule:
 * - INVENTORY: FIFO or Periodic Average (configurable)
 * - DIRECT: None - no costing, direct expense
 * - CONSIGNMENT: FIFO - for vendor accountability
 *
 * @param locationType - The location type to check
 * @returns 'FIFO', 'PERIODIC_AVERAGE', or undefined for DIRECT
 */
export function getCostingMethod(locationType: InventoryLocationType): 'FIFO' | 'PERIODIC_AVERAGE' | undefined {
  return LOCATION_TYPE_DEFAULTS[locationType].costingMethod
}

// ====== STOCK MOVEMENT LOGIC ======

/**
 * Check if stock movement should be recorded for this location type
 *
 * Used by: Store Requisitions Issue, Stock Transfers, GRN processing
 *
 * Business Rule:
 * - INVENTORY: YES - Create inventory transaction, update balance
 * - DIRECT: NO - No stock balance to update (already expensed)
 * - CONSIGNMENT: YES - Update vendor-owned stock balance
 *
 * @param locationType - The location type to check
 * @returns true if stock movement should be recorded
 */
export function shouldRecordStockMovement(locationType: InventoryLocationType): boolean {
  // DIRECT locations don't track inventory, so no stock movement needed
  return locationType !== InventoryLocationType.DIRECT
}

/**
 * Check if inventory adjustment should be created for wastage/variance
 *
 * Used by: Wastage Reporting, Physical Count variance processing
 *
 * Business Rule:
 * - INVENTORY: YES - Create adjustment transaction, update GL
 * - DIRECT: NO - Record for metrics only (no balance to adjust)
 * - CONSIGNMENT: YES - Create adjustment + vendor charge-back
 *
 * @param locationType - The location type to check
 * @returns true if inventory adjustment should be created
 */
export function shouldCreateInventoryAdjustment(locationType: InventoryLocationType): boolean {
  return locationType !== InventoryLocationType.DIRECT
}

// ====== VENDOR NOTIFICATION ======

/**
 * Check if vendor notification is required for an operation
 *
 * Used by: Store Requisitions Issue, Wastage Reporting, Stock Adjustments
 *
 * Business Rule:
 * - INVENTORY: NO - Company-owned inventory
 * - DIRECT: NO - Company-owned, immediate expense
 * - CONSIGNMENT: YES - Vendor owns inventory, notify on consumption/wastage
 *
 * @param locationType - The location type to check
 * @returns true if vendor notification is required
 */
export function requiresVendorNotification(locationType: InventoryLocationType): boolean {
  return locationType === InventoryLocationType.CONSIGNMENT
}

/**
 * Check if vendor charge-back should be created for wastage
 *
 * Used by: Wastage Reporting for consignment locations
 *
 * Business Rule:
 * - Only CONSIGNMENT locations create vendor charge-backs for wastage
 * - The vendor is charged for wasted consignment items
 *
 * @param locationType - The location type to check
 * @returns true if vendor charge-back should be created
 */
export function shouldCreateVendorChargeBack(locationType: InventoryLocationType): boolean {
  return locationType === InventoryLocationType.CONSIGNMENT
}

// ====== TRANSFER VALIDATION ======

/**
 * Validate if a transfer operation is allowed between location types
 *
 * Used by: Stock Replenishment, Stock Transfers
 *
 * Business Rules:
 * - Cannot transfer FROM a DIRECT location (no inventory to transfer)
 * - Cannot transfer TO a DIRECT location via replenishment (no PAR levels)
 * - CONSIGNMENT to non-CONSIGNMENT requires vendor notification
 *
 * @param sourceLocationType - The source location type
 * @param destinationLocationType - The destination location type
 * @returns Object with allowed status and optional reason/warning
 */
export function canTransferBetween(
  sourceLocationType: InventoryLocationType,
  destinationLocationType: InventoryLocationType
): { allowed: boolean; reason?: string; warning?: string } {
  // Cannot transfer FROM a DIRECT location (no inventory to transfer)
  if (sourceLocationType === InventoryLocationType.DIRECT) {
    return {
      allowed: false,
      reason: 'Cannot transfer from Direct Expense locations - no inventory balance exists'
    }
  }

  // Cannot transfer TO a DIRECT location via replenishment (no PAR levels, no tracking)
  // Note: This is allowed for manual issue, but not for auto-replenishment
  if (destinationLocationType === InventoryLocationType.DIRECT) {
    return {
      allowed: false,
      reason: 'Cannot transfer to Direct Expense locations - items are expensed immediately on receipt'
    }
  }

  // CONSIGNMENT to non-CONSIGNMENT requires vendor notification
  if (sourceLocationType === InventoryLocationType.CONSIGNMENT &&
      destinationLocationType !== InventoryLocationType.CONSIGNMENT) {
    return {
      allowed: true,
      warning: 'Vendor notification required - consignment inventory being transferred to owned location'
    }
  }

  return { allowed: true }
}

/**
 * Check if a location type can be a destination for stock replenishment
 *
 * Used by: Stock Replenishment destination location filter
 *
 * Business Rule:
 * - INVENTORY: YES - Can have PAR levels and receive replenishment
 * - DIRECT: NO - No PAR levels, no stock tracking
 * - CONSIGNMENT: YES - Can have PAR levels (replenishment from vendor)
 *
 * @param locationType - The location type to check
 * @returns true if location can receive replenishment
 */
export function canReceiveTransfer(locationType: InventoryLocationType): boolean {
  return locationType !== InventoryLocationType.DIRECT
}

/**
 * Check if a location type can be a source for stock transfers
 *
 * Used by: Stock Replenishment, Stock Transfer source location filter
 *
 * Business Rule:
 * - INVENTORY: YES - Has inventory balance to transfer
 * - DIRECT: NO - No inventory balance exists
 * - CONSIGNMENT: YES - Has balance (with vendor notification)
 *
 * @param locationType - The location type to check
 * @returns true if location can be a transfer source
 */
export function canBeTransferSource(locationType: InventoryLocationType): boolean {
  return locationType !== InventoryLocationType.DIRECT
}

// ====== GRN (GOODS RECEIVED NOTES) ======

/**
 * Determine how GRN should be processed based on location type
 *
 * Used by: GRN processing, Stock-In module
 *
 * Returns processing instructions for GRN based on location type:
 * - INVENTORY: Create cost layer, update stock balance, GL: Inventory Asset
 * - DIRECT: Immediate expense, no stock balance, GL: Expense Account
 * - CONSIGNMENT: Create cost layer, vendor liability, GL: Consignment Liability
 *
 * @param locationType - The destination location type
 * @returns GRN processing instructions
 */
export function getGRNProcessingBehavior(locationType: InventoryLocationType): {
  createCostLayer: boolean
  updateStockBalance: boolean
  glAccountType: 'inventory_asset' | 'expense' | 'consignment_liability'
  description: string
} {
  switch (locationType) {
    case InventoryLocationType.INVENTORY:
      return {
        createCostLayer: true,
        updateStockBalance: true,
        glAccountType: 'inventory_asset',
        description: 'Standard GRN - Create FIFO cost layer, update inventory asset'
      }
    case InventoryLocationType.DIRECT:
      return {
        createCostLayer: false,
        updateStockBalance: false,
        glAccountType: 'expense',
        description: 'Direct Expense - No stock-in, immediate expense to department'
      }
    case InventoryLocationType.CONSIGNMENT:
      return {
        createCostLayer: true,
        updateStockBalance: true,
        glAccountType: 'consignment_liability',
        description: 'Consignment Receipt - Vendor-owned, create vendor liability'
      }
  }
}

// ====== CREDIT NOTE ======

/**
 * Determine how Credit Note should be processed based on location type
 *
 * Used by: Credit Note processing
 *
 * Returns processing instructions for Credit Note based on location type:
 * - INVENTORY: Reverse cost layer, update stock balance
 * - DIRECT: Reverse expense only (no inventory to adjust)
 * - CONSIGNMENT: Update vendor liability, reduce consignment balance
 *
 * @param locationType - The location type
 * @returns Credit Note processing instructions
 */
export function getCreditNoteProcessingBehavior(locationType: InventoryLocationType): {
  reverseCostLayer: boolean
  updateStockBalance: boolean
  glAccountType: 'inventory_asset' | 'expense' | 'consignment_liability'
  description: string
} {
  switch (locationType) {
    case InventoryLocationType.INVENTORY:
      return {
        reverseCostLayer: true,
        updateStockBalance: true,
        glAccountType: 'inventory_asset',
        description: 'Reverse stock and cost layer using FIFO'
      }
    case InventoryLocationType.DIRECT:
      return {
        reverseCostLayer: false,
        updateStockBalance: false,
        glAccountType: 'expense',
        description: 'Reverse expense only - no inventory to adjust'
      }
    case InventoryLocationType.CONSIGNMENT:
      return {
        reverseCostLayer: true,
        updateStockBalance: true,
        glAccountType: 'consignment_liability',
        description: 'Update vendor liability account, reduce consignment balance'
      }
  }
}

// ====== DISPLAY HELPERS ======

/**
 * Get display label for location type
 * @param locationType - The location type
 * @returns Human-readable label
 */
export function getLocationTypeLabel(locationType: InventoryLocationType): string {
  return LOCATION_TYPE_LABELS[locationType]
}

/**
 * Get description for location type behavior
 * @param locationType - The location type
 * @returns Descriptive text explaining the location type
 */
export function getLocationTypeDescription(locationType: InventoryLocationType): string {
  return LOCATION_TYPE_DESCRIPTIONS[locationType]
}

/**
 * Get detailed behavior summary for a location type
 * Used for UI tooltips and help text
 *
 * @param locationType - The location type
 * @returns Detailed behavior summary
 */
export function getLocationTypeBehaviorSummary(locationType: InventoryLocationType): string {
  switch (locationType) {
    case InventoryLocationType.INVENTORY:
      return 'Full inventory tracking with FIFO costing. Items are tracked as assets until issued. ' +
             'Supports physical counts, batch tracking, and end-of-period processing.'
    case InventoryLocationType.DIRECT:
      return 'No inventory tracking. Items are expensed immediately upon receipt. ' +
             'Used for production areas like bars and kitchens where items are consumed directly.'
    case InventoryLocationType.CONSIGNMENT:
      return 'Vendor-owned inventory until consumed. Items are tracked with FIFO costing. ' +
             'Vendor is charged upon consumption or wastage. Supports physical counts for vendor reconciliation.'
  }
}

/**
 * Get appropriate icon name for location type
 * @param locationType - The location type
 * @returns Lucide icon name
 */
export function getLocationTypeIcon(locationType: InventoryLocationType): string {
  switch (locationType) {
    case InventoryLocationType.INVENTORY:
      return 'Package'
    case InventoryLocationType.DIRECT:
      return 'DollarSign'
    case InventoryLocationType.CONSIGNMENT:
      return 'Truck'
  }
}

/**
 * Get badge variant for location type
 * @param locationType - The location type
 * @returns Badge variant for consistent UI styling
 */
export function getLocationTypeBadgeVariant(locationType: InventoryLocationType): 'default' | 'secondary' | 'outline' {
  switch (locationType) {
    case InventoryLocationType.INVENTORY:
      return 'default'
    case InventoryLocationType.DIRECT:
      return 'secondary'
    case InventoryLocationType.CONSIGNMENT:
      return 'outline'
  }
}

// ====== ISSUE PROCESS ======

/**
 * Get issue process behavior based on location type
 *
 * Used by: Store Requisitions Issue process
 *
 * @param locationType - The destination location type for issued items
 * @returns Issue process instructions
 */
export function getIssueProcessBehavior(locationType: InventoryLocationType): {
  createStockMovement: boolean
  usesFIFOCosting: boolean
  requiresVendorNotification: boolean
  glDebitAccount: 'department_expense' | 'operational_expense'
  glCreditAccount: 'inventory_asset' | 'already_expensed' | 'consignment_liability'
  description: string
} {
  switch (locationType) {
    case InventoryLocationType.INVENTORY:
      return {
        createStockMovement: true,
        usesFIFOCosting: true,
        requiresVendorNotification: false,
        glDebitAccount: 'department_expense',
        glCreditAccount: 'inventory_asset',
        description: 'Standard issue - Create inventory transaction, apply FIFO costing'
      }
    case InventoryLocationType.DIRECT:
      return {
        createStockMovement: false,
        usesFIFOCosting: false,
        requiresVendorNotification: false,
        glDebitAccount: 'operational_expense',
        glCreditAccount: 'already_expensed',
        description: 'Direct issue - No stock movement (items already expensed on receipt)'
      }
    case InventoryLocationType.CONSIGNMENT:
      return {
        createStockMovement: true,
        usesFIFOCosting: true,
        requiresVendorNotification: true,
        glDebitAccount: 'department_expense',
        glCreditAccount: 'consignment_liability',
        description: 'Consignment consumption - Update vendor stock, charge vendor liability'
      }
  }
}

// ====== WASTAGE PROCESS ======

/**
 * Get wastage process behavior based on location type
 *
 * Used by: Wastage Reporting module
 *
 * @param locationType - The location type where wastage occurred
 * @returns Wastage process instructions
 */
export function getWastageProcessBehavior(locationType: InventoryLocationType): {
  createInventoryAdjustment: boolean
  createVendorChargeBack: boolean
  recordMetricsOnly: boolean
  glAccountType: 'wastage_expense' | 'vendor_chargeback' | 'none'
  description: string
} {
  switch (locationType) {
    case InventoryLocationType.INVENTORY:
      return {
        createInventoryAdjustment: true,
        createVendorChargeBack: false,
        recordMetricsOnly: false,
        glAccountType: 'wastage_expense',
        description: 'Standard wastage - Create inventory adjustment, post to wastage expense'
      }
    case InventoryLocationType.DIRECT:
      return {
        createInventoryAdjustment: false,
        createVendorChargeBack: false,
        recordMetricsOnly: true,
        glAccountType: 'none',
        description: 'Metrics only - No inventory to adjust (items already expensed)'
      }
    case InventoryLocationType.CONSIGNMENT:
      return {
        createInventoryAdjustment: true,
        createVendorChargeBack: true,
        recordMetricsOnly: false,
        glAccountType: 'vendor_chargeback',
        description: 'Consignment wastage - Create adjustment, charge back to vendor'
      }
  }
}
