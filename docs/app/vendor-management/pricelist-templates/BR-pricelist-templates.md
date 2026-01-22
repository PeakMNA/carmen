# Pricelist Templates - Business Requirements (BR)

## Document Information
- **Document Type**: Business Requirements Document
- **Module**: Vendor Management > Pricelist Templates
- **Version**: 3.0.0
- **Last Updated**: 2025-01-15
- **Document Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 3.0.0 | 2025-01-15 | Documentation Team | Synced with current code; Added 3-step wizard creation flow; Updated currency options (BHT, USD, CNY, SGD); Added notification settings and Multi-MOQ features; Updated to use validityPeriod instead of effective date range; Added hierarchical product selection |
| 2.0.0 | 2025-11-25 | Documentation Team | Simplified to core template functionality |
| 1.0 | 2025-11-15 | System | Initial creation |

## 1. Executive Summary

The Pricelist Templates module provides a centralized system for creating, managing, and distributing standardized pricing templates to vendors. Templates ensure consistent pricing data collection, streamline vendor onboarding, and facilitate price comparison across multiple vendors.

### 1.1 Purpose
- Standardize pricing data collection from vendors
- Create reusable templates for different product categories
- Streamline vendor price submission process
- Enable consistent price comparison across vendors
- Support multi-location and multi-currency pricing
- Facilitate bulk price updates and negotiations

### 1.2 Scope
**In Scope**:
- Template creation via 3-step wizard (Basic Info → Product Selection → Settings & Notifications)
- Hierarchical product/item selection (Categories, Subcategories, Item Groups, Specific Items)
- Multi-MOQ pricing structures
- Multi-currency support (BHT, USD, CNY, SGD)
- Template versioning and history
- Template activation/deactivation
- Template cloning and duplication
- Template distribution to vendors
- Notification settings with reminder schedules
- Excel template generation
- Request for Pricing (RfP) campaign creation
- Template usage tracking and analytics

**Out of Scope**:
- Actual price list submissions from vendors (covered in Price Lists module)
- RFQ campaign management (covered in Requests for Pricing module)
- Vendor onboarding (covered in Vendor Directory module)
- Purchase order creation (covered in Procurement module)

---

## 2. Functional Requirements

### FR-PT-001: Template Creation and Management
**Priority**: Critical
**Description**: System shall provide comprehensive template creation and management capabilities via a 3-step wizard.

**Requirements**:
- Create new templates via 3-step wizard:
  - **Step 1 - Basic Information**:
    - Template name (Unique, required)
    - Description (optional)
    - Currency (dropdown: BHT, USD, CNY, SGD)
    - Validity Period (days, default: 90)
    - Vendor Instructions (optional)
  - **Step 2 - Product Selection**:
    - Hierarchical selection (Categories, Subcategories, Item Groups, Specific Items)
    - Multi-select with checkboxes
    - Selection summary with counts
  - **Step 3 - Settings & Notifications**:
    - Allow Multi-MOQ (toggle)
    - Require Lead Time (toggle)
    - Max Items Per Submission
    - Send Reminders (toggle)
    - Reminder Days (14, 7, 3, 1 days before deadline)
    - Escalation Days
- Edit existing templates with inline editing
- Activate/Deactivate templates
- Clone templates for reuse
- Version control for template changes
- Export template to Excel (with customization options)
- Table/Card view toggle for template list

**Business Rules**:
- Template name must be descriptive and unique
- Default currency is BHT
- Default validity period is 90 days

**Acceptance Criteria**:
- User can create template via wizard in < 3 minutes
- Version history preserved for all changes
- Cloning creates independent copy with new name
- All changes logged with user and timestamp

---

### FR-PT-002: Product/Item Assignment
**Priority**: Critical
**Description**: System shall support flexible hierarchical product and item assignment to templates.

**Requirements**:
- Hierarchical product selection via ProductSelectionComponent:
  - Select entire Categories (checkbox)
  - Select specific Subcategories (checkbox)
  - Select Item Groups (checkbox)
  - Select individual Specific Items (checkbox)
- Selection at higher level includes all children
- Search and filter products within each level
- Selection summary with counts per level
- Clear all selections option
- Specify item attributes when needed:
  - Unit of measure (UOM)
  - Minimum order quantity (MOQ)
  - Expected delivery time (Lead time)

**Business Rules**:
- Each template must have at least 1 selection (category, subcategory, item group, or specific item)
- Products can appear in multiple templates
- Hierarchical selection: selecting a category includes all its subcategories, item groups, and items
- Unit of measure must be standardized

**Acceptance Criteria**:
- Hierarchical selection supports 1000+ products
- Search results appear in <1 second
- Selection summary updates in real-time
- Product selection logged in audit trail

---

### FR-PT-003: Template Integration
**Priority**: High
**Description**: System shall integrate templates with other modules seamlessly.

**Requirements**:
- **Vendor Directory Integration**:
  - Link templates to approved vendors
  - Auto-populate vendor contact information
  - Sync vendor categorization for targeting
- **Price Lists Integration**:
  - Templates serve as structure for price submissions
  - Vendor submissions auto-create price lists
  - Link submitted prices to template version
- **RFQ Integration**:
  - Convert RFQ to template for price collection
  - Templates feed into RFQ campaigns
  - RFQ responses create price lists from templates
- **Purchase Request Integration**:
  - Use template pricing for PR creation
  - Suggest vendors based on template participation
- **Reporting Integration**:
  - Template data feeds into spend analytics
  - Price variance reports use template structure

**Business Rules**:
- Template changes do not affect submitted price lists
- Vendor must be approved status to receive templates
- Template effective dates align with fiscal periods
- Integration maintains data consistency across modules

**Acceptance Criteria**:
- Vendor details auto-populate from directory
- Price submissions automatically create price lists
- Template version tracked in all related records
- Cross-module navigation seamless
- Data changes sync within 1 minute

---

## 3. Non-Functional Requirements

### NFR-PT-001: Performance
- Template list page loads in <2 seconds for 1,000 templates
- Template creation/edit saves in <1 second
- Bulk product assignment (100 products) completes in <5 seconds
- Distribution to 100 vendors completes in <30 seconds
- Report generation completes in <10 seconds
- Concurrent user support: 50+ simultaneous users

### NFR-PT-002: Security
- Role-based access control (RBAC)
- Template edit permissions restricted by role
- Sensitive pricing data encrypted at rest
- Audit log for all template changes
- Template distribution tracked with timestamp
- Export permissions controlled

### NFR-PT-003: Reliability
- System uptime: 99.9%
- Data backup: Daily automated backups
- Disaster recovery: <4 hour RTO, <1 hour RPO
- Template version history preserved indefinitely
- No data loss on system failures

### NFR-PT-004: Usability
- Intuitive template builder interface
- Drag-and-drop product assignment
- Inline editing for quick updates
- Template preview before distribution
- Mobile-responsive design for template review
- Context-sensitive help available
- Multi-language support (5+ languages)

### NFR-PT-005: Scalability
- Support 10,000+ templates
- Support 100,000+ product assignments
- Support 1,000+ concurrent distributions
- Handle 10,000+ vendor submissions per template
- Horizontal scaling capability

### NFR-PT-006: Maintainability
- Modular architecture
- RESTful API for integrations
- Comprehensive logging
- Monitoring and alerting
- Automated testing coverage >80%

---

## 4. Data Requirements

### 4.1 Core Data Entities

**Template** (PricelistTemplate):
- Template ID (primary key)
- Template Name (unique)
- Description
- Default Currency (BHT, USD, CNY, SGD)
- Supported Currencies (array)
- Validity Period (days)
- Status (draft, active, inactive)
- Product Selection (hierarchical):
  - Categories (array of IDs)
  - Subcategories (array of IDs)
  - Item Groups (array of IDs)
  - Specific Items (array of IDs)
- Custom Fields (array)
- Instructions (vendor instructions)
- Allow Multi-MOQ (boolean)
- Require Lead Time (boolean)
- Max Items Per Submission (number)
- Notification Settings:
  - Send Reminders (boolean)
  - Reminder Days (array: [14, 7, 3, 1])
  - Escalation Days (number)
- Created By / Date
- Modified By / Date

**Template Item** (PricelistTemplateDetail):
- Item ID (primary key)
- Template ID (foreign key)
- Product ID (foreign key)
- Item Sequence
- Product Name (denormalized)
- Unit of Measure
- Minimum Order Quantity
- Lead Time Days
- Custom Attributes (JSON)

### 4.2 Data Volumes (Estimated)
- Templates: 1,000 - 10,000 records
- Template Items: 50,000 - 500,000 records

### 4.3 Data Retention
- Active templates: Indefinite
- Template versions: Indefinite (for audit)
- Distribution records: 3 years
- Analytics data: 3 years

---

## 5. Business Rules Summary

### BR-PT-001: Template Uniqueness
Template name must be unique across active templates. System prevents duplicate name.

### BR-PT-002: Minimum Items
Each template must have at least one product/item assigned.

### BR-PT-003: Currency Consistency
Template currency must match vendor's default currency or be explicitly overridden.

---

## 6. User Roles and Permissions

### 6.1 Procurement Manager
- Full access to template management
- Create, edit, archive templates
- Assign products to templates
- Distribute templates to vendors
- View analytics and reports

### 6.2 Procurement Staff
- View templates
- Create draft templates (subject to approval)
- Add products to templates
- Track distribution status
- View submission reports

### 6.3 Finance Manager
- View templates
- Review pricing structures
- View pricing analytics
- Export financial reports

### 6.4 Department Manager
- View department-specific templates
- Request new templates
- View submission status for their department
- Access pricing reports for assigned locations

### 6.5 Executive
- View all templates and reports
- Access strategic pricing analytics
- Review vendor performance

### 6.6 System Administrator
- Full system access
- Configure workflows
- Manage user permissions
- System configuration
- Bulk operations

---

## 7. Workflow Specifications

### 7.1 Template Creation Workflow (3-Step Wizard)
1. **Step 1 - Basic Information**:
   - Enter template name (unique, required)
   - Enter description (optional)
   - Select currency (BHT, USD, CNY, SGD)
   - Set validity period (days, default: 90)
   - Enter vendor instructions (optional)
2. **Step 2 - Product Selection**:
   - Select categories (checkbox)
   - Select subcategories (checkbox)
   - Select item groups (checkbox)
   - Select specific items (checkbox)
   - Review selection summary
3. **Step 3 - Settings & Notifications**:
   - Configure Allow Multi-MOQ (toggle)
   - Configure Require Lead Time (toggle)
   - Set Max Items Per Submission
   - Configure Send Reminders (toggle)
   - Select Reminder Days (14, 7, 3, 1)
   - Set Escalation Days
4. **Review**: Preview template before saving
5. **Save**: Template saved as Draft status
6. **Activation**: Change status to Active when ready

### 7.2 Template Update Workflow
1. **Edit Request**: User navigates to template edit page
2. **Inline Editing**: Modify fields with inline editing
3. **Settings Update**: Update notification and template settings
4. **Product Selection**: Modify hierarchical product selection if needed
5. **Save Changes**: Apply changes with version increment
6. **Notification**: Notify affected parties if Active template changed

---

## 8. Integration Requirements

### 8.1 Internal Integrations
- **Vendor Directory**: Vendor selection, contact info, categorization
- **Product Management**: Product catalog, specifications, UOM
- **Price Lists**: Vendor submissions create price lists
- **RFQ Module**: Template integration with RFQ campaigns
- **Reporting**: Template analytics and pricing reports

### 8.2 External Integrations
- **Email Service**: Distribution notifications, reminders
- **Document Storage**: Template exports, attachments
- **ERP Systems**: Product master data sync
- **Vendor Portal**: Template display and submission

### 8.3 API Requirements
- RESTful API for template CRUD operations
- API for template distribution
- Rate limiting: 1000 requests/hour per API key

---

## 9. Success Criteria

### 9.1 Business Metrics
- 80% reduction in time to collect vendor pricing
- 90% template submission completion rate
- 50% reduction in pricing errors/clarifications
- 100% templates use standardized format
- 75% vendor satisfaction with template process

### 9.2 System Metrics
- Template creation time <3 minutes
- Distribution to 100 vendors <30 seconds
- Page load time <2 seconds
- 99.9% system uptime
- Zero data loss incidents

### 9.3 User Adoption
- 90%+ procurement staff using templates
- 80%+ vendors prefer template submission over manual
- <5 support tickets per 100 distributions
- 85%+ user satisfaction score

---

## 10. Constraints and Assumptions

### 10.1 Constraints
- Must integrate with existing product catalog
- Must support existing vendor portal
- Must comply with data protection regulations
- Timeline: 4 months development + 1 month testing

### 10.2 Assumptions
- Vendors have internet access and basic computer literacy
- Product catalog is accurate and up-to-date
- Vendor contact information is current
- Standard pricing structures apply across categories
- Email infrastructure is reliable

---

## 11. Risks and Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Low vendor adoption | High | Medium | Provide training, vendor support, incentives |
| Complex pricing structures | Medium | High | Start with simple structures, iterate |
| Product catalog inconsistencies | High | Medium | Data cleansing before implementation |
| Integration complexity | Medium | Medium | Phased integration approach |
| Performance at scale | High | Low | Load testing, horizontal scaling |
| User resistance to change | Medium | Medium | Change management, training |

---

## Related Documents
- UC-pricelist-templates - Use Cases
- TS-pricelist-templates - Technical Specification
- DS-pricelist-templates - Data Schema
- FD-pricelist-templates - Flow Diagrams
- VAL-pricelist-templates - Validations

---

**End of Business Requirements Document**
