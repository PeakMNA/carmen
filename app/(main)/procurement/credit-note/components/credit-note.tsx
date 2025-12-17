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

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/custom-dialog";
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
  XIcon,
  Paperclip,
  Plus,
  Info,
  Package,
  FileText,
  MoreVertical,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { Button } from "@/components/ui/button";
import { CnLotApplication } from "./cn-lot-application";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import Inventory from "./inventory"
import JournalEntries  from "./journal-entries"
import TaxEntries  from "./tax-entries"
import { StockMovementTab } from "./StockMovementTab"
import StockMovementContent from "./stock-movement";
import StatusBadge from "@/components/ui/custom-status-badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type CreditNoteType = "QUANTITY_RETURN" | "AMOUNT_DISCOUNT";
type CreditNoteStatus = "DRAFT" | "POSTED" | "VOID";
type CreditNoteReason =
  | "PRICING_ERROR"
  | "DAMAGED_GOODS"
  | "RETURN"
  | "DISCOUNT_AGREEMENT"
  | "OTHER";

interface CreditNoteHeaderProps {
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
  onHeaderChange: (field: string, value: string) => void;
  showPanel: boolean;
  setShowPanel: (show: boolean) => void;
}

function CreditNoteHeader({
  creditNoteNumber,
  date,
  type,
  status,
  vendorName,
  vendorCode,
  currency,
  exchangeRate,
  invoiceReference,
  invoiceDate,
  taxInvoiceReference,
  taxDate,
  grnReference,
  grnDate,
  reason,
  description,
  onHeaderChange,
  showPanel,
  setShowPanel,
}: CreditNoteHeaderProps) {
  return (
    <Card className="w-full mb-4">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-semibold">Credit Note</h2>
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  status === 'DRAFT'
                  ? 'bg-gray-100 text-gray-800'
                  : status === 'POSTED'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
                }`}>
                {status}
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="default" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" size="sm">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button variant="default" size="sm">
              <Save className="h-4 w-4 mr-2" />
              Commit
            </Button>
            <Button variant="outline" size="sm">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <Button variant="outline" size="sm">
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPanel(!showPanel)}
            >
              {showPanel ? (
                <PanelRightClose className="h-4 w-4" />
              ) : (
                <PanelRightOpen className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 px-6">
          <div className="space-y-2">
            <Label htmlFor="creditNoteNumber">Credit Note #</Label>
            <Input
              id="creditNoteNumber"
              value={creditNoteNumber}
              onChange={(e) =>
                onHeaderChange("creditNoteNumber", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => onHeaderChange("date", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Type</Label>
            <Select
              value={type}
              onValueChange={(value) => onHeaderChange("type", value)}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="QUANTITY_RETURN">Quantity Return</SelectItem>
                <SelectItem value="AMOUNT_DISCOUNT">Amount Discount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="vendorName">Vendor</Label>
            <Input
              id="vendorName"
              value={`${vendorName} (${vendorCode})`}
              onChange={(e) => {
                const value = e.target.value;
                const match = value.match(/(.*?)\s*\((.*?)\)/);
                if (match) {
                  onHeaderChange("vendorName", match[1].trim());
                  onHeaderChange("vendorCode", match[2].trim());
                } else {
                  onHeaderChange("vendorName", value);
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={`${currency} (${exchangeRate})`}
              onChange={(e) => {
                const value = e.target.value;
                const match = value.match(/(.*?)\s*\((.*?)\)/);
                if (match) {
                  onHeaderChange("currency", match[1].trim());
                  onHeaderChange("exchangeRate", match[2].trim());
                } else {
                  onHeaderChange("currency", value);
                }
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grnReference">GRN #</Label>
            <Input
              id="grnReference"
              value={grnReference}
              onChange={(e) => onHeaderChange("grnReference", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="grnDate">GRN Date</Label>
            <Input
              id="grnDate"
              value={grnDate}
              onChange={(e) => onHeaderChange("grnDate", e.target.value)}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="reason">Reason</Label>
            <Select
              value={reason}
              onValueChange={(value) => onHeaderChange("reason", value)}
            >
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DAMAGED">Damaged</SelectItem>
                <SelectItem value="EXPIRED">Expired</SelectItem>
                <SelectItem value="WRONG_DELIVERY">Wrong Delivery</SelectItem>
                <SelectItem value="QUALITY_ISSUE">Quality Issue</SelectItem>
                <SelectItem value="PRICE_ADJUSTMENT">Price Adjustment</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceReference">Invoice #</Label>
            <Input
              id="invoiceReference"
              value={invoiceReference}
              onChange={(e) =>
                onHeaderChange("invoiceReference", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="invoiceDate">Invoice Date</Label>
            <Input
              id="invoiceDate"
              type="date"
              value={invoiceDate}
              onChange={(e) => onHeaderChange("invoiceDate", e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxInvoiceReference">Tax Invoice #</Label>
            <Input
              id="taxInvoiceReference"
              value={taxInvoiceReference}
              onChange={(e) =>
                onHeaderChange("taxInvoiceReference", e.target.value)
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="taxDate">Tax Invoice Date</Label>
            <Input
              id="taxDate"
              value={taxDate}
              onChange={(e) => onHeaderChange("taxDate", e.target.value)}
            />
          </div>
          <div className="space-y-2 col-span-full">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => onHeaderChange("description", e.target.value)}
              placeholder="Enter a detailed description..."
              className="min-h-[100px]"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface CreditNoteItem {
  id: number
  location: {
    code: string
    name: string
  }
  product: {
    code: string
    name: string
    description: string
  }
  quantity: {
    primary: number
    secondary: number
  }
  unit: {
    primary: string
    secondary: string
  }
  price: {
    unit: number
    secondary: number
  }
  amounts: {
    net: number
    tax: number
    total: number
    baseNet: number
    baseTax: number
    baseTotal: number
  }
}

export function CreditNoteComponent() {
  const [showPanel, setShowPanel] = useState(false);
  const [headerData, setHeaderData] = useState({
    creditNoteNumber: "CN-2410-001",
    date: "2024-03-20",
    type: "QUANTITY_RETURN" as CreditNoteType,
    status: "DRAFT" as CreditNoteStatus,
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
    description: "Credit note for damaged beverage products received in last shipment. Items show signs of mishandling during transport.",
  });

  const handleHeaderChange = (field: string, value: string) => {
    setHeaderData((prev) => ({ ...prev, [field]: value }));
  };

  const [openInfo, setOpenInfo] = useState(Boolean);

  const handleOpeninfo = () => {
    setOpenInfo(!openInfo);
  };

  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([
    {
      id: '1',
      user: 'John Doe',
      avatar: '/avatars/john-doe.png',
      content: 'Vendor confirmed the return details.',
      timestamp: '2024-03-20 09:30 AM',
      attachments: ['return_confirmation.pdf'],
    },
    {
      id: '2',
      user: 'Jane Smith',
      avatar: '/avatars/jane-smith.png',
      content: 'Quality inspection completed on returned items.',
      timestamp: '2024-03-20 02:15 PM',
      attachments: ['inspection_report.pdf', 'damage_photos.zip'],
    },
  ]);

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj = {
        id: Date.now().toString(),
        user: 'Current User',
        avatar: '/avatars/current-user.png',
        content: newComment,
        timestamp: new Date().toLocaleString(),
        attachments: [], // Initialize with empty attachments array
      };
      setComments([...comments, newCommentObj]);
      setNewComment('');
    }
  };

  const mockStockMovements = [
    {
      id: 1,
      commitDate: '2024-01-15',
      postingDate: '2024-01-15',
      movementType: 'CREDIT_NOTE',
      sourceDocument: 'CN-2410-001', 
      store: 'WH-001',
      status: 'Posted',
      items: [
        {
          id: 1,
          productName: 'Coffee mate 450 g.',
          sku: 'BEV-CM450-001',
          uom: 'Bag',
          beforeQty: 200,
          inQty: 0,
          outQty: 50,
          afterQty: 150,
          unitCost: 125.00,
          totalCost: -6250.00,
          location: {
            type: 'INV',
            code: 'WH-001',
            name: 'Main Warehouse',
            displayType: 'Inventory'
          },
          lots: [
            {
              lotNo: 'L20240115-001',
              quantity: -30,
              uom: 'Bag'
            },
            {
              lotNo: 'L20240115-002', 
              quantity: -20,
              uom: 'Bag'
            }
          ]
        },
        {
          id: 2,
          productName: 'Heineken Beer 330ml',
          sku: 'BEV-HB330-002',
          uom: 'Bottle',
          beforeQty: 470,
          inQty: 0,
          outQty: 120,
          afterQty: 350,
          unitCost: 85.00,
          totalCost: -10200.00,
          location: {
            type: 'DIR',
            code: 'BAR-001',
            name: 'Main Bar',
            displayType: 'Direct'
          },
          lots: [
            {
              lotNo: 'L20240115-003',
              quantity: -120,
              uom: 'Bottle'
            }
          ]
        },
        {
          id: 3,
          productName: 'Bath Towel Premium White',
          sku: 'HK-BT700-001',
          uom: 'Piece',
          beforeQty: 250,
          inQty: 0,
          outQty: 50,
          afterQty: 200,
          unitCost: 450.00,
          totalCost: -22500.00,
          location: {
            type: 'DIR',
            code: 'HK-001',
            name: 'Housekeeping Store',
            displayType: 'Direct'
          },
          lots: [
            {
              lotNo: 'L20240115-004',
              quantity: -50,
              uom: 'Piece'
            }
          ]
        }
      ],
      totals: {
        inQty: 0,
        outQty: 220,
        totalCost: -38950.00,
        lotCount: 4
      },
      movement: {
        source: 'Multiple',
        sourceName: 'Multiple Locations',
        destination: 'Supplier',
        destinationName: 'Thai Beverage Co.',
        type: 'Stock Return'
      }
    }
  ]

  const mockItems: CreditNoteItem[] = [
    {
      id: 1,
      location: {
        code: 'WH-001',
        name: 'Main Warehouse'
      },
      product: {
        code: 'BEV-CM450-001',
        name: 'Coffee mate 450 g.',
        description: 'Non-dairy coffee creamer'
      },
      quantity: {
        primary: 10,
        secondary: 100
      },
      unit: {
        primary: 'Box',
        secondary: 'Bag'
      },
      price: {
        unit: 1250.00,
        secondary: 125.00
      },
      amounts: {
        net: 12500.00,
        tax: 875.00,
        total: 13375.00,
        baseNet: 437500.00,
        baseTax: 30625.00,
        baseTotal: 468125.00
      }
    },
    {
      id: 2,
      location: {
        code: 'WH-001',
        name: 'Main Warehouse'
      },
      product: {
        code: 'BEV-HB330-002',
        name: 'Heineken Beer 330ml',
        description: 'Premium lager beer'
      },
      quantity: {
        primary: 5,
        secondary: 120
      },
      unit: {
        primary: 'Case',
        secondary: 'Bottle'
      },
      price: {
        unit: 2040.00,
        secondary: 85.00
      },
      amounts: {
        net: 10200.00,
        tax: 714.00,
        total: 10914.00,
        baseNet: 357000.00,
        baseTax: 24990.00,
        baseTotal: 381990.00
      }
    }
  ]

  const auditLogs = [
    {
      id: '1',
      user: 'John Doe',
      action: 'Created',
      details: 'Credit Note #CN-2410-001',
      timestamp: '2024-03-20 09:00 AM'
    },
    {
      id: '2',
      user: 'Jane Smith',
      action: 'Updated',
      details: 'Changed amount from $1,000 to $2,000',
      timestamp: '2024-03-20 09:30 AM'
    },
    {
      id: '3',
      user: 'Mike Johnson',
      action: 'Added Item',
      details: 'Added product XYZ-123',
      timestamp: '2024-03-20 10:15 AM'
    }
  ];

  return (
    <div className="space-y-4">
      <div className={`flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4`}>
        <div className={`flex-grow space-y-4 ${showPanel ? 'lg:w-3/4' : 'w-full'}`}>
          <CreditNoteHeader 
            {...headerData}
            onHeaderChange={handleHeaderChange} 
            showPanel={showPanel} 
            setShowPanel={setShowPanel} 
          />
          <Tabs defaultValue="itemDetails" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="itemDetails">Item Details</TabsTrigger>
              <TabsTrigger value="stockMovement">Stock Movement</TabsTrigger>
              <TabsTrigger value="journalEntries">Journal Entries</TabsTrigger>
              <TabsTrigger value="taxEntries">Tax Entries</TabsTrigger>
            </TabsList>
            <TabsContent value="itemDetails">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Item Details</CardTitle>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[200px]">Location</TableHead>
                        <TableHead className="w-[200px]">Product</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Unit</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Net Amount</TableHead>
                        <TableHead>Tax Amount</TableHead>
                        <TableHead>Total Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>
                            <div>{item.location.name}</div>
                            <div className="text-sm text-muted-foreground">{item.location.code}</div>
                          </TableCell>
                          <TableCell className="font-medium">
                            <div>{item.product.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.product.description}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>{item.quantity.primary}</div>
                            <div className="text-sm text-muted-foreground">{item.quantity.secondary}</div>
                          </TableCell>
                          <TableCell>
                            <div>{item.unit.primary}</div>
                            <div className="text-sm text-muted-foreground">{item.unit.secondary}</div>
                          </TableCell>
                          <TableCell>
                            <div>{item.price.unit.toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.price.secondary.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>{item.amounts.net.toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.amounts.baseNet.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>{item.amounts.tax.toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.amounts.baseTax.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>{item.amounts.total.toFixed(2)}</div>
                            <div className="text-sm text-muted-foreground">
                              {item.amounts.baseTotal.toFixed(2)}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end items-center space-x-1">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 rounded-full"
                                onClick={() => handleOpeninfo()}
                              >
                                <FileText className="h-4 w-4" />
                                <span className="sr-only">View Details</span>
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="h-8 w-8 rounded-full"
                              >
                                <Edit className="h-4 w-4" />
                                <span className="sr-only">Edit</span>
                              </Button>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon"
                                    className="h-8 w-8 rounded-full"
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                    <span className="sr-only">More Options</span>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleOpeninfo()}>
                                    <FileText className="h-4 w-4 mr-2" />
                                    View Details
                                  </DropdownMenuItem>
                                  <DropdownMenuItem>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="stockMovement">
              <StockMovementContent />
            </TabsContent>
            <TabsContent value="journalEntries">
              <JournalEntries />
            </TabsContent>
            <TabsContent value="taxEntries">
              <TaxEntries />
            </TabsContent>
          </Tabs>
          <Card>
            <CardHeader>
              <CardTitle>Transaction Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount (USD)</TableHead>
                      <TableHead className="text-right">Base Amount (PHP)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell>Sub Total Amount</TableCell>
                      <TableCell className="text-right">2,000.00</TableCell>
                      <TableCell className="text-right">100,000.00</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Tax Amount</TableCell>
                      <TableCell className="text-right">200.00</TableCell>
                      <TableCell className="text-right">10,000.00</TableCell>
                    </TableRow>
                    <TableRow className="font-bold">
                      <TableCell>Total Amount</TableCell>
                      <TableCell className="text-right">2,100.00</TableCell>
                      <TableCell className="text-right">105,000.00</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {showPanel && (
          <div className="lg:w-1/4 pt-0 space-y-4">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle>Comments & Attachments</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4 mb-4">
                  {comments.map((comment) => (
                    <Card key={comment.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-4">
                          <Avatar>
                            <AvatarImage src={comment.avatar} alt={comment.user} />
                            <AvatarFallback>{comment.user.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex justify-between items-center">
                              <h3 className="font-semibold">{comment.user}</h3>
                              <span className="text-sm text-gray-500">{comment.timestamp}</span>
                            </div>
                            <p className="mt-1">{comment.content}</p>
                            {comment.attachments && comment.attachments.length > 0 && (
                              <div className="mt-2">
                                <h4 className="text-sm font-semibold">Attachments:</h4>
                                <ul className="list-disc list-inside">
                                  {comment.attachments.map((attachment, index) => (
                                    <li key={index} className="text-sm text-blue-500 hover:underline">
                                      <a href="#">{attachment}</a>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="flex items-start space-x-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="flex-1"
                  />
                  <div className="space-y-2">
                    <Button variant="outline" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <Button onClick={handleAddComment}>
                      <Send className="h-4 w-4 mr-2" />
                      Send
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Audit Log</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-4 border-b pb-3 last:border-0">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                        <History className="h-4 w-4" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-medium">{log.user}</span>
                            <span className="text-gray-500"> {log.action.toLowerCase()} </span>
                            <span>{log.details}</span>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500">
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
      <Dialog open={openInfo} onOpenChange={setOpenInfo}>
        <DialogContent className="sm:max-w-[80vw] bg-white [&>button]:hidden">
          <DialogHeader>
            <div className="flex justify-between w-full items-center border-b pb-4">
              <DialogTitle>
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-gray-500 mr-2" />
                  <h2 className="text-lg font-medium text-gray-900">
                    Product Information
                  </h2>
                </div>
              </DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="sm">
                  <XIcon className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </DialogHeader>

          <CnLotApplication />
        </DialogContent>
      </Dialog>
    </div>
  );
}
