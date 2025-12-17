# Page Content: Pricelist Template Detail Page

## Document Information
- **Module**: Vendor Management
- **Sub-Module**: Pricelist Templates
- **Page**: Template Detail (Staff-Facing)
- **Route**: `/vendor-management/templates/[id]`
- **Version**: 2.0.0
- **Last Updated**: 2025-11-25
- **Owner**: UX/Content Team
- **Status**: Updated

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 2.0.0 | 2025-11-25 | System | Updated to match actual code implementation - 2 tabs instead of 6 |
| 1.0.0 | 2025-11-23 | System | Initial version |

---

## Overview

**Page Purpose**: Display comprehensive details of a single pricelist template including basic information, product selection, and associated Request for Pricing campaigns.

**User Personas**: Procurement Manager, Procurement Staff, Finance Manager, Department Manager

**Related Documents**:
- [Business Requirements](../BR-pricelist-templates.md)
- [Technical Specification](../TS-pricelist-templates.md)
- [List Page](PC-template-list.md)
- [Create Page](PC-template-create.md)

---

## Page Layout

**Container**: space-y-6 p-6
**Structure**: Header with actions, Template Configuration Card with tabs

---

## Page Header

### Back Button
**Icon**: ChevronLeft
**Style**: variant="ghost"
**Action**: router.back()

### Template Title Row
**Layout**: flex items-center justify-between

#### Left Side
- **Template Name**: text-2xl font-semibold
- **Status Badge**: Adjacent to name with appropriate color

#### Status Badge Colors
| Status | Style |
|--------|-------|
| active | bg-green-100 text-green-800 |
| draft | bg-yellow-100 text-yellow-800 |
| inactive | bg-gray-100 text-gray-800 |

### Template Description
**Text**: Template description or "No description provided"
**Style**: text-muted-foreground mt-1

### Header Action Buttons
| Button Label | Purpose | Style | Icon |
|--------------|---------|-------|------|
| Preview | Open template preview modal | Secondary (outline, size-sm) | Eye |
| Generate Excel | Download Excel template | Secondary (outline, size-sm) | Download |
| Duplicate | Create copy of template | Secondary (outline, size-sm) | Copy |
| Edit | Navigate to edit page | Primary (bg-blue-600, size-sm) | Edit |
| Delete | Open delete confirmation | Destructive (outline, text-red-600, size-sm) | Trash2 |

---

## Template Configuration Card

### Template Number Display
**Location**: Top of card content with border-b pb-4
**Label**: Template #
**Value**: Template ID or fallback "TPL-2401-0001"
**Style**: font-mono text-sm font-semibold text-blue-600

---

### Vendor Instructions Section

**Label**: Vendor Instructions
**Icon**: Info (h-4 w-4 text-blue-600)
**Helper Text**: Provide clear instructions and requirements for vendors when submitting pricing

**Content Display**:
- **Container**: min-h-[80px] p-3 border rounded-lg bg-gray-50
- **Content**: Template instructions or fallback text
- **Fallback**: "Please provide competitive pricing for all office supplies"

---

### Configuration Grid

**Layout**: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6

#### Column 1: Currency
**Label**: Currency
**Helper**: Default currency for all pricing submissions
**Display**: Template defaultCurrency value in bordered box (p-2 border rounded-lg bg-gray-50)

#### Column 2: Validity Period
**Label**: Validity Period
**Helper**: How long prices remain valid (in days)
**Display**: Template validityPeriod value with "days" suffix

#### Column 3: Template Status
**Label**: Template Status
**Helper**: Active templates can be sent to vendors
**Display**: Toggle switch visualization showing current status
- **Labels**: "Inactive" (left) and "Active" (right)
- **Toggle Style**: h-6 w-11 rounded-full
- **Active**: bg-blue-600 with translate-x-6
- **Inactive**: bg-gray-200 with translate-x-1

#### Column 4: Template History
**Label**: Template History
**Helper**: Creation and modification timestamps
**Display**:
- Created: Full date/time format
- Updated: Full date/time format
**Date Format**: Using Intl.DateTimeFormat 'en-US' with full month, day, year, hour, minute

---

## Tabs Section

### Tab Navigation
**Component**: Tabs with TabsList and TabsTrigger
**Available Tabs**:
| Tab Value | Label |
|-----------|-------|
| products | Product Selection |
| campaigns | RfP |

**Default**: products

---

## Tab 1: Product Selection

### Product Selection Card

#### Card Header
**Title**: Products in Template ({count})
**Icon**: Package (h-5 w-5)
**Description**: Dynamic based on selection state

#### Description Logic
- If no selections: "No selections made. Products will appear here based on template configuration."
- If selections exist: "These products will be included in the template based on your selections."

### Product List
**Container**: max-h-96 overflow-y-auto space-y-2

#### Product Row
**Layout**: flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100
**Hover Effect**: transition-colors

**Left Side**:
- Green indicator dot (w-2 h-2 bg-green-500 rounded-full)
- Product name (font-medium text-sm)
- Category path (text-xs text-muted-foreground): Category → Subcategory → Item Group

**Right Side**:
- Product code (text-xs font-medium)
- Unit (text-xs text-muted-foreground): "Unit: {defaultOrderUnit}"

### Empty State
**Icon**: Package (h-12 w-12, opacity-50)
**Title**: No products selected
**Message**: Varies based on whether selections exist

### Summary Section
**Condition**: Show when products exist
**Container**: mt-4 pt-4 border-t bg-blue-50 rounded-lg p-4
**Left Content**: Summary: {count} products will be included in this template
**Right Content**: Badge with count
**Helper**: "These are all the products that will be included when creating Excel templates or requests for pricing."

---

## Tab 2: RfP (Request for Pricing)

### Associated Requests Card

#### Card Header
**Title**: Associated Requests for Pricing
**Description**: Requests for pricing that use this template

**Action Button**:
- **Label**: Create Request for Pricing
- **Icon**: Plus
- **Action**: Navigate to `/vendor-management/campaigns/new?templateId={id}`

### Empty State
**Icon**: TrendingUp (h-8 w-8, opacity-50)
**Message**: No requests for pricing using this template yet
**Helper**: Create your first request for pricing to start collecting prices

### Campaign List
**Layout**: space-y-4

#### Campaign Card
**Style**: Card with border-l-4 border-l-blue-500

**Header Row**:
- Campaign name (font-medium)
- Status badge
- Priority badge

**Priority Badge Colors**:
| Priority | Style |
|----------|-------|
| urgent | bg-red-100 text-red-800 |
| high | bg-orange-100 text-orange-800 |
| medium | bg-yellow-100 text-yellow-800 |
| low | bg-green-100 text-green-800 |

**Campaign Status Colors**:
| Status | Style |
|--------|-------|
| active | bg-green-100 text-green-800 |
| draft | bg-yellow-100 text-yellow-800 |
| inactive | bg-gray-100 text-gray-800 |
| paused | bg-orange-100 text-orange-800 |
| completed | bg-blue-100 text-blue-800 |
| cancelled | bg-red-100 text-red-800 |

**Description**: Campaign description (text-sm text-muted-foreground)

**Metrics Row** (text-sm text-muted-foreground):
| Metric | Icon | Value |
|--------|------|-------|
| Vendors | Users | {totalVendors} vendors |
| Completed | CheckCircle | {submissionsCompleted} completed |
| Response Rate | BarChart3 | {responseRate}% response rate |
| Start Date | Calendar | Formatted date |

**Action Buttons**:
| Button | Icon | Action |
|--------|------|--------|
| View | Eye | Navigate to campaign detail |
| Duplicate | Copy | Navigate to create with duplicateFrom param |

**Progress Bar**:
- **Container**: w-full bg-gray-200 rounded-full h-1.5
- **Fill**: bg-blue-600 with width based on completion percentage
- **Label**: Shows percentage above bar

---

## Modals

### Template Preview Modal
**Trigger**: Preview button click
**Component**: TemplatePreview
**Props**:
- template: Current template data
- onClose: Function to close modal

### Delete Confirmation Dialog
**Component**: AlertDialog

**Header**:
- **Title**: Delete Template
- **Description**: Are you sure you want to delete "{template.name}"? This action cannot be undone and will affect any campaigns using this template.

**Footer**:
| Button | Type | Action |
|--------|------|--------|
| Cancel | AlertDialogCancel | Close dialog |
| Delete Template | AlertDialogAction (bg-red-600) | Execute delete |

---

## Status Messages (Toasts)

### Success Messages
| Trigger | Message |
|---------|---------|
| Template duplicated | Template duplicated successfully |
| Status changed to active | Template activated |
| Status changed to inactive | Template deactivated |
| Status changed to draft | Template saved as draft |
| Template deleted | Template deleted successfully |
| Excel generated | Excel template generated successfully |

### Error Messages
| Trigger | Message |
|---------|---------|
| Load failed | Failed to load template |
| Duplicate failed | Failed to duplicate template |
| Status update failed | Failed to update template status |
| Delete failed | Failed to delete template |
| Excel generation failed | Failed to generate Excel template |

---

## Loading State

**Structure**: Same layout with skeleton placeholders
**Animation**: animate-pulse on gray placeholder elements
**Content**: 3 skeleton cards with placeholder rectangles

---

## Not Found State

**Icon**: FileSpreadsheet (h-12 w-12, text-muted-foreground)
**Title**: Template not found
**Message**: The template you're looking for doesn't exist.
**Action**: Back button (ChevronLeft icon)

---

## Navigation

### Entry Points
- List page row click (View action)
- Direct URL: `/vendor-management/templates/{id}`

### Exit Points
| Action | Destination |
|--------|-------------|
| Back button | Previous page |
| Edit button | `/vendor-management/templates/{id}/edit` |
| Delete success | `/vendor-management/templates` |
| Duplicate success | `/vendor-management/templates` |
| Create RfP | `/vendor-management/campaigns/new?templateId={id}` |
| View Campaign | `/vendor-management/campaigns/{campaignId}` |

---

## Data Dependencies

### Required Data
- Template details from mockTemplates or API
- Campaign data from mockCampaigns filtered by templateId
- Product data resolved via resolveProductsWithInfo utility

### Utility Functions
- `resolveProductsWithInfo(productSelection)`: Resolves product IDs to full product info
- `getCategoryName(id)`: Gets category display name
- `getSubcategoryName(id)`: Gets subcategory display name
- `getItemGroupName(id)`: Gets item group display name

---

**Document End**
