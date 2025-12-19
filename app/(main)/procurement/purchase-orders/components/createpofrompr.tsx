"use client";

import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowUpDown, FileText, Package, Building2, Calendar, DollarSign, ChevronRight, Search, CheckCircle2 } from "lucide-react";
import { PurchaseRequest } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Import the actual sample PR data from purchase-requests - using the same data from PR list
const sampleData = [
  {
    id: 'sample-pr-001',
    refNumber: 'PR-2310-001',
    date: new Date('2023-01-01'),
    type: 'goods',
    description: 'Sample purchase request for office supplies',
    requestorId: 'user-1',
    requestor: {
      name: 'John Doe',
      id: 'user-1',
      department: 'Administration'
    },
    status: 'approved',
    location: 'Head Office',
    department: 'Administration',
    jobCode: 'JOB-001',
    estimatedTotal: 1500,
    vendor: 'Office Supplies Co.',
    vendorId: 1,
    deliveryDate: new Date('2023-01-15'),
    currency: 'USD',
    baseCurrencyCode: 'USD',
    baseSubTotalPrice: 1000,
    subTotalPrice: 1000,
    baseNetAmount: 1000,
    netAmount: 1000,
    baseDiscAmount: 0,
    discountAmount: 0,
    baseTaxAmount: 100,
    taxAmount: 100,
    baseTotalAmount: 1100,
    totalAmount: 1100
  },
  {
    id: 'sample-pr-002',
    refNumber: 'PR-2310-002',
    date: new Date('2023-01-02'),
    type: 'goods',
    description: 'IT Equipment and Supplies',
    requestorId: 'user-1',
    requestor: {
      name: 'John Doe',
      id: 'user-1',
      department: 'Administration'
    },
    status: 'approved',
    location: 'Branch Office',
    department: 'IT',
    jobCode: 'JOB-002',
    estimatedTotal: 2500,
    vendor: 'Tech Solutions Inc.',
    vendorId: 2,
    deliveryDate: new Date('2023-01-20'),
    currency: 'USD',
    baseCurrencyCode: 'USD',
    baseSubTotalPrice: 2000,
    subTotalPrice: 2000,
    baseNetAmount: 2000,
    netAmount: 2000,
    baseDiscAmount: 100,
    discountAmount: 100,
    baseTaxAmount: 150,
    taxAmount: 150,
    baseTotalAmount: 2050,
    totalAmount: 2050
  },
  {
    id: 'sample-pr-003',
    refNumber: 'PR-2310-003',
    date: new Date('2023-01-03'),
    type: 'goods',
    description: 'Marketing Materials',
    requestorId: 'user-002',
    requestor: {
      name: 'Jane Smith',
      id: 'user-002',
      department: 'Marketing'
    },
    status: 'approved',
    location: 'Main Office',
    department: 'Marketing',
    jobCode: 'JOB-003',
    estimatedTotal: 3000,
    vendor: 'Marketing Pro Ltd.',
    vendorId: 3,
    deliveryDate: new Date('2023-01-25'),
    currency: 'USD',
    baseCurrencyCode: 'USD',
    baseSubTotalPrice: 2800,
    subTotalPrice: 2800,
    baseNetAmount: 2800,
    netAmount: 2800,
    baseDiscAmount: 140,
    discountAmount: 140,
    baseTaxAmount: 200,
    taxAmount: 200,
    baseTotalAmount: 2860,
    totalAmount: 2860
  },
  {
    id: 'sample-pr-004',
    refNumber: 'PR-2310-004',
    date: new Date('2023-01-04'),
    type: 'goods',
    description: 'Kitchen Equipment',
    requestorId: 'user-003',
    requestor: {
      name: 'Bob Wilson',
      id: 'user-003',
      department: 'Kitchen'
    },
    status: 'approved',
    location: 'Main Kitchen',
    department: 'Kitchen',
    jobCode: 'JOB-004',
    estimatedTotal: 5000,
    vendor: 'Kitchen Pro Equipment',
    vendorId: 4,
    deliveryDate: new Date('2023-02-01'),
    currency: 'USD',
    baseCurrencyCode: 'USD',
    baseSubTotalPrice: 4500,
    subTotalPrice: 4500,
    baseNetAmount: 4500,
    netAmount: 4500,
    baseDiscAmount: 0,
    discountAmount: 0,
    baseTaxAmount: 450,
    taxAmount: 450,
    baseTotalAmount: 4950,
    totalAmount: 4950
  },
  {
    id: 'sample-pr-005',
    refNumber: 'PR-2310-005',
    date: new Date('2023-01-05'),
    type: 'goods',
    description: 'Office Supplies - Stationery',
    requestorId: 'user-1',
    requestor: {
      name: 'John Doe',
      id: 'user-1',
      department: 'Administration'
    },
    status: 'approved',
    location: 'Head Office',
    department: 'Administration',
    jobCode: 'JOB-005',
    estimatedTotal: 800,
    vendor: 'Office Supplies Co.',
    vendorId: 1,
    deliveryDate: new Date('2023-01-25'),
    currency: 'USD',
    baseCurrencyCode: 'USD',
    baseSubTotalPrice: 700,
    subTotalPrice: 700,
    baseNetAmount: 700,
    netAmount: 700,
    baseDiscAmount: 0,
    discountAmount: 0,
    baseTaxAmount: 70,
    taxAmount: 70,
    baseTotalAmount: 770,
    totalAmount: 770
  },
  {
    id: 'sample-pr-006',
    refNumber: 'PR-2310-006',
    date: new Date('2023-01-06'),
    type: 'goods',
    description: 'International Supplies',
    requestorId: 'user-004',
    requestor: {
      name: 'Alice Johnson',
      id: 'user-004',
      department: 'International'
    },
    status: 'approved',
    location: 'International Office',
    department: 'International',
    jobCode: 'JOB-006',
    estimatedTotal: 1200,
    vendor: 'Global Suppliers Ltd.',
    vendorId: 5,
    deliveryDate: new Date('2023-02-05'),
    currency: 'EUR',
    baseCurrencyCode: 'USD',
    baseSubTotalPrice: 1100,
    subTotalPrice: 1100,
    baseNetAmount: 1100,
    netAmount: 1100,
    baseDiscAmount: 0,
    discountAmount: 0,
    baseTaxAmount: 110,
    taxAmount: 110,
    baseTotalAmount: 1210,
    totalAmount: 1210
  },
  {
    id: 'sample-pr-007',
    refNumber: 'PR-2310-007',
    date: new Date('2023-01-07'),
    type: 'goods',
    description: 'European Office Equipment',
    requestorId: 'user-004',
    requestor: {
      name: 'Alice Johnson',
      id: 'user-004',
      department: 'International'
    },
    status: 'approved',
    location: 'International Office',
    department: 'International',
    jobCode: 'JOB-007',
    estimatedTotal: 2500,
    vendor: 'Global Suppliers Ltd.',
    vendorId: 5,
    deliveryDate: new Date('2023-02-10'),
    currency: 'EUR',
    baseCurrencyCode: 'USD',
    baseSubTotalPrice: 2300,
    subTotalPrice: 2300,
    baseNetAmount: 2300,
    netAmount: 2300,
    baseDiscAmount: 100,
    discountAmount: 100,
    baseTaxAmount: 230,
    taxAmount: 230,
    baseTotalAmount: 2430,
    totalAmount: 2430
  }
];

type SortConfig = {
  key: keyof PurchaseRequest;
  direction: "asc" | "desc";
};

interface CreatePOFromPRProps {
  onSelectPRs: (selectedPRs: PurchaseRequest[]) => void;
}

export default function CreatePOFromPR({ onSelectPRs }: CreatePOFromPRProps) {
  const [selectedPRIds, setSelectedPRIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    key: "requestDate",
    direction: "asc",
  });
  const [showSummary, setShowSummary] = useState(false);
  const [poSummary, setPOSummary] = useState<Array<{
    vendor: string;
    vendorId: number;
    currency: string;
    deliveryDate: Date;
    prs: any[];
    totalAmount: number;
  }>>([]);

  const filteredAndSortedPurchaseRequests = useMemo(() => {
    return sampleData
      .filter(
        (pr) =>
          pr.refNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pr.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pr.vendor.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a: any, b: any) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        // Handle undefined values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return 1;
        if (bValue == null) return -1;
        
        if (aValue < bValue)
          return sortConfig.direction === "asc" ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
      });
  }, [searchTerm, sortConfig]);

  const handleSelectPR = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedPRIds([...selectedPRIds, id]);
    } else {
      setSelectedPRIds(selectedPRIds.filter((prId) => prId !== id));
    }
    // Removed problematic updateSelectedPRs call that was closing the dialog
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedPRIds(filteredAndSortedPurchaseRequests.map((pr) => pr.id));
    } else {
      setSelectedPRIds([]);
    }
    // Removed problematic updateSelectedPRs call that was closing the dialog
  };


  const handleSort = (key: any) => {
    setSortConfig((prevConfig) => ({
      key: key as keyof PurchaseRequest,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  // Handle Create button - show summary dialog
  const handleCreateClick = () => {
    const selectedPRs = filteredAndSortedPurchaseRequests.filter(pr => selectedPRIds.includes(pr.id));

    // Group PRs by vendor + currency
    const groupedPRs = selectedPRs.reduce((groups, pr) => {
      const key = `${pr.vendor}-${pr.currency}`;
      if (!groups[key]) {
        groups[key] = {
          vendor: pr.vendor,
          vendorId: pr.vendorId,
          currency: pr.currency,
          deliveryDate: pr.deliveryDate,
          prs: [],
          totalAmount: 0
        };
      }
      groups[key].prs.push(pr);
      groups[key].totalAmount += pr.totalAmount;
      return groups;
    }, {} as Record<string, { vendor: string; vendorId: number; currency: string; deliveryDate: Date; prs: any[]; totalAmount: number }>);

    setPOSummary(Object.values(groupedPRs));
    setShowSummary(true);
  };

  // Confirm and proceed with PO creation
  const handleConfirmCreate = () => {
    const selectedPRs = filteredAndSortedPurchaseRequests.filter(pr => selectedPRIds.includes(pr.id));
    setShowSummary(false);
    onSelectPRs(selectedPRs as any);
  };

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Search Section */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by PR#, description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Selection Table */}
      <ScrollArea className="flex-1 min-h-0 border rounded-lg bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedPRIds.length > 0 &&
                    selectedPRIds.length === filteredAndSortedPurchaseRequests.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="w-[140px]">
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleSort("refNumber")}>
                  PR# <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead className="w-[120px]">
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleSort("date")}>
                  Date <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => handleSort("description")}>
                  Description <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedPurchaseRequests.length > 0 ? (
              filteredAndSortedPurchaseRequests.map((pr) => {
                const isSelected = selectedPRIds.includes(pr.id);

                return (
                  <TableRow
                    key={pr.id}
                    className={`cursor-pointer transition-colors ${isSelected ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-muted/50'}`}
                    onClick={() => handleSelectPR(pr.id, !isSelected)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) =>
                          handleSelectPR(pr.id, checked as boolean)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{pr.refNumber}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {pr.date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </TableCell>
                    <TableCell className="max-w-[400px] truncate">
                      {pr.description}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                  No approved purchase requests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </ScrollArea>

      {/* PO Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader className="flex-shrink-0">
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Purchase Order Summary
            </DialogTitle>
            <DialogDescription>
              Review the Purchase Orders that will be created from the selected PRs
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto min-h-0 -mx-6 px-6">
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 px-4 py-2 rounded-lg">
                <span>{selectedPRIds.length} Purchase Request{selectedPRIds.length > 1 ? 's' : ''} selected</span>
                <ChevronRight className="h-4 w-4" />
                <span className="font-medium text-foreground">{poSummary.length} Purchase Order{poSummary.length > 1 ? 's' : ''} will be created</span>
              </div>

              <div className="space-y-3">
                {poSummary.map((po, index) => (
                  <Card key={index} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="font-mono">
                            PO #{index + 1}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            (will be auto-generated)
                          </span>
                        </div>
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                          {po.currency} {po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-start gap-2">
                          <Building2 className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="text-muted-foreground text-xs">Vendor</div>
                            <div className="font-medium">{po.vendor}</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <div className="text-muted-foreground text-xs">Delivery Date</div>
                            <div className="font-medium">{po.deliveryDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
                          </div>
                        </div>
                      </div>

                      <Separator className="my-3" />

                      <div>
                        <div className="text-xs text-muted-foreground mb-2">Source Purchase Requests:</div>
                        <div className="flex flex-wrap gap-1">
                          {po.prs.map((pr: any) => (
                            <Badge key={pr.id} variant="secondary" className="text-xs">
                              {pr.refNumber}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {poSummary.length > 1 && (
                <div className="flex items-center justify-between text-sm bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-2 text-blue-800">
                    <DollarSign className="h-4 w-4" />
                    <span className="font-medium">Grand Total:</span>
                  </div>
                  <span className="font-bold text-blue-800">
                    {poSummary.reduce((sum, po) => sum + po.totalAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-shrink-0 gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setShowSummary(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmCreate}>
              Confirm & Create {poSummary.length > 1 ? `${poSummary.length} POs` : 'PO'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Footer with selection count and Create button */}
      <div className="flex justify-between items-center mt-4 pt-4 border-t">
        <div className="flex items-center gap-3">
          {selectedPRIds.length > 0 ? (
            <div className="flex items-center gap-2 bg-green-50 text-green-800 px-3 py-1.5 rounded-lg border border-green-200">
              <CheckCircle2 className="h-4 w-4" />
              <span className="text-sm font-medium">
                {selectedPRIds.length} PR{selectedPRIds.length > 1 ? 's' : ''} selected
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Select purchase requests to create PO</span>
            </div>
          )}
        </div>
        <Button
          type="button"
          onClick={handleCreateClick}
          disabled={selectedPRIds.length === 0}
          className="gap-2"
        >
          <Package className="h-4 w-4" />
          Create PO{selectedPRIds.length > 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
}
