"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PurchaseRequestsDataTable } from "./purchase-requests-data-table"
import { PurchaseRequestsCardView } from "./purchase-requests-card-view"
import { purchaseRequestColumns } from "./purchase-requests-columns"
import { PurchaseRequest } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Plus, Download, Printer } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { fetchPurchaseRequests } from "@/app/lib/data"
import { mockPurchaseRequests as mockPRListData } from "@/lib/mock-data/purchase-requests"
import { MockPurchaseRequest } from "@/lib/types"

export function ModernPurchaseRequestList() {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [data, setData] = useState<MockPurchaseRequest[]>([])

  useEffect(() => {
    async function fetchData() {
      const purchaseRequests = await fetchPurchaseRequests();
      setData(purchaseRequests as MockPurchaseRequest[]);
    }
    fetchData();
  }, []);

  // Use the existing mock data instead of fetched data for now
  const displayData = useMemo(() => mockPRListData as MockPurchaseRequest[], [])

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    setSelectedItems(prev =>
      prev.length === displayData.length ? [] : displayData.map(item => item.id)
    )
  }

  const handleView = (pr: MockPurchaseRequest) => {
    router.push(`/procurement/purchase-requests/${pr.id}?id=${pr.id}&mode=view`)
  }

  const handleEdit = (pr: MockPurchaseRequest) => {
    router.push(`/procurement/purchase-requests/${pr.id}?id=${pr.id}&mode=edit`)
  }

  const handleApprove = (pr: PurchaseRequest) => {
    console.log("Approve PR:", pr.id)
    // Implement approve functionality
  }

  const handleReject = (pr: PurchaseRequest) => {
    console.log("Reject PR:", pr.id)
    // Implement reject functionality
  }

  const handleDelete = (pr: PurchaseRequest) => {
    console.log("Delete PR:", pr.id)
    // Implement delete functionality
  }

  const cardView = (
    <PurchaseRequestsCardView
      data={displayData as unknown as PurchaseRequest[]}
      selectedItems={selectedItems}
      onSelectItem={handleSelectItem}
      onSelectAll={handleSelectAll}
      onView={handleView as (pr: PurchaseRequest) => void}
      onEdit={handleEdit as (pr: PurchaseRequest) => void}
      onApprove={handleApprove}
      onReject={handleReject}
      onDelete={handleDelete}
    />
  )

  return (
    <div className="px-6 py-6 space-y-8">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Purchase Requests</h1>
        </div>
        
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
                New PR
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <span className="text-xs">Create Blank PR</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>
                <span className="text-xs">PR Templates</span>
              </DropdownMenuLabel>
              <DropdownMenuItem>
                <span className="text-xs">Office Supplies</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="text-xs">IT Equipment</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="text-xs">Kitchen Supplies</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <span className="text-xs">Maintenance</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <PurchaseRequestsDataTable
        columns={purchaseRequestColumns}
        data={displayData as unknown as PurchaseRequest[]}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        cardView={cardView}
      />
    </div>
  )
}