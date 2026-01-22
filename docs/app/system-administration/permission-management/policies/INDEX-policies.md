# Policy Management Module

## Overview

The **Policy Management** module provides comprehensive access control through RBAC (Role-Based Access Control) and ABAC (Attribute-Based Access Control) policies. It enables administrators to define fine-grained permissions that control what users can access and perform within Carmen ERP.

---

## Module Information

| Property | Value |
|----------|-------|
| **Module** | System Administration > Permission Management |
| **Sub-module** | Policy Management |
| **Route** | `/system-administration/permission-management/policies` |
| **Version** | 1.0 |
| **Status** | Active |

---

## Key Features

### Policy Types
- **RBAC Policies**: Role-based access control with simple role assignments
- **ABAC Policies**: Attribute-based control with complex conditions and rules

### Policy Configuration
- Policy name and description
- Priority-based evaluation (higher priority evaluated first)
- Enable/disable individual policies
- Effect types: Permit or Deny

### Policy Builder (ABAC)
- Visual policy editor for complex rules
- Policy tester for validation
- Attribute inspector for condition building
- Real-time policy simulation

### Policy Management
- Create, edit, delete policies
- Filter by type, effect, status
- Search policies by name
- View policy details

---

## Policy Effects

| Effect | Description |
|--------|-------------|
| `permit` | Allow access when conditions are met |
| `deny` | Deny access when conditions are met |

---

## Documentation Index

| Document | Description | Link |
|----------|-------------|------|
| **Business Requirements** | Functional requirements and user stories | [BR-policies.md](./BR-policies.md) |
| **Use Cases** | User interaction scenarios | [UC-policies.md](./UC-policies.md) |
| **Data Dictionary** | Type definitions and data structures | [DD-policies.md](./DD-policies.md) |
| **Technical Specification** | Architecture and implementation | [TS-policies.md](./TS-policies.md) |
| **Flow Diagrams** | Visual process flows | [FD-policies.md](./FD-policies.md) |
| **Validation Rules** | Data validation and business rules | [VAL-policies.md](./VAL-policies.md) |

---

## Quick Start

### Creating a Policy
1. Navigate to **Permission Management > Policies**
2. Click **Create Policy**
3. Enter policy name and description
4. Set priority and effect (permit/deny)
5. Configure target resources and rules
6. Save policy

### Using Policy Builder (ABAC)
1. Navigate to **Policies > Builder**
2. Use Visual Policy Editor to define conditions
3. Add attribute-based rules
4. Test policy with Policy Tester
5. Save and activate

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2026-01-17 | Initial release |
