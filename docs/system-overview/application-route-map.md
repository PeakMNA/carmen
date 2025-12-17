# Carmen ERP Application Route Map

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Overview

This document provides a comprehensive map of all routes in the Carmen ERP system, organized by module and functionality. The application follows Next.js 14 App Router conventions with a hospitality-focused ERP structure.

## Route Architecture

### Base Structure
```
app/
├── (auth)/              # Authentication routes
├── (main)/              # Main application routes  
├── api/                 # API endpoints
└── legacy routes        # Backward compatibility
```

## Authentication Routes

### Public Authentication
| Route | Component | Description | Access Level |
|-------|-----------|-------------|--------------|
| `/login` | `app/(auth)/login/[[...login]]/page.tsx` | User login page | Public |
| `/signin` | `app/(auth)/signin/[[...signin]]` | Alternative signin | Public |
| `/signup` | `app/(auth)/signup/[[...signup]]/page.tsx` | User registration | Public |

### Authentication Flow
```
┌─────────────┐    ┌──────────────┐    ┌─────────────────┐
│   /login    │───▶│ Authentication│───▶│   /dashboard    │
└─────────────┘    └──────────────┘    └─────────────────┘
       │                                         │
       ▼                                         ▼
┌─────────────┐                        ┌─────────────────┐
│   /signup   │                        │ /select-business│
└─────────────┘                        │     -unit       │
                                       └─────────────────┘
```

## Main Application Routes

### Core Dashboard & Profile
| Route | Component | Description | Module | Access |
|-------|-----------|-------------|---------|---------|
| `/` | `app/page.tsx` | Landing/redirect page | Core | Public |
| `/dashboard` | `app/(main)/dashboard/page.tsx` | Main dashboard | Core | Protected |
| `/profile` | `app/profile/page.tsx` | User profile view | Core | Protected |
| `/edit-profile` | `app/(main)/edit-profile/page.tsx` | Profile editing | Core | Protected |
| `/select-business-unit` | `app/select-business-unit/page.tsx` | Business unit selection | Core | Protected |

## Inventory Management Module

### Main Inventory Routes
| Route | Component | Description | Features |
|-------|-----------|-------------|----------|
| `/inventory-management` | `page.tsx` | Module overview | Navigation hub |
| `/inventory-management/stock-overview` | `stock-overview/page.tsx` | Stock overview dashboard | Real-time inventory |

### Physical Count Management
| Route | Component | Description | Workflow Stage |
|-------|-----------|-------------|----------------|
| `/inventory-management/physical-count` | `physical-count/page.tsx` | Count management hub | Overview |
| `/inventory-management/physical-count/dashboard` | `dashboard/page.tsx` | Count dashboard | Monitoring |
| `/inventory-management/physical-count/active/[id]` | `active/[id]/page.tsx` | Active count execution | In Progress |
| `/inventory-management/physical-count-management` | `physical-count-management/page.tsx` | Count administration | Management |

### Spot Check Operations
| Route | Component | Description | Workflow Stage |
|-------|-----------|-------------|----------------|
| `/inventory-management/spot-check` | `spot-check/page.tsx` | Spot check hub | Overview |
| `/inventory-management/spot-check/dashboard` | `spot-check/dashboard/page.tsx` | Spot check dashboard | Monitoring |
| `/inventory-management/spot-check/new` | `spot-check/new/page.tsx` | Create new spot check | Initiation |
| `/inventory-management/spot-check/active` | `spot-check/active/page.tsx` | Active spot checks | In Progress |
| `/inventory-management/spot-check/active/[id]` | `spot-check/active/[id]/page.tsx` | Specific active check | Execution |
| `/inventory-management/spot-check/completed` | `spot-check/completed/page.tsx` | Completed checks | History |
| `/inventory-management/spot-check/completed/[id]` | `spot-check/completed/[id]/page.tsx` | Completed check details | Review |

### Stock Management
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/inventory-management/stock-overview/inventory-aging` | `inventory-aging/page.tsx` | Aging analysis | Reporting |
| `/inventory-management/stock-overview/inventory-balance` | `inventory-balance/page.tsx` | Balance reports | Reporting |
| `/inventory-management/stock-overview/stock-card` | `stock-card/page.tsx` | Individual stock cards | Details |
| `/inventory-management/stock-overview/stock-cards` | `stock-cards/page.tsx` | Stock card list | Overview |
| `/inventory-management/stock-overview/slow-moving` | `slow-moving/page.tsx` | Slow-moving inventory | Analysis |

### Inventory Adjustments
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/inventory-management/inventory-adjustments` | `inventory-adjustments/page.tsx` | Adjustment hub | Overview |
| `/inventory-management/inventory-adjustments/[id]` | `inventory-adjustments/[id]/page.tsx` | Specific adjustment | Details |

### Advanced Inventory Features
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/inventory-management/fractional-inventory` | `fractional-inventory/page.tsx` | Fractional inventory | Advanced |
| `/inventory-management/stock-in` | `stock-in/page.tsx` | Stock receipt | Operations |
| `/inventory-management/period-end` | `period-end/page.tsx` | Period-end processing | Closing |
| `/inventory-management/period-end/[id]` | `period-end/[id]/page.tsx` | Specific period details | Closing |

## Procurement Module

### Purchase Requests
| Route | Component | Description | Workflow Stage |
|-------|-----------|-------------|----------------|
| `/procurement` | `page.tsx` | Procurement hub | Overview |
| `/procurement/purchase-requests` | `purchase-requests/page.tsx` | PR management | Overview |
| `/procurement/purchase-requests/new-pr` | `purchase-requests/new-pr/page.tsx` | Create new PR | Creation |
| `/procurement/purchase-requests/enhanced-demo` | `purchase-requests/enhanced-demo/page.tsx` | Enhanced PR demo | Demo |
| `/procurement/purchase-requests/[id]` | `purchase-requests/[id]/page.tsx` | PR details | Details |

### Purchase Orders
| Route | Component | Description | Workflow Stage |
|-------|-----------|-------------|----------------|
| `/procurement/purchase-orders` | `purchase-orders/page.tsx` | PO management | Overview |
| `/procurement/purchase-orders/create` | `purchase-orders/create/page.tsx` | Create PO | Creation |
| `/procurement/purchase-orders/create/bulk` | `purchase-orders/create/bulk/page.tsx` | Bulk PO creation | Bulk Creation |
| `/procurement/purchase-orders/create/from-pr` | `purchase-orders/create/from-pr/page.tsx` | PO from PR | Conversion |
| `/procurement/purchase-orders/[id]` | `purchase-orders/[id]/page.tsx` | PO details | Details |
| `/procurement/purchase-orders/[id]/edit` | `purchase-orders/[id]/edit/page.tsx` | Edit PO | Editing |

### Goods Received Notes (GRN)
| Route | Component | Description | Workflow Stage |
|-------|-----------|-------------|----------------|
| `/procurement/goods-received-note` | `goods-received-note/page.tsx` | GRN management | Overview |
| `/procurement/goods-received-note/new` | `goods-received-note/new/page.tsx` | GRN creation hub | Creation |
| `/procurement/goods-received-note/new/po-selection` | `new/po-selection/page.tsx` | Select PO for GRN | Step 1 |
| `/procurement/goods-received-note/new/vendor-selection` | `new/vendor-selection/page.tsx` | Select vendor | Step 2 |
| `/procurement/goods-received-note/new/item-location-selection` | `new/item-location-selection/page.tsx` | Select items/locations | Step 3 |
| `/procurement/goods-received-note/new/manual-entry` | `new/manual-entry/page.tsx` | Manual GRN entry | Alternative |
| `/procurement/goods-received-note/create` | `goods-received-note/create/page.tsx` | GRN creation | Creation |
| `/procurement/goods-received-note/[id]` | `goods-received-note/[id]/page.tsx` | GRN details | Details |
| `/procurement/goods-received-note/[id]/edit` | `goods-received-note/[id]/edit/page.tsx` | Edit GRN | Editing |

### Credit Notes
| Route | Component | Description | Workflow Stage |
|-------|-----------|-------------|----------------|
| `/procurement/credit-note` | `credit-note/page.tsx` | Credit note management | Overview |
| `/procurement/credit-note/new` | `credit-note/new/page.tsx` | Create credit note | Creation |
| `/procurement/credit-note/[id]` | `credit-note/[id]/page.tsx` | Credit note details | Details |

### Procurement Support
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/procurement/my-approvals` | `my-approvals/page.tsx` | Approval queue | Workflow |
| `/procurement/purchase-request-templates` | `purchase-request-templates/page.tsx` | PR templates | Templates |
| `/procurement/purchase-request-templates/[id]` | `purchase-request-templates/[id]/page.tsx` | Template details | Templates |
| `/procurement/vendor-comparison` | `vendor-comparison/page.tsx` | Vendor comparison | Analysis |

## Vendor Management Module

### Vendor Profiles
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/vendor-management` | `page.tsx` | Vendor management hub | Overview |
| `/vendor-management/vendors` | `vendors/page.tsx` | Vendor list | Overview |
| `/vendor-management/vendors/new` | `vendors/new/page.tsx` | Create vendor | Creation |
| `/vendor-management/vendors/[id]` | `vendors/[id]/page.tsx` | Vendor details | Details |
| `/vendor-management/vendors/[id]/edit` | `vendors/[id]/edit/page.tsx` | Edit vendor | Editing |
| `/vendor-management/vendors/[id]/pricelist-settings` | `vendors/[id]/pricelist-settings/page.tsx` | Pricelist configuration | Configuration |

### Enhanced Vendor Management
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/vendor-management/manage-vendors` | `manage-vendors/page.tsx` | Enhanced vendor management | Advanced |
| `/vendor-management/manage-vendors/new` | `manage-vendors/new/page.tsx` | Create vendor (enhanced) | Creation |
| `/vendor-management/manage-vendors/[id]` | `manage-vendors/[id]/page.tsx` | Vendor details (enhanced) | Details |

### Pricelists
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/vendor-management/pricelists` | `pricelists/page.tsx` | Pricelist management | Overview |
| `/vendor-management/pricelists/add` | `pricelists/add/page.tsx` | Add pricelist | Creation |
| `/vendor-management/pricelists/new` | `pricelists/new/page.tsx` | New pricelist | Creation |
| `/vendor-management/pricelists/[id]` | `pricelists/[id]/page.tsx` | Pricelist details | Details |
| `/vendor-management/pricelists/[id]/edit` | `pricelists/[id]/edit/page.tsx` | Edit pricelist | Editing |
| `/vendor-management/pricelists/[id]/edit-new` | `pricelists/[id]/edit-new/page.tsx` | Enhanced pricelist edit | Editing |

### Templates & Campaigns
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/vendor-management/templates` | `templates/page.tsx` | Template management | Templates |
| `/vendor-management/templates/new` | `templates/new/page.tsx` | Create template | Creation |
| `/vendor-management/templates/[id]` | `templates/[id]/page.tsx` | Template details | Details |
| `/vendor-management/templates/[id]/edit` | `templates/[id]/edit/page.tsx` | Edit template | Editing |
| `/vendor-management/campaigns` | `campaigns/page.tsx` | Campaign management | Campaigns |
| `/vendor-management/campaigns/new` | `campaigns/new/page.tsx` | Create campaign | Creation |
| `/vendor-management/campaigns/[id]` | `campaigns/[id]/page.tsx` | Campaign details | Details |

### Vendor Portal
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/vendor-management/vendor-portal` | `vendor-portal/page.tsx` | Vendor portal hub | Portal |
| `/vendor-management/vendor-portal/sample` | `vendor-portal/sample/page.tsx` | Sample portal | Demo |

## Product Management Module

### Product Catalog
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/product-management` | `page.tsx` | Product management hub | Overview |
| `/product-management/products` | `products/page.tsx` | Product catalog | Catalog |
| `/product-management/products/[id]` | `products/[id]/page.tsx` | Product details | Details |

### Product Support
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/product-management/categories` | `categories/page.tsx` | Category management | Categories |
| `/product-management/units` | `units/page.tsx` | Unit management | Units |

## Operational Planning Module

### Recipe Management
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/operational-planning` | `page.tsx` | Operational planning hub | Overview |
| `/operational-planning/recipe-management` | `recipe-management/page.tsx` | Recipe management hub | Recipes |
| `/operational-planning/recipe-management/recipes` | `recipes/page.tsx` | Recipe catalog | Catalog |
| `/operational-planning/recipe-management/recipes/new` | `recipes/new/page.tsx` | Create recipe | Creation |
| `/operational-planning/recipe-management/recipes/create` | `recipes/create/page.tsx` | Recipe creation | Creation |
| `/operational-planning/recipe-management/recipes/[id]` | `recipes/[id]/page.tsx` | Recipe details | Details |
| `/operational-planning/recipe-management/recipes/[id]/edit` | `recipes/[id]/edit/page.tsx` | Edit recipe | Editing |

### Recipe Support
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/operational-planning/recipe-management/categories` | `categories/page.tsx` | Recipe categories | Categories |
| `/operational-planning/recipe-management/cuisine-types` | `cuisine-types/page.tsx` | Cuisine types | Types |

## Store Operations Module

### Store Requisitions
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/store-operations` | `page.tsx` | Store operations hub | Overview |
| `/store-operations/store-requisitions` | `store-requisitions/page.tsx` | Store requisitions | Requisitions |
| `/store-operations/store-requisitions/[id]` | `store-requisitions/[id]/page.tsx` | Requisition details | Details |

### Operations Management
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/store-operations/wastage-reporting` | `wastage-reporting/page.tsx` | Wastage reports | Reporting |
| `/store-operations/stock-replenishment` | `stock-replenishment/page.tsx` | Stock replenishment | Replenishment |

## System Administration Module

### User Management
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/system-administration` | `page.tsx` | System admin hub | Overview |
| `/system-administration/user-management` | `user-management/page.tsx` | User management | Users |
| `/system-administration/user-management/[id]` | `user-management/[id]/page.tsx` | User details | Details |
| `/system-administration/user-dashboard` | `user-dashboard/page.tsx` | User dashboard | Dashboard |

### Location Management
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/system-administration/location-management` | `location-management/page.tsx` | Location management | Locations |
| `/system-administration/location-management/new` | `location-management/new/page.tsx` | Create location | Creation |
| `/system-administration/location-management/[id]` | `location-management/[id]/page.tsx` | Location details | Details |
| `/system-administration/location-management/[id]/edit` | `location-management/[id]/edit/page.tsx` | Edit location | Editing |
| `/system-administration/location-management/[id]/view` | `location-management/[id]/view/page.tsx` | View location | Viewing |

### Workflow Management
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/system-administration/workflow` | `workflow/page.tsx` | Workflow hub | Workflows |
| `/system-administration/workflow/workflow-configuration` | `workflow-configuration/page.tsx` | Workflow config | Configuration |
| `/system-administration/workflow/workflow-configuration/[id]` | `workflow-configuration/[id]/page.tsx` | Workflow details | Details |
| `/system-administration/workflow/role-assignment` | `role-assignment/page.tsx` | Role assignments | Roles |

### Business Rules
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/system-administration/business-rules` | `business-rules/page.tsx` | Business rules | Rules |
| `/system-administration/business-rules/compliance-monitoring` | `compliance-monitoring/page.tsx` | Compliance monitoring | Compliance |

### System Integrations
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/system-administration/system-integrations` | `system-integrations/page.tsx` | Integration hub | Integrations |
| `/system-administration/system-integrations/pos` | `pos/page.tsx` | POS integration | POS |

#### POS Integration Detailed Routes
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/system-administration/system-integrations/pos/mapping` | `pos/mapping/page.tsx` | POS mapping hub | Mapping |
| `/system-administration/system-integrations/pos/mapping/units` | `pos/mapping/units/page.tsx` | Unit mapping | Units |
| `/system-administration/system-integrations/pos/mapping/recipes` | `pos/mapping/recipes/page.tsx` | Recipe mapping | Recipes |
| `/system-administration/system-integrations/pos/mapping/recipes/fractional-variants` | `pos/mapping/recipes/fractional-variants/page.tsx` | Fractional variants | Variants |
| `/system-administration/system-integrations/pos/mapping/locations` | `pos/mapping/locations/page.tsx` | Location mapping | Locations |

#### POS Settings
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/system-administration/system-integrations/pos/settings` | `pos/settings/page.tsx` | POS settings hub | Settings |
| `/system-administration/system-integrations/pos/settings/config` | `pos/settings/config/page.tsx` | POS configuration | Config |
| `/system-administration/system-integrations/pos/settings/system` | `pos/settings/system/page.tsx` | System settings | System |

#### POS Operations
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/system-administration/system-integrations/pos/transactions` | `pos/transactions/page.tsx` | POS transactions | Transactions |
| `/system-administration/system-integrations/pos/reports` | `pos/reports/page.tsx` | POS reports hub | Reports |
| `/system-administration/system-integrations/pos/reports/gross-profit` | `pos/reports/gross-profit/page.tsx` | Gross profit reports | Profit |
| `/system-administration/system-integrations/pos/reports/consumption` | `pos/reports/consumption/page.tsx` | Consumption reports | Consumption |

### Additional System Admin
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/system-administration/account-code-mapping` | `account-code-mapping/page.tsx` | Account mapping | Accounting |
| `/system-administration/system-integration` | `system-integration/page.tsx` | Legacy integrations | Legacy |
| `/system-administration/system-integration/pos` | `system-integration/pos/page.tsx` | Legacy POS | Legacy |

## Finance Module

### Financial Management
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/finance` | `page.tsx` | Finance hub | Overview |
| `/finance/account-code-mapping` | `account-code-mapping/page.tsx` | Account mapping | Accounting |
| `/finance/department-list` | `department-list/page.tsx` | Department management | Departments |
| `/finance/currency-management` | `currency-management/page.tsx` | Currency management | Currency |
| `/finance/exchange-rates` | `exchange-rates/page.tsx` | Exchange rates | Rates |

## Reporting & Analytics Module

### Analytics Dashboard
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/reporting-analytics` | `page.tsx` | Analytics hub | Overview |
| `/reporting-analytics/consumption-analytics` | `consumption-analytics/page.tsx` | Consumption analytics | Analytics |

## Production Module

### Production Management
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/production` | `page.tsx` | Production hub | Overview |

## Help & Support Module

### Support Resources
| Route | Component | Description | Function |
|-------|-----------|-------------|----------|
| `/help-support` | `page.tsx` | Help hub | Support |

## Legacy/Compatibility Routes

### Backward Compatibility
| Route | Component | Description | Status |
|-------|-----------|-------------|---------|
| `/inventory` | `app/inventory/layout.tsx` | Legacy inventory | Legacy |
| `/inventory/overview` | `app/inventory/overview/page.tsx` | Legacy overview | Legacy |
| `/inventory/stock-overview` | Legacy stock overview | Legacy overview | Legacy |
| `/inventory/stock-overview/stock-card` | Legacy stock card | Legacy card | Legacy |
| `/receiving` | `app/receiving/page.tsx` | Legacy receiving | Legacy |
| `/receiving/[id]` | `app/receiving/[id]/page.tsx` | Legacy receiving details | Legacy |
| `/receiving/[id]/confirm` | `app/receiving/[id]/confirm/page.tsx` | Legacy confirmation | Legacy |
| `/receiving/[id]/receive` | `app/receiving/[id]/receive/page.tsx` | Legacy receive | Legacy |
| `/stock-take` | `app/stock-take/page.tsx` | Legacy stock take | Legacy |
| `/stock-take/[id]` | `app/stock-take/[id]/page.tsx` | Legacy stock take details | Legacy |
| `/stock-take/[id]/confirm` | `app/stock-take/[id]/confirm/page.tsx` | Legacy confirmation | Legacy |
| `/spot-check` | `app/spot-check/page.tsx` | Legacy spot check | Legacy |
| `/pr-approval` | `app/pr-approval/page.tsx` | Legacy PR approval | Legacy |
| `/pr-approval/[id]` | `app/pr-approval/[id]/page.tsx` | Legacy approval details | Legacy |
| `/pr-approval/[id]/confirm` | `app/pr-approval/[id]/confirm/page.tsx` | Legacy confirmation | Legacy |
| `/transactions` | `app/transactions/page.tsx` | Legacy transactions | Legacy |
| `/testui` | `app/testui/page.tsx` | Test UI page | Development |

## API Routes

### Price Management API
| Route | Method | Description | Function |
|-------|--------|-------------|----------|
| `/api/price-management` | GET/POST | Price management hub | Core API |
| `/api/price-management/vendors` | GET/POST | Vendor management | Vendors |
| `/api/price-management/vendors/[id]` | GET/PUT/DELETE | Specific vendor | Vendor CRUD |
| `/api/price-management/vendors/[id]/pricelist-settings` | GET/PUT | Vendor pricelist settings | Settings |
| `/api/price-management/assignments` | GET/POST | Price assignments | Assignments |
| `/api/price-management/assignments/overrides` | GET/POST | Assignment overrides | Overrides |
| `/api/price-management/assignments/[itemId]` | GET/PUT | Item assignments | Item CRUD |
| `/api/price-management/assignments/[itemId]/retry` | POST | Retry assignment | Retry |
| `/api/price-management/assignments/bulk` | POST | Bulk assignments | Bulk |
| `/api/price-management/assignments/queues` | GET | Assignment queues | Queues |
| `/api/price-management/assignments/performance` | GET | Performance metrics | Metrics |
| `/api/price-management/assignments/approvals` | GET/POST | Assignment approvals | Approvals |

### Business Rules API
| Route | Method | Description | Function |
|-------|--------|-------------|----------|
| `/api/price-management/business-rules` | GET/POST | Business rules | Rules |
| `/api/price-management/business-rules/test-scenarios` | GET/POST | Test scenarios | Testing |
| `/api/price-management/business-rules/test` | POST | Run tests | Testing |
| `/api/price-management/business-rules/test-datasets` | GET/POST | Test datasets | Data |
| `/api/price-management/business-rules/test-datasets/[id]` | GET/PUT/DELETE | Specific dataset | Dataset CRUD |
| `/api/price-management/business-rules/test-datasets/[id]/run` | POST | Run dataset | Execution |
| `/api/price-management/business-rules/versions` | GET/POST | Rule versions | Versioning |
| `/api/price-management/business-rules/audit` | GET | Rule audit trail | Auditing |
| `/api/price-management/business-rules/compliance-report` | GET | Compliance reports | Compliance |
| `/api/price-management/business-rules/templates` | GET/POST | Rule templates | Templates |
| `/api/price-management/business-rules/rollback` | POST | Rule rollback | Rollback |
| `/api/price-management/business-rules/performance` | GET | Rule performance | Performance |
| `/api/price-management/business-rules/approvals` | GET/POST | Rule approvals | Approvals |
| `/api/price-management/business-rules/[id]` | GET/PUT/DELETE | Specific rule | Rule CRUD |
| `/api/price-management/business-rules/emergency-deactivate` | POST | Emergency deactivate | Emergency |
| `/api/price-management/business-rules/analytics` | GET | Rule analytics | Analytics |

### Additional Price Management APIs
| Route | Method | Description | Function |
|-------|--------|-------------|----------|
| `/api/price-management/products` | GET/POST | Product management | Products |
| `/api/price-management/price-lists` | GET/POST | Price list management | Pricelists |
| `/api/price-management/price-assignment` | GET/POST | Price assignments | Assignments |
| `/api/price-management/pricing-trends` | GET | Pricing trend analysis | Trends |
| `/api/price-management/price-validity` | GET/POST | Price validity checks | Validation |
| `/api/price-management/bulk-operations` | GET/POST | Bulk operations | Bulk |
| `/api/price-management/bulk-operations/[id]` | GET/PUT/DELETE | Specific bulk operation | Operation CRUD |
| `/api/price-management/bulk-operations/[id]/control` | POST | Control bulk operation | Control |
| `/api/price-management/multi-currency` | GET/POST | Multi-currency support | Currency |
| `/api/price-management/portal-sessions` | GET/POST | Portal session management | Sessions |
| `/api/price-management/dashboards` | GET/POST | Dashboard management | Dashboards |
| `/api/price-management/dashboards/templates` | GET/POST | Dashboard templates | Templates |
| `/api/price-management/templates` | GET/POST | General templates | Templates |
| `/api/price-management/templates/download/[templateId]` | GET | Download template | Download |
| `/api/price-management/email-processing` | GET/POST | Email processing | Email |

### Campaign Management API
| Route | Method | Description | Function |
|-------|--------|-------------|----------|
| `/api/price-management/campaigns` | GET/POST | Campaign management | Campaigns |
| `/api/price-management/campaigns/validate` | POST | Campaign validation | Validation |
| `/api/price-management/campaigns/duplicate` | POST | Duplicate campaign | Duplication |
| `/api/price-management/campaigns/templates` | GET/POST | Campaign templates | Templates |
| `/api/price-management/campaigns/[id]` | GET/PUT/DELETE | Specific campaign | Campaign CRUD |
| `/api/price-management/campaigns/[id]/vendors` | GET/POST | Campaign vendors | Vendors |
| `/api/price-management/campaigns/[id]/actions` | POST | Campaign actions | Actions |
| `/api/price-management/campaigns/[id]/analytics` | GET | Campaign analytics | Analytics |

### Validation & Analytics API
| Route | Method | Description | Function |
|-------|--------|-------------|----------|
| `/api/price-management/bulk-assignments` | GET/POST | Bulk assignments | Bulk |
| `/api/price-management/validation` | GET/POST | Validation services | Validation |
| `/api/price-management/validation/flags` | GET/POST | Validation flags | Flags |
| `/api/price-management/validation/workflows` | GET/POST | Validation workflows | Workflows |
| `/api/price-management/analytics` | GET | Analytics services | Analytics |

### Reporting API
| Route | Method | Description | Function |
|-------|--------|-------------|----------|
| `/api/price-management/reports` | GET/POST | Report management | Reports |
| `/api/price-management/reports/cost-savings` | GET | Cost savings reports | Savings |
| `/api/price-management/reports/comparative-analysis` | GET | Comparative analysis | Analysis |
| `/api/price-management/reports/download/[reportId]` | GET | Download report | Download |
| `/api/price-management/reports/export` | POST | Export reports | Export |
| `/api/price-management/reports/scheduled` | GET/POST | Scheduled reports | Scheduling |
| `/api/price-management/reports/scheduled/[id]` | GET/PUT/DELETE | Specific scheduled report | Schedule CRUD |
| `/api/price-management/reports/scheduled/[id]/execute` | POST | Execute scheduled report | Execution |

### Purchase Request API
| Route | Method | Description | Function |
|-------|--------|-------------|----------|
| `/api/purchase-requests/items/[itemId]` | GET/PUT | PR item management | Items |
| `/api/purchase-requests/items/[itemId]/price-alerts` | GET/POST | Price alerts | Alerts |
| `/api/purchase-requests/items/[itemId]/vendor-comparison` | GET | Vendor comparison | Comparison |
| `/api/purchase-requests/items/[itemId]/price-assignment` | GET/POST | Price assignment | Assignment |
| `/api/purchase-requests/items/[itemId]/price-history` | GET | Price history | History |
| `/api/purchase-requests/[id]/price-assignment` | GET/POST | PR price assignment | Assignment |

### PR Workflow API
| Route | Method | Description | Function |
|-------|--------|-------------|----------|
| `/api/pr/[prId]/items` | GET/POST | PR items | Items |
| `/api/pr/[prId]/items/[itemId]` | GET/PUT/DELETE | Specific PR item | Item CRUD |
| `/api/pr/[prId]/items/[itemId]/transition` | POST | Item state transition | Workflow |

## Route Access Control

### Permission Levels
| Level | Description | Routes |
|-------|-------------|---------|
| **Public** | No authentication required | `/login`, `/signup`, `/signin` |
| **Protected** | Authentication required | All `/dashboard` and module routes |
| **Role-Based** | Specific role permissions | Admin routes, approval workflows |
| **Department-Based** | Department-specific access | Module-specific functions |

### Role-Based Access Examples
```typescript
// User roles and their typical route access
const roleAccess = {
  'staff': ['read-only routes', 'basic operations'],
  'department-manager': ['department routes', 'approval workflows'],
  'financial-manager': ['finance routes', 'cost analytics'],
  'purchasing-staff': ['procurement routes', 'vendor management'],
  'counter': ['inventory operations', 'receiving'],
  'chef': ['recipe management', 'consumption tracking']
};
```

## Navigation Hierarchy

### Main Navigation Structure
```
Dashboard
├── Inventory Management
│   ├── Stock Overview
│   ├── Physical Count
│   ├── Spot Check
│   ├── Adjustments
│   └── Fractional Inventory
├── Procurement
│   ├── Purchase Requests
│   ├── Purchase Orders
│   ├── Goods Received Notes
│   ├── Credit Notes
│   └── My Approvals
├── Vendor Management
│   ├── Vendors
│   ├── Pricelists
│   ├── Templates
│   ├── Campaigns
│   └── Portal
├── Product Management
│   ├── Products
│   ├── Categories
│   └── Units
├── Operational Planning
│   └── Recipe Management
├── Store Operations
│   ├── Store Requisitions
│   ├── Wastage Reporting
│   └── Stock Replenishment
├── System Administration
│   ├── User Management
│   ├── Location Management
│   ├── Workflow
│   ├── Business Rules
│   └── System Integrations
├── Finance
│   ├── Account Mapping
│   ├── Currency Management
│   └── Exchange Rates
├── Reporting & Analytics
│   └── Consumption Analytics
├── Production
└── Help & Support
```

## Route Patterns & Conventions

### URL Structure Patterns
```
/module-name                    # Module overview
/module-name/feature            # Feature listing
/module-name/feature/new        # Create new item
/module-name/feature/[id]       # Item details
/module-name/feature/[id]/edit  # Edit item
/module-name/feature/[id]/view  # View-only item details
```

### Dynamic Route Parameters
| Parameter | Description | Example Values |
|-----------|-------------|----------------|
| `[id]` | Entity identifier | `PR-2401-0001`, `vendor-001`, `user-123` |
| `[subItem]` | Sub-module routes | Module-specific navigation |
| `[prId]` | Purchase request ID | `PR-2401-0001` |
| `[itemId]` | Item identifier | `item-001`, `product-123` |
| `[templateId]` | Template identifier | `template-001` |
| `[reportId]` | Report identifier | `report-001` |

### File Naming Conventions
```
page.tsx          # Route page component
layout.tsx        # Route layout wrapper
loading.tsx       # Loading state component
error.tsx         # Error boundary component
not-found.tsx     # 404 page component
route.ts          # API route handler
```

## Development Notes

### Route Development Guidelines
1. **Consistent Naming**: Use kebab-case for URLs and directories
2. **Descriptive Paths**: Routes should clearly indicate functionality
3. **Logical Grouping**: Related features under common parent routes
4. **SEO Friendly**: Human-readable URLs with meaningful segments
5. **Backward Compatibility**: Maintain legacy routes during transitions

### Testing Considerations
- All routes included in accessibility test suite
- Authentication flows tested for protected routes
- Dynamic routes tested with sample data
- API routes tested with proper HTTP methods
- Error handling tested for invalid routes

This comprehensive route map serves as the definitive guide to navigation and URL structure within the Carmen ERP system, supporting both development and user experience optimization.