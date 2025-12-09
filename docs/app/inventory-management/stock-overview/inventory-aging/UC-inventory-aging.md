# Use Cases: Inventory Aging

## Document Information
| Field | Value |
|-------|-------|
| Module | Inventory Management |
| Sub-module | Inventory Aging |
| Version | 1.0 |
| Last Updated | 2024-01-15 |

---

## 1. View Inventory Aging

### UC-AG-001: View Aging Summary
**Actor**: Quality Manager, Inventory Manager

**Preconditions**:
- User is authenticated
- User has access to inventory aging module

**Main Flow**:
1. User navigates to Inventory Management > Stock Overview > Inventory Aging
2. System displays loading state
3. System loads aging items with permission filtering
4. System calculates summary statistics
5. System calculates value at risk
6. System displays summary cards
7. System displays item list in default view

**Postconditions**:
- User sees aging items for permitted locations
- Value at risk displayed prominently

---

### UC-AG-002: View Item Age Details
**Actor**: Storekeeper, Quality Manager

**Preconditions**:
- Inventory aging page is loaded

**Main Flow**:
1. User views item in list
2. User sees product code, name, category
3. User sees received date and age in days
4. User sees age bucket badge
5. User sees expiry date and days to expiry
6. User sees expiry status badge
7. User sees quantity and value

**Postconditions**:
- User understands item age and expiry status

---

## 2. Filter Aging Items

### UC-AG-003: Search Items
**Actor**: All Users

**Preconditions**:
- Inventory aging page is loaded

**Main Flow**:
1. User types in search box
2. System filters by product name or code
3. System updates display in real-time
4. System updates summary statistics

**Postconditions**:
- Only matching items displayed

---

### UC-AG-004: Filter by Category
**Actor**: Inventory Manager

**Preconditions**:
- Inventory aging page is loaded

**Main Flow**:
1. User clicks category dropdown
2. User selects category
3. System filters items by category
4. System updates all displays

**Postconditions**:
- Only items in selected category shown

---

### UC-AG-005: Filter by Age Bucket
**Actor**: Inventory Manager

**Preconditions**:
- Inventory aging page is loaded

**Main Flow**:
1. User clicks age bucket dropdown
2. User selects bucket (0-30, 31-60, 61-90, 90+)
3. System filters items by age bucket
4. System updates displays

**Postconditions**:
- Only items in selected age bucket shown

---

### UC-AG-006: Filter by Expiry Status
**Actor**: Quality Manager

**Preconditions**:
- Inventory aging page is loaded

**Main Flow**:
1. User clicks expiry status dropdown
2. User selects status (Good, Expiring Soon, Critical, Expired, No Expiry)
3. System filters items by expiry status
4. System updates displays

**Postconditions**:
- Only items with selected expiry status shown
- Useful for finding critical items

---

### UC-AG-007: Filter by Location
**Actor**: Storekeeper

**Preconditions**:
- Inventory aging page is loaded
- User has multiple locations assigned

**Main Flow**:
1. User clicks location dropdown
2. User selects location
3. System filters items by location
4. System updates displays

**Postconditions**:
- Only items at selected location shown

---

## 3. Analyze Aging Data

### UC-AG-008: View Analytics Dashboard
**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- Inventory aging page is loaded

**Main Flow**:
1. User clicks "Analytics" tab
2. System displays age distribution area chart
3. System displays expiry status pie chart
4. System displays category age analysis
5. System displays value at risk breakdown

**Postconditions**:
- User understands age and expiry distribution

---

### UC-AG-009: Analyze Age Distribution
**Actor**: Inventory Manager

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views age distribution area chart
2. User sees stacked areas for each age bucket
3. User identifies trends over time
4. User hovers for exact counts

**Postconditions**:
- User understands inventory age profile

---

### UC-AG-010: Analyze Expiry Status
**Actor**: Quality Manager

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views expiry status pie chart
2. User sees percentage breakdown
3. User identifies dominant status
4. User focuses on critical/expired segments

**Postconditions**:
- User understands expiry risk distribution

---

### UC-AG-011: Assess Value at Risk
**Actor**: Financial Controller

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views value at risk section
2. User sees expired value
3. User sees critical value
4. User sees expiring soon value
5. User sees total value at risk

**Postconditions**:
- User can prioritize by financial impact

---

### UC-AG-012: Analyze by Category
**Actor**: Inventory Manager

**Preconditions**:
- Analytics tab is active

**Main Flow**:
1. User views category analysis chart
2. User sees average age per category
3. User identifies categories with oldest inventory
4. User plans category-specific actions

**Postconditions**:
- User identifies problem categories

---

## 4. Use Grouped Views

### UC-AG-013: Group by Location
**Actor**: Inventory Manager

**Preconditions**:
- Inventory aging page is loaded

**Main Flow**:
1. User selects "Grouped" view mode
2. User selects "Group by Location" option
3. System groups items by location
4. System shows expand/collapse controls
5. System displays subtotals per location

**Postconditions**:
- Items organized by location
- Location-specific analysis possible

---

### UC-AG-014: Group by Age Bucket
**Actor**: Inventory Manager

**Preconditions**:
- Inventory aging page is loaded

**Main Flow**:
1. User selects "Grouped" view mode
2. User selects "Group by Age Bucket" option
3. System groups items by age bucket
4. System shows oldest items first (90+ at top)
5. System displays subtotals per bucket

**Postconditions**:
- Items organized by age
- FIFO planning facilitated

---

### UC-AG-015: Expand/Collapse Groups
**Actor**: All Users

**Preconditions**:
- Grouped view is active

**Main Flow**:
1. User clicks expand icon on group header
2. System expands group to show items
3. User clicks collapse icon
4. System collapses group

**Postconditions**:
- User can focus on specific groups

---

## 5. Take Action on Items

### UC-AG-016: View Action Center
**Actor**: Inventory Manager, Quality Manager

**Preconditions**:
- User has action permission

**Main Flow**:
1. User clicks "Action Center" tab
2. System displays items by expiry priority
3. System shows expired items first
4. System shows critical items next
5. User sees recommended actions

**Postconditions**:
- User sees prioritized action queue

---

### UC-AG-017: Mark for Disposal
**Actor**: Quality Manager

**Preconditions**:
- Item is expired

**Main Flow**:
1. User selects expired item
2. User clicks "Dispose" action
3. System opens disposal dialog
4. User enters disposal reason
5. User selects disposal method
6. System creates disposal record

**Postconditions**:
- Item marked for disposal
- Audit record created

---

### UC-AG-018: Initiate FIFO Transfer
**Actor**: Inventory Manager

**Preconditions**:
- Item is in 90+ age bucket

**Main Flow**:
1. User selects old item
2. User clicks "Transfer" action
3. System suggests high-demand locations
4. User confirms transfer
5. System creates transfer request

**Postconditions**:
- Transfer initiated for FIFO compliance

---

### UC-AG-019: View FIFO Recommendations
**Actor**: Storekeeper

**Preconditions**:
- Action Center is active

**Main Flow**:
1. User views FIFO recommendations section
2. System shows items by received date (oldest first)
3. User sees suggested usage order
4. User plans issues accordingly

**Postconditions**:
- User can follow FIFO guidelines

---

## 6. Export Data

### UC-AG-020: Export Aging Report
**Actor**: Inventory Manager, Financial Controller

**Preconditions**:
- Data is loaded

**Main Flow**:
1. User clicks "Export" button
2. System generates export with current filters
3. System includes age and expiry data
4. File downloads to user's device

**Postconditions**:
- Export file contains filtered data with all fields

---

### UC-AG-021: Export Expiry Report
**Actor**: Quality Manager

**Preconditions**:
- Expiry filter is applied

**Main Flow**:
1. User filters by expiry status (e.g., Critical)
2. User clicks "Export"
3. System exports filtered expiring items
4. Report includes expiry dates and values

**Postconditions**:
- Expiry-focused report generated

---

## 7. Access Control

### UC-AG-022: Location-Based Access
**Actor**: System (automatic)

**Preconditions**:
- User is authenticated

**Main Flow**:
1. System retrieves user context
2. System checks user role
3. If not System Administrator/Quality Manager:
   - System filters by availableLocations
4. System displays permitted items only

**Postconditions**:
- User sees only authorized data

---

## Use Case Summary Matrix

| UC ID | Use Case | Primary Actor | Priority |
|-------|----------|---------------|----------|
| UC-AG-001 | View Aging Summary | Quality Manager | High |
| UC-AG-002 | View Item Age Details | Storekeeper | High |
| UC-AG-003 | Search Items | All Users | High |
| UC-AG-004 | Filter by Category | Inventory Manager | Medium |
| UC-AG-005 | Filter by Age Bucket | Inventory Manager | High |
| UC-AG-006 | Filter by Expiry Status | Quality Manager | High |
| UC-AG-007 | Filter by Location | Storekeeper | Medium |
| UC-AG-008 | View Analytics Dashboard | Financial Controller | High |
| UC-AG-009 | Analyze Age Distribution | Inventory Manager | Medium |
| UC-AG-010 | Analyze Expiry Status | Quality Manager | High |
| UC-AG-011 | Assess Value at Risk | Financial Controller | High |
| UC-AG-012 | Analyze by Category | Inventory Manager | Medium |
| UC-AG-013 | Group by Location | Inventory Manager | Medium |
| UC-AG-014 | Group by Age Bucket | Inventory Manager | High |
| UC-AG-015 | Expand/Collapse Groups | All Users | Low |
| UC-AG-016 | View Action Center | Quality Manager | High |
| UC-AG-017 | Mark for Disposal | Quality Manager | High |
| UC-AG-018 | Initiate FIFO Transfer | Inventory Manager | High |
| UC-AG-019 | View FIFO Recommendations | Storekeeper | High |
| UC-AG-020 | Export Aging Report | Financial Controller | High |
| UC-AG-021 | Export Expiry Report | Quality Manager | High |
| UC-AG-022 | Location-Based Access | System | Critical |
