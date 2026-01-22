# Use Cases: Transaction Categories

**Module**: Inventory Management
**Sub-module**: Transaction Categories
**Version**: 1.0.0
**Last Updated**: 2025-01-16
**Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-16 | Documentation Team | Initial version |

---

## Related Documentation
- [Business Requirements](./BR-transaction-categories.md)
- [Technical Specification](./TS-transaction-categories.md)
- [Data Definition](./DD-transaction-categories.md)
- [Flow Diagrams](./FD-transaction-categories.md)
- [Validations](./VAL-transaction-categories.md)

---

## Use Case Index

### User Use Cases
- **UC-TXC-001**: View Category List
- **UC-TXC-002**: Search and Filter Categories
- **UC-TXC-003**: View Category Details
- **UC-TXC-004**: Create New Category
- **UC-TXC-005**: Edit Category
- **UC-TXC-006**: Delete Category
- **UC-TXC-007**: Add Reason to Category
- **UC-TXC-008**: Edit Reason
- **UC-TXC-009**: Delete Reason
- **UC-TXC-010**: Toggle Reason Status

---

## User Use Cases

### UC-TXC-001: View Category List

**Actor(s)**: Financial Controller, System Administrator

**Priority**: High

**Preconditions**:
- User is authenticated
- User has permission to view transaction categories

**Postconditions**:
- Category list displayed with all records
- User can navigate to detail pages

**Main Flow**:
1. User navigates to `/inventory-management/transaction-categories`
2. System displays page header with title "Transaction Categories" and description
3. System displays three-tab navigation: All Categories, Stock In, Stock Out
4. System displays "All Categories" tab by default with "Add Category" button
5. System loads all categories from data source
6. System counts reasons per category
7. System renders table with columns: Code, Name, Type, GL Account, Reasons, Status, Actions
8. User can click on any row to navigate to detail page

**Alternative Flows**:

**AF-001: Switch to Stock In Tab**
- User clicks "Stock In" tab
- System filters to show only type='IN' categories
- System shows "Add Stock In Category" button (green)

**AF-002: Switch to Stock Out Tab**
- User clicks "Stock Out" tab
- System filters to show only type='OUT' categories
- System shows "Add Stock Out Category" button (red)

**Exception Flows**:

**EF-001: No Categories**
- At step 7: No categories exist
- System displays empty state: "No categories found"

**Source Evidence**: `page.tsx:71-171`, `components/category-list.tsx:291-398`

---

### UC-TXC-002: Search and Filter Categories

**Actor(s)**: Financial Controller, System Administrator

**Priority**: Medium

**Preconditions**:
- User is on category list page
- Categories are loaded

**Postconditions**:
- List filtered according to criteria
- Result count updated

**Main Flow**:
1. User types in search box
2. System filters in real-time (300ms debounce)
3. System searches across: code, name, glAccountCode, glAccountName, description
4. System displays matching categories
5. System shows count: "Showing X of Y categories"

**Alternative Flows**:

**AF-001: Filter by Status**
- User selects status from dropdown (All, Active, Inactive)
- System applies status filter to results
- Combined with search and type filters

**AF-002: Sort Categories**
- User selects sort option from dropdown
- Options: Order (Asc/Desc), Code (A-Z/Z-A), Name (A-Z/Z-A)
- System reorders results

**AF-003: Clear Search**
- User clears search input
- System restores full list (respecting tab and status filters)

**Exception Flows**:

**EF-001: No Results**
- Search/filter combination yields no matches
- System displays: "No categories found"

**Source Evidence**: `components/category-list.tsx:108-194`

---

### UC-TXC-003: View Category Details

**Actor(s)**: Financial Controller, System Administrator

**Priority**: High

**Preconditions**:
- Category exists in system
- User has view permission

**Postconditions**:
- Category details displayed
- Associated reasons listed

**Main Flow**:
1. User clicks category row in list OR navigates to `/inventory-management/transaction-categories/{id}`
2. System loads category by ID
3. System loads reasons for category
4. System displays header with:
   - Back button
   - Category name
   - Type badge (Stock IN green / Stock OUT red)
   - Code in monospace
   - Edit and Delete buttons
5. System displays Category Details card:
   - Code, Name, Type, Status
   - GL Account Code + Name
   - Description (if present)
6. System displays Reasons card:
   - Count in header
   - Add Reason button
   - Table of reasons sorted by sortOrder

**Alternative Flows**:

**AF-001: No Reasons**
- Category has no reasons
- System displays: "No reasons defined for this category. Click 'Add Reason' to create one."

**Exception Flows**:

**EF-001: Category Not Found**
- At step 2: Category ID not found
- System displays error: "Category Not Found"
- System shows link: "Return to Categories List"

**Source Evidence**: `[id]/page.tsx:50-288`

---

### UC-TXC-004: Create New Category

**Actor(s)**: Financial Controller, System Administrator

**Priority**: High

**Preconditions**:
- User has create permission
- User is on category list or form page

**Postconditions**:
- New category created
- User redirected to list

**Main Flow**:
1. User clicks "Add Category" button (or tab-specific button)
2. System navigates to `/inventory-management/transaction-categories/new` (optionally with `?type=in` or `?type=out`)
3. System displays category form with:
   - Type selection cards (Stock Out, Stock In)
   - If type param present, pre-selects and locks type
4. User selects type (if not pre-selected)
5. User enters Code (auto-uppercased, max 10 chars)
6. User enters Name (required)
7. User enters GL Account Code (required)
8. User enters GL Account Name (required)
9. User optionally enters Description
10. User optionally adjusts Sort Order (1-999)
11. User optionally toggles Active status (default: true)
12. User clicks "Save Category"
13. System validates all required fields
14. System creates category record
15. System navigates to category list

**Alternative Flows**:

**AF-001: Cancel Without Changes**
- User clicks Cancel or Back with no changes
- System navigates back immediately

**AF-002: Cancel With Changes**
- User clicks Cancel or Back with unsaved changes
- System shows discard dialog: "Discard Changes?"
- User confirms: navigate back
- User cancels: stay on form

**Exception Flows**:

**EF-001: Validation Error**
- At step 13: Required fields missing
- System displays field-level errors
- User corrects and resubmits

**EF-002: Duplicate Code**
- At step 14: Code already exists for type
- System displays error: "Code already exists"

**Source Evidence**: `new/page.tsx:24-52`, `components/category-form.tsx:147-165`

---

### UC-TXC-005: Edit Category

**Actor(s)**: Financial Controller, System Administrator

**Priority**: High

**Preconditions**:
- Category exists
- User has edit permission

**Postconditions**:
- Category updated
- User redirected to list

**Main Flow**:
1. User clicks "Edit" button on category detail page
2. System navigates to `/inventory-management/transaction-categories/{id}/edit`
3. System loads category data
4. System pre-populates form with current values
5. System displays type selection as disabled with message: "Type cannot be changed after creation"
6. User modifies desired fields
7. User clicks "Save Category"
8. System validates changes
9. System updates category record
10. System navigates to category list

**Alternative Flows**:

**AF-001: No Changes Made**
- User clicks Cancel without modifications
- System navigates back without dialog

**AF-002: Discard Changes**
- User modified fields and clicks Cancel
- System shows discard dialog
- User confirms: discard and navigate
- User cancels: return to form

**Exception Flows**:

**EF-001: Category Not Found**
- At step 3: Category deleted by another user
- System displays: "Category Not Found"

**EF-002: Validation Error**
- At step 8: Invalid data
- System displays field errors

**Source Evidence**: `[id]/edit/page.tsx:24-61`, `components/category-form.tsx:80-181`

---

### UC-TXC-006: Delete Category

**Actor(s)**: Financial Controller, System Administrator

**Priority**: Medium

**Preconditions**:
- Category exists
- Category not used in posted adjustments
- User has delete permission

**Postconditions**:
- Category soft-deleted
- Associated reasons deleted
- User redirected to list

**Main Flow**:
1. User clicks "Delete" button on category detail page
2. System displays confirmation dialog:
   - Title: "Delete Category?"
   - Message: "Are you sure you want to delete '{name}'? This will also delete all {count} associated reasons. This action cannot be undone."
3. User clicks "Delete Category"
4. System sets deleted flag on category
5. System sets deleted flag on all reasons
6. System navigates to category list

**Alternative Flows**:

**AF-001: Cancel Delete**
- User clicks "Cancel" on dialog
- Dialog closes, no action taken

**Exception Flows**:

**EF-001: Category In Use**
- At step 4: Category used in posted adjustments
- System displays error: "Cannot delete category - used in existing adjustments"
- User must deactivate instead

**Source Evidence**: `[id]/page.tsx:83-97`, `[id]/page.tsx:249-276`

---

### UC-TXC-007: Add Reason to Category

**Actor(s)**: Financial Controller, System Administrator

**Priority**: High

**Preconditions**:
- Category exists
- User viewing category detail page
- User has edit permission

**Postconditions**:
- New reason added to category
- Reason list refreshed

**Main Flow**:
1. User clicks "Add Reason" button on category detail page
2. System opens ReasonDialog modal in create mode
3. User enters Code (auto-uppercased, max 10 chars)
4. User enters Name (required)
5. User optionally enters Description
6. User optionally adjusts Sort Order (1-999, default 1)
7. User optionally toggles Active status (default true)
8. User clicks "Add Reason"
9. System validates required fields
10. System creates reason record linked to category
11. System closes dialog
12. System refreshes reason list

**Alternative Flows**:

**AF-001: Cancel**
- User clicks "Cancel"
- Dialog closes without saving

**Exception Flows**:

**EF-001: Validation Error**
- At step 9: Required fields missing
- System shows field-level errors in dialog

**EF-002: Duplicate Code**
- At step 10: Code exists for this category
- System displays error

**Source Evidence**: `[id]/page.tsx:99-119`, `components/reason-dialog.tsx:66-145`

---

### UC-TXC-008: Edit Reason

**Actor(s)**: Financial Controller, System Administrator

**Priority**: Medium

**Preconditions**:
- Reason exists
- User viewing category detail page

**Postconditions**:
- Reason updated
- List refreshed

**Main Flow**:
1. User clicks "Edit" from reason row dropdown menu
2. System opens ReasonDialog modal in edit mode
3. System pre-populates form with current values
4. User modifies desired fields
5. User clicks "Save Changes"
6. System validates changes
7. System updates reason record
8. System closes dialog
9. System refreshes reason list

**Alternative Flows**:

**AF-001: Cancel**
- User clicks "Cancel"
- Dialog closes, changes discarded

**Exception Flows**:

**EF-001: Validation Error**
- System shows field-level errors

**Source Evidence**: `[id]/page.tsx:104-108`, `components/reason-dialog.tsx:87-108`

---

### UC-TXC-009: Delete Reason

**Actor(s)**: Financial Controller, System Administrator

**Priority**: Medium

**Preconditions**:
- Reason exists
- Reason not used in posted adjustments

**Postconditions**:
- Reason soft-deleted
- List refreshed

**Main Flow**:
1. User clicks "Delete" from reason row dropdown menu
2. System displays confirmation dialog:
   - Title: "Delete Reason?"
   - Message: "Are you sure you want to delete '{name}'? This action cannot be undone."
3. User clicks "Delete Reason"
4. System soft-deletes reason
5. System closes dialog
6. System refreshes reason list

**Alternative Flows**:

**AF-001: Cancel**
- User clicks "Cancel"
- Dialog closes, no action

**Exception Flows**:

**EF-001: Reason In Use**
- Reason referenced in adjustment items
- System displays error

**Source Evidence**: `components/reason-list.tsx:81-91`, `components/reason-list.tsx:181-208`

---

### UC-TXC-010: Toggle Reason Status

**Actor(s)**: Financial Controller, System Administrator

**Priority**: Low

**Preconditions**:
- Reason exists
- User viewing category detail page

**Postconditions**:
- Reason status toggled
- UI updated immediately

**Main Flow**:
1. User clicks status toggle switch on reason row
2. System calls onStatusChange handler
3. System updates reason isActive field
4. UI reflects new status immediately

**Alternative Flows**: None

**Exception Flows**:

**EF-001: Update Failed**
- API error occurs
- System reverts toggle to previous state
- System shows error toast

**Source Evidence**: `components/reason-list.tsx:93-95`, `components/reason-list.tsx:140-149`

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-16 | Documentation Team | Initial creation |
