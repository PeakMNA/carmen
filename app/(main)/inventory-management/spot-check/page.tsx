/**
 * ============================================================================
 * SPOT CHECK LOCATION SELECTION PAGE
 * ============================================================================
 *
 * This is the main landing page for the Spot Check module.
 * It displays locations available for spot checking and allows users
 * to start new checks, resume in-progress ones, or review completed ones.
 *
 * KEY CONCEPTS:
 *
 * 1. SPOT CHECK PURPOSE:
 *    - Quick, targeted inventory verification
 *    - Verify a sample of items (not full inventory)
 *    - Identify potential discrepancies before full counts
 *    - Triggered by suspicion, routine checks, or audits
 *
 * 2. STEP-BASED WORKFLOW:
 *    Step 1: Location Selection (this page)
 *    Step 2: Method & Items Selection (next page)
 *    Step 3: Counting (count page)
 *    Step 4: Review & Complete
 *
 * 3. STATUS WORKFLOW:
 *    - not-started (draft/pending): Location ready for new spot check
 *    - in-progress: Spot check is underway
 *    - completed: All items counted and finalized
 *
 * 4. USER ACTIONS:
 *    - Start: Begin a new spot check (goes to method selection)
 *    - Resume: Continue an in-progress spot check (goes to counting)
 *    - Review: View completed spot check results
 *
 * FILTERING:
 * - Status tabs: All, In Progress, Not Started, Completed
 * - Search: Filter by location name, department, or reason
 * - Include Not Count: Show cancelled/on-hold checks
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
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Search,
  MapPin,
  Calendar,
  ClipboardList,
  ChevronRight,
  ChevronLeft,
  Play,
  Eye,
  CheckCircle2,
  Clock,
  Building2,
  Users,
  HelpCircle
} from "lucide-react"
import { format } from "date-fns"
import {
  SpotCheck,
  SpotCheckStatus
} from "./types"
import {
  mockSpotChecks,
  getSpotCheckSummary
} from "@/lib/mock-data/spot-checks"

// ============================================================================
// TYPES AND UTILITIES
// ============================================================================

/**
 * Status filter types for UI tabs
 * Maps multiple internal statuses to simplified display categories
 */
type StatusFilter = "all" | "in-progress" | "not-started" | "completed"

/**
 * Map internal spot check status to display filter category
 *
 * Internal statuses are more granular for workflow management,
 * but UI displays simplified categories for user clarity.
 *
 * @param status - Internal SpotCheckStatus
 * @returns Simplified StatusFilter for display
 */
function getDisplayStatus(status: SpotCheckStatus): StatusFilter {
  switch (status) {
    case "in-progress":
      return "in-progress"
    case "completed":
      return "completed"
    case "draft":
    case "pending":
      return "not-started"
    case "on-hold":
    case "cancelled":
    default:
      return "not-started"
  }
}

/**
 * Get action button configuration based on spot check status
 *
 * Determines the button appearance and text based on what action
 * the user can take:
 * - in-progress: "Resume" button (primary) to continue counting
 * - completed: "Review" button (secondary) to view results
 * - not-started: "Start" button (outline) to begin new check
 *
 * @param status - Current SpotCheckStatus
 * @returns Button config with text, icon, variant, and disabled state
 */
function getActionConfig(status: SpotCheckStatus): {
  text: string
  icon: React.ReactNode
  variant: "default" | "secondary" | "outline"
  disabled?: boolean
} {
  const displayStatus = getDisplayStatus(status)
  switch (displayStatus) {
    case "in-progress":
      return { text: "Resume", icon: <Play className="h-4 w-4" />, variant: "default" }
    case "completed":
      return { text: "Review", icon: <Eye className="h-4 w-4" />, variant: "secondary" }
    case "not-started":
    default:
      return { text: "Start", icon: <Play className="h-4 w-4" />, variant: "outline" }
  }
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * LocationCard Component
 *
 * Displays a single location available for spot checking.
 * Shows location details and provides action button based on status.
 *
 * LAYOUT:
 * ┌─────────────────────────────────────────────────┐
 * │ Location Name              [Count Badge]   [Action] │
 * │ Department Name                                    │
 * │ Reason for check                                   │
 * │ 👥 X items  🕐 Last check: YYYY-MM-DD             │
 * └─────────────────────────────────────────────────┘
 *
 * @param check - SpotCheck data object
 * @param onAction - Callback when action button is clicked
 */
function LocationCard({
  check,
  onAction
}: {
  check: SpotCheck
  onAction: () => void
}) {
  const actionConfig = getActionConfig(check.status)
  const lastCheckDate = check.completedAt || check.updatedAt

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4">
          {/* Left: Location info */}
          <div className="flex-1 min-w-0">
            {/* Location name and badge */}
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-base truncate">{check.locationName}</h3>
              <Badge variant="secondary" className="text-xs shrink-0">
                Count
              </Badge>
            </div>

            {/* Hotel/Department name */}
            <p className="text-sm text-muted-foreground mb-2 truncate">
              {check.departmentName}
            </p>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
              {check.reason}
            </p>

            {/* Meta info row */}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{check.totalItems} items</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>Last check: {format(lastCheckDate, "yyyy-MM-dd")}</span>
              </div>
            </div>
          </div>

          {/* Right: Action button */}
          <div className="shrink-0">
            <Button
              variant={actionConfig.variant}
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onAction()
              }}
              disabled={actionConfig.disabled}
              className="min-w-[90px] gap-1"
            >
              {actionConfig.icon}
              {actionConfig.text}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * StatusFilterButton Component
 *
 * Individual tab button for the status filter bar.
 * Shows count and label, with active state styling.
 *
 * @param label - Button text (e.g., "All", "In Progress")
 * @param count - Number to display before label (optional)
 * @param isActive - Whether this filter is currently selected
 * @param onClick - Callback when button is clicked
 */
function StatusFilterButton({
  label,
  count,
  isActive,
  onClick
}: {
  label: string
  count?: number
  isActive: boolean
  onClick: () => void
}) {
  return (
    <Button
      variant={isActive ? "default" : "ghost"}
      size="sm"
      onClick={onClick}
      className={`flex-1 ${isActive ? "" : "text-muted-foreground"}`}
    >
      {count !== undefined && (
        <span className={`mr-1 font-bold ${isActive ? "text-primary-foreground" : ""}`}>
          {count}
        </span>
      )}
      <span>{label}</span>
    </Button>
  )
}

/**
 * QuickGuide Component
 *
 * Help card explaining the available actions for spot checks.
 * Displayed at the bottom of the location list to assist users.
 *
 * ACTIONS EXPLAINED:
 * - Start: Begin a new spot check for a location
 * - Resume: Continue an in-progress spot check session
 * - Review: View results of a completed spot check
 */
function QuickGuide() {
  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">Quick Guide</h3>
        </div>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>
            <span className="font-medium text-foreground">• Start:</span> Begin a new spot check for this location
          </li>
          <li>
            <span className="font-medium text-foreground">• Resume:</span> Continue an existing spot check session
          </li>
          <li>
            <span className="font-medium text-foreground">• Review:</span> View completed spot check results
          </li>
        </ul>
      </CardContent>
    </Card>
  )
}

/**
 * LoadingSkeleton Component
 *
 * Displays placeholder UI while data is loading.
 * Mimics the layout of the actual content for smooth UX.
 */
function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-9 flex-1" />
        ))}
      </div>
      <Skeleton className="h-10 w-full" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

/**
 * SpotCheckPage - Main Landing Page for Spot Check Module
 *
 * This is Step 1 of the spot check workflow where users select
 * a location to perform a spot check on.
 *
 * FEATURES:
 * - Status filter tabs (All, In Progress, Not Started, Completed)
 * - Search by location name, department, or reason
 * - Include/exclude cancelled and on-hold checks
 * - Location cards with appropriate action buttons
 *
 * STATE MANAGEMENT:
 * - spotChecks: Array of all spot check records
 * - statusFilter: Current tab selection
 * - searchQuery: Text search input
 * - includeNotCount: Toggle for cancelled/on-hold checks
 *
 * NAVIGATION:
 * - Start: → /spot-check/new?location=X (method selection)
 * - Resume: → /spot-check/[id]/count (counting page)
 * - Review: → /spot-check/[id] (results page)
 *
 * TODO: Replace mock data with API calls:
 * - GET /api/spot-checks - Fetch all spot checks
 * - GET /api/locations - Fetch available locations
 */
export default function SpotCheckPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [spotChecks, setSpotChecks] = useState<SpotCheck[]>([])

  // ============================================================================
  // FILTER STATE
  // ============================================================================
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [includeNotCount, setIncludeNotCount] = useState(false)

  // Current step indicator (Step 1 = Location Selection)
  const [currentStep] = useState(1)

  // ============================================================================
  // DATA LOADING
  // ============================================================================

  /**
   * Load spot check data on component mount
   *
   * TODO: Replace with API call:
   * const { data, isLoading } = useQuery({
   *   queryKey: ['spot-checks'],
   *   queryFn: () => fetch('/api/spot-checks').then(r => r.json())
   * })
   */
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setSpotChecks(mockSpotChecks)
      setIsLoading(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [])

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Calculate counts for each status filter tab
   *
   * These counts are displayed on the filter buttons to show users
   * how many items are in each category. Respects the includeNotCount
   * toggle to include/exclude cancelled and on-hold checks.
   */
  const statusCounts = useMemo(() => {
    // Exclude cancelled and on-hold unless includeNotCount is checked
    let filtered = spotChecks
    if (!includeNotCount) {
      filtered = filtered.filter(c => c.status !== "cancelled" && c.status !== "on-hold")
    }

    return {
      all: filtered.length,
      "in-progress": filtered.filter(c => getDisplayStatus(c.status) === "in-progress").length,
      "not-started": filtered.filter(c => getDisplayStatus(c.status) === "not-started").length,
      completed: filtered.filter(c => getDisplayStatus(c.status) === "completed").length
    }
  }, [spotChecks, includeNotCount])

  /**
   * Filter and sort spot checks based on current filter state
   *
   * FILTERING PIPELINE:
   * 1. Apply search query (location, department, reason)
   * 2. Exclude cancelled/on-hold (unless includeNotCount)
   * 3. Apply status filter tab
   *
   * SORTING:
   * - Primary: Status priority (in-progress → not-started → completed)
   * - Secondary: Scheduled date (newest first within same status)
   *
   * This ensures in-progress items are always at the top for
   * easy access to continue work.
   */
  const filteredData = useMemo(() => {
    let result = [...spotChecks]

    // Search filter - match against location, department, or reason
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(c =>
        c.locationName.toLowerCase().includes(query) ||
        c.departmentName.toLowerCase().includes(query) ||
        c.reason.toLowerCase().includes(query)
      )
    }

    // Exclude cancelled and on-hold unless includeNotCount is checked
    if (!includeNotCount) {
      result = result.filter(c => c.status !== "cancelled" && c.status !== "on-hold")
    }

    // Apply status filter from tab selection
    if (statusFilter !== "all") {
      result = result.filter(c => getDisplayStatus(c.status) === statusFilter)
    }

    // Sort: in-progress first (urgent), then not-started, then completed
    result.sort((a, b) => {
      const statusOrder: Record<StatusFilter, number> = {
        "in-progress": 0,  // Most urgent - user should complete these
        "not-started": 1,  // Ready to start
        "completed": 2,    // Historical reference
        "all": 3
      }
      const aOrder = statusOrder[getDisplayStatus(a.status)]
      const bOrder = statusOrder[getDisplayStatus(b.status)]

      if (aOrder !== bOrder) return aOrder - bOrder

      // Within same status, sort by scheduled date (newest first)
      return new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
    })

    return result
  }, [spotChecks, statusFilter, searchQuery, includeNotCount])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle action button click on location card
   *
   * Routes user to appropriate page based on spot check status:
   * - Completed: View results page for review
   * - In Progress: Resume counting where they left off
   * - Not Started: Begin new spot check with method selection
   *
   * @param check - The spot check record that was clicked
   */
  const handleAction = (check: SpotCheck) => {
    const displayStatus = getDisplayStatus(check.status)
    if (displayStatus === "completed") {
      // Review completed spot check - view results and variances
      router.push(`/inventory-management/spot-check/${check.id}`)
    } else if (displayStatus === "in-progress") {
      // Resume in-progress spot check - continue counting
      router.push(`/inventory-management/spot-check/${check.id}/count`)
    } else {
      // Start new spot check - go to method/items selection (Step 2)
      router.push(`/inventory-management/spot-check/new?location=${encodeURIComponent(check.locationName)}&locationId=${check.locationId}`)
    }
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  // Loading state - show skeleton while fetching data
  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background border-b">
          <div className="px-4 py-3">
            <h1 className="text-lg font-semibold text-primary">Spot Check</h1>
          </div>
        </div>
        <div className="p-4">
          <LoadingSkeleton />
        </div>
      </div>
    )
  }

  // Main content - location selection interface
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        {/* Step indicator */}
        <div className="flex items-center justify-between px-4 py-3 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-primary font-medium">Step 1: Location</span>
          </div>
          <Progress value={50} className="w-1/2 h-1" />
          <span className="text-muted-foreground">Step 2: Method & Items</span>
        </div>
      </div>

      {/* Status filter tabs */}
      <div className="px-4 pt-4">
        <div className="flex gap-1 p-1 bg-muted/30 rounded-lg">
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
            label="Completed"
            count={statusCounts.completed}
            isActive={statusFilter === "completed"}
            onClick={() => setStatusFilter("completed")}
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-4">
        {/* Section header with checkbox */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-medium text-sm">Select Location to Count</h2>
          </div>
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

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Location cards */}
        <div className="space-y-3">
          {filteredData.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
                  <ClipboardList className="h-12 w-12" />
                  <div>
                    <p className="font-medium">No locations found</p>
                    <p className="text-sm">
                      {searchQuery
                        ? "Try a different search term"
                        : "No locations available for spot check"
                      }
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredData.map((check) => (
              <LocationCard
                key={check.id}
                check={check}
                onAction={() => handleAction(check)}
              />
            ))
          )}
        </div>

        {/* Quick Guide */}
        <QuickGuide />
      </div>
    </div>
  )
}
