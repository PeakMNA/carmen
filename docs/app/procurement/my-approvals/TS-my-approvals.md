# Technical Specification: My Approvals

## Module Information
- **Module**: Procurement
- **Sub-Module**: My Approvals
- **Route**: `/procurement/my-approvals`
- **Version**: 1.0.0
- **Last Updated**: 2025-11-12
- **Owner**: Procurement & Workflow Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-12 | Documentation Team | Initial version |

---

## Overview

The My Approvals module is implemented as a Next.js 14 App Router application providing a centralized, real-time approval workflow interface. The architecture follows a three-tier pattern with React Server Components for initial page loads, client components for interactive features, and Server Actions for data mutations. Real-time queue updates are achieved through Server-Sent Events (SSE) for efficient live updates without polling overhead.

The technical implementation emphasizes performance through optimistic UI updates, parallel data fetching, and intelligent caching strategies. Security is enforced through PostgreSQL Row-Level Security (RLS) policies ensuring approvers only see documents within their authorization scope.

**⚠️ IMPORTANT: This is a Technical Specification Document - TEXT FORMAT ONLY**
- **DO NOT include actual code** - describe implementation patterns in text
- **DO NOT include TypeScript/JavaScript code** - describe component responsibilities
- **DO NOT include SQL code** - refer to DS (Data Schema) document for database descriptions
- **DO include**: Architecture descriptions, component responsibilities, data flow descriptions, integration patterns
- **Focus on**: WHAT components do, HOW they interact, WHERE data flows - all in descriptive text

**Related Documents**:
- [Business Requirements](./BR-my-approvals.md)
- [Use Cases](./UC-my-approvals.md)
- [Data Schema](./DS-my-approvals.md)
- [Flow Diagrams](./FD-my-approvals.md)
- [Validations](./VAL-my-approvals.md)

---

## Sitemap

### Overview
This section provides a complete navigation structure of all pages, tabs, and dialogues in the My Approvals sub-module.

### Page Hierarchy

```mermaid
graph TD
    ListPage['List Page<br>(/procurement/my-approvals)']
    CreatePage['Create Page<br>(/procurement/my-approvals/new)']
    DetailPage["Detail Page<br>(/procurement/my-approvals/[id])"]
    EditPage["Edit Page<br>(/procurement/my-approvals/[id]/edit)"]

    %% List Page Tabs
    ListPage --> ListTab1['Tab: All Items']
    ListPage --> ListTab2['Tab: Active']
    ListPage --> ListTab3['Tab: Archived']

    %% List Page Dialogues
    ListPage -.-> ListDialog1['Dialog: Quick Create']
    ListPage -.-> ListDialog2['Dialog: Bulk Actions']
    ListPage -.-> ListDialog3['Dialog: Export']
    ListPage -.-> ListDialog4['Dialog: Filter']

    %% Detail Page Tabs
    DetailPage --> DetailTab1['Tab: Overview']
    DetailPage --> DetailTab2['Tab: History']
    DetailPage --> DetailTab3['Tab: Activity Log']

    %% Detail Page Dialogues
    DetailPage -.-> DetailDialog1['Dialog: Edit']
    DetailPage -.-> DetailDialog2['Dialog: Delete Confirm']
    DetailPage -.-> DetailDialog3['Dialog: Status Change']

    %% Create/Edit Dialogues
    CreatePage -.-> CreateDialog1['Dialog: Cancel Confirm']
    CreatePage -.-> CreateDialog2['Dialog: Save Draft']

    EditPage -.-> EditDialog1['Dialog: Discard Changes']
    EditPage -.-> EditDialog2['Dialog: Save Draft']

    %% Navigation Flow
    ListPage --> DetailPage
    ListPage --> CreatePage
    DetailPage --> EditPage
    CreatePage --> DetailPage
    EditPage --> DetailPage

    style ListPage fill:#e1f5ff
    style CreatePage fill:#fff4e1
    style DetailPage fill:#e8f5e9
    style EditPage fill:#fce4ec
```

### Pages

#### 1. List Page
**Route**: `/procurement/my-approvals`
**File**: `page.tsx`
**Purpose**: Display paginated list of all approvals

**Sections**:
- Header: Title, breadcrumbs, primary actions
- Filters: Quick filters, advanced filter panel
- Search: Global search with autocomplete
- Data Table: Sortable columns, row actions, bulk selection
- Pagination: Page size selector, page navigation

**Tabs**:
- **All Items**: Complete list of all approvals
- **Active**: Filter active items only
- **Archived**: View archived items

**Dialogues**:
- **Quick Create**: Fast creation form with essential fields only
- **Bulk Actions**: Multi-select actions (delete, export, status change)
- **Export**: Export data in various formats (CSV, Excel, PDF)
- **Filter**: Advanced filtering with multiple criteria

#### 2. Detail Page
**Route**: `/procurement/my-approvals/[id]`
**File**: `[id]/page.tsx`
**Purpose**: Display comprehensive approval details

**Sections**:
- Header: Breadcrumbs, approval title, action buttons
- Info Cards: Multiple cards showing different aspects
- Related Data: Associated records and relationships

**Tabs**:
- **Overview**: Key information and summary
- **History**: Change history and audit trail
- **Activity Log**: User actions and system events

**Dialogues**:
- **Edit**: Navigate to edit form
- **Delete Confirm**: Confirmation before deletion
- **Status Change**: Change approval status with reason

#### 3. Create Page
**Route**: `/procurement/my-approvals/new`
**File**: `new/page.tsx`
**Purpose**: Create new approval

**Sections**:
- Form Header: Title, Save/Cancel actions
- Form Fields: All required and optional fields
- Validation: Real-time field validation

**Dialogues**:
- **Cancel Confirm**: Confirm discarding unsaved changes
- **Save Draft**: Save incomplete form as draft

#### 4. Edit Page
**Route**: `/procurement/my-approvals/[id]/edit`
**File**: `[id]/edit/page.tsx`
**Purpose**: Modify existing approval

**Sections**:
- Form Header: Title, Save/Cancel/Delete actions
- Form Fields: Pre-populated with existing data
- Change Tracking: Highlight modified fields

**Dialogues**:
- **Discard Changes**: Confirm discarding modifications
- **Save Draft**: Save changes as draft


## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer                            │
│                        (Browser - React)                        │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐     │
│  │ Approval Queue│  │ Document      │  │  Delegation   │     │
│  │    Page       │  │  Detail Page  │  │  Management   │     │
│  └───────────────┘  └───────────────┘  └───────────────┘     │
│           │                  │                  │              │
│           ▼                  ▼                  ▼              │
│  ┌─────────────────────────────────────────────────┐          │
│  │        UI Components (Client Components)        │          │
│  │   - ApprovalQueue  - DocumentReview            │          │
│  │   - BulkActions    - DelegationForm            │          │
│  │   - Filters        - NotificationCenter        │          │
│  └─────────────────────────────────────────────────┘          │
└────────────┬────────────────────────────────────────────────────┘
             │ HTTPS / Server Actions / SSE
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Application Layer                            │
│                 (Next.js Server - Node.js)                      │
│  ┌─────────────────────────────────────────────────┐          │
│  │           Server Actions                        │          │
│  │  - approveDocument    - bulkApproveDocuments   │          │
│  │  - rejectDocument     - createDelegation       │          │
│  │  - requestMoreInfo    - validateAuthority      │          │
│  └─────────────────────────────────────────────────┘          │
│           │                  │                  │              │
│           ▼                  ▼                  ▼              │
│  ┌─────────────────────────────────────────────────┐          │
│  │         Business Logic Services                 │          │
│  │  - Approval Service    - Authority Service     │          │
│  │  - Delegation Service  - SLA Service           │          │
│  │  - Notification Service                        │          │
│  └─────────────────────────────────────────────────┘          │
└────────────┬────────────────────────────────────────────────────┘
             │ PostgreSQL Protocol
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                         Data Layer                              │
│                  (PostgreSQL via Supabase)                      │
│  ┌─────────────────────────────────────────────────┐          │
│  │             Core Tables                         │          │
│  │  - approval_queue_items   - approval_actions   │          │
│  │  - approval_delegations   - approval_sla_config│          │
│  │  - approval_authority_matrix                   │          │
│  └─────────────────────────────────────────────────┘          │
│           │                  │                  │              │
│  ┌───────▼──────┐  ┌────────▼────────┐  ┌──────▼──────┐     │
│  │ Row-Level    │  │   Database      │  │  Materialized│     │
│  │  Security    │  │   Functions     │  │    Views     │     │
│  │  Policies    │  │                 │  │              │     │
│  └──────────────┘  └─────────────────┘  └──────────────┘     │
└────────────┬────────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Integrations                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Workflow   │  │  Notification│  │    Budget    │         │
│  │    Engine    │  │   Service    │  │  Management  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Inventory   │  │   Finance    │  │    Audit     │         │
│  │  Management  │  │    System    │  │   Logging    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

### Component Architecture

**Frontend Layer**
- **Page Components**: Server Components for initial SSR page load with data fetching
- **UI Components**: Client Components for interactive approval interfaces with optimistic updates
- **State Management**: Zustand for UI state (filters, selections), React Query for server state (queue data, document details)
- **Real-Time Updates**: Server-Sent Events connection for live queue updates
- **Form Handling**: React Hook Form with Zod validation for approval actions

**Backend Layer**
- **Server Actions**: Type-safe server functions for approval operations (approve, reject, delegate)
- **Business Logic Services**: Reusable service layer for approval workflows, authority validation, SLA calculation
- **Data Access Layer**: Prisma ORM for type-safe database queries with relation loading
- **Integration Services**: API clients for external systems (Workflow Engine, Budget, Inventory, Finance)
- **Background Jobs**: Cron-based jobs for SLA monitoring, escalation, daily digests

**Data Layer**
- **PostgreSQL Database**: Relational database with ACID transactions for approval consistency
- **Row-Level Security**: RLS policies restrict approvers to their authorized documents only
- **Database Functions**: Stored functions for complex approval routing logic and SLA calculations
- **Materialized Views**: Pre-aggregated approval metrics for fast analytics queries
- **Audit Tables**: Immutable append-only tables for compliance and forensics

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14.2+ (App Router with Server Components and Server Actions)
- **UI Library**: React 18.2+ with Server Components and Client Components
- **Styling**: Tailwind CSS 3.4+ with custom design system, Shadcn/ui component library
- **State Management**: Zustand 4.4+ (UI state), React Query 5.17+ (server state with caching)
- **Form Handling**: React Hook Form 7.48+ (form state), Zod 3.22+ (validation schemas)
- **Icons**: Lucide React 0.263+
- **Date Handling**: date-fns 3.0+ for date formatting and calculations
- **Real-Time**: Server-Sent Events (SSE) for live queue updates

### Backend
- **Runtime**: Node.js 20.14.0+
- **Framework**: Next.js 14.2+ Server Actions and API Routes
- **Database**: PostgreSQL 14+ via Supabase (managed database)
- **ORM**: Prisma 5.8+ for type-safe database access
- **Authentication**: Supabase Auth with JWT tokens and Row-Level Security
- **Session Management**: Encrypted session cookies with 30-minute inactivity timeout
- **File Storage**: Supabase Storage for document attachments (PDFs, images)
- **Background Jobs**: Vercel Cron for scheduled jobs (SLA monitoring, daily digests)

### Testing
- **Unit Tests**: Vitest 1.0+ for component and utility testing
- **Integration Tests**: Vitest with mock database for service layer testing
- **E2E Tests**: Playwright 1.40+ for critical approval workflows
- **API Tests**: Supertest for Server Action testing

### DevOps
- **Version Control**: Git with GitHub (main branch deployment to production)
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Hosting**: Vercel (Edge Network) with automatic deployments
- **Monitoring**: Sentry for error tracking, Vercel Analytics for performance monitoring
- **Logging**: Structured JSON logging with LogTail aggregation

---

## Component Structure

### Directory Structure

```
app/(main)/procurement/my-approvals/
├── page.tsx                            # Approval queue list page (Server Component)
├── [id]/
│   └── page.tsx                        # Document detail page (Server Component)
├── analytics/
│   └── page.tsx                        # Approval analytics dashboard
├── delegations/
│   └── page.tsx                        # Delegation management page
├── components/
│   ├── ApprovalQueue.tsx               # Main queue component (Client)
│   ├── ApprovalQueueItem.tsx           # Single queue item
│   ├── ApprovalFilters.tsx             # Filter controls
│   ├── BulkActionsToolbar.tsx          # Bulk action controls
│   ├── DocumentReview.tsx              # Document detail view
│   ├── DocumentTabs.tsx                # Tabbed interface (Overview, Items, Attachments, History)
│   ├── ApprovalButtons.tsx             # Approve/Reject/Request Info buttons
│   ├── ApprovalModal.tsx               # Approval confirmation modal
│   ├── RejectionModal.tsx              # Rejection with reason modal
│   ├── InfoRequestModal.tsx            # Request more information modal
│   ├── BulkApprovalModal.tsx           # Bulk approval confirmation
│   ├── DelegationList.tsx              # Active and past delegations
│   ├── DelegationForm.tsx              # Create delegation form
│   ├── DelegationCard.tsx              # Single delegation card
│   ├── ApprovalHistory.tsx             # Approval timeline component
│   ├── BudgetImpactPanel.tsx           # Budget availability display
│   ├── PriceVarianceAlert.tsx          # Price variance indicator
│   ├── PolicyViolationAlert.tsx        # Policy violation warning
│   ├── SLAIndicator.tsx                # SLA countdown timer
│   ├── NotificationCenter.tsx          # In-app notification panel
│   ├── ApprovalMetrics.tsx             # KPI dashboard widgets
│   └── EmptyState.tsx                  # Empty queue state
├── types.ts                            # TypeScript interfaces and types
├── actions.ts                          # Server Actions for approval operations
├── hooks/
│   ├── useApprovalQueue.ts             # Queue data fetching and real-time updates
│   ├── useDocumentDetail.ts            # Document detail fetching
│   ├── useApprovalActions.ts           # Approval action mutations
│   ├── useBulkSelection.ts             # Bulk selection state management
│   ├── useDelegations.ts               # Delegation management
│   ├── useFilters.ts                   # Filter state and URL sync
│   ├── useRealtimeQueue.ts             # SSE connection for real-time updates
│   └── useNotifications.ts             # In-app notification management
└── lib/
    ├── approval-service.ts             # Approval business logic
    ├── authority-service.ts            # Authority validation
    ├── delegation-service.ts           # Delegation management
    ├── sla-service.ts                  # SLA calculation and monitoring
    └── integration-clients.ts          # External system API clients

lib/types/
├── approval.ts                         # Approval-specific type definitions

lib/mock-data/
├── approval-queue.ts                   # Mock approval queue data

lib/utils/
├── approval-helpers.ts                 # Approval utility functions
```

### Key Components

#### Approval Queue Page
**File**: `page.tsx` (Server Component)
**Purpose**: Main approval queue interface displaying all pending approvals for the user
**Responsibilities**:
- Server-side data fetching for initial queue load (parallel queries for queue items, counts, filters)
- Render ApprovalQueue client component with initial data
- Handle filter parameters from URL query string
- Apply Row-Level Security through Supabase client user context
**Data Flow**: Database → Server Component → Client Component (hydration) → SSE (real-time updates)
**Performance**: Implements Incremental Static Regeneration (ISR) with 30-second revalidation for common filter combinations

#### ApprovalQueue Component
**File**: `ApprovalQueue.tsx` (Client Component)
**Purpose**: Interactive approval queue with filtering, sorting, search, and bulk selection
**Responsibilities**:
- Display queue items in responsive grid/list view
- Manage filter state and sync with URL query parameters
- Handle bulk selection (checkboxes, Select All, deselect)
- Real-time queue updates via Server-Sent Events connection
- Optimistic UI updates for approval actions (remove from queue immediately)
- Pagination for large queues (50 items per page, infinite scroll option)
**State Management**: Zustand store for filters and selections, React Query for server data
**Real-Time**: Establishes SSE connection on mount, listens for queue update events, automatically merges new data

#### DocumentReview Component
**File**: `DocumentReview.tsx` (Client Component)
**Purpose**: Complete document review interface with all details, attachments, and approval history
**Responsibilities**:
- Display document header information (requestor, department, dates, description, justification)
- Render line items in expandable table with calculations (subtotals, tax, total)
- Display attached documents with inline preview for PDFs and images (Supabase Storage URLs)
- Show approval history timeline with previous approver comments
- Display budget impact panel (available, requested, remaining)
- Show price variance alerts for procurement items (>15% variance highlighted)
- Display policy violation warnings (missing quotes, budget exceeded, etc.)
- Calculate and display SLA deadline countdown timer
- Provide approval recommendation badge (green/yellow/red based on policy checks)
**Data Fetching**: React Query with prefetching on queue item hover for instant detail view
**Caching**: Aggressive caching (5 minutes) with background refetch for document details

#### ApprovalButtons Component
**File**: `ApprovalButtons.tsx` (Client Component)
**Purpose**: Primary approval action buttons (Approve, Reject, Request More Info, Delegate)
**Responsibilities**:
- Validate user approval authority against document amount (disable if insufficient)
- Disable buttons during submission (prevent double-submit)
- Show loading spinners during async operations
- Open appropriate confirmation modals on click (ApprovalModal, RejectionModal, etc.)
- Display success/error toast notifications after action completion
- Optimistic UI updates (immediately reflect action, rollback on error)
**Security**: Authority validation performed on both client (UX) and server (enforcement)
**Performance**: Debounced button clicks (300ms) to prevent accidental double-approvals

#### ApprovalModal Component
**File**: `ApprovalModal.tsx` (Client Component)
**Purpose**: Confirmation modal for approval action with optional comments
**Responsibilities**:
- Display approval confirmation summary (document ref, amount, budget impact)
- Provide comment textarea (mandatory if policy requires, optional otherwise)
- Validate comment minimum length (20 characters if required)
- Submit approval action via Server Action
- Handle success (close modal, show toast, update queue) or error (display message, keep modal open)
- Support mobile biometric authentication prompt (if enabled)
**Form Handling**: React Hook Form with Zod validation schema for comment validation
**Accessibility**: Focus management (trap focus in modal), Escape key to close, ARIA labels

#### BulkActionsToolbar Component
**File**: `BulkActionsToolbar.tsx` (Client Component)
**Purpose**: Bulk approval action controls displayed when items selected
**Responsibilities**:
- Display selected item count and total amount
- Show bulk action buttons (Bulk Approve, Bulk Reject, Bulk Delegate, Clear Selection)
- Validate bulk action eligibility (same document type, within authority limit)
- Open BulkApprovalModal on Bulk Approve click
- Provide Select All checkbox (selects all filtered items up to 50)
- Handle clear selection action
**State Management**: Zustand store tracks selected item IDs and derives counts/totals
**Validation**: Real-time validation of bulk action eligibility with user-friendly error messages

#### DelegationForm Component
**File**: `DelegationForm.tsx` (Client Component)
**Purpose**: Create new approval delegation form
**Responsibilities**:
- User search/dropdown for delegate selection with authority indicator
- Date/time pickers for delegation period (start and end)
- Delegation scope selection (All Documents, Specific Types, Specific Departments)
- Maximum amount limit input (default to user's authority)
- Delegation reason textarea (mandatory)
- Notes textarea (optional)
- Validation of delegate authority (must be ≥ user authority)
- Validation of date range (end after start, not >90 days)
- Validation of no overlapping delegations
- Submit delegation creation via Server Action
**Form Handling**: React Hook Form with comprehensive Zod validation schema
**User Experience**: Auto-suggest delegation based on calendar integration (if user has out-of-office event)

#### ApprovalHistory Component
**File**: `ApprovalHistory.tsx` (Client Component)
**Purpose**: Visual timeline of approval workflow history
**Responsibilities**:
- Display approval chain with all levels and approvers
- Show each approval/rejection action with timestamp, approver name, and comments
- Display approval duration (time from submission to approval at each level)
- Highlight current approval level and pending approvers
- Show delegation indicators (if approval performed by delegate)
- Display policy overrides with justification
- Provide expandable detail for each approval action
**Visualization**: Vertical timeline with color-coded status (green = approved, red = rejected, yellow = pending)
**Data**: Fetched as part of document detail query, no separate API call

---

## Server Actions

Server Actions provide type-safe, server-side functions for approval operations with built-in validation, error handling, and audit logging.

### approveDocument
**Purpose**: Approve a single document and progress workflow
**Input Parameters**: documentId (UUID), documentType (enum), comments (string, optional), isBiometricAuth (boolean)
**Validation**:
- User authentication and active session
- User approval authority ≥ document amount
- Document status is Pending Approval
- Document at correct approval level for user
- Optimistic locking check (doc_version matches)
- No self-approval (requestor ≠ approver)
**Business Logic**:
- Record approval action in approval_actions table with timestamp, approver, comments
- Update document approval_level_current increment by one
- Determine if final approval level or multi-level progression
- If final approval: update document status to Approved
- If multi-level: update status to Partially Approved, route to next level
- Trigger workflow engine to route to next approver (if applicable)
**Integration Calls** (async, non-blocking):
- Budget System: Confirm budget commitment (soft → hard)
- Inventory System: Create inventory transaction (if stock document)
- Finance System: Post GL journal entry (if finance document)
- Notification Service: Send approval confirmation to requestor
- Audit Service: Log approval action with full context
**Return**: Success object with updated document status or error object with message
**Error Handling**: Transaction rollback on any validation failure, integration errors logged but don't block approval
**Performance**: Completes within 2 seconds (sync portion), integrations async up to 30 seconds

### rejectDocument
**Purpose**: Reject document and terminate workflow
**Input Parameters**: documentId, documentType, rejectionReason (string, mandatory, min 20 chars)
**Validation**:
- User authentication and active session
- Document status is Pending Approval
- Rejection reason not empty and ≥20 characters
- Optimistic locking check
**Business Logic**:
- Record rejection action with reason in approval_actions table
- Update document status to Rejected
- Terminate approval workflow (no further routing)
- Release budget commitment
**Integration Calls** (async):
- Budget System: Release soft commitment
- Workflow Engine: Terminate workflow
- Notification Service: Send rejection notification with reason to requestor
- Audit Service: Log rejection action
**Return**: Success object or error object
**Performance**: Completes within 2 seconds

### requestMoreInfo
**Purpose**: Request additional information from requestor and pause SLA
**Input Parameters**: documentId, documentType, informationRequest (string, mandatory, min 20 chars), responseDeadline (timestamp, optional)
**Validation**:
- User authentication
- Document status is Pending Approval
- Information request not empty and ≥20 characters
**Business Logic**:
- Record information request action in approval_actions table
- Update document status to Awaiting Information
- Pause SLA timer (sla_paused_at timestamp)
- Set response deadline (default: 48 business hours from now)
- Schedule reminder notification 24 hours before deadline
**Integration Calls** (async):
- Workflow Engine: Pause SLA timer
- Notification Service: Send information request email and push to requestor
- Reminder Service: Schedule deadline reminder
**Return**: Success object or error object
**Performance**: Completes within 2 seconds

### bulkApproveDocuments
**Purpose**: Approve multiple documents simultaneously with atomic transaction
**Input Parameters**: documentIds (UUID array, max 50), documentType (enum), comments (string, optional)
**Validation**:
- User authentication
- All documents same type
- All documents in Pending Approval status
- Total amount ≤ user approval authority
- User has authority for each individual document
- No self-approvals in selection
**Business Logic**:
- Begin database transaction (atomic: all succeed or all rollback)
- Validate each document individually
- Record approval action for each document
- Update all document statuses simultaneously
- Determine routing for each document (may route to different next levels)
- Commit transaction if all succeed, rollback if any fail
**Integration Calls** (async, parallel for all documents):
- Budget System: Confirm all budget commitments
- Inventory/Finance Systems: Process transactions for applicable documents
- Workflow Engine: Route each document to next level
- Notification Service: Send individual notifications to each requestor
**Return**: Success object with count of approved documents or partial success with error details
**Error Handling**: If transaction fails, return list of successfully processed and failed documents with reasons
**Performance**: Completes within 5 seconds for 20 documents (sync portion)

### createDelegation
**Purpose**: Create temporary approval delegation to another user
**Input Parameters**: delegateUserId (UUID), startDateTime (timestamp), endDateTime (timestamp), delegationScope (object), maxAmountLimit (decimal), reason (string), notes (string, optional)
**Validation**:
- User authentication
- Delegate user exists and is active
- Delegate approval authority ≥ user authority (or ≥ maxAmountLimit if specified)
- End date/time after start date/time
- Delegation period ≤90 days
- No overlapping delegations to same delegate for same period
- Cannot delegate to self
**Business Logic**:
- Create delegation record with status Scheduled (if future start) or Active (if immediate)
- Schedule delegation activation for start date/time (if future)
- Schedule delegation expiration for end date/time
- If immediate activation: transfer pending approvals to delegate immediately
**Integration Calls** (async):
- Notification Service: Send delegation notification to delegate and user's manager
- Calendar Service: Create calendar event for delegate (if enabled)
**Return**: Success object with delegation ID or error object
**Activation** (background job at start time):
- Update delegation status to Active
- Transfer all pending approvals matching scope to delegate queue
- Route new matching approvals to delegate
**Expiration** (background job at end time):
- Update delegation status to Expired
- Route new approvals back to original user
**Performance**: Creation completes within 2 seconds, activation/expiration within 1 minute

### validateApprovalAuthority
**Purpose**: Validate if user has authority to approve specific document (utility Server Action)
**Input Parameters**: userId (UUID), documentId (UUID), documentAmount (decimal), documentType (enum)
**Validation**: User authentication
**Business Logic**:
- Query approval_authority_matrix for user's authority limits
- Compare document amount against user's limit for document type
- Check if document is self-approval (requestor = user)
- Check if user is assigned approver for current level
- Return validation result with reasons if invalid
**Return**: Object with isValid (boolean), reasons (string array if invalid), userAuthority (decimal)
**Performance**: Completes within 500ms (frequently called, must be fast)

---

## Data Flow

### Approval Queue Loading
1. User navigates to `/procurement/my-approvals`
2. Server Component executes on server (initial page load)
3. Server Component queries approval_queue_items table with filters:
   - WHERE assignee_user_id = current_user_id
   - AND status = 'Pending'
   - AND deleted_at IS NULL
   - ORDER BY submission_timestamp ASC (oldest first)
   - LIMIT 50 OFFSET 0
4. Server Component joins related tables (documents, requestors, departments) for complete item data
5. Server Component passes initial data as props to ApprovalQueue client component
6. Client component hydrates with initial data (fast initial render)
7. Client component establishes SSE connection for real-time updates
8. SSE server pushes queue update events when documents approved/submitted by others
9. Client component merges SSE updates into existing queue data (no full refresh)
10. React Query handles background refetching every 30 seconds as fallback

**Optimization**: Server Component uses parallel queries (Promise.all) to fetch queue items and counts simultaneously

### Document Approval Flow
1. User clicks Approve button on document in queue
2. ApprovalButtons component opens ApprovalModal
3. User enters optional comments and clicks Confirm Approval
4. ApprovalModal triggers optimistic update (removes item from queue immediately for instant feedback)
5. ApprovalModal calls approveDocument Server Action with documentId and comments
6. Server Action executes on server:
   - Validates user authority against document amount
   - Validates document status and optimistic locking
   - Records approval in approval_actions table (timestamp, approver, comments)
   - Updates document approval level and status
   - Determines next approval level or final approval
7. Server Action triggers async integration processes (Budget, Inventory, Finance, Notification)
8. Server Action returns success response to client
9. ApprovalModal closes and shows success toast
10. ApprovalQueue removes item from local state (already removed optimistically)
11. SSE pushes queue update event to other approvers (document removed from their queues if no longer pending)
12. Async integrations complete in background (Budget commitment, Inventory transaction, GL posting)

**Error Recovery**: If Server Action fails, optimistic update is rolled back (item re-added to queue) and error toast displayed

### Real-Time Queue Updates (Server-Sent Events)
1. ApprovalQueue component establishes SSE connection on mount: `/api/approvals/sse?userId={userId}`
2. SSE endpoint validates user authentication and returns event stream
3. Server monitors approval_queue_items table for changes relevant to user
4. When document enters user's queue (new submission, routing from previous level):
   - Server pushes "approval_added" event with document summary
   - Client component receives event and adds item to queue state
5. When document leaves user's queue (approved by user, recalled by requestor):
   - Server pushes "approval_removed" event with document ID
   - Client component receives event and removes item from queue state
6. When document metadata changes (requestor adds attachments, updates description):
   - Server pushes "approval_updated" event with updated document data
   - Client component receives event and updates matching item in queue state
7. When delegation activated/expired:
   - Server pushes "delegation_changed" event with delegation details
   - Client component receives event and refetches queue with new scope
8. SSE connection automatically reconnects on network interruption (exponential backoff)
9. Client component unsubscribes and closes SSE connection on unmount

**Scalability**: SSE server uses pub/sub pattern (Redis Pub/Sub or Supabase Realtime) to distribute events across multiple server instances

### Bulk Approval Flow
1. User selects multiple documents (up to 50) using checkboxes
2. BulkActionsToolbar displays selected count and total amount
3. User clicks Bulk Approve button
4. BulkApprovalModal displays confirmation with summary (count, total, document types)
5. User enters optional bulk comments and confirms
6. BulkApprovalModal triggers optimistic update (removes all selected items from queue)
7. BulkApprovalModal calls bulkApproveDocuments Server Action with documentIds array
8. Server Action executes atomic transaction:
   - Validates each document individually
   - Records approval action for each
   - Updates all document statuses together
   - Commits or rolls back entire transaction
9. Server Action triggers parallel async integrations for each document
10. Server Action returns success response with count of approved documents
11. BulkApprovalModal displays success message with count
12. ApprovalQueue removes items from local state (already removed optimistically)
13. SSE pushes batch update event to other users

**Error Handling**: If any document fails validation, entire transaction rolls back and error details returned

---

## Integration Points

### Internal System Integrations

#### Workflow Engine
**Purpose**: Orchestrate approval routing and level progression
**Integration Type**: Internal module (direct Prisma queries and function calls)
**Key Operations**:
- **Route to Next Level**: Determine next approver based on workflow configuration and document amount
- **Terminate Workflow**: Mark workflow complete on final approval or rejection
- **Pause/Resume SLA**: Control SLA timer when information requested or document recalled
**Data Flow**: Approval Service → Workflow Engine → approval_queue_items table update
**Error Handling**: If routing fails, approval still recorded but manual routing required

#### Notification Service
**Purpose**: Send approval notifications across multiple channels
**Integration Type**: Internal service (API calls to notification endpoints)
**Key Operations**:
- **Send Approval Request**: Email, push, SMS to approver when document enters queue
- **Send Approval Confirmation**: Email and push to requestor when document approved
- **Send Rejection Notification**: Email to requestor with rejection reason
- **Send Escalation Alert**: Email to manager when approval overdue
**Data Flow**: Server Action → Notification Service → Email/Push Gateway
**Channels**: Email (SMTP), Push (FCM/APNS), SMS (Twilio), In-App (SSE)
**Error Handling**: Notification failures logged but don't block approval action

#### Budget Management System
**Purpose**: Manage budget commitments and availability
**Integration Type**: Internal module (Prisma queries to budget tables)
**Key Operations**:
- **Create Soft Commitment**: Reserve budget on document submission (before approval)
- **Confirm Hard Commitment**: Convert soft to hard commitment on approval
- **Release Commitment**: Remove budget reservation on rejection or cancellation
- **Check Availability**: Validate budget available before approval
**Data Flow**: Approval Service → Budget Service → budget_commitments table
**Transaction**: Budget operations executed within same transaction as approval action
**Error Handling**: Budget failure blocks approval and returns error to user

#### Inventory Management System
**Purpose**: Create inventory transactions on approval of stock-related documents
**Integration Type**: Internal module (Prisma queries and stored procedure calls)
**Key Operations**:
- **Create Stock Movement**: Generate inventory transaction for wastage, adjustments, transfers
- **Update Stock Levels**: Adjust on-hand quantities based on approved transaction
- **Update Inventory Value**: Recalculate inventory valuation using costing method
**Data Flow**: Approval Service (async) → Inventory Service → inventory_transactions table
**Transaction**: Inventory operations executed asynchronously (don't block approval)
**Error Handling**: Inventory creation failures logged, flagged for manual processing, user notified

#### Finance System (General Ledger)
**Purpose**: Post GL journal entries on approval of finance-impacting documents
**Integration Type**: Internal module (Prisma queries to GL tables)
**Key Operations**:
- **Post Journal Entry**: Create debit and credit entries for approved transaction (e.g., DR: Wastage Expense, CR: Inventory)
- **Post to Period**: Ensure entry posted to correct accounting period
- **Update Trial Balance**: Reflect GL entry in period trial balance
**Data Flow**: Approval Service (async) → Finance Service → gl_journal_entries table
**Transaction**: GL posting executed asynchronously after approval committed
**Error Handling**: GL posting failures logged, flagged for manual entry, Finance team notified

#### Audit Logging Service
**Purpose**: Record all approval actions for compliance and forensics
**Integration Type**: Internal service (API calls to audit endpoints)
**Key Operations**:
- **Log Approval Action**: Record approval with full context (approver, timestamp, IP, comments)
- **Log Rejection Action**: Record rejection with reason
- **Log Policy Override**: Flag approval that violated policy with justification
- **Log Delegation**: Record delegation creation, activation, expiration
**Data Flow**: Server Action → Audit Service → audit_trail table (append-only)
**Storage**: Immutable append-only log with cryptographic hash chain
**Retention**: 7 years minimum for regulatory compliance

### External System Integrations

#### Email Service (SMTP)
**Purpose**: Deliver approval notification emails
**Integration Type**: External service (SMTP protocol via Nodemailer)
**Configuration**: SMTP server, port, username, password from environment variables
**Templates**: HTML email templates for approval requests, confirmations, rejections, escalations
**Error Handling**: Retry 3 times with exponential backoff, log failures, fallback to push notification
**Rate Limiting**: Maximum 100 emails per minute per user to prevent spam

#### Mobile Push Service (FCM / APNS)
**Purpose**: Deliver real-time push notifications to mobile devices
**Integration Type**: External service (Firebase Cloud Messaging for Android, Apple Push Notification Service for iOS)
**Configuration**: FCM API key, APNS certificate from environment variables
**Payload**: Notification title, body, data payload with document ID for deep linking
**Error Handling**: Retry once on network failure, log failures, update device token if invalid
**Batching**: Batch push notifications for same user (max 5 per batch) to avoid notification spam

#### SMS Gateway (Twilio)
**Purpose**: Send SMS notifications for critical high-value approvals
**Integration Type**: External service (Twilio API via REST)
**Configuration**: Twilio Account SID, Auth Token, Phone Number from environment variables
**Trigger**: Approval requests >$50,000 automatically trigger SMS
**Error Handling**: Retry once, log failures, fallback to email if SMS unavailable
**Cost Management**: SMS sent only for critical approvals to minimize costs

#### Calendar Integration (Google Calendar / Outlook)
**Purpose**: Auto-suggest delegation based on out-of-office calendar events
**Integration Type**: External service (Google Calendar API, Microsoft Graph API)
**Configuration**: OAuth 2.0 credentials for calendar access (optional integration)
**Operations**:
- Query user's calendar for out-of-office events
- Suggest delegation setup if upcoming absence detected
- Create calendar event for delegate (optional)
**Error Handling**: Calendar integration is optional; failures don't block delegation creation

---

## State Management

### Global State (Zustand Store)
**Store**: approval-store.ts
**State Shape**:
- selectedDocumentIds: Set of UUIDs for bulk selection
- activeFilters: Object containing filter values (documentType, priority, dateRange, etc.)
- sortConfig: Object with field and direction (submission_timestamp ASC)
- viewMode: 'grid' or 'list'
- notificationCount: Number of unread in-app notifications
**Actions**:
- toggleSelection(id): Add or remove document from selection
- selectAll(ids): Add all filtered document IDs to selection
- clearSelection(): Remove all selections
- updateFilters(filters): Update active filters and sync to URL
- setSort(field, direction): Update sort configuration

**Persistence**: activeFilters and sortConfig persisted to localStorage for user preference retention

### Server State (React Query)
**Query Keys**: Hierarchical structure for caching and invalidation
- ['approvalQueue', userId, filters, sort, page] - Approval queue data
- ['documentDetail', documentId] - Document detail with relations
- ['delegations', userId] - Active and past delegations
- ['approvalMetrics', userId, dateRange] - Approval analytics metrics

**Cache Configuration**:
- Approval queue: 30-second staleTime, 5-minute cacheTime, background refetch on window focus
- Document detail: 5-minute staleTime, 10-minute cacheTime, prefetch on queue item hover
- Delegations: 1-minute staleTime, 5-minute cacheTime
- Approval metrics: 5-minute staleTime, 15-minute cacheTime

**Invalidation Strategy**:
- On approval action: Invalidate ['approvalQueue'] and ['documentDetail', documentId]
- On delegation creation: Invalidate ['delegations', userId]
- On filter change: Invalidate ['approvalQueue'] with new filter parameters
- On SSE update: Merge new data into existing cache without full refetch

### Form State (React Hook Form)
**Forms**: ApprovalModal, RejectionModal, InfoRequestModal, DelegationForm
**Validation**: Zod schemas for runtime validation matching server-side validation
**State Shape**: Form fields, validation errors, submission status, dirty state
**Optimization**: Uncontrolled inputs for performance, validation on blur and submit

---

## Security

### Authentication & Authorization
**Authentication**: Supabase Auth with JWT tokens stored in httpOnly secure cookies
**Session Management**: 30-minute inactivity timeout, sliding session renewal on activity
**Authorization**: Row-Level Security (RLS) policies enforce approval scope at database level

**RLS Policies** (applied to approval_queue_items table):
- **SELECT Policy**: User can only see documents where assignee_user_id = auth.uid() OR (delegation active AND delegate_user_id = auth.uid())
- **UPDATE Policy**: User can update approval actions only on documents they are authorized to approve
- **INSERT Policy**: System only (users cannot insert queue items directly)
- **DELETE Policy**: System only (soft delete via updated_at timestamp)

**Authority Validation**:
- Client-side: Disable buttons if insufficient authority (UX improvement)
- Server-side: Enforce authority validation in Server Actions (security enforcement)
- Database-level: CHECK constraints on approval amounts
- Audit: All authority violations logged in audit trail

### Data Protection
**Encryption at Rest**: PostgreSQL database encrypted with AES-256 (Supabase managed)
**Encryption in Transit**: All API calls use TLS 1.3 (HTTPS only)
**Sensitive Data**: Approval comments and rejection reasons encrypted before storage
**PII Protection**: Requestor email and phone numbers masked in logs

### Input Validation & Sanitization
**Client-Side**: Zod validation schemas prevent invalid data submission
**Server-Side**: All Server Action inputs validated with Zod schemas before processing
**SQL Injection Prevention**: Prisma ORM with parameterized queries (no raw SQL)
**XSS Prevention**: React's automatic escaping, Content Security Policy headers, sanitize HTML in comments
**CSRF Protection**: Next.js built-in CSRF protection for Server Actions

### Audit Trail
**Immutability**: Approval actions recorded in append-only audit_trail table (no updates or deletes)
**Completeness**: Every approval action logged with approver, timestamp, IP address, device info, comments
**Integrity**: Cryptographic hash chain ensures audit trail tamper-evidence
**Retention**: 7-year retention for regulatory compliance
**Access Control**: Audit trail read-only except for system processes and authorized auditors

---

## Performance Optimization

### Client-Side Optimization
**Code Splitting**: Lazy load heavy components (DocumentReview, ApprovalModal) with React.lazy and Suspense
**Bundle Optimization**: Separate vendor chunks, tree-shaking unused code
**Image Optimization**: Next.js Image component with automatic WebP conversion and responsive sizing
**Memoization**: React.memo for expensive list components, useMemo for calculated values
**Virtualization**: Infinite scroll with react-window for queues >100 items

### Server-Side Optimization
**Database Query Optimization**:
- Indexes on approval_queue_items (assignee_user_id, status, submission_timestamp) for fast queue loading
- Materialized views for approval metrics (pre-aggregated data, refresh every 5 minutes)
- Parallel queries with Promise.all for independent data fetching
- Pagination with cursor-based navigation (more efficient than OFFSET)

**Caching Strategy**:
- Server Component cache: ISR with 30-second revalidation for common filter combinations
- React Query cache: Aggressive client-side caching with background refetch
- API route cache: Cache-Control headers for static data (approval configurations)

**Async Processing**:
- Integration calls (Budget, Inventory, Finance) executed asynchronously via message queue
- Background jobs for SLA monitoring, escalation, daily digests run on schedule
- Email and push notifications sent via async job queue (don't block approval action)

### Real-Time Optimization
**Server-Sent Events**: More efficient than WebSocket for one-way server-to-client updates
**Event Filtering**: Server filters events by user ID before pushing (don't broadcast all events)
**Event Batching**: Batch multiple queue updates into single SSE message if within 100ms window
**Connection Pooling**: Reuse database connections across SSE sessions

### Database Optimization
**Connection Pooling**: Prisma connection pool (10-20 connections) for efficient resource usage
**Transaction Isolation**: Read Committed isolation level for approval transactions (balance consistency and performance)
**Materialized Views**: Pre-aggregate approval metrics for fast analytics queries
**Partitioning**: Partition approval_queue_items table by month for archival and query performance

---

## Error Handling

### Client-Side Error Handling
**Error Boundaries**: React Error Boundaries around major sections (ApprovalQueue, DocumentReview)
**Toast Notifications**: User-friendly error messages for failed actions
**Retry Mechanisms**: Automatic retry (1 time) for network failures, manual retry button for user-initiated retry
**Fallback UI**: Graceful degradation if real-time updates unavailable (fall back to manual refresh)

### Server-Side Error Handling
**Validation Errors**: Return structured error objects with field-level errors for form validation
**Business Logic Errors**: Return user-friendly error messages (e.g., "Insufficient approval authority")
**Integration Errors**: Log detailed error context, return generic user message, flag for manual resolution
**Database Errors**: Transaction rollback on failure, log full stack trace, return safe error message to user

### Monitoring & Alerting
**Error Tracking**: Sentry integration captures all unhandled errors with context (user, session, request)
**Performance Monitoring**: Vercel Analytics tracks page load times, API response times, Core Web Vitals
**Logging**: Structured JSON logging with log levels (info, warn, error), log aggregation with LogTail
**Alerting**: Automatic alerts for critical errors (approval failures, integration timeouts, high error rates)

---

## Testing Strategy

### Unit Tests (Vitest)
**Coverage Targets**: 80% code coverage for business logic services
**Test Files**:
- `approval-service.test.ts` - Approval business logic (authority validation, workflow routing)
- `delegation-service.test.ts` - Delegation creation, activation, expiration logic
- `sla-service.test.ts` - SLA calculation, escalation triggers
- Component tests for key UI components (ApprovalQueue, DocumentReview, ApprovalButtons)

**Mocking**: Mock database queries (Prisma), mock integration API calls, mock Server Actions

### Integration Tests (Vitest + Test Database)
**Test Database**: Separate PostgreSQL database seeded with test data
**Test Scenarios**:
- End-to-end approval workflow (submit → approve → route → final approval)
- Bulk approval transaction (atomic success or rollback)
- Delegation workflow (create → activate → transfer approvals → expire)
- SLA escalation (overdue approval triggers escalation notification)

**Test Data**: Factory functions for creating test users, documents, approvals, delegations

### E2E Tests (Playwright)
**Critical User Workflows**:
- UC-APPR-001: View Approval Queue (load, filter, search, sort)
- UC-APPR-002: Review and Approve Document (complete flow from queue to approval confirmation)
- UC-APPR-003: Reject Document with Reason
- UC-APPR-005: Bulk Approve Documents (select multiple, bulk approve, verify success)
- UC-APPR-006: Setup Approval Delegation (create delegation, verify activation)

**Test Environment**: Staging environment with production-like data and integrations

**Assertions**: Visual regression testing (screenshots), accessibility testing (WCAG 2.1 AA compliance)

---

## Deployment

### Build Process
**Next.js Build**: Static generation for public pages, server-side rendering for dynamic pages
**Environment Variables**: Separate .env files for development, staging, production
**Build Artifacts**: Optimized JavaScript bundles, static assets (images, fonts), server functions

### Deployment Pipeline (GitHub Actions → Vercel)
1. **Pull Request**: Lint, type check, unit tests run on PR creation
2. **Preview Deployment**: Automatic Vercel preview deployment for PR review
3. **Merge to Main**: Full test suite (unit, integration, E2E) runs on merge
4. **Production Deployment**: Automatic deployment to Vercel production on main branch push
5. **Post-Deployment**: Smoke tests verify critical workflows, rollback if failures detected

### Environment Configuration
**Development**: Local PostgreSQL database, mock external services, debug logging enabled
**Staging**: Supabase staging database, real external service integrations (test accounts), info logging
**Production**: Supabase production database, real external services, warn logging, Sentry error tracking

### Monitoring & Rollback
**Monitoring**: Vercel Analytics, Sentry error tracking, uptime monitoring (UptimeRobot)
**Rollback**: Instant rollback via Vercel dashboard if deployment issues detected
**Feature Flags**: LaunchDarkly for gradual feature rollout and kill switches

---

## Glossary

- **Approval Authority**: The maximum transaction value a user is authorized to approve
- **Approval Level**: A step in multi-level approval workflow
- **Atomic Transaction**: Database transaction where all operations succeed together or all fail together
- **Optimistic Update**: UI update performed immediately before server confirmation (rolled back on error)
- **Row-Level Security (RLS)**: PostgreSQL security policies enforcing data access at row level
- **Server Actions**: Type-safe server functions callable from client components
- **Server Component**: React component rendered on server with direct database access
- **Server-Sent Events (SSE)**: HTTP protocol for real-time server-to-client push updates
- **Soft Commitment**: Budget reservation created on document submission (before approval)
- **Hard Commitment**: Budget reservation confirmed on document approval

---

## Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| **Business Owner** | | | |
| **Solution Architect** | | | |
| **Development Lead** | | | |
| **QA Lead** | | | |
| **Security Officer** | | | |

---

**Document Status**: Draft - Awaiting Review
**Next Review Date**: 2025-11-19
**Document Classification**: Internal Use Only
