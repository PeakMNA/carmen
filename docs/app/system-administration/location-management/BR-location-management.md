# Business Requirements: Location Management

## Document Information
- **Module**: System Administration / Location Management
- **Version**: 1.3
- **Last Updated**: 2025-12-15
- **Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
| 1.1.0 | 2025-11-26 | Documentation Team | Code compliance review - removed fictional features, added missing features |
| 1.2.0 | 2025-11-28 | Documentation Team | Delivery Points moved to separate maintenance page, Users Tab updated with checkboxes |
| 1.3.0 | 2025-12-15 | Documentation Team | Simplified data model - removed department, cost center, and address fields |

## Overview

Location Management enables operations managers to define and manage physical and logical locations for inventory management, store operations, and delivery points across the hospitality organization.

## Business Goals

1. **Centralized Location Control**: Single source of truth for all operational locations
2. **Inventory Segregation**: Enable separate inventory tracking per location
3. **Access Control**: Assign users to specific locations with role-based permissions
4. **Delivery Management**: Configure delivery points per location for procurement
5. **Stock Management**: Configure physical count and inventory parameters per location

---

## Functional Requirements

### FR-LOC-001: Location Creation
**Priority**: High
**User Story**: As an Operations Manager, I want to create new locations so that I can track inventory and operations at different sites.

**Requirements**:
- Create location with required fields: code (max 10 chars, uppercase alphanumeric with hyphens), name (max 100 chars)
- Set location type: Inventory, Direct, or Consignment
- Configure physical count enabled (yes/no)
- Set status: active, inactive, closed, or pending_setup
- Optional: description
- For consignment locations: assign consignment vendor

**Acceptance Criteria**:
- Location code must match regex pattern `^[A-Z0-9-]+$`
- Location code max 10 characters
- Type must be one of: inventory, direct, consignment
- Status must be one of: active, inactive, closed, pending_setup
- Form validates required fields before submission

---

### FR-LOC-002: Location Types
**Priority**: High
**User Story**: As a Store Manager, I want different location types so that inventory behaves correctly based on location purpose.

**Location Types**:
- **Inventory**: Standard warehouse/storage with full inventory tracking
- **Direct**: Production areas with immediate expense on receipt
- **Consignment**: Vendor-owned inventory until consumed (requires vendor assignment)

**Acceptance Criteria**:
- Type selection shows label and description for each option
- Consignment type displays additional vendor selection field
- Type displayed with color-coded badge in list view

---

### FR-LOC-003: Physical Count Configuration
**Priority**: Medium
**User Story**: As an Inventory Manager, I want to specify which locations require physical counts so that I can plan count schedules.

**Requirements**:
- Set physicalCountEnabled (true/false) per location
- Filter locations by physical count status in list view
- Display physical count status with check/x icon in location list

**Acceptance Criteria**:
- Physical count toggle available in location form
- Filter dropdown with options: All, Count Enabled, Count Disabled
- Visual indicator (CheckCircle/XCircle icon) in list view

---

### FR-LOC-004: Delivery Point Reference
**Priority**: Medium
**User Story**: As a Purchasing Manager, I want to assign a delivery point to a location so that vendors know where to deliver goods.

**Requirements**:
- Select delivery point from centralized Delivery Points list (see FR-DP-001 in Delivery Points BR)
- Display assigned delivery point name in view mode
- Dropdown selector showing active delivery points in edit mode

**Acceptance Criteria**:
- Delivery Point dropdown field in General tab under Organization section
- Shows delivery point name and code with city in dropdown options
- Display "Not assigned" when no delivery point selected
- Only active delivery points shown in dropdown

**Note**: Delivery Points are now managed in a separate Delivery Points maintenance page under System Administration. See `/docs/app/system-administration/delivery-points/BR-delivery-points.md` for full requirements.

---

### FR-LOC-005: User Assignment
**Priority**: High
**User Story**: As a System Administrator, I want to assign users to locations so that they can perform authorized operations.

**Requirements**:
- Dual-panel transfer list interface for user assignment
- Left panel: Available users (not assigned to location)
- Right panel: Assigned users (currently assigned to location)
- Checkbox selection for individual users
- Bulk selection with "Select All" checkbox (includes indeterminate state)
- Transfer buttons to move users between panels
- Search users by name, email, or department

**Acceptance Criteria**:
- Checkbox next to each user for selection
- "Select All" checkbox in each panel header with indeterminate state when partially selected
- Transfer buttons (chevron right/left) between panels
- Buttons disabled when no users selected or not in edit mode
- Selection summary showing count of users selected to assign/remove
- Search filters both panels simultaneously
- User display shows email (primary) and name with department (secondary)

---

### FR-LOC-006: Product Assignment
**Priority**: Medium
**User Story**: As a Store Manager, I want to assign products to locations with inventory parameters so that stock levels are properly managed.

**Requirements**:
- Search and select products from centralized product catalog
- Set inventory parameters: min quantity, max quantity, reorder point, PAR level
- Assign default shelf for product storage
- Create new shelves inline during product assignment
- View current stock quantity and low stock alerts

**Acceptance Criteria**:
- Product search by name, code, or category
- Only unassigned products shown in selection
- Shelf selector with "Add New Shelf" option
- Low stock indicator when current quantity <= reorder point
- Edit parameters and remove product assignment

---

### FR-LOC-007: Shelf Management
**Priority**: Medium
**User Story**: As a Warehouse Manager, I want to define storage shelves within a location so that products can be organized and located efficiently.

**Requirements**:
- Create shelves with code (max 20 chars) and name
- Set active/inactive status per shelf
- Edit and delete shelves
- View shelves in table format

**Acceptance Criteria**:
- Add Shelf button opens dialog with code and name fields
- Shelf code displays in monospace font
- Active/Inactive badge per shelf
- Edit/Delete actions in dropdown menu
- Empty state with "Add First Shelf" prompt

---

### FR-LOC-008: Location Search & Filter
**Priority**: Medium
**User Story**: As an Operations Manager, I want to search and filter locations so that I can quickly find specific sites.

**Requirements**:
- Search by name, code, description
- Filter by type: All, Inventory, Direct, Consignment
- Filter by status: All, Active, Inactive, Closed, Pending Setup
- Filter by physical count: All, Count Enabled, Count Disabled
- Sort by: code, name, type, status, shelves count, products count, users count

**Acceptance Criteria**:
- Real-time search as user types
- Multiple filters combine with AND logic
- Results count displays "Showing X of Y locations"
- Sortable column headers with up/down arrow indicator

---

### FR-LOC-009: Location Activation/Deactivation
**Priority**: High
**User Story**: As a System Administrator, I want to change location status so that I can control operational availability.

**Requirements**:
- Set status to: active, inactive, closed, pending_setup
- Bulk activate/deactivate multiple selected locations
- Cannot delete location with assigned products

**Acceptance Criteria**:
- Status dropdown in edit mode
- Bulk action buttons appear when locations selected
- Delete blocked with alert if assignedProductsCount > 0
- Status displayed with color-coded badge

---

### FR-LOC-010: Location List & Bulk Actions
**Priority**: Medium
**User Story**: As an Operations Manager, I want to manage multiple locations at once so that I can efficiently handle bulk operations.

**Requirements**:
- Select individual or all locations via checkboxes
- Bulk activate selected locations
- Bulk deactivate selected locations
- Bulk delete selected locations (with validation)
- Export locations to CSV
- Print location list

**Acceptance Criteria**:
- Checkbox column for selection
- "X location(s) selected" indicator
- Bulk action buttons: Activate, Deactivate, Delete, Clear Selection
- Export generates CSV with all location fields
- Print opens browser print dialog

---

## Business Rules

### BR-001: Location Code Format
Location code must be uppercase alphanumeric with hyphens only, maximum 10 characters.

### BR-002: Cannot Delete Location with Products
Locations with assigned products (assignedProductsCount > 0) cannot be deleted. User must remove product assignments first.

### BR-003: Consignment Vendor Required
Consignment type locations should have a vendor assigned for proper ownership tracking.

### BR-004: Shelf Code Uniqueness
Shelf codes should be unique within a location.

### BR-005: Delivery Point Reference
Delivery points are managed centrally and referenced by locations. A location can have one assigned delivery point.

### BR-006: User Assignment via Transfer List
Users are assigned to locations using a dual-panel transfer list with checkbox selection and bulk operations.

---

## Dependencies

- **Product Management**: Provides product catalog for product assignments
- **User Management**: Provides user list for user assignments
- **Vendor Management**: Provides vendor list for consignment locations
- **Delivery Points**: Provides delivery point list for location assignment (see Delivery Points module)

---

## Success Metrics

1. **Location Setup Time**: < 2 minutes per location
2. **Search Performance**: < 300ms for location searches
3. **Form Validation**: All required fields validated before submission
4. **User Experience**: Intuitive tabbed interface for managing related data

---

## Appendix: Data Model Summary

### InventoryLocation
- id, code, name, description
- type (inventory | direct | consignment)
- status (active | inactive | closed | pending_setup)
- physicalCountEnabled
- consignmentVendorId, consignmentVendorName
- deliveryPointId, deliveryPointName
- shelvesCount, assignedUsersCount, assignedProductsCount
- createdAt, createdBy, updatedAt, updatedBy

### Shelf
- id, locationId, code, name
- zoneType, isActive
- createdAt, createdBy

### UserLocationAssignment
- id, userId, userName, userEmail, locationId
- roleAtLocation, permissions[]
- isPrimary, isActive
- assignedAt, assignedBy

### ProductLocationAssignment
- id, productId, productCode, productName, categoryName, baseUnit, locationId
- shelfId, shelfName
- minQuantity, maxQuantity, reorderPoint, parLevel
- currentQuantity, isActive, isStocked
- assignedAt, assignedBy

### DeliveryPoint (Reference Only - See Delivery Points Module)
- id, name, isActive
- createdAt, createdBy, updatedAt, updatedBy

**Note**: DeliveryPoint entity is now managed in the standalone Delivery Points maintenance page. Locations reference delivery points via deliveryPointId field. See `/docs/app/system-administration/delivery-points/BR-delivery-points.md` for full requirements.
