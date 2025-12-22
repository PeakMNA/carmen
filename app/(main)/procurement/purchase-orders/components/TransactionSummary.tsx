import { useState } from "react";
import { PurchaseOrder } from "@/lib/types";
import { DollarSign, Percent, FileText, Receipt, TrendingUp } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import type { CheckedState } from "@radix-ui/react-checkbox";

interface TransactionSummaryProps {
  poData: PurchaseOrder;
  isEditing?: boolean;
  baseCurrency?: string;
  exchangeRate?: number;
}

export default function TransactionSummary({
  poData,
  isEditing = false,
  baseCurrency = 'THB',
  exchangeRate = 1
}: TransactionSummaryProps) {
  // State for override checkboxes
  const [discountOverride, setDiscountOverride] = useState(false);
  const [taxOverride, setTaxOverride] = useState(false);

  // Helper function to extract numeric value from Money object or number
  const getNumericValue = (value: any): number => {
    if (typeof value === 'number') return value;
    if (value && typeof value === 'object' && 'amount' in value) return value.amount;
    return 0;
  };

  // Calculate values - handle both Money objects and direct numbers
  const subtotal = getNumericValue((poData as any).subtotal);
  const discount = getNumericValue((poData as any).discountAmount);
  const netAmount = subtotal - discount;
  const tax = getNumericValue((poData as any).taxAmount);
  const totalAmount = getNumericValue((poData as any).totalAmount);

  // Base currency values - use stored values or calculate from exchange rate
  const baseSubtotal = getNumericValue((poData as any).baseSubTotalPrice) || subtotal * exchangeRate;
  const baseDiscount = getNumericValue((poData as any).baseDiscAmount) || discount * exchangeRate;
  const baseNetAmount = baseSubtotal - baseDiscount;
  const baseTax = getNumericValue((poData as any).baseTaxAmount) || tax * exchangeRate;
  const baseTotalAmount = getNumericValue((poData as any).baseTotalAmount) || totalAmount * exchangeRate;

  const currency = (poData as any).currency || 'USD';

  // Only show base currency conversion when transaction currency differs from base
  const showBaseConversion = currency !== baseCurrency;

  const summaryItems = [
    {
      label: "Subtotal",
      value: subtotal,
      baseValue: baseSubtotal,
      icon: DollarSign,
      borderColor: "border-l-blue-400",
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      hasOverride: false
    },
    {
      label: "Discount",
      value: discount,
      baseValue: baseDiscount,
      icon: Percent,
      borderColor: "border-l-green-400",
      iconColor: "text-green-500",
      bgColor: "bg-green-50",
      hasOverride: true,
      overrideChecked: discountOverride,
      onOverrideChange: (checked: CheckedState) => setDiscountOverride(checked === true)
    },
    {
      label: "Net Amount",
      value: netAmount,
      baseValue: baseNetAmount,
      icon: FileText,
      borderColor: "border-l-blue-400",
      iconColor: "text-blue-500",
      bgColor: "bg-blue-50",
      hasOverride: false
    },
    {
      label: "Tax",
      value: tax,
      baseValue: baseTax,
      icon: FileText,
      borderColor: "border-l-orange-400",
      iconColor: "text-orange-500",
      bgColor: "bg-orange-50",
      hasOverride: true,
      overrideChecked: taxOverride,
      onOverrideChange: (checked: CheckedState) => setTaxOverride(checked === true)
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Title */}
      <h3 className="text-sm sm:text-lg lg:text-xl font-semibold text-black">
        Transaction Summary ({currency})
      </h3>
      
      {/* Summary Cards Row - Responsive Layout */}
      <div className="bg-gray-50 rounded-lg p-2 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 lg:gap-6">
          {/* Subtotal */}
          <div className="flex flex-col items-center text-center border-l-4 border-l-blue-500 bg-white rounded-lg p-2 sm:p-3 lg:p-4 shadow-sm">
            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
              <span className="text-xs sm:text-sm text-gray-600">Subtotal</span>
            </div>
            <div className="text-sm sm:text-lg lg:text-2xl font-bold text-black">
              {subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {showBaseConversion && (
              <div className="text-xs text-muted-foreground">
                {baseCurrency} {baseSubtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
          </div>

          {/* Discount */}
          <div className="flex flex-col items-center text-center border-l-4 border-l-green-500 bg-white rounded-lg p-2 sm:p-3 lg:p-4 shadow-sm">
            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <Percent className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              <span className="text-xs sm:text-sm text-gray-600">Discount</span>
            </div>
            <div className="text-sm sm:text-lg lg:text-2xl font-bold text-green-600">
              {discount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {showBaseConversion && (
              <div className="text-xs text-muted-foreground">
                {baseCurrency} {baseDiscount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
          </div>

          {/* Net Amount */}
          <div className="flex flex-col items-center text-center border-l-4 border-l-blue-500 bg-white rounded-lg p-2 sm:p-3 lg:p-4 shadow-sm">
            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <FileText className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
              <span className="text-xs sm:text-sm text-gray-600">Net Amount</span>
            </div>
            <div className="text-sm sm:text-lg lg:text-2xl font-bold text-blue-600">
              {netAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {showBaseConversion && (
              <div className="text-xs text-muted-foreground">
                {baseCurrency} {baseNetAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
          </div>

          {/* Tax */}
          <div className="flex flex-col items-center text-center border-l-4 border-l-orange-500 bg-white rounded-lg p-2 sm:p-3 lg:p-4 shadow-sm">
            <div className="flex items-center gap-1 sm:gap-2 mb-1 sm:mb-2">
              <Receipt className="h-3 w-3 sm:h-4 sm:w-4 text-orange-500" />
              <span className="text-xs sm:text-sm text-gray-600">Tax</span>
            </div>
            <div className="text-sm sm:text-lg lg:text-2xl font-bold text-orange-600">
              {tax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            {showBaseConversion && (
              <div className="text-xs text-muted-foreground">
                {baseCurrency} {baseTax.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Total Amount Card - Responsive Layout */}
      <div className="bg-blue-50 border-l-4 border-l-blue-600 rounded-lg p-3 sm:p-4 lg:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="bg-blue-500 rounded-full p-1.5 sm:p-2 lg:p-2.5 flex-shrink-0">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 text-white" />
            </div>
            <div>
              <div className="text-sm sm:text-base lg:text-lg font-semibold text-black">Total Amount</div>
              <div className="text-xs sm:text-sm text-gray-600">Final amount including all charges</div>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <div className="text-lg sm:text-xl lg:text-3xl font-bold text-blue-600">
              {totalAmount.toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
              })}
            </div>
            {showBaseConversion && (
              <div className="text-xs sm:text-sm text-muted-foreground">
                {baseCurrency} {baseTotalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}