# Page Content: Vendor Portal Price Submission Page

## Document Information
- **Module**: Vendor Management
- **Sub-Module**: Vendor Portal
- **Page**: Price Submission Portal (Vendor-Facing)
- **Route**: `/vendor-portal/{token}`
- **Version**: 2.0.0
- **Last Updated**: 2025-01-23
- **Owner**: UX/Content Team
- **Status**: Draft

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 2.0.0 | 2025-01-23 | System | Initial version based on UC v2.0, TS v2.0, VAL v2.0 |

---

## Overview

**Page Purpose**: Enable vendors to submit pricing information through token-based authenticated access without requiring username/password login. Supports three submission methods: online entry, Excel upload, and Excel template download.

**User Personas**: External vendors invited to price collection campaigns

**Related Documents**:
- [Business Requirements](../BR-vendor-portal.md)
- [Use Cases](../UC-vendor-portal.md)
- [Technical Specification](../TS-vendor-portal.md)
- [Data Dictionary](../DD-vendor-portal.md)
- [Flow Diagrams](../FD-vendor-portal.md)
- [Validation Specification](../VAL-vendor-portal.md)

---

## Page Header

### Campaign Information Banner
**Location**: Top of page, full width
**Style**: Light blue background (bg-blue-50), border-bottom
**Content**:
```
📋 Campaign: {Campaign Name}
⏰ Submission Deadline: {DD MMM YYYY HH:MM}
✓ Auto-save enabled - Your progress is saved automatically
```

### Welcome Message
**Text**:
```
Welcome to {Company Name} Price Collection Portal

You have been invited to submit pricing for {Campaign Name}. Please review the products below and provide your best pricing. You can save your progress and return anytime before the deadline.
```
**Style**: H2, text-gray-700, padding-bottom-4
**Location**: Below campaign banner

---

## Submission Method Tabs

### Tab Navigation
| Tab Label | Purpose | Icon | Default |
|-----------|---------|------|---------|
| Online Entry | Submit prices using web form | 📝 | ✓ |
| Upload Excel | Upload completed Excel pricelist | 📤 | |
| Download Template | Download Excel template to fill offline | 📥 | |

**Tab Styles**:
- Active: bg-white, border-b-2 border-blue-500, text-blue-600
- Inactive: bg-gray-50, text-gray-600, hover:text-gray-900

---

## Tab 1: Online Entry

### Pricelist Header Section

**Section Title**: Pricelist Information
**Layout**: 2-column grid (desktop), stacked (mobile)

#### Form Fields

| Field Label | Type | Required | Placeholder | Validation | Tooltip |
|-------------|------|----------|-------------|------------|---------|
| Currency | Dropdown | Yes | Select currency | Must match supported currencies | Currency for all pricing in this list |
| Effective Start Date | Date picker | Yes | DD/MM/YYYY | Cannot be in past | When these prices become valid |
| Effective End Date | Date picker | No | DD/MM/YYYY (Leave blank for open-ended) | Must be after start date | When prices expire (blank = valid until superseded) |
| General Notes | Textarea | No | Additional information about this pricelist | Max 1000 characters | Optional notes for procurement team |

**Help Text for Open-Ended Pricelist**:
```
💡 Tip: Leave the end date blank if these prices should remain valid until you provide updated pricing.
```

---

### Product List Section

**Section Title**: Product Pricing
**Section Description**:
```
Please provide pricing for the products listed below. You can add multiple MOQ (Minimum Order Quantity) tiers for volume discounts, and include FOC (Free of Charge) promotional quantities if applicable.
```

#### Product List Table

**Table Headers**:
| Column | Sortable | Width | Sticky |
|--------|----------|-------|--------|
| Product Code | No | 120px | No |
| Product Name | No | 250px | No |
| Category | No | 150px | No |
| Your Pricing | No | Flexible | No |
| Actions | No | 100px | No |

**Column Content Formats**:

**Product Code Column**:
- Format: PROD-XXXXX (monospace font)
- Style: text-gray-900, font-medium

**Product Name Column**:
- Format: Full product name
- Description: Light gray below name if available
- Style: text-gray-900 (name), text-gray-500 text-sm (description)

**Category Column**:
- Format: Category badge
- Style: bg-gray-100, text-gray-800, rounded-full, px-3 py-1

**Your Pricing Column**:

**Option A: Simple Single-Tier Pricing**
```
┌─────────────────────────────────┐
│ Base Price:  $___.___ per ___   │
│ Lead Time:   ___ days            │
│ [+ Add MOQ Tiers]                │
└─────────────────────────────────┘
```

**Option B: Multi-Tier MOQ Pricing (Expanded)**
```
┌─────────────────────────────────────────────────────┐
│ Tier 1: MOQ ___ × ___ @ $___.___ per ___ • ___ days │
│ Tier 2: MOQ ___ × ___ @ $___.___ per ___ • ___ days │
│ Tier 3: MOQ ___ × ___ @ $___.___ per ___ • ___ days │
│ [+ Add Tier] [- Remove Last Tier]                   │
│ ─────────────────────────────────────────────────   │
│ FOC: ___ × ___ (Optional)                            │
│ Notes: ________________________________              │
└─────────────────────────────────────────────────────┘
```

**Actions Column**:
- Clear button (trash icon): Reset all pricing for this product
- Tooltip: "Clear all pricing data for this product"

---

### MOQ Tier Pricing Component (Expanded View)

**Component Title**: MOQ Tier Pricing
**Help Text**:
```
Add up to 5 pricing tiers based on order quantity. Higher quantities should have lower per-unit prices.
```

#### Tier Row Fields

| Field | Type | Width | Placeholder | Validation | Inline Error |
|-------|------|-------|-------------|------------|--------------|
| MOQ | Number input | 80px | e.g., 100 | Positive integer, ascending order | "Must be greater than previous tier" |
| Unit | Dropdown | 100px | Select unit | Required | "Unit required" |
| Unit Price | Number input | 120px | 0.00 | Positive, max 4 decimals | "Invalid price format" |
| Per Unit | Text (read-only) | 80px | per {unit} | Auto-filled | - |
| Lead Time | Number input | 80px | days | 1-365 days | "1-365 days" |
| Remove | Icon button | 40px | 🗑️ | - | - |

**Tier Validation Rules**:
- MOQ must increase with each tier (ascending order)
- Unit price typically decreases with higher MOQ (warning if increases)
- Maximum 5 tiers per product
- Minimum 1 tier required for multi-tier pricing

**Warning Message (if unit price increases)**:
```
⚠️ Warning: Unit price increases with higher quantity. Please verify this is correct.
```

---

### FOC (Free of Charge) Component

**Component Title**: Free of Charge (FOC) Promotional Quantity
**Visibility**: Optional, collapsed by default, expand with "+ Add FOC" link

#### FOC Fields

| Field Label | Type | Placeholder | Validation | Tooltip |
|-------------|------|-------------|------------|---------|
| FOC Quantity | Number input | e.g., 10 | Non-negative integer | Free quantity provided per order |
| FOC Unit | Dropdown | Select unit | Required if quantity > 0 | Unit for free quantity (can differ from order unit) |
| FOC Notes | Text input | e.g., "1 free case per 10 cases ordered" | Max 200 characters | Explanation of FOC terms |

**Help Text**:
```
💡 FOC (Free of Charge): Promotional quantities included free with orders. Example: "Buy 10 cases, get 1 case free"
```

---

### Auto-Save Indicator

**Location**: Bottom right corner, fixed position
**Visibility**: Auto-show on save, fade out after 2 seconds

**States**:

**Saving**:
```
🔄 Saving draft...
```
**Saved**:
```
✓ Draft saved at HH:MM
```
**Error**:
```
⚠️ Auto-save failed - Check connection
```

**Style**: Small toast notification, white background, shadow-md

---

### Progress Indicator

**Location**: Top of product list section
**Format**: Progress bar with percentage

```
┌────────────────────────────────────────────┐
│ Completion Progress: ███████░░░ 70%       │
│ 14 of 20 products priced                   │
└────────────────────────────────────────────┘
```

**Color Coding**:
- 0-30%: Red (bg-red-500)
- 31-60%: Yellow (bg-yellow-500)
- 61-99%: Blue (bg-blue-500)
- 100%: Green (bg-green-500)

---

### Page Footer Actions

**Layout**: Fixed bottom bar, full width, white background, shadow-top

| Button Label | Type | Position | Visibility | Tooltip |
|--------------|------|----------|------------|---------|
| Save Draft | Secondary (gray outline) | Left | Always | Save progress and continue later |
| Preview Submission | Secondary (blue outline) | Center | If 1+ products priced | Review before submitting |
| Submit for Review | Primary (blue solid) | Right | If validation passes | Submit pricelist to procurement team |

**Button States**:
- **Enabled**: Full color, cursor-pointer
- **Disabled**: Opacity 50%, cursor-not-allowed
- **Loading**: Spinner icon, text "Processing..."

---

## Tab 2: Upload Excel

### Upload Section

**Section Title**: Upload Completed Pricelist
**Section Description**:
```
Upload your completed Excel pricelist file. The file will be validated automatically, and you'll see any errors that need correction.
```

### File Upload Component

**Upload Area** (Drag & Drop Zone):
```
┌─────────────────────────────────────────────┐
│                    📤                        │
│                                              │
│     Drag and drop your Excel file here      │
│                 or                           │
│            [Choose File]                     │
│                                              │
│   Supported formats: .xlsx, .xls            │
│   Maximum file size: 10 MB                  │
└─────────────────────────────────────────────┘
```

**States**:
- Default: Gray border (border-gray-300), white background
- Drag over: Blue border (border-blue-500), blue background (bg-blue-50)
- Uploading: Blue border, spinner icon
- Success: Green border (border-green-500), green background (bg-green-50)
- Error: Red border (border-red-500), red background (bg-red-50)

---

### Upload Validation Results

**Validation in Progress**:
```
🔄 Validating your file...
├─ Checking file format... ✓
├─ Validating structure... ⏳
├─ Checking product data...
└─ Validating prices...
```

**Validation Success**:
```
✅ File validated successfully!

Summary:
• 18 products with valid pricing
• 2 products with warnings (review recommended)
• 0 errors found

Quality Score: 95/100 ⭐

[View Details] [Submit for Review]
```

**Validation Errors**:
```
❌ Validation failed - Please fix the following errors:

Row 5 (Product: Premium Coffee Beans):
  ⚠️ Error: Unit price must be positive (found: -5.50)

Row 12 (Product: Organic Tea):
  ⚠️ Error: MOQ tier 2 must be greater than tier 1
  ⚠️ Warning: Lead time exceeds 180 days

Row 18 (Product: Sugar):
  ⚠️ Error: Invalid currency code 'XXX'

[Download Error Report] [Fix and Re-upload]
```

---

### Validation Details Accordion

**Expandable Sections**:

**Valid Products (18)**:
- Collapsed by default
- Green checkmark icon
- Product code, name, tiers count

**Products with Warnings (2)**:
- Expanded by default
- Yellow warning icon
- Product code, name, warning messages
- "Warnings won't prevent submission but review is recommended"

**Products with Errors (0)**:
- Expanded by default
- Red error icon
- Product code, name, error messages
- "Must fix all errors before submission"

---

## Tab 3: Download Template

### Template Download Section

**Section Title**: Download Excel Template
**Section Description**:
```
Download a pre-formatted Excel template with all products from this campaign. Fill in your pricing offline and upload the completed file.
```

### Template Information Card

```
┌─────────────────────────────────────────────────────────┐
│  📋 Excel Template for {Campaign Name}                  │
│                                                          │
│  Products: 20 items                                      │
│  Includes: Product codes, names, descriptions, units    │
│  Fill in: Pricing, MOQ tiers, lead times, FOC           │
│                                                          │
│  Template Format:                                        │
│  • Header row with field labels                         │
│  • Product data rows (one per product)                  │
│  • Data validation for dropdowns                        │
│  • Instructions sheet included                          │
│                                                          │
│             [📥 Download Template]                       │
│                                                          │
│  Last generated: DD MMM YYYY HH:MM                       │
│  File size: ~50 KB                                       │
└─────────────────────────────────────────────────────────┘
```

**Download Button**: Primary blue, icon left, medium size

---

### Template Instructions

**Section Title**: How to Use the Template

**Instructions List**:
```
1️⃣ Download the template using the button above

2️⃣ Open the file in Microsoft Excel or compatible application

3️⃣ Navigate to the "Products" sheet

4️⃣ Fill in pricing information for each product:
   • Base price and unit
   • Lead time in days
   • (Optional) Add up to 5 MOQ tiers
   • (Optional) Add FOC promotional quantities

5️⃣ Do NOT modify:
   • Product codes
   • Product names
   • Column headers
   • Sheet structure

6️⃣ Save the file and upload using the "Upload Excel" tab

7️⃣ Review validation results and fix any errors

8️⃣ Submit for review when validation passes
```

---

### Template Preview

**Section Title**: Template Preview
**Content**: Screenshot or table showing template structure

**Sample Template Structure**:

| Product Code | Product Name | Category | Base Unit | Your Price | Your Unit | Lead Time | MOQ Tier 1 | MOQ Tier 2 | FOC Qty | FOC Unit | Notes |
|--------------|--------------|----------|-----------|------------|-----------|-----------|------------|------------|---------|----------|-------|
| PROD-00123 | Premium Coffee | Beverages | kg | ___ | ___ | ___ | (Optional) | (Optional) | ___ | ___ | ___ |
| PROD-00124 | Organic Tea | Beverages | box | ___ | ___ | ___ | (Optional) | (Optional) | ___ | ___ | ___ |

**Column Headers Color**: Blue background (bg-blue-100)
**Required Columns**: Bold text
**Optional Columns**: Normal text with "(Optional)" suffix

---

## Submission Preview Dialog

### Dialog Header
**Title**: Review Your Submission
**Close Button**: X icon in top right

### Dialog Body

**Pricelist Summary Card**:
```
┌─────────────────────────────────────────────┐
│ Pricelist Summary                            │
│                                              │
│ Campaign: {Campaign Name}                    │
│ Currency: {Selected Currency}                │
│ Effective: {Start Date} to {End Date}       │
│                                              │
│ Products Priced: 18 / 20 (90%)              │
│ Quality Score: 85/100                        │
│                                              │
│ Completion Status: ████████░░ 90%           │
└─────────────────────────────────────────────┘
```

**Product Summary Table**:

| Product | Your Pricing | Status |
|---------|--------------|--------|
| Premium Coffee Beans | $15.50/kg • 2 tiers | ✓ Valid |
| Organic Tea Leaves | $22.00/box • 3 tiers • FOC: 1 box/10 | ✓ Valid |
| Raw Sugar | Not priced | ⚠️ Incomplete |

**Pricing Summary**:
```
✓ 18 products with complete pricing
⚠️ 2 products without pricing
ℹ️ 5 products with multi-tier MOQ
ℹ️ 3 products with FOC quantities
```

**Warning Message** (if incomplete):
```
⚠️ Incomplete Submission
You have not provided pricing for 2 products. You can still submit this pricelist, but incomplete submissions may receive lower quality scores.

Would you like to:
• Go back and complete remaining products
• Submit as-is (products without pricing will be excluded)
```

### Dialog Footer

| Button Label | Type | Action | Condition |
|--------------|------|--------|-----------|
| Go Back | Secondary (gray outline) | Close dialog, return to form | Always |
| Submit Anyway | Secondary (yellow outline) | Submit despite warnings | If warnings exist |
| Submit Pricelist | Primary (blue solid) | Final submission | Always |

---

## Submission Confirmation Dialog

### Dialog Header
**Title**: Submission Successful! 🎉
**Close Button**: X icon (closes and returns to read-only view)

### Dialog Body

**Success Message**:
```
✅ Your pricelist has been submitted successfully

Reference Number: PL-2401-001234
Submitted: DD MMM YYYY HH:MM

Your pricing submission is now under review by our procurement team. You will receive an email notification once it has been reviewed.
```

**What Happens Next**:
```
1. Procurement team reviews your submission (typically 2-3 business days)
2. You'll receive email notification of approval or revision request
3. Approved pricing will be activated on the effective start date
4. If revisions are needed, you'll be able to update and resubmit
```

**Submission Details**:
- Campaign: {Campaign Name}
- Products Submitted: 18
- Quality Score: 85/100
- Completeness: 90%

### Dialog Footer

| Button Label | Type | Action |
|--------------|------|--------|
| Download Receipt | Secondary (blue outline) | Download PDF confirmation |
| Close | Primary (blue solid) | Close dialog |

---

## Status Messages

### Success Messages
| Trigger | Message | Duration | Position |
|---------|---------|----------|----------|
| Draft saved | ✓ Draft saved successfully | 3s | Top right toast |
| Excel uploaded | ✓ File uploaded and validated successfully | 3s | Top right toast |
| Template downloaded | ✓ Template downloaded successfully | 3s | Top right toast |
| Pricelist submitted | ✓ Pricelist submitted for review | Permanent | Full-page dialog |

### Error Messages
| Error Type | Message | Recovery Action |
|------------|---------|-----------------|
| Token expired | ⚠️ Your access link has expired. Please contact {Company Name} for a new invitation. | Display email contact |
| Token invalid | ❌ Invalid access link. Please check your email for the correct link. | Display support email |
| Network error | ⚠️ Connection lost. Your progress has been saved. Please check your internet and refresh. | [Retry] button |
| Upload failed | ❌ File upload failed. Please try again or contact support. | [Retry Upload] button |
| Validation failed | ❌ Your submission contains errors. Please review and fix the highlighted issues. | Scroll to first error |
| Session expired | ⚠️ Your session has expired for security. Please click your email link again. | Display re-authentication link |

### Warning Messages
| Trigger | Message | Actions |
|---------|---------|---------|
| Incomplete pricing | ⚠️ You haven't priced all products. Submit anyway or continue editing? | [Submit Anyway] [Continue Editing] |
| Price increase warning | ⚠️ Unit price increases with quantity in tier {n}. Is this correct? | [Yes, Correct] [Fix Price] |
| Large file warning | ⚠️ File size is {size}MB. Upload may take a few moments. Continue? | [Upload] [Cancel] |
| Unsaved changes | ⚠️ You have unsaved changes. Save draft before leaving? | [Save & Leave] [Leave Without Saving] [Stay] |

### Info Messages
| Trigger | Message |
|---------|---------|
| Auto-save active | ℹ️ Your progress is automatically saved every 2 minutes |
| First access | ℹ️ Welcome! You can save your progress anytime and return to complete later |
| Returning user | ℹ️ Welcome back! Resuming from {completion}% complete |
| Deadline approaching | ⚠️ Submission deadline is in {hours} hours. Please submit soon |
| Quality score low | ℹ️ Quality score: {score}/100. Add more detail to improve your score |

---

## Loading States

### Loading Messages
| Loading Context | Message | Visual Indicator |
|-----------------|---------|------------------|
| Initial page load | Loading campaign details... | Full-page skeleton with shimmer |
| Auto-save | Saving draft... | Small spinner next to auto-save indicator |
| File upload | Uploading file... {progress}% | Progress bar in upload zone |
| Validation | Validating data... | Multi-step progress indicator |
| Submit | Submitting pricelist... | Button spinner, disabled state |
| Template download | Preparing template... | Button spinner |

---

## Empty States

### No Products in Campaign
**Icon**: 📋 Empty clipboard
**Message**:
```
No Products in This Campaign

This campaign does not have any products yet. Please contact {Company Name} if you believe this is an error.
```
**Action**: Display support contact email

### Draft Empty (First Visit)
**Icon**: 📝 Document icon
**Message**:
```
Start Your Pricelist

You haven't started pricing yet. Select a submission method above to begin:
• Online Entry - Fill pricing using web form
• Upload Excel - Upload completed Excel file
• Download Template - Fill pricing offline
```

---

## Read-Only Mode (After Submission)

**Page Banner** (Yellow background):
```
📋 Pricelist Submitted - Read Only Mode

Your pricelist was submitted on {DD MMM YYYY HH:MM} and is currently under review.
Status: {Pending Review | Approved | Revision Requested | Rejected}

[View Submission Details] [Download PDF]
```

**Form State**:
- All input fields disabled
- Pricing displayed but not editable
- Grayed out appearance (opacity-60)
- No save or submit buttons
- Display-only mode

**If Revision Requested**:
```
📝 Revisions Requested

The procurement team has requested revisions to your submission.

Revision Notes:
"{Notes from procurement team}"

[Edit Pricelist] [View Original Submission]
```

---

## Responsive Behavior

### Desktop (>1024px)
- 2-column layout for header fields
- Full-width product table with horizontal scroll if needed
- Fixed bottom action bar
- Side-by-side MOQ tier fields

### Tablet (768px - 1024px)
- 1-column layout for header fields
- Product table with horizontal scroll
- Fixed bottom action bar
- Stacked MOQ tier fields

### Mobile (<768px)
- 1-column layout throughout
- Card-based product list (not table)
- Collapsible MOQ tiers
- Bottom action bar with sticky positioning
- Simplified upload zone
- Accordion-style validation results

---

## Accessibility Labels

### ARIA Labels
| Element | ARIA Label | Purpose |
|---------|------------|---------|
| Tab navigation | Navigate submission methods | Screen reader navigation |
| Currency dropdown | Select currency for pricelist | Currency selection |
| Date picker | Select effective date | Date input |
| Price input | Enter unit price for {product} | Price entry |
| MOQ input | Enter minimum order quantity | MOQ entry |
| Add tier button | Add MOQ pricing tier | Add tier action |
| Upload zone | Drag and drop Excel file or click to browse | File upload |
| Submit button | Submit pricelist for review | Final submission |
| Progress indicator | {percentage}% complete, {count} of {total} products priced | Progress status |

### Alt Text for Images/Icons
| Image/Icon | Alt Text |
|------------|----------|
| Campaign icon | Campaign information |
| Success checkmark | Validation passed |
| Error icon | Validation error |
| Warning icon | Warning message |
| Upload icon | Upload file |
| Download icon | Download template |
| Auto-save icon | Progress saved |

---

## Keyboard Navigation

### Tab Order
1. Campaign information (read-only)
2. Submission method tabs
3. Header form fields (currency, dates, notes)
4. Product list (each product pricing section)
5. Save draft button
6. Preview button
7. Submit button

### Keyboard Shortcuts
| Shortcut | Action | Availability |
|----------|--------|--------------|
| Tab | Navigate to next field | Always |
| Shift + Tab | Navigate to previous field | Always |
| Enter | Submit form (if on submit button) | When validation passes |
| Esc | Close dialog/modal | When dialog open |
| Ctrl/Cmd + S | Save draft | Always (while editing) |
| Ctrl/Cmd + Enter | Submit for review | When validation passes |

---

## Validation Indicators

### Field-Level Validation

**Valid Field**:
```
Unit Price: [15.50____] ✓
```
- Green checkmark on right
- Green border (border-green-500)

**Invalid Field**:
```
Unit Price: [-5.50____] ✗
⚠️ Price must be positive
```
- Red X on right
- Red border (border-red-500)
- Error message below in red text

**Warning Field**:
```
Lead Time: [200_____] ⚠️
⚠️ Lead time exceeds 180 days. Verify this is correct.
```
- Yellow warning icon
- Yellow border (border-yellow-500)
- Warning message below in yellow text

### Real-Time Validation
- Validate on blur (when field loses focus)
- Validate on submit attempt
- Display inline errors immediately
- Clear errors when corrected
- Don't validate until user interacts with field

---

## Token Expiration Handling

### Warning Banner (24 hours before expiration)
```
⚠️ Access Expiring Soon
Your access link will expire in {hours} hours ({DD MMM YYYY HH:MM}).
Please submit your pricelist before this time or contact us for an extension.

[Request Extension]
```

### Expired Token Page
```
⏰ Access Link Expired

Your access link expired on {DD MMM YYYY HH:MM}.

To submit pricing, please contact:
{Contact Name}
{Contact Email}
{Contact Phone}

Reference: Campaign "{Campaign Name}"
Token: {Partial Token}
```

---

## Quality Score Display

### Score Badge
**Location**: Next to progress indicator
**Format**:
```
Quality Score: {score}/100 ⭐
```

**Color Coding**:
- 90-100: Gold (text-yellow-600, border-yellow-600)
- 75-89: Silver (text-gray-600, border-gray-600)
- 60-74: Bronze (text-orange-600, border-orange-600)
- 0-59: Red (text-red-600, border-red-600)

### Score Breakdown (Expandable)
```
Quality Score: 85/100 ⭐ [View Breakdown ▼]

┌─────────────────────────────────────────┐
│ Completeness:  ████████░░  90%  (36/40) │
│ Accuracy:      ███████░░░  75%  (22/30) │
│ Detail:        ████████░░  80%  (16/20) │
│ Timeliness:    ██████████ 100%  (10/10) │
└─────────────────────────────────────────┘

Tips to improve your score:
• Provide pricing for all 20 products (+10 points)
• Add MOQ tiers for volume discounts (+5 points)
• Include detailed notes for special items (+3 points)
```

---

## Browser Compatibility Notice

**Supported Browsers**:
```
Optimized for:
✓ Chrome 90+
✓ Firefox 88+
✓ Safari 14+
✓ Edge 90+
```

**Unsupported Browser Warning**:
```
⚠️ Browser Not Fully Supported

You are using {Browser Name} {Version}, which may not support all features.
For the best experience, please use a modern browser like Chrome, Firefox, Safari, or Edge.

[Continue Anyway] [Learn More]
```

---

## Microcopy

### Button Microcopy
| Context | Button Text | Rationale |
|---------|-------------|-----------|
| Primary save | Save Draft | Clear action, indicates work in progress |
| Primary submit | Submit for Review | Emphasizes review process, not final |
| Secondary action | Go Back | Simple navigation |
| Download action | Download Template | Clear what's being downloaded |
| Upload action | Upload File | Matches download terminology |
| Add action | + Add MOQ Tier | Clear addition action |
| Remove action | Remove Tier | Clear removal action |

### Link Text
| Link | Text | Destination |
|------|------|-------------|
| Help link | Need help? Contact us | Support email or help page |
| Instructions | View detailed instructions | Template usage guide |
| Terms | Terms & Conditions | Legal terms page |

### Placeholder Text Patterns
| Input Type | Pattern | Example |
|------------|---------|---------|
| Price | 0.00 | 15.50 |
| Quantity | e.g., 100 | 50 |
| Unit | Select unit | kg, box, case |
| Date | DD/MM/YYYY | 15/01/2024 |
| Notes | Additional information... | Special handling required |

---

## Notes for Translators

### Translation Context
| Text | Context/Usage | Character Limit |
|------|---------------|-----------------|
| "Submit for Review" | Primary action button | 25 characters |
| "Save Draft" | Secondary action button | 20 characters |
| "Quality Score" | Metric label | 20 characters |
| "Completion Progress" | Progress indicator label | 30 characters |
| Tab labels | Navigation tabs | 20 characters each |
| Error messages | Validation feedback | 100 characters |

### Non-Translatable Content
| Content | Reason |
|---------|--------|
| PL-2401-001234 | System-generated reference number format |
| MOQ, FOC | Industry standard abbreviations |
| Currency codes (USD, EUR) | ISO 4217 standard codes |
| DD MMM YYYY | Date format pattern |
| Numbers and percentages | Universal numeric values |

---

## Brand Voice Guidelines

### Tone
- Professional and helpful
- Clear and instructional
- Supportive and encouraging
- Vendor-focused (external audience)

### Writing Style
- Active voice: "Submit your pricelist" not "Your pricelist can be submitted"
- Second person: "your pricing" not "the pricing"
- Present tense for actions: "Submit" not "Will submit"
- Positive language: "Save draft to continue later" not "Don't lose your work"

### Terminology Standards
| Preferred Term | Avoid | Context |
|----------------|-------|---------|
| Pricelist | Price List, Price-List | Pricing submission |
| MOQ Tier | Quantity Break, Volume Tier | Multi-tier pricing |
| FOC | Free Goods, Bonus | Free of charge quantity |
| Lead Time | Delivery Time, Turnaround | Days to delivery |
| Quality Score | Rating, Grade | Submission quality metric |
| Campaign | RFP, Request, Collection | Price collection initiative |

---

## Appendix

### Related Pages
This is the primary vendor-facing page. Future PC documents needed:
- PC-campaign-list.md - Staff campaign management list
- PC-campaign-create.md - Staff campaign creation form
- PC-template-builder.md - Staff pricelist template builder
- PC-submission-review.md - Staff submission review page
- PC-vendor-invitations.md - Staff vendor invitation management

### Content Dependencies
- Campaign data from server (name, products, deadline)
- Vendor session data (token validation)
- Auto-save mechanism (2-minute intervals)
- Quality score calculation
- Validation rules from VAL document
- Email templates for notifications

### Change Log
| Date | Change | Reason | Updated By |
|------|--------|--------|------------|
| 2025-01-23 | Initial version | Created from UC v2.0, TS v2.0, VAL v2.0 specifications | System |

---

**Document End**
