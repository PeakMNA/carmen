# Business Requirements: User Management

## Document Information
- **Module**: System Administration / User Management
- **Version**: 1.0
- **Last Updated**: 2026-01-16
- **Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Overview

The User Management module enables system administrators to create, configure, and manage user accounts across the Carmen ERP system. It provides comprehensive user lifecycle management including registration, role assignment, department allocation, and permission configuration.

## Business Goals

1. **Centralized User Administration**: Single point of control for all user account management
2. **Role-Based Access Control**: Enforce security through systematic role and permission assignment
3. **Multi-Department Support**: Enable users to operate across multiple departments and locations
4. **Audit Compliance**: Maintain detailed records of user activities and permission changes
5. **Operational Efficiency**: Streamline user provisioning and de-provisioning processes

## Functional Requirements

### FR-USR-001: User Profile Management
**Priority**: High
**User Story**: As a System Administrator, I want to create and manage user profiles so that employees can access the Carmen ERP system with appropriate credentials.

**Requirements**:
- Create new user with firstname, middlename, lastname, email, bio
- Assign unique user ID (UUID)
- Set account status (active, inactive, suspended, pending)
- Configure invitation status (pending, accepted, rejected)
- Track user metadata (created_at, created_by, updated_at, updated_by)

**Acceptance Criteria**:
- Email must be unique across all users
- User profile can store JSON bio data for extended attributes
- System validates email format before creation
- User cannot be deleted if they have active transactions
- Audit trail captures all profile modifications

### FR-USR-002: Department Assignment
**Priority**: High
**User Story**: As a System Administrator, I want to assign users to one or more departments so that they can access department-specific resources and workflows.

**Requirements**:
- Assign user to multiple departments via `tb_department_user`
- Designate Head of Department (HOD) status per department
- Support department-scoped permissions
- Track assignment audit trail (created_at, created_by, etc.)

**Acceptance Criteria**:
- User can belong to multiple departments simultaneously
- Only one HOD can be designated per user per department
- Department assignment requires valid department ID
- Cannot remove department assignment if user has pending workflows in that department
- Department changes are logged with timestamp and actor

---

### FR-USR-003: Location Assignment
**Priority**: Medium
**User Story**: As a System Administrator, I want to assign users to specific locations so that they can only access inventory and operations at authorized sites.

**Requirements**:
- Assign user to multiple locations via `tb_user_location`
- Support location-based data filtering
- Enable location switching for multi-location users
- Track location assignments with audit fields

**Acceptance Criteria**:
- User can access data only from assigned locations
- Location assignment is validated against active locations
- Users can be assigned to inventory, direct, or consignment location types
- System prevents access to non-assigned locations
- Location changes are immediately effective

---

### FR-USR-004: Role Assignment & Permissions
**Priority**: Critical
**User Story**: As a System Administrator, I want to assign roles to users so that they receive appropriate system permissions based on their job responsibilities.

**Requirements**:
- Assign multiple roles to a single user
- Designate one primary role per user
- Support role-based approval limits
- Configure clearance levels (basic, confidential, restricted, etc.)
- Define effective date ranges for role assignments

**Acceptance Criteria**:
- User inherits all permissions from assigned roles
- Primary role determines default landing page and primary workflows
- Approval limits are enforced across all approval workflows
- Clearance level restricts access to sensitive data
- Role changes require appropriate authorization level
- System prevents role assignment conflicts

---

### FR-USR-005: Bulk User Operations
**Priority**: Medium
**User Story**: As a System Administrator, I want to perform bulk operations on multiple users so that I can efficiently manage large user groups.

**Requirements**:
- Bulk role assignment for multiple users
- Bulk status change (activate, deactivate, suspend)
- Bulk department assignment
- Bulk location assignment
- Bulk deletion with confirmation

**Acceptance Criteria**:
- Can select multiple users via checkboxes
- Bulk actions respect individual user validation rules
- Partial success handling (some users updated, some failed)
- Detailed results showing success/failure per user
- Rollback capability for failed bulk operations
- Audit log records each individual user change

---

### FR-USR-006: User Invitation System
**Priority**: Medium
**User Story**: As a System Administrator, I want to invite new users via email so that they can set up their own accounts securely.

**Requirements**:
- Generate secure invitation token
- Send invitation email with registration link
- Set invitation expiry (default: 7 days)
- Track invitation status (pending, accepted, expired, rejected)
- Resend invitation capability

**Acceptance Criteria**:
- Invitation email contains unique, time-limited link
- Expired invitations cannot be accepted
- Invitation can be revoked before acceptance
- User account created only upon invitation acceptance
- Invitation history maintained in audit log

---

### FR-USR-007: User Search & Filtering
**Priority**: Medium
**User Story**: As a System Administrator, I want to search and filter users by various criteria so that I can quickly find specific users or user groups.

**Requirements**:
- Search by name, email, department, role
- Filter by account status, HOD status, business unit
- Filter by location, clearance level
- Quick filters for common scenarios
- Advanced filter builder for complex queries

**Acceptance Criteria**:
- Search returns results in real-time
- Multiple filters can be combined (AND logic)
- Filter state persists during session
- Search works across all user fields
- Results update immediately when filters change

---

### FR-USR-008: User Import/Export
**Priority**: Low
**User Story**: As a System Administrator, I want to import and export user data in CSV format so that I can bulk load users or backup user information.

**Requirements**:
- Export users to CSV with all fields
- Import users from CSV template
- Validate CSV data before import
- Preview import results before committing
- Handle duplicate detection during import

**Acceptance Criteria**:
- Export includes all visible columns
- Import template matches export format
- Invalid rows are rejected with clear error messages
- Import provides success/failure summary
- Duplicate emails are rejected during import

---

### FR-USR-009: Approval Limit Configuration
**Priority**: High
**User Story**: As a Financial Controller, I want to set approval limits for users so that purchase requests and other documents route correctly based on transaction value.

**Requirements**:
- Configure approval amount per user
- Set currency for approval limit
- Support multi-currency approval limits
- Link approval limit to role-based limits
- Override role limits with user-specific limits

**Acceptance Criteria**:
- Approval limit is validated against numeric constraints
- Currency must be active and valid
- User-specific limits override role defaults
- Approval workflows respect configured limits
- Limit changes are logged with justification

---

### FR-USR-010: Special Permissions & Delegated Authorities
**Priority**: Medium
**User Story**: As a System Administrator, I want to grant special permissions and delegated authorities to users so that they can perform tasks beyond their standard role.

**Requirements**:
- Assign special permissions (emergency-access, cross-department-access)
- Configure delegated authorities (purchase-request-approval, user-management)
- Set time-bound special permissions
- Track special permission usage
- Require justification for special permission grants

**Acceptance Criteria**:
- Special permissions are additive to role permissions
- Time-bound permissions auto-expire at specified date
- Permission usage is logged for audit
- Special permissions can be revoked immediately
- System alerts on unusual permission usage patterns

---

### FR-USR-011: View Modes & User Interface
**Priority**: Low
**User Story**: As a System Administrator, I want to switch between table and card view modes so that I can visualize user data in the format that best suits my task.

**Requirements**:
- Table view for detailed, sortable data grid
- Card view for visual, summary-oriented display
- Persistent view mode preference per user
- Consistent functionality across both views

**Acceptance Criteria**:
- View mode toggle is easily accessible
- Both views support all core operations (view, edit, delete)
- User's last selected view mode is remembered
- Card view displays key user information prominently
- Table view supports column sorting and resizing

---

## Non-Functional Requirements

### Performance
- User list loads within 2 seconds for up to 10,000 users
- Search results return within 500ms
- Bulk operations complete within 30 seconds for up to 100 users
- System supports 500 concurrent user management sessions

### Security
- All password resets require email verification
- Failed login attempts trigger account lockout after 5 tries
- Sensitive user data encrypted at rest
- All user modifications logged for audit
- Role changes require dual authorization for critical roles

### Usability
- User creation wizard completes in maximum 3 steps
- Form validation provides real-time feedback
- Error messages are clear and actionable
- Mobile-responsive interface for user viewing

### Data Integrity
- Email uniqueness enforced at database level
- Foreign key constraints prevent orphaned records
- Soft delete preserves audit trail
- User IDs are immutable UUIDs

## Business Rules

### BR-001: Unique Email Requirement
Each user must have a unique email address across the entire system. Email serves as the primary identifier for authentication.

### BR-002: HOD Designation
A user can be designated as Head of Department (HOD) for one or more departments. HOD status grants automatic approval authority within that department.

### BR-003: Primary Role Requirement
Every user must have exactly one primary role. The primary role determines default permissions and primary workflow assignments.

### BR-004: Approval Limit Hierarchy
User-specific approval limits override role-based limits. If no user-specific limit is set, the primary role's limit applies.

### BR-005: Location-Based Access Control
Users can only view and manipulate data from their assigned locations. Multi-location access requires explicit location assignment.

### BR-006: Active Department Requirement
Users can only be assigned to active departments. Inactive department assignments are automatically suspended.

### BR-007: Invitation Expiry
User invitations expire after 7 days. Expired invitations must be resent to allow user registration.

### BR-008: Clearance Level Enforcement
Users cannot access resources with higher clearance requirements than their assigned clearance level.

## Dependencies

### Internal Dependencies
- **Permission Management Module**: Provides role and policy definitions
- **Department Management**: Provides valid department data
- **Location Management**: Provides valid location data
- **Workflow Module**: Consumes user role and approval limit data

### External Dependencies
- **Email Service**: For user invitations and notifications
- **Authentication Provider**: For user login and password management
- **Audit Service**: For logging user management activities

## Success Metrics

1. **User Provisioning Time**: Average time to create and activate a new user < 5 minutes
2. **Bulk Operation Success Rate**: >95% of bulk operations complete successfully
3. **Search Performance**: 95th percentile search response time < 500ms
4. **Audit Compliance**: 100% of user changes logged with complete audit trail
5. **User Adoption**: >90% of administrators use new user management interface within 3 months

## Future Enhancements

1. **Single Sign-On (SSO)** integration with third-party identity providers
2. **Self-Service Portal** for users to manage their own profile data
3. **Advanced Analytics** dashboard for user access patterns and permission usage
4. **Automated User Lifecycle Management** based on HR system integration
5. **Multi-Factor Authentication (MFA)** configuration per user
6. **Temporary Access Grants** with automatic expiration
7. **User Groups** for simplified bulk permission management
