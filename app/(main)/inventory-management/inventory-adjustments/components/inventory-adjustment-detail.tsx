/**
 * ============================================================================
 * INVENTORY ADJUSTMENT DETAIL COMPONENT
 * ============================================================================
 *
 * Displays the complete details of a single inventory adjustment record.
 * This component is the main content area used on the adjustment detail page
 * and provides a tabbed interface for viewing different aspects of the adjustment.
 *
 * TABS:
 * 1. Items - List of products being adjusted with quantities and values
 * 2. Stock Movement - Lot-level tracking of inventory changes by location
 * 3. Journal Entries - Accounting entries generated when adjustment is posted
 *
 * KEY FEATURES:
 * - Read-only view for Posted and Voided adjustments
 * - Edit button (items tab) for Draft status adjustments
 * - Color-coded quantities (green for IN, red for OUT)
 * - Summary section with totals for items, quantity, and value
 * - Header information with adjustment metadata
 * - Action buttons based on adjustment status
 *
 * DATA FLOW:
 * 1. Receives adjustment ID as prop
 * 2. Fetches adjustment data (currently from mock, TODO: API)
 * 3. Computes totals using useMemo
 * 4. Renders appropriate tab content
 *
 * INTEGRATION POINTS:
 * - HeaderInformation: Displays adjustment metadata
 * - HeaderActions: Status-based action buttons (Edit, Post, Void)
 * - StockMovementTable: Lot-level stock movement details
 * - JournalTable/JournalHeader: Accounting entries for posted adjustments
 *
 * TODO: Replace mock data with API calls:
 * - GET /api/inventory-adjustments/:id - Fetch adjustment details
 * - GET /api/inventory-adjustments/:id/journal-entries - Fetch journal entries
 *
 * ============================================================================
 */

'use client'

import { useState, useMemo } from "react"
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardHeader } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  FileText,
  Calculator,
  Package,
} from 'lucide-react'

import { HeaderInformation } from "./header-information"
import { HeaderActions } from "./header-actions"
import { StockMovementTable } from "./stock-movement/stock-movement-table"
import { JournalHeader } from "./journal-entries/journal-header"
import { JournalTable } from "./journal-entries/journal-table"
import { StockMovementItem, JournalEntry, JournalHeader as JournalHeaderType } from "./types"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/** Props for the InventoryAdjustmentDetail component */
interface InventoryAdjustmentDetailProps {
  /** The unique identifier for the adjustment to display */
  id: string
}

/**
 * Represents a single item in an inventory adjustment.
 * Contains product information, quantities, pricing, and lot tracking.
 */
interface AdjustmentItem {
  id: string
  productName: string
  sku: string
  description?: string
  location: string
  locationCode: string
  uom: string
  requiredQuantity: number
  approvedQuantity: number
  issuedQuantity: number
  price: number
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  onHand: number
  onOrder: number
  lastPrice?: number
  lastVendor?: string
  lots: {
    id: string
    lotNumber: string
    quantity: number
    uom: string
  }[]
  unitCost: number
  totalCost: number
}

/**
 * Represents a complete inventory adjustment document.
 * Contains header information, line items, and calculated totals.
 */
interface InventoryAdjustment {
  id: string
  date: string
  type: string
  status: string
  location: string
  locationCode: string
  department: string
  reason: string
  description: string
  items: AdjustmentItem[]
  totals: {
    inQty: number
    outQty: number
    totalCost: number
  }
}

// ============================================================================
// MOCK DATA
// ============================================================================
// Sample adjustment records for development and testing.
// Each record represents a complete adjustment with items, lots, and totals.
// Covers various scenarios: Stock IN/OUT, different statuses, multiple locations.
//
// TODO: Replace with API call to GET /api/inventory-adjustments/:id
// ============================================================================

const mockAdjustments: Record<string, InventoryAdjustment> = {
  "ADJ-2410-001": {
    id: "ADJ-2410-001",
    date: "2024-01-15",
    type: "IN",
    status: "Posted",
    location: "Main Warehouse",
    locationCode: "WH-001",
    department: "Warehouse",
    reason: "Physical Count Variance",
    description: "Adjustment based on monthly physical inventory count",
    items: [
      {
        id: "ITEM-001",
        productName: "Organic Quinoa",
        sku: "GRN-QNA-001",
        description: "Premium organic white quinoa, high in protein and gluten-free",
        location: "Main Warehouse",
        locationCode: "WH-001",
        uom: "KG",
        requiredQuantity: 25,
        approvedQuantity: 25,
        issuedQuantity: 25,
        price: 45.50,
        status: 'pending',
        onHand: 50,
        onOrder: 20,
        lastPrice: 45.50,
        lastVendor: 'Vendor A',
        lots: [
          { id: "LOT-001", lotNumber: "L240115-001", quantity: 25, uom: "KG" }
        ],
        unitCost: 45.50,
        totalCost: 1137.50,
      },
      {
        id: "ITEM-002",
        productName: "Brown Rice",
        sku: "GRN-RCE-002",
        description: "Whole grain brown rice, rich in fiber and nutrients",
        location: "Main Warehouse",
        locationCode: "WH-001",
        uom: "KG",
        requiredQuantity: 50,
        approvedQuantity: 50,
        issuedQuantity: 50,
        price: 28.75,
        status: 'pending',
        onHand: 70,
        onOrder: 30,
        lastPrice: 28.75,
        lastVendor: 'Vendor B',
        lots: [
          { id: "LOT-003", lotNumber: "L240115-003", quantity: 50, uom: "KG" }
        ],
        unitCost: 28.75,
        totalCost: 1437.50,
      }
    ],
    totals: {
      inQty: 75,
      outQty: 0,
      totalCost: 2575.00
    }
  },
  "ADJ-2410-002": {
    id: "ADJ-2410-002",
    date: "2024-01-16",
    type: "OUT",
    status: "Posted",
    location: "Main Warehouse",
    locationCode: "WH-001",
    department: "Warehouse",
    reason: "Damaged Goods",
    description: "Write-off for damaged items found during inspection",
    items: [
      {
        id: "ITEM-003",
        productName: "Olive Oil Extra Virgin",
        sku: "OIL-OLV-001",
        description: "Premium Italian extra virgin olive oil",
        location: "Main Warehouse",
        locationCode: "WH-001",
        uom: "L",
        requiredQuantity: 5,
        approvedQuantity: 5,
        issuedQuantity: 5,
        price: 89.99,
        status: 'completed',
        onHand: 15,
        onOrder: 0,
        lastPrice: 89.99,
        lastVendor: 'Vendor C',
        lots: [
          { id: "LOT-004", lotNumber: "L240116-001", quantity: -5, uom: "L" }
        ],
        unitCost: 89.99,
        totalCost: 449.95,
      }
    ],
    totals: {
      inQty: 0,
      outQty: 5,
      totalCost: 449.95
    }
  },
  "ADJ-2410-003": {
    id: "ADJ-2410-003",
    date: "2024-01-17",
    type: "IN",
    status: "Posted",
    location: "Production Store",
    locationCode: "PS-001",
    department: "Production",
    reason: "System Reconciliation",
    description: "System reconciliation after inventory audit",
    items: [
      {
        id: "ITEM-005",
        productName: "Black Pepper Ground",
        sku: "SPC-PEP-001",
        description: "Premium ground black pepper",
        location: "Production Store",
        locationCode: "PS-001",
        uom: "KG",
        requiredQuantity: 15,
        approvedQuantity: 15,
        issuedQuantity: 15,
        price: 32.50,
        status: 'completed',
        onHand: 25,
        onOrder: 10,
        lastPrice: 32.50,
        lastVendor: 'Vendor E',
        lots: [
          { id: "LOT-006", lotNumber: "L240117-001", quantity: 15, uom: "KG" }
        ],
        unitCost: 32.50,
        totalCost: 487.50,
      },
      {
        id: "ITEM-006",
        productName: "Sea Salt",
        sku: "SPC-SLT-001",
        description: "Fine sea salt",
        location: "Production Store",
        locationCode: "PS-001",
        uom: "KG",
        requiredQuantity: 30,
        approvedQuantity: 30,
        issuedQuantity: 30,
        price: 8.25,
        status: 'completed',
        onHand: 100,
        onOrder: 0,
        lastPrice: 8.25,
        lastVendor: 'Vendor F',
        lots: [
          { id: "LOT-007", lotNumber: "L240117-002", quantity: 30, uom: "KG" }
        ],
        unitCost: 8.25,
        totalCost: 247.50,
      }
    ],
    totals: {
      inQty: 45,
      outQty: 0,
      totalCost: 735.00
    }
  },
  "ADJ-2410-004": {
    id: "ADJ-2410-004",
    date: "2024-01-18",
    type: "OUT",
    status: "Draft",
    location: "Main Warehouse",
    locationCode: "WH-001",
    department: "Warehouse",
    reason: "Quality Control Rejection",
    description: "Items rejected during quality control inspection",
    items: [
      {
        id: "ITEM-004",
        productName: "Whole Wheat Flour",
        sku: "FLR-WHT-001",
        description: "Organic whole wheat flour",
        location: "Main Warehouse",
        locationCode: "WH-001",
        uom: "KG",
        requiredQuantity: 20,
        approvedQuantity: 20,
        issuedQuantity: 0,
        price: 12.50,
        status: 'pending',
        onHand: 100,
        onOrder: 50,
        lastPrice: 12.50,
        lastVendor: 'Vendor D',
        lots: [
          { id: "LOT-005", lotNumber: "L240118-001", quantity: -20, uom: "KG" }
        ],
        unitCost: 12.50,
        totalCost: 250.00,
      }
    ],
    totals: {
      inQty: 0,
      outQty: 20,
      totalCost: 250.00
    }
  },
  "ADJ-2410-005": {
    id: "ADJ-2410-005",
    date: "2024-01-18",
    type: "IN",
    status: "Draft",
    location: "Production Store",
    locationCode: "PS-001",
    department: "Production",
    reason: "Spot Check Variance",
    description: "Adjustment based on spot check findings",
    items: [
      {
        id: "ITEM-007",
        productName: "Chicken Breast",
        sku: "MEA-CHK-001",
        description: "Fresh chicken breast fillets",
        location: "Production Store",
        locationCode: "PS-001",
        uom: "KG",
        requiredQuantity: 25,
        approvedQuantity: 25,
        issuedQuantity: 0,
        price: 12.50,
        status: 'pending',
        onHand: 75,
        onOrder: 20,
        lastPrice: 12.50,
        lastVendor: 'Vendor G',
        lots: [
          { id: "LOT-008", lotNumber: "L240118-002", quantity: 25, uom: "KG" }
        ],
        unitCost: 12.50,
        totalCost: 312.50,
      }
    ],
    totals: {
      inQty: 25,
      outQty: 0,
      totalCost: 312.50
    }
  },
  "ADJ-2410-006": {
    id: "ADJ-2410-006",
    date: "2024-01-19",
    type: "OUT",
    status: "Voided",
    location: "Main Warehouse",
    locationCode: "WH-001",
    department: "Warehouse",
    reason: "Expired Items",
    description: "Write-off for expired inventory items - VOIDED",
    items: [
      {
        id: "ITEM-008",
        productName: "Salmon Fillet",
        sku: "SEA-SAL-001",
        description: "Fresh Atlantic salmon fillet",
        location: "Main Warehouse",
        locationCode: "WH-001",
        uom: "KG",
        requiredQuantity: 50,
        approvedQuantity: 50,
        issuedQuantity: 50,
        price: 28.00,
        status: 'completed',
        onHand: 30,
        onOrder: 0,
        lastPrice: 28.00,
        lastVendor: 'Vendor H',
        lots: [
          { id: "LOT-009", lotNumber: "L240119-001", quantity: -50, uom: "KG" }
        ],
        unitCost: 28.00,
        totalCost: 1400.00,
      },
      {
        id: "ITEM-009",
        productName: "Fresh Basil",
        sku: "HRB-BAS-001",
        description: "Organic fresh basil",
        location: "Main Warehouse",
        locationCode: "WH-001",
        uom: "KG",
        requiredQuantity: 8,
        approvedQuantity: 8,
        issuedQuantity: 8,
        price: 15.00,
        status: 'completed',
        onHand: 10,
        onOrder: 5,
        lastPrice: 15.00,
        lastVendor: 'Vendor I',
        lots: [
          { id: "LOT-010", lotNumber: "L240119-002", quantity: -8, uom: "KG" }
        ],
        unitCost: 15.00,
        totalCost: 120.00,
      }
    ],
    totals: {
      inQty: 0,
      outQty: 58,
      totalCost: 1520.00
    }
  },
  "ADJ-2410-007": {
    id: "ADJ-2410-007",
    date: "2024-01-19",
    type: "IN",
    status: "Posted",
    location: "Production Store",
    locationCode: "PS-001",
    department: "Production",
    reason: "Production Yield Variance",
    description: "Adjustment for production yield variance",
    items: [
      {
        id: "ITEM-010",
        productName: "Tomato Sauce",
        sku: "SAU-TOM-001",
        description: "Premium Italian tomato sauce",
        location: "Production Store",
        locationCode: "PS-001",
        uom: "L",
        requiredQuantity: 40,
        approvedQuantity: 40,
        issuedQuantity: 40,
        price: 6.50,
        status: 'completed',
        onHand: 120,
        onOrder: 30,
        lastPrice: 6.50,
        lastVendor: 'Vendor J',
        lots: [
          { id: "LOT-011", lotNumber: "L240119-003", quantity: 40, uom: "L" }
        ],
        unitCost: 6.50,
        totalCost: 260.00,
      }
    ],
    totals: {
      inQty: 40,
      outQty: 0,
      totalCost: 260.00
    }
  },
  "ADJ-2410-008": {
    id: "ADJ-2410-008",
    date: "2024-01-20",
    type: "OUT",
    status: "Draft",
    location: "Main Warehouse",
    locationCode: "WH-001",
    department: "Warehouse",
    reason: "Theft/Loss",
    description: "Missing inventory items under investigation",
    items: [
      {
        id: "ITEM-011",
        productName: "Chia Seeds",
        sku: "GRN-CHA-003",
        description: "Organic black chia seeds",
        location: "Main Warehouse",
        locationCode: "WH-001",
        uom: "KG",
        requiredQuantity: 5,
        approvedQuantity: 5,
        issuedQuantity: 0,
        price: 53.35,
        status: 'pending',
        onHand: 80,
        onOrder: 0,
        lastPrice: 53.35,
        lastVendor: 'Vendor K',
        lots: [
          { id: "LOT-012", lotNumber: "L240120-001", quantity: -5, uom: "KG" }
        ],
        unitCost: 53.35,
        totalCost: 266.75,
      }
    ],
    totals: {
      inQty: 0,
      outQty: 5,
      totalCost: 266.75
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Retrieves adjustment data by ID from mock data store.
 * Returns a default empty adjustment if ID is not found.
 *
 * @param id - The adjustment ID to look up
 * @returns The adjustment data or a default empty adjustment
 *
 * TODO: Replace with API call to GET /api/inventory-adjustments/:id
 */
const getAdjustmentById = (id: string): InventoryAdjustment => {
  return mockAdjustments[id] || {
    id: id,
    date: new Date().toISOString().split('T')[0],
    type: "IN",
    status: "Draft",
    location: "Main Warehouse",
    locationCode: "WH-001",
    department: "Warehouse",
    reason: "Physical Count Variance",
    description: "Adjustment details",
    items: [],
    totals: { inQty: 0, outQty: 0, totalCost: 0 }
  }
}

/**
 * Mock journal entries for demonstrating the Journal Entries tab.
 * Shows the accounting entries created when an adjustment is posted.
 *
 * For Stock IN adjustments:
 *   DR: Inventory Account (increase asset)
 *   CR: Inventory Variance Account (record adjustment)
 *
 * For Stock OUT adjustments:
 *   DR: Inventory Variance/Expense Account
 *   CR: Inventory Account (decrease asset)
 *
 * TODO: Replace with API call to GET /api/inventory-adjustments/:id/journal-entries
 */
const mockJournalEntries: {
  header: JournalHeaderType
  entries: JournalEntry[]
} = {
  header: {
    status: "Posted",
    journalNo: "JE-2410-001",
    postingDate: "2024-01-15",
    postingPeriod: "2024-01",
    description: "Inventory Adjustment - Physical Count Variance",
    reference: "ADJ-2410-001",
    createdBy: "John Smith",
    createdAt: "2024-01-15 09:30:00",
    postedBy: "Sarah Johnson",
    postedAt: "2024-01-15 14:45:00"
  },
  entries: [
    {
      id: "JE-001",
      account: "1310",
      accountName: "Raw Materials Inventory",
      debit: 2845.50,
      credit: 0,
      department: "Warehouse",
      reference: "ADJ-2410-001"
    },
    {
      id: "JE-002",
      account: "5110",
      accountName: "Inventory Variance",
      debit: 0,
      credit: 2845.50,
      department: "Warehouse",
      reference: "ADJ-2410-001"
    }
  ]
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * InventoryAdjustmentDetail - Complete view of a single inventory adjustment
 *
 * Renders the full adjustment document including:
 * - Header actions (Edit/Post/Void based on status)
 * - Header information (ID, date, type, location, reason)
 * - Tabbed content area (Items, Stock Movement, Journal Entries)
 * - Summary totals for items, quantities, and values
 *
 * @param id - The adjustment ID to display
 * @returns The complete adjustment detail view
 */
export function InventoryAdjustmentDetail({ id }: InventoryAdjustmentDetailProps) {
  const router = useRouter()

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  /** Toggle for edit mode (currently managed by HeaderActions) */
  const [isEditMode, setIsEditMode] = useState(false)

  // ============================================================================
  // DATA LOADING
  // ============================================================================
  // TODO: Replace with React Query or SWR for proper data fetching

  /** Fetch adjustment data based on ID */
  const adjustment = getAdjustmentById(id)
  const items = adjustment.items

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  /** Check if adjustment is editable (only Draft status can be edited) */
  const isEditable = adjustment.status === "Draft"

  /** Determine adjustment direction for styling (green for IN, red for OUT) */
  const isStockIn = adjustment.type === "IN"

  /**
   * Calculate summary totals from line items.
   * Memoized for performance optimization.
   */
  const totals = useMemo(() => {
    const totalQty = items.reduce((sum, item) => sum + item.requiredQuantity, 0)
    const totalValue = items.reduce((sum, item) => sum + item.totalCost, 0)
    return { totalQty, totalValue, itemCount: items.length }
  }, [items])

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle header field updates (used in edit mode).
   * Currently logs to console - TODO: Implement actual update logic.
   */
  const handleHeaderUpdate = (field: string, value: string) => {
    console.log('Updating header field:', field, value)
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader className="flex flex-col gap-6">
          {/* Action Buttons - Edit/Post/Void based on status */}
          <HeaderActions
            status={adjustment.status}
            isEditMode={isEditMode}
            setIsEditMode={setIsEditMode}
          />

          {/* Header Metadata - ID, Date, Type, Location, Reason */}
          <HeaderInformation
            data={adjustment}
            isEditMode={isEditMode}
            onUpdate={handleHeaderUpdate}
          />

          {/* Tabbed Content Area */}
          <Tabs defaultValue="stock" className="w-full">
            <TabsList>
            <TabsTrigger value="items" className="flex items-center gap-2">
                <FileText className="h-4 w-4 mr-2" />
                Items
              </TabsTrigger>
              <TabsTrigger value="stock" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Stock Movement
              </TabsTrigger>
              <TabsTrigger value="journal" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Journal Entries
              </TabsTrigger>
              
            </TabsList>

            {/* Tab: Stock Movement - Lot-level inventory changes */}
            <TabsContent value="stock" className="mt-4">
              <StockMovementTable
                items={adjustment.items.map(item => ({
                  id: item.id,
                  productName: item.productName,
                  sku: item.sku,
                  location: {
                    type: "INV",
                    code: item.locationCode,
                    name: item.location
                  },
                  lots: item.lots.map(lot => ({
                    lotNo: lot.lotNumber,
                    quantity: lot.quantity,
                    uom: lot.uom
                  })),
                  uom: item.uom,
                  unitCost: item.unitCost,
                  totalCost: item.totalCost
                }))} 
              />
            </TabsContent>

            {/* Tab: Journal Entries - Accounting entries for posted adjustments */}
            <TabsContent value="journal" className="mt-4">
              <JournalHeader header={mockJournalEntries.header} />
              <JournalTable entries={mockJournalEntries.entries} />
            </TabsContent>

            {/* Tab: Items - Product list with quantities and values */}
            <TabsContent value="items" className="mt-4">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium">Adjustment Items</h3>
                  <p className="text-sm text-muted-foreground">
                    {items.length} item(s) in this adjustment
                  </p>
                </div>
                {/* Edit button for Draft status - redirects to edit page */}
                {isEditable && (
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/inventory-management/inventory-adjustments/${id}/edit`)}
                  >
                    Edit Items
                  </Button>
                )}
              </div>

              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground border rounded-md">
                  <Package className="h-12 w-12 mb-3" />
                  <p className="font-medium">No items in this adjustment</p>
                  {isEditable && (
                    <p className="text-sm">Click "Edit Items" to add products to this adjustment</p>
                  )}
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[250px]">Product</TableHead>
                        <TableHead className="text-right">Current Stock</TableHead>
                        <TableHead className="text-right">Quantity</TableHead>
                        <TableHead className="text-right">Unit Cost</TableHead>
                        <TableHead className="text-right">Total Value</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div className="font-medium">{item.productName}</div>
                            <div className="text-sm text-muted-foreground">{item.sku}</div>
                          </TableCell>
                          <TableCell className="text-right">
                            {item.onHand} {item.uom}
                          </TableCell>
                          <TableCell className="text-right">
                            <span className={cn(
                              "font-medium",
                              isStockIn ? "text-green-600" : "text-red-600"
                            )}>
                              {isStockIn ? "+" : "-"}{item.requiredQuantity} {item.uom}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {item.unitCost.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD"
                            })}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {item.totalCost.toLocaleString("en-US", {
                              style: "currency",
                              currency: "USD"
                            })}
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">{item.description || "-"}</span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Summary Section */}
              {items.length > 0 && (
                <div className="mt-4 bg-muted/30 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Total Items</p>
                      <p className="text-2xl font-bold">{totals.itemCount}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-sm text-muted-foreground">Total Quantity</p>
                      <p className="text-2xl font-bold">{totals.totalQty}</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-sm text-muted-foreground">Total Value</p>
                      <p className={cn(
                        "text-2xl font-bold",
                        isStockIn ? "text-green-600" : "text-red-600"
                      )}>
                        {isStockIn ? "+" : "-"}
                        {totals.totalValue.toLocaleString("en-US", {
                          style: "currency",
                          currency: "USD"
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardHeader>
      </Card>
    </div>
  )
}
