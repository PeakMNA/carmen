/**
 * Wastage Report Type Definitions
 *
 * Types for the wastage reporting system, including workflow status tracking
 * and integration with inventory adjustments.
 *
 * ============================================================================
 * WASTAGE REPORT WORKFLOW
 * ============================================================================
 *
 * The wastage report follows this workflow:
 *
 * 1. Draft → Initial state, editable by creator
 * 2. Submitted → Submitted for review, waiting for manager
 * 3. Under Review → Being actively reviewed
 * 4. Approved → Approved, ready to post to inventory
 * 5. Rejected → Rejected, sent back for revision
 * 6. Posted → Committed to inventory adjustment (Stock Out)
 *
 * ============================================================================
 */

import { InventoryLocationType } from './location-management'

// ============================================================================
// STATUS TYPES
// ============================================================================

/**
 * Wastage Report Status
 * Tracks the document through the approval and posting workflow
 */
export type WastageReportStatus =
  | 'Draft'         // Initial state, editable by creator
  | 'Submitted'     // Submitted for review
  | 'Under Review'  // Being reviewed by manager
  | 'Approved'      // Approved, ready to post to inventory
  | 'Rejected'      // Rejected, needs revision
  | 'Posted'        // Committed to Stock Out adjustment

/**
 * Review Decision type for approval workflow
 */
export type WastageReviewDecision = 'approved' | 'rejected'

// ============================================================================
// ITEM TYPES
// ============================================================================

/**
 * Wastage Item - individual item in a wastage report
 */
export interface WastageItem {
  id: string
  productId: string
  productCode: string
  productName: string
  productCategory: string      // Product category (e.g., Beverages)
  unit: string
  unitCost: number
  quantity: number
  batchNumber?: string
  expiryDate?: string | null
  wastageCategory: string      // Transaction category code (e.g., 'WST')
  reason: string               // Reason code within category
  remarks: string              // Additional notes about this item
  lossValue: number            // Calculated: quantity * unitCost
  attachments?: WastageAttachment[]  // Per-item evidence attachments
}

/**
 * Attachment for wastage report evidence
 */
export interface WastageAttachment {
  id: string
  fileName: string
  fileSize: string
  fileType: string
  uploadedAt: string
  uploadedBy: string
  url: string
}

// ============================================================================
// MAIN REPORT TYPE
// ============================================================================

/**
 * Wastage Report - main document for recording wastage/spoilage incidents
 */
export interface WastageReport {
  id: string
  reportNumber: string           // Format: WR-YYMM-NNNN
  status: WastageReportStatus

  // Location info
  location: string
  locationName: string
  locationType: InventoryLocationType

  // Report details
  reportDate: string
  items: WastageItem[]
  attachments: WastageAttachment[]

  // Summary
  totalItems: number
  totalQuantity: number
  totalValue: number

  // Review workflow
  reviewedBy?: string
  reviewedByName?: string
  reviewedAt?: string
  reviewDecision?: WastageReviewDecision
  reviewNotes?: string

  // Posting to inventory
  postedBy?: string
  postedByName?: string
  postedAt?: string
  adjustmentReference?: string   // Link to inventory adjustment (ADJ-YYMM-NNNN)

  // Audit fields
  createdBy: string
  createdByName: string
  createdAt: string
  updatedAt: string
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Status badge configuration for UI display
 */
export interface WastageStatusConfig {
  label: string
  variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'warning' | 'success'
  icon?: string
}

/**
 * Status configuration map
 */
export const wastageStatusConfig: Record<WastageReportStatus, WastageStatusConfig> = {
  Draft: {
    label: 'Draft',
    variant: 'secondary',
  },
  Submitted: {
    label: 'Submitted',
    variant: 'default',
  },
  'Under Review': {
    label: 'Under Review',
    variant: 'warning',
  },
  Approved: {
    label: 'Approved',
    variant: 'success',
  },
  Rejected: {
    label: 'Rejected',
    variant: 'destructive',
  },
  Posted: {
    label: 'Posted',
    variant: 'outline',
  },
}

/**
 * Check if status allows editing
 */
export function canEditWastageReport(status: WastageReportStatus): boolean {
  return status === 'Draft' || status === 'Rejected'
}

/**
 * Check if status allows submission
 */
export function canSubmitWastageReport(status: WastageReportStatus): boolean {
  return status === 'Draft' || status === 'Rejected'
}

/**
 * Check if status allows review
 */
export function canReviewWastageReport(status: WastageReportStatus): boolean {
  return status === 'Submitted' || status === 'Under Review'
}

/**
 * Check if status allows posting to inventory
 */
export function canPostWastageReport(status: WastageReportStatus): boolean {
  return status === 'Approved'
}

/**
 * Get next available status transitions
 */
export function getAvailableStatusTransitions(
  status: WastageReportStatus,
  userRole: 'creator' | 'reviewer' | 'manager'
): WastageReportStatus[] {
  switch (status) {
    case 'Draft':
      return userRole === 'creator' ? ['Submitted'] : []
    case 'Submitted':
      return userRole === 'reviewer' || userRole === 'manager'
        ? ['Under Review']
        : []
    case 'Under Review':
      return userRole === 'reviewer' || userRole === 'manager'
        ? ['Approved', 'Rejected']
        : []
    case 'Approved':
      return userRole === 'manager' ? ['Posted'] : []
    case 'Rejected':
      return userRole === 'creator' ? ['Submitted'] : []
    case 'Posted':
      return [] // Terminal state
    default:
      return []
  }
}
