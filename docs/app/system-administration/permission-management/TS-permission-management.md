# Permission Management - Technical Specification (TS)

**Module**: System Administration - Permission Management
**Version**: 1.0
**Last Updated**: 2025-01-16
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Implementation Status**: Mock Data + Zustand Stores

---

## 1. System Architecture

### 1.1 Current Implementation

```
┌─────────────────────────────────────────────────┐
│           Permission Management UI               │
│  (Next.js 14 App Router + React 18)             │
├─────────────────────────────────────────────────┤
│                                                  │
│  ┌──────────────┐  ┌──────────────┐            │
│  │   Roles UI   │  │ Policies UI  │            │
│  │  [Active]    │  │  [Planned]   │            │
│  └──────┬───────┘  └──────────────┘            │
│         │                                        │
│  ┌──────▼────────────────────────┐             │
│  │   Zustand State Stores        │             │
│  │  - roleStore                  │             │
│  │  - roleDetailStore            │             │
│  └──────┬────────────────────────┘             │
│         │                                        │
│  ┌──────▼────────────────────────┐             │
│  │   Mock Data Layer             │             │
│  │  - mockRoles (20+ roles)      │             │
│  │  - mockPolicies (planned)     │             │
│  └───────────────────────────────┘             │
│                                                  │
└─────────────────────────────────────────────────┘

Future: Replace Mock Data with Prisma + PostgreSQL
```

### 1.2 Technology Stack

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| Frontend Framework | Next.js | 14.x | App Router, Server Components |
| UI Library | React | 18.x | Component rendering |
| Language | TypeScript | 5.x | Type safety |
| State Management | Zustand | 4.x | Client state (roles, filters) |
| UI Components | shadcn/ui | Latest | Role management UI |
| Styling | Tailwind CSS | 3.x | Responsive design |
| Data Storage | Mock Data | N/A | In-memory (temporary) |
| Future DB | Prisma + PostgreSQL | 5.x / 15+ | Production data layer |

---

## 2. Component Architecture

### 2.1 Page Components

#### Roles Main Page
**Path**: `app/(main)/system-administration/permission-management/roles/page.tsx`

```typescript
// Main role management page with list/create/edit views
export default function RoleManagementPage() {
  const [currentView, setCurrentView] = useState<ViewMode>('list')
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const { roles, addRole, updateRole, getRole } = useRoleStore()

  // Handles: list view, create form, edit form
  // Components: RoleDataTable, RoleCardView, RoleForm
}
```

**Features**:
- View mode switching: list | create | edit | view
- Data table with search, filter, sort
- Card view for visual role browsing
- Inline role creation/editing

#### Role Detail Page
**Path**: `app/(main)/system-administration/permission-management/roles/[id]/page.tsx`

```typescript
// Detailed role view with tabbed interface
export default function RoleDetailPage({ params }: { params: { id: string } }) {
  const role = useRoleStore(state => state.getRole(params.id))

  // Tabs: Overview, Permissions, Users, Child Roles, Audit
}
```

**Tabs**:
- **Overview**: Basic info, hierarchy visualization
- **Permissions**: Direct + inherited permissions
- **Users**: Assigned users with filters
- **Policy Assignment**: ABAC policies (planned)
- **Audit**: Change history

### 2.2 Component Hierarchy

```typescript
RoleManagementPage
├── PermissionBreadcrumbs
├── RoleHeader (title, description, actions)
├── ViewMode: 'list'
│   ├── RoleQuickFilters
│   ├── RoleFilterBuilder
│   └── RoleDataTable
│       └── RoleColumns (definition)
├── ViewMode: 'create' | 'edit'
│   └── RoleForm
│       ├── GeneralTab (name, description)
│       ├── PermissionsTab (assignment)
│       └── HierarchyTab (parent roles)
└── ViewMode: 'view'
    └── Navigate to RoleDetailPage

RoleDetailPage
├── EnhancedRoleCard (overview)
├── Tabs
│   ├── PermissionDetailsTab
│   ├── UserAssignmentTab
│   ├── PolicyAssignmentTab (planned)
│   └── AuditTab (planned)
```

---

## 3. Data Models

### 3.1 Core Types

**Location**: `lib/types/permissions.ts`

```typescript
// Role interface (RBAC)
export interface Role {
  id: string
  name: string
  description?: string
  permissions: string[] // Format: "resource:action"
  parentRole?: string // Legacy single parent
  parentRoles?: string[] // Multi-parent support
  hierarchy: number // 1-10
  isSystem?: boolean // Cannot be deleted
  childRoles?: string[] // Computed
  effectivePermissions?: string[] // Direct + inherited
}

// Permission format
export type PermissionString = `${string}:${string}` // "resource:action"

// User-Role assignment
export interface RoleAssignment {
  userId: string
  roleId: string
  department?: Department
  location?: Location
  effectiveFrom: Date
  effectiveTo?: Date
}
```

### 3.2 Mock Data Structure

**Location**: `lib/mock-data/permission-roles.ts`

```typescript
export const mockRoles: Role[] = [
  {
    id: 'role-001',
    name: 'System Administrator',
    description: 'Full system access',
    permissions: ['*'],
    hierarchy: 1,
    isSystem: true
  },
  {
    id: 'role-002',
    name: 'General Manager',
    description: 'Overall property operations',
    permissions: [
      'purchase_request:*',
      'purchase_order:*',
      'user:create',
      'user:update'
    ],
    hierarchy: 2,
    parentRoles: ['role-001']
  }
  // ... 18 more hospitality roles
]
```

---

## 4. State Management

### 4.1 Zustand Store - Role Management

**Location**: `lib/stores/role-store.ts`

```typescript
interface RoleStore {
  // State
  roles: Role[]
  selectedRole: Role | null

  // Actions
  addRole: (role: Omit<Role, 'id'>) => Role
  updateRole: (id: string, updates: Partial<Role>) => boolean
  deleteRole: (id: string) => boolean
  getRole: (id: string) => Role | undefined
  getRolesByHierarchy: (level: number) => Role[]

  // Computed
  getEffectivePermissions: (roleId: string) => string[]
  getRoleHierarchy: (roleId: string) => Role[]
}

export const useRoleStore = create<RoleStore>((set, get) => ({
  roles: mockRoles,
  selectedRole: null,

  addRole: (roleData) => {
    const newRole = {
      ...roleData,
      id: `role-${Date.now()}`,
      effectivePermissions: calculateEffectivePermissions(roleData)
    }
    set(state => ({ roles: [...state.roles, newRole] }))
    return newRole
  },

  updateRole: (id, updates) => {
    set(state => ({
      roles: state.roles.map(role =>
        role.id === id
          ? { ...role, ...updates, effectivePermissions: calculateEffectivePermissions({...role, ...updates}) }
          : role
      )
    }))
    return true
  },

  getEffectivePermissions: (roleId) => {
    const role = get().roles.find(r => r.id === roleId)
    if (!role) return []

    const inherited = role.parentRoles?.flatMap(parentId =>
      get().getEffectivePermissions(parentId)
    ) || []

    return [...new Set([...role.permissions, ...inherited])]
  }
}))
```

### 4.2 Permission Inheritance Algorithm

```typescript
function calculateEffectivePermissions(role: Role): string[] {
  const directPermissions = role.permissions || []

  if (!role.parentRoles || role.parentRoles.length === 0) {
    return directPermissions
  }

  // Recursively get parent permissions
  const inheritedPermissions = role.parentRoles.flatMap(parentId => {
    const parent = mockRoles.find(r => r.id === parentId)
    return parent ? calculateEffectivePermissions(parent) : []
  })

  // Merge and deduplicate
  return [...new Set([...directPermissions, ...inheritedPermissions])]
}
```

---

## 5. UI Components

### 5.1 Role Data Table

**Component**: `RoleDataTable`
**Purpose**: Searchable, filterable, sortable role list

```typescript
interface RoleDataTableProps {
  roles: Role[]
  onView: (role: Role) => void
  onEdit: (role: Role) => void
  onDelete: (role: Role) => void
  onDuplicate: (role: Role) => void
}

Features:
- Search: name, description
- Filters: hierarchy level, system/custom, has users
- Sorting: name, hierarchy, user count
- Pagination: 10/25/50/100 per page
- Bulk actions: export, delete (planned)
```

### 5.2 Role Form

**Component**: `RoleForm`
**Purpose**: Create/edit role with validation

```typescript
interface RoleFormProps {
  role?: Role // Edit mode if provided
  onSave: (data: RoleFormData) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
}

Validation:
- Name: required, unique, 3-100 chars
- Permissions: valid format "resource:action"
- Hierarchy: auto-calculated from parent
- Circular inheritance prevention
```

### 5.3 Permission Selector

**Component**: `PermissionSelector`
**Purpose**: Multi-select permission assignment

```typescript
Features:
- Search with autocomplete
- Categorized permissions (Procurement, Inventory, etc.)
- Visual distinction: direct vs. inherited
- Wildcard support with warnings
- Permission descriptions on hover
```

---

## 6. Validation & Business Logic

### 6.1 Client-Side Validation

```typescript
// Zod schema for role validation
const roleSchema = z.object({
  name: z.string()
    .min(3, "Name must be at least 3 characters")
    .max(100, "Name must not exceed 100 characters")
    .regex(/^[a-zA-Z0-9\s\-_]+$/, "Invalid characters")
    .refine(isUniqueName, "Role name already exists"),

  description: z.string()
    .max(500, "Description too long")
    .optional(),

  permissions: z.array(
    z.string().regex(/^[a-z_]+:[a-z_*]+$/, "Invalid permission format")
  ),

  parentRoles: z.array(z.string().uuid())
    .refine(noCircularInheritance, "Circular inheritance detected")
    .optional()
})
```

### 6.2 Permission Check Logic

```typescript
// Check if user has permission
export function hasPermission(
  user: User,
  resource: string,
  action: string
): boolean {
  const requiredPermission = `${resource}:${action}`

  return user.roles.some(role => {
    const effective = getEffectivePermissions(role.id)
    return (
      effective.includes(requiredPermission) ||
      effective.includes(`${resource}:*`) ||
      effective.includes('*')
    )
  })
}
```

---

## 7. Performance Optimization

### 7.1 Caching Strategy

```typescript
// Cache effective permissions
const permissionCache = new Map<string, string[]>()

export function getEffectivePermissions(roleId: string): string[] {
  if (permissionCache.has(roleId)) {
    return permissionCache.get(roleId)!
  }

  const permissions = calculateEffectivePermissions(roleId)
  permissionCache.set(roleId, permissions)
  return permissions
}

// Invalidate cache on role update
export function invalidatePermissionCache(roleId: string) {
  permissionCache.delete(roleId)
  // Also invalidate child roles
  getChildRoles(roleId).forEach(child =>
    permissionCache.delete(child.id)
  )
}
```

### 7.2 Virtual Scrolling

For large role lists (>100 items), use virtual scrolling:
- Only render visible rows
- Reduce DOM nodes
- Improve scroll performance

---

## 8. Future Enhancements

### 8.1 Database Integration (Q1 2025)

Replace mock data with Prisma + PostgreSQL:

```typescript
// Prisma schema (planned)
model tb_role {
  id          String   @id @default(dbgenerated("gen_random_uuid()"))
  name        String   @unique
  description String?
  permissions Json     // Array of permission strings
  hierarchy   Int
  is_system   Boolean  @default(false)
  created_at  DateTime @default(now())
  updated_at  DateTime @default(now())

  // Relations
  user_roles  tb_user_role[]
  parent_roles tb_role_hierarchy[] @relation("ParentRoles")
  child_roles  tb_role_hierarchy[] @relation("ChildRoles")
}
```

### 8.2 ABAC Policy Engine (Q2 2025)

Implement attribute-based access control:
- Policy builder UI
- Expression evaluator
- Combining algorithms
- Policy testing framework

---

## 9. Testing Strategy

### 9.1 Component Tests

```typescript
// Role form validation test
describe('RoleForm', () => {
  it('validates role name uniqueness', async () => {
    const { getByLabelText, getByText } = render(
      <RoleForm onSave={mockSave} />
    )

    const nameInput = getByLabelText('Role Name')
    fireEvent.change(nameInput, { target: { value: 'System Administrator' } })

    await waitFor(() => {
      expect(getByText('Role name already exists')).toBeInTheDocument()
    })
  })
})
```

### 9.2 Permission Logic Tests

```typescript
// Permission inheritance test
describe('Permission Inheritance', () => {
  it('correctly calculates effective permissions', () => {
    const childRole = {
      permissions: ['purchase_request:create'],
      parentRoles: ['parent-role-id']
    }

    const effective = calculateEffectivePermissions(childRole)

    expect(effective).toContain('purchase_request:create')
    expect(effective).toContain('purchase_request:view') // From parent
  })
})
```

---

## Sitemap

### Overview
This section provides a complete navigation structure of all pages, tabs, and dialogues in the Permission Management sub-module.

### Page Hierarchy

```mermaid
graph TD
    ListPage['List Page<br>(/system-administration/permission-management)']
    CreatePage['Create Page<br>(/system-administration/permission-management/new)']
    DetailPage["Detail Page<br>(/system-administration/permission-management/[id])"]
    EditPage["Edit Page<br>(/system-administration/permission-management/[id]/edit)"]

    %% List Page Tabs
    ListPage --> ListTab1['Tab: All Items']
    ListPage --> ListTab2['Tab: Active']
    ListPage --> ListTab3['Tab: Archived']

    %% List Page Dialogues
    ListPage -.-> ListDialog1['Dialog: Quick Create']
    ListPage -.-> ListDialog2['Dialog: Bulk Actions']
    ListPage -.-> ListDialog3['Dialog: Export']
    ListPage -.-> ListDialog4['Dialog: Filter']

    %% Detail Page Tabs
    DetailPage --> DetailTab1['Tab: Overview']
    DetailPage --> DetailTab2['Tab: History']
    DetailPage --> DetailTab3['Tab: Activity Log']

    %% Detail Page Dialogues
    DetailPage -.-> DetailDialog1['Dialog: Edit']
    DetailPage -.-> DetailDialog2['Dialog: Delete Confirm']
    DetailPage -.-> DetailDialog3['Dialog: Status Change']

    %% Create/Edit Dialogues
    CreatePage -.-> CreateDialog1['Dialog: Cancel Confirm']
    CreatePage -.-> CreateDialog2['Dialog: Save Draft']

    EditPage -.-> EditDialog1['Dialog: Discard Changes']
    EditPage -.-> EditDialog2['Dialog: Save Draft']

    %% Navigation Flow
    ListPage --> DetailPage
    ListPage --> CreatePage
    DetailPage --> EditPage
    CreatePage --> DetailPage
    EditPage --> DetailPage

    style ListPage fill:#e1f5ff
    style CreatePage fill:#fff4e1
    style DetailPage fill:#e8f5e9
    style EditPage fill:#fce4ec
```

### Pages

#### 1. List Page
**Route**: `/system-administration/permission-management`
**File**: `page.tsx`
**Purpose**: Display paginated list of all permissions

**Sections**:
- Header: Title, breadcrumbs, primary actions
- Filters: Quick filters, advanced filter panel
- Search: Global search with autocomplete
- Data Table: Sortable columns, row actions, bulk selection
- Pagination: Page size selector, page navigation

**Tabs**:
- **All Items**: Complete list of all permissions
- **Active**: Filter active items only
- **Archived**: View archived items

**Dialogues**:
- **Quick Create**: Fast creation form with essential fields only
- **Bulk Actions**: Multi-select actions (delete, export, status change)
- **Export**: Export data in various formats (CSV, Excel, PDF)
- **Filter**: Advanced filtering with multiple criteria

#### 2. Detail Page
**Route**: `/system-administration/permission-management/[id]`
**File**: `[id]/page.tsx`
**Purpose**: Display comprehensive permission details

**Sections**:
- Header: Breadcrumbs, permission title, action buttons
- Info Cards: Multiple cards showing different aspects
- Related Data: Associated records and relationships

**Tabs**:
- **Overview**: Key information and summary
- **History**: Change history and audit trail
- **Activity Log**: User actions and system events

**Dialogues**:
- **Edit**: Navigate to edit form
- **Delete Confirm**: Confirmation before deletion
- **Status Change**: Change permission status with reason

#### 3. Create Page
**Route**: `/system-administration/permission-management/new`
**File**: `new/page.tsx`
**Purpose**: Create new permission

**Sections**:
- Form Header: Title, Save/Cancel actions
- Form Fields: All required and optional fields
- Validation: Real-time field validation

**Dialogues**:
- **Cancel Confirm**: Confirm discarding unsaved changes
- **Save Draft**: Save incomplete form as draft

#### 4. Edit Page
**Route**: `/system-administration/permission-management/[id]/edit`
**File**: `[id]/edit/page.tsx`
**Purpose**: Modify existing permission

**Sections**:
- Form Header: Title, Save/Cancel/Delete actions
- Form Fields: Pre-populated with existing data
- Change Tracking: Highlight modified fields

**Dialogues**:
- **Discard Changes**: Confirm discarding modifications
- **Save Draft**: Save changes as draft


## 10. Security Considerations

### 10.1 Permission Check Enforcement

```typescript
// Middleware for permission checks
export async function requirePermission(
  resource: string,
  action: string
) {
  const session = await getServerSession()

  if (!session?.user) {
    redirect('/login')
  }

  if (!hasPermission(session.user, resource, action)) {
    throw new Error('Insufficient permissions')
  }
}
```

### 10.2 Audit Logging

All permission changes logged:
- Role creation/modification/deletion
- Permission additions/removals
- User-role assignments
- Policy changes (future)

---

**Document Control**:
- **Created**: 2025-01-16
- **Version**: 1.0
- **Status**: Active
