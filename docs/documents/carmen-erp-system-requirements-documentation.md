# Carmen ERP System - Complete System Requirements & Documentation

## System Overview

Carmen is a comprehensive hospitality-focused Enterprise Resource Planning (ERP) system designed for hotels, restaurants, and hospitality operations. The system manages procurement, inventory, vendor relationships, operational planning, and financial operations through a unified web-based platform.

**Vision**: A complete end-to-end hospitality management system that streamlines operations from procurement to service delivery, with intelligent automation, real-time analytics, and seamless integration across all hotel departments.

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Authentication & User Management

### Current Implementation
The system uses a mock authentication system for prototype development with no real authentication or session management.

### Features Implemented
- **Simple User Context**: Mock user authentication system (`lib/context/simple-user-context.tsx`)
- **User Switching**: Ability to switch between different mock users for testing
- **Role System**: Mock roles including staff, manager, financial-manager, purchasing-staff, chef
- **Department/Location Context**: Users can switch between departments and locations

### Technical Implementation
```typescript
// Simple mock authentication
const DEFAULT_MOCK_USER = mockUsers[0]
- Mock user data from centralized mock data files
- Client-side context provider for user state
- No real authentication, sessions, or security
```

### Flow Diagram
```mermaid
sequenceDiagram
    participant User
    participant AuthSystem
    participant UserContext
    participant PermissionEngine
    participant Application

    User->>AuthSystem: Login credentials + MFA
    AuthSystem->>AuthSystem: Validate credentials & MFA
    AuthSystem->>PermissionEngine: Load user roles & permissions
    PermissionEngine->>UserContext: Create secure user session
    UserContext->>UserContext: Initialize department & location context
    UserContext->>Application: Grant access to authorized features
    Application-->>User: Display personalized interface

    User->>UserContext: Switch department/role
    UserContext->>PermissionEngine: Validate switch permissions
    PermissionEngine->>UserContext: Update active context
    UserContext->>Application: Refresh feature access
    Application-->>User: Update interface permissions
```

### Limitations
- No real authentication system
- No password validation
- No session management
- All authentication is mocked for development

---

## 2. Dashboard & Analytics

### Current Implementation
The dashboard displays static mock data with basic charts and tables showing hospitality metrics.

### Features Implemented

#### Dashboard Cards (`dashboard-cards.tsx`)
- **Total Orders**: Hardcoded value of 1,234
- **Active Suppliers**: Hardcoded value of 89
- **Inventory Value**: Hardcoded value of $45,231
- **Monthly Spend**: Hardcoded value of $89,432

#### Dashboard Charts (`dashboard-chart.tsx`)
- **Order Trends Chart**: Area chart showing mock monthly order data
- **Spend Analysis Chart**: Bar chart displaying mock procurement spend
- **Supplier Network Growth**: Line chart with mock supplier and order correlation

#### Recent Activities Table (`dashboard-data-table.tsx`)
- Displays 6 hardcoded activity records
- Shows Purchase Requests, Purchase Orders, Goods Receipt, Stock Adjustment, Vendor Invoice, Quality Check
- Each record has mock data for status, priority, reviewer, and date

### Data Structure
```typescript
const chartData = [
  { month: "Jan", orders: 186, spend: 45000, suppliers: 12 },
  { month: "Feb", orders: 305, spend: 52000, suppliers: 15 },
  // ... more hardcoded monthly data
]
```

### Flow Diagram
```mermaid
flowchart TD
    A[User Accesses Dashboard] --> B[Load User Context & Preferences]
    B --> C[Real-time Data Aggregation]
    C --> D[Procurement Data Stream]
    C --> E[Inventory Data Stream]
    C --> F[Financial Data Stream]
    C --> G[Operational Data Stream]

    D --> H[KPI Calculation Engine]
    E --> H
    F --> H
    G --> H

    H --> I[Anomaly Detection]
    H --> J[Trend Analysis]
    H --> K[Predictive Modeling]

    I --> L[Smart Alerts Generation]
    J --> M[Interactive Charts & Visualizations]
    K --> N[Forecasting & Recommendations]

    L --> O[Personalized Dashboard Display]
    M --> O
    N --> O

    O --> P[User Interaction & Drill-down]
    P --> Q[Detailed Analysis & Actions]
```

### Limitations
- All data is hardcoded/static
- No real-time data fetching
- No dynamic calculations or aggregations
- Charts display mock trends only

---

## 3. Procurement Management

### Current Implementation
Basic procurement interface with mock purchase request data and list views.

### Features Implemented

#### Purchase Requests List (`ModernPurchaseRequestList.tsx`)
- **List View**: Table and card view modes for purchase requests
- **Mock Data**: Uses `mockPRListData.ts` with sample purchase request records
- **View Modes**: Toggle between table and card display
- **Selection**: Multi-select functionality for purchase requests
- **Actions**: Placeholder buttons for create, download, print (non-functional)

#### Purchase Request Data
- Sample purchase requests with realistic hospitality data
- Fields: ID, reference number, requestor, status, workflow stage, estimated total
- Workflow statuses: pending, approved, completed
- Request types: General Purchase, Emergency, Capital Expenditure

### Data Structure
```typescript
export const mockPRListData: PurchaseRequest[] = [
  {
    id: 'pr-2024-001',
    refNumber: 'PR-2401-0001',
    description: 'Kitchen Equipment and Food Supplies for Grand Ballroom Event',
    requestor: { name: 'Chef Maria Rodriguez', department: 'Food & Beverage' },
    status: DocumentStatus.Completed,
    estimatedTotal: 15750.00,
    // ... more mock fields
  }
]
```

### Flow Diagram
```mermaid
stateDiagram-v2
    [*] --> Draft_Request
    Draft_Request --> Submitted : Submit with Approvers
    Submitted --> Department_Review : Auto Route by Rules
    Department_Review --> Manager_Approval : Department Head Approves
    Department_Review --> Purchasing_Review : Direct to Procurement
    Manager_Approval --> Purchasing_Review : Escalate by Value

    Purchasing_Review --> Vendor_Selection : Approve for Sourcing
    Vendor_Selection --> RFQ_Process : Multiple Vendors
    Vendor_Selection --> Direct_Order : Preferred Vendor

    RFQ_Process --> Quote_Evaluation : Receive Proposals
    Quote_Evaluation --> Vendor_Selection : Select Best Quote

    Direct_Order --> Purchase_Order : Generate PO
    Purchase_Order --> Order_Tracking : Monitor Delivery
    Order_Tracking --> Goods_Receipt : Delivery Received

    Goods_Receipt --> Quality_Check : Inspection Process
    Quality_Check --> Receipt_Complete : Accept Goods
    Quality_Check --> Discrepancy_Handling : Quality Issues

    Discrepancy_Handling --> Vendor_Resolution : Work with Vendor
    Vendor_Resolution --> Receipt_Complete : Resolved
    Vendor_Resolution --> Return_Process : Return Goods

    Receipt_Complete --> Invoice_Matching : 3-Way Match
    Invoice_Matching --> Payment_Processing : Approved for Payment
    Payment_Processing --> [*] : Transaction Complete

    Purchasing_Review --> Rejected : Reject Request
    Department_Review --> Rejected : Decline
    Rejected --> [*] : Process Ends
```

### Limitations
- No create/edit functionality
- No approval workflow implementation
- No integration with vendor or inventory systems
- All data is static mock data

---

## 4. Vendor Management

### Current Implementation
Multi-module vendor management system with working features and prototype demonstrations.

### Features Implemented

#### Vendor Management Dashboard (`page.tsx`)
- **Quick Stats**: Total vendors (25), active contracts (18), price updates (45), pending approvals (3)
- **Module Navigation**: Links to different vendor management sections
- **Development Status**: Clear indication of what's implemented vs. prototype

#### Module Structure
1. **Manage Vendors**: ✅ Fully implemented (links to `/vendor-management/manage-vendors`)
2. **Price Lists**: ✅ Implemented (links to `/vendor-management/pricelists`)
3. **Pricelist Templates**: 🚧 UI Prototype only (marked as "Demo Only")
4. **Pricing Campaigns**: 🚧 UI Prototype only (marked as "Demo Only")
5. **Analytics & Reports**: ❌ Coming Soon (disabled button)

### Implementation Status
```typescript
// Actual implementation markers in the code
<Badge className="bg-orange-100 text-orange-700">Prototype</Badge>
<Badge variant="outline" className="text-orange-600 border-orange-200">Demo Only</Badge>
<Button variant="outline" size="sm" disabled>Coming Soon</Button>
```

### Prototype Features
- Pricelist template management UI (no backend functionality)
- Pricing campaign management UI (no backend functionality)
- Vendor portal demo interface

### Flow Diagram
```mermaid
graph TD
    A[Vendor Application] --> B[Initial Screening]
    B --> C[Document Collection]
    C --> D[Verification Process]
    D --> E[Credit & Reference Check]
    E --> F{Qualification Met?}

    F -->|Yes| G[Approved Vendor]
    F -->|No| H[Rejected/Conditional]

    G --> I[Contract Negotiation]
    I --> J[Contract Execution]
    J --> K[Active Vendor Status]

    K --> L[Performance Monitoring]
    L --> M[Quarterly Review]
    M --> N[Scorecard Generation]

    N --> O{Performance Acceptable?}
    O -->|Yes| P[Maintain Status]
    O -->|No| Q[Improvement Plan]

    Q --> R[Performance Monitoring Period]
    R --> S{Improved?}
    S -->|Yes| P
    S -->|No| T[Probation/Termination]

    P --> L

    U[Certification Monitoring] --> V[Expiry Alerts]
    V --> W[Renewal Process]
    W --> X[Compliance Verification]

    Y[Risk Assessment] --> Z[Financial Monitoring]
    Z --> AA[Risk Score Update]
    AA --> BB{High Risk?}
    BB -->|Yes| CC[Risk Mitigation]
    BB -->|No| DD[Continue Monitoring]
```

### Limitations
- Price management features are UI prototypes only
- No real data integration for pricing
- Analytics module not implemented
- Templates and campaigns are demonstration interfaces only

---

## 5. System Navigation

### Current Implementation
Multi-level sidebar navigation system with responsive design and collapsible sections.

### Features Implemented

#### Sidebar Navigation (`sidebar.tsx`)
- **Multi-level Menu**: Supports up to 3 levels of nesting
- **Responsive Design**: Collapsible sidebar with mobile sheet overlay
- **Dynamic Icons**: Uses Lucide React icons throughout
- **Active State**: Highlights current page/section

#### Available Modules
Based on existing page files:
- Dashboard
- Procurement
- Inventory Management
- Vendor Management
- Product Management
- Operational Planning
- Production
- Store Operations
- Finance
- Reporting & Analytics
- System Administration
- Help & Support
- Style Guide

### Navigation Structure
```typescript
interface MenuItem {
  title: string;
  path: string;
  icon: string;
  subItems: Array<SubMenuItem>;
}
```

### Navigation Flow Diagram
```mermaid
flowchart TD
    A[App Loads] --> B[SidebarProvider Initializes]
    B --> C[Load Navigation Menu Structure]

    C --> D[Main Menu Items]
    D --> E[Dashboard - Working]
    D --> F[Procurement - Partial]
    D --> G[Inventory Management - Unknown]
    D --> H[Vendor Management - Working]
    D --> I[Product Management - Unknown]
    D --> J[Other Modules - Various]

    K[User Clicks Menu Item] --> L{Has Submenu?}
    L -->|Yes| M[Expand Submenu]
    L -->|No| N[Navigate to Page]

    M --> O[Show Sub-items]
    O --> P[User Clicks Sub-item]
    P --> N

    N --> Q{Page Exists?}
    Q -->|Yes| R[Load Page Content]
    Q -->|No| S[Empty/Placeholder Page]

    T[Mobile View] --> U[Sidebar Collapses]
    U --> V[Sheet Overlay Mode]
    V --> W[Touch-friendly Navigation]

    X[Desktop View] --> Y[Persistent Sidebar]
    Y --> Z[Multi-level Expansion]
```

### Limitations
- Many module pages are placeholder/empty implementations
- Navigation structure exists but content varies by module
- Some modules are fully implemented, others are basic stubs

---

## 6. User Interface System

### Current Implementation
Consistent UI component system based on Tailwind CSS and Shadcn/ui components.

### Components Implemented
- **Cards**: Used throughout for metric display and module navigation
- **Tables**: Data tables with sorting, filtering, selection capabilities
- **Charts**: Area, bar, and line charts using Recharts library
- **Forms**: React Hook Form integration with Zod validation
- **Navigation**: Sidebar, dropdown menus, breadcrumbs
- **Badges**: Status indicators, labels, categories
- **Buttons**: Various sizes, variants, and states

### Design System
- **Typography**: Consistent font sizing and hierarchy
- **Colors**: Tailwind CSS color palette with semantic usage
- **Spacing**: Consistent padding and margin patterns
- **Icons**: Lucide React icon library throughout
- **Responsive**: Mobile-first design approach

### Limitations
- No comprehensive design system documentation
- Some components are basic implementations
- Limited accessibility testing and compliance

---

## 7. Data Architecture

### Current Implementation
Mock data system with TypeScript types and centralized data management.

### Type System (`lib/types/`)
- **Centralized Types**: All interfaces defined in `lib/types/` barrel exports
- **Domain Types**: User, Vendor, PurchaseRequest, Inventory, Product, Recipe, Finance
- **Common Types**: Money, DocumentStatus, WorkflowStatus, Currency
- **Type Guards**: Runtime validation functions
- **Converters**: Data transformation utilities

### Mock Data System (`lib/mock-data/`)
- **Centralized Mock Data**: All sample data in `lib/mock-data/`
- **Factory Functions**: Functions to create mock entities with overrides
- **Realistic Data**: Mock data reflects actual hospitality scenarios
- **Data Consistency**: Cross-referenced mock data between modules

### Data Structure Example
```typescript
// Type definition
export interface PurchaseRequest {
  id: string;
  refNumber: string;
  requestor: User;
  status: DocumentStatus;
  estimatedTotal: number;
  // ... additional fields
}

// Mock data usage
import { mockPRListData } from '@/lib/mock-data'
const displayData = useMemo(() => mockPRListData, [])
```

### Data Flow Diagram
```mermaid
flowchart TD
    A[Application Starts] --> B[Import Type Definitions]
    B --> C[lib/types/index.ts - Barrel Exports]

    C --> D[Domain-Specific Types]
    D --> E[User, Vendor, PurchaseRequest]
    D --> F[Inventory, Product, Recipe]
    D --> G[Finance, Common Types]

    H[Component Needs Data] --> I[Import from lib/mock-data]
    I --> J[Centralized Mock Data Files]

    J --> K[mockUsers, mockVendors]
    J --> L[mockPRListData, mockInventory]
    J --> M[Factory Functions Available]

    N[Runtime Usage] --> O[Component Uses Mock Data]
    O --> P[Display in UI Components]

    Q[Type Safety] --> R[TypeScript Validation]
    R --> S[Compile-time Checking]

    T[No Persistence] --> U[Client-side State Only]
    U --> V[Page Refresh = Data Reset]

    W[Type Guards Available] --> X[Runtime Type Validation]
    X --> Y[isUser and isPurchaseRequest functions]

    Z[Converters Available] --> AA[Data Transformation]
    AA --> BB[formatMoney and convertTypes functions]
```

### Limitations
- No real database integration
- All data persistence is client-side only
- No data validation at runtime
- Mock data doesn't reflect real business complexity

---

## Technical Architecture

### Frontend Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS + Shadcn/ui components
- **State Management**: Zustand for global state, React Query for server state
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts library for data visualization
- **Icons**: Lucide React icon system

### Project Structure
```
app/(main)/              # Main application routes
  dashboard/            # ✅ Fully implemented with mock data
  procurement/         # ✅ Basic list views implemented
  vendor-management/   # ✅ Mixed: working features + prototypes
  [other-modules]/     # ❓ Various implementation levels
components/ui/          # ✅ Shadcn/ui component library
lib/
  types/               # ✅ Centralized TypeScript definitions
  mock-data/          # ✅ Centralized mock data system
  context/            # ✅ User context and state management
```

### Development Environment
- **Node.js**: v20.14.0
- **Package Manager**: npm v10.7.0
- **Build System**: Next.js built-in build system
- **Development Server**: Next.js dev server on port 3003

---

## Implementation Status Summary

### ✅ Fully Implemented
- **Dashboard**: Working interface with mock data and charts
- **Basic Navigation**: Multi-level sidebar with responsive design
- **User Context**: Mock authentication and role switching
- **UI Components**: Consistent component library
- **Type System**: Comprehensive TypeScript definitions
- **Mock Data**: Realistic sample data across domains

### 🚧 Partially Implemented
- **Procurement**: List views work, but no CRUD operations
- **Vendor Management**: Core features work, price management is prototype only

### ❌ Not Implemented
- **Real Authentication**: All authentication is mocked
- **Data Persistence**: No database or API integration
- **Business Logic**: No real workflow or calculation engines
- **Advanced Features**: Most modules are basic stubs or placeholders

### 🎨 UI Prototypes Only
- **Pricelist Templates**: Visual interface with no functionality
- **Pricing Campaigns**: Demo screens with mock interactions
- **Advanced Analytics**: UI mockups planned but not built

---

This documentation reflects the actual state of the Carmen ERP prototype as implemented in the source code. The system provides a solid foundation for hospitality ERP functionality with working user interfaces, consistent design patterns, and extensible architecture, but currently operates entirely on mock data without real business logic implementation.