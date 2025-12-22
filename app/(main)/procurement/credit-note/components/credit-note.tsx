/**
 * Credit Note Component
 *
 * Transaction Code Format: CN-YYMM-NNNN
 * - CN: Credit Note prefix
 * - YY: Two-digit year (e.g., 24 for 2024)
 * - MM: Two-digit month (e.g., 10 for October)
 * - NNNN: Sequential number (e.g., 001, 002, etc.)
 * Example: CN-2410-001 = Credit Note #001 from October 2024
 */

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Edit,
  Save,
  Trash2,
  Send,
  Printer,
  PanelRightOpen,
  PanelRightClose,
  History,
  ChevronLeft,
  Paperclip,
  Package,
  FileText,
  X,
  Download,
  Share,
  CheckSquare,
  CalendarIcon,
  TagIcon,
  UserIcon,
  BuildingIcon,
  DollarSign as DollarSignIcon,
  FileQuestion,
  ClipboardList,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Inventory from "./inventory";
import JournalEntries from "./journal-entries";
import TaxEntries from "./tax-entries";
import StockMovementContent from "./stock-movement";
import StatusBadge from "@/components/ui/custom-status-badge";
import { CNItemsHierarchical } from "./CNItemsHierarchical";
import { CreditNoteItem as HierarchicalCreditNoteItem } from "../lib/groupItems";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModernTransactionSummary } from "@/components/ui/modern-transaction-summary";

type CreditNoteType = "QUANTITY_RETURN" | "AMOUNT_DISCOUNT";
type CreditNoteStatus = "DRAFT" | "POSTED" | "VOID";
type CreditNoteMode = "view" | "edit" | "add";

interface CreditNoteItem {
  id: number;
  location: {
    code: string;
    name: string;
  };
  product: {
    code: string;
    name: string;
    description: string;
  };
  quantity: {
    primary: number;
    secondary: number;
  };
  unit: {
    primary: string;
    secondary: string;
  };
  price: {
    unit: number;
    secondary: number;
  };
  amounts: {
    net: number;
    tax: number;
    total: number;
    baseNet: number;
    baseTax: number;
    baseTotal: number;
  };
}

interface CreditNoteFormData {
  creditNoteNumber: string;
  date: string;
  type: CreditNoteType;
  status: CreditNoteStatus;
  vendorName: string;
  vendorCode: string;
  currency: string;
  exchangeRate: string;
  invoiceReference: string;
  invoiceDate: string;
  taxInvoiceReference: string;
  taxDate: string;
  grnReference: string;
  grnDate: string;
  reason: string;
  description: string;
}

export function CreditNoteComponent() {
  const router = useRouter();
  const [internalMode, setInternalMode] = useState<CreditNoteMode>("view");
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [formData, setFormData] = useState<CreditNoteFormData>({
    creditNoteNumber: "CN-2410-001",
    date: "2024-03-20",
    type: "QUANTITY_RETURN",
    status: "DRAFT",
    vendorName: "Thai Beverage Co.",
    vendorCode: "VEN-001",
    currency: "THB",
    exchangeRate: "1.0000",
    invoiceReference: "INV-2410-0123",
    invoiceDate: "2024-03-15",
    taxInvoiceReference: "TAX-2410-0123",
    taxDate: "2024-03-15",
    grnReference: "GRN-2410-0089",
    grnDate: "2024-03-10",
    reason: "",
    description:
      "Credit note for damaged beverage products received in last shipment. Items show signs of mishandling during transport.",
  });

  const isEditable = internalMode === "edit" || internalMode === "add";
  const isViewing = internalMode === "view";

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      console.log("Saving data:", formData);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setHasUnsavedChanges(false);
      setInternalMode("view");
    } catch (error) {
      console.error("Error saving Credit Note:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setHasUnsavedChanges(false);
    setInternalMode("view");
  };

  const handleDelete = () => {
    if (
      confirm(
        "Are you sure you want to delete this Credit Note? This action cannot be undone."
      )
    ) {
      console.log("Deleting Credit Note:", formData.creditNoteNumber);
      alert("Credit Note deleted successfully!");
      router.push("/procurement/credit-note");
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  const [newComment, setNewComment] = useState("");
  const [comments, setComments] = useState([
    {
      id: "1",
      user: "John Doe",
      avatar: "/avatars/john-doe.png",
      content: "Vendor confirmed the return details.",
      timestamp: "2024-03-20 09:30 AM",
      attachments: ["return_confirmation.pdf"],
    },
    {
      id: "2",
      user: "Jane Smith",
      avatar: "/avatars/jane-smith.png",
      content: "Quality inspection completed on returned items.",
      timestamp: "2024-03-20 02:15 PM",
      attachments: ["inspection_report.pdf", "damage_photos.zip"],
    },
  ]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj = {
        id: Date.now().toString(),
        user: "Current User",
        avatar: "/avatars/current-user.png",
        content: newComment,
        timestamp: new Date().toLocaleString(),
        attachments: [],
      };
      setComments([...comments, newCommentObj]);
      setNewComment("");
    }
  };

  const initialMockItems: HierarchicalCreditNoteItem[] = [
    {
      id: 1,
      location: {
        code: "WH-001",
        name: "Main Warehouse",
      },
      product: {
        code: "BEV-CM450-001",
        name: "Coffee mate 450 g.",
        description: "Non-dairy coffee creamer",
      },
      quantity: {
        primary: 10,
        secondary: 100,
      },
      unit: {
        primary: "Box",
        secondary: "Bag",
      },
      price: {
        unit: 1250.0,
        secondary: 125.0,
      },
      amounts: {
        net: 12500.0,
        tax: 875.0,
        total: 13375.0,
        baseNet: 437500.0,
        baseTax: 30625.0,
        baseTotal: 468125.0,
      },
      grnReference: "GRN-2410-0089",
      grnDate: "2024-03-10",
      originalQuantity: 50,
      returnQuantity: 10,
    },
    {
      id: 2,
      location: {
        code: "WH-001",
        name: "Main Warehouse",
      },
      product: {
        code: "BEV-HB330-002",
        name: "Heineken Beer 330ml",
        description: "Premium lager beer",
      },
      quantity: {
        primary: 5,
        secondary: 120,
      },
      unit: {
        primary: "Case",
        secondary: "Bottle",
      },
      price: {
        unit: 2040.0,
        secondary: 85.0,
      },
      amounts: {
        net: 10200.0,
        tax: 714.0,
        total: 10914.0,
        baseNet: 357000.0,
        baseTax: 24990.0,
        baseTotal: 381990.0,
      },
      grnReference: "GRN-2410-0089",
      grnDate: "2024-03-10",
      originalQuantity: 25,
      returnQuantity: 5,
    },
    {
      id: 3,
      location: {
        code: "WH-002",
        name: "Secondary Warehouse",
      },
      product: {
        code: "BEV-CM450-001",
        name: "Coffee mate 450 g.",
        description: "Non-dairy coffee creamer",
      },
      quantity: {
        primary: 3,
        secondary: 30,
      },
      unit: {
        primary: "Box",
        secondary: "Bag",
      },
      price: {
        unit: 1250.0,
        secondary: 125.0,
      },
      amounts: {
        net: 3750.0,
        tax: 262.5,
        total: 4012.5,
        baseNet: 131250.0,
        baseTax: 9187.5,
        baseTotal: 140437.5,
      },
      grnReference: "GRN-2410-0091",
      grnDate: "2024-03-12",
      originalQuantity: 20,
      returnQuantity: 3,
    },
  ];

  const [cnItems, setCnItems] = useState<HierarchicalCreditNoteItem[]>(initialMockItems);

  const handleItemsChange = (updatedItems: HierarchicalCreditNoteItem[]) => {
    setCnItems(updatedItems);
    setHasUnsavedChanges(true);
  };

  const auditLogs = [
    {
      id: "1",
      user: "John Doe",
      action: "Created",
      details: "Credit Note #CN-2410-001",
      timestamp: "2024-03-20 09:00 AM",
    },
    {
      id: "2",
      user: "Jane Smith",
      action: "Updated",
      details: "Changed amount from $1,000 to $2,000",
      timestamp: "2024-03-20 09:30 AM",
    },
    {
      id: "3",
      user: "Mike Johnson",
      action: "Added Item",
      details: "Added product XYZ-123",
      timestamp: "2024-03-20 10:15 AM",
    },
  ];

  // Calculate totals for ModernTransactionSummary
  const calculateTotals = () => {
    const netAmount = cnItems.reduce((sum, item) => sum + item.amounts.net, 0);
    const taxAmount = cnItems.reduce((sum, item) => sum + item.amounts.tax, 0);
    const totalAmount = cnItems.reduce((sum, item) => sum + item.amounts.total, 0);
    const baseNetAmount = cnItems.reduce((sum, item) => sum + item.amounts.baseNet, 0);
    const baseTaxAmount = cnItems.reduce((sum, item) => sum + item.amounts.baseTax, 0);
    const baseTotalAmount = cnItems.reduce((sum, item) => sum + item.amounts.baseTotal, 0);

    return {
      currency: {
        netAmount,
        taxAmount,
        totalAmount,
      },
      baseCurrency: {
        netAmount: baseNetAmount,
        taxAmount: baseTaxAmount,
        totalAmount: baseTotalAmount,
      },
    };
  };

  const documentTotals = calculateTotals();

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
        <div
          className={`flex-grow space-y-4 ${
            isSidebarVisible ? "lg:w-3/4" : "w-full"
          }`}
        >
          {/* Main Card with Header */}
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="pb-4 border-b bg-muted/10">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0 mr-1"
                      onClick={handleGoBack}
                    >
                      <ChevronLeft className="h-5 w-5" />
                      <span className="sr-only">Back to Credit Notes</span>
                    </Button>
                    <div className="flex flex-col">
                      <h1 className="text-2xl font-bold">
                        {formData.creditNoteNumber || "Credit Note"}
                      </h1>
                      <p className="text-sm text-muted-foreground mt-1">
                        Credit Note
                      </p>
                    </div>
                    <StatusBadge status={formData.status} className="h-6" />
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {/* Mode-based Actions */}
                  {internalMode === "view" ? (
                    <>
                      <Button
                        onClick={() => setInternalMode("edit")}
                        size="sm"
                        className="h-9"
                      >
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleDelete}
                        size="sm"
                        className="h-9 text-red-600 hover:bg-red-50 hover:text-red-700 border-red-200"
                        disabled={isLoading}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={handleSave}
                        size="sm"
                        className="h-9"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <Save className="mr-2 h-4 w-4" />
                        ) : (
                          <CheckSquare className="mr-2 h-4 w-4" />
                        )}
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={handleCancel}
                        size="sm"
                        className="h-9"
                        disabled={isLoading}
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </>
                  )}

                  <Button variant="outline" size="sm" className="h-9">
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" className="h-9">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" className="h-9">
                    <Share className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleSidebar}
                          className="h-9 w-9 p-0"
                        >
                          {isSidebarVisible ? (
                            <PanelRightClose className="h-4 w-4" />
                          ) : (
                            <PanelRightOpen className="h-4 w-4" />
                          )}
                          <span className="sr-only">Toggle sidebar</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>

            {/* Main Content */}
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Main Details */}
                <div className="space-y-6">
                  {/* Row 1: Credit Note #, Date, Type, Vendor */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="creditNoteNumber"
                        className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"
                      >
                        <TagIcon className="h-4 w-4" />
                        Credit Note #
                      </Label>
                      {isEditable ? (
                        <Input
                          id="creditNoteNumber"
                          name="creditNoteNumber"
                          value={formData.creditNoteNumber}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      ) : (
                        <div className="text-gray-900 font-medium">
                          {formData.creditNoteNumber}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="date"
                        className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        Date
                      </Label>
                      {isEditable ? (
                        <Input
                          id="date"
                          name="date"
                          type="date"
                          value={formData.date}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      ) : (
                        <div className="text-gray-900 font-medium">
                          {formData.date
                            ? new Date(formData.date).toLocaleDateString("en-GB")
                            : "N/A"}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="type"
                        className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"
                      >
                        <ClipboardList className="h-4 w-4" />
                        Type
                      </Label>
                      {isEditable ? (
                        <Select
                          value={formData.type}
                          onValueChange={(value) =>
                            handleSelectChange("type", value)
                          }
                        >
                          <SelectTrigger id="type" className="w-full">
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="QUANTITY_RETURN">
                              Quantity Return
                            </SelectItem>
                            <SelectItem value="AMOUNT_DISCOUNT">
                              Amount Discount
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-gray-900 font-medium">
                          {formData.type === "QUANTITY_RETURN"
                            ? "Quantity Return"
                            : "Amount Discount"}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="vendorName"
                        className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"
                      >
                        <UserIcon className="h-4 w-4" />
                        Vendor
                      </Label>
                      {isEditable ? (
                        <Input
                          id="vendorName"
                          name="vendorName"
                          value={`${formData.vendorName} (${formData.vendorCode})`}
                          onChange={(e) => {
                            const value = e.target.value;
                            const match = value.match(/(.*?)\s*\((.*?)\)/);
                            if (match) {
                              handleSelectChange("vendorName", match[1].trim());
                              handleSelectChange("vendorCode", match[2].trim());
                            } else {
                              handleSelectChange("vendorName", value);
                            }
                          }}
                          className="w-full"
                        />
                      ) : (
                        <div className="text-gray-900 font-medium">
                          {formData.vendorName} ({formData.vendorCode})
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Currency, GRN Reference, GRN Date, Reason */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="currency"
                        className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"
                      >
                        <DollarSignIcon className="h-4 w-4" />
                        Currency
                      </Label>
                      {isEditable ? (
                        <Input
                          id="currency"
                          name="currency"
                          value={`${formData.currency} (${formData.exchangeRate})`}
                          onChange={(e) => {
                            const value = e.target.value;
                            const match = value.match(/(.*?)\s*\((.*?)\)/);
                            if (match) {
                              handleSelectChange("currency", match[1].trim());
                              handleSelectChange(
                                "exchangeRate",
                                match[2].trim()
                              );
                            } else {
                              handleSelectChange("currency", value);
                            }
                          }}
                          className="w-full"
                        />
                      ) : (
                        <div className="text-gray-900 font-medium">
                          {formData.currency} ({formData.exchangeRate})
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="grnReference"
                        className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" />
                        GRN #
                      </Label>
                      {isEditable ? (
                        <Input
                          id="grnReference"
                          name="grnReference"
                          value={formData.grnReference}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      ) : (
                        <div className="text-gray-900 font-medium">
                          {formData.grnReference || "N/A"}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="grnDate"
                        className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        GRN Date
                      </Label>
                      {isEditable ? (
                        <Input
                          id="grnDate"
                          name="grnDate"
                          type="date"
                          value={formData.grnDate}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      ) : (
                        <div className="text-gray-900 font-medium">
                          {formData.grnDate
                            ? new Date(formData.grnDate).toLocaleDateString(
                                "en-GB"
                              )
                            : "N/A"}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="reason"
                        className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"
                      >
                        <FileQuestion className="h-4 w-4" />
                        Reason
                      </Label>
                      {isEditable ? (
                        <Select
                          value={formData.reason}
                          onValueChange={(value) =>
                            handleSelectChange("reason", value)
                          }
                        >
                          <SelectTrigger id="reason" className="w-full">
                            <SelectValue placeholder="Select reason" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="DAMAGED">Damaged</SelectItem>
                            <SelectItem value="EXPIRED">Expired</SelectItem>
                            <SelectItem value="WRONG_DELIVERY">
                              Wrong Delivery
                            </SelectItem>
                            <SelectItem value="QUALITY_ISSUE">
                              Quality Issue
                            </SelectItem>
                            <SelectItem value="PRICE_ADJUSTMENT">
                              Price Adjustment
                            </SelectItem>
                            <SelectItem value="OTHER">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <div className="text-gray-900 font-medium">
                          {formData.reason || "Not specified"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Row 3: Invoice Reference, Invoice Date, Tax Invoice Reference, Tax Invoice Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="invoiceReference"
                        className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"
                      >
                        <BuildingIcon className="h-4 w-4" />
                        Invoice #
                      </Label>
                      {isEditable ? (
                        <Input
                          id="invoiceReference"
                          name="invoiceReference"
                          value={formData.invoiceReference}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      ) : (
                        <div className="text-gray-900 font-medium">
                          {formData.invoiceReference || "N/A"}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="invoiceDate"
                        className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        Invoice Date
                      </Label>
                      {isEditable ? (
                        <Input
                          id="invoiceDate"
                          name="invoiceDate"
                          type="date"
                          value={formData.invoiceDate}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      ) : (
                        <div className="text-gray-900 font-medium">
                          {formData.invoiceDate
                            ? new Date(formData.invoiceDate).toLocaleDateString(
                                "en-GB"
                              )
                            : "N/A"}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="taxInvoiceReference"
                        className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"
                      >
                        <FileText className="h-4 w-4" />
                        Tax Invoice #
                      </Label>
                      {isEditable ? (
                        <Input
                          id="taxInvoiceReference"
                          name="taxInvoiceReference"
                          value={formData.taxInvoiceReference}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      ) : (
                        <div className="text-gray-900 font-medium">
                          {formData.taxInvoiceReference || "N/A"}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="taxDate"
                        className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"
                      >
                        <CalendarIcon className="h-4 w-4" />
                        Tax Invoice Date
                      </Label>
                      {isEditable ? (
                        <Input
                          id="taxDate"
                          name="taxDate"
                          type="date"
                          value={formData.taxDate}
                          onChange={handleInputChange}
                          className="w-full"
                        />
                      ) : (
                        <div className="text-gray-900 font-medium">
                          {formData.taxDate
                            ? new Date(formData.taxDate).toLocaleDateString(
                                "en-GB"
                              )
                            : "N/A"}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description Field */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="description"
                      className="text-sm text-muted-foreground mb-1 block flex items-center gap-1"
                    >
                      <FileText className="h-4 w-4" />
                      Description
                    </Label>
                    {isEditable ? (
                      <Textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        placeholder="Enter a detailed description..."
                        className="min-h-[100px]"
                      />
                    ) : (
                      <div className="text-gray-900 font-medium">
                        {formData.description || "No description provided"}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabs Section */}
          <Card className="shadow-sm">
            <Tabs defaultValue="itemDetails" className="w-full">
              <TabsList className="grid w-full grid-cols-4 rounded-none border-b bg-muted/10">
                <TabsTrigger value="itemDetails">Item Details</TabsTrigger>
                <TabsTrigger value="stockMovement">Stock Movement</TabsTrigger>
                <TabsTrigger value="journalEntries">Journal Entries</TabsTrigger>
                <TabsTrigger value="taxEntries">Tax Entries</TabsTrigger>
              </TabsList>
              <TabsContent value="itemDetails" className="p-6">
                <CNItemsHierarchical
                  mode={internalMode}
                  items={cnItems}
                  onItemsChange={handleItemsChange}
                  currency={formData.currency}
                />
              </TabsContent>
              <TabsContent value="stockMovement" className="p-6">
                <StockMovementContent />
              </TabsContent>
              <TabsContent value="journalEntries" className="p-6">
                <JournalEntries />
              </TabsContent>
              <TabsContent value="taxEntries" className="p-6">
                <TaxEntries />
              </TabsContent>
            </Tabs>
          </Card>

          {/* Transaction Summary - Using ModernTransactionSummary */}
          <ModernTransactionSummary
            currency={formData.currency}
            baseCurrency="THB"
            exchangeRate={parseFloat(formData.exchangeRate) || 1}
            subtotal={documentTotals.currency.netAmount}
            discount={0}
            netAmount={documentTotals.currency.netAmount}
            tax={documentTotals.currency.taxAmount}
            totalAmount={documentTotals.currency.totalAmount}
          />
        </div>

        {/* Sidebar */}
        {isSidebarVisible && (
          <div className="lg:w-1/4 pt-0 space-y-4">
            {/* Comments & Attachments Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b bg-muted/10">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Paperclip className="h-4 w-4" />
                  Comments & Attachments
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {comments.map((comment) => (
                    <div
                      key={comment.id}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-start space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage
                            src={comment.avatar}
                            alt={comment.user}
                          />
                          <AvatarFallback>
                            {comment.user.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-medium text-sm">
                              {comment.user}
                            </h4>
                            <span className="text-xs text-muted-foreground">
                              {comment.timestamp}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
                          {comment.attachments &&
                            comment.attachments.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {comment.attachments.map(
                                  (attachment, index) => (
                                    <a
                                      key={index}
                                      href="#"
                                      className="inline-flex items-center text-xs text-blue-600 hover:underline bg-blue-50 px-2 py-1 rounded"
                                    >
                                      <Paperclip className="h-3 w-3 mr-1" />
                                      {attachment}
                                    </a>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t space-y-3">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[80px]"
                  />
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm">
                      <Paperclip className="h-4 w-4 mr-2" />
                      Attach
                    </Button>
                    <Button size="sm" onClick={handleAddComment}>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Activity Log Card */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b bg-muted/10">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Activity Log
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start space-x-3 border-b pb-3 last:border-0 last:pb-0"
                    >
                      <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground flex-shrink-0">
                        <History className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="text-sm">
                          <span className="font-medium">{log.user}</span>
                          <span className="text-muted-foreground">
                            {" "}
                            {log.action.toLowerCase()}{" "}
                          </span>
                          <span>{log.details}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {log.timestamp}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

    </div>
  );
}
