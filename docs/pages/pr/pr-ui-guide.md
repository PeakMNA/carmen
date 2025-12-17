# Purchase Request (PR) Module - UI Design Guide

*Version 1.0 | Last Updated: January 2025*

## Overview

This guide documents the design system, user experience patterns, and implementation guidelines for the Purchase Request (PR) module. The PR system is a sophisticated workflow-driven interface that adapts based on user roles, permissions, and request states.

## Table of Contents

1. [Design Philosophy](#design-philosophy)
2. [Component Architecture](#component-architecture)
3. [Visual Design System](#visual-design-system)
4. [Layout Patterns](#layout-patterns)
5. [User Experience Guidelines](#user-experience-guidelines)
6. [Role-Based Interface Design](#role-based-interface-design)
7. [Responsive Design](#responsive-design)
8. [Accessibility Standards](#accessibility-standards)
9. [Development Guidelines](#development-guidelines)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Design Philosophy

### Core Principles

**1. Workflow-Driven Interface**
- UI adapts dynamically based on PR status and user role
- Action buttons appear/disappear based on workflow permissions
- Status indicators provide clear visual feedback on request progress

**2. Role-Based Adaptive Design**
- Staff/Requestors see simplified interfaces focused on creation and basic editing
- Approvers see expanded interfaces with approval/rejection controls
- Purchasers have access to vendor management and pricing tools

**3. Information Hierarchy**
- Critical information (amounts, status, deadlines) prominently displayed
- Secondary details accessible through expandable sections
- Progressive disclosure prevents information overload

---

## Component Architecture

### 1. PR List Component (`purchase-request-list.tsx`)

**Primary Functions:**
- Displays paginated list of purchase requests
- Supports table and card view modes
- Advanced filtering and search capabilities
- Bulk action operations with role-based permissions

**Key Sub-Components:**
```
PurchaseRequestList
├── Filters & Search Bar
├── View Mode Toggle (Table/Card)
├── Bulk Actions Bar (when items selected)
├── Data Table/Card Grid
│   ├── Individual PR Rows/Cards
│   ├── Status Badges
│   └── Action Dropdowns
└── Pagination Controls
```

### 2. PR Detail Component (`PRDetailPage.tsx`)

**Primary Functions:**
- Comprehensive view/edit interface for individual PRs
- Tab-based organization of PR information
- Workflow status management
- Comment and attachment handling

**Key Sub-Components:**
```
PRDetailPage
├── Header Section
│   ├── PR Title & Number
│   ├── Status Badge
│   └── Action Buttons
├── Tabbed Content Area
│   ├── Basic Information Tab
│   ├── Items Tab (Complex)
│   ├── Comments & Attachments Tab
│   └── History Tab
└── Footer Actions
```

### 3. Items Tab Component (`ItemsTab.tsx`)

**Primary Functions:**
- Advanced line item management
- Inline editing capabilities
- Approval/rejection workflow per item
- Vendor comparison and pricing tools

**Key Sub-Components:**
```
ItemsTab
├── Items Summary Bar
├── Search & Filter Controls
├── Bulk Selection & Actions
├── Item Rows (Table View)
│   ├── Expandable Details
│   ├── Inline Edit Mode
│   ├── Status Controls
│   └── Action Dropdowns
└── Card View (Mobile)
    ├── Compact Item Cards
    └── Touch-Optimized Actions
```

---

## Visual Design System

### Color Palette

#### Status Colors
```css
/* Success States */
--success-bg: rgb(220 252 231)    /* bg-green-100 */
--success-text: rgb(22 101 52)    /* text-green-800 */
--success-border: rgb(187 247 208) /* border-green-200 */

/* Warning States */
--warning-bg: rgb(254 249 195)    /* bg-yellow-100 */
--warning-text: rgb(133 77 14)    /* text-yellow-800 */
--warning-border: rgb(254 240 138) /* border-yellow-200 */

/* Error States */
--error-bg: rgb(254 226 226)      /* bg-red-100 */
--error-text: rgb(153 27 27)      /* text-red-800 */
--error-border: rgb(252 165 165)  /* border-red-200 */

/* Primary Brand */
--primary-bg: rgb(59 130 246 / 0.1) /* bg-primary/10 */
--primary-text: rgb(59 130 246)      /* text-primary */
--primary-border: rgb(147 197 253)   /* border-primary-200 */

/* Neutral Grays */
--muted-bg: rgb(248 250 252)      /* bg-muted */
--muted-text: rgb(100 116 139)    /* text-muted-foreground */
--border: rgb(226 232 240)        /* border */
```

#### Semantic Status Mapping
- **Pending**: Amber/Yellow - Awaiting action
- **Approved**: Green - Successfully processed
- **Rejected**: Red - Declined or failed
- **In Review**: Orange - Under evaluation
- **Draft**: Gray - Not yet submitted

### Typography System

```css
/* Headings */
.heading-xl { font-size: 1.875rem; font-weight: 700; line-height: 2.25rem; }  /* text-3xl font-bold */
.heading-lg { font-size: 1.5rem; font-weight: 600; line-height: 2rem; }       /* text-2xl font-semibold */
.heading-md { font-size: 1.25rem; font-weight: 600; line-height: 1.75rem; }   /* text-xl font-semibold */
.heading-sm { font-size: 1.125rem; font-weight: 600; line-height: 1.75rem; }  /* text-lg font-semibold */

/* Body Text */
.body-lg { font-size: 1rem; font-weight: 400; line-height: 1.5rem; }          /* text-base */
.body-md { font-size: 0.875rem; font-weight: 400; line-height: 1.25rem; }     /* text-sm */
.body-sm { font-size: 0.75rem; font-weight: 400; line-height: 1rem; }         /* text-xs */

/* Emphasis */
.text-emphasized { font-weight: 600; }  /* font-semibold */
.text-strong { font-weight: 700; }      /* font-bold */
.text-muted { color: rgb(100 116 139); } /* text-muted-foreground */
```

### Spacing System

```css
/* Component Spacing */
--space-xs: 0.25rem;    /* 4px - px-1, py-1 */
--space-sm: 0.5rem;     /* 8px - px-2, py-2 */
--space-md: 0.75rem;    /* 12px - px-3, py-3 */
--space-lg: 1rem;       /* 16px - px-4, py-4 */
--space-xl: 1.25rem;    /* 20px - px-5, py-5 */
--space-2xl: 1.5rem;    /* 24px - px-6, py-6 */

/* Layout Spacing */
--gap-xs: 0.5rem;       /* gap-2 */
--gap-sm: 0.75rem;      /* gap-3 */
--gap-md: 1rem;         /* gap-4 */
--gap-lg: 1.5rem;       /* gap-6 */
--gap-xl: 2rem;         /* gap-8 */
```

### Component Sizing

```css
/* Button Sizes */
.btn-sm { height: 2rem; padding: 0.25rem 0.75rem; font-size: 0.875rem; }      /* h-8 px-3 text-sm */
.btn-md { height: 2.5rem; padding: 0.5rem 1rem; font-size: 0.875rem; }        /* h-10 px-4 text-sm */
.btn-lg { height: 2.75rem; padding: 0.5rem 1.25rem; font-size: 1rem; }        /* h-11 px-5 text-base */

/* Input Sizes */
.input-sm { height: 2rem; padding: 0.25rem 0.75rem; font-size: 0.875rem; }    /* h-8 px-3 text-sm */
.input-md { height: 2.5rem; padding: 0.5rem 0.75rem; font-size: 0.875rem; }   /* h-10 px-3 text-sm */

/* Icon Sizes */
.icon-xs { width: 0.75rem; height: 0.75rem; }  /* w-3 h-3 */
.icon-sm { width: 1rem; height: 1rem; }        /* w-4 h-4 */
.icon-md { width: 1.25rem; height: 1.25rem; }  /* w-5 h-5 */
.icon-lg { width: 1.5rem; height: 1.5rem; }    /* w-6 h-6 */
```

---

## Layout Patterns

### Container Structure

```jsx
// Standard Page Layout
<div className="container mx-auto px-4 py-6 max-w-7xl">
  <header className="mb-6">
    {/* Page title, breadcrumbs, primary actions */}
  </header>
  
  <main className="space-y-6">
    {/* Filters, search, bulk actions */}
    {/* Main content area */}
  </main>
  
  <footer className="mt-8">
    {/* Pagination, additional actions */}
  </footer>
</div>
```

### Card Layout Pattern

```jsx
// Standard Card Structure
<Card className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
  <CardHeader className="p-4 pb-3 bg-muted/30 border-b">
    {/* Title, status, primary info */}
  </CardHeader>
  
  <CardContent className="p-4">
    {/* Main content in grid or flex layout */}
  </CardContent>
  
  <CardFooter className="p-4 pt-3 bg-muted/20 border-t">
    {/* Actions, secondary info */}
  </CardFooter>
</Card>
```

### Form Field Organization

```jsx
// Standard Form Grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div className="space-y-2">
    <Label className="text-sm font-medium">Field Label</Label>
    <Input className="w-full" />
    <p className="text-xs text-muted-foreground">Helper text</p>
  </div>
</div>
```

---

## User Experience Guidelines

### Information Architecture

#### Priority Hierarchy
1. **Critical Actions** - Primary workflow buttons (Submit, Approve, Reject)
2. **Status Information** - Current state, deadlines, amounts
3. **Core Data** - Request details, items, quantities
4. **Secondary Actions** - Edit, Comment, History
5. **Metadata** - Created date, requestor, references

#### Content Organization Principles
- **Progressive Disclosure**: Show essential information first, details on demand
- **Contextual Actions**: Actions appear where and when they're needed
- **Consistent Patterns**: Similar types of information use consistent layouts
- **Scannable Content**: Use typography, spacing, and color to create scannable interfaces

### Interaction Patterns

#### Button States and Behaviors
```jsx
// Primary Action Button
<Button 
  variant="default"
  className="bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary/20"
  disabled={isSubmitting}
>
  {isSubmitting ? 'Processing...' : 'Submit Request'}
</Button>

// Destructive Action Button  
<Button 
  variant="destructive"
  className="bg-red-600 hover:bg-red-700 focus:ring-2 focus:ring-red-100"
>
  <Trash2 className="w-4 h-4 mr-2" />
  Delete
</Button>

// Secondary Action Button
<Button 
  variant="outline"
  className="border-muted-foreground/20 hover:bg-muted/50"
>
  Cancel
</Button>
```

#### Loading States
```jsx
// Skeleton Loading
<div className="animate-pulse">
  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
  <div className="h-4 bg-muted rounded w-1/2"></div>
</div>

// Button Loading
<Button disabled>
  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
  Processing...
</Button>
```

#### Empty States
```jsx
// No Data State
<div className="text-center py-12">
  <Search className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
  <h3 className="text-lg font-medium text-foreground mb-2">No results found</h3>
  <p className="text-muted-foreground mb-4">
    Try adjusting your search or filter criteria
  </p>
  <Button variant="outline" onClick={clearFilters}>
    Clear Filters
  </Button>
</div>
```

### Feedback and Notifications

#### Status Badge System
```jsx
// Status Badge with semantic colors
<Badge 
  variant="secondary"
  className={cn(
    "px-2 py-1 font-medium rounded-full",
    {
      'bg-green-100 text-green-800': status === 'Approved',
      'bg-red-100 text-red-800': status === 'Rejected', 
      'bg-yellow-100 text-yellow-800': status === 'Pending',
      'bg-orange-100 text-orange-800': status === 'Review'
    }
  )}
>
  {status}
</Badge>
```

#### Toast Notifications
- **Success**: Green background, checkmark icon
- **Error**: Red background, X icon  
- **Warning**: Yellow background, triangle icon
- **Info**: Blue background, info icon

---

## Role-Based Interface Design

### User Roles and Capabilities

#### Staff/Requestor Role
- **Can See**: Own requests, basic item details
- **Can Do**: Create, edit (draft), submit, cancel own requests
- **UI Adaptations**: 
  - Simplified interface focused on request creation
  - Limited action buttons
  - Basic status visibility

#### Approver Role  
- **Can See**: Assigned requests, full details, pricing (if configured)
- **Can Do**: Approve, reject, request changes, add comments
- **UI Adaptations**: 
  - Approval action buttons prominently displayed
  - Enhanced status information
  - Comment and history sections visible

#### Purchaser Role
- **Can See**: All requests, vendor information, complete pricing
- **Can Do**: All approver actions plus vendor assignment, PO creation
- **UI Adaptations**: 
  - Full interface with all features
  - Vendor comparison tools
  - Purchasing workflow controls

### Conditional UI Elements

```jsx
// Role-based component rendering
{isApprover && (
  <div className="flex gap-2">
    <Button 
      variant="outline" 
      className="text-green-600 border-green-200 hover:bg-green-50"
      onClick={() => handleApprove(item.id)}
    >
      <CheckCircle className="w-4 h-4 mr-2" />
      Approve
    </Button>
    <Button 
      variant="outline"
      className="text-red-600 border-red-200 hover:bg-red-50"
      onClick={() => handleReject(item.id)}  
    >
      <XCircle className="w-4 h-4 mr-2" />
      Reject
    </Button>
  </div>
)}
```

---

## Responsive Design

### Breakpoint Strategy

```css
/* Mobile First Approach */
.responsive-container {
  @apply px-4;                    /* Mobile: 16px padding */
}

@media (min-width: 640px) {       /* sm: tablets */
  .responsive-container {
    @apply px-6;                  /* 24px padding */
  }
}

@media (min-width: 1024px) {      /* lg: desktop */
  .responsive-container {
    @apply px-8;                  /* 32px padding */
  }
}

@media (min-width: 1280px) {      /* xl: large desktop */
  .responsive-container {
    @apply px-12;                 /* 48px padding */
  }
}
```

### Layout Adaptations

#### Table to Card Transformation
```jsx
// Desktop: Table View
<Table className="hidden md:table">
  <TableHeader>
    <TableRow>
      <TableHead>Request #</TableHead>
      <TableHead>Date</TableHead>
      <TableHead>Status</TableHead>
      <TableHead>Amount</TableHead>
      <TableHead>Actions</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {/* Table rows */}
  </TableBody>
</Table>

// Mobile: Card View
<div className="md:hidden space-y-4">
  {items.map(item => (
    <Card key={item.id} className="p-4">
      {/* Stacked card content */}
    </Card>
  ))}
</div>
```

#### Navigation Adaptations
```jsx
// Desktop: Horizontal tabs
<Tabs className="hidden md:block">
  <TabsList className="grid w-full grid-cols-4">
    <TabsTrigger value="basic">Basic Info</TabsTrigger>
    <TabsTrigger value="items">Items</TabsTrigger>
    <TabsTrigger value="comments">Comments</TabsTrigger>
    <TabsTrigger value="history">History</TabsTrigger>
  </TabsList>
</Tabs>

// Mobile: Dropdown navigation
<Select className="md:hidden">
  <SelectTrigger>
    <SelectValue placeholder="Select section" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="basic">Basic Info</SelectItem>
    <SelectItem value="items">Items</SelectItem>
    <SelectItem value="comments">Comments</SelectItem>
    <SelectItem value="history">History</SelectItem>
  </SelectContent>
</Select>
```

---

## Accessibility Standards

### WCAG 2.1 AA Compliance

#### Color and Contrast
- **Text**: Minimum 4.5:1 contrast ratio against background
- **UI Elements**: Minimum 3:1 contrast ratio for interactive components
- **Color Independence**: Information never conveyed by color alone

#### Keyboard Navigation
```jsx
// Focus management
<Button 
  className="focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleAction();
    }
  }}
>
  Action Button
</Button>

// Skip links for screen readers
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-primary text-primary-foreground px-4 py-2 rounded-md"
>
  Skip to main content
</a>
```

#### Screen Reader Support
```jsx
// Proper labeling
<Button aria-label="Delete purchase request #PR-2401-0001">
  <Trash2 className="w-4 h-4" />
</Button>

// Status announcements
<div 
  role="status" 
  aria-live="polite"
  className="sr-only"
>
  {statusMessage}
</div>

// Table headers
<Table>
  <TableHeader>
    <TableRow>
      <TableHead scope="col">Request Number</TableHead>
      <TableHead scope="col">Date Created</TableHead>
      <TableHead scope="col">Status</TableHead>
    </TableRow>
  </TableHeader>
</Table>
```

#### Form Accessibility
```jsx
// Proper form structure
<div className="space-y-2">
  <Label htmlFor="request-title" className="text-sm font-medium">
    Request Title
    <span className="text-red-500 ml-1">*</span>
  </Label>
  <Input 
    id="request-title"
    aria-required="true"
    aria-describedby="request-title-error"
    className={cn(
      "w-full",
      errors.title && "border-red-500 focus:border-red-500 focus:ring-red-200"
    )}
  />
  {errors.title && (
    <p id="request-title-error" className="text-sm text-red-600" role="alert">
      {errors.title.message}
    </p>
  )}
</div>
```

---

## Development Guidelines

### Component Structure Standards

#### File Naming Conventions
```
components/
├── PurchaseRequestList.tsx          # Main component (PascalCase)
├── purchase-request-list.module.css # Styles (kebab-case)
├── hooks/
│   └── usePurchaseRequests.ts       # Custom hooks (camelCase)
├── types/
│   └── purchase-request.types.ts    # Type definitions
└── utils/
    └── purchase-request.utils.ts    # Utility functions
```

#### Component Architecture Pattern
```tsx
// Standard component structure
interface ComponentProps {
  // Props interface first
}

export function ComponentName({ ...props }: ComponentProps) {
  // 1. Hooks and state
  const [state, setState] = useState();
  
  // 2. Computed values and memoization
  const computedValue = useMemo(() => {
    // computation
  }, [dependencies]);
  
  // 3. Event handlers
  const handleAction = useCallback(() => {
    // handler logic
  }, [dependencies]);
  
  // 4. Effects
  useEffect(() => {
    // effect logic
  }, [dependencies]);
  
  // 5. Early returns for loading/error states
  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  // 6. Main render
  return (
    <div className="component-container">
      {/* Component JSX */}
    </div>
  );
}
```

### State Management Patterns

#### Form State Management
```tsx
// Using React Hook Form with Zod validation
const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  items: z.array(itemSchema).min(1, 'At least one item required')
});

const form = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    title: '',
    description: '',
    items: []
  }
});
```

#### List State Management
```tsx
// Optimized list state with memoization
const PurchaseRequestList = () => {
  const [filters, setFilters] = useState(defaultFilters);
  const [sortConfig, setSortConfig] = useState(defaultSort);
  const [currentPage, setCurrentPage] = useState(1);
  
  // Memoized filtered and sorted data
  const filteredRequests = useMemo(() => {
    return requests
      .filter(request => matchesFilters(request, filters))
      .sort(getSortComparator(sortConfig));
  }, [requests, filters, sortConfig]);
  
  // Paginated data
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRequests, currentPage, itemsPerPage]);
};
```

### Performance Guidelines

#### Lazy Loading and Code Splitting
```tsx
// Component lazy loading
const PurchaseRequestDetail = lazy(() => import('./PurchaseRequestDetail'));

// Route-based code splitting
const PurchaseRequestRoutes = () => (
  <Routes>
    <Route 
      path="/purchase-requests/:id" 
      element={
        <Suspense fallback={<DetailSkeleton />}>
          <PurchaseRequestDetail />
        </Suspense>
      } 
    />
  </Routes>
);
```

#### Image and Asset Optimization
```tsx
// Optimized image loading
<Image 
  src={attachment.url}
  alt={attachment.name}
  width={200}
  height={150}
  className="object-cover rounded-md"
  loading="lazy"
  placeholder="blur"
  blurDataURL="data:image/..."
/>
```

### Testing Patterns

#### Component Testing
```tsx
// Jest + React Testing Library
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PurchaseRequestList } from './PurchaseRequestList';

describe('PurchaseRequestList', () => {
  it('displays purchase requests correctly', () => {
    render(<PurchaseRequestList requests={mockRequests} />);
    
    expect(screen.getByText('Purchase Requests')).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(mockRequests.length + 1); // +1 for header
  });
  
  it('filters requests by status', async () => {
    render(<PurchaseRequestList requests={mockRequests} />);
    
    fireEvent.click(screen.getByRole('button', { name: /filter by status/i }));
    fireEvent.click(screen.getByText('Approved'));
    
    await waitFor(() => {
      expect(screen.getByText('Approved Request')).toBeInTheDocument();
      expect(screen.queryByText('Pending Request')).not.toBeInTheDocument();
    });
  });
});
```

#### Accessibility Testing
```tsx
// axe-core integration
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should not have accessibility violations', async () => {
  const { container } = render(<PurchaseRequestList requests={mockRequests} />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

---

## Conclusion

This UI guide serves as the source of truth for the Purchase Request module's design system. It ensures consistency across all PR-related interfaces and provides clear guidelines for extending the system.

### Key Takeaways

1. **Consistency is Key**: Use established patterns and components consistently throughout the module
2. **Accessibility First**: Every interface element must meet WCAG 2.1 AA standards
3. **Role-Based Design**: Interfaces adapt to user roles and permissions seamlessly
4. **Performance Matters**: Use memoization, lazy loading, and efficient state management
5. **Mobile-First**: Design for mobile experiences first, then enhance for desktop

### Future Considerations

- **Design Tokens**: Consider implementing CSS custom properties for more maintainable theming
- **Component Library**: Extract reusable components into a shared library
- **Design System Documentation**: Create living documentation with Storybook
- **User Testing**: Conduct regular usability testing to validate design decisions

---

*For questions or suggestions regarding this guide, please contact the UX team or create an issue in the project repository.*