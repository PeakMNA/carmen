'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Eye,
  Download,
  BarChart3,
  AlertTriangle
} from 'lucide-react';

interface VendorPricelist {
  id: string;
  pricelistNumber: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  itemCount: number;
  status: 'active' | 'expired' | 'pending' | 'draft';
  lastUpdated: string;
  categories: string[];
  taxProfile: string;
  taxRate: number;
  priceChanges: {
    increased: number;
    decreased: number;
    unchanged: number;
  };
}

interface VendorPricelistsSectionProps {
  vendorId: string;
  vendorName: string;
}

// Mock data for vendor pricelists
const mockVendorPricelists: VendorPricelist[] = [
  {
    id: 'pl-001',
    pricelistNumber: 'PL-2410-001',
    name: 'Q2 2024 Standard Pricing',
    description: 'Standard pricing for Q2 2024 across all product categories',
    startDate: '2024-04-01',
    endDate: '2024-06-30',
    isActive: true,
    itemCount: 245,
    status: 'active',
    lastUpdated: '2024-05-15',
    categories: ['Beach Equipment', 'Furniture', 'Linens', 'Amenities'],
    taxProfile: 'VAT',
    taxRate: 7.0,
    priceChanges: {
      increased: 12,
      decreased: 8,
      unchanged: 225
    }
  },
  {
    id: 'pl-002',
    pricelistNumber: 'PL-2410-002',
    name: 'Summer Sale 2024',
    description: 'Special summer promotional pricing with volume discounts',
    startDate: '2024-06-01',
    endDate: '2024-08-31',
    isActive: true,
    itemCount: 156,
    status: 'active',
    lastUpdated: '2024-06-01',
    categories: ['Beach Equipment', 'Outdoor Furniture'],
    taxProfile: 'VAT',
    taxRate: 7.0,
    priceChanges: {
      increased: 0,
      decreased: 45,
      unchanged: 111
    }
  },
  {
    id: 'pl-003',
    pricelistNumber: 'PL-2410-003',
    name: 'Q1 2024 Pricing',
    description: 'Q1 2024 pricing - now expired',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    isActive: false,
    itemCount: 238,
    status: 'expired',
    lastUpdated: '2024-03-31',
    categories: ['Beach Equipment', 'Furniture', 'Linens', 'Amenities', 'Maintenance'],
    taxProfile: 'None VAT',
    taxRate: 0.0,
    priceChanges: {
      increased: 25,
      decreased: 5,
      unchanged: 208
    }
  },
  {
    id: 'pl-004',
    pricelistNumber: 'PL-2410-004',
    name: 'Q3 2024 Draft Pricing',
    description: 'Draft pricing for Q3 2024 - pending approval',
    startDate: '2024-07-01',
    endDate: '2024-09-30',
    isActive: false,
    itemCount: 267,
    status: 'draft',
    lastUpdated: '2024-06-10',
    categories: ['Beach Equipment', 'Furniture', 'Linens', 'Amenities', 'Seasonal'],
    taxProfile: 'VAT',
    taxRate: 7.0,
    priceChanges: {
      increased: 18,
      decreased: 12,
      unchanged: 237
    }
  }
];

const mockPriceHistory = [
  { period: 'Q1 2024', itemCount: 238, avgPrice: 499.58 },
  { period: 'Q2 2024', itemCount: 245, avgPrice: 511.98 },
  { period: 'Q3 2024', itemCount: 267, avgPrice: 508.61 },
];

export default function VendorPricelistsSection({ vendorId, vendorName }: VendorPricelistsSectionProps) {
  const [pricelists, setPricelists] = useState<VendorPricelist[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setPricelists(mockVendorPricelists);
      setIsLoading(false);
    }, 500);
  }, [vendorId]);

  const activePricelists = pricelists.filter(pl => pl.status === 'active');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <TrendingUp className="h-4 w-4" />;
      case 'expired': return <TrendingDown className="h-4 w-4" />;
      case 'pending': return <Calendar className="h-4 w-4" />;
      case 'draft': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return <div className="p-6">Loading vendor pricelists...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Main Content Tabs */}
      <Tabs defaultValue="current" className="space-y-6">
        <TabsList>
          <TabsTrigger value="current">Current Pricelists</TabsTrigger>
          <TabsTrigger value="history">Price History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Current Price Lists</CardTitle>
              <CardDescription>
                All price lists for {vendorName} with current status and details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pricelist Number</TableHead>
                    <TableHead>Name & Description</TableHead>
                    <TableHead>Period</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Tax Profile</TableHead>
                    <TableHead>Tax Rate</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pricelists.map((pricelist) => (
                    <TableRow key={pricelist.id}>
                      <TableCell>
                        <div className="font-mono text-sm font-medium text-blue-600">
                          {pricelist.pricelistNumber}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{pricelist.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {pricelist.description}
                          </div>
                          <div className="flex space-x-1 mt-1">
                            {pricelist.categories.slice(0, 3).map((category, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {category}
                              </Badge>
                            ))}
                            {pricelist.categories.length > 3 && (
                              <Badge variant="outline" className="text-xs">
                                +{pricelist.categories.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{new Date(pricelist.startDate).toLocaleDateString()}</div>
                          <div className="text-muted-foreground">
                            to {new Date(pricelist.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-center">
                          <div className="font-semibold">{pricelist.itemCount}</div>
                          <div className="text-xs text-muted-foreground">items</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <Badge variant="outline">{pricelist.taxProfile}</Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">
                          {pricelist.taxRate}%
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(pricelist.status)}>
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(pricelist.status)}
                            <span className="capitalize">{pricelist.status}</span>
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(pricelist.lastUpdated).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/vendor-management/pricelists/${pricelist.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Price Changes Summary */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Price Changes</CardTitle>
                <CardDescription>Price change summary across active pricelists</CardDescription>
              </CardHeader>
              <CardContent>
                {activePricelists.map((pricelist) => (
                  <div key={pricelist.id} className="mb-4 last:mb-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium text-sm">{pricelist.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {pricelist.itemCount} items
                      </span>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">Decreased</span>
                        <span>{pricelist.priceChanges.decreased} items</span>
                      </div>
                      <Progress 
                        value={(pricelist.priceChanges.decreased / pricelist.itemCount) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-red-600">Increased</span>
                        <span>{pricelist.priceChanges.increased} items</span>
                      </div>
                      <Progress 
                        value={(pricelist.priceChanges.increased / pricelist.itemCount) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Unchanged</span>
                        <span>{pricelist.priceChanges.unchanged} items</span>
                      </div>
                      <Progress 
                        value={(pricelist.priceChanges.unchanged / pricelist.itemCount) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common actions for vendor pricelists</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full justify-start" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download All Active Pricelists
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Compare Prices with Market
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Request Updated Pricing
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Report Price Discrepancy
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Price History Trends</CardTitle>
              <CardDescription>Historical pricing data for {vendorName}</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Period</TableHead>
                    <TableHead>Item Count</TableHead>
                    <TableHead>Average Price</TableHead>
                    <TableHead>Change</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPriceHistory.map((period, index) => {
                    const prevPeriod = mockPriceHistory[index - 1];
                    const priceChange = prevPeriod ? 
                      ((period.avgPrice - prevPeriod.avgPrice) / prevPeriod.avgPrice) * 100 : 0;
                    
                    return (
                      <TableRow key={period.period}>
                        <TableCell className="font-medium">{period.period}</TableCell>
                        <TableCell>{period.itemCount}</TableCell>
                        <TableCell>${period.avgPrice.toFixed(2)}</TableCell>
                        <TableCell>
                          {index > 0 && (
                            <div className={`flex items-center space-x-1 ${
                              priceChange >= 0 ? 'text-red-600' : 'text-green-600'
                            }`}>
                              {priceChange >= 0 ? 
                                <TrendingUp className="h-4 w-4" /> : 
                                <TrendingDown className="h-4 w-4" />
                              }
                              <span>{Math.abs(priceChange).toFixed(1)}%</span>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
    </div>
  );
}