# Database Schema & Data Model Documentation

**Document Type**: Data Architecture Specification  
**Version**: 1.0  
**Last Updated**: August 22, 2025  
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Purpose**: Complete data model for Carmen ERP recreation

---

## 🎯 Overview

Carmen ERP utilizes a comprehensive TypeScript-based type system with 23 interface files providing type safety and data consistency across the entire application. This document provides the complete data model architecture required for recreation.

### Data Architecture Principles
- **Type Safety**: 100% TypeScript coverage with strict mode
- **Centralized Types**: Single source of truth via barrel exports
- **Domain Separation**: Clear separation between business domains
- **Validation Integration**: Zod schema validation throughout
- **Runtime Safety**: Type guards and converters for data integrity

---

## 📊 Type System Architecture

### Master Type Registry (23 Files)
```
lib/types/
├── index.ts                    # Master barrel export
├── common.ts                   # Shared types (Money, Status, etc.)
├── user.ts                     # Authentication & RBAC
├── inventory.ts                # Stock management & counts
├── procurement.ts              # Purchase requests & orders
├── vendor.ts                   # Vendor relationships
├── product.ts                  # Product catalog
├── recipe.ts                   # Recipe management
├── finance.ts                  # Financial operations
├── guards.ts                   # Type guard functions
├── converters.ts              # Data transformation
├── validators.ts              # Business rule validation
└── [Enhanced Modules]          # Specialized domain types
    ├── fractional-inventory.ts
    ├── enhanced-pr-types.ts
    ├── enhanced-consumption-tracking.ts
    ├── enhanced-costing-engine.ts
    ├── count-allocation.ts
    ├── credit-note.ts
    ├── hotel.ts
    ├── price-management.ts
    ├── campaign-management.ts
    ├── vendor-price-management.ts
    └── business-rules.ts
```

---

## 🏗️ Core Data Models

### 1. Common & Shared Types

#### Money and Currency System
```typescript
// Monetary representation throughout the system
interface Money {
  amount: number;
  currency: string;
}

// Currency definitions
interface Currency {
  id: number;
  code: string;        // ISO currency code (USD, EUR, etc.)
  description: string;
  symbol?: string;     // Currency symbol ($, €, etc.)
  active: boolean;
}

// Exchange rate management
interface ExchangeRate {
  id: number;
  currencyCode: string;
  currencyName: string;
  rate: number;
  lastUpdated: string;
}
```

#### Status & Workflow Types
```typescript
// Document lifecycle states
type DocumentStatus = 'draft' | 'inprogress' | 'approved' | 'converted' | 'rejected' | 'void';

// Workflow progression states
type WorkflowStatus = 'draft' | 'pending' | 'approved' | 'review' | 'rejected';

// Priority levels
type PriorityLevel = 'low' | 'normal' | 'high' | 'urgent';

// Activity tracking
interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  timestamp: string;
  details?: Record<string, any>;
}
```

### 2. User Management & RBAC

#### User Hierarchy
```typescript
// Location management
interface Location {
  id: string;
  name: string;
  type: 'hotel' | 'restaurant' | 'warehouse' | 'office';
  address?: string;
}

// Department structure
interface Department {
  id: string;
  name: string;
  code: string;
}

// Role definitions
interface Role {
  id: string;
  name: string;
  permissions: string[];
}

// User profile
interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  availableRoles: Role[];
  availableDepartments: Department[];
  availableLocations: Location[];
}

// Active user context
interface UserContext {
  currentRole: Role;
  currentDepartment: Department;
  currentLocation: Location;
  showPrices?: boolean;
}
```

### 3. Inventory Management

#### Stock & Item Management
```typescript
// Inventory item definition
interface InventoryItem {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: string;
  unitOfMeasure: string;
  currentStock: number;
  minimumStock?: number;
  maximumStock?: number;
  averageCost: Money;
  lastReceived?: string;
  location: string;
  status: 'active' | 'inactive' | 'discontinued';
}

// Stock movement tracking
interface StockMovement {
  id: string;
  itemId: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reference?: string;
  reason?: string;
  timestamp: string;
  userId: string;
}

// Physical count management
interface PhysicalCount {
  id: string;
  name: string;
  location: string;
  status: 'planning' | 'in-progress' | 'completed' | 'cancelled';
  countDate: string;
  items: PhysicalCountItem[];
  createdBy: string;
  createdAt: string;
}

interface PhysicalCountItem {
  itemId: string;
  expectedQty: number;
  countedQty?: number;
  variance?: number;
  notes?: string;
}
```

### 4. Procurement Management

#### Purchase Request System
```typescript
// Purchase request structure
interface PurchaseRequest {
  id: string;
  number: string;
  description: string;
  department: string;
  requestor: string;
  status: DocumentStatus;
  priority: PriorityLevel;
  requiredDate: string;
  items: PurchaseRequestItem[];
  approvals: ApprovalStep[];
  totalAmount: Money;
  createdAt: string;
  updatedAt: string;
}

// PR line items
interface PurchaseRequestItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitOfMeasure: string;
  estimatedPrice?: Money;
  totalPrice?: Money;
  specification?: string;
  category?: string;
  vendorId?: string;
}

// Purchase order structure
interface PurchaseOrder {
  id: string;
  number: string;
  vendorId: string;
  status: DocumentStatus;
  orderDate: string;
  deliveryDate?: string;
  items: PurchaseOrderItem[];
  totalAmount: Money;
  terms?: string;
  notes?: string;
  createdFrom?: string; // Reference to PR
}
```

#### Goods Received Note
```typescript
interface GoodsReceivedNote {
  id: string;
  number: string;
  purchaseOrderId?: string;
  vendorId: string;
  receivedDate: string;
  receivedBy: string;
  items: GRNItem[];
  totalAmount: Money;
  status: 'draft' | 'completed' | 'partially-received';
  notes?: string;
}

interface GRNItem {
  id: string;
  productId: string;
  orderedQty: number;
  receivedQty: number;
  unitPrice: Money;
  totalPrice: Money;
  condition?: 'good' | 'damaged' | 'partial';
  notes?: string;
}
```

### 5. Vendor Management

#### Vendor Profile System
```typescript
// Vendor master data
interface Vendor {
  id: string;
  code: string;
  name: string;
  type: 'supplier' | 'service-provider' | 'contractor';
  status: 'active' | 'inactive' | 'suspended';
  category: string;
  
  // Contact information
  contacts: VendorContact[];
  addresses: VendorAddress[];
  
  // Business details
  taxId?: string;
  registrationNumber?: string;
  website?: string;
  
  // Financial terms
  paymentTerms?: string;
  creditLimit?: Money;
  currency: string;
  
  // Performance tracking
  rating?: number;
  lastOrderDate?: string;
  totalOrders?: number;
  
  createdAt: string;
  updatedAt: string;
}

// Vendor contact management
interface VendorContact {
  id: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  isPrimary: boolean;
}

// Vendor address management
interface VendorAddress {
  id: string;
  type: 'billing' | 'delivery' | 'office';
  address: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  isPrimary: boolean;
}
```

### 6. Product Management

#### Product Catalog System
```typescript
// Product master data
interface Product {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: ProductCategory;
  subcategory?: string;
  
  // Physical properties
  unitOfMeasure: string;
  weight?: number;
  volume?: number;
  dimensions?: ProductDimensions;
  
  // Inventory settings
  trackInventory: boolean;
  minimumStock?: number;
  maximumStock?: number;
  reorderPoint?: number;
  
  // Pricing
  standardCost?: Money;
  averageCost?: Money;
  lastCost?: Money;
  
  // Specifications
  specifications?: ProductSpecification[];
  allergens?: string[];
  nutritionalInfo?: NutritionalInfo;
  
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: string;
  updatedAt: string;
}

// Product categorization
interface ProductCategory {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  description?: string;
  specifications?: string[]; // Required spec fields
}
```

### 7. Recipe Management

#### Recipe & Menu System
```typescript
// Recipe definition
interface Recipe {
  id: string;
  name: string;
  code?: string;
  description?: string;
  category: 'appetizer' | 'main' | 'dessert' | 'beverage' | 'side';
  cuisineType: string;
  
  // Recipe details
  servings: number;
  prepTime?: number; // minutes
  cookTime?: number; // minutes
  difficulty?: 'easy' | 'medium' | 'hard';
  
  // Ingredients and costing
  ingredients: RecipeIngredient[];
  instructions: RecipeInstruction[];
  totalCost: Money;
  costPerServing: Money;
  
  // Menu integration
  menuPrice?: Money;
  isActive: boolean;
  seasonality?: string;
  
  // Metadata
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

// Recipe ingredient management
interface RecipeIngredient {
  id: string;
  productId: string;
  quantity: number;
  unitOfMeasure: string;
  cost: Money;
  isOptional?: boolean;
  substitutes?: string[]; // Alternative product IDs
  notes?: string;
}

// Recipe instructions
interface RecipeInstruction {
  step: number;
  instruction: string;
  duration?: number; // minutes
  temperature?: number;
  equipment?: string[];
}
```

### 8. Financial Management

#### Financial Data Structures
```typescript
// Account code mapping
interface AccountCode {
  id: string;
  code: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  category: string;
  isActive: boolean;
  parentId?: string;
}

// Cost center management
interface CostCenter {
  id: string;
  code: string;
  name: string;
  type: 'department' | 'location' | 'project';
  budget?: Money;
  actualSpend?: Money;
  isActive: boolean;
}

// Invoice management
interface Invoice {
  id: string;
  number: string;
  vendorId: string;
  type: 'purchase' | 'service' | 'expense';
  amount: Money;
  taxAmount: Money;
  totalAmount: Money;
  dueDate: string;
  status: 'draft' | 'approved' | 'paid' | 'overdue';
  accountCodeId: string;
  costCenterId?: string;
  attachments?: string[];
  createdAt: string;
}
```

---

## 🔧 Data Utilities & Validation

### Type Guards System
```typescript
// Runtime type checking functions
function isUser(obj: any): obj is User {
  return obj && typeof obj.id === 'string' && typeof obj.name === 'string';
}

function isPurchaseRequest(obj: any): obj is PurchaseRequest {
  return obj && typeof obj.id === 'string' && obj.status !== undefined;
}

function userHasPermission(user: User, permission: string): boolean {
  return user.context.currentRole.permissions.includes(permission);
}
```

### Data Converters
```typescript
// Data transformation utilities
function purchaseRequestToPurchaseOrder(pr: PurchaseRequest, vendorId: string): Partial<PurchaseOrder> {
  return {
    vendorId,
    items: pr.items.map(item => ({
      productId: item.productId,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.estimatedPrice || { amount: 0, currency: 'USD' },
      totalPrice: item.totalPrice || { amount: 0, currency: 'USD' }
    })),
    totalAmount: pr.totalAmount,
    createdFrom: pr.id
  };
}

function formatMoney(money: Money): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: money.currency
  });
  return formatter.format(money.amount);
}
```

### Business Rule Validators
```typescript
// Business logic validation
function validatePurchaseRequest(pr: PurchaseRequest): ValidationResult {
  const errors: string[] = [];
  
  if (!pr.description?.trim()) {
    errors.push('Description is required');
  }
  
  if (pr.items.length === 0) {
    errors.push('At least one item is required');
  }
  
  if (pr.totalAmount.amount <= 0) {
    errors.push('Total amount must be greater than zero');
  }
  
  return { isValid: errors.length === 0, errors };
}

function validateVendor(vendor: Vendor): ValidationResult {
  const errors: string[] = [];
  
  if (!vendor.name?.trim()) {
    errors.push('Vendor name is required');
  }
  
  if (vendor.contacts.length === 0) {
    errors.push('At least one contact is required');
  }
  
  return { isValid: errors.length === 0, errors };
}
```

---

## 🏪 Mock Data Architecture

### Factory Pattern Implementation
```typescript
// Mock data factories for consistent test data
function createMockVendor(overrides?: Partial<Vendor>): Vendor {
  return {
    id: generateId(),
    code: 'V001',
    name: 'Test Vendor Inc.',
    type: 'supplier',
    status: 'active',
    category: 'Food & Beverage',
    contacts: [createMockVendorContact()],
    addresses: [createMockVendorAddress()],
    currency: 'USD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}

function createMockPurchaseRequest(overrides?: Partial<PurchaseRequest>): PurchaseRequest {
  return {
    id: generateId(),
    number: 'PR-2401-0001',
    description: 'Test Purchase Request',
    department: 'Kitchen',
    requestor: 'test-user-id',
    status: 'draft',
    priority: 'normal',
    requiredDate: addDays(new Date(), 7).toISOString(),
    items: [createMockPRItem()],
    approvals: [],
    totalAmount: { amount: 100.00, currency: 'USD' },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides
  };
}
```

### Test Scenario Data
```typescript
// Complex multi-entity scenarios for testing
export const testScenarios = {
  completePRWorkflow: {
    user: createMockUser({ role: 'purchasing-staff' }),
    vendor: createMockVendor(),
    products: [createMockProduct(), createMockProduct()],
    purchaseRequest: createMockPurchaseRequest({ items: [/* ... */] }),
    approvals: [/* approval workflow */]
  },
  
  inventoryCountScenario: {
    location: createMockLocation(),
    items: Array.from({ length: 10 }, () => createMockInventoryItem()),
    physicalCount: createMockPhysicalCount(),
    movements: [/* stock movements */]
  }
};
```

---

## 📐 Entity Relationship Diagrams

### Core Relationships
```
User ──┐
       ├── Role (many-to-many)
       ├── Department (many-to-many)
       └── Location (many-to-many)

PurchaseRequest ──┐
                 ├── PurchaseRequestItem (one-to-many)
                 ├── User (requestor)
                 ├── Department
                 └── Approval (one-to-many)

PurchaseOrder ──┐
               ├── PurchaseOrderItem (one-to-many)
               ├── Vendor
               └── PurchaseRequest (optional)

Vendor ──┐
        ├── VendorContact (one-to-many)
        ├── VendorAddress (one-to-many)
        ├── PurchaseOrder (one-to-many)
        └── Invoice (one-to-many)

Product ──┐
         ├── ProductCategory
         ├── InventoryItem
         ├── RecipeIngredient (one-to-many)
         └── PurchaseRequestItem (one-to-many)

Recipe ──┐
        ├── RecipeIngredient (one-to-many)
        ├── RecipeInstruction (one-to-many)
        └── Product (ingredients)
```

---

## ✅ Data Model Implementation Checklist

### Core Types (Required)
- [ ] Common types (Money, Status, etc.)
- [ ] User management and RBAC types
- [ ] Inventory management types
- [ ] Procurement types (PR, PO, GRN)
- [ ] Vendor management types
- [ ] Product catalog types
- [ ] Recipe management types
- [ ] Financial types

### Utility Systems (Required)
- [ ] Type guard functions implemented
- [ ] Data converter functions implemented
- [ ] Business rule validators implemented
- [ ] Mock data factories created
- [ ] Test scenario data prepared

### Enhanced Features (Optional)
- [ ] Fractional inventory types
- [ ] Enhanced costing engine types
- [ ] Campaign management types
- [ ] Advanced analytics types

---

**Next Steps**: Proceed to [UI Component Library Catalog](../03-ui-components/component-catalog.md) for complete design system documentation.

*This data model provides the complete type system foundation for recreating Carmen ERP with full data integrity and type safety.*