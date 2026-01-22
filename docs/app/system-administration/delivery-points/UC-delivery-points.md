# Use Cases: Delivery Points

## Module Information
- **Module**: System Administration
- **Sub-Module**: Delivery Points
- **Route**: `/system-administration/delivery-points`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-17

---

## UC-DP-001: View Delivery Points List

**Actor**: Operations Manager, Receiving Clerk

**Preconditions**: User has access to System Administration module

**Main Flow**:
1. User navigates to System Administration > Delivery Points
2. System displays table with all delivery points
3. Table shows Name and Status columns
4. Badge shows total count of filtered results

**Alternative Flows**:
- **No delivery points exist**: Show empty state with truck icon
- **Search active**: Show matching results only

---

## UC-DP-002: Search Delivery Points

**Actor**: Operations Manager

**Preconditions**: Delivery points list is displayed

**Main Flow**:
1. User enters text in search field
2. System filters list in real-time by name
3. Results update as user types

**Alternative Flows**:
- **No matches**: Show empty state with "Clear search" button

---

## UC-DP-003: Filter by Status

**Actor**: Operations Manager

**Preconditions**: Delivery points list is displayed

**Main Flow**:
1. User clicks Status dropdown
2. User selects "All", "Active", or "Inactive"
3. System filters list by selected status

---

## UC-DP-004: Sort Delivery Points

**Actor**: Operations Manager

**Preconditions**: Delivery points list is displayed

**Main Flow**:
1. User clicks column header (Name or Status)
2. System sorts by that column ascending
3. User clicks same column again
4. System reverses sort direction

---

## UC-DP-005: Create Delivery Point

**Actor**: Operations Manager

**Preconditions**: User on Delivery Points page

**Main Flow**:
1. User clicks "Add Delivery Point" button
2. System opens dialog with empty form
3. User enters Name (required)
4. Active toggle defaults to ON
5. User clicks "Add Delivery Point"
6. System creates record and closes dialog
7. New entry appears in list

**Exception Flows**:
- **Name empty**: Submit button disabled
- **Cancel clicked**: Dialog closes, no changes

---

## UC-DP-006: Edit Delivery Point

**Actor**: Operations Manager

**Preconditions**: Delivery point exists

**Main Flow**:
1. User clicks row menu (three dots)
2. User selects "Edit"
3. System opens dialog with current values
4. User modifies Name and/or Active status
5. User clicks "Save Changes"
6. System updates record and closes dialog
7. Changes reflected in list

**Exception Flows**:
- **Name cleared**: Submit button disabled
- **Cancel clicked**: Dialog closes, changes discarded

---

## UC-DP-007: Delete Delivery Point

**Actor**: Operations Manager

**Preconditions**: Delivery point exists

**Main Flow**:
1. User clicks row menu (three dots)
2. User selects "Delete"
3. System shows confirmation dialog with name
4. User clicks "Delete"
5. System removes record
6. Row removed from list

**Alternative Flows**:
- **Cancel clicked**: Dialog closes, no deletion

---

## UC-DP-008: Toggle Active Status

**Actor**: Operations Manager

**Preconditions**: Editing a delivery point

**Main Flow**:
1. User opens Edit dialog
2. User toggles Active switch
3. User saves changes
4. Status badge updates (green for Active, gray for Inactive)

---

**Document End**
