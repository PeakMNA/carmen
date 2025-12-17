# Blue Ledger Reports - Product Requirement Documents & Template Structures

**Document Version:** 1.0  
**Date:** February 24, 2025  
**Purpose:** Detailed PRD and template specifications for all Blue Ledger reports

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Table of Contents

1. [Purchase Request Reports (PRD)](#purchase-request-reports-prd)
2. [Purchase Order Reports (PRD)](#purchase-order-reports-prd)
3. [Receiving Reports (PRD)](#receiving-reports-prd)
4. [Credit Note Reports (PRD)](#credit-note-reports-prd)
5. [Vendor Reports (PRD)](#vendor-reports-prd)
6. [Product Reports (PRD)](#product-reports-prd)
7. [Inventory Reports (PRD)](#inventory-reports-prd)
8. [Template Structure Standards](#template-structure-standards)

---

## Purchase Request Reports (PRD)

### Report #1: Purchase Request List Report

#### Product Requirement Document

**Report ID:** PR-001  
**Report Name:** Purchase Request List Report  
**Module:** Purchase Request (PR)  
**Priority:** High  
**Status:** Approved - OK

#### 1. Executive Summary

This report displays a summary list of all Purchase Requests (PR) within a specified date range, allowing users to quickly view and filter PRs by status, delivery date, and type.

#### 2. Business Objectives

- **Primary Goal:** Provide quick overview of all purchase requests
- **Users:** Purchasing managers, department heads, finance team
- **Frequency:** Daily to weekly usage
- **Key Metrics:** PR count by status, total PR value, pending approvals

#### 3. Functional Requirements

**3.1 Filter Parameters**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| Date From To | Date Range | Yes | Current Month | PR creation date range |
| Delivery Date From To | Date Range | No | - | Expected delivery date range |
| Status | Multi-select | No | All | PR status filter |
| PR Type | Dropdown | No | All | Type of purchase request |

**3.2 Data Columns**

| Column Name | Thai Description | Data Type | Width | Alignment | Format |
|-------------|------------------|-----------|-------|-----------|--------|
| Date | วันที่ PR | Date | 100px | Center | DD/MM/YYYY |
| PR.NO | หมายเลข PR | Text | 120px | Left | PR-YYYYMMDD-XXXX |
| Description | Description header PR | Text | 250px | Left | Text |
| Department Request | Department Request | Text | 150px | Left | Text |
| Delivery Date | วันที่ส่งสินค้า | Date | 110px | Center | DD/MM/YYYY |
| PR Type | ประเภทของ PR | Text | 120px | Center | Text |
| Status | สถานะ PR | Text | 100px | Center | Badge/Label |
| Total | ยอดสุทธิของ PR | Currency | 130px | Right | #,##0.00 |

**3.3 Template Structure**

```
┌─────────────────────────────────────────────────────────────┐
│             Purchase Request List Report                      │
│                                                               │
│  Filters:                                                     │
│  ├─ Date From To: [____] to [____]                          │
│  ├─ Delivery Date From To: [____] to [____]                 │
│  ├─ Status: [All/Draft/Pending/Approved]                    │
│  └─ PR Type: [All/Stock/Service/Other]                      │
│                                                               │
├─────────┬────────┬─────────────┬────────────┬──────────────┤
│  Date   │ PR.NO  │ Description │ Department │ Delivery Date│
│         │        │             │  Request   │              │
├─────────┼────────┼─────────────┼────────────┼──────────────┤
│วันที่ PR │หมายเลข│Description  │Department  │วันที่ส่งสินค้า│
│         │  PR    │  header PR  │  Request   │              │
├─────────┼────────┼─────────────┼────────────┼──────────────┤
│20/02/25 │PR-2025 │Office       │Finance     │25/02/2025    │
│         │0220-001│Supplies     │            │              │
└─────────┴────────┴─────────────┴────────────┴──────────────┘

    ┌──────────┬────────┬──────────┐
    │ PR Type  │ Status │  Total   │
    ├──────────┼────────┼──────────┤
    │ประเภทของ │สถานะ PR│ยอดสุทธิ  │
    │   PR     │        │  ของ PR  │
    ├──────────┼────────┼──────────┤
    │ Stock    │Approved│ 15,500.00│
    └──────────┴────────┴──────────┘
```

#### 4. Business Rules

1. **Display Rules:**
   - Show summary information only (one row per PR)
   - Default sort: PR Date descending
   - Maximum 100 rows per page with pagination

2. **Status Values:**
   - Draft (yellow badge)
   - Pending Approval (orange badge)
   - Approved (green badge)
   - Rejected (red badge)
   - Cancelled (gray badge)

3. **Calculation Rules:**
   - Total = Sum of all line items (net amount after discount and tax)
   - Display in PR currency

4. **Access Rules:**
   - Users can only see PRs from their department unless they have cross-department access
   - Finance team sees all PRs

#### 5. UI/UX Requirements

- Display in system grid with print capability
- Clickable PR.NO links to PR detail view
- Status badges with color coding
- Export to Excel button
- Print button with preview
- Quick filters for common date ranges (Today, This Week, This Month)

#### 6. Performance Requirements

- Load within 3 seconds for standard month query
- Support up to 10,000 PRs without performance degradation
- Pagination for large result sets

#### 7. Integration Points

- PR Master data table
- Department master
- User permissions
- Status workflow system

---

### Report #2: Purchase Request Detail Report

#### Product Requirement Document

**Report ID:** PR-002  
**Report Name:** Purchase Request Detail Report  
**Module:** Purchase Request (PR)  
**Priority:** High  
**Status:** Approved - OK

#### 1. Executive Summary

This report provides comprehensive details of Purchase Requests including all line items with products, quantities, pricing, taxes, and delivery information.

#### 2. Business Objectives

- **Primary Goal:** Detailed analysis and verification of PR line items
- **Users:** Purchasing officers, auditors, finance team
- **Frequency:** Weekly to monthly for review and audit
- **Key Metrics:** Line item details, quantity analysis, pricing verification

#### 3. Functional Requirements

**3.1 Filter Parameters**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| Date From To | Date Range | Yes | Current Month | PR creation date range |
| Vendor From To | Vendor Range | No | All | Vendor code range |
| Location From To | Location Range | No | All | Store location range |
| Status | Multi-select | No | All | PR status filter |

**3.2 Data Columns**

| Column Name | Thai Description | Data Type | Width | Alignment | Format |
|-------------|------------------|-----------|-------|-----------|--------|
| Store Location | สถานที่ | Text | 120px | Left | Text |
| Product ID | รหัสสินค้า | Text | 100px | Left | Text |
| Description | รายละเอียด | Text | 250px | Left | Text |
| Order Qty | จำนวน | Decimal | 90px | Right | #,##0.00 |
| Order Unit | หน่วย | Text | 70px | Center | Text |
| Foc Qty | FOC | Decimal | 80px | Right | #,##0.00 |
| Price | ราคา | Currency | 100px | Right | #,##0.00 |
| Discount | ส่วนลด | Currency | 90px | Right | #,##0.00 |
| Tax Amount | ภาษี | Currency | 90px | Right | #,##0.00 |
| Net Amount | ยอดสุทธิ | Currency | 120px | Right | #,##0.00 |

**3.3 Template Structure**

```
┌──────────────────────────────────────────────────────────────────┐
│           Purchase Request Detail Report                          │
│                                                                    │
│  Filters:                                                          │
│  ├─ Date From To: [____] to [____]                               │
│  ├─ Vendor From To: [____] to [____]                             │
│  ├─ Location From To: [____] to [____]                           │
│  └─ Status: [All/Draft/Pending/Approved]                         │
│                                                                    │
├─────────────┬──────────┬──────────────┬──────────┬──────────────┤
│PR No: PR-20250220-001              Date: 20/02/2025              │
│Department: Finance                  Status: Approved              │
│Delivery Date: 25/02/2025                                         │
├─────────────┬──────────┬──────────────┬──────────┬──────────────┤
│   Store     │ Product  │ Description  │Order Qty │  Order Unit  │
│  Location   │    ID    │              │          │              │
├─────────────┼──────────┼──────────────┼──────────┼──────────────┤
│   สถานที่   │รหัสสินค้า│ รายละเอียด   │  จำนวน  │    หน่วย     │
├─────────────┼──────────┼──────────────┼──────────┼──────────────┤
│Main Store   │PRD-001   │Printer Paper │   100    │     Box      │
│Main Store   │PRD-002   │Staples       │    50    │     Box      │
└─────────────┴──────────┴──────────────┴──────────┴──────────────┘

    ┌─────────┬──────┬─────────┬─────────┬──────────┐
    │Foc Qty  │Price │Discount │   Tax   │   Net    │
    │         │      │         │ Amount  │  Amount  │
    ├─────────┼──────┼─────────┼─────────┼──────────┤
    │   FOC   │ราคา  │ส่วนลด   │  ภาษี   │ยอดสุทธิ  │
    ├─────────┼──────┼─────────┼─────────┼──────────┤
    │    0    │120.00│   0.00  │  840.00 │12,840.00 │
    │    5    │ 35.00│  50.00  │  119.00 │ 1,819.00 │
    ├─────────┴──────┴─────────┴─────────┼──────────┤
    │                          Sub Total: │14,659.00 │
    │                        Grand Total: │14,659.00 │
    └─────────────────────────────────────┴──────────┘
```

#### 4. Business Rules

1. **Grouping Rules:**
   - Group by PR Number
   - Show PR header information above line items
   - Calculate subtotal per PR
   - Grand total at report end

2. **Calculation Rules:**
   - Net Amount = (Order Qty × Price) - Discount + Tax Amount
   - FOC (Free of Charge) items shown separately
   - Tax calculation based on tax configuration

3. **Display Rules:**
   - Show all line items including FOC
   - Highlight negative quantities or amounts
   - Flag items over budget threshold

#### 5. UI/UX Requirements

- Collapsible PR sections
- Drill-down to product details
- Export with formatting preserved
- Print with page breaks per PR

#### 6. Performance Requirements

- Load within 5 seconds for 1000 line items
- Support up to 50,000 line items with pagination
- Background processing for large exports

---

## Purchase Order Reports (PRD)

### Report #5: Purchase Order Detail Report

#### Product Requirement Document

**Report ID:** PO-002  
**Report Name:** Purchase Order Detail Report  
**Module:** Purchase Order (PO)  
**Priority:** Critical  
**Status:** Approved - OK

#### 1. Executive Summary

Comprehensive detail report showing all PO line items with order quantities, received quantities, pending amounts, pricing, and delivery information.

#### 2. Functional Requirements

**2.1 Filter Parameters**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| Date From To | Date Range | Yes | Current Month | PO date range |
| Vendor From To | Vendor Range | No | All | Vendor range |
| Location From To | Location Range | No | All | Delivery location |
| Status | Multi-select | No | All | PO status (Pending/Approved/Partial/Complete/Cancelled) |

**2.2 Data Columns**

| Column Name | Thai Description | Data Type | Width | Format |
|-------------|------------------|-----------|-------|--------|
| Ref PR.No. | เลขที่ PR อ้างอิง | Text | 120px | Text |
| Store Location | สถานที่จัดเก็บ | Text | 130px | Text |
| Product ID | รหัสสินค้า | Text | 100px | Text |
| Description | รายละเอียด | Text | 250px | Text |
| Order Qty | จำนวนสั่ง | Decimal | 90px | #,##0.00 |
| Order Unit | หน่วย | Text | 70px | Text |
| Foc Qty | FOC | Decimal | 80px | #,##0.00 |
| Price | ราคา/หน่วย | Currency | 100px | #,##0.00 |
| Discount | ส่วนลด | Currency | 90px | #,##0.00 |
| Tax Amount | ภาษี | Currency | 90px | #,##0.00 |
| Net Amount | ยอดสุทธิ | Currency | 120px | #,##0.00 |
| Received Qty | รับแล้ว | Decimal | 90px | #,##0.00 |
| Pending Qty | คงเหลือ | Decimal | 90px | #,##0.00 |

**2.3 Template Structure**

```
┌──────────────────────────────────────────────────────────────────┐
│           Purchase Order Detail Report                            │
│                                                                    │
│  Filters:                                                          │
│  ├─ Date From To: [____] to [____]                               │
│  ├─ Vendor From To: [____] to [____]                             │
│  ├─ Location From To: [____] to [____]                           │
│  └─ Status: [Pending/Approved/Partial/Complete/Cancelled]        │
│                                                                    │
├──────────────────────────────────────────────────────────────────┤
│PO No: PO-20250220-001            Date: 20/02/2025                │
│Vendor: ABC Supplies Co., Ltd     Status: Partial Received        │
│Delivery Date: 27/02/2025         Currency: THB                   │
│Total Amount: 45,280.00           Received: 30,150.00             │
├────────────┬──────────┬─────────────┬──────────┬────────────────┤
│ Ref PR.No. │  Store   │  Product ID │Description│  Order Qty    │
│            │ Location │             │           │               │
├────────────┼──────────┼─────────────┼──────────┼────────────────┤
│เลขที่ PR   │สถานที่   │รหัสสินค้า   │รายละเอียด│ จำนวนสั่ง     │
│ อ้างอิง    │จัดเก็บ   │             │           │               │
├────────────┼──────────┼─────────────┼──────────┼────────────────┤
│PR-2501-0001│Main Store│F&B-001      │Rice 5kg  │      200       │
│PR-2501-0001│Kitchen   │F&B-015      │Cooking Oil│     100       │
└────────────┴──────────┴─────────────┴──────────┴────────────────┘

    ┌──────┬─────┬──────┬────────┬─────────┬──────────┬─────────┐
    │Order │ Foc │Price │Discount│   Tax   │   Net    │Received │
    │Unit  │ Qty │      │        │ Amount  │  Amount  │   Qty   │
    ├──────┼─────┼──────┼────────┼─────────┼──────────┼─────────┤
    │หน่วย │ FOC │ราคา/ │ส่วนลด  │  ภาษี   │ยอดสุทธิ  │ รับแล้ว │
    │      │     │หน่วย │        │         │          │         │
    ├──────┼─────┼──────┼────────┼─────────┼──────────┼─────────┤
    │  Bag │  0  │145.00│  500.00│2,030.00 │ 30,530.00│   150   │
    │Bottle│  5  │140.00│  200.00│  980.00 │ 14,780.00│   100   │
    ├──────┴─────┴──────┴────────┴─────────┼──────────┼─────────┤
    │                           Sub Total: │ 45,310.00│   250   │
    │                        Pending Qty:  │          │   150   │
    └──────────────────────────────────────┴──────────┴─────────┘
```

#### 3. Business Rules

1. **Fulfillment Tracking:**
   - Received Qty = Sum of all received quantities from RC documents
   - Pending Qty = Order Qty - Received Qty
   - Status updates automatically based on fulfillment:
     - Pending: Received Qty = 0
     - Partial: 0 < Received Qty < Order Qty
     - Complete: Received Qty = Order Qty

2. **Calculation Rules:**
   - Net Amount = (Order Qty × Price) - Discount + Tax Amount
   - Received Amount = (Received Qty × Price) - Pro-rated Discount + Pro-rated Tax
   - Pending Amount = Net Amount - Received Amount

3. **Display Rules:**
   - Highlight partial fulfillment rows (yellow)
   - Show over-received items in red
   - Group by PO number with subtotals

#### 4. UI/UX Requirements

- Progress bar showing fulfillment percentage
- Link to receiving documents
- Alert for overdue deliveries
- Export with received/pending breakdown

---

### Report #6: Purchase Order List Report

#### Product Requirement Document

**Report ID:** PO-003  
**Report Name:** Purchase Order List Report  
**Module:** Purchase Order (PO)  
**Priority:** High  
**Status:** Approved - OK

#### 1. Functional Requirements

**1.1 Filter Parameters**

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| Date From To | Date Range | Yes | Current Month |
| Vendor From To | Vendor Range | No | All |
| Location From To | Location Range | No | All |
| Status | Multi-select | No | All |

**1.2 Data Columns**

| Column Name | Data Type | Width | Description |
|-------------|-----------|-------|-------------|
| Date | Date | 100px | PO creation date |
| Description | Text | 250px | PO description |
| PO.No | Text | 130px | PO document number |
| Vendor | Text | 200px | Vendor name |
| Status | Text | 100px | PO status |
| Delivery Date | Date | 110px | Expected delivery |
| Total Amount | Currency | 130px | PO total amount |

**1.3 Template Structure**

```
┌──────────────────────────────────────────────────────────────┐
│           Purchase Order List Report                          │
│                                                               │
│  Filters: Date From: [____] To: [____]                       │
│           Vendor From: [____] To: [____]                     │
│           Location From: [____] To: [____]                   │
│           Status: [All/Pending/Approved/Partial/Complete]    │
│                                                               │
├──────┬────────────┬────────────┬────────────┬────────────────┤
│ Date │Description │   PO.No    │   Vendor   │    Status      │
├──────┼────────────┼────────────┼────────────┼────────────────┤
│20/02 │Monthly Food│PO-20250220 │ABC Supplies│  Approved      │
│21/02 │Office Items│PO-20250221 │XYZ Trading │  Pending       │
└──────┴────────────┴────────────┴────────────┴────────────────┘

    ┌──────────────┬──────────────┐
    │Delivery Date │ Total Amount │
    ├──────────────┼──────────────┤
    │  27/02/2025  │   45,280.00  │
    │  28/02/2025  │   12,350.00  │
    ├──────────────┼──────────────┤
    │              │   57,630.00  │
    └──────────────┴──────────────┘
```

#### 2. Business Rules

- One row per PO document
- Total Amount includes all line items
- Color-coded status badges
- Clickable PO.No for detail view
- Print from system display

---

## Receiving Reports (PRD)

### Report #7: Receiving List Report

#### Product Requirement Document

**Report ID:** RC-001  
**Report Name:** Receiving List Report  
**Module:** Receiving (RC)  
**Priority:** High  
**Status:** Approved - OK

#### 1. Functional Requirements

**1.1 Data Columns**

| Column Name | Thai Description | Data Type | Width | Format |
|-------------|------------------|-----------|-------|--------|
| Receiving No. | เลขที่รับสินค้า | Text | 130px | RC-YYYYMMDD-XXX |
| Receiving Date | วันที่รับ | Date | 110px | DD/MM/YYYY |
| Inv.No. | เลขที่ใบแจ้งหนี้ | Text | 120px | Text |
| Inv.Date | วันที่ใบแจ้งหนี้ | Date | 100px | DD/MM/YYYY |
| Vendor Name | ชื่อผู้จำหน่าย | Text | 220px | Text |
| Currency | สกุลเงิน | Text | 70px | THB/USD/EUR |
| Net | ยอดสุทธิ | Currency | 110px | #,##0.00 |
| Tax | ภาษี | Currency | 100px | #,##0.00 |
| Total | ยอดรวม | Currency | 120px | #,##0.00 |
| Extra Cost | ค่าใช้จ่ายเพิ่มเติม | Currency | 110px | #,##0.00 |
| Grand Total | ยอดรวมสุทธิ | Currency | 130px | #,##0.00 |

**1.2 Template Structure**

```
┌──────────────────────────────────────────────────────────────┐
│                Receiving List Report                          │
│                                                               │
│  Filters:                                                     │
│  ├─ Date From: [____] To: [____]                            │
│  ├─ Vendor From: [____] To: [____]                          │
│  ├─ Location From: [____] To: [____]                        │
│  └─ Status: [All/Draft/Posted/Cancelled]                    │
│                                                               │
├─────────────┬──────────────┬─────────┬──────────┬───────────┤
│ Receiving   │  Receiving   │Inv.No.  │Inv.Date  │  Vendor   │
│     No.     │     Date     │         │          │   Name    │
├─────────────┼──────────────┼─────────┼──────────┼───────────┤
│เลขที่รับสินค้า│วันที่รับ     │เลขที่   │วันที่    │ชื่อผู้    │
│             │              │ใบแจ้งหนี้│ใบแจ้งหนี้│จำหน่าย    │
├─────────────┼──────────────┼─────────┼──────────┼───────────┤
│RC-20250220  │  20/02/2025  │INV-2025 │20/02/2025│ABC Supply │
│    -001     │              │  -001   │          │  Co.      │
└─────────────┴──────────────┴─────────┴──────────┴───────────┘

    ┌──────────┬──────────┬──────────┬───────────┬────────────┐
    │Currency  │   Net    │   Tax    │   Total   │Extra Cost  │
    ├──────────┼──────────┼──────────┼───────────┼────────────┤
    │ สกุลเงิน │ยอดสุทธิ  │  ภาษี    │  ยอดรวม   │ค่าใช้จ่าย  │
    │          │          │          │           │  เพิ่มเติม  │
    ├──────────┼──────────┼──────────┼───────────┼────────────┤
    │   THB    │42,500.00 │ 2,975.00 │ 45,475.00 │    500.00  │
    ├──────────┴──────────┴──────────┴───────────┼────────────┤
    │                                 Grand Total│  45,975.00 │
    └─────────────────────────────────────────────┴────────────┘
```

#### 2. Business Rules

1. **Extra Cost (Landed Cost):**
   - Extra Cost includes: freight, insurance, customs, handling fees
   - Grand Total = Total + Extra Cost
   - Extra costs allocated to products proportionally

2. **Currency Display:**
   - Show transaction currency
   - If foreign currency, show exchange rate
   - Display both foreign and base currency amounts

3. **Status Management:**
   - Draft: Not yet posted to inventory
   - Posted: Posted to inventory and GL
   - Cancelled: Voided transaction

---

### Report #8: Receiving Detail Report

#### Product Requirement Document

**Report ID:** RC-002  
**Report Name:** Receiving Detail Report  
**Module:** Receiving (RC)  
**Priority:** Critical  
**Status:** Approved - OK

#### 1. Functional Requirements

**1.1 Data Columns**

| Column Name | Thai Description | Data Type | Width |
|-------------|------------------|-----------|-------|
| PO.No. | เลขที่ PO | Text | 130px |
| Store Location | สถานที่จัดเก็บ | Text | 130px |
| Product | รหัส/ชื่อสินค้า | Text | 200px |
| Dept. Code | รหัสแผนก | Text | 90px |
| Acc. Code | รหัสบัญชี | Text | 90px |
| Order Qty | จำนวนสั่ง | Decimal | 90px |
| Order Unit | หน่วยสั่ง | Text | 70px |
| Rec Qty | จำนวนรับ | Decimal | 90px |
| Rec Unit | หน่วยรับ | Text | 70px |
| FOC | FOC | Decimal | 70px |
| Price | ราคา | Currency | 100px |
| Discount | ส่วนลด | Currency | 90px |
| Tax | ภาษี | Currency | 90px |
| Net Amount | ยอดสุทธิ | Currency | 120px |
| Status | สถานะ | Text | 90px |

**1.2 Template Structure**

```
┌──────────────────────────────────────────────────────────────┐
│              Receiving Detail Report                          │
│                                                               │
│  Filters:                                                     │
│  ├─ Date From: [____] To: [____]                            │
│  ├─ Vendor From: [____] To: [____]                          │
│  ├─ Location From: [____] To: [____]                        │
│  └─ Status: [All/Draft/Posted/Cancelled]                    │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│Receiving No: RC-20250220-001      Date: 20/02/2025          │
│Vendor: ABC Supplies Co., Ltd      Invoice: INV-2501-0001    │
│PO Reference: PO-20250215-001      Status: Posted            │
│Currency: THB                      Extra Cost: 500.00         │
├────────────┬──────────────┬────────────┬──────────┬─────────┤
│  PO.No.    │    Store     │  Product   │  Dept.   │  Acc.   │
│            │  Location    │            │   Code   │  Code   │
├────────────┼──────────────┼────────────┼──────────┼─────────┤
│ เลขที่ PO  │สถานที่จัดเก็บ│รหัส/ชื่อสินค้า│รหัสแผนก│รหัสบัญชี│
├────────────┼──────────────┼────────────┼──────────┼─────────┤
│PO-20250215 │Main Store    │F&B-001     │  FB-01   │5100-001 │
│   -001     │              │Rice 5kg    │          │         │
│PO-20250215 │Kitchen       │F&B-015     │  FB-02   │5100-002 │
│   -001     │              │Cooking Oil │          │         │
└────────────┴──────────────┴────────────┴──────────┴─────────┘

    ┌────────┬──────┬────────┬──────┬─────┬──────┬────────┐
    │Order   │Order │Rec Qty │Rec   │ FOC │Price │Discount│
    │  Qty   │Unit  │        │Unit  │     │      │        │
    ├────────┼──────┼────────┼──────┼─────┼──────┼────────┤
    │จำนวนสั่ง│หน่วยสั่ง│จำนวนรับ│หน่วยรับ│FOC│ราคา│ส่วนลด│
    ├────────┼──────┼────────┼──────┼─────┼──────┼────────┤
    │  200   │ Bag  │   150  │ Bag  │  0  │145.00│  500.00│
    │  100   │Bottle│   100  │Bottle│  5  │140.00│  200.00│
    └────────┴──────┴────────┴──────┴─────┴──────┴────────┘

    ┌──────┬──────────┬────────┐
    │ Tax  │   Net    │ Status │
    │      │  Amount  │        │
    ├──────┼──────────┼────────┤
    │ภาษี  │ยอดสุทธิ  │สถานะ   │
    ├──────┼──────────┼────────┤
    │2,030 │ 23,780.00│ Posted │
    │  980 │ 14,780.00│ Posted │
    ├──────┼──────────┼────────┤
    │3,010 │ 38,560.00│        │
    │      │ +  500.00│Extra   │
    │      │──────────│        │
    │      │ 39,060.00│Total   │
    └──────┴──────────┴────────┘
```

#### 2. Business Rules

1. **Quantity Variance:**
   - Flag when Rec Qty ≠ Order Qty
   - Allow over-receiving with approval
   - Auto-calculate pending PO quantity

2. **Department and Account Codes:**
   - Dept. Code: Cost center for expense allocation
   - Acc. Code: GL account for posting
   - Both required for financial integration

3. **FOC Handling:**
   - FOC items increase inventory but don't affect payables
   - Track separately for reporting
   - Include in inventory valuation at purchase price

---

## Credit Note Reports (PRD)

### Report #12: Credit Note Detail Report

#### Product Requirement Document

**Report ID:** CN-002  
**Report Name:** Credit Note Detail Report  
**Module:** Credit Note (CR)  
**Priority:** High  
**Status:** Approved - OK

#### 1. Functional Requirements

**1.1 Data Columns**

| Column Name | Thai Description | Data Type | Width |
|-------------|------------------|-----------|-------|
| Receiving No | เลขที่รับคืน | Text | 120px |
| Store Location | สถานที่เก็บ | Text | 120px |
| Product | สินค้า | Text | 200px |
| Type | ประเภท | Text | 100px |
| Quantity | จำนวน | Decimal | 90px |
| Net | ยอดสุทธิ | Currency | 100px |
| Tax | ภาษี | Currency | 90px |
| Total | ยอดรวม | Currency | 110px |
| Status | สถานะ | Text | 90px |

**1.2 Template Structure**

```
┌──────────────────────────────────────────────────────────────┐
│            Credit Note Detail Report                          │
│                                                               │
│  Filters:                                                     │
│  ├─ Date From: [____] To: [____]                            │
│  ├─ Vendor From: [____] To: [____]                          │
│  ├─ Location From: [____] To: [____]                        │
│  └─ Status: [All/Draft/Approved/Posted]                     │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│CN No: CN-20250220-001             Date: 20/02/2025          │
│Vendor: ABC Supplies Co., Ltd                                 │
│Related RC: RC-20250215-001        Reason: Damaged Goods     │
├─────────────┬──────────────┬────────────┬──────┬───────────┤
│ Receiving   │    Store     │  Product   │ Type │  Quantity │
│     No      │  Location    │            │      │           │
├─────────────┼──────────────┼────────────┼──────┼───────────┤
│เลขที่รับคืน  │สถานที่เก็บ   │   สินค้า    │ประเภท│  จำนวน    │
├─────────────┼──────────────┼────────────┼──────┼───────────┤
│RC-20250215  │Main Store    │F&B-001     │Damage│     10    │
│   -001      │              │Rice 5kg    │      │           │
└─────────────┴──────────────┴────────────┴──────┴───────────┘

    ┌──────────┬─────────┬──────────┬─────────┐
    │   Net    │   Tax   │  Total   │ Status  │
    ├──────────┼─────────┼──────────┼─────────┤
    │ ยอดสุทธิ │  ภาษี   │ ยอดรวม  │ สถานะ   │
    ├──────────┼─────────┼──────────┼─────────┤
    │ 1,350.00 │  94.50  │ 1,444.50 │Approved │
    ├──────────┴─────────┼──────────┤         │
    │         Sub Total: │ 1,444.50 │         │
    │      Grand Total:  │ 1,444.50 │         │
    └────────────────────┴──────────┴─────────┘
```

#### 2. Business Rules

1. **Credit Note Types:**
   - Damage: Damaged during delivery
   - Quality: Quality issues
   - Quantity: Quantity discrepancy
   - Price: Price adjustment
   - Other: Other reasons

2. **Financial Impact:**
   - Reduce accounts payable
   - Reduce inventory value
   - Create GL reversal entries
   - Track for vendor performance

3. **Approval Workflow:**
   - Draft: Created but not approved
   - Approved: Approved by authorized person
   - Posted: Posted to financial system
   - Cancelled: Voided transaction

---

## Vendor Reports (PRD)

### Report #14: Vendor Detail Report

#### Product Requirement Document

**Report ID:** VD-002  
**Report Name:** Vendor Detail Report  
**Module:** Vendor Management  
**Priority:** Medium  
**Status:** In Progress

#### 1. Functional Requirements

**1.1 Data Structure**

**Vendor Profile Section:**
- Vendor Code and Name
- Tax ID: x xxxx xxxxx xx x
- Tax Branch ID: xxxxx
- Status: Active/Inactive
- Category
- Contact Information
- Payment Terms
- Credit Limit

**1.2 Template Structure**

```
┌──────────────────────────────────────────────────────────────┐
│              Vendor Detail Report                             │
│                                                               │
│  Filters:                                                     │
│  ├─ Vendor From: [____] To: [____]                          │
│  ├─ Status: [Active/Inactive/All]                           │
│  ├─ Category: [All/Food/Beverage/Services/etc]              │
│  └─ Tax Type: [ประเภทภาษี]                                  │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│                   VENDOR PROFILE                              │
├──────────────────────────────────────────────────────────────┤
│ Vendor: V001 - ABC Supplies Co., Ltd                        │
│ Tax ID: 0 1234 56789 01 2       Status: Active              │
│ Tax Branch ID: 00000                                         │
│ Category: Food & Beverage        Payment Terms: Net 30       │
│ Credit Limit: 500,000.00         Current Balance: 125,450.00│
│                                                               │
│ Contact Person: John Doe         Phone: 02-123-4567         │
│ Email: john@abcsupply.com       Mobile: 081-234-5678        │
│ Address: 123 Main Street, Bangkok 10100                     │
├──────────────────────────────────────────────────────────────┤
│                TRANSACTION SUMMARY                            │
├──────────────────────────────────────────────────────────────┤
│ Total Purchase Orders (YTD): 156                            │
│ Total Purchase Value (YTD): 3,450,280.50                    │
│ Total Received (YTD): 3,125,100.25                          │
│ Outstanding Amount: 325,180.25                               │
│ Average Order Value: 22,115.13                               │
│ Last Transaction Date: 20/02/2025                           │
├──────────────────────────────────────────────────────────────┤
│              RECENT TRANSACTIONS (Last 10)                    │
├──────┬──────────┬────────────┬──────────────┬──────────────┤
│ Date │   Type   │ Doc Number │    Amount    │    Status    │
├──────┼──────────┼────────────┼──────────────┼──────────────┤
│20/02 │    RC    │RC-20250220 │   45,280.00  │   Posted     │
│15/02 │    PO    │PO-20250215 │   38,950.00  │   Approved   │
│10/02 │    CN    │CN-20250210 │  (2,150.00)  │   Posted     │
└──────┴──────────┴────────────┴──────────────┴──────────────┘
```

#### 2. Business Rules

1. **Credit Management:**
   - Track credit limit vs usage
   - Alert when approaching limit (90%)
   - Block new orders if over limit

2. **Performance Metrics:**
   - Calculate on-time delivery %
   - Track quality issues (CN count)
   - Average order processing time
   - Price competitiveness score

---

## Product Reports (PRD)

### Report #15: Product List Report

#### Product Requirement Document

**Report ID:** PR-001  
**Report Name:** Product List Report  
**Module:** Product Management  
**Priority:** Medium  
**Status:** Approved

#### 1. Functional Requirements

**1.1 Data Columns**

| Column Name | Description | Data Type | Width |
|-------------|-------------|-----------|-------|
| Product ID | Product identifier | Text | 100px |
| English Description | English name | Text | 200px |
| Local Description | Thai name | Text | 200px |
| Category | Main category | Text | 120px |
| Sub Category | Sub category | Text | 120px |
| Item Group | Item group | Text | 100px |
| Inven Unit | Inventory unit | Text | 80px |
| Order Unit | Ordering unit | Text | 80px |
| Last Cost | Last purchase cost | Currency | 100px |
| Status | Active/Inactive | Text | 80px |

**1.2 Template Structure**

```
┌──────────────────────────────────────────────────────────────┐
│                    Product List Report                        │
│                                                               │
│  Filters:                                                     │
│  ├─ Category: [All/F&B/Office/Cleaning/etc]                 │
│  ├─ Status: [Active/Inactive/All]                           │
│  └─ Item Group: [All/...]                                   │
│                                                               │
├──────────┬────────────────┬──────────────────┬──────────────┤
│Product ID│    English     │      Local       │   Category   │
│          │  Description   │   Description    │              │
├──────────┼────────────────┼──────────────────┼──────────────┤
│ F&B-001  │Rice 5kg Premium│ข้าวหอมมะลิ 5 กก.│Food & Beverage│
│ OFF-025  │A4 Paper        │กระดาษ A4        │Office Supply  │
└──────────┴────────────────┴──────────────────┴──────────────┘

    ┌────────────┬──────────┬────────┬──────────┬─────────┬────────┐
    │    Sub     │   Item   │ Inven  │  Order   │  Last   │ Status │
    │  Category  │  Group   │  Unit  │   Unit   │  Cost   │        │
    ├────────────┼──────────┼────────┼──────────┼─────────┼────────┤
    │   Rice     │Dry Goods │  Bag   │   Bag    │ 145.00  │ Active │
    │Stationery  │  Paper   │  Ream  │   Ream   │  85.00  │ Active │
    └────────────┴──────────┴────────┴──────────┴─────────┴────────┘
```

---

## Inventory Reports (PRD)

### Report #28: Stock Card Detailed Report

#### Product Requirement Document

**Report ID:** INV-008  
**Report Name:** Stock Card Detailed Report  
**Module:** Inventory Management  
**Priority:** Critical  
**Status:** Approved

#### 1. Functional Requirements

**1.1 Filter Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| Location From To | Location Range | Storage location range |
| Product | Multi-select | Specific products |
| Category | Dropdown | Product category |
| Group By | Radio | Product/Location/Category |
| Date From To | Date Range | Transaction period |

**1.2 Data Columns**

| Column Name | Thai Description | Data Type | Width |
|-------------|------------------|-----------|-------|
| Date | วันที่ | Date | 100px |
| Document No. | เลขที่เอกสาร | Text | 120px |
| Type | ประเภท | Text | 100px |
| Lot# | หมายเลข Lot | Text | 100px |
| Unit | หน่วย | Text | 70px |
| B/F Qty | ยอดยกมา | Decimal | 90px |
| In | รับเข้า | Decimal | 90px |
| Out | จ่ายออก | Decimal | 90px |
| C/F Qty | ยอดคงเหลือ | Decimal | 90px |
| Cost/Unit | ราคา/หน่วย | Currency | 100px |
| Amount | มูลค่า | Currency | 120px |

**1.3 Template Structure**

```
┌──────────────────────────────────────────────────────────────┐
│            Stock Card Detailed Report                         │
│                                                               │
│  Filters:                                                     │
│  ├─ Location From: [____] To: [____]                        │
│  ├─ Date From: [____] To: [____]                            │
│  ├─ Product: [Multi-select]                                 │
│  └─ Group By: ○ Product ○ Location ○ Category               │
│                                                               │
├──────────────────────────────────────────────────────────────┤
│Product: F&B-001 - Rice 5kg Premium                          │
│Location: Main Store                                          │
│Period: 01/02/2025 - 28/02/2025                              │
├──────┬────────────┬──────┬──────┬──────┬────────┬─────┬────┤
│ Date │ Document   │ Type │ Lot# │ Unit │ B/F Qty│ In  │Out │
│      │    No.     │      │      │      │        │     │    │
├──────┼────────────┼──────┼──────┼──────┼────────┼─────┼────┤
│วันที่ │เลขที่เอกสาร│ประเภท│หมายเลข│หน่วย│ยอดยกมา│รับเข้า│จ่าย│
│      │            │      │ Lot  │      │        │     │ออก │
├──────┼────────────┼──────┼──────┼──────┼────────┼─────┼────┤
│01/02 │B/F         │B/F   │  -   │ Bag  │  500.00│  -  │ -  │
│05/02 │RC-20250205 │  RC  │L-001 │ Bag  │  500.00│200.0│ -  │
│08/02 │SO-20250208 │  SO  │L-001 │ Bag  │  700.00│  -  │150 │
│15/02 │RC-20250215 │  RC  │L-002 │ Bag  │  550.00│150.0│ -  │
│20/02 │SO-20250220 │  SO  │L-001 │ Bag  │  700.00│  -  │100 │
│28/02 │C/F         │C/F   │  -   │ Bag  │  600.00│  -  │ -  │
└──────┴────────────┴──────┴──────┴──────┴────────┴─────┴────┘

    ┌─────────┬──────────┬────────────┐
    │ C/F Qty │Cost/Unit │   Amount   │
    ├─────────┼──────────┼────────────┤
    │ยอดคงเหลือ│ ราคา/หน่วย│   มูลค่า    │
    ├─────────┼──────────┼────────────┤
    │  500.00 │  145.00  │  72,500.00 │
    │  700.00 │  145.00  │ 101,500.00 │
    │  550.00 │  145.00  │  79,750.00 │
    │  700.00 │  145.00  │ 101,500.00 │
    │  600.00 │  145.00  │  87,000.00 │
    │  600.00 │  145.00  │  87,000.00 │
    ├─────────┴──────────┴────────────┤
    │ Total In:  350.00                │
    │ Total Out: 250.00                │
    │ Net Change: +100.00              │
    └──────────────────────────────────┘
```

#### 2. Business Rules

1. **Balance Calculation:**
   - B/F Qty (Brought Forward) = Previous C/F Qty
   - C/F Qty (Carried Forward) = B/F Qty + In - Out
   - Running balance updated with each transaction

2. **Transaction Types:**
   - RC: Receiving
   - SO: Stock Out/Issue
   - ADJ: Adjustment
   - TR-IN: Transfer In
   - TR-OUT: Transfer Out
   - B/F: Brought Forward (opening)
   - C/F: Carried Forward (closing)

3. **Costing Method:**
   - Support FIFO, Average, or Standard costing
   - Cost/Unit based on costing method
   - Amount = C/F Qty × Cost/Unit

4. **Lot Tracking:**
   - Track lot numbers for traceability
   - FIFO consumption by lot
   - Expiry date tracking per lot

---

### Report #24: Inventory Balance Report

#### Product Requirement Document

**Report ID:** INV-004  
**Report Name:** Inventory Balance Report  
**Module:** Inventory Management  
**Priority:** Critical  
**Status:** Approved

#### 1. Functional Requirements

**1.1 Data Columns**

| Column Name | Description | Data Type | Width |
|-------------|-------------|-----------|-------|
| Product | Product code and name | Text | 250px |
| Unit | Unit of measure | Text | 70px |
| Cost / Unit | Current unit cost | Currency | 100px |
| On hand Qty | Current quantity | Decimal | 100px |
| Balance Amount | Total value | Currency | 130px |

**1.2 Template Structure**

```
┌──────────────────────────────────────────────────────────────┐
│              Inventory Balance Report                         │
│                                                               │
│  Filters:                                                     │
│  ├─ Location From: [____] To: [____]                        │
│  ├─ As of Date: [____]                                      │
│  ├─ Category: [All/...]                                     │
│  └─ Show Zero Balance: □                                    │
│                                                               │
├─────────────────────────┬──────┬────────────┬───────────────┤
│        Product          │ Unit │Cost / Unit │ On hand Qty   │
├─────────────────────────┼──────┼────────────┼───────────────┤
│F&B-001: Rice 5kg Premium│ Bag  │   145.00   │    600.00     │
│F&B-015: Cooking Oil 5L  │Bottle│   140.00   │    250.00     │
│OFF-025: A4 Paper        │ Ream │    85.00   │     75.00     │
└─────────────────────────┴──────┴────────────┴───────────────┘

    ┌─────────────────┐
    │ Balance Amount  │
    ├─────────────────┤
    │     87,000.00   │
    │     35,000.00   │
    │      6,375.00   │
    ├─────────────────┤
    │    128,375.00   │
    │   Grand Total   │
    └─────────────────┘
```

#### 2. Business Rules

1. **Balance Calculation:**
   - On hand Qty = Current inventory balance
   - Balance Amount = On hand Qty × Cost / Unit
   - Real-time or as-of-date snapshot

2. **Zero Balance:**
   - Option to show/hide zero balance items
   - Useful for inventory count preparation

3. **Multiple Locations:**
   - Support multi-location reporting
   - Subtotal by location
   - Grand total across all locations

---

## Template Structure Standards

### 1. Common Layout Elements

#### Header Section
- Company logo (top-left)
- Report title (centered)
- Print date and time (top-right)
- Page number (footer-right)

#### Filter Section
- Clearly labeled filter parameters
- User-friendly date pickers
- Dropdown selections
- Multi-select capabilities
- "Select" button to apply filters

#### Data Section
- Column headers in English
- Thai descriptions below headers
- Clear separation between columns
- Alternating row colors for readability
- Grouping with subtotals
- Grand totals at bottom

### 2. Data Type Formatting

| Data Type | Format | Example | Alignment |
|-----------|--------|---------|-----------|
| Date | DD/MM/YYYY | 20/02/2025 | Center |
| Currency | #,##0.00 | 12,345.67 | Right |
| Decimal | #,##0.00 | 1,234.56 | Right |
| Integer | #,##0 | 1,234 | Right |
| Percentage | ##0.00% | 15.50% | Right |
| Text | - | Sample Text | Left |

### 3. Color Coding Standards

#### Status Badges
- **Green**: Approved, Complete, Posted, Active
- **Yellow**: Draft, Pending, Partial
- **Orange**: Pending Approval, Warning
- **Red**: Rejected, Cancelled, Error, Expired
- **Gray**: Inactive, Void

#### Alert Highlighting
- **Red Background**: Critical issues, overdue
- **Yellow Background**: Warnings, approaching limits
- **Blue Background**: Information, selected items

### 4. Export Format Standards

#### Excel Export
- Preserve all formatting
- Include filter parameters in header
- Freeze panes on column headers
- Auto-fit column widths
- Include formulas for totals

#### PDF Export
- Maintain page breaks
- Include report header on each page
- Page numbers in footer
- Landscape for wide reports
- Portrait for narrow reports

### 5. Print Layout Standards

#### Page Setup
- Margins: Top 1", Bottom 1", Left 0.75", Right 0.75"
- Header height: 0.5"
- Footer height: 0.5"

#### Header Content
- Line 1: Company name and logo
- Line 2: Report title
- Line 3: Filter parameters
- Line 4: Print date and user

#### Footer Content
- Left: Report name
- Center: Confidential (if applicable)
- Right: Page X of Y

---

## Implementation Guidelines

### Phase 1: Core Reports (Weeks 1-4)
1. Purchase Request Detail
2. Purchase Order Detail
3. Receiving Detail
4. Inventory Balance
5. Stock Card Detailed

### Phase 2: Essential Reports (Weeks 5-8)
6. Purchase Analysis by Item
7. Top Purchasing
8. Credit Note Detail
9. Vendor Detailed
10. Product List

### Phase 3: Operational Reports (Weeks 9-12)
11. Stock Out Detail
12. Store Requisition Detail
13. Inventory Movement Detail
14. Slow Moving Report
15. Expired Items Report

### Phase 4: Analysis Reports (Weeks 13-16)
16. Inventory Aging
17. Deviation by Item
18. Recipe Card
19. Material Consumption
20. All remaining list reports

---

## Appendix

### A. Common Filter Parameters

| Parameter | Type | Options | Default |
|-----------|------|---------|---------|
| Date Range | Date Picker | From - To | Current Month |
| Status | Multi-select | Draft/Pending/Approved/etc | All |
| Location | Multi-select | All locations | All |
| Vendor | Dropdown/Search | All vendors | All |
| Product | Multi-select | All products | All |
| Category | Dropdown | All categories | All |

### B. User Roles and Access

| Role | Access Level | Reports |
|------|--------------|---------|
| Purchasing Manager | Full | All PR, PO, RC reports |
| Finance Manager | Full | All financial reports |
| Store Manager | Location-specific | Inventory, Stock Card |
| Department Head | Department-specific | PR, Requisition reports |
| Auditor | Read-only | All reports |

### C. Performance Metrics

| Report | Max Load Time | Max Rows |
|--------|---------------|----------|
| List Reports | 3 seconds | 10,000 |
| Detail Reports | 5 seconds | 50,000 |
| Analysis Reports | 10 seconds | 100,000 |
| Stock Card | 7 seconds | 1,000 products |

---

**End of Document**

*This PRD document provides detailed specifications and template structures for all Blue Ledger reports. Use in conjunction with the Master Specification Document (MSD) for complete implementation guidance.*