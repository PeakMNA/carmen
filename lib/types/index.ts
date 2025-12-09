/**
 * Centralized Type Definitions - Main Barrel Export File
 *
 * This file serves as the single source of truth for all TypeScript interfaces
 * and types used throughout the Carmen ERP application.
 *
 * Import usage:
 * import { User, Vendor, PurchaseRequest, DocumentStatus } from '@/lib/types'
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
  RecipeYieldVariant
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

// Type utilities and guards
export * from './guards'
export * from './converters'
export * from './validators'
