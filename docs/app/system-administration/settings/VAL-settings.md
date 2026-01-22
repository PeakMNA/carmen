# Settings - Validation Rules (VAL)

**Module**: System Administration - Settings
**Version**: 1.0
**Last Updated**: 2026-01-16
**Status**: Active Development

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Overview

This document defines comprehensive validation rules for the Settings module, implemented using Zod schemas for type-safe validation on both client and server sides. All validation follows a three-layer strategy:

1. **Client-Side**: Immediate feedback using Zod + React Hook Form
2. **Server-Side**: Security validation in server actions using same Zod schemas
3. **Database**: SQL constraints for data integrity

---

## 2. Company Settings Validation

### 2.1 Company Settings Schema

**File**: `lib/utils/validation/settings-schemas.ts`

```typescript
import { z } from 'zod';

// Address validation schema
export const addressSchema = z.object({
  street: z.string()
    .min(1, 'Street address is required')
    .max(200, 'Street address too long'),
  city: z.string()
    .min(1, 'City is required')
    .max(100, 'City name too long'),
  state: z.string()
    .min(1, 'State/Province is required')
    .max(100, 'State/Province name too long'),
  postalCode: z.string()
    .min(1, 'Postal code is required')
    .max(20, 'Postal code too long'),
  country: z.string()
    .min(1, 'Country is required')
    .max(100, 'Country name too long')
});

// Logo validation schema
export const logoSchema = z.object({
  url: z.string()
    .url('Invalid logo URL')
    .max(500, 'URL too long'),
  darkUrl: z.string()
    .url('Invalid dark mode logo URL')
    .max(500, 'URL too long')
    .optional(),
  faviconUrl: z.string()
    .url('Invalid favicon URL')
    .max(500, 'URL too long')
    .optional()
});

// Operating hours validation schema
export const operatingHoursSchema = z.object({
  open: z.boolean(),
  start: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
  end: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)')
}).refine((data) => {
  if (!data.open) return true;
  return data.start < data.end;
}, {
  message: 'End time must be after start time'
});

// Company settings validation schema
export const companySettingsSchema = z.object({
  id: z.string().min(1),

  // Basic Information
  companyName: z.string()
    .min(1, 'Company name is required')
    .max(100, 'Company name too long'),
  legalName: z.string()
    .min(1, 'Legal name is required')
    .max(100, 'Legal name too long'),
  taxId: z.string()
    .min(1, 'Tax ID is required')
    .regex(/^[A-Z]{3}-\d{9}$/, 'Invalid tax ID format (XXX-123456789)')
    .max(50),
  registrationNumber: z.string()
    .min(1, 'Registration number is required')
    .max(50, 'Registration number too long'),
  industry: z.string()
    .max(100, 'Industry name too long')
    .optional(),

  // Contact Information
  address: addressSchema,
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format')
    .max(20),
  email: z.string()
    .email('Invalid email address')
    .max(100, 'Email address too long'),
  website: z.string()
    .url('Invalid website URL')
    .max(200, 'URL too long')
    .optional(),

  // Branding
  logo: logoSchema,
  primaryColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format (#RRGGBB)'),
  secondaryColor: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color format (#RRGGBB)'),

  // Business Settings
  fiscalYearStart: z.string()
    .regex(/^\d{2}-\d{2}$/, 'Invalid format (MM-DD)')
    .refine((val) => {
      const [month, day] = val.split('-').map(Number);
      return month >= 1 && month <= 12 && day >= 1 && day <= 31;
    }, 'Invalid month or day'),
  defaultCurrency: z.string()
    .length(3, 'Currency code must be 3 letters')
    .regex(/^[A-Z]{3}$/, 'Must be uppercase ISO 4217 code'),
  defaultTimezone: z.string()
    .min(1, 'Timezone is required')
    .max(50, 'Timezone name too long'),
  defaultLanguage: z.enum(['en', 'es', 'fr', 'de', 'ja', 'zh', 'pt', 'it', 'ru'], {
    errorMap: () => ({ message: 'Invalid language code' })
  }),

  // Operating Hours
  operatingHours: z.object({
    monday: operatingHoursSchema,
    tuesday: operatingHoursSchema,
    wednesday: operatingHoursSchema,
    thursday: operatingHoursSchema,
    friday: operatingHoursSchema,
    saturday: operatingHoursSchema,
    sunday: operatingHoursSchema
  }),

  // Feature Flags
  multiLocation: z.boolean(),
  multiDepartment: z.boolean(),

  // Audit Fields
  updatedAt: z.date(),
  updatedBy: z.string().min(1),
  createdAt: z.date()
});
```

### 2.2 Business Rules

1. **Tax ID**: Must follow format XXX-123456789 (3 letters, hyphen, 9 digits)
2. **Phone**: Must be valid E.164 format (+1234567890)
3. **Colors**: Must be valid hex color codes (#RRGGBB)
4. **Operating Hours**: Start time must be before end time
5. **Fiscal Year**: Must be valid month (01-12) and day (01-31)
6. **Currency**: Must be valid ISO 4217 code (USD, EUR, GBP, etc.)
7. **Timezone**: Must be valid IANA timezone identifier
8. **URLs**: Must be valid HTTP/HTTPS URLs

---

## 3. Security Settings Validation

### 3.1 Security Settings Schema

```typescript
// Password policy validation
export const passwordPolicySchema = z.object({
  minLength: z.number()
    .int('Must be an integer')
    .min(6, 'Minimum length must be at least 6 characters')
    .max(128, 'Maximum length cannot exceed 128 characters'),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumbers: z.boolean(),
  requireSpecialChars: z.boolean(),
  preventReuse: z.number()
    .int()
    .min(0, 'Must be non-negative')
    .max(24, 'Cannot prevent more than 24 previous passwords'),
  historyCount: z.number()
    .int()
    .min(0, 'Must be non-negative')
    .max(24, 'Cannot track more than 24 passwords'),
  expiryDays: z.number()
    .int()
    .min(0, '0 = never expires')
    .max(365, 'Maximum 1 year'),
  complexityScore: z.number()
    .int()
    .min(0, 'Score cannot be negative')
    .max(4, 'Maximum score is 4')
}).refine((data) => {
  // At least one requirement must be enabled for complexity score > 0
  if (data.complexityScore > 0) {
    return data.requireUppercase || data.requireLowercase ||
           data.requireNumbers || data.requireSpecialChars;
  }
  return true;
}, {
  message: 'Enable at least one requirement for complexity score > 0'
});

// Session settings validation
export const sessionSettingsSchema = z.object({
  timeout: z.number()
    .int()
    .min(5, 'Minimum timeout is 5 minutes')
    .max(480, 'Maximum timeout is 8 hours'),
  maxConcurrentSessions: z.number()
    .int()
    .min(1, 'Must allow at least 1 session')
    .max(10, 'Maximum 10 concurrent sessions'),
  rememberMeEnabled: z.boolean(),
  rememberMe: z.boolean(),
  rememberMeDuration: z.number()
    .int()
    .min(1, 'Minimum 1 day')
    .max(90, 'Maximum 90 days'),
  absoluteTimeout: z.boolean()
}).refine((data) => {
  // Remember me duration only valid if remember me is enabled
  if (!data.rememberMeEnabled && data.rememberMe) {
    return false;
  }
  return true;
}, {
  message: 'Enable Remember Me feature to use Remember Me functionality'
});

// Two-factor authentication validation
export const twoFactorSettingsSchema = z.object({
  enabled: z.boolean(),
  required: z.boolean(),
  requiredForRoles: z.array(z.string()).default([]),
  methods: z.array(z.enum(['authenticator', 'sms', 'email']))
    .min(1, 'At least one method must be enabled'),
  gracePeriodDays: z.number()
    .int()
    .min(0, 'Minimum 0 days (immediate)')
    .max(30, 'Maximum 30 days')
}).refine((data) => {
  // If required, at least one method must be available
  if (data.required && data.methods.length === 0) {
    return false;
  }
  return true;
}, {
  message: 'At least one 2FA method required when 2FA is mandatory'
});

// IP access control validation
export const ipAccessControlSchema = z.object({
  enabled: z.boolean(),
  whitelist: z.array(z.string()).default([]),
  blacklist: z.array(z.string()).default([]),
  allowVPN: z.boolean()
}).refine((data) => {
  // Validate IP addresses and CIDR ranges
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}(\/\d{1,2})?$/;
  const invalidWhitelist = data.whitelist.filter(ip => !ipRegex.test(ip));
  const invalidBlacklist = data.blacklist.filter(ip => !ipRegex.test(ip));
  return invalidWhitelist.length === 0 && invalidBlacklist.length === 0;
}, {
  message: 'Invalid IP address or CIDR range format'
});

// Login attempts validation
export const loginAttemptsSchema = z.object({
  maxAttempts: z.number()
    .int()
    .min(3, 'Minimum 3 attempts')
    .max(10, 'Maximum 10 attempts'),
  lockoutDuration: z.number()
    .int()
    .min(5, 'Minimum 5 minutes')
    .max(1440, 'Maximum 24 hours'),
  resetAfter: z.number()
    .int()
    .min(15, 'Minimum 15 minutes')
    .max(1440, 'Maximum 24 hours'),
  notifyAdmin: z.boolean()
}).refine((data) => {
  // Reset period should be longer than lockout duration
  return data.resetAfter >= data.lockoutDuration;
}, {
  message: 'Reset period should be >= lockout duration'
});

// Security questions validation
export const securityQuestionsSchema = z.object({
  enabled: z.boolean(),
  required: z.boolean(),
  minRequired: z.number()
    .int()
    .min(1, 'Minimum 1 question')
    .max(5, 'Maximum 5 questions')
});

// Audit logging validation
export const auditLoggingSchema = z.object({
  enabled: z.boolean(),
  events: z.array(z.enum([
    'login',
    'logout',
    'dataAccess',
    'dataModification',
    'settingsChange'
  ])),
  retentionDays: z.number()
    .int()
    .min(30, 'Minimum 30 days')
    .max(3650, 'Maximum 10 years')
});

// Data encryption validation
export const dataEncryptionSchema = z.object({
  atRest: z.boolean(),
  inTransit: z.boolean(),
  algorithm: z.string()
    .max(50)
    .optional()
});

// Complete security settings schema
export const securitySettingsSchema = z.object({
  id: z.string().min(1),
  passwordPolicy: passwordPolicySchema,
  sessionSettings: sessionSettingsSchema,
  twoFactor: twoFactorSettingsSchema,
  ipAccessControl: ipAccessControlSchema,
  loginAttempts: loginAttemptsSchema,
  securityQuestions: securityQuestionsSchema,
  auditLogging: auditLoggingSchema,
  dataEncryption: dataEncryptionSchema,
  updatedAt: z.date(),
  updatedBy: z.string().min(1),
  createdAt: z.date()
});
```

### 3.2 Business Rules

1. **Password Policy**:
   - Minimum length: 6-128 characters
   - At least one requirement must be enabled if complexity score > 0
   - History count cannot exceed prevent reuse count
   - Expiry days: 0 (never) to 365 days

2. **Session Management**:
   - Timeout: 5 minutes to 8 hours
   - Max concurrent sessions: 1-10
   - Remember me duration only valid if enabled
   - Absolute timeout forces logout regardless of activity

3. **Two-Factor Authentication**:
   - At least one method must be enabled if 2FA is required
   - Grace period: 0-30 days
   - Role-based requirements override global settings

4. **IP Access Control**:
   - Must use valid IPv4 addresses or CIDR notation
   - Whitelist takes precedence over blacklist
   - VPN access can be blocked separately

5. **Login Security**:
   - Max attempts: 3-10
   - Lockout duration: 5 minutes to 24 hours
   - Reset period must be >= lockout duration

6. **Audit Logging**:
   - Minimum retention: 30 days (regulatory compliance)
   - Maximum retention: 10 years
   - At least one event type must be logged if enabled

---

## 4. Application Settings Validation

### 4.1 Email Configuration Schema

```typescript
// SMTP settings validation
export const smtpSettingsSchema = z.object({
  host: z.string()
    .min(1, 'SMTP host is required')
    .max(200, 'Host name too long'),
  port: z.number()
    .int()
    .min(1, 'Invalid port')
    .max(65535, 'Invalid port'),
  secure: z.boolean(),
  username: z.string()
    .min(1, 'Username is required')
    .max(100, 'Username too long'),
  password: z.string()
    .min(1, 'Password is required')
    .max(200, 'Password too long')
});

// Email configuration validation
export const emailConfigSchema = z.object({
  enabled: z.boolean(),
  provider: z.enum(['smtp', 'sendgrid', 'mailgun', 'ses', 'custom']),
  smtp: smtpSettingsSchema.optional(),
  fromEmail: z.string()
    .email('Invalid email address')
    .max(100),
  fromName: z.string()
    .min(1, 'From name is required')
    .max(100, 'From name too long'),
  replyToEmail: z.string()
    .email('Invalid reply-to email')
    .max(100)
    .optional(),
  maxRetries: z.number()
    .int()
    .min(0, 'Cannot be negative')
    .max(5, 'Maximum 5 retries'),
  retryDelay: z.number()
    .int()
    .min(10, 'Minimum 10 seconds')
    .max(3600, 'Maximum 1 hour'),
  batchSize: z.number()
    .int()
    .min(1, 'Minimum 1')
    .max(1000, 'Maximum 1000 per batch'),
  useCustomTemplates: z.boolean(),
  templatePath: z.string()
    .max(500)
    .optional()
}).refine((data) => {
  // SMTP settings required if provider is SMTP
  if (data.provider === 'smtp' && !data.smtp) {
    return false;
  }
  return true;
}, {
  message: 'SMTP settings required when using SMTP provider'
});
```

### 4.2 Backup Settings Schema

```typescript
// Backup schedule validation
export const backupScheduleSchema = z.object({
  frequency: z.enum(['hourly', 'daily', 'weekly', 'monthly']),
  time: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
  dayOfWeek: z.number()
    .int()
    .min(0, 'Sunday = 0')
    .max(6, 'Saturday = 6')
    .optional(),
  dayOfMonth: z.number()
    .int()
    .min(1)
    .max(31)
    .optional()
}).refine((data) => {
  // Day of week required for weekly backups
  if (data.frequency === 'weekly' && data.dayOfWeek === undefined) {
    return false;
  }
  // Day of month required for monthly backups
  if (data.frequency === 'monthly' && data.dayOfMonth === undefined) {
    return false;
  }
  return true;
}, {
  message: 'Day of week/month required for weekly/monthly backups'
});

// Backup retention validation
export const backupRetentionSchema = z.object({
  keepDaily: z.number()
    .int()
    .min(1, 'Keep at least 1 daily backup')
    .max(90, 'Maximum 90 days'),
  keepWeekly: z.number()
    .int()
    .min(1, 'Keep at least 1 weekly backup')
    .max(52, 'Maximum 52 weeks'),
  keepMonthly: z.number()
    .int()
    .min(1, 'Keep at least 1 monthly backup')
    .max(120, 'Maximum 10 years')
});

// Backup storage validation
export const backupStorageSchema = z.object({
  type: z.enum(['local', 's3', 'azure', 'gcp']),
  path: z.string()
    .min(1, 'Storage path is required')
    .max(1000, 'Path too long'),
  encrypted: z.boolean()
});

// Complete backup settings validation
export const backupSettingsSchema = z.object({
  enabled: z.boolean(),
  schedule: backupScheduleSchema,
  retention: backupRetentionSchema,
  storage: backupStorageSchema,
  includeAttachments: z.boolean(),
  compressionEnabled: z.boolean(),
  notifyOnComplete: z.boolean(),
  notifyOnFailure: z.boolean()
});
```

### 4.3 Data Retention Schema

```typescript
export const dataRetentionSchema = z.object({
  documents: z.object({
    purchaseRequests: z.number().int().min(365, 'Minimum 1 year').max(3650, 'Maximum 10 years'),
    purchaseOrders: z.number().int().min(365, 'Minimum 1 year').max(3650, 'Maximum 10 years'),
    invoices: z.number().int().min(365, 'Minimum 1 year').max(3650, 'Maximum 10 years'),
    receipts: z.number().int().min(365, 'Minimum 1 year').max(3650, 'Maximum 10 years')
  }),
  logs: z.object({
    auditLogs: z.number().int().min(90, 'Minimum 3 months').max(3650, 'Maximum 10 years'),
    systemLogs: z.number().int().min(30, 'Minimum 1 month').max(365, 'Maximum 1 year'),
    errorLogs: z.number().int().min(60, 'Minimum 2 months').max(365, 'Maximum 1 year')
  }),
  archived: z.object({
    autoArchiveAfter: z.number().int().min(180, 'Minimum 6 months').max(3650, 'Maximum 10 years'),
    deleteArchivedAfter: z.number().int().min(365, 'Minimum 1 year').max(7300, 'Maximum 20 years')
  })
}).refine((data) => {
  // Archive period must be less than delete period
  return data.archived.autoArchiveAfter < data.archived.deleteArchivedAfter;
}, {
  message: 'Archive period must be shorter than delete period'
});
```

---

## 5. Notification Settings Validation

### 5.1 Email Template Schema

```typescript
// Template variable validation
export const templateVariableSchema = z.object({
  name: z.string()
    .min(1, 'Variable name is required')
    .max(50, 'Variable name too long')
    .regex(/^[a-zA-Z][a-zA-Z0-9_]*$/, 'Must start with letter, alphanumeric and underscore only'),
  description: z.string()
    .min(1, 'Description is required')
    .max(200, 'Description too long'),
  example: z.string()
    .min(1, 'Example is required')
    .max(100, 'Example too long'),
  required: z.boolean()
});

// Email template validation
export const emailTemplateSchema = z.object({
  id: z.string().min(1),
  eventType: z.string()
    .min(1, 'Event type is required')
    .max(100, 'Event type too long'),
  name: z.string()
    .min(1, 'Template name is required')
    .max(100, 'Template name too long'),
  description: z.string()
    .max(500, 'Description too long')
    .optional(),
  language: z.enum(['en', 'es', 'fr', 'de', 'ja', 'zh', 'pt', 'it', 'ru']),
  subject: z.string()
    .min(1, 'Subject is required')
    .max(200, 'Subject too long'),
  htmlTemplate: z.string()
    .min(1, 'HTML template is required'),
  textTemplate: z.string()
    .min(1, 'Plain text template is required'),
  variables: z.array(templateVariableSchema)
    .min(1, 'At least one variable is required'),
  version: z.number()
    .int()
    .positive('Version must be positive'),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  updatedBy: z.string().min(1)
}).refine((data) => {
  // Validate that all variables used in template are defined
  const variablePattern = /{{([a-zA-Z][a-zA-Z0-9_]*)}}/g;
  const htmlVariables = [...data.htmlTemplate.matchAll(variablePattern)].map(m => m[1]);
  const textVariables = [...data.textTemplate.matchAll(variablePattern)].map(m => m[1]);
  const allUsedVariables = [...new Set([...htmlVariables, ...textVariables])];
  const definedVariables = data.variables.map(v => v.name);

  const undefinedVariables = allUsedVariables.filter(v => !definedVariables.includes(v));
  return undefinedVariables.length === 0;
}, {
  message: 'All template variables must be defined in variables array'
});
```

### 5.2 Routing Rule Schema

```typescript
// Routing rule condition validation
export const routingRuleConditionSchema = z.object({
  field: z.string()
    .min(1, 'Field name is required')
    .max(100, 'Field name too long'),
  operator: z.enum(['equals', 'greaterThan', 'lessThan', 'contains', 'in']),
  value: z.union([
    z.string(),
    z.number(),
    z.boolean(),
    z.array(z.union([z.string(), z.number()]))
  ])
});

// Routing rule action validation
export const routingRuleActionSchema = z.object({
  type: z.enum(['notify', 'escalate', 'skip']),
  recipientType: z.enum(['user', 'role', 'department', 'webhook']),
  recipient: z.string()
    .min(1, 'Recipient is required')
    .max(100, 'Recipient identifier too long'),
  channels: z.array(z.enum(['email', 'in-app', 'sms', 'push']))
    .min(1, 'At least one channel is required')
});

// Complete routing rule validation
export const routingRuleSchema = z.object({
  id: z.string().min(1),
  name: z.string()
    .min(1, 'Rule name is required')
    .max(100, 'Rule name too long'),
  eventType: z.string()
    .min(1, 'Event type is required')
    .max(100, 'Event type too long'),
  conditions: z.array(routingRuleConditionSchema)
    .min(1, 'At least one condition is required')
    .max(10, 'Maximum 10 conditions per rule'),
  actions: z.array(routingRuleActionSchema)
    .min(1, 'At least one action is required')
    .max(5, 'Maximum 5 actions per rule'),
  priority: z.number()
    .int()
    .min(1, 'Priority must be at least 1')
    .max(100, 'Priority cannot exceed 100'),
  enabled: z.boolean()
});
```

### 5.3 Escalation Policy Schema

```typescript
// Escalation stage validation
export const escalationStageSchema = z.object({
  level: z.number()
    .int()
    .positive('Level must be positive'),
  delayMinutes: z.number()
    .int()
    .min(0, 'Delay cannot be negative')
    .max(10080, 'Maximum 7 days'),
  recipientRole: z.string()
    .min(1, 'Recipient role is required')
    .max(50, 'Role identifier too long'),
  channels: z.array(z.enum(['email', 'in-app', 'sms', 'push']))
    .min(1, 'At least one channel is required'),
  condition: z.enum(['unacknowledged', 'unresolved'])
});

// Complete escalation policy validation
export const escalationPolicySchema = z.object({
  id: z.string().min(1),
  name: z.string()
    .min(1, 'Policy name is required')
    .max(100, 'Policy name too long'),
  description: z.string()
    .max(500, 'Description too long')
    .optional(),
  eventType: z.string()
    .min(1, 'Event type is required')
    .max(100, 'Event type too long'),
  stages: z.array(escalationStageSchema)
    .min(1, 'At least one stage is required')
    .max(5, 'Maximum 5 escalation stages'),
  enabled: z.boolean()
}).refine((data) => {
  // Stages must be in sequential order
  const levels = data.stages.map(s => s.level);
  const sorted = [...levels].sort((a, b) => a - b);
  return JSON.stringify(levels) === JSON.stringify(sorted);
}, {
  message: 'Escalation stages must be in sequential order'
}).refine((data) => {
  // Delays must be increasing
  const delays = data.stages.map(s => s.delayMinutes);
  for (let i = 1; i < delays.length; i++) {
    if (delays[i] < delays[i - 1]) {
      return false;
    }
  }
  return true;
}, {
  message: 'Escalation delays must be increasing'
});
```

---

## 6. User Preferences Validation

### 6.1 Display Settings Schema

```typescript
export const displaySettingsSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']),
  fontSize: z.enum(['small', 'medium', 'large', 'extra-large']),
  highContrast: z.boolean(),
  compactMode: z.boolean(),
  showAnimations: z.boolean(),
  sidebarCollapsed: z.boolean()
});
```

### 6.2 Regional Settings Schema

```typescript
export const regionalSettingsSchema = z.object({
  language: z.enum(['en', 'es', 'fr', 'de', 'ja', 'zh', 'pt', 'it', 'ru']),
  timezone: z.string()
    .min(1, 'Timezone is required')
    .max(50, 'Timezone name too long'),
  currency: z.string()
    .length(3, 'Must be 3-letter ISO code')
    .regex(/^[A-Z]{3}$/, 'Must be uppercase ISO 4217 code'),
  dateFormat: z.enum(['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD', 'DD.MM.YYYY']),
  timeFormat: z.enum(['12h', '24h']),
  numberFormat: z.string()
    .min(2, 'Invalid locale')
    .max(10, 'Locale too long'),
  firstDayOfWeek: z.enum(['sunday', 'monday', 'saturday'])
});
```

### 6.3 Notification Preferences Schema

```typescript
// Notification preference validation
export const notificationPreferenceSchema = z.object({
  eventType: z.string()
    .min(1, 'Event type is required')
    .max(100, 'Event type too long'),
  channels: z.object({
    email: z.boolean(),
    inApp: z.boolean(),
    sms: z.boolean(),
    push: z.boolean()
  }).refine((data) => {
    // At least one channel must be enabled if notification is enabled
    return data.email || data.inApp || data.sms || data.push;
  }, {
    message: 'At least one notification channel must be enabled'
  }),
  frequency: z.enum(['instant', 'hourly', 'daily', 'weekly']),
  enabled: z.boolean()
});

// Email digest validation
export const emailDigestSchema = z.object({
  enabled: z.boolean(),
  frequency: z.enum(['daily', 'weekly']),
  time: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)')
});

// Do not disturb validation
export const doNotDisturbSchema = z.object({
  enabled: z.boolean(),
  startTime: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
  endTime: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format (HH:mm)'),
  days: z.array(z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']))
    .min(1, 'At least one day is required')
});

// Complete notification settings validation
export const notificationSettingsSchema = z.object({
  preferences: z.array(notificationPreferenceSchema),
  emailDigest: emailDigestSchema,
  doNotDisturb: doNotDisturbSchema,
  soundEnabled: z.boolean(),
  desktopNotifications: z.boolean()
});
```

### 6.4 Complete User Preferences Schema

```typescript
export const userPreferencesSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  display: displaySettingsSchema,
  regional: regionalSettingsSchema,
  notifications: notificationSettingsSchema,
  defaultViews: z.object({
    landingPage: z.string()
      .min(1, 'Landing page is required')
      .max(200, 'URL too long'),
    listPageSize: z.number()
      .int()
      .min(10, 'Minimum 10')
      .max(100, 'Maximum 100'),
    defaultFilterView: z.enum(['all', 'my-items', 'department', 'location']),
    dashboardWidgets: z.array(z.string())
      .max(20, 'Maximum 20 widgets'),
    favoritePages: z.array(z.string())
      .max(50, 'Maximum 50 favorite pages')
  }),
  accessibility: z.object({
    screenReaderOptimized: z.boolean(),
    keyboardNavigationHints: z.boolean(),
    focusIndicatorEnhanced: z.boolean(),
    reduceMotion: z.boolean(),
    audioDescriptions: z.boolean()
  }),
  updatedAt: z.date(),
  createdAt: z.date()
});
```

---

## 7. Cross-Field Validation Rules

### 7.1 Operating Hours Validation

```typescript
export function validateOperatingHours(hours: OperatingHours): ValidationResult {
  const errors: string[] = [];

  Object.entries(hours).forEach(([day, schedule]) => {
    if (schedule.open && schedule.start >= schedule.end) {
      errors.push(`${day}: End time must be after start time`);
    }
  });

  // Check if at least one day is open
  const anyDayOpen = Object.values(hours).some(schedule => schedule.open);
  if (!anyDayOpen) {
    errors.push('At least one day must be open');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

### 7.2 Color Contrast Validation

```typescript
export function validateColorContrast(
  primaryColor: string,
  secondaryColor: string
): ValidationResult {
  // Calculate relative luminance
  const getLuminance = (hex: string): number => {
    const rgb = parseInt(hex.slice(1), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;

    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });

    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const l1 = getLuminance(primaryColor);
  const l2 = getLuminance(secondaryColor);
  const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

  // WCAG AA requires ratio >= 4.5:1 for normal text
  if (ratio < 4.5) {
    return {
      valid: false,
      errors: [`Color contrast ratio ${ratio.toFixed(2)}:1 is below WCAG AA standard (4.5:1)`]
    };
  }

  return { valid: true, errors: [] };
}
```

### 7.3 Email Template Variable Validation

```typescript
export function validateTemplateVariables(
  template: string,
  definedVariables: TemplateVariable[]
): ValidationResult {
  const errors: string[] = [];

  // Extract all variables used in template
  const variablePattern = /{{([a-zA-Z][a-zA-Z0-9_]*)}}/g;
  const usedVariables = [...template.matchAll(variablePattern)].map(m => m[1]);
  const definedNames = definedVariables.map(v => v.name);

  // Check for undefined variables
  const undefinedVariables = usedVariables.filter(v => !definedNames.includes(v));
  if (undefinedVariables.length > 0) {
    errors.push(`Undefined variables: ${undefinedVariables.join(', ')}`);
  }

  // Check for missing required variables
  const requiredVariables = definedVariables.filter(v => v.required).map(v => v.name);
  const missingRequired = requiredVariables.filter(v => !usedVariables.includes(v));
  if (missingRequired.length > 0) {
    errors.push(`Missing required variables: ${missingRequired.join(', ')}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## 8. Business Logic Validation

### 8.1 Backup Schedule Validation

```typescript
export function validateBackupSchedule(
  frequency: BackupFrequency,
  schedule: BackupSchedule
): ValidationResult {
  const errors: string[] = [];

  switch (frequency) {
    case 'weekly':
      if (schedule.dayOfWeek === undefined) {
        errors.push('Day of week is required for weekly backups');
      }
      break;

    case 'monthly':
      if (schedule.dayOfMonth === undefined) {
        errors.push('Day of month is required for monthly backups');
      } else if (schedule.dayOfMonth > 28) {
        errors.push('Day of month should not exceed 28 to avoid missing months');
      }
      break;
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

### 8.2 Notification Routing Rule Validation

```typescript
export function validateRoutingRule(rule: NotificationRoutingRule): ValidationResult {
  const errors: string[] = [];

  // Validate condition operators match field types
  rule.conditions.forEach((condition, index) => {
    const numericOperators = ['greaterThan', 'lessThan'];
    const stringOperators = ['contains', 'equals'];

    if (numericOperators.includes(condition.operator) && typeof condition.value !== 'number') {
      errors.push(`Condition ${index + 1}: Operator '${condition.operator}' requires numeric value`);
    }

    if (condition.operator === 'in' && !Array.isArray(condition.value)) {
      errors.push(`Condition ${index + 1}: Operator 'in' requires array value`);
    }
  });

  // Validate webhook URLs in actions
  rule.actions.forEach((action, index) => {
    if (action.recipientType === 'webhook') {
      try {
        new URL(action.recipient);
      } catch {
        errors.push(`Action ${index + 1}: Invalid webhook URL`);
      }
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
```

### 8.3 Security Policy Validation

```typescript
export function validateSecurityPolicy(settings: SecuritySettings): ValidationResult {
  const errors: string[] = [];

  // Password policy strength check
  const { passwordPolicy } = settings;
  let strengthScore = 0;
  if (passwordPolicy.minLength >= 12) strengthScore += 2;
  if (passwordPolicy.requireUppercase) strengthScore++;
  if (passwordPolicy.requireLowercase) strengthScore++;
  if (passwordPolicy.requireNumbers) strengthScore++;
  if (passwordPolicy.requireSpecialChars) strengthScore++;

  if (strengthScore < 3 && passwordPolicy.complexityScore >= 3) {
    errors.push('Password policy requirements do not meet specified complexity score');
  }

  // 2FA consistency check
  if (settings.twoFactor.required && settings.twoFactor.methods.length === 0) {
    errors.push('At least one 2FA method must be enabled when 2FA is required');
  }

  // IP access control validation
  if (settings.ipAccessControl.enabled && settings.ipAccessControl.whitelist.length === 0) {
    errors.push('IP whitelist cannot be empty when IP access control is enabled');
  }

  // Audit logging check
  if (settings.auditLogging.enabled && settings.auditLogging.events.length === 0) {
    errors.push('At least one event type must be logged when audit logging is enabled');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
```

---

## 9. Error Messages

### 9.1 User-Friendly Error Messages

```typescript
export const validationMessages = {
  // General
  required: 'This field is required',
  invalid: 'Invalid value',
  tooLong: 'Value is too long',
  tooShort: 'Value is too short',

  // Company Settings
  companyName: {
    required: 'Company name is required',
    tooLong: 'Company name cannot exceed 100 characters'
  },
  taxId: {
    required: 'Tax ID is required',
    invalidFormat: 'Tax ID must follow format XXX-123456789'
  },
  email: {
    required: 'Email address is required',
    invalidFormat: 'Please enter a valid email address'
  },
  phone: {
    required: 'Phone number is required',
    invalidFormat: 'Please enter a valid phone number (e.g., +12345678900)'
  },
  color: {
    invalidFormat: 'Please enter a valid hex color (e.g., #FF5733)'
  },
  operatingHours: {
    endBeforeStart: 'End time must be after start time',
    atLeastOneDay: 'At least one day must be open for business'
  },

  // Security Settings
  password: {
    minLength: 'Password must be at least {min} characters',
    weakPolicy: 'Password policy does not meet minimum security requirements'
  },
  session: {
    minTimeout: 'Session timeout must be at least 5 minutes',
    maxSessions: 'Maximum concurrent sessions must be between 1 and 10'
  },
  twoFactor: {
    noMethods: 'At least one 2FA method must be enabled when 2FA is required'
  },
  ipAccess: {
    emptyWhitelist: 'IP whitelist cannot be empty when IP access control is enabled',
    invalidIP: 'Invalid IP address or CIDR range format'
  },

  // Notification Settings
  template: {
    nameRequired: 'Template name is required',
    undefinedVariables: 'Template uses undefined variables: {variables}',
    missingRequired: 'Template is missing required variables: {variables}'
  },
  routingRule: {
    noConditions: 'At least one condition is required',
    noActions: 'At least one action is required',
    invalidOperator: 'Operator {operator} requires {type} value'
  },
  escalation: {
    stagesOutOfOrder: 'Escalation stages must be in sequential order',
    delaysNotIncreasing: 'Escalation delays must be increasing'
  },

  // Backup Settings
  backup: {
    invalidSchedule: 'Invalid backup schedule for selected frequency',
    retentionTooShort: 'Backup retention must be at least {min} days',
    archiveBeforeDelete: 'Archive period must be shorter than delete period'
  }
};
```

---

## 10. Custom Validators

### 10.1 Async Validators

```typescript
// Check if email template already exists
export async function validateTemplateUniqueness(
  eventType: string,
  language: string,
  excludeId?: string
): Promise<ValidationResult> {
  const existing = await prisma.emailTemplate.findFirst({
    where: {
      eventType,
      language,
      isActive: true,
      id: excludeId ? { not: excludeId } : undefined
    }
  });

  if (existing) {
    return {
      valid: false,
      errors: [`Active template already exists for ${eventType} in ${language}`]
    };
  }

  return { valid: true, errors: [] };
}

// Validate webhook endpoint accessibility
export async function validateWebhookEndpoint(url: string): Promise<ValidationResult> {
  try {
    const response = await fetch(url, {
      method: 'OPTIONS',
      headers: { 'User-Agent': 'Carmen-Settings-Validator' },
      signal: AbortSignal.timeout(5000)
    });

    if (!response.ok) {
      return {
        valid: false,
        errors: [`Webhook endpoint returned status ${response.status}`]
      };
    }

    return { valid: true, errors: [] };
  } catch (error) {
    return {
      valid: false,
      errors: [`Cannot reach webhook endpoint: ${error.message}`]
    };
  }
}
```

---

**Document Control**:
- **Created**: 2026-01-16
- **Version**: 1.0
- **Status**: Active Development
- **Next Review**: Q2 2025
