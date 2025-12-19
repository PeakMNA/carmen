"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface QuickFiltersProps {
  onQuickFilter: (filter: QuickFilterOption) => void
  activeFilter: QuickFilterOption | null
}

export interface QuickFilterOption {
  type: 'document' | 'status' | 'stage' | 'requester'
  value: string
  label: string
}

export function SRQuickFilters({ onQuickFilter, activeFilter }: QuickFiltersProps) {
  const [primaryFilter, setPrimaryFilter] = useState<'my-pending' | 'all-documents'>('my-pending')

  const handlePrimaryFilter = (filter: 'my-pending' | 'all-documents') => {
    setPrimaryFilter(filter)
    // Apply default filter for the selected primary option
    if (filter === 'my-pending') {
      // My Pending: Actionable SRs requiring attention (Draft, In Process, Reject)
      onQuickFilter({ type: 'document', value: 'my-pending', label: 'My Pending' })
    } else {
      // All Documents: Comprehensive view of all SRs based on role permissions
      onQuickFilter({ type: 'document', value: 'all-documents', label: 'All Documents' })
    }
  }

  const statusOptions = [
    { value: 'all-status', label: 'All Status' },
    { value: 'draft', label: 'Draft' },
    { value: 'in-process', label: 'In Process' },
    { value: 'complete', label: 'Complete' },
    { value: 'reject', label: 'Reject' },
    { value: 'void', label: 'Void' },
  ]

  const stageOptions = [
    { value: 'all-stage', label: 'All Stage' },
    { value: 'submission', label: 'Submission' },
    { value: 'hod-approval', label: 'HOD Approval' },
    { value: 'store-manager', label: 'Store Manager' },
    { value: 'complete', label: 'Complete' },
    { value: 'rejected', label: 'Rejected' },
  ]

  const requesterOptions = [
    { value: 'all-requester', label: 'All Requester' },
    { value: 'chef-maria', label: 'Chef Maria' },
    { value: 'bar-manager', label: 'Bar Manager' },
    { value: 'mike-johnson', label: 'Mike Johnson' },
  ]

  return (
    <div className="flex items-center space-x-4">
      {/* Primary Filter Toggle */}
      <div className="flex bg-muted rounded-lg p-1">
        <Button
          variant={primaryFilter === 'my-pending' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handlePrimaryFilter('my-pending')}
          className="h-8 px-3 text-xs"
        >
          My Pending
        </Button>
        <Button
          variant={primaryFilter === 'all-documents' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handlePrimaryFilter('all-documents')}
          className="h-8 px-3 text-xs"
        >
          All Documents
        </Button>
      </div>

      {/* Secondary Filter Options */}
      <div className="flex items-center space-x-2">
        {/* Status Filter - Only show when "All Documents" is selected */}
        {primaryFilter === 'all-documents' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 px-2 text-xs">
                {activeFilter?.type === 'status' ? activeFilter.label : 'All Status'}
                <ChevronDown className="ml-2 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              {statusOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onQuickFilter({ type: 'status', value: option.value, label: option.label })}
                >
                  <span className="text-xs">{option.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Stage Filter - Only show when "My Pending" is selected */}
        {primaryFilter === 'my-pending' && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-8 px-2 text-xs">
                {activeFilter?.type === 'stage' ? activeFilter.label : 'All Stage'}
                <ChevronDown className="ml-2 h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-40">
              {stageOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => onQuickFilter({ type: 'stage', value: option.value, label: option.label })}
                >
                  <span className="text-xs">{option.label}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Requester Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 px-2 text-xs">
              {activeFilter?.type === 'requester' ? activeFilter.label : 'All Requester'}
              <ChevronDown className="ml-2 h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-40">
            {requesterOptions.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => onQuickFilter({ type: 'requester', value: option.value, label: option.label })}
              >
                <span className="text-xs">{option.label}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}
