/**
 * Stock Movement Component for Goods Received Notes
 *
 * Displays stock movements from GRN receiving with location-aware processing.
 *
 * LOCATION TYPE HANDLING FOR GRN:
 * - INVENTORY (INV): Standard GRN processing
 *   → Creates FIFO cost layer with lot tracking
 *   → Updates inventory asset balance
 *   → Full stock movement recorded
 *
 * - DIRECT (DIR): Direct expense processing
 *   → NO stock-in or balance update (items expensed on receipt)
 *   → Items filtered out from stock movement display
 *   → GL: Direct expense posting (Debit Expense, Credit AP)
 *
 * - CONSIGNMENT (CON): Vendor-owned inventory
 *   → Creates consignment stock layer
 *   → Vendor liability tracking (not asset until consumption)
 *   → GL: Debit Consignment Asset, Credit Vendor Liability
 *   → Full stock movement recorded with vendor ownership indicator
 *
 * The component filters out DIRECT location items from the movement table
 * since they don't create actual stock movements - they're expensed immediately.
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
  getGRNProcessingBehavior,
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
      quantity: 100,
      subtotal: 25000.00,
      extraCost: 500.00
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
      quantity: 50,
      subtotal: 12500.00,
      extraCost: 250.00
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
      quantity: 200,
      subtotal: 16000.00,
      extraCost: 400.00
    },
    // Example DIRECT location item - will be filtered out from stock movements
    {
      id: 4,
      lotNo: 'L20240115-004',
      location: 'Kitchen Direct',
      locationCode: 'KIT-001',
      locationType: 'DIR',
      product: 'Fresh Vegetables Mix',
      productDescription: 'Daily kitchen supplies - direct expense',
      unit: 'Kg',
      quantity: 50,
      subtotal: 2500.00,
      extraCost: 0.00
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
   * BUSINESS RULE:
   * - INVENTORY: Record stock movement - standard receiving
   * - CONSIGNMENT: Record stock movement - vendor-owned tracking
   * - DIRECT: No stock movement - items expensed on receipt
   */
  const shouldShowMovement = (locationType: string): boolean => {
    const enumType = parseLocationType(locationType);
    return shouldRecordStockMovement(enumType);
  };

  // Filter movements to only show those that create stock movements
  // DIRECT location items are excluded as they don't create inventory transactions
  const filteredMovements = movements.filter(m => shouldShowMovement(m.locationType));

  // Count of direct expense items (filtered out)
  const directExpenseCount = movements.filter(m => !shouldShowMovement(m.locationType)).length;

  const totals = {
    quantity: filteredMovements.reduce((sum, m) => sum + m.quantity, 0),
    subtotal: filteredMovements.reduce((sum, m) => sum + m.subtotal, 0),
    extraCost: filteredMovements.reduce((sum, m) => sum + m.extraCost, 0)
  };

  /**
   * Get the appropriate icon for the location type
   *
   * LOCATION TYPE ICONS:
   * - INV (INVENTORY): Package icon - represents tracked inventory assets
   * - DIR (DIRECT): DollarSign icon - represents immediate expense items
   * - CON (CONSIGNMENT): Truck icon - represents vendor-owned inventory
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
   *
   * Uses local mapping for display purposes.
   * For business logic, use centralized helpers from location-type-helpers.ts
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
   *
   * STYLING:
   * - INVENTORY: Blue - standard tracked inventory
   * - DIRECT: Amber/Yellow - expense items (should rarely appear here)
   * - CONSIGNMENT: Green - vendor-owned inventory
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

      {/* Alert for Direct Expense Items
          LOCATION TYPE BEHAVIOR:
          When GRN includes items for DIRECT locations, they are expensed
          immediately and don't create stock movements. This alert informs
          users that some items were processed differently.
      */}
      {directExpenseCount > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <Info className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-amber-800">
            <strong>{directExpenseCount} item(s)</strong> were received to Direct Expense locations
            and have been expensed immediately. These items do not appear in stock movements
            as they bypass inventory tracking.
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
                  LOCATION TYPE FILTERING:
                  Only items from INVENTORY and CONSIGNMENT locations are shown.
                  DIRECT location items are filtered out as they don't create
                  stock movements (expensed on receipt).
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
                {/* Totals Row - Only includes filtered movements (excludes DIRECT) */}
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-2 py-4 whitespace-nowrap text-sm text-gray-500">
                    Total Items: {filteredMovements.length}
                    {directExpenseCount > 0 && (
                      <span className="ml-2 text-amber-600">
                        ({directExpenseCount} direct expense item{directExpenseCount > 1 ? 's' : ''} excluded)
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