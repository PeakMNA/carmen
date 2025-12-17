import React, { useState } from 'react';
import { BarChart2, ArrowRight, Package, Layers, DollarSign, AlertCircle, ChevronDown } from 'lucide-react';

// Mock Data
const inventoryData = {
  product: {
    code: 'PRD001',
    name: 'Product A - Standard Grade',
    category: 'Raw Materials',
    uom: 'Each'
  },
  lots: [
    {
      lotNumber: 'LOT001',
      receiptDate: '2024-10-01',
      originalQty: 500,
      availableQty: 300,
      originalCost: 50.00,
      newCost: 45.00,
      movement: [
        { date: '2024-10-01', type: 'Receipt', quantity: 500, reference: 'GRN-2410-001' },
        { date: '2024-10-15', type: 'Issue', quantity: -200, reference: 'ISS-2410-001' }
      ]
    },
    {
      lotNumber: 'LOT002',
      receiptDate: '2024-10-15',
      originalQty: 500,
      availableQty: 500,
      originalCost: 50.00,
      newCost: 45.00,
      movement: [
        { date: '2024-10-15', type: 'Receipt', quantity: 500, reference: 'GRN-2410-002' }
      ]
    }
  ],
  fifoLayers: [
    {
      layer: 1,
      date: '2024-10-01',
      quantity: 300,
      originalCost: 50.00,
      newCost: 45.00,
      status: 'Partial'
    },
    {
      layer: 2,
      date: '2024-10-15',
      quantity: 500,
      originalCost: 50.00,
      newCost: 45.00,
      status: 'Open'
    }
  ],
  impact: {
    quantityAffected: 800,
    valueChange: -4000.00,
    averageCost: {
      before: 50.00,
      after: 45.00,
      change: -5.00
    }
  }
};

export default function InventoryImpact() {
  const [expandedLots, setExpandedLots] = useState<string[]>([]);

  const toggleLot = (lotNumber: string) => {
    setExpandedLots(prev =>
      prev.includes(lotNumber)
        ? prev.filter(lot => lot !== lotNumber)
        : [...prev, lotNumber]
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <BarChart2 className="w-5 h-5 text-gray-500" />
            <h2 className="text-lg font-medium text-gray-900">Inventory Impact</h2>
          </div>
          <div className="text-sm text-gray-500">
            Document: CN-2410-001
          </div>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 border-b bg-gray-50">
        <div className="flex items-start space-x-4">
          <Package className="w-5 h-5 text-gray-400 mt-1" />
          <div>
            <h3 className="text-sm font-medium text-gray-900">{inventoryData.product.name}</h3>
            <div className="mt-1 grid grid-cols-3 gap-x-8 text-sm text-gray-500">
              <div>Code: {inventoryData.product.code}</div>
              <div>Category: {inventoryData.product.category}</div>
              <div>UOM: {inventoryData.product.uom}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Impact Summary */}
      <div className="p-4 border-b">
        <div className="grid grid-cols-3 gap-6">
          {/* Stock Impact */}
          <div className="bg-amber-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-amber-500" />
              <h3 className="text-sm font-medium text-amber-900">Stock Impact</h3>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold text-amber-700">
                {inventoryData.impact.quantityAffected} units
              </div>
              <div className="text-sm text-amber-600">Affected Quantity</div>
            </div>
          </div>

          {/* Value Impact */}
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-medium text-blue-900">Value Impact</h3>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold text-blue-700">
                ${inventoryData.impact.valueChange.toFixed(2)}
              </div>
              <div className="text-sm text-blue-600">Total Change</div>
            </div>
          </div>

          {/* Cost Impact */}
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <BarChart2 className="w-5 h-5 text-green-500" />
              <h3 className="text-sm font-medium text-green-900">Cost Impact</h3>
            </div>
            <div className="mt-2">
              <div className="text-2xl font-semibold text-green-700">
                ${inventoryData.impact.averageCost.change.toFixed(2)}
              </div>
              <div className="text-sm text-green-600">Per Unit Change</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lot Details */}
      <div className="p-4 border-b">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Lot Details</h3>
        <div className="space-y-4">
          {inventoryData.lots.map((lot) => (
            <div key={lot.lotNumber} className="border rounded-lg">
              {/* Lot Header */}
              <div
                className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50"
                onClick={() => toggleLot(lot.lotNumber)}
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">{lot.lotNumber}</span>
                    <span className="text-xs text-gray-500">Receipt: {lot.receiptDate}</span>
                  </div>
                  <div className="mt-1 text-sm text-gray-500">
                    Available: {lot.availableQty} / {lot.originalQty} units
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm text-gray-900">Original: ${lot.originalCost.toFixed(2)}</div>
                    <div className="text-sm text-blue-600">New: ${lot.newCost.toFixed(2)}</div>
                  </div>
                  <ChevronDown 
                    className={`w-5 h-5 text-gray-400 transform transition-transform ${
                      expandedLots.includes(lot.lotNumber) ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              {/* Lot Details */}
              {expandedLots.includes(lot.lotNumber) && (
                <div className="p-4 bg-gray-50 border-t">
                  <div className="space-y-4">
                    {/* Movement History */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 mb-2">Movement History</h4>
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-xs text-gray-500">
                            <th className="text-left py-2">Date</th>
                            <th className="text-left py-2">Type</th>
                            <th className="text-right py-2">Quantity</th>
                            <th className="text-left py-2">Reference</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {lot.movement.map((move, index) => (
                            <tr key={index}>
                              <td className="py-2">{move.date}</td>
                              <td className="py-2">{move.type}</td>
                              <td className="py-2 text-right">{move.quantity}</td>
                              <td className="py-2">{move.reference}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Cost Impact */}
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 mb-2">Cost Impact</h4>
                      <div className="bg-white rounded-lg p-3">
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <div className="text-xs text-gray-500">Original Cost</div>
                            <div className="text-sm font-medium">${lot.originalCost.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">New Cost</div>
                            <div className="text-sm font-medium">${lot.newCost.toFixed(2)}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Difference</div>
                            <div className="text-sm font-medium text-red-600">
                              ${(lot.newCost - lot.originalCost).toFixed(2)}
                            </div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Total Impact</div>
                            <div className="text-sm font-medium text-red-600">
                              ${((lot.newCost - lot.originalCost) * lot.availableQty).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FIFO Layer Impact */}
      <div className="p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-4">FIFO Layer Impact</h3>
        <table className="w-full">
          <thead>
            <tr className="text-xs text-gray-500 uppercase">
              <th className="text-left py-2">Layer</th>
              <th className="text-right py-2">Quantity</th>
              <th className="text-right py-2">Original Cost</th>
              <th className="text-right py-2">New Cost</th>
              <th className="text-right py-2">Difference</th>
              <th className="text-center py-2">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {inventoryData.fifoLayers.map((layer) => (
              <tr key={layer.layer}>
                <td className="py-3">
                  <div className="text-sm font-medium text-gray-900">Layer {layer.layer}</div>
                  <div className="text-xs text-gray-500">{layer.date}</div>
                </td>
                <td className="py-3 text-sm text-right">{layer.quantity}</td>
                <td className="py-3 text-sm text-right">${layer.originalCost.toFixed(2)}</td>
                <td className="py-3 text-sm text-right">${layer.newCost.toFixed(2)}</td>
                <td className="py-3 text-sm text-right text-red-600">
                  ${((layer.newCost - layer.originalCost) * layer.quantity).toFixed(2)}
                </td>
                <td className="py-3 text-center">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    layer.status === 'Open' 
                      ? 'bg-green-50 text-green-700'
                      : 'bg-amber-50 text-amber-700'
                  }`}>
                    {layer.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Validation Messages */}
      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-gray-900">Impact Validation</h4>
            <div className="mt-2 space-y-2">
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <span className="text-gray-600">All affected lots are available for adjustment</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <span className="text-gray-600">FIFO layers properly identified</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2" />
                <span className="text-gray-600">Cost adjustments within allowed range</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}