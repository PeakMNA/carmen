'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
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
import { useToast } from '@/hooks/use-toast'
import { POSMappingTab } from '../components/pos-mapping-tab'
import type { POSMapping, PosConnection } from '@/lib/types/pos-integration'
import {
  mockPosConnections,
  mockPOSMappings,
  mockUnmappedPOSItems,
  mockRecipeSearchResults,
  mockLocationMappings,
  mockFractionalVariants,
} from '@/lib/mock-data/pos-integration'

const STATUS_BADGE_VARIANT: Record<PosConnection['status'], 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  paused: 'secondary',
  error: 'destructive',
}

const POS_MODEL_LABELS: Record<string, string> = {
  square: 'Square',
  toast: 'Toast',
  lightspeed: 'Lightspeed',
  micros: 'Micros',
  generic_csv: 'Generic CSV',
  generic_xml: 'Generic XML',
}

const CONNECTOR_MODE_LABELS: Record<string, string> = {
  api: 'API',
  file_import: 'File Import',
  webhook: 'Webhook',
}

export default function POSSetupPage() {
  const { toast } = useToast()
  const [mappings, setMappings] = useState<POSMapping[]>(mockPOSMappings)

  const handleCreateMapping = useCallback((mapping: Partial<POSMapping>) => {
    const newMapping: POSMapping = {
      id: `mapping-${Date.now()}`,
      posItemId: mapping.posItemId || '',
      posItemName: mapping.posItemName || '',
      posItemCategory: mapping.posItemCategory || '',
      posOutletId: mapping.posOutletId || '',
      posOutletName: mapping.posOutletName || '',
      locationId: mapping.locationId || '',
      locationName: mapping.locationName || '',
      recipeId: mapping.recipeId || '',
      recipeName: mapping.recipeName || '',
      recipeCategory: mapping.recipeCategory || '',
      portionSize: mapping.portionSize || 1,
      unit: mapping.unit || 'serving',
      unitPrice: mapping.unitPrice || { amount: 0, currency: 'USD' },
      isActive: true,
      mappedBy: { id: 'user-001', name: 'Current User' },
      mappedAt: new Date().toISOString(),
      createdAt: new Date(),
      createdBy: 'user-001',
      updatedAt: new Date(),
      updatedBy: 'user-001',
    }
    setMappings(prev => [...prev, newMapping])
    toast({
      title: 'Mapping Created',
      description: `${mapping.posItemName} has been mapped to ${mapping.recipeName}.`,
    })
  }, [toast])

  const handleUpdateMapping = useCallback((id: string, updates: Partial<POSMapping>) => {
    setMappings(prev => prev.map(m => m.id === id ? { ...m, ...updates, updatedAt: new Date() } : m))
    toast({ title: 'Mapping Updated', description: 'The mapping has been updated successfully.' })
  }, [toast])

  const handleDeleteMapping = useCallback((id: string) => {
    setMappings(prev => prev.filter(m => m.id !== id))
    toast({ title: 'Mapping Deleted', description: 'The mapping has been removed.' })
  }, [toast])

  const handleSyncPOSItems = useCallback(() => {
    toast({ title: 'Syncing POS Items', description: 'Fetching latest items from POS system...' })
    setTimeout(() => {
      toast({ title: 'Sync Complete', description: 'Found 2 new items, 0 updated.' })
    }, 1500)
  }, [toast])

  return (
    <div className="space-y-10">
      {/* Connections */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Connections</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Configure POS system connectors</p>
          </div>
          <Button asChild>
            <Link href="/system-administration/system-integration/pos/setup/connections/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Connection
            </Link>
          </Button>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>POS Model</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Sync</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {mockPosConnections.map(conn => (
              <TableRow key={conn.id}>
                <TableCell className="font-medium">
                  {POS_MODEL_LABELS[conn.posModel] ?? conn.posModel}
                </TableCell>
                <TableCell>{CONNECTOR_MODE_LABELS[conn.mode] ?? conn.mode}</TableCell>
                <TableCell>{conn.locationId}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE_VARIANT[conn.status]} className="capitalize">
                    {conn.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {conn.lastSyncAt
                    ? new Date(conn.lastSyncAt).toLocaleString('en-US', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })
                    : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Item Mappings */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Item Mappings</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Map POS items to recipes, locations, and fractional variants
          </p>
        </div>
        <POSMappingTab
          mappings={mappings}
          unmappedItems={mockUnmappedPOSItems}
          locationMappings={mockLocationMappings}
          fractionalVariants={mockFractionalVariants}
          recipeSearchResults={mockRecipeSearchResults}
          onCreateMapping={handleCreateMapping}
          onUpdateMapping={handleUpdateMapping}
          onDeleteMapping={handleDeleteMapping}
          onSyncPOSItems={handleSyncPOSItems}
        />
      </div>
    </div>
  )
}
