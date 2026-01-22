# Use Cases: Policy Management

## Module Information
- **Module**: System Administration > Permission Management
- **Sub-Module**: Policy Management
- **Route**: `/system-administration/permission-management/policies`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-17

---

## UC-POL-001: View Policy List

**Actor**: IT Administrator

**Main Flow**:
1. Navigate to Permission Management > Policy Management
2. System displays list of policies (RBAC default)
3. View policy name, effect, priority, status
4. Switch between RBAC and ABAC tabs

---

## UC-POL-002: Search and Filter Policies

**Actor**: IT Administrator

**Main Flow**:
1. Click "Filters" button
2. Enter search text (name or description)
3. Select effect filter (all/permit/deny)
4. Select status filter (all/enabled/disabled)
5. Set priority range
6. System filters list in real-time

**Alternative Flow**:
- Load saved preset: Select from dropdown, filters auto-populate

---

## UC-POL-003: Create Simple Policy

**Actor**: IT Administrator

**Main Flow**:
1. Click "Simple Creator" button
2. Navigate to `/policies/simple`
3. Select policy template
4. Configure basic settings
5. Save policy

---

## UC-POL-004: Create Advanced Policy

**Actor**: IT Administrator

**Main Flow**:
1. Click "Advanced Builder" button
2. Navigate to `/policies/builder`
3. Select "Start Building Policy"
4. Configure:
   - Name and description
   - Priority and effect
   - Subject conditions
   - Resource conditions
   - Action conditions
   - Environment conditions
5. Save policy
6. Redirect to policy list

---

## UC-POL-005: Edit Policy

**Actor**: IT Administrator

**Main Flow**:
1. Click Edit on policy row
2. Navigate to builder with `?edit={policyId}`
3. System loads existing policy data
4. Modify settings
5. Save changes
6. Redirect to policy list

---

## UC-POL-006: Clone Policy

**Actor**: IT Administrator

**Main Flow**:
1. Click Clone on policy row
2. Navigate to builder with `?clone={policyId}`
3. System loads policy as new (no ID)
4. Modify name
5. Save as new policy

---

## UC-POL-007: Test Policy

**Actor**: IT Administrator

**Main Flow**:
1. Open Policy Builder
2. Select "Policy Tester" tab
3. Configure test scenario:
   - Subject attributes
   - Resource attributes
   - Action
   - Environment
4. Run test
5. View pass/fail result

---

## UC-POL-008: Toggle Policy Status

**Actor**: IT Administrator

**Main Flow**:
1. Find policy in list
2. Click toggle switch
3. System updates enabled status
4. Disabled policies not enforced

---

## UC-POL-009: View Policy Details

**Actor**: IT Administrator

**Main Flow**:
1. Click View on policy row
2. Navigate to `/policies/{policyId}`
3. View full policy configuration
4. Optional: Click Edit to modify

---

**Document End**
