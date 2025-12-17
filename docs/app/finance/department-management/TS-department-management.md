# Technical Specification: Department and Cost Center Management

## Module Information
- **Module**: Finance
- **Sub-Module**: Department and Cost Center Management  
- **Version**: 1.0.0
- **Last Updated**: 2025-01-13
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-01-13 | Development Team | Initial technical specification |

---

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 14 with App Router and Server Components
- **Language**: TypeScript 5.8+ (strict mode)
- **Database**: PostgreSQL with Prisma ORM
- **API**: Server Actions for mutations, Server Components for queries
- **Validation**: Zod schemas for type-safe validation
- **UI**: React 18+ with Shadcn/UI components
- **State Management**: React Query for server state, Zustand for client state

### Module Structure
```
app/(main)/finance/department-management/
├── page.tsx                           # Department list page
├── [id]/
│   ├── page.tsx                       # Department details page
│   └── edit/
│       └── page.tsx                   # Department edit page
├── new/
│   └── page.tsx                       # Create department page
├── components/
│   ├── DepartmentList.tsx             # Department list component
│   ├── DepartmentForm.tsx             # Department form component
│   ├── DepartmentHierarchyTree.tsx    # Hierarchy visualization
│   ├── DepartmentHeadForm.tsx         # Department head assignment
│   ├── BudgetAllocationForm.tsx       # Budget allocation component
│   └── ApprovalWorkflowConfig.tsx     # Approval workflow setup
├── actions.ts                         # Server actions for mutations
└── types.ts                           # TypeScript interfaces

lib/
├── services/
│   ├── department.service.ts          # Department business logic
│   ├── cost-center.service.ts         # Cost center logic
│   └── approval-routing.service.ts    # Approval workflow logic
├── validations/
│   └── department.validation.ts       # Zod schemas
└── utils/
    └── hierarchy.utils.ts             # Hierarchy helper functions
```

---

## Database Schema

### Core Tables

```prisma
model Department {
  id                    String    @id @default(cuid())
  departmentCode        String    @unique @map("department_code")
  departmentName        String    @map("department_name")
  departmentShortName   String?   @map("department_short_name")
  description           String?
  
  // Classification
  departmentType        DepartmentType @map("department_type")
  isCostCenter          Boolean   @default(false) @map("is_cost_center")
  costCenterCode        String?   @map("cost_center_code")
  
  // Hierarchy
  parentDepartmentId    String?   @map("parent_department_id")
  parentDepartment      Department? @relation("DepartmentHierarchy", fields: [parentDepartmentId], references: [id])
  childDepartments      Department[] @relation("DepartmentHierarchy")
  hierarchyLevel        Int       @default(0) @map("hierarchy_level")
  hierarchyPath         String    @map("hierarchy_path")
  
  // Account and Budget
  defaultAccountCode    String?   @map("default_account_code")
  budgetYear            Int       @map("budget_year")
  budgetAmount          Decimal   @db.Decimal(18, 2) @map("budget_amount")
  budgetCurrency        String    @default("USD") @map("budget_currency")
  
  // Location
  primaryLocationId     String?   @map("primary_location_id")
  physicalLocation      String?   @map("physical_location")
  phoneNumber           String?   @map("phone_number")
  emailAddress          String?   @map("email_address")
  
  // Status
  status                DepartmentStatus @default(DRAFT)
  effectiveDate         DateTime  @map("effective_date")
  endDate               DateTime? @map("end_date")
  
  // Approval Configuration
  requiresApprovalWorkflow Boolean @default(true) @map("requires_approval_workflow")
  approvalLimit         Decimal   @db.Decimal(18, 2) @map("approval_limit")
  approvalCurrency      String    @default("USD") @map("approval_currency")
  allowSubDepartments   Boolean   @default(true) @map("allow_sub_departments")
  
  // Audit
  createdBy             String    @map("created_by")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedBy             String?   @map("updated_by")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  notes                 String?
  
  // Relationships
  departmentHeads       DepartmentHead[]
  costCenters           CostCenter[]
  budgets               DepartmentBudget[]
  approvalConfigs       DepartmentApprovalConfig[]
  
  @@map("departments")
  @@index([departmentCode])
  @@index([parentDepartmentId, hierarchyLevel])
  @@index([status])
  @@index([hierarchyPath])
}

model DepartmentHead {
  id                    String    @id @default(cuid())
  departmentId          String    @map("department_id")
  department            Department @relation(fields: [departmentId], references: [id], onDelete: Cascade)
  userId                String    @map("user_id")
  
  // Role and Priority
  headRole              DepartmentHeadRole @map("head_role")
  priorityOrder         Int       @default(1) @map("priority_order")
  
  // Contact
  email                 String
  secondaryEmail        String?   @map("secondary_email")
  phone                 String
  mobilePhone           String?   @map("mobile_phone")
  officeLocation        String?   @map("office_location")
  
  // Approval Configuration
  approvalLimit         Decimal   @db.Decimal(18, 2) @map("approval_limit")
  approvalLimitCurrency String    @default("USD") @map("approval_limit_currency")
  canApproveBudgets     Boolean   @default(false) @map("can_approve_budgets")
  canApproveTransfers   Boolean   @default(false) @map("can_approve_transfers")
  canDelegateApproval   Boolean   @default(false) @map("can_delegate_approval")
  
  // Delegation
  delegateToUserId      String?   @map("delegate_to_user_id")
  delegationStartDate   DateTime? @map("delegation_start_date")
  delegationEndDate     DateTime? @map("delegation_end_date")
  delegationReason      String?   @map("delegation_reason")
  
  // Status
  isActive              Boolean   @default(true) @map("is_active")
  effectiveDate         DateTime  @map("effective_date")
  endDate               DateTime? @map("end_date")
  terminationReason     String?   @map("termination_reason")
  
  // Performance Metrics (updated periodically)
  approvalsThisMonth    Int       @default(0) @map("approvals_this_month")
  averageApprovalTimeHours Decimal @db.Decimal(8, 2) @default(0) @map("average_approval_time_hours")
  pendingApprovalsCount Int       @default(0) @map("pending_approvals_count")
  
  // Audit
  assignedBy            String    @map("assigned_by")
  assignedAt            DateTime  @default(now()) @map("assigned_at")
  updatedBy             String?   @map("updated_by")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  notes                 String?
  
  @@unique([departmentId, userId, headRole])
  @@map("department_heads")
  @@index([userId])
  @@index([isActive])
}

model CostCenter {
  id                    String    @id @default(cuid())
  costCenterCode        String    @unique @map("cost_center_code")
  costCenterName        String    @map("cost_center_name")
  description           String?
  
  // Department Association
  departmentId          String    @map("department_id")
  department            Department @relation(fields: [departmentId], references: [id])
  isPrimaryCostCenter   Boolean   @default(false) @map("is_primary_cost_center")
  
  // Classification
  costCenterType        CostCenterType @map("cost_center_type")
  activityType          String?   @map("activity_type")
  
  // Financial Configuration
  glAccountCode         String?   @map("gl_account_code")
  budgetAmount          Decimal   @db.Decimal(18, 2) @map("budget_amount")
  budgetCurrency        String    @default("USD") @map("budget_currency")
  budgetYear            Int       @map("budget_year")
  
  // Management
  costCenterManagerUserId String? @map("cost_center_manager_user_id")
  managerApprovalLimit  Decimal?  @db.Decimal(18, 2) @map("manager_approval_limit")
  
  // Cost Allocation
  isSharedCostCenter    Boolean   @default(false) @map("is_shared_cost_center")
  allocationMethod      String?   @map("allocation_method") // headcount, square_footage, revenue, manual
  allocationRules       Json?     @map("allocation_rules")
  
  // Status
  status                CostCenterStatus @default(ACTIVE)
  effectiveDate         DateTime  @map("effective_date")
  endDate               DateTime? @map("end_date")
  
  // Audit
  createdBy             String    @map("created_by")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedBy             String?   @map("updated_by")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  notes                 String?
  
  @@map("cost_centers")
  @@index([departmentId])
  @@index([status])
}

model DepartmentBudget {
  id                    String    @id @default(cuid())
  departmentId          String    @map("department_id")
  department            Department @relation(fields: [departmentId], references: [id])
  costCenterId          String?   @map("cost_center_id")
  
  // Fiscal Period
  fiscalYear            Int       @map("fiscal_year")
  fiscalPeriod          String?   @map("fiscal_period") // FY2025, Q1-2025, 2025-01
  budgetType            BudgetType @map("budget_type")
  
  // Budget Amounts
  budgetCurrency        String    @default("USD") @map("budget_currency")
  totalBudgetAmount     Decimal   @db.Decimal(18, 2) @map("total_budget_amount")
  
  // Monthly Phasing
  januaryBudget         Decimal?  @db.Decimal(18, 2) @map("january_budget")
  februaryBudget        Decimal?  @db.Decimal(18, 2) @map("february_budget")
  marchBudget           Decimal?  @db.Decimal(18, 2) @map("march_budget")
  aprilBudget           Decimal?  @db.Decimal(18, 2) @map("april_budget")
  mayBudget             Decimal?  @db.Decimal(18, 2) @map("may_budget")
  juneBudget            Decimal?  @db.Decimal(18, 2) @map("june_budget")
  julyBudget            Decimal?  @db.Decimal(18, 2) @map("july_budget")
  augustBudget          Decimal?  @db.Decimal(18, 2) @map("august_budget")
  septemberBudget       Decimal?  @db.Decimal(18, 2) @map("september_budget")
  octoberBudget         Decimal?  @db.Decimal(18, 2) @map("october_budget")
  novemberBudget        Decimal?  @db.Decimal(18, 2) @map("november_budget")
  decemberBudget        Decimal?  @db.Decimal(18, 2) @map("december_budget")
  
  // Category
  budgetCategory        String?   @map("budget_category")
  budgetLineItem        String?   @map("budget_line_item")
  
  // Tracking
  spentToDate           Decimal   @db.Decimal(18, 2) @default(0) @map("spent_to_date")
  committedAmount       Decimal   @db.Decimal(18, 2) @default(0) @map("committed_amount")
  availableBudget       Decimal   @db.Decimal(18, 2) @map("available_budget")
  varianceAmount        Decimal   @db.Decimal(18, 2) @default(0) @map("variance_amount")
  variancePercentage    Decimal   @db.Decimal(8, 4) @default(0) @map("variance_percentage")
  
  // Alerts
  alertThreshold1       Int       @default(50) @map("alert_threshold_1")
  alertThreshold2       Int       @default(75) @map("alert_threshold_2")
  alertThreshold3       Int       @default(90) @map("alert_threshold_3")
  alertThreshold4       Int       @default(100) @map("alert_threshold_4")
  
  // Status
  status                BudgetStatus @default(DRAFT)
  approvalRequired      Boolean   @default(true) @map("approval_required")
  approvedBy            String?   @map("approved_by")
  approvedAt            DateTime? @map("approved_at")
  
  // Carry Forward
  allowCarryForward     Boolean   @default(false) @map("allow_carry_forward")
  carryForwardPercentage Int      @default(0) @map("carry_forward_percentage")
  
  // Audit
  createdBy             String    @map("created_by")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedBy             String?   @map("updated_by")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  notes                 String?
  
  @@unique([departmentId, fiscalYear, budgetCategory])
  @@map("department_budgets")
  @@index([fiscalYear])
  @@index([status])
}

model DepartmentApprovalConfig {
  id                    String    @id @default(cuid())
  departmentId          String    @map("department_id")
  department            Department @relation(fields: [departmentId], references: [id], onDelete: Cascade)
  
  // Approval Tiers (stored as JSON)
  approvalTiers         Json      @map("approval_tiers")
  // Structure:
  // [
  //   {
  //     tierNumber: 1,
  //     minAmount: 0,
  //     maxAmount: 2500,
  //     currency: "USD",
  //     approvers: [{approverType: 'user', approverId: 'user123', priorityOrder: 1}],
  //     approvalRequired: 1,
  //     timeoutHours: 24,
  //     escalateOnTimeout: true
  //   }
  // ]
  
  // Workflow Settings
  workflowType          String    @default("sequential") @map("workflow_type") // sequential, parallel, hybrid
  requireAllApprovers   Boolean   @default(false) @map("require_all_approvers")
  
  // Escalation Rules
  escalationEnabled     Boolean   @default(true) @map("escalation_enabled")
  escalationHours       Int       @default(48) @map("escalation_hours")
  escalationTo          String    @default("parent_department") @map("escalation_to") // parent_department, specified_user, role
  escalationUserId      String?   @map("escalation_user_id")
  escalationRole        String?   @map("escalation_role")
  
  // Notification Settings
  notificationEnabled   Boolean   @default(true) @map("notification_enabled")
  reminderFrequencyHours Int      @default(24) @map("reminder_frequency_hours")
  notifyOnApproval      Boolean   @default(true) @map("notify_on_approval")
  notifyOnRejection     Boolean   @default(true) @map("notify_on_rejection")
  
  // Status
  isActive              Boolean   @default(true) @map("is_active")
  effectiveDate         DateTime  @default(now()) @map("effective_date")
  endDate               DateTime? @map("end_date")
  
  // Audit
  createdBy             String    @map("created_by")
  createdAt             DateTime  @default(now()) @map("created_at")
  updatedBy             String?   @map("updated_by")
  updatedAt             DateTime  @updatedAt @map("updated_at")
  
  @@map("department_approval_configs")
  @@index([departmentId])
  @@index([isActive])
}

// Enums
enum DepartmentType {
  OPERATING
  ADMINISTRATIVE
  SUPPORT
  REVENUE_GENERATING
  
  @@map("department_type")
}

enum DepartmentStatus {
  DRAFT
  ACTIVE
  INACTIVE
  SUSPENDED
  ARCHIVED
  
  @@map("department_status")
}

enum DepartmentHeadRole {
  PRIMARY
  SECONDARY
  BACKUP
  INTERIM
  
  @@map("department_head_role")
}

enum CostCenterType {
  DIRECT
  INDIRECT
  ADMINISTRATIVE
  REVENUE_GENERATING
  
  @@map("cost_center_type")
}

enum CostCenterStatus {
  ACTIVE
  INACTIVE
  CLOSED
  
  @@map("cost_center_status")
}

enum BudgetType {
  ANNUAL
  QUARTERLY
  MONTHLY
  
  @@map("budget_type")
}

enum BudgetStatus {
  DRAFT
  APPROVED
  ACTIVE
  CLOSED
  REVISED
  
  @@map("budget_status")
}
```

---

## API Endpoints and Server Actions

### Server Actions

```typescript
// app/(main)/finance/department-management/actions.ts

'use server'

import { z } from 'zod'
import { revalidatePath } from 'next/cache'
import { DepartmentService } from '@/lib/services/department.service'
import { departmentSchema, departmentHeadSchema } from '@/lib/validations/department.validation'

// Department CRUD
export async function createDepartment(data: z.infer<typeof departmentSchema>) {
  try {
    const validated = departmentSchema.parse(data)
    const department = await DepartmentService.create(validated)
    revalidatePath('/finance/department-management')
    return { success: true, data: department }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function updateDepartment(id: string, data: z.infer<typeof departmentSchema>) {
  try {
    const validated = departmentSchema.parse(data)
    const department = await DepartmentService.update(id, validated)
    revalidatePath('/finance/department-management')
    revalidatePath(`/finance/department-management/${id}`)
    return { success: true, data: department }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function deleteDepartment(id: string, reason: string) {
  try {
    await DepartmentService.archive(id, reason)
    revalidatePath('/finance/department-management')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Department Head Management
export async function assignDepartmentHead(data: z.infer<typeof departmentHeadSchema>) {
  try {
    const validated = departmentHeadSchema.parse(data)
    const head = await DepartmentService.assignHead(validated)
    revalidatePath(`/finance/department-management/${data.departmentId}`)
    return { success: true, data: head }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function removeDepartmentHead(id: string, reason: string) {
  try {
    await DepartmentService.removeHead(id, reason)
    revalidatePath('/finance/department-management')
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Hierarchy Management
export async function moveDepartment(departmentId: string, newParentId: string | null) {
  try {
    const result = await DepartmentService.move(departmentId, newParentId)
    revalidatePath('/finance/department-management')
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

// Budget Management
export async function allocateBudget(departmentId: string, budgetData: any) {
  try {
    const budget = await DepartmentService.allocateBudget(departmentId, budgetData)
    revalidatePath(`/finance/department-management/${departmentId}`)
    return { success: true, data: budget }
  } catch (error) {
    return { success: false, error: error.message }
  }
}

export async function transferBudget(fromDeptId: string, toDeptId: string, amount: number, reason: string) {
  try {
    const result = await DepartmentService.transferBudget(fromDeptId, toDeptId, amount, reason)
    revalidatePath('/finance/department-management')
    return { success: true, data: result }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
```

---

## Service Layer

```typescript
// lib/services/department.service.ts

import { prisma } from '@/lib/prisma'
import { HierarchyUtils } from '@/lib/utils/hierarchy.utils'

export class DepartmentService {
  // Create Department
  static async create(data: any) {
    // Calculate hierarchy path
    let hierarchyPath = `/${data.departmentCode}`
    let hierarchyLevel = 0
    
    if (data.parentDepartmentId) {
      const parent = await prisma.department.findUnique({
        where: { id: data.parentDepartmentId },
        select: { hierarchyPath: true, hierarchyLevel: true, allowSubDepartments: true }
      })
      
      if (!parent) throw new Error('Parent department not found')
      if (!parent.allowSubDepartments) throw new Error('Parent does not allow sub-departments')
      
      hierarchyPath = `${parent.hierarchyPath}/${data.departmentCode}`
      hierarchyLevel = parent.hierarchyLevel + 1
    }
    
    // Check max depth
    if (hierarchyLevel > 5) throw new Error('Maximum hierarchy depth (5) exceeded')
    
    // Create department
    return await prisma.department.create({
      data: {
        ...data,
        hierarchyPath,
        hierarchyLevel,
        status: 'DRAFT'
      }
    })
  }
  
  // Update Department
  static async update(id: string, data: any) {
    return await prisma.department.update({
      where: { id },
      data
    })
  }
  
  // Archive Department (soft delete)
  static async archive(id: string, reason: string) {
    // Check for children
    const childCount = await prisma.department.count({
      where: { parentDepartmentId: id, status: { in: ['ACTIVE', 'INACTIVE'] } }
    })
    
    if (childCount > 0) {
      throw new Error('Cannot archive department with active child departments')
    }
    
    // Check for current year transactions (would query transaction tables)
    // For now, simplified
    
    return await prisma.department.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        endDate: new Date(),
        notes: `Archived: ${reason}`
      }
    })
  }
  
  // Move Department in Hierarchy
  static async move(departmentId: string, newParentId: string | null) {
    const department = await prisma.department.findUnique({
      where: { id: departmentId },
      include: { childDepartments: true }
    })
    
    if (!department) throw new Error('Department not found')
    
    // Prevent circular reference
    if (newParentId) {
      const newParent = await prisma.department.findUnique({
        where: { id: newParentId },
        select: { hierarchyPath: true }
      })
      
      if (newParent?.hierarchyPath.includes(department.hierarchyPath)) {
        throw new Error('Circular reference detected')
      }
    }
    
    // Calculate new paths
    const { newPath, newLevel } = HierarchyUtils.calculateNewPath(
      department.departmentCode,
      newParentId,
      await this.getParentPath(newParentId)
    )
    
    // Update department and all descendants
    await prisma.$transaction(async (tx) => {
      // Update main department
      await tx.department.update({
        where: { id: departmentId },
        data: {
          parentDepartmentId: newParentId,
          hierarchyPath: newPath,
          hierarchyLevel: newLevel
        }
      })
      
      // Update all descendants
      const oldPath = department.hierarchyPath
      await tx.department.updateMany({
        where: {
          hierarchyPath: { startsWith: `${oldPath}/` }
        },
        data: {
          hierarchyPath: { /* SQL replace */ },
          hierarchyLevel: { increment: newLevel - department.hierarchyLevel }
        }
      })
    })
    
    return { newPath, newLevel }
  }
  
  // Assign Department Head
  static async assignHead(data: any) {
    // Validate user exists and has appropriate role
    // (would integrate with User management)
    
    // Check for duplicate
    const existing = await prisma.departmentHead.findFirst({
      where: {
        departmentId: data.departmentId,
        userId: data.userId,
        headRole: data.headRole,
        isActive: true
      }
    })
    
    if (existing) {
      throw new Error('User already assigned as department head with this role')
    }
    
    return await prisma.departmentHead.create({
      data: {
        ...data,
        isActive: true,
        effectiveDate: new Date()
      }
    })
  }
  
  // Remove Department Head
  static async removeHead(id: string, reason: string) {
    // Check for pending approvals
    // (would integrate with Procurement/Approval system)
    
    return await prisma.departmentHead.update({
      where: { id },
      data: {
        isActive: false,
        endDate: new Date(),
        terminationReason: reason
      }
    })
  }
  
  // Allocate Budget
  static async allocateBudget(departmentId: string, budgetData: any) {
    // Validate budget amounts sum to total
    const monthlySum = Object.values(budgetData.monthlyBudget || {})
      .reduce((sum: number, val: any) => sum + (Number(val) || 0), 0)
    
    if (Math.abs(monthlySum - budgetData.totalBudgetAmount) > 0.01) {
      throw new Error('Monthly budget amounts must sum to total budget')
    }
    
    return await prisma.departmentBudget.create({
      data: {
        departmentId,
        ...budgetData,
        availableBudget: budgetData.totalBudgetAmount,
        status: 'DRAFT'
      }
    })
  }
  
  // Transfer Budget
  static async transferBudget(fromDeptId: string, toDeptId: string, amount: number, reason: string) {
    return await prisma.$transaction(async (tx) => {
      // Get budgets
      const fromBudget = await tx.departmentBudget.findFirst({
        where: { departmentId: fromDeptId, status: 'ACTIVE' }
      })
      
      const toBudget = await tx.departmentBudget.findFirst({
        where: { departmentId: toDeptId, status: 'ACTIVE' }
      })
      
      if (!fromBudget || !toBudget) throw new Error('Active budgets not found')
      if (fromBudget.availableBudget < amount) throw new Error('Insufficient available budget')
      
      // Update budgets
      await tx.departmentBudget.update({
        where: { id: fromBudget.id },
        data: {
          totalBudgetAmount: fromBudget.totalBudgetAmount.toNumber() - amount,
          availableBudget: fromBudget.availableBudget.toNumber() - amount
        }
      })
      
      await tx.departmentBudget.update({
        where: { id: toBudget.id },
        data: {
          totalBudgetAmount: toBudget.totalBudgetAmount.toNumber() + amount,
          availableBudget: toBudget.availableBudget.toNumber() + amount
        }
      })
      
      // Log transfer (would create transfer record)
      
      return { success: true }
    })
  }
  
  // Helper: Get parent hierarchy path
  private static async getParentPath(parentId: string | null): Promise<string | null> {
    if (!parentId) return null
    
    const parent = await prisma.department.findUnique({
      where: { id: parentId },
      select: { hierarchyPath: true }
    })
    
    return parent?.hierarchyPath || null
  }
}
```

---

## Validation Schemas

```typescript
// lib/validations/department.validation.ts

import { z } from 'zod'

export const departmentSchema = z.object({
  departmentCode: z.string().min(1).max(20).regex(/^[A-Z0-9-]+$/),
  departmentName: z.string().min(3).max(100),
  departmentShortName: z.string().max(20).optional(),
  description: z.string().max(500).optional(),
  
  departmentType: z.enum(['OPERATING', 'ADMINISTRATIVE', 'SUPPORT', 'REVENUE_GENERATING']),
  isCostCenter: z.boolean().default(false),
  costCenterCode: z.string().max(20).optional(),
  
  parentDepartmentId: z.string().cuid().nullable().optional(),
  
  defaultAccountCode: z.string().max(20).optional(),
  budgetYear: z.number().int().min(2020).max(2050),
  budgetAmount: z.number().nonnegative(),
  budgetCurrency: z.string().length(3).default('USD'),
  
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED']).default('DRAFT'),
  effectiveDate: z.date(),
  endDate: z.date().optional(),
  
  approvalLimit: z.number().nonnegative(),
  approvalCurrency: z.string().length(3).default('USD'),
  requiresApprovalWorkflow: z.boolean().default(true),
  allowSubDepartments: z.boolean().default(true),
  
  phoneNumber: z.string().optional(),
  emailAddress: z.string().email().optional(),
  
  createdBy: z.string(),
  notes: z.string().optional()
})

export const departmentHeadSchema = z.object({
  departmentId: z.string().cuid(),
  userId: z.string().cuid(),
  
  headRole: z.enum(['PRIMARY', 'SECONDARY', 'BACKUP', 'INTERIM']),
  priorityOrder: z.number().int().min(1).max(10).default(1),
  
  email: z.string().email(),
  secondaryEmail: z.string().email().optional(),
  phone: z.string().min(10),
  mobilePhone: z.string().min(10).optional(),
  officeLocation: z.string().optional(),
  
  approvalLimit: z.number().nonnegative(),
  approvalLimitCurrency: z.string().length(3).default('USD'),
  canApproveBudgets: z.boolean().default(false),
  canApproveTransfers: z.boolean().default(false),
  canDelegateApproval: z.boolean().default(false),
  
  delegateToUserId: z.string().cuid().optional(),
  delegationStartDate: z.date().optional(),
  delegationEndDate: z.date().optional(),
  delegationReason: z.string().optional(),
  
  effectiveDate: z.date().default(() => new Date()),
  
  assignedBy: z.string(),
  notes: z.string().optional()
}).refine(
  (data) => {
    if (data.delegateToUserId) {
      return data.delegationStartDate && data.delegationEndDate
    }
    return true
  },
  { message: 'Delegation dates required when delegate assigned' }
)
```

---

## Integration with ABAC

### Department as ABAC Attribute

```typescript
// ABAC Policy Example for Department-Based Access

{
  "target": {
    "subjects": [
      {'type': 'user_attribute', 'attribute': 'department', 'operator': 'equals', 'value': '${resource.department}'}
    ],
    "resources": [
      {'type': 'purchase_request', 'attributes': {'department': {'operator': 'exists'}}}
    ],
    "actions": ['view', 'edit']
  },
  "rules": [
    {
      "id": "same_department_access",
      "condition": {
        "type": "simple",
        "attribute": "subject.department",
        "operator": "EQUALS",
        "value": "resource.department"
      },
      "effect": "PERMIT"
    }
  ]
}
```

### Approval Routing Service

```typescript
// lib/services/approval-routing.service.ts

export class ApprovalRoutingService {
  static async routePurchaseRequest(prId: string, departmentId: string, amount: number) {
    // Get department approval configuration
    const config = await prisma.departmentApprovalConfig.findFirst({
      where: { departmentId, isActive: true }
    })
    
    if (!config) throw new Error('No approval configuration found for department')
    
    // Find matching tier
    const tier = (config.approvalTiers as any[]).find(
      t => amount >= t.minAmount && amount <= t.maxAmount
    )
    
    if (!tier) {
      // Escalate to parent department or CFO
      return await this.escalateApproval(prId, departmentId)
    }
    
    // Get approvers
    const approvers = await this.resolveApprovers(tier.approvers, departmentId)
    
    // Create approval tasks based on workflow type
    if (config.workflowType === 'sequential') {
      return await this.createSequentialApprovals(prId, approvers, tier)
    } else {
      return await this.createParallelApprovals(prId, approvers, tier)
    }
  }
  
  private static async resolveApprovers(approverConfigs: any[], departmentId: string) {
    const approvers = []
    
    for (const config of approverConfigs) {
      if (config.approverType === 'department_head') {
        const heads = await prisma.departmentHead.findMany({
          where: { departmentId, isActive: true },
          orderBy: { priorityOrder: 'asc' }
        })
        
        approvers.push(...heads.map(h => ({
          userId: h.userId,
          approvalLimit: h.approvalLimit,
          priority: h.priorityOrder
        })))
      } else {
        approvers.push({
          userId: config.approverId,
          approvalLimit: config.approvalLimit,
          priority: config.priorityOrder
        })
      }
    }
    
    return approvers
  }
  
  private static async createSequentialApprovals(prId: string, approvers: any[], tier: any) {
    // Create approval tasks in sequence (first approver assigned immediately)
    // Subsequent approvers assigned after previous approval
  }
  
  private static async createParallelApprovals(prId: string, approvers: any[], tier: any) {
    // Create approval tasks for all approvers simultaneously
  }
  
  private static async escalateApproval(prId: string, departmentId: string) {
    // Escalate to parent department head or next level authority
  }
}
```

---

## Performance Optimizations

### Database Indexing
- Composite index on `(departmentCode, status)`
- Index on `hierarchyPath` for efficient tree queries
- Index on `(parentDepartmentId, hierarchyLevel)` for hierarchy traversal
- Index on budget foreign keys for join performance

### Caching Strategy
- Cache department hierarchy tree (15 minute TTL)
- Cache approval configurations by department (5 minute TTL)
- Cache active department heads (10 minute TTL)
- Invalidate on mutations via `revalidatePath()`

### Query Optimization
- Use `select` to limit returned fields
- Use `include` judiciously (avoid over-fetching)
- Implement pagination for large lists (50 items per page)
- Use database aggregations instead of application-level calculations

---

## Security Considerations

### Access Control
- All mutations require authentication via Next Auth
- Role-based permissions enforced at API level
- Department head assignments validate user permissions
- Budget modifications require Finance role
- Approval limit changes logged and require dual authorization

### Data Validation
- Zod schema validation on all inputs
- SQL injection prevention via Prisma parameterization
- XSS prevention via React's automatic escaping
- CSRF protection via Next.js built-in mechanisms

### Audit Trail
- All create/update/delete operations logged
- Change tracking includes user, timestamp, before/after values
- Audit logs retained for 7+ years
- Immutable audit records (append-only)

---

**Document End**
