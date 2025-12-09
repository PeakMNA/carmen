/**
 * Centralized Mock Data - Main Barrel Export File
 * 
 * This file serves as the single source of truth for all mock data
 * used throughout the Carmen ERP application.
 * 
 * Import usage:
 * import { mockUsers, mockVendors, mockProducts } from '@/lib/mock-data'
 */

// Core entity mock data - excluding conflicting exports from users
export { mockUsers } from './users'
export * from './inventory'
export * from './procurement'
export * from './vendors'
export * from './products'
export * from './recipes'
export * from './finance'
export * from './settings'
export * from './pos-transactions'
export * from './pos-mappings'
export * from './campaigns'
export * from './pricelists'
export * from './workflow-config'
export * from './stock-movements'
export * from './inventory-balance'
export * from './transactions'
export * from './stock-cards'
export * from './categories'
export * from './cuisines'
// Export mockIngredients and mockBaseRecipes from recipe-management (mockRecipes is in ./recipes)
export { mockIngredients, mockBaseRecipes } from './recipe-management'

// Export roles, departments, locations and helper functions from users for compatibility
export { 
  mockRoles,
  mockDepartments,
  mockLocations,
  getMockUserById,
  getMockUsersByRole,
  getMockUsersByDepartment,
  getMockRoleById,
  getMockDepartmentById,
  getMockLocationById,
  getLocationsByDepartment
} from './users'

// Mock data factories
export * from './factories'

// Test scenarios
export * from './test-scenarios'

// Policy builder and ABAC system mock data
export * from './policy-builder-attributes'
export * from './policy-builder-sample-actions'
export * from './policy-builder-templates'
export * from './policy-builder-sample-policies'

// Permission system mock data - explicit exports to avoid conflicts
export {
  // Permission roles and policies
  allMockPolicies,
  roleBasedPolicies,
  roleBasedTemplates,
  rolePermissionMappings,
  getRolePermissions,
  roleHasPermission,
  getRoleRestrictions,
  getRoleApprovalLimit,
  type RolePermissions
} from './permission-index'

// Export additional permission functionality
export {
  mockRoleAssignments,
  getRoleHierarchy,
  getInheritedPermissions,
  getUserRoles,
  getUserDepartments,
  getUserLocations,
  type RoleAssignment
} from './permission-roles'

// Export permission-policies with explicit exports to avoid PolicyTemplate conflict
// Note: allMockPolicies is exported from permission-index instead
export {
  procurementPolicies,
  inventoryPolicies,
  vendorPolicies,
  policyTemplates,
  searchPolicies,
  getPoliciesByCategory,
  getPoliciesByResource,
  getActivePolicies
} from './permission-policies'

export * from './permission-subscriptions'

// Inventory locations and related mock data
export * from './inventory-locations'

// Spot check mock data
export * from './spot-checks'

// Stock replenishment mock data
export * from './stock-replenishment'

// Period end mock data
export * from './periods'