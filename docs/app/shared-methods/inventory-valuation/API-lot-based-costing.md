# API Reference: Lot-Based Costing

**📌 Schema Reference**: Data structures defined in `/app/data-struc/schema.prisma`

**Version**: 2.0.0 (Future Enhancement Specification)
**Status**: ⚠️ **PLANNED - NOT YET IMPLEMENTED**
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Last Updated**: 2025-11-03

---

## ⚠️ CRITICAL NOTICE: Future Enhancement Document

**This document describes PLANNED API endpoints that are NOT yet implemented.**

### Current Implementation Status

❌ **The following API endpoints described in this document DO NOT exist**:
- `/api/v1/inventory/lots` - Lot layer creation and management
- `/api/v1/inventory/lots/:lotNumber/consume` - FIFO lot consumption
- `/api/v1/inventory/lots/available` - Available lot queries
- `/api/v1/inventory/adjustments` - Cost adjustment layer management
- `/api/v1/periods` - Period lifecycle management
- `/api/v1/periods/:periodId/close` - Period close with snapshot creation
- `/api/v1/periods/:periodId/reopen` - Period re-open with authorization
- `/api/v1/periods/:periodId/lock` - Period lock (permanent closure)
- `/api/v1/snapshots` - Period-end snapshot queries
- `/api/v1/inventory/valuation` - Inventory valuation reports

✅ **What DOES exist in current implementation**:
- Basic inventory transaction endpoints (GRN, Store Requisition, etc.)
- Transaction-based inventory queries using `in_qty`/`out_qty`
- Real-time balance calculations: `SUM(in_qty) - SUM(out_qty)`
- Lot number format: `{LOCATION}-{YYMMDD}-{SEQ}` (e.g., `MK-251102-0001`)
- Date embedded in lot_number (no separate receipt_date field in database)
- FIFO ordering via `ORDER BY lot_number ASC`
- No lot-specific endpoints
- No period management endpoints

**✅ IMPORTANT**: Balance calculation using `SUM(in_qty) - SUM(out_qty)` is the CORRECT design (not a planned feature). This document uses `remaining_quantity` in API examples for readability, but implementation will always calculate from transaction history.

### Implementation Roadmap

This document describes **API endpoints for Phases 3-5** from `SCHEMA-ALIGNMENT.md`.

**Prerequisites**:
- Schema changes in Phase 1-3 must be completed first
- Services and business logic must be implemented
- Only then can these API endpoints be created

**For current transaction-based approach, see**: `SM-costing-methods.md` v2.0.0

**For implementation roadmap, see**: `SCHEMA-ALIGNMENT.md` Phases 1-5

---

## 🗺️ API Version Roadmap

### Overview

The Carmen ERP inventory valuation API will evolve through multiple versions, progressively adding capabilities aligned with the enhancement phases.

```
API v1.0 (Current)          ████████░░░░░░ 60% Complete
├── Transaction-based operations
├── Real-time balance calculations
└── Basic inventory queries

API v1.1 (Phase 1)          ░░░░░░░░░░░░░░  0% - Week 1-2
├── Transaction type endpoints
├── Parent lot reference queries
└── Period status queries

API v1.2 (Phase 2)          ░░░░░░░░░░░░░░  0% - Week 3
├── Automatic lot generation
└── Lot validation endpoints

API v1.3 (Phase 3)          ░░░░░░░░░░░░░░  0% - Week 4-6
├── Enhanced FIFO with parent linkage
└── Traceability queries

API v2.0 (Phase 4-5)        ░░░░░░░░░░░░░░  0% - Week 7-11
├── Period management endpoints
├── Snapshot queries
└── Enhanced reporting
```

---

### 📊 API Feature Availability Matrix

| Feature Category | v1.0 (Current) | v1.1 (Phase 1) | v1.2 (Phase 2) | v1.3 (Phase 3) | v2.0 (Phase 4-5) |
|------------------|----------------|----------------|----------------|----------------|------------------|
| **Transaction Operations** | ✅ | ✅ | ✅ | ✅ | ✅ |
| Basic GRN/Store Requisition | ✅ | ✅ | ✅ | ✅ | ✅ |
| Transfer operations | ✅ | ✅ | ✅ | ✅ | ✅ |
| Transaction history queries | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Lot Management** | 🔄 | 🔄 | ✅ | ✅ | ✅ |
| Manual lot number entry | ✅ | ✅ | ✅ | ✅ | ✅ |
| Automatic lot generation | ❌ | ❌ | ✅ | ✅ | ✅ |
| Lot validation endpoints | ❌ | ❌ | ✅ | ✅ | ✅ |
| Lot format enforcement | ❌ | ❌ | ✅ | ✅ | ✅ |
| **Transaction Types** | ❌ | ✅ | ✅ | ✅ | ✅ |
| Explicit type queries | ❌ | ✅ | ✅ | ✅ | ✅ |
| Type-based filtering | ❌ | ✅ | ✅ | ✅ | ✅ |
| Transaction categorization | ❌ | ✅ | ✅ | ✅ | ✅ |
| **Traceability** | 🔄 | 🔄 | 🔄 | ✅ | ✅ |
| Basic lot history | ✅ | ✅ | ✅ | ✅ | ✅ |
| Parent lot queries | ❌ | 🔄 | 🔄 | ✅ | ✅ |
| Complete lot lineage | ❌ | ❌ | ❌ | ✅ | ✅ |
| Consumption trace endpoint | ❌ | ❌ | ❌ | ✅ | ✅ |
| **Period Management** | ❌ | 🔄 | 🔄 | 🔄 | ✅ |
| Period status queries | ❌ | ✅ | ✅ | ✅ | ✅ |
| Period close endpoint | ❌ | ❌ | ❌ | ❌ | ✅ |
| Period reopen endpoint | ❌ | ❌ | ❌ | ❌ | ✅ |
| Period lock endpoint | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Snapshots** | ❌ | ❌ | ❌ | ❌ | ✅ |
| Snapshot queries | ❌ | ❌ | ❌ | ❌ | ✅ |
| Lot-level snapshots | ❌ | ❌ | ❌ | ❌ | ✅ |
| Period comparisons | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Reporting** | ✅ | ✅ | ✅ | ✅ | ✅ |
| Basic valuation reports | ✅ | ✅ | ✅ | ✅ | ✅ |
| Movement reports | ✅ | ✅ | ✅ | ✅ | ✅ |
| Enhanced analytics | ❌ | ❌ | ❌ | ❌ | ✅ |
| Lot traceability reports | ❌ | ❌ | ❌ | ✅ | ✅ |

**Legend**: ✅ Available | 🔄 Partial | ❌ Not Available

---

### API v1.0 (Current Production)

**Status**: ✅ **Production Ready**
**Availability**: Available Now

#### Available Endpoints

**Transaction Operations**:
```http
POST   /api/v1/inventory/transactions           # Create inventory transaction
GET    /api/v1/inventory/transactions/:id       # Get transaction details
GET    /api/v1/inventory/transactions           # List transactions with filters
PUT    /api/v1/inventory/transactions/:id       # Update transaction
DELETE /api/v1/inventory/transactions/:id       # Delete transaction (if period open)
```

**Balance Queries**:
```http
GET    /api/v1/inventory/balance                # Get current balance
GET    /api/v1/inventory/balance/:item          # Item-specific balance
GET    /api/v1/inventory/balance/:item/:location # Item-location balance
```

**Basic Reports**:
```http
GET    /api/v1/reports/valuation                # Current inventory valuation
GET    /api/v1/reports/movements                # Transaction movements
GET    /api/v1/reports/balance-summary          # Balance summary by location
```

#### Key Features

✅ **Transaction-based operations**
- Create, read, update, delete inventory transactions
- Automatic balance calculation: `SUM(in_qty) - SUM(out_qty)`
- Lot number format support: `{LOCATION}-{YYMMDD}-{SEQ}`

✅ **Real-time balance calculations**
- On-demand balance queries
- No stored balance fields
- Transaction history as source of truth

✅ **FIFO ordering support**
- Natural chronological sort via `ORDER BY lot_no ASC`
- Date embedded in lot number
- Multi-lot consumption

✅ **Basic reporting**
- Current valuation reports
- Transaction history
- Location-based summaries

#### Limitations

⚠️ **No explicit transaction types** - Must infer from `in_qty`/`out_qty` patterns
⚠️ **No parent lot tracking** - Limited traceability via `transaction_detail` table
⚠️ **No period management** - No period close/lock capabilities
⚠️ **Manual lot numbers** - No automatic generation or validation

---

### API v1.1 (Phase 1 - Schema Enhancement)

**Status**: ⏳ **Planned - Week 1-2**
**Availability**: Approximately 1-2 weeks after Phase 1 deployment

#### New Endpoints

**Transaction Type Queries**:
```http
GET    /api/v1/inventory/transactions/by-type/:type  # Filter by transaction type
GET    /api/v1/inventory/types                       # Get available transaction types
```

**Parent Lot Queries**:
```http
GET    /api/v1/inventory/lots/:lotNumber/children    # Get consumption transactions
GET    /api/v1/inventory/lots/:lotNumber/parent      # Get source lot (if transfer/adjustment)
```

**Period Status**:
```http
GET    /api/v1/periods/current                       # Get current period info
GET    /api/v1/periods/:periodId                     # Get period details
GET    /api/v1/periods                               # List all periods
```

#### Enhanced Features

✅ **Explicit transaction types (8 types)**
- **LOT Layer** (parent_lot_no IS NULL): RECEIVE, TRANSFER_IN, OPEN, CLOSE
- **ADJUSTMENT Layer** (parent_lot_no IS NOT NULL): ISSUE, ADJ_IN, ADJ_OUT, TRANSFER_OUT
- Type-based filtering and analytics
- Clear transaction categorization with layer logic

✅ **Parent lot reference**
- Direct parent-child queries (read-only initially)
- Foundation for traceability
- Consumption source identification
- Layer type determined by parent_lot_no presence

✅ **Period awareness**
- Period status queries (OPEN, CLOSED, LOCKED)
- Period boundary identification
- Future period management foundation

#### API Changes

**Enhanced Response Structure**:
```json
{
  "lot_number": "MK-250115-0001",
  "transaction_type": "RECEIVE",     // ⭐ NEW in v1.1: RECEIVE|ISSUE|ADJ_IN|ADJ_OUT|TRANSFER_IN|TRANSFER_OUT|OPEN|CLOSE
  "parent_lot_no": null,              // ⭐ NEW in v1.1: NULL for LOT layer, NOT NULL for ADJUSTMENT layer
  "transaction_reason": null,         // ⭐ NEW in v1.1
  "in_qty": 100.00000,
  "out_qty": 0.00000,
  "layer_type": "LOT"                 // ⭐ Derived: LOT or ADJUSTMENT
}
```

**Transaction Type Matrix**:
```
LOT Layer (parent_lot_no IS NULL):
├── RECEIVE: Initial receipt from supplier (GRN)
├── TRANSFER_IN: Receipt from another location (creates new lot)
├── OPEN: Opening balance for new period (standardized to period average)
└── CLOSE: Closing balance revaluation (standardized to period average)

ADJUSTMENT Layer (parent_lot_no IS NOT NULL):
├── ISSUE: Consumption to production/sales (reduces parent lot)
├── ADJ_IN: Inventory increase (cannot exceed parent lot's original receipt)
├── ADJ_OUT: Inventory decrease/write-off/return (reduces parent lot)
└── TRANSFER_OUT: Transfer to another location (reduces source lot)
```

---

### API v1.2 (Phase 2 - Lot Standardization)

**Status**: 📋 **Planned - Week 3**
**Availability**: Approximately 1 week after v1.1

#### New Endpoints

**Lot Generation**:
```http
POST   /api/v1/inventory/lots/generate            # Generate lot number (returns lot_no)
POST   /api/v1/inventory/lots/validate            # Validate lot format
```

**Lot Management**:
```http
POST   /api/v1/inventory/lots                     # Create lot with auto-generation
GET    /api/v1/inventory/lots                     # List lots with filters
GET    /api/v1/inventory/lots/:lotNumber          # Get lot details
```

#### Enhanced Features

✅ **Automatic lot generation**
- System-generated lot numbers
- Sequence management per location-date
- Duplicate prevention

✅ **Lot validation**
- Format enforcement: `^[A-Z]{2,4}-\d{6}-\d{4}$`
- Pre-submission validation
- Migration validation tools

✅ **Lot queries**
- Available lot queries for FIFO
- Lot balance and history
- Lot status tracking

#### API Changes

**Lot Generation Request**:
```json
POST /api/v1/inventory/lots/generate
{
  "location_code": "MK",
  "receipt_date": "2025-01-15"
}

Response:
{
  "lot_number": "MK-250115-0001",  // Auto-generated with sequence
  "sequence": 1
}
```

---

### API v1.3 (Phase 3 - FIFO Enhancement)

**Status**: 📋 **Planned - Week 4-6**
**Availability**: Approximately 2-3 weeks after v1.2

#### New Endpoints

**Complete Traceability**:
```http
GET    /api/v1/inventory/lots/:lotNumber/lineage      # Complete parent-child tree
GET    /api/v1/inventory/lots/:lotNumber/consumption  # All consumption transactions
POST   /api/v1/inventory/consume                      # FIFO consumption with auto-linking
```

**Traceability Reports**:
```http
GET    /api/v1/reports/traceability/:lotNumber        # Lot traceability report
GET    /api/v1/reports/recall-impact/:lotNumber       # Recall impact analysis
```

#### Enhanced Features

✅ **Complete lot lineage**
- Full parent-child relationship queries
- Multi-level traceability
- Consumption history with sources

✅ **Automatic parent linkage**
- System automatically links consumption to source lots
- One-click traceability queries
- Quality recall support

✅ **Enhanced FIFO**
- Edge case handling (partial lots, same-day, zero balance)
- Negative balance prevention
- Consumption validation

#### API Changes

**Enhanced Consumption Response**:
```json
POST /api/v1/inventory/consume
{
  "item_id": "ITEM-12345",
  "location_id": "LOC-KITCHEN",
  "quantity": 120.00000
}

Response:
{
  "consumption_id": "CONS-2501-0001",
  "total_quantity": 120.00000,
  "adjustment_layers": [
    {
      "adjustment_id": "ADJ-2501-0010",
      "parent_lot_number": "MK-250115-0001",  // ⭐ Auto-linked
      "quantity": 100.00000,
      "unit_cost": 12.50000
    },
    {
      "adjustment_id": "ADJ-2501-0011",
      "parent_lot_number": "MK-250116-0001",  // ⭐ Auto-linked
      "quantity": 20.00000,
      "unit_cost": 13.00000
    }
  ]
}
```

---

### API v2.0 (Phase 4-5 - Period Management & Reporting)

**Status**: 📋 **Planned - Week 7-11**
**Availability**: Approximately 4-5 weeks after v1.3

#### New Endpoints

**Period Management** (described in detail below in this document):
```http
POST   /api/v1/periods/:periodId/close            # Close period with snapshots
POST   /api/v1/periods/:periodId/reopen           # Re-open closed period
POST   /api/v1/periods/:periodId/lock             # Permanently lock period
GET    /api/v1/periods/:periodId/status           # Get period lifecycle status
```

**Snapshot Operations**:
```http
GET    /api/v1/periods/:periodId/snapshots/summary    # Period snapshot summary
GET    /api/v1/periods/:periodId/snapshots/lots       # Lot-level snapshots
GET    /api/v1/periods/:periodId/snapshots/compare    # Compare periods
```

**Enhanced Reporting**:
```http
GET    /api/v1/reports/inventory-valuation        # Enhanced valuation with snapshots
GET    /api/v1/reports/cogs                       # COGS calculation
GET    /api/v1/reports/lot-traceability           # Complete lot lineage
GET    /api/v1/reports/period-analysis            # Period-to-period analysis
```

#### Enhanced Features

✅ **Period lifecycle management**
- Automated period close (<5 minutes)
- Period re-open functionality
- Permanent period locking

✅ **Automated revaluation (Periodic Average)**
- CLOSE transaction revalues ending inventory to period average
- OPEN transaction creates opening balance at period average
- Diff variance calculation and posting to P&L
- Standardized period-to-period costs

✅ **Automated snapshots**
- Period-end balance preservation
- Historical data accuracy
- Instant report generation

✅ **Enhanced reporting**
- Snapshot-based historical reports (<1 second)
- Period comparison analytics
- Complete audit trail
- Revaluation variance reports

✅ **Performance optimization**
- 75-90% faster queries
- Cached snapshot data
- Optimized FIFO algorithms

---

### 🔄 Migration Path

#### Current System → v1.1 (Week 1-2)

**Changes Required**: None (backward compatible)
**New Capabilities**:
- Start using transaction type filters
- Query parent lot relationships
- Check period status before posting

**Example Migration**:
```typescript
// Before (v1.0)
const transactions = await api.get('/api/v1/inventory/transactions', {
  params: { /* manual filtering needed */ }
})

// After (v1.1)
const lots = await api.get('/api/v1/inventory/transactions/by-type/LOT')
const adjustments = await api.get('/api/v1/inventory/transactions/by-type/ADJUSTMENT')
```

---

#### v1.1 → v1.2 (Week 3)

**Changes Required**: Optional (can continue manual entry)
**New Capabilities**:
- Switch to automatic lot generation
- Validate lot formats before submission
- Query available lots

**Example Migration**:
```typescript
// Before (v1.1 - Manual)
const lotNumber = `${locationCode}-${formatDate(date)}-${sequence}`
await api.post('/api/v1/inventory/transactions', {
  lot_number: lotNumber,
  // ...
})

// After (v1.2 - Automatic)
const { lot_number } = await api.post('/api/v1/inventory/lots/generate', {
  location_code: locationCode,
  receipt_date: date
})
await api.post('/api/v1/inventory/lots', {
  lot_number,  // Auto-generated
  // ...
})
```

---

#### v1.2 → v1.3 (Week 4-6)

**Changes Required**: Optional (consumption works either way)
**New Capabilities**:
- Use new consumption endpoint for auto-linking
- Query complete lot lineage
- Run traceability reports

**Example Migration**:
```typescript
// Before (v1.2 - Manual consumption tracking)
await api.post('/api/v1/inventory/transactions', {
  transaction_type: 'ADJUSTMENT',
  out_qty: 100,
  // Manual parent_lot_no tracking
})

// After (v1.3 - Automatic parent linking)
const result = await api.post('/api/v1/inventory/consume', {
  item_id: 'ITEM-12345',
  location_id: 'LOC-KITCHEN',
  quantity: 100  // System auto-links to parent lots via FIFO
})
console.log(result.adjustment_layers)  // Shows parent linkage
```

---

#### v1.3 → v2.0 (Week 7-11)

**Changes Required**: Minimal (most features are additions)
**New Capabilities**:
- Use period management endpoints
- Query snapshots for historical data
- Run enhanced analytics

**Example Migration**:
```typescript
// Before (v1.3 - Manual period close)
// Export reports manually, track period status externally

// After (v2.0 - Automated period management)
await api.post('/api/v1/periods/25-01/close', {
  costing_method: 'FIFO',
  generate_reports: true
})

// Wait for completion
const status = await api.get('/api/v1/jobs/job_123456/progress')

// Query snapshots instantly
const snapshot = await api.get('/api/v1/periods/25-01/snapshots/summary')
```

---

### 📋 Breaking Changes Policy

**Versioning Strategy**:
- v1.x releases are **backward compatible**
- No breaking changes within v1.x series
- v2.0 introduces new endpoints (no removal of v1.x endpoints)
- Deprecated endpoints supported for 12 months minimum

**Deprecation Process**:
1. Announce deprecation 6 months in advance
2. Add `X-API-Deprecated: true` header
3. Provide migration guide
4. Support old endpoints for 12 months
5. Remove after 12-month sunset period

**Current Status**: No deprecations planned. All v1.0 endpoints will remain available.

---

### 🎯 Recommended Adoption Strategy

**For New Projects**:
- Start with v1.0 (production-ready)
- Prepare for v1.1 transaction types
- Plan for v1.2 automatic lot generation
- Adopt v1.3 consumption endpoint when available
- Integrate v2.0 period management as needed

**For Existing Systems**:
- Continue using v1.0 endpoints (no changes required)
- Gradually adopt v1.1+ features as they become available
- Test new endpoints in development environment first
- Migrate to new features incrementally by module

---

<div style="color: #FFD700;">

## Purpose

This document provides comprehensive API reference for lot-based inventory costing operations in the Carmen ERP system, including lot layer management, FIFO consumption, period management, and snapshot operations.

## API Overview

### Base URL

```
Production: https://api.carmen-erp.com/v1
Development: http://localhost:3000/api/v1
```

### Authentication

All API requests require authentication using JWT tokens:

```http
Authorization: Bearer <jwt_token>
```

**Token Acquisition**:
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "USER-001",
    "role": "financial-manager",
    "permissions": ['inventory.read', 'inventory.write', 'period.manage']
  }
}
```

### Common Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
X-Request-ID: <unique_request_id>
```

### Response Format

All responses follow this structure:

**Success Response**:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-20T10:30:00Z",
    "request_id": "req_123456"
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2025-01-20T10:30:00Z",
    "request_id": "req_123456"
  }
}
```

## Lot Layer Management

### Create LOT Layer (GRN Receipt)

**Endpoint**: `POST /api/v1/inventory/lots`

**Purpose**: Create new lot layer from GRN receipt

**Authorization**: `inventory.write` permission

**Request Body**:
```json
{
  "item_id": "ITEM-12345",
  "location_id": "LOC-KITCHEN",
  "location_code": "MK",
  "receipt_date": "2025-01-15",  // Used for lot_number generation only
  "receipt_quantity": 100.00000,
  "unit_cost": 12.50000,
  "transaction_type": "GRN",
  "transaction_id": "GRN-2501-0001",
  "landed_costs": {
    "freight": 50.00,
    "duties": 25.00,
    "handling": 15.00
  }
}
```

**Response**: `201 Created`
```json
{
  "success": true,
  "data": {
    "lot_number": "MK-250115-0001",  // Format: {LOCATION}-{YYMMDD}-{SEQ}
    "item_id": "ITEM-12345",
    "location_id": "LOC-KITCHEN",
    "location_code": "MK",
    "receipt_date": "2025-01-15",  // Derived from lot_number
    "receipt_quantity": 100.00000,
    "remaining_quantity": 100.00000,
    "unit_cost": 12.50000,
    "total_cost": 1250.00000,
    "transaction_type": "GRN",
    "transaction_id": "GRN-2501-0001",
    "created_at": "2025-01-15T14:30:00Z",
    "created_by": "USER-001"
  },
  "meta": {
    "timestamp": "2025-01-15T14:30:00Z",
    "request_id": "req_123456",
    "note": "receipt_date is embedded in lot_number, not stored separately"
  }
}
```

**Errors**:
- `400 BAD_REQUEST`: Invalid input data
- `401 UNAUTHORIZED`: Missing or invalid authentication
- `403 FORBIDDEN`: Insufficient permissions
- `409 CONFLICT`: Duplicate lot number
- `422 UNPROCESSABLE_ENTITY`: Period closed or locked

### Get Lot Details

**Endpoint**: `GET /api/v1/inventory/lots/{lot_number}`

**Purpose**: Retrieve detailed information about a specific lot

**Authorization**: `inventory.read` permission

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "lot_number": "MK-250115-0001",  // Format: {LOCATION}-{YYMMDD}-{SEQ}
    "item_id": "ITEM-12345",
    "item_name": "Chicken Breast",
    "location_id": "LOC-KITCHEN",
    "location_name": "Kitchen",
    "location_code": "MK",
    "receipt_date": "2025-01-15",  // Derived from lot_number
    "receipt_quantity": 100.00000,
    "remaining_quantity": 75.00000,
    "consumed_quantity": 25.00000,
    "unit_cost": 12.50000,
    "total_cost": 1250.00000,
    "remaining_value": 937.50000,
    "transaction_type": "GRN",
    "transaction_id": "GRN-2501-0001",
    "status": "ACTIVE",
    "adjustments": [
      {
        "adjustment_id": "ADJ-LAYER-2501-0001",
        "transaction_type": "ISSUE",
        "transaction_id": "SR-2501-0001",
        "transaction_date": "2025-01-20",
        "quantity": 25.00000,
        "total_cost": 312.50000
      }
    ]
  }
}
```

### Query Available Lots (FIFO)

**Endpoint**: `GET /api/v1/inventory/lots/available`

**Purpose**: Get available lots for FIFO consumption

**Authorization**: `inventory.read` permission

**Query Parameters**:
- `item_id` (required): Item identifier
- `location_id` (required): Location identifier
- `min_quantity` (optional): Minimum quantity needed

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "lots": [
      {
        "lot_number": "MK-250115-0001",  // Format: {LOCATION}-{YYMMDD}-{SEQ}
        "receipt_date": "2025-01-15",  // Derived from lot_number
        "remaining_quantity": 75.00000,
        "unit_cost": 12.50000,
        "age_days": 5
      },
      {
        "lot_number": "MK-250116-0001",
        "receipt_date": "2025-01-16",  // Derived from lot_number
        "remaining_quantity": 30.00000,
        "unit_cost": 13.00000,
        "age_days": 4
      }
    ],
    "total_available": 105.00000,
    "weighted_average_cost": 12.64286,
    "note": "Lots ordered by lot_number ASC for FIFO (natural chronological sort)"
  }
}
```

## FIFO Consumption

### Consume Inventory (FIFO)

**Endpoint**: `POST /api/v1/inventory/consume`

**Purpose**: Consume inventory using FIFO algorithm, creating adjustment layers

**Authorization**: `inventory.write` permission

**Request Body**:
```json
{
  "item_id": "ITEM-12345",
  "location_id": "LOC-KITCHEN",
  "quantity": 120.00000,
  "transaction_type": "ISSUE",
  "transaction_id": "SR-2501-0001",
  "transaction_date": "2025-01-20",
  "reason_code": "PRODUCTION",
  "notes": "Recipe: Chicken Curry - Batch 001"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "consumption_id": "CONS-2501-0001",
    "item_id": "ITEM-12345",
    "location_id": "LOC-KITCHEN",
    "total_quantity": 120.00000,
    "total_cost": 1510.00000,
    "weighted_average_cost": 12.58333,
    "adjustment_layers": [
      {
        "adjustment_id": "ADJ-LAYER-2501-0010",
        "parent_lot_number": "MK-250115-0001",  // Format: {LOCATION}-{YYMMDD}-{SEQ}
        "quantity": 100.00000,
        "unit_cost": 12.50000,
        "total_cost": 1250.00000
      },
      {
        "adjustment_id": "ADJ-LAYER-2501-0011",
        "parent_lot_number": "MK-250116-0001",
        "quantity": 20.00000,
        "unit_cost": 13.00000,
        "total_cost": 260.00000
      }
    ],
    "lots_affected": [
      {
        "lot_number": "MK-250115-0001",  // Oldest lot consumed first (FIFO)
        "previous_remaining": 100.00000,
        "consumed": 100.00000,
        "new_remaining": 0.00000,
        "status": "EXHAUSTED"
      },
      {
        "lot_number": "MK-250116-0001",  // Second oldest lot partially consumed
        "previous_remaining": 50.00000,
        "consumed": 20.00000,
        "new_remaining": 30.00000,
        "status": "ACTIVE"
      }
    ],
    "note": "FIFO consumption ordered by lot_number ASC (natural chronological sort)"
  }
}
```

**Errors**:
- `400 BAD_REQUEST`: Invalid input data
- `409 CONFLICT`: Insufficient inventory
- `422 UNPROCESSABLE_ENTITY`: Period closed

## Transfer Operations

### Execute Transfer

**Endpoint**: `POST /api/v1/inventory/transfers`

**Purpose**: Execute inventory transfer from source to destination

**Authorization**: `inventory.write` permission

**Request Body**:
```json
{
  "item_id": "ITEM-12345",
  "source_location_id": "LOC-KITCHEN",
  "destination_location_id": "LOC-BAR",
  "quantity": 50.00000,
  "transfer_date": "2025-01-20",
  "transfer_id": "TRANSFER-2501-0001",
  "reason": "Stock redistribution",
  "authorized_by": "USER-002"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "transfer_id": "TRANSFER-2501-0001",
    "item_id": "ITEM-12345",
    "quantity": 50.00000,
    "total_cost": 625.00000,
    "unit_cost": 12.50000,

    "source": {
      "location_id": "LOC-KITCHEN",
      "location_code": "MK",
      "adjustment_layers": [
        {
          "adjustment_id": "ADJ-LAYER-2501-0009",
          "parent_lot_number": "MK-250115-0001",  // Format: {LOCATION}-{YYMMDD}-{SEQ}
          "quantity": 50.00000,
          "total_cost": 625.00000
        }
      ],
      "lots_affected": [
        {
          "lot_number": "MK-250115-0001",  // Source lot (FIFO)
          "previous_remaining": 75.00000,
          "transferred_out": 50.00000,
          "new_remaining": 25.00000
        }
      ]
    },

    "destination": {
      "location_id": "LOC-BAR",
      "location_code": "BAR",
      "new_lot": {
        "lot_number": "BAR-250120-0001",  // New lot at destination: {LOCATION}-{YYMMDD}-{SEQ}
        "receipt_date": "2025-01-20",  // Transfer date becomes receipt date
        "receipt_quantity": 50.00000,
        "remaining_quantity": 50.00000,
        "unit_cost": 12.50000,
        "total_cost": 625.00000
      }
    },
    "note": "Transfer creates new lot at destination with transfer date as receipt date"
  }
}
```

## Period Management

### Get Current Period

**Endpoint**: `GET /api/v1/periods/current`

**Purpose**: Retrieve current open period information

**Authorization**: `inventory.read` permission

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "period_id": "25-01",  // Format: YY-MM
    "period_name": "January 2025",
    "fiscal_year": 2025,
    "fiscal_month": 1,
    "start_date": "2025-01-01",
    "end_date": "2025-01-31",
    "status": "OPEN",
    "days_remaining": 11,
    "transaction_count": 1523,
    "total_value": 458762.50
  }
}
```

### Close Period

**Endpoint**: `POST /api/v1/periods/{period_id}/close`

**Purpose**: Close period, create snapshots, and perform revaluation (if Periodic Average costing)

**Authorization**: `period.manage` permission

**Request Body**:
```json
{
  "costing_method": "FIFO",           // or "PERIODIC_AVERAGE"
  "generate_reports": true,
  "notify_stakeholders": true,
  "enable_revaluation": true,         // ⭐ NEW: Enable period-end revaluation (Periodic Average only)
  "validation": {
    "skip_warnings": false
  }
}
```

**Revaluation Process** (when `costing_method: "PERIODIC_AVERAGE"` and `enable_revaluation: true`):
1. Calculate final period average from all RECEIVE transactions
2. Generate CLOSE transaction for each item-location with remaining inventory
3. Revalue ending inventory: `Revalued Amount = Period Average × Remaining Qty`
4. Calculate Diff variance: `Diff = Revalued Amount - Book Value at Actual Costs`
5. Post Diff to revaluation variance account in P&L
6. Generate OPEN transaction for next period at period average cost

**Response**: `202 Accepted`
```json
{
  "success": true,
  "data": {
    "period_id": "25-01",  // Format: YY-MM
    "status": "PROCESSING",
    "job_id": "job_123456",
    "estimated_completion": "2025-02-01T15:00:00Z",
    "progress_url": "/api/v1/jobs/job_123456/progress"
  }
}
```

**Async Status Check**:
```http
GET /api/v1/jobs/job_123456/progress

Response:
{
  "success": true,
  "data": {
    "job_id": "job_123456",
    "status": "COMPLETED",
    "progress": 100,
    "snapshots_created": 1523,
    "total_inventory_value": 458762.50,
    "costing_method": "PERIODIC_AVERAGE",
    "revaluation": {                    // ⭐ NEW: Revaluation summary
      "enabled": true,
      "period_average_cost": 11.11,
      "items_revalued": 248,
      "locations_affected": 12,
      "close_transactions_created": 248,
      "open_transactions_created": 248,
      "total_diff_variance": 2785.50,
      "diff_variance_posted_to": "Account-5100-Revaluation-Variance",
      "revaluation_journal_entry": "JE-2501-0234"
    },
    "reports_generated": [
      "inventory-valuation-2025-01.pdf",
      "period-movement-2025-01.pdf",
      "cogs-summary-2025-01.pdf",
      "revaluation-variance-2025-01.pdf"  // ⭐ NEW: Revaluation report
    ],
    "completed_at": "2025-02-01T14:45:32Z"
  }
}
```

### Re-Open Period

**Endpoint**: `POST /api/v1/periods/{period_id}/reopen`

**Purpose**: Re-open most recent closed period

**Authorization**: `period.manage` permission (financial-manager or system-admin)

**Request Body**:
```json
{
  "reason": "Missed GRN transaction from January 28th. Need to post receipt for PO-2501-0156 (50 units of ITEM-789 @ $15.25). Transaction was approved but not entered in system before period close."
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "period_id": "25-01",  // Format: YY-MM
    "previous_status": "CLOSED",
    "new_status": "OPEN",
    "reopened_at": "2025-02-05T10:15:00Z",
    "reopened_by": "USER-002",
    "reopen_count": 1,
    "reason": "Missed GRN transaction from January 28th..."
  }
}
```

### Lock Period

**Endpoint**: `POST /api/v1/periods/{period_id}/lock`

**Purpose**: Permanently lock period (no re-opening)

**Authorization**: `period.manage` permission

**Request Body**:
```json
{
  "confirmation": "LOCK_PERIOD_PERMANENT",
  "reason": "External audit completed, financial statements finalized"
}
```

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "period_id": "25-01",  // Format: YY-MM
    "previous_status": "CLOSED",
    "new_status": "LOCKED",
    "locked_at": "2025-03-01T00:00:00Z",
    "locked_by": "USER-003",
    "reason": "External audit completed..."
  }
}
```

### Get Revaluation Transactions

**Endpoint**: `GET /api/v1/periods/{period_id}/revaluation`

**Purpose**: Retrieve CLOSE and OPEN transactions created during period-end revaluation

**Authorization**: `inventory.read` permission

**Query Parameters**:
- `item_id` (optional): Filter by item
- `location_id` (optional): Filter by location
- `transaction_type` (optional): Filter by CLOSE or OPEN
- `page` (default: 1)
- `per_page` (default: 50, max: 500)

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "period_id": "25-01",
    "costing_method": "PERIODIC_AVERAGE",
    "revaluation_date": "2025-02-01T00:00:00Z",
    "period_average_cost": 11.11,

    "transactions": [
      {
        "transaction_id": "CLOSE-25-01-ITEM-001",
        "transaction_type": "CLOSE",
        "transaction_date": "2025-01-31",
        "item_id": "ITEM-12345",
        "item_name": "Chicken Breast",
        "location_id": "LOC-KITCHEN",
        "location_code": "MK",
        "lot_number": "MK-250131-CLOSE",  // Special lot for CLOSE transaction
        "parent_lot_no": null,              // LOT layer (no parent)
        "layer_type": "LOT",

        "book_value_before": 2750.00,      // Inventory at actual costs
        "revalued_amount": 2777.50,        // Inventory at period average
        "diff_variance": 27.50,             // Revaluation variance (posted to P&L)
        "remaining_qty": 250.00000,
        "unit_cost_before": 11.00,         // Weighted average of actual costs
        "unit_cost_after": 11.11,          // Period average cost

        "variance_account": "Account-5100-Revaluation-Variance",
        "journal_entry_id": "JE-2501-0234"
      },
      {
        "transaction_id": "OPEN-25-02-ITEM-001",
        "transaction_type": "OPEN",
        "transaction_date": "2025-02-01",
        "item_id": "ITEM-12345",
        "item_name": "Chicken Breast",
        "location_id": "LOC-KITCHEN",
        "location_code": "MK",
        "lot_number": "MK-250201-OPEN",    // Special lot for OPEN transaction
        "parent_lot_no": null,              // LOT layer (no parent)
        "layer_type": "LOT",

        "opening_balance_qty": 250.00000,
        "opening_balance_cost": 2777.50,
        "unit_cost": 11.11,                 // Standardized to period average

        "note": "Opening balance standardized to period average cost"
      }
    ],

    "summary": {
      "total_close_transactions": 248,
      "total_open_transactions": 248,
      "total_diff_variance": 2785.50,
      "variance_breakdown": {
        "positive_variance": 1850.25,      // Inventory increased in value
        "negative_variance": -935.25       // Inventory decreased in value (shown as negative)
      }
    },

    "pagination": {
      "current_page": 1,
      "per_page": 50,
      "total_pages": 10,
      "total_records": 496
    }
  }
}
```

### Get Revaluation Variance Report

**Endpoint**: `GET /api/v1/periods/{period_id}/revaluation/variance`

**Purpose**: Detailed revaluation variance analysis by item and location

**Authorization**: `reports.read` permission

**Query Parameters**:
- `item_id` (optional): Filter by item
- `location_id` (optional): Filter by location
- `min_variance` (optional): Filter by minimum absolute variance
- `format` (optional): json, pdf, xlsx

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "period_id": "25-01",
    "costing_method": "PERIODIC_AVERAGE",
    "period_average_cost": 11.11,
    "revaluation_date": "2025-01-31",

    "variance_by_item": [
      {
        "item_id": "ITEM-12345",
        "item_name": "Chicken Breast",
        "item_category": "Proteins",

        "locations": [
          {
            "location_id": "LOC-KITCHEN",
            "location_name": "Kitchen",
            "location_code": "MK",

            "book_value_before": 2750.00,
            "revalued_amount": 2777.50,
            "diff_variance": 27.50,
            "variance_percentage": 1.00,

            "remaining_qty": 250.00000,
            "weighted_avg_cost_before": 11.00,
            "period_avg_cost": 11.11,
            "cost_difference": 0.11
          },
          {
            "location_id": "LOC-BAR",
            "location_name": "Bar",
            "location_code": "BAR",

            "book_value_before": 1800.00,
            "revalued_amount": 1777.60,
            "diff_variance": -22.40,
            "variance_percentage": -1.24,

            "remaining_qty": 160.00000,
            "weighted_avg_cost_before": 11.25,
            "period_avg_cost": 11.11,
            "cost_difference": -0.14
          }
        ],

        "total_variance": 5.10
      }
    ],

    "summary": {
      "items_revalued": 248,
      "locations_affected": 12,
      "total_diff_variance": 2785.50,
      "largest_positive_variance": {
        "item_id": "ITEM-789",
        "location_id": "LOC-KITCHEN",
        "variance": 285.50
      },
      "largest_negative_variance": {
        "item_id": "ITEM-456",
        "location_id": "LOC-BAR",
        "variance": -185.25
      }
    }
  }
}
```

## Period Snapshots

### Get Period Snapshot Summary

**Endpoint**: `GET /api/v1/periods/{period_id}/snapshots/summary`

**Purpose**: Get aggregate snapshot data for period

**Authorization**: `inventory.read` permission

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "period_id": "25-01",  // Format: YY-MM
    "snapshot_date": "2025-02-01T00:00:00Z",
    "status": "FINALIZED",
    "costing_method": "FIFO",

    "summary": {
      "total_items": 248,
      "total_locations": 12,
      "total_lots": 1523,

      "opening_balance": {
        "quantity": 12450.00000,
        "value": 425380.00
      },

      "movements": {
        "receipts": {
          "quantity": 3250.00000,
          "value": 98750.00
        },
        "issues": {
          "quantity": 2890.00000,
          "value": 87650.00
        },
        "transfers_in": {
          "quantity": 450.00000,
          "value": 14280.00
        },
        "transfers_out": {
          "quantity": 520.00000,
          "value": 16420.00
        },
        "adjustments": {
          "quantity": 15.00000,
          "value": 425.00
        }
      },

      "closing_balance": {
        "quantity": 12755.00000,
        "value": 435765.00
      }
    }
  }
}
```

### Get Lot-Level Snapshots

**Endpoint**: `GET /api/v1/periods/{period_id}/snapshots/lots`

**Purpose**: Get detailed lot-level snapshots (FIFO method)

**Authorization**: `inventory.read` permission

**Query Parameters**:
- `item_id` (optional): Filter by item
- `location_id` (optional): Filter by location
- `status` (optional): Filter by lot status (ACTIVE, EXHAUSTED)
- `page` (default: 1): Page number
- `per_page` (default: 50, max: 500): Results per page

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "snapshots": [
      {
        "snapshot_id": "SNAP-25-01-LOT-001",
        "period_id": "25-01",  // Format: YY-MM
        "item_id": "ITEM-12345",
        "item_name": "Chicken Breast",
        "location_id": "LOC-KITCHEN",
        "location_code": "MK",
        "lot_number": "MK-250115-0001",  // Format: {LOCATION}-{YYMMDD}-{SEQ}

        "opening": {
          "quantity": 100.00000,
          "unit_cost": 12.50000,
          "total_cost": 1250.00000
        },

        "movements": {
          "receipts": 0,
          "issues": 75.00000,
          "adjustments": 0,
          "transfers_in": 0,
          "transfers_out": 0
        },

        "closing": {
          "quantity": 25.00000,
          "unit_cost": 12.50000,
          "total_cost": 312.50000
        },

        "status": "ACTIVE"
      }
      // ... more snapshots
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 50,
      "total_pages": 31,
      "total_records": 1523
    }
  }
}
```

## Reporting and Analytics

### Inventory Valuation Report

**Endpoint**: `GET /api/v1/reports/inventory-valuation`

**Purpose**: Get current inventory valuation

**Authorization**: `reports.read` permission

**Query Parameters**:
- `as_of_date` (optional): Valuation as of specific date
- `location_id` (optional): Filter by location
- `category_id` (optional): Filter by product category
- `format` (optional): json, pdf, xlsx

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "report_date": "2025-01-20",
    "costing_method": "FIFO",
    "total_value": 458762.50,

    "by_location": [
      {
        "location_id": "LOC-KITCHEN",
        "location_name": "Kitchen",
        "item_count": 156,
        "lot_count": 892,
        "total_quantity": 8450.00000,
        "total_value": 285430.00
      },
      {
        "location_id": "LOC-BAR",
        "location_name": "Bar",
        "item_count": 92,
        "lot_count": 631,
        "total_quantity": 4305.00000,
        "total_value": 173332.50
      }
    ],

    "by_category": [
      {
        "category_id": "CAT-001",
        "category_name": "Proteins",
        "item_count": 48,
        "total_value": 195250.00,
        "percentage": 42.5
      },
      {
        "category_id": "CAT-002",
        "category_name": "Vegetables",
        "item_count": 85,
        "total_value": 87430.00,
        "percentage": 19.1
      }
    ]
  }
}
```

### Cost of Goods Sold (COGS)

**Endpoint**: `GET /api/v1/reports/cogs`

**Purpose**: Calculate COGS for period

**Authorization**: `reports.read` permission

**Query Parameters**:
- `period_id` (required): Period identifier
- `location_id` (optional): Filter by location
- `category_id` (optional): Filter by category

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "period_id": "25-01",  // Format: YY-MM
    "costing_method": "FIFO",

    "calculation": {
      "opening_inventory": 425380.00,
      "purchases": 98750.00,
      "goods_available": 524130.00,
      "closing_inventory": 435765.00,
      "cogs": 88365.00
    },

    "breakdown": {
      "issues": 87650.00,
      "transfers_out": 16420.00,
      "transfers_in": -14280.00,
      "adjustments": -1425.00
    },

    "by_location": [
      {
        "location_id": "LOC-KITCHEN",
        "location_name": "Kitchen",
        "cogs": 58240.00
      },
      {
        "location_id": "LOC-BAR",
        "location_name": "Bar",
        "cogs": 30125.00
      }
    ]
  }
}
```

### Inventory Movement Report

**Endpoint**: `GET /api/v1/reports/movements`

**Purpose**: Get detailed inventory movements for period

**Authorization**: `reports.read` permission

**Query Parameters**:
- `period_id` (required): Period identifier
- `item_id` (optional): Filter by item
- `location_id` (optional): Filter by location
- `transaction_type` (optional): Filter by type
- `page` (default: 1)
- `per_page` (default: 100)

**Response**: `200 OK`
```json
{
  "success": true,
  "data": {
    "period_id": "25-01",  // Format: YY-MM
    "movements": [
      {
        "transaction_id": "GRN-2501-0001",
        "transaction_type": "GRN",
        "transaction_date": "2025-01-15",
        "item_id": "ITEM-12345",
        "item_name": "Chicken Breast",
        "location_id": "LOC-KITCHEN",
        "location_code": "MK",
        "lot_number": "MK-250115-0001",  // Format: {LOCATION}-{YYMMDD}-{SEQ}
        "quantity": 100.00000,
        "unit_cost": 12.50000,
        "total_cost": 1250.00000,
        "movement_type": "RECEIPT"
      },
      {
        "transaction_id": "SR-2501-0001",
        "transaction_type": "ISSUE",
        "transaction_date": "2025-01-20",
        "item_id": "ITEM-12345",
        "item_name": "Chicken Breast",
        "location_id": "LOC-KITCHEN",
        "location_code": "MK",
        "lot_number": "MK-250115-0001",  // Format: {LOCATION}-{YYMMDD}-{SEQ}
        "quantity": 25.00000,
        "unit_cost": 12.50000,
        "total_cost": 312.50000,
        "movement_type": "ISSUE"
      }
      // ... more movements
    ],
    "pagination": {
      "current_page": 1,
      "per_page": 100,
      "total_pages": 35,
      "total_records": 3489
    }
  }
}
```

## Error Codes

### Standard HTTP Status Codes

| Status Code | Meaning | Usage |
|------------|---------|-------|
| `200 OK` | Success | Successful GET, PUT, PATCH requests |
| `201 Created` | Resource created | Successful POST request |
| `202 Accepted` | Async processing | Long-running operations accepted |
| `204 No Content` | Success, no data | Successful DELETE request |
| `400 Bad Request` | Invalid input | Validation errors, malformed request |
| `401 Unauthorized` | Auth required | Missing or invalid token |
| `403 Forbidden` | Insufficient permissions | User lacks required permission |
| `404 Not Found` | Resource not found | Invalid ID or URL |
| `409 Conflict` | Business rule violation | Duplicate, insufficient inventory |
| `422 Unprocessable Entity` | Validation failed | Period closed, data integrity |
| `429 Too Many Requests` | Rate limit exceeded | Too many requests |
| `500 Internal Server Error` | Server error | Unexpected errors |
| `503 Service Unavailable` | Service down | Maintenance, overload |

### Application Error Codes

| Error Code | HTTP Status | Description | Resolution |
|-----------|-------------|-------------|------------|
| `INSUFFICIENT_INVENTORY` | 409 | Not enough inventory for consumption | Reduce quantity or wait for receipt |
| `LOT_NOT_FOUND` | 404 | Lot number doesn't exist | Verify lot number |
| `PERIOD_CLOSED` | 422 | Cannot post to closed period | Request period re-open |
| `PERIOD_LOCKED` | 422 | Period permanently locked | Post to current period |
| `INVALID_LOT_NUMBER` | 400 | Lot number format invalid | Use correct format |
| `DUPLICATE_LOT_NUMBER` | 409 | Lot number already exists | System will auto-generate |
| `UNAUTHORIZED_ACTION` | 403 | User lacks permission | Request authorization |
| `INVALID_STATUS_TRANSITION` | 422 | Status transition not allowed | Follow proper workflow |
| `VALIDATION_ERROR` | 400 | Input validation failed | Check error details |
| `NEGATIVE_REMAINING_QTY` | 422 | Would result in negative inventory | Check calculations |

### Error Response Example

```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_INVENTORY",
    "message": "Not enough inventory to fulfill consumption request",
    "details": {
      "item_id": "ITEM-12345",
      "location_id": "LOC-KITCHEN",
      "requested": 120.00000,
      "available": 105.00000,
      "shortfall": 15.00000
    }
  },
  "meta": {
    "timestamp": "2025-01-20T10:30:00Z",
    "request_id": "req_123456"
  }
}
```

## Rate Limiting

### Rate Limits by Endpoint Type

| Endpoint Type | Rate Limit | Window |
|--------------|------------|--------|
| **Read Operations** | 1000 requests | per 15 minutes |
| **Write Operations** | 200 requests | per 15 minutes |
| **Period Management** | 50 requests | per 15 minutes |
| **Reports** | 100 requests | per 15 minutes |

### Rate Limit Headers

```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 987
X-RateLimit-Reset: 1643644800
```

### Rate Limit Exceeded Response

```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "limit": 1000,
      "window": "15 minutes",
      "reset_at": "2025-01-20T11:00:00Z"
    }
  }
}
```

## Pagination

### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (1-based) |
| `per_page` | integer | 50 | Results per page (max 500) |
| `sort_by` | string | varies | Sort field |
| `sort_order` | string | asc | Sort direction (asc, desc) |

### Pagination Response

```json
{
  "pagination": {
    "current_page": 2,
    "per_page": 50,
    "total_pages": 31,
    "total_records": 1523,
    "has_next_page": true,
    "has_previous_page": true,
    "next_page_url": "/api/v1/resource?page=3&per_page=50",
    "previous_page_url": "/api/v1/resource?page=1&per_page=50"
  }
}
```

## Versioning

### API Version Strategy

**Current Version**: `v1`

**Version Format**: `/api/v{major_version}/`

**Deprecation Policy**:
- Breaking changes require new major version
- Minor versions backward compatible
- Deprecated endpoints supported for 12 months
- Deprecation warnings in response headers

### Version Headers

```http
X-API-Version: 1.0.0
X-API-Deprecated: false
X-API-Sunset: 2026-01-01  # If deprecated
```

## Webhooks

### Webhook Events

Subscribe to real-time notifications:

| Event | Description | Payload |
|-------|-------------|---------|
| `lot.created` | New lot layer created | Lot details |
| `lot.exhausted` | Lot fully consumed | Lot number, final stats |
| `period.closed` | Period closed | Period ID, snapshot summary |
| `period.reopened` | Period re-opened | Period ID, reason |
| `snapshot.created` | Snapshot finalized | Snapshot summary |
| `inventory.low` | Inventory below threshold | Item, location, quantity |

### Webhook Configuration

**Endpoint**: `POST /api/v1/webhooks`

**Request Body**:
```json
{
  "url": "https://your-server.com/webhooks/carmen",
  "events": ['lot.created', 'lot.exhausted', 'period.closed'],
  "secret": "your_webhook_secret",
  "active": true
}
```

### Webhook Payload Example

```json
{
  "event": "lot.created",
  "timestamp": "2025-01-15T14:30:00Z",
  "data": {
    "lot_number": "MK-250115-0001",  // Format: {LOCATION}-{YYMMDD}-{SEQ}
    "item_id": "ITEM-12345",
    "location_id": "LOC-KITCHEN",
    "location_code": "MK",
    "receipt_date": "2025-01-15",  // Derived from lot_number
    "receipt_quantity": 100.00000,
    "unit_cost": 12.50000
  },
  "signature": "sha256=abc123..."  # HMAC signature for verification
}
```

## Best Practices

### API Usage Guidelines

1. **Authentication**:
   - Store JWT tokens securely
   - Refresh tokens before expiration
   - Never share tokens between users

2. **Error Handling**:
   - Always check `success` field
   - Log error details for troubleshooting
   - Implement exponential backoff for retries

3. **Performance**:
   - Use pagination for large datasets
   - Cache frequently accessed data
   - Batch operations when possible

4. **Idempotency**:
   - Include `X-Request-ID` header
   - Retry failed requests safely
   - System prevents duplicate lot creation

5. **Testing**:
   - Use development environment for testing
   - Never test in production
   - Validate responses match expectations

### Code Examples

**Node.js / TypeScript**:
```typescript
import axios from 'axios'

const apiClient = axios.create({
  baseURL: 'https://api.carmen-erp.com/v1',
  headers: {
    'Authorization': `Bearer ${process.env.API_TOKEN}`,
    'Content-Type': 'application/json'
  }
})

// Create lot layer
async function createLot(lotData: CreateLotRequest) {
  try {
    const response = await apiClient.post('/inventory/lots', lotData)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('API Error:', error.response?.data)
      throw new Error(error.response?.data?.error?.message)
    }
    throw error
  }
}

// Consume inventory (FIFO)
async function consumeInventory(consumeData: ConsumeRequest) {
  try {
    const response = await apiClient.post('/inventory/consume', consumeData)
    return response.data
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const apiError = error.response?.data?.error
      if (apiError?.code === 'INSUFFICIENT_INVENTORY') {
        // Handle insufficient inventory
        console.error('Not enough inventory:', apiError.details)
      }
      throw error
    }
    throw error
  }
}
```

**Python**:
```python
import requests
from typing import Dict, Any

class CarmenAPI:
    def __init__(self, base_url: str, token: str):
        self.base_url = base_url
        self.headers = {
            'Authorization': f'Bearer {token}',
            'Content-Type': 'application/json'
        }

    def create_lot(self, lot_data: Dict[str, Any]) -> Dict[str, Any]:
        response = requests.post(
            f'{self.base_url}/inventory/lots',
            json=lot_data,
            headers=self.headers
        )
        response.raise_for_status()
        return response.json()

    def consume_inventory(self, consume_data: Dict[str, Any]) -> Dict[str, Any]:
        try:
            response = requests.post(
                f'{self.base_url}/inventory/consume',
                json=consume_data,
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()
        except requests.exceptions.HTTPError as e:
            error_data = e.response.json()
            if error_data['error']['code'] == 'INSUFFICIENT_INVENTORY':
                print(f"Insufficient inventory: {error_data['error']['details']}")
            raise

# Usage
api = CarmenAPI('https://api.carmen-erp.com/v1', 'your_token')
result = api.create_lot({
    'item_id': 'ITEM-12345',
    'location_id': 'LOC-KITCHEN',
    'receipt_quantity': 100.0,
    'unit_cost': 12.50
})
```

---

**Version**: 1.0.0
**Last Updated**: 2025-11-03
**Status**: Active
**Maintained By**: API Team
**Support**: api-support@carmen-erp.com

---

## Document Revision Notes

**Version 1.0.0** (2025-11-03):
- Initial creation of lot-based costing API reference
- Comprehensive endpoint documentation for lot layer management
- FIFO consumption API with adjustment layer creation
- Transfer operation endpoints (source and destination)
- Period management APIs (close, re-open, lock)
- Period snapshot retrieval endpoints
- Reporting and analytics APIs
- Complete error code reference
- Rate limiting and pagination specifications
- API versioning and webhook support
- Code examples in multiple languages
- Best practices for API usage

</div>
