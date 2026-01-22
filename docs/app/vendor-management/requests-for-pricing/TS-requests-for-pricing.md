# Requests for Pricing (Price Collection Campaigns) - Technical Specification (TS)

## Document Information
- **Document Type**: Technical Specification Document
- **Module**: Vendor Management > Requests for Pricing
- **Version**: 3.0.0
- **Last Updated**: 2026-01-15
- **Document Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2026-01-15 | Documentation Team | Synced with current code; Updated CampaignSettings priority to include 'normal'; Added tags field; Updated CampaignVendorStatus interface with all fields |
| 2.0.0 | 2025-11-26 | System | Complete rewrite to match BR v2.0.0 and actual code; Removed fictional RFQ features; Removed code blocks per specification (text + sitemap only); Updated to reflect Price Collection Campaign functionality |
| 1.0 | 2024-01-15 | System | Initial technical specification document |

**Note**: This document describes technical specifications in text format with sitemap. Code examples are not included per specification requirements.

---

## 1. Technical Overview

### 1.1 Technology Stack

**Frontend**
- Framework: Next.js 14 with App Router
- Language: TypeScript 5.8.2 (strict mode)
- Styling: Tailwind CSS with Shadcn/ui components
- State Management: Zustand for wizard state, React Query for server state
- Forms: React Hook Form with Zod validation
- UI Components: Radix UI primitives with Lucide React icons
- Date Handling: date-fns

**Backend**
- Framework: Next.js 14 Server Actions and Route Handlers
- Data Layer: Mock data with TypeScript interfaces
- Authentication: User context system
- State: Client-side state management

**Infrastructure**
- Development: Local Next.js development server
- Data: Centralized mock data in lib/mock-data

### 1.2 Architecture Pattern

The module follows the Next.js App Router pattern with Server Components as default and Client Components for interactive elements.

**Key Principles**
- Server Components for initial page rendering
- Client Components for interactive features (wizard, filters, actions)
- Centralized mock data for development
- TypeScript interfaces for type safety
- React Query for data caching and state management

---

## 2. Site Map

### 2.1 Route Structure

```
/vendor-management/campaigns
├── page.tsx                    # Campaign List Page
├── new/
│   └── page.tsx               # Campaign Create Wizard (4 steps)
└── [id]/
    ├── page.tsx               # Campaign Detail Page (with tabs)
    └── edit/
        └── page.tsx           # Campaign Edit Page (draft only)
```

### 2.2 Page Descriptions

**Campaign List Page** (`/vendor-management/campaigns`)
- Route: `/vendor-management/campaigns`
- Component Type: Client Component
- Purpose: Display all campaigns with filtering and search
- Features: Table view, card view, status filter, search, action menu

**Campaign Create Page** (`/vendor-management/campaigns/new`)
- Route: `/vendor-management/campaigns/new`
- Component Type: Client Component
- Purpose: 4-step wizard for creating new campaigns
- Query Parameters: `templateId` (optional) - Pre-selects template in Step 2

**Campaign Detail Page** (`/vendor-management/campaigns/[id]`)
- Route: `/vendor-management/campaigns/[id]`
- Component Type: Client Component
- Purpose: Display campaign details with tabbed interface
- Tabs: Overview, Vendors, Settings

**Campaign Edit Page** (`/vendor-management/campaigns/[id]/edit`)
- Route: `/vendor-management/campaigns/[id]/edit`
- Component Type: Client Component
- Purpose: Edit draft campaigns
- Restriction: Only available for draft status campaigns

---

## 3. Component Architecture

### 3.1 Component Hierarchy

**Campaign List Page Components**
- CampaignsPage (main page component)
  - Card with CardHeader and CardContent
  - Search Input
  - Status Filter Dropdown
  - View Toggle (Table/Card)
  - Action Buttons (Export, Create)
  - Table Component (table view)
  - Card Grid (card view)
  - Dropdown Menu (row actions)

**Campaign Create Wizard Components**
- CreateCampaignPage (main page component)
  - Step Indicator
  - Step 1: Basic Information Form
  - Step 2: Template Selection Grid
  - Step 3: Vendor Selection with Search/Filter
  - Step 4: Review Summary
  - Navigation Buttons (Previous, Next, Launch)

**Campaign Detail Page Components**
- CampaignDetailPage (main page component)
  - Header with Status Badge
  - Tab Navigation
  - Overview Tab Content
    - Campaign Details Card
    - Performance Summary Card
  - Vendors Tab Content
    - Vendor Table with Status
    - Send Reminder Button
  - Settings Tab Content
    - Settings Display Grid
    - Reminder Schedule Display

### 3.2 Shared Components Used

**From Shadcn/ui**
- Button (various variants)
- Card, CardHeader, CardContent, CardTitle
- Badge
- Input
- Select, SelectTrigger, SelectContent, SelectItem, SelectValue
- Table, TableHeader, TableBody, TableRow, TableHead, TableCell
- DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem
- Tabs, TabsList, TabsTrigger, TabsContent

**From Lucide React**
- Plus, Search, Filter, Download
- List, Grid (view toggle)
- Eye, Edit, Copy, Trash2, MoreHorizontal (actions)
- Calendar, Users, FileText, Mail
- Play, Pause, Square, CheckCircle, AlertCircle, Clock (status icons)

---

## 4. Data Layer

### 4.1 Type Definitions

**PriceCollectionCampaign Interface**
- id: string (unique identifier)
- name: string (campaign name)
- description: string (optional)
- status: CampaignStatus enum (draft, active, paused, completed, cancelled)
- campaignType: CampaignType enum (one-time, recurring, event-based)
- selectedVendors: string array (vendor IDs)
- selectedCategories: string array (category names)
- scheduledStart: Date (start date)
- scheduledEnd: Date (optional end date)
- recurringPattern: RecurringPattern object (optional)
- progress: CampaignProgress object
- settings: CampaignSettings object
- template: object (optional, template reference)
- createdBy: string (creator identifier)
- createdAt: Date
- updatedAt: Date

**CampaignProgress Interface**
- totalVendors: number
- invitedVendors: number
- respondedVendors: number
- completedSubmissions: number
- pendingSubmissions: number
- failedSubmissions: number
- completionRate: number (percentage)
- responseRate: number (percentage)
- averageResponseTime: number (hours)
- lastUpdated: Date

**CampaignSettings Interface**
- portalAccessDuration: number (days)
- allowedSubmissionMethods: string array
- requireApproval: boolean
- autoReminders: boolean
- reminderSchedule: ReminderSchedule object
- emailTemplate: string (optional)
- customInstructions: string (optional)
- priority: Priority enum (low, normal, medium, high, urgent)

**RecurringPattern Interface**
- frequency: Frequency enum (weekly, monthly, quarterly, annually)
- interval: number
- endDate: Date (optional)
- maxOccurrences: number (optional)
- daysOfWeek: number array (0-6 for weekly)
- dayOfMonth: number (1-31 for monthly)
- monthOfYear: number (1-12 for annually)

### 4.2 Mock Data Location

**Campaign Mock Data**: lib/mock-data/campaigns.ts
- mockCampaigns: Array of PriceCollectionCampaign objects
- mockCampaignTemplates: Array of template objects for selection

**Vendor Mock Data**: lib/mock-data/vendors.ts
- mockVendors: Array of vendor objects for selection in wizard

### 4.3 Type Definitions Location

**Campaign Types**: lib/types/campaign-management.ts
- PriceCollectionCampaign interface
- CampaignProgress interface
- CampaignSettings interface
- RecurringPattern interface
- CampaignStatus type
- CampaignType type
- Priority type
- Frequency type

---

## 5. State Management

### 5.1 Campaign List State

**Local State (useState)**
- searchTerm: string (search input value)
- statusFilter: string (status dropdown value)
- viewMode: 'table' | 'card' (current view mode)

**Derived State (useMemo)**
- filteredCampaigns: Filtered campaign array based on search and status filter

### 5.2 Campaign Create Wizard State

**Local State (useState)**
- currentStep: number (1-4)
- formData: Object containing wizard data
  - basicInfo: name, description, priority, dates
  - selectedTemplate: template object
  - selectedVendors: vendor ID array
  - settings: campaign settings

**URL State**
- templateId: Query parameter for pre-selecting template

### 5.3 Campaign Detail State

**Local State (useState)**
- activeTab: string (Overview, Vendors, Settings)

---

## 6. Form Validation

### 6.1 Step 1 - Basic Information Validation

**Required Fields**
- name: Required, non-empty string
- description: Required, non-empty string
- scheduledStart: Required, valid date
- scheduledEnd: Optional, must be after scheduledStart if provided

**Validation Rules**
- Name minimum length: 3 characters
- Description minimum length: 10 characters
- Start date cannot be in the past
- End date must be after start date

### 6.2 Step 2 - Template Selection Validation

**Required Fields**
- template: Required, must select one template

### 6.3 Step 3 - Vendor Selection Validation

**Required Fields**
- selectedVendors: Required, minimum 1 vendor

**Validation Rules**
- At least one vendor must be selected to proceed

---

## 7. Navigation Flows

### 7.1 Entry Points

**Sidebar Navigation**
- Path: Vendor Management > Requests for Pricing
- Route: /vendor-management/campaigns

**Template Detail Action**
- Link: "Create Request for Pricing" button on template detail
- Route: /vendor-management/campaigns/new?templateId={id}

### 7.2 Internal Navigation

**From List Page**
- Create Button → /vendor-management/campaigns/new
- Row Click → /vendor-management/campaigns/[id]
- Edit Action → /vendor-management/campaigns/[id]/edit

**From Create Page**
- Cancel → /vendor-management/campaigns
- Success → /vendor-management/campaigns/[id]

**From Detail Page**
- Back Button → /vendor-management/campaigns
- Edit Button → /vendor-management/campaigns/[id]/edit
- Duplicate → Creates copy and navigates to new campaign

---

## 8. Actions and Operations

### 8.1 Campaign List Actions

**View Action**
- Navigate to campaign detail page
- Route: /vendor-management/campaigns/[id]

**Edit Action**
- Navigate to campaign edit page
- Only available for draft campaigns
- Route: /vendor-management/campaigns/[id]/edit

**Duplicate Action**
- Create copy of campaign with "(Copy)" suffix
- Reset status to draft
- Reset progress metrics
- Navigate to duplicated campaign

**Export Action**
- Download campaign data
- Format: CSV or JSON

**Mark as Expired Action**
- Update campaign status
- Display confirmation toast

**Delete Action**
- Show confirmation dialog
- Remove campaign from list
- Display success toast

### 8.2 Campaign Detail Actions

**Send Reminder**
- Available for vendors not completed
- Disabled for completed vendors
- Sends reminder email to vendor
- Updates reminder count

**Edit Campaign**
- Available only for draft campaigns
- Navigate to edit page

**Duplicate Campaign**
- Same as list page duplicate action

---

## 9. Integration Points

### 9.1 Pricelist Templates Integration

**Integration Type**: Read-only reference
**Purpose**: Select template for campaign creation
**Data Flow**: Template ID stored in campaign, template details displayed

### 9.2 Vendor Directory Integration

**Integration Type**: Read-only reference
**Purpose**: Select vendors to invite
**Data Flow**: Vendor IDs stored in selectedVendors array

### 9.3 Navigation Integration

**From Pricelist Templates**
- Action: "Create Request for Pricing" button
- Route: /vendor-management/campaigns/new?templateId={id}
- Behavior: Pre-selects template in Step 2 of wizard

---

## 10. Performance Considerations

### 10.1 Client-Side Optimization

**Memoization**
- useMemo for filtered campaigns to prevent recalculation
- useCallback for event handlers where appropriate

**Lazy Loading**
- Load campaign detail data on navigation
- Pagination for large campaign lists (future)

### 10.2 Rendering Optimization

**Conditional Rendering**
- Only render active tab content
- Lazy render action dropdowns on open

**View Mode Toggle**
- Preserve view mode preference during session
- Efficient re-render when switching views

---

## 11. Accessibility

### 11.1 Keyboard Navigation

**List Page**
- Tab navigation through interactive elements
- Enter to activate buttons and links
- Arrow keys for dropdown navigation

**Wizard**
- Tab through form fields
- Enter to submit step
- Previous/Next buttons keyboard accessible

### 11.2 Screen Reader Support

**ARIA Labels**
- Buttons labeled with action descriptions
- Form fields with proper labels
- Status badges with accessible text

**Focus Management**
- Focus trap in dialogs
- Focus return on dialog close
- Focus first invalid field on validation error

---

## 12. Error Handling

### 12.1 Form Validation Errors

**Display Strategy**
- Inline error messages below fields
- Error summary at form level
- Focus first invalid field

### 12.2 Action Errors

**Toast Notifications**
- Success toasts for completed actions
- Error toasts for failed operations
- Descriptive error messages

### 12.3 Navigation Errors

**Route Protection**
- Redirect to list if campaign not found
- Show permission error if unauthorized

---

## 13. Future Enhancements

### 13.1 Planned Features

**Advanced Filtering**
- Save filter combinations
- Additional filter options (date range, priority)

**Bulk Operations**
- Multi-select campaigns
- Bulk status update
- Bulk delete

**Real-time Updates**
- Live progress tracking
- WebSocket for vendor submission notifications

### 13.2 API Integration

**When Backend is Available**
- Replace mock data with API calls
- Implement server actions for mutations
- Add optimistic updates with React Query

---

## 14. Related Documents

- [BR-requests-for-pricing.md](./BR-requests-for-pricing.md) - Business Requirements v2.0.0
- [DD-requests-for-pricing.md](./DD-requests-for-pricing.md) - Data Definition
- [FD-requests-for-pricing.md](./FD-requests-for-pricing.md) - Flow Diagrams
- [UC-requests-for-pricing.md](./UC-requests-for-pricing.md) - Use Cases
- [VAL-requests-for-pricing.md](./VAL-requests-for-pricing.md) - Validations

---

**End of Technical Specification Document**
