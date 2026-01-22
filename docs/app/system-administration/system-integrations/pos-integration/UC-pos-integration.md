# Use Cases: POS Integration

## Module Information
- **Module**: System Administration > System Integrations
- **Sub-Module**: POS Integration
- **Route**: `/system-administration/system-integration/pos`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-18

---

## UC-POS-001: Monitor Dashboard

**Actor**: F&B Manager
**Preconditions**: User has POS Integration access

**Main Flow**:
1. Navigate to POS Integration dashboard
2. View system status banner (connected/disconnected/error)
3. Review alert cards (unmapped, pending, failed, variants)
4. Check transaction statistics for period
5. Review recent activity feed
6. View sync schedule

**Alternative Flows**:
- **A1**: Click alert card to navigate to relevant tab
- **A2**: Click "Sync Now" to trigger manual sync

**Postconditions**: Dashboard displays current metrics

---

## UC-POS-002: Create Recipe Mapping

**Actor**: Purchasing Manager
**Preconditions**: Unmapped POS items exist

**Main Flow**:
1. Navigate to Mapping tab > Recipe Mapping sub-tab
2. View unmapped items alert section
3. Click unmapped item badge to open mapping dialog
4. Select POS outlet
5. Select recipe from search
6. Configure portion size and unit
7. Set price at outlet (optional, uses default if blank)
8. Click "Create Mapping"

**Alternative Flows**:
- **A1**: Sync POS items before mapping to get latest menu

**Exception Flows**:
- **E1**: No mapped outlets available - must map locations first

**Postconditions**: POS item mapped to recipe for selected outlet

---

## UC-POS-003: Edit Recipe Mapping

**Actor**: Purchasing Manager
**Preconditions**: Mapping exists

**Main Flow**:
1. Find mapping in table
2. Click more menu > Edit Mapping
3. Update outlet, recipe, portion, or price
4. Click "Save Changes"

**Alternative Flows**:
- **A1**: Verify mapping - updates lastVerifiedAt timestamp
- **A2**: Deactivate mapping - sets isActive to false
- **A3**: Delete mapping - removes permanently

**Postconditions**: Mapping updated

---

## UC-POS-004: Map Location to POS Outlet

**Actor**: IT Administrator
**Preconditions**: Carmen locations configured

**Main Flow**:
1. Navigate to Mapping tab > Location Mapping sub-tab
2. Find location in table
3. Click more menu > Map to Outlet
4. Select POS outlet from dropdown
5. Click "Create Mapping"

**Alternative Flows**:
- **A1**: Change existing mapping
- **A2**: Remove mapping

**Postconditions**: Location linked to POS outlet

---

## UC-POS-005: Configure Fractional Variant

**Actor**: Head Chef
**Preconditions**: Base recipe exists

**Main Flow**:
1. Navigate to Mapping tab > Fractional Variants sub-tab
2. Click "Add Variant"
3. Select base recipe
4. Set total yield and unit
5. Select rounding rule
6. Click "Create Variant"
7. Click "Add Variant" button on variant card
8. Enter POS item details, fractional unit, deduction %
9. Click "Add Variant Item"

**Alternative Flows**:
- **A1**: Edit existing variant configuration
- **A2**: Add additional variant items to existing variant

**Postconditions**: Fractional variant configured for recipe

---

## UC-POS-006: Approve Transaction

**Actor**: F&B Manager
**Preconditions**: Pending transactions exist

**Main Flow**:
1. Navigate to Transactions tab
2. View Approval Queue section
3. Click approve icon on transaction
4. Review inventory impact warnings
5. Add approval notes (optional)
6. Click "Approve & Process"

**Alternative Flows**:
- **A1**: Bulk approve - select multiple, click "Approve Selected"
- **A2**: View details before approving

**Postconditions**: Transaction processed, inventory deducted

---

## UC-POS-007: Reject Transaction

**Actor**: F&B Manager
**Preconditions**: Pending transaction exists

**Main Flow**:
1. Navigate to Transactions tab
2. Find transaction in Approval Queue
3. Click reject icon
4. Enter rejection reason (required)
5. Click "Reject Transaction"

**Postconditions**: Transaction rejected, no inventory impact

---

## UC-POS-008: Retry Failed Transaction

**Actor**: F&B Manager
**Preconditions**: Failed transaction exists

**Main Flow**:
1. Navigate to Transactions tab
2. Filter by "Failed" status
3. Find failed transaction
4. Click more menu > Retry
5. System reprocesses transaction

**Postconditions**: Transaction reprocessed

---

## UC-POS-009: View Transaction Details

**Actor**: F&B Manager
**Preconditions**: Transaction exists

**Main Flow**:
1. Navigate to Transactions tab
2. Click row to expand line items
3. View POS items with mapped recipes
4. If failed, view error details

**Alternative Flows**:
- **A1**: Click more menu > View Details for full dialog

**Postconditions**: Transaction details displayed

---

## UC-POS-010: Configure POS Settings

**Actor**: IT Administrator
**Preconditions**: Admin access

**Main Flow**:
1. Navigate to Configuration tab
2. Select POS system type
3. Enter API endpoint
4. Click "Test Connection"
5. Enable/disable automatic sync
6. Set sync frequency
7. Choose processing mode
8. Configure auto-approve threshold (if approval mode)
9. Enable email notifications
10. Add notification recipients
11. Set data retention period
12. Click "Save Changes"

**Alternative Flows**:
- **A1**: Reset to defaults (requires confirmation)
- **A2**: Cancel changes

**Postconditions**: Configuration saved

---

## UC-POS-011: View Gross Profit Report

**Actor**: Financial Controller
**Preconditions**: Processed transactions exist

**Main Flow**:
1. Navigate to Reports tab
2. Select "Gross Profit Analysis" sub-tab
3. Select period filter
4. Review summary cards (revenue, COGS, profit, margin)
5. Review category breakdown table
6. Click "Export" for Excel download

**Postconditions**: Report displayed/exported

---

## UC-POS-012: Analyze Consumption Variance

**Actor**: Head Chef
**Preconditions**: Transaction and inventory data exists

**Main Flow**:
1. Navigate to Reports tab
2. Select "Consumption Analysis" sub-tab
3. Review theoretical vs actual usage
4. Identify high-variance ingredients
5. Review variance cost impact
6. Click "Variance Report" sub-tab
7. Review top variance items
8. Review recommendations

**Postconditions**: Variance insights obtained

---

## UC-POS-013: Export Report

**Actor**: Financial Controller
**Preconditions**: Report data available

**Main Flow**:
1. Navigate to Reports tab
2. Select report type
3. Click "Export" button
4. Select format (CSV/PDF/Excel)
5. File downloads

**Postconditions**: Report exported

---

**Document End**
