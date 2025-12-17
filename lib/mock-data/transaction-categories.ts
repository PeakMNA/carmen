/**
 * Transaction Categories Mock Data
 *
 * Mock data for Transaction Categories and Reasons used in Inventory Adjustments.
 * This data provides the two-level Category → Reason classification system.
 *
 * ============================================================================
 * CATEGORY/REASON STRUCTURE
 * ============================================================================
 *
 * Stock OUT Categories (decrease inventory):
 * - Wastage: Damaged Goods, Expired Items, Spoilage
 * - Loss: Theft/Loss, Shrinkage, Count Variance
 * - Quality: QC Rejection, Customer Return
 * - Consumption: Production Use, Transfer Out
 *
 * Stock IN Categories (increase inventory):
 * - Found: Count Variance, Found Items
 * - Return: Return to Stock, Vendor Return
 * - Correction: System Correction, Data Fix
 *
 * TODO: Replace with API calls:
 * - GET /api/transaction-categories
 * - GET /api/transaction-categories/:id
 * - POST /api/transaction-categories
 * - PUT /api/transaction-categories/:id
 * - DELETE /api/transaction-categories/:id
 * - POST /api/transaction-categories/:id/reasons
 * - PUT /api/transaction-reasons/:id
 * - DELETE /api/transaction-reasons/:id
 *
 * ============================================================================
 */

import type {
  TransactionCategory,
  TransactionReason,
  TransactionCategoryWithReasons,
  AdjustmentType,
  CategoryWithReasonOptions
} from '@/lib/types/transaction-category'

// ============================================================================
// MOCK CATEGORIES
// ============================================================================

/**
 * Transaction Categories - parent level of classification
 * Maps to GL accounts for journal entry generation
 */
export const mockTransactionCategories: TransactionCategory[] = [
  // ====== STOCK OUT CATEGORIES ======
  {
    id: 'cat-001',
    code: 'WST',
    name: 'Wastage',
    type: 'OUT',
    glAccountCode: '5200',
    glAccountName: 'Waste Expense',
    description: 'Items lost due to damage, expiration, or spoilage',
    sortOrder: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-002',
    code: 'LSS',
    name: 'Loss',
    type: 'OUT',
    glAccountCode: '5210',
    glAccountName: 'Inventory Loss',
    description: 'Items lost due to theft, shrinkage, or unexplained variances',
    sortOrder: 2,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-003',
    code: 'QLT',
    name: 'Quality',
    type: 'OUT',
    glAccountCode: '5100',
    glAccountName: 'Cost of Goods Sold',
    description: 'Items rejected due to quality issues or customer returns',
    sortOrder: 3,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-004',
    code: 'CON',
    name: 'Consumption',
    type: 'OUT',
    glAccountCode: '5100',
    glAccountName: 'Cost of Goods Sold',
    description: 'Items consumed for production or transferred out',
    sortOrder: 4,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // ====== STOCK IN CATEGORIES ======
  {
    id: 'cat-005',
    code: 'FND',
    name: 'Found',
    type: 'IN',
    glAccountCode: '1310',
    glAccountName: 'Raw Materials Inventory',
    description: 'Items found during counting or inventory verification',
    sortOrder: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-006',
    code: 'RTN',
    name: 'Return',
    type: 'IN',
    glAccountCode: '1310',
    glAccountName: 'Raw Materials Inventory',
    description: 'Items returned to stock from production or vendors',
    sortOrder: 2,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'cat-007',
    code: 'COR',
    name: 'Correction',
    type: 'IN',
    glAccountCode: '1310',
    glAccountName: 'Raw Materials Inventory',
    description: 'System corrections and data fixes',
    sortOrder: 3,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// ============================================================================
// MOCK REASONS
// ============================================================================

/**
 * Transaction Reasons - child level of classification
 * Provides detailed reasons within each category
 */
export const mockTransactionReasons: TransactionReason[] = [
  // ====== WASTAGE REASONS ======
  {
    id: 'rsn-001',
    categoryId: 'cat-001',
    code: 'DMG',
    name: 'Damaged Goods',
    description: 'Items physically damaged during handling or storage',
    sortOrder: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'rsn-002',
    categoryId: 'cat-001',
    code: 'EXP',
    name: 'Expired Items',
    description: 'Items past their expiration or best-before date',
    sortOrder: 2,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'rsn-003',
    categoryId: 'cat-001',
    code: 'SPL',
    name: 'Spoilage',
    description: 'Items spoiled due to environmental conditions',
    sortOrder: 3,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // ====== LOSS REASONS ======
  {
    id: 'rsn-004',
    categoryId: 'cat-002',
    code: 'THF',
    name: 'Theft/Loss',
    description: 'Items lost due to theft or unexplained disappearance',
    sortOrder: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'rsn-005',
    categoryId: 'cat-002',
    code: 'SHR',
    name: 'Shrinkage',
    description: 'Natural shrinkage or evaporation of products',
    sortOrder: 2,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'rsn-006',
    categoryId: 'cat-002',
    code: 'CNV',
    name: 'Count Variance',
    description: 'Variance discovered during physical count (negative)',
    sortOrder: 3,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // ====== QUALITY REASONS ======
  {
    id: 'rsn-007',
    categoryId: 'cat-003',
    code: 'QCR',
    name: 'QC Rejection',
    description: 'Items rejected by quality control inspection',
    sortOrder: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'rsn-008',
    categoryId: 'cat-003',
    code: 'CRT',
    name: 'Customer Return',
    description: 'Items returned by customers due to quality issues',
    sortOrder: 2,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // ====== CONSUMPTION REASONS ======
  {
    id: 'rsn-009',
    categoryId: 'cat-004',
    code: 'PRD',
    name: 'Production Use',
    description: 'Items consumed during production process',
    sortOrder: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'rsn-010',
    categoryId: 'cat-004',
    code: 'TRO',
    name: 'Transfer Out',
    description: 'Items transferred to another location or department',
    sortOrder: 2,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // ====== FOUND REASONS ======
  {
    id: 'rsn-011',
    categoryId: 'cat-005',
    code: 'CNV',
    name: 'Count Variance',
    description: 'Variance discovered during physical count (positive)',
    sortOrder: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'rsn-012',
    categoryId: 'cat-005',
    code: 'FIT',
    name: 'Found Items',
    description: 'Previously missing items that were found',
    sortOrder: 2,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // ====== RETURN REASONS ======
  {
    id: 'rsn-013',
    categoryId: 'cat-006',
    code: 'RTS',
    name: 'Return to Stock',
    description: 'Items returned from production back to inventory',
    sortOrder: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'rsn-014',
    categoryId: 'cat-006',
    code: 'VRT',
    name: 'Vendor Return',
    description: 'Items returned from vendor (rejected or credit)',
    sortOrder: 2,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },

  // ====== CORRECTION REASONS ======
  {
    id: 'rsn-015',
    categoryId: 'cat-007',
    code: 'SYC',
    name: 'System Correction',
    description: 'Correction due to system error or bug',
    sortOrder: 1,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    id: 'rsn-016',
    categoryId: 'cat-007',
    code: 'DFX',
    name: 'Data Fix',
    description: 'Manual data correction for entry errors',
    sortOrder: 2,
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get categories with their nested reasons
 * @param type Optional filter by adjustment type
 * @returns Array of categories with reasons
 */
export function getTransactionCategoriesWithReasons(
  type?: AdjustmentType
): TransactionCategoryWithReasons[] {
  let categories = mockTransactionCategories

  if (type) {
    categories = categories.filter(cat => cat.type === type)
  }

  return categories.map(category => ({
    ...category,
    reasons: mockTransactionReasons.filter(
      reason => reason.categoryId === category.id
    )
  }))
}

/**
 * Get active categories with active reasons for form dropdowns
 * @param type Adjustment type (IN or OUT)
 * @returns Array of category options with reason options
 */
export function getCategoryOptionsForType(
  type: AdjustmentType
): CategoryWithReasonOptions[] {
  return mockTransactionCategories
    .filter(cat => cat.type === type && cat.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map(category => ({
      value: category.code,
      label: category.name,
      reasons: mockTransactionReasons
        .filter(r => r.categoryId === category.id && r.isActive)
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map(reason => ({
          value: reason.code,
          label: reason.name
        }))
    }))
}

/**
 * Get a category by ID
 * @param id Category ID
 * @returns Category or undefined
 */
export function getCategoryById(id: string): TransactionCategory | undefined {
  return mockTransactionCategories.find(cat => cat.id === id)
}

/**
 * Get a category by code
 * @param code Category code
 * @returns Category or undefined
 */
export function getCategoryByCode(code: string): TransactionCategory | undefined {
  return mockTransactionCategories.find(cat => cat.code === code)
}

/**
 * Get reasons for a category by ID
 * @param categoryId Category ID
 * @returns Array of reasons
 */
export function getReasonsByCategoryId(categoryId: string): TransactionReason[] {
  return mockTransactionReasons.filter(r => r.categoryId === categoryId)
}

/**
 * Get active reasons for a category by code
 * @param categoryCode Category code (e.g., 'WST', 'LSS')
 * @returns Array of active reasons sorted by sortOrder
 */
export function getReasonsByCategoryCode(categoryCode: string): TransactionReason[] {
  const category = getCategoryByCode(categoryCode)
  if (!category) return []

  return mockTransactionReasons
    .filter(r => r.categoryId === category.id && r.isActive)
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Get a reason by ID
 * @param id Reason ID
 * @returns Reason or undefined
 */
export function getReasonById(id: string): TransactionReason | undefined {
  return mockTransactionReasons.find(r => r.id === id)
}

/**
 * Get GL account info for a category code
 * @param categoryCode Category code
 * @returns GL account info or undefined
 */
export function getGLAccountForCategory(categoryCode: string): {
  code: string
  name: string
} | undefined {
  const category = getCategoryByCode(categoryCode)
  if (!category) return undefined

  return {
    code: category.glAccountCode,
    name: category.glAccountName
  }
}

// ============================================================================
// FACTORY FUNCTIONS (for testing)
// ============================================================================

/**
 * Create a new mock category with default values
 * @param overrides Partial category to override defaults
 * @returns New category object
 */
export function createMockCategory(
  overrides: Partial<TransactionCategory> = {}
): TransactionCategory {
  const now = new Date().toISOString()
  return {
    id: `cat-${Date.now()}`,
    code: 'NEW',
    name: 'New Category',
    type: 'OUT',
    glAccountCode: '5000',
    glAccountName: 'General Expense',
    description: '',
    sortOrder: 99,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    ...overrides
  }
}

/**
 * Create a new mock reason with default values
 * @param categoryId Parent category ID
 * @param overrides Partial reason to override defaults
 * @returns New reason object
 */
export function createMockReason(
  categoryId: string,
  overrides: Partial<TransactionReason> = {}
): TransactionReason {
  const now = new Date().toISOString()
  return {
    id: `rsn-${Date.now()}`,
    categoryId,
    code: 'NEW',
    name: 'New Reason',
    description: '',
    sortOrder: 99,
    isActive: true,
    createdAt: now,
    updatedAt: now,
    ...overrides
  }
}
