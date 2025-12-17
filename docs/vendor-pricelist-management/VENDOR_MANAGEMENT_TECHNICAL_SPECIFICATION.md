# Vendor Management Module - Technical Specification

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Overview

The Vendor Management module is a comprehensive vendor pricelist management system built with Next.js 14, TypeScript, and Shadcn/ui components. It provides full CRUD operations for vendors, pricelist template management, automated price collection campaigns, and an intelligent vendor portal for price submissions.

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Data Models](#data-models)
3. [Database Schema](#database-schema)
4. [API Layer](#api-layer)
5. [Service Layer](#service-layer)
6. [Component Architecture](#component-architecture)
7. [Page Structure](#page-structure)
8. [Business Logic](#business-logic)
9. [Validation System](#validation-system)
10. [User Flows](#user-flows)
11. [Development Guidelines](#development-guidelines)

## Architecture Overview

### Tech Stack
- **Frontend**: Next.js 14 with App Router, TypeScript
- **UI Framework**: Shadcn/ui components, Tailwind CSS
- **State Management**: React Hook Form + Zod for forms, Local state with useState
- **Database**: PostgreSQL with comprehensive schema
- **Validation**: Zod schemas with custom business rules
- **File Processing**: Excel generation and parsing capabilities

### Module Structure
```
vendor-management/
├── components/           # Reusable UI components
├── lib/                 # Utilities and services
│   ├── api.ts          # API client layer
│   ├── services/       # Business logic services
│   └── mock-data.ts    # Development mock data
├── manage-vendors/     # Vendor CRUD operations
├── templates/          # Pricelist template management
├── campaigns/          # Collection campaign management
├── pricelists/         # Price list management
├── vendor-portal/      # Secure vendor access
└── types/              # TypeScript interfaces
```

## Data Models

### Core Entities

#### Vendor
```typescript
interface Vendor {
  id: string
  name: string
  contactEmail: string
  contactPhone?: string
  address: Address
  status: 'active' | 'inactive' | 'suspended'
  preferredCurrency: string
  paymentTerms?: string
  performanceMetrics: VendorMetrics
  createdAt: Date
  updatedAt: Date
  createdBy: string
  // Extended properties
  companyRegistration?: string
  taxId?: string
  taxProfile?: string
  website?: string
  businessType?: string
  certifications?: string[]
  languages?: string[]
  notes?: string
}
```

#### Address
```typescript
interface Address {
  street: string
  city: string
  state: string
  postalCode: string
  country: string
}
```

#### VendorMetrics
```typescript
interface VendorMetrics {
  responseRate: number
  averageResponseTime: number
  qualityScore: number
  onTimeDeliveryRate: number
  totalCampaigns: number
  completedSubmissions: number
  averageCompletionTime: number
  lastSubmissionDate?: Date
}
```

#### PricelistTemplate
```typescript
interface PricelistTemplate {
  id: string
  name: string
  description?: string
  productSelection: ProductSelection
  customFields: CustomField[]
  instructions: string
  validityPeriod: number // days
  status: 'draft' | 'active' | 'archived'
  createdAt: Date
  updatedAt: Date
  createdBy: string
  // Template settings
  allowMultiMOQ: boolean
  requireLeadTime: boolean
  defaultCurrency: string
  supportedCurrencies: string[]
  maxItemsPerSubmission?: number
  notificationSettings: NotificationSettings
}
```

#### ProductSelection
```typescript
interface ProductSelection {
  categories: string[]
  subcategories: string[]
  itemGroups: string[]
  specificItems: string[]
  selectionType: 'include' | 'exclude'
}
```

#### RequestForPricing (Collection Campaign)
```typescript
interface RequestForPricing {
  id: string
  name: string
  description?: string
  templateId: string
  vendorIds: string[]
  schedule: RequestForPricingSchedule
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled'
  invitations: VendorInvitation[]
  analytics: RequestForPricingAnalytics
  createdAt: Date
  updatedAt: Date
  createdBy: string
}
```

#### VendorPricelist
```typescript
interface VendorPricelist {
  id: string
  pricelistNumber: string
  vendorId: string
  campaignId: string
  templateId: string
  invitationId: string
  currency: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'expired'
  items: PricelistItem[]
  validFrom: Date
  validTo: Date
  submittedAt?: Date
  completionPercentage: number
  qualityScore: number
  version: number
}
```

#### MOQPricing
```typescript
interface MOQPricing {
  id: string
  moq: number
  unit: string
  unitPrice: number
  conversionFactor?: number
  leadTime?: number
  notes?: string
  validFrom?: Date
  validTo?: Date
}
```

## Database Schema

### Key Tables

#### vendors
```sql
CREATE TABLE vendors (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255) NOT NULL,
    contact_phone VARCHAR(50),
    address_street VARCHAR(255),
    address_city VARCHAR(100),
    address_state VARCHAR(100),
    address_postal_code VARCHAR(20),
    address_country VARCHAR(100),
    status vendor_status DEFAULT 'active',
    preferred_currency VARCHAR(3) DEFAULT 'USD',
    payment_terms TEXT,
    company_registration VARCHAR(100),
    tax_id VARCHAR(100),
    website VARCHAR(255),
    business_type VARCHAR(100),
    certifications TEXT[],
    languages TEXT[],
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL
);
```

#### vendor_metrics
```sql
CREATE TABLE vendor_metrics (
    vendor_id UUID PRIMARY KEY REFERENCES vendors(id) ON DELETE CASCADE,
    response_rate DECIMAL(5,2) DEFAULT 0,
    average_response_time DECIMAL(10,2) DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0,
    on_time_delivery_rate DECIMAL(5,2) DEFAULT 0,
    total_campaigns INTEGER DEFAULT 0,
    completed_submissions INTEGER DEFAULT 0,
    average_completion_time DECIMAL(10,2) DEFAULT 0,
    last_submission_date TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### pricelist_templates
```sql
CREATE TABLE pricelist_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    product_selection JSONB NOT NULL,
    custom_fields JSONB NOT NULL DEFAULT '[]',
    instructions TEXT,
    validity_period INTEGER DEFAULT 30,
    status template_status DEFAULT 'draft',
    allow_multi_moq BOOLEAN DEFAULT true,
    require_lead_time BOOLEAN DEFAULT false,
    default_currency VARCHAR(3) DEFAULT 'USD',
    supported_currencies TEXT[] DEFAULT ARRAY['USD'],
    max_items_per_submission INTEGER,
    notification_settings JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NOT NULL
);
```

#### vendor_pricelists
```sql
CREATE TABLE vendor_pricelists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
    campaign_id UUID NOT NULL REFERENCES collection_campaigns(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES pricelist_templates(id) ON DELETE RESTRICT,
    invitation_id UUID NOT NULL REFERENCES vendor_invitations(id) ON DELETE CASCADE,
    currency VARCHAR(3) NOT NULL,
    status pricelist_status DEFAULT 'draft',
    valid_from TIMESTAMP WITH TIME ZONE NOT NULL,
    valid_to TIMESTAMP WITH TIME ZONE NOT NULL,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    quality_score DECIMAL(5,2) DEFAULT 0,
    total_items INTEGER DEFAULT 0,
    completed_items INTEGER DEFAULT 0,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Indexes for Performance
```sql
-- Vendor indexes
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_email ON vendors(contact_email);
CREATE INDEX idx_vendors_created_at ON vendors(created_at);

-- Template indexes
CREATE INDEX idx_templates_status ON pricelist_templates(status);
CREATE INDEX idx_templates_created_by ON pricelist_templates(created_by);

-- Pricelist indexes
CREATE INDEX idx_pricelists_vendor_campaign ON vendor_pricelists(vendor_id, campaign_id);
CREATE INDEX idx_pricelists_status ON vendor_pricelists(status);
```

## API Layer

### API Client Structure
The API layer (`lib/api.ts`) provides a centralized interface for all backend operations:

```typescript
// Generic API utility functions
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>>

// Vendor Management API
const vendorApi = {
  list(filters: VendorFilters, page: number, limit: number): Promise<ApiResponse<PaginatedResponse<Vendor>>>
  getById(id: string): Promise<ApiResponse<Vendor>>
  create(vendor: Omit<Vendor, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Vendor>>
  update(id: string, vendor: Partial<Vendor>): Promise<ApiResponse<Vendor>>
  delete(id: string): Promise<ApiResponse<void>>
  search(query: string, limit: number): Promise<ApiResponse<Vendor[]>>
  updateStatus(id: string, status: VendorStatus): Promise<ApiResponse<Vendor>>
  bulkUpdate(updates: BulkUpdateRequest[]): Promise<ApiResponse<BulkUpdateResult>>
}

// Template Management API
const templateApi = {
  list(page: number, limit: number): Promise<ApiResponse<PaginatedResponse<PricelistTemplate>>>
  getById(id: string): Promise<ApiResponse<PricelistTemplate>>
  create(template: CreateTemplateRequest): Promise<ApiResponse<PricelistTemplate>>
  update(id: string, template: UpdateTemplateRequest): Promise<ApiResponse<PricelistTemplate>>
  delete(id: string): Promise<ApiResponse<void>>
  generateExcel(id: string): Promise<ApiResponse<{ downloadUrl: string }>>
  generateLinks(id: string, vendorIds: string[]): Promise<ApiResponse<GenerateLinksResult>>
  sendInvitations(id: string, vendorIds: string[], settings: InvitationSettings): Promise<ApiResponse<VendorInvitation[]>>
}
```

### Response Types
```typescript
interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, any>
  }
  metadata?: {
    total?: number
    page?: number
    limit?: number
    hasMore?: boolean
  }
}

interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
```

## Service Layer

### VendorService
The main business logic service for vendor operations:

```typescript
class VendorService {
  // Core CRUD operations
  async createVendor(vendorData: CreateVendorRequest, userId: string): Promise<ApiResponse<Vendor>>
  async updateVendor(id: string, updates: Partial<Vendor>, userId: string): Promise<ApiResponse<Vendor>>
  async deleteVendor(id: string, userId: string): Promise<ApiResponse<void>>
  async getVendor(id: string): Promise<ApiResponse<Vendor>>
  
  // Advanced operations
  async listVendors(filters: VendorFilters, pagination: PaginationOptions): Promise<ApiResponse<PaginatedResponse<Vendor>>>
  async searchVendors(query: string, filters: VendorFilters): Promise<ApiResponse<Vendor[]>>
  async updateVendorStatus(id: string, status: VendorStatus, userId: string): Promise<ApiResponse<Vendor>>
  async bulkUpdateVendors(updates: BulkUpdateRequest[], userId: string): Promise<ApiResponse<BulkUpdateResult>>
  
  // Business rule validation
  private async validateVendor(vendor: Partial<Vendor>): Promise<ValidationResult>
  private async applyBusinessRules(vendor: Partial<Vendor>, operation: 'create' | 'update'): Promise<ValidationResult>
  private async canDeleteVendor(id: string): Promise<{ allowed: boolean; reason?: string }>
}
```

### VendorValidationService
Comprehensive validation with business rules:

```typescript
class VendorValidationService {
  async validateVendor(vendor: Partial<Vendor>): Promise<ValidationResult>
  async validateField(vendor: Partial<Vendor>, fieldName: string): Promise<ValidationError | null>
  
  private async validateBusinessRules(vendor: Partial<Vendor>): Promise<ValidationError[]>
  private async checkDuplicateCompanyName(name: string, excludeId?: string): Promise<ValidationError | null>
  private async checkDuplicateEmail(email: string, excludeId?: string): Promise<ValidationError | null>
  private calculateQualityScore(vendor: Partial<Vendor>, errors: ValidationError[], warnings: ValidationError[]): number
}
```

### Field Validators
```typescript
const FIELD_VALIDATORS = {
  companyName: {
    required: true,
    minLength: 2,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-\.\,\&\'\(\)]+$/,
    validate: (value: string): ValidationError | null
  },
  contactEmail: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    validate: (value: string): ValidationError | null
  },
  contactPhone: {
    required: true,
    pattern: /^\+?[\d\s\-\(\)]+$/,
    validate: (value: string): ValidationError | null
  },
  address: {
    required: true,
    validate: (value: Address): ValidationError | null
  }
}
```

## Component Architecture

### Core Components

#### VendorForm
Comprehensive vendor creation/editing form with validation:

```typescript
interface VendorFormProps {
  vendor?: Vendor
  onSave: (vendor: Vendor) => void
  onCancel: () => void
  isLoading?: boolean
  userId: string
}

// Features:
// - Multi-tab interface (Basic, Contact, Business, Advanced)
// - Real-time validation with Zod
// - Auto-save functionality
// - Quality score calculation
// - Dynamic certification and language management
```

#### VendorCard
Flexible vendor display component:

```typescript
interface VendorCardProps {
  vendor: Vendor
  onEdit?: (vendor: Vendor) => void
  onDelete?: (vendor: Vendor) => void
  onView?: (vendor: Vendor) => void
  onContact?: (vendor: Vendor) => void
  onFavorite?: (vendor: Vendor) => void
  className?: string
  compact?: boolean
  showActions?: boolean
  showMetrics?: boolean
  showAvatar?: boolean
  isFavorite?: boolean
}

// Features:
// - Performance metrics display
// - Action dropdown menu
// - Contact information display
// - Status indicators
// - Expandable metrics section
```

#### VendorFilters
Advanced filtering component:

```typescript
interface VendorFiltersProps {
  onFiltersChange: (filters: VendorFilters, advancedFilters?: AdvancedFilterOptions) => void
  initialFilters?: VendorFilters
  showPresets?: boolean
  showAdvanced?: boolean
  showSaveFilter?: boolean
  userId?: string
}

// Features:
// - Collapsible filter sections
// - Preset filter options
// - Real-time filter application
// - Performance range sliders
// - Multi-select capabilities
```

#### TemplatePreview
Template preview with vendor experience simulation:

```typescript
interface TemplatePreviewProps {
  template: PricelistTemplate
  onClose: () => void
}

// Features:
// - Complete vendor portal simulation
// - Product selection preview
// - Pricing configuration display
// - Excel template generation
// - Notification settings review
```

### Form Architecture

#### Validation Strategy
- **Schema-based**: Zod schemas for type-safe validation
- **Real-time**: Validation occurs on field change
- **Business rules**: Custom validators for complex logic
- **Error handling**: Contextual error messages with suggestions

```typescript
const vendorSchema = z.object({
  name: z.string().min(2, 'Company name must be at least 2 characters'),
  contactEmail: z.string().email('Invalid email format'),
  contactPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.object({
    street: z.string().min(5, 'Street address must be at least 5 characters'),
    city: z.string().min(2, 'City must be at least 2 characters'),
    state: z.string().min(2, 'State must be at least 2 characters'),
    postalCode: z.string().min(5, 'Postal code must be at least 5 characters'),
    country: z.string().min(2, 'Country must be at least 2 characters'),
  }),
  preferredCurrency: z.enum(['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CHF', 'CNY', 'INR', 'MXN']),
})
```

#### Form State Management
```typescript
const {
  control,
  handleSubmit,
  watch,
  formState: { errors, isValid, isDirty },
  reset,
  getValues
} = useForm<VendorFormData>({
  resolver: zodResolver(vendorSchema),
  defaultValues: vendorDefaultValues,
  mode: 'onChange'
})
```

## Page Structure

### Main Landing Page (`/vendor-management/page.tsx`)
Dashboard-style overview with module navigation:

```typescript
// Features:
// - Quick statistics cards
// - Module navigation grid
// - New feature highlights
// - Action buttons for common tasks

const quickStats = {
  totalVendors: 25,
  activeContracts: 18,
  priceUpdatesThisMonth: 45,
  pendingApprovals: 3
}
```

### Vendor Management Pages

#### Vendor List (`/manage-vendors/page.tsx`)
Advanced vendor listing with filtering and views:

```typescript
// Features:
// - Table and card view modes
// - Advanced filtering system
// - Search functionality
// - Bulk operations
// - Export capabilities

interface VendorListState {
  vendors: VendorListItem[]
  filteredVendors: VendorListItem[]
  activeFilters: FilterType<VendorListItem>[]
  searchQuery: string
  viewMode: 'table' | 'card'
  isLoading: boolean
}
```

#### Vendor Creation (`/manage-vendors/new/page.tsx`)
Multi-step vendor creation form:

```typescript
// Features:
// - 4-tab form interface
// - Real-time validation
// - Auto-save drafts
// - Business rule validation
// - Error handling with suggestions

interface VendorFormData {
  name: string
  contactEmail: string
  contactPhone: string
  website: string
  businessType: string
  address: Address
  status: 'active' | 'inactive'
  certifications: string[]
  languages: string[]
}
```

#### Vendor Detail (`/manage-vendors/[id]/page.tsx`)
Comprehensive vendor profile view:

```typescript
// Features:
// - Tabbed interface for different data sections
// - Performance metrics dashboard
// - Pricelist history
// - Contact management
// - Document management
// - Activity timeline
```

### Template Management Pages

#### Template List (`/templates/page.tsx`)
Template management interface:

```typescript
// Features:
// - Grid view with template cards
// - Status filtering
// - Template duplication
// - Excel generation
// - Campaign creation shortcuts

interface TemplateFilters {
  status?: string
  search?: string
}
```

#### Template Creation (`/templates/new/page.tsx`)
Multi-step template builder:

```typescript
// Features:
// - Product selection wizard
// - Custom field builder
// - Pricing configuration
// - Notification settings
// - Preview functionality
```

### Pricelist Management Pages

#### Pricelist List (`/pricelists/page.tsx`)
Pricelist overview and management:

```typescript
// Features:
// - Comprehensive table view
// - Status and vendor filtering
// - Bulk operations
// - Export functionality
// - Quality metrics display

const mockPricelists = [
  {
    id: 'pl-001',
    pricelistNumber: 'PL-2401-0001',
    vendorName: 'Fresh Foods Co.',
    status: 'active',
    itemCount: 245,
    totalValue: 125450.75,
    taxProfile: 'VAT',
    validityPeriod: { from: '2024-04-01', to: '2024-06-30' }
  }
]
```

## Business Logic

### Vendor Management Rules

#### Creation Rules
```typescript
const DEFAULT_BUSINESS_RULES: VendorBusinessRules = {
  allowDuplicateNames: false,
  requireUniqueEmail: true,
  requireUniquePhone: true,
  autoActivateNewVendors: true,
  requireApprovalForStatusChange: false,
  maxVendorsPerUser: 1000,
  requiredDocuments: ['businessLicense', 'taxCertificate'],
  autoGenerateVendorCode: true
}
```

#### Status Management
- **Active**: Vendor can receive invitations and submit pricelists
- **Inactive**: Vendor is hidden from new campaigns but existing data remains
- **Suspended**: Vendor is temporarily blocked from all activities

#### Performance Calculation
```typescript
const calculatePerformanceMetrics = (vendor: Vendor): VendorMetrics => {
  return {
    responseRate: (completedSubmissions / totalInvitations) * 100,
    averageResponseTime: totalResponseTime / completedSubmissions,
    qualityScore: calculateQualityScore(submissions),
    onTimeDeliveryRate: (onTimeSubmissions / totalSubmissions) * 100
  }
}
```

### Template Management Rules

#### Product Selection Logic
```typescript
interface ProductSelection {
  categories: string[]
  subcategories: string[]
  itemGroups: string[]
  specificItems: string[]
  selectionType: 'include' | 'exclude'
}

// Resolves to actual product list based on selection type
const resolveProducts = (selection: ProductSelection): Product[] => {
  const allProducts = getAllProducts()
  
  if (selection.selectionType === 'include') {
    return allProducts.filter(product => matchesSelection(product, selection))
  } else {
    return allProducts.filter(product => !matchesSelection(product, selection))
  }
}
```

#### Pricing Configuration Rules
- **Multi-MOQ**: Allows vendors to submit multiple quantity tiers
- **Lead Time**: Requires lead time specification for each product
- **Currency Support**: Supports multiple currencies with conversion rules

### Campaign Management Rules

#### Invitation Logic
```typescript
interface VendorInvitation {
  id: string
  vendorId: string
  token: string
  pricelistId: string
  campaignId: string
  expiresAt: Date
  status: 'pending' | 'sent' | 'delivered' | 'accessed' | 'submitted' | 'expired'
  remindersSent: number
}

// Automatic reminder system
const scheduleReminders = (invitation: VendorInvitation, settings: NotificationSettings) => {
  settings.reminderDays.forEach(days => {
    const reminderDate = new Date(invitation.expiresAt)
    reminderDate.setDate(reminderDate.getDate() - days)
    scheduleEmail(invitation, reminderDate)
  })
}
```

## Validation System

### Validation Architecture

#### Multi-Level Validation
1. **Client-side**: Immediate feedback with Zod schemas
2. **Business rules**: Custom validation logic for business requirements
3. **Server-side**: Final validation before database operations
4. **Real-time**: Continuous validation during form completion

#### Validation Result Structure
```typescript
interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationError[]
  qualityScore: number
  validatedFields: string[]
  timestamp: Date
}

interface ValidationError {
  field: string
  code: string
  message: string
  severity: 'error' | 'warning' | 'info'
  suggestions?: string[]
  context?: Record<string, any>
}
```

#### Quality Score Calculation
```typescript
const calculateQualityScore = (
  vendor: Partial<Vendor>,
  errors: ValidationError[],
  warnings: ValidationError[]
): number => {
  let score = 100
  
  // Deduct points for errors and warnings
  score -= errors.length * 15
  score -= warnings.length * 5
  
  // Bonus points for optional fields
  if (vendor.website) score += 5
  if (vendor.businessType) score += 5
  if (vendor.certifications?.length) score += 5
  if (vendor.languages?.length) score += 3
  if (vendor.notes) score += 2
  
  return Math.max(0, Math.min(100, score))
}
```

### Field-Specific Validation

#### Company Name Validation
```typescript
const validateCompanyName = (value: string): ValidationError | null => {
  if (!value) return createError('REQUIRED', 'Company name is required')
  if (value.length < 2) return createError('TOO_SHORT', 'Must be at least 2 characters')
  if (value.length > 100) return createError('TOO_LONG', 'Must be no more than 100 characters')
  if (!/^[a-zA-Z0-9\s\-\.\,\&\'\(\)]+$/.test(value)) {
    return createError('INVALID_CHARACTERS', 'Contains invalid characters')
  }
  
  // Check for blacklisted words
  const blacklist = ['test', 'dummy', 'example', 'sample']
  if (blacklist.some(word => value.toLowerCase().includes(word))) {
    return createWarning('BLACKLISTED_WORD', 'Consider using a more professional name')
  }
  
  return null
}
```

#### Email Validation
```typescript
const validateEmail = (value: string): ValidationError | null => {
  if (!value) return createError('REQUIRED', 'Email is required')
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return createError('INVALID_FORMAT', 'Invalid email format')
  }
  
  // Check for disposable email domains
  const domain = value.split('@')[1]?.toLowerCase()
  const disposableDomains = ['10minutemail.com', 'tempmail.org', 'guerrillamail.com']
  if (disposableDomains.includes(domain)) {
    return createWarning('DISPOSABLE_EMAIL', 'Consider using a business email address')
  }
  
  return null
}
```

## User Flows

### Vendor Creation Flow

1. **Navigation**: User clicks "Add Vendor" from vendor list
2. **Form Display**: Multi-tab form opens with Basic Info tab active
3. **Data Entry**: User fills required fields with real-time validation
4. **Tab Navigation**: User completes all tabs (Basic, Contact, Business, Additional)
5. **Validation**: System validates all fields and business rules
6. **Submission**: Form submits with success/error feedback
7. **Redirect**: User redirected to vendor list or vendor detail page

```typescript
const vendorCreationFlow = {
  steps: [
    'navigate_to_form',
    'fill_basic_info',
    'fill_contact_info', 
    'fill_business_details',
    'fill_additional_info',
    'validate_form',
    'submit_form',
    'handle_response'
  ],
  validation: 'real_time',
  saveMode: 'manual_with_autosave_option'
}
```

### Template Creation Flow

1. **Template Setup**: Basic template information and description
2. **Product Selection**: Choose products using category/item selection
3. **Field Configuration**: Add custom fields and validation rules
4. **Pricing Setup**: Configure MOQ options and currency settings
5. **Notifications**: Set up reminder and escalation rules
6. **Preview**: Review template with vendor experience simulation
7. **Save/Activate**: Save as draft or activate for use

### Campaign Management Flow

1. **Template Selection**: Choose existing template or create new one
2. **Vendor Selection**: Select vendors using filters and search
3. **Schedule Setup**: Configure timing and deadlines
4. **Invitation Customization**: Customize email content and settings
5. **Launch Campaign**: Send invitations to selected vendors
6. **Monitor Progress**: Track responses and follow up as needed
7. **Review Submissions**: Evaluate and approve submitted pricelists

### Vendor Portal Flow

1. **Access Link**: Vendor receives secure link via email
2. **Authentication**: Token-based authentication with session management
3. **Instructions**: Review campaign instructions and requirements
4. **Product Review**: Browse and search assigned products
5. **Price Entry**: Enter pricing data using form or Excel upload
6. **Validation**: Real-time validation with error feedback
7. **Submit**: Final submission with confirmation

## Development Guidelines

### Component Development

#### Component Structure
```typescript
// 1. Imports (React, Next.js, external libraries)
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

// 2. Type definitions and interfaces
interface ComponentProps {
  data: DataType
  onAction: (item: DataType) => void
  className?: string
}

// 3. Main component function
export default function ComponentName({ data, onAction, className }: ComponentProps) {
  // Component logic
}

// 4. Subcomponents (if any)
const SubComponent = ({ prop }: SubComponentProps) => {
  // Subcomponent logic
}

// 5. Helper functions
const helperFunction = (param: string): string => {
  // Helper logic
}
```

#### State Management Patterns
```typescript
// Form state with React Hook Form
const form = useForm<FormData>({
  resolver: zodResolver(schema),
  defaultValues,
  mode: 'onChange'
})

// Local state for UI interactions
const [isLoading, setIsLoading] = useState(false)
const [activeTab, setActiveTab] = useState('basic')

// Effect hooks for side effects
useEffect(() => {
  // Data fetching or cleanup
}, [dependencies])
```

### Service Development

#### Service Class Pattern
```typescript
class ServiceName {
  private config: ServiceConfig
  
  constructor(config: ServiceConfig = defaultConfig) {
    this.config = config
  }
  
  async publicMethod(params: MethodParams): Promise<ServiceResult> {
    try {
      // Validation
      const validation = await this.validateInput(params)
      if (!validation.isValid) {
        return { success: false, error: validation.error }
      }
      
      // Business logic
      const result = await this.performOperation(params)
      
      // Audit logging
      await this.logOperation(params, result)
      
      return { success: true, data: result }
    } catch (error) {
      return { success: false, error: this.handleError(error) }
    }
  }
  
  private async validateInput(params: MethodParams): Promise<ValidationResult> {
    // Validation logic
  }
  
  private async performOperation(params: MethodParams): Promise<OperationResult> {
    // Core business logic
  }
}
```

### Error Handling

#### Error Types
```typescript
interface ServiceError {
  code: string
  message: string
  details?: Record<string, any>
  suggestions?: string[]
}

const ERROR_CODES = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  DUPLICATE_ENTITY: 'DUPLICATE_ENTITY',
  NOT_FOUND: 'NOT_FOUND',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
  EXTERNAL_SERVICE_ERROR: 'EXTERNAL_SERVICE_ERROR'
} as const
```

#### Error Handling Pattern
```typescript
const handleError = (error: unknown): ServiceError => {
  if (error instanceof ValidationError) {
    return {
      code: ERROR_CODES.VALIDATION_FAILED,
      message: error.message,
      details: { field: error.field, value: error.value }
    }
  }
  
  if (error instanceof BusinessRuleError) {
    return {
      code: ERROR_CODES.BUSINESS_RULE_VIOLATION,
      message: error.message,
      suggestions: error.suggestions
    }
  }
  
  // Fallback for unknown errors
  return {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    details: { originalError: String(error) }
  }
}
```

### Testing Strategy

#### Component Testing
```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import VendorForm from '../VendorForm'

describe('VendorForm', () => {
  it('should validate required fields', async () => {
    const mockOnSave = vi.fn()
    render(<VendorForm onSave={mockOnSave} userId="test-user" />)
    
    // Test validation
    fireEvent.click(screen.getByText('Save'))
    expect(screen.getByText('Company name is required')).toBeInTheDocument()
  })
  
  it('should call onSave with valid data', async () => {
    const mockOnSave = vi.fn()
    render(<VendorForm onSave={mockOnSave} userId="test-user" />)
    
    // Fill form
    fireEvent.change(screen.getByLabelText('Company Name'), {
      target: { value: 'Test Company' }
    })
    
    // Submit
    fireEvent.click(screen.getByText('Save'))
    
    expect(mockOnSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Company'
      })
    )
  })
})
```

#### Service Testing
```typescript
describe('VendorService', () => {
  it('should create vendor with valid data', async () => {
    const vendorData = {
      name: 'Test Company',
      contactEmail: 'test@company.com',
      // ... other required fields
    }
    
    const result = await vendorService.createVendor(vendorData, 'user-id')
    
    expect(result.success).toBe(true)
    expect(result.data).toMatchObject(vendorData)
  })
  
  it('should reject invalid vendor data', async () => {
    const invalidData = {
      name: '', // Invalid: empty name
      contactEmail: 'invalid-email' // Invalid: bad format
    }
    
    const result = await vendorService.createVendor(invalidData, 'user-id')
    
    expect(result.success).toBe(false)
    expect(result.error?.code).toBe('VALIDATION_ERROR')
  })
})
```

### Performance Optimization

#### List Rendering
```typescript
// Use useMemo for expensive filtering/sorting
const filteredVendors = useMemo(() => {
  return vendors
    .filter(vendor => matchesFilters(vendor, filters))
    .sort((a, b) => sortFunction(a, b, sortConfig))
}, [vendors, filters, sortConfig])

// Virtualization for large lists
import { FixedSizeList as List } from 'react-window'

const VirtualizedVendorList = ({ vendors }) => (
  <List
    height={600}
    itemCount={vendors.length}
    itemSize={120}
    itemData={vendors}
  >
    {VendorRow}
  </List>
)
```

#### Data Fetching
```typescript
// Implement pagination for large datasets
const usePaginatedVendors = (filters: VendorFilters) => {
  const [page, setPage] = useState(1)
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [hasMore, setHasMore] = useState(true)
  
  const loadMore = useCallback(async () => {
    const result = await vendorApi.list(filters, page, 20)
    if (result.success) {
      setVendors(prev => [...prev, ...result.data.items])
      setHasMore(result.data.hasMore)
      setPage(prev => prev + 1)
    }
  }, [filters, page])
  
  return { vendors, hasMore, loadMore }
}
```

### Security Considerations

#### Input Validation
- All user inputs are validated on both client and server side
- SQL injection prevention through parameterized queries
- XSS prevention through proper output encoding
- CSRF protection through token validation

#### Authentication & Authorization
- Token-based authentication for vendor portal
- Role-based access control for admin functions
- Session management with secure cookies
- Audit logging for sensitive operations

#### Data Protection
- Sensitive data encryption at rest and in transit
- PII handling compliance (GDPR/CCPA)
- Regular security audits and updates
- Secure file upload handling

This comprehensive technical specification provides all the details needed to recreate the vendor management system. The documentation covers every aspect from data models to user interfaces, business logic to validation rules, ensuring that a developer could rebuild the exact same system using this specification.