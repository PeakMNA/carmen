'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  AlertTriangle,
  ArrowUp,
  Package,
  TrendingUp,
  Search,
  Filter,
  Warehouse,
  ArrowLeftRight,
  Truck,
  ChevronRight
} from 'lucide-react';
import Link from 'next/link';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface Item {
  id: number
  name: string
  sku: string
  description: string
  location: string
  locationCode: string
  currentStock: number
  minLevel: number
  maxLevel: number
  parLevel: number
  onOrder: number
  transferTrigger: number
  lastPrice: number
  lastVendor: string
  status: string
  usage: string
  orderAmount: number
  unit: string
  selected?: boolean
}

const StockReplenishmentDashboard = () => {
  const stockLevels = [
    { month: 'Jan', level: 150 },
    { month: 'Feb', level: 180 },
    { month: 'Mar', level: 120 },
    { month: 'Apr', level: 200 },
    { month: 'May', level: 160 },
    { month: 'Jun', level: 140 },
  ];

  const [items, setItems] = useState<Item[]>([
    {
      id: 1,
      name: 'Thai Milk Tea',
      description: 'Premium Thai tea powder with creamer (12 sachets/box)',
      sku: 'BEV-001',
      location: 'Central Kitchen',
      locationCode: 'CK-001',
      currentStock: 25,
      minLevel: 30,
      maxLevel: 100,
      parLevel: 80,
      onOrder: 50,
      transferTrigger: 40,
      lastPrice: 45.99,
      lastVendor: 'Thai Beverage Co.',
      status: 'low',
      usage: 'high',
      orderAmount: 0,
      unit: 'Box'
    },
    {
      id: 2,
      name: 'Coffee Beans',
      description: 'Premium Arabica whole beans (1kg/bag)',
      sku: 'BEV-002',
      location: 'Roastery Store',
      locationCode: 'RS-001',
      currentStock: 45,
      minLevel: 20,
      maxLevel: 80,
      parLevel: 60,
      onOrder: 0,
      transferTrigger: 30,
      lastPrice: 28.50,
      lastVendor: 'Global Coffee Suppliers',
      status: 'normal',
      usage: 'medium',
      orderAmount: 0,
      unit: 'Bag'
    }
  ]);

  return (
    <div className="space-y-4">
      {/* Page Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Warehouse className="h-7 w-7 text-green-600" />
          Internal Stock Transfers
        </h2>
        <p className="text-sm text-muted-foreground">
          Request inventory transfers from central store to operational locations
        </p>
      </div>

      {/* Info Alert */}
      <Alert className="border-green-200 bg-green-50">
        <ArrowLeftRight className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          <strong>INTERNAL TRANSFERS:</strong> This module manages transfers between hotel locations (kitchen, bar, outlets).
          For ordering from external suppliers, use{" "}
          <Link href="/operational-planning/inventory-planning/reorder" className="underline font-medium hover:text-green-900">
            Supplier Reorder Planning
          </Link>{" "}
          in Inventory Planning.
        </AlertDescription>
      </Alert>

      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Total SKUs</p>
                <p className="text-2xl font-bold">1,234</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Low Stock Items</p>
                <p className="text-2xl font-bold text-red-500">28</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Items on Order</p>
                <p className="text-2xl font-bold text-orange-500">45</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-500">Stock Value</p>
                <p className="text-2xl font-bold">$45,678</p>
              </div>
              <ArrowUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stock Level Trend */}
      <Card>
        <CardHeader>
          <CardTitle>Stock Level Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={stockLevels}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="level" stroke="#2563eb" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      <Alert className="bg-red-50 border-red-200">
        <AlertTriangle className="h-4 w-4 text-red-500" />
        <AlertDescription>
          8 items are below minimum stock levels and require immediate attention
        </AlertDescription>
      </Alert>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4">
            {/* First Row - Title and Create Button */}
            <div className="flex justify-between items-center">
              <CardTitle>Inventory Status</CardTitle>
              <Button>Request Transfer</Button>
            </div>
            
            {/* Second Row - Search and Filters with justify-between */}
            <div className="flex items-center justify-between">
              <div className="relative w-1/2">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
                <Input className="pl-8 w-full" placeholder="Search items..." />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300"
                      onChange={(e) => {
                        const checked = e.target.checked
                        setItems(items.map(item => ({
                          ...item,
                          selected: checked
                        })))
                      }}
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Current Stock</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">PAR Level</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Transfer Trigger</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">On Order</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Order Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item) => {
                  const suggestedOrder = Math.max(0, item.parLevel - (item.currentStock + item.onOrder));
                  
                  return (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300"
                          checked={item.selected}
                          onChange={(e) => {
                            setItems(items.map(i => 
                              i.id === item.id ? { ...i, selected: e.target.checked } : i
                            ))
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="font-medium text-gray-900">{item.location}</div>
                          <div className="text-sm text-gray-500">{item.locationCode}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="font-medium text-gray-900">{item.name}</div>
                            <div className="text-sm text-gray-500">({item.sku})</div>
                          </div>
                          <div className="text-sm text-gray-500">{item.description}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className={`${item.currentStock < item.transferTrigger ? 'text-red-500 font-medium' : ''}`}>
                          {item.currentStock}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{item.parLevel}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">{item.transferTrigger}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <span className="text-gray-500">{item.onOrder}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                        <Input 
                          type="number"
                          defaultValue={suggestedOrder}
                          className="w-20 text-right"
                          onChange={(e) => {
                            const newItems = items.map(i => 
                              i.id === item.id ? { ...i, orderAmount: parseInt(e.target.value) } : i
                            );
                            setItems(newItems);
                          }}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <Select defaultValue={item.unit}>
                          <SelectTrigger className="w-[100px]">
                            <SelectValue placeholder="Select unit" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Box">Box</SelectItem>
                            <SelectItem value="Bag">Bag</SelectItem>
                            <SelectItem value="Pack">Pack</SelectItem>
                            <SelectItem value="Piece">Piece</SelectItem>
                            <SelectItem value="Kg">Kg</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          item.status === 'low' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Cross-link to Supplier Reorder Planning */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">Need to order from suppliers?</p>
                <p className="text-sm text-blue-700">
                  Optimize purchase orders with EOQ and reorder point calculations.
                </p>
              </div>
            </div>
            <Link href="/operational-planning/inventory-planning/reorder">
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                Go to Supplier Reorder Planning
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StockReplenishmentDashboard;