/**
 * ============================================================================
 * INVENTORY ADJUSTMENTS MODULE - MAIN PAGE
 * ============================================================================
 *
 * This is the main landing page for managing inventory adjustments.
 * Inventory adjustments are used to correct stock discrepancies between
 * the system records and actual physical inventory.
 *
 * KEY CONCEPTS:
 *
 * 1. ADJUSTMENT TYPES:
 *    - Stock IN: Increase inventory (found items, count variance correction)
 *    - Stock OUT: Decrease inventory (damaged, expired, theft, spoilage)
 *
 * 2. ADJUSTMENT WORKFLOW:
 *    Draft → Posted (final, creates journal entries)
 *    Draft → Voided (cancelled before posting)
 *
 * 3. COSTING RULES:
 *    - Stock OUT: Uses system average cost (no price entry needed)
 *    - Stock IN: Requires manual price entry (affects inventory valuation)
 *
 * 4. INTEGRATION POINTS:
 *    - Physical Count: Generates adjustments from count variances
 *    - Spot Check: Can trigger adjustment for discrepancies
 *    - Journal Entries: Posted adjustments create accounting entries
 *
 * FEATURES:
 * - View all adjustment records with filtering and sorting
 * - Create new adjustment (Stock IN or Stock OUT)
 * - View adjustment details and items
 * - Edit draft adjustments
 * - Post or void adjustments
 *
 * TODO: Replace mock data with API calls:
 * - GET /api/inventory-adjustments - List all adjustments
 * - POST /api/inventory-adjustments - Create new adjustment
 * - PUT /api/inventory-adjustments/:id - Update draft adjustment
 * - POST /api/inventory-adjustments/:id/post - Post adjustment
 * - POST /api/inventory-adjustments/:id/void - Void adjustment
 *
 * ============================================================================
 */

'use client'

import { useRouter } from "next/navigation"
import { PlusIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { InventoryAdjustmentList } from "./components/inventory-adjustment-list"
import { Card, CardContent } from "@/components/ui/card"

/**
 * InventoryAdjustmentsPage - Main Dashboard
 *
 * Displays the list of all inventory adjustments with:
 * - Search and filter capabilities
 * - Sort by date, type, status, location
 * - Quick actions (view, edit, delete for drafts)
 */
export default function InventoryAdjustmentsPage() {
  const router = useRouter()

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Inventory Adjustments</h1>
        <Button onClick={() => router.push("/inventory-management/inventory-adjustments/new")}>
          <PlusIcon className="w-4 h-4 mr-2" />
          New Adjustment
        </Button>
      </div>
      <Card>
        <CardContent className="pt-6">
          <InventoryAdjustmentList />
        </CardContent>
      </Card>
    </div>
  )
}
