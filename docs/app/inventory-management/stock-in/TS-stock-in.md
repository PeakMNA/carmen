# Technical Specification: Stock In

## Module Information
- **Module**: Inventory Management
- **Sub-Module**: Stock In
- **Route**: `/inventory-management/stock-in`
- **Version**: 1.0.0
- **Last Updated**: 2025-01-11
- **Owner**: Inventory Management Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-01-11 | System | Initial version |

---

## Overview

This document provides the technical specification for the Stock In sub-module, describing implementation patterns, architecture, technology stack, component structure, data flows, and integration approaches. This specification is descriptive (what needs to be built) rather than prescriptive (how to code it), allowing developers flexibility in implementation details while maintaining architectural consistency.

**Related Documents**:
- [Business Requirements](./BR-stock-in.md)
- [Use Cases](./UC-stock-in.md)
- [Data Definition](./DD-stock-in.md)
- [Flow Diagrams](./FD-stock-in.md)
- [Validations](./VAL-stock-in.md)

---

## Architecture Overview

### Three-Tier Architecture

**Client Layer (Presentation)**:
- **React Server Components (RSC)**: Default for pages and data-fetching components
- **Client Components**: Used selectively for interactivity (marked with 'use client')
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **State Management**: Zustand for global UI state, React Query for server state caching
- **Local Storage**: Browser localStorage for auto-save backup and offline resilience

**Application Layer (Business Logic)**:
- **Server Actions**: Next.js 14+ server actions for form mutations and state changes (eliminates separate API routes)
- **Business Logic Services**: Validation, calculation, and orchestration logic
- **Integration Services**: API clients for Inventory Valuation Service, Finance Module, source document modules
- **Authentication & Authorization**: Row-Level Security (RLS) with role-based permissions

**Data Layer (Persistence)**:
- **PostgreSQL 14+**: Primary relational database with ACID transactions
- **Prisma ORM 5.8+**: Type-safe database access layer with migrations
- **Cloud Storage (AWS S3 or equivalent)**: Secure file storage for attachments with encryption at rest
- **Redis (optional)**: Caching layer for session data and frequently-accessed reference data

### Technology Stack

**Frontend**:
- **Framework**: Next.js 14.2+ with App Router
- **Language**: TypeScript 5.8+ (strict mode enabled)
- **Styling**: Tailwind CSS 3.4+ with custom design system
- **UI Components**: Shadcn/ui (Radix UI + Tailwind)
- **Icons**: Lucide React
- **Forms**: React Hook Form 7.50+ with Zod 3.22+ validation
- **State**: Zustand 4.5+ (global), React Query 5.0+ (server state)
- **Date Utilities**: date-fns 3.0+
- **HTTP Client**: Native fetch API with retry logic

**Backend**:
- **Runtime**: Node.js 20.14.0+
- **Database**: PostgreSQL 14+ with pg driver
- **ORM**: Prisma 5.8+
- **API Integration**: REST clients with OAuth 2.0 authentication
- **File Storage**: AWS SDK for S3 or compatible object storage
- **Session**: NextAuth.js or custom JWT-based auth

**Development Tools**:
- **Testing**: Vitest for unit/integration tests
- **Linting**: ESLint with Next.js config
- **Formatting**: Prettier
- **Type Checking**: TypeScript compiler (tsc)
- **Version Control**: Git with conventional commits

---

## Component Structure

### File Organization

```
app/(main)/inventory-management/stock-in/
├── page.tsx                          # List page (Server Component)
├── [id]/
│   ├── page.tsx                      # Detail page (Server Component)
│   ├── edit/
│   │   └── page.tsx                  # Edit mode page
│   └── actions.ts                    # Server actions for detail operations
├── new/
│   └── page.tsx                      # Create new transaction page
├── components/
│   ├── StockInList.tsx               # Transaction list with search/filter (Client)
│   ├── StockInDetail.tsx             # Transaction detail view
│   ├── TransactionHeader.tsx         # Header form section
│   ├── LineItemGrid.tsx              # Line items table (Client)
│   ├── LineItemDialog.tsx            # Add/edit line item modal (Client)
│   ├── ProductSelector.tsx           # Product search/selection component (Client)
│   ├── CommentsSection.tsx           # Comments display and entry (Client)
│   ├── AttachmentsSection.tsx        # File upload and display (Client)
│   ├── ActivityLog.tsx               # Activity history timeline
│   ├── MovementHistory.tsx           # Movement records table
│   ├── StatusBadge.tsx               # Status indicator component
│   └── TypeBadge.tsx                 # Transaction type badge
├── hooks/
│   ├── useStockInForm.ts             # Form state management hook
│   ├── useAutoSave.ts                # Auto-save logic with retry
│   ├── useLineItems.ts               # Line item CRUD operations
│   ├── useInventoryInfo.ts           # Real-time inventory data fetching
│   └── useCommit.ts                  # Commit orchestration logic
├── lib/
│   ├── validations.ts                # Zod schemas for validation
│   ├── calculations.ts               # Business calculation functions (totals, etc.)
│   ├── api-clients/
│   │   ├── valuation-service.ts      # Inventory Valuation Service client
│   │   ├── finance-service.ts        # Finance Module GL API client
│   │   └── product-service.ts        # Product Master API client
│   └── utils.ts                      # Utility functions
├── actions.ts                        # Server actions for list operations
└── types.ts                          # TypeScript type definitions
```

### Key Components

**StockInList.tsx** (Client Component):
- Purpose: Display paginated list of stock in transactions with search, filter, and bulk operations
- State: Search term, filters, pagination, selection state
- Data Fetching: React Query for server state, debounced search
- Features: Multi-select, bulk actions (commit, void, export), responsive table

**StockInDetail.tsx** (Client/Server Hybrid):
- Purpose: Main transaction detail view with header, line items, comments, attachments, activity log
- Props: Transaction ID, mode (view/edit)
- Composition: Combines multiple sub-components (TransactionHeader, LineItemGrid, CommentsSection, etc.)
- Features: Tab navigation, conditional rendering based on status, action buttons (commit, void, reverse)

**LineItemGrid.tsx** (Client Component):
- Purpose: Editable grid for transaction line items with real-time validation
- State: Line items array, selected row, edit mode
- Features: Add/edit/delete rows, inline validation, inventory info popover, quantity/cost calculations
- Integration: Calls Product Master API for product details and inventory balances

**useAutoSave Hook**:
- Purpose: Custom hook implementing 30-second auto-save with retry logic and local storage backup
- Logic: Debounce changes, detect unsaved state, trigger save API, handle failures with exponential backoff
- State: Last saved timestamp, save status (saving/saved/error), retry count
- Persistence: Falls back to browser localStorage on network failure

---

## Page Structure and Routing

### App Router Pages

**List Page** (`/inventory-management/stock-in`):
- Server Component rendering initial transaction list (last 30 days)
- Pre-fetches reference data (locations, transaction types)
- Hydrates client component (StockInList) with server data
- Implements search params for filter persistence

**Detail View Page** (`/inventory-management/stock-in/[id]`):
- Server Component fetches transaction by ID with all related data
- Determines mode (view/edit) based on status and user permissions
- Passes data to client component for interactivity
- Handles not found (404) and unauthorized (403) errors

**Create Page** (`/inventory-management/stock-in/new`):
- Initializes empty transaction form with defaults
- Pre-fills transaction date (today) and location (user's default)
- Renders in edit mode with save/cancel actions

**Edit Page** (`/inventory-management/stock-in/[id]/edit`):
- Redirects to detail page if transaction not in "Saved" status
- Otherwise renders editable form with existing data

### Sitemap

```
/inventory-management/stock-in
├── /                                 # List page (all transactions)
├── /new                              # Create new transaction
├── /[id]                             # View transaction detail
│   ├── ?mode=view                    # View mode (default for Committed/Void)
│   ├── ?mode=edit                    # Edit mode (only for Saved)
│   └── /edit                         # Direct edit route (redirects if not Saved)
└── /bulk-commit                      # Bulk commit confirmation page (future)
```

---

## Data Flows

### Create Transaction Flow

1. **User initiates**: Click "Add New" on list page
2. **Navigate to /new**: Server renders create page with empty form
3. **User fills form**: Enter transaction type, date, location, related document, description
4. **Client validates**: React Hook Form validates using Zod schema
5. **Submit form**: Server action `createStockInTransaction` called
6. **Server validates**: Re-validate on server, check permissions, validate related document
7. **Generate ref number**: Call `generateReferenceNumber` function (STK-IN-YYMM-NNNN)
8. **Create record**: Prisma transaction creates stock_in_transaction row with status = 'Saved'
9. **Create activity log**: Insert activity_log entry: "Created by {user}"
10. **Return success**: Return transaction ID and reference number
11. **Navigate to detail**: Redirect to `/inventory-management/stock-in/[id]` for line item entry
12. **Show success message**: Toast notification "Transaction STK-IN-2501-0123 created"

### Add Line Items Flow

1. **User on detail page**: Transaction in Saved status
2. **Click "Add Product"**: Open product selection dialog
3. **Search products**: API call to Product Master `/api/products?search={term}`
4. **Select product**: Product details loaded (code, name, available units)
5. **Fill line item form**: Qty, unit, destination location, comment
6. **Client validates**: Zod schema validation (qty > 0, unit valid for product)
7. **Submit**: Call server action `addLineItem`
8. **Server creates**: Prisma insert into stock_in_item table
9. **Fetch inventory info**: Call Product API to get on-hand, reorder point, etc.
10. **Calculate totals**: Update transaction totalQty = SUM(line item qtys)
11. **Return updated data**: Line item with inventory context returned
12. **Update UI**: Line item added to grid, total quantity updated
13. **Auto-save triggered**: useAutoSave hook schedules save in 30 seconds

### Commit Transaction Flow

1. **User clicks Commit**: Confirm dialog displayed with summary
2. **User confirms**: Call server action `commitStockInTransaction`
3. **Server validates**: Check status = Saved, has line items, user has commit permission
4. **Begin DB transaction**: START TRANSACTION (Prisma transaction)
5. **Calculate costs**: For each line item:
   - Call Inventory Valuation Service API `/api/valuation/calculate-cost`
   - Receive unit cost and calculation method (FIFO or Periodic Average)
   - Update line item with cost data (4 decimal precision)
6. **Update inventory balances**: For each line item:
   - SELECT inventory_balance WHERE product_id AND location_id FOR UPDATE (row lock)
   - Calculate new balance: on_hand_qty += line_item.qty
   - UPDATE inventory_balance SET on_hand_qty, updated_at, updated_by
   - Check "allow negative inventory" setting if applicable
7. **Create movement history**: For each line item:
   - INSERT INTO stock_movement (commit_date, location, product, stock_in_qty, stock_out_qty = 0, amount, reference)
8. **Post to GL**: Call Finance Module API `/api/gl/journal-entry`
   - Debit: Inventory Asset, Credit: AP/Variance/Transfer Account
   - Receive JE number (e.g., JE-2401-5678)
9. **Update transaction**: SET status = 'Committed', commit_date = NOW(), committed_by = user_id, gl_journal_entry_number
10. **Create activity log**: "Committed by {user} on {date/time}. GL Entry: {JE number}"
11. **Commit DB transaction**: COMMIT TRANSACTION
12. **Return success**: Transaction data with Committed status
13. **Update UI**: Show Committed badge, disable edit actions, display GL entry number
14. **Show success message**: "Transaction committed. Inventory updated. GL Entry: JE-2401-5678"

**Rollback Scenarios**:
- If any step fails (cost calculation, balance update, GL posting): ROLLBACK TRANSACTION
- Return error to user with specific failure reason
- Transaction remains in Saved status for correction and retry

### Search and Filter Flow

1. **User enters search term**: Debounced 300ms
2. **Client sends request**: React Query hook triggers server action `searchStockInTransactions`
3. **Server builds query**: Prisma where clause with:
   - Search: `OR` conditions on refNo, location.name, description (case-insensitive LIKE)
   - Filters: `AND` conditions for type, status, date range, location
   - User access: `AND location_id IN (user accessible locations)`
4. **Execute query**: Prisma findMany with pagination (skip/take)
5. **Count total**: Prisma count with same where clause for pagination info
6. **Return results**: Array of transactions with pagination metadata
7. **Update UI**: Display filtered results, update pagination controls, show count

### Auto-Save Flow

1. **User edits field**: onChange triggers state update in form
2. **Mark as dirty**: Set hasUnsavedChanges = true
3. **Start/reset timer**: 30-second countdown begins/resets
4. **Timer expires**: useAutoSave hook triggers
5. **Check dirty flag**: If hasUnsavedChanges = true, proceed
6. **Prepare payload**: Extract changed fields from form state
7. **Call server action**: `autoSaveStockInTransaction(transactionId, changes)`
8. **Server updates**: Prisma update with optimistic concurrency check (check updated_at hasn't changed)
9. **Success response**: Return updated transaction with new updated_at timestamp
10. **Update state**: Clear hasUnsavedChanges, update lastSavedAt, show "✓ Saved" indicator
11. **Failure handling**:
    - Network error: Store data in localStorage, display warning, schedule retry (10s, 20s, 40s)
    - Optimistic lock failure: Reload transaction, display conflict message, offer merge options
    - Validation error: Display inline errors, do not retry (requires user correction)

---

## State Management

### Global State (Zustand Store)

**Purpose**: Share UI state across components without prop drilling

**Store Structure**:
```
inventoryStore:
  - currentLocation: User's active location (used for filtering and defaults)
  - selectedTransactions: Array of selected transaction IDs for bulk operations
  - filterPresets: Saved filter configurations
  - uiPreferences: User preferences (page size, column visibility, etc.)
```

**Usage Pattern**: Import `useInventoryStore` hook in components, selectors for performance

### Server State (React Query)

**Purpose**: Cache, synchronize, and manage server data with automatic background refetching

**Queries**:
- `useStockInList`: Fetch paginated transaction list with filters
- `useStockInDetail`: Fetch single transaction with all related data
- `useProductSearch`: Search products for line item selection
- `useInventoryBalance`: Fetch real-time inventory balances for product/location
- `useLocations`: Fetch user's accessible locations (cached, stale time 10 minutes)

**Mutations**:
- `useCreateStockIn`: Create new transaction, invalidates list query
- `useUpdateStockIn`: Update transaction fields, invalidates detail query
- `useCommitStockIn`: Commit transaction, invalidates list and detail queries
- `useAddLineItem`: Add line item, invalidates detail query, updates optimistically

**Configuration**:
- Stale time: 30 seconds (refetch after this period if window refocused)
- Cache time: 5 minutes (keep unused data in cache)
- Retry: 3 attempts with exponential backoff for failed requests
- Refetch on window focus: Enabled for list views, disabled for detail forms

### Local State (React useState/useReducer)

**Purpose**: Component-specific state that doesn't need to be shared

**Examples**:
- Form field values (managed by React Hook Form)
- Dialog open/close state
- Local loading indicators
- UI interaction state (expanded rows, selected items)

### Form State (React Hook Form)

**Purpose**: Manage complex form state with validation and performance optimization

**Configuration**:
- Mode: onChange (validate on every change)
- Resolver: zodResolver (Zod schema validation)
- DefaultValues: Pre-filled from server data or empty for new transactions
- Errors: Display inline with field highlighting

---

## API Integration

### Inventory Valuation Service Integration

**Purpose**: Calculate transaction costs using centralized costing logic (FIFO or Periodic Average)

**Endpoint**: `POST /api/valuation/calculate-cost`

**Authentication**: OAuth 2.0 Bearer token (service-to-service)

**Request Format**:
```
POST /api/valuation/calculate-cost
Authorization: Bearer {token}
Content-Type: application/json

{
  "transactionDate": "2024-01-15",
  "operation": "STOCK_IN",
  "lineItems": [
    {
      "lineItemId": "uuid",
      "productId": "uuid",
      "locationId": "uuid",
      "quantity": 200,
      "unitId": "uuid"
    },
    ...
  ]
}
```

**Response Format**:
```
{
  "success": true,
  "costData": [
    {
      "lineItemId": "uuid",
      "productId": "uuid",
      "unitCost": 85.5000,
      "totalCost": 17100.0000,
      "calculationMethod": "FIFO",
      "costLayerId": "uuid",
      "calculationDate": "2024-01-15T11:00:00Z"
    },
    ...
  ]
}
```

**Error Handling**:
- 400 Bad Request: Validation error, display specific field errors
- 401 Unauthorized: Token expired, refresh and retry
- 404 Not Found: Product not in costing system, display error
- 429 Too Many Requests: Rate limited, retry with exponential backoff
- 500/503 Service Error: Service unavailable, retry up to 3 times, then fail commit with user-friendly error

**Timeout**: 5 seconds per request, 15 seconds total with retries

**Retry Policy**: 3 attempts with exponential backoff (1s, 2s, 4s)

### Finance Module (GL Posting) Integration

**Purpose**: Post inventory movements to General Ledger

**Endpoint**: `POST /api/gl/journal-entry`

**Authentication**: Service-to-service JWT token

**Request Format**:
```
{
  "transactionDate": "2024-01-15",
  "referenceNumber": "STK-IN-2401-0123",
  "description": "Stock In - GRN-2401-0001",
  "sourceModule": "Inventory Management",
  "sourceTransactionId": "uuid",
  "lines": [
    {
      "accountCode": "1200",
      "accountName": "Inventory Asset",
      "debit": 17100.00,
      "credit": 0,
      "locationCode": "WH-MAIN",
      "costCenter": "CC-001",
      "departmentCode": "INV"
    },
    {
      "accountCode": "2100",
      "accountName": "Accounts Payable",
      "debit": 0,
      "credit": 17100.00,
      "vendorId": "VEN-001"
    }
  ],
  "idempotencyKey": "stock-in-uuid-commit-timestamp"
}
```

**Response Format**:
```
{
  "success": true,
  "journalEntryNumber": "JE-2401-5678",
  "postingDate": "2024-01-15T11:00:00Z",
  "status": "Posted",
  "lines": [...]  // Echo back lines with generated IDs
}
```

**Error Handling**:
- 400 Bad Request: Validation error (unbalanced entry, invalid account), display to user
- 403 Forbidden: Period closed, display error and suggest date change
- 409 Conflict: Duplicate posting (idempotency key collision), treat as success if JE number matches
- 500 Service Error: GL system unavailable, rollback inventory changes, fail commit

**Timeout**: 10 seconds

**Retry Policy**: 2 attempts with 2-second delay

**Idempotency**: Each request includes unique idempotency key to prevent duplicate postings on retry

### Source Document Integration

**Purpose**: Link stock in transactions to originating documents (GRN, Transfer, Issue, Adjustment, Credit Note)

**Approach**: Module-to-module API calls or shared database access

**GRN Integration (Procurement Module)**:
- Endpoint: `GET /api/procurement/grn/{grnNumber}`
- Response: GRN header and line items with products, quantities, costs
- Validation: Verify GRN status = Committed before allowing Stock In creation

**Transfer Integration (Inventory Module)**:
- Endpoint: `GET /api/inventory/transfer/{transferNumber}`
- Response: Transfer order with source/destination locations, products, quantities
- Validation: Verify transfer status = Shipped or In Transit

**Issue Return Integration (Store Operations Module)**:
- Endpoint: `GET /api/store-operations/issue/{issueNumber}`
- Response: Original issue transaction with products, quantities, costs
- Validation: Verify issue status = Completed, prevent return quantity > issued quantity

---

## Security

### Authentication

**Mechanism**: NextAuth.js with JWT-based sessions or custom auth provider

**Session Management**:
- Session duration: 8 hours active, 30-minute idle timeout
- Refresh token rotation for extended sessions
- Secure HTTP-only cookies for token storage

### Authorization

**Role-Based Access Control (RBAC)**:
- Roles: Storekeeper, Inventory Coordinator, Inventory Supervisor, Inventory Manager
- Permissions checked at:
  - Page level (Server Components check before rendering)
  - API level (Server Actions validate permissions)
  - UI level (Hide/disable actions user cannot perform)

**Permission Matrix**:
```
Action               | Storekeeper | Coordinator | Supervisor | Manager
---------------------|-------------|-------------|------------|--------
View Transactions    | ✓           | ✓           | ✓          | ✓
Create Transaction   | ✓           | ✓           | ✓          | ✓
Edit Saved Trans.    | ✓           | ✓           | ✓          | ✓
Commit Transaction   | -           | ✓           | ✓          | ✓
Void Transaction     | -           | -           | ✓          | ✓
Reverse Committed    | -           | -           | ✓          | ✓
Delete Saved Trans.  | -           | -           | -          | ✓
Override Cost        | -           | -           | ✓          | ✓
```

**Location-Based Access**:
- Users assigned to specific locations
- Can only view/edit transactions for accessible locations
- Enforced via Row-Level Security (RLS) policies in database

### Data Security

**Encryption**:
- Data in transit: TLS 1.2+ for all HTTP requests
- Data at rest: PostgreSQL transparent data encryption (TDE) for sensitive fields
- File attachments: AES-256 encryption in cloud storage

**SQL Injection Prevention**:
- Prisma ORM with parameterized queries (no raw SQL concatenation)
- Input validation with Zod schemas before database queries

**XSS Prevention**:
- React's built-in XSS protection (escapes HTML by default)
- Content Security Policy (CSP) headers configured
- Sanitize user input in comments and descriptions

**CSRF Protection**:
- Next.js Server Actions include automatic CSRF tokens
- SameSite cookies set to Strict

### Audit Logging

**Activity Log Requirements**:
- Log all CRUD operations on transactions
- Capture: User ID, Action Type, Timestamp, IP Address, User Agent, Changed Fields (before/after)
- Immutable: Activity log entries cannot be modified or deleted
- Retention: 7 years minimum for compliance

**Sensitive Data Masking**:
- Mask sensitive fields in logs (e.g., financial amounts in non-production environments)
- PII (Personal Identifiable Information) excluded from logs

---

## Performance Optimization

### Server-Side Rendering (SSR)

**Benefits**:
- Faster initial page load with server-rendered HTML
- Better SEO for public pages (not applicable for authenticated app but good practice)
- Reduced client-side JavaScript bundle size

**Implementation**:
- Use React Server Components (RSC) by default
- Fetch data on server, pass to client components as props
- Minimize "use client" directives to only interactive components

### Code Splitting

**Approach**:
- Next.js automatic code splitting per route
- Dynamic imports for large components (e.g., chart libraries, rich text editors)
- Lazy load modal dialogs and non-critical features

**Example**: ProductSelector component dynamically imported only when "Add Product" clicked

### Database Query Optimization

**Strategies**:
- Use Prisma `select` to fetch only required fields (avoid `SELECT *`)
- Implement pagination (skip/take) for list views
- Add database indexes on frequently queried columns (refNo, locationId, status, createdDate)
- Use `include` for related data to avoid N+1 queries
- Implement connection pooling (Prisma built-in, max connections = 10 per instance)

**Example Indexes**:
```
CREATE INDEX idx_stock_in_transaction_location_status ON stock_in_transaction(location_id, status);
CREATE INDEX idx_stock_in_transaction_created_date ON stock_in_transaction(created_date DESC);
CREATE INDEX idx_stock_in_transaction_ref_no ON stock_in_transaction(ref_no);
```

### Caching Strategy

**React Query Caching**:
- List data: Stale time 30s, cache time 5 minutes
- Detail data: Stale time 1 minute (longer for committed transactions), cache time 10 minutes
- Reference data (locations, products): Stale time 10 minutes, cache time 1 hour

**Redis Caching (Optional)**:
- Cache frequently-accessed reference data (locations, product catalog, user permissions)
- Set TTL (Time To Live) based on data volatility
- Invalidate cache on data updates

### Image and Asset Optimization

**Techniques**:
- Use Next.js `<Image>` component for automatic optimization
- Lazy load images below the fold
- Serve images in WebP format with JPEG fallback
- Compress attachments before upload (client-side)

### Bundle Size Optimization

**Target**: Total JavaScript bundle < 200KB (gzipped)

**Techniques**:
- Tree-shaking unused code
- Minimize third-party dependencies (prefer native implementations)
- Use dynamic imports for large libraries
- Analyze bundle with `@next/bundle-analyzer`

---

## Error Handling

### Error Classification

**User Errors (400 series)**:
- Validation errors: Display inline with field highlighting
- Permission errors (403): Show permission denied page or message
- Not found errors (404): Show "Transaction not found" page

**System Errors (500 series)**:
- Integration failures: Display user-friendly error, log technical details
- Database errors: Rollback transaction, display generic error, alert support team
- Unexpected errors: Catch in error boundary, display fallback UI, log stack trace

### Error Boundary Implementation

**Global Error Boundary**:
- Wraps entire application
- Catches uncaught React errors
- Displays fallback UI with "Something went wrong" message and reload button
- Logs error to monitoring service (e.g., Sentry)

**Page-Level Error Boundaries**:
- Wrap individual pages or sections
- Allow rest of app to continue functioning
- Provide context-specific error messages

### Validation Error Display

**Approach**:
- Field-level errors: Display below input field in red text with error icon
- Form-level errors: Display at top of form in error alert
- API errors: Display in toast notification with option to retry

---

## Testing Strategy

### Unit Testing

**Framework**: Vitest

**Scope**:
- Business logic functions (calculations, validations, utils)
- React hooks (useAutoSave, useLineItems, etc.)
- API client functions (mocked HTTP calls)

**Example**: Test `calculateTotalQuantity` function with various line item scenarios

### Integration Testing

**Scope**:
- Component interactions (form submission triggers API call, updates UI)
- Server actions (create/update transactions with database)
- API integrations (mock external services)

**Tools**: Vitest with React Testing Library

### End-to-End Testing

**Framework**: Playwright (or Cypress)

**Scope**:
- Critical user workflows (create transaction → add line items → commit → verify inventory updated)
- Cross-browser compatibility (Chrome, Firefox, Safari)
- Responsive design (desktop, tablet, mobile)

**Test Environments**: Separate test database with seed data

---

## Deployment

### Build Process

1. **Install dependencies**: `npm install`
2. **Generate Prisma Client**: `npx prisma generate`
3. **Run linting**: `npm run lint`
4. **Run type checking**: `npm run checktypes`
5. **Run tests**: `npm run test:run`
6. **Build application**: `npm run build` (Next.js production build)
7. **Generate database migrations** (if schema changed): `npx prisma migrate deploy`

### Environment Configuration

**Environment Variables** (.env file):
```
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/inventory_db

# Authentication
NEXTAUTH_URL=https://app.example.com
NEXTAUTH_SECRET=secret-key-here

# External APIs
VALUATION_SERVICE_URL=https://valuation.example.com/api
VALUATION_SERVICE_API_KEY=api-key-here
FINANCE_SERVICE_URL=https://finance.example.com/api
FINANCE_SERVICE_API_KEY=api-key-here

# File Storage
AWS_S3_BUCKET=inventory-attachments
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=key-id
AWS_SECRET_ACCESS_KEY=secret-key

# Application
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://app.example.com
```

### Deployment Platforms

**Supported Platforms**:
- Vercel (recommended for Next.js apps)
- AWS (EC2, ECS, or Lambda with Next.js standalone)
- Docker container (self-hosted)

**Vercel Deployment**:
1. Connect Git repository
2. Configure environment variables
3. Set build command: `npm run build`
4. Set output directory: `.next`
5. Deploy (automatic on git push)

---

## Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-11 | System | Initial technical specification |

---

## References

1. **Next.js Documentation**: https://nextjs.org/docs
2. **Prisma Documentation**: https://www.prisma.io/docs
3. **Shadcn/ui Components**: https://ui.shadcn.com
4. **React Query**: https://tanstack.com/query/latest

---

**Document Control**:
- **Classification**: Internal Use
- **Review Required**: Yes
- **Approved By**: Pending
- **Next Review Date**: TBD
