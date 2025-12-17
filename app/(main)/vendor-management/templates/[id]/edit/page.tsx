'use client'

// Template Edit Page
// Phase 2 Task 4 - Template management interface (edit)

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  ChevronLeft, 
  Save, 
  Eye, 
  Package,
  Settings,
  Bell,
  Info
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { PricelistTemplate } from '../../../types'
import { mockTemplates } from '../../../lib/mock-data'
import ProductSelectionComponent from '../../components/ProductSelectionComponent'
import TemplatePreview from '../../components/TemplatePreview'

const CURRENCY_OPTIONS = [
  { value: 'BHT', label: 'Thai Baht (BHT)' },
  { value: 'USD', label: 'US Dollar (USD)' },
  { value: 'CNY', label: 'Chinese Yuan (CNY)' },
  { value: 'SGD', label: 'Singapore Dollar (SGD)' },
]

export default function EditTemplatePage() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string

  const [showPreview, setShowPreview] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  const [formData, setFormData] = useState<Partial<PricelistTemplate>>({
    productSelection: {
      categories: [],
      subcategories: [],
      itemGroups: [],
      specificItems: []
    }
  })

  useEffect(() => {
    loadTemplate()
  }, [templateId])

  const loadTemplate = async () => {
    setIsLoading(true)
    try {
      // For now, use mock data
      const foundTemplate = mockTemplates.find(t => t.id === templateId)
      if (foundTemplate) {
        setFormData({
          ...foundTemplate,
          productSelection: foundTemplate.productSelection || {
            categories: [],
            subcategories: [],
            itemGroups: [],
            specificItems: []
          }
        })
      } else {
        toast({
          title: 'Error',
          description: 'Template not found',
          variant: 'destructive',
        })
        router.push('/vendor-management/templates')
      }
    } catch (error) {
      console.error('Error loading template:', error)
      toast({
        title: 'Error',
        description: 'Failed to load template',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const updateFormData = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const updateNestedFormData = (parentField: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [parentField]: {
        ...(prev[parentField as keyof typeof prev] as object),
        [field]: value
      }
    }))
  }

  const handleSave = async () => {
    try {
      // Validate required fields for active templates
      if (formData.status === 'active') {
        if (!formData.name?.trim()) {
          toast({
            title: 'Validation Error',
            description: 'Template name is required for active template',
            variant: 'destructive',
          })
          return
        }
        
        const selection = formData.productSelection
        if (!selection || (
          (!selection.categories?.length) && 
          (!selection.specificItems?.length) &&
          (!selection.subcategories?.length) &&
          (!selection.itemGroups?.length)
        )) {
          toast({
            title: 'Validation Error',
            description: 'Product selection is required for active template',
            variant: 'destructive',
          })
          return
        }
      }

      console.log('Attempting to save with formData:', formData)
      console.log('Product selection:', formData.productSelection)
      
      const templateData: PricelistTemplate = {
        ...formData as PricelistTemplate,
        updatedAt: new Date()
      }

      // Here you would save to the API
      console.log('Saving template:', templateData)
      
      toast({
        title: 'Success',
        description: 'Template saved successfully',
      })

      router.push(`/vendor-management/templates/${templateId}`)
    } catch (error) {
      console.error('Error saving template:', error)
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      })
    }
  }

  const canActivateTemplate = () => {
    const selection = formData.productSelection
    return formData.name?.trim() && 
           selection && (
             (selection.categories?.length || 0) > 0 || 
             (selection.subcategories?.length || 0) > 0 ||
             (selection.itemGroups?.length || 0) > 0 ||
             (selection.specificItems?.length || 0) > 0
           )
  }

  const canDeactivateTemplate = () => {
    return formData.status === 'active'
  }

  const handleStatusToggle = async (newStatus: 'active' | 'inactive') => {
    if (newStatus === 'active' && !canActivateTemplate()) {
      toast({
        title: 'Validation Error',
        description: 'Template must have a name and product selection to be activated',
        variant: 'destructive',
      })
      return
    }
    
    try {
      const updatedTemplate = { ...formData, status: newStatus, updatedAt: new Date() }
      
      console.log('Toggling status to:', newStatus)
      
      setFormData(updatedTemplate)
      
      toast({
        title: 'Status Updated',
        description: `Template ${newStatus === 'active' ? 'set to active' : 'set to inactive'} - remember to save changes`,
        variant: 'default',
      })
    } catch (error) {
      console.error('Error updating status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update template status',
        variant: 'destructive',
      })
    }
  }


  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid gap-4">
          {[1, 2].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="space-y-4">
        {/* Title Row with Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <Input
                  value={formData.name || ''}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="text-2xl font-semibold bg-transparent border-none p-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
                  placeholder="Enter template name"
                />
                <Badge 
                  className={
                    formData.status === 'active' 
                      ? 'bg-green-100 text-green-800 hover:bg-green-100' 
                      : formData.status === 'draft'
                      ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100'
                      : formData.status === 'inactive'
                      ? 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                      : 'bg-gray-100 text-gray-800 hover:bg-gray-100'
                  }
                >
                  {formData.status === 'active' ? 'Active' : 
                   formData.status === 'draft' ? 'Draft' : 
                   formData.status === 'inactive' ? 'Inactive' : 'Unknown'}
                </Badge>
              </div>
              <Textarea
                value={formData.description || ''}
                onChange={(e) => updateFormData('description', e.target.value)}
                placeholder="Enter template description"
                className="mt-1 text-muted-foreground bg-transparent border-none p-0 resize-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-0"
                rows={1}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => handleSave()}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>

        {/* Template Configuration - Combined Card */}
        <Card>
          <CardContent className="space-y-6 pt-6">
            {/* Template Number Display */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">Template #</span>
                <span className="font-mono text-sm font-semibold text-blue-600">
                  {templateId || 'TPL-2410-001'}
                </span>
              </div>
            </div>
            {/* Vendor Instructions Section */}
            <div className="space-y-3">
              <div>
                <Label className="text-sm font-medium flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  Vendor Instructions
                </Label>
                <p className="text-xs text-muted-foreground mt-1">
                  Provide clear instructions and requirements for vendors when submitting pricing
                </p>
              </div>
              <Textarea
                value={formData.instructions || ''}
                onChange={(e) => updateFormData('instructions', e.target.value)}
                placeholder="Enter detailed instructions for vendors (e.g., pricing requirements, submission format, special conditions)"
                className="min-h-[80px]"
                rows={4}
              />
            </div>

            {/* Configuration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Currency */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Currency</Label>
                <p className="text-xs text-muted-foreground">
                  Default currency for all pricing submissions
                </p>
                <Select 
                  value={formData.defaultCurrency} 
                  onValueChange={(value) => updateFormData('defaultCurrency', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map(currency => (
                      <SelectItem key={currency.value} value={currency.value}>
                        {currency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Valid Period */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Validity Period</Label>
                <p className="text-xs text-muted-foreground">
                  How long prices remain valid (in days)
                </p>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={formData.validityPeriod || 90}
                    onChange={(e) => updateFormData('validityPeriod', parseInt(e.target.value))}
                    className="flex-1"
                    min="1"
                    max="365"
                  />
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Template Status</Label>
                <p className="text-xs text-muted-foreground">
                  Active templates can be sent to vendors
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-sm text-muted-foreground">Inactive</span>
                  <Switch
                    checked={formData.status === 'active'}
                    onCheckedChange={(checked) => handleStatusToggle(checked ? 'active' : 'inactive')}
                  />
                  <span className="text-sm text-muted-foreground">Active</span>
                </div>
              </div>

              {/* Template Metadata */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Template History</Label>
                <p className="text-xs text-muted-foreground">
                  Creation and modification timestamps
                </p>
                <div className="space-y-1 pt-1">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Created:</span> {formData.createdAt ? new Date(formData.createdAt).toLocaleDateString() : 'Unknown'}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Updated:</span> {new Date().toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Product Selection Section */}
      <Card>
        <CardContent>
          <ProductSelectionComponent
            productSelection={formData.productSelection || {
              categories: [],
              subcategories: [],
              itemGroups: [],
              specificItems: []
            }}
            onChange={(selection) => updateFormData('productSelection', selection)}
          />
        </CardContent>
      </Card>

      {/* Save Actions */}
      {/* Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Settings
          </CardTitle>
          <CardDescription>Configure automated reminders and notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sendReminders">Send Reminders</Label>
              <p className="text-sm text-muted-foreground">
                Automatically send reminder emails to vendors
              </p>
            </div>
            <Switch
              id="sendReminders"
              checked={formData.notificationSettings?.sendReminders}
              onCheckedChange={(checked) => 
                updateNestedFormData('notificationSettings', 'sendReminders', checked)
              }
            />
          </div>

          {formData.notificationSettings?.sendReminders && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <Label>Reminder Days Before Deadline</Label>
                <div className="mt-2 flex gap-2 flex-wrap">
                  {[14, 7, 3, 1].map(day => (
                    <div key={day} className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        id={`reminder-${day}`}
                        checked={formData.notificationSettings?.reminderDays?.includes(day)}
                        onChange={(e) => {
                          const days = formData.notificationSettings?.reminderDays || []
                          if (e.target.checked) {
                            updateNestedFormData('notificationSettings', 'reminderDays', [...days, day].sort((a, b) => b - a))
                          } else {
                            updateNestedFormData('notificationSettings', 'reminderDays', days.filter(d => d !== day))
                          }
                        }}
                        className="rounded"
                      />
                      <Label htmlFor={`reminder-${day}`} className="text-sm">
                        {day} day{day > 1 ? 's' : ''}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="escalationDays">Escalation After (days)</Label>
                <Input
                  id="escalationDays"
                  type="number"
                  value={formData.notificationSettings?.escalationDays || 14}
                  onChange={(e) => 
                    updateNestedFormData('notificationSettings', 'escalationDays', parseInt(e.target.value))
                  }
                  className="mt-1"
                  min="1"
                  max="90"
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Template Preview Modal */}
      {showPreview && (
        <TemplatePreview
          template={formData as PricelistTemplate}
          onClose={() => setShowPreview(false)}
        />
      )}
    </div>
  )
}