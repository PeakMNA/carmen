"use client";

import React, { useState } from "react";
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
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  Package,
  Plus,
  Trash2,
  Download,
} from "lucide-react";
import { CreditNoteItem } from "../lib/groupItems";
import { cn } from "@/lib/utils";
import { CnLotApplication, FormCNItem } from "./cn-lot-application";

type CNDetailMode = "view" | "edit" | "add";

interface CNItemsHierarchicalProps {
  mode: CNDetailMode;
  items: CreditNoteItem[];
  onItemsChange: (items: CreditNoteItem[]) => void;
  currency: string;
  baseCurrency?: string;
}

export function CNItemsHierarchical({
  mode,
  items = [],
  onItemsChange,
  currency,
  baseCurrency = "THB",
}: CNItemsHierarchicalProps) {
  // Selected items for bulk actions
  const [selectedItems, setSelectedItems] = useState<(string | number)[]>([]);

  // Right-side panel state
  const [selectedItemForPanel, setSelectedItemForPanel] = useState<CreditNoteItem | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [panelMode, setPanelMode] = useState<"view" | "edit">("view");

  const isReadOnly = mode === "view";

  // Open side panel with item details
  const handleOpenPanel = (item: CreditNoteItem, editMode: boolean = false) => {
    setSelectedItemForPanel(item);
    setPanelMode(editMode && !isReadOnly ? "edit" : "view");
    setIsPanelOpen(true);
  };

  // Handle panel save
  const handlePanelSave = (updatedItem: FormCNItem) => {
    if (selectedItemForPanel) {
      const updatedItems = items.map((item) =>
        item.id === selectedItemForPanel.id ? { ...item, ...updatedItem } : item
      );
      onItemsChange(updatedItems);
    }
    setIsPanelOpen(false);
    setSelectedItemForPanel(null);
  };

  // Select/deselect item
  const handleItemSelect = (itemId: string | number, isSelected: boolean) => {
    if (isSelected) {
      setSelectedItems((prev) => [...prev, itemId]);
    } else {
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
    }
  };

  // Select/deselect all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(items.map((item) => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Bulk delete
  const handleBulkDelete = () => {
    const updatedItems = items.filter((item) => !selectedItems.includes(item.id));
    onItemsChange(updatedItems);
    setSelectedItems([]);
  };

  // Export selected (placeholder)
  const handleExportSelected = () => {
    console.log("Export selected items:", selectedItems);
  };

  const allSelected = items.length > 0 && selectedItems.length === items.length;
  const someSelected = selectedItems.length > 0 && selectedItems.length < items.length;

  // Format number
  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  if (items.length === 0) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Item Details</h3>
          {mode !== "view" && (
            <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
        </div>
        <div className="p-8 text-center text-gray-500 border rounded-lg">
          <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p>No items available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Bulk Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-medium">Item Details</h3>

          {/* Bulk Actions - inline */}
          {selectedItems.length > 0 && mode !== "view" && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedItems.length} item{selectedItems.length > 1 ? "s" : ""} selected:
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportSelected}
                className="h-8 text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Export Selected
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBulkDelete}
                className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected
              </Button>
            </div>
          )}
        </div>

        {mode !== "view" && (
          <Button size="sm" className="bg-blue-500 hover:bg-blue-600">
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        )}
      </div>

      {/* Items Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              {mode !== "view" && (
                <TableHead className="w-[40px] text-center">
                  <Checkbox
                    checked={allSelected}
                    ref={(ref) => {
                      if (ref) {
                        const inputElement = ref.querySelector("input");
                        if (inputElement) {
                          inputElement.indeterminate = someSelected;
                        }
                      }
                    }}
                    onCheckedChange={handleSelectAll}
                  />
                </TableHead>
              )}
              <TableHead className="font-medium text-muted-foreground">Location</TableHead>
              <TableHead className="font-medium text-muted-foreground min-w-[200px]">Product</TableHead>
              <TableHead className="font-medium text-muted-foreground text-right">Quantity</TableHead>
              <TableHead className="font-medium text-muted-foreground">Unit</TableHead>
              <TableHead className="font-medium text-muted-foreground">Currency</TableHead>
              <TableHead className="font-medium text-muted-foreground text-right">Price</TableHead>
              <TableHead className="font-medium text-muted-foreground text-right">Net Amount</TableHead>
              <TableHead className="font-medium text-muted-foreground text-right">Tax Amount</TableHead>
              <TableHead className="font-medium text-muted-foreground text-right">Total Amount</TableHead>
              <TableHead className="font-medium text-muted-foreground text-center w-[80px]">Detail</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {items.map((item) => (
              <React.Fragment key={item.id}>
                {/* Row 1: Transaction Currency (Primary) */}
                <TableRow
                  className={cn(
                    "group cursor-pointer border-0",
                    "hover:bg-blue-50/50",
                    selectedItemForPanel?.id === item.id && isPanelOpen && "bg-blue-50",
                    selectedItems.includes(item.id) && "bg-blue-50/30"
                  )}
                  onClick={() => handleOpenPanel(item)}
                >
                  {/* Checkbox */}
                  {mode !== "view" && (
                    <TableCell className="py-3 align-top text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => handleItemSelect(item.id, checked as boolean)}
                      />
                    </TableCell>
                  )}

                  {/* Location - Name */}
                  <TableCell className="py-3 align-top">
                    <div className="font-medium">{item.location.name}</div>
                  </TableCell>

                  {/* Product - Name */}
                  <TableCell className="py-3 align-top">
                    <div className="font-semibold">{item.product.name}</div>
                  </TableCell>

                  {/* Quantity - Primary */}
                  <TableCell className="py-3 text-right align-top">
                    <div>{formatNumber(item.quantity.primary)}</div>
                  </TableCell>

                  {/* Unit - Primary */}
                  <TableCell className="py-3 align-top">
                    <div>{item.unit.primary}</div>
                  </TableCell>

                  {/* Currency - Transaction */}
                  <TableCell className="py-3 align-top">
                    <div>{currency}</div>
                  </TableCell>

                  {/* Price - Primary */}
                  <TableCell className="py-3 text-right align-top">
                    <div>{formatNumber(item.price.unit)}</div>
                  </TableCell>

                  {/* Net Amount - Transaction */}
                  <TableCell className="py-3 text-right align-top">
                    <div>{formatNumber(item.amounts.net)}</div>
                  </TableCell>

                  {/* Tax Amount - Transaction */}
                  <TableCell className="py-3 text-right align-top">
                    <div>{formatNumber(item.amounts.tax)}</div>
                  </TableCell>

                  {/* Total Amount - Transaction */}
                  <TableCell className="py-3 text-right align-top">
                    <div>{formatNumber(item.amounts.total)}</div>
                  </TableCell>

                  {/* Detail */}
                  <TableCell className="py-3 align-top text-center" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleOpenPanel(item)}
                      className="h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Detail &gt;
                    </Button>
                  </TableCell>
                </TableRow>

                {/* Row 2: Base Currency (Secondary/Conversion) */}
                <TableRow
                  className={cn(
                    "cursor-pointer border-b",
                    "hover:bg-blue-50/50",
                    selectedItemForPanel?.id === item.id && isPanelOpen && "bg-blue-50",
                    selectedItems.includes(item.id) && "bg-blue-50/30"
                  )}
                  onClick={() => handleOpenPanel(item)}
                >
                  {/* Empty checkbox cell for row 2 */}
                  {mode !== "view" && (
                    <TableCell className="py-2 pt-0" />
                  )}

                  {/* Location - Code */}
                  <TableCell className="py-2 pt-0 text-muted-foreground text-sm">
                    {item.location.code}
                  </TableCell>

                  {/* Product - Description */}
                  <TableCell className="py-2 pt-0 text-muted-foreground text-sm">
                    {item.product.description || item.product.code}
                  </TableCell>

                  {/* Quantity - Secondary */}
                  <TableCell className="py-2 pt-0 text-right text-muted-foreground text-sm">
                    {formatNumber(item.quantity.secondary)}
                  </TableCell>

                  {/* Unit - Secondary */}
                  <TableCell className="py-2 pt-0 text-muted-foreground text-sm">
                    {item.unit.secondary}
                  </TableCell>

                  {/* Currency - Base */}
                  <TableCell className="py-2 pt-0 text-muted-foreground text-sm">
                    {baseCurrency}
                  </TableCell>

                  {/* Price - Secondary */}
                  <TableCell className="py-2 pt-0 text-right text-muted-foreground text-sm">
                    {formatNumber(item.price.secondary)}
                  </TableCell>

                  {/* Net Amount - Base Currency */}
                  <TableCell className="py-2 pt-0 text-right text-muted-foreground text-sm">
                    {formatNumber(item.amounts.baseNet)}
                  </TableCell>

                  {/* Tax Amount - Base Currency */}
                  <TableCell className="py-2 pt-0 text-right text-muted-foreground text-sm">
                    {formatNumber(item.amounts.baseTax)}
                  </TableCell>

                  {/* Total Amount - Base Currency */}
                  <TableCell className="py-2 pt-0 text-right text-muted-foreground text-sm">
                    {formatNumber(item.amounts.baseTotal)}
                  </TableCell>

                  {/* Empty Detail cell for row 2 */}
                  <TableCell className="py-2 pt-0" />
                </TableRow>
              </React.Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Right-side Detail Panel */}
      <Sheet open={isPanelOpen} onOpenChange={setIsPanelOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
          <CnLotApplication
            item={selectedItemForPanel}
            mode={panelMode}
            onSave={handlePanelSave}
            onClose={() => {
              setIsPanelOpen(false);
              setSelectedItemForPanel(null);
            }}
            onModeChange={(newMode) => setPanelMode(newMode as "view" | "edit")}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default CNItemsHierarchical;
