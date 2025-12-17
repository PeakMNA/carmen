/**
 * Stock Movement Component for Credit Notes
 *
 * Displays stock movements (reversals) from credit note processing with
 * location-aware handling.
 *
 * LOCATION TYPE HANDLING FOR CREDIT NOTES:
 *
 * - INVENTORY (INV): Standard credit note processing
 *   → Reverses FIFO cost layer based on original GRN lots
 *   → Reduces inventory asset balance
 *   → Stock movement recorded (negative quantities)
 *   → GL: Debit AP, Credit Inventory Asset
 *
 * - DIRECT (DIR): Direct expense reversal
 *   → NO stock adjustment (items were already expensed)
 *   → Items filtered out from stock movement display
 *   → GL: Debit AP, Credit Expense Account
 *   → Only expense reversal, no inventory impact
 *
 * - CONSIGNMENT (CON): Vendor liability adjustment
 *   → Reduces consignment stock balance
 *   → Updates vendor liability tracking
 *   → Stock movement recorded (negative quantities)
 *   → GL: Debit Vendor Liability, Credit Consignment Asset
 *
 * Credit notes show negative quantities as they represent returns/reversals
 * of previously received inventory.
 */

'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Warehouse, Store, Package, DollarSign, Truck, Info } from 'lucide-react';
import { InventoryLocationType } from '@/lib/types/location-management';
import {
  shouldRecordStockMovement,
  getLocationTypeLabel,
  getCreditNoteProcessingBehavior,
} from '@/lib/utils/location-type-helpers';

interface StockMovement {
  id: number;
  lotNo: string;
  location: string;
  locationCode: string;
  locationType: string;
  product: string;
  productDescription: string;
  unit: string;
  quantity: number;
  subtotal: number;
  extraCost: number;
}

export default function StockMovementContent() {
  const movements: StockMovement[] = [
    {
      id: 1,
      lotNo: 'L20240115-001',
      location: 'Main Warehouse',
      locationCode: 'WH-MAIN',
      locationType: 'INV',
      product: 'Rice Jasmine 5kg',
      productDescription: 'Premium grade Thai jasmine rice, vacuum sealed',
      unit: 'Bag',
      quantity: -100,
      subtotal: -25000.00,
      extraCost: 0,
    },
    {
      id: 2,
      lotNo: 'L20240115-002',
      location: 'Main Warehouse',
      locationCode: 'WH-MAIN',
      locationType: 'INV',
      product: 'Rice Jasmine 5kg',
      productDescription: 'Premium grade Thai jasmine rice, vacuum sealed',
      unit: 'Bag',
      quantity: -50,
      subtotal: -12500.00,
      extraCost: 0,
    },
    {
      id: 3,
      lotNo: 'L20240115-003',
      location: 'Store 1',
      locationCode: 'ST-001',
      locationType: 'CON',
      product: 'Cooking Oil 2L',
      productDescription: 'Pure vegetable cooking oil, cholesterol-free',
      unit: 'Bottle',
      quantity: -200,
      subtotal: -16000.00,
      extraCost: 0,
    },
    // Example DIRECT location item - will be filtered out from stock movements
    // Credit notes for DIRECT items only reverse the expense, no inventory impact
    {
      id: 4,
      lotNo: 'L20240115-004',
      location: 'Kitchen Direct',
      locationCode: 'KIT-001',
      locationType: 'DIR',
      product: 'Fresh Produce',
      productDescription: 'Direct expense items - expense reversal only',
      unit: 'Kg',
      quantity: -30,
      subtotal: -1500.00,
      extraCost: 0,
    }
  ];

  /**
   * Parse location type string to InventoryLocationType enum
   *
   * Maps short codes (INV, DIR, CON) to full enum values for
   * use with centralized location type helpers.
   */
  const parseLocationType = (locationType: string): InventoryLocationType => {
    switch (locationType.toUpperCase()) {
      case 'INV':
      case 'INVENTORY':
        return InventoryLocationType.INVENTORY;
      case 'DIR':
      case 'DIRECT':
        return InventoryLocationType.DIRECT;
      case 'CON':
      case 'CONSIGNMENT':
        return InventoryLocationType.CONSIGNMENT;
      default:
        return InventoryLocationType.INVENTORY;
    }
  };

  /**
   * Check if stock movement should be recorded for this location type
   *
   * BUSINESS RULE FOR CREDIT NOTES:
   * - INVENTORY: Record stock reversal - standard credit note
   * - CONSIGNMENT: Record stock reversal - vendor liability adjustment
   * - DIRECT: No stock movement - only expense reversal (items weren't in stock)
   */
  const shouldShowMovement = (locationType: string): boolean => {
    const enumType = parseLocationType(locationType);
    return shouldRecordStockMovement(enumType);
  };

  // Filter movements to only show those that affect stock
  // DIRECT location items are excluded as they don't have stock to reverse
  const filteredMovements = movements.filter(m => shouldShowMovement(m.locationType));

  // Count of direct expense reversals (filtered out)
  const directExpenseCount = movements.filter(m => !shouldShowMovement(m.locationType)).length;

  const totals = {
    subtotal: filteredMovements.reduce((sum, m) => sum + m.subtotal, 0),
    extraCost: filteredMovements.reduce((sum, m) => sum + m.extraCost, 0),
  };

  /**
   * Get the appropriate icon for the location type
   *
   * LOCATION TYPE ICONS:
   * - INV (INVENTORY): Package icon - tracked inventory being returned
   * - DIR (DIRECT): DollarSign icon - expense reversal only
   * - CON (CONSIGNMENT): Truck icon - vendor-owned inventory return
   */
  const getLocationIcon = (type: string) => {
    switch (type.toUpperCase()) {
      case 'INV':
      case 'INVENTORY':
        return <Package className="h-4 w-4" />;
      case 'DIR':
      case 'DIRECT':
        return <DollarSign className="h-4 w-4" />;
      case 'CON':
      case 'CONSIGNMENT':
        return <Truck className="h-4 w-4" />;
      default:
        return <Warehouse className="h-4 w-4" />;
    }
  };

  /**
   * Get the display label for the location type
   */
  const getLocationTypeLabelLocal = (type: string) => {
    switch (type.toUpperCase()) {
      case 'INV':
      case 'INVENTORY':
        return 'Inventory';
      case 'DIR':
      case 'DIRECT':
        return 'Direct Expense';
      case 'CON':
      case 'CONSIGNMENT':
        return 'Consignment';
      default:
        return 'Unknown';
    }
  };

  /**
   * Get badge styling based on location type
   */
  const getLocationBadgeClass = (type: string) => {
    switch (type.toUpperCase()) {
      case 'INV':
      case 'INVENTORY':
        return 'bg-blue-100 text-blue-800';
      case 'DIR':
      case 'DIRECT':
        return 'bg-amber-100 text-amber-800';
      case 'CON':
      case 'CONSIGNMENT':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 px-8">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">Stock Movement</h2>
        </div>
      </div>

      {/* Alert for Direct Expense Reversals
          LOCATION TYPE BEHAVIOR FOR CREDIT NOTES:
          When credit notes include items from DIRECT locations, only the
          expense is reversed. No stock movement is created since items
          were never recorded in inventory.
      */}
      {directExpenseCount > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>{directExpenseCount} item(s)</strong> were from Direct Expense locations.
            Only expense reversals will be processed - no stock adjustments needed
            as these items were never in inventory.
          </AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th scope="col" className="px-2 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th scope="col" className="px-2 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th scope="col" className="px-2 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Lot No.
                  </th>
                  <th scope="col" className="px-2 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit
                  </th>
                  <th scope="col" className="px-2 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16"></div>
                        <span>STOCK</span>
                        <div className="w-16"></div>
                      </div>
                      <div className="flex justify-end gap-2 w-full border-t pt-1">
                        <div className="w-16 text-center">In</div>
                        <div className="w-16 text-center">Out</div>
                      </div>
                    </div>
                  </th>
                  <th scope="col" className="px-2 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Unit Cost
                  </th>
                  <th scope="col" className="px-2 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Extra Cost
                  </th>
                  <th scope="col" className="px-2 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Cost
                  </th>
                </tr>
              </thead>
              {/* Stock Movement Table Body
                  LOCATION TYPE FILTERING FOR CREDIT NOTES:
                  Only items from INVENTORY and CONSIGNMENT locations are shown.
                  DIRECT location items are filtered out as they only reverse expenses,
                  not stock movements (items were never in inventory).
              */}
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredMovements.map((movement) => (
                  <tr key={movement.id}>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getLocationBadgeClass(movement.locationType)}`}>
                          {movement.location}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span>{movement.locationCode}</span>
                          <span className="text-gray-300">|</span>
                          <div className="flex items-center gap-0.5">
                            {getLocationIcon(movement.locationType)}
                            <span>{getLocationTypeLabelLocal(movement.locationType)}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm text-gray-900">
                          {movement.product}
                        </div>
                        <div className="text-xs text-gray-500">
                          {movement.productDescription}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.lotNo}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">
                      {movement.unit}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex justify-end gap-2">
                        <div className="w-16 text-center">
                          {movement.quantity > 0 ? movement.quantity.toLocaleString() : '-'}
                        </div>
                        <div className="w-16 text-center">
                          {movement.quantity < 0 ? Math.abs(movement.quantity).toLocaleString() : '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-col items-end">
                        <div>
                          {(movement.subtotal / movement.quantity).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      </div>
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {movement.extraCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                      {(movement.subtotal + movement.extraCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {/* Totals Row - Only includes filtered movements (excludes DIRECT expense reversals) */}
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                    Total Items: {filteredMovements.length}
                    {directExpenseCount > 0 && (
                      <span className="ml-2 text-amber-600">
                        ({directExpenseCount} expense reversal{directExpenseCount > 1 ? 's' : ''} excluded)
                      </span>
                    )}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex justify-end gap-2">
                      <div className="w-16 text-center">
                        {filteredMovements.reduce((sum, m) => sum + (m.quantity > 0 ? m.quantity : 0), 0).toLocaleString()}
                      </div>
                      <div className="w-16 text-center">
                        {filteredMovements.reduce((sum, m) => sum + (m.quantity < 0 ? Math.abs(m.quantity) : 0), 0).toLocaleString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {totals.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {totals.extraCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="px-2 py-4 whitespace-nowrap text-right text-sm text-gray-900">
                    {(totals.subtotal + totals.extraCost).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}