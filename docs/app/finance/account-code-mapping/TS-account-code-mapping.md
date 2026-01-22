# Technical Specification: Account Code Mapping

## Module Information
- **Module**: Finance
- **Sub-Module**: Account Code Mapping
- **Route**: `/finance/account-code-mapping`
- **Version**: 2.0.0
- **Last Updated**: 2026-01-17
- **Owner**: Finance & Accounting Team
- **Status**: Active

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2026-01-17 | Documentation Team | Updated to reflect actual implementation |
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format |
| 1.0.0 | 2025-11-12 | Documentation Team | Initial version |

---

## Overview

The Account Code Mapping module provides a unified interface for managing the mapping between inventory transactions and accounting codes. It supports two primary mapping views:

1. **Posting to AP**: Maps inventory procurement transactions to Accounts Payable debit accounts
2. **Posting to GL**: Maps inventory movements (purchases, transfers, sales, usage) to General Ledger accounts with debit/credit pairs

The implementation uses local state management with mock data, featuring full CRUD operations, search functionality, and view switching.

**Related Documents**:
- [Business Requirements](./BR-account-code-mapping.md)
- [Use Cases](./UC-account-code-mapping.md)
- [Data Dictionary](./DD-account-code-mapping.md)
- [Flow Diagrams](./FD-account-code-mapping.md)
- [Validations](./VAL-account-code-mapping.md)

---

## Architecture

### Component Architecture

```
Account Code Mapping Module
    │
    ├── Page Component (Server)
    │   └── app/(main)/finance/account-code-mapping/page.tsx
    │
    └── Feature Component (Client)
        └── components/account-code-mapping.tsx
            ├── View Selector (AP/GL toggle)
            ├── Search Filter
            ├── Action Toolbar (Scan, Import/Export, Print, Create)
            ├── AP Mapping Table
            ├── GL Mapping Table
            └── CRUD Dialogs
                ├── View Dialog
                ├── Create Dialog
                └── Edit Dialog
```

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **UI Library**: React 18 with useState/useEffect hooks
- **Styling**: Tailwind CSS, Shadcn/ui components
- **Icons**: Lucide React (ScanIcon, DownloadIcon, Edit, PrinterIcon, etc.)
- **State Management**: React useState (local component state)

### UI Components Used
- Button, Input, Label
- Table, TableHeader, TableBody, TableRow, TableCell, TableHead
- Select, SelectTrigger, SelectContent, SelectItem, SelectValue
- Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose
- DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem

---

## Component Structure

### Directory Structure

```
app/(main)/finance/account-code-mapping/
└── page.tsx                          # Route page (imports component)

components/
└── account-code-mapping.tsx          # Main feature component (836 lines)
```

### Component Hierarchy

```
AccountCodeMappingPage
└── AccountCodeMapping (Client Component)
    ├── Header Section
    │   ├── Title: "Account Code Mapping"
    │   └── Action Buttons
    │       ├── Scan Button
    │       ├── Import/Export Button
    │       ├── Print Button
    │       └── Create Button
    │
    ├── Filter Section
    │   ├── Search Input
    │   └── View Selector (Select dropdown)
    │       ├── "posting-to-ap" - Posting to AP
    │       └── "posting-to-gl" - Posting to GL
    │
    ├── Conditional Table Rendering
    │   ├── AP Mapping Table (when selectedView === "posting-to-ap")
    │   │   └── Columns: Business Unit, Store, Category, Sub-Category,
    │   │                Item Group, Department, Account Code, Actions
    │   │
    │   └── GL Mapping Table (when selectedView === "posting-to-gl")
    │       └── Columns: Business Unit, Store, Category, Item Group,
    │                    Movement Type, Dr. Dept, Cr. Dept, Dr. Account,
    │                    Cr. Account, Actions
    │
    ├── Footer Description
    │   └── Context-sensitive description of current view
    │
    └── Dialogs
        ├── View Dialog (read-only display)
        ├── Create Dialog (form for new mapping)
        └── Edit Dialog (form for existing mapping)
```

---

## Page Descriptions

### Main Page: Account Code Mapping List
**Route**: `/finance/account-code-mapping`
**File**: `page.tsx`
**Purpose**: Display and manage account code mappings

**Sections**:
- **Header**: Page title and action toolbar
- **Filter Bar**: Search input and view selector
- **Data Table**: AP or GL mappings based on selected view
- **Footer**: Contextual help text explaining the current view

**Views**:
| View Name | Description |
|-----------|-------------|
| Posting to AP | AP mappings with single account code (debit only) |
| Posting to GL | GL mappings with debit/credit account pairs |

**Dialogs**:
| Dialog | Trigger | Purpose |
|--------|---------|---------|
| View | Eye icon in row actions | Read-only display of mapping details |
| Create | Create button in header | Form to add new mapping |
| Edit | Edit icon in row actions | Form to modify existing mapping |

---

## Data Structures

### APMapping Interface
**Purpose**: Represents Accounts Payable mapping records

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| businessUnit | string | Business unit (Operations, Rooms, Administration) |
| store | string | Store/location name or code |
| category | string | Item category (Food, Beverage) |
| subCategory | string | Item sub-category |
| itemGroup | string | Item group classification |
| department | string | Department code |
| accountCode | string | GL account code (debit) |

### GLMapping Interface
**Purpose**: Represents General Ledger mapping records

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| businessUnit | string | Business unit |
| store | string | Store/location |
| category | string | Item category |
| itemGroup | string | Item group |
| movementType | string | Transaction type (Purchase, Transfer, Sale, Usage) |
| drDepartment | string | Debit department |
| crDepartment | string | Credit department |
| drAccount | string | Debit GL account |
| crAccount | string | Credit GL account |

---

## State Management

### Component State (useState)

| State Variable | Type | Initial Value | Purpose |
|----------------|------|---------------|---------|
| selectedView | string | "posting-to-ap" | Current view toggle |
| searchTerm | string | "" | Search filter value |
| isCreateDialogOpen | boolean | false | Create dialog visibility |
| isEditDialogOpen | boolean | false | Edit dialog visibility |
| isViewDialogOpen | boolean | false | View dialog visibility |
| selectedMapping | APMapping \| GLMapping \| null | null | Currently selected record |
| apMappingData | APMapping[] | Mock data (6 records) | AP mappings list |
| glMappingData | GLMapping[] | Mock data (5 records) | GL mappings list |
| formData | Partial\<APMapping \| GLMapping\> | {} | Form field values |

### Side Effects (useEffect)

| Effect | Dependency | Purpose |
|--------|------------|---------|
| Clear selectedMapping | isViewDialogOpen | Reset selection when view dialog closes |
| Clear formData | isCreateDialogOpen | Reset form when create dialog closes |
| Clear formData and selectedMapping | isEditDialogOpen | Reset form and selection when edit dialog closes |

---

## Event Handlers

### Action Handlers

| Handler | Trigger | Action |
|---------|---------|--------|
| handleCreate | Create button click | Open create dialog with empty form |
| handleView | Eye menu item click | Open view dialog with selected mapping |
| handleEdit | Edit menu item click | Open edit dialog with mapping data |
| handleDelete | Delete menu item click | Confirm and remove mapping from state |
| handleDuplicate | Duplicate menu item click | Clone mapping with new ID |
| handleSaveCreate | Create dialog save | Add new mapping to state, close dialog |
| handleSaveEdit | Edit dialog save | Update mapping in state, close dialog |
| handleScan | Scan button click | Show placeholder alert (not implemented) |
| handleImportExport | Import/Export button click | Show placeholder alert (not implemented) |
| handlePrint | Print button click | Trigger browser print dialog |

### Filter Logic

**Search Filtering**: Both AP and GL data are filtered using case-insensitive search across all field values:

```
filteredData = data.filter(row =>
  Object.values(row).some(val =>
    val.toString().toLowerCase().includes(searchTerm.toLowerCase())
  )
)
```

---

## UI Features

### Action Toolbar Buttons

| Button | Icon | Action | Status |
|--------|------|--------|--------|
| Scan | ScanIcon | Scan for new codes | Placeholder |
| Import/Export | DownloadIcon | Import/export mappings | Placeholder |
| Print | PrinterIcon | Print current view | Implemented |
| Create | Plus | Open create dialog | Implemented |

### Row Actions Menu

| Action | Icon | Description |
|--------|------|-------------|
| View | Eye | Open read-only detail dialog |
| Edit | Edit | Open edit form dialog |
| Duplicate | Copy | Create copy with new ID |
| Delete | Trash2 | Remove with confirmation |

### Empty State

When no mappings match the search filter, displays centered message:
"No mappings found"

---

## Mock Data

### AP Mappings (6 records)
Business units: Operations, Rooms, Administration
Stores: Mini Bar, MIN1, Rooms - Housekeeping, RH, A&G - Security, AGS
Categories: Beverage, Food
Account codes: 5000020, 1116007, 1111005

### GL Mappings (5 records)
Stores: Kitchen, Bar, Housekeeping, Office
Movement types: Purchase, Transfer, Sale, Usage
Account ranges: 1100001-1200004, 4000001, 5001001-5001002, 6001001-6002001

---

## Integration Points

### Current Integrations
- **Browser Print API**: window.print() for printing current view

### Planned Integrations (Placeholder)
- **Code Scanner**: Detect new location codes, item groups, transaction combinations
- **Import/Export**: CSV import/export of mapping configurations

---

## Accessibility

- Dialogs use proper ARIA structure (DialogTitle, DialogDescription)
- Tables use semantic header cells
- Buttons have appropriate labels
- Screen reader support via sr-only classes for icon-only buttons

---

## Source Code Location

```
app/(main)/finance/account-code-mapping/
└── page.tsx                    # 5 lines

components/
└── account-code-mapping.tsx    # 836 lines
```

---

**Document End**
