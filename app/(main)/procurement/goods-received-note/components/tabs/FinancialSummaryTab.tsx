import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
// FinancialSummary type is not exported from '@/lib/types'
// Using any type for now
type FinancialSummary = any
import { Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GRNDetailMode } from '../GoodsReceiveNoteDetail'

interface FinancialSummaryTabProps {
  mode: GRNDetailMode
  summary: FinancialSummary | null
  currency: string
  baseCurrency: string
}

export function FinancialSummaryTab({ mode, summary, currency, baseCurrency }: FinancialSummaryTabProps) {
  if (!summary) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Calculator className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No financial summary available yet.</p>
        <p className="text-sm mt-2">Financial entries will be generated when the GRN is posted.</p>
      </div>
    )
  }

  // Helper to safely format date
  const formatDate = (date: any): string => {
    if (!date) return 'N/A'
    try {
      const d = date instanceof Date ? date : new Date(date)
      return d.toLocaleDateString()
    } catch {
      return 'N/A'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium">Journal Entries</h2>
          <div className="px-2 py-1 text-sm text-blue-600 bg-blue-50 rounded-full">
            {summary.jvNumber || 'Pending'}
          </div>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Recalculate
        </Button>
      </div>

      {/* Header Details */}
      <div className="grid grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <div className="text-sm text-gray-500">Document Type</div>
          <div className="font-medium">GRN</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Transaction Date</div>
          <div className="font-medium">{formatDate(summary.jvDate)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Journal Status</div>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${summary.jvStatus === 'Posted' || summary.jvStatus === 'posted' ? 'bg-green-500' : 'bg-yellow-500'}`} />
            <span className="font-medium">{summary.jvStatus || 'Pending'}</span>
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Journal Reference</div>
          <div className="font-medium">{summary.jvReference || '-'}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Source</div>
          <div className="font-medium">GRN</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Description</div>
          <div className="font-medium">{summary.jvDescription || '-'}</div>
        </div>
      </div>

      {/* Journal Entries */}
      <div className="border rounded-lg">
        <div className="p-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Account</TableHead>
                <TableHead className="w-[180px]">Department</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right w-[130px]">Debit ({currency || 'USD'})</TableHead>
                <TableHead className="text-right w-[130px]">Credit ({currency || 'USD'})</TableHead>
                <TableHead className="text-right w-[130px]">Base Debit ({baseCurrency || 'USD'})</TableHead>
                <TableHead className="text-right w-[130px]">Base Credit ({baseCurrency || 'USD'})</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summary.jvDetail && summary.jvDetail.length > 0 ? (
                summary.jvDetail.map((entry: any, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="w-[200px]">
                      <div className="font-medium">{entry.accountName || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{entry.accountCode?.code || '-'}</div>
                    </TableCell>
                    <TableCell className="w-[180px]">
                      <div>{entry.department?.name || '-'}</div>
                      <div className="text-sm text-gray-500">ID: {entry.department?.id || '-'}</div>
                    </TableCell>
                    <TableCell>{summary.jvDescription || '-'}</TableCell>
                    <TableCell className="text-right w-[130px] font-mono">
                      {(entry.debit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right w-[130px] font-mono">
                      {(entry.credit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right w-[130px] font-mono">
                      {(entry.baseDebit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right w-[130px] font-mono">
                      {(entry.baseCredit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No journal entries available. Entries will be generated when the GRN is posted.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Totals and Balance Status */}
        {summary.jvTotal && (
          <div className="border-t p-4 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <div className="flex gap-8">
                <div>
                  <span className="text-sm text-gray-500 mr-2">Total ({currency || 'USD'}):</span>
                  <span className="font-medium font-mono">
                    DR: {(summary.jvTotal.debit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} /
                    CR: {(summary.jvTotal.credit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 mr-2">Total Base ({baseCurrency || 'USD'}):</span>
                  <span className="font-medium font-mono">
                    DR: {(summary.jvTotal.baseDebit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} /
                    CR: {(summary.jvTotal.baseCredit || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex gap-4">
                  <div>
                    <span className="text-sm text-gray-500 mr-2">Difference ({currency || 'USD'}):</span>
                    <span className="font-medium font-mono">
                      {((summary.jvTotal.debit || 0) - (summary.jvTotal.credit || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 mr-2">Base Difference ({baseCurrency || 'USD'}):</span>
                    <span className="font-medium font-mono">
                      {((summary.jvTotal.baseDebit || 0) - (summary.jvTotal.baseCredit || 0)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                {(summary.jvTotal.debit || 0) === (summary.jvTotal.credit || 0) && (summary.jvTotal.baseDebit || 0) === (summary.jvTotal.baseCredit || 0) ? (
                  <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                    <span className="text-sm font-medium">Balanced</span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-700 bg-red-50 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                    <span className="text-sm font-medium">Unbalanced</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
