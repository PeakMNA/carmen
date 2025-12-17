"use client"

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Eye,
  Edit,
  Plus,
  CheckCircle,
  XCircle,
  RotateCcw,
  Split,
  Search,
  ChevronDown,
  ChevronRight,
  Package,
  MapPin,
  Calendar,
  DollarSign,
  Building,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { MockPurchaseRequestItem } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Enhanced types with two-level status structure
export type DocumentStatus = 'draft' | 'inprogress' | 'approved' | 'converted' | 'rejected';
export type WorkflowStageStatus = 'draft' | 'pending' | 'approved' | 'review' | 'rejected';
export type WorkflowStageType = 'request' | 'hdApproval' | 'purchaseReview' | 'financeManager' | 'gmApproval';
export type UserRole = "staff" | "hd" | "purchase_staff" | "finance_manager" | "gm";

export interface WorkflowStage {
  status: WorkflowStageStatus;
  assignedTo?: string;
  completedBy?: string;
  completedAt?: Date;
  comments?: string;
  // Stage-specific fields
  approvedQuantity?: number;
  approvedUnit?: string;
  vendorAssigned?: string;
  priceVerified?: boolean;
}

export interface EnhancedPRItem extends Omit<MockPurchaseRequestItem, 'status' | 'estimatedUnitPrice' | 'estimatedTotal'> {
  // Override/add specific fields for the enhanced workflow
  location: string;
  productName: string;
  requestQuantity: number;
  requestUnit: string;
  requiredDate: Date;
  comment: string;

  // Document-level status
  documentStatus: DocumentStatus;

  // Workflow stages with individual statuses
  workflowStages: {
    request: WorkflowStage;
    hdApproval: WorkflowStage;
    purchaseReview: WorkflowStage;
    financeManager: WorkflowStage;
    gmApproval: WorkflowStage;
  };

  // Current active stage
  currentStage: WorkflowStageType | 'completed';

  // Financial fields (hidden from staff) - using simple numbers for UI display
  estimatedUnitPrice?: number;
  estimatedTotalPrice?: number;
  estimatedVendorName?: string;
  priceEstimateSource?: string;
  priceEstimateAccuracy?: number;

  // Purchase staff fields
  purchaserEstimatedPrice?: number;
  purchaserVendorId?: string;
  purchaserNotes?: string;

  // Actual purchase data
  actualUnitPrice?: number;
  actualTotalPrice?: number;
  actualVendorId?: string;
  purchaseDate?: Date;

  // Audit
  createdBy: string;
  lastModifiedBy: string;
  version: number;
}

interface UpdatedEnhancedItemsTabProps {
  items?: EnhancedPRItem[];
  userRole: UserRole;
  onItemUpdate: (itemId: string, updates: Partial<EnhancedPRItem>) => void;
  onBulkAction: (action: string, itemIds: string[]) => void;
  onStageAction: (itemId: string, stage: WorkflowStageType, action: string, data?: any) => void;
}

// Mock data with new structure
const mockEnhancedItems: EnhancedPRItem[] = [
  {
    id: "item-001",
    requestId: "PR-2410-001",
    itemName: "Office Supplies - A4 Paper",
    description: "High quality A4 paper for office use",
    requestedQuantity: 50,
    deliveryLocationId: "LOC-001",
    priority: "normal",
    convertedToPO: false,
    location: "Main Office",
    productName: "Office Supplies - A4 Paper",
    requestQuantity: 50,
    requestUnit: "boxes",
    requiredDate: new Date("2024-02-15"),
    comment: "Urgent requirement for monthly reports",
    documentStatus: "inprogress",
    currentStage: "hdApproval",
    workflowStages: {
      request: {
        status: "approved",
        completedBy: "john.doe",
        completedAt: new Date("2024-01-15"),
        comments: "Initial request submitted"
      },
      hdApproval: {
        status: "pending",
        assignedTo: "hd.manager",
        comments: "Awaiting HD approval"
      },
      purchaseReview: {
        status: "draft"
      },
      financeManager: {
        status: "draft"
      },
      gmApproval: {
        status: "draft"
      }
    },
    estimatedUnitPrice: 25.50,
    estimatedTotalPrice: 1275.00,
    estimatedVendorName: "ABC Supplies Inc.",
    priceEstimateSource: "vendor_quote",
    priceEstimateAccuracy: 85,
    createdBy: "john.doe",
    lastModifiedBy: "john.doe",
    version: 1,
    // Legacy fields for compatibility
    name: "Office Supplies - A4 Paper",
    unit: "boxes",
    quantityRequested: 50,
    quantityApproved: 0,
    deliveryDate: new Date("2024-02-15"),
    deliveryPoint: "Main Office",
    currency: "USD",
    currencyRate: 1,
    price: 25.50,
    foc: false,
    taxIncluded: false,
    adjustments: { tax: true, discount: false },
    discountRate: 0,
    taxRate: 7,
    vendor: "ABC Supplies Inc.",
    pricelistNumber: "PL-2410-001",
    itemCategory: "Office Supplies",
    itemSubcategory: "Paper Products",
    inventoryInfo: {
      onHand: 12,
      onOrdered: 25,
      reorderLevel: 10,
      restockLevel: 50,
      averageMonthlyUsage: 30,
      lastPrice: 24.00,
      lastOrderDate: new Date("2024-01-15"),
      lastVendor: "XYZ Office Mart",
      inventoryUnit: "boxes"
    },
    accountCode: "ACC-001",
    jobCode: "JOB-001",
  },
  {
    id: "item-002",
    requestId: "PR-2410-002",
    itemName: "Computer Equipment - Wireless Mouse",
    description: "Ergonomic wireless mouse with USB receiver",
    requestedQuantity: 10,
    deliveryLocationId: "LOC-002",
    priority: "normal",
    convertedToPO: false,
    location: "IT Department",
    productName: "Computer Equipment - Wireless Mouse",
    requestQuantity: 10,
    requestUnit: "pieces",
    requiredDate: new Date("2024-02-20"),
    comment: "Replacement for damaged equipment",
    documentStatus: "inprogress",
    currentStage: "purchaseReview",
    workflowStages: {
      request: {
        status: "approved",
        completedBy: "jane.smith",
        completedAt: new Date("2024-01-16")
      },
      hdApproval: {
        status: "approved",
        completedBy: "hd.manager",
        completedAt: new Date("2024-01-17"),
        approvedQuantity: 8,
        approvedUnit: "pieces",
        comments: "Approved with reduced quantity"
      },
      purchaseReview: {
        status: "pending",
        assignedTo: "purchase.staff",
        vendorAssigned: "Tech Solutions Ltd.",
        priceVerified: true
      },
      financeManager: {
        status: "draft"
      },
      gmApproval: {
        status: "draft"
      }
    },
    estimatedUnitPrice: 45.00,
    estimatedTotalPrice: 360.00,
    estimatedVendorName: "Tech Solutions Ltd.",
    priceEstimateSource: "catalog_estimate",
    priceEstimateAccuracy: 92,
    purchaserEstimatedPrice: 42.00,
    purchaserVendorId: "vendor-tech-002",
    purchaserNotes: "Found better price with alternative vendor",
    createdBy: "jane.smith",
    lastModifiedBy: "purchase.staff",
    version: 3,
    // Legacy fields
    name: "Computer Equipment - Wireless Mouse",
    unit: "pieces",
    quantityRequested: 10,
    quantityApproved: 8,
    deliveryDate: new Date("2024-02-20"),
    deliveryPoint: "IT Department",
    currency: "USD",
    currencyRate: 1,
    price: 45.00,
    foc: false,
    taxIncluded: false,
    adjustments: { tax: true, discount: false },
    discountRate: 0,
    taxRate: 7,
    vendor: "Tech Solutions Ltd.",
    pricelistNumber: "PL-2410-002",
    itemCategory: "Computer Equipment",
    itemSubcategory: "Peripherals",
    inventoryInfo: {
      onHand: 5,
      onOrdered: 0,
      reorderLevel: 3,
      restockLevel: 15,
      averageMonthlyUsage: 2,
      lastPrice: 48.00,
      lastOrderDate: new Date("2023-12-10"),
      lastVendor: "Computer World",
      inventoryUnit: "pieces"
    },
    accountCode: "ACC-002",
    jobCode: "JOB-002",
  }
];

export function UpdatedEnhancedItemsTab({ 
  items = mockEnhancedItems, 
  userRole = "staff", 
  onItemUpdate,
  onBulkAction,
  onStageAction
}: UpdatedEnhancedItemsTabProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");

  // Role-based permissions
  const permissions = useMemo(() => {
    const canEditAtStage = (item: EnhancedPRItem) => {
      const roleStageMap: Record<UserRole, WorkflowStageType> = {
        staff: 'request',
        hd: 'hdApproval',
        purchase_staff: 'purchaseReview',
        finance_manager: 'financeManager',
        gm: 'gmApproval'
      };
      
      const userStage = roleStageMap[userRole];
      return item.currentStage === userStage && 
             item.workflowStages[userStage].status === 'pending';
    };

    const canViewFinancial = () => {
      return userRole !== "staff";
    };

    const canSplit = () => {
      return ["hd", "purchase_staff"].includes(userRole);
    };

    return { canEditAtStage, canViewFinancial, canSplit };
  }, [userRole]);

  // Filter items based on search and stage
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const matchesSearch = item.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           item.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStage = stageFilter === "all" || item.currentStage === stageFilter;
      return matchesSearch && matchesStage;
    });
  }, [items, searchTerm, stageFilter]);

  // Get stage badge configuration
  const getStageBadge = (item: EnhancedPRItem) => {
    const stageConfig = {
      request: { variant: "secondary" as const, label: "Request", icon: "📝" },
      hdApproval: { variant: "default" as const, label: "HD Approval", icon: "👤" },
      purchaseReview: { variant: "default" as const, label: "Purchase Review", icon: "🛒" },
      financeManager: { variant: "default" as const, label: "Finance Review", icon: "💰" },
      gmApproval: { variant: "default" as const, label: "GM Approval", icon: "✅" },
      completed: { variant: "default" as const, label: "Completed", icon: "🎉" }
    };
    
    const currentStageStatus = item.currentStage !== 'completed' 
      ? item.workflowStages[item.currentStage].status 
      : 'approved';
      
    const statusColorMap = {
      draft: "secondary",
      pending: "default", 
      approved: "default",
      review: "outline",
      rejected: "destructive"
    } as const;
    
    const statusColor = statusColorMap[currentStageStatus];
    
    return {
      ...stageConfig[item.currentStage],
      variant: statusColor,
      status: currentStageStatus
    };
  };

  // Get document status badge
  const getDocumentStatusBadge = (status: DocumentStatus) => {
    const config = {
      draft: { variant: "secondary" as const, label: "Draft" },
      inprogress: { variant: "default" as const, label: "In Progress" },
      approved: { variant: "default" as const, label: "Approved" },
      converted: { variant: "default" as const, label: "Converted" },
      rejected: { variant: "destructive" as const, label: "Rejected" }
    };
    
    return config[status] || config.draft;
  };

  // Handle item selection
  const handleItemSelect = (itemId: string, checked: boolean) => {
    if (checked) {
      setSelectedItems(prev => [...prev, itemId]);
    } else {
      setSelectedItems(prev => prev.filter(id => id !== itemId));
    }
  };

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Handle stage action
  const handleStageAction = (itemId: string, action: string, data?: any) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    const roleStageMap: Record<UserRole, WorkflowStageType> = {
      staff: 'request',
      hd: 'hdApproval',
      purchase_staff: 'purchaseReview',
      finance_manager: 'financeManager',
      gm: 'gmApproval'
    };

    const currentUserStage = roleStageMap[userRole];
    onStageAction?.(itemId, currentUserStage, action, data);
  };

  // Get available bulk actions based on role and selected items
  const getBulkActions = () => {
    const actions = [];
    
    const roleStageMap: Record<UserRole, WorkflowStageType> = {
      staff: 'request',
      hd: 'hdApproval',
      purchase_staff: 'purchaseReview',
      finance_manager: 'financeManager',
      gm: 'gmApproval'
    };
    
    const userStage = roleStageMap[userRole];
    const hasPendingItems = selectedItems.some(id => {
      const item = items.find(i => i.id === id);
      return item && item.currentStage === userStage && 
             item.workflowStages[userStage].status === 'pending';
    });
    
    if (hasPendingItems) {
      actions.push(
        { key: "bulk_approve", label: `Approve Selected (${userStage})` },
        { key: "bulk_review", label: "Send for Review" },
        { key: "bulk_reject", label: "Reject Selected" }
      );
    }

    if (permissions.canSplit()) {
      const hasApprovedItems = selectedItems.some(id => {
        const item = items.find(i => i.id === id);
        return item && item.documentStatus === 'approved';
      });
      
      if (hasApprovedItems) {
        actions.push({ key: "split_approved", label: "Split Approved Items" });
      }
    }

    return actions;
  };

  return (
    <div className="space-y-4">
      {/* Header with filters and actions */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={stageFilter} onValueChange={setStageFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by stage" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Stages</SelectItem>
              <SelectItem value="request">Request</SelectItem>
              <SelectItem value="hdApproval">HD Approval</SelectItem>
              <SelectItem value="purchaseReview">Purchase Review</SelectItem>
              <SelectItem value="financeManager">Finance Review</SelectItem>
              <SelectItem value="gmApproval">GM Approval</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {userRole === "staff" && (
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        )}
      </div>

      {/* Bulk actions toolbar */}
      {selectedItems.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Checkbox
                checked={selectedItems.length === filteredItems.length}
                onCheckedChange={handleSelectAll}
              />
              <span className="text-sm font-medium">
                {selectedItems.length} of {filteredItems.length} items selected
              </span>
            </div>
            
            <div className="flex gap-2">
              {getBulkActions().map(action => (
                <Button
                  key={action.key}
                  variant="outline"
                  size="sm"
                  onClick={() => onBulkAction?.(action.key, selectedItems)}
                >
                  {action.label}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedItems([])}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Items table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Required Date</TableHead>
              <TableHead>Document Status</TableHead>
              <TableHead>Current Stage</TableHead>
              {permissions.canViewFinancial() && (
                <>
                  <TableHead>Est. Price</TableHead>
                  <TableHead>Vendor</TableHead>
                </>
              )}
              <TableHead className="w-24">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => {
              const stageBadge = getStageBadge(item);
              const docStatusBadge = getDocumentStatusBadge(item.documentStatus);
              const isExpanded = expandedItem === item.id;
              
              return (
                <React.Fragment key={item.id}>
                  <TableRow className={isExpanded ? "bg-gray-50" : ""}>
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.includes(item.id)}
                        onCheckedChange={(checked) => handleItemSelect(item.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-gray-400" />
                        <div>
                          <div className="font-medium">{item.productName}</div>
                          <div className="text-sm text-gray-500">{item.comment}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        {item.location}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div>Req: {item.requestQuantity} {item.requestUnit}</div>
                        {item.workflowStages.hdApproval.approvedQuantity && (
                          <div className="text-sm text-green-600">
                            App: {item.workflowStages.hdApproval.approvedQuantity} {item.workflowStages.hdApproval.approvedUnit}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        {item.requiredDate.toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={docStatusBadge.variant}>
                        {docStatusBadge.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={stageBadge.variant}>
                        {stageBadge.icon} {stageBadge.label}
                        {stageBadge.status !== 'approved' && (
                          <span className="ml-1 text-xs">({stageBadge.status})</span>
                        )}
                      </Badge>
                    </TableCell>
                    {permissions.canViewFinancial() && (
                      <>
                        <TableCell>
                          {item.estimatedUnitPrice ? (
                            <div className="space-y-1">
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3 text-gray-400" />
                                ${item.estimatedUnitPrice.toFixed(2)}
                              </div>
                              <div className="text-xs text-gray-500">
                                Total: ${item.estimatedTotalPrice?.toFixed(2)}
                              </div>
                              {item.priceEstimateAccuracy && (
                                <div className="text-xs text-blue-600">
                                  {item.priceEstimateAccuracy}% confidence
                                </div>
                              )}
                            </div>
                          ) : (
                            <span className="text-gray-400">Not allocated</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {item.estimatedVendorName ? (
                            <div className="flex items-center gap-1">
                              <Building className="h-4 w-4 text-gray-400" />
                              <span className="text-sm">{item.estimatedVendorName}</span>
                            </div>
                          ) : (
                            <span className="text-gray-400">Not assigned</span>
                          )}
                        </TableCell>
                      </>
                    )}
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                        >
                          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                        </Button>
                        {permissions.canEditAtStage(item) && (
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                  
                  {/* Expanded detail panel would go here */}
                  {isExpanded && (
                    <TableRow>
                      <TableCell colSpan={permissions.canViewFinancial() ? 10 : 8} className="p-0">
                        <div className="p-6 bg-white border-t">
                          <h4 className="font-medium mb-4">Workflow Progress</h4>
                          <div className="grid grid-cols-5 gap-4">
                            {Object.entries(item.workflowStages).map(([stageName, stage]) => (
                              <div key={stageName} className="text-center">
                                <div className={`w-8 h-8 mx-auto rounded-full flex items-center justify-center text-sm font-medium ${
                                  stage.status === 'approved' ? 'bg-green-100 text-green-800' :
                                  stage.status === 'pending' ? 'bg-blue-100 text-blue-800' :
                                  stage.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                                  stage.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-500'
                                }`}>
                                  {stage.status === 'approved' ? '✓' : 
                                   stage.status === 'pending' ? '⏳' :
                                   stage.status === 'review' ? '🔄' :
                                   stage.status === 'rejected' ? '✗' : '○'}
                                </div>
                                <div className="text-xs mt-1 font-medium">
                                  {stageName.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                </div>
                                <div className="text-xs text-gray-500">{stage.status}</div>
                                {stage.comments && (
                                  <div className="text-xs text-gray-600 mt-1 italic">
                                    &quot;{stage.comments}&quot;
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          {permissions.canEditAtStage(item) && (
                            <div className="mt-4 pt-4 border-t flex gap-2">
                              <Button 
                                size="sm"
                                onClick={() => handleStageAction(item.id, 'approve')}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Approve
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStageAction(item.id, 'review')}
                              >
                                <RotateCcw className="h-4 w-4 mr-2" />
                                Send for Review
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                onClick={() => handleStageAction(item.id, 'reject')}
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })}
          </TableBody>
        </Table>
      </Card>

      {/* Summary */}
      <Card className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Total Items</div>
            <div className="font-semibold">{filteredItems.length}</div>
          </div>
          <div>
            <div className="text-gray-500">In Progress</div>
            <div className="font-semibold">
              {filteredItems.filter(i => i.documentStatus === 'inprogress').length}
            </div>
          </div>
          <div>
            <div className="text-gray-500">Approved</div>
            <div className="font-semibold">
              {filteredItems.filter(i => i.documentStatus === 'approved').length}
            </div>
          </div>
          {permissions.canViewFinancial() && (
            <div>
              <div className="text-gray-500">Est. Total Value</div>
              <div className="font-semibold">
                ${filteredItems.reduce((sum, item) => sum + (item.estimatedTotalPrice || 0), 0).toFixed(2)}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}