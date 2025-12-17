/**
 * Settings Mock Data
 *
 * Mock data for user preferences, company settings, security settings, and application settings.
 * Used for testing and development purposes.
 */

import {
  UserPreferences,
  CompanySettings,
  SecuritySettings,
  ApplicationSettings,
  NotificationPreference,
  NotificationEventType,
  DisplaySettings,
  RegionalSettings,
  NotificationSettings,
  DefaultViews,
  AccessibilitySettings,
  SystemNotificationSettings,
  EmailTemplate,
  NotificationRoutingRule,
  EscalationPolicy,
  DeliverySettings,
  RoleNotificationDefaults,
  NotificationLog
} from '../types/settings';

// ====== DEFAULT DISPLAY SETTINGS ======

export const mockDisplaySettings: DisplaySettings = {
  theme: 'system',
  fontSize: 'medium',
  highContrast: false,
  compactMode: false,
  showAnimations: true,
  sidebarCollapsed: false
};

// ====== DEFAULT REGIONAL SETTINGS ======

export const mockRegionalSettings: RegionalSettings = {
  language: 'en',
  timezone: 'UTC',
  currency: 'USD',
  dateFormat: 'MM/DD/YYYY',
  timeFormat: '12h',
  numberFormat: 'en-US',
  firstDayOfWeek: 'sunday'
};

// ====== NOTIFICATION EVENT TYPES ======

export const mockNotificationEventTypes: NotificationEventType[] = [
  'purchase-request-submitted',
  'purchase-request-approved',
  'purchase-request-rejected',
  'purchase-order-created',
  'purchase-order-approved',
  'goods-received',
  'invoice-received',
  'payment-due',
  'low-stock-alert',
  'stock-count-required',
  'workflow-assignment',
  'comment-mention',
  'document-shared',
  'price-update',
  'vendor-update',
  'system-maintenance',
  'security-alert'
];

// ====== DEFAULT NOTIFICATION PREFERENCES ======

export const mockNotificationPreferences: NotificationPreference[] = [
  {
    eventType: 'purchase-request-submitted',
    channels: { email: true, inApp: true, sms: false, push: true },
    frequency: 'instant',
    enabled: true
  },
  {
    eventType: 'purchase-request-approved',
    channels: { email: true, inApp: true, sms: false, push: true },
    frequency: 'instant',
    enabled: true
  },
  {
    eventType: 'purchase-request-rejected',
    channels: { email: true, inApp: true, sms: false, push: true },
    frequency: 'instant',
    enabled: true
  },
  {
    eventType: 'purchase-order-created',
    channels: { email: true, inApp: true, sms: false, push: false },
    frequency: 'instant',
    enabled: true
  },
  {
    eventType: 'purchase-order-approved',
    channels: { email: true, inApp: true, sms: false, push: false },
    frequency: 'instant',
    enabled: true
  },
  {
    eventType: 'goods-received',
    channels: { email: true, inApp: true, sms: false, push: false },
    frequency: 'instant',
    enabled: true
  },
  {
    eventType: 'invoice-received',
    channels: { email: true, inApp: true, sms: false, push: false },
    frequency: 'daily',
    enabled: true
  },
  {
    eventType: 'payment-due',
    channels: { email: true, inApp: true, sms: true, push: true },
    frequency: 'instant',
    enabled: true
  },
  {
    eventType: 'low-stock-alert',
    channels: { email: true, inApp: true, sms: false, push: true },
    frequency: 'daily',
    enabled: true
  },
  {
    eventType: 'stock-count-required',
    channels: { email: true, inApp: true, sms: false, push: true },
    frequency: 'instant',
    enabled: true
  },
  {
    eventType: 'workflow-assignment',
    channels: { email: true, inApp: true, sms: false, push: true },
    frequency: 'instant',
    enabled: true
  },
  {
    eventType: 'comment-mention',
    channels: { email: false, inApp: true, sms: false, push: true },
    frequency: 'instant',
    enabled: true
  },
  {
    eventType: 'document-shared',
    channels: { email: true, inApp: true, sms: false, push: false },
    frequency: 'instant',
    enabled: true
  },
  {
    eventType: 'price-update',
    channels: { email: true, inApp: true, sms: false, push: false },
    frequency: 'daily',
    enabled: true
  },
  {
    eventType: 'vendor-update',
    channels: { email: true, inApp: true, sms: false, push: false },
    frequency: 'daily',
    enabled: true
  },
  {
    eventType: 'system-maintenance',
    channels: { email: true, inApp: true, sms: true, push: true },
    frequency: 'instant',
    enabled: true
  },
  {
    eventType: 'security-alert',
    channels: { email: true, inApp: true, sms: true, push: true },
    frequency: 'instant',
    enabled: true
  }
];

// ====== DEFAULT NOTIFICATION SETTINGS ======

export const mockNotificationSettings: NotificationSettings = {
  preferences: mockNotificationPreferences,
  emailDigest: {
    enabled: false,
    frequency: 'daily',
    time: '08:00' // 8:00 AM
  },
  doNotDisturb: {
    enabled: false,
    startTime: '22:00', // 10:00 PM
    endTime: '07:00', // 7:00 AM
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
  },
  soundEnabled: true,
  desktopNotifications: true
};

// ====== DEFAULT VIEWS ======

export const mockDefaultViews: DefaultViews = {
  landingPage: '/dashboard',
  listPageSize: 25,
  defaultFilterView: 'all',
  dashboardWidgets: [
    'recent-purchase-requests',
    'pending-approvals',
    'low-stock-items',
    'upcoming-payments'
  ],
  favoritePages: [
    '/procurement/purchase-requests',
    '/procurement/purchase-orders',
    '/inventory-management/stock-overview',
    '/vendor-management/vendors'
  ]
};

// ====== DEFAULT ACCESSIBILITY SETTINGS ======

export const mockAccessibilitySettings: AccessibilitySettings = {
  screenReaderOptimized: false,
  keyboardNavigationHints: false,
  focusIndicatorEnhanced: false,
  reduceMotion: false,
  audioDescriptions: false
};

// ====== DEFAULT USER PREFERENCES ======

export const mockUserPreferences: UserPreferences = {
  id: 'pref-001',
  userId: 'user-001',
  display: mockDisplaySettings,
  regional: mockRegionalSettings,
  notifications: mockNotificationSettings,
  defaultViews: mockDefaultViews,
  accessibility: mockAccessibilitySettings,
  updatedAt: new Date(),
  createdAt: new Date()
};

// ====== DEFAULT COMPANY SETTINGS ======

export const mockCompanySettings: CompanySettings = {
  id: 'company-001',

  // Basic Information
  companyName: 'Carmen Hospitality Group',
  legalName: 'Carmen Hospitality Group Ltd.',
  taxId: 'TAX-123456789',
  registrationNumber: 'REG-987654321',

  // Contact Information
  address: {
    street: '123 Hospitality Boulevard',
    city: 'New York',
    state: 'NY',
    postalCode: '10001',
    country: 'United States'
  },
  phone: '+1-555-0100',
  email: 'info@carmenhospitality.com',
  website: 'https://www.carmenhospitality.com',

  // Branding
  logo: {
    url: '/logos/carmen-logo.svg',
    darkUrl: '/logos/carmen-logo-dark.svg',
    faviconUrl: '/favicon.ico'
  },
  primaryColor: '#2563EB', // Blue
  secondaryColor: '#10B981', // Green

  // Business Settings
  industry: 'Hospitality & Food Service',
  fiscalYearStart: '01-01', // January 1st
  defaultCurrency: 'USD',
  defaultTimezone: 'America/New_York',
  defaultLanguage: 'en',

  // Operating Hours
  operatingHours: {
    monday: { open: true, start: '06:00', end: '23:00' },
    tuesday: { open: true, start: '06:00', end: '23:00' },
    wednesday: { open: true, start: '06:00', end: '23:00' },
    thursday: { open: true, start: '06:00', end: '23:00' },
    friday: { open: true, start: '06:00', end: '23:00' },
    saturday: { open: true, start: '07:00', end: '22:00' },
    sunday: { open: true, start: '07:00', end: '22:00' }
  },

  // Multi-location/Department
  multiLocation: true,
  multiDepartment: true,

  updatedAt: new Date(),
  updatedBy: 'system',
  createdAt: new Date()
};

// ====== DEFAULT SECURITY SETTINGS ======

export const mockSecuritySettings: SecuritySettings = {
  id: 'security-001',

  passwordPolicy: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventReuse: 5,
    historyCount: 5,
    expiryDays: 90,
    complexityScore: 3
  },

  sessionSettings: {
    timeout: 30, // 30 minutes
    maxConcurrentSessions: 3,
    rememberMeEnabled: true,
    rememberMe: true,
    rememberMeDuration: 30, // 30 days
    absoluteTimeout: false
  },

  twoFactor: {
    enabled: true,
    required: false,
    requiredForRoles: ['system-admin', 'financial-manager'],
    methods: ['authenticator', 'sms', 'email'],
    gracePeriodDays: 7
  },

  ipAccessControl: {
    enabled: false,
    whitelist: [],
    blacklist: [],
    allowVPN: true
  },

  loginAttempts: {
    maxAttempts: 5,
    lockoutDuration: 15, // 15 minutes
    resetAfter: 60, // 60 minutes
    notifyAdmin: true
  },

  securityQuestions: {
    enabled: true,
    required: false,
    minRequired: 3
  },

  auditLogging: {
    enabled: true,
    events: ['login', 'logout', 'dataAccess', 'dataModification', 'settingsChange'],
    retentionDays: 365 // 1 year
  },

  dataEncryption: {
    atRest: true,
    inTransit: true,
    algorithm: 'AES-256'
  },

  updatedAt: new Date(),
  updatedBy: 'system',
  createdAt: new Date()
};

// ====== DEFAULT APPLICATION SETTINGS ======

export const mockApplicationSettings: ApplicationSettings = {
  id: 'app-001',

  email: {
    enabled: true,
    provider: 'smtp',
    smtp: {
      host: 'smtp.example.com',
      port: 587,
      secure: true,
      username: 'noreply@carmenhospitality.com',
      password: 'encrypted-password'
    },
    fromEmail: 'noreply@carmenhospitality.com',
    fromName: 'Carmen Hospitality System',
    replyToEmail: 'support@carmenhospitality.com',
    maxRetries: 3,
    retryDelay: 60, // 60 seconds
    batchSize: 50,
    useCustomTemplates: true,
    templatePath: '/email-templates'
  },

  backup: {
    enabled: true,
    schedule: {
      frequency: 'daily',
      time: '02:00', // 2:00 AM
      dayOfWeek: undefined,
      dayOfMonth: undefined
    },
    retention: {
      keepDaily: 7, // 7 days
      keepWeekly: 4, // 4 weeks
      keepMonthly: 12 // 12 months
    },
    storage: {
      type: 's3',
      path: 's3://carmen-backups/production',
      encrypted: true
    },
    includeAttachments: true,
    compressionEnabled: true,
    notifyOnComplete: true,
    notifyOnFailure: true
  },

  dataRetention: {
    documents: {
      purchaseRequests: 2555, // 7 years
      purchaseOrders: 2555,
      invoices: 2555,
      receipts: 2555
    },
    logs: {
      auditLogs: 365, // 1 year
      systemLogs: 90, // 3 months
      errorLogs: 180 // 6 months
    },
    archived: {
      autoArchiveAfter: 365, // 1 year
      deleteArchivedAfter: 1825 // 5 years
    }
  },

  integrations: {
    api: {
      enabled: true,
      rateLimiting: {
        enabled: true,
        requestsPerMinute: 60,
        requestsPerHour: 1000
      },
      allowedOrigins: [
        'https://carmenhospitality.com',
        'https://app.carmenhospitality.com',
        'https://admin.carmenhospitality.com'
      ]
    },
    webhooks: {
      enabled: true,
      endpoints: [
        {
          url: 'https://api.example.com/webhooks/carmen',
          events: ['purchase-order-approved', 'invoice-received'],
          secret: 'webhook-secret-key',
          enabled: true
        }
      ]
    },
    thirdParty: {
      posSystem: {
        enabled: true,
        provider: 'Oracle Micros',
        apiKey: 'encrypted-pos-api-key',
        syncInterval: 15 // 15 minutes
      },
      accounting: {
        enabled: false,
        provider: '',
        apiKey: '',
        syncInterval: 60 // 60 minutes
      }
    }
  },

  features: {
    maintenanceMode: false,
    registrationEnabled: false,
    guestAccessEnabled: false,
    apiAccessEnabled: true
  },

  performance: {
    cacheEnabled: true,
    cacheTTL: 3600, // 1 hour
    sessionStorage: 'redis',
    compressionEnabled: true
  },

  updatedAt: new Date(),
  updatedBy: 'system',
  createdAt: new Date()
};

// ====== SYSTEM NOTIFICATION SETTINGS (Admin Level) ======

// Email Templates for all event types
export const mockEmailTemplates: EmailTemplate[] = [
  {
    id: 'template-001',
    eventType: 'purchase-request-submitted',
    name: 'Purchase Request Submitted',
    description: 'Notification sent when a new purchase request is submitted',
    language: 'en',
    subject: 'New Purchase Request #{{requestId}} Submitted',
    htmlTemplate: `
      <html>
        <body>
          <h2>New Purchase Request Submitted</h2>
          <p>Hello {{recipientName}},</p>
          <p>A new purchase request has been submitted and requires your attention.</p>
          <div style="background: #f5f5f5; padding: 15px; margin: 20px 0;">
            <strong>Request Details:</strong><br/>
            Request ID: {{requestId}}<br/>
            Submitted By: {{submitterName}}<br/>
            Department: {{department}}<br/>
            Total Amount: {{totalAmount}}<br/>
            Items: {{itemCount}}<br/>
            Urgency: {{urgency}}
          </div>
          <p><a href="{{actionUrl}}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Request</a></p>
        </body>
      </html>
    `,
    textTemplate: `New Purchase Request Submitted\n\nHello {{recipientName}},\n\nA new purchase request has been submitted.\n\nRequest ID: {{requestId}}\nSubmitted By: {{submitterName}}\nDepartment: {{department}}\nTotal Amount: {{totalAmount}}\n\nView: {{actionUrl}}`,
    variables: [
      { name: 'recipientName', description: 'Recipient name', example: 'John Doe', required: true },
      { name: 'requestId', description: 'Purchase request ID', example: 'PR-2410-001', required: true },
      { name: 'submitterName', description: 'Person who submitted', example: 'Jane Smith', required: true },
      { name: 'department', description: 'Department name', example: 'Kitchen', required: false },
      { name: 'totalAmount', description: 'Total request amount', example: '$1,234.56', required: true },
      { name: 'itemCount', description: 'Number of items', example: '5', required: false },
      { name: 'urgency', description: 'Urgency level', example: 'High', required: false },
      { name: 'actionUrl', description: 'Link to view request', example: 'https://app.com/pr/123', required: true }
    ],
    version: 1,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    updatedBy: 'system'
  },
  {
    id: 'template-002',
    eventType: 'payment-due',
    name: 'Payment Due Reminder',
    description: 'Reminder sent when payment is due soon',
    language: 'en',
    subject: 'Payment Due: Invoice #{{invoiceId}} - Due {{dueDate}}',
    htmlTemplate: `
      <html>
        <body>
          <h2 style="color: #dc2626;">Payment Due Reminder</h2>
          <p>Hello {{recipientName}},</p>
          <p>This is a reminder that payment for the following invoice is due {{dueIn}}.</p>
          <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
            <strong>Invoice Details:</strong><br/>
            Invoice ID: {{invoiceId}}<br/>
            Vendor: {{vendorName}}<br/>
            Amount Due: {{amount}}<br/>
            Due Date: {{dueDate}}<br/>
            Status: {{status}}
          </div>
          <p><a href="{{actionUrl}}" style="background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Process Payment</a></p>
        </body>
      </html>
    `,
    textTemplate: `Payment Due Reminder\n\nHello {{recipientName}},\n\nPayment is due {{dueIn}}.\n\nInvoice: {{invoiceId}}\nVendor: {{vendorName}}\nAmount: {{amount}}\nDue Date: {{dueDate}}\n\nProcess: {{actionUrl}}`,
    variables: [
      { name: 'recipientName', description: 'Recipient name', example: 'John Doe', required: true },
      { name: 'invoiceId', description: 'Invoice number', example: 'INV-2410-001', required: true },
      { name: 'vendorName', description: 'Vendor name', example: 'Acme Supplies', required: true },
      { name: 'amount', description: 'Amount due', example: '$5,000.00', required: true },
      { name: 'dueDate', description: 'Payment due date', example: 'Jan 15, 2024', required: true },
      { name: 'dueIn', description: 'Time until due', example: 'in 3 days', required: true },
      { name: 'status', description: 'Payment status', example: 'Pending', required: false },
      { name: 'actionUrl', description: 'Link to process payment', example: 'https://app.com/invoice/123', required: true }
    ],
    version: 1,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    updatedBy: 'system'
  }
];

// Delivery Settings
export const mockDeliverySettings: DeliverySettings = {
  rateLimiting: {
    enabled: true,
    perUserPerHour: 50,
    organizationPerHour: 5000
  },
  retryPolicy: {
    maxRetries: 3,
    initialDelaySeconds: 60,
    backoffMultiplier: 2
  },
  batching: {
    enabled: true,
    windowMinutes: 5,
    maxBatchSize: 100
  },
  channels: {
    email: { enabled: true, quotaPerDay: 10000 },
    sms: { enabled: false, quotaPerDay: 1000, provider: 'twilio', apiKey: '' },
    push: { enabled: true, quotaPerDay: 50000 },
    webhook: { enabled: true, endpoints: [] }
  }
};

// Role-based notification defaults
export const mockRoleNotificationDefaults: RoleNotificationDefaults[] = [
  {
    roleId: 'role-002',
    roleName: 'General Manager',
    eventDefaults: mockNotificationPreferences.filter(p =>
      ['purchase-request-submitted', 'payment-due', 'security-alert', 'system-maintenance'].includes(p.eventType)
    )
  },
  {
    roleId: 'role-008',
    roleName: 'Financial Manager',
    eventDefaults: mockNotificationPreferences.filter(p =>
      ['payment-due', 'invoice-received'].includes(p.eventType)
    ).map(p => ({ ...p, channels: { ...p.channels, email: true, sms: true } }))
  }
];

// Notification routing rules
export const mockRoutingRules: NotificationRoutingRule[] = [
  {
    id: 'rule-001',
    name: 'High Value PO Escalation',
    eventType: 'purchase-order-created',
    conditions: [
      { field: 'totalAmount', operator: 'greaterThan', value: 10000 }
    ],
    actions: [
      {
        type: 'notify',
        recipientType: 'role',
        recipient: 'role-002', // General Manager
        channels: ['email', 'sms']
      }
    ],
    priority: 1,
    enabled: true
  }
];

// Escalation policies
export const mockEscalationPolicies: EscalationPolicy[] = [
  {
    id: 'escalation-001',
    name: 'Payment Due Escalation',
    description: 'Escalates overdue payments through finance team hierarchy',
    eventType: 'payment-due',
    stages: [
      {
        level: 1,
        delayMinutes: 0,
        recipientRole: 'role-018', // Accountant
        channels: ['email', 'in-app'],
        condition: 'unacknowledged'
      },
      {
        level: 2,
        delayMinutes: 1440, // 24 hours
        recipientRole: 'role-008', // Financial Manager
        channels: ['email', 'sms', 'in-app'],
        condition: 'unacknowledged'
      },
      {
        level: 3,
        delayMinutes: 2880, // 48 hours
        recipientRole: 'role-003', // Finance Director
        channels: ['email', 'sms', 'push'],
        condition: 'unresolved'
      }
    ],
    enabled: true
  },
  {
    id: 'escalation-002',
    name: 'High Value PO Approval',
    description: 'Escalates high-value purchase orders requiring senior approval',
    eventType: 'purchase-order-created',
    stages: [
      {
        level: 1,
        delayMinutes: 0,
        recipientRole: 'role-005', // Department Manager
        channels: ['email', 'in-app'],
        condition: 'unacknowledged'
      },
      {
        level: 2,
        delayMinutes: 480, // 8 hours
        recipientRole: 'role-002', // General Manager
        channels: ['email', 'sms'],
        condition: 'unacknowledged'
      },
      {
        level: 3,
        delayMinutes: 1440, // 24 hours
        recipientRole: 'role-001', // CEO/Owner
        channels: ['email', 'sms', 'push'],
        condition: 'unresolved'
      }
    ],
    enabled: true
  },
  {
    id: 'escalation-003',
    name: 'Security Alert Escalation',
    description: 'Critical security alerts escalated to IT leadership',
    eventType: 'security-alert',
    stages: [
      {
        level: 1,
        delayMinutes: 0,
        recipientRole: 'role-017', // IT Support
        channels: ['email', 'sms', 'push'],
        condition: 'unacknowledged'
      },
      {
        level: 2,
        delayMinutes: 60, // 1 hour
        recipientRole: 'role-002', // General Manager
        channels: ['email', 'sms', 'push'],
        condition: 'unacknowledged'
      },
      {
        level: 3,
        delayMinutes: 180, // 3 hours
        recipientRole: 'role-001', // CEO/Owner
        channels: ['email', 'sms', 'push'],
        condition: 'unresolved'
      }
    ],
    enabled: true
  }
];

// Notification history logs (sample data)
export const mockNotificationLogs: NotificationLog[] = [
  {
    id: 'log-001',
    timestamp: new Date('2024-10-21T08:30:00'),
    eventType: 'purchase-request-submitted',
    recipientId: 'user-002',
    recipientEmail: 'manager@carmen.com',
    channel: 'email',
    status: 'sent',
    templateId: 'template-001',
    metadata: { requestId: 'PR-2410-123' },
    retryCount: 0,
    sentAt: new Date('2024-10-21T08:30:00'),
    recipient: 'manager@carmen.com',
    subject: 'New Purchase Request #PR-2410-123 Submitted',
    attempts: 1,
    maxAttempts: 3
  },
  {
    id: 'log-002',
    timestamp: new Date('2024-10-21T09:15:00'),
    eventType: 'payment-due',
    recipientId: 'user-003',
    recipientEmail: 'finance@carmen.com',
    channel: 'email',
    status: 'sent',
    templateId: 'template-002',
    metadata: { invoiceId: 'INV-2410-456' },
    retryCount: 0,
    sentAt: new Date('2024-10-21T09:15:00'),
    recipient: 'finance@carmen.com',
    subject: 'Payment Due: Invoice #INV-2410-456',
    attempts: 1,
    maxAttempts: 3
  },
  {
    id: 'log-003',
    timestamp: new Date('2024-10-21T10:00:00'),
    eventType: 'low-stock-alert',
    recipientId: 'user-006',
    recipientEmail: 'warehouse@carmen.com',
    channel: 'email',
    status: 'failed',
    templateId: 'template-003',
    metadata: { itemId: 'ITEM-789' },
    retryCount: 2,
    errorMessage: 'SMTP connection timeout',
    sentAt: new Date('2024-10-21T10:00:00'),
    recipient: 'warehouse@carmen.com',
    subject: 'Low Stock Alert: Item #ITEM-789',
    attempts: 3,
    maxAttempts: 3
  },
  {
    id: 'log-004',
    timestamp: new Date('2024-10-21T11:30:00'),
    eventType: 'purchase-request-approved',
    recipientId: 'user-007',
    recipientEmail: 'purchasing@carmen.com',
    channel: 'in-app',
    status: 'sent',
    templateId: 'template-004',
    metadata: { requestId: 'PR-2410-124' },
    retryCount: 0,
    sentAt: new Date('2024-10-21T11:30:00'),
    recipient: 'purchasing@carmen.com',
    subject: 'Purchase Request #PR-2410-124 Approved',
    attempts: 1,
    maxAttempts: 3
  },
  {
    id: 'log-005',
    timestamp: new Date('2024-10-21T12:45:00'),
    eventType: 'vendor-update',
    recipientId: 'user-008',
    recipientEmail: 'procurement@carmen.com',
    channel: 'sms',
    status: 'sent',
    templateId: 'template-005',
    metadata: { vendorId: 'VEN-001', daysRemaining: 30 },
    retryCount: 0,
    sentAt: new Date('2024-10-21T12:45:00'),
    recipient: '+1234567890',
    subject: 'Vendor Contract Expiring in 30 Days',
    attempts: 1,
    maxAttempts: 3
  },
  {
    id: 'log-006',
    timestamp: new Date('2024-10-21T13:00:00'),
    eventType: 'security-alert',
    recipientId: 'user-001',
    recipientEmail: 'admin@carmen.com',
    channel: 'push',
    status: 'sent',
    templateId: 'template-006',
    metadata: { alertType: 'unauthorized-access', ip: '192.168.1.100' },
    retryCount: 0,
    sentAt: new Date('2024-10-21T13:00:00'),
    recipient: 'admin@carmen.com',
    subject: 'Security Alert: Unauthorized Access Attempt',
    attempts: 1,
    maxAttempts: 3
  },
  {
    id: 'log-007',
    timestamp: new Date('2024-10-21T14:15:00'),
    eventType: 'invoice-received',
    recipientId: 'user-003',
    recipientEmail: 'finance@carmen.com',
    channel: 'email',
    status: 'sent',
    templateId: 'template-007',
    metadata: { invoiceId: 'INV-2410-457', vendorId: 'VEN-002' },
    retryCount: 0,
    sentAt: new Date('2024-10-21T14:15:00'),
    recipient: 'finance@carmen.com',
    subject: 'New Invoice Received: #INV-2410-457',
    attempts: 1,
    maxAttempts: 3
  },
  {
    id: 'log-008',
    timestamp: new Date('2024-10-21T15:30:00'),
    eventType: 'purchase-order-created',
    recipientId: 'user-009',
    recipientEmail: 'vendor@supplier.com',
    channel: 'email',
    status: 'sent',
    templateId: 'template-008',
    metadata: { orderId: 'PO-2410-001', totalAmount: 15000 },
    retryCount: 0,
    sentAt: new Date('2024-10-21T15:30:00'),
    recipient: 'vendor@supplier.com',
    subject: 'Purchase Order #PO-2410-001 Created',
    attempts: 1,
    maxAttempts: 3
  },
  {
    id: 'log-009',
    timestamp: new Date('2024-10-21T16:00:00'),
    eventType: 'stock-count-required',
    recipientId: 'user-006',
    recipientEmail: 'warehouse@carmen.com',
    channel: 'in-app',
    status: 'sent',
    templateId: 'template-009',
    metadata: { countId: 'COUNT-2410-010', dueDate: '2024-10-25' },
    retryCount: 0,
    sentAt: new Date('2024-10-21T16:00:00'),
    recipient: 'warehouse@carmen.com',
    subject: 'Stock Count Due: COUNT-2410-010',
    attempts: 1,
    maxAttempts: 3
  },
  {
    id: 'log-010',
    timestamp: new Date('2024-10-21T16:30:00'),
    eventType: 'system-maintenance',
    recipientId: 'user-001',
    recipientEmail: 'admin@carmen.com',
    channel: 'email',
    status: 'failed',
    templateId: 'template-010',
    metadata: { maintenanceWindow: '2024-10-22 02:00-04:00' },
    retryCount: 1,
    errorMessage: 'Mailbox full',
    sentAt: new Date('2024-10-21T16:30:00'),
    recipient: 'admin@carmen.com',
    subject: 'Scheduled System Maintenance',
    attempts: 2,
    maxAttempts: 3
  }
];

// Complete system notification settings
export const mockSystemNotificationSettings: SystemNotificationSettings = {
  id: 'system-notifications-001',
  globalDefaults: mockNotificationPreferences,
  roleDefaults: mockRoleNotificationDefaults,
  emailTemplates: mockEmailTemplates,
  routingRules: mockRoutingRules,
  escalationPolicies: mockEscalationPolicies,
  deliverySettings: mockDeliverySettings,
  updatedAt: new Date(),
  updatedBy: 'system'
};
