/**
 * Store Requisition Detail Component
 *
 * Displays and manages individual store requisition records with full workflow support.
 *
 * GENERATED DOCUMENTS:
 * - Stock Transfer (ST): Moves stock between inventory locations
 * - Stock Issue (SI): Issues stock to expense/direct locations
 *
 * NOTE: Purchase Request (PR) document type was removed from Store Requisitions.
 * PR generation is now exclusively handled via Stock Replenishment module.
 * This component only displays ST and SI document references.
 *
 * LOCATION TYPE AWARE ISSUE PROCESSING:
 * The issue process handles items differently based on the destination location type:
 *
 * - INVENTORY: Standard issue process
 *   - Creates inventory transaction with FIFO costing
 *   - Updates stock balance
 *   - GL: Debit Department Expense, Credit Inventory Asset
 *
 * - DIRECT: Simplified issue (items already expensed)
 *   - No stock movement created (items expensed on receipt)
 *   - Records for operational metrics only
 *   - GL: No additional journal entry needed
 *
 * - CONSIGNMENT: Vendor-owned issue
 *   - Creates inventory transaction
 *   - Updates vendor-owned stock balance
 *   - Triggers vendor notification
 *   - GL: Debit Department Expense, Credit Consignment Liability
 */

'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ChevronLeft,
  Printer,
  Edit2,
  XCircle,
  MessageSquarePlus,
  Calendar,
  Building2,
  Store,
  FileText,
  Tags,
  Hash,
  ListTodo,
  MessageSquare,
  Paperclip,
  History,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Split,
  X,
  Calculator,
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  PanelRightOpen,
  PanelRightClose,
  CheckCircle,
  UserCheck,
  User,
  Clock,
  Undo2,
  MoreHorizontal,
  Package,
  DollarSign,
  Truck
} from 'lucide-react'
import { InventoryLocationType } from '@/lib/types/location-management'
import {
  shouldRecordStockMovement,
  getIssueProcessBehavior,
  requiresVendorNotification,
  getLocationTypeLabel,
} from '@/lib/utils/location-type-helpers'
import { LocationTypeBadge, LocationTypeAlert } from '@/components/location-type-badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Separator } from '@/components/ui/separator'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Box } from 'lucide-react'
import StatusBadge from '@/components/ui/custom-status-badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from '@/components/ui/input'
import { ApprovalLogDialog } from './approval-log-dialog'
import { JournalEntriesTab } from './tabs/journal-entries-tab'
import { GeneratedDocumentsTab } from './tabs/generated-documents-tab'
import { ApprovalWorkflow } from './approval-workflow'
import { GeneratedDocumentReference, GeneratedDocumentType } from '@/lib/types/store-requisition'
import { formatNumber, formatCurrency } from '@/lib/utils/formatters'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { mockProducts } from '@/lib/mock-data/products'
import { mockDepartments } from '@/lib/mock-data'
import { mockUserLocationAssignments, mockInventoryLocations } from '@/lib/mock-data/inventory-locations'
import { ChevronsUpDown, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'

/**
 * Convert string location type to InventoryLocationType enum
 *
 * Maps legacy string values (used in mock data) to the standardized enum.
 * This helper ensures backward compatibility with existing data structures.
 *
 * @param locationType - String location type ('inventory', 'direct', 'consignment')
 * @returns InventoryLocationType enum value
 */
function parseLocationType(locationType: string): InventoryLocationType {
  switch (locationType.toLowerCase()) {
    case 'inventory':
    case 'inv':
      return InventoryLocationType.INVENTORY
    case 'direct':
    case 'dir':
      return InventoryLocationType.DIRECT
    case 'consignment':
    case 'con':
      return InventoryLocationType.CONSIGNMENT
    default:
      // Default to INVENTORY for unknown types
      return InventoryLocationType.INVENTORY
  }
}

/**
 * Get location type icon component
 *
 * Returns the appropriate Lucide icon for the location type.
 *
 * @param locationType - String location type
 * @returns JSX element with the appropriate icon
 */
function getLocationTypeIcon(locationType: string) {
  const enumType = parseLocationType(locationType)
  switch (enumType) {
    case InventoryLocationType.INVENTORY:
      return <Package className="h-4 w-4" />
    case InventoryLocationType.DIRECT:
      return <DollarSign className="h-4 w-4" />
    case InventoryLocationType.CONSIGNMENT:
      return <Truck className="h-4 w-4" />
  }
}

/**
 * Get icon for document type
 * NOTE: PURCHASE_REQUEST case was removed - PR workflow moved to Stock Replenishment
 */
function getDocumentTypeIcon(type: GeneratedDocumentType) {
  switch (type) {
    case GeneratedDocumentType.STOCK_TRANSFER:
      return <Truck className="h-4 w-4" />
    case GeneratedDocumentType.STOCK_ISSUE:
      return <Package className="h-4 w-4" />
    default:
      return <FileText className="h-4 w-4" />
  }
}

/**
 * Get badge styling for document type
 * NOTE: PURCHASE_REQUEST case was removed - PR workflow moved to Stock Replenishment
 */
function getDocumentTypeBadgeStyle(type: GeneratedDocumentType): { bg: string; text: string; border: string } {
  switch (type) {
    case GeneratedDocumentType.STOCK_TRANSFER:
      return { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' }
    case GeneratedDocumentType.STOCK_ISSUE:
      return { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' }
    default:
      return { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' }
  }
}

/**
 * Get document type label
 * NOTE: PURCHASE_REQUEST case was removed - PR workflow moved to Stock Replenishment
 */
function getDocumentTypeLabel(type: GeneratedDocumentType): string {
  switch (type) {
    case GeneratedDocumentType.STOCK_TRANSFER:
      return 'Stock Transfer'
    case GeneratedDocumentType.STOCK_ISSUE:
      return 'Stock Issue'
    default:
      return 'Document'
  }
}

/**
 * Get link path for document type
 * NOTE: PURCHASE_REQUEST case was removed - PR workflow moved to Stock Replenishment
 */
function getDocumentLinkPath(doc: GeneratedDocumentReference): string {
  switch (doc.documentType) {
    case GeneratedDocumentType.STOCK_TRANSFER:
      return `/store-operations/stock-transfers/${doc.documentId}`
    case GeneratedDocumentType.STOCK_ISSUE:
      return `/store-operations/stock-issues/${doc.documentId}`
    default:
      return '#'
  }
}

// Mock Job Codes
interface JobCode {
  id: string
  code: string
  name: string
  description: string
  isActive: boolean
}

const initialJobCodes: JobCode[] = [
  { id: 'job-001', code: 'N/A', name: 'Not Available', description: 'No specific job code assigned', isActive: true },
  { id: 'job-002', code: 'EVT-001', name: 'Monthly Event', description: 'Regular monthly events and functions', isActive: true },
  { id: 'job-003', code: 'EVT-002', name: 'Special Occasion', description: 'Special events like weddings, conferences', isActive: true },
  { id: 'job-004', code: 'MAINT-001', name: 'Routine Maintenance', description: 'Regular maintenance activities', isActive: true },
  { id: 'job-005', code: 'MAINT-002', name: 'Emergency Repair', description: 'Urgent repair and maintenance', isActive: true },
  { id: 'job-006', code: 'PROJ-001', name: 'Renovation 2024', description: 'Property renovation project', isActive: true },
  { id: 'job-007', code: 'PROJ-002', name: 'Kitchen Upgrade', description: 'Kitchen equipment upgrade project', isActive: true },
]

// Mock Projects
interface Project {
  id: string
  code: string
  name: string
  description: string
  isActive: boolean
}

const initialProjects: Project[] = [
  { id: 'proj-001', code: 'GEN', name: 'General Operations', description: 'Day-to-day operational expenses', isActive: true },
  { id: 'proj-002', code: 'REN-2024', name: 'Renovation 2024', description: '2024 property renovation project', isActive: true },
  { id: 'proj-003', code: 'EXP-Q1', name: 'Q1 Expansion', description: 'First quarter expansion initiative', isActive: true },
  { id: 'proj-004', code: 'SUST', name: 'Sustainability', description: 'Green and sustainability initiatives', isActive: true },
  { id: 'proj-005', code: 'TECH', name: 'Technology Upgrade', description: 'IT and technology improvements', isActive: true },
  { id: 'proj-006', code: 'TRAIN', name: 'Staff Training', description: 'Training and development programs', isActive: true },
]

interface StoreRequisitionDetailProps {
  id: string
}

interface ItemInfo {
  // location and locationCode removed - now at document level (sourceLocationName, sourceLocationCode)
  itemName: string
  category: string
  subCategory: string
  itemGroup: string
  barCode: string
}

interface InventoryInfo {
  onHand: number
  onOrder: number
  lastPrice: number
  lastVendor: string
}

interface RequisitionItem {
  id: number
  description: string
  unit: string
  qtyRequired: number
  qtyApproved: number
  costPerUnit: number
  total: number
  requestDate: string
  inventory: InventoryInfo
  itemInfo: ItemInfo
  qtyIssued: number
  taxRate: number  // Tax rate as percentage (e.g., 7 for 7%)
  discountRate: number  // Discount rate as percentage (e.g., 5 for 5%)
  approvalStatus: 'Pending' | 'Approved' | 'Reject' | 'Review'
  // Business Dimensions - item level
  jobCodeId: string
  projectId: string
}

// This would come from your API/database
const mockRequisition: {
  refNo: string
  date: string
  expectedDeliveryDate: string
  movementType: string
  description: string
  requestedFrom: string
  sourceLocationId: string
  sourceLocationCode: string
  sourceLocationName: string
  sourceLocationType: InventoryLocationType
  requestedBy: string
  department: string
  jobCode: string
  process: string
  status: string
  items: RequisitionItem[]
  generatedDocuments: GeneratedDocumentReference[]
  sourceReplenishmentIds?: string[]
} & Record<string, any> = {
  refNo: 'SR-2410-001',
  date: '2024-01-15',
  expectedDeliveryDate: '2024-01-20',
  movementType: 'Issue',
  description: 'Monthly supplies request',
  requestedFrom: 'M01 : Main Store',
  sourceLocationId: 'loc-001',
  sourceLocationCode: 'M01',
  sourceLocationName: 'Main Store',
  sourceLocationType: InventoryLocationType.INVENTORY,
  requestedBy: 'Chef Maria Rodriguez',
  department: 'F&B Operations',
  jobCode: 'N/A : Not Available',
  process: '',
  status: 'In Process',
  items: [
    {
      id: 1,
      description: 'Thai Milk Tea (12 pack)',
      unit: 'Box',
      qtyRequired: 10,
      qtyApproved: 8,
      costPerUnit: 120.00,
      total: 960.00,
      requestDate: '2024-01-20',
      inventory: {
        onHand: 50,
        onOrder: 100,
        lastPrice: 118.00,
        lastVendor: 'Thai Beverages Co.'
      },
      itemInfo: {
        itemName: 'Thai Milk Tea',
        category: 'Beverage',
        subCategory: 'Tea',
        itemGroup: 'Packaged Drinks',
        barCode: '8851234567890'
      },
      qtyIssued: 5,
      taxRate: 7, // 7% tax
      discountRate: 2, // 2% discount
      approvalStatus: 'Approved' as const,
      jobCodeId: 'job-001',
      projectId: 'proj-001'
    },
    {
      id: 2,
      description: 'Coffee Beans (1kg)',
      unit: 'Bag',
      qtyRequired: 15,
      qtyApproved: 15,
      costPerUnit: 250.00,
      total: 3750.00,
      requestDate: '2024-01-20',
      inventory: {
        onHand: 30,
        onOrder: 50,
        lastPrice: 245.00,
        lastVendor: 'Premium Coffee Supply'
      },
      itemInfo: {
        itemName: 'Premium Coffee Beans',
        category: 'Beverage',
        subCategory: 'Coffee',
        itemGroup: 'Raw Materials',
        barCode: '8851234567891'
      },
      qtyIssued: 10,
      taxRate: 7, // 7% tax
      discountRate: 5, // 5% discount
      approvalStatus: 'Reject' as const,
      jobCodeId: 'job-002',
      projectId: 'proj-002'
    },
    {
      id: 3,
      description: 'Paper Cups (16oz)',
      unit: 'Pack',
      qtyRequired: 20,
      qtyApproved: 20,
      costPerUnit: 85.00,
      total: 1700.00,
      requestDate: '2024-01-20',
      inventory: {
        onHand: 100,
        onOrder: 200,
        lastPrice: 82.00,
        lastVendor: 'Packaging Solutions'
      },
      itemInfo: {
        itemName: 'Paper Cup 16oz',
        category: 'Packaging',
        subCategory: 'Cups',
        itemGroup: 'Disposables',
        barCode: '8851234567892'
      },
      qtyIssued: 15,
      taxRate: 10, // 10% tax
      discountRate: 3, // 3% discount
      approvalStatus: 'Approved' as const,
      jobCodeId: 'job-001',
      projectId: 'proj-003'
    },
    {
      id: 4,
      description: 'Chocolate Syrup',
      unit: 'Bottle',
      qtyRequired: 8,
      qtyApproved: 6,
      costPerUnit: 180.00,
      total: 1080.00,
      requestDate: '2024-01-20',
      inventory: {
        onHand: 15,
        onOrder: 30,
        lastPrice: 175.00,
        lastVendor: 'Sweet Supplies Co.'
      },
      itemInfo: {
        itemName: 'Chocolate Syrup',
        category: 'Ingredients',
        subCategory: 'Syrups',
        itemGroup: 'Flavorings',
        barCode: '8851234567893'
      },
      qtyIssued: 4,
      taxRate: 7, // 7% tax
      discountRate: 0, // No discount
      approvalStatus: 'Review' as const,
      jobCodeId: 'job-003',
      projectId: 'proj-001'
    },
    {
      id: 5,
      description: 'Plastic Straws',
      unit: 'Pack',
      qtyRequired: 25,
      qtyApproved: 25,
      costPerUnit: 45.00,
      total: 1125.00,
      requestDate: '2024-01-20',
      inventory: {
        onHand: 200,
        onOrder: 300,
        lastPrice: 43.00,
        lastVendor: 'Packaging Solutions'
      },
      itemInfo: {
        itemName: 'Plastic Straw',
        category: 'Packaging',
        subCategory: 'Straws',
        itemGroup: 'Disposables',
        barCode: '8851234567894'
      },
      qtyIssued: 20,
      taxRate: 8, // 8% tax
      discountRate: 1, // 1% discount
      approvalStatus: 'Approved' as const,
      jobCodeId: 'job-004',
      projectId: 'proj-001'
    },
    {
      id: 6,
      description: 'Green Tea Powder',
      unit: 'Kg',
      qtyRequired: 5,
      qtyApproved: 4,
      costPerUnit: 320.00,
      total: 1280.00,
      requestDate: '2024-01-20',
      inventory: {
        onHand: 8,
        onOrder: 20,
        lastPrice: 315.00,
        lastVendor: 'Tea Suppliers Inc.'
      },
      itemInfo: {
        itemName: 'Green Tea Powder',
        category: 'Beverage',
        subCategory: 'Tea',
        itemGroup: 'Raw Materials',
        barCode: '8851234567895'
      },
      qtyIssued: 3,
      taxRate: 7, // 7% tax
      discountRate: 4, // 4% discount
      approvalStatus: 'Reject' as const,
      jobCodeId: 'job-002',
      projectId: 'proj-004'
    },
    {
      id: 7,
      description: 'Vanilla Extract',
      unit: 'Bottle',
      qtyRequired: 4,
      qtyApproved: 0,
      costPerUnit: 150.00,
      total: 600.00,
      requestDate: '2024-01-20',
      inventory: {
        onHand: 12,
        onOrder: 25,
        lastPrice: 145.00,
        lastVendor: 'Flavor Essentials Ltd.'
      },
      itemInfo: {
        itemName: 'Vanilla Extract',
        category: 'Ingredients',
        subCategory: 'Extracts',
        itemGroup: 'Flavorings',
        barCode: '8851234567896'
      },
      qtyIssued: 0,
      taxRate: 6, // 6% tax
      discountRate: 0, // No discount
      approvalStatus: 'Pending' as const,
      jobCodeId: 'job-001',
      projectId: 'proj-001'
    }
  ],
  comments: [
    {
      id: 1,
      date: '2024-01-15',
      by: 'John Doe',
      comment: 'Approved quantities adjusted based on current stock levels'
    }
  ],
  attachments: [
    {
      id: 1,
      fileName: 'requisition_details.pdf',
      description: 'Detailed specifications',
      isPublic: true,
      date: '2024-01-15',
      by: 'John Doe'
    }
  ],
  activityLog: [
    {
      id: 1,
      date: '2024-01-15',
      by: 'John Doe',
      action: 'Created',
      log: 'Store requisition created'
    }
  ],
  generatedDocuments: [
    {
      id: 'gd-001',
      documentType: GeneratedDocumentType.STOCK_TRANSFER,
      documentId: 'st-001',
      refNo: 'ST-2410-001',
      status: 'completed',
      lineItemIds: ['item-1', 'item-2', 'item-3'],
      totalQuantity: 25,
      totalValue: { amount: 2500.00, currency: 'USD' },
      createdAt: new Date('2024-01-16')
    }
  ],
  // Source replenishment suggestions that triggered this SR
  sourceReplenishmentIds: ['rep-004', 'rep-005'],
  approvalSteps: [
    {
      id: 'submission',
      level: 'Submission',
      approver: 'System',
      role: 'system',
      status: 'approved' as const,
      comments: 'Store requisition submitted for approval workflow.',
      approvedAt: '2024-01-15 08:30 AM',
      isRequired: true
    },
    {
      id: 'hod',
      level: 'HOD Approval',
      approver: 'Dr. Amanda Lee',
      role: 'hod',
      status: 'approved' as const,
      comments: 'Items are necessary for department operations. Approved for next stage.',
      approvedAt: '2024-01-16 09:30 AM',
      isRequired: true
    },
    {
      id: 'store-manager',
      level: 'Store Manager Approval',
      approver: 'Mike Chen',
      role: 'store-manager', 
      status: 'current' as const,
      comments: '',
      isRequired: true
    },
    {
      id: 'complete',
      level: 'Complete',
      approver: 'System',
      role: 'system',
      status: 'pending' as const,
      comments: '',
      isRequired: true
    }
  ]
}

// Add mock data for stock movements
const mockStockMovements = [
  {
    id: 1,
    toLocation: 'Central Kitchen',
    itemName: 'Thai Milk Tea',
    itemDescription: 'Thai Milk Tea (12 pack)',
    lotNumber: 'LOT-2410-001',
    unit: 'Box',
    quantity: 8,
    cost: 120.00,
    totalCost: 960.00,
    netAmount: 960.00,
    extraCost: 0
  },
  {
    id: 2,
    toLocation: 'Roastery Store',
    itemName: 'Premium Coffee Beans',
    itemDescription: 'Coffee Beans (1kg)',
    lotNumber: 'LOT-2410-002',
    unit: 'Bag',
    quantity: 15,
    cost: 250.00,
    totalCost: 3750.00,
    netAmount: 3750.00,
    extraCost: 0
  },
  {
    id: 3,
    toLocation: 'Main Warehouse',
    itemName: 'Paper Cup 16oz',
    itemDescription: 'Paper Cups (16oz)',
    lotNumber: 'LOT-2410-003',
    unit: 'Pack',
    quantity: 20,
    cost: 85.00,
    totalCost: 1700.00,
    netAmount: 1700.00,
    extraCost: 0
  }
]

// Add type for approval logs
interface ApprovalLogEntry {
  id: number
  date: string
  status: 'Pending' | 'Approved' | 'Reject' | 'Review'
  by: string
  comments: string
}

interface ApprovalLogs {
  [key: number]: ApprovalLogEntry[]
}

// Update the mock data with proper typing
const mockApprovalLogs: ApprovalLogs = {
  1: [
    {
      id: 1,
      date: '2024-01-15 14:30',
      status: 'Approved',
      by: 'John Doe',
      comments: 'Quantity approved as requested'
    },
    {
      id: 2,
      date: '2024-01-15 10:15',
      status: 'Review',
      by: 'Jane Smith',
      comments: 'Please check stock availability'
    }
  ],
  2: [
    {
      id: 1,
      date: '2024-01-15 13:00',
      status: 'Reject',
      by: 'Mike Johnson',
      comments: 'Insufficient stock available'
    },
    {
      id: 2,
      date: '2024-01-15 09:15',
      status: 'Review',
      by: 'Sarah Wilson',
      comments: 'Need to verify alternative suppliers'
    }
  ],
  3: [
    {
      id: 1,
      date: '2024-01-15 11:45',
      status: 'Approved',
      by: 'Sarah Wilson',
      comments: 'Approved as per request'
    }
  ],
  4: [
    {
      id: 1,
      date: '2024-01-15 12:20',
      status: 'Review',
      by: 'Emma Davis',
      comments: 'Check if generic brand is acceptable to reduce cost'
    },
    {
      id: 2,
      date: '2024-01-15 08:45',
      status: 'Pending',
      by: 'System',
      comments: 'Submitted for inventory manager review'
    }
  ],
  5: [
    {
      id: 1,
      date: '2024-01-15 15:10',
      status: 'Approved',
      by: 'Robert Chen',
      comments: 'Approved - sufficient inventory available'
    },
    {
      id: 2,
      date: '2024-01-15 09:30',
      status: 'Pending',
      by: 'System',
      comments: 'Initial submission - awaiting review'
    }
  ],
  6: [
    {
      id: 1,
      date: '2024-01-15 16:05',
      status: 'Reject',
      by: 'Lisa Zhang',
      comments: 'Current stock sufficient for next 2 weeks. Reorder not required at this time'
    },
    {
      id: 2,
      date: '2024-01-15 14:15',
      status: 'Review',
      by: 'Robert Chen',
      comments: 'Reviewing current inventory levels'
    },
    {
      id: 3,
      date: '2024-01-15 10:30',
      status: 'Pending',
      by: 'System',
      comments: 'Submitted for procurement review'
    }
  ],
  7: [
    {
      id: 1,
      date: '2024-01-15 08:30',
      status: 'Pending',
      by: 'System',
      comments: 'Awaiting approval from procurement team'
    }
  ]
} as const

// Add the ApprovalBadge component
function ApprovalBadge({ status }: { status: 'Pending' | 'Approved' | 'Review' | 'Reject' }) {
  const styles = {
    Pending: 'bg-blue-100 text-blue-800',
    Approved: 'bg-green-100 text-green-800',
    Review: 'bg-yellow-100 text-yellow-800',
    Reject: 'bg-red-100 text-red-800'
  }

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}

// Add interface for movements
interface StockMovement {
  id: number
  movementType: string
  sourceDocument: string
  commitDate: string
  postingDate: string
  status: string
  movement: {
    source: string
    sourceName: string
    destination: string
    destinationName: string
    type: string
  }
  items: {
    id: number
    productName: string
    sku: string
    uom: string
    beforeQty: number
    inQty: number
    outQty: number
    afterQty: number
    unitCost: number
    totalCost: number
    location: {
      type: 'INV' | 'DIR'
      code: string
      name: string
      displayType: string
    }
    lots: {
      lotNo: string
      quantity: number
      uom: string
    }[]
  }[]
  totals: {
    inQty: number
    outQty: number
    totalCost: number
    lotCount: number
  }
}

// Update the mock movements data to reflect the requisition items
const movements: StockMovement[] = [
  {
    id: 1,
    movementType: 'STORE_REQUISITION',
    sourceDocument: mockRequisition.refNo,
    commitDate: mockRequisition.date,
    postingDate: mockRequisition.date,
    status: 'Posted',
    items: mockRequisition.items.map(item => ({
      id: item.id,
      productName: item.itemInfo.itemName,
      sku: item.description,
      uom: item.unit,
      beforeQty: item.inventory.onHand,
      inQty: 0,
      outQty: item.qtyIssued || 0,
      afterQty: item.inventory.onHand - (item.qtyIssued || 0),
      unitCost: item.costPerUnit,
      totalCost: (item.qtyIssued || 0) * item.costPerUnit,
      location: {
        type: mockRequisition.sourceLocationType === InventoryLocationType.INVENTORY ? 'INV' : 'DIR',
        code: mockRequisition.sourceLocationCode,
        name: mockRequisition.sourceLocationName,
        displayType: mockRequisition.sourceLocationType === InventoryLocationType.INVENTORY ? 'Inventory' : 'Direct'
      },
      lots: [
        {
          lotNo: `LOT-${mockRequisition.date}-${item.id.toString().padStart(3, '0')}`,
          quantity: -(item.qtyIssued || 0),
          uom: item.unit
        }
      ]
    })),
    movement: {
      source: 'Main Store',
      sourceName: 'Main Store',
      destination: mockRequisition.department,
      destinationName: mockRequisition.department,
      type: 'Store Requisition'
    },
    totals: {
      inQty: 0,
      outQty: mockRequisition.items.reduce((sum, item) => sum + (item.qtyIssued || 0), 0),
      totalCost: mockRequisition.items.reduce((sum, item) => sum + ((item.qtyIssued || 0) * item.costPerUnit), 0),
      lotCount: mockRequisition.items.length
    }
  }
]

export function StoreRequisitionDetailComponent({ id }: StoreRequisitionDetailProps) {
  const router = useRouter()
  const [items, setItems] = useState<RequisitionItem[]>(mockRequisition.items)
  const [selectedItems, setSelectedItems] = useState<number[]>([])
  const [isEditMode, setIsEditMode] = useState(false)
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false)
  const [sidePanelTab, setSidePanelTab] = useState('comments')
  const [expandedItems, setExpandedItems] = useState<number[]>([])

  // State for adding new item inline
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [newItemProductId, setNewItemProductId] = useState<string>('')
  const [newItemQtyRequired, setNewItemQtyRequired] = useState<number>(1)
  const [productSearchOpen, setProductSearchOpen] = useState(false)
  const [newItemJobCodeId, setNewItemJobCodeId] = useState<string>('job-001')
  const [newItemProjectId, setNewItemProjectId] = useState<string>('proj-001')

  // State for department (header level)
  const [departmentId, setDepartmentId] = useState<string>('dept-003') // F&B Operations

  // State for destination location (To Location)
  const [destinationLocationId, setDestinationLocationId] = useState<string>('loc-003') // Central Kitchen
  const [destinationOpen, setDestinationOpen] = useState(false)

  // Lookup dropdown open states
  const [departmentOpen, setDepartmentOpen] = useState(false)

  // CRUD state for Job Codes
  const [jobCodes, setJobCodes] = useState<JobCode[]>(initialJobCodes)
  const [showAddJobCodeDialog, setShowAddJobCodeDialog] = useState(false)
  const [showEditJobCodeDialog, setShowEditJobCodeDialog] = useState(false)
  const [editingJobCode, setEditingJobCode] = useState<JobCode | null>(null)
  const [newJobCode, setNewJobCode] = useState({ code: '', name: '', description: '' })

  // CRUD state for Projects
  const [projects, setProjects] = useState<Project[]>(initialProjects)
  const [showAddProjectDialog, setShowAddProjectDialog] = useState(false)
  const [showEditProjectDialog, setShowEditProjectDialog] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [newProject, setNewProject] = useState({ code: '', name: '', description: '' })

  // Get display value for department
  const selectedDepartment = mockDepartments.find(d => d.id === departmentId)

  // Get user's assigned locations for destination selection
  // Using a default user ID - in production, this would come from auth context
  const currentUserId = 'user-default-001'
  const userAssignedLocationIds = mockUserLocationAssignments
    .filter(ua => ua.userId === currentUserId && ua.isActive)
    .map(ua => ua.locationId)
  const userAssignedLocations = mockInventoryLocations.filter(
    loc => userAssignedLocationIds.includes(loc.id) && loc.status === 'active'
  )

  // Get selected destination location
  const selectedDestinationLocation = mockInventoryLocations.find(loc => loc.id === destinationLocationId)

  // CRUD handlers for Job Codes
  const handleAddJobCode = () => {
    if (newJobCode.code && newJobCode.name) {
      const newItem: JobCode = {
        id: `job-${Date.now()}`,
        code: newJobCode.code,
        name: newJobCode.name,
        description: newJobCode.description,
        isActive: true
      }
      setJobCodes([...jobCodes, newItem])
      setNewJobCode({ code: '', name: '', description: '' })
      setShowAddJobCodeDialog(false)
    }
  }

  const handleEditJobCode = (job: JobCode) => {
    setEditingJobCode({ ...job })
    setShowEditJobCodeDialog(true)
  }

  const handleSaveJobCode = () => {
    if (editingJobCode && editingJobCode.code && editingJobCode.name) {
      setJobCodes(jobCodes.map(j => j.id === editingJobCode.id ? editingJobCode : j))
      setShowEditJobCodeDialog(false)
      setEditingJobCode(null)
    }
  }

  const handleDeleteJobCode = (jobId: string) => {
    // Reset any items using this job code to default
    setItems(items.map(item =>
      item.jobCodeId === jobId
        ? { ...item, jobCodeId: 'job-001' }
        : item
    ))
    setJobCodes(jobCodes.filter(j => j.id !== jobId))
  }

  // CRUD handlers for Projects
  const handleAddProject = () => {
    if (newProject.code && newProject.name) {
      const newItem: Project = {
        id: `proj-${Date.now()}`,
        code: newProject.code,
        name: newProject.name,
        description: newProject.description,
        isActive: true
      }
      setProjects([...projects, newItem])
      setNewProject({ code: '', name: '', description: '' })
      setShowAddProjectDialog(false)
    }
  }

  const handleEditProject = (proj: Project) => {
    setEditingProject({ ...proj })
    setShowEditProjectDialog(true)
  }

  const handleSaveProject = () => {
    if (editingProject && editingProject.code && editingProject.name) {
      setProjects(projects.map(p => p.id === editingProject.id ? editingProject : p))
      setShowEditProjectDialog(false)
      setEditingProject(null)
    }
  }

  const handleDeleteProject = (projId: string) => {
    // Reset any items using this project to default
    setItems(items.map(item =>
      item.projectId === projId
        ? { ...item, projectId: 'proj-001' }
        : item
    ))
    setProjects(projects.filter(p => p.id !== projId))
  }

  const toggleItemExpansion = (itemId: number) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const handleBulkAction = (action: 'Pending' | 'Approved' | 'Reject' | 'Review' | 'Delete' | 'Split' | 'Approve' | 'Return') => {
    if (!selectedItems.length) return

    switch (action) {
      case 'Pending':
      case 'Approved':
      case 'Reject':
      case 'Review':
        setItems(items.map(item => 
          selectedItems.includes(item.id) 
            ? { ...item, approvalStatus: action }
            : item
        ))
        break
      case 'Approve':
        setItems(items.map(item => 
          selectedItems.includes(item.id) 
            ? { ...item, approvalStatus: 'Approved' }
            : item
        ))
        break
      case 'Return':
        setItems(items.map(item => 
          selectedItems.includes(item.id) 
            ? { ...item, approvalStatus: 'Pending' }
            : item
        ))
        break
      case 'Delete':
        setItems(items.filter(item => !selectedItems.includes(item.id)))
        break
      case 'Split':
        console.log('Splitting items:', selectedItems)
        break
    }
    setSelectedItems([]) // Clear selection after action
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(items.map(item => item.id))
    } else {
      setSelectedItems([])
    }
  }

  const handleSelectItem = (itemId: number, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, itemId])
    } else {
      setSelectedItems(selectedItems.filter(id => id !== itemId))
    }
  }

  const handleHeaderUpdate = (field: string, value: string) => {
    console.log('Updating header field:', field, value)
  }

  const handleQuantityUpdate = (itemId: number, field: 'qtyRequired' | 'qtyApproved' | 'qtyIssued', value: number) => {
    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, [field]: value }
        : item
    ))
  }

  // Handler to update item-level job code
  const handleUpdateItemJobCode = (itemId: number, newJobCodeId: string) => {
    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, jobCodeId: newJobCodeId }
        : item
    ))
  }

  // Handler to update item-level project
  const handleUpdateItemProject = (itemId: number, newProjectId: string) => {
    setItems(items.map(item =>
      item.id === itemId
        ? { ...item, projectId: newProjectId }
        : item
    ))
  }

  // Handler to start adding a new item
  const handleStartAddItem = () => {
    setIsAddingItem(true)
    setNewItemProductId('')
    setNewItemQtyRequired(1)
  }

  // Handler to cancel adding item
  const handleCancelAddItem = () => {
    setIsAddingItem(false)
    setNewItemProductId('')
    setNewItemQtyRequired(1)
  }

  // Handler to confirm and add new item
  const handleConfirmAddItem = () => {
    const selectedProduct = mockProducts.find(p => p.id === newItemProductId)
    if (!selectedProduct) return

    const newId = Math.max(...items.map(i => i.id), 0) + 1
    const newItem: RequisitionItem = {
      id: newId,
      description: selectedProduct.description || selectedProduct.productName,
      unit: selectedProduct.baseUnit,
      qtyRequired: newItemQtyRequired,
      qtyApproved: 0,
      costPerUnit: selectedProduct.standardCost?.amount || 0,
      total: (selectedProduct.standardCost?.amount || 0) * newItemQtyRequired,
      requestDate: new Date().toISOString().split('T')[0],
      inventory: {
        onHand: 0,
        onOrder: 0,
        lastPrice: selectedProduct.standardCost?.amount || 0,
        lastVendor: 'N/A'
      },
      itemInfo: {
        // location and locationCode now at document level (sourceLocationName, sourceLocationCode)
        itemName: selectedProduct.productName,
        category: selectedProduct.categoryId || 'General',
        subCategory: 'General',
        itemGroup: 'General',
        barCode: selectedProduct.productCode
      },
      qtyIssued: 0,
      taxRate: 7,
      discountRate: 0,
      approvalStatus: 'Pending' as const,
      jobCodeId: newItemJobCodeId,
      projectId: newItemProjectId
    }

    setItems([...items, newItem])
    setIsAddingItem(false)
    setNewItemProductId('')
    setNewItemQtyRequired(1)
    setNewItemJobCodeId('job-001')
    setNewItemProjectId('proj-001')
  }

  // Get selected product for display
  const selectedProduct = mockProducts.find(p => p.id === newItemProductId)

  // Dynamic workflow action - single primary action based on status and items
  const getWorkflowActions = () => {
    const requisitionStatus = mockRequisition.status
    const currentStep = mockRequisition.approvalSteps.find((step: { status: string; role: string }) => step.status === 'current')
    const canUserApprove = currentStep && currentStep.role === 'store-manager' // This would come from user context
    
    // Get item statuses summary
    const itemStatuses = items.reduce((acc, item) => {
      acc[item.approvalStatus] = (acc[item.approvalStatus] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalItems = items.length
    const pendingItems = itemStatuses['Pending'] || 0
    const approvedItems = itemStatuses['Approved'] || 0
    const rejectedItems = itemStatuses['Reject'] || 0
    const reviewItems = itemStatuses['Review'] || 0

    let primaryAction = null

    // Draft status - primary action is to submit
    if (requisitionStatus === 'Draft') {
      primaryAction = {
        type: 'submit',
        label: 'Submit for Approval',
        variant: 'default',
        className: 'bg-blue-600 hover:bg-blue-700',
        icon: 'CheckCircle',
        disabled: totalItems === 0,
        tooltip: totalItems === 0 ? 'Add items before submitting' : 'Submit requisition for approval workflow'
      }
    }

    /**
     * WORKFLOW ACTION DECISION ENGINE
     * ================================
     * Determines the primary action button based on item approval statuses.
     *
     * Decision Priority (evaluated in order):
     * ┌────────┬─────────────────────────────┬─────────────────────────────────────┐
     * │ Priority│ Condition                   │ Action                              │
     * ├────────┼─────────────────────────────┼─────────────────────────────────────┤
     * │   1    │ pending > 0                 │ Waiting (disabled) - must review    │
     * │   2    │ rejected === total          │ Reject Requisition                  │
     * │   3    │ approved === total          │ Approve All                         │
     * │   4    │ review > 0                  │ Return for Review                   │
     * │   5    │ rejected > 0 && approved > 0│ Partial Approve (exclude rejected)  │
     * │   6    │ approved === 0              │ Reject Requisition                  │
     * └────────┴─────────────────────────────┴─────────────────────────────────────┘
     *
     * Note: "Return for Review" only appears when items have "Review" status,
     * NOT when items are "Rejected". Rejected items can be excluded via partial approval.
     */
    else if (requisitionStatus === 'In Process' && canUserApprove) {
      // Priority 1: Pending items exist - approver must wait for all items to be reviewed first
      // Rationale: Cannot make approval decision until all items have been evaluated
      if (pendingItems > 0) {
        primaryAction = {
          type: 'waiting',
          label: `Waiting for Item Review (${pendingItems} pending)`,
          variant: 'outline',
          className: 'cursor-not-allowed opacity-60',
          icon: 'Clock',
          disabled: true,
          tooltip: `${pendingItems} items are still pending review. Please review individual items first.`
        }
      }
      // Priority 2: ALL items rejected - only option is to reject entire requisition
      // Rationale: No items can be fulfilled, requisition cannot proceed
      else if (rejectedItems === totalItems && totalItems > 0) {
        primaryAction = {
          type: 'reject',
          label: `Reject Requisition (${rejectedItems} items rejected)`,
          variant: 'destructive',
          className: 'bg-red-600 hover:bg-red-700',
          icon: 'XCircle',
          disabled: false,
          tooltip: `All ${rejectedItems} items have been rejected. Reject the entire requisition.`
        }
      }
      // Priority 3: ALL items approved - proceed with full approval
      // Rationale: All items passed review, requisition can move to next stage
      else if (approvedItems === totalItems && totalItems > 0) {
        primaryAction = {
          type: 'approve',
          label: `Approve All (${approvedItems} items)`,
          variant: 'default',
          className: 'bg-green-600 hover:bg-green-700',
          icon: 'Check',
          disabled: false,
          tooltip: `Approve all ${approvedItems} items and proceed to next stage`
        }
      }
      // Priority 4: Items marked for "Review" - return to requester for modifications
      // Rationale: Review status means items need changes/clarification before approval decision
      // Note: This does NOT trigger for "Rejected" items - only "Review" status
      else if (reviewItems > 0) {
        primaryAction = {
          type: 'return',
          label: `Return for Review (${reviewItems} items)`,
          variant: 'default',
          className: 'bg-orange-600 hover:bg-orange-700',
          icon: 'ArrowLeft',
          disabled: false,
          tooltip: `Return ${reviewItems} items for review and modifications`
        }
      }
      // Priority 5: Mixed state (some approved, some rejected) - allow partial approval
      // Rationale: Approved items can proceed; rejected items will be excluded from fulfillment
      else if (rejectedItems > 0 && approvedItems > 0) {
        primaryAction = {
          type: 'partial-approve',
          label: `Approve ${approvedItems} Items`,
          variant: 'default',
          className: 'bg-green-600 hover:bg-green-700',
          icon: 'Check',
          disabled: false,
          tooltip: `Approve ${approvedItems} items (${rejectedItems} rejected items will be excluded)`
        }
      }
      // Priority 6: No approved items - reject requisition
      // Rationale: Nothing to fulfill, requisition cannot proceed
      else if (approvedItems === 0 && totalItems > 0) {
        primaryAction = {
          type: 'reject',
          label: 'Reject Requisition',
          variant: 'outline',
          className: 'text-red-600 border-red-200 hover:bg-red-50',
          icon: 'XCircle',
          disabled: false,
          tooltip: 'Reject entire requisition as no items are approved'
        }
      }
    }

    // Rejected status - primary action is to resubmit
    else if (requisitionStatus === 'Reject') {
      primaryAction = {
        type: 'resubmit',
        label: 'Resubmit for Approval',
        variant: 'default',
        className: 'bg-blue-600 hover:bg-blue-700',
        icon: 'Undo2',
        disabled: totalItems === 0,
        tooltip: 'Resubmit requisition after addressing concerns'
      }
    }

    // Complete and Void status - no actions available

    return {
      action: primaryAction,
      summary: {
        total: totalItems,
        pending: pendingItems,
        approved: approvedItems,
        rejected: rejectedItems,
        review: reviewItems
      }
    }
  }

  const workflowActions = getWorkflowActions()

  return (
    <div className="w-full px-0 py-6">
      <div className="flex gap-4">
        {/* Main Content */}
        <div className={`transition-all duration-300 ${isSidePanelOpen ? 'flex-1' : 'w-full'}`}>
          <Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="p-6 pb-4 bg-muted/30 border-b space-y-6">
          {/* Top Actions - Mobile-First Responsive Layout */}
          <div className="space-y-4">
            {/* Header Section with Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.back()}
                  aria-label="Go back to Store Requisition List"
                  className="focus:ring-2 focus:ring-primary/20 flex-shrink-0"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex items-center gap-3 min-w-0">
                  <CardTitle className="text-xl sm:text-2xl lg:text-3xl font-bold truncate">Store Requisition Details</CardTitle>
                  <StatusBadge status={mockRequisition.status} />
                </div>
              </div>
              
              {/* Action Buttons - Now on the same row */}
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
                    <span className="sm:inline">Cancel</span>
                  </Button>
                  <Button
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary/20"
                    onClick={() => {
                      handleCancelAddItem()
                      setIsEditMode(false)
                    }}
                  >
                    <Check className="w-4 h-4" />
                    <span className="sm:inline">Save Changes</span>
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Button 
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary/20"
                    onClick={() => setIsEditMode(true)}
                  >
                    <Edit2 className="w-4 h-4" />
                    <span className="sm:inline">Edit</span>
                  </Button>
                  <Button
                    className="flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary/20"
                    onClick={() => console.log('Submit')}
                  >
                    <span className="sm:inline">Submit</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2 border-muted-foreground/20 hover:bg-muted/50"
                    onClick={() => console.log('Print requisition')}
                  >
                    <Printer className="w-4 h-4" />
                    <span className="hidden sm:inline">Print</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex items-center justify-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => console.log('Void requisition')}
                  >
                    <XCircle className="w-4 h-4" />
                    <span className="hidden sm:inline">Void</span>
                  </Button>
                </div>
              )}
              
              {/* Side Panel Toggle Button */}
              <Button
                variant="outline"
                size="icon"
                className="flex-shrink-0 border-muted-foreground/20 hover:bg-muted/50"
                onClick={() => setIsSidePanelOpen(!isSidePanelOpen)}
                aria-label={isSidePanelOpen ? "Hide side panel" : "Show side panel"}
              >
                {isSidePanelOpen ? (
                  <PanelRightClose className="w-4 h-4" />
                ) : (
                  <PanelRightOpen className="w-4 h-4" />
                )}
              </Button>
              </div>
            </div>
          </div>

        {/* Header Information - Three Row Layout */}
        <div className="space-y-4 sm:space-y-6">
          {/* First Row - 1/3, 1/3, 1/3 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Hash className="w-4 h-4" />
                <span>Requisition</span>
              </div>
              <p className="font-semibold">{mockRequisition.refNo}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Date</span>
              </div>
              <p className="font-semibold">{mockRequisition.date}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="w-4 h-4" />
                <span>Date Required</span>
              </div>
              {isEditMode ? (
                <Input
                  type="date"
                  value={mockRequisition.expectedDeliveryDate}
                  onChange={(e) => handleHeaderUpdate('expectedDeliveryDate', e.target.value)}
                  className="h-8"
                />
              ) : (
                <p className="font-semibold">{mockRequisition.expectedDeliveryDate}</p>
              )}
            </div>
          </div>
          
          {/* Second Row - 1/3, 1/3, 1/3 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Store className="w-4 h-4" />
                <span>Requested From</span>
              </div>
              <p className="font-semibold">{mockRequisition.requestedFrom}</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span>To Location</span>
              </div>
              {isEditMode ? (
                <Popover open={destinationOpen} onOpenChange={setDestinationOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={destinationOpen}
                      className="w-full justify-between h-8 text-sm font-semibold"
                    >
                      {selectedDestinationLocation?.name || 'Select location...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search location..." />
                      <CommandList>
                        <CommandEmpty>No location found.</CommandEmpty>
                        <CommandGroup>
                          {userAssignedLocations.map((loc) => (
                            <CommandItem
                              key={loc.id}
                              value={`${loc.name} ${loc.code}`}
                              onSelect={() => {
                                setDestinationLocationId(loc.id)
                                setDestinationOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  destinationLocationId === loc.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{loc.name}</span>
                                <span className="text-xs text-muted-foreground">{loc.code}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              ) : (
                <p className="font-semibold">{selectedDestinationLocation?.name || 'Central Kitchen'}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Building2 className="w-4 h-4" />
                <span>Department</span>
              </div>
              {isEditMode ? (
                <Popover open={departmentOpen} onOpenChange={setDepartmentOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={departmentOpen}
                      className="w-full justify-between h-8 text-sm font-semibold"
                    >
                      {selectedDepartment?.name || 'Select department...'}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[280px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search department..." />
                      <CommandList>
                        <CommandEmpty>No department found.</CommandEmpty>
                        <CommandGroup>
                          {mockDepartments.filter(d => d.status === 'active').map((dept) => (
                            <CommandItem
                              key={dept.id}
                              value={`${dept.name} ${dept.code}`}
                              onSelect={() => {
                                setDepartmentId(dept.id)
                                setDepartmentOpen(false)
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  departmentId === dept.id ? "opacity-100" : "opacity-0"
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-medium">{dept.name}</span>
                                <span className="text-xs text-muted-foreground">{dept.code}</span>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              ) : (
                <p className="font-semibold">{selectedDepartment?.name || mockRequisition.department}</p>
              )}
            </div>
          </div>
          
          {/* Third Row - 1/3, 2/3 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="w-4 h-4" />
                <span>Requested By</span>
              </div>
              <p className="font-semibold">{mockRequisition.requestedBy}</p>
            </div>

            <div className="space-y-2 sm:col-span-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="w-4 h-4" />
                <span>Description</span>
              </div>
              <p className="font-semibold">{mockRequisition.description}</p>
            </div>
          </div>
        </div>

        <Separator className="my-4" />

        {/* Generated Documents Section */}
        {mockRequisition.generatedDocuments && mockRequisition.generatedDocuments.length > 0 && (
          <div className="px-4 pb-4">
            <Card className="border-slate-200 bg-slate-50/50">
              <CardContent className="py-3">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>Generated Documents</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {mockRequisition.generatedDocuments.map((doc) => {
                      const style = getDocumentTypeBadgeStyle(doc.documentType)
                      return (
                        <Link key={doc.id} href={getDocumentLinkPath(doc)}>
                          <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-md border ${style.bg} ${style.text} ${style.border} hover:opacity-80 transition-opacity cursor-pointer`}>
                            {getDocumentTypeIcon(doc.documentType)}
                            <div className="flex flex-col">
                              <span className="text-sm font-medium">{doc.refNo}</span>
                              <span className="text-xs opacity-75">{getDocumentTypeLabel(doc.documentType)}</span>
                            </div>
                            <StatusBadge status={doc.status === 'completed' ? 'Complete' : doc.status === 'pending' ? 'In Process' : 'Draft'} />
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        </CardHeader>

        <Tabs defaultValue="items" className="w-full">
          <CardHeader className="pb-0 pt-4 px-4">
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger
                value="items"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Items
              </TabsTrigger>
              <TabsTrigger
                value="stock-movements"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Stock
              </TabsTrigger>
              <TabsTrigger
                value="journal-entries"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Journal
              </TabsTrigger>
              <TabsTrigger
                value="generated-documents"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Documents
              </TabsTrigger>
              <TabsTrigger
                value="approval-workflow"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                Approval
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          <CardContent className="p-0">
            <div className="w-full rounded-b-md border-t">
              <div className="p-6">
                <TabsContent value="items" className="mt-0">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold">Items Details</h3>
                {isEditMode && !isAddingItem && (
                  <Button
                    className="flex items-center gap-2 bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary/20"
                    onClick={handleStartAddItem}
                  >
                    <Plus className="w-4 h-4" />
                    Add Item
                  </Button>
                )}
              </div>

              {/* Selected items info and bulk actions */}
              {selectedItems.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  {/* Selection Info */}
                  <div className="flex items-center gap-1">
                    <Check className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-blue-900 dark:text-blue-100 text-sm">
                      {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>

                  {/* Bulk Action Buttons */}
                  <div className="flex gap-2">
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-green-600 border-green-200 hover:bg-green-50 flex items-center gap-2"
                      onClick={() => handleBulkAction('Approve')}
                    >
                      <Check className="w-4 h-4" />
                      <span className="hidden sm:inline">Approve</span>
                      <span className="sm:hidden">✓</span>
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-yellow-600 border-yellow-200 hover:bg-yellow-50 flex items-center gap-2"
                      onClick={() => handleBulkAction('Review')}
                    >
                      <AlertCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Review</span>
                      <span className="sm:hidden">?</span>
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50 flex items-center gap-2"
                      onClick={() => handleBulkAction('Reject')}
                    >
                      <XCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Reject</span>
                      <span className="sm:hidden">✗</span>
                    </Button>
                    <Button 
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                      onClick={() => setSelectedItems([])}
                      title="Clear selection"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}

              <div className="border rounded-lg overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-2 sm:p-4 text-xs font-medium text-gray-500">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={selectedItems.length === items.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </th>
                      <th className="text-left p-2 sm:p-4 text-xs font-medium text-gray-500 min-w-[150px]">Product</th>
                      <th className="text-left p-2 sm:p-4 text-xs font-medium text-gray-500 min-w-[60px]">Unit</th>
                      <th className="text-right p-2 sm:p-4 text-xs font-medium text-gray-500 min-w-[80px]">Required</th>
                      <th className="text-right p-2 sm:p-4 text-xs font-medium text-gray-500 min-w-[80px]">Approved</th>
                      <th className="text-right p-2 sm:p-4 text-xs font-medium text-gray-500 min-w-[80px]">Issued</th>
                      <th className="text-left p-2 sm:p-4 text-xs font-medium text-gray-500 min-w-[100px]">Job Code</th>
                      <th className="text-left p-2 sm:p-4 text-xs font-medium text-gray-500 min-w-[100px]">Project</th>
                      <th className="text-right p-2 sm:p-4 text-xs font-medium text-gray-500 min-w-[80px]">Total</th>
                      <th className="text-center p-2 sm:p-4 text-xs font-medium text-gray-500 min-w-[80px]">Status</th>
                      <th className="text-right p-2 sm:p-4 text-xs font-medium text-gray-500 w-[100px]">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {items.map((item) => (
                      <React.Fragment key={item.id}>
                        {/* Primary Information Row */}
                        <tr className="group hover:bg-gray-50">
                          <td className="p-2 sm:p-4">
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
                                <ChevronRight
                                  className={`h-4 w-4 transition-transform ${
                                    expandedItems.includes(item.id) ? 'rotate-90' : ''
                                  }`}
                                />
                              </Button>
                            </div>
                          </td>
                          <td className="p-2 sm:p-4">
                            <div className="space-y-1">
                              <p className="font-medium text-gray-600 text-sm">{item.itemInfo.itemName}</p>
                              <p className="text-xs text-gray-500 truncate max-w-[150px]">{item.description}</p>
                            </div>
                          </td>
                          <td className="p-2 sm:p-4">
                            <p className="text-sm">{item.unit}</p>
                          </td>
                          <td className="p-2 sm:p-4 text-right">
                            {isEditMode ? (
                              <Input
                                type="number"
                                value={item.qtyRequired}
                                onChange={(e) => handleQuantityUpdate(item.id, 'qtyRequired', parseInt(e.target.value))}
                                className="w-16 sm:w-20 h-8 text-right text-sm"
                              />
                            ) : (
                              <p className="text-sm tabular-nums">{formatNumber(item.qtyRequired)}</p>
                            )}
                          </td>
                          <td className="p-2 sm:p-4 text-right">
                            {isEditMode ? (
                              <Input
                                type="number"
                                value={item.qtyApproved}
                                onChange={(e) => handleQuantityUpdate(item.id, 'qtyApproved', parseInt(e.target.value))}
                                className="w-16 sm:w-20 h-8 text-right text-sm"
                              />
                            ) : (
                              <p className="text-sm tabular-nums">{formatNumber(item.qtyApproved)}</p>
                            )}
                          </td>
                          <td className="p-2 sm:p-4 text-right">
                            {isEditMode ? (
                              <Input
                                type="number"
                                value={item.qtyIssued || 0}
                                onChange={(e) => handleQuantityUpdate(item.id, 'qtyIssued', parseInt(e.target.value))}
                                className="w-16 sm:w-20 h-8 text-right text-sm"
                              />
                            ) : (
                              <p className="text-sm tabular-nums">{formatNumber(item.qtyIssued || 0)}</p>
                            )}
                          </td>
                          {/* Job Code Cell */}
                          <td className="p-2 sm:p-4">
                            {isEditMode ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between h-8 text-xs"
                                  >
                                    <span className="truncate">
                                      {jobCodes.find(j => j.id === item.jobCodeId)?.code || 'Select...'}
                                    </span>
                                    <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0" align="start">
                                  <Command>
                                    <CommandInput placeholder="Search..." className="h-8" />
                                    <CommandList>
                                      <CommandEmpty>No job code found.</CommandEmpty>
                                      <CommandGroup>
                                        {jobCodes.filter(j => j.isActive).map((job) => (
                                          <CommandItem
                                            key={job.id}
                                            value={`${job.code} ${job.name}`}
                                            onSelect={() => handleUpdateItemJobCode(item.id, job.id)}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-3 w-3",
                                                item.jobCodeId === job.id ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            <span className="text-xs">{job.code}</span>
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <p className="text-sm">{jobCodes.find(j => j.id === item.jobCodeId)?.code || '-'}</p>
                            )}
                          </td>
                          {/* Project Cell */}
                          <td className="p-2 sm:p-4">
                            {isEditMode ? (
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between h-8 text-xs"
                                  >
                                    <span className="truncate">
                                      {projects.find(p => p.id === item.projectId)?.code || 'Select...'}
                                    </span>
                                    <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[200px] p-0" align="start">
                                  <Command>
                                    <CommandInput placeholder="Search..." className="h-8" />
                                    <CommandList>
                                      <CommandEmpty>No project found.</CommandEmpty>
                                      <CommandGroup>
                                        {projects.filter(p => p.isActive).map((proj) => (
                                          <CommandItem
                                            key={proj.id}
                                            value={`${proj.code} ${proj.name}`}
                                            onSelect={() => handleUpdateItemProject(item.id, proj.id)}
                                          >
                                            <Check
                                              className={cn(
                                                "mr-2 h-3 w-3",
                                                item.projectId === proj.id ? "opacity-100" : "opacity-0"
                                              )}
                                            />
                                            <span className="text-xs">{proj.code}</span>
                                          </CommandItem>
                                        ))}
                                      </CommandGroup>
                                    </CommandList>
                                  </Command>
                                </PopoverContent>
                              </Popover>
                            ) : (
                              <p className="text-sm">{projects.find(p => p.id === item.projectId)?.code || '-'}</p>
                            )}
                          </td>
                          <td className="p-2 sm:p-4 text-right">
                            <p className="font-medium text-sm tabular-nums">{formatNumber(item.total)}</p>
                          </td>
                          <td className="p-2 sm:p-4 text-center">
                            <ApprovalLogDialog 
                              itemId={item.id}
                              itemName={item.itemInfo.itemName}
                              logs={mockApprovalLogs[item.id] || []}
                            >
                              <div className="cursor-pointer">
                                <ApprovalBadge status={item.approvalStatus as 'Pending' | 'Approved' | 'Review' | 'Reject'} />
                              </div>
                            </ApprovalLogDialog>
                          </td>
                          <td className="p-2 sm:p-4">
                            <div className="flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                  >
                                    <span className="sr-only">Open menu</span>
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => setItems(items.filter(i => i.id !== item.id))}
                                    className="text-red-600 focus:text-red-600"
                                  >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete Item
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </td>
                        </tr>

                        {/* Expandable Details Row */}
                        {expandedItems.includes(item.id) && (
                          <tr className="bg-gray-50">
                            <td colSpan={11} className="px-2 sm:px-4 py-4">
                              <div className="space-y-6">
                                {/* Inventory Information Section - Full Width */}
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                    <Box className="h-4 w-4 text-gray-600" />
                                    Inventory Information
                                  </h4>
                                  <div className="bg-white rounded-lg p-4 space-y-4 border border-gray-200">
                                    {/* Location Type Alert - Shows special handling instructions */}
                                    {mockRequisition.sourceLocationType !== InventoryLocationType.INVENTORY && (
                                      <LocationTypeAlert
                                        locationType={mockRequisition.sourceLocationType}
                                        operationContext="issue"
                                        className="mb-4"
                                      />
                                    )}
                                    <div className="grid grid-cols-2 gap-4">
                                      {/* Location and Location Type removed - now at document level only */}
                                      {/*
                                        LOCATION TYPE AWARE STOCK DISPLAY:
                                        - INVENTORY: Show all stock fields (tracked inventory)
                                        - DIRECT: Stock fields not applicable (items expensed on receipt)
                                        - CONSIGNMENT: Show stock fields (vendor-owned tracked inventory)
                                      */}
                                      {shouldRecordStockMovement(mockRequisition.sourceLocationType) ? (
                                        <>
                                          <div>
                                            <label className="text-xs font-medium text-gray-500">Current Stock</label>
                                            <p className="text-sm font-medium text-gray-900">{item.inventory.onHand} {item.unit}</p>
                                          </div>
                                          <div>
                                            <label className="text-xs font-medium text-gray-500">On Order</label>
                                            <p className="text-sm font-medium text-gray-900">{item.inventory.onOrder} {item.unit}</p>
                                          </div>
                                          <div>
                                            <label className="text-xs font-medium text-gray-500">Available</label>
                                            <p className="text-sm font-medium text-gray-900">
                                              {item.inventory.onHand + item.inventory.onOrder} {item.unit}
                                            </p>
                                          </div>
                                          <div>
                                            <label className="text-xs font-medium text-gray-500">After Issue</label>
                                            <p className="text-sm font-medium text-gray-900">
                                              {item.inventory.onHand - (item.qtyIssued || 0)} {item.unit}
                                            </p>
                                          </div>
                                        </>
                                      ) : (
                                        /* DIRECT location - no stock tracking */
                                        <div className="col-span-2">
                                          <p className="text-xs text-amber-600 italic">
                                            Stock tracking not applicable - items are expensed immediately on receipt
                                          </p>
                                        </div>
                                      )}
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Last Price</label>
                                        <p className="text-sm font-medium text-gray-900">{item.inventory.lastPrice.toFixed(2)} BHT</p>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Current Price</label>
                                        <p className="text-sm font-medium text-gray-900">{item.costPerUnit.toFixed(2)} BHT</p>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Last Vendor</label>
                                        <p className="text-sm font-medium text-gray-900">{item.inventory.lastVendor}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                {/* Business Dimensions Section - Item Level */}
                                <div className="space-y-4">
                                  <h4 className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-gray-600" />
                                    Business Dimensions
                                  </h4>
                                  <div className="bg-white rounded-lg p-4 space-y-4 border border-gray-200">
                                    <div className="grid grid-cols-3 gap-4">
                                      {/* Job Code - Item Level */}
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Job Code</label>
                                        {isEditMode ? (
                                          <div className="flex gap-1 mt-1">
                                            <Popover>
                                              <PopoverTrigger asChild>
                                                <Button
                                                  variant="outline"
                                                  role="combobox"
                                                  className="flex-1 justify-between h-8 text-sm"
                                                >
                                                  <span className="truncate">
                                                    {(() => {
                                                      const itemJobCode = jobCodes.find(j => j.id === item.jobCodeId)
                                                      return itemJobCode ? `${itemJobCode.code} : ${itemJobCode.name}` : 'Select...'
                                                    })()}
                                                  </span>
                                                  <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                              </PopoverTrigger>
                                              <PopoverContent className="w-[320px] p-0" align="start">
                                                <Command>
                                                  <CommandInput placeholder="Search job code..." />
                                                  <CommandList>
                                                    <CommandEmpty>No job code found.</CommandEmpty>
                                                    <CommandGroup>
                                                      {jobCodes.filter(j => j.isActive).map((job) => (
                                                        <CommandItem
                                                          key={job.id}
                                                          value={`${job.code} ${job.name}`}
                                                          onSelect={() => handleUpdateItemJobCode(item.id, job.id)}
                                                          className="flex items-center justify-between"
                                                        >
                                                          <div className="flex items-center flex-1">
                                                            <Check
                                                              className={cn(
                                                                "mr-2 h-4 w-4 shrink-0",
                                                                item.jobCodeId === job.id ? "opacity-100" : "opacity-0"
                                                              )}
                                                            />
                                                            <div className="flex flex-col min-w-0">
                                                              <span className="font-medium truncate">{job.code} : {job.name}</span>
                                                              <span className="text-xs text-muted-foreground truncate">{job.description}</span>
                                                            </div>
                                                          </div>
                                                          <div className="flex items-center gap-1 ml-2 shrink-0">
                                                            <Button
                                                              variant="ghost"
                                                              size="icon"
                                                              className="h-6 w-6"
                                                              onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleEditJobCode(job)
                                                              }}
                                                            >
                                                              <Edit2 className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                              variant="ghost"
                                                              size="icon"
                                                              className="h-6 w-6 text-destructive hover:text-destructive"
                                                              onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleDeleteJobCode(job.id)
                                                              }}
                                                            >
                                                              <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                          </div>
                                                        </CommandItem>
                                                      ))}
                                                    </CommandGroup>
                                                  </CommandList>
                                                </Command>
                                              </PopoverContent>
                                            </Popover>
                                            <Button
                                              variant="outline"
                                              size="icon"
                                              className="h-8 w-8 shrink-0"
                                              onClick={() => setShowAddJobCodeDialog(true)}
                                            >
                                              <Plus className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        ) : (
                                          <p className="text-sm font-medium text-gray-900">
                                            {(() => {
                                              const itemJobCode = jobCodes.find(j => j.id === item.jobCodeId)
                                              return itemJobCode ? `${itemJobCode.code} : ${itemJobCode.name}` : '-'
                                            })()}
                                          </p>
                                        )}
                                      </div>

                                      {/* Department (read-only in this section, editable in header) */}
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Department</label>
                                        <p className="text-sm font-medium text-gray-900 mt-1">
                                          {selectedDepartment?.name || mockRequisition.department}
                                        </p>
                                      </div>

                                      {/* Project - Item Level */}
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Project</label>
                                        {isEditMode ? (
                                          <div className="flex gap-1 mt-1">
                                            <Popover>
                                              <PopoverTrigger asChild>
                                                <Button
                                                  variant="outline"
                                                  role="combobox"
                                                  className="flex-1 justify-between h-8 text-sm"
                                                >
                                                  <span className="truncate">
                                                    {(() => {
                                                      const itemProject = projects.find(p => p.id === item.projectId)
                                                      return itemProject ? `${itemProject.code} : ${itemProject.name}` : 'Select...'
                                                    })()}
                                                  </span>
                                                  <ChevronsUpDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
                                                </Button>
                                              </PopoverTrigger>
                                              <PopoverContent className="w-[320px] p-0" align="start">
                                                <Command>
                                                  <CommandInput placeholder="Search project..." />
                                                  <CommandList>
                                                    <CommandEmpty>No project found.</CommandEmpty>
                                                    <CommandGroup>
                                                      {projects.filter(p => p.isActive).map((proj) => (
                                                        <CommandItem
                                                          key={proj.id}
                                                          value={`${proj.code} ${proj.name}`}
                                                          onSelect={() => handleUpdateItemProject(item.id, proj.id)}
                                                          className="flex items-center justify-between"
                                                        >
                                                          <div className="flex items-center flex-1">
                                                            <Check
                                                              className={cn(
                                                                "mr-2 h-4 w-4 shrink-0",
                                                                item.projectId === proj.id ? "opacity-100" : "opacity-0"
                                                              )}
                                                            />
                                                            <div className="flex flex-col min-w-0">
                                                              <span className="font-medium truncate">{proj.code} : {proj.name}</span>
                                                              <span className="text-xs text-muted-foreground truncate">{proj.description}</span>
                                                            </div>
                                                          </div>
                                                          <div className="flex items-center gap-1 ml-2 shrink-0">
                                                            <Button
                                                              variant="ghost"
                                                              size="icon"
                                                              className="h-6 w-6"
                                                              onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleEditProject(proj)
                                                              }}
                                                            >
                                                              <Edit2 className="h-3 w-3" />
                                                            </Button>
                                                            <Button
                                                              variant="ghost"
                                                              size="icon"
                                                              className="h-6 w-6 text-destructive hover:text-destructive"
                                                              onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleDeleteProject(proj.id)
                                                              }}
                                                            >
                                                              <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                          </div>
                                                        </CommandItem>
                                                      ))}
                                                    </CommandGroup>
                                                  </CommandList>
                                                </Command>
                                              </PopoverContent>
                                            </Popover>
                                            <Button
                                              variant="outline"
                                              size="icon"
                                              className="h-8 w-8 shrink-0"
                                              onClick={() => setShowAddProjectDialog(true)}
                                            >
                                              <Plus className="h-4 w-4" />
                                            </Button>
                                          </div>
                                        ) : (
                                          <p className="text-sm font-medium text-gray-900">
                                            {(() => {
                                              const itemProject = projects.find(p => p.id === item.projectId)
                                              return itemProject ? `${itemProject.code} : ${itemProject.name}` : '-'
                                            })()}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    <Separator />
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Category</label>
                                        <p className="text-sm font-medium text-gray-900">{item.itemInfo.category}</p>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Sub Category</label>
                                        <p className="text-sm font-medium text-gray-900">{item.itemInfo.subCategory}</p>
                                      </div>
                                      <div>
                                        <label className="text-xs font-medium text-gray-500">Item Group</label>
                                        <p className="text-sm font-medium text-gray-900">{item.itemInfo.itemGroup}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))}
                    {/* New Item Row - Inline Add (only in Edit mode) */}
                    {isEditMode && isAddingItem && (
                      <tr className="bg-blue-50/50 border-t-2 border-blue-200">
                        <td className="p-2 sm:p-4">
                          {/* Empty checkbox column */}
                        </td>
                        <td className="p-2 sm:p-4">
                          {/* Searchable Product Dropdown */}
                          <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                aria-expanded={productSearchOpen}
                                className="w-full justify-between min-w-[200px] h-9"
                              >
                                {selectedProduct ? (
                                  <div className="flex flex-col items-start">
                                    <span className="text-sm font-medium truncate max-w-[180px]">{selectedProduct.productName}</span>
                                    <span className="text-xs text-muted-foreground">{selectedProduct.productCode}</span>
                                  </div>
                                ) : (
                                  <span className="text-muted-foreground flex items-center gap-2">
                                    <Search className="h-4 w-4" />
                                    Search products...
                                  </span>
                                )}
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[350px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Search by name or code..." />
                                <CommandList>
                                  <CommandEmpty>No product found.</CommandEmpty>
                                  <CommandGroup heading="Products">
                                    {mockProducts.filter(p => p.isActive && p.status === 'active').map((product) => (
                                      <CommandItem
                                        key={product.id}
                                        value={`${product.productName} ${product.productCode}`}
                                        onSelect={() => {
                                          setNewItemProductId(product.id)
                                          setProductSearchOpen(false)
                                        }}
                                      >
                                        <div className="flex flex-col">
                                          <span className="font-medium">{product.productName}</span>
                                          <span className="text-xs text-muted-foreground">
                                            {product.productCode} · {product.baseUnit} · ${product.standardCost?.amount?.toFixed(2) || '0.00'}
                                          </span>
                                        </div>
                                        <Check
                                          className={cn(
                                            "ml-auto h-4 w-4",
                                            newItemProductId === product.id ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </td>
                        <td className="p-2 sm:p-4">
                          <p className="text-sm text-muted-foreground">
                            {selectedProduct?.baseUnit || '-'}
                          </p>
                        </td>
                        <td className="p-2 sm:p-4 text-right">
                          <Input
                            type="number"
                            min="1"
                            value={newItemQtyRequired}
                            onChange={(e) => setNewItemQtyRequired(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-20 h-8 text-right text-sm"
                          />
                        </td>
                        <td className="p-2 sm:p-4 text-right">
                          <p className="text-sm text-muted-foreground">-</p>
                        </td>
                        <td className="p-2 sm:p-4 text-right">
                          <p className="text-sm text-muted-foreground">-</p>
                        </td>
                        {/* Job Code for new item */}
                        <td className="p-2 sm:p-4">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between h-8 text-xs"
                              >
                                <span className="truncate">
                                  {jobCodes.find(j => j.id === newItemJobCodeId)?.code || 'Select...'}
                                </span>
                                <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Search..." className="h-8" />
                                <CommandList>
                                  <CommandEmpty>No job code found.</CommandEmpty>
                                  <CommandGroup>
                                    {jobCodes.filter(j => j.isActive).map((job) => (
                                      <CommandItem
                                        key={job.id}
                                        value={`${job.code} ${job.name}`}
                                        onSelect={() => setNewItemJobCodeId(job.id)}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-3 w-3",
                                            newItemJobCodeId === job.id ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        <span className="text-xs">{job.code}</span>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </td>
                        {/* Project for new item */}
                        <td className="p-2 sm:p-4">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                role="combobox"
                                className="w-full justify-between h-8 text-xs"
                              >
                                <span className="truncate">
                                  {projects.find(p => p.id === newItemProjectId)?.code || 'Select...'}
                                </span>
                                <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-[200px] p-0" align="start">
                              <Command>
                                <CommandInput placeholder="Search..." className="h-8" />
                                <CommandList>
                                  <CommandEmpty>No project found.</CommandEmpty>
                                  <CommandGroup>
                                    {projects.filter(p => p.isActive).map((proj) => (
                                      <CommandItem
                                        key={proj.id}
                                        value={`${proj.code} ${proj.name}`}
                                        onSelect={() => setNewItemProjectId(proj.id)}
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-3 w-3",
                                            newItemProjectId === proj.id ? "opacity-100" : "opacity-0"
                                          )}
                                        />
                                        <span className="text-xs">{proj.code}</span>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                        </td>
                        <td className="p-2 sm:p-4 text-right">
                          <p className="text-sm tabular-nums font-medium">
                            {selectedProduct
                              ? formatNumber((selectedProduct.standardCost?.amount || 0) * newItemQtyRequired)
                              : '-'
                            }
                          </p>
                        </td>
                        <td className="p-2 sm:p-4 text-center">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            New
                          </span>
                        </td>
                        <td className="p-2 sm:p-4">
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
            </div>
          </TabsContent>

          <TabsContent value="stock-movements" className="mt-0">
            <div className="space-y-4">
              {/* Header with Add Item button on the right */}
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <h1 className="text-2xl font-bold">Stock Movements</h1>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">Filter</Button>
                    <Button variant="outline" size="sm">Print</Button>
                  </div>
                </div>
                <Button variant="default" size="sm">+ Add Item</Button>
              </div>

              {/* Search Bar */}
              <div className="flex items-center gap-4">
                <div className="w-1/2">
                  <Input
                    placeholder="Search by location, product name, or lot number..."
                    className="w-full"
                  />
                </div>
              </div>

              {/* Movements Table */}
              <Card>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lot No.</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                          <th colSpan={2} className="px-6 py-1 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            <div className="flex flex-col items-center gap-1">
                              <span>STOCK</span>
                              <div className="flex justify-center gap-8 w-full border-t pt-1">
                                <div className="w-16 text-right">In</div>
                                <div className="w-16 text-right">Out</div>
                              </div>
                            </div>
                          </th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Cost</th>
                          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total Cost</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {movements.map(movement => {
                          // Filter items to only show inventory transactions
                          const inventoryItems = movement.items.filter(item => item.location.type === 'INV');
                          
                          // Only render movement if it has inventory items
                          if (inventoryItems.length === 0) return null;

                          return (
                            <React.Fragment key={movement.id}>
                              {/* Movement Header */}
                              <tr className="bg-gray-50">
                                <td colSpan={8} className="px-6 py-2">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <span className="text-blue-600">{movement.sourceDocument}</span>
                                      <span className="text-gray-400">|</span>
                                      <span className="text-gray-500">{movement.commitDate}</span>
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {movement.movement.source} → {movement.movement.destination}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                              {/* Movement Items */}
                              {inventoryItems.map(item => 
                                item.lots.map((lot, lotIndex) => (
                                  <tr key={`${item.id}-${lot.lotNo}`} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {lotIndex === 0 ? (
                                        <div className="flex flex-col gap-1">
                                          <div className="text-sm font-medium text-gray-900">{item.location.name}</div>
                                          <div className="flex items-center gap-1 text-xs text-gray-500">
                                            <span>{item.location.code}</span>
                                          </div>
                                        </div>
                                      ) : ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {lotIndex === 0 ? (
                                        <div className="flex flex-col gap-1">
                                          <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                                          <div className="text-sm text-gray-500">{item.sku}</div>
                                        </div>
                                      ) : ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm font-medium text-gray-900">{lot.lotNo}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                      {item.uom}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-800 text-right">
                                      {lot.quantity > 0 ? lot.quantity.toLocaleString() : ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-800 text-right">
                                      {lot.quantity < 0 ? Math.abs(lot.quantity).toLocaleString() : ''}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                                      {item.unitCost.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-red-800 text-right">
                                      {(item.unitCost * Math.abs(lot.quantity)).toLocaleString()}
                                    </td>
                                  </tr>
                                ))
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="journal-entries" className="mt-0">
            <JournalEntriesTab
              refNo={mockRequisition.refNo}
              date={mockRequisition.date}
              department={mockRequisition.department}
              description={mockRequisition.description}
            />
          </TabsContent>

          <TabsContent value="generated-documents" className="mt-0">
            <GeneratedDocumentsTab
              requisitionId={mockRequisition.refNo}
              refNo={mockRequisition.refNo}
              generatedDocuments={mockRequisition.generatedDocuments}
              status={mockRequisition.status}
            />
          </TabsContent>

          <TabsContent value="approval-workflow" className="mt-0">
            <ApprovalWorkflow
              requisitionId={mockRequisition.refNo}
              currentStatus={mockRequisition.status}
              approvalSteps={mockRequisition.approvalSteps}
              currentUserRole="store-manager" // This would come from user context/auth
              itemStatusSummary={{
                total: items.length,
                pending: items.filter(item => item.approvalStatus === 'Pending').length,
                approved: items.filter(item => item.approvalStatus === 'Approved').length,
                rejected: items.filter(item => item.approvalStatus === 'Reject').length,
                review: items.filter(item => item.approvalStatus === 'Review').length
              }}
              onApprove={(stepId, comments) => {
                console.log('Approve:', stepId, comments)
                // This would call your API to approve the step
              }}
              onReject={(stepId, comments) => {
                console.log('Reject:', stepId, comments)
                // This would call your API to reject the step
              }}
              onSendBack={(stepId, comments) => {
                console.log('Return:', stepId, comments)
                // This would call your API to return for review
              }}
            />
          </TabsContent>
              </div>
            </div>
          </CardContent>
        </Tabs>

      {/* Transaction Summary - Enhanced with Tax and Discount */}
      <div className="border-t">
        <div className="p-6">
          <h3 className="text-sm font-semibold mb-4">Transaction Summary</h3>

          {/* Quantity Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-6">
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Total Items</div>
              <div className="text-lg font-medium tabular-nums">{formatNumber(items.length)}</div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Total Quantity</div>
              <div className="text-lg font-medium tabular-nums">
                {formatNumber(items.reduce((sum, item) => sum + item.qtyRequired, 0))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Total Approved</div>
              <div className="text-lg font-medium tabular-nums">
                {formatNumber(items.reduce((sum, item) => sum + item.qtyApproved, 0))}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500 mb-1">Total Issued</div>
              <div className="text-lg font-medium tabular-nums">
                {formatNumber(items.reduce((sum, item) => sum + (item.qtyIssued || 0), 0))}
              </div>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Subtotal */}
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Subtotal</div>
                <div className="text-lg font-medium tabular-nums">
                  {formatNumber(items.reduce((sum, item) => sum + item.total, 0))} BHT
                </div>
              </div>

              {/* Total Tax */}
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Total Tax</div>
                <div className="text-lg font-medium text-orange-600 tabular-nums">
                  {formatNumber(items.reduce((sum, item) => sum + (item.total * item.taxRate / 100), 0))} BHT
                </div>
              </div>

              {/* Total Discount */}
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Total Discount</div>
                <div className="text-lg font-medium text-green-600 tabular-nums">
                  -{formatNumber(items.reduce((sum, item) => sum + (item.total * item.discountRate / 100), 0))} BHT
                </div>
              </div>

              {/* Final Total */}
              <div className="text-right">
                <div className="text-sm text-gray-500 mb-1">Final Total</div>
                <div className="text-xl font-bold text-blue-600 tabular-nums">
                  {(() => {
                    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
                    const totalTax = items.reduce((sum, item) => sum + (item.total * item.taxRate / 100), 0);
                    const totalDiscount = items.reduce((sum, item) => sum + (item.total * item.discountRate / 100), 0);
                    return formatNumber(subtotal + totalTax - totalDiscount);
                  })()} BHT
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        {/* Workflow Actions - Dynamic based on status */}
        {workflowActions.action && (
          <div className="fixed bottom-6 right-6 z-50">
            {(() => {
              const action = workflowActions.action
              if (!action) return null

              const IconComponent = action.icon === 'Check' ? Check :
                                  action.icon === 'XCircle' ? XCircle :
                                  action.icon === 'ArrowLeft' ? ArrowLeft :
                                  action.icon === 'CheckCircle' ? CheckCircle :
                                  action.icon === 'Undo2' ? Undo2 : Check

              return (
                <Button
                  key={action.type}
                  variant={action.variant as any}
                  size="lg"
                  className={`flex items-center gap-3 px-6 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 ${action.className}`}
                  disabled={action.disabled}
                  onClick={() => console.log(`${action.type} action clicked`)}
                  title={action.tooltip}
                >
                  <IconComponent className="w-5 h-5" />
                  <span className="font-semibold">{action.label}</span>
                </Button>
              )
            })()}
          </div>
        )}

        {/* Status Message for non-actionable states */}
        {!workflowActions.action && (
          <div className="border-t bg-muted/20">
            <div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
              {mockRequisition.status === 'Complete' && (
                <>
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>This requisition has been completed and processed.</span>
                </>
              )}
              {mockRequisition.status === 'Void' && (
                <>
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>This requisition has been voided and is no longer active.</span>
                </>
              )}
              {mockRequisition.status === 'In Process' && !workflowActions.action && (
                <>
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Waiting for approval from another user in the workflow.</span>
                </>
              )}
            </div>
          </div>
        )}
      </Card>
        </div>
        
        {/* Side Panel */}
        {isSidePanelOpen && (
          <div className="w-96 flex-shrink-0">
            <div className="space-y-6">
              {/* Comments & Attachments */}
              <Card className="overflow-hidden shadow-sm">
                <CardHeader className="p-6 pb-4 bg-muted/30 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">Comments & Attachments</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSidePanelOpen(false)}
                      aria-label="Close side panel"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="p-6">
                  {/* Comments Section */}
                  <div className="space-y-4 mb-6">
                    {/* Comment 1 */}
                    <div className="border-l-4 border-gray-300 bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-600 font-semibold text-xs">CMR</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-sm">Chef Maria Rodriguez</h4>
                              <p className="text-xs text-muted-foreground">2/25/2024 08:45 PM</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">Spring menu launch requires premium seasonal ingredients. These items will differentiate our menu from competitors.</p>
                        </div>
                      </div>
                    </div>

                    {/* Comment 2 */}
                    <div className="border-l-4 border-gray-300 bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-600 font-semibold text-xs">FMJ</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-sm">Finance Manager John</h4>
                              <p className="text-xs text-muted-foreground">2/28/2024 09:20 PM</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">REJECTED: Seasonal ingredient budget exhausted for Q1. Please reduce quantities or defer to Q2 budget allocation.</p>
                        </div>
                      </div>
                    </div>

                    {/* Comment 3 */}
                    <div className="border-l-4 border-gray-300 bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-600 font-semibold text-xs">CMR</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-sm">Chef Maria Rodriguez</h4>
                              <p className="text-xs text-muted-foreground">2/28/2024 11:30 PM</p>
                            </div>
                          </div>
                          <p className="text-sm text-gray-700">Understanding budget constraints. Will revise request with core ingredients only and defer specialty items to Q2.</p>
                        </div>
                      </div>
                    </div>

                    {/* Add Comment Section */}
                    <div className="border-l-4 border-gray-300 bg-white rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-gray-600 font-semibold text-xs">CMR</span>
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Input placeholder="Add a comment..." className="flex-1" />
                            <Button size="sm" variant="default">
                              <Plus className="w-4 h-4 mr-1" />
                              Submit
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attachments Section */}
                  <div className="border-t pt-6">
                    <h3 className="font-medium text-sm mb-4">Attachments</h3>
                    <div className="space-y-3">
                      {mockRequisition.attachments.map((attachment: { id: number; fileName: string; description: string }) => (
                        <div key={attachment.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                          <Paperclip className="h-4 w-4 text-gray-500 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm text-blue-600 truncate cursor-pointer hover:underline">
                              {attachment.fileName}
                            </p>
                            <p className="text-xs text-gray-500">{attachment.description}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-6">
                              View
                            </Button>
                            <Button variant="ghost" size="sm" className="text-xs px-2 py-1 h-6">
                              Download
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <Button variant="ghost" size="sm" className="w-full text-gray-500 hover:text-gray-700">
                          <Plus className="w-4 h-4 mr-2" />
                          Attach File
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Activity Log Section */}
                  <div className="border-t pt-6 mt-6">
                    <h3 className="font-medium text-sm mb-4">Activity Log</h3>
                    <div className="space-y-3">
                      {/* Activity 1 */}
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Store Requisition Created</p>
                            <span className="text-xs text-gray-500">2/25/2024 08:30 PM</span>
                          </div>
                          <p className="text-xs text-gray-600">Created by Chef Maria Rodriguez</p>
                        </div>
                      </div>

                      {/* Activity 2 */}
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Edit2 className="w-3 h-3 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Requisition Submitted</p>
                            <span className="text-xs text-gray-500">2/25/2024 08:45 PM</span>
                          </div>
                          <p className="text-xs text-gray-600">Submitted for approval by Chef Maria Rodriguez</p>
                        </div>
                      </div>

                      {/* Activity 3 */}
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <AlertCircle className="w-3 h-3 text-yellow-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Under Review</p>
                            <span className="text-xs text-gray-500">2/26/2024 09:15 AM</span>
                          </div>
                          <p className="text-xs text-gray-600">Assigned to Finance Manager John for budget review</p>
                        </div>
                      </div>

                      {/* Activity 4 */}
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <XCircle className="w-3 h-3 text-red-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Rejected</p>
                            <span className="text-xs text-gray-500">2/28/2024 09:20 PM</span>
                          </div>
                          <p className="text-xs text-gray-600">Rejected by Finance Manager John - Budget constraints</p>
                        </div>
                      </div>

                      {/* Activity 5 */}
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <MessageSquare className="w-3 h-3 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Comment Added</p>
                            <span className="text-xs text-gray-500">2/28/2024 11:30 PM</span>
                          </div>
                          <p className="text-xs text-gray-600">Chef Maria Rodriguez acknowledged budget constraints</p>
                        </div>
                      </div>

                      {/* Activity 6 */}
                      <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Edit2 className="w-3 h-3 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">Revision in Progress</p>
                            <span className="text-xs text-gray-500">2/29/2024 08:00 AM</span>
                          </div>
                          <p className="text-xs text-gray-600">Chef Maria Rodriguez is preparing revised request</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* Add Job Code Dialog */}
      <Dialog open={showAddJobCodeDialog} onOpenChange={setShowAddJobCodeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Job Code</DialogTitle>
            <DialogDescription>
              Create a new job code for tracking requisitions against specific jobs or events.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="jobCode">Code *</Label>
              <Input
                id="jobCode"
                value={newJobCode.code}
                onChange={(e) => setNewJobCode({ ...newJobCode, code: e.target.value.toUpperCase() })}
                placeholder="e.g., EVT-003"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="jobName">Name *</Label>
              <Input
                id="jobName"
                value={newJobCode.name}
                onChange={(e) => setNewJobCode({ ...newJobCode, name: e.target.value })}
                placeholder="e.g., Corporate Event"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="jobDescription">Description</Label>
              <Input
                id="jobDescription"
                value={newJobCode.description}
                onChange={(e) => setNewJobCode({ ...newJobCode, description: e.target.value })}
                placeholder="Brief description of the job"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setNewJobCode({ code: '', name: '', description: '' })
              setShowAddJobCodeDialog(false)
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleAddJobCode}
              disabled={!newJobCode.code || !newJobCode.name}
            >
              Add Job Code
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Project Dialog */}
      <Dialog open={showAddProjectDialog} onOpenChange={setShowAddProjectDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Project</DialogTitle>
            <DialogDescription>
              Create a new project for tracking requisitions against specific initiatives.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="projectCode">Code *</Label>
              <Input
                id="projectCode"
                value={newProject.code}
                onChange={(e) => setNewProject({ ...newProject, code: e.target.value.toUpperCase() })}
                placeholder="e.g., PROJ-003"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="projectName">Name *</Label>
              <Input
                id="projectName"
                value={newProject.name}
                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                placeholder="e.g., New Initiative"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="projectDescription">Description</Label>
              <Input
                id="projectDescription"
                value={newProject.description}
                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                placeholder="Brief description of the project"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setNewProject({ code: '', name: '', description: '' })
              setShowAddProjectDialog(false)
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleAddProject}
              disabled={!newProject.code || !newProject.name}
            >
              Add Project
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Job Code Dialog */}
      <Dialog open={showEditJobCodeDialog} onOpenChange={setShowEditJobCodeDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Job Code</DialogTitle>
            <DialogDescription>
              Update the job code details.
            </DialogDescription>
          </DialogHeader>
          {editingJobCode && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editJobCode">Code *</Label>
                <Input
                  id="editJobCode"
                  value={editingJobCode.code}
                  onChange={(e) => setEditingJobCode({ ...editingJobCode, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., EVT-003"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editJobName">Name *</Label>
                <Input
                  id="editJobName"
                  value={editingJobCode.name}
                  onChange={(e) => setEditingJobCode({ ...editingJobCode, name: e.target.value })}
                  placeholder="e.g., Corporate Event"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editJobDescription">Description</Label>
                <Input
                  id="editJobDescription"
                  value={editingJobCode.description}
                  onChange={(e) => setEditingJobCode({ ...editingJobCode, description: e.target.value })}
                  placeholder="Brief description of the job"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditingJobCode(null)
              setShowEditJobCodeDialog(false)
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveJobCode}
              disabled={!editingJobCode?.code || !editingJobCode?.name}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={showEditProjectDialog} onOpenChange={setShowEditProjectDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
            <DialogDescription>
              Update the project details.
            </DialogDescription>
          </DialogHeader>
          {editingProject && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="editProjectCode">Code *</Label>
                <Input
                  id="editProjectCode"
                  value={editingProject.code}
                  onChange={(e) => setEditingProject({ ...editingProject, code: e.target.value.toUpperCase() })}
                  placeholder="e.g., PROJ-003"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editProjectName">Name *</Label>
                <Input
                  id="editProjectName"
                  value={editingProject.name}
                  onChange={(e) => setEditingProject({ ...editingProject, name: e.target.value })}
                  placeholder="e.g., New Initiative"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="editProjectDescription">Description</Label>
                <Input
                  id="editProjectDescription"
                  value={editingProject.description}
                  onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                  placeholder="Brief description of the project"
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setEditingProject(null)
              setShowEditProjectDialog(false)
            }}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveProject}
              disabled={!editingProject?.code || !editingProject?.name}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
} 