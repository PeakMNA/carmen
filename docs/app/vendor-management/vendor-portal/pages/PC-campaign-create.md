# Page Content: Create Price Collection Campaign

## Document Information
- **Module**: Vendor Management
- **Sub-Module**: Vendor Portal / Price Collection
- **Page**: Create Campaign Form (Staff-Facing)
- **Route**: `/vendor-management/campaigns/create`
- **Version**: 2.0.0
- **Last Updated**: 2025-01-23
- **Owner**: UX/Content Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 2.0.0 | 2025-01-23 | System | Initial version based on UC v2.0, TS v2.0 |

---

## Overview

**Page Purpose**: Enable procurement staff to create new price collection campaigns by configuring template, vendors, schedule, and settings in a multi-step wizard.

**User Personas**: Procurement Staff, Purchasing Managers

**Related Documents**:
- [Business Requirements](../BR-vendor-portal.md)
- [Use Cases](../UC-vendor-portal.md) - UC-VPP-002
- [Technical Specification](../TS-vendor-portal.md)
- [Flow Diagrams](../FD-vendor-portal.md)
- [PC Campaign List](./PC-campaign-list.md)

---

## Page Header

### Page Title
**Text**: Create Price Collection Campaign
**Style**: H1, bold, text-gray-900
**Location**: Top left of page

### Breadcrumb
**Text**: Home / Vendor Management / Campaigns / Create
**Location**: Above page title
**Interactive**: All previous levels are clickable links

### Header Actions
| Button Label | Purpose | Style | Visibility |
|--------------|---------|-------|------------|
| Save as Draft | Save progress without launching | Secondary (white with border) | Always |
| Cancel | Discard and return to list | Tertiary (text link) | Always |

---

## Page Description

**Instructional Text**:
```
Create a new price collection campaign to gather pricing from vendors. Complete the steps below to configure your campaign.
```

**Help Section** (Collapsible):
```
ℹ️ Campaign Creation Tips

• Use templates to save time on common campaigns
• One-time campaigns are ideal for special purchases or RFPs
• Recurring campaigns work well for regular pricing updates
• Add clear instructions to help vendors provide accurate pricing

[Show Detailed Guide →]
```

---

## Multi-Step Wizard

### Wizard Progress Indicator
**Location**: Top of form, centered
**Layout**: Horizontal stepper

```
1. Campaign Info  →  2. Select Template  →  3. Select Vendors  →  4. Schedule  →  5. Settings  →  6. Review
   ●─────────────→  ○────────────────→  ○───────────────→  ○──────→  ○─────────→  ○
  CURRENT          INCOMPLETE          INCOMPLETE          INCOMPLETE  INCOMPLETE   INCOMPLETE
```

**Step States**:
- **Completed**: Green checkmark ● (filled circle)
- **Current**: Blue circle ● (filled) with label
- **Incomplete**: Gray circle ○ (outline) with label
- **Error**: Red exclamation ⚠️

**Step Navigation**:
- Click completed steps to navigate back
- Cannot click incomplete future steps
- Current step is bold and highlighted

---

## Step 1: Campaign Information

### Section Title
**Text**: Campaign Information
**Description**: Basic information to identify and describe this campaign

### Form Fields

#### Campaign Name
| Field Label | Type | Required | Placeholder | Max Length | Validation |
|-------------|------|----------|-------------|------------|------------|
| Campaign Name | Text input | Yes | e.g., Q1 2024 Kitchen Equipment Pricing | 200 | No special chars: <, >, &, ", ' |

**Help Text**: Give your campaign a clear, descriptive name. This will be visible to vendors.

**Character Counter**: {charCount} / 200

**Validation Messages**:
- **Empty**: "Campaign name is required"
- **Too long**: "Campaign name must not exceed 200 characters"
- **Invalid chars**: "Campaign name contains invalid characters: {chars}"

---

#### Campaign Description
| Field Label | Type | Required | Placeholder | Max Length |
|-------------|------|----------|-------------|------------|
| Description | Textarea | No | Describe the purpose and scope of this campaign... | 1000 |

**Help Text**: Optional description for internal reference and vendor context (recommended)

**Character Counter**: {charCount} / 1000

---

#### Campaign Type
| Field Label | Type | Required | Options |
|-------------|------|----------|---------|
| Campaign Type | Radio buttons | Yes | One-Time, Recurring |

**Option Descriptions**:

**One-Time**:
```
( ) One-Time Campaign
    Single price collection with specific start and end dates
    Ideal for: Special purchases, annual RFPs, one-off quotes
```

**Recurring**:
```
( ) Recurring Campaign
    Automatically repeats on a schedule (daily, weekly, monthly, quarterly)
    Ideal for: Regular pricing updates, standing orders, continuous supply
```

**Help Text**: Choose based on how frequently you need updated pricing from vendors

---

#### Priority
| Field Label | Type | Required | Options |
|-------------|------|----------|---------|
| Priority | Dropdown | Yes | Low, Medium, High, Urgent |

**Dropdown Options with Icons**:
```
┌─────────────────────────┐
│ Select priority...      │
├─────────────────────────┤
│ 📋 Low                  │
│ 📊 Medium (recommended) │
│ ⚠️ High                 │
│ 🚨 Urgent               │
└─────────────────────────┘
```

**Help Text**: Priority affects reminder frequency and visibility in vendor portal

**Default Value**: Medium

---

#### Tags (Optional)
| Field Label | Type | Required | Max Tags | Autocomplete |
|-------------|------|----------|----------|--------------|
| Tags | Tag input | No | 10 | Yes |

**Tag Input Component**:
```
Tags: [Kitchen Equipment ×] [Q1 2024 ×] [______Add tag___]

Suggestions:
• Kitchen Equipment
• Q1 2024
• Dry Goods
• Beverages
• Produce
```

**Help Text**: Add tags to organize and filter campaigns (press Enter to add)

**Validation**:
- Max 10 tags
- Max 50 characters per tag
- No duplicate tags
- Trim whitespace

---

### Step Footer Actions
| Button Label | Type | Action | Keyboard | Enabled |
|--------------|------|--------|----------|---------|
| Next: Select Template | Primary (blue solid) | Validate and proceed to Step 2 | Enter | If form valid |
| Save as Draft | Secondary (gray outline) | Save and exit | Ctrl/Cmd+S | Always |
| Cancel | Tertiary (text link) | Confirm discard | Esc | Always |

---

## Step 2: Select Template

### Section Title
**Text**: Select Pricelist Template
**Description**: Choose a template that defines which products to request pricing for

### Template Selection Options

#### Option 1: Use Existing Template (Default)
```
( ) Use Existing Template
    Select from your saved pricelist templates

    [Search templates...___________________________]

    ┌─────────────────────────────────────────────┐
    │ ( ) Kitchen Equipment Template              │
    │     20 products • Last used 5 days ago      │
    │     Created by John Doe                     │
    │     [Preview Products →]                    │
    ├─────────────────────────────────────────────┤
    │ ( ) Weekly Produce Template                 │
    │     35 products • Last used 2 days ago      │
    │     Created by Maria Garcia                 │
    │     [Preview Products →]                    │
    ├─────────────────────────────────────────────┤
    │ ( ) Beverage Suppliers Template             │
    │     15 products • Last used 14 days ago     │
    │     Created by David Chen                   │
    │     [Preview Products →]                    │
    └─────────────────────────────────────────────┘

    [Load More Templates...]
```

**Template Card Details**:
- Radio button for selection
- Template name (bold)
- Product count
- Last used date
- Creator name
- Preview link

**Search Functionality**:
- Search by template name
- Filter by creator
- Filter by product count
- Sort by: Recently used, Name, Product count

**Preview Products Modal** (when clicking "Preview Products →"):
```
┌───────────────────────────────────────────────┐
│ Kitchen Equipment Template                     │
│ 20 products                                    │
│                                                │
│ ┌───────────────────────────────────────────┐ │
│ │ Product Code | Product Name | Category    │ │
│ ├───────────────────────────────────────────┤ │
│ │ PROD-00123  | Chef Knife   | Cookware    │ │
│ │ PROD-00124  | Cutting Board| Cookware    │ │
│ │ PROD-00125  | Mixing Bowl  | Cookware    │ │
│ │ ... (17 more)                             │ │
│ └───────────────────────────────────────────┘ │
│                                                │
│ [Use This Template]  [Close]                  │
└───────────────────────────────────────────────┘
```

---

#### Option 2: Create New Template
```
( ) Create New Template
    Build a custom template for this campaign

    This will allow you to:
    • Select specific products from catalog
    • Define custom product fields
    • Save template for future use

    [Configure New Template →]
```

**When Selected**: Navigate to template builder interface (simplified inline version)

**New Template Form** (Expandable Section):
```
┌─────────────────────────────────────────────────────┐
│ Template Name: [_________________________________] │
│                                                     │
│ Description: [____________________________________] │
│              [____________________________________] │
│                                                     │
│ Product Selection:                                  │
│ [Search products...____________________________]    │
│                                                     │
│ Selected Products (0):                              │
│ ┌─────────────────────────────────────────────┐   │
│ │ No products selected yet                     │   │
│ │ Search and click + to add products           │   │
│ └─────────────────────────────────────────────┘   │
│                                                     │
│ [Save Template] [Cancel]                           │
└─────────────────────────────────────────────────────┘
```

---

#### Template Quick Stats
**Location**: Right sidebar
**Content**:
```
Selected Template Summary

Template: Kitchen Equipment Template
Products: 20 items
Categories: 3 (Cookware, Appliances, Tools)
Custom Fields: 2

Estimated completion time for vendors:
⏱ ~15-20 minutes

[Change Template]
```

---

### Step Footer Actions
| Button Label | Type | Action | Enabled |
|--------------|------|--------|---------|
| Back | Secondary (gray outline) | Return to Step 1 | Always |
| Next: Select Vendors | Primary (blue solid) | Validate and proceed to Step 3 | If template selected |
| Save as Draft | Secondary (gray outline) | Save and exit | Always |

---

## Step 3: Select Vendors

### Section Title
**Text**: Select Vendors
**Description**: Choose which vendors to invite to this campaign

### Vendor Selection Interface

#### Search and Filter Bar
```
[Search vendors...________________________________] [Advanced Filters ▼]

Active Filters: Status: Active (×) | Category: Kitchen Equipment (×)
```

**Advanced Filters Panel** (Expandable):
```
┌─────────────────────────────────────────────────────┐
│ Vendor Status:                                       │
│ ☑ Active  ☐ Inactive                                │
│                                                      │
│ Product Categories:                                  │
│ ☑ Kitchen Equipment  ☐ Produce  ☐ Beverages        │
│                                                      │
│ Performance Metrics:                                 │
│ Response Rate: [0%]────────[100%]                   │
│ Quality Score: [0]─────────[100]                    │
│                                                      │
│ Last Activity:                                       │
│ ( ) Any time                                         │
│ ( ) Last 30 days                                     │
│ ( ) Last 90 days                                     │
│ ( ) Last 180 days                                    │
│                                                      │
│ [Apply Filters]  [Clear All]                        │
└─────────────────────────────────────────────────────┘
```

---

#### Vendor List (Multi-Select)

**List Header**:
```
☐ Select All (24 vendors match filters)        Sorted by: Relevance ▼

Selected: 0 vendors
```

**Vendor Cards** (Checkbox List):
```
┌─────────────────────────────────────────────────────┐
│ ☐  ABC Kitchen Supplies                            │
│     contact@abckitchen.com • +1 234-567-8900       │
│     ⭐ Response Rate: 95% | Quality: 88/100         │
│     Last campaign: 5 days ago                       │
│     Categories: Kitchen Equipment, Cookware         │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ ☐  Global Foodservice Equipment                    │
│     sales@globalfood.com • +1 345-678-9012         │
│     ⭐ Response Rate: 82% | Quality: 91/100         │
│     Last campaign: 12 days ago                      │
│     Categories: Kitchen Equipment, Appliances       │
└─────────────────────────────────────────────────────┘

[Load More Vendors...]
```

**Vendor Card Details**:
- Checkbox for selection
- Vendor name (bold)
- Contact email and phone
- Performance metrics (response rate, quality score)
- Last campaign participation
- Product categories

**Performance Badge Colors**:
- Response Rate ≥80%: Green
- Response Rate 50-79%: Yellow
- Response Rate <50%: Red
- Quality Score ≥85: Green
- Quality Score 60-84: Yellow
- Quality Score <60: Red

---

#### Bulk Actions for Selected Vendors
```
3 vendors selected

[Select by Category ▼]  [Select by Performance ▼]  [Deselect All]
```

**Select by Category Dropdown**:
```
┌─────────────────────────────┐
│ Kitchen Equipment (8)       │
│ Produce (12)                │
│ Beverages (6)               │
│ Dry Goods (15)              │
└─────────────────────────────┘
```

**Select by Performance Dropdown**:
```
┌─────────────────────────────┐
│ High performers (≥80%)      │
│ Medium performers (50-79%)  │
│ Recent participants (<30d)  │
└─────────────────────────────┘
```

---

#### Selected Vendors Summary
**Location**: Right sidebar
**Content**:
```
Selected Vendors (3)

✓ ABC Kitchen Supplies
  88% response • 88/100 quality

✓ Global Foodservice Equipment
  82% response • 91/100 quality

✓ Premium Restaurant Supply
  91% response • 85/100 quality

Estimated Metrics:
• Avg Response Rate: 87%
• Avg Quality Score: 88/100
• Expected submissions: ~3 of 3

[Review Selection]
```

---

### Step Footer Actions
| Button Label | Type | Action | Enabled |
|--------------|------|--------|---------|
| Back | Secondary (gray outline) | Return to Step 2 | Always |
| Next: Schedule | Primary (blue solid) | Validate and proceed to Step 4 | If 1+ vendors selected |
| Save as Draft | Secondary (gray outline) | Save and exit | Always |

---

## Step 4: Campaign Schedule

### Section Title
**Text**: Campaign Schedule
**Description**: Define when this campaign runs and when vendors can submit pricing

### Schedule Configuration

#### Campaign Type-Specific Forms

**IF Campaign Type = "One-Time":**

##### Start Date & Time
| Field Label | Type | Required | Default | Validation |
|-------------|------|----------|---------|------------|
| Start Date | Date picker | Yes | Today + 1 day | Cannot be in past |
| Start Time | Time picker | Yes | 09:00 | Business hours recommended |

**Help Text**: When vendors can start accessing the portal and submitting pricing

**Time Zone Display**: All times in {User Timezone} (e.g., PST -08:00)

---

##### End Date & Time
| Field Label | Type | Required | Default | Validation |
|-------------|------|----------|---------|------------|
| End Date | Date picker | Yes | Start + 14 days | Must be after start date |
| End Time | Time picker | Yes | 17:00 | Business hours recommended |

**Help Text**: Deadline for vendor submissions. Access expires automatically after this time.

**Duration Calculator** (Auto-calculated):
```
Campaign Duration: 14 days
```

**Warning** (if duration < 7 days):
```
⚠️ Short Campaign Duration
7+ days recommended to allow vendors adequate time to prepare pricing
```

---

**IF Campaign Type = "Recurring":**

##### Recurrence Pattern
| Field Label | Type | Required | Options |
|-------------|------|----------|---------|
| Frequency | Dropdown | Yes | Daily, Weekly, Monthly, Quarterly, Yearly |

**Frequency-Specific Options**:

**If Frequency = "Weekly":**
```
Repeat every: [1▼] week(s)

On these days:
☐ Mon  ☐ Tue  ☐ Wed  ☐ Thu  ☐ Fri  ☐ Sat  ☐ Sun
```

**If Frequency = "Monthly":**
```
Repeat every: [1▼] month(s)

Repeat on:
( ) Day [15▼] of the month
( ) First [Monday▼] of the month
( ) Last [Friday▼] of the month
```

**If Frequency = "Quarterly":**
```
Repeat every: [1▼] quarter(s)

Start quarter on: [First day of quarter ▼]
```

**If Frequency = "Yearly":**
```
Repeat every: [1▼] year(s)

On: [January ▼] [15▼]
```

---

##### Recurring Campaign Start & End
| Field Label | Type | Required | Validation |
|-------------|------|----------|------------|
| First Instance Date | Date picker | Yes | Cannot be in past |
| Recurring Until | Date picker or "No end date" | No | Must be after first instance |

**Options**:
```
End recurring campaign:
( ) On a specific date: [DD/MM/YYYY]
( ) After [__] occurrences
( ) Never (continue indefinitely)
```

**Recurring Schedule Preview**:
```
┌─────────────────────────────────────────────────┐
│ Recurring Schedule Preview                       │
│                                                  │
│ Upcoming Instances:                              │
│ 1. 15 Jan 2024 - 31 Jan 2024 (16 days)         │
│ 2. 15 Feb 2024 - 29 Feb 2024 (14 days)         │
│ 3. 15 Mar 2024 - 31 Mar 2024 (16 days)         │
│ 4. 15 Apr 2024 - 30 Apr 2024 (15 days)         │
│ ... and 8 more instances                        │
│                                                  │
│ Total Instances: 12 (ends 15 Dec 2024)          │
└─────────────────────────────────────────────────┘
```

---

##### Portal Access Duration
| Field Label | Type | Required | Default | Range |
|-------------|------|----------|---------|-------|
| Portal Access Duration | Number input + unit | Yes | 14 days | 1-90 days |

**Unit Options**: Days, Hours
**Format**: [14▼] [days▼]

**Help Text**: How long each recurring instance remains open for submissions

---

#### Schedule Summary
**Location**: Right sidebar
**Content**:

**For One-Time Campaign**:
```
Campaign Timeline

Start: 15 Jan 2024, 09:00
End: 31 Jan 2024, 17:00

Duration: 16 days, 8 hours

Vendor Access:
• Opens: 15 Jan 2024, 09:00
• Closes: 31 Jan 2024, 17:00
• Portal access: 16 days

Reminders will be sent:
• 7 days before deadline
• 3 days before deadline
• 1 day before deadline
```

**For Recurring Campaign**:
```
Recurring Campaign Schedule

Frequency: Monthly
First Instance: 15 Jan 2024
Ends: 15 Dec 2024
Total Instances: 12

Portal Access per Instance:
14 days

Next 3 Instances:
1. 15 Jan - 31 Jan 2024
2. 15 Feb - 29 Feb 2024
3. 15 Mar - 31 Mar 2024

[View All Instances]
```

---

### Step Footer Actions
| Button Label | Type | Action | Enabled |
|--------------|------|--------|---------|
| Back | Secondary (gray outline) | Return to Step 3 | Always |
| Next: Settings | Primary (blue solid) | Validate and proceed to Step 5 | If schedule valid |
| Save as Draft | Secondary (gray outline) | Save and exit | Always |

---

## Step 5: Campaign Settings

### Section Title
**Text**: Campaign Settings
**Description**: Configure submission methods, approvals, and notifications

### Settings Sections

#### Submission Methods
**Section Label**: Allowed Submission Methods
**Description**: Choose which methods vendors can use to submit pricing

**Options** (Checkboxes):
```
☑ Online Entry
  Vendors fill pricing using web form (recommended)

☑ Excel Upload
  Vendors upload completed Excel pricelist file

☐ API Integration
  Vendors submit via API (requires technical setup)
```

**Validation**: At least one method must be selected

**Help Text**: Online entry is recommended for best user experience and data quality

---

#### Approval Settings
**Section Label**: Submission Approval
**Description**: Determine if submissions require review before activation

**Options** (Radio buttons):
```
( ) Require Approval
    All submissions must be reviewed and approved by procurement staff
    Recommended for: High-value items, new vendors, critical supplies

( ) Auto-Approve
    Submissions are automatically approved without manual review
    Recommended for: Routine purchases, trusted vendors, low-risk items
```

**If "Require Approval" selected**:
```
Approval Workflow:
Approver: [Select user or role ▼]

☑ Notify approver immediately when submission received
☑ Send reminder if not reviewed within [3▼] days
```

---

#### Reminder Settings
**Section Label**: Automatic Reminders
**Description**: Schedule automated reminder emails to vendors

**Master Toggle**:
```
☑ Enable Automatic Reminders
```

**If Enabled**:

**Reminder Schedule**:
```
Send reminders to vendors who haven't submitted:

☑ [7▼] days before deadline
☑ [3▼] days before deadline
☑ [1▼] day before deadline

Additional Settings:
☐ Send daily reminders after deadline passes
☐ Stop reminders after [3▼] reminder attempts
```

**Escalation Rules** (Optional):
```
☑ Escalate if no response after deadline

Escalate to: [Manager@company.com]
Escalation timing: [2▼] days after deadline
```

---

#### Quality Requirements
**Section Label**: Quality Standards
**Description**: Set minimum quality thresholds for submissions

**Options**:
```
Minimum Quality Score: [70▼] / 100
(Submissions below this score will be flagged for review)

☑ Require pricing for all products
  (Flag submissions missing products)

☑ Require lead time information
  (Warn if lead time not provided)

☐ Require multiple MOQ tiers
  (Encourage volume pricing)
```

---

#### Notification Settings
**Section Label**: Email Notifications
**Description**: Configure who receives email notifications

**Email Templates**:
```
Invitation Email Template: [Standard Invitation ▼]
Reminder Email Template: [Standard Reminder ▼]
Approval Email Template: [Standard Approval ▼]
```

**Custom Message** (Optional):
```
Custom Instructions for Vendors:
[_________________________________________________]
[_________________________________________________]
[_________________________________________________]

This message will be included in all emails sent to vendors
for this campaign. Use it to provide specific guidance or
requirements.
```

---

#### Advanced Settings (Expandable)
**Toggle**: [Show Advanced Settings ▼]

**Content**:
```
Portal Session Settings:
Maximum session timeout: [60▼] minutes
Allow concurrent sessions: ☐ Yes ☑ No

Data Validation:
Validation level: ( ) Standard  (●) Strict  ( ) Lenient

Excel Template:
☑ Include product descriptions
☑ Include category information
☑ Enable data validation dropdowns
☐ Lock product columns
```

---

### Step Footer Actions
| Button Label | Type | Action | Enabled |
|--------------|------|--------|---------|
| Back | Secondary (gray outline) | Return to Step 4 | Always |
| Next: Review | Primary (blue solid) | Validate and proceed to Step 6 | Always (settings optional) |
| Save as Draft | Secondary (gray outline) | Save and exit | Always |

---

## Step 6: Review & Launch

### Section Title
**Text**: Review Campaign
**Description**: Review all settings before launching your campaign

### Review Summary Sections

#### Campaign Overview
```
┌─────────────────────────────────────────────────────┐
│ Campaign Information                                 │
│                                                      │
│ Name: Q1 2024 Kitchen Equipment Pricing             │
│ Type: One-Time                                       │
│ Priority: High ⚠️                                    │
│ Tags: Kitchen Equipment, Q1 2024                    │
│                                                      │
│ [Edit Step 1 →]                                     │
└─────────────────────────────────────────────────────┘
```

---

#### Template Summary
```
┌─────────────────────────────────────────────────────┐
│ Pricelist Template                                   │
│                                                      │
│ Template: Kitchen Equipment Template                │
│ Products: 20 items                                   │
│ Categories: Cookware (8), Appliances (7), Tools (5)│
│ Custom Fields: Lead Time, Certifications            │
│                                                      │
│ [Edit Step 2 →]  [Preview Template →]              │
└─────────────────────────────────────────────────────┘
```

---

#### Vendors Summary
```
┌─────────────────────────────────────────────────────┐
│ Selected Vendors (3)                                 │
│                                                      │
│ ✓ ABC Kitchen Supplies                              │
│   Response: 88% | Quality: 88/100                   │
│                                                      │
│ ✓ Global Foodservice Equipment                      │
│   Response: 82% | Quality: 91/100                   │
│                                                      │
│ ✓ Premium Restaurant Supply                         │
│   Response: 91% | Quality: 85/100                   │
│                                                      │
│ Expected Response Rate: 87%                          │
│ Expected Quality Score: 88/100                       │
│                                                      │
│ [Edit Step 3 →]  [View All Vendors →]              │
└─────────────────────────────────────────────────────┘
```

---

#### Schedule Summary
```
┌─────────────────────────────────────────────────────┐
│ Campaign Schedule                                    │
│                                                      │
│ Type: One-Time Campaign                              │
│ Start: 15 Jan 2024, 09:00 PST                       │
│ End: 31 Jan 2024, 17:00 PST                         │
│ Duration: 16 days, 8 hours                           │
│                                                      │
│ Portal Access:                                       │
│ • Opens: 15 Jan 2024, 09:00                         │
│ • Closes: 31 Jan 2024, 17:00                        │
│                                                      │
│ [Edit Step 4 →]                                     │
└─────────────────────────────────────────────────────┘
```

---

#### Settings Summary
```
┌─────────────────────────────────────────────────────┐
│ Campaign Settings                                    │
│                                                      │
│ Submission Methods:                                  │
│ ✓ Online Entry  ✓ Excel Upload                     │
│                                                      │
│ Approval: Required                                   │
│ Approver: John Doe (Procurement Manager)            │
│                                                      │
│ Automatic Reminders: Enabled                         │
│ • 7 days before deadline                            │
│ • 3 days before deadline                            │
│ • 1 day before deadline                             │
│                                                      │
│ Quality Standards:                                   │
│ • Minimum quality score: 70/100                     │
│ • Require pricing for all products                  │
│                                                      │
│ [Edit Step 5 →]                                     │
└─────────────────────────────────────────────────────┘
```

---

### Pre-Launch Checklist
**Section Title**: Pre-Launch Checklist
**Description**: Verify everything is ready before launching

```
┌─────────────────────────────────────────────────────┐
│ ✅ Campaign information completed                    │
│ ✅ Template selected (20 products)                   │
│ ✅ Vendors selected (3 vendors)                      │
│ ✅ Schedule configured (16 days)                     │
│ ✅ Settings configured                               │
│                                                      │
│ ⚠️ Recommendations:                                  │
│ • Verify vendor email addresses are current         │
│ • Review template products for accuracy             │
│ • Test email templates before launch                │
└─────────────────────────────────────────────────────┘
```

**Status Icons**:
- ✅ Completed
- ⚠️ Warning/Recommendation
- ❌ Error/Blocking issue

---

### Launch Options

#### Launch Timing
```
Launch this campaign:

( ) Now (immediately)
    Invitations will be sent within 5 minutes

( ) Scheduled: [15 Jan 2024] at [09:00]
    Campaign will launch automatically at scheduled time
```

---

#### Final Confirmation
```
☑ I have reviewed all campaign details and confirm they are correct

☑ I understand that vendors will receive invitation emails and can access
  the portal to submit pricing

☐ Send me a copy of the vendor invitation email for review
```

---

### Step Footer Actions
| Button Label | Type | Action | Enabled | Keyboard |
|--------------|------|--------|---------|----------|
| Back | Secondary (gray outline) | Return to Step 5 | Always | - |
| Save as Draft | Secondary (gray outline) | Save without launching | Always | Ctrl/Cmd+S |
| Launch Campaign | Primary (blue solid) | Final validation and launch | If all checks pass | Ctrl/Cmd+Enter |

---

## Launch Confirmation Dialog

### Dialog Header
**Title**: Launch Campaign?
**Icon**: 🚀 Rocket icon
**Close Button**: X icon in top right

### Dialog Body

**Confirmation Message**:
```
You are about to launch:

Campaign: Q1 2024 Kitchen Equipment Pricing
Vendors: 3 vendors will be invited
Products: 20 items to price
Duration: 15 Jan - 31 Jan 2024 (16 days)

What will happen:
1. Campaign status changes to "Active"
2. Invitation emails sent to 3 vendors within 5 minutes
3. Vendors receive unique access links
4. Automatic reminders scheduled
5. You'll receive email confirmation
```

**Final Warning** (if applicable):
```
⚠️ Important Notes:
• Vendor access begins immediately
• You can pause the campaign later if needed
• Submissions cannot be deleted after approval
```

### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Launch Campaign | Primary (blue solid) | Execute launch |
| Go Back | Secondary (gray outline) | Return to review |

---

## Success Page (After Launch)

### Success Header
```
✅ Campaign Launched Successfully!

Q1 2024 Kitchen Equipment Pricing
```

### Success Message
```
Your campaign is now active and vendor invitations are being sent.

Campaign ID: CAM-2401-001234
Launch Time: 23 Jan 2024, 14:35 PST

What's Next:
1. Vendor invitations sending now (estimated 5 minutes)
2. Vendors can access portal starting 15 Jan 2024, 09:00
3. You'll receive email when first submission arrives
4. Monitor progress on the campaign detail page
```

### Next Actions
```
┌─────────────────────────────────────────────────────┐
│ [View Campaign Details]                             │
│ [Monitor Submissions]                               │
│ [Create Another Campaign]                           │
│ [Return to Campaigns List]                          │
└─────────────────────────────────────────────────────┘
```

### Campaign Summary Card
```
┌─────────────────────────────────────────────────────┐
│ Campaign Summary                                     │
│                                                      │
│ Status: 🟢 Active                                    │
│ Vendors Invited: 3                                   │
│ Expected Response Rate: 87%                          │
│ Portal Opens: 15 Jan 2024, 09:00                    │
│ Submission Deadline: 31 Jan 2024, 17:00             │
│                                                      │
│ Invitations:                                         │
│ ⏳ Sending (0 of 3 sent)                            │
│                                                      │
│ Auto-refresh in: 30 seconds                         │
└─────────────────────────────────────────────────────┘
```

---

## Validation Messages

### Step 1 Validation
| Field | Error Condition | Error Message |
|-------|-----------------|---------------|
| Campaign Name | Empty | "Campaign name is required" |
| Campaign Name | Too long | "Campaign name must not exceed 200 characters" |
| Campaign Name | Invalid chars | "Campaign name contains invalid characters: {chars}" |
| Campaign Type | Not selected | "Please select a campaign type" |
| Priority | Not selected | "Please select a priority level" |

### Step 2 Validation
| Field | Error Condition | Error Message |
|-------|-----------------|---------------|
| Template Selection | None selected | "Please select a pricelist template or create a new one" |
| New Template Name | Empty (if creating) | "Template name is required" |
| Product Selection | No products (if creating) | "Please select at least one product for the template" |

### Step 3 Validation
| Field | Error Condition | Error Message |
|-------|-----------------|---------------|
| Vendor Selection | No vendors selected | "Please select at least one vendor to invite" |
| Vendor Selection | Inactive vendor | "Warning: {vendor name} is marked as inactive. Are you sure?" |

### Step 4 Validation
| Field | Error Condition | Error Message |
|-------|-----------------|---------------|
| Start Date | In the past | "Start date must be in the future" |
| End Date | Before start date | "End date must be after start date" |
| Duration | Too short (<3 days) | "⚠️ Campaign duration is very short. Recommend at least 7 days." |
| Recurring End | Before first instance | "Recurring end date must be after first instance" |

### Step 5 Validation
| Field | Error Condition | Error Message |
|-------|-----------------|---------------|
| Submission Methods | None selected | "Please select at least one submission method" |
| Approver | Empty (if approval required) | "Please select an approver for this campaign" |

### Step 6 Validation
| Field | Error Condition | Error Message |
|-------|-----------------|---------------|
| Confirmation | Not checked | "Please confirm you have reviewed all campaign details" |

---

## Status Messages

### Success Messages
| Trigger | Message | Duration |
|---------|---------|----------|
| Draft saved | ✓ Draft saved successfully | 3s |
| Campaign created | ✓ Campaign created successfully | 3s |
| Campaign launched | ✓ Campaign launched! Invitations are being sent. | 5s |
| Step completed | ✓ Step {n} completed | 2s |
| Template preview loaded | ✓ Template preview loaded | 2s |

### Error Messages
| Error Type | Message | Recovery |
|------------|---------|----------|
| Save failed | ✗ Unable to save draft. Please try again. | [Retry] button |
| Network error | ✗ Connection lost. Your progress has been saved locally. | [Retry] [Save Offline] |
| Validation failed | ✗ Please fix the errors highlighted below before continuing. | Scroll to first error |
| Template load failed | ✗ Unable to load template. Please try again or select a different template. | [Retry] [Change Template] |
| Vendor load failed | ✗ Unable to load vendor list. Please refresh the page. | [Refresh] button |

### Warning Messages
| Trigger | Message | Actions |
|---------|---------|---------|
| Short duration | ⚠️ Campaign duration is short. 7+ days recommended. | [Continue Anyway] [Adjust Dates] |
| Low performer vendor | ⚠️ {vendor name} has low response rate ({rate}%). Include anyway? | [Yes] [Remove] |
| Unsaved changes | ⚠️ You have unsaved changes. Save before leaving? | [Save] [Discard] [Stay] |
| Past date | ⚠️ Selected date is in the past. Please choose a future date. | Disable continue |
| Duplicate campaign | ⚠️ Similar campaign exists for same vendors and dates. Continue? | [Yes, Create] [View Existing] |

---

## Loading States

### Loading Messages
| Context | Message | Visual |
|---------|---------|--------|
| Initial page load | Loading campaign builder... | Skeleton wizard steps |
| Template list | Loading templates... | Skeleton list items |
| Vendor list | Loading vendors... | Skeleton vendor cards |
| Template preview | Loading product list... | Skeleton table rows |
| Save draft | Saving... | Button spinner |
| Launch campaign | Launching campaign... | Full-page spinner with progress |

---

## Empty States

### No Templates Available
**Icon**: 📋 Document icon
**Message**:
```
No Templates Found

You don't have any pricelist templates yet.
Create your first template to get started.
```
**Action**: [Create New Template]

### No Vendors Available
**Icon**: 👥 People icon
**Message**:
```
No Vendors Found

No vendors match your filter criteria.
Try adjusting your filters or add new vendors to the system.
```
**Actions**: [Clear Filters] [Add Vendor]

---

## Accessibility

### ARIA Labels
| Element | ARIA Label |
|---------|------------|
| Wizard step | Step {n}: {step name} |
| Next button | Next: {next step name} |
| Back button | Back to {previous step name} |
| Template card | Template: {template name}, {product count} products |
| Vendor card | Vendor: {vendor name}, {response rate}% response rate |
| Date picker | Select {field name} date |
| Save draft | Save campaign draft |
| Launch button | Launch campaign and send invitations |

### Keyboard Navigation
| Shortcut | Action |
|----------|--------|
| Tab | Navigate form fields |
| Enter | Next step (if valid) |
| Ctrl/Cmd+S | Save draft |
| Ctrl/Cmd+Enter | Launch campaign (Step 6) |
| Esc | Cancel action |
| Alt+B | Back to previous step |

---

## Microcopy

### Button Text
| Context | Text | Rationale |
|---------|------|-----------|
| Wizard navigation | Next: {Step Name} | Clear next destination |
| Save action | Save as Draft | Emphasizes non-final state |
| Final action | Launch Campaign | Action-oriented, clear intent |
| Cancel action | Cancel | Short and clear |
| Preview action | Preview {item} | Clear what's being previewed |

### Help Text Patterns
| Field Type | Pattern | Example |
|------------|---------|---------|
| Required field | "This field is required" | - |
| Optional field | "(Optional)" or help context | "Optional: Add tags to organize campaigns" |
| Recommended | "Recommended: {suggestion}" | "Recommended: 7+ days for adequate vendor response time" |
| Warning | "⚠️ {warning text}" | "⚠️ Short campaign duration" |

---

## Notes for Translators

### Translation Context
| Text | Context | Character Limit |
|------|---------|-----------------|
| "Create Price Collection Campaign" | Page title | 50 characters |
| "Launch Campaign" | Primary button | 25 characters |
| "Save as Draft" | Secondary button | 20 characters |
| Step names | Wizard navigation | 25 characters each |
| Field labels | Form labels | 30 characters |
| Help text | Instructional text | 200 characters |

### Non-Translatable Content
| Content | Reason |
|---------|--------|
| Campaign IDs (CAM-2401-001234) | System-generated |
| Email addresses | User data |
| Dates and times | Locale-specific formatting |
| Percentages and numbers | Universal |

---

## Appendix

### Related Pages
- [PC-campaign-list.md](./PC-campaign-list.md) - Campaign list page
- [PC-vendor-portal-submission.md](./PC-vendor-portal-submission.md) - Vendor submission page
- PC-campaign-detail.md - Campaign detail page (to be created)
- PC-template-builder.md - Template builder (to be created)

### Change Log
| Date | Change | Reason | Updated By |
|------|--------|--------|------------|
| 2025-01-23 | Initial version | Created from UC-VPP-002, TS v2.0 | System |

---

**Document End**
