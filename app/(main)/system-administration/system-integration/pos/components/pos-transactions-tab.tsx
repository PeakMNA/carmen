"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Search,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  RefreshCw,
  Eye,
  FileText,
  Filter,
  Calendar,
  Download,
  CheckSquare,
  X,
  RotateCcw,
  Package,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import type {
  POSTransaction,
  PendingTransaction,
  POSTransactionLineItem,
  TransactionError,
  InventoryImpactPreview
} from "@/lib/types/pos-integration"
import { formatNumber } from "@/lib/utils/formatters"

interface POSTransactionsTabProps {
  transactions: POSTransaction[]
  pendingTransactions: PendingTransaction[]
  transactionLineItems: Record<string, POSTransactionLineItem[]>
  transactionErrors: Record<string, TransactionError>
  inventoryImpactPreview: InventoryImpactPreview
  onApproveTransaction: (id: string, notes?: string) => void
  onRejectTransaction: (id: string, reason: string) => void
  onRetryTransaction: (id: string) => void
  onBulkApprove: (ids: string[]) => void
}

type TransactionFilter = 'all' | 'pending' | 'success' | 'failed' | 'processing'

export function POSTransactionsTab({
  transactions,
  pendingTransactions,
  transactionLineItems,
  transactionErrors,
  inventoryImpactPreview,
  onApproveTransaction,
  onRejectTransaction,
  onRetryTransaction,
  onBulkApprove
}: POSTransactionsTabProps) {
  const [filter, setFilter] = useState<TransactionFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('7d')
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([])
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [showApprovalDialog, setShowApprovalDialog] = useState(false)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<POSTransaction | null>(null)
  const [approvalNotes, setApprovalNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  // Statistics
  const stats = useMemo(() => ({
    total: transactions.length,
    pending: transactions.filter(t => t.status === 'pending_approval').length,
    success: transactions.filter(t => t.status === 'success').length,
    failed: transactions.filter(t => t.status === 'failed').length,
    processing: transactions.filter(t => t.status === 'processing').length
  }), [transactions])

  // Get unique locations
  const locations = useMemo(() => {
    const locs = new Set(transactions.map(t => t.location.name))
    return Array.from(locs).sort()
  }, [transactions])

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      const matchesFilter = filter === 'all' ||
        (filter === 'pending' && txn.status === 'pending_approval') ||
        txn.status === filter
      const matchesSearch = searchQuery === '' ||
        txn.transactionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        txn.externalId.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesLocation = selectedLocation === 'all' || txn.location.name === selectedLocation
      return matchesFilter && matchesSearch && matchesLocation
    })
  }, [transactions, filter, searchQuery, selectedLocation])

  const toggleRowExpansion = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const toggleSelectAll = () => {
    if (selectedTransactions.length === filteredTransactions.filter(t => t.status === 'pending_approval').length) {
      setSelectedTransactions([])
    } else {
      setSelectedTransactions(filteredTransactions.filter(t => t.status === 'pending_approval').map(t => t.id))
    }
  }

  const toggleSelectTransaction = (id: string) => {
    if (selectedTransactions.includes(id)) {
      setSelectedTransactions(selectedTransactions.filter(tid => tid !== id))
    } else {
      setSelectedTransactions([...selectedTransactions, id])
    }
  }

  const handleApprove = () => {
    if (selectedTransaction) {
      onApproveTransaction(selectedTransaction.id, approvalNotes)
      setShowApprovalDialog(false)
      setSelectedTransaction(null)
      setApprovalNotes('')
    }
  }

  const handleReject = () => {
    if (selectedTransaction && rejectionReason) {
      onRejectTransaction(selectedTransaction.id, rejectionReason)
      setShowRejectDialog(false)
      setSelectedTransaction(null)
      setRejectionReason('')
    }
  }

  const getStatusBadge = (status: POSTransaction['status']) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle2 className="h-3 w-3 mr-1" />Success</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>
      case 'pending_approval':
        return <Badge className="bg-amber-100 text-amber-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>
      case 'processing':
        return <Badge className="bg-blue-100 text-blue-800"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Processing</Badge>
      case 'manually_resolved':
        return <Badge className="bg-purple-100 text-purple-800"><CheckCircle2 className="h-3 w-3 mr-1" />Resolved</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card
          className={`cursor-pointer transition-colors ${filter === 'all' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('all')}
        >
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${filter === 'pending' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('pending')}
        >
          <CardHeader className="pb-2">
            <CardDescription>Pending Approval</CardDescription>
            <CardTitle className="text-2xl text-amber-600">{stats.pending}</CardTitle>
          </CardHeader>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${filter === 'success' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('success')}
        >
          <CardHeader className="pb-2">
            <CardDescription>Successful</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.success}</CardTitle>
          </CardHeader>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${filter === 'failed' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('failed')}
        >
          <CardHeader className="pb-2">
            <CardDescription>Failed</CardDescription>
            <CardTitle className="text-2xl text-red-600">{stats.failed}</CardTitle>
          </CardHeader>
        </Card>
        <Card
          className={`cursor-pointer transition-colors ${filter === 'processing' ? 'ring-2 ring-primary' : ''}`}
          onClick={() => setFilter('processing')}
        >
          <CardHeader className="pb-2">
            <CardDescription>Processing</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats.processing}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Pending Approval Queue */}
      {pendingTransactions.length > 0 && filter !== 'success' && filter !== 'failed' && (
        <Card className="border-amber-200">
          <CardHeader className="bg-amber-50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-amber-600" />
                  Approval Queue ({pendingTransactions.length})
                </CardTitle>
                <CardDescription>Transactions requiring manager approval</CardDescription>
              </div>
              {selectedTransactions.length > 0 && (
                <Button onClick={() => onBulkApprove(selectedTransactions)}>
                  <CheckSquare className="h-4 w-4 mr-2" />
                  Approve Selected ({selectedTransactions.length})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedTransactions.length === pendingTransactions.length}
                      onCheckedChange={toggleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Impact</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingTransactions.map(txn => (
                  <TableRow key={txn.id}>
                    <TableCell>
                      <Checkbox
                        checked={selectedTransactions.includes(txn.id)}
                        onCheckedChange={() => toggleSelectTransaction(txn.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{txn.transactionId}</p>
                        <p className="text-xs text-muted-foreground">{txn.externalId}</p>
                      </div>
                    </TableCell>
                    <TableCell>{txn.location.name}</TableCell>
                    <TableCell className="font-medium">${formatNumber(txn.totalAmount.amount)}</TableCell>
                    <TableCell>{txn.itemCount}</TableCell>
                    <TableCell>
                      <Badge className={
                        txn.inventoryImpact === 'high' ? 'bg-red-100 text-red-800' :
                        txn.inventoryImpact === 'medium' ? 'bg-amber-100 text-amber-800' :
                        'bg-green-100 text-green-800'
                      }>
                        {txn.inventoryImpact}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(new Date(txn.date), { addSuffix: true })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => {
                            setSelectedTransaction(txn)
                            setShowApprovalDialog(true)
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedTransaction(txn)
                            setShowRejectDialog(true)
                          }}
                        >
                          <XCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTransaction(txn)
                            setShowDetailDialog(true)
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by transaction ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="All Locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Locations</SelectItem>
            {locations.map(loc => (
              <SelectItem key={loc} value={loc}>{loc}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-[150px]">
            <Calendar className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1d">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>
            Showing {filteredTransactions.length} of {transactions.length} transactions
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8"></TableHead>
                <TableHead>Transaction</TableHead>
                <TableHead>Date/Time</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.map(txn => (
                <>
                  <TableRow key={txn.id} className="cursor-pointer" onClick={() => toggleRowExpansion(txn.id)}>
                    <TableCell>
                      {expandedRows.has(txn.id) ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{txn.transactionId}</p>
                        <p className="text-xs text-muted-foreground">{txn.externalId}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p>{format(new Date(txn.date), 'MMM d, yyyy')}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(txn.date), 'HH:mm:ss')}</p>
                      </div>
                    </TableCell>
                    <TableCell>{txn.location.name}</TableCell>
                    <TableCell>{txn.itemCount}</TableCell>
                    <TableCell className="font-medium">${formatNumber(txn.totalAmount.amount)}</TableCell>
                    <TableCell>{getStatusBadge(txn.status)}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => {
                            setSelectedTransaction(txn)
                            setShowDetailDialog(true)
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            View Audit Log
                          </DropdownMenuItem>
                          {txn.status === 'pending_approval' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => {
                                setSelectedTransaction(txn)
                                setShowApprovalDialog(true)
                              }}>
                                <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                                Approve
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => {
                                setSelectedTransaction(txn)
                                setShowRejectDialog(true)
                              }}>
                                <XCircle className="h-4 w-4 mr-2 text-red-600" />
                                Reject
                              </DropdownMenuItem>
                            </>
                          )}
                          {txn.status === 'failed' && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => onRetryTransaction(txn.id)}>
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Retry
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                  {expandedRows.has(txn.id) && transactionLineItems[txn.id] && (
                    <TableRow>
                      <TableCell colSpan={8} className="bg-muted/50 p-4">
                        <div className="space-y-2">
                          <p className="text-sm font-medium">Line Items</p>
                          <div className="grid gap-2">
                            {transactionLineItems[txn.id].map(item => (
                              <div key={item.id} className="flex items-center justify-between p-2 bg-background rounded border">
                                <div className="flex items-center gap-4">
                                  <Package className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="font-medium">{item.posItemName}</p>
                                    <p className="text-xs text-muted-foreground">
                                      {item.mappedRecipe ? (
                                        <span className="text-green-600">→ {item.mappedRecipe.name}</span>
                                      ) : (
                                        <span className="text-amber-600">Unmapped</span>
                                      )}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-6 text-sm">
                                  <span>Qty: {item.quantity}</span>
                                  <span>@ ${formatNumber(item.unitPrice.amount)}</span>
                                  <span className="font-medium">${formatNumber(item.totalPrice.amount)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                          {txn.status === 'failed' && transactionErrors[txn.id] && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
                              <p className="text-sm font-medium text-red-800">Error: {transactionErrors[txn.id].message}</p>
                              <p className="text-xs text-red-600">{transactionErrors[txn.id].category}</p>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Transaction Detail Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Transaction Details</DialogTitle>
            <DialogDescription>
              {selectedTransaction?.transactionId} • {selectedTransaction?.externalId}
            </DialogDescription>
          </DialogHeader>
          {selectedTransaction && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Status</Label>
                  <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">Location</Label>
                  <p className="mt-1 font-medium">{selectedTransaction.location.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Date/Time</Label>
                  <p className="mt-1">{format(new Date(selectedTransaction.date), 'PPpp')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Total Amount</Label>
                  <p className="mt-1 text-lg font-bold">${formatNumber(selectedTransaction.totalAmount.amount)}</p>
                </div>
              </div>

              {selectedTransaction.notes && (
                <div>
                  <Label className="text-muted-foreground">Notes</Label>
                  <p className="mt-1 p-3 bg-muted rounded">{selectedTransaction.notes}</p>
                </div>
              )}

              {transactionLineItems[selectedTransaction.id] && (
                <div>
                  <Label className="text-muted-foreground">Items ({selectedTransaction.itemCount})</Label>
                  <div className="mt-2 border rounded divide-y">
                    {transactionLineItems[selectedTransaction.id].map(item => (
                      <div key={item.id} className="p-3 flex justify-between items-center">
                        <div>
                          <p className="font-medium">{item.posItemName}</p>
                          <p className="text-sm text-muted-foreground">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p>{item.quantity} × ${formatNumber(item.unitPrice.amount)}</p>
                          <p className="font-medium">${formatNumber(item.totalPrice.amount)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailDialog(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={showApprovalDialog} onOpenChange={setShowApprovalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Transaction</DialogTitle>
            <DialogDescription>
              Approve {selectedTransaction?.transactionId} for ${selectedTransaction ? formatNumber(selectedTransaction.totalAmount.amount) : 0}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 bg-amber-50 border border-amber-200 rounded">
              <h4 className="font-medium text-amber-800 mb-2">Inventory Impact</h4>
              <div className="space-y-1 text-sm">
                {inventoryImpactPreview.warnings.map((warning, idx) => (
                  <p key={idx} className={warning.severity === 'critical' ? 'text-red-600' : 'text-amber-600'}>
                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                    {warning.message}
                  </p>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Approval Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes about this approval..."
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowApprovalDialog(false)}>Cancel</Button>
            <Button onClick={handleApprove} className="bg-green-600 hover:bg-green-700">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Approve & Process
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Rejection Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Transaction</DialogTitle>
            <DialogDescription>
              Reject {selectedTransaction?.transactionId}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Rejection Reason *</Label>
              <Textarea
                placeholder="Please provide a reason for rejection..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button onClick={handleReject} variant="destructive" disabled={!rejectionReason}>
              <XCircle className="h-4 w-4 mr-2" />
              Reject Transaction
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
