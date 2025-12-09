/**
 * ============================================================================
 * INVENTORY ADJUSTMENT VIEW PAGE
 * ============================================================================
 *
 * Read-only view page for displaying a single inventory adjustment record.
 * This page is accessed from the adjustment list by clicking on a row or
 * selecting "View Details" from the dropdown menu.
 *
 * PAGE STRUCTURE:
 * 1. Header - Title, adjustment ID badge, status badge, action buttons
 * 2. Type Indicator - Visual card showing Stock IN (green) or OUT (red)
 * 3. Adjustment Details - Location, reason, description (read-only)
 * 4. Items Table - List of products with quantities and costs
 * 5. Summary Card - Total items and value with direction indicator
 * 6. Audit Information - Created by/at, Posted by/at timestamps
 * 7. Footer - Back to list and Edit button (for drafts only)
 *
 * KEY FEATURES:
 * - Read-only display for all statuses
 * - Edit button only visible for Draft status adjustments
 * - Color-coded type indicator (green for IN, red for OUT)
 * - Print and Export action buttons
 * - Audit trail with creation and posting details
 *
 * BUSINESS RULES:
 * - Stock OUT adjustments use system average cost (no price entry)
 * - Stock IN adjustments require price entry (affects valuation)
 * - Only Draft adjustments can be edited
 * - Posted and Voided adjustments are completely read-only
 *
 * TODO: Replace mock data with API calls:
 * - GET /api/inventory-adjustments/:id - Fetch adjustment details
 * - Implement print functionality
 * - Implement export functionality (PDF/Excel)
 *
 * ============================================================================
 */

"use client"

import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  ArrowLeft,
  Edit,
  Package,
  MapPin,
  ArrowUpCircle,
  ArrowDownCircle,
  FileText,
  Printer,
  Download
} from "lucide-react"
import { cn } from "@/lib/utils"
import StatusBadge from "@/components/ui/custom-status-badge"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Adjustment direction - IN increases stock, OUT decreases stock */
type AdjustmentType = "IN" | "OUT"

/**
 * Represents a single item within an inventory adjustment.
 * Contains product details, stock levels, costs, and adjustment reason.
 */
interface AdjustmentItem {
  id: string
  productId: string
  productName: string
  sku: string
  currentStock: number
  adjustmentQty: number
  unit: string
  unitCost: number
  totalCost: number
  reason: string
  notes?: string
}

// ============================================================================
// MOCK DATA
// ============================================================================
// Sample adjustment records for development and testing.
// Matches the data structure used in the edit page for consistency.
// Covers various scenarios: Stock IN/OUT, Draft/Posted/Voided statuses.
//
// TODO: Replace with API call to GET /api/inventory-adjustments/:id
// ============================================================================

const mockAdjustments: Record<string, {
  id: string
  date: string
  type: AdjustmentType
  status: string
  location: string
  locationCode: string
  reason: string
  description: string
  items: AdjustmentItem[]
  createdBy?: string
  createdAt?: string
  postedBy?: string
  postedAt?: string
}> = {
  "ADJ-2024-001": {
    id: "ADJ-2024-001",
    date: "2024-01-15",
    type: "IN",
    status: "Posted",
    location: "Main Warehouse",
    locationCode: "WH-001",
    reason: "Physical Count Variance",
    description: "Adjustment based on monthly physical inventory count",
    createdBy: "John Smith",
    createdAt: "2024-01-15 09:30:00",
    postedBy: "Sarah Johnson",
    postedAt: "2024-01-15 14:45:00",
    items: [
      {
        id: "item-1",
        productId: "prod-1",
        productName: "Organic Quinoa",
        sku: "GRN-QNA-001",
        currentStock: 50,
        adjustmentQty: 25,
        unit: "KG",
        unitCost: 45.50,
        totalCost: 1137.50,
        reason: "Physical Count Variance",
        notes: ""
      },
      {
        id: "item-2",
        productId: "prod-2",
        productName: "Brown Rice",
        sku: "GRN-RCE-002",
        currentStock: 70,
        adjustmentQty: 50,
        unit: "KG",
        unitCost: 28.75,
        totalCost: 1437.50,
        reason: "Physical Count Variance",
        notes: ""
      }
    ]
  },
  "ADJ-2024-002": {
    id: "ADJ-2024-002",
    date: "2024-01-16",
    type: "OUT",
    status: "Posted",
    location: "Main Warehouse",
    locationCode: "WH-001",
    reason: "Damaged Goods",
    description: "Write-off for damaged items found during inspection",
    createdBy: "Mike Wilson",
    createdAt: "2024-01-16 10:00:00",
    postedBy: "Sarah Johnson",
    postedAt: "2024-01-16 15:30:00",
    items: [
      {
        id: "item-3",
        productId: "prod-4",
        productName: "Olive Oil Extra Virgin",
        sku: "OIL-OLV-001",
        currentStock: 15,
        adjustmentQty: 5,
        unit: "L",
        unitCost: 89.99,
        totalCost: 449.95,
        reason: "Damaged Goods",
        notes: "Bottles cracked during handling"
      }
    ]
  },
  "ADJ-2024-003": {
    id: "ADJ-2024-003",
    date: "2024-01-17",
    type: "IN",
    status: "Posted",
    location: "Production Store",
    locationCode: "PS-001",
    reason: "System Reconciliation",
    description: "System reconciliation after inventory audit",
    createdBy: "Jane Doe",
    createdAt: "2024-01-17 08:45:00",
    postedBy: "Sarah Johnson",
    postedAt: "2024-01-17 16:00:00",
    items: [
      {
        id: "item-4",
        productId: "prod-5",
        productName: "Black Pepper Ground",
        sku: "SPC-PEP-001",
        currentStock: 25,
        adjustmentQty: 15,
        unit: "KG",
        unitCost: 32.50,
        totalCost: 487.50,
        reason: "System Reconciliation",
        notes: ""
      },
      {
        id: "item-5",
        productId: "prod-6",
        productName: "Sea Salt",
        sku: "SPC-SLT-001",
        currentStock: 100,
        adjustmentQty: 30,
        unit: "KG",
        unitCost: 8.25,
        totalCost: 247.50,
        reason: "System Reconciliation",
        notes: ""
      }
    ]
  },
  "ADJ-2024-004": {
    id: "ADJ-2024-004",
    date: "2024-01-18",
    type: "OUT",
    status: "Draft",
    location: "Main Warehouse",
    locationCode: "WH-001",
    reason: "Quality Control Rejection",
    description: "Items rejected during quality control inspection",
    createdBy: "Tom Brown",
    createdAt: "2024-01-18 11:15:00",
    items: [
      {
        id: "item-6",
        productId: "prod-5",
        productName: "Whole Wheat Flour",
        sku: "FLR-WHT-001",
        currentStock: 100,
        adjustmentQty: 20,
        unit: "KG",
        unitCost: 12.50,
        totalCost: 250.00,
        reason: "Quality Control Rejection",
        notes: "Moisture damage detected"
      }
    ]
  },
  "ADJ-2024-005": {
    id: "ADJ-2024-005",
    date: "2024-01-18",
    type: "IN",
    status: "Draft",
    location: "Production Store",
    locationCode: "PS-001",
    reason: "Spot Check Variance",
    description: "Adjustment based on spot check findings",
    createdBy: "Emily Chen",
    createdAt: "2024-01-18 14:30:00",
    items: [
      {
        id: "item-7",
        productId: "prod-7",
        productName: "Chicken Breast",
        sku: "MEA-CHK-001",
        currentStock: 75,
        adjustmentQty: 25,
        unit: "KG",
        unitCost: 12.50,
        totalCost: 312.50,
        reason: "Spot Check Variance",
        notes: ""
      }
    ]
  },
  "ADJ-2024-006": {
    id: "ADJ-2024-006",
    date: "2024-01-19",
    type: "OUT",
    status: "Voided",
    location: "Main Warehouse",
    locationCode: "WH-001",
    reason: "Expired Items",
    description: "Write-off for expired inventory items - VOIDED",
    createdBy: "Mike Wilson",
    createdAt: "2024-01-19 09:00:00",
    postedBy: "Sarah Johnson",
    postedAt: "2024-01-19 10:00:00",
    items: [
      {
        id: "item-8",
        productId: "prod-8",
        productName: "Salmon Fillet",
        sku: "SEA-SAL-001",
        currentStock: 30,
        adjustmentQty: 50,
        unit: "KG",
        unitCost: 28.00,
        totalCost: 1400.00,
        reason: "Expired Items",
        notes: ""
      }
    ]
  },
  "ADJ-2024-007": {
    id: "ADJ-2024-007",
    date: "2024-01-19",
    type: "IN",
    status: "Posted",
    location: "Production Store",
    locationCode: "PS-001",
    reason: "Production Yield Variance",
    description: "Adjustment for production yield variance",
    createdBy: "Jane Doe",
    createdAt: "2024-01-19 13:45:00",
    postedBy: "Sarah Johnson",
    postedAt: "2024-01-19 17:00:00",
    items: [
      {
        id: "item-9",
        productId: "prod-10",
        productName: "Tomato Sauce",
        sku: "SAU-TOM-001",
        currentStock: 120,
        adjustmentQty: 40,
        unit: "L",
        unitCost: 6.50,
        totalCost: 260.00,
        reason: "Production Yield Variance",
        notes: ""
      }
    ]
  },
  "ADJ-2024-008": {
    id: "ADJ-2024-008",
    date: "2024-01-20",
    type: "OUT",
    status: "Draft",
    location: "Main Warehouse",
    locationCode: "WH-001",
    reason: "Theft/Loss",
    description: "Missing inventory items under investigation",
    createdBy: "Tom Brown",
    createdAt: "2024-01-20 10:30:00",
    items: [
      {
        id: "item-10",
        productId: "prod-3",
        productName: "Chia Seeds",
        sku: "GRN-CHA-003",
        currentStock: 80,
        adjustmentQty: 5,
        unit: "KG",
        unitCost: 53.35,
        totalCost: 266.75,
        reason: "Theft/Loss",
        notes: "Under investigation"
      }
    ]
  }
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * InventoryAdjustmentViewPage - Read-only view of a single adjustment
 *
 * Displays the complete adjustment record including header information,
 * line items, totals, and audit trail. Provides navigation to edit page
 * for Draft status adjustments.
 *
 * @param params.id - The adjustment ID from the URL path
 * @returns The adjustment view page or a not-found message
 */
export default function InventoryAdjustmentViewPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const adjustmentId = params.id

  // ============================================================================
  // DATA LOADING
  // ============================================================================
  // TODO: Replace with React Query or SWR for proper data fetching

  /** Load adjustment data from mock store */
  const adjustment = mockAdjustments[adjustmentId]

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /**
   * Calculate summary totals from line items.
   * Returns total quantity and total monetary value.
   */
  const totals = useMemo(() => {
    if (!adjustment) return { totalQty: 0, totalValue: 0 }
    const totalQty = adjustment.items.reduce((sum, item) => sum + item.adjustmentQty, 0)
    const totalValue = adjustment.items.reduce((sum, item) => sum + item.totalCost, 0)
    return { totalQty, totalValue }
  }, [adjustment])

  /** Only Draft status adjustments can be edited */
  const isEditable = adjustment?.status === "Draft"

  /** Determine adjustment direction for styling (green for IN, red for OUT) */
  const isStockIn = adjustment?.type === "IN"

  // ============================================================================
  // ERROR STATE - ADJUSTMENT NOT FOUND
  // ============================================================================

  if (!adjustment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Package className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Adjustment Not Found</h2>
        <p className="text-muted-foreground">The adjustment you're looking for doesn't exist.</p>
        <Button onClick={() => router.push("/inventory-management/inventory-adjustments")}>
          Back to Adjustments
        </Button>
      </div>
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Sticky Header with Title, Status Badge, and Actions */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/inventory-management/inventory-adjustments")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">View Adjustment</h1>
                <Badge variant="outline">{adjustment.id}</Badge>
                <StatusBadge status={adjustment.status} />
              </div>
              <p className="text-sm text-muted-foreground">
                {adjustment.type === "IN" ? "Stock In" : "Stock Out"} - {adjustment.location}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            {isEditable && (
              <Button onClick={() => router.push(`/inventory-management/inventory-adjustments/${adjustmentId}/edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Adjustment
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 space-y-6">
        {/* Adjustment Type Visual Indicator - Color-coded card */}
        <Card className={cn(
          "border-2",
          adjustment.type === "OUT" ? "border-red-200 bg-red-50/50" : "border-green-200 bg-green-50/50"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              {adjustment.type === "OUT" ? (
                <ArrowDownCircle className="h-8 w-8 text-red-600" />
              ) : (
                <ArrowUpCircle className="h-8 w-8 text-green-600" />
              )}
              <div>
                <h2 className={cn(
                  "text-lg font-semibold",
                  adjustment.type === "OUT" ? "text-red-700" : "text-green-700"
                )}>
                  {adjustment.type === "OUT" ? "Stock Out Adjustment" : "Stock In Adjustment"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {adjustment.type === "OUT"
                    ? "Reducing inventory quantities (uses system average cost)"
                    : "Increasing inventory quantities (price entry required)"
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Header Details - Location and Reason (Read-Only) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Location</Label>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{adjustment.location} ({adjustment.locationCode})</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Reason</Label>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{adjustment.reason}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-muted-foreground">Description</Label>
          <div className="p-3 bg-muted/50 rounded-md border min-h-[60px]">
            <span className={adjustment.description ? "font-medium" : "text-muted-foreground"}>
              {adjustment.description || "No description provided"}
            </span>
          </div>
        </div>

        {/* Line Items Table - Products with quantities and costs */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Adjustment Items</CardTitle>
                <CardDescription>
                  {adjustment.items.length} item(s) • Total Value: {totals.totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {adjustment.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mb-3" />
                <p>No items in this adjustment</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead className="text-center w-[100px]">Current Stock</TableHead>
                    <TableHead className="text-center w-[120px]">Adj. Qty</TableHead>
                    <TableHead className="text-right w-[120px]">
                      {isStockIn ? "Unit Cost" : "Avg Cost"}
                    </TableHead>
                    <TableHead className="text-right w-[120px]">Total Value</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {adjustment.items.map(item => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.productName}</p>
                          <p className="text-xs text-muted-foreground">{item.sku}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {item.currentStock} {item.unit}
                      </TableCell>
                      <TableCell className="text-center">
                        <span className={cn(
                          "font-medium",
                          isStockIn ? "text-green-600" : "text-red-600"
                        )}>
                          {isStockIn ? "+" : "-"}{item.adjustmentQty}
                        </span>
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        ${item.unitCost.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${item.totalCost.toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Summary Card - Total items and value with direction indicator */}
        {adjustment.items.length > 0 && (
          <Card className="bg-muted/30">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Summary</p>
                  <p className="text-lg font-semibold">
                    {totals.totalQty} items • {totals.totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} total value
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {adjustment.type === "OUT" ? (
                    <Badge variant="destructive" className="text-sm">
                      <ArrowDownCircle className="h-3 w-3 mr-1" />
                      Stock Decrease
                    </Badge>
                  ) : (
                    <Badge className="text-sm bg-green-600">
                      <ArrowUpCircle className="h-3 w-3 mr-1" />
                      Stock Increase
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Audit Trail - Created by/at, Posted by/at timestamps */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Audit Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Created By</Label>
                <p className="font-medium">{adjustment.createdBy || "-"}</p>
                <p className="text-xs text-muted-foreground">{adjustment.createdAt || "-"}</p>
              </div>
              {adjustment.status === "Posted" && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Posted By</Label>
                  <p className="font-medium">{adjustment.postedBy || "-"}</p>
                  <p className="text-xs text-muted-foreground">{adjustment.postedAt || "-"}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Footer - Navigation and Edit actions */}
      <div className="sticky bottom-0 p-4 bg-background border-t">
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => router.push("/inventory-management/inventory-adjustments")}>
            Back to List
          </Button>
          {isEditable && (
            <Button onClick={() => router.push(`/inventory-management/inventory-adjustments/${adjustmentId}/edit`)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Adjustment
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
