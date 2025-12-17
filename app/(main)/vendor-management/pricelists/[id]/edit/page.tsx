'use client'

// Staff Pricelist Edit Page
// Allows purchasing staff to update vendor pricelists on behalf of vendors

import React, { useState, useEffect } from 'react'
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
  Upload,
  Download,
  User,
  AlertCircle,
  CheckCircle,
  Package
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { VendorPricelist, PricelistItem } from '../../../types'
import { mockPricelists, mockVendors, mockProducts } from '../../../lib/mock-data'
import { getCurrentUser, canEditPricelists, createAuditLog } from '../../../lib/permissions'
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
    },
    {
      id: 'item-002',
      productId: 'napkins',
      productCode: 'NK-001',
      productName: 'Cocktail Napkins',
      productDescription: 'Premium cocktail napkins',
      category: 'supplies',
      subcategory: 'disposables',
      pricing: [
        {
          id: '3',
          moq: 50,
          unit: 'packs',
          unitPrice: 15.00,
          conversionFactor: 1,
          leadTime: 3,
          notes: 'Base pricing',
          validFrom: new Date('2024-01-15'),
          validTo: new Date('2024-04-15')
        }
      ],
      currency: 'USD',
      leadTime: 3,
      notes: 'Quality napkins',
      customFieldValues: {},
      status: 'draft',
      qualityScore: 88,
      lastModified: new Date('2024-01-15')
    }
  ],
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  completionPercentage: 80,
  qualityScore: 92,
  totalItems: 2,
  completedItems: 2,
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
  },
  {
    id: 'instance-002',
    productId: 'napkins',
    displayName: 'Cocktail Napkins - Premium',
    orderUnit: 'packs'
  }
]

export default function StaffPricelistEditPage() {
  const params = useParams()
  const router = useRouter()
  const pricelistId = params.id as string
  
  // All hooks must be declared at the top before any conditional returns
  const [pricelist, setPricelist] = useState<VendorPricelist>(mockPricelistDetail)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isValidPricelist, setIsValidPricelist] = useState(false)
  
  // Handle price data updates from the new component - memoized to prevent infinite loops
  const handlePriceDataChange = React.useCallback((priceData: PricelistItem[]) => {
    setPricelist(prev => ({
      ...prev,
      items: priceData,
      totalItems: priceData.length,
      completedItems: priceData.filter(item => item.status === 'approved').length,
      updatedAt: new Date()
    }))
  }, [])

  // Handle validation status updates - memoized to prevent infinite loops  
  const handleValidationChange = React.useCallback((isValid: boolean) => {
    setIsValidPricelist(isValid)
  }, [])
  
  const currentUser = getCurrentUser()
  
  // Check permissions
  if (!canEditPricelists(currentUser)) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-600" />
            <div className="font-medium text-red-900">Access Denied</div>
            <div className="text-sm text-red-700 mt-1">
              You don&apos;t have permission to edit pricelists. Contact your administrator.
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-4"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const vendor = mockVendors.find(v => v.id === pricelist.vendorId)

  const handleUpdatePricelist = (field: keyof VendorPricelist, value: any) => {
    setPricelist(prev => ({
      ...prev,
      [field]: value,
      updatedAt: new Date()
    }))
  }

  const handleSave = async (newStatus?: 'draft' | 'submitted' | 'approved') => {
    setIsSaving(true)
    try {
      const updatedPricelist = {
        ...pricelist,
        status: newStatus || pricelist.status,
        updatedAt: new Date(),
        ...(newStatus === 'submitted' && { submittedAt: new Date() })
      }

      // Create audit log entry
      const auditLog = createAuditLog(
        currentUser,
        newStatus === 'approved' ? 'approve' : 'edit',
        'pricelist',
        pricelistId,
        {
          status: { from: pricelist.status, to: newStatus || pricelist.status }
        },
        `Staff ${newStatus === 'approved' ? 'approval' : 'edit'} on behalf of vendor`
      )
      
      console.log('Audit log:', auditLog)

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      setPricelist(updatedPricelist)

      toast({
        title: 'Success',
        description: newStatus === 'submitted' 
          ? 'Pricelist has been submitted for vendor review'
          : newStatus === 'approved'
          ? 'Pricelist has been approved'
          : 'Changes have been saved'
      })

      if (newStatus === 'submitted' || newStatus === 'approved') {
        router.push(`/vendor-management/pricelists/${pricelistId}`)
      }

    } catch (error) {
      console.error('Error saving pricelist:', error)
      toast({
        title: 'Error',
        description: 'Failed to save changes. Please try again.',
        variant: 'destructive'
      })
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
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">
                Edit Pricelist - {pricelist.pricelistNumber}
              </h1>
              <Badge className={getStatusColor(pricelist.status)}>
                {pricelist.status.charAt(0).toUpperCase() + pricelist.status.slice(1)}
              </Badge>
            </div>
            <p className="text-gray-600 mt-1">
              Staff editing on behalf of {vendor?.name || 'Unknown Vendor'}
            </p>
          </div>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Excel
          </Button>
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import Excel
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => handleSave()}
            disabled={isSaving}
          >
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>
          {pricelist.status === 'draft' && (
            <Button 
              size="sm"
              onClick={() => handleSave('submitted')}
              disabled={isSaving || !isValidPricelist}
            >
              Submit for Review
            </Button>
          )}
          {pricelist.status === 'submitted' && (
            <Button 
              size="sm"
              onClick={() => handleSave('approved')}
              disabled={isSaving}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
          )}
        </div>
      </div>

      {/* Staff Action Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <User className="h-5 w-5 text-blue-600" />
            <div>
              <div className="font-medium text-blue-900">Staff Override Mode</div>
              <div className="text-sm text-blue-700">
                You are editing this pricelist on behalf of the vendor. All changes will be logged for audit purposes.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricelist Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="pricelistNumber">Pricelist Number</Label>
              <Input
                id="pricelistNumber"
                value={pricelist.pricelistNumber}
                onChange={(e) => handleUpdatePricelist('pricelistNumber', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select 
                value={pricelist.currency} 
                onValueChange={(value) => handleUpdatePricelist('currency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="BHT">BHT</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="CNY">CNY</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={pricelist.status} 
                onValueChange={(value) => handleUpdatePricelist('status', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="submitted">Submitted</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Validity Period</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="validFrom">Valid From</Label>
              <Input
                id="validFrom"
                type="date"
                value={pricelist.validFrom.toISOString().split('T')[0]}
                onChange={(e) => handleUpdatePricelist('validFrom', new Date(e.target.value))}
              />
            </div>
            <div>
              <Label htmlFor="validTo">Valid To</Label>
              <Input
                id="validTo"
                type="date"
                value={pricelist.validTo.toISOString().split('T')[0]}
                onChange={(e) => handleUpdatePricelist('validTo', new Date(e.target.value))}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Vendor Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Vendor:</span>
              <span className="font-medium">{vendor?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contact:</span>
              <span className="font-medium">{vendor?.contactEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Rating:</span>
              <span className="font-medium">{vendor?.performanceMetrics?.qualityScore || 0}/5</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Product Pricing Section */}
      <PricelistProductEditingComponent
        preSelectedProducts={mockPreSelectedProducts}
        existingPriceData={pricelist.items}
        currency={pricelist.currency}
        onPriceDataChange={handlePriceDataChange}
        onValidationChange={handleValidationChange}
        readonly={pricelist.status === 'approved'}
        allowProductSelection={true}
      />
    </div>
  )
}