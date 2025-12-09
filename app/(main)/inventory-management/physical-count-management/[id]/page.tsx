"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import { format, formatDistanceToNow } from "date-fns"
import {
  ArrowLeft,
  Play,
  Pause,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  User,
  Users,
  Calendar,
  FileText,
  AlertTriangle,
  Package,
  TrendingUp,
  TrendingDown,
  MoreVertical,
  Edit,
  Trash2,
  Copy,
  Printer,
  Download,
  RefreshCw,
  Eye,
  ClipboardCheck,
  Target,
  BarChart3,
  AlertCircle,
  CheckCheck,
  Ban,
  Building2,
  Layers,
  CircleDot,
  ShieldCheck,
  ArrowUpDown,
  RotateCcw,
  Lock,
  Unlock,
  FileCheck,
  ArrowRightLeft
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { getPhysicalCountById } from "@/lib/mock-data/physical-counts"
import type {
  PhysicalCount,
  PhysicalCountItem,
  PhysicalCountStatus,
  PhysicalCountType,
  ItemCountStatus,
  VarianceReason
} from "../types"

// Status configuration
const statusConfig: Record<PhysicalCountStatus, { label: string; color: string; icon: React.ReactNode }> = {
  'draft': { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: <FileText className="h-4 w-4" /> },
  'planning': { label: 'Planning', color: 'bg-purple-100 text-purple-700', icon: <Layers className="h-4 w-4" /> },
  'pending': { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: <Clock className="h-4 w-4" /> },
  'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: <RefreshCw className="h-4 w-4" /> },
  'completed': { label: 'Completed', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-4 w-4" /> },
  'finalized': { label: 'Finalized', color: 'bg-emerald-100 text-emerald-700', icon: <ShieldCheck className="h-4 w-4" /> },
  'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: <XCircle className="h-4 w-4" /> },
  'on-hold': { label: 'On Hold', color: 'bg-orange-100 text-orange-700', icon: <Pause className="h-4 w-4" /> }
}

const typeConfig: Record<PhysicalCountType, { label: string; color: string; icon: React.ReactNode }> = {
  'full': { label: 'Full Count', color: 'bg-indigo-100 text-indigo-700', icon: <Package className="h-4 w-4" /> },
  'cycle': { label: 'Cycle Count', color: 'bg-blue-100 text-blue-700', icon: <RefreshCw className="h-4 w-4" /> },
  'annual': { label: 'Annual Count', color: 'bg-purple-100 text-purple-700', icon: <Calendar className="h-4 w-4" /> },
  'perpetual': { label: 'Perpetual', color: 'bg-green-100 text-green-700', icon: <RotateCcw className="h-4 w-4" /> },
  'partial': { label: 'Partial Count', color: 'bg-amber-100 text-amber-700', icon: <CircleDot className="h-4 w-4" /> }
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  'low': { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  'medium': { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  'high': { label: 'High', color: 'bg-orange-100 text-orange-700' },
  'critical': { label: 'Critical', color: 'bg-red-100 text-red-700' }
}

const itemStatusConfig: Record<ItemCountStatus, { label: string; color: string }> = {
  'pending': { label: 'Pending', color: 'bg-gray-100 text-gray-700' },
  'counted': { label: 'Counted', color: 'bg-green-100 text-green-700' },
  'variance': { label: 'Variance', color: 'bg-red-100 text-red-700' },
  'approved': { label: 'Approved', color: 'bg-emerald-100 text-emerald-700' },
  'skipped': { label: 'Skipped', color: 'bg-amber-100 text-amber-700' },
  'recount': { label: 'Recount', color: 'bg-purple-100 text-purple-700' }
}

const varianceReasonConfig: Record<VarianceReason, { label: string; color: string }> = {
  'damage': { label: 'Damage', color: 'bg-orange-100 text-orange-700' },
  'theft': { label: 'Theft', color: 'bg-red-100 text-red-700' },
  'spoilage': { label: 'Spoilage', color: 'bg-amber-100 text-amber-700' },
  'measurement-error': { label: 'Measurement Error', color: 'bg-blue-100 text-blue-700' },
  'system-error': { label: 'System Error', color: 'bg-purple-100 text-purple-700' },
  'receiving-error': { label: 'Receiving Error', color: 'bg-indigo-100 text-indigo-700' },
  'issue-error': { label: 'Issue Error', color: 'bg-cyan-100 text-cyan-700' },
  'unknown': { label: 'Unknown', color: 'bg-gray-100 text-gray-700' },
  'other': { label: 'Other', color: 'bg-gray-100 text-gray-700' }
}

export default function PhysicalCountDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id as string

  const [physicalCount, setPhysicalCount] = useState<PhysicalCount | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "items" | "variance" | "team" | "history">("overview")
  const [itemSearch, setItemSearch] = useState("")
  const [itemStatusFilter, setItemStatusFilter] = useState<ItemCountStatus | "all">("all")
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [showFinalizeDialog, setShowFinalizeDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState("")

  // Load physical count data
  useEffect(() => {
    const data = getPhysicalCountById(id)
    if (data) {
      setPhysicalCount(data)
    }
    setLoading(false)
  }, [id])

  // Filter items
  const filteredItems = useMemo(() => {
    if (!physicalCount) return []

    return physicalCount.items.filter(item => {
      const matchesSearch =
        item.itemName.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.itemCode.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.category.toLowerCase().includes(itemSearch.toLowerCase())

      const matchesStatus = itemStatusFilter === "all" || item.status === itemStatusFilter

      return matchesSearch && matchesStatus
    })
  }, [physicalCount, itemSearch, itemStatusFilter])

  // Variance items
  const varianceItems = useMemo(() => {
    if (!physicalCount) return []
    return physicalCount.items.filter(item => item.status === 'variance' || Math.abs(item.variance) > 0)
  }, [physicalCount])

  // Items needing recount
  const recountItems = useMemo(() => {
    if (!physicalCount) return []
    return physicalCount.items.filter(item => item.status === 'recount')
  }, [physicalCount])

  // Handlers
  const handleStartCount = () => {
    router.push(`/inventory-management/physical-count-management/${id}/count`)
  }

  const handleResumeCount = () => {
    router.push(`/inventory-management/physical-count-management/${id}/count`)
  }

  const handleCompleteCount = () => {
    if (physicalCount) {
      setPhysicalCount({
        ...physicalCount,
        status: 'completed',
        completedAt: new Date()
      })
    }
  }

  const handleFinalizeCount = () => {
    if (physicalCount) {
      setPhysicalCount({
        ...physicalCount,
        status: 'finalized',
        isFinalized: true,
        finalizedAt: new Date(),
        finalizedBy: 'Current User'
      })
      setShowFinalizeDialog(false)
    }
  }

  const handleCancelCount = () => {
    if (physicalCount && cancelReason) {
      setPhysicalCount({
        ...physicalCount,
        status: 'cancelled',
        notes: cancelReason
      })
      setShowCancelDialog(false)
      setCancelReason("")
    }
  }

  const handlePutOnHold = () => {
    if (physicalCount) {
      setPhysicalCount({
        ...physicalCount,
        status: 'on-hold'
      })
    }
  }

  const handleResumeFromHold = () => {
    if (physicalCount) {
      setPhysicalCount({
        ...physicalCount,
        status: physicalCount.countedItems > 0 ? 'in-progress' : 'pending'
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!physicalCount) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <AlertCircle className="h-16 w-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Physical Count Not Found</h2>
        <p className="text-muted-foreground">The physical count you're looking for doesn't exist.</p>
        <Button onClick={() => router.push("/inventory-management/physical-count-management")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Physical Counts
        </Button>
      </div>
    )
  }

  const status = statusConfig[physicalCount.status]
  const type = typeConfig[physicalCount.countType]
  const priority = priorityConfig[physicalCount.priority]
  const progress = physicalCount.totalItems > 0 ? (physicalCount.countedItems / physicalCount.totalItems) * 100 : 0
  const isOverdue = physicalCount.dueDate && new Date(physicalCount.dueDate) < new Date() &&
    physicalCount.status !== 'completed' && physicalCount.status !== 'finalized' && physicalCount.status !== 'cancelled'

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/inventory-management/physical-count-management" className="hover:text-foreground transition-colors">
            Physical Counts
          </Link>
          <span>/</span>
          <span className="text-foreground">{physicalCount.countNumber}</span>
        </div>

        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/inventory-management/physical-count-management")}
              className="mt-1"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold">{physicalCount.countNumber}</h1>
                <Badge className={status.color}>
                  {status.icon}
                  <span className="ml-1">{status.label}</span>
                </Badge>
                <Badge className={type.color}>
                  {type.icon}
                  <span className="ml-1">{type.label}</span>
                </Badge>
                <Badge className={priority.color}>
                  {priority.label} Priority
                </Badge>
                {physicalCount.isFinalized && (
                  <Badge className="bg-emerald-100 text-emerald-700">
                    <Lock className="h-3 w-3 mr-1" />
                    Finalized
                  </Badge>
                )}
                {isOverdue && (
                  <Badge variant="destructive">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Overdue
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">{physicalCount.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {physicalCount.status === 'pending' && (
              <Button onClick={handleStartCount}>
                <Play className="h-4 w-4 mr-2" />
                Start Count
              </Button>
            )}
            {physicalCount.status === 'in-progress' && (
              <>
                <Button variant="outline" onClick={handlePutOnHold}>
                  <Pause className="h-4 w-4 mr-2" />
                  Put On Hold
                </Button>
                <Button onClick={handleResumeCount}>
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Continue Count
                </Button>
              </>
            )}
            {physicalCount.status === 'on-hold' && (
              <Button onClick={handleResumeFromHold}>
                <Play className="h-4 w-4 mr-2" />
                Resume
              </Button>
            )}
            {physicalCount.status === 'completed' && !physicalCount.isFinalized && (
              <Button onClick={() => setShowFinalizeDialog(true)}>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Finalize & Post
              </Button>
            )}
            {physicalCount.status === 'draft' && (
              <Button onClick={handleStartCount}>
                <Play className="h-4 w-4 mr-2" />
                Activate
              </Button>
            )}
            {physicalCount.status === 'planning' && (
              <Button onClick={handleStartCount}>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Approve Plan
              </Button>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Printer className="h-4 w-4 mr-2" />
                  Print Count Sheet
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Download className="h-4 w-4 mr-2" />
                  Export Report
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Variance Report
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {physicalCount.status !== 'completed' && physicalCount.status !== 'finalized' && physicalCount.status !== 'cancelled' && (
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancel Count
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Progress Bar (for active counts) */}
      {(physicalCount.status === 'in-progress' || physicalCount.status === 'on-hold') && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Counting Progress</span>
              <span className="text-sm text-muted-foreground">
                {physicalCount.countedItems} of {physicalCount.totalItems} items ({progress.toFixed(0)}%)
              </span>
            </div>
            <Progress value={progress} className="h-3" />
            <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckCheck className="h-3 w-3 text-green-500" />
                {physicalCount.approvedItems} approved
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-red-500" />
                {physicalCount.varianceItems} variance
              </span>
              <span className="flex items-center gap-1">
                <RotateCcw className="h-3 w-3 text-purple-500" />
                {physicalCount.recountItems} recount
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-gray-500" />
                {physicalCount.pendingItems} remaining
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Items</p>
                <p className="text-2xl font-bold">{physicalCount.totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Accuracy Rate</p>
                <p className="text-2xl font-bold">
                  {physicalCount.accuracy > 0 ? `${physicalCount.accuracy.toFixed(1)}%` : '-'}
                </p>
              </div>
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Value</p>
                <p className="text-2xl font-bold">${physicalCount.totalSystemValue.toLocaleString()}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Counted Value</p>
                <p className="text-2xl font-bold">${physicalCount.totalCountedValue.toLocaleString()}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Variance Value</p>
                <p className={`text-2xl font-bold ${physicalCount.varianceValue !== 0 ? 'text-red-600' : ''}`}>
                  {physicalCount.varianceValue < 0 ? '-' : ''}${Math.abs(physicalCount.varianceValue).toLocaleString()}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="items">
            Items ({physicalCount.totalItems})
          </TabsTrigger>
          <TabsTrigger value="variance">
            Variances ({physicalCount.varianceItems})
          </TabsTrigger>
          <TabsTrigger value="team">
            Team ({physicalCount.counters.length + 1})
          </TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="mt-4">
          <div className="grid grid-cols-3 gap-6">
            {/* Left Column - Details */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Count Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      {physicalCount.locationName}
                    </p>
                  </div>
                  {physicalCount.departmentName && (
                    <div>
                      <p className="text-sm text-muted-foreground">Department</p>
                      <p className="font-medium flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        {physicalCount.departmentName}
                      </p>
                    </div>
                  )}
                  {physicalCount.zone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Zone</p>
                      <p className="font-medium flex items-center gap-2">
                        <Layers className="h-4 w-4" />
                        {physicalCount.zone}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Supervisor</p>
                    <p className="font-medium flex items-center gap-2">
                      <User className="h-4 w-4" />
                      {physicalCount.supervisorName}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Count Team</p>
                    <p className="font-medium flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      {physicalCount.counters.length} counter{physicalCount.counters.length !== 1 ? 's' : ''} assigned
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Scheduled Date</p>
                    <p className="font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {format(new Date(physicalCount.scheduledDate), "PPP")}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Due Date</p>
                    <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                      {physicalCount.dueDate ? format(new Date(physicalCount.dueDate), "PPP") : '-'}
                    </p>
                  </div>
                  {physicalCount.startedAt && (
                    <div>
                      <p className="text-sm text-muted-foreground">Started At</p>
                      <p className="font-medium">
                        {format(new Date(physicalCount.startedAt), "PPP p")}
                      </p>
                    </div>
                  )}
                  {physicalCount.completedAt && (
                    <div>
                      <p className="text-sm text-muted-foreground">Completed At</p>
                      <p className="font-medium">
                        {format(new Date(physicalCount.completedAt), "PPP p")}
                      </p>
                    </div>
                  )}
                  {physicalCount.finalizedAt && (
                    <div>
                      <p className="text-sm text-muted-foreground">Finalized At</p>
                      <p className="font-medium text-emerald-600">
                        {format(new Date(physicalCount.finalizedAt), "PPP p")}
                      </p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground">Approval Threshold</p>
                    <p className="font-medium">{physicalCount.approvalThreshold}% variance</p>
                  </div>
                </div>

                {physicalCount.instructions && (
                  <div className="col-span-2">
                    <Separator className="my-4" />
                    <p className="text-sm text-muted-foreground mb-2">Instructions</p>
                    <p className="text-sm">{physicalCount.instructions}</p>
                  </div>
                )}

                {physicalCount.notes && (
                  <div className="col-span-2">
                    <Separator className="my-4" />
                    <p className="text-sm text-muted-foreground mb-2">Notes</p>
                    <p className="text-sm">{physicalCount.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right Column - Quick Stats */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Item Status Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <CheckCheck className="h-4 w-4 text-emerald-500" />
                      Approved
                    </span>
                    <span className="font-medium">{physicalCount.approvedItems}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      Counted
                    </span>
                    <span className="font-medium">{physicalCount.countedItems - physicalCount.approvedItems - physicalCount.varianceItems}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                      Variance
                    </span>
                    <span className="font-medium">{physicalCount.varianceItems}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <RotateCcw className="h-4 w-4 text-purple-500" />
                      Recount Required
                    </span>
                    <span className="font-medium">{physicalCount.recountItems}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      Pending
                    </span>
                    <span className="font-medium">{physicalCount.pendingItems}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Variance Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Items with Variance</span>
                    <span className="font-medium text-red-600">{physicalCount.varianceItems}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Variance %</span>
                    <span className={`font-medium ${Math.abs(physicalCount.variancePercent) > physicalCount.approvalThreshold ? 'text-red-600' : ''}`}>
                      {physicalCount.variancePercent.toFixed(2)}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Requires Approval</span>
                    <span className="font-medium">
                      {physicalCount.requiresApproval ? (
                        <Badge variant="destructive" className="text-xs">Yes</Badge>
                      ) : (
                        <Badge className="bg-green-100 text-green-700 text-xs">No</Badge>
                      )}
                    </span>
                  </div>
                  {physicalCount.adjustmentPosted && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Adjustment Posted</span>
                      <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                        Posted
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="relative pl-4 border-l-2 border-muted space-y-4">
                    <div className="relative">
                      <div className="absolute -left-[21px] w-4 h-4 rounded-full bg-green-500" />
                      <p className="text-sm font-medium">Created</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(physicalCount.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {physicalCount.startedAt && (
                      <div className="relative">
                        <div className="absolute -left-[21px] w-4 h-4 rounded-full bg-blue-500" />
                        <p className="text-sm font-medium">Started</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(physicalCount.startedAt), { addSuffix: true })}
                        </p>
                      </div>
                    )}
                    {physicalCount.completedAt && (
                      <div className="relative">
                        <div className="absolute -left-[21px] w-4 h-4 rounded-full bg-green-500" />
                        <p className="text-sm font-medium">Completed</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(physicalCount.completedAt), { addSuffix: true })}
                        </p>
                      </div>
                    )}
                    {physicalCount.finalizedAt && (
                      <div className="relative">
                        <div className="absolute -left-[21px] w-4 h-4 rounded-full bg-emerald-500" />
                        <p className="text-sm font-medium">Finalized</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(physicalCount.finalizedAt), { addSuffix: true })}
                        </p>
                      </div>
                    )}
                    {physicalCount.status === 'cancelled' && (
                      <div className="relative">
                        <div className="absolute -left-[21px] w-4 h-4 rounded-full bg-red-500" />
                        <p className="text-sm font-medium">Cancelled</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(physicalCount.updatedAt), { addSuffix: true })}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Items Tab */}
        <TabsContent value="items" className="mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>All Items</CardTitle>
                <div className="flex items-center gap-4">
                  <Input
                    placeholder="Search items..."
                    value={itemSearch}
                    onChange={(e) => setItemSearch(e.target.value)}
                    className="w-64"
                  />
                  <Select value={itemStatusFilter} onValueChange={(v) => setItemStatusFilter(v as typeof itemStatusFilter)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="counted">Counted</SelectItem>
                      <SelectItem value="variance">Variance</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="skipped">Skipped</SelectItem>
                      <SelectItem value="recount">Recount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">System Qty</TableHead>
                    <TableHead className="text-right">Counted Qty</TableHead>
                    <TableHead className="text-right">Final Qty</TableHead>
                    <TableHead className="text-right">Variance</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{item.itemName}</p>
                          <p className="text-xs text-muted-foreground">{item.itemCode}</p>
                        </div>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{item.location}</p>
                          {item.binLocation && (
                            <p className="text-xs text-muted-foreground">Bin: {item.binLocation}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {item.systemQuantity} {item.unit}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.countedQuantity !== null
                          ? `${item.countedQuantity} ${item.unit}`
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        {item.finalQuantity !== null
                          ? `${item.finalQuantity} ${item.unit}`
                          : '-'
                        }
                      </TableCell>
                      <TableCell className="text-right">
                        {item.countedQuantity !== null ? (
                          <span className={Math.abs(item.variance) > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                            {item.variance > 0 ? '+' : ''}{item.variance} ({item.variancePercent.toFixed(1)}%)
                          </span>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {item.varianceReason ? (
                          <Badge className={varianceReasonConfig[item.varianceReason].color}>
                            {varianceReasonConfig[item.varianceReason].label}
                          </Badge>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={itemStatusConfig[item.status].color}>
                          {itemStatusConfig[item.status].label}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredItems.length === 0 && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No items match your search</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Variance Tab */}
        <TabsContent value="variance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Variance Items</CardTitle>
              <CardDescription>
                Items with discrepancies between system and counted quantities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {varianceItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">System Qty</TableHead>
                      <TableHead className="text-right">Counted Qty</TableHead>
                      <TableHead className="text-right">Variance</TableHead>
                      <TableHead className="text-right">Value Impact</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Counted By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {varianceItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.itemName}</p>
                            <p className="text-xs text-muted-foreground">{item.itemCode}</p>
                          </div>
                        </TableCell>
                        <TableCell>{item.category}</TableCell>
                        <TableCell className="text-right">
                          {item.systemQuantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.countedQuantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-red-600 font-medium">
                            {item.variance > 0 ? '+' : ''}{item.variance} ({item.variancePercent.toFixed(1)}%)
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={item.varianceValue < 0 ? 'text-red-600' : 'text-amber-600'}>
                            {item.varianceValue < 0 ? '-' : ''}${Math.abs(item.varianceValue).toFixed(2)}
                          </span>
                        </TableCell>
                        <TableCell>
                          {item.varianceReason ? (
                            <Badge className={varianceReasonConfig[item.varianceReason].color}>
                              {varianceReasonConfig[item.varianceReason].label}
                            </Badge>
                          ) : (
                            <Badge className="bg-gray-100 text-gray-700">Pending</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={itemStatusConfig[item.status].color}>
                            {itemStatusConfig[item.status].label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{item.countedBy || '-'}</p>
                          {item.countedAt && (
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(item.countedAt), "MMM d, p")}
                            </p>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                  <p className="text-lg font-medium">No Variances Found</p>
                  <p className="text-muted-foreground">All counted items match the system quantities</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recount Items */}
          {recountItems.length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5 text-purple-500" />
                  Items Requiring Recount
                </CardTitle>
                <CardDescription>
                  These items need to be recounted due to significant variance or verification requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item</TableHead>
                      <TableHead className="text-right">System Qty</TableHead>
                      <TableHead className="text-right">First Count</TableHead>
                      <TableHead className="text-right">Recount</TableHead>
                      <TableHead>First Counter</TableHead>
                      <TableHead>Recount By</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recountItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{item.itemName}</p>
                            <p className="text-xs text-muted-foreground">{item.itemCode}</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {item.systemQuantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.countedQuantity} {item.unit}
                        </TableCell>
                        <TableCell className="text-right">
                          {item.recountQuantity !== null
                            ? `${item.recountQuantity} ${item.unit}`
                            : <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                          }
                        </TableCell>
                        <TableCell>{item.countedBy || '-'}</TableCell>
                        <TableCell>{item.recountedBy || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="mt-4">
          <div className="grid grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Supervisor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>{physicalCount.supervisorName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{physicalCount.supervisorName}</p>
                    <p className="text-sm text-muted-foreground">Count Supervisor</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Count Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Team Members</span>
                  <span className="font-medium">{physicalCount.counters.length + 1}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Primary Counters</span>
                  <span className="font-medium">
                    {physicalCount.counters.filter(c => c.role === 'primary').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Secondary Counters</span>
                  <span className="font-medium">
                    {physicalCount.counters.filter(c => c.role === 'secondary').length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Verifiers</span>
                  <span className="font-medium">
                    {physicalCount.counters.filter(c => c.role === 'verifier').length}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Count Team Members</CardTitle>
                <CardDescription>
                  Team members assigned to perform the physical count
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Role</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {physicalCount.counters.map((counter) => (
                      <TableRow key={counter.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs">
                                {counter.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{counter.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={
                            counter.role === 'primary' ? 'bg-blue-100 text-blue-700' :
                            counter.role === 'secondary' ? 'bg-gray-100 text-gray-700' :
                            'bg-purple-100 text-purple-700'
                          }>
                            {counter.role.charAt(0).toUpperCase() + counter.role.slice(1)} Counter
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity History</CardTitle>
              <CardDescription>
                Timeline of all actions taken on this physical count
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 border-l-2 border-muted space-y-6">
                <div className="relative">
                  <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-green-500" />
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">Physical Count Created</p>
                      <p className="text-sm text-muted-foreground">
                        Created by {physicalCount.createdBy}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(physicalCount.createdAt), "PPP p")}
                    </p>
                  </div>
                </div>

                {physicalCount.startedAt && (
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-blue-500" />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Counting Started</p>
                        <p className="text-sm text-muted-foreground">
                          Started by {physicalCount.supervisorName}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(physicalCount.startedAt), "PPP p")}
                      </p>
                    </div>
                  </div>
                )}

                {physicalCount.countedItems > 0 && !physicalCount.completedAt && (
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-amber-500" />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Items Counted</p>
                        <p className="text-sm text-muted-foreground">
                          {physicalCount.countedItems} of {physicalCount.totalItems} items counted
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(physicalCount.updatedAt), "PPP p")}
                      </p>
                    </div>
                  </div>
                )}

                {physicalCount.completedAt && (
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-green-500" />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Physical Count Completed</p>
                        <p className="text-sm text-muted-foreground">
                          Completed by {physicalCount.supervisorName} • Accuracy: {physicalCount.accuracy.toFixed(1)}%
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(physicalCount.completedAt), "PPP p")}
                      </p>
                    </div>
                  </div>
                )}

                {physicalCount.finalizedAt && (
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-emerald-500" />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Count Finalized & Adjustments Posted</p>
                        <p className="text-sm text-muted-foreground">
                          Finalized by {physicalCount.finalizedBy} • Variance: ${Math.abs(physicalCount.varianceValue).toLocaleString()}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(physicalCount.finalizedAt), "PPP p")}
                      </p>
                    </div>
                  </div>
                )}

                {physicalCount.status === 'cancelled' && (
                  <div className="relative">
                    <div className="absolute -left-[25px] w-4 h-4 rounded-full bg-red-500" />
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">Physical Count Cancelled</p>
                        <p className="text-sm text-muted-foreground">
                          {physicalCount.notes}
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(physicalCount.updatedAt), "PPP p")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Cancel Dialog */}
      <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Physical Count</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this physical count? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              placeholder="Please provide a reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelDialog(false)}>
              Keep Count
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelCount}
              disabled={!cancelReason.trim()}
            >
              Cancel Count
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Finalize Dialog */}
      <Dialog open={showFinalizeDialog} onOpenChange={setShowFinalizeDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Finalize Physical Count</DialogTitle>
            <DialogDescription>
              This will finalize the count and post inventory adjustments. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div>
                  <p className="font-medium text-amber-900">Review Before Finalizing</p>
                  <p className="text-sm text-amber-700 mt-1">
                    Once finalized, inventory adjustments totaling{' '}
                    <span className="font-semibold">
                      {physicalCount.varianceValue < 0 ? '-' : ''}${Math.abs(physicalCount.varianceValue).toLocaleString()}
                    </span>
                    {' '}will be posted to the system.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Items with Variance</span>
                <span className="font-medium">{physicalCount.varianceItems}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Total Variance Value</span>
                <span className={`font-medium ${physicalCount.varianceValue < 0 ? 'text-red-600' : 'text-amber-600'}`}>
                  {physicalCount.varianceValue < 0 ? '-' : ''}${Math.abs(physicalCount.varianceValue).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span>Variance Percentage</span>
                <span className="font-medium">{physicalCount.variancePercent.toFixed(2)}%</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFinalizeDialog(false)}>
              Review Again
            </Button>
            <Button onClick={handleFinalizeCount}>
              <ShieldCheck className="h-4 w-4 mr-2" />
              Finalize & Post Adjustments
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
