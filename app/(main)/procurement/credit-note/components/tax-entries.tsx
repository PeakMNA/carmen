import React, { useState } from 'react';
import { Calculator, ChevronDown, AlertCircle, FileText } from 'lucide-react';

// Number formatting function
const formatNumber = (number: number, decimals = 2) => {
  return number.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
};

// Mock tax data
const taxData = {
  documentInfo: {
    creditNote: 'CN-2410-001',
    taxInvoice: 'TAX-2410-001',
    date: '2024-10-23',
    vendor: {
      name: 'ABC Suppliers',
      taxId: 'TAX123456789'
    }
  },
  
  calculations: {
    baseAmount: 4000.00,
    taxRate: 18,
    taxAmount: 720.00,
    originalBase: 50000.00,
    originalTax: 9000.00
  },

  adjustments: [
    {
      type: 'Input VAT',
      code: 'VAT18',
      description: 'Standard Rate VAT',
      baseAmount: 4000.00,
      rate: 18,
      taxAmount: 720.00,
      account: '1240'
    }
  ],

  vatPeriod: {
    period: 'October 2024',
    returnStatus: 'Open',
    dueDate: '2024-11-15',
    reportingCode: 'BOX4'
  }
};

export default function TaxImpact() {
  const [expandedSections, setExpandedSections] = useState(['calculations']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-medium text-gray-900">Tax Adjustments</h2>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-500">Tax Invoice: {taxData.documentInfo.taxInvoice}</span>
            <span className="text-sm text-gray-500">CN: {taxData.documentInfo.creditNote}</span>
          </div>
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-3 gap-6">
          {/* Base Amount Impact */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-900">Base Amount Impact</h3>
            <div className="mt-2">
              <div className="text-2xl font-semibold text-blue-700">
                -{formatNumber(taxData.calculations.baseAmount)}
              </div>
              <div className="text-sm text-blue-600 mt-1">
                Original: {formatNumber(taxData.calculations.originalBase)}
              </div>
            </div>
          </div>

          {/* Tax Rate */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900">Tax Rate</h3>
            <div className="mt-2">
              <div className="text-2xl font-semibold text-green-700">
                {taxData.calculations.taxRate}%
              </div>
              <div className="text-sm text-green-600 mt-1">
                Standard Rate VAT
              </div>
            </div>
          </div>

          {/* Tax Amount Impact */}
          <div className="bg-amber-50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-amber-900">Tax Amount Impact</h3>
            <div className="mt-2">
              <div className="text-2xl font-semibold text-amber-700">
                -{formatNumber(taxData.calculations.taxAmount)}
              </div>
              <div className="text-sm text-amber-600 mt-1">
                Original: {formatNumber(taxData.calculations.originalTax)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tax Calculations */}
      <div className="border-b">
        <div
          className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer"
          onClick={() => toggleSection('calculations')}
        >
          <h3 className="text-sm font-medium text-gray-900">Tax Calculations</h3>
          <ChevronDown 
            className={`w-5 h-5 text-gray-400 transform transition-transform ${
              expandedSections.includes('calculations') ? 'rotate-180' : ''
            }`}
          />
        </div>
        
        {expandedSections.includes('calculations') && (
          <div className="p-4">
            <div className="space-y-4">
              {/* Original Values */}
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="text-xs font-medium text-gray-700 mb-2">Original Transaction</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Base Amount</div>
                    <div className="text-sm font-medium">
                      {formatNumber(taxData.calculations.originalBase)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Tax Rate</div>
                    <div className="text-sm font-medium">{taxData.calculations.taxRate}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Tax Amount</div>
                    <div className="text-sm font-medium">
                      {formatNumber(taxData.calculations.originalTax)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Credit Note Values */}
              <div className="bg-blue-50 p-3 rounded-lg">
                <h4 className="text-xs font-medium text-blue-900 mb-2">Credit Note Adjustment</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-blue-700">Base Amount</div>
                    <div className="text-sm font-medium">
                      -{formatNumber(taxData.calculations.baseAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-700">Tax Rate</div>
                    <div className="text-sm font-medium">{taxData.calculations.taxRate}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-700">Tax Amount</div>
                    <div className="text-sm font-medium">
                      -{formatNumber(taxData.calculations.taxAmount)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Journal Entries */}
      <div className="border-b">
        <div className="p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900">Tax Journal Entries</h3>
        </div>
        <div className="p-4">
          <table className="w-full">
            <thead>
              <tr className="text-xs text-gray-500 uppercase">
                <th className="text-left py-2">Account</th>
                <th className="text-left py-2">Description</th>
                <th className="text-right py-2">Debit</th>
                <th className="text-right py-2">Credit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {taxData.adjustments.map((adj, index) => (
                <tr key={index}>
                  <td className="py-2">
                    <div className="text-sm font-medium text-gray-900">{adj.type}</div>
                    <div className="text-xs text-gray-500">{adj.account}</div>
                  </td>
                  <td className="py-2 text-sm text-gray-500">{adj.description}</td>
                  <td className="py-2 text-sm text-right"></td>
                  <td className="py-2 text-sm text-right">{formatNumber(adj.taxAmount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VAT Period Impact */}
      <div className="border-b">
        <div className="p-4 bg-gray-50">
          <h3 className="text-sm font-medium text-gray-900">VAT Period Impact</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-4 gap-6">
            <div>
              <label className="text-sm text-gray-500">Period</label>
              <div className="mt-1 text-sm font-medium">{taxData.vatPeriod.period}</div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Due Date</label>
              <div className="mt-1 text-sm font-medium">{taxData.vatPeriod.dueDate}</div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Return Box</label>
              <div className="mt-1 text-sm font-medium">{taxData.vatPeriod.reportingCode}</div>
            </div>
            <div>
              <label className="text-sm text-gray-500">Status</label>
              <div className="mt-1">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  taxData.vatPeriod.returnStatus === 'Open' 
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {taxData.vatPeriod.returnStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 bg-gray-50 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <FileText className="w-5 h-5 text-gray-400" />
          <span className="text-sm text-gray-600">Tax ID: {taxData.documentInfo.vendor.taxId}</span>
        </div>
        <div className="space-x-4">
          <button className="text-sm text-blue-600 hover:text-blue-700">
            View Tax Report
          </button>
        </div>
      </div>
    </div>
  );
}