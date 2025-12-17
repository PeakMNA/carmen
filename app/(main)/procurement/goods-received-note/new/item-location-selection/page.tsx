/**
 * Item Location Selection Page for GRN Creation
 *
 * Allows users to select items and locations for receiving in a new GRN.
 *
 * LOCATION TYPE HANDLING:
 * This page shows items from selected POs and their delivery locations.
 * Location types affect how received items will be processed:
 *
 * - INVENTORY: Standard receiving with full inventory tracking
 * - DIRECT: Items will be expensed immediately (no stock-in)
 * - CONSIGNMENT: Items tracked as vendor-owned inventory
 *
 * The location filter badges show icons indicating the location type,
 * helping users understand how items will be processed upon receiving.
 */

'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { useGRNCreationStore } from '@/lib/store/grn-creation.store';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Search, ChevronLeft, Package, DollarSign, Truck, Info } from 'lucide-react';
import { PurchaseOrder, PurchaseOrderItem, GoodsReceiveNoteItem, GoodsReceiveNote } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { InventoryLocationType } from '@/lib/types/location-management';
import {
  requiresStockIn,
  getLocationTypeLabel,
  getGRNProcessingBehavior,
} from '@/lib/utils/location-type-helpers';


/**
 * Helper to flatten PO items and add PO reference, currency, rate, and location type
 *
 * LOCATION TYPE ASSIGNMENT:
 * In real implementation, location type comes from the location master data.
 * This mock assigns types based on location name patterns:
 * - Warehouse/Receiving: INVENTORY (INV) - Standard stock tracking
 * - Kitchen/Direct: DIRECT (DIR) - Immediate expense
 * - Consignment: CONSIGNMENT (CON) - Vendor-owned inventory
 */
const flattenPOItems = (pos: PurchaseOrder[]): (PurchaseOrderItem & {
    poNumber: string,
    poCurrencyCode: string,
    poExchangeRate: number,
    poBaseCurrencyCode: string,
    location: string,
    locationType: string, // Location type code (INV, DIR, CON)
    isSelected?: boolean,
    receivingQuantity?: number
})[] => {
  return pos.flatMap(po =>
    (po as any).items.map((item: any, index: number) => {
      // Assign more diverse mock locations based on PO number or index
      // Each location has an associated location type
      let mockLocation = 'Main Warehouse';
      let locationType = 'INV'; // Default to INVENTORY

      if ((po as any).number === 'PO-002') {
        mockLocation = 'Store Room A';
        locationType = 'INV'; // Standard inventory location
      } else if ((po as any).number === 'PO-003') {
        mockLocation = 'Kitchen Prep Area';
        locationType = 'DIR'; // Direct expense - immediate consumption
      } else if (index % 3 === 0 && (po as any).number === 'PO-001') {
        mockLocation = 'Receiving Bay';
        locationType = 'INV';
      } else if (index % 3 === 1 && (po as any).number === 'PO-001') {
        mockLocation = 'Beverage Consignment';
        locationType = 'CON'; // Vendor-owned consignment
      }

      return {
        ...item,
        poNumber: (po as any).number,
        poCurrencyCode: (po as any).currencyCode,
        poExchangeRate: (po as any).exchangeRate,
        poBaseCurrencyCode: (po as any).baseCurrencyCode,
        location: mockLocation,
        locationType: locationType
      };
    })
  );
};

/**
 * Get icon for location type
 *
 * LOCATION TYPE ICONS:
 * - INVENTORY (INV): Package icon - standard tracked inventory
 * - DIRECT (DIR): DollarSign icon - immediate expense items
 * - CONSIGNMENT (CON): Truck icon - vendor-owned inventory
 */
const getLocationTypeIcon = (type: string) => {
  switch (type.toUpperCase()) {
    case 'INV':
    case 'INVENTORY':
      return <Package className="h-3 w-3" />;
    case 'DIR':
    case 'DIRECT':
      return <DollarSign className="h-3 w-3" />;
    case 'CON':
    case 'CONSIGNMENT':
      return <Truck className="h-3 w-3" />;
    default:
      return <Package className="h-3 w-3" />;
  }
};

/**
 * Get display label for location type
 */
const getLocationTypeLabelLocal = (type: string) => {
  switch (type.toUpperCase()) {
    case 'INV':
    case 'INVENTORY':
      return 'Inventory';
    case 'DIR':
    case 'DIRECT':
      return 'Direct';
    case 'CON':
    case 'CONSIGNMENT':
      return 'Consignment';
    default:
      return 'Unknown';
  }
};

/**
 * Get badge variant for location type
 */
const getLocationBadgeVariant = (type: string): 'default' | 'secondary' | 'outline' => {
  switch (type.toUpperCase()) {
    case 'INV':
    case 'INVENTORY':
      return 'default';
    case 'DIR':
    case 'DIRECT':
      return 'secondary';
    case 'CON':
    case 'CONSIGNMENT':
      return 'outline';
    default:
      return 'default';
  }
};

export default function ItemLocationSelectionPage() {
  const router = useRouter();
  const {
    selectedVendor,
    selectedPOs,
    setNewlyCreatedGRNData, // Use the new action
    setStep,
    // Get existing selected GRN items if needed for updates
    selectedItems: existingSelectedGRNItems // This state now holds final GRN items
  } = useGRNCreationStore();

  const allPOItems = useMemo(() => flattenPOItems(selectedPOs), [selectedPOs]);

  const [locations, setLocations] = useState<string[]>([]);
  const [selectedLocations, setSelectedLocations] = useState<Set<string>>(new Set());
  const [displayItems, setDisplayItems] = useState<typeof allPOItems>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(new Set());
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [itemReceivingUnits, setItemReceivingUnits] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!selectedVendor || selectedPOs.length === 0) {
      router.replace('/procurement/goods-received-note/new/po-selection');
      return;
    }

    // Extract unique locations
    const uniqueLocations = Array.from(new Set(allPOItems.map(item => (item as any).location).filter(Boolean))) as string[];
    setLocations(uniqueLocations);
    setSelectedLocations(new Set(uniqueLocations)); // Select all by default

    // Initialize selected items and quantities based on store if applicable
    const initialSelectedIds = new Set<string>();
    const initialQuantities: Record<string, number> = {};
    // Logic to re-populate selection based on existingSelectedGRNItems might need rework
    // If existingSelectedGRNItems holds FINAL items, maybe we shouldn't re-populate?
    // Or we need a temporary state in the store for the current selection step?
    // For now, we assume we start fresh or the mapping logic is handled elsewhere.
    // existingSelectedGRNItems.forEach(grnItem => { ... });
    setSelectedItemIds(initialSelectedIds);
    setItemQuantities(initialQuantities);

    // Initialize receiving units state
    const initialUnits: Record<string, string> = {};
    allPOItems.forEach(item => {
        initialUnits[item.id] = (item as any).orderUnit; // Default to order unit
    });
    setItemReceivingUnits(initialUnits);

  }, [selectedVendor, selectedPOs, router, allPOItems/*, existingSelectedGRNItems */]); // Remove dependency if not used

  // Filter items based on selected locations and search term
  useEffect(() => {
    const lowerCaseSearch = searchTerm.toLowerCase();
    const filtered = allPOItems.filter(item =>
      selectedLocations.has((item as any).location || '') &&
      (((item as any).itemName || (item as any).name).toLowerCase().includes(lowerCaseSearch) ||
       (item as any).description.toLowerCase().includes(lowerCaseSearch) ||
       (item as any).poNumber.toLowerCase().includes(lowerCaseSearch))
    );
    setDisplayItems(filtered);
  }, [selectedLocations, searchTerm, allPOItems]);

  const handleToggleLocation = (location: string) => {
    setSelectedLocations(prev => {
      const newSet = new Set(prev);
      if (newSet.has(location)) {
        newSet.delete(location);
      } else {
        newSet.add(location);
      }
      return newSet;
    });
    // Optionally reset item selections when locations change
    // setSelectedItemIds(new Set());
    // setItemQuantities({});
  };

  const handleToggleSelectItem = (itemId: string) => {
    setSelectedItemIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
        // Also remove quantity for deselected item
        setItemQuantities(currentQuantities => {
            const { [itemId]: _, ...rest } = currentQuantities;
            return rest;
        });
      } else {
        newSet.add(itemId);
         // Initialize quantity if needed (e.g., default to remaining)
         const item = allPOItems.find(i => i.id === itemId);
         if(item && !itemQuantities[itemId]) {
            handleQuantityChange(itemId, (item as any).pendingQuantity || (item as any).remainingQuantity); // Default to remaining
         }
      }
      return newSet;
    });
  };

  const handleQuantityChange = (itemId: string, value: number | string) => {
    const quantity = typeof value === 'string' ? parseFloat(value) : value;
    const item = allPOItems.find(i => i.id === itemId);
    if (!item) return;

    // Prevent negative or exceeding remaining quantity
    const maxQuantity = (item as any).pendingQuantity || (item as any).remainingQuantity;
    const validatedQuantity = Math.max(0, Math.min(isNaN(quantity) ? 0 : quantity, maxQuantity));

    setItemQuantities(prev => ({
      ...prev,
      [itemId]: validatedQuantity,
    }));

    // Ensure item is selected if quantity is entered
    if (validatedQuantity > 0 && !selectedItemIds.has(itemId)) {
      setSelectedItemIds(prev => new Set(prev).add(itemId));
    }
     // Deselect item if quantity is zero
    // else if (validatedQuantity <= 0 && selectedItemIds.has(itemId)) {
    //    handleToggleSelectItem(itemId);
    // }
  };

  const handleToggleSelectAllItems = () => {
      const allDisplayedIds = new Set(displayItems.map(item => item.id));
      // Use Array.from() for iteration compatibility
      if (selectedItemIds.size === allDisplayedIds.size && Array.from(selectedItemIds).every(id => allDisplayedIds.has(id))) {
          // Deselect all displayed
          setSelectedItemIds(prev => {
              const newSet = new Set(prev);
              displayItems.forEach(item => newSet.delete(item.id));
              return newSet;
          });
          setItemQuantities(prev => {
              const newQuantities = { ...prev };
              displayItems.forEach(item => delete newQuantities[item.id]);
              return newQuantities;
          });
      } else {
          // Select all displayed
          // Use Array.from() for iteration compatibility
          setSelectedItemIds(prev => new Set([...Array.from(prev), ...displayItems.map(item => item.id)]));
          // Set quantities for newly selected items (defaulting to remaining)
          const newQuantities = { ...itemQuantities };
          displayItems.forEach(item => {
              if (!newQuantities[item.id]) {
                  newQuantities[item.id] = (item as any).pendingQuantity || (item as any).remainingQuantity;
              }
          });
          setItemQuantities(newQuantities);
      }
  };

  const handleUnitChange = (itemId: string, unit: string) => {
    setItemReceivingUnits(prev => ({
      ...prev,
      [itemId]: unit
    }));
    // TODO: Future enhancement - recalculate base quantities/amounts if conversion factors are available for the new unit
    console.log(`Changed unit for item ${itemId} to ${unit}. Recalculation needed if factors differ.`);
  };

  const handleNext = () => {
    const itemsToSave: GoodsReceiveNoteItem[] = [];
    Array.from(selectedItemIds).forEach(id => {
      const poItem = allPOItems.find(item => item.id === id);
      const receivingQty = itemQuantities[id];
      if (poItem && receivingQty > 0) {
        // Mapping from PurchaseOrderItem to GoodsReceiveNoteItem
        itemsToSave.push({
          id: `temp-grnitem-${crypto.randomUUID()}`, // Temporary unique ID for GRN item
          purchaseOrderRef: (poItem as any).poNumber,
          name: (poItem as any).itemName || (poItem as any).name,
          description: (poItem as any).description,
          orderedQuantity: (poItem as any).orderedQuantity,
          orderUnit: (poItem as any).orderUnit,
          receivedQuantity: receivingQty,
          unit: (poItem as any).orderUnit,
          unitPrice: (poItem as any).unitPrice,
          // TODO: Implement proper calculation based on PRD 3.4.5.5
          subTotalAmount: receivingQty * (poItem as any).unitPrice,
          totalAmount: receivingQty * (poItem as any).unitPrice, // Simplified
          taxRate: (poItem as any).taxRate,
          taxAmount: 0, // Simplified
          discountRate: (poItem as any).discountRate,
          discountAmount: 0, // Simplified
          netAmount: receivingQty * (poItem as any).unitPrice, // Simplified
          baseCurrency: (poItem as any).baseUnit, // Assuming baseUnit is base currency
          baseQuantity: receivingQty * (poItem as any).convRate,
          baseUnitPrice: (poItem as any).unitPrice, // Needs adjustment based on taxIncluded?
          baseUnit: (poItem as any).baseUnit,
          baseSubTotalAmount: receivingQty * (poItem as any).unitPrice, // Simplified
          baseNetAmount: receivingQty * (poItem as any).unitPrice, // Simplified
          baseTotalAmount: receivingQty * (poItem as any).unitPrice, // Simplified
          baseTaxRate: (poItem as any).taxRate,
          baseTaxAmount: 0, // Simplified
          baseDiscountRate: (poItem as any).discountRate,
          baseDiscountAmount: 0, // Simplified
          conversionRate: (poItem as any).convRate,
          currency: (selectedPOs[0] as any)?.currency || 'USD', // Get from first PO
          exchangeRate: (selectedPOs[0] as any)?.exchangeRate || 1, // Get from first PO
          extraCost: 0,
          inventoryOnHand: (poItem as any).inventoryInfo.onHand,
          inventoryOnOrder: (poItem as any).inventoryInfo.onOrdered,
          inventoryReorderThreshold: (poItem as any).inventoryInfo.reorderLevel,
          inventoryRestockLevel: (poItem as any).inventoryInfo.restockLevel,
          lastPurchasePrice: (poItem as any).inventoryInfo.lastPrice,
          lastOrderDate: (poItem as any).inventoryInfo.lastOrderDate,
          lastVendor: (poItem as any).inventoryInfo.lastVendor,
          lotNumber: '', // TBD
          deliveryPoint: (poItem as any).location || 'Default Location', // Use item's determined location
          deliveryDate: new Date(), // TBD
          location: (poItem as any).location || 'Default Location',
          isFreeOfCharge: (poItem as any).isFOC,
          taxIncluded: (poItem as any).taxIncluded,
          jobCode: '', // TBD
          adjustments: { discount: false, tax: false },
          // Missing fields from GoodsReceiveNoteItem to consider:
          // serialNumber?: string;
          // notes?: string;
          // availableLots?: { lotNumber: string; expiryDate: Date; }[];
          // focQuantity?: number;
          // focUnit?: string;
          // focConversionRate?: number;
          // isConsignment?: boolean;
          // isTaxInclusive?: boolean;
        } as any);
      }
    });

    // Construct the main GRN object
    const tempId = `new-${crypto.randomUUID()}`;
    const newGRNData = {
        id: tempId,
        ref: 'GRN-TEMP-REF', // Placeholder - generate properly later
        selectedItems: [], // This seems unused in GoodsReceiveNote type?
        date: new Date(),
        invoiceDate: new Date(), // Default or TBD
        invoiceNumber: '', // TBD
        description: `GRN created from PO(s): ${selectedPOs.map(p => (p as any).number).join(', ')}`,
        receiver: '', // TODO: Get from user context
        vendor: selectedVendor?.companyName || '',
        vendorId: selectedVendor?.id || '',
        location: '', // TODO: Determine primary location or leave blank?
        currency: (selectedPOs[0] as any)?.currency || 'USD', // Assume first PO's currency for now
        exchangeRate: (selectedPOs[0] as any)?.exchangeRate || 1,
        baseCurrency: (selectedPOs[0] as any)?.baseCurrency || 'USD',
        status: 'RECEIVED' as any, // Use 'RECEIVED' instead of 'Pending'
        isConsignment: false, // Default
        isCash: false, // Default
        cashBook: '',
        items: itemsToSave,
        stockMovements: [], // To be generated later
        extraCosts: [], // Add later if needed
        comments: [],
        attachments: [],
        activityLog: [], // Add initial entry later
        financialSummary: null, // To be generated later
        // Default totals
        baseSubTotalPrice: 0, // Calculate based on itemsToSave
        subTotalPrice: 0,
        baseNetAmount: 0,
        netAmount: 0,
        baseDiscAmount: 0,
        discountAmount: 0,
        baseTaxAmount: 0,
        taxAmount: 0,
        baseTotalAmount: 0,
        totalAmount: 0,
    } as any as GoodsReceiveNote;

    console.log("Constructed GRN Data:", newGRNData);
    setNewlyCreatedGRNData(newGRNData); // Save to store
    // setStep('confirmation'); // Remove this step
    router.push(`/procurement/goods-received-note/${tempId}?mode=confirm`); // Navigate to detail page
  };

  const handleBack = () => {
    setStep('po-selection');
    router.push('/procurement/goods-received-note/new/po-selection');
  };

  const isNextDisabled = useMemo(() => {
     // Use Array.from() for iteration compatibility
     return selectedItemIds.size === 0 || Array.from(selectedItemIds).some(id => !itemQuantities[id] || itemQuantities[id] <= 0);
  }, [selectedItemIds, itemQuantities]);

  if (!selectedVendor || selectedPOs.length === 0) {
    return <div>Loading PO information...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Select Items and Locations</CardTitle>
            <CardDescription>
              Select items to receive for Vendor: <span className="font-semibold">{selectedVendor.companyName}</span> from PO(s): {selectedPOs.map(p => (p as any).number).join(', ')}
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleBack}>
            <ChevronLeft className="mr-2 h-4 w-4" /> Back to PO Selection
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Location Filter
            LOCATION TYPE DISPLAY:
            Each location badge shows the location type icon to help users
            understand how items at that location will be processed.
        */}
        <div className="mb-4">
            <Label className='mr-2'>Filter by Location:</Label>
            <div className="flex flex-wrap gap-2 mt-1">
            {locations.map(loc => {
                // Find the location type for this location from any item
                const locItem = allPOItems.find(item => (item as any).location === loc);
                const locType = (locItem as any)?.locationType || 'INV';
                return (
                  <Badge
                    key={loc}
                    variant={selectedLocations.has(loc) ? getLocationBadgeVariant(locType) : 'outline'}
                    onClick={() => handleToggleLocation(loc)}
                    className="cursor-pointer flex items-center gap-1"
                  >
                    {getLocationTypeIcon(locType)}
                    {loc}
                    <span className="text-xs opacity-70">({getLocationTypeLabelLocal(locType)})</span>
                  </Badge>
                );
            })}
            </div>
        </div>

        {/* Alert for Direct Expense Locations */}
        {Array.from(selectedLocations).some(loc => {
          const locItem = allPOItems.find(item => (item as any).location === loc);
          return (locItem as any)?.locationType === 'DIR';
        }) && (
          <Alert className="mb-4 border-amber-200 bg-amber-50">
            <Info className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <strong>Direct Expense Location Selected:</strong> Items received to Direct locations
              will be expensed immediately without creating inventory stock.
            </AlertDescription>
          </Alert>
        )}

         {/* Search Input */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by Item Name, Description, or PO Number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        {/* Items Table */}
        <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox
                       checked={displayItems.length > 0 && selectedItemIds.size === displayItems.length && displayItems.every(item => selectedItemIds.has(item.id))}
                       onCheckedChange={handleToggleSelectAllItems}
                       aria-label="Select all items"
                    />
                  </TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>PO #</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="text-right">Ordered</TableHead>
                  <TableHead className="text-right">Remaining</TableHead>
                  <TableHead className="w-[200px] text-right">Receiving Qty / Unit</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayItems.length > 0 ? (
                  displayItems.map((item) => {
                    const receivingQty = itemQuantities[item.id] ?? 0;
                    const unitPrice = typeof item.unitPrice === 'number' ? item.unitPrice : (item.unitPrice as any)?.amount || 0;
                    const amount = receivingQty * unitPrice;
                    const baseAmount = amount * ((item as any).poExchangeRate || 1);
                    const remainingBaseQty = (item as any).pendingQuantity || (item as any).remainingQuantity * (item as any).convRate;
                    const currentReceivingUnit = itemReceivingUnits[item.id] || (item as any).orderUnit;
                    const baseReceivingQty = receivingQty * (item as any).convRate; // Calculation assumes convRate is based on orderUnit, needs adjustment if unit changes

                    // Placeholder units - replace with dynamic ones if available
                    const availableUnits = [(item as any).orderUnit, 'Kg', 'Pcs', 'Box', 'Pack'].filter((v, i, a) => a.indexOf(v) === i); 

                    return (
                      <TableRow key={item.id} data-state={selectedItemIds.has(item.id) ? "selected" : undefined}>
                        <TableCell>
                          <Checkbox
                            checked={selectedItemIds.has(item.id)}
                            onCheckedChange={() => handleToggleSelectItem(item.id)}
                            aria-label={`Select item ${(item as any).itemName || (item as any).name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{(item as any).itemName || (item as any).name}</div>
                          <div className="text-xs text-muted-foreground">{(item as any).description}</div>
                        </TableCell>
                        <TableCell>{(item as any).poNumber}</TableCell>
                        {/* Location Column with Type Indicator */}
                        <TableCell>
                          <div className="flex flex-col gap-0.5">
                            <span>{(item as any).location}</span>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              {getLocationTypeIcon((item as any).locationType || 'INV')}
                              <span>{getLocationTypeLabelLocal((item as any).locationType || 'INV')}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {(item as any).orderedQuantity} {(item as any).orderUnit}
                        </TableCell>
                        <TableCell className="text-right">
                          <div>{(item as any).pendingQuantity || (item as any).remainingQuantity} {(item as any).orderUnit}</div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Base: {remainingBaseQty.toFixed(2)} {(item as any).baseUnit || 'N/A'}
                          </div>
                        </TableCell>
                        {/* Receiving Qty & Unit Cell */}
                        <TableCell className="text-right">
                           <div className="flex items-center justify-end space-x-1">
                             <Input
                                type="number"
                                value={itemQuantities[item.id] ?? ''}
                                onChange={(e) => handleQuantityChange(item.id, e.target.value)}
                                onFocus={(e) => e.target.select()}
                                className="h-8 w-[60px] text-right" // Adjust width
                                max={(item as any).pendingQuantity || (item as any).remainingQuantity}
                                min={0}
                                step="any"
                                disabled={!selectedItemIds.has(item.id)}
                             />
                             <Select 
                               value={currentReceivingUnit}
                               onValueChange={(value) => handleUnitChange(item.id, value)}
                               disabled={!selectedItemIds.has(item.id)}
                             >
                               <SelectTrigger className="h-8 w-[80px]"> {/* Adjust width */}
                                 <SelectValue placeholder="Unit" />
                               </SelectTrigger>
                               <SelectContent>
                                 {availableUnits.map(unit => (
                                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                 ))}
                               </SelectContent>
                             </Select>
                           </div>
                          {/* Display Base Receiving Qty */}
                          <div className="text-xs text-muted-foreground mt-1 text-right">
                            {/* Note: Base calc might be inaccurate if unit changes without factor update */}
                            Base: {baseReceivingQty.toFixed(2)} {(item as any).baseUnit || 'N/A'}
                          </div>
                        </TableCell>
                        {/* Amount Cell (incl. Base Amount) */}
                        <TableCell className="text-right">
                           <div>{amount.toFixed(2)}</div>
                           <div className="text-xs text-muted-foreground">{(item as any).poCurrencyCode || 'N/A'}</div>
                           {/* Base Amount Below */}
                           <div className="text-xs text-muted-foreground mt-1">
                             Base: {baseAmount.toFixed(2)} {item.poBaseCurrencyCode || 'N/A'}
                           </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center"> {/* Updated colspan */}
                      No items found for the selected criteria.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center mt-4">
            <div>
                {selectedItemIds.size > 0 && (
                <span className="text-sm text-muted-foreground">
                    {selectedItemIds.size} item(s) selected.
                </span>
                )}
          </div>
          <Button onClick={handleNext} disabled={isNextDisabled}>
            Next: Confirm GRN
          </Button>
        </div>
      </CardContent>
    </Card>
  );
} 