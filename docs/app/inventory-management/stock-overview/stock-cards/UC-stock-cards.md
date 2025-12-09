# Use Cases: Stock Cards

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Stock Cards |
| Version | 1.0 |
| Last Updated | 2024-01-15 |

---

## 1. View Stock Cards

### UC-SC-001: View Stock Card List
**Actor**: Storekeeper, Inventory Manager

**Preconditions**:
- User is authenticated
- User has access to stock cards module

**Main Flow**:
1. User navigates to Inventory Management > Stock Overview > Stock Cards
2. System displays loading skeleton
3. System loads products with location filtering
4. System calculates summary statistics
5. System displays summary cards
6. System displays products in default List view

**Postconditions**:
- User sees products for permitted locations
- Summary statistics reflect filtered data

---

### UC-SC-002: Switch View Mode
**Actor**: All Users

**Preconditions**:
- Stock cards page is loaded

**Main Flow**:
1. User clicks view mode toggle (List/Cards/Grouped)
2. System switches to selected view
3. System re-renders products in new format
4. System maintains current filter state

**Alternative Flows**:
- **AF1**: Grouped view calculates location groupings
- **AF2**: Cards view renders responsive grid

---

## 2. Filter Products

### UC-SC-003: Search Products
**Actor**: All Users

**Preconditions**:
- Stock cards page is loaded

**Main Flow**:
1. User types in search box
2. System filters products by name or code
3. System updates display in real-time
4. System updates summary statistics

**Postconditions**:
- Products matching search term displayed
- Statistics reflect filtered data

---

### UC-SC-004: Filter by Category
**Actor**: Inventory Manager

**Preconditions**:
- Stock cards page is loaded

**Main Flow**:
1. User clicks category dropdown
2. User selects category
3. System filters products by category
4. System updates display and statistics

**Postconditions**:
- Only products in selected category shown
- Category count updated in summary

---

### UC-SC-005: Filter by Status
**Actor**: Inventory Manager

**Preconditions**:
- Stock cards page is loaded

**Main Flow**:
1. User clicks status dropdown
2. User selects status (Active/Inactive)
3. System filters products by status
4. System updates display

**Postconditions**:
- Products filtered by status
- Active/inactive count updated

---

### UC-SC-006: Filter by Stock Level
**Actor**: Storekeeper

**Preconditions**:
- Stock cards page is loaded

**Main Flow**:
1. User clicks stock level dropdown
2. User selects level (Low/Normal/High)
3. System filters products by stock level
4. System updates display

**Postconditions**:
- Products at selected stock level shown
- Stock level counts updated

---

### UC-SC-007: Combine Multiple Filters
**Actor**: All Users

**Preconditions**:
- Stock cards page is loaded

**Main Flow**:
1. User applies search filter
2. User applies category filter
3. User applies status filter
4. User applies stock level filter
5. System combines filters with AND logic
6. System displays matching products

**Postconditions**:
- Products matching ALL criteria displayed
- Summary reflects combined filtering

---

## 3. Sort Products

### UC-SC-008: Sort by Column
**Actor**: All Users

**Preconditions**:
- Stock cards in List view

**Main Flow**:
1. User clicks column header
2. System sorts by selected column ascending
3. System displays sort indicator
4. User clicks same header again
5. System toggles to descending

**Postconditions**:
- Products sorted by selected column
- Sort direction indicated visually

---

## 4. View Product Details

### UC-SC-009: Navigate to Stock Card
**Actor**: Storekeeper, Inventory Manager

**Preconditions**:
- Products displayed in any view

**Main Flow**:
1. User clicks product row (List) or card (Cards)
2. System navigates to stock card detail page
3. System loads product with productId query param

**Postconditions**:
- User on stock card detail page
- Product details displayed

---

## 5. Grouped View Operations

### UC-SC-010: Expand Location Group
**Actor**: All Users

**Preconditions**:
- Products in Grouped view

**Main Flow**:
1. User clicks expand icon on location row
2. System expands group
3. System shows products at that location
4. System displays subtotals

**Postconditions**:
- Location group expanded
- Products and subtotals visible

---

### UC-SC-011: Collapse Location Group
**Actor**: All Users

**Preconditions**:
- Location group is expanded

**Main Flow**:
1. User clicks collapse icon
2. System collapses group
3. System hides products under group

**Postconditions**:
- Group collapsed
- Only summary row visible

---

### UC-SC-012: Expand All Groups
**Actor**: All Users

**Preconditions**:
- Products in Grouped view

**Main Flow**:
1. User clicks "Expand All" button
2. System expands all location groups
3. System displays all products with subtotals

**Postconditions**:
- All groups expanded
- All products visible

---

### UC-SC-013: Collapse All Groups
**Actor**: All Users

**Preconditions**:
- Some groups are expanded

**Main Flow**:
1. User clicks "Collapse All" button
2. System collapses all groups
3. System shows only summary rows

**Postconditions**:
- All groups collapsed
- Only group summaries visible

---

## 6. Cards View Operations

### UC-SC-014: View Card Details
**Actor**: All Users

**Preconditions**:
- Products in Cards view

**Main Flow**:
1. User views product card
2. User sees code, name, category, status
3. User sees stock level badge
4. User sees progress bar
5. User sees value and location count

**Postconditions**:
- Card displays all key metrics
- Visual indicators show stock status

---

### UC-SC-015: Click Card to Navigate
**Actor**: All Users

**Preconditions**:
- Products in Cards view

**Main Flow**:
1. User clicks product card
2. System navigates to stock card detail
3. System loads product details

**Postconditions**:
- User on stock card detail page

---

## 7. Export Data

### UC-SC-016: Export Stock Cards
**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- Products loaded with filters

**Main Flow**:
1. User clicks Export button
2. System generates export data
3. System includes filtered products
4. System downloads file

**Postconditions**:
- File downloaded with filtered data
- Filename includes date

---

### UC-SC-017: Export Grouped Data
**Actor**: Inventory Manager

**Preconditions**:
- Products in Grouped view

**Main Flow**:
1. User clicks Export button
2. System generates grouped export
3. System includes subtotals
4. System downloads file

**Postconditions**:
- Export includes group structure
- Subtotals included

---

## 8. Refresh Data

### UC-SC-018: Refresh Stock Cards
**Actor**: All Users

**Preconditions**:
- Stock cards page is loaded

**Main Flow**:
1. User clicks Refresh button
2. System shows loading state
3. System reloads product data
4. System updates display

**Postconditions**:
- Data refreshed from source
- Display updated

---

## 9. Access Control

### UC-SC-019: Location-Based Access
**Actor**: System (automatic)

**Preconditions**:
- User is authenticated

**Main Flow**:
1. System retrieves user context
2. System checks user role
3. If not System Administrator:
   - System filters by `availableLocations`
4. System displays permitted products

**Postconditions**:
- User sees only authorized products
- Statistics reflect filtered data

---

## Use Case Summary Matrix

| UC ID | Use Case | Primary Actor | Priority |
|-------|----------|---------------|----------|
| UC-SC-001 | View Stock Card List | All Users | High |
| UC-SC-002 | Switch View Mode | All Users | High |
| UC-SC-003 | Search Products | All Users | High |
| UC-SC-004 | Filter by Category | Inventory Manager | Medium |
| UC-SC-005 | Filter by Status | Inventory Manager | Medium |
| UC-SC-006 | Filter by Stock Level | Storekeeper | High |
| UC-SC-007 | Combine Multiple Filters | All Users | Medium |
| UC-SC-008 | Sort by Column | All Users | Medium |
| UC-SC-009 | Navigate to Stock Card | Storekeeper | High |
| UC-SC-010 | Expand Location Group | All Users | Medium |
| UC-SC-011 | Collapse Location Group | All Users | Medium |
| UC-SC-012 | Expand All Groups | All Users | Low |
| UC-SC-013 | Collapse All Groups | All Users | Low |
| UC-SC-014 | View Card Details | All Users | Medium |
| UC-SC-015 | Click Card to Navigate | All Users | High |
| UC-SC-016 | Export Stock Cards | Financial Controller | High |
| UC-SC-017 | Export Grouped Data | Inventory Manager | Medium |
| UC-SC-018 | Refresh Stock Cards | All Users | Medium |
| UC-SC-019 | Location-Based Access | System | Critical |
