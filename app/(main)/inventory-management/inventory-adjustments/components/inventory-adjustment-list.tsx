/**
 * ============================================================================
 * INVENTORY ADJUSTMENT LIST COMPONENT
 * ============================================================================
 *
 * Displays a searchable, filterable, and sortable list of inventory adjustments.
 * This is the main data display component used on the Inventory Adjustments
 * landing page.
 *
 * FEATURES:
 * - Full-text search across all adjustment fields
 * - Filter by status (Draft, Posted, Voided), type (IN, OUT), or location
 * - Sort by any column (date, type, status, location, items, value)
 * - Row click navigation to adjustment detail page
 * - Context menu with actions (View, Edit, Delete for drafts)
 *
 * DATA FLOW:
 * 1. Mock data loaded (TODO: Replace with API call)
 * 2. Search filter applied to all fields
 * 3. Status/Type/Location filters applied
 * 4. Sort configuration applied
 * 5. Rendered in table format with status badges
 *
 * TODO: Replace mock data with API integration:
 * - GET /api/inventory-adjustments?search=&status=&type=&location=&sort=&order=
 * - Implement server-side pagination for large datasets
 * - Add loading states and error handling
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
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MoreHorizontalIcon, SearchIcon } from "lucide-react"
import { FilterSortOptions } from "./filter-sort-options"
import StatusBadge  from "@/components/ui/custom-status-badge"


// ============================================================================
// MOCK DATA
// Transaction Code Format: ADJ-YYMM-NNNN (e.g., ADJ-2410-001 = Adjustment #001, October 2024)
// ============================================================================
// Sample adjustment records for development and testing.
// Each record includes: id, date, type (IN/OUT), status, location, reason,
// item count, and total monetary value.
//
// TODO: Replace with API call to GET /api/inventory-adjustments
// ============================================================================

const mockAdjustments = [
  {
    id: "ADJ-2410-001",
    date: "2024-01-15",
    type: "IN",
    status: "Posted",
    location: "Main Warehouse",
    reason: "Physical Count Variance",
    items: 12,
    totalValue: 2845.50
  },
  {
    id: "ADJ-2410-002",
    date: "2024-01-16",
    type: "OUT",
    status: "Posted",
    location: "Main Warehouse",
    reason: "Damaged Goods",
    items: 3,
    totalValue: 567.80
  },
  {
    id: "ADJ-2410-003",
    date: "2024-01-17",
    type: "IN",
    status: "Posted",
    location: "Production Store",
    reason: "System Reconciliation",
    items: 8,
    totalValue: 1234.60
  },
  {
    id: "ADJ-2410-004",
    date: "2024-01-18",
    type: "OUT",
    status: "Draft",
    location: "Main Warehouse",
    reason: "Quality Control Rejection",
    items: 5,
    totalValue: 890.25
  },
  {
    id: "ADJ-2410-005",
    date: "2024-01-18",
    type: "IN",
    status: "Draft",
    location: "Production Store",
    reason: "Spot Check Variance",
    items: 4,
    totalValue: 445.75
  },
  {
    id: "ADJ-2410-006",
    date: "2024-01-19",
    type: "OUT",
    status: "Voided",
    location: "Main Warehouse",
    reason: "Expired Items",
    items: 15,
    totalValue: 3567.90
  },
  {
    id: "ADJ-2410-007",
    date: "2024-01-19",
    type: "IN",
    status: "Posted",
    location: "Production Store",
    reason: "Production Yield Variance",
    items: 6,
    totalValue: 789.30
  },
  {
    id: "ADJ-2410-008",
    date: "2024-01-20",
    type: "OUT",
    status: "Draft",
    location: "Main Warehouse",
    reason: "Theft/Loss",
    items: 2,
    totalValue: 234.50
  }
]

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface InventoryAdjustmentListProps {
  /** Filter adjustments by type (IN or OUT). If undefined, shows all adjustments. */
  typeFilter?: "IN" | "OUT"
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * InventoryAdjustmentList - Tabular list of all inventory adjustments
 *
 * Provides a comprehensive view of all adjustment records with:
 * - Optional type filter prop for tab-based filtering
 * - Search bar for quick filtering by any field
 * - Filter/Sort options via FilterSortOptions component
 * - Clickable rows to navigate to adjustment details
 * - Dropdown menu with contextual actions
 *
 * @param typeFilter - Optional filter to show only IN or OUT adjustments
 * @returns The adjustment list table with search, filter, and sort controls
 */
export function InventoryAdjustmentList({ typeFilter }: InventoryAdjustmentListProps) {
  const router = useRouter()

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /** Current search query - filters across all adjustment fields */
  const [searchQuery, setSearchQuery] = useState("")

  /** Active filter values (status, type, or location values) */
  const [activeFilters, setActiveFilters] = useState<string[]>([])

  /** Sort configuration - which field and ascending/descending order */
  const [sortConfig, setSortConfig] = useState({ field: "date", order: "desc" })

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Filtered and sorted adjustment data
   *
   * Applies a four-stage processing pipeline:
   * 1. Type filter - filters by adjustment type (IN/OUT) from tab selection
   * 2. Search filter - matches query against all adjustment fields
   * 3. Category filter - matches status, type, or location
   * 4. Sort - orders by selected field in specified direction
   *
   * Uses useMemo for performance optimization on large datasets.
   */
  const filteredAndSortedData = useMemo(() => {
    let filtered = mockAdjustments

    // Stage 1: Apply type filter from props (tab selection)
    if (typeFilter) {
      filtered = filtered.filter(item => item.type === typeFilter)
    }

    // Stage 2: Apply search filter across all fields
    if (searchQuery) {
      filtered = filtered.filter(item =>
        Object.values(item).some(value =>
          value.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      )
    }

    // Stage 3: Apply category filters (status, type, or location)
    if (activeFilters.length > 0) {
      // Map display values to actual data values for type filter
      const typeDisplayToValue: Record<string, string> = {
        "Stock In": "IN",
        "Stock Out": "OUT"
      }

      filtered = filtered.filter(item =>
        activeFilters.some(filter => {
          // Check if filter matches status or location directly
          if (item.status === filter || item.location === filter) {
            return true
          }
          // Check if filter is a type filter (map display value to data value)
          const mappedType = typeDisplayToValue[filter]
          if (mappedType && item.type === mappedType) {
            return true
          }
          return false
        })
      )
    }

    // Stage 4: Apply sorting with type-aware comparison
    return [...filtered].sort((a: any, b: any) => {
      const aValue = a[sortConfig.field]
      const bValue = b[sortConfig.field]

      // String comparison using localeCompare for proper alphabetic ordering
      if (typeof aValue === 'string') {
        return sortConfig.order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      // Numeric comparison for numbers
      return sortConfig.order === 'asc'
        ? aValue - bValue
        : bValue - aValue
    })
  }, [mockAdjustments, searchQuery, activeFilters, sortConfig, typeFilter])

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
            placeholder="Search adjustments..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <FilterSortOptions
          onFilterChange={setActiveFilters}
          onSortChange={setSortConfig}
        />
      </div>

      {/* Adjustments Data Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Adjustment #</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Total Value</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedData.map((adjustment) => (
              <TableRow
                key={adjustment.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => router.push(`/inventory-management/inventory-adjustments/${adjustment.id}`)}
              >
                <TableCell className="font-medium">
                  {adjustment.id}
                </TableCell>
                <TableCell>{adjustment.date}</TableCell>
                <TableCell>
                  <StatusBadge status= {adjustment.type}/>
                </TableCell>
                <TableCell>{adjustment.location}</TableCell>
                <TableCell>{adjustment.reason}</TableCell>
                <TableCell>{adjustment.items}</TableCell>
                <TableCell className="text-right">
                  {adjustment.totalValue.toLocaleString('en-US', {
                    style: 'currency',
                    currency: 'USD'
                  })}
                </TableCell>
                <TableCell>
                  <StatusBadge status={adjustment.status} />
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation()
                          router.push(`/inventory-management/inventory-adjustments/${adjustment.id}`)
                        }}
                      >
                        View Details
                      </DropdownMenuItem>
                      {adjustment.status === "Draft" && (
                        <>
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/inventory-management/inventory-adjustments/${adjustment.id}/edit`)
                            }}
                          >
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => e.stopPropagation()}
                            className="text-destructive"
                          >
                            Delete
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
