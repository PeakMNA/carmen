/**
 * ============================================================================
 * TRANSACTION CATEGORY LIST COMPONENT
 * ============================================================================
 *
 * Displays a searchable, filterable, and sortable list of transaction categories.
 * This is the main data display component used on the Transaction Categories
 * landing page.
 *
 * FEATURES:
 * - Full-text search across category fields
 * - Filter by type (IN, OUT) or status (Active, Inactive)
 * - Sort by any column (code, name, type, GL account)
 * - Row click navigation to category detail page
 * - Context menu with actions (View, Edit, Delete)
 *
 * DATA FLOW:
 * 1. Mock data loaded (TODO: Replace with API call)
 * 2. Type filter applied from props (tab selection)
 * 3. Search filter applied to all fields
 * 4. Status filter applied
 * 5. Sort configuration applied
 * 6. Rendered in table format with status badges
 *
 * TODO: Replace mock data with API integration:
 * - GET /api/transaction-categories?type=&status=&search=&sort=&order=
 *
 * ============================================================================
 */

'use client'

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  MoreHorizontalIcon,
  SearchIcon,
  ArrowUpCircle,
  ArrowDownCircle,
  Filter,
  ArrowUpDown,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  mockTransactionCategories,
  mockTransactionReasons,
} from "@/lib/mock-data/transaction-categories"
import type { AdjustmentType } from "@/lib/types/transaction-category"

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface CategoryListProps {
  /** Filter categories by type (IN or OUT). If undefined, shows all categories. */
  typeFilter?: AdjustmentType
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * CategoryList - Tabular list of all transaction categories
 *
 * Provides a comprehensive view of all category records with:
 * - Optional type filter prop for tab-based filtering
 * - Search bar for quick filtering by any field
 * - Status filter (Active/Inactive)
 * - Sort options
 * - Clickable rows to navigate to category details
 * - Dropdown menu with contextual actions
 *
 * @param typeFilter - Optional filter to show only IN or OUT categories
 * @returns The category list table with search, filter, and sort controls
 */
export function CategoryList({ typeFilter }: CategoryListProps) {
  const router = useRouter()

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /** Current search query - filters across all category fields */
  const [searchQuery, setSearchQuery] = useState("")

  /** Status filter (all, active, inactive) */
  const [statusFilter, setStatusFilter] = useState<string>("all")

  /** Sort configuration - which field and ascending/descending order */
  const [sortConfig, setSortConfig] = useState<{
    field: string
    order: "asc" | "desc"
  }>({ field: "sortOrder", order: "asc" })

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Get reason count for each category
   */
  const reasonCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    mockTransactionReasons.forEach(reason => {
      counts[reason.categoryId] = (counts[reason.categoryId] || 0) + 1
    })
    return counts
  }, [])

  /**
   * Filtered and sorted category data
   *
   * Applies a multi-stage processing pipeline:
   * 1. Type filter - filters by adjustment type (IN/OUT) from tab selection
   * 2. Search filter - matches query against all category fields
   * 3. Status filter - matches active/inactive status
   * 4. Sort - orders by selected field in specified direction
   */
  const filteredAndSortedData = useMemo(() => {
    let filtered = mockTransactionCategories

    // Stage 1: Apply type filter from props (tab selection)
    if (typeFilter) {
      filtered = filtered.filter(cat => cat.type === typeFilter)
    }

    // Stage 2: Apply search filter across all fields
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(cat =>
        cat.code.toLowerCase().includes(query) ||
        cat.name.toLowerCase().includes(query) ||
        cat.glAccountCode.toLowerCase().includes(query) ||
        cat.glAccountName.toLowerCase().includes(query) ||
        (cat.description?.toLowerCase().includes(query) ?? false)
      )
    }

    // Stage 3: Apply status filter
    if (statusFilter !== "all") {
      const isActive = statusFilter === "active"
      filtered = filtered.filter(cat => cat.isActive === isActive)
    }

    // Stage 4: Apply sorting
    return [...filtered].sort((a: any, b: any) => {
      const aValue = a[sortConfig.field]
      const bValue = b[sortConfig.field]

      // Boolean comparison
      if (typeof aValue === "boolean") {
        return sortConfig.order === "asc"
          ? (aValue === bValue ? 0 : aValue ? -1 : 1)
          : (aValue === bValue ? 0 : aValue ? 1 : -1)
      }

      // String comparison
      if (typeof aValue === "string") {
        return sortConfig.order === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      // Numeric comparison
      return sortConfig.order === "asc"
        ? aValue - bValue
        : bValue - aValue
    })
  }, [searchQuery, statusFilter, sortConfig, typeFilter])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc"
    }))
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search categories..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Filter */}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select
          value={`${sortConfig.field}-${sortConfig.order}`}
          onValueChange={(value) => {
            const [field, order] = value.split("-")
            setSortConfig({ field, order: order as "asc" | "desc" })
          }}
        >
          <SelectTrigger className="w-[160px]">
            <ArrowUpDown className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sortOrder-asc">Order (Asc)</SelectItem>
            <SelectItem value="sortOrder-desc">Order (Desc)</SelectItem>
            <SelectItem value="code-asc">Code (A-Z)</SelectItem>
            <SelectItem value="code-desc">Code (Z-A)</SelectItem>
            <SelectItem value="name-asc">Name (A-Z)</SelectItem>
            <SelectItem value="name-desc">Name (Z-A)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Categories Data Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("code")}
              >
                Code
                {sortConfig.field === "code" && (
                  <span className="ml-1">{sortConfig.order === "asc" ? "↑" : "↓"}</span>
                )}
              </TableHead>
              <TableHead
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => handleSort("name")}
              >
                Name
                {sortConfig.field === "name" && (
                  <span className="ml-1">{sortConfig.order === "asc" ? "↑" : "↓"}</span>
                )}
              </TableHead>
              <TableHead>Type</TableHead>
              <TableHead>GL Account</TableHead>
              <TableHead className="text-center">Reasons</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedData.map((category) => (
                <TableRow
                  key={category.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => router.push(`/inventory-management/transaction-categories/${category.id}`)}
                >
                  <TableCell className="font-medium font-mono">
                    {category.code}
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{category.name}</span>
                      {category.description && (
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                          {category.description}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={category.type === "OUT" ? "destructive" : "default"}
                      className={category.type === "IN" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}
                    >
                      {category.type === "OUT" ? (
                        <ArrowDownCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowUpCircle className="h-3 w-3 mr-1" />
                      )}
                      Stock {category.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-mono text-sm">{category.glAccountCode}</span>
                      <p className="text-xs text-muted-foreground">{category.glAccountName}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="secondary">
                      {reasonCounts[category.id] || 0}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontalIcon className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/inventory-management/transaction-categories/${category.id}`)
                          }}
                        >
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/inventory-management/transaction-categories/${category.id}/edit`)
                          }}
                        >
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={(e) => e.stopPropagation()}
                          className="text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredAndSortedData.length} of {mockTransactionCategories.length} categories
      </div>
    </div>
  )
}
