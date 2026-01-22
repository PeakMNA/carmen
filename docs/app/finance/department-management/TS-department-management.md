# Technical Specification: Department Management

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
| 1.0.0 | 2025-01-13 | Development Team | Initial technical specification |

---

## Overview

The Department Management module provides organizational structure management using React components with local state management. The current implementation is a fully functional client-side CRUD interface for departments with user and location assignment capabilities.

**Current Implementation**: React local state with mock data, shadcn/ui components, and Zod validation.

**Related Documents**:
- [Business Requirements](./BR-department-management.md)
- [Use Cases](./UC-department-management.md)
- [Data Dictionary](./DD-department-management.md)
- [Flow Diagrams](./FD-department-management.md)
- [Validation Rules](./VAL-department-management.md)

---

## Architecture

### Technology Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| Next.js | 14 | App Router framework |
| TypeScript | 5.8+ | Type safety |
| React | 18+ | UI components |
| shadcn/ui | Latest | Component library |
| Zod | Latest | Form validation |
| react-hook-form | Latest | Form state management |
| Lucide React | Latest | Icons |

### Module Structure

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

### Component Hierarchy

```
DepartmentListPage (page.tsx)
  └── DepartmentList
        ├── Header
        │   ├── Title
        │   └── New Department Button
        ├── Search Input
        └── Table
              ├── TableHeader
              └── TableBody
                    └── TableRow (for each department)
                          ├── Code Cell
                          ├── Name Cell
                          ├── Description Cell
                          ├── Head of Department Cell
                          ├── Status Badge
                          └── Action Buttons (View, Edit, Delete)

DepartmentDetailPage ([id]/page.tsx)
  └── DepartmentDetail
        ├── Header (name, code badge, status badge)
        ├── Basic Information Card
        ├── Management Card
        └── Tabs
              ├── Users Tab
              └── Locations Tab

DepartmentEditPage ([id]/edit/page.tsx)
  └── DepartmentEditForm
        ├── Basic Information Section
        │   ├── Name Input
        │   ├── Code Input
        │   └── Description Textarea
        ├── Management Section
        │   ├── Department Heads Checkboxes
        │   ├── Cost Center Input
        │   └── Active Checkbox
        └── Assignments Tabs
              ├── Users Tab → UserAssignment
              └── Locations Tab → LocationAssignment
```

---

## Component Specifications

### DepartmentList Component

**File**: `components/department-list.tsx`
**Lines**: 163

**Dependencies**:
```typescript
import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Eye, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { mockDepartments, mockUsers } from '@/lib/mock-data'
import { Department } from '@/lib/types'
```

**State**:
```typescript
const [departments, setDepartments] = useState<Department[]>(mockDepartments)
const [searchTerm, setSearchTerm] = useState('')
```

**Computed Values**:
```typescript
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

**Key Functions**:
- `handleDelete(id: string)`: Confirms and removes department from list
- Navigation to `/finance/department-list/new/edit` for create
- Navigation to `/finance/department-list/{id}` for view
- Navigation to `/finance/department-list/{id}/edit` for edit

---

### DepartmentEditForm Component

**File**: `components/department-edit-form.tsx`
**Lines**: 291

**Dependencies**:
```typescript
import { useState, useMemo, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { mockDepartments, mockUsers, mockLocations } from '@/lib/mock-data'
```

**Zod Schema**:
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
```

**State**:
```typescript
const [assignedUsers, setAssignedUsers] = useState<string[]>([])
const [assignedLocations, setAssignedLocations] = useState<string[]>([])
const [activeTab, setActiveTab] = useState<'users' | 'locations'>('users')
```

**Form Integration**:
```typescript
const form = useForm<DepartmentFormData>({
  resolver: zodResolver(departmentSchema),
  defaultValues: {
    code: '',
    name: '',
    description: '',
    managers: [],
    costCenter: '',
    status: 'active',
  },
})
```

**Manager Eligibility Filter**:
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

### UserAssignment Component

**File**: `components/user-assignment.tsx`
**Lines**: 323

**Props**:
```typescript
interface UserAssignmentProps {
  assignedUserIds: string[]
  onAssignmentChange: (userIds: string[]) => void
}
```

**State**:
```typescript
const [assignedSearch, setAssignedSearch] = useState('')
const [availableSearch, setAvailableSearch] = useState('')
const [selectedAssigned, setSelectedAssigned] = useState<string[]>([])
const [selectedAvailable, setSelectedAvailable] = useState<string[]>([])
```

**Key Functions**:
- `handleMoveToAvailable()`: Move selected users from assigned to available
- `handleMoveToAssigned()`: Move selected users from available to assigned
- `handleSelectAllAssigned()`: Toggle select all in assigned pane
- `handleSelectAllAvailable()`: Toggle select all in available pane

**Layout**:
```
┌─────────────────────────────────────────────────────────┐
│  Assigned Users (N)        │ Actions │ Available Users (M)
├─────────────────────────────────────────────────────────┤
│ [Search...]                │         │ [Search...]        │
│ [x] Select All             │   [→]   │ [x] Select All     │
│ ┌─────────────────────────┐│   [←]   │┌─────────────────────────┐
│ │ [x] User Name           ││         ││ [ ] User Name           │
│ │     email@example.com   ││         ││     email@example.com   │
│ │     Role: Manager       ││         ││     Role: Staff         │
│ └─────────────────────────┘│         │└─────────────────────────┘
└─────────────────────────────────────────────────────────┘
```

---

### LocationAssignment Component

**File**: `components/location-assignment.tsx`
**Lines**: 270

**Props**:
```typescript
interface LocationAssignmentProps {
  assignedLocationIds: string[]
  onAssignmentChange: (locationIds: string[]) => void
}
```

**State**:
```typescript
const [assignedSearch, setAssignedSearch] = useState('')
const [availableSearch, setAvailableSearch] = useState('')
const [selectedAssigned, setSelectedAssigned] = useState<string[]>([])
const [selectedAvailable, setSelectedAvailable] = useState<string[]>([])
```

**Location Type Badge Colors**:
```typescript
const getLocationTypeBadge = (type: string) => {
  const colors: Record<string, string> = {
    hotel: 'bg-blue-100 text-blue-800',
    restaurant: 'bg-orange-100 text-orange-800',
    warehouse: 'bg-gray-100 text-gray-800',
    kitchen: 'bg-red-100 text-red-800',
    store: 'bg-green-100 text-green-800',
    office: 'bg-purple-100 text-purple-800',
  }
  return colors[type] || 'bg-gray-100 text-gray-800'
}
```

---

## UI Components Used

### From shadcn/ui

| Component | Usage |
|-----------|-------|
| Button | Actions, navigation |
| Input | Text fields, search |
| Textarea | Description fields |
| Table | Department list display |
| Badge | Status, location type indicators |
| Card | Content containers |
| Tabs | Users/Locations toggle |
| Checkbox | Selection, active status, manager selection |
| Label | Form field labels |

### From Lucide React

| Icon | Usage |
|------|-------|
| Plus | Create button |
| Eye | View action |
| Pencil | Edit action |
| Trash2 | Delete action |
| Search | Search input |
| ArrowLeft | Back navigation |
| ArrowRight | Move to available |
| ChevronLeft | Move to assigned |
| Building2 | Location icon |
| User | User icon |

---

## Routing

### Route Structure

| Route | Page | Purpose |
|-------|------|---------|
| `/finance/department-list` | page.tsx | Department list |
| `/finance/department-list/[id]` | [id]/page.tsx | Department detail |
| `/finance/department-list/[id]/edit` | [id]/edit/page.tsx | Edit department |
| `/finance/department-list/new/edit` | new/edit/page.tsx | Create department |

### Navigation Flow

```
Department List
    │
    ├── [View] → Department Detail
    │                │
    │                └── [Edit] → Edit Form → [Save] → Detail
    │
    ├── [Edit] → Edit Form → [Save] → List
    │
    ├── [Delete] → Confirm → List (item removed)
    │
    └── [New Department] → Edit Form (new) → [Save] → List
```

---

## Data Management

### Mock Data Sources

```typescript
import { mockDepartments } from '@/lib/mock-data/departments'
import { mockUsers } from '@/lib/mock-data/users'
import { mockLocations } from '@/lib/mock-data/locations'
```

### State Updates

All CRUD operations update local React state:

```typescript
// Create
setDepartments([...departments, newDepartment])

// Update
setDepartments(departments.map(d =>
  d.id === id ? { ...d, ...updates } : d
))

// Delete
setDepartments(departments.filter(d => d.id !== id))
```

### Data Persistence

**Current**: Client-side only (state resets on page refresh)

**Future**: Database integration with Supabase/Prisma

---

## Performance Considerations

### Implemented Optimizations

1. **useMemo for filtering**:
   ```typescript
   const filteredDepartments = useMemo(() => {
     // Filter logic
   }, [departments, searchTerm])
   ```

2. **useMemo for manager eligibility**:
   ```typescript
   const availableManagers = useMemo(() => {
     // Filter eligible managers
   }, [department?.managers])
   ```

### Recommended Future Optimizations

| Optimization | Purpose | Phase |
|--------------|---------|-------|
| Server-side pagination | Large department lists | Phase 2 |
| React Query caching | Reduce API calls | Phase 2 |
| Virtual scrolling | Large user/location lists | Phase 3 |
| Debounced search | Reduce filter operations | Phase 2 |

---

## Error Handling

### Current Implementation

- Form validation via Zod with inline error messages
- Delete confirmation via browser `confirm()` dialog
- Navigation error handling via Next.js router

### Error Messages

| Scenario | Error Message |
|----------|---------------|
| Empty code | "Code is required" |
| Code too long | "Code must be 10 characters or less" |
| Empty name | "Name is required" |
| Name too long | "Name must be 100 characters or less" |
| Department not found | "Department Not Found" with back link |

---

## Security Considerations

### Current Implementation

- Client-side only (no authentication required)
- No sensitive data handling
- Form validation prevents injection

### Future Implementation (Planned)

| Feature | Purpose |
|---------|---------|
| Authentication | Require login |
| Role-based access | Restrict actions by role |
| Audit logging | Track changes |
| Server-side validation | Additional security layer |

---

## Testing Recommendations

### Unit Tests

| Test | Description |
|------|-------------|
| Form validation | Test Zod schema validation |
| Filter logic | Test search filtering |
| Manager eligibility | Test role-based filtering |
| Assignment operations | Test dual-pane picker |

### Integration Tests

| Test | Description |
|------|-------------|
| CRUD flow | Create, view, edit, delete department |
| Navigation | Route transitions |
| Form submission | Form data handling |

### E2E Tests

| Test | Description |
|------|-------------|
| Complete workflow | Full department management flow |
| User assignment | Complete user assignment workflow |
| Location assignment | Complete location assignment workflow |

---

## Future Enhancements

### Phase 2: Database Integration

- Supabase/PostgreSQL backend
- Server actions for mutations
- React Query for data fetching
- Optimistic updates

### Phase 3: Advanced Features

- Department hierarchy support
- Budget allocation
- Approval workflows
- Audit trail

### Phase 4: Enterprise Features

- Multi-tenant support
- Advanced reporting
- API integrations
- Bulk operations

---

**Document End**
