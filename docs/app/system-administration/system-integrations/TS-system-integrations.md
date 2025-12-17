# System Integrations - Technical Specification (TS)

**Module**: System Administration - System Integrations
**Version**: 1.0
**Last Updated**: 2025-01-16
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Implementation Status**: Partially Implemented (POS Integration Active)

---

## 1. Overview

### 1.1 Current State
- **Status**: POS integration actively implemented, ERP and API integrations planned
- **Technology Stack**: Next.js 14 (App Router), React 18, TypeScript, shadcn/ui
- **Data Storage**: Mock data in TypeScript files (planned: PostgreSQL via Supabase)
- **State Management**: Local component state (useState, useMemo)

### 1.2 Technical Architecture
- **Frontend**: React Server Components + Client Components
- **Component Library**: shadcn/ui (Radix UI primitives)
- **Data Tables**: TanStack React Table v8
- **Form Handling**: React Hook Form + Zod validation (planned)
- **Date Handling**: date-fns library
- **Icons**: Lucide React

---

## 2. System Architecture

### 2.1 Component Hierarchy

```
app/(main)/system-administration/system-integrations/
├── page.tsx                          # Landing page (integration type selection)
├── pos/
│   ├── page.tsx                      # POS dashboard
│   ├── layout.tsx                    # POS layout wrapper
│   ├── mapping/
│   │   ├── components/               # Shared mapping components
│   │   │   ├── index.ts             # Component barrel export
│   │   │   ├── mapping-header.tsx   # Common header with search/add
│   │   │   ├── filter-bar.tsx       # Multi-filter bar with presets
│   │   │   ├── data-table.tsx       # Reusable table component
│   │   │   ├── status-badge.tsx     # Status indicator component
│   │   │   ├── row-actions.tsx      # Row action dropdown
│   │   │   ├── mapping-nav.tsx      # Mapping navigation tabs
│   │   │   ├── recipe-edit-drawer.tsx
│   │   │   ├── delete-confirmation-dialog.tsx
│   │   │   ├── mapping-history-drawer.tsx
│   │   │   └── test-mapping-modal.tsx
│   │   ├── recipes/
│   │   │   ├── page.tsx             # Recipe mapping list
│   │   │   ├── types.ts             # RecipeMapping interface
│   │   │   ├── data.ts              # Mock recipe mappings
│   │   │   └── new/
│   │   │       └── page.tsx         # Create recipe mapping
│   │   ├── units/
│   │   │   ├── page.tsx             # Unit mapping list
│   │   │   ├── types.ts             # UnitMapping interface
│   │   │   └── data.ts              # Mock unit mappings
│   │   └── locations/
│   │       ├── page.tsx             # Location mapping list
│   │       ├── types.ts             # LocationMapping interface
│   │       └── data.ts              # Mock location mappings
│   ├── transactions/
│   │   ├── page.tsx                 # Transaction list with filtering
│   │   └── [id]/
│   │       └── page.tsx             # Transaction detail view
│   ├── reports/
│   │   ├── consumption/
│   │   │   └── page.tsx             # Consumption report
│   │   └── gross-profit/
│   │       └── page.tsx             # Gross profit report
│   └── settings/
│       ├── page.tsx                 # Settings redirect
│       ├── layout.tsx               # Settings layout
│       ├── components/
│       │   ├── settings-nav.tsx     # Settings navigation
│       │   └── settings-help-section.tsx
│       ├── config/
│       │   └── page.tsx             # POS configuration
│       └── system/
│           └── page.tsx             # System settings
```

### 2.2 Component Architecture Pattern

#### Page Components (Client Components)
All POS integration pages use **"use client"** directive for client-side interactivity:

```typescript
"use client"

import { useState, useMemo } from "react"
import { RecipeMapping } from "./types"
import { recipeMappings } from "./data"

export default function RecipeMappingPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>([])

  const filteredData = useMemo(() => {
    return recipeMappings.filter(recipe => {
      // Filter logic
    })
  }, [searchQuery, appliedFilters])

  return (
    <div>
      <MappingHeader onSearch={handleSearch} />
      <FilterBar
        filterGroups={filterGroups}
        appliedFilters={appliedFilters}
        onFilterChange={setAppliedFilters}
      />
      <DataTable columns={columns} data={filteredData} />
    </div>
  )
}
```

#### Shared Component Pattern
Reusable components exported via barrel file:

```typescript
// components/index.ts
export { MappingHeader } from "./mapping-header"
export { FilterBar } from "./filter-bar"
export { DataTable } from "./data-table"
export { StatusBadge } from "./status-badge"
export { RowActions } from "./row-actions"

export type { FilterOption, FilterGroup, AppliedFilter } from "./filter-bar"
export type { ActionType } from "./row-actions"
export type { StatusType } from "./status-badge"
```

---

## 3. Data Models

### 3.1 RecipeMapping Interface

**Location**: `app/(main)/system-administration/system-integrations/pos/mapping/recipes/types.ts`

```typescript
export interface RecipeMapping {
  id: string
  posItemCode: string
  posDescription: string
  recipeCode: string
  recipeName: string
  posUnit: string
  recipeUnit: string
  conversionRate: number

  // Enhanced fractional sales support
  recipeVariantId?: string      // Maps to RecipeYieldVariant.id
  variantName?: string           // Display name (e.g., "Pizza Slice")
  baseRecipeId?: string          // Base recipe when multiple POS items map to same recipe
  fractionalSalesType?: 'pizza-slice' | 'cake-slice' | 'bottle-glass' | 'portion-control' | 'custom'

  category: string
  status: StatusType
  lastSyncDate?: Date
  lastSyncStatus?: StatusType
  createdAt: Date
  updatedAt: Date
  isActive?: boolean
}

export type StatusType = "mapped" | "unmapped" | "error" | "active" | "inactive"
```

**Fractional Sales Examples**:
```typescript
// Pizza Slice Mapping (1/8 of large pizza)
{
  posItemCode: "POS009",
  posDescription: "Pizza Slice - Margherita",
  recipeCode: "margherita-pizza",
  recipeName: "Margherita Pizza",
  posUnit: "Slice",
  recipeUnit: "large pizza",
  conversionRate: 0.125,              // 1 slice = 1/8 pizza
  recipeVariantId: "pizza-slice",
  variantName: "Pizza Slice",
  baseRecipeId: "margherita-pizza",
  fractionalSalesType: "pizza-slice"
}

// Cake Slice Mapping (1/16 of whole cake)
{
  posItemCode: "POS005",
  posDescription: "Chocolate Cake Slice",
  recipeCode: "chocolate-pound-cake",
  recipeName: "Chocolate Pound Cake",
  posUnit: "Slice",
  recipeUnit: "whole cake",
  conversionRate: 0.0625,             // 1 slice = 1/16 cake
  recipeVariantId: "cake-slice",
  variantName: "Cake Slice",
  baseRecipeId: "chocolate-pound-cake",
  fractionalSalesType: "cake-slice"
}
```

### 3.2 UnitMapping Interface

**Location**: `app/(main)/system-administration/system-integrations/pos/mapping/units/types.ts`

```typescript
export type UnitType = "recipe" | "sales" | "both"

export interface UnitMapping {
  id: string
  unitCode: string
  unitName: string
  unitType: UnitType
  baseUnit: string
  conversionRate: number
  status: StatusType
  lastUsed?: Date
  createdAt: Date
  updatedAt: Date
}
```

### 3.3 LocationMapping Interface

**Location**: `app/(main)/system-administration/system-integrations/pos/mapping/locations/types.ts`

```typescript
export interface LocationMapping {
  id: string
  posLocationId: string
  posLocationName: string
  posLocationCode?: string
  carmenLocationId: string
  carmenLocationName: string
  carmenLocationType: string
  isActive: boolean
  syncEnabled: boolean
  mappedBy: {
    id: string
    name: string
  }
  mappedAt: string
  notes?: string
}
```

### 3.4 Transaction Interface

**Location**: `app/(main)/system-administration/system-integrations/pos/transactions/page.tsx` (inline)

```typescript
interface Transaction {
  id: string
  dateTime: Date
  location: {
    code: string
    name: string
  }
  items: Array<{
    code: string
    name: string
    category: string
    unitPrice: number
    quantity: number
  }>
  amount: number
  status: "completed" | "processing" | "failed" | "voided"
  actions: Array<"view" | "void" | "export" | "reprocess">
}
```

---

## 4. State Management

### 4.1 Local State Pattern

All pages use **local component state** with React hooks (no global state management):

```typescript
export default function RecipeMappingPage() {
  // UI State
  const [searchQuery, setSearchQuery] = useState("")
  const [appliedFilters, setAppliedFilters] = useState<AppliedFilter[]>([])

  // Modal/Drawer State
  const [editDrawerOpen, setEditDrawerOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false)
  const [testModalOpen, setTestModalOpen] = useState(false)

  // Selected Item State
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeMapping | null>(null)

  // Computed State (Memoized)
  const filteredData = useMemo(() => {
    return recipeMappings.filter(recipe => {
      // Apply search and filters
    })
  }, [searchQuery, appliedFilters])
}
```

### 4.2 Filter State Management

**FilterBar Component** manages complex filter state:

```typescript
interface FilterOption {
  id: string
  label: string
  value: string
}

interface FilterGroup {
  id: string
  label: string
  type: "single" | "multiple"
  options: FilterOption[]
}

interface AppliedFilter {
  groupId: string
  id: string
  label: string
  value: string
}

// Usage in page component
const filterGroups: FilterGroup[] = [
  {
    id: "status",
    label: "Status",
    type: "multiple",
    options: [
      { id: 'mapped', label: 'Mapped', value: 'mapped' },
      { id: 'unmapped', label: 'Unmapped', value: 'unmapped' },
      { id: 'error', label: 'Error', value: 'error' },
    ],
  },
  {
    id: "category",
    label: "Category",
    type: "multiple",
    options: categories.map(cat => ({
      id: cat.id,
      label: cat.name,
      value: cat.name,
    })),
  },
]
```

### 4.3 Transaction State Management

**Transaction List Page** with selection and expansion:

```typescript
export default function TransactionsPage() {
  // Filter State
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    to: new Date()
  })
  const [locationFilter, setLocationFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string[]>([])

  // Table Interaction State
  const [selectedRows, setSelectedRows] = useState<string[]>([])
  const [expandedRows, setExpandedRows] = useState<string[]>([])

  // Pagination State
  const [itemsPerPage, setItemsPerPage] = useState<number>(10)
  const [currentPage, setCurrentPage] = useState<number>(1)

  // Toggle row selection
  const toggleRowSelection = (id: string) => {
    setSelectedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    )
  }

  // Toggle row expansion
  const toggleRowExpansion = (id: string) => {
    setExpandedRows(prev =>
      prev.includes(id)
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    )
  }
}
```

---

## 5. Data Flow & Operations

### 5.1 Mock Data Pattern

**Current Implementation** uses static TypeScript files:

```typescript
// app/(main)/system-administration/system-integrations/pos/mapping/recipes/data.ts
import { RecipeMapping } from "./types"

export const recipeMappings: RecipeMapping[] = [
  {
    id: "recipe-001",
    posItemCode: "POS001",
    posDescription: "Chicken Curry",
    recipeCode: "RCP001",
    recipeName: "Chicken Curry",
    posUnit: "Plate",
    recipeUnit: "Recipe",
    conversionRate: 1,
    category: "Main Course",
    status: "mapped",
    // ...
  },
  // More mappings...
]

export const categories = [
  { id: 'main-course', name: 'Main Course' },
  { id: 'starters', name: 'Starters' },
  { id: 'beverages', name: 'Beverages' },
  // ...
]

export const locations = [
  { id: 'loc-001', name: 'Main Restaurant' },
  { id: 'loc-002', name: 'Lobby Bar' },
  // ...
]
```

### 5.2 Filtering Logic (Client-Side)

**useMemo Pattern** for performance optimization:

```typescript
const filteredData = useMemo(() => {
  return recipeMappings.filter(recipe => {
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (
        !recipe.posItemCode.toLowerCase().includes(query) &&
        !recipe.posDescription.toLowerCase().includes(query) &&
        !recipe.recipeCode.toLowerCase().includes(query) &&
        !recipe.recipeName.toLowerCase().includes(query)
      ) {
        return false
      }
    }

    // Apply status filters
    const statusFilters = appliedFilters
      .filter(f => f.groupId === "status")
      .map(f => f.value)

    if (statusFilters.length > 0 && !statusFilters.includes(recipe.status)) {
      return false
    }

    // Apply category filters
    const categoryFilters = appliedFilters
      .filter(f => f.groupId === "category")
      .map(f => f.value)

    if (categoryFilters.length > 0 && !categoryFilters.includes(recipe.category)) {
      return false
    }

    return true
  })
}, [searchQuery, appliedFilters])
```

### 5.3 CRUD Operations (Planned)

**Current State**: TODO comments with console.log placeholders

```typescript
// Handle save mapping
const handleSaveMapping = (updatedMapping: Partial<RecipeMapping>) => {
  console.log("Saving updated mapping:", updatedMapping)
  // TODO: Implement actual save logic with API call
}

// Handle delete mapping
const handleDeleteMapping = (deleteType: "soft" | "hard", reason?: string) => {
  console.log(`Deleting mapping (${deleteType}):`, selectedRecipe?.id, "Reason:", reason)
  // TODO: Implement actual delete logic with API call
}
```

**Planned API Integration**:
```typescript
// Future server action pattern
async function handleSaveMapping(updatedMapping: Partial<RecipeMapping>) {
  const result = await updateRecipeMapping(selectedRecipe!.id, updatedMapping)
  if (result.success) {
    toast.success("Mapping updated successfully")
    setEditDrawerOpen(false)
    router.refresh()
  } else {
    toast.error(result.error)
  }
}
```

---

## 6. UI Components

### 6.1 Data Table Component

**TanStack React Table** integration:

```typescript
import { ColumnDef } from "@tanstack/react-table"
import { DataTable } from "../components"

// Define columns
const columns: ColumnDef<RecipeMapping>[] = [
  {
    accessorKey: "posItemCode",
    header: "POS Item Code",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.posItemCode}</div>
    ),
  },
  {
    accessorKey: "posDescription",
    header: "POS Description",
    cell: ({ row }) => <div>{row.original.posDescription}</div>,
  },
  {
    accessorKey: "recipeCode",
    header: "Recipe Code",
    cell: ({ row }) => (
      <div>
        {row.original.recipeCode ? (
          <Link
            href={`/operational-planning/recipe-management/recipes/${row.original.recipeCode}`}
            className="flex items-center text-primary hover:underline"
          >
            {row.original.recipeCode}
            <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
        ) : (
          <span className="text-muted-foreground">Not mapped</span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "units",
    header: "Units",
    cell: ({ row }) => (
      <div className="text-sm">
        <div>POS: <span className="font-medium">{row.original.posUnit}</span></div>
        <div>Recipe: <span className="font-medium">{row.original.recipeUnit || "-"}</span></div>
        {row.original.conversionRate > 0 && (
          <div className="text-xs text-muted-foreground mt-1">
            Conversion: {row.original.conversionRate}
          </div>
        )}
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <RowActions
        onAction={(action) => handleRowAction(action, row.original)}
        availableActions={["edit", 'delete', 'history', 'test']}
      />
    ),
  },
]

// Usage
<DataTable
  columns={columns}
  data={filteredData}
  rowClassName={getRowClassName}
/>
```

### 6.2 Status Badge Component

**Reusable status indicator**:

```typescript
export type StatusType = "mapped" | "unmapped" | "error" | "active" | "inactive" | "completed" | "processing" | "failed" | "voided"

export function StatusBadge({ status }: { status: StatusType }) {
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "mapped":
      case "active":
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "unmapped":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "error":
      case "failed":
        return "bg-red-100 text-red-800 border-red-200"
      case "inactive":
      case "voided":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  )
}
```

### 6.3 Row Actions Component

**Dropdown menu for table row actions**:

```typescript
export type ActionType = "edit" | "delete" | "history" | "test" | "view" | "void" | "export" | "reprocess"

interface RowActionsProps {
  onAction: (action: ActionType) => void
  availableActions: ActionType[]
}

export function RowActions({ onAction, availableActions }: RowActionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {availableActions.includes('edit') && (
          <DropdownMenuItem onClick={() => onAction("edit")}>
            <Pencil className="mr-2 h-4 w-4" /> Edit
          </DropdownMenuItem>
        )}
        {availableActions.includes('delete') && (
          <DropdownMenuItem onClick={() => onAction("delete")}>
            <Trash2 className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        )}
        {availableActions.includes('history') && (
          <DropdownMenuItem onClick={() => onAction("history")}>
            <History className="mr-2 h-4 w-4" /> History
          </DropdownMenuItem>
        )}
        {availableActions.includes('test') && (
          <DropdownMenuItem onClick={() => onAction("test")}>
            <Play className="mr-2 h-4 w-4" /> Test
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
```

### 6.4 Conditional Row Styling

**Dynamic row classes based on status**:

```typescript
const getRowClassName = (recipe: RecipeMapping) => {
  if (recipe.status === "error") {
    return "bg-red-50 dark:bg-red-900/10"
  }
  if (recipe.status === "unmapped") {
    return "bg-amber-50 dark:bg-amber-900/10"
  }
  return ""
}

<DataTable
  columns={columns}
  data={filteredData}
  rowClassName={getRowClassName}
/>
```

---

## 7. Form Handling

### 7.1 Settings Form Pattern

**Controlled form inputs with local state**:

```typescript
export default function POSConfigPage() {
  const [formData, setFormData] = useState({
    posSystem: "",
    interfaceType: "api",
    apiEndpoint: "",
    securityToken: "",
    filePath: "",
    filePattern: "",
  })

  const [showToken, setShowToken] = useState(false)
  const [isFormChanged, setIsFormChanged] = useState(false)
  const [isConnectionTesting, setIsConnectionTesting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<"none" | "success" | "error">("none")

  // Field mapping state
  const [fieldMappings, setFieldMappings] = useState([
    { id: '1', posField: 'item_code', systemField: 'posItemCode', dataType: 'string', required: true },
    { id: '2', posField: 'description', systemField: 'posDescription', dataType: 'string', required: true },
    { id: '3', posField: 'price', systemField: 'price', dataType: 'decimal', required: true },
    { id: '4', posField: 'quantity', systemField: 'quantity', dataType: 'decimal', required: true },
  ])

  return (
    <div>
      <Tabs defaultValue="connection">
        <TabsList>
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="connection">
          <Card>
            <CardHeader>
              <CardTitle>POS System Connection</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="posSystem">POS System</Label>
                <Select
                  value={formData.posSystem}
                  onValueChange={(value) => setFormData({ ...formData, posSystem: value })}
                >
                  <SelectTrigger id="posSystem">
                    <SelectValue placeholder="Select POS system" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oracle-simphony">Oracle Simphony</SelectItem>
                    <SelectItem value="micros">Micros</SelectItem>
                    <SelectItem value="toast">Toast</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                    <SelectItem value="clover">Clover</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* More form fields... */}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
```

### 7.2 Planned Form Validation

**React Hook Form + Zod** (not yet implemented):

```typescript
// Future implementation
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

const recipeMappingSchema = z.object({
  posItemCode: z.string().min(1, "POS item code is required"),
  posDescription: z.string().min(1, "POS description is required"),
  recipeCode: z.string().min(1, "Recipe code is required"),
  posUnit: z.string().min(1, "POS unit is required"),
  recipeUnit: z.string().min(1, "Recipe unit is required"),
  conversionRate: z.number().positive("Conversion rate must be positive"),
  fractionalSalesType: z.enum([
    "pizza-slice",
    "cake-slice",
    "bottle-glass",
    "portion-control",
    "custom"
  ]).optional(),
})

type RecipeMappingForm = z.infer<typeof recipeMappingSchema>

export default function CreateRecipeMappingPage() {
  const form = useForm<RecipeMappingForm>({
    resolver: zodResolver(recipeMappingSchema),
    defaultValues: {
      posItemCode: "",
      posDescription: "",
      recipeCode: "",
      posUnit: "",
      recipeUnit: "",
      conversionRate: 1,
    },
  })

  const onSubmit = async (data: RecipeMappingForm) => {
    // Save mapping
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Form fields */}
      </form>
    </Form>
  )
}
```

---

## 8. Utilities & Helper Functions

### 8.1 Date Formatting

**date-fns** for consistent date display:

```typescript
import { format } from "date-fns"

// Format date
const formatDate = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

// Format time
const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }).format(date)
}

// Usage in table cells
<TableCell className="font-medium">
  <div>{formatDate(transaction.dateTime)}</div>
  <div className="text-muted-foreground text-xs">{formatTime(transaction.dateTime)}</div>
</TableCell>
```

### 8.2 Currency Formatting

**Intl.NumberFormat** for currency display:

```typescript
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

// Usage
<TableCell>{formatCurrency(transaction.amount)}</TableCell>
```

### 8.3 Fractional Sales Conversion Logic

**Conversion Rate Calculation**:

```typescript
// Calculate conversion rate for fractional sales
function calculateFractionalConversion(
  fractionalType: 'pizza-slice' | 'cake-slice' | 'bottle-glass' | 'portion-control',
  piecesPerUnit: number
): number {
  // Conversion rate = 1 / pieces per unit
  // Example: 8 slices per pizza = 1/8 = 0.125 conversion rate
  return 1 / piecesPerUnit
}

// Calculate inventory impact
function calculateInventoryImpact(
  quantitySold: number,
  conversionRate: number
): number {
  // Inventory deduction = quantity sold × conversion rate
  // Example: 3 slices sold × 0.125 = 0.375 pizzas deducted
  return quantitySold * conversionRate
}

// Usage example
const slicesSold = 5
const pizzaConversionRate = 0.125 // 1/8 of pizza per slice
const inventoryDeduction = calculateInventoryImpact(slicesSold, pizzaConversionRate)
// Result: 5 × 0.125 = 0.625 pizzas deducted from inventory
```

---

## 9. Performance Optimization

### 9.1 useMemo for Filtering

**Memoization prevents unnecessary re-computation**:

```typescript
const filteredData = useMemo(() => {
  return recipeMappings.filter(recipe => {
    // Complex filtering logic
  })
}, [searchQuery, appliedFilters]) // Only recompute when dependencies change
```

### 9.2 Component Lazy Loading (Planned)

**Code splitting for large components**:

```typescript
// Future optimization
import dynamic from "next/dynamic"

const RecipeEditDrawer = dynamic(
  () => import("../components/recipe-edit-drawer"),
  { loading: () => <div>Loading...</div> }
)

const MappingHistoryDrawer = dynamic(
  () => import("../components/mapping-history-drawer"),
  { ssr: false } // Disable SSR for client-only components
)
```

### 9.3 Pagination Strategy

**Client-side pagination** for transaction lists:

```typescript
const [itemsPerPage, setItemsPerPage] = useState<number>(10)
const [currentPage, setCurrentPage] = useState<number>(1)

// Calculate paginated data
const paginatedData = useMemo(() => {
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  return filteredTransactions.slice(startIndex, endIndex)
}, [filteredTransactions, currentPage, itemsPerPage])
```

---

## 10. Error Handling

### 10.1 Current State (Mock Data)

**No API error handling** yet - all data is static:

```typescript
// Current placeholder
const handleSaveMapping = (updatedMapping: Partial<RecipeMapping>) => {
  console.log("Saving updated mapping:", updatedMapping)
  // TODO: Implement actual save logic with API call
}
```

### 10.2 Planned Error Handling

**Try-catch with user feedback**:

```typescript
// Future implementation
async function handleSaveMapping(updatedMapping: Partial<RecipeMapping>) {
  try {
    setIsSaving(true)
    const result = await updateRecipeMapping(selectedRecipe!.id, updatedMapping)

    if (!result.success) {
      throw new Error(result.error || "Failed to update mapping")
    }

    toast.success("Mapping updated successfully")
    setEditDrawerOpen(false)
    router.refresh()
  } catch (error) {
    console.error("Error updating mapping:", error)
    toast.error(error instanceof Error ? error.message : "An unexpected error occurred")
  } finally {
    setIsSaving(false)
  }
}
```

### 10.3 Validation Errors

**Client-side validation feedback**:

```typescript
// Form validation with Zod (planned)
const form = useForm<RecipeMappingForm>({
  resolver: zodResolver(recipeMappingSchema),
})

// Display validation errors
{form.formState.errors.posItemCode && (
  <p className="text-sm text-red-600">
    {form.formState.errors.posItemCode.message}
  </p>
)}
```

---

## 11. Integration Points

### 11.1 Navigation Integration

**Links to related modules**:

```typescript
// Link from Recipe Mapping to Recipe Management module
<Link
  href={`/operational-planning/recipe-management/recipes/${row.original.recipeCode}`}
  className="flex items-center text-primary hover:underline"
>
  {row.original.recipeCode}
  <ExternalLink className="ml-1 h-3 w-3" />
</Link>
```

### 11.2 Planned API Integration

**Server Actions Pattern** (Next.js 14):

```typescript
// app/(main)/system-administration/system-integrations/pos/mapping/recipes/actions.ts
"use server"

import { revalidatePath } from "next/cache"
import { z } from "zod"

const recipeMappingSchema = z.object({
  posItemCode: z.string().min(1),
  posDescription: z.string().min(1),
  recipeCode: z.string().min(1),
  posUnit: z.string().min(1),
  recipeUnit: z.string().min(1),
  conversionRate: z.number().positive(),
  fractionalSalesType: z.enum([
    "pizza-slice",
    "cake-slice",
    "bottle-glass",
    "portion-control",
    "custom"
  ]).optional(),
})

export async function createRecipeMapping(
  data: z.infer<typeof recipeMappingSchema>
) {
  try {
    const validated = recipeMappingSchema.parse(data)

    // TODO: Insert into database via Prisma
    // const mapping = await prisma.recipeMapping.create({ data: validated })

    revalidatePath("/system-administration/system-integrations/pos/mapping/recipes")

    return { success: true, data: validated }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: "Validation failed", issues: error.issues }
    }
    return { success: false, error: "Failed to create mapping" }
  }
}

export async function updateRecipeMapping(
  id: string,
  data: Partial<z.infer<typeof recipeMappingSchema>>
) {
  try {
    // TODO: Update database via Prisma
    // const mapping = await prisma.recipeMapping.update({
    //   where: { id },
    //   data
    // })

    revalidatePath("/system-administration/system-integrations/pos/mapping/recipes")

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to update mapping" }
  }
}

export async function deleteRecipeMapping(id: string) {
  try {
    // TODO: Soft delete or hard delete
    // await prisma.recipeMapping.update({
    //   where: { id },
    //   data: { deletedAt: new Date() }
    // })

    revalidatePath("/system-administration/system-integrations/pos/mapping/recipes")

    return { success: true }
  } catch (error) {
    return { success: false, error: "Failed to delete mapping" }
  }
}
```

### 11.3 Planned Database Integration

**Prisma Client** for database operations:

```typescript
// lib/db.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Usage in server actions
import { prisma } from '@/lib/db'

export async function getRecipeMappings() {
  const mappings = await prisma.recipeMapping.findMany({
    where: {
      deletedAt: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return mappings
}
```

---

## 12. Testing Strategy

### 12.1 Component Testing (Planned)

**Vitest + React Testing Library**:

```typescript
// app/(main)/system-administration/system-integrations/pos/mapping/recipes/__tests__/page.test.tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RecipeMappingPage from '../page'

describe('RecipeMappingPage', () => {
  it('renders recipe mappings table', () => {
    render(<RecipeMappingPage />)
    expect(screen.getByText('Recipe Mapping')).toBeInTheDocument()
  })

  it('filters recipes by search query', async () => {
    render(<RecipeMappingPage />)
    const searchInput = screen.getByPlaceholderText('Search by POS item code or recipe code')

    fireEvent.change(searchInput, { target: { value: 'POS001' } })

    expect(screen.getByText('Chicken Curry')).toBeInTheDocument()
    expect(screen.queryByText('Vegetable Pasta')).not.toBeInTheDocument()
  })

  it('opens edit drawer when edit action clicked', () => {
    render(<RecipeMappingPage />)
    const editButton = screen.getAllByLabelText('Open menu')[0]

    fireEvent.click(editButton)
    fireEvent.click(screen.getByText('Edit'))

    expect(screen.getByText('Edit Recipe Mapping')).toBeInTheDocument()
  })
})
```

### 12.2 Integration Testing (Planned)

**API route testing**:

```typescript
// app/(main)/system-administration/system-integrations/pos/mapping/recipes/__tests__/actions.test.ts
import { describe, it, expect } from 'vitest'
import { createRecipeMapping, updateRecipeMapping } from '../actions'

describe('Recipe Mapping Actions', () => {
  it('creates recipe mapping with valid data', async () => {
    const data = {
      posItemCode: 'POS999',
      posDescription: 'Test Item',
      recipeCode: 'RCP999',
      posUnit: 'Plate',
      recipeUnit: 'Recipe',
      conversionRate: 1,
    }

    const result = await createRecipeMapping(data)

    expect(result.success).toBe(true)
    expect(result.data?.posItemCode).toBe('POS999')
  })

  it('validates required fields', async () => {
    const invalidData = {
      posItemCode: '',
      posDescription: 'Test',
    } as any

    const result = await createRecipeMapping(invalidData)

    expect(result.success).toBe(false)
    expect(result.error).toBe('Validation failed')
  })
})
```

### 12.3 E2E Testing (Planned)

**Playwright for end-to-end workflows**:

```typescript
// tests/e2e/system-integrations/recipe-mapping.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Recipe Mapping', () => {
  test('creates new recipe mapping', async ({ page }) => {
    await page.goto('/system-administration/system-integrations/pos/mapping/recipes')

    await page.click('text=Add Recipe Mapping')

    await page.fill('[name='posItemCode']', 'POS888')
    await page.fill('[name='posDescription']', 'E2E Test Item')
    await page.selectOption('[name='recipeCode']', 'RCP001')
    await page.fill('[name='conversionRate']', '1')

    await page.click('text=Save Mapping')

    await expect(page.locator('text=POS888')).toBeVisible()
    await expect(page.locator('text=E2E Test Item')).toBeVisible()
  })

  test('filters recipes by status', async ({ page }) => {
    await page.goto('/system-administration/system-integrations/pos/mapping/recipes')

    await page.click('text=Status')
    await page.click('text=Unmapped')

    // All visible rows should have unmapped status
    const statusBadges = await page.locator('[class*='bg-amber']').all()
    expect(statusBadges.length).toBeGreaterThan(0)
  })
})
```

---

## Sitemap

### Overview
This section provides a complete navigation structure of all pages, tabs, and dialogues in the System Integrations sub-module.

### Page Hierarchy

```mermaid
graph TD
    ListPage['List Page<br>(/system-administration/system-integrations)']
    CreatePage['Create Page<br>(/system-administration/system-integrations/new)']
    DetailPage["Detail Page<br>(/system-administration/system-integrations/[id])"]
    EditPage["Edit Page<br>(/system-administration/system-integrations/[id]/edit)"]

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
**Route**: `/system-administration/system-integrations`
**File**: `page.tsx`
**Purpose**: Display paginated list of all integrations

**Sections**:
- Header: Title, breadcrumbs, primary actions
- Filters: Quick filters, advanced filter panel
- Search: Global search with autocomplete
- Data Table: Sortable columns, row actions, bulk selection
- Pagination: Page size selector, page navigation

**Tabs**:
- **All Items**: Complete list of all integrations
- **Active**: Filter active items only
- **Archived**: View archived items

**Dialogues**:
- **Quick Create**: Fast creation form with essential fields only
- **Bulk Actions**: Multi-select actions (delete, export, status change)
- **Export**: Export data in various formats (CSV, Excel, PDF)
- **Filter**: Advanced filtering with multiple criteria

#### 2. Detail Page
**Route**: `/system-administration/system-integrations/[id]`
**File**: `[id]/page.tsx`
**Purpose**: Display comprehensive integration details

**Sections**:
- Header: Breadcrumbs, integration title, action buttons
- Info Cards: Multiple cards showing different aspects
- Related Data: Associated records and relationships

**Tabs**:
- **Overview**: Key information and summary
- **History**: Change history and audit trail
- **Activity Log**: User actions and system events

**Dialogues**:
- **Edit**: Navigate to edit form
- **Delete Confirm**: Confirmation before deletion
- **Status Change**: Change integration status with reason

#### 3. Create Page
**Route**: `/system-administration/system-integrations/new`
**File**: `new/page.tsx`
**Purpose**: Create new integration

**Sections**:
- Form Header: Title, Save/Cancel actions
- Form Fields: All required and optional fields
- Validation: Real-time field validation

**Dialogues**:
- **Cancel Confirm**: Confirm discarding unsaved changes
- **Save Draft**: Save incomplete form as draft

#### 4. Edit Page
**Route**: `/system-administration/system-integrations/[id]/edit`
**File**: `[id]/edit/page.tsx`
**Purpose**: Modify existing integration

**Sections**:
- Form Header: Title, Save/Cancel/Delete actions
- Form Fields: Pre-populated with existing data
- Change Tracking: Highlight modified fields

**Dialogues**:
- **Discard Changes**: Confirm discarding modifications
- **Save Draft**: Save changes as draft


## 13. Future Enhancements

### 13.1 Planned Features

**Q2 2025 Roadmap**:
1. **Database Integration**: PostgreSQL + Prisma ORM for persistent storage
2. **Real-time Sync**: WebSocket-based real-time POS transaction processing
3. **Batch Import**: CSV/Excel import for bulk recipe mapping creation
4. **Advanced Reporting**: Power BI-style analytics with drill-down capabilities
5. **Audit Logging**: Comprehensive change tracking with user attribution
6. **Multi-tenant Support**: Separate POS integrations per location/franchise
7. **API Management**: RESTful API for third-party integrations
8. **ERP Integration**: SAP, Oracle ERP, NetSuite integration modules
9. **Mobile App**: React Native companion app for on-the-go mapping management
10. **AI-powered Mapping**: ML-based automatic recipe mapping suggestions

### 13.2 Technical Debt

**Known Issues**:
1. **Mock Data**: Replace TypeScript files with database queries
2. **No Validation**: Implement React Hook Form + Zod across all forms
3. **No Error Handling**: Add comprehensive error boundaries and user feedback
4. **No Pagination**: Backend pagination for large datasets
5. **No Caching**: Implement React Query for server state caching
6. **Hardcoded Values**: Move configuration to environment variables
7. **No Testing**: Add unit, integration, and E2E test coverage
8. **Accessibility**: Improve ARIA labels and keyboard navigation
9. **Performance**: Optimize bundle size with code splitting
10. **Security**: Add CSRF protection and input sanitization

### 13.3 Architecture Improvements

**Refactoring Opportunities**:
1. **Extract Business Logic**: Move filtering/sorting logic to custom hooks
2. **Shared State**: Implement Zustand for cross-component state (if needed)
3. **Type Safety**: Generate Prisma types and use throughout application
4. **API Layer**: Create dedicated API client with typed responses
5. **Component Library**: Extract reusable components to shared UI library
6. **Storybook**: Document components with interactive examples
7. **Monitoring**: Add Sentry for error tracking and performance monitoring
8. **Logging**: Structured logging with Winston or Pino
9. **Internationalization**: i18n support for multi-language deployments
10. **Dark Mode**: Full dark mode support across all integration pages

---

**Document Control**:
- **Created**: 2025-01-16
- **Version**: 1.0
- **Status**: Active Implementation (POS), Planned (ERP, API)
- **Next Review**: Q2 2025
