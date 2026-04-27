'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  VendorPriceManagement,
  VENDOR_STATUSES
} from '@/lib/types/vendor-price-management';
import { formatDate } from '@/lib/utils';

function VendorsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [vendors, setVendors] = useState<VendorPriceManagement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVendors, setSelectedVendors] = useState<string[]>([]);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sorting
  const [sortField, setSortField] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Fetch vendors
  const fetchVendors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query params
      const params = new URLSearchParams();
      
      // Pagination
      params.append('page', page.toString());
      params.append('limit', limit.toString());
      
      // Filters
      if (statusFilter.length > 0) {
        params.append('status', statusFilter.join(','));
      }
      
      if (categoryFilter.length > 0) {
        params.append('categories', categoryFilter.join(','));
      }
      
      if (searchQuery) {
        params.append('query', searchQuery);
      }
      
      // Sorting
      params.append('sortField', sortField);
      params.append('sortDirection', sortDirection);
      
      // Fetch data
      const response = await fetch(`/api/price-management/vendors?${params.toString()}`);
      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || 'Failed to fetch vendors');
      }
      
      setVendors(data.data);
      
      if (data.pagination) {
        setTotal(data.pagination.total);
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching vendors');
      console.error('Error fetching vendors:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Initial fetch
  useEffect(() => {
    fetchVendors();
  }, [page, limit, statusFilter, categoryFilter, searchQuery, sortField, sortDirection]);
  
  // Handle status filter change
  const handleStatusFilterChange = (status: string, checked: boolean) => {
    if (checked) {
      setStatusFilter([...statusFilter, status]);
    } else {
      setStatusFilter(statusFilter.filter(s => s !== status));
    }
    setPage(1); // Reset to first page when filter changes
  };
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset to first page when searching
  };
  
  // Handle sort
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Handle vendor selection
  const handleSelectVendor = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedVendors([...selectedVendors, id]);
    } else {
      setSelectedVendors(selectedVendors.filter(v => v !== id));
    }
  };
  
  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedVendors(vendors.map(v => v.id));
    } else {
      setSelectedVendors([]);
    }
  };
  
  // Navigate to vendor details
  const navigateToVendorDetails = (id: string) => {
    router.push(`/vendor-management/vendors/${id}`);
  };
  
  // Create new vendor
  const handleCreateVendor = () => {
    router.push('/vendor-management/vendors/new');
  };
  
  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  // Calculate total pages
  const totalPages = Math.ceil(total / limit);
  
  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Vendor Management</h1>
        <Button onClick={handleCreateVendor}>Add New Vendor</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Vendor List</CardTitle>
          <CardDescription>
            Manage vendors and their pricelist settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex gap-2">
                <Input
                  placeholder="Search vendors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit">Search</Button>
              </form>
            </div>
            
            <div className="flex gap-2">
              <Select
                value={limit.toString()}
                onValueChange={(value) => {
                  setLimit(Number(value));
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="10 per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Status filter */}
          <div className="flex gap-2 mb-4">
            <span className="font-medium">Status:</span>
            {VENDOR_STATUSES.map((status) => (
              <div key={status} className="flex items-center gap-1">
                <Checkbox
                  id={`status-${status}`}
                  checked={statusFilter.includes(status)}
                  onCheckedChange={(checked) => 
                    handleStatusFilterChange(status, checked === true)
                  }
                />
                <label htmlFor={`status-${status}`} className="text-sm">
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </label>
              </div>
            ))}
          </div>
          
          {/* Error message */}
          {error && (
            <div className="bg-red-100 text-red-800 p-4 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {/* Vendors table */}
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={
                        vendors.length > 0 && 
                        selectedVendors.length === vendors.length
                      }
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('baseVendorId')}
                  >
                    Vendor ID
                    {sortField === 'baseVendorId' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('performanceMetrics.responseRate')}
                  >
                    Response Rate
                    {sortField === 'performanceMetrics.responseRate' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer"
                    onClick={() => handleSort('performanceMetrics.dataQualityScore')}
                  >
                    Quality Score
                    {sortField === 'performanceMetrics.dataQualityScore' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? '↑' : '↓'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead>Last Submission</TableHead>
                  <TableHead>Categories</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading vendors...
                    </TableCell>
                  </TableRow>
                ) : vendors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No vendors found
                    </TableCell>
                  </TableRow>
                ) : (
                  vendors.map((vendor) => (
                    <TableRow key={vendor.id}>
                      <TableCell>
                        <Checkbox
                          checked={selectedVendors.includes(vendor.id)}
                          onCheckedChange={(checked) => 
                            handleSelectVendor(vendor.id, checked === true)
                          }
                        />
                      </TableCell>
                      <TableCell 
                        className="font-medium cursor-pointer hover:underline"
                        onClick={() => navigateToVendorDetails(vendor.id)}
                      >
                        {vendor.baseVendorId}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(vendor.status)}>
                          {vendor.status.charAt(0).toUpperCase() + vendor.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {vendor.performanceMetrics.responseRate.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${vendor.performanceMetrics.dataQualityScore}%` }}
                            ></div>
                          </div>
                          <span>{vendor.performanceMetrics.dataQualityScore}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {vendor.performanceMetrics.lastSubmissionDate 
                          ? formatDate(new Date(vendor.performanceMetrics.lastSubmissionDate))
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {vendor.assignedCategories.slice(0, 2).map((category) => (
                            <Badge key={category} variant="outline">
                              {category}
                            </Badge>
                          ))}
                          {vendor.assignedCategories.length > 2 && (
                            <Badge variant="outline">
                              +{vendor.assignedCategories.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigateToVendorDetails(vendor.id)}
                          >
                            View
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => router.push(`/vendor-management/vendors/${vendor.id}/edit`)}
                          >
                            Edit
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination */}
          {!loading && vendors.length > 0 && (
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Showing {(page - 1) * limit + 1} to {Math.min(page * limit, total)} of {total} vendors
              </div>
              
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="text-sm"
                    >
                      Previous
                    </Button>
                  </PaginationItem>
                  
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (page <= 3) {
                      pageNum = i + 1;
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = page - 2 + i;
                    }
                    
                    return (
                      <PaginationItem key={pageNum}>
                        <Button
                          variant={pageNum === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className="text-sm min-w-[32px]"
                        >
                          {pageNum}
                        </Button>
                      </PaginationItem>
                    );
                  })}
                  
                  {totalPages > 5 && page < totalPages - 2 && (
                    <>
                      <PaginationItem>
                        <PaginationEllipsis />
                      </PaginationItem>
                      <PaginationItem>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(totalPages)}
                          className="text-sm min-w-[32px]"
                        >
                          {totalPages}
                        </Button>
                      </PaginationItem>
                    </>
                  )}
                  
                  <PaginationItem>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="text-sm"
                    >
                      Next
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
          
          {/* Bulk actions */}
          {selectedVendors.length > 0 && (
            <div className="mt-4 p-2 bg-gray-50 rounded-md flex items-center gap-4">
              <span className="text-sm font-medium">
                {selectedVendors.length} vendors selected
              </span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Implement bulk status change
                    alert('Bulk status change not implemented');
                  }}
                >
                  Change Status
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    // Implement bulk category assignment
                    alert('Bulk category assignment not implemented');
                  }}
                >
                  Assign Categories
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={() => {
                    // Implement bulk delete
                    if (confirm('Are you sure you want to delete the selected vendors?')) {
                      alert('Bulk delete not implemented');
                    }
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function VendorsPage() {
  return (
    <Suspense fallback={<div className="p-6">Loading...</div>}>
      <VendorsPageContent />
    </Suspense>
  )
}