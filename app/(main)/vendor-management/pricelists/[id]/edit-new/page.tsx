'use client'

// Enhanced Edit Pricelist Page
// Modern form-based approach similar to the Add form

import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { 
  ChevronLeft,
  Save,
  Plus,
  Trash2,
  User,
  AlertCircle,
  Package,
  DollarSign,
  CheckCircle,
  Download,
  Upload
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { VendorPricelist, PricelistItem, MOQPricing } from '../../../types'
import { mockVendors } from '../../../lib/mock-data'
import { ProductInstance } from '../../../types'
import PricelistProductEditingComponent from '../../components/PricelistProductEditingComponent'

// Mock pricelist data for editing
const mockPricelistDetail: VendorPricelist = {
  id: 'pl-001',
  pricelistNumber: 'PL-2410-001',
  vendorId: 'vendor-001',
  campaignId: 'campaign-001',
  templateId: 'template-001',
  invitationId: 'inv-001',
  currency: 'USD',
  status: 'draft',
  validFrom: new Date('2024-04-01'),
  validTo: new Date('2024-06-30'),
  submittedAt: undefined,
  items: [
    {
      id: 'item-001',
      productId: 'paper-towels',
      productCode: 'PT-001',
      productName: 'Paper Towels',
      productDescription: 'Commercial grade paper towels',
      category: 'supplies',
      subcategory: 'disposables',
      pricing: [
        {
          id: '1',
          moq: 24,
          unit: 'pieces',
          unitPrice: 25.00,
          conversionFactor: 1,
          leadTime: 2,
          notes: 'Standard pricing',
          validFrom: new Date('2024-01-15'),
          validTo: new Date('2024-04-15')
        },
        {
          id: '2',
          moq: 120,
          unit: 'pieces',
          unitPrice: 22.50,
          conversionFactor: 1,
          leadTime: 2,
          notes: 'Volume discount',
          validFrom: new Date('2024-01-15'),
          validTo: new Date('2024-04-15')
        }
      ],
      currency: 'USD',
      leadTime: 2,
      notes: 'Fast delivery available',
      customFieldValues: {},
      status: 'draft',
      qualityScore: 95,
      lastModified: new Date('2024-01-15')
    }
  ],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  completionPercentage: 80,
  qualityScore: 92,
  totalItems: 1,
  completedItems: 1,
  lastAutoSave: new Date('2024-01-15'),
  submissionNotes: '',
  version: 1
}

// Mock pre-selected products from template (would come from template data)
const mockPreSelectedProducts: ProductInstance[] = [
  {
    id: 'instance-001',
    productId: 'paper-towels',
    displayName: 'Paper Towels - Commercial Grade',
    orderUnit: 'pieces'
  }
]

interface EditPricelistFormData {
  pricelistNumber: string
  vendorId: string
  currency: string
  validFrom: string
  validTo: string
  submissionNotes: string
  description?: string
  name?: string
  status: string
  items: PricelistItem[]
}

export default function EditPricelistPage() {
  const params = useParams()
  const router = useRouter()
  const pricelistId = params.id as string
  
  const [formData, setFormData] = useState<EditPricelistFormData>({
    pricelistNumber: mockPricelistDetail.pricelistNumber,
    vendorId: mockPricelistDetail.vendorId,
    currency: mockPricelistDetail.currency,
    validFrom: mockPricelistDetail.validFrom.toISOString().split('T')[0],
    validTo: mockPricelistDetail.validTo.toISOString().split('T')[0],
    submissionNotes: mockPricelistDetail.submissionNotes || '',
    description: '',
    status: mockPricelistDetail.status,
    items: mockPricelistDetail.items
  })
  
  const [isSaving, setIsSaving] = useState(false)
  const [isValidPricelist, setIsValidPricelist] = useState(false)

  const selectedVendor = mockVendors.find(v => v.id === formData.vendorId)

  const updateFormData = (field: keyof EditPricelistFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Handle price data updates from the new component - memoized to prevent infinite loops
  const handlePriceDataChange = React.useCallback((priceData: PricelistItem[]) => {
    setFormData(prev => ({
      ...prev,
      items: priceData
    }))
  }, [])

  // Handle validation status updates - memoized to prevent infinite loops  
  const handleValidationChange = React.useCallback((isValid: boolean) => {
    setIsValidPricelist(isValid)
  }, [])

  const handleSave = async (newStatus?: 'draft' | 'submitted' | 'approved') => {
    if (!formData.vendorId) {
      toast.error('Please select a vendor')
      return
    }

    if (!formData.validFrom || !formData.validTo) {
      toast.error('Please set validity dates')
      return
    }

    setIsSaving(true)
    try {
      const updatedPricelist: Partial<VendorPricelist> = {
        id: pricelistId,
        pricelistNumber: formData.pricelistNumber,
        vendorId: formData.vendorId,
        currency: formData.currency,
        status: newStatus || formData.status as 'draft' | 'submitted' | 'approved' | 'rejected' | 'expired',
        validFrom: new Date(formData.validFrom),
        validTo: new Date(formData.validTo),
        submissionNotes: formData.submissionNotes,
        items: formData.items,
        updatedAt: new Date(),
        completionPercentage: Math.round((formData.items.length / Math.max(formData.items.length, 1)) * 100),
        qualityScore: 85,
        totalItems: formData.items.length,
        completedItems: formData.items.length,
        version: mockPricelistDetail.version + 1,
        ...(newStatus === 'submitted' && { submittedAt: new Date() })
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast.success(newStatus === 'submitted' 
        ? 'Pricelist has been submitted' 
        : newStatus === 'approved'
        ? 'Pricelist has been approved'
        : 'Changes have been saved')
      
      // Optionally redirect if status changed
      if (newStatus === 'submitted' || newStatus === 'approved') {
        router.push(`/vendor-management/pricelists/${pricelistId}`)
      }

    } catch (error) {
      console.error('Error saving pricelist:', error)
      toast.error('Failed to save changes. Please try again')
    } finally {
      setIsSaving(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'submitted': return 'bg-blue-100 text-blue-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-3xl font-bold text-gray-900">
                  Edit Pricelist
                </h1>
                <Badge className={getStatusColor(formData.status)}>
                  {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
                </Badge>
              </div>
              <p className="text-gray-600 mt-1">{formData.pricelistNumber} - {formData.name}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
            
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => handleSave()}
              disabled={isSaving}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Draft
            </Button>
            
            <Button 
              variant="default" 
              size="sm"
              onClick={() => handleSave('submitted')}
              disabled={isSaving || !isValidPricelist}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Submit
            </Button>
          </div>
        </div>

        {/* Editable Pricelist Information */}
        <Card>
          <CardHeader>
            <CardTitle>Pricelist Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Pricelist Number */}
              <div className="space-y-2">
                <Label htmlFor="pricelistNumber">Pricelist Number</Label>
                <Input
                  id="pricelistNumber"
                  value={formData.pricelistNumber}
                  onChange={(e) => updateFormData('pricelistNumber', e.target.value)}
                  placeholder="Enter pricelist number"
                  className="font-mono"
                />
              </div>

              {/* Vendor Selection */}
              <div className="space-y-2">
                <Label htmlFor="vendor">Vendor</Label>
                <Select value={formData.vendorId} onValueChange={(value) => updateFormData('vendorId', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockVendors.map((vendor) => (
                      <SelectItem key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Currency Selection */}
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => updateFormData('currency', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                    <SelectItem value="GBP">GBP - British Pound</SelectItem>
                    <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                    <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
                    <SelectItem value="JPY">JPY - Japanese Yen</SelectItem>
                    <SelectItem value="CHF">CHF - Swiss Franc</SelectItem>
                    <SelectItem value="CNY">CNY - Chinese Yuan</SelectItem>
                    <SelectItem value="THB">THB - Thai Baht</SelectItem>
                    <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status - Draft Selection or Active/Inactive Toggle */}
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                {formData.status === 'draft' ? (
                  <Select value={formData.status} onValueChange={(value) => updateFormData('status', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submit for Review</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center space-x-3 p-3 border rounded-md">
                    <Switch
                      id="status-toggle"
                      checked={formData.status === 'active'}
                      onCheckedChange={(checked) => 
                        updateFormData('status', checked ? 'active' : 'inactive')
                      }
                    />
                    <Label htmlFor="status-toggle" className="text-sm font-medium cursor-pointer">
                      {formData.status === 'active' ? 'Active' : 'Inactive'}
                    </Label>
                  </div>
                )}
              </div>

              {/* Valid Period - Condensed */}
              <div className="space-y-2">
                <Label>Valid Period</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => updateFormData('validFrom', e.target.value)}
                    className="flex-1"
                  />
                  <span className="text-muted-foreground text-sm">to</span>
                  <Input
                    id="validTo"
                    type="date"
                    value={formData.validTo}
                    onChange={(e) => updateFormData('validTo', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Submitted Date */}
              <div className="space-y-2">
                <Label htmlFor="submittedDate">Submitted</Label>
                <Input
                  id="submittedDate"
                  type="date"
                  value={mockPricelistDetail.submittedAt ? new Date(mockPricelistDetail.submittedAt).toISOString().split('T')[0] : ''}
                  className="bg-gray-50"
                  readOnly
                />
              </div>
            </div>

            {/* Description - Full Width */}
            <div className="mt-6 space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description || ''}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Enter pricelist description..."
                rows={3}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Notice */}
      {formData.status === 'submitted' && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">Pricelist Submitted</div>
                <div className="text-sm text-blue-700">
                  This pricelist has been submitted for review. Changes will require re-approval.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}




      {/* Product Pricing Section */}
      <PricelistProductEditingComponent
        preSelectedProducts={mockPreSelectedProducts}
        existingPriceData={formData.items}
        currency={formData.currency}
        onPriceDataChange={handlePriceDataChange}
        onValidationChange={handleValidationChange}
        readonly={formData.status === 'approved'}
        allowProductSelection={false}
      />
    </div>
  )
}