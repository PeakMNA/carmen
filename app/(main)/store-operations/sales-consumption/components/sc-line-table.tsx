'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { SalesConsumptionLine, SCLineStatus } from '@/lib/types/sales-consumption'
import { getExceptionCodeLabel } from '@/lib/services/sales-consumption-service'
import { formatCurrency } from '@/lib/utils/formatters'

interface SCLineTableProps {
  lines: SalesConsumptionLine[]
}

type FilterOption = 'all' | SCLineStatus

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'posted', label: 'Posted' },
  { value: 'pending', label: 'Pending' },
  { value: 'reversed', label: 'Reversed' },
]

function LineStatusBadge({ status }: { status: SCLineStatus }): JSX.Element {
  switch (status) {
    case 'posted':
      return (
        <Badge className="border-transparent bg-green-600 text-white hover:bg-green-700">
          Posted
        </Badge>
      )
    case 'pending':
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-700">
          Pending
        </Badge>
      )
    case 'reversed':
      return (
        <Badge variant="outline" className="text-muted-foreground">
          Reversed
        </Badge>
      )
    default:
      return <Badge variant="outline">{status}</Badge>
  }
}

export function SCLineTable({ lines }: SCLineTableProps) {
  const [filter, setFilter] = useState<FilterOption>('all')

  const filtered = useMemo(
    () => (filter === 'all' ? lines : lines.filter((l) => l.status === filter)),
    [lines, filter]
  )

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-4">
          <CardTitle>Consumption Lines</CardTitle>
          <div className="flex gap-1">
            {FILTER_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                variant={filter === opt.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilter(opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>POS Item</TableHead>
              <TableHead>Recipe</TableHead>
              <TableHead>Ingredient</TableHead>
              <TableHead className="text-right">Qty Consumed</TableHead>
              <TableHead className="text-right">Unit Cost</TableHead>
              <TableHead className="text-right">Extended Cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Exception</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                  No lines match the selected filter.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((line) => (
                <TableRow key={line.id}>
                  <TableCell className="font-medium">{line.posItemName}</TableCell>
                  <TableCell>{line.recipeName ?? '—'}</TableCell>
                  <TableCell>{line.ingredientProductName ?? '—'}</TableCell>
                  <TableCell className="text-right font-mono">
                    {line.qtyConsumed} {line.unitOfMeasure}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(line.unitCost, line.currency)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(line.extendedCost, line.currency)}
                  </TableCell>
                  <TableCell>
                    <LineStatusBadge status={line.status} />
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {line.exceptionCode ? getExceptionCodeLabel(line.exceptionCode) : '—'}
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
