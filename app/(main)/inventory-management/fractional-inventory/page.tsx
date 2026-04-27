'use client'

import React, { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FractionalInventoryDashboard } from './components/fractional-inventory-dashboard'
import { ConversionOperationsModal } from './components/conversion-operations-modal'
import { ConversionTrackingPanel } from './components/conversion-tracking-panel'
import { 
  FractionalStock, 
  FractionalItem, 
  ConversionRecord 
} from '@/lib/types/fractional-inventory'
import { fractionalInventoryService } from '@/lib/services/fractional-inventory-service'
import { fractionalInventoryOperations } from '@/lib/services/fractional-inventory-operations'
import { toast } from 'sonner'

export default function FractionalInventoryPage() {
  // Modal state
  const [conversionModalOpen, setConversionModalOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<FractionalStock | null>(null)
  const [selectedItem, setSelectedItem] = useState<FractionalItem | null>(null)
  const [operationType, setOperationType] = useState<'split' | 'combine'>('split')

  // Stock detail state
  const [detailViewStock, setDetailViewStock] = useState<FractionalStock | null>(null)

  // Handle conversion request from dashboard
  const handleConversionRequest = async (stockId: string, type: 'split' | 'combine') => {
    try {
      // In a real app, fetch stock and item data
      const stock = await fetchStockById(stockId)
      const item = stock ? await fetchItemById(stock.itemId) : null

      if (!stock || !item) {
        toast.error('Unable to load stock information')
        return
      }

      setSelectedStock(stock)
      setSelectedItem(item)
      setOperationType(type)
      setConversionModalOpen(true)
    } catch (error) {
      toast.error('Failed to load conversion details')
    }
  }

  // Handle stock selection for detailed view
  const handleStockSelect = async (stock: FractionalStock) => {
    setDetailViewStock(stock)
  }

  // Handle conversion confirmation
  const handleConversionConfirm = async (operation: any) => {
    try {
      if (operation.type === 'split') {
        await fractionalInventoryService.splitItem(
          operation.stockId,
          operation.quantity,
          operation.portionSizeId,
          'current-user@restaurant.com',
          operation.reason
        )
        toast.success('Split operation completed successfully')
      } else if (operation.type === 'combine') {
        await fractionalInventoryService.combinePortions(
          operation.stockId,
          operation.quantity,
          'current-user@restaurant.com',
          operation.reason
        )
        toast.success('Combine operation completed successfully')
      }

      // Refresh data
      await refreshInventoryData()
      return true
    } catch (error) {
      toast.error('Conversion operation failed')
      return false
    }
  }

  // Mock data fetching functions - replace with actual API calls
  const fetchStockById = async (stockId: string): Promise<FractionalStock | null> => {
    // Mock implementation
    const mockStock: FractionalStock = {
      id: stockId,
      itemId: 'item-1',
      locationId: 'main-kitchen',
      currentState: 'PREPARED',
      stateTransitionDate: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      qualityGrade: 'GOOD',
      wholeUnitsAvailable: 5,
      partialQuantityAvailable: 0,
      totalPortionsAvailable: 40,
      reservedPortions: 8,
      originalWholeUnits: 5,
      originalTotalPortions: 40,
      conversionsApplied: [],
      totalWasteGenerated: 2.5,
      preparedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 3.5).toISOString(),
      createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    }
    return mockStock
  }

  const fetchItemById = async (itemId: string): Promise<FractionalItem | null> => {
    // Mock implementation
    const mockItem: FractionalItem = {
      id: itemId,
      itemCode: 'PIZZA-MAR',
      itemName: 'Margherita Pizza (Large)',
      category: 'Food',
      baseUnit: 'Whole Pizza',
      supportsFractional: true,
      allowPartialSales: true,
      trackPortions: true,
      availablePortions: [
        { id: 'slice-8', name: 'Slice', portionsPerWhole: 8, isActive: true },
        { id: 'half-2', name: 'Half', portionsPerWhole: 2, isActive: true },
        { id: 'quarter-4', name: 'Quarter', portionsPerWhole: 4, isActive: true }
      ],
      defaultPortionId: 'slice-8',
      shelfLifeHours: 4,
      maxQualityHours: 2,
      allowAutoConversion: true,
      wastePercentage: 5,
      baseCostPerUnit: 250,
      conversionCostPerUnit: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    return mockItem
  }

  const refreshInventoryData = async () => {
    // Mock refresh - in real app, this would trigger data refetch
    toast.success('Inventory data refreshed')
  }

  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboard">Inventory Dashboard</TabsTrigger>
          <TabsTrigger value="tracking">Conversion Tracking</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <FractionalInventoryDashboard
            onStockSelect={handleStockSelect}
            onConversionRequest={handleConversionRequest}
          />
        </TabsContent>

        <TabsContent value="tracking" className="space-y-6">
          <ConversionTrackingPanel />
        </TabsContent>
      </Tabs>

      {/* Conversion Operations Modal */}
      <ConversionOperationsModal
        isOpen={conversionModalOpen}
        onClose={() => {
          setConversionModalOpen(false)
          setSelectedStock(null)
          setSelectedItem(null)
        }}
        stock={selectedStock}
        item={selectedItem}
        operationType={operationType}
        onConfirm={handleConversionConfirm}
      />
    </div>
  )
}