"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  X,
  Edit,
  Package,
  Calculator,
  Truck,
  FileText,
  Info,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
} from "lucide-react";
import { GoodsReceiveNoteItem } from "@/lib/types";
import { mockCurrencies } from "@/lib/mock-data";

// UnitConversion type placeholder
type UnitConversion = any;

/**
 * Related PR allocation for a GRN item
 * Tracks how receiving quantity is allocated across multiple PRs
 */
export interface RelatedPRAllocation {
  id: string;
  prNumber: string;
  prLineNumber: number;
  prLineItemId: string;
  // Business context from PR
  jobCode?: string;
  jobCodeName?: string;
  event?: string;
  eventName?: string;
  project?: string;
  projectName?: string;
  marketSegment?: string;
  marketSegmentName?: string;
  requester?: string;
  requesterDepartment?: string;
  // Quantity tracking
  requestedQty: number;
  requestedUnit: string;
  requestedBaseQty: number;
  requestedBaseUnit: string;
  previouslyReceivedQty: number;
  previouslyReceivedBaseQty: number;
  thisGrnQty: number;
  thisGrnBaseQty: number;
  remainingQty: number;
  remainingBaseQty: number;
  // Conversion
  conversionRate: number;
}

/**
 * Extended GRN Item type for form handling
 */
export interface FormGRNItem {
  id: string;
  grnId?: string;
  location: string;
  name: string;
  description: string;
  baseUnit: string;
  orderedQuantity: number;
  orderUnit: string;
  receivedQuantity: number;
  deliveredQuantity?: number;
  rejectedQuantity?: number;
  damagedQuantity?: number;
  isFreeOfCharge: boolean;
  deliveryDate?: Date;
  currency: string;
  exchangeRate: number;
  unitPrice: number;
  subTotalAmount: number;
  totalAmount: number;
  taxRate: number;
  taxAmount: number;
  discountRate: number;
  discountAmount: number;
  netAmount: number;
  baseCurrency: string;
  baseQuantity: number;
  baseUnitPrice: number;
  baseSubTotalAmount: number;
  baseNetAmount: number;
  baseTotalAmount: number;
  baseTaxRate: number;
  baseTaxAmount: number;
  baseDiscountRate: number;
  baseDiscountAmount: number;
  conversionRate: number;
  focConversionRate: number;
  extraCost: number;
  inventoryOnHand: number;
  inventoryOnOrder: number;
  inventoryReorderThreshold: number;
  inventoryRestockLevel: number;
  purchaseOrderRef: string;
  lastPurchasePrice: number;
  lastOrderDate?: Date;
  lastVendor: string;
  lotNumber: string;
  batchNumber?: string;
  deliveryPoint: string;
  taxIncluded: boolean;
  taxSystem: 'GST' | 'VAT';
  adjustments: { discount: boolean; tax: boolean };
  unit: string;
  jobCode: string;
  event?: string;
  project?: string;
  marketSegment?: string;
  focQuantity: number;
  focUnit: string;
  isConsignment: boolean;
  isTaxInclusive: boolean;
  expiryDate?: Date;
  serialNumber?: string;
  notes?: string;
  hasDiscrepancy?: boolean;
  discrepancyType?: 'quantity' | 'quality' | 'specification' | 'damage';
  discrepancyNotes?: string;
  // Related PRs - business context comes from PR level
  relatedPRs: RelatedPRAllocation[];
}

// Get base currency from mock data
const baseCurrency = mockCurrencies.find(c => c.isBaseCurrency)?.code || 'USD';

// Define an empty item for adding new items
const emptyItem: FormGRNItem = {
  id: crypto.randomUUID(),
  location: '',
  name: '',
  description: '',
  baseUnit: 'Kg',
  orderedQuantity: 0,
  orderUnit: '',
  receivedQuantity: 0,
  isFreeOfCharge: false,
  deliveryDate: new Date(),
  currency: baseCurrency,
  exchangeRate: 1,
  unitPrice: 0,
  subTotalAmount: 0,
  totalAmount: 0,
  taxRate: 0,
  taxAmount: 0,
  discountRate: 0,
  discountAmount: 0,
  netAmount: 0,
  baseCurrency: baseCurrency,
  baseQuantity: 0,
  baseUnitPrice: 0,
  baseSubTotalAmount: 0,
  baseNetAmount: 0,
  baseTotalAmount: 0,
  baseTaxRate: 0,
  baseTaxAmount: 0,
  baseDiscountRate: 0,
  baseDiscountAmount: 0,
  conversionRate: 1,
  focConversionRate: 1,
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
  taxSystem: 'GST',
  adjustments: { discount: false, tax: false },
  unit: 'Kg',
  jobCode: '',
  focQuantity: 0,
  focUnit: 'Kg',
  isConsignment: false,
  isTaxInclusive: false,
  expiryDate: undefined,
  serialNumber: undefined,
  notes: undefined,
  relatedPRs: [],
};

// Mock options for dropdowns
const MOCK_JOB_NUMBERS = [
  { value: "FB-2024-Q1-001", label: "FB-2024-Q1-001" },
  { value: "FB-2024-Q1-002", label: "FB-2024-Q1-002" },
  { value: "FB-2024-Q2-001", label: "FB-2024-Q2-001" },
];

const MOCK_EVENTS = [
  { value: "CONF2024", label: "Annual Conference 2024" },
  { value: "TRADE2024", label: "Trade Show 2024" },
  { value: "SUMMIT2024", label: "Leadership Summit 2024" },
];

const MOCK_PROJECTS = [
  { value: "PROJ001", label: "Digital Transformation" },
  { value: "PROJ002", label: "Sustainability Initiative" },
  { value: "PROJ003", label: "Infrastructure Upgrade" },
];

const MOCK_MARKET_SEGMENTS = [
  { value: "ENTERPRISE", label: "Enterprise" },
  { value: "HOSPITALITY", label: "Hospitality" },
  { value: "RETAIL", label: "Retail" },
];

const deliveryPointOptions = [
  { value: "main-kitchen", label: "Main Kitchen" },
  { value: "storage-room", label: "Storage Room" },
  { value: "receiving-dock", label: "Receiving Dock" },
  { value: "cold-storage", label: "Cold Storage" },
  { value: "dry-storage", label: "Dry Storage" },
  { value: "bar-storage", label: "Bar Storage" },
  { value: "housekeeping", label: "Housekeeping" },
  { value: "maintenance", label: "Maintenance" },
  { value: "restaurant", label: "Restaurant" },
];

const ADD_NEW_VALUE = "__add_new__";

// Mock related PRs for demonstration
const MOCK_RELATED_PRS: RelatedPRAllocation[] = [
  {
    id: "pr-alloc-1",
    prNumber: "PR-2412-0015",
    prLineNumber: 1,
    prLineItemId: "pr-line-001",
    jobCode: "FB-2024-Q1-001",
    jobCodeName: "F&B Q1 Operations",
    event: "CONF2024",
    eventName: "Annual Conference 2024",
    project: "PROJ001",
    projectName: "Digital Transformation",
    marketSegment: "ENTERPRISE",
    marketSegmentName: "Enterprise",
    requester: "John Smith",
    requesterDepartment: "Kitchen",
    requestedQty: 100,
    requestedUnit: "Carton",
    requestedBaseQty: 1000,
    requestedBaseUnit: "Kg",
    previouslyReceivedQty: 60,
    previouslyReceivedBaseQty: 600,
    thisGrnQty: 30,
    thisGrnBaseQty: 300,
    remainingQty: 10,
    remainingBaseQty: 100,
    conversionRate: 10,
  },
  {
    id: "pr-alloc-2",
    prNumber: "PR-2412-0018",
    prLineNumber: 2,
    prLineItemId: "pr-line-002",
    jobCode: "FB-2024-Q2-001",
    jobCodeName: "F&B Q2 Operations",
    event: "TRADE2024",
    eventName: "Trade Show 2024",
    project: "PROJ002",
    projectName: "Sustainability Initiative",
    marketSegment: "HOSPITALITY",
    marketSegmentName: "Hospitality",
    requester: "Jane Doe",
    requesterDepartment: "Restaurant",
    requestedQty: 50,
    requestedUnit: "Carton",
    requestedBaseQty: 500,
    requestedBaseUnit: "Kg",
    previouslyReceivedQty: 20,
    previouslyReceivedBaseQty: 200,
    thisGrnQty: 10,
    thisGrnBaseQty: 100,
    remainingQty: 20,
    remainingBaseQty: 200,
    conversionRate: 10,
  },
];

// Type that accepts both GoodsReceiveNoteItem and FormGRNItem for compatibility
type GRNItemInput = GoodsReceiveNoteItem | FormGRNItem | null;

/**
 * Converts any incoming GRN item to the form's internal FormGRNItem format
 */
function toFormGRNItem(input: GRNItemInput): FormGRNItem {
  if (!input) {
    return { ...emptyItem };
  }

  const item = input as any;
  return {
    id: item.id || crypto.randomUUID(),
    grnId: item.grnId,
    location: item.location || item.storageLocationId || '',
    name: item.name || item.itemName || '',
    description: item.description || '',
    baseUnit: item.baseUnit || item.unit || 'Kg',
    orderedQuantity: item.orderedQuantity || 0,
    orderUnit: item.orderUnit || item.unit || '',
    receivedQuantity: item.receivedQuantity || 0,
    deliveredQuantity: item.deliveredQuantity,
    rejectedQuantity: item.rejectedQuantity,
    damagedQuantity: item.damagedQuantity,
    isFreeOfCharge: item.isFreeOfCharge || false,
    deliveryDate: item.deliveryDate,
    currency: item.currency || baseCurrency,
    exchangeRate: item.exchangeRate || 1,
    unitPrice: typeof item.unitPrice === 'object' ? item.unitPrice.amount : (item.unitPrice || 0),
    subTotalAmount: item.subTotalAmount || 0,
    totalAmount: typeof item.totalValue === 'object' ? item.totalValue.amount : (item.totalAmount || 0),
    taxRate: item.taxRate || 0,
    taxAmount: item.taxAmount || 0,
    discountRate: item.discountRate || 0,
    discountAmount: item.discountAmount || 0,
    netAmount: item.netAmount || 0,
    baseCurrency: item.baseCurrency || baseCurrency,
    baseQuantity: item.baseQuantity || 0,
    baseUnitPrice: item.baseUnitPrice || 0,
    baseSubTotalAmount: item.baseSubTotalAmount || 0,
    baseNetAmount: item.baseNetAmount || 0,
    baseTotalAmount: item.baseTotalAmount || 0,
    baseTaxRate: item.baseTaxRate || 0,
    baseTaxAmount: item.baseTaxAmount || 0,
    baseDiscountRate: item.baseDiscountRate || 0,
    baseDiscountAmount: item.baseDiscountAmount || 0,
    conversionRate: item.conversionRate || 1,
    focConversionRate: item.focConversionRate || 1,
    extraCost: item.extraCost || 0,
    inventoryOnHand: item.inventoryOnHand || 0,
    inventoryOnOrder: item.inventoryOnOrder || 0,
    inventoryReorderThreshold: item.inventoryReorderThreshold || 0,
    inventoryRestockLevel: item.inventoryRestockLevel || 0,
    purchaseOrderRef: item.purchaseOrderRef || item.purchaseOrderId || '',
    lastPurchasePrice: item.lastPurchasePrice || 0,
    lastOrderDate: item.lastOrderDate,
    lastVendor: item.lastVendor || '',
    lotNumber: item.lotNumber || item.batchNumber || '',
    batchNumber: item.batchNumber,
    deliveryPoint: item.deliveryPoint || '',
    taxIncluded: item.taxIncluded || false,
    taxSystem: item.taxSystem || 'GST',
    adjustments: item.adjustments || { discount: false, tax: false },
    unit: item.unit || 'Kg',
    jobCode: item.jobCode || '',
    event: item.event,
    project: item.project,
    marketSegment: item.marketSegment,
    focQuantity: item.focQuantity || 0,
    focUnit: item.focUnit || 'Kg',
    isConsignment: item.isConsignment || false,
    isTaxInclusive: item.isTaxInclusive || false,
    expiryDate: item.expiryDate,
    serialNumber: item.serialNumber || (item.serialNumbers && item.serialNumbers[0]),
    notes: item.notes,
    hasDiscrepancy: item.hasDiscrepancy,
    discrepancyType: item.discrepancyType,
    discrepancyNotes: item.discrepancyNotes,
    relatedPRs: item.relatedPRs || MOCK_RELATED_PRS, // Use mock data for demo
  };
}

interface ItemDetailFormProps {
  item: GRNItemInput;
  mode: "view" | "edit" | "add";
  categoryId?: string;
  productCode?: string;
  locationCode?: string;
  unitConversions?: UnitConversion[];
  onAddNewRecord?: (fieldType: 'projectCode' | 'jobCode' | 'marketSegment' | 'jobNumber' | 'event') => void;
  onRequestEdit?: () => void;
  onClose: () => void;
  onSave: (item: any) => void;
  onModeChange?: (mode: "view" | "edit" | "add") => void;
}

// Helper for formatting currency
const formatAmountOnly = (amount: number) => {
  if (typeof amount !== 'number' || isNaN(amount)) return '0.00';
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

// Helper function to get the combined tax type string value
function getTaxTypeValue(taxSystem?: 'GST' | 'VAT', taxIncluded?: boolean): string {
  const system = taxSystem === 'VAT' ? 'vat' : 'gst';
  const type = taxIncluded ? 'include' : 'add';
  return `${system}_${type}`;
}

export default function ItemDetailForm({
  item: initialItem,
  mode: initialMode,
  categoryId,
  productCode,
  locationCode,
  unitConversions,
  onAddNewRecord,
  onRequestEdit,
  onClose,
  onSave,
  onModeChange,
}: ItemDetailFormProps) {
  const [item, setItem] = useState<FormGRNItem>(() => toFormGRNItem(initialItem));
  const [mode, setMode] = useState<"view" | "edit" | "add">(initialMode);
  const [expandedPRRows, setExpandedPRRows] = useState<Set<string>>(new Set());

  // Update local state when props change
  useEffect(() => {
    setItem(toFormGRNItem(initialItem));
  }, [initialItem]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const isReadOnly = mode === "view";
  const unitOptions = ["Kg", "Pcs", "Box", "Pack", "L", "mL", "Set", "Unit", "Bag", "Carton"];

  // Handle mode change
  const handleModeChange = (newMode: "view" | "edit" | "add") => {
    setMode(newMode);
    onModeChange?.(newMode);
  };

  // --- Recalculation Logic ---
  const recalculateAmounts = useCallback((currentItem: FormGRNItem): FormGRNItem => {
    const updated = { ...currentItem };
    const itemConversionRate = updated.conversionRate || 1;
    const quantity = updated.receivedQuantity || 0;
    updated.baseQuantity = parseFloat((quantity * itemConversionRate).toFixed(2));

    const price = updated.baseUnitPrice || 0;
    const discountRate = updated.discountRate || 0;
    const taxRate = updated.taxRate || 0;
    const exchangeRate = updated.exchangeRate || 1;
    const isTaxIncluded = updated.taxIncluded || false;
    const overrideDiscount = updated.adjustments?.discount || false;
    const overrideTax = updated.adjustments?.tax || false;
    const manualDiscountAmount = updated.discountAmount || 0;
    const manualTaxAmount = updated.taxAmount || 0;

    // Calculate subtotal
    const subTotal = price * quantity;
    updated.subTotalAmount = parseFloat(subTotal.toFixed(2));

    // Calculate discount
    let discountAmount = 0;
    if (overrideDiscount) {
      discountAmount = manualDiscountAmount;
      updated.discountRate = subTotal > 0 ? parseFloat(((discountAmount / subTotal) * 100).toFixed(2)) : 0;
    } else {
      discountAmount = (subTotal * discountRate) / 100;
    }
    updated.discountAmount = parseFloat(discountAmount.toFixed(2));

    // Calculate net before tax
    const netBeforeTax = subTotal - discountAmount;

    // Calculate tax
    let taxAmount = 0;
    if (overrideTax) {
      taxAmount = manualTaxAmount;
      if (isTaxIncluded && (netBeforeTax - taxAmount) !== 0) {
        updated.taxRate = parseFloat(((taxAmount / (netBeforeTax - taxAmount)) * 100).toFixed(2));
      } else if (!isTaxIncluded && netBeforeTax !== 0) {
        updated.taxRate = parseFloat(((taxAmount / netBeforeTax) * 100).toFixed(2));
      } else {
        updated.taxRate = 0;
      }
    } else {
      if (isTaxIncluded) {
        taxAmount = (netBeforeTax * taxRate) / (100 + taxRate);
      } else {
        taxAmount = (netBeforeTax * taxRate) / 100;
      }
    }
    updated.taxAmount = parseFloat(taxAmount.toFixed(2));

    // Final calculations
    if (isTaxIncluded) {
      updated.netAmount = parseFloat((netBeforeTax - taxAmount).toFixed(2));
      updated.totalAmount = parseFloat(netBeforeTax.toFixed(2));
    } else {
      updated.netAmount = parseFloat(netBeforeTax.toFixed(2));
      updated.totalAmount = parseFloat((netBeforeTax + taxAmount).toFixed(2));
    }

    // Base currency values
    updated.baseSubTotalAmount = parseFloat((updated.subTotalAmount * exchangeRate).toFixed(2));
    updated.baseDiscountAmount = parseFloat((updated.discountAmount * exchangeRate).toFixed(2));
    updated.baseNetAmount = parseFloat((updated.netAmount * exchangeRate).toFixed(2));
    updated.baseTaxAmount = parseFloat((updated.taxAmount * exchangeRate).toFixed(2));
    updated.baseTotalAmount = parseFloat((updated.totalAmount * exchangeRate).toFixed(2));

    return updated;
  }, []);

  // --- Handle Change ---
  const handleChange = (field: keyof FormGRNItem | 'taxTypeCombined', value: any) => {
    setItem(prev => {
      // Handle Combined Tax Type
      if (field === 'taxTypeCombined') {
        const selectedValue = value as string;
        const newTaxSystem: 'GST' | 'VAT' = selectedValue.startsWith('vat') ? 'VAT' : 'GST';
        const newTaxIncluded = selectedValue.endsWith('include');
        const updatedItem = { ...prev, taxSystem: newTaxSystem, taxIncluded: newTaxIncluded };
        return recalculateAmounts(updatedItem);
      }

      // Parse value based on field type
      const numberFields = [
        'orderedQuantity', 'receivedQuantity', 'focQuantity', 'unitPrice',
        'exchangeRate', 'taxRate', 'discountRate', 'discountAmount',
        'taxAmount', 'conversionRate', 'focConversionRate', 'baseUnitPrice',
        'subTotalAmount', 'totalAmount', 'netAmount', 'baseQuantity',
        'extraCost', 'inventoryOnHand', 'lastPurchasePrice'
      ];
      const dateFields = ['deliveryDate', 'expiryDate', 'lastOrderDate'];
      const booleanFields = ['taxIncluded', 'isFreeOfCharge', 'isConsignment'];

      let updatedValue: any;
      if (numberFields.includes(field as string)) {
        updatedValue = parseFloat(value) || 0;
      } else if (dateFields.includes(field as string)) {
        updatedValue = value instanceof Date ? value : (value ? new Date(value) : undefined);
      } else if (booleanFields.includes(field as string)) {
        updatedValue = value === true;
      } else {
        updatedValue = value;
      }

      const updatedItem = { ...prev, [field]: updatedValue };

      // Handle unit changes
      if (field === 'unit' || field === 'focUnit') {
        const targetUnit = updatedItem[field] as string;
        const baseUnit = updatedItem.baseUnit;
        let factor = 1;
        if (unitConversions && baseUnit && targetUnit) {
          const conversion = unitConversions.find(
            (uc: any) => uc.fromUnit === targetUnit && uc.toUnit === baseUnit
          );
          if (conversion) factor = conversion.conversionFactor;
        }
        if (field === 'unit') {
          updatedItem.conversionRate = factor;
        } else {
          updatedItem.focConversionRate = factor;
        }
      }

      // Trigger recalculation for relevant fields
      const recalcFields = [
        "receivedQuantity", "baseUnitPrice", "taxIncluded", "discountRate",
        "discountAmount", "taxRate", "adjustments", "exchangeRate", "focQuantity",
        "unit", "focUnit"
      ];
      if (recalcFields.includes(field as string)) {
        return recalculateAmounts(updatedItem);
      }

      return updatedItem;
    });
  };

  // Handle adjustment checkbox changes
  const handleAdjustmentChange = (field: 'discount' | 'tax', checked: boolean) => {
    setItem(prev => {
      const updatedAdjustments = { ...prev.adjustments, [field]: checked };
      const updatedItem = { ...prev, adjustments: updatedAdjustments };
      return recalculateAmounts(updatedItem);
    });
  };

  const handleCancel = () => {
    if (mode === "add") {
      onClose();
    } else {
      setItem(toFormGRNItem(initialItem));
      handleModeChange("view");
    }
  };

  const handleSave = () => {
    // Sync total PR allocations to receivedQuantity
    let updatedItem = { ...item };
    if (updatedItem.relatedPRs && updatedItem.relatedPRs.length > 0) {
      const totalThisGrnQty = updatedItem.relatedPRs.reduce((sum, pr) => sum + pr.thisGrnQty, 0);
      const totalThisGrnBaseQty = updatedItem.relatedPRs.reduce((sum, pr) => sum + pr.thisGrnBaseQty, 0);
      updatedItem.receivedQuantity = totalThisGrnQty;
      updatedItem.baseQuantity = totalThisGrnBaseQty;
    }
    const finalItem = recalculateAmounts(updatedItem);
    setItem(finalItem); // Update local state with recalculated values
    onSave(finalItem);
    // Keep form open in edit mode after save
  };

  // --- FormField Component ---
  const FormField = ({
    id,
    label,
    required = false,
    children,
    smallText,
    className,
  }: {
    id: string;
    label: string;
    required?: boolean;
    children?: React.ReactNode;
    smallText?: string;
    className?: string;
  }) => {
    return (
      <div className={className}>
        <Label
          htmlFor={id}
          className={cn(
            "text-xs font-medium text-muted-foreground",
            required && "after:content-['*'] after:ml-0.5 after:text-red-500"
          )}
        >
          {label}
        </Label>
        {isReadOnly ? (
          <div className="mt-1.5 text-sm font-medium text-foreground">
            {(() => {
              const value = (item as any)[id];
              if (value instanceof Date) return format(value, "PPP");
              if (value === null || value === undefined || value === '') return <span className="text-muted-foreground">N/A</span>;
              return String(value);
            })()}
          </div>
        ) : (
          <div className="mt-1.5">{children}</div>
        )}
        {smallText && (
          <p className="text-[11px] text-muted-foreground mt-1">{smallText}</p>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-semibold">
            {mode === "add" ? "Add New Item" : "Item Details"}
          </h2>
          {(item as any).name && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {(item as any).name} • {(item as any).purchaseOrderRef || 'No PO'}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {mode === "view" && (
            <Button variant="outline" size="sm" onClick={() => handleModeChange("edit")}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {(mode === "edit" || mode === "add") && (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
            </>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="details" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-6 h-12">
          <TabsTrigger value="details" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            <Package className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger value="quantity" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            <Truck className="h-4 w-4 mr-2" />
            Quantity
          </TabsTrigger>
          <TabsTrigger value="pricing" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            <Calculator className="h-4 w-4 mr-2" />
            Pricing
          </TabsTrigger>
          <TabsTrigger value="related-prs" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            <FileText className="h-4 w-4 mr-2" />
            Related PRs
          </TabsTrigger>
          {mode !== 'add' && (
            <TabsTrigger value="inventory" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Info className="h-4 w-4 mr-2" />
              Inventory
            </TabsTrigger>
          )}
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Details Tab */}
          <TabsContent value="details" className="p-6 mt-0 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField id="name" label="Product Name" required>
                <Input
                  id="name"
                  value={(item as any).name || ''}
                  onChange={(e) => handleChange('name' as any, e.target.value)}
                  className="h-9"
                />
              </FormField>

              <FormField id="location" label="Location" required>
                <Input
                  id="location"
                  value={(item as any).location || ''}
                  onChange={(e) => handleChange('location' as any, e.target.value)}
                  className="h-9"
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField id="purchaseOrderRef" label="PO Reference">
                <Input
                  id="purchaseOrderRef"
                  value={(item as any).purchaseOrderRef || ''}
                  onChange={(e) => handleChange('purchaseOrderRef' as any, e.target.value)}
                  className="h-9"
                />
              </FormField>

              <FormField id="lotNumber" label="Lot/Batch Number">
                <Input
                  id="lotNumber"
                  value={(item as any).lotNumber || ''}
                  onChange={(e) => handleChange('lotNumber' as any, e.target.value)}
                  placeholder="Enter lot/batch number"
                  className="h-9"
                />
              </FormField>
            </div>

            <FormField id="description" label="Description">
              <Input
                id="description"
                value={item.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                className="h-9"
              />
            </FormField>

            <FormField id="notes" label="Notes">
              <Textarea
                id="notes"
                value={item.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Add any notes..."
                className="min-h-[80px] resize-none"
              />
            </FormField>
          </TabsContent>

          {/* Quantity Tab */}
          <TabsContent value="quantity" className="p-6 mt-0 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="orderedQuantity"
                label="Ordered Qty"
                smallText={`Base: ${formatAmountOnly((item.orderedQuantity || 0) * ((item as any).conversionRate || 1))} ${(item as any).baseUnit}`}
              >
                <div className="h-9 flex items-center px-3 rounded-md border bg-muted/30 text-sm font-medium">
                  {item.orderedQuantity || 0}
                </div>
              </FormField>

              <FormField id="orderUnit" label="Order Unit">
                <div className="h-9 flex items-center px-3 rounded-md border bg-muted/30 text-sm font-medium">
                  {(item as any).orderUnit || 'N/A'}
                </div>
              </FormField>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="receivedQuantity"
                label="Receiving Qty"
                required
                smallText={`Base: ${formatAmountOnly((item as any).baseQuantity || 0)} ${(item as any).baseUnit}`}
              >
                <Input
                  id="receivedQuantity"
                  type="number"
                  value={item.receivedQuantity || 0}
                  onChange={(e) => handleChange('receivedQuantity', e.target.value)}
                  className="h-9"
                />
              </FormField>

              <FormField
                id="unit"
                label="Receiving Unit"
                smallText={`1 ${(item as any).unit || 'Unit'} = ${(item as any).conversionRate || 1} ${(item as any).baseUnit}`}
              >
                <Select
                  value={(item as any).unit || ''}
                  onValueChange={(value) => handleChange('unit' as any, value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map(u => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="focQuantity"
                label="FOC Qty"
                smallText="Free of Charge"
              >
                <Input
                  id="focQuantity"
                  type="number"
                  value={(item as any).focQuantity || 0}
                  onChange={(e) => handleChange('focQuantity' as any, e.target.value)}
                  className="h-9"
                />
              </FormField>

              <FormField
                id="focUnit"
                label="FOC Unit"
                smallText={`1 ${(item as any).focUnit || 'Unit'} = ${(item as any).focConversionRate || 1} ${(item as any).baseUnit}`}
              >
                <Select
                  value={(item as any).focUnit || ''}
                  onValueChange={(value) => handleChange('focUnit' as any, value)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map(u => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <FormField id="deliveryPoint" label="Delivery Point">
                {isReadOnly ? (
                  <div className="h-9 flex items-center text-sm font-medium">
                    {deliveryPointOptions.find(o => o.value === (item as any).deliveryPoint)?.label || (item as any).deliveryPoint || "N/A"}
                  </div>
                ) : (
                  <Select
                    value={(item as any).deliveryPoint || ''}
                    onValueChange={(value) => handleChange('deliveryPoint' as any, value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select point" />
                    </SelectTrigger>
                    <SelectContent>
                      {deliveryPointOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>

              <FormField id="expiryDate" label="Expiry Date">
                {isReadOnly ? (
                  <div className="h-9 flex items-center text-sm font-medium">
                    {(item as any).expiryDate ? format(new Date((item as any).expiryDate), "PPP") : "N/A"}
                  </div>
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-9",
                          !(item as any).expiryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {(item as any).expiryDate ? format(new Date((item as any).expiryDate), "PP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={(item as any).expiryDate ? new Date((item as any).expiryDate) : undefined}
                        onSelect={(date) => handleChange('expiryDate' as any, date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </FormField>
            </div>

            {/* Consignment Checkbox */}
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isConsignment"
                checked={(item as any).isConsignment || false}
                onCheckedChange={(checked) => handleChange('isConsignment' as any, checked)}
                disabled={isReadOnly}
              />
              <Label htmlFor="isConsignment" className="text-sm cursor-pointer">
                This is a consignment item (vendor-owned inventory)
              </Label>
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="p-6 mt-0 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField id="currency" label="Currency">
                {isReadOnly ? (
                  <div className="h-9 flex items-center text-sm font-medium">
                    {(item as any).currency || baseCurrency}
                  </div>
                ) : (
                  <Select
                    value={(item as any).currency || baseCurrency}
                    onValueChange={(value) => handleChange('currency' as any, value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {mockCurrencies.filter(c => c.isActive).map(currency => (
                        <SelectItem key={currency.code} value={currency.code}>
                          {currency.code} {currency.isBaseCurrency && "(Base)"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>

              <FormField id="exchangeRate" label="Exchange Rate">
                <Input
                  id="exchangeRate"
                  type="number"
                  step="0.0001"
                  value={(item as any).exchangeRate || 1}
                  onChange={(e) => handleChange('exchangeRate' as any, e.target.value)}
                  className="h-9"
                  disabled={isReadOnly}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField id="baseUnitPrice" label="Unit Price">
                <Input
                  id="baseUnitPrice"
                  type="number"
                  step="0.01"
                  value={(item as any).baseUnitPrice || 0}
                  onChange={(e) => handleChange('baseUnitPrice' as any, e.target.value)}
                  className="h-9"
                  disabled={isReadOnly}
                />
              </FormField>

              <FormField id="taxType" label="Tax Type">
                {isReadOnly ? (
                  <div className="h-9 flex items-center text-sm font-medium">
                    {(item as any).taxSystem || 'GST'} {(item as any).taxIncluded ? 'Inclusive' : 'Exclusive'}
                  </div>
                ) : (
                  <Select
                    value={getTaxTypeValue((item as any).taxSystem, (item as any).taxIncluded)}
                    onValueChange={(value) => handleChange('taxTypeCombined', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="gst_add">GST Exclusive</SelectItem>
                      <SelectItem value="gst_include">GST Inclusive</SelectItem>
                      <SelectItem value="vat_add">VAT Exclusive</SelectItem>
                      <SelectItem value="vat_include">VAT Inclusive</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </FormField>
            </div>

            <Separator />

            {/* Adjustments */}
            <div>
              <h4 className="text-sm font-medium mb-4">Adjustments</h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <FormField id="discountRate" label="Discount Rate (%)">
                    <Input
                      id="discountRate"
                      type="number"
                      step="0.01"
                      value={(item as any).discountRate || 0}
                      onChange={(e) => handleChange('discountRate' as any, e.target.value)}
                      className={cn("h-9", (item as any).adjustments?.discount && "bg-muted")}
                      disabled={isReadOnly || (item as any).adjustments?.discount}
                    />
                  </FormField>
                  {!isReadOnly && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="adjDiscount"
                        checked={(item as any).adjustments?.discount || false}
                        onCheckedChange={(checked) => handleAdjustmentChange('discount', !!checked)}
                      />
                      <Label htmlFor="adjDiscount" className="text-xs cursor-pointer">Override Amount</Label>
                    </div>
                  )}
                  {(item as any).adjustments?.discount && (
                    <Input
                      type="number"
                      step="0.01"
                      value={(item as any).discountAmount || 0}
                      onChange={(e) => handleChange('discountAmount' as any, e.target.value)}
                      placeholder="Discount amount"
                      className="h-9"
                      disabled={isReadOnly}
                    />
                  )}
                </div>

                <div className="space-y-3">
                  <FormField id="taxRate" label="Tax Rate (%)">
                    <Input
                      id="taxRate"
                      type="number"
                      step="0.01"
                      value={(item as any).taxRate || 0}
                      onChange={(e) => handleChange('taxRate' as any, e.target.value)}
                      className={cn("h-9", (item as any).adjustments?.tax && "bg-muted")}
                      disabled={isReadOnly || (item as any).adjustments?.tax}
                    />
                  </FormField>
                  {!isReadOnly && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="adjTax"
                        checked={(item as any).adjustments?.tax || false}
                        onCheckedChange={(checked) => handleAdjustmentChange('tax', !!checked)}
                      />
                      <Label htmlFor="adjTax" className="text-xs cursor-pointer">Override Amount</Label>
                    </div>
                  )}
                  {(item as any).adjustments?.tax && (
                    <Input
                      type="number"
                      step="0.01"
                      value={(item as any).taxAmount || 0}
                      onChange={(e) => handleChange('taxAmount' as any, e.target.value)}
                      placeholder="Tax amount"
                      className="h-9"
                      disabled={isReadOnly}
                    />
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Calculated Amounts */}
            <div>
              <h4 className="text-sm font-medium mb-4">Calculated Amounts</h4>
              <div className="bg-muted/30 rounded-lg p-4">
                {/* Header */}
                <div className="grid grid-cols-3 gap-4 text-xs font-medium text-muted-foreground pb-3 border-b">
                  <span>Description</span>
                  <span className="text-right">{(item as any).currency || 'USD'}</span>
                  <span className="text-right">{(item as any).baseCurrency || 'USD'} (Base)</span>
                </div>

                {/* Rows */}
                <div className="divide-y">
                  <div className="grid grid-cols-3 gap-4 py-3">
                    <span className="text-sm">Subtotal</span>
                    <span className="text-sm text-right font-mono">{formatAmountOnly((item as any).subTotalAmount)}</span>
                    <span className="text-sm text-right font-mono text-muted-foreground">{formatAmountOnly((item as any).baseSubTotalAmount)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-3">
                    <span className="text-sm">Discount</span>
                    <span className="text-sm text-right font-mono text-red-600">-{formatAmountOnly((item as any).discountAmount)}</span>
                    <span className="text-sm text-right font-mono text-muted-foreground">-{formatAmountOnly((item as any).baseDiscountAmount)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-3">
                    <span className="text-sm">Net Amount</span>
                    <span className="text-sm text-right font-mono">{formatAmountOnly((item as any).netAmount)}</span>
                    <span className="text-sm text-right font-mono text-muted-foreground">{formatAmountOnly((item as any).baseNetAmount)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-3">
                    <span className="text-sm">Tax</span>
                    <span className="text-sm text-right font-mono">{formatAmountOnly((item as any).taxAmount)}</span>
                    <span className="text-sm text-right font-mono text-muted-foreground">{formatAmountOnly((item as any).baseTaxAmount)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-3 bg-muted/50 -mx-4 px-4">
                    <span className="text-sm font-semibold">Total Amount</span>
                    <span className="text-sm text-right font-mono font-semibold">{formatAmountOnly((item as any).totalAmount)}</span>
                    <span className="text-sm text-right font-mono font-semibold">{formatAmountOnly((item as any).baseTotalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Related PRs Tab */}
          <TabsContent value="related-prs" className="p-6 mt-0 space-y-4">
            {/* Header with Add Button and Total */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-medium">PR Allocations</h4>
                <Badge variant="secondary" className="text-xs">
                  {item.relatedPRs?.length || 0} PRs
                </Badge>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-muted-foreground">
                  Total Allocated: <span className="font-semibold text-foreground">
                    {formatAmountOnly(item.relatedPRs?.reduce((sum, pr) => sum + pr.thisGrnQty, 0) || 0)} {item.unit}
                  </span>
                </div>
                {!isReadOnly && (
                  <Button size="sm" variant="outline" className="h-8">
                    <Plus className="h-4 w-4 mr-1" />
                    Add PR
                  </Button>
                )}
              </div>
            </div>

            {/* Validation Warning */}
            {(() => {
              const totalAllocated = item.relatedPRs?.reduce((sum, pr) => sum + pr.thisGrnQty, 0) || 0;
              const receivingQty = item.receivedQuantity || 0;
              const difference = receivingQty - totalAllocated;
              if (difference !== 0) {
                return (
                  <div className={cn(
                    "flex items-center gap-2 p-3 rounded-lg text-sm",
                    difference > 0 ? "bg-yellow-50 border border-yellow-200 text-yellow-800" : "bg-red-50 border border-red-200 text-red-800"
                  )}>
                    <span>⚠️</span>
                    <span>
                      {difference > 0
                        ? `${formatAmountOnly(difference)} ${item.unit} unallocated. Total receiving: ${formatAmountOnly(receivingQty)}, Allocated: ${formatAmountOnly(totalAllocated)}`
                        : `Over-allocated by ${formatAmountOnly(Math.abs(difference))} ${item.unit}. Total receiving: ${formatAmountOnly(receivingQty)}, Allocated: ${formatAmountOnly(totalAllocated)}`
                      }
                    </span>
                  </div>
                );
              }
              return (
                <div className="flex items-center gap-2 p-3 rounded-lg text-sm bg-green-50 border border-green-200 text-green-800">
                  <span>✓</span>
                  <span>All {formatAmountOnly(receivingQty)} {item.unit} allocated to PRs</span>
                </div>
              );
            })()}

            {/* PR Allocation Table */}
            {item.relatedPRs && item.relatedPRs.length > 0 ? (
              <div className="border rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-[32px_120px_50px_100px_90px_80px_80px_32px] gap-2 px-3 py-2 bg-muted/50 text-xs font-medium text-muted-foreground border-b">
                  <div></div>
                  <div>PR #</div>
                  <div className="text-center">Line</div>
                  <div>Job Code</div>
                  <div className="text-right">Requested</div>
                  <div className="text-right">This GRN</div>
                  <div className="text-right">Remaining</div>
                  <div></div>
                </div>

                {/* PR Rows */}
                {item.relatedPRs.map((pr) => {
                  const isExpanded = expandedPRRows.has(pr.id);
                  const toggleExpanded = () => {
                    setExpandedPRRows(prev => {
                      const next = new Set(prev);
                      if (next.has(pr.id)) {
                        next.delete(pr.id);
                      } else {
                        next.add(pr.id);
                      }
                      return next;
                    });
                  };

                  return (
                    <div key={pr.id} className="border-b last:border-b-0">
                      {/* Main Row */}
                      <div
                        className={cn(
                          "grid grid-cols-[32px_120px_50px_100px_90px_80px_80px_32px] gap-2 px-3 py-2 items-center hover:bg-muted/30 cursor-pointer",
                          isExpanded && "bg-muted/20"
                        )}
                        onClick={toggleExpanded}
                      >
                        {/* Expand Icon */}
                        <div className="flex justify-center">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                        </div>

                        {/* PR Number */}
                        <div>
                          <div className="text-sm font-medium text-blue-600">{pr.prNumber}</div>
                        </div>

                        {/* Line # */}
                        <div className="text-center text-sm">{pr.prLineNumber}</div>

                        {/* Job Code */}
                        <div className="text-sm truncate" title={pr.jobCodeName}>
                          {pr.jobCode || '-'}
                        </div>

                        {/* Requested */}
                        <div className="text-right">
                          <div className="text-sm">{formatAmountOnly(pr.requestedQty)} {pr.requestedUnit}</div>
                          <div className="text-xs text-muted-foreground">({formatAmountOnly(pr.requestedBaseQty)} {pr.requestedBaseUnit})</div>
                        </div>

                        {/* This GRN - Editable */}
                        <div className="text-right" onClick={(e) => e.stopPropagation()}>
                          {isReadOnly ? (
                            <>
                              <div className="text-sm font-medium">{formatAmountOnly(pr.thisGrnQty)} {pr.requestedUnit}</div>
                              <div className="text-xs text-muted-foreground">({formatAmountOnly(pr.thisGrnBaseQty)} {pr.requestedBaseUnit})</div>
                            </>
                          ) : (
                            <Input
                              type="number"
                              value={pr.thisGrnQty}
                              onChange={(e) => {
                                const newQty = parseFloat(e.target.value) || 0;
                                const updatedPRs = item.relatedPRs.map(p => {
                                  if (p.id === pr.id) {
                                    const newBaseQty = newQty * p.conversionRate;
                                    const newRemaining = p.requestedQty - p.previouslyReceivedQty - newQty;
                                    const newRemainingBase = newRemaining * p.conversionRate;
                                    return {
                                      ...p,
                                      thisGrnQty: newQty,
                                      thisGrnBaseQty: newBaseQty,
                                      remainingQty: newRemaining,
                                      remainingBaseQty: newRemainingBase,
                                    };
                                  }
                                  return p;
                                });
                                setItem(prev => ({ ...prev, relatedPRs: updatedPRs }));
                              }}
                              className="h-7 w-16 text-right text-sm"
                            />
                          )}
                        </div>

                        {/* Remaining */}
                        <div className="text-right">
                          <div className={cn(
                            "text-sm",
                            pr.remainingQty < 0 && "text-red-600",
                            pr.remainingQty === 0 && "text-green-600"
                          )}>
                            {formatAmountOnly(pr.remainingQty)} {pr.requestedUnit}
                          </div>
                          <div className="text-xs text-muted-foreground">({formatAmountOnly(pr.remainingBaseQty)} {pr.requestedBaseUnit})</div>
                        </div>

                        {/* Delete */}
                        <div className="flex justify-center" onClick={(e) => e.stopPropagation()}>
                          {!isReadOnly && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 text-muted-foreground hover:text-red-600"
                              onClick={() => {
                                const updatedPRs = item.relatedPRs.filter(p => p.id !== pr.id);
                                setItem(prev => ({ ...prev, relatedPRs: updatedPRs }));
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Expanded Detail */}
                      {isExpanded && (
                        <div className="px-10 py-4 bg-muted/10 border-t">
                          <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Job Code</p>
                              <p className="text-sm font-medium">{pr.jobCode || '-'}</p>
                              {pr.jobCodeName && <p className="text-xs text-muted-foreground">{pr.jobCodeName}</p>}
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Event</p>
                              <p className="text-sm font-medium">{pr.event || '-'}</p>
                              {pr.eventName && <p className="text-xs text-muted-foreground">{pr.eventName}</p>}
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Project</p>
                              <p className="text-sm font-medium">{pr.project || '-'}</p>
                              {pr.projectName && <p className="text-xs text-muted-foreground">{pr.projectName}</p>}
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Market Segment</p>
                              <p className="text-sm font-medium">{pr.marketSegment || '-'}</p>
                              {pr.marketSegmentName && <p className="text-xs text-muted-foreground">{pr.marketSegmentName}</p>}
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Requester</p>
                              <p className="text-sm font-medium">{pr.requester || '-'}</p>
                              {pr.requesterDepartment && <p className="text-xs text-muted-foreground">{pr.requesterDepartment}</p>}
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Conversion Rate</p>
                              <p className="text-sm font-medium">1 {pr.requestedUnit} = {pr.conversionRate} {pr.requestedBaseUnit}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center border rounded-lg bg-muted/10">
                <FileText className="h-10 w-10 text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-2">No PRs linked to this item</p>
                {!isReadOnly && (
                  <Button size="sm" variant="outline">
                    <Plus className="h-4 w-4 mr-1" />
                    Add PR
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          {/* Inventory Tab */}
          {mode !== 'add' && (
            <TabsContent value="inventory" className="p-6 mt-0 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                <h4 className="text-sm font-medium text-blue-900 mb-4">Current Inventory Status</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-blue-600 mb-1">Inventory On Hand</p>
                    <p className="text-lg font-semibold text-blue-900">{(item as any).inventoryOnHand || 0} {(item as any).baseUnit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 mb-1">Last Purchase Price</p>
                    <p className="text-lg font-semibold text-blue-900">{formatAmountOnly((item as any).lastPurchasePrice || 0)}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Purchase History</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Order Date</p>
                    <p className="text-sm font-medium">
                      {(item as any).lastOrderDate ? format(new Date((item as any).lastOrderDate), 'PP') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Vendor</p>
                    <p className="text-sm font-medium">{(item as any).lastVendor || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}
        </ScrollArea>
      </Tabs>
    </div>
  );
}
