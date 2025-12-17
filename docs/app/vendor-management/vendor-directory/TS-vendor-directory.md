# Vendor Directory - Technical Specification (TS)

## Document Information
- **Document Type**: Technical Specification Document
- **Module**: Vendor Management > Vendor Directory
- **Version**: 2.3.0
- **Last Updated**: 2025-11-25
- **Document Status**: Updated

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 2.3.0 | 2025-11-25 | System | Restructured to remove implementation code; Focus on architecture and sitemap |
| 2.2.0 | 2025-11-25 | System | Enhanced sitemap with certification management and Asian address format; Updated data structures |
| 2.1.0 | 2025-11-25 | System | Added multi-address and multi-contact management with primary designation |
| 2.0.0 | 2025-11-25 | System | Updated to match actual code implementation |
| 1.0 | 2024-01-15 | System | Initial creation |

---

## 1. Technical Overview

### 1.1 Technology Stack

**Frontend**:
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript 5.8.2 (strict mode)
- **Styling**: Tailwind CSS + Shadcn/ui components
- **State Management**: Zustand (global UI state), React Query / TanStack Query (server state, caching)
- **Forms**: React Hook Form + Zod validation
- **UI Components**: Radix UI primitives with Lucide React icons
- **Date Handling**: date-fns

**Backend**:
- **Framework**: Next.js 14 Server Actions + Route Handlers
- **ORM**: Prisma Client
- **Database**: PostgreSQL with JSONB support
- **Authentication**: NextAuth.js
- **File Storage**: AWS S3 / Azure Blob Storage
- **Email**: SendGrid / AWS SES
- **Search**: PostgreSQL Full-Text Search with GIN indexes

**Infrastructure**:
- **Hosting**: Vercel / AWS / Azure
- **CDN**: Vercel Edge Network / CloudFront
- **Monitoring**: Sentry (errors), Vercel Analytics (performance)
- **Version Control**: Git

### 1.2 Architecture Pattern

**Pattern**: Next.js App Router with Server Components (default) + Client Components (interactive)

**Folder Structure**:
```
app/
└── (main)/
    └── vendor-management/
        └── vendor-directory/
            ├── page.tsx                 # Server Component (list view)
            ├── [id]/
            │   ├── page.tsx             # Server Component (detail view)
            │   └── edit/
            │       └── page.tsx         # Server Component with Client form
            ├── new/
            │   └── page.tsx             # Server Component with Client form
            ├── components/
            │   ├── VendorList.tsx       # Client Component (interactive list)
            │   ├── VendorCard.tsx       # Client Component
            │   ├── VendorForm.tsx       # Client Component (form)
            │   ├── ContactList.tsx      # Client Component
            │   ├── AddressList.tsx      # Client Component
            │   ├── CertificationList.tsx # Client Component
            │   ├── DocumentList.tsx     # Client Component
            │   └── PerformanceCard.tsx  # Server Component
            ├── actions.ts               # Server Actions (mutations)
            ├── schemas.ts               # Zod validation schemas
            └── types.ts                 # TypeScript interfaces
```

### 1.3 Data Flow Architecture

```
User Interface (Client Components)
        ↓
Server Actions / Route Handlers
        ↓
Business Logic Layer
        ↓
Prisma ORM
        ↓
PostgreSQL Database (JSONB fields)
```

**Key Principles**:
- Server Components for data fetching (default)
- Client Components only for interactivity
- Server Actions for mutations (preferred over API routes)
- React Query for client-side caching
- Optimistic updates for better UX

---

## 2. Database Implementation

### 2.1 Primary Tables

Based on existing Prisma schema:

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `tb_vendor` | Main vendor entity | id, name, description, business_type_id, tax_profile_id, is_active, info (JSONB), deleted_at |
| `tb_vendor_address` | Vendor addresses | id, vendor_id, is_active, data (JSONB) |
| `tb_vendor_contact` | Vendor contacts | id, vendor_id, is_active, info (JSONB) |
| `tb_vendor_business_type` | Business type classification | id, name, description |

**Key Strategy**: Use existing JSON fields (`info`, `data`) for extended data without schema modifications.

### 2.2 JSON Structure Overview

#### tb_vendor.info Structure
| Section | Purpose | Key Fields |
|---------|---------|------------|
| profile | Extended profile data | vendorCode, legalName, dbaName, website, industry, yearEstablished, numberOfEmployees |
| status | Status tracking | currentStatus, statusChangedAt, statusChangedBy, statusReason, statusHistory[] |
| paymentTerms | Financial configuration | termsType, daysNet, earlyPaymentDiscount, creditLimit, defaultCurrency, bankingDetails |
| performance | Performance metrics | overallRating, metrics (quality, delivery, service, pricing), transactionCount, totalSpend |
| locations | Location assignments | assignments[] with locationId, isPrimary, deliveryDays, minimumOrderValue |
| approval | Workflow tracking | submittedAt, submittedBy, currentStage, approvalHistory[] |
| documents | Document storage | documents[] with type, number, name, fileUrl, issueDate, expiryDate, status |
| categorization | Classification | primaryType, secondaryCategories[], industryTags[], isPreferred, spendTier |
| compliance | Compliance tracking | requiredCertifications[], currentCertifications[], insurancePolicies[] |

#### tb_vendor_contact.info Structure
| Section | Purpose | Key Fields |
|---------|---------|------------|
| identity | Contact identity | fullName, title, department, role |
| contactMethods | Communication channels | primaryEmail, secondaryEmail, phoneNumbers[] |
| preferences | Communication preferences | preferredMethod, language, timezone, availability |
| status | Contact status | status, isPreferredContact, notes |

#### tb_vendor_address.data Structure (Asian International Format)
| Field | Description | Required |
|-------|-------------|----------|
| addressLine1 | Street address | Yes |
| addressLine2 | Additional address info | No |
| subDistrict | Tambon/Kelurahan/Phường/Barangay | Country-dependent |
| district | Amphoe/Kecamatan/Quận | Country-dependent |
| city | City name | Yes |
| province | Province/State | Country-dependent |
| postalCode | Postal/ZIP code | Yes |
| country | ISO 3166-1 alpha-2 code | Yes |
| isPrimary | Primary address flag | Yes |
| isActive | Active status | Yes |
| deliveryInstructions | Special instructions | No |
| geolocation | Lat/Long coordinates | No |

### 2.3 Database Indexes

| Index | Type | Purpose |
|-------|------|---------|
| idx_vendor_search | GIN (full-text) | Search on name, description, note |
| idx_vendor_info_vendor_code | GIN (trigram) | Vendor code lookup |
| idx_vendor_info_status | GIN | Status filtering |
| idx_vendor_info_rating | B-tree | Rating-based queries |
| idx_vendor_contact_email | GIN (trigram) | Email search |
| idx_vendor_documents_expiry | GIN | Document expiry monitoring |
| idx_vendor_active | B-tree (partial) | Active vendors only |

---

## 3. Component Architecture

### 3.1 Page Components

#### List Page
- **File**: `page.tsx`
- **Type**: Server Component
- **Features**: Pagination, search, filtering, bulk actions
- **Data Fetching**: Server-side with Suspense boundaries

#### Detail Page
- **File**: `[id]/page.tsx`
- **Type**: Server Component
- **Features**: Tabbed interface, status management, related data
- **Data Fetching**: Server-side with parallel data loading

#### Create/Edit Pages
- **File**: `new/page.tsx`, `[id]/edit/page.tsx`
- **Type**: Server Component with Client form
- **Features**: Multi-step form, validation, draft saving

### 3.2 Client Components

| Component | Purpose | Features |
|-----------|---------|----------|
| VendorList | Interactive vendor list | Filtering, sorting, pagination, bulk selection |
| VendorCard | Vendor display card | Status badge, quick actions, rating display |
| VendorForm | Create/edit form | Tabbed form, validation, address/contact management |
| ContactList | Contact management | CRUD operations, primary designation |
| AddressList | Address management | CRUD operations, Asian format, primary designation |
| CertificationList | Certification management | CRUD operations, status auto-calculation |
| DocumentList | Document management | Upload, preview, expiry tracking |

### 3.3 Form Tabs Structure

| Tab | Purpose | Key Fields |
|-----|---------|------------|
| Basic Info | Company information | vendorCode, name, legalName, businessType, industry, website, description |
| Addresses | Location management | Multi-address with Asian international format, primary designation |
| Contacts | Contact management | Multi-contact, roles, communication preferences, primary designation |
| Certifications | Compliance | 16 certification types, expiry tracking, document upload |
| Financial | Payment configuration | paymentTerms, creditLimit, currency, bankingDetails |

---

## 4. Server Actions

### 4.1 Vendor CRUD Actions

| Action | Purpose | Parameters |
|--------|---------|------------|
| getVendors | List vendors with filters | page, limit, search, status, rating |
| getVendorById | Get single vendor | id |
| createVendor | Create new vendor | VendorFormData |
| updateVendor | Update existing vendor | id, VendorFormData |
| archiveVendor | Soft delete vendor | id, reason |
| changeVendorStatus | Status workflow | id, newStatus, reason |

### 4.2 Contact Actions

| Action | Purpose | Parameters |
|--------|---------|------------|
| getVendorContacts | List contacts | vendorId |
| addVendorContact | Add new contact | vendorId, ContactFormData |
| updateVendorContact | Update contact | contactId, ContactFormData |
| deleteVendorContact | Remove contact | contactId |
| setPrimaryContact | Set primary | vendorId, contactId |

### 4.3 Address Actions

| Action | Purpose | Parameters |
|--------|---------|------------|
| getVendorAddresses | List addresses | vendorId |
| addVendorAddress | Add new address | vendorId, AddressFormData |
| updateVendorAddress | Update address | addressId, AddressFormData |
| deleteVendorAddress | Remove address | addressId |
| setPrimaryAddress | Set primary | vendorId, addressId |

### 4.4 Certification Actions

| Action | Purpose | Parameters |
|--------|---------|------------|
| getVendorCertifications | List certifications | vendorId |
| addVendorCertification | Add certification | vendorId, CertificationFormData |
| updateVendorCertification | Update certification | certificationId, CertificationFormData |
| deleteVendorCertification | Remove certification | certificationId |

### 4.5 Document Actions

| Action | Purpose | Parameters |
|--------|---------|------------|
| uploadVendorDocument | Upload document | vendorId, FormData (file + metadata) |
| getVendorDocuments | List documents | vendorId |
| deleteVendorDocument | Remove document | documentId |

---

## 5. Validation Schemas

### 5.1 Schema Overview

| Schema | Purpose | Key Validations |
|--------|---------|-----------------|
| vendorSchema | Main vendor form | vendorCode (unique), name (required), businessType (required) |
| vendorContactSchema | Contact form | fullName, primaryEmail (valid format), role |
| vendorAddressSchema | Address form | Country-specific validation, postal code format, required fields by country |
| vendorCertificationSchema | Certification form | certificationType, certificateNumber, issueDate, expiryDate (after issue) |
| vendorDocumentSchema | Document upload | documentType, documentNumber, file size/type limits |

### 5.2 Address Validation by Country

| Country | Sub-District | District | Province | Postal Format |
|---------|--------------|----------|----------|---------------|
| TH (Thailand) | Optional | Required | Required | 5 digits |
| SG (Singapore) | N/A | N/A | N/A | 6 digits |
| MY (Malaysia) | N/A | N/A | Required | 5 digits |
| ID (Indonesia) | Required | Required | Required | 5 digits |
| VN (Vietnam) | Required | Required | Required | 6 digits |
| PH (Philippines) | Required | N/A | Required | 4 digits |
| JP (Japan) | N/A | N/A | Required | ###-#### |
| KR (South Korea) | N/A | Required | Required | 5 digits |
| CN (China) | N/A | Required | Required | 6 digits |
| IN (India) | N/A | Required | Required | 6 digits |
| US (United States) | N/A | N/A | Required | 5 or 9 digits |

---

## 6. Performance Optimization

### 6.1 Caching Strategy

| Layer | Strategy | TTL |
|-------|----------|-----|
| React Query | Client-side caching | 5 minutes stale, 10 minutes cache |
| Server Components | Next.js data cache | Request-level |
| Database | Connection pooling | Managed by Prisma |

### 6.2 Query Optimization

| Technique | Application |
|-----------|-------------|
| Selective fields | Only fetch required fields for list views |
| Cursor pagination | For large datasets (more efficient than offset) |
| Parallel queries | Promise.all for independent data fetches |
| Optimistic updates | Immediate UI updates before server confirmation |

---

## 7. Security Implementation

### 7.1 Authentication & Authorization

| Layer | Implementation |
|-------|----------------|
| Authentication | NextAuth.js with session management |
| Authorization | Role-based access control (RBAC) |
| Permission checks | Server-side validation in all actions |
| Session validation | Per-request user verification |

### 7.2 Data Protection

| Aspect | Implementation |
|--------|----------------|
| Sensitive data encryption | AES-256-GCM for banking details |
| Input sanitization | DOMPurify for HTML, Zod for validation |
| SQL injection | Parameterized queries via Prisma |
| XSS prevention | React's built-in escaping, CSP headers |

### 7.3 File Upload Security

| Check | Validation |
|-------|------------|
| File size | Maximum 50MB |
| File type | Whitelist: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG |
| Malware scan | Pre-upload validation (optional) |
| Storage | Isolated S3 bucket with restricted access |

---

## 8. Testing Strategy

### 8.1 Test Types

| Type | Framework | Focus |
|------|-----------|-------|
| Unit Tests | Vitest | Individual functions, utilities |
| Integration Tests | Vitest + Testing Library | Component interactions, data flow |
| E2E Tests | Playwright | Full user workflows |

### 8.2 Coverage Targets

| Area | Target |
|------|--------|
| Server Actions | 80% |
| Validation Schemas | 100% |
| Critical Paths | 90% |
| UI Components | 70% |

---

## Sitemap

### Overview
This section provides a complete navigation structure of all pages, tabs, and dialogues in the Vendor Directory sub-module, including certification management and Asian international address format support.

### Page Hierarchy

```mermaid
graph TD
    ListPage['List Page<br>/vendor-management/vendor-directory']
    CreatePage['Create Page<br>/vendor-management/vendor-directory/new']
    DetailPage["Detail Page<br>/vendor-management/vendor-directory/[id]"]
    EditPage["Edit Page<br>/vendor-management/vendor-directory/[id]/edit"]

    %% List Page Tabs
    ListPage --> ListTab1['Tab: All Items']
    ListPage --> ListTab2['Tab: Active']
    ListPage --> ListTab3['Tab: Archived']

    %% List Page Dialogues
    ListPage -.-> ListDialog1['Dialog: Quick Create']
    ListPage -.-> ListDialog2['Dialog: Bulk Actions']
    ListPage -.-> ListDialog3['Dialog: Export']
    ListPage -.-> ListDialog4['Dialog: Advanced Filter']

    %% Detail Page Tabs
    DetailPage --> DetailTab1['Tab: Overview']
    DetailPage --> DetailTab2['Tab: Contacts']
    DetailPage --> DetailTab3['Tab: Addresses']
    DetailPage --> DetailTab4['Tab: Certifications']
    DetailPage --> DetailTab5['Tab: Documents']
    DetailPage --> DetailTab6['Tab: History']

    %% Detail Page - Certification Dialogues
    DetailTab4 -.-> CertDialog1['Dialog: Add Certification']
    DetailTab4 -.-> CertDialog2['Dialog: Edit Certification']
    DetailTab4 -.-> CertDialog3['Dialog: Delete Certification']
    DetailTab4 -.-> CertDialog4['Dialog: View Certification Details']

    %% Detail Page - Contact Dialogues
    DetailTab2 -.-> ContactDialog1['Dialog: Add Contact']
    DetailTab2 -.-> ContactDialog2['Dialog: Edit Contact']
    DetailTab2 -.-> ContactDialog3['Dialog: Delete Contact']
    DetailTab2 -.-> ContactDialog4['Dialog: Set Primary Contact']

    %% Detail Page - Address Dialogues
    DetailTab3 -.-> AddressDialog1['Dialog: Add Address']
    DetailTab3 -.-> AddressDialog2['Dialog: Edit Address']
    DetailTab3 -.-> AddressDialog3['Dialog: Delete Address']
    DetailTab3 -.-> AddressDialog4['Dialog: Set Primary Address']

    %% Detail Page - Document Dialogues
    DetailTab5 -.-> DocDialog1['Dialog: Upload Document']
    DetailTab5 -.-> DocDialog2['Dialog: View Document']
    DetailTab5 -.-> DocDialog3['Dialog: Delete Document']

    %% Detail Page Main Dialogues
    DetailPage -.-> DetailDialog1['Dialog: Status Change']
    DetailPage -.-> DetailDialog2['Dialog: Delete Vendor']
    DetailPage -.-> DetailDialog3['Dialog: Archive Vendor']

    %% Create Page Form Tabs
    CreatePage --> CreateTab1['Tab: Basic Info']
    CreatePage --> CreateTab2['Tab: Addresses']
    CreatePage --> CreateTab3['Tab: Contacts']
    CreatePage --> CreateTab4['Tab: Certifications']
    CreatePage --> CreateTab5['Tab: Financial']

    %% Create/Edit Address Dialogues
    CreateTab2 -.-> CreateAddrDialog1['Dialog: Add Address<br>(Asian International Format)']
    CreateTab2 -.-> CreateAddrDialog2['Dialog: Edit Address']

    %% Create/Edit Contact Dialogues
    CreateTab3 -.-> CreateContactDialog1['Dialog: Add Contact']
    CreateTab3 -.-> CreateContactDialog2['Dialog: Edit Contact']

    %% Create/Edit Certification Dialogues
    CreateTab4 -.-> CreateCertDialog1['Dialog: Add Certification<br>(16 Types)']
    CreateTab4 -.-> CreateCertDialog2['Dialog: Edit Certification']

    %% Create Page Dialogues
    CreatePage -.-> CreateDialog1['Dialog: Cancel Confirm']
    CreatePage -.-> CreateDialog2['Dialog: Save Draft']

    %% Edit Page Form Tabs
    EditPage --> EditTab1['Tab: Basic Info']
    EditPage --> EditTab2['Tab: Addresses']
    EditPage --> EditTab3['Tab: Contacts']
    EditPage --> EditTab4['Tab: Certifications']
    EditPage --> EditTab5['Tab: Financial']

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
    style DetailTab4 fill:#f3e5f5
    style DetailTab3 fill:#e3f2fd
```

### Pages

#### 1. List Page
**Route**: `/vendor-management/vendor-directory`
**Purpose**: Display paginated list of all vendors with certification status indicators

**Sections**:
- Header: Title, breadcrumbs, primary actions
- Filters: Quick filters, advanced filter panel (includes certification status filter)
- Search: Global search with autocomplete
- Data Table: Sortable columns, row actions, bulk selection
- Certification Status Indicators: Visual badges for certification status
- Pagination: Page size selector, page navigation

**Tabs**:
| Tab | Description |
|-----|-------------|
| All Items | Complete list of all vendors |
| Active | Filter active items only |
| Archived | View archived items |

**Dialogues**:
| Dialog | Purpose |
|--------|---------|
| Quick Create | Fast creation form with essential fields only |
| Bulk Actions | Multi-select actions (delete, export, status change) |
| Export | Export data in various formats (CSV, Excel, PDF) |
| Advanced Filter | Filtering including certification type/status, country, business type |

---

#### 2. Detail Page
**Route**: `/vendor-management/vendor-directory/[id]`
**Purpose**: Display comprehensive vendor details with full certification management

**Sections**:
- Header: Breadcrumbs, vendor title, status badge, action buttons
- Info Cards: Multiple cards showing different aspects
- Certification Summary: Quick view of certification status counts
- Related Data: Associated records and relationships

**Tabs**:

##### Tab: Overview
- Company Information
- Business Type & Classification
- Payment Terms Summary
- Performance Metrics
- Location Assignments
- Certification Status Summary (active/expired/expiring_soon counts)

##### Tab: Contacts
- Contact List with Primary Designation
- Contact Cards with communication preferences
- Quick Actions: Add, Edit, Delete, Set Primary

**Tab Dialogues**:
| Dialog | Purpose |
|--------|---------|
| Add Contact | Form with full contact details, primary designation |
| Edit Contact | Modify existing contact |
| Delete Contact | Confirmation with dependency check |
| Set Primary Contact | Change primary contact designation |

##### Tab: Addresses (Asian International Format)
- Address List with Primary Designation
- Support for 15 countries with Asian international format
- Address Fields: addressLine1, addressLine2, subDistrict, district, city, province, postalCode, country
- Quick Actions: Add, Edit, Delete, Set Primary

**Tab Dialogues**:
| Dialog | Purpose |
|--------|---------|
| Add Address | Form with Asian international format fields |
| Edit Address | Modify existing address |
| Delete Address | Confirmation with dependency check |
| Set Primary Address | Change primary address designation |

##### Tab: Certifications (Full CRUD)
- Certification List with Status Indicators
- Auto-calculated status: active, expired, expiring_soon (30-day threshold), pending
- Visual indicators: Green (active), Red (expired), Yellow (expiring_soon), Gray (pending)
- 16 Certification Types supported
- Quick Actions: Add, Edit, Delete, View Details

**Tab Dialogues**:
| Dialog | Purpose |
|--------|---------|
| Add Certification | Certification Type dropdown (16 types), Certificate Number, Issuing Authority, Dates, Document upload |
| Edit Certification | Modify existing certification |
| Delete Certification | Confirmation dialog |
| View Certification Details | Read-only detailed view with document preview |

**Certification Types (16)**:
1. ISO 9001 (Quality Management)
2. ISO 14001 (Environmental Management)
3. ISO 22000 (Food Safety Management)
4. ISO 45001 (Occupational Health & Safety)
5. HACCP (Hazard Analysis Critical Control Points)
6. GMP (Good Manufacturing Practice)
7. Halal Certification
8. Kosher Certification
9. Organic Certification
10. Fair Trade Certification
11. FDA Approval
12. CE Marking
13. Business License
14. Trade License
15. Import/Export License
16. Other

##### Tab: Documents
- Document List with Expiry Tracking
- Document Categories: Contract, Certificate, Insurance, Tax Document, etc.
- Quick Actions: Upload, View, Delete

**Tab Dialogues**:
| Dialog | Purpose |
|--------|---------|
| Upload Document | File upload with metadata |
| View Document | Document preview |
| Delete Document | Confirmation dialog |

##### Tab: History
- Status Change History
- Audit Trail
- User Actions Log

**Main Page Dialogues**:
| Dialog | Purpose |
|--------|---------|
| Status Change | Change vendor status with reason |
| Delete Vendor | Soft delete confirmation with dependency check |
| Archive Vendor | Archive with reason |

---

#### 3. Create Page
**Route**: `/vendor-management/vendor-directory/new`
**Purpose**: Create new vendor with full certification and address management

**Form Tabs**:

##### Tab: Basic Info
- Vendor Code (auto-generated or manual)
- Company Name (required)
- Legal Name
- Business Type (required)
- Industry
- Website
- Description

##### Tab: Addresses (Asian International Format)
- Multi-address support with primary designation
- Asian international format fields:
  - Address Line 1 (required)
  - Address Line 2
  - Sub-District (Tambon/Kelurahan)
  - District (Amphoe/Kecamatan)
  - City
  - Province/State
  - Postal Code (required)
  - Country (15 supported countries)
  - Primary Address toggle

**Tab Dialogues**:
| Dialog | Purpose |
|--------|---------|
| Add Address | Form with country-aware field labels |
| Edit Address | Modify address before save |

##### Tab: Contacts
- Multi-contact support with primary designation
- Contact fields: Name, Title, Role, Email, Phone
- Communication preferences

**Tab Dialogues**:
| Dialog | Purpose |
|--------|---------|
| Add Contact | Full contact form |
| Edit Contact | Modify contact before save |

##### Tab: Certifications
- Add certifications during vendor creation
- 16 certification types
- Expiry tracking setup

**Tab Dialogues**:
| Dialog | Purpose |
|--------|---------|
| Add Certification | Certification form with type selection |
| Edit Certification | Modify certification before save |

##### Tab: Financial
- Payment Terms (Net 7/15/30/45/60/90)
- Credit Limit
- Default Currency
- Banking Details (optional, encrypted)

**Page Dialogues**:
| Dialog | Purpose |
|--------|---------|
| Cancel Confirm | Confirm discarding unsaved changes |
| Save Draft | Save incomplete form as draft |

---

#### 4. Edit Page
**Route**: `/vendor-management/vendor-directory/[id]/edit`
**Purpose**: Modify existing vendor with full certification and address management

**Form Tabs**: Same structure as Create Page
- Tab: Basic Info
- Tab: Addresses (Asian International Format)
- Tab: Contacts
- Tab: Certifications
- Tab: Financial

**Sections**:
- Form Header: Title, Save/Cancel/Delete actions
- Form Fields: Pre-populated with existing data
- Change Tracking: Highlight modified fields
- Certification Status: Auto-calculated and displayed

**Dialogues**:
| Dialog | Purpose |
|--------|---------|
| Discard Changes | Confirm discarding modifications |
| Save Draft | Save changes as draft |

---

### Supported Countries (15)
| Code | Country | Region |
|------|---------|--------|
| TH | Thailand | Southeast Asia |
| SG | Singapore | Southeast Asia |
| MY | Malaysia | Southeast Asia |
| ID | Indonesia | Southeast Asia |
| VN | Vietnam | Southeast Asia |
| PH | Philippines | Southeast Asia |
| MM | Myanmar | Southeast Asia |
| KH | Cambodia | Southeast Asia |
| LA | Laos | Southeast Asia |
| BN | Brunei | Southeast Asia |
| CN | China | East Asia |
| JP | Japan | East Asia |
| KR | South Korea | East Asia |
| IN | India | South Asia |
| US | United States | North America |

---

### Certification Status Auto-Calculation

| Status | Condition | Visual Indicator |
|--------|-----------|------------------|
| active | expiryDate > today + 30 days | Green badge |
| expiring_soon | today < expiryDate <= today + 30 days | Yellow badge with warning icon |
| expired | expiryDate < today | Red badge |
| pending | expiryDate is null | Gray badge |

---

### Dialog Summary by Feature

#### Address Management Dialogues
| Dialog | Location | Purpose |
|--------|----------|---------|
| Add Address | Detail/Create/Edit Pages | Create new address with Asian format |
| Edit Address | Detail/Create/Edit Pages | Modify existing address |
| Delete Address | Detail Page | Remove address with confirmation |
| Set Primary | Detail Page | Designate primary address |

#### Contact Management Dialogues
| Dialog | Location | Purpose |
|--------|----------|---------|
| Add Contact | Detail/Create/Edit Pages | Create new contact |
| Edit Contact | Detail/Create/Edit Pages | Modify existing contact |
| Delete Contact | Detail Page | Remove contact with confirmation |
| Set Primary | Detail Page | Designate primary contact |

#### Certification Management Dialogues
| Dialog | Location | Purpose |
|--------|----------|---------|
| Add Certification | Detail/Create/Edit Pages | Add new certification (16 types) |
| Edit Certification | Detail/Create/Edit Pages | Modify certification details |
| Delete Certification | Detail Page | Remove certification with confirmation |
| View Details | Detail Page | Read-only detailed view |

#### Document Management Dialogues
| Dialog | Location | Purpose |
|--------|----------|---------|
| Upload Document | Detail Page | Upload new document |
| View Document | Detail Page | Preview document |
| Delete Document | Detail Page | Remove document with confirmation |

---

## Related Documents
- [BR-vendor-directory.md](BR-vendor-directory.md) - Business Requirements (v2.2.0)
- [DD-vendor-directory.md](DD-vendor-directory.md) - Data Dictionary (v2.2.0)
- [UC-vendor-directory.md](UC-vendor-directory.md) - Use Cases (v2.2.0)
- [FD-vendor-directory.md](FD-vendor-directory.md) - Flow Diagrams (v2.2.0)
- [VAL-vendor-directory.md](VAL-vendor-directory.md) - Validations (v2.2.0)

---

**End of Technical Specification Document**
