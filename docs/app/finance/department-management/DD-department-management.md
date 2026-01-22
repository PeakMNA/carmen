# Data Dictionary: Department Management

## Module Information
- **Module**: Finance
- **Sub-Module**: Department Management
- **Route**: `/finance/department-list`
- **Version**: 2.0.0
- **Last Updated**: 2026-01-17
- **Owner**: Finance Team
- **Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0.0 | 2026-01-17 | Documentation Team | Updated to reflect actual implementation |
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format |
| 1.0.0 | 2025-11-13 | Documentation Team | Initial version |

---

## Overview

This document defines the data structures used in the Department Management module. The current implementation uses React local state with mock data for department master data management, including user and location assignments.

**Current Implementation**: Client-side state management using TypeScript interfaces and mock data.

**Related Documents**:
- [Business Requirements](./BR-department-management.md)
- [Use Cases](./UC-department-management.md)
- [Technical Specification](./TS-department-management.md)
- [Flow Diagrams](./FD-department-management.md)
- [Validation Rules](./VAL-department-management.md)

---

## Data Structures

### Department Interface

**Source**: `lib/types/permissions.ts`

The core Department interface used throughout the application:

```typescript
export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive';
  parentDepartment?: string;
  costCenter?: string;
  managers?: string[];
  assignedUsers?: string[];
  assignedLocations?: string[];
}
```

### Field Definitions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier for the department |
| name | string | Yes | Full name of the department (max 100 chars) |
| code | string | Yes | Unique department code (max 10 chars) |
| description | string | No | Optional description of the department |
| status | enum | Yes | Department status: 'active' or 'inactive' |
| parentDepartment | string | No | ID of parent department (not implemented in UI) |
| costCenter | string | No | Cost center code for financial tracking |
| managers | string[] | No | Array of user IDs assigned as department heads |
| assignedUsers | string[] | No | Array of user IDs assigned to the department |
| assignedLocations | string[] | No | Array of location IDs assigned to the department |

---

## Form Schema

### Zod Validation Schema

**Source**: `app/(main)/finance/department-list/components/department-edit-form.tsx`

```typescript
const departmentSchema = z.object({
  code: z.string()
    .min(1, 'Code is required')
    .max(10, 'Code must be 10 characters or less'),
  name: z.string()
    .min(1, 'Name is required')
    .max(100, 'Name must be 100 characters or less'),
  description: z.string().optional(),
  managers: z.array(z.string()).optional(),
  costCenter: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

type DepartmentFormData = z.infer<typeof departmentSchema>
```

### Form Field Details

| Field | Validation | Error Message |
|-------|------------|---------------|
| code | min(1), max(10) | "Code is required", "Code must be 10 characters or less" |
| name | min(1), max(100) | "Name is required", "Name must be 100 characters or less" |
| description | optional string | - |
| managers | optional array of strings | - |
| costCenter | optional string | - |
| status | enum('active', 'inactive') | - |

---

## Related Entities

### User Entity

**Source**: `lib/types/user.ts`

Users are referenced in department assignments:

```typescript
interface User {
  id: string
  name: string
  email: string
  avatar?: string
  roles?: Role[]
  departments?: string[]
}

interface Role {
  id: string
  name: string
  permissions?: string[]
}
```

### Location Entity

**Source**: `lib/types/locations.ts`

Locations are referenced in department assignments:

```typescript
interface Location {
  id: string
  name: string
  type: LocationType
  address?: string
  isActive?: boolean
}

type LocationType = 'hotel' | 'restaurant' | 'warehouse' | 'kitchen' | 'store' | 'office'
```

---

## Mock Data

### Sample Departments

**Source**: `lib/mock-data/departments.ts`

| ID | Code | Name | Status |
|----|------|------|--------|
| dept-1 | KITCHEN | Kitchen Operations | active |
| dept-2 | FB | Food & Beverage | active |
| dept-3 | HOUSEKP | Housekeeping | active |
| dept-4 | FRONT | Front Office | active |
| dept-5 | PURCH | Purchasing | active |

### Manager Eligibility

Users are eligible to be department heads if their role name contains any of:
- manager
- director
- head
- chef

```typescript
const availableManagers = useMemo(() => {
  return mockUsers.filter(user =>
    currentManagerIds.includes(user.id) ||
    (user.roles && user.roles.some(role =>
      role && role.name && (
        role.name.toLowerCase().includes('manager') ||
        role.name.toLowerCase().includes('director') ||
        role.name.toLowerCase().includes('head') ||
        role.name.toLowerCase().includes('chef')
      )
    ))
  )
}, [department?.managers])
```

---

## Component State

### DepartmentList State

**Source**: `app/(main)/finance/department-list/components/department-list.tsx`

```typescript
// Department data
const [departments, setDepartments] = useState<Department[]>(mockDepartments)

// Search filter
const [searchTerm, setSearchTerm] = useState('')

// Computed filtered list
const filteredDepartments = useMemo(() => {
  if (!searchTerm) return departments
  const query = searchTerm.toLowerCase()
  return departments.filter(
    (dept) =>
      dept.code.toLowerCase().includes(query) ||
      dept.name.toLowerCase().includes(query) ||
      dept.description?.toLowerCase().includes(query)
  )
}, [departments, searchTerm])
```

### DepartmentEditForm State

**Source**: `app/(main)/finance/department-list/components/department-edit-form.tsx`

```typescript
// User assignments
const [assignedUsers, setAssignedUsers] = useState<string[]>([])

// Location assignments
const [assignedLocations, setAssignedLocations] = useState<string[]>([])

// Active tab
const [activeTab, setActiveTab] = useState<'users' | 'locations'>('users')
```

### UserAssignment State

**Source**: `app/(main)/finance/department-list/components/user-assignment.tsx`

```typescript
// Search terms for each pane
const [assignedSearch, setAssignedSearch] = useState('')
const [availableSearch, setAvailableSearch] = useState('')

// Selection tracking for each pane
const [selectedAssigned, setSelectedAssigned] = useState<string[]>([])
const [selectedAvailable, setSelectedAvailable] = useState<string[]>([])
```

### LocationAssignment State

**Source**: `app/(main)/finance/department-list/components/location-assignment.tsx`

```typescript
// Search terms for each pane
const [assignedSearch, setAssignedSearch] = useState('')
const [availableSearch, setAvailableSearch] = useState('')

// Selection tracking for each pane
const [selectedAssigned, setSelectedAssigned] = useState<string[]>([])
const [selectedAvailable, setSelectedAvailable] = useState<string[]>([])
```

---

## Data Flow

### Department CRUD Operations

```
┌──────────────────────────────────────────────────────────┐
│                     Mock Data Store                       │
│  mockDepartments, mockUsers, mockLocations               │
└──────────────────────────────────────────────────────────┘
                           │
                           │ Import
                           ▼
┌──────────────────────────────────────────────────────────┐
│              DepartmentList Component                     │
│  useState(mockDepartments)                               │
│  - Filter by search term                                 │
│  - Delete department                                     │
└──────────────────────────────────────────────────────────┘
                           │
                           │ Navigate to /[id]/edit
                           ▼
┌──────────────────────────────────────────────────────────┐
│            DepartmentEditForm Component                   │
│  - Load department by ID                                 │
│  - Manage form state with react-hook-form                │
│  - Manage user/location assignments                      │
└──────────────────────────────────────────────────────────┘
                           │
                ┌──────────┴──────────┐
                ▼                     ▼
┌───────────────────────┐  ┌───────────────────────┐
│   UserAssignment      │  │  LocationAssignment   │
│   - Dual-pane picker  │  │  - Dual-pane picker   │
│   - Search filtering  │  │  - Search filtering   │
│   - Selection state   │  │  - Selection state    │
└───────────────────────┘  └───────────────────────┘
```

### Assignment Data Structure

When users or locations are assigned, only IDs are stored:

```typescript
// Department with assignments
{
  id: 'dept-1',
  code: 'KITCHEN',
  name: 'Kitchen Operations',
  status: 'active',
  managers: ['user-123', 'user-456'],
  assignedUsers: ['user-001', 'user-002', 'user-003'],
  assignedLocations: ['loc-001', 'loc-002']
}
```

---

## Display Formatting

### Status Display

| Value | Badge Variant | Display Text |
|-------|---------------|--------------|
| active | default (green) | Active |
| inactive | secondary (gray) | Inactive |

### Location Type Display

| Type | Badge Color | Display |
|------|-------------|---------|
| hotel | blue | Hotel |
| restaurant | orange | Restaurant |
| warehouse | gray | Warehouse |
| kitchen | red | Kitchen |
| store | green | Store |
| office | purple | Office |

### User Display Format

```typescript
// User row in assignment picker
{
  avatar: user.avatar || getInitials(user.name),
  name: user.name,
  email: user.email,
  role: user.roles?.[0]?.name || 'Staff',
  departments: user.departments?.join(', ') || 'None'
}
```

---

## Future Database Schema (Planned)

When database integration is implemented, the following Prisma schema is planned:

```prisma
model Department {
  id              String   @id @default(cuid())
  code            String   @unique @db.VarChar(10)
  name            String   @db.VarChar(100)
  description     String?
  status          DepartmentStatus @default(active)
  parentId        String?
  parent          Department? @relation("DepartmentHierarchy", fields: [parentId], references: [id])
  children        Department[] @relation("DepartmentHierarchy")
  costCenter      String?
  managers        DepartmentManager[]
  assignedUsers   UserDepartment[]
  assignedLocations LocationDepartment[]
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum DepartmentStatus {
  active
  inactive
}
```

---

**Document End**
