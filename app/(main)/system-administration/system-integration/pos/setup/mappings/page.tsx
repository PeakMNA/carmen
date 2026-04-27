'use client'

import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { POSMappingTab } from '../../components/pos-mapping-tab'
import type { POSMapping } from '@/lib/types/pos-integration'
import {
  mockPOSMappings,
  mockUnmappedPOSItems,
  mockRecipeSearchResults,
  mockLocationMappings,
  mockFractionalVariants,
} from '@/lib/mock-data/pos-integration'

export default function POSMappingsPage() {
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
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Mappings</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Map POS items to recipes, locations, and fractional variants</p>
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
  )
}
