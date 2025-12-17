# Carmen ERP System - Documentation Structure

**Version**: 2.0.0
**Last Updated**: 2025-10-30
**Owner**: Documentation Team

---

## Purpose

This document defines the unified structure and standards for all Carmen ERP system documentation. Following this structure ensures consistency, maintainability, and ease of navigation across all documentation.

## Major Changes in Version 2.0

### New Centralized Structure
All sub-module documentation is now **centralized** in a single directory per sub-module under `docs/app/{module}/{sub-module}/`. This replaces the previous scattered structure across multiple directories (business-requirements/, use-cases/, technical-specifications/).

### Benefits
- ✅ All related documentation in one place
- ✅ Simple relative path cross-references
- ✅ Easier to copy/template new sub-modules
- ✅ Clear ownership per sub-module
- ✅ Better navigation and discoverability

---

## Documentation Hierarchy

```
docs/
├── DOCUMENTATION-STRUCTURE.md          # This file
├── README.md                           # Documentation index
│
├── app/                                # NEW: Centralized sub-module docs
│   ├── README.md                       # Structure guide
│   │
│   ├── template-module/                # Templates for new modules
│   │   └── template-sub-module/
│   │       ├── README.md               # Template usage guide
│   │       ├── BR-template.md          # Business Requirements
│   │       ├── UC-template.md          # Use Cases
│   │       ├── TS-template.md          # Technical Specifications
│   │       ├── DS-template.md          # Data Schema
│   │       ├── FD-template.md          # Flow Diagrams
│   │       └── VAL-template.md         # Validations
│   │
│   ├── procurement/                    # Procurement module
│   │   ├── purchase-requests/
│   │   │   ├── BR-purchase-requests.md
│   │   │   ├── UC-purchase-requests.md
│   │   │   ├── TS-purchase-requests.md
│   │   │   ├── DS-purchase-requests.md
│   │   │   ├── FD-purchase-requests.md
│   │   │   └── VAL-purchase-requests.md
│   │   ├── purchase-orders/
│   │   ├── goods-receipt-notes/
│   │   └── ...
│   │
│   ├── inventory-management/
│   │   ├── stock-management/
│   │   ├── stock-adjustments/
│   │   └── ...
│   │
│   ├── vendor-management/
│   ├── product-management/
│   ├── operational-planning/
│   ├── production/
│   ├── store-operations/
│   ├── reporting-analytics/
│   ├── finance/
│   └── system-administration/
│
├── system-overview/                    # High-level system documentation
│   ├── application-overview.md
│   ├── system-architecture.md
│   ├── system-modules.md
│   ├── datadict.md
│   └── page-map.md
│
├── design/                             # Design and UX documentation
│   ├── README.md
│   ├── design-system.md
│   ├── component-library.md
│   ├── list-screen-spec.md
│   ├── detail-crud-spec.md
│   └── report-page-spec.md
│
├── user-guides/                        # End-user documentation
│   ├── README.md
│   └── {module-name}/
│
├── developer-guides/                   # Developer documentation
│   ├── README.md
│   ├── getting-started.md
│   ├── code-standards.md
│   ├── testing-guide.md
│   └── deployment-guide.md
│
├── testing/                            # Testing documentation
│   ├── README.md
│   ├── test-strategy.md
│   └── e2e-scenarios.md
│
├── business-requirements/              # LEGACY: Old structure (deprecated)
├── use-cases/                          # LEGACY: Old structure (deprecated)
├── technical-specifications/           # LEGACY: Old structure (deprecated)
│
└── archive/                            # Archived/deprecated docs
    └── {year}/
```

---

## Document Types

Each sub-module contains **six core documents** that work together:

### 1. BR - Business Requirements
**Purpose**: Define WHAT the system should do from a business perspective

**Audience**: Business stakeholders, product owners, developers

**Naming**: `BR-{sub-module-name}.md`

**Location**: `docs/app/{module}/{sub-module}/`

**Structure**:
- Module Information (metadata)
- Overview
- Business Objectives
- Key Stakeholders
- Functional Requirements (FR-{CODE}-###)
- Business Rules (BR-{CODE}-###)
- **Conceptual Data Model** (using TypeScript interfaces as documentation, NOT code)
- Integration Points
- Non-Functional Requirements (NFR-{CODE}-###)
- Success Metrics
- Dependencies
- Assumptions and Constraints
- Future Enhancements
- Approval Section

**Key Principle**: Text-based requirements. TypeScript interfaces shown are **conceptual models** for communication, not implementation code.

**Example**: `BR-purchase-requests.md`

---

### 2. UC - Use Cases
**Purpose**: Describe HOW users and systems interact with features

**Audience**: Business analysts, UX designers, QA testers, developers

**Naming**: `UC-{sub-module-name}.md`

**Location**: `docs/app/{module}/{sub-module}/`

**Structure**:
- Module Information (metadata)
- Overview
- Actors (Primary, Secondary, System)
- Use Case Diagram
- Use Case Summary
- User Use Cases (UC-{CODE}-001 to 099)
  - Description, Actors, Priority, Frequency
  - Preconditions, Postconditions
  - Main Flow (Happy Path)
  - Alternative Flows, Exception Flows
  - Business Rules, Related Requirements
- System Use Cases (UC-{CODE}-101 to 199)
  - Automated processes, scheduled jobs
  - Triggers, data contracts, SLA
- Integration Use Cases (UC-{CODE}-201 to 299)
  - External system integrations
- Background Job Use Cases (UC-{CODE}-301 to 399)
- Use Case Traceability Matrix

**Key Principle**: Text-based data structures. No TypeScript implementation code.

**Example**: `UC-purchase-requests.md`

---

### 3. TS - Technical Specifications
**Purpose**: Define HOW to implement the system technically

**Audience**: Developers, architects, technical leads

**Naming**: `TS-{sub-module-name}.md`

**Location**: `docs/app/{module}/{sub-module}/`

**Structure**:
- Module Information (metadata)
- Technical Overview
- Architecture
- Technology Stack
- Component Structure
- Data Flow
- API Contracts (with code examples)
- Database Schema (reference DS document)
- State Management
- Security Implementation
- Error Handling
- Performance Optimization
- Testing Strategy
- Deployment Configuration
- Dependencies
- Technical Debt

**Key Principle**: Implementation guidance WITH code examples. This is the place for HOW-TO code.

**Example**: `TS-purchase-requests.md`

---

### 4. DS - Data Schema
**Purpose**: Define database structure and data organization

**Audience**: Database administrators, backend developers

**Naming**: `DS-{sub-module-name}.md`

**Location**: `docs/app/{module}/{sub-module}/`

**Structure**:
- Module Information (metadata)
- Overview
- Entity Relationship Diagram
- Database Tables
  - Complete SQL DDL
  - Column definitions
  - Indexes and constraints
  - Triggers and procedures
- Relationships (one-to-many, many-to-many)
- Views and Stored Procedures
- Data Types and Custom Types
- Data Integrity Rules
- Indexes Strategy
- Data Migration Scripts
- Data Archival Strategy
- Performance Considerations
- Security (RLS, encryption)
- Backup and Recovery
- Data Quality Rules
- Monitoring and Alerts

**Key Principle**: SQL DDL is appropriate here as it defines structure, not business logic.

**Example**: `DS-purchase-requests.md`

---

### 5. FD - Flow Diagrams
**Purpose**: Visualize processes, data flows, and system interactions

**Audience**: All stakeholders (visual reference)

**Naming**: `FD-{sub-module-name}.md`

**Location**: `docs/app/{module}/{sub-module}/`

**Structure**:
- Module Information (metadata)
- Overview
- Diagram Index
- Process Flow (high-level and detailed)
- Data Flow Diagram (Level 0, 1, 2)
- Sequence Diagram
- State Diagram (status transitions with text-based guards)
- Workflow Diagram (approval workflows)
- System Integration Flow
- Swimlane Diagram
- Decision Trees
- Activity Diagram
- Error Handling Flow
- Diagram Conventions

**Key Principle**: Visual diagrams with text-based descriptions. No implementation code for state guards or business logic.

**Example**: `FD-purchase-requests.md`

---

### 6. VAL - Validations
**Purpose**: Document validation requirements in text format

**Audience**: Developers, QA testers, business analysts

**Naming**: `VAL-{sub-module-name}.md`

**Location**: `docs/app/{module}/{sub-module}/`

**Structure**:
- Module Information (metadata)
- Overview
- Validation Strategy (principles, layers)
- Field-Level Validations (VAL-{CODE}-001 to 099)
  - Text descriptions, not code
  - Validation rules, rationale
  - Implementation requirements (described)
  - Error messages, test cases
- Business Rule Validations (VAL-{CODE}-101 to 199)
- Cross-Field Validations (VAL-{CODE}-201 to 299)
- Security Validations (VAL-{CODE}-301 to 399)
- Validation Matrix
- Error Handling
- Testing Guidelines

**Key Principle**: Text-based validation requirements. Describes WHAT to validate, not HOW to implement.

**Example**: `VAL-purchase-requests.md`

---

## Creating New Sub-Module Documentation

### Quick Start

```bash
# 1. Copy the template directory
cp -r docs/app/template-module/template-sub-module docs/app/{module}/{sub-module}

# Example
cp -r docs/app/template-module/template-sub-module docs/app/procurement/price-comparisons

# 2. Customize files
cd docs/app/procurement/price-comparisons

# 3. Replace placeholders in each file
# - {module} → "procurement"
# - {sub-module} → "price-comparisons"
# - {CODE} → "PC"
# - {Module Name} → "Procurement"
# - {Sub-Module Name} → "Price Comparisons"

# 4. Fill in actual content
# All cross-references will work automatically!
```

### Cross-References

All documents in a sub-module use **relative paths**:

```markdown
**Related Documents**:
- [Business Requirements](./BR-purchase-requests.md)
- [Use Cases](./UC-purchase-requests.md)
- [Technical Specification](./TS-purchase-requests.md)
- [Data Schema](./DS-purchase-requests.md)
- [Flow Diagrams](./FD-purchase-requests.md)
- [Validations](./VAL-purchase-requests.md)
```

No complex navigation needed - everything is in the same directory!

---

## Naming Conventions

### File Names
- Use kebab-case: `purchase-requests`, `stock-management`
- Include document type prefix: `BR-`, `UC-`, `TS-`, `DS-`, `FD-`, `VAL-`
- Full pattern: `{TYPE}-{sub-module-name}.md`
- Examples:
  - `BR-purchase-requests.md`
  - `UC-stock-adjustments.md`
  - `TS-vendor-profiles.md`

### Document IDs and References

**Business Requirements**:
- Format: `BR-{CODE}-{NUMBER}`
- Example: `BR-PR-001`, `BR-INV-015`

**Functional Requirements**:
- Format: `FR-{CODE}-{NUMBER}`
- Example: `FR-PR-001`, `FR-INV-020`

**Business Rules**:
- Format: Same as BR: `BR-{CODE}-{NUMBER}`
- Example: `BR-PR-001`, `BR-INV-005`

**Use Cases**:
- Format: `UC-{CODE}-{NUMBER}`
- Ranges:
  - 001-099: User use cases
  - 101-199: System use cases
  - 201-299: Integration use cases
  - 301-399: Background job use cases
- Example: `UC-PR-001`, `UC-PR-101`, `UC-PR-201`

**Validations**:
- Format: `VAL-{CODE}-{NUMBER}`
- Ranges:
  - 001-099: Field-level validations
  - 101-199: Business rule validations
  - 201-299: Cross-field validations
  - 301-399: Security validations
- Example: `VAL-PR-001`, `VAL-PR-101`, `VAL-PR-201`

### Module Codes

Use consistent 2-4 letter codes for modules:

| Module | Sub-Module | Code |
|--------|------------|------|
| **Procurement** | | PROC |
| | Purchase Requests | PR |
| | Purchase Orders | PO |
| | Goods Received Note | GRN |
| | Credit Notes | CN |
| | Price Comparisons | PC |
| **Inventory Management** | | INV |
| | Stock Management | STK |
| | Physical Count | PHY |
| | Inventory Adjustment | ADJ |
| **Vendor Management** | | VEN |
| | Vendor Profiles | VP |
| | Vendor Certifications | VC |
| **Product Management** | | PRD |
| **Operational Planning** | | OPS |
| | Recipe Management | RCP |
| **Production** | | PROD |
| **Store Operations** | | STO |
| | Store Requisitions | REQ |
| | Wastage Reporting | WST |
| **Finance** | | FIN |
| | Account Code Mapping | ACM |
| | Currency Management | CUR |
| **System Administration** | | SYS |
| | User Management | USR |
| | Workflow | WFL |
| **Reporting & Analytics** | | RPT |

---

## Document Metadata

Every documentation file should start with a metadata header:

```markdown
# {Document Type}: {Sub-Module Name}

## Module Information
- **Module**: {Module Name}
- **Sub-Module**: {Sub-Module Name}
- **Route**: {Application Route}
- **Version**: {Version Number}
- **Last Updated**: {YYYY-MM-DD}
- **Owner**: {Team/Person}
- **Status**: Draft | Review | Approved | Deprecated

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-10-30 | Team | Initial version |
```

---

## Requirements vs Implementation

### Requirements Documents (Text-Based)

**Documents**: BR, UC, FD, VAL

**Purpose**: Define WHAT and WHY

**Characteristics**:
- Written in descriptive text
- Technology-agnostic
- Business-oriented language
- Conceptual data models (TypeScript interfaces for communication only)
- Validation requirements as text descriptions
- State guards described, not coded

**Rule**: No implementation code. Describes requirements for developers to implement.

---

### Technical Documents (Implementation Guidance)

**Documents**: TS, DS

**Purpose**: Define HOW to implement

**Characteristics**:
- Include code examples and schemas
- Technology-specific guidance
- Implementation patterns
- SQL DDL for database structure
- API contract examples
- Error handling code patterns

**Rule**: Code examples ARE appropriate here. Shows developers how to implement.

---

## Content Standards

### Language and Tone
- Use clear, concise language
- Avoid jargon unless necessary (define when used)
- Use active voice: "System validates input" not "Input is validated"
- Use present tense for current functionality
- Use future tense for planned features

### Formatting
- Use ATX-style headers (`# Header`)
- Use consistent list formatting
- Use code blocks with language identifiers (only in TS/DS)
- Use tables for structured data
- Include visual diagrams where helpful (Mermaid preferred)

### Requirements Formatting

```markdown
### FR-PR-001: Create Purchase Request
**Priority**: Critical | High | Medium | Low

Users must be able to create a new purchase request by filling out a form with required information.

**Acceptance Criteria**:
- User can access the create form from the list page
- All required fields must be completed before submission
- System generates unique reference number upon creation
- User receives confirmation after successful creation

**Related Requirements**: BR-PR-001, VAL-PR-001 to VAL-PR-014
```

### Validation Formatting (Text-Based)

```markdown
### VAL-PR-001: Reference Number Format

**Field**: `ref_number`
**Data Type**: VARCHAR(50) / string

**Validation Rule**: Reference number must follow the format PR-YYMM-NNNN where YY is 2-digit year and MM is month and NNNN is a 4-digit sequential number.

**Rationale**: Provides unique identification with year-based organization.

**Implementation Requirements**:
- **Client-Side**: Display as read-only (auto-generated)
- **Server-Side**: Auto-generate using database sequence
- **Database**: UNIQUE constraint on ref_number column

**Error Code**: VAL-PR-001
**Error Message**: "Invalid reference number format. Must be PR-YYMM-NNNN"

**Test Cases**:
- ✅ Valid: PR-2501-0001
- ❌ Invalid: PR-25-001 (year must be 4 digits)
```

---

## Version Control

### Document Versioning
Follow semantic versioning: `MAJOR.MINOR.PATCH`

- **MAJOR**: Significant structural changes
- **MINOR**: New sections or substantial content
- **PATCH**: Minor corrections or clarifications

### Change Log
Maintain document history in each document:

```markdown
## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-01-30 | Team | Initial version |
| 1.1.0 | 2025-02-15 | Team | Added approval workflow |
| 1.1.1 | 2025-02-20 | Team | Fixed validation descriptions |
```

---

## Review and Approval

### Review Process
1. **Draft**: Initial creation
2. **Peer Review**: Technical review by peers
3. **Stakeholder Review**: Review by business stakeholders
4. **Approval**: Final approval by document owner
5. **Published**: Available for use

### Document Status
- **Draft**: Work in progress
- **Review**: Ready for stakeholder review
- **Approved**: Approved and ready for implementation
- **Deprecated**: No longer current

### Approval Section
BR and TS documents should include:

```markdown
## Approval

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Business Owner | | | |
| Technical Lead | | | |
| Product Manager | | | |
```

---

## Maintenance

### Regular Reviews
- **Business Requirements**: Quarterly
- **Technical Specifications**: Bi-annually
- **Use Cases**: When workflows change
- **Data Schema**: On schema changes
- **Flow Diagrams**: When processes change
- **Validations**: When business rules change

### Deprecation Process
1. Mark document status as "Deprecated"
2. Add deprecation notice at top
3. Link to replacement document
4. Move to archive after 1 year

```markdown
> **⚠️ DEPRECATED**: This document is deprecated as of 2025-10-30.
> Please refer to [New Document](../new-module/new-sub-module/BR-new.md) instead.
```

---

## Migration from Old Structure

### Old Structure (Deprecated)
```
docs/business-requirements/{module}/BR-{sub-module}.md
docs/use-cases/{module}/UC-{sub-module}.md
docs/technical-specifications/{module}/TS-{sub-module}.md
docs/technical-specifications/{module}/DS-{sub-module}.md
docs/technical-specifications/{module}/FD-{sub-module}.md
docs/technical-specifications/{module}/VAL-{sub-module}.md
```

### New Structure
```
docs/app/{module}/{sub-module}/
├── BR-{sub-module}.md
├── UC-{sub-module}.md
├── TS-{sub-module}.md
├── DS-{sub-module}.md
├── FD-{sub-module}.md
└── VAL-{sub-module}.md
```

### Migration Steps
1. Create new directory: `docs/app/{module}/{sub-module}/`
2. Copy all 6 documents to new directory
3. Update cross-references to use relative paths (`./filename.md`)
4. Update any missing documents (e.g., create TS if missing)
5. Verify all links work
6. Mark old location as deprecated

---

## Best Practices

### DO
✅ Keep all 6 documents in same sub-module directory
✅ Use relative paths for cross-references
✅ Update documents when features change
✅ Use consistent terminology across all 6 documents
✅ Include examples and diagrams
✅ Follow text-based approach for requirements (BR, UC, VAL, FD)
✅ Use code examples only in technical docs (TS, DS)
✅ Review and update metadata

### DON'T
❌ Duplicate information across documents
❌ Leave outdated information
❌ Use implementation code in requirements documents
❌ Skip metadata headers
❌ Ignore cross-references when creating new docs
❌ Create documents in old structure
❌ Mix document types in same file

---

## Support and Questions

### Getting Help
- **Structure Questions**: See `docs/app/README.md`
- **Template Usage**: See `docs/app/template-module/template-sub-module/README.md`
- **Example Reference**: See `docs/app/procurement/purchase-requests/`
- **Technical Questions**: Development Team Lead
- **Process Questions**: Product Management

### Making Changes to This Structure
1. Create proposal document
2. Discuss with stakeholders
3. Update this guide
4. Update templates
5. Communicate changes to all teams
6. Update example documentation

---

## Appendix: Quick Reference

### Document Checklist for New Sub-Module

- [ ] Create directory: `docs/app/{module}/{sub-module}/`
- [ ] Copy template directory
- [ ] Create BR (Business Requirements)
- [ ] Create UC (Use Cases)
- [ ] Create TS (Technical Specifications)
- [ ] Create DS (Data Schema)
- [ ] Create FD (Flow Diagrams)
- [ ] Create VAL (Validations)
- [ ] Update all metadata
- [ ] Update all cross-references
- [ ] Review with stakeholders
- [ ] Get approval
- [ ] Mark as Approved

### Common Paths

| Task | Path |
|------|------|
| Templates | `docs/app/template-module/template-sub-module/` |
| Example docs | `docs/app/procurement/purchase-requests/` |
| Structure guide | `docs/app/README.md` |
| This document | `docs/DOCUMENTATION-STRUCTURE.md` |

---

**End of Document**

**Version 2.0 Changes**:
- Centralized structure under docs/app/
- All 6 documents per sub-module in same directory
- Relative path cross-references
- Clear separation of requirements vs implementation
- Text-based approach for BR, UC, VAL, FD
- Code examples only in TS, DS
- Simpler navigation and maintenance
