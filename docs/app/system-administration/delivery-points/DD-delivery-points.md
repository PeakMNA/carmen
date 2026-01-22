# Data Dictionary: Delivery Points

## Module Information
- **Module**: System Administration
- **Sub-Module**: Delivery Points
- **Route**: `/system-administration/delivery-points`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-17

---

## Data Structures

### DeliveryPoint

**Source**: `lib/types/location-management.ts`

```typescript
interface DeliveryPoint {
  id: string
  name: string
  isActive: boolean
  createdAt: Date
  createdBy: string
  updatedAt?: Date
  updatedBy?: string
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | Yes | Unique identifier (UUID) |
| name | string | Yes | Display name for delivery point |
| isActive | boolean | Yes | Active status (BR-003) |
| createdAt | Date | Yes | Record creation timestamp |
| createdBy | string | Yes | User who created the record |
| updatedAt | Date | No | Last update timestamp |
| updatedBy | string | No | User who last updated |

---

### DeliveryPointFormData

**Source**: `lib/types/location-management.ts`

```typescript
interface DeliveryPointFormData {
  name: string
  isActive: boolean
}
```

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| name | string | Yes | - | Display name |
| isActive | boolean | Yes | true | Active status |

---

## Component State

| State Variable | Type | Initial | Description |
|----------------|------|---------|-------------|
| searchQuery | string | '' | Search filter text |
| statusFilter | 'all' \| 'active' \| 'inactive' | 'all' | Status filter |
| sortField | 'name' \| 'isActive' | 'name' | Sort column |
| sortDirection | 'asc' \| 'desc' | 'asc' | Sort direction |
| showAddDialog | boolean | false | Add dialog visibility |
| editingPoint | DeliveryPoint \| null | null | Point being edited |
| deletingPoint | DeliveryPoint \| null | null | Point being deleted |
| formName | string | '' | Form name input |
| formIsActive | boolean | true | Form active toggle |

---

## Data Source

**Mock Data**: `lib/mock-data/inventory-locations.ts`
- Function: `getAllDeliveryPoints()`
- Returns: `DeliveryPoint[]`

---

## Status Values

| Value | Badge Color | Description |
|-------|-------------|-------------|
| true (Active) | Green (bg-green-600) | Point available for use |
| false (Inactive) | Gray (secondary) | Point excluded from lookups |

---

**Document End**
