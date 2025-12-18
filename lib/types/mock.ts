/**
 * Mock Data Type Extensions
 *
 * Extended types for mock/sample data that include additional fields
 * not present in the production data models. These types allow proper
 * TypeScript type safety for UI prototyping and development without
 * requiring 'any' type casts.
 *
 * Usage:
 * import { MockPurchaseRequest, MockPurchaseRequestItem } from '@/lib/types/mock'
 *
 * Best Practice: Use these types for mock data only. Production code should
 * use the base types from procurement.ts
 */

import {
  PurchaseRequest,
  PurchaseRequestItem,
  PurchaseRequestPriority,
  PurchaseRequestType,
  Requestor
} from './procurement'
import { Money, Comment } from './common'

/**
 * Extended Purchase Request for mock/sample data
 * Includes legacy and UI-specific fields not in the production schema
 */
/**
 * Mock requestor type for legacy/sample data compatibility
 * Extends base Requestor with optional id/departmentId for flexibility
 */
export interface MockRequestor {
  id?: string;
  name: string;
  email?: string;
  department?: string;
  departmentId?: string;
  departmentName?: string;
}

export interface MockPurchaseRequest extends Omit<PurchaseRequest, 'requestor' | 'currency'> {
  // Legacy fields from old data structure
  refNumber?: string;
  requestNumber?: string;

  // UI-specific mock fields - uses flexible MockRequestor type
  requestor?: MockRequestor;

  // Financial mock fields for prototyping - currency is optional in mock data
  currency?: string;
  subTotalPrice?: number;
  baseSubTotalPrice?: number;
  discountAmount?: number;
  baseDiscAmount?: number;
  netAmount?: number;
  baseNetAmount?: number;
  totalAmount?: number;
  baseTotalAmount?: number;
  taxAmount?: number;
  baseTaxAmount?: number;
  baseCurrencyCode?: string;
  exchangeRate?: number;

  // Additional UI fields
  department?: string;
  location?: string;
  jobCode?: string;
  vendor?: string;
  vendorId?: number;
  deliveryDate?: Date;
  deliveryPoint?: string;

  // Workflow fields
  currentWorkflowStage?: string;
  lastModified?: string;

  // Source requisition tracking (for PRs generated from Store Requisitions)
  sourceRequisitionId?: string;
  sourceRequisitionRefNo?: string;
  sourceRequisitionItemIds?: string[];

  // Items and activity
  items?: MockPurchaseRequestItem[];
  comments?: Comment[];
  activityLog?: Array<{
    id: string;
    timestamp: Date;
    userId: string;
    userName: string;
    action: string;
    description: string;
    details?: string;
  }>;
}

/**
 * Inventory information for mock items
 */
export interface MockInventoryInfo {
  onHand: number;
  onOrdered: number;
  lastPrice: number;
  lastOrderDate: Date;
  lastVendor: string;
  reorderLevel: number;
  restockLevel: number;
  averageMonthlyUsage: number;
  inventoryUnit: string;
}

/**
 * Adjustment settings for mock items
 */
export interface MockAdjustments {
  discount: boolean;
  tax: boolean;
}

/**
 * Extended Purchase Request Item for mock/sample data
 * Includes legacy and UI-specific fields not in the production schema
 */
export interface MockPurchaseRequestItem extends PurchaseRequestItem {
  // Legacy field names (old structure)
  name?: string; // Maps to itemName
  quantityRequested?: number; // Maps to requestedQuantity
  quantityApproved?: number; // Maps to approvedQuantity

  // Location/delivery mock fields
  location?: string;
  deliveryDate?: Date;
  deliveryPoint?: string;

  // Vendor and pricing mock fields
  vendor?: string;
  pricelistNumber?: string;
  price?: number;
  currency?: string;
  baseCurrency?: string;
  currencyRate?: number;

  // Financial calculations mock fields
  totalAmount?: number;
  discountRate?: number;
  discountAmount?: number;
  taxType?: string;
  taxRate?: number;
  taxAmount?: number;
  taxIncluded?: boolean;
  netAmount?: number;

  // Additional UI fields
  comment?: string;
  foc?: boolean; // Free of charge
  jobCode?: string;
  event?: string;
  project?: string;
  marketSegment?: string;

  // Item metadata
  itemCategory?: string;
  itemSubcategory?: string;
  createdDate?: Date;
  updatedDate?: Date;
  createdBy?: string;
  updatedBy?: string;

  // Inventory information
  inventoryInfo?: MockInventoryInfo;

  // Adjustment settings
  adjustments?: MockAdjustments;
}

/**
 * Type guard to check if a value is a MockPurchaseRequest
 * Works with both PurchaseRequest and MockPurchaseRequest inputs
 */
export function isMockPurchaseRequest(pr: unknown): pr is MockPurchaseRequest {
  if (typeof pr !== 'object' || pr === null) return false;
  return 'refNumber' in pr || 'subTotalPrice' in pr || 'currency' in pr;
}

/**
 * Type guard to check if a PurchaseRequestItem is a MockPurchaseRequestItem
 */
export function isMockPurchaseRequestItem(item: PurchaseRequestItem | MockPurchaseRequestItem): item is MockPurchaseRequestItem {
  return 'name' in item || 'quantityRequested' in item || 'vendor' in item || 'inventoryInfo' in item;
}

/**
 * Helper to safely cast PurchaseRequest to MockPurchaseRequest
 */
export function asMockPurchaseRequest(pr: PurchaseRequest | MockPurchaseRequest): MockPurchaseRequest {
  return pr as MockPurchaseRequest;
}

/**
 * Helper to safely cast PurchaseRequestItem to MockPurchaseRequestItem
 */
export function asMockPurchaseRequestItem(item: PurchaseRequestItem): MockPurchaseRequestItem {
  return item as MockPurchaseRequestItem;
}

/**
 * Type assertion function for MockPurchaseRequest following Next.js validation pattern
 * Throws if the value is not a valid mock purchase request
 */
export function assertMockPurchaseRequest(value: unknown): asserts value is MockPurchaseRequest {
  if (!isMockPurchaseRequest(value)) {
    throw new Error('Value is not a MockPurchaseRequest');
  }
}

/**
 * Type assertion function for MockPurchaseRequestItem following Next.js validation pattern
 * Throws if the value is not a valid mock purchase request item
 */
export function assertMockPurchaseRequestItem(value: PurchaseRequestItem): asserts value is MockPurchaseRequestItem {
  if (!isMockPurchaseRequestItem(value)) {
    throw new Error('Value is not a MockPurchaseRequestItem');
  }
}
