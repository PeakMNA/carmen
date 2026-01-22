# Vendor Directory

## Module Information
- **Module**: Vendor Management
- **Sub-Module**: Vendor Directory
- **Route**: `/vendor-management/vendors`, `/vendor-management/manage-vendors`
- **Status**: Active

---

## Overview

The Vendor Directory module serves as the central repository for managing all vendor relationships in the hotel procurement system. It provides comprehensive vendor lifecycle management including company profiles, contacts, addresses, business classifications, certifications, documents, and performance ratings.

The module supports two primary views:
1. **Vendors List**: Basic vendor listing with quick access to profiles (`/vendor-management/vendors`)
2. **Manage Vendors**: Extended management with certifications, documents, and detailed configuration (`/vendor-management/manage-vendors`)

---

## Documentation Index

### Core Documentation

| Document | Description |
|----------|-------------|
| [Business Requirements (BR)](./br-vendor-directory) | Business objectives, functional requirements, vendor profile specifications |
| [Data Definition (DD)](./dd-vendor-directory) | Data models, entity relationships, JSON structures, field specifications |
| [Flow Diagrams (FD)](./fd-vendor-directory) | Process flows, state diagrams, workflow visualizations |
| [Technical Specification (TS)](./ts-vendor-directory) | Implementation details, component architecture, sitemap |
| [Use Cases (UC)](./uc-vendor-directory) | Detailed use case scenarios, user stories, interaction flows |
| [Validation Rules (VAL)](./val-vendor-directory) | Business rules, validation logic, constraints |

---

## Key Features

- **Vendor Profile Management**: Create, edit, and manage vendor company information
- **Multi-Address Support**: Multiple addresses with primary designation and Asian international format
- **Multi-Contact Management**: Multiple contacts with roles, communication preferences, and primary designation
- **Certification Tracking**: 16 certification types with auto-calculated status (active, expired, expiring soon)
- **Business Type Classification**: Categorize vendors by business type
- **Status Management**: Active, Inactive, and Suspended status workflow
- **Payment Terms Configuration**: Net terms, credit limits, currency settings
- **Performance Metrics**: Quality scores and vendor ratings
- **Tax Configuration**: Tax ID, Tax Profile, and Tax Rate management

---

## Certification Types (16)

| Category | Types |
|----------|-------|
| Quality Management | ISO 9001, ISO 14001, ISO 22000, ISO 45001 |
| Food Safety | HACCP, GMP, Halal, Kosher |
| Sustainability | Organic, Fair Trade |
| Regulatory | FDA Approval, CE Marking |
| Business Licenses | Business License, Trade License, Import/Export License |
| Other | Custom certifications |

---

## Address Format (Asian International)

The module supports 15 countries with region-specific address fields:

| Field | Description |
|-------|-------------|
| Address Line 1 | Street address (required) |
| Address Line 2 | Additional address info |
| Sub-District | Tambon/Kelurahan/Phuong/Barangay |
| District | Amphoe/Kecamatan/Quan |
| City | City name (required) |
| Province | Province/State |
| Postal Code | Country-specific format |
| Country | 15 supported countries |

**Supported Countries**: Thailand, Singapore, Malaysia, Indonesia, Vietnam, Philippines, Myanmar, Cambodia, Laos, Brunei, China, Japan, South Korea, India, United States

---

## Related Modules

| Module | Relationship |
|--------|--------------|
| [Price Lists](../price-lists) | Vendor pricing and product catalogs |
| [Pricelist Templates](../pricelist-templates) | Templates for price list structure |
| [Requests for Pricing](../requests-for-pricing) | RFQ campaigns to vendors |
| [Vendor Portal](../vendor-portal) | External vendor self-service portal |
| [Purchase Orders](../../procurement/purchase-orders) | Orders placed with vendors |
| [Goods Received Notes](../../procurement/goods-received-notes) | Receipts from vendors |

---

## Quick Links

- **Vendor List**: `/vendor-management/vendors`
- **Create Vendor**: `/vendor-management/vendors/new`
- **Manage Vendors**: `/vendor-management/manage-vendors`
- **Vendor Detail**: `/vendor-management/vendors/[id]`
- **Pricelist Settings**: `/vendor-management/vendors/[id]/pricelist-settings`

---

## Status Workflow

```
ACTIVE <--> INACTIVE
   |           |
   v           v
SUSPENDED <----+
```

| Status | Description |
|--------|-------------|
| **Active** | Vendor available for procurement transactions |
| **Inactive** | Vendor temporarily unavailable, can be reactivated |
| **Suspended** | Vendor blocked due to compliance or performance issues |

---

## Certification Status Auto-Calculation

| Status | Condition | Visual |
|--------|-----------|--------|
| **Active** | Expiry > today + 30 days | Green badge |
| **Expiring Soon** | Today < Expiry <= today + 30 days | Yellow badge |
| **Expired** | Expiry < today | Red badge |
| **Pending** | No expiry date set | Gray badge |
