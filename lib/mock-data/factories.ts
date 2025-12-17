/**
 * Mock Data Factories
 * Factory functions for creating mock entities with consistent data structure
 */

import {
  User,
  Vendor,
  Product,
  Recipe,
  PurchaseRequest,
  POSTransaction,
  PRStatus
} from '@/lib/types'
import type {
  PendingTransaction,
  POSMapping,
  TransactionError
} from '@/lib/types/pos-integration'
import { ErrorCategory } from '@/lib/types/pos-integration'
import type {
  UserPreferences,
  CompanySettings,
  SecuritySettings,
  ApplicationSettings
} from '@/lib/types/settings'
import {
  mockUserPreferences,
  mockCompanySettings,
  mockSecuritySettings,
  mockApplicationSettings
} from './settings'

/**
 * Create a mock vendor with optional overrides
 */
export function createMockVendor(overrides: Partial<Vendor> = {}): Vendor {
  return {
    id: `vendor-${Date.now()}`,
    vendorCode: `VEN-${Date.now()}`,
    companyName: 'Test Vendor Company',
    businessRegistrationNumber: 'BRN000000',
    taxId: 'TAX000000',
    establishmentDate: new Date().toISOString(),
    businessType: 'distributor',
    status: 'active',
    rating: 4,
    isActive: true,
    addresses: [],
    contacts: [],
    certifications: [],
    bankAccounts: [],
    preferredCurrency: 'USD',
    preferredPaymentTerms: 'Net 30',
    creditLimit: {
      amount: 100000,
      currency: 'USD'
    },
    ...overrides
  }
}

/**
 * Create a mock user with optional overrides
 */
export function createMockUser(overrides: Partial<User> = {}): User {
  const mockRole = {
    id: 'role-staff',
    name: 'Staff',
    permissions: ['read'],
    hierarchy: 1
  }
  const mockDepartment = {
    id: 'dept-general',
    name: 'General',
    code: 'GEN',
    status: 'active' as const
  }
  const mockLocation = {
    id: 'loc-main',
    name: 'Main Location',
    type: 'office' as const
  }

  return {
    id: `user-${Date.now()}`,
    name: 'Test User',
    email: 'test@example.com',
    role: 'role-staff',
    department: 'dept-general',
    location: 'loc-main',
    availableRoles: [mockRole],
    availableDepartments: [mockDepartment],
    availableLocations: [mockLocation],
    roles: [mockRole],
    primaryRole: mockRole,
    departments: [mockDepartment],
    locations: [mockLocation],
    accountStatus: 'active',
    context: {
      currentRole: mockRole,
      currentDepartment: mockDepartment,
      currentLocation: mockLocation
    },
    ...overrides
  }
}

/**
 * Create a mock product with optional overrides
 */
export function createMockProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: `product-${Date.now()}`,
    productCode: `SKU-${Date.now()}`,
    productName: 'Test Product',
    description: 'Test product description',
    productType: 'raw_material',
    status: 'active',
    categoryId: 'cat-general',
    specifications: [],
    baseUnit: 'piece',
    alternativeUnits: [],
    isInventoried: true,
    isSerialTrackingRequired: false,
    isBatchTrackingRequired: false,
    isPurchasable: true,
    isSellable: true,
    regulatoryApprovals: [],
    images: [],
    documents: [],
    relatedProducts: [],
    substitutes: [],
    accessories: [],
    keywords: [],
    tags: [],
    minimumOrderQuantity: 1,
    maximumOrderQuantity: 1000,
    isActive: true,
    ...overrides
  }
}

/**
 * Create a mock recipe with optional overrides
 */
export function createMockRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    id: `recipe-${Date.now()}`,
    recipeCode: `RCP-${Date.now()}`,
    name: 'Test Recipe',
    version: '1.0',
    description: 'Test recipe description',
    categoryId: 'cat-main',
    cuisineTypeId: 'cuisine-international',
    status: 'draft',
    complexity: 'simple',
    yield: 1,
    yieldUnit: 'serving',
    basePortionSize: 1,
    yieldVariants: [],
    developedBy: 'system',
    image: '',
    ingredients: [],
    preparationSteps: [],
    prepTime: 15,
    cookTime: 15,
    totalTime: 30,
    totalCost: {
      amount: 5.00,
      currency: 'USD'
    },
    costPerPortion: {
      amount: 5.00,
      currency: 'USD'
    },
    foodCostPercentage: 30,
    requiredEquipment: [],
    skillLevel: 'beginner',
    keywords: [],
    tags: [],
    allergens: [],
    dietaryRestrictions: [],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isHalal: false,
    isKosher: false,
    isMenuActive: true,
    isActive: true,
    ...overrides
  }
}

/**
 * Create a mock purchase request with optional overrides
 */
export function createMockPurchaseRequest(overrides: Partial<PurchaseRequest> = {}): PurchaseRequest {
  const defaults = {
    id: `PR-${Date.now()}`,
    requestDate: new Date(),
    requiredDate: new Date(),
    requestType: 'General' as const,
    priority: 'normal' as const,
    status: PRStatus.Draft,
    departmentId: 'dept-general',
    locationId: 'loc-main',
    requestedBy: 'test-user',
    totalItems: 0,
    currency: 'THB',
    estimatedTotal: {
      amount: 100.00,
      currency: 'THB'
    },
    workflowStages: [],
    items: [],
  }
  return {
    ...defaults,
    ...overrides,
    // Ensure currency is never undefined
    currency: overrides.currency ?? defaults.currency,
  }
}

/**
 * Create a mock POS transaction with optional overrides
 */
export function createMockPOSTransaction(overrides: Partial<POSTransaction> = {}): POSTransaction {
  const timestamp = new Date()
  return {
    id: `txn-${Date.now()}`,
    transactionId: `TXN-${Date.now()}`,
    externalId: `POS-${Date.now()}`,
    date: timestamp.toISOString(),
    status: 'success',
    locationId: 'loc-001',
    location: {
      id: 'loc-001',
      name: 'Test Location'
    },
    posSystem: {
      name: 'Comanche POS',
      version: '2.5.1'
    },
    totalAmount: {
      amount: 100.00,
      currency: 'USD'
    },
    itemCount: 1,
    createdAt: timestamp,
    createdBy: 'pos-system',
    updatedAt: timestamp,
    updatedBy: 'pos-system',
    ...overrides
  }
}

/**
 * Create a mock pending transaction with optional overrides
 */
export function createMockPendingTransaction(overrides: Partial<PendingTransaction> = {}): PendingTransaction {
  const timestamp = new Date()
  return {
    id: `txn-pending-${Date.now()}`,
    transactionId: `TXN-${Date.now()}`,
    externalId: `POS-${Date.now()}`,
    date: timestamp.toISOString(),
    status: 'pending_approval' as const,
    locationId: 'loc-001',
    location: {
      id: 'loc-001',
      name: 'Test Location'
    },
    posSystem: {
      name: 'Comanche POS',
      version: '2.5.1'
    },
    totalAmount: {
      amount: 100.00,
      currency: 'USD'
    },
    itemCount: 1,
    requester: {
      id: 'user-001',
      name: 'Test User',
      email: 'test@example.com'
    },
    inventoryImpact: 'medium',
    lineItems: [],
    createdAt: timestamp,
    createdBy: 'pos-system',
    updatedAt: timestamp,
    updatedBy: 'pos-system',
    ...overrides
  }
}

/**
 * Create a mock POS mapping with optional overrides
 */
export function createMockPOSMapping(overrides: Partial<POSMapping> = {}): POSMapping {
  const timestamp = new Date()
  return {
    id: `mapping-${Date.now()}`,
    posItemId: `pos-item-${Date.now()}`,
    posItemName: 'Test POS Item',
    posItemCategory: 'General',
    posOutletId: 'outlet-001',
    posOutletName: 'Test POS Outlet',
    locationId: 'loc-001',
    locationName: 'Test Location',
    recipeId: `recipe-${Date.now()}`,
    recipeName: 'Test Recipe',
    recipeCategory: 'General',
    portionSize: 1,
    unit: 'serving',
    unitPrice: { amount: 10.00, currency: 'USD' },
    isActive: true,
    mappedBy: {
      id: 'user-001',
      name: 'Test User'
    },
    mappedAt: timestamp.toISOString(),
    createdAt: timestamp,
    createdBy: 'user-001',
    updatedAt: timestamp,
    updatedBy: 'user-001',
    ...overrides
  }
}

/**
 * Create a mock transaction error with optional overrides
 */
export function createMockTransactionError(overrides: Partial<TransactionError> = {}): TransactionError {
  return {
    category: ErrorCategory.VALIDATION_ERROR,
    code: 'ERR_VALIDATION',
    message: 'Test validation error',
    severity: 'medium',
    occurredAt: new Date().toISOString(),
    ...overrides
  }
}

/**
 * Create multiple mock entities of a given type
 */
export function createMockEntities<T>(factory: () => T, count: number): T[] {
  return Array.from({ length: count }, () => factory())
}

/**
 * Create a mock UserPreferences with optional overrides
 */
export function createMockUserPreferences(overrides: Partial<UserPreferences> = {}): UserPreferences {
  return {
    ...mockUserPreferences,
    id: `pref-${Date.now()}`,
    userId: overrides.userId || `user-${Date.now()}`,
    updatedAt: new Date(),
    createdAt: new Date(),
    ...overrides
  }
}

/**
 * Create a mock CompanySettings with optional overrides
 */
export function createMockCompanySettings(overrides: Partial<CompanySettings> = {}): CompanySettings {
  return {
    ...mockCompanySettings,
    id: `company-${Date.now()}`,
    updatedAt: new Date(),
    updatedBy: 'system',
    createdAt: new Date(),
    ...overrides
  }
}

/**
 * Create a mock SecuritySettings with optional overrides
 */
export function createMockSecuritySettings(overrides: Partial<SecuritySettings> = {}): SecuritySettings {
  return {
    ...mockSecuritySettings,
    id: `security-${Date.now()}`,
    updatedAt: new Date(),
    updatedBy: 'system',
    createdAt: new Date(),
    ...overrides
  }
}

/**
 * Create a mock ApplicationSettings with optional overrides
 */
export function createMockApplicationSettings(overrides: Partial<ApplicationSettings> = {}): ApplicationSettings {
  return {
    ...mockApplicationSettings,
    id: `app-${Date.now()}`,
    updatedAt: new Date(),
    updatedBy: 'system',
    createdAt: new Date(),
    ...overrides
  }
}

/**
 * Create mock entities with sequential IDs
 */
export function createMockEntitiesWithSequentialIds<T extends { id: string }>(
  factory: (id: string) => T,
  prefix: string,
  count: number
): T[] {
  return Array.from({ length: count }, (_, index) =>
    factory(`${prefix}-${String(index + 1).padStart(3, '0')}`)
  )
}