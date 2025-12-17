/**
 * Location Management Types
 *
 * Types and interfaces for inventory location management,
 * shelves, user/product assignments, and delivery points.
 */

// ====== ENUMS ======

/**
 * Inventory location types based on accounting treatment
 * - inventory: Standard warehouse/storage with full tracking
 * - direct: Production areas with immediate expense treatment
 * - consignment: Vendor-owned inventory until consumed
 */
export enum InventoryLocationType {
  INVENTORY = 'inventory',
  DIRECT = 'direct',
  CONSIGNMENT = 'consignment'
}

/**
 * Storage zone types within a location
 */
export enum StorageZoneType {
  DRY = 'dry',
  COLD = 'cold',
  FROZEN = 'frozen',
  AMBIENT = 'ambient',
  CONTROLLED = 'controlled'
}

/**
 * Location status for lifecycle management
 */
export type LocationStatus = 'active' | 'inactive' | 'closed' | 'pending_setup'

/**
 * User roles specific to location operations
 */
export type LocationUserRole =
  | 'location_manager'
  | 'inventory_controller'
  | 'receiver'
  | 'picker'
  | 'counter'
  | 'viewer'

/**
 * Granular permissions for location operations
 */
export type LocationPermission =
  | 'location:view'
  | 'location:edit'
  | 'inventory:view'
  | 'inventory:receive'
  | 'inventory:issue'
  | 'inventory:adjust'
  | 'inventory:transfer'
  | 'count:view'
  | 'count:participate'
  | 'count:finalize'
  | 'shelf:manage'

// ====== CONFIGURATION INTERFACES ======

/**
 * Inventory behavior configuration per location type
 */
export interface InventoryLocationConfig {
  requiresStockIn: boolean
  allowsPhysicalCount: boolean
  tracksBatchNumbers: boolean
  tracksExpiryDates: boolean
  expenseOnReceipt: boolean
  eopEnabled: boolean
  eopCutoffDay?: number
  costingMethod?: 'FIFO' | 'PERIODIC_AVERAGE'
}

/**
 * Time range for operating hours
 */
export interface TimeRange {
  open: string
  close: string
  isClosed?: boolean
}

/**
 * Operating hours by day of week
 */
export interface OperatingHours {
  monday?: TimeRange
  tuesday?: TimeRange
  wednesday?: TimeRange
  thursday?: TimeRange
  friday?: TimeRange
  saturday?: TimeRange
  sunday?: TimeRange
}

// ====== MAIN ENTITIES ======

/**
 * Inventory Location - Main entity for location management
 */
export interface InventoryLocation {
  id: string
  code: string // Unique, max 10 chars, uppercase alphanumeric
  name: string // Unique, max 100 chars
  description?: string

  type: InventoryLocationType
  status: LocationStatus
  physicalCountEnabled: boolean
  inventoryConfig: InventoryLocationConfig

  // For consignment locations
  consignmentVendorId?: string
  consignmentVendorName?: string

  // Delivery point reference
  deliveryPointId?: string
  deliveryPointName?: string

  // Counts for summary display
  shelvesCount: number
  assignedUsersCount: number
  assignedProductsCount: number

  // Audit fields
  createdAt: Date
  createdBy: string
  updatedAt?: Date
  updatedBy?: string
}

/**
 * Shelf - Sub-location/storage area within an inventory location
 */
export interface Shelf {
  id: string
  locationId: string
  code: string // Unique within location, max 20 chars
  name: string
  description?: string

  zoneType: StorageZoneType

  capacity?: {
    maxWeight?: number
    maxWeightUnit?: string
    maxVolume?: number
    maxVolumeUnit?: string
    maxUnits?: number
  }

  position?: {
    aisle?: string
    row?: string
    level?: number
    bay?: string
  }

  isActive: boolean
  sortOrder: number

  // Audit fields
  createdAt: Date
  createdBy: string
  updatedAt?: Date
  updatedBy?: string
}

/**
 * User-Location Assignment - Links users to locations with roles
 */
export interface UserLocationAssignment {
  id: string
  userId: string
  userName: string
  userEmail: string
  locationId: string

  roleAtLocation: LocationUserRole
  permissions: LocationPermission[]

  isPrimary: boolean
  isActive: boolean

  effectiveFrom?: Date
  effectiveTo?: Date

  // Audit fields
  assignedAt: Date
  assignedBy: string
}

/**
 * Product-Location Assignment - Links products to locations with inventory parameters
 */
export interface ProductLocationAssignment {
  id: string
  productId: string
  productCode: string
  productName: string
  categoryName: string
  baseUnit: string
  locationId: string

  // Default shelf for this product at this location
  shelfId?: string
  shelfName?: string
  binCode?: string

  // Inventory parameters
  minQuantity: number
  maxQuantity: number
  reorderPoint: number
  parLevel: number
  safetyStock?: number
  leadTimeDays?: number

  // For consignment products
  consignmentVendorId?: string
  consignmentPrice?: number

  isActive: boolean
  isStocked: boolean

  // Current stock info (read-only, from inventory)
  currentQuantity?: number
  lastReceiptDate?: Date
  lastIssueDate?: Date

  // Audit fields
  assignedAt: Date
  assignedBy: string
  updatedAt?: Date
  updatedBy?: string
}

/**
 * Delivery Point - Centralized delivery address definition
 *
 * Represents a physical location where vendors can deliver goods.
 * Referenced by inventory locations via deliveryPointId for procurement.
 *
 * @see docs/app/system-administration/delivery-points/BR-delivery-points.md
 *
 * BR-DP: Simplified to name and status only per business requirements.
 * Previously had complex fields (address, contacts, logistics) - now simplified.
 *
 * Business Rules:
 * - BR-003: Only active delivery points appear in location assignment dropdowns
 *
 * @property {string} id - Unique identifier (UUID)
 * @property {string} name - Display name (required, unique)
 * @property {boolean} isActive - Whether available for selection in lookups
 * @property {Date} createdAt - Record creation timestamp
 * @property {string} createdBy - User who created the record
 * @property {Date} [updatedAt] - Last update timestamp
 * @property {string} [updatedBy] - User who last updated the record
 */
export interface DeliveryPoint {
  /** Unique identifier (UUID) */
  id: string
  /** Display name - required, used in location dropdowns */
  name: string
  /** Active status - inactive points excluded from lookups (BR-003) */
  isActive: boolean
  // ====== AUDIT FIELDS ======
  /** Record creation timestamp */
  createdAt: Date
  /** User who created the record */
  createdBy: string
  /** Last update timestamp */
  updatedAt?: Date
  /** User who last updated the record */
  updatedBy?: string
}

// ====== CONSTANTS ======

/**
 * Location Type Configuration Defaults
 */
export const LOCATION_TYPE_DEFAULTS: Record<InventoryLocationType, InventoryLocationConfig> = {
  [InventoryLocationType.INVENTORY]: {
    requiresStockIn: true,
    allowsPhysicalCount: true,
    tracksBatchNumbers: true,
    tracksExpiryDates: true,
    expenseOnReceipt: false,
    eopEnabled: true,
    costingMethod: 'FIFO'
  },
  [InventoryLocationType.DIRECT]: {
    requiresStockIn: false,
    allowsPhysicalCount: false,
    tracksBatchNumbers: false,
    tracksExpiryDates: false,
    expenseOnReceipt: true,
    eopEnabled: false,
    costingMethod: undefined
  },
  [InventoryLocationType.CONSIGNMENT]: {
    requiresStockIn: true,
    allowsPhysicalCount: true,
    tracksBatchNumbers: true,
    tracksExpiryDates: true,
    expenseOnReceipt: false,
    eopEnabled: true,
    costingMethod: 'FIFO'
  }
}

/**
 * Location type display labels
 */
export const LOCATION_TYPE_LABELS: Record<InventoryLocationType, string> = {
  [InventoryLocationType.INVENTORY]: 'Inventory',
  [InventoryLocationType.DIRECT]: 'Direct',
  [InventoryLocationType.CONSIGNMENT]: 'Consignment'
}

/**
 * Location type descriptions for UI
 */
export const LOCATION_TYPE_DESCRIPTIONS: Record<InventoryLocationType, string> = {
  [InventoryLocationType.INVENTORY]: 'Standard warehouse/storage with full inventory tracking',
  [InventoryLocationType.DIRECT]: 'Production areas with immediate expense on receipt',
  [InventoryLocationType.CONSIGNMENT]: 'Vendor-owned inventory until consumed'
}

/**
 * Storage zone type labels
 */
export const STORAGE_ZONE_LABELS: Record<StorageZoneType, string> = {
  [StorageZoneType.DRY]: 'Dry Storage',
  [StorageZoneType.COLD]: 'Cold Storage',
  [StorageZoneType.FROZEN]: 'Frozen Storage',
  [StorageZoneType.AMBIENT]: 'Ambient',
  [StorageZoneType.CONTROLLED]: 'Controlled Environment'
}

/**
 * Location user role labels
 */
export const LOCATION_ROLE_LABELS: Record<LocationUserRole, string> = {
  location_manager: 'Location Manager',
  inventory_controller: 'Inventory Controller',
  receiver: 'Receiver',
  picker: 'Picker',
  counter: 'Counter',
  viewer: 'Viewer'
}

// ====== FORM TYPES ======

/**
 * Location form data for create/edit
 */
export interface LocationFormData {
  code: string
  name: string
  description?: string
  type: InventoryLocationType
  physicalCountEnabled: boolean
  status: LocationStatus
  consignmentVendorId?: string
}

/**
 * Shelf form data for create/edit
 */
export interface ShelfFormData {
  code: string
  name: string
  description?: string
  zoneType: StorageZoneType
  isActive: boolean
  sortOrder: number
  capacity?: {
    maxWeight?: number
    maxWeightUnit?: string
    maxVolume?: number
    maxVolumeUnit?: string
    maxUnits?: number
  }
  position?: {
    aisle?: string
    row?: string
    level?: number
    bay?: string
  }
}

/**
 * Delivery Point Form Data - Create/Edit form fields
 *
 * Used by FR-DP-002 (Create) and FR-DP-003 (Edit) dialogs.
 * BR-DP: Simplified to name and status only per business requirements.
 *
 * @property {string} name - Required, display name for the delivery point
 * @property {boolean} isActive - Default: true (Active)
 */
export interface DeliveryPointFormData {
  /** Required - display name for the delivery point */
  name: string
  /** Default: true (FR-DP-002) */
  isActive: boolean
}

// ====== FILTER TYPES ======

/**
 * Location list filters
 */
export interface LocationFilters {
  search: string
  type: InventoryLocationType | 'all'
  status: LocationStatus | 'all'
  physicalCountEnabled: boolean | 'all'
}

// ====== SUMMARY TYPES ======

/**
 * Summary view for location list
 */
export interface InventoryLocationSummary {
  id: string
  code: string
  name: string
  type: InventoryLocationType
  status: LocationStatus
  physicalCountEnabled: boolean
  totalProducts: number
  totalUsers: number
  totalShelves: number
}
