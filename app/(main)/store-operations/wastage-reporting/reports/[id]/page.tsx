/**
 * ============================================================================
 * WASTAGE REPORT VIEW PAGE
 * ============================================================================
 *
 * Read-only view page for displaying a single wastage report.
 * This page follows the same pattern as the Inventory Adjustment detail page.
 *
 * PAGE STRUCTURE:
 * 1. Header - Title, report number badge, status badge, action buttons
 * 2. Report Type Indicator - Visual card showing Wastage Report (red theme)
 * 3. Report Details - Location, Category, Description (read-only)
 * 4. Items with Expandable Panels - Each item shows reason, remarks, and per-item evidence attachments
 * 5. Summary Card - Total items, quantity, and loss value
 * 6. Review Section - Review decision for managers
 * 7. Audit Information - Created by/at, Reviewed by/at, Posted by/at
 *
 * KEY FEATURES:
 * - Read-only display for all statuses
 * - Edit button only visible for Draft/Rejected status
 * - Workflow actions: Submit, Approve/Reject, Post to Stock Out
 * - Print and Download action buttons
 * - Per-item evidence attachments displayed in expandable panels
 *
 * BUSINESS RULES:
 * - Draft/Rejected reports can be edited
 * - Submitted/Under Review reports await manager approval
 * - Approved reports can be posted to Stock Out adjustment
 * - Posted reports are completely read-only
 *
 * ============================================================================
 */

"use client"

import { useMemo } from "react"
import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Trash2,
  ArrowLeft,
  Printer,
  Download,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  MapPin,
  Package,
  FolderOpen,
  Send,
  Edit,
  ArrowDownCircle,
  ArrowDownToLine,
  Camera,
  ChevronDown,
  ChevronRight,
  Calendar,
  Hash,
  MessageSquare,
} from 'lucide-react'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"
import { ReviewDecision, ReviewStatusDisplay } from '../../components/review-decision'
import type { WastageReport, WastageReportStatus, WastageItem } from '@/lib/types/wastage'
import { canEditWastageReport, canReviewWastageReport, canPostWastageReport } from '@/lib/types/wastage'
import { InventoryLocationType } from '@/lib/types/location-management'

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface WastageReportDisplayData extends WastageReport {
  priority: string
  attachments: Array<{
    id: string
    fileName: string
    fileType: string
    fileSize: string
    uploadedBy: string
    uploadedAt: string
    url: string
  }>
  timeline: Array<{
    action: string
    user: string
    date: string
    time: string
    notes?: string
  }>
  relatedReports: Array<{
    id: string
    date: string
    itemName: string
    totalLoss: number
  }>
}

// ============================================================================
// MOCK DATA
// ============================================================================

const wastageReportData: Record<string, WastageReportDisplayData> = {
  'WR-2410-0089': {
    id: 'WR-2410-0089',
    reportNumber: 'WR-2410-0089',
    reportDate: '2024-01-15',
    location: 'loc-001',
    locationName: 'Main Kitchen',
    locationType: InventoryLocationType.INVENTORY,
    status: 'Draft',
    priority: 'high',
    createdBy: 'user-001',
    createdByName: 'John Smith',
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-15T09:30:00Z',
    totalItems: 2,
    totalQuantity: 7,
    totalValue: 321.93,
    items: [
      {
        id: 'item-1',
        productId: 'prod-001',
        productCode: 'BEV-001',
        productName: 'Thai Milk Tea Powder',
        productCategory: 'Beverages',
        unit: 'Box',
        unitCost: 45.99,
        quantity: 5,
        batchNumber: 'BTH-2410-001234',
        expiryDate: '2024-01-10',
        wastageCategory: 'WST',
        reason: 'EXP',
        remarks: 'All 5 boxes expired on January 10th. Products were stored properly but not rotated according to FIFO.',
        lossValue: 229.95,
        attachments: [
          { id: '1', fileName: 'expired_products.jpg', fileType: 'image', fileSize: '2.4 MB', uploadedBy: 'John Smith', uploadedAt: '2024-01-15 09:32 AM', url: '#' },
          { id: '2', fileName: 'expiry_label.jpg', fileType: 'image', fileSize: '1.8 MB', uploadedBy: 'John Smith', uploadedAt: '2024-01-15 09:33 AM', url: '#' },
        ],
      },
      {
        id: 'item-2',
        productId: 'prod-002',
        productCode: 'BEV-002',
        productName: 'Green Tea Matcha',
        productCategory: 'Beverages',
        unit: 'Box',
        unitCost: 45.99,
        quantity: 2,
        batchNumber: 'BTH-2410-001235',
        expiryDate: '2024-01-12',
        wastageCategory: 'WST',
        reason: 'EXP',
        remarks: 'Expired during storage.',
        lossValue: 91.98,
        attachments: [],
      },
    ],
    attachments: [],
    timeline: [
      { action: 'Report Created', user: 'John Smith', date: '2024-01-15', time: '09:30 AM', notes: 'Initial wastage report created' },
      { action: 'Attachments Added', user: 'John Smith', date: '2024-01-15', time: '09:33 AM', notes: '2 photos uploaded as evidence' },
    ],
    relatedReports: [
      { id: 'WR-2410-0072', date: '2024-01-05', itemName: 'Thai Milk Tea Powder', totalLoss: 91.98 },
      { id: 'WR-2410-0058', date: '2023-12-20', itemName: 'Thai Milk Tea Powder', totalLoss: 137.97 },
    ],
  },
  'WR-2410-0088': {
    id: 'WR-2410-0088',
    reportNumber: 'WR-2410-0088',
    reportDate: '2024-01-15',
    location: 'loc-002',
    locationName: 'Pastry Kitchen',
    locationType: InventoryLocationType.INVENTORY,
    status: 'Submitted',
    priority: 'high',
    createdBy: 'user-002',
    createdByName: 'Maria Garcia',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    totalItems: 1,
    totalQuantity: 4,
    totalValue: 156.40,
    items: [
      {
        id: 'item-3',
        productId: 'prod-003',
        productCode: 'DRY-015',
        productName: 'Almond Flour',
        productCategory: 'Dry Goods',
        unit: 'Kg',
        unitCost: 39.10,
        quantity: 4,
        batchNumber: 'ALM-2410-00234',
        expiryDate: '2024-01-20',
        wastageCategory: 'WST',
        reason: 'QUAL',
        remarks: 'Flour has developed an off smell indicating rancidity. Stored in dry storage but may have been exposed to humidity.',
        lossValue: 156.40,
        attachments: [
          { id: '1', fileName: 'flour_condition.jpg', fileType: 'image', fileSize: '1.8 MB', uploadedBy: 'Maria Garcia', uploadedAt: '2024-01-15 10:05 AM', url: '#' },
        ],
      },
    ],
    attachments: [],
    timeline: [
      { action: 'Report Created', user: 'Maria Garcia', date: '2024-01-15', time: '10:00 AM', notes: 'Quality issue identified' },
      { action: 'Submitted for Review', user: 'Maria Garcia', date: '2024-01-15', time: '10:30 AM', notes: 'Awaiting manager approval' },
    ],
    relatedReports: [],
  },
  'WR-2410-0087': {
    id: 'WR-2410-0087',
    reportNumber: 'WR-2410-0087',
    reportDate: '2024-01-14',
    location: 'loc-003',
    locationName: 'Rooftop Restaurant',
    locationType: InventoryLocationType.DIRECT,
    status: 'Approved',
    priority: 'high',
    createdBy: 'user-003',
    createdByName: 'James Wilson',
    createdAt: '2024-01-14T14:15:00Z',
    updatedAt: '2024-01-14T16:00:00Z',
    reviewedBy: 'user-004',
    reviewedByName: 'Sarah Chen',
    reviewedAt: '2024-01-14T16:00:00Z',
    reviewDecision: 'approved',
    reviewNotes: 'Verified quality issue. Approved for posting. Will follow up with vendor for credit.',
    totalItems: 1,
    totalQuantity: 3,
    totalValue: 555.00,
    items: [
      {
        id: 'item-4',
        productId: 'prod-004',
        productCode: 'MTT-001',
        productName: 'Wagyu Beef Premium',
        productCategory: 'Meat & Poultry',
        unit: 'Kg',
        unitCost: 185.00,
        quantity: 3,
        batchNumber: 'WGY-2410-00567',
        expiryDate: '2024-01-18',
        wastageCategory: 'WST',
        reason: 'QUAL',
        remarks: 'Noticed discoloration and off-odor upon unpacking. Product was received on January 12th and stored immediately in the chiller.',
        lossValue: 555.00,
        attachments: [
          { id: '1', fileName: 'wagyu_discoloration.jpg', fileType: 'image', fileSize: '3.1 MB', uploadedBy: 'James Wilson', uploadedAt: '2024-01-14 02:18 PM', url: '#' },
          { id: '2', fileName: 'temperature_log.pdf', fileType: 'document', fileSize: '245 KB', uploadedBy: 'James Wilson', uploadedAt: '2024-01-14 02:20 PM', url: '#' },
          { id: '3', fileName: 'delivery_receipt.pdf', fileType: 'document', fileSize: '180 KB', uploadedBy: 'James Wilson', uploadedAt: '2024-01-14 02:22 PM', url: '#' },
        ],
      },
    ],
    attachments: [],
    timeline: [
      { action: 'Report Created', user: 'James Wilson', date: '2024-01-14', time: '02:15 PM', notes: 'Quality issue identified during prep' },
      { action: 'Attachments Added', user: 'James Wilson', date: '2024-01-14', time: '02:22 PM', notes: '3 files uploaded as evidence' },
      { action: 'Submitted for Review', user: 'James Wilson', date: '2024-01-14', time: '02:30 PM' },
      { action: 'Approved', user: 'Sarah Chen', date: '2024-01-14', time: '04:00 PM', notes: 'High value item approved - vendor credit requested' },
    ],
    relatedReports: [],
  },
  'WR-2410-0086': {
    id: 'WR-2410-0086',
    reportNumber: 'WR-2410-0086',
    reportDate: '2024-01-13',
    location: 'loc-001',
    locationName: 'Main Kitchen',
    locationType: InventoryLocationType.INVENTORY,
    status: 'Posted',
    priority: 'medium',
    createdBy: 'user-001',
    createdByName: 'John Smith',
    createdAt: '2024-01-13T08:00:00Z',
    updatedAt: '2024-01-13T14:00:00Z',
    reviewedBy: 'user-004',
    reviewedByName: 'Sarah Chen',
    reviewedAt: '2024-01-13T12:00:00Z',
    reviewDecision: 'approved',
    reviewNotes: 'Standard expiration wastage approved.',
    postedBy: 'user-004',
    postedByName: 'Sarah Chen',
    postedAt: '2024-01-13T14:00:00Z',
    adjustmentReference: 'ADJ-2410-0045',
    totalItems: 2,
    totalQuantity: 10,
    totalValue: 89.50,
    items: [
      {
        id: 'item-5',
        productId: 'prod-005',
        productCode: 'DRY-022',
        productName: 'Vanilla Extract',
        productCategory: 'Dry Goods',
        unit: 'Bottle',
        unitCost: 44.75,
        quantity: 2,
        batchNumber: 'VAN-2410-00123',
        expiryDate: '2024-01-12',
        wastageCategory: 'WST',
        reason: 'EXP',
        remarks: 'Expired during storage. Will review ordering quantities.',
        lossValue: 89.50,
      },
    ],
    attachments: [],
    timeline: [
      { action: 'Report Created', user: 'John Smith', date: '2024-01-13', time: '08:00 AM' },
      { action: 'Submitted for Review', user: 'John Smith', date: '2024-01-13', time: '08:15 AM' },
      { action: 'Approved', user: 'Sarah Chen', date: '2024-01-13', time: '12:00 PM' },
      { action: 'Posted to Inventory', user: 'Sarah Chen', date: '2024-01-13', time: '02:00 PM', notes: 'Stock Out adjustment ADJ-2410-0045 created' },
    ],
    relatedReports: [],
  },
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getStatusBadge(status: WastageReportStatus) {
  switch (status) {
    case 'Draft':
      return <Badge variant="secondary">Draft</Badge>
    case 'Submitted':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Submitted</Badge>
    case 'Under Review':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Under Review</Badge>
    case 'Approved':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
    case 'Rejected':
      return <Badge variant="destructive">Rejected</Badge>
    case 'Posted':
      return <Badge variant="outline" className="border-green-500 text-green-700">Posted</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getReasonLabel(reasonCode: string): string {
  const reasons: Record<string, string> = {
    'EXP': 'Expired',
    'SPOIL': 'Spoiled',
    'QUAL': 'Quality Issue',
    'DMG': 'Damaged',
    'CONT': 'Contaminated',
    'OVERPROD': 'Overproduction',
    'PREP': 'Prep Waste',
    'PLATE': 'Plate Waste',
    'SPILL': 'Spill/Accident',
  }
  return reasons[reasonCode] || reasonCode
}

function getCategoryLabel(categoryCode: string): string {
  const categories: Record<string, string> = {
    'WST': 'Wastage',
    'DMG': 'Damaged Goods',
    'THEFT': 'Theft/Loss',
    'SAMPLE': 'Samples',
    'WRITE': 'Write-Off',
  }
  return categories[categoryCode] || categoryCode
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function WastageReportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const reportId = params.id as string

  // State for actions
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  // Toggle item expansion
  const toggleItemExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(itemId)) {
        newSet.delete(itemId)
      } else {
        newSet.add(itemId)
      }
      return newSet
    })
  }

  // Expand/Collapse all items
  const expandAllItems = () => {
    if (report?.items) {
      setExpandedItems(new Set(report.items.map(item => item.id)))
    }
  }

  const collapseAllItems = () => {
    setExpandedItems(new Set())
  }

  // Get report data (fallback to first report if not found)
  const report = wastageReportData[reportId] || wastageReportData['WR-2410-0089']

  // Determine if user can review (mock - would come from user context)
  const userCanReview = true // For demo purposes

  // ============================================================================
  // COMPUTED VALUES
  // ============================================================================

  const totals = useMemo(() => {
    if (!report || !report.items) return { totalQty: 0, totalValue: 0 }
    const totalQty = report.items.reduce((sum, item) => sum + item.quantity, 0)
    const totalValue = report.items.reduce((sum, item) => sum + item.lossValue, 0)
    return { totalQty, totalValue }
  }, [report])

  // ============================================================================
  // HANDLER FUNCTIONS
  // ============================================================================

  const handleSubmitForReview = async () => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Submitting for review:', reportId)
    setIsSubmitting(false)
  }

  const handleApprove = async (notes: string) => {
    console.log('Approving report:', reportId, 'Notes:', notes)
  }

  const handleReject = async (notes: string) => {
    console.log('Rejecting report:', reportId, 'Notes:', notes)
  }

  const handlePostToStockOut = async () => {
    setIsSubmitting(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('Posting to Stock Out:', reportId)
    setIsSubmitting(false)
  }

  // ============================================================================
  // ERROR STATE
  // ============================================================================

  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Trash2 className="h-12 w-12 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Report Not Found</h2>
        <p className="text-muted-foreground">The wastage report you&apos;re looking for doesn&apos;t exist.</p>
        <Button onClick={() => router.push("/store-operations/wastage-reporting/reports")}>
          Back to Reports
        </Button>
      </div>
    )
  }

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Sticky Header with Title, Status Badge, and Actions */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/store-operations/wastage-reporting/reports")}
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-semibold">View Wastage Report</h1>
                <Badge variant="outline">{report.reportNumber}</Badge>
                {getStatusBadge(report.status)}
              </div>
              <p className="text-sm text-muted-foreground">
                Reported on {report.reportDate} by {report.createdByName}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>

            {/* Status-based workflow actions */}
            {canEditWastageReport(report.status) && (
              <Link href={`/store-operations/wastage-reporting/new?edit=${reportId}`}>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </Link>
            )}

            {canEditWastageReport(report.status) && (
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700"
                onClick={handleSubmitForReview}
                disabled={isSubmitting}
              >
                <Send className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
              </Button>
            )}

            {canPostWastageReport(report.status) && (
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700"
                onClick={handlePostToStockOut}
                disabled={isSubmitting}
              >
                <ArrowDownToLine className="h-4 w-4 mr-2" />
                {isSubmitting ? 'Posting...' : 'Post to Stock Out'}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-4 space-y-6">
        {/* High Value Alert */}
        {totals.totalValue > 100 && canReviewWastageReport(report.status) && (
          <Alert className="border-red-200 bg-red-50">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              <strong>High Value Wastage:</strong> This report exceeds $100 and requires manager approval before processing.
            </AlertDescription>
          </Alert>
        )}

        {/* Report Type Visual Indicator - Color-coded card */}
        <Card className="border-2 border-red-200 bg-red-50/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ArrowDownCircle className="h-8 w-8 text-red-600" />
              <div>
                <h2 className="text-lg font-semibold text-red-700">
                  Wastage Report
                </h2>
                <p className="text-sm text-muted-foreground">
                  Stock Out adjustment for wastage, spoilage, and expired items
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Header Details - Location and Category (Read-Only) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label className="text-muted-foreground">Location</Label>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{report.locationName}</span>
              <Badge variant="outline" className="ml-auto text-xs">{report.locationType}</Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Category</Label>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border">
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">
                {report.items?.[0] ? getCategoryLabel(report.items[0].wastageCategory) : 'Wastage'}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Report Date</Label>
            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{report.reportDate}</span>
            </div>
          </div>
        </div>

        {/* Line Items with Expandable Panels */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Wastage Items</CardTitle>
                <CardDescription>
                  {report.items?.length || 0} item(s) • Total Loss: {totals.totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                </CardDescription>
              </div>
              {report.items && report.items.length > 0 && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={expandAllItems}
                    className="text-xs"
                  >
                    Expand All
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={collapseAllItems}
                    className="text-xs"
                  >
                    Collapse All
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!report.items || report.items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Package className="h-12 w-12 mb-3" />
                <p>No items in this report</p>
              </div>
            ) : (
              <div className="space-y-2">
                {report.items.map((item, index) => (
                  <Collapsible
                    key={item.id}
                    open={expandedItems.has(item.id)}
                    onOpenChange={() => toggleItemExpand(item.id)}
                  >
                    <div className="border rounded-lg overflow-hidden">
                      {/* Item Header Row - Always Visible */}
                      <CollapsibleTrigger asChild>
                        <div className="flex items-center justify-between p-3 hover:bg-muted/50 cursor-pointer">
                          <div className="flex items-center gap-3">
                            {expandedItems.has(item.id) ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground" />
                            )}
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{item.productName}</p>
                                <Badge variant="outline" className="text-xs">
                                  {getReasonLabel(item.reason)}
                                </Badge>
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {item.productCode} • {item.productCategory}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Quantity</p>
                              <p className="font-medium text-red-600">-{item.quantity} {item.unit}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm text-muted-foreground">Unit Cost</p>
                              <p className="font-medium">${item.unitCost.toFixed(2)}</p>
                            </div>
                            <div className="text-right min-w-[100px]">
                              <p className="text-sm text-muted-foreground">Loss Value</p>
                              <p className="font-bold text-red-600">${item.lossValue.toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      {/* Expanded Details */}
                      <CollapsibleContent>
                        <div className="border-t bg-muted/30 p-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Batch Information */}
                            {item.batchNumber && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Hash className="h-3 w-3" />
                                  Batch Number
                                </div>
                                <p className="font-mono text-sm">{item.batchNumber}</p>
                              </div>
                            )}

                            {/* Expiry Date */}
                            {item.expiryDate && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  Expiry Date
                                </div>
                                <p className="text-sm">{item.expiryDate}</p>
                              </div>
                            )}

                            {/* Wastage Category */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <FolderOpen className="h-3 w-3" />
                                Category
                              </div>
                              <p className="text-sm">{getCategoryLabel(item.wastageCategory)}</p>
                            </div>

                            {/* Reason */}
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <AlertTriangle className="h-3 w-3" />
                                Reason
                              </div>
                              <Badge variant="destructive" className="text-xs">
                                {getReasonLabel(item.reason)}
                              </Badge>
                            </div>
                          </div>

                          {/* Remarks */}
                          {item.remarks && (
                            <div className="mt-4 space-y-1">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MessageSquare className="h-3 w-3" />
                                Remarks
                              </div>
                              <div className="bg-background p-3 rounded-md border text-sm">
                                {item.remarks}
                              </div>
                            </div>
                          )}

                          {/* Per-Item Evidence Attachments */}
                          {item.attachments && item.attachments.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Camera className="h-3 w-3" />
                                Evidence Attachments ({item.attachments.length})
                              </div>
                              <div className="grid gap-2 md:grid-cols-2">
                                {item.attachments.map((attachment) => (
                                  <div
                                    key={attachment.id}
                                    className="flex items-center gap-3 p-2 bg-background border rounded-lg hover:bg-gray-50"
                                  >
                                    <div className="h-8 w-8 rounded bg-gray-100 flex items-center justify-center">
                                      {attachment.fileType === 'image' ? (
                                        <ImageIcon className="h-4 w-4 text-gray-600" />
                                      ) : (
                                        <FileText className="h-4 w-4 text-gray-600" />
                                      )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium text-xs truncate">{attachment.fileName}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {attachment.fileSize}
                                      </p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                                      <Download className="h-3 w-3" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary Card - Total items and value with direction indicator */}
        {report.items && report.items.length > 0 && (
          <Card className="bg-red-50/50 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Summary</p>
                  <p className="text-lg font-semibold">
                    {report.items.length} items • {totals.totalQty} units • {totals.totalValue.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} total loss
                  </p>
                </div>
                <Badge variant="destructive" className="text-sm">
                  <ArrowDownCircle className="h-3 w-3 mr-1" />
                  Stock Decrease
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Review Decision Component (for Submitted/Under Review) */}
        {canReviewWastageReport(report.status) && userCanReview && (
          <ReviewDecision
            report={report as unknown as WastageReport}
            onApprove={handleApprove}
            onReject={handleReject}
            isLoading={isSubmitting}
          />
        )}

        {/* Review Status Display (for Approved/Rejected/Posted) */}
        {(report.status === 'Approved' || report.status === 'Rejected' || report.status === 'Posted') && (
          <ReviewStatusDisplay report={report as unknown as WastageReport} />
        )}

        {/* Posted Adjustment Reference */}
        {report.status === 'Posted' && report.adjustmentReference && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Posted to Inventory:</strong> This wastage has been recorded as a Stock Out adjustment.
              <br />
              <Link
                href={`/inventory-management/inventory-adjustments/${report.adjustmentReference}`}
                className="text-green-700 underline font-medium"
              >
                View Adjustment: {report.adjustmentReference}
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {/* Audit Information */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Audit Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground text-xs">Created By</Label>
                <p className="font-medium">{report.createdByName}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(report.createdAt).toLocaleString()}
                </p>
              </div>
              {report.reviewedByName && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Reviewed By</Label>
                  <p className="font-medium">{report.reviewedByName}</p>
                  <p className="text-xs text-muted-foreground">
                    {report.reviewedAt ? new Date(report.reviewedAt).toLocaleString() : '-'}
                  </p>
                </div>
              )}
              {report.postedByName && (
                <div className="space-y-1">
                  <Label className="text-muted-foreground text-xs">Posted By</Label>
                  <p className="font-medium">{report.postedByName}</p>
                  <p className="text-xs text-muted-foreground">
                    {report.postedAt ? new Date(report.postedAt).toLocaleString() : '-'}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sticky Footer - Navigation and Edit actions */}
      <div className="sticky bottom-0 p-4 bg-background border-t">
        <div className="flex items-center justify-end gap-3">
          <Button variant="outline" onClick={() => router.push("/store-operations/wastage-reporting/reports")}>
            Back to List
          </Button>
          {canEditWastageReport(report.status) && (
            <Link href={`/store-operations/wastage-reporting/new?edit=${reportId}`}>
              <Button className="bg-red-600 hover:bg-red-700">
                <Edit className="h-4 w-4 mr-2" />
                Edit Report
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}
