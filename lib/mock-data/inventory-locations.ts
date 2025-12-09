/**
 * Mock Data - Inventory Locations
 *
 * Sample data for inventory locations, shelves, user assignments,
 * product assignments, and delivery points.
 */

import {
  InventoryLocation,
  InventoryLocationType,
  Shelf,
  StorageZoneType,
  UserLocationAssignment,
  ProductLocationAssignment,
  DeliveryPoint,
  InventoryLocationSummary,
  LOCATION_TYPE_DEFAULTS
} from '@/lib/types/location-management'

// ====== MOCK INVENTORY LOCATIONS ======

export const mockInventoryLocations: InventoryLocation[] = [
  // Inventory Type Locations
  {
    id: 'loc-003',  // Aligned with user context - Central Kitchen
    code: 'CK-001',
    name: 'Central Kitchen',
    description: 'Main storage facility for the central kitchen operations',
    type: InventoryLocationType.INVENTORY,
    status: 'active',
    physicalCountEnabled: true,
    inventoryConfig: LOCATION_TYPE_DEFAULTS[InventoryLocationType.INVENTORY],
    address: {
      addressLine1: '123 Kitchen Way',
      city: 'Bangkok',
      postalCode: '10110',
      country: 'Thailand'
    },
    departmentId: 'dept-kitchen',
    departmentName: 'Central Kitchen',
    costCenterId: 'cc-001',
    costCenterName: 'F&B Operations',
    deliveryPointId: 'dp-001',
    deliveryPointName: 'Central Kitchen - Main Entrance',
    shelvesCount: 8,
    assignedUsersCount: 5,
    assignedProductsCount: 150,
    createdAt: new Date('2024-01-15'),
    createdBy: 'system'
  },
  {
    id: 'loc-004',  // Aligned with user context - Main Warehouse
    code: 'WH-001',
    name: 'Main Warehouse',
    description: 'Primary warehouse for bulk storage and receiving',
    type: InventoryLocationType.INVENTORY,
    status: 'active',
    physicalCountEnabled: true,
    inventoryConfig: LOCATION_TYPE_DEFAULTS[InventoryLocationType.INVENTORY],
    address: {
      addressLine1: '456 Warehouse Road',
      city: 'Bangkok',
      postalCode: '10120',
      country: 'Thailand'
    },
    departmentId: 'dept-warehouse',
    departmentName: 'Warehouse',
    costCenterId: 'cc-002',
    costCenterName: 'Logistics',
    deliveryPointId: 'dp-002',
    deliveryPointName: 'Main Warehouse - Receiving Dock',
    shelvesCount: 15,
    assignedUsersCount: 8,
    assignedProductsCount: 320,
    createdAt: new Date('2024-01-10'),
    createdBy: 'system'
  },
  // Direct Type Locations
  {
    id: 'loc-003',
    code: 'BAR-001',
    name: 'Restaurant Bar Direct',
    description: 'Bar area with direct expense on receipt',
    type: InventoryLocationType.DIRECT,
    status: 'active',
    physicalCountEnabled: false,
    inventoryConfig: LOCATION_TYPE_DEFAULTS[InventoryLocationType.DIRECT],
    departmentId: 'dept-fnb',
    departmentName: 'Food & Beverage',
    costCenterId: 'cc-003',
    costCenterName: 'Bar Operations',
    deliveryPointId: 'dp-003',
    deliveryPointName: 'Bar - Service Entrance',
    shelvesCount: 3,
    assignedUsersCount: 3,
    assignedProductsCount: 45,
    createdAt: new Date('2024-02-01'),
    createdBy: 'admin'
  },
  {
    id: 'loc-004',
    code: 'MAINT-001',
    name: 'Maintenance Direct',
    description: 'Maintenance supplies with direct expense treatment',
    type: InventoryLocationType.DIRECT,
    status: 'active',
    physicalCountEnabled: false,
    inventoryConfig: LOCATION_TYPE_DEFAULTS[InventoryLocationType.DIRECT],
    departmentId: 'dept-maintenance',
    departmentName: 'Maintenance',
    costCenterId: 'cc-004',
    costCenterName: 'Facilities',
    shelvesCount: 2,
    assignedUsersCount: 2,
    assignedProductsCount: 85,
    createdAt: new Date('2024-02-15'),
    createdBy: 'admin'
  },
  // Consignment Type Locations
  {
    id: 'loc-005',
    code: 'CSG-001',
    name: 'Beverage Consignment',
    description: 'Vendor-managed beverage inventory',
    type: InventoryLocationType.CONSIGNMENT,
    status: 'active',
    physicalCountEnabled: true,
    inventoryConfig: LOCATION_TYPE_DEFAULTS[InventoryLocationType.CONSIGNMENT],
    consignmentVendorId: 'vendor-001',
    consignmentVendorName: 'Premium Beverages Co.',
    departmentId: 'dept-fnb',
    departmentName: 'Food & Beverage',
    costCenterId: 'cc-005',
    costCenterName: 'Consignment',
    shelvesCount: 4,
    assignedUsersCount: 2,
    assignedProductsCount: 60,
    createdAt: new Date('2024-03-01'),
    createdBy: 'admin'
  },
  {
    id: 'loc-006',
    code: 'CSG-002',
    name: 'Linen Consignment',
    description: 'Vendor-managed linen and uniform inventory',
    type: InventoryLocationType.CONSIGNMENT,
    status: 'active',
    physicalCountEnabled: true,
    inventoryConfig: LOCATION_TYPE_DEFAULTS[InventoryLocationType.CONSIGNMENT],
    consignmentVendorId: 'vendor-002',
    consignmentVendorName: 'Royal Linen Services',
    departmentId: 'dept-housekeeping',
    departmentName: 'Housekeeping',
    costCenterId: 'cc-005',
    costCenterName: 'Consignment',
    shelvesCount: 6,
    assignedUsersCount: 3,
    assignedProductsCount: 120,
    createdAt: new Date('2024-03-10'),
    createdBy: 'admin'
  }
]

// ====== MOCK SHELVES ======

export const mockShelves: Shelf[] = [
  // Central Kitchen (loc-003)
  {
    id: 'sh-001',
    locationId: 'loc-003',
    code: 'DRY-A1',
    name: 'Dry Storage A1',
    description: 'Main dry goods storage area',
    zoneType: StorageZoneType.DRY,
    capacity: { maxWeight: 500, maxWeightUnit: 'kg', maxUnits: 200 },
    position: { aisle: 'A', row: '1', level: 1 },
    isActive: true,
    sortOrder: 1,
    createdAt: new Date('2024-01-15'),
    createdBy: 'system'
  },
  {
    id: 'sh-002',
    locationId: 'loc-003',
    code: 'DRY-A2',
    name: 'Dry Storage A2',
    description: 'Secondary dry goods storage',
    zoneType: StorageZoneType.DRY,
    capacity: { maxWeight: 500, maxWeightUnit: 'kg', maxUnits: 200 },
    position: { aisle: 'A', row: '2', level: 1 },
    isActive: true,
    sortOrder: 2,
    createdAt: new Date('2024-01-15'),
    createdBy: 'system'
  },
  {
    id: 'sh-003',
    locationId: 'loc-003',
    code: 'COLD-B1',
    name: 'Cold Room B1',
    description: 'Refrigerated storage for perishables',
    zoneType: StorageZoneType.COLD,
    capacity: { maxWeight: 300, maxWeightUnit: 'kg', maxUnits: 150 },
    position: { aisle: 'B', row: '1', level: 1 },
    isActive: true,
    sortOrder: 3,
    createdAt: new Date('2024-01-15'),
    createdBy: 'system'
  },
  {
    id: 'sh-004',
    locationId: 'loc-003',
    code: 'FRZ-C1',
    name: 'Freezer C1',
    description: 'Frozen storage for proteins',
    zoneType: StorageZoneType.FROZEN,
    capacity: { maxWeight: 400, maxWeightUnit: 'kg', maxUnits: 100 },
    position: { aisle: 'C', row: '1', level: 1 },
    isActive: true,
    sortOrder: 4,
    createdAt: new Date('2024-01-15'),
    createdBy: 'system'
  },
  // Main Warehouse (loc-004)
  {
    id: 'sh-005',
    locationId: 'loc-004',
    code: 'WH-R1-L1',
    name: 'Rack 1 Level 1',
    description: 'Ground level storage rack',
    zoneType: StorageZoneType.AMBIENT,
    capacity: { maxWeight: 1000, maxWeightUnit: 'kg', maxUnits: 500 },
    position: { aisle: '1', row: 'A', level: 1, bay: 'B1' },
    isActive: true,
    sortOrder: 1,
    createdAt: new Date('2024-01-10'),
    createdBy: 'system'
  },
  {
    id: 'sh-006',
    locationId: 'loc-004',
    code: 'WH-R1-L2',
    name: 'Rack 1 Level 2',
    description: 'Second level storage rack',
    zoneType: StorageZoneType.AMBIENT,
    capacity: { maxWeight: 800, maxWeightUnit: 'kg', maxUnits: 400 },
    position: { aisle: '1', row: 'A', level: 2, bay: 'B1' },
    isActive: true,
    sortOrder: 2,
    createdAt: new Date('2024-01-10'),
    createdBy: 'system'
  },
  {
    id: 'sh-007',
    locationId: 'loc-004',
    code: 'WH-COLD-1',
    name: 'Warehouse Cold Storage',
    description: 'Large cold storage area',
    zoneType: StorageZoneType.COLD,
    capacity: { maxWeight: 2000, maxWeightUnit: 'kg', maxUnits: 1000 },
    position: { aisle: '2', row: 'B', level: 1 },
    isActive: true,
    sortOrder: 3,
    createdAt: new Date('2024-01-10'),
    createdBy: 'system'
  },
  // Bar Direct (loc-003)
  {
    id: 'sh-008',
    locationId: 'loc-003',
    code: 'BAR-TOP',
    name: 'Bar Top Shelf',
    description: 'Display shelf behind bar',
    zoneType: StorageZoneType.AMBIENT,
    capacity: { maxUnits: 50 },
    isActive: true,
    sortOrder: 1,
    createdAt: new Date('2024-02-01'),
    createdBy: 'admin'
  },
  {
    id: 'sh-009',
    locationId: 'loc-003',
    code: 'BAR-FRIDGE',
    name: 'Bar Refrigerator',
    description: 'Under-counter refrigerator',
    zoneType: StorageZoneType.COLD,
    capacity: { maxUnits: 100 },
    isActive: true,
    sortOrder: 2,
    createdAt: new Date('2024-02-01'),
    createdBy: 'admin'
  },
  // Beverage Consignment (loc-005)
  {
    id: 'sh-010',
    locationId: 'loc-005',
    code: 'CSG-BEV-1',
    name: 'Beverage Rack 1',
    description: 'Main beverage consignment rack',
    zoneType: StorageZoneType.AMBIENT,
    capacity: { maxWeight: 500, maxWeightUnit: 'kg', maxUnits: 300 },
    isActive: true,
    sortOrder: 1,
    createdAt: new Date('2024-03-01'),
    createdBy: 'admin'
  },
  {
    id: 'sh-011',
    locationId: 'loc-005',
    code: 'CSG-BEV-COLD',
    name: 'Beverage Cold Storage',
    description: 'Refrigerated beverage storage',
    zoneType: StorageZoneType.COLD,
    capacity: { maxWeight: 200, maxWeightUnit: 'kg', maxUnits: 150 },
    isActive: true,
    sortOrder: 2,
    createdAt: new Date('2024-03-01'),
    createdBy: 'admin'
  }
]

// ====== MOCK USER LOCATION ASSIGNMENTS ======

export const mockUserLocationAssignments: UserLocationAssignment[] = [
  // Central Kitchen assignments
  {
    id: 'ula-001',
    userId: 'user-001',
    userName: 'John Smith',
    userEmail: 'john.smith@company.com',
    locationId: 'loc-003',
    roleAtLocation: 'location_manager',
    permissions: [
      'location:view',
      'location:edit',
      'inventory:view',
      'inventory:receive',
      'inventory:issue',
      'inventory:adjust',
      'inventory:transfer',
      'count:view',
      'count:participate',
      'count:finalize',
      'shelf:manage'
    ],
    isPrimary: true,
    isActive: true,
    assignedAt: new Date('2024-01-15'),
    assignedBy: 'admin'
  },
  {
    id: 'ula-002',
    userId: 'user-002',
    userName: 'Sarah Johnson',
    userEmail: 'sarah.j@company.com',
    locationId: 'loc-003',
    roleAtLocation: 'inventory_controller',
    permissions: [
      'location:view',
      'inventory:view',
      'inventory:receive',
      'inventory:issue',
      'inventory:adjust',
      'count:view',
      'count:participate'
    ],
    isPrimary: true,
    isActive: true,
    assignedAt: new Date('2024-01-20'),
    assignedBy: 'admin'
  },
  {
    id: 'ula-003',
    userId: 'user-003',
    userName: 'Mike Chen',
    userEmail: 'mike.c@company.com',
    locationId: 'loc-003',
    roleAtLocation: 'receiver',
    permissions: [
      'location:view',
      'inventory:view',
      'inventory:receive'
    ],
    isPrimary: true,
    isActive: true,
    assignedAt: new Date('2024-02-01'),
    assignedBy: 'admin'
  },
  // Main Warehouse assignments
  {
    id: 'ula-004',
    userId: 'user-004',
    userName: 'Lisa Wong',
    userEmail: 'lisa.w@company.com',
    locationId: 'loc-004',
    roleAtLocation: 'location_manager',
    permissions: [
      'location:view',
      'location:edit',
      'inventory:view',
      'inventory:receive',
      'inventory:issue',
      'inventory:adjust',
      'inventory:transfer',
      'count:view',
      'count:participate',
      'count:finalize',
      'shelf:manage'
    ],
    isPrimary: true,
    isActive: true,
    assignedAt: new Date('2024-01-10'),
    assignedBy: 'admin'
  },
  {
    id: 'ula-005',
    userId: 'user-005',
    userName: 'Tom Brown',
    userEmail: 'tom.b@company.com',
    locationId: 'loc-004',
    roleAtLocation: 'picker',
    permissions: [
      'location:view',
      'inventory:view',
      'inventory:issue'
    ],
    isPrimary: true,
    isActive: true,
    assignedAt: new Date('2024-01-15'),
    assignedBy: 'admin'
  },
  // Bar assignments
  {
    id: 'ula-006',
    userId: 'user-006',
    userName: 'James Wilson',
    userEmail: 'james.w@company.com',
    locationId: 'loc-003',
    roleAtLocation: 'location_manager',
    permissions: [
      'location:view',
      'location:edit',
      'inventory:view',
      'inventory:receive',
      'inventory:issue'
    ],
    isPrimary: true,
    isActive: true,
    assignedAt: new Date('2024-02-01'),
    assignedBy: 'admin'
  }
]

// ====== MOCK PRODUCT LOCATION ASSIGNMENTS ======

export const mockProductLocationAssignments: ProductLocationAssignment[] = [
  // Central Kitchen products
  {
    id: 'pla-001',
    productId: 'prod-001',
    productCode: 'RICE-JAS-01',
    productName: 'Jasmine Rice Premium',
    categoryName: 'Rice & Grains',
    baseUnit: 'kg',
    locationId: 'loc-003',
    shelfId: 'sh-001',
    shelfName: 'Dry Storage A1',
    minQuantity: 50,
    maxQuantity: 200,
    reorderPoint: 75,
    parLevel: 100,
    safetyStock: 25,
    leadTimeDays: 3,
    isActive: true,
    isStocked: true,
    currentQuantity: 120,
    lastReceiptDate: new Date('2024-10-15'),
    lastIssueDate: new Date('2024-10-20'),
    assignedAt: new Date('2024-01-15'),
    assignedBy: 'admin'
  },
  {
    id: 'pla-002',
    productId: 'prod-002',
    productCode: 'CHKN-BRST-01',
    productName: 'Chicken Breast Fresh',
    categoryName: 'Poultry',
    baseUnit: 'kg',
    locationId: 'loc-003',
    shelfId: 'sh-003',
    shelfName: 'Cold Room B1',
    minQuantity: 20,
    maxQuantity: 80,
    reorderPoint: 30,
    parLevel: 50,
    safetyStock: 10,
    leadTimeDays: 1,
    isActive: true,
    isStocked: true,
    currentQuantity: 45,
    lastReceiptDate: new Date('2024-10-19'),
    lastIssueDate: new Date('2024-10-20'),
    assignedAt: new Date('2024-01-15'),
    assignedBy: 'admin'
  },
  {
    id: 'pla-003',
    productId: 'prod-003',
    productCode: 'BEEF-TND-01',
    productName: 'Beef Tenderloin',
    categoryName: 'Beef',
    baseUnit: 'kg',
    locationId: 'loc-003',
    shelfId: 'sh-004',
    shelfName: 'Freezer C1',
    minQuantity: 10,
    maxQuantity: 40,
    reorderPoint: 15,
    parLevel: 25,
    safetyStock: 5,
    leadTimeDays: 2,
    isActive: true,
    isStocked: true,
    currentQuantity: 22,
    lastReceiptDate: new Date('2024-10-18'),
    lastIssueDate: new Date('2024-10-20'),
    assignedAt: new Date('2024-01-15'),
    assignedBy: 'admin'
  },
  // Main Warehouse products
  {
    id: 'pla-004',
    productId: 'prod-001',
    productCode: 'RICE-JAS-01',
    productName: 'Jasmine Rice Premium',
    categoryName: 'Rice & Grains',
    baseUnit: 'kg',
    locationId: 'loc-004',
    shelfId: 'sh-005',
    shelfName: 'Rack 1 Level 1',
    minQuantity: 200,
    maxQuantity: 1000,
    reorderPoint: 350,
    parLevel: 500,
    safetyStock: 100,
    leadTimeDays: 5,
    isActive: true,
    isStocked: true,
    currentQuantity: 650,
    lastReceiptDate: new Date('2024-10-10'),
    lastIssueDate: new Date('2024-10-18'),
    assignedAt: new Date('2024-01-10'),
    assignedBy: 'admin'
  },
  // Bar products (Direct location)
  {
    id: 'pla-005',
    productId: 'prod-010',
    productCode: 'WINE-RED-01',
    productName: 'House Red Wine',
    categoryName: 'Beverages',
    baseUnit: 'bottle',
    locationId: 'loc-003',
    shelfId: 'sh-008',
    shelfName: 'Bar Top Shelf',
    minQuantity: 5,
    maxQuantity: 20,
    reorderPoint: 8,
    parLevel: 12,
    isActive: true,
    isStocked: true,
    currentQuantity: 15,
    assignedAt: new Date('2024-02-01'),
    assignedBy: 'admin'
  },
  // Consignment products
  {
    id: 'pla-006',
    productId: 'prod-020',
    productCode: 'SODA-COLA-01',
    productName: 'Premium Cola',
    categoryName: 'Soft Drinks',
    baseUnit: 'can',
    locationId: 'loc-005',
    shelfId: 'sh-011',
    shelfName: 'Beverage Cold Storage',
    consignmentVendorId: 'vendor-001',
    consignmentPrice: 25.00,
    minQuantity: 48,
    maxQuantity: 240,
    reorderPoint: 72,
    parLevel: 120,
    isActive: true,
    isStocked: true,
    currentQuantity: 180,
    assignedAt: new Date('2024-03-01'),
    assignedBy: 'admin'
  },
  // Additional Central Kitchen products - with LOW STOCK for replenishment testing
  {
    id: 'pla-007',
    productId: 'prod-004',
    productCode: 'FLOUR-AP-01',
    productName: 'All Purpose Flour',
    categoryName: 'Dry Goods',
    baseUnit: 'kg',
    locationId: 'loc-003',
    shelfId: 'sh-001',
    shelfName: 'Dry Storage A1',
    minQuantity: 15,
    maxQuantity: 100,
    reorderPoint: 25,
    parLevel: 60,
    safetyStock: 10,
    leadTimeDays: 3,
    isActive: true,
    isStocked: true,
    currentQuantity: 8, // CRITICAL - below minimum
    lastReceiptDate: new Date('2024-10-01'),
    lastIssueDate: new Date('2024-10-20'),
    assignedAt: new Date('2024-01-15'),
    assignedBy: 'admin'
  },
  {
    id: 'pla-008',
    productId: 'prod-005',
    productCode: 'SUGAR-WH-01',
    productName: 'White Sugar',
    categoryName: 'Dry Goods',
    baseUnit: 'kg',
    locationId: 'loc-003',
    shelfId: 'sh-001',
    shelfName: 'Dry Storage A1',
    minQuantity: 10,
    maxQuantity: 80,
    reorderPoint: 20,
    parLevel: 50,
    safetyStock: 8,
    leadTimeDays: 3,
    isActive: true,
    isStocked: true,
    currentQuantity: 12, // WARNING - below reorder point
    lastReceiptDate: new Date('2024-10-05'),
    lastIssueDate: new Date('2024-10-20'),
    assignedAt: new Date('2024-01-15'),
    assignedBy: 'admin'
  },
  {
    id: 'pla-009',
    productId: 'prod-006',
    productCode: 'MILK-FRH-01',
    productName: 'Fresh Milk',
    categoryName: 'Dairy',
    baseUnit: 'L',
    locationId: 'loc-003',
    shelfId: 'sh-003',
    shelfName: 'Cold Room B1',
    minQuantity: 10,
    maxQuantity: 50,
    reorderPoint: 15,
    parLevel: 30,
    safetyStock: 5,
    leadTimeDays: 1,
    isActive: true,
    isStocked: true,
    currentQuantity: 5, // CRITICAL - below minimum
    lastReceiptDate: new Date('2024-10-19'),
    lastIssueDate: new Date('2024-10-21'),
    assignedAt: new Date('2024-01-15'),
    assignedBy: 'admin'
  },
  {
    id: 'pla-010',
    productId: 'prod-007',
    productCode: 'BUTTER-01',
    productName: 'Unsalted Butter',
    categoryName: 'Dairy',
    baseUnit: 'kg',
    locationId: 'loc-003',
    shelfId: 'sh-003',
    shelfName: 'Cold Room B1',
    minQuantity: 5,
    maxQuantity: 25,
    reorderPoint: 8,
    parLevel: 15,
    safetyStock: 3,
    leadTimeDays: 2,
    isActive: true,
    isStocked: true,
    currentQuantity: 6, // WARNING - below reorder point
    lastReceiptDate: new Date('2024-10-15'),
    lastIssueDate: new Date('2024-10-20'),
    assignedAt: new Date('2024-01-15'),
    assignedBy: 'admin'
  },
  {
    id: 'pla-011',
    productId: 'prod-008',
    productCode: 'EGG-LRG-01',
    productName: 'Large Eggs',
    categoryName: 'Dairy',
    baseUnit: 'dozen',
    locationId: 'loc-003',
    shelfId: 'sh-003',
    shelfName: 'Cold Room B1',
    minQuantity: 10,
    maxQuantity: 60,
    reorderPoint: 20,
    parLevel: 40,
    safetyStock: 8,
    leadTimeDays: 1,
    isActive: true,
    isStocked: true,
    currentQuantity: 25, // LOW - below par but above reorder
    lastReceiptDate: new Date('2024-10-18'),
    lastIssueDate: new Date('2024-10-21'),
    assignedAt: new Date('2024-01-15'),
    assignedBy: 'admin'
  },
  {
    id: 'pla-012',
    productId: 'prod-009',
    productCode: 'ONION-YL-01',
    productName: 'Yellow Onion',
    categoryName: 'Produce',
    baseUnit: 'kg',
    locationId: 'loc-003',
    shelfId: 'sh-002',
    shelfName: 'Dry Storage A2',
    minQuantity: 15,
    maxQuantity: 80,
    reorderPoint: 25,
    parLevel: 50,
    safetyStock: 10,
    leadTimeDays: 2,
    isActive: true,
    isStocked: true,
    currentQuantity: 10, // CRITICAL - below minimum
    lastReceiptDate: new Date('2024-10-10'),
    lastIssueDate: new Date('2024-10-21'),
    assignedAt: new Date('2024-01-15'),
    assignedBy: 'admin'
  },
  {
    id: 'pla-013',
    productId: 'prod-011',
    productCode: 'GARLIC-01',
    productName: 'Fresh Garlic',
    categoryName: 'Produce',
    baseUnit: 'kg',
    locationId: 'loc-003',
    shelfId: 'sh-002',
    shelfName: 'Dry Storage A2',
    minQuantity: 3,
    maxQuantity: 20,
    reorderPoint: 5,
    parLevel: 10,
    safetyStock: 2,
    leadTimeDays: 2,
    isActive: true,
    isStocked: true,
    currentQuantity: 4, // WARNING - below reorder point
    lastReceiptDate: new Date('2024-10-12'),
    lastIssueDate: new Date('2024-10-20'),
    assignedAt: new Date('2024-01-15'),
    assignedBy: 'admin'
  },
  {
    id: 'pla-014',
    productId: 'prod-012',
    productCode: 'SALMON-FLT-01',
    productName: 'Salmon Fillet Fresh',
    categoryName: 'Seafood',
    baseUnit: 'kg',
    locationId: 'loc-003',
    shelfId: 'sh-004',
    shelfName: 'Freezer C1',
    minQuantity: 5,
    maxQuantity: 30,
    reorderPoint: 10,
    parLevel: 20,
    safetyStock: 3,
    leadTimeDays: 1,
    isActive: true,
    isStocked: true,
    currentQuantity: 3, // CRITICAL - below minimum
    lastReceiptDate: new Date('2024-10-18'),
    lastIssueDate: new Date('2024-10-21'),
    assignedAt: new Date('2024-01-15'),
    assignedBy: 'admin'
  },
  // Warehouse products - high stock to serve as source
  {
    id: 'pla-015',
    productId: 'prod-004',
    productCode: 'FLOUR-AP-01',
    productName: 'All Purpose Flour',
    categoryName: 'Dry Goods',
    baseUnit: 'kg',
    locationId: 'loc-004',
    shelfId: 'sh-005',
    shelfName: 'Rack 1 Level 1',
    minQuantity: 100,
    maxQuantity: 500,
    reorderPoint: 150,
    parLevel: 300,
    safetyStock: 50,
    leadTimeDays: 5,
    isActive: true,
    isStocked: true,
    currentQuantity: 420,
    lastReceiptDate: new Date('2024-10-08'),
    lastIssueDate: new Date('2024-10-15'),
    assignedAt: new Date('2024-01-10'),
    assignedBy: 'admin'
  },
  {
    id: 'pla-016',
    productId: 'prod-005',
    productCode: 'SUGAR-WH-01',
    productName: 'White Sugar',
    categoryName: 'Dry Goods',
    baseUnit: 'kg',
    locationId: 'loc-004',
    shelfId: 'sh-005',
    shelfName: 'Rack 1 Level 1',
    minQuantity: 80,
    maxQuantity: 400,
    reorderPoint: 120,
    parLevel: 250,
    safetyStock: 40,
    leadTimeDays: 5,
    isActive: true,
    isStocked: true,
    currentQuantity: 380,
    lastReceiptDate: new Date('2024-10-05'),
    lastIssueDate: new Date('2024-10-18'),
    assignedAt: new Date('2024-01-10'),
    assignedBy: 'admin'
  },
  {
    id: 'pla-017',
    productId: 'prod-006',
    productCode: 'MILK-FRH-01',
    productName: 'Fresh Milk',
    categoryName: 'Dairy',
    baseUnit: 'L',
    locationId: 'loc-004',
    shelfId: 'sh-007',
    shelfName: 'Warehouse Cold Storage',
    minQuantity: 50,
    maxQuantity: 200,
    reorderPoint: 80,
    parLevel: 150,
    safetyStock: 30,
    leadTimeDays: 2,
    isActive: true,
    isStocked: true,
    currentQuantity: 175,
    lastReceiptDate: new Date('2024-10-19'),
    lastIssueDate: new Date('2024-10-20'),
    assignedAt: new Date('2024-01-10'),
    assignedBy: 'admin'
  },
  {
    id: 'pla-018',
    productId: 'prod-007',
    productCode: 'BUTTER-01',
    productName: 'Unsalted Butter',
    categoryName: 'Dairy',
    baseUnit: 'kg',
    locationId: 'loc-004',
    shelfId: 'sh-007',
    shelfName: 'Warehouse Cold Storage',
    minQuantity: 30,
    maxQuantity: 120,
    reorderPoint: 45,
    parLevel: 80,
    safetyStock: 15,
    leadTimeDays: 3,
    isActive: true,
    isStocked: true,
    currentQuantity: 95,
    lastReceiptDate: new Date('2024-10-12'),
    lastIssueDate: new Date('2024-10-18'),
    assignedAt: new Date('2024-01-10'),
    assignedBy: 'admin'
  },
  {
    id: 'pla-019',
    productId: 'prod-008',
    productCode: 'EGG-LRG-01',
    productName: 'Large Eggs',
    categoryName: 'Dairy',
    baseUnit: 'dozen',
    locationId: 'loc-004',
    shelfId: 'sh-007',
    shelfName: 'Warehouse Cold Storage',
    minQuantity: 60,
    maxQuantity: 300,
    reorderPoint: 100,
    parLevel: 200,
    safetyStock: 40,
    leadTimeDays: 2,
    isActive: true,
    isStocked: true,
    currentQuantity: 240,
    lastReceiptDate: new Date('2024-10-17'),
    lastIssueDate: new Date('2024-10-20'),
    assignedAt: new Date('2024-01-10'),
    assignedBy: 'admin'
  },
  {
    id: 'pla-020',
    productId: 'prod-009',
    productCode: 'ONION-YL-01',
    productName: 'Yellow Onion',
    categoryName: 'Produce',
    baseUnit: 'kg',
    locationId: 'loc-004',
    shelfId: 'sh-006',
    shelfName: 'Rack 1 Level 2',
    minQuantity: 100,
    maxQuantity: 500,
    reorderPoint: 150,
    parLevel: 300,
    safetyStock: 50,
    leadTimeDays: 3,
    isActive: true,
    isStocked: true,
    currentQuantity: 350,
    lastReceiptDate: new Date('2024-10-10'),
    lastIssueDate: new Date('2024-10-19'),
    assignedAt: new Date('2024-01-10'),
    assignedBy: 'admin'
  },
  {
    id: 'pla-021',
    productId: 'prod-011',
    productCode: 'GARLIC-01',
    productName: 'Fresh Garlic',
    categoryName: 'Produce',
    baseUnit: 'kg',
    locationId: 'loc-004',
    shelfId: 'sh-006',
    shelfName: 'Rack 1 Level 2',
    minQuantity: 20,
    maxQuantity: 100,
    reorderPoint: 35,
    parLevel: 60,
    safetyStock: 10,
    leadTimeDays: 3,
    isActive: true,
    isStocked: true,
    currentQuantity: 72,
    lastReceiptDate: new Date('2024-10-08'),
    lastIssueDate: new Date('2024-10-18'),
    assignedAt: new Date('2024-01-10'),
    assignedBy: 'admin'
  },
  {
    id: 'pla-022',
    productId: 'prod-012',
    productCode: 'SALMON-FLT-01',
    productName: 'Salmon Fillet Fresh',
    categoryName: 'Seafood',
    baseUnit: 'kg',
    locationId: 'loc-004',
    shelfId: 'sh-007',
    shelfName: 'Warehouse Cold Storage',
    minQuantity: 30,
    maxQuantity: 150,
    reorderPoint: 50,
    parLevel: 100,
    safetyStock: 20,
    leadTimeDays: 2,
    isActive: true,
    isStocked: true,
    currentQuantity: 85,
    lastReceiptDate: new Date('2024-10-18'),
    lastIssueDate: new Date('2024-10-20'),
    assignedAt: new Date('2024-01-10'),
    assignedBy: 'admin'
  },
  {
    id: 'pla-023',
    productId: 'prod-002',
    productCode: 'CHKN-BRST-01',
    productName: 'Chicken Breast Fresh',
    categoryName: 'Poultry',
    baseUnit: 'kg',
    locationId: 'loc-004',
    shelfId: 'sh-007',
    shelfName: 'Warehouse Cold Storage',
    minQuantity: 50,
    maxQuantity: 250,
    reorderPoint: 80,
    parLevel: 150,
    safetyStock: 25,
    leadTimeDays: 2,
    isActive: true,
    isStocked: true,
    currentQuantity: 180,
    lastReceiptDate: new Date('2024-10-17'),
    lastIssueDate: new Date('2024-10-20'),
    assignedAt: new Date('2024-01-10'),
    assignedBy: 'admin'
  },
  {
    id: 'pla-024',
    productId: 'prod-003',
    productCode: 'BEEF-TND-01',
    productName: 'Beef Tenderloin',
    categoryName: 'Beef',
    baseUnit: 'kg',
    locationId: 'loc-004',
    shelfId: 'sh-007',
    shelfName: 'Warehouse Cold Storage',
    minQuantity: 25,
    maxQuantity: 120,
    reorderPoint: 40,
    parLevel: 80,
    safetyStock: 15,
    leadTimeDays: 3,
    isActive: true,
    isStocked: true,
    currentQuantity: 95,
    lastReceiptDate: new Date('2024-10-15'),
    lastIssueDate: new Date('2024-10-19'),
    assignedAt: new Date('2024-01-10'),
    assignedBy: 'admin'
  }
]

// ====== MOCK DELIVERY POINTS ======

export const mockDeliveryPoints: DeliveryPoint[] = [
  {
    id: 'dp-001',
    locationId: 'loc-003',
    name: 'Central Kitchen - Main Entrance',
    code: 'CK-MAIN',
    description: 'Primary delivery point for all goods',
    address: {
      addressLine1: '123 Kitchen Way',
      addressLine2: 'Loading Dock A',
      city: 'Bangkok',
      postalCode: '10110',
      country: 'Thailand'
    },
    contactName: 'John Smith',
    contactPhone: '+66-2-123-4567',
    contactEmail: 'john.smith@company.com',
    deliveryInstructions: 'Ring bell at loading dock. Check-in at security first.',
    accessInstructions: 'Use side entrance from parking lot',
    operatingHours: {
      monday: { open: '06:00', close: '18:00' },
      tuesday: { open: '06:00', close: '18:00' },
      wednesday: { open: '06:00', close: '18:00' },
      thursday: { open: '06:00', close: '18:00' },
      friday: { open: '06:00', close: '18:00' },
      saturday: { open: '08:00', close: '14:00' },
      sunday: { isClosed: true, open: '', close: '' }
    },
    maxVehicleSize: 'truck',
    hasDockLeveler: true,
    hasForklift: true,
    isPrimary: true,
    isActive: true,
    createdAt: new Date('2024-01-15'),
    createdBy: 'admin'
  },
  {
    id: 'dp-002',
    locationId: 'loc-004',
    name: 'Main Warehouse - Receiving Dock',
    code: 'WH-RECV',
    description: 'Main receiving dock for large shipments',
    address: {
      addressLine1: '456 Warehouse Road',
      addressLine2: 'Dock 1-4',
      city: 'Bangkok',
      postalCode: '10120',
      country: 'Thailand'
    },
    contactName: 'Lisa Wong',
    contactPhone: '+66-2-234-5678',
    contactEmail: 'lisa.w@company.com',
    deliveryInstructions: 'Report to warehouse office on arrival',
    operatingHours: {
      monday: { open: '07:00', close: '19:00' },
      tuesday: { open: '07:00', close: '19:00' },
      wednesday: { open: '07:00', close: '19:00' },
      thursday: { open: '07:00', close: '19:00' },
      friday: { open: '07:00', close: '19:00' },
      saturday: { open: '08:00', close: '16:00' },
      sunday: { isClosed: true, open: '', close: '' }
    },
    maxVehicleSize: 'semi_trailer',
    hasDockLeveler: true,
    hasForklift: true,
    isPrimary: true,
    isActive: true,
    createdAt: new Date('2024-01-10'),
    createdBy: 'admin'
  },
  {
    id: 'dp-003',
    locationId: 'loc-003',
    name: 'Bar - Service Entrance',
    code: 'BAR-SVC',
    description: 'Service entrance for bar deliveries',
    address: {
      addressLine1: '789 Restaurant Street',
      addressLine2: 'Service Door',
      city: 'Bangkok',
      postalCode: '10330',
      country: 'Thailand'
    },
    contactName: 'James Wilson',
    contactPhone: '+66-2-345-6789',
    contactEmail: 'james.w@company.com',
    deliveryInstructions: 'Deliveries before 11am only',
    operatingHours: {
      monday: { open: '08:00', close: '11:00' },
      tuesday: { open: '08:00', close: '11:00' },
      wednesday: { open: '08:00', close: '11:00' },
      thursday: { open: '08:00', close: '11:00' },
      friday: { open: '08:00', close: '11:00' },
      saturday: { open: '08:00', close: '11:00' },
      sunday: { isClosed: true, open: '', close: '' }
    },
    maxVehicleSize: 'small_van',
    hasDockLeveler: false,
    hasForklift: false,
    isPrimary: true,
    isActive: true,
    createdAt: new Date('2024-02-01'),
    createdBy: 'admin'
  }
]

// ====== HELPER FUNCTIONS ======

/**
 * Get location by ID
 */
export function getInventoryLocationById(id: string): InventoryLocation | undefined {
  return mockInventoryLocations.find(loc => loc.id === id)
}

/**
 * Get locations by type
 */
export function getInventoryLocationsByType(type: InventoryLocationType): InventoryLocation[] {
  return mockInventoryLocations.filter(loc => loc.type === type)
}

/**
 * Get shelves for a location
 */
export function getShelvesForLocation(locationId: string): Shelf[] {
  return mockShelves.filter(shelf => shelf.locationId === locationId)
}

/**
 * Get user assignments for a location
 */
export function getUserAssignmentsForLocation(locationId: string): UserLocationAssignment[] {
  return mockUserLocationAssignments.filter(ua => ua.locationId === locationId)
}

/**
 * Get product assignments for a location
 */
export function getProductAssignmentsForLocation(locationId: string): ProductLocationAssignment[] {
  return mockProductLocationAssignments.filter(pa => pa.locationId === locationId)
}

/**
 * Get delivery points for a location
 */
export function getDeliveryPointsForLocation(locationId: string): DeliveryPoint[] {
  return mockDeliveryPoints.filter(dp => dp.locationId === locationId)
}

/**
 * Get location summary for list view
 */
export function getInventoryLocationSummaries(): InventoryLocationSummary[] {
  return mockInventoryLocations.map(loc => ({
    id: loc.id,
    code: loc.code,
    name: loc.name,
    type: loc.type,
    status: loc.status,
    physicalCountEnabled: loc.physicalCountEnabled,
    totalProducts: loc.assignedProductsCount,
    totalUsers: loc.assignedUsersCount,
    totalShelves: loc.shelvesCount,
    departmentName: loc.departmentName
  }))
}

/**
 * Get active locations only
 */
export function getActiveInventoryLocations(): InventoryLocation[] {
  return mockInventoryLocations.filter(loc => loc.status === 'active')
}

/**
 * Get all delivery points
 */
export function getAllDeliveryPoints(): DeliveryPoint[] {
  return mockDeliveryPoints
}

/**
 * Get active delivery points
 */
export function getActiveDeliveryPoints(): DeliveryPoint[] {
  return mockDeliveryPoints.filter(dp => dp.isActive)
}
