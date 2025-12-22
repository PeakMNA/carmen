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
  Building2,
  Info,
  FileText,
  Box,
  Link2,
  ExternalLink,
} from "lucide-react";
import { PurchaseOrderItem, Product } from "@/lib/types";
import { mockCurrencies, mockProducts } from "@/lib/mock-data";
import { ProductSearchCombobox } from "@/components/ui/product-search-combobox";

// Get base currency from mock data
const baseCurrency = mockCurrencies.find(c => c.isBaseCurrency)?.code || 'USD';

/**
 * Related PR reference for PO item
 */
export interface RelatedPR {
  id: string;
  refNo: string;
  detailNumber: number;
  requestLocation: string;
  businessDimensions: {
    department: string;
    costCenter: string;
    project?: string;
  };
  approvedQty: number;
  approvedUnit: string;
  itemComments: string;
  requestedQuantity?: number;
  unit?: string;
  requestedBy?: string;
  requestDate?: Date;
  status?: string;
}

/**
 * Related GRN reference for PO item
 */
export interface RelatedGRN {
  id: string;
  refNo: string;
  detailNumber: number;
  receivedLocation: string;
  receivedQuantity: number;
  unit: string;
  receivedDate: Date;
  receivedBy?: string;
  condition: 'Good' | 'Damaged' | 'Partial';
}

/**
 * Extended PO Item type for form handling
 */
export interface FormPOItem {
  id: string;
  purchaseOrderId?: string;
  itemName: string;
  description: string;
  unit: string;
  baseUnit: string;
  orderedQuantity: number;
  receivedQuantity: number;
  remainingQuantity: number;
  currency: string;
  exchangeRate: number;
  unitPrice: number;
  subTotalAmount: number;
  totalAmount: number;
  taxRate: number;
  taxAmount: number;
  discount: number;
  discountAmount: number;
  netAmount: number;
  baseCurrency: string;
  baseQuantity: number;
  baseUnitPrice: number;
  baseSubTotalAmount: number;
  baseNetAmount: number;
  baseTotalAmount: number;
  baseTaxAmount: number;
  baseDiscountAmount: number;
  conversionRate: number;
  inventoryOnHand: number;
  inventoryOnOrder: number;
  lastPurchasePrice: number;
  lastOrderDate?: Date;
  lastVendor: string;
  deliveryDate?: Date;
  deliveryPoint: string;
  taxIncluded: boolean;
  taxSystem: 'GST' | 'VAT';
  adjustments: { discount: boolean; tax: boolean };
  isFreeOfCharge: boolean;
  jobCode: string;
  event?: string;
  project?: string;
  marketSegment?: string;
  sourceRequestId?: string;
  relatedPRs?: RelatedPR[];
  relatedGRNs?: RelatedGRN[];
  notes?: string;
  status?: string;
}

// Define an empty item for adding new items
const emptyItem: FormPOItem = {
  id: crypto.randomUUID(),
  itemName: '',
  description: '',
  unit: 'Pcs',
  baseUnit: 'Pcs',
  orderedQuantity: 0,
  receivedQuantity: 0,
  remainingQuantity: 0,
  currency: baseCurrency,
  exchangeRate: 1,
  unitPrice: 0,
  subTotalAmount: 0,
  totalAmount: 0,
  taxRate: 0,
  taxAmount: 0,
  discount: 0,
  discountAmount: 0,
  netAmount: 0,
  baseCurrency: baseCurrency,
  baseQuantity: 0,
  baseUnitPrice: 0,
  baseSubTotalAmount: 0,
  baseNetAmount: 0,
  baseTotalAmount: 0,
  baseTaxAmount: 0,
  baseDiscountAmount: 0,
  conversionRate: 1,
  inventoryOnHand: 0,
  inventoryOnOrder: 0,
  lastPurchasePrice: 0,
  lastVendor: '',
  deliveryPoint: '',
  taxIncluded: false,
  taxSystem: 'GST',
  adjustments: { discount: false, tax: false },
  isFreeOfCharge: false,
  jobCode: '',
  relatedPRs: [],
  relatedGRNs: [],
  status: 'Ordered',
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

// Type that accepts both PurchaseOrderItem and FormPOItem for compatibility
type POItemInput = PurchaseOrderItem | FormPOItem | null;

/**
 * Converts any incoming PO item to the form's internal FormPOItem format
 */
function toFormPOItem(input: POItemInput): FormPOItem {
  if (!input) {
    return { ...emptyItem, id: crypto.randomUUID() };
  }

  const item = input as any;
  const unitPriceValue = typeof item.unitPrice === 'object' && item.unitPrice !== null
    ? (item.unitPrice.amount || 0)
    : (item.unitPrice || 0);

  return {
    id: item.id || crypto.randomUUID(),
    purchaseOrderId: item.purchaseOrderId,
    itemName: item.itemName || item.name || '',
    description: item.description || '',
    unit: item.unit || 'Pcs',
    baseUnit: item.baseUnit || item.unit || 'Pcs',
    orderedQuantity: item.orderedQuantity || 0,
    receivedQuantity: item.receivedQuantity || 0,
    remainingQuantity: (item.orderedQuantity || 0) - (item.receivedQuantity || 0),
    currency: item.currency || baseCurrency,
    exchangeRate: item.exchangeRate || 1,
    unitPrice: unitPriceValue,
    subTotalAmount: item.subTotalAmount || 0,
    totalAmount: item.totalAmount || item.lineTotal?.amount || 0,
    taxRate: item.taxRate || 0,
    taxAmount: item.taxAmount?.amount || item.taxAmount || 0,
    discount: item.discount || 0,
    discountAmount: item.discountAmount?.amount || item.discountAmount || 0,
    netAmount: item.netAmount || 0,
    baseCurrency: item.baseCurrency || baseCurrency,
    baseQuantity: item.baseQuantity || 0,
    baseUnitPrice: item.baseUnitPrice || unitPriceValue,
    baseSubTotalAmount: item.baseSubTotalAmount || 0,
    baseNetAmount: item.baseNetAmount || 0,
    baseTotalAmount: item.baseTotalAmount || 0,
    baseTaxAmount: item.baseTaxAmount || 0,
    baseDiscountAmount: item.baseDiscountAmount || 0,
    conversionRate: item.conversionRate || 1,
    inventoryOnHand: item.inventoryOnHand || 0,
    inventoryOnOrder: item.inventoryOnOrder || 0,
    lastPurchasePrice: item.lastPurchasePrice || 0,
    lastOrderDate: item.lastOrderDate,
    lastVendor: item.lastVendor || '',
    deliveryDate: item.deliveryDate || item.expectedDeliveryDate,
    deliveryPoint: item.deliveryPoint || '',
    taxIncluded: item.taxIncluded || false,
    taxSystem: item.taxSystem || 'GST',
    adjustments: item.adjustments || { discount: false, tax: false },
    isFreeOfCharge: item.isFreeOfCharge || false,
    jobCode: item.jobCode || '',
    event: item.event,
    project: item.project,
    marketSegment: item.marketSegment,
    sourceRequestId: item.sourceRequestId,
    relatedPRs: item.relatedPRs || [],
    relatedGRNs: item.relatedGRNs || [],
    notes: item.notes,
    status: item.status || 'Ordered',
  };
}

// Mock related documents for testing - in production, this would come from API
const getMockRelatedPRs = (sourceRequestId?: string): RelatedPR[] => {
  if (!sourceRequestId) return [];
  // Simulate multiple PRs consolidated into one PO line
  return [
    {
      id: 'pr-001',
      refNo: sourceRequestId,
      detailNumber: 1,
      requestLocation: 'Main Kitchen - Building A',
      businessDimensions: {
        department: 'F&B Kitchen',
        costCenter: 'CC-FB-001',
        project: 'Q1 Operations',
      },
      approvedQty: 50,
      approvedUnit: 'Pcs',
      itemComments: 'Urgent request for kitchen supplies - needed for weekend event',
      requestedQuantity: 50,
      unit: 'Pcs',
      requestedBy: 'John Smith',
      requestDate: new Date('2024-01-15'),
      status: 'Converted to PO',
    },
    {
      id: 'pr-002',
      refNo: 'PR-2024-0089',
      detailNumber: 2,
      requestLocation: 'Housekeeping Store - Floor 2',
      businessDimensions: {
        department: 'Housekeeping',
        costCenter: 'CC-HK-002',
      },
      approvedQty: 30,
      approvedUnit: 'Pcs',
      itemComments: 'Regular monthly replenishment for housekeeping department',
      requestedQuantity: 35,
      unit: 'Pcs',
      requestedBy: 'Jane Doe',
      requestDate: new Date('2024-01-18'),
      status: 'Converted to PO',
    },
    {
      id: 'pr-003',
      refNo: 'PR-2024-0092',
      detailNumber: 1,
      requestLocation: 'Grand Ballroom - Event Hall',
      businessDimensions: {
        department: 'Banquet',
        costCenter: 'CC-BQ-001',
        project: 'Annual Gala Event',
      },
      approvedQty: 25,
      approvedUnit: 'Pcs',
      itemComments: 'Special order for annual gala - premium quality required',
      requestedQuantity: 25,
      unit: 'Pcs',
      requestedBy: 'Michael Chen',
      requestDate: new Date('2024-01-20'),
      status: 'Converted to PO',
    },
  ];
};

const getMockRelatedGRNs = (receivedQuantity: number): RelatedGRN[] => {
  if (!receivedQuantity || receivedQuantity <= 0) return [];
  // Simulate multiple partial deliveries
  const firstDelivery = Math.floor(receivedQuantity * 0.6);
  const secondDelivery = receivedQuantity - firstDelivery;

  const grns: RelatedGRN[] = [
    {
      id: 'grn-001',
      refNo: 'GRN-2024-0042',
      detailNumber: 1,
      receivedLocation: 'Main Warehouse - Dock A',
      receivedQuantity: firstDelivery,
      unit: 'Pcs',
      receivedDate: new Date('2024-02-01'),
      receivedBy: 'Mike Johnson',
      condition: 'Good',
    },
  ];

  if (secondDelivery > 0) {
    grns.push({
      id: 'grn-002',
      refNo: 'GRN-2024-0056',
      detailNumber: 2,
      receivedLocation: 'Cold Storage - Section B',
      receivedQuantity: secondDelivery,
      unit: 'Pcs',
      receivedDate: new Date('2024-02-10'),
      receivedBy: 'Sarah Wilson',
      condition: 'Good',
    });
  }

  return grns;
};

interface POItemDetailFormProps {
  item: POItemInput;
  mode: "view" | "edit" | "add";
  currencyCode?: string;
  baseCurrencyCode?: string;
  exchangeRate?: number;
  onAddNewRecord?: (fieldType: 'projectCode' | 'jobCode' | 'marketSegment' | 'jobNumber' | 'event') => void;
  onRequestEdit?: () => void;
  onClose: () => void;
  onSave: (item: any) => void;
  onModeChange?: (mode: "view" | "edit" | "add") => void;
  /** When true, hides Edit/Save/Cancel buttons - form follows parent's mode */
  isEmbedded?: boolean;
  /** Called on every field change when embedded - for auto-save */
  onFieldChange?: (item: any) => void;
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

export default function POItemDetailForm({
  item: initialItem,
  mode: initialMode,
  currencyCode = 'USD',
  baseCurrencyCode = 'THB',
  exchangeRate: propExchangeRate = 1,
  onAddNewRecord,
  onRequestEdit,
  onClose,
  onSave,
  onModeChange,
  isEmbedded = false,
  onFieldChange,
}: POItemDetailFormProps) {
  // Helper to extract numeric value from amount (handles both number and {amount, currency} objects)
  const toNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'object' && value !== null && 'amount' in value) return value.amount || 0;
    return parseFloat(value) || 0;
  };

  // Helper to initialize item with proper exchange rate and base currency calculations
  const initializeItemWithBaseValues = useCallback((inputItem: POItemInput): FormPOItem => {
    const formItem = toFormPOItem(inputItem);

    // Apply exchange rate from props if item doesn't have one
    const effectiveExchangeRate = formItem.exchangeRate !== 1 ? formItem.exchangeRate : propExchangeRate;
    formItem.exchangeRate = effectiveExchangeRate;
    formItem.baseCurrency = baseCurrencyCode;

    // Calculate base values using exchange rate
    const quantity = toNumber(formItem.orderedQuantity);
    const price = toNumber(formItem.unitPrice);
    const itemConversionRate = toNumber(formItem.conversionRate) || 1;

    // Base quantity (converted from order unit to base unit)
    formItem.baseQuantity = parseFloat((quantity * itemConversionRate).toFixed(2));

    // Calculate amounts if not already set
    const subTotal = price * quantity;
    if (toNumber(formItem.subTotalAmount) === 0 && subTotal > 0) {
      formItem.subTotalAmount = parseFloat(subTotal.toFixed(2));
    }

    const discountRate = toNumber(formItem.discount);
    const existingDiscountAmount = toNumber(formItem.discountAmount);
    const discountAmount = existingDiscountAmount || (toNumber(formItem.subTotalAmount) * discountRate / 100);
    formItem.discountAmount = parseFloat(discountAmount.toFixed(2));

    const netBeforeTax = toNumber(formItem.subTotalAmount) - formItem.discountAmount;
    if (toNumber(formItem.netAmount) === 0 && netBeforeTax > 0) {
      formItem.netAmount = parseFloat(netBeforeTax.toFixed(2));
    }

    const taxRate = toNumber(formItem.taxRate);
    const existingTaxAmount = toNumber(formItem.taxAmount);
    const taxAmount = existingTaxAmount || (toNumber(formItem.netAmount) * taxRate / 100);
    formItem.taxAmount = parseFloat(taxAmount.toFixed(2));

    if (toNumber(formItem.totalAmount) === 0 && toNumber(formItem.netAmount) > 0) {
      formItem.totalAmount = parseFloat((toNumber(formItem.netAmount) + formItem.taxAmount).toFixed(2));
    }

    // Calculate base currency amounts using exchange rate
    formItem.baseUnitPrice = parseFloat((price * effectiveExchangeRate).toFixed(2));
    formItem.baseSubTotalAmount = parseFloat((toNumber(formItem.subTotalAmount) * effectiveExchangeRate).toFixed(2));
    formItem.baseDiscountAmount = parseFloat((formItem.discountAmount * effectiveExchangeRate).toFixed(2));
    formItem.baseNetAmount = parseFloat((toNumber(formItem.netAmount) * effectiveExchangeRate).toFixed(2));
    formItem.baseTaxAmount = parseFloat((formItem.taxAmount * effectiveExchangeRate).toFixed(2));
    formItem.baseTotalAmount = parseFloat((toNumber(formItem.totalAmount) * effectiveExchangeRate).toFixed(2));

    return formItem;
  }, [propExchangeRate, baseCurrencyCode]);

  const [item, setItem] = useState<FormPOItem>(() => initializeItemWithBaseValues(initialItem));
  const [mode, setMode] = useState<"view" | "edit" | "add">(initialMode);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(() => {
    // Initialize selected product from item if it exists
    const formItem = toFormPOItem(initialItem);
    if (formItem.itemName) {
      return mockProducts.find(p =>
        p.productName === formItem.itemName ||
        `${p.productCode} - ${p.productName}` === formItem.itemName
      ) || null;
    }
    return null;
  });

  // Update local state when props change
  useEffect(() => {
    const formItem = initializeItemWithBaseValues(initialItem);
    setItem(formItem);
    // Update selected product when item changes
    if (formItem.itemName) {
      const matchedProduct = mockProducts.find(p =>
        p.productName === formItem.itemName ||
        `${p.productCode} - ${p.productName}` === formItem.itemName
      ) || null;
      setSelectedProduct(matchedProduct);
    } else {
      setSelectedProduct(null);
    }
  }, [initialItem, initializeItemWithBaseValues]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const isReadOnly = mode === "view";
  const unitOptions = ["Pcs", "Box", "Pack", "Kg", "L", "mL", "Set", "Unit", "Bag", "Carton", "Dozen"];

  // Handle mode change
  const handleModeChange = (newMode: "view" | "edit" | "add") => {
    setMode(newMode);
    onModeChange?.(newMode);
  };

  // --- Recalculation Logic ---
  const recalculateAmounts = useCallback((currentItem: FormPOItem): FormPOItem => {
    const updated = { ...currentItem };
    const itemConversionRate = updated.conversionRate || 1;
    const quantity = updated.orderedQuantity || 0;
    updated.baseQuantity = parseFloat((quantity * itemConversionRate).toFixed(2));
    updated.remainingQuantity = quantity - (updated.receivedQuantity || 0);

    const price = updated.unitPrice || 0;
    const discountRate = updated.discount || 0;
    const taxRate = updated.taxRate || 0;
    const exchangeRate = updated.exchangeRate || propExchangeRate || 1;
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
      updated.discount = subTotal > 0 ? parseFloat(((discountAmount / subTotal) * 100).toFixed(2)) : 0;
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
  }, [propExchangeRate]);

  // --- Handle Change ---
  const handleChange = (field: keyof FormPOItem | 'taxTypeCombined', value: any) => {
    setItem(prev => {
      let finalItem: FormPOItem;

      // Handle Combined Tax Type
      if (field === 'taxTypeCombined') {
        const selectedValue = value as string;
        const newTaxSystem: 'GST' | 'VAT' = selectedValue.startsWith('vat') ? 'VAT' : 'GST';
        const newTaxIncluded = selectedValue.endsWith('include');
        const updatedItem = { ...prev, taxSystem: newTaxSystem, taxIncluded: newTaxIncluded };
        finalItem = recalculateAmounts(updatedItem);
      } else {
        // Parse value based on field type
        const numberFields = [
          'orderedQuantity', 'receivedQuantity', 'unitPrice',
          'exchangeRate', 'taxRate', 'discount', 'discountAmount',
          'taxAmount', 'conversionRate', 'baseUnitPrice',
          'subTotalAmount', 'totalAmount', 'netAmount', 'baseQuantity',
          'inventoryOnHand', 'lastPurchasePrice'
        ];
        const dateFields = ['deliveryDate', 'lastOrderDate'];
        const booleanFields = ['taxIncluded', 'isFreeOfCharge'];

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
        if (field === 'unit') {
          const targetUnit = updatedItem.unit;
          const baseUnit = updatedItem.baseUnit;
          // Simple conversion factor (in real app, would look up from unitConversions)
          let factor = 1;
          if (targetUnit !== baseUnit) {
            // Mock conversion rates
            const conversions: Record<string, Record<string, number>> = {
              'Box': { 'Pcs': 12 },
              'Dozen': { 'Pcs': 12 },
              'Pack': { 'Pcs': 6 },
              'Carton': { 'Pcs': 24 },
            };
            factor = conversions[targetUnit]?.[baseUnit] || 1;
          }
          updatedItem.conversionRate = factor;
        }

        // Trigger recalculation for relevant fields
        const recalcFields = [
          "orderedQuantity", "unitPrice", "taxIncluded", "discount",
          "discountAmount", "taxRate", "adjustments", "exchangeRate",
          "unit", "receivedQuantity"
        ];
        if (recalcFields.includes(field as string)) {
          finalItem = recalculateAmounts(updatedItem);
        } else {
          finalItem = updatedItem;
        }
      }

      // When embedded, notify parent of field changes for auto-save
      if (isEmbedded && onFieldChange) {
        onFieldChange(finalItem);
      }

      return finalItem;
    });
  };

  // Handle adjustment checkbox changes
  const handleAdjustmentChange = (field: 'discount' | 'tax', checked: boolean) => {
    setItem(prev => {
      const updatedAdjustments = { ...prev.adjustments, [field]: checked };
      const updatedItem = { ...prev, adjustments: updatedAdjustments };
      const finalItem = recalculateAmounts(updatedItem);

      // When embedded, notify parent of field changes for auto-save
      if (isEmbedded && onFieldChange) {
        onFieldChange(finalItem);
      }

      return finalItem;
    });
  };

  // Handle product selection from lookup
  const handleProductSelect = (product: Product | null) => {
    setSelectedProduct(product);

    if (product) {
      // Auto-populate fields from selected product
      const unitPrice = product.standardCost?.amount || product.lastPurchaseCost?.amount || 0;

      setItem(prev => {
        const updatedItem = {
          ...prev,
          itemName: product.productName,
          description: product.description || '',
          unit: product.baseUnit || 'Pcs',
          baseUnit: product.baseUnit || 'Pcs',
          unitPrice: unitPrice,
          currency: product.standardCost?.currency || product.lastPurchaseCost?.currency || prev.currency,
        };

        const finalItem = recalculateAmounts(updatedItem);

        // When embedded, notify parent of field changes for auto-save
        if (isEmbedded && onFieldChange) {
          onFieldChange(finalItem);
        }

        return finalItem;
      });
    } else {
      // Clear product-related fields when product is deselected
      setItem(prev => {
        const updatedItem = {
          ...prev,
          itemName: '',
          description: '',
        };

        if (isEmbedded && onFieldChange) {
          onFieldChange(updatedItem);
        }

        return updatedItem;
      });
    }
  };

  const handleCancel = () => {
    if (mode === "add") {
      onClose();
    } else {
      setItem(toFormPOItem(initialItem));
      handleModeChange("view");
    }
  };

  const handleSave = () => {
    const finalItem = recalculateAmounts(item);
    onSave(finalItem);
    handleModeChange("view");
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

  // Get status badge styling
  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'received':
      case 'complete':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'partial':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'ordered':
      case 'pending':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-600 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-background sticky top-0 z-10">
        <div>
          <h2 className="text-lg font-semibold">
            {mode === "add" ? "Add New Item" : "Item Details"}
          </h2>
          {item.itemName && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {item.itemName} • {item.sourceRequestId || 'No PR'}
              {item.status && (
                <span className="ml-2 text-xs">• {item.status}</span>
              )}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Hide Edit/Save/Cancel when embedded - form follows parent's mode */}
          {!isEmbedded && mode === "view" && (
            <Button variant="outline" size="sm" onClick={() => handleModeChange("edit")}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}
          {!isEmbedded && (mode === "edit" || mode === "add") && (
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
          <TabsTrigger value="business" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
            <Building2 className="h-4 w-4 mr-2" />
            Business
          </TabsTrigger>
          {mode !== 'add' && (
            <TabsTrigger value="inventory" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Info className="h-4 w-4 mr-2" />
              Inventory
            </TabsTrigger>
          )}
          {mode !== 'add' && (
            <TabsTrigger value="related" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none">
              <Link2 className="h-4 w-4 mr-2" />
              Related
            </TabsTrigger>
          )}
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Details Tab */}
          <TabsContent value="details" className="p-6 mt-0 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Product Name with Lookup */}
              <div>
                <Label
                  htmlFor="itemName"
                  className="text-xs font-medium text-muted-foreground after:content-['*'] after:ml-0.5 after:text-red-500"
                >
                  Product Name
                </Label>
                {isReadOnly ? (
                  <div className="mt-1.5 text-sm font-medium text-foreground">
                    {item.itemName || <span className="text-muted-foreground">N/A</span>}
                  </div>
                ) : (
                  <div className="mt-1.5">
                    <ProductSearchCombobox
                      products={mockProducts}
                      value={selectedProduct}
                      onChange={handleProductSelect}
                      label=""
                      placeholder="Search products by code or name..."
                      required
                    />
                  </div>
                )}
              </div>

              <FormField id="sourceRequestId" label="PR Reference">
                <Input
                  id="sourceRequestId"
                  value={item.sourceRequestId || ''}
                  onChange={(e) => handleChange('sourceRequestId', e.target.value)}
                  className="h-9"
                  placeholder="e.g., PR-2024-001"
                />
              </FormField>
            </div>

            <FormField id="description" label="Description">
              <Textarea
                id="description"
                value={item.description || ''}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder="Enter product description..."
                className="min-h-[80px] resize-none"
              />
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField id="deliveryPoint" label="Delivery Point">
                {isReadOnly ? (
                  <div className="h-9 flex items-center text-sm font-medium">
                    {deliveryPointOptions.find(o => o.value === item.deliveryPoint)?.label || item.deliveryPoint || "N/A"}
                  </div>
                ) : (
                  <Select
                    value={item.deliveryPoint || ''}
                    onValueChange={(value) => handleChange('deliveryPoint', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select delivery point" />
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

              <FormField id="deliveryDate" label="Expected Delivery">
                {isReadOnly ? (
                  <div className="h-9 flex items-center text-sm font-medium">
                    {item.deliveryDate ? format(new Date(item.deliveryDate), "PPP") : "N/A"}
                  </div>
                ) : (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-9",
                          !item.deliveryDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {item.deliveryDate ? format(new Date(item.deliveryDate), "PP") : "Pick date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={item.deliveryDate ? new Date(item.deliveryDate) : undefined}
                        onSelect={(date) => handleChange('deliveryDate', date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                )}
              </FormField>
            </div>

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
                required
                smallText={`Base: ${formatAmountOnly((item.orderedQuantity || 0) * (item.conversionRate || 1))} ${item.baseUnit}`}
              >
                <Input
                  id="orderedQuantity"
                  type="number"
                  value={item.orderedQuantity || 0}
                  onChange={(e) => handleChange('orderedQuantity', e.target.value)}
                  className="h-9"
                />
              </FormField>

              <FormField
                id="unit"
                label="Order Unit"
                smallText={`1 ${item.unit || 'Unit'} = ${item.conversionRate || 1} ${item.baseUnit}`}
              >
                <Select
                  value={item.unit || 'Pcs'}
                  onValueChange={(value) => handleChange('unit', value)}
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
              <FormField
                id="receivedQuantity"
                label="Received Qty"
                smallText="Quantity received via GRN"
              >
                <div className="h-9 flex items-center px-3 rounded-md border bg-muted/30 text-sm font-medium">
                  {item.receivedQuantity || 0} {item.unit}
                </div>
              </FormField>

              <FormField
                id="remainingQuantity"
                label="Remaining Qty"
                smallText="Pending to receive"
              >
                <div className={cn(
                  "h-9 flex items-center px-3 rounded-md border text-sm font-medium",
                  (item.remainingQuantity || 0) > 0 ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-green-50 text-green-700 border-green-200"
                )}>
                  {item.remainingQuantity || 0} {item.unit}
                </div>
              </FormField>
            </div>

            {/* FOC Checkbox */}
            <div className="flex items-center space-x-2 pt-2">
              <Checkbox
                id="isFreeOfCharge"
                checked={item.isFreeOfCharge || false}
                onCheckedChange={(checked) => handleChange('isFreeOfCharge', checked)}
                disabled={isReadOnly}
              />
              <Label htmlFor="isFreeOfCharge" className="text-sm cursor-pointer">
                This is a Free of Charge (FOC) item
              </Label>
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="p-6 mt-0 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField id="currency" label="Currency">
                {isReadOnly ? (
                  <div className="h-9 flex items-center text-sm font-medium">
                    {item.currency || currencyCode}
                  </div>
                ) : (
                  <Select
                    value={item.currency || currencyCode}
                    onValueChange={(value) => handleChange('currency', value)}
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
                  value={item.exchangeRate || 1}
                  onChange={(e) => handleChange('exchangeRate', e.target.value)}
                  className="h-9"
                  disabled={isReadOnly}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField id="unitPrice" label="Unit Price">
                <div className="space-y-1">
                  <Input
                    id="unitPrice"
                    type="number"
                    step="0.01"
                    value={item.unitPrice || 0}
                    onChange={(e) => handleChange('unitPrice', e.target.value)}
                    className="h-9"
                    disabled={isReadOnly}
                  />
                  <p className="text-xs text-muted-foreground">
                    Base: {baseCurrencyCode} {formatAmountOnly(item.baseUnitPrice || (item.unitPrice || 0) * (item.exchangeRate || propExchangeRate || 1))}
                  </p>
                </div>
              </FormField>

              <FormField id="taxType" label="Tax Type">
                {isReadOnly ? (
                  <div className="h-9 flex items-center text-sm font-medium">
                    {item.taxSystem || 'GST'} {item.taxIncluded ? 'Inclusive' : 'Exclusive'}
                  </div>
                ) : (
                  <Select
                    value={getTaxTypeValue(item.taxSystem, item.taxIncluded)}
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
                  <FormField id="discount" label="Discount Rate (%)">
                    <Input
                      id="discount"
                      type="number"
                      step="0.01"
                      value={item.discount || 0}
                      onChange={(e) => handleChange('discount', e.target.value)}
                      className={cn("h-9", item.adjustments?.discount && "bg-muted")}
                      disabled={isReadOnly || item.adjustments?.discount}
                    />
                  </FormField>
                  {!isReadOnly && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="adjDiscount"
                        checked={item.adjustments?.discount || false}
                        onCheckedChange={(checked) => handleAdjustmentChange('discount', !!checked)}
                      />
                      <Label htmlFor="adjDiscount" className="text-xs cursor-pointer">Override Amount</Label>
                    </div>
                  )}
                  {item.adjustments?.discount && (
                    <Input
                      type="number"
                      step="0.01"
                      value={item.discountAmount || 0}
                      onChange={(e) => handleChange('discountAmount', e.target.value)}
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
                      value={item.taxRate || 0}
                      onChange={(e) => handleChange('taxRate', e.target.value)}
                      className={cn("h-9", item.adjustments?.tax && "bg-muted")}
                      disabled={isReadOnly || item.adjustments?.tax}
                    />
                  </FormField>
                  {!isReadOnly && (
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="adjTax"
                        checked={item.adjustments?.tax || false}
                        onCheckedChange={(checked) => handleAdjustmentChange('tax', !!checked)}
                      />
                      <Label htmlFor="adjTax" className="text-xs cursor-pointer">Override Amount</Label>
                    </div>
                  )}
                  {item.adjustments?.tax && (
                    <Input
                      type="number"
                      step="0.01"
                      value={item.taxAmount || 0}
                      onChange={(e) => handleChange('taxAmount', e.target.value)}
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
                  <span className="text-right">{item.currency || currencyCode}</span>
                  <span className="text-right">{item.baseCurrency || baseCurrencyCode} (Base)</span>
                </div>

                {/* Rows */}
                <div className="divide-y">
                  <div className="grid grid-cols-3 gap-4 py-3">
                    <span className="text-sm">Subtotal</span>
                    <span className="text-sm text-right font-mono">{formatAmountOnly(item.subTotalAmount)}</span>
                    <span className="text-sm text-right font-mono text-muted-foreground">{formatAmountOnly(item.baseSubTotalAmount)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-3">
                    <span className="text-sm">Discount</span>
                    <span className="text-sm text-right font-mono text-red-600">-{formatAmountOnly(item.discountAmount)}</span>
                    <span className="text-sm text-right font-mono text-muted-foreground">-{formatAmountOnly(item.baseDiscountAmount)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-3">
                    <span className="text-sm">Net Amount</span>
                    <span className="text-sm text-right font-mono">{formatAmountOnly(item.netAmount)}</span>
                    <span className="text-sm text-right font-mono text-muted-foreground">{formatAmountOnly(item.baseNetAmount)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-3">
                    <span className="text-sm">Tax</span>
                    <span className="text-sm text-right font-mono">{formatAmountOnly(item.taxAmount)}</span>
                    <span className="text-sm text-right font-mono text-muted-foreground">{formatAmountOnly(item.baseTaxAmount)}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-3 bg-muted/50 -mx-4 px-4">
                    <span className="text-sm font-semibold">Total Amount</span>
                    <span className="text-sm text-right font-mono font-semibold">{formatAmountOnly(item.totalAmount)}</span>
                    <span className="text-sm text-right font-mono font-semibold">{formatAmountOnly(item.baseTotalAmount)}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Business Tab */}
          <TabsContent value="business" className="p-6 mt-0 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField id="jobCode" label="Job Number">
                {isReadOnly ? (
                  <div className="h-9 flex items-center text-sm font-medium">
                    {item.jobCode || "Not assigned"}
                  </div>
                ) : (
                  <Select
                    value={item.jobCode || ''}
                    onValueChange={(value) => {
                      if (value === ADD_NEW_VALUE) {
                        onAddNewRecord?.('jobCode');
                      } else {
                        handleChange('jobCode', value);
                      }
                    }}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select job number" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_JOB_NUMBERS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                      <SelectItem value={ADD_NEW_VALUE} className="text-blue-600 italic">
                        + Add New...
                      </SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </FormField>

              <FormField id="event" label="Event">
                {isReadOnly ? (
                  <div className="h-9 flex items-center text-sm font-medium">
                    {item.event || "Not assigned"}
                  </div>
                ) : (
                  <Select
                    value={item.event || ''}
                    onValueChange={(value) => handleChange('event', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select event" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_EVENTS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField id="project" label="Project">
                {isReadOnly ? (
                  <div className="h-9 flex items-center text-sm font-medium">
                    {item.project || "Not assigned"}
                  </div>
                ) : (
                  <Select
                    value={item.project || ''}
                    onValueChange={(value) => handleChange('project', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_PROJECTS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>

              <FormField id="marketSegment" label="Market Segment">
                {isReadOnly ? (
                  <div className="h-9 flex items-center text-sm font-medium">
                    {item.marketSegment || "Not assigned"}
                  </div>
                ) : (
                  <Select
                    value={item.marketSegment || ''}
                    onValueChange={(value) => handleChange('marketSegment', value)}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select segment" />
                    </SelectTrigger>
                    <SelectContent>
                      {MOCK_MARKET_SEGMENTS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </FormField>
            </div>
          </TabsContent>

          {/* Inventory Tab */}
          {mode !== 'add' && (
            <TabsContent value="inventory" className="p-6 mt-0 space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                <h4 className="text-sm font-medium text-blue-900 mb-4">Current Inventory Status</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-blue-600 mb-1">Inventory On Hand</p>
                    <p className="text-lg font-semibold text-blue-900">{item.inventoryOnHand || 0} {item.baseUnit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-blue-600 mb-1">On Order (Pending)</p>
                    <p className="text-lg font-semibold text-blue-900">{item.inventoryOnOrder || 0} {item.baseUnit}</p>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-5">
                <h4 className="text-sm font-medium text-amber-900 mb-4">Order Status</h4>
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-amber-600 mb-1">Ordered</p>
                    <p className="text-lg font-semibold text-amber-900">{item.orderedQuantity || 0} {item.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 mb-1">Received</p>
                    <p className="text-lg font-semibold text-green-700">{item.receivedQuantity || 0} {item.unit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-amber-600 mb-1">Remaining</p>
                    <p className={cn(
                      "text-lg font-semibold",
                      (item.remainingQuantity || 0) > 0 ? "text-orange-700" : "text-green-700"
                    )}>
                      {item.remainingQuantity || 0} {item.unit}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
                <h4 className="text-sm font-medium text-gray-900 mb-4">Purchase History</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Purchase Price</p>
                    <p className="text-sm font-medium">{currencyCode} {formatAmountOnly(item.lastPurchasePrice || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Last Order Date</p>
                    <p className="text-sm font-medium">
                      {item.lastOrderDate ? format(new Date(item.lastOrderDate), 'PP') : 'N/A'}
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-gray-500 mb-1">Last Vendor</p>
                    <p className="text-sm font-medium">{item.lastVendor || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          )}

          {/* Related Documents Tab */}
          {mode !== 'add' && (
            <TabsContent value="related" className="p-6 mt-0 space-y-6">
              {/* Related Purchase Requests */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                <h4 className="text-sm font-medium text-blue-900 mb-4 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Related Purchase Requests
                  {(() => {
                    const relatedPRs = item.relatedPRs?.length ? item.relatedPRs : getMockRelatedPRs(item.sourceRequestId);
                    return relatedPRs.length > 0 && (
                      <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300 text-xs ml-2">
                        {relatedPRs.length} PR{relatedPRs.length > 1 ? 's' : ''}
                      </Badge>
                    );
                  })()}
                </h4>
                {(() => {
                  const relatedPRs = item.relatedPRs?.length ? item.relatedPRs : getMockRelatedPRs(item.sourceRequestId);
                  if (relatedPRs.length > 0) {
                    return (
                      <div className="space-y-3">
                        {/* PR Table */}
                        <div className="bg-white rounded-md border border-blue-200 overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead className="bg-blue-100/50">
                                <tr>
                                  <th className="px-3 py-2 text-left font-medium text-blue-900">PR#</th>
                                  <th className="px-3 py-2 text-left font-medium text-blue-900">Details #</th>
                                  <th className="px-3 py-2 text-left font-medium text-blue-900">Request Location</th>
                                  <th className="px-3 py-2 text-left font-medium text-blue-900">Business Dimensions</th>
                                  <th className="px-3 py-2 text-right font-medium text-blue-900">Approved Qty</th>
                                  <th className="px-3 py-2 text-left font-medium text-blue-900">Units</th>
                                  <th className="px-3 py-2 text-left font-medium text-blue-900">Item Comments</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-blue-100">
                                {relatedPRs.map((pr) => (
                                  <tr key={pr.id} className="hover:bg-blue-50/50">
                                    <td className="px-3 py-2">
                                      <button
                                        className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                        onClick={() => window.open(`/procurement/purchase-requests/${pr.refNo}`, '_blank')}
                                      >
                                        {pr.refNo}
                                      </button>
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">{pr.detailNumber}</td>
                                    <td className="px-3 py-2 text-gray-700">{pr.requestLocation}</td>
                                    <td className="px-3 py-2">
                                      <div className="space-y-0.5">
                                        <div className="text-gray-900 font-medium">{pr.businessDimensions.department}</div>
                                        <div className="text-gray-500">{pr.businessDimensions.costCenter}</div>
                                        {pr.businessDimensions.project && (
                                          <div className="text-blue-600 text-[10px]">{pr.businessDimensions.project}</div>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-3 py-2 text-right font-medium text-gray-900">{pr.approvedQty}</td>
                                    <td className="px-3 py-2 text-gray-700">{pr.approvedUnit}</td>
                                    <td className="px-3 py-2 text-gray-600 max-w-[200px]">
                                      <span className="line-clamp-2" title={pr.itemComments}>
                                        {pr.itemComments}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-blue-200">
                          <div>
                            <p className="text-xs text-blue-600 mb-1">Total Approved Qty</p>
                            <p className="text-sm font-semibold text-blue-900">
                              {relatedPRs.reduce((sum, pr) => sum + pr.approvedQty, 0)} {item.unit}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-blue-600 mb-1">PRs Count</p>
                            <p className="text-sm font-semibold text-blue-900">{relatedPRs.length}</p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="text-center py-4">
                      <p className="text-sm text-blue-600">No related Purchase Requests</p>
                      <p className="text-xs text-blue-500 mt-1">This item was added directly to the PO</p>
                    </div>
                  );
                })()}
              </div>

              {/* Related GRNs */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-5">
                <h4 className="text-sm font-medium text-green-900 mb-4 flex items-center gap-2">
                  <Box className="h-4 w-4" />
                  Related Goods Received Notes
                  {(() => {
                    const relatedGRNs = item.relatedGRNs?.length ? item.relatedGRNs : getMockRelatedGRNs(item.receivedQuantity || 0);
                    return relatedGRNs.length > 0 && (
                      <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300 text-xs ml-2">
                        {relatedGRNs.length} GRN{relatedGRNs.length > 1 ? 's' : ''}
                      </Badge>
                    );
                  })()}
                </h4>
                {(() => {
                  const relatedGRNs = item.relatedGRNs?.length ? item.relatedGRNs : getMockRelatedGRNs(item.receivedQuantity || 0);
                  if (relatedGRNs.length > 0) {
                    return (
                      <div className="space-y-3">
                        {/* GRN Table */}
                        <div className="bg-white rounded-md border border-green-200 overflow-hidden">
                          <div className="overflow-x-auto">
                            <table className="w-full text-xs">
                              <thead className="bg-green-100/50">
                                <tr>
                                  <th className="px-3 py-2 text-left font-medium text-green-900">GRN#</th>
                                  <th className="px-3 py-2 text-left font-medium text-green-900">Details #</th>
                                  <th className="px-3 py-2 text-left font-medium text-green-900">Location</th>
                                  <th className="px-3 py-2 text-right font-medium text-green-900">Received Qty</th>
                                  <th className="px-3 py-2 text-left font-medium text-green-900">Unit</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-green-100">
                                {relatedGRNs.map((grn) => (
                                  <tr key={grn.id} className="hover:bg-green-50/50">
                                    <td className="px-3 py-2">
                                      <button
                                        className="text-green-600 hover:text-green-800 hover:underline font-medium"
                                        onClick={() => window.open(`/procurement/goods-received-note/${grn.refNo}`, '_blank')}
                                      >
                                        {grn.refNo}
                                      </button>
                                    </td>
                                    <td className="px-3 py-2 text-gray-700">{grn.detailNumber}</td>
                                    <td className="px-3 py-2 text-gray-700">{grn.receivedLocation}</td>
                                    <td className="px-3 py-2 text-right font-medium text-gray-900">{grn.receivedQuantity}</td>
                                    <td className="px-3 py-2 text-gray-700">{grn.unit}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Summary */}
                        <div className="grid grid-cols-3 gap-4 pt-3 border-t border-green-200">
                          <div>
                            <p className="text-xs text-green-600 mb-1">Total Ordered</p>
                            <p className="text-sm font-semibold text-green-900">{item.orderedQuantity || 0} {item.unit}</p>
                          </div>
                          <div>
                            <p className="text-xs text-green-600 mb-1">Total Received</p>
                            <p className="text-sm font-semibold text-green-700">
                              {relatedGRNs.reduce((sum, grn) => sum + grn.receivedQuantity, 0)} {item.unit}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-green-600 mb-1">Pending</p>
                            <p className={cn(
                              "text-sm font-semibold",
                              (item.remainingQuantity || 0) > 0 ? "text-orange-600" : "text-green-700"
                            )}>
                              {item.remainingQuantity || 0} {item.unit}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  return (
                    <div className="text-center py-4">
                      <p className="text-sm text-green-600">No goods received yet</p>
                      <p className="text-xs text-green-500 mt-1">GRN will appear here once goods are received</p>
                    </div>
                  );
                })()}
              </div>
            </TabsContent>
          )}
        </ScrollArea>
      </Tabs>
    </div>
  );
}
