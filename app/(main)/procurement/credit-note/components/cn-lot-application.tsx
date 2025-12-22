"use client";

import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import {
  X,
  Edit,
  Package,
  Calculator,
  RotateCcw,
  Layers,
  Building2,
  RefreshCcw,
  FileText,
  AlertTriangle,
  CalendarIcon,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { CreditNoteItem } from "../lib/groupItems";

type CNDetailMode = "view" | "edit" | "add";

/**
 * Extended CN Item type for form handling
 */
export interface FormCNItem {
  id: string | number;
  location: {
    code: string;
    name: string;
  };
  product: {
    code: string;
    name: string;
    description?: string;
  };
  quantity: {
    primary: number;
    secondary: number;
  };
  unit: {
    primary: string;
    secondary: string;
  };
  price: {
    unit: number;
    secondary: number;
  };
  amounts: {
    net: number;
    tax: number;
    total: number;
    baseNet: number;
    baseTax: number;
    baseTotal: number;
  };
  grnReference?: string;
  grnDate?: string;
  originalQuantity?: number;
  returnQuantity?: number;
  returnReason?: string;
  notes?: string;
  lotNumber?: string;
  batchNumber?: string;
  expiryDate?: string;
  taxRate?: number;
  discountRate?: number;
  discountAmount?: number;
  currency?: string;
  exchangeRate?: number;
  baseCurrency?: string;
  jobCode?: string;
  event?: string;
  project?: string;
  marketSegment?: string;
  hasDiscrepancy?: boolean;
  discrepancyType?: string;
  discrepancyNotes?: string;
}

// Mock lot data
const mockLots = [
  {
    id: "LOT001",
    location: "Warehouse A - Rack 3",
    lotNumber: "LOT001",
    receiptDate: "23-10-2024 14:30",
    originalQty: 1000,
    availableQty: 500,
    unitCost: 50.00,
    applyQty: 10,
    newQty: 490,
    originalValue: 25000.00,
    newValue: 22500.00,
    difference: -2500.00,
  },
  {
    id: "LOT002",
    location: "Warehouse B - Rack 1",
    lotNumber: "LOT002",
    receiptDate: "23-10-2024 16:45",
    originalQty: 800,
    availableQty: 300,
    unitCost: 50.00,
    applyQty: 20,
    newQty: 280,
    originalValue: 15000.00,
    newValue: 13500.00,
    difference: -1500.00,
  },
];

// Return reason options
const RETURN_REASONS = [
  { value: "DAMAGED", label: "Damaged" },
  { value: "EXPIRED", label: "Expired" },
  { value: "WRONG_DELIVERY", label: "Wrong Delivery" },
  { value: "QUALITY_ISSUE", label: "Quality Issue" },
  { value: "PRICE_ADJUSTMENT", label: "Price Adjustment" },
  { value: "OTHER", label: "Other" },
];

// Job number options
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

// Product options for lookup
const MOCK_PRODUCTS = [
  { code: "BEV-CM450-001", name: "Coffee mate 450 g.", description: "Non-dairy coffee creamer" },
  { code: "BEV-HB330-001", name: "Heineken Beer 330ml", description: "Premium lager beer" },
  { code: "BEV-CC500-001", name: "Coca Cola 500ml", description: "Carbonated soft drink" },
  { code: "BEV-PW1L-001", name: "Purified Water 1L", description: "Bottled drinking water" },
  { code: "FOD-RCE5K-001", name: "Thai Jasmine Rice 5kg", description: "Premium jasmine rice" },
  { code: "FOD-CHK1K-001", name: "Fresh Chicken 1kg", description: "Fresh whole chicken" },
];

// Location options for lookup
const MOCK_LOCATIONS = [
  { code: "WH-001", name: "Main Warehouse" },
  { code: "WH-002", name: "Secondary Warehouse" },
  { code: "WH-003", name: "Cold Storage" },
  { code: "ST-001", name: "Store Room A" },
  { code: "ST-002", name: "Store Room B" },
  { code: "KIT-001", name: "Main Kitchen" },
];

// GRN options for lookup
const MOCK_GRNS = [
  { value: "GRN-2410-0089", label: "GRN-2410-0089", date: "2024-03-10" },
  { value: "GRN-2410-0088", label: "GRN-2410-0088", date: "2024-03-08" },
  { value: "GRN-2410-0087", label: "GRN-2410-0087", date: "2024-03-05" },
  { value: "GRN-2410-0086", label: "GRN-2410-0086", date: "2024-03-01" },
  { value: "GRN-2410-0085", label: "GRN-2410-0085", date: "2024-02-28" },
];

// Convert CreditNoteItem to FormCNItem
function toFormCNItem(input: CreditNoteItem | FormCNItem | null): FormCNItem {
  if (!input) {
    return {
      id: crypto.randomUUID(),
      location: { code: "", name: "" },
      product: { code: "", name: "", description: "" },
      quantity: { primary: 0, secondary: 0 },
      unit: { primary: "Pcs", secondary: "Pcs" },
      price: { unit: 0, secondary: 0 },
      amounts: { net: 0, tax: 0, total: 0, baseNet: 0, baseTax: 0, baseTotal: 0 },
      currency: "THB",
      exchangeRate: 1,
      baseCurrency: "THB",
      taxRate: 7,
    };
  }
  return {
    ...input,
    currency: (input as FormCNItem).currency || "THB",
    exchangeRate: (input as FormCNItem).exchangeRate || 1,
    baseCurrency: (input as FormCNItem).baseCurrency || "THB",
    taxRate: (input as FormCNItem).taxRate || 7,
  } as FormCNItem;
}

// Helper for formatting currency
const formatAmountOnly = (amount: number) => {
  if (typeof amount !== "number" || isNaN(amount)) return "0.00";
  return amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

interface CnLotApplicationProps {
  item?: CreditNoteItem | FormCNItem | null;
  mode?: CNDetailMode;
  onClose?: () => void;
  onSave?: (item: FormCNItem) => void;
  onModeChange?: (mode: CNDetailMode) => void;
}

export function CnLotApplication({
  item: initialItem = null,
  mode: initialMode = "view",
  onClose,
  onSave,
  onModeChange,
}: CnLotApplicationProps) {
  const [item, setItem] = useState<FormCNItem>(() => toFormCNItem(initialItem));
  const [mode, setMode] = useState<CNDetailMode>(initialMode);
  const [selectedLots, setSelectedLots] = useState<string[]>(["LOT001"]);

  // Popover states for searchable lookups
  const [productOpen, setProductOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);
  const [grnOpen, setGrnOpen] = useState(false);
  const [grnDateOpen, setGrnDateOpen] = useState(false);
  const [returnReasonOpen, setReturnReasonOpen] = useState(false);
  const [jobCodeOpen, setJobCodeOpen] = useState(false);
  const [eventOpen, setEventOpen] = useState(false);
  const [projectOpen, setProjectOpen] = useState(false);
  const [marketSegmentOpen, setMarketSegmentOpen] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setItem(toFormCNItem(initialItem));
  }, [initialItem]);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const isReadOnly = mode === "view";
  const unitOptions = ["Kg", "Pcs", "Box", "Pack", "L", "mL", "Set", "Unit", "Bag", "Case", "Bottle"];

  // Handle mode change
  const handleModeChange = (newMode: CNDetailMode) => {
    setMode(newMode);
    onModeChange?.(newMode);
  };

  // Handle field changes
  const handleChange = (field: string, value: any) => {
    setItem((prev) => {
      const updated = { ...prev };

      // Handle nested fields
      if (field.includes(".")) {
        const [parent, child] = field.split(".");
        (updated as any)[parent] = {
          ...(updated as any)[parent],
          [child]: value,
        };
      } else {
        (updated as any)[field] = value;
      }

      // Recalculate amounts if relevant fields changed
      if (["quantity.primary", "price.unit", "taxRate", "discountRate"].includes(field)) {
        return recalculateAmounts(updated);
      }

      return updated;
    });
  };

  // Recalculate amounts
  const recalculateAmounts = useCallback((currentItem: FormCNItem): FormCNItem => {
    const updated = { ...currentItem };
    const quantity = updated.quantity.primary || 0;
    const price = updated.price.unit || 0;
    const taxRate = updated.taxRate || 0;
    const discountRate = updated.discountRate || 0;
    const exchangeRate = updated.exchangeRate || 1;

    const subtotal = price * quantity;
    const discountAmount = (subtotal * discountRate) / 100;
    const netAmount = subtotal - discountAmount;
    const taxAmount = (netAmount * taxRate) / 100;
    const totalAmount = netAmount + taxAmount;

    updated.amounts = {
      net: parseFloat(netAmount.toFixed(2)),
      tax: parseFloat(taxAmount.toFixed(2)),
      total: parseFloat(totalAmount.toFixed(2)),
      baseNet: parseFloat((netAmount * exchangeRate).toFixed(2)),
      baseTax: parseFloat((taxAmount * exchangeRate).toFixed(2)),
      baseTotal: parseFloat((totalAmount * exchangeRate).toFixed(2)),
    };

    return updated;
  }, []);

  const handleCancel = () => {
    if (mode === "add") {
      onClose?.();
    } else {
      setItem(toFormCNItem(initialItem));
      handleModeChange("view");
    }
  };

  const handleSave = () => {
    const finalItem = recalculateAmounts(item);
    onSave?.(finalItem);
    handleModeChange("view");
  };

  const toggleLotSelection = (lotId: string) => {
    setSelectedLots((prev) =>
      prev.includes(lotId) ? prev.filter((id) => id !== lotId) : [...prev, lotId]
    );
  };

  // FormField Component
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
              // Handle nested field access
              const getValue = (obj: any, path: string) => {
                return path.split(".").reduce((acc, part) => acc?.[part], obj);
              };
              const value = getValue(item, id);
              if (value === null || value === undefined || value === "") {
                return <span className="text-muted-foreground">N/A</span>;
              }
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
            {mode === "add" ? "Add Return Item" : "Return Item Details"}
          </h2>
          {item.product.name && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {item.product.name} • {item.grnReference || "No GRN"}
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
          {onClose && (
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Tabbed Content */}
      <Tabs defaultValue="details" className="flex-1 flex flex-col">
        <TabsList className="w-full justify-start rounded-none border-b bg-transparent px-6 h-12">
          <TabsTrigger
            value="details"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            <Package className="h-4 w-4 mr-2" />
            Details
          </TabsTrigger>
          <TabsTrigger
            value="return"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Return
          </TabsTrigger>
          <TabsTrigger
            value="pricing"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            <Calculator className="h-4 w-4 mr-2" />
            Pricing
          </TabsTrigger>
          <TabsTrigger
            value="lots"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            <Layers className="h-4 w-4 mr-2" />
            Lots
          </TabsTrigger>
          <TabsTrigger
            value="business"
            className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none"
          >
            <Building2 className="h-4 w-4 mr-2" />
            Business
          </TabsTrigger>
        </TabsList>

        <ScrollArea className="flex-1">
          {/* Details Tab */}
          <TabsContent value="details" className="p-6 mt-0 space-y-6">
            {/* Location Lookup */}
            <div className="grid grid-cols-2 gap-4">
              <FormField id="location.name" label="Location" required>
                {isReadOnly ? (
                  <div className="h-9 flex items-center text-sm font-medium">
                    {item.location.name || "Not specified"}
                  </div>
                ) : (
                  <Popover open={locationOpen} onOpenChange={setLocationOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={locationOpen}
                        className="h-9 w-full justify-between font-normal"
                      >
                        {item.location.name || "Select location..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search locations..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No location found.</CommandEmpty>
                          <CommandGroup>
                            {MOCK_LOCATIONS.map((location) => (
                              <CommandItem
                                key={location.code}
                                value={`${location.name} ${location.code}`}
                                onSelect={() => {
                                  setItem((prev) => ({
                                    ...prev,
                                    location: {
                                      code: location.code,
                                      name: location.name,
                                    },
                                  }));
                                  setLocationOpen(false);
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{location.name}</span>
                                  <span className="text-xs text-muted-foreground">{location.code}</span>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    item.location.code === location.code ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </FormField>

              <FormField id="location.code" label="Location Code">
                <div className="h-9 flex items-center px-3 rounded-md border bg-muted/30 text-sm font-medium">
                  {item.location.code || "Auto-filled"}
                </div>
              </FormField>
            </div>

            {/* Product Lookup */}
            <div className="grid grid-cols-2 gap-4">
              <FormField id="product.name" label="Product Name" required>
                {isReadOnly ? (
                  <div className="h-9 flex items-center text-sm font-medium">
                    {item.product.name || "Not specified"}
                  </div>
                ) : (
                  <Popover open={productOpen} onOpenChange={setProductOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={productOpen}
                        className="h-9 w-full justify-between font-normal"
                      >
                        {item.product.name || "Select product..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[350px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search products..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No product found.</CommandEmpty>
                          <CommandGroup>
                            {MOCK_PRODUCTS.map((product) => (
                              <CommandItem
                                key={product.code}
                                value={`${product.name} ${product.code}`}
                                onSelect={() => {
                                  setItem((prev) => ({
                                    ...prev,
                                    product: {
                                      code: product.code,
                                      name: product.name,
                                      description: product.description,
                                    },
                                  }));
                                  setProductOpen(false);
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{product.name}</span>
                                  <span className="text-xs text-muted-foreground">{product.code}</span>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    item.product.code === product.code ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </FormField>

              <FormField id="product.code" label="Product Code">
                <div className="h-9 flex items-center px-3 rounded-md border bg-muted/30 text-sm font-medium">
                  {item.product.code || "Auto-filled"}
                </div>
              </FormField>
            </div>

            {/* Description (read-only, auto-filled from product) */}
            <FormField id="product.description" label="Description">
              <div className="h-9 flex items-center px-3 rounded-md border bg-muted/30 text-sm">
                {item.product.description || "Auto-filled from product"}
              </div>
            </FormField>

            {/* GRN Lookup */}
            <div className="grid grid-cols-2 gap-4">
              <FormField id="grnReference" label="GRN Reference">
                {isReadOnly ? (
                  <div className="h-9 flex items-center text-sm font-medium">
                    {item.grnReference || "Not specified"}
                  </div>
                ) : (
                  <Popover open={grnOpen} onOpenChange={setGrnOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={grnOpen}
                        className="h-9 w-full justify-between font-normal"
                      >
                        {item.grnReference || "Select GRN..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search GRNs..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No GRN found.</CommandEmpty>
                          <CommandGroup>
                            {MOCK_GRNS.map((grn) => (
                              <CommandItem
                                key={grn.value}
                                value={grn.label}
                                onSelect={() => {
                                  handleChange("grnReference", item.grnReference === grn.value ? "" : grn.value);
                                  handleChange("grnDate", grn.date);
                                  setGrnOpen(false);
                                }}
                              >
                                <div className="flex flex-col">
                                  <span className="font-medium">{grn.label}</span>
                                  <span className="text-xs text-muted-foreground">{format(new Date(grn.date), "PP")}</span>
                                </div>
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    item.grnReference === grn.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </FormField>

              <FormField id="grnDate" label="GRN Date">
                <div className="h-9 flex items-center px-3 rounded-md border bg-muted/30 text-sm font-medium">
                  <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                  {item.grnDate ? format(new Date(item.grnDate), "PPP") : "Auto-filled from GRN"}
                </div>
              </FormField>
            </div>

            <FormField id="notes" label="Notes">
              {isReadOnly ? (
                <div className="min-h-[80px] flex items-start p-3 rounded-md border bg-muted/30 text-sm">
                  {item.notes || "No notes"}
                </div>
              ) : (
                <Textarea
                  id="notes"
                  value={item.notes || ""}
                  onChange={(e) => handleChange("notes", e.target.value)}
                  placeholder="Add any notes..."
                  className="min-h-[80px] resize-none"
                />
              )}
            </FormField>
          </TabsContent>

          {/* Return Tab */}
          <TabsContent value="return" className="p-6 mt-0 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="originalQuantity"
                label="Original Qty"
                smallText="Quantity received from GRN"
              >
                <div className="h-9 flex items-center px-3 rounded-md border bg-muted/30 text-sm font-medium">
                  {item.originalQuantity || 0}
                </div>
              </FormField>

              <FormField id="unit.primary" label="Unit">
                <div className="h-9 flex items-center px-3 rounded-md border bg-muted/30 text-sm font-medium">
                  {item.unit.primary || "N/A"}
                </div>
              </FormField>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="quantity.primary"
                label="Return Qty"
                required
                smallText="Quantity to return to vendor"
              >
                <Input
                  id="quantity.primary"
                  type="number"
                  value={item.quantity.primary || 0}
                  onChange={(e) => handleChange("quantity.primary", parseFloat(e.target.value) || 0)}
                  className="h-9"
                  min={0}
                />
              </FormField>

              <FormField id="unit.primary" label="Return Unit">
                <Select
                  value={item.unit.primary || ""}
                  onValueChange={(value) => handleChange("unit.primary", value)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {unitOptions.map((u) => (
                      <SelectItem key={u} value={u}>
                        {u}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>

            <Separator />

            <FormField id="returnReason" label="Return Reason" required>
              {isReadOnly ? (
                <div className="h-9 flex items-center text-sm font-medium">
                  {RETURN_REASONS.find((r) => r.value === item.returnReason)?.label || "Not specified"}
                </div>
              ) : (
                <Popover open={returnReasonOpen} onOpenChange={setReturnReasonOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={returnReasonOpen}
                      className="h-9 w-full justify-between font-normal"
                    >
                      {item.returnReason
                        ? RETURN_REASONS.find((r) => r.value === item.returnReason)?.label
                        : "Select reason..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[300px] p-0" align="start">
                    <Command>
                      <CommandInput placeholder="Search reasons..." className="h-9" />
                      <CommandList>
                        <CommandEmpty>No reason found.</CommandEmpty>
                        <CommandGroup>
                          {RETURN_REASONS.map((reason) => (
                            <CommandItem
                              key={reason.value}
                              value={reason.label}
                              onSelect={() => {
                                handleChange("returnReason", item.returnReason === reason.value ? "" : reason.value);
                                setReturnReasonOpen(false);
                              }}
                            >
                              {reason.label}
                              <Check
                                className={cn(
                                  "ml-auto h-4 w-4",
                                  item.returnReason === reason.value ? "opacity-100" : "opacity-0"
                                )}
                              />
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              )}
            </FormField>

            <div className="grid grid-cols-2 gap-4">
              <FormField id="lotNumber" label="Lot Number">
                <Input
                  id="lotNumber"
                  value={item.lotNumber || ""}
                  onChange={(e) => handleChange("lotNumber", e.target.value)}
                  placeholder="Enter lot number"
                  className="h-9"
                />
              </FormField>

              <FormField id="batchNumber" label="Batch Number">
                <Input
                  id="batchNumber"
                  value={item.batchNumber || ""}
                  onChange={(e) => handleChange("batchNumber", e.target.value)}
                  placeholder="Enter batch number"
                  className="h-9"
                />
              </FormField>
            </div>

            {/* Discrepancy Section */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasDiscrepancy"
                  checked={item.hasDiscrepancy || false}
                  onCheckedChange={(checked) => handleChange("hasDiscrepancy", checked)}
                  disabled={isReadOnly}
                />
                <Label htmlFor="hasDiscrepancy" className="text-sm cursor-pointer flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                  This return has discrepancy issues
                </Label>
              </div>

              {item.hasDiscrepancy && (
                <div className="pl-6 space-y-3">
                  <FormField id="discrepancyType" label="Discrepancy Type">
                    <Select
                      value={item.discrepancyType || ""}
                      onValueChange={(value) => handleChange("discrepancyType", value)}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quantity">Quantity Mismatch</SelectItem>
                        <SelectItem value="quality">Quality Issue</SelectItem>
                        <SelectItem value="specification">Specification Mismatch</SelectItem>
                        <SelectItem value="damage">Damage</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormField>

                  <FormField id="discrepancyNotes" label="Discrepancy Notes">
                    <Textarea
                      id="discrepancyNotes"
                      value={item.discrepancyNotes || ""}
                      onChange={(e) => handleChange("discrepancyNotes", e.target.value)}
                      placeholder="Describe the discrepancy..."
                      className="min-h-[60px] resize-none"
                    />
                  </FormField>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Pricing Tab */}
          <TabsContent value="pricing" className="p-6 mt-0 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField id="currency" label="Currency">
                <div className="h-9 flex items-center px-3 rounded-md border bg-muted/30 text-sm font-medium">
                  {item.currency || "THB"}
                </div>
              </FormField>

              <FormField id="exchangeRate" label="Exchange Rate">
                <Input
                  id="exchangeRate"
                  type="number"
                  step="0.0001"
                  value={item.exchangeRate || 1}
                  onChange={(e) => handleChange("exchangeRate", parseFloat(e.target.value) || 1)}
                  className="h-9"
                  disabled={isReadOnly}
                />
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField id="price.unit" label="Unit Price">
                <Input
                  id="price.unit"
                  type="number"
                  step="0.01"
                  value={item.price.unit || 0}
                  onChange={(e) => handleChange("price.unit", parseFloat(e.target.value) || 0)}
                  className="h-9"
                  disabled={isReadOnly}
                />
              </FormField>

              <FormField id="taxRate" label="Tax Rate (%)">
                <Input
                  id="taxRate"
                  type="number"
                  step="0.01"
                  value={item.taxRate || 0}
                  onChange={(e) => handleChange("taxRate", parseFloat(e.target.value) || 0)}
                  className="h-9"
                  disabled={isReadOnly}
                />
              </FormField>
            </div>

            <Separator />

            {/* Adjustments */}
            <div>
              <h4 className="text-sm font-medium mb-4">Adjustments</h4>
              <div className="grid grid-cols-2 gap-6">
                <FormField id="discountRate" label="Discount Rate (%)">
                  <Input
                    id="discountRate"
                    type="number"
                    step="0.01"
                    value={item.discountRate || 0}
                    onChange={(e) => handleChange("discountRate", parseFloat(e.target.value) || 0)}
                    className="h-9"
                    disabled={isReadOnly}
                  />
                </FormField>

                <FormField id="discountAmount" label="Discount Amount">
                  <div className="h-9 flex items-center px-3 rounded-md border bg-muted/30 text-sm font-medium">
                    {formatAmountOnly(item.discountAmount || 0)}
                  </div>
                </FormField>
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
                  <span className="text-right">{item.currency || "THB"}</span>
                  <span className="text-right">{item.baseCurrency || "THB"} (Base)</span>
                </div>

                {/* Rows */}
                <div className="divide-y">
                  <div className="grid grid-cols-3 gap-4 py-3">
                    <span className="text-sm">Subtotal</span>
                    <span className="text-sm text-right font-mono">
                      {formatAmountOnly((item.price.unit || 0) * (item.quantity.primary || 0))}
                    </span>
                    <span className="text-sm text-right font-mono text-muted-foreground">
                      {formatAmountOnly((item.price.unit || 0) * (item.quantity.primary || 0) * (item.exchangeRate || 1))}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-3">
                    <span className="text-sm">Discount</span>
                    <span className="text-sm text-right font-mono text-red-600">
                      -{formatAmountOnly(item.discountAmount || 0)}
                    </span>
                    <span className="text-sm text-right font-mono text-muted-foreground">
                      -{formatAmountOnly((item.discountAmount || 0) * (item.exchangeRate || 1))}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-3">
                    <span className="text-sm">Net Amount</span>
                    <span className="text-sm text-right font-mono">
                      {formatAmountOnly(item.amounts.net)}
                    </span>
                    <span className="text-sm text-right font-mono text-muted-foreground">
                      {formatAmountOnly(item.amounts.baseNet)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-3">
                    <span className="text-sm">Tax ({item.taxRate || 0}%)</span>
                    <span className="text-sm text-right font-mono">
                      {formatAmountOnly(item.amounts.tax)}
                    </span>
                    <span className="text-sm text-right font-mono text-muted-foreground">
                      {formatAmountOnly(item.amounts.baseTax)}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-3 bg-muted/50 -mx-4 px-4">
                    <span className="text-sm font-semibold">Total Amount</span>
                    <span className="text-sm text-right font-mono font-semibold">
                      {formatAmountOnly(item.amounts.total)}
                    </span>
                    <span className="text-sm text-right font-mono font-semibold">
                      {formatAmountOnly(item.amounts.baseTotal)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Lots Tab */}
          <TabsContent value="lots" className="p-6 mt-0 space-y-6">
            {/* Cost Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <h4 className="text-sm font-medium text-blue-900 mb-4 flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Cost Information
              </h4>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <p className="text-xs text-blue-600 mb-1">Last Purchase Price</p>
                  <p className="text-lg font-semibold text-blue-900">$50.00</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 mb-1">Standard Cost</p>
                  <p className="text-lg font-semibold text-blue-900">$48.50</p>
                </div>
                <div>
                  <p className="text-xs text-blue-600 mb-1">Moving Average Cost</p>
                  <p className="text-lg font-semibold text-blue-900">$49.25</p>
                </div>
              </div>
            </div>

            {/* Lot Application */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-sm font-medium">Lot Application</h4>
                {!isReadOnly && (
                  <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="sm" className="text-blue-600">
                      <RefreshCcw className="w-4 h-4 mr-1" />
                      Auto Apply
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <Calculator className="w-4 h-4 mr-1" />
                      Calculate Impact
                    </Button>
                  </div>
                )}
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      {!isReadOnly && (
                        <TableHead className="w-[50px]">
                          <Checkbox disabled />
                        </TableHead>
                      )}
                      <TableHead>Lot Number</TableHead>
                      <TableHead className="text-right">Available Qty</TableHead>
                      <TableHead className="text-right">Apply Qty</TableHead>
                      <TableHead className="text-right">New Qty</TableHead>
                      <TableHead className="text-right">Original Value</TableHead>
                      <TableHead className="text-right">New Value</TableHead>
                      <TableHead className="text-right">Difference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockLots.map((lot) => (
                      <TableRow key={lot.id}>
                        {!isReadOnly && (
                          <TableCell>
                            <Checkbox
                              checked={selectedLots.includes(lot.id)}
                              onCheckedChange={() => toggleLotSelection(lot.id)}
                            />
                          </TableCell>
                        )}
                        <TableCell>
                          <div className="font-medium">{lot.lotNumber}</div>
                          <div className="text-sm text-muted-foreground">{lot.receiptDate}</div>
                          <div className="text-sm text-muted-foreground">{lot.location}</div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{lot.availableQty}</TableCell>
                        <TableCell className="text-right">
                          {isReadOnly ? (
                            <span className="font-medium">{lot.applyQty}</span>
                          ) : (
                            <Input
                              type="number"
                              defaultValue={lot.applyQty}
                              className="h-8 w-20 text-right"
                              min={0}
                              max={lot.availableQty}
                            />
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">{lot.newQty}</TableCell>
                        <TableCell className="text-right">${formatAmountOnly(lot.originalValue)}</TableCell>
                        <TableCell className="text-right">${formatAmountOnly(lot.newValue)}</TableCell>
                        <TableCell className="text-right text-red-600 font-medium">
                          -${formatAmountOnly(Math.abs(lot.difference))}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <tfoot>
                    <TableRow className="bg-muted/50">
                      {!isReadOnly && <TableCell />}
                      <TableCell className="font-medium">
                        Total Impact
                        <div className="text-xs text-muted-foreground mt-1">
                          Applied to {selectedLots.length} lots
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-medium">800</TableCell>
                      <TableCell className="text-right font-medium">30</TableCell>
                      <TableCell className="text-right font-medium">770</TableCell>
                      <TableCell className="text-right font-medium">$40,000.00</TableCell>
                      <TableCell className="text-right font-medium">$36,000.00</TableCell>
                      <TableCell className="text-right font-medium text-red-600">-$4,000.00</TableCell>
                    </TableRow>
                  </tfoot>
                </Table>
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
                  <Popover open={jobCodeOpen} onOpenChange={setJobCodeOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={jobCodeOpen}
                        className="h-9 w-full justify-between font-normal"
                      >
                        {item.jobCode
                          ? MOCK_JOB_NUMBERS.find((j) => j.value === item.jobCode)?.label
                          : "Select job number..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search job numbers..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No job number found.</CommandEmpty>
                          <CommandGroup>
                            {MOCK_JOB_NUMBERS.map((option) => (
                              <CommandItem
                                key={option.value}
                                value={option.label}
                                onSelect={() => {
                                  handleChange("jobCode", item.jobCode === option.value ? "" : option.value);
                                  setJobCodeOpen(false);
                                }}
                              >
                                {option.label}
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    item.jobCode === option.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </FormField>

              <FormField id="event" label="Event">
                {isReadOnly ? (
                  <div className="h-9 flex items-center text-sm font-medium">
                    {MOCK_EVENTS.find((e) => e.value === item.event)?.label || "Not assigned"}
                  </div>
                ) : (
                  <Popover open={eventOpen} onOpenChange={setEventOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={eventOpen}
                        className="h-9 w-full justify-between font-normal"
                      >
                        {item.event
                          ? MOCK_EVENTS.find((e) => e.value === item.event)?.label
                          : "Select event..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search events..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No event found.</CommandEmpty>
                          <CommandGroup>
                            {MOCK_EVENTS.map((option) => (
                              <CommandItem
                                key={option.value}
                                value={option.label}
                                onSelect={() => {
                                  handleChange("event", item.event === option.value ? "" : option.value);
                                  setEventOpen(false);
                                }}
                              >
                                {option.label}
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    item.event === option.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </FormField>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField id="project" label="Project">
                {isReadOnly ? (
                  <div className="h-9 flex items-center text-sm font-medium">
                    {MOCK_PROJECTS.find((p) => p.value === item.project)?.label || "Not assigned"}
                  </div>
                ) : (
                  <Popover open={projectOpen} onOpenChange={setProjectOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={projectOpen}
                        className="h-9 w-full justify-between font-normal"
                      >
                        {item.project
                          ? MOCK_PROJECTS.find((p) => p.value === item.project)?.label
                          : "Select project..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search projects..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No project found.</CommandEmpty>
                          <CommandGroup>
                            {MOCK_PROJECTS.map((option) => (
                              <CommandItem
                                key={option.value}
                                value={option.label}
                                onSelect={() => {
                                  handleChange("project", item.project === option.value ? "" : option.value);
                                  setProjectOpen(false);
                                }}
                              >
                                {option.label}
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    item.project === option.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </FormField>

              <FormField id="marketSegment" label="Market Segment">
                {isReadOnly ? (
                  <div className="h-9 flex items-center text-sm font-medium">
                    {MOCK_MARKET_SEGMENTS.find((m) => m.value === item.marketSegment)?.label || "Not assigned"}
                  </div>
                ) : (
                  <Popover open={marketSegmentOpen} onOpenChange={setMarketSegmentOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={marketSegmentOpen}
                        className="h-9 w-full justify-between font-normal"
                      >
                        {item.marketSegment
                          ? MOCK_MARKET_SEGMENTS.find((m) => m.value === item.marketSegment)?.label
                          : "Select segment..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0" align="start">
                      <Command>
                        <CommandInput placeholder="Search segments..." className="h-9" />
                        <CommandList>
                          <CommandEmpty>No segment found.</CommandEmpty>
                          <CommandGroup>
                            {MOCK_MARKET_SEGMENTS.map((option) => (
                              <CommandItem
                                key={option.value}
                                value={option.label}
                                onSelect={() => {
                                  handleChange("marketSegment", item.marketSegment === option.value ? "" : option.value);
                                  setMarketSegmentOpen(false);
                                }}
                              >
                                {option.label}
                                <Check
                                  className={cn(
                                    "ml-auto h-4 w-4",
                                    item.marketSegment === option.value ? "opacity-100" : "opacity-0"
                                  )}
                                />
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </FormField>
            </div>
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}

export default CnLotApplication;
