'use client'

// Staff Pricelist Creation Page
// Allows purchasing staff to create new pricelists on behalf of vendors

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  ChevronLeft,
  ArrowRight,
  FileText,
  Users,
  Package,
  Settings,
  CheckCircle,
  Search,
  Plus,
  Upload,
  Copy,
  User
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { mockTemplates, mockVendors, mockCampaigns } from '../../lib/mock-data'
import { VendorPricelist, PricelistTemplate } from '../../types'

function NewStaffPricelistPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const vendorId = searchParams.get('vendorId')
  const campaignId = searchParams.get('campaignId')
  const templateId = searchParams.get('templateId')
  
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    pricelistNumber: '',
    vendorId: vendorId || '',
    campaignId: campaignId || '',
    templateId: templateId || '',
    currency: 'USD',
    validFrom: '',
    validTo: '',
    submissionNotes: '',
    creationType: 'template', // 'template', 'manual', 'import'
    selectedProducts: [] as string[]
  })
  
  const [vendorSearchTerm, setVendorSearchTerm] = useState('')
  const [templateSearchTerm, setTemplateSearchTerm] = useState('')

  const steps = [
    { id: 1, title: 'Basic Information', icon: FileText },
    { id: 2, title: 'Vendor Selection', icon: Users },
    { id: 3, title: 'Creation Method', icon: Settings },
    { id: 4, title: 'Configuration', icon: Package },
    { id: 5, title: 'Review & Create', icon: CheckCircle }
  ]

  // Auto-populate if coming from vendor or campaign pages, or copied data
  useEffect(() => {
    // Check for copied pricelist data
    const copiedData = sessionStorage.getItem('copiedPricelistData')
    if (copiedData) {
      try {
        const parsed = JSON.parse(copiedData)
        setFormData(prev => ({
          ...prev,
          pricelistNumber: '', // Clear PL number for copy
          vendorId: parsed.vendorId || '',
          currency: parsed.currency || 'USD',
          validFrom: parsed.validFrom || '',
          validTo: parsed.validTo || '',
          submissionNotes: `Copied from pricelist: ${parsed.pricelistNumber || 'Original'}`,
          creationType: 'manual' // Set to manual for copied data
        }))
        
        // Clear the session storage after use
        sessionStorage.removeItem('copiedPricelistData')
        
        // Show success message
        toast({
          title: 'Pricelist Data Copied',
          description: `Pre-populated form with data from "${parsed.name}"`
        })
        
        return // Skip other auto-population if we have copied data
      } catch (error) {
        console.error('Error parsing copied data:', error)
        sessionStorage.removeItem('copiedPricelistData')
      }
    }
    
    // Original auto-population logic
    if (vendorId) {
      const vendor = mockVendors.find(v => v.id === vendorId)
      if (vendor) {
        setFormData(prev => ({
          ...prev,
          currency: vendor.preferredCurrency
        }))
      }
    }
    if (campaignId && !templateId) {
      const campaign = mockCampaigns.find(c => c.id === campaignId)
      if (campaign) {
        setFormData(prev => ({
          ...prev,
          templateId: campaign.templateId
        }))
      }
    }
  }, [vendorId, campaignId, templateId])

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    try {
      // Generate pricelist number if not provided
      const pricelistNumber = formData.pricelistNumber || `PL-${Date.now()}`
      
      const newPricelist: Partial<VendorPricelist> = {
        pricelistNumber,
        vendorId: formData.vendorId,
        campaignId: formData.campaignId || undefined,
        templateId: formData.templateId || undefined,
        currency: formData.currency,
        status: 'draft',
        validFrom: new Date(formData.validFrom),
        validTo: new Date(formData.validTo),
        submissionNotes: formData.submissionNotes,
        items: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        completionPercentage: 0,
        qualityScore: 0,
        totalItems: 0,
        completedItems: 0,
        version: 1
      }

      // Simulate API call
      console.log('Creating staff pricelist:', newPricelist)
      
      // For demo purposes, redirect to edit page
      const pricelistId = `pl-${Date.now()}`
      
      toast({
        title: 'Success',
        description: 'Pricelist created successfully. Redirecting to edit page...'
      })
      
      // Redirect to edit page
      setTimeout(() => {
        router.push(`/vendor-management/pricelists/${pricelistId}/edit-new`)
      }, 1000)

    } catch (error) {
      console.error('Error creating pricelist:', error)
      toast({
        title: 'Error',
        description: 'Failed to create pricelist. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return formData.pricelistNumber.trim().length > 0
      case 2: return formData.vendorId.length > 0
      case 3: return formData.creationType.length > 0
      case 4: return formData.validFrom && formData.validTo && formData.currency
      case 5: return true
      default: return false
    }
  }

  const getFilteredVendors = () => {
    return mockVendors.filter(vendor =>
      vendor.name.toLowerCase().includes(vendorSearchTerm.toLowerCase()) ||
      vendor.contactEmail.toLowerCase().includes(vendorSearchTerm.toLowerCase())
    )
  }

  const getFilteredTemplates = () => {
    return mockTemplates.filter(template =>
      template.name.toLowerCase().includes(templateSearchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(templateSearchTerm.toLowerCase())
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <div className="font-medium text-blue-900">Staff Creation Mode</div>
                  <div className="text-sm text-blue-700">
                    You are creating a pricelist on behalf of a vendor. This action will be logged for audit purposes.
                  </div>
                </div>
              </div>
            </div>

            <div>
              <Label htmlFor="pricelistNumber">Pricelist Number *</Label>
              <Input
                id="pricelistNumber"
                placeholder="Enter pricelist number (e.g., PL-2410-001)"
                value={formData.pricelistNumber}
                onChange={(e) => updateFormData('pricelistNumber', e.target.value)}
              />
              <p className="text-sm text-muted-foreground mt-1">
                Leave empty to auto-generate
              </p>
            </div>

            <div>
              <Label htmlFor="submissionNotes">Creation Notes</Label>
              <Textarea
                id="submissionNotes"
                placeholder="Document the reason for staff creation (e.g., vendor requested via phone)"
                value={formData.submissionNotes}
                onChange={(e) => updateFormData('submissionNotes', e.target.value)}
                rows={3}
              />
            </div>
          </div>
        )

      case 2:
        const filteredVendors = getFilteredVendors()
        
        return (
          <div className="space-y-4">
            <div>
              <Label>Select Vendor *</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Choose the vendor this pricelist belongs to
              </p>
              
              {/* Search */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search vendors by name or email..."
                  value={vendorSearchTerm}
                  onChange={(e) => setVendorSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Vendor List */}
              <div className="max-h-96 overflow-y-auto space-y-3">
                {filteredVendors.map((vendor) => (
                  <Card 
                    key={vendor.id} 
                    className={`cursor-pointer transition-colors ${
                      formData.vendorId === vendor.id ? 'border-blue-500 bg-blue-50' : ''
                    }`}
                    onClick={() => updateFormData('vendorId', vendor.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className={`w-4 h-4 rounded-full border-2 ${
                            formData.vendorId === vendor.id 
                              ? 'bg-blue-500 border-blue-500' 
                              : 'border-gray-300'
                          }`} />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium">{vendor.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {vendor.contactEmail}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={vendor.status === 'active' ? 'default' : 'secondary'}>
                              {vendor.status}
                            </Badge>
                            <Badge variant="outline">
                              {vendor.preferredCurrency}
                            </Badge>
                            <Badge variant="outline">
                              {vendor.performanceMetrics.responseRate}% response rate
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label>Creation Method *</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Choose how you want to create this pricelist
              </p>
              
              <div className="grid gap-4">
                {/* Template Based */}
                <Card 
                  className={`cursor-pointer transition-colors ${
                    formData.creationType === 'template' ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => updateFormData('creationType', 'template')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          formData.creationType === 'template' 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-gray-300'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <FileText className="h-5 w-5 text-blue-600" />
                          <div className="font-medium">Use Existing Template</div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Create pricelist based on an existing template with pre-defined products
                        </div>
                        <div className="text-xs text-blue-600 mt-2">
                          ✓ Fastest option ✓ Consistent format ✓ Pre-validated products
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Manual Creation */}
                <Card 
                  className={`cursor-pointer transition-colors ${
                    formData.creationType === 'manual' ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => updateFormData('creationType', 'manual')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          formData.creationType === 'manual' 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-gray-300'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Plus className="h-5 w-5 text-green-600" />
                          <div className="font-medium">Create Manually</div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Start with empty pricelist and add products manually
                        </div>
                        <div className="text-xs text-green-600 mt-2">
                          ✓ Full control ✓ Custom products ✓ Flexible structure
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Excel Import */}
                <Card 
                  className={`cursor-pointer transition-colors ${
                    formData.creationType === 'import' ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => updateFormData('creationType', 'import')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          formData.creationType === 'import' 
                            ? 'bg-blue-500 border-blue-500' 
                            : 'border-gray-300'
                        }`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Upload className="h-5 w-5 text-purple-600" />
                          <div className="font-medium">Import from Excel</div>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          Upload an Excel file with existing pricing data
                        </div>
                        <div className="text-xs text-purple-600 mt-2">
                          ✓ Bulk import ✓ Existing data ✓ Quick setup
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            {/* Basic Configuration */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="currency">Currency *</Label>
                  <Select value={formData.currency} onValueChange={(value) => updateFormData('currency', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">US Dollar (USD)</SelectItem>
                      <SelectItem value="BHT">Thai Baht (BHT)</SelectItem>
                      <SelectItem value="EUR">Euro (EUR)</SelectItem>
                      <SelectItem value="CNY">Chinese Yuan (CNY)</SelectItem>
                      <SelectItem value="SGD">Singapore Dollar (SGD)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="validFrom">Valid From *</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => updateFormData('validFrom', e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="validTo">Valid To *</Label>
                  <Input
                    id="validTo"
                    type="date"
                    value={formData.validTo}
                    onChange={(e) => updateFormData('validTo', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Method-specific Configuration */}
            {formData.creationType === 'template' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Template Selection</h3>
                
                {/* Template Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search templates..."
                    value={templateSearchTerm}
                    onChange={(e) => setTemplateSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Template List */}
                <div className="max-h-60 overflow-y-auto space-y-3">
                  {getFilteredTemplates().map((template) => (
                    <Card 
                      key={template.id} 
                      className={`cursor-pointer transition-colors ${
                        formData.templateId === template.id ? 'border-blue-500 bg-blue-50' : ''
                      }`}
                      onClick={() => updateFormData('templateId', template.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                            <div className={`w-4 h-4 rounded-full border-2 ${
                              formData.templateId === template.id 
                                ? 'bg-blue-500 border-blue-500' 
                                : 'border-gray-300'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">{template.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {template.description}
                            </div>
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline">
                                {template.validityPeriod} days valid
                              </Badge>
                              <Badge variant="outline">
                                {template.defaultCurrency}
                              </Badge>
                              <Badge variant={template.status === 'active' ? 'default' : 'secondary'}>
                                {template.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {formData.creationType === 'import' && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Excel Import</h3>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <div className="text-sm font-medium mb-1">Upload Excel File</div>
                  <div className="text-xs text-muted-foreground mb-3">
                    Drag and drop or click to select file
                  </div>
                  <Button variant="outline" size="sm">
                    Choose File
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">
                  <strong>Supported formats:</strong> .xlsx, .xls, .csv<br />
                  <strong>Required columns:</strong> Product Code, Product Name, Unit Price, MOQ
                </div>
              </div>
            )}
          </div>
        )

      case 5:
        const selectedVendor = mockVendors.find(v => v.id === formData.vendorId)
        const selectedTemplate = mockTemplates.find(t => t.id === formData.templateId)
        
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium">Review & Create</h3>
            
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Pricelist Number</Label>
                  <div className="text-sm">{formData.pricelistNumber || 'Auto-generated'}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Currency</Label>
                  <div className="text-sm">{formData.currency}</div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Vendor</Label>
                <div className="text-sm">{selectedVendor?.name}</div>
                <div className="text-xs text-muted-foreground">{selectedVendor?.contactEmail}</div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Valid From</Label>
                  <div className="text-sm">{formData.validFrom}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Valid To</Label>
                  <div className="text-sm">{formData.validTo}</div>
                </div>
              </div>
              
              <div>
                <Label className="text-sm font-medium">Creation Method</Label>
                <div className="text-sm capitalize">{formData.creationType}</div>
                {formData.creationType === 'template' && selectedTemplate && (
                  <div className="text-xs text-muted-foreground">Template: {selectedTemplate.name}</div>
                )}
              </div>
              
              {formData.submissionNotes && (
                <div>
                  <Label className="text-sm font-medium">Creation Notes</Label>
                  <div className="text-sm">{formData.submissionNotes}</div>
                </div>
              )}
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Ready to Create</span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                The pricelist will be created and you&apos;ll be redirected to the edit page to add products and pricing.
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => router.back()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold">Create New Pricelist</h1>
          <p className="text-muted-foreground">Staff creation on behalf of vendor</p>
        </div>
      </div>

      {/* Progress Steps */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                  currentStep >= step.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {currentStep > step.id ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <step.icon className="h-4 w-4" />
                  )}
                </div>
                <div className={`ml-2 text-sm ${
                  currentStep >= step.id ? 'text-blue-600 font-medium' : 'text-gray-500'
                }`}>
                  {step.title}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 ${
                    currentStep > step.id ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderStepContent()}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        <div className="flex gap-2">
          {currentStep === steps.length ? (
            <Button onClick={handleSubmit} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Create Pricelist
            </Button>
          ) : (
            <Button 
              onClick={handleNext}
              disabled={!canProceed()}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function NewStaffPricelistPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <NewStaffPricelistPageContent />
    </Suspense>
  )
}