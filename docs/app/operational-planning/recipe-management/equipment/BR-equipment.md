# Recipe Equipment - Business Rules (BR)

## Document Information
- **Document Type**: Business Rules Document
- **Module**: Operational Planning > Recipe Management > Equipment
- **Version**: 1.0.0
- **Last Updated**: 2025-01-16

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-16 | Development Team | Initial documentation based on actual implementation |

---

## 1. Overview

The Equipment Management submodule enables organizations to catalog and manage kitchen equipment used in recipe preparation. This includes tracking equipment status, maintenance schedules, availability, and assignment to kitchen stations.

### 1.1 Business Objectives

| Objective | Description |
|-----------|-------------|
| Equipment Tracking | Maintain comprehensive inventory of kitchen equipment with specifications |
| Availability Management | Track available vs total quantity for resource planning |
| Maintenance Scheduling | Support preventive maintenance with scheduling and tracking |
| Station Assignment | Organize equipment by kitchen stations for workflow optimization |
| Recipe Integration | Enable recipes to specify required equipment for preparation |

---

## 2. Core Business Rules

### 2.1 Equipment Identification Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-EQ-001 | Each equipment must have a unique code | Database constraint |
| BR-EQ-002 | Equipment code format should follow pattern (e.g., OVEN-CONV-01) | Validation |
| BR-EQ-003 | Equipment name is required and must be descriptive | Form validation |
| BR-EQ-004 | Equipment must be assigned to exactly one category | Required field |

### 2.2 Equipment Status Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-EQ-010 | Equipment status must be one of: active, inactive, maintenance, retired | Enum constraint |
| BR-EQ-011 | New equipment defaults to 'active' status | Default value |
| BR-EQ-012 | Equipment in 'maintenance' status should have next maintenance date set | Validation warning |
| BR-EQ-013 | Equipment in 'retired' status cannot be reactivated without approval | Workflow |
| BR-EQ-014 | Only 'active' equipment can be assigned to recipes | Business logic |

### 2.3 Equipment Category Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-EQ-020 | Equipment category must be one of the predefined categories | Enum constraint |
| BR-EQ-021 | Categories: cooking, preparation, refrigeration, storage, serving, cleaning, small_appliance, utensil, other | System definition |
| BR-EQ-022 | Category cannot be changed if equipment is referenced in active recipes | Soft constraint |

### 2.4 Quantity Management Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-EQ-030 | Total quantity must be at least 1 | Validation |
| BR-EQ-031 | Available quantity cannot exceed total quantity | Validation |
| BR-EQ-032 | Available quantity must be 0 or greater | Validation |
| BR-EQ-033 | Available quantity should be reduced when equipment is under maintenance | Business logic |

### 2.5 Maintenance Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-EQ-040 | Maintenance schedule should be defined for equipment requiring regular service | Recommendation |
| BR-EQ-041 | Last maintenance date should be recorded after each maintenance event | Manual entry |
| BR-EQ-042 | Next maintenance date should be calculated based on schedule | Computed |
| BR-EQ-043 | Equipment past maintenance due date should trigger notification | System alert |

---

## 3. Status Lifecycle

### 3.1 Equipment Status Values

| Status | Description | Can Use in Recipes | Editable |
|--------|-------------|-------------------|----------|
| active | Equipment is operational and available | Yes | Yes |
| inactive | Equipment is not in use but not retired | No | Yes |
| maintenance | Equipment is undergoing maintenance | No | Yes |
| retired | Equipment is permanently out of service | No | Limited |

### 3.2 Valid Status Transitions

```
active <-> inactive
active -> maintenance -> active
active -> retired
inactive -> retired
maintenance -> retired
```

### 3.3 Transition Rules

| From | To | Condition |
|------|-----|-----------|
| active | inactive | No active recipe sessions using equipment |
| active | maintenance | Maintenance scheduled or equipment failure |
| active | retired | Equipment permanently decommissioned |
| inactive | active | Equipment restored to service |
| inactive | retired | Equipment disposed |
| maintenance | active | Maintenance completed |
| maintenance | retired | Equipment cannot be repaired |

---

## 4. Equipment Category Definitions

### 4.1 Category Descriptions

| Category | Description | Examples |
|----------|-------------|----------|
| cooking | Equipment used for applying heat to food | Ovens, stoves, grills, fryers |
| preparation | Equipment used for food preparation | Food processors, mixers, slicers |
| refrigeration | Equipment for cooling and freezing | Refrigerators, freezers, blast chillers |
| storage | Equipment for storing food and supplies | Shelving, bins, containers |
| serving | Equipment for serving food | Steam tables, display cases |
| cleaning | Equipment for cleaning operations | Dishwashers, sanitizers |
| small_appliance | Portable electrical appliances | Blenders, toasters, immersion blenders |
| utensil | Hand tools and utensils | Knives, spatulas, ladles |
| other | Equipment not fitting other categories | Specialized or miscellaneous items |

---

## 5. Integration Rules

### 5.1 Recipe Integration

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-EQ-050 | Recipes can specify required equipment for preparation | Optional field |
| BR-EQ-051 | Equipment referenced in recipes must be active | Validation |
| BR-EQ-052 | Deleting equipment used in recipes requires confirmation | UI warning |
| BR-EQ-053 | Equipment availability should be considered in recipe scheduling | Recommendation |

### 5.2 Location Integration

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-EQ-060 | Equipment can be assigned to a specific location | Optional field |
| BR-EQ-061 | Equipment can be assigned to a kitchen station | Optional field |
| BR-EQ-062 | Portable equipment can be moved between stations | Boolean flag |

---

## 6. Search and Filter Rules

### 6.1 Searchable Fields

| Field | Search Type |
|-------|-------------|
| name | Text search (contains) |
| code | Text search (contains) |
| brand | Text search (contains) |
| station | Text search (contains) |

### 6.2 Filterable Fields

| Field | Filter Type |
|-------|-------------|
| category | Exact match (dropdown) |
| status | Exact match (dropdown) |
| isActive | Boolean |
| isPortable | Boolean |

---

## 7. Data Retention Rules

| Rule ID | Rule | Enforcement |
|---------|------|-------------|
| BR-EQ-070 | Equipment records should be retained even after retirement | Soft delete |
| BR-EQ-071 | Maintenance history should be preserved for compliance | Audit trail |
| BR-EQ-072 | Equipment usage metrics should be tracked for analytics | System logging |

---

## 8. Validation Summary

### 8.1 Required Fields

| Field | Validation |
|-------|------------|
| code | Required, unique, max 50 characters |
| name | Required, max 200 characters |
| category | Required, must be valid category |
| status | Required, must be valid status |
| totalQuantity | Required, min 1 |
| availableQuantity | Required, min 0, max totalQuantity |
| isPortable | Required, boolean |
| isActive | Required, boolean |
| displayOrder | Required, integer |

### 8.2 Optional Fields with Validation

| Field | Validation |
|-------|------------|
| description | Max 1000 characters |
| brand | Max 100 characters |
| model | Max 100 characters |
| serialNumber | Max 100 characters |
| capacity | Max 100 characters |
| powerRating | Max 50 characters |
| station | Max 100 characters |
| maintenanceSchedule | Max 100 characters |

---

## Related Documents

- [UC-equipment.md](./UC-equipment.md) - Use Cases
- [DD-equipment.md](./DD-equipment.md) - Data Dictionary
- [FD-equipment.md](./FD-equipment.md) - Flow Diagrams
- [TS-equipment.md](./TS-equipment.md) - Technical Specifications
- [VAL-equipment.md](./VAL-equipment.md) - Validation Rules
