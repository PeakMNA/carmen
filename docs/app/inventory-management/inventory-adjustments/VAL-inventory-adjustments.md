# Validation Rules: Inventory Adjustments

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Inventory Adjustments
- **Version**: 2.1.0
- **Last Updated**: 2025-12-09
- **Status**: Active

**IMPORTANT**: Inventory adjustments use the **shared costing methods infrastructure**. This document includes validation rules specific to adjustments plus references shared validations from SM-costing-methods.md.

## Document Purpose

This document defines comprehensive validation rules for the Inventory Adjustments module across all system layers: client-side (UI), server-side (application), and database constraints. Validations ensure data integrity, prevent errors, enforce business rules, maintain audit compliance, and integrate properly with the shared inventory transaction system.

**Related Documents**:
- **[SM: Costing Methods](../../shared-methods/inventory-valuation/SM-costing-methods.md)** ← Shared validation rules for transactions, lot tracking, and balance calculations
- **[SM: Period-End Snapshots](../../shared-methods/inventory-valuation/SM-period-end-snapshots.md)** ← Period validation and snapshot rules
- [Business Requirements](./BR-inventory-adjustments.md)
- [Use Cases](./UC-inventory-adjustments.md)
- [Technical Specification](./TS-inventory-adjustments.md)
- [Data Schema](./DS-inventory-adjustments.md)
- [Flow Diagrams](./FD-inventory-adjustments.md)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
| 2.0.0 | 2025-01-10 | Development Team | Updated for shared costing methods |
| 2.1.0 | 2025-12-09 | Development Team | Updated VAL-INV-ADJ-003 with type-specific adjustment reasons (IN/OUT), added VAL-INV-ADJ-007 costing rules based on type |
---

## Validation Categories

### Field-Level Validations (VAL-INV-ADJ-001 to 099)
Basic field format, type, and range validations for adjustment header, items, and transaction data

### Business Rule Validations (VAL-INV-ADJ-101 to 199)
Complex business logic validations for status workflows, journal generation, stock updates, and lot tracking

### Cross-Field Validations (VAL-INV-ADJ-201 to 299)
Validations involving multiple fields, entity relationships, and data aggregations

### Security Validations (VAL-INV-ADJ-301 to 399)
Permission and authorization validations for location and role-based access control

### Data Integrity Validations (VAL-INV-ADJ-401 to 499)
Validations ensuring consistency across stock balances, journals, and audit trails

### Performance Validations (VAL-INV-ADJ-501 to 599)
Resource usage, batch size, and operation limits to maintain system performance

---

## Field-Level Validations

### VAL-INV-ADJ-001: Adjustment Type Validity
**Rule**: Adjustment type must be either 'IN' (increase) or 'OUT' (decrease).

**Layer**: Client + Server
**Error Message**: "Invalid adjustment type. Must be 'IN' or 'OUT'."
**Implementation**:
```typescript
// Zod schema
const adjustmentTypeSchema = z.enum(['IN', 'OUT'], {
  errorMap: () => ({ message: "Adjustment type must be 'IN' or 'OUT'" })
});

// Type definition
type AdjustmentType = z.infer<typeof adjustmentTypeSchema>;

// Validation function
function validateAdjustmentType(type: string): void {
  const result = adjustmentTypeSchema.safeParse(type);

  if (!result.success) {
    throw new ValidationError(
      "Invalid adjustment type. Must be 'IN' or 'OUT'."
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: type='IN'
- ✅ Valid: type='OUT'
- ❌ Invalid: type='ADJUST', type='in', type=null, type=''

---

### VAL-INV-ADJ-002: Adjustment Date Validity
**Rule**: Adjustment date must not be a future date and must be within current fiscal period.

**Layer**: Client + Server
**Error Message**: "Adjustment date cannot be in the future and must be within the current fiscal period."
**Implementation**:
```typescript
const adjustmentDateSchema = z.date()
  .max(new Date(), "Adjustment date cannot be in the future")
  .refine(
    date => {
      // Check if within current fiscal period
      const fiscalPeriod = getCurrentFiscalPeriod();
      return date >= fiscalPeriod.startDate && date <= fiscalPeriod.endDate;
    },
    "Adjustment date must be within current fiscal period"
  );

// Validation function
async function validateAdjustmentDate(date: Date): Promise<void> {
  const result = adjustmentDateSchema.safeParse(date);

  if (!result.success) {
    throw new ValidationError(result.error.errors[0].message);
  }

  // Additional validation: Cannot be before last posted adjustment
  const lastPostedDate = await getLastPostedAdjustmentDate();
  if (date < lastPostedDate) {
    throw new ValidationError(
      `Adjustment date cannot be before last posted adjustment (${format(lastPostedDate, 'yyyy-MM-dd')})`
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: date=2025-01-10 (today, within fiscal period)
- ✅ Valid: date=2025-01-05 (past, within fiscal period)
- ❌ Invalid: date=2025-01-15 (future date)
- ❌ Invalid: date=2024-12-15 (before fiscal period start)
- ❌ Invalid: date=2025-01-03 (before last posted adjustment on 2025-01-05)

---

### VAL-INV-ADJ-003: Adjustment Reason Validity (Type-Specific)
**Rule**: Adjustment reason must be valid for the selected adjustment type. Stock OUT and Stock IN adjustments have different valid reason sets.

**Layer**: Client + Server
**Error Message**: "Invalid adjustment reason for selected type."
**Implementation**:
```typescript
// Type-specific adjustment reasons based on actual implementation
const ADJUSTMENT_REASONS = {
  // Stock OUT reasons (7 options) - for decreasing inventory
  OUT: [
    { value: 'damaged', label: 'Damaged Goods' },
    { value: 'expired', label: 'Expired Items' },
    { value: 'theft_loss', label: 'Theft / Loss' },
    { value: 'spoilage', label: 'Spoilage' },
    { value: 'count_variance', label: 'Physical Count Variance' },
    { value: 'quality_rejection', label: 'Quality Control Rejection' },
    { value: 'other', label: 'Other' }
  ],
  // Stock IN reasons (5 options) - for increasing inventory
  IN: [
    { value: 'count_variance', label: 'Physical Count Variance' },
    { value: 'found_items', label: 'Found Items' },
    { value: 'return_to_stock', label: 'Return to Stock' },
    { value: 'system_correction', label: 'System Correction' },
    { value: 'other', label: 'Other' }
  ]
} as const;

// Extract valid values for each type
const VALID_OUT_REASONS = ADJUSTMENT_REASONS.OUT.map(r => r.value);
const VALID_IN_REASONS = ADJUSTMENT_REASONS.IN.map(r => r.value);

// Zod schema with type discrimination
const adjustmentReasonOutSchema = z.enum(
  ['damaged', 'expired', 'theft_loss', 'spoilage', 'count_variance', 'quality_rejection', 'other'],
  { errorMap: () => ({ message: "Invalid OUT adjustment reason" }) }
);

const adjustmentReasonInSchema = z.enum(
  ['count_variance', 'found_items', 'return_to_stock', 'system_correction', 'other'],
  { errorMap: () => ({ message: "Invalid IN adjustment reason" }) }
);

// Type-aware validation function
function validateAdjustmentReason(
  reason: string,
  adjustmentType: 'IN' | 'OUT'
): void {
  if (adjustmentType === 'OUT') {
    const result = adjustmentReasonOutSchema.safeParse(reason);
    if (!result.success) {
      throw new ValidationError(
        `Invalid OUT adjustment reason. Must be one of: ${VALID_OUT_REASONS.join(', ')}`
      );
    }
  } else if (adjustmentType === 'IN') {
    const result = adjustmentReasonInSchema.safeParse(reason);
    if (!result.success) {
      throw new ValidationError(
        `Invalid IN adjustment reason. Must be one of: ${VALID_IN_REASONS.join(', ')}`
      );
    }
  }
}

// Get available reasons for UI dropdown based on type
function getAvailableReasons(adjustmentType: 'IN' | 'OUT') {
  return ADJUSTMENT_REASONS[adjustmentType];
}
```

**Reason Mapping by Type**:

| Adjustment Type | Valid Reasons | Count |
|-----------------|---------------|-------|
| Stock OUT | damaged, expired, theft_loss, spoilage, count_variance, quality_rejection, other | 7 |
| Stock IN | count_variance, found_items, return_to_stock, system_correction, other | 5 |

**Test Scenarios**:
- ✅ Valid (OUT): 'damaged', 'expired', 'theft_loss', 'spoilage', 'count_variance', 'quality_rejection', 'other'
- ✅ Valid (IN): 'count_variance', 'found_items', 'return_to_stock', 'system_correction', 'other'
- ❌ Invalid (OUT): 'found_items', 'return_to_stock' (IN-only reasons)
- ❌ Invalid (IN): 'damaged', 'expired', 'theft_loss' (OUT-only reasons)
- ❌ Invalid (Both): '', null, 'unknown_reason'

---

### VAL-INV-ADJ-004: Location Selection Validity
**Rule**: Selected location must exist, be active, and be accessible to the user.

**Layer**: Client + Server
**Error Message**: "Selected location is invalid or not accessible."
**Implementation**:
```typescript
const locationSelectionSchema = z.string().uuid("Invalid location ID");

async function validateLocationAccess(
  userId: string,
  locationId: string
): Promise<void> {
  // Validate UUID format
  locationSelectionSchema.parse(locationId);

  // Check if location exists and is active
  const location = await getLocation(locationId);
  if (!location) {
    throw new ValidationError("Selected location does not exist");
  }

  if (!location.isActive) {
    throw new ValidationError("Selected location is inactive");
  }

  // Check user access
  const user = await getUserContext(userId);

  // System Administrator has access to all locations
  if (user.role === 'System Administrator') {
    return;
  }

  // Check if location is in user's accessible locations
  const hasAccess = user.availableLocations.some(
    loc => loc.id === locationId
  );

  if (!hasAccess) {
    throw new ValidationError(
      "You do not have access to the selected location"
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: locationId=valid-uuid in user.availableLocations
- ✅ Valid (Admin): locationId=any-active-location-uuid
- ❌ Invalid: locationId='invalid-uuid-format'
- ❌ Invalid: locationId=inactive-location-uuid
- ❌ Invalid: locationId=location-not-in-user-permissions

---

### VAL-INV-ADJ-005: Department Selection Validity
**Rule**: Selected department must exist, be active, and be accessible to the user.

**Layer**: Client + Server
**Error Message**: "Selected department is invalid or not accessible."
**Implementation**:
```typescript
const departmentSelectionSchema = z.string().uuid("Invalid department ID");

async function validateDepartmentAccess(
  userId: string,
  departmentId: string
): Promise<void> {
  // Validate UUID format
  departmentSelectionSchema.parse(departmentId);

  // Check if department exists and is active
  const department = await getDepartment(departmentId);
  if (!department) {
    throw new ValidationError("Selected department does not exist");
  }

  if (!department.isActive) {
    throw new ValidationError("Selected department is inactive");
  }

  // Check user access
  const user = await getUserContext(userId);

  // System Administrator has access to all departments
  if (user.role === 'System Administrator') {
    return;
  }

  // Check if department is in user's accessible departments
  const hasAccess = user.availableDepartments.some(
    dept => dept.id === departmentId
  );

  if (!hasAccess) {
    throw new ValidationError(
      "You do not have access to the selected department"
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: departmentId=valid-uuid in user.availableDepartments
- ✅ Valid (Admin): departmentId=any-active-department-uuid
- ❌ Invalid: departmentId='invalid-uuid-format'
- ❌ Invalid: departmentId=inactive-department-uuid
- ❌ Invalid: departmentId=department-not-in-user-permissions

---

### VAL-INV-ADJ-006: Item Quantity Validity
**Rule**: Item quantities must be positive, non-zero, and match adjustment type direction.

**Layer**: Client + Server
**Error Message**: "Invalid item quantity."
**Implementation**:
```typescript
const adjustmentItemSchema = z.object({
  itemId: z.string().uuid("Invalid item ID"),
  lotId: z.string().uuid("Invalid lot ID").optional(),
  inQuantity: z.number()
    .nonnegative("IN quantity cannot be negative")
    .finite("IN quantity must be a finite number"),
  outQuantity: z.number()
    .nonnegative("OUT quantity cannot be negative")
    .finite("OUT quantity must be a finite number"),
  unitCost: z.number()
    .nonnegative("Unit cost cannot be negative")
    .finite("Unit cost must be a finite number")
})
.refine(
  data => data.inQuantity > 0 || data.outQuantity > 0,
  "Either IN quantity or OUT quantity must be greater than zero"
)
.refine(
  data => !(data.inQuantity > 0 && data.outQuantity > 0),
  "Cannot have both IN and OUT quantities for the same item"
);

// Validation with adjustment type
function validateItemQuantityDirection(
  adjustmentType: AdjustmentType,
  item: AdjustmentItem
): void {
  if (adjustmentType === 'IN' && item.inQuantity <= 0) {
    throw new ValidationError(
      "IN adjustment must have positive IN quantity"
    );
  }

  if (adjustmentType === 'IN' && item.outQuantity > 0) {
    throw new ValidationError(
      "IN adjustment cannot have OUT quantity"
    );
  }

  if (adjustmentType === 'OUT' && item.outQuantity <= 0) {
    throw new ValidationError(
      "OUT adjustment must have positive OUT quantity"
    );
  }

  if (adjustmentType === 'OUT' && item.inQuantity > 0) {
    throw new ValidationError(
      "OUT adjustment cannot have IN quantity"
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid (IN): inQty=50, outQty=0
- ✅ Valid (OUT): inQty=0, outQty=30
- ❌ Invalid: inQty=0, outQty=0 (no quantity)
- ❌ Invalid: inQty=50, outQty=30 (both directions)
- ❌ Invalid: inQty=-10 (negative)
- ❌ Invalid (Type mismatch): type='IN', inQty=0, outQty=50

---

### VAL-INV-ADJ-007: Unit Cost Validity (Type-Specific Costing Rules)
**Rule**: Unit cost behavior depends on adjustment type:
- **Stock OUT**: Uses system average cost automatically (read-only, no user input)
- **Stock IN**: Requires manual unit cost entry (starts at 0, user must enter)

**Layer**: Client + Server
**Error Message**: "Invalid unit cost for adjustment type."
**Implementation**:
```typescript
const unitCostSchema = z.number()
  .nonnegative("Unit cost cannot be negative")
  .finite("Unit cost must be a finite number")
  .max(999999.99, "Unit cost exceeds maximum value");

// Type-specific costing validation based on actual implementation
function validateUnitCost(
  item: InventoryItem,
  unitCost: number,
  adjustmentType: 'IN' | 'OUT'
): void {
  // Basic validation
  unitCostSchema.parse(unitCost);

  if (adjustmentType === 'OUT') {
    // Stock OUT: System automatically uses product's average cost
    // User cannot modify - validate it matches product.avgCost
    const expectedCost = item.avgCost || 0;

    if (Math.abs(unitCost - expectedCost) > 0.01) {
      throw new ValidationError(
        `OUT adjustment unit cost must match system average cost. ` +
        `Expected: ${expectedCost.toFixed(2)}, Provided: ${unitCost.toFixed(2)}`
      );
    }
  } else if (adjustmentType === 'IN') {
    // Stock IN: User must manually enter cost
    // Zero cost requires confirmation as it affects inventory valuation
    if (unitCost === 0) {
      console.warn(
        `Zero unit cost for IN adjustment will affect inventory valuation. ` +
        `Item: ${item.name}, Quantity will be added at $0.00 cost.`
      );
    }

    // Variance check for IN adjustments - warn if significantly different from avg
    const avgCost = item.avgCost || 0;
    if (avgCost > 0 && unitCost > 0) {
      const variance = Math.abs(unitCost - avgCost) / avgCost;

      // Warn if cost differs by more than 50% from average
      if (variance > 0.5) {
        console.warn(
          `IN adjustment unit cost (${unitCost.toFixed(2)}) differs significantly ` +
          `from item average cost (${avgCost.toFixed(2)}). ` +
          `Variance: ${(variance * 100).toFixed(1)}%. This will affect weighted average cost.`
        );
      }
    }
  }
}

// Pre-fill cost based on adjustment type (used in form initialization)
function getInitialUnitCost(
  product: Product,
  adjustmentType: 'IN' | 'OUT'
): number {
  if (adjustmentType === 'OUT') {
    // OUT: Auto-populate with system average cost (read-only)
    return product.avgCost || 0;
  } else {
    // IN: Start at 0, user must manually enter
    return 0;
  }
}
```

**Costing Rules Summary**:

| Type | Cost Source | User Editable | Default Value |
|------|-------------|---------------|---------------|
| Stock OUT | product.avgCost | ❌ No (read-only) | System average cost |
| Stock IN | Manual entry | ✅ Yes (required) | 0 (user must enter) |

**Test Scenarios**:
- ✅ Valid (OUT): cost=25.50 when product.avgCost=25.50 (matches system)
- ✅ Valid (IN): cost=30.00 (user-entered value)
- ✅ Valid (IN): cost=0 (with warning about inventory valuation impact)
- ✅ Valid (IN, warning): cost=50 when avgCost=100 (50% variance warning)
- ❌ Invalid (OUT): cost=30.00 when product.avgCost=25.50 (must match system)
- ❌ Invalid: cost=-10 (negative)
- ❌ Invalid: cost=1000000 (exceeds max)
- ❌ Invalid: cost=NaN, cost=Infinity

---

### VAL-INV-ADJ-008: Description Length Validity
**Rule**: Descriptions must not exceed maximum length and should be meaningful.

**Layer**: Client
**Error Message**: "Description is too long or contains invalid characters."
**Implementation**:
```typescript
const descriptionSchema = z.string()
  .max(500, "Description cannot exceed 500 characters")
  .regex(
    /^[a-zA-Z0-9\s.,;:'"()\-\/&]*$/,
    "Description contains invalid characters"
  )
  .optional();

const voidReasonSchema = z.string()
  .min(10, "Void reason must be at least 10 characters")
  .max(500, "Void reason cannot exceed 500 characters");

// Validation functions
function validateDescription(description?: string): void {
  if (description) {
    const trimmed = description.trim();
    if (trimmed.length === 0) {
      // Empty descriptions are allowed, just omit the field
      return;
    }
    descriptionSchema.parse(trimmed);
  }
}

function validateVoidReason(reason: string): void {
  const trimmed = reason.trim();
  if (trimmed.length < 10) {
    throw new ValidationError(
      "Void reason must be at least 10 characters and explain why this adjustment is being voided"
    );
  }
  voidReasonSchema.parse(trimmed);
}
```

**Test Scenarios**:
- ✅ Valid: description="Stock count revealed discrepancy in flour quantity"
- ✅ Valid: description=null/undefined (optional)
- ✅ Valid (void reason): "Incorrect quantity entered; should be 50 units not 500"
- ❌ Invalid: description with 501 characters
- ❌ Invalid: description with special chars like <, >, $
- ❌ Invalid (void): reason="error" (too short)

---

### VAL-INV-ADJ-009: Tab Selection Validation
**Rule**: Selected tab must be one of the valid tab options: Stock Movement, Items, Journal Entries.

**Layer**: Client
**Error Message**: "Invalid tab selection."
**Implementation**:
```typescript
const VALID_TABS = ['stock-movement', 'items', 'journal-entries'] as const;

const tabSelectionSchema = z.enum(VALID_TABS);

function validateTabSelection(tab: string): void {
  const result = tabSelectionSchema.safeParse(tab);

  if (!result.success) {
    throw new ValidationError(
      `Invalid tab selection. Must be one of: ${VALID_TABS.join(', ')}`
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: 'stock-movement', 'items', 'journal-entries'
- ❌ Invalid: 'summary', 'overview', '', null

---

### VAL-INV-ADJ-010: Search Query Validation
**Rule**: Search queries must not exceed maximum length and should not contain SQL injection patterns.

**Layer**: Client
**Error Message**: "Invalid search query."
**Implementation**:
```typescript
const searchQuerySchema = z.string()
  .max(100, "Search query cannot exceed 100 characters")
  .regex(
    /^[a-zA-Z0-9\s\-_]*$/,
    "Search query contains invalid characters"
  )
  .optional();

// SQL injection prevention patterns
const FORBIDDEN_PATTERNS = [
  /(\bOR\b.*=.*)/i,
  /(\bAND\b.*=.*)/i,
  /(--|;|\/\*|\*\/)/,
  /(\bDROP\b|\bDELETE\b|\bUPDATE\b|\bINSERT\b)/i,
  /(\bUNION\b.*\bSELECT\b)/i
];

function validateSearchQuery(query?: string): void {
  if (!query) return;

  const trimmed = query.trim();

  // Length and character validation
  searchQuerySchema.parse(trimmed);

  // SQL injection prevention
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(trimmed)) {
      throw new ValidationError(
        "Search query contains forbidden patterns"
      );
    }
  }
}
```

**Test Scenarios**:
- ✅ Valid: "ADJ-2025-001", "flour", "jan 2025"
- ✅ Valid: "" or null (empty search)
- ❌ Invalid: query with 101 characters
- ❌ Invalid: "ADJ' OR '1'='1" (SQL injection)
- ❌ Invalid: "test--comment" (SQL comment)

---

## Business Rule Validations

### VAL-INV-ADJ-101: Status Transition Workflow
**Rule**: Status transitions must follow valid workflow: Draft → Posted, Posted → Voided. No other transitions allowed.

**Layer**: Server
**Error Message**: "Invalid status transition."
**Implementation**:
```typescript
type AdjustmentStatus = 'DRAFT' | 'POSTED' | 'VOIDED';

const VALID_TRANSITIONS: Record<AdjustmentStatus, AdjustmentStatus[]> = {
  'DRAFT': ['POSTED'],
  'POSTED': ['VOIDED'],
  'VOIDED': []  // Terminal state
};

function validateStatusTransition(
  currentStatus: AdjustmentStatus,
  newStatus: AdjustmentStatus
): void {
  const allowedTransitions = VALID_TRANSITIONS[currentStatus];

  if (!allowedTransitions.includes(newStatus)) {
    throw new ValidationError(
      `Cannot transition from ${currentStatus} to ${newStatus}. ` +
      `Allowed transitions: ${allowedTransitions.join(', ') || 'none (terminal state)'}`
    );
  }
}

// Additional validations for specific transitions
function validatePostTransition(adjustment: Adjustment): void {
  // Must have at least one item
  if (adjustment.items.length === 0) {
    throw new ValidationError(
      "Cannot post adjustment with no items"
    );
  }

  // All items must have valid quantities
  for (const item of adjustment.items) {
    if (item.inQuantity === 0 && item.outQuantity === 0) {
      throw new ValidationError(
        `Item ${item.itemName} has zero quantity`
      );
    }
  }

  // Total quantities must match sum of items
  const calculatedTotalIn = adjustment.items.reduce(
    (sum, item) => sum + item.inQuantity, 0
  );
  const calculatedTotalOut = adjustment.items.reduce(
    (sum, item) => sum + item.outQuantity, 0
  );

  if (Math.abs(adjustment.totalInQty - calculatedTotalIn) > 0.001) {
    throw new ValidationError(
      "Total IN quantity does not match sum of item quantities"
    );
  }

  if (Math.abs(adjustment.totalOutQty - calculatedTotalOut) > 0.001) {
    throw new ValidationError(
      "Total OUT quantity does not match sum of item quantities"
    );
  }
}

function validateVoidTransition(
  adjustment: Adjustment,
  voidReason: string
): void {
  // Must provide void reason
  if (!voidReason || voidReason.trim().length < 10) {
    throw new ValidationError(
      "Void reason is required and must be at least 10 characters"
    );
  }

  // Cannot void if already voided
  if (adjustment.status === 'VOIDED') {
    throw new ValidationError(
      "Adjustment is already voided"
    );
  }

  // Can only void posted adjustments
  if (adjustment.status !== 'POSTED') {
    throw new ValidationError(
      "Only posted adjustments can be voided. Delete draft adjustments instead."
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: DRAFT → POSTED
- ✅ Valid: POSTED → VOIDED (with reason)
- ❌ Invalid: DRAFT → VOIDED
- ❌ Invalid: POSTED → DRAFT
- ❌ Invalid: VOIDED → POSTED
- ❌ Invalid: POST with no items
- ❌ Invalid: VOID without reason

---

### VAL-INV-ADJ-102: Journal Entry Balance Validation
**Rule**: Journal entries must be balanced (total debits = total credits).

**Layer**: Server
**Error Message**: "Journal entry is not balanced. Debits must equal credits."
**Implementation**:
```typescript
const journalEntrySchema = z.object({
  lineNumber: z.number().int().positive(),
  accountCode: z.string().min(1),
  accountName: z.string().min(1),
  debitAmount: z.number().nonnegative(),
  creditAmount: z.number().nonnegative()
})
.refine(
  data => !(data.debitAmount > 0 && data.creditAmount > 0),
  "Entry cannot have both debit and credit amounts"
)
.refine(
  data => data.debitAmount > 0 || data.creditAmount > 0,
  "Entry must have either debit or credit amount"
);

function validateJournalBalance(entries: JournalEntry[]): void {
  // Calculate totals
  const totalDebits = entries.reduce(
    (sum, entry) => sum + entry.debitAmount, 0
  );
  const totalCredits = entries.reduce(
    (sum, entry) => sum + entry.creditAmount, 0
  );

  // Check balance (allow 0.01 rounding difference)
  const difference = Math.abs(totalDebits - totalCredits);

  if (difference > 0.01) {
    throw new ValidationError(
      `Journal entry is not balanced. Debits: ${totalDebits.toFixed(2)}, Credits: ${totalCredits.toFixed(2)}, Difference: ${difference.toFixed(2)}`
    );
  }

  // Validate each entry
  for (const entry of entries) {
    journalEntrySchema.parse(entry);
  }

  // Must have at least 2 entries (debit and credit)
  if (entries.length < 2) {
    throw new ValidationError(
      "Journal must have at least 2 entries (debit and credit)"
    );
  }
}

// Validate journal against adjustment totals
function validateJournalAdjustmentMatch(
  journal: JournalHeader,
  adjustment: Adjustment
): void {
  // Journal total must match adjustment total cost
  const journalTotal = Math.max(
    journal.totalDebit,
    journal.totalCredit
  );

  const difference = Math.abs(journalTotal - adjustment.totalCost);

  if (difference > 0.01) {
    throw new ValidationError(
      `Journal total (${journalTotal.toFixed(2)}) does not match adjustment total (${adjustment.totalCost.toFixed(2)})`
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: debit=500, credit=500 (balanced)
- ✅ Valid: debit=1250.50, credit=1250.50 (balanced with decimals)
- ❌ Invalid: debit=500, credit=600 (unbalanced)
- ❌ Invalid: entry with both debit=100 and credit=100
- ❌ Invalid: entry with debit=0 and credit=0
- ❌ Invalid: journal with only 1 entry
- ❌ Invalid: journal total ≠ adjustment total

---

### VAL-INV-ADJ-103: Stock Availability Validation (OUT Adjustments)
**Rule**: OUT adjustments cannot exceed available stock quantity.

**Layer**: Server
**Error Message**: "Insufficient stock quantity for OUT adjustment."
**Implementation**:
```typescript
async function validateStockAvailability(
  locationId: string,
  items: AdjustmentItem[]
): Promise<void> {
  // Get current stock balances
  const stockBalances = await getStockBalances(locationId);

  // Check each item
  for (const item of items) {
    if (item.outQuantity > 0) {
      const stock = stockBalances.find(
        s => s.itemId === item.itemId && s.lotId === item.lotId
      );

      if (!stock) {
        throw new ValidationError(
          `No stock found for item ${item.itemName}${item.lotId ? ` (Lot: ${item.lotNumber})` : ''}`
        );
      }

      // Check available quantity (on hand - reserved)
      const availableQty = stock.quantityOnHand - stock.quantityReserved;

      if (item.outQuantity > availableQty) {
        throw new ValidationError(
          `Insufficient stock for item ${item.itemName}. ` +
          `Requested: ${item.outQuantity}, Available: ${availableQty}`
        );
      }
    }
  }
}

// Warning for low stock after adjustment
async function validatePostAdjustmentStockLevel(
  locationId: string,
  items: AdjustmentItem[]
): Promise<void> {
  const stockBalances = await getStockBalances(locationId);

  for (const item of items) {
    const stock = stockBalances.find(s => s.itemId === item.itemId);
    if (!stock) continue;

    // Calculate projected quantity
    const projectedQty = stock.quantityOnHand + item.inQuantity - item.outQuantity;

    // Get item reorder point
    const itemDetails = await getItem(item.itemId);
    const reorderPoint = itemDetails.reorderPoint || 0;

    // Warn if adjustment will bring stock below reorder point
    if (projectedQty < reorderPoint && stock.quantityOnHand >= reorderPoint) {
      console.warn(
        `Warning: Adjustment will bring ${item.itemName} below reorder point. ` +
        `Projected: ${projectedQty}, Reorder Point: ${reorderPoint}`
      );
    }
  }
}
```

**Test Scenarios**:
- ✅ Valid: outQty=50, available=100
- ✅ Valid: outQty=100, available=100 (full depletion)
- ✅ Valid (with warning): outQty=80, available=100, reorderPoint=50
- ❌ Invalid: outQty=150, available=100
- ❌ Invalid: outQty=50, stock not found

---

### VAL-INV-ADJ-104: Lot Allocation Validation (FIFO)
**Rule**: For items with lot tracking, OUT adjustments must follow FIFO (First In, First Out) allocation using the shared transaction system.

**Reference**: See [SM-costing-methods.md](../../shared-methods/inventory-valuation/SM-costing-methods.md) for complete FIFO algorithm and lot consumption order.

**Layer**: Server
**Error Message**: "Lot allocation does not follow FIFO method."
**Implementation**:
```typescript
async function validateLotAllocation(
  locationId: string,
  itemId: string,
  outQuantity: number,
  selectedLots: { lotId: string; quantity: number }[]
): Promise<void> {
  // Get all available lots for item, ordered by receive date (FIFO)
  const availableLots = await getLotsByItemLocation(locationId, itemId);

  if (availableLots.length === 0) {
    throw new ValidationError(
      "No lots available for this item at this location"
    );
  }

  // Calculate total selected quantity
  const totalSelectedQty = selectedLots.reduce(
    (sum, lot) => sum + lot.quantity, 0
  );

  // Must match requested out quantity
  if (Math.abs(totalSelectedQty - outQuantity) > 0.001) {
    throw new ValidationError(
      `Lot allocation total (${totalSelectedQty}) does not match OUT quantity (${outQuantity})`
    );
  }

  // Validate each selected lot
  for (const selectedLot of selectedLots) {
    const lot = availableLots.find(l => l.id === selectedLot.lotId);

    if (!lot) {
      throw new ValidationError(
        `Lot ${selectedLot.lotId} not found`
      );
    }

    // Check quantity availability
    const availableQty = lot.quantityOnHand - lot.quantityReserved;
    if (selectedLot.quantity > availableQty) {
      throw new ValidationError(
        `Insufficient quantity in lot ${lot.lotNumber}. ` +
        `Requested: ${selectedLot.quantity}, Available: ${availableQty}`
      );
    }
  }

  // Validate FIFO order
  let remainingQty = outQuantity;
  let lotIndex = 0;

  for (const selectedLot of selectedLots) {
    if (remainingQty <= 0) break;

    // Find this lot in FIFO order
    const fifoIndex = availableLots.findIndex(
      l => l.id === selectedLot.lotId
    );

    // Check if we're skipping older lots
    if (fifoIndex > lotIndex) {
      // Check if older lots have available quantity
      for (let i = lotIndex; i < fifoIndex; i++) {
        const olderLot = availableLots[i];
        const olderAvailableQty = olderLot.quantityOnHand - olderLot.quantityReserved;

        if (olderAvailableQty > 0.001) {
          // Warn but allow (may be intentional for expiry management)
          console.warn(
            `Warning: Skipping older lot ${olderLot.lotNumber} with available quantity ${olderAvailableQty}. ` +
            `FIFO recommends consuming oldest lots first.`
          );
        }
      }
    }

    remainingQty -= selectedLot.quantity;
    lotIndex = fifoIndex + 1;
  }
}
```

**Test Scenarios**:
- ✅ Valid: Select from oldest lot first (FIFO)
- ✅ Valid: Partially deplete oldest, then next oldest
- ✅ Valid (with warning): Skip older lot with available qty
- ❌ Invalid: Total lot qty ≠ out quantity
- ❌ Invalid: Selected lot not found
- ❌ Invalid: Lot quantity > available

---

### VAL-INV-ADJ-105: Negative Stock Prevention
**Rule**: Adjustments must not result in negative stock balances calculated via the shared transaction system.

**Reference**: See [SM-costing-methods.md](../../shared-methods/inventory-valuation/SM-costing-methods.md) for balance calculation using `SUM(in_qty) - SUM(out_qty)`.

**Layer**: Server + Database
**Error Message**: "Adjustment would result in negative stock balance."
**Implementation**:
```typescript
async function validateNegativeStockPrevention(
  locationId: string,
  items: AdjustmentItem[]
): Promise<void> {
  for (const item of items) {
    // Calculate current balance from shared transaction table
    const currentBalance = await calculateBalance(locationId, item.productId);

    if (currentBalance === null && item.outQuantity > 0) {
      throw new ValidationError(
        `Cannot reduce quantity for item ${item.itemName} with no existing stock`
      );
    }

    if (currentBalance !== null) {
      const projectedBalance = currentBalance + item.inQuantity - item.outQuantity;

      if (projectedBalance < 0) {
        throw new ValidationError(
          `Adjustment would result in negative stock for ${item.itemName}. ` +
          `Current: ${currentBalance}, Change: ${item.inQuantity - item.outQuantity}, ` +
          `Projected: ${projectedBalance}`
        );
      }
    }
  }
}

// Helper function using shared transaction system
async function calculateBalance(
  locationId: string,
  productId: string
): Promise<number | null> {
  const result = await db.query(`
    SELECT SUM(in_qty) - SUM(out_qty) as current_balance
    FROM tb_inventory_transaction_closing_balance
    WHERE location_id = $1
      AND product_id = $2
  `, [locationId, productId]);

  return result.rows[0]?.current_balance || null;
}

// Database validation via application logic
// Note: Balance is calculated, not stored, so no table constraint needed
// Validation occurs before INSERT to tb_inventory_transaction_closing_balance
```

**Test Scenarios**:
- ✅ Valid: currentQty=100, outQty=50, projected=50
- ✅ Valid: currentQty=100, outQty=100, projected=0
- ✅ Valid: currentQty=0, inQty=50, projected=50
- ❌ Invalid: currentQty=50, outQty=100, projected=-50
- ❌ Invalid: currentQty=0, outQty=10 (no stock to reduce)

---

### VAL-INV-ADJ-106: GL Account Mapping Validation (Type-Specific)
**Rule**: All adjustments use standardized GL accounts. Same accounts for all reasons, with debit/credit direction determined by adjustment type.

**GL Accounts Used**:
- **1310**: Raw Materials Inventory (Asset)
- **5110**: Inventory Variance (Expense)

**Layer**: Server
**Error Message**: "Invalid GL account mapping for adjustment type."
**Implementation**:
```typescript
interface GLAccountMapping {
  type: AdjustmentType;
  debitAccount: string;
  creditAccount: string;
  description: string;
}

// Simplified GL mapping - same accounts for all reasons within each type
const GL_ACCOUNT_MAPPINGS: Record<'IN' | 'OUT', GLAccountMapping> = {
  // Stock IN: Increase inventory (debit), decrease variance expense (credit)
  IN: {
    type: 'IN',
    debitAccount: '1310',  // Raw Materials Inventory
    creditAccount: '5110', // Inventory Variance
    description: 'Stock IN increases inventory asset, reduces variance expense'
  },
  // Stock OUT: Increase variance expense (debit), decrease inventory (credit)
  OUT: {
    type: 'OUT',
    debitAccount: '5110',  // Inventory Variance
    creditAccount: '1310', // Raw Materials Inventory
    description: 'Stock OUT increases variance expense, reduces inventory asset'
  }
};

// Type-specific GL account validation (reason-independent)
function validateGLAccountMapping(
  adjustmentType: 'IN' | 'OUT'
): GLAccountMapping {
  const mapping = GL_ACCOUNT_MAPPINGS[adjustmentType];

  if (!mapping) {
    throw new ValidationError(
      `No GL account mapping found for adjustment type '${adjustmentType}'`
    );
  }

  return mapping;
}

// Generate journal entries based on type (not reason)
function generateJournalEntries(
  adjustmentType: 'IN' | 'OUT',
  totalCost: number
): JournalEntry[] {
  const mapping = GL_ACCOUNT_MAPPINGS[adjustmentType];

  return [
    {
      accountCode: mapping.debitAccount,
      accountName: mapping.debitAccount === '1310' ? 'Raw Materials Inventory' : 'Inventory Variance',
      debitAmount: totalCost,
      creditAmount: 0
    },
    {
      accountCode: mapping.creditAccount,
      accountName: mapping.creditAccount === '1310' ? 'Raw Materials Inventory' : 'Inventory Variance',
      debitAmount: 0,
      creditAmount: totalCost
    }
  ];
}

// Validate accounts exist and are active
async function validateGLAccounts(): Promise<void> {
  const requiredAccounts = ['1310', '5110'];
  const accounts = await getGLAccounts(requiredAccounts);

  for (const code of requiredAccounts) {
    const account = accounts.find(a => a.code === code);

    if (!account) {
      throw new ValidationError(
        `Required GL account ${code} not found`
      );
    }

    if (!account.isActive) {
      throw new ValidationError(
        `Required GL account ${code} is inactive`
      );
    }
  }
}
```

**GL Account Mapping Summary**:

| Adjustment Type | Debit Account | Credit Account | Effect |
|-----------------|---------------|----------------|--------|
| Stock IN | 1310 Raw Materials Inventory | 5110 Inventory Variance | ↑ Inventory Asset |
| Stock OUT | 5110 Inventory Variance | 1310 Raw Materials Inventory | ↓ Inventory Asset |

**Costing Rules Applied**:

| Type | Unit Cost Source | Journal Entry Total |
|------|------------------|---------------------|
| Stock IN | Manual entry (user-entered) | Qty × User-entered cost |
| Stock OUT | product.avgCost (system) | Qty × System average cost |

**Test Scenarios**:
- ✅ Valid (IN): Any IN reason → 1310 DR, 5110 CR
- ✅ Valid (OUT): Any OUT reason → 5110 DR, 1310 CR
- ✅ Valid (OUT): reason='damaged', total=$500 → 5110 DR $500, 1310 CR $500
- ✅ Valid (IN): reason='found_items', total=$300 → 1310 DR $300, 5110 CR $300
- ❌ Invalid: GL account 1310 not found
- ❌ Invalid: GL account 5110 inactive

---

## Cross-Field Validations

### VAL-INV-ADJ-201: Type and Quantity Consistency
**Rule**: Adjustment type must match item quantity direction (IN items for IN type, OUT items for OUT type).

**Layer**: Client + Server
**Error Message**: "Adjustment type does not match item quantities."
**Implementation**:
```typescript
function validateTypeQuantityConsistency(
  adjustmentType: AdjustmentType,
  items: AdjustmentItem[]
): void {
  if (items.length === 0) {
    throw new ValidationError("Adjustment must have at least one item");
  }

  for (const item of items) {
    if (adjustmentType === 'IN') {
      // IN adjustments must have IN quantities
      if (item.inQuantity <= 0) {
        throw new ValidationError(
          `IN adjustment must have positive IN quantity for item ${item.itemName}`
        );
      }

      if (item.outQuantity > 0) {
        throw new ValidationError(
          `IN adjustment cannot have OUT quantity for item ${item.itemName}`
        );
      }
    } else if (adjustmentType === 'OUT') {
      // OUT adjustments must have OUT quantities
      if (item.outQuantity <= 0) {
        throw new ValidationError(
          `OUT adjustment must have positive OUT quantity for item ${item.itemName}`
        );
      }

      if (item.inQuantity > 0) {
        throw new ValidationError(
          `OUT adjustment cannot have IN quantity for item ${item.itemName}`
        );
      }
    }
  }
}
```

**Test Scenarios**:
- ✅ Valid: type='IN', all items have inQty>0, outQty=0
- ✅ Valid: type='OUT', all items have outQty>0, inQty=0
- ❌ Invalid: type='IN', item has outQty>0
- ❌ Invalid: type='OUT', item has inQty>0
- ❌ Invalid: type='IN', all items have inQty=0

---

### VAL-INV-ADJ-202: Total Quantity Aggregation
**Rule**: Total IN/OUT quantities must equal sum of individual item quantities.

**Layer**: Client + Server
**Error Message**: "Total quantities do not match sum of item quantities."
**Implementation**:
```typescript
function validateQuantityAggregation(
  adjustment: Adjustment
): void {
  // Calculate totals from items
  const calculatedTotalIn = adjustment.items.reduce(
    (sum, item) => sum + item.inQuantity, 0
  );

  const calculatedTotalOut = adjustment.items.reduce(
    (sum, item) => sum + item.outQuantity, 0
  );

  // Compare with adjustment header totals (allow 0.001 rounding)
  const inDifference = Math.abs(adjustment.totalInQty - calculatedTotalIn);
  const outDifference = Math.abs(adjustment.totalOutQty - calculatedTotalOut);

  if (inDifference > 0.001) {
    throw new ValidationError(
      `Total IN quantity (${adjustment.totalInQty}) does not match sum of items (${calculatedTotalIn}). Difference: ${inDifference}`
    );
  }

  if (outDifference > 0.001) {
    throw new ValidationError(
      `Total OUT quantity (${adjustment.totalOutQty}) does not match sum of items (${calculatedTotalOut}). Difference: ${outDifference}`
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: totalIn=150, items: [50, 50, 50]
- ✅ Valid: totalOut=75.5, items: [25.5, 50]
- ❌ Invalid: totalIn=150, items sum to 145
- ❌ Invalid: totalOut=100, items sum to 105

---

### VAL-INV-ADJ-203: Total Cost Aggregation
**Rule**: Total cost must equal sum of (item quantity × unit cost).

**Layer**: Client + Server
**Error Message**: "Total cost does not match sum of item costs."
**Implementation**:
```typescript
function validateCostAggregation(
  adjustment: Adjustment
): void {
  // Calculate total from items
  const calculatedTotal = adjustment.items.reduce((sum, item) => {
    const itemQty = item.inQuantity > 0 ? item.inQuantity : item.outQuantity;
    return sum + (itemQty * item.unitCost);
  }, 0);

  // Compare with adjustment total (allow 0.01 rounding)
  const difference = Math.abs(adjustment.totalCost - calculatedTotal);

  if (difference > 0.01) {
    throw new ValidationError(
      `Total cost (${adjustment.totalCost.toFixed(2)}) does not match sum of item costs (${calculatedTotal.toFixed(2)}). Difference: ${difference.toFixed(2)}`
    );
  }
}

// Detailed item-level validation
function validateItemCostCalculation(item: AdjustmentItem): void {
  const quantity = item.inQuantity > 0 ? item.inQuantity : item.outQuantity;
  const calculatedCost = quantity * item.unitCost;

  const difference = Math.abs(item.totalCost - calculatedCost);

  if (difference > 0.01) {
    throw new ValidationError(
      `Item ${item.itemName} cost (${item.totalCost.toFixed(2)}) does not match quantity × unit cost (${calculatedCost.toFixed(2)})`
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: total=1250.00, items: [(50×10.00), (50×15.00)]
- ✅ Valid: total=87.50, items: [(25×2.50), (10×1.25)]
- ❌ Invalid: total=1000.00, calculated=1250.00
- ❌ Invalid: item.totalCost=100.00 but qty=10, cost=12.00 (should be 120.00)

---

### VAL-INV-ADJ-204: Location-Department Relationship
**Rule**: Selected department must be associated with selected location.

**Layer**: Server
**Error Message**: "Selected department is not associated with the selected location."
**Implementation**:
```typescript
async function validateLocationDepartmentRelationship(
  locationId: string,
  departmentId: string
): Promise<void> {
  // Get location with its departments
  const location = await getLocationWithDepartments(locationId);

  if (!location) {
    throw new ValidationError("Location not found");
  }

  // Check if department is associated with location
  const isDepartmentLinked = location.departments.some(
    dept => dept.id === departmentId
  );

  if (!isDepartmentLinked) {
    throw new ValidationError(
      `Department is not associated with location ${location.name}. ` +
      `Available departments: ${location.departments.map(d => d.name).join(', ')}`
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: location='Kitchen', department='Food & Beverage'
- ✅ Valid: location='Main Store', department='Housekeeping'
- ❌ Invalid: location='Bar', department='Engineering' (not linked)

---

### VAL-INV-ADJ-205: Posted Adjustment Immutability
**Rule**: Posted adjustments cannot be modified. Only voiding is allowed.

**Layer**: Client + Server
**Error Message**: "Cannot modify posted adjustment. Use void action to reverse."
**Implementation**:
```typescript
function validateAdjustmentMutability(
  adjustment: Adjustment,
  operation: 'update' | 'delete'
): void {
  if (adjustment.status === 'POSTED') {
    throw new ValidationError(
      `Cannot ${operation} posted adjustment ${adjustment.adjustmentId}. ` +
      `Use void action to reverse this adjustment.`
    );
  }

  if (adjustment.status === 'VOIDED') {
    throw new ValidationError(
      `Cannot ${operation} voided adjustment ${adjustment.adjustmentId}. ` +
      `Voided adjustments are immutable for audit purposes.`
    );
  }

  // Only DRAFT adjustments can be modified or deleted
  if (adjustment.status !== 'DRAFT') {
    throw new ValidationError(
      `Only draft adjustments can be modified or deleted. Current status: ${adjustment.status}`
    );
  }
}

// UI-level prevention
function canModifyAdjustment(adjustment: Adjustment): boolean {
  return adjustment.status === 'DRAFT';
}

function canDeleteAdjustment(adjustment: Adjustment): boolean {
  return adjustment.status === 'DRAFT';
}

function canVoidAdjustment(adjustment: Adjustment): boolean {
  return adjustment.status === 'POSTED';
}
```

**Test Scenarios**:
- ✅ Valid: Update DRAFT adjustment
- ✅ Valid: Delete DRAFT adjustment
- ✅ Valid: Void POSTED adjustment
- ❌ Invalid: Update POSTED adjustment
- ❌ Invalid: Delete POSTED adjustment
- ❌ Invalid: Update VOIDED adjustment
- ❌ Invalid: Void DRAFT adjustment

---

### VAL-INV-ADJ-206: Duplicate Item Prevention
**Rule**: The same item (and lot, if applicable) cannot appear multiple times in the same adjustment.

**Layer**: Client + Server
**Error Message**: "Duplicate item detected. Combine quantities for the same item."
**Implementation**:
```typescript
function validateDuplicateItems(items: AdjustmentItem[]): void {
  // Create unique key: itemId + lotId (or itemId if no lot)
  const itemKeys = items.map(item =>
    item.lotId ? `${item.itemId}:${item.lotId}` : item.itemId
  );

  // Check for duplicates
  const uniqueKeys = new Set(itemKeys);

  if (uniqueKeys.size < itemKeys.length) {
    // Find duplicate items
    const duplicates = itemKeys.filter(
      (key, index) => itemKeys.indexOf(key) !== index
    );

    const duplicateItems = items.filter(item => {
      const key = item.lotId ? `${item.itemId}:${item.lotId}` : item.itemId;
      return duplicates.includes(key);
    });

    throw new ValidationError(
      `Duplicate items detected: ${duplicateItems.map(i => i.itemName).join(', ')}. ` +
      `Please combine quantities for the same item${duplicateItems[0].lotId ? ' and lot' : ''}.`
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: Different items
- ✅ Valid: Same item, different lots
- ❌ Invalid: Same item appears twice
- ❌ Invalid: Same item and lot appears twice

---

## Security Validations

### VAL-INV-ADJ-301: Location-Based Access Control
**Rule**: Users can only create/view adjustments for locations in their availableLocations, unless System Administrator.

**Layer**: Server
**Error Message**: "Access denied. You do not have permission to access this location."
**Implementation**:
```typescript
async function validateLocationAccess(
  userId: string,
  locationId: string,
  operation: 'view' | 'create' | 'post' | 'void'
): Promise<void> {
  const user = await getUserContext(userId);

  // System Administrator bypass
  if (user.role === 'System Administrator') {
    return;
  }

  // Check if location is in user's accessible locations
  const hasAccess = user.availableLocations.some(
    loc => loc.id === locationId
  );

  if (!hasAccess) {
    throw new SecurityError(
      `Access denied. You do not have permission to ${operation} adjustments at this location.`
    );
  }
}

// Row-Level Security (RLS) policy for database
/*
CREATE POLICY adjustment_location_access ON tb_inventory_adjustment
  FOR SELECT
  USING (
    -- System Administrators can see all
    auth.jwt() ->> 'role' = 'System Administrator'
    OR
    -- Others can only see adjustments at their assigned locations
    location_id IN (
      SELECT unnest(
        (auth.jwt() ->> 'available_locations')::uuid[]
      )
    )
  );

CREATE POLICY adjustment_location_insert ON tb_inventory_adjustment
  FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' = 'System Administrator'
    OR
    location_id IN (
      SELECT unnest(
        (auth.jwt() ->> 'available_locations')::uuid[]
      )
    )
  );
*/
```

**Test Scenarios**:
- ✅ Valid (Admin): Access any location
- ✅ Valid: Access location in user.availableLocations
- ❌ Invalid: Access location not in user.availableLocations
- ❌ Invalid: Non-admin creates adjustment at unauthorized location

---

### VAL-INV-ADJ-302: Permission-Based Action Control
**Rule**: Users must have specific permissions to perform adjustment actions.

**Layer**: Client + Server
**Error Message**: "You do not have permission to perform this action."
**Implementation**:
```typescript
const ACTION_PERMISSIONS: Record<string, string[]> = {
  'view_adjustments': ['view list and detail pages'],
  'create_adjustments': ['create new draft adjustments'],
  'post_adjustments': ['post draft adjustments to GL'],
  'void_adjustments': ['void posted adjustments'],
  'delete_adjustments': ['delete draft adjustments']
};

function validateActionPermission(
  user: UserContext,
  action: keyof typeof ACTION_PERMISSIONS
): void {
  if (!user.permissions.includes(action)) {
    throw new SecurityError(
      `You do not have permission to ${ACTION_PERMISSIONS[action][0]}`
    );
  }
}

// Specific validations
async function validateCreatePermission(userId: string): Promise<void> {
  const user = await getUserContext(userId);
  validateActionPermission(user, 'create_adjustments');
}

async function validatePostPermission(userId: string): Promise<void> {
  const user = await getUserContext(userId);
  validateActionPermission(user, 'post_adjustments');

  // Additional check: Only managers and above can post
  const managerRoles = [
    'Warehouse Manager',
    'Store Manager',
    'Financial Controller',
    'System Administrator'
  ];

  if (!managerRoles.includes(user.role)) {
    throw new SecurityError(
      "Only managers and financial controllers can post adjustments"
    );
  }
}

async function validateVoidPermission(
  userId: string,
  adjustment: Adjustment
): Promise<void> {
  const user = await getUserContext(userId);
  validateActionPermission(user, 'void_adjustments');

  // Additional check: Only financial controllers and admins can void
  const voidRoles = [
    'Financial Controller',
    'System Administrator'
  ];

  if (!voidRoles.includes(user.role)) {
    throw new SecurityError(
      "Only financial controllers and administrators can void adjustments"
    );
  }

  // Cannot void own posted adjustments (segregation of duties)
  if (adjustment.postedBy === userId) {
    throw new SecurityError(
      "You cannot void adjustments that you posted (segregation of duties)"
    );
  }
}
```

**Permission Matrix**:

| Action | Required Permission | Role Requirements | Notes |
|--------|-------------------|------------------|-------|
| View List | view_adjustments | All roles | Filter by accessible locations |
| View Detail | view_adjustments | All roles | Must have location access |
| Create Draft | create_adjustments | Storekeeper+ | Own locations only |
| Edit Draft | create_adjustments | Storekeeper+ | Own drafts only |
| Delete Draft | delete_adjustments | Storekeeper+ | Own drafts only |
| Post | post_adjustments | Manager+ | Cannot post own drafts |
| Void | void_adjustments | Financial Controller+ | Cannot void own posts |

**Test Scenarios**:
- ✅ Valid: Storekeeper creates draft
- ✅ Valid: Manager posts adjustment
- ✅ Valid: Financial Controller voids adjustment
- ❌ Invalid: Storekeeper attempts to post
- ❌ Invalid: Manager attempts to void
- ❌ Invalid: User voids own posted adjustment

---

### VAL-INV-ADJ-303: Segregation of Duties
**Rule**: Users cannot post adjustments they created, and cannot void adjustments they posted.

**Layer**: Server
**Error Message**: "Segregation of duties violation."
**Implementation**:
```typescript
async function validateSegregationOfDuties(
  userId: string,
  adjustment: Adjustment,
  action: 'post' | 'void'
): Promise<void> {
  if (action === 'post') {
    // Cannot post adjustments created by self
    if (adjustment.createdBy === userId) {
      throw new SecurityError(
        "You cannot post adjustments that you created (segregation of duties). " +
        "Please ask another authorized user to post this adjustment."
      );
    }
  }

  if (action === 'void') {
    // Cannot void adjustments posted by self
    if (adjustment.postedBy === userId) {
      throw new SecurityError(
        "You cannot void adjustments that you posted (segregation of duties). " +
        "Please ask another authorized user to void this adjustment."
      );
    }
  }
}

// System Administrator bypass option (with audit logging)
async function validateSegregationWithOverride(
  userId: string,
  adjustment: Adjustment,
  action: 'post' | 'void',
  overrideReason?: string
): Promise<void> {
  const user = await getUserContext(userId);

  // System Administrators can override with reason
  if (user.role === 'System Administrator' && overrideReason) {
    // Log override action
    await logAuditEvent({
      userId,
      action: `SOD_OVERRIDE_${action.toUpperCase()}`,
      adjustmentId: adjustment.id,
      reason: overrideReason,
      timestamp: new Date()
    });
    return;
  }

  // Regular validation for non-admins or admins without reason
  await validateSegregationOfDuties(userId, adjustment, action);
}
```

**Test Scenarios**:
- ✅ Valid: User A creates, User B posts
- ✅ Valid: User A posts, User B voids
- ✅ Valid (Admin): Admin posts own with override reason
- ❌ Invalid: User A creates and posts
- ❌ Invalid: User A posts and voids
- ❌ Invalid: Admin posts own without override reason

---

### VAL-INV-ADJ-304: Audit Trail Completeness
**Rule**: All adjustment actions must be logged with user ID and timestamp.

**Layer**: Server
**Error Message**: "Audit trail logging failed."
**Implementation**:
```typescript
interface AuditLogEntry {
  adjustmentId: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'POST' | 'VOID';
  userId: string;
  timestamp: Date;
  changes?: Record<string, { old: any; new: any }>;
  ipAddress?: string;
  userAgent?: string;
}

async function logAdjustmentAction(
  adjustment: Adjustment,
  action: AuditLogEntry['action'],
  userId: string,
  changes?: AuditLogEntry['changes']
): Promise<void> {
  const logEntry: AuditLogEntry = {
    adjustmentId: adjustment.id,
    action,
    userId,
    timestamp: new Date(),
    changes
  };

  try {
    await database.query(`
      INSERT INTO tb_audit_log (
        entity_type, entity_id, action, user_id,
        timestamp, changes, ip_address, user_agent
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `, [
      'INVENTORY_ADJUSTMENT',
      adjustment.id,
      action,
      userId,
      logEntry.timestamp,
      JSON.stringify(changes),
      logEntry.ipAddress,
      logEntry.userAgent
    ]);
  } catch (error) {
    // Audit logging failure is critical
    throw new Error(
      `Audit trail logging failed for adjustment ${adjustment.adjustmentId}. ` +
      `Action aborted. Error: ${error.message}`
    );
  }
}

// Validate audit trail exists and is complete
async function validateAuditTrail(
  adjustmentId: string
): Promise<void> {
  const auditLogs = await database.query(`
    SELECT action, user_id, timestamp
    FROM tb_audit_log
    WHERE entity_type = 'INVENTORY_ADJUSTMENT'
      AND entity_id = $1
    ORDER BY timestamp ASC
  `, [adjustmentId]);

  if (auditLogs.rows.length === 0) {
    throw new ValidationError(
      "No audit trail found for adjustment"
    );
  }

  // Validate required actions are logged
  const actions = auditLogs.rows.map(log => log.action);

  if (!actions.includes('CREATE')) {
    throw new ValidationError(
      "Audit trail missing CREATE action"
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: All actions logged with user and timestamp
- ✅ Valid: Audit trail includes CREATE, POST
- ❌ Invalid: Audit log write fails (action aborted)
- ❌ Invalid: Missing CREATE in audit trail

---

## Data Integrity Validations

### VAL-INV-ADJ-401: Stock Balance Consistency
**Rule**: Stock balance updates must maintain consistency with adjustment quantities.

**Layer**: Server + Database
**Error Message**: "Stock balance update inconsistency detected."
**Implementation**:
```typescript
async function validateStockBalanceUpdate(
  locationId: string,
  items: AdjustmentItem[]
): Promise<void> {
  // Get current stock balances
  const currentBalances = await getStockBalances(locationId);

  // Calculate expected new balances
  const expectedBalances = items.map(item => {
    const current = currentBalances.find(
      s => s.itemId === item.itemId && s.lotId === item.lotId
    );

    const currentQty = current?.quantityOnHand || 0;
    const newQty = currentQty + item.inQuantity - item.outQuantity;

    return {
      itemId: item.itemId,
      lotId: item.lotId,
      currentQty,
      changeQty: item.inQuantity - item.outQuantity,
      expectedQty: newQty
    };
  });

  // Validate no negative balances
  for (const balance of expectedBalances) {
    if (balance.expectedQty < 0) {
      throw new ValidationError(
        `Stock balance would be negative for item ${balance.itemId}. ` +
        `Current: ${balance.currentQty}, Change: ${balance.changeQty}, Expected: ${balance.expectedQty}`
      );
    }
  }

  return;
}

// Post-update validation
async function verifyStockBalanceUpdate(
  locationId: string,
  items: AdjustmentItem[],
  transactionId: string
): Promise<void> {
  // Get updated stock balances
  const updatedBalances = await getStockBalances(locationId);

  // Verify each item was updated correctly
  for (const item of items) {
    const balance = updatedBalances.find(
      s => s.itemId === item.itemId && s.lotId === item.lotId
    );

    if (!balance) {
      throw new ValidationError(
        `Stock balance not found after update for item ${item.itemName}`
      );
    }

    // Verify transaction was recorded
    const transactions = await getInventoryTransactions(
      locationId,
      item.itemId,
      transactionId
    );

    if (transactions.length === 0) {
      throw new ValidationError(
        `Inventory transaction not recorded for item ${item.itemName}`
      );
    }
  }
}

// Database trigger to maintain consistency
/*
CREATE OR REPLACE FUNCTION fn_validate_stock_balance_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Ensure quantity_on_hand >= 0
  IF NEW.quantity_on_hand < 0 THEN
    RAISE EXCEPTION 'Stock balance cannot be negative: item_id=%, quantity=%',
      NEW.item_id, NEW.quantity_on_hand;
  END IF;

  -- Ensure quantity_available = quantity_on_hand - quantity_reserved
  IF NEW.quantity_available != (NEW.quantity_on_hand - NEW.quantity_reserved) THEN
    RAISE EXCEPTION 'Available quantity calculation error: item_id=%', NEW.item_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_validate_stock_balance
  BEFORE INSERT OR UPDATE ON tb_stock_balance
  FOR EACH ROW
  EXECUTE FUNCTION fn_validate_stock_balance_update();
*/
```

**Test Scenarios**:
- ✅ Valid: Balance updates match adjustment quantities
- ✅ Valid: Transactions recorded for all items
- ❌ Invalid: Update would create negative balance
- ❌ Invalid: Missing transaction record
- ❌ Invalid: Available ≠ OnHand - Reserved

---

### VAL-INV-ADJ-402: Journal Entry Integrity
**Rule**: Journal entries must be created for all posted adjustments and remain immutable.

**Layer**: Server + Database
**Error Message**: "Journal entry integrity violation."
**Implementation**:
```typescript
async function validateJournalEntryCreation(
  adjustmentId: string
): Promise<void> {
  // Check if journal exists
  const journal = await getJournalByAdjustmentId(adjustmentId);

  if (!journal) {
    throw new ValidationError(
      "Journal entry not found for posted adjustment"
    );
  }

  // Validate journal status matches adjustment
  const adjustment = await getAdjustment(adjustmentId);

  if (adjustment.status === 'POSTED' && journal.status !== 'POSTED') {
    throw new ValidationError(
      "Journal status does not match adjustment status"
    );
  }

  // Validate journal is balanced
  if (Math.abs(journal.totalDebit - journal.totalCredit) > 0.01) {
    throw new ValidationError(
      `Journal entry is not balanced. Debits: ${journal.totalDebit}, Credits: ${journal.totalCredit}`
    );
  }

  // Validate journal total matches adjustment total
  if (Math.abs(journal.totalDebit - adjustment.totalCost) > 0.01) {
    throw new ValidationError(
      `Journal total (${journal.totalDebit}) does not match adjustment total (${adjustment.totalCost})`
    );
  }
}

// Validate journal immutability
async function validateJournalImmutability(
  journalId: string,
  operation: 'update' | 'delete'
): Promise<void> {
  const journal = await getJournal(journalId);

  if (journal.status === 'POSTED') {
    throw new ValidationError(
      `Cannot ${operation} posted journal entry. Status: ${journal.status}`
    );
  }
}

// Database constraints
/*
-- Prevent updates to posted journals
CREATE OR REPLACE FUNCTION fn_prevent_journal_modification()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.journal_status = 'POSTED' THEN
    RAISE EXCEPTION 'Cannot modify posted journal entry: journal_id=%', OLD.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_prevent_journal_modification
  BEFORE UPDATE OR DELETE ON tb_adjustment_journal_header
  FOR EACH ROW
  EXECUTE FUNCTION fn_prevent_journal_modification();

-- Ensure journal balance
ALTER TABLE tb_adjustment_journal_header
  ADD CONSTRAINT chk_journal_balanced
  CHECK (ABS(total_debit - total_credit) < 0.01);
*/
```

**Test Scenarios**:
- ✅ Valid: Journal created for posted adjustment
- ✅ Valid: Journal balanced (debits = credits)
- ✅ Valid: Journal total matches adjustment
- ❌ Invalid: No journal for posted adjustment
- ❌ Invalid: Journal unbalanced
- ❌ Invalid: Attempt to modify posted journal

---

### VAL-INV-ADJ-403: Lot Traceability Integrity
**Rule**: All lot-tracked items must maintain complete traceability chain.

**Layer**: Server
**Error Message**: "Lot traceability integrity violation."
**Implementation**:
```typescript
async function validateLotTraceability(
  items: AdjustmentItem[]
): Promise<void> {
  for (const item of items) {
    // Check if item requires lot tracking
    const itemDetails = await getItem(item.itemId);

    if (itemDetails.trackingMethod === 'LOT' || itemDetails.trackingMethod === 'SERIAL') {
      // Lot ID must be provided
      if (!item.lotId) {
        throw new ValidationError(
          `Item ${item.itemName} requires lot tracking but no lot ID provided`
        );
      }

      // Verify lot exists and is valid
      const lot = await getLot(item.lotId);

      if (!lot) {
        throw new ValidationError(
          `Lot ${item.lotId} not found for item ${item.itemName}`
        );
      }

      // Verify lot belongs to the item
      if (lot.itemId !== item.itemId) {
        throw new ValidationError(
          `Lot ${lot.lotNumber} does not belong to item ${item.itemName}`
        );
      }

      // For OUT adjustments, verify lot has sufficient quantity
      if (item.outQuantity > 0) {
        const availableQty = lot.quantityOnHand - lot.quantityReserved;

        if (item.outQuantity > availableQty) {
          throw new ValidationError(
            `Insufficient quantity in lot ${lot.lotNumber}. ` +
            `Requested: ${item.outQuantity}, Available: ${availableQty}`
          );
        }
      }
    } else {
      // Non-lot-tracked items should not have lot ID
      if (item.lotId) {
        console.warn(
          `Item ${item.itemName} does not require lot tracking but lot ID was provided. ` +
          `Lot ID will be ignored.`
        );
        item.lotId = undefined;
      }
    }
  }
}

// Validate lot transaction recording
async function validateLotTransactionRecording(
  adjustmentId: string,
  items: AdjustmentItem[]
): Promise<void> {
  for (const item of items) {
    if (item.lotId) {
      // Verify lot transaction was recorded
      const transaction = await getLotTransaction(
        item.lotId,
        adjustmentId
      );

      if (!transaction) {
        throw new ValidationError(
          `Lot transaction not recorded for lot ${item.lotNumber}, item ${item.itemName}`
        );
      }

      // Verify transaction quantity matches
      const transactionQty = transaction.type === 'IN'
        ? transaction.quantity
        : -transaction.quantity;
      const itemQty = item.inQuantity - item.outQuantity;

      if (Math.abs(transactionQty - itemQty) > 0.001) {
        throw new ValidationError(
          `Lot transaction quantity mismatch. Expected: ${itemQty}, Recorded: ${transactionQty}`
        );
      }
    }
  }
}
```

**Test Scenarios**:
- ✅ Valid: Lot-tracked item has lot ID
- ✅ Valid: Lot has sufficient quantity for OUT
- ✅ Valid: Lot transaction recorded
- ❌ Invalid: Lot-tracked item missing lot ID
- ❌ Invalid: Lot ID does not belong to item
- ❌ Invalid: Insufficient lot quantity
- ❌ Invalid: Missing lot transaction

---

### VAL-INV-ADJ-404: Voided Adjustment Reversal Integrity
**Rule**: Voided adjustments must generate reversing entries that exactly offset original entries.

**Layer**: Server
**Error Message**: "Voided adjustment reversal integrity violation."
**Implementation**:
```typescript
async function validateVoidReversal(
  originalAdjustmentId: string,
  voidAdjustmentId: string
): Promise<void> {
  // Get original and void adjustments
  const original = await getAdjustment(originalAdjustmentId);
  const voided = await getAdjustment(voidAdjustmentId);

  // Verify void adjustment exists
  if (!voided) {
    throw new ValidationError(
      "Void adjustment not found"
    );
  }

  // Verify quantities are exact opposite
  if (Math.abs(original.totalInQty - voided.totalOutQty) > 0.001) {
    throw new ValidationError(
      "Void adjustment IN quantity does not match original OUT quantity"
    );
  }

  if (Math.abs(original.totalOutQty - voided.totalInQty) > 0.001) {
    throw new ValidationError(
      "Void adjustment OUT quantity does not match original IN quantity"
    );
  }

  // Verify total costs match
  if (Math.abs(original.totalCost - voided.totalCost) > 0.01) {
    throw new ValidationError(
      "Void adjustment cost does not match original cost"
    );
  }

  // Verify items match
  if (original.items.length !== voided.items.length) {
    throw new ValidationError(
      "Void adjustment item count does not match original"
    );
  }

  for (const origItem of original.items) {
    const voidItem = voided.items.find(
      i => i.itemId === origItem.itemId && i.lotId === origItem.lotId
    );

    if (!voidItem) {
      throw new ValidationError(
        `Void adjustment missing item: ${origItem.itemName}`
      );
    }

    // Quantities should be swapped
    if (Math.abs(origItem.inQuantity - voidItem.outQuantity) > 0.001 ||
        Math.abs(origItem.outQuantity - voidItem.inQuantity) > 0.001) {
      throw new ValidationError(
        `Void adjustment quantities do not match for item ${origItem.itemName}`
      );
    }
  }

  // Validate reversing journal entries
  await validateReversingJournal(originalAdjustmentId, voidAdjustmentId);
}

async function validateReversingJournal(
  originalAdjustmentId: string,
  voidAdjustmentId: string
): Promise<void> {
  const originalJournal = await getJournalByAdjustmentId(originalAdjustmentId);
  const voidJournal = await getJournalByAdjustmentId(voidAdjustmentId);

  // Verify both journals exist
  if (!originalJournal || !voidJournal) {
    throw new ValidationError(
      "Journal entries not found for adjustment or void"
    );
  }

  // Verify journal entries are reversed
  for (const origEntry of originalJournal.entries) {
    const voidEntry = voidJournal.entries.find(
      e => e.accountCode === origEntry.accountCode
    );

    if (!voidEntry) {
      throw new ValidationError(
        `Reversing journal missing account: ${origEntry.accountCode}`
      );
    }

    // Debits and credits should be swapped
    if (Math.abs(origEntry.debitAmount - voidEntry.creditAmount) > 0.01 ||
        Math.abs(origEntry.creditAmount - voidEntry.debitAmount) > 0.01) {
      throw new ValidationError(
        `Reversing journal entry amounts do not match for account ${origEntry.accountCode}`
      );
    }
  }
}
```

**Test Scenarios**:
- ✅ Valid: Void quantities exactly reverse original
- ✅ Valid: Void journal entries exactly reverse original
- ✅ Valid: All items reversed with correct quantities
- ❌ Invalid: Void quantities do not match original
- ❌ Invalid: Void missing items from original
- ❌ Invalid: Reversing journal unbalanced

---

## Performance Validations

### VAL-INV-ADJ-501: Item List Size Limit
**Rule**: Adjustment item list must not exceed 500 items to prevent performance issues.

**Layer**: Client + Server
**Error Message**: "Adjustment item list exceeds maximum size."
**Implementation**:
```typescript
const MAX_ITEMS_PER_ADJUSTMENT = 500;

function validateItemListSize(items: AdjustmentItem[]): void {
  if (items.length > MAX_ITEMS_PER_ADJUSTMENT) {
    throw new ValidationError(
      `Adjustment cannot have more than ${MAX_ITEMS_PER_ADJUSTMENT} items. ` +
      `Current count: ${items.length}. Consider splitting into multiple adjustments.`
    );
  }

  // Warning for large adjustments
  if (items.length > 100) {
    console.warn(
      `Large adjustment detected with ${items.length} items. ` +
      `Consider reviewing performance and splitting if necessary.`
    );
  }
}
```

**Test Scenarios**:
- ✅ Valid: 50 items
- ✅ Valid: 100 items (with warning)
- ✅ Valid: 500 items (max allowed)
- ❌ Invalid: 501 items (exceeds limit)

---

### VAL-INV-ADJ-502: Auto-Save Interval
**Rule**: Draft auto-save must not occur more frequently than every 30 seconds to prevent server overload.

**Layer**: Client
**Error Message**: "Auto-save interval too frequent."
**Implementation**:
```typescript
const MIN_AUTOSAVE_INTERVAL = 30 * 1000; // 30 seconds
const DEFAULT_AUTOSAVE_INTERVAL = 60 * 1000; // 1 minute

let lastAutoSaveTime = 0;

function validateAutoSaveInterval(): boolean {
  const now = Date.now();
  const timeSinceLastSave = now - lastAutoSaveTime;

  if (timeSinceLastSave < MIN_AUTOSAVE_INTERVAL) {
    console.warn(
      `Auto-save attempted too soon. ` +
      `Last save: ${timeSinceLastSave}ms ago, Minimum: ${MIN_AUTOSAVE_INTERVAL}ms`
    );
    return false;
  }

  lastAutoSaveTime = now;
  return true;
}

// Debounced auto-save implementation
const debouncedAutoSave = debounce(async (adjustment: Adjustment) => {
  if (validateAutoSaveInterval()) {
    await autoSaveAdjustment(adjustment);
  }
}, DEFAULT_AUTOSAVE_INTERVAL);
```

**Test Scenarios**:
- ✅ Valid: Auto-save every 60 seconds (default)
- ✅ Valid: Auto-save every 30 seconds (minimum)
- ❌ Invalid: Attempt auto-save every 15 seconds

---

### VAL-INV-ADJ-503: Concurrent Edit Prevention
**Rule**: Only one user can edit a draft adjustment at a time.

**Layer**: Server
**Error Message**: "Adjustment is currently being edited by another user."
**Implementation**:
```typescript
interface EditLock {
  adjustmentId: string;
  userId: string;
  lockedAt: Date;
  expiresAt: Date;
}

const EDIT_LOCK_DURATION = 5 * 60 * 1000; // 5 minutes

async function acquireEditLock(
  adjustmentId: string,
  userId: string
): Promise<boolean> {
  // Check if lock exists
  const existingLock = await getEditLock(adjustmentId);

  if (existingLock) {
    // Check if lock has expired
    if (new Date() > existingLock.expiresAt) {
      // Lock expired, release it
      await releaseEditLock(adjustmentId);
    } else if (existingLock.userId !== userId) {
      // Someone else has the lock
      const user = await getUser(existingLock.userId);
      throw new ValidationError(
        `Adjustment is currently being edited by ${user.name}. ` +
        `Lock expires in ${Math.ceil((existingLock.expiresAt.getTime() - Date.now()) / 60000)} minutes.`
      );
    } else {
      // Same user, extend lock
      await extendEditLock(adjustmentId);
      return true;
    }
  }

  // Create new lock
  await createEditLock({
    adjustmentId,
    userId,
    lockedAt: new Date(),
    expiresAt: new Date(Date.now() + EDIT_LOCK_DURATION)
  });

  return true;
}

async function releaseEditLock(adjustmentId: string): Promise<void> {
  await database.query(`
    DELETE FROM tb_edit_locks
    WHERE entity_type = 'INVENTORY_ADJUSTMENT'
      AND entity_id = $1
  `, [adjustmentId]);
}

// Heartbeat to extend lock
async function extendEditLock(adjustmentId: string): Promise<void> {
  await database.query(`
    UPDATE tb_edit_locks
    SET expires_at = $1
    WHERE entity_type = 'INVENTORY_ADJUSTMENT'
      AND entity_id = $2
  `, [
    new Date(Date.now() + EDIT_LOCK_DURATION),
    adjustmentId
  ]);
}
```

**Test Scenarios**:
- ✅ Valid: User A acquires lock for draft
- ✅ Valid: User A extends lock via heartbeat
- ✅ Valid: Lock expires, User B acquires lock
- ❌ Invalid: User B attempts edit while User A has lock
- ❌ Invalid: Concurrent edit attempts

---

## Validation Error Handling

### Error Response Format
```typescript
interface ValidationErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    field?: string;
    value?: any;
    validationRule: string;
    severity: 'error' | 'warning' | 'info';
  };
}

// Example error responses
const examples = {
  fieldError: {
    success: false,
    error: {
      code: "VAL-INV-ADJ-006",
      message: "IN adjustment must have positive IN quantity",
      field: "items[0].inQuantity",
      value: 0,
      validationRule: "Item Quantity Validity",
      severity: 'error'
    }
  },

  businessRuleError: {
    success: false,
    error: {
      code: "VAL-INV-ADJ-101",
      message: "Cannot transition from POSTED to DRAFT",
      field: "status",
      value: "DRAFT",
      validationRule: "Status Transition Workflow",
      severity: 'error'
    }
  },

  securityError: {
    success: false,
    error: {
      code: "VAL-INV-ADJ-302",
      message: "Only managers and financial controllers can post adjustments",
      field: null,
      value: null,
      validationRule: "Permission-Based Action Control",
      severity: 'error'
    }
  },

  warningExample: {
    success: false,
    error: {
      code: "VAL-INV-ADJ-103",
      message: "Adjustment will bring Flour below reorder point",
      field: "items[0].outQuantity",
      value: 80,
      validationRule: "Stock Availability Validation",
      severity: 'warning'
    }
  }
};
```

### Client-Side Error Display
```typescript
function handleValidationError(error: ValidationErrorResponse): void {
  const { code, message, field, severity } = error.error;

  // Show toast notification
  const toastConfig = {
    duration: severity === 'error' ? 7000 : 5000,
    position: 'top-right' as const
  };

  switch (severity) {
    case 'error':
      toast.error(message, toastConfig);
      break;
    case 'warning':
      toast.warning(message, toastConfig);
      break;
    case 'info':
      toast.info(message, toastConfig);
      break;
  }

  // Highlight invalid field if present
  if (field) {
    const element = document.querySelector(`[name="${field}"]`);

    if (element) {
      element.classList.add(
        severity === 'error' ? 'border-red-500' : 'border-yellow-500'
      );

      // Scroll to field
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Focus if it's an input
      if (element instanceof HTMLInputElement ||
          element instanceof HTMLTextAreaElement) {
        element.focus();
      }
    }
  }

  // Log for debugging
  console.error('[Validation Error]', {
    code,
    rule: error.error.validationRule,
    field,
    value: error.error.value,
    severity
  });
}

// Clear field error styling
function clearFieldError(field: string): void {
  const element = document.querySelector(`[name="${field}"]`);
  element?.classList.remove('border-red-500', 'border-yellow-500');
}
```

### Server-Side Error Aggregation
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrorResponse['error'][];
  warnings: ValidationErrorResponse['error'][];
}

class ValidationAggregator {
  private errors: ValidationErrorResponse['error'][] = [];
  private warnings: ValidationErrorResponse['error'][] = [];

  addError(
    code: string,
    message: string,
    validationRule: string,
    field?: string,
    value?: any
  ): void {
    this.errors.push({
      code,
      message,
      field,
      value,
      validationRule,
      severity: 'error'
    });
  }

  addWarning(
    code: string,
    message: string,
    validationRule: string,
    field?: string,
    value?: any
  ): void {
    this.warnings.push({
      code,
      message,
      field,
      value,
      validationRule,
      severity: 'warning'
    });
  }

  getResult(): ValidationResult {
    return {
      isValid: this.errors.length === 0,
      errors: this.errors,
      warnings: this.warnings
    };
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  hasWarnings(): boolean {
    return this.warnings.length > 0;
  }
}

// Usage example
async function validateAdjustmentForPosting(
  adjustment: Adjustment,
  userId: string
): Promise<ValidationResult> {
  const validator = new ValidationAggregator();

  try {
    // Field-level validations
    validateAdjustmentType(adjustment.adjustmentType);
    await validateAdjustmentDate(adjustment.adjustmentDate);

    // Business rule validations
    validateStatusTransition(adjustment.status, 'POSTED');
    validatePostTransition(adjustment);

    // Security validations
    await validateLocationAccess(userId, adjustment.locationId, 'post');
    await validatePostPermission(userId);
    await validateSegregationOfDuties(userId, adjustment, 'post');

    // Data integrity validations
    await validateStockBalanceUpdate(adjustment.locationId, adjustment.items);

  } catch (error) {
    if (error instanceof ValidationError) {
      validator.addError(
        error.code || 'VALIDATION_ERROR',
        error.message,
        error.rule || 'Unknown Rule',
        error.field,
        error.value
      );
    } else {
      throw error;
    }
  }

  // Check for warnings (non-blocking)
  try {
    await validatePostAdjustmentStockLevel(adjustment.locationId, adjustment.items);
  } catch (error) {
    if (error instanceof ValidationWarning) {
      validator.addWarning(
        error.code || 'VALIDATION_WARNING',
        error.message,
        error.rule || 'Unknown Rule',
        error.field,
        error.value
      );
    }
  }

  return validator.getResult();
}
```

---

## Shared Validation Rules

The following validation rules are defined in the Shared Methods documentation and apply to inventory adjustments:

**From [SM-costing-methods.md](../../shared-methods/inventory-valuation/SM-costing-methods.md)**:

### Transaction System Validations
1. **parent_lot_no Pattern Validation**:
   - For LOT transactions: `parent_lot_no` must be NULL
   - For ADJUSTMENT transactions: `parent_lot_no` must reference an existing LOT
   - ADJUSTMENT transactions cannot reference other ADJUSTMENT transactions

2. **Lot Format Validation**:
   - Format: `{LOCATION}-{YYMMDD}-{SEQ}`
   - Location code must be valid and match the transaction location
   - Date must be in format YYMMDD
   - Sequence must be zero-padded (e.g., '01', '02')
   - Example: `MK-251105-01` (Main Kitchen, November 5, 2025, sequence 01)

3. **FIFO Consumption Order**:
   - Query LOT transactions WHERE `parent_lot_no IS NULL`
   - Order by `lot_no ASC` for natural chronological sort
   - Consume from oldest lots first
   - Validate lot availability before consumption: `SUM(in_qty) - SUM(out_qty) > 0`

4. **Balance Calculation Validation**:
   - Balance = `SUM(in_qty) - SUM(out_qty)` per product/location
   - Balance must be calculated, not stored
   - Negative balances not allowed (validate before INSERT)
   - Use GROUP BY `product_id, location_id` for accuracy

5. **Transaction Quantity Validation**:
   - Either `in_qty` OR `out_qty` must be > 0, not both
   - IN transactions: `in_qty` > 0, `out_qty` = 0
   - OUT transactions: `in_qty` = 0, `out_qty` > 0
   - `total_cost` must match quantity × cost_per_unit
   - OUT transactions: `total_cost` must be negative

6. **lot_index Sequence Validation**:
   - Must be sequential within each lot
   - Start from 1 for new lots
   - Increment by 1 for each transaction
   - No gaps allowed in sequence
   - Used for chronological ordering within lot

**From [SM-period-end-snapshots.md](../../shared-methods/inventory-valuation/SM-period-end-snapshots.md)**:

### Period-End Validations
1. **Period Status Validation**:
   - Adjustments allowed only in OPEN periods
   - Cannot modify transactions in CLOSED periods
   - Void operations require period to be OPEN

2. **Period-End Snapshot Integration**:
   - Adjustment IN/OUT quantities included in movement summary
   - Snapshots created before period closure
   - Adjustments contribute to period valuation

### Usage in Adjustment Validations

These shared validations are applied in:
- **VAL-INV-ADJ-104**: FIFO consumption order and lot availability
- **VAL-INV-ADJ-105**: Negative balance prevention via SUM(in_qty - out_qty)
- **VAL-INV-ADJ-401**: Stock balance consistency across transaction system
- **VAL-INV-ADJ-402**: Transaction recording integrity

**Implementation Note**: Always validate against shared rules before creating adjustment transactions in `tb_inventory_transaction_closing_balance`.

---

## Validation Summary

### Coverage Matrix

| Layer | Field-Level | Business Rules | Cross-Field | Security | Data Integrity | Performance |
|-------|-------------|----------------|-------------|----------|----------------|-------------|
| Client | 10 rules | - | 6 rules | - | - | 3 rules |
| Server | 5 rules | 6 rules | 6 rules | 4 rules | 4 rules | - |
| Database | 2 rules | - | - | 1 rule (RLS) | 3 rules | - |

### Critical Validations

**Must-Have** (Blocking):
- VAL-INV-ADJ-001: Adjustment Type Validity
- VAL-INV-ADJ-101: Status Transition Workflow
- VAL-INV-ADJ-102: Journal Entry Balance Validation
- VAL-INV-ADJ-103: Stock Availability Validation
- VAL-INV-ADJ-301: Location-Based Access Control
- VAL-INV-ADJ-302: Permission-Based Action Control
- VAL-INV-ADJ-401: Stock Balance Consistency
- VAL-INV-ADJ-402: Journal Entry Integrity

**Important** (Warning):
- VAL-INV-ADJ-007: Unit Cost Validity (variance warnings)
- VAL-INV-ADJ-104: Lot Allocation Validation (FIFO warnings)
- VAL-INV-ADJ-201: Type and Quantity Consistency
- VAL-INV-ADJ-303: Segregation of Duties

**Nice-to-Have** (Informational):
- VAL-INV-ADJ-501: Item List Size Limit
- VAL-INV-ADJ-502: Auto-Save Interval
- VAL-INV-ADJ-503: Concurrent Edit Prevention

### Validation Execution Order

**On Create/Edit (Draft)**:
1. Field-level validations (001-010)
2. Cross-field validations (201-206)
3. Performance validations (501-503)

**On Post**:
1. All draft validations
2. Business rule validations (101-106)
3. Security validations (301-304)
4. Data integrity validations (401-403)

**On Void**:
1. Status transition validation (101)
2. Security validations (302-304)
3. Data integrity validations (404)

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-10 | Development Team | Initial validation rules based on business requirements, use cases, and technical specifications |
| 2.0.0 | 2025-01-10 | Development Team | Updated to align with shared costing methods infrastructure, added references to SM-costing-methods.md and SM-period-end-snapshots.md, updated VAL-INV-ADJ-104 and VAL-INV-ADJ-105 for shared transaction system |
| 2.1.0 | 2025-12-09 | Development Team | Major update to reflect actual implementation: VAL-INV-ADJ-003 rewritten with type-specific adjustment reasons (OUT: 7 reasons, IN: 5 reasons), VAL-INV-ADJ-007 updated with type-specific costing rules (OUT uses system avgCost, IN requires manual entry), VAL-INV-ADJ-106 updated with simplified GL mapping (1310/5110 for all reasons) |
