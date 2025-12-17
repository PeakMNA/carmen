/**
 * Unit Conversion and PR Auto-Pricing Types
 *
 * This module defines types for:
 * - Product unit configurations for price normalization
 * - Vendor pricing with normalized values
 * - MOQ validation and alerts
 * - Vendor allocation and scoring
 */

import { Money } from './common'

// =============================================================================
// Product Unit Configuration Types
// =============================================================================

/**
 * Defines how a product can be ordered in different units and how those
 * units convert to the base inventory unit.
 *
 * Example:
 * - Product: Premium Coffee Beans
 * - Base Inventory Unit: KG
 * - Order Units: 1kg Bag (1.0), 500g Bag (0.5), 5kg Box (5.0)
 */
export interface ProductUnitConfiguration {
  /** Product ID this configuration applies to */
  productId: string

  /** The base unit used for inventory tracking (e.g., 'KG', 'L', 'PC') */
  baseInventoryUnit: string

  /** Display name for the base unit (e.g., 'Kilogram', 'Liter', 'Piece') */
  baseUnitDisplayName: string

  /** Alternative units this product can be ordered in */
  orderUnits: ProductOrderUnit[]
}

/**
 * Represents a single order unit option for a product.
 * Contains the conversion factor to the base inventory unit.
 */
export interface ProductOrderUnit {
  /** Unique code for this unit (e.g., 'BAG-500G', 'BOX-5KG') */
  unitCode: string

  /** Display name (e.g., '500g Bag', '5kg Box') */
  unitName: string

  /**
   * Conversion factor to base unit.
   * Example: For a 500g bag when base is KG, this would be 0.5
   * Formula: quantity_in_base = quantity_in_order_unit * conversionToBase
   */
  conversionToBase: number

  /** Whether this is the default order unit for this product */
  isDefault: boolean

  /** Optional description of the unit */
  description?: string
}

// =============================================================================
// Normalized Vendor Option Types
// =============================================================================

/**
 * Represents a vendor's pricing option with all values normalized
 * to the product's base inventory unit for comparison.
 */
export interface NormalizedVendorOption {
  /** Vendor identifier */
  vendorId: string

  /** Vendor display name */
  vendorName: string

  /** Price list ID this pricing comes from */
  priceListId: string

  /** Price list name for display */
  priceListName: string

  // --- Original Pricing ---

  /** Original unit price in vendor's selling unit */
  unitPrice: Money

  /** Vendor's selling unit code (e.g., 'BAG-500G') */
  sellingUnitCode: string

  /** Vendor's selling unit display name */
  sellingUnitName: string

  // --- Normalized Pricing (KEY for comparison) ---

  /** Price per base inventory unit - use this for comparison */
  pricePerBaseUnit: Money

  /** The base unit this is normalized to (e.g., 'KG') */
  baseUnit: string

  /** Conversion factor used (for display/audit) */
  conversionFactor: number

  // --- MOQ Information ---

  /** Minimum order quantity in vendor's selling unit */
  minimumOrderQuantity: number

  /** MOQ converted to base unit - use this for validation */
  moqInBaseUnit: number

  /** Whether the requested quantity meets this vendor's MOQ */
  meetsMinimumOrder: boolean

  /** Gap between requested quantity and MOQ (0 if meets MOQ) */
  moqGap: number

  // --- Vendor Preference Factors ---

  /** Is this vendor marked as preferred in vendor master? */
  isPreferredVendor: boolean

  /** Is this specific product a preferred item for this vendor? */
  isPreferredItem: boolean

  /** Vendor rating (1-5 scale) */
  rating: number

  /** Lead time in days */
  leadTimeDays: number

  /** Vendor's on-time delivery percentage */
  onTimeDeliveryRate?: number

  // --- Calculated Values ---

  /** Overall score based on allocation algorithm (0-100) */
  overallScore: number

  /** Rank among all options (1 = best) */
  rank: number

  /** Whether this vendor is the recommended choice */
  isRecommended: boolean

  // --- Price List Validity ---

  /** Price list valid from date */
  validFrom: Date

  /** Price list valid to date */
  validTo: Date

  /** Whether the price list is currently valid */
  isValid: boolean
}

// =============================================================================
// MOQ Alert Types
// =============================================================================

/** Severity levels for MOQ alerts */
export type MOQAlertSeverity = 'info' | 'warning' | 'error'

/**
 * Alert generated when a vendor's MOQ is not met.
 */
export interface MOQAlert {
  /** Vendor this alert is for */
  vendorId: string

  /** Vendor name for display */
  vendorName: string

  /** Gap in vendor's selling unit */
  gap: number

  /** Gap in base unit (for consistent messaging) */
  gapInBaseUnit: number

  /** Base unit for display */
  baseUnit: string

  /** Alert severity level */
  severity: MOQAlertSeverity

  /** Human-readable message */
  message: string

  /** Suggested quantity to meet MOQ (in base unit) */
  suggestedQuantity: number
}

// =============================================================================
// Vendor Recommendation Types
// =============================================================================

/** Factors that can lead to vendor recommendation */
export type RecommendationFactor =
  | 'preferred_item'      // Product locked to this vendor
  | 'preferred_vendor'    // Vendor is marked as preferred
  | 'best_price'          // Lowest normalized price
  | 'best_overall_score'  // Best weighted score considering all factors

/**
 * Explains why a particular vendor was recommended.
 */
export interface VendorRecommendationReason {
  /** Primary factor for recommendation */
  primaryFactor: RecommendationFactor

  /** Human-readable explanation */
  explanation: string

  /** Additional details for the recommendation */
  details?: {
    /** If best price, how much cheaper than next best */
    savingsAmount?: Money

    /** If best price, percentage savings vs next best */
    savingsPercentage?: number

    /** If preferred, the relationship type */
    preferredRelationship?: string

    /** Score breakdown for transparency */
    scoreBreakdown?: VendorScoreBreakdown
  }
}

/**
 * Breakdown of how a vendor's score was calculated.
 */
export interface VendorScoreBreakdown {
  /** Score from preferred item status (0 or 35) */
  preferredItemScore: number

  /** Score from preferred vendor status (0 or 25) */
  preferredVendorScore: number

  /** Score from price comparison (0-25) */
  priceScore: number

  /** Score from vendor rating (0-10) */
  ratingScore: number

  /** Score from lead time (0-5) */
  leadTimeScore: number

  /** Total score (sum of above) */
  totalScore: number
}

// =============================================================================
// PR Item Price Comparison Types
// =============================================================================

/**
 * Complete price comparison result for a PR item.
 * Contains all vendor options, recommendation, and alerts.
 */
export interface PRItemPriceComparison {
  /** PR Item ID this comparison is for */
  prItemId: string

  /** Product ID being compared */
  productId: string

  /** Product name for display */
  productName: string

  // --- Requested Quantity ---

  /** Quantity requested by user (in their selected unit) */
  requestedQuantity: number

  /** Unit the user requested in */
  requestedUnit: string

  /** Requested quantity converted to base unit */
  requestedQuantityInBaseUnit: number

  /** Base unit for this product */
  baseUnit: string

  // --- Vendor Options ---

  /** All available vendor options, sorted by score (best first) */
  vendorOptions: NormalizedVendorOption[]

  /** Count of vendors that meet MOQ */
  vendorsMeetingMOQ: number

  /** Total vendor count */
  totalVendors: number

  // --- Recommendation ---

  /** The recommended vendor (null if no valid options) */
  recommendedVendor: NormalizedVendorOption | null

  /** Reason for recommendation */
  recommendationReason: VendorRecommendationReason | null

  // --- MOQ Alerts ---

  /** Alerts for vendors where MOQ is not met */
  moqAlerts: MOQAlert[]

  /** Whether any vendors have MOQ warnings */
  hasMOQWarnings: boolean

  /** Whether all vendors fail MOQ (critical situation) */
  allVendorsFailMOQ: boolean

  // --- Price Range ---

  /** Lowest normalized price among all options */
  lowestPrice: Money | null

  /** Highest normalized price among all options */
  highestPrice: Money | null

  /** Potential savings if choosing best price */
  potentialSavings: Money | null

  // --- Metadata ---

  /** When this comparison was generated */
  generatedAt: Date

  /** Whether prices are from cache */
  fromCache: boolean

  /** Cache age in seconds (if from cache) */
  cacheAge?: number
}

// =============================================================================
// Manual Override Types
// =============================================================================

/** Predefined reasons for manual vendor override */
export type OverrideReasonType =
  | 'better_relationship'
  | 'quality_issues_with_recommended'
  | 'urgent_delivery_required'
  | 'volume_discount'
  | 'contract_requirement'
  | 'other'

/**
 * Records when a user manually overrides the recommended vendor.
 */
export interface VendorOverrideRecord {
  /** PR Item ID */
  prItemId: string

  /** Original recommended vendor ID */
  originalVendorId: string

  /** Vendor actually selected */
  selectedVendorId: string

  /** Type of override reason */
  reasonType: OverrideReasonType

  /** Additional explanation (required for 'other') */
  reasonText: string

  /** User who made the override */
  overriddenBy: string

  /** When the override happened */
  overriddenAt: Date

  /** Price difference from recommendation */
  priceDifference: Money

  /** Whether this was a price increase */
  isPriceIncrease: boolean
}

// =============================================================================
// Service Input/Output Types
// =============================================================================

/**
 * Input for fetching pricing options for a PR item.
 */
export interface FetchPricingInput {
  /** Product to get pricing for */
  productId: string

  /** Quantity needed */
  quantity: number

  /** Unit the quantity is in */
  unit: string

  /** Optional: specific vendors to consider */
  vendorIds?: string[]

  /** Optional: include expired price lists */
  includeExpired?: boolean

  /** Optional: minimum vendor rating */
  minRating?: number
}

/**
 * Input for recalculating prices on quantity change.
 */
export interface RecalculatePricingInput {
  /** Existing PR item ID */
  prItemId: string

  /** New quantity */
  newQuantity: number

  /** Unit for new quantity (may differ from original) */
  newUnit?: string

  /** Currently selected vendor (to preserve if still valid) */
  currentVendorId?: string
}

/**
 * Result of vendor allocation for a PR.
 */
export interface PRVendorAllocationResult {
  /** PR ID */
  prId: string

  /** Allocation results per item */
  itemAllocations: Map<string, PRItemPriceComparison>

  /** Summary of allocations */
  summary: {
    /** Total items processed */
    totalItems: number

    /** Items with auto-allocated vendors */
    autoAllocatedCount: number

    /** Items requiring manual intervention */
    manualInterventionRequired: number

    /** Items with MOQ warnings */
    moqWarningCount: number

    /** Estimated total cost at recommended prices */
    estimatedTotalCost: Money

    /** Potential savings vs highest prices */
    potentialSavings: Money
  }

  /** Validation errors (blocking) */
  errors: string[]

  /** Warnings (non-blocking) */
  warnings: string[]
}

// =============================================================================
// Scoring Configuration Types
// =============================================================================

/**
 * Configuration for vendor scoring weights.
 * Weights should sum to 1.0 (100%).
 */
export interface VendorScoringWeights {
  /** Weight for preferred item relationship (default: 0.35) */
  preferredItem: number

  /** Weight for preferred vendor status (default: 0.25) */
  preferredVendor: number

  /** Weight for price comparison (default: 0.25) */
  price: number

  /** Weight for vendor rating (default: 0.10) */
  rating: number

  /** Weight for lead time (default: 0.05) */
  leadTime: number
}

/** Default scoring weights */
export const DEFAULT_SCORING_WEIGHTS: VendorScoringWeights = {
  preferredItem: 0.35,
  preferredVendor: 0.25,
  price: 0.25,
  rating: 0.10,
  leadTime: 0.05
}

