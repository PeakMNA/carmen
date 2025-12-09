# Use Cases: Slow Moving Inventory

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Slow Moving |
| Version | 1.0 |
| Last Updated | 2024-01-15 |

---

## 1. View Slow Moving Inventory

### UC-SM-001: View Slow Moving Summary
**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- User is authenticated
- User has access to slow moving module

**Main Flow**:
1. User navigates to Inventory Management > Stock Overview > Slow Moving
2. System displays loading state
3. System loads slow-moving items with permission filtering
4. System calculates summary statistics
5. System displays summary cards (Total Items, Value, Avg Days, etc.)
6. System displays item list in default view

**Postconditions**:
- User sees slow-moving items for permitted locations
- Summary statistics reflect filtered data

---

### UC-SM-002: View Item Details
**Actor**: Storekeeper, Inventory Manager

**Preconditions**:
- Slow moving page is loaded

**Main Flow**:
1. User views item in list
2. User sees product code, name, category
3. User sees current stock and value
4. User sees days idle and risk level
5. User sees suggested action

**Postconditions**:
- User understands item status and recommendation

---

## 2. Filter Slow Moving Items

### UC-SM-003: Search Items
**Actor**: All Users

**Preconditions**:
- Slow moving page is loaded

**Main Flow**:
1. User types in search box
2. System filters by product name or code
3. System updates display in real-time
4. System updates summary statistics

**Postconditions**:
- Only matching items displayed
- Statistics reflect filtered data

---

### UC-SM-004: Filter by Category
**Actor**: Inventory Manager

**Preconditions**:
- Slow moving page is loaded

**Main Flow**:
1. User clicks category dropdown
2. User selects category
3. System filters items by category
4. System updates all displays

**Postconditions**:
- Only items in selected category shown

---

### UC-SM-005: Filter by Risk Level
**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- Slow moving page is loaded

**Main Flow**:
1. User clicks risk level dropdown
2. User selects level (Low/Medium/High/Critical)
3. System filters items by risk level
4. System updates displays and statistics

**Postconditions**:
- Only items at selected risk level shown
- Useful for prioritizing critical items

---

### UC-SM-006: Filter by Suggested Action
**Actor**: Inventory Manager

**Preconditions**:
- Slow moving page is loaded

**Main Flow**:
1. User clicks action dropdown
2. User selects action (Transfer/Promote/Write Off/Hold)
3. System filters items by suggested action
4. System updates displays

**Postconditions**:
- Only items with selected action shown
- Enables batch action planning

---

### UC-SM-007: Filter by Location
**Actor**: Storekeeper, Inventory Manager

**Preconditions**:
- Slow moving page is loaded
- User has multiple locations assigned

**Main Flow**:
1. User clicks location dropdown
2. User selects location
3. System filters items by location
4. System updates displays

**Postconditions**:
- Only items at selected location shown

---

## 3. Analyze Slow Moving Data

### UC-SM-008: View Analytics Dashboard
**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- Slow moving page is loaded

**Main Flow**:
1. User clicks "Analytics" tab
2. System displays risk distribution pie chart
3. System displays category breakdown bar chart
4. System displays value at risk analysis
5. User hovers for detailed tooltips

**Postconditions**:
- User understands risk distribution
- User identifies high-value problem areas

---

### UC-SM-009: Analyze Risk Distribution
**Actor**: Financial Controller

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views risk distribution pie chart
2. User sees percentage breakdown by risk level
3. User identifies dominant risk category
4. User hovers for exact counts

**Postconditions**:
- User understands overall risk profile

---

### UC-SM-010: Analyze Category Breakdown
**Actor**: Inventory Manager

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views category bar chart
2. User identifies categories with most slow-moving items
3. User compares category volumes
4. User plans category-specific actions

**Postconditions**:
- User identifies problem categories

---

### UC-SM-011: Assess Value at Risk
**Actor**: Financial Controller

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views value at risk section
2. User sees total value by risk level
3. User identifies highest-value items
4. User prioritizes based on value impact

**Postconditions**:
- User can prioritize by financial impact

---

## 4. Take Action on Items

### UC-SM-012: View Action Center
**Actor**: Inventory Manager

**Preconditions**:
- User has action permission

**Main Flow**:
1. User clicks "Action Center" tab
2. System displays pending actions
3. System sorts by priority (risk level, value)
4. User sees recommended actions for each item

**Postconditions**:
- User sees prioritized action queue

---

### UC-SM-013: Initiate Transfer
**Actor**: Inventory Manager

**Preconditions**:
- Item has "Transfer" recommendation
- User has transfer permission

**Main Flow**:
1. User selects item in Action Center
2. User clicks "Transfer" action
3. System opens transfer dialog
4. User selects destination location
5. User confirms transfer quantity
6. System initiates transfer process

**Postconditions**:
- Transfer request created
- Item action status updated

---

### UC-SM-014: Initiate Promotion
**Actor**: Inventory Manager

**Preconditions**:
- Item has "Promote" recommendation

**Main Flow**:
1. User selects item in Action Center
2. User clicks "Promote" action
3. System opens promotion dialog
4. User sets promotional price/discount
5. User sets promotion period
6. System creates promotion

**Postconditions**:
- Promotion created for item
- Item status updated

---

### UC-SM-015: Execute Write-Off
**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- Item has "Write Off" recommendation
- User has write-off permission

**Main Flow**:
1. User selects item in Action Center
2. User clicks "Write Off" action
3. System shows confirmation dialog
4. User enters reason/justification
5. User confirms write-off
6. System processes inventory adjustment

**Postconditions**:
- Item written off from inventory
- Adjustment record created

---

### UC-SM-016: Mark as Hold
**Actor**: Inventory Manager

**Preconditions**:
- Item displayed in list

**Main Flow**:
1. User selects item
2. User clicks "Hold" action
3. System updates item status to Hold
4. Item remains in monitoring

**Postconditions**:
- Item marked for continued monitoring

---

## 5. View Modes

### UC-SM-017: Switch to List View
**Actor**: All Users

**Preconditions**:
- Slow moving page is loaded

**Main Flow**:
1. User clicks "List" view toggle
2. System displays items in table format
3. User can sort by columns
4. User can click rows for details

**Postconditions**:
- Items displayed in list format

---

### UC-SM-018: Switch to Grouped View
**Actor**: All Users

**Preconditions**:
- Slow moving page is loaded

**Main Flow**:
1. User clicks "Grouped" view toggle
2. System groups items by location
3. User can expand/collapse groups
4. User sees subtotals per location

**Postconditions**:
- Items displayed grouped by location

---

## 6. Export Data

### UC-SM-019: Export Slow Moving Report
**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- Data is loaded

**Main Flow**:
1. User clicks "Export" button
2. System generates export with current filters
3. System includes all fields
4. File downloads to user's device

**Postconditions**:
- Export file contains filtered data

---

## 7. Access Control

### UC-SM-020: Location-Based Access
**Actor**: System (automatic)

**Preconditions**:
- User is authenticated

**Main Flow**:
1. System retrieves user context
2. System checks user role
3. If not System Administrator:
   - System filters by availableLocations
4. System displays permitted items only

**Postconditions**:
- User sees only authorized data

---

## Use Case Summary Matrix

| UC ID | Use Case | Primary Actor | Priority |
|-------|----------|---------------|----------|
| UC-SM-001 | View Slow Moving Summary | Inventory Manager | High |
| UC-SM-002 | View Item Details | All Users | High |
| UC-SM-003 | Search Items | All Users | High |
| UC-SM-004 | Filter by Category | Inventory Manager | Medium |
| UC-SM-005 | Filter by Risk Level | Financial Controller | High |
| UC-SM-006 | Filter by Action | Inventory Manager | High |
| UC-SM-007 | Filter by Location | Storekeeper | Medium |
| UC-SM-008 | View Analytics Dashboard | Financial Controller | High |
| UC-SM-009 | Analyze Risk Distribution | Financial Controller | High |
| UC-SM-010 | Analyze Category Breakdown | Inventory Manager | Medium |
| UC-SM-011 | Assess Value at Risk | Financial Controller | High |
| UC-SM-012 | View Action Center | Inventory Manager | High |
| UC-SM-013 | Initiate Transfer | Inventory Manager | High |
| UC-SM-014 | Initiate Promotion | Inventory Manager | Medium |
| UC-SM-015 | Execute Write-Off | Financial Controller | High |
| UC-SM-016 | Mark as Hold | Inventory Manager | Low |
| UC-SM-017 | Switch to List View | All Users | Medium |
| UC-SM-018 | Switch to Grouped View | All Users | Medium |
| UC-SM-019 | Export Report | Financial Controller | High |
| UC-SM-020 | Location-Based Access | System | Critical |
