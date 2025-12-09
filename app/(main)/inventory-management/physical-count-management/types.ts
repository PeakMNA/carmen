// Physical Count Types and Interfaces

export type PhysicalCountType = 'full' | 'cycle' | 'annual' | 'perpetual' | 'partial'
export type PhysicalCountStatus = 'draft' | 'planning' | 'pending' | 'in-progress' | 'completed' | 'finalized' | 'cancelled' | 'on-hold'
export type ItemCountStatus = 'pending' | 'counted' | 'variance' | 'approved' | 'skipped' | 'recount'
export type VarianceReason = 'damage' | 'theft' | 'spoilage' | 'measurement-error' | 'system-error' | 'receiving-error' | 'issue-error' | 'unknown' | 'other'

export interface PhysicalCountItem {
  id: string
  countId: string
  itemId: string
  itemCode: string
  itemName: string
  category: string
  unit: string
  location: string
  binLocation: string | null

  // Quantities
  systemQuantity: number
  countedQuantity: number | null
  recountQuantity: number | null
  finalQuantity: number | null
  variance: number
  variancePercent: number
  varianceValue: number

  // Status & tracking
  status: ItemCountStatus
  varianceReason: VarianceReason | null

  // Counting details
  countedBy: string | null
  countedAt: Date | null
  recountedBy: string | null
  recountedAt: Date | null
  approvedBy: string | null
  approvedAt: Date | null

  // Additional info
  unitCost: number
  notes: string
  batchNumber: string | null
  expiryDate: Date | null
  lastCountDate: Date | null
}

export interface PhysicalCount {
  id: string
  countNumber: string
  countType: PhysicalCountType
  status: PhysicalCountStatus
  priority: 'low' | 'medium' | 'high' | 'critical'

  // Location & Department
  locationId: string
  locationName: string
  departmentId: string | null
  departmentName: string | null
  zone: string | null

  // Assignment
  supervisorId: string
  supervisorName: string
  counters: Array<{
    id: string
    name: string
    role: 'primary' | 'secondary' | 'verifier'
  }>

  // Timing
  scheduledDate: Date
  startedAt: Date | null
  completedAt: Date | null
  finalizedAt: Date | null
  dueDate: Date | null

  // Items
  items: PhysicalCountItem[]
  totalItems: number
  countedItems: number
  pendingItems: number
  varianceItems: number
  approvedItems: number
  recountItems: number

  // Metrics
  accuracy: number
  totalSystemValue: number
  totalCountedValue: number
  varianceValue: number
  variancePercent: number

  // Workflow
  requiresApproval: boolean
  approvalThreshold: number // Variance % that requires approval
  isFinalized: boolean
  adjustmentPosted: boolean
  adjustmentId: string | null

  // Notes and metadata
  description: string
  instructions: string
  notes: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  finalizedBy: string | null
}

export interface PhysicalCountSummary {
  total: number
  draft: number
  planning: number
  pending: number
  inProgress: number
  completed: number
  finalized: number
  cancelled: number
  onHold: number
}

export interface PhysicalCountFilter {
  search: string
  status: PhysicalCountStatus | 'all'
  type: PhysicalCountType | 'all'
  location: string | 'all'
  department: string | 'all'
  supervisor: string | 'all'
  dateFrom: Date | null
  dateTo: Date | null
  priority: 'low' | 'medium' | 'high' | 'critical' | 'all'
  hasVariance: boolean | null
}

export interface PhysicalCountFormData {
  countType: PhysicalCountType
  locationId: string
  departmentId: string | null
  zone: string | null
  supervisorId: string
  counterIds: string[]
  scheduledDate: Date
  dueDate: Date | null
  description: string
  instructions: string
  notes: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  approvalThreshold: number
  includeCategories: string[]
  excludeCategories: string[]
}

export interface CountTeamMember {
  id: string
  name: string
  email: string
  role: 'supervisor' | 'counter' | 'verifier'
  department: string
  assignedZone: string | null
  itemsCounted: number
  isActive: boolean
}

export interface CountZone {
  id: string
  name: string
  locationId: string
  description: string
  itemCount: number
  assignedCounters: string[]
  status: 'not-started' | 'in-progress' | 'completed'
}

export interface VarianceReport {
  countId: string
  countNumber: string
  totalItems: number
  itemsWithVariance: number
  totalVarianceValue: number
  varianceByCategory: Array<{
    category: string
    itemCount: number
    varianceValue: number
    variancePercent: number
  }>
  varianceByReason: Array<{
    reason: VarianceReason
    itemCount: number
    varianceValue: number
  }>
  topVarianceItems: PhysicalCountItem[]
}

// Dashboard stats
export interface PhysicalCountDashboardStats {
  totalCounts: number
  activeCounts: number
  completedThisMonth: number
  pendingApproval: number
  overdueCounts: number
  totalVarianceValue: number
  averageAccuracy: number
  itemsCounted: number
  varianceItemsCount: number
  countsByType: Array<{
    type: PhysicalCountType
    count: number
    accuracy: number
  }>
  countsByLocation: Array<{
    location: string
    count: number
    varianceValue: number
  }>
}
