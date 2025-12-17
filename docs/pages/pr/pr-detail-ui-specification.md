# Purchase Request Detail Page: UI/UX Specification

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
This document provides comprehensive UI/UX specifications for the Purchase Request Detail page, including the new two-column layout with collapsible sidebar, enhanced RBAC integration, and modern responsive design patterns.

## 1. Layout Architecture Overview

### 1.1. Two-Column Responsive Layout

The PR Detail page implements a sophisticated two-column layout that adapts to user roles and screen sizes:

```
┌─────────────────────────────────────────────────────────────┐
│ Header Navigation with Breadcrumb                           │
├─────────────────────────────────────────────────────────────┤
│ ┌─── Main Content (70-100%) ───┐ ┌─── Sidebar (30-0%) ────┐ │
│ │                               │ │                         │ │
│ │ ┌─── PR Header Card ─────────┐ │ │ ┌─── Comments ──────────┐ │ │
│ │ │ Title, Status, Actions    │ │ │ │ Avatar + Messages   │ │ │
│ │ └───────────────────────────┘ │ │ │ New Comment Input   │ │ │
│ │                               │ │ └─────────────────────┘ │ │
│ │ ┌─── Details Section ────────┐ │ │                         │ │
│ │ │ Form Fields Grid          │ │ │ ┌─── Activity Log ──────┐ │ │
│ │ │ Status Information        │ │ │ │ Searchable Timeline │ │ │
│ │ └───────────────────────────┘ │ │ │ User Actions        │ │ │
│ │                               │ │ └─────────────────────┘ │ │
│ │ ┌─── Tabs Section ───────────┐ │ │                         │ │
│ │ │ Items | Budgets | Workflow │ │ │                         │ │
│ │ └───────────────────────────┘ │ │                         │ │
│ │                               │ │                         │ │
│ │ ┌─── Transaction Summary ────┐ │ │                         │ │
│ │ │ Financial Totals (RBAC)   │ │ │                         │ │
│ │ └───────────────────────────┘ │ │                         │ │
│ └───────────────────────────────┘ └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### 1.2. Responsive Breakpoints

**Desktop (1200px+):**
- Full two-column layout with sidebar visible by default
- Main content: 75% width, Sidebar: 25% width
- All features and details fully accessible

**Tablet (768px - 1199px):**
- Collapsible sidebar with overlay mode
- Main content: 100% width when sidebar collapsed
- Sidebar: 300px width when expanded

**Mobile (< 768px):**
- Single column layout only
- Sidebar content moved to separate modal/sheets
- Simplified navigation and condensed information display

## 2. Header Section Design

### 2.1. Enhanced Header Layout

```
┌─────────────────────────────────────────────────────────────┐
│ [←] PR-2401-0001 - Kitchen Equipment Request    [Draft]      │
│     Purchase Request Details                                │
├─────────────────────────────────────────────────────────────┤
│ [Edit] [Print] [Export] [Share] [Sidebar Toggle] ••• [Save] │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- **Back Navigation**: Chevron left icon with proper routing
- **Dynamic Title**: PR reference number and description
- **Status Badge**: Color-coded status indicator with proper WCAG contrast
- **Action Toolbar**: Role-based action buttons with consistent spacing
- **Sidebar Toggle**: Panel open/close icon with tooltip

### 2.2. Role-Based Action Buttons

```typescript
interface HeaderActions {
  mode: 'view' | 'edit';
  availableActions: ActionConfig[];
}

const getHeaderActions = (userRole: string, prStatus: string, mode: string): ActionConfig[] => {
  const baseActions = [
    { key: 'print', label: 'Print', icon: 'PrinterIcon', variant: 'outline' },
    { key: 'export', label: 'Export', icon: 'DownloadIcon', variant: 'outline' },
    { key: 'share', label: 'Share', icon: 'ShareIcon', variant: 'outline' }
  ];

  if (mode === 'view' && canEditField('', userRole)) {
    baseActions.unshift({ key: 'edit', label: 'Edit', icon: 'Edit', variant: 'default' });
  }

  if (mode === 'edit') {
    baseActions.push(
      { key: 'save', label: 'Save', icon: 'CheckCircle', variant: 'default' },
      { key: 'cancel', label: 'Cancel', icon: 'X', variant: 'outline' }
    );
  }

  baseActions.push({ key: 'toggleSidebar', label: 'Toggle Sidebar', icon: 'PanelRightOpen', variant: 'ghost' });

  return baseActions;
};
```

## 3. Main Content Area

### 3.1. PR Details Card Layout

**Grid-Based Form Layout:**
```
┌─────────────────────────────────────────────────────────────┐
│ PR Details                                                  │
├─────────────────────────────────────────────────────────────┤
│ ┌─── Basic Info (Grid 4 columns) ─────────────────────────┐ │
│ │ [PR #______] [Date______] [Type______] [Requestor____] │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Extended Info (Grid 1+3 columns) ───────────────────┐ │
│ │ [Department] [Description (spans 3 columns)__________] │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Status Information ──────────────────────────────────┐ │
│ │ Current Stage: [Department Head Approval]              │ │
│ │ Workflow Status: [Pending] Created: [Jan 15, 2024]     │ │
│ │ Estimated Cost: [$5,627.50] (Hidden from Requestors)   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Field Rendering Logic:**
```typescript
const FieldRenderer: React.FC<FieldProps> = ({ 
  name, value, type, label, userRole, mode, onChange 
}) => {
  const canEdit = canEditField(name, userRole) && mode === 'edit';
  const canView = canViewField(name, userRole);
  
  if (!canView) return null;
  
  if (canEdit) {
    return (
      <div className="space-y-2">
        <Label htmlFor={name} className="text-xs text-muted-foreground">
          {label}
        </Label>
        <Input
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className="bg-white"
        />
      </div>
    );
  }
  
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="text-sm bg-muted p-2 rounded">
        {formatValue(value, type)}
      </div>
    </div>
  );
};
```

### 3.2. Tabs Section Enhancement

**Enhanced Tab Navigation:**
```
┌─────────────────────────────────────────────────────────────┐
│ [Items (5)] [Budgets] [Workflow]                           │
├─────────────────────────────────────────────────────────────┤
│ Tab Content Area with Full Height                          │
│ • Items Tab: Enhanced expandable item management           │
│ • Budgets Tab: Financial allocation and tracking           │
│ • Workflow Tab: Approval flow visualization                │
└─────────────────────────────────────────────────────────────┘
```

**Tab Badge Indicators:**
- **Item count badges**: Show number of items in each status
- **Alert indicators**: Red badges for items needing attention
- **Progress indicators**: Visual completion status for workflows

### 3.3. Transaction Summary (RBAC-Controlled)

**Enhanced Financial Display:**
```
┌─────────────────────────────────────────────────────────────┐
│ Transaction Summary (Hidden from Requestors)               │
├─────────────────────────────────────────────────────────────┤
│ ┌─[Subtotal]──┐ ┌─[Discount]──┐ ┌─[Tax]──────┐             │
│ │ 💰 $5,200.00│ │ 💰 -$200.00 │ │ 💰 $400.00 │             │
│ │ THB 182,000 │ │ THB -7,000  │ │ THB 14,000 │             │
│ └─────────────┘ └─────────────┘ └────────────┘             │
│                                                             │
│ ┌─── Net Amount ─────────────────────────────────────────┐   │
│ │ 🧮 Net Amount: $5,400.00 THB                          │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ ┌─── Total Amount (Highlighted) ─────────────────────────┐   │
│ │ 📈 Total Amount                              $5,400.00 │   │
│ │    Final amount including all charges     THB 189,000 │   │
│ └───────────────────────────────────────────────────────┘   │
│                                                             │
│ [THB • Primary] [USD • Base] [Rate: 1 USD = 35.00 THB]     │
└─────────────────────────────────────────────────────────────┘
```

**RBAC Implementation:**
```typescript
const TransactionSummary: React.FC<{ prData: PurchaseRequest }> = ({ prData }) => {
  const { user } = useUser();
  
  // Hide entire section from requestors
  if (!user || !canViewFinancialInfo(user.role)) {
    return null;
  }
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">Transaction Summary</CardTitle>
      </CardHeader>
      <CardContent className="pb-6">
        <SummaryTotal prData={prData} />
      </CardContent>
    </Card>
  );
};
```

## 4. Collapsible Sidebar Implementation

### 4.1. Sidebar Toggle Mechanism

**State Management:**
```typescript
const [isSidebarVisible, setIsSidebarVisible] = useState(false);

const toggleSidebar = () => {
  setIsSidebarVisible(!isSidebarVisible);
};

// Responsive sidebar CSS classes
const sidebarClasses = cn(
  'space-y-6 transition-all duration-300',
  isSidebarVisible ? 'lg:w-1/4' : 'w-0 opacity-0 overflow-hidden'
);
```

**Toggle Button Design:**
```
┌─────────────────────────────────────────────────────────────┐
│                                               [Panel Icon] │ 
│ Tooltip: "Show Sidebar" / "Hide Sidebar"                   │
└─────────────────────────────────────────────────────────────┘
```

### 4.2. Comments & Attachments Section

**Chat-Like Interface Design:**
```
┌─────────────────────────────────────────────────────────────┐
│ Comments & Attachments                                      │
├─────────────────────────────────────────────────────────────┤
│ ┌─── Comment Thread ──────────────────────────────────────┐ │
│ │ [👤] Chef Maria Rodriguez          Jan 15, 10:30 AM     │ │
│ │      Request submitted for Grand Ballroom event.       │ │
│ │      All equipment is essential for catering.          │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Comment Thread ──────────────────────────────────────┐ │
│ │ [👤] Kitchen Manager Sarah         Jan 16, 09:15 AM     │ │
│ │      Reviewed equipment specs. All items necessary     │ │
│ │      and within budget guidelines.                     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Attachments ─────────────────────────────────────────┐ │
│ │ 📎 quotation_kitchen_equipment.pdf    [View] [Download] │ │
│ │ 📎 vendor_specifications.docx         [View] [Download] │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── New Comment ─────────────────────────────────────────┐ │
│ │ [👤] [Textarea: "Add a comment..."]                     │ │
│ │      [📎 Attach] [Ctrl+Enter to send]        [Send]    │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Features:**
- **Avatar Display**: User profile pictures with initials fallback
- **Timestamp Formatting**: Relative and absolute time display
- **Rich Attachments**: File type icons and action buttons
- **Keyboard Shortcuts**: Ctrl+Enter for quick comment submission
- **Real-time Updates**: Live comment synchronization

### 4.3. Activity Log Section

**Enhanced Activity Timeline:**
```
┌─────────────────────────────────────────────────────────────┐
│ Activity Log                                    [🔍 Search] │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Date/Time    │ User           │ Action    │ Description  │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Jan 15 10:00 │ Chef Maria     │ Created   │ Purchase     │ │
│ │ 10:00 AM     │ Rodriguez      │ [Badge]   │ Request      │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Jan 15 11:30 │ Chef Maria     │ Submitted │ Ready for    │ │
│ │ 11:30 AM     │ Rodriguez      │ [Badge]   │ approval     │ │
│ ├─────────────────────────────────────────────────────────┤ │
│ │ Jan 16 14:30 │ Kitchen Mgr    │ Approved  │ Department   │ │
│ │ 02:30 PM     │ Sarah          │ [Badge]   │ approval     │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [No matching entries found] (Empty State)                  │
│ [Clear search] (Reset Action)                              │
└─────────────────────────────────────────────────────────────┘
```

**Search Functionality:**
```typescript
const ActivityTab: React.FC<{ activityLog: ActivityLogEntry[] }> = ({ activityLog }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredLog = useMemo(() => {
    return activityLog.filter(entry =>
      entry.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [activityLog, searchTerm]);
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4" />
        <Input
          placeholder="Search activity log..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      <ActivityTable entries={filteredLog} />
    </div>
  );
};
```

## 5. Enhanced ItemsTab Implementation

### 5.1. Three-Tier Information Architecture

**Compact Row (Default View):**
```
┌─────────────────────────────────────────────────────────────┐
│ [☐] Item #001: Office Supplies              [Status Badge] │
│     📍 Main Office | 📦 50 units | 📅 Feb 15  [▼ Expand]  │
└─────────────────────────────────────────────────────────────┘
```

**Expanded View (Full Details):**
```
┌─────────────────────────────────────────────────────────────┐
│ [☐] Item #001: Office Supplies              [Status Badge] │
│     📍 Main Office | 📦 50 units | 📅 Feb 15    [▲ Collapse] │
├─────────────────────────────────────────────────────────────┤
│ ┌─── Inventory Information ─────────────────────────────────┐ │
│ │ [On Hand: 25] [On Order: 10] [Reorder: 15] [Restock: 50] │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Business Dimensions (Requestor/Approver) ─────────────┐ │
│ │ Job Number: [Select ▼] Events: [Select ▼]              │ │
│ │ Projects: [Select ▼] Market Segments: [Select ▼]       │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Vendor & Pricing (Hidden from Requestors) ────────────┐ │
│ │ Vendor: [ABC Supplies ▼] Unit Price: [$125.50_______]  │ │
│ │ Total Price: [$6,275.00] Exchange Rate: [35.00 THB]    │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Tax & Discount Overrides (Purchaser Only) ────────────┐ │
│ │ [☐] Override Tax Rate: [7.5%] [☐] Apply Discount: [5%] │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Edit] [Approve] [Review] [Reject]              [All Items] │
└─────────────────────────────────────────────────────────────┘
```

### 5.2. Role-Based Section Visibility

```typescript
interface ItemExpandedViewProps {
  item: PRDetailItem;
  userRole: string;
  onUpdate: (updates: Partial<PRDetailItem>) => void;
}

const ItemExpandedView: React.FC<ItemExpandedViewProps> = ({ item, userRole, onUpdate }) => {
  const sections = {
    inventory: true, // Always visible
    businessDimensions: ['Requestor', 'Staff', 'Department Manager', 'Financial Manager'].includes(userRole),
    vendorPricing: canViewFinancialInfo(userRole),
    taxDiscountOverrides: ['Purchasing Staff'].includes(userRole)
  };
  
  return (
    <div className="space-y-4 border-t pt-4">
      {sections.inventory && <InventoryInfoSection item={item} />}
      {sections.businessDimensions && <BusinessDimensionsSection item={item} onChange={onUpdate} />}
      {sections.vendorPricing && <VendorPricingSection item={item} userRole={userRole} onChange={onUpdate} />}
      {sections.taxDiscountOverrides && <TaxDiscountOverridesSection item={item} onChange={onUpdate} />}
      <ItemActionButtons item={item} userRole={userRole} />
    </div>
  );
};
```

### 5.3. Bulk Operations Enhanced Modal

**Mixed Status Handling:**
```
┌─────────────────────────────────────────────────────────────┐
│ Bulk Action: Approve Items                             [✕] │
├─────────────────────────────────────────────────────────────┤
│ You have selected 8 items with mixed statuses:             │
│                                                             │
│ ✅ Ready for Approval: 5 items                             │
│ ⏳ Under Review: 2 items                                   │
│ ❌ Already Approved: 1 item                                │
│                                                             │
│ ┌─── Action Scope ───────────────────────────────────────┐ │
│ │ ◉ Process applicable items only (5 items)              │ │
│ │ ○ Process all items (may change some to review status) │ │
│ │ ○ Cancel and manually select appropriate items         │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ ┌─── Approval Comments ──────────────────────────────────┐ │
│ │ [Textarea: Optional bulk approval comments]            │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ [Cancel] [Process 5 Items]                                 │
└─────────────────────────────────────────────────────────────┘
```

## 6. Floating Action Menu

### 6.1. Role-Based Workflow Actions

**Floating Action Design:**
```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                                      ┌─────────────────────┐ │
│                                      │ [Reject] [Return]   │ │
│                                      │ [Approve ✓]        │ │
│                                      └─────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Role Configuration:**
```typescript
const getFloatingActions = (userRole: string, prStatus: string): ActionConfig[] => {
  const actionMap = {
    'Staff': ['delete', 'submit'],
    'Department Manager': ['reject', 'sendBack', 'approve'],
    'Financial Manager': ['reject', 'sendBack', 'approve'],
    'Purchasing Staff': ['sendBack', 'submit']
  };
  
  return actionMap[userRole]?.map(action => ({
    key: action,
    ...actionConfigs[action]
  })) || [];
};
```

## 7. Responsive Design Implementation

### 7.1. Mobile Layout Adaptations

**Stacked Layout (< 768px):**
```
┌─────────────────────────────┐
│ ← PR Details                │
├─────────────────────────────┤
│ [Draft Badge]               │
│ PR-2401-0001                 │
│ Kitchen Equipment Request   │
├─────────────────────────────┤
│ ▼ Basic Information         │
│ Department: Kitchen         │
│ Requestor: Chef Maria       │
│ Date: Jan 15, 2024         │
│                             │
│ ▼ Status Information        │
│ Stage: Department Approval  │
│ Status: Pending            │
│                             │
│ ▼ Items (5)                │
│ [Item 1] [Item 2] [Item 3] │
│                             │
│ ▼ Comments (3)             │
│ [Comment 1] [Comment 2]    │
│                             │
│ [Approve] [Reject]         │
└─────────────────────────────┘
```

### 7.2. Tablet Optimizations

**Overlay Sidebar (768px - 1199px):**
- Sidebar slides over main content
- Backdrop overlay for focus
- Smooth animation transitions
- Touch-friendly close gestures

## 8. Accessibility Implementation

### 8.1. WCAG 2.1 AA Compliance

**Keyboard Navigation:**
```typescript
const KeyboardNavigation = {
  'Tab': 'Navigate to next interactive element',
  'Shift+Tab': 'Navigate to previous interactive element',
  'Enter/Space': 'Activate buttons and links',
  'Escape': 'Close modals and dropdowns',
  'Arrow Keys': 'Navigate within component groups'
};
```

**Screen Reader Support:**
```jsx
// Accessible sidebar toggle
<TooltipProvider>
  <Tooltip>
    <TooltipTrigger asChild>
      <button
        aria-expanded={isSidebarVisible}
        aria-controls="pr-sidebar"
        aria-label={isSidebarVisible ? "Hide sidebar" : "Show sidebar"}
        onClick={toggleSidebar}
      >
        {isSidebarVisible ? <PanelRightClose /> : <PanelRightOpen />}
      </button>
    </TooltipTrigger>
    <TooltipContent>
      {isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
    </TooltipContent>
  </Tooltip>
</TooltipProvider>

// Accessible form sections
<fieldset>
  <legend className="sr-only">Purchase Request Basic Information</legend>
  <div className="grid grid-cols-4 gap-4">
    {/* Form fields */}
  </div>
</fieldset>
```

### 8.2. Color and Contrast Standards

**Status Color System:**
```scss
// WCAG AA compliant color ratios
.status-draft { 
  background: #f3f4f6; 
  color: #374151; /* 4.5:1 contrast ratio */
}
.status-approved { 
  background: #d1fae5; 
  color: #065f46; /* 7.2:1 contrast ratio */
}
.status-rejected { 
  background: #fee2e2; 
  color: #991b1b; /* 5.8:1 contrast ratio */
}
```

## 9. Performance Optimizations

### 9.1. Component Lazy Loading

```typescript
// Lazy load heavy sidebar components
const PRCommentsAttachmentsTab = lazy(() => import('./tabs/PRCommentsAttachmentsTab'));
const ActivityTab = lazy(() => import('./tabs/ActivityTab'));

// Use React Suspense for loading states
<Suspense fallback={<div className="animate-pulse">Loading comments...</div>}>
  <PRCommentsAttachmentsTab prData={formData} />
</Suspense>
```

### 9.2. Optimistic UI Updates

```typescript
const useOptimisticPRUpdate = () => {
  const [optimisticState, setOptimisticState] = useState(null);
  
  const updatePROptimistically = async (updateFn, apiCall) => {
    // Apply update immediately
    setOptimisticState(updateFn);
    
    try {
      const result = await apiCall();
      setOptimisticState(null);
      return result;
    } catch (error) {
      // Revert on error
      setOptimisticState(null);
      showErrorNotification('Update failed. Please try again.');
      throw error;
    }
  };
  
  return { optimisticState, updatePROptimistically };
};
```

### 9.3. Virtual Scrolling for Large Lists

```typescript
// Virtual scrolling for large activity logs
import { FixedSizeList as List } from 'react-window';

const VirtualizedActivityLog: React.FC<{ activities: ActivityLogEntry[] }> = ({ activities }) => {
  const Row = ({ index, style }) => (
    <div style={style}>
      <ActivityLogItem activity={activities[index]} />
    </div>
  );

  return (
    <List
      height={400}
      itemCount={activities.length}
      itemSize={60}
      width="100%"
    >
      {Row}
    </List>
  );
};
```

## 10. Integration Patterns

### 10.1. RBAC Service Integration

```typescript
// Centralized permission checking
const useRBACIntegration = (user: User, pr: PurchaseRequest) => {
  const permissions = useMemo(() => ({
    canEdit: PRRBACService.canPerformAction(user, pr, 'edit'),
    canApprove: PRRBACService.canPerformAction(user, pr, 'approve'),
    canViewFinancials: canViewFinancialInfo(user.role),
    availableActions: PRRBACService.getAvailableActions(user, pr)
  }), [user, pr]);
  
  return permissions;
};
```

### 10.2. Real-time Updates

```typescript
// WebSocket integration for live updates
const usePRRealTimeUpdates = (prId: string) => {
  const [pr, setPR] = useState<PurchaseRequest>();
  
  useEffect(() => {
    const socket = new WebSocket(`/api/pr/${prId}/updates`);
    
    socket.onmessage = (event) => {
      const update = JSON.parse(event.data);
      setPR(current => ({ ...current, ...update }));
    };
    
    return () => socket.close();
  }, [prId]);
  
  return pr;
};
```

This comprehensive UI specification provides detailed guidance for implementing a modern, accessible, and role-aware Purchase Request detail interface that enhances user experience while maintaining security and compliance requirements.