import React, { useState } from 'react';
import { Building, Calculator, AlertCircle, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button'

// Mock data for journal entries
const mockEntries = [
  {
    group: 'Primary Entries',
    description: 'Main credit note adjustments',
    entries: [
      {
        account: { code: '2100', name: 'Accounts Payable' },
        department: { code: 'PUR', name: 'Purchasing' },
        costCenter: 'CC001',
        description: 'CN Vendor Adjustment',
        reference: 'CN-2410-001',
        debit: 4720.00,
        orderNo: 1
      },
      {
        account: { code: '1140', name: 'Inventory - Raw Materials' },
        department: { code: 'WHS', name: 'Warehouse' },
        costCenter: 'CC002',
        description: 'Inventory Value Adjustment',
        reference: 'GRN-2410-001',
        credit: 4000.00,
        orderNo: 2
      },
      {
        account: { code: '1240', name: 'Input VAT' },
        department: { code: 'ACC', name: 'Accounting' },
        costCenter: 'CC003',
        description: 'Tax Adjustment',
        reference: 'CN-2410-001',
        credit: 720.00,
        tax: { code: 'VAT', rate: 18 },
        orderNo: 3
      }
    ]
  },
  {
    group: 'Inventory Entries',
    description: 'Stock value and cost adjustments',
    entries: [
      {
        account: { code: '1145', name: 'Inventory Cost Variance' },
        department: { code: 'WHS', name: 'Warehouse' },
        costCenter: 'CC002',
        description: 'Cost Variance Recording',
        reference: 'GRN-2410-001',
        debit: 4000.00,
        orderNo: 4
      },
      {
        account: { code: '1140', name: 'Inventory - Raw Materials' },
        department: { code: 'WHS', name: 'Warehouse' },
        costCenter: 'CC002',
        description: 'Cost Adjustment',
        reference: 'GRN-2410-001',
        credit: 4000.00,
        orderNo: 5
      }
    ]
  }
];

export default function JournalEntries() {
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [expandedGroups, setExpandedGroups] = useState(['Primary Entries', 'Inventory Entries']);

  const toggleGroup = (group: string) => {
    setExpandedGroups(prev =>
      prev.includes(group)
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  // Calculate group totals
  const calculateGroupTotals = (entries: any[]) => {
    return entries.reduce((acc, entry) => ({
      debit: acc.debit + (entry.debit || 0),
      credit: acc.credit + (entry.credit || 0)
    }), { debit: 0, credit: 0 });
  };

  // Calculate grand totals
  const calculateTotals = () => {
    return mockEntries.reduce((acc, group) => {
      const groupTotals = calculateGroupTotals(group.entries);
      return {
        debit: acc.debit + groupTotals.debit,
        credit: acc.credit + groupTotals.credit
      };
    }, { debit: 0, credit: 0 });
  };

  const totals = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium">Journal Entries</h2>
          <div className="px-2 py-1 text-sm text-blue-600 bg-blue-50 rounded-full">
            CN-2410-001
          </div>
        </div>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          <Calculator className="h-4 w-4" />
          Recalculate
        </Button>
      </div>

      {/* Header Details */}
      <div className="grid grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
        <div>
          <div className="text-sm text-gray-500">Document Type</div>
          <div className="font-medium">Credit Note</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Transaction Date</div>
          <div className="font-medium">2024-03-15</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Journal Status</div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="font-medium">Posted</span>
          </div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Journal Reference</div>
          <div className="font-medium">CN-2410-001</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Source</div>
          <div className="font-medium">CN</div>
        </div>
        <div>
          <div className="text-sm text-gray-500">Description</div>
          <div className="font-medium">Credit Note Adjustment</div>
        </div>
      </div>

      {/* Department Filter */}
      <div className="p-4 bg-gray-50 border-b">
        <div className="flex items-center space-x-4">
          <Building className="w-5 h-5 text-gray-400" />
          <select
            className="text-sm border-gray-300 rounded-md"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="ALL">All Locations</option>
            <option value="PUR">Purchasing</option>
            <option value="WHS">Warehouse</option>
            <option value="ACC">Accounting</option>
          </select>
        </div>
      </div>

      {/* Entry Groups */}
      <div className="divide-y divide-gray-200">
        {mockEntries.map((group) => {
          const groupTotals = calculateGroupTotals(group.entries);
          const filteredEntries = group.entries.filter(entry =>
            selectedDepartment === 'ALL' || entry.department.code === selectedDepartment
          );

          if (filteredEntries.length === 0) return null;

          return (
            <div key={group.group} className="border-b last:border-b-0">
              {/* Group Header */}
              <div
                className="p-4 bg-gray-50 flex justify-between items-center cursor-pointer"
                onClick={() => toggleGroup(group.group)}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-medium text-gray-900">{group.group}</h3>
                    <span className="text-xs text-gray-500">{filteredEntries.length} entries</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    Dr: {groupTotals.debit.toFixed(2)} / Cr: {groupTotals.credit.toFixed(2)}
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-gray-400 transform transition-transform ${
                      expandedGroups.includes(group.group) ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Group Entries */}
              {expandedGroups.includes(group.group) && (
                <div className="p-4">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-gray-500 uppercase">
                        <th className="py-2 text-left">#</th>
                        <th className="py-2 text-left">Account</th>
                        <th className="py-2 text-left">Department</th>
                        <th className="py-2 text-left">Description</th>
                        <th className="py-2 text-right">Debit</th>
                        <th className="py-2 text-right">Credit</th>
                        <th className="py-2 text-left">Reference</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {filteredEntries.map((entry) => (
                        <tr key={entry.orderNo} className="hover:bg-gray-50">
                          <td className="py-2 text-sm text-gray-500">
                            {entry.orderNo}
                          </td>
                          <td className="py-2">
                            <div className="text-sm font-medium text-gray-900">
                              {entry.account.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {entry.account.code}
                            </div>
                          </td>
                          <td className="py-2">
                            <div className="text-sm font-medium text-gray-900">
                              {entry.department.code}
                            </div>
                            <div className="text-xs text-gray-500">
                              CC: {entry.costCenter}
                            </div>
                          </td>
                          <td className="py-2">
                            <div className="text-sm text-gray-900">
                              {entry.description}
                            </div>
                            {entry.tax && (
                              <div className="text-xs text-gray-500">
                                Tax: {entry.tax.code} ({entry.tax.rate}%)
                              </div>
                            )}
                          </td>
                          <td className="py-2 text-sm text-right">
                            {entry.debit?.toFixed(2)}
                          </td>
                          <td className="py-2 text-sm text-right">
                            {entry.credit?.toFixed(2)}
                          </td>
                          <td className="py-2 text-sm text-gray-500">
                            {entry.reference}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Totals and Validation */}
      <div className="border-t">
        {/* Totals */}
        <div className="p-4 bg-gray-50">
          <div className="flex justify-between items-center">
            <div className="grid grid-cols-3 gap-8">
              <div>
                <span className="text-sm text-gray-500">Total Debit</span>
                <div className="mt-1 text-lg font-medium text-gray-900">
                  ${totals.debit.toFixed(2)}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Total Credit</span>
                <div className="mt-1 text-lg font-medium text-gray-900">
                  ${totals.credit.toFixed(2)}
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">Difference</span>
                <div className="mt-1 text-lg font-medium text-gray-900">
                  ${(totals.debit - totals.credit).toFixed(2)}
                </div>
              </div>
            </div>
            <div>
              {totals.debit === totals.credit ? (
                <div className="flex items-center text-green-700 bg-green-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <span className="text-sm font-medium">Balanced</span>
                </div>
              ) : (
                <div className="flex items-center text-red-700 bg-red-50 px-3 py-1 rounded-full">
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-2" />
                  <span className="text-sm font-medium">Unbalanced</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Validation Messages */}
        <div className="p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-gray-900">Validation Status</h4>
              <div className="mt-2 space-y-2">
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <span className="text-gray-600">All required accounts are present</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <span className="text-gray-600">Department codes are valid</span>
                </div>
                <div className="flex items-center text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                  <span className="text-gray-600">References properly linked</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}