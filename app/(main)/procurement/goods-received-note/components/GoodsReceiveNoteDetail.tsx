'use client'
import React, { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { GRNItemsHierarchical } from './tabs/GRNItemsHierarchical'
import { GoodsReceiveNote, GoodsReceiveNoteItem, GRNStatus } from '@/lib/types'
import { ExtraCostsTab } from './tabs/ExtraCostsTab'
import { GoodsReceiveNoteItemsBulkActions } from './tabs/GoodsReceiveNoteItemsBulkActions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useRouter } from 'next/navigation'
import { StockMovementTab } from './tabs/StockMovementTab'
import { ChevronLeft, Edit, Trash2, Printer, Send, Save, PanelRightClose, PanelRightOpen, CheckCheck, PencilRuler, Download, Share } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { FormFooter, FloatingActionMenu, ActionItem } from '@/components/ui/form-footer'
import { FinancialSummaryTab } from './tabs/FinancialSummaryTab'
import StockMovementContent from './tabs/stock-movement'
import SummaryTotal from './SummaryTotal'
import { format } from 'date-fns'

// GRN Detail Mode types
export type GRNDetailMode = 'view' | 'edit' | 'add' | 'confirm';

interface GoodsReceiveNoteDetailProps {
  id?: string
  mode?: GRNDetailMode
  onModeChange?: (mode: GRNDetailMode) => void
  initialData: GoodsReceiveNote
}

// Define a default empty GoodsReceiveNote object
const emptyGoodsReceiveNote = {
  id: '',
  ref: '',
  selectedItems: [],
  date: new Date(),
  invoiceDate: new Date(),
  invoiceNumber: '',
  description: '',
  receiver: '',
  vendor: '',
  vendorId: '',
  location: '',
  currency: '',
  status: GRNStatus.RECEIVED,
  cashBook: '',
  items: [],
  stockMovements: [],
  isConsignment: false,
  isCash: false,
  extraCosts: [],
  comments: [],
  attachments: [],
  activityLog: [],
  financialSummary: null,
  exchangeRate: 0,
  baseCurrency: '',
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

export function GoodsReceiveNoteDetail({ id, mode = 'view', onModeChange, initialData }: GoodsReceiveNoteDetailProps) {
  const router = useRouter()
  const [formData, setFormData] = useState<GoodsReceiveNote>(initialData);
  const [currentMode, setCurrentMode] = useState<GRNDetailMode>(mode);
  const [extraCosts, setExtraCosts] = useState<any[]>((initialData as any).extraCosts || [])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setFormData(initialData);
    setExtraCosts((initialData as any).extraCosts || []);
    setSelectedItems([]);
    setExpandedItems([]);
    setCurrentMode(mode);
  }, [initialData, mode]);

  const isReadOnly = currentMode === 'view' || currentMode === 'confirm';

  const handleModeChange = (newMode: GRNDetailMode) => {
    setCurrentMode(newMode);
    if (onModeChange) {
      onModeChange(newMode);
    }
  }

  const handleEditClick = () => {
    handleModeChange('edit');
  };

  const handleConfirmAndSave = async () => {
    setIsLoading(true)
    try {
      console.log('Confirming and Saving GRN:', formData)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      const realId = `GRN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
      router.push(`/procurement/goods-received-note/${realId}?mode=view`)
    } catch (error) {
      console.error('Error confirming GRN:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditFurther = () => {
    handleModeChange('edit');
  }

  const handleExtraCostsChange = (costs: any[], distributionMethod?: any) => {
    setExtraCosts(costs);
    setFormData(prev => ({
      ...prev,
      extraCosts: costs,
      ...(distributionMethod && { costDistributionMethod: distributionMethod })
    }));
    setHasUnsavedChanges(true);
  };

  const handleItemSelection = (itemId: string, isSelected: boolean) => {
    if (itemId === "") {
      if (isSelected) {
        setSelectedItems((formData as any).items.map((item: any) => item.id))
      } else {
        setSelectedItems([])
      }
    } else {
      setSelectedItems(prev => 
        isSelected 
          ? [...prev, itemId]
          : prev.filter(id => id !== itemId)
      )
    }
  }

  const handleBulkAction = (action: string) => {
    console.log(`Applying ${action} to items:`, selectedItems)
    if (action === 'delete') {
      setFormData(prev => ({
        ...prev,
        items: (prev as any).items?.filter((item: any) => !selectedItems.includes(item.id)) || []
      } as any))
    }
    setSelectedItems([])
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      console.log('Saving GRN (edit mode):', formData)
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setHasUnsavedChanges(false)
      handleModeChange('view')
    } catch (error) {
      console.error('Error saving GRN:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelEdit = () => {
    setFormData(initialData)
    setHasUnsavedChanges(false)
    handleModeChange('view')
  }

  const handleBack = () => {
    if (currentMode === 'confirm' || currentMode === 'add') {
      router.back();
    } else {
      router.push('/procurement/goods-received-note');
    }
  }

  const calculateFinancialSummary = (): any => {
    const netAmount = (formData as any).items.reduce((sum: number, item: any) => sum + item.netAmount, 0);
    const taxAmount = (formData as any).items.reduce((sum: number, item: any) => sum + item.taxAmount, 0);
    const totalAmount = netAmount + taxAmount;
    const exchangeRate = (formData as any).exchangeRate || 1.2;
    const baseCurrency = (formData as any).baseCurrency || 'USD';

    return {
      id: (formData as any).financialSummary?.id || 'temp-summary-1',
      netAmount,
      taxAmount,
      totalAmount,
      currency: (formData as any).currency,
      baseNetAmount: netAmount * exchangeRate,
      baseTaxAmount: taxAmount * exchangeRate,
      baseTotalAmount: totalAmount * exchangeRate,
      baseCurrency: baseCurrency,
      jvType: 'GRN',
      jvNumber: `JV-${(formData as any).grnNumber}`,
      jvDate: (formData as any).receiptDate,
      jvDescription: (formData as any).description,
      jvStatus: 'Pending',
      jvReference: (formData as any).grnNumber,
      jvDetail: [],
      jvTotal: {
        debit: totalAmount,
        credit: totalAmount,
        baseDebit: totalAmount * exchangeRate,
        baseCredit: totalAmount * exchangeRate,
        baseCurrency: baseCurrency
      }
    };
  };

  const handleItemsChange = (newItems: GoodsReceiveNoteItem[]) => {
    if (!isReadOnly) {
      setFormData(prev => ({ ...prev, items: newItems }))
      setHasUnsavedChanges(true)
    }
  }


  const [isRightPanelOpen, setIsRightPanelOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" onClick={handleBack}>
            <ChevronLeft className="mr-2 h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">
            {currentMode === 'confirm' ? `Confirm New GRN (${formData.grnNumber})` :
              currentMode === 'add' ? 'New Goods Receive Note' :
              `Goods Receive Note (${formData.grnNumber})`}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {/* Utility Actions */}
          <Button variant="outline" size="sm" className="h-9">
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button variant="outline" size="sm" className="h-9">
            <Share className="mr-2 h-4 w-4" />
            Share
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-6 gap-6">
            <div className="space-y-2 col-span-1">
              <Label htmlFor="ref">Requisition</Label>
              <Input id="ref" readOnly value={formData.grnNumber} />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="date">Date</Label>
              <Input id="date" type="date" readOnly={isReadOnly} value={formData.receiptDate ? format(new Date(formData.receiptDate), 'yyyy-MM-dd') : ''} onChange={e => {
                setFormData({...formData, receiptDate: new Date(e.target.value)})
                setHasUnsavedChanges(true)
              }} />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="invoiceDate">Invoice Date</Label>
              <Input id="invoiceDate" type="date" readOnly={isReadOnly} value={formData.invoiceDate ? format(new Date(formData.invoiceDate), 'yyyy-MM-dd') : ''} onChange={e => {
                setFormData({...formData, invoiceDate: new Date(e.target.value)})
                setHasUnsavedChanges(true)
              }} />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="invoiceNumber">Invoice#</Label>
              <Input id="invoiceNumber" readOnly={isReadOnly} value={formData.invoiceNumber} onChange={e => {
                setFormData({...formData, invoiceNumber: e.target.value})
                setHasUnsavedChanges(true)
              }} />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="taxInvoiceDate">Tax Invoice Date</Label>
              <Input id="taxInvoiceDate" type="date" readOnly={isReadOnly} value={formData.invoiceDate ? format(new Date(formData.invoiceDate), 'yyyy-MM-dd') : ''} onChange={e => setFormData({...formData, invoiceDate: new Date(e.target.value)})}/>
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="taxInvoiceNumber">Tax Invoice#</Label>
              <Input id="taxInvoiceNumber" readOnly={isReadOnly} value={(formData as any).taxInvoiceNumber || ''} onChange={e => setFormData({...formData, taxInvoiceNumber: e.target.value} as any)} />
            </div>
            <div className="space-y-2 col-span-3">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" readOnly={isReadOnly} value={(formData as any).description} onChange={e => {
                setFormData({...formData, description: e.target.value} as any)
                setHasUnsavedChanges(true)
              }} />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="receiver">Receiver</Label>
              <Select disabled={isReadOnly} value={formData.receivedBy} onValueChange={(value) => {
                setFormData(prev => ({ ...prev, receivedBy: value }))
                setHasUnsavedChanges(true)
              }}>
                <SelectTrigger id="receiver">
                  <SelectValue placeholder="Select receiver" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="john_doe">John Doe</SelectItem>
                  <SelectItem value="jane_smith">Jane Smith</SelectItem>
                  <SelectItem value="mike_johnson">Mike Johnson</SelectItem>
                  <SelectItem value="emily_brown">Emily Brown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="vendor">Vendor</Label>
              {isReadOnly ? (
                <Input readOnly value={formData.vendorName} />
              ) : (
                <Select value={formData.vendorName} onValueChange={(value) => setFormData(prev => ({ ...prev, vendorName: value }))}>
                  <SelectTrigger id="vendor">
                    <SelectValue placeholder="Select vendor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global_fb">Global F&B Suppliers</SelectItem>
                    <SelectItem value="fresh_produce">Fresh Produce Co.</SelectItem>
                    <SelectItem value="quality_meats">Quality Meats Inc.</SelectItem>
                    <SelectItem value="beverage_world">Beverage World Ltd.</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            
            <div className="space-y-2 col-span-1">
              <Label htmlFor="currency">Currency</Label>
              {isReadOnly ? (
                <Input readOnly value={(formData as any).currency} />
              ) : (
                <Select value={(formData as any).currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value } as any))}>
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD</SelectItem>
                    <SelectItem value="eur">EUR</SelectItem>
                    <SelectItem value="gbp">GBP</SelectItem>
                    <SelectItem value="jpy">JPY</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="status">Status</Label>
              <Input readOnly value={formData.status} />
            </div>
            <div className="space-y-2 col-span-1">
              <Label htmlFor="cashBook">Cash Book</Label>
              <Select disabled={isReadOnly} value={(formData as any).cashBook} onValueChange={(value) => setFormData(prev => ({ ...prev, cashBook: value } as any))}>
                <SelectTrigger id="cashBook">
                  <SelectValue placeholder="Select cash book" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="main_account">Main Account</SelectItem>
                  <SelectItem value="petty_cash">Petty Cash</SelectItem>
                  <SelectItem value="food_beverage">Food & Beverage Account</SelectItem>
                  <SelectItem value="operations">Operations Account</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2 col-span-1">
              <Checkbox id="consignment" disabled={isReadOnly} checked={(formData as any).isConsignment} onCheckedChange={(checked) => setFormData({...formData, isConsignment: !!checked} as any)} />
              <Label htmlFor="consignment">Consignment</Label>
            </div>
            <div className="flex items-center space-x-2 col-span-1">
              <Checkbox id="cash" disabled={isReadOnly} checked={(formData as any).isCash} onCheckedChange={(checked) => setFormData({...formData, isCash: !!checked} as any)}/>
              <Label htmlFor="cash">Cash</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="items">
        <TabsList>
          <TabsTrigger value="items">Items</TabsTrigger>
          <TabsTrigger value="extra-costs">Extra Costs</TabsTrigger>
          <TabsTrigger value="stock-movement">Stock Movement</TabsTrigger>
          <TabsTrigger value="financial-summary">Financial Summary</TabsTrigger>
        </TabsList>
        <TabsContent value="items">
          <GRNItemsHierarchical
            mode={currentMode === 'confirm' ? 'view' : currentMode}
            items={(formData as any).items}
            onItemsChange={handleItemsChange}
            selectedItems={selectedItems}
            onItemSelect={handleItemSelection}
            exchangeRate={(formData as any).exchangeRate}
            baseCurrency={(formData as any).baseCurrency}
            currency={(formData as any).currency}
            bulkActions={
              !isReadOnly && selectedItems.length > 0 ? (
                <GoodsReceiveNoteItemsBulkActions
                  selectedItems={selectedItems}
                  onBulkAction={handleBulkAction}
                />
              ) : undefined
            }
          />
        </TabsContent>
        <TabsContent value="extra-costs">
          <ExtraCostsTab
            mode={currentMode === 'confirm' ? 'view' : currentMode}
            initialCosts={(formData as any).extraCosts}
            onCostsChange={handleExtraCostsChange}
          />
        </TabsContent>
        <TabsContent value="stock-movement">
          <StockMovementContent
            movements={(formData as any).stockMovements}
            items={(formData as any).items}
          />
        </TabsContent>
        <TabsContent value="financial-summary">
          <FinancialSummaryTab
            mode={currentMode === 'confirm' ? 'view' : currentMode}
            summary={(formData as any).financialSummary || calculateFinancialSummary()}
            currency={(formData as any).currency}
            baseCurrency={(formData as any).baseCurrency}
          />
        </TabsContent>
      </Tabs>

      {/* Transaction Summary */}
      <Card className="shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Transaction Summary ({(formData as any).currency || 'USD'})</CardTitle>
        </CardHeader>
        <CardContent className="pb-6">
          <SummaryTotal poData={formData} />
        </CardContent>
      </Card>

      {/* Form Footer for Standard Actions */}
      <FormFooter
        mode={currentMode}
        onSave={handleSave}
        onCancel={handleCancelEdit}
        onEdit={handleEditClick}
        isLoading={isLoading}
        hasChanges={hasUnsavedChanges}
        className="mt-6"
      >
        {currentMode !== 'view' && (
          <span className="text-sm text-muted-foreground">
            {hasUnsavedChanges ? 'You have unsaved changes' : 'No changes made'}
          </span>
        )}
      </FormFooter>

      {/* Floating Action Menu for Context-Specific Actions */}
      <FloatingActionMenu
        visible={currentMode === 'confirm' || (currentMode === 'view' && formData.status === GRNStatus.RECEIVED)}
        position="bottom-right"
        summary={{
          title: currentMode === 'confirm' ? 'Confirmation Required' : 'GRN Status',
          description: currentMode === 'confirm' 
            ? 'Review all details before saving' 
            : `Status: ${formData.status}`,
          metadata: currentMode === 'confirm' 
            ? `${(formData as any).items?.length || 0} items to process`
            : `Last updated: ${formData.receiptDate ? new Date(formData.receiptDate).toLocaleDateString() : 'N/A'}`
        }}
        actions={getFloatingActions()}
      />
    </div>
  )

  function getFloatingActions(): ActionItem[] {
    const actions: ActionItem[] = []

    if (currentMode === 'confirm') {
      actions.push(
        {
          id: 'edit-further',
          label: 'Edit Further',
          icon: PencilRuler,
          variant: 'outline',
          onClick: handleEditFurther,
          disabled: isLoading
        },
        {
          id: 'confirm-save',
          label: 'Confirm & Save',
          icon: CheckCheck,
          variant: 'default',
          onClick: handleConfirmAndSave,
          disabled: isLoading,
          className: 'bg-green-600 hover:bg-green-700'
        }
      )
    } else if (currentMode === 'view' && formData.status === GRNStatus.RECEIVED) {
      actions.push(
        {
          id: 'delete',
          label: 'Delete',
          icon: Trash2,
          variant: 'destructive',
          onClick: () => {
            if (confirm('Are you sure you want to delete this GRN?')) {
              console.log('Deleting GRN:', formData.id)
              router.push('/procurement/goods-received-note')
            }
          },
          disabled: isLoading
        },
        {
          id: 'send',
          label: 'Send',
          icon: Send,
          variant: 'default',
          onClick: () => {
            console.log('Sending GRN:', formData.id)
            alert('GRN sent successfully!')
          },
          disabled: isLoading,
          className: 'bg-blue-600 hover:bg-blue-700'
        }
      )
    }

    return actions
  }
}

export default GoodsReceiveNoteDetail;