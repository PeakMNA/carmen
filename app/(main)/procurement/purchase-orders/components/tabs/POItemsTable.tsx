"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { FileText, Trash2, Plus, X } from "lucide-react";
import { PurchaseOrderItem } from "@/lib/types";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import POItemDetailForm from "./po-item-detail-form";
import { cn } from "@/lib/utils";

type Mode = "view" | "edit" | "add";

interface POItemsTableProps {
  mode: Mode;
  items: PurchaseOrderItem[];
  onItemsChange: (items: PurchaseOrderItem[]) => void;
  selectedItems: string[];
  onItemSelect: (itemId: string, isSelected: boolean) => void;
  exchangeRate: number;
  baseCurrency: string;
  currency: string;
  bulkActions?: React.ReactNode;
}

export function POItemsTable({
  mode,
  items = [],
  onItemsChange,
  selectedItems,
  onItemSelect,
  exchangeRate,
  baseCurrency,
  currency,
  bulkActions,
}: POItemsTableProps) {
  // Right sidebar panel state
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [sidebarMode, setSidebarMode] = useState<'view' | 'edit'>('view');

  // Legacy dialog state (kept for Add Item functionality)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [itemUnits, setItemUnits] = useState<Record<string, string>>({});

  // Only show base currency conversion when transaction currency differs from base
  const showBaseConversion = currency !== baseCurrency;

  useEffect(() => {
    const initialUnits: Record<string, string> = {};
    items.forEach(item => {
      initialUnits[item.id] = item.unit;
    });
    setItemUnits(initialUnits);
  }, [items]);

  // Sync sidebar mode when parent mode changes
  useEffect(() => {
    setSidebarMode(mode === 'edit' ? 'edit' : 'view');
  }, [mode]);

  // Get the selected item
  const selectedItem = items.find(item => item.id === selectedItemId);

  // Open sidebar with item details
  const handleOpenSidebar = (itemId: string) => {
    setSelectedItemId(itemId);
    setSidebarMode(mode === 'edit' ? 'edit' : 'view');
  };

  // Close sidebar
  const handleCloseSidebar = () => {
    setSelectedItemId(null);
  };

  const handleItemChange = (
    id: string,
    field: keyof PurchaseOrderItem | string,
    value: string | number | boolean
  ) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onItemsChange(updatedItems);
  };

  const handleUnitChange = (itemId: string, newUnit: string) => {
    setItemUnits(prev => ({ ...prev, [itemId]: newUnit }));
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, unit: newUnit } : item
    );
    onItemsChange(updatedItems);
  };

  const handleSelectAll = (checked: boolean) => {
    onItemSelect("", checked);
  };

  // Save item from sidebar panel
  const handleSaveSidebarItem = (updatedItem: any) => {
    if (!selectedItemId) return;
    const updatedItems = items.map((item) =>
      item.id === selectedItemId ? { ...item, ...updatedItem } : item
    );
    onItemsChange(updatedItems);
    // Switch back to view mode after save
    setSidebarMode('view');
  };
  const handleDeleteItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    onItemsChange(updatedItems);
  };

  const handleAddItem = (newItem: PurchaseOrderItem) => {
    onItemsChange([...items, newItem]);
    setIsAddDialogOpen(false);
  };

  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < items.length;

  // Format amount without currency symbol
  const formatAmount = (amount: number | any) => {
    const value = typeof amount === 'number' ? amount : (amount?.amount || 0);
    return value.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Calculate amounts
  const calculateSubtotal = (item: PurchaseOrderItem) => {
    const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : (item.unitPrice as any)?.amount || 0;
    return unitPrice * (item.orderedQuantity || 0);
  };

  const calculateDiscountAmount = (item: PurchaseOrderItem) => {
    const subtotal = calculateSubtotal(item);
    return subtotal * ((item.discount || 0) / 100);
  };

  const calculateNetAmount = (item: PurchaseOrderItem) => {
    return calculateSubtotal(item) - calculateDiscountAmount(item);
  };

  const calculateTaxAmount = (item: PurchaseOrderItem) => {
    const netAmount = calculateNetAmount(item);
    return netAmount * (item.taxRate || 0);
  };

  const calculateTotalAmount = (item: PurchaseOrderItem) => {
    return calculateNetAmount(item) + calculateTaxAmount(item);
  };

  // Status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
      case 'received':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
      case 'ordered':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'partial':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
      case 'rejected':
        return 'bg-red-100 text-red-600 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const numberCellClass = "text-right";

  // Placeholder unit options
  const unitOptions = ["Kg", "Pcs", "Box", "Pack", "L", "mL", "Set", "Unit", "Bag", "Carton", "Dozen"];

  // Handle request to switch sidebar to edit mode
  const handleSwitchToEdit = () => {
    setSidebarMode('edit');
  };

  // Handle mode change from sidebar
  const handleSidebarModeChange = (newMode: 'view' | 'edit' | 'add') => {
    // Filter out 'add' mode - sidebar only supports view/edit
    const effectiveMode = newMode === 'add' ? 'edit' : newMode;
    setSidebarMode(effectiveMode);
  };

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Item Details</h3>
          {mode !== 'view' && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl p-0">
                <POItemDetailForm
                  item={null as any}
                  mode="add"
                  currencyCode={currency}
                  baseCurrencyCode={baseCurrency}
                  exchangeRate={exchangeRate}
                  onSave={handleAddItem}
                  onClose={() => setIsAddDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
        <div className="text-center py-8 text-muted-foreground">
          No items available. Click "Add Item" to get started.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Item Details</h3>
        {mode !== 'view' && (
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-5xl p-0">
              <POItemDetailForm
                item={null as any}
                mode="add"
                currencyCode={currency}
                baseCurrencyCode={baseCurrency}
                exchangeRate={exchangeRate}
                onSave={handleAddItem}
                onClose={() => setIsAddDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Bulk Actions below Item Details heading */}
      {bulkActions && (
        <div className="mb-4">
          {bulkActions}
        </div>
      )}

      <Table>
        <TableHeader>
          {/* Single Header Row */}
          <TableRow className="align-top bg-muted/50 border-b-2 border-muted">
            {/* Checkbox */}
            <TableHead className="w-[40px] text-center align-top">
              <Checkbox
                checked={allSelected}
                ref={(ref) => {
                  if (ref) {
                    const inputElement = ref.querySelector('input');
                    if (inputElement) {
                      inputElement.indeterminate = someSelected;
                    }
                  }
                }}
                onCheckedChange={handleSelectAll}
                disabled={mode === "view"}
              />
            </TableHead>
            {/* Row # with expand indicator */}
            <TableHead className="w-[60px] text-center font-semibold align-top">#</TableHead>
            {/* Headers matching PO structure */}
            <TableHead className="align-top font-semibold min-w-[200px]">Product Name</TableHead>
            <TableHead className={`${numberCellClass} align-top font-semibold`}>Ordered Qty</TableHead>
            <TableHead className="align-top font-semibold">Unit</TableHead>
            <TableHead className={`${numberCellClass} align-top font-semibold`}>Received Qty</TableHead>
            <TableHead className={`${numberCellClass} align-top font-semibold`}>Remaining</TableHead>
            <TableHead className={`${numberCellClass} align-top font-semibold`}>Unit Price</TableHead>
            <TableHead className={`${numberCellClass} align-top font-semibold`}>Discount</TableHead>
            <TableHead className={`${numberCellClass} align-top font-semibold`}>Net Amount</TableHead>
            <TableHead className={`${numberCellClass} align-top font-semibold`}>Tax Amount</TableHead>
            <TableHead className={`${numberCellClass} align-top font-semibold`}>Total</TableHead>
            <TableHead className="align-top font-semibold">Status</TableHead>
            <TableHead className="align-top font-semibold text-center">Detail</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {items.map((item, index) => {
            const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : (item.unitPrice as any)?.amount || 0;
            const receivedQty = item.receivedQuantity || 0;
            const remainingQty = (item.orderedQuantity || 0) - receivedQty;
            const isSelected = selectedItemId === item.id;

            return (
              <TableRow
                key={item.id}
                className={cn(
                  "group transition-all duration-200 border-b border-gray-200 align-top",
                  "hover:bg-gray-50",
                  isSelected && "bg-blue-50 border-blue-200"
                )}
              >
                {/* Checkbox Cell */}
                <TableCell className="text-center py-3 align-top">
                  <Checkbox
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={(checked) =>
                      onItemSelect(item.id, checked as boolean)
                    }
                    disabled={mode === "view"}
                  />
                </TableCell>

                {/* Row # */}
                <TableCell className="py-2 text-center align-top">
                  <div className="text-sm font-medium text-gray-600">
                    {index + 1}
                  </div>
                </TableCell>

                {/* Product Name Cell */}
                <TableCell className="align-top">
                  <div className="flex items-start space-x-2">
                    <div className="space-y-1">
                      <div className="font-semibold text-sm">{item.itemName}</div>
                      <div className="text-xs text-muted-foreground line-clamp-1">
                        {item.description || "No description available"}
                      </div>
                      {/* Notes display */}
                      {(item as any).notes && (
                        <div className="flex items-start gap-1.5 mt-1.5 pt-1.5 border-t border-dashed border-gray-200">
                          <FileText className="h-3 w-3 text-blue-500 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-blue-600 line-clamp-2">
                            {(item as any).notes}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>

                {/* Ordered Qty Cell */}
                <TableCell className={`${numberCellClass} align-top`}>
                  {mode !== 'view' ? (
                    <Input
                      type="number"
                      value={item.orderedQuantity || 0}
                      onChange={(e) =>
                        handleItemChange(item.id, "orderedQuantity", parseFloat(e.target.value) || 0)
                      }
                      className="text-right h-8 w-20"
                    />
                  ) : (
                    <div>
                      <div className="font-medium">{item.orderedQuantity || 0}</div>
                      <div className="text-xs text-muted-foreground">
                        {((item.orderedQuantity || 0) * ((item as any).conversionRate || 1)).toFixed(2)} {(item as any).baseUnit || item.unit}
                      </div>
                    </div>
                  )}
                </TableCell>

                {/* Unit Cell */}
                <TableCell className="align-top">
                  {mode !== 'view' ? (
                    <Select
                      value={itemUnits[item.id] || item.unit}
                      onValueChange={(value) => handleUnitChange(item.id, value)}
                    >
                      <SelectTrigger className="h-8 text-sm w-20">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {!unitOptions.includes(item.unit) && <SelectItem value={item.unit}>{item.unit}</SelectItem>}
                        {unitOptions.map((unit) => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="text-sm">{item.unit}</div>
                  )}
                </TableCell>

                {/* Received Qty Cell */}
                <TableCell className={`${numberCellClass} align-top`}>
                  <div>
                    <div className="font-medium">{receivedQty}</div>
                    <div className="text-xs text-muted-foreground">
                      {(receivedQty * ((item as any).conversionRate || 1)).toFixed(2)} {(item as any).baseUnit || item.unit}
                    </div>
                  </div>
                </TableCell>

                {/* Remaining Qty Cell */}
                <TableCell className={`${numberCellClass} align-top`}>
                  <div>
                    <div className={cn(
                      "font-medium",
                      remainingQty > 0 && "text-amber-600",
                      remainingQty === 0 && "text-green-600"
                    )}>
                      {remainingQty}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {(remainingQty * ((item as any).conversionRate || 1)).toFixed(2)} {(item as any).baseUnit || item.unit}
                    </div>
                  </div>
                </TableCell>

                {/* Unit Price Cell */}
                <TableCell className={`${numberCellClass} align-top`}>
                  <div>
                    <div className="font-medium">{formatAmount(unitPrice)}</div>
                    <div className="text-xs text-muted-foreground">{currency}</div>
                    {showBaseConversion && (
                      <div className="text-xs text-muted-foreground">{baseCurrency} {formatAmount(unitPrice * exchangeRate)}</div>
                    )}
                  </div>
                </TableCell>

                {/* Discount Cell */}
                <TableCell className={`${numberCellClass} align-top`}>
                  <div>
                    <div className="font-medium">{item.discount ? `${item.discount}%` : '-'}</div>
                    {item.discount ? (
                      <>
                        <div className="text-xs text-muted-foreground">
                          -{currency} {formatAmount(calculateDiscountAmount(item))}
                        </div>
                        {showBaseConversion && (
                          <div className="text-xs text-muted-foreground">
                            -{baseCurrency} {formatAmount(calculateDiscountAmount(item) * exchangeRate)}
                          </div>
                        )}
                      </>
                    ) : null}
                  </div>
                </TableCell>

                {/* Net Amount Cell */}
                <TableCell className={`${numberCellClass} align-top`}>
                  <div>
                    <div className="font-medium">{formatAmount(calculateNetAmount(item))}</div>
                    {showBaseConversion && (
                      <div className="text-xs text-muted-foreground">{baseCurrency} {formatAmount(calculateNetAmount(item) * exchangeRate)}</div>
                    )}
                  </div>
                </TableCell>

                {/* Tax Amount Cell */}
                <TableCell className={`${numberCellClass} align-top`}>
                  <div>
                    <div className="font-medium">{formatAmount(calculateTaxAmount(item))}</div>
                    {item.taxRate ? (
                      <div className="text-xs text-muted-foreground">{(item.taxRate * 100).toFixed(0)}%</div>
                    ) : null}
                    {showBaseConversion && (
                      <div className="text-xs text-muted-foreground">+{baseCurrency} {formatAmount(calculateTaxAmount(item) * exchangeRate)}</div>
                    )}
                  </div>
                </TableCell>

                {/* Total Amount Cell */}
                <TableCell className={`${numberCellClass} align-top`}>
                  <div>
                    <div className="font-semibold text-blue-600">{formatAmount(calculateTotalAmount(item))}</div>
                    {showBaseConversion && (
                      <div className="text-xs text-muted-foreground">{baseCurrency} {formatAmount(calculateTotalAmount(item) * exchangeRate)}</div>
                    )}
                  </div>
                </TableCell>

                {/* Status Cell */}
                <TableCell className="align-top">
                  <Badge className={cn("text-xs", getStatusBadgeClass(item.status || 'Ordered'))}>
                    {item.status || 'Ordered'}
                  </Badge>
                </TableCell>

                {/* Detail Cell */}
                <TableCell className="align-top text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenSidebar(item.id)}
                    className="h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    Detail &gt;
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>

      {/* Right Sidebar Panel for Item Details */}
      <Sheet open={!!selectedItemId} onOpenChange={(open) => !open && handleCloseSidebar()}>
        <SheetContent className="w-[600px] sm:w-[700px] sm:max-w-[700px] overflow-y-auto">
          <SheetHeader className="flex flex-row items-center justify-between pb-4 border-b">
            <SheetTitle className="text-lg font-semibold">
              Item Details
            </SheetTitle>
          </SheetHeader>
          {selectedItem && (
            <div className="mt-4">
              <POItemDetailForm
                item={selectedItem as any}
                mode={sidebarMode}
                currencyCode={currency}
                baseCurrencyCode={baseCurrency}
                exchangeRate={exchangeRate}
                onSave={handleSaveSidebarItem}
                onClose={handleCloseSidebar}
                onRequestEdit={handleSwitchToEdit}
                onModeChange={handleSidebarModeChange}
                isEmbedded={false}
                onFieldChange={(updatedItem) => {
                  // Auto-update items when fields change
                  const updatedItems = items.map(i =>
                    i.id === selectedItemId ? { ...i, ...updatedItem } : i
                  );
                  onItemsChange(updatedItems);
                }}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default POItemsTable;
