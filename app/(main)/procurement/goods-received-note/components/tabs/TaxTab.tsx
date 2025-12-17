import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {  } from "@/lib/types";
import { GRNDetailMode } from "../GoodsReceiveNoteDetail";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface TaxTabProps {
  mode: GRNDetailMode;
  taxInvoiceNumber?: string;
  taxInvoiceDate?: Date | undefined;
  taxStatus?: string;
  taxPeriod?: string;
  onTaxInvoiceChange: (field: string, value: string | Date) => void;
  documentTotals: {
    currency: {
      netAmount: number;
      taxAmount: number;
      totalAmount: number;
    };
    baseCurrency: {
      netAmount: number;
      taxAmount: number;
      totalAmount: number;
    };
  };
  currency: string;
  baseCurrency: string;
}

export function TaxTab({
  mode,
  taxInvoiceNumber,
  taxInvoiceDate,
  taxStatus,
  taxPeriod,
  onTaxInvoiceChange,
  documentTotals,
  currency,
  baseCurrency,
}: TaxTabProps) {
  const isEditable = mode === 'edit' || mode === 'add';

  const data = [
    {
      label: "Goods Receipt Value",
      baseAmount: documentTotals.baseCurrency.netAmount,
      taxRate: "7%",
      taxAmount: documentTotals.baseCurrency.taxAmount,
      type: "Standard Rate VAT"
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="tax-invoice">Vendor Tax Invoice#</Label>
          <Input
            id="tax-invoice"
            value={taxInvoiceNumber}
            onChange={(e) => onTaxInvoiceChange('taxInvoiceNumber', e.target.value)}
            readOnly={!isEditable}
            className="h-8"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax-invoice-date">Tax Invoice Date</Label>
          <Input
            id="tax-invoice-date"
            type="date"
            value={taxInvoiceDate ? taxInvoiceDate.toISOString().split('T')[0] : ''}
            onChange={(e) => onTaxInvoiceChange('taxInvoiceDate', new Date(e.target.value))}
            readOnly={!isEditable}
            className="h-8"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax-status">Tax Status</Label>
          <Select
            disabled={!isEditable}
            value={taxStatus}
            onValueChange={(value) => onTaxInvoiceChange('taxStatus', value)}
          >
            <SelectTrigger id="tax-status" className="h-8">
              <SelectValue placeholder="Select tax status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
              <SelectItem value="exempt">Tax Exempt</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="tax-period">VAT Period</Label>
          <Input
            id="tax-period"
            value={taxPeriod}
            onChange={(e) => onTaxInvoiceChange('taxPeriod', e.target.value)}
            readOnly={!isEditable}
            placeholder="e.g., Oct 2024"
            className="h-8"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-8">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Base Amount</h3>
          <div className="text-xl font-semibold">{documentTotals.baseCurrency.netAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-sm text-gray-600">{baseCurrency}</div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Tax Rate</h3>
          <div className="text-xl font-semibold">7%</div>
          <div className="text-sm text-gray-600">Standard Rate VAT</div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-medium mb-2">Tax Amount</h3>
          <div className="text-xl font-semibold">{documentTotals.baseCurrency.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
          <div className="text-sm text-gray-600">{baseCurrency}</div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="font-medium mb-4">Tax Calculation Details</h3>
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-medium">Description</TableHead>
              <TableHead className="font-medium text-right">Base Amount</TableHead>
              <TableHead className="font-medium text-center">Tax Rate</TableHead>
              <TableHead className="font-medium text-right">Tax Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.label}>
                <TableCell>
                  <div>{item.label}</div>
                  <div className="text-sm text-gray-500">{item.type}</div>
                </TableCell>
                <TableCell className="text-right">{item.baseAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell className="text-center">{item.taxRate}</TableCell>
                <TableCell className="text-right">{item.taxAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-8">
        <h3 className="font-medium mb-4">VAT Return Details</h3>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <Label>Filing Period</Label>
            <div className="font-medium">October 2024</div>
          </div>
          <div>
            <Label>Filing Due Date</Label>
            <div className="font-medium">2024-11-15</div>
          </div>
          <div>
            <Label>VAT Return Box</Label>
            <div className="font-medium">Box 1</div>
          </div>
          <div>
            <Label>Filing Status</Label>
            <div className="text-amber-600 font-medium">Pending</div>
          </div>
        </div>
      </div>

      <div className="mt-4 flex justify-between items-center text-sm text-gray-600 border-t pt-4">
        <div>Document Reference: GRN-2410-001</div>
        <div className="text-blue-600 cursor-pointer hover:underline">View VAT Report</div>
      </div>
    </div>
  );
}
