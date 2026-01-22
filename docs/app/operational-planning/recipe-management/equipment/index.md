# Equipment Management Documentation Index

## Module Overview

The Equipment Management submodule enables organizations to catalog and manage kitchen equipment used in recipe preparation. This includes tracking equipment status, maintenance schedules, availability, and assignment to kitchen stations.

## Quick Links

| Document | Description |
|----------|-------------|
| [BR-equipment.md](./BR-equipment.md) | Business Rules - Core rules governing equipment management |
| [UC-equipment.md](./UC-equipment.md) | Use Cases - User interactions and workflows |
| [DD-equipment.md](./DD-equipment.md) | Data Dictionary - Database schema and TypeScript interfaces |
| [FD-equipment.md](./FD-equipment.md) | Flow Diagrams - Visual workflow representations |
| [TS-equipment.md](./TS-equipment.md) | Technical Specifications - Component architecture and implementation |
| [VAL-equipment.md](./VAL-equipment.md) | Validation Rules - Zod schemas and field validation |

## Key Concepts

### Equipment Status
- **Active**: Equipment is operational and available
- **Inactive**: Equipment is not in use but not retired
- **Maintenance**: Equipment is undergoing maintenance
- **Retired**: Equipment is permanently out of service

### Equipment Categories
- Cooking, Preparation, Refrigeration, Storage, Serving, Cleaning, Small Appliance, Utensil, Other

### Key Features
- Equipment inventory management
- Status and availability tracking
- Maintenance scheduling
- Kitchen station assignment
- Recipe equipment requirements

## Source Code Location

```
app/(main)/operational-planning/recipe-management/equipment/
  page.tsx
  components/
    equipment-list.tsx
```

## Related Modules

- [Recipes](../recipes/) - Equipment used in recipe preparation
- [Categories](../categories/) - Recipe categorization
- [Units](../units/) - Units of measure for recipes
