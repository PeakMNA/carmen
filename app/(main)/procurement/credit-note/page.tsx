'use client'

import React from 'react'
import { Plus, Download, Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import { mockCreditNotes } from '@/lib/mock-data'
import { CNShadcnDataTable } from './components/cn-shadcn-data-table'

export default function CreditNotePage() {
  const router = useRouter()

  const handleCreateCreditNote = () => {
    router.push('/procurement/credit-note/new')
  }

  return (
    <div className="container mx-auto py-6 px-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Credit Notes</h1>
          <p className="text-muted-foreground">
            Manage vendor credit notes, track adjustments, and maintain accurate financial records for returns and discrepancies.
          </p>
        </div>

        {/* Action Buttons - Top aligned with title */}
        <div className="flex items-center space-x-2 md:mt-0">
          <Button onClick={handleCreateCreditNote}>
            <Plus className="mr-2 h-4 w-4" />
            New Credit Note
          </Button>

          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button variant="outline" size="sm">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Credit Note List Component with integrated filtering */}
      <CNShadcnDataTable data={mockCreditNotes} />
    </div>
  )
}
