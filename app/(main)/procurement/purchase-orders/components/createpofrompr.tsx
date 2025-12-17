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
import { ArrowUpDown } from "lucide-react";
import { PurchaseRequest } from "@/lib/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";

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

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="mb-4 space-y-3">
        <Input
          placeholder="Search PRs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
          <p className="font-medium mb-2">🎯 Grouping Logic:</p>
          <p>PRs with the same <strong>vendor</strong> and <strong>currency</strong> will be grouped into one PO. Each row is color-coded by vendor+currency combination.</p>
        </div>
      </div>
      <ScrollArea className="flex-1 min-h-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedPRIds.length ===
                    filteredAndSortedPurchaseRequests.length
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("refNumber")}>
                  Requisition <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("date")}>
                  Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => handleSort("vendor")}>
                  Vendor <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("description")}
                >
                  Description <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("deliveryDate")}
                >
                  Delivery Date <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>
                <Button
                  variant="ghost"
                  onClick={() => handleSort("totalAmount")}
                >
                  Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
              </TableHead>
              <TableHead>Currency</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedPurchaseRequests.map((pr, index) => {
              // Create a visual grouping by vendor+currency
              const vendorCurrencyKey = `${pr.vendor}-${pr.currency}`;
              const isSelected = selectedPRIds.includes(pr.id);
              const groupColor = vendorCurrencyKey.split('').reduce((a, b) => a + b.charCodeAt(0), 0) % 5;
              const groupStyles = [
                'border-l-4 border-l-blue-200 bg-blue-50/30',
                'border-l-4 border-l-green-200 bg-green-50/30',
                'border-l-4 border-l-purple-200 bg-purple-50/30',
                'border-l-4 border-l-orange-200 bg-orange-50/30',
                'border-l-4 border-l-pink-200 bg-pink-50/30'
              ];
              
              return (
                <TableRow 
                  key={pr.id} 
                  className={`${groupStyles[groupColor]} ${isSelected ? 'bg-primary/5' : ''} hover:bg-muted/20`}
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedPRIds.includes(pr.id)}
                      onCheckedChange={(checked) =>
                        handleSelectPR(pr.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell>{pr.refNumber}</TableCell>
                  <TableCell>{pr.date.toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{pr.vendor}</TableCell>
                  <TableCell>{pr.description}</TableCell>
                  <TableCell>{pr.deliveryDate.toLocaleDateString()}</TableCell>
                  <TableCell className="text-right font-medium">
                    {pr.currency} {pr.totalAmount.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-mono">{pr.currency}</Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-muted-foreground">
          {selectedPRIds.length > 0 && (
            <div>
              <p className="font-medium">Selected PRs will be grouped by vendor and currency:</p>
              {(() => {
                const selectedPRs = filteredAndSortedPurchaseRequests.filter(pr => selectedPRIds.includes(pr.id));
                const groupedPRs = selectedPRs.reduce((groups, pr) => {
                  const key = `${pr.vendor}-${pr.currency}`;
                  if (!groups[key]) {
                    groups[key] = {
                      vendor: pr.vendor,
                      currency: pr.currency,
                      prs: [],
                      totalAmount: 0
                    };
                  }
                  groups[key].prs.push(pr);
                  groups[key].totalAmount += pr.totalAmount;
                  return groups;
                }, {} as Record<string, { vendor: string; currency: string; prs: any[]; totalAmount: number }>);
                
                return (
                  <ul className="mt-2 space-y-1">
                    {Object.values(groupedPRs).map((group, index) => (
                      <li key={index} className="text-xs">
                        • <strong>{group.vendor}</strong> ({group.currency}) - {group.prs.length} PR{group.prs.length > 1 ? 's' : ''} - Total: {group.currency} {group.totalAmount.toFixed(2)}
                      </li>
                    ))}
                  </ul>
                );
              })()}
            </div>
          )}
        </div>
        <Button
          type="button"
          onClick={() => {
            const selectedPRs = filteredAndSortedPurchaseRequests.filter(pr => selectedPRIds.includes(pr.id));
            onSelectPRs(selectedPRs as any);
          }}
          disabled={selectedPRIds.length === 0}
        >
          Create PO{selectedPRIds.length > 0 ? `s (${(() => {
            const selectedPRs = filteredAndSortedPurchaseRequests.filter(pr => selectedPRIds.includes(pr.id));
            const uniqueGroups = new Set(selectedPRs.map(pr => `${pr.vendor}-${pr.currency}`));
            return uniqueGroups.size;
          })()})` : ''}
        </Button>
      </div>
    </div>
  );
}
