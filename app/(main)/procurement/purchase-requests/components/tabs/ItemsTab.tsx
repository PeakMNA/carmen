"use client"

import React, { useState, useMemo, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useSimpleUser } from "@/lib/context/simple-user-context";
import {
  Eye,
  Edit,
  Ban,
  Plus,
  CheckCircle,
  XCircle,
  RotateCcw,
  Split,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Package,
  MapPin,
  CalendarIcon,
  Building2,
  TrendingUp,
  Truck,
  Info,
  AlertTriangle,
  CheckCircle2,
  BarChart3,
  Crown,
  Star,
  Clock,
  Trash2,
  History,
} from "lucide-react";
import { PurchaseRequestItem, PRStatus, asMockPurchaseRequestItem, MockPurchaseRequestItem } from "@/lib/types";
import { mockCurrencies } from "@/lib/mock-data";
import type { User } from "./types";
import { ItemDetailsEditForm } from "../item-details-edit-form";

// Get base currency from mock data
const baseCurrency = mockCurrencies.find(c => c.isBaseCurrency)?.code || 'USD';
import { samplePRItems } from "@/lib/mock-data/purchase-requests";
import { WorkflowDecisionEngine } from "../../services/workflow-decision-engine";
import { NewItemRow } from "./NewItemRow";
import VendorComparison from "../vendor-comparison";
import VendorComparisonView from "../vendor-comparison-view";
import { InventoryDeliveryCard, VendorPricingCard, BusinessDimensionsCard, VendorCard, PricingCard, ConsolidatedItemDetailsCard } from './ItemDetailCards';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ItemsTabProps {
  items: PurchaseRequestItem[];
  currentUser: User;
  onOrderUpdate: (orderId: string, updates: Partial<PurchaseRequestItem | MockPurchaseRequestItem>) => void;
  formMode?: "view" | "edit" | "add";
}

export function ItemsTab({ items = samplePRItems, currentUser, onOrderUpdate, formMode = "view" }: ItemsTabProps) {
  // Get user context for price visibility setting
  const { user } = useSimpleUser();

  // Local state for items to ensure UI updates immediately
  const [localItems, setLocalItems] = useState<PurchaseRequestItem[]>(items);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<PurchaseRequestItem | null>(null);
  const [itemFormMode, setItemFormMode] = useState<"view" | "edit" | "add" | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isTableEditMode, setIsTableEditMode] = useState(formMode === "edit");
  const [expandedTableRows, setExpandedTableRows] = useState<Set<string>>(new Set());
  const [editingRows, setEditingRows] = useState<Set<string>>(new Set());
  const [focusedRow, setFocusedRow] = useState<string | null>(null);
  const [autoExpandedRow, setAutoExpandedRow] = useState<string | null>(null);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [isVendorComparisonOpen, setIsVendorComparisonOpen] = useState(false);
  const [isVendorComparisonViewOpen, setIsVendorComparisonViewOpen] = useState(false);
  const [selectedItemForComparison, setSelectedItemForComparison] = useState<PurchaseRequestItem | null>(null);
  // showPricesOverride state removed - using automatic role-based pricing visibility
  const [isOnHandPopupOpen, setIsOnHandPopupOpen] = useState(false);
  const [isOnOrderPopupOpen, setIsOnOrderPopupOpen] = useState(false);
  const [selectedItemForPopup, setSelectedItemForPopup] = useState<PurchaseRequestItem | null>(null);
  const [isReturnCommentDialogOpen, setIsReturnCommentDialogOpen] = useState(false);
  const [returnComment, setReturnComment] = useState("");
  const [itemsToReturn, setItemsToReturn] = useState<string[]>([]);
  const [isMixedStatusModalOpen, setIsMixedStatusModalOpen] = useState(false);
  const [pendingBulkAction, setPendingBulkAction] = useState<{ action: 'approve' | 'reject' | 'return', analysis: any } | null>(null);
  const [isBulkDateModalOpen, setIsBulkDateModalOpen] = useState(false);
  const [bulkRequiredDate, setBulkRequiredDate] = useState<Date | undefined>();
  const [isAutoExpandEnabled, setIsAutoExpandEnabled] = useState(true);

  // Local state for checkbox overrides
  const [itemAdjustments, setItemAdjustments] = useState<{ [itemId: string]: { tax: boolean, discount: boolean } }>({});

  // Update local items when props change
  useEffect(() => {
    setLocalItems(items);
  }, [items]);

  // Update table edit mode when form mode changes
  useEffect(() => {
    setIsTableEditMode(formMode === "edit");
  }, [formMode]);

  // Get the actual role name from user context (not the role ID)
  const userRoleName = currentUser.context?.currentRole?.name || currentUser.role;

  // Debug: Log current user role
  console.log('ItemsTab - Current user role:', userRoleName, '(ID:', currentUser.role, ')');

  // Role detection logic - Using role NAME from context
  const requestorRoles = ['Staff', 'Requestor', 'Store Staff', 'Chef', 'Counter Staff', 'Executive Chef', 'Warehouse Staff'];
  const approverRoles = ['Department Manager', 'Financial Manager', 'Approver', 'General Manager', 'Finance Director'];
  const purchaserRoles = ['Purchasing Staff', 'Purchaser', 'Procurement Manager', 'Purchasing Agent'];

  const isRequestor = requestorRoles.includes(userRoleName);
  const isApprover = approverRoles.includes(userRoleName);
  const isPurchaser = purchaserRoles.includes(userRoleName);

  // Debug: Log role detection results
  console.log('ItemsTab Role detection:', {
    userRoleName,
    roleId: currentUser.role,
    isRequestor,
    isApprover,
    isPurchaser,
    buttonVisible: isPurchaser || isApprover,
    onPricelistSelectDefined: !!isPurchaser
  });

  // Unit conversion utility function
  const convertToInventoryUnit = (quantity: number, fromUnit: string, toUnit: string, conversionFactor: number = 1): string => {
    if (!quantity || fromUnit === toUnit) return '';
    const converted = quantity * conversionFactor;
    return `(≈ ${converted.toLocaleString()} ${toUnit})`;
  };

  // Enhanced conversion display utilities for prototype
  const getUnitConversionDisplay = (quantity: number, fromUnit: string, inventoryUnit: string = 'pieces', conversionFactor: number = 12): string => {
    if (!quantity || fromUnit === inventoryUnit) return '';
    const converted = quantity * conversionFactor;
    return `(≈ ${converted.toLocaleString()} ${inventoryUnit})`;
  };

  const getCurrencyConversionDisplay = (amount: number, currency: string, baseCurrency: string = 'USD', rate: number = 1): string => {
    if (!amount || currency === baseCurrency) return '';
    const convertedAmount = amount * rate;
    return `${baseCurrency} ${convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const shouldShowUnitConversion = (fromUnit: string, inventoryUnit: string): boolean => {
    return Boolean(fromUnit) && Boolean(inventoryUnit) && fromUnit !== inventoryUnit;
  };

  const shouldShowCurrencyConversion = (currency: string, baseCurrency: string): boolean => {
    return Boolean(currency) && Boolean(baseCurrency) && currency !== baseCurrency;
  };

  const filteredItems = useMemo(() => {
    return localItems.filter((item) => {
      const mockItem = asMockPurchaseRequestItem(item);
      const matchesSearch = mockItem.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        mockItem.location?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });
  }, [localItems, searchTerm]);

  function handleSelectItem(itemId: string | undefined) {
    if (!itemId) return;
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  }

  function handleSelectAllItems() {
    setSelectedItems((prev) =>
      prev.length === filteredItems.length ? [] : filteredItems.map((item) => item.id ?? "")
    );
  }

  function openItemForm(
    item: PurchaseRequestItem | null,
    mode: "view" | "edit" | "add"
  ) {
    if (mode === 'add' && isRequestor) {
      setIsAddingNewItem(true);
    } else {
      setSelectedItem(item);
      setItemFormMode(mode);
    }
  }

  function closeItemForm() {
    setSelectedItem(null);
    setItemFormMode(null);
    setIsAddingNewItem(false);
  }

  function handleSaveItem(formData: PurchaseRequestItem) {
    console.log("Saving item:", formData);
    closeItemForm();
  }

  function handleAddNewItem(newItem: PurchaseRequestItem) {
    console.log("Adding new item:", newItem);
    // Here you would typically call an API to save the new item
    // For now, we'll just log it and close the form
    closeItemForm();
  }


  // Bulk action handler with mixed status checking
  const handleBulkActionWithMixedCheck = (action: 'approve' | 'reject' | 'return') => {
    const analysis = analyzeSelectedItemsStatus();

    // Check if selection has mixed statuses
    const statusCount = [analysis.pending, analysis.approved, analysis.rejected, analysis.review].filter(count => count > 0).length;
    const hasMixedStatus = statusCount > 1;

    if (hasMixedStatus) {
      // Mixed status - show modal to choose scope
      setPendingBulkAction({ action, analysis });
      setIsMixedStatusModalOpen(true);
    } else {
      // All same status - proceed directly
      executeBulkAction(action, 'all');
    }
  };

  // Execute the actual bulk action
  const executeBulkAction = (action: 'approve' | 'reject' | 'return', scope: 'pending-only' | 'all') => {
    const analysis = analyzeSelectedItemsStatus();

    // Determine which items to apply action to
    let targetItems = selectedItems;
    if (scope === 'pending-only') {
      const pendingItems = analysis.items.filter(item => item.status === PRStatus.Draft);
      targetItems = pendingItems.map(item => item.id || '');
    }

    switch (action) {
      case 'approve':
        handleBulkApproveItems(targetItems);
        break;
      case 'reject':
        handleBulkRejectItems(targetItems);
        break;
      case 'return':
        setItemsToReturn(targetItems);
        setIsReturnCommentDialogOpen(true);
        break;
    }
  };

  const handleReturnWithComment = () => {
    console.log(`✓ Returning ${itemsToReturn.length} items with comment:`, returnComment);

    // Update local state immediately for instant UI feedback
    setLocalItems(prevItems =>
      prevItems.map(item =>
        itemsToReturn.includes(item.id || '')
          ? ({ ...item, status: PRStatus.InProgress, comment: returnComment })
          : item
      )
    );

    // Also call parent onOrderUpdate for each item
    itemsToReturn.forEach(itemId => {
      onOrderUpdate(itemId, { status: PRStatus.InProgress, comment: returnComment });
    });

    // Reset state
    setIsReturnCommentDialogOpen(false);
    setReturnComment("");
    setItemsToReturn([]);
    setSelectedItems([]); // Clear selection after action

    console.log(`🎉 Successfully returned ${itemsToReturn.length} items for review`);
  };

  function handleBulkApproveItems(itemIds: string[]) {
    console.log(`✓ Bulk approving ${itemIds.length} items:`, itemIds);

    // Update local state immediately for instant UI feedback
    setLocalItems(prevItems =>
      prevItems.map(item =>
        itemIds.includes(item.id || '')
          ? { ...item, status: PRStatus.Approved }
          : item
      )
    );

    // Also call parent onOrderUpdate
    itemIds.forEach(itemId => {
      onOrderUpdate(itemId, { status: PRStatus.Approved });
    });

    setSelectedItems([]); // Clear selection after action
    console.log(`🎉 Successfully approved ${itemIds.length} items`);
  }

  function handleBulkRejectItems(itemIds: string[]) {
    console.log(`✓ Bulk rejecting ${itemIds.length} items:`, itemIds);

    // Update local state immediately for instant UI feedback
    setLocalItems(prevItems =>
      prevItems.map(item =>
        itemIds.includes(item.id || '')
          ? { ...item, status: PRStatus.Cancelled }
          : item
      )
    );

    // Also call parent onOrderUpdate
    itemIds.forEach(itemId => {
      onOrderUpdate(itemId, { status: PRStatus.Cancelled });
    });

    setSelectedItems([]); // Clear selection after action
    console.log(`🎉 Successfully rejected ${itemIds.length} items`);
  }

  // handleBulkReturnItems removed - now using handleReturnWithComment

  function handleBulkSplit() {
    console.log("Bulk splitting items:", selectedItems);
    // This would open a modal to split selected items into multiple line items
  }

  function handleBulkSetRequiredDate() {
    console.log("Setting required date for items:", selectedItems);
    setIsBulkDateModalOpen(true);
  }

  function handleBulkDateConfirm() {
    if (!bulkRequiredDate || selectedItems.length === 0) return;

    console.log(`✓ Setting required date for ${selectedItems.length} items to:`, bulkRequiredDate);

    // Update local state immediately for instant UI feedback
    setLocalItems(prevItems =>
      prevItems.map(item =>
        selectedItems.includes(item.id || '')
          ? { ...item, deliveryDate: bulkRequiredDate }
          : item
      )
    );

    // Also call parent onOrderUpdate for each selected item
    selectedItems.forEach(itemId => {
      onOrderUpdate(itemId, { deliveryDate: bulkRequiredDate });
    });

    setIsBulkDateModalOpen(false);
    setBulkRequiredDate(undefined);
    setSelectedItems([]); // Clear selection after action
    console.log(`🎉 Successfully set required date for ${selectedItems.length} items`);
  }

  function handleToggleTableExpand(itemId: string) {
    const newExpanded = new Set(expandedTableRows);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedTableRows(newExpanded);
  }

  function handleRowMouseEnter(itemId: string) {
    // Only auto-expand if not already manually expanded and auto-expand is enabled
    if (!expandedTableRows.has(itemId) && isAutoExpandEnabled) {
      setFocusedRow(itemId);
      setAutoExpandedRow(itemId);
    } else if (isAutoExpandEnabled) {
      setFocusedRow(itemId);
    }
  }

  function handleRowMouseLeave() {
    setFocusedRow(null);
    setAutoExpandedRow(null);
  }

  function handleToggleRowEdit(itemId: string) {
    const newEditing = new Set(editingRows);
    if (newEditing.has(itemId)) {
      newEditing.delete(itemId);
    } else {
      newEditing.add(itemId);
    }
    setEditingRows(newEditing);
  }

  function handleSaveRowEdit(itemId: string) {
    // Remove from editing state
    const newEditing = new Set(editingRows);
    newEditing.delete(itemId);
    setEditingRows(newEditing);
    console.log(`✓ Saved inline edits for item: ${itemId}`);
  }

  function handleCancelRowEdit(itemId: string) {
    // Remove from editing state and potentially revert changes
    const newEditing = new Set(editingRows);
    newEditing.delete(itemId);
    setEditingRows(newEditing);
    console.log(`✗ Cancelled inline edits for item: ${itemId}`);
  }

  const handleOnHandClick = (item: PurchaseRequestItem) => {
    setSelectedItemForPopup(item);
    setIsOnHandPopupOpen(true);
  };

  const handleOnOrderClick = (item: PurchaseRequestItem) => {
    setSelectedItemForPopup(item);
    setIsOnOrderPopupOpen(true);
  };

  // Action handlers for status changes
  function handleApproveItem(itemId: string) {
    const item = filteredItems.find(i => i.id === itemId);
    const mockItem = item ? asMockPurchaseRequestItem(item) : null;
    console.log(`✓ Approving item: ${mockItem?.name} (${itemId})`);

    // Update local state immediately
    setLocalItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, status: PRStatus.Approved }
          : item
      )
    );

    // Also call parent onOrderUpdate
    onOrderUpdate(itemId, { status: PRStatus.Approved });
    console.log(`🎉 Successfully approved item: ${mockItem?.name}`);
  }

  function handleRejectItem(itemId: string) {
    const item = filteredItems.find(i => i.id === itemId);
    const mockItem = item ? asMockPurchaseRequestItem(item) : null;
    console.log(`✓ Rejecting item: ${mockItem?.name} (${itemId})`);

    // Update local state immediately
    setLocalItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId
          ? { ...item, status: PRStatus.Cancelled }
          : item
      )
    );

    // Also call parent onOrderUpdate
    onOrderUpdate(itemId, { status: PRStatus.Cancelled });
    console.log(`🎉 Successfully rejected item: ${mockItem?.name}`);
  }

  // handleReviewItem function removed - 'Send for Review' option no longer available

  function handleReturnItem(itemId: string) {
    setItemsToReturn([itemId]);
    setIsReturnCommentDialogOpen(true);
  }

  function handleDeleteItem(itemId: string) {
    console.log("Item deleted:", itemId);
    // onOrderUpdate would be called here in real implementation to remove the item
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Approved': return 'default';
      case 'Review': return 'secondary';
      case 'Rejected': return 'destructive';
      case 'Pending': return 'outline';
      default: return 'outline';
    }
  };

  const handleItemChange = (itemId: string, field: any, value: any) => {
    onOrderUpdate(itemId, { [field]: value });
  };

  // Helper functions for managing adjustment state
  const getItemAdjustments = (itemId: string) => {
    return itemAdjustments[itemId] || { tax: false, discount: false };
  };

  const updateItemAdjustments = (itemId: string, field: 'tax' | 'discount', value: boolean) => {
    const currentAdjustments = getItemAdjustments(itemId);
    const newAdjustments = { ...currentAdjustments, [field]: value };

    setItemAdjustments(prev => ({
      ...prev,
      [itemId]: newAdjustments
    }));

    // Also update the parent component
    handleItemChange(itemId, 'adjustments', newAdjustments);

    console.log(`Updated ${field} for item ${itemId}:`, newAdjustments);
  };

  const mockLocations = useMemo(() => [...new Set(localItems.map(i => asMockPurchaseRequestItem(i).location).filter((loc): loc is string => loc !== undefined))], [localItems]);
  const mockProducts = useMemo(() => [...new Set(localItems.map(i => asMockPurchaseRequestItem(i).name).filter((name): name is string => name !== undefined))], [localItems]);
  const mockUnits = ["pieces", "kg", "g", "bags", "boxes", "units", "liters", "ml", "meters", "cm", "pairs", "sets"];

  // Mock data for on-hand by location
  const mockOnHandByLocation = [
    { location: "Main Kitchen", quantity: 25, unit: "kg", lastUpdated: "2024-01-15" },
    { location: "Storage Room", quantity: 150, unit: "kg", lastUpdated: "2024-01-14" },
    { location: "Cold Room", quantity: 75, unit: "kg", lastUpdated: "2024-01-16" },
    { location: "Dry Storage", quantity: 50, unit: "kg", lastUpdated: "2024-01-13" },
    { location: "Prep Area", quantity: 10, unit: "kg", lastUpdated: "2024-01-16" }
  ];

  // Mock data for purchase orders
  const mockPurchaseOrders = [
    {
      poNumber: "PO-2410-001",
      vendor: "Fresh Foods Ltd",
      orderDate: "2024-01-10",
      expectedDate: "2024-01-20",
      quantity: 100,
      unit: "kg",
      status: "Pending",
      unitPrice: 12.50,
      totalAmount: 1250.00
    },
    {
      poNumber: "PO-2410-015",
      vendor: "Quality Suppliers",
      orderDate: "2024-01-12",
      expectedDate: "2024-01-22",
      quantity: 50,
      unit: "kg",
      status: "Confirmed",
      unitPrice: 11.80,
      totalAmount: 590.00
    },
    {
      poNumber: "PO-2410-028",
      vendor: "Bulk Foods Inc",
      orderDate: "2024-01-14",
      expectedDate: "2024-01-25",
      quantity: 75,
      unit: "kg",
      status: "In Transit",
      unitPrice: 13.20,
      totalAmount: 990.00
    }
  ];

  // Return steps data removed - now using simple comment-based return

  // Helper function to analyze selected items status mix
  const analyzeSelectedItemsStatus = () => {
    const selectedItemsData = filteredItems.filter(item => selectedItems.includes(item.id || ""));

    const statusCounts = selectedItemsData.reduce((acc, item) => {
      acc[item.status] = (acc[item.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: selectedItemsData.length,
      pending: statusCounts.Pending || 0,
      approved: statusCounts.Approved || 0,
      rejected: statusCounts.Rejected || 0,
      review: statusCounts.Review || 0,
      statuses: Object.keys(statusCounts),
      items: selectedItemsData
    };
  };


  // Get available actions for individual items using WorkflowDecisionEngine
  const getAvailableItemActions = (item: PurchaseRequestItem, userRole: string) => {
    const workflowState = WorkflowDecisionEngine.getItemWorkflowState(
      item,
      userRole,
      'departmentHeadApproval' // Current workflow stage - could be dynamic
    );

    return workflowState.availableActions;
  };

  // Date picker component
  const DatePickerField = ({ value, onChange, placeholder = "Pick a date" }: {
    value?: Date;
    onChange: (date: Date | undefined) => void;
    placeholder?: string;
  }) => {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-full justify-start text-left font-normal",
              !value && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value ? format(value, "dd/MM/yyyy") : <span>{placeholder}</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    );
  };

  // Delivery point options
  const deliveryPointOptions = [
    { value: "Main Kitchen Loading Dock", label: "Main Kitchen Loading Dock" },
    { value: "Cold Storage Room A", label: "Cold Storage Room A" },
    { value: "Dry Storage Area", label: "Dry Storage Area" },
    { value: "Mechanical Room Loading", label: "Mechanical Room Loading" },
    { value: "Pool Equipment Room", label: "Pool Equipment Room" },
    { value: "Housekeeping Storage Level 3", label: "Housekeeping Storage Level 3" },
    { value: "Rooftop Bar Storage", label: "Rooftop Bar Storage" },
    { value: "Rooftop Bar", label: "Rooftop Bar" },
    { value: "Front Office Storage", label: "Front Office Storage" },
    { value: "Generator Room", label: "Generator Room" },
    { value: "Pastry Kitchen Loading Area", label: "Pastry Kitchen Loading Area" },
    { value: "International Pantry Storage", label: "International Pantry Storage" },
    { value: "Cold Storage Premium", label: "Cold Storage Premium" },
    { value: "Training Kitchen Storage", label: "Training Kitchen Storage" },
    { value: "Seasonal Storage Area", label: "Seasonal Storage Area" },
    { value: "Other", label: "Other" }
  ];

  const renderMobileCardView = () => (
    <div className="space-y-4">
      {isAddingNewItem && (
        <Card>
          <CardContent className="p-4">
            <NewItemRow
              onSave={handleAddNewItem}
              onCancel={closeItemForm}
              locations={mockLocations}
              products={mockProducts}
              units={mockUnits}
              showPricing={!isRequestor || (user?.context.showPrices === true)}
            />
          </CardContent>
        </Card>
      )}
      {filteredItems.map((item) => {
        const mockItem = asMockPurchaseRequestItem(item);
        // Use the already-computed role detection values from above
        const itemIsRequestor = isRequestor;
        // Price visibility: Requestors use user settings, Approvers/Purchasers always see prices
        const canSeePrices = isRequestor ?
          (user?.context.showPrices === true) :
          true; // Approvers and Purchasers always see prices
        const isItemEditable = formMode === "edit";

        return (
          <Card key={item.id} className={`relative transition-all duration-200 ${formMode === "edit" ? 'ring-2 ring-amber-300 bg-amber-50/20 shadow-md' : 'hover:shadow-md'}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={selectedItems.includes(item.id || "")}
                    onCheckedChange={() => handleSelectItem(item.id || "")}
                  />
                  <div className="flex flex-col">
                    <span className="font-semibold text-xs">{mockItem.name}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(item.status)} className="text-xs px-2 py-1">
                  {item.status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-xs text-muted-foreground">Location</p>
                  <p className="font-medium text-sm">{mockItem.location}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Quantity</p>
                  <p className="font-medium text-sm">{mockItem.quantityRequested} {item.unit}</p>
                  {mockItem.quantityApproved && (
                    <p className="text-xs text-green-600">Approved: {mockItem.quantityApproved}</p>
                  )}
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Delivery</p>
                  <p className="font-medium text-sm">{mockItem.deliveryDate ? format(mockItem.deliveryDate, "dd/MM") : "TBD"}</p>
                </div>
              </div>


              <div className="flex items-center justify-end">
                {!itemIsRequestor && (
                  <div className="flex-1 text-xs text-muted-foreground">
                    Vendor: {mockItem.vendor || "Not assigned"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderTableView = () => (
    <Card>
      <div className="rounded-md border overflow-hidden">
        {/* Auto Expand Toggle */}
        <div className="px-4 py-2 border-b bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isAutoExpandEnabled}
                onChange={(e) => setIsAutoExpandEnabled(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
              />
              Auto-expand on hover
            </label>
          </div>
        </div>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-muted/50 border-b-2 border-muted">
                <TableHead className="w-[40px] text-center">
                  <Checkbox
                    checked={selectedItems.length === filteredItems.length && filteredItems.length > 0}
                    onCheckedChange={handleSelectAllItems}
                  />
                </TableHead>
                <TableHead className="w-[80px] text-center font-semibold">#</TableHead>
                <TableHead className="font-semibold text-left min-w-[140px]">Location & Status</TableHead>
                <TableHead className="font-semibold text-left min-w-[200px]">Product Details</TableHead>
                <TableHead className="font-semibold min-w-[120px] !text-center">Requested</TableHead>
                <TableHead className="font-semibold min-w-[120px] !text-center">Approved</TableHead>
                <TableHead className="font-semibold min-w-[100px] text-center">Date Required</TableHead>
                <TableHead className="font-semibold min-w-[140px] text-center">Delivery Point</TableHead>
                {/* Pricing column: Always visible for approvers/purchasers, user setting for requestors */}
                {(!isRequestor || (isRequestor && (user?.context.showPrices === true))) && (
                  <TableHead className="font-semibold text-right min-w-[120px]">Pricing</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isAddingNewItem && (
                <NewItemRow
                  onSave={handleAddNewItem}
                  onCancel={closeItemForm}
                  locations={mockLocations}
                  products={mockProducts}
                  units={mockUnits}
                  showPricing={!isRequestor || (user?.context.showPrices === true)}
                />
              )}
              {filteredItems.map((item, index) => {
                const mockItem = asMockPurchaseRequestItem(item);
                const isManuallyExpanded = expandedTableRows.has(item.id || "");
                const isAutoExpanded = autoExpandedRow === item.id;
                const isExpanded = isManuallyExpanded || isAutoExpanded;
                // Use the already-computed role detection values from above
                const itemIsRequestor = isRequestor;
                const itemIsApprover = isApprover;
                const itemIsPurchaser = isPurchaser;
                // Price visibility: Requestors use user settings, Approvers/Purchasers always see prices
                const canSeePrices = isRequestor ?
                  (user?.context.showPrices === true) :
                  true; // Approvers and Purchasers always see prices
                const isRowEditing = editingRows.has(item.id || "");
                const isItemEditable = formMode === "edit";

                return (
                  <>
                    <TableRow
                      key={item.id}
                      className={cn(
                        "group transition-all duration-200 border-b border-gray-200 cursor-pointer",
                        "hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-25",
                        focusedRow === item.id && "bg-gradient-to-r from-blue-100 to-blue-50 border-blue-300 shadow-sm ring-1 ring-blue-200",
                        isExpanded && "bg-slate-50 border-slate-300 bg-gradient-to-r from-slate-100 to-slate-50"
                      )}
                      onMouseEnter={() => handleRowMouseEnter(item.id || "")}
                      onMouseLeave={handleRowMouseLeave}
                      onClick={() => handleToggleTableExpand(item.id || "")}
                    >
                      <TableCell className="text-center py-3 align-top" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedItems.includes(item.id || "")}
                          onCheckedChange={() => handleSelectItem(item.id || "")}
                        />
                      </TableCell>
                      <TableCell className="py-2 text-center align-top">
                        <div className="flex items-center justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className={cn(
                              "h-6 w-6 p-0 rounded-md transition-all duration-200 hover:bg-gray-100",
                              isExpanded && "bg-slate-200 hover:bg-slate-300"
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleTableExpand(item.id || "");
                            }}
                          >
                            {isExpanded ? (
                              <ChevronDown className="h-3 w-3 text-gray-700" />
                            ) : (
                              <ChevronRight className="h-3 w-3 text-gray-600" />
                            )}
                          </Button>
                          <div className="text-sm font-medium text-gray-600 min-w-[16px]">
                            {index + 1}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 align-top" onClick={(e) => e.stopPropagation()}>
                        {isItemEditable && itemIsRequestor ? (
                          <Select value={mockItem.location || ""} onValueChange={(value) => item.id && handleItemChange(item.id, 'location', value)}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Select location" /></SelectTrigger>
                            <SelectContent>
                              {mockLocations.map(loc => <SelectItem key={loc} value={loc}>{loc}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <MapPin className="h-4 w-4 text-blue-500/70 flex-shrink-0" />
                              <div className="font-medium text-sm">{mockItem.location}</div>
                            </div>
                            <div>
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "text-xs px-1.5 py-0.5 font-normal inline-flex items-center gap-1",
                                  item.status === PRStatus.Approved && "bg-green-100 text-green-700 border-green-200",
                                  item.status === PRStatus.InProgress && "bg-yellow-100 text-yellow-700 border-yellow-200",
                                  item.status === PRStatus.Cancelled && "bg-red-100 text-red-700 border-red-200",
                                  item.status === PRStatus.Draft && "bg-gray-100 text-gray-600 border-gray-200"
                                )}
                              >
                                {item.status === PRStatus.Approved && <CheckCircle className="h-3 w-3" />}
                                {item.status === PRStatus.InProgress && <RotateCcw className="h-3 w-3" />}
                                {item.status === PRStatus.Cancelled && <XCircle className="h-3 w-3" />}
                                {item.status === PRStatus.Draft && <Clock className="h-3 w-3" />}
                                {item.status}
                              </Badge>
                            </div>

                            {/* Comment section - Compact row spanning panel */}
                            {(mockItem.comment || isItemEditable) && (
                              <div className="mt-2 relative">
                                <div className={cn(
                                  "absolute left-0 z-10 grid grid-cols-12 gap-2",
                                  canSeePrices
                                    ? "right-[-800px]" // Span much wider to cover full expanded panel
                                    : "right-[-700px]" // Span much wider when pricing not visible
                                )}>
                                  {/* Comment - Takes up full width */}
                                  <div className="col-span-12">
                                    {isItemEditable ? (
                                      <Textarea
                                        value={mockItem.comment || ""}
                                        onChange={(e) => item.id && handleItemChange(item.id, 'comment', e.target.value)}
                                        placeholder="Add a comment..."
                                        className="min-h-[32px] text-xs resize-none border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 transition-all duration-200 w-full bg-white shadow-sm"
                                      />
                                    ) : (
                                      <div className="bg-gray-50 p-2 rounded border border-gray-200 shadow-sm min-h-[32px]">
                                        <p className="text-xs text-gray-700 leading-tight">{mockItem.comment || ""}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {/* Spacer to maintain row height */}
                                <div className="h-[50px]"></div>
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="py-2 align-top" onClick={(e) => e.stopPropagation()}>
                        {isItemEditable && itemIsRequestor ? (
                          <Select value={mockItem.name || ""} onValueChange={(value) => item.id && handleItemChange(item.id, 'name', value)}>
                            <SelectTrigger className="w-full"><SelectValue placeholder="Select product" /></SelectTrigger>
                            <SelectContent>
                              {mockProducts.map(prod => <SelectItem key={prod} value={prod}>{prod}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="min-w-0">
                            <div className="font-semibold text-xs leading-tight">{mockItem.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</div>
                          </div>
                        )}
                      </TableCell>
                      {/* Requested Quantity Column */}
                      <TableCell className="py-2 align-top !text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center justify-center space-y-1 w-full">
                          {isItemEditable && itemIsRequestor ? (
                            <div className="flex items-center gap-1 justify-center">
                              <Input type="number" step="0.00001" value={mockItem.quantityRequested?.toFixed(5) || ""} onChange={(e) => item.id && handleItemChange(item.id, 'quantityRequested', parseFloat(e.target.value))} className="h-8 w-20 text-center" />
                              <Select value={item.unit || ""} onValueChange={(value) => item.id && handleItemChange(item.id, 'unit', value)}>
                                <SelectTrigger className="h-8 w-20"><SelectValue placeholder="Unit" /></SelectTrigger>
                                <SelectContent>
                                  {mockUnits.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center">
                              <div className="text-xs font-medium text-center">{mockItem.quantityRequested?.toFixed(5) || '0.00000'}</div>
                              <div className="text-xs text-gray-500 text-center">{item.unit}</div>
                              {/* Show unit conversion if different from inventory unit */}
                              {mockItem.quantityRequested && item.unit && mockItem.inventoryInfo?.inventoryUnit &&
                                shouldShowUnitConversion(item.unit, mockItem.inventoryInfo.inventoryUnit) && (
                                  <div className="text-xs text-muted-foreground text-center">
                                    {getUnitConversionDisplay(mockItem.quantityRequested, item.unit, mockItem.inventoryInfo.inventoryUnit)}
                                  </div>
                                )}
                            </div>
                          )}
                        </div>
                      </TableCell>

                      {/* Approved Quantity Column */}
                      <TableCell className="py-2 align-top !text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex flex-col items-center justify-center space-y-1 w-full">
                          {isItemEditable && (itemIsApprover || itemIsPurchaser) ? (
                            <div className="flex items-center gap-1 justify-center">
                              <Input type="number" step="0.00001" value={mockItem.quantityApproved?.toFixed(5) || ""} onChange={(e) => item.id && handleItemChange(item.id, 'quantityApproved', parseFloat(e.target.value))} className="h-8 w-24 text-center" placeholder="0.00000" />
                              <span className="text-xs text-gray-600">{item.unit}</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center">
                              {mockItem.quantityApproved ? (
                                <>
                                  <div className="text-xs font-medium text-green-700 text-center">{mockItem.quantityApproved?.toFixed(5) || '0.00000'}</div>
                                  <div className="text-xs text-gray-500 text-center">{item.unit}</div>
                                  {/* Show unit conversion if different from inventory unit */}
                                  {mockItem.quantityApproved && item.unit && mockItem.inventoryInfo?.inventoryUnit &&
                                    shouldShowUnitConversion(item.unit, mockItem.inventoryInfo.inventoryUnit) && (
                                      <div className="text-xs text-muted-foreground text-center">
                                        {getUnitConversionDisplay(mockItem.quantityApproved, item.unit, mockItem.inventoryInfo.inventoryUnit)}
                                      </div>
                                    )}
                                </>
                              ) : (
                                <div className="text-xs text-gray-400 italic text-center">Pending</div>
                              )}
                            </div>
                          )}
                          {/* FOC field below approved quantity - Hidden for requestors and approvers, only visible for purchasers */}
                          {itemIsPurchaser && (() => {
                            // FOC is typed as boolean but used as number (FOC Quantity) - handle both cases
                            const rawFocValue = mockItem.foc as unknown;
                            let focValue: number | undefined;
                            if (typeof rawFocValue === 'number') {
                              focValue = rawFocValue;
                            } else if (typeof rawFocValue === 'string' && rawFocValue !== '') {
                              focValue = parseFloat(rawFocValue);
                            } else {
                              focValue = undefined;
                            }
                            const focDisplay = focValue !== undefined && !isNaN(focValue) ? focValue.toFixed(5) : "";
                            const focDisplayShort = focValue !== undefined && !isNaN(focValue) ? focValue.toFixed(3) : '0.000';

                            return (
                              <div className="pt-1 border-t border-gray-200 mt-2 flex flex-col items-center">
                                {isItemEditable ? (
                                  <div className="flex items-center gap-1 justify-center">
                                    <span className="text-xs text-gray-500">FOC:</span>
                                    <Input
                                      type="number"
                                      value={focDisplay}
                                      onChange={(e) => item.id && handleItemChange(item.id, 'foc', parseFloat(e.target.value))}
                                      className="h-6 w-20 text-center text-xs"
                                      step="0.00001"
                                      placeholder="0"
                                    />
                                    <Select value={item.unit || ""} onValueChange={(value) => item.id && handleItemChange(item.id, 'unit', value)}>
                                      <SelectTrigger className="h-6 w-20 text-xs"><SelectValue placeholder="Unit" /></SelectTrigger>
                                      <SelectContent>
                                        {mockUnits.map(unit => <SelectItem key={unit} value={unit}>{unit}</SelectItem>)}
                                      </SelectContent>
                                    </Select>
                                  </div>
                                ) : (
                                  <div className="text-xs font-medium text-green-700 text-center">FOC: {focDisplayShort} {item.unit}</div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </TableCell>

                      {/* Date Required Column */}
                      <TableCell className="py-2 align-top text-center" onClick={(e) => e.stopPropagation()}>
                        {isItemEditable && itemIsRequestor ? (
                          <DatePickerField
                            value={mockItem.deliveryDate}
                            onChange={(date) => item.id && handleItemChange(item.id, 'deliveryDate', date)}
                            placeholder="Select date"
                          />
                        ) : (
                          <div className="text-xs text-gray-700 font-medium text-center">
                            {mockItem.deliveryDate ? format(mockItem.deliveryDate, "dd/MM/yyyy") : "Not specified"}
                          </div>
                        )}
                      </TableCell>

                      {/* Delivery Point Column */}
                      <TableCell className="py-2 align-top text-center" onClick={(e) => e.stopPropagation()}>
                        {isItemEditable && (itemIsRequestor || itemIsPurchaser) ? (
                          <Select value={mockItem.deliveryPoint || ""} onValueChange={(value) => item.id && handleItemChange(item.id, 'deliveryPoint', value)}>
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue placeholder="Select point" />
                            </SelectTrigger>
                            <SelectContent>
                              {deliveryPointOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="text-xs text-gray-700 font-medium text-center">
                            {mockItem.deliveryPoint || "Not specified"}
                          </div>
                        )}
                      </TableCell>

                      {canSeePrices && (
                        <TableCell className="py-2 text-right align-top">
                          <div className="space-y-1">
                            <div className="font-semibold text-sm text-right">{(mockItem.totalAmount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            <div className="text-xs text-gray-500 text-right">{mockItem.currency}</div>
                            {/* Show currency conversion if different from base currency */}
                            {mockItem.totalAmount && mockItem.currency && mockItem.baseCurrency &&
                              shouldShowCurrencyConversion(mockItem.currency, mockItem.baseCurrency) && (
                                <div className="text-xs text-green-700 mt-1 text-right">
                                  {getCurrencyConversionDisplay(mockItem.totalAmount, mockItem.currency, mockItem.baseCurrency, mockItem.currencyRate)}
                                </div>
                              )}
                          </div>
                        </TableCell>
                      )}

                    </TableRow>


                    {/* Full expanded view with progressive disclosure - only when chevron is clicked */}
                    {isExpanded && (
                      <TableRow className={cn(
                        "border-b transition-all duration-300 relative",
                        isManuallyExpanded
                          ? "bg-gradient-to-br from-slate-50 to-slate-100 border-slate-400"
                          : "bg-gradient-to-br from-blue-25 to-blue-50 border-blue-200",
                        "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:transition-all before:duration-300",
                        isManuallyExpanded
                          ? "before:bg-slate-400"
                          : "before:bg-blue-400"
                      )}>
                        <TableCell colSpan={canSeePrices ? 8 : 7} className={cn(
                          "py-3 transition-all duration-300",
                          isManuallyExpanded ? "py-4" : "py-3"
                        )}>
                          <div className="relative">
                            {/* Content with enhanced visual hierarchy */}
                            {isExpanded && (
                              <div className="px-1 py-1">

                                {/* Consolidated Item Details Card */}
                                <div>
                                  {(() => {
                                    const detailMockItem = asMockPurchaseRequestItem(item);
                                    return (
                                      <ConsolidatedItemDetailsCard
                                        // Vendor & Pricing props
                                        vendor={detailMockItem.vendor || "Premium Food Suppliers Inc."}
                                        pricelistNumber={detailMockItem.pricelistNumber || "PL-2024-01-KITCHEN"}
                                        currency={detailMockItem.currency || baseCurrency}
                                        baseCurrency={detailMockItem.baseCurrency}
                                        unitPrice={detailMockItem.price || 3200}
                                        quantity={detailMockItem.quantityApproved || detailMockItem.quantityRequested || 2}
                                        unit={item.unit || "piece"}
                                        discountRate={detailMockItem.discountRate || 0.12}
                                        discountAmount={detailMockItem.discountAmount || 0}
                                        taxType={detailMockItem.taxType || "VAT"}
                                        taxRate={detailMockItem.taxRate || 0.07}
                                        taxAmount={detailMockItem.taxAmount || 0}
                                        isDiscountApplied={getItemAdjustments(item.id || '').discount}
                                        isTaxApplied={getItemAdjustments(item.id || '').tax}
                                        onDiscountToggle={(checked) => item.id && updateItemAdjustments(item.id, 'discount', checked)}
                                        onTaxToggle={(checked) => item.id && updateItemAdjustments(item.id, 'tax', checked)}
                                        onCompareClick={() => {
                                          setSelectedItemForComparison(item);
                                          setIsVendorComparisonOpen(true);
                                        }}
                                        currencyRate={detailMockItem.currencyRate}
                                        showCurrencyConversion={!!(detailMockItem.currency && detailMockItem.baseCurrency && shouldShowCurrencyConversion(detailMockItem.currency, detailMockItem.baseCurrency))}

                                        // Inventory props
                                        onHand={detailMockItem.inventoryInfo?.onHand || 1}
                                        onOrder={detailMockItem.inventoryInfo?.onOrdered || 0}
                                        reorderLevel={detailMockItem.inventoryInfo?.reorderLevel || 1}
                                        restockLevel={detailMockItem.inventoryInfo?.restockLevel || 3}
                                        dateRequired={null}
                                        deliveryPoint={null}
                                        isEditable={formMode === "edit"}
                                        deliveryPointOptions={[]}
                                        onHandClick={() => handleOnHandClick(item)}
                                        onOrderClick={() => handleOnOrderClick(item)}

                                        // Business Dimensions props
                                        jobNumber={detailMockItem.jobCode || null}
                                        event={detailMockItem.event || null}
                                        project={detailMockItem.project || null}
                                        marketSegment={detailMockItem.marketSegment || null}
                                        onJobNumberChange={(value) => item.id && handleItemChange(item.id, 'jobCode', value)}
                                        onEventChange={(value) => item.id && handleItemChange(item.id, 'event', value)}
                                        onProjectChange={(value) => item.id && handleItemChange(item.id, 'project', value)}
                                        onMarketSegmentChange={(value) => item.id && handleItemChange(item.id, 'marketSegment', value)}
                                        jobOptions={[
                                          { value: "FB-2024-Q1-001", label: "FB-2024-Q1-001 - Office Renovation" },
                                          { value: "JOB001", label: "JOB001 - Office Renovation" },
                                          { value: "JOB002", label: "JOB002 - Kitchen Upgrade" },
                                          { value: "JOB003", label: "JOB003 - IT Infrastructure" }
                                        ]}
                                        eventOptions={[
                                          { value: "CONF2024", label: "Annual Conference 2024" },
                                          { value: "LAUNCH", label: "Product Launch Event" },
                                          { value: "WORKSHOP", label: "Training Workshop" }
                                        ]}
                                        projectOptions={[
                                          { value: "PROJ001", label: "Digital Transformation" },
                                          { value: "PROJ002", label: "Sustainability Initiative" },
                                          { value: "PROJ003", label: "Market Expansion" }
                                        ]}
                                        marketSegmentOptions={[
                                          { value: "ENTERPRISE", label: "Enterprise" },
                                          { value: "RETAIL", label: "Retail" },
                                          { value: "WHOLESALE", label: "Wholesale" },
                                          { value: "GOVERNMENT", label: "Government" }
                                        ]}

                                        // Section visibility props
                                        showVendorPricing={canSeePrices}
                                        showInventoryInfo={true}
                                        showBusinessDimensions={true}
                                        showActions={false}

                                        // Purchaser editing capabilities - only enabled for purchasers in edit mode
                                        isPurchaserEditable={itemIsPurchaser && formMode === "edit"}
                                        onVendorChange={itemIsPurchaser && formMode === "edit" ? (vendor) => {
                                          item.id && handleItemChange(item.id, 'vendor', vendor);
                                        } : undefined}
                                        onCurrencyChange={formMode === "edit" ? (currency) => {
                                          item.id && handleItemChange(item.id, 'currency', currency);
                                        } : undefined}
                                        onCurrencyRateChange={itemIsPurchaser && formMode === "edit" ? (rate) => {
                                          item.id && handleItemChange(item.id, 'currencyRate', rate);
                                        } : undefined}
                                        onUnitPriceChange={itemIsPurchaser && formMode === "edit" ? (price) => {
                                          item.id && handleItemChange(item.id, 'price', price);
                                        } : undefined}
                                        onDiscountRateChange={itemIsPurchaser && formMode === "edit" ? (rate) => {
                                          item.id && handleItemChange(item.id, 'discountRate', rate);
                                        } : undefined}
                                        onDiscountAmountChange={itemIsPurchaser && formMode === "edit" ? (amount) => {
                                          item.id && handleItemChange(item.id, 'discountAmount', amount);
                                        } : undefined}
                                        onTaxTypeChange={itemIsPurchaser && formMode === "edit" ? (taxType) => {
                                          item.id && handleItemChange(item.id, 'taxType', taxType);
                                        } : undefined}
                                        onTaxRateChange={itemIsPurchaser && formMode === "edit" ? (rate) => {
                                          item.id && handleItemChange(item.id, 'taxRate', rate);
                                        } : undefined}
                                        onTaxAmountChange={itemIsPurchaser && formMode === "edit" ? (amount) => {
                                          item.id && handleItemChange(item.id, 'taxAmount', amount);
                                        } : undefined}
                                        vendorOptions={[
                                          { value: "Premium Food Suppliers Inc.", label: "Premium Food Suppliers Inc." },
                                          { value: "Organic Farms Co.", label: "Organic Farms Co." },
                                          { value: "Fresh Produce Ltd.", label: "Fresh Produce Ltd." },
                                          { value: "Bulk Foods International", label: "Bulk Foods International" },
                                          { value: "Quality Ingredients Corp.", label: "Quality Ingredients Corp." }
                                        ]}
                                        taxTypeOptions={[
                                          { value: 'VAT', label: 'VAT (7%)', rate: 0.07 },
                                          { value: 'GST', label: 'GST (10%)', rate: 0.10 },
                                          { value: 'SST', label: 'SST (6%)', rate: 0.06 },
                                          { value: 'WHT', label: 'WHT (3%)', rate: 0.03 },
                                          { value: 'None', label: 'No Tax (0%)', rate: 0 },
                                        ]}

                                        // Comment props
                                        comment={detailMockItem.comment || ""}
                                        onCommentChange={formMode === "edit" ? (comment) => {
                                          item.id && handleItemChange(item.id, 'comment', comment);
                                        } : undefined}
                                      />
                                    );
                                  })()}
                                </div>

                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </Card>
  );

  // Main component return
  return (
    <div className="space-y-4">
      {/* Bulk Item Actions */}
      {selectedItems.length > 0 && (() => {
        const analysis = analyzeSelectedItemsStatus();
        // Use the already-computed role detection values
        const bulkIsApprover = isApprover || isPurchaser;

        return (
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-lg border border-dashed">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">
                {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected:
              </span>
              {analysis.pending > 0 && (
                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                  {analysis.pending} Pending
                </span>
              )}
              {analysis.approved > 0 && (
                <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                  {analysis.approved} Approved
                </span>
              )}
              {analysis.rejected > 0 && (
                <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">
                  {analysis.rejected} Rejected
                </span>
              )}
              {analysis.review > 0 && (
                <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
                  {analysis.review} In Review
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkActionWithMixedCheck('approve')}
                className="text-xs font-medium text-green-600 hover:text-green-700 border-green-200"
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Approve Selected
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkActionWithMixedCheck('reject')}
                className="text-xs font-medium text-red-600 hover:text-red-700 border-red-200"
              >
                <XCircle className="h-4 w-4 mr-1" />
                Reject Selected
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkActionWithMixedCheck('return')}
                className="text-xs font-medium text-orange-600 hover:text-orange-700 border-orange-200"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Return Selected
              </Button>

              <Button variant="outline" size="sm" onClick={handleBulkSplit} className="text-xs text-blue-600 hover:text-blue-700">
                <Split className="h-4 w-4 mr-1" />
                Split
              </Button>

              <Button variant="outline" size="sm" onClick={handleBulkSetRequiredDate} className="text-xs text-purple-600 hover:text-purple-700">
                <CalendarIcon className="h-4 w-4 mr-1" />
                Set Date Required
              </Button>
            </div>
          </div>
        );
      })()}

      {/* Render current view */}
      {renderTableView()}

      {/* Item Details Form Modal */}
      {selectedItem && (
        <Dialog open={!!selectedItem} onOpenChange={() => setSelectedItem(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {itemFormMode === "add" ? "Add New Item" : "Item Details"}
              </DialogTitle>
            </DialogHeader>
            <ItemDetailsEditForm
              onSave={handleSaveItem}
              onCancel={closeItemForm}
              onDelete={itemFormMode === "edit" ? () => handleDeleteItem(selectedItem?.id || "") : undefined}
              initialData={selectedItem}
              mode={itemFormMode || "view"}
              onModeChange={setItemFormMode}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Vendor Comparison Dialog - Moved outside of items loop */}
      {selectedItemForComparison && (
        <Dialog open={isVendorComparisonOpen} onOpenChange={setIsVendorComparisonOpen}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Vendor Comparison</DialogTitle>
            </DialogHeader>
            <VendorComparison
              currentPricelistNumber={asMockPurchaseRequestItem(selectedItemForComparison).pricelistNumber}
              selectedVendor={isPurchaser ? undefined : asMockPurchaseRequestItem(selectedItemForComparison).vendor}
              itemName={asMockPurchaseRequestItem(selectedItemForComparison).name}
              itemDescription={selectedItemForComparison.description}
              itemUnit={selectedItemForComparison.unit}
              itemStatus={selectedItemForComparison.status}
              requestedQuantity={asMockPurchaseRequestItem(selectedItemForComparison).quantityRequested}
              approvedQuantity={asMockPurchaseRequestItem(selectedItemForComparison).quantityApproved}
              userRole={userRoleName}
              onPricelistSelect={isPurchaser ? (vendor, pricelistNumber, unitPrice) => {
                if (selectedItemForComparison?.id) {
                  handleItemChange(selectedItemForComparison.id, 'vendor', vendor);
                  handleItemChange(selectedItemForComparison.id, 'pricelistNumber', pricelistNumber);
                  handleItemChange(selectedItemForComparison.id, 'price', unitPrice);
                }
                setIsVendorComparisonOpen(false);
              } : undefined}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* On Hand by Location Modal */}
      <Dialog open={isOnHandPopupOpen} onOpenChange={setIsOnHandPopupOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>On Hand by Location - {selectedItemForPopup && asMockPurchaseRequestItem(selectedItemForPopup).name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Current inventory levels across all locations
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-center">Unit</TableHead>
                    <TableHead className="text-center">Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockOnHandByLocation.map((location, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{location.location}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {location.quantity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                      </TableCell>
                      <TableCell className="text-center">{location.unit}</TableCell>
                      <TableCell className="text-center text-sm text-gray-500">{location.lastUpdated}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-blue-50">
                    <TableCell className="font-bold">Total</TableCell>
                    <TableCell className="text-right font-bold text-blue-700">
                      {mockOnHandByLocation.reduce((sum, loc) => sum + loc.quantity, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                    </TableCell>
                    <TableCell className="text-center font-semibold">kg</TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* On Order (Purchase Orders) Modal */}
      <Dialog open={isOnOrderPopupOpen} onOpenChange={setIsOnOrderPopupOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Purchase Orders - {selectedItemForPopup && asMockPurchaseRequestItem(selectedItemForPopup).name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              Outstanding purchase orders for this item
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>PO Number</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead className="text-center">Order Date</TableHead>
                    <TableHead className="text-center">Expected Date</TableHead>
                    <TableHead className="text-right">Quantity</TableHead>
                    <TableHead className="text-center">Unit</TableHead>
                    <TableHead className="text-right">Unit Price</TableHead>
                    <TableHead className="text-right">Total Amount</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPurchaseOrders.map((po, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium text-blue-600">{po.poNumber}</TableCell>
                      <TableCell>{po.vendor}</TableCell>
                      <TableCell className="text-center text-sm">{po.orderDate}</TableCell>
                      <TableCell className="text-center text-sm">{po.expectedDate}</TableCell>
                      <TableCell className="text-right font-semibold">
                        {po.quantity.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                      </TableCell>
                      <TableCell className="text-center">{po.unit}</TableCell>
                      <TableCell className="text-right">
                        ${po.unitPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        ${po.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge
                          variant="secondary"
                          className={cn(
                            "text-xs px-2 py-1",
                            po.status === 'Confirmed' && "bg-green-100 text-green-700 border-green-200",
                            po.status === 'Pending' && "bg-yellow-100 text-yellow-700 border-yellow-200",
                            po.status === 'In Transit' && "bg-blue-100 text-blue-700 border-blue-200"
                          )}
                        >
                          {po.status}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="bg-orange-50">
                    <TableCell colSpan={4} className="font-bold">Total Ordered</TableCell>
                    <TableCell className="text-right font-bold text-orange-700">
                      {mockPurchaseOrders.reduce((sum, po) => sum + po.quantity, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 5 })}
                    </TableCell>
                    <TableCell className="text-center font-semibold">kg</TableCell>
                    <TableCell></TableCell>
                    <TableCell className="text-right font-bold text-orange-700">
                      ${mockPurchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Return Comment Dialog */}
      <Dialog open={isReturnCommentDialogOpen} onOpenChange={setIsReturnCommentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Return Items for Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Add a comment explaining why these {itemsToReturn.length} item{itemsToReturn.length === 1 ? '' : 's'} need{itemsToReturn.length === 1 ? 's' : ''} to be returned:
            </div>
            <Textarea
              placeholder="Enter reason for return..."
              value={returnComment}
              onChange={(e) => setReturnComment(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsReturnCommentDialogOpen(false);
                  setReturnComment("");
                  setItemsToReturn([]);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleReturnWithComment}
                disabled={!returnComment.trim()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Return Items
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Mixed Status Modal */}
      <Dialog open={isMixedStatusModalOpen} onOpenChange={setIsMixedStatusModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Mixed Status Selection</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              You have selected items with different statuses. How would you like to apply the <span className="font-semibold">{pendingBulkAction?.action}</span> action?
            </div>

            {pendingBulkAction && (
              <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
                <div>Selected items breakdown:</div>
                {pendingBulkAction.analysis.pending > 0 && (
                  <div className="flex justify-between">
                    <span>• Pending items:</span>
                    <span className="font-medium">{pendingBulkAction.analysis.pending}</span>
                  </div>
                )}
                {pendingBulkAction.analysis.approved > 0 && (
                  <div className="flex justify-between">
                    <span>• Approved items:</span>
                    <span className="font-medium">{pendingBulkAction.analysis.approved}</span>
                  </div>
                )}
                {pendingBulkAction.analysis.rejected > 0 && (
                  <div className="flex justify-between">
                    <span>• Rejected items:</span>
                    <span className="font-medium">{pendingBulkAction.analysis.rejected}</span>
                  </div>
                )}
                {pendingBulkAction.analysis.review > 0 && (
                  <div className="flex justify-between">
                    <span>• In Review items:</span>
                    <span className="font-medium">{pendingBulkAction.analysis.review}</span>
                  </div>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Button
                variant="outline"
                className="w-full justify-start p-4 h-auto"
                onClick={() => {
                  if (pendingBulkAction) {
                    executeBulkAction(pendingBulkAction.action, 'pending-only');
                    setIsMixedStatusModalOpen(false);
                    setPendingBulkAction(null);
                  }
                }}
                disabled={!pendingBulkAction || pendingBulkAction.analysis.pending === 0}
              >
                <div className="text-left">
                  <div className="font-medium">Apply to Pending Items Only</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Only change the status of pending items ({pendingBulkAction?.analysis.pending || 0} items)
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                className="w-full justify-start p-4 h-auto"
                onClick={() => {
                  if (pendingBulkAction) {
                    executeBulkAction(pendingBulkAction.action, 'all');
                    setIsMixedStatusModalOpen(false);
                    setPendingBulkAction(null);
                  }
                }}
              >
                <div className="text-left">
                  <div className="font-medium">Apply to All Selected Items</div>
                  <div className="text-xs text-gray-500 mt-1">
                    Change the status of all selected items ({pendingBulkAction?.analysis.total || 0} items)
                  </div>
                </div>
              </Button>
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsMixedStatusModalOpen(false);
                  setPendingBulkAction(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Bulk Set Date Required Modal */}
      <Dialog open={isBulkDateModalOpen} onOpenChange={setIsBulkDateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Set Date Required</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Set the required date for {selectedItems.length} selected item{selectedItems.length !== 1 ? 's' : ''}:
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Required Date</label>
              <DatePickerField
                value={bulkRequiredDate}
                onChange={setBulkRequiredDate}
                placeholder="Select required date"
              />
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsBulkDateModalOpen(false);
                  setBulkRequiredDate(undefined);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={handleBulkDateConfirm}
                disabled={!bulkRequiredDate}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Set Date
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}