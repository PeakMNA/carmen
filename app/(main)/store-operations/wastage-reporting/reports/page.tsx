'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Trash2,
  Search,
  Filter,
  Plus,
  Download,
  MoreHorizontal,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  ArrowLeft,
  FileText,
  Printer,
  AlertTriangle,
} from 'lucide-react'

// Mock data for all wastage reports
const allWastageReports = [
  {
    id: 'WR-2024-0089',
    date: '2024-01-15',
    location: 'Main Kitchen',
    itemCode: 'BEV-001',
    itemName: 'Thai Milk Tea Powder',
    quantity: 5,
    unit: 'Box',
    unitCost: 45.99,
    totalLoss: 229.95,
    reason: 'Expiration',
    reasonCategory: 'expiration',
    reportedBy: 'John Smith',
    approvedBy: null,
    status: 'pending',
    notes: 'Expired on 2024-01-10',
    attachments: 2,
  },
  {
    id: 'WR-2024-0088',
    date: '2024-01-15',
    location: 'Pool Bar',
    itemCode: 'LIQ-003',
    itemName: 'Orange Juice Fresh',
    quantity: 12,
    unit: 'Liter',
    unitCost: 8.50,
    totalLoss: 102.00,
    reason: 'Spoilage',
    reasonCategory: 'spoilage',
    reportedBy: 'Maria Garcia',
    approvedBy: 'David Lee',
    status: 'approved',
    notes: 'Found spoiled during morning inspection',
    attachments: 1,
  },
  {
    id: 'WR-2024-0087',
    date: '2024-01-14',
    location: 'Rooftop Restaurant',
    itemCode: 'MTT-001',
    itemName: 'Wagyu Beef Premium',
    quantity: 3,
    unit: 'Kg',
    unitCost: 185.00,
    totalLoss: 555.00,
    reason: 'Quality Issues',
    reasonCategory: 'quality',
    reportedBy: 'James Wilson',
    approvedBy: null,
    status: 'under_review',
    notes: 'Discoloration noticed, vendor issue suspected',
    attachments: 3,
  },
  {
    id: 'WR-2024-0086',
    date: '2024-01-14',
    location: 'Lobby Café',
    itemCode: 'BAK-002',
    itemName: 'Croissants Butter',
    quantity: 24,
    unit: 'Piece',
    unitCost: 3.50,
    totalLoss: 84.00,
    reason: 'Damage',
    reasonCategory: 'damage',
    reportedBy: 'Emma Brown',
    approvedBy: 'Sarah Chen',
    status: 'approved',
    notes: 'Damaged during delivery',
    attachments: 2,
  },
  {
    id: 'WR-2024-0085',
    date: '2024-01-13',
    location: 'Main Kitchen',
    itemCode: 'VEG-005',
    itemName: 'Mixed Salad Greens',
    quantity: 8,
    unit: 'Kg',
    unitCost: 12.00,
    totalLoss: 96.00,
    reason: 'Spoilage',
    reasonCategory: 'spoilage',
    reportedBy: 'John Smith',
    approvedBy: 'David Lee',
    status: 'approved',
    notes: 'Refrigeration issue overnight',
    attachments: 1,
  },
  {
    id: 'WR-2024-0084',
    date: '2024-01-12',
    location: 'Banquet Hall',
    itemCode: 'WNE-002',
    itemName: 'Champagne Premium',
    quantity: 2,
    unit: 'Bottle',
    unitCost: 125.00,
    totalLoss: 250.00,
    reason: 'Damage',
    reasonCategory: 'damage',
    reportedBy: 'Robert Johnson',
    approvedBy: null,
    status: 'rejected',
    notes: 'Broken during event setup',
    attachments: 2,
    rejectionReason: 'Insufficient evidence of accidental damage',
  },
  {
    id: 'WR-2024-0083',
    date: '2024-01-12',
    location: 'Pool Bar',
    itemCode: 'FRT-003',
    itemName: 'Lime Fresh',
    quantity: 5,
    unit: 'Kg',
    unitCost: 8.00,
    totalLoss: 40.00,
    reason: 'Spoilage',
    reasonCategory: 'spoilage',
    reportedBy: 'Maria Garcia',
    approvedBy: 'Sarah Chen',
    status: 'approved',
    notes: 'Over-ripened',
    attachments: 0,
  },
  {
    id: 'WR-2024-0082',
    date: '2024-01-11',
    location: 'Main Kitchen',
    itemCode: 'DRY-004',
    itemName: 'Flour All Purpose',
    quantity: 10,
    unit: 'Kg',
    unitCost: 4.50,
    totalLoss: 45.00,
    reason: 'Quality Issues',
    reasonCategory: 'quality',
    reportedBy: 'John Smith',
    approvedBy: 'David Lee',
    status: 'approved',
    notes: 'Pest contamination detected',
    attachments: 3,
  },
  {
    id: 'WR-2024-0081',
    date: '2024-01-10',
    location: 'Rooftop Restaurant',
    itemCode: 'SEA-002',
    itemName: 'Fresh Salmon Fillet',
    quantity: 4,
    unit: 'Kg',
    unitCost: 45.00,
    totalLoss: 180.00,
    reason: 'Expiration',
    reasonCategory: 'expiration',
    reportedBy: 'James Wilson',
    approvedBy: null,
    status: 'pending',
    notes: 'Use by date passed',
    attachments: 1,
  },
  {
    id: 'WR-2024-0080',
    date: '2024-01-10',
    location: 'Lobby Café',
    itemCode: 'DRY-006',
    itemName: 'Sugar White',
    quantity: 15,
    unit: 'Kg',
    unitCost: 2.50,
    totalLoss: 37.50,
    reason: 'Damage',
    reasonCategory: 'damage',
    reportedBy: 'Emma Brown',
    approvedBy: 'Sarah Chen',
    status: 'approved',
    notes: 'Water damage from leak',
    attachments: 2,
  },
]

// Status summary counts
const statusCounts = {
  all: allWastageReports.length,
  pending: allWastageReports.filter(r => r.status === 'pending').length,
  under_review: allWastageReports.filter(r => r.status === 'under_review').length,
  approved: allWastageReports.filter(r => r.status === 'approved').length,
  rejected: allWastageReports.filter(r => r.status === 'rejected').length,
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Review</Badge>
    case 'under_review':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Under Review</Badge>
    case 'approved':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getReasonBadge(reason: string) {
  switch (reason) {
    case 'Expiration':
      return <Badge variant="destructive">{reason}</Badge>
    case 'Damage':
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">{reason}</Badge>
    case 'Quality Issues':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{reason}</Badge>
    case 'Spoilage':
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{reason}</Badge>
    default:
      return <Badge variant="outline">{reason}</Badge>
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'pending':
      return <Clock className="h-4 w-4 text-yellow-600" />
    case 'under_review':
      return <AlertTriangle className="h-4 w-4 text-blue-600" />
    case 'approved':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-600" />
    default:
      return null
  }
}

export default function WastageReportsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [reasonFilter, setReasonFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('30')
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())

  // Filter reports
  const filteredReports = useMemo(() => {
    return allWastageReports.filter(report => {
      const matchesSearch = report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.reportedBy.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter
      const matchesLocation = locationFilter === 'all' || report.location === locationFilter
      const matchesReason = reasonFilter === 'all' || report.reasonCategory === reasonFilter
      return matchesSearch && matchesStatus && matchesLocation && matchesReason
    })
  }, [searchQuery, statusFilter, locationFilter, reasonFilter])

  // Toggle selection
  const toggleSelection = (id: string) => {
    setSelectedItems(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Toggle all selection
  const toggleAllSelection = () => {
    if (selectedItems.size === filteredReports.length) {
      setSelectedItems(new Set())
    } else {
      setSelectedItems(new Set(filteredReports.map(r => r.id)))
    }
  }

  // Calculate totals for selected
  const selectedTotal = useMemo(() => {
    return filteredReports
      .filter(r => selectedItems.has(r.id))
      .reduce((sum, r) => sum + r.totalLoss, 0)
  }, [filteredReports, selectedItems])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/store-operations/wastage-reporting">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Trash2 className="h-7 w-7 text-red-600" />
              All Wastage Reports
            </h1>
            <p className="text-muted-foreground">
              View and manage all wastage records across locations
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Link href="/store-operations/wastage-reporting/new">
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              New Report
            </Button>
          </Link>
        </div>
      </div>

      {/* Status Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card
          className={`cursor-pointer transition-colors ${statusFilter === 'all' ? 'border-red-500 bg-red-50' : 'hover:border-gray-400'}`}
          onClick={() => setStatusFilter('all')}
        >
          <CardContent className="pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">All Reports</p>
                <p className="text-2xl font-bold">{statusCounts.all}</p>
              </div>
              <Trash2 className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${statusFilter === 'pending' ? 'border-yellow-500 bg-yellow-50' : 'hover:border-gray-400'}`}
          onClick={() => setStatusFilter('pending')}
        >
          <CardContent className="pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{statusCounts.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${statusFilter === 'under_review' ? 'border-blue-500 bg-blue-50' : 'hover:border-gray-400'}`}
          onClick={() => setStatusFilter('under_review')}
        >
          <CardContent className="pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Under Review</p>
                <p className="text-2xl font-bold text-blue-600">{statusCounts.under_review}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${statusFilter === 'approved' ? 'border-green-500 bg-green-50' : 'hover:border-gray-400'}`}
          onClick={() => setStatusFilter('approved')}
        >
          <CardContent className="pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Approved</p>
                <p className="text-2xl font-bold text-green-600">{statusCounts.approved}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card
          className={`cursor-pointer transition-colors ${statusFilter === 'rejected' ? 'border-red-500 bg-red-50' : 'hover:border-gray-400'}`}
          onClick={() => setStatusFilter('rejected')}
        >
          <CardContent className="pt-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{statusCounts.rejected}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by ID, item, or reporter..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[160px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="Main Kitchen">Main Kitchen</SelectItem>
                  <SelectItem value="Pool Bar">Pool Bar</SelectItem>
                  <SelectItem value="Rooftop Restaurant">Rooftop Restaurant</SelectItem>
                  <SelectItem value="Lobby Café">Lobby Café</SelectItem>
                  <SelectItem value="Banquet Hall">Banquet Hall</SelectItem>
                </SelectContent>
              </Select>
              <Select value={reasonFilter} onValueChange={setReasonFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reasons</SelectItem>
                  <SelectItem value="expiration">Expiration</SelectItem>
                  <SelectItem value="damage">Damage</SelectItem>
                  <SelectItem value="quality">Quality Issues</SelectItem>
                  <SelectItem value="spoilage">Spoilage</SelectItem>
                </SelectContent>
              </Select>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[140px]">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 days</SelectItem>
                  <SelectItem value="30">Last 30 days</SelectItem>
                  <SelectItem value="90">Last 90 days</SelectItem>
                  <SelectItem value="365">Last year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Actions */}
      {selectedItems.size > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">
                  {selectedItems.size} report{selectedItems.size > 1 ? 's' : ''} selected
                </span>
                <span className="text-sm text-muted-foreground">
                  Total loss: <span className="font-medium text-red-600">${selectedTotal.toFixed(2)}</span>
                </span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                  Approve Selected
                </Button>
                <Button variant="outline" size="sm">
                  <XCircle className="mr-2 h-4 w-4 text-red-600" />
                  Reject Selected
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="mr-2 h-4 w-4" />
                  Print
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Wastage Reports</CardTitle>
            <p className="text-sm text-muted-foreground">
              Showing {filteredReports.length} of {allWastageReports.length} reports
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedItems.size === filteredReports.length && filteredReports.length > 0}
                    onCheckedChange={toggleAllSelection}
                  />
                </TableHead>
                <TableHead>Report ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Loss Value</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Reported By</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredReports.map((report) => (
                <TableRow key={report.id} className={selectedItems.has(report.id) ? 'bg-red-50' : ''}>
                  <TableCell>
                    <Checkbox
                      checked={selectedItems.has(report.id)}
                      onCheckedChange={() => toggleSelection(report.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/store-operations/wastage-reporting/reports/${report.id}`}
                      className="font-medium text-red-600 hover:underline"
                    >
                      {report.id}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{report.date}</TableCell>
                  <TableCell>{report.location}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{report.itemName}</p>
                      <p className="text-xs text-muted-foreground">{report.itemCode}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {report.quantity} {report.unit}
                  </TableCell>
                  <TableCell className="text-right font-medium text-red-600">
                    ${report.totalLoss.toFixed(2)}
                  </TableCell>
                  <TableCell>{getReasonBadge(report.reason)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{report.reportedBy}</p>
                      {report.approvedBy && (
                        <p className="text-xs text-muted-foreground">
                          Approved: {report.approvedBy}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(report.status)}
                      {getStatusBadge(report.status)}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/store-operations/wastage-reporting/reports/${report.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        {report.status === 'pending' && (
                          <>
                            <DropdownMenuItem>
                              <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                              Approve
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <XCircle className="mr-2 h-4 w-4 text-red-600" />
                              Reject
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          Download Report
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Printer className="mr-2 h-4 w-4" />
                          Print
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredReports.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Trash2 className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No wastage reports found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
            <Link href="/store-operations/wastage-reporting/new">
              <Button className="mt-4 bg-red-600 hover:bg-red-700">
                <Plus className="mr-2 h-4 w-4" />
                Create New Report
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
