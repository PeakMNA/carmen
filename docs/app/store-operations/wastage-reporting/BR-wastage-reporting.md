# Business Requirements: Wastage Reporting

## Module Information
- **Module**: Store Operations
- **Sub-Module**: Wastage Reporting
- **Route**: `/app/(main)/store-operations/wastage-reporting`
- **Version**: 1.3.0
- **Last Updated**: 2025-12-13
- **Owner**: Store Operations Team
- **Status**: Active
- **Implementation Status**: IMPLEMENTED (Frontend UI Complete with Mock Data)

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.3.0 | 2025-12-13 | Documentation Team | Added workflow enhancements: dashboard sorting, per-item attachments, review decision workflow, status transitions |
| 1.2.0 | 2025-12-09 | Documentation Team | Updated to reflect implemented frontend UI with 6 pages |
| 1.1.0 | 2025-12-05 | Documentation Team | Added implementation status (Section 1.4), backend requirements (Section 9), inventory valuation integration |
| 1.0.0 | 2025-01-12 | Store Operations Team | Initial version |

---

## ✅ IMPLEMENTATION NOTE

**Current State**: IMPLEMENTED - Frontend UI Complete with Mock Data

The Wastage Reporting module frontend has been fully implemented with comprehensive UI pages. Backend integration is pending.

**Implemented Pages**:
- ✅ **Dashboard** (`/store-operations/wastage-reporting/`) - KPI cards (total wastage, items wasted, pending reviews, wastage rate), monthly trend chart, wastage by reason pie chart, wastage by location bar chart, recent reports table with search/filters, **sortable by date/loss value/item name/quantity**
- ✅ **New Report** (`/store-operations/wastage-reporting/new/`) - Location selection, item search/add with combobox, quantity input, **two-level Category → Reason selection** (defaults to Wastage), notes per item, photo attachments upload, summary sidebar with total loss calculation
- ✅ **Reports List** (`/store-operations/wastage-reporting/reports/`) - Status summary cards (all/pending/under_review/approved/rejected), full reports table with bulk selection, filters by location/reason/date, bulk approve/reject actions
- ✅ **Report Detail** (`/store-operations/wastage-reporting/reports/[id]/`) - **Expandable item panels** with batch number, expiry date, cost, **per-item evidence attachments**, wastage reason with description, **Review Decision component** for managers, audit information, Post to Stock Out action
- ✅ **Analytics** (`/store-operations/wastage-reporting/analytics/`) - Monthly trend with target line, wastage by reason breakdown, weekly stacked bar chart, location comparison with progress bars, category breakdown, top wasted items table, insights & recommendations
- ✅ **Categories** (`/store-operations/wastage-reporting/categories/`) - Category management with color coding, approval thresholds, usage statistics, approval rules configuration, add/edit/delete categories

**Status Values Implemented**: `Draft`, `Submitted`, `Under Review`, `Approved`, `Rejected`, `Posted`

**Wastage Categories (Stock OUT)**: WST (Wastage), DMG (Damaged Goods), THEFT (Theft/Loss), SAMPLE (Samples), WRITE (Write-Off)

**Reason Categories per Wastage**: EXP (Expired), SPOIL (Spoiled), QUAL (Quality Issue), DMG (Damaged), CONT (Contaminated), OVERPROD (Overproduction), PREP (Prep Waste), PLATE (Plate Waste), SPILL (Spill/Accident)

**Pending Backend Implementation**:
- ⏳ Database schema and tables
- ⏳ Server actions for CRUD operations
- ⏳ Supabase storage for attachments
- ⏳ Automatic inventory adjustments
- ⏳ Financial system integration

---


## Overview

The Wastage Reporting sub-module provides a comprehensive system for recording, categorizing, approving, and analyzing food and beverage wastage across restaurant locations. It enables staff to document wastage incidents with proper categorization, photographic evidence, and detailed justifications, while providing managers with powerful analytics to identify trends, reduce waste, and optimize inventory management.

In the hospitality industry, wastage represents a significant cost factor that directly impacts profitability and sustainability. This module transforms wastage from a hidden cost into actionable intelligence by capturing detailed wastage data at the point of occurrence, routing it through appropriate approval workflows, and automatically adjusting inventory levels. The system supports multiple wastage categories including spoilage, overproduction, preparation errors, damaged goods, expired items, customer returns, and portion control issues.

The module integrates seamlessly with inventory management to ensure real-time stock accuracy, financial systems for proper cost accounting, and vendor management for quality-related wastage that may require supplier discussion or returns. It provides role-based access ensuring kitchen staff can quickly record wastage without unnecessary complexity, while managers receive comprehensive analytics to drive continuous improvement in waste reduction.

## Business Objectives

1. **Reduce Overall Wastage Costs**: Track and analyze wastage patterns to identify root causes and implement targeted reduction strategies, aiming to reduce total wastage by 20% within 12 months.

2. **Ensure Inventory Accuracy**: Automatically adjust inventory levels when wastage is recorded and approved, maintaining real-time inventory accuracy and preventing discrepancies between physical and system stock.

3. **Enable Data-Driven Decision Making**: Provide comprehensive wastage analytics by category, product, location, time period, and responsible party to inform purchasing decisions, menu engineering, and operational improvements.

4. **Enforce Accountability and Approval Controls**: Implement multi-level approval workflows based on wastage value thresholds, ensuring appropriate oversight while maintaining operational efficiency.

5. **Support Compliance and Audit Requirements**: Maintain complete audit trails of all wastage transactions with supporting documentation (photos, reasons, approver notes) to satisfy internal audits, external compliance requirements, and insurance claims.

6. **Identify Supplier Quality Issues**: Track wastage attributed to supplier quality problems to facilitate vendor performance discussions, quality improvement initiatives, and potential supplier changes or returns.

7. **Optimize Menu and Production Planning**: Analyze overproduction and preparation error patterns to refine recipes, adjust portion sizes, improve forecasting accuracy, and optimize prep schedules.

8. **Reduce Environmental Impact**: Monitor and reduce food waste as part of corporate sustainability initiatives, providing metrics for environmental reporting and waste diversion programs.

9. **Improve Staff Training and Performance**: Identify training needs based on wastage patterns attributed to preparation errors or portion control issues, enabling targeted coaching and skill development.

10. **Accelerate Financial Closing**: Provide accurate, real-time wastage data for month-end inventory valuation and COGS calculations, reducing financial close time and improving reporting accuracy.

## Key Stakeholders

- **Primary Users**: Kitchen Staff, Store Managers, Chefs (daily wastage recording and review)
- **Secondary Users**: Purchasing Staff (supplier quality wastage analysis), Finance Staff (cost accounting and reporting)
- **Approvers**: Department Managers, Store Managers, Finance Managers (wastage approval based on value thresholds)
- **Administrators**: System Administrators (wastage category configuration, threshold settings, workflow rules)
- **Reviewers**: Operations Managers, Regional Managers, Corporate Finance (trend analysis and performance monitoring)
- **Support**: IT Support Team (technical assistance), Operations Support (process guidance)

---

## Functional Requirements

### FR-WAST-001: Record Wastage Transaction
**Priority**: Critical

The system must allow authorized users to record wastage transactions capturing all essential information including product, quantity, wastage category, reason, responsible party, and supporting documentation. Wastage recording must be quick and intuitive to encourage accurate reporting at the point of occurrence.

**Acceptance Criteria**:
- User can search and select products from inventory using product code, name, or barcode scanning
- System displays current stock quantity, unit cost, and location when product is selected
- User can enter wastage quantity with unit of measure conversion (e.g., portions to kg, bottles to ml)
- System calculates total wastage value automatically based on quantity and current unit cost
- User must select wastage category from predefined list (spoilage, overproduction, preparation error, damaged, expired, customer return, portion control, other)
- User must enter detailed reason/description (minimum 20 characters) explaining the wastage
- User can optionally identify responsible staff member (for training and accountability purposes)
- User can attach up to 5 photos as evidence (required for high-value wastage >$100)
- System validates that wastage quantity does not exceed current stock quantity
- System captures wastage date/time, recording user, and location automatically
- Wastage transaction is created in "pending" status awaiting approval
- User receives confirmation message with wastage reference number

**Related Requirements**: FR-WAST-002, FR-WAST-007, BR-WAST-001, BR-WAST-003

---

### FR-WAST-002: Categorize Wastage by Type
**Priority**: Critical

The system must support comprehensive wastage categorization enabling detailed analysis by wastage type. Categories must be configurable by administrators to adapt to evolving business needs while maintaining consistency for trend analysis.

**Acceptance Criteria**:
- System provides predefined wastage categories: Spoilage, Overproduction, Preparation Error, Damaged Goods, Expired Items, Customer Return, Portion Control, Quality Issue, Contamination, Equipment Failure, Training/Testing, Sampling, Other
- Each category requires specific additional information (e.g., spoilage requires spoilage reason: temperature abuse, power outage, past use-by date)
- Administrators can activate/deactivate categories but cannot delete categories with historical transactions
- Administrators can configure category-specific validation rules (e.g., customer return requires customer feedback notes)
- System supports sub-categories for detailed classification (e.g., Preparation Error → Overcooked, Undercooked, Wrong Recipe, Dropped, Burned)
- Users can add custom notes to any category for additional context
- System tracks wastage trends by category for analytics and reporting
- Category selection drives automatic assignment of wastage to appropriate GL accounts for financial integration

**Related Requirements**: FR-WAST-001, FR-WAST-010, BR-WAST-002

---

### FR-WAST-003: Implement Multi-Level Approval Workflow
**Priority**: Critical

The system must route wastage transactions through appropriate approval workflows based on configurable value thresholds, ensuring adequate oversight while maintaining operational efficiency. Workflows must support both sequential and parallel approval patterns.

**Acceptance Criteria**:
- System supports three approval levels: Department Manager, Store Manager, Finance Manager
- Administrators can configure value thresholds determining required approval levels (e.g., <$50 auto-approve, $50-$200 requires Store Manager, >$200 requires Store Manager + Finance Manager)
- System automatically routes wastage to appropriate approvers based on value and configuration
- Approvers receive notifications via system alerts and email (if configured)
- Approvers can view complete wastage details including photos, reasons, and product information
- Approvers can approve, partially approve (reduce quantity), or reject with mandatory comments
- System supports delegation when approver is unavailable (vacation, leave)
- Approval workflow respects organizational hierarchy (user cannot approve own wastage if they are the approver)
- System tracks approval history with timestamps, approver names, and approval comments
- Emergency/rush approvals can be flagged for expedited processing with email notifications
- System supports configurable auto-approval rules for specific categories (e.g., expired items auto-approve if within 24 hours of expiry date)

**Related Requirements**: FR-WAST-004, BR-WAST-004, BR-WAST-005

---

### FR-WAST-004: Process Approval Actions
**Priority**: Critical

The system must enable approvers to review wastage transactions and take appropriate actions (approve, partially approve, reject) with proper validation and inventory impact. All approval actions must create complete audit trails.

**Acceptance Criteria**:
- Approver can view all pending wastage transactions assigned to them, sorted by date, value, or priority
- Approver can filter wastage list by date range, category, location, product, or responsible party
- Approver can view complete wastage details including product information, current stock, photos, and submitter notes
- Approver can approve full wastage quantity, system updates inventory immediately
- Approver can partially approve by reducing wastage quantity, remaining quantity is returned to "draft" status for re-submission
- Approver can reject wastage with mandatory rejection reason (minimum 30 characters)
- System validates approver has necessary permissions based on role and value threshold
- Rejected wastage transactions remain in system for audit purposes with "rejected" status
- Approved wastage automatically triggers inventory adjustment reducing stock quantity
- System captures approval date/time, approver ID, approval comments, and action taken
- Approver receives confirmation of action taken with updated wastage status
- If multiple approval levels required, system routes to next approver after first approval

**Related Requirements**: FR-WAST-003, FR-WAST-008, BR-WAST-004, BR-WAST-006

---

### FR-WAST-005: Automatic Inventory Adjustment
**Priority**: Critical

The system must automatically adjust inventory levels when wastage is approved, ensuring real-time inventory accuracy and proper audit trails. Inventory adjustments must be reversible in case of approval errors or fraud detection.

**Acceptance Criteria**:
- System creates inventory adjustment transaction when wastage is approved
- Adjustment reduces stock quantity in the location where wastage occurred
- Adjustment is linked to original wastage transaction for traceability
- Adjustment captures product, quantity, unit cost at time of wastage, total value, adjustment date/time, and user who approved
- System validates sufficient stock quantity exists before creating adjustment (prevents negative inventory if configured)
- Adjustment automatically updates inventory valuation and COGS in financial system
- System creates reversing entry if wastage approval is later revoked (fraud, error)
- Adjustment respects inventory costing method (FIFO, LIFO, Weighted Average, Specific Identification)
- System maintains inventory transaction history showing wastage adjustments separately from other adjustment types
- Inventory reports include wastage-related adjustments with drill-down to original wastage transaction
- System generates inventory variance report comparing physical counts to system stock after wastage adjustments

**Related Requirements**: FR-WAST-004, FR-WAST-009, BR-WAST-006, BR-WAST-007

---

### FR-WAST-006: Attach Supporting Documentation
**Priority**: High

The system must allow users to attach photos and documents as evidence supporting wastage transactions. Photo evidence is mandatory for high-value wastage and recommended for all wastage to improve accuracy and reduce fraud.

**Acceptance Criteria**:
- User can attach up to 5 photos per wastage transaction
- System accepts common image formats: JPG, PNG, HEIC (mobile photos)
- Each photo can be up to 10MB in size
- System displays thumbnail preview of attached photos in wastage record
- Photos are stored securely with access restricted to authorized users
- System requires at least one photo for wastage transactions >$100 in value
- User can add caption/description to each photo for context
- Approver can view full-resolution photos when reviewing wastage
- System supports photo capture directly from mobile device camera (progressive web app)
- Photos are retained for audit period (configurable, default 7 years)
- System watermarks photos with date, time, location, and user who captured photo
- User can attach PDF documents for supplier quality complaints or other supporting documentation

**Related Requirements**: FR-WAST-001, BR-WAST-003, NFR-WAST-009

---

### FR-WAST-007: Validate Wastage Transactions
**Priority**: Critical

The system must validate all wastage transactions at point of entry and before approval to ensure data accuracy, prevent fraud, and maintain inventory integrity. Validation rules must be configurable by administrators.

**Acceptance Criteria**:
- System validates wastage quantity does not exceed current stock quantity at time of entry
- System validates unit of measure is compatible with product's base unit
- System warns if wastage quantity is unusually high (>50% of current stock or >3 standard deviations from historical average)
- System requires photo evidence for wastage transactions exceeding value threshold (configurable, default $100)
- System validates reason/description meets minimum length requirement (20 characters)
- System prevents backdating of wastage transactions beyond configurable period (default 7 days)
- System validates wastage date is not in the future
- System checks for duplicate wastage entries (same product, quantity, date/time, user) within 5 minutes
- System validates user has permission to record wastage for selected location
- System validates selected product is active and not discontinued
- System enforces category-specific validation rules (e.g., expired items must have expiry date in the past)
- System validates responsible party (if selected) is active employee assigned to location

**Related Requirements**: FR-WAST-001, VAL-WAST-001 to VAL-WAST-012, BR-WAST-001

---

### FR-WAST-008: Generate Wastage Reports
**Priority**: High

The system must provide comprehensive wastage reporting capabilities enabling users to analyze wastage trends, identify problem areas, and measure waste reduction initiatives. Reports must support multiple dimensions and time periods.

**Acceptance Criteria**:
- System provides predefined standard reports: Daily Wastage Summary, Wastage by Category, Wastage by Product, Wastage by Location, Wastage by Responsible Party, High-Value Wastage (>$100), Trend Analysis (YoY, MoM), Supplier Quality Issues
- Users can filter reports by date range, location, product category, wastage category, approver, value range
- Reports display wastage quantity, total value, percentage of total inventory value, and count of wastage transactions
- Reports support drill-down from summary to detail level (e.g., category → product → individual transactions)
- System calculates key metrics: Total wastage value, Average wastage per transaction, Wastage as % of purchases, Wastage as % of COGS, Top 10 wasted products (by value and quantity)
- Reports include trend analysis with charts/graphs showing wastage over time
- Users can export reports to Excel, PDF, and CSV formats
- System supports scheduled report generation and email delivery (daily, weekly, monthly)
- Reports respect user's security permissions (only shows data user has access to)
- System maintains report generation history for audit purposes

**Related Requirements**: FR-WAST-010, FR-WAST-011, BR-WAST-008

---

### FR-WAST-009: View Wastage Transaction History
**Priority**: High

The system must provide complete visibility into wastage transaction history with comprehensive search, filtering, and audit trail capabilities. History must be accessible to authorized users based on role-based permissions.

**Acceptance Criteria**:
- User can view list of all wastage transactions they have access to (based on role and location permissions)
- List displays key information: Wastage number, Date, Product, Quantity, Value, Category, Status, Recorded by, Approved by
- User can search wastage transactions by wastage number, product name, product code, date range, category, status, recorded by, approved by
- User can filter wastage list by single or multiple criteria
- User can sort wastage list by any column in ascending or descending order
- User can click on wastage transaction to view complete details including all fields, photos, approval history, inventory adjustment details
- System displays complete audit trail showing all actions taken on wastage transaction (created, submitted, approved, rejected, modified) with date/time and user
- User can view related transactions (e.g., inventory adjustment created from wastage)
- System supports pagination for large result sets (configurable page size, default 25 records)
- User can export search results to Excel for offline analysis
- System highlights wastage transactions requiring user's attention (pending approval, rejected, flagged for review)

**Related Requirements**: FR-WAST-008, BR-WAST-009, NFR-WAST-011

---

### FR-WAST-010: Analyze Wastage Trends and Patterns
**Priority**: High

The system must provide advanced analytics capabilities enabling users to identify wastage trends, patterns, and anomalies. Analytics must support predictive insights to proactively prevent future wastage.

**Acceptance Criteria**:
- System calculates and displays key performance indicators (KPIs): Total wastage value (current period), Wastage as % of COGS, Wastage per customer served, Wastage reduction vs prior period, Average wastage per transaction
- System identifies top wastage contributors by product (top 10 by value and quantity), by category (Pareto analysis), by location, by responsible party, by time period (day of week, hour of day)
- System detects anomalies and outliers: Unusually high single-transaction wastage, Sudden spikes in wastage for specific products, Wastage patterns outside normal range (statistical analysis)
- System provides trend analysis with visualizations: Line charts showing wastage over time, Bar charts comparing categories or locations, Pie charts showing wastage composition, Heat maps showing wastage by day/time
- System identifies seasonal patterns and correlations: Seasonal wastage trends (e.g., higher overproduction during holidays), Correlation with sales volume, weather, or events
- System supports predictive analytics: Forecasting expected wastage based on historical patterns, Alerting when wastage is trending above forecast
- System enables root cause analysis: Drill-down from high-level metrics to specific transactions, Correlation analysis between wastage and other factors (supplier, season, staff)
- Analytics respect user's security permissions and data access rules

**Related Requirements**: FR-WAST-008, FR-WAST-011, BR-WAST-008

---

### FR-WAST-011: Configure Wastage Thresholds and Alerts
**Priority**: Medium

The system must allow administrators to configure wastage thresholds and automated alerts to proactively identify and respond to wastage issues. Alert rules must be flexible to support various business scenarios.

**Acceptance Criteria**:
- Administrators can define value thresholds triggering different approval levels (e.g., <$50, $50-$200, >$200)
- Administrators can configure alert rules based on multiple criteria: Single transaction value exceeds threshold, Daily/weekly/monthly wastage exceeds threshold, Wastage for specific product exceeds threshold, Wastage by specific user exceeds threshold, Wastage by category exceeds threshold
- System sends alerts via configurable channels: In-app notifications, Email notifications, SMS notifications (if configured)
- Alert recipients can be configured by role, specific users, or distribution lists
- Administrators can define alert frequency to prevent alert fatigue (immediate, daily digest, weekly digest)
- System supports escalation rules (e.g., if alert not acknowledged within 4 hours, escalate to senior manager)
- Administrators can activate/deactivate alert rules without deleting configuration
- System maintains alert history showing when alerts were triggered and who responded
- Alert rules support time-based conditions (e.g., only alert during business hours, or only on weekdays)
- System provides alert effectiveness metrics (alerts sent, alerts actioned, alerts ignored)

**Related Requirements**: FR-WAST-003, BR-WAST-010, NFR-WAST-013

---

### FR-WAST-012: Track Supplier Quality Issues
**Priority**: Medium

The system must capture and track wastage attributed to supplier quality problems, enabling vendor performance analysis and quality improvement discussions. Integration with vendor management module provides complete supplier performance visibility.

**Acceptance Criteria**:
- User can flag wastage as "supplier quality issue" during recording
- When flagged, system requires supplier selection from vendor master data
- User must specify quality problem type: Incorrect specification, Damaged in transit, Short shelf life, Poor freshness, Wrong product delivered, Contamination, Packaging defect, Other
- User can enter detailed quality issue description and attach photos as evidence
- System captures lot number, delivery date, and GRN reference for traceability
- System maintains supplier quality wastage report showing wastage by supplier, by quality issue type, and by product
- Report calculates supplier quality metrics: Total wastage value by supplier, Wastage as % of purchases from supplier, Quality issue frequency by supplier
- System supports creation of supplier complaint/quality report directly from wastage transaction
- Purchasing staff receive alerts when supplier quality wastage exceeds thresholds
- System enables supplier comparison based on quality-related wastage
- Quality issue data is available to vendor management module for supplier performance reviews

**Related Requirements**: FR-WAST-002, BR-WAST-011

---

### FR-WAST-013: Support Batch Wastage Recording
**Priority**: Medium

The system must allow users to record multiple wastage items in a single batch transaction, improving efficiency when processing end-of-day or end-of-shift wastage. Batch recording must maintain same validation and approval requirements as individual transactions.

**Acceptance Criteria**:
- User can create batch wastage transaction containing multiple line items
- Each line item captures same information as individual wastage: Product, Quantity, Category, Reason, Photos (optional)
- Batch header captures common information: Wastage date, Location, Overall reason/context, Recorded by
- User can add, edit, or remove line items before submitting batch
- System calculates total batch value as sum of all line items
- System validates each line item individually using same validation rules
- Batch approval routes as single transaction based on total batch value
- Approver can view all line items and approve/reject entire batch or individual line items
- System creates separate inventory adjustments for each line item after approval
- Batch transactions are identified in wastage history and reports
- User can copy line items from previous batches to speed up repetitive recording
- System supports batch templates for common wastage scenarios (e.g., end-of-day buffet wastage)

**Related Requirements**: FR-WAST-001, FR-WAST-007, BR-WAST-001

---

### FR-WAST-014: Mobile Wastage Recording
**Priority**: Medium

The system must support wastage recording via mobile devices (smartphones, tablets) enabling staff to record wastage at point of occurrence with photo capture. Mobile interface must be optimized for speed and ease of use.

**Acceptance Criteria**:
- System provides mobile-responsive web interface accessible via mobile browsers
- Mobile interface optimized for touch interaction with large touch targets (minimum 44x44 pixels)
- Mobile interface supports barcode scanning using device camera for product selection
- Mobile interface integrates with device camera for direct photo capture
- Mobile interface supports offline data entry with automatic sync when connectivity restored
- Mobile interface provides streamlined workflow with minimal taps to record wastage
- Mobile interface displays only essential fields to reduce scrolling on small screens
- Mobile interface supports voice input for reason/description field (if device supports)
- Mobile interface respects same validation rules and business logic as desktop version
- Mobile interface provides confirmation feedback (visual and haptic) for user actions
- Mobile interface supports location auto-detection (if user grants permission)
- Mobile interface works across iOS, Android, and modern mobile browsers

**Related Requirements**: FR-WAST-001, FR-WAST-006, NFR-WAST-012

---

### FR-WAST-015: Integrate with Financial System
**Priority**: Medium

The system must integrate with financial modules to ensure wastage is properly accounted for in COGS, inventory valuation, and GL postings. Integration must be automated, accurate, and auditable.

**Acceptance Criteria**:
- System automatically posts approved wastage to appropriate GL accounts based on wastage category and product category
- Posting captures: Wastage value (debit), Inventory value reduction (credit), GL account codes, Cost center/department, Posting date (wastage date)
- System supports configurable GL account mapping by wastage category (e.g., spoilage posts to different account than preparation error)
- System creates journal entry detail showing wastage transaction reference for audit trail
- System updates inventory valuation reducing inventory asset value
- System includes wastage in COGS calculation for P&L reporting
- Integration respects financial period cutoff dates (e.g., prevents posting to closed periods)
- System supports reversal postings if wastage is rejected or corrected after initial approval
- System provides reconciliation report comparing wastage recorded in operations vs GL postings
- Integration maintains transaction integrity (if GL posting fails, wastage remains pending until resolved)
- System supports different accounting treatments based on materiality thresholds (e.g., immaterial wastage may be batched)

**Related Requirements**: BR-WAST-012, NFR-WAST-010

---

### FR-WAST-016: Dashboard Sorting and Filtering
**Priority**: High
**Implementation Status**: ✅ IMPLEMENTED

The system must provide comprehensive sorting and filtering capabilities on the wastage reporting dashboard to enable users to quickly find and prioritize wastage records based on various criteria.

**Acceptance Criteria**:
- User can sort recent wastage reports by multiple fields: date, total loss value, item name, quantity
- Sort direction is clearly indicated (ascending/descending) with toggle functionality
- Default sort is by date descending (most recent first)
- Sort configuration persists within the user session
- Dashboard displays sort dropdown with clear field labels
- Sorting applies to all visible records in the recent reports table
- Performance remains responsive with up to 1,000 records in view
- Sort by total loss value enables quick identification of high-value wastage
- Sort by item name groups related wastage for pattern identification
- Sort by quantity helps identify bulk wastage incidents

**Related Requirements**: FR-WAST-009, FR-WAST-010

**Implementation Evidence**:
- File: `app/(main)/store-operations/wastage-reporting/page.tsx`
- Sort configuration: `{ field: 'date' | 'totalLoss' | 'itemName' | 'quantity', direction: 'asc' | 'desc' }`

---

### FR-WAST-017: Per-Item Evidence Attachments
**Priority**: High
**Implementation Status**: ✅ IMPLEMENTED

The system must support attaching photographic evidence to individual wastage line items, enabling granular documentation for each wasted product rather than only at the report level.

**Acceptance Criteria**:
- User can attach photos to each individual line item within a wastage report
- Each line item can have multiple attachments (up to 5 per item)
- Attachments display in expandable/collapsible item detail panels
- System shows thumbnail previews of attached photos
- User can view full-resolution photos by clicking thumbnails
- Attachments support common image formats: JPG, PNG, HEIC
- Per-item attachments are separate from report-level attachments
- Attachments are linked to specific line items for audit trail
- Attachment count is displayed on collapsed item panels
- Attachments are preserved when editing draft reports

**Related Requirements**: FR-WAST-006, BR-WAST-003

**Implementation Evidence**:
- Type: `WastageItem.attachments?: WastageAttachment[]` in `lib/types/wastage.ts`
- UI: Expandable item panels in `app/(main)/store-operations/wastage-reporting/reports/[id]/page.tsx`

---

### FR-WAST-018: Review Decision Workflow
**Priority**: Critical
**Implementation Status**: ✅ IMPLEMENTED

The system must provide a dedicated review decision interface for managers to approve or reject wastage reports, capturing decision rationale and enabling post-decision visibility.

**Acceptance Criteria**:
- Review decision component displays for reports in 'Submitted' or 'Under Review' status
- Component shows only to users with review/approval permissions
- Approver can enter review notes before making decision (optional for approval, required for rejection)
- Approve action moves report to 'Approved' status and enables "Post to Stock Out" action
- Reject action moves report to 'Rejected' status with mandatory rejection reason
- After decision, system displays review status with decision details (approver, date, notes)
- Loading states prevent duplicate submissions during processing
- Decision actions are disabled while processing to prevent race conditions
- Review notes are preserved in audit trail for future reference
- Status badge updates immediately after decision

**Related Requirements**: FR-WAST-003, FR-WAST-004, BR-WAST-007, BR-WAST-008

**Implementation Evidence**:
- Component: `app/(main)/store-operations/wastage-reporting/components/review-decision.tsx`
- Props: `ReviewDecisionProps { report, onApprove, onReject, isLoading }`
- Display: `ReviewStatusDisplay` component for post-decision view

---

### FR-WAST-019: Two-Level Category Classification
**Priority**: Critical
**Implementation Status**: ✅ IMPLEMENTED

The system must support a two-level wastage classification system with Category (header-level) and Reason (item-level), defaulting to "Wastage" category for new reports while allowing selection from other Stock OUT transaction categories.

**Acceptance Criteria**:
- Header-level category selection from Stock OUT transaction categories (WST, DMG, THEFT, SAMPLE, WRITE)
- Default category is "WST" (Wastage) for new reports
- Item-level reason selection within the selected category
- Reasons are filtered based on the selected header category
- Category selection triggers update of available reasons
- Both category and reason are required fields for form submission
- Category codes map to proper GL accounts for financial posting
- System maintains consistency between header category and item reasons
- Category and reason are displayed in report detail views
- Analytics can aggregate by both category and reason dimensions

**Related Requirements**: FR-WAST-002, BR-WAST-002

**Implementation Evidence**:
- File: `app/(main)/store-operations/wastage-reporting/new/page.tsx`
- Uses: `getCategoryOptionsForType("OUT")` for Stock OUT categories
- Default: `wastageCategory: "WST"`

---

### FR-WAST-020: Post to Stock Out Adjustment
**Priority**: Critical
**Implementation Status**: ✅ IMPLEMENTED (UI Complete)

The system must enable approved wastage reports to be posted as Stock Out inventory adjustments, creating the necessary inventory transactions to reduce stock quantities and record financial impact.

**Acceptance Criteria**:
- "Post to Stock Out" action button displays only for 'Approved' status reports
- Action triggers creation of inventory adjustment transaction
- Adjustment reduces stock quantity at the specified location
- Adjustment is linked to original wastage report for audit trail
- Adjustment applies appropriate costing method (FIFO/FEFO/Weighted Average)
- Status changes to 'Posted' after successful adjustment creation
- Posted reports cannot be edited or reversed (new transaction required for corrections)
- Adjustment reference number is displayed on posted report
- Financial posting to appropriate GL accounts occurs with adjustment
- User receives confirmation of successful posting with adjustment reference

**Related Requirements**: FR-WAST-005, BR-WAST-006, BR-WAST-007

**Implementation Evidence**:
- Status: 'Posted' in `WastageReportStatus` type
- Workflow: `canPostWastageReport()` helper function in `lib/types/wastage.ts`

---

## Business Rules

### General Rules
- **BR-WAST-001**: All wastage transactions must be recorded in the system on the same day the wastage occurs, or within 24 hours. Backdating beyond 7 days requires Finance Manager approval.

- **BR-WAST-002**: Every wastage transaction must be assigned to one and only one wastage category. If multiple categories apply, primary category is selected and others noted in reason field.

- **BR-WAST-003**: Wastage transactions with value exceeding $100 must include at least one photographic evidence. Wastage exceeding $500 requires minimum 2 photos from different angles.

### Data Validation Rules
- **BR-WAST-004**: Wastage quantity cannot exceed current stock-on-hand quantity at the time of recording. System displays warning if wastage represents >50% of current stock.

- **BR-WAST-005**: Wastage reason description must be minimum 20 characters and maximum 500 characters. Generic reasons like "bad" or "waste" are not accepted.

- **BR-WAST-006**: Wastage date cannot be more than 7 days in the past without special approval, and cannot be in the future. Time of wastage is automatically captured from system clock.

### Workflow Rules
- **BR-WAST-007**: Wastage approval thresholds are defined as follows (configurable):
  - **Auto-Approve**: <$50 for expired items within 24 hours of expiry date
  - **Department Manager**: $50 - $200
  - **Store Manager**: $200 - $500
  - **Store Manager + Finance Manager**: >$500

- **BR-WAST-008**: Users cannot approve their own wastage transactions. If user is the designated approver, wastage must route to next approval level or their manager.

- **BR-WAST-009**: Wastage approval must be completed within 48 business hours of submission. Pending approvals >48 hours are escalated to next approval level with notification.

- **BR-WAST-010**: Rejected wastage transactions cannot be edited and resubmitted. A new wastage transaction must be created if wastage needs to be resubmitted with corrections.

### Calculation Rules
- **BR-WAST-011**: Wastage value is calculated as: Wastage Quantity × Unit Cost at time of wastage. Unit cost is sourced from most recent inventory costing (FIFO, Weighted Average, or method configured).

- **BR-WAST-012**: Total daily wastage percentage is calculated as: (Daily Wastage Value / Daily COGS) × 100. Industry benchmark for F&B is 4-10% depending on operation type.

- **BR-WAST-013**: Overproduction wastage occurring after 9:00 PM is automatically flagged for production planning review to optimize prep schedules and forecasting.

### Security Rules
- **BR-WAST-014**: Users can only record wastage for locations they have access to based on user-location assignments. Users with multiple location access must explicitly select location.

- **BR-WAST-015**: Only users with "Wastage Approver" permission can approve wastage. Approval permissions are role-based and cannot be granted at individual user level (except by System Administrator).

- **BR-WAST-016**: Wastage transaction history can only be viewed by users with access to the location where wastage occurred, or users with "View All Wastage" permission (typically Finance and Operations Managers).

### Location Type Business Rules

Wastage reporting behavior varies based on the **location type** where wastage occurs. The system supports three location types that determine inventory adjustment, GL posting, and vendor notification behavior.

#### Location Type Definitions

| Location Type | Code | Purpose | Examples |
|---------------|------|---------|----------|
| **INVENTORY** | INV | Standard tracked warehouse locations | Main Warehouse, Central Kitchen Store |
| **DIRECT** | DIR | Direct expense locations (no stock balance) | Restaurant Bar Direct, Kitchen Direct |
| **CONSIGNMENT** | CON | Vendor-owned inventory locations | Beverage Consignment, Linen Consignment |

#### BR-WAST-017: Location Type Processing Rules

**INVENTORY Locations (INV)**:
- ✅ Full wastage tracking with inventory adjustment
- ✅ Creates negative inventory transaction
- ✅ FIFO cost layer consumption for accurate costing
- ✅ GL: Debit Wastage Expense, Credit Inventory Asset
- ✅ Value-based approval thresholds apply
- ✅ Complete audit trail with lot tracking

**DIRECT Locations (DIR)**:
- ⚠️ Wastage recorded for metrics and analytics only
- ❌ No inventory adjustment (no stock balance exists)
- ❌ No cost layer consumption
- ✅ GL: No posting (items already expensed at receipt)
- ✅ Simplified approval workflow
- ✅ Metrics tracking for operational insights

**CONSIGNMENT Locations (CON)**:
- ✅ Full wastage tracking with inventory adjustment
- ✅ Creates negative inventory transaction
- ✅ FIFO cost layer consumption
- ✅ GL: Debit Wastage Expense, Credit Vendor Liability
- ✅ Automatic vendor charge-back notification
- ✅ Value-based approval thresholds apply
- ✅ Complete audit trail with vendor reference

#### BR-WAST-018: Location Type Feature Matrix

| Feature | INVENTORY | DIRECT | CONSIGNMENT |
|---------|-----------|--------|-------------|
| **Wastage Tracking** | ✅ Full | ⚠️ Metrics only | ✅ Full |
| **Inventory Adjustment** | ✅ Creates adjustment | ❌ None | ✅ Creates adjustment |
| **Cost Layer Consumption** | ✅ FIFO | ❌ None | ✅ FIFO |
| **GL Impact** | Expense + Asset reduction | None (pre-expensed) | Expense + Liability reduction |
| **Approval Workflow** | Value-based | Simplified | Value-based + Vendor |
| **Vendor Notification** | ❌ N/A | ❌ N/A | ✅ Charge-back |
| **Analytics Inclusion** | ✅ Full | ✅ Metrics | ✅ Full |
| **Photo Requirements** | Value-based | Optional | Value-based |

#### BR-WAST-019: Location Type Validation Rules

1. **Location Selection**:
   - User must have access to selected location
   - Location type determines available workflow options
   - DIRECT locations show informational banner about metrics-only tracking

2. **Quantity Validation**:
   - INVENTORY/CONSIGNMENT: Cannot exceed current stock-on-hand
   - DIRECT: No quantity validation (no stock balance to check)

3. **UI Indicators**:
   - Location type badge displayed in location selection
   - Alert banner for DIRECT locations explaining limited tracking
   - Vendor information displayed for CONSIGNMENT wastage

---

## Data Model

**Note**: The interfaces shown below are **conceptual data models** used to communicate business requirements. They are NOT intended to be copied directly into code. Developers should use these as a guide to understand the required data structure and then implement using appropriate technologies and patterns for the technical stack.

### Wastage Header Entity

**Purpose**: Represents the main wastage transaction capturing overall information, approval status, and audit trail. Each wastage transaction can contain one or more line items.

**Conceptual Structure**:

```typescript
interface WastageHeader {
  // Primary key
  id: string;                           // UUID, primary key

  // Document identification
  wastage_number: string;               // Auto-generated, format: WST-YYYY-MMDD-NNNN
  wastage_date: Date;                   // Date wastage occurred
  wastage_time: string;                 // Time wastage occurred (HH:MM format)

  // Location and organization
  location_id: string;                  // Foreign key to locations table
  location?: Location;                  // Navigation property
  department_id: string;                // Department where wastage occurred
  department?: Department;              // Navigation property

  // Classification
  wastage_category: 'spoilage' | 'overproduction' | 'preparation_error' |
                    'damaged' | 'expired' | 'customer_return' | 'portion_control' |
                    'quality_issue' | 'contamination' | 'equipment_failure' |
                    'training_testing' | 'sampling' | 'other';
  subcategory?: string;                 // Optional sub-classification

  // Responsible party
  responsible_party_id?: string;        // Optional, staff member responsible
  responsible_party?: User;             // Navigation property

  // Supplier quality tracking
  is_supplier_quality_issue: boolean;   // Flag for supplier-related wastage
  supplier_id?: string;                 // Foreign key to vendors table (if supplier issue)
  supplier?: Vendor;                    // Navigation property
  quality_issue_type?: string;          // Type of quality problem
  grn_reference?: string;               // GRN number for traceability

  // Documentation
  reason: string;                       // Detailed explanation (min 20 chars)
  additional_notes?: string;            // Optional additional context
  photos: WastagePhoto[];               // Array of photo attachments

  // Financial
  total_value: number;                  // Total wastage value (sum of line items), 2 decimals
  currency: string;                     // ISO currency code (USD, EUR, etc.)

  // Workflow and status
  doc_status: 'draft' | 'pending_approval' | 'approved' |
              'partially_approved' | 'rejected' | 'cancelled';
  approval_level_required: number;      // Number of approval levels required (0-3)
  current_approval_level: number;       // Current approval level reached
  is_auto_approved: boolean;            // Whether auto-approved by system rules

  // Batch transaction
  is_batch: boolean;                    // Whether this is batch wastage
  batch_context?: string;               // Context for batch (e.g., "End of day buffet")

  // Integration
  inventory_adjusted: boolean;          // Whether inventory has been adjusted
  inventory_adjustment_id?: string;     // Link to inventory adjustment transaction
  gl_posted: boolean;                   // Whether posted to GL
  gl_journal_entry_id?: string;         // Link to GL journal entry

  // Collections
  line_items: WastageLineItem[];        // Wastage line items
  approvals: WastageApproval[];         // Approval history

  // Audit fields
  created_date: Date;                   // Creation timestamp
  created_by: string;                   // Creator user ID
  created_by_user?: User;               // Navigation property
  updated_date: Date;                   // Last update timestamp
  updated_by: string;                   // Last updater user ID
  updated_by_user?: User;               // Navigation property
  submitted_date?: Date;                // When submitted for approval
  approved_date?: Date;                 // When finally approved
  approved_by?: string;                 // Final approver user ID
}
```

### Wastage Line Item Entity

**Purpose**: Represents individual products wasted within a wastage transaction. Multiple line items can exist for a single wastage header (batch wastage).

**Conceptual Structure**:

```typescript
interface WastageLineItem {
  // Primary key
  id: string;                           // UUID, primary key

  // Parent reference
  wastage_header_id: string;            // Foreign key to wastage_headers
  wastage_header?: WastageHeader;       // Navigation property
  line_number: number;                  // Line sequence number

  // Product information
  product_id: string;                   // Foreign key to products table
  product?: Product;                    // Navigation property
  product_code: string;                 // Snapshot of product code at time of wastage
  product_name: string;                 // Snapshot of product name
  product_category: string;             // Product category for reporting

  // Quantity
  quantity: number;                     // Wastage quantity (decimal, precision 3)
  unit_of_measure: string;              // Unit (kg, liters, portions, ea, etc.)
  base_quantity?: number;               // Converted to base unit if different UOM

  // Stock at time of wastage
  stock_on_hand_before: number;         // Stock before wastage recording
  stock_on_hand_after: number;          // Expected stock after adjustment

  // Costing
  unit_cost: number;                    // Unit cost at time of wastage (2 decimals)
  total_value: number;                  // Quantity × Unit Cost (2 decimals)
  costing_method: 'FIFO' | 'LIFO' | 'WeightedAverage' | 'SpecificIdentification';

  // Line-specific details
  line_reason?: string;                 // Optional reason specific to this line
  line_photos: string[];                // Array of photo URLs for this line item

  // Expiry tracking (for expired items)
  expiry_date?: Date;                   // Product expiry date (if applicable)
  days_past_expiry?: number;            // Days past expiry date

  // Approval
  approved_quantity?: number;           // Quantity approved (if partially approved)
  rejected_quantity?: number;           // Quantity rejected
  line_status: 'pending' | 'approved' | 'partially_approved' | 'rejected';

  // Audit fields
  created_date: Date;                   // Creation timestamp
  created_by: string;                   // Creator user ID
  updated_date: Date;                   // Last update timestamp
  updated_by: string;                   // Last updater user ID
}
```

### Wastage Photo Entity

**Purpose**: Stores photographic evidence attached to wastage transactions. Photos provide visual proof of wastage and aid in fraud prevention.

**Conceptual Structure**:

```typescript
interface WastagePhoto {
  // Primary key
  id: string;                           // UUID, primary key

  // Parent references
  wastage_header_id: string;            // Foreign key to wastage_headers
  wastage_line_item_id?: string;        // Optional FK to specific line item

  // Photo information
  file_name: string;                    // Original file name
  file_path: string;                    // Secure storage path/URL
  file_size: number;                    // File size in bytes
  mime_type: string;                    // Image MIME type (image/jpeg, image/png, etc.)

  // Metadata
  caption?: string;                     // User-provided description
  sequence_number: number;              // Photo order (1-5)

  // Photo capture details
  captured_date: Date;                  // When photo was taken
  captured_by: string;                  // User who captured photo
  device_info?: string;                 // Device used to capture (optional)
  location_coordinates?: string;        // GPS coordinates if available

  // Watermark information
  is_watermarked: boolean;              // Whether photo has watermark
  watermark_text?: string;              // Watermark content (date, time, location, user)

  // Audit fields
  created_date: Date;                   // Upload timestamp
  created_by: string;                   // Uploader user ID
}
```

### Wastage Approval Entity

**Purpose**: Tracks approval workflow history for wastage transactions. Each approval level creates a separate record providing complete audit trail.

**Conceptual Structure**:

```typescript
interface WastageApproval {
  // Primary key
  id: string;                           // UUID, primary key

  // Parent reference
  wastage_header_id: string;            // Foreign key to wastage_headers
  wastage_header?: WastageHeader;       // Navigation property

  // Approval level
  approval_level: number;               // Approval level (1, 2, 3)
  approval_sequence: number;            // Sequence within level for parallel approvals

  // Approver information
  approver_id: string;                  // User ID of approver
  approver?: User;                      // Navigation property
  approver_role: string;                // Role of approver at time of approval
  delegated_from_id?: string;           // If delegated, original approver ID

  // Approval action
  approval_action: 'approved' | 'partially_approved' | 'rejected' | 'pending';
  approval_date?: Date;                 // When action was taken

  // Partial approval details
  original_total_value: number;         // Original wastage value
  approved_total_value?: number;        // Approved value (if partial)
  reduction_reason?: string;            // Reason for reduction

  // Comments
  approval_comments?: string;           // Approver's notes (mandatory for rejection/reduction)

  // Notification
  notification_sent_date?: Date;        // When approver was notified
  notification_viewed_date?: Date;      // When approver viewed notification
  response_time_hours?: number;         // Hours from notification to approval

  // Audit fields
  created_date: Date;                   // Record creation timestamp
  created_by: string;                   // System user (typically workflow engine)
  updated_date: Date;                   // Last update timestamp
  updated_by: string;                   // Last updater user ID
}
```

### Wastage Configuration Entity

**Purpose**: Stores system configuration for wastage module including approval thresholds, alert rules, and category settings.

**Conceptual Structure**:

```typescript
interface WastageConfiguration {
  // Primary key
  id: string;                           // UUID, primary key

  // Organization scope
  organization_id?: string;             // Optional, for multi-org systems
  location_id?: string;                 // Optional, location-specific config

  // Approval thresholds
  auto_approve_threshold: number;       // Value below which auto-approval applies
  level1_threshold: number;             // Department Manager approval threshold
  level2_threshold: number;             // Store Manager approval threshold
  level3_threshold: number;             // Finance Manager approval threshold

  // Photo requirements
  photo_required_threshold: number;     // Value requiring photo evidence
  minimum_photos_high_value: number;    // Minimum photos for high-value wastage

  // Time constraints
  max_backdate_days: number;            // Maximum days to backdate without approval
  approval_deadline_hours: number;      // Hours before approval escalation

  // Alert thresholds
  daily_wastage_alert_threshold: number;        // Daily total triggering alert
  product_wastage_alert_threshold: number;      // Single product wastage alert
  user_wastage_alert_threshold: number;         // User total wastage alert

  // Alert recipients
  alert_email_list: string[];           // Email addresses for alerts
  escalation_email_list: string[];      // Escalation email addresses

  // Category configuration
  active_categories: string[];          // Enabled wastage categories
  category_gl_mapping: Record<string, string>;  // Category to GL account mapping

  // Auto-approval rules
  auto_approve_expired_items: boolean;  // Auto-approve expired items
  expired_within_hours: number;         // Hours from expiry for auto-approval

  // Audit fields
  created_date: Date;                   // Creation timestamp
  created_by: string;                   // Creator user ID
  updated_date: Date;                   // Last update timestamp
  updated_by: string;                   // Last updater user ID
  effective_date: Date;                 // When configuration becomes effective
}
```

---

## Integration Points

### Internal Integrations
- **Inventory Management**: Real-time inventory adjustments when wastage is approved; stock quantity validation when wastage is recorded; inventory valuation updates; transaction traceability between wastage and inventory adjustments.

- **Product Management**: Product master data (code, name, category, UOM, costing method); active product validation; product discontinuation handling; product cost retrieval for wastage valuation.

- **User Management**: User authentication and authorization; role-based permissions (recorder, approver, viewer); user-location assignments for access control; delegation management for approval workflows; audit trail user information.

- **Vendor Management**: Supplier master data for quality issue tracking; vendor performance metrics including quality-related wastage; supplier complaint creation from wastage transactions; GRN traceability for received goods quality issues.

- **Finance Module**: GL account posting for wastage expenses; COGS calculation including wastage; inventory asset value adjustments; journal entry creation with audit trail; period-end closing integration; cost center/department allocation.

- **Workflow Engine**: Multi-level approval routing based on value thresholds; approval delegation handling; escalation management; notification generation; approval history tracking.

- **Reporting & Analytics**: Wastage KPI calculation and tracking; trend analysis across multiple dimensions; comparative reporting (location, category, time period); dashboard visualizations; scheduled report generation.

### External Integrations
- **Accounting System** (if separate): Automated GL posting of approved wastage; chart of accounts synchronization; cost center/department master data sync; journal entry export for external accounting packages; reconciliation reporting.

- **Business Intelligence Tools**: Data export for advanced analytics in Tableau, Power BI, or similar; API access for real-time wastage data; data warehouse integration for historical analysis.

### Data Dependencies
- **Depends On**: Products (master data), Inventory (stock quantities and costing), Users (authentication and permissions), Locations (organizational structure), Vendors (supplier quality tracking), GL Accounts (financial posting), Workflow Rules (approval routing)

- **Used By**: Financial Reporting (COGS and wastage expense), Inventory Valuation (asset value adjustments), Purchasing (supplier quality analysis), Operations Analytics (efficiency metrics), Audit & Compliance (transaction history and evidence)

---

## Non-Functional Requirements

### Performance
- **NFR-WAST-001**: Wastage recording form must load within 2 seconds on standard network connection (5 Mbps).

- **NFR-WAST-002**: Wastage transaction save operation must complete within 3 seconds including validation and database commit.

- **NFR-WAST-003**: Wastage approval action (approve/reject) must complete within 2 seconds including inventory adjustment creation.

- **NFR-WAST-004**: Wastage reports with up to 10,000 transactions must generate within 10 seconds; reports with pagination should display first page within 5 seconds.

- **NFR-WAST-005**: System must support minimum 50 concurrent users recording wastage simultaneously without performance degradation.

### Security
- **NFR-WAST-006**: All wastage data must be protected using row-level security (RLS) ensuring users can only access wastage for locations they have permission to view.

- **NFR-WAST-007**: Photo uploads must be scanned for malware before storage; only image file types (JPG, PNG, HEIC) are accepted with file size limit of 10MB per photo.

- **NFR-WAST-008**: All wastage modifications (creation, approval, rejection) must create audit log entries capturing user ID, timestamp, IP address, and action details.

- **NFR-WAST-009**: Photo storage must use secure cloud storage with encryption at rest (AES-256) and in transit (TLS 1.2+); photo URLs must be signed with expiration to prevent unauthorized access.

- **NFR-WAST-010**: Integration with financial system must use secure API authentication (OAuth 2.0 or API key) with encrypted data transmission; failed GL postings must not leave wastage in inconsistent state.

### Usability
- **NFR-WAST-011**: Wastage recording interface must be usable on mobile devices (smartphones and tablets) with responsive design; touch targets must be minimum 44x44 pixels.

- **NFR-WAST-012**: Mobile photo capture must integrate with device camera with maximum 2 taps to capture and attach photo.

- **NFR-WAST-013**: System must provide clear, user-friendly error messages for validation failures; error messages must suggest corrective action (not just state problem).

- **NFR-WAST-014**: Wastage approval interface must clearly display all relevant information (product, quantity, value, photos, reason) without requiring scrolling on desktop screens (1920x1080 minimum).

- **NFR-WAST-015**: System must support keyboard navigation and shortcuts for power users; common actions (record wastage, approve, reject) must have keyboard shortcuts.

### Reliability
- **NFR-WAST-016**: Wastage module must achieve 99.5% uptime during business hours (6 AM - 11 PM local time); planned maintenance must occur outside business hours.

- **NFR-WAST-017**: System must perform automated daily backups of wastage data with retention period of 7 years to meet audit requirements; backup restoration must be testable quarterly.

- **NFR-WAST-018**: Wastage photo storage must have redundancy with automatic failover to ensure photos are never lost; photos must be backed up within 1 hour of upload.

- **NFR-WAST-019**: System must validate data integrity before and after inventory adjustments; if inventory adjustment fails, wastage must remain in "pending" state until manually resolved.

- **NFR-WAST-020**: System must handle concurrent approval of same wastage transaction gracefully using optimistic locking (doc_version); last approver wins with notification to other approvers.

### Scalability
- **NFR-WAST-021**: System must support growth to 500 locations and 10,000 users without architectural changes; database design must accommodate 50 million wastage transactions over 10 years.

- **NFR-WAST-022**: Photo storage must scale to accommodate 10 TB of images over 10 years; storage architecture must support tiered storage (hot/warm/cold) for cost optimization.

- **NFR-WAST-023**: Reporting and analytics must maintain performance as transaction volume grows; reports should use indexed queries and database optimization; consider data warehouse for historical analysis beyond 2 years.

---

## Success Metrics

### Efficiency Metrics
- **Wastage Recording Time**: Average time to record single wastage transaction <2 minutes (target: 90 seconds)
- **Approval Cycle Time**: Average time from submission to final approval <24 hours (target: 12 hours)
- **Mobile Adoption**: 60% of wastage transactions recorded via mobile devices within 6 months
- **Batch Recording Efficiency**: Average time to record 10-item batch <5 minutes (vs. 15-20 minutes for individual entries)

### Quality Metrics
- **Data Completeness**: 95% of wastage transactions have detailed reasons (>20 characters) and proper categorization
- **Photo Evidence Compliance**: 98% of high-value wastage (>$100) include photo evidence
- **Same-Day Recording**: 90% of wastage recorded within 24 hours of occurrence
- **Inventory Accuracy**: Inventory variance reduced by 30% within 6 months due to accurate wastage recording

### Adoption Metrics
- **User Adoption Rate**: 90% of kitchen and store staff actively using wastage module within 3 months
- **Transaction Volume**: Average 50-100 wastage transactions per location per month (baseline establishment)
- **Approver Response Rate**: 95% of approvals actioned within 48 hours
- **Report Utilization**: 80% of managers accessing wastage reports at least weekly

### Business Impact Metrics
- **Wastage Cost Reduction**: 20% reduction in total wastage costs within 12 months of implementation
- **Wastage as % of COGS**: Reduction from current level to industry benchmark (4-6% for full-service restaurants)
- **Overproduction Reduction**: 30% reduction in overproduction wastage through trend analysis and production planning improvements
- **Supplier Quality Improvement**: 50% reduction in supplier quality-related wastage through vendor performance management
- **Financial Close Time**: 25% reduction in month-end close time due to accurate, real-time wastage data
- **ROI**: System investment recovered within 18 months through wastage reduction and efficiency gains

---

## Dependencies

### Module Dependencies
- **Inventory Management**: Required for stock validation, inventory adjustments, and product costing; wastage cannot be recorded if inventory module is unavailable.

- **Product Management**: Required for product master data (code, name, category, UOM, costing method); wastage recording depends on active products.

- **User Management**: Required for authentication, authorization, role-based permissions, and user-location assignments; approval workflows depend on user role configuration.

- **Finance Module**: Required for GL account mapping and financial posting; wastage can be recorded without finance integration but GL posting will be delayed.

### Technical Dependencies
- **Photo Storage Service**: Cloud storage (AWS S3, Azure Blob, Google Cloud Storage) for secure, scalable photo storage with 99.9% availability SLA.

- **Notification Service**: Email service (SendGrid, AWS SES) for approval notifications and alerts; SMS service (Twilio) for critical alerts (optional).

- **Barcode Scanner Library**: JavaScript library for mobile barcode scanning (QuaggaJS, ZXing) to enable quick product selection.

- **Chart/Graph Library**: Charting library (Chart.js, D3.js, Recharts) for trend analysis visualizations and dashboard displays.

- **PDF Generation**: PDF library (jsPDF, PDFKit) for generating printable wastage reports and documentation.

### Data Dependencies
- **Product Master Data**: Current and accurate product information including codes, descriptions, UOMs, categories, and costing methods; stale product data leads to incorrect wastage valuation.

- **Inventory Balances**: Real-time inventory stock quantities for validation; wastage validation depends on accurate stock-on-hand data.

- **GL Account Chart**: Current chart of accounts for financial posting; wastage category to GL account mapping requires up-to-date GL structure.

- **User-Location Assignments**: Current user access permissions by location; security and approval routing depend on accurate user-location relationships.

- **Approval Threshold Configuration**: System configuration defining approval levels and value thresholds; changes to thresholds affect approval routing.

---

## Assumptions and Constraints

### Assumptions
- All wastage recording staff have access to smartphone or tablet with camera for photo capture (or workstation with webcam).

- Network connectivity is available at wastage recording locations; if offline capability is required, it will be implemented in Phase 2.

- Users have basic smartphone/tablet literacy and can capture photos and use touch interfaces without extensive training.

- Product master data is maintained accurately with current costs; costing method (FIFO, Weighted Average, etc.) is configured at product level.

- Wastage occurs during operational hours when staff are available to record immediately; end-of-day wastage is recorded before shift end.

- Approval thresholds are defined by finance team based on materiality and risk; thresholds may vary by location type (fine dining vs. quick service).

- GL account structure is stable; mapping between wastage categories and GL accounts is established during implementation and changes infrequently.

### Constraints
- Photo storage costs must be managed; photos older than 2 years may be archived to lower-cost storage tiers while maintaining 7-year retention for audit.

- Mobile web application (responsive web) is used instead of native mobile apps to avoid app store approval delays and multi-platform development costs; native apps may be considered in Phase 2 if performance requirements necessitate.

- Integration with legacy financial systems may require batch file exports rather than real-time API integration; modern ERP systems will use API integration.

- Barcode scanning accuracy depends on product barcode quality; damaged or low-quality barcodes may require manual product code entry.

- Reporting performance may degrade for queries spanning multiple years with millions of transactions; data warehouse or reporting database may be required for historical analysis beyond 2 years.

- Multi-currency support is limited to display; all wastage is stored in location's base currency; currency conversion for cross-border reporting is handled at reporting layer, not transaction level.

### Risks
- **Risk**: Users may not record wastage promptly leading to inaccurate inventory and late approval workflows. **Mitigation**: Implement end-of-day wastage checklist requiring manager sign-off; provide mobile app for immediate recording; send reminder notifications for unreported wastage; track compliance metrics and coach non-compliant staff.

- **Risk**: High-value wastage may be fraudulently recorded with falsified photos to cover theft. **Mitigation**: Require multiple photos from different angles for high-value wastage; implement anomaly detection for unusual wastage patterns (same user, same product, repeated high values); conduct random physical verification audits; review high-value wastage in weekly management meetings.

- **Risk**: Approval bottlenecks may occur if approvers are unavailable (vacation, busy periods) leading to delayed inventory adjustments. **Mitigation**: Implement approval delegation feature; configure automatic escalation after 48 hours; consider lower approval thresholds or auto-approval rules for low-risk categories; provide mobile approval interface for approvers.

- **Risk**: Photo storage costs may exceed budget if photo sizes are not controlled or retention period is too long. **Mitigation**: Implement client-side photo compression before upload (target 500KB per photo); configure automatic archival to cold storage after 2 years; enforce 5-photo maximum per transaction; monitor storage costs monthly and adjust retention policy if needed.

- **Risk**: Integration with financial system may fail causing wastage to be recorded in operations but not posted to GL creating accounting discrepancies. **Mitigation**: Implement robust error handling and retry logic; maintain reconciliation report comparing operational wastage to GL postings; create alert for failed postings requiring manual resolution; design integration to be idempotent preventing duplicate postings.

---

## Future Enhancements

### Phase 2 Enhancements
- **Predictive Wastage Analytics**: Machine learning model predicting expected wastage based on historical patterns, weather, events, day of week; alert managers when actual wastage deviates significantly from prediction.

- **Native Mobile Applications**: Develop native iOS and Android apps for improved performance, offline capability, and better camera integration; implement background sync for offline-recorded wastage.

- **Wastage Prevention Recommendations**: AI-powered recommendations for reducing wastage based on patterns (e.g., "Reduce buffet production on Tuesdays by 15%", "Order smaller quantities of Product X to reduce spoilage").

- **Integration with Smart Kitchen Equipment**: Connect with IoT temperature sensors, smart fridges, and cooking equipment to automatically detect and record wastage due to equipment failures or temperature excursions.

- **Supplier Quality Portal**: Provide vendors with secure portal to view quality complaints and wastage attributed to their products; enable supplier response and corrective action tracking.

### Future Considerations
- **Blockchain for Wastage Audit Trail**: Implement blockchain-based immutable audit trail for high-value wastage providing tamper-proof evidence for insurance claims and regulatory compliance.

- **Computer Vision for Photo Validation**: Use AI image recognition to validate wastage photos (e.g., detect if photo actually shows food waste vs. unrelated image); estimate wastage quantity from photo for validation.

- **Sustainability Reporting Integration**: Integrate with corporate sustainability platforms to report food waste metrics for ESG (Environmental, Social, Governance) reporting and carbon footprint calculations.

- **Donation and Compost Tracking**: Extend module to track food donations to charities and composting programs; measure waste diversion rates and generate tax donation receipts.

- **Menu Engineering Integration**: Provide direct feedback to menu engineering module identifying menu items with high wastage for menu optimization, pricing adjustments, or removal decisions.

### Technical Debt
- **Database Optimization**: As transaction volume grows beyond 10 million records, consider implementing database partitioning by date or location to maintain query performance; evaluate time-series database for high-volume installations.

- **Report Performance**: Historical reports spanning multiple years may require data warehouse implementation to avoid impacting operational database; consider scheduled ETL processes to reporting database.

- **Photo Storage Optimization**: Evaluate Content Delivery Network (CDN) for faster photo loading; implement progressive image loading and thumbnails to reduce bandwidth usage; consider image format optimization (WebP, AVIF).

---

## 9. Backend Implementation Requirements

### 9.1 Server Actions Required

The wastage reporting module requires the following Next.js server actions to implement business logic. All server actions must be type-safe with Zod validation and proper error handling.

#### Wastage Transaction Management (5 actions)

**`createWastageTransaction(data: CreateWastageInput): Promise<ActionResult<WastageHeader>>`**
- Creates new wastage transaction in "draft" status
- Validates product exists and stock quantity available
- Calculates total wastage value based on unit cost
- Captures user, location, date/time automatically
- Returns wastage reference number

**`submitWastageForApproval(wastageId: string): Promise<ActionResult<WastageHeader>>`**
- Validates wastage transaction is complete (required fields, photos if needed)
- Determines approval level required based on value thresholds
- Routes to appropriate approvers via workflow engine
- Updates status to "pending_approval"
- Sends notifications to approvers

**`updateWastageTransaction(wastageId: string, data: UpdateWastageInput): Promise<ActionResult<WastageHeader>>`**
- Updates wastage transaction in "draft" status only
- Re-validates data and recalculates totals
- Updates audit trail with modification details

**`deleteWastageTransaction(wastageId: string): Promise<ActionResult<void>>`**
- Soft deletes wastage in "draft" status only
- Prevents deletion of submitted/approved wastage
- Maintains audit trail

**`getWastageTransactions(filters: WastageFilters): Promise<ActionResult<WastageHeader[]>>`**
- Retrieves wastage transactions with filtering, sorting, pagination
- Applies row-level security based on user location permissions
- Supports search by wastage number, product, date range, category, status

#### Approval Workflow Management (3 actions)

**`approveWastageTransaction(wastageId: string, comments?: string): Promise<ActionResult<WastageHeader>>`**
- Validates user has approval permission for value threshold
- Records approval in wastage_approvals table
- Creates inventory adjustment transaction if final approval
- Updates wastage status and routes to next level if needed
- Sends notifications to submitter and next approver

**`partiallyApproveWastage(wastageId: string, approvedQuantity: number, reason: string): Promise<ActionResult<WastageHeader>>`**
- Reduces wastage quantity to approved amount
- Creates inventory adjustment for approved portion
- Returns remaining quantity to "draft" for resubmission
- Records partial approval in audit trail

**`rejectWastageTransaction(wastageId: string, reason: string): Promise<ActionResult<WastageHeader>>`**
- Validates rejection reason provided (minimum 30 characters)
- Updates wastage status to "rejected"
- Records rejection in wastage_approvals table
- Sends notification to submitter with rejection reason
- Prevents resubmission (new transaction must be created)

#### Inventory Integration (3 actions)

**`createInventoryAdjustmentFromWastage(wastageId: string): Promise<ActionResult<InventoryAdjustment>>`**
- Creates inventory adjustment reducing stock quantity
- Links adjustment to wastage transaction for traceability
- Respects inventory costing method (FIFO/FEFO/Weighted Average)
- Updates inventory valuation and COGS
- Validates sufficient stock quantity exists

**`validateStockAvailability(productId: string, locationId: string, quantity: number): Promise<ActionResult<StockValidation>>`**
- Checks current stock-on-hand for product at location
- Returns current quantity, unit cost, costing method
- Warns if wastage quantity exceeds 50% of current stock
- Prevents negative inventory if configured

**`getProductCostForWastage(productId: string, locationId: string, quantity: number, costingMethod: CostingMethod): Promise<ActionResult<CostDetails>>`**
- Retrieves unit cost based on costing method
- For FIFO: Returns oldest batch cost
- For FEFO: Returns nearest-expiry batch cost
- For Weighted Average: Calculates average across all batches
- Returns total wastage value and cost breakdown

#### Photo Management (2 actions)

**`uploadWastagePhoto(wastageId: string, photo: File): Promise<ActionResult<WastagePhoto>>`**
- Validates file type (JPG, PNG, HEIC) and size (<10MB)
- Scans for malware before storage
- Compresses image to target size (500KB)
- Stores in secure cloud storage with encryption
- Watermarks with date, time, location, user
- Returns secure signed URL with expiration

**`deleteWastagePhoto(photoId: string): Promise<ActionResult<void>>`**
- Removes photo from storage (wastage in "draft" status only)
- Updates wastage photo count
- Maintains audit trail of photo deletion

#### Analytics and Reporting (4 actions)

**`getWastageDashboardMetrics(locationId: string, dateRange: DateRange): Promise<ActionResult<DashboardMetrics>>`**
- Calculates KPIs: total wastage value, count, percentage of COGS
- Identifies top wastage products, categories, responsible parties
- Compares current period vs prior period
- Returns trend data for charts

**`analyzeWastagePatterns(filters: AnalysisFilters): Promise<ActionResult<WastageAnalytics>>`**
- Performs statistical analysis on wastage data
- Identifies anomalies and outliers
- Detects seasonal patterns and correlations
- Provides predictive insights and recommendations

**`generateWastageReport(reportType: string, filters: ReportFilters): Promise<ActionResult<ReportData>>`**
- Generates predefined standard reports
- Supports drill-down from summary to detail
- Exports to Excel, PDF, CSV formats
- Respects user security permissions

**`getSupplierQualityWastage(supplierId?: string, dateRange?: DateRange): Promise<ActionResult<SupplierQualityData[]>>`**
- Retrieves wastage attributed to supplier quality issues
- Calculates supplier quality metrics
- Groups by supplier, quality issue type, product
- Supports supplier performance comparison

#### Configuration Management (2 actions)

**`getWastageConfiguration(locationId?: string): Promise<ActionResult<WastageConfiguration>>`**
- Retrieves wastage module configuration
- Returns approval thresholds, alert rules, category settings
- Supports location-specific overrides

**`updateWastageConfiguration(config: WastageConfigurationInput): Promise<ActionResult<WastageConfiguration>>`**
- Updates wastage module configuration
- Validates threshold values and alert rules
- Requires administrator permission
- Creates new effective configuration version

---

### 9.2 Integration with Inventory Management System

The wastage reporting module integrates tightly with inventory management to ensure real-time stock accuracy and proper inventory valuation. Integration must support multiple costing methods.

#### Required Shared Methods

The wastage module depends on these inventory service methods (located in `lib/services/inventory.service.ts`):

**`getStockLevel(productId: string, locationId: string): Promise<StockLevel>`**
- Returns current stock-on-hand quantity
- Includes batch/lot details with expiry dates for FIFO/FEFO
- Provides unit cost based on costing method
- Used for wastage validation and value calculation

**`reserveStock(productId: string, locationId: string, quantity: number, reference: string): Promise<Reservation>`**
- Reserves stock for pending wastage approval
- Prevents stock from being allocated elsewhere
- Links reservation to wastage transaction
- Released if wastage is rejected

**`createInventoryAdjustment(adjustment: InventoryAdjustmentInput): Promise<InventoryAdjustment>`**
- Creates adjustment transaction reducing stock
- Links to source transaction (wastage) for audit trail
- Applies costing method for valuation
- Updates inventory value and COGS

**`getConsumptionHistory(productId: string, locationId: string, days: number): Promise<ConsumptionData>`**
- Returns historical consumption patterns
- Used for wastage anomaly detection
- Calculates average and standard deviation
- Identifies unusual wastage quantities

**`applyInventoryValuation(productId: string, locationId: string, quantity: number, method: CostingMethod): Promise<ValuationResult>`**
- Applies FIFO, FEFO, or Weighted Average costing
- Returns total value and unit cost breakdown
- Updates inventory asset value
- Creates journal entry for financial posting

#### FIFO (First-In-First-Out) Costing

**Used for**: Non-perishable items with batch tracking (dry goods, canned items, supplies)

**Implementation**:
- When wastage is approved, system identifies oldest inventory batches first
- Reduces quantity from oldest batches until wastage quantity is satisfied
- If oldest batch insufficient, moves to next oldest batch
- Wastage value = sum of (batch_quantity × batch_cost) across selected batches

**Server Action Integration**:
```typescript
// Example: Get FIFO cost for wastage
const costDetails = await getAvailableStockFIFO(
  productId,
  locationId,
  wastageQuantity
);
// Returns: [{ batchNumber, quantity, unitCost, expiryDate }, ...]

// Apply FIFO costing for inventory adjustment
const valuation = await applyInventoryValuation(
  productId,
  locationId,
  wastageQuantity,
  'FIFO'
);
```

**Integration Point**: `tb_inventory_transaction.batch_number` tracking

**Data Requirements**:
- Batch numbers on all inventory receipts
- Receipt dates for FIFO sequencing
- Batch-level cost tracking

#### FEFO (First-Expired-First-Out) Costing

**Used for**: Perishable food items, beverages, ingredients with expiry dates

**Implementation**:
- System prioritizes stock with nearest expiry dates
- Reduces quantity from nearest-expiry batches first
- Prevents wastage of fresher stock when older stock available
- Wastage value = sum of (batch_quantity × batch_cost) for nearest-expiry batches

**Server Action Integration**:
```typescript
// Example: Get FEFO cost for wastage
const costDetails = await getAvailableStockFEFO(
  productId,
  locationId,
  wastageQuantity
);
// Returns batches sorted by expiry date (nearest first)

// Apply FEFO costing
const valuation = await applyInventoryValuation(
  productId,
  locationId,
  wastageQuantity,
  'FEFO'
);
```

**Integration Point**: `tb_inventory.expiry_date` sorting

**Data Requirements**:
- Expiry dates on all perishable inventory
- Batch/lot tracking for traceability
- Shelf-life monitoring

**Special Handling for Expired Items**:
- Wastage of expired items auto-approved if within 24 hours of expiry
- System flags expired items proactively for wastage recording
- Expiry date validation prevents future-dated expiry

#### Weighted Average Costing

**Used for**: Inventory valuation and transfer pricing when batch-level tracking not feasible

**Implementation**:
- System calculates average cost across all batches in location
- Weighted average = total_inventory_value ÷ total_inventory_quantity
- All wastage valued at current weighted average cost
- Recalculated after each inventory transaction (receipt, adjustment, transfer)

**Server Action Integration**:
```typescript
// Example: Calculate weighted average cost
const avgCost = await calculateWeightedAverageCost(
  productId,
  locationId
);
// Returns: { averageCost, totalQuantity, totalValue }

// Apply weighted average costing
const valuation = await applyInventoryValuation(
  productId,
  locationId,
  wastageQuantity,
  'WeightedAverage'
);
```

**Integration Point**: Inventory costing configuration at product level

**Data Requirements**:
- Current inventory balance (quantity and value)
- Recent receipt costs for recalculation
- Costing method flag at product master level

#### Inventory Adjustment Transaction Flow

**Sequence for Approved Wastage**:

1. **Wastage Approval** → Triggers inventory adjustment creation
2. **Stock Validation** → Verify sufficient stock exists
3. **Cost Calculation** → Apply costing method (FIFO/FEFO/Weighted Average)
4. **Adjustment Creation** → Create inventory transaction reducing stock
5. **Inventory Update** → Reduce stock-on-hand quantity
6. **Valuation Update** → Reduce inventory asset value
7. **GL Posting** → Post wastage expense to GL accounts
8. **Link Transactions** → Link wastage to inventory adjustment for traceability

**Data Consistency Requirements**:
- Inventory adjustment must be atomic (all-or-nothing)
- If GL posting fails, adjustment must be reversible
- Concurrent wastage approvals must use optimistic locking
- Audit trail must capture all transaction linkages

---

### 9.3 Integration with Workflow Engine

The wastage module uses a centralized workflow engine for multi-level approval routing based on value thresholds.

#### Workflow Types

**Auto-Approve Workflow**:
- For low-value wastage below threshold (e.g., <$50)
- For expired items within 24 hours of expiry date
- Immediate approval without manual intervention
- Audit trail records auto-approval rule applied

**Sequential Approval Workflow**:
- For medium to high-value wastage
- Each approval level must complete before next level begins
- Example: Department Manager → Store Manager → Finance Manager
- Rejection at any level terminates workflow

**Parallel Approval Workflow** (Future Enhancement):
- Multiple approvers at same level can approve concurrently
- Example: Store Manager + Department Manager both approve
- Workflow proceeds when ALL parallel approvers complete

#### Workflow API Calls

**`createWorkflowInstance(workflowType: string, context: WorkflowContext): Promise<WorkflowInstance>`**
- Creates new workflow instance for wastage transaction
- Determines approval levels based on value and configuration
- Assigns approvers based on organizational hierarchy
- Returns workflow instance ID for tracking

**`routeToNextApprover(workflowInstanceId: string, approvalAction: ApprovalAction): Promise<WorkflowStep>`**
- Advances workflow to next step after approval
- Determines next approver in sequence
- Sends notifications to next approver
- Completes workflow if final approval reached

**`handleApprovalAction(workflowInstanceId: string, action: 'approved' | 'rejected', comments?: string): Promise<WorkflowResult>`**
- Records approval action in workflow history
- Routes to next level or completes workflow
- Triggers inventory adjustment if final approval
- Sends notifications to relevant parties

**`checkWorkflowStatus(workflowInstanceId: string): Promise<WorkflowStatus>`**
- Retrieves current workflow status
- Returns pending approvers and approval history
- Calculates time elapsed since submission
- Identifies overdue approvals requiring escalation

#### Approval Delegation

**`delegateApproval(fromUserId: string, toUserId: string, dateRange: DateRange): Promise<Delegation>`**
- Creates delegation when approver is unavailable
- Temporary delegation for specific time period
- Audit trail records delegation and approver on vacation
- Notifications sent to delegate

#### Escalation Rules

**Automatic Escalation**:
- If approval pending >48 hours, escalate to next level
- Send email notification to escalation contact
- Record escalation in workflow history
- Continue escalation every 24 hours until resolved

---

### 9.4 Database Schema Requirements

The wastage module requires 5 database tables (detailed in [DD-wastage-reporting.md](./DD-wastage-reporting.md)):

1. **tb_wastage_header**: Main wastage transaction (18 core fields + audit fields)
2. **tb_wastage_line_item**: Individual wastage line items (16 fields + audit)
3. **tb_wastage_photo**: Photo attachments with metadata (13 fields)
4. **tb_wastage_approval**: Approval workflow history (14 fields + audit)
5. **tb_wastage_configuration**: System configuration (15 settings fields)

**Total Fields**: ~90 database fields across 5 tables

**Key Indexes Required**:
- wastage_number (unique index for fast lookup)
- wastage_date + location_id (common filter combination)
- doc_status (frequently filtered in queries)
- created_by + wastage_date (user wastage history)
- product_id + wastage_date (product wastage analysis)

**Foreign Key Constraints**:
- wastage_header_id in line_item, photo, approval tables
- product_id → tb_products
- location_id → tb_locations
- created_by, approved_by → tb_users
- supplier_id → tb_vendors (for quality issues)

---

### 9.5 Scheduled Jobs Requirements

#### Daily Wastage Summary Job
**Schedule**: Daily at 2:00 AM local time

**Purpose**: Aggregate wastage data for reporting and analytics

**Actions**:
- Calculate daily wastage totals by location, category, product
- Update wastage KPI metrics (wastage as % of COGS)
- Generate daily wastage summary report for managers
- Identify locations with unusually high wastage for alerts
- Cache analytics data for dashboard performance

**Implementation**: Cron job or scheduled task calling `generateDailyWastageSummary()` server action

#### Pending Approval Escalation Job
**Schedule**: Hourly during business hours (6 AM - 11 PM)

**Purpose**: Escalate overdue wastage approvals

**Actions**:
- Query wastage transactions with pending approvals >48 hours
- Send escalation notifications to next approval level
- Update wastage records with escalation flag
- Log escalation in audit trail

**Implementation**: Cron job calling `escalatePendingApprovals()` server action

#### Photo Archive Job
**Schedule**: Daily at 3:00 AM local time

**Purpose**: Archive old photos to cold storage for cost optimization

**Actions**:
- Identify photos older than 2 years
- Move to cold storage tier (AWS S3 Glacier, Azure Archive)
- Update photo records with archived flag and new storage path
- Maintain retrieval capability for audit requirements (7-year retention)

**Implementation**: Cron job calling `archiveOldPhotos()` server action

#### Wastage Anomaly Detection Job
**Schedule**: Daily at 1:00 AM local time

**Purpose**: Identify unusual wastage patterns for fraud prevention

**Actions**:
- Calculate statistical baselines for wastage by product, user, location
- Detect outliers (>3 standard deviations from mean)
- Identify suspicious patterns (same user, same product, repeated high values)
- Generate fraud alerts for investigation
- Flag transactions for management review

**Implementation**: Cron job calling `detectWastageAnomalies()` server action

---

### 9.6 File Upload and Storage Requirements

#### Photo Storage Architecture

**Storage Provider**: Cloud storage with encryption (AWS S3, Azure Blob Storage, Google Cloud Storage)

**Storage Structure**:
```
/wastage-photos/
  /{year}/
    /{month}/
      /{wastage_id}/
        /original_{photo_id}.jpg
        /thumbnail_{photo_id}.jpg
        /watermarked_{photo_id}.jpg
```

**Upload Pipeline**:
1. **Client-side**: Compress image to target size (500KB) before upload
2. **Server-side validation**: Check file type, size, malware scan
3. **Image processing**: Generate thumbnail (150x150), apply watermark
4. **Secure storage**: Upload to cloud storage with encryption
5. **URL generation**: Create signed URL with 1-hour expiration for viewing
6. **Database record**: Store photo metadata in tb_wastage_photo

**Security Requirements**:
- Encryption at rest (AES-256)
- Encryption in transit (TLS 1.2+)
- Signed URLs with expiration (prevent unauthorized access)
- Malware scanning before storage
- Access logs for audit trail

**Performance Optimization**:
- Client-side compression reduces upload time and bandwidth
- Thumbnail generation for fast list views
- CDN integration for faster photo loading (future enhancement)
- Progressive image loading (load thumbnail first, then full resolution)

---

## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Business Owner | | | |
| Product Manager | | | |
| Technical Lead | | | |
| Finance Representative | | | |
| Quality Assurance | | | |

---

## Appendix

### Glossary
- **Wastage**: Food, beverage, or supplies that are discarded and cannot be used or sold, resulting in inventory reduction and expense recognition.
- **Overproduction**: Prepared food that exceeds customer demand and must be discarded due to quality standards or safety requirements (e.g., buffet items held beyond safe time limits).
- **Spoilage**: Products that have deteriorated or become unsuitable for consumption due to time, temperature abuse, or improper storage conditions.
- **Preparation Error**: Wastage resulting from cooking mistakes such as overcooking, undercooking, wrong recipe execution, or dropped items during preparation.
- **COGS**: Cost of Goods Sold - direct costs of producing goods sold by restaurant including food cost, beverage cost, and wastage expenses.
- **FIFO**: First In, First Out - inventory costing method where oldest inventory is used/sold first; commonly used in food service for freshness management.
- **GL Account**: General Ledger Account - account in financial system where wastage expenses are recorded; typically separate accounts for different wastage categories.
- **Par Level**: Target inventory level for a product; wastage as percentage of par level indicates inventory turnover efficiency.
- **Yield**: Actual usable product quantity from raw ingredient after preparation (e.g., 80% yield from whole fish means 20% wastage from bones, skin, etc.); different from operational wastage tracked in this module.

### References
- [Technical Specification](./TS-wastage-reporting.md)
- [Use Cases](./UC-wastage-reporting.md)
- [Data Schema](./DS-wastage-reporting.md)
- [Flow Diagrams](./FD-wastage-reporting.md)
- [Validations](./VAL-wastage-reporting.md)
- [Store Operations Module Overview](../README.md)
- [Inventory Management Integration](../../inventory-management/README.md)
- [Finance Module Integration](../../finance/README.md)

### Change Requests
| CR ID | Date | Description | Status |
|-------|------|-------------|--------|
| - | - | - | - |

---

**Document End**
