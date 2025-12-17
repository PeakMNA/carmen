# Purchase Request Business Rules & Validation

**Module**: Procurement  
**Function**: Purchase Requests  
**Document**: Business Rules & Validation Specification  
**Version**: 1.0  
**Date**: January 2025  
**Status**: Production Implementation Documented

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 📋 Business Rules Overview

This document defines comprehensive business rules, validation logic, and constraints for Purchase Request management. The implementation includes sophisticated workflow rules, approval logic, and data validation mechanisms.

### Current Implementation Status: ✅ **PRODUCTION-READY**

**Source Files**:
- Type Definitions: `/lib/types.ts` (PR business object models)
- Workflow Engine: `/services/workflow-decision-engine.ts` (Approval business logic)
- RBAC Service: `/services/rbac-service.ts` (Permission rules)
- Mock Data: `/mockPRListData.ts` (Business rule examples)

---

## 🎯 Rule Categories

### 1. Data Validation Rules
- Field format validation
- Required field constraints
- Data type validation
- Range and limit checking

### 2. Business Logic Rules  
- Workflow progression rules
- Approval hierarchy rules
- Budget and financial rules
- Status transition rules

### 3. Permission & Security Rules
- Role-based access control
- Data visibility rules
- Action authorization rules
- Audit and compliance rules

### 4. Integration Rules
- Multi-currency handling
- Vendor validation rules
- Inventory integration rules
- Financial system integration

---

## 📊 Rule 1: Purchase Request Data Validation Rules

### 1.1 Required Field Validation

**Critical Required Fields**:
```typescript
interface PRRequiredFields {
  refNumber: string;        // Auto-generated, format: PR-YYYY-NNN
  date: Date;              // Must be valid date, not future
  type: PRType;            // Must be valid enum value
  description: string;     // Minimum 10 characters, maximum 500
  requestorId: string;     // Must be valid user ID
  department: string;      // Must be valid department
  location: string;        // Must be valid location
  items: PurchaseRequestItem[]; // Must have at least 1 item
}
```

**Validation Rules**:
- **PR Number**: Auto-generated, format `PR-YYYY-NNN` (e.g., PR-2401-0001)
- **Date**: Must be today or past date, cannot be future dated
- **Type**: Must be one of: GeneralPurchase, MarketList, AssetPurchase, CapitalExpenditure
- **Description**: 10-500 characters, no special characters except basic punctuation
- **Requestor**: Must be active user with valid department assignment
- **Department**: Must be valid department from master data
- **Location**: Must be valid location with active status
- **Items**: Must contain at least 1 item with valid data

### 1.2 Field Format Validation Rules

**Reference Number Rules**:
```typescript
const PR_NUMBER_FORMAT = /^PR-\d{4}-\d{3,4}$/;
const generatePRNumber = (year: number, sequence: number) => {
  return `PR-${year}-${sequence.toString().padStart(3, '0')}`;
};
```

**Currency and Amount Rules**:
```typescript
interface CurrencyValidation {
  currency: CurrencyCode;           // Must be supported currency
  totalAmount: number;              // Must be > 0, max 2 decimal places
  subTotalPrice: number;            // Must be sum of all item totals
  taxAmount: number;                // Must be calculated correctly
  discountAmount: number;           // Cannot exceed subtotal
  netAmount: number;                // Must equal subtotal - discount + tax
}
```

**Date Field Rules**:
- **PR Date**: Cannot be future dated, must be within current fiscal year
- **Delivery Date**: Must be at least 3 days after PR date, cannot be more than 1 year future
- **Required Date**: Optional, but if provided must be >= delivery date

### 1.3 Item-Level Validation Rules

**Purchase Request Item Validation**:
```typescript
interface PRItemValidationRules {
  description: string;      // Required, 5-200 characters
  quantity: number;         // Must be > 0, up to 4 decimal places
  unitPrice: number;        // Must be >= 0, max 4 decimal places
  totalPrice: number;       // Must equal quantity * unitPrice
  unit: string;            // Must be valid unit of measure
  vendor?: string;         // Optional, must be active vendor if provided
  budgetCode?: string;     // Must be valid budget code if provided
}
```

**Item Business Rules**:
- **Minimum Items**: PR must have at least 1 item
- **Maximum Items**: PR cannot exceed 100 items
- **Item Descriptions**: Must be unique within the PR
- **Quantity Limits**: Cannot exceed 9999.9999 units
- **Price Limits**: Unit price cannot exceed $999,999.99
- **Total Calculation**: System calculates totals, user cannot override

---

## 💼 Rule 2: Business Logic & Workflow Rules

### 2.1 PR Type Business Rules

**PR Type Definitions & Rules**:
```typescript
enum PRType {
  GeneralPurchase = "GeneralPurchase",      // Standard purchases < $5,000
  MarketList = "MarketList",                // Daily/weekly operational supplies
  AssetPurchase = "AssetPurchase",          // Assets $5,000 - $50,000
  CapitalExpenditure = "CapitalExpenditure" // Capital items > $50,000
}
```

**Type-Specific Rules**:

**GeneralPurchase Rules**:
- Total amount limit: $5,000
- Approval: Department Head only
- Lead time: Standard 3-7 days
- Budget approval: Not required
- Documentation: Standard documentation

**MarketList Rules**:
- Total amount limit: $1,000
- Approval: Automatic approval if within budget
- Lead time: Same day to 2 days
- Budget approval: Pre-approved monthly budget
- Documentation: Simplified documentation

**AssetPurchase Rules**:
- Total amount range: $5,000 - $50,000
- Approval: Department Head + Finance Manager
- Lead time: 7-21 days
- Budget approval: Required
- Documentation: Asset registration required

**CapitalExpenditure Rules**:
- Total amount: > $50,000
- Approval: Department Head + Finance Manager + General Manager
- Lead time: 14-30 days
- Budget approval: Board approval may be required
- Documentation: Full business case required

### 2.2 Workflow Status Rules

**Status Transition Matrix**:
```typescript
enum DocumentStatus {
  Draft = "Draft",                    // Initial status
  Submitted = "Submitted",            // Submitted for approval
  InProgress = "InProgress",          // Under approval review
  Approved = "Approved",              // Fully approved
  Rejected = "Rejected",              // Rejected at any stage
  OnHold = "OnHold",                  // Temporarily suspended
  Cancelled = "Cancelled",            // Cancelled by requester
  Completed = "Completed",            // Converted to PO
  Void = "Void"                       // Voided (admin only)
}
```

**Valid Status Transitions**:
```typescript
const VALID_STATUS_TRANSITIONS: Record<DocumentStatus, DocumentStatus[]> = {
  Draft: [Submitted, Cancelled],
  Submitted: [InProgress, Draft, Cancelled],
  InProgress: [Approved, Rejected, OnHold, Draft],
  Approved: [Completed, OnHold],
  Rejected: [Draft, Cancelled],
  OnHold: [InProgress, Cancelled],
  Cancelled: [], // Terminal status
  Completed: [], // Terminal status
  Void: []       // Terminal status
};
```

### 2.3 Approval Workflow Rules

**Workflow Stage Progression**:
```typescript
enum WorkflowStage {
  requester = "Requestor",                        // Initial creation
  departmentHeadApproval = "DepartmentHeadApproval", // Dept head review
  financeApproval = "FinanceApproval",            // Finance review
  generalManagerApproval = "GeneralManagerApproval", // GM review  
  completed = "Completed"                         // Final stage
}
```

**Stage Assignment Logic**:
```typescript
const getRequiredApprovalStages = (pr: PurchaseRequest): WorkflowStage[] => {
  const stages: WorkflowStage[] = [WorkflowStage.departmentHeadApproval];
  
  // Finance approval required for amounts > $1,000
  if (pr.totalAmount > 1000) {
    stages.push(WorkflowStage.financeApproval);
  }
  
  // GM approval required for amounts > $10,000
  if (pr.totalAmount > 10000) {
    stages.push(WorkflowStage.generalManagerApproval);
  }
  
  // Asset purchases always require finance approval
  if (pr.type === PRType.AssetPurchase || pr.type === PRType.CapitalExpenditure) {
    if (!stages.includes(WorkflowStage.financeApproval)) {
      stages.push(WorkflowStage.financeApproval);
    }
  }
  
  return stages;
};
```

### 2.4 Budget Validation Rules

**Budget Constraint Rules**:
```typescript
interface BudgetValidationRules {
  // Department budget limits
  departmentMonthlyLimit: number;    // Monthly spending limit
  departmentYearlyLimit: number;     // Annual spending limit
  
  // Budget code constraints
  budgetCodeRequired: boolean;       // Budget code mandatory for amounts > $500
  budgetCodeValid: boolean;          // Must be active and not exceeded
  
  // Budget approval thresholds
  autoApproveLimit: number;          // Auto-approve if within limit and budget
  budgetApprovalRequired: number;    // Requires budget approval
  
  // Remaining budget checks
  sufficientBudget: boolean;         // Must have sufficient remaining budget
  budgetExceedsThreshold: boolean;   // Exceeds percentage of total budget
}
```

**Budget Validation Logic**:
- **Budget Code Required**: Mandatory for purchases > $500
- **Budget Availability**: Must have sufficient remaining budget
- **Budget Approval**: Required if purchase > 80% of remaining budget
- **Department Limits**: Cannot exceed monthly/yearly department limits
- **Emergency Override**: Finance Manager can override budget constraints

---

## 🔐 Rule 3: Permission & Security Rules

### 3.1 Role-Based Access Control Rules

**Role Permission Matrix**:
```typescript
interface RolePermissions {
  Requester: {
    create: true,           // Can create PRs
    edit: 'own_draft',      // Can edit own draft PRs only
    view: 'department',     // Can view department PRs
    delete: 'own_draft',    // Can delete own draft PRs
    approve: false,         // Cannot approve
    submit: 'own'          // Can submit own PRs
  },
  
  DepartmentHead: {
    create: true,           // Can create PRs
    edit: 'department',     // Can edit department PRs
    view: 'department',     // Can view all department PRs
    delete: 'department_draft', // Can delete department draft PRs
    approve: 'department',  // Can approve department PRs
    submit: 'department'    // Can submit department PRs
  },
  
  FinanceManager: {
    create: true,           // Can create PRs
    edit: 'all',           // Can edit all PRs (with restrictions)
    view: 'all',           // Can view all PRs
    delete: false,         // Cannot delete PRs
    approve: 'finance_stage', // Can approve at finance stage
    submit: 'all'          // Can submit PRs at appropriate stages
  }
}
```

### 3.2 Field-Level Permission Rules

**Field Edit Permissions**:
```typescript
interface FieldPermissions {
  // Basic Information
  description: 'requester' | 'department_head' | 'admin';
  deliveryDate: 'requester' | 'department_head';
  priority: 'department_head' | 'admin';
  
  // Financial Information  
  budgetCode: 'requester' | 'department_head' | 'finance';
  currency: 'finance' | 'admin';
  exchangeRate: 'finance' | 'admin';
  
  // Items
  itemDetails: 'requester' | 'department_head';
  itemPrices: 'requester' | 'department_head' | 'purchasing';
  
  // Workflow
  workflowStage: 'system_only';
  approvalComments: 'approver_only';
  
  // Administrative
  refNumber: 'system_only';
  auditFields: 'system_only';
}
```

### 3.3 Data Visibility Rules

**Data Visibility by Role**:
- **Requester**: Can see own PRs + department summary data
- **Department Head**: Can see all department PRs + department analytics
- **Finance Manager**: Can see all PRs + financial analytics
- **Purchasing Staff**: Can see all approved PRs + vendor data
- **General Manager**: Can see all PRs + executive dashboards
- **System Administrator**: Full access to all data and configurations

**Sensitive Information Rules**:
- **Budget Information**: Visible only to department heads and above
- **Vendor Pricing**: Visible only to purchasing staff and finance
- **Approval Comments**: Visible only to approvers and above
- **Audit Trail**: Visible only to finance and system administrators

---

## 💰 Rule 4: Financial & Currency Rules

### 4.1 Multi-Currency Rules

**Currency Handling Rules**:
```typescript
interface CurrencyRules {
  baseCurrency: 'USD';                    // System base currency
  supportedCurrencies: CurrencyCode[];    // Supported currency list
  exchangeRateSource: 'bank' | 'manual'; // Exchange rate source
  exchangeRateValidation: boolean;        // Validate current rates
  currencyConversionAccuracy: 4;          // Decimal places for conversion
  displayCurrencyPrecision: 2;           // Display decimal places
}
```

**Supported Currencies**:
```typescript
enum CurrencyCode {
  USD = "USD", // US Dollar (Base)
  EUR = "EUR", // Euro  
  GBP = "GBP", // British Pound
  CAD = "CAD", // Canadian Dollar
  AUD = "AUD", // Australian Dollar
  JPY = "JPY", // Japanese Yen
  CHF = "CHF", // Swiss Franc
  CNY = "CNY", // Chinese Yuan
  INR = "INR", // Indian Rupee
  MXN = "MXN"  // Mexican Peso
}
```

**Currency Conversion Rules**:
- **Base Currency Calculation**: All amounts stored in base currency (USD)
- **Exchange Rate Validation**: Rates must be current (within 24 hours)
- **Conversion Accuracy**: Maintain 4 decimal place precision for calculations
- **Display Formatting**: Display amounts in original currency with base currency equivalent
- **Rate Source**: Use official bank rates or manually entered rates (with approval)

### 4.2 Financial Calculation Rules

**Amount Calculation Logic**:
```typescript
interface AmountCalculation {
  // Item level calculations
  itemTotal = quantity * unitPrice;
  
  // PR level calculations  
  subTotalPrice = sum(all item totals);
  discountAmount = subTotalPrice * (discountPercentage / 100);
  netAmountBeforeTax = subTotalPrice - discountAmount;
  taxAmount = netAmountBeforeTax * (taxRate / 100);
  totalAmount = netAmountBeforeTax + taxAmount;
  
  // Currency conversions
  baseAmounts = originalAmount * exchangeRate;
}
```

**Rounding Rules**:
- **Unit Prices**: Round to 4 decimal places for calculation, display 2
- **Extended Amounts**: Round to 2 decimal places
- **Tax Calculations**: Round to 2 decimal places
- **Currency Conversions**: Round to 2 decimal places for display
- **Percentage Calculations**: Maintain precision through calculation chain

---

## ⚠️ Rule 5: Validation Error Messages & Handling

### 5.1 Field Validation Error Messages

**Required Field Errors**:
```typescript
const VALIDATION_MESSAGES = {
  // Required fields
  DESCRIPTION_REQUIRED: "Description is required and must be at least 10 characters",
  DATE_REQUIRED: "PR date is required and cannot be future dated",
  REQUESTOR_REQUIRED: "Requestor must be specified and be an active user",
  DEPARTMENT_REQUIRED: "Department must be selected from valid list",
  ITEMS_REQUIRED: "At least one item must be added to the purchase request",
  
  // Format validation
  INVALID_CURRENCY: "Invalid currency code. Must be a supported currency",
  INVALID_AMOUNT: "Amount must be a positive number with max 2 decimal places",
  INVALID_DATE_FORMAT: "Date must be in valid format (MM/DD/YYYY)",
  INVALID_EMAIL: "Email address format is invalid",
  
  // Business rule violations
  BUDGET_EXCEEDED: "Purchase amount exceeds available budget for this period",
  APPROVAL_REQUIRED: "This purchase amount requires additional approval",
  INVALID_STATUS_TRANSITION: "Cannot change status from current state",
  INSUFFICIENT_PERMISSIONS: "User does not have permission to perform this action"
};
```

### 5.2 Business Rule Violation Handling

**Rule Violation Categories**:
- **ERROR**: Blocks operation, must be fixed
- **WARNING**: Allows operation with confirmation
- **INFO**: Provides information, doesn't block

**Error Handling Strategy**:
```typescript
interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];     // Critical errors that block operation
  warnings: ValidationWarning[]; // Non-blocking warnings
  info: ValidationInfo[];        // Informational messages
}
```

---

## 📊 Rule 6: Audit & Compliance Rules

### 6.1 Audit Trail Rules

**Audit Event Tracking**:
```typescript
interface AuditEvent {
  eventType: 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT';
  userId: string;                 // User performing action
  timestamp: Date;                // When action occurred
  fieldChanges?: FieldChange[];   // What fields changed
  oldValue?: any;                 // Previous value
  newValue?: any;                 // New value
  reason?: string;                // Reason for change
  ipAddress?: string;             // User IP address
  sessionId?: string;             // Session identifier
}
```

**Audit Requirements**:
- **All Changes Logged**: Every field change must be audited
- **User Attribution**: All changes attributed to specific user
- **Timestamp Accuracy**: UTC timestamps with millisecond precision
- **Change History**: Complete change history maintained
- **Immutable Log**: Audit log cannot be modified or deleted
- **Retention Period**: Audit data retained for 7 years minimum

### 6.2 Compliance Rules

**Regulatory Compliance**:
- **SOX Compliance**: Financial approval workflows must be auditable
- **Data Privacy**: PII data must be protected and access logged
- **Document Retention**: All PR documents retained per policy
- **Approval Documentation**: All approvals must be documented with reason
- **Segregation of Duties**: Creator cannot approve their own PR

**Internal Control Rules**:
- **Approval Limits**: Approval limits enforced by system
- **Budget Controls**: Budget overruns require additional approval
- **Vendor Validation**: Only approved vendors can be selected
- **Purchase Authorization**: All purchases must be properly authorized
- **Document Integrity**: Digital signatures or equivalent for high-value PRs

---

## 🚨 Rule 7: Exception Handling Rules

### 7.1 Emergency Purchase Rules

**Emergency Purchase Criteria**:
```typescript
interface EmergencyPurchaseRules {
  eligibleRequestors: 'department_head' | 'general_manager' | 'ceo';
  maxAmount: number;              // Maximum emergency purchase amount
  reasonRequired: boolean;        // Detailed reason required
  postApprovalRequired: boolean;  // Requires post-approval within 24h
  notificationRequired: boolean;  // Automatic notifications to approvers
  auditFlagged: boolean;         // Flagged for audit review
}
```

### 7.2 System Override Rules

**Override Capabilities**:
- **Finance Manager**: Can override budget constraints (with reason)
- **General Manager**: Can expedite approval workflow
- **System Administrator**: Can modify PR in any status (with audit)
- **CEO**: Can approve any amount (emergency situations)

**Override Requirements**:
- **Detailed Reason**: Must provide comprehensive justification
- **Additional Approval**: Override may require secondary approval
- **Audit Flagging**: All overrides flagged for audit review
- **Documentation**: Override reason and approval documented
- **Notification**: Relevant stakeholders notified of override

---

## 📈 Rule 8: Integration Business Rules

### 8.1 Vendor Integration Rules

**Vendor Validation Rules**:
```typescript
interface VendorValidationRules {
  vendorStatus: 'active';         // Must be active vendor
  paymentTerms: 'approved';       // Must have approved payment terms
  creditLimit: 'within_limit';    // Purchase must be within credit limit
  contractStatus: 'valid';        // Must have valid contract (if required)
  taxRegistration: 'valid';       // Tax registration must be valid
  bankingDetails: 'verified';     // Banking details must be verified
}
```

### 8.2 Inventory Integration Rules

**Inventory Item Validation**:
- **Item Existence**: Items must exist in inventory master data
- **Item Status**: Items must be active and not discontinued
- **Unit of Measure**: UOM must match inventory master data
- **Lead Time**: Delivery dates must respect item lead times
- **Minimum Order**: Quantities must meet minimum order requirements
- **Pack Size**: Quantities must be in valid pack sizes

### 8.3 Financial System Integration

**GL Account Integration Rules**:
```typescript
interface GLAccountRules {
  accountCodeRequired: boolean;   // GL account code required
  accountValid: boolean;         // Account must be active
  departmentMapping: boolean;     // Account must map to department
  budgetAlignment: boolean;      // Must align with budget structure
  approvalLevel: string;         // Account-specific approval levels
  costCenterRequired: boolean;   // Cost center required for certain accounts
}
```

---

## ✅ Rule Implementation Status

### Production-Ready Business Rules:
- **✅ Data Validation**: Comprehensive field validation implemented
- **✅ Workflow Rules**: Multi-stage approval workflow with decision engine
- **✅ Permission Rules**: RBAC-based access control system
- **✅ Status Management**: Complete status transition logic
- **✅ Currency Handling**: Multi-currency support with conversion rules
- **✅ Audit Logging**: Complete audit trail implementation

### Integration Ready:
- **🔄 Budget System**: Ready for budget validation integration
- **🔄 Vendor System**: Ready for vendor validation integration  
- **🔄 Financial System**: Ready for GL account integration
- **🔄 Notification System**: Ready for workflow notification integration

---

*This comprehensive business rules documentation captures the complete validation logic, workflow rules, and business constraints implemented in the Carmen ERP Purchase Request system, providing detailed guidance for system behavior and integration requirements.*