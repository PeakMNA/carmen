# Validation Rules: Delivery Points

## Module Information
- **Module**: System Administration
- **Sub-Module**: Delivery Points
- **Route**: `/system-administration/delivery-points`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-17

---

## Form Validations

### VAL-DP-001: Name Required

| Rule | Description |
|------|-------------|
| Field | name |
| Type | Required |
| Validation | `formName.trim()` must be truthy |
| Error Behavior | Submit button disabled |

---

### VAL-DP-002: Active Status Default

| Rule | Description |
|------|-------------|
| Field | isActive |
| Type | Default Value |
| Default | true (Active) |
| Applied | On Add dialog open |

---

## UI Validations

### VAL-DP-003: Submit Button State

| Condition | Button State |
|-----------|--------------|
| Name empty or whitespace | Disabled |
| Name has content | Enabled |

```tsx
<Button type="submit" disabled={!formName.trim()}>
```

---

### VAL-DP-004: Delete Confirmation Required

| Rule | Description |
|------|-------------|
| Action | Delete |
| Validation | AlertDialog must be confirmed |
| Cancel | Returns to list without deletion |

---

## Business Rules

### BR-003: Active Points in Lookups

| Rule | Description |
|------|-------------|
| Scope | Location assignment dropdowns |
| Validation | Only isActive=true points shown |
| Status | Future enhancement |

---

## Current State

The current implementation uses:
- HTML required attribute on name input
- JavaScript check for empty name before submit
- No Zod schema (client-side validation only)

---

## Future Validations

| Rule | Description |
|------|-------------|
| Unique Name | Prevent duplicate delivery point names |
| Reference Check | Prevent delete if used by locations |
| Server Validation | Zod schema on server actions |

---

**Document End**
