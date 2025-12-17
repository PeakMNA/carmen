'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import { 
  Search, 
  Filter, 
  Download,
  Plus,
  List,
  Grid,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  Copy
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { mockPricelists, mockCampaigns, mockVendors } from '@/lib/mock-data'
import { formatDate } from '@/lib/utils'

// Helper function to get campaign name
const getCampaignName = (campaignId: string) => {
  const campaign = mockCampaigns.find(c => c.id === campaignId)
  return campaign ? campaign.name : 'N/A'
}

// Helper function to get vendor name
const getVendorName = (vendorId: string) => {
  const vendor = mockVendors.find(v => v.id === vendorId)
  return vendor ? vendor.companyName : 'Unknown Vendor'
}

const mockPricelistsLegacy = [
  {
    id: 'pl-001',
    pricelistNumber: 'PL-2410-001',
    vendorName: 'Fresh Foods Co.',
    vendorId: 'vendor-001',
    name: 'Q2 2024 Standard Pricing',
    status: 'active',
    currency: 'USD',
    itemCount: 245,
    totalValue: 125450.75,
    taxProfile: 'VAT',
    taxRate: 7,
    validFrom: '2024-04-01',
    validTo: '2024-06-30',
    lastUpdated: '2024-05-15',
    categories: ['Beach Equipment', 'Furniture', 'Linens', 'Amenities']
  },
  {
    id: 'pl-002',
    pricelistNumber: 'PL-2410-002',
    vendorName: 'Premium Beverages Ltd.',
    vendorId: 'vendor-002',
    name: 'Summer Sale 2024',
    status: 'active',
    currency: 'USD',
    itemCount: 156,
    totalValue: 89320.50,
    taxProfile: 'None VAT',
    taxRate: 0,
    validFrom: '2024-06-01',
    validTo: '2024-08-31',
    lastUpdated: '2024-06-01',
    categories: ['Beach Equipment', 'Outdoor Furniture']
  },
  {
    id: 'pl-003',
    pricelistNumber: 'PL-2410-003',
    vendorName: 'Hotel Supplies Inc.',
    vendorId: 'vendor-003',
    name: 'Q1 2024 Pricing',
    status: 'expired',
    currency: 'USD',
    itemCount: 238,
    totalValue: 118900.25,
    taxProfile: 'VAT',
    taxRate: 7,
    validFrom: '2024-01-01',
    validTo: '2024-03-31',
    lastUpdated: '2024-03-31',
    categories: ['Beach Equipment', 'Furniture', 'Linens', 'Amenities', 'Maintenance']
  },
  {
    id: 'pl-004',
    pricelistNumber: 'PL-2410-004',
    vendorName: 'Outdoor Living Co.',
    vendorId: 'vendor-004',
    name: 'Q3 2024 Draft Pricing',
    status: 'draft',
    currency: 'USD',
    itemCount: 267,
    totalValue: 135780.00,
    taxProfile: 'VAT',
    taxRate: 7,
    validFrom: '2024-07-01',
    validTo: '2024-09-30',
    lastUpdated: '2024-06-10',
    categories: ['Beach Equipment', 'Furniture', 'Linens', 'Amenities', 'Seasonal']
  }
]

// Transform centralized data to legacy format for display
const transformedPricelists = mockPricelists.map(pricelist => ({
  id: pricelist.id,
  pricelistNumber: pricelist.priceListCode,
  vendorName: getVendorName(pricelist.vendorId),
  vendorId: pricelist.vendorId,
  campaignId: undefined,
  campaignName: undefined,
  name: `${pricelist.priceListName}`,
  status: pricelist.status,
  currency: pricelist.currency,
  itemCount: pricelist.totalItems || 0,
  totalValue: (pricelist.totalItems || 0) * 100, // Mock calculation
  taxProfile: 'VAT',
  taxRate: 7,
  validFrom: formatDate(pricelist.effectiveStartDate),
  validTo: pricelist.effectiveEndDate ? formatDate(pricelist.effectiveEndDate) : 'N/A',
  lastUpdated: pricelist.approvedAt ? formatDate(pricelist.approvedAt) : 'N/A',
  categories: ['Equipment', 'Supplies'] // Mock categories
}))

export default function PriceListsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [vendorFilter, setVendorFilter] = useState('all')
  const [pricelists, setPricelists] = useState(transformedPricelists)
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')

  const filteredPricelists = pricelists.filter(pricelist => {
    const matchesSearch = pricelist.pricelistNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pricelist.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         pricelist.vendorName.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || pricelist.status === statusFilter
    const matchesVendor = vendorFilter === 'all' || pricelist.vendorId === vendorFilter

    return matchesSearch && matchesStatus && matchesVendor
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCopyPricelist = async (pricelist: any) => {
    try {
      const currentDate = new Date()
      const timestamp = Date.now().toString().slice(-6)
      
      const copiedPricelist = {
        ...pricelist,
        id: `pl-copy-${timestamp}`,
        pricelistNumber: '', // No PL number for draft copies
        name: `Copy of ${pricelist.name}`,
        status: 'draft',
        validFrom: currentDate.toISOString().split('T')[0],
        validTo: new Date(currentDate.getTime() + (90 * 24 * 60 * 60 * 1000)).toISOString().split('T')[0], // 90 days from now
        lastUpdated: currentDate.toISOString().split('T')[0],
        submittedAt: undefined,
        approvedAt: undefined,
        rejectedAt: undefined,
        rejectionReason: undefined,
        approvedBy: undefined
      }

      // Store the copied data in sessionStorage for the new page
      sessionStorage.setItem('copiedPricelistData', JSON.stringify(copiedPricelist))
      
      // Navigate to add pricelist page with copied data
      router.push('/vendor-management/pricelists/add')
      
      toast.success('Opening copy in edit mode...', {
        description: `Copying "${pricelist.name}" to new pricelist`
      })
      
    } catch (error) {
      console.error('Error copying pricelist:', error)
      toast.error('Failed to copy pricelist', {
        description: 'An error occurred while copying the pricelist. Please try again.'
      })
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const renderCardView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPricelists.map((pricelist) => (
        <Card key={pricelist.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg font-semibold mb-2">{pricelist.name}</CardTitle>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getStatusColor(pricelist.status)}>
                    {pricelist.status.charAt(0).toUpperCase() + pricelist.status.slice(1)}
                  </Badge>
                  <Badge variant="outline">
                    {pricelist.currency}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href={`/vendor-management/pricelists/${pricelist.id}`} className="flex items-center w-full">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/vendor-management/pricelists/${pricelist.id}/edit-new`} className="flex items-center w-full">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleCopyPricelist(pricelist)}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Mark as Expired
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-3">
              <div className="text-sm">
                <div className="font-medium text-muted-foreground">Pricelist Number</div>
                <div className="font-mono text-blue-600">
                  {pricelist.pricelistNumber || (
                    <span className="text-gray-400 italic">Draft - No PL Number</span>
                  )}
                </div>
              </div>
              
              <div className="text-sm">
                <div className="font-medium text-muted-foreground">Vendor</div>
                <div className="font-medium">{pricelist.vendorName}</div>
              </div>
              
              <div className="text-sm">
                <div className="font-medium text-muted-foreground">Campaign</div>
                <Link 
                  href={`/vendor-management/campaigns/${pricelist.campaignId}`}
                  className="font-medium hover:text-blue-600 transition-colors"
                >
                  {pricelist.campaignName}
                </Link>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground">Items</div>
                  <div className="font-semibold">{pricelist.itemCount}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Tax Rate</div>
                  <div>{pricelist.taxRate}%</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="font-medium text-muted-foreground">Valid From</div>
                  <div>{formatDate(pricelist.validFrom)}</div>
                </div>
                <div>
                  <div className="font-medium text-muted-foreground">Valid To</div>
                  <div>{formatDate(pricelist.validTo)}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <span>{pricelist.categories.length} categories</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Updated {formatDate(pricelist.lastUpdated)}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )

  return (
    <div className="p-8">
      {/* Price Lists Card with Header */}
      <Card>
        <CardHeader className="space-y-6">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">Price List</CardTitle>
              <CardDescription className="text-sm text-gray-600">Manage vendor price submissions and active pricing</CardDescription>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button size="sm" asChild className="bg-blue-600 hover:bg-blue-700">
                <Link href="/vendor-management/pricelists/add">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Pricelist
                </Link>
              </Button>
            </div>
          </div>

          {/* Search and Filters Row */}
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Left Side - Search and Basic Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center flex-1">
              {/* Search Input */}
              <div className="flex-1 max-w-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by pricelist number, name, or vendor..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Basic Filter Dropdowns */}
              <div className="flex gap-2 items-center">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={vendorFilter} onValueChange={setVendorFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="All Vendors" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Vendors</SelectItem>
                    <SelectItem value="vendor-001">Fresh Foods Co.</SelectItem>
                    <SelectItem value="vendor-002">Premium Beverages Ltd.</SelectItem>
                    <SelectItem value="vendor-003">Hotel Supplies Inc.</SelectItem>
                    <SelectItem value="vendor-004">Outdoor Living Co.</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Right Side - Action Buttons and View Toggle */}
            <div className="flex gap-2 items-center">
              <Button variant="outline" size="sm">
                Saved Filters
              </Button>

              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Add Filters
              </Button>

              {/* View Toggle */}
              <div className="flex border rounded-lg">
                <Button 
                  variant={viewMode === 'table' ? 'default' : 'ghost'} 
                  size="sm" 
                  className="border-r"
                  onClick={() => setViewMode('table')}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button 
                  variant={viewMode === 'card' ? 'default' : 'ghost'} 
                  size="sm"
                  onClick={() => setViewMode('card')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPricelists.length === 0 ? (
            <div className="p-12 text-center">
              <div className="h-12 w-12 mx-auto text-muted-foreground mb-4">
                <List className="h-12 w-12" />
              </div>
              <h3 className="text-lg font-medium mb-2">No pricelists found</h3>
              <p className="text-muted-foreground mb-4">
                No pricelists match your current filters.
              </p>
            </div>
          ) : viewMode === 'table' ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Pricelist Number</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Tax Profile & Rate</TableHead>
                  <TableHead>Valid Period</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPricelists.map((pricelist) => (
                  <TableRow key={pricelist.id}>
                    <TableCell>
                      <div className="font-mono text-sm font-medium text-blue-600">
                        {pricelist.pricelistNumber || (
                          <span className="text-gray-400 italic">Draft - No PL Number</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{pricelist.vendorName}</div>
                        <div className="text-sm text-muted-foreground">
                          {pricelist.categories.length} categories
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <Link 
                          href={`/vendor-management/campaigns/${pricelist.campaignId}`}
                          className="font-medium hover:text-blue-600 transition-colors"
                        >
                          {pricelist.campaignName}
                        </Link>
                        <div className="text-sm text-muted-foreground">
                          Campaign origin
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{pricelist.name}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(pricelist.status)}>
                        {pricelist.status.charAt(0).toUpperCase() + pricelist.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-semibold">{pricelist.itemCount}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-center">
                        <div className="font-semibold">{pricelist.taxProfile}</div>
                        <div className="text-xs text-muted-foreground">
                          {pricelist.taxRate}% rate
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{new Date(pricelist.validFrom).toLocaleDateString()}</div>
                        <div className="text-muted-foreground">
                          to {new Date(pricelist.validTo).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {new Date(pricelist.lastUpdated).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem asChild>
                            <Link href={`/vendor-management/pricelists/${pricelist.id}`} className="flex items-center w-full">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/vendor-management/pricelists/${pricelist.id}/edit-new`} className="flex items-center w-full">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyPricelist(pricelist)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Download className="h-4 w-4 mr-2" />
                            Export
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Mark as Expired
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            renderCardView()
          )}
        </CardContent>
      </Card>
    </div>
  )
}