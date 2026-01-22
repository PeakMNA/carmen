# Validation Rules: Notification Preferences

## Module Information
- **Module**: System Administration
- **Sub-Module**: Notification Preferences
- **Route**: `/system-administration/settings/notifications`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-17

---

## Form Validations

### VAL-NP-001: Save Button State

| Condition | State |
|-----------|-------|
| hasChanges = false | Disabled |
| hasChanges = true | Enabled |

---

### VAL-NP-002: Reset Button State

| Condition | State |
|-----------|-------|
| hasChanges = false | Disabled |
| hasChanges = true | Enabled |

---

### VAL-NP-003: Channel Selection

| Rule | Description |
|------|-------------|
| Minimum | At least one channel should be enabled if event is enabled |
| Default | All channels start as false, user must enable |

---

### VAL-NP-004: Frequency Required

| Rule | Description |
|------|-------------|
| Field | frequency |
| Default | 'instant' |
| Options | instant, hourly, daily, weekly |

---

## Email Template Validations

### VAL-NP-005: Template Subject

| Rule | Description |
|------|-------------|
| Type | Required |
| Min Length | 1 character |

---

### VAL-NP-006: Template Body

| Rule | Description |
|------|-------------|
| Type | Required |
| Format | Valid HTML |

---

## Business Rules

### VAL-NP-007: Event Type Valid

All event types must match NotificationEventType enum values.

### VAL-NP-008: Template Variables

Template variables must be valid placeholders defined in TemplateVariable.

---

## Current Implementation

- Client-side state management
- Toast notifications for save/reset feedback
- No server-side validation (mock data)

---

**Document End**
