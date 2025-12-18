/**
 * Workflow Bypass Service
 *
 * Service for determining when Store Requisitions can bypass approval
 * and be processed directly.
 *
 * Bypass Rules:
 * - Store-to-Store transfers between INVENTORY locations: No approval required
 * - Main Store transfers: Standard approval workflow
 * - Direct issues: May require department head approval
 *
 * @see docs/app/store-operations/sr-business-rules.md
 */

import {
  StoreRequisition,
  SRWorkflowType,
  SRStatus
} from '@/lib/types/store-requisition'
import { InventoryLocationType } from '@/lib/types/location-management'

// ====== SERVICE TYPES ======

export interface WorkflowDecision {
  requiresApproval: boolean
  bypassReason?: string
  requiredApprovers: ApproverInfo[]
  workflowType: SRWorkflowType
  autoTransitionToStatus?: SRStatus
}

export interface ApproverInfo {
  id: string
  name: string
  role: string
  level: number
  isOptional: boolean
}

export interface WorkflowConfig {
  workflowType: SRWorkflowType
  requiresApproval: boolean
  approvalLevels: {
    level: number
    roleName: string
    isOptional: boolean
    conditions?: {
      minValue?: number
      maxValue?: number
    }
  }[]
  autoProcessOnSubmit: boolean
}

// ====== WORKFLOW CONFIGURATIONS ======

const workflowConfigs: WorkflowConfig[] = [
  {
    workflowType: SRWorkflowType.STORE_TO_STORE,
    requiresApproval: false,
    approvalLevels: [],
    autoProcessOnSubmit: true
  },
  {
    workflowType: SRWorkflowType.MAIN_STORE,
    requiresApproval: true,
    approvalLevels: [
      { level: 1, roleName: 'Department Manager', isOptional: false },
      { level: 2, roleName: 'Store Manager', isOptional: true, conditions: { minValue: 500 } }
    ],
    autoProcessOnSubmit: false
  },
  {
    workflowType: SRWorkflowType.TRANSFER_INTERNAL,
    requiresApproval: true,
    approvalLevels: [
      { level: 1, roleName: 'Supervisor', isOptional: false }
    ],
    autoProcessOnSubmit: false
  },
  {
    workflowType: SRWorkflowType.DIRECT_ISSUE,
    requiresApproval: true,
    approvalLevels: [
      { level: 1, roleName: 'Department Head', isOptional: false },
      { level: 2, roleName: 'Finance Manager', isOptional: true, conditions: { minValue: 1000 } }
    ],
    autoProcessOnSubmit: false
  }
]

// Mock approvers
const mockApprovers: Record<string, ApproverInfo[]> = {
  'Department Manager': [
    { id: 'user-dm-001', name: 'Sarah Johnson', role: 'Department Manager', level: 1, isOptional: false }
  ],
  'Store Manager': [
    { id: 'user-sm-001', name: 'Michael Chen', role: 'Store Manager', level: 2, isOptional: true }
  ],
  'Supervisor': [
    { id: 'user-sup-001', name: 'David Wilson', role: 'Supervisor', level: 1, isOptional: false }
  ],
  'Department Head': [
    { id: 'user-chef-001', name: 'Chef Maria Rodriguez', role: 'Department Head', level: 1, isOptional: false }
  ],
  'Finance Manager': [
    { id: 'user-fm-001', name: 'Jennifer Lee', role: 'Finance Manager', level: 2, isOptional: true }
  ]
}

// ====== SERVICE CLASS ======

export class WorkflowBypassService {
  /**
   * Determine if a requisition should bypass approval
   */
  shouldBypassApproval(
    workflowType: SRWorkflowType,
    sourceLocationType: InventoryLocationType,
    destinationLocationType: InventoryLocationType
  ): boolean {
    // Store-to-store transfers don't require approval
    if (workflowType === SRWorkflowType.STORE_TO_STORE) {
      return true
    }

    // Check if both locations are inventory type (not main store)
    // and it's a simple internal transfer
    if (
      sourceLocationType === InventoryLocationType.INVENTORY &&
      destinationLocationType === InventoryLocationType.INVENTORY &&
      workflowType !== SRWorkflowType.MAIN_STORE
    ) {
      // Could add additional conditions here (e.g., value threshold)
      return false // Still requires approval by default
    }

    return false
  }

  /**
   * Get required approvers for a requisition
   */
  getRequiredApprovers(requisition: StoreRequisition): ApproverInfo[] {
    const config = this.getWorkflowConfig(requisition.workflowType)
    if (!config || !config.requiresApproval) {
      return []
    }

    const approvers: ApproverInfo[] = []
    const requisitionValue = requisition.estimatedValue.amount

    for (const level of config.approvalLevels) {
      // Check if this level is required based on conditions
      if (level.conditions) {
        if (level.conditions.minValue && requisitionValue < level.conditions.minValue) {
          continue // Skip this level if value is below threshold
        }
        if (level.conditions.maxValue && requisitionValue > level.conditions.maxValue) {
          continue // Skip this level if value is above threshold
        }
      }

      // Get approvers for this role
      const roleApprovers = mockApprovers[level.roleName] || []
      for (const approver of roleApprovers) {
        approvers.push({
          ...approver,
          level: level.level,
          isOptional: level.isOptional
        })
      }
    }

    return approvers
  }

  /**
   * Make a full workflow decision for a requisition
   */
  makeWorkflowDecision(requisition: StoreRequisition): WorkflowDecision {
    const workflowType = this.determineWorkflowType(requisition)
    const bypassApproval = this.shouldBypassApproval(
      workflowType,
      requisition.sourceLocationType,
      requisition.destinationLocationType
    )

    const decision: WorkflowDecision = {
      requiresApproval: !bypassApproval,
      workflowType,
      requiredApprovers: []
    }

    if (bypassApproval) {
      decision.bypassReason = this.getBypassReason(workflowType)
      decision.autoTransitionToStatus = SRStatus.Approved
    } else {
      decision.requiredApprovers = this.getRequiredApprovers(requisition)
    }

    return decision
  }

  /**
   * Determine the workflow type based on locations
   */
  determineWorkflowType(requisition: StoreRequisition): SRWorkflowType {
    // If destination is DIRECT, it's a direct issue
    if (requisition.destinationLocationType === InventoryLocationType.DIRECT) {
      return SRWorkflowType.DIRECT_ISSUE
    }

    // If source is Main Warehouse, it's a main store transfer
    if (this.isMainWarehouse(requisition.sourceLocationId)) {
      return SRWorkflowType.MAIN_STORE
    }

    // If both are inventory locations (not main warehouse), it's store-to-store
    if (
      requisition.sourceLocationType === InventoryLocationType.INVENTORY &&
      requisition.destinationLocationType === InventoryLocationType.INVENTORY
    ) {
      return SRWorkflowType.STORE_TO_STORE
    }

    // Default to internal transfer
    return SRWorkflowType.TRANSFER_INTERNAL
  }

  /**
   * Get the bypass reason text
   */
  private getBypassReason(workflowType: SRWorkflowType): string {
    switch (workflowType) {
      case SRWorkflowType.STORE_TO_STORE:
        return 'Store-to-store transfers do not require approval'
      default:
        return 'Workflow bypass enabled for this transfer type'
    }
  }

  /**
   * Check if a location is the main warehouse
   */
  private isMainWarehouse(locationId: string): boolean {
    // In production, this would be configuration-based
    return locationId === 'loc-004' // Main Warehouse
  }

  /**
   * Get workflow configuration
   */
  getWorkflowConfig(workflowType: SRWorkflowType): WorkflowConfig | undefined {
    return workflowConfigs.find(c => c.workflowType === workflowType)
  }

  /**
   * Check if a requisition can be auto-processed on submit
   */
  canAutoProcessOnSubmit(requisition: StoreRequisition): boolean {
    const config = this.getWorkflowConfig(requisition.workflowType)
    return config?.autoProcessOnSubmit ?? false
  }

  /**
   * Get the next status after an action
   */
  getNextStatus(
    currentStatus: SRStatus,
    action: 'submit' | 'approve' | 'reject' | 'process' | 'complete',
    requisition: StoreRequisition
  ): SRStatus {
    switch (action) {
      case 'submit':
        if (this.canAutoProcessOnSubmit(requisition)) {
          return SRStatus.Approved // Auto-approve for store-to-store
        }
        return SRStatus.Submitted

      case 'approve':
        return SRStatus.Approved

      case 'reject':
        return SRStatus.Rejected

      case 'process':
        return SRStatus.Processing

      case 'complete':
        return SRStatus.Completed

      default:
        return currentStatus
    }
  }

  /**
   * Validate if a status transition is allowed
   */
  isValidTransition(
    fromStatus: SRStatus,
    toStatus: SRStatus,
    requisition: StoreRequisition
  ): { valid: boolean; reason?: string } {
    // Define valid transitions
    const validTransitions: Record<SRStatus, SRStatus[]> = {
      [SRStatus.Draft]: [SRStatus.Submitted, SRStatus.Cancelled, SRStatus.Approved],
      [SRStatus.Submitted]: [SRStatus.Approved, SRStatus.Rejected],
      [SRStatus.Approved]: [SRStatus.Processing, SRStatus.Cancelled],
      [SRStatus.Processing]: [SRStatus.Processed],
      [SRStatus.Processed]: [SRStatus.Completed, SRStatus.PartialComplete],
      [SRStatus.PartialComplete]: [SRStatus.Completed],
      [SRStatus.Completed]: [],
      [SRStatus.Rejected]: [],
      [SRStatus.Cancelled]: []
    }

    // Check for store-to-store bypass (Draft -> Approved is allowed)
    if (
      fromStatus === SRStatus.Draft &&
      toStatus === SRStatus.Approved &&
      requisition.workflowType === SRWorkflowType.STORE_TO_STORE
    ) {
      return { valid: true }
    }

    const allowedTransitions = validTransitions[fromStatus] || []
    if (!allowedTransitions.includes(toStatus)) {
      return {
        valid: false,
        reason: `Cannot transition from ${fromStatus} to ${toStatus}`
      }
    }

    return { valid: true }
  }

  /**
   * Get available actions for a requisition based on status
   */
  getAvailableActions(
    requisition: StoreRequisition,
    userRole: string
  ): string[] {
    const actions: string[] = []

    switch (requisition.status) {
      case SRStatus.Draft:
        actions.push('submit')
        actions.push('cancel')
        break

      case SRStatus.Submitted:
        // Check if user can approve
        const approvers = this.getRequiredApprovers(requisition)
        if (approvers.some(a => a.role === userRole)) {
          actions.push('approve')
          actions.push('reject')
        }
        break

      case SRStatus.Approved:
        actions.push('process')
        actions.push('cancel')
        break

      case SRStatus.Processing:
        // Usually system-driven
        break

      case SRStatus.Processed:
        actions.push('complete')
        break

      case SRStatus.PartialComplete:
        actions.push('complete')
        break
    }

    return actions
  }
}

// Export singleton instance
export const workflowBypassService = new WorkflowBypassService()
