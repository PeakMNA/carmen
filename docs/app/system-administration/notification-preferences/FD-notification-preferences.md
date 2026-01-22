# Flow Diagrams: Notification Preferences

## Module Information
- **Module**: System Administration
- **Sub-Module**: Notification Preferences
- **Route**: `/system-administration/settings/notifications`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-17

---

## Page Navigation

```mermaid
graph TD
    A[Open Notification Settings] --> B{Select Tab}
    B -->|Defaults| C[Global Defaults]
    B -->|Templates| D[Email Templates]
    B -->|Delivery| E[Delivery Settings]
    B -->|Routing| F[Routing Rules]
    B -->|History| G[Notification History]
    B -->|Testing| H[Testing Tools]
```

---

## Configure Defaults Flow

```mermaid
graph TD
    A[View Global Defaults] --> B[Select Category]
    B --> C[Toggle Event Enable]
    C --> D[Select Channels]
    D --> E[Set Frequency]
    E --> F{Save?}
    F -->|Yes| G[Save Changes]
    F -->|No| H[Continue Editing]
    G --> I[Toast: Settings Saved]
```

---

## Edit Template Flow

```mermaid
graph TD
    A[Select Template] --> B[View Details]
    B --> C[Click Edit]
    C --> D[Modify Subject/Body]
    D --> E{Test?}
    E -->|Yes| F[Send Test Email]
    E -->|No| G[Save Template]
    F --> H[Verify Delivery]
    H --> G
```

---

## Bulk Enable Flow

```mermaid
graph TD
    A[View Category] --> B[Toggle Enable All]
    B --> C{Enable or Disable?}
    C -->|Enable| D[Enable all events in category]
    C -->|Disable| E[Disable all events in category]
    D --> F[Update badge count]
    E --> F
    F --> G[Mark hasChanges true]
```

---

## Channel Toggle Flow

```mermaid
graph TD
    A[Event Enabled] --> B[Click Channel Button]
    B --> C{Channel Active?}
    C -->|Yes| D[Deactivate Channel]
    C -->|No| E[Activate Channel]
    D --> F[Update UI]
    E --> F
    F --> G[Mark hasChanges true]
```

---

**Document End**
