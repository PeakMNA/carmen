/**
 * Centralized Mock Data - Main Barrel Export File
 *
 * This file serves as the single source of truth for all mock data
 * used throughout the Carmen ERP application.
 *
 * Import usage:
 * import { mockUsers, mockVendors, mockProducts } from '@/lib/mock-data'
 *
 * ============================================================================
 * TRANSACTION CODE FORMAT STANDARD
 * ============================================================================
 *
 * All transaction codes in mock data follow the format:
 *
 *   PREFIX-YYMM-NNNN
 *
 * Where:
 *   - PREFIX: Document type identifier (2-4 uppercase letters)
 *   - YY: Two-digit year (e.g., 24 for 2024)
 *   - MM: Two-digit month (e.g., 10 for October)
 *   - NNNN: Sequential number (3-4 digits, e.g., 001, 0089)
 *
 * Standard Prefixes:
 *   - PR:  Purchase Request        - PO:  Purchase Order
 *   - GRN: Goods Received Note     - CN:  Credit Note
 *   - SR:  Store Requisition       - TRF: Transfer / Replenishment
 *   - ADJ: Inventory Adjustment    - WR:  Wastage Report
 *   - SC:  Spot Check              - PC:  Physical Count
 *   - INV: Invoice                 - PL:  Pricelist
 *   - CNT: Contract                - TXN: Transaction
 *   - REQ: Requisition
 *
 * Examples:
 *   - PR-2410-001: Purchase Request #001 from October 2024
 *   - GRN-2410-045: Goods Received Note #045 from October 2024
 *
 * ============================================================================
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

// Transaction categories mock data (for inventory adjustments)
export * from './transaction-categories'

// Recipe master data (Equipment and Recipe Units)
export * from './recipe-masters'

// Product unit configurations (for price normalization and MOQ validation)
export * from './product-unit-configs'

// Document sequence generation utilities
export * from './document-sequences'

// Store Requisitions, Stock Transfers, Stock Issues mock data
export * from './store-requisitions'