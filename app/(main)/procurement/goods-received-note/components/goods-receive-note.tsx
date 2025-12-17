/**
 * Goods Receive Note Component
 *
 * Main component for creating and managing Goods Received Notes with
 * location-type aware processing.
 *
 * LOCATION TYPE HANDLING FOR GRN:
 *
 * 1. INVENTORY Locations (Standard Receiving):
 *    - Creates FIFO cost layer with lot tracking
 *    - Updates inventory asset balance
 *    - GL: Debit Inventory Asset, Credit Accounts Payable
 *    - Full stock movement recorded
 *
 * 2. DIRECT Locations (Immediate Expense):
 *    - NO stock balance update (items expensed on receipt)
 *    - NO lot tracking or cost layers created
 *    - GL: Debit Expense Account, Credit Accounts Payable
 *    - No stock movement recorded
 *
 * 3. CONSIGNMENT Locations (Vendor-Owned):
 *    - Creates consignment stock layer
 *    - Vendor liability tracking (not company asset until consumption)
 *    - GL: Debit Consignment Asset, Credit Vendor Liability
 *    - Full stock movement with vendor ownership indicator
 *
 * The isConsignment flag in the GRN form enables vendor-owned processing
 * for the entire GRN, changing how all items are handled.
 */

"use client";

import * as React from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip, 
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronLeft, ChevronUp, HelpCircle, ChevronDown, PlusCircle, Plus, Edit, Trash2, X, Printer, CheckSquare, Save, ChevronRight, CalendarIcon, PanelRightClose, PanelRightOpen, Download, Share, Send, Archive, TagIcon, UserIcon, BuildingIcon, DollarSign as DollarSignIcon, TrendingUp as TrendingUpIcon, CreditCard as CreditCardIcon, FileText as FileTextIcon } from "lucide-react";
import {
  GoodsReceiveNote,
  GoodsReceiveNoteItem,
  GRNStatus,
} from "@/lib/types";
import { GoodsReceiveNoteItems } from "./tabs/GoodsReceiveNoteItems";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExtraCostsTab } from "./tabs/ExtraCostsTab";
import { StockMovementTab } from "./tabs/StockMovementTab";
import { FinancialSummaryTab } from "./tabs/FinancialSummaryTab";
import { BulkActions } from "./tabs/BulkActions";
import { GoodsReceiveNoteItemsBulkActions } from "./tabs/GoodsReceiveNoteItemsBulkActions";
import StatusBadge from "@/components/ui/custom-status-badge";
import { useState, FC } from "react";
import SummaryTotal from "./SummaryTotal";
import { ModernTransactionSummary } from '@/components/ui/modern-transaction-summary';
import ItemDetailForm  from "./tabs/itemDetailForm";
import { TaxTab } from "./tabs/TaxTab";
import { ActivityLogTab } from "./tabs/ActivityLogTab";
import { FormFooter, ActionItem } from '@/components/ui/form-footer';
import CommentsAttachmentsTab from "./tabs/CommentsAttachmentsTab";
import StockMovementContent from "./tabs/stock-movement";
import { GoodsReceiveNoteDetail, GRNDetailMode } from "./GoodsReceiveNoteDetail";
import { RelatedPOList } from "./tabs/RelatedPOList";

interface GoodsReceiveNoteComponentProps {
  initialData: GoodsReceiveNote;
}

export function GoodsReceiveNoteComponent({
  initialData,
}: GoodsReceiveNoteComponentProps) {
  console.log('[GRNComponent] *** Component Render/Mount ***');
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  
  const id = params.id as string;
  const modeParam = searchParams?.get('mode') as GRNDetailMode | null;

  const determineInitialMode = (): GRNDetailMode => {
    if (id?.startsWith('new-')) {
        console.log('[GRNComponent] Detected new ID, setting initial mode to add');
        return 'add';
    }
    const validMode = modeParam && ['view', 'edit', 'add'].includes(modeParam) ? modeParam : 'view';
    console.log('[GRNComponent] Determined initial mode from modeParam:', validMode);
    return validMode;
  };

  const [internalMode, setInternalMode] = React.useState<GRNDetailMode>(determineInitialMode);
  console.log('[GRNComponent] Initialized internal mode state:', internalMode);
  
  const [formData, setFormData] = React.useState<GoodsReceiveNote>(() => ({
    ...initialData,
    date: new Date((initialData as any).date || initialData.receiptDate),
    invoiceDate: initialData.invoiceDate ? new Date(initialData.invoiceDate) : new Date(),
    taxInvoiceDate: (initialData as any).taxInvoiceDate
      ? new Date((initialData as any).taxInvoiceDate)
      : undefined,
  } as any));
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false)
  const [selectedItems, setSelectedItems] = React.useState<string[]>([]);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Extract unique Purchase Order References from items
  const relatedPurchaseOrderRefs = React.useMemo(() => {
      if (!(formData as any)?.items) return [];
      const refs = (formData as any).items
          .map((item: any) => item.purchaseOrderRef)
          .filter((ref: any, index: number, self: any[]) => ref && self.indexOf(ref) === index); // Filter out empty/null and get unique
      return refs;
  }, [(formData as any)?.items]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    if (type === "date") {
      setFormData((prev) => ({
        ...prev,
        [name]: value ? new Date(value) : undefined,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    setHasUnsavedChanges(true);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log("Saving data:", formData);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setHasUnsavedChanges(false);
      setInternalMode("view");
    } catch (error) {
      console.error('Error saving GRN:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(initialData);
    setHasUnsavedChanges(false);
    setInternalMode("view");
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this GRN? This action cannot be undone.')) {
      console.log('Deleting GRN:', formData.id);
      // Simulate delete operation
      alert('GRN deleted successfully!');
      router.push('/procurement/goods-received-note');
    }
  };

  const handleSend = () => {
    console.log('Sending GRN:', formData.id);
    alert('GRN sent successfully!');
  };

  const handleArchive = () => {
    console.log('Archiving GRN:', formData.id);
    alert('GRN archived successfully!');
  };

  const isEditable = internalMode === "edit" || internalMode === "add";
  console.log('[GRNComponent] Calculated isEditable:', isEditable, '(based on internalMode:', internalMode, ')');
  const isConfirming = internalMode === "confirm";
  const isViewing = internalMode === "view";

  const handleItemsChange = (updatedItems: GoodsReceiveNoteItem[]) => {
    setFormData((prev) => ({ ...prev, items: updatedItems }));
    setHasUnsavedChanges(true);
  };

  const handleItemSelect = (itemId: string, isSelected: boolean) => {
    if (itemId === "") {
      // Handle select all case
      if (isSelected) {
        // Select all items
        setSelectedItems((formData as any).items?.map((item: any) => item.id) || []);
      } else {
        // Deselect all items
        setSelectedItems([]);
      }
    } else {
      // Handle individual item selection
      setSelectedItems((prev) =>
        isSelected ? [...prev, itemId] : prev.filter((id) => id !== itemId)
      );
    }
  };

  const handleBulkAction = (action: string) => {
    console.log(`Applying ${action} to items:`, selectedItems);

    switch (action) {
      case "delete":
        setFormData((prev) => ({
          ...prev,
          items: (prev as any).items?.filter((item: any) => !selectedItems.includes(item.id)) || [],
        } as any));
        break;
      
      case "changeQuantity":
        // TODO: Implement bulk quantity change dialog
        console.log("Bulk quantity change for items:", selectedItems);
        break;
      
      case "changePrice":
        // TODO: Implement bulk price change dialog
        console.log("Bulk price change for items:", selectedItems);
        break;
      
      default:
        console.log(`Unknown bulk action: ${action}`);
    }
    
    setSelectedItems([]);
  };

  const calculateTotals = () => {
    const subtotal = ((formData as any).items || []).reduce(
      (sum: number, item: any) => sum + item.subTotalAmount,
      0
    );
    const taxTotal = ((formData as any).items || []).reduce(
      (sum: number, item: any) => sum + item.taxAmount,
      0
    );
    const extraCostsTotal = ((formData as any).extraCosts || []).reduce(
      (sum: number, cost: any) => sum + cost.amount,
      0
    );
    const grandTotal = subtotal + taxTotal + extraCostsTotal;

    return { subtotal, taxTotal, extraCostsTotal, grandTotal };
  };

  const calculateDocumentTotals = () => {
    const netAmount = ((formData as any).items || []).reduce((sum: number, item: any) => sum + item.netAmount, 0);
    const taxAmount = ((formData as any).items || []).reduce((sum: number, item: any) => sum + item.taxAmount, 0);
    const totalAmount = netAmount + taxAmount;

    return {
      currency: {
        netAmount,
        taxAmount,
        totalAmount,
      },
      baseCurrency: {
        netAmount: netAmount * ((formData as any).exchangeRate || 1),
        taxAmount: taxAmount * ((formData as any).exchangeRate || 1),
        totalAmount: totalAmount * ((formData as any).exchangeRate || 1),
      },
    };
  };

  const documentTotals = calculateDocumentTotals();

  const totals = calculateTotals();

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleGoBack = () => {
    router.back();
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const childMode: GRNDetailMode = internalMode as GRNDetailMode;

  // Additional actions for view mode
  const getAdditionalActions = (): ActionItem[] => {
    if (internalMode !== 'view') return [];
    
    const actions: ActionItem[] = [];
    
    // Add Send action for received GRNs
    if (formData.status === GRNStatus.RECEIVED) {
      actions.push({
        id: 'send',
        label: 'Send',
        icon: Send,
        variant: 'outline',
        onClick: handleSend,
        disabled: isLoading
      });
    }

    // Add Archive action
    actions.push({
      id: 'archive',
      label: 'Archive',
      icon: Archive,
      variant: 'outline',
      onClick: handleArchive,
      disabled: isLoading
    });

    // Add Delete action (destructive)
    actions.push({
      id: 'delete',
      label: 'Delete',
      icon: Trash2,
      variant: 'destructive',
      onClick: handleDelete,
      disabled: isLoading
    });

    return actions;
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
        <div className={`flex-grow space-y-4 ${isSidebarVisible ? 'lg:w-3/4' : 'w-full'}`}>
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="pb-4 border-b bg-muted/10">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 rounded-full p-0 mr-1"
                      onClick={handleGoBack}
                    >
                      <ChevronLeft className="h-5 w-5" />
                      <span className="sr-only">Back to Goods Receive Notes</span>
                    </Button>
                    <div className="flex flex-col">
                      <h1 className="text-2xl font-bold">
                        {formData.grnNumber || "Goods Receive Note"}
                      </h1>
                      <p className="text-sm text-muted-foreground mt-1">Goods Receive Note</p>
                    </div>
                    <StatusBadge status={formData.status} className="h-6" />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {/* Mode-based Actions */}
                  {internalMode === "view" ? (
                    <>
                      <Button 
                        onClick={() => setInternalMode("edit")} 
                        size="sm" 
                        className="h-9"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleDelete} 
                        size="sm" 
                        className="h-9 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                        disabled={isLoading}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        onClick={handleSave} 
                        size="sm" 
                        className="h-9"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Save className="mr-2 h-4 w-4" />
                        ) : (
                          <CheckSquare className="mr-2 h-4 w-4" />
                        )}
                        Save
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={handleCancel} 
                        size="sm" 
                        className="h-9"
                        disabled={isLoading}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </>
                  )}
                  
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
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleSidebar}
                          className="h-9 w-9 p-0"
                        >
                          {isSidebarVisible ? (
                            <PanelRightClose className="h-4 w-4" />
                          ) : (
                            <PanelRightOpen className="h-4 w-4" />
                          )}
                          <span className="sr-only">Toggle sidebar</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>
            
            {/* Main Content */}
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Main Details */}
                <div className="space-y-6">
                  {/* Main Details Grid - Date, GRN#, Vendor, Invoice# */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date" className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        Date
                      </Label>
                      {isEditable ? (
                        <Input
                          id="date"
                          name="date"
                          type="date"
                          value={formData.receiptDate ? new Date(formData.receiptDate).toISOString().split("T")[0] : ''}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      ) : (
                        <div className="text-gray-900 font-medium">
                          {formData.receiptDate ? new Date(formData.receiptDate).toLocaleDateString('en-GB') : 'N/A'}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="ref" className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                        <TagIcon className="h-4 w-4" />
                        GRN #
                      </Label>
                      {isEditable ? (
                        <Input
                          id="ref"
                          name="ref"
                          value={formData.grnNumber}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      ) : (
                        <div className="text-gray-900 font-medium">{formData.grnNumber}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="vendor" className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                        <UserIcon className="h-4 w-4" />
                        Vendor
                      </Label>
                      {isEditable ? (
                        <Select
                          value={formData.vendorName || undefined}
                          onValueChange={(value) => handleSelectChange("vendor", value)}
                        >
                          <SelectTrigger id="vendor" className="w-full">
                            <SelectValue placeholder="Select vendor" />
                          </SelectTrigger>
                          <SelectContent>
                            {formData.vendorName ? (
                              <SelectItem value={formData.vendorName}>
                                {formData.vendorName}
                              </SelectItem>
                            ) : (
                              <SelectItem value="no-vendor">No vendor selected</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-gray-900 font-medium">{formData.vendorName || "Not specified"}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoice" className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                        <BuildingIcon className="h-4 w-4" />
                        Invoice #
                      </Label>
                      {isEditable ? (
                        <Input
                          id="invoice"
                          name="invoiceNumber"
                          value={formData.invoiceNumber}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      ) : (
                        <div className="text-gray-900 font-medium">{formData.invoiceNumber || "Not specified"}</div>
                      )}
                    </div>
                  </div>

                  {/* Secondary Details Grid - Invoice Date, Currency, Exchange Rate, Credit Terms */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="invoice-date" className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        Invoice Date
                      </Label>
                      {isEditable ? (
                        <Input
                          id="invoice-date"
                          name="invoiceDate"
                          type="date"
                          value={formData.invoiceDate?.toISOString().split("T")[0] || ''}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      ) : (
                        <div className="text-gray-900 font-medium">
                          {formData.invoiceDate?.toLocaleDateString('en-GB') || 'N/A'}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency" className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                        <DollarSignIcon className="h-4 w-4" />
                        Currency
                      </Label>
                      {isEditable ? (
                        <Select
                          value={(formData as any).currency || undefined}
                          onValueChange={(value) => handleSelectChange("currency", value)}
                        >
                          <SelectTrigger id="currency" className="w-full">
                            <SelectValue placeholder="Select currency" />
                          </SelectTrigger>
                          <SelectContent>
                            {(formData as any).currency ? (
                              <SelectItem value={(formData as any).currency}>
                                {(formData as any).currency}
                              </SelectItem>
                            ) : (
                              <SelectItem value="no-currency">No currency selected</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-gray-900 font-medium">{(formData as any).currency || ""}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="exchangeRate" className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                        <TrendingUpIcon className="h-4 w-4" />
                        Exchange Rate
                      </Label>
                      {isEditable ? (
                        <Input
                          id="exchangeRate"
                          name="exchangeRate"
                          type="number"
                          value={(formData as any).exchangeRate}
                          onChange={handleInputChange}
                          className="w-full"
                          step="0.0001"
                          min="0"
                        />
                      ) : (
                        <div className="text-gray-900 font-medium">{(formData as any).exchangeRate || "1"}</div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="creditTerms" className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                        <CreditCardIcon className="h-4 w-4" />
                        Credit Terms
                      </Label>
                      {isEditable ? (
                        <Select 
                          defaultValue="net30"
                          onValueChange={(value) => handleSelectChange("creditTerms", value)}
                        >
                          <SelectTrigger id="creditTerms" className="w-full">
                            <SelectValue placeholder="Select credit terms" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="net30">Net 30</SelectItem>
                            <SelectItem value="net60">Net 60</SelectItem>
                            <SelectItem value="net90">Net 90</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-gray-900 font-medium">Net 30</div>
                      )}
                    </div>
                  </div>

                  {/* Third row - Description and Due Date */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
                        <FileTextIcon className="h-4 w-4" />
                        Description
                      </Label>
                      {isEditable ? (
                        <Textarea 
                          name="description"
                          value={(formData as any).description || ""}
                          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                          className="w-full h-20"
                          placeholder="Add goods receive note description..."
                        />
                      ) : (
                        <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-md min-h-[60px]">
                          {(formData as any).description || "No description"}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate" className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        Due Date
                      </Label>
                      {isEditable ? (
                        <Input 
                          id="dueDate" 
                          name="dueDate"
                          type="date" 
                          value={(formData as any).dueDate ? (formData as any).dueDate.toISOString().split('T')[0] : ''}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      ) : (
                        <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-md min-h-[60px] flex items-center">
                          {(formData as any).dueDate ? (formData as any).dueDate.toLocaleDateString('en-GB') : "No due date set"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Options - Consignment and Cash checkboxes
                      CONSIGNMENT CHECKBOX BEHAVIOR:
                      When enabled, all items in this GRN are treated as vendor-owned:
                      - Stock is tracked but remains vendor's property
                      - Vendor liability created instead of accounts payable
                      - Items expensed only when consumed/issued
                      - Different GL posting compared to standard receiving
                  */}
                  <div className="flex items-center gap-8 pt-4 border-t border-gray-200">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="consignment"
                              checked={(formData as any).isConsignment}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange("isConsignment", checked as boolean)
                              }
                              disabled={!isEditable}
                            />
                            <Label
                              htmlFor="consignment"
                              className="text-sm font-medium flex items-center"
                            >
                              Consignment
                              <HelpCircle className="w-4 h-4 ml-1" />
                            </Label>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <p className="font-medium">Vendor-Owned Inventory</p>
                          <p className="text-xs mt-1">
                            Items remain vendor property until consumption.
                            Creates vendor liability instead of accounts payable.
                            Stock is tracked but not recognized as company asset.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cash"
                        checked={(formData as any).isCash}
                        onCheckedChange={(checked) =>
                          handleCheckboxChange("isCash", checked as boolean)
                        }
                        disabled={!isEditable}
                      />
                      <Label htmlFor="cash" className="text-sm font-medium">
                        Cash
                      </Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Tabs defaultValue="items" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="items">Items</TabsTrigger>
                  <TabsTrigger value="stock-movements">Stock Movements</TabsTrigger>
                  <TabsTrigger value="extra-costs">Extra Costs</TabsTrigger>
                  <TabsTrigger value="related-po">Related POs</TabsTrigger>
                  <TabsTrigger value="financials">Financials</TabsTrigger>
                </TabsList>
                <TabsContent value="items" className="mt-4">
                  <GoodsReceiveNoteItems
                    mode={childMode}
                    items={(formData as any).items || [] || []}
                    onItemsChange={handleItemsChange}
                    selectedItems={selectedItems}
                    onItemSelect={handleItemSelect}
                    exchangeRate={(formData as any).exchangeRate || 1}
                    baseCurrency={(formData as any).baseCurrency || ''}
                    currency={(formData as any).currency || ''}
                    bulkActions={selectedItems.length > 0 && (
                      <GoodsReceiveNoteItemsBulkActions
                        selectedItems={selectedItems}
                        onBulkAction={handleBulkAction}
                      />
                    )}
                  />
                </TabsContent>
                <TabsContent value="stock-movements" className="mt-4">
                  <StockMovementContent/>
                </TabsContent>
                <TabsContent value="extra-costs" className="mt-4">
                  <ExtraCostsTab
                     mode={childMode}
                     initialCosts={(formData as any).extraCosts || []}
                     onCostsChange={(newCosts) => {
                       setFormData((prev) => ({
                         ...prev,
                         extraCosts: newCosts,
                       }));
                     }}
                 />
                </TabsContent>
                <TabsContent value="related-po" className="mt-4">
                  <RelatedPOList poRefs={relatedPurchaseOrderRefs} />
                </TabsContent>
                <TabsContent value="financials" className="mt-4">
                  <FinancialSummaryTab
                    mode={childMode}
                    summary={(formData as any).financialSummary || null}
                    currency={(formData as any).currency}
                    baseCurrency={(formData as any).baseCurrency}
                  />
                  <TaxTab
                     mode={childMode}
                     taxInvoiceNumber={(formData as any).taxInvoiceNumber}
                     taxInvoiceDate={(formData as any).taxInvoiceDate}
                     onTaxInvoiceChange={(field, value) => {
                       setFormData(prev => ({ ...prev, [field]: value }));
                     }}
                     documentTotals={documentTotals}
                     currency={(formData as any).currency}
                     baseCurrency={(formData as any).baseCurrency}
                   />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>
                Transaction Summary ({(formData as any).currency || 'USD'}
                {(formData as any).baseCurrency && (formData as any).baseCurrency !== (formData as any).currency && 
                  ` / ${(formData as any).baseCurrency}`
                })
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ModernTransactionSummary
                subtotal={(formData as any).subTotalPrice || 0}
                discount={(formData as any).discountAmount || 0}
                netAmount={(formData as any).netAmount || 0}
                tax={(formData as any).taxAmount || 0}
                totalAmount={(formData as any).totalAmount || 0}
                currency={(formData as any).currency || 'USD'}
                baseCurrency={(formData as any).baseCurrency}
                exchangeRate={(formData as any).exchangeRate || 1}
              />
            </CardContent>
          </Card>
        </div>

        <div className={`space-y-4 ${isSidebarVisible ? 'lg:w-1/4' : 'w-0 opacity-0 overflow-hidden'} transition-all duration-300`}>
          <Card>
            <CardHeader>
              <CardTitle>Comments & Attachments</CardTitle>
            </CardHeader>
            <CardContent>
              <CommentsAttachmentsTab poData={formData} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity Log</CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityLogTab activityLog={(formData as any).activityLog} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Form Footer for Standard Actions */}
      <FormFooter
        mode={internalMode}
        onSave={handleSave}
        onCancel={handleCancel}
        onEdit={() => setInternalMode("edit")}
        onDelete={handleDelete}
        additionalActions={getAdditionalActions()}
        isLoading={isLoading}
        hasChanges={hasUnsavedChanges}
        className="mt-6"
      >
        {internalMode !== 'view' && (
          <span className="text-sm text-muted-foreground">
            {hasUnsavedChanges ? 'You have unsaved changes' : 'No changes made'}
          </span>
        )}
      </FormFooter>

    </div>
  );
}