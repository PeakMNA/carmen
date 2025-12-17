"use client"

import React, { useState, useMemo } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  ChevronLeft,
  ChevronRight,
  Edit2,
  X,
  Check,
  Printer,
  XCircle,
  Hash,
  Calendar,
  Building2,
  Store,
  Warehouse,
  MapPin,
  User,
  FileText,
  Package,
  Plus,
  MoreHorizontal,
  Trash2,
  AlertCircle,
  CheckCircle,
  Truck,
  Clock,
  History,
  MessageSquare,
  Paperclip,
  PanelRightClose,
  PanelRightOpen,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
  Send
} from "lucide-react"
import { formatNumber } from "@/lib/utils/formatters"
import { mockProducts } from "@/lib/mock-data/products"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface TransferItem {
  id: number
  description: string
  productCode: string
  productName: string
  category: string
  unit: string
  qtyRequired: number
  qtyApproved: number
  qtyTransferred: number
  costPerUnit: number
  total: number
  currentStock: number
  parLevel: number
  sourceAvailable: number
  approvalStatus: 'Pending' | 'Approved' | 'Reject' | 'Review'
  itemInfo: {
    itemName: string
    category: string
    subCategory: string
    itemGroup: string
    barCode: string
  }
}

interface ApprovalStep {
  id: string
  level: string
  approver: string
  role: string
  status: 'approved' | 'current' | 'pending' | 'rejected'
  comments: string
  approvedAt?: string
  isRequired: boolean
}

interface TimelineEvent {
  action: string
  user: string
  date: string
  notes: string
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockTransferRequests: Record<string, {
  refNo: string
  date: string
  expectedDeliveryDate: string
  movementType: string
  description: string
  sourceLocation: string
  sourceLocationCode: string
  destinationLocation: string
  destinationLocationCode: string
  department: string
  requestedBy: string
  priority: 'standard' | 'urgent' | 'emergency'
  status: 'Draft' | 'In Process' | 'Complete' | 'Reject' | 'Void'
  items: TransferItem[]
  comments: Array<{ id: number; date: string; by: string; comment: string }>
  attachments: Array<{ id: number; fileName: string; description: string; isPublic: boolean; date: string; by: string }>
  activityLog: Array<{ id: number; date: string; by: string; action: string; log: string }>
  approvalSteps: ApprovalStep[]
  timeline: TimelineEvent[]
}> = {
  "TR-2410-0089": {
    refNo: "TR-2410-0089",
    date: "2024-01-15",
    expectedDeliveryDate: "2024-01-17",
    movementType: "Transfer",
    description: "Urgent beverage replenishment for Central Kitchen",
    sourceLocation: "Main Warehouse",
    sourceLocationCode: "MW-001",
    destinationLocation: "Central Kitchen",
    destinationLocationCode: "CK-001",
    department: "F&B Operations",
    requestedBy: "John Smith",
    priority: "urgent",
    status: "In Process",
    items: [
      {
        id: 1,
        description: "Thai Milk Tea (12 pack)",
        productCode: "BEV-001",
        productName: "Thai Milk Tea",
        category: "Beverages",
        unit: "Box",
        qtyRequired: 20,
        qtyApproved: 18,
        qtyTransferred: 0,
        costPerUnit: 45.99,
        total: 827.82,
        currentStock: 5,
        parLevel: 30,
        sourceAvailable: 50,
        approvalStatus: "Approved",
        itemInfo: {
          itemName: "Thai Milk Tea",
          category: "Beverages",
          subCategory: "Tea",
          itemGroup: "Packaged Drinks",
          barCode: "8851234567890"
        }
      },
      {
        id: 2,
        description: "Coffee Beans Premium (1kg bag)",
        productCode: "BEV-002",
        productName: "Coffee Beans",
        category: "Beverages",
        unit: "Bag",
        qtyRequired: 15,
        qtyApproved: 15,
        qtyTransferred: 0,
        costPerUnit: 28.50,
        total: 427.50,
        currentStock: 10,
        parLevel: 25,
        sourceAvailable: 40,
        approvalStatus: "Approved",
        itemInfo: {
          itemName: "Premium Coffee Beans",
          category: "Beverages",
          subCategory: "Coffee",
          itemGroup: "Raw Materials",
          barCode: "8851234567891"
        }
      },
      {
        id: 3,
        description: "Fresh Orange Juice (1L carton)",
        productCode: "BEV-003",
        productName: "Orange Juice",
        category: "Beverages",
        unit: "Carton",
        qtyRequired: 30,
        qtyApproved: 25,
        qtyTransferred: 0,
        costPerUnit: 12.00,
        total: 300.00,
        currentStock: 8,
        parLevel: 40,
        sourceAvailable: 60,
        approvalStatus: "Approved",
        itemInfo: {
          itemName: "Orange Juice Fresh",
          category: "Beverages",
          subCategory: "Juice",
          itemGroup: "Fresh Drinks",
          barCode: "8851234567892"
        }
      },
      {
        id: 4,
        description: "Mineral Water (24 pack case)",
        productCode: "BEV-004",
        productName: "Mineral Water",
        category: "Beverages",
        unit: "Case",
        qtyRequired: 50,
        qtyApproved: 0,
        qtyTransferred: 0,
        costPerUnit: 8.50,
        total: 0,
        currentStock: 15,
        parLevel: 60,
        sourceAvailable: 100,
        approvalStatus: "Reject",
        itemInfo: {
          itemName: "Mineral Water Premium",
          category: "Beverages",
          subCategory: "Water",
          itemGroup: "Packaged Drinks",
          barCode: "8851234567893"
        }
      },
      {
        id: 5,
        description: "Green Tea Matcha Grade A",
        productCode: "BEV-005",
        productName: "Green Tea",
        category: "Beverages",
        unit: "Box",
        qtyRequired: 10,
        qtyApproved: 8,
        qtyTransferred: 0,
        costPerUnit: 32.00,
        total: 256.00,
        currentStock: 3,
        parLevel: 15,
        sourceAvailable: 20,
        approvalStatus: "Pending",
        itemInfo: {
          itemName: "Green Tea Matcha",
          category: "Beverages",
          subCategory: "Tea",
          itemGroup: "Premium Tea",
          barCode: "8851234567894"
        }
      },
      {
        id: 6,
        description: "Coconut Milk Organic (400ml)",
        productCode: "BEV-006",
        productName: "Coconut Milk",
        category: "Beverages",
        unit: "Can",
        qtyRequired: 12,
        qtyApproved: 12,
        qtyTransferred: 0,
        costPerUnit: 4.50,
        total: 54.00,
        currentStock: 6,
        parLevel: 20,
        sourceAvailable: 30,
        approvalStatus: "Review",
        itemInfo: {
          itemName: "Coconut Milk Organic",
          category: "Beverages",
          subCategory: "Alternative Milk",
          itemGroup: "Cooking Essentials",
          barCode: "8851234567895"
        }
      },
      {
        id: 7,
        description: "Lemon Syrup Concentrate",
        productCode: "BEV-007",
        productName: "Lemon Syrup",
        category: "Beverages",
        unit: "Bottle",
        qtyRequired: 8,
        qtyApproved: 8,
        qtyTransferred: 0,
        costPerUnit: 15.00,
        total: 120.00,
        currentStock: 2,
        parLevel: 10,
        sourceAvailable: 25,
        approvalStatus: "Approved",
        itemInfo: {
          itemName: "Lemon Syrup",
          category: "Beverages",
          subCategory: "Syrups",
          itemGroup: "Flavorings",
          barCode: "8851234567896"
        }
      },
      {
        id: 8,
        description: "Ice Cream Mix Vanilla Base",
        productCode: "DST-001",
        productName: "Ice Cream Mix",
        category: "Desserts",
        unit: "Tub",
        qtyRequired: 5,
        qtyApproved: 5,
        qtyTransferred: 0,
        costPerUnit: 25.00,
        total: 125.00,
        currentStock: 1,
        parLevel: 8,
        sourceAvailable: 15,
        approvalStatus: "Approved",
        itemInfo: {
          itemName: "Ice Cream Mix Vanilla",
          category: "Desserts",
          subCategory: "Ice Cream",
          itemGroup: "Frozen Desserts",
          barCode: "8851234567897"
        }
      }
    ],
    comments: [
      {
        id: 1,
        date: "2024-01-15 10:00 AM",
        by: "John Smith",
        comment: "Urgent replenishment needed for weekend event preparation."
      },
      {
        id: 2,
        date: "2024-01-15 02:30 PM",
        by: "David Brown",
        comment: "Approved with adjustments. Mineral water rejected - please use existing stock first."
      }
    ],
    attachments: [
      {
        id: 1,
        fileName: "stock_report.pdf",
        description: "Current stock levels report",
        isPublic: true,
        date: "2024-01-15",
        by: "John Smith"
      }
    ],
    activityLog: [
      { id: 1, date: "2024-01-15 09:30 AM", by: "John Smith", action: "Created", log: "Transfer request created" },
      { id: 2, date: "2024-01-15 09:35 AM", by: "John Smith", action: "Submitted", log: "Submitted for approval" },
      { id: 3, date: "2024-01-15 02:30 PM", by: "David Brown", action: "Reviewed", log: "Items reviewed with adjustments" }
    ],
    approvalSteps: [
      {
        id: "submission",
        level: "Submission",
        approver: "System",
        role: "system",
        status: "approved",
        comments: "Transfer request submitted for approval workflow.",
        approvedAt: "2024-01-15 09:35 AM",
        isRequired: true
      },
      {
        id: "warehouse-manager",
        level: "Warehouse Manager",
        approver: "David Brown",
        role: "warehouse-manager",
        status: "approved",
        comments: "Approved with adjustments. Please coordinate pickup time.",
        approvedAt: "2024-01-15 02:30 PM",
        isRequired: true
      },
      {
        id: "store-manager",
        level: "Store Manager",
        approver: "Mike Chen",
        role: "store-manager",
        status: "current",
        comments: "",
        isRequired: true
      },
      {
        id: "complete",
        level: "Complete",
        approver: "System",
        role: "system",
        status: "pending",
        comments: "",
        isRequired: true
      }
    ],
    timeline: [
      { action: "Request Created", user: "John Smith", date: "2024-01-15 09:30 AM", notes: "Transfer request submitted for approval" },
      { action: "Submitted for Approval", user: "John Smith", date: "2024-01-15 09:35 AM", notes: "Awaiting warehouse manager review" },
      { action: "Warehouse Review", user: "David Brown", date: "2024-01-15 02:30 PM", notes: "Approved with adjustments to quantities" }
    ]
  },
  "TR-2410-0090": {
    refNo: "TR-2410-0090",
    date: "2024-01-16",
    expectedDeliveryDate: "2024-01-18",
    movementType: "Transfer",
    description: "Weekly kitchen supplies replenishment",
    sourceLocation: "Main Warehouse",
    sourceLocationCode: "MW-001",
    destinationLocation: "Central Kitchen",
    destinationLocationCode: "CK-001",
    department: "F&B Operations",
    requestedBy: "Sarah Johnson",
    priority: "standard",
    status: "Draft",
    items: [
      {
        id: 1,
        description: "Olive Oil Extra Virgin (1L)",
        productCode: "OIL-001",
        productName: "Olive Oil",
        category: "Cooking Oils",
        unit: "Bottle",
        qtyRequired: 10,
        qtyApproved: 0,
        qtyTransferred: 0,
        costPerUnit: 18.50,
        total: 185.00,
        currentStock: 3,
        parLevel: 15,
        sourceAvailable: 25,
        approvalStatus: "Pending",
        itemInfo: {
          itemName: "Olive Oil Extra Virgin",
          category: "Cooking Oils",
          subCategory: "Oils",
          itemGroup: "Cooking Essentials",
          barCode: "8851234567900"
        }
      },
      {
        id: 2,
        description: "Sea Salt (500g)",
        productCode: "SLT-001",
        productName: "Sea Salt",
        category: "Seasonings",
        unit: "Pack",
        qtyRequired: 20,
        qtyApproved: 0,
        qtyTransferred: 0,
        costPerUnit: 4.50,
        total: 90.00,
        currentStock: 5,
        parLevel: 25,
        sourceAvailable: 50,
        approvalStatus: "Pending",
        itemInfo: {
          itemName: "Sea Salt Premium",
          category: "Seasonings",
          subCategory: "Salt",
          itemGroup: "Seasonings",
          barCode: "8851234567901"
        }
      }
    ],
    comments: [],
    attachments: [],
    activityLog: [
      { id: 1, date: "2024-01-16 10:00 AM", by: "Sarah Johnson", action: "Created", log: "Transfer request created" }
    ],
    approvalSteps: [
      {
        id: "submission",
        level: "Submission",
        approver: "System",
        role: "system",
        status: "pending",
        comments: "",
        isRequired: true
      }
    ],
    timeline: [
      { action: "Request Created", user: "Sarah Johnson", date: "2024-01-16 10:00 AM", notes: "Draft transfer request created" }
    ]
  }
}

// Default data for unknown IDs
const defaultRequest = mockTransferRequests["TR-2410-0090"]

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    "Draft": { label: "Draft", className: "bg-gray-100 text-gray-700 border-gray-200" },
    "In Process": { label: "In Process", className: "bg-blue-100 text-blue-700 border-blue-200" },
    "Complete": { label: "Complete", className: "bg-green-100 text-green-700 border-green-200" },
    "Reject": { label: "Rejected", className: "bg-red-100 text-red-700 border-red-200" },
    "Void": { label: "Void", className: "bg-gray-100 text-gray-500 border-gray-200" }
  }
  const { label, className } = config[status] || { label: status, className: "" }
  return <Badge variant="outline" className={className}>{label}</Badge>
}

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, { label: string; className: string; icon: React.ReactNode }> = {
    standard: { label: "Standard", className: "bg-green-100 text-green-700 border-green-200", icon: <Clock className="h-3 w-3" /> },
    urgent: { label: "Urgent", className: "bg-amber-100 text-amber-700 border-amber-200", icon: <AlertTriangle className="h-3 w-3" /> },
    emergency: { label: "Emergency", className: "bg-red-100 text-red-700 border-red-200", icon: <AlertCircle className="h-3 w-3" /> }
  }
  const { label, className, icon } = config[priority] || { label: priority, className: "", icon: null }
  return (
    <Badge variant="outline" className={`gap-1 ${className}`}>
      {icon}
      {label}
    </Badge>
  )
}

function ItemApprovalBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    "Pending": { label: "Pending", className: "bg-gray-100 text-gray-600 border-gray-200" },
    "Approved": { label: "Approved", className: "bg-green-100 text-green-700 border-green-200" },
    "Reject": { label: "Rejected", className: "bg-red-100 text-red-700 border-red-200" },
    "Review": { label: "Review", className: "bg-yellow-100 text-yellow-700 border-yellow-200" }
  }
  const { label, className } = config[status] || { label: status, className: "" }
  return <Badge variant="outline" className={`text-xs ${className}`}>{label}</Badge>
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function TransferRequestDetailPage() {
  const params = useParams()
  const router = useRouter()
  const requestId = params.id as string

  // Get request data
  const request = mockTransferRequests[requestId] || defaultRequest

  // State
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [items, setItems] = useState<TransferItem[]>(request.items)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [expandedItems, setExpandedItems] = useState<number[]>([])
  const [newComment, setNewComment] = useState("")

  // Inline Add Item state
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newItemProductId, setNewItemProductId] = useState("")
  const [newItemQty, setNewItemQty] = useState(1)
  const [productSearchOpen, setProductSearchOpen] = useState(false)

  // Calculate totals
  const totals = useMemo(() => {
    const requestedTotal = items.reduce((sum, item) => sum + (item.qtyRequired * item.costPerUnit), 0)
    const approvedTotal = items.reduce((sum, item) => sum + (item.qtyApproved * item.costPerUnit), 0)
    const transferredTotal = items.reduce((sum, item) => sum + (item.qtyTransferred * item.costPerUnit), 0)
    const totalItems = items.length
    const pendingItems = items.filter(i => i.approvalStatus === 'Pending').length
    const approvedItems = items.filter(i => i.approvalStatus === 'Approved').length
    const rejectedItems = items.filter(i => i.approvalStatus === 'Reject').length
    const reviewItems = items.filter(i => i.approvalStatus === 'Review').length
    return { requestedTotal, approvedTotal, transferredTotal, totalItems, pendingItems, approvedItems, rejectedItems, reviewItems }
  }, [items])

  // Event Handlers
  const handleSelectAll = (checked: boolean) => {
    setSelectedItems(checked ? items.map(item => item.id) : [])
  }

  const handleSelectItem = (id: number, checked: boolean) => {
    setSelectedItems(prev =>
      checked ? [...prev, id] : prev.filter(itemId => itemId !== id)
    )
  }

  const toggleItemExpansion = (id: number) => {
    setExpandedItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    )
  }

  const handleBulkAction = (action: 'Approve' | 'Reject' | 'Review') => {
    setItems(prev => prev.map(item =>
      selectedItems.includes(item.id) ? { ...item, approvalStatus: action === 'Approve' ? 'Approved' : action === 'Reject' ? 'Reject' : 'Review' } : item
    ))
    setSelectedItems([])
  }

  const handleQuantityUpdate = (itemId: number, field: 'qtyRequired' | 'qtyApproved', value: number) => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, [field]: value, total: field === 'qtyApproved' ? value * item.costPerUnit : item.total } : item
    ))
  }

  const handleItemApprovalChange = (itemId: number, status: 'Pending' | 'Approved' | 'Reject' | 'Review') => {
    setItems(prev => prev.map(item =>
      item.id === itemId ? { ...item, approvalStatus: status } : item
    ))
  }

  // Inline Add Item handlers
  const handleConfirmAddItem = () => {
    const selectedProduct = mockProducts.find(p => p.id === newItemProductId)
    if (!selectedProduct) return

    const newId = Math.max(...items.map(i => i.id), 0) + 1
    const costPerUnit = selectedProduct.standardCost?.amount || 0
    const newItem: TransferItem = {
      id: newId,
      description: selectedProduct.description || selectedProduct.productName,
      productCode: selectedProduct.productCode,
      productName: selectedProduct.productName,
      category: selectedProduct.categoryId || 'General',
      unit: selectedProduct.baseUnit,
      qtyRequired: newItemQty,
      qtyApproved: 0,
      qtyTransferred: 0,
      costPerUnit: costPerUnit,
      total: costPerUnit * newItemQty,
      currentStock: Math.floor(Math.random() * 20), // Mock current stock
      parLevel: Math.floor(Math.random() * 50) + 20, // Mock PAR level
      sourceAvailable: Math.floor(Math.random() * 100) + 10, // Mock source available
      approvalStatus: 'Pending',
      itemInfo: {
        itemName: selectedProduct.productName,
        category: selectedProduct.categoryId || 'General',
        subCategory: 'General',
        itemGroup: 'General',
        barCode: selectedProduct.productCode
      }
    }

    setItems([...items, newItem])
    setIsAddingItem(false)
    setNewItemProductId('')
    setNewItemQty(1)
  }

  const handleCancelAddItem = () => {
    setIsAddingItem(false)
    setNewItemProductId('')
    setNewItemQty(1)
  }

  const handleRemoveItem = (itemId: number) => {
    setItems(items.filter(item => item.id !== itemId))
  }

  // Workflow action logic
  const getWorkflowActions = () => {
    const { totalItems, pendingItems, approvedItems, rejectedItems, reviewItems } = totals
    let primaryAction = null

    if (request.status === 'Draft') {
      primaryAction = {
        type: 'submit',
        label: 'Submit for Approval',
        variant: 'default' as const,
        className: 'bg-blue-600 hover:bg-blue-700',
        icon: Send,
        disabled: totalItems === 0
      }
    } else if (request.status === 'In Process') {
      if (pendingItems > 0) {
        primaryAction = {
          type: 'waiting',
          label: `Review ${pendingItems} Pending Items`,
          variant: 'outline' as const,
          className: 'text-amber-600 border-amber-200',
          icon: Clock,
          disabled: true
        }
      } else if (rejectedItems === totalItems) {
        primaryAction = {
          type: 'reject',
          label: 'Reject Request',
          variant: 'destructive' as const,
          className: '',
          icon: XCircle,
          disabled: false
        }
      } else if (approvedItems === totalItems) {
        primaryAction = {
          type: 'approve-all',
          label: 'Approve All & Start Transfer',
          variant: 'default' as const,
          className: 'bg-green-600 hover:bg-green-700',
          icon: Truck,
          disabled: false
        }
      } else if (reviewItems > 0) {
        primaryAction = {
          type: 'return',
          label: `Return ${reviewItems} for Review`,
          variant: 'outline' as const,
          className: 'text-orange-600 border-orange-200',
          icon: RotateCcw,
          disabled: false
        }
      } else if (approvedItems > 0) {
        primaryAction = {
          type: 'partial-approve',
          label: `Approve ${approvedItems} Items & Transfer`,
          variant: 'default' as const,
          className: 'bg-green-600 hover:bg-green-700',
          icon: Truck,
          disabled: false
        }
      }
    }

    return { action: primaryAction, summary: totals }
  }

  const workflowActions = getWorkflowActions()

  return (
    <div className="w-full px-0 py-6">
      <div className="flex gap-4">
        {/* Main Content */}
        <div className={`transition-all duration-300 ${isSidePanelOpen ? 'flex-1' : 'w-full'}`}>
          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="p-6 pb-4 bg-muted/30 border-b space-y-6">
              {/* Top Actions */}
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => router.back()}
                      aria-label="Go back"
                      className="focus:ring-2 focus:ring-primary/20 flex-shrink-0"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex items-center gap-3 min-w-0">
                      <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">Stock Replenishment</CardTitle>
                      <StatusBadge status={request.status} />
                      <PriorityBadge priority={request.priority} />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {isEditMode ? (
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button
                          variant="outline"
                          className="flex items-center justify-center gap-2 border-muted-foreground/20 hover:bg-muted/50"
                          onClick={() => {
                            handleCancelAddItem()
                            setIsEditMode(false)
                          }}
                        >
                          <X className="w-4 h-4" />
                          <span>Cancel</span>
                        </Button>
                        <Button
                          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90"
                          onClick={() => {
                            handleCancelAddItem()
                            setIsEditMode(false)
                          }}
                        >
                          <Check className="w-4 h-4" />
                          <span>Save Changes</span>
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                        <Button
                          className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90"
                          onClick={() => setIsEditMode(true)}
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Edit</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center justify-center gap-2 border-muted-foreground/20 hover:bg-muted/50"
                        >
                          <Printer className="w-4 h-4" />
                          <span className="hidden sm:inline">Print</span>
                        </Button>
                        <Button
                          variant="outline"
                          className="flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <XCircle className="w-4 h-4" />
                          <span className="hidden sm:inline">Void</span>
                        </Button>
                      </div>
                    )}

                    {/* Side Panel Toggle */}
                    <Button
                      variant="outline"
                      size="icon"
                      className="flex-shrink-0 border-muted-foreground/20 hover:bg-muted/50"
                      onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                    >
                      {isSidePanelOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Header Information - Three Row Layout */}
              <div className="space-y-4 sm:space-y-6">
                {/* First Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Hash className="w-4 h-4" />
                      <span>Reference No.</span>
                    </div>
                    <p className="font-semibold">{request.refNo}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Request Date</span>
                    </div>
                    <p className="font-semibold">{request.date}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      <span>Expected Delivery</span>
                    </div>
                    {isEditMode ? (
                      <Input type="date" value={request.expectedDeliveryDate} className="h-8" />
                    ) : (
                      <p className="font-semibold">{request.expectedDeliveryDate}</p>
                    )}
                  </div>
                </div>

                {/* Second Row - Transfer Flow */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Warehouse className="w-4 h-4" />
                      <span>From (Source)</span>
                    </div>
                    <p className="font-semibold">{request.sourceLocationCode} : {request.sourceLocation}</p>
                  </div>

                  <div className="flex items-center justify-center">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>To (Destination)</span>
                    </div>
                    <p className="font-semibold">{request.destinationLocationCode} : {request.destinationLocation}</p>
                  </div>
                </div>

                {/* Third Row */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <User className="w-4 h-4" />
                      <span>Requested By</span>
                    </div>
                    <p className="font-semibold">{request.requestedBy}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building2 className="w-4 h-4" />
                      <span>Department</span>
                    </div>
                    <p className="font-semibold">{request.department}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="w-4 h-4" />
                      <span>Description</span>
                    </div>
                    <p className="font-semibold">{request.description}</p>
                  </div>
                </div>
              </div>

              <Separator className="my-4" />
            </CardHeader>

            {/* Tabs */}
            <Tabs defaultValue="items" className="w-full">
              <CardHeader className="pb-0 pt-4 px-4">
                <TabsList className="w-full grid grid-cols-4">
                  <TabsTrigger value="items" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Items
                  </TabsTrigger>
                  <TabsTrigger value="stock-info" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Stock Info
                  </TabsTrigger>
                  <TabsTrigger value="timeline" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Timeline
                  </TabsTrigger>
                  <TabsTrigger value="approval" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                    Approval
                  </TabsTrigger>
                </TabsList>
              </CardHeader>

              <CardContent className="p-0">
                <div className="w-full rounded-b-md border-t">
                  <div className="p-6">
                    {/* Items Tab */}
                    <TabsContent value="items" className="mt-0">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <h3 className="text-xl font-semibold">Transfer Items</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{items.length} items</Badge>
                            {isEditMode && !isAddingItem && (
                              <Button
                                size="sm"
                                onClick={() => setIsAddingItem(true)}
                                className="bg-primary hover:bg-primary/90"
                              >
                                <Plus className="h-4 w-4 mr-1" />
                                Add Item
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Bulk Actions */}
                        {selectedItems.length > 0 && (
                          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-center gap-1">
                              <Check className="w-4 h-4 text-blue-600" />
                              <span className="font-medium text-blue-900 text-sm">
                                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50" onClick={() => handleBulkAction('Approve')}>
                                <Check className="w-4 h-4 mr-1" />
                                Approve
                              </Button>
                              <Button variant="outline" size="sm" className="text-yellow-600 border-yellow-200 hover:bg-yellow-50" onClick={() => handleBulkAction('Review')}>
                                <AlertCircle className="w-4 h-4 mr-1" />
                                Review
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleBulkAction('Reject')}>
                                <XCircle className="w-4 h-4 mr-1" />
                                Reject
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-500" onClick={() => setSelectedItems([])}>
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        )}

                        {/* Items Table */}
                        <div className="border rounded-lg overflow-x-auto">
                          <table className="w-full min-w-[900px]">
                            <thead>
                              <tr className="border-b bg-gray-50">
                                <th className="text-left p-3 text-xs font-medium text-gray-500">
                                  <input
                                    type="checkbox"
                                    className="rounded border-gray-300"
                                    checked={selectedItems.length === items.length}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                  />
                                </th>
                                <th className="text-left p-3 text-xs font-medium text-gray-500 min-w-[180px]">Product</th>
                                <th className="text-left p-3 text-xs font-medium text-gray-500">Unit</th>
                                <th className="text-right p-3 text-xs font-medium text-gray-500">Current</th>
                                <th className="text-right p-3 text-xs font-medium text-gray-500">PAR</th>
                                <th className="text-right p-3 text-xs font-medium text-gray-500">Available</th>
                                <th className="text-right p-3 text-xs font-medium text-gray-500">Required</th>
                                <th className="text-right p-3 text-xs font-medium text-gray-500">Approved</th>
                                <th className="text-right p-3 text-xs font-medium text-gray-500">Unit Price</th>
                                <th className="text-right p-3 text-xs font-medium text-gray-500">Total</th>
                                <th className="text-center p-3 text-xs font-medium text-gray-500">Status</th>
                                <th className="text-right p-3 text-xs font-medium text-gray-500 w-[80px]">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {items.map((item) => (
                                <React.Fragment key={item.id}>
                                  <tr className="group hover:bg-gray-50">
                                    <td className="p-3">
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="checkbox"
                                          className="rounded border-gray-300"
                                          checked={selectedItems.includes(item.id)}
                                          onChange={(e) => handleSelectItem(item.id, e.target.checked)}
                                        />
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => toggleItemExpansion(item.id)}
                                          className="p-1 h-6 w-6"
                                        >
                                          <ChevronRight className={`h-4 w-4 transition-transform ${expandedItems.includes(item.id) ? 'rotate-90' : ''}`} />
                                        </Button>
                                      </div>
                                    </td>
                                    <td className="p-3">
                                      <div className="space-y-1">
                                        <p className="font-medium text-gray-700 text-sm">{item.productName}</p>
                                        <p className="text-xs text-gray-500">{item.productCode}</p>
                                      </div>
                                    </td>
                                    <td className="p-3 text-sm">{item.unit}</td>
                                    <td className="p-3 text-right">
                                      <span className={`text-sm tabular-nums ${item.currentStock < item.parLevel * 0.3 ? 'text-red-600 font-medium' : ''}`}>
                                        {formatNumber(item.currentStock)}
                                      </span>
                                    </td>
                                    <td className="p-3 text-right text-sm tabular-nums">{formatNumber(item.parLevel)}</td>
                                    <td className="p-3 text-right">
                                      <span className={`text-sm tabular-nums ${item.sourceAvailable === 0 ? 'text-red-600' : 'text-blue-600'}`}>
                                        {formatNumber(item.sourceAvailable)}
                                      </span>
                                    </td>
                                    <td className="p-3 text-right">
                                      {isEditMode ? (
                                        <Input
                                          type="number"
                                          value={item.qtyRequired}
                                          onChange={(e) => handleQuantityUpdate(item.id, 'qtyRequired', parseInt(e.target.value) || 0)}
                                          className="w-16 h-8 text-right text-sm"
                                        />
                                      ) : (
                                        <span className="text-sm tabular-nums">{formatNumber(item.qtyRequired)}</span>
                                      )}
                                    </td>
                                    <td className="p-3 text-right">
                                      {isEditMode ? (
                                        <Input
                                          type="number"
                                          value={item.qtyApproved}
                                          onChange={(e) => handleQuantityUpdate(item.id, 'qtyApproved', parseInt(e.target.value) || 0)}
                                          className="w-16 h-8 text-right text-sm"
                                        />
                                      ) : (
                                        <span className={`text-sm tabular-nums ${item.qtyApproved !== item.qtyRequired ? 'text-yellow-600' : ''}`}>
                                          {formatNumber(item.qtyApproved)}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-3 text-right text-sm tabular-nums">${item.costPerUnit.toFixed(2)}</td>
                                    <td className="p-3 text-right text-sm tabular-nums font-medium">${(item.qtyApproved * item.costPerUnit).toFixed(2)}</td>
                                    <td className="p-3 text-center"><ItemApprovalBadge status={item.approvalStatus} /></td>
                                    <td className="p-3 text-right">
                                      <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                          <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreHorizontal className="h-4 w-4" />
                                          </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                          <DropdownMenuItem onClick={() => handleItemApprovalChange(item.id, 'Approved')}>
                                            <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                                            Approve
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleItemApprovalChange(item.id, 'Review')}>
                                            <AlertCircle className="h-4 w-4 mr-2 text-yellow-600" />
                                            Mark for Review
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => handleItemApprovalChange(item.id, 'Reject')} className="text-red-600">
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Reject
                                          </DropdownMenuItem>
                                          {isEditMode && (
                                            <>
                                              <DropdownMenuSeparator />
                                              <DropdownMenuItem onClick={() => handleRemoveItem(item.id)} className="text-red-600">
                                                <Trash2 className="h-4 w-4 mr-2" />
                                                Remove Item
                                              </DropdownMenuItem>
                                            </>
                                          )}
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </td>
                                  </tr>

                                  {/* Expanded Row - Item Details */}
                                  {expandedItems.includes(item.id) && (
                                    <tr className="bg-blue-50/50">
                                      <td colSpan={12} className="p-4">
                                        <div className="grid grid-cols-3 gap-6 text-sm">
                                          <div className="space-y-3">
                                            <h4 className="font-semibold text-gray-700">Item Information</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                              <div>
                                                <p className="text-muted-foreground text-xs">Category</p>
                                                <p className="font-medium">{item.itemInfo.category}</p>
                                              </div>
                                              <div>
                                                <p className="text-muted-foreground text-xs">Sub Category</p>
                                                <p className="font-medium">{item.itemInfo.subCategory}</p>
                                              </div>
                                              <div>
                                                <p className="text-muted-foreground text-xs">Item Group</p>
                                                <p className="font-medium">{item.itemInfo.itemGroup}</p>
                                              </div>
                                              <div>
                                                <p className="text-muted-foreground text-xs">Barcode</p>
                                                <p className="font-medium font-mono text-xs">{item.itemInfo.barCode}</p>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="space-y-3">
                                            <h4 className="font-semibold text-gray-700">Stock Analysis</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                              <div>
                                                <p className="text-muted-foreground text-xs">Stock Level</p>
                                                <p className="font-medium">{Math.round((item.currentStock / item.parLevel) * 100)}% of PAR</p>
                                              </div>
                                              <div>
                                                <p className="text-muted-foreground text-xs">Shortage</p>
                                                <p className="font-medium text-red-600">{formatNumber(item.parLevel - item.currentStock)} {item.unit}</p>
                                              </div>
                                              <div>
                                                <p className="text-muted-foreground text-xs">Can Fulfill</p>
                                                <p className={`font-medium ${item.sourceAvailable >= item.qtyRequired ? 'text-green-600' : 'text-amber-600'}`}>
                                                  {item.sourceAvailable >= item.qtyRequired ? 'Yes' : 'Partial'}
                                                </p>
                                              </div>
                                              <div>
                                                <p className="text-muted-foreground text-xs">Max Available</p>
                                                <p className="font-medium text-blue-600">{formatNumber(item.sourceAvailable)} {item.unit}</p>
                                              </div>
                                            </div>
                                          </div>
                                          <div className="space-y-3">
                                            <h4 className="font-semibold text-gray-700">Transfer Summary</h4>
                                            <div className="grid grid-cols-2 gap-2">
                                              <div>
                                                <p className="text-muted-foreground text-xs">Requested Value</p>
                                                <p className="font-medium">${(item.qtyRequired * item.costPerUnit).toFixed(2)}</p>
                                              </div>
                                              <div>
                                                <p className="text-muted-foreground text-xs">Approved Value</p>
                                                <p className="font-medium text-green-600">${(item.qtyApproved * item.costPerUnit).toFixed(2)}</p>
                                              </div>
                                              <div>
                                                <p className="text-muted-foreground text-xs">Variance</p>
                                                <p className={`font-medium ${item.qtyApproved < item.qtyRequired ? 'text-amber-600' : 'text-green-600'}`}>
                                                  {item.qtyApproved < item.qtyRequired ? '-' : ''}{formatNumber(Math.abs(item.qtyRequired - item.qtyApproved))} {item.unit}
                                                </p>
                                              </div>
                                              <div>
                                                <p className="text-muted-foreground text-xs">After Transfer</p>
                                                <p className="font-medium">{formatNumber(item.currentStock + item.qtyApproved)} {item.unit}</p>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </td>
                                    </tr>
                                  )}
                                </React.Fragment>
                              ))}

                              {/* Inline Add Item Row - Only visible in Edit mode */}
                              {isAddingItem && isEditMode && (
                                <tr className="bg-blue-50/50 border-t-2 border-blue-200">
                                  <td className="p-3">
                                    {/* Empty checkbox column */}
                                  </td>
                                  <td className="p-3">
                                    <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                                      <PopoverTrigger asChild>
                                        <Button
                                          variant="outline"
                                          role="combobox"
                                          aria-expanded={productSearchOpen}
                                          className="w-full justify-between h-9 text-sm"
                                        >
                                          {newItemProductId
                                            ? mockProducts.find(p => p.id === newItemProductId)?.productName
                                            : "Select product..."}
                                          <ChevronRight className="ml-2 h-4 w-4 shrink-0 opacity-50 rotate-90" />
                                        </Button>
                                      </PopoverTrigger>
                                      <PopoverContent className="w-[300px] p-0" align="start">
                                        <Command>
                                          <CommandInput placeholder="Search products..." />
                                          <CommandList>
                                            <CommandEmpty>No product found.</CommandEmpty>
                                            <CommandGroup>
                                              {mockProducts.slice(0, 20).map((product) => (
                                                <CommandItem
                                                  key={product.id}
                                                  value={product.productName}
                                                  onSelect={() => {
                                                    setNewItemProductId(product.id)
                                                    setProductSearchOpen(false)
                                                  }}
                                                >
                                                  <div className="flex flex-col">
                                                    <span className="font-medium">{product.productName}</span>
                                                    <span className="text-xs text-muted-foreground">{product.productCode}</span>
                                                  </div>
                                                </CommandItem>
                                              ))}
                                            </CommandGroup>
                                          </CommandList>
                                        </Command>
                                      </PopoverContent>
                                    </Popover>
                                  </td>
                                  <td className="p-3 text-sm text-muted-foreground">
                                    {newItemProductId ? mockProducts.find(p => p.id === newItemProductId)?.baseUnit || '-' : '-'}
                                  </td>
                                  <td className="p-3 text-right text-sm text-muted-foreground">-</td>
                                  <td className="p-3 text-right text-sm text-muted-foreground">-</td>
                                  <td className="p-3 text-right text-sm text-muted-foreground">-</td>
                                  <td className="p-3 text-right">
                                    <Input
                                      type="number"
                                      min={1}
                                      value={newItemQty}
                                      onChange={(e) => setNewItemQty(parseInt(e.target.value) || 1)}
                                      className="w-16 h-8 text-right text-sm"
                                    />
                                  </td>
                                  <td className="p-3 text-right text-sm text-muted-foreground">-</td>
                                  <td className="p-3 text-right text-sm text-muted-foreground">
                                    {newItemProductId
                                      ? `$${(mockProducts.find(p => p.id === newItemProductId)?.standardCost?.amount || 0).toFixed(2)}`
                                      : '-'}
                                  </td>
                                  <td className="p-3 text-right text-sm text-muted-foreground">
                                    {newItemProductId
                                      ? `$${((mockProducts.find(p => p.id === newItemProductId)?.standardCost?.amount || 0) * newItemQty).toFixed(2)}`
                                      : '-'}
                                  </td>
                                  <td className="p-3 text-center">
                                    <Badge variant="outline" className="text-xs bg-gray-100 text-gray-600">New</Badge>
                                  </td>
                                  <td className="p-3 text-right">
                                    <div className="flex items-center justify-end gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleConfirmAddItem}
                                        disabled={!newItemProductId}
                                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                                      >
                                        <Check className="h-4 w-4" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleCancelAddItem}
                                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                      >
                                        <X className="h-4 w-4" />
                                      </Button>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>

                        {/* Transaction Summary */}
                        <div className="flex justify-end">
                          <div className="w-full md:w-80 space-y-2 p-4 bg-muted/30 rounded-lg border">
                            <h4 className="font-semibold mb-3">Transaction Summary</h4>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Total Items:</span>
                              <span className="font-medium tabular-nums">{totals.totalItems}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Requested Value:</span>
                              <span className="tabular-nums">${formatNumber(totals.requestedTotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Approved Value:</span>
                              <span className="font-medium text-green-600 tabular-nums">${formatNumber(totals.approvedTotal)}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Approved:</span>
                              <span className="text-green-600 tabular-nums">{totals.approvedItems}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Pending:</span>
                              <span className="text-amber-600 tabular-nums">{totals.pendingItems}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Rejected:</span>
                              <span className="text-red-600 tabular-nums">{totals.rejectedItems}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Stock Info Tab */}
                    <TabsContent value="stock-info" className="mt-0">
                      <div className="space-y-6">
                        <h3 className="text-xl font-semibold">Stock Level Analysis</h3>

                        <div className="grid md:grid-cols-4 gap-4">
                          <Card className="border-red-200 bg-red-50">
                            <CardContent className="pt-4">
                              <div className="flex items-center gap-2">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <span className="text-sm text-red-700">Below 30% PAR</span>
                              </div>
                              <p className="text-2xl font-bold text-red-600 mt-2">
                                {items.filter(i => (i.currentStock / i.parLevel) < 0.3).length}
                              </p>
                            </CardContent>
                          </Card>
                          <Card className="border-amber-200 bg-amber-50">
                            <CardContent className="pt-4">
                              <div className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-amber-600" />
                                <span className="text-sm text-amber-700">30-60% PAR</span>
                              </div>
                              <p className="text-2xl font-bold text-amber-600 mt-2">
                                {items.filter(i => (i.currentStock / i.parLevel) >= 0.3 && (i.currentStock / i.parLevel) < 0.6).length}
                              </p>
                            </CardContent>
                          </Card>
                          <Card className="border-green-200 bg-green-50">
                            <CardContent className="pt-4">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-green-600" />
                                <span className="text-sm text-green-700">Above 60% PAR</span>
                              </div>
                              <p className="text-2xl font-bold text-green-600 mt-2">
                                {items.filter(i => (i.currentStock / i.parLevel) >= 0.6).length}
                              </p>
                            </CardContent>
                          </Card>
                          <Card className="border-blue-200 bg-blue-50">
                            <CardContent className="pt-4">
                              <div className="flex items-center gap-2">
                                <Package className="h-5 w-5 text-blue-600" />
                                <span className="text-sm text-blue-700">Total Items</span>
                              </div>
                              <p className="text-2xl font-bold text-blue-600 mt-2">{items.length}</p>
                            </CardContent>
                          </Card>
                        </div>

                        {/* Stock Level Table */}
                        <div className="border rounded-lg overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b bg-gray-50">
                                <th className="text-left p-3 text-xs font-medium text-gray-500">Product</th>
                                <th className="text-right p-3 text-xs font-medium text-gray-500">Current Stock</th>
                                <th className="text-right p-3 text-xs font-medium text-gray-500">PAR Level</th>
                                <th className="text-right p-3 text-xs font-medium text-gray-500">Shortage</th>
                                <th className="text-right p-3 text-xs font-medium text-gray-500">Stock %</th>
                                <th className="text-right p-3 text-xs font-medium text-gray-500">Source Available</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y">
                              {items.map((item) => {
                                const stockPercent = Math.round((item.currentStock / item.parLevel) * 100)
                                const shortage = item.parLevel - item.currentStock
                                return (
                                  <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="p-3">
                                      <div>
                                        <p className="font-medium text-sm">{item.productName}</p>
                                        <p className="text-xs text-muted-foreground">{item.productCode}</p>
                                      </div>
                                    </td>
                                    <td className="p-3 text-right">
                                      <span className={`text-sm tabular-nums ${item.currentStock < item.parLevel * 0.3 ? 'text-red-600 font-medium' : ''}`}>
                                        {formatNumber(item.currentStock)} {item.unit}
                                      </span>
                                    </td>
                                    <td className="p-3 text-right text-sm tabular-nums">{formatNumber(item.parLevel)} {item.unit}</td>
                                    <td className="p-3 text-right">
                                      <span className="text-sm tabular-nums text-red-600 font-medium">
                                        -{formatNumber(shortage)} {item.unit}
                                      </span>
                                    </td>
                                    <td className="p-3 text-right">
                                      <div className="flex items-center justify-end gap-2">
                                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                                          <div
                                            className={`h-full rounded-full ${stockPercent < 30 ? 'bg-red-500' : stockPercent < 60 ? 'bg-amber-500' : 'bg-green-500'}`}
                                            style={{ width: `${Math.min(stockPercent, 100)}%` }}
                                          />
                                        </div>
                                        <span className="text-sm tabular-nums w-10 text-right">{stockPercent}%</span>
                                      </div>
                                    </td>
                                    <td className="p-3 text-right">
                                      <span className={`text-sm tabular-nums ${item.sourceAvailable >= shortage ? 'text-green-600' : 'text-amber-600'}`}>
                                        {formatNumber(item.sourceAvailable)} {item.unit}
                                      </span>
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </TabsContent>

                    {/* Timeline Tab */}
                    <TabsContent value="timeline" className="mt-0">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold flex items-center gap-2">
                          <History className="h-5 w-5" />
                          Activity Timeline
                        </h3>

                        <div className="space-y-4">
                          {request.timeline.map((event, index) => (
                            <div key={index} className="flex gap-4">
                              <div className="flex flex-col items-center">
                                <div className={`h-3 w-3 rounded-full ${index === request.timeline.length - 1 ? 'bg-green-500' : 'bg-blue-500'}`} />
                                {index < request.timeline.length - 1 && <div className="w-px h-full bg-border flex-1 mt-1" />}
                              </div>
                              <div className="pb-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{event.action}</span>
                                  <span className="text-xs text-muted-foreground">by {event.user}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">{event.date}</p>
                                {event.notes && <p className="text-sm mt-1">{event.notes}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </TabsContent>

                    {/* Approval Tab */}
                    <TabsContent value="approval" className="mt-0">
                      <div className="space-y-4">
                        <h3 className="text-xl font-semibold">Approval Workflow</h3>

                        {/* Approval Steps */}
                        <div className="space-y-4">
                          {request.approvalSteps.map((step, index) => (
                            <div key={step.id} className="flex items-start gap-4">
                              <div className="flex flex-col items-center">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                                  step.status === 'approved' ? 'bg-green-100 text-green-600' :
                                  step.status === 'current' ? 'bg-blue-100 text-blue-600' :
                                  step.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                  'bg-gray-100 text-gray-400'
                                }`}>
                                  {step.status === 'approved' ? <Check className="h-4 w-4" /> :
                                   step.status === 'rejected' ? <X className="h-4 w-4" /> :
                                   step.status === 'current' ? <Clock className="h-4 w-4" /> :
                                   <span className="text-xs">{index + 1}</span>}
                                </div>
                                {index < request.approvalSteps.length - 1 && (
                                  <div className={`w-px h-12 mt-2 ${step.status === 'approved' ? 'bg-green-200' : 'bg-gray-200'}`} />
                                )}
                              </div>
                              <div className="flex-1 pb-4">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{step.level}</span>
                                  <Badge variant="outline" className={
                                    step.status === 'approved' ? 'bg-green-100 text-green-700 border-green-200' :
                                    step.status === 'current' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                    step.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                                    'bg-gray-100 text-gray-600 border-gray-200'
                                  }>
                                    {step.status === 'approved' ? 'Approved' :
                                     step.status === 'current' ? 'Current' :
                                     step.status === 'rejected' ? 'Rejected' : 'Pending'}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {step.approver} {step.approvedAt && `• ${step.approvedAt}`}
                                </p>
                                {step.comments && <p className="text-sm mt-1 text-gray-600">{step.comments}</p>}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Action Section */}
                        {request.status === 'In Process' && (
                          <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                            <h4 className="font-semibold text-blue-800 mb-3">Action Required</h4>

                            {/* Item Status Summary */}
                            <div className="flex gap-4 mb-4 text-sm">
                              <Badge variant="outline" className="bg-green-50">{totals.approvedItems} Approved</Badge>
                              <Badge variant="outline" className="bg-amber-50">{totals.pendingItems} Pending</Badge>
                              <Badge variant="outline" className="bg-red-50">{totals.rejectedItems} Rejected</Badge>
                              <Badge variant="outline" className="bg-yellow-50">{totals.reviewItems} Review</Badge>
                            </div>

                            {totals.pendingItems > 0 ? (
                              <div className="p-3 bg-amber-50 rounded border border-amber-200">
                                <p className="text-amber-800 text-sm">
                                  <AlertTriangle className="h-4 w-4 inline mr-2" />
                                  Please review and approve/reject all pending items before proceeding.
                                </p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <Textarea placeholder="Add comments (optional)..." rows={3} />
                                <div className="flex gap-2">
                                  {workflowActions.action && (
                                    <Button className={workflowActions.action.className} disabled={workflowActions.action.disabled}>
                                      {workflowActions.action.icon && <workflowActions.action.icon className="h-4 w-4 mr-2" />}
                                      {workflowActions.action.label}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </TabsContent>
                  </div>
                </div>
              </CardContent>
            </Tabs>
          </Card>

          {/* Floating Action Button */}
          {workflowActions.action && request.status === 'In Process' && (
            <div className="fixed bottom-6 right-6 z-50">
              <Button
                size="lg"
                className={`shadow-lg ${workflowActions.action.className}`}
                disabled={workflowActions.action.disabled}
              >
                {workflowActions.action.icon && <workflowActions.action.icon className="h-5 w-5 mr-2" />}
                {workflowActions.action.label}
              </Button>
            </div>
          )}
        </div>

        {/* Side Panel */}
        {isSidePanelOpen && (
          <div className="w-80 flex-shrink-0">
            <div className="sticky top-6 space-y-4">
              {/* Comments Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Comments ({request.comments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {request.comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{comment.by}</span>
                        <span className="text-xs text-muted-foreground">{comment.date}</span>
                      </div>
                      <p className="text-sm text-gray-600">{comment.comment}</p>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Textarea
                      placeholder="Add a comment..."
                      rows={2}
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      className="text-sm"
                    />
                    <Button size="sm" className="mt-2 w-full" disabled={!newComment.trim()}>
                      Add Comment
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Attachments Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Paperclip className="h-4 w-4" />
                    Attachments ({request.attachments.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {request.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{attachment.fileName}</p>
                        <p className="text-xs text-muted-foreground">{attachment.date}</p>
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Attachment
                  </Button>
                </CardContent>
              </Card>

              {/* Low Stock Warning */}
              {items.some(item => (item.currentStock / item.parLevel) < 0.3) && (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="pt-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-800">Critical Stock Alert</p>
                        <p className="text-sm text-red-700">
                          {items.filter(i => (i.currentStock / i.parLevel) < 0.3).length} items are below 30% PAR level.
                          Prioritize this transfer request.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
