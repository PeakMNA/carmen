'use client'

import { useState, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
import { useToast } from '@/hooks/use-toast'
import { CheckCircle2 } from 'lucide-react'
import { mockSCLines } from '@/lib/mock-data'
import { EXCEPTION_CODE_LABELS, type ExceptionCode } from '@/lib/types/sales-consumption'

const ALL_EXCEPTION_CODES = Object.keys(EXCEPTION_CODE_LABELS) as ExceptionCode[]

export default function ExceptionQueuePage() {
  const { toast } = useToast()
  const [filterCode, setFilterCode] = useState<ExceptionCode | 'all'>('all')

  const pendingLines = useMemo(
    () => mockSCLines.filter(line => line.status === 'pending'),
    []
  )

  const filtered = useMemo(() => {
    if (filterCode === 'all') return pendingLines
    return pendingLines.filter(line => line.exceptionCode === filterCode)
  }, [pendingLines, filterCode])

  function handleResolve(id: string) {
    toast({ title: 'Coming soon', description: `Resolve & Re-post for ${id} is not yet available.` })
  }

  function handleDiscard(id: string) {
    toast({ title: 'Coming soon', description: `Discard for ${id} is not yet available.` })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold">Exception Queue</h2>
          <Badge variant="secondary">{pendingLines.length}</Badge>
        </div>
        <Select value={filterCode} onValueChange={(v) => setFilterCode(v as ExceptionCode | 'all')}>
          <SelectTrigger className="w-56">
            <SelectValue placeholder="Filter by reason code" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Reason Codes</SelectItem>
            {ALL_EXCEPTION_CODES.map(code => (
              <SelectItem key={code} value={code}>
                {EXCEPTION_CODE_LABELS[code]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
          <CheckCircle2 className="h-10 w-10 text-green-500" />
          <p>No open exceptions. All POS sales have been posted to inventory.</p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>POS Item</TableHead>
              <TableHead>Reason Code</TableHead>
              <TableHead>SC Reference</TableHead>
              <TableHead>Exception Detail</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map(line => (
              <TableRow key={line.id}>
                <TableCell className="font-medium">{line.posItemName}</TableCell>
                <TableCell>
                  {line.exceptionCode ? (
                    <Badge variant="outline">{EXCEPTION_CODE_LABELS[line.exceptionCode]}</Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">{line.scId}</TableCell>
                <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                  {line.exceptionDetail || '—'}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleResolve(line.id)}>
                      Resolve &amp; Re-post
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleDiscard(line.id)}>
                      Discard
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  )
}
