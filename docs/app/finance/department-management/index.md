# Department Management Documentation Index

## Module Overview

The Department Management module provides organizational structure management for the Carmen ERP system. It enables finance administrators to create, view, edit, and manage departments, assign department heads, assign users to departments, and link departments to physical locations.

**Current Implementation**: Full CRUD operations with user/location assignment interfaces using React local state.

---

## Quick Navigation

| | | |
|:---:|:---:|:---:|
| [**BR**](/finance/department-management/business-requirements)<br/>Business Requirements | [**UC**](/finance/department-management/use-cases)<br/>Use Cases | [**TS**](/finance/department-management/technical-specification)<br/>Technical Spec |
| [**DD**](/finance/department-management/data-dictionary)<br/>Data Dictionary | [**FD**](/finance/department-management/flow-diagrams)<br/>Flow Diagrams | [**VAL**](/finance/department-management/validations)<br/>Validations |

---

## Quick Links

| Document | Description |
|----------|-------------|
| [BR-department-management.md](./BR-department-management.md) | Business Rules - Core requirements and feature definitions |
| [UC-department-management.md](./UC-department-management.md) | Use Cases - User workflows and interactions |
| [DD-department-management.md](./DD-department-management.md) | Data Dictionary - Data structures and field definitions |
| [FD-department-management.md](./FD-department-management.md) | Flow Diagrams - Visual workflow representations |
| [TS-department-management.md](./TS-department-management.md) | Technical Specifications - Architecture and implementation |
| [VAL-department-management.md](./VAL-department-management.md) | Validation Rules - Field and business rule validations |

## Key Features

### Current Implementation

- **Department List**: View all departments in table format with search
- **Department Detail**: View department info, heads, users, and locations
- **Create Department**: Add new department with form validation
- **Edit Department**: Modify department details and assignments
- **Delete Department**: Remove department with confirmation
- **User Assignment**: Dual-pane picker to assign users
- **Location Assignment**: Dual-pane picker to assign locations
- **Search**: Filter by code, name, or description

### Data Structure

```typescript
interface Department {
  id: string              // Unique identifier
  code: string            // Department code (max 10 chars)
  name: string            // Department name (max 100 chars)
  description?: string    // Optional description
  status: 'active' | 'inactive'
  parentDepartment?: string
  costCenter?: string     // Cost center code
  managers?: string[]     // User IDs of department heads
  assignedUsers?: string[]     // User IDs assigned to department
  assignedLocations?: string[] // Location IDs assigned to department
}
```

### Sample Departments

| Code | Name | Description |
|------|------|-------------|
| KITCHEN | Kitchen Operations | Main kitchen production |
| FB | Food & Beverage | F&B service operations |
| HOUSEKP | Housekeeping | Room cleaning and maintenance |
| FRONT | Front Office | Reception and guest services |
| PURCH | Purchasing | Procurement department |

## Source Code Location

```
app/(main)/finance/department-list/
├── page.tsx                           # Route page
├── [id]/
│   ├── page.tsx                       # Department detail page
│   └── edit/
│       └── page.tsx                   # Department edit page
├── new/
│   └── edit/
│       └── page.tsx                   # Create department page
└── components/
    ├── department-list.tsx            # List component (163 lines)
    ├── department-detail.tsx          # Detail view component
    ├── department-edit-form.tsx       # Create/Edit form (291 lines)
    ├── user-assignment.tsx            # User dual-pane picker (323 lines)
    └── location-assignment.tsx        # Location dual-pane picker (270 lines)
```

## Future Enhancements

| Phase | Feature | Description |
|-------|---------|-------------|
| Phase 2 | Database Integration | Persist departments to database |
| Phase 2 | Code Uniqueness | Server-side uniqueness validation |
| Phase 3 | Hierarchy Management | Parent-child department relationships |
| Phase 3 | Approval Workflow | Department creation approval |
| Phase 4 | Budget Allocation | Department budget tracking |
| Phase 4 | Audit Trail | Change history tracking |

## Related Modules

| Module | Relationship |
|--------|--------------|
| [User Management](../../system-administration/) | User reference for assignments |
| [Location Management](../../system-administration/) | Location reference for assignments |
| [Account Code Mapping](../account-code-mapping/) | GL account mappings |
| [Purchase Requests](../../procurement/purchase-requests/) | Department-based approvals |

---

**Document End**
