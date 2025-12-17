# Settings - Technical Specification (TS)

**Module**: System Administration - Settings
**Version**: 1.0
**Last Updated**: 2025-01-16
**Status**: Active Development

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## 1. Module Structure

### 1.1 Directory Layout

```
app/(main)/system-administration/settings/
├── page.tsx                              # Main settings dashboard
├── company/
│   └── page.tsx                         # Company settings page
├── security/
│   └── page.tsx                         # Security settings page
├── notifications/
│   ├── page.tsx                         # Notification settings main page
│   └── components/
│       ├── global-defaults-tab.tsx      # Global notification defaults
│       ├── email-templates-tab.tsx      # Email template management
│       ├── delivery-settings-tab.tsx    # Delivery settings configuration
│       ├── routing-rules-tab.tsx        # Routing rules management
│       ├── notification-history-tab.tsx # Notification logs
│       └── testing-tab.tsx              # Testing tools
├── backup/                              # (Planned) Backup settings
│   └── page.tsx
├── appearance/                          # (Planned) System appearance
│   └── page.tsx
└── components/ (planned)
    ├── SettingsCard.tsx                 # Reusable settings card
    ├── SettingsSection.tsx              # Section container
    ├── ColorPicker.tsx                  # Color selection component
    ├── TimePicker.tsx                   # Time selection component
    ├── OperatingHoursEditor.tsx         # Operating hours configuration
    ├── TemplateEditor.tsx               # Email template editor
    ├── RuleBuilder.tsx                  # Notification rule builder
    └── NotificationTester.tsx           # Notification testing tool

lib/
├── types/
│   └── settings.ts                      # All settings TypeScript interfaces
├── mock-data/
│   └── settings.ts                      # Mock data for development
└── utils/
    ├── validation/
    │   └── settings-schemas.ts          # Zod validation schemas
    └── formatters/
        └── settings-formatters.ts       # Data formatting utilities
```

---

## 2. Component Architecture

### 2.1 Main Settings Dashboard

**File**: `app/(main)/system-administration/settings/page.tsx`

**Purpose**: Entry point for settings module with navigation cards to subsections

**Component Structure**:
```tsx
export default function SettingsPage() {
  return (
    <div>
      <PageHeader />
      <SettingsGrid>
        <SettingCard
          icon={Building}
          title="Company Settings"
          href="/system-administration/settings/company"
        />
        <SettingCard
          icon={Shield}
          title="Security Settings"
          href="/system-administration/settings/security"
        />
        <SettingCard
          icon={Bell}
          title="Notification Settings"
          href="/system-administration/settings/notifications"
        />
        {/* Additional setting cards */}
      </SettingsGrid>
    </div>
  );
}
```

**Key Features**:
- Grid layout with setting category cards
- Icon-based navigation
- Descriptive text for each category
- Responsive design (1-3 columns based on viewport)

---

### 2.2 Company Settings Page

**File**: `app/(main)/system-administration/settings/company/page.tsx`

**Purpose**: Configure company-wide settings including branding, contact info, and operational parameters

**Component Structure**:
```tsx
'use client';

export default function CompanySettingsPage() {
  const [settings, setSettings] = useState<CompanySettings>(mockCompanySettings);
  const [activeTab, setActiveTab] = useState('general');

  return (
    <div className="px-9 pt-9 pb-6">
      <PageHeader onSave={handleSave} />
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General Information</TabsTrigger>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="operational">Operational Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <GeneralInformationForm />
        </TabsContent>

        <TabsContent value="branding">
          <BrandingForm />
        </TabsContent>

        <TabsContent value="operational">
          <OperationalSettingsForm />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

**State Management**:
```tsx
// Local state for form data
const [settings, setSettings] = useState<CompanySettings>(mockCompanySettings);

// Nested state updates
const handleBasicInfoChange = (field: keyof CompanySettings, value: any) => {
  setSettings({
    ...settings,
    [field]: value
  });
};

// Deep nested updates (address)
const handleAddressChange = (field: keyof Address, value: string) => {
  setSettings({
    ...settings,
    address: {
      ...settings.address,
      [field]: value
    }
  });
};
```

**Form Validation** (Planned):
```tsx
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { companySettingsSchema } from '@/lib/utils/validation/settings-schemas';

const form = useForm<CompanySettings>({
  resolver: zodResolver(companySettingsSchema),
  defaultValues: mockCompanySettings
});
```

**Tabs**:
1. **General Information**:
   - Company name, legal name, tax ID, registration number
   - Contact information (address, phone, email, website)
   - Default currency, timezone, language

2. **Branding**:
   - Logo uploads (light mode, dark mode, favicon)
   - Color pickers for primary and secondary brand colors
   - Preview of branding elements

3. **Operational Settings**:
   - Fiscal year start date
   - Operating hours editor (per day of week)
   - Multi-location and multi-department toggles

---

### 2.3 Security Settings Page

**File**: `app/(main)/system-administration/settings/security/page.tsx`

**Purpose**: Configure comprehensive security policies

**Component Structure**:
```tsx
'use client';

export default function SecuritySettingsPage() {
  const [settings, setSettings] = useState<SecuritySettings>(mockSecuritySettings);
  const [activeTab, setActiveTab] = useState('password');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        <TabsTrigger value="password">Password Policy</TabsTrigger>
        <TabsTrigger value="authentication">Authentication</TabsTrigger>
        <TabsTrigger value="access">Access Control</TabsTrigger>
        <TabsTrigger value="audit">Audit & Logging</TabsTrigger>
      </TabsList>

      {/* Tab content with security settings forms */}
    </Tabs>
  );
}
```

**Key Components**:

**Password Policy Tab**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Password Requirements</CardTitle>
    <Badge variant={passwordStrength.color}>
      {passwordStrength.label} Policy
    </Badge>
  </CardHeader>
  <CardContent>
    <Slider
      value={[settings.passwordPolicy.minLength]}
      onValueChange={([value]) => handlePasswordPolicyChange('minLength', value)}
      min={6}
      max={32}
    />
    <Switch
      checked={settings.passwordPolicy.requireUppercase}
      onCheckedChange={(checked) => handlePasswordPolicyChange('requireUppercase', checked)}
    />
    {/* Additional password requirement toggles */}
  </CardContent>
</Card>
```

**Dynamic Password Strength Indicator**:
```tsx
const getPasswordStrength = () => {
  const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars } = settings.passwordPolicy;
  let strength = 0;
  if (minLength >= 12) strength += 2;
  else if (minLength >= 8) strength += 1;
  if (requireUppercase) strength += 1;
  if (requireLowercase) strength += 1;
  if (requireNumbers) strength += 1;
  if (requireSpecialChars) strength += 1;

  if (strength <= 2) return { label: "Weak", color: "destructive" };
  if (strength <= 4) return { label: "Medium", color: "warning" };
  return { label: "Strong", color: "success" };
};
```

**Tabs**:
1. **Password Policy**: Min length, complexity requirements, expiry, history
2. **Authentication**: 2FA settings, session management, login security
3. **Access Control**: IP whitelisting, security questions
4. **Audit & Logging**: Audit logging settings, data encryption

---

### 2.4 Notification Settings Page

**File**: `app/(main)/system-administration/settings/notifications/page.tsx`

**Purpose**: Configure system-wide notification preferences, templates, and routing

**Component Structure**:
```tsx
'use client';

export default function NotificationSettingsPage() {
  const [activeTab, setActiveTab] = useState('defaults');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-6">
        <TabsTrigger value="defaults">Defaults</TabsTrigger>
        <TabsTrigger value="templates">Templates</TabsTrigger>
        <TabsTrigger value="delivery">Delivery</TabsTrigger>
        <TabsTrigger value="routing">Routing</TabsTrigger>
        <TabsTrigger value="history">History</TabsTrigger>
        <TabsTrigger value="testing">Testing</TabsTrigger>
      </TabsList>

      <TabsContent value="defaults">
        <GlobalDefaultsTab />
      </TabsContent>

      <TabsContent value="templates">
        <EmailTemplatesTab />
      </TabsContent>

      {/* Additional tabs */}
    </Tabs>
  );
}
```

**Sub-Components**:

**EmailTemplatesTab Component**:
```tsx
export function EmailTemplatesTab() {
  const [templates, setTemplates] = useState<EmailTemplate[]>(mockEmailTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Template list */}
      <div>
        <TemplateList
          templates={templates}
          onSelect={setSelectedTemplate}
        />
      </div>

      {/* Template editor */}
      <div>
        {selectedTemplate && (
          <TemplateEditor
            template={selectedTemplate}
            isEditing={isEditing}
            onSave={handleSave}
            onPreview={handlePreview}
          />
        )}
      </div>
    </div>
  );
}
```

**RoutingRulesTab Component**:
```tsx
export function RoutingRulesTab() {
  const [rules, setRules] = useState<NotificationRoutingRule[]>(mockRoutingRules);

  return (
    <div>
      <RuleBuilder
        onCreateRule={handleCreateRule}
      />
      <RulesList
        rules={rules}
        onEdit={handleEditRule}
        onToggle={handleToggleRule}
        onDelete={handleDeleteRule}
      />
    </div>
  );
}
```

**Tabs**:
1. **Defaults**: Global notification preferences per event type
2. **Templates**: Email template CRUD with HTML/text versions
3. **Delivery**: Rate limiting, retry policy, batching configuration
4. **Routing**: Conditional routing rules for notifications
5. **History**: Notification logs with filtering and search
6. **Testing**: Send test notifications, preview templates

---

## 3. State Management

### 3.1 Current Implementation (Mock Data)

**Pattern**: Local component state with useState

```tsx
import { mockCompanySettings } from '@/lib/mock-data';

const [settings, setSettings] = useState<CompanySettings>(mockCompanySettings);

// Simple updates
const handleChange = (field: keyof CompanySettings, value: any) => {
  setSettings({ ...settings, [field]: value });
};

// Nested updates
const handleNestedChange = (parent: string, field: string, value: any) => {
  setSettings({
    ...settings,
    [parent]: {
      ...settings[parent],
      [field]: value
    }
  });
};
```

**Limitations**:
- No persistence across page refreshes
- No optimistic updates
- No caching or invalidation
- No loading/error states

---

### 3.2 Planned Implementation (React Query + Server Actions)

**Server Actions** (`app/(main)/system-administration/settings/actions.ts`):

```tsx
'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { companySettingsSchema } from '@/lib/utils/validation/settings-schemas';

export async function updateCompanySettings(data: CompanySettings) {
  try {
    // Validate input
    const validated = companySettingsSchema.parse(data);

    // Update database
    const updated = await prisma.companySettings.update({
      where: { id: validated.id },
      data: {
        companyName: validated.companyName,
        legalName: validated.legalName,
        // ... all fields
        updatedAt: new Date(),
        updatedBy: validated.updatedBy
      }
    });

    // Revalidate settings cache
    revalidatePath('/system-administration/settings/company');

    return { success: true, data: updated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update settings'
    };
  }
}

export async function getCompanySettings() {
  const settings = await prisma.companySettings.findFirst({
    orderBy: { updatedAt: 'desc' }
  });

  if (!settings) {
    throw new Error('Company settings not found');
  }

  return settings;
}
```

**React Query Integration**:

```tsx
'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCompanySettings, getCompanySettings } from './actions';

export function useCompanySettings() {
  const queryClient = useQueryClient();

  // Fetch settings
  const { data: settings, isLoading, error } = useQuery({
    queryKey: ['company-settings'],
    queryFn: getCompanySettings,
    staleTime: 5 * 60 * 1000 // 5 minutes
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateCompanySettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['company-settings'] });
      toast({
        title: 'Settings Updated',
        description: 'Company settings have been saved successfully.'
      });
    },
    onError: (error) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive'
      });
    }
  });

  return {
    settings,
    isLoading,
    error,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending
  };
}
```

**Component Usage**:

```tsx
export default function CompanySettingsPage() {
  const { settings, isLoading, updateSettings, isUpdating } = useCompanySettings();

  if (isLoading) return <SettingsSkeleton />;

  const handleSave = () => {
    updateSettings(settings);
  };

  return (
    <div>
      {/* Form components */}
      <Button onClick={handleSave} disabled={isUpdating}>
        {isUpdating ? 'Saving...' : 'Save Changes'}
      </Button>
    </div>
  );
}
```

---

### 3.3 Form State Management

**React Hook Form with Zod Validation**:

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const companySettingsSchema = z.object({
  companyName: z.string().min(1).max(100),
  legalName: z.string().min(1).max(100),
  taxId: z.string().regex(/^TAX-\d{9}$/),
  email: z.string().email(),
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  // ... all fields
});

export function CompanySettingsForm() {
  const form = useForm<CompanySettings>({
    resolver: zodResolver(companySettingsSchema),
    defaultValues: mockCompanySettings
  });

  const onSubmit = async (data: CompanySettings) => {
    const result = await updateCompanySettings(data);
    if (result.success) {
      toast({ title: 'Settings saved successfully' });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="companyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Company Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Additional form fields */}
      </form>
    </Form>
  );
}
```

---

## 4. Data Flow

### 4.1 Current Implementation (Mock Data Flow)

```
┌─────────────────────┐
│  Component Mount    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Load Mock Data from │
│ lib/mock-data       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Set Local State     │
│ (useState)          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ User Interactions   │
│ (form inputs)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Update Local State  │
│ (setState)          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Save Button Click   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Show Toast          │
│ (No Persistence)    │
└─────────────────────┘
```

---

### 4.2 Planned Implementation (Full Data Flow)

```
┌─────────────────────┐
│  Component Mount    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ React Query Fetch   │
│ (useQuery)          │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Server Action       │
│ (getSettings)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Prisma Query        │
│ (PostgreSQL)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Cache Result        │
│ (React Query)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Render Form         │
│ (React Hook Form)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ User Edits          │
│ (form state)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Client Validation   │
│ (Zod schema)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Submit Form         │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Mutation            │
│ (useMutation)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Server Action       │
│ (updateSettings)    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Server Validation   │
│ (Zod schema)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Prisma Update       │
│ (PostgreSQL)        │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Revalidate Path     │
│ (Next.js cache)     │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Invalidate Query    │
│ (React Query)       │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Show Success Toast  │
└─────────────────────┘
```

---

## 5. API Patterns

### 5.1 Server Actions (Planned)

**File Structure**:
```
app/(main)/system-administration/settings/
├── company/
│   └── actions.ts          # Company settings CRUD
├── security/
│   └── actions.ts          # Security settings CRUD
├── notifications/
│   └── actions.ts          # Notification settings CRUD
└── actions.ts              # Shared settings actions
```

**Company Settings Actions**:

```tsx
// app/(main)/system-administration/settings/company/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { companySettingsSchema } from '@/lib/utils/validation/settings-schemas';
import type { CompanySettings } from '@/lib/types/settings';

export async function getCompanySettings(): Promise<CompanySettings> {
  const settings = await prisma.companySettings.findFirst({
    orderBy: { updatedAt: 'desc' }
  });

  if (!settings) {
    throw new Error('Company settings not configured');
  }

  return settings;
}

export async function updateCompanySettings(data: CompanySettings) {
  try {
    const validated = companySettingsSchema.parse(data);

    const updated = await prisma.companySettings.update({
      where: { id: validated.id },
      data: {
        ...validated,
        updatedAt: new Date()
      }
    });

    revalidatePath('/system-administration/settings/company');

    return { success: true, data: updated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Update failed'
    };
  }
}

export async function uploadLogo(formData: FormData) {
  try {
    const file = formData.get('logo') as File;

    // Upload to storage (S3, etc.)
    const url = await uploadToStorage(file);

    // Update settings with logo URL
    const settings = await prisma.companySettings.update({
      where: { id: formData.get('settingsId') as string },
      data: {
        logo: {
          url,
          updatedAt: new Date()
        }
      }
    });

    revalidatePath('/system-administration/settings/company');

    return { success: true, url };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Upload failed'
    };
  }
}
```

**Security Settings Actions**:

```tsx
// app/(main)/system-administration/settings/security/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { securitySettingsSchema } from '@/lib/utils/validation/settings-schemas';
import type { SecuritySettings } from '@/lib/types/settings';

export async function getSecuritySettings(): Promise<SecuritySettings> {
  const settings = await prisma.securitySettings.findFirst({
    orderBy: { updatedAt: 'desc' }
  });

  if (!settings) {
    // Return default security settings
    return createDefaultSecuritySettings();
  }

  return settings;
}

export async function updateSecuritySettings(data: SecuritySettings) {
  try {
    const validated = securitySettingsSchema.parse(data);

    // Audit log for security changes
    await prisma.auditLog.create({
      data: {
        action: 'UPDATE_SECURITY_SETTINGS',
        userId: validated.updatedBy,
        changes: validated,
        timestamp: new Date()
      }
    });

    const updated = await prisma.securitySettings.update({
      where: { id: validated.id },
      data: {
        ...validated,
        updatedAt: new Date()
      }
    });

    revalidatePath('/system-administration/settings/security');

    return { success: true, data: updated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Update failed'
    };
  }
}

export async function testIPWhitelist(ipAddress: string) {
  const settings = await getSecuritySettings();

  if (!settings.ipAccessControl.enabled) {
    return { allowed: true, reason: 'IP control disabled' };
  }

  const isWhitelisted = settings.ipAccessControl.whitelist.some(
    pattern => matchIPPattern(ipAddress, pattern)
  );

  return {
    allowed: isWhitelisted,
    reason: isWhitelisted ? 'IP whitelisted' : 'IP not in whitelist'
  };
}
```

**Notification Settings Actions**:

```tsx
// app/(main)/system-administration/settings/notifications/actions.ts
'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { emailTemplateSchema, routingRuleSchema } from '@/lib/utils/validation/settings-schemas';
import type { EmailTemplate, NotificationRoutingRule } from '@/lib/types/settings';

export async function createEmailTemplate(data: EmailTemplate) {
  try {
    const validated = emailTemplateSchema.parse(data);

    const template = await prisma.emailTemplate.create({
      data: {
        ...validated,
        version: 1,
        isActive: true
      }
    });

    revalidatePath('/system-administration/settings/notifications');

    return { success: true, data: template };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Creation failed'
    };
  }
}

export async function updateEmailTemplate(id: string, data: Partial<EmailTemplate>) {
  try {
    const current = await prisma.emailTemplate.findUnique({ where: { id } });

    if (!current) {
      throw new Error('Template not found');
    }

    // Create new version if content changed
    const contentChanged =
      data.htmlTemplate !== current.htmlTemplate ||
      data.textTemplate !== current.textTemplate;

    const updated = await prisma.emailTemplate.update({
      where: { id },
      data: {
        ...data,
        version: contentChanged ? current.version + 1 : current.version,
        updatedAt: new Date()
      }
    });

    revalidatePath('/system-administration/settings/notifications');

    return { success: true, data: updated };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Update failed'
    };
  }
}

export async function testEmailTemplate(templateId: string, recipientEmail: string) {
  try {
    const template = await prisma.emailTemplate.findUnique({
      where: { id: templateId }
    });

    if (!template) {
      throw new Error('Template not found');
    }

    // Send test email using email service
    const result = await sendEmail({
      to: recipientEmail,
      subject: template.subject,
      html: template.htmlTemplate,
      text: template.textTemplate
    });

    return {
      success: true,
      messageId: result.messageId
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Test failed'
    };
  }
}

export async function createRoutingRule(data: NotificationRoutingRule) {
  try {
    const validated = routingRuleSchema.parse(data);

    const rule = await prisma.notificationRoutingRule.create({
      data: {
        ...validated,
        enabled: true
      }
    });

    revalidatePath('/system-administration/settings/notifications');

    return { success: true, data: rule };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Creation failed'
    };
  }
}

export async function toggleRoutingRule(id: string, enabled: boolean) {
  const rule = await prisma.notificationRoutingRule.update({
    where: { id },
    data: { enabled }
  });

  revalidatePath('/system-administration/settings/notifications');

  return { success: true, data: rule };
}
```

---

## 6. Validation Patterns

### 6.1 Client-Side Validation (Zod)

**File**: `lib/utils/validation/settings-schemas.ts`

```tsx
import { z } from 'zod';

// Company Settings Schema
export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  postalCode: z.string().min(1, 'Postal code is required').max(20),
  country: z.string().min(1, 'Country is required').max(100)
});

export const logoSchema = z.object({
  url: z.string().url('Invalid logo URL'),
  darkUrl: z.string().url('Invalid dark logo URL').optional(),
  faviconUrl: z.string().url('Invalid favicon URL').optional()
});

export const companySettingsSchema = z.object({
  id: z.string(),
  companyName: z.string().min(1).max(100),
  legalName: z.string().min(1).max(100),
  taxId: z.string().regex(/^[A-Z]{3}-\d{9}$/, 'Invalid tax ID format'),
  registrationNumber: z.string().min(1).max(50),
  address: addressSchema,
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'),
  email: z.string().email('Invalid email address'),
  website: z.string().url('Invalid website URL'),
  logo: logoSchema,
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Invalid hex color'),
  fiscalYearStart: z.string().regex(/^\d{2}-\d{2}$/, 'Format: MM-DD'),
  defaultCurrency: z.string().length(3, 'Must be 3-letter code'),
  defaultTimezone: z.string().min(1),
  defaultLanguage: z.enum(['en', 'es', 'fr', 'de', 'ja', 'zh', 'pt', 'it', 'ru']),
  operatingHours: z.record(
    z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    z.object({
      open: z.boolean(),
      start: z.string().regex(/^\d{2}:\d{2}$/, 'Format: HH:mm'),
      end: z.string().regex(/^\d{2}:\d{2}$/, 'Format: HH:mm')
    })
  ),
  multiLocation: z.boolean(),
  multiDepartment: z.boolean(),
  updatedAt: z.date(),
  updatedBy: z.string(),
  createdAt: z.date()
});

// Security Settings Schema
export const passwordPolicySchema = z.object({
  minLength: z.number().int().min(6).max(128),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumbers: z.boolean(),
  requireSpecialChars: z.boolean(),
  preventReuse: z.number().int().min(0).max(24),
  historyCount: z.number().int().min(0).max(24),
  expiryDays: z.number().int().min(0).max(365),
  complexityScore: z.number().int().min(0).max(4)
});

export const sessionSettingsSchema = z.object({
  timeout: z.number().int().min(5).max(480),
  maxConcurrentSessions: z.number().int().min(1).max(10),
  rememberMeEnabled: z.boolean(),
  rememberMe: z.boolean(),
  rememberMeDuration: z.number().int().min(1).max(90),
  absoluteTimeout: z.boolean()
});

export const twoFactorSettingsSchema = z.object({
  enabled: z.boolean(),
  required: z.boolean(),
  requiredForRoles: z.array(z.string()),
  methods: z.array(z.enum(['authenticator', 'sms', 'email'])).min(1),
  gracePeriodDays: z.number().int().min(0).max(30)
});

export const securitySettingsSchema = z.object({
  id: z.string(),
  passwordPolicy: passwordPolicySchema,
  sessionSettings: sessionSettingsSchema,
  twoFactor: twoFactorSettingsSchema,
  ipAccessControl: z.object({
    enabled: z.boolean(),
    whitelist: z.array(z.string()),
    blacklist: z.array(z.string()),
    allowVPN: z.boolean()
  }),
  loginAttempts: z.object({
    maxAttempts: z.number().int().min(3).max(10),
    lockoutDuration: z.number().int().min(5).max(1440),
    resetAfter: z.number().int().min(15).max(1440),
    notifyAdmin: z.boolean()
  }),
  securityQuestions: z.object({
    enabled: z.boolean(),
    required: z.boolean(),
    minRequired: z.number().int().min(1).max(5)
  }),
  auditLogging: z.object({
    enabled: z.boolean(),
    events: z.array(z.enum(['login', 'logout', 'dataAccess', 'dataModification', 'settingsChange'])),
    retentionDays: z.number().int().min(30).max(3650)
  }),
  dataEncryption: z.object({
    atRest: z.boolean(),
    inTransit: z.boolean(),
    algorithm: z.string().optional()
  }),
  updatedAt: z.date(),
  updatedBy: z.string(),
  createdAt: z.date()
});

// Email Template Schema
export const emailTemplateVariableSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().min(1).max(200),
  example: z.string().min(1).max(100),
  required: z.boolean()
});

export const emailTemplateSchema = z.object({
  id: z.string(),
  eventType: z.string(),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  language: z.enum(['en', 'es', 'fr', 'de', 'ja', 'zh', 'pt', 'it', 'ru']),
  subject: z.string().min(1).max(200),
  htmlTemplate: z.string().min(1),
  textTemplate: z.string().min(1),
  variables: z.array(emailTemplateVariableSchema),
  version: z.number().int().positive(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
  updatedBy: z.string()
});

// Routing Rule Schema
export const routingRuleConditionSchema = z.object({
  field: z.string().min(1),
  operator: z.enum(['equals', 'greaterThan', 'lessThan', 'contains', 'in']),
  value: z.union([z.string(), z.number(), z.boolean()])
});

export const routingRuleActionSchema = z.object({
  type: z.enum(['notify', 'escalate', 'skip']),
  recipientType: z.enum(['user', 'role', 'department', 'webhook']),
  recipient: z.string(),
  channels: z.array(z.enum(['email', 'in-app', 'sms', 'push']))
});

export const routingRuleSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(100),
  eventType: z.string(),
  conditions: z.array(routingRuleConditionSchema).min(1),
  actions: z.array(routingRuleActionSchema).min(1),
  priority: z.number().int().min(1).max(100),
  enabled: z.boolean()
});
```

---

### 6.2 Server-Side Validation

**Same Zod schemas used for server-side validation in server actions**

```tsx
export async function updateCompanySettings(data: CompanySettings) {
  try {
    // Server-side validation using same schema
    const validated = companySettingsSchema.parse(data);

    // Additional business logic validation
    if (validated.operatingHours.monday.open && validated.operatingHours.monday.start >= validated.operatingHours.monday.end) {
      throw new Error('Start time must be before end time');
    }

    // Proceed with update
    // ...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: 'Validation failed',
        details: error.errors
      };
    }
    // ...
  }
}
```

---

## 7. UI Components

### 7.1 Shadcn/ui Components Used

**Core Components**:
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter`
- `Button`
- `Input`
- `Label`
- `Switch`
- `Slider`
- `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectValue`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Badge`
- `Separator`
- `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`
- `Alert`, `AlertTitle`, `AlertDescription`
- `Form`, `FormField`, `FormItem`, `FormLabel`, `FormControl`, `FormMessage`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableCell`
- `Textarea`

**Custom Components** (Planned):

**ColorPicker**:
```tsx
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  label?: string;
}

export function ColorPicker({ value, onChange, label }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <div className="flex gap-2">
        <div
          className="w-10 h-10 rounded border cursor-pointer"
          style={{ backgroundColor: value }}
        />
        <Input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#000000"
        />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline">Pick</Button>
          </PopoverTrigger>
          <PopoverContent>
            <HexColorPicker color={value} onChange={onChange} />
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
```

**OperatingHoursEditor**:
```tsx
interface OperatingHoursEditorProps {
  hours: Record<DayOfWeek, { open: boolean; start: string; end: string }>;
  onChange: (hours: Record<DayOfWeek, { open: boolean; start: string; end: string }>) => void;
}

export function OperatingHoursEditor({ hours, onChange }: OperatingHoursEditorProps) {
  const days: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  const handleDayChange = (day: DayOfWeek, field: 'open' | 'start' | 'end', value: any) => {
    onChange({
      ...hours,
      [day]: {
        ...hours[day],
        [field]: value
      }
    });
  };

  return (
    <div className="space-y-4">
      {days.map(day => (
        <div key={day} className="flex items-center gap-4">
          <div className="w-32 capitalize">{day}</div>
          <Switch
            checked={hours[day].open}
            onCheckedChange={(checked) => handleDayChange(day, 'open', checked)}
          />
          {hours[day].open && (
            <>
              <Input
                type="time"
                value={hours[day].start}
                onChange={(e) => handleDayChange(day, 'start', e.target.value)}
                className="w-32"
              />
              <span>to</span>
              <Input
                type="time"
                value={hours[day].end}
                onChange={(e) => handleDayChange(day, 'end', e.target.value)}
                className="w-32"
              />
            </>
          )}
        </div>
      ))}
    </div>
  );
}
```

**TemplateEditor**:
```tsx
interface TemplateEditorProps {
  template: EmailTemplate;
  isEditing: boolean;
  onSave: (template: EmailTemplate) => void;
  onPreview: (template: EmailTemplate) => void;
}

export function TemplateEditor({ template, isEditing, onSave, onPreview }: TemplateEditorProps) {
  const [localTemplate, setLocalTemplate] = useState(template);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{template.name}</CardTitle>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label>Subject</Label>
          <Input
            value={localTemplate.subject}
            onChange={(e) => setLocalTemplate({ ...localTemplate, subject: e.target.value })}
            disabled={!isEditing}
          />
        </div>

        <Tabs defaultValue="html">
          <TabsList>
            <TabsTrigger value="html">HTML</TabsTrigger>
            <TabsTrigger value="text">Plain Text</TabsTrigger>
            <TabsTrigger value="variables">Variables</TabsTrigger>
          </TabsList>

          <TabsContent value="html">
            <Textarea
              value={localTemplate.htmlTemplate}
              onChange={(e) => setLocalTemplate({ ...localTemplate, htmlTemplate: e.target.value })}
              rows={15}
              className="font-mono text-sm"
              disabled={!isEditing}
            />
          </TabsContent>

          <TabsContent value="text">
            <Textarea
              value={localTemplate.textTemplate}
              onChange={(e) => setLocalTemplate({ ...localTemplate, textTemplate: e.target.value })}
              rows={15}
              disabled={!isEditing}
            />
          </TabsContent>

          <TabsContent value="variables">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Variable</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Example</TableCell>
                  <TableCell>Required</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localTemplate.variables.map(v => (
                  <TableRow key={v.name}>
                    <TableCell className="font-mono">{'{{' + v.name + '}}'}</TableCell>
                    <TableCell>{v.description}</TableCell>
                    <TableCell className="text-muted-foreground">{v.example}</TableCell>
                    <TableCell>
                      {v.required ? <Badge>Required</Badge> : <Badge variant='secondary'>Optional</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="gap-2">
        <Button onClick={() => onPreview(localTemplate)} variant="outline">
          Preview
        </Button>
        <Button onClick={() => onSave(localTemplate)} disabled={!isEditing}>
          Save Template
        </Button>
      </CardFooter>
    </Card>
  );
}
```

---

## 8. Performance Considerations

### 8.1 Caching Strategy

**React Query Caching**:
```tsx
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
});

// Settings-specific cache keys
const settingsKeys = {
  all: ['settings'] as const,
  company: () => [...settingsKeys.all, 'company'] as const,
  security: () => [...settingsKeys.all, 'security'] as const,
  notifications: () => [...settingsKeys.all, 'notifications'] as const,
  emailTemplates: () => [...settingsKeys.notifications(), 'templates'] as const
};
```

**Next.js Caching**:
```tsx
// In server actions
import { revalidatePath, revalidateTag } from 'next/cache';

// Revalidate specific path
revalidatePath('/system-administration/settings/company');

// Revalidate by tag
revalidateTag('company-settings');
```

---

### 8.2 Optimistic Updates

```tsx
const updateMutation = useMutation({
  mutationFn: updateCompanySettings,
  onMutate: async (newSettings) => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: settingsKeys.company() });

    // Snapshot previous value
    const previousSettings = queryClient.getQueryData(settingsKeys.company());

    // Optimistically update cache
    queryClient.setQueryData(settingsKeys.company(), newSettings);

    // Return context with snapshot
    return { previousSettings };
  },
  onError: (err, newSettings, context) => {
    // Rollback on error
    queryClient.setQueryData(settingsKeys.company(), context?.previousSettings);
  },
  onSettled: () => {
    // Refetch after success or error
    queryClient.invalidateQueries({ queryKey: settingsKeys.company() });
  }
});
```

---

### 8.3 Lazy Loading

**Component Code Splitting**:
```tsx
import dynamic from 'next/dynamic';

// Lazy load template editor
const TemplateEditor = dynamic(
  () => import('./components/TemplateEditor'),
  { loading: () => <TemplateEditorSkeleton /> }
);

// Lazy load notification history
const NotificationHistoryTab = dynamic(
  () => import('./components/notification-history-tab'),
  { ssr: false } // Don't render on server
);
```

---

### 8.4 Debouncing

**Auto-save with Debounce**:
```tsx
import { useDebouncedCallback } from 'use-debounce';

export function CompanySettingsForm() {
  const { updateSettings } = useCompanySettings();

  const debouncedSave = useDebouncedCallback(
    (settings: CompanySettings) => {
      updateSettings(settings);
    },
    2000 // 2 second delay
  );

  const handleChange = (field: string, value: any) => {
    const updated = { ...settings, [field]: value };
    setSettings(updated);
    debouncedSave(updated);
  };

  return (
    // Form with auto-save
  );
}
```

---

## 9. Testing Strategy

### 9.1 Unit Tests

**Component Tests** (Vitest + React Testing Library):

```tsx
// __tests__/company-settings.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CompanySettingsPage from '../page';

describe('CompanySettingsPage', () => {
  it('renders all tabs', () => {
    render(<CompanySettingsPage />);

    expect(screen.getByText('General Information')).toBeInTheDocument();
    expect(screen.getByText('Branding')).toBeInTheDocument();
    expect(screen.getByText('Operational Settings')).toBeInTheDocument();
  });

  it('updates company name', () => {
    render(<CompanySettingsPage />);

    const input = screen.getByLabelText('Company Name');
    fireEvent.change(input, { target: { value: 'New Company Name' } });

    expect(input).toHaveValue('New Company Name');
  });

  it('validates required fields', async () => {
    render(<CompanySettingsPage />);

    const saveButton = screen.getByText('Save Changes');
    fireEvent.click(saveButton);

    expect(await screen.findByText('Company name is required')).toBeInTheDocument();
  });
});
```

**Validation Tests**:

```tsx
// __tests__/validation/settings-schemas.test.ts
import { describe, it, expect } from 'vitest';
import { companySettingsSchema } from '@/lib/utils/validation/settings-schemas';

describe('companySettingsSchema', () => {
  it('validates correct company settings', () => {
    const validSettings = {
      id: 'company-001',
      companyName: 'Test Company',
      legalName: 'Test Company Ltd.',
      taxId: 'TAX-123456789',
      // ... all required fields
    };

    expect(() => companySettingsSchema.parse(validSettings)).not.toThrow();
  });

  it('rejects invalid tax ID format', () => {
    const invalidSettings = {
      // ... other valid fields
      taxId: 'invalid-format'
    };

    expect(() => companySettingsSchema.parse(invalidSettings)).toThrow();
  });

  it('validates hex color format', () => {
    const invalidColor = {
      // ... other valid fields
      primaryColor: 'blue' // Invalid, must be hex
    };

    expect(() => companySettingsSchema.parse(invalidColor)).toThrow();
  });
});
```

---

### 9.2 Integration Tests

**Server Action Tests**:

```tsx
// __tests__/actions/company-settings.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { updateCompanySettings, getCompanySettings } from '../actions';
import { prisma } from '@/lib/prisma';

describe('Company Settings Actions', () => {
  beforeEach(async () => {
    // Seed test database
    await prisma.companySettings.create({ data: testSettings });
  });

  afterEach(async () => {
    // Cleanup
    await prisma.companySettings.deleteMany();
  });

  it('updates company settings successfully', async () => {
    const updated = {
      ...testSettings,
      companyName: 'Updated Name'
    };

    const result = await updateCompanySettings(updated);

    expect(result.success).toBe(true);
    expect(result.data.companyName).toBe('Updated Name');
  });

  it('validates settings before update', async () => {
    const invalid = {
      ...testSettings,
      email: 'not-an-email'
    };

    const result = await updateCompanySettings(invalid);

    expect(result.success).toBe(false);
    expect(result.error).toContain('Invalid email');
  });

  it('retrieves company settings', async () => {
    const settings = await getCompanySettings();

    expect(settings).toBeDefined();
    expect(settings.id).toBe(testSettings.id);
  });
});
```

---

### 9.3 E2E Tests (Planned)

**Playwright Tests**:

```tsx
// e2e/settings/company-settings.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Company Settings', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/system-administration/settings/company');
    await page.waitForLoadState('networkidle');
  });

  test('updates company information', async ({ page }) => {
    // Switch to General Information tab
    await page.click('text=General Information');

    // Update company name
    await page.fill('input[name='companyName']', 'New Company Name');

    // Save changes
    await page.click('button:has-text("Save Changes")');

    // Verify success toast
    await expect(page.locator('text=Settings saved successfully')).toBeVisible();
  });

  test('validates operating hours', async ({ page }) => {
    // Switch to Operational Settings tab
    await page.click('text=Operational Settings');

    // Set invalid hours (end before start)
    await page.fill('input[name='monday.start']', '18:00');
    await page.fill('input[name='monday.end']', '09:00');

    // Save changes
    await page.click('button:has-text("Save Changes")');

    // Verify error message
    await expect(page.locator('text=Start time must be before end time')).toBeVisible();
  });

  test('uploads company logo', async ({ page }) => {
    // Switch to Branding tab
    await page.click('text=Branding');

    // Upload logo
    const fileInput = page.locator('input[type='file']');
    await fileInput.setInputFiles('test-logo.png');

    // Wait for upload
    await page.waitForResponse(response =>
      response.url().includes('/api/upload') && response.status() === 200
    );

    // Verify logo preview
    await expect(page.locator('img[alt='Company logo']')).toBeVisible();
  });
});
```

---

## 10. Migration Strategy

### 10.1 Mock Data to Database Migration

**Phase 1**: Create database schema with Prisma

```prisma
// prisma/schema.prisma

model CompanySettings {
  id                String   @id @default(cuid())
  companyName       String   @db.VarChar(100)
  legalName         String   @db.VarChar(100)
  taxId             String   @db.VarChar(50)
  registrationNumber String  @db.VarChar(50)
  address           Json     // Store as JSONB
  phone             String   @db.VarChar(20)
  email             String   @db.VarChar(100)
  website           String?  @db.VarChar(200)
  logo              Json     // Store as JSONB
  primaryColor      String   @db.VarChar(7)
  secondaryColor    String   @db.VarChar(7)
  industry          String?  @db.VarChar(100)
  fiscalYearStart   String   @db.VarChar(5)
  defaultCurrency   String   @db.VarChar(3)
  defaultTimezone   String   @db.VarChar(50)
  defaultLanguage   String   @db.VarChar(10)
  operatingHours    Json     // Store as JSONB
  multiLocation     Boolean  @default(false)
  multiDepartment   Boolean  @default(false)
  updatedAt         DateTime @updatedAt
  updatedBy         String
  createdAt         DateTime @default(now())

  @@map("tb_company_settings")
}

model SecuritySettings {
  id                String   @id @default(cuid())
  passwordPolicy    Json     // Store as JSONB
  sessionSettings   Json
  twoFactor         Json
  ipAccessControl   Json
  loginAttempts     Json
  securityQuestions Json
  auditLogging      Json
  dataEncryption    Json
  updatedAt         DateTime @updatedAt
  updatedBy         String
  createdAt         DateTime @default(now())

  @@map("tb_security_settings")
}

model ApplicationSettings {
  id             String   @id @default(cuid())
  email          Json     // Store as JSONB
  backup         Json
  dataRetention  Json
  integrations   Json
  features       Json
  performance    Json
  updatedAt      DateTime @updatedAt
  updatedBy      String
  createdAt      DateTime @default(now())

  @@map("tb_application_settings")
}

model EmailTemplate {
  id            String   @id @default(cuid())
  eventType     String   @db.VarChar(100)
  name          String   @db.VarChar(100)
  description   String?  @db.VarChar(500)
  language      String   @db.VarChar(10)
  subject       String   @db.VarChar(200)
  htmlTemplate  String   @db.Text
  textTemplate  String   @db.Text
  variables     Json     // Store as JSONB
  version       Int      @default(1)
  isActive      Boolean  @default(true)
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  updatedBy     String

  @@map("tb_email_template")
}

model NotificationRoutingRule {
  id          String   @id @default(cuid())
  name        String   @db.VarChar(100)
  eventType   String   @db.VarChar(100)
  conditions  Json     // Store as JSONB array
  actions     Json     // Store as JSONB array
  priority    Int      @default(50)
  enabled     Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("tb_notification_routing_rule")
}

model EscalationPolicy {
  id          String   @id @default(cuid())
  name        String   @db.VarChar(100)
  description String?  @db.VarChar(500)
  eventType   String   @db.VarChar(100)
  stages      Json     // Store as JSONB array
  enabled     Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@map("tb_escalation_policy")
}

model NotificationLog {
  id             String    @id @default(cuid())
  timestamp      DateTime  @default(now())
  eventType      String    @db.VarChar(100)
  recipientId    String
  recipientEmail String?   @db.VarChar(100)
  channel        String    @db.VarChar(20)
  status         String    @db.VarChar(20)
  templateId     String?
  metadata       Json?     // Store as JSONB
  retryCount     Int       @default(0)
  errorMessage   String?   @db.Text
  sentAt         DateTime?
  deliveredAt    DateTime?
  openedAt       DateTime?
  clickedAt      DateTime?

  @@index([eventType])
  @@index([recipientId])
  @@index([status])
  @@index([timestamp])
  @@map("tb_notification_log")
}
```

**Phase 2**: Data migration script

```tsx
// scripts/migrate-settings-data.ts
import { PrismaClient } from '@prisma/client';
import {
  mockCompanySettings,
  mockSecuritySettings,
  mockApplicationSettings,
  mockEmailTemplates,
  mockRoutingRules,
  mockEscalationPolicies
} from '@/lib/mock-data/settings';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting settings data migration...');

  // Migrate company settings
  await prisma.companySettings.create({
    data: mockCompanySettings
  });

  console.log('✓ Company settings migrated');

  // Migrate security settings
  await prisma.securitySettings.create({
    data: mockSecuritySettings
  });

  console.log('✓ Security settings migrated');

  // Migrate application settings
  await prisma.applicationSettings.create({
    data: mockApplicationSettings
  });

  console.log('✓ Application settings migrated');

  // Migrate email templates
  for (const template of mockEmailTemplates) {
    await prisma.emailTemplate.create({
      data: template
    });
  }

  console.log(`✓ ${mockEmailTemplates.length} email templates migrated`);

  // Migrate routing rules
  for (const rule of mockRoutingRules) {
    await prisma.notificationRoutingRule.create({
      data: rule
    });
  }

  console.log(`✓ ${mockRoutingRules.length} routing rules migrated`);

  // Migrate escalation policies
  for (const policy of mockEscalationPolicies) {
    await prisma.escalationPolicy.create({
      data: policy
    });
  }

  console.log(`✓ ${mockEscalationPolicies.length} escalation policies migrated`);

  console.log('Migration completed successfully!');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

**Phase 3**: Update components to use server actions

```tsx
// Before (mock data)
const [settings, setSettings] = useState<CompanySettings>(mockCompanySettings);

// After (database)
const { settings, isLoading, updateSettings } = useCompanySettings();
```

---

## 11. Security Considerations

### 11.1 Permission Checks

**All settings pages require administrator role**:

```tsx
// middleware.ts or page-level protection
import { getUserFromSession } from '@/lib/auth';

export default async function SettingsPage() {
  const user = await getUserFromSession();

  if (!user || user.role !== 'system-admin') {
    redirect('/unauthorized');
  }

  // Render settings page
}
```

**Server action permission checks**:

```tsx
export async function updateSecuritySettings(data: SecuritySettings) {
  const user = await getCurrentUser();

  if (!user || user.role !== 'system-admin') {
    return { success: false, error: 'Unauthorized' };
  }

  // Proceed with update
}
```

---

### 11.2 Sensitive Data Handling

**Encrypt sensitive fields before storage**:

```tsx
import { encrypt, decrypt } from '@/lib/encryption';

// Before saving
const encryptedSettings = {
  ...settings,
  email: {
    ...settings.email,
    smtp: {
      ...settings.email.smtp,
      password: encrypt(settings.email.smtp.password)
    }
  }
};

// After retrieval
const decryptedSettings = {
  ...settings,
  email: {
    ...settings.email,
    smtp: {
      ...settings.email.smtp,
      password: decrypt(settings.email.smtp.password)
    }
  }
};
```

**Mask sensitive data in logs**:

```tsx
function maskSensitiveData(data: any) {
  return {
    ...data,
    password: '***',
    apiKey: '***',
    secret: '***'
  };
}

await prisma.auditLog.create({
  data: {
    action: 'UPDATE_EMAIL_SETTINGS',
    changes: maskSensitiveData(changes),
    timestamp: new Date()
  }
});
```

---

## Sitemap

### Overview
This section provides a complete navigation structure of all pages, tabs, and dialogues in the Settings sub-module.

### Page Hierarchy

```mermaid
graph TD
    ListPage['List Page<br>(/system-administration/settings)']
    CreatePage['Create Page<br>(/system-administration/settings/new)']
    DetailPage["Detail Page<br>(/system-administration/settings/[id])"]
    EditPage["Edit Page<br>(/system-administration/settings/[id]/edit)"]

    %% List Page Tabs
    ListPage --> ListTab1['Tab: All Items']
    ListPage --> ListTab2['Tab: Active']
    ListPage --> ListTab3['Tab: Archived']

    %% List Page Dialogues
    ListPage -.-> ListDialog1['Dialog: Quick Create']
    ListPage -.-> ListDialog2['Dialog: Bulk Actions']
    ListPage -.-> ListDialog3['Dialog: Export']
    ListPage -.-> ListDialog4['Dialog: Filter']

    %% Detail Page Tabs
    DetailPage --> DetailTab1['Tab: Overview']
    DetailPage --> DetailTab2['Tab: History']
    DetailPage --> DetailTab3['Tab: Activity Log']

    %% Detail Page Dialogues
    DetailPage -.-> DetailDialog1['Dialog: Edit']
    DetailPage -.-> DetailDialog2['Dialog: Delete Confirm']
    DetailPage -.-> DetailDialog3['Dialog: Status Change']

    %% Create/Edit Dialogues
    CreatePage -.-> CreateDialog1['Dialog: Cancel Confirm']
    CreatePage -.-> CreateDialog2['Dialog: Save Draft']

    EditPage -.-> EditDialog1['Dialog: Discard Changes']
    EditPage -.-> EditDialog2['Dialog: Save Draft']

    %% Navigation Flow
    ListPage --> DetailPage
    ListPage --> CreatePage
    DetailPage --> EditPage
    CreatePage --> DetailPage
    EditPage --> DetailPage

    style ListPage fill:#e1f5ff
    style CreatePage fill:#fff4e1
    style DetailPage fill:#e8f5e9
    style EditPage fill:#fce4ec
```

### Pages

#### 1. List Page
**Route**: `/system-administration/settings`
**File**: `page.tsx`
**Purpose**: Display paginated list of all settings

**Sections**:
- Header: Title, breadcrumbs, primary actions
- Filters: Quick filters, advanced filter panel
- Search: Global search with autocomplete
- Data Table: Sortable columns, row actions, bulk selection
- Pagination: Page size selector, page navigation

**Tabs**:
- **All Items**: Complete list of all settings
- **Active**: Filter active items only
- **Archived**: View archived items

**Dialogues**:
- **Quick Create**: Fast creation form with essential fields only
- **Bulk Actions**: Multi-select actions (delete, export, status change)
- **Export**: Export data in various formats (CSV, Excel, PDF)
- **Filter**: Advanced filtering with multiple criteria

#### 2. Detail Page
**Route**: `/system-administration/settings/[id]`
**File**: `[id]/page.tsx`
**Purpose**: Display comprehensive setting details

**Sections**:
- Header: Breadcrumbs, setting title, action buttons
- Info Cards: Multiple cards showing different aspects
- Related Data: Associated records and relationships

**Tabs**:
- **Overview**: Key information and summary
- **History**: Change history and audit trail
- **Activity Log**: User actions and system events

**Dialogues**:
- **Edit**: Navigate to edit form
- **Delete Confirm**: Confirmation before deletion
- **Status Change**: Change setting status with reason

#### 3. Create Page
**Route**: `/system-administration/settings/new`
**File**: `new/page.tsx`
**Purpose**: Create new setting

**Sections**:
- Form Header: Title, Save/Cancel actions
- Form Fields: All required and optional fields
- Validation: Real-time field validation

**Dialogues**:
- **Cancel Confirm**: Confirm discarding unsaved changes
- **Save Draft**: Save incomplete form as draft

#### 4. Edit Page
**Route**: `/system-administration/settings/[id]/edit`
**File**: `[id]/edit/page.tsx`
**Purpose**: Modify existing setting

**Sections**:
- Form Header: Title, Save/Cancel/Delete actions
- Form Fields: Pre-populated with existing data
- Change Tracking: Highlight modified fields

**Dialogues**:
- **Discard Changes**: Confirm discarding modifications
- **Save Draft**: Save changes as draft


## 12. Documentation Requirements

### 12.1 Inline Documentation

**Component Documentation**:

```tsx
/**
 * CompanySettingsPage
 *
 * Allows administrators to configure company-wide settings including:
 * - General Information: Company details, contact info
 * - Branding: Logos, colors
 * - Operational Settings: Hours, fiscal year, multi-location support
 *
 * @requires Role: system-admin
 * @access Protected
 */
export default function CompanySettingsPage() {
  // Implementation
}
```

**Function Documentation**:

```tsx
/**
 * Updates company settings in the database
 *
 * @param data - Complete company settings object
 * @returns Promise with success status and updated data or error
 *
 * @throws {Error} If validation fails
 * @throws {Error} If user is unauthorized
 *
 * @example
 * const result = await updateCompanySettings({
 *   ...currentSettings,
 *   companyName: 'New Name'
 * });
 */
export async function updateCompanySettings(data: CompanySettings) {
  // Implementation
}
```

---

### 12.2 User Documentation (Planned)

**Help Content Integration**:

```tsx
import { HelpCircle } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';

<div className="flex items-center gap-2">
  <Label>Password Expiry (Days)</Label>
  <Tooltip>
    <TooltipTrigger>
      <HelpCircle className="h-4 w-4 text-muted-foreground" />
    </TooltipTrigger>
    <TooltipContent>
      <p>Number of days before passwords expire. Set to 0 for no expiry.</p>
      <p className="text-xs text-muted-foreground mt-1">
        Recommended: 90 days for enhanced security
      </p>
    </TooltipContent>
  </Tooltip>
</div>
```

---

**Document Control**:
- **Created**: 2025-01-16
- **Version**: 1.0
- **Status**: Active Development
- **Next Review**: Q2 2025
