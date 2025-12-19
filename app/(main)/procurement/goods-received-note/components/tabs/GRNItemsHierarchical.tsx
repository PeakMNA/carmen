"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronDown,
  ChevronRight,
  Package,
  MapPin,
  FileText,
  ChevronsUpDown,
  ChevronsDownUp,
} from "lucide-react";
import { GoodsReceiveNoteItem } from "@/lib/types";
import { GRNDetailMode } from "../GoodsReceiveNoteDetail";
import ItemDetailForm from "./itemDetailForm";
import {
  groupItemsByProductLocation,
  groupedToArray,
  calculateRemainingToReceive,
  type GroupedGRNItems,
  type POLineInfo,
} from "../../lib/groupItems";
import { cn } from "@/lib/utils";

interface GRNItemsHierarchicalProps {
  mode: GRNDetailMode;
  items: GoodsReceiveNoteItem[];
  onItemsChange: (items: GoodsReceiveNoteItem[]) => void;
  selectedItems: string[];
  onItemSelect: (itemId: string, isSelected: boolean) => void;
  exchangeRate: number;
  baseCurrency: string;
  currency: string;
  bulkActions?: React.ReactNode;
}

export function GRNItemsHierarchical({
  mode,
  items = [],
  onItemsChange,
  selectedItems,
  onItemSelect,
  exchangeRate,
  baseCurrency,
  currency,
  bulkActions,
}: GRNItemsHierarchicalProps) {
  // Expansion state
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());
  const [expandedLocations, setExpandedLocations] = useState<Set<string>>(new Set());

  // Right-side panel state
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<GoodsReceiveNoteItem | null>(null);
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [detailMode, setDetailMode] = useState<"view" | "edit">("view");

  // Group items by product and location
  const groupedItems = useMemo(() => {
    return groupItemsByProductLocation(items);
  }, [items]);

  const groupedArray = useMemo(() => {
    return groupedToArray(groupedItems);
  }, [groupedItems]);

  // Initialize all products as expanded on first load
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (groupedArray.length > 0 && !initialized) {
      const allProductIds = new Set(groupedArray.map((g) => g.productId));
      setExpandedProducts(allProductIds);

      // Also expand all locations
      const allLocationKeys = new Set<string>();
      groupedArray.forEach((product) => {
        product.locations.forEach((loc) => {
          allLocationKeys.add(`${product.productId}-${loc.locationId}`);
        });
      });
      setExpandedLocations(allLocationKeys);
      setInitialized(true);
    }
  }, [groupedArray, initialized]);

  const isReadOnly = mode === "view" || mode === "confirm";

  // Toggle product expansion
  const toggleProduct = (productId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productId)) {
      newExpanded.delete(productId);
    } else {
      newExpanded.add(productId);
    }
    setExpandedProducts(newExpanded);
  };

  // Toggle location expansion
  const toggleLocation = (productId: string, locationId: string) => {
    const key = `${productId}-${locationId}`;
    const newExpanded = new Set(expandedLocations);
    if (newExpanded.has(key)) {
      newExpanded.delete(key);
    } else {
      newExpanded.add(key);
    }
    setExpandedLocations(newExpanded);
  };

  // Expand all
  const handleExpandAll = () => {
    const allProductIds = new Set(groupedArray.map((g) => g.productId));
    setExpandedProducts(allProductIds);

    const allLocationKeys = new Set<string>();
    groupedArray.forEach((product) => {
      product.locations.forEach((loc) => {
        allLocationKeys.add(`${product.productId}-${loc.locationId}`);
      });
    });
    setExpandedLocations(allLocationKeys);
  };

  // Collapse all
  const handleCollapseAll = () => {
    setExpandedProducts(new Set());
    setExpandedLocations(new Set());
  };

  // Handle item field change
  const handleItemChange = (
    itemId: string,
    field: keyof GoodsReceiveNoteItem | string,
    value: string | number | boolean
  ) => {
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, [field]: value } : item
    );
    onItemsChange(updatedItems);
  };

  // Open detail panel
  const handleOpenDetail = (item: GoodsReceiveNoteItem) => {
    setSelectedItemForDetail(item);
    setDetailMode(isReadOnly ? "view" : "edit");
    setIsDetailPanelOpen(true);
  };

  // Close detail panel
  const handleCloseDetail = () => {
    setIsDetailPanelOpen(false);
    setSelectedItemForDetail(null);
  };

  // Save from detail panel
  const handleSaveDetail = (updatedItem: any) => {
    if (selectedItemForDetail) {
      const updatedItems = items.map((item) =>
        item.id === selectedItemForDetail.id ? { ...item, ...updatedItem } : item
      );
      onItemsChange(updatedItems);
    }
    handleCloseDetail();
  };

  // Unit options (placeholder)
  const unitOptions = ["Kg", "Pcs", "Box", "Pack", "L", "mL", "Case", "Bag"];

  if (items.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
        <p>No items available.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Expand/Collapse All */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Receiving Entry</h3>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExpandAll}
            className="h-8"
          >
            <ChevronsUpDown className="h-4 w-4 mr-1" />
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCollapseAll}
            className="h-8"
          >
            <ChevronsDownUp className="h-4 w-4 mr-1" />
            Collapse All
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {bulkActions && <div className="mb-4">{bulkActions}</div>}

      {/* Hierarchical Items */}
      <div className="space-y-3">
        {groupedArray.map((productGroup) => (
          <ProductSection
            key={productGroup.productId}
            productGroup={productGroup}
            isExpanded={expandedProducts.has(productGroup.productId)}
            onToggle={() => toggleProduct(productGroup.productId)}
            expandedLocations={expandedLocations}
            onToggleLocation={(locationId) =>
              toggleLocation(productGroup.productId, locationId)
            }
            isReadOnly={isReadOnly}
            onItemChange={handleItemChange}
            onOpenDetail={handleOpenDetail}
            unitOptions={unitOptions}
            currency={currency}
          />
        ))}
      </div>

      {/* Right-side Detail Panel */}
      <Sheet open={isDetailPanelOpen} onOpenChange={setIsDetailPanelOpen}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
          {selectedItemForDetail && (
            <ItemDetailForm
              mode={detailMode}
              item={selectedItemForDetail as any}
              onSave={handleSaveDetail}
              onClose={handleCloseDetail}
              onRequestEdit={() => setDetailMode("edit")}
              onAddNewRecord={(fieldType) => {
                console.log(`Add new ${fieldType}`);
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

// Product Section Component
interface ProductSectionProps {
  productGroup: {
    productId: string;
    product: { id: string; name: string; code: string; description?: string };
    totalItems: number;
    totalLocations: number;
    locations: Array<{
      locationId: string;
      location: { id: string; name: string; code?: string };
      poLines: POLineInfo[];
    }>;
  };
  isExpanded: boolean;
  onToggle: () => void;
  expandedLocations: Set<string>;
  onToggleLocation: (locationId: string) => void;
  isReadOnly: boolean;
  onItemChange: (itemId: string, field: string, value: any) => void;
  onOpenDetail: (item: GoodsReceiveNoteItem) => void;
  unitOptions: string[];
  currency: string;
}

function ProductSection({
  productGroup,
  isExpanded,
  onToggle,
  expandedLocations,
  onToggleLocation,
  isReadOnly,
  onItemChange,
  onOpenDetail,
  unitOptions,
  currency,
}: ProductSectionProps) {
  return (
    <Card className="border-l-4 border-l-blue-500">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              {isExpanded ? (
                <ChevronDown className="h-5 w-5 text-gray-500" />
              ) : (
                <ChevronRight className="h-5 w-5 text-gray-500" />
              )}
              <Package className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-semibold text-gray-900">
                  {productGroup.product.name}
                </div>
                <div className="text-sm text-gray-500">
                  SKU: {productGroup.product.code || "N/A"}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="text-xs">
                {productGroup.totalLocations} location
                {productGroup.totalLocations !== 1 ? "s" : ""}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {productGroup.totalItems} item
                {productGroup.totalItems !== 1 ? "s" : ""}
              </Badge>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-3">
            {productGroup.locations.map((locationGroup) => (
              <LocationSection
                key={locationGroup.locationId}
                productId={productGroup.productId}
                locationGroup={locationGroup}
                isExpanded={expandedLocations.has(
                  `${productGroup.productId}-${locationGroup.locationId}`
                )}
                onToggle={() => onToggleLocation(locationGroup.locationId)}
                isReadOnly={isReadOnly}
                onItemChange={onItemChange}
                onOpenDetail={onOpenDetail}
                unitOptions={unitOptions}
                currency={currency}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// Location Section Component
interface LocationSectionProps {
  productId: string;
  locationGroup: {
    locationId: string;
    location: { id: string; name: string; code?: string };
    poLines: POLineInfo[];
  };
  isExpanded: boolean;
  onToggle: () => void;
  isReadOnly: boolean;
  onItemChange: (itemId: string, field: string, value: any) => void;
  onOpenDetail: (item: GoodsReceiveNoteItem) => void;
  unitOptions: string[];
  currency: string;
}

function LocationSection({
  productId,
  locationGroup,
  isExpanded,
  onToggle,
  isReadOnly,
  onItemChange,
  onOpenDetail,
  unitOptions,
  currency,
}: LocationSectionProps) {
  return (
    <Card className="ml-6 border-l-4 border-l-green-500">
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors">
            <div className="flex items-center gap-3">
              {isExpanded ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
              <MapPin className="h-4 w-4 text-green-600" />
              <div className="font-medium text-gray-800">
                {locationGroup.location.name}
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {locationGroup.poLines.length} PO line
              {locationGroup.poLines.length !== 1 ? "s" : ""}
            </Badge>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 space-y-2">
            {locationGroup.poLines.map((poLine) => (
              <POLineEntryCard
                key={poLine.item.id}
                poLine={poLine}
                isReadOnly={isReadOnly}
                onItemChange={onItemChange}
                onOpenDetail={onOpenDetail}
                unitOptions={unitOptions}
                currency={currency}
              />
            ))}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// PO Line Entry Card Component (4-column grid)
interface POLineEntryCardProps {
  poLine: POLineInfo;
  isReadOnly: boolean;
  onItemChange: (itemId: string, field: string, value: any) => void;
  onOpenDetail: (item: GoodsReceiveNoteItem) => void;
  unitOptions: string[];
  currency: string;
}

function POLineEntryCard({
  poLine,
  isReadOnly,
  onItemChange,
  onOpenDetail,
  unitOptions,
  currency,
}: POLineEntryCardProps) {
  const { item } = poLine;

  // Calculate remaining to receive
  const remainingToReceive = calculateRemainingToReceive(item);

  // Format number
  const formatNumber = (num: number) => {
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Card className="ml-6 bg-white border shadow-sm">
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">
              PO: {poLine.poNumber || "N/A"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenDetail(item)}
            className="h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            Detail &gt;
          </Button>
        </div>

        {/* Order Info Row */}
        <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
          <span>
            Ordered: <strong>{formatNumber(item.orderedQuantity || 0)}</strong>{" "}
            {item.unit}
          </span>
          <span className="text-gray-300">|</span>
          <span>
            Remaining: <strong>{formatNumber(remainingToReceive)}</strong>{" "}
            {item.unit}
          </span>
        </div>

        {/* 4-Column Entry Grid */}
        <div className="grid grid-cols-4 gap-4">
          {/* Column 1: Received Qty */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">
              Received Qty
            </label>
            <Input
              type="number"
              value={item.receivedQuantity || 0}
              onChange={(e) =>
                onItemChange(
                  item.id,
                  "receivedQuantity",
                  parseFloat(e.target.value) || 0
                )
              }
              readOnly={isReadOnly}
              className="h-9"
              min={0}
            />
          </div>

          {/* Column 2: Receive Unit */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">
              Receive Unit
            </label>
            <Select
              value={item.unit}
              onValueChange={(value) => onItemChange(item.id, "unit", value)}
              disabled={isReadOnly}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                {!unitOptions.includes(item.unit) && (
                  <SelectItem value={item.unit}>{item.unit}</SelectItem>
                )}
                {unitOptions.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Column 3: FOC Qty */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">FOC Qty</label>
            <Input
              type="number"
              value={(item as any).focQuantity || 0}
              onChange={(e) =>
                onItemChange(
                  item.id,
                  "focQuantity",
                  parseFloat(e.target.value) || 0
                )
              }
              readOnly={isReadOnly}
              className="h-9"
              min={0}
            />
          </div>

          {/* Column 4: FOC Unit */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-500">FOC Unit</label>
            <Select
              value={(item as any).focUnit || item.unit}
              onValueChange={(value) => onItemChange(item.id, "focUnit", value)}
              disabled={isReadOnly}
            >
              <SelectTrigger className="h-9">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                {!unitOptions.includes((item as any).focUnit || item.unit) && (
                  <SelectItem value={(item as any).focUnit || item.unit}>
                    {(item as any).focUnit || item.unit}
                  </SelectItem>
                )}
                {unitOptions.map((unit) => (
                  <SelectItem key={unit} value={unit}>
                    {unit}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Comment Row (if exists) */}
        {item.notes && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              <span className="font-medium">Comment:</span> {item.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default GRNItemsHierarchical;
