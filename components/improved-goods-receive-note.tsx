'use client'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from "@/components/ui/tooltip"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { 
  ArrowLeft, 
  HelpCircle, 
  FileText, 
  User, 
  DollarSign, 
  Package, 
  AlertCircle,
  Save,
  Trash2,
  Edit,
  Loader2,
  Plus,
  Eye
} from "lucide-react"
import { cn } from "@/lib/utils"

const mockData = {
  id: "GRN004",
  status: "Pending",
  ref: "REF-2410-001",
  date: "2024-09-29",
  invoiceDate: "2024-09-29",
  invoiceNumber: "INV-2410-001",
  taxInvoiceDate: "2024-09-30",
  taxInvoiceNumber: "TAX-2410-001",
  description: "Quarterly stock replenishment for Q4",
  receiver: "Central Warehouse",
  vendor: "Global Supplies Co.",
  location: "Main Storage Facility",
  currency: "USD",
  isConsignment: false,
  isCash: true,
  cashBook: "General Cash Book",
}

type Mode = "view" | "edit" | "add"

const statusColors = {
  Draft: "bg-gray-100 text-gray-800 border-gray-200",
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Received: "bg-green-100 text-green-800 border-green-200",
  Cancelled: "bg-red-100 text-red-800 border-red-200",
}

export function GoodsReceiveNoteComponent() {
  const [mode, setMode] = React.useState<Mode>("view")
  const [formData, setFormData] = React.useState(mockData)
  const [isLoading, setIsLoading] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [name]: checked }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.ref.trim()) {
      newErrors.ref = "Reference is required"
    }
    if (!formData.vendor) {
      newErrors.vendor = "Vendor is required"
    }
    if (!formData.receiver) {
      newErrors.receiver = "Receiver is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call
      console.log("Saving data:", formData)
      setMode("view")
    } catch (error) {
      console.error("Failed to save GRN:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData(mockData)
    setMode("view")
    setErrors({})
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
      console.log("Deleting GRN:", formData.id)
      setShowDeleteDialog(false)
    } catch (error) {
      console.error("Failed to delete GRN:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const isEditable = mode === "edit" || mode === "add"

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Go back</span>
            </Button>
            <div>
              <CardTitle className="text-2xl font-bold">
                Goods Receive Note: {formData.id}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Reference: {formData.ref}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Badge 
              variant="outline" 
              className={cn("px-3 py-1", statusColors[formData.status as keyof typeof statusColors])}
            >
              {formData.status}
            </Badge>
            {mode === "view" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button onClick={() => setMode("edit")}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Edit this GRN</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            {isEditable && (
              <>
                <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  )}
                </Button>
              </>
            )}
            {mode === "view" && (
              <Button 
                variant="outline"
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Basic Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ref" className="text-sm font-medium">
                Reference Number *
              </Label>
              <Input
                id="ref"
                name="ref"
                value={formData.ref}
                onChange={handleInputChange}
                readOnly={!isEditable}
                className={cn("h-9", errors.ref && "border-red-500")}
                placeholder="REF-2410-001"
              />
              {errors.ref && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.ref}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date" className="text-sm font-medium">Date</Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleInputChange}
                readOnly={!isEditable}
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm font-medium">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                readOnly={!isEditable}
                placeholder="Enter description..."
                rows={3}
                className="resize-none"
              />
            </div>
          </CardContent>
        </Card>

        {/* Invoice Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Invoice Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceNumber" className="text-sm font-medium">Invoice Number</Label>
              <Input
                id="invoiceNumber"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                readOnly={!isEditable}
                className="h-9"
                placeholder="INV-2410-001"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="invoiceDate" className="text-sm font-medium">Invoice Date</Label>
              <Input
                id="invoiceDate"
                name="invoiceDate"
                type="date"
                value={formData.invoiceDate}
                onChange={handleInputChange}
                readOnly={!isEditable}
                className="h-9"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="taxInvoiceNumber" className="text-sm font-medium">Tax Invoice Number</Label>
              <Input
                id="taxInvoiceNumber"
                name="taxInvoiceNumber"
                value={formData.taxInvoiceNumber}
                onChange={handleInputChange}
                readOnly={!isEditable}
                className="h-9"
                placeholder="TAX-2410-001"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="taxInvoiceDate" className="text-sm font-medium">Tax Invoice Date</Label>
              <Input
                id="taxInvoiceDate"
                name="taxInvoiceDate"
                type="date"
                value={formData.taxInvoiceDate}
                onChange={handleInputChange}
                readOnly={!isEditable}
                className="h-9"
              />
            </div>
          </CardContent>
        </Card>

        {/* Party Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4" />
              Party Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="vendor" className="text-sm font-medium">Vendor *</Label>
              <Select
                value={formData.vendor}
                onValueChange={(value) => handleSelectChange("vendor", value)}
                disabled={!isEditable}
              >
                <SelectTrigger className={cn("h-9", errors.vendor && "border-red-500")}>
                  <SelectValue placeholder="Select vendor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Global Supplies Co.">Global Supplies Co.</SelectItem>
                  <SelectItem value="Fresh Produce Ltd.">Fresh Produce Ltd.</SelectItem>
                  <SelectItem value="Quality Meats Inc.">Quality Meats Inc.</SelectItem>
                </SelectContent>
              </Select>
              {errors.vendor && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.vendor}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="receiver" className="text-sm font-medium">Receiver *</Label>
              <Select
                value={formData.receiver}
                onValueChange={(value) => handleSelectChange("receiver", value)}
                disabled={!isEditable}
              >
                <SelectTrigger className={cn("h-9", errors.receiver && "border-red-500")}>
                  <SelectValue placeholder="Select receiver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Central Warehouse">Central Warehouse</SelectItem>
                  <SelectItem value="Main Storage">Main Storage</SelectItem>
                  <SelectItem value="Kitchen Storage">Kitchen Storage</SelectItem>
                </SelectContent>
              </Select>
              {errors.receiver && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {errors.receiver}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="location" className="text-sm font-medium">Location</Label>
              <Select
                value={formData.location}
                onValueChange={(value) => handleSelectChange("location", value)}
                disabled={!isEditable}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Main Storage Facility">Main Storage Facility</SelectItem>
                  <SelectItem value="Secondary Storage">Secondary Storage</SelectItem>
                  <SelectItem value="Cold Storage">Cold Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency" className="text-sm font-medium">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value) => handleSelectChange("currency", value)}
                disabled={!isEditable}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                  <SelectItem value="THB">THB - Thai Baht</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Financial Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Financial Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cashBook" className="text-sm font-medium">Cash Book</Label>
              <Select
                value={formData.cashBook}
                onValueChange={(value) => handleSelectChange("cashBook", value)}
                disabled={!isEditable}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select cash book" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General Cash Book">General Cash Book</SelectItem>
                  <SelectItem value="Petty Cash">Petty Cash</SelectItem>
                  <SelectItem value="F&B Account">F&B Account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-6">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="consignment"
                        checked={formData.isConsignment}
                        onCheckedChange={(checked) => handleCheckboxChange("isConsignment", checked as boolean)}
                        disabled={!isEditable}
                      />
                      <Label htmlFor="consignment" className="text-sm font-medium cursor-pointer flex items-center">
                        Consignment
                        <HelpCircle className="w-4 h-4 ml-1" />
                      </Label>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Goods sent for sale with expectation of future payment</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="cash"
                  checked={formData.isCash}
                  onCheckedChange={(checked) => handleCheckboxChange("isCash", checked as boolean)}
                  disabled={!isEditable}
                />
                <Label htmlFor="cash" className="text-sm font-medium cursor-pointer">
                  Cash Payment
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Tabs Section */}
        <Tabs defaultValue="items" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="items" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              Items
            </TabsTrigger>
            <TabsTrigger value="extra-costs">Extra Costs</TabsTrigger>
            <TabsTrigger value="stock-movement">Stock Movement</TabsTrigger>
            <TabsTrigger value="comments-attachments">Comments</TabsTrigger>
            <TabsTrigger value="activity-log">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-medium mb-2">No items added yet</h4>
                  <p className="text-sm mb-4">Add items to this goods received note to get started.</p>
                  {isEditable && (
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Item
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="extra-costs" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground py-8">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No extra costs defined</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stock-movement" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No stock movements recorded</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="comments-attachments" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground py-8">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No comments or attachments</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity-log" className="mt-6">
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground py-8">
                  <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">No activity logged</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goods Received Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this goods received note? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}