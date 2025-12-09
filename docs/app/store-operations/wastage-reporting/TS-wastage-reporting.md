# Technical Specification: Wastage Reporting

## Module Information
- **Module**: Store Operations
- **Sub-Module**: Wastage Reporting
- **Route**: `/app/(main)/store-operations/wastage-reporting`
- **Version**: 1.2.0
- **Last Updated**: 2025-12-09
- **Owner**: Store Operations Team
- **Status**: Active
- **Implementation Status**: IMPLEMENTED (Frontend UI Complete with Mock Data)

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.2.0 | 2025-12-09 | Documentation Team | Updated to reflect implemented frontend architecture |
| 1.1.0 | 2025-12-05 | Documentation Team | Added implementation status warning |
| 1.0.0 | 2025-01-12 | Store Operations Team | Initial version |

---

## ✅ IMPLEMENTATION NOTE

The Wastage Reporting module frontend has been fully implemented using Next.js 14 App Router with the following technical architecture:

**Implemented Pages**:
- ✅ `app/(main)/store-operations/wastage-reporting/page.tsx` - Dashboard with Recharts (LineChart, PieChart, BarChart)
- ✅ `app/(main)/store-operations/wastage-reporting/new/page.tsx` - Multi-step form with item search, file upload UI
- ✅ `app/(main)/store-operations/wastage-reporting/reports/page.tsx` - Data table with bulk selection, status filters
- ✅ `app/(main)/store-operations/wastage-reporting/reports/[id]/page.tsx` - Dynamic route with detail view
- ✅ `app/(main)/store-operations/wastage-reporting/analytics/page.tsx` - Advanced analytics with AreaChart, stacked bars
- ✅ `app/(main)/store-operations/wastage-reporting/categories/page.tsx` - CRUD operations with Dialog components

**Technical Stack Used**:
- React Client Components (`'use client'`)
- Shadcn/ui components (Card, Table, Badge, Select, Dialog, Switch)
- Recharts for data visualization
- useState/useMemo for state management
- Mock data inline in components (pending centralization)

See [BR-wastage-reporting.md](./BR-wastage-reporting.md) for complete implementation details.

---

## Overview

The Wastage Reporting sub-module is implemented as a full-stack Next.js 14 application using the App Router architecture with React Server Components. It follows a three-tier architecture pattern with clear separation between presentation (React components), application logic (Server Actions), and data persistence (PostgreSQL database via Prisma).

The implementation leverages modern React patterns including Server Components for initial data loading and SEO optimization, Client Components for interactive features, React Hook Form with Zod validation for forms, and React Query for client-side data caching and synchronization. The application uses Shadcn/ui components built on Radix UI primitives to ensure accessibility compliance and consistent user experience.

Photo management is implemented using Supabase Storage with client-side compression, server-side watermarking, and signed URLs for secure access. The approval workflow is powered by a custom workflow engine that routes transactions through multiple approval levels based on configurable value thresholds. Real-time notifications are implemented using Server-Sent Events (SSE) for approvers and email integration for offline notifications.

The system implements comprehensive security through row-level security (RLS) in PostgreSQL, ensuring users can only access wastage data for locations they have permission to view. All write operations create audit trail records capturing the complete change history for compliance and fraud detection.

**⚠️ IMPORTANT**: This is a Technical Specification Document in TEXT FORMAT ONLY. This document describes implementation patterns and component responsibilities without including actual code. For database schemas, refer to the Data Schema (DS) document. For validation rules, refer to the Validations (VAL) document.

**Related Documents**:
- [Business Requirements](./BR-wastage-reporting.md) - Functional and non-functional requirements
- [Use Cases](./UC-wastage-reporting.md) - Detailed use case scenarios
- [Data Schema](./DS-wastage-reporting.md) - Proposed database schema
- [Flow Diagrams](./FD-wastage-reporting.md) - Visual process flows
- [Validations](./VAL-wastage-reporting.md) - Validation rules and Zod schemas

---

## Architecture

### High-Level Architecture

The Wastage Reporting module follows a three-tier client-server architecture with clear separation of concerns:

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  (Browser - React Components, State Management)              │
├─────────────────────────────────────────────────────────────┤
│  • React Server Components (initial page load)               │
│  • React Client Components (interactive features)            │
│  • React Hook Form (form state and validation)               │
│  • React Query (server state caching)                        │
│  • Zustand (UI state management)                             │
│  • Shadcn/ui Components (UI primitives)                      │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS/REST API
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│     (Next.js Server - Business Logic)                        │
├─────────────────────────────────────────────────────────────┤
│  • Server Actions (API endpoints)                            │
│  • Business Logic Layer (workflow, calculations)             │
│  • Validation Layer (Zod schemas)                            │
│  • Authorization Layer (permission checks)                   │
│  • Integration Layer (inventory, finance, notifications)     │
└──────────────────┬──────────────────────────────────────────┘
                   │ PostgreSQL Protocol
                   ▼
┌─────────────────────────────────────────────────────────────┐
│                        Data Layer                            │
│    (PostgreSQL Database via Supabase)                        │
├─────────────────────────────────────────────────────────────┤
│  • Wastage Tables (headers, line items, photos, approvals)   │
│  • Row-Level Security (RLS) Policies                         │
│  • Database Triggers (audit logging)                         │
│  • Stored Procedures (complex calculations)                  │
│  • Views (pre-joined data for reporting)                     │
└─────────────────────────────────────────────────────────────┘

External Integrations:
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│  Inventory   │   │   Finance    │   │   Workflow   │
│  Management  │   │    Module    │   │    Engine    │
└──────────────┘   └──────────────┘   └──────────────┘
       ▲                   ▲                   ▲
       │                   │                   │
       └───────────────────┴───────────────────┘
                           │
              Internal Module API Calls

┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│   Supabase   │   │    Email     │   │   Analytics  │
│   Storage    │   │   Service    │   │    Engine    │
│  (Photos)    │   │ (SendGrid)   │   │  (Background │
└──────────────┘   └──────────────┘   │    Jobs)     │
       ▲                   ▲           └──────────────┘
       │                   │                   ▲
       └───────────────────┴───────────────────┘
                           │
              External Service API Calls
```

### Component Architecture

**Frontend Layer Components**:

1. **Page Components** (Server Components)
   - WastageListPage: Main listing with server-side filtering and pagination
   - WastageDetailPage: Complete transaction details with photos and approval history
   - WastageRecordPage: Form for recording new wastage
   - ApprovalQueuePage: Pending approvals list for managers
   - AnalyticsDashboardPage: Wastage trends and insights

2. **UI Components** (Client Components)
   - WastageForm: Interactive form with real-time validation
   - PhotoUploadWidget: Camera integration and photo management
   - ApprovalActionButtons: Approve/reject actions with confirmation
   - WastageTable: Sortable, filterable data table
   - TrendCharts: Data visualization (Chart.js integration)
   - FilterPanel: Advanced filtering interface

3. **State Management**
   - WastageStore (Zustand): UI state for filters, selections, sidebar state
   - useWastageQuery (React Query): Server data caching for wastage transactions
   - usePhotos (React Query): Photo management and upload state
   - useApprovals (React Query): Approval workflow state

**Backend Layer Components**:

1. **Server Actions** (in `actions.ts`)
   - CRUD Operations: createWastage, getWastageById, updateWastage, deleteWastage
   - Approval Operations: approveWastage, rejectWastage, partialApproveWastage
   - Query Operations: listWastage, searchWastage, getWastageStatistics
   - Photo Operations: uploadPhoto, deletePhoto, getPhotoUrl
   - Export Operations: exportWastageToExcel, exportWastageToPDF

2. **Business Logic Layer**
   - WastageCalculator: Calculates wastage values, percentages, trends
   - ApprovalRouter: Determines approval path based on value thresholds
   - AnomalyDetector: Identifies unusual wastage patterns
   - NotificationManager: Sends notifications to approvers and submitters

3. **Data Access Layer**
   - WastageRepository: Database operations for wastage entities
   - PhotoRepository: Photo storage and retrieval operations
   - ApprovalRepository: Approval workflow data operations
   - AuditRepository: Audit trail logging operations

4. **Integration Layer**
   - InventoryIntegration: Communicates with Inventory Management module
   - FinanceIntegration: Posts wastage to General Ledger
   - WorkflowIntegration: Approval workflow orchestration
   - NotificationIntegration: Email and in-app notifications

**Data Layer Components**:

1. **Database Tables** (see DS document for detailed schema)
   - wastage_headers: Main wastage transaction records
   - wastage_line_items: Individual products wasted within transaction
   - wastage_photos: Photo evidence storage metadata
   - wastage_approvals: Approval history and workflow state
   - wastage_configuration: System configuration and thresholds

2. **Database Views**
   - vw_wastage_summary: Pre-joined wastage data for listing
   - vw_pending_approvals: Filtered view of pending approvals by approver
   - vw_wastage_trends: Aggregated data for analytics
   - vw_supplier_quality_issues: Wastage attributed to supplier quality

3. **Database Functions & Triggers**
   - fn_calculate_wastage_value: Calculates total value based on quantity and cost
   - fn_route_to_approver: Determines approver based on value and rules
   - trg_wastage_audit: Automatically logs changes to audit trail
   - trg_update_inventory: Triggers inventory adjustment on approval

---

## Technology Stack

### Frontend Technologies

- **Framework**: Next.js 14.2+ (App Router with React Server Components)
- **UI Library**: React 18.2+ with TypeScript 5.8+
- **Styling**: Tailwind CSS 3.4+ with custom design tokens
- **Component Library**: Shadcn/ui components built on Radix UI primitives
- **Form Handling**: React Hook Form 7.48+ for form state management
- **Validation**: Zod 3.22+ for schema validation (client and server)
- **State Management**:
  - Zustand 4.4+ for UI state (filters, selections, preferences)
  - React Query (TanStack Query) 5.17+ for server state (data fetching, caching)
- **Data Visualization**: Chart.js 4.4+ with react-chartjs-2 wrapper
- **Icons**: Lucide React 0.300+ (consistent icon system)
- **Date Handling**: date-fns 3.0+ for date formatting and manipulation
- **File Upload**: React Dropzone 14.2+ for drag-and-drop photo upload
- **Image Compression**: Browser-image-compression for client-side photo optimization
- **Notifications**: Sonner for toast notifications

### Backend Technologies

- **Runtime**: Node.js 20.11+ LTS
- **Framework**: Next.js 14.2+ Server Actions (serverless functions)
- **Database**: PostgreSQL 14+ via Supabase (managed PostgreSQL)
- **ORM**: Prisma ORM 5.8+ for type-safe database access
- **Authentication**: NextAuth.js 4.24+ with Supabase adapter
- **File Storage**: Supabase Storage for photo management
- **Email Service**: SendGrid API for notification emails
- **Image Processing**: Sharp 0.33+ for server-side image watermarking
- **PDF Generation**: jsPDF 2.5+ for report generation
- **Excel Generation**: ExcelJS 4.4+ for data exports
- **Validation**: Zod 3.22+ (shared between client and server)
- **Logging**: Pino 8.17+ for structured logging

### Testing Technologies

- **Unit Tests**: Vitest 1.1+ (fast unit test runner)
- **Integration Tests**: Vitest with test database
- **E2E Tests**: Playwright 1.40+ (cross-browser testing)
- **API Tests**: Supertest 6.3+ for API endpoint testing
- **Component Tests**: React Testing Library 14.1+
- **Mock Data**: Faker.js 8.3+ for test data generation

### DevOps Technologies

- **Version Control**: Git with GitHub
- **CI/CD**: GitHub Actions (automated testing and deployment)
- **Hosting**: Vercel (serverless deployment with global CDN)
- **Database Hosting**: Supabase (managed PostgreSQL with Row-Level Security)
- **Monitoring**: Vercel Analytics + Sentry for error tracking
- **Performance**: Lighthouse CI for performance monitoring

---

## Component Structure

### Directory Structure

```
app/(main)/store-operations/wastage-reporting/
├── page.tsx                                    # Main wastage list page (Server Component)
├── record/
│   └── page.tsx                                # Record new wastage page
├── [id]/
│   ├── page.tsx                                # Wastage detail page
│   └── edit/
│       └── page.tsx                            # Edit wastage page
├── approvals/
│   ├── page.tsx                                # Approval queue page
│   └── [id]/
│       └── page.tsx                            # Approval detail page
├── analytics/
│   └── page.tsx                                # Analytics dashboard page
├── components/
│   ├── WastageList.tsx                         # Wastage table component
│   ├── WastageDetail.tsx                       # Detail display component
│   ├── WastageForm.tsx                         # Create/edit form component
│   ├── PhotoUpload.tsx                         # Photo upload widget
│   ├── PhotoGallery.tsx                        # Photo viewer component
│   ├── ApprovalButtons.tsx                     # Approval action buttons
│   ├── ApprovalHistory.tsx                     # Approval timeline display
│   ├── WastageFilters.tsx                      # Filter panel component
│   ├── WastageSummaryCard.tsx                  # KPI summary cards
│   ├── TrendChart.tsx                          # Chart visualization component
│   ├── CategoryPieChart.tsx                    # Category breakdown chart
│   ├── TopWastedProductsTable.tsx              # Top products table
│   ├── AnomalyAlerts.tsx                       # Anomaly detection alerts
│   ├── ExportDialog.tsx                        # Export configuration dialog
│   └── BatchWastageForm.tsx                    # Batch recording form
├── types.ts                                    # TypeScript type definitions
├── actions.ts                                  # Server Actions for CRUD operations
├── validations.ts                              # Zod validation schemas
├── hooks/
│   ├── useWastage.ts                           # React Query hooks for wastage data
│   ├── usePhotos.ts                            # Photo management hooks
│   ├── useApprovals.ts                         # Approval workflow hooks
│   ├── useWastageAnalytics.ts                  # Analytics data hooks
│   └── useWastageStore.ts                      # Zustand store hooks
└── lib/
    ├── calculations.ts                         # Wastage calculation utilities
    ├── approvalRouter.ts                       # Approval routing logic
    ├── photoProcessor.ts                       # Photo compression and watermarking
    ├── exportUtils.ts                          # Excel/PDF export utilities
    └── anomalyDetector.ts                      # Anomaly detection algorithms

lib/repositories/                               # Shared repository layer
├── wastage.repository.ts                       # Wastage data access
├── photo.repository.ts                         # Photo storage operations
├── approval.repository.ts                      # Approval workflow data
└── audit.repository.ts                         # Audit trail logging

lib/integrations/                               # External integrations
├── inventory.integration.ts                    # Inventory Management API
├── finance.integration.ts                      # Finance Module API
├── workflow.integration.ts                     # Workflow Engine API
└── notification.integration.ts                 # Email and notification service
```

### Key Components

#### Page Components (Server Components)

**File**: `page.tsx` (Wastage List Page)
**Purpose**: Display paginated list of wastage transactions with filtering, sorting, and search capabilities
**Responsibilities**:
- Fetch initial wastage data server-side using Server Actions
- Render wastage table with server-side pagination
- Handle URL query parameters for filters and sorting
- Provide navigation to detail, record, and approval pages
- Display summary statistics (total wastage, transaction count)
**Data Loading**: Server-side data fetching with searchParams for filters
**SEO**: Meta tags for page title and description

**File**: `record/page.tsx` (Record Wastage Page)
**Purpose**: Form interface for creating new wastage transactions
**Responsibilities**:
- Render wastage recording form with product search
- Handle form submission via Server Action
- Integrate photo upload component
- Provide real-time validation feedback
- Save draft functionality for incomplete entries
**Data Loading**: Load product list and wastage categories server-side
**Form Handling**: React Hook Form with Zod validation

**File**: `[id]/page.tsx` (Wastage Detail Page)
**Purpose**: Display complete details of single wastage transaction
**Responsibilities**:
- Fetch wastage transaction by ID server-side
- Display all transaction details (product, quantity, photos, reason)
- Show approval history with timeline visualization
- Provide action buttons (edit, delete, approve) based on permissions
- Display linked inventory adjustment and GL posting
**Data Loading**: Server-side fetch with parallel queries for related data
**Authorization**: Check user permission to view this wastage

**File**: `approvals/page.tsx` (Approval Queue Page)
**Purpose**: List of pending wastage transactions requiring user's approval
**Responsibilities**:
- Fetch pending approvals assigned to current user
- Display approval queue sorted by urgency (age, value)
- Provide quick approve/reject actions
- Filter by date range, value range, category
- Show approval statistics (pending count, overdue count)
**Data Loading**: Server-side filtering by approver ID and status
**Real-time Updates**: Polling or SSE for new approvals

#### Form Components (Client Components)

**File**: `components/WastageForm.tsx`
**Purpose**: Interactive form for creating or editing wastage transactions
**Responsibilities**:
- Render all wastage fields with proper validation
- Handle product search with autocomplete
- Integrate photo upload component
- Calculate total value based on quantity and unit cost
- Display real-time validation errors
- Support save as draft functionality
- Handle form submission with optimistic updates
**Props**:
- initialData (optional, for edit mode)
- onSubmit: function to handle form submission
- onCancel: function to handle cancellation
**State Management**: React Hook Form for form state, useWastageStore for UI state (selected product)
**Validation**: Zod schema validation on client and server

**File**: `components/PhotoUpload.tsx`
**Purpose**: Photo capture and upload widget with drag-and-drop support
**Responsibilities**:
- Integrate device camera for direct photo capture
- Support drag-and-drop file upload
- Display photo thumbnails with preview
- Compress photos client-side before upload
- Handle multiple photo uploads (up to 5 photos)
- Show upload progress indicators
- Allow photo deletion before submission
- Display validation errors (file size, file type, minimum photos required)
**Props**:
- photos: array of existing photos
- maxPhotos: maximum number of photos (default 5)
- required: boolean indicating if photo is mandatory
- onPhotosChange: callback when photos are added/removed
**State Management**: Local state for photos array, upload progress
**Libraries**: react-dropzone for drag-and-drop, browser-image-compression for compression

**File**: `components/ApprovalButtons.tsx`
**Purpose**: Action buttons for approvers to approve, partially approve, or reject wastage
**Responsibilities**:
- Display approve, partially approve, reject buttons
- Open confirmation dialogs for each action
- Handle approval submission with comments
- Show loading state during submission
- Display success/error feedback
- Disable buttons if user lacks permission
**Props**:
- wastageId: ID of wastage transaction
- currentStatus: current approval status
- wastageValue: transaction value (for permission check)
- onApprovalComplete: callback after approval action
**State Management**: Local state for dialog visibility, loading state
**Authorization**: Check user has "Wastage Approver" permission and value threshold authority

#### List and Table Components (Client Components)

**File**: `components/WastageList.tsx`
**Purpose**: Data table displaying wastage transactions with sorting and filtering
**Responsibilities**:
- Render table with columns: Number, Date, Product, Quantity, Value, Category, Status, Submitted By
- Support column sorting (click header to sort)
- Display row actions (view, edit, delete) based on permissions
- Handle row selection for bulk operations
- Show pagination controls
- Display loading skeleton during data fetch
- Handle empty state when no data
**Props**:
- wastageTransactions: array of wastage data
- totalCount: total number of records (for pagination)
- currentPage: current page number
- pageSize: number of records per page
- sortField: current sort column
- sortDirection: asc or desc
- onSortChange: callback when sort changes
- onPageChange: callback when page changes
- onRowClick: callback when row is clicked
**State Management**: useWastageStore for filters and sort state
**Virtualization**: For large datasets (>1000 rows), use react-window for virtualized rendering

#### Analytics Components (Client Components)

**File**: `components/TrendChart.tsx`
**Purpose**: Line chart visualization showing wastage trends over time
**Responsibilities**:
- Render time series chart of wastage value
- Display multiple series (categories, products, locations)
- Support date range selection
- Show data point tooltips on hover
- Allow chart type toggle (line, bar, area)
- Export chart as image (PNG)
**Props**:
- data: time series data array
- dateRange: start and end dates
- series: array of series to display
- chartType: line, bar, or area
**Libraries**: Chart.js with react-chartjs-2 wrapper
**State Management**: Local state for chart options

**File**: `components/CategoryPieChart.tsx`
**Purpose**: Pie chart showing wastage breakdown by category
**Responsibilities**:
- Render pie/donut chart of category distribution
- Display percentage and value for each slice
- Support click to drill-down to category details
- Show legend with color coding
- Animate on data update
**Props**:
- categoryData: array of category totals
- onCategoryClick: callback when slice is clicked
**Libraries**: Chart.js with react-chartjs-2

---

## Sitemap

### Overview
This section maps all pages, tabs, and dialogs in the Wastage Reporting sub-module, showing the complete navigation structure and user interface hierarchy.

### Page Hierarchy

```mermaid
graph TD
    A["Wastage Reporting Module"] --> B["List Page"]
    A --> C["Record Wastage Page"]
    A --> D["Detail Page"]
    A --> E["Approval Queue Page"]
    A --> F["Analytics Dashboard"]

    B --> B1["Tab: All Wastage"]
    B --> B2["Tab: Pending Approval"]
    B --> B3["Tab: Approved"]
    B --> B4["Tab: Rejected"]

    D --> D1["Tab: Overview"]
    D --> D2["Tab: Photos"]
    D --> D3["Tab: Approval History"]
    D --> D4["Tab: Related Transactions"]

    E --> E1["Tab: Pending My Approval"]
    E --> E2["Tab: Approved by Me"]
    E --> E3["Tab: All Approvals"]

    F --> F1["Tab: Trends"]
    F --> F2["Tab: By Category"]
    F --> F3["Tab: By Product"]
    F --> F4["Tab: Anomalies"]

    B --> BD1["Dialog: Export"]
    B --> BD2["Dialog: Filters"]
    B --> BD3["Dialog: Batch Record"]

    C --> CD1["Dialog: Photo Capture"]
    C --> CD2["Dialog: Cancel Confirm"]

    D --> DD1["Dialog: Delete Confirm"]
    D --> DD2["Dialog: Edit"]

    E --> ED1["Dialog: Approve Confirm"]
    E --> ED2["Dialog: Reject Confirm"]
    E --> ED3["Dialog: Partial Approval"]
```

### Pages

#### 1. List Page
**Route**: `/app/(main)/store-operations/wastage-reporting`
**File**: `page.tsx`
**Purpose**: Display paginated list of all wastage transactions with comprehensive filtering and sorting

**Sections**:
- **Header**: Page title "Wastage Reporting", breadcrumbs, primary action buttons (Record Wastage, Batch Record, Export)
- **Summary Cards**: KPI cards showing Total Wastage Value (current period), Transaction Count, Wastage as % of COGS, Top Category
- **Filters Bar**: Quick filters for date range (Today, This Week, This Month, Custom), status (All, Pending, Approved, Rejected), category dropdown
- **Search Bar**: Global search by wastage number, product name, submitter name
- **Data Table**: Sortable columns with wastage transactions, row actions (view, edit, delete), pagination controls
- **Pagination**: Page size selector (25, 50, 100), page navigation (Previous, 1, 2, 3..., Next), total count display

**Tabs**:
- **All Wastage**: Shows all wastage transactions regardless of status (default view)
- **Pending Approval**: Filtered view showing only transactions awaiting approval
- **Approved**: Transactions that have been approved and inventory adjusted
- **Rejected**: Transactions that were rejected with rejection reasons visible

**Dialogs Accessible From This Page**:
- **Export Dialog**: Configure export format (Excel, PDF, CSV), select columns, apply filters, download file
- **Advanced Filters Dialog**: Comprehensive filtering by date range, value range (min/max), categories (multi-select), products (autocomplete), submitted by (user selector), responsible party
- **Batch Record Dialog**: Record multiple wastage items in single transaction, add line items, attach photos, submit all at once

**Navigation Targets**:
- Click row → Navigate to Detail Page (`/wastage-reporting/[id]`)
- "Record Wastage" button → Navigate to Record Page (`/wastage-reporting/record`)
- Edit action → Navigate to Edit Page (`/wastage-reporting/[id]/edit`)
- "View Approvals" link → Navigate to Approval Queue Page (`/wastage-reporting/approvals`)

**Data Loading**: Server-side pagination with searchParams for filters, sort, and page

---

#### 2. Record Wastage Page
**Route**: `/app/(main)/store-operations/wastage-reporting/record`
**File**: `record/page.tsx`
**Purpose**: Form interface for creating new wastage transaction with photo evidence

**Sections**:
- **Header**: "Record Wastage" title, breadcrumbs (Home > Store Operations > Wastage Reporting > Record)
- **Form Card**: Main form container with sections
  - Product Selection: Search autocomplete with product code, name, current stock display
  - Quantity Entry: Numeric input with unit of measure selector
  - Value Calculation: Auto-calculated display (quantity × unit cost)
  - Category Selection: Dropdown with wastage categories, sub-category field (conditional)
  - Reason: Text area (min 20 characters) for detailed explanation
  - Responsible Party: Optional user selector
  - Photo Upload: PhotoUpload component (required if value >$100)
- **Actions Footer**: "Save as Draft" (secondary button), "Cancel" (tertiary button), "Submit for Approval" (primary button)

**Form Sections**:
- **Product Details**: Product search, quantity, UOM, value calculation
- **Wastage Information**: Category, sub-category, reason, responsible party
- **Documentation**: Photo upload area with camera integration
- **Additional Notes**: Optional free-text notes field

**Dialogs Accessible From This Page**:
- **Photo Capture Dialog**: Mobile camera interface for direct photo capture, preview before accepting
- **Cancel Confirmation**: "Unsaved changes will be lost. Are you sure?" with "Save as Draft" option
- **Product Search Dialog**: Advanced product search with filters (category, location, active status)

**Navigation Targets**:
- Cancel → Navigate back to List Page
- Submit → Navigate to Detail Page of created wastage with success toast
- Save as Draft → Stay on page with success toast, form remains populated

**Validation**: Real-time client-side validation with Zod, server-side validation on submission

---

#### 3. Detail Page
**Route**: `/app/(main)/store-operations/wastage-reporting/[id]`
**File**: `[id]/page.tsx`
**Purpose**: Comprehensive view of single wastage transaction with all details and related information

**Sections**:
- **Header**: Wastage number (WST-2025-0112-0023), status badge (Pending/Approved/Rejected), action menu dropdown (Edit, Delete, Approve, Print)
- **Summary Card**: Key information at-a-glance
  - Product name and code
  - Quantity and value
  - Category and sub-category
  - Submitted by and date
  - Current status
- **Tabbed Content Area**: Organized detail sections (see tabs below)
- **Action Buttons**: Contextual actions based on status and user permissions
  - If pending and user is approver: Approve, Partially Approve, Reject buttons
  - If draft and user is submitter: Edit, Delete, Submit buttons
  - If approved: View Inventory Adjustment, View GL Posting links

**Tabs**:
- **Overview**:
  - Product details (name, code, current stock)
  - Wastage information (quantity, value, category, reason)
  - Submitter information (name, role, department, location)
  - Responsible party (if assigned)
  - Dates (recorded date, required by date)
- **Photos**:
  - Photo gallery with thumbnails
  - Click to view full-resolution photo in lightbox
  - Photo captions and metadata (capture date, device, user)
  - Watermark visible: "2025-01-12 14:23 | Restaurant A | Chef Daniel"
- **Approval History**:
  - Timeline visualization of approval workflow
  - Each approval level with approver name, date/time, action (approved/rejected/pending)
  - Approval comments visible
  - Current approval status highlighted
- **Related Transactions**:
  - Inventory adjustment link (if approved)
  - GL journal entry link (if posted)
  - Related wastage (same product, same day, same responsible party)
  - Supplier quality complaint (if flagged)

**Dialogs Accessible From This Page**:
- **Delete Confirmation**: "Permanently delete this wastage transaction? This cannot be undone." with reason field required
- **Approve Confirmation**: "Approve wastage WST-2025-0112-0023 ($31.25)? Inventory will be adjusted immediately." with optional approval comments
- **Reject Confirmation**: "Reject wastage WST-2025-0112-0023? Submitter will be notified." with mandatory rejection reason (min 30 characters)
- **Partial Approval Dialog**: Adjust approved quantity, enter reduction reason, calculate approved value
- **Print Preview**: Formatted print view with company logo, transaction details, photos

**Navigation Targets**:
- "Edit" button → Navigate to Edit Page (`/wastage-reporting/[id]/edit`)
- "Back to List" → Navigate to List Page
- Inventory Adjustment link → Navigate to Inventory Management module
- GL Posting link → Navigate to Finance module

---

#### 4. Approval Queue Page
**Route**: `/app/(main)/store-operations/wastage-reporting/approvals`
**File**: `approvals/page.tsx`
**Purpose**: List of wastage transactions pending approval by current user

**Sections**:
- **Header**: "Approval Queue" title, summary statistics (Pending Count, Overdue Count, Approved Today)
- **Filters**: Date range, value range, category, location, urgent only toggle
- **Approval Table**: Columns - Wastage Number, Date, Product, Quantity, Value, Category, Submitted By, Days Pending, Actions
- **Urgent Items**: Highlighted rows for approvals >24 hours old (yellow background)
- **Bulk Actions**: Select multiple rows, bulk approve/reject (if value thresholds allow)

**Tabs**:
- **Pending My Approval**: Wastage transactions assigned to current user awaiting action
- **Approved by Me**: Historical view of wastage approved by current user (last 90 days)
- **All Approvals**: If user has "View All Approvals" permission, shows all pending approvals across organization

**Dialogs Accessible From This Page**:
- **Approve Confirmation**: Same as Detail Page approve dialog
- **Reject Confirmation**: Same as Detail Page reject dialog
- **Partial Approval**: Same as Detail Page partial approval dialog
- **Bulk Approve**: Confirm bulk approval with count, total value, collective approval comment

**Navigation Targets**:
- Click row → Navigate to Approval Detail (Detail Page in approval mode with approval buttons prominent)
- "View All Wastage" link → Navigate to List Page

**Real-time Updates**: Polling every 30 seconds or Server-Sent Events (SSE) for real-time approval queue updates

---

#### 5. Analytics Dashboard Page
**Route**: `/app/(main)/store-operations/wastage-reporting/analytics`
**File**: `analytics/page.tsx`
**Purpose**: Comprehensive wastage analytics with visualizations, trends, and actionable insights

**Sections**:
- **Header**: "Wastage Analytics" title, date range selector (Last 30 Days, Last 90 Days, This Year, Custom Range), export report button
- **KPI Cards Row**: Total Wastage Value, Wastage as % of COGS, Transaction Count, Average per Transaction, Wastage Reduction vs Prior Period (with trend indicator)
- **Trend Chart**: Line chart showing daily wastage over selected period with annotations for spikes
- **Category Breakdown**: Pie chart showing wastage distribution by category (Preparation Error, Spoilage, Overproduction, etc.)
- **Top Wasted Products**: Table listing top 10 products by wastage value and quantity
- **Anomaly Alerts**: Alert cards highlighting unusual patterns (e.g., "Beef Ribeye wastage 3.2× above average", "Spoilage rate trending upward")
- **Wastage by Day of Week**: Bar chart showing wastage patterns by day (Sunday highest due to buffet)
- **Wastage by Time of Day**: Heat map showing wastage by hour (peaks at end of lunch and dinner service)

**Tabs**:
- **Trends**: Time-based analysis with trend lines, moving averages, YoY comparison
- **By Category**: Detailed breakdown by category with drill-down to products
- **By Product**: Product-level analysis with drill-down to individual transactions
- **Anomalies**: Anomaly detection with statistical analysis, alerts, recommended actions

**Dialogs Accessible From This Page**:
- **Date Range Picker**: Calendar interface for custom date range selection
- **Export Report**: Generate PDF/Excel report with all charts, tables, and insights
- **Drill-Down Details**: Modal showing detailed transaction list for clicked chart element (e.g., click "Preparation Error" slice to see all preparation error wastage)
- **Anomaly Details**: Detailed analysis of detected anomaly with historical context, potential causes, recommended actions

**Navigation Targets**:
- Click chart element (bar, slice, data point) → Open drill-down dialog showing underlying transactions
- Click product in Top 10 table → Navigate to filtered List Page showing wastage for that product
- "View All Wastage" → Navigate to List Page

**Data Refresh**: Manual refresh button, automatic refresh every 5 minutes (configurable)

---

### Dialogs

#### Modal Dialogs (Full Overlay)

**Approve Confirmation Dialog**
- **Trigger**: "Approve" button on Detail Page or Approval Queue
- **Purpose**: Confirm wastage approval with optional comments
- **Content**:
  - Wastage summary (product, quantity, value, category, reason)
  - Photos preview (thumbnails)
  - Approval comments text area (optional)
  - Warning: "Inventory will be adjusted immediately. This action cannot be undone."
- **Actions**: "Confirm Approval" (primary, green), "Cancel" (secondary)
- **Behavior**: Submits approval via Server Action, shows loading spinner, navigates back to queue with success toast on completion

**Reject Confirmation Dialog**
- **Trigger**: "Reject" button on Detail Page or Approval Queue
- **Purpose**: Reject wastage with mandatory reason
- **Content**:
  - Wastage summary (product, quantity, value, submitter)
  - Rejection reason text area (mandatory, min 30 characters)
  - Warning: "Submitter will be notified. Inventory will not be adjusted."
- **Actions**: "Confirm Rejection" (destructive, red), "Cancel" (secondary)
- **Behavior**: Submits rejection via Server Action, notifies submitter, navigates back to queue with success toast

**Partial Approval Dialog**
- **Trigger**: "Partially Approve" button on Detail Page
- **Purpose**: Approve reduced quantity with reason
- **Content**:
  - Original quantity and value display
  - Approved quantity input (number field with validation: must be < original quantity and > 0)
  - Auto-calculated approved value display
  - Reduction reason text area (mandatory, min 20 characters)
  - Warning: "Remaining quantity will be returned to submitter for review."
- **Actions**: "Confirm Partial Approval" (primary), "Cancel" (secondary)
- **Behavior**: Creates approval for reduced quantity, creates new draft wastage for remaining quantity, notifies submitter

**Export Dialog**
- **Trigger**: "Export" button on List Page or Analytics Page
- **Purpose**: Configure data export parameters
- **Content**:
  - Format selector (radio buttons): Excel (.xlsx), PDF, CSV
  - Column selection (checkboxes): Select which columns to export
  - Filter application toggle: "Apply current filters to export"
  - Date range selector (if not already filtered)
  - Preview: Shows row count and estimated file size
- **Actions**: "Download" (primary), "Cancel" (secondary)
- **Behavior**: Generates export file server-side, triggers browser download, shows progress spinner during generation

**Photo Capture Dialog** (Mobile Only)
- **Trigger**: "Take Photo" button in PhotoUpload component
- **Purpose**: Capture photo using device camera
- **Content**:
  - Full-screen camera viewfinder
  - Capture button (circular, center bottom)
  - Flash toggle (top right)
  - Switch camera toggle (front/back, top left)
- **Actions**: Capture photo, Cancel (X button top left)
- **Behavior**: Captures photo, shows preview with "Use Photo" or "Retake" options, compresses and adds to upload queue

**Delete Confirmation Dialog**
- **Trigger**: "Delete" action on List Page or Detail Page
- **Purpose**: Confirm wastage deletion with impact warning
- **Content**:
  - Warning message: "Permanently delete wastage WST-2025-0112-0023?"
  - Impact summary: "This action cannot be undone. Audit trail will be retained."
  - Delete reason text area (optional)
  - Checkbox: "I understand this transaction will be permanently deleted"
- **Actions**: "Delete" (destructive, red), "Cancel" (secondary)
- **Behavior**: Soft deletes wastage (sets deleted_at timestamp), retains for audit, navigates to List Page with success toast

---

## Data Flow

### Read Operations (Query Flow)

```
1. User Action
   User clicks "View Wastage" or navigates to page
   ↓
2. React Component (Server Component or Client Component)
   Server Component: Directly calls Server Action during render
   Client Component: Uses React Query hook (useWastageQuery)
   ↓
3. React Query (Client Component Only)
   Check cache for data
   If cache hit → return cached data
   If cache miss or stale → proceed to fetch
   ↓
4. API Client Function / Server Action
   Constructs request parameters (filters, pagination, sort)
   Adds authentication token from session
   ↓
5. Server Action Handler
   Validates user authentication (session check)
   Validates user authorization (permission check)
   Parses and validates request parameters
   ↓
6. Business Logic Layer
   Applies business rules (e.g., filter by user's accessible locations)
   Enriches query with additional context
   ↓
7. Data Access Layer (Repository Pattern)
   Constructs optimized Prisma query
   Applies filters, sorting, pagination
   Includes related data (JOIN operations)
   ↓
8. Database Query Execution
   PostgreSQL executes query with indexes
   Row-Level Security (RLS) policies applied automatically
   Returns result set
   ↓
9. Data Transformation
   Map database records to TypeScript types
   Calculate derived fields (e.g., days since submission)
   Format dates, currencies for display
   ↓
10. Response Construction
    Success: { success: true, data: transformedData, totalCount: count }
    Error: { success: false, error: { message, code, details } }
    ↓
11. React Query Cache Update (Client Component)
    Store response in cache with query key
    Set stale time and cache time
    Trigger automatic background refetch if stale
    ↓
12. Component Update
    Component re-renders with new data
    Display data in UI
    Update loading state to complete
```

### Write Operations (Mutation Flow)

```
1. User Action
   User submits form (Record Wastage, Approve, Reject)
   ↓
2. Client-Side Validation
   React Hook Form validates form data against Zod schema
   Display inline validation errors if validation fails
   Prevent submission if invalid
   ↓
3. Optimistic Update (Optional, for better UX)
   React Query optimistically updates cache with expected result
   UI updates immediately to show expected state
   If server action fails, rollback optimistic update
   ↓
4. Server Action Call
   Call appropriate Server Action (createWastage, approveWastage, etc.)
   Pass validated form data as parameter
   Show loading spinner/state in UI
   ↓
5. Authentication & Authorization Check
   Verify user is authenticated (session valid)
   Check user has required permission (e.g., "Record Wastage", "Approve Wastage")
   Verify user has access to relevant location
   Return 401/403 error if checks fail
   ↓
6. Server-Side Validation
   Re-validate input data with Zod schema (never trust client)
   Apply business rule validations (e.g., quantity <= stock, value thresholds)
   Return validation errors if validation fails
   ↓
7. Business Logic Execution
   Calculate derived values (total value, approval level required)
   Determine workflow routing (which approver to assign)
   Check for anomalies or fraud patterns
   Generate auto-generated fields (wastage number, timestamps)
   ↓
8. Database Transaction Begin
   Start PostgreSQL transaction for atomicity
   Use transaction isolation level (READ COMMITTED)
   ↓
9. Primary Data Write
   Insert wastage_headers record with status "pending_approval"
   Insert wastage_line_items records
   Insert wastage_photos metadata records
   ↓
10. Related Data Operations
    If approval: Create wastage_approvals record
    If approval: Update wastage status to "approved"
    If approval: Call Inventory Integration to adjust stock
    If approval: Queue GL posting to Finance Integration
    ↓
11. Audit Trail Logging
    Insert audit_trail record with action type, user, timestamp
    Capture before/after values for updates
    Log IP address and session information
    ↓
12. Database Transaction Commit
    If all operations successful: COMMIT transaction
    If any operation fails: ROLLBACK transaction automatically
    ↓
13. Integration Operations (After Commit)
    Send approval notification email (async, non-blocking)
    Trigger workflow engine state update
    Publish event to message queue for analytics
    Upload photos to Supabase Storage
    ↓
14. Response Construction
    Success: { success: true, data: createdWastage, message: "Wastage submitted successfully" }
    Error: { success: false, error: { message: "Validation failed", code: "VALIDATION_ERROR", details: validationErrors } }
    ↓
15. Client-Side Response Handling
    If success:
      - React Query invalidates relevant caches
      - Show success toast notification
      - Navigate to detail page or refresh list
      - Clear form if creating new wastage
    If error:
      - Rollback optimistic update
      - Display error toast or inline errors
      - Keep user on form to correct errors
      - Log error for debugging
```

---

## Server Actions

### Overview
All server-side operations are implemented as Next.js Server Actions located in `actions.ts`. Server Actions provide type-safe, serverless API endpoints integrated directly with React components without separate API routes. Each Server Action performs authentication, authorization, validation, business logic execution, and database operations within a single function.

### Create Operations

**createWastage**
- **Purpose**: Create new wastage transaction with optional photo uploads
- **Input Parameters**:
  - wastageData: Object containing product_id, quantity, category, reason, responsible_party_id (optional), photos (optional array of photo blobs)
- **Validation**:
  - Zod schema validation for all required fields
  - Check product exists and is active
  - Verify quantity does not exceed current stock
  - Validate reason length (min 20 characters)
  - Check photos required if value >$100
- **Business Logic**:
  - Calculate total value (quantity × unit cost)
  - Determine approval level required based on value thresholds
  - Route to appropriate approver using ApprovalRouter
  - Generate unique wastage number (format: WST-YYYY-MMDD-NNNN)
- **Database Operations**:
  - Insert wastage_headers record with status "pending_approval"
  - Insert wastage_line_items if multiple products (batch)
  - Upload photos to Supabase Storage and insert wastage_photos metadata
  - Create initial wastage_approvals record with approver assignment
- **Integration**:
  - Send notification to assigned approver (email + in-app)
  - Log audit trail entry
- **Returns**:
  - Success: Created wastage object with ID and wastage_number
  - Error: Validation errors or database constraint violations
- **Authorization**: User must have "Record Wastage" permission and access to location

**createBatchWastage**
- **Purpose**: Create batch wastage transaction with multiple line items
- **Input**: Array of wastage line items with shared header data (location, date, reason)
- **Validation**: Validate each line item individually, check total value threshold
- **Business Logic**: Calculate aggregate value, determine approval level for total
- **Returns**: Created batch wastage with all line items

### Read Operations

**getWastageById**
- **Purpose**: Fetch single wastage transaction by UUID with all related data
- **Input**: wastageId (UUID string)
- **Authorization**: Check user has permission to view wastage at this location
- **Database Query**:
  - Fetch wastage_headers record with Prisma include for:
    - line_items (product details)
    - photos (with signed URLs for secure access)
    - approvals (approval history with approver names)
    - created_by_user and updated_by_user (user details)
    - location and department (organizational context)
  - Use Prisma relations for efficient JOIN query
- **Data Transformation**:
  - Generate signed URLs for photos (expire after 1 hour)
  - Format dates using date-fns
  - Calculate derived fields (days since submission, approval percentage)
- **Returns**:
  - Success: Complete wastage object with nested relations
  - Error: null if not found or user lacks permission

**listWastage**
- **Purpose**: Fetch paginated, filtered list of wastage transactions
- **Input Parameters**:
  - filters: Object with optional date_range, status, category, product_id, submitted_by, location_id
  - pagination: Object with page (number), pageSize (number, default 25)
  - sort: Object with field (string) and direction ("asc" | "desc")
- **Authorization**: Apply Row-Level Security - filter by user's accessible locations
- **Database Query**:
  - Build Prisma where clause from filters
  - Apply sorting and pagination (skip/take)
  - Execute parallel queries for data and total count
  - Include minimal relations (product name, submitter name, location)
- **Performance Optimization**:
  - Use database indexes on commonly filtered/sorted fields
  - Limit included relations to avoid N+1 queries
  - Consider cursor-based pagination for very large datasets
- **Returns**:
  - Success: { data: wastageArray, totalCount: number, page: number, pageSize: number, totalPages: number }
  - Error: Empty array if query fails

**getWastageStatistics**
- **Purpose**: Calculate aggregate statistics for analytics dashboard
- **Input**: dateRange (start_date, end_date), optional location_id
- **Authorization**: Filter by user's accessible locations
- **Calculations**:
  - Total wastage value (SUM of all wastage in period)
  - Transaction count
  - Average per transaction
  - Wastage as % of COGS (requires COGS data from Finance Module)
  - Breakdown by category (GROUP BY category, SUM value)
  - Top 10 wasted products (GROUP BY product, SUM value, ORDER BY value DESC, LIMIT 10)
  - Trend data (GROUP BY date, SUM value)
- **Database Query**: Aggregate queries with GROUP BY and SUM/AVG/COUNT
- **Returns**: Statistics object with all calculated metrics

**searchWastage**
- **Purpose**: Full-text search across wastage transactions
- **Input**: searchTerm (string), optional filters
- **Search Fields**: wastage_number, product_name, product_code, reason, submitter_name
- **Database Query**: Use Prisma's contains/startsWith or PostgreSQL full-text search (to_tsvector/to_tsquery)
- **Returns**: Array of matching wastage transactions with highlighting

### Update Operations

**updateWastage**
- **Purpose**: Update existing wastage transaction (only if in draft or pending status)
- **Input**: wastageId (UUID), updatedData (partial wastage object)
- **Authorization**:
  - Check user is the original submitter OR has "Edit All Wastage" permission
  - Check wastage is in editable status (draft or pending_approval, not approved/rejected)
- **Validation**:
  - Validate only changed fields
  - Re-calculate total value if quantity changed
  - Re-determine approval level if value changed
- **Concurrency Control**:
  - Use doc_version field for optimistic locking
  - Check version matches before update
  - Return conflict error if version mismatch (another user modified concurrently)
- **Database Operation**: Update wastage_headers and related tables in transaction
- **Audit Trail**: Log update action with before/after values
- **Returns**: Updated wastage object or conflict error

**approveWastage**
- **Purpose**: Approve wastage transaction, adjust inventory, post to GL
- **Input**: wastageId (UUID), approvalData (optional comments)
- **Authorization**:
  - Check user has "Wastage Approver" permission
  - Check user has authority for this value level (based on thresholds)
  - Prevent user from approving own wastage (BR-WAST-008)
- **Business Logic**:
  - Validate wastage is in "pending_approval" status
  - Check if multi-level approval required
  - If first level of multi-level: update status to "partially_approved", route to next approver
  - If final approval level: update status to "approved", trigger inventory adjustment
- **Database Transaction**:
  - Update wastage_headers.doc_status to "approved"
  - Update wastage_approvals record with approval details
  - Call InventoryIntegration.adjustStock() within transaction
  - Queue FinanceIntegration.postToGL() for async execution
- **Integration**:
  - Inventory adjustment (synchronous, within transaction for atomicity)
  - GL posting (async queue, fire-and-forget)
  - Notification to submitter (async)
- **Returns**: Success with approved wastage, or error if validation fails

**rejectWastage**
- **Purpose**: Reject wastage transaction with reason
- **Input**: wastageId (UUID), rejectionReason (string, min 30 characters)
- **Authorization**: Same as approveWastage
- **Validation**:
  - Check rejection reason meets minimum length
  - Validate wastage is in pending status
- **Database Operation**:
  - Update wastage_headers.doc_status to "rejected"
  - Update wastage_approvals with rejection action and reason
  - Do NOT adjust inventory
- **Notification**: Send detailed rejection reason to submitter
- **Returns**: Success confirmation

**partialApproveWastage**
- **Purpose**: Approve reduced quantity, return remainder to submitter
- **Input**: wastageId, approvedQuantity (must be < original quantity), reductionReason
- **Business Logic**:
  - Calculate approved value and rejected value
  - Create inventory adjustment for approved quantity only
  - Create new draft wastage for rejected quantity for submitter to review
- **Database Transaction**:
  - Update original wastage with approved_quantity, status "partially_approved"
  - Create inventory adjustment for approved portion
  - Create new wastage_headers with rejected portion in "draft" status
- **Returns**: Success with both wastage IDs (original and new draft)

### Delete Operations

**deleteWastage**
- **Purpose**: Soft delete wastage transaction
- **Input**: wastageId (UUID)
- **Authorization**:
  - Check user is original submitter OR has "Delete All Wastage" permission
  - Check wastage is in deletable status (draft or rejected only, not approved)
- **Validation**:
  - Prevent deletion of approved wastage (inventory already adjusted)
  - Warn if wastage has approval history
- **Database Operation**:
  - Set deleted_at timestamp (soft delete, retain for audit)
  - Do NOT physically delete record or photos
- **Audit Trail**: Log deletion action with user and reason
- **Returns**: Success confirmation

### Photo Operations

**uploadPhoto**
- **Purpose**: Upload photo to Supabase Storage, create photo metadata record
- **Input**: photoFile (File/Blob), wastageId (UUID), caption (optional)
- **Validation**:
  - Check file type (JPG, PNG, HEIC only)
  - Check file size (<10MB)
  - Scan for malware (if malware scanner integrated)
- **Processing**:
  - Compress photo client-side before upload (target ~500KB)
  - Generate unique filename: `wastage_${wastageId}_${timestamp}_${uuid}.jpg`
  - Add watermark with date, time, location, user (server-side using Sharp)
  - Upload to Supabase Storage bucket: `wastage-photos`
- **Database Operation**: Insert wastage_photos metadata with file path, size, mime type
- **Returns**: Photo object with ID and signed URL

**deletePhoto**
- **Purpose**: Remove photo from wastage transaction
- **Input**: photoId (UUID)
- **Authorization**: Check user can edit the associated wastage
- **Validation**: Check wastage is not yet approved
- **Database Operation**:
  - Set deleted_at on wastage_photos record (soft delete)
  - Optionally delete physical file from Supabase Storage (or retain for audit)
- **Returns**: Success confirmation

**getPhotoSignedUrl**
- **Purpose**: Generate time-limited signed URL for secure photo access
- **Input**: photoId (UUID)
- **Authorization**: Check user can view the associated wastage
- **Supabase Storage**: Generate signed URL with 1-hour expiration
- **Returns**: Signed URL string

### Export Operations

**exportWastageToExcel**
- **Purpose**: Generate Excel export of wastage data
- **Input**: filters (same as listWastage), columnSelection (array of column names)
- **Authorization**: Check user has export permission
- **Process**:
  - Fetch wastage data with filters (no pagination limit)
  - Transform data to Excel-friendly format
  - Use ExcelJS library to create workbook
  - Add sheets: Summary, Transactions, By Category, By Product
  - Format cells (currency, dates, percentages)
  - Generate buffer
- **Returns**: Excel file buffer for download

**exportWastageToPDF**
- **Purpose**: Generate PDF report with charts and tables
- **Input**: dateRange, optional location_id
- **Process**:
  - Generate statistics and chart data
  - Use jsPDF to create PDF document
  - Add header with company logo, report title, date range
  - Render charts as images (Chart.js to canvas to image)
  - Add tables with formatted data
  - Generate buffer
- **Returns**: PDF file buffer for download

---

## Database Schema Overview

**NOTE**: Detailed database schema with complete table definitions, indexes, constraints, and relationships is documented in the [Data Schema (DS-wastage-reporting.md)](./DS-wastage-reporting.md) document. This section provides a high-level overview for architectural context.

### Core Tables

**wastage_headers**
- **Purpose**: Main wastage transaction records with header-level information
- **Key Fields**:
  - id (UUID, primary key)
  - wastage_number (unique, auto-generated: WST-YYYY-MMDD-NNNN)
  - location_id, department_id (foreign keys for organizational context)
  - wastage_category, subcategory (classification)
  - total_value, currency (financial fields)
  - doc_status (pending_approval, approved, partially_approved, rejected, cancelled, draft)
  - is_supplier_quality_issue, supplier_id (quality tracking)
  - created_by, created_date, updated_by, updated_date (audit fields)
  - deleted_at (soft delete timestamp)
- **Indexes**: On wastage_number, location_id, doc_status, wastage_date, created_by for fast queries
- **Row-Level Security**: Users can only see wastage for locations they have access to

**wastage_line_items**
- **Purpose**: Individual products wasted within a transaction (supports batch wastage)
- **Key Fields**:
  - id (UUID, primary key)
  - wastage_header_id (foreign key)
  - product_id (foreign key to products table)
  - quantity, unit_of_measure, base_quantity
  - unit_cost, total_value, costing_method
  - stock_on_hand_before, stock_on_hand_after (for validation)
  - line_reason, line_photos (line-specific documentation)
  - approved_quantity, rejected_quantity (partial approval support)
  - line_status (pending, approved, partially_approved, rejected)
- **Indexes**: On wastage_header_id, product_id for JOIN performance

**wastage_photos**
- **Purpose**: Photo evidence metadata (actual photos stored in Supabase Storage)
- **Key Fields**:
  - id (UUID, primary key)
  - wastage_header_id (foreign key)
  - file_name, file_path, file_size, mime_type
  - caption (user-provided description)
  - captured_date, captured_by (photo metadata)
  - is_watermarked, watermark_text
- **Storage**: Photo files stored in Supabase Storage bucket, metadata in database
- **Access Control**: Photos accessed via signed URLs with expiration

**wastage_approvals**
- **Purpose**: Approval workflow history and state
- **Key Fields**:
  - id (UUID, primary key)
  - wastage_header_id (foreign key)
  - approval_level (1, 2, 3 for multi-level approvals)
  - approver_id (user who approved), approver_role
  - approval_action (approved, partially_approved, rejected, pending)
  - approval_date, approval_comments
  - original_total_value, approved_total_value (partial approval tracking)
- **Indexes**: On wastage_header_id, approver_id, approval_action

**wastage_configuration**
- **Purpose**: System configuration for thresholds, alerts, categories
- **Key Fields**:
  - id (UUID, primary key)
  - location_id (optional, for location-specific config)
  - auto_approve_threshold, level1_threshold, level2_threshold, level3_threshold
  - photo_required_threshold, minimum_photos_high_value
  - active_categories (array of enabled categories)
  - category_gl_mapping (JSON mapping categories to GL accounts)
- **Scope**: Global configuration with optional location overrides

### Supporting Tables (from other modules)

**products** (Product Management module)
- Provides product master data: product_code, product_name, unit_cost, unit_of_measure

**locations** (Organization module)
- Organizational locations: location_name, location_type, parent_location_id

**users** (User Management module)
- User information: username, full_name, email, role

**inventory_transactions** (Inventory Management module)
- Linked inventory adjustments created from approved wastage

**gl_journal_entries** (Finance module)
- General ledger postings for wastage expenses

### Database Views

**vw_wastage_summary**
- **Purpose**: Pre-joined view combining wastage headers with product, user, location details
- **Usage**: Optimized for list queries, reduces JOIN complexity in application code
- **Fields**: All wastage header fields plus product_name, product_code, submitter_name, location_name, approver_names

**vw_pending_approvals**
- **Purpose**: Pending approvals filtered by approver
- **Usage**: Powers Approval Queue page, pre-filtered for performance
- **Filters**: doc_status = 'pending_approval' AND approver_id = current_user
- **Additional**: Calculates days_pending, flags overdue approvals (>48 hours)

**vw_wastage_trends**
- **Purpose**: Aggregated data for analytics
- **Aggregations**: GROUP BY date, category, product; SUM(total_value), COUNT(*)
- **Time Granularity**: Daily, weekly, monthly aggregations

**vw_supplier_quality_wastage**
- **Purpose**: Wastage attributed to supplier quality issues
- **Filters**: is_supplier_quality_issue = true
- **Grouping**: GROUP BY supplier_id, quality_issue_type

### Stored Procedures (if complex logic needs database-level implementation)

**fn_calculate_wastage_value**
- **Purpose**: Calculate total wastage value based on quantity and costing method
- **Logic**: Handles FIFO, Weighted Average, Specific Identification costing
- **Returns**: Calculated value (decimal with 2 decimal places)

**fn_route_to_approver**
- **Purpose**: Determine which approver to assign based on value and approval rules
- **Logic**: Looks up configuration thresholds, returns approver_user_id
- **Returns**: UUID of approver

**fn_detect_anomalies**
- **Purpose**: Statistical anomaly detection on wastage patterns
- **Logic**: Calculates moving average, standard deviation, identifies outliers (>3 sigma)
- **Returns**: Boolean indicating if anomaly detected

### Database Triggers

**trg_wastage_audit**
- **Event**: AFTER INSERT, UPDATE, DELETE on wastage_headers
- **Action**: Automatically inserts record into audit_trail table
- **Captures**: Action type, user_id, timestamp, old_values, new_values, IP address

**trg_update_inventory_on_approval**
- **Event**: AFTER UPDATE on wastage_headers WHERE doc_status changes to 'approved'
- **Action**: Calls inventory adjustment function to reduce stock
- **Atomicity**: Runs within same transaction as approval, ensures consistency

---

## State Management

### Global UI State (Zustand Store)

**WastageStore** (defined in `hooks/useWastageStore.ts`)

**Purpose**: Manage UI state that needs to be shared across multiple wastage components but doesn't require server synchronization.

**State Properties**:
- **filters**: Object containing current filter selections (date range, status, category, product, location, submitter)
- **sortConfig**: Object with field (string) and direction ("asc" | "desc") for table sorting
- **selectedWastage**: Array of wastage IDs currently selected in table (for bulk operations)
- **sidebarCollapsed**: Boolean indicating sidebar visibility state
- **viewMode**: "list" | "grid" | "compact" for list page display preference

**Action Methods**:
- setFilter(filterKey: string, value: any): Update single filter
- resetFilters(): Clear all filters to default state
- setSortConfig(field: string, direction: "asc" | "desc"): Update sort configuration
- toggleSelectedWastage(wastageId: string): Add/remove wastage from selection
- selectAllWastage(wastageIds: string[]): Select all visible wastage
- clearSelection(): Clear all selected wastage
- toggleSidebar(): Toggle sidebar collapsed state
- setViewMode(mode: "list" | "grid" | "compact"): Change display mode

**Persistence**: Filter and sort preferences saved to localStorage for persistence across sessions

**When to Use**: UI state like filters, selections, preferences that don't need server sync. Avoid using for server data - use React Query instead.

### Server State (React Query)

**Purpose**: Manage all data fetched from server with automatic caching, background refetching, and optimistic updates. React Query provides powerful data synchronization without manual cache management.

**Query Keys Structure**: Hierarchical keys for precise cache invalidation
```typescript
['wastage'] - All wastage data
['wastage', 'list', filters, sort, page] - Specific list query
['wastage', 'detail', wastageId] - Single wastage detail
['wastage', 'statistics', dateRange] - Analytics statistics
['wastage', 'approvals', approverId] - Pending approvals for user
['photos', wastageId] - Photos for specific wastage
```

**Custom Hooks**:

**useWastageList** (wraps useQuery)
- **Purpose**: Fetch paginated list of wastage with filters
- **Query Key**: ['wastage', 'list', filters, sort, page]
- **Query Function**: Calls listWastage Server Action with parameters
- **Options**:
  - staleTime: 30 seconds (data considered fresh for 30s)
  - cacheTime: 5 minutes (cache retained for 5 min after last use)
  - refetchOnWindowFocus: true (refetch when user returns to tab)
  - keepPreviousData: true (show old data while fetching new page)
- **Returns**: { data, isLoading, isError, error, refetch }

**useWastageDetail** (wraps useQuery)
- **Purpose**: Fetch single wastage transaction with all details
- **Query Key**: ['wastage', 'detail', wastageId]
- **Query Function**: Calls getWastageById Server Action
- **Options**:
  - staleTime: 2 minutes (detail pages stay fresh longer)
  - cacheTime: 10 minutes
  - refetchOnMount: true (always fetch fresh data on mount)
- **Returns**: { data: wastageDetail, isLoading, isError, error }

**useWastageStatistics** (wraps useQuery)
- **Purpose**: Fetch analytics statistics
- **Query Key**: ['wastage', 'statistics', dateRange, locationId]
- **Query Function**: Calls getWastageStatistics Server Action
- **Options**:
  - staleTime: 5 minutes (analytics can be slightly stale)
  - cacheTime: 15 minutes
  - refetchInterval: 5 minutes (auto-refresh every 5 min)
- **Returns**: { data: statistics, isLoading, isError }

**usePendingApprovals** (wraps useQuery)
- **Purpose**: Fetch pending approvals for current user
- **Query Key**: ['wastage', 'approvals', approverId]
- **Options**:
  - staleTime: 30 seconds
  - refetchInterval: 30 seconds (real-time-ish updates)
  - refetchOnWindowFocus: true
- **Returns**: { data: pendingApprovals, isLoading, refetch }

**Mutation Hooks**:

**useCreateWastage** (wraps useMutation)
- **Purpose**: Create new wastage transaction
- **Mutation Function**: Calls createWastage Server Action
- **Options**:
  - onSuccess: Invalidate ['wastage', 'list'] to refetch list, navigate to detail page
  - onError: Show error toast, rollback optimistic update
  - onMutate: Optional optimistic update (add new item to cache immediately)
- **Returns**: { mutate, mutateAsync, isLoading, isError, error }

**useApproveWastage** (wraps useMutation)
- **Purpose**: Approve wastage transaction
- **Mutation Function**: Calls approveWastage Server Action
- **Options**:
  - onSuccess: Invalidate approvals query and detail query, show success toast
  - onError: Show error toast
  - retry: 1 (retry once on failure for network resilience)
- **Returns**: { mutate, isLoading, isError }

**useRejectWastage** (wraps useMutation)
- Similar to useApproveWastage but calls rejectWastage Server Action

**Cache Invalidation Strategy**:
- **After Create**: Invalidate all list queries to show new item
- **After Update**: Invalidate detail query and related list queries
- **After Delete**: Invalidate detail and list queries
- **After Approve/Reject**: Invalidate approvals, detail, and list queries
- **Manual Refetch**: User can manually refresh with refetch button

**Optimistic Updates**:
- **Approve Action**: Immediately update cache to show "approved" status before server response
- **If Server Fails**: Rollback optimistic update, show error, restore previous state
- **Trade-off**: Better UX (instant feedback) vs. risk of showing incorrect state temporarily

---

## Security Implementation

### Authentication

**Session Management**:
- NextAuth.js handles authentication with session-based approach
- Sessions stored in encrypted JWT cookies (secure, httpOnly, sameSite: strict)
- Session duration: 24 hours idle timeout, 7 days absolute timeout
- Session refresh: Automatic refresh on activity with sliding window
- Logout: Clears session cookie and revokes refresh token

**Authentication Flow**:
1. User logs in via login page
2. NextAuth validates credentials against database
3. Session created and encrypted JWT issued
4. JWT stored in httpOnly cookie (not accessible via JavaScript for XSS protection)
5. Every request includes session cookie automatically
6. Server Actions validate session on each request
7. If session invalid/expired, return 401 Unauthorized, redirect to login

**Protected Routes**:
- All wastage routes require authentication
- Middleware checks session before rendering Server Components
- Client Components check session using useSession hook
- Unauthenticated users redirected to login page with returnUrl

### Authorization

**Role-Based Access Control (RBAC)**:
- Roles defined: kitchen-staff, department-manager, store-manager, finance-manager, operations-manager, admin
- Permissions assigned to roles: record-wastage, approve-wastage, view-all-wastage, export-wastage, configure-wastage
- Permission checks performed on every Server Action call
- Client UI conditionally renders actions based on permissions (but server always validates)

**Permission Checks**:
- **Record Wastage**: User must have "record-wastage" permission AND access to location
- **Approve Wastage**: User must have "approve-wastage" permission AND value within authority threshold AND NOT own wastage (BR-WAST-008)
- **View Wastage**: User must have access to wastage's location (via user_locations table)
- **Export Data**: User must have "export-wastage" permission
- **Configure Settings**: User must have "configure-wastage" permission (typically admin only)

**Authority Thresholds**:
- Department Manager: Can approve up to $200
- Store Manager: Can approve up to $500
- Finance Manager: Can approve any value
- Configuration stored in wastage_configuration table

**Location-Based Access**:
- Users assigned to locations via user_locations many-to-many table
- Users can only record/view wastage for their assigned locations
- Operations Managers may have access to all locations in region
- Admins have access to all locations

### Row-Level Security (RLS)

**PostgreSQL RLS Policies**:
- Policies defined on wastage_headers table to enforce location-based access
- Policy: User can SELECT only wastage where location_id IN (user's accessible locations)
- Policy enforced at database level automatically on all queries
- Application code does NOT need to manually filter by location - database handles it

**RLS Policy Example** (conceptual, not actual code):
```
Policy Name: wastage_user_location_access
Table: wastage_headers
Operation: SELECT
USING clause:
  location_id IN (
    SELECT location_id FROM user_locations
    WHERE user_id = current_user_id()
  )
  OR
  current_user_has_permission('view-all-wastage')
```

**RLS Benefits**:
- Security enforced at data layer, cannot be bypassed by application bugs
- Simplifies application code - no manual filtering needed
- Prevents accidental data leaks
- Complies with data isolation requirements

### Data Protection

**Input Validation**:
- **Client-Side**: React Hook Form with Zod validation for immediate feedback
- **Server-Side**: Zod schema validation on every Server Action (never trust client)
- **Database-Level**: CHECK constraints and triggers for final validation

**SQL Injection Prevention**:
- Prisma ORM provides parameterized queries automatically
- No raw SQL queries in application code
- Database user has minimal privileges (no DROP, no admin operations)

**XSS Protection**:
- React automatically escapes all rendered text content
- Dangerous HTML never rendered directly (no dangerouslySetInnerHTML)
- Content Security Policy (CSP) headers configured to prevent inline scripts

**CSRF Protection**:
- Next.js Server Actions protected by CSRF tokens automatically
- All state-changing operations require valid CSRF token
- SameSite cookie policy prevents cross-site requests

**File Upload Security**:
- Accept only image file types (JPG, PNG, HEIC)
- Validate file type server-side (not just extension, check magic bytes)
- Scan uploaded files for malware (if scanner integrated)
- Store files outside webroot with signed URLs for access
- Signed URLs expire after 1 hour preventing unauthorized access

### Audit Logging

**Audit Trail Table** (`audit_trail`)
- **Purpose**: Immutable log of all data changes for compliance and forensics
- **Logged Actions**: CREATE, UPDATE, DELETE, APPROVE, REJECT on wastage_headers
- **Captured Data**:
  - action_type: Type of operation performed
  - entity_type: "wastage" (for this module)
  - entity_id: UUID of affected wastage
  - user_id: User who performed action
  - timestamp: Exact time of action (UTC)
  - ip_address: User's IP address
  - session_id: Session identifier
  - old_values: JSON object with values before change (for UPDATE)
  - new_values: JSON object with values after change
  - context: Additional context (e.g., approval level, rejection reason)

**Audit Triggers**:
- Database trigger `trg_wastage_audit` automatically logs changes
- Cannot be bypassed by application code
- Audit records never deleted (retention: 7 years minimum)

**Audit Access**:
- Audit trail accessible only to admins and auditors
- Audit log viewer page for searching and filtering audit records
- Export capability for external audit requirements

---

## Error Handling

### Client-Side Error Handling

**Try-Catch Pattern**:
All Server Action calls wrapped in try-catch blocks to handle errors gracefully without crashing the UI.

Example pattern (conceptual):
```
try {
  Show loading spinner
  Call Server Action
  On success: Update cache, show success toast, navigate or refresh
} catch (error) {
  Hide loading spinner
  Parse error message from response
  Show user-friendly error toast
  Log error to console for debugging
  Optionally log to error tracking service (Sentry)
  Rollback optimistic updates if any
}
```

**User Feedback**:
- **Success Toast**: Green notification with checkmark icon, auto-dismiss after 3 seconds
- **Error Toast**: Red notification with error icon, manual dismiss, includes "Contact Support" link
- **Validation Errors**: Inline field-level errors with red text and error icon below invalid fields
- **Loading States**: Spinner overlays, skeleton screens, disabled buttons during operations

**Error Display Patterns**:
- **Form Validation**: Red border on invalid field, error message below field
- **API Errors**: Toast notification with error message and error code
- **Network Errors**: Toast with "Connection lost. Check your internet and try again." message
- **Authorization Errors**: Redirect to login (401) or show "Access Denied" message (403)
- **Not Found Errors**: Show "Wastage transaction not found" message with link back to list

**Error Recovery**:
- **Retry Button**: For network errors, provide "Try Again" button in error toast
- **Refresh Page**: For unknown errors, suggest refreshing page
- **Navigate Away**: For not found errors, provide link back to list page
- **Contact Support**: For persistent errors, show support contact information

### Server-Side Error Handling

**Error Response Structure**:
All Server Actions return structured response object:
- Success: `{ success: true, data: actualData, message: "Optional success message" }`
- Error: `{ success: false, error: { message: "User-friendly error", code: "ERROR_CODE", details: validationErrorDetails } }`

**Error Types and Handling**:

**ValidationError** (Input validation failures)
- Cause: Zod schema validation failed, business rule violated
- Response: 400 Bad Request with validation errors array
- Details: `{ field: "quantity", message: "Quantity must be positive" }`
- User Experience: Show inline validation errors on form fields

**AuthenticationError** (User not logged in)
- Cause: Session invalid or expired
- Response: 401 Unauthorized
- User Experience: Redirect to login page with returnUrl

**AuthorizationError** (Permission denied)
- Cause: User lacks required permission or access to location
- Response: 403 Forbidden with descriptive message
- User Experience: Show "Access Denied" message with reason

**NotFoundError** (Resource not found)
- Cause: Wastage ID does not exist or user lacks access
- Response: 404 Not Found
- User Experience: Show "Wastage not found" message, link back to list

**ConflictError** (Duplicate or constraint violation)
- Cause: Duplicate wastage number (rare, auto-generated), concurrent update conflict
- Response: 409 Conflict with conflict details
- User Experience: Show conflict message, suggest refreshing and retrying

**DatabaseError** (Database operation failure)
- Cause: Connection lost, query timeout, constraint violation
- Response: 500 Internal Server Error
- Logging: Log full error with stack trace for debugging
- User Experience: Show generic "An error occurred" message, log error ID for support

**NetworkError** (External service connectivity issues)
- Cause: Inventory API down, Email service timeout
- Response: 503 Service Unavailable
- User Experience: Show "Service temporarily unavailable" with retry option

**Error Logging**:
- All errors logged with structured logging (Pino library)
- Log includes: Timestamp, error level (ERROR), error type, error message, stack trace, user ID, request context
- Critical errors trigger alerts to on-call engineer
- Logs aggregated in centralized logging system (Vercel logs, or external service like Datadog)

**Database Transaction Rollback**:
- All write operations wrapped in database transactions
- On error, transaction automatically rolled back (no partial changes)
- Ensures data consistency (atomicity)

---

## Performance Optimization

### Frontend Optimization

**Code Splitting**:
- Dynamic imports for heavy components (analytics charts, photo gallery lightbox)
- Route-based code splitting automatic with Next.js App Router
- Example: Analytics page loads chart libraries only when that page is accessed

**Lazy Loading**:
- Lazy load images with Next.js Image component (automatic lazy loading)
- Lazy load components below fold (use React.lazy() for non-critical components)
- Infinite scroll or pagination for large lists (avoid loading 1000+ items at once)

**Memoization**:
- Use React.memo() for expensive components that re-render frequently with same props
- Use useMemo() for expensive calculations (e.g., filtering large arrays, complex sorting)
- Use useCallback() for functions passed as props to prevent unnecessary re-renders
- Example: Memoize filtered and sorted wastage list calculation

**Virtualization**:
- For lists with >100 items, use react-window or react-virtual for virtualized rendering
- Only render visible rows (e.g., 20 rows on screen at a time)
- Dramatically improves performance for large datasets (1000+ rows)

**Debouncing**:
- Debounce search input (wait 300ms after user stops typing before searching)
- Debounce filter changes (avoid API call on every checkbox toggle)
- Use lodash.debounce or custom debounce hook

**Image Optimization**:
- Use Next.js Image component for automatic optimization (WebP conversion, responsive sizes)
- Compress photos client-side before upload (target ~500KB per photo)
- Serve photos via CDN (Supabase Storage has CDN)
- Generate thumbnails for gallery views (100x100px thumbnails instead of full resolution)

**Bundle Optimization**:
- Analyze bundle size with Next.js Bundle Analyzer
- Remove unused dependencies
- Use tree-shakeable imports (import specific functions, not entire libraries)
- Example: Import only needed lodash functions instead of entire lodash

### Backend Optimization

**Database Indexing**:
- Indexes created on frequently queried fields:
  - wastage_headers: (location_id, doc_status, wastage_date) composite index
  - wastage_headers: (wastage_number) unique index
  - wastage_line_items: (wastage_header_id, product_id) composite index
  - wastage_approvals: (approver_id, approval_action) composite index
- Avoid over-indexing (indexes slow down writes)

**Query Optimization**:
- Use Prisma's include sparingly (only fetch needed relations)
- Avoid N+1 queries (use include instead of separate queries)
- Use database views for complex pre-joined queries
- Limit query results (always use pagination)
- Example: Fetch wastage list with product name (use include) instead of fetching products separately

**Caching**:
- React Query caches all GET requests automatically (staleTime configuration)
- Server-side caching for expensive calculations (analytics aggregations)
- Consider Redis cache for frequently accessed data (e.g., wastage configuration)

**Pagination**:
- Server-side pagination for all list queries (never fetch all records)
- Default page size: 25, max: 100
- Return total count for pagination controls
- Use offset-based pagination (skip/take) or cursor-based for very large datasets

**Batch Operations**:
- Batch multiple photo uploads in single request
- Batch approval notifications (send one email with multiple approvals)
- Batch database inserts for batch wastage recording

**Async Operations**:
- Photo uploads can be async (don't block wastage creation on photo upload completion)
- GL posting is async (queue for background processing)
- Email notifications are fire-and-forget (don't block approval on email sending)

### Pagination Implementation

**Approach**: Server-side pagination with page number and page size parameters
**Calculation**:
- offset = (page - 1) * pageSize
- limit = pageSize
**Query**:
- Data query: SELECT * FROM wastage_headers LIMIT offset OFFSET limit
- Count query: SELECT COUNT(*) FROM wastage_headers (run in parallel with data query)
**Response**:
- Return data array, totalCount, current page, pageSize, totalPages
- Frontend calculates totalPages = Math.ceil(totalCount / pageSize)

**Performance Consideration**:
- For very large datasets (>100K records), offset pagination becomes slow
- Consider cursor-based pagination (use last record ID as cursor instead of offset)

---

## Testing Strategy

### Unit Tests

**Location**: `__tests__/unit/` directory
**Framework**: Vitest (fast, compatible with Vite)
**Coverage Target**: >80% code coverage
**Focus Areas**:
- Server Actions with mocked database
- Business logic functions (calculations, approval routing, anomaly detection)
- Validation schemas (Zod schema tests)
- Utility functions (date formatting, currency formatting)

**Testing Patterns**:
- Describe blocks group related tests (e.g., describe('createWastage'))
- Test success cases and error cases for each function
- Mock external dependencies (database, integrations) using Vitest's vi.mock()
- Use test fixtures for consistent test data (e.g., mockWastageData.ts)

**Example Test Cases**:
- createWastage Server Action:
  - ✓ Should create wastage with valid data
  - ✓ Should return validation error for invalid quantity
  - ✓ Should prevent creation if stock insufficient
  - ✓ Should require photo for wastage >$100
  - ✓ Should route to correct approver based on value
  - ✗ Should fail if user lacks permission

- calculateWastageValue function:
  - ✓ Should calculate value correctly (quantity × unit_cost)
  - ✓ Should round to 2 decimal places
  - ✓ Should handle FIFO costing method
  - ✓ Should handle Weighted Average costing

**Mocking Strategy**:
- Mock Prisma client with test database or in-memory database
- Mock external integrations (inventory, finance) with fake implementations
- Mock file uploads with test blobs

### Integration Tests

**Location**: `__tests__/integration/` directory
**Framework**: Vitest with test PostgreSQL database
**Coverage Target**: >70% of critical workflows
**Focus Areas**:
- Complete CRUD workflows (create, read, update, delete)
- Database queries and transactions
- Multi-table operations (e.g., create wastage with line items and photos)
- Integration with other modules (inventory adjustment, GL posting)

**Test Database Setup**:
- Separate test database (not production or development database)
- Before each test: Seed database with test data
- After each test: Cleanup (delete all records or rollback transactions)
- Use database migrations to ensure schema up-to-date

**Example Integration Tests**:
- Wastage Approval Workflow:
  - ✓ Create wastage → Submit → Approve → Verify inventory adjusted → Verify GL posting queued
  - ✓ Create wastage → Submit → Reject → Verify inventory NOT adjusted
  - ✓ Create high-value wastage → Submit → Route to Finance Manager → Approve → Verify multi-level approval

- Wastage Deletion:
  - ✓ Delete draft wastage → Verify soft deleted
  - ✗ Attempt delete approved wastage → Verify error
  - ✓ Delete wastage with photos → Verify photos soft deleted

### E2E Tests

**Location**: `e2e/` directory
**Framework**: Playwright (supports Chrome, Firefox, Safari)
**Focus Areas**:
- Critical user workflows end-to-end (from login to completion)
- Cross-browser compatibility (test on Chrome, Firefox, Safari)
- Responsive design (test on desktop, tablet, mobile viewports)
- Form submissions and validations

**Test Scenarios**:
1. **Record Wastage E2E**:
   - Login as kitchen staff
   - Navigate to Record Wastage page
   - Search for product
   - Enter quantity and reason
   - Capture photo using camera (simulated)
   - Submit wastage
   - Verify success toast
   - Verify wastage appears in list

2. **Approve Wastage E2E**:
   - Login as store manager
   - Navigate to Approval Queue
   - Open pending wastage
   - Review details and photos
   - Click Approve
   - Enter approval comment
   - Confirm approval
   - Verify success toast
   - Verify wastage removed from queue
   - Verify inventory adjusted (check Inventory module)

3. **Wastage Analytics E2E**:
   - Login as operations manager
   - Navigate to Analytics dashboard
   - Select date range
   - Verify KPIs displayed
   - Verify charts rendered
   - Click chart element to drill-down
   - Export report to Excel
   - Verify file downloaded

**Execution Environment**:
- Run on staging environment before production deployment
- Use test data (not production data)
- Automated execution in CI/CD pipeline

**Patterns**:
- Use data-testid attributes for reliable element selection (avoid relying on text or classes that may change)
- Page Object Model pattern for maintainable tests (create Page classes encapsulating page interactions)
- Take screenshots on failure for debugging
- Generate video recordings of test runs

---

## Deployment Configuration

### Environment Variables

Environment variables are stored in `.env.local` for local development and configured in Vercel dashboard for production.

**Required Environment Variables**:
```env
# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
DIRECT_URL="postgresql://user:password@host:port/database" # For migrations

# Authentication (NextAuth.js)
NEXTAUTH_SECRET="randomly-generated-secret-key-32-chars"
NEXTAUTH_URL="https://yourdomain.com" # Or http://localhost:3000 for dev

# Supabase (for Storage)
NEXT_PUBLIC_SUPABASE_URL="https://yourproject.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key" # Server-side only, never expose

# Email Service (SendGrid)
SENDGRID_API_KEY="SG.xxxxxxxxxxxx"
SENDGRID_FROM_EMAIL="noreply@yourdomain.com"

# Application URLs (for emails and redirects)
NEXT_PUBLIC_APP_URL="https://yourdomain.com"

# Feature Flags (optional)
ENABLE_WASTAGE_ANALYTICS="true"
ENABLE_PHOTO_WATERMARKING="true"
```

**Environment-Specific Configurations**:
- Development: Use local PostgreSQL database, console logging instead of email
- Staging: Use staging database, send emails to test addresses only
- Production: Use production database, full email sending, enable error tracking

### Build Configuration

**Next.js Configuration** (`next.config.js`):
- Environment variable declarations for client-side access (NEXT_PUBLIC_* prefix)
- Image domains whitelist for Next.js Image optimization (Supabase Storage domain)
- Output: standalone mode for optimized deployment size
- Enable Webpack bundle analyzer in development
- Configure redirects for deprecated routes

### Database Migrations

**Prisma Migrations** (used for schema changes):
```bash
# Create new migration after schema changes
npm run db:migrate:create add_wastage_tables

# Run pending migrations
npm run db:migrate

# Rollback last migration (if needed)
npm run db:migrate:rollback

# Generate Prisma Client after schema changes
npm run db:generate
```

**Migration Process**:
1. Modify Prisma schema (`prisma/schema.prisma`)
2. Create migration: `npm run db:migrate:create`
3. Review generated SQL in `prisma/migrations/` directory
4. Test migration on local database
5. Commit migration files to git
6. Deploy: Migrations run automatically on Vercel deployment
7. Verify migration success in production logs

**Rollback Strategy**:
- Migrations are forward-only (no automatic rollback)
- For production issues: Create new migration to revert changes
- Always test migrations on staging before production

---

## Dependencies

### npm Packages

| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| next | ^14.2.0 | Framework | App Router required |
| react | ^18.2.0 | UI library | Server and Client Components |
| react-dom | ^18.2.0 | React renderer | Required by React |
| typescript | ^5.8.0 | Type safety | Strict mode enabled |
| @prisma/client | ^5.8.0 | Database ORM | Type-safe queries |
| prisma | ^5.8.0 | Prisma CLI | Development dependency |
| zod | ^3.22.0 | Validation | Shared client/server |
| react-hook-form | ^7.48.0 | Form handling | TypeScript support |
| @tanstack/react-query | ^5.17.0 | Server state | Data fetching and caching |
| zustand | ^4.4.0 | UI state | Lightweight store |
| tailwindcss | ^3.4.0 | Styling | Utility-first CSS |
| @radix-ui/* | various | UI primitives | Accessible components |
| lucide-react | ^0.300.0 | Icons | Consistent icon system |
| date-fns | ^3.0.0 | Date handling | Lightweight alternative to moment |
| chart.js | ^4.4.0 | Charts | Data visualization |
| react-chartjs-2 | ^5.2.0 | Chart wrapper | React integration |
| react-dropzone | ^14.2.0 | File upload | Drag-and-drop support |
| browser-image-compression | ^2.0.2 | Image compression | Client-side photo optimization |
| sharp | ^0.33.0 | Image processing | Server-side watermarking |
| jspdf | ^2.5.0 | PDF generation | Report exports |
| exceljs | ^4.4.0 | Excel generation | Data exports |
| next-auth | ^4.24.0 | Authentication | Session management |
| pino | ^8.17.0 | Logging | Structured logging |
| sonner | ^1.3.0 | Toast notifications | User feedback |

**Dependency Notes**:
- Pin major versions to avoid breaking changes
- Regular security updates using `npm audit`
- Review and update dependencies quarterly
- Test thoroughly before upgrading Next.js (framework version impacts entire app)

### Internal Module Dependencies

**Wastage Reporting depends on**:

1. **Inventory Management Module**
   - Purpose: Validate stock availability, adjust inventory on approval
   - Integration: InventoryIntegration service calls Inventory API
   - Data Exchange: Product data, stock quantities, inventory adjustments

2. **Finance Module**
   - Purpose: Post wastage to General Ledger, update COGS
   - Integration: FinanceIntegration service calls Finance API
   - Data Exchange: Wastage values, GL account codes, cost center allocations

3. **Product Management Module**
   - Purpose: Product master data (names, codes, costs, UOM)
   - Integration: Direct database queries via Prisma relations
   - Data Exchange: Product information for wastage recording

4. **User Management Module**
   - Purpose: User authentication, authorization, location assignments
   - Integration: NextAuth integration, direct database queries
   - Data Exchange: User profiles, roles, permissions, user-location mappings

5. **Vendor Management Module** (optional)
   - Purpose: Supplier quality issue tracking
   - Integration: VendorIntegration service for quality complaints
   - Data Exchange: Vendor information, quality complaint records

**Shared Components**:
- DataTable component (from shared UI library)
- FilterPanel component
- ExportDialog component
- DateRangePicker component
- UserSelector component
- LocationSelector component

**Shared Utilities**:
- Currency formatting functions
- Date formatting functions
- Permission checking utilities
- Audit logging utilities

---

## Monitoring and Logging

### Application Logging

**Logging Library**: Pino (structured JSON logging)

**Log Levels**:
- **DEBUG**: Detailed execution information (development only, not logged in production)
- **INFO**: Successful operations with context (e.g., "Wastage WST-2025-0112-0023 created by user123")
- **WARNING**: Recoverable errors or unusual conditions (e.g., "Photo upload retried 3 times")
- **ERROR**: Failed operations with error details (e.g., "Database query timeout during wastage creation")

**Log Structure**:
Every log entry includes:
- Timestamp (ISO 8601 format in UTC)
- Log level (debug, info, warning, error)
- Message (human-readable description)
- User ID (if applicable)
- Session ID (if applicable)
- Entity type and ID (e.g., "wastage", "WST-2025-0112-0023")
- Operation (create, update, delete, approve, reject)
- Duration (for performance tracking)
- Error stack trace (for errors)
- Request context (route, HTTP method, query parameters)

**Example Log Entry** (JSON format):
```json
{
  "timestamp": "2025-01-12T14:23:45.678Z",
  "level": "info",
  "message": "Wastage created successfully",
  "userId": "user-uuid-123",
  "sessionId": "sess-uuid-456",
  "entityType": "wastage",
  "entityId": "wastage-uuid-789",
  "operation": "create",
  "duration": 245,
  "context": {
    "wastageNumber": "WST-2025-0112-0023",
    "totalValue": 31.25,
    "category": "preparation_error",
    "location": "Restaurant A"
  }
}
```

**Log Aggregation**:
- Development: Console output with pretty printing
- Production: Vercel logs with JSON format, aggregated in Vercel dashboard
- Consider external log aggregation (Datadog, LogRocket, Papertrail) for advanced analysis

### Performance Monitoring

**Key Metrics**:
- **Page Load Times**: Time to first byte (TTFB), First Contentful Paint (FCP), Largest Contentful Paint (LCP)
- **API Response Times**: Average response time for each Server Action
- **Database Query Performance**: Slow query log (queries >500ms)
- **Error Rates**: Percentage of failed requests by endpoint

**Monitoring Tools**:
- **Vercel Analytics**: Automatic page load performance tracking
- **Sentry**: Error tracking and performance monitoring
- **Custom Metrics**: Log response times in Server Actions

**Performance Targets**:
- Page load: <2 seconds (target LCP <2.5s for good Core Web Vitals)
- API response: <500ms average, <2s 95th percentile
- Database query: <200ms average
- Error rate: <1% of all requests

**Slow Query Alerting**:
- Log warning when query exceeds 500ms
- Alert engineering team if query exceeds 2 seconds
- Review slow queries weekly to optimize indexes

### Error Tracking

**Sentry Integration**:
- Automatic error capture for unhandled exceptions
- Source map upload for readable stack traces
- User context attachment (user ID, session ID)
- Release tracking (correlate errors with deployments)
- Breadcrumbs capture (user actions leading to error)

**Error Alerting**:
- Immediate alert for critical errors (database connection lost, integration failures)
- Daily digest for non-critical errors
- Alert rules based on error frequency (e.g., alert if same error occurs 10+ times in 5 minutes)

**Error Metrics**:
- Total error count per day
- Error rate (errors per 100 requests)
- Error types breakdown (validation, authorization, database, network)
- Most common errors (top 10)

### Alerts

**Alert Channels**:
- Email: For non-urgent alerts (daily digests)
- Slack: For urgent alerts (critical errors, performance degradation)
- PagerDuty: For production incidents requiring immediate response

**Alert Rules**:
1. **Critical Errors**:
   - Database connection lost → Immediate Slack + PagerDuty
   - Approval workflow failure → Immediate Slack
   - Photo upload service down → Immediate Slack

2. **Performance Degradation**:
   - Average API response time >2s for 5 minutes → Slack alert
   - Error rate >5% for 5 minutes → Slack alert + PagerDuty if persists >15 min

3. **Business Metrics**:
   - Wastage submissions dropped >50% compared to yesterday → Slack alert (possible system issue)
   - Zero approvals for 4 hours during business hours → Slack alert (workflow stuck?)

4. **Security Alerts**:
   - Failed login attempts >10 for single user → Email security team
   - Unauthorized access attempts → Immediate Slack

**Alert Response Procedures**:
- Acknowledge alert in PagerDuty/Slack
- Investigate using logs and monitoring dashboards
- Apply hotfix if critical, otherwise plan fix for next sprint
- Post-mortem for major incidents

---

## Technical Debt

| Item | Priority | Effort | Notes |
|------|----------|--------|-------|
| Migrate from offset pagination to cursor-based pagination for large datasets | Medium | Medium | Current offset pagination becomes slow when wastage transactions exceed 100K records. Cursor-based pagination would improve performance for large datasets. |
| Implement real-time approval queue updates using Server-Sent Events (SSE) instead of polling | Low | Small | Current implementation polls every 30 seconds. SSE would provide true real-time updates with lower server load. |
| Add database read replicas for analytics queries | Medium | Large | Analytics queries (complex aggregations) can impact transactional database performance. Read replica would isolate analytics workload. |
| Implement photo CDN for faster global photo loading | Low | Medium | Photos currently served from Supabase Storage. CDN (Cloudflare, Fastly) would improve loading times for users far from storage region. |
| Replace synchronous inventory adjustment with event-driven async pattern | High | Large | Current inventory adjustment is synchronous within approval transaction. Async event-driven pattern (message queue) would decouple systems and improve resilience but requires careful handling of eventual consistency. Trade-off: Complexity vs. Resilience. |
| Add wastage prediction model using machine learning | Low | Large | Predictive model could forecast expected wastage based on historical patterns, sales forecasts, weather. Requires data science expertise and model training infrastructure. |
| Optimize photo watermarking performance | Medium | Small | Current server-side watermarking (Sharp library) can be slow for multiple photos. Consider client-side watermarking or async background job. |
| Implement batch photo upload with progress tracking | Medium | Medium | Current photo upload is sequential. Batch upload with progress bar would improve UX for multiple photos. |

---

## Migration Guide

This section is not applicable as Wastage Reporting is a new module without existing functionality to replace. For future reference, if this module needs to be migrated to a new architecture or database, this section will document the migration steps, data migration scripts, and rollback procedures.

---

## Appendix

### Related Documents
- [Business Requirements](./BR-wastage-reporting.md) - Functional and non-functional requirements
- [Use Cases](./UC-wastage-reporting.md) - Detailed use case scenarios
- [Data Schema](./DS-wastage-reporting.md) - Proposed database schema
- [Flow Diagrams](./FD-wastage-reporting.md) - Visual process flows
- [Validations](./VAL-wastage-reporting.md) - Validation rules and Zod schemas

### Useful Commands

```bash
# Development
npm run dev                    # Start development server on localhost:3000

# Testing
npm run test                   # Run unit tests with Vitest
npm run test:watch             # Run tests in watch mode
npm run test:coverage          # Generate coverage report
npm run test:e2e               # Run Playwright E2E tests
npm run test:e2e:ui            # Run E2E tests with Playwright UI

# Database
npm run db:migrate             # Run Prisma migrations
npm run db:migrate:create      # Create new migration
npm run db:generate            # Generate Prisma Client
npm run db:seed                # Seed database with test data
npm run db:studio              # Open Prisma Studio (database GUI)

# Code Quality
npm run lint                   # Run ESLint
npm run lint:fix               # Fix ESLint errors automatically
npm run checktypes             # Run TypeScript type checking

# Build & Deployment
npm run build                  # Build for production
npm run start                  # Start production server
npm run analyze                # Analyze bundle size

# Utilities
npm run format                 # Format code with Prettier
npm run clean                  # Clean build artifacts
```

---

**Document End**

> 📝 **Note to Implementers**:
> - This technical specification provides comprehensive implementation guidance
> - Actual code implementation should follow these patterns and architecture
> - Refer to related documents (BR, UC, DS, VAL) for complete requirements
> - Update this document as implementation progresses and architectural decisions are made
> - Conduct technical review with senior engineers before starting implementation
