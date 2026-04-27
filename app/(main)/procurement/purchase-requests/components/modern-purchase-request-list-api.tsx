"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import {
  usePurchaseRequests,
  useCreatePurchaseRequest,
  useSubmitPurchaseRequest,
  useApprovePurchaseRequest,
  useRejectPurchaseRequest,
  useBulkApprovePurchaseRequests
} from "@/lib/hooks/api"
import { PurchaseRequestFilters } from "@/lib/api/procurement"
import { PurchaseRequest, PRStatus } from "@/lib/types"
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
  Filter,
  Check,
  X,
  Clock,
  AlertTriangle,
  FileText,
  ChevronRight
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

interface ModernPurchaseRequestListProps {
  className?: string
}

const PRIORITY_COLORS: Record<string, string> = {
  low: "bg-blue-100 text-blue-800",
  medium: "bg-yellow-100 text-yellow-800", 
  high: "bg-orange-100 text-orange-800",
  urgent: "bg-red-100 text-red-800"
}

const STATUS_COLORS: Record<PRStatus, string> = {
  [PRStatus.Draft]: "bg-gray-100 text-gray-800",
  [PRStatus.InProgress]: "bg-blue-100 text-blue-800",
  [PRStatus.Approved]: "bg-green-100 text-green-800",
  [PRStatus.Void]: "bg-gray-100 text-gray-400",
  [PRStatus.Completed]: "bg-emerald-100 text-emerald-800",
  [PRStatus.Cancelled]: "bg-red-100 text-red-800"
}

export function ModernPurchaseRequestListAPI({ className }: ModernPurchaseRequestListProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  // State for filters and pagination
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<PRStatus | "all">("all")
  const [priorityFilter, setPriorityFilter] = useState<string>("all")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [page, setPage] = useState(1)
  const [limit] = useState(20)

  // Build filters object
  const filters = useMemo((): PurchaseRequestFilters => {
    const baseFilters: PurchaseRequestFilters = {}
    
    if (searchQuery) {
      baseFilters.search = searchQuery
    }
    
    if (statusFilter && statusFilter !== "all") {
      baseFilters.status = [statusFilter]
    }
    
    if (priorityFilter && priorityFilter !== "all") {
      baseFilters.priority = [priorityFilter]
    }
    
    return baseFilters
  }, [searchQuery, statusFilter, priorityFilter])

  // API hooks
  const { 
    data: purchaseRequestsData, 
    isLoading, 
    isError, 
    error,
    refetch 
  } = usePurchaseRequests(filters, { page, limit })

  const createPRMutation = useCreatePurchaseRequest()

  const submitPRMutation = useSubmitPurchaseRequest()

  const approvePRMutation = useApprovePurchaseRequest()

  const rejectPRMutation = useRejectPurchaseRequest()

  const bulkApproveMutation = useBulkApprovePurchaseRequests()

  // Event handlers
  const handleCreatePR = () => {
    router.push('/procurement/purchase-requests/create')
  }

  const handleView = (pr: PurchaseRequest) => {
    router.push(`/procurement/purchase-requests/${pr.id}?mode=view`)
  }

  const handleEdit = (pr: PurchaseRequest) => {
    router.push(`/procurement/purchase-requests/${pr.id}?mode=edit`)
  }

  const handleSubmit = async (pr: PurchaseRequest) => {
    try {
      await submitPRMutation.mutateAsync(pr.id)
      toast({ title: "Purchase request submitted successfully" })
      refetch()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to submit purchase request",
        description: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }

  const handleApprove = async (pr: PurchaseRequest) => {
    try {
      await approvePRMutation.mutateAsync({ id: pr.id })
      toast({ title: "Purchase request approved successfully" })
      refetch()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to approve purchase request",
        description: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }

  const handleReject = async (pr: PurchaseRequest) => {
    const reason = prompt("Please provide a reason for rejection:")
    if (reason) {
      try {
        await rejectPRMutation.mutateAsync({ id: pr.id, reason })
        toast({ title: "Purchase request rejected successfully" })
        refetch()
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Failed to reject purchase request",
          description: error instanceof Error ? error.message : "Unknown error"
        })
      }
    }
  }

  const handleBulkApprove = async () => {
    if (selectedItems.length === 0) return
    try {
      const result = await bulkApproveMutation.mutateAsync({ requestIds: selectedItems })
      toast({
        title: `Successfully approved ${result.approved || selectedItems.length} purchase requests`
      })
      setSelectedItems([])
      refetch()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Failed to approve purchase requests",
        description: error instanceof Error ? error.message : "Unknown error"
      })
    }
  }

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (!purchaseRequestsData?.purchaseRequests) return
    
    setSelectedItems(prev => 
      prev.length === purchaseRequestsData.purchaseRequests.length 
        ? [] 
        : purchaseRequestsData.purchaseRequests.map(pr => pr.id)
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
            Failed to load purchase requests: {error?.message || "Unknown error"}
          </AlertDescription>
        </Alert>
        <Button onClick={() => refetch()}>
          Try Again
        </Button>
      </div>
    )
  }

  const purchaseRequests = purchaseRequestsData?.purchaseRequests || []

  // Group by status for tabs
  const groupedPRs = useMemo(() => {
    return {
      all: purchaseRequests,
      draft: purchaseRequests.filter(pr => pr.status === PRStatus.Draft),
      submitted: purchaseRequests.filter(pr => pr.status === PRStatus.InProgress),
      approved: purchaseRequests.filter(pr => pr.status === PRStatus.Approved),
      cancelled: purchaseRequests.filter(pr => pr.status === PRStatus.Cancelled)
    }
  }, [purchaseRequests])

  return (
    <ProcurementErrorBoundary>
      <div className={cn("px-6 py-6 space-y-6", className)}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">Purchase Requests</h1>
            <p className="text-sm text-muted-foreground">
              Manage and track purchase requests across your organization
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {selectedItems.length > 0 && (
              <Button
                onClick={handleBulkApprove}
                disabled={bulkApproveMutation.isPending}
                className="h-8 px-3 text-xs"
              >
                <Check className="h-3 w-3 mr-1" />
                Approve Selected ({selectedItems.length})
              </Button>
            )}
            
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
                <DropdownMenuItem onClick={handleCreatePR}>
                  <FileText className="h-4 w-4 mr-2" />
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

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search purchase requests..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as PRStatus | "all")}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="fulfilled">Fulfilled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs by Status */}
        <Tabs defaultValue="all" className="space-y-4">
          <TabsList>
            <TabsTrigger value="all">All ({groupedPRs.all.length})</TabsTrigger>
            <TabsTrigger value="draft">Draft ({groupedPRs.draft.length})</TabsTrigger>
            <TabsTrigger value="submitted">Submitted ({groupedPRs.submitted.length})</TabsTrigger>
            <TabsTrigger value="approved">Approved ({groupedPRs.approved.length})</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled ({groupedPRs.cancelled.length})</TabsTrigger>
          </TabsList>

          {Object.entries(groupedPRs).map(([status, prs]) => (
            <TabsContent key={status} value={status}>
              <div className="grid gap-4">
                {prs.length === 0 ? (
                  <Card>
                    <CardContent className="flex items-center justify-center py-8">
                      <div className="text-center space-y-2">
                        <FileText className="h-8 w-8 text-muted-foreground mx-auto" />
                        <p className="text-sm text-muted-foreground">
                          No purchase requests found
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  prs.map((pr) => (
                    <Card key={pr.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={selectedItems.includes(pr.id)}
                                onChange={() => handleSelectItem(pr.id)}
                                className="rounded border-gray-300"
                              />
                              <CardTitle className="text-sm font-medium">
                                {pr.notes || pr.requestNumber}
                              </CardTitle>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>PR-{pr.requestNumber}</span>
                              <span>•</span>
                              <span>{pr.requestedBy || 'Unknown'}</span>
                              <span>•</span>
                              <span>{pr.departmentId || 'Unknown'}</span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge className={cn("text-xs", PRIORITY_COLORS[pr.priority])}>
                              {pr.priority}
                            </Badge>
                            <Badge className={cn("text-xs", STATUS_COLORS[pr.status])}>
                              {pr.status}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground">
                              Required: {new Date(pr.requiredDate).toLocaleDateString()}
                            </div>
                            <div className="text-xs font-medium">
                              Total: {pr.estimatedTotal?.amount} {pr.estimatedTotal?.currency}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {pr.totalItems} item{pr.totalItems !== 1 ? 's' : ''}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleView(pr)}
                            >
                              View
                            </Button>

                            {pr.status === PRStatus.Draft && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(pr)}
                              >
                                Edit
                              </Button>
                            )}

                            {pr.status === PRStatus.Draft && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSubmit(pr)}
                                disabled={submitPRMutation.isPending}
                              >
                                Submit
                              </Button>
                            )}

                            {pr.status === PRStatus.InProgress && (
                              <>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprove(pr)}
                                  disabled={approvePRMutation.isPending}
                                >
                                  <Check className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleReject(pr)}
                                  disabled={rejectPRMutation.isPending}
                                >
                                  <X className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </>
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
        {purchaseRequestsData && purchaseRequestsData.totalPages > 1 && (
          <div className="flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              Showing {((page - 1) * limit) + 1} to {Math.min(page * limit, purchaseRequestsData.total)} of {purchaseRequestsData.total} results
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
                Page {page} of {purchaseRequestsData.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === purchaseRequestsData.totalPages}
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