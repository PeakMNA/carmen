# Vendor Directory - Business Requirements (BR)

## Document Information
- **Document Type**: Business Requirements Document
- **Module**: Vendor Management > Vendor Directory
- **Version**: 2.3.0
- **Last Updated**: 2025-01-15
- **Document Status**: Updated
- **Route**: `/vendor-management/manage-vendors`

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.3.0 | 2025-01-15 | Claude | Synced with current code: Updated currency list to 12 values (BHT, USD, CNY, SGD, EUR, GBP, CAD, AUD, JPY, CHF, INR, MXN); Added suspended status to 3-value system |
| 2.2.0 | 2025-11-25 | System | Added full certification management with status tracking; Updated address format to Asian international standard |
| 2.1.0 | 2025-11-25 | System | Added multi-address and multi-contact management with primary designation |
| 2.0.0 | 2025-11-25 | System | Updated to match actual code implementation |
| 1.0 | 2024-01-15 | System | Initial creation |


## 1. Executive Summary

The Vendor Directory module serves as the central repository for managing all vendor relationships, contact information, certifications, contracts, and performance metrics. It provides comprehensive vendor lifecycle management from onboarding through relationship maintenance and offboarding.

### 1.1 Purpose
- Centralize vendor information management
- Streamline vendor onboarding and approval processes
- Track vendor certifications, insurance, and compliance
- Manage vendor contacts and communication
- Monitor vendor performance and relationships
- Support procurement decision-making with vendor data

### 1.2 Scope
**In Scope (Implemented)**:
- Vendor profile management (creation, editing)
- Business type categorization
- Multi-address management with primary designation (add, edit, delete)
  - Asian international address format (Address Line 1, Address Line 2, Sub-District, District, City, Province, Postal Code, Country)
- Multi-contact management with primary designation (add, edit, delete)
- **Full certification management with status tracking**:
  - CRUD operations via dialog modal
  - 16 certification types (ISO, HACCP, GMP, Halal, Kosher, Organic, etc.)
  - Auto-calculated status based on expiry dates (Active, Expired, Expiring Soon, Pending)
  - Visual indicators for expired (red) and expiring soon (yellow) certifications
  - Certificate metadata (issuer, certificate number, issue/expiry dates, document URL, notes)
- Vendor status management (active/inactive)
- Tax configuration (Tax ID, Tax Profile, Tax Rate)
- Performance metrics (quality score)
- Currency and payment terms management
- Integration with Price Lists module

**Planned (Not Yet Implemented)**:
- Document upload/attachment for certifications and contracts
- Vendor approval workflows
- Advanced vendor segmentation (preferred, blocaked, blacklisted)
- Bulk import/export functionality

**Out of Scope**:
- Vendor portal functionality (covered in separate module)
- Price list management (covered in Price Lists module)
- RFQ campaigns (covered in Requests for Pricing module)
- Vendor payment processing (covered in Finance module)
- Vendor performance analytics (covered in Reporting & Analytics)

---

## 2. Functional Requirements

### FR-VD-001: Vendor Profile Management
**Priority**: Critical
**Implementation Status**: ✅ Implemented
**Description**: System provides vendor profile creation and management capabilities.

**Implemented Requirements**:
- Create new vendor profiles with required and optional fields
- Edit existing vendor information via inline editing
- Activate/deactivate vendors (status toggle)
- View vendor details with tabbed interface
- Delete vendors with confirmation dialog

**Vendor Form Fields (Create Page - 3 Tabs)**:

**Tab 1 - Basic Info**:
- Company Name * (required)
- Business Type * (required, dropdown)
- Website (optional)
- Status (active/inactive, default: active)
- **Addresses Section** (at least one required):
  - Add/Edit/Delete addresses via dialog modal
  - Asian international address format fields:
    - Label (e.g., "Main Office", "Warehouse")
    - Address Line 1 * (required)
    - Address Line 2 (optional)
    - Sub-District (optional)
    - District (optional)
    - City * (required)
    - Province/State (optional)
    - Postal Code (optional)
    - Country * (required, dropdown with 15 countries)
  - One address designated as Primary (star icon indicator)
  - First address auto-becomes primary
- **Contacts Section** (at least one required):
  - Add/Edit/Delete contacts via dialog modal
  - Contact fields: Name, Title, Email, Phone
  - One contact designated as Primary (star icon indicator)
  - First contact auto-becomes primary

**Tab 2 - Business Details**:
- Company Registration (optional)
- Tax ID (optional)
- Tax Profile (dropdown: None VAT, VAT 7%)
- Preferred Currency (dropdown: BHT, USD, CNY, SGD, EUR, GBP, CAD, AUD, JPY, CHF, INR, MXN) from Currency table.
- Payment Terms (dropdown: Net 30, Net 60, Net 90, 2/10 Net 30, 1/15 Net 45, Due on Receipt, COD)

**Tab 3 - Additional Info**:
- **Certifications Section** (full management):
  - Add/Edit/Delete certifications via dialog modal
  - Certification fields:
    - Certification Name * (required)
    - Certification Type * (required, dropdown with 16 types)
    - Issuer * (required)
    - Certificate Number (optional)
    - Issue Date * (required)
    - Expiry Date * (required)
    - Status (auto-calculated based on expiry date)
    - Document URL (optional)
    - Notes (optional)
  - Available certification types:
    - ISO 9001 - Quality Management
    - ISO 14001 - Environmental Management
    - ISO 22000 - Food Safety Management
    - ISO 45001 - Occupational Health & Safety
    - HACCP - Hazard Analysis Critical Control Points
    - GMP - Good Manufacturing Practice
    - Halal Certification
    - Kosher Certification
    - Organic Certification
    - Fair Trade Certification
    - FDA Approved
    - CE Marking
    - Business License
    - Trade License
    - Import/Export License
    - Other
  - Status auto-calculation:
    - **Active** (green): Expiry date > 30 days in future
    - **Expiring Soon** (yellow): Expiry date within 30 days
    - **Expired** (red): Expiry date has passed
    - **Pending** (gray): For new certifications being processed
- Languages (multi-select/add: English, Spanish, Chinese, etc.)
- Notes (textarea)

**Business Types Available**:
- Food & Beverage
- Hospitality Supplies
- Cleaning Services
- Linen Services
- Technology
- Furniture & Fixtures
- Security Services
- Maintenance Services
- Marketing & Advertising
- Professional Services
- Transportation
- Other

**Business Rules**:
- Company name is required
- Business type is required
- At least one address is required
- At least one contact is required
- First address/contact automatically becomes primary when added
- When deleting primary address/contact, first remaining item becomes primary

**Acceptance Criteria**:
- User can create vendor using 3-tab wizard
- User can add multiple addresses and contacts via dialog modals
- User can designate one address and one contact as primary
- Form validation prevents submission with missing required fields
- User redirected to vendor list on successful creation

---

### FR-VD-002: Vendor Categorization
**Priority**: High
**Implementation Status**: ✅ Partially Implemented
**Description**: System supports basic vendor categorization by business type.

**Implemented Requirements**:
- Single business type classification via dropdown selection
- Business type displayed in list and detail views
- Filter vendors by status (all, active, inactive)


**Not Yet Implemented**:
- Secondary category tags
- Industry classification
- Preferred vendor designation
- Strategic partner classification
- Spend tier classification

**Business Rules**:
- Each vendor must have exactly one business type selected

**Acceptance Criteria**:
- User can filter vendors by status
- Business type displayed in table view column

---

### FR-VD-003: Contact Management
**Priority**: Critical
**Implementation Status**: ✅ Implemented
**Description**: System manages multiple contacts and addresses per vendor with primary designation.

**Implemented Requirements**:
- Multiple contacts per vendor with:
  - Name (displayed in list)
  - Title (optional)
  - Email (validated)
  - Phone (optional)
  - Primary designation (one per vendor)
- Multiple addresses per vendor with:
  - Label (e.g., "Main Office", "Warehouse")
  - Street Address
  - City
  - State/Province (optional)
  - Postal Code (optional)
  - Country
  - Primary designation (one per vendor)
- CRUD operations via dialog modals:
  - Add new contact/address
  - Edit existing contact/address
  - Delete contact/address with confirmation
  - Set as Primary
- Contact/address information displayed on:
  - List page (Primary Contact name column)
  - Detail page Summary Card (primary contact name)
  - Detail page Contacts & Addresses tab (full list with CRUD)
  - Create page Basic Info tab (inline list with CRUD)

**Primary Designation Logic**:
- One contact and one address marked as Primary (star icon)
- First item auto-becomes primary when added to empty list
- When primary is deleted, first remaining item becomes primary
- Primary badge displayed with filled star, non-primary with outline star

**UI Components**:
- Address/Contact list cards with action buttons (Edit, Delete, Set Primary)
- Dialog modals for add/edit forms
- Delete confirmation dialog
- Toast notifications for all operations

**Not Yet Implemented**:
- Contact roles (Sales, Accounts Payable, Technical Support, etc.)
- Contact availability schedule
- Language preference per contact
- Contact status tracking
- Contact notes and interaction history

**Business Rules**:
- At least one contact required for vendor creation
- At least one address required for vendor creation
- Exactly one contact must be designated as primary
- Exactly one address must be designated as primary

**Acceptance Criteria**:
- User can add multiple contacts and addresses
- User can edit existing contacts and addresses via dialog
- User can delete contacts and addresses with confirmation
- User can designate one contact and one address as primary
- Primary contact name displayed in vendor list
- Full contact/address management available on detail page

---

### FR-VD-004: Document Management
**Priority**: High
**Implementation Status**: ⏳ Not Yet Implemented
**Description**: Document management functionality is planned but not yet implemented.

**Planned Requirements**:
- Document types:
  - Contracts (Service agreements, Supply agreements)
  - Certifications (ISO, HACCP, Organic, Halal, etc.)
  - Insurance (Liability, Product liability, Workers comp)
  - Tax documents (W-9, Tax registration)
  - Bank details (for payments)
  - Quality certificates
  - Other attachments
- Document metadata: Type, number, issue date, expiry date, status
- Version control for document updates
- Expiration alerts (30, 60, 90 days before expiry)

**Current State**:
- Certifications can be added as text tags only (no file upload)
- No document upload or management functionality

---

### FR-VD-005: Vendor Approval Workflow
**Priority**: Critical
**Implementation Status**: ⏳ Not Yet Implemented
**Description**: Vendor approval workflow is planned but not yet implemented.

**Planned Requirements**:
- Multi-stage approval workflow
- Approval stages:
  1. Compliance review (documents, certifications)
  2. Financial review (credit check, payment terms)
  3. Quality review (standards, certifications)
  4. Management approval (final authorization)

**Current State**:
- Vendors are created directly without approval workflow
- No approval stages or notifications implemented
- Vendors can be set as active/inactive immediately

---

### FR-VD-006: Vendor Rating and Performance Tracking
**Priority**: High
**Implementation Status**: ✅ Partially Implemented
**Description**: System displays basic vendor performance metrics.

**Implemented Requirements**:
- Performance metrics structure:
  - Quality Score (displayed as X/5 rating)
  - Response Rate
  - Average Response Time
  - On-Time Delivery Rate
  - Total Campaigns
  - Completed Submissions
  - Average Completion Time
- Vendor rating displayed in detail page Summary Card
- Rating badge with visual indicator

**Display on Detail Page**:
- Summary Card shows "Vendor Rating" with score out of 5
- Rating calculated from qualityScore (qualityScore/20 = rating out of 5)
- Award icon with blue background for rating display

**Not Yet Implemented**:
- Automatic rating calculation from transaction data
- Rating history and trends
- Performance reviews
- Scorecard generation
- Performance alerts

**Current State**:
- Performance metrics initialized with default values (0)
- Metrics populated manually or through mock data
- No automatic calculation from GRN or PO data

---

### FR-VD-007: Vendor Status Management
**Priority**: Medium
**Implementation Status**: ✅ Partially Implemented
**Description**: System supports basic vendor status management.

**Implemented Requirements**:
- Vendor status types (3 values used in service layer):
  - **Active**: Vendor available for transactions
  - **Inactive**: Vendor not available for new transactions
  - **Suspended**: Vendor temporarily unavailable (can be reactivated)
- Status toggle switch on detail page header (active/inactive)
- Status badge displayed in list and detail views
- Status filter on list page (All, Active, Inactive)

**Status Display**:
- List page: Badge in Status column
  - Active: Green badge (bg-green-100 text-green-700)
  - Inactive: Gray badge (bg-gray-100 text-gray-600)
- Detail page: Badge next to vendor name + toggle switch

**Status Change**:
- Toggle switch changes status immediately
- Toast notification confirms status change
- No approval workflow for status changes

**Not Yet Implemented**:
- Advanced segmentation (Preferred, Provisional, Blocked, Blacklisted)
- Status change approval workflow
- Status change history tracking
- Automatic status transitions
- PO restrictions based on status

**Acceptance Criteria**:
- Status badges displayed on list and detail pages
- Toggle switch changes status immediately with toast notification

---

### FR-VD-008: Location and Assignment
**Priority**: Medium
**Implementation Status**: ⏳ Not Yet Implemented
**Description**: Location-based vendor assignments are planned but not yet implemented.

**Planned Requirements**:
- Assign vendors to one or multiple locations
- Assign vendors to specific departments
- Location-specific pricing
- Primary location designation

**Current State**:
- No location assignment functionality implemented
- Vendors are system-wide without location restrictions

---

### FR-VD-009: Payment Terms and Currency
**Priority**: High
**Implementation Status**: ✅ Implemented
**Description**: System manages vendor payment terms, currency, and tax configuration.

**Implemented Requirements**:

**Payment Terms** (Create Page - Business Details Tab):
- Net 30
- Net 60
- Net 90
- 2/10 Net 30
- 1/15 Net 45
- Due on Receipt
- COD

**Currency Support** (12 currencies):
- Preferred Currency selection: BHT, USD, CNY, SGD, EUR, GBP, CAD, AUD, JPY, CHF, INR, MXN
- Default: BHT (Thai Baht)

**Tax Configuration** (Detail Page - Overview Tab):
- Tax ID field
- Tax Profile dropdown:
  - None VAT (0%)
  - VAT Thailand (7%)
  - GST Singapore/Australia (10%)
  - Sales Tax USA (8.5%)
  - Custom Rate
- Tax Rate percentage field
- Company Registration field

**Tax Profile Auto-Rate Mapping**:
- None VAT → 0%
- VAT → 7%
- GST → 10%
- Sales Tax → 8.5%
- Custom → User-defined

**Not Yet Implemented**:
- Banking details management
- Credit limit tracking
- Early payment discount calculations

**Acceptance Criteria**:
- Payment terms selectable during vendor creation
- Tax configuration editable on detail page
- Tax rate auto-populates based on tax profile selection

---

### FR-VD-010: Search and Filtering
**Priority**: High
**Implementation Status**: ✅ Implemented
**Description**: System provides search and filtering capabilities on vendor list page.

**Implemented Requirements**:

**Quick Search**:
- Search input with placeholder "Search vendors..."
- Search icon (magnifying glass) indicator
- Searches across:
  - Company name
  - Business type name
  - Address lines
  - Contact name
  - Contact phone

**Status Filter**:
- Dropdown: All Status, Active, Inactive
- Default: All Status

**Advanced Filters** (UI placeholder only):
- "Saved Filters" button → Toast: "will be available in future release"
- "Add Filters" button → Toast: "will be available in future release"

**View Toggle**:
- Table view (List icon)
- Card view (Grid icon)
- Toggle buttons with visual state indicator

**Not Yet Implemented**:
- Saved filter presets (functional)
- Advanced filter dialog (functional)
- Sort functionality
- Export filtered results

**Acceptance Criteria**:
- Search filters vendors in real-time
- Status filter works with search
- View toggle switches between table and card views

---

### FR-VD-011: Integration with Other Modules
**Priority**: Critical
**Implementation Status**: ✅ Partially Implemented
**Description**: System integrates with other vendor management modules.

**Implemented Requirements**:
- **Price Lists**: Link vendor to price lists (tab on detail page)
- **Contacts & Addresses**: Separate tab for contact management (display only)
- **Certifications**: Separate tab for certifications (display only)
- **Navigation**: Links from vendor list/detail to other modules

**Tab Integration on Detail Page**:
1. Overview - Vendor details and tax configuration
2. Price Lists - Link to vendor's price lists
3. Contacts & Addresses - Contact and address information
4. Certifications - Certification badges

**Planned/Not Yet Implemented**:
- **Purchase Request**: Vendor selection from directory
- **Purchase Order**: Vendor details auto-populate
- **GRN**: Quality ratings fed back to vendor performance
- **Invoices**: Payment terms enforced
- **RFQ**: Vendor contact details for RFQ distribution
- **Finance**: Vendor as payable entity
- **Reporting**: Vendor spend analysis

**Current State**:
- Vendor detail page shows Price Lists tab with link to price list module
- No automatic data flow between vendor and procurement modules
- Performance metrics not auto-calculated from transaction data

**Acceptance Criteria**:
- Price Lists tab displays on vendor detail page
- Navigation between vendor and price list modules works

---

### FR-VD-012: Certification Management
**Priority**: High
**Implementation Status**: ✅ Implemented
**Description**: System provides full certification management with CRUD operations, status tracking, and expiry alerts.

**Implemented Requirements**:
- Full CRUD operations for certifications via dialog modal:
  - Add new certification
  - Edit existing certification
  - Delete certification with confirmation
- Certification data fields:
  - Certification Name (required)
  - Certification Type (required, 16 predefined types)
  - Issuer (required)
  - Certificate Number (optional)
  - Issue Date (required)
  - Expiry Date (required)
  - Status (auto-calculated)
  - Document URL (optional)
  - Notes (optional)

**Available Certification Types** (16 types):
1. ISO 9001 - Quality Management
2. ISO 14001 - Environmental Management
3. ISO 22000 - Food Safety Management
4. ISO 45001 - Occupational Health & Safety
5. HACCP - Hazard Analysis Critical Control Points
6. GMP - Good Manufacturing Practice
7. Halal Certification
8. Kosher Certification
9. Organic Certification
10. Fair Trade Certification
11. FDA Approved
12. CE Marking
13. Business License
14. Trade License
15. Import/Export License
16. Other

**Status Auto-Calculation**:
- **Active** (green badge): Expiry date is more than 30 days in the future
- **Expiring Soon** (yellow badge): Expiry date is within 30 days
- **Expired** (red badge): Expiry date has passed
- **Pending** (gray badge): Initial status for new certifications

**UI Implementation**:
- **Create Page** (Tab 3 - Additional Info):
  - List view of certifications with cards
  - Each card shows: Name, Type, Issuer, Status badge, Issue/Expiry dates
  - Action buttons: Edit, Delete
  - "Add Certification" button opens dialog modal
- **Detail Page** (Certifications Tab):
  - Grid display of certification cards
  - Same card layout as create page
  - Full CRUD operations available

**Visual Indicators**:
- Status badges with color coding:
  - Active: `bg-green-100 text-green-800`
  - Expiring Soon: `bg-yellow-100 text-yellow-800`
  - Expired: `bg-red-100 text-red-800`
  - Pending: `bg-gray-100 text-gray-800`
- Certification type badge: `bg-blue-100 text-blue-800`

**Not Yet Implemented**:
- Document/file upload for certification copies
- Automatic expiry email notifications
- Certification renewal workflow
- Bulk certification import

**Business Rules**:
- Certification name and type are required
- Issuer name is required
- Issue and expiry dates are required
- Status is automatically calculated based on current date and expiry date
- Certifications can be added, edited, and deleted at any time

**Acceptance Criteria**:
- User can add certifications via dialog modal on create and detail pages
- User can edit existing certifications via dialog modal
- User can delete certifications with confirmation dialog
- Status automatically updates based on expiry date
- Visual badges indicate certification status (Active, Expiring Soon, Expired, Pending)
- Toast notifications confirm all CRUD operations

---

## 3. Non-Functional Requirements

> **Note**: Non-functional requirements are goals for production deployment. Current implementation uses mock data and client-side state.

### NFR-VD-001: Performance
**Implementation Status**: ⏳ Not Yet Measurable (using mock data)
- Vendor list page loads in <2 seconds for 10,000 vendors
- Search returns results in <1 second
- Vendor profile loads in <1 second
- Bulk operations (import/export) handle 5,000+ records
- Concurrent user support: 100+ simultaneous users

**Current State**: Client-side filtering with mock data performs well; backend not implemented.

### NFR-VD-002: Security
**Implementation Status**: ⏳ Planned
- Role-based access control (RBAC)
- Sensitive data encrypted at rest (banking details, tax IDs)
- Audit log for all vendor changes
- Banking details masked (show last 4 digits only)
- Document access controlled by role
- SSO integration support

**Current State**: No authentication or authorization implemented; all features visible to all users.

### NFR-VD-003: Reliability
**Implementation Status**: ⏳ Planned
- System uptime: 99.9%
- Data backup: Daily automated backups
- Disaster recovery: <4 hour RTO, <1 hour RPO
- No data loss on system failures

**Current State**: Using client-side state; data resets on page refresh.

### NFR-VD-004: Usability
**Implementation Status**: ✅ Partially Implemented
- ✅ Intuitive UI following established design patterns
- ✅ Mobile-responsive design (responsive breakpoints implemented)
- ✅ Form validation with clear error messages
- ⏳ Accessibility: WCAG 2.1 AA compliance (not verified)
- ⏳ Multi-language support (English only)
- ⏳ Context-sensitive help available
- ⏳ Keyboard shortcuts for power users

**Current State**: UI follows Shadcn/Tailwind design system; basic responsive design implemented.

### NFR-VD-005: Scalability
**Implementation Status**: ⏳ Not Yet Applicable
- Support 50,000+ vendor records
- Support 500,000+ contact records
- Support 1,000,000+ document records
- Horizontal scaling capability

**Current State**: Using mock data; scalability requirements apply to backend implementation.

### NFR-VD-006: Maintainability
**Implementation Status**: ✅ Partially Implemented
- ✅ Modular architecture (Next.js App Router with component-based structure)
- ⏳ RESTful API for integrations (not implemented)
- ⏳ Comprehensive logging
- ⏳ Monitoring and alerting
- ⏳ Automated testing coverage >80%

**Current State**: Modular React component architecture; no backend API or tests.

---

## 4. Data Requirements

> **Note**: Data structures below reflect actual implementation. Mock data interfaces are defined in component files.

### 4.1 Core Data Entities

**Vendor** (Implemented):
```typescript
interface Vendor {
  id: string
  companyName: string
  businessType: { id: string; name: string }
  addresses: VendorAddress[]
  contacts: VendorContact[]
  isActive?: boolean
  rating?: number
  status?: 'active' | 'inactive' | 'suspended'  // 3-value system in service layer
  website?: string
  notes?: string
  // Tax & Payment
  taxId?: string
  taxProfile?: string
  taxRate?: number
  companyRegistration?: string
  preferredCurrency?: string
  paymentTerms?: string
  // Certifications
  certifications?: VendorCertification[]  // Full certification objects
  languages?: string[]
}
```

**Vendor Address** (Implemented - Asian International Format):
```typescript
interface VendorAddress {
  id: string
  label: string           // e.g., "Main Office", "Warehouse"
  addressLine1: string    // Street address line 1 (required)
  addressLine2?: string   // Street address line 2 (optional)
  subDistrict?: string    // Sub-district/Tambon (optional)
  district?: string       // District/Amphoe (optional)
  city: string            // City (required)
  province?: string       // Province/State (optional)
  postalCode?: string     // Postal/ZIP code (optional)
  country: string         // Country (required)
  isPrimary: boolean
}
```

**Available Countries** (15 countries):
- Thailand, Singapore, Malaysia, Indonesia, Vietnam
- Philippines, Myanmar, Cambodia, Laos, Brunei
- China, Japan, South Korea, India, United States

**Vendor Contact** (Implemented):
```typescript
interface VendorContact {
  id: string
  name: string
  title: string           // e.g., "Sales Manager", "Account Executive"
  email: string
  phone: string
  isPrimary: boolean
}
```

**Vendor Certification** (Implemented):
```typescript
type CertificationStatus = 'active' | 'expired' | 'expiring_soon' | 'pending'

interface VendorCertification {
  id: string
  name: string                    // Certification name (required)
  certificationType: string       // Type from 16 predefined types (required)
  issuer: string                  // Issuing organization (required)
  certificateNumber?: string      // Certificate/registration number (optional)
  issueDate: Date                 // Date issued (required)
  expiryDate: Date                // Expiration date (required)
  status: CertificationStatus     // Auto-calculated based on expiryDate
  documentUrl?: string            // URL to certification document (optional)
  notes?: string                  // Additional notes (optional)
}
```

**Certification Status Calculation Logic**:
```typescript
const calculateCertificationStatus = (expiryDate: Date): CertificationStatus => {
  const now = new Date()
  const expiry = new Date(expiryDate)
  const daysUntilExpiry = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  if (daysUntilExpiry < 0) return 'expired'
  if (daysUntilExpiry <= 30) return 'expiring_soon'
  return 'active'
}
```

**Vendor Performance Metrics** (Partially Implemented - Display Only):
```typescript
interface VendorPerformanceMetrics {
  qualityScore: number       // 0-100
  responseRate: number       // Percentage
  avgResponseTime: string    // e.g., "2.5 days"
  onTimeDelivery: number     // Percentage
  totalCampaigns: number
  completedSubmissions: number
  avgCompletionTime: string
}
```

**Planned but Not Implemented**:
- Vendor Code (unique identifier)
- Legal Name / DBA
- Multiple contact roles
- Document management
- Location assignments
- Credit limits
- Banking details

### 4.2 Data Volumes (Estimated)
- Vendors: 5,000 - 50,000 records
- Contacts: 10,000 - 100,000 records
- Documents: 50,000 - 500,000 records
- Addresses: 15,000 - 150,000 records

**Current State**: Mock data with ~10 sample vendors.

### 4.3 Data Retention
- Active vendors: Indefinite
- Archived vendors: 7 years
- Audit logs: 10 years
- Documents: Per legal requirements (typically 7-10 years)

**Current State**: No persistence; data stored in client-side state only.

---

## 5. Business Rules Summary

> **Note**: Business rules below indicate implementation status. Many rules are planned but not yet enforced.

### BR-VD-001: Vendor Name Required
**Implementation Status**: ✅ Implemented
Company name is required during vendor creation. Form validation prevents submission without name.

### BR-VD-002: Required Contact Information
**Implementation Status**: ✅ Implemented
Contact email and phone are required during vendor creation. Form validation enforces this rule.

### BR-VD-003: Approval Requirements
**Implementation Status**: ⏳ Not Implemented
*Planned*: New vendors and significant changes require approval before use in transactions.
*Current*: Vendors are created directly without approval workflow.

### BR-VD-004: Document Expiration
**Implementation Status**: ⏳ Not Implemented
*Planned*: Vendors with expired critical documents receive warnings.
*Current*: No document management or expiration tracking.

### BR-VD-005: Performance Rating Display
**Implementation Status**: ✅ Partially Implemented
*Implemented*: Rating displayed on detail page (qualityScore / 20 = rating out of 5).
*Not Implemented*: Automatic calculation from transactions.

### BR-VD-006: Status-Based Behavior
**Implementation Status**: ✅ Partially Implemented
- **Active**: Vendor displayed normally
- **Inactive**: Vendor displayed with inactive badge
- *Not Implemented*: PO restrictions, blocking, blacklisting

### BR-VD-007: Tax Rate Auto-Population
**Implementation Status**: ✅ Implemented
When tax profile is selected, tax rate auto-populates:
- None VAT → 0%
- VAT Thailand → 7%
- GST → 10%
- Sales Tax → 8.5%
- Custom → User-defined

### BR-VD-008: Credit Limit Enforcement
**Implementation Status**: ⏳ Not Implemented
*Planned*: Purchase orders exceeding vendor credit limit require additional approval.

### BR-VD-009: Multi-Currency Selection
**Implementation Status**: ✅ Implemented
Preferred currency selectable during vendor creation (12 currencies: BHT, USD, CNY, SGD, EUR, GBP, CAD, AUD, JPY, CHF, INR, MXN).

### BR-VD-010: Certification Management
**Implementation Status**: ✅ Implemented
Full certification management with:
- CRUD operations via dialog modal
- 16 predefined certification types
- Auto-calculated status based on expiry dates
- Visual status indicators (Active=green, Expiring Soon=yellow, Expired=red, Pending=gray)

### BR-VD-011: Certification Status Auto-Calculation
**Implementation Status**: ✅ Implemented
Certification status is automatically calculated based on expiry date:
- **Active**: Expiry date > 30 days in future
- **Expiring Soon**: Expiry date within 30 days (warning state)
- **Expired**: Expiry date has passed
- **Pending**: Initial status for new certifications being processed
Status recalculates on page load and when certification is edited.

### BR-VD-012: Asian International Address Format
**Implementation Status**: ✅ Implemented
Addresses use Asian international format with fields:
- Address Line 1 (required)
- Address Line 2 (optional)
- Sub-District (optional, for Thailand/Southeast Asia)
- District (optional)
- City (required)
- Province/State (optional)
- Postal Code (optional)
- Country (required, 15 countries available)

---

## 6. User Roles and Permissions

> **Note**: Role-based access control is planned but not yet implemented. Currently, all users have full access to all features.

**Implementation Status**: ⏳ Not Implemented

### 6.1 Planned Roles (Not Yet Enforced)

**Vendor Manager**:
- Full access to vendor management
- Create, edit, archive vendors
- Manage contacts and documents
- Initiate approval workflows
- View performance metrics
- Configure vendor categories

**Procurement Staff**:
- View vendor directory
- View contact information
- View documents (non-sensitive)
- Create vendor requests (subject to approval)
- View performance ratings

**Finance Manager**:
- View vendor financial information
- Edit payment terms
- Edit banking details
- View credit limits
- Approve credit limit changes

**Compliance Officer**:
- View all vendor documents
- Upload/approve certifications
- Monitor document expiration
- Approve/reject vendor applications
- Audit vendor compliance

**Department Manager**:
- View vendors assigned to department
- View contact information
- Request new vendor additions
- View performance ratings

**System Administrator**:
- Full system access
- Configure workflows
- Manage user permissions
- System configuration
- Bulk operations

### 6.2 Current State
- All users can view, create, edit, and delete vendors
- No permission checks implemented
- No role-based UI hiding
- User context available in app but not used for vendor module

---

## 7. Workflow Specifications

> **Note**: Approval workflows are planned but not yet implemented. Current implementation uses direct actions.

### 7.1 Current Vendor Creation Workflow (Implemented)
**Implementation Status**: ✅ Implemented (Simplified)
1. **Navigate**: User clicks "Add Vendor" button on list page
2. **Data Entry**: Complete 3-tab wizard form:
   - Tab 1: Basic Information (name, business type, website, status, addresses, contacts)
   - Tab 2: Business Details (registration, tax, currency, payment terms)
   - Tab 3: Additional Info (certifications, languages, notes)
3. **Address/Contact Management** (within Tab 1):
   - Click "Add Address" or "Add Contact" to open dialog modal
   - Fill in required fields and save
   - First item automatically becomes primary
   - Use action buttons to edit, delete, or set as primary
4. **Submit**: Click "Create Vendor" button
5. **Result**: Vendor created immediately with "active" status
6. **Navigation**: Redirect to vendor list with success toast

### 7.2 Current Vendor Edit Workflow (Implemented)
**Implementation Status**: ✅ Partially Implemented
1. **Navigate**: Click vendor row or "View" action on list page
2. **View Details**: See vendor detail page with 4 tabs
3. **Edit Tax Config**: Change tax profile/rate in Overview tab
4. **Toggle Status**: Use switch to change active/inactive status
5. **Result**: Changes applied immediately with toast notification

### 7.3 Planned Workflows (Not Yet Implemented)

**New Vendor Onboarding Workflow**:
1. Initiation: User creates vendor request
2. Data Entry: Complete vendor profile, contacts, documents
3. Compliance Review: Verify certifications, insurance, tax documents
4. Financial Review: Credit check, payment terms approval
5. Quality Review: Review quality certifications and standards
6. Management Approval: Final approval for activation
7. Activation: Vendor status set to "Approved" or "Provisional"
8. Notification: Vendor and requestor notified

**Vendor Change Request Workflow**:
1. Change Request: User submits change request
2. Impact Assessment: System identifies impacted POs, contracts
3. Approval Routing: Based on change type
4. Approval/Rejection: Approvers review and decide
5. Implementation: Changes applied upon approval
6. Notification: Stakeholders notified

**Vendor Block/Blacklist Workflow**:
1. Issue Reported: Quality issue, fraud, non-compliance reported
2. Investigation: Investigate issue and gather evidence
3. Recommendation: Recommend block or blacklist
4. Management Review: Review recommendation
5. Decision: Approve or reject
6. Implementation: Status changed, notifications sent

---

## 8. Integration Requirements

> **Note**: Integrations are planned for backend implementation. Current frontend is standalone.

**Implementation Status**: ⏳ Not Implemented

### 8.1 Current Integration State
- **Price Lists**: Tab link to price list module (navigation only)
- **UI Navigation**: Links between vendor management pages
- **No Backend**: No API calls; all data is mock/client-side

### 8.2 Planned Internal Integrations
- **Procurement**: Vendor selection, PO creation
- **Finance**: Accounts payable, payment processing
- **Inventory**: Product-vendor relationships
- **Reporting**: Vendor spend analysis, performance reports

### 8.3 Planned External Integrations
- **Credit Check Services**: Dun & Bradstreet, Experian
- **Tax Validation**: TIN verification services
- **Email/SMS**: Notification services
- **Document Storage**: Cloud storage (AWS S3, Azure Blob)
- **ERP Systems**: SAP, Oracle, QuickBooks

### 8.4 API Requirements (Planned)
- RESTful API for vendor CRUD operations
- API for vendor search and filtering
- Webhook support for status changes
- Rate limiting: 1000 requests/hour per API key

---

## 9. Success Criteria

> **Note**: Success criteria are goals for production deployment. Current state is UI prototype.

### 9.1 Current Implementation Success Criteria
**Implementation Status**: ✅ Achieved (UI Prototype)
- ✅ Vendor list page displays with table/card views
- ✅ Search filters vendors by multiple fields
- ✅ Status filter works correctly
- ✅ 4-tab create form captures all required fields
- ✅ Detail page shows vendor information organized in tabs
- ✅ Tax configuration with auto-rate population works
- ✅ Status toggle changes vendor status with toast feedback
- ✅ Responsive design works on mobile

### 9.2 Planned Business Metrics
- Vendor onboarding time reduced by 50%
- 100% vendor compliance with required documents
- 95%+ vendor contact information accuracy
- Average vendor rating >4.0/5.0
- <5% vendors blocked or blacklisted

### 9.3 Planned System Metrics
- Page load time <2 seconds
- Search response time <1 second
- 99.9% system uptime
- Zero data loss incidents
- <10 support tickets per 1000 transactions

### 9.4 Planned User Adoption
- 80%+ user satisfaction score
- 90%+ users complete onboarding training
- <5% duplicate vendor entries
- 95%+ vendors have current documents

---

## 10. Constraints and Assumptions

### 10.1 Current Implementation Constraints
- Frontend-only implementation (no backend API)
- Mock data with no persistence
- No authentication or authorization
- Client-side state management only
- No file upload capability

### 10.2 Planned Production Constraints
- Must integrate with existing ERP system
- Must comply with data protection regulations (GDPR, CCPA)
- Must support multi-tenancy for enterprise clients
- Budget: $150,000 development + $25,000 annual maintenance
- Timeline: 6 months development + 2 months testing

### 10.3 Current Assumptions
- Users testing UI prototype in development environment
- Mock data sufficient for demonstrating UI patterns
- Backend API will be developed separately

### 10.4 Planned Production Assumptions
- Users have basic computer literacy
- Stable internet connection available
- Existing vendor data can be migrated
- Vendors willing to provide required documents
- Integration APIs available from external systems

---

## 11. Risks and Mitigation

### 11.1 Current Implementation Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| UI prototype not matching final requirements | Medium | Medium | Regular stakeholder review, iterative updates |
| Mock data not representing real scenarios | Medium | High | Work with business to create realistic test data |
| Component patterns diverging from other modules | Low | Medium | Follow established component library patterns |

### 11.2 Production Deployment Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Data migration failures | High | Medium | Comprehensive migration testing, rollback plan |
| User adoption resistance | Medium | Medium | Change management, training, user support |
| Integration complexity | High | High | Early integration testing, vendor collaboration |
| Performance issues at scale | High | Low | Load testing, horizontal scaling architecture |
| Document storage costs | Medium | Medium | Cost optimization, tiered storage strategy |
| Regulatory compliance | High | Low | Legal review, compliance audits |

---

## 12. Implementation Summary

### 12.1 Implemented Features
| Feature | Status | Notes |
|---------|--------|-------|
| Vendor List (Table View) | ✅ | Search, status filter, view toggle |
| Vendor List (Card View) | ✅ | Alternative grid display |
| Vendor Create (3-Tab Form) | ✅ | All basic fields captured |
| Vendor Detail Page | ✅ | Summary card + 4 tabs |
| Multi-Address Management | ✅ | Add, edit, delete via dialog with primary designation |
| Asian International Address Format | ✅ | Address Line 1/2, Sub-District, District, City, Province, Postal Code, Country |
| Multi-Contact Management | ✅ | Add, edit, delete via dialog with primary designation |
| Full Certification Management | ✅ | CRUD via dialog, 16 types, auto-status calculation |
| Certification Status Tracking | ✅ | Active, Expired, Expiring Soon (30 days), Pending |
| Tax Configuration | ✅ | Tax profile with auto-rate |
| Status Toggle | ✅ | Active/Inactive only |
| Performance Metrics Display | ✅ | Display only, no calculation |

### 12.2 Not Yet Implemented
| Feature | Priority | Notes |
|---------|----------|-------|
| Backend API | Critical | Required for persistence |
| Document Upload for Certifications | High | File attachment for certification copies |
| Certification Expiry Notifications | High | Email alerts for expiring certifications |
| Approval Workflows | High | Multi-stage approval |
| Role-Based Access | High | Permission enforcement |
| Contact Roles | Medium | Sales, Accounts Payable, etc. |
| Advanced Segmentation | Medium | Preferred, Blocked, Blacklisted |
| Location Assignments | Medium | Multi-location support |
| Performance Calculation | Medium | Auto-calculate from transactions |
| Banking Details | Medium | Payment processing |
| Advanced Filters | Low | Saved filters, complex queries |

---

## Related Documents
- UC-vendor-directory.md - Use Cases
- TS-vendor-directory.md - Technical Specification
- DS-vendor-directory.md - Data Schema
- FD-vendor-directory.md - Flow Diagrams
- VAL-vendor-directory.md - Validations

---

**End of Business Requirements Document**
