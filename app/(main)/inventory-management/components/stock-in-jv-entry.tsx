import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

const DetailedJournalEntries = () => {
  const transaction = {
    id: 1,
    date: '2024-01-15',
    refNo: 'STK-IN-2410-001',
    type: 'Good Receive Note',
    relatedDoc: 'GRN-2410-001',
    items: [
      {
        id: 1,
        store: 'FB - Restaurant - Main Kitchen',
        itemCode: '10000002',
        description: 'Coffee mate 450 g.',
        unit: 'Bag',
        qty: 50,
        unitCost: 125.00,
        category: 'Food',
        subCategory: 'Beverages',
      },
      {
        id: 2,
        store: 'FB - Bar - Pool Bar',
        itemCode: '10000003',
        description: 'Heineken Beer 330ml',
        unit: 'Bottle',
        qty: 120,
        unitCost: 85.00,
        category: 'Beverage',
        subCategory: 'Alcoholic',
      },
      {
        id: 3,
        store: 'HK - Housekeeping - Supplies',
        itemCode: '10000004',
        description: 'Bath Towel Premium White 70x140cm',
        unit: 'Piece',
        qty: 200,
        unitCost: 450.00,
        category: 'Housekeeping',
        subCategory: 'Linen',
      },
      {
        id: 4,
        store: 'FB - Restaurant - Banquet',
        itemCode: '10000005',
        description: 'Wine Glass Crystal 350ml',
        unit: 'Piece',
        qty: 100,
        unitCost: 320.00,
        category: 'F&B',
        subCategory: 'Glassware',
      },
      {
        id: 5,
        store: 'FB - Kitchen - Pastry',
        itemCode: '10000006',
        description: 'Vanilla Extract Premium 1L',
        unit: 'Bottle',
        qty: 30,
        unitCost: 850.00,
        category: 'Food',
        subCategory: 'Baking',
      }
    ]
  };

  // Calculate total value
  const totalValue = transaction.items.reduce((sum, item) => sum + (item.qty * item.unitCost), 0);

  // Generate journal entries
  const journalEntries = [
    // Debit Inventory
    {
      accountCode: '1140',
      accountName: 'Inventory',
      department: 'Inventory Control',
      debit: totalValue,
      credit: 0,
      description: 'Inventory receipt - GRN-2410-001',
      items: transaction.items
    },
    // Credit Accounts Payable
    {
      accountCode: '2100',
      accountName: 'Accounts Payable',
      department: 'Finance',
      debit: 0,
      credit: totalValue,
      description: 'Supplier payable - Thai Beverage Co.',
      items: []
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header Information */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex justify-between items-start">
            <div>
              <CardTitle>Journal Entry Details</CardTitle>
              <p className="text-sm text-gray-500 mt-1">
                Reference: {transaction.refNo} | Document: {transaction.relatedDoc}
              </p>
            </div>
            <Button variant="outline" size="sm">
              Export Journal
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Transaction Total Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col">
            <span className="text-lg font-medium">Total Transaction Value</span>
            <span className="text-3xl font-bold mt-2">{totalValue.toFixed(2)}</span>
            <div className="mt-2 text-sm text-gray-500">
              Total Items: {transaction.items.length}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journal Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Journal Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Debit</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Credit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {journalEntries.map((entry, index) => (
                  <React.Fragment key={index}>
                    <tr className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {entry.accountCode}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.accountName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {entry.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {entry.debit > 0 ? entry.debit.toFixed(2) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {entry.credit > 0 ? entry.credit.toFixed(2) : '-'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {entry.description}
                      </td>
                    </tr>
                    {entry.items.length > 0 && (
                      <tr className="bg-gray-50">
                        <td  className=" col-span-6 px-6 py-2">
                          <div className="text-xs text-gray-500">
                            <div className="grid grid-cols-4 gap-4">
                              {entry.items.map((item, idx) => (
                                <div key={idx} className="border-l pl-2">
                                  <div className="font-medium">{item.description}</div>
                                  <div className="flex justify-between mt-1">
                                    <span>{item.qty} {item.unit} × {item.unitCost.toFixed(2)}</span>
                                    <span className="font-medium">{(item.qty * item.unitCost).toFixed(2)}</span>
                                  </div>
                                  <div className="text-gray-400 mt-1">
                                    Store: {item.store}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
                <tr className="bg-gray-100 font-medium">
                  <td className="col-span-3 px-6 py-4 text-sm text-right">Total</td>
                  <td className="px-6 py-4 text-sm text-right">{totalValue.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-right">{totalValue.toFixed(2)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Alert>
        <AlertDescription>
          Stock In transactions are recorded under the Inventory Control department.
          All items are debited to the Inventory account regardless of their destination store.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default DetailedJournalEntries;