'use client'
import { useState, Suspense } from 'react'
import { GoodsReceiveNoteComponent } from '../components/goods-receive-note'
import { GoodsReceiveNote } from '@/lib/types'

export default function CreateGoodsReceiveNote() {
  const [initialGrnData] = useState<GoodsReceiveNote>(() => ({
    id: `new-${crypto.randomUUID()}`,
    grnNumber: '',
    ref: '',
    date: new Date(),
    receiptDate: new Date(),
    invoiceDate: new Date(),
    invoiceNumber: '',
    taxInvoiceDate: undefined,
    taxInvoiceNumber: '',
    description: '',
    receiver: '',
    receivedBy: '',
    vendor: '',
    vendorId: '',
    vendorName: '',
    location: '',
    locationId: '',
    currency: 'USD',
    exchangeRate: 1,
    baseCurrency: 'USD',
    status: 'RECEIVED' as any,
    isConsignment: false,
    isCash: false,
    cashBook: '',
    items: [],
    selectedItems: [],
    stockMovements: [],
    extraCosts: [],
    comments: [],
    attachments: [],
    activityLog: [],
    financialSummary: null,
    purchaseOrderRefs: [],
    totalItems: 0,
    totalQuantity: 0,
    totalValue: 0,
    baseSubTotalPrice: 0,
    subTotalPrice: 0,
    baseNetAmount: 0,
    netAmount: 0,
    baseDiscAmount: 0,
    discountAmount: 0,
    baseTaxAmount: 0,
    taxAmount: 0,
    baseTotalAmount: 0,
    totalAmount: 0
  } as unknown as GoodsReceiveNote));

  return (
    <div className="p-6">
      <Suspense fallback={<div>Loading GRN Form...</div>}>
        <GoodsReceiveNoteComponent 
          initialData={initialGrnData}
        />
      </Suspense>
    </div>
  )
}