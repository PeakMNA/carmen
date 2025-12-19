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
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Warehouse,
  Search,
  Filter,
  ArrowLeftRight,
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Download,
  RefreshCw,
  Eye,
} from 'lucide-react'

// Mock data for stock levels by location
const stockLevelsData = [
  {
    id: '1',
    location: 'Main Kitchen',
    locationCode: 'MK-001',
    locationType: 'kitchen',
    items: [
      { id: '1', name: 'Thai Milk Tea Powder', sku: 'BEV-001', currentStock: 15, parLevel: 50, unit: 'Box', status: 'critical', lastTransfer: '2024-01-10' },
      { id: '2', name: 'Premium Coffee Beans', sku: 'BEV-002', currentStock: 35, parLevel: 40, unit: 'Bag', status: 'low', lastTransfer: '2024-01-12' },
      { id: '3', name: 'Jasmine Rice', sku: 'GRN-001', currentStock: 80, parLevel: 60, unit: 'Kg', status: 'normal', lastTransfer: '2024-01-08' },
      { id: '4', name: 'Cooking Oil', sku: 'OIL-001', currentStock: 25, parLevel: 30, unit: 'Liter', status: 'low', lastTransfer: '2024-01-11' },
    ],
    totalItems: 156,
    criticalItems: 8,
    lowStockItems: 12,
    normalItems: 136,
  },
  {
    id: '2',
    location: 'Pool Bar',
    locationCode: 'PB-001',
    locationType: 'bar',
    items: [
      { id: '5', name: 'Vodka Premium', sku: 'LIQ-001', currentStock: 8, parLevel: 20, unit: 'Bottle', status: 'critical', lastTransfer: '2024-01-09' },
      { id: '6', name: 'Gin London Dry', sku: 'LIQ-002', currentStock: 12, parLevel: 15, unit: 'Bottle', status: 'low', lastTransfer: '2024-01-11' },
      { id: '7', name: 'Orange Juice', sku: 'JUI-001', currentStock: 40, parLevel: 30, unit: 'Liter', status: 'normal', lastTransfer: '2024-01-12' },
      { id: '8', name: 'Lime Fresh', sku: 'FRT-001', currentStock: 5, parLevel: 20, unit: 'Kg', status: 'critical', lastTransfer: '2024-01-10' },
    ],
    totalItems: 89,
    criticalItems: 5,
    lowStockItems: 8,
    normalItems: 76,
  },
  {
    id: '3',
    location: 'Rooftop Restaurant',
    locationCode: 'RR-001',
    locationType: 'restaurant',
    items: [
      { id: '9', name: 'Wagyu Beef', sku: 'MTT-001', currentStock: 12, parLevel: 15, unit: 'Kg', status: 'low', lastTransfer: '2024-01-12' },
      { id: '10', name: 'Fresh Salmon', sku: 'SEA-001', currentStock: 8, parLevel: 10, unit: 'Kg', status: 'low', lastTransfer: '2024-01-12' },
      { id: '11', name: 'Truffle Oil', sku: 'OIL-002', currentStock: 6, parLevel: 5, unit: 'Bottle', status: 'normal', lastTransfer: '2024-01-10' },
      { id: '12', name: 'Parmesan Cheese', sku: 'DRY-001', currentStock: 4, parLevel: 8, unit: 'Kg', status: 'critical', lastTransfer: '2024-01-09' },
    ],
    totalItems: 124,
    criticalItems: 3,
    lowStockItems: 15,
    normalItems: 106,
  },
  {
    id: '4',
    location: 'Lobby Café',
    locationCode: 'LC-001',
    locationType: 'cafe',
    items: [
      { id: '13', name: 'Espresso Beans', sku: 'BEV-003', currentStock: 20, parLevel: 25, unit: 'Kg', status: 'low', lastTransfer: '2024-01-11' },
      { id: '14', name: 'Milk Fresh', sku: 'DRY-002', currentStock: 30, parLevel: 20, unit: 'Liter', status: 'normal', lastTransfer: '2024-01-12' },
      { id: '15', name: 'Croissants Frozen', sku: 'BAK-001', currentStock: 50, parLevel: 40, unit: 'Piece', status: 'normal', lastTransfer: '2024-01-10' },
      { id: '16', name: 'Sugar Packets', sku: 'SWT-001', currentStock: 100, parLevel: 80, unit: 'Box', status: 'normal', lastTransfer: '2024-01-08' },
    ],
    totalItems: 78,
    criticalItems: 1,
    lowStockItems: 6,
    normalItems: 71,
  },
  {
    id: '5',
    location: 'Banquet Hall',
    locationCode: 'BH-001',
    locationType: 'banquet',
    items: [
      { id: '17', name: 'Wine Red Reserve', sku: 'WNE-001', currentStock: 24, parLevel: 30, unit: 'Bottle', status: 'low', lastTransfer: '2024-01-10' },
      { id: '18', name: 'Champagne Premium', sku: 'WNE-002', currentStock: 12, parLevel: 20, unit: 'Bottle', status: 'critical', lastTransfer: '2024-01-08' },
      { id: '19', name: 'Napkins Linen', sku: 'SUP-001', currentStock: 200, parLevel: 150, unit: 'Piece', status: 'normal', lastTransfer: '2024-01-09' },
      { id: '20', name: 'Tablecloth White', sku: 'SUP-002', currentStock: 50, parLevel: 40, unit: 'Piece', status: 'normal', lastTransfer: '2024-01-07' },
    ],
    totalItems: 95,
    criticalItems: 2,
    lowStockItems: 9,
    normalItems: 84,
  },
  {
    id: '6',
    location: 'Central Store',
    locationCode: 'CS-001',
    locationType: 'store',
    items: [
      { id: '21', name: 'Thai Milk Tea Powder', sku: 'BEV-001', currentStock: 200, parLevel: 150, unit: 'Box', status: 'normal', lastTransfer: '2024-01-12' },
      { id: '22', name: 'Premium Coffee Beans', sku: 'BEV-002', currentStock: 180, parLevel: 120, unit: 'Bag', status: 'normal', lastTransfer: '2024-01-12' },
      { id: '23', name: 'Vodka Premium', sku: 'LIQ-001', currentStock: 60, parLevel: 50, unit: 'Bottle', status: 'normal', lastTransfer: '2024-01-11' },
      { id: '24', name: 'Wagyu Beef', sku: 'MTT-001', currentStock: 40, parLevel: 30, unit: 'Kg', status: 'normal', lastTransfer: '2024-01-12' },
    ],
    totalItems: 450,
    criticalItems: 0,
    lowStockItems: 5,
    normalItems: 445,
  },
]

function getStatusBadge(status: string) {
  switch (status) {
    case 'critical':
      return <Badge variant="destructive">Critical</Badge>
    case 'low':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Low Stock</Badge>
    case 'normal':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Normal</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getLocationTypeIcon(type: string) {
  const iconClass = "h-4 w-4"
  switch (type) {
    case 'kitchen':
      return <span className="text-orange-600">🍳</span>
    case 'bar':
      return <span className="text-purple-600">🍸</span>
    case 'restaurant':
      return <span className="text-red-600">🍽️</span>
    case 'cafe':
      return <span className="text-amber-600">☕</span>
    case 'banquet':
      return <span className="text-blue-600">🎉</span>
    case 'store':
      return <span className="text-green-600">📦</span>
    default:
      return <MapPin className={iconClass} />
  }
}

function getStockPercentage(current: number, par: number) {
  return Math.min(Math.round((current / par) * 100), 100)
}

function getProgressColor(percentage: number) {
  if (percentage <= 30) return 'bg-red-500'
  if (percentage <= 60) return 'bg-yellow-500'
  return 'bg-green-500'
}

export default function StockLevelsPage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [locationFilter, setLocationFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [expandedLocation, setExpandedLocation] = useState<string | null>(null)

  // Calculate totals
  const totals = useMemo(() => {
    return stockLevelsData.reduce((acc, loc) => ({
      totalItems: acc.totalItems + loc.totalItems,
      criticalItems: acc.criticalItems + loc.criticalItems,
      lowStockItems: acc.lowStockItems + loc.lowStockItems,
      normalItems: acc.normalItems + loc.normalItems,
    }), { totalItems: 0, criticalItems: 0, lowStockItems: 0, normalItems: 0 })
  }, [])

  // Filter locations
  const filteredLocations = useMemo(() => {
    return stockLevelsData.filter(location => {
      const matchesSearch = location.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.locationCode.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesLocation = locationFilter === 'all' || location.locationType === locationFilter
      const matchesStatus = statusFilter === 'all' ||
        (statusFilter === 'critical' && location.criticalItems > 0) ||
        (statusFilter === 'low' && location.lowStockItems > 0) ||
        (statusFilter === 'normal' && location.criticalItems === 0 && location.lowStockItems === 0)
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
              <Package className="h-7 w-7 text-green-600" />
              Stock Levels by Location
            </h1>
            <p className="text-muted-foreground">
              Monitor inventory levels across all hotel locations
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
          <Link href="/store-operations/stock-replenishment/new">
            <Button className="bg-green-600 hover:bg-green-700">
              <ArrowLeftRight className="mr-2 h-4 w-4" />
              New Transfer
            </Button>
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{totals.totalItems.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">Across {stockLevelsData.length} locations</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Stock</p>
                <p className="text-2xl font-bold text-red-600">{totals.criticalItems}</p>
                <p className="text-xs text-muted-foreground mt-1">Need immediate transfer</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-yellow-600">{totals.lowStockItems}</p>
                <p className="text-xs text-muted-foreground mt-1">Below PAR level</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200">
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Normal Stock</p>
                <p className="text-2xl font-bold text-green-600">{totals.normalItems}</p>
                <p className="text-xs text-muted-foreground mt-1">Within safe levels</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Critical Alert */}
      {totals.criticalItems > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{totals.criticalItems} items</strong> are at critical stock levels across multiple locations.
            <Link href="/store-operations/stock-replenishment/new" className="ml-2 underline font-medium hover:text-red-900">
              Create transfer request →
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search locations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Location Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="cafe">Café</SelectItem>
                  <SelectItem value="banquet">Banquet</SelectItem>
                  <SelectItem value="store">Central Store</SelectItem>
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Stock Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="critical">Has Critical</SelectItem>
                  <SelectItem value="low">Has Low Stock</SelectItem>
                  <SelectItem value="normal">All Normal</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Cards */}
      <div className="grid gap-4">
        {filteredLocations.map((location) => (
          <Card key={location.id} className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center text-xl">
                    {getLocationTypeIcon(location.locationType)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{location.location}</CardTitle>
                    <p className="text-sm text-muted-foreground">{location.locationCode}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {location.criticalItems > 0 && (
                      <Badge variant="destructive">{location.criticalItems} Critical</Badge>
                    )}
                    {location.lowStockItems > 0 && (
                      <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{location.lowStockItems} Low</Badge>
                    )}
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-100">{location.normalItems} Normal</Badge>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedLocation(expandedLocation === location.id ? null : location.id)}
                  >
                    <Eye className="mr-1 h-4 w-4" />
                    {expandedLocation === location.id ? 'Hide' : 'View'} Items
                    <ChevronRight className={`ml-1 h-4 w-4 transition-transform ${expandedLocation === location.id ? 'rotate-90' : ''}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {/* Stock Overview Bar */}
            <CardContent className="pb-3">
              <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-100">
                <div
                  className="bg-red-500 transition-all"
                  style={{ width: `${(location.criticalItems / location.totalItems) * 100}%` }}
                />
                <div
                  className="bg-yellow-500 transition-all"
                  style={{ width: `${(location.lowStockItems / location.totalItems) * 100}%` }}
                />
                <div
                  className="bg-green-500 transition-all"
                  style={{ width: `${(location.normalItems / location.totalItems) * 100}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                <span>{location.totalItems} total items</span>
                <span>Last updated: Today, 10:30 AM</span>
              </div>
            </CardContent>

            {/* Expanded Items Table */}
            {expandedLocation === location.id && (
              <div className="border-t">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50">
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">Current</TableHead>
                      <TableHead className="text-right">PAR Level</TableHead>
                      <TableHead>Stock Level</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Last Transfer</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {location.items.map((item) => {
                      const percentage = getStockPercentage(item.currentStock, item.parLevel)
                      return (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-sm text-muted-foreground">{item.sku}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {item.currentStock} {item.unit}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {item.parLevel} {item.unit}
                          </TableCell>
                          <TableCell className="w-32">
                            <div className="space-y-1">
                              <Progress
                                value={percentage}
                                className="h-2"
                              />
                              <p className="text-xs text-muted-foreground text-center">{percentage}%</p>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(item.status)}</TableCell>
                          <TableCell className="text-muted-foreground">{item.lastTransfer}</TableCell>
                          <TableCell className="text-right">
                            <Link href={`/store-operations/stock-replenishment/new?item=${item.sku}&location=${location.locationCode}`}>
                              <Button variant="outline" size="sm">
                                <ArrowLeftRight className="mr-1 h-3 w-3" />
                                Transfer
                              </Button>
                            </Link>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
                <div className="p-3 bg-gray-50 border-t flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">
                    Showing {location.items.length} of {location.totalItems} items
                  </p>
                  <Button variant="link" size="sm" className="text-green-600">
                    View all items →
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredLocations.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <Warehouse className="mx-auto h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No locations found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Try adjusting your search or filter criteria.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Cross-link Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Warehouse className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">Need to check central store inventory?</p>
                <p className="text-sm text-blue-700">
                  View comprehensive inventory management and stock adjustments.
                </p>
              </div>
            </div>
            <Link href="/inventory-management">
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                Go to Inventory Management
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
