'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { AlertTriangle, CheckCircle2, Search } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { SalesConsumption, SCStatus } from '@/lib/types/sales-consumption'
import { formatCurrency } from '@/lib/utils/formatters'
import { SCStatusBadge } from './sc-status-badge'

interface SCListProps {
  scs: SalesConsumption[]
}

const ALL_STATUSES = 'all' as const

const STATUS_OPTIONS: { value: SCStatus | typeof ALL_STATUSES; label: string }[] = [
  { value: ALL_STATUSES, label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'posted', label: 'Posted' },
  { value: 'posted_with_exceptions', label: 'Posted with Exceptions' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'voided', label: 'Voided' },
]

export function SCList({ scs }: SCListProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<SCStatus | typeof ALL_STATUSES>(ALL_STATUSES)

  const filtered = useMemo(() => {
    const q = search.toLowerCase()
    return scs.filter((sc) => {
      const matchesSearch =
        sc.docNumber.toLowerCase().includes(q) ||
        sc.businessDate.includes(q) ||
        sc.shiftId.toLowerCase().includes(q)
      const matchesStatus = statusFilter === ALL_STATUSES || sc.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [scs, search, statusFilter])

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>Sales Consumption Documents</CardTitle>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by doc #, date, shift..."
                className="pl-10 w-full sm:w-72"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as SCStatus | typeof ALL_STATUSES)}
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Document #</TableHead>
              <TableHead>Business Date</TableHead>
              <TableHead>Shift</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Transactions</TableHead>
              <TableHead className="text-right">Posted Lines</TableHead>
              <TableHead className="text-right">Pending</TableHead>
              <TableHead className="text-right">Cost Posted</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                  No sales consumption documents match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((sc) => (
                <TableRow key={sc.id}>
                  <TableCell>
                    <Link
                      href={`/store-operations/sales-consumption/${sc.id}`}
                      className="font-medium text-primary hover:underline"
                    >
                      {sc.docNumber}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {new Date(sc.businessDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{sc.shiftId}</TableCell>
                  <TableCell>
                    <SCStatusBadge status={sc.status} />
                  </TableCell>
                  <TableCell className="text-right">{sc.transactionCount}</TableCell>
                  <TableCell className="text-right">{sc.postedLineCount}</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center justify-end gap-1">
                      {sc.pendingLineCount > 0 ? (
                        <>
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <span className="text-amber-700 font-medium">{sc.pendingLineCount}</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <span className="text-green-700">0</span>
                        </>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(sc.totalCostPosted.amount, sc.totalCostPosted.currency)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
