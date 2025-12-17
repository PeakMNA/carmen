# User Guide: Period-End Close Process

**📌 Audience**: Financial Managers, System Administrators

**Version**: 2.0.0 (Future Enhancement Specification)
**Status**: ⚠️ **PLANNED - NOT YET IMPLEMENTED**
## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
**Last Updated**: 2025-11-03

---

## ⚠️ CRITICAL NOTICE: Future Enhancement Document

**This user guide describes a PLANNED feature that is NOT yet implemented in the system.**

### Current Implementation Status

❌ **The following features described in this guide DO NOT exist**:
- Period management module and UI screens
- Period-end close process and workflow
- Period status lifecycle (OPEN → CLOSED → LOCKED)
- Snapshot creation and viewing
- Period re-open functionality
- Pre-close checklist validation
- Period-based transaction restrictions
- Financial reporting based on period snapshots

✅ **What DOES exist in current system**:
- Transaction-based inventory management
- Real-time inventory balance queries using `SUM(in_qty) - SUM(out_qty)`
- Transaction posting without period restrictions
- No period management screens or workflows
- No period-end close process

### Implementation Roadmap

This user guide describes **workflows for Phase 4-5** from `SCHEMA-ALIGNMENT.md`.

**Prerequisites**:
- Schema changes (Phase 1-2) must be completed
- Business logic implementation (Phase 3-4) must be completed
- UI screens and workflows must be built
- Only then can users follow this guide

**For current system usage, see**: System documentation for transaction-based inventory management

**For implementation roadmap, see**: `SCHEMA-ALIGNMENT.md` Phases 1-5

---

<div style="color: #FFD700;">

## Purpose

This guide provides step-by-step instructions for performing the monthly period-end close process in the Carmen ERP system. The period-end close creates permanent snapshots of inventory balances for financial reporting and locks the period to prevent further changes.

## Overview

### What is Period-End Close?

Period-end close is a monthly process that:
- ✅ Creates permanent inventory balance snapshots
- ✅ Calculates Cost of Goods Sold (COGS)
- ✅ Generates financial reports
- ✅ Locks the period to prevent backdated transactions
- ✅ Establishes opening balances for the next period

**Timing**: Performed within 3 business days after month-end

**Duration**: 15-30 minutes (depending on transaction volume)

**Required Role**: `financial-manager` or `system-admin`

### Period Status Lifecycle

```
OPEN → CLOSED → LOCKED
  ↑        ↓
  └────────┘
  (Re-open if needed)
```

| Status | Description | Can Post Transactions? |
|--------|-------------|----------------------|
| **OPEN** | Active month accepting transactions | ✅ Yes |
| **CLOSED** | Month closed with snapshot | ❌ No (can re-open) |
| **LOCKED** | Permanently closed | ❌ No (cannot re-open) |

## Prerequisites

### Before You Begin

Ensure you have:

1. **Access Rights**:
   - `financial-manager` or `system-admin` role
   - Access to "Period Management" module
   - Permission to run financial reports

2. **System Requirements**:
   - Stable internet connection
   - Recommended browser: Chrome, Firefox, or Edge (latest version)
   - Pop-up blocker disabled for Carmen ERP domain

3. **Time Allocation**:
   - Schedule 30-45 minutes for first-time close
   - Allow additional time for review and validation

### Monthly Close Schedule

**Recommended Timeline**:

| Day | Activity |
|-----|----------|
| **25th-28th** | Pre-close preparation and reminders |
| **Last Day** | Transaction cutoff (e.g., 5 PM) |
| **1st-3rd** | Period close and validation |
| **3rd-5th** | Report distribution and review |

## Pre-Close Checklist

### Step 1: Verify All Transactions Posted

**Goal**: Ensure no draft transactions remain for the period

**Navigation**: `Inventory > Transactions > Transaction List`

**Actions**:
1. Filter by period (e.g., "January 2025")
2. Filter by status = "DRAFT"
3. Review any remaining draft transactions
4. Either:
   - Post completed transactions
   - Delete/cancel incorrect drafts

**✅ Success Criteria**: Zero draft transactions for the period

---

### Step 2: Complete Inventory Counts

**Goal**: Reconcile physical counts with system quantities

**Navigation**: `Inventory Management > Physical Counts > Count List`

**Actions**:
1. Filter by count date within period
2. Check count status for all locations
3. Reconcile any variances
4. Post adjustment transactions if needed

**✅ Success Criteria**: All counts have status = "RECONCILED"

---

### Step 3: Confirm Prior Period Closed

**Goal**: Ensure periods close sequentially

**Navigation**: `System Administration > Period Management`

**Actions**:
1. View period list
2. Verify prior month status = "CLOSED" or "LOCKED"
3. If prior month still OPEN, close it first

**Example**:
- Closing January 2025? → December 2024 must be CLOSED
- Closing February 2025? → January 2025 must be CLOSED

**✅ Success Criteria**: Prior period status ≠ OPEN

---

### Step 4: Run Pre-Close Reports

**Goal**: Review summary data before closing

**Navigation**: `Reports > Inventory > Pre-Close Summary`

**Actions**:
1. Generate "Pre-Close Summary" report
2. Review key metrics:
   - Total inventory value
   - Top 10 high-value items
   - Items with negative quantities (investigate!)
   - Unusual variances from prior month
3. Investigate any anomalies
4. Correct errors before proceeding

**✅ Success Criteria**: No data integrity issues detected

---

### Pre-Close Checklist Summary

Print or copy this checklist:

- [ ] All transactions posted (zero drafts)
- [ ] Inventory counts reconciled
- [ ] Prior period closed
- [ ] Pre-close reports reviewed
- [ ] Anomalies investigated and resolved
- [ ] Backup completed (optional but recommended)

## Period Close Walkthrough

### Step 1: Navigate to Period Management

**Path**: `System Administration > Period Management`

**What You'll See**:
```
Period Management
─────────────────────────────────────────────
Period         Status    Transactions    Value
─────────────────────────────────────────────
2025-02       OPEN          245        $125,430
2025-01       OPEN        1,523        $458,762
2024-12       CLOSED      1,489        $425,380
2024-11       LOCKED      1,502        $431,250
```

**Identify Period to Close**: Find the period you want to close (e.g., "2025-01")

---

### Step 2: Initiate Period Close

**Action**: Click the **"Close Period"** button next to the target period

**What Happens**: System performs pre-validation checks

**Possible Outcomes**:

**Outcome A: Validation Passed** ✅
```
Pre-Close Validation
─────────────────────────────────────────────
✅ All transactions posted
✅ Inventory counts reconciled
✅ Prior period closed
✅ No data integrity issues

Summary:
  Total Transactions: 1,523
  Total Inventory Value: $458,762
  Lots to Snapshot: 1,523
  Estimated Time: 3-5 minutes

Ready to proceed?
[Cancel]  [Close Period]
```
→ Click **"Close Period"** to continue

**Outcome B: Validation Warnings** ⚠️
```
Pre-Close Validation
─────────────────────────────────────────────
✅ All transactions posted
⚠️ 3 inventory counts pending reconciliation
✅ Prior period closed
⚠️ 2 items with unusual variances (>50%)

Details:
  - Location: Kitchen, Count Date: 2025-01-28
  - Location: Bar, Count Date: 2025-01-30
  - Item-12345: Variance 75% (investigate)
  - Item-67890: Variance -55% (investigate)

[View Details]  [Proceed Anyway]  [Cancel]
```
→ Options:
- Click **"View Details"** to investigate
- Click **"Cancel"** to resolve issues first (recommended)
- Click **"Proceed Anyway"** if warnings acceptable

**Outcome C: Validation Failed** ❌
```
Pre-Close Validation Failed
─────────────────────────────────────────────
❌ 15 draft transactions found
✅ Inventory counts reconciled
❌ Prior period (2024-12) still OPEN
✅ No data integrity issues

You must resolve these issues before closing.

[View Draft Transactions]  [Close Prior Period]  [Cancel]
```
→ Resolve issues and try again

---

### Step 3: Confirm Period Close

**What You'll See**:
```
Confirm Period Close
─────────────────────────────────────────────
Period: January 2025 (2025-01)

This action will:
  ✓ Create snapshot for 1,523 lot balances
  ✓ Calculate COGS: $88,365
  ✓ Lock period (no more transactions)
  ✓ Generate period-end reports
  ✓ Notify finance and operations teams

Costing Method: FIFO
Snapshot Type: Lot-Level
Estimated Duration: 3-5 minutes

⚠️ This action cannot be undone automatically.
   Period can only be re-opened with authorization.

Enter reason for close (optional):
[______________________________________]

[Cancel]  [Confirm Close]
```

**Actions**:
1. Review summary information
2. Optionally enter reason (e.g., "Month-end close per schedule")
3. Click **"Confirm Close"**

---

### Step 4: Monitor Close Progress

**What You'll See**:
```
Closing Period: January 2025
─────────────────────────────────────────────
Status: Processing Snapshots...

Progress: ████████████░░░░░░ 65% (992/1,523)

Current: Creating snapshot for MK-250128-89

Elapsed: 2 minutes 15 seconds
Estimated Remaining: 1 minute 30 seconds

[View Details]
```

**What Happens Behind the Scenes**:
1. System queries all active lots
2. Calculates opening balances from prior period
3. Summarizes movements (receipts, issues, transfers, adjustments)
4. Calculates closing balances
5. Creates snapshot records
6. Validates data integrity
7. Updates period status to CLOSED
8. Generates reports

**Duration**: Typically 3-5 minutes for 1,500-2,000 snapshots

**Note**: Don't close browser window during this process!

---

### Step 5: Review Close Results

**What You'll See** (upon completion):
```
Period Close Complete ✅
─────────────────────────────────────────────
Period: January 2025 (2025-01)
Status: CLOSED
Closed At: 2025-02-01 14:45:32
Closed By: Jane Smith (financial-manager)

Results:
  ✅ Snapshots Created: 1,523
  ✅ Total Inventory Value: $458,762.50
  ✅ COGS Calculated: $88,365.00
  ✅ Reports Generated: 5

Generated Reports:
  📊 Inventory Valuation Summary
  📊 Period Movement Report
  📊 COGS Detail Report
  📊 Variance Analysis
  📊 Top 10 Items by Value

[Download All Reports]  [View Period Summary]  [Close]
```

**Actions**:
1. Review snapshot count (should match expectation)
2. Review total inventory value (compare to prior month)
3. Download reports for distribution
4. Click **"View Period Summary"** for detailed breakdown

---

### Step 6: Distribute Reports

**Navigation**: `Reports > Period-End Reports > January 2025`

**Reports to Distribute**:

| Report | Recipients | Purpose |
|--------|-----------|---------|
| **Inventory Valuation Summary** | Finance Team, CFO | Balance sheet preparation |
| **COGS Detail Report** | Finance Team | P&L preparation |
| **Period Movement Report** | Operations Team | Operational analysis |
| **Variance Analysis** | Operations, Procurement | Process improvement |

**Actions**:
1. Open each report
2. Review for accuracy
3. Export to PDF or Excel
4. Email to stakeholders or save to shared folder

---

## Post-Close Validation

### Validation Checklist

After closing, verify:

- [ ] **Period status updated**: Status = "CLOSED"
- [ ] **Snapshot count correct**: Matches active lot count
- [ ] **Inventory value reasonable**: Within ±10% of prior month (unless significant changes)
- [ ] **COGS calculated**: Matches expectation based on sales
- [ ] **Reports generated**: All 5 reports available
- [ ] **Next period open**: February 2025 status = "OPEN"
- [ ] **Opening balances correct**: Feb opening = Jan closing

### Spot Check Validation

**Navigation**: `Reports > Period-End Reports > January 2025 > Snapshot Detail`

**Actions**:
1. Select 5-10 high-value items randomly
2. For each item, verify:
   ```
   Closing Quantity = Opening + Receipts + Transfers In + Adj - Issues - Transfers Out
   ```
3. Compare closing balance to system inventory on hand
4. Investigate any discrepancies

**Example**:
```
Item: ITEM-12345 (Chicken Breast)
Location: Kitchen
Lot: MK-250115-01

Opening:     100.00 @ $12.50 = $1,250.00
Receipts:      0.00
Issues:      -75.00 @ $12.50 =  -$937.50
Adjustments:   0.00
Transfers:     0.00
─────────────────────────────────────────
Closing:      25.00 @ $12.50 =   $312.50 ✅

System Inventory: 25.00 ✅ (matches)
```

## Troubleshooting Common Issues

### Issue 1: "Prior Period Still Open" Error

**Symptom**: Cannot close current period because prior period is OPEN

**Cause**: Periods must close sequentially

**Resolution**:
1. Close prior period first
2. Then return to close current period

**Example**: To close January 2025, December 2024 must be CLOSED first

---

### Issue 2: "Draft Transactions Found" Error

**Symptom**: Validation fails due to draft transactions

**Resolution**:
1. Navigate to `Inventory > Transactions > Transaction List`
2. Filter: Period = target period, Status = DRAFT
3. For each draft:
   - Post if complete
   - Delete if incorrect
4. Return to period close

---

### Issue 3: "Snapshot Count Mismatch"

**Symptom**: Snapshot count doesn't match expectation

**Possible Causes**:
- Lots exhausted during period (remaining qty = 0)
- New lots created at month-end
- Transferred lots created at destination

**Resolution**:
1. Run "Active Lot Count" report for period-end date
2. Compare to snapshot count
3. Investigate discrepancies (should include exhausted lots in snapshot)

---

### Issue 4: "Inventory Value Variance >10%"

**Symptom**: Closing inventory value significantly different from prior month

**Possible Causes**:
- Large purchases or issues during period
- Cost changes (new vendor pricing)
- Inventory adjustments
- Data entry errors

**Resolution**:
1. Run "Period Movement Report"
2. Review large movements:
   - Large receipts (>$10K)
   - Large issues (>$10K)
   - Large adjustments
3. Verify legitimacy of movements
4. Correct errors if found (may require re-open)

---

### Issue 5: "Close Process Timeout"

**Symptom**: Browser shows "timeout" or "connection lost" during close

**Cause**: Large transaction volume or server load

**Resolution**:
1. Refresh browser page
2. Check period status:
   - If CLOSED: Process completed successfully
   - If OPEN: Process failed, check error logs
3. If failed, retry close process
4. If repeated failures, contact system administrator

---

### Issue 6: "Cannot Download Reports"

**Symptom**: Report download fails or blank

**Possible Causes**:
- Pop-up blocker
- Browser compatibility
- Server timeout

**Resolution**:
1. Check pop-up blocker settings (allow carmen-erp.com)
2. Try different browser (Chrome recommended)
3. Clear browser cache
4. If persistent, contact IT support

## Period Re-Opening Guide

### When to Re-Open a Period

Re-open a closed period only when:
- ✅ Critical transaction was missed
- ✅ Error discovered requiring correction

**Best Practice**: Minimize re-opens to <5% of all periods

### Re-Opening Process

**Step 1: Request Re-Open**

**Navigation**: `System Administration > Period Management`

**Actions**:
1. Locate closed period
2. Click **"Re-Open Period"** button
3. Complete re-open request form

**Form Fields**:
```
Re-Open Period Request
─────────────────────────────────────────────
Period: January 2025 (2025-01)
Current Status: CLOSED

Reason for Re-Opening (min 50 characters):
[____________________________________________________
 ____________________________________________________
 ____________________________________________________]

Example: "Missed GRN transaction from January 28th.
Need to post receipt for PO-2501-0156 (50 units of
ITEM-789 @ $15.25). Transaction was approved but not
entered before period close."

[Cancel]  [Submit Request]
```

---

**Step 2: Period Re-Opened**

**Notification**:
```
Period Re-Opened ✅
─────────────────────────────────────────────
Period: January 2025 (2025-01)
Previous Status: CLOSED
New Status: OPEN

Re-Opened At: 2025-02-05 10:15:00
Re-Opened By: Jane Smith
Reason: Missed GRN transaction from January 28th...

⚠️ Important:
  - Post corrective transactions within 24-48 hours
  - Ensure transaction dates are in January 2025
  - Re-close period when corrections complete
  - New snapshot will be created upon re-close

[View Period]  [Post Transactions]
```

---

**Step 3: Post Corrective Transactions**

**Actions**:
1. Post missed or corrective transactions
2. Ensure transaction dates within January 2025
3. Verify all corrections complete
4. Request final review from operations team

**⚠️ Important**:
- Transaction dates must be within original period (Jan 1-31)
- Cannot post transactions with February dates to January period

---

**Step 5: Re-Close Period**

**Actions**:
1. Return to `System Administration > Period Management`
2. Click **"Close Period"** for January 2025
3. Follow standard close process (see above)
4. New snapshot created (supersedes original)

**Result**:
- Original snapshot marked as "SUPERSEDED"
- New snapshot becomes current
- Opening balance for February updated from new snapshot
- Audit trail preserved for both snapshots

## Best Practices

### Monthly Close Routine

1. **Set Schedule**: Same day each month (e.g., 2nd business day)
2. **Send Reminders**: Notify teams 3 days before cutoff
3. **Pre-Close Review**: Check key metrics day before close
4. **Execute Close**: Follow checklist systematically
5. **Distribute Reports**: Share with stakeholders within 24 hours
6. **Document Issues**: Note any problems for process improvement

### Tips for Efficient Closing

**1. Establish Cutoff Time**
- Set clear transaction cutoff (e.g., 5 PM last day)
- Communicate cutoff to all users
- Enforce cutoff strictly

**2. Use Pre-Close Checklist**
- Print checklist and mark items as complete
- Don't skip steps (catches errors early)
- Keep completed checklists for audit

**3. Review Trends**
- Compare inventory value month-over-month
- Investigate unusual variances (>10%)
- Look for pattern anomalies

**4. Automate Reminders**
- Set calendar reminders for key dates
- Use system notifications for transaction cutoff
- Schedule report distribution

**5. Maintain Documentation**
- Keep notes on unusual items each month
- Document all re-opens with reasons
- File reports systematically

### Communication Best Practices

**Before Close**:
```
Subject: Month-End Inventory Close - January 2025

Dear Team,

This is a reminder that we will be closing the January
inventory period on February 2nd at 2 PM.

Please ensure:
✓ All transactions for January are posted by 5 PM Jan 31
✓ Inventory counts are completed and reconciled

Any transactions posted after the cutoff will be recorded
in February.

Questions? Contact finance@company.com

Best regards,
Finance Team
```

**After Close**:
```
Subject: January 2025 Inventory Period Closed

Dear Team,

The January 2025 inventory period has been successfully
closed.

Summary:
• Total Inventory Value: $458,762.50
• COGS: $88,365.00
• Snapshots Created: 1,523

Reports are attached and available in the shared folder:
/Finance/Period-End Reports/2025-01/

Notable items:
• Top value item: ITEM-12345 ($45,230)
• Largest movement: GRN-2501-0089 (+$12,500)

Please review and contact finance with any questions.

Best regards,
Finance Team
```

## Frequently Asked Questions

### Q1: How long does period close take?

**A**: Typically 15-30 minutes total:
- Pre-close checklist: 10-15 minutes
- System processing: 3-5 minutes
- Report review: 5-10 minutes

Larger operations (>2,000 transactions) may take 30-45 minutes.

---

### Q2: Can I post transactions while close is processing?

**A**: No, period transitions to CLOSED status immediately. Users attempting to post will receive "Period closed" error.

---

### Q3: What happens if I close browser during processing?

**A**: Process continues on server. Refresh page to check status:
- If CLOSED: Process completed successfully
- If OPEN: Process may have failed, check error logs

**Best Practice**: Keep browser open until completion.

---

### Q4: How many times can I re-open a period?

**A**: Maximum 5 times (configurable). Each re-open creates new snapshot.

**Best Practice**: Minimize re-opens to <5% of periods by improving pre-close processes.

---

### Q5: Can I re-open periods older than current month?

**A**: Only most recent closed period can be re-opened. Cannot re-open older periods or locked periods.

**Example**:
- Current month: March 2025 (OPEN)
- February 2025 (CLOSED) - ✅ Can re-open
- January 2025 (CLOSED) - ❌ Cannot re-open (not most recent)
- December 2024 (LOCKED) - ❌ Cannot re-open (locked)

---

### Q6: What's the difference between CLOSED and LOCKED?

**A**:
- **CLOSED**: Period closed, can be re-opened
- **LOCKED**: Permanently closed, cannot be re-opened under any circumstances

Lock periods after external audit or sufficient time passed (e.g., 3 months).

---

### Q7: How do I know if opening balance is correct?

**A**: Opening balance for period N should equal closing balance from period N-1.

**Verification**:
```
January Closing: $458,762.50
February Opening: $458,762.50 ✅ (matches)
```

If mismatch found, contact system administrator immediately.

---

### Q8: What happens to draft transactions after close?

**A**: Draft transactions remain in system but cannot be posted to closed period.

**Options**:
- Delete drafts if incorrect
- Edit transaction date to current open period
- Request period re-open if draft is critical

---

### Q9: Can two periods be open simultaneously?

**A**: Yes, system allows multiple open periods for flexibility. However, must close prior period before closing current.

**Example**: January (OPEN) and February (OPEN) is allowed, but must close January before closing February.

---

### Q10: Who receives notifications when period closes?

**A**: Configurable notification list typically includes:
- Finance team (period closed, reports ready)
- Operations team (no more transactions for period)
- Management (summary statistics)
- Audit team (period ready for review)

Configure in `System Administration > Notifications > Period Close`

## Getting Help

### Support Contacts

**For Technical Issues**:
- IT Support: itsupport@company.com
- Phone: ext. 1234
- Help Desk: helpdesk.company.com

**For Process Questions**:
- Finance Manager: Jane Smith, jane.smith@company.com
- Controller: John Doe, john.doe@company.com

**For System Training**:
- Training Coordinator: training@company.com
- Online Tutorials: https://training.carmen-erp.com

### Additional Resources

**Documentation**:
- [SM-period-management.md](./SM-period-management.md) - Technical specification
- [SM-period-end-snapshots.md](./SM-period-end-snapshots.md) - Snapshot details
- [API-lot-based-costing.md](./API-lot-based-costing.md) - API reference

**Training Videos**:
- Period Close Process (15 min)
- Troubleshooting Common Issues (10 min)
- Period Re-Opening (8 min)

**Job Aids**:
- Pre-Close Checklist (printable PDF)
- Quick Reference Guide (1-page)
- Error Code Reference

---

**Version**: 1.0.0
**Last Updated**: 2025-11-03
**Status**: Active
**Maintained By**: Finance Team
**Review Cycle**: Quarterly

---

## Document Revision Notes

**Version 1.0.0** (2025-11-03):
- Initial creation of period-end close user guide
- Comprehensive step-by-step walkthrough with UI descriptions
- Pre-close checklist with validation steps
- Troubleshooting guide for common issues
- Period re-opening process
- Best practices for monthly close routine
- FAQ section addressing common user questions
- Support contacts and additional resources

</div>
