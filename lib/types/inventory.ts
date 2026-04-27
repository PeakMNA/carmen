/**
 * Inventory Management Types
 * 
 * Types and interfaces for inventory operations, stock management,
 * physical counts, adjustments, and related inventory functionality.
 */

import { AuditTimestamp, DocumentStatus, Money, Quantity, WorkflowStatus } from './common'

// ====== CORE INVENTORY TYPES ======

/**
 * Inventory item definition
 */
export interface InventoryItem {
  id: string;
  itemCode: string;
  itemName: string;
  description?: string;
  categoryId: string;
  baseUnitId: string;
  costingMethod: CostingMethod;
  isActive: boolean;
  isSerialized: boolean;
  minimumQuantity?: number;
  maximumQuantity?: number;
  reorderPoint?: number;
  reorderQuantity?: number;
  leadTime?: number; // in days
  lastPurchaseDate?: Date;
  lastPurchasePrice?: Money;
  lastSaleDate?: Date;
  lastSalePrice?: Money;
}

/**
 * Costing methods for inventory valuation
 *
 * System supports two centralized costing methods applied company-wide:
 * - FIFO: First-In-First-Out (oldest inventory consumed first)
 * - PERIODIC_AVERAGE: Monthly average cost applied to all transactions in the period
 *
 * See: docs/app/shared-methods/inventory-valuation/SM-costing-methods.md
 */
export enum CostingMethod {
  FIFO = "FIFO",
  PERIODIC_AVERAGE = "PERIODIC_AVERAGE"
}

/**
 * Stock balance for an item at a specific location
 */
export interface StockBalance {
  id: string;
  itemId: string;
  locationId: string;
  quantityOnHand: number;
  quantityReserved: number;
  quantityAvailable: number;
  averageCost: Money;
  totalValue: Money;
  lastMovementDate?: Date;
  lastCountDate?: Date;
}

// ====== INVENTORY TRANSACTIONS ======

/**
 * Inventory transaction types
 */
export enum TransactionType {
  RECEIVE = "RECEIVE",           // Goods received
  ISSUE = "ISSUE",              // Stock issued/consumed
  TRANSFER_OUT = "TRANSFER_OUT", // Transfer to another location
  TRANSFER_IN = "TRANSFER_IN",   // Transfer from another location
  ADJUST_UP = "ADJUST_UP",       // Positive adjustment
  ADJUST_DOWN = "ADJUST_DOWN",   // Negative adjustment
  COUNT = "COUNT",               // Physical count adjustment
  WASTE = "WASTE",               // Wastage/spoilage
  CONVERSION = "CONVERSION",     // Unit conversion/split
  SALES_CONSUMPTION = "SALES_CONSUMPTION"
}

/**
 * Inventory transaction record
 */
export interface InventoryTransaction {
  id: string;
  transactionId: string; // Unique transaction identifier
  itemId: string;
  locationId: string;
  transactionType: TransactionType;
  quantity: number;
  unitCost: Money;
  totalCost: Money;
  balanceAfter: number;
  transactionDate: Date;
  referenceNo?: string;
  referenceType?: string;
  batchNo?: string;
  lotNo?: string;
  expiryDate?: Date;
  userId: string;
  notes?: string;
}

// ====== PHYSICAL COUNT ======

/**
 * Physical count status
 */
export type PhysicalCountStatus = 'planning' | 'in_progress' | 'completed' | 'finalized' | 'cancelled';

/**
 * Physical count header
 */
export interface PhysicalCount {
  id: string;
  countNumber: string;
  countDate: Date;
  countType: 'full' | 'cycle' | 'spot';
  status: PhysicalCountStatus;
  locationId: string;
  departmentId?: string;
  countedBy: string[];
  supervisedBy?: string;
  startTime?: Date;
  endTime?: Date;
  totalItems: number;
  itemsCounted: number;
  discrepanciesFound: number;
  totalVarianceValue: Money;
  notes?: string;
  isFinalized: boolean;
  finalizedBy?: string;
  finalizedAt?: Date;
  items?: PhysicalCountItem[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}

/**
 * Physical count line item
 */
export interface PhysicalCountItem {
  id: string;
  countId: string;
  itemId: string;
  expectedQuantity: number;
  countedQuantity?: number;
  variance: number;
  varianceValue: Money;
  reasonCode?: string;
  comments?: string;
  countedBy?: string;
  countedAt?: Date;
  isRecounted: boolean;
  recountQuantity?: number;
  recountedBy?: string;
  recountedAt?: Date;
  status: 'pending' | 'counted' | 'variance' | 'approved';
}

// ====== SPOT CHECK ======

/**
 * Spot check for selective inventory verification
 */
export interface SpotCheck {
  id: string;
  checkNumber: string;
  checkDate: Date;
  locationId: string;
  checkType: 'random' | 'targeted' | 'investigative';
  reason: string;
  status: 'active' | 'completed' | 'cancelled';
  assignedTo: string;
  completedBy?: string;
  startTime?: Date;
  endTime?: Date;
  itemsToCheck: number;
  itemsChecked: number;
  discrepancies: number;
  notes?: string;
  items?: SpotCheckItem[];
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy?: string;
}

/**
 * Spot check item
 */
export interface SpotCheckItem {
  id: string;
  spotCheckId: string;
  itemId: string;
  expectedQuantity: number;
  actualQuantity?: number;
  variance: number;
  status: 'pending' | 'checked' | 'discrepancy';
  checkedBy?: string;
  checkedAt?: Date;
  notes?: string;
}

// ====== INVENTORY ADJUSTMENTS ======

/**
 * Inventory adjustment reasons
 */
export enum AdjustmentReason {
  DAMAGED = "DAMAGED",
  EXPIRED = "EXPIRED",
  LOST = "LOST",
  STOLEN = "STOLEN",
  COUNT_VARIANCE = "COUNT_VARIANCE",
  SYSTEM_ERROR = "SYSTEM_ERROR",
  CONVERSION = "CONVERSION",
  RECLASSIFICATION = "RECLASSIFICATION",
  OTHER = "OTHER"
}

/**
 * Inventory adjustment header
 */
export interface InventoryAdjustment {
  id: string;
  adjustmentNumber: string;
  adjustmentDate: Date;
  adjustmentType: 'increase' | 'decrease';
  reason: AdjustmentReason;
  locationId: string;
  status: DocumentStatus;
  requestedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  totalItems: number;
  totalValue: Money;
  description?: string;
  attachments?: string[];
}

/**
 * Inventory adjustment line item
 */
export interface InventoryAdjustmentItem {
  id: string;
  adjustmentId: string;
  itemId: string;
  currentQuantity: number;
  adjustmentQuantity: number;
  newQuantity: number;
  unitCost: Money;
  totalValue: Money;
  reason?: string;
  batchNo?: string;
  lotNo?: string;
  expiryDate?: Date;
  notes?: string;
}

// ====== STOCK MOVEMENTS ======

/**
 * Stock movement header for transfers between locations
 */
export interface StockMovement {
  id: string;
  movementNumber: string;
  movementDate: Date;
  movementType: 'transfer' | 'return' | 'allocation';
  fromLocationId: string;
  toLocationId: string;
  status: DocumentStatus;
  requestedBy: string;
  authorizedBy?: string;
  completedBy?: string;
  totalItems: number;
  totalValue: Money;
  priority: 'normal' | 'urgent' | 'emergency';
  notes?: string;
}

/**
 * Stock movement line item
 */
export interface StockMovementItem {
  id: string;
  movementId: string;
  itemId: string;
  requestedQuantity: number;
  transferredQuantity?: number;
  receivedQuantity?: number;
  unitCost: Money;
  totalValue: Money;
  batchNo?: string;
  lotNo?: string;
  expiryDate?: Date;
  notes?: string;
}

// ====== STOCK CARDS ======

/**
 * Stock card for tracking item movements
 */
export interface StockCard {
  id: string;
  itemId: string;
  locationId: string;
  movements: StockCardMovement[];
  currentBalance: number;
  averageCost: Money;
  totalValue: Money;
  lastMovementDate: Date;
}

/**
 * Individual stock card movement
 */
export interface StockCardMovement {
  id: string;
  date: Date;
  transactionType: TransactionType;
  referenceNo: string;
  description: string;
  quantityIn: number;
  quantityOut: number;
  balance: number;
  unitCost: Money;
  totalValue: Money;
  batchNo?: string;
  lotNo?: string;
}

// ====== INVENTORY ALERTS ======

/**
 * Inventory alert types
 */
export enum InventoryAlertType {
  LOW_STOCK = "LOW_STOCK",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  OVERSTOCK = "OVERSTOCK",
  EXPIRY_WARNING = "EXPIRY_WARNING",
  EXPIRED = "EXPIRED",
  SLOW_MOVING = "SLOW_MOVING",
  FAST_MOVING = "FAST_MOVING",
  REORDER_POINT = "REORDER_POINT"
}

/**
 * Inventory alert
 */
export interface InventoryAlert {
  id: string;
  alertType: InventoryAlertType;
  itemId: string;
  locationId: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  currentQuantity: number;
  thresholdQuantity?: number;
  expiryDate?: Date;
  daysUntilExpiry?: number;
  isActive: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: Date;
  resolvedBy?: string;
  resolvedAt?: Date;
}

// ====== COUNT ITEM INTERFACE ======

/**
 * Count item for physical counts (legacy compatibility)
 */
export interface CountItem {
  id: string;
  name: string;
  sku: string;
  description: string;
  expectedQuantity: number;
  unit: string;
  actualQuantity?: number;
  variance?: number;
  notes?: string;
}

// ====== INVENTORY REPORTS ======

/**
 * Inventory aging report data
 */
export interface InventoryAging {
  itemId: string;
  itemName: string;
  currentQuantity: number;
  value: Money;
  ageRanges: {
    range: string; // e.g., "0-30 days"
    quantity: number;
    value: Money;
  }[];
  averageAge: number; // in days
  lastMovementDate: Date;
}

/**
 * Slow moving inventory report
 */
export interface SlowMovingInventory {
  itemId: string;
  itemName: string;
  currentQuantity: number;
  value: Money;
  lastMovementDate: Date;
  daysSinceLastMovement: number;
  averageMonthlyUsage: number;
  monthsOfStock: number;
  recommendation: 'review' | 'liquidate' | 'return' | 'write_off';
}