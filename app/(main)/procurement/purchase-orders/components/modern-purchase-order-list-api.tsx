"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  usePurchaseOrders,
  useCreatePurchaseOrder,
  // useSendPurchaseOrder, // TODO: Add this hook
  // useAcknowledgePurchaseOrder // TODO: Add this hook
} from "@/lib/hooks/api"
import { PurchaseOrderFilters } from "@/lib/api/procurement"
import { PurchaseOrder, PurchaseOrderStatus } from "@/lib/types"
import { ProcurementErrorBoundary } from "@/components/api/api-error-boundary"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Plus, 
  Download, 
  Printer, 
  Search, 
  Send,
  Check,
  Clock,
  AlertTriangle,
  FileText,
  ChevronRight,
  Package,
  Truck
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"

interface ModernPurchaseOrderListProps {
  className?: string
}

const STATUS_COLORS: Record<string, string> = {
  'draft': "bg-gray-100 text-gray-800",
  'sent': "bg-blue-100 text-blue-800",
  'acknowledged': "bg-yellow-100 text-yellow-800",
  'partial_received': "bg-orange-100 text-orange-800",
  'fully_received': "bg-green-100 text-green-800",
  'closed': "bg-emerald-100 text-emerald-800",
  'cancelled': "bg-red-100 text-red-600"
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  'draft': <FileText className="h-3 w-3" />,
  'sent': <Send className="h-3 w-3" />,
  'acknowledged': <Package className="h-3 w-3" />,
  'partial_received': <Package className="h-3 w-3" />,
  'fully_received': <Check className="h-3 w-3" />,
  'closed': <Check className="h-3 w-3" />,
  'cancelled': <AlertTriangle className="h-3 w-3" />
}

export function ModernPurchaseOrderListAPI({ className }: ModernPurchaseOrderListProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  // State for filters and pagination
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | "all">("all")
  const [vendorFilter, setVendorFilter] = useState<string>("all")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  // Build filters object
  const filters = useMemo((): PurchaseOrderFilters => {
    const baseFilters: PurchaseOrderFilters = {}
    
    if (searchQuery) {
      baseFilters.search = searchQuery
    }
    
    if (statusFilter && statusFilter !== "all") {
      baseFilters.status = [statusFilter]
    }
    
    if (vendorFilter && vendorFilter !== "all") {
      baseFilters.vendorId = [vendorFilter]
    }
    
    return baseFilters
  }, [searchQuery, statusFilter, vendorFilter])

  // API hooks
  const { 
    data: purchaseOrdersData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = usePurchaseOrders(filters, { page, limit })

  const createPOMutation = useCreatePurchaseOrder()

  // TODO: Re-enable when useSendPurchaseOrder hook is available
  // const sendPOMutation = useSendPurchaseOrder({
  //   onSuccess: () => {
  //     toast({ title: "Purchase order sent successfully" })
  //     refetch()
  //   }
  // })

  // TODO: Re-enable when useAcknowledgePurchaseOrder hook is available
  // const acknowledgePOMutation = useAcknowledgePurchaseOrder({
  //   onSuccess: () => {
  //     toast({ title: "Purchase order acknowledged successfully" })
  //     refetch()
  //   }
  // })

  // Event handlers
  const handleCreatePO = () => {
    router.push('/procurement/purchase-orders/create')
  }

  const handleView = (po: PurchaseOrder) => {
    router.push(`/procurement/purchase-orders/${po.id}?mode=view`)
  }

  const handleEdit = (po: PurchaseOrder) => {
    router.push(`/procurement/purchase-orders/${po.id}?mode=edit`)
  }

  const handleSend = async (po: PurchaseOrder) => {
    // TODO: Re-enable when useSendPurchaseOrder hook is available
    // await sendPOMutation.mutateAsync(po.id)
    toast({ title: "Send functionality not yet available", variant: "default" })
  }

  const handleAcknowledge = async (po: PurchaseOrder) => {
    // TODO: Re-enable when useAcknowledgePurchaseOrder hook is available
    // const expectedDate = prompt("Expected delivery date (YYYY-MM-DD):")
    // const notes = prompt("Additional notes (optional):")
    //
    // await acknowledgePOMutation.mutateAsync({
    //   id: po.id,
    //   expectedDate: expectedDate || undefined,
    //   notes: notes || undefined
    // })
    toast({ title: "Acknowledge functionality not yet available", variant: "default" })
  }

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (!purchaseOrdersData?.purchaseOrders) return
    
    setSelectedItems(prev => 
      prev.length === purchaseOrdersData.purchaseOrders.length 
        ? [] 
        : purchaseOrdersData.purchaseOrders.map(po => po.id)
    )
  }

  // Loading state
  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className={cn("space-y-4", className)}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load purchase orders: {error?.message || "Unknown error"}
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    )
  }

  const purchaseOrders = purchaseOrdersData?.purchaseOrders || []

  // Group by status for tabs
  const groupedPOs = useMemo(() => {
    return {
      all: purchaseOrders,
      draft: purchaseOrders.filter(po => po.status === 'draft'),
      sent: purchaseOrders.filter(po => po.status === 'sent'),
      acknowledged: purchaseOrders.filter(po => po.status === 'acknowledged'),
      partial: purchaseOrders.filter(po => po.status === 'partial_received'),
      received: purchaseOrders.filter(po => po.status === 'fully_received')
    }
  }, [purchaseOrders])

  return (
    <ProcurementErrorBoundary>
      <div className={cn("px-6 py-6 space-y-6", className)}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Purchase Orders</h1>
            <p className="text-sm text-muted-foreground">
              Manage and track purchase orders with vendors
            </p>
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
                  New PO
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleCreatePO}>
                  <FileText className="h-4 w-4 mr-2" />
                  <span className="text-xs">Create Blank PO</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <span className="text-xs">Convert from PR</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search purchase orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as any)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="acknowledged">Acknowledged</SelectItem>
                <SelectItem value="in-transit">In Transit</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={vendorFilter} onValueChange={setVendorFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {/* Add vendor options dynamically */}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs by Status */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({groupedPOs.all.length})</TabsTrigger>
            <TabsTrigger value="draft">Draft ({groupedPOs.draft.length})</TabsTrigger>
            <TabsTrigger value="sent">Sent ({groupedPOs.sent.length})</TabsTrigger>
            <TabsTrigger value="acknowledged">Acknowledged ({groupedPOs.acknowledged.length})</TabsTrigger>
            <TabsTrigger value="partial">Partially Received ({groupedPOs.partial.length})</TabsTrigger>
            <TabsTrigger value="received">Fully Received ({groupedPOs.received.length})</TabsTrigger>
          </TabsList>

          {Object.entries(groupedPOs).map(([status, pos]) => (
            <TabsContent key={status} value={status}>
              <div className="grid gap-4">
                {pos.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-8">
                      <div className="text-center space-y-2">
                        <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">
                          No purchase orders found
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  pos.map((po) => (
                    <Card key={po.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(po.id)}
                                onChange={() => handleSelectItem(po.id)}
                                className="rounded border-gray-300"
                              />
                              <CardTitle className="text-sm font-medium">
                                PO-{po.id}
                              </CardTitle>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{po.vendorName || 'Unknown Vendor'}</span>
                              <span>•</span>
                              <span>{po.approvedBy || 'Unknown Buyer'}</span>
                              <span>•</span>
                              <span>Created: {new Date(po.orderDate).toLocaleDateString()}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={cn("text-xs flex items-center gap-1", STATUS_COLORS[po.status])}>
                              {STATUS_ICONS[po.status]}
                              {po.status.replace('-', ' ')}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            {po.expectedDeliveryDate && (
                              <div className="text-xs text-muted-foreground">
                                Expected: {new Date(po.expectedDeliveryDate).toLocaleDateString()}
                              </div>
                            )}
                            <div className="text-xs font-medium">
                              Total: {po.totalAmount?.amount} {po.totalAmount?.currency}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {po.totalItems} item{po.totalItems !== 1 ? 's' : ''}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(po)}
                            >
                              View
                            </Button>
                            
                            {po.status === 'draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(po)}
                              >
                                Edit
                              </Button>
                            )}
                            
                            {po.status === 'draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSend(po)}
                                disabled={false}
                              >
                                <Send className="h-3 w-3 mr-1" />
                                Send
                              </Button>
                            )}
                            
                            {po.status === 'sent' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAcknowledge(po)}
                                disabled={false}
                              >
                                <Check className="h-3 w-3 mr-1" />
                                Acknowledge
                              </Button>
                            )}
                            
                            <Button variant="ghost" size="sm">
                              <ChevronRight className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Pagination */}
        {purchaseOrdersData && purchaseOrdersData.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, purchaseOrdersData.total)} of {purchaseOrdersData.total} results
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-xs">
                Page {page} of {purchaseOrdersData.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === purchaseOrdersData.totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </ProcurementErrorBoundary>
  )
}