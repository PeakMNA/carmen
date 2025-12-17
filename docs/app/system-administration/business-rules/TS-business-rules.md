# Business Rules Management - Technical Specification (TS)

**Module**: System Administration - Business Rules Management
**Version**: 1.0
**Last Updated**: 2025-01-16
**Status**: Planned Implementation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Overview

### 1.1 Purpose
This document provides technical specifications for implementing the Business Rules Management module, including component architecture, state management patterns, data models, and UI implementation details.

### 1.2 Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.8.2 (strict mode)
- **UI Library**: React 18
- **Styling**: Tailwind CSS 3.x + shadcn/ui components
- **State Management**: React hooks (useState, useMemo) for local state
- **Data Fetching**: Planned: React Query for server state
- **Form Handling**: React Hook Form + Zod validation
- **Tables**: TanStack React Table v8
- **Icons**: Lucide React
- **Charts**: Recharts (for analytics)
- **Date Handling**: date-fns
- **Database**: Planned: PostgreSQL 15+ via Prisma 5.x

### 1.3 Current Implementation Status
- **Current**: Mock data with TypeScript objects
- **Planned**: PostgreSQL database with Prisma ORM (Q1 2025)
- **Location**: `app/(main)/system-administration/business-rules/`

---

## 2. Component Architecture

### 2.1 Module Structure

```
app/(main)/system-administration/business-rules/
├── page.tsx                              # Main business rules page
├── compliance-monitoring/
│   └── page.tsx                         # Compliance monitoring page
├── components/
│   ├── RuleBuilder.tsx                  # Rule creation/edit form (planned)
│   ├── RuleTestPanel.tsx                # Rule testing interface (planned)
│   ├── ConditionBuilder.tsx             # Condition configuration (planned)
│   ├── ActionBuilder.tsx                # Action configuration (planned)
│   ├── ViolationCard.tsx                # Violation display component (planned)
│   ├── CorrectiveActionForm.tsx         # Corrective action management (planned)
│   └── AnalyticsDashboard.tsx           # Performance analytics (planned)
├── hooks/
│   ├── useBusinessRules.ts              # Business rules data hook (planned)
│   ├── useRuleValidation.ts             # Rule validation logic (planned)
│   └── useComplianceData.ts             # Compliance data hook (planned)
├── actions.ts                           # Server actions (planned)
└── types.ts                             # Type definitions (currently in lib/types/business-rules.ts)
```

### 2.2 Page Components

#### BusinessRulesPage Component (`page.tsx`)

**Purpose**: Main dashboard for business rules management with tabs for rules, violations, analytics, and audit trail.

**Current Implementation**:
```typescript
export default function BusinessRulesPage() {
  // UI State
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<'active' | 'inactive' | null>(null)
  const [selectedRule, setSelectedRule] = useState<BusinessRule | null>(null)
  const [editRuleOpen, setEditRuleOpen] = useState(false)

  // Mock Data (from lib/mock-data/business-rules.ts - planned)
  const [rules, setRules] = useState<BusinessRule[]>(mockRules)
  const [violations, setViolations] = useState<ComplianceViolation[]>(mockViolations)

  // Computed State (Memoized for performance)
  const filteredRules = useMemo(() => {
    return rules.filter(rule => {
      const matchesSearch = !searchQuery ||
        rule.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = !selectedCategory ||
        rule.category === selectedCategory

      const matchesStatus = selectedStatus === null ||
        (selectedStatus === 'active' && rule.isActive) ||
        (selectedStatus === 'inactive' && !rule.isActive)

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [rules, searchQuery, selectedCategory, selectedStatus])

  // Metrics Calculations (Memoized)
  const metrics = useMemo(() => ({
    totalRules: rules.length,
    activeRules: rules.filter(r => r.isActive).length,
    openViolations: violations.filter(v => v.status === 'open').length,
    averageSuccessRate: rules.reduce((sum, r) => sum + r.successRate, 0) / rules.length || 0
  }), [rules, violations])

  return (
    <div className="space-y-6">
      {/* Header with Metrics */}
      <div className="flex items-center justify-between">
        <h1>Business Rules</h1>
        <Button onClick={() => setEditRuleOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Rule
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Total Rules"
          value={metrics.totalRules}
          icon={ShieldCheck}
        />
        {/* ... more metric cards ... */}
      </div>

      {/* Tabs: Business Rules, Violations, Analytics, Audit Trail */}
      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">Business Rules</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="audit">Audit Trail</TabsTrigger>
        </TabsList>

        <TabsContent value="rules">
          {/* Search and Filter */}
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search rules..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <CategoryFilter
              selected={selectedCategory}
              onChange={setSelectedCategory}
            />
            <StatusFilter
              selected={selectedStatus}
              onChange={setSelectedStatus}
            />
          </div>

          {/* Rules Table */}
          <RulesTable
            rules={filteredRules}
            onEdit={(rule) => {
              setSelectedRule(rule)
              setEditRuleOpen(true)
            }}
            onToggleStatus={(rule) => handleToggleStatus(rule)}
            onDelete={(rule) => handleDelete(rule)}
          />
        </TabsContent>

        {/* ... other tabs ... */}
      </Tabs>

      {/* Edit/Create Rule Dialog */}
      <Dialog open={editRuleOpen} onOpenChange={setEditRuleOpen}>
        <DialogContent>
          <RuleBuilder
            rule={selectedRule}
            onSave={handleSaveRule}
            onCancel={() => setEditRuleOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
```

**Component Hierarchy**:
```
BusinessRulesPage
├── Header
│   ├── Title
│   └── CreateRuleButton
├── MetricsSection
│   ├── TotalRulesCard
│   ├── ActiveRulesCard
│   ├── OpenViolationsCard
│   └── SuccessRateCard
├── Tabs
│   ├── BusinessRulesTab
│   │   ├── SearchAndFilterBar
│   │   │   ├── SearchInput
│   │   │   ├── CategoryFilter
│   │   │   └── StatusFilter
│   │   └── RulesTable
│   │       └── RuleRow (for each rule)
│   │           ├── RuleName
│   │           ├── Category
│   │           ├── Priority
│   │           ├── Status
│   │           ├── SuccessRate
│   │           └── ActionsMenu
│   ├── ViolationsTab
│   ├── AnalyticsTab
│   └── AuditTrailTab
└── RuleBuilderDialog
    └── RuleBuilder component
```

#### ComplianceMonitoringPage Component (`compliance-monitoring/page.tsx`)

**Purpose**: Real-time compliance monitoring dashboard with violation tracking and corrective actions.

**Current Implementation**:
```typescript
export default function ComplianceMonitoringPage() {
  // UI State
  const [selectedViolation, setSelectedViolation] = useState<ComplianceViolation | null>(null)
  const [filterSeverity, setFilterSeverity] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterLocation, setFilterLocation] = useState<string | null>(null)

  // Mock Data
  const [violations, setViolations] = useState<ComplianceViolation[]>(mockViolations)
  const [complianceScores, setComplianceScores] = useState(mockComplianceScores)

  // Computed State
  const filteredViolations = useMemo(() => {
    return violations.filter(v => {
      const matchesSeverity = !filterSeverity || v.violationType === filterSeverity
      const matchesStatus = !filterStatus || v.status === filterStatus
      const matchesLocation = !filterLocation || v.location.includes(filterLocation)
      return matchesSeverity && matchesStatus && matchesLocation
    })
  }, [violations, filterSeverity, filterStatus, filterLocation])

  // Metrics
  const metrics = useMemo(() => ({
    overallScore: complianceScores.overall,
    foodSafetyScore: complianceScores.foodSafety,
    qualityControlScore: complianceScores.qualityControl,
    inventoryScore: complianceScores.inventory,
    criticalViolations: violations.filter(v => v.violationType === 'critical').length,
    majorViolations: violations.filter(v => v.violationType === 'major').length,
    minorViolations: violations.filter(v => v.violationType === 'minor').length
  }), [violations, complianceScores])

  return (
    <div className="space-y-6">
      {/* Header */}
      <h1>Compliance Monitoring</h1>

      {/* Compliance Score Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <ComplianceScoreCard
          title="Overall Compliance"
          score={metrics.overallScore}
          trend={+2.5}
        />
        {/* ... more score cards ... */}
      </div>

      {/* Violations Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <ViolationsSummaryCard
          type="critical"
          count={metrics.criticalViolations}
          color="red"
        />
        {/* ... more summary cards ... */}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active Violations</TabsTrigger>
          <TabsTrigger value="resolved">Resolved Violations</TabsTrigger>
          <TabsTrigger value="trends">Compliance Trends</TabsTrigger>
          <TabsTrigger value="locations">Location Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {/* Filters */}
          <div className="flex gap-4 mb-4">
            <SeverityFilter onChange={setFilterSeverity} />
            <StatusFilter onChange={setFilterStatus} />
            <LocationFilter onChange={setFilterLocation} />
          </div>

          {/* Violations List */}
          <ViolationsTable
            violations={filteredViolations}
            onSelect={setSelectedViolation}
          />
        </TabsContent>

        {/* ... other tabs ... */}
      </Tabs>

      {/* Violation Detail Drawer */}
      <Sheet open={!!selectedViolation} onOpenChange={() => setSelectedViolation(null)}>
        <SheetContent>
          <ViolationDetail
            violation={selectedViolation}
            onUpdate={handleViolationUpdate}
            onClose={() => setSelectedViolation(null)}
          />
        </SheetContent>
      </Sheet>
    </div>
  )
}
```

**Component Hierarchy**:
```
ComplianceMonitoringPage
├── Header
├── ComplianceScoresSection
│   ├── OverallScoreCard
│   ├── FoodSafetyScoreCard
│   ├── QualityControlScoreCard
│   └── InventoryScoreCard
├── ViolationsSummarySection
│   ├── CriticalViolationsCard
│   ├── MajorViolationsCard
│   └── MinorViolationsCard
├── Tabs
│   ├── ActiveViolationsTab
│   │   ├── FiltersBar
│   │   │   ├── SeverityFilter
│   │   │   ├── StatusFilter
│   │   │   └── LocationFilter
│   │   └── ViolationsTable
│   │       └── ViolationRow (for each violation)
│   ├── ResolvedViolationsTab
│   ├── ComplianceTrendsTab
│   └── LocationPerformanceTab
└── ViolationDetailDrawer
    ├── ViolationInfo
    ├── CorrectiveActionsSection
    │   └── CorrectiveActionCard (for each action)
    └── TimelineSection
```

---

## 3. Data Models

### 3.1 Core Types

From `lib/types/business-rules.ts`:

```typescript
// Main Business Rule Type
export interface BusinessRule {
  id: string                                    // UUID
  name: string                                  // Unique rule name
  description: string                           // Rule description
  priority: number                              // 1-10, higher = higher priority
  isActive: boolean                             // Active/inactive status
  category: RuleCategory                        // Rule category
  conditions: RuleCondition[]                   // Array of conditions
  actions: RuleAction[]                         // Array of actions to execute
  createdBy: string                             // User ID who created
  createdAt: string                             // ISO timestamp
  updatedAt: string                             // ISO timestamp
  lastTriggered?: string                        // ISO timestamp of last trigger
  triggerCount: number                          // Number of times triggered
  successRate: number                           // 0-100 percentage
}

// Rule Categories
export type RuleCategory =
  | 'vendor-selection'
  | 'pricing'
  | 'approval'
  | 'currency'
  | 'fractional-sales'
  | 'quality-control'
  | 'inventory-management'
  | 'food-safety'
  | 'waste-management'

// Rule Condition
export interface RuleCondition {
  id: string                                    // Condition UUID
  field: string                                 // Field to evaluate (e.g., "item.holdingTime")
  operator: ConditionOperator                   // Comparison operator
  value: any                                    // Value to compare against
  logicalOperator?: 'AND' | 'OR' | null         // Logical connector to next condition
}

export type ConditionOperator =
  | 'equals'
  | 'contains'
  | 'greaterThan'
  | 'lessThan'
  | 'between'
  | 'in'
  | 'not_equals'

// Rule Action
export interface RuleAction {
  id: string                                    // Action UUID
  type: ActionType                              // Action to execute
  parameters: Record<string, any>               // Action-specific parameters
}

export type ActionType =
  // Fractional Sales & Food Safety Actions
  | 'blockSale'
  | 'requireApproval'
  | 'scheduleWasteCheck'
  | 'quarantineItem'
  | 'notifyManager'
  | 'logCompliance'
  | 'sendAlert'
  | 'markExpired'

  // Inventory Actions
  | 'triggerReorder'
  | 'adjustPrice'
  | 'updateInventory'

  // Procurement Actions
  | 'assignVendor'
  | 'setPrice'
  | 'flagForReview'
  | 'applyDiscount'

  // Currency Actions
  | 'convertCurrency'
```

### 3.2 Specialized Rule Types

```typescript
// Fractional Sales Rule (extends BusinessRule)
export interface FractionalSalesRule extends BusinessRule {
  category: 'fractional-sales'
  fractionalType: 'pizza-slice' | 'cake-slice' | 'bottle-glass' | 'portion-control' | 'custom'
  foodSafetyLevel: 'high' | 'medium' | 'low'
  complianceRequirements: string[]              // Regulatory references
  qualityStandards: QualityStandard[]           // Quality control standards
}

// Quality Standard
export interface QualityStandard {
  id: string
  standardName: string                          // e.g., "Maximum Holding Time"
  measurementType: 'time' | 'temperature' | 'appearance' | 'weight' | 'size' | 'freshness'
  minimumValue?: number
  maximumValue?: number
  unit: string                                  // e.g., "minutes", "°C", "grams"
  toleranceLevel: number                        // Percentage (0-50)
  criticalControl: boolean                      // Is this a HACCP critical control point?
  monitoringFrequency: 'continuous' | 'hourly' | 'shift' | 'daily'
}

// Food Safety Rule (extends BusinessRule)
export interface FoodSafetyRule extends BusinessRule {
  category: 'food-safety'
  hazardType: 'biological' | 'chemical' | 'physical' | 'cross-contamination'
  riskLevel: 'critical' | 'high' | 'medium' | 'low'
  haccp_point: string                           // HACCP control point identifier
  monitoringRequired: boolean
  corrective_actions: string[]                  // Predefined corrective actions
}

// Inventory Threshold Rule (extends BusinessRule)
export interface InventoryThresholdRule extends BusinessRule {
  category: 'inventory-management'
  itemType: 'whole-item' | 'fractional-item' | 'component'
  thresholdType: 'minimum-level' | 'reorder-point' | 'maximum-level' | 'expiration-warning'
  calculationMethod: 'static' | 'dynamic-demand' | 'seasonal' | 'predictive'
  forecastingPeriod?: number                    // Days
  demandVariability?: number                    // 0-1.0
  leadTimeBuffer?: number                       // Days
}

// Waste Management Rule (extends BusinessRule)
export interface WasteManagementRule extends BusinessRule {
  category: 'waste-management'
  wasteCategory: 'food-prep' | 'service-waste' | 'expired-items' | 'damaged-items' | 'overproduction'
  minimizationStrategy: string
  costImpactThreshold: number                   // Dollar amount
  trackingRequired: boolean
  reportingFrequency: 'real-time' | 'daily' | 'weekly' | 'monthly'
}
```

### 3.3 Compliance Types

```typescript
// Compliance Violation
export interface ComplianceViolation {
  id: string                                    // Violation UUID
  ruleId: string                                // Rule that was violated
  ruleName: string                              // Rule name for display
  violationType: 'critical' | 'major' | 'minor' | 'observation'
  description: string                           // What happened
  location: string                              // Where it happened
  timestamp: Date                               // When it happened
  detectedBy: 'system' | 'manual' | 'audit'     // Detection method
  status: ViolationStatus
  assignedTo?: string                           // User ID responsible for resolution
  correctiveActions: CorrectiveAction[]         // Actions to resolve
  businessImpact: 'safety-risk' | 'financial-loss' | 'reputation-risk' | 'operational-inefficiency'
  estimatedCost?: number                        // Estimated cost of violation
}

export type ViolationStatus =
  | 'open'                                      // Newly detected
  | 'acknowledged'                              // Manager acknowledged
  | 'corrective-action'                         // Actions in progress
  | 'resolved'                                  // All actions completed
  | 'verified'                                  // Resolution verified

// Corrective Action
export interface CorrectiveAction {
  id: string
  action: string                                // Description of action
  responsible: string                           // User ID or role
  targetDate: Date                              // Deadline
  status: 'pending' | 'in-progress' | 'completed' | 'overdue'
  evidenceRequired: boolean                     // Photo/document required?
  verificationMethod: string                    // How to verify completion
}
```

### 3.4 Analytics Types

```typescript
// Rule Analytics
export interface RuleAnalytics {
  overview: {
    totalRules: number
    activeRules: number
    inactiveRules: number
    totalTriggers: number
    successfulTriggers: number
    failedTriggers: number
    overallSuccessRate: number                  // Percentage
    averageProcessingTime: number               // Milliseconds
    lastUpdated: string                         // ISO timestamp
  }
  rulePerformance: RulePerformance[]            // Per-rule metrics
  categoryBreakdown: Record<string, CategoryPerformance>
  timeSeriesData: {
    daily: DailyMetric[]
    hourly: HourlyMetric[]
  }
  errorAnalysis: {
    commonErrors: ErrorMetric[]
    resolutionSuggestions: ErrorSuggestion[]
  }
}

// Rule Performance
export interface RulePerformance {
  ruleId: string
  ruleName: string
  triggerCount: number
  successCount: number
  failureCount: number
  successRate: number                           // Percentage
  averageProcessingTime: number                 // Milliseconds
  costSavings: number                           // Dollar amount
  timesSaved: number                            // Hours
  lastTriggered: string                         // ISO timestamp
  trend: 'increasing' | 'decreasing' | 'stable'
  weeklyTriggers: number[]                      // Last 7 days
  monthlyTriggers: number[]                     // Last 30 days
}

// Category Performance
export interface CategoryPerformance {
  ruleCount: number
  triggerCount: number
  successRate: number                           // Percentage
  costSavings: number                           // Dollar amount
}

// Daily Metric
export interface DailyMetric {
  date: string                                  // YYYY-MM-DD
  triggers: number
  successes: number
  failures: number
  processingTime: number                        // Average ms
}

// Hourly Metric
export interface HourlyMetric {
  hour: number                                  // 0-23
  triggers: number
  avgProcessingTime: number                     // Milliseconds
}

// Error Metric
export interface ErrorMetric {
  errorType: string
  count: number
  percentage: number
  description: string
}

// Error Suggestion
export interface ErrorSuggestion {
  errorType: string
  suggestion: string
}
```

### 3.5 Audit Types

```typescript
// Rule Audit Trail
export interface RuleAuditTrail {
  id: string                                    // Audit entry UUID
  ruleId: string                                // Rule being audited
  action: 'created' | 'modified' | 'activated' | 'deactivated' | 'deleted'
  changes: Record<string, { from: any; to: any }>  // Field changes
  reason: string                                // User-provided reason
  performedBy: string                           // User ID
  timestamp: Date
  approvedBy?: string                           // User ID (if approval required)
  businessJustification: string                 // Business reason for change
  impactAssessment: string                      // Expected impact
}
```

---

## 4. State Management Patterns

### 4.1 Local State Pattern (Current Implementation)

```typescript
// Component-level state management using React hooks
export default function BusinessRulesPage() {
  // UI State - simple useState for UI controls
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedRule, setSelectedRule] = useState<BusinessRule | null>(null)
  const [editRuleOpen, setEditRuleOpen] = useState(false)

  // Data State - currently mock data, will be replaced with server state
  const [rules, setRules] = useState<BusinessRule[]>(mockRules)
  const [violations, setViolations] = useState<ComplianceViolation[]>(mockViolations)

  // Computed State - useMemo for expensive calculations
  const filteredRules = useMemo(() => {
    return rules.filter(/* filtering logic */)
  }, [rules, searchQuery, selectedCategory])

  const metrics = useMemo(() => ({
    totalRules: rules.length,
    activeRules: rules.filter(r => r.isActive).length,
    // ... more metrics
  }), [rules, violations])

  // Event Handlers
  const handleSaveRule = (rule: BusinessRule) => {
    setRules(prev => {
      const index = prev.findIndex(r => r.id === rule.id)
      if (index >= 0) {
        // Update existing rule
        const updated = [...prev]
        updated[index] = rule
        return updated
      } else {
        // Add new rule
        return [...prev, rule]
      }
    })
    setEditRuleOpen(false)
  }

  return (/* JSX */)
}
```

### 4.2 Server State Pattern (Planned with React Query)

```typescript
// Planned implementation with React Query
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function BusinessRulesPage() {
  const queryClient = useQueryClient()

  // Fetch rules with automatic caching and refetching
  const { data: rules, isLoading, error } = useQuery({
    queryKey: ['business-rules'],
    queryFn: async () => {
      const response = await fetch('/api/business-rules')
      return response.json() as Promise<BusinessRule[]>
    },
    staleTime: 5 * 60 * 1000,  // 5 minutes
    refetchInterval: 5 * 60 * 1000  // Auto-refresh every 5 minutes
  })

  // Create/Update rule mutation with optimistic updates
  const saveRuleMutation = useMutation({
    mutationFn: async (rule: BusinessRule) => {
      const response = await fetch(`/api/business-rules/${rule.id}`, {
        method: rule.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule)
      })
      return response.json()
    },
    onMutate: async (newRule) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['business-rules'] })
      const previousRules = queryClient.getQueryData(['business-rules'])

      queryClient.setQueryData(['business-rules'], (old: BusinessRule[]) => {
        const index = old.findIndex(r => r.id === newRule.id)
        if (index >= 0) {
          const updated = [...old]
          updated[index] = newRule
          return updated
        }
        return [...old, newRule]
      })

      return { previousRules }
    },
    onError: (err, newRule, context) => {
      // Rollback on error
      queryClient.setQueryData(['business-rules'], context?.previousRules)
    },
    onSettled: () => {
      // Refetch to ensure sync with server
      queryClient.invalidateQueries({ queryKey: ['business-rules'] })
    }
  })

  // Delete rule mutation
  const deleteRuleMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      await fetch(`/api/business-rules/${ruleId}`, { method: 'DELETE' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-rules'] })
    }
  })

  // UI State (remains local)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedRule, setSelectedRule] = useState<BusinessRule | null>(null)

  // Computed State (with safety check for loading state)
  const filteredRules = useMemo(() => {
    if (!rules) return []
    return rules.filter(/* filtering logic */)
  }, [rules, searchQuery])

  if (isLoading) return <LoadingSpinner />
  if (error) return <ErrorMessage error={error} />

  return (/* JSX */)
}
```

### 4.3 Form State Pattern (React Hook Form + Zod)

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// Zod Schema for Rule Validation
const ruleSchema = z.object({
  name: z.string()
    .min(3, "Rule name must be at least 3 characters")
    .max(100, "Rule name must not exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Rule name can only contain letters, numbers, spaces, hyphens, and underscores"),

  description: z.string()
    .min(10, "Description must be at least 10 characters")
    .max(500, "Description must not exceed 500 characters"),

  category: z.enum([
    'fractional-sales',
    'food-safety',
    'quality-control',
    'inventory-management',
    'waste-management',
    'vendor-selection',
    'pricing',
    'approval',
    'currency'
  ]),

  priority: z.number()
    .int("Priority must be an integer")
    .min(1, "Priority must be at least 1")
    .max(10, "Priority must not exceed 10"),

  conditions: z.array(z.object({
    field: z.string().min(1, "Field is required"),
    operator: z.enum(['equals', 'contains', 'greaterThan', 'lessThan', 'between', 'in', 'not_equals']),
    value: z.any(),
    logicalOperator: z.enum(['AND', 'OR']).nullable().optional()
  })).min(1, 'At least one condition is required'),

  actions: z.array(z.object({
    type: z.string().min(1, "Action type is required"),
    parameters: z.record(z.any())
  })).min(1, 'At least one action is required')
})

type RuleFormData = z.infer<typeof ruleSchema>

export function RuleBuilder({ rule, onSave }: { rule?: BusinessRule; onSave: (rule: BusinessRule) => void }) {
  const form = useForm<RuleFormData>({
    resolver: zodResolver(ruleSchema),
    defaultValues: rule || {
      name: "",
      description: "",
      category: "fractional-sales",
      priority: 5,
      conditions: [],
      actions: []
    }
  })

  const handleSubmit = form.handleSubmit((data) => {
    const savedRule: BusinessRule = {
      id: rule?.id || crypto.randomUUID(),
      ...data,
      isActive: rule?.isActive || false,
      createdBy: rule?.createdBy || 'current-user-id',
      createdAt: rule?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      triggerCount: rule?.triggerCount || 0,
      successRate: rule?.successRate || 0
    }
    onSave(savedRule)
  })

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rule Name</FormLabel>
              <FormControl>
                <Input placeholder="Pizza Slice Holding Time Limits" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enforces maximum holding time for cut pizza slices..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* ... more form fields ... */}

        <Button type="submit">Save Rule</Button>
      </form>
    </Form>
  )
}
```

---

## 5. API Patterns (Planned)

### 5.1 Server Actions Pattern

```typescript
// app/(main)/system-administration/business-rules/actions.ts
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// Create or Update Business Rule
export async function saveBusinessRule(formData: FormData) {
  const schema = z.object({
    id: z.string().optional(),
    name: z.string().min(3).max(100),
    description: z.string().min(10).max(500),
    category: z.enum([/* categories */]),
    priority: z.number().int().min(1).max(10),
    conditions: z.array(z.object({/* condition schema */})),
    actions: z.array(z.object({/* action schema */}))
  })

  const validated = schema.parse(Object.fromEntries(formData))

  try {
    const rule = await prisma.tb_business_rule.upsert({
      where: { id: validated.id || crypto.randomUUID() },
      update: {
        name: validated.name,
        description: validated.description,
        category: validated.category,
        priority: validated.priority,
        conditions: validated.conditions,
        actions: validated.actions,
        updated_at: new Date()
      },
      create: {
        id: crypto.randomUUID(),
        name: validated.name,
        description: validated.description,
        category: validated.category,
        priority: validated.priority,
        conditions: validated.conditions,
        actions: validated.actions,
        is_active: false,
        created_by_id: 'current-user-id',  // From session
        trigger_count: 0,
        success_count: 0
      }
    })

    revalidatePath('/system-administration/business-rules')
    return { success: true, rule }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Toggle Rule Active Status
export async function toggleRuleStatus(ruleId: string, reason: string) {
  try {
    const rule = await prisma.tb_business_rule.findUnique({
      where: { id: ruleId }
    })

    if (!rule) {
      throw new Error('Rule not found')
    }

    const updated = await prisma.tb_business_rule.update({
      where: { id: ruleId },
      data: {
        is_active: !rule.is_active,
        updated_at: new Date()
      }
    })

    // Create audit trail entry
    await prisma.tb_rule_audit.create({
      data: {
        rule_id: ruleId,
        action: updated.is_active ? 'activated' : 'deactivated',
        reason,
        performed_by_id: 'current-user-id',
        timestamp: new Date()
      }
    })

    revalidatePath('/system-administration/business-rules')
    return { success: true, rule: updated }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Delete Business Rule
export async function deleteBusinessRule(ruleId: string, reason: string) {
  try {
    // Soft delete
    const deleted = await prisma.tb_business_rule.update({
      where: { id: ruleId },
      data: {
        deleted_at: new Date(),
        deleted_by_id: 'current-user-id'
      }
    })

    // Create audit trail entry
    await prisma.tb_rule_audit.create({
      data: {
        rule_id: ruleId,
        action: 'deleted',
        reason,
        performed_by_id: 'current-user-id',
        timestamp: new Date()
      }
    })

    revalidatePath('/system-administration/business-rules')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Acknowledge Compliance Violation
export async function acknowledgeViolation(violationId: string, note: string) {
  try {
    const updated = await prisma.tb_compliance_violation.update({
      where: { id: violationId },
      data: {
        status: 'acknowledged',
        acknowledged_at: new Date(),
        acknowledged_by_id: 'current-user-id',
        acknowledgment_note: note
      }
    })

    revalidatePath('/system-administration/business-rules/compliance-monitoring')
    return { success: true, violation: updated }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Assign Corrective Action
export async function assignCorrectiveAction(
  violationId: string,
  action: string,
  assignedTo: string,
  targetDate: Date,
  evidenceRequired: boolean,
  verificationMethod: string
) {
  try {
    const created = await prisma.tb_corrective_action.create({
      data: {
        id: crypto.randomUUID(),
        violation_id: violationId,
        action,
        assigned_to_id: assignedTo,
        target_date: targetDate,
        status: 'pending',
        evidence_required: evidenceRequired,
        verification_method: verificationMethod,
        created_by_id: 'current-user-id'
      }
    })

    // Update violation status to 'corrective-action'
    await prisma.tb_compliance_violation.update({
      where: { id: violationId },
      data: { status: 'corrective-action' }
    })

    revalidatePath('/system-administration/business-rules/compliance-monitoring')
    return { success: true, action: created }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

### 5.2 API Route Handlers (Alternative Pattern)

```typescript
// app/api/business-rules/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/business-rules - List all rules
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const category = searchParams.get('category')
    const isActive = searchParams.get('isActive')

    const rules = await prisma.tb_business_rule.findMany({
      where: {
        deleted_at: null,
        ...(category && { category }),
        ...(isActive !== null && { is_active: isActive === 'true' })
      },
      orderBy: { priority: 'desc' }
    })

    return NextResponse.json(rules)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch rules' },
      { status: 500 }
    )
  }
}

// POST /api/business-rules - Create new rule
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validation would happen here
    const rule = await prisma.tb_business_rule.create({
      data: {
        ...body,
        id: crypto.randomUUID(),
        is_active: false,
        created_by_id: 'current-user-id',
        trigger_count: 0,
        success_count: 0
      }
    })

    return NextResponse.json(rule, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create rule' },
      { status: 500 }
    )
  }
}

// app/api/business-rules/[id]/route.ts
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()

    const updated = await prisma.tb_business_rule.update({
      where: { id: params.id },
      data: {
        ...body,
        updated_at: new Date()
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update rule' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Soft delete
    await prisma.tb_business_rule.update({
      where: { id: params.id },
      data: {
        deleted_at: new Date(),
        deleted_by_id: 'current-user-id'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete rule' },
      { status: 500 }
    )
  }
}
```

---

## 6. UI Components Specifications

### 6.1 RulesTable Component

```typescript
import { ColumnDef } from '@tanstack/react-table'
import { BusinessRule } from '@/lib/types/business-rules'

const columns: ColumnDef<BusinessRule>[] = [
  {
    accessorKey: 'name',
    header: 'Rule Name',
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="font-medium">{row.original.name}</span>
        <span className="text-sm text-muted-foreground">
          {row.original.description.substring(0, 60)}...
        </span>
      </div>
    )
  },
  {
    accessorKey: 'category',
    header: 'Category',
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.category.replace('-', ' ')}
      </Badge>
    )
  },
  {
    accessorKey: 'priority',
    header: 'Priority',
    cell: ({ row }) => (
      <div className="flex items-center">
        <span className={cn(
          "font-medium",
          row.original.priority >= 9 && "text-red-500",
          row.original.priority >= 7 && row.original.priority < 9 && "text-orange-500",
          row.original.priority < 7 && "text-green-500"
        )}>
          {row.original.priority}
        </span>
      </div>
    )
  },
  {
    accessorKey: 'isActive',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? 'default' : 'secondary'}>
        {row.original.isActive ? 'Active' : 'Inactive'}
      </Badge>
    )
  },
  {
    accessorKey: 'successRate',
    header: 'Success Rate',
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Progress value={row.original.successRate} className="w-16" />
        <span className="text-sm">{row.original.successRate.toFixed(1)}%</span>
      </div>
    )
  },
  {
    accessorKey: 'triggerCount',
    header: 'Triggers',
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.triggerCount.toLocaleString()}
      </span>
    )
  },
  {
    id: 'actions',
    header: 'Actions',
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleEdit(row.original)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleTest(row.original)}>
            <TestTube className="mr-2 h-4 w-4" />
            Test
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleToggleStatus(row.original)}>
            {row.original.isActive ? (
              <>
                <PauseCircle className="mr-2 h-4 w-4" />
                Deactivate
              </>
            ) : (
              <>
                <PlayCircle className="mr-2 h-4 w-4" />
                Activate
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDuplicate(row.original)}>
            <Copy className="mr-2 h-4 w-4" />
            Duplicate
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-red-600"
            onClick={() => handleDelete(row.original)}
          >
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }
]

export function RulesTable({
  rules,
  onEdit,
  onToggleStatus,
  onDelete
}: {
  rules: BusinessRule[]
  onEdit: (rule: BusinessRule) => void
  onToggleStatus: (rule: BusinessRule) => void
  onDelete: (rule: BusinessRule) => void
}) {
  const table = useReactTable({
    data: rules,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel()
  })

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredRowModel().rows.length} rule(s) total
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
```

### 6.2 ViolationDetail Component

```typescript
export function ViolationDetail({
  violation,
  onUpdate,
  onClose
}: {
  violation: ComplianceViolation | null
  onUpdate: (violation: ComplianceViolation) => void
  onClose: () => void
}) {
  if (!violation) return null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">{violation.ruleName}</h2>
          <p className="text-sm text-muted-foreground">
            Violation ID: {violation.id}
          </p>
        </div>
        <Badge variant={
          violation.violationType === 'critical' ? 'destructive' :
          violation.violationType === 'major' ? 'default' :
          'secondary'
        }>
          {violation.violationType}
        </Badge>
      </div>

      {/* Violation Information */}
      <Card>
        <CardHeader>
          <CardTitle>Violation Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Description</Label>
            <p className="text-sm">{violation.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Location</Label>
              <p className="text-sm">{violation.location}</p>
            </div>
            <div>
              <Label>Detected</Label>
              <p className="text-sm">
                {formatDistance(violation.timestamp, new Date(), { addSuffix: true })}
              </p>
            </div>
          </div>
          <div>
            <Label>Business Impact</Label>
            <Badge variant="outline">{violation.businessImpact}</Badge>
          </div>
          {violation.estimatedCost && (
            <div>
              <Label>Estimated Cost</Label>
              <p className="text-sm font-medium">
                ${violation.estimatedCost.toFixed(2)}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Corrective Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Corrective Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {violation.correctiveActions.map((action) => (
            <div
              key={action.id}
              className="flex items-start gap-4 p-4 border rounded-lg"
            >
              <div className="flex-1">
                <p className="font-medium">{action.action}</p>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {action.responsible}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(action.targetDate, 'PP')}
                  </div>
                </div>
                {action.evidenceRequired && (
                  <div className="mt-2">
                    <Badge variant="secondary" className="text-xs">
                      Evidence Required
                    </Badge>
                  </div>
                )}
              </div>
              <Badge variant={
                action.status === 'completed' ? 'default' :
                action.status === 'in-progress' ? 'secondary' :
                action.status === 'overdue' ? 'destructive' :
                'outline'
              }>
                {action.status}
              </Badge>
            </div>
          ))}

          <Button onClick={() => handleAddCorrectiveAction(violation)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Corrective Action
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-2">
        {violation.status === 'open' && (
          <Button onClick={() => handleAcknowledge(violation)}>
            Acknowledge Violation
          </Button>
        )}
        {violation.status === 'corrective-action' &&
         violation.correctiveActions.every(a => a.status === 'completed') && (
          <Button onClick={() => handleResolve(violation)}>
            Resolve Violation
          </Button>
        )}
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      </div>
    </div>
  )
}
```

---

## 7. Performance Considerations

### 7.1 Optimization Strategies

**Data Fetching**:
- Use React Query for automatic caching and background refetching
- Implement pagination for large datasets (50 items per page)
- Use optimistic updates for better perceived performance
- Lazy load analytics data only when analytics tab is viewed

**Rendering**:
- Use `useMemo` for expensive filtering/sorting operations
- Implement virtualization for long lists (>100 items) using `react-window`
- Debounce search input (300ms delay)
- Use React.memo for static components

**Code Splitting**:
- Lazy load rule builder component: `const RuleBuilder = lazy(() => import('./components/RuleBuilder'))`
- Lazy load analytics dashboard
- Lazy load compliance monitoring page

**Bundle Optimization**:
- Tree-shake unused UI components
- Use dynamic imports for heavy dependencies (charts library)
- Minimize use of large icon sets

### 7.2 Performance Targets

- **Page Load**: <2 seconds
- **Rule List Filtering**: <100ms
- **Rule Evaluation**: <100ms per rule
- **Analytics Refresh**: <5 seconds
- **Search Debounce**: 300ms
- **Table Sorting**: <50ms

---

## Sitemap

### Overview
This section provides a complete navigation structure of all pages, tabs, and dialogues in the Business Rules sub-module.

### Page Hierarchy

```mermaid
graph TD
    ListPage['List Page<br>(/system-administration/business-rules)']
    CreatePage['Create Page<br>(/system-administration/business-rules/new)']
    DetailPage["Detail Page<br>(/system-administration/business-rules/[id])"]
    EditPage["Edit Page<br>(/system-administration/business-rules/[id]/edit)"]

    %% List Page Tabs
    ListPage --> ListTab1['Tab: All Items']
    ListPage --> ListTab2['Tab: Active']
    ListPage --> ListTab3['Tab: Archived']

    %% List Page Dialogues
    ListPage -.-> ListDialog1['Dialog: Quick Create']
    ListPage -.-> ListDialog2['Dialog: Bulk Actions']
    ListPage -.-> ListDialog3['Dialog: Export']
    ListPage -.-> ListDialog4['Dialog: Filter']

    %% Detail Page Tabs
    DetailPage --> DetailTab1['Tab: Overview']
    DetailPage --> DetailTab2['Tab: History']
    DetailPage --> DetailTab3['Tab: Activity Log']

    %% Detail Page Dialogues
    DetailPage -.-> DetailDialog1['Dialog: Edit']
    DetailPage -.-> DetailDialog2['Dialog: Delete Confirm']
    DetailPage -.-> DetailDialog3['Dialog: Status Change']

    %% Create/Edit Dialogues
    CreatePage -.-> CreateDialog1['Dialog: Cancel Confirm']
    CreatePage -.-> CreateDialog2['Dialog: Save Draft']

    EditPage -.-> EditDialog1['Dialog: Discard Changes']
    EditPage -.-> EditDialog2['Dialog: Save Draft']

    %% Navigation Flow
    ListPage --> DetailPage
    ListPage --> CreatePage
    DetailPage --> EditPage
    CreatePage --> DetailPage
    EditPage --> DetailPage

    style ListPage fill:#e1f5ff
    style CreatePage fill:#fff4e1
    style DetailPage fill:#e8f5e9
    style EditPage fill:#fce4ec
```

### Pages

#### 1. List Page
**Route**: `/system-administration/business-rules`
**File**: `page.tsx`
**Purpose**: Display paginated list of all business rules

**Sections**:
- Header: Title, breadcrumbs, primary actions
- Filters: Quick filters, advanced filter panel
- Search: Global search with autocomplete
- Data Table: Sortable columns, row actions, bulk selection
- Pagination: Page size selector, page navigation

**Tabs**:
- **All Items**: Complete list of all business rules
- **Active**: Filter active items only
- **Archived**: View archived items

**Dialogues**:
- **Quick Create**: Fast creation form with essential fields only
- **Bulk Actions**: Multi-select actions (delete, export, status change)
- **Export**: Export data in various formats (CSV, Excel, PDF)
- **Filter**: Advanced filtering with multiple criteria

#### 2. Detail Page
**Route**: `/system-administration/business-rules/[id]`
**File**: `[id]/page.tsx`
**Purpose**: Display comprehensive business rule details

**Sections**:
- Header: Breadcrumbs, business rule title, action buttons
- Info Cards: Multiple cards showing different aspects
- Related Data: Associated records and relationships

**Tabs**:
- **Overview**: Key information and summary
- **History**: Change history and audit trail
- **Activity Log**: User actions and system events

**Dialogues**:
- **Edit**: Navigate to edit form
- **Delete Confirm**: Confirmation before deletion
- **Status Change**: Change business rule status with reason

#### 3. Create Page
**Route**: `/system-administration/business-rules/new`
**File**: `new/page.tsx`
**Purpose**: Create new business rule

**Sections**:
- Form Header: Title, Save/Cancel actions
- Form Fields: All required and optional fields
- Validation: Real-time field validation

**Dialogues**:
- **Cancel Confirm**: Confirm discarding unsaved changes
- **Save Draft**: Save incomplete form as draft

#### 4. Edit Page
**Route**: `/system-administration/business-rules/[id]/edit`
**File**: `[id]/edit/page.tsx`
**Purpose**: Modify existing business rule

**Sections**:
- Form Header: Title, Save/Cancel/Delete actions
- Form Fields: Pre-populated with existing data
- Change Tracking: Highlight modified fields

**Dialogues**:
- **Discard Changes**: Confirm discarding modifications
- **Save Draft**: Save changes as draft


## 8. Testing Strategy

### 8.1 Unit Tests (Vitest)

```typescript
// components/__tests__/RulesTable.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RulesTable } from '../RulesTable'
import { mockRules } from '@/lib/mock-data/business-rules'

describe('RulesTable', () => {
  it('renders rules correctly', () => {
    render(
      <RulesTable
        rules={mockRules}
        onEdit={vi.fn()}
        onToggleStatus={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getByText('Pizza Slice Holding Time Limits')).toBeInTheDocument()
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('calls onEdit when edit button is clicked', () => {
    const onEdit = vi.fn()
    render(
      <RulesTable
        rules={mockRules}
        onEdit={onEdit}
        onToggleStatus={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    const editButton = screen.getByLabelText('Edit rule')
    fireEvent.click(editButton)
    expect(onEdit).toHaveBeenCalledWith(mockRules[0])
  })

  it('filters rules based on search query', () => {
    const { rerender } = render(
      <RulesTable
        rules={mockRules}
        onEdit={vi.fn()}
        onToggleStatus={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getAllByRole('row')).toHaveLength(mockRules.length + 1) // +1 for header

    // Apply filter
    const filteredRules = mockRules.filter(r => r.category === 'food-safety')
    rerender(
      <RulesTable
        rules={filteredRules}
        onEdit={vi.fn()}
        onToggleStatus={vi.fn()}
        onDelete={vi.fn()}
      />
    )

    expect(screen.getAllByRole('row')).toHaveLength(filteredRules.length + 1)
  })
})
```

### 8.2 Integration Tests

```typescript
// app/__tests__/business-rules.test.tsx
import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import BusinessRulesPage from '../page'

describe('BusinessRulesPage Integration', () => {
  it('loads and displays rules', async () => {
    render(<BusinessRulesPage />)

    await waitFor(() => {
      expect(screen.getByText('Business Rules')).toBeInTheDocument()
    })

    expect(screen.getByText('Total Rules')).toBeInTheDocument()
    expect(screen.getByText('Active Rules')).toBeInTheDocument()
  })

  it('navigates between tabs', async () => {
    render(<BusinessRulesPage />)

    const violationsTab = screen.getByText('Violations')
    fireEvent.click(violationsTab)

    await waitFor(() => {
      expect(screen.getByText('Active Violations')).toBeInTheDocument()
    })
  })
})
```

---

**Document Control**:
- **Created**: 2025-01-16
- **Version**: 1.0
- **Status**: Planned Implementation
- **Next Review**: Upon module implementation start
