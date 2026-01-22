# Data Dictionary: POS Integration

## Module Information
- **Module**: System Administration > System Integrations
- **Sub-Module**: POS Integration
- **Route**: `/system-administration/system-integration/pos`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-18

---

## Core Types

### TransactionStatus

| Value | Description |
|-------|-------------|
| pending_approval | Awaiting manager approval |
| approved | Approved, ready for processing |
| rejected | Rejected by manager |
| processing | Currently being processed |
| success | Successfully processed |
| failed | Processing failed |
| manually_resolved | Manually resolved by user |

---

### TransactionProcessingMode

| Value | Description |
|-------|-------------|
| automatic | Auto-approve and process immediately |
| approval | Require approval before processing |
| manual | Manual processing only |

---

### ErrorCategory

| Value | Description |
|-------|-------------|
| mapping_error | POS item not mapped to recipe |
| stock_insufficient | Insufficient stock for deduction |
| validation_error | Data validation failed |
| system_error | Internal system error |
| connection_error | POS connection failed |

---

### InventoryImpact

| Value | Description |
|-------|-------------|
| low | Minor inventory impact |
| medium | Moderate inventory impact |
| high | Significant inventory impact |

---

## Primary Interfaces

### POSTransaction

| Field | Type | Description |
|-------|------|-------------|
| id | string | Internal ID |
| transactionId | string | Carmen transaction ID |
| externalId | string | POS system transaction ID |
| date | string | Transaction date (ISO) |
| status | TransactionStatus | Current status |
| locationId | string | Carmen location ID |
| location | object | Location details (id, name) |
| posSystem | object | POS system info (name, version) |
| totalAmount | Money | Total transaction value |
| itemCount | number | Number of line items |
| processedAt | string | Processing timestamp |
| processedBy | object | Processor user details |
| notes | string | Transaction notes |

---

### POSTransactionLineItem

| Field | Type | Description |
|-------|------|-------------|
| id | string | Line item ID |
| transactionId | string | Parent transaction ID |
| posItemId | string | POS item identifier |
| posItemName | string | Item name from POS |
| category | string | Item category |
| quantity | number | Quantity sold |
| unitPrice | Money | Price per unit |
| totalPrice | Money | Total line amount |
| mappedRecipe | object | Mapped recipe (id, name, category) |
| inventoryDeduction | InventoryDeduction | Deduction details |

---

### POSMapping

| Field | Type | Description |
|-------|------|-------------|
| id | string | Mapping ID |
| posItemId | string | POS item identifier |
| posItemName | string | Item name from POS |
| posItemCategory | string | Item category |
| posOutletId | string | POS outlet identifier |
| posOutletName | string | Outlet name |
| locationId | string | Carmen location ID |
| locationName | string | Carmen location name |
| recipeId | string | Mapped recipe ID |
| recipeName | string | Recipe name |
| recipeCategory | string | Recipe category |
| portionSize | number | Portion quantity |
| unit | string | Portion unit |
| unitPrice | Money | Price at this outlet |
| isActive | boolean | Mapping active status |
| mappedBy | object | User who created mapping |
| mappedAt | string | Mapping creation date |
| lastVerifiedAt | string | Last verification date |

**Composite Key**: posItemId + posOutletId

---

### FractionalVariant

| Field | Type | Description |
|-------|------|-------------|
| id | string | Variant ID |
| baseRecipeId | string | Base recipe identifier |
| baseRecipeName | string | Recipe name |
| totalYield | number | Total portions from recipe |
| yieldUnit | string | Yield unit (slice, piece, etc.) |
| variants | array | Variant items array |
| roundingRule | string | up, down, nearest |
| isActive | boolean | Variant active status |

### Variant Item (nested)

| Field | Type | Description |
|-------|------|-------------|
| posItemId | string | POS item identifier |
| posItemName | string | POS item name |
| fractionalUnit | string | Fraction description |
| deductionAmount | number | Deduction percentage (0-1) |
| price | Money | Item price |

---

### POSIntegrationConfig

| Field | Type | Description |
|-------|------|-------------|
| id | string | Config ID |
| posSystem | string | comanche or custom |
| apiEndpoint | string | POS API URL |
| syncEnabled | boolean | Auto-sync enabled |
| syncFrequency | number | Sync interval (minutes) |
| processingMode | TransactionProcessingMode | How to process |
| autoApproveThreshold | number | Auto-approve limit |
| requireApproval | boolean | Require manager approval |
| emailNotifications | boolean | Email alerts enabled |
| notificationRecipients | string[] | Email addresses |
| dataRetentionDays | number | Data retention period |
| connectionStatus | string | connected/disconnected/error |
| lastSyncAt | string | Last sync timestamp |
| lastConnectionTest | string | Last test timestamp |

---

### POSDashboardMetrics

| Field | Type | Description |
|-------|------|-------------|
| systemStatus | string | Connection status |
| alerts.unmappedItems | number | Unmapped item count |
| alerts.failedTransactions | number | Failed transaction count |
| alerts.pendingApprovals | number | Pending approval count |
| alerts.fractionalVariants | number | Active variant count |
| recentActivity | POSTransaction[] | Recent transactions |
| syncStatus | object | Sync schedule details |

---

### TransactionStatistics

| Field | Type | Description |
|-------|------|-------------|
| period | object | Date range (startDate, endDate) |
| totalTransactions | number | Total count |
| successfulTransactions | number | Success count |
| failedTransactions | number | Failure count |
| pendingApprovals | number | Pending count |
| totalValue | Money | Total monetary value |
| averageTransactionValue | Money | Average per transaction |
| processingAccuracy | number | Success percentage |

---

### PendingTransaction

Extends POSTransaction with:

| Field | Type | Description |
|-------|------|-------------|
| requester | object | User who requested (id, name, email) |
| inventoryImpact | InventoryImpact | Impact level |
| lineItems | POSTransactionLineItem[] | Transaction items |
| approvalNotes | ApprovalNote[] | Approval history |

---

### TransactionError

| Field | Type | Description |
|-------|------|-------------|
| category | ErrorCategory | Error type |
| code | string | Error code |
| message | string | Error message |
| severity | string | critical/high/medium/low |
| occurredAt | string | Error timestamp |
| technicalDetails | object | Debug information |

---

### InventoryImpactPreview

| Field | Type | Description |
|-------|------|-------------|
| affectedItems | InventoryImpactItem[] | Items affected |
| warnings | InventoryWarning[] | Stock warnings |
| summary | object | Total ingredients, value, locations |

---

## Report Types

### GrossProfitReportItem

| Field | Type | Description |
|-------|------|-------------|
| category | string | Product category |
| revenue | number | Total revenue |
| cogs | number | Cost of goods sold |
| grossProfit | number | Gross profit amount |
| marginPercentage | number | Profit margin % |
| transactionCount | number | Transaction count |

---

### ConsumptionAnalysisItem

| Field | Type | Description |
|-------|------|-------------|
| ingredient | string | Ingredient name |
| unit | string | Measurement unit |
| theoreticalUsage | number | Expected usage |
| actualUsage | number | Actual usage |
| variance | number | Usage difference |
| variancePercentage | number | Variance % |
| cost | number | Variance cost impact |

---

## Component State

### POSIntegrationPage

| State | Type | Description |
|-------|------|-------------|
| activeTab | string | Current tab (dashboard/mapping/transactions/config/reports) |
| mappings | POSMapping[] | Current mappings |
| config | POSIntegrationConfig | Integration settings |

### POSMappingTab

| State | Type | Description |
|-------|------|-------------|
| subTab | string | recipe/location/fractional |
| searchQuery | string | Filter search text |
| categoryFilter | string | Category filter |
| outletFilter | string | Outlet filter |
| showMappingDialog | boolean | Create dialog visibility |
| showEditMappingDialog | boolean | Edit dialog visibility |
| selectedUnmappedItem | POSItem | Item being mapped |

### POSTransactionsTab

| State | Type | Description |
|-------|------|-------------|
| filter | string | Status filter |
| searchQuery | string | Transaction ID search |
| selectedLocation | string | Location filter |
| dateRange | string | Date filter (1d/7d/30d/90d) |
| selectedTransactions | string[] | Bulk selection |
| expandedRows | Set | Expanded row IDs |

---

**Document End**
