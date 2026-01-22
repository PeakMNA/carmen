# Technical Specification: Vendor Price Submission Portal

## Document Information
- **Document Type**: Technical Specification
- **System**: Vendor Price Submission Portal
- **Module**: Vendor Management > Vendor Portal
- **Version**: 3.0.0
- **Status**: Active
- **Created**: 2025-01-23
- **Last Updated**: 2026-01-15
- **Author**: Development Team
- **Related Documents**:
  - [Business Requirements](./BR-vendor-portal.md)
  - [Data Dictionary](./DD-vendor-portal.md)
  - [Use Cases](./UC-vendor-portal.md)
  - [Flow Diagrams](./FD-vendor-portal.md)
  - [Validations](./VAL-vendor-portal.md)

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.1 | 2026-01-15 | Documentation Team | Synced with current code; Updated sample page route; Added ProductItem interface; Updated supported currencies (BHT, USD, CNY, SGD); Added submission method types |
| 3.0.0 | 2025-11-26 | System | Complete refactor - removed staff-side content (campaigns, templates, pricelists). This document now focuses ONLY on vendor-facing portal. See related modules for staff-side functionality. |
| 2.1.0 | 2025-11-26 | System | Removed approval workflow; Updated status to draft to submitted |
| 2.0 | 2025-01-23 | Development Team | Concise version - code removed, sitemap enhanced |
| 1.0 | 2025-01-23 | Development Team | Initial technical specification |

---

## Scope Clarification

### In Scope (This Document)
- Token-based vendor portal entry (`/vendor-portal/[token]`)
- Vendor price submission interface
- Online price entry functionality
- Excel upload and download functionality
- Auto-save and draft management
- Submission confirmation flow

### Out of Scope (See Related Modules)
- **Campaign Management** → See [requests-for-pricing](../requests-for-pricing/) module
- **Pricelist Templates** → See [pricelist-templates](../pricelist-templates/) module
- **Price List Viewing & Management** → See [price-lists](../price-lists/) module
- **Vendor Directory** → See [vendor-directory](../vendor-directory/) module

---

## Table of Contents
1. [System Architecture](#1-system-architecture)
2. [Technology Stack](#2-technology-stack)
3. [Sitemap and Page Structure](#3-sitemap-and-page-structure)
4. [Component Specifications](#4-component-specifications)
5. [API Design](#5-api-design)
6. [Security Requirements](#6-security-requirements)
7. [Performance Requirements](#7-performance-requirements)
8. [Integration Points](#8-integration-points)

---

## 1. System Architecture

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 VENDOR PORTAL (Public)                       │
├─────────────────────────────────────────────────────────────┤
│  Token-Based Access (No Login Required)                     │
│  - Price Submission Interface                               │
│  - Excel Upload/Download                                    │
│  - Draft Management with Auto-Save                          │
│  - Submission Tracking                                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                APPLICATION LAYER (Next.js 14)                │
├─────────────────────────────────────────────────────────────┤
│  Server Components        │     Server Actions              │
│  - Token Validation       │     - Save Draft                │
│  - Portal Rendering       │     - Submit Pricelist          │
│  - Data Loading           │     - File Processing           │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                             │
├─────────────────────────────────────────────────────────────┤
│  Token Service    │  Pricelist Service  │  Excel Service    │
│  Validation Svc   │  Auto-Save Service  │  Email Service    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                     DATA LAYER                               │
├─────────────────────────────────────────────────────────────┤
│  PostgreSQL (Supabase/Prisma)  │  File Storage (S3/Azure)   │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Architecture Principles

- **Token-Based Security**: No traditional authentication for vendors - access via unique token only
- **Server-Side Rendering**: Next.js 14 App Router for optimal performance
- **Progressive Enhancement**: Core functionality works without JavaScript
- **Auto-Save First**: Never lose vendor data through aggressive auto-save
- **Mobile Responsive**: Vendors can submit prices from any device

---

## 2. Technology Stack

### 2.1 Frontend Framework

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Framework | Next.js | 14.x | Full-stack React framework with App Router |
| UI Library | React | 18.x | Component-based UI |
| Language | TypeScript | 5.x | Type safety and developer experience |
| Styling | Tailwind CSS | 3.x | Utility-first CSS framework |
| Components | Shadcn/ui | Latest | Accessible component library |

### 2.2 State Management & Data

| Layer | Technology | Purpose |
|-------|------------|---------|
| Forms | React Hook Form + Zod | Form handling and validation |
| Local State | React useState/useReducer | Component state for price entry |
| Server State | React Query (TanStack Query) | Server state caching |
| Database | PostgreSQL | Primary data store |
| ORM | Prisma / Supabase Client | Database access layer |

### 2.3 File Processing

| Layer | Technology | Purpose |
|-------|------------|---------|
| Excel Processing | ExcelJS / SheetJS | Excel file generation and parsing |
| File Storage | AWS S3 / Azure Blob | Upload storage and management |

### 2.4 UI Components & Utilities

| Category | Technology | Purpose |
|----------|------------|---------|
| Icons | Lucide React | Icon library |
| Date Handling | date-fns | Date manipulation and formatting |
| UI Primitives | Radix UI | Accessible UI primitives |
| Animations | Tailwind CSS + Framer Motion | UI animations and transitions |

---

## 3. Sitemap and Page Structure

### 3.1 Vendor Portal Structure

```
/vendor-portal/
│
└── /[token]/                                       # Token-Based Portal Entry Point
    │
    ├── page.tsx                                    # Main Vendor Portal Page
    │   │
    │   ├── Token Validation on Load
    │   │   ├── Validate UUID format
    │   │   ├── Check token exists and not expired
    │   │   ├── Verify campaign is active
    │   │   ├── Load campaign and pricelist data
    │   │   └── Create portal session
    │   │
    │   ├── Tab: Welcome                            # Campaign Information
    │   │   ├── Campaign Name and Description
    │   │   ├── Deadline and Expiration Warning
    │   │   ├── Submission Instructions
    │   │   ├── Contact Information (campaign owner)
    │   │   ├── Required Products List
    │   │   └── Submission Guidelines
    │   │
    │   ├── Tab: Submit Prices                      # Price Submission Interface
    │   │   │
    │   │   ├── Submission Method Selector
    │   │   │   ├── [Online Entry]
    │   │   │   ├── [Upload Excel]
    │   │   │   └── [Download Template]
    │   │   │
    │   │   ├── Online Entry Panel
    │   │   │   ├── Header Section
    │   │   │   │   ├── Currency Selection (dropdown, required)
    │   │   │   │   ├── Effective Start Date (date picker, required)
    │   │   │   │   ├── Effective End Date (date picker, optional, null = open-ended)
    │   │   │   │   └── General Notes (textarea, optional)
    │   │   │   │
    │   │   │   ├── Product List Section
    │   │   │   │   ├── Product Table (all products from template)
    │   │   │   │   │   ├── Columns: Product Code, Name, Unit, Base Price, Lead Time
    │   │   │   │   │   ├── Inline Editing: Click to edit each field
    │   │   │   │   │   ├── Add MOQ Tiers Button (opens tier form, max 5 tiers)
    │   │   │   │   │   ├── FOC Quantity Fields (quantity, unit, notes)
    │   │   │   │   │   └── Item Status Indicator (pending, completed)
    │   │   │   │   │
    │   │   │   │   └── MOQ Tier Form (per product)
    │   │   │   │       ├── Tier 1: MOQ, Unit Price, Lead Time
    │   │   │   │       ├── Tier 2: MOQ, Unit Price, Lead Time (optional)
    │   │   │   │       ├── ... up to Tier 5
    │   │   │   │       ├── Validation: MOQ must be in ascending order
    │   │   │   │       └── Add/Remove Tier Buttons
    │   │   │   │
    │   │   │   ├── Auto-Save Indicator
    │   │   │   │   ├── Auto-saves every 2 minutes
    │   │   │   │   ├── Saves on field blur
    │   │   │   │   └── "Last saved: X minutes ago" timestamp
    │   │   │   │
    │   │   │   └── Action Buttons
    │   │   │       ├── [Save Draft] - Save without submitting
    │   │   │       ├── [Submit] - Final submission (becomes active immediately)
    │   │   │       └── [Clear All] - Reset form
    │   │   │
    │   │   ├── Upload Excel Panel
    │   │   │   ├── Drag-and-Drop Upload Zone
    │   │   │   │   ├── File Type: .xlsx, .csv
    │   │   │   │   ├── Max Size: 10MB
    │   │   │   │   └── Upload Progress Indicator
    │   │   │   │
    │   │   │   ├── File Parsing and Validation
    │   │   │   │   ├── Parse Excel with ExcelJS
    │   │   │   │   ├── Validate Data Structure
    │   │   │   │   ├── Map to Pricelist Items
    │   │   │   │   └── Display Validation Errors
    │   │   │   │
    │   │   │   └── Preview Parsed Data
    │   │   │       ├── Show parsed items in table
    │   │   │       ├── Highlight errors/warnings
    │   │   │       └── [Confirm and Save] or [Cancel]
    │   │   │
    │   │   └── Download Template Panel
    │   │       ├── Template Information
    │   │       │   ├── Products included in template
    │   │       │   ├── Required fields
    │   │       │   └── Instructions for filling
    │   │       │
    │   │       ├── [Download Excel Template] Button
    │   │       │   ├── Pre-filled with product list
    │   │       │   ├── Header row with field names
    │   │       │   ├── Data validation (dropdowns, formats)
    │   │       │   └── Instructions sheet included
    │   │       │
    │   │       └── Fill Offline and Upload Later
    │   │
    │   ├── Tab: Review                             # Review Submitted Prices
    │   │   ├── Submission Summary
    │   │   │   ├── Completion Percentage
    │   │   │   ├── Quality Score (if submitted)
    │   │   │   ├── Total Items
    │   │   │   ├── Completed Items
    │   │   │   └── Status (draft, submitted)
    │   │   │
    │   │   ├── Item-by-Item Review
    │   │   │   ├── Product list with entered prices
    │   │   │   ├── MOQ tier breakdown
    │   │   │   ├── FOC quantities
    │   │   │   └── View-only mode (if submitted)
    │   │   │
    │   │   └── Action Buttons (if draft)
    │   │       ├── [Edit Prices] - Return to Submit tab
    │   │       └── [Submit] - Final submission (becomes active immediately)
    │   │
    │   └── Tab: History                            # Submission History
    │       ├── Previous Submissions List
    │       │   ├── Submission Date
    │       │   ├── Status
    │       │   ├── Quality Score
    │       │   └── [View Details] Link
    │       │
    │       └── Revision Tracking
    │           ├── Changes between versions
    │           └── Version comparison
    │
    └── /components/                                # Vendor Portal Components
        ├── VendorPortalLayout.tsx                  # Portal layout wrapper
        ├── TokenValidator.tsx                      # Token validation component
        ├── WelcomePanel.tsx                        # Welcome tab content
        ├── PriceSubmissionTabs.tsx                 # Tabbed submission interface
        ├── OnlinePriceEntry.tsx                    # Online form component
        ├── ProductPricingTable.tsx                 # Price entry table
        ├── MOQPricingComponent.tsx                 # MOQ tier editor
        ├── ExcelUploadComponent.tsx                # Excel upload handler
        ├── ExcelTemplateGenerator.tsx              # Template download generator
        ├── ProgressTracker.tsx                     # Completion progress widget
        ├── SubmissionSummary.tsx                   # Review panel
        ├── AutoSaveIndicator.tsx                   # Auto-save status indicator
        └── SubmissionHistory.tsx                   # History list component
```

### 3.2 URL Structure and Access Control

| Route Pattern | Page Type | Access Control | Description |
|---------------|-----------|----------------|-------------|
| `/vendor-portal/[token]` | Portal | Token-Based (Public) | Vendor price submission portal |

**Note**: Staff-side routes for campaigns, templates, and pricelists are documented in their respective modules.

### 3.3 Navigation Hierarchy

**Vendor Portal Navigation** (Token-Based):
```
Vendor Portal
├── Welcome (Campaign Info)
├── Submit Prices
│   ├── Online Entry
│   ├── Upload Excel
│   └── Download Template
├── Review (Submission Summary)
└── History (Past Submissions)
```

---

## 4. Component Specifications

### 4.1 Vendor Portal Component Architecture

| Component | File Location | Purpose | Key Props |
|-----------|--------------|---------|-----------|
| VendorPortalLayout | `/vendor-portal/components/VendorPortalLayout.tsx` | Portal layout wrapper | token, campaign, children |
| TokenValidator | `/vendor-portal/components/TokenValidator.tsx` | Validate token and load data | token, onValidated, onError |
| WelcomePanel | `/vendor-portal/components/WelcomePanel.tsx` | Display campaign information | campaign, deadline, instructions |
| PriceSubmissionTabs | `/vendor-portal/components/PriceSubmissionTabs.tsx` | Tabbed submission interface | token, campaign, pricelist |
| OnlinePriceEntry | `/vendor-portal/components/OnlinePriceEntry.tsx` | Online price entry form | products, onSave, onSubmit |
| ProductPricingTable | `/vendor-portal/components/ProductPricingTable.tsx` | Price entry table | products, currency, onPriceChange |
| MOQPricingComponent | `/vendor-portal/components/MOQPricingComponent.tsx` | MOQ tier editor (max 5 tiers) | productId, tiers, onTiersChange |
| ExcelUploadComponent | `/vendor-portal/components/ExcelUploadComponent.tsx` | Excel file upload and parse | token, onUploadSuccess, onError |
| ExcelTemplateGenerator | `/vendor-portal/components/ExcelTemplateGenerator.tsx` | Generate download template | products, campaignId |
| AutoSaveIndicator | `/vendor-portal/components/AutoSaveIndicator.tsx` | Auto-save status display | lastSaved, isSaving |
| ProgressTracker | `/vendor-portal/components/ProgressTracker.tsx` | Completion progress widget | totalItems, completedItems |
| SubmissionSummary | `/vendor-portal/components/SubmissionSummary.tsx` | Review submission details | pricelist, readonly |
| SubmissionHistory | `/vendor-portal/components/SubmissionHistory.tsx` | Past submissions list | token, submissions |

### 4.2 Shared Component Library

| Component | Purpose | Usage |
|-----------|---------|-------|
| DataTable | Sortable table | Product pricing table |
| StatusBadge | Status indicator | Pricelist status (draft, submitted) |
| ProgressBar | Visual progress indicator | Completion percentage |
| FileUploader | Drag-and-drop file upload | Excel upload |
| Tabs | Tab navigation | Portal tabs (Welcome, Submit, Review, History) |
| Card | Content container | Section containers |
| Alert | Status messages | Warnings, errors, success messages |

---

## 5. API Design

### 5.1 Server Actions (Next.js 14)

**Token Validation**:
- `validateToken(token)` - Validate token and load campaign/pricelist data

**Draft Management**:
- `savePricelistDraft(token, data)` - Auto-save draft (called every 2 minutes)
- `savePricelistItemDraft(token, itemId, data)` - Save single item on field blur

**Submission**:
- `submitPricelist(token, data)` - Final submission (status: draft → submitted, becomes active immediately)

**Excel Operations**:
- `uploadExcelPricelist(token, file)` - Upload and parse Excel file
- `downloadExcelTemplate(token)` - Generate and download Excel template

### 5.2 API Response Format

All API responses follow standard format:
- Success: `{ success: true, data: {...}, message?: string }`
- Error: `{ success: false, error: { code, message, details } }`

### 5.3 Data Validation

- **Client-side**: Zod schemas with React Hook Form
- **Server-side**: Zod schema validation in server actions
- **Database-level**: Prisma schema constraints

**Key Validations**:
- Price must be positive number
- MOQ quantities must be in ascending order
- Maximum 5 MOQ tiers per product
- Currency is required
- Effective start date is required
- Effective end date (if provided) must be after start date

---

## 6. Security Requirements

### 6.1 Token-Based Authentication

- **No username/password required**: Vendors access portal via unique token only
- **UUID v4 tokens**: Cryptographically secure random identifiers
- **Token expiration**: Based on campaign end date
- **One token per vendor per campaign**: Prevents duplicate submissions
- **Unlimited access**: Vendor can access portal unlimited times before expiration

### 6.2 Token Security Measures

| Measure | Implementation |
|---------|----------------|
| Token Generation | Cryptographically secure UUID v4 |
| Token Storage | Hashed or encrypted in database |
| Token Validation | Format check, existence check, expiration check, campaign status check |
| Access Logging | IP address, user agent, access times logged |
| Rate Limiting | Prevent brute force token guessing |

### 6.3 Data Protection

| Protection | Implementation |
|------------|----------------|
| Input Sanitization | All user inputs sanitized |
| SQL Injection | Parameterized queries via Prisma |
| XSS Prevention | React auto-escaping, CSP headers |
| CSRF Protection | Next.js built-in CSRF tokens |
| File Upload | Type validation, size limits (10MB), content scanning |

### 6.4 Audit Logging

Log all portal operations:
- Token access attempts (success/failure)
- Draft saves (timestamps)
- Pricelist submissions
- Excel uploads
- File downloads

---

## 7. Performance Requirements

### 7.1 Page Load Targets

| Page | Target Load Time | Max Bundle Size |
|------|------------------|-----------------|
| Vendor Portal (initial) | < 1.5s | 300KB |
| Price Entry (with products) | < 2s | 400KB |

### 7.2 Excel Processing Targets

| Operation | Target Time | Max File Size |
|-----------|-------------|---------------|
| Excel Upload & Parse | < 5s | 10MB (1000 items) |
| Template Generation | < 3s | 5MB (500 items) |
| Data Validation | < 2s | 1000 items |

### 7.3 Auto-Save Performance

| Parameter | Value |
|-----------|-------|
| Auto-save interval | 2 minutes |
| Field blur save debounce | 500ms |
| Save operation timeout | 5 seconds |
| Retry attempts | 3 |

### 7.4 Optimization Strategies

- Server-side rendering (SSR) for initial token validation
- Lazy loading for Excel upload/download components
- React Query caching (5-minute stale time)
- Optimistic UI updates for save operations
- Excel processing in web workers (large files)
- Pagination for product list (50 items per page)

---

## 8. Integration Points

### 8.1 Campaign Integration

**Integration with**: [requests-for-pricing](../requests-for-pricing/) module

The vendor portal receives:
- Campaign ID and details from invitation token
- Product list from campaign template
- Submission deadline from campaign settings

### 8.2 Pricelist Storage Integration

**Integration with**: [price-lists](../price-lists/) module

Submitted pricelists are stored in:
- `tb_pricelist` - Pricelist header (vendor, dates, currency)
- `tb_pricelist_detail` - Line items with pricing

### 8.3 Email Service Integration

**Provider Options**: SMTP, SendGrid, AWS SES

**Email Types Sent from Portal**:
- Submission confirmation (to vendor)
- Notification to campaign owner (when vendor submits)

**Note**: Invitation emails are sent from the [requests-for-pricing](../requests-for-pricing/) module.

### 8.4 File Storage Integration

**Provider Options**: AWS S3, Azure Blob Storage, Google Cloud Storage

**Use Cases**:
- Excel file uploads (vendor submissions)
- Generated Excel templates (cached)

**Storage Organization**:
```
/vendor-portal/
  /submissions/{pricelistId}/
    /upload.xlsx
  /templates/{campaignId}/
    /template.xlsx
```

---

## Appendix A: Source Code References

| Source File | Key Features |
|-------------|--------------|
| `/app/(main)/vendor-management/vendor-portal/sample/page.tsx` | Vendor portal UI implementation |
| `/app/(main)/vendor-management/templates/components/MOQPricingComponent.tsx` | MOQ tier pricing component |
| `/app/(main)/vendor-management/types/index.ts` | Type definitions |

---

## Appendix B: Related Module Documentation

| Module | Documentation Path | Purpose |
|--------|-------------------|---------|
| Requests for Pricing | `../requests-for-pricing/` | Campaign creation, vendor invitations |
| Pricelist Templates | `../pricelist-templates/` | Template creation and management |
| Price Lists | `../price-lists/` | Price list viewing and management |
| Vendor Directory | `../vendor-directory/` | Vendor profiles and master data |

---

## Appendix C: Technology Documentation

- **Next.js 14**: https://nextjs.org/docs
- **Shadcn/ui**: https://ui.shadcn.com
- **Prisma**: https://www.prisma.io/docs
- **ExcelJS**: https://github.com/exceljs/exceljs
- **React Hook Form**: https://react-hook-form.com
- **Zod**: https://zod.dev
- **React Query**: https://tanstack.com/query

---

**Document End**

**Implementation Notes**:
- This document focuses ONLY on vendor-facing portal functionality
- Staff-side features (campaigns, templates, pricelist management) are in separate modules
- No approval workflow - pricelists go from draft → submitted (active) directly
- Token is the only authentication method for vendors
