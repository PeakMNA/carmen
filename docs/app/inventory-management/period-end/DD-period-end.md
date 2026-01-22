# Data Definition: Period End

> Version: 2.0.0 | Status: Active | Last Updated: 2025-01-16

## 1. Document Control

| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Feature | Period End |
| Document Type | Data Definition |

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2025-01-16 | Development Team | Aligned with actual implementation: corrected PeriodEndStatus enum (open, in_progress, closing, closed), documented actual TypeScript interfaces, 3-stage validation structure |
| 1.1.0 | 2025-12-09 | Development Team | Updated enum values |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |

---

## 2. TypeScript Interfaces

### 2.1 Period Types (lib/types/period-end.ts)

```typescript
// Period Status Enum (actual implementation)
export type PeriodEndStatus = 'open' | 'in_progress' | 'closing' | 'closed';

// Period End Record
export interface PeriodEnd {
  id: string;
  periodId: string;           // Format: PE-YYYY-MM
  name: string;               // e.g., "January 2025"
  startDate: string;          // ISO date string
  endDate: string;            // ISO date string
  status: PeriodEndStatus;
  closedBy?: string;          // User ID
  closedByName?: string;      // User display name
  closedAt?: string;          // ISO datetime
  notes?: string;
  summary?: PeriodSummary;
  createdAt: string;
  updatedAt: string;
}

// Period Summary Statistics
export interface PeriodSummary {
  totalTransactions: number;
  totalAdjustments: number;
  varianceAmount: number;
  variancePercentage: number;
}
```

### 2.2 Validation Types

```typescript
// Validation Stage Section
export interface ValidationStageSection {
  id: 'transactions' | 'spot-checks' | 'physical-counts';
  title: string;
  description: string;
  icon: 'FileText' | 'ClipboardCheck' | 'Package';
  order: 1 | 2 | 3;
  passed: boolean;
  issueCount: number;
  items: ValidationStageItem[];
}

// Transaction Validation Item
export interface TransactionValidationItem {
  documentType: 'GRN' | 'ADJ' | 'TRF' | 'SR' | 'WR';
  totalCount: number;
  pendingCount: number;
  allPosted: boolean;
}

// Spot Check / Physical Count Validation Item
export interface ValidationItem {
  id: string;
  label: string;
  sublabel?: string;          // Location name
  status: string;
  passed: boolean;
  externalLink?: string;      // Link to source document
}

// Period Close Checklist (overall validation result)
export interface PeriodCloseChecklist {
  transactionsCommitted: boolean;
  spotChecksComplete: boolean;
  physicalCountsFinalized: boolean;
  allChecksPassed: boolean;
  totalIssueCount: number;
  summaryMessages: string[];

  sections: {
    transactions: ValidationStageSection;
    spotChecks: ValidationStageSection;
    physicalCounts: ValidationStageSection;
  };
}
```

### 2.3 Period End Adjustment

```typescript
export interface PeriodEndAdjustment {
  id: string;
  type: 'variance' | 'write-off' | 'correction';
  amount: number;
  reason: string;
  status: 'pending' | 'approved' | 'posted';
  createdBy: string;
  createdByName: string;
  createdAt: string;
}
```

---

## 3. Component Props Interfaces

### 3.1 PeriodSummaryCard Props

```typescript
interface PeriodSummaryCardProps {
  period: PeriodEnd;
  isCurrentPeriod?: boolean;  // Featured styling when true
  onViewDetails?: () => void;
  onStartClose?: () => void;
}
```

**Variants**:
- `isCurrentPeriod=true`: Large featured card with calendar icon, prominent styling
- `isCurrentPeriod=false`: Compact card for history list

### 3.2 ValidationSummaryCard Props

```typescript
interface ValidationSummaryCardProps {
  checklist: PeriodCloseChecklist;
}
```

### 3.3 ValidationChecklist Props

```typescript
interface ValidationChecklistProps {
  checklist: PeriodCloseChecklist;
  onValidateAll: () => void;
  isValidating: boolean;
}
```

### 3.4 ValidationSection Props

```typescript
interface ValidationSectionProps {
  section: ValidationStageSection;
  expanded: boolean;
  onToggle: () => void;
}
```

### 3.5 ValidationItem Props

```typescript
interface ValidationItemProps {
  item: ValidationItem;
  variant?: 'default' | 'compact';
}

interface TransactionValidationItemProps {
  item: TransactionValidationItem;
}
```

---

## 4. Status Badge Colors

| Status | Badge Color | Description |
|--------|-------------|-------------|
| open | Blue | Period created, ready for work |
| in_progress | Yellow | Close workflow initiated |
| closing | Orange | Validation in progress |
| closed | Green | Period finalized and locked |

---

## 5. Validation Stage Definitions

### Stage 1: Transactions

| Document Type | Required Status | Description |
|--------------|-----------------|-------------|
| GRN | Posted/Approved | Goods Received Notes |
| ADJ | Posted | Inventory Adjustments |
| TRF | Posted/Completed | Stock Transfers |
| SR | Fulfilled/Completed | Store Requisitions |
| WR | Posted/Approved | Wastage Reports |

### Stage 2: Spot Checks

| Check | Required Status | Description |
|-------|-----------------|-------------|
| All spot checks | Completed | Random inventory verifications |

### Stage 3: Physical Counts

| Check | Required Status | Description |
|-------|-----------------|-------------|
| All physical counts | Finalized | Full inventory counts |
| GL adjustments | Posted | Variance postings to GL |

---

## 6. Mock Data Structure (lib/mock-data/periods.ts)

```typescript
export const mockPeriods: PeriodEnd[] = [
  {
    id: 'period-001',
    periodId: 'PE-2025-01',
    name: 'January 2025',
    startDate: '2025-01-01',
    endDate: '2025-01-31',
    status: 'open',
    notes: 'Current active period',
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z'
  },
  {
    id: 'period-002',
    periodId: 'PE-2024-12',
    name: 'December 2024',
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    status: 'closed',
    closedBy: 'user-001',
    closedByName: 'John Smith',
    closedAt: '2025-01-05T14:30:00Z',
    createdAt: '2024-12-01T00:00:00Z',
    updatedAt: '2025-01-05T14:30:00Z'
  }
];

export const mockChecklist: PeriodCloseChecklist = {
  transactionsCommitted: true,
  spotChecksComplete: false,
  physicalCountsFinalized: true,
  allChecksPassed: false,
  totalIssueCount: 2,
  summaryMessages: ['2 spot checks pending completion'],
  sections: {
    transactions: {
      id: 'transactions',
      title: 'Transactions',
      description: 'All documents must be posted/approved',
      icon: 'FileText',
      order: 1,
      passed: true,
      issueCount: 0,
      items: []
    },
    spotChecks: {
      id: 'spot-checks',
      title: 'Spot Checks',
      description: 'All spot checks must be completed',
      icon: 'ClipboardCheck',
      order: 2,
      passed: false,
      issueCount: 2,
      items: []
    },
    physicalCounts: {
      id: 'physical-counts',
      title: 'Physical Counts',
      description: 'All counts must be finalized',
      icon: 'Package',
      order: 3,
      passed: true,
      issueCount: 0,
      items: []
    }
  }
};
```

---

## 7. Database Schema (Future)

### 7.1 period_end Table

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| id | uuid | NO | Primary key |
| period_id | varchar(10) | NO | Format: PE-YYYY-MM |
| name | varchar(50) | NO | Display name |
| start_date | timestamp | NO | First day of month |
| end_date | timestamp | NO | Last day of month |
| status | enum | NO | open, in_progress, closing, closed |
| closed_by_id | uuid | YES | FK to users |
| closed_at | timestamp | YES | Close timestamp |
| notes | text | YES | Period notes |
| created_at | timestamp | NO | Creation timestamp |
| updated_at | timestamp | NO | Last update |

### 7.2 Status Enum

```sql
CREATE TYPE period_end_status AS ENUM (
  'open',        -- Period ready for work
  'in_progress', -- Close workflow started
  'closing',     -- Validation in progress
  'closed'       -- Period finalized
);
```

---

## 8. Relationships

| Parent | Child | Relationship | Description |
|--------|-------|--------------|-------------|
| period_end | inventory_transactions | 1:N | Transactions in period |
| period_end | spot_checks | 1:N | Spot checks in period |
| period_end | physical_counts | 1:N | Physical counts in period |
| users | period_end | 1:N | User who closed period |

---

*Document Version: 2.0.0 | Carmen ERP Period End Module*
