'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import StatusBadge from '@/components/ui/custom-status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  ChevronFirst, 
  ChevronLast, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  Search,
  SlidersHorizontal,
  X,
  FileText,
  Edit,
  Trash2,
  Filter,
  Download,
  List,
  Grid,
  MoreHorizontal
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Truck, Package, ShoppingCart } from 'lucide-react'
import { mockStoreRequisitions } from '@/lib/mock-data/store-requisitions'
import { GeneratedDocumentType, GeneratedDocumentReference } from '@/lib/types/store-requisition'

interface Requisition {
  date: string
  refNo: string
  requestTo: string
  toLocation: string
  storeName: string
  description: string
  requestedBy: string
  status: 'In Process' | 'Complete' | 'Reject' | 'Void' | 'Draft'
  workflowStage?: string
  totalAmount: number
  currency: string
  generatedDocuments?: GeneratedDocumentReference[]
}

interface FilterCondition {
  field: string
  operator: string
  value: string
}


const Pagination = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
  const [goToPage, setGoToPage] = useState('')

  const handleGoToPage = () => {
    const page = parseInt(goToPage, 10)
    if (page >= 1 && page <= totalPages) {
      onPageChange(page)
      setGoToPage('')
    }
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 w-full">
      <div className="text-sm text-muted-foreground text-center sm:text-left">
        Showing page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-1 sm:gap-2">
        {/* First page button - hidden on mobile */}
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          aria-label="First page"
          className="hidden sm:inline-flex"
        >
          <ChevronFirst className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {/* Go to page input - responsive sizing */}
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min={1}
            max={totalPages}
            value={goToPage}
            onChange={(e) => setGoToPage(e.target.value)}
            className="w-12 sm:w-16 text-center"
            placeholder={currentPage.toString()}
            aria-label="Go to page"
          />
          <Button 
            onClick={handleGoToPage} 
            variant="outline" 
            size="sm"
            className="px-2 sm:px-3"
          >
            <span className="hidden sm:inline">Go</span>
            <span className="sm:hidden">→</span>
          </Button>
        </div>
        
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        {/* Last page button - hidden on mobile */}
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          aria-label="Last page"
          className="hidden sm:inline-flex"
        >
          <ChevronLast className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

const FilterBuilder = ({ filters, setFilters }: { filters: FilterCondition[], setFilters: React.Dispatch<React.SetStateAction<FilterCondition[]>> }) => {
  const addFilter = () => {
    setFilters([...filters, { field: 'date', operator: 'equals', value: '' }])
  }

  const removeFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index))
  }

  const updateFilter = (index: number, key: keyof FilterCondition, value: string) => {
    const newFilters = [...filters]
    newFilters[index][key] = value
    setFilters(newFilters)
  }

  return (
    <div className="space-y-4">
      {filters.map((filter, index) => (
        <div key={index} className="flex items-center space-x-2">
          <Select value={filter.field} onValueChange={(value) => updateFilter(index, 'field', value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select field" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Date</SelectItem>
              <SelectItem value="refNo">Requisition</SelectItem>
              <SelectItem value="requestTo">Request From</SelectItem>
              <SelectItem value="toLocation">To Location</SelectItem>
              <SelectItem value="storeName">Store Name</SelectItem>
              <SelectItem value="description">Description</SelectItem>
              <SelectItem value="status">Status</SelectItem>
              <SelectItem value="workflowStage">Workflow Stage</SelectItem>
              <SelectItem value="processStatus">Process Status</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filter.operator} onValueChange={(value) => updateFilter(index, 'operator', value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select operator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="equals">Equals</SelectItem>
              <SelectItem value="contains">Contains</SelectItem>
              <SelectItem value="greater_than">Greater than</SelectItem>
              <SelectItem value="less_than">Less than</SelectItem>
            </SelectContent>
          </Select>
          <Input 
            type="text" 
            value={filter.value} 
            onChange={(e) => updateFilter(index, 'value', e.target.value)}
            placeholder="Enter value"
            className="flex-grow"
          />
          <Button variant="outline" size="icon" onClick={() => removeFilter(index)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button onClick={addFilter}>Add Filter</Button>
    </div>
  )
}

// Helper function to get workflow stage tooltip
const getWorkflowStageTooltip = (stage: string) => {
  if (stage.includes('Submission')) {
    return 'Request has been submitted and is being processed'
  } else if (stage.includes('HOD')) {
    return 'Awaiting Head of Department approval - First level review'
  } else if (stage.includes('Store Manager')) {
    return 'Awaiting Store Manager approval - Final approval for issue'
  } else if (stage.includes('Complete')) {
    return 'All approvals completed - Ready for processing'
  } else if (stage.includes('Rejected')) {
    return 'Request was rejected at this approval stage'
  } else {
    return 'Current workflow stage'
  }
}

// Helper function to get workflow stage styling
const getWorkflowStageStyle = (stage: string) => {
  if (stage.includes('Submission')) {
    return {
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      dotColor: 'bg-blue-500',
      textColor: 'text-blue-700 dark:text-blue-300'
    }
  } else if (stage.includes('HOD')) {
    return {
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      dotColor: 'bg-purple-500',
      textColor: 'text-purple-700 dark:text-purple-300'
    }
  } else if (stage.includes('Store Manager')) {
    return {
      bgColor: 'bg-amber-50 dark:bg-amber-900/20',
      dotColor: 'bg-amber-500',
      textColor: 'text-amber-700 dark:text-amber-300'
    }
  } else if (stage.includes('Complete')) {
    return {
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      dotColor: 'bg-green-500',
      textColor: 'text-green-700 dark:text-green-300'
    }
  } else if (stage.includes('Rejected')) {
    return {
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      dotColor: 'bg-red-500',
      textColor: 'text-red-700 dark:text-red-300'
    }
  } else {
    return {
      bgColor: 'bg-gray-50 dark:bg-gray-800',
      dotColor: 'bg-gray-500',
      textColor: 'text-gray-700 dark:text-gray-300'
    }
  }
}

// Helper function to get document type icon
const getDocumentTypeIcon = (type: GeneratedDocumentType) => {
  switch (type) {
    case GeneratedDocumentType.STOCK_TRANSFER:
      return <Truck className="h-3 w-3" />
    case GeneratedDocumentType.STOCK_ISSUE:
      return <Package className="h-3 w-3" />
    case GeneratedDocumentType.PURCHASE_REQUEST:
      return <ShoppingCart className="h-3 w-3" />
    default:
      return <FileText className="h-3 w-3" />
  }
}

// Helper function to get document type badge color
const getDocumentTypeBadgeClass = (type: GeneratedDocumentType): string => {
  switch (type) {
    case GeneratedDocumentType.STOCK_TRANSFER:
      return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
    case GeneratedDocumentType.STOCK_ISSUE:
      return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
    case GeneratedDocumentType.PURCHASE_REQUEST:
      return 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

// Helper function to get document link path
const getDocumentLinkPath = (doc: GeneratedDocumentReference): string => {
  switch (doc.documentType) {
    case GeneratedDocumentType.STOCK_TRANSFER:
      return `/store-operations/stock-transfers/${doc.documentId}`
    case GeneratedDocumentType.STOCK_ISSUE:
      return `/store-operations/stock-issues/${doc.documentId}`
    case GeneratedDocumentType.PURCHASE_REQUEST:
      return `/procurement/purchase-requests/${doc.documentId}`
    default:
      return '#'
  }
}

// Helper function to render generated documents badges
const renderGeneratedDocuments = (documents: GeneratedDocumentReference[] | undefined) => {
  if (!documents || documents.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>
  }

  return (
    <div className="flex flex-wrap gap-1">
      {documents.map((doc) => (
        <Link key={doc.id} href={getDocumentLinkPath(doc)}>
          <Badge
            variant="outline"
            className={`gap-1 cursor-pointer text-xs ${getDocumentTypeBadgeClass(doc.documentType)}`}
          >
            {getDocumentTypeIcon(doc.documentType)}
            {doc.refNo}
          </Badge>
        </Link>
      ))}
    </div>
  )
}

export function StoreRequisitionListComponent() {
  const router = useRouter()
  const [statusFilter, setStatusFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('date')
  const [filters, setFilters] = useState<FilterCondition[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')

  // Convert mock data to display format with generated documents
  // Combines local sample data with mock store requisitions that have generated documents
  const statusMap: Record<string, 'In Process' | 'Complete' | 'Reject' | 'Void' | 'Draft'> = {
    'draft': 'Draft',
    'submitted': 'In Process',
    'approved': 'In Process',
    'processing': 'In Process',
    'processed': 'In Process',
    'partial_complete': 'In Process',
    'completed': 'Complete',
    'rejected': 'Reject',
    'cancelled': 'Void'
  }

  // Map mock data to requisitions format
  const mockRequisitions: Requisition[] = mockStoreRequisitions.map(sr => ({
    date: sr.requestDate.toISOString().split('T')[0],
    refNo: sr.refNo,
    requestTo: sr.sourceLocationCode,
    toLocation: sr.destinationLocationName,
    storeName: sr.sourceLocationName,
    description: sr.description || `${sr.workflowType} requisition`,
    requestedBy: sr.requestedBy,
    status: statusMap[sr.status] || 'Draft',
    workflowStage: sr.status === 'completed' ? 'Complete' : sr.status === 'submitted' ? 'Submission' : undefined,
    totalAmount: sr.estimatedValue.amount,
    currency: sr.estimatedValue.currency,
    generatedDocuments: sr.generatedDocuments
  }))

  // Sample data (without generated documents) + mock data (with generated documents)
  const localRequisitions: Requisition[] = [
    { date: '2024-01-15', refNo: 'SR-2410-008', requestTo: 'M01', toLocation: 'Central Kitchen', storeName: 'Main Store', description: 'Monthly supplies request', requestedBy: 'Chef Maria Rodriguez', status: 'In Process', workflowStage: 'Store Manager Approval', totalAmount: 566.25, currency: 'BHT' },
    { date: '2024-01-14', refNo: 'SR-2410-009', requestTo: 'B01', toLocation: 'Front Bar', storeName: 'Branch Store 1', description: 'Emergency stock replenishment', requestedBy: 'Bar Manager Tom', status: 'Draft', totalAmount: 1038.44, currency: 'BHT' },
    { date: '2024-01-10', refNo: 'SR-2410-010', requestTo: 'B03', toLocation: 'Maintenance Room', storeName: 'Branch Store 3', description: 'Emergency equipment request', requestedBy: 'Mike Johnson', status: 'Reject', workflowStage: 'Rejected at HOD', totalAmount: 566.25, currency: 'BHT' },
  ]

  // Combine and sort by date (newest first)
  const requisitions: Requisition[] = [...mockRequisitions, ...localRequisitions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const itemsPerPage = 10
  const totalPages = Math.ceil(requisitions.length / itemsPerPage)

  const paginatedRequisitions = requisitions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSearch = () => {
    setIsLoading(true)
    // Simulating API call
    setTimeout(() => {
      setIsLoading(false)
      // If there was an error, you would set it here
      // setError('An error occurred while fetching data')
    }, 1000)
  }

  const handleSort = (column: string) => {
    setSortBy(column)
    // Here you would implement the sorting logic
    console.log(`Sorting by ${column}`)
  }

  const applyFilters = () => {
    // Here you would implement the filtering logic
    console.log('Applying filters:', filters)
  }

  const handleViewClick = (refNo: string) => {
    router.push(`/store-operations/store-requisitions/${refNo}`)
  }


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  const renderCardView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {paginatedRequisitions.map((req) => (
        <Card key={req.refNo} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="p-3 sm:p-4 pb-3 bg-muted/30 border-b">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base sm:text-lg font-semibold mb-2 truncate">{req.refNo}</CardTitle>
                <div className="flex items-center gap-2 mb-2">
                  <StatusBadge status={req.status} />
                  {req.workflowStage && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full cursor-help ${getWorkflowStageStyle(req.workflowStage).bgColor}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${getWorkflowStageStyle(req.workflowStage).dotColor}`} />
                            <span className={`text-xs ${getWorkflowStageStyle(req.workflowStage).textColor}`}>{req.workflowStage}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{getWorkflowStageTooltip(req.workflowStage)}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="flex-shrink-0 ml-2"
                    aria-label={`Actions for requisition ${req.refNo}`}
                  >
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewClick(req.refNo)}>
                    <FileText className="w-4 h-4 mr-2" />
                    View
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-4 pt-0">
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground line-clamp-2">
                {req.description}
              </p>
              
              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground text-xs mb-1">Request From</div>
                  <div className="truncate">{req.requestTo}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground text-xs mb-1">To Location</div>
                  <div className="truncate">{req.toLocation}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground text-xs mb-1">Store</div>
                  <div className="truncate">{req.storeName}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground text-xs mb-1">Requested By</div>
                  <div className="truncate">{req.requestedBy}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 sm:gap-4 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground text-xs mb-1">Date</div>
                  <div>{formatDate(req.date)}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground text-xs mb-1">Amount</div>
                  <div className="font-semibold text-green-600 truncate">
                    {new Intl.NumberFormat('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    }).format(req.totalAmount)} {req.currency}
                  </div>
                </div>
              </div>

              {/* Generated Documents */}
              {req.generatedDocuments && req.generatedDocuments.length > 0 && (
                <div>
                  <div className="font-medium text-muted-foreground text-xs mb-2">Generated Documents</div>
                  {renderGeneratedDocuments(req.generatedDocuments)}
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="p-3 sm:p-4 pt-3 bg-muted/20 border-t">
            <div className="text-xs text-muted-foreground truncate">
              Last updated: {formatDate(req.date)}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )

  if (error) {
    return <div className="text-red-500">Error: {error}</div>
  }

  return (
    <div className="container mx-auto px-6 py-6 max-w-full">
      {/* Store Requisitions Card with Header */}
      <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="p-4 pb-3 bg-muted/30 border-b space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-3xl font-bold">Store Requisition List</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">Manage and track store requisitions across all locations</p>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="border-muted-foreground/20 hover:bg-muted/50">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary/20"
                onClick={() => router.push('/store-operations/store-requisitions/new')}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Request
              </Button>
            </div>
          </div>

          {/* Search, Filters and Controls Row */}
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Left Side - Search and Status Filter */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
              {/* Search Bar */}
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search requisitions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full min-w-[350px]"
                  aria-label="Search store requisitions"
                />
              </div>
              
              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="in-process">In Process</SelectItem>
                  <SelectItem value="complete">Complete</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                  <SelectItem value="void">Void</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Right Side - Filter Actions and View Toggle */}
            <div className="flex gap-2 items-center">
              <Button variant="outline" size="sm" className="hidden sm:inline-flex">
                Saved Filters
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Add Filters</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-auto max-w-[95vw]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <SlidersHorizontal className="h-4 w-4" />
                      Filter Requisitions
                    </DialogTitle>
                  </DialogHeader>
                  <div className="py-4">
                    <FilterBuilder filters={filters} setFilters={setFilters} />
                  </div>
                  <Button onClick={applyFilters}>Apply Filters</Button>
                </DialogContent>
              </Dialog>
              
              {/* View Toggle */}
              <div className="flex border rounded-lg" role="group" aria-label="View mode selection">
              <Button 
                variant={viewMode === 'table' ? 'default' : 'ghost'} 
                size="sm" 
                className="border-r"
                onClick={() => setViewMode('table')}
                aria-label="Table view"
                aria-pressed={viewMode === 'table'}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button 
                variant={viewMode === 'card' ? 'default' : 'ghost'} 
                size="sm"
                onClick={() => setViewMode('card')}
                aria-label="Card view"
                aria-pressed={viewMode === 'card'}
              >
                <Grid className="w-4 h-4" />
              </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2 mx-auto"></div>
                <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
              </div>
            </div>
          ) : paginatedRequisitions.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No requisitions found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filter criteria
              </p>
              <Button variant="outline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>
                Clear Filters
              </Button>
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <Table className="min-w-[800px]">
                <TableHeader>
                  <TableRow>
                    <TableHead scope="col" className="min-w-[120px]">SR #</TableHead>
                    <TableHead scope="col" className="min-w-[100px]">Date</TableHead>
                    <TableHead scope="col" className="min-w-[80px]">Request From</TableHead>
                    <TableHead scope="col" className="min-w-[120px]">To Location</TableHead>
                    <TableHead scope="col" className="min-w-[120px]">Store Name</TableHead>
                    <TableHead scope="col" className="min-w-[150px]">Requested By</TableHead>
                    <TableHead scope="col" className="min-w-[200px]">Description</TableHead>
                    <TableHead scope="col" className="min-w-[100px] text-right">Amount</TableHead>
                    <TableHead scope="col" className="min-w-[60px]">Currency</TableHead>
                    <TableHead scope="col" className="min-w-[100px]">Status</TableHead>
                    <TableHead scope="col" className="min-w-[120px]">Workflow Stage</TableHead>
                    <TableHead scope="col" className="min-w-[150px]">Generated Docs</TableHead>
                    <TableHead scope="col" className="w-[50px]">
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequisitions.map((req) => (
                    <TableRow key={req.refNo} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <button 
                          onClick={() => handleViewClick(req.refNo)}
                          className="text-primary hover:text-primary/80 hover:underline font-medium cursor-pointer"
                        >
                          {req.refNo}
                        </button>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{formatDate(req.date)}</TableCell>
                      <TableCell>{req.requestTo}</TableCell>
                      <TableCell className="max-w-[120px] truncate">{req.toLocation}</TableCell>
                      <TableCell className="max-w-[150px] truncate">{req.storeName}</TableCell>
                      <TableCell className="max-w-[150px] truncate" title={req.requestedBy}>{req.requestedBy}</TableCell>
                      <TableCell className="max-w-[200px] truncate" title={req.description}>{req.description}</TableCell>
                      <TableCell className="text-right font-medium">
                        {new Intl.NumberFormat('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        }).format(req.totalAmount)}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{req.currency}</TableCell>
                      <TableCell>
                        <StatusBadge status={req.status} />
                      </TableCell>
                      <TableCell>
                        {req.workflowStage ? (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center gap-2 cursor-help">
                                  <div className={`w-2 h-2 rounded-full ${getWorkflowStageStyle(req.workflowStage).dotColor}`} />
                                  <span className="text-sm">{req.workflowStage}</span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{getWorkflowStageTooltip(req.workflowStage)}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {renderGeneratedDocuments(req.generatedDocuments)}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              aria-label={`Actions for requisition ${req.refNo}`}
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewClick(req.refNo)}>
                              <FileText className="w-4 h-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            renderCardView()
          )}
        </CardContent>
        <CardFooter className="p-4 pt-3 bg-muted/20 border-t">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </CardFooter>
      </Card>
    </div>
  )
}