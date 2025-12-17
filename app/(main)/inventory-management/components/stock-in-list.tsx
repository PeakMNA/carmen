'use client'

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Edit, 
  FileText, 
  Trash2, 
  Printer, 
  Plus, 
  Search, 
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar as CalendarIcon
} from 'lucide-react'
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { DateRange } from "react-day-picker"
import { DatePickerWithRange } from "@/components/ui/date-picker-with-range"
import { StockInDetail } from './stock-in-detail'

// Add type definitions
type TransactionStatus = 'Committed' | 'Saved' | 'Void'
type TransactionType = 'Good Receive Note' | 'Transfer' | 'Credit Note' | 'Issue Return' | 'Adjustment'

interface StockTransaction {
  id: number
  date: string
  refNo: string
  type: TransactionType
  relatedDoc: string
  store: string
  name: string
  description: string
  totalQty: number
  status: TransactionStatus
  createdBy: string
  createdDate: string
  modifiedBy: string
  modifiedDate: string
  commitDate?: string
  committedBy?: string
  items?: Array<{
    id: number
    store: string
    itemCode: string
    description: string
    unit: string
    qty: number
    unitCost: number
    category: string
    subCategory: string
    itemGroup: string
    barCode?: string
    comment?: string
    inventoryInfo: {
      onHand: number
      onOrdered: number
      reorder: number
      restock: number
      lastPrice: number
      lastVendor: string
    }
  }>
  movements?: Array<{
    commitDate: string
    location: string
    itemDescription: string
    inventoryUnit: string
    stockIn: number
    stockOut: number
    amount: number
    reference: string
  }>
  comments?: Array<{
    id: number
    date: string
    by: string
    comment: string
  }>
  attachments?: Array<{
    id: number
    fileName: string
    description: string
    isPublic: boolean
    date: string
    by: string
  }>
  activityLog?: Array<{
    date: string
    by: string
    action: string
    log: string
  }>
}

export const StockInListing = () => {
  const [view, setView] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showMoreFilters, setShowMoreFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [goToPage, setGoToPage] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [dateFilter, setDateFilter] = useState('')
  const [showDetail, setShowDetail] = useState(false)
  const [detailMode, setDetailMode] = useState<'view' | 'edit' | 'add'>('view')
  const [selectedTransaction, setSelectedTransaction] = useState<StockTransaction | null>(null)

  const stockTransactions: StockTransaction[] = [
    {
      id: 1,
      date: '2024-01-15',
      refNo: 'STK-IN-2410-001',
      type: 'Good Receive Note',
      relatedDoc: 'GRN-2410-001',
      store: 'WH-MAIN',
      name: 'Main Warehouse',
      description: 'Monthly F&B supplies delivery from Thai Beverage Co.',
      totalQty: 500,
      status: 'Committed',
      createdBy: 'John Doe',
      createdDate: '2024-01-15 09:00:00',
      modifiedBy: 'Jane Smith',
      modifiedDate: '2024-01-15 10:30:00',
      commitDate: '2024-01-15 11:00:00',
      committedBy: 'Jane Smith',
      items: [
        {
          id: 1,
          store: 'FB-MAIN',
          itemCode: 'BEV-0001',
          description: 'Heineken Beer 330ml',
          unit: 'Bottle',
          qty: 200,
          unitCost: 85.00,
          category: 'Beverage',
          subCategory: 'Alcoholic',
          itemGroup: 'Beer',
          barCode: '8850123456789',
          inventoryInfo: {
            onHand: 350,
            onOrdered: 200,
            reorder: 250,
            restock: 500,
            lastPrice: 82.00,
            lastVendor: 'Thai Beverage Co.'
          }
        },
        {
          id: 2,
          store: 'FB-BAR',
          itemCode: 'BEV-0002',
          description: 'Chang Beer 330ml',
          unit: 'Bottle',
          qty: 150,
          unitCost: 75.00,
          category: 'Beverage',
          subCategory: 'Alcoholic',
          itemGroup: 'Beer',
          barCode: '8850123456790',
          inventoryInfo: {
            onHand: 200,
            onOrdered: 150,
            reorder: 200,
            restock: 400,
            lastPrice: 73.00,
            lastVendor: 'Thai Beverage Co.'
          }
        },
        {
          id: 3,
          store: 'FB-BQT',
          itemCode: 'BEV-0003',
          description: 'Singha Beer 330ml',
          unit: 'Bottle',
          qty: 100,
          unitCost: 80.00,
          category: 'Beverage',
          subCategory: 'Alcoholic',
          itemGroup: 'Beer',
          barCode: '8850123456791',
          inventoryInfo: {
            onHand: 150,
            onOrdered: 100,
            reorder: 150,
            restock: 300,
            lastPrice: 78.00,
            lastVendor: 'Thai Beverage Co.'
          }
        },
        {
          id: 4,
          store: 'FB-PST',
          itemCode: 'BEV-0004',
          description: 'Leo Beer 330ml',
          unit: 'Bottle',
          qty: 50,
          unitCost: 70.00,
          category: 'Beverage',
          subCategory: 'Alcoholic',
          itemGroup: 'Beer',
          barCode: '8850123456792',
          inventoryInfo: {
            onHand: 100,
            onOrdered: 50,
            reorder: 100,
            restock: 200,
            lastPrice: 68.00,
            lastVendor: 'Thai Beverage Co.'
          }
        }
      ],
      movements: [
        {
          commitDate: '2024-01-15 11:00:00',
          location: 'FB-MAIN',
          itemDescription: 'Heineken Beer 330ml',
          inventoryUnit: 'Bottle',
          stockIn: 200,
          stockOut: 0,
          amount: 17000.00,
          reference: 'GRN-2410-001'
        },
        {
          commitDate: '2024-01-15 11:00:00',
          location: 'FB-BAR',
          itemDescription: 'Chang Beer 330ml',
          inventoryUnit: 'Bottle',
          stockIn: 150,
          stockOut: 0,
          amount: 11250.00,
          reference: 'GRN-2410-001'
        },
        {
          commitDate: '2024-01-15 11:00:00',
          location: 'FB-BQT',
          itemDescription: 'Singha Beer 330ml',
          inventoryUnit: 'Bottle',
          stockIn: 100,
          stockOut: 0,
          amount: 8000.00,
          reference: 'GRN-2410-001'
        },
        {
          commitDate: '2024-01-15 11:00:00',
          location: 'FB-PST',
          itemDescription: 'Leo Beer 330ml',
          inventoryUnit: 'Bottle',
          stockIn: 50,
          stockOut: 0,
          amount: 3500.00,
          reference: 'GRN-2410-001'
        }
      ],
      comments: [
        {
          id: 1,
          date: '2024-01-15 09:30:00',
          by: 'John Doe',
          comment: 'All items received in good condition. Temperature checks completed for beverages.'
        }
      ],
      attachments: [
        {
          id: 1,
          fileName: 'delivery-note.pdf',
          description: 'Thai Beverage Co. Delivery Note',
          isPublic: true,
          date: '2024-01-15 09:15:00',
          by: 'John Doe'
        }
      ],
      activityLog: [
        {
          date: '2024-01-15 09:00:00',
          by: 'John Doe',
          action: 'Create',
          log: 'Stock In transaction created'
        },
        {
          date: '2024-01-15 11:00:00',
          by: 'Jane Smith',
          action: 'Commit',
          log: 'Transaction committed'
        }
      ]
    },
    {
      id: 2,
      date: '2024-01-14',
      refNo: 'STK-IN-2410-002',
      type: 'Transfer',
      relatedDoc: 'TRF-2410-005',
      store: 'WH-002',
      name: 'Branch Store A',
      description: 'Stock transfer from Main Warehouse - Monthly restock for high-demand items including seasonal promotions',
      totalQty: 75,
      status: 'Committed',
      createdBy: 'John Doe',
      createdDate: '2024-01-14 09:00:00',
      modifiedBy: 'Jane Smith',
      modifiedDate: '2024-01-14 10:30:00',
      commitDate: '2024-01-14 11:00:00',
      committedBy: 'Jane Smith',
      items: [
        {
          id: 2,
          store: 'RH - Rooms - Housekeeping',
          itemCode: '10000003',
          description: 'Tea 500 g.',
          unit: 'Bag',
          qty: 30,
          unitCost: 75.00,
          category: 'Food',
          subCategory: 'Beverages',
          itemGroup: 'Tea',
          barCode: '8850123456790',
          inventoryInfo: {
            onHand: 150,
            onOrdered: 75,
            reorder: 100,
            restock: 200,
            lastPrice: 70.00,
            lastVendor: 'Thai Beverage Co.'
          }
        }
      ],
      movements: [
        {
          commitDate: '2024-01-14 11:00:00',
          location: 'Branch Store A',
          itemDescription: 'Tea 500 g.',
          inventoryUnit: 'Bag',
          stockIn: 30,
          stockOut: 0,
          amount: 2250.00,
          reference: 'TRF-2410-005'
        }
      ],
      comments: [
        {
          id: 2,
          date: '2024-01-14 09:30:00',
          by: 'John Doe',
          comment: 'Quality check completed - all items in good condition'
        }
      ],
      attachments: [
        {
          id: 2,
          fileName: 'transfer-note.pdf',
          description: 'Transfer note',
          isPublic: true,
          date: '2024-01-14 09:15:00',
          by: 'John Doe'
        }
      ],
      activityLog: [
        {
          date: '2024-01-14 09:00:00',
          by: 'John Doe',
          action: 'Create',
          log: 'Stock In transaction created'
        },
        {
          date: '2024-01-14 11:00:00',
          by: 'Jane Smith',
          action: 'Commit',
          log: 'Transaction committed'
        }
      ]
    },
    {
      id: 3,
      date: '2024-01-14',
      refNo: 'STK-IN-2410-003',
      type: 'Credit Note',
      relatedDoc: 'CN-2410-010',
      store: 'WH-001',
      name: 'Main Warehouse',
      description: 'Return from customer order #ORD-2410-089 due to excess quantity ordered - Quality check required',
      totalQty: 25,
      status: 'Saved',
      createdBy: 'John Doe',
      createdDate: '2024-01-14 09:00:00',
      modifiedBy: 'Jane Smith',
      modifiedDate: '2024-01-14 10:30:00',
      commitDate: '2024-01-14 11:00:00',
      committedBy: 'Jane Smith',
      items: [
        {
          id: 3,
          store: 'RH - Rooms - Housekeeping',
          itemCode: '10000004',
          description: 'Sugar 500 g.',
          unit: 'Bag',
          qty: 10,
          unitCost: 50.00,
          category: 'Food',
          subCategory: 'Beverages',
          itemGroup: 'Sugar',
          barCode: '8850123456791',
          inventoryInfo: {
            onHand: 50,
            onOrdered: 10,
            reorder: 20,
            restock: 60,
            lastPrice: 45.00,
            lastVendor: 'Thai Beverage Co.'
          }
        }
      ],
      movements: [
        {
          commitDate: '2024-01-14 11:00:00',
          location: 'Main Warehouse',
          itemDescription: 'Sugar 500 g.',
          inventoryUnit: 'Bag',
          stockIn: 10,
          stockOut: 0,
          amount: 250.00,
          reference: 'CN-2410-010'
        }
      ],
      comments: [
        {
          id: 3,
          date: '2024-01-14 09:30:00',
          by: 'John Doe',
          comment: 'Quality check completed - all items in good condition'
        }
      ],
      attachments: [
        {
          id: 3,
          fileName: 'credit-note.pdf',
          description: 'Credit note',
          isPublic: true,
          date: '2024-01-14 09:15:00',
          by: 'John Doe'
        }
      ],
      activityLog: [
        {
          date: '2024-01-14 09:00:00',
          by: 'John Doe',
          action: 'Create',
          log: 'Stock In transaction created'
        },
        {
          date: '2024-01-14 11:00:00',
          by: 'Jane Smith',
          action: 'Commit',
          log: 'Transaction committed'
        }
      ]
    },
    {
      id: 4,
      date: '2024-01-13',
      refNo: 'STK-IN-2410-004',
      type: 'Issue Return',
      relatedDoc: 'ISS-2410-015',
      store: 'WH-003',
      name: 'Branch Store B',
      description: 'Unused items return from Event Department - Corporate function cancelled',
      totalQty: 30,
      status: 'Committed',
      createdBy: 'John Doe',
      createdDate: '2024-01-13 09:00:00',
      modifiedBy: 'Jane Smith',
      modifiedDate: '2024-01-13 10:30:00',
      commitDate: '2024-01-13 11:00:00',
      committedBy: 'Jane Smith',
      items: [
        {
          id: 4,
          store: 'RH - Rooms - Housekeeping',
          itemCode: '10000005',
          description: 'Chocolate 200 g.',
          unit: 'Bag',
          qty: 15,
          unitCost: 100.00,
          category: 'Food',
          subCategory: 'Confectionery',
          itemGroup: 'Chocolate',
          barCode: '8850123456792',
          inventoryInfo: {
            onHand: 30,
            onOrdered: 15,
            reorder: 20,
            restock: 45,
            lastPrice: 95.00,
            lastVendor: 'Thai Beverage Co.'
          }
        }
      ],
      movements: [
        {
          commitDate: '2024-01-13 11:00:00',
          location: 'Branch Store B',
          itemDescription: 'Chocolate 200 g.',
          inventoryUnit: 'Bag',
          stockIn: 15,
          stockOut: 0,
          amount: 1500.00,
          reference: 'ISS-2410-015'
        }
      ],
      comments: [
        {
          id: 4,
          date: '2024-01-13 09:30:00',
          by: 'John Doe',
          comment: 'Quality check completed - all items in good condition'
        }
      ],
      attachments: [
        {
          id: 4,
          fileName: 'return-note.pdf',
          description: 'Return note',
          isPublic: true,
          date: '2024-01-13 09:15:00',
          by: 'John Doe'
        }
      ],
      activityLog: [
        {
          date: '2024-01-13 09:00:00',
          by: 'John Doe',
          action: 'Create',
          log: 'Stock In transaction created'
        },
        {
          date: '2024-01-13 11:00:00',
          by: 'Jane Smith',
          action: 'Commit',
          log: 'Transaction committed'
        }
      ]
    },
    {
      id: 5,
      date: '2024-01-12',
      refNo: 'STK-IN-2410-005',
      type: 'Adjustment',
      relatedDoc: 'ADJ-2410-008',
      store: 'WH-001',
      name: 'Main Warehouse',
      description: 'Stock count adjustment - Surplus found during monthly inventory check',
      totalQty: 45,
      status: 'Committed',
      createdBy: 'John Doe',
      createdDate: '2024-01-12 09:00:00',
      modifiedBy: 'Jane Smith',
      modifiedDate: '2024-01-12 10:30:00',
      commitDate: '2024-01-12 11:00:00',
      committedBy: 'Jane Smith',
      items: [
        {
          id: 5,
          store: 'RH - Rooms - Housekeeping',
          itemCode: '10000006',
          description: 'Salt 500 g.',
          unit: 'Bag',
          qty: 20,
          unitCost: 25.00,
          category: 'Food',
          subCategory: 'Condiments',
          itemGroup: 'Salt',
          barCode: '8850123456793',
          inventoryInfo: {
            onHand: 40,
            onOrdered: 20,
            reorder: 25,
            restock: 50,
            lastPrice: 20.00,
            lastVendor: 'Thai Beverage Co.'
          }
        }
      ],
      movements: [
        {
          commitDate: '2024-01-12 11:00:00',
          location: 'Main Warehouse',
          itemDescription: 'Salt 500 g.',
          inventoryUnit: 'Bag',
          stockIn: 20,
          stockOut: 0,
          amount: 1000.00,
          reference: 'ADJ-2410-008'
        }
      ],
      comments: [
        {
          id: 5,
          date: '2024-01-12 09:30:00',
          by: 'John Doe',
          comment: 'Quality check completed - all items in good condition'
        }
      ],
      attachments: [
        {
          id: 5,
          fileName: 'adjustment-note.pdf',
          description: 'Adjustment note',
          isPublic: true,
          date: '2024-01-12 09:15:00',
          by: 'John Doe'
        }
      ],
      activityLog: [
        {
          date: '2024-01-12 09:00:00',
          by: 'John Doe',
          action: 'Create',
          log: 'Stock In transaction created'
        },
        {
          date: '2024-01-12 11:00:00',
          by: 'Jane Smith',
          action: 'Commit',
          log: 'Transaction committed'
        }
      ]
    }
  ];

  // Update the badge class functions with proper typing
  const getStatusBadgeClass = (status: TransactionStatus) => {
    switch (status) {
      case 'Committed':
        return 'bg-green-100 text-green-700'
      case 'Saved':
        return 'bg-yellow-100 text-yellow-700'
      case 'Void':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getTypeBadgeClass = (type: TransactionType) => {
    switch (type) {
      case 'Good Receive Note':
        return 'bg-blue-100 text-blue-700'
      case 'Transfer':
        return 'bg-purple-100 text-purple-700'
      case 'Credit Note':
        return 'bg-orange-100 text-orange-700'
      case 'Issue Return':
        return 'bg-teal-100 text-teal-700'
      case 'Adjustment':
        return 'bg-gray-100 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const handleActionClick = (action: 'view' | 'edit' | 'add', transaction?: StockTransaction) => {
    setDetailMode(action)
    setSelectedTransaction(transaction || null)
    setShowDetail(true)
  }

  return (
    <div className="px-2 sm:px-4 md:px-6">
      {showDetail ? (
        <StockInDetail 
          mode={detailMode}
          onClose={() => setShowDetail(false)}
          data={selectedTransaction}
        />
      ) : (
        <div className="space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-2">
            <h1 className="text-xl sm:text-2xl font-bold">Stock In Transactions</h1>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button 
                className="flex-1 sm:flex-none"
                onClick={() => handleActionClick('add')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New
              </Button>
              <Button variant="outline" className="flex-1 sm:flex-none">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
            </div>
          </div>

          {/* Search Bar and Filter Row */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search takes up full width on mobile, 50% on desktop */}
            <div className="w-full md:w-1/2 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by requisition, location, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10"
              />
            </div>
            
            {/* Filters stack on mobile, align right on desktop */}
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:ml-auto">
              <select 
                className="border rounded-md px-3 py-2 w-full sm:w-[180px] bg-white"
                value={view}
                onChange={(e) => setView(e.target.value)}
              >
                <option value="all">All Types</option>
                <option value="grn">Good Receive Note</option>
                <option value="transfer">Transfer</option>
                <option value="credit">Credit Note</option>
                <option value="issue">Issue Return</option>
                <option value="adjustment">Adjustment</option>
              </select>
              <Button 
                variant="outline"
                size="sm"
                className="w-full sm:w-auto whitespace-nowrap"
                onClick={() => setShowMoreFilters(!showMoreFilters)}
              >
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>

          {/* More Filters Section */}
          {showMoreFilters && (
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="border rounded-md px-3 py-2 w-full bg-white">
                    <option value="">All Statuses</option>
                    <option value="committed">Committed</option>
                    <option value="saved">Saved</option>
                    <option value="void">Void</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
                  <div className="flex flex-col gap-2">
                    <select 
                      className="border rounded-md px-3 py-2 w-full bg-white"
                      value={dateFilter}
                      onChange={(e) => {
                        setDateFilter(e.target.value)
                        if (e.target.value !== 'custom') {
                          setDateRange(undefined)
                        }
                      }}
                    >
                      <option value="">All Time</option>
                      <option value="today">Today</option>
                      <option value="yesterday">Yesterday</option>
                      <option value="last7">Last 7 Days</option>
                      <option value="last30">Last 30 Days</option>
                      <option value="custom">Custom Range</option>
                    </select>
                    
                    {dateFilter === 'custom' && (
                      <DatePickerWithRange 
                        date={dateRange} 
                        setDate={setDateRange} 
                      />
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <select className="border rounded-md px-3 py-2 w-full bg-white">
                    <option value="">All Locations</option>
                    <option value="wh-001">Main Warehouse</option>
                    <option value="wh-002">Branch Store A</option>
                    <option value="wh-003">Branch Store B</option>
                  </select>
                </div>
              </div>
            </Card>
          )}

          {/* Main Table */}
          <div className="overflow-x-auto">
            <Card>
              <CardContent className="p-0 sm:p-6">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requisition</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Qty</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {stockTransactions
                        .slice((currentPage - 1) * pageSize, currentPage * pageSize)
                        .map((transaction) => (
                          <React.Fragment key={transaction.id}>
                            <tr className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900">{transaction.date}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                                {transaction.refNo}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-col gap-1">
                                  <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getTypeBadgeClass(transaction.type)} w-fit`}>
                                    {transaction.type}
                                  </span>
                                  <span className="block mt-1 text-sm text-blue-600">
                                    {transaction.relatedDoc}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {transaction.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {transaction.store}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {transaction.totalQty.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusBadgeClass(transaction.status)}`}>
                                  {transaction.status}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                <div className="flex gap-2">
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    disabled={transaction.status === 'Committed'}
                                    className="h-8 w-8"
                                    title="Edit"
                                    onClick={() => handleActionClick('edit', transaction)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8"
                                    title="View"
                                    onClick={() => handleActionClick('view', transaction)}
                                  >
                                    <FileText className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    disabled={transaction.status === 'Committed'}
                                    title="Delete"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </td>
                            </tr>
                            <tr className="bg-gray-50">
                              <td colSpan={7} className="px-6 py-2 text-sm text-gray-500 border-b">
                                {transaction.description}
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-2 py-4">
            {/* Results info */}
            <div className="text-sm text-gray-700">
              Showing{' '}
              <span className="font-medium">
                {Math.min((currentPage - 1) * pageSize + 1, stockTransactions.length)}
              </span>{' '}
              to{' '}
              <span className="font-medium">
                {Math.min(currentPage * pageSize, stockTransactions.length)}
              </span>{' '}
              of{' '}
              <span className="font-medium">{stockTransactions.length}</span> results
            </div>

            {/* Pagination controls with justify-between */}
            <div className="flex flex-col sm:flex-row items-center gap-4">
              {/* Go to page input */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-700 whitespace-nowrap">Go to page:</span>
                <Input
                  type="number"
                  min={1}
                  max={Math.ceil(stockTransactions.length / pageSize)}
                  value={goToPage}
                  onChange={(e) => setGoToPage(e.target.value)}
                  className="w-20 h-8"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const page = parseInt(goToPage)
                      if (page >= 1 && page <= Math.ceil(stockTransactions.length / pageSize)) {
                        setCurrentPage(page)
                        setGoToPage('')
                      }
                    }
                  }}
                />
              </div>

              {/* Pagination buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  title="First Page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  title="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                {/* Page numbers */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, Math.ceil(stockTransactions.length / pageSize)) }, (_, i) => {
                    const pageNumber = i + 1
                    return (
                      <Button
                        key={pageNumber}
                        variant={currentPage === pageNumber ? "default" : "outline"}
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setCurrentPage(pageNumber)}
                      >
                        {pageNumber}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(prev => 
                    Math.min(prev + 1, Math.ceil(stockTransactions.length / pageSize))
                  )}
                  disabled={currentPage === Math.ceil(stockTransactions.length / pageSize)}
                  title="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setCurrentPage(Math.ceil(stockTransactions.length / pageSize))}
                  disabled={currentPage === Math.ceil(stockTransactions.length / pageSize)}
                  title="Last Page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockInListing