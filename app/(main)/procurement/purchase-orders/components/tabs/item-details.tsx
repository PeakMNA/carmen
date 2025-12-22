"use client";

import { useState, useEffect, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Edit,
  Eye,
  Box,
  DollarSign,
  AlertCircle,
  Settings,
  Truck,
  MoreHorizontal,
  FileText,
  Trash2,
  X,
  Save as SaveIcon
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PurchaseOrderItem } from "@/lib/types";
import { PrItemsTable } from "./pr-items-table";
import { GrnItemsTable } from "./grn-items-table";
import { InventoryBreakdownContent } from "./inventory-breakdown";
import { PendingPurchaseOrdersComponent } from "./pending-purchase-orders";
import POItemDetailForm from "./po-item-detail-form";

// Mock data matching inventory-breakdown.tsx
const inventoryData = [
  { location: "Warehouse A", quantityOnHand: 500, units: "pcs" },
  { location: "Store B", quantityOnHand: 150, units: "pcs" },
  { location: "Distribution Center C", quantityOnHand: 1000, units: "pcs" },
];

// Mock data matching pending-purchase-orders.tsx
const pendingPOData = [
  { poNumber: "PO-001", qtyToReceive: 100, units: "pcs" },
  { poNumber: "PO-002", qtyToReceive: 50, units: "pcs" },
  { poNumber: "PO-003", qtyToReceive: 200, units: "pcs" },
];

// Mock data matching grn-items-table.tsx
const grnItemsData = [
  { id: 'GRN001', receivedQuantity: 5, rejectedQuantity: 0 },
  { id: 'GRN002', receivedQuantity: 3, rejectedQuantity: 2 },
];

type Mode = "view" | "edit" | "add";

interface ItemDetailsComponentProps {
  initialMode: Mode;
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<PurchaseOrderItem>;
  onSubmit?: (data: PurchaseOrderItem) => void;
}

export function ItemDetailsComponent({
  initialMode,
  onClose,
  isOpen,
  initialData,
  onSubmit,
}: ItemDetailsComponentProps) {
  const [mode, setMode] = useState<Mode>(initialMode);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  const handleSave = (data: any) => {
    if (onSubmit) {
      onSubmit(data as PurchaseOrderItem);
    }
    onClose();
  };

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:max-w-2xl p-0 [&>button]:hidden">
        <POItemDetailForm
          item={initialData as any}
          mode={mode}
          currencyCode="USD"
          baseCurrencyCode="THB"
          exchangeRate={35}
          onClose={onClose}
          onSave={handleSave}
          onModeChange={handleModeChange}
        />
      </SheetContent>
    </Sheet>
  );
}

/**
 * Legacy Dialog-based Item Details Component
 * Kept for backwards compatibility - prefer ItemDetailsComponent (Sheet-based)
 */
export function ItemDetailsDialog({
  initialMode,
  onClose,
  isOpen,
  initialData,
  onSubmit,
}: ItemDetailsComponentProps) {
  const [activeTab, setActiveTab] = useState("details");
  const [mode, setMode] = useState<Mode>(initialMode);
  const [itemData, setItemData] = useState<Partial<PurchaseOrderItem>>(
    initialData || {}
  );
  const [isPrItemsTableOpen, setIsPrItemsTableOpen] = useState(false);
  const [isInventoryBreakdownOpen, setIsInventoryBreakdownOpen] =
    useState(false);
  const [isPendingPOsOpen, setIsPendingPOsOpen] = useState(false);
  const [isGRNDialogOpen, setIsGRNDialogOpen] = useState(false);

  useEffect(() => {
    setMode(initialMode);
    setItemData(initialData || {});
  }, [initialMode, initialData]);

  const isReadOnly = mode === "view";

  // Calculate totals from mock data to match dialog contents
  const totalOnHand = useMemo(() =>
    inventoryData.reduce((sum, item) => sum + item.quantityOnHand, 0),
  []);

  const totalOnOrder = useMemo(() =>
    pendingPOData.reduce((sum, item) => sum + item.qtyToReceive, 0),
  []);

  const totalReceived = useMemo(() =>
    grnItemsData.reduce((sum, item) => sum + item.receivedQuantity, 0),
  []);

  // Get inventory unit from mock data (they all use the same unit)
  const inventoryUnit = inventoryData[0]?.units || "pcs";

  const handleModeChange = (newMode: Mode) => {
    setMode(newMode);
  };

  const handleInputChange = (field: keyof PurchaseOrderItem, value: any) => {
    setItemData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (onSubmit && (mode === "edit" || mode === "add")) {
      onSubmit(itemData as PurchaseOrderItem);
    }
    onClose();
  };

  const handleOnHandClick = () => {
    setIsInventoryBreakdownOpen(true);
  };

  const handleOnOrderClick = () => {
    setIsPendingPOsOpen(true);
  };

  const handleGoodsReceivedClick = () => {
    setIsGRNDialogOpen(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] [&>button]:hidden">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-lg font-bold">
                PO Item Details
              </DialogTitle>
              <div className="flex items-center space-x-2">
                {mode === "view" && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => handleModeChange("edit")}
                  >
                    <Edit className="h-3 w-3 mr-2" />
                    Edit
                  </Button>
                )}
                {mode === "edit" && (
                  <>
                    <Button variant="outline" size="sm" className="h-6 px-2 text-xs" onClick={handleSave}>
                      <SaveIcon className="h-3 w-3 mr-2" />
                      Save
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => handleModeChange("view")}
                    >
                      <X className="h-3 w-3 mr-2" />
                      Cancel
                    </Button>
                  </>
                )}
                {mode === "add" && (
                  <Button variant="outline" size="sm" className="h-6 px-2 text-xs" onClick={handleSave}>
                    <SaveIcon className="h-3 w-3 mr-2" />
                    Save
                  </Button>
                )}

                <DialogClose asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6">
                    <X className="h-3 w-3" />
                  </Button>
                </DialogClose>
              </div>
            </div>
          </DialogHeader>

          <ScrollArea className="max-h-[65vh] w-full overflow-y-auto">
            <div className="space-y-4">

              {/* Tier 1: Essential Item Information (Always Visible) */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                {/* Product Information Header */}
                <div className="flex items-center justify-between mb-3">
                  <div className="product-info flex-1">
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2">
                        <div className="space-y-1">
                          <Label htmlFor="name" className="text-xs uppercase tracking-wide text-gray-500">Name</Label>
                          <Input
                            id="name"
                            value={itemData.itemName || ""}
                            onChange={(e) => handleInputChange('itemName', e.target.value)}
                            readOnly={isReadOnly}
                            className="h-8 text-xs font-semibold text-gray-900"
                          />
                        </div>
                        <div className="space-y-1 lg:col-span-3">
                          <Label htmlFor="description" className="text-xs uppercase tracking-wide text-gray-500">Description</Label>
                          <Input
                            id="description"
                            value={itemData.description || ""}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            readOnly={isReadOnly}
                            className="h-8 text-xs text-gray-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inventory Status Indicators */}
                  <div className="flex items-center gap-3 ml-4">
                    <div
                      className="flex flex-col items-center px-3 py-1 bg-blue-50 border border-blue-200 rounded cursor-pointer hover:bg-blue-100 transition-colors"
                      onClick={handleOnHandClick}
                    >
                      <span className="text-xs text-blue-600 font-medium">On Hand</span>
                      <span className="text-sm font-bold text-blue-800">{totalOnHand}</span>
                      <span className="text-xs text-blue-500">{inventoryUnit}</span>
                    </div>
                    <div
                      className="flex flex-col items-center px-3 py-1 bg-amber-50 border border-amber-200 rounded cursor-pointer hover:bg-amber-100 transition-colors"
                      onClick={handleOnOrderClick}
                    >
                      <span className="text-xs text-amber-600 font-medium">On Order</span>
                      <span className="text-sm font-bold text-amber-800">{totalOnOrder}</span>
                      <span className="text-xs text-amber-500">{inventoryUnit}</span>
                    </div>
                    <div
                      className="flex flex-col items-center px-3 py-1 bg-green-50 border border-green-200 rounded cursor-pointer hover:bg-green-100 transition-colors"
                      onClick={handleGoodsReceivedClick}
                    >
                      <span className="text-xs text-green-600 font-medium">Received</span>
                      <span className="text-sm font-bold text-green-800">{totalReceived}</span>
                      <span className="text-xs text-green-500">{inventoryUnit}</span>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="metrics-grid grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 mt-4">
                  <div className="metric-item text-center">
                    <Label className="text-xs uppercase tracking-wide text-gray-500 mb-1 block">Unit</Label>
                    <Input
                      value={itemData.unit || ""}
                      onChange={(e) => handleInputChange('unit', e.target.value)}
                      readOnly={isReadOnly}
                      className="h-8 text-xs font-medium text-gray-900 text-center"
                    />
                    <p className="text-xs text-gray-500 mt-1">Base: {itemData.unit || "Pcs"}</p>
                  </div>
                  <div className="metric-item text-center">
                    <Label className="text-xs uppercase tracking-wide text-gray-500 mb-1 block">Ordered</Label>
                    <Input
                      value={itemData.orderedQuantity?.toString() || "0"}
                      onChange={(e) => handleInputChange('orderedQuantity', parseFloat(e.target.value) || 0)}
                      readOnly={isReadOnly}
                      className="h-8 text-xs font-medium text-gray-900 text-center"
                      type="number"
                    />
                    <p className="text-xs text-gray-500 mt-1">{itemData.orderedQuantity || 0} {itemData.unit || "Pcs"}</p>
                  </div>
                  <div className="metric-item text-center">
                    <Label className="text-xs uppercase tracking-wide text-gray-500 mb-1 block">Received</Label>
                    <Input
                      value={itemData.receivedQuantity?.toString() || "0"}
                      onChange={(e) => handleInputChange('receivedQuantity', parseFloat(e.target.value) || 0)}
                      readOnly={isReadOnly}
                      className="h-8 text-xs font-medium text-gray-900 text-center"
                      type="number"
                    />
                    <p className="text-xs text-gray-500 mt-1">{itemData.receivedQuantity || 0} {itemData.unit || "Pcs"}</p>
                  </div>
                  <div className="metric-item text-center">
                    <Label className="text-xs uppercase tracking-wide text-gray-500 mb-1 block">Remaining</Label>
                    <Input
                      value={((itemData.orderedQuantity || 0) - (itemData.receivedQuantity || 0)).toString()}
                      readOnly
                      className="h-8 text-xs font-medium text-gray-900 text-center bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">{(itemData.orderedQuantity || 0) - (itemData.receivedQuantity || 0)} {itemData.unit || "Pcs"}</p>
                  </div>
                  <div className="metric-item text-center">
                    <Label className="text-xs uppercase tracking-wide text-gray-500 mb-1 block">Price</Label>
                    <div className="text-xs font-medium text-gray-900">
                      ${typeof itemData.unitPrice === 'object' && itemData.unitPrice !== null
                        ? ((itemData.unitPrice as any).amount?.toFixed(2) || '0.00')
                        : (itemData.unitPrice !== undefined ? (itemData.unitPrice as unknown as number).toFixed(2) : '0.00')}
                    </div>
                  </div>
                  <div className="metric-item text-center flex flex-col items-center justify-center">
                    <Label className="text-xs uppercase tracking-wide text-gray-500 mb-1 block">FOC</Label>
                    <Checkbox id="foc" disabled={isReadOnly} />
                  </div>
                </div>
              </div>

              {/* Section 1: Related Purchase Requests */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-gray-600" />
                    <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Related Purchase Requests</h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsPrItemsTableOpen(true)}
                    className="text-xs"
                  >
                    View All PRs
                  </Button>
                </div>

                <div className="p-4">
                  {/* PR List Table */}
                  <div className="space-y-2">
                    <div className="grid grid-cols-6 gap-4 text-xs font-medium text-gray-700 uppercase tracking-wide border-b border-gray-100 pb-2">
                      <div>PR Number</div>
                      <div>Requested Qty</div>
                      <div>Approved Qty</div>
                      <div>Unit Price</div>
                      <div>Status</div>
                      <div>Requestor</div>
                    </div>

                    {/* PR Row - showing source PR if available */}
                    {itemData.sourceRequestId ? (
                      <div className="grid grid-cols-6 gap-4 text-xs text-gray-900 py-2 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                        <div className="font-medium text-blue-600">{itemData.sourceRequestId}</div>
                        <div>{itemData.orderedQuantity || 0} {itemData.unit || ''}</div>
                        <div>{itemData.orderedQuantity || 0} {itemData.unit || ''}</div>
                        <div>${typeof itemData.unitPrice === 'object' && itemData.unitPrice !== null
                          ? ((itemData.unitPrice as any).amount?.toFixed(2) || '0.00')
                          : (itemData.unitPrice !== undefined ? (itemData.unitPrice as unknown as number).toFixed(2) : '0.00')}</div>
                        <div>
                          <Badge className="bg-green-100 text-green-700 text-xs px-1 py-0">Approved</Badge>
                        </div>
                        <div>-</div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 py-4 text-center">No related purchase requests</div>
                    )}
                  </div>

                  {/* PR Summary */}
                  <div className="bg-gray-50 rounded-lg p-3 mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
                      <div>
                        <Label className="block text-xs font-medium text-gray-700 mb-1">Total PRs</Label>
                        <span className="text-gray-900 font-semibold">{itemData.sourceRequestId ? '1 Request' : '0 Requests'}</span>
                      </div>
                      <div>
                        <Label className="block text-xs font-medium text-gray-700 mb-1">Total Requested</Label>
                        <span className="text-gray-900 font-semibold">{itemData.orderedQuantity || 0} {itemData.unit || ''}</span>
                      </div>
                      <div>
                        <Label className="block text-xs font-medium text-gray-700 mb-1">Total Approved</Label>
                        <span className="text-gray-900 font-semibold">{itemData.orderedQuantity || 0} {itemData.unit || ''}</span>
                      </div>
                      <div>
                        <Label className="block text-xs font-medium text-gray-700 mb-1">Average Price</Label>
                        <span className="text-gray-900 font-semibold">${typeof itemData.unitPrice === 'object' && itemData.unitPrice !== null
                          ? ((itemData.unitPrice as any).amount?.toFixed(2) || '0.00')
                          : (itemData.unitPrice !== undefined ? (itemData.unitPrice as unknown as number).toFixed(2) : '0.00')} / {itemData.unit || 'Unit'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Order Summary */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-50/50 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <Box className="h-3 w-3 text-gray-600" />
                    <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Order Summary</h3>
                  </div>
                </div>

                <div className="p-4">
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h4 className="text-xs font-semibold text-gray-900 mb-3">Order Details</h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Order Quantity:</span>
                          <span className="font-medium">{itemData.orderedQuantity || 0} {itemData.unit || ''}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Received Quantity:</span>
                          <span className="font-medium">{itemData.receivedQuantity || 0} {itemData.unit || ''}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Remaining:</span>
                          <span className="font-medium text-orange-600">{(itemData.orderedQuantity || 0) - (itemData.receivedQuantity || 0)} {itemData.unit || ''}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Unit Price:</span>
                          <span className="font-medium">${typeof itemData.unitPrice === 'object' && itemData.unitPrice !== null
                            ? ((itemData.unitPrice as any).amount?.toFixed(2) || '0.00')
                            : (itemData.unitPrice !== undefined ? (itemData.unitPrice as unknown as number).toFixed(2) : '0.00')}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-gray-900 mb-3">Financial Summary</h4>
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-gray-600">Total Amount:</span>
                            <span className="font-semibold ml-2">${(() => {
                              // First try lineTotal
                              if (itemData.lineTotal) {
                                if (typeof itemData.lineTotal === 'object' && itemData.lineTotal !== null) {
                                  return (itemData.lineTotal as any).amount?.toFixed(2) || '0.00';
                                }
                                return (itemData.lineTotal as unknown as number).toFixed(2);
                              }
                              // Calculate from orderedQuantity * unitPrice
                              const qty = itemData.orderedQuantity || 0;
                              const price = typeof itemData.unitPrice === 'object' && itemData.unitPrice !== null
                                ? ((itemData.unitPrice as any).amount || 0)
                                : (itemData.unitPrice as unknown as number || 0);
                              return (qty * price).toFixed(2);
                            })()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

        </DialogContent>
      </Dialog>

      {/* Other dialogs remain the same */}
      <Dialog open={isPrItemsTableOpen} onOpenChange={setIsPrItemsTableOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] [&>button]:hidden">
          <DialogHeader>
            <div className="flex justify-between w-full items-center">
              <DialogTitle className="text-lg">Relate Purchase Requests</DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6">
                  <X className="h-3 w-3" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          <div className="p-4">
            <div className="text-center text-gray-500">
              <p>Purchase Request Items information will be displayed here.</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* InventoryBreakdown Dialog - On Hand */}
      <Dialog open={isInventoryBreakdownOpen} onOpenChange={setIsInventoryBreakdownOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader>
            <div className="flex justify-between w-full items-center">
              <DialogTitle className="text-lg">On Hand - Inventory Breakdown</DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6">
                  <X className="h-3 w-3" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          <InventoryBreakdownContent
            itemData={{
              name: itemData.itemName || "Item",
              description: itemData.description || "",
              status: "Active"
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Pending Purchase Orders Dialog - On Order */}
      <Dialog open={isPendingPOsOpen} onOpenChange={setIsPendingPOsOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] [&>button]:hidden">
          <DialogHeader>
            <div className="flex justify-between w-full items-center">
              <DialogTitle className="text-lg">On Order - Pending Purchase Orders</DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6">
                  <X className="h-3 w-3" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          <PendingPurchaseOrdersComponent
            itemData={{
              name: itemData.itemName || "Item",
              description: itemData.description || ""
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Goods Received Notes Dialog - Received */}
      <Dialog open={isGRNDialogOpen} onOpenChange={setIsGRNDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader>
            <div className="flex justify-between w-full items-center">
              <DialogTitle className="text-lg">Received - Goods Receipt Notes</DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6">
                  <X className="h-3 w-3" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>
          <GrnItemsTable
            itemData={{
              name: itemData.itemName || "Item",
              description: itemData.description || ""
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

// Enhanced PO Item Row Component - Table Layout Following Diagram
interface EnhancedPOItemRowProps {
  item: PurchaseOrderItem;
  isExpanded?: boolean;
  isEditMode?: boolean;
  isSelected?: boolean;
  currencyCode?: string;
  baseCurrencyCode?: string;
  exchangeRate?: number;
  onToggleExpand: (itemId: string) => void;
  onToggleEdit: (itemId: string) => void;
  onSelect: (itemId: string) => void;
  onUpdateItem: (item: PurchaseOrderItem) => void;
  onViewDetails: (item: PurchaseOrderItem) => void;
  onGoodsReceived?: (item: PurchaseOrderItem) => void;
  onSplitLine?: (item: PurchaseOrderItem) => void;
  onCancelItem?: (item: PurchaseOrderItem) => void;
  showCheckbox?: boolean;
  className?: string;
  parentEditable?: boolean; // New prop to indicate if parent form is in edit mode
  allowEdit?: boolean; // New prop to indicate if editing is allowed at all (view mode = false)
}

export function EnhancedPOItemRow({
  item,
  isExpanded = false,
  isEditMode = false,
  isSelected = false,
  currencyCode = 'USD',
  baseCurrencyCode = 'THB',
  exchangeRate = 35,
  onToggleExpand,
  onToggleEdit,
  onSelect,
  onUpdateItem,
  onViewDetails,
  onGoodsReceived,
  onSplitLine,
  onCancelItem,
  showCheckbox = true,
  className = "",
  parentEditable = false,
  allowEdit = true,
}: EnhancedPOItemRowProps) {
  const [editedItem, setEditedItem] = useState<PurchaseOrderItem>(() => ({ ...item }));
  const [isDiscountOverride, setIsDiscountOverride] = useState(false);
  const [isTaxOverride, setIsTaxOverride] = useState(false);
  const [overrideDiscountAmount, setOverrideDiscountAmount] = useState(0);
  const [overrideTaxAmount, setOverrideTaxAmount] = useState(0);
  const [showPRModal, setShowPRModal] = useState(false);
  const [showGRNModal, setShowGRNModal] = useState(false);

  // Handle field changes
  const handleFieldChange = (field: keyof PurchaseOrderItem, value: any) => {
    const updatedItem = { ...editedItem, [field]: value };
    setEditedItem(updatedItem);
    // Automatically sync changes to parent since there's no individual save button
    onUpdateItem(updatedItem);
  };

  // Calculate totals (in display currency)
  // Extract unitPrice from Money type if it's an object
  const unitPriceValue = typeof editedItem.unitPrice === 'object' && editedItem.unitPrice !== null
    ? ((editedItem.unitPrice as any).amount || 0)
    : (editedItem.unitPrice as any || 0);
  const subtotal = (editedItem.orderedQuantity || 0) * unitPriceValue;
  const discountAmount = isDiscountOverride ? overrideDiscountAmount : subtotal * (editedItem.discount || 0);
  const netTotal = subtotal - discountAmount; // Net total after discount but before tax
  const taxAmount = isTaxOverride ? overrideTaxAmount : netTotal * (editedItem.taxRate || 0);
  const totalAmount = netTotal + taxAmount;
  
  // Calculate base currency equivalents
  const baseSubtotal = subtotal * exchangeRate;
  const baseDiscountAmount = discountAmount * exchangeRate;
  const baseNetAmount = netTotal * exchangeRate;
  const baseTaxAmount = taxAmount * exchangeRate;
  const baseTotalAmount = totalAmount * exchangeRate;
  
  // Check if currencies and units are different to decide whether to show base values
  const showBaseCurrency = currencyCode !== baseCurrencyCode;
  const showBaseUnit = item.unit !== (item as any).baseUnit;


  // Status badge styling based on layout guide
  const getStatusBadgeClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'pending':
        return 'bg-gray-100 text-gray-600 border-gray-200';
      case 'review':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'rejected':
        return 'bg-red-100 text-red-600 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  return (
    <div className={`relative group transition-all duration-200 border-b border-gray-200 hover:bg-gradient-to-r hover:from-blue-50 hover:to-blue-25 ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''} ${className}`}>
      {/* Main Row - Table-style Layout like PR */}
      <div className="px-4 py-3">
        {/* Primary Row - Product Description Only */}
        <div className="flex items-start gap-6">
          {/* Checkbox */}
          {showCheckbox && (
            <div className="flex-shrink-0 pt-0.5">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => onSelect(item.id)}
                className="w-4 h-4 data-[state=checked]:bg-blue-600"
                aria-label={`Select ${item.itemName}`}
              />
            </div>
          )}

          {/* Product Details Column - Give more space for description */}
          <div className="flex-2 min-w-0">
            <div className="min-w-0">
              {isEditMode ? (
                <div className="space-y-1">
                  <Input
                    value={editedItem.itemName}
                    onChange={(e) => handleFieldChange('itemName', e.target.value)}
                    className="text-sm font-semibold h-7"
                    placeholder="Product name"
                  />
                  <Input
                    value={editedItem.description || ''}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className="text-sm h-6"
                    placeholder="Product description"
                  />
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-2 mb-1">
                    <div className="font-semibold text-base leading-tight">{item.itemName}</div>
                    <Badge className={`text-xs px-2 py-0 font-normal inline-flex items-center gap-1 ${getStatusBadgeClass(item.status || 'Ordered')}`}>
                      {item.status || 'Ordered'}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground line-clamp-2">{item.description || 'No description'}</div>
                </>
              )}
            </div>
          </div>

          {/* More Actions Column - Fixed size for actions */}
          <div className="flex-shrink-0 w-auto text-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-muted/60">
                  <MoreHorizontal className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => onViewDetails?.(item)}>
                  <Eye className="mr-2 h-3 w-3" />
                  View Details
                </DropdownMenuItem>
                
                {!parentEditable && allowEdit && (
                  <DropdownMenuItem onClick={() => onToggleEdit(item.id)}>
                    <Edit className="mr-2 h-3 w-3" />
                    {isEditMode ? 'Save' : 'Edit'}
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                {onGoodsReceived && (
                  <DropdownMenuItem onClick={() => onGoodsReceived(item)} className="text-green-600 focus:text-green-600">
                    <Box className="mr-2 h-3 w-3" />
                    Mark as Received
                  </DropdownMenuItem>
                )}
                {onSplitLine && (
                  <DropdownMenuItem onClick={() => onSplitLine(item)} className="text-blue-600 focus:text-blue-600">
                    <Settings className="mr-2 h-3 w-3" />
                    Split Line
                  </DropdownMenuItem>
                )}
                {onCancelItem && (
                  <DropdownMenuItem onClick={() => onCancelItem(item)} className="text-red-600 focus:text-red-600">
                    <AlertCircle className="mr-2 h-3 w-3" />
                    Cancel Item
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Secondary Row - All Financial and Quantity Details */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          {/* Updated Layout: Ordered | Received | Price Per Unit | Sub Total | Discount Amount | Tax Amount | Net Total | Total */}
          <div className="flex items-start gap-2 text-sm w-full">
            {/* Empty space for checkbox alignment */}
            {showCheckbox && (
              <div className="flex-shrink-0">
                <div className="w-4 h-4"></div>
              </div>
            )}

            {/* Ordered Quantity */}
            <div className="flex-1 min-w-0 text-center">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-medium">Ordered</div>
                {isEditMode ? (
                  <div className="space-y-1">
                    <Input
                      value={editedItem.orderedQuantity?.toString() || ''}
                      onChange={(e) => handleFieldChange('orderedQuantity', parseFloat(e.target.value) || 0)}
                      className="text-xs font-medium text-center h-6 w-full max-w-16"
                      type="number"
                      step="0.001"
                      placeholder="0"
                    />
                    <Select
                      value={editedItem.unit || 'Pcs'}
                      onValueChange={(value) => handleFieldChange('unit', value)}
                    >
                      <SelectTrigger className="h-5 text-sm w-full max-w-16">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pcs">Pcs</SelectItem>
                        <SelectItem value="boxes">Boxes</SelectItem>
                        <SelectItem value="reams">Reams</SelectItem>
                        <SelectItem value="kg">Kg</SelectItem>
                        <SelectItem value="liters">Liters</SelectItem>
                        <SelectItem value="meters">Meters</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <>
                    <div className="text-xs font-medium text-center">{(item.orderedQuantity || 0).toFixed(0)}</div>
                    <div className="text-xs text-gray-500 text-center">{item.unit || 'Pcs'}</div>
                    {showBaseUnit && (
                      <div className="text-xs text-gray-400 text-center">{((item.orderedQuantity || 0) * ((item as any).convRate || 1)).toFixed(2)} {(item as any).baseUnit || 'kg'}</div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Received Quantity */}
            <div className="flex-1 min-w-0 text-center">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-medium">Received</div>
                {isEditMode ? (
                  <Input
                    value={editedItem.receivedQuantity?.toString() || ''}
                    onChange={(e) => handleFieldChange('receivedQuantity', parseFloat(e.target.value) || 0)}
                    className="text-xs font-medium text-center h-6 w-full max-w-16"
                    type="number"
                    step="0.001"
                    placeholder="0"
                  />
                ) : (
                  <>
                    {item.receivedQuantity ? (
                      <>
                        <div className="text-xs font-medium text-green-700 text-center">{item.receivedQuantity?.toFixed(0) || '0'}</div>
                        <div className="text-xs text-gray-500 text-center">{item.unit || 'Pcs'}</div>
                        {showBaseUnit && (
                          <div className="text-xs text-gray-400 text-center">{((item.receivedQuantity || 0) * ((item as any).convRate || 1)).toFixed(2)} {(item as any).baseUnit || 'kg'}</div>
                        )}
                      </>
                    ) : (
                      <div className="text-xs text-gray-400 italic text-center">Pending</div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Unit Price */}
            <div className="flex-1 min-w-0 text-right">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-medium">Price/Unit</div>
                {isEditMode ? (
                  <Input
                    type="number"
                    value={typeof editedItem.unitPrice === 'object' && editedItem.unitPrice !== null ? ((editedItem.unitPrice as any).amount || 0) : (editedItem.unitPrice as any || 0)}
                    onChange={(e) => handleFieldChange('unitPrice', parseFloat(e.target.value) || 0)}
                    className="text-xs font-semibold text-right h-6 w-full max-w-18"
                    min="0"
                    step="0.01"
                  />
                ) : (
                  <>
                    <div className="font-semibold text-xs text-right">{currencyCode} {(typeof item.unitPrice === 'object' && item.unitPrice !== null ? ((item.unitPrice as any).amount || 0) : (item.unitPrice as any || 0)).toFixed(2)}</div>
                    {showBaseCurrency && (
                      <div className="text-xs text-gray-400 text-right">{baseCurrencyCode} {((typeof item.unitPrice === 'object' && item.unitPrice !== null ? ((item.unitPrice as any).amount || 0) : (item.unitPrice as any || 0)) * exchangeRate).toFixed(2)}</div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Subtotal */}
            <div className="flex-1 min-w-0 text-right">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-medium">Sub Total</div>
                <div className="font-semibold text-sm text-right">{currencyCode} {subtotal.toFixed(2)}</div>
                {showBaseCurrency && (
                  <div className="text-sm text-gray-400 text-right">{baseCurrencyCode} {baseSubtotal.toFixed(2)}</div>
                )}
              </div>
            </div>

            {/* Discount Amount */}
            <div className="flex-1 min-w-0 text-center">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-medium">Discount</div>
                {isEditMode ? (
                  <div className="flex flex-col items-center space-y-1">
                    <div className="flex items-center space-x-1">
                      <Input
                        type="number"
                        value={((editedItem.discount || 0) * 100).toFixed(1)}
                        onChange={(e) => handleFieldChange('discount', (parseFloat(e.target.value) || 0) / 100)}
                        className="h-6 text-xs text-center w-full max-w-12"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <span className="text-xs text-gray-500">%</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-xs font-medium text-center">{((item.discount || 0) * 100).toFixed(1)}%</div>
                    <div className="text-xs text-orange-600 font-medium text-center">-{currencyCode} {discountAmount.toFixed(2)}</div>
                    {showBaseCurrency && (
                      <div className="text-xs text-gray-400 text-center">-{baseCurrencyCode} {baseDiscountAmount.toFixed(2)}</div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Tax Amount */}
            <div className="flex-1 min-w-0 text-center">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-medium">Tax</div>
                {isEditMode ? (
                  <div className="flex flex-col items-center space-y-1">
                    <div className="flex items-center space-x-1">
                      <Input
                        type="number"
                        value={((editedItem.taxRate || 0) * 100).toFixed(1)}
                        onChange={(e) => handleFieldChange('taxRate', (parseFloat(e.target.value) || 0) / 100)}
                        className="h-6 text-xs text-center w-full max-w-12"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                      <span className="text-xs text-gray-500">%</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="text-xs font-medium text-center">{((item.taxRate || 0) * 100).toFixed(1)}%</div>
                    <div className="text-xs text-blue-600 font-medium text-center">+{currencyCode} {taxAmount.toFixed(2)}</div>
                    {showBaseCurrency && (
                      <div className="text-xs text-gray-400 text-center">+{baseCurrencyCode} {baseTaxAmount.toFixed(2)}</div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Net Total */}
            <div className="flex-1 min-w-0 text-right">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-medium">Net Total</div>
                <div className="font-semibold text-xs text-purple-700">{currencyCode} {netTotal.toFixed(2)}</div>
                {showBaseCurrency && (
                  <div className="text-sm text-gray-400 text-right">{baseCurrencyCode} {baseNetAmount.toFixed(2)}</div>
                )}
              </div>
            </div>

            {/* Final Total Amount */}
            <div className="flex-1 min-w-0 text-right">
              <div className="space-y-1">
                <div className="text-xs text-gray-500 font-medium">Total</div>
                <div className="font-bold text-xs text-green-600">{currencyCode} {totalAmount.toFixed(2)}</div>
                {showBaseCurrency && (
                  <div className="text-xs text-green-500 text-right">{baseCurrencyCode} {baseTotalAmount.toFixed(2)}</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Documents Links */}
        <div className="mt-3 px-4">
          <div className="flex items-center gap-4 text-xs">
            <button 
              onClick={() => setShowPRModal(true)}
              className="text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
            >
              <FileText className="h-3 w-3" />
              Related PRs (2)
            </button>
            <button 
              onClick={() => setShowGRNModal(true)}
              className="text-green-600 hover:text-green-800 hover:underline flex items-center gap-1 bg-transparent border-none cursor-pointer"
            >
              <FileText className="h-3 w-3" />
              Related GRNs (1)
            </button>
          </div>
        </div>
      </div>


      {/* Related Purchase Requests Modal */}
      {showPRModal && (
        <Dialog open={showPRModal} onOpenChange={setShowPRModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Related Purchase Requests - {item.itemName}
              </DialogTitle>
              <DialogDescription>
                Purchase requests that contributed to this purchase order item
              </DialogDescription>
            </DialogHeader>
            <PrItemsTable />
          </DialogContent>
        </Dialog>
      )}

      {/* Goods Receipt Notes Modal */}
      {showGRNModal && (
        <Dialog open={showGRNModal} onOpenChange={setShowGRNModal}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                Goods Receipt Notes - {item.itemName}
              </DialogTitle>
              <DialogDescription>
                Goods received notes for this purchase order item
              </DialogDescription>
            </DialogHeader>
            <GrnItemsTable />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

