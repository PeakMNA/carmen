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
import { FileText, Edit, Trash2, Plus, MoreHorizontal, ChevronDown, ChevronRight } from "lucide-react";
import { GoodsReceiveNoteItem, Product, Location as LocationInfo } from "@/lib/types";
// UnitConversion type is not exported from '@/lib/types'
// Using any type for now
type UnitConversion = any;
import { GRNDetailMode } from "../GoodsReceiveNoteDetail";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/custom-dialog";
import { Badge } from "@/components/ui/badge";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider 
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import ItemDetailForm from "./itemDetailForm";
import { formatCurrency, cn } from "@/lib/utils";

// --- Hypothetical Data Fetching Service --- 
// Assume these functions exist elsewhere and fetch data from your API
// You would import these from your actual service/API layer

// Example function signature for fetching product details
async function getProductDetails(grnItemId: string): Promise<Product | null> {
  console.log(`[API CALL] Fetching product details for GRN Item ID: ${grnItemId}`);

  // --- TEMPORARY MOCK WORKAROUND --- 
  // Map known mock GRN Item IDs to mock Product IDs
  // Replace this with fetching using the actual productId when available
  let productId = grnItemId; // Default assumption (will likely fail)
  if (grnItemId === 'ITEM011') {
      productId = 'PROD-123'; // Map mock GRN Item ID to mock Product ID
      console.log(`[Mock Map] Mapped GRN Item ID ${grnItemId} to Product ID ${productId}`);
  } else if (grnItemId === 'ITEM012') {
      productId = 'PROD-456'; // Map mock GRN Item ID to mock Product ID
      console.log(`[Mock Map] Mapped GRN Item ID ${grnItemId} to Product ID ${productId}`);
  } else {
      console.warn(`[Mock Map] Unknown GRN Item ID ${grnItemId}, attempting fetch with this ID.`);
  }
  // --- END TEMPORARY MOCK WORKAROUND ---

  // Replace with your actual API call using the correct productId
  // Example: const response = await fetch(`/api/products/${productId}`);
  // if (!response.ok) return null;
  // const product: Product = await response.json();
  // return product;
  
  // Using the placeholder logic with the (potentially mapped) productId
  await new Promise(resolve => setTimeout(resolve, 300));
  // IMPORTANT: Uses productId derived from the temporary mapping above
  if (productId === 'PROD-123') { // Check against mapped Product ID
    const mockConcreteProduct = {
        id: "PROD-123", productCode: "CONC-ALPHA", name: "Concrete Mix - Project Alpha", description: "Standard Portland cement mix", localDescription: "ปูนซีเมนต์ผสมมาตรฐาน", categoryId: "PROJECT_MATERIAL", subCategoryId: "SCAT-BULK", itemGroupId: "GRP-CONSTRUCTION", primaryInventoryUnitId: "KG", size: "25kg Bag Equivalent", color: "Grey", barcode: "9876543210123", isActive: true, basePrice: { amount: 5, currency: "USD" }, currency: "USD", taxType: "Standard", taxRate: 7, standardCost: { amount: 4.5, currency: "USD" }, lastCost: { amount: 4.6, currency: "USD" }, priceDeviationLimit: 10, quantityDeviationLimit: 5, minStockLevel: 500, maxStockLevel: 10000, isForSale: false, isIngredient: false, weight: 25000, shelfLife: 180, storageInstructions: "Store in a dry place, away from moisture.",
        unitConversions: [ { id: "uc1", unitId: "BAG", fromUnit: "Bag", toUnit: "Kg", unitName: "Bag (25kg)", conversionFactor: 25, unitType: "ORDER" }, { id: "uc2", unitId: "KG", fromUnit: "Kg", toUnit: "Kg", unitName: "Kilogram", conversionFactor: 1, unitType: "INVENTORY" }, ], 
        imagesUrl: "/images/placeholder-concrete.jpg", carbonFootprint: 50,
    };
    return mockConcreteProduct as unknown as Product;
  } else if (productId === 'PROD-456') { // Check against mapped Product ID
    const mockAppleProduct = {
        id: "PROD-456", productCode: "FRUIT-APP-ORG", name: "Organic Apples", description: "Fresh organic Gala apples", localDescription: "แอปเปิ้ลออร์แกนิคสด", categoryId: "FOOD", subCategoryId: "SCAT-FRESHFRUIT", itemGroupId: "GRP-PRODUCE", primaryInventoryUnitId: "KG", size: "Medium", color: "Red", barcode: "1234567890123", isActive: true, basePrice: { amount: 3, currency: "USD" }, currency: "USD", taxType: "Exempt", taxRate: 0, standardCost: { amount: 2.5, currency: "USD" }, lastCost: { amount: 2.6, currency: "USD" }, priceDeviationLimit: 15, quantityDeviationLimit: 10, minStockLevel: 50, maxStockLevel: 500, isForSale: true, isIngredient: true, weight: 150, shelfLife: 14, storageInstructions: "Refrigerate after opening.",
        unitConversions: [ { id: "uc3", unitId: "BOX", fromUnit: "Box", toUnit: "Kg", unitName: "Box (10kg)", conversionFactor: 10, unitType: "ORDER" }, { id: "uc4", unitId: "KG", fromUnit: "Kg", toUnit: "Kg", unitName: "Kilogram", conversionFactor: 1, unitType: "INVENTORY" }, ], 
        imagesUrl: "/images/placeholder-apples.jpg", sustainableCertification: 'ORGANIC',
    };
    return mockAppleProduct as unknown as Product;
  }
   return null;
}

// Example function signature for fetching location details
async function getLocationDetails(locationIdentifier: string): Promise<LocationInfo | null> {
    console.log(`[API CALL] Fetching location details for: ${locationIdentifier}`);
    // Replace with your actual API call (might fetch by name or ID)
    // Example: const response = await fetch(`/api/locations?name=${encodeURIComponent(locationIdentifier)}`);
    // ... handle response ...
    
    // Using previous placeholder logic
    await new Promise(resolve => setTimeout(resolve, 200));
    if (locationIdentifier === 'Main Warehouse') {
        return { code: 'WH-MAIN', name: 'Main Warehouse', type: 'warehouse', displayType: 'Inventory' } as any;
    } else if (locationIdentifier === 'Kitchen Storage') { // Match screenshot example
         return { code: 'KITCH-S', name: 'Kitchen Storage', type: 'kitchen', displayType: 'Direct' } as any;
    }
    return null;
}
// --- End Hypothetical Service ---

interface GoodsReceiveNoteItemsProps {
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

export function GoodsReceiveNoteItems({
  mode,
  items = [],
  onItemsChange,
  selectedItems,
  onItemSelect,
  exchangeRate,
  baseCurrency,
  currency,
  bulkActions,
}: GoodsReceiveNoteItemsProps) {
  // Expandable row state (hide/show panel pattern)
  const [expandedTableRows, setExpandedTableRows] = useState<Set<string>>(new Set());
  const [autoExpandedRow, setAutoExpandedRow] = useState<string | null>(null);
  const [isAutoExpandEnabled, setIsAutoExpandEnabled] = useState(true);
  const [focusedRow, setFocusedRow] = useState<string | null>(null);
  const [expandedRowMode, setExpandedRowMode] = useState<Record<string, 'view' | 'edit'>>({});

  // Legacy dialog state (kept for Add Item functionality)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [itemUnits, setItemUnits] = useState<Record<string, string>>({});

  // Detail data loading state
  const [loadingItemIds, setLoadingItemIds] = useState<Set<string>>(new Set());
  const [itemProductData, setItemProductData] = useState<Record<string, Product | null>>({});
  const [itemLocationData, setItemLocationData] = useState<Record<string, LocationInfo | null>>({});

  useEffect(() => {
    const initialUnits: Record<string, string> = {};
    items.forEach(item => {
      initialUnits[item.id] = item.unit;
    });
    setItemUnits(initialUnits);
  }, [items]);

  // Fetch details when row is expanded
  useEffect(() => {
    const allExpandedIds = new Set([...expandedTableRows]);
    if (autoExpandedRow) {
      allExpandedIds.add(autoExpandedRow);
    }

    allExpandedIds.forEach((itemId) => {
      const item = items.find(i => i.id === itemId);
      if (!item) return;

      // Skip if already loading or already have data
      if (loadingItemIds.has(itemId) || itemProductData[itemId] !== undefined) return;

      // Mark as loading
      setLoadingItemIds(prev => new Set([...prev, itemId]));

      // Fetch data
      Promise.all([
        getProductDetails(itemId),
        getLocationDetails((item as any).location)
      ]).then(([productData, locationData]) => {
        setItemProductData(prev => ({ ...prev, [itemId]: productData }));
        setItemLocationData(prev => ({ ...prev, [itemId]: locationData }));
        setLoadingItemIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      }).catch(error => {
        console.error("Error fetching item details:", error);
        setItemProductData(prev => ({ ...prev, [itemId]: null }));
        setItemLocationData(prev => ({ ...prev, [itemId]: null }));
        setLoadingItemIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(itemId);
          return newSet;
        });
      });
    });
  }, [expandedTableRows, autoExpandedRow, items, loadingItemIds, itemProductData]);

  // Toggle expand/collapse for a row
  const handleToggleTableExpand = (itemId: string) => {
    const newExpanded = new Set(expandedTableRows);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
      // Set default mode to 'view' when expanding
      if (!expandedRowMode[itemId]) {
        setExpandedRowMode(prev => ({ ...prev, [itemId]: 'view' }));
      }
    }
    setExpandedTableRows(newExpanded);
  };

  // Handle mouse enter for auto-expand
  const handleRowMouseEnter = (itemId: string) => {
    if (!expandedTableRows.has(itemId) && isAutoExpandEnabled) {
      setFocusedRow(itemId);
      setAutoExpandedRow(itemId);
    } else if (isAutoExpandEnabled) {
      setFocusedRow(itemId);
    }
  };

  // Handle mouse leave for auto-expand
  const handleRowMouseLeave = () => {
    setFocusedRow(null);
    setAutoExpandedRow(null);
  };

  // Switch expanded row to edit mode
  const handleSwitchToEdit = (itemId: string) => {
    setExpandedRowMode(prev => ({ ...prev, [itemId]: 'edit' }));
    // Ensure row stays expanded
    if (!expandedTableRows.has(itemId)) {
      const newExpanded = new Set(expandedTableRows);
      newExpanded.add(itemId);
      setExpandedTableRows(newExpanded);
    }
  };

  // Close expanded row panel
  const handleCloseExpandedRow = (itemId: string) => {
    const newExpanded = new Set(expandedTableRows);
    newExpanded.delete(itemId);
    setExpandedTableRows(newExpanded);
    // Reset mode
    setExpandedRowMode(prev => {
      const newMode = { ...prev };
      delete newMode[itemId];
      return newMode;
    });
  };

  const handleItemChange = (
    id: string,
    field: keyof GoodsReceiveNoteItem | string,
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
    console.log(`Changed unit for GRN item ${itemId} to ${newUnit}. Base Qty recalculation may be needed.`);
  };

  const handleSelectAll = (checked: boolean) => {
    onItemSelect("", checked);
  };

  // Save item from expanded panel
  const handleSaveExpandedItem = (itemId: string, updatedItem: any) => {
    const updatedItems = items.map((item) =>
      item.id === itemId ? { ...item, ...updatedItem } : item
    );
    onItemsChange(updatedItems);
    // Switch back to view mode after save
    setExpandedRowMode(prev => ({ ...prev, [itemId]: 'view' }));
  };

  // Edit item via expanded panel
  const handleEditItem = (item: GoodsReceiveNoteItem) => {
    handleSwitchToEdit(item.id);
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    onItemsChange(updatedItems);
  };

  const handleAddItem = (newItem: GoodsReceiveNoteItem) => {
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

  // Format base amount without currency symbol
  const formatBaseAmount = (amount: number) => {
    return (amount * exchangeRate).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const calculateNetAmount = (item: GoodsReceiveNoteItem) => {
    const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : (item.unitPrice as any).amount || 0;
    const subtotal = unitPrice * item.receivedQuantity;
    return subtotal - (subtotal * ((item as any).discountRate || 0) / 100);
  };

  const calculateTaxAmount = (item: GoodsReceiveNoteItem) => {
    const netAmount = calculateNetAmount(item);
    return netAmount * ((item as any).taxRate || 0) / 100;
  };

  const numberCellClass = "text-right";

  // Placeholder unit options
  const unitOptions = ["Kg", "Pcs", "Box", "Pack", "L", "mL"];

  // --- Add New Record Handler (Placeholder) ---
  const handleAddNewRecord = (fieldType: 'projectCode' | 'jobCode' | 'marketSegment' | 'jobNumber' | 'event') => {
      // In a real application, this would likely:
      // 1. Open a new dialog specific to creating a Project/Job/Market Segment/Job Number/Event.
      // 2. Navigate to a dedicated creation page.
      // 3. After successful creation, potentially refresh the list of options
      //    and maybe even select the newly created item in the dropdown.
      alert(`Placeholder: Trigger UI to add a new ${fieldType}.`);
      console.log(`Placeholder: Trigger UI to add a new ${fieldType}.`);
      // Example: You might set state to open a specific creation dialog
      // if (fieldType === 'projectCode') setOpenProjectDialog(true);
  };

  // Handle request to switch to edit mode from expanded panel
  const handleRequestEditFromPanel = (itemId: string) => {
    console.log("Request to switch expanded panel from view to edit mode received.");
    handleSwitchToEdit(itemId);
  };

  if (items.length === 0) {
    return <div>No items available.</div>;
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
            <DialogContent className="max-w-5xl">
              <ItemDetailForm
                mode="add"
                item={null}
                onSave={handleAddItem}
                onClose={() => setIsAddDialogOpen(false)}
                onAddNewRecord={handleAddNewRecord}
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

      {/* Auto Expand Toggle */}
      <div className="px-4 py-2 border rounded-t-md bg-gray-50/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={isAutoExpandEnabled}
              onChange={(e) => setIsAutoExpandEnabled(e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            Auto-expand on hover
          </label>
        </div>
        <div className="text-xs text-muted-foreground">
          Click row or chevron to expand details
        </div>
      </div>

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
            {/* Headers matching the image */}
            <TableHead className="align-top font-semibold">Location</TableHead>
            <TableHead className="align-top font-semibold min-w-[180px]">Product Name</TableHead>
            <TableHead className={`${numberCellClass} align-top font-semibold`}>Ordered Qty</TableHead>
            <TableHead className="align-top font-semibold">Ordered Unit</TableHead>
            <TableHead className={`${numberCellClass} align-top font-semibold`}>Received Qty</TableHead>
            <TableHead className="align-top font-semibold">Unit</TableHead>
            <TableHead className={`${numberCellClass} align-top font-semibold`}>FOC Qty</TableHead>
            <TableHead className="align-top font-semibold">FOC Unit</TableHead>
            <TableHead className={`${numberCellClass} align-top font-semibold`}>Price</TableHead>
            <TableHead className={`${numberCellClass} align-top font-semibold`}>Discount</TableHead>
            <TableHead className={`${numberCellClass} align-top font-semibold`}>Net Amount</TableHead>
            <TableHead className={`${numberCellClass} align-top font-semibold`}>Tax Amount</TableHead>
            <TableHead className={`${numberCellClass} align-top font-semibold`}>Total Amount</TableHead>
            <TableHead className="align-top font-semibold">Actions</TableHead>
          </TableRow>
        </TableHeader>
        
        <TableBody>
          {items.map((item, index) => {
            const isManuallyExpanded = expandedTableRows.has(item.id);
            const isAutoExpanded = autoExpandedRow === item.id;
            const isExpanded = isManuallyExpanded || isAutoExpanded;
            const currentRowMode = expandedRowMode[item.id] || 'view';
            const isLoadingItemDetails = loadingItemIds.has(item.id);
            const productData = itemProductData[item.id];
            const locationData = itemLocationData[item.id];

            return (
              <React.Fragment key={item.id}>
                {/* Main Table Row */}
                <TableRow
                  className={cn(
                    "group transition-all duration-200 border-b border-gray-200 cursor-pointer align-top",
                    "hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-25",
                    focusedRow === item.id && "bg-gradient-to-r from-blue-100 to-blue-50 border-blue-300 shadow-sm ring-1 ring-blue-200",
                    isExpanded && "bg-slate-50 border-slate-300 bg-gradient-to-r from-slate-100 to-slate-50"
                  )}
                  onMouseEnter={() => handleRowMouseEnter(item.id)}
                  onMouseLeave={handleRowMouseLeave}
                  onClick={() => handleToggleTableExpand(item.id)}
                >
                  {/* Checkbox Cell */}
                  <TableCell className="text-center py-3 align-top" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedItems.includes(item.id)}
                      onCheckedChange={(checked) =>
                        onItemSelect(item.id, checked as boolean)
                      }
                      disabled={mode === "view"}
                    />
                  </TableCell>

                  {/* Row # with Expand Indicator */}
                  <TableCell className="py-2 text-center align-top">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "h-6 w-6 p-0 rounded-md transition-all duration-200 hover:bg-gray-100",
                          isExpanded && "bg-slate-200 hover:bg-slate-300"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleTableExpand(item.id);
                        }}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-3 w-3 text-gray-700" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-gray-600" />
                        )}
                      </Button>
                      <div className="text-sm font-medium text-gray-600 min-w-[16px]">
                        {index + 1}
                      </div>
                    </div>
                  </TableCell>

                  {/* Location Cell */}
                  <TableCell className="align-top" onClick={(e) => e.stopPropagation()}>
                    {(item as any).location || "N/A"}
                  </TableCell>

                  {/* Product Name Cell */}
                  <TableCell className="align-top" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center space-x-2">
                      <div>
                        <div className="font-semibold text-sm">{(item as any).name}</div>
                        <div className="text-xs text-muted-foreground">
                          {(item as any).description || "No description available"}
                        </div>
                      </div>
                      {(item as any).isConsignment && (
                        <Badge variant="outline" className="text-xs">Consignment</Badge>
                      )}
                      {(item as any).isTaxInclusive && (
                        <Badge variant="outline" className="text-xs">Tax Inclusive</Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Ordered Qty Cell */}
                  <TableCell className={`${numberCellClass} align-top`} onClick={(e) => e.stopPropagation()}>
                    {item.orderedQuantity}
                    <div className="text-xs text-muted-foreground">
                      Base: {((item.orderedQuantity || 0) * ((item as any).conversionRate || 1)).toFixed(2)} {(item as any).baseUnit || 'N/A'}
                    </div>
                  </TableCell>

                  {/* Ordered Unit Cell */}
                  <TableCell className="align-top" onClick={(e) => e.stopPropagation()}>
                    {(item as any).orderUnit}
                  </TableCell>

                  {/* Received Qty Cell */}
                  <TableCell className={`${numberCellClass} align-top`} onClick={(e) => e.stopPropagation()}>
                    <Input
                      type="number"
                      value={item.receivedQuantity}
                      onChange={(e) =>
                        handleItemChange(item.id, "receivedQuantity", parseFloat(e.target.value))
                      }
                      readOnly={mode === "view"}
                      className="text-right h-8"
                    />
                    <div className="text-xs text-muted-foreground">
                      Base: {(item.receivedQuantity * ((item as any).conversionRate || 1)).toFixed(2)} {(item as any).baseUnit || 'N/A'}
                    </div>
                  </TableCell>

                  {/* Received Unit Cell */}
                  <TableCell className="align-top" onClick={(e) => e.stopPropagation()}>
                    <Select
                      value={itemUnits[item.id] || item.unit}
                      onValueChange={(value) => handleUnitChange(item.id, value)}
                      disabled={mode === "view"}
                    >
                      <SelectTrigger className="h-8 text-sm">
                        <SelectValue placeholder="Unit" />
                      </SelectTrigger>
                      <SelectContent>
                        {!unitOptions.includes(item.unit) && <SelectItem value={item.unit}>{item.unit}</SelectItem>}
                        {unitOptions.map((unit) => (
                          <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-muted-foreground mt-1">
                      1 {itemUnits[item.id] || item.unit} = {(item as any).conversionRate || 1} {(item as any).baseUnit}
                    </div>
                  </TableCell>

                  {/* FOC Qty Cell */}
                  <TableCell className={`${numberCellClass} align-top`} onClick={(e) => e.stopPropagation()}>
                    <Input
                      type="number"
                      value={(item as any).focQuantity || 0}
                      onChange={(e) =>
                        handleItemChange(item.id, "focQuantity", parseFloat(e.target.value))
                      }
                      readOnly={mode === "view"}
                      className="text-right h-8"
                    />
                    <div className="text-xs text-muted-foreground">
                      Base: {(((item as any).focQuantity || 0) * ((item as any).focConversionRate || (item as any).conversionRate || 1)).toFixed(2)} {(item as any).baseUnit || 'N/A'}
                    </div>
                  </TableCell>

                  {/* FOC Unit Cell */}
                  <TableCell className="align-top" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={(item as any).focUnit || item.unit}
                      onChange={(e) =>
                        handleItemChange(item.id, "focUnit", e.target.value)
                      }
                      disabled={mode === "view"}
                      className="w-full border rounded h-8 px-2 text-sm"
                    >
                      <option value={item.unit}>{item.unit}</option>
                      <option value={(item as any).baseUnit}>{(item as any).baseUnit}</option>
                      {unitOptions.map((unit) => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </TableCell>

                  {/* Price Cell */}
                  <TableCell className={`${numberCellClass} align-top`}>
                    {formatAmount(item.unitPrice)}
                  </TableCell>

                  {/* Discount Cell */}
                  <TableCell className={`${numberCellClass} align-top`}>
                    {(item as any).discountRate ? `${(item as any).discountRate}%` : '-'}
                  </TableCell>

                  {/* Net Amount Cell */}
                  <TableCell className={`${numberCellClass} align-top`}>
                    {formatAmount(calculateNetAmount(item))}
                  </TableCell>

                  {/* Tax Amount Cell */}
                  <TableCell className={`${numberCellClass} align-top`}>
                    {formatAmount(calculateTaxAmount(item))}
                  </TableCell>

                  {/* Total Amount Cell */}
                  <TableCell className={`${numberCellClass} align-top`}>
                    {formatAmount(calculateNetAmount(item) + calculateTaxAmount(item))}
                  </TableCell>

                  {/* Actions Cell */}
                  <TableCell className="align-top" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleToggleTableExpand(item.id)}>
                          <FileText className="mr-2 h-4 w-4" />
                          {isExpanded ? 'Hide Details' : 'View Details'}
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleEditItem(item)}
                          disabled={mode === "view"}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Item
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={mode === "view"}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Item
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>

                {/* Expanded Detail Panel */}
                {isExpanded && (
                  <TableRow
                    className={cn(
                      "border-b transition-all duration-300 relative",
                      isManuallyExpanded
                        ? "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-400"
                        : "bg-gradient-to-br from-blue-25 to-blue-50 border-blue-200",
                      "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:transition-all before:duration-300",
                      isManuallyExpanded
                        ? "before:bg-slate-400"
                        : "before:bg-blue-400"
                    )}
                  >
                    <TableCell colSpan={16} className="py-4">
                      <div className="relative px-2">
                        {isLoadingItemDetails ? (
                          <div className="p-4 text-center text-gray-500">
                            Loading item details...
                          </div>
                        ) : (
                          <ItemDetailForm
                            mode={currentRowMode}
                            item={item}
                            categoryId={productData?.categoryId}
                            productCode={productData?.productCode}
                            locationCode={(locationData as any)?.code}
                            unitConversions={(productData as any)?.unitConversions}
                            onSave={(updatedItem) => handleSaveExpandedItem(item.id, updatedItem)}
                            onClose={() => handleCloseExpandedRow(item.id)}
                            onAddNewRecord={handleAddNewRecord}
                            onRequestEdit={() => handleRequestEditFromPanel(item.id)}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>

      {/* Old dialog removed - now using inline expandable panels */}
    </div>
  );
}
