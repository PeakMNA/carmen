"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Trash2, FileText } from "lucide-react";
import { PurchaseOrderItem } from "@/lib/types";
import { POItemsTable } from "./POItemsTable";

interface EnhancedItemsTabProps {
  poData: {
    items: PurchaseOrderItem[];
    currencyCode?: string;
    baseCurrencyCode?: string;
    exchangeRate?: number;
  };
  onUpdateItem: (item: PurchaseOrderItem) => void;
  onAddItem: (item: PurchaseOrderItem) => void;
  onDeleteItem: (itemId: string) => void;
  editable?: boolean;
}

export default function EnhancedItemsTab({
  poData,
  onUpdateItem,
  onAddItem,
  onDeleteItem,
  editable = true,
}: EnhancedItemsTabProps) {
  // State management
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const items = poData?.items || [];
    const totalItems = items.length;
    const totalValue = items.reduce((sum, item) => {
      const unitPriceValue = typeof item.unitPrice === 'object' && item.unitPrice !== null
        ? (item.unitPrice as any).amount || 0
        : (item.unitPrice as any) || 0;

      const lineTotal = (item.orderedQuantity || 0) * unitPriceValue;
      const taxAmountValue = item.taxAmount
        ? (typeof item.taxAmount === 'object' && item.taxAmount !== null
            ? (item.taxAmount as any).amount || 0
            : (item.taxAmount as any) || 0)
        : lineTotal * (item.taxRate || 0);
      const discountAmountValue = item.discountAmount
        ? (typeof item.discountAmount === 'object' && item.discountAmount !== null
            ? (item.discountAmount as any).amount || 0
            : (item.discountAmount as any) || 0)
        : lineTotal * ((item.discount || 0) / 100);

      return sum + (lineTotal + taxAmountValue - discountAmountValue);
    }, 0);

    const statusCounts = items.reduce((acc, item) => {
      const status = item.status || 'Ordered';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalOrdered = items.reduce((sum, item) => sum + (item.orderedQuantity || 0), 0);
    const totalReceived = items.reduce((sum, item) => sum + (item.receivedQuantity || 0), 0);

    return {
      totalItems,
      totalValue,
      statusCounts,
      selectedCount: selectedItems.length,
      totalOrdered,
      totalReceived,
    };
  }, [poData?.items, selectedItems]);

  // Event handlers
  const handleItemSelect = (itemId: string, isSelected: boolean) => {
    if (itemId === "") {
      // Select all / deselect all
      if (isSelected) {
        setSelectedItems(poData?.items?.map(item => item.id) || []);
      } else {
        setSelectedItems([]);
      }
    } else {
      setSelectedItems(prev =>
        isSelected
          ? [...prev, itemId]
          : prev.filter(id => id !== itemId)
      );
    }
  };

  const handleItemsChange = (updatedItems: PurchaseOrderItem[]) => {
    // Find changed items and update them
    const originalItems = poData?.items || [];

    // Check for deleted items
    const deletedIds = originalItems
      .filter(orig => !updatedItems.find(updated => updated.id === orig.id))
      .map(item => item.id);

    deletedIds.forEach(id => onDeleteItem(id));

    // Check for added items
    const addedItems = updatedItems.filter(
      updated => !originalItems.find(orig => orig.id === updated.id)
    );

    addedItems.forEach(item => onAddItem(item));

    // Check for updated items
    updatedItems.forEach(updated => {
      const original = originalItems.find(orig => orig.id === updated.id);
      if (original && JSON.stringify(original) !== JSON.stringify(updated)) {
        onUpdateItem(updated);
      }
    });
  };

  const handleBulkAction = (action: string) => {
    switch (action) {
      case 'delete':
        selectedItems.forEach(itemId => onDeleteItem(itemId));
        setSelectedItems([]);
        break;
      default:
        console.log(`Unknown bulk action: ${action}`);
    }
  };

  // Bulk actions component
  const bulkActionsComponent = selectedItems.length > 0 ? (
    <Card className="p-3 bg-white border-gray-200">
      <div className="flex items-center space-x-4">
        <span className="text-xs font-medium">
          {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected:
        </span>

        <div className="flex items-center space-x-2">
          <Button
            size="sm"
            variant="outline"
            className="h-6 px-2 text-xs"
            onClick={() => handleBulkAction('export')}
          >
            <FileText className="h-3 w-3 mr-1" />
            Export Selected
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleBulkAction('delete')}
            className="h-6 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3 mr-1" />
            Delete Selected
          </Button>
        </div>
      </div>
    </Card>
  ) : null;

  return (
    <div className="space-y-4 w-full bg-white dark:bg-gray-800">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 p-4 bg-gray-50 rounded-lg border">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{summaryStats.totalItems}</div>
          <div className="text-xs text-muted-foreground">Total Items</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{summaryStats.totalOrdered}</div>
          <div className="text-xs text-muted-foreground">Total Ordered</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{summaryStats.totalReceived}</div>
          <div className="text-xs text-muted-foreground">Total Received</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-amber-600">
            {summaryStats.totalOrdered - summaryStats.totalReceived}
          </div>
          <div className="text-xs text-muted-foreground">Pending</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {summaryStats.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-xs text-muted-foreground">Total Value ({poData.currencyCode || 'USD'})</div>
        </div>
      </div>

      {/* Items Table with GRN Design Pattern */}
      <POItemsTable
        mode={editable ? "edit" : "view"}
        items={poData?.items || []}
        onItemsChange={handleItemsChange}
        selectedItems={selectedItems}
        onItemSelect={handleItemSelect}
        exchangeRate={poData.exchangeRate || 1}
        baseCurrency={poData.baseCurrencyCode || 'THB'}
        currency={poData.currencyCode || 'USD'}
        bulkActions={bulkActionsComponent}
      />
    </div>
  );
}
