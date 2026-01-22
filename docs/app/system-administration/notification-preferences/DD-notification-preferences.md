# Data Dictionary: Notification Preferences

## Module Information
- **Module**: System Administration
- **Sub-Module**: Notification Preferences
- **Route**: `/system-administration/settings/notifications`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-17

---

## Data Structures

### NotificationPreference

```typescript
interface NotificationPreference {
  eventType: NotificationEventType
  channels: {
    email: boolean
    inApp: boolean
    sms: boolean
    push: boolean
  }
  enabled: boolean
  frequency: 'instant' | 'hourly' | 'daily' | 'weekly'
}
```

| Field | Type | Description |
|-------|------|-------------|
| eventType | NotificationEventType | Event that triggers notification |
| channels.email | boolean | Email channel enabled |
| channels.inApp | boolean | In-app notification enabled |
| channels.sms | boolean | SMS channel enabled |
| channels.push | boolean | Push notification enabled |
| enabled | boolean | Overall notification enabled |
| frequency | string | Delivery frequency |

---

### EmailTemplate

```typescript
interface EmailTemplate {
  id: string
  eventType: NotificationEventType
  name: string
  description: string
  language: Language
  subject: string
  bodyHtml: string
  variables: TemplateVariable[]
  isActive: boolean
}
```

| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique identifier |
| eventType | NotificationEventType | Associated event |
| name | string | Template name |
| description | string | Template description |
| language | Language | Template language |
| subject | string | Email subject line |
| bodyHtml | string | HTML body content |
| variables | TemplateVariable[] | Available placeholders |
| isActive | boolean | Template active status |

---

### NotificationEventType

```typescript
type NotificationEventType =
  | 'purchase-request-submitted'
  | 'purchase-request-approved'
  | 'purchase-request-rejected'
  | 'purchase-order-created'
  | 'purchase-order-approved'
  | 'goods-received'
  | 'invoice-received'
  | 'payment-due'
  | 'low-stock-alert'
  | 'stock-count-required'
  | 'workflow-assignment'
  | 'comment-mention'
  | 'document-shared'
  | 'price-update'
  | 'vendor-update'
  | 'system-maintenance'
  | 'security-alert'
```

---

### NotificationLog

```typescript
interface NotificationLog {
  id: string
  timestamp: Date
  eventType: NotificationEventType
  recipientId: string
  recipientEmail: string
  channel: NotificationChannel
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced'
  errorMessage?: string
  metadata?: Record<string, unknown>
}
```

---

## Component State

| State | Type | Description |
|-------|------|-------------|
| activeTab | string | Current tab (defaults, templates, etc.) |
| preferences | NotificationPreference[] | Current preferences |
| hasChanges | boolean | Unsaved changes flag |
| selectedTemplate | EmailTemplate | Selected template for editing |

---

## Event Categories

| Category | Events |
|----------|--------|
| Procurement | PR submitted/approved/rejected, PO created/approved |
| Inventory | Goods received, low stock, stock count |
| Finance | Invoice received, payment due |
| Vendor | Price update, vendor update |
| System | Workflow, mentions, documents, maintenance, security |

---

**Document End**
