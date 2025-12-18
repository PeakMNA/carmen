/**
 * Store Operations Services Index
 *
 * Central export point for all store operations services including:
 * - Stock availability checking
 * - Document generation (ST, SI, PR)
 * - PAR-based replenishment
 * - Workflow bypass logic
 *
 * @see docs/app/store-operations/sr-business-rules.md
 */

// Stock Availability Service
export {
  StockAvailabilityService,
  stockAvailabilityService
} from './stock-availability-service'

export type {
  StockCheckRequest,
  BulkStockCheckRequest,
  FulfillmentPlan,
  BulkFulfillmentResult
} from './stock-availability-service'

// Document Generation Service
export {
  DocumentGenerationService,
  documentGenerationService
} from './document-generation-service'

export type {
  DocumentGenerationResult,
  DocumentTypeResult
} from './document-generation-service'

// Replenishment Service
export {
  ReplenishmentService,
  replenishmentService
} from './replenishment-service'

export type {
  ReplenishmentFilter,
  ReplenishmentResult,
  CreateRequisitionResult
} from './replenishment-service'

// Workflow Bypass Service
export {
  WorkflowBypassService,
  workflowBypassService
} from './workflow-bypass-service'

export type {
  WorkflowDecision,
  ApproverInfo,
  WorkflowConfig
} from './workflow-bypass-service'

// Import services for use in factory and default export
import { stockAvailabilityService as _stockAvailabilityService } from './stock-availability-service'
import { documentGenerationService as _documentGenerationService } from './document-generation-service'
import { replenishmentService as _replenishmentService } from './replenishment-service'
import { workflowBypassService as _workflowBypassService } from './workflow-bypass-service'

// Service factory for custom configurations
export function createStoreOperationsServices() {
  return {
    stockAvailability: _stockAvailabilityService,
    documentGeneration: _documentGenerationService,
    replenishment: _replenishmentService,
    workflowBypass: _workflowBypassService
  }
}

// Default export
export default {
  stockAvailability: _stockAvailabilityService,
  documentGeneration: _documentGenerationService,
  replenishment: _replenishmentService,
  workflowBypass: _workflowBypassService,
  create: createStoreOperationsServices
}
