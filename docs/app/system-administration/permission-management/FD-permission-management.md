# Permission Management - Flow Diagrams (FD)

**Module**: System Administration - Permission Management
**Version**: 1.0
**Last Updated**: 2026-01-16
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Document Status**: Active

---

## Overview

This document provides visual flow diagrams for the Permission Management module, focusing on current RBAC (Role-Based Access Control) workflows. All diagrams use Mermaid syntax for clarity and maintainability.

**Flow Diagram Index**:
- FD-001: Create New Role Flow
- FD-002: Edit Existing Role Flow
- FD-003: Delete Role Flow
- FD-004: Assign Users to Role Flow
- FD-005: Permission Check Flow
- FD-006: Role Hierarchy Calculation Flow
- FD-007: Duplicate Role Flow
- FD-008: Search and Filter Roles Flow

---

## FD-001: Create New Role Flow

### Description
Complete workflow for creating a new role with permissions and hierarchy configuration.

### Flow Diagram

```mermaid
flowchart TD
    Start([User: Create Role]) --> Navigate[Navigate to Roles Page]
    Navigate --> ClickCreate[Click 'Create Role' Button]
    ClickCreate --> DisplayForm[System: Display Creation Form]

    DisplayForm --> EnterGeneral{Enter General Info}
    EnterGeneral -->|Name, Description| SelectParent{Select Parent Role?}

    SelectParent -->|Yes| SearchParent[Search Parent Roles]
    SearchParent --> ShowParentPerms[Display Parent Permissions]
    ShowParentPerms --> AssignPerms

    SelectParent -->|No| AssignPerms[Assign Permissions]

    AssignPerms --> SearchPerms[Search Available Permissions]
    SearchPerms --> SelectPerms[Select Permissions]
    SelectPerms --> ShowEffective[Display Effective Permissions]
    ShowEffective --> ReviewSummary[Review Role Summary]

    ReviewSummary --> ClickSave[Click 'Create Role']
    ClickSave --> ValidateName{Validate Name}

    ValidateName -->|Name Exists| ShowNameError[Show: Name Already Exists]
    ShowNameError --> EnterGeneral

    ValidateName -->|Name Valid| ValidatePerms{Validate Permissions}

    ValidatePerms -->|Invalid Format| ShowPermError[Show: Invalid Permission Format]
    ShowPermError --> AssignPerms

    ValidatePerms -->|Valid| CheckCircular{Check Circular Inheritance}

    CheckCircular -->|Detected| ShowCircularError[Show: Circular Inheritance]
    ShowCircularError --> SelectParent

    CheckCircular -->|None| CreateRole[System: Create Role in Store]

    CreateRole --> CalcHierarchy[Calculate Hierarchy Level]
    CalcHierarchy --> CalcEffective[Calculate Effective Permissions]
    CalcEffective --> LogAudit[Log to Audit Trail]
    LogAudit --> ShowSuccess[Show: Success Message]
    ShowSuccess --> ReturnToList[Navigate to Role List]
    ReturnToList --> End([End])

    style Start fill:#e1f5e1
    style End fill:#ffe1e1
    style CreateRole fill:#e1e5ff
    style ShowNameError fill:#ffe1e1
    style ShowPermError fill:#ffe1e1
    style ShowCircularError fill:#ffe1e1
```

### Key Decision Points
1. **Parent Role Selection**: Optional but affects hierarchy level
2. **Name Validation**: Must be unique (case-insensitive)
3. **Permission Format Validation**: Must follow "resource:action" pattern
4. **Circular Inheritance Check**: Prevents role A inheriting from role B if B inherits from A

### Validation Rules
- **BR-PM-001**: Role name must be unique
- **BR-PM-002**: Role name must be 3-100 characters
- **BR-PM-003**: Permission format must be "resource:action"
- **BR-PM-004**: Circular inheritance is not allowed

---

## FD-002: Edit Existing Role Flow

### Description
Workflow for modifying an existing role's properties, permissions, and hierarchy relationships.

### Flow Diagram

```mermaid
flowchart TD
    Start([User: Edit Role]) --> Navigate[Navigate to Role Detail]
    Navigate --> ClickEdit[Click 'Edit' Button]
    ClickEdit --> CheckSystem{Is System Role?}

    CheckSystem -->|Yes| ShowWarning[Show: System Role Warning]
    ShowWarning --> DisableName[Disable Name Field]
    DisableName --> DisplayForm

    CheckSystem -->|No| DisplayForm[Display Edit Form with Current Data]

    DisplayForm --> ModifyInfo{Modify Information}
    ModifyInfo -->|Description| UpdatePreview
    ModifyInfo -->|Add Permissions| SelectNewPerms[Select New Permissions]
    ModifyInfo -->|Remove Permissions| CheckInherited{Is Inherited?}
    ModifyInfo -->|Change Parents| UpdateParents[Update Parent Roles]

    CheckInherited -->|Yes| ShowInheritedMsg[Show: Cannot Remove Inherited]
    ShowInheritedMsg --> ModifyInfo

    CheckInherited -->|No| RemovePerm[Remove Permission]
    RemovePerm --> UpdatePreview

    SelectNewPerms --> UpdatePreview[Update Effective Permissions Preview]
    UpdateParents --> UpdatePreview

    UpdatePreview --> CheckUsers{Has Assigned Users?}

    CheckUsers -->|Yes| ShowUserWarning[Show: X Users Will Be Affected]
    ShowUserWarning --> ReviewChanges

    CheckUsers -->|No| ReviewChanges[Review Changes Summary]

    ReviewChanges --> ClickSave[Click 'Save Changes']
    ClickSave --> ValidateChanges{Validate Changes}

    ValidateChanges -->|Invalid| ShowErrors[Show Validation Errors]
    ShowErrors --> ModifyInfo

    ValidateChanges -->|Valid| UpdateRole[System: Update Role]
    UpdateRole --> RecalcEffective[Recalculate Effective Permissions]
    RecalcEffective --> UpdateUserPerms[Update User Effective Permissions]
    UpdateUserPerms --> LogAudit[Log Changes to Audit Trail]
    LogAudit --> ShowSuccess[Show: Success Message]
    ShowSuccess --> RefreshDetail[Refresh Role Detail View]
    RefreshDetail --> End([End])

    style Start fill:#e1f5e1
    style End fill:#ffe1e1
    style UpdateRole fill:#e1e5ff
    style ShowWarning fill:#fff3cd
    style ShowInheritedMsg fill:#fff3cd
    style ShowUserWarning fill:#fff3cd
```

### Key Decision Points
1. **System Role Check**: System roles have restricted modifications
2. **Inherited Permission Check**: Cannot directly remove inherited permissions
3. **User Impact Check**: Warn when changes affect assigned users

### Business Rules
- **BR-PM-003**: System roles cannot have name changed
- **BR-PM-007**: Inherited permissions cannot be removed directly
- Users with >50 assignments trigger additional confirmation

---

## FD-003: Delete Role Flow

### Description
Workflow for deleting a role with constraint validation and user impact checking.

### Flow Diagram

```mermaid
flowchart TD
    Start([User: Delete Role]) --> Navigate[Navigate to Role Detail]
    Navigate --> ClickDelete[Click 'Delete Role' Button]
    ClickDelete --> CheckSystem{Is System Role?}

    CheckSystem -->|Yes| ShowSystemError[Show: System Roles Cannot Be Deleted]
    ShowSystemError --> End([End])

    CheckSystem -->|No| CheckUsers{Has Assigned Users?}

    CheckUsers -->|Yes| ShowUserError[Show: Role Has X Assigned Users]
    ShowUserError --> ShowViewUsers[Show 'View Users' Button]
    ShowViewUsers --> End

    CheckUsers -->|No| CheckChildren{Has Child Roles?}

    CheckChildren -->|Yes| ShowChildError[Show: Role Has X Child Roles]
    ShowChildError --> ListChildren[List Child Roles]
    ListChildren --> End

    CheckChildren -->|No| ShowConfirmation[Show Confirmation Dialog]
    ShowConfirmation --> DisplayWarning[Display: Action Cannot Be Undone]
    DisplayWarning --> RequireCheckbox[Require Confirmation Checkbox]
    RequireCheckbox --> UserConfirms{User Confirms?}

    UserConfirms -->|No| Cancel[User Clicks Cancel]
    Cancel --> End

    UserConfirms -->|Yes| DeleteRole[System: Delete Role from Store]
    DeleteRole --> LogAudit[Log Deletion to Audit Trail]
    LogAudit --> ShowSuccess[Show: Success Message]
    ShowSuccess --> RedirectList[Redirect to Role List]
    RedirectList --> End

    style Start fill:#e1f5e1
    style End fill:#ffe1e1
    style DeleteRole fill:#ff6b6b
    style ShowSystemError fill:#ffe1e1
    style ShowUserError fill:#ffe1e1
    style ShowChildError fill:#ffe1e1
```

### Constraint Validation
1. **System Role Check**: System roles cannot be deleted
2. **User Assignment Check**: Role must have no assigned users
3. **Child Role Check**: Role must have no child roles
4. **User Confirmation**: Requires explicit confirmation

### Business Rules
- **BR-PM-004**: System roles cannot be deleted
- **BR-PM-006**: Cannot delete role with assigned users or child roles

---

## FD-004: Assign Users to Role Flow

### Description
Workflow for assigning one or more users to a role with optional context restrictions.

### Flow Diagram

```mermaid
flowchart TD
    Start([User: Assign Users]) --> Navigate[Navigate to Role Detail]
    Navigate --> ClickUsers[Click 'Users' Tab]
    ClickUsers --> ClickAssign[Click 'Assign Users' Button]
    ClickAssign --> ShowDialog[Display User Selection Dialog]

    ShowDialog --> SearchUsers[Search for Users]
    SearchUsers --> ApplyFilters{Apply Filters?}

    ApplyFilters -->|Yes| FilterDept[Filter by Department/Location/Role]
    FilterDept --> DisplayUsers

    ApplyFilters -->|No| DisplayUsers[Display Matching Users]
    DisplayUsers --> SelectUsers[Select Users Multi-select]

    SelectUsers --> SetContext{Set Context?}

    SetContext -->|Yes| SelectDept[Select Department Optional]
    SelectDept --> SelectLoc[Select Location Optional]
    SelectLoc --> SetDates[Set Effective Dates]
    SetDates --> ReviewSelection

    SetContext -->|No| ReviewSelection[Review Selection Summary]

    ReviewSelection --> ClickAssignBtn[Click 'Assign' Button]
    ClickAssignBtn --> ValidateUsers{Validate Users}

    ValidateUsers -->|User Inactive| ShowInactiveError[Show: User Is Inactive]
    ShowInactiveError --> SelectUsers

    ValidateUsers -->|Already Has Role| ShowDuplicateWarning[Show: User Already Has Role]
    ShowDuplicateWarning --> OfferOptions{User Choice}

    OfferOptions -->|Skip| SkipUser[Skip This User]
    SkipUser --> ValidateRemaining

    OfferOptions -->|Update Context| UpdateContext[Update Assignment Context]
    UpdateContext --> ValidateRemaining

    OfferOptions -->|Cancel| Cancel[Cancel Operation]
    Cancel --> End([End])

    ValidateUsers -->|Valid| ValidateRemaining[Validate Remaining Users]
    ValidateRemaining --> CreateAssignments[Create User-Role Assignments]

    CreateAssignments --> UpdateEffective[Update Users' Effective Permissions]
    UpdateEffective --> LogAudit[Log Assignments to Audit Trail]
    LogAudit --> ShowSuccess[Show: X Users Assigned Successfully]
    ShowSuccess --> RefreshTab[Refresh Users Tab]
    RefreshTab --> End

    style Start fill:#e1f5e1
    style End fill:#ffe1e1
    style CreateAssignments fill:#e1e5ff
    style ShowInactiveError fill:#ffe1e1
    style ShowDuplicateWarning fill:#fff3cd
```

### Assignment Context Options
- **Department**: Restricts role permissions to specific department
- **Location**: Restricts role permissions to specific location
- **Effective From**: Start date for role assignment
- **Effective To**: Optional expiration date for time-bound assignments

### Business Rules
- **BR-PM-005**: Users can have multiple roles
- **BR-PM-005**: Role assignments can be time-bound
- Users must be active to receive role assignments

---

## FD-005: Permission Check Flow

### Description
Runtime permission check flow using the access decision engine.

### Flow Diagram

```mermaid
flowchart TD
    Start([Application: Check Permission]) --> BuildRequest[Build Permission Request]
    BuildRequest --> DefineParams[Define: User, Resource, Action]

    DefineParams --> GetUserRoles[Retrieve User's Assigned Roles]
    GetUserRoles --> CheckCache{Permissions Cached?}

    CheckCache -->|Yes| GetCached[Get Cached Permissions]
    GetCached --> EvaluatePermission

    CheckCache -->|No| CalcEffective[Calculate Effective Permissions]
    CalcEffective --> IterateRoles[Iterate Through User Roles]

    IterateRoles --> GetRolePerms[Get Direct Role Permissions]
    GetRolePerms --> GetParents{Has Parent Roles?}

    GetParents -->|Yes| RecurseParents[Recursively Get Parent Permissions]
    RecurseParents --> MergePerms[Merge All Permissions]
    MergePerms --> Deduplicate[Deduplicate Permissions]
    Deduplicate --> CacheResult[Cache Result 5 min TTL]
    CacheResult --> EvaluatePermission

    GetParents -->|No| MergePerms

    EvaluatePermission[Evaluate Permission Request]
    EvaluatePermission --> FormatPerm[Format: resource:action]
    FormatPerm --> CheckExact{Exact Match?}

    CheckExact -->|Yes| PermitAccess[Return: Permit]

    CheckExact -->|No| CheckWildcard{Resource Wildcard?}

    CheckWildcard -->|Yes resource:*| PermitAccess

    CheckWildcard -->|No| CheckGlobal{Global Wildcard?}

    CheckGlobal -->|Yes *| PermitAccess

    CheckGlobal -->|No| DenyAccess[Return: Deny]

    PermitAccess --> LogAccess[Log Access Granted]
    LogAccess --> End([Return True])

    DenyAccess --> LogDenial[Log Access Denied]
    LogDenial --> End2([Return False])

    style Start fill:#e1f5e1
    style End fill:#e1ffe1
    style End2 fill:#ffe1e1
    style PermitAccess fill:#e1ffe1
    style DenyAccess fill:#ffe1e1
```

### Permission Matching Logic
1. **Exact Match**: `purchase_request:create` matches `purchase_request:create`
2. **Resource Wildcard**: `purchase_request:*` matches any action on purchase_request
3. **Global Wildcard**: `*` matches any permission (System Administrator only)

### Performance Considerations
- Effective permissions cached for 5 minutes
- Role hierarchy pre-calculated and cached for 15 minutes
- Permission checks must complete within 50ms

---

## FD-006: Role Hierarchy Calculation Flow

### Description
Algorithm for calculating role hierarchy level based on parent relationships.

### Flow Diagram

```mermaid
flowchart TD
    Start([System: Calculate Hierarchy]) --> GetRole[Get Role Data]
    GetRole --> HasParents{Has Parent Roles?}

    HasParents -->|No| SetLevel1[Set Hierarchy Level = 1]
    SetLevel1 --> End([Return Level])

    HasParents -->|Yes| InitMax[Initialize Max Parent Level = 0]
    InitMax --> IterateParents[Iterate Through Parent Roles]

    IterateParents --> GetParent[Get Parent Role]
    GetParent --> ParentCalc{Parent Level Calculated?}

    ParentCalc -->|No| RecursiveCalc[Recursively Calculate Parent Level]
    RecursiveCalc --> CompareLevel

    ParentCalc -->|Yes| GetParentLevel[Get Parent Hierarchy Level]
    GetParentLevel --> CompareLevel{Level > Max?}

    CompareLevel -->|Yes| UpdateMax[Update Max Parent Level]
    UpdateMax --> MoreParents{More Parents?}

    CompareLevel -->|No| MoreParents

    MoreParents -->|Yes| IterateParents

    MoreParents -->|No| CalcLevel[Calculate: Max + 1]
    CalcLevel --> ValidateRange{Level ≤ 10?}

    ValidateRange -->|Yes| SetLevel[Set Hierarchy Level]
    SetLevel --> End

    ValidateRange -->|No| ShowError[Error: Hierarchy Too Deep]
    ShowError --> End2([Return Error])

    style Start fill:#e1f5e1
    style End fill:#e1ffe1
    style End2 fill:#ffe1e1
    style RecursiveCalc fill:#fff3cd
```

### Hierarchy Calculation Rules
1. Roles with no parents have hierarchy level 1
2. Roles with parents have level = max(parent levels) + 1
3. Maximum hierarchy level is 10
4. Circular inheritance is prevented during role creation

### Example Calculation
```
System Administrator (Level 1) ← no parents
└─ General Manager (Level 2) ← parent: System Administrator
   ├─ Finance Director (Level 3) ← parent: General Manager
   └─ Procurement Manager (Level 3) ← parent: General Manager
      └─ Purchasing Staff (Level 4) ← parent: Procurement Manager
```

---

## FD-007: Duplicate Role Flow

### Description
Workflow for creating a new role based on an existing role template.

### Flow Diagram

```mermaid
flowchart TD
    Start([User: Duplicate Role]) --> Navigate[Navigate to Role Detail]
    Navigate --> ClickDuplicate[Click 'Duplicate' Button]
    ClickDuplicate --> CopyName[Generate Name: Copy of X]

    CopyName --> CopyDescription[Copy Description]
    CopyDescription --> CopyPermissions[Copy All Permissions]
    CopyPermissions --> CopyHierarchy[Copy Hierarchy Level]
    CopyHierarchy --> SkipParents[Skip Parent Roles]
    SkipParents --> SkipUsers[Skip User Assignments]

    SkipUsers --> CreateDraft[Create Draft Role]
    CreateDraft --> DisplayForm[Display Pre-Populated Form]

    DisplayForm --> UserModifies{User Modifies?}

    UserModifies -->|Change Name| UpdateName[Update Role Name]
    UpdateName --> UserModifies

    UserModifies -->|Add Permissions| AddPerms[Add Additional Permissions]
    AddPerms --> UserModifies

    UserModifies -->|Select Parents| SelectParents[Select New Parent Roles]
    SelectParents --> UserModifies

    UserModifies -->|Done| ReviewDraft[Review Draft Role]
    ReviewDraft --> ClickCreate[Click 'Create Role']

    ClickCreate --> ValidateName{Name Unique?}

    ValidateName -->|No| ShowNameError[Show: Name Already Exists]
    ShowNameError --> UpdateName

    ValidateName -->|Yes| ValidatePerms{Permissions Valid?}

    ValidatePerms -->|No| ShowPermError[Show: Invalid Permissions]
    ShowPermError --> AddPerms

    ValidatePerms -->|Yes| CreateRole[System: Create New Role]
    CreateRole --> CalcHierarchy[Calculate Hierarchy Level]
    CalcHierarchy --> CalcEffective[Calculate Effective Permissions]
    CalcEffective --> LogAudit[Log Creation to Audit Trail]
    LogAudit --> ShowSuccess[Show: Success Message]
    ShowSuccess --> NavigateNew[Navigate to New Role Detail]
    NavigateNew --> End([End])

    style Start fill:#e1f5e1
    style End fill:#ffe1e1
    style CreateRole fill:#e1e5ff
```

### Duplication Rules
- **Copied**: Name (with prefix), Description, Permissions, Hierarchy Level
- **NOT Copied**: Parent roles, User assignments, Audit history
- **Modified**: Name automatically prefixed with "Copy of"

---

## FD-008: Search and Filter Roles Flow

### Description
Real-time search and filtering workflow for finding specific roles.

### Flow Diagram

```mermaid
flowchart TD
    Start([User: Search Roles]) --> Navigate[Navigate to Role List]
    Navigate --> DisplayAll[Display All Roles]

    DisplayAll --> UserAction{User Action}

    UserAction -->|Enter Search| TypeSearch[Type Search Term]
    TypeSearch --> Debounce[Debounce 300ms]
    Debounce --> SearchMatch[Match Name/Description]
    SearchMatch --> UpdateResults

    UserAction -->|Select Filter| SelectFilter{Filter Type}

    SelectFilter -->|Hierarchy| FilterHierarchy[Filter by Level 1-10]
    SelectFilter -->|Role Type| FilterType[System/Custom/All]
    SelectFilter -->|Has Users| FilterUsers[Yes/No/All]
    SelectFilter -->|Permission| FilterPerm[Search Permission]

    FilterHierarchy --> ApplyFilter
    FilterType --> ApplyFilter
    FilterUsers --> ApplyFilter
    FilterPerm --> ApplyFilter

    ApplyFilter[Apply Filter Logic] --> CombineFilters[Combine All Active Filters]
    CombineFilters --> UpdateResults

    UserAction -->|Sort| SelectSort[Select Sort Field]
    SelectSort --> SortOptions{Sort By}

    SortOptions -->|Name| SortName[Sort Alphabetically]
    SortOptions -->|Hierarchy| SortHier[Sort by Level]
    SortOptions -->|User Count| SortUsers[Sort by User Count]

    SortName --> ApplySort
    SortHier --> ApplySort
    SortUsers --> ApplySort

    ApplySort[Apply Sorting] --> UpdateResults[Update Results Display]

    UpdateResults --> ShowCount[Show: X Roles Found]
    ShowCount --> DisplayFiltered[Display Filtered/Sorted List]

    DisplayFiltered --> UserAction2{User Action}

    UserAction2 -->|Clear Filters| ClearAll[Clear All Filters]
    ClearAll --> DisplayAll

    UserAction2 -->|Export| ExportResults[Export Filtered Results]
    ExportResults --> End([End])

    UserAction2 -->|Continue| UserAction

    style Start fill:#e1f5e1
    style End fill:#ffe1e1
```

### Search and Filter Features
- **Real-time Search**: 300ms debounce for performance
- **Multi-Filter Support**: Multiple filters applied simultaneously
- **Sorting Options**: Name, hierarchy, user count
- **Export Capability**: Export filtered results to CSV/Excel
- **Filter Persistence**: Filter state persists during session

### Filter Combination Logic
```typescript
filteredRoles = allRoles
  .filter(role => role.name.includes(searchTerm) || role.description?.includes(searchTerm))
  .filter(role => hierarchyFilter ? role.hierarchy === hierarchyFilter : true)
  .filter(role => typeFilter === 'system' ? role.isSystem : typeFilter === 'custom' ? !role.isSystem : true)
  .filter(role => hasUsersFilter !== 'all' ? (hasUsersFilter === 'yes' ? role.userCount > 0 : role.userCount === 0) : true)
  .filter(role => permissionFilter ? role.effectivePermissions.includes(permissionFilter) : true)
  .sort(sortFunction)
```

---

## Data Flow Summary

### Create/Edit Operations
```
User Input → Form Validation → Business Rule Validation → Data Store Update →
Effective Permissions Calculation → Cache Invalidation → Audit Logging → UI Update
```

### Permission Check Operations
```
Permission Request → User Role Retrieval → Cache Check →
Effective Permission Calculation → Permission Matching →
Access Decision → Audit Logging → Return Result
```

### Role Hierarchy Operations
```
Role Data → Parent Retrieval → Recursive Level Calculation →
Max Parent Level + 1 → Validation (≤10) → Store Hierarchy Level
```

---

## Performance Metrics

| Operation | Target Time | Cache Strategy |
|-----------|-------------|----------------|
| Permission Check | <50ms | 5-minute TTL on effective permissions |
| Role List Load | <500ms | 30-minute TTL on role list |
| Hierarchy Calculation | <100ms | 15-minute TTL on hierarchy tree |
| Search/Filter | <200ms | No cache (real-time) |
| Create Role | <1000ms | Invalidate role cache |
| Edit Role | <1000ms | Invalidate role + user permission cache |

---

## Error Handling Patterns

### Validation Errors
- Display inline error messages at field level
- Highlight invalid fields with red border
- Provide clear correction instructions
- Prevent submission until all errors resolved

### System Errors
- Display user-friendly error message
- Log detailed error to console and audit trail
- Provide retry option
- Offer support contact if error persists

### Constraint Violations
- Prevent operation before execution
- Display clear explanation of constraint
- Provide actionable next steps
- Show affected entities (users, child roles)

---

**Document Control**:
- **Created**: 2026-01-16
- **Version**: 1.0
- **Status**: Active
- **Review Cycle**: Quarterly
