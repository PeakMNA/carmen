"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { Label } from "@/components/ui/label"
import {
  Search,
  MoreHorizontal,
  CheckCircle2,
  XCircle,
  Clock,
  RefreshCw,
  Eye,
  FileText,
  Filter,
  Calendar,
  Download,
  RotateCcw,
  Package,
  ChevronDown,
  ChevronRight
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import type {
  POSTransaction,
  POSTransactionLineItem,
  TransactionError,
} from "@/lib/types/pos-integration"
import { formatNumber } from "@/lib/utils/formatters"

interface POSTransactionsTabProps {
  transactions: POSTransaction[]
  transactionLineItems: Record<string, POSTransactionLineItem[]>
  transactionErrors: Record<string, TransactionError>
  onRetryTransaction: (id: string) => void
}

type TransactionFilter = 'all' | 'pending' | 'success' | 'failed' | 'processing'

export function POSTransactionsTab({
  transactions,
  transactionLineItems,
  transactionErrors,
  onRetryTransaction,
}: POSTransactionsTabProps) {
  const [filter, setFilter] = useState<TransactionFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [dateRange, setDateRange] = useState<string>('7d')
  const [showDetailDialog, setShowDetailDialog] = useState(false)
  const [selectedTransaction, setSelectedTransaction] = useState<POSTransaction | null>(null)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const stats = useMemo(() => ({
    total: transactions.length,
    pending: transactions.filter(t => t.status === 'pending_approval').length,
    success: transactions.filter(t => t.status === 'success').length,
    failed: transactions.filter(t => t.status === 'failed').length,
    processing: transactions.filter(t => t.status === 'processing').length
  }), [transactions])

  const locations = useMemo(() => {
    const locs = new Set(transactions.map(t => t.location.name))
    return Array.from(locs).sort()
  }, [transactions])

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
        {([
          { key: 'all', label: 'Total', value: stats.total, color: '' },
          { key: 'pending', label: 'Pending', value: stats.pending, color: 'text-amber-600' },
          { key: 'success', label: 'Successful', value: stats.success, color: 'text-green-600' },
          { key: 'failed', label: 'Failed', value: stats.failed, color: 'text-red-600' },
          { key: 'processing', label: 'Processing', value: stats.processing, color: 'text-blue-600' },
        ] as const).map(({ key, label, value, color }) => (
          <Card
            key={key}
            className={`cursor-pointer transition-colors ${filter === key ? 'ring-2 ring-primary' : ''}`}
            onClick={() => setFilter(key)}
          >
            <CardHeader className="pb-2">
              <CardDescription>{label}</CardDescription>
              <CardTitle className={`text-2xl ${color}`}>{value}</CardTitle>
            </CardHeader>
          </Card>
        ))}
      </div>

      {/* Filters */}
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

      {/* Transaction Detail Dialog (read-only) */}
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
    </div>
  )
}
