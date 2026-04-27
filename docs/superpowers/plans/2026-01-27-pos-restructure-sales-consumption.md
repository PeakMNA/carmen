# POS Restructure + Sales Consumption Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the POS Integration UI into Setup/Operate/Audit sections, create a new Sales Consumption (SC) document module in Store Operations, and eliminate the POS↔Menu Engineering data ingestion duplication.

**Architecture:** POS Integration owns sales data ingestion and recipe mappings. A scheduled shift-close job converts POS transactions into SC documents (one per location/shift/business_date) that auto-post ingredient consumption to the inventory ledger. Menu Engineering becomes a pure analytics consumer reading from SC + POS staging via an adapter. Exception lines that fail validation route to a POS Exception Queue in the Operate section.

**Tech Stack:** Next.js 14 App Router, TypeScript strict, Tailwind CSS, Shadcn/ui, Zustand, React Query, React Hook Form + Zod, Vitest, Prisma, mock data pattern (no live DB calls in UI yet)

**Design doc:** `docs/plans/need-help-to-restructure-glowing-dragon.md` (full architecture decisions)

**Documentation:** Already complete in `docs/app/store-operations/sales-consumption/` and updated POS/ME/Inventory docs.

---

## Phase 1 — Foundation (Types + Service Layer)

### Task 1: Extend TransactionType enum

**Files:**
- Modify: `lib/types/inventory.ts:71-81`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/lib/types/inventory.test.ts
import { describe, it, expect } from 'vitest'
import { TransactionType } from '@/lib/types/inventory'

describe('TransactionType', () => {
  it('includes SALES_CONSUMPTION', () => {
    expect(TransactionType.SALES_CONSUMPTION).toBe('SALES_CONSUMPTION')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- tests/lib/types/inventory.test.ts
```

Expected: FAIL — `TransactionType.SALES_CONSUMPTION is undefined`

- [ ] **Step 3: Add SALES_CONSUMPTION to enum**

In `lib/types/inventory.ts`, change:
```typescript
export enum TransactionType {
  RECEIVE = "RECEIVE",
  ISSUE = "ISSUE",
  TRANSFER_OUT = "TRANSFER_OUT",
  TRANSFER_IN = "TRANSFER_IN",
  ADJUST_UP = "ADJUST_UP",
  ADJUST_DOWN = "ADJUST_DOWN",
  COUNT = "COUNT",
  WASTE = "WASTE",
  CONVERSION = "CONVERSION"
}
```
To:
```typescript
export enum TransactionType {
  RECEIVE = "RECEIVE",
  ISSUE = "ISSUE",
  TRANSFER_OUT = "TRANSFER_OUT",
  TRANSFER_IN = "TRANSFER_IN",
  ADJUST_UP = "ADJUST_UP",
  ADJUST_DOWN = "ADJUST_DOWN",
  COUNT = "COUNT",
  WASTE = "WASTE",
  CONVERSION = "CONVERSION",
  SALES_CONSUMPTION = "SALES_CONSUMPTION"  // Ingredient deduction from POS menu sales
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- tests/lib/types/inventory.test.ts
```

Expected: PASS

- [ ] **Step 5: Type-check**

```bash
npm run checktypes
```

Expected: No new errors

- [ ] **Step 6: Commit**

```bash
git add lib/types/inventory.ts tests/lib/types/inventory.test.ts
git commit -m "feat(types): add SALES_CONSUMPTION to TransactionType enum"
```

---

### Task 2: Create Sales Consumption types

**Files:**
- Create: `lib/types/sales-consumption.ts`
- Create: `tests/lib/types/sales-consumption.test.ts`

- [ ] **Step 1: Write the failing test**

```typescript
// tests/lib/types/sales-consumption.test.ts
import { describe, it, expect } from 'vitest'
import type {
  SalesConsumption,
  SalesConsumptionLine,
  SCStatus,
  SCLineStatus,
  ExceptionCode,
} from '@/lib/types/sales-consumption'

describe('SalesConsumption types', () => {
  it('SalesConsumption has required fields', () => {
    const sc: SalesConsumption = {
      id: 'sc-001',
      docNumber: 'SC-20260127-MAIN-LUNCH-001',
      locationId: 'loc-1',
      businessDate: '2026-01-27',
      shiftId: 'shift-lunch',
      status: 'posted',
      sourceConnectionIds: ['conn-1'],
      transactionCount: 10,
      postedLineCount: 8,
      pendingLineCount: 2,
      totalCostPosted: { amount: 100, currency: 'USD' },
      totalRevenue: { amount: 400, currency: 'USD' },
      postedBy: 'system',
      createdAt: '2026-01-27T15:00:00Z',
      updatedAt: '2026-01-27T15:05:00Z',
    }
    expect(sc.status).toBe('posted')
    expect(sc.postedBy).toBe('system')
  })

  it('SalesConsumptionLine has exception fields when pending', () => {
    const line: SalesConsumptionLine = {
      id: 'scl-001',
      scId: 'sc-001',
      posTransactionId: 'pos-txn-001',
      posItemId: 'item-99',
      posItemName: 'Oat Milk Latte',
      qtyConsumed: 0,
      unitOfMeasure: '',
      unitCost: 0,
      extendedCost: 0,
      currency: 'USD',
      status: 'pending',
      exceptionCode: 'UNMAPPED_ITEM',
      createdAt: '2026-01-27T15:00:00Z',
    }
    expect(line.exceptionCode).toBe('UNMAPPED_ITEM')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- tests/lib/types/sales-consumption.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 3: Create `lib/types/sales-consumption.ts`**

```typescript
// lib/types/sales-consumption.ts
import type { Money } from './common'

export type SCStatus =
  | 'draft'
  | 'posted'
  | 'posted_with_exceptions'
  | 'blocked'
  | 'voided'

export type SCLineStatus = 'posted' | 'pending' | 'reversed'

export type ExceptionCode =
  | 'UNMAPPED_ITEM'
  | 'MISSING_RECIPE'
  | 'ZERO_COST_INGREDIENT'
  | 'LOCATION_UNMAPPED'
  | 'FRACTIONAL_MISSING_VARIANT'
  | 'MODIFIER_UNMAPPED'
  | 'CURRENCY_MISMATCH'
  | 'VOID_AFTER_POST'
  | 'REFUND_PARTIAL'
  | 'TAX_ONLY_ITEM'
  | 'COMP_OR_DISCOUNT'
  | 'STALE_TRANSACTION'

export interface SalesConsumption {
  id: string
  docNumber: string
  locationId: string
  businessDate: string
  shiftId: string
  status: SCStatus
  sourceConnectionIds: string[]
  transactionCount: number
  postedLineCount: number
  pendingLineCount: number
  totalCostPosted: Money
  totalRevenue: Money
  parentSCId?: string
  voidedAt?: string
  voidedBy?: string
  voidReason?: string
  postedAt?: string
  postedBy: 'system' | string
  createdAt: string
  updatedAt: string
}

export interface SalesConsumptionLine {
  id: string
  scId: string
  posTransactionId: string
  posItemId: string
  posItemName: string
  recipeId?: string
  recipeName?: string
  ingredientProductId?: string
  ingredientProductName?: string
  qtyConsumed: number
  unitOfMeasure: string
  unitCost: number
  extendedCost: number
  currency: string
  status: SCLineStatus
  exceptionCode?: ExceptionCode
  exceptionDetail?: string
  reversesLineId?: string
  inventoryTransactionId?: string
  createdAt: string
}

export const EXCEPTION_CODE_LABELS: Record<ExceptionCode, string> = {
  UNMAPPED_ITEM: 'Unmapped Item',
  MISSING_RECIPE: 'Missing Recipe',
  ZERO_COST_INGREDIENT: 'Zero Cost Ingredient',
  LOCATION_UNMAPPED: 'Location Unmapped',
  FRACTIONAL_MISSING_VARIANT: 'Fractional Variant Missing',
  MODIFIER_UNMAPPED: 'Modifier Unmapped',
  CURRENCY_MISMATCH: 'Currency Mismatch',
  VOID_AFTER_POST: 'Void After Post',
  REFUND_PARTIAL: 'Partial Refund',
  TAX_ONLY_ITEM: 'Tax/Service Charge',
  COMP_OR_DISCOUNT: 'Comp / Full Discount',
  STALE_TRANSACTION: 'Stale Transaction',
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- tests/lib/types/sales-consumption.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/types/sales-consumption.ts tests/lib/types/sales-consumption.test.ts
git commit -m "feat(types): add SalesConsumption, SalesConsumptionLine, ExceptionCode types"
```

---

### Task 3: Extend POS integration types with ConnectorMode and ExceptionCode

**Files:**
- Modify: `lib/types/pos-integration.ts` (append new types at the end)

- [ ] **Step 1: Write the failing test**

```typescript
// tests/lib/types/pos-integration-connector.test.ts
import { describe, it, expect } from 'vitest'
import type { ConnectorMode, PosConnection } from '@/lib/types/pos-integration'

describe('PosConnection types', () => {
  it('supports api connector mode', () => {
    const conn: PosConnection = {
      id: 'conn-1',
      posModel: 'square',
      mode: 'api',
      syncSchedule: '*/15 * * * *',
      locationId: 'loc-1',
      status: 'active',
    }
    expect(conn.mode).toBe('api')
  })

  it('supports file_import connector mode', () => {
    const conn: PosConnection = {
      id: 'conn-2',
      posModel: 'generic_csv',
      mode: 'file_import',
      syncSchedule: '0 0 * * *',
      locationId: 'loc-2',
      status: 'active',
    }
    expect(conn.mode).toBe('file_import')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- tests/lib/types/pos-integration-connector.test.ts
```

Expected: FAIL — ConnectorMode / PosConnection not exported

- [ ] **Step 3: Append to `lib/types/pos-integration.ts`**

Add at the bottom of the file (after all existing content):

```typescript
// ====== CONNECTOR TYPES (v2.0) ======

export type ConnectorMode = 'api' | 'file_import' | 'webhook'

export type POSModel =
  | 'square'
  | 'toast'
  | 'lightspeed'
  | 'micros'
  | 'generic_csv'
  | 'generic_xml'

export interface ApiCredentials {
  endpoint: string
  apiKey: string
  apiSecret?: string
}

export interface FileImportConfig {
  fileFormat: 'csv' | 'xml'
  columnMappings: Record<string, string>
  uploadSchedule: string
}

export interface PosConnection {
  id: string
  posModel: POSModel
  mode: ConnectorMode
  credentials?: ApiCredentials
  importConfig?: FileImportConfig
  syncSchedule: string
  locationId: string
  status: 'active' | 'paused' | 'error'
  scGenerationEnabled?: boolean
  lastSyncAt?: string
  lastSyncTransactionCount?: number
}

// Connector modes supported per POS model
export const POS_MODEL_CONNECTOR_MODES: Record<POSModel, ConnectorMode[]> = {
  square: ['api'],
  toast: ['api', 'webhook'],
  lightspeed: ['api'],
  micros: ['file_import'],
  generic_csv: ['file_import'],
  generic_xml: ['file_import'],
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- tests/lib/types/pos-integration-connector.test.ts
```

Expected: PASS

- [ ] **Step 5: Type-check**

```bash
npm run checktypes
```

Expected: No new errors

- [ ] **Step 6: Commit**

```bash
git add lib/types/pos-integration.ts tests/lib/types/pos-integration-connector.test.ts
git commit -m "feat(types): add ConnectorMode, PosConnection, POS_MODEL_CONNECTOR_MODES"
```

---

### Task 4: Create mock data for Sales Consumption

**Files:**
- Create: `lib/mock-data/sales-consumption.ts`
- Modify: `lib/mock-data/index.ts` (add export)

- [ ] **Step 1: Create `lib/mock-data/sales-consumption.ts`**

```typescript
// lib/mock-data/sales-consumption.ts
import type { SalesConsumption, SalesConsumptionLine } from '@/lib/types/sales-consumption'

export const mockSalesConsumptions: SalesConsumption[] = [
  {
    id: 'sc-001',
    docNumber: 'SC-20260127-MAIN-LUNCH-001',
    locationId: 'loc-main',
    businessDate: '2026-01-27',
    shiftId: 'shift-lunch',
    status: 'posted_with_exceptions',
    sourceConnectionIds: ['conn-square-main'],
    transactionCount: 47,
    postedLineCount: 89,
    pendingLineCount: 3,
    totalCostPosted: { amount: 1247.50, currency: 'USD' },
    totalRevenue: { amount: 4830.00, currency: 'USD' },
    postedAt: '2026-01-27T15:05:00Z',
    postedBy: 'system',
    createdAt: '2026-01-27T15:00:00Z',
    updatedAt: '2026-01-27T15:05:00Z',
  },
  {
    id: 'sc-002',
    docNumber: 'SC-20260127-MAIN-DINNER-001',
    locationId: 'loc-main',
    businessDate: '2026-01-27',
    shiftId: 'shift-dinner',
    status: 'posted',
    sourceConnectionIds: ['conn-square-main'],
    transactionCount: 83,
    postedLineCount: 156,
    pendingLineCount: 0,
    totalCostPosted: { amount: 2410.75, currency: 'USD' },
    totalRevenue: { amount: 9200.00, currency: 'USD' },
    postedAt: '2026-01-27T23:05:00Z',
    postedBy: 'system',
    createdAt: '2026-01-27T23:00:00Z',
    updatedAt: '2026-01-27T23:05:00Z',
  },
  {
    id: 'sc-003',
    docNumber: 'SC-20260126-OUTLET2-ALLDAY-001',
    locationId: 'loc-outlet-2',
    businessDate: '2026-01-26',
    shiftId: 'all_day',
    status: 'blocked',
    sourceConnectionIds: ['conn-csv-outlet2'],
    transactionCount: 12,
    postedLineCount: 0,
    pendingLineCount: 12,
    totalCostPosted: { amount: 0, currency: 'USD' },
    totalRevenue: { amount: 480.00, currency: 'USD' },
    postedBy: 'system',
    createdAt: '2026-01-27T00:00:00Z',
    updatedAt: '2026-01-27T00:00:00Z',
  },
]

export const mockSCLines: SalesConsumptionLine[] = [
  // Posted line (clean)
  {
    id: 'scl-001',
    scId: 'sc-001',
    posTransactionId: 'pos-txn-0001',
    posItemId: 'pos-item-01',
    posItemName: 'Americano',
    recipeId: 'recipe-americano',
    recipeName: 'Americano',
    ingredientProductId: 'prod-espresso',
    ingredientProductName: 'Espresso Beans',
    qtyConsumed: 0.018,
    unitOfMeasure: 'kg',
    unitCost: 45.00,
    extendedCost: 0.81,
    currency: 'USD',
    status: 'posted',
    inventoryTransactionId: 'inv-txn-0001',
    createdAt: '2026-01-27T15:00:00Z',
  },
  // Exception line — unmapped item
  {
    id: 'scl-090',
    scId: 'sc-001',
    posTransactionId: 'pos-txn-0045',
    posItemId: 'pos-item-99',
    posItemName: 'Oat Milk Latte',
    qtyConsumed: 0,
    unitOfMeasure: '',
    unitCost: 0,
    extendedCost: 0,
    currency: 'USD',
    status: 'pending',
    exceptionCode: 'UNMAPPED_ITEM',
    exceptionDetail: 'POS item "Oat Milk Latte" (ID: pos-item-99) has no active recipe mapping',
    createdAt: '2026-01-27T15:00:00Z',
  },
  // Exception line — modifier unmapped
  {
    id: 'scl-091',
    scId: 'sc-001',
    posTransactionId: 'pos-txn-0046',
    posItemId: 'mod-extra-shot',
    posItemName: 'Extra Espresso Shot',
    qtyConsumed: 0,
    unitOfMeasure: '',
    unitCost: 0,
    extendedCost: 0,
    currency: 'USD',
    status: 'pending',
    exceptionCode: 'MODIFIER_UNMAPPED',
    exceptionDetail: 'Modifier "Extra Espresso Shot" has no recipe ingredient mapping',
    createdAt: '2026-01-27T15:00:00Z',
  },
  // Exception line — zero cost
  {
    id: 'scl-092',
    scId: 'sc-001',
    posTransactionId: 'pos-txn-0047',
    posItemId: 'pos-item-15',
    posItemName: 'House Salad',
    recipeId: 'recipe-house-salad',
    recipeName: 'House Salad',
    ingredientProductId: 'prod-lettuce',
    ingredientProductName: 'Iceberg Lettuce',
    qtyConsumed: 0.15,
    unitOfMeasure: 'kg',
    unitCost: 0,
    extendedCost: 0,
    currency: 'USD',
    status: 'pending',
    exceptionCode: 'ZERO_COST_INGREDIENT',
    exceptionDetail: 'Ingredient "Iceberg Lettuce" has no current cost on file',
    createdAt: '2026-01-27T15:00:00Z',
  },
]
```

- [ ] **Step 2: Add export to `lib/mock-data/index.ts`**

Find the existing exports in `lib/mock-data/index.ts` and add:

```typescript
export { mockSalesConsumptions, mockSCLines } from './sales-consumption'
```

- [ ] **Step 3: Type-check**

```bash
npm run checktypes
```

Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add lib/mock-data/sales-consumption.ts lib/mock-data/index.ts
git commit -m "feat(mock-data): add Sales Consumption mock data with exception line examples"
```

---

### Task 5: Create Sales Consumption service

**Files:**
- Create: `lib/services/sales-consumption-service.ts`
- Create: `tests/lib/services/sales-consumption-service.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/lib/services/sales-consumption-service.test.ts
import { describe, it, expect } from 'vitest'
import {
  buildSCDocNumber,
  getSCStatusLabel,
  getSCLineStatusLabel,
  getExceptionCodeLabel,
  groupSCLinesByStatus,
  canVoidSC,
} from '@/lib/services/sales-consumption-service'
import type { SalesConsumption, SalesConsumptionLine } from '@/lib/types/sales-consumption'

describe('buildSCDocNumber', () => {
  it('formats correctly', () => {
    expect(buildSCDocNumber('MAIN', 'shift-lunch', '2026-01-27', 1))
      .toBe('SC-20260127-MAIN-shift-lunch-001')
  })

  it('pads sequence number', () => {
    expect(buildSCDocNumber('OUTLET2', 'all_day', '2026-01-27', 12))
      .toBe('SC-20260127-OUTLET2-all_day-012')
  })
})

describe('getSCStatusLabel', () => {
  it('maps all statuses to human labels', () => {
    expect(getSCStatusLabel('posted')).toBe('Posted')
    expect(getSCStatusLabel('posted_with_exceptions')).toBe('Posted with Exceptions')
    expect(getSCStatusLabel('blocked')).toBe('Blocked')
    expect(getSCStatusLabel('draft')).toBe('Draft')
    expect(getSCStatusLabel('voided')).toBe('Voided')
  })
})

describe('getExceptionCodeLabel', () => {
  it('returns human-readable label', () => {
    expect(getExceptionCodeLabel('UNMAPPED_ITEM')).toBe('Unmapped Item')
    expect(getExceptionCodeLabel('MODIFIER_UNMAPPED')).toBe('Modifier Unmapped')
  })
})

describe('groupSCLinesByStatus', () => {
  const lines: SalesConsumptionLine[] = [
    { id: '1', scId: 'sc-1', posTransactionId: 'p1', posItemId: 'i1', posItemName: 'A',
      qtyConsumed: 1, unitOfMeasure: 'kg', unitCost: 1, extendedCost: 1,
      currency: 'USD', status: 'posted', createdAt: '2026-01-27T00:00:00Z' },
    { id: '2', scId: 'sc-1', posTransactionId: 'p2', posItemId: 'i2', posItemName: 'B',
      qtyConsumed: 0, unitOfMeasure: '', unitCost: 0, extendedCost: 0,
      currency: 'USD', status: 'pending', exceptionCode: 'UNMAPPED_ITEM',
      createdAt: '2026-01-27T00:00:00Z' },
  ]

  it('groups by status', () => {
    const grouped = groupSCLinesByStatus(lines)
    expect(grouped.posted).toHaveLength(1)
    expect(grouped.pending).toHaveLength(1)
    expect(grouped.reversed).toHaveLength(0)
  })
})

describe('canVoidSC', () => {
  const baseSC = (status: SalesConsumption['status']): SalesConsumption => ({
    id: 'sc-1', docNumber: 'SC-001', locationId: 'loc-1',
    businessDate: '2026-01-27', shiftId: 'shift-lunch', status,
    sourceConnectionIds: [], transactionCount: 0, postedLineCount: 0,
    pendingLineCount: 0,
    totalCostPosted: { amount: 0, currency: 'USD' },
    totalRevenue: { amount: 0, currency: 'USD' },
    postedBy: 'system', createdAt: '2026-01-27T00:00:00Z',
    updatedAt: '2026-01-27T00:00:00Z',
  })

  it('allows void for posted status', () => {
    expect(canVoidSC(baseSC('posted'))).toBe(true)
  })

  it('allows void for posted_with_exceptions status', () => {
    expect(canVoidSC(baseSC('posted_with_exceptions'))).toBe(true)
  })

  it('disallows void for already voided', () => {
    expect(canVoidSC(baseSC('voided'))).toBe(false)
  })

  it('disallows void for draft', () => {
    expect(canVoidSC(baseSC('draft'))).toBe(false)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- tests/lib/services/sales-consumption-service.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 3: Create `lib/services/sales-consumption-service.ts`**

```typescript
// lib/services/sales-consumption-service.ts
import type { SalesConsumption, SalesConsumptionLine, SCStatus, ExceptionCode } from '@/lib/types/sales-consumption'
import { EXCEPTION_CODE_LABELS } from '@/lib/types/sales-consumption'

const SC_STATUS_LABELS: Record<SCStatus, string> = {
  draft: 'Draft',
  posted: 'Posted',
  posted_with_exceptions: 'Posted with Exceptions',
  blocked: 'Blocked',
  voided: 'Voided',
}

export function buildSCDocNumber(
  locationCode: string,
  shiftId: string,
  businessDate: string,
  seq: number
): string {
  const datePart = businessDate.replace(/-/g, '')
  const seqPart = String(seq).padStart(3, '0')
  return `SC-${datePart}-${locationCode}-${shiftId}-${seqPart}`
}

export function getSCStatusLabel(status: SCStatus): string {
  return SC_STATUS_LABELS[status]
}

export function getSCLineStatusLabel(status: SalesConsumptionLine['status']): string {
  const labels = { posted: 'Posted', pending: 'Pending', reversed: 'Reversed' }
  return labels[status]
}

export function getExceptionCodeLabel(code: ExceptionCode): string {
  return EXCEPTION_CODE_LABELS[code]
}

export function groupSCLinesByStatus(lines: SalesConsumptionLine[]): {
  posted: SalesConsumptionLine[]
  pending: SalesConsumptionLine[]
  reversed: SalesConsumptionLine[]
} {
  return {
    posted: lines.filter(l => l.status === 'posted'),
    pending: lines.filter(l => l.status === 'pending'),
    reversed: lines.filter(l => l.status === 'reversed'),
  }
}

export function canVoidSC(sc: SalesConsumption): boolean {
  return sc.status !== 'voided' && sc.status !== 'draft'
}

export function getSCExceptionSummary(lines: SalesConsumptionLine[]): Record<string, number> {
  const pending = lines.filter(l => l.status === 'pending')
  return pending.reduce((acc, line) => {
    const code = line.exceptionCode ?? 'UNKNOWN'
    acc[code] = (acc[code] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- tests/lib/services/sales-consumption-service.test.ts
```

Expected: PASS (all 9 tests)

- [ ] **Step 5: Type-check**

```bash
npm run checktypes
```

Expected: No errors

- [ ] **Step 6: Commit**

```bash
git add lib/services/sales-consumption-service.ts tests/lib/services/sales-consumption-service.test.ts
git commit -m "feat(service): add sales-consumption-service with helpers and business logic"
```

---

### Task 6: Create Menu Engineering data source adapter

**Files:**
- Create: `lib/services/menu-engineering-data-source.ts`
- Create: `tests/lib/services/menu-engineering-data-source.test.ts`

- [ ] **Step 1: Write the failing tests**

```typescript
// tests/lib/services/menu-engineering-data-source.test.ts
import { describe, it, expect } from 'vitest'
import {
  aggregateSCCostByPOSItem,
  computeGrossMargin,
} from '@/lib/services/menu-engineering-data-source'
import type { SalesConsumptionLine } from '@/lib/types/sales-consumption'

const mockLines: SalesConsumptionLine[] = [
  { id: 'l1', scId: 'sc1', posTransactionId: 'p1', posItemId: 'item-A',
    posItemName: 'Americano', qtyConsumed: 0.018, unitOfMeasure: 'kg',
    unitCost: 45, extendedCost: 0.81, currency: 'USD', status: 'posted',
    createdAt: '2026-01-27T00:00:00Z' },
  { id: 'l2', scId: 'sc1', posTransactionId: 'p2', posItemId: 'item-A',
    posItemName: 'Americano', qtyConsumed: 0.002, unitOfMeasure: 'kg',
    unitCost: 10, extendedCost: 0.02, currency: 'USD', status: 'posted',
    createdAt: '2026-01-27T00:00:00Z' },
  { id: 'l3', scId: 'sc1', posTransactionId: 'p3', posItemId: 'item-B',
    posItemName: 'Latte', qtyConsumed: 0.2, unitOfMeasure: 'L',
    unitCost: 2, extendedCost: 0.40, currency: 'USD', status: 'posted',
    createdAt: '2026-01-27T00:00:00Z' },
]

describe('aggregateSCCostByPOSItem', () => {
  it('sums extended cost per POS item', () => {
    const result = aggregateSCCostByPOSItem(mockLines)
    expect(result['item-A']).toBeCloseTo(0.83)
    expect(result['item-B']).toBeCloseTo(0.40)
  })

  it('ignores pending lines', () => {
    const withPending: SalesConsumptionLine[] = [
      ...mockLines,
      { id: 'l4', scId: 'sc1', posTransactionId: 'p4', posItemId: 'item-C',
        posItemName: 'Pending Item', qtyConsumed: 0, unitOfMeasure: '', unitCost: 0,
        extendedCost: 0, currency: 'USD', status: 'pending',
        exceptionCode: 'UNMAPPED_ITEM', createdAt: '2026-01-27T00:00:00Z' },
    ]
    const result = aggregateSCCostByPOSItem(withPending)
    expect(result['item-C']).toBeUndefined()
  })
})

describe('computeGrossMargin', () => {
  it('calculates gross margin percentage', () => {
    expect(computeGrossMargin(5.00, 1.50)).toBeCloseTo(0.70)
  })

  it('returns 0 when revenue is 0', () => {
    expect(computeGrossMargin(0, 1.00)).toBe(0)
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npm run test:run -- tests/lib/services/menu-engineering-data-source.test.ts
```

Expected: FAIL — module not found

- [ ] **Step 3: Create `lib/services/menu-engineering-data-source.ts`**

```typescript
// lib/services/menu-engineering-data-source.ts
// Adapter: joins SC data + POS staging data for Menu Engineering analytics.
// ME components call this; they never import from POS or SC modules directly.
import type { SalesConsumptionLine } from '@/lib/types/sales-consumption'

// Aggregate ingredient cost per POS item ID (posted lines only)
export function aggregateSCCostByPOSItem(
  lines: SalesConsumptionLine[]
): Record<string, number> {
  return lines
    .filter(l => l.status === 'posted')
    .reduce((acc, line) => {
      acc[line.posItemId] = (acc[line.posItemId] ?? 0) + line.extendedCost
      return acc
    }, {} as Record<string, number>)
}

// Gross margin = (revenue - cost) / revenue, clamped to [0, 1]
export function computeGrossMargin(revenue: number, cost: number): number {
  if (revenue === 0) return 0
  return Math.max(0, Math.min(1, (revenue - cost) / revenue))
}

// Classify menu item by Boston Matrix quadrant
export function classifyMenuItemPerformance(
  margin: number,
  avgMargin: number,
  salesCount: number,
  avgSalesCount: number
): 'star' | 'plowhorse' | 'puzzle' | 'dog' {
  const highMargin = margin >= avgMargin
  const highVolume = salesCount >= avgSalesCount
  if (highMargin && highVolume) return 'star'
  if (!highMargin && highVolume) return 'plowhorse'
  if (highMargin && !highVolume) return 'puzzle'
  return 'dog'
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
npm run test:run -- tests/lib/services/menu-engineering-data-source.test.ts
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/services/menu-engineering-data-source.ts tests/lib/services/menu-engineering-data-source.test.ts
git commit -m "feat(service): add menu-engineering-data-source adapter for SC-based analytics"
```

---

## Phase 2 — Sales Consumption UI (Read-Only)

### Task 7: SC List Page

**Files:**
- Create: `app/(main)/store-operations/sales-consumption/page.tsx`
- Create: `app/(main)/store-operations/sales-consumption/components/sc-status-badge.tsx`
- Create: `app/(main)/store-operations/sales-consumption/components/sc-list.tsx`

- [ ] **Step 1: Create status badge component**

```typescript
// app/(main)/store-operations/sales-consumption/components/sc-status-badge.tsx
import { Badge } from '@/components/ui/badge'
import type { SCStatus } from '@/lib/types/sales-consumption'
import { getSCStatusLabel } from '@/lib/services/sales-consumption-service'

const STATUS_VARIANT: Record<SCStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'outline',
  posted: 'default',
  posted_with_exceptions: 'secondary',
  blocked: 'destructive',
  voided: 'outline',
}

const STATUS_CLASS: Record<SCStatus, string> = {
  draft: 'text-gray-500',
  posted: 'bg-green-100 text-green-800 hover:bg-green-100',
  posted_with_exceptions: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
  blocked: 'bg-red-100 text-red-800 hover:bg-red-100',
  voided: 'bg-gray-100 text-gray-500 hover:bg-gray-100',
}

export function SCStatusBadge({ status }: { status: SCStatus }) {
  return (
    <Badge
      variant={STATUS_VARIANT[status]}
      className={STATUS_CLASS[status]}
    >
      {getSCStatusLabel(status)}
    </Badge>
  )
}
```

- [ ] **Step 2: Create SC list component**

```typescript
// app/(main)/store-operations/sales-consumption/components/sc-list.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle } from 'lucide-react'
import type { SalesConsumption, SCStatus } from '@/lib/types/sales-consumption'
import { SCStatusBadge } from './sc-status-badge'

interface SCListProps {
  items: SalesConsumption[]
}

export function SCList({ items }: SCListProps) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
        <p className="text-sm">No Sales Consumption documents found.</p>
        <p className="text-xs mt-1">Documents are generated automatically at shift close.</p>
      </div>
    )
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Reference</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Shift</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Transactions</TableHead>
          <TableHead className="text-right">Lines Posted</TableHead>
          <TableHead className="text-right">Cost Posted</TableHead>
          <TableHead className="text-right">Exceptions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map(sc => (
          <TableRow key={sc.id} className="hover:bg-muted/50">
            <TableCell>
              <Link
                href={`/store-operations/sales-consumption/${sc.id}`}
                className="font-mono text-sm text-primary hover:underline"
              >
                {sc.docNumber}
              </Link>
            </TableCell>
            <TableCell className="text-sm">
              {format(new Date(sc.businessDate), 'dd MMM yyyy')}
            </TableCell>
            <TableCell className="text-sm capitalize">{sc.shiftId.replace('shift-', '').replace('_', ' ')}</TableCell>
            <TableCell><SCStatusBadge status={sc.status} /></TableCell>
            <TableCell className="text-right text-sm">{sc.transactionCount}</TableCell>
            <TableCell className="text-right text-sm">{sc.postedLineCount}</TableCell>
            <TableCell className="text-right text-sm">
              {sc.totalCostPosted.currency} {sc.totalCostPosted.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </TableCell>
            <TableCell className="text-right">
              {sc.pendingLineCount > 0 ? (
                <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {sc.pendingLineCount}
                </Badge>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 3: Create the list page**

```typescript
// app/(main)/store-operations/sales-consumption/page.tsx
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { SCList } from './components/sc-list'
import { mockSalesConsumptions } from '@/lib/mock-data/sales-consumption'

export default function SalesConsumptionPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Sales Consumption</h1>
        <p className="text-sm text-muted-foreground mt-1">
          System-generated documents recording ingredient consumption from POS sales, posted at shift close.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
          <CardDescription>
            One document per location per shift. Generated automatically — not editable.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SCList items={mockSalesConsumptions} />
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Verify it builds**

```bash
npm run build 2>&1 | grep -E "error|Error|✓"
```

Expected: No errors for the new page

- [ ] **Step 5: Start dev server and check the page manually**

```bash
npm run dev
```

Navigate to `http://localhost:3000/store-operations/sales-consumption`

Verify:
- Table shows 3 rows (from mock data)
- `SC-20260127-MAIN-LUNCH-001` shows `Posted with Exceptions` badge (amber) with exception count 3
- `SC-20260127-MAIN-DINNER-001` shows `Posted` badge (green)
- `SC-20260126-OUTLET2-ALLDAY-001` shows `Blocked` badge (red)
- Clicking a reference number navigates to `/store-operations/sales-consumption/{id}` (404 for now)

- [ ] **Step 6: Commit**

```bash
git add app/\(main\)/store-operations/sales-consumption/
git commit -m "feat(ui): add Sales Consumption list page with status badges"
```

---

### Task 8: SC Detail Page

**Files:**
- Create: `app/(main)/store-operations/sales-consumption/[id]/page.tsx`
- Create: `app/(main)/store-operations/sales-consumption/components/sc-exception-banner.tsx`
- Create: `app/(main)/store-operations/sales-consumption/components/sc-line-table.tsx`

- [ ] **Step 1: Create exception banner**

```typescript
// app/(main)/store-operations/sales-consumption/components/sc-exception-banner.tsx
import Link from 'next/link'
import { AlertTriangle, ArrowRight } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface SCExceptionBannerProps {
  pendingCount: number
}

export function SCExceptionBanner({ pendingCount }: SCExceptionBannerProps) {
  if (pendingCount === 0) return null

  return (
    <Alert className="border-amber-300 bg-amber-50">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">
        {pendingCount} line{pendingCount !== 1 ? 's' : ''} pending in POS Exception Queue
      </AlertTitle>
      <AlertDescription className="text-amber-700 flex items-center justify-between">
        <span>
          These ingredient lines could not be auto-posted. Resolve mappings in POS Integration to generate a Supplemental SC.
        </span>
        <Button variant="outline" size="sm" asChild className="ml-4 border-amber-400 text-amber-800 hover:bg-amber-100">
          <Link href="/system-administration/system-integration/pos/operate/exceptions">
            View Exceptions <ArrowRight className="h-3 w-3 ml-1" />
          </Link>
        </Button>
      </AlertDescription>
    </Alert>
  )
}
```

- [ ] **Step 2: Create SC line table**

```typescript
// app/(main)/store-operations/sales-consumption/components/sc-line-table.tsx
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import type { SalesConsumptionLine } from '@/lib/types/sales-consumption'
import { getExceptionCodeLabel } from '@/lib/services/sales-consumption-service'

interface SCLineTableProps {
  lines: SalesConsumptionLine[]
}

export function SCLineTable({ lines }: SCLineTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>POS Item</TableHead>
          <TableHead>Ingredient</TableHead>
          <TableHead className="text-right">Qty</TableHead>
          <TableHead>UoM</TableHead>
          <TableHead className="text-right">Unit Cost</TableHead>
          <TableHead className="text-right">Extended Cost</TableHead>
          <TableHead>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.map(line => (
          <TableRow key={line.id} className={line.status === 'pending' ? 'bg-amber-50/50' : ''}>
            <TableCell className="text-sm">{line.posItemName}</TableCell>
            <TableCell className="text-sm">{line.ingredientProductName ?? '—'}</TableCell>
            <TableCell className="text-right text-sm font-mono">
              {line.qtyConsumed > 0 ? line.qtyConsumed.toFixed(4) : '—'}
            </TableCell>
            <TableCell className="text-sm">{line.unitOfMeasure || '—'}</TableCell>
            <TableCell className="text-right text-sm font-mono">
              {line.unitCost > 0 ? line.unitCost.toFixed(2) : '—'}
            </TableCell>
            <TableCell className="text-right text-sm font-mono">
              {line.extendedCost > 0 ? line.extendedCost.toFixed(4) : '—'}
            </TableCell>
            <TableCell>
              {line.status === 'posted' && (
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Posted</Badge>
              )}
              {line.status === 'pending' && line.exceptionCode && (
                <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100" title={line.exceptionDetail}>
                  {getExceptionCodeLabel(line.exceptionCode)}
                </Badge>
              )}
              {line.status === 'reversed' && (
                <Badge variant="outline" className="text-gray-500">Reversed</Badge>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
```

- [ ] **Step 3: Create SC detail page**

```typescript
// app/(main)/store-operations/sales-consumption/[id]/page.tsx
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, FileText } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { SCStatusBadge } from '../components/sc-status-badge'
import { SCExceptionBanner } from '../components/sc-exception-banner'
import { SCLineTable } from '../components/sc-line-table'
import { mockSalesConsumptions, mockSCLines } from '@/lib/mock-data/sales-consumption'

interface Props {
  params: { id: string }
}

export default function SCDetailPage({ params }: Props) {
  const sc = mockSalesConsumptions.find(s => s.id === params.id)
  if (!sc) notFound()

  const lines = mockSCLines.filter(l => l.scId === params.id)

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/store-operations/sales-consumption">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold font-mono">{sc.docNumber}</h1>
            <SCStatusBadge status={sc.status} />
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {format(new Date(sc.businessDate), 'EEEE, dd MMMM yyyy')} · {sc.shiftId.replace('shift-', '').replace('_', ' ')} shift
          </p>
        </div>
      </div>

      {/* Exception Banner */}
      {sc.pendingLineCount > 0 && (
        <SCExceptionBanner pendingCount={sc.pendingLineCount} />
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'POS Transactions', value: sc.transactionCount.toString() },
          { label: 'Lines Posted', value: sc.postedLineCount.toString() },
          { label: 'Lines Pending', value: sc.pendingLineCount.toString() },
          {
            label: 'Total Cost Posted',
            value: `${sc.totalCostPosted.currency} ${sc.totalCostPosted.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
          },
        ].map(card => (
          <Card key={card.label}>
            <CardHeader className="pb-1 pt-4 px-4">
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <p className="text-lg font-semibold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lines Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ingredient Lines</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <SCLineTable lines={lines} />
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Test manually**

Navigate to `http://localhost:3000/store-operations/sales-consumption/sc-001`

Verify:
- Header shows `SC-20260127-MAIN-LUNCH-001` with `Posted with Exceptions` badge
- Exception banner visible with link to POS exceptions
- Summary cards show: 47 transactions, 89 posted, 3 pending, 1,247.50 USD
- Lines table shows 1 posted line (Americano → Espresso Beans) and 3 exception lines (amber badge with reason code label)
- Navigate to `sc-002` — no exception banner, all lines green

- [ ] **Step 5: Commit**

```bash
git add app/\(main\)/store-operations/sales-consumption/
git commit -m "feat(ui): add Sales Consumption detail page with exception banner and line table"
```

---

## Phase 3 — POS UI Restructure (Setup / Operate / Audit)

### Task 9: Convert POS page to nested layout

**Files:**
- Create: `app/(main)/system-administration/system-integration/pos/layout.tsx`
- Modify: `app/(main)/system-administration/system-integration/pos/page.tsx`
- Create: `app/(main)/system-administration/system-integration/pos/operate/page.tsx`
- Create: `app/(main)/system-administration/system-integration/pos/setup/page.tsx`
- Create: `app/(main)/system-administration/system-integration/pos/audit/page.tsx`
- Create: `app/(main)/system-administration/system-integration/pos/operate/exceptions/page.tsx`

- [ ] **Step 1: Create the POS layout with sub-nav**

```typescript
// app/(main)/system-administration/system-integration/pos/layout.tsx
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { label: 'Setup', href: '/system-administration/system-integration/pos/setup' },
  { label: 'Operate', href: '/system-administration/system-integration/pos/operate' },
  { label: 'Audit', href: '/system-administration/system-integration/pos/audit' },
]

export default function POSLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-full">
      {/* Section sub-nav */}
      <div className="border-b bg-background px-6">
        <div className="flex items-center gap-1 -mb-px">
          {NAV_ITEMS.map(item => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted'
                )}
              >
                {item.label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Section content */}
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Convert root page.tsx to a redirect**

Replace the entire content of `app/(main)/system-administration/system-integration/pos/page.tsx` with:

```typescript
// app/(main)/system-administration/system-integration/pos/page.tsx
import { redirect } from 'next/navigation'

export default function POSRootPage() {
  redirect('/system-administration/system-integration/pos/operate')
}
```

- [ ] **Step 3: Create Operate landing page**

```typescript
// app/(main)/system-administration/system-integration/pos/operate/page.tsx
'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react'
import { mockSalesConsumptions } from '@/lib/mock-data/sales-consumption'

export default function POSOperatePage() {
  // Count exceptions across all SCs (mock)
  const totalExceptions = mockSalesConsumptions.reduce((sum, sc) => sum + sc.pendingLineCount, 0)

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h2 className="text-lg font-semibold">Sync Health</h2>
        <p className="text-sm text-muted-foreground">Daily operational view. Clear exceptions to complete SC posting.</p>
      </div>

      {/* Exception Summary Card */}
      <Card className={totalExceptions > 0 ? 'border-amber-300' : 'border-green-300'}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              {totalExceptions > 0
                ? <AlertTriangle className="h-5 w-5 text-amber-500" />
                : <CheckCircle className="h-5 w-5 text-green-500" />}
              Exception Queue
            </CardTitle>
            <Button variant="outline" size="sm" asChild>
              <Link href="/system-administration/system-integration/pos/operate/exceptions">
                View All Exceptions
              </Link>
            </Button>
          </div>
          <CardDescription>
            {totalExceptions > 0
              ? `${totalExceptions} lines pending — resolve to complete SC posting`
              : 'No open exceptions. All shifts fully posted.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {totalExceptions > 0 && (
            <div className="space-y-2">
              {mockSalesConsumptions
                .filter(sc => sc.pendingLineCount > 0)
                .map(sc => (
                  <div key={sc.id} className="flex items-center justify-between text-sm">
                    <span className="font-mono">{sc.docNumber}</span>
                    <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                      {sc.pendingLineCount} pending
                    </Badge>
                  </div>
                ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* SC Status Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Recent SC Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockSalesConsumptions.map(sc => (
              <div key={sc.id} className="flex items-center justify-between">
                <div>
                  <Link
                    href={`/store-operations/sales-consumption/${sc.id}`}
                    className="text-sm font-mono text-primary hover:underline"
                  >
                    {sc.docNumber}
                  </Link>
                  <p className="text-xs text-muted-foreground">{sc.businessDate} · {sc.shiftId.replace('shift-', '')}</p>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">{sc.transactionCount} txns</span>
                  {sc.status === 'posted' && <CheckCircle className="h-4 w-4 text-green-500" />}
                  {sc.status === 'posted_with_exceptions' && <AlertTriangle className="h-4 w-4 text-amber-500" />}
                  {sc.status === 'blocked' && <XCircle className="h-4 w-4 text-red-500" />}
                  {sc.status === 'draft' && <Clock className="h-4 w-4 text-gray-400" />}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 4: Create Exception Queue page**

```typescript
// app/(main)/system-administration/system-integration/pos/operate/exceptions/page.tsx
'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { mockSCLines } from '@/lib/mock-data/sales-consumption'
import { getExceptionCodeLabel } from '@/lib/services/sales-consumption-service'
import { EXCEPTION_CODE_LABELS } from '@/lib/types/sales-consumption'

export default function ExceptionQueuePage() {
  const exceptions = mockSCLines.filter(l => l.status === 'pending')

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Exception Queue</h2>
          <p className="text-sm text-muted-foreground">
            Resolve mapping issues to post these lines to the inventory ledger via Supplemental SC.
          </p>
        </div>
        {exceptions.length > 0 && (
          <Badge className="bg-amber-100 text-amber-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            {exceptions.length} pending
          </Badge>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {exceptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <p className="text-sm">No open exceptions.</p>
              <p className="text-xs mt-1">All POS sales have been posted to inventory.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>POS Item</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead>SC Document</TableHead>
                  <TableHead>Detail</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exceptions.map(line => (
                  <TableRow key={line.id}>
                    <TableCell className="text-sm font-medium">{line.posItemName}</TableCell>
                    <TableCell>
                      <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">
                        {line.exceptionCode ? getExceptionCodeLabel(line.exceptionCode) : 'Unknown'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Link
                        href={`/store-operations/sales-consumption/${line.scId}`}
                        className="text-sm font-mono text-primary hover:underline"
                      >
                        {line.scId}
                      </Link>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                      {line.exceptionDetail}
                    </TableCell>
                    <TableCell>
                      <Button size="sm" variant="outline" className="text-xs">
                        Resolve & Re-post
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

- [ ] **Step 5: Create Setup landing page**

```typescript
// app/(main)/system-administration/system-integration/pos/setup/page.tsx
'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { POSMappingTab } from '../components/pos-mapping-tab'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Wifi, Upload, Webhook } from 'lucide-react'

// Placeholder connections from mock
const mockConnections = [
  { id: 'conn-1', name: 'Square - Main Outlet', model: 'square', mode: 'api' as const, status: 'active' as const, lastSync: '2 min ago' },
  { id: 'conn-2', name: 'Generic CSV - Outlet 2', model: 'generic_csv', mode: 'file_import' as const, status: 'active' as const, lastSync: '1 day ago' },
]

const MODE_ICON = { api: Wifi, file_import: Upload, webhook: Webhook }
const MODE_LABEL = { api: 'API', file_import: 'File Import', webhook: 'Webhook' }

export default function POSSetupPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Tabs defaultValue="connections">
        <TabsList>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="mappings">Mappings</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>POS Connections</CardTitle>
                  <CardDescription>Configure how each POS system delivers data to Carmen.</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" /> Add Connection
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockConnections.map(conn => {
                  const ModeIcon = MODE_ICON[conn.mode]
                  return (
                    <div key={conn.id} className="flex items-center justify-between p-3 border rounded-md">
                      <div className="flex items-center gap-3">
                        <ModeIcon className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{conn.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {MODE_LABEL[conn.mode]} · Last sync: {conn.lastSync}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                        <Button variant="ghost" size="sm">Edit</Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mappings" className="mt-6">
          {/* Re-use existing mapping component */}
          <POSMappingTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 6: Create Audit landing page**

```typescript
// app/(main)/system-administration/system-integration/pos/audit/page.tsx
'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { POSTransactionsTab } from '../components/pos-transactions-tab'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function POSAuditPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Raw Transactions</TabsTrigger>
          <TabsTrigger value="sync-events">Sync Events</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-6">
          <POSTransactionsTab />
        </TabsContent>

        <TabsContent value="sync-events" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Sync Events</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Sync event log coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

- [ ] **Step 7: Build check**

```bash
npm run build 2>&1 | grep -E "error|Error|✓" | head -20
```

Expected: No errors

- [ ] **Step 8: Manual UI walkthrough**

Start dev server (`npm run dev`) and verify:

1. Navigate to `/system-administration/system-integration/pos`
   - Should redirect to `/pos/operate` (Sync Health dashboard)
   - Sub-nav shows Setup | Operate | Audit; Operate is active

2. Click **Setup**
   - Shows Connections and Mappings tabs
   - Connections tab lists 2 mock connections with mode badges and status
   - Mappings tab renders the existing `POSMappingTab` component unchanged

3. Click **Operate** → **Exceptions** (via button)
   - Shows exception queue with 3 rows matching mock data
   - Each row has POS item name, amber reason code badge, SC link, detail text

4. Click **Audit**
   - Shows Raw Transactions and Sync Events tabs
   - Raw Transactions tab renders existing `POSTransactionsTab` unchanged

- [ ] **Step 9: Commit**

```bash
git add app/\(main\)/system-administration/system-integration/pos/
git commit -m "feat(ui): restructure POS into Setup/Operate/Audit sections with Exception Queue"
```

---

## Phase 4 — SC Generation Job (Stub)

### Task 10: Add SC generation API route (stub for future cron)

**Files:**
- Create: `app/api/pos/sync/route.ts` (move from menu-engineering + add SC trigger)
- Create: `app/api/pos/admin/sc-generate/route.ts` (manual trigger for dev)

- [ ] **Step 1: Create the moved sync route**

```typescript
// app/api/pos/sync/route.ts
// Moved from app/api/menu-engineering/pos/sync/route.ts
// The old path now redirects here (308) — see below

import { NextResponse } from 'next/server'

export async function POST() {
  // TODO: Trigger actual POS sync per connection
  // For now, returns a stub response
  return NextResponse.json({
    success: true,
    message: 'POS sync triggered (stub)',
    syncedAt: new Date().toISOString(),
  })
}
```

- [ ] **Step 2: Create the old route as a 308 redirect**

```typescript
// app/api/menu-engineering/pos/sync/route.ts
// MOVED to /api/pos/sync — this is a compatibility redirect for one release
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const url = new URL(request.url)
  const newUrl = url.href.replace('/api/menu-engineering/pos/sync', '/api/pos/sync')
  return NextResponse.redirect(newUrl, 308)
}
```

- [ ] **Step 3: Create the 410 Gone for deleted import route**

```typescript
// app/api/menu-engineering/sales/import/route.ts
// REMOVED — file import is now in POS Setup → Connections
import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json(
    {
      error: 'Gone',
      message: 'Sales data import has moved to POS Integration → Setup → Connections. Configure a file_import connector there.',
      alternativePath: '/system-administration/system-integration/pos/setup',
    },
    { status: 410 }
  )
}
```

- [ ] **Step 4: Create the manual SC generation admin route**

```typescript
// app/api/pos/admin/sc-generate/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { locationId, shiftId, businessDate, dryRun = false } = body

  if (!locationId || !shiftId || !businessDate) {
    return NextResponse.json(
      { error: 'locationId, shiftId, and businessDate are required' },
      { status: 422 }
    )
  }

  // TODO: Wire up to sales-consumption-service.generate()
  return NextResponse.json({
    success: true,
    dryRun,
    message: dryRun
      ? `Dry run: would generate SC for ${locationId}/${shiftId}/${businessDate}`
      : `SC generation triggered for ${locationId}/${shiftId}/${businessDate} (stub)`,
    triggeredAt: new Date().toISOString(),
  })
}
```

- [ ] **Step 5: Type-check and build**

```bash
npm run checktypes && npm run build 2>&1 | grep -E "error|Error" | head -10
```

Expected: No errors

- [ ] **Step 6: Verify redirects manually**

```bash
# Verify 308 redirect
curl -X POST http://localhost:3000/api/menu-engineering/pos/sync -i | head -5

# Verify 410 Gone
curl -X POST http://localhost:3000/api/menu-engineering/sales/import -i | head -5
```

Expected:
- First: `HTTP/1.1 308 Permanent Redirect`
- Second: `HTTP/1.1 410 Gone`

- [ ] **Step 7: Commit**

```bash
git add app/api/pos/ app/api/menu-engineering/pos/sync/route.ts app/api/menu-engineering/sales/import/route.ts
git commit -m "feat(api): add /api/pos/sync, 308 redirect for old sync path, 410 for deleted import"
```

---

## Phase 5 — Menu Engineering Cleanup

### Task 11: Remove sales-data-import.tsx from Menu Engineering page

**Files:**
- Modify: `app/(main)/operational-planning/menu-engineering/page.tsx`
- Delete: `components/sales-data-import.tsx` (if not used elsewhere)

- [ ] **Step 1: Check if sales-data-import.tsx is referenced elsewhere**

```bash
grep -rn "sales-data-import\|SalesDataImport" /Users/peak/Documents/GitHub/carmen/app /Users/peak/Documents/GitHub/carmen/components /Users/peak/Documents/GitHub/carmen/lib
```

Expected output: Only references in `components/sales-data-import.tsx` itself and the ME page.

- [ ] **Step 2: Remove the import and usage from ME page**

In `app/(main)/operational-planning/menu-engineering/page.tsx`, find and remove:
- The import line for `SalesDataImport` (or whatever it's called)
- Any JSX usage of the component
- Any related state (upload modal state, etc.)

Check the current imports with:
```bash
grep -n "import\|SalesDataImport\|sales-data-import" app/\(main\)/operational-planning/menu-engineering/page.tsx | head -20
```

Remove only the import and usage. Do not change any other ME functionality.

- [ ] **Step 3: Delete the component file**

```bash
rm /Users/peak/Documents/GitHub/carmen/components/sales-data-import.tsx
```

- [ ] **Step 4: Type-check**

```bash
npm run checktypes
```

Expected: No errors. If there are errors referencing `sales-data-import`, check `grep` output from Step 1 and remove remaining usages.

- [ ] **Step 5: Build**

```bash
npm run build 2>&1 | grep -E "error|Error" | head -10
```

Expected: Clean build

- [ ] **Step 6: Manual check**

Navigate to `http://localhost:3000/operational-planning/menu-engineering`

Verify:
- Page loads without error
- No "Import Sales Data" button visible
- Existing recipe performance, cost alerts, and analytics components unchanged

- [ ] **Step 7: Confirm zero dead references**

```bash
grep -rn "sales-data-import\|SalesDataImport" /Users/peak/Documents/GitHub/carmen/app /Users/peak/Documents/GitHub/carmen/components
```

Expected: No output

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat(cleanup): remove sales-data-import from Menu Engineering — import now in POS Setup"
```

---

## Final Verification

- [ ] **Full type check**

```bash
npm run checktypes
```

Expected: No errors

- [ ] **Full lint**

```bash
npm run lint
```

Expected: No errors

- [ ] **Full test run**

```bash
npm run test:run
```

Expected: All tests pass (new tests from Tasks 1–6 included)

- [ ] **Production build**

```bash
npm run build
```

Expected: Clean build

- [ ] **Zero references to deleted paths**

```bash
grep -rn "sales-data-import\|menu-engineering/pos/sync\|menu-engineering/sales/import" \
  /Users/peak/Documents/GitHub/carmen/app \
  /Users/peak/Documents/GitHub/carmen/components \
  /Users/peak/Documents/GitHub/carmen/lib \
  --include="*.ts" --include="*.tsx"
```

Expected: No output (only the compatibility routes themselves should reference these paths, not callers)

- [ ] **Manual golden path walkthrough**

1. `/store-operations/sales-consumption` — SC list with 3 rows, badges correct
2. `/store-operations/sales-consumption/sc-001` — exception banner, 1 posted line, 3 exception lines
3. `/system-administration/system-integration/pos` — redirects to Operate section
4. `/pos/operate` — Sync Health with exception count card
5. `/pos/operate/exceptions` — 3 exception rows with reason codes and SC links
6. `/pos/setup` — Connections + Mappings tabs, existing mapping UI intact
7. `/pos/audit` — Raw Transactions tab renders existing UI
8. `/operational-planning/menu-engineering` — loads cleanly, no import button

---

## Open Questions (resolve before implementing Phase 4 fully)

| # | Question | Affects |
|---|---------|---------|
| OQ-1 | Comp/discount policy: treat comped sales as Wastage, SC with zero revenue, or skip? | `COMP_OR_DISCOUNT` exception resolution, BR §14 |
| OQ-2 | Late refund policy: auto-reversing line vs always-manual? | `VOID_AFTER_POST` auto-resolution rule |
| OQ-3 | Does Carmen have an existing `Shift` model in Prisma? | SC schema `shiftId` FK vs string |

---

## What's Not In This Plan (follow-on work)

- **Prisma schema additions** for `tb_sales_consumption` and `tb_sales_consumption_line` — needs DB access and schema review
- **Real SC generation job** (Vercel Cron) — requires Prisma + POS transaction service integration; stub in Task 10
- **Connection Wizard** UI (full multi-step form with validation) — placeholder Add Connection button in Task 9
- **ME analytics refactor** to read from SC via the data source adapter — requires real SC data from Prisma
- **Void SC** action — UI button + API route, deferred pending comp/refund policy decisions
