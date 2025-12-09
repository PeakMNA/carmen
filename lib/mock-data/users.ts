/**
 * User Mock Data
 * 
 * Centralized mock data for users, roles, departments, and locations.
 */

import { User, Role, Department, Location, Money } from '../types'
import { mockRoles as permissionRoles, mockDepartments as permissionDepartments, mockLocations as permissionLocations } from './permission-roles'

// ====== ROLES ======
// Re-export roles from permission system for compatibility
export const mockRoles: Role[] = permissionRoles;

// ====== DEPARTMENTS ======
// Re-export departments from permission system for compatibility
export const mockDepartments: Department[] = permissionDepartments;

// ====== LOCATIONS ======
// Re-export locations from permission system for compatibility
export const mockLocations: Location[] = permissionLocations;

// ====== USERS ======

export const mockUsers: User[] = [
  {
    id: 'user-default-001',
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/avatars/default.png',
    availableRoles: mockRoles,
    availableDepartments: mockDepartments,
    availableLocations: mockLocations,
    // Permission-related fields
    roles: [mockRoles.find(r => r.id === 'role-013')!], // Store Staff
    primaryRole: mockRoles.find(r => r.id === 'role-013')!,
    departments: [mockDepartments.find(d => d.id === 'dept-001')!], // Administration
    locations: [mockLocations.find(l => l.id === 'loc-006')!], // Corporate Office
    clearanceLevel: 'basic',
    effectiveFrom: new Date('2024-01-01'),
    effectiveTo: new Date('2025-12-31'),
    accountStatus: 'active',
    isHod: false,
    businessUnit: 'operations',
    specialPermissions: [],
    delegatedAuthorities: [],
    effectivePermissions: [
      'store_requisition:create', 'inventory_item:view_availability',
      'wastage_report:create', 'product:view'
    ],
    // Legacy compatibility fields
    role: 'role-013',
    department: 'dept-001',
    location: 'loc-006',
    assignedWorkflowStages: [],
    context: {
      currentRole: mockRoles.find(r => r.id === 'role-013')!,
      currentDepartment: mockDepartments.find(d => d.id === 'dept-001')!,
      currentLocation: mockLocations.find(l => l.id === 'loc-006')!,
      showPrices: false,
      showSystemQuantity: true,
    }
  },
  {
    id: 'user-chef-001',
    name: 'Chef Maria Rodriguez',
    email: 'maria.rodriguez@grandhotel.com',
    avatar: '/avatars/maria-rodriguez.png',
    availableRoles: mockRoles,
    availableDepartments: mockDepartments,
    availableLocations: mockLocations,
    // Permission-related fields
    roles: [mockRoles.find(r => r.id === 'role-007')!, mockRoles.find(r => r.id === 'role-011')!],
    primaryRole: mockRoles.find(r => r.id === 'role-007')!,
    departments: [mockDepartments.find(d => d.id === 'dept-003')!],
    locations: [mockLocations.find(l => l.id === 'loc-002')!, mockLocations.find(l => l.id === 'loc-003')!],
    approvalLimit: { amount: 15000, currency: 'USD' } as Money,
    clearanceLevel: 'confidential',
    effectiveFrom: new Date('2023-01-15'),
    effectiveTo: new Date('2025-12-31'),
    accountStatus: 'active',
    isHod: true,
    businessUnit: 'operations',
    specialPermissions: ['recipe-confidential-access'],
    delegatedAuthorities: ['recipe-modifications', 'kitchen-operations-override'],
    effectivePermissions: [
      'recipe:*', 'menu_item:*', 'recipe_category:*', 'cuisine_type:*',
      'production_order:*', 'batch_production:*', 'quality_control:*'
    ],
    // Legacy compatibility fields
    role: 'role-007',
    department: 'dept-003',
    location: 'loc-002',
    assignedWorkflowStages: ['departmentHeadApproval'],
    context: {
      currentRole: mockRoles.find(r => r.id === 'role-007')!,
      currentDepartment: mockDepartments.find(d => d.id === 'dept-003')!,
      currentLocation: mockLocations.find(l => l.id === 'loc-002')!,
      showPrices: true,
      showSystemQuantity: true,
    }
  },
  {
    id: 'user-manager-001',
    name: 'John Smith',
    email: 'john.smith@grandhotel.com',
    avatar: '/avatars/john-smith.png',
    availableRoles: mockRoles,
    availableDepartments: mockDepartments,
    availableLocations: mockLocations,
    // Permission-related fields
    roles: [mockRoles.find(r => r.id === 'role-002')!],
    primaryRole: mockRoles.find(r => r.id === 'role-002')!,
    departments: [mockDepartments.find(d => d.id === 'dept-001')!],
    locations: [mockLocations.find(l => l.id === 'loc-001')!, mockLocations.find(l => l.id === 'loc-002')!],
    approvalLimit: { amount: 50000, currency: 'USD' } as Money,
    clearanceLevel: 'secret',
    effectiveFrom: new Date('2022-06-01'),
    effectiveTo: new Date('2025-12-31'),
    accountStatus: 'active',
    isHod: true,
    businessUnit: 'management',
    specialPermissions: ['emergency-access-override', 'cross-department-access'],
    delegatedAuthorities: ['purchase-request-approval', 'user-management', 'budget-approval'],
    effectivePermissions: [
      'purchase_request:*', 'purchase_order:*', 'budget:*', 'financial_report:*',
      'user:create', 'user:update', 'user:assign_role', 'workflow:configure'
    ],
    // Legacy compatibility fields
    role: 'role-002',
    department: 'dept-001',
    location: 'loc-001',
    assignedWorkflowStages: ['departmentHeadApproval', 'financeManagerApproval'],
    context: {
      currentRole: mockRoles.find(r => r.id === 'role-002')!,
      currentDepartment: mockDepartments.find(d => d.id === 'dept-001')!,
      currentLocation: mockLocations.find(l => l.id === 'loc-001')!,
      showPrices: true,
      showSystemQuantity: true,
    }
  },
  {
    id: 'user-purchasing-001',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@grandhotel.com',
    avatar: '/avatars/sarah-johnson.png',
    availableRoles: mockRoles,
    availableDepartments: mockDepartments,
    availableLocations: mockLocations,
    // Permission-related fields
    roles: [mockRoles.find(r => r.id === 'role-009')!],
    primaryRole: mockRoles.find(r => r.id === 'role-009')!,
    departments: [mockDepartments.find(d => d.id === 'dept-002')!],
    locations: [mockLocations.find(l => l.id === 'loc-001')!, mockLocations.find(l => l.id === 'loc-004')!],
    approvalLimit: { amount: 10000, currency: 'USD' } as Money,
    clearanceLevel: 'basic',
    effectiveFrom: new Date('2023-03-10'),
    effectiveTo: new Date('2025-12-31'),
    accountStatus: 'active',
    isHod: false,
    businessUnit: 'operations',
    specialPermissions: [],
    delegatedAuthorities: ['purchase-order-creation'],
    effectivePermissions: [
      'purchase_order:create', 'purchase_order:update', 'purchase_order:send',
      'vendor:view', 'vendor_quotation:create', 'goods_receipt_note:create'
    ],
    // Legacy compatibility fields
    role: 'role-009',
    department: 'dept-002',
    location: 'loc-001',
    assignedWorkflowStages: ['purchaseReview'],
    context: {
      currentRole: mockRoles.find(r => r.id === 'role-009')!,
      currentDepartment: mockDepartments.find(d => d.id === 'dept-002')!,
      currentLocation: mockLocations.find(l => l.id === 'loc-001')!,
      showPrices: true,
      showSystemQuantity: true,
    }
  },
  {
    id: 'user-finance-001',
    name: 'Michael Chen',
    email: 'michael.chen@grandhotel.com',
    avatar: '/avatars/michael-chen.png',
    availableRoles: mockRoles,
    availableDepartments: mockDepartments,
    availableLocations: mockLocations,
    // Permission-related fields
    roles: [mockRoles.find(r => r.id === 'role-008')!],
    primaryRole: mockRoles.find(r => r.id === 'role-008')!,
    departments: [mockDepartments.find(d => d.id === 'dept-005')!],
    locations: [mockLocations.find(l => l.id === 'loc-001')!, mockLocations.find(l => l.id === 'loc-006')!],
    approvalLimit: { amount: 25000, currency: 'USD' } as Money,
    clearanceLevel: 'confidential',
    effectiveFrom: new Date('2022-01-20'),
    effectiveTo: new Date('2025-12-31'),
    accountStatus: 'active',
    isHod: true,
    businessUnit: 'finance',
    specialPermissions: ['financial-data-access'],
    delegatedAuthorities: ['financial-approval', 'payment-authorization'],
    effectivePermissions: [
      'invoice:*', 'payment:create', 'payment:approve',
      'journal_entry:*', 'account_code:*', 'financial_report:view'
    ],
    // Legacy compatibility fields
    role: 'role-008',
    department: 'dept-005',
    location: 'loc-006',
    assignedWorkflowStages: ['financeManagerApproval'],
    context: {
      currentRole: mockRoles.find(r => r.id === 'role-008')!,
      currentDepartment: mockDepartments.find(d => d.id === 'dept-005')!,
      currentLocation: mockLocations.find(l => l.id === 'loc-006')!,
      showPrices: true,
      showSystemQuantity: true,
    }
  },
  {
    id: 'user-warehouse-001',
    name: 'David Wilson',
    email: 'david.wilson@grandhotel.com',
    avatar: '/avatars/david-wilson.png',
    availableRoles: mockRoles,
    availableDepartments: mockDepartments,
    availableLocations: mockLocations,
    // Permission-related fields
    roles: [mockRoles.find(r => r.id === 'warehouse-manager')!],
    primaryRole: mockRoles.find(r => r.id === 'warehouse-manager')!,
    departments: [mockDepartments.find(d => d.id === 'procurement')!],
    locations: [mockLocations.find(l => l.id === 'central-warehouse')!],
    approvalLimit: { amount: 5000, currency: 'USD' } as Money,
    clearanceLevel: 'basic',
    effectiveFrom: new Date('2023-07-05'),
    effectiveTo: new Date('2025-12-31'),
    accountStatus: 'active',
    isHod: false,
    businessUnit: 'operations',
    specialPermissions: [],
    delegatedAuthorities: ['goods-receipt-management'],
    effectivePermissions: [
      'goods_receipt_note:*', 'inventory:view', 'inventory:update',
      'stock_transaction:create', 'warehouse:manage'
    ],
    // Legacy compatibility fields
    role: 'Warehouse Manager',
    department: 'Procurement',
    location: 'Central Warehouse',
    assignedWorkflowStages: [],
    context: {
      currentRole: mockRoles.find(r => r.id === 'warehouse-manager')!,
      currentDepartment: mockDepartments.find(d => d.id === 'procurement')!,
      currentLocation: mockLocations.find(l => l.id === 'central-warehouse')!,
      showPrices: true,
      showSystemQuantity: true,
    }
  },
  {
    id: 'user-staff-001',
    name: 'Emily Brown',
    email: 'emily.brown@grandhotel.com',
    avatar: '/avatars/emily-brown.png',
    availableRoles: mockRoles,
    availableDepartments: mockDepartments,
    availableLocations: mockLocations,
    // Permission-related fields
    roles: [mockRoles.find(r => r.id === 'staff')!],
    primaryRole: mockRoles.find(r => r.id === 'staff')!,
    departments: [mockDepartments.find(d => d.id === 'housekeeping')!],
    locations: [mockLocations.find(l => l.id === 'main-hotel')!],
    clearanceLevel: 'basic',
    effectiveFrom: new Date('2023-09-12'),
    effectiveTo: new Date('2025-12-31'),
    accountStatus: 'active',
    isHod: false,
    businessUnit: 'operations',
    specialPermissions: [],
    delegatedAuthorities: [],
    effectivePermissions: [
      'store_requisition:create', 'inventory:view'
    ],
    // Legacy compatibility fields
    role: 'Staff',
    department: 'Housekeeping',
    location: 'Grand Hotel Main',
    assignedWorkflowStages: [],
    context: {
      currentRole: mockRoles.find(r => r.id === 'staff')!,
      currentDepartment: mockDepartments.find(d => d.id === 'housekeeping')!,
      currentLocation: mockLocations.find(l => l.id === 'main-hotel')!,
      showPrices: false,
      showSystemQuantity: true,
    }
  },
  {
    id: 'user-counter-001',
    name: 'James Anderson',
    email: 'james.anderson@grandhotel.com',
    avatar: '/avatars/james-anderson.png',
    availableRoles: mockRoles,
    availableDepartments: mockDepartments,
    availableLocations: mockLocations,
    // Permission-related fields
    roles: [mockRoles.find(r => r.id === 'counter')!],
    primaryRole: mockRoles.find(r => r.id === 'counter')!,
    departments: [mockDepartments.find(d => d.id === 'fb')!],
    locations: [mockLocations.find(l => l.id === 'pool-bar')!],
    clearanceLevel: 'basic',
    effectiveFrom: new Date('2024-02-14'),
    effectiveTo: new Date('2025-12-31'),
    accountStatus: 'active',
    isHod: false,
    businessUnit: 'operations',
    specialPermissions: [],
    delegatedAuthorities: [],
    effectivePermissions: [
      'menu_item:view', 'recipe:view', 'production_order:create'
    ],
    // Legacy compatibility fields
    role: 'Counter Staff',
    department: 'Food & Beverage',
    location: 'Pool Bar & Grill',
    assignedWorkflowStages: [],
    context: {
      currentRole: mockRoles.find(r => r.id === 'counter')!,
      currentDepartment: mockDepartments.find(d => d.id === 'fb')!,
      currentLocation: mockLocations.find(l => l.id === 'pool-bar')!,
      showPrices: false,
      showSystemQuantity: true,
    }
  },
  {
    id: 'user-admin-001',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@grandhotel.com',
    avatar: '/avatars/lisa-thompson.png',
    availableRoles: mockRoles,
    availableDepartments: mockDepartments,
    availableLocations: mockLocations,
    // Permission-related fields
    roles: [mockRoles.find(r => r.id === 'admin')!],
    primaryRole: mockRoles.find(r => r.id === 'admin')!,
    departments: mockDepartments,
    locations: mockLocations,
    approvalLimit: { amount: 100000, currency: 'USD' } as Money,
    clearanceLevel: 'top-secret',
    effectiveFrom: new Date('2021-12-01'),
    effectiveTo: new Date('2025-12-31'),
    accountStatus: 'active',
    isHod: true,
    businessUnit: 'management',
    specialPermissions: ['system-admin', 'emergency-access-override', 'cross-department-access'],
    delegatedAuthorities: ['system-configuration', 'user-management', 'workflow-configuration'],
    effectivePermissions: ['*:*'],
    // Legacy compatibility fields
    role: 'System Administrator',
    department: 'Administration',
    location: 'Administrative Office',
    assignedWorkflowStages: ['gmApproval'],
    context: {
      currentRole: mockRoles.find(r => r.id === 'admin')!,
      currentDepartment: mockDepartments.find(d => d.id === 'administration')!,
      currentLocation: mockLocations.find(l => l.id === 'admin-office')!,
      showPrices: true,
      showSystemQuantity: true,
    }
  }
];

// ====== UTILITY FUNCTIONS ======

/**
 * Get user by ID
 */
export const getMockUserById = (id: string): User | undefined => {
  return mockUsers.find(user => user.id === id);
};

/**
 * Get users by role
 */
export const getMockUsersByRole = (roleId: string): User[] => {
  return mockUsers.filter(user => user.context.currentRole.id === roleId);
};

/**
 * Get users by department
 */
export const getMockUsersByDepartment = (departmentId: string): User[] => {
  return mockUsers.filter(user => user.context.currentDepartment.id === departmentId);
};

/**
 * Get role by ID
 */
export const getMockRoleById = (id: string): Role | undefined => {
  return mockRoles.find(role => role.id === id);
};

/**
 * Get department by ID
 */
export const getMockDepartmentById = (id: string): Department | undefined => {
  return mockDepartments.find(dept => dept.id === id);
};

/**
 * Get location by ID
 */
export const getMockLocationById = (id: string): Location | undefined => {
  return mockLocations.find(location => location.id === id);
};

/**
 * Get locations by department (legacy compatibility)
 */
export const getLocationsByDepartment = (department: string): Location[] => {
  // For now, return all locations since we don't have department filtering implemented
  return mockLocations;
};