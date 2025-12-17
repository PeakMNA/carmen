# Hospitality Personas Update Summary

## Document Information
- **Update Type**: User Story and Persona Standardization
- **Scope**: Purchase Requests and Purchase Orders BR documents
- **Template Source**: Goods Receipt Notes BR (reference format)
- **Version**: 1.3.0
- **Date**: 2025-10-31
- **Last Updated**: 2025-10-31

---

## Updates Required

### 1. Stakeholder Section Updates

**Current (Generic)**:
- Primary Users: Department Managers, Requestors, Procurement Staff
- Approvers: Department Heads, Finance Team, Budget Controllers

**Updated (Hospitality-Specific)**:

#### Primary Users
1. **Requestor / Department Staff**: Assigned department staff who can create purchase requests
   - F&B staff, housekeeping staff, maintenance staff, front office staff
   - Create PRs for their assigned locations
   - Access limited to assigned locations only
   - Submit requests for approval
   - Monitor own request status

2. **Head Of Department / Department Manager**: Department-level approval authority
   - F&B Manager, Housekeeping Manager, Maintenance/Engineering Manager, Front Office Manager
   - Approve purchase requests from requestors in their department
   - Department-wide visibility of all PRs within department
   - Monitor department spending and budget utilization
   - Review and approve department PRs
   - Escalate high-value requests to higher authority

3. **Executive Chef / Head Chef**:
   - Create PRs for kitchen/F&B supplies
   - Approve kitchen purchases
   - Recipe-based purchasing

4. **Chief Engineer / Maintenance Manager**:
   - Create PRs for equipment, parts, supplies
   - Emergency/urgent purchase requests
   - Maintenance contract management

5. **Purchasing Staff / Buyer**:
   - Convert approved PRs to POs
   - Vendor sourcing and selection
   - Price negotiation

6. **Purchasing Manager / Chief Buyer**:
   - Approve high-value purchases
   - Vendor strategy
   - Contract management

#### Secondary Users
1. **General Manager / Hotel Manager**: Approve high-value requests, strategic purchases
2. **Financial Manager / Controller**: Budget approval, financial controls
3. **Cost Controller**: Cost analysis, budget monitoring, variance reporting, cost optimization
4. **Accounts Payable**: Invoice matching, payment processing
5. **Receiving Staff**: View PRs for expected deliveries
6. **Storekeeper**: View PRs for inventory planning
7. **IT Manager / Property Application Administrator**: System configuration, user management, system maintenance, data integrity

---

### 2. User Story Format Updates

**Before (PR-001)**:
```markdown
### FR-PR-001: Purchase Request Creation
**Priority**: Critical

Users must be able to create purchase requests with the following capabilities:
- Auto-generated unique reference numbers
- PR type selection (General/Market List/Asset)
```

**After (Hospitality Format)**:
```markdown
### FR-PR-001: Purchase Request Creation
**Priority**: High
**User Story**: As a department manager, I want to create purchase requests for my department so that I can procure necessary supplies while maintaining budget control and approval compliance.

**Requirements**:
- Create new purchase request with auto-generated unique reference number (format: PR-YYMM-NNNN)
- Select PR type:
  * Market List (recurring food/beverage purchases)
  * Standard Order (general operational supplies)
  * Fixed Asset (equipment and capital purchases)
- Auto-populate requestor information from logged-in user profile:
  * Name
  * Department
  * Email
  * Phone
- Select delivery location from pre-configured hotel locations:
  * Main Kitchen
  * Pastry Kitchen
  * Banquet Kitchen
  * Main Store
  * Housekeeping Store
  * Engineering Workshop
  * Front Office
- Specify expected delivery date (calendar picker)
- Enter description and justification
- Attach supporting documents (quotes, specifications)
- Save as draft or submit for approval

**Acceptance Criteria**:
- PR number auto-generates in format PR-YYMM-NNNN
- Cannot submit without required fields (PR type, delivery location, at least one item)
- Draft PRs can be saved and edited later
- Requestor information pre-fills from user profile
- Department defaults to user's assigned department
- Delivery date cannot be in the past
- Can attach up to 10 documents (max 5MB each)
- Submit button triggers validation before submission
```

---

### 3. Specific Updates Needed

#### Purchase Requests BR Updates

**FR-PR-001: Purchase Request Creation**
- Add user story: "As a department manager..."
- Update requirements with hospitality-specific details (kitchen locations, operational departments)
- Expand acceptance criteria with specific validation rules

**FR-PR-002: Item Management**
- Add user story: "As a purchasing staff member..." or "As a head chef..."
- Add hospitality-specific categories (F&B Dry Goods, F&B Fresh Produce, Housekeeping Linens, etc.)
- Include recipe-based ordering mention for F&B

**FR-PR-003: Financial Calculations**
- Add user story: "As a financial manager..."
- Keep technical requirements but frame from user perspective

**FR-PR-004: Budget Control**
- Add user story: "As a general manager..." or "As a financial controller..."
- Reference hotel budget structure (department budgets, cost centers)

**FR-PR-005: Approval Workflow**
- Add user story: "As a department manager..."
- Update approval levels for hotel context (Department Manager → F&B Manager → General Manager)
- Reference hotel-specific thresholds

**FR-PR-009: List View and Filtering**
- Add user story: "As a purchasing manager..."
- Keep the good format with Create button, no Refresh/Modify buttons
- Add quick filters relevant to hotels (My Department, Urgent, This Week's Market List)

#### Purchase Orders BR Updates

Similar updates needed for all PO functional requirements:

**FR-PO-001: PO List View**
- Add user story: "As a purchasing staff member..."
- Hospitality-specific filters (F&B vendors, housekeeping suppliers)

**FR-PO-002: Create PO from PR**
- Add user story: "As a purchasing buyer..."
- Reference hotel purchasing workflow

**FR-PO-003: Vendor Selection**
- Add user story: "As a purchasing manager..."
- Hotel-specific vendor categories (F&B distributors, linen suppliers, equipment vendors)

And so on for all FR-PO-* requirements...

---

## Hospitality-Specific Terminology

### Use These Terms:
- Hotel operations (not generic "company")
- F&B supplies, food & beverage (not just "products")
- Housekeeping linens and amenities (not "supplies")
- Guest room supplies (not "room items")
- Engineering/maintenance parts (not "equipment")
- Main kitchen, banquet kitchen, pastry kitchen (not "production area")
- Front office supplies (not "admin supplies")
- Operating equipment (not "assets")

### Department Names:
- Food & Beverage (F&B)
- Housekeeping
- Engineering/Maintenance
- Front Office
- Sales & Marketing
- Human Resources
- Finance/Accounting
- Security

### Location Types:
- Main Kitchen, Pastry Kitchen, Banquet Kitchen
- Main Store, Dry Store, Cold Store
- Housekeeping Department
- Engineering Workshop
- Laundry
- Front Desk
- Back Office

---

## Implementation Plan

### Step 1: Update Purchase Requests BR
1. Update Stakeholders section with hospitality personas
2. Add user story to each FR-PR-* requirement
3. Update requirements with hospitality context
4. Enhance acceptance criteria with specific validation rules
5. Update examples with hotel-specific scenarios

### Step 2: Update Purchase Orders BR
1. Update Stakeholders section (same as PR)
2. Add user story to each FR-PO-* requirement
3. Update vendor management with hospitality vendors
4. Update approval workflows for hotel context
5. Add receiving integration references

### Step 3: Quality Check
- [ ] All functional requirements have user stories
- [ ] User stories follow "As a [persona], I want [goal] so that [benefit]" format
- [ ] Personas are hospitality-specific roles
- [ ] Requirements include hotel-specific details
- [ ] Acceptance criteria are testable and specific
- [ ] Examples use hotel scenarios
- [ ] Terminology is hospitality-focused

---

## Examples of Good vs Updated Format

### Example 1: Budget Control

**Before**:
```
### FR-PR-004: Budget Control
**Priority**: Critical

System must enforce budget control and validation:
- Check budget availability before submission
- Display budget information: total, committed, available
```

**After**:
```
### FR-PR-004: Budget Control and Validation
**Priority**: High
**User Story**: As a financial controller, I want purchase requests to validate against department budgets in real-time so that I can prevent overspending and maintain fiscal responsibility across hotel operations.

**Requirements**:
- Real-time budget validation when:
  * User enters items on purchase request
  * User changes quantities or prices
  * User submits PR for approval
- Budget check integration:
  * Query finance system for available budget
  * Check against department budget allocation
  * Check against cost center (if specified)
  * Apply budget tolerance rules (5% over allowed with GM approval)
- Display budget information panel:
  * Department budget account name and code
  * Total annual budget allocation
  * Year-to-date actual spending
  * Committed amounts (approved PRs not yet received)
  * Available balance
  * This PR amount
  * Remaining after this PR
  * Budget utilization percentage with visual indicator (green <80%, yellow 80-95%, red >95%)
- Budget validation results:
  * Sufficient budget: Allow submission
  * Insufficient budget: Block submission with clear error showing available amount
  * Over tolerance: Block submission, require GM override approval
  * Multiple budget accounts: Can split PR across budgets with percentage allocation

**Acceptance Criteria**:
- Budget check completes in <2 seconds
- Budget information displays with current real-time data
- Cannot submit PR if insufficient budget (clear error message with specific amounts)
- Budget panel shows all required information accurately
- Visual indicators (colors) display correctly based on utilization
- Over-tolerance triggers GM approval workflow
- Budget service unavailable allows PR with warning and manual review flag
- Splitting across budgets sums to 100% of PR total
```

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-10-31 | System | Initial summary for BR updates |
| 1.1.0 | 2025-10-31 | Claude Code | Added Requestor and Head Of Department personas |
| 1.2.0 | 2025-10-31 | Claude Code | Clarified Requestor as Department Staff, Head Of Department as Department Manager |
| 1.3.0 | 2025-10-31 | Claude Code | Added IT Manager / Property Application Administrator and Cost Controller personas |
