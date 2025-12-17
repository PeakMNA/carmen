/**
 * Purchase Request Items API Route
 *
 * Transaction Code Format: PREFIX-YYMM-NNNN
 * - PREFIX: Document type (PL = Pricelist, PR = Purchase Request, etc.)
 * - YY: Two-digit year (e.g., 24 for 2024)
 * - MM: Two-digit month (e.g., 10 for October)
 * - NNNN: Sequential number (e.g., 001, 002, etc.)
 * Example: PL-2410-001 = Pricelist #001 from October 2024
 */

import { NextRequest, NextResponse } from 'next/server';
import { EnhancedPRItem, DocumentStatus, WorkflowStageStatus, WorkflowStageType, UserRole, WorkflowStage } from '@/app/(main)/procurement/purchase-requests/components/tabs/UpdatedEnhancedItemsTab';

// Type alias for backward compatibility
type EnhancedItemStatus = string;

// Mock database - In real implementation, this would be your database
// Transaction codes use format: PL-YYMM-NNNN (e.g., PL-2410-001 = Pricelist #001, October 2024)
let mockItems: any[] = [
  {
    id: "item-001",
    location: "Main Office",
    productName: "Office Supplies - A4 Paper",
    requestQuantity: 50,
    requestUnit: "boxes",
    requiredDate: new Date("2024-02-15"),
    comment: "Urgent requirement for monthly reports",
    documentStatus: "inprogress" as DocumentStatus,
    currentStage: "hdApproval" as WorkflowStageType,
    workflowStages: {
      request: {
        status: "approved" as WorkflowStageStatus,
        completedBy: "john.doe",
        completedAt: new Date("2024-01-15"),
        comments: "Initial request submitted"
      },
      hdApproval: {
        status: "pending" as WorkflowStageStatus,
        assignedTo: "hd.manager",
        comments: "Awaiting HD approval"
      },
      purchaseReview: { status: "draft" as WorkflowStageStatus },
      financeManager: { status: "draft" as WorkflowStageStatus },
      gmApproval: { status: "draft" as WorkflowStageStatus }
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
    description: "High quality A4 paper for office use",
    unit: "boxes",
    quantityRequested: 50,
    quantityApproved: 45,
    deliveryDate: new Date("2024-02-15"),
    deliveryPoint: "Main Office",
    currency: "USD",
    currencyRate: 1,
    price: 25.50,
    foc: 0,
    taxIncluded: false,
    adjustments: { tax: true },
    discountRate: 0,
    taxRate: 7,
    vendor: "ABC Supplies Inc.",
    pricelistNumber: "PL-2410-001",
    itemCategory: "Office Supplies",
    itemSubcategory: "Paper Products",
    status: "Pending" as DocumentStatus,
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
    baseSubTotalPrice: 1275,
    subTotalPrice: 1275,
    baseNetAmount: 1275,
    netAmount: 1275,
    baseDiscAmount: 0,
    discountAmount: 0,
    baseTaxAmount: 89.25,
    taxAmount: 89.25,
    baseTotalAmount: 1364.25,
    totalAmount: 1364.25,
  },
  {
    id: "item-002",
    location: "IT Department",
    productName: "Computer Equipment - Wireless Mouse",
    requestQuantity: 10,
    requestUnit: "pieces",
    requiredDate: new Date("2024-02-20"),
    comment: "Replacement for damaged equipment",
    approvedQuantity: 8,
    approvedUnit: "pieces",
    estimatedUnitPrice: 45.00,
    estimatedTotalPrice: 360.00,
    estimatedVendorName: "Tech Solutions Ltd.",
    priceEstimateSource: "catalog_estimate",
    priceEstimateAccuracy: 92,
    purchaserEstimatedPrice: 42.00,
    purchaserVendorId: "vendor-tech-002",
    purchaserNotes: "Found better price with alternative vendor",
    documentStatus: "approved" as DocumentStatus,
    createdBy: "jane.smith",
    lastModifiedBy: "mike.johnson",
    version: 3,
    // Legacy fields
    name: "Computer Equipment - Wireless Mouse",
    description: "Ergonomic wireless mouse with USB receiver",
    unit: "pieces",
    quantityRequested: 10,
    quantityApproved: 8,
    deliveryDate: new Date("2024-02-20"),
    deliveryPoint: "IT Department",
    currency: "USD",
    currencyRate: 1,
    price: 45.00,
    foc: 0,
    taxIncluded: false,
    adjustments: { tax: true },
    discountRate: 0,
    taxRate: 7,
    vendor: "Tech Solutions Ltd.",
    pricelistNumber: "PL-2410-002",
    itemCategory: "Computer Equipment",
    itemSubcategory: "Peripherals",
    status: "Approved" as DocumentStatus,
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
    baseSubTotalPrice: 450,
    subTotalPrice: 450,
    baseNetAmount: 450,
    netAmount: 450,
    baseDiscAmount: 0,
    discountAmount: 0,
    baseTaxAmount: 31.50,
    taxAmount: 31.50,
    baseTotalAmount: 481.50,
    totalAmount: 481.50,
  },
  {
    id: "item-003",
    location: "Warehouse",
    productName: "Safety Equipment - Hard Hats",
    requestQuantity: 20,
    requestUnit: "pieces",
    requiredDate: new Date("2024-02-25"),
    comment: "Safety compliance requirement",
    documentStatus: "inprogress" as DocumentStatus,
    reviewComments: "Please verify safety certification standards",
    createdBy: "bob.wilson",
    lastModifiedBy: "sarah.davis",
    version: 2,
    // Legacy fields
    name: "Safety Equipment - Hard Hats",
    description: "ANSI compliant safety hard hats",
    unit: "pieces",
    quantityRequested: 20,
    quantityApproved: 0,
    deliveryDate: new Date("2024-02-25"),
    deliveryPoint: "Warehouse",
    currency: "USD",
    currencyRate: 1,
    price: 35.00,
    foc: 0,
    taxIncluded: false,
    adjustments: { tax: true },
    discountRate: 0,
    taxRate: 7,
    vendor: "Safety First Co.",
    pricelistNumber: "PL-2410-003",
    itemCategory: "Safety Equipment",
    itemSubcategory: "Personal Protective Equipment",
    status: "Review" as DocumentStatus,
    inventoryInfo: {
      onHand: 8,
      onOrdered: 0,
      reorderLevel: 5,
      restockLevel: 25,
      averageMonthlyUsage: 3,
      lastPrice: 32.00,
      lastOrderDate: new Date("2023-11-20"),
      lastVendor: "Industrial Safety Supply",
      inventoryUnit: "pieces"
    },
    accountCode: "ACC-003",
    jobCode: "JOB-003",
    baseSubTotalPrice: 700,
    subTotalPrice: 700,
    baseNetAmount: 700,
    netAmount: 700,
    baseDiscAmount: 0,
    discountAmount: 0,
    baseTaxAmount: 49.00,
    taxAmount: 49.00,
    baseTotalAmount: 749.00,
    totalAmount: 749.00,
  },
  {
    id: "item-004",
    location: "Marketing Department",
    productName: "Promotional Materials - Banners",
    requestQuantity: 5,
    requestUnit: "pieces",
    requiredDate: new Date("2024-03-01"),
    comment: "For upcoming trade show",
    approvedQuantity: 5,
    approvedUnit: "pieces",
    estimatedUnitPrice: 150.00,
    estimatedTotalPrice: 750.00,
    estimatedVendorName: "Print Pro Services",
    priceEstimateSource: "historical_average",
    priceEstimateAccuracy: 78,
    purchaserEstimatedPrice: 145.00,
    purchaserVendorId: "vendor-print-001",
    actualUnitPrice: 142.50,
    actualTotalPrice: 712.50,
    purchaseDate: new Date("2024-01-20"),
    documentStatus: "approved" as DocumentStatus,
    createdBy: "lisa.chen",
    lastModifiedBy: "david.kim",
    version: 4,
    // Legacy fields
    name: "Promotional Materials - Banners",
    description: "Custom printed banners for marketing events",
    unit: "pieces",
    quantityRequested: 5,
    quantityApproved: 5,
    deliveryDate: new Date("2024-03-01"),
    deliveryPoint: "Marketing Department",
    currency: "USD",
    currencyRate: 1,
    price: 150.00,
    foc: 0,
    taxIncluded: false,
    adjustments: { tax: true },
    discountRate: 0,
    taxRate: 7,
    vendor: "Print Pro Services",
    pricelistNumber: "PL-2410-004",
    itemCategory: "Marketing Materials",
    itemSubcategory: "Promotional Items",
    status: "Approved" as DocumentStatus,
    inventoryInfo: {
      onHand: 0,
      onOrdered: 5,
      reorderLevel: 0,
      restockLevel: 10,
      averageMonthlyUsage: 2,
      lastPrice: 155.00,
      lastOrderDate: new Date("2023-10-15"),
      lastVendor: "Creative Prints",
      inventoryUnit: "pieces"
    },
    accountCode: "ACC-004",
    jobCode: "JOB-004",
    baseSubTotalPrice: 750,
    subTotalPrice: 750,
    baseNetAmount: 750,
    netAmount: 750,
    baseDiscAmount: 0,
    discountAmount: 0,
    baseTaxAmount: 52.50,
    taxAmount: 52.50,
    baseTotalAmount: 802.50,
    totalAmount: 802.50,
  }
];

// Helper function to filter items based on user role
function filterItemsByRole(items: any[], userRole: UserRole): any[] {
  return items.map(item => {
    const filteredItem = { ...item };
    
    // Hide financial information from staff
    if (userRole === 'staff') {
      delete filteredItem.estimatedUnitPrice;
      delete filteredItem.estimatedTotalPrice;
      delete filteredItem.estimatedVendorName;
      delete filteredItem.priceEstimateSource;
      delete filteredItem.priceEstimateAccuracy;
      delete filteredItem.purchaserEstimatedPrice;
      delete filteredItem.purchaserVendorId;
      delete filteredItem.purchaserNotes;
      delete filteredItem.actualUnitPrice;
      delete filteredItem.actualTotalPrice;
    }
    
    return filteredItem;
  });
}

// GET /api/pr/[prId]/items - Get all items for a PR
export async function GET(
  request: NextRequest,
  { params }: { params: { prId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userRole = (searchParams.get('userRole') as UserRole) || 'staff';
    const status = searchParams.get('status');
    const search = searchParams.get('search');
    
    // Filter items by PR ID (in real implementation, this would be a database query)
    let filteredItems = mockItems.filter(item => true); // All items for demo
    
    // Apply status filter
    if (status && status !== 'all') {
      filteredItems = filteredItems.filter(item => (item.documentStatus as any) === status);
    }
    
    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase();
      filteredItems = filteredItems.filter(item => 
        item.productName.toLowerCase().includes(searchLower) ||
        item.location.toLowerCase().includes(searchLower) ||
        item.comment.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter based on user role permissions
    const roleFilteredItems = filterItemsByRole(filteredItems, userRole);
    
    // Calculate summary
    const summary = {
      totalItems: roleFilteredItems.length,
      pendingApproval: roleFilteredItems.filter(item => (item.documentStatus as any).includes('pending')).length,
      approved: roleFilteredItems.filter(item => (item.documentStatus as any).includes('approved')).length,
      totalEstimatedValue: userRole !== 'staff' 
        ? roleFilteredItems.reduce((sum, item) => sum + (item.estimatedTotalPrice || 0), 0)
        : 0
    };
    
    return NextResponse.json({
      items: roleFilteredItems,
      summary,
      userPermissions: {
        canEdit: roleFilteredItems.filter(item => {
          switch (userRole) {
            case 'staff':
              return (item.documentStatus as any) === 'draft' || (item.documentStatus as any) === 'review';
            case 'hd':
              return (item.documentStatus as any) === 'pending_hd';
            case 'purchase_staff':
              return ['hd_approved', 'pending_manager', 'manager_approved'].includes(item.documentStatus as any);
            case 'finance_manager':
              return (item.documentStatus as any) === 'pending_manager';
            default:
              return false;
          }
        }).map(item => item.id),
        canApprove: roleFilteredItems.filter(item => {
          switch (userRole) {
            case 'hd':
              return (item.documentStatus as any) === 'pending_hd';
            case 'finance_manager':
              return (item.documentStatus as any) === 'pending_manager';
            default:
              return false;
          }
        }).map(item => item.id),
        canSplit: ['hd', 'purchase_staff'].includes(userRole)
      }
    });
  } catch (error) {
    console.error('Error fetching PR items:', error);
    return NextResponse.json(
      { error: 'Failed to fetch PR items' },
      { status: 500 }
    );
  }
}

// POST /api/pr/[prId]/items - Create new item
export async function POST(
  request: NextRequest,
  { params }: { params: { prId: string } }
) {
  try {
    const body = await request.json();
    const { searchParams } = new URL(request.url);
    const userRole = (searchParams.get('userRole') as UserRole) || 'staff';
    
    // Validate user can create items
    if (userRole !== 'staff') {
      return NextResponse.json(
        { error: 'Only staff can create new items' },
        { status: 403 }
      );
    }
    
    // Create new item
    const newItem: any = {
      id: `item-${Date.now()}`,
      location: body.location,
      productName: body.productName,
      requestQuantity: body.requestQuantity,
      requestUnit: body.requestUnit,
      requiredDate: new Date(body.requiredDate),
      comment: body.comment || '',
      documentStatus: 'draft' as DocumentStatus,
      createdBy: 'current-user', // Would come from auth
      lastModifiedBy: 'current-user',
      version: 1,
      // Legacy fields for compatibility
      name: body.productName,
      description: body.productName,
      unit: body.requestUnit,
      quantityRequested: body.requestQuantity,
      quantityApproved: 0,
      deliveryDate: new Date(body.requiredDate),
      deliveryPoint: body.location,
      currency: "USD",
      currencyRate: 1,
      price: 0,
      foc: 0,
      taxIncluded: false,
      adjustments: { tax: true },
      discountRate: 0,
      taxRate: 7,
      vendor: "",
      pricelistNumber: "",
      itemCategory: "General",
      itemSubcategory: "General",
      status: "Pending",
      inventoryInfo: {
        onHand: 0,
        onOrdered: 0,
        reorderLevel: 0,
        restockLevel: 0,
        averageMonthlyUsage: 0,
        lastPrice: 0,
        lastOrderDate: new Date(),
        lastVendor: "",
        inventoryUnit: body.requestUnit
      },
      accountCode: "ACC-NEW",
      jobCode: "JOB-NEW",
      baseSubTotalPrice: 0,
      subTotalPrice: 0,
      baseNetAmount: 0,
      netAmount: 0,
      baseDiscAmount: 0,
      discountAmount: 0,
      baseTaxAmount: 0,
      taxAmount: 0,
      baseTotalAmount: 0,
      totalAmount: 0,
    };
    
    // Add to mock database
    mockItems.push(newItem);
    
    // Filter for response
    const [filteredItem] = filterItemsByRole([newItem], userRole);
    
    return NextResponse.json({
      item: filteredItem,
      message: 'Item created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating PR item:', error);
    return NextResponse.json(
      { error: 'Failed to create PR item' },
      { status: 500 }
    );
  }
}

// PUT /api/pr/[prId]/items/bulk - Bulk operations
export async function PUT(
  request: NextRequest,
  { params }: { params: { prId: string } }
) {
  try {
    const body = await request.json();
    const { action, itemIds, applyTo, comments } = body;
    const { searchParams } = new URL(request.url);
    const userRole = (searchParams.get('userRole') as UserRole) || 'staff';
    
    let targetItems = mockItems.filter(item => itemIds.includes(item.id));
    
    // Apply bulk action based on user role and action type
    const results = {
      successful: [] as { itemId: string; newStatus: EnhancedItemStatus }[],
      failed: [] as { itemId: string; reason: string; currentStatus: EnhancedItemStatus }[]
    };
    
    for (const item of targetItems) {
      let newStatus: EnhancedItemStatus | null = null;
      let canPerformAction = false;
      
      switch (action) {
        case 'bulk_approve':
          if (userRole === 'hd' && (item.documentStatus as any) === 'pending_hd') {
            newStatus = 'hd_approved';
            canPerformAction = true;
          } else if (userRole === 'finance_manager' && (item.documentStatus as any) === 'pending_manager') {
            newStatus = 'manager_approved';
            canPerformAction = true;
          }
          break;
          
        case 'bulk_review':
          if ((userRole === 'hd' && (item.documentStatus as any) === 'pending_hd') ||
              (userRole === 'finance_manager' && (item.documentStatus as any) === 'pending_manager')) {
            newStatus = 'review';
            canPerformAction = true;
          }
          break;
          
        case 'bulk_reject':
          if ((userRole === 'hd' && (item.documentStatus as any) === 'pending_hd') ||
              (userRole === 'finance_manager' && (item.documentStatus as any) === 'pending_manager')) {
            newStatus = 'rejected';
            canPerformAction = true;
          }
          break;
          
        case 'split_approved':
          // This would create a new PR with approved items
          // For demo, we'll just mark as processed
          if (['hd', 'purchase_staff'].includes(userRole) && 
              ['hd_approved', 'manager_approved'].includes(item.documentStatus as any)) {
            canPerformAction = true;
          }
          break;
      }
      
      if (canPerformAction && newStatus) {
        // Update item
        const itemIndex = mockItems.findIndex(i => i.id === item.id);
        if (itemIndex !== -1) {
          mockItems[itemIndex] = {
            ...mockItems[itemIndex],
            documentStatus: newStatus as any,
            version: mockItems[itemIndex].version + 1,
            lastModifiedBy: 'current-user',
            ...(newStatus === 'review' && comments ? { reviewComments: comments } : {}),
            ...(newStatus === 'rejected' && comments ? { rejectionReason: comments } : {})
          };
          
          results.successful.push({
            itemId: item.id,
            newStatus
          });
        }
      } else {
        results.failed.push({
          itemId: item.id,
          reason: `Cannot ${action} item in ${item.documentStatus} status`,
          currentStatus: item.documentStatus as any
        });
      }
    }
    
    return NextResponse.json({
      ...results,
      summary: {
        totalRequested: itemIds.length,
        successful: results.successful.length,
        failed: results.failed.length
      }
    });
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    return NextResponse.json(
      { error: 'Failed to perform bulk operation' },
      { status: 500 }
    );
  }
}