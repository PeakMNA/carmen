'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { 
  ChevronLeft, 
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  Package,
  CheckCircle2,
  Clock,
  Upload,
  FileText,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Download,
  Copy,
  Send,
  Archive,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'

// Mock data for pricelist details
const mockPricelistDetail = {
  id: 'pl-001',
  pricelistNumber: 'PL-2410-001',
  vendorName: 'Fresh Foods Co.',
  vendorId: 'vendor-001',
  name: 'Q2 2024 Standard Pricing',
  description: 'Standard pricing for Q2 2024 across all product categories',
  status: 'active',
  currency: 'USD',
  itemCount: 245,
  totalValue: 125450.75,
  taxProfile: 'VAT',
  taxRate: 7,
  validFrom: '2024-04-01',
  validTo: '2024-06-30',
  lastUpdated: '2024-05-15',
  submittedAt: '2024-04-15',
  approvedAt: '2024-04-20',
  approvedBy: 'John Doe',
  submittedBy: 'Fresh Foods Co.',
  createdAt: '2024-03-15',
  qualityScore: 4.2,
  categories: ['Beach Equipment', 'Furniture', 'Linens', 'Amenities'],
  completionPercentage: 100,
  version: 1
}

// Mock vendor performance data
const mockVendorPerformance = {
  responseMetrics: {
    averageResponseTime: 2.3, // days
    responseRate: 95.2, // percentage
    onTimeSubmissions: 18,
    totalInvitations: 20
  },
  qualityMetrics: {
    dataQualityScore: 4.6,
    completenessRate: 98.5,
    accuracyRate: 96.8,
    consistencyScore: 4.4
  },
  pricingTrends: [
    { period: 'Q1 2024', avgPrice: 42.50, submissions: 5, quality: 4.5 },
    { period: 'Q2 2024', avgPrice: 43.80, submissions: 4, quality: 4.6 },
    { period: 'Q3 2024', avgPrice: 44.20, submissions: 3, quality: 4.7 },
    { period: 'Q4 2024', avgPrice: 45.10, submissions: 2, quality: 4.8 }
  ],
  categoryPerformance: [
    { category: 'Beach Equipment', submissions: 8, avgQuality: 4.8, avgResponseTime: 1.5 },
    { category: 'Furniture', submissions: 6, avgQuality: 4.5, avgResponseTime: 2.8 },
    { category: 'Linens', submissions: 4, avgQuality: 4.6, avgResponseTime: 2.1 },
    { category: 'Amenities', submissions: 2, avgQuality: 4.4, avgResponseTime: 3.2 }
  ],
  recentActivity: [
    { date: '2024-05-15', action: 'Pricelist Updated', details: '15 items modified', status: 'completed' },
    { date: '2024-05-10', action: 'Price Submission', details: 'Q2 2024 pricing submitted', status: 'approved' },
    { date: '2024-04-28', action: 'Campaign Invitation', details: 'Q2 campaign invitation sent', status: 'responded' },
    { date: '2024-04-15', action: 'Template Download', details: 'Excel template downloaded', status: 'completed' }
  ]
}

// Mock data for pricelist items
const mockPricelistItems = [
  {
    id: 'item-001',
    productCode: 'BE-001',
    productName: 'Beach Umbrella - Large',
    category: 'Beach Equipment',
    currency: 'USD',
    pricing: [
      { moq: 1, unit: 'Each', unitPrice: 45.00, leadTime: 7 },
      { moq: 10, unit: 'Each', unitPrice: 42.50, leadTime: 7 },
      { moq: 25, unit: 'Each', unitPrice: 40.00, leadTime: 10 }
    ],
    lastModified: '2024-05-15',
    priceChange: 5.2 // percentage increase
  },
  {
    id: 'item-002',
    productCode: 'FU-012',
    productName: 'Poolside Lounge Chair',
    category: 'Furniture',
    currency: 'USD',
    pricing: [
      { moq: 1, unit: 'Each', unitPrice: 180.00, leadTime: 14 },
      { moq: 5, unit: 'Each', unitPrice: 175.00, leadTime: 14 },
      { moq: 12, unit: 'Each', unitPrice: 170.00, leadTime: 18 }
    ],
    lastModified: '2024-05-14',
    priceChange: -2.1 // percentage decrease
  },
  {
    id: 'item-003',
    productCode: 'LN-045',
    productName: 'Premium Bath Towel Set',
    category: 'Linens',
    currency: 'USD',
    pricing: [
      { moq: 1, unit: 'Set', unitPrice: 25.00, leadTime: 5 },
      { moq: 20, unit: 'Set', unitPrice: 23.50, leadTime: 5 },
      { moq: 50, unit: 'Set', unitPrice: 22.00, leadTime: 7 }
    ],
    lastModified: '2024-05-13',
    priceChange: 0 // no change
  },
  {
    id: 'item-004',
    productCode: 'AM-089',
    productName: 'Luxury Soap Dispenser',
    category: 'Amenities',
    currency: 'USD',
    pricing: [
      { moq: 1, unit: 'Each', unitPrice: 35.00, leadTime: 10 },
      { moq: 10, unit: 'Each', unitPrice: 32.50, leadTime: 10 },
      { moq: 25, unit: 'Each', unitPrice: 30.00, leadTime: 12 }
    ],
    lastModified: '2024-05-12',
    priceChange: 3.8 // percentage increase
  }
]

export default function PricelistDetailPage({ params }: { params: { id: string } }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [priceRangeFilter, setPriceRangeFilter] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const filteredItems = useMemo(() => {
    let filtered = mockPricelistItems.filter(item => {
    const matchesSearch = item.productCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.productName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter

      const basePrice = item.pricing[0]?.unitPrice || 0
      const matchesPriceRange = priceRangeFilter === 'all' ||
        (priceRangeFilter === 'low' && basePrice < 50) ||
        (priceRangeFilter === 'medium' && basePrice >= 50 && basePrice < 200) ||
        (priceRangeFilter === 'high' && basePrice >= 200)

      return matchesSearch && matchesCategory && matchesPriceRange
    })

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue: any, bValue: any
      
      switch (sortBy) {
        case 'name':
          aValue = a.productName
          bValue = b.productName
          break
        case 'code':
          aValue = a.productCode
          bValue = b.productCode
          break
        case 'price':
          aValue = a.pricing[0]?.unitPrice || 0
          bValue = b.pricing[0]?.unitPrice || 0
          break
        case 'category':
          aValue = a.category
          bValue = b.category
          break
        case 'change':
          aValue = Math.abs(a.priceChange)
          bValue = Math.abs(b.priceChange)
          break
        default:
          return 0
      }
      
      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0
      }
    })

    return filtered
  }, [mockPricelistItems, searchTerm, categoryFilter, priceRangeFilter, sortBy, sortOrder])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriceChangeColor = (change: number) => {
    if (change > 0) return 'text-red-600'
    if (change < 0) return 'text-green-600'
    return 'text-gray-600'
  }

  const getPriceChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />
    if (change < 0) return <TrendingDown className="h-4 w-4" />
    return null
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" asChild>
              <Link href="/vendor-management/pricelists">
                <ChevronLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  Price list detail
                </h1>
                <Badge className={getStatusColor(mockPricelistDetail.status)}>
                  {mockPricelistDetail.status.charAt(0).toUpperCase() + mockPricelistDetail.status.slice(1)}
                </Badge>
              </div>
              <p className="text-gray-600 mt-1">{mockPricelistDetail.pricelistNumber} - {mockPricelistDetail.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/vendor-management/pricelists/${params.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </Link>
            </Button>
            
            <Button variant="default" size="sm" asChild>
              <Link href={`/vendor-management/pricelists/${params.id}/edit-new`}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Link>
            </Button>
            
            <Button variant="outline" size="sm">
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button variant="outline" size="sm">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Mark as Expired
            </Button>
            
            <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>

        {/* Detail Information */}
          <Card>
            <CardHeader>
            <CardTitle>Pricelist Information</CardTitle>
            </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Pricelist Number</div>
                <div className="font-mono font-medium text-base">{mockPricelistDetail.pricelistNumber}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Vendor</div>
                <div className="font-medium text-base">{mockPricelistDetail.vendorName}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Currency</div>
                <div className="font-medium text-base">{mockPricelistDetail.currency}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="font-medium text-base">
                  <Badge className={getStatusColor(mockPricelistDetail.status)}>
                    {mockPricelistDetail.status.charAt(0).toUpperCase() + mockPricelistDetail.status.slice(1)}
                  </Badge>
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Valid Period</div>
                <div className="font-medium text-base">
                  {new Date(mockPricelistDetail.validFrom).toLocaleDateString('en-GB')} - {new Date(mockPricelistDetail.validTo).toLocaleDateString('en-GB')}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Submitted</div>
                <div className="font-medium text-base">{new Date(mockPricelistDetail.submittedAt).toLocaleDateString()}</div>
              </div>
            </div>
            
            {/* Description - Full Width */}
            <div className="mt-6 space-y-1">
              <div className="text-sm text-muted-foreground">Description</div>
              <div className="font-medium text-sm leading-relaxed text-gray-700">{mockPricelistDetail.description}</div>
            </div>
          </CardContent>
          </Card>
      </div>

      {/* Price Items */}
      <Card>
        <CardHeader>
          <CardTitle>Price Items ({filteredItems.length})</CardTitle>
          <CardDescription>
            Detailed pricing information for each item
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product Code</TableHead>
                <TableHead>Product Name</TableHead>
                <TableHead>MOQ Pricing</TableHead>
                <TableHead>Tax ({mockPricelistDetail.taxRate}%)</TableHead>
                <TableHead>Total Amount</TableHead>
                <TableHead>Price Change</TableHead>
                <TableHead>Last Modified</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    <div className="font-mono text-sm font-medium text-blue-600">
                      {item.productCode}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{item.productName}</div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {item.pricing.map((price, index) => (
                        <div key={index} className="text-sm">
                          <span className="font-medium">{price.moq}+ {price.unit}</span>
                          <span className="mx-2">→</span>
                          <span className="font-semibold">{price.unitPrice.toFixed(2)}</span>
                          {price.leadTime && (
                            <span className="text-muted-foreground ml-2">
                              ({price.leadTime}d)
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {item.pricing.map((price, index) => {
                        const taxAmount = price.unitPrice * (mockPricelistDetail.taxRate / 100);
                        return (
                          <div key={index} className="text-sm">
                            <span className="font-medium">{taxAmount.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {item.pricing.map((price, index) => {
                        const taxAmount = price.unitPrice * (mockPricelistDetail.taxRate / 100);
                        const totalAmount = price.unitPrice + taxAmount;
                        return (
                          <div key={index} className="text-sm">
                            <span className="font-semibold text-green-600">{totalAmount.toFixed(2)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`flex items-center space-x-1 ${getPriceChangeColor(item.priceChange)}`}>
                      {getPriceChangeIcon(item.priceChange)}
                      <span className="font-medium">
                        {item.priceChange !== 0 ? `${item.priceChange > 0 ? '+' : ''}${item.priceChange.toFixed(1)}%` : 'No change'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {new Date(item.lastModified).toLocaleDateString()}
                    </div>
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
