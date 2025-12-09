"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { format, subDays } from "date-fns"
import {
  ClipboardList,
  Plus,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Package,
  RefreshCw,
  Calendar,
  BarChart3,
  AlertCircle,
  FileText,
  Play,
  ChevronRight,
  Download,
  Users,
  Boxes,
  ArrowRight,
  CircleDot,
  RotateCcw,
  CalendarDays,
  Layers,
  DollarSign,
  Percent,
  UserCheck,
  PauseCircle
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  mockPhysicalCounts,
  getPhysicalCountDashboardStats,
  getActivePhysicalCounts,
  getOverduePhysicalCounts,
  getPendingApprovalCounts
} from "@/lib/mock-data/physical-counts"
import type { PhysicalCount, PhysicalCountStatus, PhysicalCountType } from "../types"

// Configuration
const statusConfig: Record<PhysicalCountStatus, { label: string; color: string; icon: React.ReactNode }> = {
  'draft': { label: 'Draft', color: 'bg-gray-100 text-gray-700', icon: <FileText className="h-4 w-4" /> },
  'planning': { label: 'Planning', color: 'bg-purple-100 text-purple-700', icon: <Layers className="h-4 w-4" /> },
  'pending': { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: <Clock className="h-4 w-4" /> },
  'in-progress': { label: 'In Progress', color: 'bg-blue-100 text-blue-700', icon: <RefreshCw className="h-4 w-4" /> },
  'completed': { label: 'Completed', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="h-4 w-4" /> },
  'finalized': { label: 'Finalized', color: 'bg-emerald-100 text-emerald-700', icon: <CheckCircle2 className="h-4 w-4" /> },
  'cancelled': { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: <AlertCircle className="h-4 w-4" /> },
  'on-hold': { label: 'On Hold', color: 'bg-orange-100 text-orange-700', icon: <PauseCircle className="h-4 w-4" /> }
}

const typeConfig: Record<PhysicalCountType, { label: string; color: string; icon: React.ReactNode }> = {
  'full': { label: 'Full Count', color: 'bg-purple-100 text-purple-700', icon: <Package className="h-4 w-4" /> },
  'cycle': { label: 'Cycle Count', color: 'bg-blue-100 text-blue-700', icon: <RefreshCw className="h-4 w-4" /> },
  'annual': { label: 'Annual Count', color: 'bg-amber-100 text-amber-700', icon: <CalendarDays className="h-4 w-4" /> },
  'perpetual': { label: 'Perpetual', color: 'bg-green-100 text-green-700', icon: <RotateCcw className="h-4 w-4" /> },
  'partial': { label: 'Partial Count', color: 'bg-cyan-100 text-cyan-700', icon: <CircleDot className="h-4 w-4" /> }
}

const priorityConfig: Record<string, { label: string; color: string }> = {
  'low': { label: 'Low', color: 'bg-gray-100 text-gray-700' },
  'medium': { label: 'Medium', color: 'bg-blue-100 text-blue-700' },
  'high': { label: 'High', color: 'bg-orange-100 text-orange-700' },
  'critical': { label: 'Critical', color: 'bg-red-100 text-red-700' }
}

export default function PhysicalCountDashboardPage() {
  const router = useRouter()
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "365d">("30d")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  // Dashboard stats
  const stats = useMemo(() => getPhysicalCountDashboardStats(), [])
  const activeCounts = useMemo(() => getActivePhysicalCounts(), [])
  const overdueCounts = useMemo(() => getOverduePhysicalCounts(), [])
  const pendingApproval = useMemo(() => getPendingApprovalCounts(), [])

  // Recent finalized counts
  const recentFinalized = useMemo(() => {
    const days = dateRange === "7d" ? 7 : dateRange === "30d" ? 30 : dateRange === "90d" ? 90 : 365
    const startDate = subDays(new Date(), days)

    return mockPhysicalCounts
      .filter(count =>
        count.status === 'finalized' &&
        count.finalizedAt &&
        new Date(count.finalizedAt) >= startDate
      )
      .sort((a, b) =>
        new Date(b.finalizedAt!).getTime() - new Date(a.finalizedAt!).getTime()
      )
      .slice(0, 10)
  }, [dateRange])

  // Stats by location
  const locationStats = useMemo(() => {
    const locationMap = new Map<string, { total: number; finalized: number; variance: number; accuracy: number }>()

    mockPhysicalCounts.forEach(count => {
      const current = locationMap.get(count.locationName) || { total: 0, finalized: 0, variance: 0, accuracy: 0 }
      current.total++
      if (count.status === 'finalized') {
        current.finalized++
        current.variance += count.varianceValue
        current.accuracy += count.accuracy
      }
      locationMap.set(count.locationName, current)
    })

    return Array.from(locationMap.entries())
      .map(([location, data]) => ({
        location,
        ...data,
        avgAccuracy: data.finalized > 0 ? data.accuracy / data.finalized : 0,
        completionRate: data.total > 0 ? (data.finalized / data.total) * 100 : 0
      }))
      .sort((a, b) => b.total - a.total)
  }, [])

  // Stats by type
  const typeStats = useMemo(() => {
    const typeMap = new Map<PhysicalCountType, { count: number; finalized: number; accuracy: number }>()

    const types: PhysicalCountType[] = ['full', 'cycle', 'annual', 'perpetual', 'partial']
    types.forEach(type => typeMap.set(type, { count: 0, finalized: 0, accuracy: 0 }))

    mockPhysicalCounts.forEach(count => {
      const current = typeMap.get(count.countType)!
      current.count++
      if (count.status === 'finalized') {
        current.finalized++
        current.accuracy += count.accuracy
      }
    })

    return Array.from(typeMap.entries()).map(([type, data]) => ({
      type,
      ...typeConfig[type],
      ...data,
      avgAccuracy: data.finalized > 0 ? (data.accuracy / data.finalized).toFixed(1) : '-'
    }))
  }, [])

  // Upcoming counts
  const upcomingCounts = useMemo(() => {
    return mockPhysicalCounts
      .filter(count =>
        (count.status === 'pending' || count.status === 'planning' || count.status === 'draft') &&
        new Date(count.scheduledDate) >= new Date()
      )
      .sort((a, b) =>
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      )
      .slice(0, 5)
  }, [])

  // Handlers
  const handleViewCount = (id: string) => {
    router.push(`/inventory-management/physical-count-management/${id}`)
  }

  const handleStartCount = (id: string) => {
    router.push(`/inventory-management/physical-count-management/${id}/count`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Physical Count Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of inventory counting activities and performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as typeof dateRange)}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="365d">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link href="/inventory-management/physical-count-management/new">
              <Plus className="h-4 w-4 mr-2" />
              New Count
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Counts</p>
                <p className="text-3xl font-bold">{stats.totalCounts}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.activeCounts} active
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <ClipboardList className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Accuracy</p>
                <p className="text-3xl font-bold">{stats.averageAccuracy.toFixed(1)}%</p>
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Target: 98%
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <Target className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Items Counted</p>
                <p className="text-3xl font-bold">{stats.itemsCounted.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.varianceItemsCount} with variance
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
                <p className="text-3xl font-bold">{stats.pendingApproval}</p>
                <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Needs review
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center">
                <UserCheck className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Variance</p>
                <p className="text-3xl font-bold text-red-600">
                  ${Math.abs(stats.totalVarianceValue).toLocaleString()}
                </p>
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3" />
                  Requires attention
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Active & Overdue */}
        <div className="col-span-2 space-y-6">
          {/* Overdue Alert */}
          {overdueCounts.length > 0 && (
            <Card className="border-red-200 bg-red-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <CardTitle className="text-red-900">Overdue Counts</CardTitle>
                  </div>
                  <Badge variant="destructive">{overdueCounts.length} overdue</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {overdueCounts.slice(0, 3).map((count) => (
                    <div
                      key={count.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-red-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                          <Clock className="h-5 w-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium">{count.countNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {count.locationName} • Due {count.dueDate && format(new Date(count.dueDate), "MMM d")}
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="destructive" onClick={() => handleStartCount(count.id)}>
                        Start Now
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Pending Approval */}
          {pendingApproval.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5 text-amber-600" />
                    <CardTitle className="text-amber-900">Pending Approval</CardTitle>
                  </div>
                  <Badge className="bg-amber-100 text-amber-700">{pendingApproval.length} awaiting</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {pendingApproval.slice(0, 3).map((count) => (
                    <div
                      key={count.id}
                      className="flex items-center justify-between p-3 bg-white rounded-lg border border-amber-100"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-medium">{count.countNumber}</p>
                          <p className="text-sm text-muted-foreground">
                            {count.locationName} • {count.varianceItems} variance items
                          </p>
                        </div>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => handleViewCount(count.id)}>
                        Review
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Counts */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Active Physical Counts</CardTitle>
                  <CardDescription>Currently in-progress or pending counts</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/inventory-management/physical-count-management?status=in-progress">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {activeCounts.length > 0 ? (
                <ScrollArea className="h-[320px] pr-4">
                  <div className="space-y-4">
                    {activeCounts.map((count) => {
                      const progress = count.totalItems > 0
                        ? (count.countedItems / count.totalItems) * 100
                        : 0

                      return (
                        <div
                          key={count.id}
                          className="p-4 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleViewCount(count.id)}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{count.countNumber}</h4>
                                <Badge className={statusConfig[count.status].color}>
                                  {statusConfig[count.status].label}
                                </Badge>
                                <Badge className={typeConfig[count.countType].color}>
                                  {typeConfig[count.countType].label}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">
                                {count.locationName} • {count.supervisorName}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              variant={count.status === 'in-progress' ? 'default' : 'outline'}
                              onClick={(e) => {
                                e.stopPropagation()
                                handleStartCount(count.id)
                              }}
                            >
                              {count.status === 'in-progress' ? (
                                <>
                                  <Play className="h-4 w-4 mr-1" />
                                  Continue
                                </>
                              ) : (
                                <>
                                  <Play className="h-4 w-4 mr-1" />
                                  Start
                                </>
                              )}
                            </Button>
                          </div>

                          {count.status === 'in-progress' && (
                            <div>
                              <div className="flex items-center justify-between text-sm mb-1">
                                <span className="text-muted-foreground">Progress</span>
                                <span>{count.countedItems} / {count.totalItems} items ({progress.toFixed(0)}%)</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                              <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-green-500" />
                                  {count.approvedItems} approved
                                </span>
                                <span className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-red-500" />
                                  {count.varianceItems} variance
                                </span>
                                <span className="flex items-center gap-1">
                                  <div className="w-2 h-2 rounded-full bg-amber-500" />
                                  {count.recountItems} recount
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CheckCircle2 className="h-12 w-12 text-green-500 mb-4" />
                  <p className="font-medium">No Active Counts</p>
                  <p className="text-sm text-muted-foreground">
                    All physical counts are up to date
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Finalized */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Recently Finalized</CardTitle>
                  <CardDescription>Physical counts finalized in the selected period</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/inventory-management/physical-count-management?status=finalized">
                    View All
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {recentFinalized.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Count</TableHead>
                      <TableHead>Location</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Variance</TableHead>
                      <TableHead>Finalized</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentFinalized.map((count) => (
                      <TableRow
                        key={count.id}
                        className="cursor-pointer"
                        onClick={() => handleViewCount(count.id)}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium">{count.countNumber}</p>
                            <Badge className={typeConfig[count.countType].color} variant="outline">
                              {typeConfig[count.countType].label}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>{count.locationName}</TableCell>
                        <TableCell>{count.totalItems}</TableCell>
                        <TableCell>
                          <span className={count.accuracy >= 95 ? 'text-green-600' : count.accuracy >= 90 ? 'text-amber-600' : 'text-red-600'}>
                            {count.accuracy.toFixed(1)}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className={count.varianceValue !== 0 ? 'text-red-600' : 'text-green-600'}>
                            ${Math.abs(count.varianceValue).toLocaleString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {count.finalizedAt && format(new Date(count.finalizedAt), "MMM d, yyyy")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="font-medium">No Finalized Counts</p>
                  <p className="text-sm text-muted-foreground">
                    No physical counts finalized in this period
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats & Quick Actions */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/inventory-management/physical-count-management/new?type=full">
                  <Package className="h-4 w-4 mr-2" />
                  Create Full Count
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/inventory-management/physical-count-management/new?type=cycle">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Create Cycle Count
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/inventory-management/physical-count-management/new?type=annual">
                  <CalendarDays className="h-4 w-4 mr-2" />
                  Schedule Annual Count
                </Link>
              </Button>
              <Button className="w-full justify-start" variant="outline" asChild>
                <Link href="/inventory-management/physical-count-management">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  View All Counts
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Upcoming Counts */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Counts</CardTitle>
              <CardDescription>Scheduled for the next 30 days</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingCounts.length > 0 ? (
                <div className="space-y-3">
                  {upcomingCounts.map((count) => (
                    <div
                      key={count.id}
                      className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => handleViewCount(count.id)}
                    >
                      <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{count.countNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(count.scheduledDate), "MMM d, yyyy")}
                        </p>
                      </div>
                      <Badge className={priorityConfig[count.priority].color}>
                        {priorityConfig[count.priority].label}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Calendar className="h-10 w-10 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No upcoming counts</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* By Count Type */}
          <Card>
            <CardHeader>
              <CardTitle>By Count Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {typeStats.map((stat) => (
                  <div key={stat.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={stat.color} variant="outline">
                        {stat.label}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <span className="font-medium">{stat.count}</span>
                      <span className="text-sm text-muted-foreground ml-1">
                        ({stat.avgAccuracy}% avg)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* By Location */}
          <Card>
            <CardHeader>
              <CardTitle>By Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {locationStats.slice(0, 5).map((stat) => (
                  <div key={stat.location}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium truncate">{stat.location}</span>
                      <span className="text-sm text-muted-foreground">
                        {stat.finalized}/{stat.total}
                      </span>
                    </div>
                    <Progress value={stat.completionRate} className="h-2" />
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">
                        {stat.avgAccuracy.toFixed(1)}% avg accuracy
                      </span>
                      {stat.variance !== 0 && (
                        <span className="text-xs text-red-600">
                          ${Math.abs(stat.variance).toFixed(0)} variance
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Team Performance */}
          <Card>
            <CardHeader>
              <CardTitle>Completion This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completed</span>
                  <span className="font-medium">{stats.completedThisMonth}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Overdue</span>
                  <span className="font-medium text-red-600">{stats.overdueCounts}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <span className="font-medium text-green-600">
                    {stats.completedThisMonth > 0
                      ? ((stats.completedThisMonth / (stats.completedThisMonth + stats.overdueCounts)) * 100).toFixed(0)
                      : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
