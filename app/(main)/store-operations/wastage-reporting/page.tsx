'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import {
  Trash2,
  AlertTriangle,
  Search,
  Filter,
  Plus,
  Download,
  TrendingDown,
  TrendingUp,
  Clock,
  FileText,
  BarChart3,
  ChevronRight,
  Eye,
  DollarSign,
  Package,
  Calendar,
  ClipboardList,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'

// Chart data
const monthlyWastageData = [
  { month: 'Aug', value: 4200, items: 52 },
  { month: 'Sep', value: 3800, items: 45 },
  { month: 'Oct', value: 4500, items: 58 },
  { month: 'Nov', value: 3200, items: 38 },
  { month: 'Dec', value: 3900, items: 48 },
  { month: 'Jan', value: 3458, items: 45 },
]

const wastageByReasonData = [
  { name: 'Expiration', value: 45, color: '#ef4444' },
  { name: 'Damage', value: 25, color: '#f97316' },
  { name: 'Quality Issues', value: 15, color: '#eab308' },
  { name: 'Spoilage', value: 10, color: '#84cc16' },
  { name: 'Other', value: 5, color: '#6b7280' },
]

const wastageByLocationData = [
  { location: 'Main Kitchen', value: 1250, percentage: 36 },
  { location: 'Pool Bar', value: 680, percentage: 20 },
  { location: 'Rooftop Restaurant', value: 520, percentage: 15 },
  { location: 'Lobby Café', value: 450, percentage: 13 },
  { location: 'Banquet Hall', value: 558, percentage: 16 },
]

// Recent wastage records
const recentWastageRecords = [
  {
    id: 'WR-2410-0089',
    date: '2024-01-15',
    location: 'Main Kitchen',
    itemCode: 'BEV-001',
    itemName: 'Thai Milk Tea Powder',
    quantity: 5,
    unit: 'Box',
    unitCost: 45.99,
    totalLoss: 229.95,
    reason: 'Expiration',
    reportedBy: 'John Smith',
    status: 'pending',
  },
  {
    id: 'WR-2410-0088',
    date: '2024-01-15',
    location: 'Pool Bar',
    itemCode: 'LIQ-003',
    itemName: 'Orange Juice Fresh',
    quantity: 12,
    unit: 'Liter',
    unitCost: 8.50,
    totalLoss: 102.00,
    reason: 'Spoilage',
    reportedBy: 'Maria Garcia',
    status: 'approved',
  },
  {
    id: 'WR-2410-0087',
    date: '2024-01-14',
    location: 'Rooftop Restaurant',
    itemCode: 'MTT-001',
    itemName: 'Wagyu Beef Premium',
    quantity: 3,
    unit: 'Kg',
    unitCost: 185.00,
    totalLoss: 555.00,
    reason: 'Quality Issues',
    reportedBy: 'James Wilson',
    status: 'under_review',
  },
  {
    id: 'WR-2410-0086',
    date: '2024-01-14',
    location: 'Lobby Café',
    itemCode: 'BAK-002',
    itemName: 'Croissants Butter',
    quantity: 24,
    unit: 'Piece',
    unitCost: 3.50,
    totalLoss: 84.00,
    reason: 'Damage',
    reportedBy: 'Emma Brown',
    status: 'approved',
  },
  {
    id: 'WR-2410-0085',
    date: '2024-01-13',
    location: 'Main Kitchen',
    itemCode: 'VEG-005',
    itemName: 'Mixed Salad Greens',
    quantity: 8,
    unit: 'Kg',
    unitCost: 12.00,
    totalLoss: 96.00,
    reason: 'Spoilage',
    reportedBy: 'John Smith',
    status: 'approved',
  },
]

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

// ============================================================================
// SORT CONFIGURATION
// ============================================================================
// Sort options for the Recent Wastage Reports table.
// Users can sort by:
// - Date: View reports chronologically (newest/oldest first)
// - Loss Value: Identify top wastage items by cost (highest/lowest)
// - Item Name: Alphabetical sorting for easy lookup
// - Quantity: Sort by volume of wastage
// ============================================================================

type SortField = 'date' | 'totalLoss' | 'itemName' | 'quantity' | 'status'
type SortDirection = 'asc' | 'desc'

interface SortOption {
  field: SortField
  direction: SortDirection
  label: string
}

const sortOptions: SortOption[] = [
  { field: 'date', direction: 'desc', label: 'Date (Newest First)' },
  { field: 'date', direction: 'asc', label: 'Date (Oldest First)' },
  { field: 'totalLoss', direction: 'desc', label: 'Loss Value (Highest)' },
  { field: 'totalLoss', direction: 'asc', label: 'Loss Value (Lowest)' },
  { field: 'itemName', direction: 'asc', label: 'Item Name (A-Z)' },
  { field: 'itemName', direction: 'desc', label: 'Item Name (Z-A)' },
  { field: 'quantity', direction: 'desc', label: 'Quantity (Highest)' },
  { field: 'quantity', direction: 'asc', label: 'Quantity (Lowest)' },
]

export default function WastageReportingDashboard() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [locationFilter, setLocationFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date-desc') // Default: newest reports first

  // Parse sort selection into field and direction
  // Format: "field-direction" (e.g., "totalLoss-desc" for top wastage items)
  const currentSort = useMemo(() => {
    const [field, direction] = sortBy.split('-') as [SortField, SortDirection]
    return { field, direction }
  }, [sortBy])

  // ============================================================================
  // FILTER AND SORT RECORDS
  // ============================================================================
  // Applies search, status, and location filters, then sorts the results.
  // Sorting is applied after filtering for better performance.
  // ============================================================================
  const filteredRecords = useMemo(() => {
    // Step 1: Apply filters
    let records = recentWastageRecords.filter(record => {
      const matchesSearch = record.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        record.itemCode.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesStatus = statusFilter === 'all' || record.status === statusFilter
      const matchesLocation = locationFilter === 'all' || record.location === locationFilter
      return matchesSearch && matchesStatus && matchesLocation
    })

    // Step 2: Apply sorting based on selected field and direction
    records = [...records].sort((a, b) => {
      const { field, direction } = currentSort
      let comparison = 0

      switch (field) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'totalLoss':
          // Sort by loss value - useful for identifying top wastage items
          comparison = a.totalLoss - b.totalLoss
          break
        case 'itemName':
          comparison = a.itemName.localeCompare(b.itemName)
          break
        case 'quantity':
          comparison = a.quantity - b.quantity
          break
        case 'status':
          comparison = a.status.localeCompare(b.status)
          break
        default:
          comparison = 0
      }

      // Reverse comparison for descending order
      return direction === 'desc' ? -comparison : comparison
    })

    return records
  }, [searchQuery, statusFilter, locationFilter, currentSort])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Trash2 className="h-7 w-7 text-red-600" />
            Wastage Reporting
          </h1>
          <p className="text-muted-foreground">
            Track, analyze, and reduce inventory wastage across all locations
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/store-operations/wastage-reporting/analytics">
            <Button variant="outline">
              <BarChart3 className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </Link>
          <Link href="/store-operations/wastage-reporting/new">
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="mr-2 h-4 w-4" />
              Report Wastage
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        <Link href="/store-operations/wastage-reporting/new">
          <Card className="hover:border-red-300 hover:bg-red-50/50 transition-colors cursor-pointer">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
                  <Plus className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-medium">New Report</p>
                  <p className="text-sm text-muted-foreground">Log wastage incident</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/store-operations/wastage-reporting/reports">
          <Card className="hover:border-orange-300 hover:bg-orange-50/50 transition-colors cursor-pointer">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                  <ClipboardList className="h-5 w-5 text-orange-600" />
                </div>
                <div>
                  <p className="font-medium">All Reports</p>
                  <p className="text-sm text-muted-foreground">View all records</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/store-operations/wastage-reporting/analytics">
          <Card className="hover:border-purple-300 hover:bg-purple-50/50 transition-colors cursor-pointer">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium">Analytics</p>
                  <p className="text-sm text-muted-foreground">Wastage insights</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/store-operations/wastage-reporting/categories">
          <Card className="hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium">Categories</p>
                  <p className="text-sm text-muted-foreground">Manage reasons</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-red-200">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Wastage (MTD)</p>
                <p className="text-2xl font-bold text-red-600">$3,458.50</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">12% vs last month</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Items Written Off</p>
                <p className="text-2xl font-bold">45</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-red-600" />
                  <span className="text-xs text-red-600">8% vs last month</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Reviews</p>
                <p className="text-2xl font-bold text-yellow-600">12</p>
                <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Wastage Rate</p>
                <p className="text-2xl font-bold">2.3%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="h-3 w-3 text-green-600" />
                  <span className="text-xs text-green-600">0.5% improvement</span>
                </div>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert for pending reviews */}
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>12 wastage reports</strong> are pending review. High-value items over $100 require manager approval.
          <Link href="/store-operations/wastage-reporting/reports?status=pending" className="ml-2 underline font-medium hover:text-yellow-900">
            Review now →
          </Link>
        </AlertDescription>
      </Alert>

      {/* Charts Row */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5" />
              Monthly Wastage Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyWastageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'value' ? `$${value}` : value,
                      name === 'value' ? 'Wastage Value' : 'Items'
                    ]}
                  />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="value"
                    stroke="#ef4444"
                    strokeWidth={2}
                    name="Wastage ($)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="items"
                    stroke="#6b7280"
                    strokeWidth={2}
                    name="Items"
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Wastage by Reason
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px] flex">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={wastageByReasonData}
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {wastageByReasonData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="w-32 flex flex-col justify-center gap-2">
                {wastageByReasonData.map((entry) => (
                  <div key={entry.name} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-xs truncate">{entry.name}</span>
                    <span className="text-xs font-medium ml-auto">{entry.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Wastage by Location */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Wastage by Location (This Month)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={wastageByLocationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                <YAxis dataKey="location" type="category" width={130} />
                <Tooltip formatter={(value) => [`$${value}`, 'Wastage']} />
                <Bar dataKey="value" fill="#ef4444" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Wastage Records */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <CardTitle>Recent Wastage Reports</CardTitle>
              <Link href="/store-operations/wastage-reporting/reports">
                <Button variant="outline" size="sm">
                  View All
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search reports..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <ArrowUpDown className="mr-2 h-4 w-4" />
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {sortOptions.map((option) => (
                      <SelectItem
                        key={`${option.field}-${option.direction}`}
                        value={`${option.field}-${option.direction}`}
                      >
                        <span className="flex items-center gap-2">
                          {option.direction === 'desc' ? (
                            <ArrowDown className="h-3 w-3 text-muted-foreground" />
                          ) : (
                            <ArrowUp className="h-3 w-3 text-muted-foreground" />
                          )}
                          {option.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-[150px]">
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
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Report ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Item</TableHead>
                <TableHead className="text-center">Qty</TableHead>
                <TableHead className="text-right">Loss Value</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    <Link
                      href={`/store-operations/wastage-reporting/reports/${record.id}`}
                      className="font-medium text-red-600 hover:underline"
                    >
                      {record.id}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{record.date}</TableCell>
                  <TableCell>{record.location}</TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{record.itemName}</p>
                      <p className="text-xs text-muted-foreground">{record.itemCode}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    {record.quantity} {record.unit}
                  </TableCell>
                  <TableCell className="text-right font-medium text-red-600">
                    ${record.totalLoss.toFixed(2)}
                  </TableCell>
                  <TableCell>{getReasonBadge(record.reason)}</TableCell>
                  <TableCell>{getStatusBadge(record.status)}</TableCell>
                  <TableCell className="text-right">
                    <Link href={`/store-operations/wastage-reporting/reports/${record.id}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
