'use client'

import { useState, useCallback } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'
import { POSMappingTab } from '../components/pos-mapping-tab'
import type { POSMapping, PosConnection } from '@/lib/types/pos-integration'
import {
  mockPOSMappings,
  mockUnmappedPOSItems,
  mockRecipeSearchResults,
  mockLocationMappings,
  mockFractionalVariants,
} from '@/lib/mock-data/pos-integration'

const mockPosConnections: PosConnection[] = [
  {
    id: 'conn-001',
    posModel: 'square',
    mode: 'api',
    credentials: { endpoint: 'https://connect.squareup.com', apiKey: 'sq0atp-***' },
    syncSchedule: '*/15 * * * *',
    locationId: 'loc-001',
    status: 'active',
    scGenerationEnabled: true,
    lastSyncAt: '2026-04-27T08:30:00Z',
    lastSyncTransactionCount: 45,
  },
  {
    id: 'conn-002',
    posModel: 'toast',
    mode: 'webhook',
    credentials: { endpoint: 'https://api.toasttab.com', apiKey: 'toast-***' },
    syncSchedule: '0 * * * *',
    locationId: 'loc-002',
    status: 'paused',
    scGenerationEnabled: false,
    lastSyncAt: '2026-04-26T22:00:00Z',
    lastSyncTransactionCount: 12,
  },
  {
    id: 'conn-003',
    posModel: 'generic_csv',
    mode: 'file_import',
    importConfig: { fileFormat: 'csv', columnMappings: {}, uploadSchedule: 'daily' },
    syncSchedule: '0 6 * * *',
    locationId: 'loc-003',
    status: 'error',
    scGenerationEnabled: false,
    lastSyncAt: '2026-04-25T06:00:00Z',
    lastSyncTransactionCount: 0,
  },
]

const STATUS_BADGE_VARIANT: Record<PosConnection['status'], 'default' | 'secondary' | 'destructive'> = {
  active: 'default',
  paused: 'secondary',
  error: 'destructive',
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
    toast({ title: 'Mapping Created', description: `${mapping.posItemName} has been mapped to ${mapping.recipeName}.` })
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">POS Setup</h2>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="mappings">Mappings</TabsTrigger>
        </TabsList>

        <TabsContent value="connections" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => toast({ title: 'Coming soon', description: 'Add Connection is not yet available.' })}>
              <Plus className="mr-2 h-4 w-4" />
              Add Connection
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>POS Model</TableHead>
                <TableHead>Mode</TableHead>
                <TableHead>Location ID</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sync</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockPosConnections.map((conn) => (
                <TableRow key={conn.id}>
                  <TableCell className="font-medium capitalize">{conn.posModel.replace('_', ' ')}</TableCell>
                  <TableCell className="capitalize">{conn.mode.replace('_', ' ')}</TableCell>
                  <TableCell>{conn.locationId}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[conn.status]} className="capitalize">
                      {conn.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {conn.lastSyncAt
                      ? new Date(conn.lastSyncAt).toLocaleString()
                      : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="mappings">
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
        </TabsContent>
      </Tabs>
    </div>
  )
}
