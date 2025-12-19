/**
 * Purchase Orders List Page
 *
 * @description Main listing page for Purchase Orders with support for:
 * - Table and card view modes
 * - Filtering, sorting, and search capabilities
 * - Creating new POs (blank or from approved Purchase Requests)
 * - Export and print functionality
 *
 * @implementation
 * - Uses PurchaseOrdersDataTable for main data display with integrated filtering
 * - CreatePOFromPR component handles PR selection in a dialog
 * - PRs are automatically grouped by vendor + currency for PO creation
 * - Grouped data stored in localStorage for cross-page state management
 *
 * @workflow Create PO from PR:
 * 1. User clicks "New PO" > "Create from Purchase Requests"
 * 2. Dialog opens with CreatePOFromPR component showing approved PRs
 * 3. User selects PRs (simplified table: PR#, Date, Description only)
 * 4. On submit, PRs are grouped by vendor + currency
 * 5. Single group → direct to create page; Multiple groups → bulk create page
 *
 * @see UC-PO-001 in docs/app/procurement/purchase-orders/UC-purchase-orders.md
 */
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, ChevronDown, Download, Printer } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { mockPurchaseOrders } from "@/lib/mock-data"
import { PurchaseRequest } from "@/lib/types"
import CreatePOFromPR from "./components/createpofrompr"
import { purchaseOrderColumns } from "./components/purchase-orders-columns"
import { PurchaseOrdersDataTable } from "./components/purchase-orders-data-table"
import { PurchaseOrderCardView } from "./components/purchase-orders-card-view"

export default function PurchaseOrdersPage() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<"table" | "card">("table")
  const [selectedPOs, setSelectedPOs] = useState<string[]>([])
  const [showCreateFromPRDialog, setShowCreateFromPRDialog] = useState(false)

  /**
   * Handle PR selection from CreatePOFromPR component
   *
   * Groups selected PRs by vendor + currency combination. Each unique
   * combination creates a separate PO to maintain vendor/currency consistency.
   *
   * @param selectedPRs - Array of selected Purchase Requests from the dialog
   *
   * @note The grouping logic works at PR level (not item level) since PRs
   * are pre-assigned to vendors with specific currency during approval.
   */
  const handleSelectPRs = (selectedPRs: PurchaseRequest[]) => {
    setShowCreateFromPRDialog(false)

    if (selectedPRs.length > 0) {
      // Group PRs by vendor + currency - each unique combination becomes a separate PO
      // This ensures each PO has consistent vendor and currency for proper invoicing
      // Note: vendor, currency, vendorId, totalAmount exist in mock data but not in PurchaseRequest interface
      const groupedPRs = selectedPRs.reduce((groups, pr) => {
        const prAny = pr as any
        const key = `${prAny.vendor}-${prAny.currency}`
        if (!groups[key]) {
          groups[key] = {
            vendor: prAny.vendor,
            vendorId: prAny.vendorId,
            currency: prAny.currency,
            prs: [],
            totalAmount: 0
          }
        }
        groups[key].prs.push(pr)
        groups[key].totalAmount += prAny.totalAmount || 0
        return groups
      }, {} as Record<string, {
        vendor: string
        vendorId: number
        currency: string
        prs: PurchaseRequest[]
        totalAmount: number
      }>)

      // Store grouped PRs for PO creation
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('groupedPurchaseRequests', JSON.stringify(groupedPRs))
          localStorage.setItem('selectedPurchaseRequests', JSON.stringify(selectedPRs))
        }
      } catch (error) {
        console.error('Error storing grouped PRs:', error)
      }
      
      // Navigate to PO creation page with grouped data
      const groupCount = Object.keys(groupedPRs).length
      if (groupCount === 1) {
        router.push('/procurement/purchase-orders/create?mode=fromPR&grouped=true')
      } else {
        router.push('/procurement/purchase-orders/create?mode=fromPR&grouped=true&bulk=true')
      }
    }
  }

  return (
    <div className="container mx-auto py-6 px-6 space-y-8">
      {/* Header Section - following size guide pattern */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Purchase Orders</h1>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="h-8 px-3 text-xs">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          
          <Button variant="outline" className="h-8 px-3 text-xs">
            <Printer className="h-3 w-3 mr-1" />
            Print
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-8 px-3 text-xs font-medium">
                <Plus className="h-3 w-3 mr-1" />
                New PO
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push("/procurement/purchase-orders/create")}>
                <span className="text-xs">Create Blank PO</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowCreateFromPRDialog(true)}>
                <span className="text-xs">Create from Purchase Requests</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Data Table with integrated filtering */}
      <PurchaseOrdersDataTable
        columns={purchaseOrderColumns}
        data={mockPurchaseOrders}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        cardView={<PurchaseOrderCardView data={mockPurchaseOrders} selectedIds={selectedPOs} onSelectionChange={() => {}} />}
      />
      
      {/*
        Create PO from PR Dialog
        - Uses flex layout with min-h-0 for proper scrolling in flex children
        - max-h-[90vh] prevents dialog from exceeding viewport height
        - CreatePOFromPR component manages its own selection state and summary
      */}
      <Dialog
        open={showCreateFromPRDialog}
        onOpenChange={(open) => {
          if (!open) setShowCreateFromPRDialog(false)
        }}
      >
        <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Create PO from Purchase Requests</DialogTitle>
          </DialogHeader>
          <div className="py-4 flex-1 min-h-0 overflow-auto">
            <CreatePOFromPR onSelectPRs={handleSelectPRs} />
          </div>
          <DialogFooter className="sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateFromPRDialog(false)}
            >
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
