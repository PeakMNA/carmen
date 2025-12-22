'use client'

import { useState } from 'react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export interface QuickFilterOption {
  type: string
  value: string
  label: string
}

interface QuickFiltersProps {
  onQuickFilter: (filter: QuickFilterOption | null) => void
  activeFilter: QuickFilterOption | null
}

export function CNQuickFilters({ onQuickFilter, activeFilter }: QuickFiltersProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all-status')

  // Credit Note specific filter options
  const statusOptions = [
    { value: 'all-status', label: 'All Status' },
    { value: 'Draft', label: 'Draft' },
    { value: 'Submitted', label: 'Submitted' },
    { value: 'Approved', label: 'Approved' },
    { value: 'Rejected', label: 'Rejected' },
    { value: 'Voided', label: 'Voided' },
  ]

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    if (value !== 'all-status') {
      onQuickFilter({ type: 'status', value, label: statusOptions.find(opt => opt.value === value)?.label || value })
    } else {
      onQuickFilter(null)
    }
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Status filter */}
      <Select value={statusFilter} onValueChange={handleStatusChange}>
        <SelectTrigger className="h-8 w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
