'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Textarea } from '@/components/ui/textarea'
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
  Clock,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  Calendar,
  MapPin,
  User,
  Package,
  DollarSign,
  MessageSquare,
  History,
  Edit,
  Camera,
} from 'lucide-react'

// Mock data for wastage report details
const wastageReportData: Record<string, {
  id: string
  date: string
  location: string
  locationCode: string
  status: string
  priority: string
  reportedBy: string
  reportedAt: string
  approvedBy: string | null
  approvedAt: string | null
  item: {
    code: string
    name: string
    description: string
    category: string
    unit: string
    quantity: number
    unitCost: number
    totalLoss: number
    batchNumber: string
    expiryDate: string
  }
  reason: {
    category: string
    description: string
    details: string
  }
  attachments: Array<{
    id: string
    name: string
    type: string
    size: string
    uploadedBy: string
    uploadedAt: string
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
}> = {
  'WR-2024-0089': {
    id: 'WR-2024-0089',
    date: '2024-01-15',
    location: 'Main Kitchen',
    locationCode: 'MK-001',
    status: 'pending',
    priority: 'high',
    reportedBy: 'John Smith',
    reportedAt: '2024-01-15 09:30 AM',
    approvedBy: null,
    approvedAt: null,
    item: {
      code: 'BEV-001',
      name: 'Thai Milk Tea Powder',
      description: 'Premium Thai tea powder with creamer (12 sachets/box)',
      category: 'Beverages',
      unit: 'Box',
      quantity: 5,
      unitCost: 45.99,
      totalLoss: 229.95,
      batchNumber: 'BTH-2024-001234',
      expiryDate: '2024-01-10',
    },
    reason: {
      category: 'Expiration',
      description: 'Product past expiry date',
      details: 'Found during morning inventory check. All 5 boxes expired on January 10th. Products were stored properly but not rotated according to FIFO. Recommend reviewing stock rotation procedures for beverages section.',
    },
    attachments: [
      { id: '1', name: 'expired_products.jpg', type: 'image', size: '2.4 MB', uploadedBy: 'John Smith', uploadedAt: '2024-01-15 09:32 AM' },
      { id: '2', name: 'expiry_label.jpg', type: 'image', size: '1.8 MB', uploadedBy: 'John Smith', uploadedAt: '2024-01-15 09:33 AM' },
    ],
    timeline: [
      { action: 'Report Created', user: 'John Smith', date: '2024-01-15', time: '09:30 AM', notes: 'Initial wastage report submitted' },
      { action: 'Attachments Added', user: 'John Smith', date: '2024-01-15', time: '09:33 AM', notes: '2 photos uploaded as evidence' },
      { action: 'Pending Review', user: 'System', date: '2024-01-15', time: '09:35 AM', notes: 'Awaiting manager approval (high value item)' },
    ],
    relatedReports: [
      { id: 'WR-2024-0072', date: '2024-01-05', itemName: 'Thai Milk Tea Powder', totalLoss: 91.98 },
      { id: 'WR-2024-0058', date: '2023-12-20', itemName: 'Thai Milk Tea Powder', totalLoss: 137.97 },
    ],
  },
  'WR-2024-0087': {
    id: 'WR-2024-0087',
    date: '2024-01-14',
    location: 'Rooftop Restaurant',
    locationCode: 'RR-001',
    status: 'under_review',
    priority: 'high',
    reportedBy: 'James Wilson',
    reportedAt: '2024-01-14 02:15 PM',
    approvedBy: null,
    approvedAt: null,
    item: {
      code: 'MTT-001',
      name: 'Wagyu Beef Premium',
      description: 'A5 grade Wagyu beef, imported from Japan',
      category: 'Meat & Poultry',
      unit: 'Kg',
      quantity: 3,
      unitCost: 185.00,
      totalLoss: 555.00,
      batchNumber: 'WGY-2024-00567',
      expiryDate: '2024-01-18',
    },
    reason: {
      category: 'Quality Issues',
      description: 'Product quality compromised',
      details: 'Noticed discoloration and off-odor upon unpacking. Product was received on January 12th and stored immediately in the chiller. Temperature logs show proper storage. Vendor issue suspected - recommend contacting supplier for investigation and potential credit.',
    },
    attachments: [
      { id: '1', name: 'wagyu_discoloration.jpg', type: 'image', size: '3.1 MB', uploadedBy: 'James Wilson', uploadedAt: '2024-01-14 02:18 PM' },
      { id: '2', name: 'temperature_log.pdf', type: 'document', size: '245 KB', uploadedBy: 'James Wilson', uploadedAt: '2024-01-14 02:20 PM' },
      { id: '3', name: 'delivery_receipt.pdf', type: 'document', size: '180 KB', uploadedBy: 'James Wilson', uploadedAt: '2024-01-14 02:22 PM' },
    ],
    timeline: [
      { action: 'Report Created', user: 'James Wilson', date: '2024-01-14', time: '02:15 PM', notes: 'Quality issue identified during prep' },
      { action: 'Attachments Added', user: 'James Wilson', date: '2024-01-14', time: '02:22 PM', notes: '3 files uploaded as evidence' },
      { action: 'Under Review', user: 'Sarah Chen', date: '2024-01-14', time: '03:45 PM', notes: 'High value item - investigating vendor issue' },
    ],
    relatedReports: [],
  },
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending Review</Badge>
    case 'under_review':
      return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Under Review</Badge>
    case 'approved':
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Approved</Badge>
    case 'rejected':
      return <Badge variant="destructive">Rejected</Badge>
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

function getPriorityBadge(priority: string) {
  switch (priority) {
    case 'high':
      return <Badge variant="destructive">High Priority</Badge>
    case 'medium':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Medium</Badge>
    case 'low':
      return <Badge variant="outline">Low</Badge>
    default:
      return <Badge variant="outline">{priority}</Badge>
  }
}

function getReasonBadge(reason: string) {
  switch (reason) {
    case 'Expiration':
      return <Badge variant="destructive">{reason}</Badge>
    case 'Damage':
      return <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">{reason}</Badge>
    case 'Quality Issues':
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">{reason}</Badge>
    case 'Spoilage':
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">{reason}</Badge>
    default:
      return <Badge variant="outline">{reason}</Badge>
  }
}

export default function WastageReportDetailPage() {
  const params = useParams()
  const reportId = params.id as string

  // Get report data (fallback to first report if not found)
  const report = wastageReportData[reportId] || wastageReportData['WR-2024-0089']

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/store-operations/wastage-reporting/reports">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{report.id}</h1>
              {getStatusBadge(report.status)}
              {getPriorityBadge(report.priority)}
            </div>
            <p className="text-muted-foreground">
              Reported on {report.date} by {report.reportedBy}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          {(report.status === 'pending' || report.status === 'under_review') && (
            <>
              <Button variant="outline" size="sm" className="text-green-600 border-green-300 hover:bg-green-50">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-50">
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </>
          )}
        </div>
      </div>

      {/* High Value Alert */}
      {report.item.totalLoss > 100 && (report.status === 'pending' || report.status === 'under_review') && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>High Value Wastage:</strong> This report exceeds $100 and requires manager approval before processing.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Item Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Item Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Item Name</p>
                    <p className="font-medium">{report.item.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Item Code</p>
                    <p className="font-medium">{report.item.code}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{report.item.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Description</p>
                    <p className="text-sm">{report.item.description}</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Batch Number</p>
                    <p className="font-medium font-mono">{report.item.batchNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Expiry Date</p>
                    <p className="font-medium">{report.item.expiryDate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity Wasted</p>
                    <p className="font-medium">{report.item.quantity} {report.item.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Unit Cost</p>
                    <p className="font-medium">${report.item.unitCost.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Loss Value</span>
                <span className="text-2xl font-bold text-red-600">${report.item.totalLoss.toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Wastage Reason */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Wastage Reason
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  {getReasonBadge(report.reason.category)}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="font-medium">{report.reason.description}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Details & Notes</p>
                  <p className="text-sm bg-gray-50 p-3 rounded-lg mt-1">
                    {report.reason.details}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Attachments */}
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Attachments ({report.attachments.length})
                </CardTitle>
                <Button variant="outline" size="sm">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Add Attachment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {report.attachments.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {report.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="h-10 w-10 rounded bg-gray-100 flex items-center justify-center">
                        {attachment.type === 'image' ? (
                          <ImageIcon className="h-5 w-5 text-gray-600" />
                        ) : (
                          <FileText className="h-5 w-5 text-gray-600" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {attachment.size} • {attachment.uploadedAt}
                        </p>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Camera className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No attachments added</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Review Section (for pending/under_review) */}
          {(report.status === 'pending' || report.status === 'under_review') && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Review Decision
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Review Notes</label>
                    <Textarea
                      placeholder="Add notes for approval or rejection reason..."
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button className="bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve Report
                    </Button>
                    <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject Report
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Report Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Report Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Location</p>
                  <p className="font-medium">{report.location}</p>
                  <p className="text-xs text-muted-foreground">{report.locationCode}</p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Reported By</p>
                  <p className="font-medium">{report.reportedBy}</p>
                  <p className="text-xs text-muted-foreground">{report.reportedAt}</p>
                </div>
              </div>
              {report.approvedBy && (
                <>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm text-muted-foreground">Approved By</p>
                      <p className="font-medium">{report.approvedBy}</p>
                      <p className="text-xs text-muted-foreground">{report.approvedAt}</p>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Activity Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <History className="h-4 w-4" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {report.timeline.map((event, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="h-2 w-2 rounded-full bg-red-500 mt-2" />
                      {index < report.timeline.length - 1 && (
                        <div className="w-px flex-1 bg-gray-200 mt-1" />
                      )}
                    </div>
                    <div className="pb-4">
                      <p className="font-medium text-sm">{event.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {event.user} • {event.date} {event.time}
                      </p>
                      {event.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{event.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Related Reports */}
          {report.relatedReports.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Related Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {report.relatedReports.map((related) => (
                    <Link
                      key={related.id}
                      href={`/store-operations/wastage-reporting/reports/${related.id}`}
                      className="block p-3 border rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm text-red-600">{related.id}</p>
                          <p className="text-xs text-muted-foreground">{related.itemName}</p>
                        </div>
                        <span className="text-sm font-medium text-red-600">
                          ${related.totalLoss.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{related.date}</p>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Edit className="mr-2 h-4 w-4" />
                Edit Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <FileText className="mr-2 h-4 w-4" />
                Generate PDF
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
