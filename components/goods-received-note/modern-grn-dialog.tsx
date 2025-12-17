"use client"

import * as React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
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
  X,
  Save,
  FileText,
  Package,
  DollarSign,
  Calendar,
  User,
  Building2,
  Truck,
  AlertCircle,
  Check,
  Loader2,
  Plus,
  Trash2,
  Edit,
  Eye,
} from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface GoodsReceiveNoteFormData {
  id: string
  ref: string
  date: string
  invoiceDate: string
  invoiceNumber: string
  taxInvoiceDate: string
  taxInvoiceNumber: string
  description: string
  receiver: string
  vendor: string
  location: string
  currency: string
  status: string
  cashBook: string
  isConsignment: boolean
  isCash: boolean
}

interface ModernGRNDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "view" | "edit" | "add"
  initialData?: Partial<GoodsReceiveNoteFormData>
  onSave?: (data: GoodsReceiveNoteFormData) => void
  onDelete?: () => void
  size?: "sm" | "md" | "lg" | "xl"
  useSheet?: boolean
}

const defaultFormData: GoodsReceiveNoteFormData = {
  id: "",
  ref: "",
  date: format(new Date(), "yyyy-MM-dd"),
  invoiceDate: format(new Date(), "yyyy-MM-dd"),
  invoiceNumber: "",
  taxInvoiceDate: format(new Date(), "yyyy-MM-dd"),
  taxInvoiceNumber: "",
  description: "",
  receiver: "",
  vendor: "",
  location: "",
  currency: "USD",
  status: "Draft",
  cashBook: "",
  isConsignment: false,
  isCash: false,
}

const statusColors = {
  Draft: "bg-gray-100 text-gray-800 border-gray-200",
  Pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  Received: "bg-green-100 text-green-800 border-green-200",
  Cancelled: "bg-red-100 text-red-800 border-red-200",
}

export function ModernGRNDialog({
  open,
  onOpenChange,
  mode,
  initialData,
  onSave,
  onDelete,
  size = "xl",
  useSheet = false,
}: ModernGRNDialogProps) {
  const [formData, setFormData] = useState<GoodsReceiveNoteFormData>({
    ...defaultFormData,
    ...initialData,
  })
  const [activeTab, setActiveTab] = useState("general")
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const isReadOnly = mode === "view"
  const isEditing = mode === "edit" || mode === "add"

  React.useEffect(() => {
    if (open) {
      setFormData({ ...defaultFormData, ...initialData })
      setErrors({})
    }
  }, [open, initialData])

  const handleInputChange = (field: keyof GoodsReceiveNoteFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }))
    }
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
    if (!formData.date) {
      newErrors.date = "Date is required"
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
      onSave?.(formData)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to save GRN:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500)) // Simulate API call
      onDelete?.()
      setShowDeleteDialog(false)
      onOpenChange(false)
    } catch (error) {
      console.error("Failed to delete GRN:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getDialogSize = () => {
    switch (size) {
      case "sm": return "sm:max-w-[425px]"
      case "md": return "sm:max-w-[600px]"
      case "lg": return "sm:max-w-[800px]"
      case "xl": return "sm:max-w-[1200px]"
      default: return "sm:max-w-[1200px]"
    }
  }

  const renderGeneralTab = () => (
    <div className="grid gap-6">
      {/* Header Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="ref" className="text-sm font-medium">
            Reference Number *
          </Label>
          <Input
            id="ref"
            value={formData.ref}
            onChange={(e) => handleInputChange("ref", e.target.value)}
            readOnly={isReadOnly}
            className={cn(errors.ref && "border-red-500")}
            placeholder="GRN-2410-001"
          />
          {errors.ref && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.ref}
            </p>
          )}
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm font-medium">
            Date *
          </Label>
          <Input
            id="date"
            type="date"
            value={formData.date}
            onChange={(e) => handleInputChange("date", e.target.value)}
            readOnly={isReadOnly}
            className={cn(errors.date && "border-red-500")}
          />
          {errors.date && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.date}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <Badge 
            variant="outline" 
            className={cn("px-3 py-1", statusColors[formData.status as keyof typeof statusColors])}
          >
            {formData.status}
          </Badge>
        </div>
      </div>

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
            <Label htmlFor="invoiceNumber" className="text-sm font-medium">
              Invoice Number
            </Label>
            <Input
              id="invoiceNumber"
              value={formData.invoiceNumber}
              onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
              readOnly={isReadOnly}
              placeholder="INV-2410-001"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="invoiceDate" className="text-sm font-medium">
              Invoice Date
            </Label>
            <Input
              id="invoiceDate"
              type="date"
              value={formData.invoiceDate}
              onChange={(e) => handleInputChange("invoiceDate", e.target.value)}
              readOnly={isReadOnly}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxInvoiceNumber" className="text-sm font-medium">
              Tax Invoice Number
            </Label>
            <Input
              id="taxInvoiceNumber"
              value={formData.taxInvoiceNumber}
              onChange={(e) => handleInputChange("taxInvoiceNumber", e.target.value)}
              readOnly={isReadOnly}
              placeholder="TAX-2410-001"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="taxInvoiceDate" className="text-sm font-medium">
              Tax Invoice Date
            </Label>
            <Input
              id="taxInvoiceDate"
              type="date"
              value={formData.taxInvoiceDate}
              onChange={(e) => handleInputChange("taxInvoiceDate", e.target.value)}
              readOnly={isReadOnly}
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
            <Label htmlFor="vendor" className="text-sm font-medium">
              Vendor *
            </Label>
            <Select
              value={formData.vendor}
              onValueChange={(value) => handleInputChange("vendor", value)}
              disabled={isReadOnly}
            >
              <SelectTrigger className={cn(errors.vendor && "border-red-500")}>
                <SelectValue placeholder="Select vendor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global-fb">Global F&B Suppliers</SelectItem>
                <SelectItem value="fresh-produce">Fresh Produce Co.</SelectItem>
                <SelectItem value="quality-meats">Quality Meats Inc.</SelectItem>
                <SelectItem value="beverage-world">Beverage World Ltd.</SelectItem>
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
            <Label htmlFor="receiver" className="text-sm font-medium">
              Receiver *
            </Label>
            <Select
              value={formData.receiver}
              onValueChange={(value) => handleInputChange("receiver", value)}
              disabled={isReadOnly}
            >
              <SelectTrigger className={cn(errors.receiver && "border-red-500")}>
                <SelectValue placeholder="Select receiver" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="john-doe">John Doe</SelectItem>
                <SelectItem value="jane-smith">Jane Smith</SelectItem>
                <SelectItem value="mike-johnson">Mike Johnson</SelectItem>
                <SelectItem value="emily-brown">Emily Brown</SelectItem>
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
            <Label htmlFor="location" className="text-sm font-medium">
              Location
            </Label>
            <Select
              value={formData.location}
              onValueChange={(value) => handleInputChange("location", value)}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main-warehouse">Main Warehouse</SelectItem>
                <SelectItem value="central-storage">Central Storage</SelectItem>
                <SelectItem value="kitchen-storage">Kitchen Storage</SelectItem>
                <SelectItem value="beverage-storage">Beverage Storage</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency" className="text-sm font-medium">
              Currency
            </Label>
            <Select
              value={formData.currency}
              onValueChange={(value) => handleInputChange("currency", value)}
              disabled={isReadOnly}
            >
              <SelectTrigger>
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
            <Label htmlFor="cashBook" className="text-sm font-medium">
              Cash Book
            </Label>
            <Select
              value={formData.cashBook}
              onValueChange={(value) => handleInputChange("cashBook", value)}
              disabled={isReadOnly}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cash book" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main-account">Main Account</SelectItem>
                <SelectItem value="petty-cash">Petty Cash</SelectItem>
                <SelectItem value="fb-account">Food & Beverage Account</SelectItem>
                <SelectItem value="operations">Operations Account</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-6">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="isConsignment"
                      checked={formData.isConsignment}
                      onCheckedChange={(checked) => 
                        handleInputChange("isConsignment", checked)
                      }
                      disabled={isReadOnly}
                    />
                    <Label htmlFor="isConsignment" className="text-sm font-medium cursor-pointer">
                      Consignment
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
                id="isCash"
                checked={formData.isCash}
                onCheckedChange={(checked) => 
                  handleInputChange("isCash", checked)
                }
                disabled={isReadOnly}
              />
              <Label htmlFor="isCash" className="text-sm font-medium cursor-pointer">
                Cash Payment
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium">
          Description
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
          readOnly={isReadOnly}
          placeholder="Enter detailed description of goods received..."
          rows={3}
        />
      </div>
    </div>
  )

  const renderItemsTab = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Items</h3>
        {isEditing && (
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        )}
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground py-8">
            <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h4 className="text-lg font-medium mb-2">No items added yet</h4>
            <p className="text-sm">Add items to this goods received note to get started.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const DialogWrapper = useSheet ? Sheet : Dialog
  const ContentWrapper = useSheet ? SheetContent : DialogContent
  const HeaderWrapper = useSheet ? SheetHeader : DialogHeader
  const TitleWrapper = useSheet ? SheetTitle : DialogTitle
  const DescriptionWrapper = useSheet ? SheetDescription : DialogDescription
  const FooterWrapper = useSheet ? SheetFooter : DialogFooter

  return (
    <>
      <DialogWrapper open={open} onOpenChange={onOpenChange}>
        <ContentWrapper className={useSheet ? "w-full sm:max-w-none" : getDialogSize()}>
          <HeaderWrapper>
            <div className="flex items-center justify-between">
              <div>
                <TitleWrapper className="text-xl font-semibold">
                  {mode === "add" ? "New Goods Received Note" : 
                   mode === "edit" ? `Edit GRN ${formData.ref}` : 
                   `Goods Received Note ${formData.ref}`}
                </TitleWrapper>
                <DescriptionWrapper className="text-sm text-muted-foreground mt-1">
                  {mode === "add" ? "Create a new goods received note for inventory tracking" :
                   mode === "edit" ? "Make changes to this goods received note" :
                   "View details of this goods received note"}
                </DescriptionWrapper>
              </div>
              {!isReadOnly && (
                <Badge variant="secondary" className="text-xs">
                  {mode === "add" ? "New" : "Editing"}
                </Badge>
              )}
            </div>
          </HeaderWrapper>

          <div className="flex-1 overflow-hidden">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="general" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  General
                </TabsTrigger>
                <TabsTrigger value="items" className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  Items
                </TabsTrigger>
              </TabsList>

              <div className="mt-6 overflow-y-auto max-h-[60vh]">
                <TabsContent value="general" className="mt-0">
                  {renderGeneralTab()}
                </TabsContent>
                <TabsContent value="items" className="mt-0">
                  {renderItemsTab()}
                </TabsContent>
              </div>
            </Tabs>
          </div>

          <Separator />

          <FooterWrapper>
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                {mode === "view" && onDelete && (
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
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  {isReadOnly ? "Close" : "Cancel"}
                </Button>
                
                {isEditing && (
                  <Button
                    onClick={handleSave}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        {mode === "add" ? "Create GRN" : "Save Changes"}
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </FooterWrapper>
        </ContentWrapper>
      </DialogWrapper>

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
    </>
  )
}