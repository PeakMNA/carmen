import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoodsReceiveNoteItem } from "@/lib/types";
// UnitConversion type is not exported from '@/lib/types'
// Using any type for now
type UnitConversion = any;
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DialogHeader, DialogTitle } from "@/components/ui/custom-dialog"; // Keep custom dialog parts if needed by parent
import { format } from 'date-fns';
import { formatCurrency } from "@/lib/utils"; // Assuming this utility exists
import { getDynamicFieldsForCategory, getFieldLabel } from "@/lib/constants/categoryFields"; // Import helpers

// Define an empty item for adding new items
const emptyItem = {
  id: crypto.randomUUID(), // Use crypto for unique ID
  location: '',
  name: '',
  description: '',
  baseUnit: 'Kg', // Default base unit
  orderedQuantity: 0,
  orderUnit: '', // Add missing orderUnit
  receivedQuantity: 0,
  isFreeOfCharge: false,
  deliveryDate: new Date(),
  currency: 'USD',
  exchangeRate: 1,
  unitPrice: 0,
  subTotalAmount: 0,
  totalAmount: 0,
  taxRate: 0,
  taxAmount: 0,
  discountRate: 0,
  discountAmount: 0,
  netAmount: 0,
  baseCurrency: 'USD',
  baseQuantity: 0,
  baseUnitPrice: 0, // Use baseUnitPrice for calculations
  baseSubTotalAmount: 0,
  baseNetAmount: 0,
  baseTotalAmount: 0,
  baseTaxRate: 0,
  baseTaxAmount: 0,
  baseDiscountRate: 0,
  baseDiscountAmount: 0,
  conversionRate: 1,
  focConversionRate: 1, // Add focConversionRate
  extraCost: 0,
  inventoryOnHand: 0,
  inventoryOnOrder: 0,
  inventoryReorderThreshold: 0,
  inventoryRestockLevel: 0,
  purchaseOrderRef: '',
  lastPurchasePrice: 0,
  lastOrderDate: new Date(),
  lastVendor: '',
  lotNumber: '',
  deliveryPoint: '',
  taxIncluded: false,
  taxSystem: 'GST', // Default tax system to GST, adjust if needed
  adjustments: { discount: false, tax: false },
  unit: 'Kg', // Default unit
  jobCode: '',
  focQuantity: 0, // Add focQuantity
  focUnit: 'Kg', // Add focUnit
  isConsignment: false, // Add isConsignment
  isTaxInclusive: false, // Add isTaxInclusive - alias for taxIncluded? Use one.
  expiryDate: undefined, // Add expiryDate
  serialNumber: undefined, // Add serialNumber
  notes: undefined, // Add notes
};

// --- Placeholder Options for Dropdowns ---
// Replace with fetched data in a real app
const MOCK_PROJECT_CODES = [
  { value: "ALPHA-001", label: "Project Alpha (ALPHA-001)" },
  { value: "BETA-002", label: "Project Beta (BETA-002)" },
  { value: "GAMMA-003", label: "Project Gamma (GAMMA-003)" },
];
const MOCK_JOB_CODES = [
  { value: "JOB-2310-006", label: "Kitchen Reno (JOB-2310-006)" },
  { value: "JOB-2410-001", label: "Lobby Upgrade (JOB-2410-001)" },
];
const MOCK_JOB_NUMBERS = [
  { value: "FB-2024-Q1-001", label: "FB-2024-Q1-001" },
  { value: "FB-2024-Q1-002", label: "FB-2024-Q1-002" },
  { value: "FB-2024-Q2-001", label: "FB-2024-Q2-001" },
];
const MOCK_EVENTS = [
  { value: "CONF2024", label: "CONF2024" },
  { value: "TRADE2024", label: "TRADE2024" },
  { value: "SUMMIT2024", label: "SUMMIT2024" },
];
const MOCK_MARKET_SEGMENTS = [
  { value: "ENTERPRISE", label: "ENTERPRISE" },
  { value: "Commercial Construction", label: "Commercial Construction" },
  { value: "Residential", label: "Residential" },
  { value: "Hospitality", label: "Hospitality" },
];
const ADD_NEW_VALUE = "__add_new__";
// --- End Placeholders ---

interface ItemDetailFormProps {
  item: GoodsReceiveNoteItem | null;
  mode: "view" | "edit" | "add";
  categoryId?: string;
  productCode?: string;
  locationCode?: string;
  unitConversions?: UnitConversion[];
  onAddNewRecord?: (fieldType: 'projectCode' | 'jobCode' | 'marketSegment' | 'jobNumber' | 'event') => void;
  onRequestEdit?: () => void;
  onClose: () => void;
  onSave: (item: GoodsReceiveNoteItem) => void;
}

// Helper for formatting currency without symbol, adjust as needed
const formatAmountOnly = (amount: number) => {
    // Fallback for safety
    if (typeof amount !== 'number' || isNaN(amount)) {
        return '0.00'; 
    }
    return amount.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};

// Helper function to get the combined tax type string value
function getTaxTypeValue(taxSystem?: 'GST' | 'VAT', taxIncluded?: boolean): string {
    const system = taxSystem === 'VAT' ? 'vat' : 'gst'; // Default to gst if undefined
    const type = taxIncluded ? 'include' : 'add';
    return `${system}_${type}`;
}

export default function ItemDetailForm({
  item: initialItem,
  mode: currentMode,
  categoryId,
  productCode,
  locationCode,
  unitConversions,
  onAddNewRecord,
  onRequestEdit,
  onClose,
  onSave,
}: ItemDetailFormProps) {
  const [item, setItem] = useState<GoodsReceiveNoteItem>(initialItem ? { ...initialItem } : { ...emptyItem } as any);

  // Update local item state if initialItem prop changes
  useEffect(() => {
    setItem(initialItem ? { ...initialItem } : { ...emptyItem } as any);
  }, [initialItem]);

  const isReadOnly = currentMode === "view";
  const dynamicFieldsToShow = getDynamicFieldsForCategory(categoryId);

  // --- Recalculation Logic (extracted for clarity) ---
  const recalculateAmounts = useCallback((currentItem: GoodsReceiveNoteItem): GoodsReceiveNoteItem => {
    const updated = { ...currentItem };

    // --- Base Quantity Recalculation ---
    // DEPENDENCY: Requires Product.unitConversions and Product.baseUnit
    // Needs logic to find the correct conversionFactor based on selected unit/focUnit and baseUnit

    // Placeholder: Assume conversion rate is already correctly set on the item by handleChange
    // In a real implementation, this function might need access to unitConversions
    // or fetch them if not available.
    const itemConversionRate = (updated as any).conversionRate || 1; // Renamed variable
    const quantity = updated.receivedQuantity || 0;
    (updated as any).baseQuantity = parseFloat((quantity * itemConversionRate).toFixed(2)); // Use renamed variable

    // Placeholder: FOC Base Quantity Calculation
    const itemFocConversionRate = (updated as any).focConversionRate || itemConversionRate; // Renamed variable, default to item's main rate
    const itemFocQuantity = (updated as any).focQuantity || 0; // Renamed variable
    // TODO: Add a baseFocQuantity field to GoodsReceiveNoteItem if needed for tracking?
    // updated.baseFocQuantity = parseFloat((itemFocQuantity * itemFocConversionRate).toFixed(2)); // Use renamed variables

    // --- Other Calculations (Price, Tax, Discount, Totals) --- 
    const price = (updated as any).baseUnitPrice || 0; // Use baseUnitPrice from item state
    const discountRate = (updated as any).discountRate || 0;
    const taxRate = (updated as any).taxRate || 0;
    const exchangeRate = (updated as any).exchangeRate || 1;
    const isTaxIncluded = (updated as any).taxIncluded || false; // Consistent flag name
    const overrideDiscount = (updated as any).adjustments?.discount || false;
    const overrideTax = (updated as any).adjustments?.tax || false;
    const manualDiscountAmount = (updated as any).discountAmount || 0;
    const manualTaxAmount = (updated as any).taxAmount || 0;

    // Calculate subtotal (price * quantity)
    const subTotal = price * quantity;
    (updated as any).subTotalAmount = parseFloat(subTotal.toFixed(2));

    // Calculate discount amount
    let discountAmount = 0;
    if (overrideDiscount) {
      discountAmount = manualDiscountAmount;
      // Recalculate rate if amount is overridden and subTotal is not zero
      (updated as any).discountRate = subTotal > 0 ? parseFloat(((discountAmount / subTotal) * 100).toFixed(2)) : 0;
    } else {
      discountAmount = (subTotal * discountRate) / 100;
    }
    (updated as any).discountAmount = parseFloat(discountAmount.toFixed(2));

    // Calculate net amount (subtotal - discount)
    const netBeforeTax = subTotal - discountAmount;

    // Calculate tax amount
    let taxAmount = 0;
    if (overrideTax) {
        taxAmount = manualTaxAmount;
         // Recalculate rate if amount is overridden
        if (isTaxIncluded && (netBeforeTax - taxAmount) !== 0) {
            (updated as any).taxRate = parseFloat(((taxAmount / (netBeforeTax - taxAmount)) * 100).toFixed(2));
        } else if (!isTaxIncluded && netBeforeTax !== 0) {
            (updated as any).taxRate = parseFloat(((taxAmount / netBeforeTax) * 100).toFixed(2));
        } else {
            (updated as any).taxRate = 0;
        }
    } else {
        if (isTaxIncluded) {
            taxAmount = (netBeforeTax * taxRate) / (100 + taxRate);
        } else {
            taxAmount = (netBeforeTax * taxRate) / 100;
        }
    }
    (updated as any).taxAmount = parseFloat(taxAmount.toFixed(2));

    // Final calculations based on tax inclusion
    if (isTaxIncluded) {
      // Tax inclusive: net = (subtotal - discount) - tax
      (updated as any).netAmount = parseFloat((netBeforeTax - taxAmount).toFixed(2));
      // Total = net + tax = (subtotal - discount)
      (updated as any).totalAmount = parseFloat(netBeforeTax.toFixed(2));
    } else {
      // Tax exclusive: net = subtotal - discount
      (updated as any).netAmount = parseFloat(netBeforeTax.toFixed(2));
      // Total = net + tax
      (updated as any).totalAmount = parseFloat((netBeforeTax + taxAmount).toFixed(2));
    }

    // Calculate base currency values
    (updated as any).baseSubTotalAmount = parseFloat(((updated as any).subTotalAmount * exchangeRate).toFixed(2));
    (updated as any).baseDiscountAmount = parseFloat(((updated as any).discountAmount * exchangeRate).toFixed(2));
    (updated as any).baseNetAmount = parseFloat(((updated as any).netAmount * exchangeRate).toFixed(2));
    (updated as any).baseTaxAmount = parseFloat(((updated as any).taxAmount * exchangeRate).toFixed(2));
    (updated as any).baseTotalAmount = parseFloat(((updated as any).totalAmount * exchangeRate).toFixed(2));

    // Base quantity calculation moved earlier

    return updated;
  }, []); // Add unitConversions to dependency array if passed as prop


  // --- Local handleChange ---
  const handleChange = (field: keyof GoodsReceiveNoteItem | 'taxTypeCombined', value: any) => { // Allow combined type
    setItem(prev => {
      // --- Handle Combined Tax Type --- 
      if (field === 'taxTypeCombined') {
          const selectedValue = value as string;
          const newTaxSystem: 'GST' | 'VAT' = selectedValue.startsWith('vat') ? 'VAT' : 'GST';
          const newTaxIncluded = selectedValue.endsWith('include');
          
          const updatedItem = { 
              ...prev, 
              taxSystem: newTaxSystem,
              taxIncluded: newTaxIncluded
          };
          // Tax type change always triggers recalculation
          return recalculateAmounts(updatedItem);
      }

      // --- Handle Individual Fields (existing logic) ---
      let updatedValue: string | number | boolean | Date | undefined | { discount: boolean; tax: boolean; }; 

      // Define field groups for type checking
      const numberFields: Array<string> = [
          'orderedQuantity', 'receivedQuantity', 'focQuantity', 'unitPrice',
          'exchangeRate', 'taxRate', 'discountRate', 'discountAmount',
          'taxAmount', 'conversionRate', 'focConversionRate', 'baseUnitPrice',
          'subTotalAmount', 'totalAmount', 'netAmount', 'baseQuantity',
          'baseSubTotalAmount', 'baseNetAmount', 'baseTotalAmount',
          'baseTaxRate', 'baseTaxAmount', 'baseDiscountRate', 'baseDiscountAmount',
          'extraCost', 'inventoryOnHand', 'inventoryOnOrder',
          'inventoryReorderThreshold', 'inventoryRestockLevel', 'lastPurchasePrice'
      ];
      const dateFields: Array<string> = ['deliveryDate', 'expiryDate', 'lastOrderDate'];
      const booleanFields: Array<string> = ['taxIncluded', 'isFreeOfCharge', 'isConsignment', 'isTaxInclusive'];
      const adjustmentFields: Array<string> = ['adjustments'];

      // --- Parse/Convert based on field type --- 
      if (numberFields.includes(field as keyof GoodsReceiveNoteItem)) {
          updatedValue = parseFloat(value) || 0;
      } else if (dateFields.includes(field as keyof GoodsReceiveNoteItem)) {
          updatedValue = value instanceof Date ? value : (value ? new Date(value) : undefined);
      } else if (booleanFields.includes(field as keyof GoodsReceiveNoteItem)) {
          updatedValue = value === true;
      } else {
          updatedValue = value; 
      }

      // Create the updated item object safely 
      const updatedItemIntermediate = { 
          ...prev, 
          [field]: updatedValue as typeof prev[typeof field] 
      }; 

      // --- Handle Unit Changes and Conversion Rate Updates --- 
      // DEPENDENCY: Requires Product.unitConversions and Product.baseUnit 
      let needsRecalc = false;
      const fieldsTriggeringRecalc: string[] = [
        "receivedQuantity", "baseUnitPrice", "taxIncluded", "discountRate",
        "discountAmount", "taxRate", "adjustments", "exchangeRate", "focQuantity"
        // unit and focUnit trigger recalc below
      ];

      if (fieldsTriggeringRecalc.includes(field as keyof GoodsReceiveNoteItem)) {
          needsRecalc = true;
      }

      if ((field as string) === 'unit' || (field as string) === 'focUnit') {
           needsRecalc = true;
           const targetUnit = (updatedItemIntermediate as any)[field] as string;
           const baseUnit = (updatedItemIntermediate as any).baseUnit;
           
           // --- Conversion Factor Lookup Logic --- 
           let factor = 1; // Default if no conversion found
           if (unitConversions && baseUnit && targetUnit) {
               const conversion = unitConversions.find(
                   (uc) => uc.fromUnit === targetUnit && uc.toUnit === baseUnit
               );
               if (conversion) {
                   factor = conversion.conversionFactor;
               } else {
                   // Handle case where direct conversion isn't found (maybe log error or use default?)
                   console.warn(`Conversion from ${targetUnit} to ${baseUnit} not found in provided unitConversions. Using default factor 1.`);
               }
           } else {
                console.warn('Missing unitConversions, baseUnit, or targetUnit for conversion lookup.');
           }
           // --- End Lookup Logic --- 

           console.log(`${field} changed to ${targetUnit}. Found conversion factor: ${factor}. Recalculation needed.`);

           if (field === 'unit') {
               (updatedItemIntermediate as any).conversionRate = factor;
           } else { // focUnit
               (updatedItemIntermediate as any).focConversionRate = factor;
           }
       }

      // --- Recalculate if a relevant field changed ---
      if (needsRecalc) {
        return recalculateAmounts(updatedItemIntermediate);
      }

      return updatedItemIntermediate; // Return intermediate if no recalc needed
    });
  };

  // Handle checkbox changes for adjustments specifically
  const handleAdjustmentChange = (field: 'discount' | 'tax', checked: boolean | string) => {
       const isChecked = checked === true;
       setItem(prev => {
           const updatedAdjustments = { ...(prev as any).adjustments, [field]: isChecked };
           const updatedItem = { ...prev, adjustments: updatedAdjustments };
           return recalculateAmounts(updatedItem);
       });
   };

  // --- Component State Handling ---
  const handleCancel = () => {
    if (currentMode === "add") {
      onClose();
    } else {
      setItem(initialItem || emptyItem as any);
      onClose();
    }
  };
  const handleSave = () => {
    const finalItem = recalculateAmounts(item);
    onSave(finalItem);
  };

  // Placeholder unit options - TODO: Fetch these based on item/system config
  const unitOptions = ["Kg", "Pcs", "Box", "Pack", "L", "mL", "Set", "Unit"];

  // --- Dropdown Change Handler ---
  const handleDynamicSelectChange = (field: 'jobCode', value: string) => {
    if (value === ADD_NEW_VALUE) {
        onAddNewRecord?.(field);
        console.log(`Add new for field: ${field}`);
    } else {
        handleChange(field as any, value);
    }
  };

  return (
    <>
      <DialogHeader>
        <div className="flex justify-between items-center">
           {/* Title */}
          <DialogTitle>
            {currentMode === "edit"
              ? "Edit Item"
              : currentMode === "view"
              ? "View Item Details"
              : "Add New Item"}
          </DialogTitle>
           {/* Action Buttons */}
          <div>
            {currentMode === "view" && onRequestEdit && (
              <Button size="sm" onClick={onRequestEdit}>
                Edit
              </Button>
            )}
            {(currentMode === "edit" || currentMode === "add") && (
              <div className="flex justify-end space-x-2">
                <Button variant="outline" size="sm" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave}>
                  Save
                </Button>
              </div>
            )}
          </div>
        </div>
      </DialogHeader>

      {/* Form Content */}
      <div className="py-4 space-y-6 max-h-[70vh] overflow-y-auto pr-2">
        {/* Basic Information */}
        <Card>
            <CardHeader>
                <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <Label htmlFor="location">Location</Label>
                        {isReadOnly ? (
                            <div className="mt-1 text-sm font-medium">
                                {(item as any).location || "N/A"}
                            </div>
                        ) : (
                            <Input id="location" value={(item as any).location || ''} onChange={(e) => handleChange('location' as any, e.target.value)} readOnly={isReadOnly} />
                        )}
                        <p className="text-sm text-gray-500 mt-1">{locationCode || '\u00A0'}</p>
                    </div>
                    <div>
                        <Label htmlFor="productName">Product Name</Label>
                        {isReadOnly ? (
                            <div className="mt-1 text-sm font-medium">
                                {(item as any).name || "N/A"}
                            </div>
                        ) : (
                            <Input id="productName" value={(item as any).name || ''} onChange={(e) => handleChange('name' as any, e.target.value)} readOnly={isReadOnly} />
                        )}
                        <p className="text-sm text-gray-500 mt-1">{productCode || '\u00A0'}</p>
                    </div>
                    <div>
                        <Label htmlFor="description">Description</Label>
                        {isReadOnly ? (
                            <div className="mt-1 text-sm font-medium">
                                {item.description || "N/A"}
                            </div>
                        ) : (
                            <Input id="description" value={item.description || ''} onChange={(e) => handleChange('description', e.target.value)} readOnly={isReadOnly} />
                        )}
                    </div>
                     <div>
                        <Label htmlFor="purchaseOrderRef">PO Reference</Label>
                        {isReadOnly ? (
                            <div className="mt-1 text-sm font-medium">
                                {(item as any).purchaseOrderRef || "N/A"}
                            </div>
                        ) : (
                            <Input id="purchaseOrderRef" value={(item as any).purchaseOrderRef || ''} onChange={(e) => handleChange('purchaseOrderRef' as any, e.target.value)} readOnly={isReadOnly} />
                        )}
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                 </div>
                 <div>
                    <Label htmlFor="notes">Notes</Label>
                    {isReadOnly ? (
                        <div className="mt-1 text-sm font-medium">
                            {item.notes || "N/A"}
                        </div>
                    ) : (
                        <Input id="notes" value={item.notes || ''} onChange={(e) => handleChange('notes', e.target.value)} readOnly={isReadOnly} />
                    )}
                 </div>
            </CardContent>
        </Card>

        {/* Business Dimension Section */}
        <Card>
            <CardHeader>
                <CardTitle>Business Dimensions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        {/* Job Number */}
                        <div>
                            <Label htmlFor="jobCode">Job Code</Label>
                            {isReadOnly ? (
                                <div className="mt-1 text-sm font-medium">
                                    {(item as any).jobCode || "N/A"}
                                </div>
                            ) : (
                                <Select
                                    value={(item as any).jobCode || ""} 
                                    onValueChange={(value) => handleDynamicSelectChange('jobCode', value)}
                                    disabled={isReadOnly}
                                >
                                    <SelectTrigger id="jobNumber" className="mt-1">
                                        <SelectValue placeholder="Select Job Number..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MOCK_JOB_NUMBERS.map(option => (
                                            <SelectItem key={option.value} value={option.value}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                        <SelectItem value={ADD_NEW_VALUE} className="text-blue-600 italic">
                                            Add New Job Number...
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                    </div>

                    {/* Right Column */}
                    <div className="space-y-4">
                        {/* Additional fields can be added here that exist in GoodsReceiveNoteItem interface */}
                        <div className="text-sm text-gray-500">
                            Additional business dimension fields coming soon.
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Quantity and Delivery */}
        <Card>
             <CardHeader>
                <CardTitle>Quantity and Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                    <div>
                        <Label htmlFor="orderedQuantity">Ordered Qty</Label>
                        {/* Always read-only */}
                        <div className="mt-1 text-sm font-medium bg-gray-50 p-2 rounded border">
                            {item.orderedQuantity}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Base: {formatAmountOnly((item.orderedQuantity || 0) * (item as any).conversionRate)} {(item as any).baseUnit}</p>
                    </div>
                    <div>
                        <Label htmlFor="orderUnit">Ordered Unit</Label>
                        {/* Always read-only */}
                        <div className="mt-1 text-sm font-medium bg-gray-50 p-2 rounded border">
                            {(item as any).orderUnit || 'N/A'}
                        </div>
                         <p className="text-sm text-gray-500 mt-1">&nbsp;</p> {/* Spacer */}
                    </div>
                    <div>
                        <Label htmlFor="receivedQuantity">Receiving Qty</Label>
                        {isReadOnly ? (
                            <div className="mt-1 text-sm font-medium">
                                {item.receivedQuantity}
                            </div>
                        ) : (
                            <Input id="receivedQuantity" type="number" value={item.receivedQuantity} onChange={(e) => handleChange('receivedQuantity', e.target.value)} readOnly={isReadOnly} />
                        )}
                         <p className="text-sm text-gray-500 mt-1">Base: {formatAmountOnly((item as any).baseQuantity)} {(item as any).baseUnit}</p>
                    </div>
                    <div>
                        <Label htmlFor="unit">Unit</Label>
                        {isReadOnly ? (
                            <div className="mt-1 text-sm font-medium">
                                {(item as any).unit || 'N/A'}
                            </div>
                        ) : (
                            <Select value={(item as any).unit || ''} onValueChange={(value) => handleChange('unit' as any, value)} disabled={isReadOnly}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {unitOptions.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                        <p className="text-sm text-gray-500 mt-1">1 {(item as any).unit} = {(item as any).conversionRate} {(item as any).baseUnit}</p>
                    </div>
                    <div>
                        <Label htmlFor="focQuantity">FOC Qty</Label>
                        {isReadOnly ? (
                            <div className="mt-1 text-sm font-medium">
                                {(item as any).focQuantity || 0}
                            </div>
                        ) : (
                            <Input id="focQuantity" type="number" value={(item as any).focQuantity || 0} onChange={(e) => handleChange('focQuantity' as any, e.target.value)} readOnly={isReadOnly} />
                        )}
                         {/* TODO: Display Base FOC Qty */}
                        <p className="text-sm text-gray-500 mt-1">Base: {/* Calculate Base FOC Qty */} {(item as any).baseUnit}</p>
                    </div>
                     <div>
                        <Label htmlFor="focUnit">FOC Unit</Label>
                        {isReadOnly ? (
                            <div className="mt-1 text-sm font-medium">
                                {(item as any).focUnit || 'N/A'}
                            </div>
                        ) : (
                            <Select value={(item as any).focUnit || ''} onValueChange={(value) => handleChange('focUnit' as any, value)} disabled={isReadOnly}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {unitOptions.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        )}
                         {/* TODO: Display FOC Conversion Rate */}
                        <p className="text-sm text-gray-500 mt-1">1 {(item as any).focUnit} = {(item as any).focConversionRate} {(item as any).baseUnit}</p>
                    </div>
                    <div>
                        <Label htmlFor="deliveryPoint">Delivery Point</Label>
                        {isReadOnly ? (
                            <div className="mt-1 text-sm font-medium">
                                {(item as any).deliveryPoint || 'N/A'}
                            </div>
                        ) : (
                            <Select value={(item as any).deliveryPoint || ''} onValueChange={(value) => handleChange('deliveryPoint' as any, value)} disabled={isReadOnly}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    {/* TODO: Populate options dynamically */}
                                    <SelectItem value="kitchen">Kitchen Receiving</SelectItem>
                                    <SelectItem value="warehouse">Warehouse</SelectItem>
                                    <SelectItem value="frontdesk">Front Desk</SelectItem>
                                 </SelectContent>
                            </Select>
                        )}
                         <p className="text-sm text-gray-500 mt-1">&nbsp;</p> {/* Spacer */}
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Pricing & Calculations */}
         <Card>
            <CardHeader>
                <CardTitle>Pricing & Calculation</CardTitle>
            </CardHeader>
            <CardContent>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Side - Inputs */}
                    <div className="space-y-4">
                         <h3 className="text-lg font-semibold mb-2">Pricing</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="currency">Currency</Label>
                                {isReadOnly ? (
                                    <div className="mt-1 text-sm font-medium">
                                        {(item as any).currency || 'N/A'}
                                    </div>
                                ) : (
                                    <Select value={(item as any).currency || ''} onValueChange={(value) => handleChange('currency' as any, value)} disabled={isReadOnly}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            {/* TODO: Populate options dynamically */}
                                            <SelectItem value="USD">USD</SelectItem>
                                            <SelectItem value="EUR">EUR</SelectItem>
                                            <SelectItem value="GBP">GBP</SelectItem>
                                            <SelectItem value="THB">THB</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                            <div>
                                <Label htmlFor="exchangeRate">Exch. Rate</Label>
                                {isReadOnly ? (
                                    <div className="mt-1 text-sm font-medium">
                                        {(item as any).exchangeRate}
                                    </div>
                                ) : (
                                    <Input id="exchangeRate" type="number" value={(item as any).exchangeRate} onChange={(e) => handleChange('exchangeRate' as any, e.target.value)} readOnly={isReadOnly} />
                                )}
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="baseUnitPrice">Price (Base Unit)</Label>
                                {isReadOnly ? (
                                    <div className="mt-1 text-sm font-medium">
                                        {formatAmountOnly((item as any).baseUnitPrice)}
                                    </div>
                                ) : (
                                    <Input id="baseUnitPrice" type="number" value={(item as any).baseUnitPrice} onChange={(e) => handleChange('baseUnitPrice' as any, e.target.value)} readOnly={isReadOnly}/>
                                )}
                            </div>
                             <div>
                                <Label htmlFor="taxType">Tax Type</Label>
                                {isReadOnly ? (
                                    <div className="mt-1 text-sm font-medium">
                                        {(item as any).taxSystem === 'VAT' ? 'VAT' : 'GST'} {(item as any).taxIncluded ? 'Include' : 'Add'}
                                    </div>
                                ) : (
                                    <Select 
                                        value={getTaxTypeValue((item as any).taxSystem, (item as any).taxIncluded)} 
                                        onValueChange={(value) => handleChange('taxTypeCombined', value)} // Use combined handler
                                        disabled={isReadOnly}
                                    >
                                        <SelectTrigger id="taxType"><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gst_add">GST Add</SelectItem>
                                            <SelectItem value="gst_include">GST Include</SelectItem>
                                            <SelectItem value="vat_add">VAT Add</SelectItem>
                                            <SelectItem value="vat_include">VAT Include</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>
                         </div>

                         <Separator className="my-4" />
                          <h3 className="text-lg font-semibold mb-2">Adjustments</h3>

                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="discountRate">Disc. Rate (%)</Label>
                                {isReadOnly ? (
                                    <div className="mt-1 text-sm font-medium">
                                        {(item as any).discountRate}%
                                    </div>
                                ) : (
                                    <Input id="discountRate" type="number" value={(item as any).discountRate} onChange={(e) => handleChange('discountRate' as any, e.target.value)} readOnly={isReadOnly || !!(item as any).adjustments?.discount} className={(item as any).adjustments?.discount ? 'bg-gray-100' : ''}/>
                                )}
                            </div>
                             <div>
                                {isReadOnly ? (
                                    <>
                                        <Label>Discount Override</Label>
                                        <div className="mt-1 text-sm font-medium">
                                            {(item as any).adjustments?.discount ? `Yes (${formatAmountOnly((item as any).discountAmount)})` : 'No'}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center space-x-2 mb-2">
                                            <Checkbox id="adjDiscount" checked={(item as any).adjustments?.discount} onCheckedChange={(checked) => handleAdjustmentChange('discount', checked)} disabled={isReadOnly} />
                                            <Label htmlFor="adjDiscount">Override Discount Amount</Label>
                                        </div>
                                        <Input id="discountAmount" type="number" value={(item as any).discountAmount} onChange={(e) => handleChange('discountAmount' as any, e.target.value)} readOnly={isReadOnly || !(item as any).adjustments?.discount} className={!(item as any).adjustments?.discount ? 'bg-gray-100' : ''}/>
                                    </>
                                )}
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="taxRate">Tax Rate (%)</Label>
                                {isReadOnly ? (
                                    <div className="mt-1 text-sm font-medium">
                                        {(item as any).taxRate}%
                                    </div>
                                ) : (
                                    <Input id="taxRate" type="number" value={(item as any).taxRate} onChange={(e) => handleChange('taxRate' as any, e.target.value)} readOnly={isReadOnly || !!(item as any).adjustments?.tax} className={(item as any).adjustments?.tax ? 'bg-gray-100' : ''}/>
                                )}
                            </div>
                             <div>
                                {isReadOnly ? (
                                    <>
                                        <Label>Tax Override</Label>
                                        <div className="mt-1 text-sm font-medium">
                                            {(item as any).adjustments?.tax ? `Yes (${formatAmountOnly((item as any).taxAmount)})` : 'No'}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-center space-x-2 mb-2">
                                             <Checkbox id="adjTax" checked={(item as any).adjustments?.tax} onCheckedChange={(checked) => handleAdjustmentChange('tax', checked)} disabled={isReadOnly} />
                                            <Label htmlFor="adjTax">Override Tax Amount</Label>
                                        </div>
                                        <Input id="taxAmount" type="number" value={(item as any).taxAmount} onChange={(e) => handleChange('taxAmount' as any, e.target.value)} readOnly={isReadOnly || !(item as any).adjustments?.tax} className={!(item as any).adjustments?.tax ? 'bg-gray-100' : ''}/>
                                    </>
                                )}
                             </div>
                         </div>

                    </div>

                    {/* Right Side - Calculated Amounts */}
                    <div className="space-y-2">
                         <h3 className="text-lg font-semibold mb-2">Calculated Amounts</h3>
                        <div className="grid grid-cols-3 gap-4 items-center py-1">
                            <p className="text-sm text-gray-500">Description</p>
                            <p className="text-sm text-gray-500 text-right">Amount ({(item as any).currency})</p>
                            <p className="text-sm text-gray-500 text-right">Base Amount ({(item as any).baseCurrency})</p>
                        </div>
                        <Separator />
                         <div className="grid grid-cols-3 gap-4 items-center py-1">
                            <p className="font-medium">Subtotal</p>
                            <p className="font-medium text-right">{formatAmountOnly((item as any).subTotalAmount)}</p>
                            <p className="text-gray-600 text-right">{formatAmountOnly((item as any).baseSubTotalAmount)}</p>
                         </div>
                         <div className="grid grid-cols-3 gap-4 items-center py-1">
                            <p className="font-medium">Discount</p>
                            <p className="font-medium text-right">{formatAmountOnly((item as any).discountAmount)}</p>
                            <p className="text-gray-600 text-right">{formatAmountOnly((item as any).baseDiscountAmount)}</p>
                         </div>
                         <div className="grid grid-cols-3 gap-4 items-center py-1">
                            <p className="font-medium">Net Amount</p>
                            <p className="font-medium text-right">{formatAmountOnly((item as any).netAmount)}</p>
                            <p className="text-gray-600 text-right">{formatAmountOnly((item as any).baseNetAmount)}</p>
                         </div>
                         <div className="grid grid-cols-3 gap-4 items-center py-1">
                             <p className="font-medium">Tax</p>
                            <p className="font-medium text-right">{formatAmountOnly((item as any).taxAmount)}</p>
                            <p className="text-gray-600 text-right">{formatAmountOnly((item as any).baseTaxAmount)}</p>
                         </div>
                         <Separator />
                         <div className="grid grid-cols-3 gap-4 items-center py-1">
                             <p className="font-bold">Total Amount</p>
                            <p className="font-bold text-right">{formatAmountOnly((item as any).totalAmount)}</p>
                            <p className="font-bold text-right">{formatAmountOnly((item as any).baseTotalAmount)}</p>
                        </div>

                         {/* Item Status Section (Example) */}
                         {currentMode !== 'add' && (
                            <div className="mt-6 bg-blue-50 p-4 rounded-md border border-blue-200">
                                <h3 className="font-medium text-blue-800 mb-2">Item Info</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Inventory On Hand</p>
                                        <p className="text-sm">{(item as any).inventoryOnHand} {(item as any).baseUnit}</p>
                                    </div>
                                    <div>
                                         <p className="text-sm text-gray-600">Last Purchase Price</p>
                                         {/* Ensure formatCurrency handles potential non-numeric values gracefully or check (item as any).lastPurchasePrice */} 
                                        <p className="text-sm">{formatCurrency((item as any).lastPurchasePrice || 0)}</p>
                                    </div>
                                     <div>
                                        <p className="text-sm text-gray-600">Last Order Date</p>
                                        <p className="text-sm">{(item as any).lastOrderDate ? format(new Date((item as any).lastOrderDate), 'PP') : 'N/A'}</p> {/* Ensure Date object */} 
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Last Vendor</p>
                                        <p className="text-sm">{(item as any).lastVendor || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                         )}
                    </div>
                 </div>
            </CardContent>
         </Card>

      </div>
    </>
  );
}
