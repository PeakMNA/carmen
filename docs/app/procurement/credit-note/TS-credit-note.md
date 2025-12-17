# Technical Specification: Credit Note

## Module Information
- **Module**: Procurement
- **Sub-Module**: Credit Note
- **Route**: `/procurement/credit-note`
- **Version**: 1.0.4
- **Last Updated**: 2025-12-03
- **Owner**: Procurement Team
- **Status**: Approved

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.4 | 2025-12-03 | Documentation Team | Updated to support configurable costing method (FIFO or Periodic Average) per system settings |
| 1.0.3 | 2025-12-03 | Documentation Team | Added Shared Service Integration section with references to SM-inventory-valuation and SM-inventory-operations |
| 1.0.2 | 2025-12-03 | Documentation Team | Added Server Actions Architecture section per BR-BE-001 through BR-BE-014 |
| 1.0.1 | 2025-12-03 | Documentation Team | Document history update for consistency across documentation set |
| 1.0.0 | 2025-01-11 | Documentation Team | Initial version from source code analysis |

---

## Overview

This technical specification describes the implementation of the Credit Note module using Next.js 14 App Router, React, TypeScript, and Supabase. The module implements two distinct credit note types (quantity-based returns with configurable inventory costing and amount-based discounts), vendor and GRN selection workflows, inventory lot tracking, automatic journal entry generation, and tax calculations.

**Costing Method**: The system supports two inventory costing methods configured at the system level:
- **FIFO (First-In-First-Out)**: Costs calculated using oldest inventory layers first
- **Periodic Average**: Costs calculated using weighted average for the period

**⚠️ IMPORTANT: This is a Technical Specification Document - TEXT FORMAT ONLY**
- **DO NOT include actual code** - describe implementation patterns in text
- **DO NOT include TypeScript/JavaScript code** - describe component responsibilities
- **DO NOT include SQL code** - refer to DD (Data Definition) document for database descriptions
- **DO include**: Architecture descriptions, component responsibilities, data flow descriptions, integration patterns
- **Focus on**: WHAT components do, HOW they interact, WHERE data flows - all in descriptive text

**Related Documents**:
- [Business Requirements](./BR-credit-note.md) - Requirements in text format (no code)
- [Use Cases](./UC-credit-note.md) - Use cases in text format (no code)
- [Data Definition](./DD-credit-note.md) - Data definitions in text format (no SQL code)
- [Flow Diagrams](./FD-credit-note.md) - Visual diagrams (no code)
- [Validations](./VAL-credit-note.md) - Validation rules in text format (no code)

---

## Sitemap

### Overview
This section provides a complete navigation structure of all pages, tabs, and dialogues in the Credit Notes sub-module.

### Page Hierarchy

```mermaid
graph TD
    ListPage['List Page<br>(/procurement/credit-note)']
    CreatePage['Create Page<br>(/procurement/credit-note/new)']
    DetailPage["Detail Page<br>(/procurement/credit-note/[id])"]
    EditPage["Edit Page<br>(/procurement/credit-note/[id]/edit)"]

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
**Route**: `/procurement/credit-note`
**File**: `page.tsx`
**Purpose**: Display paginated list of all credit notes

**Sections**:
- Header: Title, breadcrumbs, primary actions
- Filters: Quick filters, advanced filter panel
- Search: Global search with autocomplete
- Data Table: Sortable columns, row actions, bulk selection
- Pagination: Page size selector, page navigation

**Tabs**:
- **All Items**: Complete list of all credit notes
- **Active**: Filter active items only
- **Archived**: View archived items

**Dialogues**:
- **Quick Create**: Fast creation form with essential fields only
- **Bulk Actions**: Multi-select actions (delete, export, status change)
- **Export**: Export data in various formats (CSV, Excel, PDF)
- **Filter**: Advanced filtering with multiple criteria

#### 2. Detail Page
**Route**: `/procurement/credit-note/[id]`
**File**: `[id]/page.tsx`
**Purpose**: Display comprehensive credit note details

**Sections**:
- Header: Breadcrumbs, credit note title, action buttons
- Info Cards: Multiple cards showing different aspects
- Related Data: Associated records and relationships

**Tabs**:
- **Overview**: Key information and summary
- **History**: Change history and audit trail
- **Activity Log**: User actions and system events

**Dialogues**:
- **Edit**: Navigate to edit form
- **Delete Confirm**: Confirmation before deletion
- **Status Change**: Change credit note status with reason

#### 3. Create Page
**Route**: `/procurement/credit-note/new`
**File**: `new/page.tsx`
**Purpose**: Create new credit note

**Sections**:
- Form Header: Title, Save/Cancel actions
- Form Fields: All required and optional fields
- Validation: Real-time field validation

**Dialogues**:
- **Cancel Confirm**: Confirm discarding unsaved changes
- **Save Draft**: Save incomplete form as draft

#### 4. Edit Page
**Route**: `/procurement/credit-note/[id]/edit`
**File**: `[id]/edit/page.tsx`
**Purpose**: Modify existing credit note

**Sections**:
- Form Header: Title, Save/Cancel/Delete actions
- Form Fields: Pre-populated with existing data
- Change Tracking: Highlight modified fields

**Dialogues**:
- **Discard Changes**: Confirm discarding modifications
- **Save Draft**: Save changes as draft


## Architecture

### High-Level Architecture

```
┌─────────────┐
│   Client    │
│  (Browser)  │
└──────┬──────┘
       │ HTTP/HTTPS
       ▼
┌─────────────┐
│  Next.js    │
│   Server    │
├─────────────┤
│   React     │
│ Components  │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Supabase   │
│  PostgreSQL │
└─────────────┘
```

### Component Architecture

The Credit Note module follows Next.js 14 App Router conventions with server-side rendering for initial page loads and client-side interactivity for data manipulation. The module integrates with GRN module for source data, Inventory module for lot tracking, and Finance module for GL commitments.

- **Frontend Layer**
  - Page Components: List page, detail page with dynamic routing, vendor selection, GRN selection
  - UI Components: Data tables, forms, tabs, dialogs for credit note operations
  - State Management: React useState for component-level state
  - API Client: Mock data integration (future: Supabase client)

- **Backend Layer**
  - Server Actions: Handle credit note CRUD operations and business logic (future implementation)
  - Data Access Layer: Interface with mock data (future: database queries)
  - Business Logic: Inventory costing calculations (FIFO or Periodic Average), tax calculations, status transitions
  - Integration Layer: Stock movements, journal entries, GRN references, vendor payables

- **Data Layer**
  - Mock Data: Centralized mock data in lib/mock directory
  - Type Definitions: Centralized TypeScript interfaces in lib/types
  - Data Models: CreditNote, CreditNoteItem, AppliedLot, CreditNoteAttachment

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14+ (App Router)
- **UI Library**: React 18+
- **Styling**: Tailwind CSS, Shadcn/ui components
- **State Management**: React useState for local state
- **Form Handling**: React Hook Form (planned for future implementation)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **Data Tables**: Custom shadcn-based data table with sorting and filtering

### Backend
- **Runtime**: Node.js 20+
- **Framework**: Next.js Server Actions (planned for future implementation)
- **Database**: PostgreSQL via Supabase (currently using mock data)
- **Authentication**: NextAuth.js / Supabase Auth
- **File Storage**: Supabase Storage (for attachments)

### Business Logic
- **Inventory Costing Engine**: Calculates costs from inventory lots using system-configured method (FIFO or Periodic Average)
- **Tax Calculation Engine**: Applies tax rates and calculates input VAT adjustments
- **Journal Entry Generator**: Creates GL entries for commitment to finance module

### Testing
- **Unit Tests**: Vitest (planned)
- **E2E Tests**: Playwright (planned)

### DevOps
- **Version Control**: Git
- **Hosting**: Vercel
- **Database**: Supabase cloud

---

## Component Structure

### Directory Structure

```
app/(main)/procurement/credit-note/
├── page.tsx                                    # Credit note list page
├── [id]/
│   └── page.tsx                                # Credit note detail page
├── new/
│   └── page.tsx                                # New credit note - vendor selection
├── components/
│   ├── credit-note-management.tsx              # List component with filtering
│   ├── credit-note-detail.tsx                  # Detail view wrapper
│   ├── credit-note.tsx                         # Main detail component with tabs
│   ├── vendor-selection.tsx                    # Vendor selection dialog
│   ├── grn-selection.tsx                       # GRN selection dialog
│   ├── item-and-lot-selection.tsx              # Item/lot selection with costing
│   ├── inventory.tsx                           # Lot application display tab
│   ├── journal-entries.tsx                     # Journal entries display tab
│   ├── tax-entries.tsx                         # Tax calculations display tab
│   ├── stock-movement.tsx                      # Stock movements display tab
│   ├── cn-lot-application.tsx                  # Lot application details
│   ├── item-details-edit.tsx                   # Item detail edit form
│   ├── lot-selection.tsx                       # Lot selection component
│   ├── advanced-filter.tsx                     # Advanced filtering
│   └── StockMovementTab.tsx                    # Stock movement tab

lib/
├── types/
│   └── credit-note.ts                          # Credit note type definitions
└── mock/
    ├── credit-notes.ts                         # Mock credit note data
    └── static-credit-notes.ts                  # Static mock data for development
```

### Key Components

#### List Page Component
**File**: `page.tsx` (main)
**Purpose**: Display paginated list of all credit notes with filtering and sorting
**Responsibilities**:
- Render main page layout with "New Credit Note" action button
- Display credit note management component
- Handle navigation to creation workflow
- Support card view and table view modes

#### Credit Note Management Component
**File**: `components/credit-note-management.tsx`
**Purpose**: Main list interface with filtering, sorting, and bulk operations
**Responsibilities**:
- Load mock credit note data from centralized mock data file
- Display credit notes in card view or table view
- Provide status filtering (All, Draft, Committed, Voided)
- Support search across CN number, vendor name, description
- Render status badges with color coding (draft=gray, committed=green, void=red)
- Provide row actions (view, edit, commit, delete, void)
- Handle bulk operations (commit, delete selected)
- Maintain pagination state with configurable page sizes
- Sort by any column in ascending or descending order

#### Detail Page Component
**File**: `[id]/page.tsx`
**Purpose**: Dynamic route handler for credit note detail view
**Responsibilities**:
- Load credit note data from mock data store based on ID parameter
- Render credit note detail wrapper component
- Handle navigation between list and detail views

#### Detail Wrapper Component
**File**: `components/credit-note-detail.tsx`
**Purpose**: Wrapper component for credit note detail interface
**Responsibilities**:
- Pass credit note data to main detail component
- Handle component mounting and initialization
- Manage component lifecycle

#### Main Detail Component
**File**: `components/credit-note.tsx`
**Purpose**: Primary credit note interface with tabbed navigation and header
**Responsibilities**:
- Display credit note header with key information:
  - CN number, date, status
  - Credit type (QUANTITY_RETURN or AMOUNT_DISCOUNT)
  - Vendor information (name, code)
  - Currency and exchange rate
  - Invoice and tax invoice references
  - GRN reference (if applicable)
  - Credit reason and description
- Render tabbed interface for different aspects:
  - Inventory tab (lot applications and cost analysis)
  - Journal Entries tab (GL commitments)
  - Tax Entries tab (VAT calculations)
  - Stock Movement tab (inventory adjustments for quantity returns)
- Manage tab state and switching between tabs
- Handle field edit interactions for header information
- Provide action buttons based on status:
  - Save (for draft edits)
  - Commit (draft to committed)
  - Void (committed to void)
- Display status badge with appropriate color
- Integrate all tabs as separate components

#### Vendor Selection Component
**File**: `components/vendor-selection.tsx`
**Purpose**: First step in credit note creation workflow
**Responsibilities**:
- Display searchable list of vendors
- Support vendor search by name or code
- Render vendor cards with key information (name, code, contact)
- Handle vendor selection via radio buttons
- Navigate to GRN selection upon vendor selection
- Maintain vendor selection state

#### GRN Selection Component
**File**: `components/grn-selection.tsx`
**Purpose**: Second step for selecting source GRN
**Responsibilities**:
- Display searchable list of GRNs for selected vendor
- Support search by GRN number or invoice number
- Show GRN information (number, date, invoice, amount)
- Handle GRN selection
- Navigate to item/lot selection upon GRN selection
- Allow skipping GRN selection for standalone credit notes

#### Item and Lot Selection Component
**File**: `components/item-and-lot-selection.tsx`
**Purpose**: Core component for selecting items, lots, and calculating inventory costs
**Responsibilities**:
- Display credit note type selection (Quantity Return vs Amount Discount)
- Show GRN items in expandable table format
- For each item, display available inventory lots with:
  - Lot number
  - Receive date
  - GRN number and invoice reference
  - Available quantity
  - Unit cost
- Support lot selection via checkboxes
- Accept return quantity input per selected lot
- Calculate real-time cost summary based on system-configured costing method:
  - Display costing method indicator (FIFO or Periodic Average)
  - Total received quantity across selected lots
  - Calculated unit cost (FIFO weighted average or period average)
  - Current unit cost
  - Cost variance (current - calculated unit cost)
  - Return quantity
  - Return amount (quantity × current cost)
  - Cost of goods sold (quantity × calculated unit cost)
  - Realized gain/loss (return amount - COGS)
- Display cost analysis in expandable section per item with method-specific details
- Support discount amount entry (in addition to or instead of quantity return)
- Validate return quantities don't exceed lot availability
- Save item/lot selections and navigate to detail view
- Handle both quantity return and amount discount workflows

#### Inventory Tab Component
**File**: `components/inventory.tsx`
**Purpose**: Display lot application details and cost analysis
**Responsibilities**:
- Show applied lots table for each credit note item
- Display lot application details:
  - Lot number with receive date
  - Original GRN and invoice references
  - Return quantity from this lot
  - Lot unit cost
- Show cost summary with costing method indicator:
  - Total received quantity
  - Calculated unit cost (per configured method)
  - Current unit cost
  - Cost variance
  - Return amount, COGS, realized gain/loss
- Display aggregate totals across all items
- Provide expandable/collapsible sections per item
- Highlight positive variances in green, negative in red
- Support export to Excel functionality (future enhancement)

#### Journal Entries Tab Component
**File**: `components/journal-entries.tsx`
**Purpose**: Display generated journal entries for committed credit notes
**Responsibilities**:
- Show journal entries grouped by entry type:
  - Primary Entries Group (AP credit, inventory adjustment, input VAT)
  - Inventory Entries Group (cost variance adjustments)
- Display entry details per line:
  - GL account code and name
  - Department and cost center
  - Entry description
  - Reference (CN number, GRN number)
  - Debit and credit amounts
  - Tax code (if applicable)
  - Entry order number
- Validate total debits equal total credits
- Display group subtotals
- Show commitment date and journal voucher reference
- Read-only view of system-generated entries

#### Tax Entries Tab Component
**File**: `components/tax-entries.tsx`
**Purpose**: Display tax calculations and VAT adjustments
**Responsibilities**:
- Show document information:
  - Credit note number
  - Tax invoice reference
  - Document date
  - Vendor name and tax ID
- Display tax calculations:
  - Base amount (net of tax)
  - Tax rate (typically 18%)
  - Tax amount
  - Original invoice base and tax (for comparison)
- Show VAT adjustments:
  - Type (Input VAT)
  - Tax code (VAT18 or applicable rate)
  - Description
  - Base amount, rate, tax amount
  - GL account code (1240 - Input VAT)
- Display VAT period information:
  - Period name (e.g., "October 2024")
  - VAT return status (Open/Closed)
  - Due date for return
  - Reporting code (BOX4 for input VAT credit)
- Calculate tax impact on vendor payable
- Read-only display of system-calculated values

#### Stock Movement Tab Component
**File**: `components/stock-movement.tsx` and `StockMovementTab.tsx`
**Purpose**: Display inventory movements for quantity-based credits
**Responsibilities**:
- Show stock movements generated when credit note committed
- Display movement details per item:
  - Location type (INV=Inventory, CON=Consignment)
  - Lot number
  - Quantity (negative for returns)
  - Unit cost and extra costs
  - Movement date
- Show before and after inventory balances per lot
- Display total value impact
- Read-only view (movements generated by system)
- Only visible for quantity-based credit notes

#### CN Lot Application Component
**File**: `components/cn-lot-application.tsx`
**Purpose**: Detailed lot application analysis and display
**Responsibilities**:
- Display detailed lot-by-lot breakdown
- Show cost calculation methodology (FIFO or Periodic Average based on system configuration)
- Display cost variance analysis
- Provide drill-down into lot details
- Support lot-level reporting

#### Item Details Edit Component
**File**: `components/item-details-edit.tsx`
**Purpose**: Edit form for individual credit note items
**Responsibilities**:
- Display item detail form dialog
- Support editing of item fields (quantity, discount, description)
- Validate item-level data
- Recalculate line totals on changes
- Save item updates to parent component

#### Lot Selection Component
**File**: `components/lot-selection.tsx`
**Purpose**: Lot selection interface for item returns
**Responsibilities**:
- Display available lots for selected item
- Support lot filtering and search
- Handle lot selection logic
- Validate lot availability
- Pass selected lots back to parent

#### Advanced Filter Component
**File**: `components/advanced-filter.tsx`
**Purpose**: Advanced filtering options for credit note list
**Responsibilities**:
- Provide filter UI for multiple criteria:
  - Date range (from/to)
  - Vendor selection
  - Credit type
  - Status
  - Amount range
  - Credit reason
- Apply filters to credit note list
- Clear filters functionality
- Save filter preferences (future enhancement)

---

## Data Flow

### Read Operations

```
User navigates to Credit Note List
    ↓
Page Component loads
    ↓
Component imports mock data from lib/mock
    ↓
Mock data passed to Management Component
    ↓
Management Component receives data
    ↓
User applies filters/sorting
    ↓
Component filters/sorts data in memory
    ↓
Filtered results displayed in card or table view
```

### Vendor and GRN Selection Flow

```
User clicks "New Credit Note"
    ↓
Navigation to vendor selection page
    ↓
Vendor Selection Component loads vendor list
    ↓
User searches and selects vendor
    ↓
Component stores vendor in local state
    ↓
Navigation to GRN selection (optional)
    ↓
GRN Selection Component loads GRNs for vendor
    ↓
User searches and selects GRN OR skips
    ↓
Component stores GRN reference
    ↓
Navigation to item/lot selection
```

### Item/Lot Selection and Cost Calculation Flow

```
Item/Lot Selection Component loads
    ↓
System retrieves costing method from system configuration
(FIFO or Periodic Average)
    ↓
System displays GRN items (if GRN selected)
    OR product catalog (if manual)
    ↓
User selects credit note type:
  - QUANTITY_RETURN → Enable lot selection
  - AMOUNT_DISCOUNT → Enable discount entry only
    ↓
For QUANTITY_RETURN:
  User expands item to view available lots
    ↓
  Component loads lot data from inventory
    ↓
  User checks lot selection checkboxes
    ↓
  User enters return quantity per lot
    ↓
  System validates quantity ≤ lot available
    ↓
  System calculates inventory cost based on configured method:
    FOR FIFO:
      - Retrieves lot costs from inventory layers
      - Calculates weighted average: Σ(qty × cost) / Σ(qty) using oldest layers
    FOR PERIODIC AVERAGE:
      - Retrieves average cost for credit note period
      - Uses formula: Total Value in Period / Total Qty in Period
    COMMON:
      - Determines current unit cost from GRN
      - Calculates variance: current - calculated unit cost
      - Computes return amount: qty × current cost
      - Computes COGS: qty × calculated unit cost
      - Computes realized gain/loss: return amt - COGS
    ↓
  System displays cost summary with method indicator in real-time
    ↓
For AMOUNT_DISCOUNT:
  User enters discount amount per item
    ↓
  System calculates tax on discount
    ↓
User saves item/lot selections
    ↓
Navigation to credit note detail view
    ↓
Detail component displays complete credit note
```


### Commitment and Journal Entry Generation Flow

```
User opens draft credit note
    ↓
User clicks "Commit" button
    ↓
System performs pre-commitment validation:
  - Accounting period open for document date
  - GL accounts configured
  - Vendor account active
  - Inventory locations valid (for qty returns)
    ↓
System generates journal entries:
  PRIMARY ENTRIES GROUP:
    Entry 1: DR Accounts Payable (2100)
      - Department: Purchasing (PUR)
      - Amount: Credit total
      - Description: "CN Vendor Adjustment"
      - Reference: CN number

    Entry 2: CR Inventory (1140) [qty returns only]
      - Department: Warehouse (WHS)
      - Amount: Net inventory value (qty × calculated cost)
      - Description: "Inventory Value Adjustment"
      - Reference: GRN number

    Entry 3: CR Input VAT (1240)
      - Department: Accounting (ACC)
      - Amount: Tax amount
      - Tax code: VAT with rate
      - Description: "Tax Adjustment"
      - Reference: CN number

  INVENTORY ENTRIES GROUP [if cost variance exists]:
    Entry 4: DR/CR Cost Variance account
      - Department: Warehouse (WHS)
      - Amount: (current cost - calculated cost) × qty
      - Description: "Inventory Cost Variance"
      - Reference: CN number
    ↓
System validates journal balance:
  - Total debits = Total credits
    ↓
System generates stock movements [qty returns only]:
  For each item with lot selection:
    - Transaction type: Credit Note Return
    - Location type: INV or CON
    - Lot number: From selected lots
    - Quantity: Negative (e.g., -10 for return)
    - Unit cost: From inventory costing calculation
    - Extra cost: Proportional allocation
    - Movement date: Commitment date
    - Reference: CN number
    ↓
System commits transactions atomically:
  1. Commit journal entries to Finance module
  2. Commit stock movements to Inventory module
  3. Update vendor payable balance
  4. Change credit note status to COMMITTED
  5. Assign commitment date and reference number
    ↓
System sends notifications:
  - Email to finance team
  - Email to requester
  - In-app notifications
    ↓
System logs commitment in audit trail
    ↓
User sees success message
    ↓
Detail view refreshes with committed status
    ↓
Credit note locked from edits
```

### Voiding Flow

```
User opens committed credit note
    ↓
User clicks "Void" button (manager only)
    ↓
System prompts for void reason:
  - Error in quantities/amounts
  - Vendor dispute
  - Duplicate credit note
  - Other (with explanation)
    ↓
User enters void reason and comments
    ↓
System displays void impact preview:
  - Journal entries to be reversed
  - Stock movements to be reversed
  - Vendor payable adjustment
    ↓
User confirms void operation
    ↓
System performs void validation:
  - Accounting period open
  - No dependent transactions (payments, settlements)
    ↓
System generates reversing entries:
  - Same journal entries with opposite DR/CR
  - Same stock movements with opposite quantities
  - Same GL accounts, amounts, references
    ↓
System posts reversing transactions:
  1. Commit reversing journal entries
  2. Commit reversing stock movements
  3. Restore vendor payable balance
  4. Change status to VOID
  5. Assign void date and reference
    ↓
System sends void notifications
    ↓
System logs void in audit trail with reason
    ↓
User sees void confirmation
    ↓
Original credit note retained with VOID status
```

---

## State Management

### Local State (React useState)

Components use React useState for:
- **Tab selection**: Active tab in detail view
- **Edit mode**: Toggle between view and edit modes (draft only)
- **Form field values**: All header and item fields during editing
- **Filter state**: Status filters, search terms, date ranges in list
- **Sort state**: Column and direction in data table
- **Dialog states**: Open/close for vendor selection, GRN selection, lot selection
- **Loading states**: Loading indicators during data operations
- **Error states**: Validation errors and error messages
- **Selection state**: Selected lots, selected items for bulk operations
- **Expansion state**: Expanded/collapsed cost analysis sections

### No Global State Currently

The module currently does not use global state management (no Zustand store like GRN module). All state is local to components. Future enhancement may add global state for:
- Credit note creation workflow across multiple pages
- User preferences (view mode, filter preferences)
- Draft autosave functionality

---

## API Integration Points

### Current Implementation (Mock Data)

All data operations currently use mock data from centralized files:
- `lib/mock/credit-notes.ts` - Primary mock data
- `lib/mock/static-credit-notes.ts` - Static examples for testing

### Server Actions Architecture

This section defines the server actions implementation as specified in BR-BE-001 through BR-BE-014.

#### Shared Service Integration

The Credit Note module integrates with the following centralized shared services to ensure consistency across the application:

| Service | Location | Usage in CN |
|---------|----------|-------------|
| **InventoryValuationService** | [SM-inventory-valuation.md](../../shared-methods/inventory-valuation/SM-inventory-valuation.md) | Inventory cost calculation (FIFO or Periodic Average) for quantity returns (BR-BE-008) |
| **TransactionRecordingService** | [SM-inventory-operations.md#3.2](../../shared-methods/inventory-operations/SM-inventory-operations.md) | Stock movement generation for returns (BR-BE-005) |
| **AuditTrailService** | [SM-inventory-operations.md#3.7](../../shared-methods/inventory-operations/SM-inventory-operations.md) | Audit logging for all CN operations (BR-BE-010) |
| **StateManagementService** | [SM-inventory-operations.md#3.3](../../shared-methods/inventory-operations/SM-inventory-operations.md) | Status transitions (Draft→Committed→Voided) (BR-CN-023) |
| **AtomicTransactionService** | [SM-inventory-operations.md#3.6](../../shared-methods/inventory-operations/SM-inventory-operations.md) | Transaction management for commit/void operations (BR-BE-012) |

**Integration Example**: See [credit-note-integration.md](../../shared-methods/inventory-valuation/examples/credit-note-integration.md) for complete implementation patterns.

#### Directory Structure

```
app/(main)/procurement/credit-note/
├── actions/
│   ├── index.ts                              # Barrel export for all actions
│   ├── credit-note-crud.ts                   # Create, Read, Update, Delete actions
│   ├── credit-note-commit.ts                 # Commitment transaction action
│   ├── credit-note-void.ts                   # Void transaction action
│   ├── vendor-fetch.ts                       # Vendor search and fetch
│   ├── grn-fetch.ts                          # GRN and lot data fetching
│   ├── inventory-costing.ts                  # Inventory costing calculations (FIFO/Periodic Average)
│   ├── tax-calculation.ts                    # Tax calculation service
│   ├── journal-entry-generator.ts            # Journal entry generation
│   ├── stock-movement-generator.ts           # Stock movement generation
│   ├── attachment-management.ts              # File upload/delete
│   ├── cn-number-generator.ts                # CN number generation
│   ├── validation-service.ts                 # Data validation
│   └── audit-logger.ts                       # Audit trail logging
```

#### TS-BE-001: Credit Note CRUD Server Actions

**createCreditNote**
- **Purpose**: Create a new credit note with header, items, and lot selections
- **Input**: CreateCreditNoteInput (see DD-BE-001)
- **Output**: CreditNoteResponse with created credit note
- **Implementation Steps**:
  1. Validate input data using validation service
  2. Generate CN number using cn-number-generator
  3. Calculate inventory costs for quantity returns (using system-configured method)
  4. Calculate tax amounts for all items
  5. Create credit note record in database
  6. Create credit note item records
  7. Create applied lot records (for QUANTITY_RETURN)
  8. Log creation in audit trail
  9. Return created credit note
- **Error Handling**: Return structured error with field-level validation details
- **Transaction**: Single database transaction with rollback on failure

**getCreditNote**
- **Purpose**: Retrieve credit note by ID with all related data
- **Input**: creditNoteId (UUID)
- **Output**: CreditNote with items, applied lots, attachments
- **Implementation Steps**:
  1. Validate user has read permission
  2. Fetch credit note header
  3. Fetch related items with product details
  4. Fetch applied lots for quantity return items
  5. Fetch attachments
  6. Fetch journal entries (if committed)
  7. Fetch stock movements (if committed and quantity return)
  8. Return assembled credit note object

**updateCreditNote**
- **Purpose**: Update draft credit note
- **Input**: UpdateCreditNoteInput (see DD-BE-001)
- **Output**: CreditNoteResponse with updated credit note
- **Implementation Steps**:
  1. Validate credit note exists and is in DRAFT status
  2. Validate user has edit permission
  3. Validate input data
  4. Recalculate inventory costs if lots changed
  5. Recalculate tax amounts if items changed
  6. Update credit note record
  7. Update/replace item records
  8. Update/replace applied lot records
  9. Log update in audit trail with old/new values
  10. Return updated credit note

**deleteCreditNote**
- **Purpose**: Soft delete draft credit note
- **Input**: creditNoteId (UUID)
- **Output**: Success/failure response
- **Implementation Steps**:
  1. Validate credit note exists and is in DRAFT status
  2. Validate user has delete permission
  3. Delete attachments from storage
  4. Soft delete credit note (set deletedAt)
  5. Log deletion in audit trail

**listCreditNotes**
- **Purpose**: Paginated list with filtering and sorting
- **Input**: ListCreditNotesInput (filters, pagination, sort)
- **Output**: Paginated credit note list with totals
- **Implementation Steps**:
  1. Build query based on filters (status, vendor, date range, type)
  2. Apply user location access restrictions
  3. Apply sorting
  4. Execute count query for pagination
  5. Execute paginated data query
  6. Return results with pagination metadata

#### TS-BE-002: Vendor and GRN Fetch Actions

**searchVendors**
- **Purpose**: Search vendors for selection in credit note creation
- **Input**: VendorSearchInput (see DD-BE-002)
- **Output**: VendorSearchResponse with matching vendors
- **Implementation Steps**:
  1. Build search query with name/code filter
  2. Apply active status filter
  3. Apply user access restrictions
  4. Execute paginated query
  5. Return vendor summaries

**searchGRNsByVendor**
- **Purpose**: Search GRNs for selected vendor
- **Input**: GRNSearchInput (see DD-BE-002)
- **Output**: GRNSearchResponse with matching GRNs
- **Implementation Steps**:
  1. Filter by vendor ID
  2. Apply search term to GRN number/invoice
  3. Apply date range filter
  4. Filter by status (only POSTED GRNs)
  5. Execute paginated query
  6. Return GRN summaries

**getGRNItemsWithLots**
- **Purpose**: Get GRN items with available inventory lots
- **Input**: grnId (UUID)
- **Output**: GRNItemsResponse with items and lot data
- **Implementation Steps**:
  1. Fetch GRN items
  2. For each item, fetch inventory lots with available quantity > 0
  3. Include lot cost data for inventory costing calculations
  4. Return items with lot arrays

**getAvailableLotsByProduct**
- **Purpose**: Get available lots for a product (standalone credit note)
- **Input**: productId (UUID), locationId (UUID, optional)
- **Output**: Array of AvailableLot
- **Implementation Steps**:
  1. Query inventory lots for product
  2. Filter by location if provided
  3. Filter where available quantity > 0
  4. Order by receive date (for FIFO ordering when applicable)
  5. Return lot list with costs

#### TS-BE-003: Commitment Transaction Action

**commitCreditNote**
- **Purpose**: Commit credit note to GL with atomic transaction
- **Input**: CommitCreditNoteInput (see DD-BE-003)
- **Output**: CommitCreditNoteResponse with entries and movements
- **Implementation Steps** (all in single transaction):
  1. Validate credit note exists and is DRAFT
  2. Validate user has commit permission
  3. Validate accounting period is open for commitment date
  4. Validate all GL accounts exist and are active
  5. Generate journal entries using journal-entry-generator:
     - Primary entries (AP, Inventory, VAT)
     - Inventory entries (cost variance if applicable)
  6. Validate journal balance (debits = credits)
  7. Generate stock movements for quantity returns using stock-movement-generator
  8. Insert journal entries into finance module
  9. Insert stock movements into inventory module
  10. Update inventory lot balances
  11. Update vendor payable balance
  12. Update credit note status to COMMITTED
  13. Set committedDate and commitmentReference
  14. Log commitment in audit trail
  15. Send notifications (finance team, requester)
  16. Return updated credit note with entries and movements
- **Transaction**: Serializable isolation, pessimistic locking
- **Error Handling**: Full rollback on any failure, return detailed error

#### TS-BE-004: Void Transaction Action

**voidCreditNote**
- **Purpose**: Void committed credit note with reversing entries
- **Input**: VoidCreditNoteInput (see DD-BE-004)
- **Output**: VoidCreditNoteResponse with reversing entries
- **Implementation Steps** (all in single transaction):
  1. Validate credit note exists and is COMMITTED
  2. Validate user has void permission (manager role)
  3. Validate no dependent transactions (payments, settlements)
  4. Validate accounting period is open for void date
  5. Generate reversing journal entries (same accounts, opposite DR/CR)
  6. Generate reversing stock movements (positive quantities)
  7. Insert reversing journal entries
  8. Insert reversing stock movements
  9. Restore inventory lot balances
  10. Restore vendor payable balance
  11. Update credit note status to VOID
  12. Set voidDate and voidReason
  13. Log void operation in audit trail
  14. Send void notifications
  15. Return updated credit note with reversing entries
- **Transaction**: Serializable isolation, pessimistic locking
- **Error Handling**: Full rollback on any failure

#### TS-BE-005: Inventory Costing Service

**calculateInventoryCost**
- **Purpose**: Calculate inventory costs using system-configured costing method
- **Input**: CostCalculationInput (see DD-BE-005)
- **Output**: CostCalculationResult with cost analysis
- **Algorithm**:
  1. Get system costing method from configuration (FIFO or PERIODIC_AVERAGE)
  2. **FOR FIFO**:
     a. For each selected lot, get quantity and unit cost
     b. Calculate total received quantity: Σ(lot quantities)
     c. Calculate weighted average from layers: Σ(qty × cost) / Σ(qty)
  3. **FOR PERIODIC AVERAGE**:
     a. Get credit note period (month/year of document date)
     b. Query total inventory value for period
     c. Query total inventory quantity for period
     d. Calculate period average: Total Value / Total Quantity
  4. Get current unit cost from product master or GRN
  5. Calculate cost variance: current - calculated unit cost
  6. Calculate return amount: return qty × current cost
  7. Calculate COGS: return qty × calculated unit cost
  8. Calculate realized gain/loss: return amount - COGS
  9. Return complete cost analysis with method indicator
- **Caching**: Cache results per lot combination (FIFO) or per period (Periodic Average)
- **Configuration**: Costing method from System Administration → Inventory Settings

#### TS-BE-006: Tax Calculation Service

**calculateTax**
- **Purpose**: Calculate tax amounts for credit note items
- **Input**: TaxCalculationInput (see DD-BE-006)
- **Output**: TaxCalculationResult with tax details
- **Algorithm**:
  1. Look up tax rate for document date
  2. For each item, calculate tax: base × rate
  3. Round to 2 decimal places
  4. Aggregate totals
  5. Determine VAT period from document date
  6. Return tax calculations
- **Configuration**: Tax rates from system configuration

#### TS-BE-007: Journal Entry Generator

**generateJournalEntries**
- **Purpose**: Generate GL journal entries for commitment
- **Input**: Credit note with inventory costing and tax calculations
- **Output**: Array of JournalEntry records
- **Generation Rules**:
  - Entry 1 (AP): DR Accounts Payable (2100), credit total
  - Entry 2 (Inventory): CR Inventory (1140), net value (qty returns only)
  - Entry 3 (VAT): CR Input VAT (1240), tax amount
  - Entry 4 (Variance): DR/CR Cost Variance account, variance amount
- **Validation**: Total debits must equal total credits

#### TS-BE-008: Stock Movement Generator

**generateStockMovements**
- **Purpose**: Generate inventory stock movements for quantity returns
- **Input**: Credit note items with applied lots
- **Output**: Array of StockMovement records
- **Generation Rules**:
  - Movement type: Credit Note Return
  - Quantity: Negative (e.g., -10 for 10 units returned)
  - Unit cost: From inventory costing calculation
  - Reference: CN number
- **Only For**: QUANTITY_RETURN credit types

#### TS-BE-009: Attachment Management

**uploadAttachment**
- **Purpose**: Upload file attachment to credit note
- **Input**: AttachmentUploadInput (see DD-BE-007)
- **Output**: AttachmentUploadResponse
- **Implementation Steps**:
  1. Validate file type (allowed MIME types)
  2. Validate file size (max 10 MB)
  3. Validate attachment count (max 10 per credit note)
  4. Sanitize file name
  5. Upload to Supabase Storage
  6. Create attachment record with URL
  7. Return created attachment

**deleteAttachment**
- **Purpose**: Delete attachment from credit note
- **Input**: AttachmentDeleteInput
- **Output**: Success/failure response
- **Implementation Steps**:
  1. Validate attachment exists
  2. Validate user has permission
  3. Delete file from storage
  4. Delete attachment record

#### TS-BE-010: Audit Logging Service

**logAuditEntry**
- **Purpose**: Create immutable audit trail entry
- **Input**: Entity type, ID, action, old/new values, user context
- **Output**: Created audit log entry
- **Logged Actions**: CREATE, UPDATE, COMMIT, VOID, DELETE
- **Captured Data**: User ID, timestamp, IP address, field changes
- **Storage**: Separate audit table, immutable (no updates/deletes)

**getAuditLog**
- **Purpose**: Query audit trail for credit note
- **Input**: AuditLogQuery (see DD-BE-008)
- **Output**: Paginated audit log entries
- **Access Control**: Audit log access requires auditor role

#### TS-BE-011: CN Number Generator

**generateCNNumber**
- **Purpose**: Generate unique credit note number
- **Input**: CNNumberRequest (see DD-BE-009)
- **Output**: CNNumberResponse with generated number
- **Format**: CN-{YYYY}-{NNN}
- **Sequence**: Reset annually, increment per credit note
- **Concurrency**: Database sequence for thread safety

#### TS-BE-012: Vendor Balance Update

**updateVendorPayable**
- **Purpose**: Update vendor payable balance on commit/void
- **Input**: Vendor ID, amount, operation (subtract/add)
- **Output**: Updated vendor balance
- **Integration**: Called by commit and void actions
- **Atomicity**: Part of parent transaction

#### TS-BE-013: Data Validation Service

**validateCreditNote**
- **Purpose**: Comprehensive validation of credit note data
- **Input**: Credit note input data
- **Output**: ValidationResult with errors and warnings
- **Validation Categories**:
  - Field-level validations (required, format, range)
  - Cross-field validations (totals, lot sums)
  - Business rule validations (status, permissions)
  - Integration validations (vendor active, GL accounts exist)

#### TS-BE-014: Real-time Data Sync

**Implementation Pattern**: Server actions with revalidation
- Use revalidatePath after mutations
- Use revalidateTag for cache invalidation
- WebSocket/SSE for real-time updates (future enhancement)
- Optimistic updates in UI with server confirmation

### Integration with Other Modules

**GRN Module Integration**
- Read GRN data: Retrieve GRN header and items for credit note creation
- Reference linkage: Store GRN reference in credit note
- Status tracking: No status updates to GRN (read-only reference)

**Inventory Module Integration**
- Read lot data: Retrieve available lots for return items
- Read lot costs: Get unit costs for inventory costing calculations
- Commit stock movements: Send negative stock movements on credit note commitment
- Update balances: Reduce inventory quantities per lot

**Finance Module Integration**
- Commit journal entries: Send GL entries on credit note commitment
- Update vendor payable: Reduce payable balance by credit amount
- Commit tax entries: Send input VAT adjustments for tax reporting
- Period validation: Validate accounting period is open before commitment

**Vendor Module Integration**
- Read vendor data: Retrieve vendor information for selection
- Read vendor accounts: Get GL account codes for commitment
- Credit application: Apply credit to vendor account balance (future)

---

## Business Logic Implementation

### Inventory Costing Engine

**Purpose**: Calculate cost of returned goods using system-configured costing method (FIFO or Periodic Average)

**System Configuration**: Costing method is configured in System Administration → Inventory Settings

**Algorithm Description**:

**FOR FIFO (First-In-First-Out)**:
1. Retrieve all selected inventory lots for returned item
2. For each lot, get lot quantity and lot unit cost
3. Calculate total received quantity: sum of all lot quantities
4. Calculate weighted average cost: sum of (lot qty × lot cost) / total qty
5. Get current unit cost from product master or GRN item
6. Calculate cost variance: current cost - FIFO weighted average cost
7. Calculate return amount: return quantity × current cost
8. Calculate cost of goods sold: return quantity × FIFO weighted average cost
9. Calculate realized gain/loss: return amount - COGS
10. Store all calculations with credit note item for audit and reporting

**FOR PERIODIC AVERAGE**:
1. Get credit note period (month/year of document date)
2. Query total inventory value received during the period
3. Query total inventory quantity received during the period
4. Calculate period average cost: Total Value in Period / Total Quantity in Period
5. Get current unit cost from product master or GRN item
6. Calculate cost variance: current cost - period average cost
7. Calculate return amount: return quantity × current cost
8. Calculate cost of goods sold: return quantity × period average cost
9. Calculate realized gain/loss: return amount - COGS
10. Store all calculations with credit note item for audit and reporting

**Data Requirements**:
- **FIFO**: Inventory lot data with quantities and costs, Product current cost or GRN item cost, Return quantity per lot
- **Periodic Average**: Period inventory transactions, Total period value and quantity, Product current cost or GRN item cost

**Output**:
- Costing method used (FIFO or PERIODIC_AVERAGE)
- Calculated unit cost per item
- Cost variance per item
- Realized gain/loss per item
- Total cost impact across all items
- Method-specific details (lot breakdown for FIFO, period data for Periodic Average)

### Tax Calculation Engine

**Purpose**: Calculate input VAT adjustments on credit note amounts

**Algorithm Description**:
1. Retrieve tax rate applicable on credit note document date (typically 18%)
2. For each credit note item, get base amount (net of tax)
3. Calculate tax amount: base amount × tax rate
4. Round tax amount to 2 decimal places
5. Aggregate total base amount and total tax amount
6. Determine tax invoice reference (required for VAT credit)
7. Determine VAT period based on document date
8. Create tax entry record with all calculations
9. Store tax entry linked to credit note

**Data Requirements**:
- Tax rate configuration per date
- Credit note item amounts
- Vendor tax registration status
- Tax invoice reference

**Output**:
- Tax amount per item
- Total tax amount
- VAT period classification
- Tax entry for VAT return reporting

### Journal Entry Generator

**Purpose**: Generate GL journal entries when credit note is committed

**Algorithm Description**:

1. Validate accounting period is open for credit note date
2. Retrieve GL account configuration:
   - Accounts Payable account (2100)
   - Inventory account (1140)
   - Input VAT account (1240)
   - Cost Variance account (configurable)
3. Generate Primary Entries Group:

   **Entry 1 - Accounts Payable Credit**:
   - Account: 2100
   - Department: Purchasing (PUR)
   - Debit amount: Credit note total amount
   - Description: "CN Vendor Adjustment"
   - Reference: Credit note number
   - Order: 1

   **Entry 2 - Inventory Adjustment** (quantity returns only):
   - Account: 1140
   - Department: Warehouse (WHS)
   - Credit amount: Net inventory value (sum of qty × calculated cost per item)
   - Description: "Inventory Value Adjustment"
   - Reference: GRN number
   - Order: 2

   **Entry 3 - Input VAT Credit**:
   - Account: 1240
   - Department: Accounting (ACC)
   - Credit amount: Total tax amount
   - Tax code: VAT with applicable rate
   - Description: "Tax Adjustment"
   - Reference: Credit note number
   - Order: 3

4. Generate Inventory Entries Group (if cost variance exists):

   **Entry 4 - Cost Variance**:
   - Account: Cost variance account
   - Department: Warehouse (WHS)
   - Debit (if loss) or Credit (if gain): abs(cost variance × quantity)
   - Description: "Inventory Cost Variance"
   - Reference: Credit note number
   - Order: 4

5. Validate journal balance: total debits = total credits
6. Assign journal voucher number
7. Assign commitment date
8. Store all entries with credit note
9. Commit entries to Finance module

**Data Requirements**:
- GL account mapping configuration
- Department codes
- Credit note header and item data
- Inventory costing results
- Tax calculation results

**Output**:
- Complete journal voucher with entries
- Journal voucher number
- Posting reference
- Balance validation status

### Stock Movement Generator

**Purpose**: Generate inventory stock movements for quantity-based credit notes

**Algorithm Description** (quantity returns only):

1. Validate credit note type is QUANTITY_RETURN
2. For each credit note item with lot selection:

   a. Retrieve lot selection details:
      - Lot number
      - Return quantity
      - Unit cost from inventory costing calculation
      - Extra costs (if any)

   b. Create stock movement record:
      - Transaction type: "Credit Note Return"
      - Location type: INV (Inventory) or CON (Consignment)
      - Lot number: From lot selection
      - Quantity: Negative value (e.g., -10 for 10 units returned)
      - Unit cost: From inventory costing calculation
      - Extra cost: Proportional allocation if applicable
      - Movement date: Credit note commitment date
      - Reference type: "Credit Note"
      - Reference number: CN number
      - Document ID: Credit note ID

   c. Calculate movement value:
      - Value: quantity × (unit cost + extra cost per unit)
      - Note: Value is negative for returns

3. Validate all stock movements created for all items
4. Commit stock movements to Inventory module atomically
5. Inventory module updates:
   - Reduces lot available quantity by return quantity
   - Updates inventory valuation
   - Maintains lot traceability
   - Records movement in transaction history

**Data Requirements**:
- Credit note type
- Credit note items with lot selections
- Inventory costing results
- Location information
- Posting date

**Output**:
- Stock movement records per lot per item
- Inventory quantity updates
- Inventory valuation updates
- Movement transaction log

---

## Validation Logic

### Client-Side Validation

**Header Validation**:
- Document date: Required, cannot be future date
- Vendor: Required selection
- Currency: Required, defaults to base currency
- Exchange rate: Required if non-base currency, must be > 0
- Invoice reference: Required for tax credits
- Credit reason: Required selection from predefined list
- Description: Required, minimum 10 characters (50 for OTHER reason)

**Item Validation** (Quantity Returns):
- At least one item required
- Return quantity: Required, must be > 0, cannot exceed lot available quantity
- Lot selection: At least one lot selected per item
- Unit price: Required, must be > 0
- Location: Required for all items

**Item Validation** (Amount Discounts):
- At least one item required
- Discount amount: Required, must be > 0
- Discount cannot exceed original invoice amount (warning)

**Inventory Costing Validation**:
- **FIFO**: Lot data available - All selected lots must have cost data
- **Periodic Average**: Period data available - Valid inventory data exists for the period
- Quantity validation: Return quantities match lot selections
- Calculation validation: Cost calculation successful for configured method

### Server-Side Validation (Future Implementation)

**Pre-Save Validation**:
- Duplicate invoice number check (warn if exists for vendor)
- Vendor account active status check
- Product catalog validation for all items
- Inventory lot existence validation
- Numerical field range validations


**Pre-Commitment Validation**:
- Credit note in DRAFT status
- Accounting period open for document date
- All GL accounts configured and exist
- Vendor account exists and is active
- Inventory locations valid (for quantity returns)
- No dependent transactions exist (for void operation)

---

## Security and Permissions

### Role-Based Access Control

**Roles**:
- **Purchasing Staff**: Create, edit draft, view
- **Receiving Clerk**: Create quantity returns, edit draft, view
- **Procurement Manager**: All purchasing staff permissions plus commit, void
- **Finance Team**: View, commit credits, review journal entries
- **Warehouse Staff**: View, confirm lot selections

**Permission Matrix**:

| Action | Purchasing Staff | Receiving Clerk | Procurement Manager | Finance Team | Warehouse Staff |
|--------|-----------------|-----------------|---------------------|--------------|-----------------|
| View List | ✓ | ✓ | ✓ | ✓ | ✓ |
| View Detail | ✓ | ✓ | ✓ | ✓ | ✓ |
| Create Credit Note | ✓ | ✓ | ✓ | - | - |
| Edit Draft | ✓ | ✓ | ✓ | - | - |
| Commit | - | - | ✓ | ✓ | - |
| Void | - | - | ✓ | - | - |
| View Financial Data | ✓ | Limited | ✓ | ✓ | Limited |

### Data Access Controls

- **Location-Based Access**: Users can only view/edit credit notes for their assigned locations (unless cross-location permission granted)
- **Vendor-Based Access**: Users can only create credit notes for vendors they have permission to access
- **Status-Based Editing**: Only DRAFT status credit notes can be edited

### Audit Trail

All credit note operations logged with:
- **Action Type**: Create, update, commit, void
- **User**: Username and user ID
- **Timestamp**: Date and time of action
- **Details**: Changed fields, old/new values
- **IP Address**: Request source IP
- **Status Changes**: From/to status
- **Comments**: Void reasons

Audit log is immutable (no deletion or editing allowed) and retained per compliance requirements.

---

## Performance Considerations

### Optimization Strategies

**Data Loading**:
- Paginated list loading (20 records per page default)
- Lazy loading of tab content (load tab data only when tab activated)
- Memoization of inventory costing calculations (cache results per lot combination for FIFO, per period for Periodic Average)
- Debounced search inputs (300ms delay)

**Calculation Performance**:
- Inventory costing calculations optimized (FIFO: up to 50 lots per item; Periodic Average: single period query)
- Tax calculations cached per tax rate and base amount combination
- Journal entry generation pre-calculated on save, not on each view

**Component Rendering**:
- React memo for expensive components (cost analysis summary, journal entries)
- Virtual scrolling for large item lists (future enhancement)
- Conditional rendering of tabs (don't render hidden tabs)

**Network Optimization** (Future):
- Batch API requests where possible
- Optimize database queries with proper indexing
- Implement caching layer for reference data (vendors, products, GL accounts)

### Performance Targets

- **List page load**: < 2 seconds with 1,000 credit notes
- **Detail page load**: < 1.5 seconds including all tabs
- **Inventory costing calculation**: < 2 seconds (FIFO: for 10 lots per item; Periodic Average: single period)
- **Tax calculation**: < 1 second for 20 items
- **Save operation**: < 3 seconds including validation
- **Commit operation**: < 5 seconds including journal and stock movements
- **Void operation**: < 5 seconds including reversing entries

---

## Error Handling

### Client-Side Error Handling

**Validation Errors**:
- Display inline field-level errors for form validation
- Show summary error list for multiple validation failures
- Highlight invalid fields with red border and error icon
- Prevent form submission until all errors resolved

**Network Errors**:
- Display user-friendly error messages for API failures
- Retry logic for transient network errors (3 retries with exponential backoff)
- Offline mode detection with appropriate messaging
- Automatic reconnection and data sync when network restored

**Component Errors**:
- Error boundaries wrap major components
- Fallback UI displayed on component crash
- Error details logged to console for debugging
- User can reload component or entire page

### Server-Side Error Handling (Future)

**Business Logic Errors**:
- Return structured error response with error code and message
- Log error details with context for debugging
- Roll back database transactions on errors
- Return user-actionable error messages

**System Errors**:
- Log critical errors to monitoring system
- Send alerts for repeated errors or critical failures
- Graceful degradation where possible
- Maintenance mode for severe system issues

**Data Integrity Errors**:
- Atomic transactions for commitment and voiding operations
- Rollback on any failure in multi-step processes
- Validate data consistency before and after operations
- Lock records during updates to prevent concurrent modification

---

## Testing Strategy

### Unit Testing (Planned)

**Components to Test**:
- Inventory costing logic (FIFO and Periodic Average) with various scenarios
- Tax calculation with different rates and amounts
- Journal entry generation with different credit types
- Stock movement generation for quantity returns
- Approval workflow logic with different thresholds
- Validation functions for all fields and business rules

**Test Framework**: Vitest
**Coverage Target**: > 80% for business logic, > 60% for UI components

### Integration Testing (Planned)

**Scenarios to Test**:
- End-to-end credit note creation flow (vendor → GRN → lots → save → commit)
- Void workflow with journal and stock movement reversal
- Multi-currency credit note with exchange rate conversion
- Inventory costing with complex lot selections (FIFO) and period calculations (Periodic Average)
- Integration with GRN, Inventory, and Finance modules

**Test Framework**: Playwright
**Coverage**: All critical user paths

### Manual Testing

**Test Cases**:
- Browser compatibility (Chrome, Firefox, Safari, Edge)
- Responsive design on tablets (warehouse use case)
- User permission enforcement
- Data validation edge cases
- Large data volumes (100+ items, 50+ lots per item)

---

## Deployment

### Environment Configuration

**Development**:
- Local Next.js dev server
- Mock data for all operations
- Debug logging enabled
- Hot reload for code changes

**Staging**:
- Vercel preview deployment
- Supabase staging database
- Test data populated
- All features enabled for testing

**Production**:
- Vercel production deployment
- Supabase production database
- Error logging to monitoring service
- Performance monitoring enabled
- Feature flags for gradual rollout

### Database Migration Strategy

**Initial Deployment**:
1. Create database tables per DD document
2. Create indexes for performance
3. Set up foreign key constraints
4. Configure database functions and triggers
5. Load reference data (GL accounts, tax rates)
6. Migrate historical credit notes (if applicable)

**Ongoing Changes**:
- Version-controlled migration scripts
- Backward-compatible schema changes where possible
- Data migration scripts tested in staging
- Rollback plan for each migration

---

## Monitoring and Logging

### Application Monitoring

**Metrics to Track**:
- Credit note creation success/failure rate
- Average time to create credit note
- Inventory costing calculation performance
- Posting operation success rate
- Approval workflow completion time
- API response times

**Monitoring Tools** (Planned):
- Vercel Analytics for performance
- Sentry for error tracking
- Custom dashboard for business metrics

### Logging Strategy

**Log Levels**:
- **ERROR**: System errors, validation failures, API errors
- **WARN**: Business rule violations, deprecated feature usage
- **INFO**: User actions (create, update, commit, void)
- **DEBUG**: Detailed execution flow (development only)

**Log Content**:
- Timestamp, user ID, credit note ID
- Action performed
- Request and response data (sanitized)
- Error details with stack trace
- Performance metrics (execution time)

**Log Retention**:
- ERROR/WARN logs: 90 days
- INFO logs: 30 days
- DEBUG logs: 7 days (development only)
- Audit trail: Permanent (compliance requirement)

---

## Future Enhancements

### Planned Features

1. **Workflow Automation**:
   - Scheduled commitment batch jobs

2. **Advanced Reporting**:
   - Credit note aging report
   - Cost variance analysis report (FIFO and Periodic Average)
   - Vendor credit summary
   - Tax credit reconciliation report

3. **Enhanced Cost Analysis**:
   - Visual charts for cost variance trends
   - Lot profitability analysis (FIFO) / Period profitability analysis (Periodic Average)
   - Historical cost method comparison

4. **Integration Enhancements**:
   - Real-time vendor account updates
   - Direct payment application from credits
   - EDI integration for vendor credit notifications

5. **Mobile Optimization**:
   - Native mobile app for warehouse returns
   - Barcode scanning for lot selection
   - Offline mode with sync

6. **AI/ML Features**:
   - Credit amount prediction based on historical data
   - Anomaly detection for unusual credits
   - Automated credit reason classification

---

## Glossary

**FIFO (First-In-First-Out)**: Inventory costing method that calculates costs based on oldest inventory layers first. One of two configurable costing methods.

**Periodic Average**: Inventory costing method that calculates costs using weighted average for the period (Total Value in Period / Total Quantity in Period). One of two configurable costing methods.

**Cost Variance**: Difference between current inventory cost and calculated cost (using FIFO weighted average or Periodic Average, depending on system configuration).

**Realized Gain/Loss**: Financial impact of cost variance on credit note.

**Lot Tracking**: System capability to track specific inventory batches with unique identifiers.

**Input VAT**: Value-added tax paid on purchases that can be credited against output VAT.

**Journal Voucher**: Accounting document containing GL entries.

**Stock Movement**: Inventory transaction record showing quantity changes.

**GL Account**: General Ledger account number used in financial system.

---

## References

### Internal Documents
- Business Requirements (BR-credit-note.md)
- Use Cases (UC-credit-note.md)
- Data Definition (DD-credit-note.md)
- Flow Diagrams (FD-credit-note.md)
- Validations (VAL-credit-note.md)

### External Standards
- Next.js 14 Documentation
- React 18 Documentation
- TypeScript Documentation
- Tailwind CSS Documentation
- Shadcn/ui Component Library

### Code Standards
- /docs/CLAUDE.md - Project development standards
- /lib/types/README.md - Type system documentation
- /lib/mock/README.md - Mock data guidelines

---

**Document Control**:
- **Classification**: Internal Use
- **Distribution**: Development Team, Procurement Team, Finance Team
- **Review Cycle**: Quarterly or when technical architecture changes
- **Approval**: Technical Lead, Development Manager

**End of Document**
