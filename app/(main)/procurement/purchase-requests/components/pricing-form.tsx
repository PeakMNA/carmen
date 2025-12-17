"use client";

import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import SummaryPRTable from "./tabs/Summary-pr-table";
import { PurchaseRequestItem } from "@/lib/types";
import { mockCurrencies } from "@/lib/mock-data";
import { Package, XIcon } from "lucide-react";

// Summary interface for pricing calculations
interface IBaseSummary {
  baseSubTotalPrice: number;
  subTotalPrice: number;
  baseNetAmount: number;
  netAmount: number;
  baseDiscAmount: number;
  discountAmount: number;
  baseTaxAmount: number;
  taxAmount: number;
  baseTotalAmount: number;
  totalAmount: number;
}

// Extended PurchaseRequestItem with mock-only fields for UI purposes
type ExtendedPurchaseRequestItem = PurchaseRequestItem & {
  currency?: string;
  currencyRate?: number;
  price?: number;
  adjustments?: {
    discount: boolean;
    tax: boolean;
  };
  taxIncluded?: boolean;
  discountRate?: number;
  taxRate?: number;
  taxType?: string;
  discountType?: string;
  taxAmount?: number;
  discountAmount?: number;
  quantityApproved?: number;
};
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/custom-dialog";
import VendorComparison from "./vendor-comparison";

type FormMode = "add" | "edit" | "view";

// Get base currency from mock data
const baseCurrency = mockCurrencies.find(c => c.isBaseCurrency)?.code || 'USD';

const initialFormData: Partial<ExtendedPurchaseRequestItem> = {
  currency: baseCurrency,
  currencyRate: 1,
  price: 3.99,
  adjustments: {
    discount: false,
    tax: false,
  },
  taxIncluded: false,
  discountRate: 5,
  taxRate: 7,
  taxType: "VAT",
  discountType: "Percentage",
};

export function PricingFormComponent({
  data,
  initialMode,
  pricePermission = true,
}: {
  data?: Partial<ExtendedPurchaseRequestItem>;
  initialMode: FormMode;
  pricePermission?: boolean;
}) {
  const [formData, setFormData] = useState<Partial<ExtendedPurchaseRequestItem>>(
    data || initialFormData
  );
  const [mode, setMode] = useState<FormMode>(initialMode);

  // Update form data when parent data prop changes
  useEffect(() => {
    if (data) {
      setFormData({ ...initialFormData, ...data });
    } else {
      setFormData(initialFormData);
    }
  }, [data]);
  const [calculatedAmounts, setCalculatedAmounts] = useState({
    baseAmount: 0,
    discountAmount: 0,
    netAmount: 0,
    taxAmount: 0,
    totalAmount: 0,
  });

  const [summaryFooter, setSummaryFooter] = useState<IBaseSummary>({
    baseSubTotalPrice: 0,
    subTotalPrice: 0,
    baseNetAmount: 0,
    netAmount: 0,
    baseDiscAmount: 0,
    discountAmount: 0,
    baseTaxAmount: 0,
    taxAmount: 0,
    baseTotalAmount: 0,
    totalAmount: 0,
  });

  const [isVendorComparisonOpen, setIsVendorComparisonOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : parseFloat(value) || value,
    }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleModeChange = (newMode: FormMode) => {
    setMode(newMode);
    if (newMode === "add") {
      setFormData(initialFormData);
    }
  };

  function calcRate(amt: number, exchangeRate: number) {
    return amt / exchangeRate;
  }

  useEffect(() => {
    const quantity = 450; // Assuming 450 is the quantity as per the image calculations
    const baseAmount = (formData.price || 0) * quantity;
    const discountAmount =
      formData.discountAmount !== undefined && formData.discountAmount !== null
        ? formData.discountAmount
        : baseAmount * ((formData.discountRate || 0) / 100);
    const netAmount = baseAmount - discountAmount;
    const taxAmount =
      formData.taxAmount !== undefined && formData.taxAmount !== null
        ? formData.taxAmount
        : netAmount * ((formData.taxRate || 0) / 100);
    const totalAmount = netAmount + taxAmount;

    const currencyRate = formData.currencyRate || 1;

    setCalculatedAmounts({
      baseAmount,
      discountAmount,
      netAmount,
      taxAmount,
      totalAmount,
    });

    setSummaryFooter({
      baseSubTotalPrice: baseAmount / currencyRate,
      subTotalPrice: baseAmount,
      baseNetAmount: netAmount / currencyRate,
      netAmount: netAmount,
      baseDiscAmount: discountAmount / currencyRate,
      discountAmount: discountAmount,
      baseTaxAmount: taxAmount / currencyRate,
      taxAmount: taxAmount,
      baseTotalAmount: totalAmount / currencyRate,
      totalAmount: totalAmount,
    });
  }, [formData]);

  const isViewMode = mode === initialMode;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-6 md:gap-0 space-x-0 md:space-x-6">
        <div className="w-full md:w-1/2 ">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Pricing</h2>
            <Dialog
              open={isVendorComparisonOpen}
              onOpenChange={setIsVendorComparisonOpen}
            >
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <Package className="mr-2 h-4 w-4" />
                  Vendor Comparison
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[60vw] bg-white p-6 overflow-y-auto [&>button]:hidden">
                <DialogHeader>
                  <div className="flex justify-between w-full items-center">
                    <DialogTitle>Vendor Comparison</DialogTitle>
                    <DialogClose asChild>
                      <Button variant="ghost" size="sm">
                        <XIcon className="h-4 w-4" />
                      </Button>
                    </DialogClose>
                  </div>
                </DialogHeader>
                <VendorComparison />
              </DialogContent>
            </Dialog>
          </div>
          <div className="space-y-4">
            <div className="flex items-end space-x-4">
              <div className="w-1/4">
                <Label
                  htmlFor="currency"
                  className="text-xs text-muted-foreground"
                >
                  Currency
                </Label>
                <Select
                  value={formData.currency}
                  onValueChange={(value) =>
                    handleSelectChange("currency", value)
                  }
                  disabled={isViewMode}
                >
                  <SelectTrigger id="currency" className="h-8 text-sm">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockCurrencies.filter(c => c.isActive).map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} {currency.isBaseCurrency && "(Base)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-1/4">
                <Label
                  htmlFor="currencyRate"
                  className="text-xs text-muted-foreground"
                >
                  Exch. Rate
                </Label>
                <Input
                  type="number"
                  id="currencyRate"
                  name="currencyRate"
                  value={formData.currencyRate}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className="h-8 text-sm"
                />
              </div>
              <div className="w-1/4">
                <Label
                  htmlFor="price"
                  className="text-xs text-muted-foreground"
                >
                  Price
                  {isViewMode === false && !pricePermission && (
                    <span className="ml-1 text-xs text-amber-600 font-medium">(Read-only)</span>
                  )}
                </Label>
                <Input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  disabled={isViewMode || !pricePermission}
                  className="h-8 text-sm"
                />
              </div>
              <div className="w-1/4">
                <Label
                  htmlFor="taxType"
                  className="text-xs text-muted-foreground"
                >
                  Tax Type
                </Label>
                <Select
                  value={formData.taxType || "VAT"}
                  onValueChange={(value) =>
                    handleSelectChange("taxType", value)
                  }
                  disabled={isViewMode}
                >
                  <SelectTrigger id="taxType" className="h-8 text-sm">
                    <SelectValue placeholder="Select tax type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="VAT">VAT</SelectItem>
                    <SelectItem value="GST">GST</SelectItem>
                    <SelectItem value="SST">SST</SelectItem>
                    <SelectItem value="None">None</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>


            {/* Basic Tax and Discount Rates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="discountRate" className="text-xs text-muted-foreground">
                  Discount Rate (%)
                </Label>
                <Input
                  type="number"
                  id="discountRate"
                  name="discountRate"
                  value={formData.discountRate}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className="h-8 text-sm"
                />
              </div>

              <div>
                <Label htmlFor="taxRate" className="text-xs text-muted-foreground">
                  Tax Rate (%)
                </Label>
                <Input
                  type="number"
                  id="taxRate"
                  name="taxRate"
                  value={formData.taxRate}
                  onChange={handleInputChange}
                  disabled={isViewMode}
                  className="h-8 text-sm"
                />
              </div>
            </div>

            {/* Last Price, Last Order Date, Last Vendor section */}
      <div className="grid grid-cols-3 gap-4 bg-gray-100 p-3 rounded-md">
        <div>
          <p className="text-xs ">Last Price</p>
          <p className="text-xs text-muted-foreground">$3.85 per Kg</p>
        </div>
        <div>
          <p className="text-xs">Last Order Date</p>
          <p className="text-xs text-muted-foreground">2023-05-15</p>
        </div>
        <div>
          <p className="text-xs">Last Vendor</p>
          <p className="text-xs">Organic Supplies Inc.</p>
        </div>
      </div>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <h2 className="text-lg font-semibold mb-4">Calculated Amounts</h2>
          <SummaryPRTable
            item={{
              ...summaryFooter,
              currency: formData.currency || "USD",
              currencyRate: formData.currencyRate || 1,
              discountRate: formData.discountRate || 0,
              taxRate: formData.taxRate || 0,
              price: formData.price || 0,
              quantityApproved: formData.quantityApproved || 0,
            }}
            currencyBase="THB"
            currencyCurrent={formData.currency || "USD"}
          />
        </div>

      </div>

      
    </div>
  );
}
