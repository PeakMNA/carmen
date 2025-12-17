import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Edit, Trash2, Copy, Archive, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockCurrencies } from "@/lib/mock-data";

// Get base currency from mock data
const baseCurrency = mockCurrencies.find(c => c.isBaseCurrency)?.code || 'USD';

// Generate currency options from mock data
const defaultCurrencyOptions = mockCurrencies
  .filter(c => c.isActive)
  .map(c => ({
    value: c.code,
    label: `${c.code} - ${c.name}${c.isBaseCurrency ? ' (Base)' : ''}`
  }));

interface InventoryDeliveryCardProps {
  onHand: number;
  onOrder: number;
  reorderLevel: number;
  restockLevel: number;
  dateRequired: Date | string | null;
  deliveryPoint: string | null;
  unit: string;
  isEditable?: boolean;
  deliveryPointOptions?: Array<{ value: string; label: string }>;
  onDateChange?: (date: Date | undefined) => void;
  onDeliveryPointChange?: (value: string) => void;
  onHandClick?: () => void;
  onOrderClick?: () => void;
}

export const InventoryDeliveryCard: React.FC<InventoryDeliveryCardProps> = ({
  onHand,
  onOrder,
  reorderLevel,
  restockLevel,
  dateRequired,
  deliveryPoint,
  unit = "piece",
  isEditable = false,
  deliveryPointOptions = [],
  onDateChange,
  onDeliveryPointChange,
  onHandClick,
  onOrderClick
}) => {
  const needsReorder = onHand <= reorderLevel;
  const lowStock = onHand <= restockLevel;
  const stockPercentage = Math.max(20, (onHand / restockLevel) * 100);
  
  const formattedDate = dateRequired 
    ? typeof dateRequired === 'string' 
      ? dateRequired 
      : format(dateRequired, "dd/MM/yyyy")
    : "Not specified";

  return (
    <Card className="w-full bg-white shadow-md rounded-xl border-0">
      <CardHeader className="pb-2">
        <h3 className="text-base font-semibold text-gray-900 leading-tight">
          Inventory Information
        </h3>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Inventory Levels - 4 columns for compact layout */}
        <div className="grid grid-cols-4 gap-3 text-sm">
          <div>
            {onHandClick ? (
              <>
                <Button
                  variant="link"
                  size="sm"
                  aria-label="View On Hand breakdown"
                  onClick={onHandClick}
                  className="p-0 h-auto text-blue-600 hover:text-blue-800 hover:underline w-auto justify-start text-xs"
                >
                  On Hand
                </Button>
                <p className="text-sm font-semibold text-gray-900">{onHand}</p>
                <p className="text-xs text-gray-500">{unit}</p>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500 mb-0.5">On Hand</p>
                <p className="text-sm font-semibold text-gray-900">{onHand}</p>
                <p className="text-xs text-gray-500">{unit}</p>
              </>
            )}
          </div>
          
          <div>
            {onOrderClick ? (
              <>
                <Button
                  variant="link"
                  size="sm"
                  aria-label="View On Order details"
                  onClick={onOrderClick}
                  className="p-0 h-auto text-blue-600 hover:text-blue-800 hover:underline w-auto justify-start text-xs"
                >
                  On Order
                </Button>
                <p className="text-sm font-semibold text-gray-900">{onOrder}</p>
                <p className="text-xs text-gray-500">{unit}</p>
              </>
            ) : (
              <>
                <p className="text-xs text-gray-500 mb-0.5">On Order</p>
                <p className="text-sm font-semibold text-gray-900">{onOrder}</p>
                <p className="text-xs text-gray-500">{unit}</p>
              </>
            )}
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Reorder</p>
            <p className="text-sm font-semibold text-gray-900">{reorderLevel}</p>
            <p className="text-xs text-gray-500">{unit}</p>
          </div>
        
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Restock</p>
            <p className="text-sm font-semibold text-gray-900">{restockLevel}</p>
            <p className="text-xs text-gray-500">{unit}</p>
          </div>
        </div>

        {/* Status Indicator */}
        {(needsReorder || lowStock) && (
          <div className="space-y-2">
            <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  needsReorder ? 'bg-red-500' : lowStock ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${stockPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {needsReorder ? 'Needs Reorder' : lowStock ? 'Low Stock' : 'In Stock'}
              </span>
              <span>
                Stock Level: {stockPercentage.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

interface VendorPricingCardProps {
  vendor: string | null;
  pricelistNumber: string | null;
  currency: string;
  baseCurrency?: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  discountRate: number;
  discountAmount: number;
  taxType: string;
  taxRate: number;
  taxAmount: number;
  isDiscountApplied: boolean;
  isTaxApplied: boolean;
  onDiscountToggle?: (checked: boolean) => void;
  onTaxToggle?: (checked: boolean) => void;
  onCompareClick?: () => void;
  currencyRate?: number;
  showCurrencyConversion?: boolean;
}

// Vendor Information Card
export const VendorCard: React.FC<{
  vendor: string | null;
  pricelistNumber: string | null;
  currency: string;
  baseCurrency?: string;
  unitPrice: number;
  unit: string;
  onCompareClick?: () => void;
  currencyRate?: number;
  showCurrencyConversion?: boolean;
}> = ({
  vendor,
  pricelistNumber,
  currency,
  baseCurrency,
  unitPrice,
  unit,
  onCompareClick,
  currencyRate = 1,
  showCurrencyConversion = false
}) => {
  const formatCurrencyConversion = (amount: number) => {
    if (!showCurrencyConversion || !baseCurrency || currency === baseCurrency) return null;
    const convertedAmount = amount * currencyRate;
    return `${baseCurrency} ${convertedAmount.toFixed(2)}`;
  };

  return (
    <Card className="w-full bg-white shadow-md rounded-xl border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 leading-tight">
            Vendor Information
          </h3>
          {onCompareClick && (
            <Button 
              onClick={onCompareClick}
              variant="ghost"
              size="sm"
              className="text-sm text-green-700 hover:text-blue-800 font-medium"
            >
              Compare
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Vendor</p>
          <p className="text-sm font-semibold text-gray-900">
            {vendor || "Not assigned"}
          </p>
        </div>
        
        <div>
          <p className="text-xs text-gray-500 mb-0.5">Pricelist</p>
          <p className="text-xs font-semibold text-gray-900">
            {pricelistNumber || "Not assigned"}
          </p>
        </div>
        
        {/* Currency and Unit Price on same row */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Currency</p>
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-gray-900">{currency}</p>
              {showCurrencyConversion && baseCurrency && currency !== baseCurrency && (
                <p className="text-xs text-green-700">{baseCurrency}</p>
              )}
            </div>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Unit Price</p>
            <div className="space-y-0.5">
              <p className="text-sm font-semibold text-gray-900">
                {unitPrice.toFixed(2)}
              </p>
              <p className="text-xs text-gray-500">per {unit}</p>
              {formatCurrencyConversion(unitPrice) && (
                <p className="text-xs text-green-700">{formatCurrencyConversion(unitPrice)} per {unit}</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Pricing Details Card
export const PricingCard: React.FC<{
  currency: string;
  baseCurrency?: string;
  unitPrice: number;
  quantity: number;
  unit: string;
  discountRate: number;
  discountAmount: number;
  taxType: string;
  taxRate: number;
  taxAmount: number;
  isDiscountApplied: boolean;
  isTaxApplied: boolean;
  onDiscountToggle?: (checked: boolean) => void;
  onTaxToggle?: (checked: boolean) => void;
  currencyRate?: number;
  showCurrencyConversion?: boolean;
}> = ({
  currency,
  baseCurrency,
  unitPrice,
  quantity,
  unit,
  discountRate,
  discountAmount,
  taxType,
  taxRate,
  taxAmount,
  isDiscountApplied,
  isTaxApplied,
  onDiscountToggle,
  onTaxToggle,
  currencyRate = 1,
  showCurrencyConversion = false
}) => {
  const subtotal = unitPrice * quantity;
  const actualDiscountAmount = isDiscountApplied ? discountAmount : subtotal * discountRate;
  const netAmount = subtotal - actualDiscountAmount;
  const actualTaxAmount = isTaxApplied ? taxAmount : netAmount * taxRate;
  const finalTotal = netAmount + actualTaxAmount;

  const formatCurrencyConversion = (amount: number) => {
    if (!showCurrencyConversion || !baseCurrency || currency === baseCurrency) return null;
    const convertedAmount = amount * currencyRate;
    return `${baseCurrency} ${convertedAmount.toFixed(2)}`;
  };

  return (
    <Card className="w-full bg-white shadow-md rounded-xl border-0">
      <CardHeader className="pb-2">
        <h3 className="text-base font-semibold text-gray-900 leading-tight">
          Pricing Details
        </h3>
      </CardHeader>
      
      <CardContent className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-500">Subtotal</span>
          <div className="text-right">
            <span className="text-sm font-semibold text-gray-900 block">
              {currency} {subtotal.toFixed(2)}
            </span>
            {formatCurrencyConversion(subtotal) && (
              <span className="text-xs text-green-700 block">
                {formatCurrencyConversion(subtotal)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onDiscountToggle && (
              <Checkbox 
                checked={isDiscountApplied}
                onCheckedChange={onDiscountToggle}
                className="w-4 h-4 text-green-700"
              />
            )}
            <span className="text-xs text-gray-700 font-medium">
              Discount {(discountRate * 100).toFixed(0)}%
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-gray-900 block">
              -{currency} {actualDiscountAmount.toFixed(2)}
            </span>
            {formatCurrencyConversion(actualDiscountAmount) && (
              <span className="text-xs text-green-700 block">
                -{formatCurrencyConversion(actualDiscountAmount)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-700 font-medium">Net Amount</span>
          <div className="text-right">
            <span className="text-sm font-semibold text-gray-900 block">
              {currency} {netAmount.toFixed(2)}
            </span>
            {formatCurrencyConversion(netAmount) && (
              <span className="text-xs text-green-700 block">
                {formatCurrencyConversion(netAmount)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {onTaxToggle && (
              <Checkbox 
                checked={isTaxApplied}
                onCheckedChange={onTaxToggle}
                className="w-4 h-4 text-green-700"
              />
            )}
            <span className="text-xs text-gray-700 font-medium">
              Tax ({taxType}) {(taxRate * 100).toFixed(0)}%
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-gray-900 block">
              +{currency} {actualTaxAmount.toFixed(2)}
            </span>
            {formatCurrencyConversion(actualTaxAmount) && (
              <span className="text-xs text-green-700 block">
                +{formatCurrencyConversion(actualTaxAmount)}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-700 font-medium">Total</span>
          <div className="text-right">
            <span className="text-base font-bold text-green-600 block">
              {currency} {finalTotal.toFixed(2)}
            </span>
            {formatCurrencyConversion(finalTotal) && (
              <span className="text-xs text-green-700 block">
                {formatCurrencyConversion(finalTotal)}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const VendorPricingCard: React.FC<VendorPricingCardProps> = ({
  vendor,
  pricelistNumber,
  currency,
  baseCurrency,
  unitPrice,
  quantity,
  unit,
  discountRate,
  discountAmount,
  taxType,
  taxRate,
  taxAmount,
  isDiscountApplied,
  isTaxApplied,
  onDiscountToggle,
  onTaxToggle,
  onCompareClick,
  currencyRate = 1,
  showCurrencyConversion = false
}) => {
  const subtotal = unitPrice * quantity;
  const actualDiscountAmount = isDiscountApplied ? discountAmount : subtotal * discountRate;
  const netAmount = subtotal - actualDiscountAmount;
  const actualTaxAmount = isTaxApplied ? taxAmount : netAmount * taxRate;
  const finalTotal = netAmount + actualTaxAmount;

  const formatCurrencyConversion = (amount: number) => {
    if (!showCurrencyConversion || !baseCurrency || currency === baseCurrency) return null;
    const convertedAmount = amount * currencyRate;
    return `${baseCurrency} ${convertedAmount.toFixed(2)}`;
  };

  return (
    <Card className="w-full bg-white shadow-md rounded-xl border-0">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 leading-tight">
            Vendor & Pricing Information
          </h3>
          {onCompareClick && (
            <button 
              onClick={onCompareClick}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
            >
              Compare
            </button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* First Row - Vendor Information Only */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Vendor</p>
            <p className="text-sm font-semibold text-gray-900">
              {vendor || "Not assigned"}
            </p>
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Pricelist</p>
            <p className="text-xs font-semibold text-gray-900">
              {pricelistNumber || "Not assigned"}
            </p>
          </div>
        </div>

        {/* Second Row - Pricing Details (Horizontal Layout) */}
        <div className="pt-3 border-t border-gray-100">
          <div className="grid grid-cols-6 gap-4">
            {/* Unit Price */}
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Unit Price</p>
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-gray-900">
                  {currency} {unitPrice.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500">per {unit}</p>
                {formatCurrencyConversion(unitPrice) && (
                  <p className="text-xs text-green-700">{formatCurrencyConversion(unitPrice)} per {unit}</p>
                )}
              </div>
            </div>
            
            {/* Subtotal */}
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Subtotal</p>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {subtotal.toFixed(2)}
                </p>
                {formatCurrencyConversion(subtotal) && (
                  <p className="text-xs text-green-700">
                    {formatCurrencyConversion(subtotal)}
                  </p>
                )}
              </div>
            </div>
            
            {/* Discount */}
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 mb-1">
                {onDiscountToggle && (
                  <Checkbox 
                    checked={isDiscountApplied}
                    onCheckedChange={onDiscountToggle}
                    className="w-3 h-3"
                  />
                )}
                <p className="text-xs text-gray-500">Discount {(discountRate * 100).toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {actualDiscountAmount.toFixed(2)}
                </p>
                {formatCurrencyConversion(actualDiscountAmount) && (
                  <p className="text-xs text-green-700">
                    {formatCurrencyConversion(actualDiscountAmount)}
                  </p>
                )}
              </div>
            </div>
            
            {/* Net Amount */}
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Net Amount</p>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {netAmount.toFixed(2)}
                </p>
                {formatCurrencyConversion(netAmount) && (
                  <p className="text-xs text-green-700">
                    {formatCurrencyConversion(netAmount)}
                  </p>
                )}
              </div>
            </div>
            
            {/* Tax */}
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 mb-1">
                {onTaxToggle && (
                  <Checkbox 
                    checked={isTaxApplied}
                    onCheckedChange={onTaxToggle}
                    className="w-3 h-3"
                  />
                )}
                <p className="text-xs text-gray-500">Tax ({taxType}) {(taxRate * 100).toFixed(0)}%</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {actualTaxAmount.toFixed(2)}
                </p>
                {formatCurrencyConversion(actualTaxAmount) && (
                  <p className="text-xs text-green-700">
                    {formatCurrencyConversion(actualTaxAmount)}
                  </p>
                )}
              </div>
            </div>
            
            {/* Total */}
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Total</p>
              <div>
                <p className="text-base font-bold text-green-600">
                  {finalTotal.toFixed(2)}
                </p>
                {formatCurrencyConversion(finalTotal) && (
                  <p className="text-xs text-green-700">
                    {formatCurrencyConversion(finalTotal)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface BusinessDimensionsCardProps {
  jobNumber: string | null;
  event: string | null;
  project: string | null;
  marketSegment: string | null;
  isEditable?: boolean;
  onJobNumberChange?: (value: string) => void;
  onEventChange?: (value: string) => void;
  onProjectChange?: (value: string) => void;
  onMarketSegmentChange?: (value: string) => void;
  jobOptions?: Array<{ value: string; label: string }>;
  eventOptions?: Array<{ value: string; label: string }>;
  projectOptions?: Array<{ value: string; label: string }>;
  marketSegmentOptions?: Array<{ value: string; label: string }>;
}

export const BusinessDimensionsCard: React.FC<BusinessDimensionsCardProps> = ({
  jobNumber,
  event,
  project,
  marketSegment,
  isEditable = false,
  onJobNumberChange,
  onEventChange,
  onProjectChange,
  onMarketSegmentChange,
  jobOptions = [],
  eventOptions = [],
  projectOptions = [],
  marketSegmentOptions = []
}) => {
  return (
    <Card className="w-full bg-white shadow-md rounded-xl border-0">
      <CardHeader className="pb-2">
        <h3 className="text-base font-semibold text-gray-900 leading-tight">
          Business Dimensions
        </h3>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Business Dimensions - 4 columns */}
        <div className="grid grid-cols-4 gap-3">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Job Number</p>
            {isEditable && onJobNumberChange ? (
              <Select value={jobNumber || ""} onValueChange={onJobNumberChange}>
                <SelectTrigger className="h-6 text-xs px-2">
                  <SelectValue placeholder="Select job" />
                </SelectTrigger>
                <SelectContent>
                  {jobOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-xs font-medium text-gray-900">
                {jobNumber || "Not assigned"}
              </p>
            )}
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Event</p>
            {isEditable && onEventChange ? (
              <Select value={event || ""} onValueChange={onEventChange}>
                <SelectTrigger className="h-6 text-xs px-2">
                  <SelectValue placeholder="Select event" />
                </SelectTrigger>
                <SelectContent>
                  {eventOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-xs font-medium text-gray-900">
                {event || "Not assigned"}
              </p>
            )}
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Project</p>
            {isEditable && onProjectChange ? (
              <Select value={project || ""} onValueChange={onProjectChange}>
                <SelectTrigger className="h-6 text-xs px-2">
                  <SelectValue placeholder="Select project" />
                </SelectTrigger>
                <SelectContent>
                  {projectOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-xs font-medium text-gray-900">
                {project || "Not assigned"}
              </p>
            )}
          </div>
          
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Market Segment</p>
            {isEditable && onMarketSegmentChange ? (
              <Select value={marketSegment || ""} onValueChange={onMarketSegmentChange}>
                <SelectTrigger className="h-6 text-xs px-2">
                  <SelectValue placeholder="Select segment" />
                </SelectTrigger>
                <SelectContent>
                  {marketSegmentOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-xs font-medium text-gray-900">
                {marketSegment || "Not assigned"}
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Consolidated Item Details Card
interface ConsolidatedItemDetailsCardProps extends VendorPricingCardProps, InventoryDeliveryCardProps, BusinessDimensionsCardProps {
  showVendorPricing?: boolean;
  showInventoryInfo?: boolean;
  showBusinessDimensions?: boolean;
  // Action handlers
  onEditClick?: () => void;
  onDeleteClick?: () => void;
  onDuplicateClick?: () => void;
  onArchiveClick?: () => void;
  onMoreActions?: () => void;
  showActions?: boolean;
  // Purchaser editing capabilities
  isPurchaserEditable?: boolean;
  onVendorChange?: (vendor: string) => void;
  onCurrencyChange?: (currency: string) => void;
  onCurrencyRateChange?: (rate: number) => void;
  onUnitPriceChange?: (price: number) => void;
  onDiscountRateChange?: (rate: number) => void;
  onDiscountAmountChange?: (amount: number) => void;
  onTaxTypeChange?: (taxType: string) => void;
  onTaxRateChange?: (rate: number) => void;
  onTaxAmountChange?: (amount: number) => void;
  vendorOptions?: Array<{ value: string; label: string }>;
  currencyOptions?: Array<{ value: string; label: string }>;
  taxTypeOptions?: Array<{ value: string; label: string; rate?: number }>;
  // Comment props
  comment?: string;
  onCommentChange?: (comment: string) => void;
}

export const ConsolidatedItemDetailsCard: React.FC<ConsolidatedItemDetailsCardProps> = ({
  // Vendor & Pricing props
  vendor,
  pricelistNumber,
  currency,
  baseCurrency,
  unitPrice,
  quantity,
  unit,
  discountRate,
  discountAmount,
  taxType,
  taxRate,
  taxAmount,
  isDiscountApplied,
  isTaxApplied,
  onDiscountToggle,
  onTaxToggle,
  onCompareClick,
  currencyRate = 1,
  showCurrencyConversion = false,

  // Inventory props
  onHand,
  onOrder,
  reorderLevel,
  restockLevel,
  dateRequired,
  deliveryPoint,
  isEditable = false,
  deliveryPointOptions = [],
  onDateChange,
  onDeliveryPointChange,
  onHandClick,
  onOrderClick,

  // Business Dimensions props
  jobNumber,
  event,
  project,
  marketSegment,
  onJobNumberChange,
  onEventChange,
  onProjectChange,
  onMarketSegmentChange,
  jobOptions = [],
  eventOptions = [],
  projectOptions = [],
  marketSegmentOptions = [],

  // Section visibility props
  showVendorPricing = true,
  showInventoryInfo = true,
  showBusinessDimensions = true,

  // Action handlers
  onEditClick,
  onDeleteClick,
  onDuplicateClick,
  onArchiveClick,
  onMoreActions,
  showActions = true,

  // Purchaser editing capabilities
  isPurchaserEditable = false,
  onVendorChange,
  onCurrencyChange,
  onCurrencyRateChange,
  onUnitPriceChange,
  onDiscountRateChange,
  onDiscountAmountChange,
  onTaxTypeChange,
  onTaxRateChange,
  onTaxAmountChange,
  vendorOptions = [],
  currencyOptions = defaultCurrencyOptions,
  taxTypeOptions = [
    { value: 'VAT', label: 'VAT (7%)', rate: 0.07 },
    { value: 'GST', label: 'GST (10%)', rate: 0.10 },
    { value: 'SST', label: 'SST (6%)', rate: 0.06 },
    { value: 'None', label: 'No Tax (0%)', rate: 0 },
  ],
  // Comment props
  comment,
  onCommentChange,
}) => {
  const [collapsedSections, setCollapsedSections] = React.useState<Set<string>>(new Set());

  const toggleSection = (sectionId: string) => {
    const newCollapsed = new Set(collapsedSections);
    if (newCollapsed.has(sectionId)) {
      newCollapsed.delete(sectionId);
    } else {
      newCollapsed.add(sectionId);
    }
    setCollapsedSections(newCollapsed);
  };

  const subtotal = unitPrice * quantity;
  const actualDiscountAmount = isDiscountApplied ? discountAmount : subtotal * discountRate;
  const netAmount = subtotal - actualDiscountAmount;
  const actualTaxAmount = isTaxApplied ? taxAmount : netAmount * taxRate;
  const finalTotal = netAmount + actualTaxAmount;
  const needsReorder = onHand <= reorderLevel;
  const lowStock = onHand <= restockLevel;
  const stockPercentage = Math.max(20, (onHand / restockLevel) * 100);

  const formatCurrencyConversion = (amount: number) => {
    if (!showCurrencyConversion || !baseCurrency || currency === baseCurrency) return null;
    const convertedAmount = amount * currencyRate;
    return `${baseCurrency} ${convertedAmount.toFixed(2)}`;
  };

  const formattedDate = dateRequired 
    ? typeof dateRequired === 'string' 
      ? dateRequired 
      : format(dateRequired, "dd/MM/yyyy")
    : "Not specified";

  return (
    <Card className="w-full bg-white shadow-sm rounded-lg border-0">
      <CardContent className="pt-4 pb-4 px-4 space-y-4">
        {/* Currency Selection - Always Visible */}
        <div className="flex items-center gap-4 pb-3 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-gray-500 whitespace-nowrap">Currency</Label>
            {onCurrencyChange ? (
              <Select value={currency || baseCurrency} onValueChange={onCurrencyChange}>
                <SelectTrigger className="h-8 w-40 text-xs">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {currencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-sm font-medium text-gray-900">
                {currency || baseCurrency}
                {currency === baseCurrency && <span className="text-xs text-gray-500 ml-1">(Base)</span>}
              </span>
            )}
          </div>
          {showCurrencyConversion && baseCurrency && currency !== baseCurrency && (
            <div className="flex items-center gap-2 text-xs text-green-700">
              <span>Exchange Rate: {currencyRate}</span>
              <span>→ {baseCurrency}</span>
            </div>
          )}
        </div>

        {/* Action Buttons Section */}
        {showActions && (
          <div className="flex items-center justify-end gap-2 pb-3 border-b border-gray-200">
            {onEditClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEditClick}
                className="flex items-center gap-1 text-xs h-8 px-3"
              >
                <Edit className="h-3 w-3" />
                Edit
              </Button>
            )}
            {onDuplicateClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDuplicateClick}
                className="flex items-center gap-1 text-xs h-8 px-3"
              >
                <Copy className="h-3 w-3" />
                Duplicate
              </Button>
            )}
            {onArchiveClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={onArchiveClick}
                className="flex items-center gap-1 text-xs h-8 px-3"
              >
                <Archive className="h-3 w-3" />
                Archive
              </Button>
            )}
            {onDeleteClick && (
              <Button
                variant="outline"
                size="sm"
                onClick={onDeleteClick}
                className="flex items-center gap-1 text-xs h-8 px-3 text-red-600 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </Button>
            )}
            {onMoreActions && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMoreActions}
                className="flex items-center gap-1 text-xs h-8 px-3"
              >
                <MoreHorizontal className="h-3 w-3" />
                More
              </Button>
            )}
          </div>
        )}

        {/* Vendor & Pricing Section */}
        {showVendorPricing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <button
                  onClick={() => toggleSection('vendor-pricing')}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <span className="text-xs">
                    {collapsedSections.has('vendor-pricing') ? '▶' : '▼'}
                  </span>
                  Vendor & Pricing Information
                </button>
              </h4>
              {onCompareClick && (
                <button 
                  onClick={onCompareClick}
                  className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium"
                >
                  Compare
                </button>
              )}
            </div>
            
            {!collapsedSections.has('vendor-pricing') && (
              <div className="space-y-2 pl-3 border-l-2 border-blue-100">
                {/* Vendor Information - Editable for Purchasers */}
                {isPurchaserEditable ? (
                  <div className="space-y-3">
                    {/* Row 1: Vendor Selection */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Vendor</Label>
                        {onVendorChange && vendorOptions.length > 0 ? (
                          <Select value={vendor || ""} onValueChange={onVendorChange}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select vendor" />
                            </SelectTrigger>
                            <SelectContent>
                              {vendorOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-sm font-semibold text-gray-900">
                            {vendor || "Not assigned"}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Pricelist</Label>
                        <p className="text-xs font-semibold text-gray-900">
                          {pricelistNumber || "Not assigned"}
                        </p>
                      </div>
                    </div>

                    {/* Row 2: Currency and Exchange Rate */}
                    <div className="grid grid-cols-4 gap-3 pt-2 border-t border-gray-100">
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Currency</Label>
                        {onCurrencyChange ? (
                          <Select value={currency || "USD"} onValueChange={onCurrencyChange}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Currency" />
                            </SelectTrigger>
                            <SelectContent>
                              {currencyOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-xs font-semibold text-gray-900">{currency}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Exch. Rate</Label>
                        {onCurrencyRateChange ? (
                          <Input
                            type="number"
                            step="0.0001"
                            value={currencyRate}
                            onChange={(e) => onCurrencyRateChange(parseFloat(e.target.value) || 1)}
                            className="h-8 text-xs"
                          />
                        ) : (
                          <p className="text-xs font-semibold text-gray-900">{currencyRate}</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Unit Price</Label>
                        {onUnitPriceChange ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={unitPrice}
                            onChange={(e) => onUnitPriceChange(parseFloat(e.target.value) || 0)}
                            className="h-8 text-xs"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-gray-900">
                            {unitPrice.toFixed(2)}
                          </p>
                        )}
                        <p className="text-xs text-gray-500">per {unit}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Subtotal</Label>
                        <p className="text-sm font-semibold text-gray-900">
                          {currency} {subtotal.toFixed(2)}
                        </p>
                        {formatCurrencyConversion(subtotal) && (
                          <p className="text-xs text-green-700">
                            {formatCurrencyConversion(subtotal)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 3: Tax Profile and Tax */}
                    <div className="grid grid-cols-4 gap-3 pt-2 border-t border-gray-100">
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Tax Profile</Label>
                        {onTaxTypeChange && onTaxRateChange ? (
                          <Select
                            value={taxType || "VAT"}
                            onValueChange={(value) => {
                              onTaxTypeChange(value);
                              // Auto-set tax rate based on selected profile
                              const selectedProfile = taxTypeOptions.find(opt => opt.value === value);
                              if (selectedProfile?.rate !== undefined) {
                                onTaxRateChange(selectedProfile.rate);
                              }
                            }}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Tax Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {taxTypeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <p className="text-xs font-semibold text-gray-900">{taxType}</p>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          {onTaxToggle && (
                            <Checkbox
                              checked={isTaxApplied}
                              onCheckedChange={onTaxToggle}
                              className="w-3 h-3"
                            />
                          )}
                          <Label className="text-xs text-gray-500">Tax Rate</Label>
                        </div>
                        {/* Tax rate is read-only - determined by tax profile */}
                        <p className="text-sm font-semibold text-gray-900 h-8 flex items-center">
                          {(taxRate * 100).toFixed(2)}%
                        </p>
                        <p className="text-xs text-gray-400">From profile</p>
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Tax Amount Override</Label>
                        {onTaxAmountChange ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={taxAmount}
                            onChange={(e) => onTaxAmountChange(parseFloat(e.target.value) || 0)}
                            className="h-8 text-xs"
                            placeholder="Override"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-gray-900">
                            {actualTaxAmount.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Tax (Calculated)</Label>
                        <p className="text-sm font-semibold text-gray-900">
                          {currency} {actualTaxAmount.toFixed(2)}
                        </p>
                        {formatCurrencyConversion(actualTaxAmount) && (
                          <p className="text-xs text-green-700">
                            {formatCurrencyConversion(actualTaxAmount)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Row 4: Discount */}
                    <div className="grid grid-cols-4 gap-3 pt-2 border-t border-gray-100">
                      <div>
                        <div className="flex items-center gap-1 mb-1">
                          {onDiscountToggle && (
                            <Checkbox
                              checked={isDiscountApplied}
                              onCheckedChange={onDiscountToggle}
                              className="w-3 h-3"
                            />
                          )}
                          <Label className="text-xs text-gray-500">Discount Rate %</Label>
                        </div>
                        {onDiscountRateChange ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={(discountRate * 100).toFixed(2)}
                            onChange={(e) => onDiscountRateChange((parseFloat(e.target.value) || 0) / 100)}
                            className="h-8 text-xs"
                          />
                        ) : (
                          <p className="text-xs font-semibold text-gray-900">{(discountRate * 100).toFixed(2)}%</p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Discount Override</Label>
                        {onDiscountAmountChange ? (
                          <Input
                            type="number"
                            step="0.01"
                            value={discountAmount}
                            onChange={(e) => onDiscountAmountChange(parseFloat(e.target.value) || 0)}
                            className="h-8 text-xs"
                            placeholder="Override"
                          />
                        ) : (
                          <p className="text-sm font-semibold text-gray-900">
                            {actualDiscountAmount.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Net Amount</Label>
                        <p className="text-sm font-semibold text-gray-900">
                          {currency} {netAmount.toFixed(2)}
                        </p>
                        {formatCurrencyConversion(netAmount) && (
                          <p className="text-xs text-green-700">
                            {formatCurrencyConversion(netAmount)}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label className="text-xs text-gray-500 mb-1 block">Total</Label>
                        <p className="text-base font-bold text-green-600">
                          {currency} {finalTotal.toFixed(2)}
                        </p>
                        {formatCurrencyConversion(finalTotal) && (
                          <p className="text-xs text-green-700">
                            {formatCurrencyConversion(finalTotal)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Read-only Vendor Information */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Vendor</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {vendor || "Not assigned"}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-gray-500 mb-0.5">Pricelist</p>
                        <p className="text-xs font-semibold text-gray-900">
                          {pricelistNumber || "Not assigned"}
                        </p>
                      </div>
                    </div>

                    {/* Read-only Pricing Details */}
                    <div className="pt-2 border-t border-gray-100">
                      <div className="grid grid-cols-6 gap-4">
                        {/* Unit Price */}
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Unit Price</p>
                          <div className="space-y-0.5">
                            <p className="text-sm font-semibold text-gray-900">
                              {currency} {unitPrice.toFixed(2)}
                            </p>
                            <p className="text-xs text-gray-500">per {unit}</p>
                            {formatCurrencyConversion(unitPrice) && (
                              <p className="text-xs text-green-700">{formatCurrencyConversion(unitPrice)} per {unit}</p>
                            )}
                          </div>
                        </div>

                        {/* Subtotal */}
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Subtotal</p>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {subtotal.toFixed(2)}
                            </p>
                            {formatCurrencyConversion(subtotal) && (
                              <p className="text-xs text-green-700">
                                {formatCurrencyConversion(subtotal)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Discount */}
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1 mb-1">
                            {onDiscountToggle && (
                              <Checkbox
                                checked={isDiscountApplied}
                                onCheckedChange={onDiscountToggle}
                                className="w-3 h-3"
                              />
                            )}
                            <p className="text-xs text-gray-500">Discount {(discountRate * 100).toFixed(0)}%</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {actualDiscountAmount.toFixed(2)}
                            </p>
                            {formatCurrencyConversion(actualDiscountAmount) && (
                              <p className="text-xs text-green-700">
                                {formatCurrencyConversion(actualDiscountAmount)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Net Amount */}
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Net Amount</p>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {netAmount.toFixed(2)}
                            </p>
                            {formatCurrencyConversion(netAmount) && (
                              <p className="text-xs text-green-700">
                                {formatCurrencyConversion(netAmount)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Tax */}
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1 mb-1">
                            {onTaxToggle && (
                              <Checkbox
                                checked={isTaxApplied}
                                onCheckedChange={onTaxToggle}
                                className="w-3 h-3"
                              />
                            )}
                            <p className="text-xs text-gray-500">Tax ({taxType}) {(taxRate * 100).toFixed(0)}%</p>
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {actualTaxAmount.toFixed(2)}
                            </p>
                            {formatCurrencyConversion(actualTaxAmount) && (
                              <p className="text-xs text-green-700">
                                {formatCurrencyConversion(actualTaxAmount)}
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Total */}
                        <div className="text-right">
                          <p className="text-xs text-gray-500 mb-1">Total</p>
                          <div>
                            <p className="text-base font-bold text-green-600">
                              {finalTotal.toFixed(2)}
                            </p>
                            {formatCurrencyConversion(finalTotal) && (
                              <p className="text-xs text-green-700">
                                {formatCurrencyConversion(finalTotal)}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Inventory Information Section */}
        {showInventoryInfo && (
          <div className="space-y-2">
            <div className="pb-2 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <button
                  onClick={() => toggleSection('inventory')}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <span className="text-xs">
                    {collapsedSections.has('inventory') ? '▶' : '▼'}
                  </span>
                  Inventory Information
                </button>
              </h4>
            </div>
            
            {!collapsedSections.has('inventory') && (
              <div className="space-y-2 pl-3 border-l-2 border-green-100">
                {/* Inventory Levels */}
                <div className="grid grid-cols-4 gap-3 text-sm">
                  <div>
                    {onHandClick ? (
                      <>
                        <Button
                          variant="link"
                          size="sm"
                          aria-label="View On Hand breakdown"
                          onClick={onHandClick}
                          className="p-0 h-auto text-blue-600 hover:text-blue-800 hover:underline w-auto justify-start text-xs"
                        >
                          On Hand
                        </Button>
                        <p className="text-sm font-semibold text-gray-900">{onHand}</p>
                        <p className="text-xs text-gray-500">{unit}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-gray-500 mb-0.5">On Hand</p>
                        <p className="text-sm font-semibold text-gray-900">{onHand}</p>
                        <p className="text-xs text-gray-500">{unit}</p>
                      </>
                    )}
                  </div>
                  
                  <div>
                    {onOrderClick ? (
                      <>
                        <Button
                          variant="link"
                          size="sm"
                          aria-label="View On Order details"
                          onClick={onOrderClick}
                          className="p-0 h-auto text-blue-600 hover:text-blue-800 hover:underline w-auto justify-start text-xs"
                        >
                          On Order
                        </Button>
                        <p className="text-sm font-semibold text-gray-900">{onOrder}</p>
                        <p className="text-xs text-gray-500">{unit}</p>
                      </>
                    ) : (
                      <>
                        <p className="text-xs text-gray-500 mb-0.5">On Order</p>
                        <p className="text-sm font-semibold text-gray-900">{onOrder}</p>
                        <p className="text-xs text-gray-500">{unit}</p>
                      </>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Reorder</p>
                    <p className="text-sm font-semibold text-gray-900">{reorderLevel}</p>
                    <p className="text-xs text-gray-500">{unit}</p>
                  </div>
                
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Restock</p>
                    <p className="text-sm font-semibold text-gray-900">{restockLevel}</p>
                    <p className="text-xs text-gray-500">{unit}</p>
                  </div>
                </div>

                {/* Status Indicator */}
                {(needsReorder || lowStock) && (
                  <div className="space-y-2">
                    <div className="flex h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className={`transition-all duration-300 ease-in-out ${
                          needsReorder ? 'bg-red-500' : lowStock ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${stockPercentage}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>
                        {needsReorder ? 'Needs Reorder' : lowStock ? 'Low Stock' : 'In Stock'}
                      </span>
                      <span>
                        Stock Level: {stockPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Business Dimensions Section */}
        {showBusinessDimensions && (
          <div className="space-y-2">
            <div className="pb-2 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <button
                  onClick={() => toggleSection('business')}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <span className="text-xs">
                    {collapsedSections.has('business') ? '▶' : '▼'}
                  </span>
                  Business Dimensions
                </button>
              </h4>
            </div>
            
            {!collapsedSections.has('business') && (
              <div className="space-y-2 pl-3 border-l-2 border-purple-100">
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Job Number</p>
                    {isEditable && onJobNumberChange ? (
                      <Select value={jobNumber || ""} onValueChange={onJobNumberChange}>
                        <SelectTrigger className="h-6 text-xs px-2">
                          <SelectValue placeholder="Select job" />
                        </SelectTrigger>
                        <SelectContent>
                          {jobOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-xs font-medium text-gray-900">
                        {jobNumber || "Not assigned"}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Event</p>
                    {isEditable && onEventChange ? (
                      <Select value={event || ""} onValueChange={onEventChange}>
                        <SelectTrigger className="h-6 text-xs px-2">
                          <SelectValue placeholder="Select event" />
                        </SelectTrigger>
                        <SelectContent>
                          {eventOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-xs font-medium text-gray-900">
                        {event || "Not assigned"}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Project</p>
                    {isEditable && onProjectChange ? (
                      <Select value={project || ""} onValueChange={onProjectChange}>
                        <SelectTrigger className="h-6 text-xs px-2">
                          <SelectValue placeholder="Select project" />
                        </SelectTrigger>
                        <SelectContent>
                          {projectOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-xs font-medium text-gray-900">
                        {project || "Not assigned"}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Market Segment</p>
                    {isEditable && onMarketSegmentChange ? (
                      <Select value={marketSegment || ""} onValueChange={onMarketSegmentChange}>
                        <SelectTrigger className="h-6 text-xs px-2">
                          <SelectValue placeholder="Select segment" />
                        </SelectTrigger>
                        <SelectContent>
                          {marketSegmentOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <p className="text-xs font-medium text-gray-900">
                        {marketSegment || "Not assigned"}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Comment Section */}
        {(comment !== undefined || onCommentChange) && (
          <div className="space-y-2">
            <div className="pb-2 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                <button
                  onClick={() => toggleSection('comment')}
                  className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                >
                  <span className="text-xs">
                    {collapsedSections.has('comment') ? '▶' : '▼'}
                  </span>
                  Comment
                </button>
              </h4>
            </div>

            {!collapsedSections.has('comment') && (
              <div className="pl-3 border-l-2 border-amber-100">
                {onCommentChange ? (
                  <Textarea
                    value={comment || ""}
                    onChange={(e) => onCommentChange(e.target.value)}
                    placeholder="Add a comment..."
                    className="min-h-[60px] text-xs resize-none bg-white"
                    rows={2}
                  />
                ) : (
                  <div className="bg-gray-50 p-2 rounded border border-gray-200 min-h-[32px]">
                    <p className="text-xs text-gray-700 leading-tight whitespace-pre-wrap">
                      {comment || "No comment"}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};