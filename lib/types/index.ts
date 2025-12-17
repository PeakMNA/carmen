/**
 * Centralized Type Definitions - Main Barrel Export File
 *
 * This file serves as the single source of truth for all TypeScript interfaces
 * and types used throughout the Carmen ERP application.
 *
 * Import usage:
 * import { User, Vendor, PurchaseRequest, DocumentStatus } from '@/lib/types'
 *
 * ============================================================================
 * TRANSACTION CODE FORMAT STANDARD
 * ============================================================================
 *
 * All transaction codes in the Carmen ERP system follow the format:
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
 *   - PR:  Purchase Request
 *   - PO:  Purchase Order
 *   - GRN: Goods Received Note
 *   - CN:  Credit Note
 *   - SR:  Store Requisition
 *   - TRF: Transfer / Stock Replenishment
 *   - ADJ: Inventory Adjustment
 *   - WR:  Wastage Report
 *   - SC:  Spot Check
 *   - PC:  Physical Count
 *   - INV: Invoice
 *   - PL:  Pricelist
 *   - CNT: Contract
 *   - TXN: Transaction
 *
 * Examples:
 *   - PR-2410-001: Purchase Request #001 from October 2024
 *   - GRN-2410-045: Goods Received Note #045 from October 2024
 *   - SC-2410-042: Spot Check #042 from October 2024
 *
 * ============================================================================
 */

// =============================================================================
// CORE TYPES (Primary Sources - Export First)
// =============================================================================

// Common shared types (PRIMARY SOURCE for: Money, FileAttachment, ApiResponse, SortConfig)
export * from './common'

// User and authentication types
// NOTE: Exclude Money export from user.ts (already exported from common.ts)
export type {
  User,
  Role,
  Department,
  Location
} from './user'

// Inventory management types
// NOTE: Exclude InventoryAlert (defined in fractional-inventory.ts)
export type {
  InventoryItem,
  InventoryTransaction,
  TransactionType
} from './inventory'

export { CostingMethod } from './inventory'

// Procurement types
// NOTE: Exclude CostCenter (from finance), CreditNote/CreditNoteItem (from credit-note)
export type {
  PurchaseRequest,
  PurchaseRequestItem,
  PurchaseRequestPriority,
  PurchaseRequestType,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderTerms,
  GoodsReceiveNote,
  GoodsReceiveNoteItem,
  Requestor
} from './procurement'

export { GRNStatus, PurchaseOrderStatus, PRType, PRStatus, WorkflowStage } from './procurement'

// Vendor management types (PRIMARY SOURCE for VendorStatus)
export type {
  Vendor,
  VendorContact,
  VendorCertification,
  VendorStatus,
  VendorCategory,
  VendorPriceList,
  VendorPriceListItem,
  VolumeDiscount,
  PriceListStatus
} from './vendor'

// Product management types (PRIMARY SOURCE for ProductCategory)
export type {
  Product,
  ProductSpecification,
  ProductCategory,
  ProductStatus,
  ProductUnit,
  CategoryType,
  CategoryItem,
  CategoryDragItem,
  CategoryTreeOperations
} from './product'

// Recipe and operational planning types
// NOTE: Exclude IngredientCostDetail (from enhanced-costing-engine)
export type {
  Recipe,
  RecipeCategory,
  CuisineType,
  RecipeStatus,
  RecipeCostBreakdown,
  Ingredient,
  PreparationStep,
  RecipeYieldVariant,
  // Equipment Management
  Equipment,
  EquipmentStatus,
  EquipmentCategory,
  // Recipe Units Management
  RecipeUnit,
  UnitConversion
} from './recipe'

// Finance types (PRIMARY SOURCE for Currency, CostCenter)
export type {
  Currency,
  Invoice,
  Payment,
  PaymentMethod,
  PaymentStatus,
  InvoiceStatus,
  ExchangeRate,
  CostCenter
} from './finance'

export { ExchangeRateSource } from './finance'

// Settings and preferences types (PRIMARY SOURCE for NotificationSettings)
export type {
  NotificationSettings,
  NotificationPreference,
  NotificationEventType,
  ThemeMode,
  DisplaySettings,
  RegionalSettings,
  Language,
  AccessibilitySettings,
  UserPreferences,
  DateFormat,
  TimeFormat,
  NumberFormat,
  FirstDayOfWeek,
  SecuritySettings,
  PasswordPolicy,
  SessionSettings,
  TwoFactorSettings,
  TwoFactorMethod,
  IPAccessControl,
  AuditEventType,
  CompanySettings,
  InventorySettings,
  EmailConfiguration,
  BackupSettings,
  DataRetentionSettings,
  IntegrationSettings,
  ApplicationSettings
} from './settings'

// =============================================================================
// SPECIALIZED MODULE TYPES
// =============================================================================

// Mock data type extensions (for development/prototyping)
export * from './mock'

// Menu engineering types
export * from './menu-engineering'

// POS Recipe Mapping types
export * from './pos-recipe-mapping'

// POS Integration types
// NOTE: Exclude FileAttachment (already exported from common.ts)
export type {
  POSTransaction,
  POSTransactionLineItem,
  PendingTransaction,
  TransactionError,
  TransactionAuditLog,
  InventoryImpactPreview,
  ErrorCategory,
  POSMapping,
  POSItem,
  RecipeSearchResult,
  MappingPreview
} from './pos-integration'

// Credit note types (PRIMARY SOURCE for CreditNote, CreditNoteItem)
export * from './credit-note'

// Fractional inventory (PRIMARY SOURCE for InventoryAlert)
export * from './fractional-inventory'

// Enhanced PR types
// NOTE: Exclude Currency (from finance), VendorComparison (from price-management)
export type {
  EnhancedPRItem
} from './enhanced-pr-types'

// Enhanced consumption tracking
export * from './enhanced-consumption-tracking'

// Enhanced costing engine (PRIMARY SOURCE for IngredientCostDetail)
export * from './enhanced-costing-engine'

// Count allocation
export * from './count-allocation'

// Hotel types
export * from './hotel'

// Campaign management types
// NOTE: Exclude VendorFilters (from vendor-price-management)
export type {
  PriceCollectionCampaign,
  CampaignTemplate,
  RecurringPattern,
  CampaignProgress,
  CampaignSettings,
  ReminderSchedule,
  CampaignVendorStatus,
  CampaignAnalytics,
  CreateCampaignRequest,
  UpdateCampaignRequest,
  CampaignDuplicationRequest,
  CampaignValidationResult,
  CampaignPreview,
  CampaignManagementService,
  CampaignFilters
} from './campaign-management'

// Business rules types (PRIMARY SOURCE for BusinessRule, RuleAction, RuleCondition)
export * from './business-rules'

// Price management types
// NOTE: Exclude BusinessRule, RuleAction, RuleCondition (from business-rules)
// NOTE: Exclude Currency (from finance), ProductCategory (from product), VendorComparison (exported from enhanced-pr-types)
export type {
  VendorComparison,
  ComparisonMetrics,
  PriceAssignmentContext,
  VendorPriceOption,
  PriceAssignmentResult
} from './price-management'

// Vendor price management
// NOTE: Exclude ApiResponse, SortConfig (from common), NotificationSettings (from settings), VendorStatus (from vendor)
export type {
  VendorPriceManagement,
  VendorFilters
} from './vendor-price-management'

// =============================================================================
// TYPE UTILITIES
// =============================================================================

// Location management types
export * from './location-management'

// Period end types
export * from './period-end'

// Transaction category types (for inventory adjustments)
export * from './transaction-category'

// Wastage report types (store operations)
export * from './wastage'

// Unit conversion and PR auto-pricing types
export * from './unit-conversion'

// Type utilities and guards
export * from './guards'
export * from './converters'
export * from './validators'
