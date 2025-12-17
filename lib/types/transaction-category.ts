/**
 * Transaction Category Types
 *
 * Types and interfaces for Transaction Categories used in Inventory Adjustments.
 * This provides a two-level classification system:
 * - Category (parent): Maps to GL accounts for financial reporting
 * - Reason (child): Specific reasons within each category
 *
 * ============================================================================
 * CATEGORY/REASON CLASSIFICATION SYSTEM
 * ============================================================================
 *
 * Purpose:
 * - Categories determine the GL account for journal entries
 * - Reasons provide detailed classification for reporting and analysis
 *
 * Structure:
 * - Categories are type-specific (Stock IN or Stock OUT)
 * - Each category has multiple reasons
 * - Categories and reasons can be active/inactive
 *
 * Usage:
 * - Header Level: User selects ONE category per adjustment
 * - Item Level: User selects reason for each item (filtered by category)
 *
 * ============================================================================
 */

// ====== ADJUSTMENT TYPE ======

/**
 * Adjustment type - determines direction of stock movement
 */
export type AdjustmentType = 'IN' | 'OUT'

// ====== TRANSACTION CATEGORY ======

/**
 * Transaction Category for inventory adjustments
 *
 * Categories are selected at the adjustment header level and determine
 * the GL accounts used for journal entries when the adjustment is posted.
 */
export interface TransactionCategory {
  /** Unique identifier (UUID) */
  id: string

  /** Short code for the category (e.g., "WST" for Wastage) */
  code: string

  /** Display name (e.g., "Wastage") */
  name: string

  /** Adjustment type this category applies to */
  type: AdjustmentType

  /** GL Account code for debit/credit entries (e.g., "5200") */
  glAccountCode: string

  /** GL Account name for display (e.g., "Waste Expense") */
  glAccountName: string

  /** Optional description of when to use this category */
  description?: string

  /** Display order in dropdowns (lower numbers appear first) */
  sortOrder: number

  /** Whether this category is active and available for selection */
  isActive: boolean

  /** ISO timestamp when created */
  createdAt: string

  /** ISO timestamp when last updated */
  updatedAt: string
}

/**
 * Transaction Reason - child of Transaction Category
 *
 * Reasons are selected at the item level within an adjustment.
 * They provide detailed classification within a category.
 */
export interface TransactionReason {
  /** Unique identifier (UUID) */
  id: string

  /** Parent category ID (foreign key) */
  categoryId: string

  /** Short code for the reason (e.g., "DMG" for Damaged Goods) */
  code: string

  /** Display name (e.g., "Damaged Goods") */
  name: string

  /** Optional description of when to use this reason */
  description?: string

  /** Display order in dropdowns (lower numbers appear first) */
  sortOrder: number

  /** Whether this reason is active and available for selection */
  isActive: boolean

  /** ISO timestamp when created */
  createdAt: string

  /** ISO timestamp when last updated */
  updatedAt: string
}

/**
 * Transaction Category with nested Reasons
 *
 * Combined view used for form dropdowns where we need
 * the category with all its associated reasons.
 */
export interface TransactionCategoryWithReasons extends TransactionCategory {
  /** Array of reasons belonging to this category */
  reasons: TransactionReason[]
}

// ====== FORM/API TYPES ======

/**
 * Create Transaction Category request payload
 */
export interface CreateTransactionCategoryRequest {
  code: string
  name: string
  type: AdjustmentType
  glAccountCode: string
  glAccountName: string
  description?: string
  sortOrder?: number
  isActive?: boolean
}

/**
 * Update Transaction Category request payload
 */
export interface UpdateTransactionCategoryRequest {
  code?: string
  name?: string
  glAccountCode?: string
  glAccountName?: string
  description?: string
  sortOrder?: number
  isActive?: boolean
}

/**
 * Create Transaction Reason request payload
 */
export interface CreateTransactionReasonRequest {
  categoryId: string
  code: string
  name: string
  description?: string
  sortOrder?: number
  isActive?: boolean
}

/**
 * Update Transaction Reason request payload
 */
export interface UpdateTransactionReasonRequest {
  code?: string
  name?: string
  description?: string
  sortOrder?: number
  isActive?: boolean
}

// ====== FILTER/QUERY TYPES ======

/**
 * Filters for querying transaction categories
 */
export interface TransactionCategoryFilters {
  /** Filter by adjustment type */
  type?: AdjustmentType

  /** Filter by active status */
  isActive?: boolean

  /** Search by name or code */
  search?: string
}

/**
 * Sort options for transaction categories
 */
export interface TransactionCategorySortConfig {
  field: 'code' | 'name' | 'type' | 'glAccountCode' | 'sortOrder' | 'createdAt'
  order: 'asc' | 'desc'
}

// ====== DISPLAY HELPERS ======

/**
 * Simplified category option for dropdown selection
 * Used in adjustment form for category selection
 */
export interface CategoryOption {
  value: string  // category code
  label: string  // category name
}

/**
 * Simplified reason option for dropdown selection
 * Used in adjustment form for item-level reason selection
 */
export interface ReasonOption {
  value: string  // reason code
  label: string  // reason name
}

/**
 * Category with reason options for form dropdowns
 * Optimized structure for the two-level selection in adjustment form
 */
export interface CategoryWithReasonOptions {
  value: string         // category code
  label: string         // category name
  reasons: ReasonOption[]
}
