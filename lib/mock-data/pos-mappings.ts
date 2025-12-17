/**
 * POS Integration Mock Data - Mappings
 *
 * Centralized mock data for POS item to recipe mappings including
 * mapped items, unmapped items, mapping configurations, and recipe search results.
 *
 * IMPORTANT: Mapping uses composite key (posItemId + posOutletId)
 * This allows same POS item to have different recipes/prices per outlet.
 *
 * Outlet data comes from mockLocationMappings in pos-integration.ts
 * Only outlets with posOutletId (mapped locations) can have recipe mappings.
 */

import {
  POSMapping,
  POSItem,
  RecipeSearchResult,
  MappingPreview
} from '@/lib/types'

// ====== MOCK POS MAPPINGS ======
// Composite key: posItemId + posOutletId
// Outlet IDs reference mockLocationMappings.posOutletId

export const mockPOSMappings: POSMapping[] = [
  // === COKE - Same item, different prices per outlet ===
  {
    id: 'mapping-coke-main',
    posItemId: 'pos-item-001',
    posItemName: 'Coca-Cola',
    posItemCategory: 'Beverage',
    posOutletId: 'POS-OUT-001',
    posOutletName: 'Main Dining - POS Terminal 1',
    locationId: 'loc-001',
    locationName: 'Main Restaurant',
    recipeId: 'recipe-coke-330ml',
    recipeName: 'Coca-Cola 330ml',
    recipeCategory: 'Beverages',
    portionSize: 1,
    unit: 'can',
    unitPrice: { amount: 3.00, currency: 'USD' },
    isActive: true,
    mappedBy: { id: 'user-001', name: 'John Smith' },
    mappedAt: '2025-10-01T09:00:00Z',
    lastVerifiedAt: '2025-10-15T14:30:00Z',
    createdAt: new Date('2025-10-01T09:00:00Z'),
    createdBy: 'user-001',
    updatedAt: new Date('2025-10-15T14:30:00Z'),
    updatedBy: 'user-001'
  },
  {
    id: 'mapping-coke-poolbar',
    posItemId: 'pos-item-001',
    posItemName: 'Coca-Cola',
    posItemCategory: 'Beverage',
    posOutletId: 'POS-OUT-002',
    posOutletName: 'Pool Bar - Mobile POS',
    locationId: 'loc-002',
    locationName: 'Pool Bar',
    recipeId: 'recipe-coke-330ml',
    recipeName: 'Coca-Cola 330ml',
    recipeCategory: 'Beverages',
    portionSize: 1,
    unit: 'can',
    unitPrice: { amount: 4.00, currency: 'USD' },
    isActive: true,
    mappedBy: { id: 'user-001', name: 'John Smith' },
    mappedAt: '2025-10-01T09:05:00Z',
    lastVerifiedAt: '2025-10-15T14:30:00Z',
    createdAt: new Date('2025-10-01T09:05:00Z'),
    createdBy: 'user-001',
    updatedAt: new Date('2025-10-15T14:30:00Z'),
    updatedBy: 'user-001'
  },
  {
    id: 'mapping-coke-lobby',
    posItemId: 'pos-item-001',
    posItemName: 'Coca-Cola',
    posItemCategory: 'Beverage',
    posOutletId: 'POS-OUT-005',
    posOutletName: 'Lobby Café Terminal',
    locationId: 'loc-005',
    locationName: 'Lobby Café',
    recipeId: 'recipe-coke-330ml',
    recipeName: 'Coca-Cola 330ml',
    recipeCategory: 'Beverages',
    portionSize: 1,
    unit: 'can',
    unitPrice: { amount: 2.50, currency: 'USD' },
    isActive: true,
    mappedBy: { id: 'user-001', name: 'John Smith' },
    mappedAt: '2025-10-01T09:10:00Z',
    createdAt: new Date('2025-10-01T09:10:00Z'),
    createdBy: 'user-001',
    updatedAt: new Date('2025-10-01T09:10:00Z'),
    updatedBy: 'user-001'
  },

  // === MARGHERITA PIZZA - Main Restaurant only ===
  {
    id: 'mapping-001',
    posItemId: 'pos-item-101',
    posItemName: 'Margherita Pizza',
    posItemCategory: 'Main Course',
    posOutletId: 'POS-OUT-001',
    posOutletName: 'Main Dining - POS Terminal 1',
    locationId: 'loc-001',
    locationName: 'Main Restaurant',
    recipeId: 'recipe-001',
    recipeName: 'Margherita Pizza',
    recipeCategory: 'Pizza',
    portionSize: 1,
    unit: 'whole',
    unitPrice: { amount: 15.00, currency: 'USD' },
    isActive: true,
    mappedBy: { id: 'user-001', name: 'John Smith' },
    mappedAt: '2025-10-01T09:00:00Z',
    lastVerifiedAt: '2025-10-15T14:30:00Z',
    createdAt: new Date('2025-10-01T09:00:00Z'),
    createdBy: 'user-001',
    updatedAt: new Date('2025-10-15T14:30:00Z'),
    updatedBy: 'user-001'
  },

  // === HOUSE SALAD - Multiple outlets, different prices ===
  {
    id: 'mapping-002-main',
    posItemId: 'pos-item-102',
    posItemName: 'House Salad',
    posItemCategory: 'Appetizer',
    posOutletId: 'POS-OUT-001',
    posOutletName: 'Main Dining - POS Terminal 1',
    locationId: 'loc-001',
    locationName: 'Main Restaurant',
    recipeId: 'recipe-002',
    recipeName: 'House Salad',
    recipeCategory: 'Salad',
    portionSize: 1,
    unit: 'serving',
    unitPrice: { amount: 8.50, currency: 'USD' },
    isActive: true,
    mappedBy: { id: 'user-001', name: 'John Smith' },
    mappedAt: '2025-10-01T09:15:00Z',
    lastVerifiedAt: '2025-10-15T14:30:00Z',
    createdAt: new Date('2025-10-01T09:15:00Z'),
    createdBy: 'user-001',
    updatedAt: new Date('2025-10-15T14:30:00Z'),
    updatedBy: 'user-001'
  },
  {
    id: 'mapping-002-lobby',
    posItemId: 'pos-item-102',
    posItemName: 'House Salad',
    posItemCategory: 'Appetizer',
    posOutletId: 'POS-OUT-005',
    posOutletName: 'Lobby Café Terminal',
    locationId: 'loc-005',
    locationName: 'Lobby Café',
    recipeId: 'recipe-002',
    recipeName: 'House Salad',
    recipeCategory: 'Salad',
    portionSize: 1,
    unit: 'serving',
    unitPrice: { amount: 7.50, currency: 'USD' },
    isActive: true,
    mappedBy: { id: 'user-001', name: 'John Smith' },
    mappedAt: '2025-10-01T09:20:00Z',
    createdAt: new Date('2025-10-01T09:20:00Z'),
    createdBy: 'user-001',
    updatedAt: new Date('2025-10-01T09:20:00Z'),
    updatedBy: 'user-001'
  },

  // === CAESAR SALAD - Lobby Café only ===
  {
    id: 'mapping-003',
    posItemId: 'pos-item-103',
    posItemName: 'Caesar Salad',
    posItemCategory: 'Appetizer',
    posOutletId: 'POS-OUT-005',
    posOutletName: 'Lobby Café Terminal',
    locationId: 'loc-005',
    locationName: 'Lobby Café',
    recipeId: 'recipe-003',
    recipeName: 'Caesar Salad',
    recipeCategory: 'Salad',
    portionSize: 1,
    unit: 'serving',
    unitPrice: { amount: 9.50, currency: 'USD' },
    isActive: true,
    mappedBy: { id: 'user-002', name: 'Sarah Johnson' },
    mappedAt: '2025-10-01T10:00:00Z',
    lastVerifiedAt: '2025-10-10T11:20:00Z',
    createdAt: new Date('2025-10-01T10:00:00Z'),
    createdBy: 'user-002',
    updatedAt: new Date('2025-10-10T11:20:00Z'),
    updatedBy: 'user-002'
  },

  // === PEPPERONI PIZZA - Main Restaurant & Room Service with different prices ===
  {
    id: 'mapping-004-main',
    posItemId: 'pos-item-104',
    posItemName: 'Pepperoni Pizza',
    posItemCategory: 'Main Course',
    posOutletId: 'POS-OUT-001',
    posOutletName: 'Main Dining - POS Terminal 1',
    locationId: 'loc-001',
    locationName: 'Main Restaurant',
    recipeId: 'recipe-004',
    recipeName: 'Pepperoni Pizza',
    recipeCategory: 'Pizza',
    portionSize: 1,
    unit: 'whole',
    unitPrice: { amount: 17.00, currency: 'USD' },
    isActive: true,
    mappedBy: { id: 'user-001', name: 'John Smith' },
    mappedAt: '2025-10-02T08:30:00Z',
    createdAt: new Date('2025-10-02T08:30:00Z'),
    createdBy: 'user-001',
    updatedAt: new Date('2025-10-02T08:30:00Z'),
    updatedBy: 'user-001'
  },
  {
    id: 'mapping-004-roomservice',
    posItemId: 'pos-item-104',
    posItemName: 'Pepperoni Pizza',
    posItemCategory: 'Main Course',
    posOutletId: 'POS-OUT-003',
    posOutletName: 'Room Service POS',
    locationId: 'loc-004',
    locationName: 'Room Service',
    recipeId: 'recipe-004',
    recipeName: 'Pepperoni Pizza',
    recipeCategory: 'Pizza',
    portionSize: 1,
    unit: 'whole',
    unitPrice: { amount: 22.00, currency: 'USD' }, // Room service premium
    isActive: true,
    mappedBy: { id: 'user-001', name: 'John Smith' },
    mappedAt: '2025-10-02T08:35:00Z',
    createdAt: new Date('2025-10-02T08:35:00Z'),
    createdBy: 'user-001',
    updatedAt: new Date('2025-10-02T08:35:00Z'),
    updatedBy: 'user-001'
  },

  // === GRILLED CHICKEN - Multiple outlets ===
  {
    id: 'mapping-005-italian',
    posItemId: 'pos-item-105',
    posItemName: 'Grilled Chicken Breast',
    posItemCategory: 'Main Course',
    posOutletId: 'POS-OUT-001',
    posOutletName: 'Italian Restaurant POS',
    locationId: 'loc-001',
    locationName: 'Italian Restaurant',
    recipeId: 'recipe-005',
    recipeName: 'Grilled Chicken Breast',
    recipeCategory: 'Poultry',
    portionSize: 200,
    unit: 'g',
    unitPrice: { amount: 18.00, currency: 'USD' },
    isActive: true,
    mappedBy: { id: 'user-002', name: 'Sarah Johnson' },
    mappedAt: '2025-10-02T09:00:00Z',
    createdAt: new Date('2025-10-02T09:00:00Z'),
    createdBy: 'user-002',
    updatedAt: new Date('2025-10-02T09:00:00Z'),
    updatedBy: 'user-002'
  },
  {
    id: 'mapping-005-poolbar',
    posItemId: 'pos-item-105',
    posItemName: 'Grilled Chicken Breast',
    posItemCategory: 'Main Course',
    posOutletId: 'POS-OUT-002',
    posOutletName: 'Pool Bar POS',
    locationId: 'loc-003',
    locationName: 'Pool Bar',
    recipeId: 'recipe-005',
    recipeName: 'Grilled Chicken Breast',
    recipeCategory: 'Poultry',
    portionSize: 200,
    unit: 'g',
    unitPrice: { amount: 20.00, currency: 'USD' },
    isActive: true,
    mappedBy: { id: 'user-002', name: 'Sarah Johnson' },
    mappedAt: '2025-10-02T09:05:00Z',
    createdAt: new Date('2025-10-02T09:05:00Z'),
    createdBy: 'user-002',
    updatedAt: new Date('2025-10-02T09:05:00Z'),
    updatedBy: 'user-002'
  },

  // === FRENCH FRIES - All outlets ===
  {
    id: 'mapping-006-italian',
    posItemId: 'pos-item-106',
    posItemName: 'French Fries',
    posItemCategory: 'Side Dish',
    posOutletId: 'POS-OUT-001',
    posOutletName: 'Italian Restaurant POS',
    locationId: 'loc-001',
    locationName: 'Italian Restaurant',
    recipeId: 'recipe-006',
    recipeName: 'French Fries',
    recipeCategory: 'Sides',
    portionSize: 150,
    unit: 'g',
    unitPrice: { amount: 5.00, currency: 'USD' },
    isActive: true,
    mappedBy: { id: 'user-001', name: 'John Smith' },
    mappedAt: '2025-10-03T10:15:00Z',
    createdAt: new Date('2025-10-03T10:15:00Z'),
    createdBy: 'user-001',
    updatedAt: new Date('2025-10-03T10:15:00Z'),
    updatedBy: 'user-001'
  },
  {
    id: 'mapping-006-cafe',
    posItemId: 'pos-item-106',
    posItemName: 'French Fries',
    posItemCategory: 'Side Dish',
    posOutletId: 'POS-OUT-005',
    posOutletName: 'Cafe POS',
    locationId: 'loc-002',
    locationName: 'Cafe',
    recipeId: 'recipe-006',
    recipeName: 'French Fries',
    recipeCategory: 'Sides',
    portionSize: 150,
    unit: 'g',
    unitPrice: { amount: 4.50, currency: 'USD' },
    isActive: true,
    mappedBy: { id: 'user-001', name: 'John Smith' },
    mappedAt: '2025-10-03T10:20:00Z',
    createdAt: new Date('2025-10-03T10:20:00Z'),
    createdBy: 'user-001',
    updatedAt: new Date('2025-10-03T10:20:00Z'),
    updatedBy: 'user-001'
  },
  {
    id: 'mapping-006-poolbar',
    posItemId: 'pos-item-106',
    posItemName: 'French Fries',
    posItemCategory: 'Side Dish',
    posOutletId: 'POS-OUT-002',
    posOutletName: 'Pool Bar POS',
    locationId: 'loc-003',
    locationName: 'Pool Bar',
    recipeId: 'recipe-006',
    recipeName: 'French Fries',
    recipeCategory: 'Sides',
    portionSize: 150,
    unit: 'g',
    unitPrice: { amount: 6.00, currency: 'USD' },
    isActive: true,
    mappedBy: { id: 'user-001', name: 'John Smith' },
    mappedAt: '2025-10-03T10:25:00Z',
    createdAt: new Date('2025-10-03T10:25:00Z'),
    createdBy: 'user-001',
    updatedAt: new Date('2025-10-03T10:25:00Z'),
    updatedBy: 'user-001'
  },

  // === ICED TEA - Multiple outlets with price variance ===
  {
    id: 'mapping-007-cafe',
    posItemId: 'pos-item-107',
    posItemName: 'Iced Tea',
    posItemCategory: 'Beverage',
    posOutletId: 'POS-OUT-005',
    posOutletName: 'Cafe POS',
    locationId: 'loc-002',
    locationName: 'Cafe',
    recipeId: 'recipe-007',
    recipeName: 'Iced Tea',
    recipeCategory: 'Beverages',
    portionSize: 500,
    unit: 'ml',
    unitPrice: { amount: 3.50, currency: 'USD' },
    isActive: true,
    mappedBy: { id: 'user-003', name: 'Mike Chen' },
    mappedAt: '2025-10-03T11:00:00Z',
    createdAt: new Date('2025-10-03T11:00:00Z'),
    createdBy: 'user-003',
    updatedAt: new Date('2025-10-03T11:00:00Z'),
    updatedBy: 'user-003'
  },
  {
    id: 'mapping-007-poolbar',
    posItemId: 'pos-item-107',
    posItemName: 'Iced Tea',
    posItemCategory: 'Beverage',
    posOutletId: 'POS-OUT-002',
    posOutletName: 'Pool Bar POS',
    locationId: 'loc-003',
    locationName: 'Pool Bar',
    recipeId: 'recipe-007',
    recipeName: 'Iced Tea',
    recipeCategory: 'Beverages',
    portionSize: 500,
    unit: 'ml',
    unitPrice: { amount: 5.00, currency: 'USD' },
    isActive: true,
    mappedBy: { id: 'user-003', name: 'Mike Chen' },
    mappedAt: '2025-10-03T11:05:00Z',
    createdAt: new Date('2025-10-03T11:05:00Z'),
    createdBy: 'user-003',
    updatedAt: new Date('2025-10-03T11:05:00Z'),
    updatedBy: 'user-003'
  }
]

// ====== MOCK UNMAPPED POS ITEMS ======
// These items exist in POS but haven't been mapped to any outlet yet

export const mockUnmappedPOSItems: POSItem[] = [
  {
    id: 'pos-unmapped-001',
    posItemId: 'pos-item-999',
    name: 'Seasonal Special',
    category: 'Specials',
    price: {
      amount: 18.99,
      currency: 'USD'
    },
    isActive: true,
    mappingStatus: 'unmapped',
    lastSyncedAt: '2025-10-18T08:00:00Z'
  },
  {
    id: 'pos-unmapped-002',
    posItemId: 'pos-item-1000',
    name: 'Chef\'s Special Pasta',
    category: 'Main Course',
    price: {
      amount: 22.50,
      currency: 'USD'
    },
    isActive: true,
    mappingStatus: 'unmapped',
    lastSyncedAt: '2025-10-18T08:00:00Z'
  },
  {
    id: 'pos-unmapped-003',
    posItemId: 'pos-item-1001',
    name: 'Exotic Smoothie',
    category: 'Beverage',
    price: {
      amount: 7.99,
      currency: 'USD'
    },
    isActive: true,
    mappingStatus: 'unmapped',
    lastSyncedAt: '2025-10-18T08:00:00Z'
  },
  {
    id: 'pos-unmapped-004',
    posItemId: 'pos-item-1002',
    name: 'Mystery Dessert',
    category: 'Dessert',
    price: {
      amount: 9.99,
      currency: 'USD'
    },
    isActive: true,
    mappingStatus: 'unmapped',
    lastSyncedAt: '2025-10-17T20:00:00Z'
  }
]

// ====== MOCK MAPPED POS ITEMS ======

export const mockMappedPOSItems: POSItem[] = [
  {
    id: 'pos-mapped-001',
    posItemId: 'pos-item-001',
    name: 'Coca-Cola',
    category: 'Beverage',
    price: {
      amount: 3.00, // Base price (varies by outlet)
      currency: 'USD'
    },
    isActive: true,
    mappingStatus: 'mapped',
    mappedRecipe: {
      id: 'recipe-coke-330ml',
      name: 'Coca-Cola 330ml'
    },
    lastSyncedAt: '2025-10-18T08:00:00Z'
  },
  {
    id: 'pos-mapped-002',
    posItemId: 'pos-item-101',
    name: 'Margherita Pizza',
    category: 'Main Course',
    price: {
      amount: 15.00,
      currency: 'USD'
    },
    isActive: true,
    mappingStatus: 'mapped',
    mappedRecipe: {
      id: 'recipe-001',
      name: 'Margherita Pizza'
    },
    lastSyncedAt: '2025-10-18T08:00:00Z'
  },
  {
    id: 'pos-mapped-003',
    posItemId: 'pos-item-102',
    name: 'House Salad',
    category: 'Appetizer',
    price: {
      amount: 8.50,
      currency: 'USD'
    },
    isActive: true,
    mappingStatus: 'mapped',
    mappedRecipe: {
      id: 'recipe-002',
      name: 'House Salad'
    },
    lastSyncedAt: '2025-10-18T08:00:00Z'
  },
  {
    id: 'pos-mapped-004',
    posItemId: 'pos-item-103',
    name: 'Caesar Salad',
    category: 'Appetizer',
    price: {
      amount: 9.50,
      currency: 'USD'
    },
    isActive: true,
    mappingStatus: 'mapped',
    mappedRecipe: {
      id: 'recipe-003',
      name: 'Caesar Salad'
    },
    lastSyncedAt: '2025-10-18T08:00:00Z'
  },
  {
    id: 'pos-mapped-005',
    posItemId: 'pos-item-104',
    name: 'Pepperoni Pizza',
    category: 'Main Course',
    price: {
      amount: 17.00,
      currency: 'USD'
    },
    isActive: true,
    mappingStatus: 'mapped',
    mappedRecipe: {
      id: 'recipe-004',
      name: 'Pepperoni Pizza'
    },
    lastSyncedAt: '2025-10-18T08:00:00Z'
  }
]

// ====== MOCK RECIPE SEARCH RESULTS ======

export const mockRecipeSearchResults: RecipeSearchResult[] = [
  {
    id: 'recipe-coke-330ml',
    name: 'Coca-Cola 330ml',
    category: 'Beverages',
    baseUnit: 'can',
    compatibleUnits: [
      { id: 'unit-can', name: 'can', abbreviation: 'can', conversionFactor: 1 },
      { id: 'unit-ml', name: 'milliliter', abbreviation: 'ml', conversionFactor: 330 }
    ],
    averageCost: { amount: 0.75, currency: 'USD' },
    ingredients: [
      { id: 'ing-coke', name: 'Coca-Cola 330ml Can', quantity: 1, unit: 'can' }
    ]
  },
  {
    id: 'recipe-001',
    name: 'Margherita Pizza',
    category: 'Pizza',
    baseUnit: 'whole',
    compatibleUnits: [
      { id: 'unit-001', name: 'whole', abbreviation: 'whole', conversionFactor: 1 },
      { id: 'unit-002', name: 'slice', abbreviation: 'slice', conversionFactor: 0.125 }
    ],
    averageCost: { amount: 8.50, currency: 'USD' },
    ingredients: [
      { id: 'ing-001', name: 'Pizza Dough', quantity: 400, unit: 'g' },
      { id: 'ing-002', name: 'Tomato Sauce', quantity: 200, unit: 'ml' },
      { id: 'ing-003', name: 'Mozzarella Cheese', quantity: 300, unit: 'g' },
      { id: 'ing-004', name: 'Fresh Basil', quantity: 20, unit: 'g' }
    ]
  },
  {
    id: 'recipe-002',
    name: 'House Salad',
    category: 'Salad',
    baseUnit: 'serving',
    compatibleUnits: [
      { id: 'unit-003', name: 'serving', abbreviation: 'srv', conversionFactor: 1 },
      { id: 'unit-004', name: 'bowl', abbreviation: 'bowl', conversionFactor: 1.5 }
    ],
    averageCost: { amount: 4.25, currency: 'USD' },
    ingredients: [
      { id: 'ing-005', name: 'Mixed Greens', quantity: 150, unit: 'g' },
      { id: 'ing-006', name: 'Cherry Tomatoes', quantity: 50, unit: 'g' },
      { id: 'ing-007', name: 'Cucumber', quantity: 30, unit: 'g' },
      { id: 'ing-008', name: 'Red Onion', quantity: 20, unit: 'g' },
      { id: 'ing-009', name: 'House Dressing', quantity: 30, unit: 'ml' }
    ]
  },
  {
    id: 'recipe-003',
    name: 'Caesar Salad',
    category: 'Salad',
    baseUnit: 'serving',
    compatibleUnits: [
      { id: 'unit-003', name: 'serving', abbreviation: 'srv', conversionFactor: 1 },
      { id: 'unit-004', name: 'bowl', abbreviation: 'bowl', conversionFactor: 1.5 }
    ],
    averageCost: { amount: 5.50, currency: 'USD' },
    ingredients: [
      { id: 'ing-010', name: 'Romaine Lettuce', quantity: 150, unit: 'g' },
      { id: 'ing-011', name: 'Caesar Dressing', quantity: 40, unit: 'ml' },
      { id: 'ing-012', name: 'Parmesan Cheese', quantity: 30, unit: 'g' },
      { id: 'ing-013', name: 'Croutons', quantity: 25, unit: 'g' }
    ]
  },
  {
    id: 'recipe-004',
    name: 'Pepperoni Pizza',
    category: 'Pizza',
    baseUnit: 'whole',
    compatibleUnits: [
      { id: 'unit-001', name: 'whole', abbreviation: 'whole', conversionFactor: 1 },
      { id: 'unit-002', name: 'slice', abbreviation: 'slice', conversionFactor: 0.125 }
    ],
    averageCost: { amount: 9.50, currency: 'USD' },
    ingredients: [
      { id: 'ing-001', name: 'Pizza Dough', quantity: 400, unit: 'g' },
      { id: 'ing-002', name: 'Tomato Sauce', quantity: 200, unit: 'ml' },
      { id: 'ing-003', name: 'Mozzarella Cheese', quantity: 300, unit: 'g' },
      { id: 'ing-pepperoni', name: 'Pepperoni', quantity: 100, unit: 'g' }
    ]
  },
  {
    id: 'recipe-005',
    name: 'Grilled Chicken Breast',
    category: 'Poultry',
    baseUnit: 'g',
    compatibleUnits: [
      { id: 'unit-005', name: 'gram', abbreviation: 'g', conversionFactor: 1 },
      { id: 'unit-006', name: 'piece', abbreviation: 'pc', conversionFactor: 200 }
    ],
    averageCost: { amount: 6.00, currency: 'USD' },
    ingredients: [
      { id: 'ing-014', name: 'Chicken Breast', quantity: 200, unit: 'g' },
      { id: 'ing-015', name: 'Olive Oil', quantity: 10, unit: 'ml' },
      { id: 'ing-016', name: 'Herbs & Spices', quantity: 5, unit: 'g' }
    ]
  },
  {
    id: 'recipe-006',
    name: 'French Fries',
    category: 'Sides',
    baseUnit: 'g',
    compatibleUnits: [
      { id: 'unit-g', name: 'gram', abbreviation: 'g', conversionFactor: 1 },
      { id: 'unit-portion', name: 'portion', abbreviation: 'ptn', conversionFactor: 150 }
    ],
    averageCost: { amount: 1.50, currency: 'USD' },
    ingredients: [
      { id: 'ing-potato', name: 'Potatoes', quantity: 200, unit: 'g' },
      { id: 'ing-oil', name: 'Vegetable Oil', quantity: 50, unit: 'ml' },
      { id: 'ing-salt', name: 'Salt', quantity: 2, unit: 'g' }
    ]
  },
  {
    id: 'recipe-007',
    name: 'Iced Tea',
    category: 'Beverages',
    baseUnit: 'ml',
    compatibleUnits: [
      { id: 'unit-ml', name: 'milliliter', abbreviation: 'ml', conversionFactor: 1 },
      { id: 'unit-glass', name: 'glass', abbreviation: 'glass', conversionFactor: 500 }
    ],
    averageCost: { amount: 0.80, currency: 'USD' },
    ingredients: [
      { id: 'ing-tea', name: 'Black Tea', quantity: 5, unit: 'g' },
      { id: 'ing-sugar', name: 'Sugar', quantity: 20, unit: 'g' },
      { id: 'ing-lemon', name: 'Lemon', quantity: 0.25, unit: 'piece' },
      { id: 'ing-ice', name: 'Ice', quantity: 100, unit: 'g' }
    ]
  }
]

// ====== MOCK MAPPING PREVIEWS ======

export const mockMappingPreviews: Record<string, MappingPreview> = {
  'pos-item-101': {
    recipe: { id: 'recipe-001', name: 'Margherita Pizza', category: 'Pizza' },
    portionSize: 1,
    unit: 'whole',
    ingredients: [
      { name: 'Pizza Dough', quantityPerPortion: 400, unit: 'g', estimatedCost: { amount: 2.40, currency: 'USD' } },
      { name: 'Tomato Sauce', quantityPerPortion: 200, unit: 'ml', estimatedCost: { amount: 1.20, currency: 'USD' } },
      { name: 'Mozzarella Cheese', quantityPerPortion: 300, unit: 'g', estimatedCost: { amount: 4.50, currency: 'USD' } },
      { name: 'Fresh Basil', quantityPerPortion: 20, unit: 'g', estimatedCost: { amount: 0.40, currency: 'USD' } }
    ],
    totalEstimatedCost: { amount: 8.50, currency: 'USD' },
    costComparison: {
      posPrice: { amount: 15.00, currency: 'USD' },
      estimatedCost: { amount: 8.50, currency: 'USD' },
      margin: 43.3,
      marginStatus: 'good'
    }
  },
  'pos-item-102': {
    recipe: { id: 'recipe-002', name: 'House Salad', category: 'Salad' },
    portionSize: 1,
    unit: 'serving',
    ingredients: [
      { name: 'Mixed Greens', quantityPerPortion: 150, unit: 'g', estimatedCost: { amount: 1.50, currency: 'USD' } },
      { name: 'Cherry Tomatoes', quantityPerPortion: 50, unit: 'g', estimatedCost: { amount: 0.75, currency: 'USD' } },
      { name: 'Cucumber', quantityPerPortion: 30, unit: 'g', estimatedCost: { amount: 0.30, currency: 'USD' } },
      { name: 'Red Onion', quantityPerPortion: 20, unit: 'g', estimatedCost: { amount: 0.20, currency: 'USD' } },
      { name: 'House Dressing', quantityPerPortion: 30, unit: 'ml', estimatedCost: { amount: 0.50, currency: 'USD' } }
    ],
    totalEstimatedCost: { amount: 3.25, currency: 'USD' },
    costComparison: {
      posPrice: { amount: 8.50, currency: 'USD' },
      estimatedCost: { amount: 3.25, currency: 'USD' },
      margin: 61.8,
      marginStatus: 'good'
    }
  }
}

// ====== UTILITY FUNCTIONS ======

/**
 * Get mapping by composite key (posItemId + posOutletId)
 */
export const getMappingByCompositeKey = (posItemId: string, posOutletId: string): POSMapping | undefined => {
  return mockPOSMappings.find(
    mapping => mapping.posItemId === posItemId && mapping.posOutletId === posOutletId && mapping.isActive
  )
}

/**
 * Get all mappings for a POS item (across all outlets)
 */
export const getMappingsByPOSItemId = (posItemId: string): POSMapping[] => {
  return mockPOSMappings.filter(mapping => mapping.posItemId === posItemId && mapping.isActive)
}

/**
 * Get all mappings for an outlet
 */
export const getMappingsByOutletId = (posOutletId: string): POSMapping[] => {
  return mockPOSMappings.filter(mapping => mapping.posOutletId === posOutletId && mapping.isActive)
}

/**
 * Get all mappings for a Carmen location
 */
export const getMappingsByLocationId = (locationId: string): POSMapping[] => {
  return mockPOSMappings.filter(mapping => mapping.locationId === locationId && mapping.isActive)
}

/**
 * Get all mappings for a recipe (across all outlets)
 */
export const getMappingsByRecipeId = (recipeId: string): POSMapping[] => {
  return mockPOSMappings.filter(mapping => mapping.recipeId === recipeId && mapping.isActive)
}

/**
 * @deprecated Use getMappingByCompositeKey instead
 */
export const getMappingByPOSItemId = (posItemId: string): POSMapping | undefined => {
  return mockPOSMappings.find(mapping => mapping.posItemId === posItemId && mapping.isActive)
}

export const getUnmappedPOSItems = (): POSItem[] => {
  return mockUnmappedPOSItems
}

export const getMappedPOSItems = (): POSItem[] => {
  return mockMappedPOSItems
}

export const searchRecipes = (query: string): RecipeSearchResult[] => {
  const lowercaseQuery = query.toLowerCase()
  return mockRecipeSearchResults.filter(recipe =>
    recipe.name.toLowerCase().includes(lowercaseQuery) ||
    recipe.category.toLowerCase().includes(lowercaseQuery)
  )
}

export const getMappingPreview = (posItemId: string): MappingPreview | undefined => {
  return mockMappingPreviews[posItemId]
}

export const getAllPOSMappings = (): POSMapping[] => {
  return mockPOSMappings
}

export const getActiveMappings = (): POSMapping[] => {
  return mockPOSMappings.filter(mapping => mapping.isActive)
}

export const getInactiveMappings = (): POSMapping[] => {
  return mockPOSMappings.filter(mapping => !mapping.isActive)
}
