# Recipe Units Documentation Index

## Module Overview

The Recipe Units submodule manages units of measure used in recipe ingredients and yields. This includes both system-defined units (metric, imperial) and user-created custom units, with support for precision settings, rounding methods, and unit conversions.

## Quick Links

| Document | Description |
|----------|-------------|
| [BR-units.md](./BR-units.md) | Business Rules - Core rules governing unit management |
| [UC-units.md](./UC-units.md) | Use Cases - User interactions and workflows |
| [DD-units.md](./DD-units.md) | Data Dictionary - Database schema and TypeScript interfaces |
| [FD-units.md](./FD-units.md) | Flow Diagrams - Visual workflow representations |
| [TS-units.md](./TS-units.md) | Technical Specifications - Component architecture and implementation |
| [VAL-units.md](./VAL-units.md) | Validation Rules - Zod schemas and field validation |

## Key Concepts

### Unit Types
- **System Units**: Predefined, protected units (kg, g, ml, l, pcs, tbsp, etc.)
- **Custom Units**: User-created units for organization-specific needs

### Precision Settings
- **Decimal Places**: 0-6 decimal places for display
- **Rounding Methods**: round, floor, ceil

### Unit Conversions
- Generic conversions (e.g., 1 kg = 1000 g)
- Product-specific conversions (e.g., 1 egg = 50g)
- Approximate vs exact conversions

### Key Features
- System unit protection (cannot modify/delete)
- Custom unit creation
- Precision and rounding configuration
- Unit conversion support
- Recipe ingredient/yield integration

## Source Code Location

```
app/(main)/operational-planning/recipe-management/units/
  page.tsx
  components/
    recipe-unit-list.tsx
```

## Related Modules

- [Recipes](../recipes/) - Uses units for ingredients and yields
- [Equipment](../equipment/) - Kitchen equipment management
- [Categories](../categories/) - Recipe categorization
