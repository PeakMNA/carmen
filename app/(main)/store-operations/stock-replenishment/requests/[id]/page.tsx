"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import {
  ArrowLeft,
  Download,
  Printer,
  Edit,
  MapPin,
  Calendar,
  User,
  Package,
  CheckCircle,
  XCircle,
  Truck,
  Clock,
  FileText,
  MessageSquare,
  History,
  AlertTriangle
} from "lucide-react"

// Mock transfer request data
const transferRequestData: Record<string, {
  id: string
  location: string
  locationCode: string
  status: string
  priority: string
  requestedBy: string
  requestedDate: string
  approvedBy: string | null
  approvedDate: string | null
  completedDate: string | null
  notes: string
  items: Array<{
    id: string
    name: string
    sku: string
    category: string
    requestedQty: number
    approvedQty: number | null
    transferredQty: number | null
    unit: string
    unitPrice: number
    currentStock: number
    parLevel: number
  }>
  timeline: Array<{
    action: string
    user: string
    date: string
    notes: string
  }>
}> = {
  "TR-2024-0089": {
    id: "TR-2024-0089",
    location: "Central Kitchen",
    locationCode: "CK-001",
    status: "pending",
    priority: "high",
    requestedBy: "John Smith",
    requestedDate: "2024-01-15 09:30 AM",
    approvedBy: null,
    approvedDate: null,
    completedDate: null,
    notes: "Urgent - running low on beverages for the weekend event",
    items: [
      { id: "1", name: "Thai Milk Tea", sku: "BEV-001", category: "Beverages", requestedQty: 20, approvedQty: null, transferredQty: null, unit: "Box", unitPrice: 45.99, currentStock: 5, parLevel: 30 },
      { id: "2", name: "Coffee Beans", sku: "BEV-002", category: "Beverages", requestedQty: 15, approvedQty: null, transferredQty: null, unit: "Bag", unitPrice: 28.50, currentStock: 10, parLevel: 25 },
      { id: "3", name: "Orange Juice", sku: "BEV-003", category: "Beverages", requestedQty: 30, approvedQty: null, transferredQty: null, unit: "Carton", unitPrice: 12.00, currentStock: 8, parLevel: 40 },
      { id: "4", name: "Mineral Water", sku: "BEV-004", category: "Beverages", requestedQty: 50, approvedQty: null, transferredQty: null, unit: "Case", unitPrice: 8.50, currentStock: 15, parLevel: 60 },
      { id: "5", name: "Green Tea", sku: "BEV-005", category: "Beverages", requestedQty: 10, approvedQty: null, transferredQty: null, unit: "Box", unitPrice: 32.00, currentStock: 3, parLevel: 15 },
      { id: "6", name: "Coconut Milk", sku: "BEV-006", category: "Beverages", requestedQty: 12, approvedQty: null, transferredQty: null, unit: "Can", unitPrice: 4.50, currentStock: 6, parLevel: 20 },
      { id: "7", name: "Lemon Syrup", sku: "BEV-007", category: "Beverages", requestedQty: 8, approvedQty: null, transferredQty: null, unit: "Bottle", unitPrice: 15.00, currentStock: 2, parLevel: 10 },
      { id: "8", name: "Ice Cream Mix", sku: "DST-001", category: "Desserts", requestedQty: 5, approvedQty: null, transferredQty: null, unit: "Tub", unitPrice: 25.00, currentStock: 1, parLevel: 8 },
    ],
    timeline: [
      { action: "Request Created", user: "John Smith", date: "2024-01-15 09:30 AM", notes: "Transfer request submitted for approval" },
    ]
  }
}

// Default data for unknown IDs
const defaultTransferRequest = {
  id: "TR-2024-0087",
  location: "Restaurant",
  locationCode: "RS-001",
  status: "in_transit",
  priority: "high",
  requestedBy: "Mike Chen",
  requestedDate: "2024-01-14 02:15 PM",
  approvedBy: "David Brown",
  approvedDate: "2024-01-14 03:30 PM",
  completedDate: null,
  notes: "Weekend preparation - expecting high volume",
  items: [
    { id: "1", name: "Olive Oil", sku: "OIL-001", category: "Oils", requestedQty: 10, approvedQty: 10, transferredQty: 10, unit: "Bottle", unitPrice: 18.50, currentStock: 2, parLevel: 12 },
    { id: "2", name: "Flour All-Purpose", sku: "DRY-001", category: "Dry Goods", requestedQty: 25, approvedQty: 25, transferredQty: 25, unit: "Bag", unitPrice: 8.00, currentStock: 5, parLevel: 30 },
    { id: "3", name: "Fresh Salmon", sku: "SEA-001", category: "Seafood", requestedQty: 15, approvedQty: 12, transferredQty: 12, unit: "Kg", unitPrice: 28.00, currentStock: 3, parLevel: 20 },
    { id: "4", name: "Chicken Breast", sku: "PRO-001", category: "Proteins", requestedQty: 20, approvedQty: 20, transferredQty: 20, unit: "Kg", unitPrice: 12.50, currentStock: 4, parLevel: 25 },
    { id: "5", name: "Mixed Vegetables", sku: "PRD-001", category: "Produce", requestedQty: 30, approvedQty: 30, transferredQty: 30, unit: "Kg", unitPrice: 6.00, currentStock: 8, parLevel: 40 },
    { id: "6", name: "Butter Unsalted", sku: "DRY-002", category: "Dairy", requestedQty: 15, approvedQty: 15, transferredQty: 15, unit: "Pack", unitPrice: 5.50, currentStock: 3, parLevel: 18 },
    { id: "7", name: "Heavy Cream", sku: "DRY-003", category: "Dairy", requestedQty: 20, approvedQty: 18, transferredQty: 18, unit: "Carton", unitPrice: 7.00, currentStock: 5, parLevel: 25 },
    { id: "8", name: "Fresh Herbs Mix", sku: "PRD-002", category: "Produce", requestedQty: 8, approvedQty: 8, transferredQty: 8, unit: "Pack", unitPrice: 12.00, currentStock: 1, parLevel: 10 },
    { id: "9", name: "Garlic", sku: "PRD-003", category: "Produce", requestedQty: 5, approvedQty: 5, transferredQty: 5, unit: "Kg", unitPrice: 8.00, currentStock: 0.5, parLevel: 6 },
    { id: "10", name: "Onions", sku: "PRD-004", category: "Produce", requestedQty: 10, approvedQty: 10, transferredQty: 10, unit: "Kg", unitPrice: 3.00, currentStock: 2, parLevel: 12 },
    { id: "11", name: "Tomatoes", sku: "PRD-005", category: "Produce", requestedQty: 12, approvedQty: 12, transferredQty: 12, unit: "Kg", unitPrice: 4.50, currentStock: 3, parLevel: 15 },
    { id: "12", name: "Parmesan Cheese", sku: "DRY-004", category: "Dairy", requestedQty: 5, approvedQty: 5, transferredQty: 5, unit: "Kg", unitPrice: 35.00, currentStock: 0.5, parLevel: 6 },
  ],
  timeline: [
    { action: "Request Created", user: "Mike Chen", date: "2024-01-14 02:15 PM", notes: "Transfer request submitted for approval" },
    { action: "Request Approved", user: "David Brown", date: "2024-01-14 03:30 PM", notes: "Approved with minor quantity adjustments for salmon and cream" },
    { action: "Transfer Started", user: "Warehouse Team", date: "2024-01-14 04:00 PM", notes: "Items picked and ready for transfer" },
    { action: "In Transit", user: "Logistics", date: "2024-01-14 04:30 PM", notes: "Transfer in progress to Restaurant" },
  ]
}

function getStatusBadge(status: string) {
  const config: Record<string, { label: string; className: string }> = {
    pending: { label: "Pending Approval", className: "bg-yellow-100 text-yellow-700 border-yellow-200" },
    approved: { label: "Approved", className: "bg-blue-100 text-blue-700 border-blue-200" },
    in_transit: { label: "In Transit", className: "bg-purple-100 text-purple-700 border-purple-200" },
    completed: { label: "Completed", className: "bg-green-100 text-green-700 border-green-200" },
    rejected: { label: "Rejected", className: "bg-red-100 text-red-700 border-red-200" }
  }
  const { label, className } = config[status] || { label: status, className: "" }
  return <Badge variant="outline" className={className}>{label}</Badge>
}

function getPriorityBadge(priority: string) {
  const config: Record<string, string> = {
    high: "bg-red-100 text-red-700 border-red-200",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200",
    low: "bg-green-100 text-green-700 border-green-200"
  }
  return (
    <Badge variant="outline" className={config[priority]}>
      {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
    </Badge>
  )
}

export default function TransferRequestDetailPage() {
  const params = useParams()
  const requestId = params.id as string

  // Get transfer request data
  const request = transferRequestData[requestId] || defaultTransferRequest

  // Calculate totals
  const totals = useMemo(() => {
    const requestedTotal = request.items.reduce((sum, item) => sum + (item.requestedQty * item.unitPrice), 0)
    const approvedTotal = request.items.reduce((sum, item) => sum + ((item.approvedQty || 0) * item.unitPrice), 0)
    const transferredTotal = request.items.reduce((sum, item) => sum + ((item.transferredQty || 0) * item.unitPrice), 0)
    return { requestedTotal, approvedTotal, transferredTotal }
  }, [request.items])

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/store-operations/stock-replenishment/requests">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Requests
            </Button>
          </Link>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {request.status === "pending" && (
            <>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" size="sm">
                <XCircle className="h-4 w-4 mr-2" />
                Reject
              </Button>
              <Button size="sm">
                <CheckCircle className="h-4 w-4 mr-2" />
                Approve
              </Button>
            </>
          )}
          {request.status === "approved" && (
            <Button size="sm">
              <Truck className="h-4 w-4 mr-2" />
              Start Transfer
            </Button>
          )}
          {request.status === "in_transit" && (
            <Button size="sm">
              <CheckCircle className="h-4 w-4 mr-2" />
              Mark Completed
            </Button>
          )}
        </div>
      </div>

      {/* Request Header Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start gap-4">
            <div>
              <CardTitle className="text-2xl flex items-center gap-3">
                {request.id}
                {getStatusBadge(request.status)}
                {getPriorityBadge(request.priority)}
              </CardTitle>
              <CardDescription className="mt-2">
                Internal Stock Transfer Request
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                Destination Location
              </p>
              <p className="font-medium">{request.location}</p>
              <p className="text-sm text-muted-foreground">{request.locationCode}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <User className="h-4 w-4" />
                Requested By
              </p>
              <p className="font-medium">{request.requestedBy}</p>
              <p className="text-sm text-muted-foreground">{request.requestedDate}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <CheckCircle className="h-4 w-4" />
                Approved By
              </p>
              <p className="font-medium">{request.approvedBy || "—"}</p>
              <p className="text-sm text-muted-foreground">{request.approvedDate || "Pending"}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Package className="h-4 w-4" />
                Items / Value
              </p>
              <p className="font-medium">{request.items.length} items</p>
              <p className="text-sm text-muted-foreground">${totals.requestedTotal.toFixed(2)} requested</p>
            </div>
          </div>

          {request.notes && (
            <>
              <Separator className="my-4" />
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <FileText className="h-4 w-4" />
                  Notes
                </p>
                <p className="text-sm">{request.notes}</p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Items Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transfer Items</CardTitle>
          <CardDescription>
            {request.items.length} items in this transfer request
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Item</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">PAR Level</TableHead>
                  <TableHead className="text-right">Requested</TableHead>
                  <TableHead className="text-right">Approved</TableHead>
                  <TableHead className="text-right">Transferred</TableHead>
                  <TableHead className="text-right">Unit Price</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {request.items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.sku}</div>
                      </div>
                    </TableCell>
                    <TableCell>{item.category}</TableCell>
                    <TableCell className="text-right">
                      <span className={item.currentStock < item.parLevel * 0.3 ? "text-red-600 font-medium" : ""}>
                        {item.currentStock} {item.unit}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">{item.parLevel} {item.unit}</TableCell>
                    <TableCell className="text-right">{item.requestedQty} {item.unit}</TableCell>
                    <TableCell className="text-right">
                      {item.approvedQty !== null ? (
                        <span className={item.approvedQty !== item.requestedQty ? "text-yellow-600" : ""}>
                          {item.approvedQty} {item.unit}
                        </span>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      {item.transferredQty !== null ? `${item.transferredQty} ${item.unit}` : "—"}
                    </TableCell>
                    <TableCell className="text-right">${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell className="text-right font-medium">
                      ${((item.transferredQty || item.approvedQty || item.requestedQty) * item.unitPrice).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Totals */}
          <div className="flex justify-end mt-4">
            <div className="w-full md:w-80 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Requested Total:</span>
                <span>${totals.requestedTotal.toFixed(2)}</span>
              </div>
              {totals.approvedTotal > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Approved Total:</span>
                  <span>${totals.approvedTotal.toFixed(2)}</span>
                </div>
              )}
              {totals.transferredTotal > 0 && (
                <>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Transfer Total:</span>
                    <span>${totals.transferredTotal.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <History className="h-5 w-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Low Stock Warning (if applicable) */}
      {request.items.some(item => item.currentStock < item.parLevel * 0.3) && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-yellow-800">Low Stock Alert</p>
                <p className="text-sm text-yellow-700">
                  Some items in this request are critically low at the destination location.
                  Consider prioritizing this transfer.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
