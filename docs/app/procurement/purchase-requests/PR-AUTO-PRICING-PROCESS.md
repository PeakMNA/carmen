# PR Auto-Pricing & Vendor Allocation System
## Complete Process Documentation

---

## 1. Executive Summary

This document describes the complete process for automatically pricing Purchase Request (PR) items and allocating the optimal vendor based on business rules. The system addresses a critical operational challenge: comparing vendors who sell the same product in different units and minimum order quantities.

**Business Problem**: When creating a Purchase Request for "10 kg of Premium Coffee", the procurement team needs to evaluate:
- Vendor A sells in 1kg bags at $28/bag (MOQ: 10 bags)
- Vendor B sells in 500g bags at $16/bag (MOQ: 25 bags)
- Vendor C sells in 5kg boxes at $130/box (MOQ: 2 boxes)

Without normalization, comparing these options is confusing and error-prone. This system solves this by:
1. Converting all prices to a common base unit (e.g., price per KG)
2. Converting all MOQs to the same base unit for validation
3. Automatically recommending the best vendor based on configured priorities

---

## 2. Process Overview

### 2.1 High-Level Workflow

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PR AUTO-PRICING WORKFLOW                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  1. ITEM ADDED TO PR                                                │
│     └── User selects product and enters quantity                    │
│                                                                      │
│  2. FETCH VENDOR OPTIONS                                            │
│     └── System retrieves all active price lists for this product    │
│                                                                      │
│  3. NORMALIZE PRICES                                                │
│     └── Convert all vendor prices to base inventory unit            │
│     └── Convert all MOQs to base unit for comparison                │
│                                                                      │
│  4. VALIDATE MOQ                                                    │
│     └── Check if requested quantity meets each vendor's MOQ         │
│     └── Generate warnings for vendors with unmet MOQ                │
│                                                                      │
│  5. SCORE & RANK VENDORS                                            │
│     └── Apply allocation algorithm (preferred item → vendor → price)│
│     └── Calculate overall score for each vendor                     │
│                                                                      │
│  6. RECOMMEND VENDOR                                                │
│     └── Auto-populate price and vendor from top recommendation      │
│     └── Display all alternatives in comparison panel                │
│                                                                      │
│  7. USER REVIEW                                                     │
│     └── User can accept recommendation or manually override         │
│     └── Override requires reason (logged for audit)                 │
│                                                                      │
│  8. QUANTITY CHANGE (if applicable)                                 │
│     └── Recalculate all prices and recommendations                  │
│     └── Update MOQ validation status                                │
│                                                                      │
│  9. PR SUBMISSION                                                   │
│     └── Final validation of all items                               │
│     └── Block submission if critical MOQ issues exist               │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 User Roles and Permissions

| Role | Can Add Items | Can See Prices | Can Select Vendor | Can Override |
|------|---------------|----------------|-------------------|--------------|
| Requestor | ✅ | ❌ (hidden) | ❌ | ❌ |
| Department Manager | ✅ | ✅ (read-only) | ❌ | ❌ |
| Purchasing Staff | ✅ | ✅ | ✅ | ✅ |
| Purchasing Manager | ✅ | ✅ | ✅ | ✅ |

---

## 3. The Unit Conversion Challenge

### 3.1 Problem Statement

In hospitality procurement, the same product is often sold by different vendors in different packaging and units:

**Example: Premium Coffee Beans**
| Vendor | Selling Unit | Unit Price | MOQ | What Customer Gets |
|--------|--------------|------------|-----|-------------------|
| Global Foods | 1kg Bag | $28.00 | 10 bags | 10 kg minimum |
| Coffee Direct | 500g Bag | $16.00 | 25 bags | 12.5 kg minimum |
| Wholesale Plus | 5kg Box | $130.00 | 2 boxes | 10 kg minimum |

**The Challenge**:
- Which vendor offers the best price?
- If the user needs 15 kg, which vendors can fulfill this?
- How do we compare apples to apples?

### 3.2 The Solution: Price Normalization

The system normalizes all prices to the product's **base inventory unit** (the unit used for stock tracking):

**Step 1: Define Conversion Factors**
```
Product: Premium Coffee Beans
Base Inventory Unit: KG (Kilogram)

Order Unit Conversions:
- 1kg Bag → 1.0 KG
- 500g Bag → 0.5 KG
- 5kg Box → 5.0 KG
```

**Step 2: Normalize Prices**
```
Formula: Price Per Base Unit = Unit Price ÷ Conversion Factor

Global Foods:  $28.00 ÷ 1.0 = $28.00 per KG
Coffee Direct: $16.00 ÷ 0.5 = $32.00 per KG
Wholesale Plus: $130.00 ÷ 5.0 = $26.00 per KG  ← BEST PRICE
```

**Step 3: Normalize MOQs**
```
Formula: MOQ in Base Unit = MOQ Quantity × Conversion Factor

Global Foods:  10 bags × 1.0 = 10.0 KG minimum
Coffee Direct: 25 bags × 0.5 = 12.5 KG minimum
Wholesale Plus: 2 boxes × 5.0 = 10.0 KG minimum
```

**Result**: Now the comparison is clear:
| Vendor | Price per KG | Min Order (KG) | For 15 KG Order |
|--------|--------------|----------------|-----------------|
| Global Foods | $28.00 | 10.0 ✅ | $420.00 |
| Coffee Direct | $32.00 | 12.5 ✅ | $480.00 |
| Wholesale Plus | $26.00 | 10.0 ✅ | $390.00 ← BEST |

---

## 4. Vendor Allocation Algorithm

### 4.1 Allocation Priority Rules

The system allocates vendors based on a strict priority hierarchy:

**Priority 1: Preferred Items**
Some products are "locked" to specific vendors due to contracts, quality requirements, or exclusive agreements. If a product is marked as "preferred item" for a vendor, that vendor is always recommended first.

*Example*: "Kobe Beef" is contractually sourced only from "Premium Meats Ltd" - no price comparison needed.

**Priority 2: Preferred Vendors**
If no preferred item relationship exists, the system looks for vendors marked as "preferred" in the vendor master. Preferred vendors get priority over non-preferred vendors, even if their price is slightly higher.

*Example*: "Fresh Produce Co" is a preferred vendor due to excellent quality and reliability - they are recommended unless their price is significantly higher.

**Priority 3: Best Price**
If no preferred relationships exist, the vendor with the lowest normalized price per base unit is recommended.

### 4.2 Scoring Algorithm

When multiple vendors are valid options, the system calculates a score:

```
Vendor Score =
    (Preferred Item Score × 0.35) +
    (Preferred Vendor Score × 0.25) +
    (Price Score × 0.25) +
    (Rating Score × 0.10) +
    (Lead Time Score × 0.05)

Where:
- Preferred Item Score: 100 if preferred item, 0 otherwise
- Preferred Vendor Score: 100 if preferred vendor, 0 otherwise
- Price Score: 100 for lowest price, scaled down for higher prices
- Rating Score: Vendor's 1-5 rating × 20
- Lead Time Score: 100 for shortest lead time, scaled down for longer
```

### 4.3 Recommendation Output

The system provides:
1. **Recommended Vendor** - The highest-scoring vendor
2. **Recommendation Reason** - Why this vendor was chosen:
   - "Preferred item relationship with this vendor"
   - "Preferred vendor with competitive pricing"
   - "Best price among available vendors"
3. **Alternatives** - All other vendors, ranked by score
4. **Warnings** - Any MOQ or availability issues

---

## 5. MOQ Validation Process

### 5.1 Validation Logic

For each vendor option, the system validates:

```
Is Requested Quantity (in base unit) ≥ Vendor's MOQ (in base unit)?

Example:
- User requests: 8 KG of Coffee
- Vendor A MOQ: 10 KG → ❌ Does NOT meet MOQ (gap: 2 KG)
- Vendor B MOQ: 12.5 KG → ❌ Does NOT meet MOQ (gap: 4.5 KG)
- Vendor C MOQ: 5 KG → ✅ Meets MOQ
```

### 5.2 Alert Severity Levels

| Severity | Condition | User Experience |
|----------|-----------|-----------------|
| **Info** | Quantity is 90-100% of MOQ | Blue info badge, can proceed |
| **Warning** | Quantity is 50-90% of MOQ | Amber warning, suggestion to adjust |
| **Error** | Quantity is <50% of MOQ | Red error, blocked from selecting |

### 5.3 Smart Suggestions

When MOQ is not met, the system suggests:
1. **Increase quantity** - "Add 2 more KG to meet Global Foods' minimum"
2. **Alternative vendor** - "Coffee Direct can fulfill this quantity"
3. **Split order** - "Consider ordering 5 KG now and 5 KG next week"

---

## 6. Trigger Points

### 6.1 When Item is Added to PR

**Trigger**: User selects a product from the catalog

**Process**:
1. Fetch all active vendor price lists for this product
2. Get product's base inventory unit and order unit configurations
3. Normalize all vendor prices to base unit
4. Calculate MOQ status for default quantity (usually 1)
5. Run vendor allocation algorithm
6. Auto-populate recommended vendor and price
7. Display price comparison panel (expanded by default for purchasing staff)

**User Experience**:
- Purchasing Staff: Sees full comparison with prices
- Requestors: Sees simplified view (no prices if configured)

### 6.2 When Quantity Changes

**Trigger**: User modifies the quantity field

**Process**:
1. Recalculate requested quantity in base unit
2. Re-validate MOQ for all vendors
3. Recalculate effective prices (considering volume discounts)
4. Re-run vendor allocation algorithm
5. Check if recommendation changed
6. Update UI with new data

**User Experience**:
- If recommendation changes: Toast notification "Vendor recommendation updated based on new quantity"
- If MOQ status changes: Warning banner appears/disappears
- Price comparison table updates in real-time

### 6.3 When PR is Submitted

**Trigger**: User clicks "Submit for Approval"

**Process**:
1. Validate all items have a vendor selected
2. Check MOQ compliance for all items
3. Verify price list validity (not expired)
4. Check vendor status (must be active)
5. Calculate totals and currency conversions
6. If validation passes: Submit PR
7. If validation fails: Show error summary, block submission

**Validation Errors**:
| Error | Severity | Action |
|-------|----------|--------|
| No vendor selected | Critical | Block submission |
| MOQ not met (error level) | Critical | Block submission |
| Price list expired | Critical | Block submission |
| Vendor inactive | Critical | Block submission |
| MOQ not met (warning level) | Warning | Allow with confirmation |

### 6.4 Manual Override

**Trigger**: Purchasing staff clicks "Select" on a non-recommended vendor

**Process**:
1. Prompt for override reason (required field)
2. Log the override in audit trail:
   - Original recommended vendor
   - Selected vendor
   - Reason provided
   - User who overrode
   - Timestamp
3. Update item with selected vendor
4. Mark item as "manually selected" (visible indicator)
5. Continue with selected vendor for all calculations

**Override Reasons** (predefined + custom):
- "Better relationship with this vendor"
- "Previous quality issues with recommended vendor"
- "Urgent delivery required, this vendor is faster"
- "Volume discount on full order"
- "Other: [free text]"

---

## 7. User Interface Specifications

### 7.1 Price Comparison Panel

**Location**: Inline with each PR item, expandable

**Table Columns**:
| Column | Description | Example |
|--------|-------------|---------|
| Vendor | Vendor name with badges | "Global Foods ★★★★☆" |
| Preferred | Icons for preferred item/vendor | ⭐ Item, 💼 Vendor |
| Selling Unit | Vendor's unit with conversion | "500g Bag (0.5 KG)" |
| Unit Price | Price in vendor's unit | "$16.00/bag" |
| **Price/KG** | Normalized price (highlighted) | "**$32.00/KG**" |
| MOQ | Minimum order in both units | "25 bags (12.5 KG)" |
| MOQ Status | Visual indicator | ✅ Met / ⚠️ Gap: 2 KG |
| Lead Time | Days to delivery | "3 days" |
| Rating | Vendor rating | "4.5 ★" |
| Total | Cost for requested quantity | "$320.00" |
| Status | Recommendation badge | "✓ Recommended" |
| Action | Selection button | [Select] |

**Sorting**: Default by score (recommended first), user can sort by any column

**Filtering**:
- "Show only vendors meeting MOQ" toggle
- "Show only preferred vendors" toggle

### 7.2 MOQ Warning Banner

**Appearance**: Amber banner above the price comparison panel

**Content**:
```
⚠️ Quantity Alert

Your requested quantity (8 KG) does not meet the minimum order for some vendors:

• Global Foods: Minimum 10 KG (need 2 KG more)
• Coffee Direct: Minimum 12.5 KG (need 4.5 KG more)

[Adjust to 10 KG] [Show Alternative Vendors] [Dismiss]
```

### 7.3 Recommendation Badge

**Displayed on recommended vendor row**:
- Green badge with checkmark: "✓ Recommended"
- Tooltip on hover: "Recommended because: Best price among available vendors"

### 7.4 Manual Override Indicator

**Displayed when user overrides recommendation**:
- Orange badge: "⚡ Manually Selected"
- Tooltip: "Override reason: Better relationship with this vendor"

---

## 8. Data Requirements

### 8.1 Product Unit Configuration

Each product needs unit conversion data:

```
Product: Premium Coffee Beans (ID: PRD-001)
├── Base Inventory Unit: KG
├── Order Units:
│   ├── BAG-1KG:  1kg Bag,  Conversion: 1.0,  Default: Yes
│   ├── BAG-500G: 500g Bag, Conversion: 0.5,  Default: No
│   └── BOX-5KG:  5kg Box,  Conversion: 5.0,  Default: No
```

### 8.2 Vendor Price List Structure

Each vendor price list item needs:

```
Vendor: Global Foods (VEN-001)
Product: Premium Coffee Beans (PRD-001)
├── Selling Unit: BAG-1KG
├── Unit Price: $28.00
├── Currency: USD
├── Minimum Order Quantity: 10 (in selling unit)
├── Lead Time: 3 days
├── Valid From: 2025-01-01
├── Valid To: 2025-12-31
├── Is Preferred Item: No
│
└── (Calculated on load)
    ├── Conversion to Base: 1.0
    ├── Price per Base Unit: $28.00
    └── MOQ in Base Unit: 10.0 KG
```

### 8.3 Vendor Preferences

```
Vendor: Global Foods (VEN-001)
├── Is Preferred Vendor: Yes
├── Rating: 4.5
├── On-Time Delivery Rate: 95%
├── Quality Rating: 4.8
└── Status: Active

Preferred Items for this Vendor:
├── PRD-001: Premium Coffee Beans ❌
├── PRD-015: Wagyu Beef ✅ (Exclusive supplier)
└── PRD-022: Truffle Oil ✅ (Contract requirement)
```

---

## 9. Error Handling

### 9.1 Missing Unit Configuration

**Scenario**: Product has no unit conversion data defined

**Handling**:
1. Log warning for data team
2. Fallback: Use product's default unit as base unit
3. Assume conversion factor of 1.0
4. Display warning: "Unit conversion not configured - prices shown as-is"

### 9.2 No Active Price Lists

**Scenario**: No vendors have active price lists for this product

**Handling**:
1. Allow manual price entry (for purchasing staff only)
2. Display notice: "No vendor price lists available"
3. Suggest: "Contact purchasing team to request quotes"
4. Log for procurement dashboard (items needing price lists)

### 9.3 All Vendors Below MOQ

**Scenario**: Requested quantity is less than all vendors' MOQ

**Handling**:
1. Show all vendors with warning badges
2. Display banner: "No vendors can fulfill this quantity"
3. Suggest minimum viable quantity
4. Allow override for purchasing staff (with reason)

### 9.4 Currency Conversion Failure

**Scenario**: Cannot convert vendor's currency to organization's base currency

**Handling**:
1. Use last known exchange rate
2. Flag price as "estimated" with warning icon
3. Tooltip: "Exchange rate not available - using rate from [date]"
4. Block auto-selection, require manual confirmation

---

## 10. Audit Trail

### 10.1 Events Logged

| Event | Data Captured |
|-------|---------------|
| Price Fetched | Product, vendors found, prices, timestamp |
| Vendor Recommended | Product, recommended vendor, score, reason |
| Vendor Selected | Product, selected vendor, was recommended (Y/N) |
| Manual Override | Product, original vendor, new vendor, reason, user |
| MOQ Warning Shown | Product, vendor, gap amount |
| MOQ Warning Dismissed | Product, vendor, user |
| Quantity Changed | Product, old quantity, new quantity, price recalculated |
| Validation Failed | Product, reason, blocked (Y/N) |

### 10.2 Audit Report

Purchasing managers can generate reports:
- "Override Report": All manual overrides with reasons
- "MOQ Violations": Orders placed below MOQ with approvals
- "Price Variance": Comparison of selected vs recommended prices
- "Vendor Performance": Allocation patterns and savings

---

## 11. Implementation Reference

### Files Created

| File | Description |
|------|-------------|
| `lib/types/unit-conversion.ts` | Unit conversion and normalized pricing types |
| `lib/services/unit-conversion-service.ts` | Unit conversion logic |
| `lib/services/vendor-allocation-service.ts` | Vendor scoring and allocation |
| `lib/services/pr-auto-pricing-service.ts` | Main orchestrator service |
| `lib/mock-data/product-unit-configs.ts` | Product unit configuration data |
| `app/(main)/procurement/purchase-requests/components/enhanced-price-comparison.tsx` | Price comparison UI |
| `app/(main)/procurement/purchase-requests/components/moq-warning-banner.tsx` | MOQ warning component |
| `app/(main)/procurement/purchase-requests/hooks/use-pr-auto-pricing.ts` | React hook for integration |

### Key Formulas

```typescript
// Normalize price to base unit
pricePerBaseUnit = unitPrice / conversionToBase
// Example: $16/500g bag → $16/0.5 = $32/KG

// Convert MOQ to base unit
moqInBaseUnit = moqQuantity * conversionToBase
// Example: 25 bags × 0.5 = 12.5 KG

// Check MOQ compliance
meetsRequirement = requestedInBaseUnit >= moqInBaseUnit

// Vendor score
score = (preferredItem * 0.35) + (preferredVendor * 0.25)
      + (priceScore * 0.25) + (rating * 0.10) + (leadTime * 0.05)
```

---

## 12. Usage Examples

### Example 1: Simple Product Selection

```typescript
import { usePRAutoPricing } from '@/app/(main)/procurement/purchase-requests/hooks/use-pr-auto-pricing'

function PRItemForm({ productId }) {
  const {
    state,
    fetchPricing,
    selectVendor,
    getSelectedVendor
  } = usePRAutoPricing({
    productId,
    initialQuantity: 10,
    initialUnit: 'KG'
  })

  // Auto-pricing is fetched on mount
  // Recommended vendor is auto-selected
  // User can change vendor via selectVendor()
}
```

### Example 2: Quantity Change Handling

```typescript
const handleQuantityChange = async (newQuantity: number) => {
  await updateQuantity(newQuantity)

  // Check if recommendation changed
  if (state.comparison?.recommendedVendor) {
    toast.info('Vendor recommendation updated')
  }

  // Check for MOQ warnings
  if (state.comparison?.hasMOQWarnings) {
    // Show MOQ warning banner
  }
}
```

### Example 3: PR Submission Validation

```typescript
const handleSubmit = () => {
  const validation = validateForSubmission()

  if (!validation.canSubmit) {
    toast.error(`Cannot submit: ${validation.blockedItems.length} items have MOQ issues`)
    return
  }

  if (validation.warningItems.length > 0) {
    // Show confirmation dialog
    if (!confirm('Some items have MOQ warnings. Continue?')) {
      return
    }
  }

  // Proceed with submission
  submitPR()
}
```
