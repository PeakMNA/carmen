'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
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
  History,
  Search,
  Filter,
  ArrowLeftRight,
  Download,
  Eye,
  MoreHorizontal,
  Calendar,
  Package,
  CheckCircle2,
  XCircle,
  Clock,
  TrendingUp,
  FileText,
  ChevronLeft,
  ChevronRight,
  Warehouse,
  BarChart3,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts'

// Mock data for requisition/transfer history
// Note: These are Store Requisitions (SR) that generated Stock Transfers (ST)
const transferHistoryData = [
  {
    id: 'SR-2410-0089',
    fromLocation: 'Central Store',
    toLocation: 'Main Kitchen',
    requestedBy: 'John Smith',
    approvedBy: 'Sarah Chen',
    itemCount: 8,
    totalValue: 1250.00,
    status: 'completed',
    requestDate: '2024-01-12',
    completedDate: '2024-01-13',
    deliveryTime: '4.5 hours',
  },
  {
    id: 'SR-2410-0088',
    fromLocation: 'Central Store',
    toLocation: 'Pool Bar',
    requestedBy: 'Maria Garcia',
    approvedBy: 'David Lee',
    itemCount: 5,
    totalValue: 890.50,
    status: 'completed',
    requestDate: '2024-01-12',
    completedDate: '2024-01-12',
    deliveryTime: '2.3 hours',
  },
  {
    id: 'SR-2410-0087',
    fromLocation: 'Central Store',
    toLocation: 'Rooftop Restaurant',
    requestedBy: 'James Wilson',
    approvedBy: 'Sarah Chen',
    itemCount: 12,
    totalValue: 2450.00,
    status: 'completed',
    requestDate: '2024-01-11',
    completedDate: '2024-01-12',
    deliveryTime: '6.2 hours',
  },
  {
    id: 'SR-2410-0086',
    fromLocation: 'Central Store',
    toLocation: 'Lobby Café',
    requestedBy: 'Emma Brown',
    approvedBy: 'David Lee',
    itemCount: 6,
    totalValue: 560.00,
    status: 'completed',
    requestDate: '2024-01-11',
    completedDate: '2024-01-11',
    deliveryTime: '1.8 hours',
  },
  {
    id: 'SR-2410-0085',
    fromLocation: 'Central Store',
    toLocation: 'Banquet Hall',
    requestedBy: 'Robert Johnson',
    approvedBy: null,
    itemCount: 15,
    totalValue: 3200.00,
    status: 'rejected',
    requestDate: '2024-01-10',
    completedDate: null,
    rejectionReason: 'Insufficient stock in central store',
  },
  {
    id: 'SR-2410-0084',
    fromLocation: 'Central Store',
    toLocation: 'Main Kitchen',
    requestedBy: 'John Smith',
    approvedBy: 'Sarah Chen',
    itemCount: 10,
    totalValue: 1850.00,
    status: 'completed',
    requestDate: '2024-01-10',
    completedDate: '2024-01-10',
    deliveryTime: '3.1 hours',
  },
  {
    id: 'SR-2410-0083',
    fromLocation: 'Central Store',
    toLocation: 'Pool Bar',
    requestedBy: 'Maria Garcia',
    approvedBy: 'David Lee',
    itemCount: 7,
    totalValue: 980.00,
    status: 'completed',
    requestDate: '2024-01-09',
    completedDate: '2024-01-09',
    deliveryTime: '2.0 hours',
  },
  {
    id: 'SR-2410-0082',
    fromLocation: 'Central Store',
    toLocation: 'Rooftop Restaurant',
    requestedBy: 'James Wilson',
    approvedBy: 'Sarah Chen',
    itemCount: 9,
    totalValue: 1650.00,
    status: 'completed',
    requestDate: '2024-01-08',
    completedDate: '2024-01-09',
    deliveryTime: '5.5 hours',
  },
  {
    id: 'SR-2410-0081',
    fromLocation: 'Central Store',
    toLocation: 'Lobby Café',
    requestedBy: 'Emma Brown',
    approvedBy: null,
    itemCount: 4,
    totalValue: 420.00,
    status: 'cancelled',
    requestDate: '2024-01-08',
    completedDate: null,
    cancellationReason: 'Duplicate request',
  },
  {
    id: 'SR-2410-0080',
    fromLocation: 'Central Store',
    toLocation: 'Main Kitchen',
    requestedBy: 'John Smith',
    approvedBy: 'Sarah Chen',
    itemCount: 11,
    totalValue: 2100.00,
    status: 'completed',
    requestDate: '2024-01-07',
    completedDate: '2024-01-08',
    deliveryTime: '4.8 hours',
  },
]

// Chart data
const monthlyTransferData = [
  { month: 'Aug', transfers: 45, value: 28500 },
  { month: 'Sep', transfers: 52, value: 32100 },
  { month: 'Oct', transfers: 48, value: 29800 },
  { month: 'Nov', transfers: 61, value: 38200 },
  { month: 'Dec', transfers: 58, value: 36500 },
  { month: 'Jan', transfers: 42, value: 26400 },
]

const locationTransferData = [
  { location: 'Main Kitchen', transfers: 85, value: 52000 },
  { location: 'Pool Bar', transfers: 62, value: 28500 },
  { location: 'Rooftop Restaurant', transfers: 48, value: 45000 },
  { location: 'Lobby Café', transfers: 35, value: 15200 },
  { location: 'Banquet Hall', transfers: 28, value: 32000 },
]

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>
    case 'cancelled':
      return <Badge variant="outline" className="text-gray-600">Cancelled</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'completed':
      return <CheckCircle2 className="h-4 w-4 text-green-600" />
    case 'rejected':
      return <XCircle className="h-4 w-4 text-red-600" />
    case 'cancelled':
      return <Clock className="h-4 w-4 text-gray-400" />
    default:
      return null
  }
}

export default function RequisitionHistoryPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState('30')

  // Calculate statistics
  const stats = useMemo(() => {
    const completed = transferHistoryData.filter(t => t.status === 'completed')
    const avgDeliveryTime = completed.reduce((sum, t) => sum + parseFloat(t.deliveryTime || '0'), 0) / completed.length
    const totalValue = completed.reduce((sum, t) => sum + t.totalValue, 0)
    const totalItems = completed.reduce((sum, t) => sum + t.itemCount, 0)

    return {
      totalTransfers: transferHistoryData.length,
      completedTransfers: completed.length,
      rejectedTransfers: transferHistoryData.filter(t => t.status === 'rejected').length,
      avgDeliveryTime: avgDeliveryTime.toFixed(1),
      totalValue,
      totalItems,
      successRate: ((completed.length / transferHistoryData.length) * 100).toFixed(1),
    }
  }, [])

  // Filter transfers
  const filteredTransfers = useMemo(() => {
    return transferHistoryData.filter(transfer => {
      const matchesSearch = transfer.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.toLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        transfer.requestedBy.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesLocation = locationFilter === 'all' || transfer.toLocation === locationFilter
      const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter
      return matchesSearch && matchesLocation && matchesStatus
    })
  }, [searchQuery, locationFilter, statusFilter])

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-start gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            aria-label="Go back"
            className="mt-1 flex-shrink-0"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <History className="h-7 w-7 text-green-600" />
              Requisition History
            </h1>
            <p className="text-muted-foreground">
              View and analyze historical store requisitions and stock transfers
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[150px]">
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
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Transfers</p>
                <p className="text-2xl font-bold">{stats.totalTransfers}</p>
                <p className="text-xs text-green-600 mt-1">+12% from last period</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <ArrowLeftRight className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold text-green-600">{stats.successRate}%</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.completedTransfers} completed</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Delivery Time</p>
                <p className="text-2xl font-bold">{stats.avgDeliveryTime}h</p>
                <p className="text-xs text-green-600 mt-1">-15% improvement</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">${stats.totalValue.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">{stats.totalItems} items transferred</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Transfer Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTransferData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="transfers"
                    stroke="#16a34a"
                    strokeWidth={2}
                    name="Transfers"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    strokeWidth={2}
                    name="Value ($)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Transfers by Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={locationTransferData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="location" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="transfers" fill="#16a34a" name="Transfers" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
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
                placeholder="Search by ID, location, or requester..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Destination" />
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
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* History Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Requisition Records</CardTitle>
            <p className="text-sm text-muted-foreground">
              Showing {filteredTransfers.length} of {transferHistoryData.length} records
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Requisition ID</TableHead>
                <TableHead>Destination</TableHead>
                <TableHead>Requested By</TableHead>
                <TableHead className="text-center">Items</TableHead>
                <TableHead className="text-right">Value</TableHead>
                <TableHead>Request Date</TableHead>
                <TableHead>Delivery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell>
                    <Link
                      href={`/store-operations/store-requisitions/${transfer.id}`}
                      className="font-medium text-green-600 hover:underline"
                    >
                      {transfer.id}
                    </Link>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{transfer.toLocation}</p>
                      <p className="text-xs text-muted-foreground">from {transfer.fromLocation}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p>{transfer.requestedBy}</p>
                      {transfer.approvedBy && (
                        <p className="text-xs text-muted-foreground">Approved: {transfer.approvedBy}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{transfer.itemCount}</TableCell>
                  <TableCell className="text-right font-medium">
                    ${transfer.totalValue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{transfer.requestDate}</TableCell>
                  <TableCell>
                    {transfer.deliveryTime ? (
                      <span className="text-green-600">{transfer.deliveryTime}</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(transfer.status)}
                      {getStatusBadge(transfer.status)}
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
                          <Link href={`/store-operations/store-requisitions/${transfer.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            View Details
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <FileText className="mr-2 h-4 w-4" />
                          Download Report
                        </DropdownMenuItem>
                        {transfer.status === 'completed' && (
                          <DropdownMenuItem>
                            <ArrowLeftRight className="mr-2 h-4 w-4" />
                            Repeat Transfer
                          </DropdownMenuItem>
                        )}
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
      {filteredTransfers.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <History className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No transfer history found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cross-link Card */}
      <Card className="bg-green-50 border-green-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                <Warehouse className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-green-900">Need to check current stock levels?</p>
                <p className="text-sm text-green-700">
                  Monitor inventory across all hotel locations in real-time.
                </p>
              </div>
            </div>
            <Link href="/store-operations/stock-replenishment/stock-levels">
              <Button variant="outline" className="border-green-300 text-green-700 hover:bg-green-100">
                View Stock Levels
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
