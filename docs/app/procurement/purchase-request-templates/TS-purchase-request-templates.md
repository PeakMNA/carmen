# Technical Specification: Purchase Request Templates

## Module Information
- **Module**: Procurement
- **Sub-Module**: Purchase Request Templates
- **Route**: `/procurement/purchase-request-templates`
- **Version**: 1.0.0
- **Last Updated**: 2025-12-04
- **Owner**: Procurement Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-02-11 | System Documentation | Initial version |
| 1.1.0 | 2025-12-04 | Documentation Team | Aligned with prototype - simplified item fields, updated component responsibilities |

---

## Overview

The Purchase Request Templates sub-module implements a template management system built on Next.js 14 App Router with React Server Components for optimal performance. The architecture follows a client-server pattern where server components handle data fetching and client components manage interactive features like forms, tables, and dialogs.

The technical implementation uses modern React patterns including React Hook Form for form state management, Zod for runtime validation, and Shadcn/ui components for a consistent user interface. Data operations leverage Next.js server actions for mutations and optimistic UI updates for responsive user experience.

**⚠️ IMPORTANT: This is a Technical Specification Document - TEXT FORMAT ONLY**
- This document describes implementation patterns and component responsibilities in text
- Actual code resides in the implementation files referenced throughout
- Database schema details are in DD (Data Definition) document
- Visual workflows are in FD (Flow Diagrams) document

**Related Documents**:
- [Backend Requirements](./BE-purchase-request-templates.md)
- [Business Requirements](./BR-purchase-request-templates.md)
- [Data Definition](./DD-purchase-request-templates.md)
- [Use Cases](./UC-purchase-request-templates.md)
- [Flow Diagrams](./FD-purchase-request-templates.md)
- [Validation Rules](./VAL-purchase-request-templates.md)

---

## Sitemap

### Overview
This section provides a complete navigation structure of all pages, tabs, and dialogues in the Purchase Request Templates sub-module.

### Page Hierarchy

```mermaid
graph TD
    ListPage['List Page<br>(/procurement/purchase-request-templates)']
    CreatePage['Create Page<br>(/procurement/purchase-request-templates/new)']
    DetailPage["Detail Page<br>(/procurement/purchase-request-templates/[id])"]
    EditPage["Edit Page<br>(/procurement/purchase-request-templates/[id]/edit)"]

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
**Route**: `/procurement/purchase-request-templates`
**File**: `page.tsx`
**Purpose**: Display paginated list of all templates

**Sections**:
- Header: Title, breadcrumbs, primary actions
- Filters: Quick filters, advanced filter panel
- Search: Global search with autocomplete
- Data Table: Sortable columns, row actions, bulk selection
- Pagination: Page size selector, page navigation

**View Modes**:
- **Table View**: Display templates in tabular format with sortable columns
- **Card View**: Display templates as cards for visual browsing

**Filters**:
- Status filter: draft, active, inactive
- Request Type filter: goods, services, capital
- Department filter
- Search by template number or description

**Dialogues**:
- **Quick Create**: Fast creation form with essential fields only
- **Bulk Actions**: Multi-select actions (delete, export, status change)
- **Export**: Export data in various formats (CSV, Excel, PDF)
- **Filter**: Advanced filtering with multiple criteria

#### 2. Detail Page
**Route**: `/procurement/purchase-request-templates/[id]`
**File**: `[id]/page.tsx`
**Purpose**: Display comprehensive template details

**Sections**:
- Header: Breadcrumbs, template title, action buttons
- Info Cards: Multiple cards showing different aspects
- Related Data: Associated records and relationships

**Tabs**:
- **Overview**: Key information and summary
- **History**: Change history and audit trail
- **Activity Log**: User actions and system events

**Dialogues**:
- **Edit**: Navigate to edit form
- **Delete Confirm**: Confirmation before deletion
- **Status Change**: Change template status with reason

#### 3. Create Page
**Route**: `/procurement/purchase-request-templates/new`
**File**: `new/page.tsx`
**Purpose**: Create new template

**Sections**:
- Form Header: Title, Save/Cancel actions
- Form Fields: All required and optional fields
- Validation: Real-time field validation

**Dialogues**:
- **Cancel Confirm**: Confirm discarding unsaved changes
- **Save Draft**: Save incomplete form as draft

#### 4. Edit Page
**Route**: `/procurement/purchase-request-templates/[id]/edit`
**File**: `[id]/edit/page.tsx`
**Purpose**: Modify existing template

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
┌─────────────────┐
│   Browser       │
│   (Client)      │
└────────┬────────┘
         │ HTTPS
         │
         ▼
┌─────────────────┐
│   Next.js 14    │
│   App Router    │
├─────────────────┤
│ Server          │
│ Components      │  ← Initial page render, data fetching
├─────────────────┤
│ Client          │
│ Components      │  ← Interactive UI, forms, dialogs
├─────────────────┤
│ Server Actions  │  ← Mutations, validation
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   PostgreSQL    │
│   (Supabase)    │
└─────────────────┘
```

### Component Architecture

**Frontend Layer**:
- Page Components (Server Components for data fetching)
- UI Components (Client Components for interactivity)
- Form Components (React Hook Form + Zod validation)
- Table/Card Views (Sortable, filterable lists)
- Dialog Components (Modals for forms and confirmations)

**Backend Layer**:
- Server Actions (Mutation operations)
- Data Access Functions (Database queries)
- Validation Logic (Zod schemas)
- Integration Points (Budget, Vendor, PR modules)

**Data Layer**:
- PostgreSQL tables for templates and items
- Foreign key relationships to departments, users, budgets
- Optimistic locking via version fields
- Soft delete support via deletedAt timestamps

---

## Technology Stack

### Frontend
- **Framework**: Next.js 14.3.0 (App Router with Server Actions)
- **UI Library**: React 18.3.1
- **Styling**: Tailwind CSS 3.4.1, Shadcn/ui component library
- **State Management**: React useState/useReducer (local), React Query for server state (if needed)
- **Form Handling**: React Hook Form 7.x, Zod 3.x for validation schemas
- **Icons**: Lucide React (consistent icon library)
- **Date Handling**: date-fns 2.x for date formatting and manipulation

### Backend
- **Runtime**: Node.js 20.14.0
- **Framework**: Next.js Server Actions for mutations
- **Database**: PostgreSQL 15+ via Supabase
- **Authentication**: Supabase Auth with role-based access control
- **File Storage**: Not applicable for templates module

### Testing
- **Unit Tests**: Vitest (component logic, utilities)
- **Integration Tests**: Vitest (server actions, database operations)
- **E2E Tests**: Playwright (user workflows)

### DevOps
- **Version Control**: Git with GitHub
- **CI/CD**: GitHub Actions
- **Hosting**: Vercel (Next.js deployment)
- **Database Hosting**: Supabase (PostgreSQL)
- **Monitoring**: Vercel Analytics, Supabase monitoring

---

## Component Structure

### Directory Structure

```
app/(main)/procurement/purchase-request-templates/
├── page.tsx                               # Templates list page (Server Component)
├── [id]/
│   └── page.tsx                          # Template detail page (Server Component)
├── components/
│   ├── ItemsTab.tsx                      # Items tab component
│   ├── template-items-table.tsx          # Items table display
│   ├── item-form-dialog.tsx              # Add/Edit item dialog
│   └── ...
├── types/
│   └── template-items.ts                 # TypeScript interfaces
├── actions/
│   └── template-actions.ts               # Server actions for CRUD
└── lib/
    └── validation.ts                     # Zod validation schemas
```

### Key Components

#### List Page Component
**File**: `app/(main)/procurement/purchase-request-templates/page.tsx`
**Type**: Server Component
**Purpose**: Displays all purchase request templates with filtering and view mode switching

**Responsibilities**:
- Fetches initial template data from database on server
- Provides view mode toggle (table vs card layout)
- Renders filter controls for searching templates
- Handles navigation to detail pages
- Supports bulk operations (delete, clone)
- Implements client-side filtering and sorting for performance

**Data Requirements**:
- List of all templates with summary data (number, description, department, status, estimated total)
- User permissions for create, edit, delete operations
- Department list for filtering
- Status list for filtering

**Component Props**: None (Server Component fetches own data)

---

#### Detail Page Component
**File**: `app/(main)/procurement/purchase-request-templates/[id]/page.tsx`
**Type**: Server Component with dynamic route parameter
**Purpose**: Displays complete template details with tab navigation

**Responsibilities**:
- Fetches specific template by ID from database
- Renders template metadata (number, description, department, type, status)
- Provides tab navigation: Items, Budgets, Activity
- Supports view/edit mode switching
- Displays action buttons: Edit, Clone, Delete, Set as Default
- Handles mode parameter from URL (view vs edit)

**Data Requirements**:
- Complete template data including all fields
- All template items with full specifications
- Budget allocation summary
- Activity history and audit trail
- User permissions for template operations

**URL Parameters**:
- `id`: Template UUID or template number
- Query params: `mode=edit` or `mode=view`

---

#### Items Tab Component
**File**: `app/(main)/procurement/purchase-request-templates/components/ItemsTab.tsx`
**Type**: Client Component
**Purpose**: Manages template items list with CRUD operations

**Responsibilities**:
- Displays items in table format using template-items-table component
- Provides "Add Item" button to open item form dialog
- Handles item selection for editing
- Manages item deletion with confirmation
- Calculates and displays template estimated total
- Supports different modes (view vs edit)

**Component Props**:
- `items`: Array of TemplateItem objects
- `mode`: 'view' | 'edit' (determines whether actions are enabled)
- `onItemsChange`: Callback function for item updates (in edit mode)

**State Management**:
- Local state for items list
- Local state for selected item (for editing)
- Dialog open/close state for item form
- Delete confirmation dialog state

---

#### Item Form Dialog Component
**File**: `app/(main)/procurement/purchase-request-templates/components/item-form-dialog.tsx`
**Type**: Client Component with React Hook Form
**Purpose**: Add or edit individual template items with validation

**Responsibilities**:
- Renders form fields for all item properties
- Implements Zod validation schema for real-time validation
- Calculates total amount automatically as user types
- Provides budget code and account code dropdowns
- Displays calculated total (quantity × unit price)

**Form Fields**:
- Basic Information: itemCode, description
- Quantity/UOM: uom dropdown, quantity number input
- Pricing: currency dropdown, unitPrice
- Financial Coding: budgetCode dropdown, accountCode dropdown, department dropdown, taxCode dropdown
- Calculated Fields (read-only): totalAmount

> **Note**: Advanced pricing fields (discountRate, taxRate, taxIncluded, currencyRate, baseAmount, discountAmount, netAmount, taxAmount) planned for Phase 2.

**Validation Schema**: Zod schema enforcing item validation rules

**Component Props**:
- `open`: Boolean for dialog visibility
- `item`: TemplateItem | null (null for add, object for edit)
- `onSave`: Callback with TemplateItem data
- `onCancel`: Callback to close dialog

**Real-Time Calculations**:
Component watches quantity and unitPrice fields and recalculates:
- totalAmount = quantity × unitPrice

---

#### Template Items Table Component
**File**: `app/(main)/procurement/purchase-request-templates/components/template-items-table.tsx`
**Type**: Client Component
**Purpose**: Displays template items in sortable, actionable table

**Responsibilities**:
- Renders table with columns: Item Code, Description, UOM, Quantity, Unit Price, Total Amount, Actions
- Supports column sorting (ascending/descending)
- Displays item actions: Edit, Delete (in edit mode)
- Formats monetary values with proper currency symbols
- Shows row numbers for easy reference
- Handles empty state with helpful message

**Component Props**:
- `items`: Array of TemplateItem objects
- `mode`: 'view' | 'edit'
- `onEdit`: Callback when edit button clicked (passes item)
- `onDelete`: Callback when delete button clicked (passes item ID)

**Column Definitions**:
- Item Code: Left-aligned text
- Description: Left-aligned text, truncated if long
- UOM: Center-aligned text
- Quantity: Right-aligned number with formatting
- Unit Price: Right-aligned currency with 2 decimals
- Total Amount: Right-aligned currency with 2 decimals
- Actions: Icon buttons (Edit, Delete) visible only in edit mode

---

## Data Flow

### Read Operations (Template List)

```
User navigates to /procurement/purchase-request-templates
    ↓
Next.js renders page.tsx (Server Component)
    ↓
Server Component fetches templates from database
    ↓
Database returns templates array
    ↓
Server Component filters by user department permissions
    ↓
Server renders HTML with template data
    ↓
Client receives fully rendered page
    ↓
Client-side hydration enables interactive features (filtering, sorting)
```

### Read Operations (Template Detail)

```
User clicks template or navigates to /procurement/purchase-request-templates/[id]
    ↓
Next.js renders [id]/page.tsx (Server Component)
    ↓
Server Component extracts ID from route params
    ↓
Server Component fetches template with items from database
    ↓
Database returns complete template object
    ↓
Server Component validates user has permission to view
    ↓
Server renders template detail HTML
    ↓
Client receives rendered page with all data
    ↓
Client-side components enable tab switching, mode toggle
```

### Write Operations (Create Template)

```
User clicks "New Template" button
    ↓
Client navigates to create page or opens dialog
    ↓
User fills template form (description, department, type)
    ↓
User clicks "Create" button
    ↓
Form validation runs (client-side Zod)
    ↓ (validation passes)
Client calls server action: createTemplate(data)
    ↓
Server action validates data (server-side Zod)
    ↓
Server action generates template number (TPL-YY-NNNN)
    ↓
Server action inserts template record to database
    ↓
Database returns created template with ID
    ↓
Server action returns success with template ID
    ↓
Client receives response
    ↓
Client navigates to template detail page
    ↓
Success message displayed
```

### Write Operations (Add Item to Template)

```
User clicks "Add Item" button
    ↓
Client opens item form dialog
    ↓
User fills item form fields
    ↓
Form calculates amounts in real-time as user types
    ↓
User clicks "Add" button
    ↓
Form validation runs (client-side Zod)
    ↓ (validation passes)
Client calls server action: addTemplateItem(templateId, itemData)
    ↓
Server action validates item data
    ↓
Server action checks for duplicate item code
    ↓
Server action validates budget/account codes exist
    ↓
Server action inserts TemplateItem record
    ↓
Server action recalculates template estimated total
    ↓
Server action updates template record
    ↓
Database commits transaction
    ↓
Server action returns success with new item
    ↓
Client receives response
    ↓
Client adds item to local state
    ↓
Client closes dialog
    ↓
Client updates items list display
    ↓
Success message displayed
```

### Delete Operations (Template)

```
User clicks "Delete" button
    ↓
Client displays confirmation dialog
    ↓
User confirms deletion
    ↓
Client calls server action: deleteTemplate(templateId)
    ↓
Server action validates user has delete permission
    ↓
Server action checks template is not default
    ↓
Server action checks no active PRs reference template
    ↓
Server action soft-deletes template (sets deletedAt)
    ↓
Server action soft-deletes all template items
    ↓
Server action logs deletion in audit trail
    ↓
Database commits transaction
    ↓
Server action returns success
    ↓
Client receives response
    ↓
Client removes template from list
    ↓
Client navigates to templates list (if on detail page)
    ↓
Success message displayed
```

---

## State Management

### Page-Level State
Templates list page maintains:
- Current view mode (table vs card) - persisted to localStorage
- Filter criteria (search, department, status, etc.) - stored in URL query params
- Sort configuration (field, direction) - stored in component state
- Selected templates for bulk operations - array of IDs in component state

Template detail page maintains:
- Current mode (view vs edit) - from URL query param `?mode=edit`
- Active tab (items, budgets, activity) - stored in component state
- Unsaved changes flag - boolean in component state for navigation warning

### Form State (React Hook Form)
Item form dialog uses React Hook Form for:
- Field values (all item properties)
- Field errors (validation messages)
- Dirty state (tracks which fields changed)
- Touched state (tracks which fields user interacted with)
- Form submission state (loading, success, error)

Calculated fields updated via useEffect watching dependent fields.

### Server State
No global server state management required; Next.js Server Components handle server state naturally through data fetching at component level. React Query could be added for optimistic updates and caching if needed in future iterations.

---

## Validation

### Client-Side Validation
React Hook Form with Zod schemas provides instant feedback:
- Field-level validation on blur (when user leaves field)
- Form-level validation on submit attempt
- Real-time validation for dependent fields (calculations)
- Custom validation messages matching business rules

### Server-Side Validation
Server actions re-validate all inputs:
- Schema validation using same Zod schemas as client
- Business rule validation (duplicate checks, permission checks)
- Database constraint validation (foreign keys, unique constraints)
- Returns detailed error messages for client display

### Validation Rules Applied
All validation rules from VAL document enforced at both client and server:
- BR-TPL-008 through BR-TPL-018: Item field validations
- BR-TPL-001: Template number format validation
- BR-TPL-002: Department assignment rules
- BR-TPL-003: Description length requirements
- Plus all other business rules from BR document

---

## Integration Points

### Budget Management Module
**Purpose**: Validate budget codes and check availability

**Integration Method**: Internal module function call

**Request Flow**:
1. Client selects budget code in item form
2. Form triggers budget validation function
3. Function calls Budget Management service
4. Service returns: valid flag, status, available balance
5. Form displays validation result (checkmark, warning, or error)

**Data Exchanged**:
- Request: budgetCode, departmentId, amount
- Response: valid (boolean), status, details {allocated, spent, committed, available}, warning message

**Error Handling**: If Budget Management unavailable, use cached budget codes with warning message

---

### Vendor Management Module
**Purpose**: Fetch current product pricing from vendor catalogs

**Integration Method**: Internal module function call

**Request Flow**:
1. User clicks "Browse Catalog" in item form
2. Client calls Vendor Management catalog endpoint
3. Service returns list of products for department
4. Client displays product selection modal
5. User selects product
6. Form auto-fills with product data (item code, description, UOM, price)

**Data Exchanged**:
- Request: departmentId, category, searchQuery
- Response: Array of products with {productId, itemCode, description, uom, unitPrice, currency, vendorName}

**Error Handling**: If Vendor Management unavailable, allow manual item entry

---

### Purchase Requests Module
**Purpose**: Convert template to purchase request

**Integration Method**: Shared service function or direct database operation

**Request Flow**:
1. Purchase Request module calls template conversion function
2. Function retrieves template data with all items
3. Function creates new PR record with template data
4. Function creates PR line items from template items
5. Function updates template usage statistics
6. Function returns new PR number to calling module

**Data Exchanged**:
- Request: templateId, userId, optional overrides {vendorId, deliveryDate}
- Response: PR data structure ready for creation, sourceTemplateId reference

**Error Handling**: Transaction rolled back if PR creation fails; template unchanged

---

### Currency Management Module
**Purpose**: Fetch current exchange rates for multi-currency items

**Integration Method**: Internal service call or database view

**Request Flow**:
1. User selects non-base currency in item form
2. Form queries Currency Management for exchange rate
3. Service returns current rate for currency pair
4. Form populates exchange rate field (editable by user)
5. Form calculates amounts using exchange rate

**Data Exchanged**:
- Request: fromCurrency, toCurrency, effectiveDate
- Response: exchangeRate (number), lastUpdated (date)

**Error Handling**: Use default rate of 1.0 if service unavailable; display warning

---

## Performance Considerations

### Server-Side Rendering (SSR)
- Templates list and detail pages use Server Components for initial render
- Reduces client-side JavaScript bundle size
- Improves First Contentful Paint (FCP) and Time to Interactive (TTI)
- SEO-friendly with fully rendered HTML

### Client-Side Optimizations
- Table and card view components virtualized for large template lists
- Filter operations debounced (300ms) to reduce re-renders
- Form calculations use useMemo for expensive operations
- Dialog components lazy-loaded to reduce initial bundle size

### Database Query Optimization
- Indexed columns: templateNumber, departmentId, status, createdDate
- Pagination implemented for template lists (limit/offset queries)
- Eager loading for template items to avoid N+1 queries
- Database views for common filtered queries (active templates by department)

### Caching Strategy
- Static metadata (departments, UOMs, tax codes) cached in memory
- Budget code validation responses cached for 5 minutes (client-side)
- Vendor catalog data cached for 4 hours (server-side)
- Template list results cached with SWR (Stale-While-Revalidate) pattern

---

## Security

### Authentication & Authorization
- All page components verify user authentication before rendering
- Server actions validate user permissions before executing operations
- Row-level security enforced: users see only templates for their departments
- Role-based access control (RBAC) for create, edit, delete, manage-defaults

### Input Validation
- All user inputs validated with Zod schemas (client and server)
- SQL injection prevented via parameterized queries (Prisma/Supabase)
- XSS prevention via React's automatic escaping
- CSRF protection via Next.js built-in tokens

### Data Protection
- Sensitive fields (pricing, budgets) access-controlled
- Audit trail captures all create, update, delete operations with user ID and timestamp
- Soft delete preserves data for 90 days before permanent removal
- No PII stored in templates module

### API Security
- Server actions authenticated via session tokens
- Rate limiting on create/update operations (prevent abuse)
- Input size limits enforced (prevent DoS via large payloads)
- Error messages sanitized (no internal details exposed)

---

## Error Handling

### Client-Side Errors
- Form validation errors displayed inline next to fields
- Network errors shown in toast notifications
- Navigation blocked if unsaved changes with confirmation dialog
- Graceful degradation if client-side features fail

### Server-Side Errors
- Database errors caught and logged with context
- User-friendly error messages returned to client
- Transaction rollbacks on partial failures
- Error codes for client-side error handling

### Error Logging
- All errors logged to server console with stack traces
- Critical errors sent to monitoring service (Vercel, Sentry)
- User actions logged for audit trail
- Performance metrics tracked for slow operations

---

## Testing Strategy

### Unit Tests
- Form validation logic (Zod schemas)
- Amount calculation functions
- Utility functions (number formatting, date formatting)
- Component rendering (snapshots, props)

### Integration Tests
- Server actions (create, update, delete operations)
- Database queries (correct data returned)
- Integration points (Budget, Vendor, PR modules)
- Validation workflows (client + server)

### E2E Tests (Playwright)
- Critical user workflows:
  - Create template with items
  - Edit template and update items
  - Delete template with confirmation
  - Clone template
  - Convert template to PR
- Multi-browser testing (Chromium, Firefox, WebKit)
- Mobile responsive testing

### Test Coverage Targets
- Unit tests: 80%+ code coverage
- Integration tests: All server actions, all database operations
- E2E tests: All critical user workflows from UC document

---

## Deployment

### Build Process
1. TypeScript compilation and type checking
2. Next.js production build (optimization, tree-shaking)
3. Asset optimization (images, fonts)
4. Environment variable validation
5. Database migrations applied (if needed)

### Deployment Pipeline
- Code pushed to GitHub triggers CI/CD
- Tests run automatically (unit, integration, E2E)
- Build process executes on passing tests
- Deployment to Vercel preview environment
- Manual approval for production deployment
- Production deployment with zero-downtime

### Environment Configuration
- Development: Local database, mock data
- Staging: Supabase staging database, test data
- Production: Supabase production database, real data

### Rollback Strategy
- Vercel supports instant rollback to previous deployment
- Database migrations reversible with down scripts
- Feature flags allow disabling problematic features

---

## Monitoring & Maintenance

### Application Monitoring
- Vercel Analytics for page views, performance metrics
- Error tracking via Vercel Logs or Sentry
- Performance monitoring: LCP, FID, CLS (Core Web Vitals)
- API response time tracking

### Database Monitoring
- Supabase Dashboard for query performance
- Slow query alerts (> 1 second)
- Connection pool monitoring
- Storage usage tracking

### User Activity Monitoring
- Template creation/usage statistics
- Most-used templates dashboard
- Department-level usage reporting
- Error rate by operation type

### Maintenance Tasks
- Weekly: Review error logs, optimize slow queries
- Monthly: Database cleanup (purge soft-deleted records > 90 days old)
- Quarterly: Review and optimize indexes
- Annually: Archive inactive templates to cold storage

---

## Future Enhancements

### Technical Improvements
- Implement React Query for optimistic UI updates
- Add full-text search using PostgreSQL FTS
- Implement real-time collaboration (multiple users editing template)
- Add template versioning with diff viewing
- Implement export to Excel/CSV functionality

### Integration Enhancements
- Real-time vendor pricing updates via webhooks
- Automated template suggestions based on purchase history
- Integration with inventory management for stock levels
- AI-powered template optimization suggestions

### Performance Enhancements
- Implement service worker for offline template viewing
- Add edge caching for frequently accessed templates
- Optimize bundle size with code splitting by route
- Implement virtual scrolling for very large item lists (500+ items)

---

## Appendix

### Key Files Reference

**Pages**:
- `app/(main)/procurement/purchase-request-templates/page.tsx` - Templates list
- `app/(main)/procurement/purchase-request-templates/[id]/page.tsx` - Template detail

**Components**:
- `components/ItemsTab.tsx` - Items tab container
- `components/template-items-table.tsx` - Items table display
- `components/item-form-dialog.tsx` - Add/Edit item form

**Types**:
- `types/template-items.ts` - TemplateItem interface definition
- `lib/types/index.ts` - Central type exports

**Actions** (to be implemented):
- `actions/template-actions.ts` - Server actions for CRUD operations

**Validation**:
- `lib/validation.ts` - Zod schemas for all entities

### Component Interaction Matrix

| Component | Depends On | Used By | State Managed |
|-----------|------------|---------|---------------|
| page.tsx (list) | - | Router | View mode, filters, selection |
| [id]/page.tsx | - | Router | Mode (view/edit), active tab |
| ItemsTab | template-items-table, item-form-dialog | [id]/page.tsx | Items array, dialog state |
| item-form-dialog | React Hook Form, Zod | ItemsTab | Form state, calculated amounts |
| template-items-table | - | ItemsTab | Sort configuration |

### Technology Decision Rationale

**Next.js 14 App Router**: Chosen for Server Components, improved performance, and simplified data fetching patterns

**React Hook Form**: Selected for excellent TypeScript support, small bundle size, and performant re-renders

**Zod**: Selected for runtime validation, TypeScript integration, and schema reusability across client/server

**Shadcn/ui**: Chosen for accessible components, Tailwind CSS integration, and customization flexibility

**Supabase**: Selected for PostgreSQL compatibility, built-in auth, and real-time capabilities (future use)

---

**Document End**
