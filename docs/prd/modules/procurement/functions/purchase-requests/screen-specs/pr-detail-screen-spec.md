# Purchase Request Detail Screen - Complete Interface Specification

**Module**: Procurement  
**Function**: Purchase Requests  
**Screen**: Purchase Request Detail Page (Multi-Tab Interface)  
**Version**: 1.0  
**Date**: January 2025  
**Status**: Production Implementation Documented

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 📋 Screen Overview

The Purchase Request Detail Screen is a sophisticated, multi-tabbed interface that provides comprehensive PR management functionality including creation, editing, approval workflows, vendor comparison, price analysis, budget tracking, and complete activity logging.

### Current Implementation Status: ✅ **PRODUCTION-READY COMPLEX INTERFACE**

**Source Files**:
- Main Controller: `PRDetailPage.tsx` (600+ lines of complex logic)
- PR Form: `PRForm.tsx` (85 lines of form components)
- Enhanced Items: `EnhancedItemsTab.tsx` (500+ lines of advanced pricing)
- Budget Tab: `BudgetsTab.tsx` (78 lines of budget tracking)
- Vendor Comparison: `VendorComparisonModal.tsx` (400+ lines of vendor analysis)
- Price History: `PriceHistoryModal.tsx` (300+ lines of price analytics)
- Workflow Timeline: `WorkflowProgressTimeline.tsx` (200+ lines of workflow visualization)

---

## 🎯 Interface Architecture

### Multi-Mode Operation
- **View Mode**: Read-only display with workflow actions
- **Edit Mode**: Form-based editing with validation
- **Add Mode**: New PR creation with templates
- **Approval Mode**: Workflow-specific approval interface

### Tabbed Interface Structure
```
┌─────────────────────────────────────────────────────────────────┐
│ PR-2401-0001 | Kitchen Equipment Request     [Edit] [Actions ▼] │
├─────────────────────────────────────────────────────────────────┤
│ [Details] [Items] [Budget] [Workflow] [Attachments] [Activity]  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    TAB CONTENT AREA                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ Tab 1: Details Tab (PR Form Interface)

### **PRForm Component Specification** (`PRForm.tsx`)

#### Form Layout & Structure
```typescript
Grid Layout: 4-column responsive grid
Form Fields:
┌─────────────────────────────────────────────────────────────────┐
│ [📄 Requisition] [📅 Date] [💼 PR Type] [💰 Estimated Total]    │
├─────────────────────────────────────────────────────────────────┤
│ [📄 Description - Full Width Textarea]                         │
└─────────────────────────────────────────────────────────────────┘
```

#### Field Specifications

**Requisition Number Field**:
- **Component**: Input (read-only in edit mode)
- **Icon**: FileIcon
- **Validation**: Auto-generated PR-YYYY-NNN format
- **Label**: "Requisition" (0.7rem text-gray-500)

**Date Field**:
- **Component**: Input type="date"
- **Icon**: CalendarIcon  
- **Validation**: Required, cannot be future dated
- **Default**: Current date for new PRs

**PR Type Field**:
- **Component**: Select dropdown
- **Icon**: BriefcaseIcon
- **Options**: All PRType enum values (GeneralPurchase, MarketList, AssetPurchase, CapitalExpenditure)
- **Validation**: Required selection

**Estimated Total Field**:
- **Component**: Input type="number"
- **Icon**: DollarSignIcon
- **Validation**: Positive numbers, 2 decimal places
- **Format**: Currency formatting on blur

**Description Field**:
- **Component**: Textarea (full width, height: 80px)
- **Icon**: FileIcon
- **Validation**: 10-500 characters required
- **Placeholder**: Descriptive text about the purchase request

#### Form Behavior & State Management
```typescript
interface PRFormProps {
  formData: PurchaseRequest;
  setFormData: React.Dispatch<React.SetStateAction<PurchaseRequest>>;
  isDisabled: boolean; // Permission-based field disabling
}

// Event Handlers
handleInputChange: (e: ChangeEvent) => void; // Text inputs
handleSelectChange: (name: keyof PurchaseRequest) => (value: string) => void; // Dropdowns
```

#### Responsive Design
- **Desktop**: 4-column grid layout
- **Tablet**: 2-column grid layout  
- **Mobile**: Single column stack

---

## 🛒 Tab 2: Enhanced Items Tab (Advanced Pricing Interface)

### **EnhancedItemsTab Component** (`EnhancedItemsTab.tsx` - 500+ lines)

#### Core Functionality
- **Intelligent Price Assignment**: Automated vendor price assignment
- **Vendor Comparison**: Multi-vendor price comparison with scoring
- **Price History**: Historical price tracking and analytics
- **Manual Override**: Price and vendor override capabilities
- **Real-time Validation**: Business rule validation and alerts

#### Interface Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ [🔄 Refresh] [📊 Price Analytics] [⚙️ Assignment Settings]       │
├─────────────────────────────────────────────────────────────────┤
│ Item | Description | Qty | Unit | Assigned Price | Vendor | Actions │
├─────────────────────────────────────────────────────────────────┤
│ 001  | Professional Mixer | 2 | EA | $1,250.00 | [ABC Corp] | [⚖️📈] │
│      | [🟢 Auto-Assigned] [⭐ 95% Confidence]                      │
├─────────────────────────────────────────────────────────────────┤
│ 002  | Fresh Salmon | 50 | LB | $12.50 | [Ocean Fresh] | [⚖️📈] │
│      | [🔵 Manual Override] [⚠️ Price Alert +15%]                │
└─────────────────────────────────────────────────────────────────┘
```

#### Advanced Features

**Price Assignment Engine**:
```typescript
interface PriceAssignment {
  isAutoAssigned: boolean;        // Automatic vs manual assignment
  assignedPrice: number;          // Final assigned price
  assignmentConfidence: number;   // Confidence score (0-100%)
  selectedVendor: Vendor;         // Chosen vendor details
  alternativeVendors: Vendor[];   // Other vendor options
  priceAlerts: PriceAlert[];      // Price deviation alerts
  assignmentReason: string;       // Why this vendor/price chosen
}
```

**Status Badges**:
- **Auto-Assigned** (Green): `🟢 CheckCircle + "Auto-Assigned"`
- **Manual Override** (Blue): `🔵 RefreshCw + "Manual Override"`  
- **Pending** (Yellow): `🟡 Clock + "Pending"`
- **Failed** (Red): `🔴 AlertTriangle + "Failed"`

**Confidence Scoring**:
- **High (90-100%)**: Green badge with star icon
- **Medium (70-89%)**: Yellow badge with warning icon
- **Low (<70%)**: Red badge with alert icon

#### Action Buttons
**Vendor Comparison** (`⚖️`):
- Opens VendorComparisonModal
- Shows multi-vendor analysis
- Enables vendor selection/override

**Price History** (`📈`):
- Opens PriceHistoryModal  
- Shows historical price trends
- Price analytics and forecasting

---

## 💰 Tab 3: Budget Tab (Financial Tracking Interface)

### **BudgetsTab Component** (`BudgetsTab.tsx`)

#### Budget Tracking Table
```
┌─────────────────────────────────────────────────────────────────┐
│ Location | Budget | Total | Soft Comm | Soft Comm | Hard | Available │
│          | Category| Budget| (PR)      | (PO)      | Comm | Budget    │
├─────────────────────────────────────────────────────────────────┤
│ FB01     | F&B     | 5.0M  | 500K      | 750K      | 2.0M | 1.75M     │
│ FB02     | F&B     | 4.0M  | 300K      | 500K      | 1.5M | 1.70M     │
└─────────────────────────────────────────────────────────────────┘
```

#### Budget Categories & Calculations
```typescript
interface BudgetData {
  location: string;               // Location code
  budgetCategory: string;         // Budget category name
  totalBudget: number;           // Total allocated budget
  softCommitmentPR: number;      // Committed via approved PRs
  softCommitmentPO: number;      // Committed via POs
  hardCommitment: number;        // Actual spent (GL transactions)
  availableBudget: number;       // Remaining budget
  currentPRAmount: number;       // This PR's impact on budget
}
```

#### Budget Validation Rules
- **Budget Checking**: Real-time budget availability validation
- **Commitment Tracking**: Soft commitments vs hard expenditures
- **Alert System**: Visual alerts when budget thresholds exceeded
- **Multi-location Support**: Budget tracking across multiple locations

---

## ⚖️ Vendor Comparison Modal (Advanced Vendor Analysis)

### **VendorComparisonModal Component** (`VendorComparisonModal.tsx` - 400+ lines)

#### Modal Layout & Features
```
┌─────────────────────────────────────────────────────────────────┐
│ Vendor Comparison - Professional Mixer                          │
├─────────────────────────────────────────────────────────────────┤
│ [Current: ABC Corp - $1,250.00]                                │
├─────────────────────────────────────────────────────────────────┤
│ Vendor      | Price  | Lead | Avail | Score | Rating | Actions  │
├─────────────────────────────────────────────────────────────────┤
│ ABC Corp    |$1,250  | 7d   | ✅    | 95%   | ⭐⭐⭐⭐⭐ | [Select]│
│ Kitchen Pro |$1,180  | 10d  | 🟡    | 87%   | ⭐⭐⭐⭐   | [Select]│
│ Equip Plus  |$1,320  | 5d   | ✅    | 92%   | ⭐⭐⭐⭐⭐ | [Select]│
└─────────────────────────────────────────────────────────────────┘
│ [Override Reason Required]                                      │
│ [Save Override] [Cancel]                                        │
└─────────────────────────────────────────────────────────────────┘
```

#### Vendor Scoring Algorithm
```typescript
interface VendorComparison {
  vendorId: string;
  vendorName: string;
  price: number;
  currency: string;
  leadTime: number;              // Days
  availability: 'available' | 'limited' | 'unavailable';
  overallScore: number;          // 0-100 composite score
  priceScore: number;            // Price competitiveness
  reliabilityScore: number;      // Vendor reliability rating
  qualityScore: number;          // Product quality score
  deliveryScore: number;         // Delivery performance
  contractTerms: string;         // Contract/terms information
  minimumOrderQuantity: number;  // MOQ requirements
  paymentTerms: string;          // Payment terms
}
```

#### Override Workflow
1. **Vendor Selection**: User selects alternative vendor
2. **Reason Required**: Mandatory justification text area
3. **Impact Analysis**: Shows price/delivery impact
4. **Approval Chain**: May trigger additional approvals
5. **Audit Logging**: Complete override audit trail

---

## 📈 Price History Modal (Price Analytics Interface)

### **PriceHistoryModal Component** (`PriceHistoryModal.tsx` - 300+ lines)

#### Price Analytics Interface
```
┌─────────────────────────────────────────────────────────────────┐
│ Price History - Professional Mixer                              │
├─────────────────────────────────────────────────────────────────┤
│ [Time Range: 6 Months ▼] [View: Table ▼] [📊 Chart] [📥 Export]│
├─────────────────────────────────────────────────────────────────┤
│ Date      | Vendor     | Price  | Change | PR/PO    | Status   │
├─────────────────────────────────────────────────────────────────┤
│ 2024-12-15| ABC Corp   |$1,250  | +2.4%  | PR-2445-0001| Current │
│ 2024-11-20| ABC Corp   |$1,220  | -5.1%  | PR-2438-0001| Historical│
│ 2024-10-15| Kitchen Pro|$1,285  | +8.2%  | PR-2429-0001| Historical│
└─────────────────────────────────────────────────────────────────┘
```

#### Price Analytics Features
- **Time Range Filtering**: 1 month, 3 months, 6 months, 1 year, all time
- **Trend Analysis**: Price trend indicators with percentage changes
- **Chart View**: Visual price history charts
- **Vendor Comparison**: Historical vendor performance comparison
- **Export Capability**: Export price history data
- **Price Forecasting**: Predictive price trending (advanced feature)

---

## 🔄 Tab 4: Workflow Tab (Visual Workflow Management)

### **WorkflowProgressTimeline Component** (`WorkflowProgressTimeline.tsx`)

#### Visual Workflow Timeline
```
┌─────────────────────────────────────────────────────────────────┐
│ Workflow Progress                                               │
├─────────────────────────────────────────────────────────────────┤
│ 👤 ✅ Request Submitted    │ Sarah Chen    │ Jan 15, 2024 2:30pm │
│     Purchase request created                                    │
├─────────────────────────────────────────────────────────────────┤
│ 🏢 ✅ Department Head      │ Mike Johnson  │ Jan 16, 2024 9:15am │
│     Department manager approval                                 │
├─────────────────────────────────────────────────────────────────┤
│ ☑️ 🔄 Purchase Review      │ Pending       │ Current Stage       │
│     Purchase coordinator review                                 │
├─────────────────────────────────────────────────────────────────┤
│ 💳 ⏳ Finance Approval     │ -             │ Upcoming            │
│     Finance manager approval                                    │
├─────────────────────────────────────────────────────────────────┤
│ 👨‍💼 ⏳ General Manager     │ -             │ Upcoming            │
│     General manager approval                                    │
├─────────────────────────────────────────────────────────────────┤
│ ✅ ⏳ Completed            │ -             │ Final Stage         │
│     Request approved & processed                                │
└─────────────────────────────────────────────────────────────────┘
```

#### Stage Status Indicators
- **✅ Completed**: Green checkmark, completed timestamp
- **🔄 Current**: Blue spinning icon, "Current Stage"
- **⏳ Pending**: Gray clock icon, "Upcoming"
- **❌ Rejected**: Red X icon, rejection details

#### Workflow Stage Details
```typescript
interface WorkflowStep {
  stage: WorkflowStage;
  title: string;                 // Human-readable stage name
  description: string;           // Stage description
  icon: React.ComponentType;     // Stage icon component
  status: 'completed' | 'current' | 'pending' | 'rejected';
  assignedUser?: string;         // User assigned to this stage
  completedBy?: string;          // User who completed the stage
  timestamp?: Date;              // Completion timestamp
  comments?: string;             // Stage-specific comments
}
```

---

## 📎 Tab 5: Attachments Tab (File Management Interface)

### **AttachmentsTab Component** (`AttachmentsTab.tsx`)

#### File Management Interface
```
┌─────────────────────────────────────────────────────────────────┐
│ Attachments                                    [📎 Upload File]  │
├─────────────────────────────────────────────────────────────────┤
│ 📄 Kitchen_Equipment_Quote.pdf    │ 2.3 MB  │ Jan 15 │ [⬇️][🗑️] │
│    Vendor quote for professional mixer                          │
├─────────────────────────────────────────────────────────────────┤
│ 🖼️ Equipment_Photo.jpg            │ 1.1 MB  │ Jan 15 │ [⬇️][🗑️] │
│    Product photo for reference                                  │
├─────────────────────────────────────────────────────────────────┤
│ 📊 Budget_Justification.xlsx      │ 450 KB  │ Jan 14 │ [⬇️][🗑️] │
│    Budget analysis and justification                            │
└─────────────────────────────────────────────────────────────────┘
```

#### File Management Features
- **Drag & Drop Upload**: Modern file upload interface
- **File Type Validation**: Supported file types (PDF, DOC, XLS, IMG)
- **Size Limits**: Maximum file size validation
- **File Preview**: In-browser preview for supported formats
- **Download/Delete**: File management actions
- **Category Tagging**: Optional file categorization
- **Version Control**: File version tracking (advanced)

---

## 📝 Tab 6: Activity Tab (Audit Trail Interface)

### **ActivityTab Component** (`ActivityTab.tsx`)

#### Activity Log Interface
```
┌─────────────────────────────────────────────────────────────────┐
│ Activity Log                                    [🔍 Filter ▼]   │
├─────────────────────────────────────────────────────────────────┤
│ Jan 16 9:15am │ Mike Johnson    │ APPROVED                      │
│               Department Head approved the request              │
│               Comment: "Approved for Q1 kitchen upgrade"       │
├─────────────────────────────────────────────────────────────────┤
│ Jan 15 4:20pm │ Sarah Chen      │ UPDATED                      │
│               Updated item quantity for Professional Mixer      │
│               Changed: 1 EA → 2 EA                             │
├─────────────────────────────────────────────────────────────────┤
│ Jan 15 2:30pm │ Sarah Chen      │ CREATED                      │
│               Purchase request created                          │
│               Initial amount: $15,750.00                       │
└─────────────────────────────────────────────────────────────────┘
```

#### Activity Types & Details
```typescript
interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  userId: string;
  userName: string;
  action: 'CREATED' | 'UPDATED' | 'APPROVED' | 'REJECTED' | 'COMMENTED';
  description: string;           // Human-readable description
  details?: string;             // Additional details
  oldValue?: any;               // Previous value (for changes)
  newValue?: any;               // New value (for changes)
  comments?: string;            // User comments
  ipAddress?: string;           // IP address for security audit
}
```

---

## 🎛️ Header & Action Controls

### **PRHeader Component** (`PRHeader.tsx`)

#### Header Layout
```
┌─────────────────────────────────────────────────────────────────┐
│ ← PR-2401-0001 │ Kitchen Equipment Request        │ [Edit] [•••]  │
│   📍 Main Kitchen │ 👤 Sarah Chen │ 📅 Jan 15, 2024              │
│   💰 $15,750.00 USD │ 🟢 Department Head Approval              │
└─────────────────────────────────────────────────────────────────┘
```

#### Action Dropdown Menu
```typescript
Available Actions (Permission-Based):
├── 👁️ View Details
├── ✏️ Edit PR
├── 📋 Clone PR
├── ✅ Approve (if authorized)
├── ❌ Reject (if authorized)
├── 🔄 Send Back (if authorized)
├── 📧 Email PR
├── 🖨️ Print PR
├── 📤 Export PDF
├── 🗑️ Delete PR (if authorized)
└── 📊 Generate Report
```

---

## 🔧 Advanced Features & Integrations

### Workflow Decision Engine Integration
```typescript
// Real-time workflow decision making
const workflowDecision = WorkflowDecisionEngine.analyzeWorkflowState(items);
// Result determines available actions and button states
```

### RBAC Service Integration  
```typescript
// Permission-based UI rendering
const permissions = PRRBACService.getPRPermissions(user, pr);
// Controls field editability, action availability, data visibility
```

### Real-time Validation & Alerts
- **Business Rule Validation**: Real-time validation as user types
- **Budget Alerts**: Immediate budget constraint warnings
- **Price Alerts**: Price deviation notifications
- **Workflow Alerts**: Workflow progression notifications

---

## 📱 Responsive Design Specifications

### Breakpoint Behavior
- **Desktop (1200px+)**: Full 6-tab layout with side-by-side modals
- **Tablet (768-1199px)**: Collapsed tabs, full-width modals
- **Mobile (320-767px)**: Single-column layout, drawer-style modals

### Mobile Optimizations
- **Touch-friendly Targets**: Minimum 44px touch targets
- **Swipe Navigation**: Swipe between tabs on mobile
- **Collapsible Sections**: Accordion-style section collapse
- **Mobile-first Forms**: Optimized form inputs for mobile

---

## 🔐 Security & Permission Integration

### Field-Level Security
```typescript
// Permission-based field rendering
const canEdit = canEditField(user, 'description', pr.status);
<Input disabled={!canEdit} />
```

### Action-Level Security
```typescript  
// Permission-based action availability
const canApprove = PRRBACService.canPerformAction(user, pr, 'approve');
{canApprove && <Button>Approve</Button>}
```

### Data Visibility Rules
- **Financial Information**: Role-based visibility (Finance+ only)
- **Vendor Details**: Purchasing staff and above
- **Comments**: Approver comments visible to relevant stakeholders
- **Audit Information**: Admin and Finance only

---

## ⚡ Performance Optimizations

### Component Loading Strategy
- **Lazy Loading**: Tabs loaded on-demand
- **Code Splitting**: Dynamic imports for heavy components
- **Memoization**: Expensive calculations cached
- **Virtual Scrolling**: Large item lists virtualized

### Data Management
- **Optimistic Updates**: UI updates immediately, sync in background
- **Caching**: Frequently accessed data cached locally
- **Delta Updates**: Only changed data transmitted
- **Background Sync**: Non-critical updates sync in background

---

## ✅ Implementation Status Summary

### ✅ Production-Ready Complex Interface:
- **Multi-tab Architecture**: Complete tabbed interface with 6+ tabs
- **Advanced Pricing Engine**: Automated price assignment with vendor comparison
- **Visual Workflow Management**: Timeline-based workflow visualization
- **File Management**: Complete attachment upload/download system
- **Activity Logging**: Comprehensive audit trail interface
- **Budget Integration**: Real-time budget tracking and validation
- **Permission-based UI**: Role-based field and action visibility

### 🔄 Integration Ready:
- **Real-time Updates**: WebSocket integration points prepared
- **API Integration**: Complete REST API integration ready
- **External Systems**: Vendor, inventory, and financial system hooks ready
- **Mobile Apps**: Mobile-optimized interface ready for native app integration

---

*This comprehensive screen specification documents the complete Purchase Request Detail interface, revealing a sophisticated enterprise-grade system with advanced pricing intelligence, workflow automation, and comprehensive audit capabilities that rivals commercial ERP solutions.*