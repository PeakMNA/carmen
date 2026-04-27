'use client'

import React, { useState } from 'react'
import { Plus, Download, Printer, PackagePlus, FilePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { GoodsReceiveNote } from '@/lib/types'
import { useGRNCreationStore } from '@/lib/store/grn-creation.store'
import { GoodsReceiveNoteList } from './components/GoodsReceiveNoteList'

export default function GoodsReceiveNotePage() {
  const router = useRouter()
  const { setProcessType, setNewlyCreatedGRNData } = useGRNCreationStore()

  // Specific handler for the manual creation button click
  const handleManualCreateClick = () => {
    console.log('[handleManualCreateClick] Button clicked'); 
    handleProcessSelection('manual');
  }

  // Function to handle process selection and navigation
  const handleProcessSelection = (type: 'po' | 'manual') => {
    console.log('[handleProcessSelection] Called with type:', type);
    setProcessType(type);
    let nextRoute = '';
    if (type === 'po') {
      nextRoute = '/procurement/goods-received-note/new/vendor-selection';
      router.push(nextRoute);
    } else { // Manual creation
      const tempId = `new-${uuidv4()}`;
      console.log('[handleProcessSelection] Generated tempId:', tempId);

      // Create placeholder data for the store
      const placeholderData: any = {
        id: tempId, // Use the generated temp ID
        ref: 'NEW GRN',
        date: new Date(),
        invoiceDate: new Date(),
        invoiceNumber: '',
        taxInvoiceDate: undefined,
        taxInvoiceNumber: '',
        description: '',
        receiver: '', // Should get from user context later
        vendor: '',
        vendorId: '',
        location: '', // Should get from user/unit context later
        currency: 'USD', // Default or get from settings
        exchangeRate: 1,
        baseCurrency: 'USD', // Default or get from settings
        status: 'RECEIVED' as any, // Use 'RECEIVED' as the default valid status
        isConsignment: false,
        isCash: false,
        cashBook: '',
        items: [],
        selectedItems: [],
        stockMovements: [],
        extraCosts: [],
        comments: [],
        attachments: [],
        activityLog: [], // Initialize as empty array 
        baseSubTotalPrice: 0,
        subTotalPrice: 0,
        baseNetAmount: 0,
        netAmount: 0,
        baseDiscAmount: 0,
        discountAmount: 0,
        baseTaxAmount: 0,
        taxAmount: 0,
        baseTotalAmount: 0,
        totalAmount: 0,
      };

      console.log('[handleProcessSelection] Setting placeholder data in store:', placeholderData);
      setNewlyCreatedGRNData(placeholderData); // Set data in Zustand store

      nextRoute = `/procurement/goods-received-note/${tempId}?mode=confirm`;
      console.log('[handleProcessSelection] Calculated nextRoute:', nextRoute);
      try {
        console.log('[handleProcessSelection] Attempting router.push...');
        router.push(nextRoute);
        console.log('[handleProcessSelection] router.push apparently succeeded.');
      } catch (error) {
        console.error('[handleProcessSelection] Error during router.push:', error);
      }
    }
  }

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Goods Receive Notes</h1>
          <p className="text-muted-foreground">
            Track and manage goods received from vendors, validate deliveries against purchase orders, and maintain accurate inventory records.
          </p>
        </div>
        
        {/* Action Buttons - Top aligned with title */}
        <div className="flex items-center space-x-2 md:mt-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New GRN
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleProcessSelection('po')}>
                <PackagePlus className="mr-2 h-4 w-4" />
                Create from Purchase Order
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleManualCreateClick}>
                <FilePlus className="mr-2 h-4 w-4" />
                Create Manually
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
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

      {/* GRN List Component with integrated filtering */}
      <GoodsReceiveNoteList />
    </div>
  )
}