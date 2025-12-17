# Purchase Request Items - Expandable Panel Implementation

## Overview

This document provides a comprehensive implementation guide for enhancing the Purchase Request Items tab expandable panel with role-based information display, business dimensions editing, enhanced inventory information, and vendor comparison functionality.

### Project Objectives
- Implement role-based expandable panel sections
- Fix Business Dimensions to focus on business allocation
- Add enhanced inventory information with location-based stock
- Implement vendor comparison functionality  
- Add quantity unit conversion display
- Ensure universal edit button access for all roles

## Requirements Summary

### Core Requirements
1. **Business Dimensions Section**: Focus on Job Number, Events, Projects, Market Segments
2. **Universal Edit Button**: All roles can access edit mode with field-level permissions
3. **Role-Based Visibility**: Approvers see same info as Purchasers (view-only)
4. **Quantity Conversion**: Show secondary text with inventory unit conversion
5. **Enhanced Inventory**: Location-based stock and order details
6. **Vendor Comparison**: Comparison buttons and vendor analysis

## Role Specifications

### Requestor (Staff Role)
**Role Detection**: `currentUser.role === 'Staff'` || `currentUser.role.toLowerCase().includes('staff')`

#### Available Actions
- ✅ Item Management (Add, Edit, View, Search, Filter)
- ✅ Bulk Selection and Actions
- ✅ Edit Table Mode toggle
- ✅ Chevron Expansion/Collapse

#### Edit Capabilities (When in Edit Mode)
- ✅ Business Dimensions (Job Number, Events, Projects, Market Segments)
- ✅ Delivery Information (Delivery Point, Required Date)
- ✅ Location, Product Selection, Requested Quantities, Units
- ✅ Comments
- ❌ Approved quantities, pricing, vendor information

#### Visible Sections (When Expanded)
- ✅ Business Dimensions (Editable)
- ✅ Delivery Information (Editable)
- ✅ Stock Levels (Simplified View - 3 columns)
- ✅ Comments (Editable)
- ❌ Financial Information
- ❌ Vendor Management
- ❌ Approval Controls

### Approver (Department Manager/Financial Manager)
**Role Detection**: `currentUser.role === 'Department Manager'` || `currentUser.role === 'Approver'` || `currentUser.role === 'Financial Manager'`

#### Available Actions
- ✅ View PRs pending approval
- ✅ Approve/Reject/Send Back PRs
- ✅ Bulk Actions
- ✅ Edit Table Mode toggle
- ✅ Chevron Expansion/Collapse

#### Edit Capabilities (When in Edit Mode)
- ✅ Business Dimensions (Job Number, Events, Projects, Market Segments)
- ✅ Delivery Information (Delivery Point, Required Date)
- ✅ Approved Quantities & Units
- ✅ Comments
- ❌ Original request details, pricing, vendor assignment

#### Visible Sections (When Expanded)
- ✅ Business Dimensions (Editable)
- ✅ Delivery Information (Editable)
- ✅ Stock Levels (Full View - 4 columns)
- ✅ Financial Information (Read Only)
- ✅ Vendor Management (Read Only)
- ✅ Approval Controls (Editable in Edit Mode)
- ✅ Comments (Editable)

### Purchaser (Purchasing Staff)
**Role Detection**: `currentUser.role === 'Purchasing Staff'` || `currentUser.role === 'Purchase'` || `currentUser.role === 'Purchasing'`

#### Available Actions
- ✅ View All PRs
- ✅ Process Approved PRs
- ✅ Vendor Management
- ✅ Edit Table Mode toggle
- ✅ Chevron Expansion/Collapse

#### Edit Capabilities (When in Edit Mode)
- ✅ Business Dimensions (Job Number, Events, Projects, Market Segments)
- ✅ Delivery Information (Delivery Point, Required Date)
- ✅ Vendor Information & Assignment
- ✅ Pricing (Unit Price, Discounts, Taxes, Overrides)
- ✅ Order Units & Approved Quantities
- ✅ Comments
- ❌ Original request specifications

#### Visible Sections (When Expanded)
- ✅ Business Dimensions (Editable)
- ✅ Delivery Information (Editable)
- ✅ Stock Levels (Full View - 4 columns)
- ✅ Financial Information (Editable)
- ✅ Vendor Management (Editable)
- ✅ Approval Controls (Read Only)
- ✅ Vendor Comparison (Purchaser Only)
- ✅ Comments (Editable)

## Technical Implementation

### File Location
Primary file: `/app/(main)/procurement/purchase-requests/components/tabs/ItemsTab.tsx`

### Critical Issues to Fix
1. **Malformed JSX Structure** (lines 485-488)
2. **Duplicate Format Import** from date-fns
3. **Broken Expandable Section Nesting**
4. **Incorrect Business Dimensions Fields**

### Component Structure

#### Enhanced Imports
```typescript
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  CalendarIcon, Building2, TrendingUp, Truck, Info, AlertTriangle,
  CheckCircle2, BarChart3, Crown, Star
} from "lucide-react";
```

#### Role Detection Logic
```typescript
const isRequestor = currentUser.role === 'Staff' || currentUser.role.toLowerCase().includes('staff');
const isApprover = currentUser.role === 'Department Manager' || 
                  currentUser.role === 'Financial Manager' ||
                  currentUser.role === 'Approver';
const isPurchaser = currentUser.role === 'Purchasing Staff' || 
                   currentUser.role === 'Purchase' ||
                   currentUser.role === 'Purchasing';
```

#### Section Rendering Logic
```typescript
const renderExpandedItemInfo = (item: PurchaseRequestItem, isRequestor: boolean, isApprover: boolean, isPurchaser: boolean, canSeePrices: boolean, isExpanded: boolean) => {
  return (
    <div className="space-y-6">
      {isExpanded && (
        <>
          {/* Business Dimensions - All Roles */}
          <BusinessDimensionsSection editable={isTableEditMode} />
          
          {/* Delivery Information - All Roles */}
          <DeliveryInformationSection editable={isTableEditMode} />
          
          {/* Stock Levels - All Roles (complexity varies) */}
          <StockLevelsSection 
            complexity={isRequestor ? 'simple' : 'full'} 
            showLocationBreakdown={true}
            showOrderDetails={true}
          />
          
          {/* Financial Information - Approvers & Purchasers Only */}
          {!isRequestor && (
            <FinancialInformationSection editable={isPurchaser && isTableEditMode} />
          )}
          
          {/* Vendor Management - Approvers & Purchasers Only */}
          {!isRequestor && (
            <VendorManagementSection editable={isPurchaser && isTableEditMode} />
          )}
          
          {/* Approval Controls - Approvers & Purchasers */}
          {!isRequestor && (
            <ApprovalControlsSection editable={isApprover && isTableEditMode} />
          )}
          
          {/* Vendor Comparison - Purchasers Only */}
          {isPurchaser && (
            <VendorComparisonSection />
          )}
        </>
      )}
      
      {/* Comments - Always Visible */}
      {(item.comment || isTableEditMode) && (
        <CommentsSection editable={isTableEditMode} />
      )}
    </div>
  );
};
```

## UI/UX Specifications

### Business Dimensions Section
**Purpose**: Business allocation and organizational context

**Fields**:
- Job Number (Text Input)
- Events (Dropdown)
- Projects (Dropdown)
- Market Segments (Dropdown)

**Layout**: 2x2 grid on desktop, stacked on mobile

**Edit Permissions**: All roles when in edit mode

### Delivery Information Section
**Fields**:
- Delivery Point (Text Input/Dropdown)
- Required Date (Date Picker with Calendar)

**Layout**: 2-column grid

**Edit Permissions**: All roles when in edit mode

### Stock Levels Section

#### Requestor View (Simplified)
3-column layout:
1. **Current Stock**: On-hand by location with status indicators
2. **On Order**: Pending deliveries with details
3. **Usage**: Monthly averages and trends

#### Approver/Purchaser View (Full)
4-column layout:
1. **On Hand by Location**: Detailed location breakdown
2. **On Order Details**: PO numbers, vendors, expected dates
3. **Reorder Information**: Levels and thresholds
4. **Usage Analytics**: Historical data and patterns

### Quantity Unit Conversion Display
**Format**: `Primary: 5 boxes` + `Secondary: (≈ 60 pieces)`

**Implementation**:
```typescript
function convertToInventoryUnit(quantity: number, fromUnit: string, toUnit: string, conversionFactor: number): string {
  const converted = quantity * conversionFactor;
  return `(≈ ${converted.toLocaleString()} ${toUnit})`;
}
```

**Display Locations**:
- Main table quantities column
- Mobile card view quantities
- Expandable panel approval controls
- Edit mode input fields

### Base Currency Conversion Display
**Purpose**: Show monetary amounts in both order currency and base currency

**Format**: 
- Primary: `USD 150.00` (order currency)
- Secondary: `THB 5,250.00` (base currency equivalent)

**Implementation**:
```typescript
// Base currency conversion
const convertToBaseCurrency = (amount: number, exchangeRate: number): number => {
  return amount * (exchangeRate || 1);
};
```

**Display Locations**:
- Main table pricing column
- Financial information section (all monetary fields)
- Vendor comparison pricing
- Mobile card view pricing

**Currency Information Section**:
- Order Currency: The currency used for the purchase order
- Exchange Rate: Current rate for currency conversion (4 decimal places)
- Base Currency: Organization's primary accounting currency

### Vendor Comparison (Purchasers Only)
**Features**:
- Compare Vendors button
- Quick vendor summary cards
- Detailed comparison modal/table
- Vendor selection functionality

**Data Points**:
- Unit prices and currency
- Lead times and minimum orders
- Vendor ratings and history
- Preferred vendor indicators

## Data Requirements

### Enhanced Item Data Structure
```typescript
interface PurchaseRequestItem {
  // Existing fields...
  
  // Business Dimensions
  jobNumber?: string;
  event?: string;
  project?: string;
  marketSegment?: string;
  
  // Unit Conversion
  conversionFactor?: number;
  
  // Currency & Exchange Rate
  baseCurrency?: string;
  currencyRate?: number;
  
  // Enhanced Inventory
  inventoryInfo?: {
    // Existing fields...
    locationStock: Array<{
      location: string;
      onHand: number;
      unit: string;
    }>;
    onOrderDetails: Array<{
      poNumber: string;
      vendor: string;
      quantity: number;
      unit: string;
      expectedDate: Date;
      status: string;
    }>;
    totalOnHand: number;
    totalOnOrder: number;
  };
  
  // Vendor Comparison
  vendorComparison?: Array<{
    vendorId: string;
    vendorName: string;
    unitPrice: number;
    currency: string;
    leadTime: string;
    minOrderQty: number;
    lastOrderDate: Date;
    rating: number;
    isPreferred: boolean;
  }>;
}
```

### Sample Data Updates
```typescript
export const enhancedSamplePRItems: PurchaseRequestItem[] = [
  {
    // Existing fields...
    jobNumber: "FB-2401-0001",
    event: "Monthly Operations",
    project: "Kitchen Upgrade",
    marketSegment: "Corporate",
    conversionFactor: 1, // 1 kg = 1 kg
    baseCurrency: "USD",
    currencyRate: 35.0, // 1 USD = 35 THB
    inventoryInfo: {
      // Enhanced inventory data...
      locationStock: [
        { location: "Main Kitchen", onHand: 15, unit: "kg" },
        { location: "Storage Room A", onHand: 8, unit: "kg" }
      ],
      onOrderDetails: [
        {
          poNumber: "PO-2401-0001",
          vendor: "Global F&B Suppliers",
          quantity: 20,
          unit: "kg",
          expectedDate: new Date("2024-07-15"),
          status: "In Transit"
        }
      ],
      totalOnHand: 23,
      totalOnOrder: 20
    },
    vendorComparison: [
      {
        vendorId: "V001",
        vendorName: "Global F&B Suppliers", 
        unitPrice: 14.50,
        currency: "USD",
        leadTime: "7-10 days",
        minOrderQty: 10,
        lastOrderDate: new Date("2024-06-01"),
        rating: 4.5,
        isPreferred: true
      }
    ]
  }
];
```

## Implementation Phases

### Phase 1: Core Fixes and Business Dimensions
**Priority**: Critical
**Timeline**: Immediate

**Tasks**:
1. Fix malformed JSX structure (lines 485-488)
2. Remove duplicate format import
3. Correct expandable section nesting
4. Update Business Dimensions section
5. Remove item classification fields
6. Implement universal edit button

**Files Modified**:
- `ItemsTab.tsx`

### Phase 2: Enhanced Inventory and Conversion Display
**Priority**: High
**Timeline**: Next sprint

**Tasks**:
1. Add quantity unit conversion display
2. Implement location-based stock display
3. Add on-order details with PO information
4. Enhanced inventory information layout
5. Update sample data with new fields

**Files Modified**:
- `ItemsTab.tsx`
- `sampleData.ts`
- Type definitions

### Phase 3: Vendor Comparison and Advanced Features
**Priority**: Medium
**Timeline**: Following sprint

**Tasks**:
1. Implement vendor comparison functionality
2. Add vendor comparison modal/dialog
3. Integrate vendor selection
4. Add advanced inventory analytics
5. Performance optimizations

**Files Modified**:
- `ItemsTab.tsx`
- New vendor comparison components
- Enhanced data structures

## Testing Requirements

### Role-Based Testing
1. **Requestor Role Testing**
   - Verify limited section visibility
   - Test edit permissions
   - Validate financial information is hidden

2. **Approver Role Testing**
   - Verify full information visibility
   - Test approval controls functionality
   - Validate read-only restrictions

3. **Purchaser Role Testing**
   - Verify vendor management access
   - Test pricing edit capabilities
   - Validate vendor comparison features

### Functionality Testing
1. **Edit Mode Testing**
   - Universal edit button for all roles
   - Field-level permission enforcement
   - Save/cancel functionality

2. **Expandable Panel Testing**
   - Chevron expand/collapse
   - Section visibility by role
   - Responsive layout behavior

3. **Data Integration Testing**
   - Quantity conversion calculations
   - Location-based stock display
   - Vendor comparison data

### UI/UX Testing
1. **Responsive Design**
   - Desktop layout functionality
   - Mobile card view behavior
   - Cross-browser compatibility

2. **Performance Testing**
   - Large dataset handling
   - Smooth animations and transitions
   - Memory usage optimization

## Validation Criteria

### Acceptance Criteria
1. ✅ All roles can access edit mode via universal button
2. ✅ Business Dimensions focus on allocation fields only
3. ✅ Approvers see same info as Purchasers (view-only)
4. ✅ Quantity conversion display works correctly
5. ✅ Location-based stock information displays
6. ✅ Vendor comparison functionality works
7. ✅ Role-based permissions enforced correctly
8. ✅ UI renders without errors
9. ✅ Responsive design works on all devices
10. ✅ Performance meets requirements

### Definition of Done
- [ ] All code reviewed and approved
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] UI/UX testing completed
- [ ] Performance benchmarks met
- [ ] Documentation updated
- [ ] Stakeholder approval received

## References

### Related Documentation
- [Purchase Request RBAC](./pr-rbac.md)
- [Purchase Request Business Logic](./pr-business-logic.md)
- [Field Permissions Utility](../../../lib/utils/field-permissions.ts)

### Component Dependencies
- ItemsTab.tsx (Primary)
- ItemDetailsEditForm.tsx
- NewItemRow.tsx
- UI Components (Button, Input, Select, etc.)

---

**Document Version**: 1.0  
**Last Updated**: January 2025  
**Author**: Development Team  
**Status**: Implementation Ready
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |