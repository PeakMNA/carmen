# Page Content: Create Purchase Request Form

## Document Information
- **Module**: Procurement
- **Sub-Module**: Purchase Requests
- **Page**: Create Form
- **Route**: `/procurement/purchase-requests/new`
- **Version**: 1.0.0
- **Last Updated**: 2025-10-31
- **Owner**: UX/Content Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-10-31 | Content Team | Initial version from TS specification |

---

## Overview

**Page Purpose**: Create new purchase request with header information, line items, and financial summary. Supports saving as draft or submitting for approval.

**User Personas**: Department Staff (Requestor), Department Managers, Purchasing Staff

**Related Documents**:
- [Business Requirements](../BR-purchase-requests.md)
- [Use Cases](../UC-purchase-requests.md)
- [Technical Specification](../TS-purchase-requests.md)
- [Validations](../VAL-purchase-requests.md)

---

## Page Header

### Page Title
**Text**: Create Purchase Request
**Style**: H1, bold, text-gray-900
**Location**: Top left of page

### Breadcrumb
**Text**: Home / Procurement / Purchase Requests / Create
**Location**: Above page title
**Interactive**: Home, Procurement, and Purchase Requests are clickable links

### Action Buttons (Header)
No action buttons in header area. All actions at bottom of form.

---

## Page Description/Instructions

**Instructional Text**:
```
Fill in the purchase request details below. Add items to your request, review the summary, and save as draft or submit for approval. All fields marked with * are required.
```

**Help Text/Tooltip**:
```
💡 Tip: Save as draft to continue editing later, or submit for approval when ready. You can create requests from templates to save time on recurring orders.
```

---

## Form Sections

### Section 1: Header Information

#### Section Header
**Title**: Request Information
**Description**: Basic information about this purchase request
**Help Icon**: None

#### Form Fields

| Field Label | Type | Placeholder | Help Text | Required | Validation |
|-------------|------|-------------|-----------|----------|------------|
| PR Type * | Dropdown | Select PR type... | Type of purchase request | Yes | Must be General, Market List, or Asset |
| Delivery Date * | Date picker | DD/MM/YYYY | Expected delivery date | Yes | Must be future date, max 365 days from today |
| Department * | Dropdown | Select department... | Department requesting items | Yes | Must be valid active department |
| Delivery Location * | Dropdown | Select location... | Where items will be delivered | Yes | Must be valid active location |
| Description * | Textarea | Enter description... | Brief description of this request | Yes | Minimum 10 characters, maximum 500 characters |
| Justification | Textarea | Enter justification (optional)... | Business justification for this request | No | Maximum 1000 characters |

#### Field-Level Messages

| Field | Message Type | Message Text |
|-------|--------------|--------------|
| PR Type | Error | Please select a PR type |
| Delivery Date | Error | Delivery date is required |
| Delivery Date | Error | Delivery date must be a future date |
| Delivery Date | Error | Delivery date cannot be more than 365 days in the future |
| Department | Error | Please select a department |
| Delivery Location | Error | Please select a delivery location |
| Description | Error | Description is required |
| Description | Error | Description must be at least 10 characters |
| Description | Error | Description cannot exceed 500 characters |
| Justification | Info | Providing justification helps approvers make faster decisions |
| Justification | Error | Justification cannot exceed 1000 characters |

---

### Section 2: Line Items

#### Section Header
**Title**: Line Items
**Description**: Add items to this purchase request
**Help Icon**: 💡 Click "Add Item" to search and select products from the catalog

#### Action Buttons
| Button Label | Purpose | Style | Visibility Rules |
|--------------|---------|-------|------------------|
| Add Item | Open item selection dialog | Secondary (blue outline) | Always visible |
| Create from Template | Open template selection dialog | Secondary (gray outline) | Always visible |

#### Line Items Table

**Table Headers**:
| Column Header | Sortable | Tooltip |
|---------------|----------|---------|
| # | No | Item sequence number |
| Item Name | No | Product name and code |
| Description | No | Item specification |
| Quantity | No | Requested quantity and unit |
| Unit Price | No | Price per unit |
| FOC Qty/Unit | No | Free of charge quantity and unit (if applicable) |
| Tax Rate | No | Applicable tax rate |
| Line Total | No | Total amount for this line (Qty × Price + Tax) |
| Actions | No | Remove item action |

**Column Content Formats**:
| Column | Display Format | Example |
|--------|----------------|---------|
| # | Sequence number | 1, 2, 3 |
| Item Name | Product name (Product code) | Fresh Tomatoes (VEG-001) |
| Description | Specification text | Red, Firm, Grade A |
| Quantity | Number + Unit abbreviation | 10 kg |
| Unit Price | $X,XXX.XX or CURRENCY X,XXX.XX | $5.50 |
| FOC Qty/Unit | Number + Unit abbreviation or "-" | 2 kg or - |
| Tax Rate | Percentage | 7% |
| Line Total | $X,XXX.XX or CURRENCY X,XXX.XX | $58.85 |
| Actions | Icon button (trash) | Delete icon |

#### Empty State (No Items Added)
**Icon**: 📦 Package icon
**Message**:
```
No items added yet
```
**Secondary Message**:
```
Click "Add Item" to search and select products from the catalog, or use "Create from Template" for recurring orders.
```
**Action Button**: Add Item

#### Loading State
**Message**: Loading line items...
**Animation**: Skeleton loading with shimmer effect showing 3 placeholder rows

---

## Dialogs/Modals

### Dialog 1: Item Selection Dialog

#### Dialog Header
**Title**: Add Item to Purchase Request
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
Search and select a product, then enter quantity and pricing details. Real-time inventory levels are shown for reference.
```

**Labels and Fields**:
| Field Label | Placeholder | Help Text | Required |
|-------------|-------------|-----------|----------|
| Search Product * | Search by name or code... | Start typing to search products | Yes |
| Product | (Auto-populated from search) | Selected product information | Yes |
| Specification | Enter specifications... | Item specifications (size, color, grade, etc.) | No |
| Quantity * | Enter quantity... | Requested quantity | Yes |
| Unit * | Select unit... | Unit of measurement (kg, pcs, box, etc.) | Yes |
| Unit Price * | Enter price... | Price per unit | Yes |
| Tax Rate * | Select tax rate... | Applicable tax rate | Yes |
| FOC Quantity | Enter FOC quantity... | Free of charge quantity (if applicable) | No |
| FOC Unit | Select FOC unit... | FOC unit of measurement | No |
| Adjust Price | Checkbox | Lock price from changes | No |
| Budget Code | Select budget code... | Budget allocation code | No |
| Cost Center | Select cost center... | Cost center code | No |
| GL Account | Select GL account... | General ledger account | No |

**Real-time Inventory Panel** (displayed when product selected):
```
Current Stock: 45.5 kg
Allocated: 12.0 kg
Available: 33.5 kg
Reorder Level: 20.0 kg
Last Purchase Price: $5.25/kg
Average Price (30 days): $5.45/kg
```

**Validation Messages**:
| Field | Validation Rule | Error Message |
|-------|-----------------|---------------|
| Product | Required | Please select a product |
| Specification | Max 500 characters | Specification cannot exceed 500 characters |
| Quantity | Required, > 0 | Quantity must be greater than 0 |
| Quantity | Numeric | Quantity must be a valid number |
| Unit | Required | Please select a unit |
| Unit Price | Required, > 0 | Unit price must be greater than 0 |
| Unit Price | Numeric | Unit price must be a valid number |
| Tax Rate | Required | Please select a tax rate |
| FOC Quantity | If provided, > 0 | FOC quantity must be greater than 0 |
| FOC Quantity | Numeric | FOC quantity must be a valid number |
| FOC Unit | Required if FOC Qty provided | FOC unit is required when FOC quantity is specified |

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Add Item | Primary (blue, solid) | Add item to line items table and close dialog |
| Cancel | Secondary (gray outline) | Close dialog without adding item |

---

### Dialog 2: Template Selection Dialog

#### Dialog Header
**Title**: Create from Template
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
Select a template to pre-fill your purchase request with frequently ordered items. You can modify quantities and prices after selecting a template.
```

**Template List**:
- Template search/filter bar
- List of available templates with:
  - Template name
  - Template type (Market List, Standard Order, Fixed Asset)
  - Last used date
  - Estimated total amount
  - Number of items

**Template Detail Preview** (when template selected):
- Template description
- Department/location
- Item count
- Total estimated amount
- List of items with quantities

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Use Template | Primary (blue, solid) | Load template items and close dialog |
| Cancel | Secondary (gray outline) | Close dialog without loading template |

---

### Dialog 3: Discard Changes Confirmation

#### Dialog Header
**Title**: Discard Changes?
**Close Button**: X icon in top right

#### Dialog Body

**Instructional Text**:
```
You have unsaved changes. Are you sure you want to discard this purchase request?
```

**Details Display**:
- **PR Type**: {Selected type}
- **Delivery Date**: {Selected date}
- **Items**: {X} item(s) added
- **Total Amount**: {$X,XXX.XX}

#### Dialog Footer
**Action Buttons**:
| Button Label | Type | Action |
|--------------|------|--------|
| Discard | Destructive (red, solid) | Discard changes and redirect to list page |
| Keep Editing | Primary (blue, solid) | Close dialog and continue editing |
| Save as Draft | Secondary (gray outline) | Save as draft and redirect to detail page |

---

## Financial Summary Panel

### Panel Header
**Title**: Financial Summary
**Location**: Right sidebar or bottom section (responsive)

### Summary Fields

| Field Label | Display Format | Example |
|-------------|----------------|---------|
| Subtotal | $X,XXX.XX or CURRENCY X,XXX.XX | $1,250.00 |
| Discount | $X,XXX.XX or (XX%) | $125.00 (10%) |
| Tax | $X,XXX.XX | $78.75 |
| **Grand Total** | **Bold, larger font, $X,XXX.XX** | **$1,203.75** |
| Currency | Currency code and symbol | USD ($) |
| Items | X item(s) | 5 items |

### Summary States

**No Items**:
```
Subtotal: $0.00
Total: $0.00
0 items
```

**With Items**:
```
Subtotal: $1,250.00
Discount: $125.00 (10%)
Tax: $78.75
Grand Total: $1,203.75

USD ($) • 5 items
```

---

## Action Buttons (Bottom)

### Primary Actions
| Button Label | Style | Position | Visibility Rules |
|--------------|-------|----------|------------------|
| Submit for Approval | Primary (blue, solid) | Bottom right | Always visible |
| Save as Draft | Secondary (white with border) | Bottom right (left of Submit) | Always visible |
| Cancel | Text/Link (gray) | Bottom left | Always visible |

### Button States

| Button | Default Text | Loading Text | Success Text | Disabled State |
|--------|--------------|--------------|--------------|----------------|
| Submit for Approval | Submit for Approval | Submitting... | Submitted! | Disabled when: no items, missing required fields, or validation errors |
| Save as Draft | Save as Draft | Saving... | Saved! | Disabled when: missing header info required fields |
| Cancel | Cancel | - | - | Never disabled |

---

## Status Messages

### Success Messages
| Trigger | Message | Duration |
|---------|---------|----------|
| Draft saved | ✓ Purchase request saved as draft | 3 seconds |
| PR submitted | ✓ Purchase request submitted for approval | 3 seconds |
| Item added | ✓ Item added to purchase request | 2 seconds |
| Item removed | ✓ Item removed | 2 seconds |
| Template loaded | ✓ Template loaded successfully. You can modify items and pricing. | 4 seconds |

### Error Messages
| Error Type | Message | Action |
|------------|---------|--------|
| Validation failed | ✗ Please fix the errors below before submitting | Review form |
| No items | ✗ Cannot submit purchase request without items. Add at least one item. | Add items |
| Save failed | ✗ Unable to save purchase request. Please try again. | Retry button |
| Submit failed | ✗ Unable to submit purchase request. Please try again or save as draft. | Retry button |
| Network error | ✗ Connection error. Your changes may not be saved. Please check your internet connection. | Retry button |
| Template load failed | ✗ Unable to load template. Please try again or create request manually. | Dismiss |

### Warning Messages
| Trigger | Message | Actions |
|---------|---------|---------|
| Low stock | ⚠ Current stock (33.5 kg) is below reorder level (40 kg) | [Continue] |
| Price variance | ⚠ Entered price ($6.50) is 23% higher than average price ($5.28). Verify pricing. | [Continue] [Update Price] |
| Unsaved changes | ⚠ You have unsaved changes. Save before leaving? | [Save as Draft] [Discard] [Cancel] |
| Large quantity | ⚠ Requested quantity (500 kg) is significantly higher than average order (45 kg) | [Continue] [Update Quantity] |
| Budget exceeded | ⚠ Total amount ($5,250) exceeds available budget ($4,800) for selected cost center | [Continue] [Adjust Items] |

### Info Messages
| Trigger | Message |
|---------|---------|
| First time user | ℹ Welcome! Fill in the form below to create your first purchase request. Required fields are marked with * |
| Inventory info | ℹ Inventory levels are updated in real-time and shown for reference when selecting items |
| Approval routing | ℹ This purchase request will require approval from: Department Manager → Finance Manager (if total > $5,000) |
| Template pricing | ℹ Template prices have been updated to current rates. Review and adjust as needed. |

---

## Validation Error Display

### Inline Field Errors
**Location**: Below each field with validation error
**Style**: Red text with error icon
**Behavior**: Show immediately on blur, hide when field becomes valid

**Examples**:
```
❌ Delivery date is required
❌ Quantity must be greater than 0
❌ Description must be at least 10 characters
```

### Form-Level Errors
**Location**: Top of form in error summary box
**Style**: Red background banner with error icon and list
**Behavior**: Show on submit attempt, auto-scroll to first error

**Format**:
```
❌ Please fix the following errors:
• Delivery date is required
• Department is required
• At least one item must be added
• Item #3: Unit price is required
```

---

## Loading States

### Loading Messages
| Loading Context | Message | Visual Indicator |
|-----------------|---------|------------------|
| Initial page load | Loading form... | Skeleton form with shimmer effect |
| Submitting | Submitting purchase request... | Disabled form with spinner overlay |
| Saving draft | Saving draft... | Disabled save button with spinner |
| Loading template | Loading template... | Dialog overlay spinner |
| Adding item | Adding item... | Disabled add button with spinner |
| Product search | Searching products... | Dropdown spinner |

---

## Empty States

### No Items in Line Items Section
| Context | Icon | Primary Message | Secondary Message | Call-to-Action |
|---------|------|-----------------|-------------------|----------------|
| No items added | 📦 | No items added yet | Click "Add Item" to search and select products from the catalog, or use "Create from Template" for recurring orders. | Add Item |

---

## Tooltips and Help Text

### Field Tooltips
| Field/Element | Tooltip Text |
|---------------|--------------|
| PR Type | Type of purchase: General (standard items), Market List (fresh produce), Asset (equipment/furniture) |
| Delivery Date | Expected date for items to be delivered to location |
| Department | Department responsible for this request and budget |
| Delivery Location | Specific location where items will be received |
| Description | Brief summary of what is being requested and why |
| Justification | Optional business reason for this purchase request |
| FOC Qty/Unit | Free of charge items provided by vendor (promotional, samples, etc.) |
| Adjust Price | Lock price to prevent automatic updates from catalog changes |
| Budget Code | Budget allocation for tracking and approval workflow |
| Cost Center | Cost center for financial reporting and analysis |
| GL Account | General ledger account for accounting entries |

### Icon Meanings
| Icon | Meaning |
|------|---------|
| * (asterisk) | Required field |
| 💡 (lightbulb) | Helpful tip or information |
| ⚠️ (warning) | Warning or caution message |
| ❌ (x mark) | Error or validation failure |
| ✓ (checkmark) | Success or validation passed |
| 📦 (package) | Empty state for items |
| 🔍 (magnifying glass) | Search functionality |
| 🗑️ (trash can) | Delete/remove action |

---

## Accessibility Labels

### ARIA Labels
| Element | ARIA Label | Purpose |
|---------|------------|---------|
| PR Type dropdown | Select purchase request type | For screen readers |
| Delivery Date picker | Select delivery date | For screen readers |
| Department dropdown | Select department | For screen readers |
| Location dropdown | Select delivery location | For screen readers |
| Description textarea | Enter purchase request description | For screen readers |
| Justification textarea | Enter business justification (optional) | For screen readers |
| Add Item button | Add item to purchase request | For screen readers |
| Submit button | Submit purchase request for approval | For screen readers |
| Save Draft button | Save purchase request as draft | For screen readers |
| Cancel button | Cancel and return to list | For screen readers |
| Remove item button | Remove item {item number} from purchase request | For screen readers |

### Alt Text for Images/Icons
| Image/Icon | Alt Text |
|------------|----------|
| Empty state icon | No items illustration |
| Loading spinner | Loading data |
| Success checkmark | Success indicator |
| Error icon | Error indicator |
| Warning icon | Warning indicator |

---

## Microcopy

### Button Microcopy
| Context | Button Text | Rationale |
|---------|-------------|-----------|
| Primary action | Submit for Approval | Clear action and outcome - request will be sent to approvers |
| Save without submit | Save as Draft | Explicit that this is a draft state, can continue later |
| Cancel action | Cancel | Short and universally understood |
| Add line item | Add Item | Action-oriented, clear what will be added |
| Template usage | Create from Template | Clear that template is starting point |
| Remove item | Remove | Action verb, shorter than "Delete" |

### Link Text
| Link | Text | Destination |
|------|------|-------------|
| Breadcrumb - Purchase Requests | Purchase Requests | Purchase requests list page |
| Breadcrumb - Procurement | Procurement | Procurement module home |
| Breadcrumb - Home | Home | Application home |
| Template link | Browse Templates | Template management page |

### Placeholder Text Patterns
| Input Type | Pattern | Example |
|------------|---------|---------|
| Dropdown | "Select {field}..." | "Select department..." |
| Textarea | "Enter {field}..." | "Enter description..." |
| Date | "DD/MM/YYYY" | Date picker opens |
| Search | "Search by..." | "Search by name or code..." |
| Number | "Enter {field}..." | "Enter quantity..." |

---

## Error States

### Validation Errors
| Field | Condition | Error Message |
|-------|-----------|---------------|
| PR Type | Empty | Please select a PR type |
| PR Type | Invalid value | Invalid PR type selected |
| Delivery Date | Empty | Delivery date is required |
| Delivery Date | Past date | Delivery date must be a future date |
| Delivery Date | Too far future | Delivery date cannot be more than 365 days in the future |
| Department | Empty | Please select a department |
| Department | Invalid | Selected department is not active |
| Delivery Location | Empty | Please select a delivery location |
| Delivery Location | Invalid | Selected location is not active |
| Description | Empty | Description is required |
| Description | Too short | Description must be at least 10 characters |
| Description | Too long | Description cannot exceed 500 characters |
| Justification | Too long | Justification cannot exceed 1000 characters |
| Line Items | Empty list | At least one item must be added to the purchase request |
| Item Quantity | Empty | Quantity is required |
| Item Quantity | Zero or negative | Quantity must be greater than 0 |
| Item Quantity | Not a number | Quantity must be a valid number |
| Item Unit Price | Empty | Unit price is required |
| Item Unit Price | Zero or negative | Unit price must be greater than 0 |
| Item Unit Price | Not a number | Unit price must be a valid number |

### System Errors
| Error Type | User Message | Recovery Action |
|------------|--------------|-----------------|
| Network error | Unable to connect. Please check your internet connection and try again. | [Retry] button |
| Server error | Something went wrong on our end. Your changes may not be saved. Please try again or contact support. | [Retry] button + Support link |
| Permission error | You don't have permission to create purchase requests. Contact your system administrator. | Redirect to home |
| Session expired | Your session has expired. Please save your work and log in again. | [Save as Draft] button + Login link |
| Database error | Unable to save purchase request. Please try again in a few moments. | [Retry] button |

---

## Keyboard Shortcuts

| Shortcut | Action | Context |
|----------|--------|---------|
| Ctrl/Cmd + S | Save as Draft | When form has focus |
| Ctrl/Cmd + Enter | Submit for Approval | When form has focus and valid |
| Esc | Cancel/Close dialog | When dialog is open |
| Tab | Navigate fields | Always |
| Shift + Tab | Navigate fields backward | Always |

---

## Notes for Translators

### Translation Context
| Text | Context/Usage | Character Limit |
|------|---------------|-----------------|
| "Create Purchase Request" | Page title, main heading | 35 characters |
| "Submit for Approval" | Primary action button | 30 characters |
| "Save as Draft" | Secondary action button | 25 characters |
| "Add Item" | Button to add line item | 20 characters |
| Field labels | Form field labels | 30 characters each |
| Status messages | Success/error messages | 100 characters |
| Help text | Instructional guidance | 200 characters |

### Non-Translatable Content
| Content | Reason |
|---------|--------|
| PR-YYMM-NNNN | System-generated reference format |
| $, USD, EUR | Currency symbols and codes |
| DD/MM/YYYY | Standardized date format pattern |
| Numbers (quantities, prices) | Numeric values |
| Product codes | System identifiers |

---

## Brand Voice Guidelines

### Tone
- Professional and efficient
- Clear and instructional
- Supportive and helpful
- Action-oriented

### Writing Style
- Active voice: "Submit for approval" not "Approval can be requested"
- Second person: "your purchase request" not "user's purchase request"
- Present tense for actions: "Add item" not "Will add item"
- Clear hospitality terminology: Use "Department" not "Cost Center"

### Terminology Standards
| Preferred Term | Avoid | Context |
|----------------|-------|---------|
| Purchase Request | Buy Request, PR Form, Req Form | Always use full term in headers |
| Submit for Approval | Send, Submit, Request Approval | Action button |
| Save as Draft | Save, Draft, Keep | Secondary action |
| Delivery Location | Ship To, Destination | Where items go |
| Line Item | Item, Product, Entry | Individual request item |
| FOC Qty/Unit | Free, Complimentary, Bonus | Free of charge items |

---

## Appendix

### Related Pages
- [PC-list-page.md](./PC-list-page.md) - Purchase Request List Page
- [PC-detail-page.md](./PC-detail-page.md) - Purchase Request Detail Page
- [PC-edit-form.md](./PC-edit-form.md) - Edit Purchase Request Form
- [PC-dialogs.md](./PC-dialogs.md) - Shared Dialogs

### Content Dependencies
- Status badge colors and text shared across all PR pages
- Button labels consistent with other form pages in system
- Error messages follow application-wide validation patterns
- Currency formatting follows financial module standards
- Date formatting follows system-wide settings

### Change Log
| Date | Change | Reason | Updated By |
|------|--------|--------|------------|
| 2025-10-31 | Initial version | Created from TS specification | Content Team |

---

**Document End**

> 📝 **Implementation Notes**:
> - All copy reviewed and approved by UX team
> - Message lengths tested in UI at various screen sizes
> - Validation messages align with VAL-purchase-requests.md
> - Terminology consistent with other procurement pages
> - Accessibility labels meet WCAG AA standards
