'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
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
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Trash2,
  ArrowLeft,
  Search,
  Plus,
  X,
  Upload,
  Camera,
  AlertTriangle,
  Package,
  DollarSign,
  Calendar,
  FileText,
  Save,
  Send,
  Image as ImageIcon,
} from 'lucide-react'

// Mock data for inventory items
const inventoryItems = [
  { id: '1', code: 'BEV-001', name: 'Thai Milk Tea Powder', category: 'Beverages', unit: 'Box', unitCost: 45.99, currentStock: 25, batchNumber: 'BTH-2024-001234', expiryDate: '2024-03-15' },
  { id: '2', code: 'BEV-002', name: 'Premium Coffee Beans', category: 'Beverages', unit: 'Bag', unitCost: 28.50, currentStock: 45, batchNumber: 'BTH-2024-001235', expiryDate: '2024-06-20' },
  { id: '3', code: 'LIQ-001', name: 'Vodka Premium', category: 'Spirits', unit: 'Bottle', unitCost: 85.00, currentStock: 18, batchNumber: 'BTH-2024-001240', expiryDate: null },
  { id: '4', code: 'LIQ-003', name: 'Orange Juice Fresh', category: 'Beverages', unit: 'Liter', unitCost: 8.50, currentStock: 60, batchNumber: 'BTH-2024-001250', expiryDate: '2024-01-20' },
  { id: '5', code: 'MTT-001', name: 'Wagyu Beef Premium', category: 'Meat & Poultry', unit: 'Kg', unitCost: 185.00, currentStock: 12, batchNumber: 'WGY-2024-00567', expiryDate: '2024-01-18' },
  { id: '6', code: 'SEA-001', name: 'Fresh Salmon Fillet', category: 'Seafood', unit: 'Kg', unitCost: 45.00, currentStock: 15, batchNumber: 'BTH-2024-001260', expiryDate: '2024-01-17' },
  { id: '7', code: 'VEG-005', name: 'Mixed Salad Greens', category: 'Vegetables', unit: 'Kg', unitCost: 12.00, currentStock: 20, batchNumber: 'BTH-2024-001270', expiryDate: '2024-01-16' },
  { id: '8', code: 'BAK-002', name: 'Croissants Butter', category: 'Bakery', unit: 'Piece', unitCost: 3.50, currentStock: 100, batchNumber: 'BTH-2024-001280', expiryDate: '2024-01-15' },
  { id: '9', code: 'DRY-004', name: 'Flour All Purpose', category: 'Dry Goods', unit: 'Kg', unitCost: 4.50, currentStock: 80, batchNumber: 'BTH-2024-001290', expiryDate: '2024-06-30' },
  { id: '10', code: 'DRY-006', name: 'Sugar White', category: 'Dry Goods', unit: 'Kg', unitCost: 2.50, currentStock: 120, batchNumber: 'BTH-2024-001300', expiryDate: '2025-01-15' },
]

// Wastage reasons
const wastageReasons = [
  { id: 'expiration', label: 'Expiration', description: 'Product past expiry date' },
  { id: 'spoilage', label: 'Spoilage', description: 'Product spoiled or rotted' },
  { id: 'damage', label: 'Damage', description: 'Physical damage to product' },
  { id: 'quality', label: 'Quality Issues', description: 'Quality not meeting standards' },
  { id: 'contamination', label: 'Contamination', description: 'Product contaminated' },
  { id: 'overproduction', label: 'Overproduction', description: 'Excess production waste' },
  { id: 'other', label: 'Other', description: 'Other reasons' },
]

interface WastageItem {
  id: string
  code: string
  name: string
  category: string
  unit: string
  unitCost: number
  quantity: number
  batchNumber: string
  expiryDate: string | null
  reason: string
  notes: string
}

export default function NewWastageReportPage() {
  const [location, setLocation] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [wastageItems, setWastageItems] = useState<WastageItem[]>([])
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; size: string }>>([])

  // Filter inventory items
  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.code.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
      // Exclude items already added
      const notAdded = !wastageItems.find(w => w.id === item.id)
      return matchesSearch && matchesCategory && notAdded
    })
  }, [searchQuery, categoryFilter, wastageItems])

  // Add item to wastage list
  const addItem = (item: typeof inventoryItems[0]) => {
    setWastageItems([...wastageItems, {
      ...item,
      quantity: 1,
      reason: '',
      notes: '',
    }])
  }

  // Remove item from wastage list
  const removeItem = (id: string) => {
    setWastageItems(wastageItems.filter(item => item.id !== id))
  }

  // Update item quantity
  const updateItemQuantity = (id: string, quantity: number) => {
    setWastageItems(wastageItems.map(item =>
      item.id === id ? { ...item, quantity: Math.max(1, quantity) } : item
    ))
  }

  // Update item reason
  const updateItemReason = (id: string, reason: string) => {
    setWastageItems(wastageItems.map(item =>
      item.id === id ? { ...item, reason } : item
    ))
  }

  // Update item notes
  const updateItemNotes = (id: string, notes: string) => {
    setWastageItems(wastageItems.map(item =>
      item.id === id ? { ...item, notes } : item
    ))
  }

  // Calculate totals
  const totals = useMemo(() => {
    return {
      items: wastageItems.length,
      quantity: wastageItems.reduce((sum, item) => sum + item.quantity, 0),
      value: wastageItems.reduce((sum, item) => sum + (item.quantity * item.unitCost), 0),
    }
  }, [wastageItems])

  // Get unique categories
  const categories = [...new Set(inventoryItems.map(item => item.category))]

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
              New Wastage Report
            </h1>
            <p className="text-muted-foreground">
              Record wastage items and submit for approval
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Location Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Report Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Select value={location} onValueChange={setLocation}>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main-kitchen">Main Kitchen</SelectItem>
                      <SelectItem value="pool-bar">Pool Bar</SelectItem>
                      <SelectItem value="rooftop-restaurant">Rooftop Restaurant</SelectItem>
                      <SelectItem value="lobby-cafe">Lobby Café</SelectItem>
                      <SelectItem value="banquet-hall">Banquet Hall</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date">Report Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="date"
                      type="date"
                      className="pl-10"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Item Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Add Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Search items by name or code..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Available Items */}
                <div className="border rounded-lg max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead>Item</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right">Unit Cost</TableHead>
                        <TableHead className="text-center">Stock</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{item.name}</p>
                              <p className="text-xs text-muted-foreground">{item.code}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{item.category}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            ${item.unitCost.toFixed(2)}
                          </TableCell>
                          <TableCell className="text-center">
                            {item.currentStock} {item.unit}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => addItem(item)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No items found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Wastage Items */}
          {wastageItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5 text-red-600" />
                  Wastage Items ({wastageItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {wastageItems.map((item, index) => (
                    <div key={item.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {item.code} • {item.category} • ${item.unitCost.toFixed(2)}/{item.unit}
                          </p>
                          {item.expiryDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Batch: {item.batchNumber} • Expires: {item.expiryDate}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => removeItem(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-2">
                          <Label>Quantity *</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 1)}
                              className="w-24"
                            />
                            <span className="text-muted-foreground">{item.unit}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Reason *</Label>
                          <Select
                            value={item.reason}
                            onValueChange={(value) => updateItemReason(item.id, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select reason" />
                            </SelectTrigger>
                            <SelectContent>
                              {wastageReasons.map(reason => (
                                <SelectItem key={reason.id} value={reason.id}>
                                  {reason.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex items-end">
                          <div className="text-right">
                            <p className="text-sm text-muted-foreground">Loss Value</p>
                            <p className="text-lg font-bold text-red-600">
                              ${(item.quantity * item.unitCost).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Notes</Label>
                        <Textarea
                          placeholder="Add notes about this wastage..."
                          value={item.notes}
                          onChange={(e) => updateItemNotes(item.id, e.target.value)}
                          rows={2}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Attachments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Camera className="h-5 w-5" />
                Attachments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm font-medium">Drag and drop files here</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    or click to browse (images, PDFs up to 10MB)
                  </p>
                  <Button variant="outline" className="mt-4">
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Files
                  </Button>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <ImageIcon className="h-5 w-5 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-muted-foreground">{file.size}</p>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-600">
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  Tip: Add photos of wasted items as evidence for approval
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Summary */}
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="sticky top-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Report Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Location</span>
                  <span className="font-medium">
                    {location ? location.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'Not selected'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Items</span>
                  <span className="font-medium">{totals.items}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Quantity</span>
                  <span className="font-medium">{totals.quantity} units</span>
                </div>
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Loss</span>
                <span className="text-2xl font-bold text-red-600">
                  ${totals.value.toFixed(2)}
                </span>
              </div>

              {totals.value > 100 && (
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                  <AlertDescription className="text-yellow-800 text-xs">
                    Reports over $100 require manager approval
                  </AlertDescription>
                </Alert>
              )}

              <Separator />

              <div className="space-y-2">
                <Button
                  className="w-full bg-red-600 hover:bg-red-700"
                  disabled={wastageItems.length === 0 || !location}
                >
                  <Send className="mr-2 h-4 w-4" />
                  Submit Report
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  disabled={wastageItems.length === 0}
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save as Draft
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Submitted reports will be reviewed by the manager
              </p>
            </CardContent>
          </Card>

          {/* Quick Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>• Select the correct location where wastage occurred</p>
              <p>• Add all wasted items with accurate quantities</p>
              <p>• Choose the appropriate reason for each item</p>
              <p>• Upload photos as evidence for faster approval</p>
              <p>• High-value items ($100+) require manager review</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
