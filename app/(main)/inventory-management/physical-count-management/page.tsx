/**
 * ============================================================================
 * PHYSICAL COUNT MANAGEMENT PAGE
 * ============================================================================
 *
 * This is the main dashboard for managing periodic physical inventory counts.
 * Physical counts are comprehensive counts of ALL inventory at specific locations,
 * typically performed monthly, quarterly, or annually.
 *
 * KEY CONCEPTS:
 *
 * 1. PHYSICAL COUNT vs SPOT CHECK:
 *    - Physical Count: Complete inventory count of ALL items at a location
 *    - Spot Check: Quick verification of a SAMPLE of items
 *
 * 2. COUNTING PERIODS:
 *    - Physical counts are organized by counting period (e.g., "December 2024")
 *    - Each period has a deadline by which all counts must be completed
 *    - Multiple locations can have concurrent counts in the same period
 *
 * 3. STATUS WORKFLOW:
 *    - not-started (draft/pending/planning): Count has not begun
 *    - in-progress: Counting is underway
 *    - complete (completed/finalized): All items counted
 *    - on-hold/cancelled: Count paused or cancelled
 *
 * 4. LOCATION-BASED ORGANIZATION:
 *    - Each physical count is tied to a specific location
 *    - Users can filter by location to see relevant counts
 *    - Progress is tracked per location (items counted / total items)
 *
 * USER ACTIONS:
 * - Start: Begin counting for a new location
 * - Resume: Continue an in-progress count
 * - Review: View completed count results
 *
 * ============================================================================
 */

"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Calendar,
  MapPin,
  Play,
  CheckCircle2,
  Clock,
  ClipboardList,
  ChevronRight,
  Building2
} from "lucide-react"
import { format } from "date-fns"
import {
  PhysicalCount,
  PhysicalCountStatus
} from "./types"
import {
  mockPhysicalCounts,
  getPhysicalCountSummary
} from "@/lib/mock-data/physical-counts"

// ============================================================================
// TYPES AND UTILITIES
// ============================================================================

/**
 * Status filter types for the dashboard
 * Maps multiple internal statuses to simplified display categories
 */
type StatusFilter = "all" | "in-progress" | "not-started" | "complete"

/**
 * Get the current counting period information
 *
 * Physical counts are organized by monthly periods.
 * This function returns the current period name and deadline.
 *
 * @returns Object with period name, end date, and current status
 */
function getCurrentPeriod() {
  const now = new Date()
  const monthName = format(now, "MMMM yyyy")
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  return {
    name: monthName,
    endDate: endOfMonth,
    isCurrent: true
  }
}

/**
 * Map internal physical count status to display filter category
 *
 * The internal status has many states, but for display purposes
 * we simplify to three main categories:
 * - in-progress: Actively being counted
 * - complete: All items counted
 * - not-started: Not yet begun (includes draft, planning, pending)
 *
 * @param status - Internal PhysicalCountStatus
 * @returns Simplified StatusFilter for display
 */
function getDisplayStatus(status: PhysicalCountStatus): StatusFilter {
  switch (status) {
    case "in-progress":
      return "in-progress"
    case "completed":
    case "finalized":
      return "complete"
    case "draft":
    case "planning":
    case "pending":
      return "not-started"
    case "on-hold":
    case "cancelled":
    default:
      return "not-started"
  }
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * LocationCountCard Component
 *
 * Displays a single location's physical count status and progress.
 * Provides action buttons based on current status:
 * - Not Started: "Start" button to begin counting
 * - In Progress: "Resume" button to continue counting
 * - Complete: "Done" button (disabled, for visual confirmation)
 *
 * PROGRESS TRACKING:
 * - Shows items counted vs total items
 * - Visual progress bar for quick status assessment
 * - Started date or scheduled date displayed
 */
function LocationCountCard({
  count,
  onResume,
  onStart
}: {
  count: PhysicalCount
  onResume: () => void
  onStart: () => void
}) {
  const progress = count.totalItems > 0 ? Math.round((count.countedItems / count.totalItems) * 100) : 0
  const displayStatus = getDisplayStatus(count.status)

  // Get action button text and handler
  const getActionButton = () => {
    switch (displayStatus) {
      case "in-progress":
        return { text: "Resume", onClick: onResume, variant: "default" as const }
      case "complete":
        return { text: "Done", onClick: () => {}, variant: "secondary" as const, disabled: true }
      case "not-started":
      default:
        return { text: "Start", onClick: onStart, variant: "outline" as const }
    }
  }

  const actionButton = getActionButton()

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Location info */}
          <div className="flex-1 min-w-0">
            {/* Location name and badge */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base truncate">{count.locationName}</h3>
              <Badge variant="secondary" className="text-xs shrink-0">
                Count
              </Badge>
            </div>

            {/* Hotel/Department name */}
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-3">
              <Building2 className="h-3.5 w-3.5" />
              <span className="truncate">{count.departmentName || "All Departments"}</span>
            </div>

            {/* Progress section */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className="font-medium">
                  {count.countedItems}/{count.totalItems} <span className="text-muted-foreground">({progress}%)</span>
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Meta info row */}
            <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <ClipboardList className="h-3 w-3" />
                <span>{count.totalItems} items</span>
              </div>
              {count.startedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Started {format(count.startedAt, "MMM d")}</span>
                </div>
              )}
              {!count.startedAt && count.scheduledDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>Scheduled {format(count.scheduledDate, "MMM d")}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: Action button */}
          <div className="shrink-0">
            <Button
              variant={actionButton.variant}
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                actionButton.onClick()
              }}
              disabled={actionButton.disabled}
              className="min-w-[72px]"
            >
              {actionButton.text}
              {!actionButton.disabled && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Status filter button component
function StatusFilterButton({
  label,
  count,
  isActive,
  onClick
}: {
  label: string
  count: number
  isActive: boolean
  onClick: () => void
}) {
  return (
    <Button
      variant={isActive ? "default" : "outline"}
      size="sm"
      onClick={onClick}
      className="flex items-center gap-1.5"
    >
      <span className={`text-xs font-bold ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`}>
        {count}
      </span>
      <span>{label}</span>
    </Button>
  )
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-24 w-full" />
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-9 w-24" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

/**
 * PhysicalCountManagementPage - Dashboard for physical inventory counts
 *
 * This is the main landing page for the Physical Count module.
 * It displays all physical counts for the current period, organized by location.
 *
 * FEATURES:
 * - Status filtering (All, In Progress, Not Started, Complete)
 * - Location filtering dropdown
 * - "Include Not Count" checkbox for cancelled/on-hold counts
 * - Current period card showing deadline
 * - Sortable list with in-progress counts prioritized
 *
 * DATA FLOW:
 * 1. Load physical counts from mock data (would be API in production)
 * 2. Apply filters (status, location, include not count)
 * 3. Sort results (in-progress first, then not-started, then complete)
 * 4. Display as interactive cards with action buttons
 *
 * NAVIGATION:
 * - Start/Resume → /physical-count-management/{id}/count
 * - Review completed → /physical-count-management/{id}
 */
export default function PhysicalCountManagementPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [physicalCounts, setPhysicalCounts] = useState<PhysicalCount[]>([])

  // ============================================================================
  // FILTER STATE
  // ============================================================================
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [locationFilter, setLocationFilter] = useState<string>("all")
  const [includeNotCount, setIncludeNotCount] = useState(false)

  // ============================================================================
  // DATA LOADING
  // ============================================================================
  // Load physical counts from data source
  // In production: Replace with API call to fetch counts for current period
  // TODO: GET /api/physical-counts?period=current
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setPhysicalCounts(mockPhysicalCounts)
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  // Current counting period for display
  const currentPeriod = useMemo(() => getCurrentPeriod(), [])

  // Unique locations for filter dropdown
  const locations = useMemo(() => {
    const uniqueLocations = [...new Set(physicalCounts.map(c => c.locationName))]
    return uniqueLocations.sort()
  }, [physicalCounts])

  /**
   * Calculate counts for each status filter button
   * Respects location filter and "include not count" checkbox
   */
  const statusCounts = useMemo(() => {
    // Filter by location first if needed
    let filtered = physicalCounts
    if (locationFilter !== "all") {
      filtered = filtered.filter(c => c.locationName === locationFilter)
    }

    // Exclude cancelled and on-hold unless includeNotCount is checked
    if (!includeNotCount) {
      filtered = filtered.filter(c => c.status !== "cancelled" && c.status !== "on-hold")
    }

    return {
      all: filtered.length,
      "in-progress": filtered.filter(c => getDisplayStatus(c.status) === "in-progress").length,
      "not-started": filtered.filter(c => getDisplayStatus(c.status) === "not-started").length,
      complete: filtered.filter(c => getDisplayStatus(c.status) === "complete").length
    }
  }, [physicalCounts, locationFilter, includeNotCount])

  // Filter data based on all filters
  const filteredData = useMemo(() => {
    let result = [...physicalCounts]

    // Filter by location
    if (locationFilter !== "all") {
      result = result.filter(c => c.locationName === locationFilter)
    }

    // Exclude cancelled and on-hold unless includeNotCount is checked
    if (!includeNotCount) {
      result = result.filter(c => c.status !== "cancelled" && c.status !== "on-hold")
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(c => getDisplayStatus(c.status) === statusFilter)
    }

    // Sort: in-progress first, then pending/not-started, then completed
    result.sort((a, b) => {
      const statusOrder: Record<StatusFilter, number> = {
        "in-progress": 0,
        "not-started": 1,
        "complete": 2,
        "all": 3
      }
      const aOrder = statusOrder[getDisplayStatus(a.status)]
      const bOrder = statusOrder[getDisplayStatus(b.status)]

      if (aOrder !== bOrder) return aOrder - bOrder

      // Within same status, sort by scheduled date
      return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    })

    return result
  }, [physicalCounts, statusFilter, locationFilter, includeNotCount])

  // ============================================================================
  // ACTION HANDLERS
  // ============================================================================

  /**
   * Start counting for a physical count that hasn't begun yet
   * Navigates to the counting interface which will:
   * 1. Mark the count as "in-progress"
   * 2. Record the start timestamp
   * 3. Display items for counting
   */
  const handleStartCount = (id: string) => {
    router.push(`/inventory-management/physical-count-management/${id}/count`)
  }

  /**
   * Resume an in-progress physical count
   * Navigates to the counting interface which will:
   * 1. Load existing counted items
   * 2. Show progress from previous session
   * 3. Allow continuing from where user left off
   */
  const handleResumeCount = (id: string) => {
    router.push(`/inventory-management/physical-count-management/${id}/count`)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 px-4 sm:px-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Physical Count</h1>
            <p className="text-muted-foreground">Manage inventory counts by location</p>
          </div>
        </div>
        <LoadingSkeleton />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Physical Count</h1>
          <p className="text-muted-foreground">Manage inventory counts by location</p>
        </div>
      </div>

      {/* Property/Location Selector */}
      <div className="flex items-center gap-3">
        <Select value={locationFilter} onValueChange={setLocationFilter}>
          <SelectTrigger className="w-[240px]">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <SelectValue placeholder="All Locations" />
            </div>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map(loc => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Counting Period Card */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{currentPeriod.name}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <Calendar className="h-4 w-4" />
                <span>Ends: {format(currentPeriod.endDate, "yyyy-MM-dd")}</span>
                {currentPeriod.isCurrent && (
                  <>
                    <span className="text-muted-foreground">•</span>
                    <Badge variant="default" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      Current
                    </Badge>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Count Status Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2">
        <StatusFilterButton
          label="All"
          count={statusCounts.all}
          isActive={statusFilter === "all"}
          onClick={() => setStatusFilter("all")}
        />
        <StatusFilterButton
          label="In Progress"
          count={statusCounts["in-progress"]}
          isActive={statusFilter === "in-progress"}
          onClick={() => setStatusFilter("in-progress")}
        />
        <StatusFilterButton
          label="Not Started"
          count={statusCounts["not-started"]}
          isActive={statusFilter === "not-started"}
          onClick={() => setStatusFilter("not-started")}
        />
        <StatusFilterButton
          label="Complete"
          count={statusCounts.complete}
          isActive={statusFilter === "complete"}
          onClick={() => setStatusFilter("complete")}
        />
      </div>

      {/* Current Period Count Locations Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Current Period Count Locations
          </h3>
          <div className="flex items-center gap-2">
            <Checkbox
              id="include-not-count"
              checked={includeNotCount}
              onCheckedChange={(checked) => setIncludeNotCount(checked === true)}
            />
            <label
              htmlFor="include-not-count"
              className="text-sm text-muted-foreground cursor-pointer"
            >
              Include Not Count
            </label>
          </div>
        </div>

        {/* Location Cards */}
        <div className="space-y-3">
          {filteredData.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
                  <ClipboardList className="h-12 w-12" />
                  <div>
                    <p className="font-medium">No counts found</p>
                    <p className="text-sm">
                      {statusFilter !== "all"
                        ? `No ${statusFilter.replace("-", " ")} counts for the selected location`
                        : "No count locations available for the current period"
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredData.map((count) => (
              <LocationCountCard
                key={count.id}
                count={count}
                onResume={() => handleResumeCount(count.id)}
                onStart={() => handleStartCount(count.id)}
              />
            ))
          )}
        </div>

        {/* Results count footer */}
        {filteredData.length > 0 && (
          <div className="text-center text-sm text-muted-foreground pt-2">
            Showing {filteredData.length} of {physicalCounts.length} count locations
          </div>
        )}
      </div>
    </div>
  )
}
