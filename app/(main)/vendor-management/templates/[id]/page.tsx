'use client'

// Template Detail View Page
// Phase 2 Task 4 - Template management interface

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { 
  ChevronLeft, 
  Edit, 
  Copy, 
  Download, 
  Play, 
  Pause, 
  Archive, 
  Trash2,
  FileSpreadsheet,
  Users,
  BarChart3,
  Settings,
  Package,
  Clock,
  Globe,
  Mail,
  Eye,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Calendar,
  Plus,
  Info
} from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from '@/components/ui/use-toast'
import { PricelistTemplate } from '../../types'
import { mockTemplates, mockCampaigns } from '../../lib/mock-data'
import { resolveProductsWithInfo, getCategoryName, getSubcategoryName, getItemGroupName } from '../../lib/product-utils'
import TemplatePreview from '../components/TemplatePreview'

export default function TemplateDetailPage() {
  const router = useRouter()
  const params = useParams()
  const templateId = params.id as string

  const [template, setTemplate] = useState<PricelistTemplate | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showPreview, setShowPreview] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)

  useEffect(() => {
    loadTemplate()
  }, [templateId])

  const loadTemplate = async () => {
    setIsLoading(true)
    try {
      // For now, use mock data
      const foundTemplate = mockTemplates.find(t => t.id === templateId)
      if (foundTemplate) {
        setTemplate(foundTemplate)
      } else {
        setTemplate(null)
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

  const handleEdit = () => {
    router.push(`/vendor-management/templates/${templateId}/edit`)
  }


  const handleDuplicate = async () => {
    if (!template) return

    try {
      // Create a copy
      const duplicatedTemplate: PricelistTemplate = {
        ...template,
        id: Date.now().toString(),
        name: `${template.name} (Copy)`,
        status: 'draft',
        createdAt: new Date(),
        updatedAt: new Date()
      }
      
      toast({
        title: 'Success',
        description: 'Template duplicated successfully',
      })

      router.push('/vendor-management/templates')
    } catch (error) {
      console.error('Error duplicating template:', error)
      toast({
        title: 'Error',
        description: 'Failed to duplicate template',
        variant: 'destructive',
      })
    }
  }

  const handleStatusChange = async (newStatus: 'active' | 'draft' | 'inactive') => {
    if (!template) return

    try {
      // Update status locally
      const updatedTemplate = { ...template, status: newStatus, updatedAt: new Date() }
      setTemplate(updatedTemplate)
      
      toast({
        title: 'Success',
        description: `Template ${newStatus === 'active' ? 'activated' : newStatus === 'inactive' ? 'deactivated' : 'saved as draft'}`,
      })
    } catch (error) {
      console.error('Error updating template status:', error)
      toast({
        title: 'Error',
        description: 'Failed to update template status',
        variant: 'destructive',
      })
    }
  }


  const handleDelete = async () => {
    if (!template) return

    try {
      // Delete template
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      })

      router.push('/vendor-management/templates')
    } catch (error) {
      console.error('Error deleting template:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      })
    }
  }

  const generateExcel = async () => {
    if (!template) return

    try {
      toast({
        title: 'Success',
        description: 'Excel template generated successfully',
      })
    } catch (error) {
      console.error('Error generating Excel template:', error)
      toast({
        title: 'Error',
        description: 'Failed to generate Excel template',
        variant: 'destructive',
      })
    }
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date))
  }

  const getFieldTypeIcon = (type: string) => {
    switch (type) {
      case 'text':
        return '📝'
      case 'textarea':
        return '📄'
      case 'number':
        return '🔢'
      case 'date':
        return '📅'
      case 'select':
        return '📋'
      default:
        return '📝'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
        return 'bg-gray-100 text-gray-800'
      case 'paused':
        return 'bg-orange-100 text-orange-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800'
      case 'high':
        return 'bg-orange-100 text-orange-800'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800'
      case 'low':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
          {[1, 2, 3].map(i => (
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

  if (!template) {
    return (
      <div className="text-center py-12">
        <FileSpreadsheet className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">Template not found</h3>
        <p className="text-muted-foreground mb-4">The template you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={() => router.push('/vendor-management/templates')}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header - Outside Card like edit mode */}
      <div className="space-y-4">
        {/* Title Row with Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-semibold">
                  {template.name}
                </h1>
                <Badge className={getStatusColor(template.status)}>
                  {template.status.charAt(0).toUpperCase() + template.status.slice(1)}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-1">
                {template.description || 'No description provided'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setShowPreview(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button variant="outline" size="sm" onClick={generateExcel}>
              <Download className="h-4 w-4 mr-2" />
              Generate Excel
            </Button>
            <Button variant="outline" size="sm" onClick={handleDuplicate}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </Button>
            <Button size="sm" onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setDeleteDialogOpen(true)}
              className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
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
                  {template.id || 'TPL-2410-001'}
                </span>
              </div>
            </div>

            {/* Vendor Instructions Section */}
            <div className="space-y-3">
              <div>
                <div className="text-sm font-medium flex items-center gap-2">
                  <Info className="h-4 w-4 text-blue-600" />
                  Vendor Instructions
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Provide clear instructions and requirements for vendors when submitting pricing
                </p>
              </div>
              <div className="min-h-[80px] p-3 border rounded-lg bg-gray-50">
                <div className="text-sm">
                  {template.instructions || 'Please provide competitive pricing for all office supplies'}
                </div>
              </div>
            </div>

            {/* Configuration Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Currency */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Currency</div>
                <p className="text-xs text-muted-foreground">
                  Default currency for all pricing submissions
                </p>
                <div className="p-2 border rounded-lg bg-gray-50">
                  <div className="text-sm font-medium">{template.defaultCurrency}</div>
                </div>
              </div>

              {/* Valid Period */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Validity Period</div>
                <p className="text-xs text-muted-foreground">
                  How long prices remain valid (in days)
                </p>
                <div className="flex items-center gap-2">
                  <div className="p-2 border rounded-lg bg-gray-50 flex-1">
                    <div className="text-sm font-medium">{template.validityPeriod}</div>
                  </div>
                  <span className="text-sm text-muted-foreground">days</span>
                </div>
              </div>

              {/* Status */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Template Status</div>
                <p className="text-xs text-muted-foreground">
                  Active templates can be sent to vendors
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <span className="text-sm text-muted-foreground">Inactive</span>
                  <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${template.status === 'active' ? 'bg-blue-600' : 'bg-gray-200'}`}>
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${template.status === 'active' ? 'translate-x-6' : 'translate-x-1'}`} />
                  </div>
                  <span className="text-sm text-muted-foreground">Active</span>
                </div>
              </div>

              {/* Template Metadata */}
              <div className="space-y-2">
                <div className="text-sm font-medium">Template History</div>
                <p className="text-xs text-muted-foreground">
                  Creation and modification timestamps
                </p>
                <div className="space-y-1 pt-1">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Created:</span> {formatDate(template.createdAt)}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="font-medium">Updated:</span> {formatDate(template.updatedAt)}
                  </div>
                </div>
              </div>
            </div>

            <Tabs defaultValue="products" className="space-y-4">
              <TabsList>
                <TabsTrigger value="products">Product Selection</TabsTrigger>
                <TabsTrigger value="campaigns">RfP</TabsTrigger>
              </TabsList>

              {/* Product Selection Tab */}
              <TabsContent value="products" className="space-y-4">
                {/* Resolved Products List */}
                {template.productSelection && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Products in Template ({(() => {
                          try {
                            return resolveProductsWithInfo(template.productSelection).length
                          } catch {
                            return 0
                          }
                        })()})
                      </CardTitle>
                      <CardDescription>
                        {(() => {
                          const hasSelections = (template.productSelection?.categories?.length || 0) + 
                                               (template.productSelection?.subcategories?.length || 0) + 
                                               (template.productSelection?.itemGroups?.length || 0) + 
                                               (template.productSelection?.specificItems?.length || 0) > 0
                          
                          if (!hasSelections) {
                            return 'No selections made. Products will appear here based on template configuration.'
                          }
                          
                          return 'These products will be included in the template based on your selections.'
                        })()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="max-h-96 overflow-y-auto space-y-2">
                        {(() => {
                          try {
                            const resolvedProducts = resolveProductsWithInfo(template.productSelection)
                            
                            if (resolvedProducts.length === 0) {
                              const hasSelections = (template.productSelection?.categories?.length || 0) + 
                                                   (template.productSelection?.subcategories?.length || 0) + 
                                                   (template.productSelection?.itemGroups?.length || 0) + 
                                                   (template.productSelection?.specificItems?.length || 0) > 0
                              
                              return (
                                <div className="text-center py-12 text-muted-foreground">
                                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                  <div className="text-lg font-medium mb-2">No products selected</div>
                                  <div className="text-sm max-w-md mx-auto">
                                    {!hasSelections 
                                      ? 'Configure product selection in template settings to see products here.'
                                      : 'Your current selections don\'t include any products. Check your category and item selections.'
                                    }
                                  </div>
                                </div>
                              )
                            }
                            
                            return resolvedProducts.map((productInfo, index) => (
                              <div key={productInfo.product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                <div className="flex items-center gap-3">
                                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                  <div>
                                    <div className="font-medium text-sm">{productInfo.product.name}</div>
                                    <div className="text-xs text-muted-foreground">
                                      {productInfo.categoryName} → {productInfo.subcategoryName}
                                      {productInfo.itemGroupName && ` → ${productInfo.itemGroupName}`}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="text-right">
                                    <div className="text-xs font-medium">{(productInfo.product as any).code || `SKU-${String(productInfo.product.id).padStart(4, '0')}`}</div>
                                    <div className="text-xs text-muted-foreground">Unit: {(productInfo.product as any).defaultOrderUnit || 'Each'}</div>
                                  </div>
                                </div>
                              </div>
                            ))
                          } catch (error) {
                            return (
                              <div className="text-center py-8 text-muted-foreground">
                                <Package className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <div>Error loading products</div>
                                <div className="text-xs">Please check the template configuration</div>
                              </div>
                            )
                          }
                        })()}
                      </div>
                      
                      {(() => {
                        try {
                          const resolvedProducts = resolveProductsWithInfo(template.productSelection)
                          if (resolvedProducts.length > 0) {
                            return (
                              <div className="mt-4 pt-4 border-t bg-blue-50 rounded-lg p-4">
                                <div className="flex items-center justify-between">
                                  <div className="text-sm text-blue-800 font-medium">
                                    Summary: {resolvedProducts.length} products will be included in this template
                                  </div>
                                  <Badge variant="default" className="bg-blue-600">
                                    {resolvedProducts.length} items
                                  </Badge>
                                </div>
                                <div className="text-xs text-blue-600 mt-1">
                                  These are all the products that will be included when creating Excel templates or requests for pricing.
                                </div>
                              </div>
                            )
                          }
                          return null
                        } catch {
                          return null
                        }
                      })()}
                    </CardContent>
                </Card>
                )}
              </TabsContent>

              {/* Campaigns Tab */}
              <TabsContent value="campaigns" className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Associated Requests for Pricing</CardTitle>
                        <CardDescription>
                          Requests for pricing that use this template
                        </CardDescription>
                      </div>
                      <Button 
                        onClick={() => router.push(`/vendor-management/campaigns/new?templateId=${template.id}`)}
                        className="flex items-center gap-2"
                      >
                        <Plus className="h-4 w-4" />
                        Create Request for Pricing
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {(() => {
                      const templateCampaigns = mockCampaigns.filter(c => c.templateId === template.id)
                      
                      if (templateCampaigns.length === 0) {
                        return (
                          <div className="text-center py-8 text-muted-foreground">
                            <TrendingUp className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <div>No requests for pricing using this template yet</div>
                            <p className="text-sm mt-2">Create your first request for pricing to start collecting prices</p>
                          </div>
                        )
                      }
                  
                      return (
                        <div className="space-y-4">
                          {templateCampaigns.map(campaign => (
                            <Card key={campaign.id} className="border-l-4 border-l-blue-500">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                      <h4 className="font-medium">{campaign.name}</h4>
                                      <Badge className={getStatusColor(campaign.status)}>
                                        {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                                      </Badge>
                                      <Badge className={getPriorityColor(campaign.priority)}>
                                        {campaign.priority}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-muted-foreground mt-1">
                                      {campaign.description}
                                    </p>
                                    <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                                      <div className="flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {campaign.analytics.totalVendors} vendors
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <CheckCircle className="h-3 w-3" />
                                        {campaign.analytics.submissionsCompleted} completed
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <BarChart3 className="h-3 w-3" />
                                        {campaign.analytics.responseRate}% response rate
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <Calendar className="h-3 w-3" />
                                        {formatDate(campaign.schedule.startDate)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => router.push(`/vendor-management/campaigns/${campaign.id}`)}
                                    >
                                      <Eye className="h-4 w-4 mr-1" />
                                      View
                                    </Button>
                                    <Button 
                                      variant="outline" 
                                      size="sm"
                                      onClick={() => router.push(`/vendor-management/campaigns/new?templateId=${template.id}&duplicateFrom=${campaign.id}`)}
                                    >
                                      <Copy className="h-4 w-4 mr-1" />
                                      Duplicate
                                    </Button>
                                  </div>
                                </div>
                                
                                {/* Progress Bar */}
                                <div className="mt-3">
                                  <div className="flex items-center justify-between mb-1">
                                    <span className="text-xs text-muted-foreground">Progress</span>
                                    <span className="text-xs text-muted-foreground">
                                      {Math.round((campaign.analytics.submissionsCompleted / campaign.analytics.totalVendors) * 100)}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                                    <div 
                                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                                      style={{ 
                                        width: `${Math.round((campaign.analytics.submissionsCompleted / campaign.analytics.totalVendors) * 100)}%` 
                                      }}
                                    />
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      )
                    })()}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Template Preview Modal */}
      {showPreview && (
        <TemplatePreview
          template={template}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{template.name}&quot;? This action cannot be undone and will affect any campaigns using this template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}