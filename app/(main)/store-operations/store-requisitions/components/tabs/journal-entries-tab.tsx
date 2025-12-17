'use client'

import React from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertCircle, Calculator } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface JournalEntry {
  accountCode: string
  accountName: string
  department: {
    code: string
    name: string
  }
  costCenter: string
  description: string
  reference: string
  debit: number
  credit: number
}

interface JournalGroup {
  group: string
  description: string
  entries: JournalEntry[]
}

// Mock data for journal entries
const mockJournalEntries: JournalGroup[] = [
  {
    group: 'Inventory Entries',
    description: 'Stock movement and cost adjustments',
    entries: [
      {
        accountCode: '1140',
        accountName: 'Inventory - Raw Materials',
        department: { code: 'F&B', name: 'F&B Operations' },
        costCenter: 'CC001',
        description: 'Stock Issue Recording',
        reference: 'SR-2410-001',
        debit: 0,
        credit: 8615.00
      },
      {
        accountCode: '5110',
        accountName: 'Cost of Goods Used',
        department: { code: 'F&B', name: 'F&B Operations' },
        costCenter: 'CC001',
        description: 'Usage Cost Recording',
        reference: 'SR-2410-001',
        debit: 8615.00,
        credit: 0
      }
    ]
  }
]

// Add props interface to receive requisition data
interface JournalEntriesTabProps {
  refNo: string
  date: string
  department: string
  description: string
}

export function JournalEntriesTab({ refNo, date, department, description }: JournalEntriesTabProps) {
  // Calculate totals
  const calculateTotals = () => {
    return mockJournalEntries.reduce((acc, group) => {
      const groupTotals = group.entries.reduce((groupAcc, entry) => ({
        debit: groupAcc.debit + entry.debit,
        credit: groupAcc.credit + entry.credit
      }), { debit: 0, credit: 0 })
      return {
        debit: acc.debit + groupTotals.debit,
        credit: acc.credit + groupTotals.credit
      }
    }, { debit: 0, credit: 0 })
  }

  const totals = calculateTotals()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium">Journal Entries</h2>
          <div className="px-2 py-1 text-sm text-blue-600 bg-blue-50 rounded-full">
            {refNo}
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
          <div className="font-medium">Store Requisition</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Transaction Date</div>
          <div className="font-medium">{date}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Journal Status</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="font-medium">Posted</span>
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Journal Reference</div>
          <div className="font-medium">JV-{refNo.split('-')[1]}</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Source</div>
          <div className="font-medium">SR</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Description</div>
          <div className="font-medium">{description}</div>
        </div>
      </div>

      {/* Journal Groups */}
      <div className="border rounded-lg divide-y">
        {mockJournalEntries.map((group) => (
          <div key={group.group}>
            {/* Group Header */}
            <div className="bg-gray-50 p-4">
              <h3 className="font-medium text-sm">{group.group}</h3>
              <p className="text-sm text-gray-500 mt-1">{group.description}</p>
            </div>

            {/* Group Entries */}
            <div className="p-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[250px]">Account</TableHead>
                    <TableHead className="w-[200px]">Department</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right w-[150px]">Debit</TableHead>
                    <TableHead className="text-right w-[150px]">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.entries.map((entry, index) => (
                    <TableRow key={index}>
                      <TableCell className="w-[250px]">
                        <div className="font-medium">{entry.accountName}</div>
                        <div className="text-sm text-gray-500">{entry.accountCode}</div>
                      </TableCell>
                      <TableCell className="w-[200px]">
                        <div>{entry.department.name}</div>
                        <div className="text-sm text-gray-500">
                          CC: {entry.costCenter}
                        </div>
                      </TableCell>
                      <TableCell>{entry.description}</TableCell>
                      <TableCell className="text-right w-[150px] font-mono">
                        {entry.debit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right w-[150px] font-mono">
                        {entry.credit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        ))}
      </div>

      {/* Totals and Validation */}
      <div className="border rounded-lg">
        <div className="p-4">
          <Table>
            <TableBody>
              <TableRow className="border-t border-gray-200 font-medium">
                <TableCell className="w-[250px]">Totals</TableCell>
                <TableCell className="w-[200px]"></TableCell>
                <TableCell></TableCell>
                <TableCell className="text-right w-[150px] font-mono">
                  {totals.debit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
                <TableCell className="text-right w-[150px] font-mono">
                  {totals.credit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        {/* Balance Status */}
        <div className="border-t p-4 bg-gray-50 flex justify-end">
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-500">Difference:</div>
            <div className="font-medium">
              {(totals.debit - totals.credit).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            {totals.debit === totals.credit ? (
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
    </div>
  )
} 