# Data Definition: Account Code Mapping

## Module Information
- **Module**: Finance
- **Sub-Module**: Account Code Mapping
- **Database**: PostgreSQL (Supabase)
- **Schema Version**: 1.0.0
- **Last Updated**: 2025-11-15
- **Owner**: Finance & Accounting Team
- **Status**: Active

## Document History
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-11-15 | Documentation Team | Migrated from DS to DD format |
| 1.0.0 | 2025-11-12 | Documentation Team | Initial version |

---

## Overview

The Account Code Mapping data model provides the foundation for automated financial posting, multi-dimensional accounting, and period-based financial management in the Carmen ERP system. The schema design emphasizes financial data integrity through immutable journal entries, auditability through complete change history, and performance through materialized views for balance calculations.

The data model consists of nine core entities: chart_of_accounts for COA configurations, gl_accounts for account definitions, mapping_rules for automated posting logic, journal_entries and journal_entry_lines for financial transactions, accounting_periods for period management, account_balances for current balances, and dimension tables for multi-dimensional accounting. These entities support the complete financial lifecycle from transaction capture through period close and financial reporting.

**⚠️ IMPORTANT: This is a Data Definition Document - TEXT FORMAT ONLY**

This document describes data structures, entities, relationships, and constraints in TEXT FORMAT. It does NOT contain executable SQL code, database scripts, or implementation code. For database implementation details, refer to the Technical Specification document.

**Related Documents**:
- [Business Requirements](./BR-account-code-mapping.md)
- [Use Cases](./UC-account-code-mapping.md)
- [Technical Specification](./TS-account-code-mapping.md)
- [Flow Diagrams](./FD-account-code-mapping.md)
- [Validations](./VAL-account-code-mapping.md)

---

## Entity Relationship Overview

**Primary Entities**:
- **chart_of_accounts**: Organizational Chart of Accounts configurations
- **gl_accounts**: General Ledger account definitions in hierarchical structure
- **mapping_rules**: Transaction-to-account mapping rules for automated posting
- **journal_entries**: Journal entry headers (JE metadata)
- **journal_entry_lines**: Individual debit/credit line items within journal entries
- **accounting_periods**: Fiscal periods for period-based accounting
- **account_balances**: Current account balances by dimension
- **account_dimensions**: Dimension type definitions (department, location, cost center, etc.)
- **dimension_values**: Individual dimension values (Dept-001, Loc-MAIN, etc.)

**Key Relationships**:

1. **chart_of_accounts → gl_accounts**: One-to-Many relationship
   - Business meaning: Each COA contains multiple GL accounts organized hierarchically
   - Cardinality: One COA has many accounts (typically 100-2000 accounts)
   - Foreign key: gl_accounts.coa_id references chart_of_accounts.id
   - Example: Carmen ERP Standard COA contains 1500 accounts from 1000 (Assets) to 9999 (Other)

2. **gl_accounts → gl_accounts**: Hierarchical Self-Referencing relationship
   - Business meaning: Accounts organized in parent-child hierarchy (4-6 levels deep)
   - Cardinality: One account can have 0 to many child accounts
   - Foreign key: gl_accounts.parent_account_id references gl_accounts.id
   - Example: 1000 Assets → 1200 Inventory → 1210 Raw Materials → 1211 F&B Ingredients

3. **journal_entries → journal_entry_lines**: One-to-Many relationship
   - Business meaning: Each journal entry has multiple line items (minimum 2 for double-entry)
   - Cardinality: One entry has 2 to unlimited lines (typical: 2-10, max seen: 500)
   - Foreign key: journal_entry_lines.entry_id references journal_entries.id
   - Example: GRN posting has 3 lines (Inventory debit, AP credit, Tax Input debit)

4. **journal_entry_lines → gl_accounts**: Many-to-One relationship
   - Business meaning: Each line item posts to a specific GL account
   - Cardinality: Many line items post to one account over time
   - Foreign key: journal_entry_lines.account_id references gl_accounts.id
   - Example: 1000 line items posted to 1211 F&B Ingredients this month

5. **journal_entries → accounting_periods**: Many-to-One relationship
   - Business meaning: Each entry belongs to a specific accounting period
   - Cardinality: Many entries per period (1000s)
   - Foreign key: journal_entries.period_id references accounting_periods.id
   - Example: All November 2025 entries belong to period 2025-11

6. **mapping_rules → gl_accounts**: Many-to-One relationships (debit, credit, tax accounts)
   - Business meaning: Each rule specifies which accounts to use for debits, credits, and tax
   - Cardinality: Many rules can reference the same account
   - Foreign keys: mapping_rules.debit_account_id, credit_account_id, tax_account_id
   - Example: 15 rules use 2100 Accounts Payable as credit account

7. **account_balances → gl_accounts**: One-to-One relationship per dimension combination
   - Business meaning: Each account has one balance per unique dimension combination per period
   - Cardinality: One account can have 100s of balance records (one per dimension combo)
   - Foreign key: account_balances.account_id references gl_accounts.id
   - Example: Account 5100 COGS has 50 balance records (one per department-location combo)

8. **journal_entry_lines → dimension_values**: Many-to-One relationships (up to 6 dimensions)
   - Business meaning: Each line item can be tagged with up to 6 dimension values
   - Cardinality: Many lines tagged with same dimension value
   - Foreign keys: dimension_1_id through dimension_6_id reference dimension_values.id
   - Example: 200 expense lines tagged with dimension_1 = Dept-KITCHEN

**Relationship Notes**:
- All foreign keys use ON DELETE RESTRICT for financial data integrity
- Journal entries are immutable after posting (reversals instead of updates)
- Soft delete not used for financial entities (audit trail via status changes)
- Hierarchical accounts support unlimited depth but recommend 4-6 levels
- See [Flow Diagrams](./FD-account-code-mapping.md) for visual ERD diagrams

---

## Data Entities

### Entity: chart_of_accounts

**Description**: Represents the Chart of Accounts configuration for an organization or legal entity. Each record defines the structure, accounting standard, and settings for a complete COA.

**Business Purpose**: Provides the framework for financial reporting aligned with accounting standards (IFRS, GAAP, etc.). Supports multi-entity organizations with separate COAs per legal entity or region.

**Data Ownership**: CFO / Controller (setup), Finance Department (usage)

**Access Pattern**:
- Primary: Query by id (single COA per org typically)
- Secondary: Query by legal_entity_id (multi-entity organizations)
- Tertiary: Query by is_active = true (only active COAs)

**Data Volume**: Low (~1-10 per organization, 1 for small orgs, up to 10 for multi-entity groups)

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key identifier | 550e8400-... | Unique, Non-null |
| coa_code | VARCHAR(20) | Yes | - | Unique COA code | COA-STD, COA-US-01 | Unique, 2-20 chars |
| coa_name | VARCHAR(255) | Yes | - | Descriptive COA name | Carmen Standard COA, US GAAP COA | Non-empty, max 255 |
| accounting_standard | VARCHAR(50) | Yes | IFRS | Accounting standard followed | IFRS, US-GAAP, Local | Must be from enum |
| structure_config | JSONB | Yes | {} | COA structure configuration | {"levels": 5, "separator": "-"} | Valid JSON object |
| account_code_format | VARCHAR(50) | Yes | NNNN | Account code format pattern | NNNN, NNNN-NN, AANNN | Regex pattern |
| account_code_length | INTEGER | Yes | 4 | Length of account codes | 4, 6, 10 | Range: 4-10 |
| base_currency | VARCHAR(3) | Yes | USD | Organization's base currency | USD, SGD, EUR | ISO 4217 code |
| fiscal_year_end | VARCHAR(5) | Yes | 12-31 | Fiscal year end date (MM-DD) | 12-31, 03-31 | Format: MM-DD |
| legal_entity_id | UUID | No | NULL | Associated legal entity | 550e8400-... | Foreign key to legal_entities |
| is_active | BOOLEAN | Yes | true | Whether COA is currently active | true, false | - |
| effective_date | DATE | Yes | - | Date COA became effective | 2025-01-01 | Not in future |
| created_at | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-01-01T00:00:00Z | Immutable |
| created_by | UUID | Yes | - | Creator user ID | 550e8400-... | Foreign key to users |
| updated_at | TIMESTAMPTZ | Yes | NOW() | Last update timestamp | 2025-11-12T10:30:00Z | Auto-updated |
| updated_by | UUID | Yes | - | Last modifier user ID | 550e8400-... | Foreign key to users |

#### Data Constraints

**Primary Key**: `id` (UUID)

**Unique Constraints**:
- `coa_code`: Must be unique across all COAs
- `(legal_entity_id, is_active)`: Only one active COA per legal entity

**Check Constraints**:
- `accounting_standard` IN ('IFRS', 'US-GAAP', 'UK-GAAP', 'Local')
- `account_code_length` BETWEEN 4 AND 10
- `fiscal_year_end` matches format 'MM-DD'

---

### Entity: gl_accounts

**Description**: Represents individual General Ledger accounts within a Chart of Accounts. Each account is a posting destination for financial transactions and can be part of a hierarchical structure.

**Business Purpose**: Provides the posting destinations for all financial transactions, enabling financial reporting by account classification. Supports hierarchical rollup for consolidated reporting.

**Data Ownership**: CFO / Controller (structure), Accountants (transactions)

**Access Pattern**:
- Primary: Query by account_code + coa_id (unique identifier for users)
- Secondary: Query by parent_account_id (traverse hierarchy)
- Tertiary: Query by account_type + is_active (filter by type)
- High-frequency: Query by id for journal entry posting

**Data Volume**: Medium (~100-2000 accounts per COA), grows slowly (5-10 new accounts per year)

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key identifier | 550e8400-... | Unique, Non-null |
| coa_id | UUID | Yes | - | Parent Chart of Accounts | 550e8400-... | Foreign key to chart_of_accounts |
| account_code | VARCHAR(50) | Yes | - | Account code number | 1000, 1210, 5100-01 | 4-10 chars, format per COA |
| account_name | VARCHAR(255) | Yes | - | Account descriptive name | Cash - Operating Account | Non-empty, max 255 |
| account_type | VARCHAR(50) | Yes | - | Classification of account | Asset, Liability, Equity, Revenue, Expense, COGS | Must be from enum |
| account_subtype | VARCHAR(50) | No | NULL | Detailed classification | Current Asset, Long-term Liability | Optional refinement |
| parent_account_id | UUID | No | NULL | Parent account in hierarchy | 550e8400-... | Self-referencing FK, no circular refs |
| hierarchy_level | INTEGER | Yes | - | Depth in account tree | 1, 2, 3, 4 | Calculated, 1-10 |
| hierarchy_path | VARCHAR(500) | Yes | - | Full path from root | /1000/1200/1210 | Denormalized for query perf |
| is_header | BOOLEAN | Yes | false | Whether account is summary-only | true (header), false (posting) | Headers cannot have transactions |
| allow_posting | BOOLEAN | Yes | true | Whether transactions can post | true (leaf), false (header) | Opposite of is_header typically |
| normal_balance_type | VARCHAR(10) | Yes | - | Normal balance side | Debit, Credit | Asset/Expense=Debit, Liability/Revenue=Credit |
| requires_dimension_1 | BOOLEAN | Yes | false | Whether dimension 1 is mandatory | true, false | Typically department |
| requires_dimension_2 | BOOLEAN | Yes | false | Whether dimension 2 is mandatory | true, false | Typically location |
| requires_dimension_3 | BOOLEAN | Yes | false | Whether dimension 3 is mandatory | true, false | Typically cost center |
| requires_dimension_4 | BOOLEAN | Yes | false | Whether dimension 4 is mandatory | true, false | Typically project |
| requires_dimension_5 | BOOLEAN | Yes | false | Whether dimension 5 is mandatory | true, false | Typically product line |
| requires_dimension_6 | BOOLEAN | Yes | false | Whether dimension 6 is mandatory | true, false | Typically customer segment |
| currency_code | VARCHAR(3) | Yes | - | Currency for this account | USD, SGD, EUR | ISO 4217, typically base |
| is_control_account | BOOLEAN | Yes | false | Whether account is control account | true, false | Control accounts reconcile to sub-ledgers |
| control_account_type | VARCHAR(50) | No | NULL | Type of control account | AR, AP, Inventory, Cash | If is_control_account = true |
| tax_code | VARCHAR(20) | No | NULL | Associated tax code | VAT-10, GST-7 | For tax accounts |
| is_active | BOOLEAN | Yes | true | Whether account accepts new posts | true, false | Cannot post to inactive |
| effective_date | DATE | Yes | - | Date account became active | 2025-01-01 | Not in future |
| inactive_date | DATE | No | NULL | Date account became inactive | 2025-12-31 | Must be >= effective_date |
| replacement_account_id | UUID | No | NULL | Redirect account if inactive | 550e8400-... | Foreign key to gl_accounts |
| description | TEXT | No | NULL | Detailed account description | Operating cash account for daily transactions | Max 1000 chars |
| notes | TEXT | No | NULL | Internal notes | Reconcile monthly with bank statement | Max 2000 chars |
| created_at | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-01-01T00:00:00Z | Immutable |
| created_by | UUID | Yes | - | Creator user ID | 550e8400-... | Foreign key to users |
| updated_at | TIMESTAMPTZ | Yes | NOW() | Last update timestamp | 2025-11-12T10:30:00Z | Auto-updated |
| updated_by | UUID | Yes | - | Last modifier user ID | 550e8400-... | Foreign key to users |

#### Data Constraints

**Primary Key**: `id` (UUID)

**Unique Constraints**:
- `(coa_id, account_code)`: Account code unique within COA
- No duplicate active accounts with same code in same COA

**Foreign Keys**:
- `coa_id` → `chart_of_accounts.id` ON DELETE RESTRICT
- `parent_account_id` → `gl_accounts.id` ON DELETE RESTRICT (no orphans)
- `replacement_account_id` → `gl_accounts.id` ON DELETE SET NULL

**Check Constraints**:
- `account_type` IN ('Asset', 'Liability', 'Equity', 'Revenue', 'Expense', 'COGS')
- `normal_balance_type` IN ('Debit', 'Credit')
- `hierarchy_level` BETWEEN 1 AND 10
- If `is_header` = true, then `allow_posting` = false
- If `is_active` = false, then `inactive_date` IS NOT NULL
- `inactive_date` >= `effective_date` (if not null)
- No circular hierarchy (parent cannot be descendant)

**Business Rules**:
- Asset and Expense accounts have normal_balance_type = 'Debit'
- Liability, Equity, and Revenue accounts have normal_balance_type = 'Credit'
- Leaf accounts (no children) typically have allow_posting = true
- Header accounts (have children) typically have is_header = true, allow_posting = false
- Control accounts must reconcile with sub-ledger totals

---

### Entity: mapping_rules

**Description**: Defines automated mapping rules that determine which GL accounts to use when posting operational transactions. Rules are evaluated by priority to find the correct account assignment based on transaction attributes.

**Business Purpose**: Automates journal entry generation from operational events (GRN, invoice, payment, etc.) by mapping transaction characteristics to appropriate GL accounts. Reduces manual posting and errors.

**Data Ownership**: Controller / Senior Accountant (configuration), Posting Engine (application)

**Access Pattern**:
- Primary: Query by priority ASC + is_active = true (rule evaluation)
- Secondary: Query by document_type + transaction_type (filter rules)
- Tertiary: Query by debit_account_id OR credit_account_id (account usage analysis)

**Data Volume**: Medium (~50-500 rules per organization), grows moderately (10-20 new rules per year)

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key identifier | 550e8400-... | Unique, Non-null |
| coa_id | UUID | Yes | - | Parent Chart of Accounts | 550e8400-... | Foreign key to chart_of_accounts |
| rule_code | VARCHAR(50) | Yes | - | Unique rule identifier | PR-FOOD-001, INV-ADJ-002 | Unique, 3-50 chars |
| rule_name | VARCHAR(255) | Yes | - | Descriptive rule name | F&B Ingredients Purchase | Non-empty, max 255 |
| priority | INTEGER | Yes | - | Evaluation priority (lower = higher) | 10, 20, 100 | Unique per COA, 1-1000 |
| criteria | JSONB | Yes | {} | Matching criteria (transaction attrs) | {"doc_type": "grn", "category": "F&B"} | Valid JSON, see structure below |
| criteria_logic | VARCHAR(10) | Yes | AND | Logic for multiple criteria | AND, OR | Must be from enum |
| debit_account_id | UUID | Yes | - | Account to debit | 550e8400-... (1210 Raw Materials) | Foreign key to gl_accounts |
| credit_account_id | UUID | Yes | - | Account to credit | 550e8400-... (2100 Accounts Payable) | Foreign key to gl_accounts |
| tax_account_id | UUID | No | NULL | Account for tax (if applicable) | 550e8400-... (1150 Input Tax) | Foreign key to gl_accounts |
| offset_account_id | UUID | No | NULL | Additional offset account | 550e8400-... | For complex entries |
| dimension_1_mapping | VARCHAR(100) | No | NULL | How to determine dimension 1 | transaction.department_id, fixed:DEPT-001 | Mapping expression |
| dimension_2_mapping | VARCHAR(100) | No | NULL | How to determine dimension 2 | transaction.location_id | Mapping expression |
| dimension_3_mapping | VARCHAR(100) | No | NULL | How to determine dimension 3 | department.cost_center_id | Mapping expression |
| dimension_4_mapping | VARCHAR(100) | No | NULL | How to determine dimension 4 | transaction.project_id | Mapping expression |
| dimension_5_mapping | VARCHAR(100) | No | NULL | How to determine dimension 5 | product.product_line_id | Mapping expression |
| dimension_6_mapping | VARCHAR(100) | No | NULL | How to determine dimension 6 | customer.segment_id | Mapping expression |
| conditional_logic | JSONB | No | NULL | Additional conditional rules | {"IF": {"field": "is_imported"}, "THEN": {...}} | Valid JSON, nested IF-THEN |
| description | TEXT | No | NULL | Detailed rule description | Maps F&B ingredient purchases to inventory and AP | Max 1000 chars |
| notes | TEXT | No | NULL | Internal configuration notes | Applies only to direct purchases, not transfers | Max 2000 chars |
| is_active | BOOLEAN | Yes | true | Whether rule is currently used | true, false | Inactive rules skipped |
| effective_date | DATE | Yes | - | Date rule became effective | 2025-01-01 | Can be future |
| expiry_date | DATE | No | NULL | Date rule expires | 2025-12-31 | Must be >= effective_date |
| version | INTEGER | Yes | 1 | Rule version number | 1, 2, 3 | For change tracking |
| created_at | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-01-01T00:00:00Z | Immutable |
| created_by | UUID | Yes | - | Creator user ID | 550e8400-... | Foreign key to users |
| updated_at | TIMESTAMPTZ | Yes | NOW() | Last update timestamp | 2025-11-12T10:30:00Z | Auto-updated |
| updated_by | UUID | Yes | - | Last modifier user ID | 550e8400-... | Foreign key to users |
| approved_by | UUID | No | NULL | Approver user ID | 550e8400-... | Controller approval required |
| approved_at | TIMESTAMPTZ | No | NULL | Approval timestamp | 2025-01-05T14:00:00Z | When approved |

#### Criteria JSON Structure

```json
{
  "transaction_type": "purchase",
  "document_type": "grn",
  "category_id": "CAT-001",
  "subcategory_id": "SUBCAT-F&B",
  "department_id": "DEPT-KITCHEN",
  "location_id": "LOC-MAIN",
  "vendor_type": "local",
  "amount_range": {
    "min": 0,
    "max": 10000
  },
  "tags": ['food', 'perishable']
}
```

#### Data Constraints

**Primary Key**: `id` (UUID)

**Unique Constraints**:
- `rule_code`: Must be unique across all rules
- `(coa_id, priority)`: Priority unique within COA

**Foreign Keys**:
- `coa_id` → `chart_of_accounts.id` ON DELETE RESTRICT
- `debit_account_id` → `gl_accounts.id` ON DELETE RESTRICT
- `credit_account_id` → `gl_accounts.id` ON DELETE RESTRICT
- `tax_account_id` → `gl_accounts.id` ON DELETE SET NULL
- `approved_by` → `users.id` ON DELETE SET NULL

**Check Constraints**:
- `priority` BETWEEN 1 AND 1000
- `criteria_logic` IN ('AND', 'OR')
- `expiry_date` >= `effective_date` (if not null)
- `version` >= 1
- `debit_account_id` != `credit_account_id`
- All account references must have `allow_posting` = true

**Business Rules**:
- Rules evaluated in priority order (ascending)
- First matching rule wins
- Criteria must contain at least one condition
- Debit and credit accounts must be different
- Tax account optional, only for taxable transactions
- Dimension mappings evaluated at runtime

---

### Entity: journal_entries

**Description**: Journal entry headers containing metadata for financial transactions. Each record represents a complete double-entry journal entry with one or more line items.

**Business Purpose**: Records all financial transactions in the GL with full audit trail. Provides basis for financial reporting, period closing, and account reconciliation.

**Data Ownership**: Finance Department (posting), Audit Department (review)

**Access Pattern**:
- Primary: Query by period_id + status (period entries)
- Secondary: Query by source_type + source_id (find entries for transaction)
- Tertiary: Query by entry_number (user lookup)
- High-frequency: Query by posting_date range (reports)

**Data Volume**: High (~10K-100K entries per month), retention: 7 years minimum

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key identifier | 550e8400-... | Unique, Non-null |
| coa_id | UUID | Yes | - | Chart of Accounts | 550e8400-... | Foreign key to chart_of_accounts |
| entry_number | VARCHAR(50) | Yes | Auto-generated | Unique sequential entry number | JE-2501-001234 | Unique, format: JE-YYMM-NNNN |
| entry_date | DATE | Yes | - | Transaction date | 2025-11-12 | Business date |
| posting_date | TIMESTAMPTZ | Yes | NOW() | When entry was posted to GL | 2025-11-12T10:30:00Z | Cannot be future |
| period_id | UUID | Yes | - | Accounting period | 550e8400-... (2025-11) | Foreign key to accounting_periods |
| fiscal_year | INTEGER | Yes | - | Fiscal year | 2025 | Derived from period |
| source_type | VARCHAR(50) | Yes | Manual | Origin of entry | Manual, Auto-GRN, Auto-Invoice, Auto-Payment | Must be from enum |
| source_document_id | UUID | No | NULL | Source transaction ID | 550e8400-... (GRN ID) | Polymorphic reference |
| source_document_type | VARCHAR(50) | No | NULL | Source transaction type | grn, invoice, payment | If source_document_id provided |
| source_document_reference | VARCHAR(50) | No | NULL | Source document number | GRN-2501-000123 | For display/audit |
| description | VARCHAR(500) | Yes | - | Entry description | GRN posting for F&B ingredients | Non-empty, max 500 |
| notes | TEXT | No | NULL | Additional notes | Auto-generated by Posting Engine | Max 2000 chars |
| total_debit_amount | NUMERIC(15,2) | Yes | - | Sum of all debit lines | 5000.00 | Must equal total_credit_amount |
| total_credit_amount | NUMERIC(15,2) | Yes | - | Sum of all credit lines | 5000.00 | Must equal total_debit_amount |
| base_currency | VARCHAR(3) | Yes | USD | Currency for amounts | USD, SGD, EUR | From COA |
| exchange_rate | NUMERIC(10,6) | Yes | 1.000000 | Exchange rate used | 1.000000, 1.320000 | For multi-currency |
| status | VARCHAR(50) | Yes | Draft | Entry lifecycle status | Draft, Pending Approval, Posted, Reversed | Must be from enum |
| is_reversing | BOOLEAN | Yes | false | Whether entry is a reversal | false, true | If reversing another entry |
| original_entry_id | UUID | No | NULL | Entry being reversed | 550e8400-... | Foreign key to journal_entries (self-ref) |
| reversed_by_entry_id | UUID | No | NULL | Entry that reversed this | 550e8400-... | Foreign key to journal_entries (self-ref) |
| reversal_date | DATE | No | NULL | Date of reversal | 2025-11-15 | If reversed |
| reversal_reason | TEXT | No | NULL | Why entry was reversed | Posted to wrong account | Max 500 chars |
| requires_approval | BOOLEAN | Yes | false | Whether approval needed | true (>$10K), false | Based on amount |
| approval_status | VARCHAR(50) | No | NULL | Approval workflow status | Pending, Approved, Rejected | If requires_approval = true |
| approved_by | UUID | No | NULL | Approver user ID | 550e8400-... | Foreign key to users |
| approved_at | TIMESTAMPTZ | No | NULL | Approval timestamp | 2025-11-12T11:00:00Z | When approved |
| entry_hash | VARCHAR(64) | Yes | - | SHA-256 hash of entry | abc123... | For integrity verification |
| previous_entry_hash | VARCHAR(64) | No | NULL | Hash of previous entry | def456... | Creates hash chain |
| doc_version | INTEGER | Yes | 1 | Optimistic locking version | 1, 2, 3 | Prevent concurrent edits |
| attachment_count | INTEGER | Yes | 0 | Number of attached files | 0, 3 | Supporting documents |
| created_at | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-11-12T10:30:00Z | Immutable |
| created_by | UUID | Yes | - | Creator user ID | 550e8400-... | Foreign key to users |
| posted_at | TIMESTAMPTZ | No | NULL | When entry posted | 2025-11-12T10:31:00Z | When status → Posted |
| posted_by | UUID | No | NULL | User who posted entry | 550e8400-... | Foreign key to users |
| updated_at | TIMESTAMPTZ | Yes | NOW() | Last update timestamp | 2025-11-12T10:30:00Z | Auto-updated (draft only) |
| updated_by | UUID | No | NULL | Last modifier user ID | 550e8400-... | Foreign key to users |

#### Data Constraints

**Primary Key**: `id` (UUID)

**Unique Constraints**:
- `entry_number`: Must be unique across all entries
- No duplicate entry_number within COA

**Foreign Keys**:
- `coa_id` → `chart_of_accounts.id` ON DELETE RESTRICT
- `period_id` → `accounting_periods.id` ON DELETE RESTRICT
- `original_entry_id` → `journal_entries.id` ON DELETE SET NULL
- `reversed_by_entry_id` → `journal_entries.id` ON DELETE SET NULL
- `approved_by` → `users.id` ON DELETE SET NULL
- `posted_by` → `users.id` ON DELETE SET NULL

**Check Constraints**:
- `total_debit_amount` = `total_credit_amount` (balanced entry)
- `total_debit_amount` > 0 (no zero entries)
- `status` IN ('Draft', 'Pending Approval', 'Posted', 'Reversed')
- `source_type` IN ('Manual', 'Auto-GRN', 'Auto-Invoice', 'Auto-Payment', 'Auto-Transfer', 'Auto-Adjustment', 'Auto-Depreciation', 'Auto-Accrual')
- If `is_reversing` = true, then `original_entry_id` IS NOT NULL
- If `status` = 'Posted', then `posted_at` and `posted_by` ARE NOT NULL
- `exchange_rate` > 0

**Business Rules**:
- Entries are immutable after posting (status = 'Posted')
- Reversals create new entries with opposite amounts
- Hash chain ensures entry sequence integrity
- Period must be open for new postings
- Approval required if total amount exceeds user authority

---

### Entity: journal_entry_lines

**Description**: Individual debit or credit line items within journal entries. Each line represents a single posting to a GL account with optional dimension tagging.

**Business Purpose**: Provides the atomic unit of financial posting, enabling detailed transaction tracking by account and dimension. Supports multi-dimensional reporting and analytics.

**Data Ownership**: Finance Department (via journal entries)

**Access Pattern**:
- Primary: Query by entry_id (get all lines for entry)
- Secondary: Query by account_id + posting_date range (account activity)
- Tertiary: Query by dimension values (dimensional reporting)
- High-frequency: Aggregate by account_id for balance calculations

**Data Volume**: Very High (~30K-300K lines per month, 3-5 lines per entry average), retention: 7 years minimum

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key identifier | 550e8400-... | Unique, Non-null |
| entry_id | UUID | Yes | - | Parent journal entry | 550e8400-... | Foreign key to journal_entries |
| line_number | INTEGER | Yes | - | Sequence within entry | 1, 2, 3 | Unique within entry |
| account_id | UUID | Yes | - | GL account to post to | 550e8400-... | Foreign key to gl_accounts |
| debit_amount | NUMERIC(15,2) | Yes | 0.00 | Debit amount (base currency) | 5000.00, 0.00 | >= 0, one of debit/credit must be > 0 |
| credit_amount | NUMERIC(15,2) | Yes | 0.00 | Credit amount (base currency) | 0.00, 5000.00 | >= 0, one of debit/credit must be > 0 |
| original_debit_amount | NUMERIC(15,2) | No | NULL | Debit in original currency | 6600.00 (SGD) | For multi-currency |
| original_credit_amount | NUMERIC(15,2) | No | NULL | Credit in original currency | 6600.00 (SGD) | For multi-currency |
| original_currency | VARCHAR(3) | No | NULL | Original transaction currency | SGD, EUR, GBP | ISO 4217 |
| exchange_rate | NUMERIC(10,6) | No | NULL | FX rate applied | 1.320000 | original * rate = base |
| dimension_1_id | UUID | No | NULL | Dimension 1 value (e.g., Department) | 550e8400-... | Foreign key to dimension_values |
| dimension_2_id | UUID | No | NULL | Dimension 2 value (e.g., Location) | 550e8400-... | Foreign key to dimension_values |
| dimension_3_id | UUID | No | NULL | Dimension 3 value (e.g., Cost Center) | 550e8400-... | Foreign key to dimension_values |
| dimension_4_id | UUID | No | NULL | Dimension 4 value (e.g., Project) | 550e8400-... | Foreign key to dimension_values |
| dimension_5_id | UUID | No | NULL | Dimension 5 value (e.g., Product Line) | 550e8400-... | Foreign key to dimension_values |
| dimension_6_id | UUID | No | NULL | Dimension 6 value (e.g., Customer Segment) | 550e8400-... | Foreign key to dimension_values |
| line_description | VARCHAR(500) | No | NULL | Line-specific description | F&B ingredients - Chicken breast | Max 500 chars |
| memo | TEXT | No | NULL | Additional line notes | Supplier: ABC Foods, PO: PO-2501-0001 | Max 1000 chars |
| quantity | NUMERIC(15,4) | No | NULL | Quantity (if applicable) | 100.0000 | For unit cost analysis |
| unit_price | NUMERIC(15,4) | No | NULL | Unit price (if applicable) | 50.0000 | For unit cost analysis |
| tax_code | VARCHAR(20) | No | NULL | Tax code applied | VAT-10, GST-7 | For tax lines |
| tax_rate | NUMERIC(5,2) | No | NULL | Tax rate percentage | 10.00, 7.00 | 0-100 |
| is_tax_line | BOOLEAN | Yes | false | Whether line is for tax | false, true | Tax posting |
| reference_number | VARCHAR(100) | No | NULL | External reference | Invoice INV-2501-0001 | For reconciliation |
| created_at | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-11-12T10:30:00Z | Immutable |
| created_by | UUID | Yes | - | Creator user ID | 550e8400-... | Foreign key to users |

#### Data Constraints

**Primary Key**: `id` (UUID)

**Unique Constraints**:
- `(entry_id, line_number)`: Line number unique within entry

**Foreign Keys**:
- `entry_id` → `journal_entries.id` ON DELETE CASCADE (delete lines with entry)
- `account_id` → `gl_accounts.id` ON DELETE RESTRICT
- `dimension_1_id` through `dimension_6_id` → `dimension_values.id` ON DELETE RESTRICT

**Check Constraints**:
- `debit_amount` >= 0 AND `credit_amount` >= 0
- `debit_amount` > 0 OR `credit_amount` > 0 (one must be positive)
- NOT (`debit_amount` > 0 AND `credit_amount` > 0) (only one side can be non-zero)
- `line_number` > 0
- `tax_rate` BETWEEN 0 AND 100 (if not null)
- If `original_currency` provided, then `exchange_rate` must be provided

**Business Rules**:
- Each line must post to an account with allow_posting = true
- Lines inherit period and posting date from parent entry
- Required dimensions must be provided if account requires them
- Sum of all debit lines must equal sum of all credit lines within entry
- Lines are immutable after entry is posted

---

### Entity: accounting_periods

**Description**: Represents fiscal periods for period-based financial accounting. Each record defines a calendar period with status controlling whether transactions can be posted.

**Business Purpose**: Implements period-based accounting controls, enabling sequential period closing and preventing backdated transactions in closed periods. Supports month-end, quarter-end, and year-end processes.

**Data Ownership**: Controller (management), Finance Department (usage)

**Access Pattern**:
- Primary: Query by status = 'Open' (current posting period)
- Secondary: Query by period_code (specific period lookup)
- Tertiary: Query by fiscal_year + period_number (year navigation)

**Data Volume**: Low (~12-13 periods per year, accumulates slowly), retention: Permanent

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key identifier | 550e8400-... | Unique, Non-null |
| coa_id | UUID | Yes | - | Chart of Accounts | 550e8400-... | Foreign key to chart_of_accounts |
| period_code | VARCHAR(20) | Yes | - | Unique period identifier | 2025-11, Q4-2025, FY2025 | Unique, format: YYYY-MM |
| period_name | VARCHAR(100) | Yes | - | Display name for period | November 2025 | Non-empty |
| period_type | VARCHAR(20) | Yes | Month | Type of period | Month, Quarter, Year | Must be from enum |
| fiscal_year | INTEGER | Yes | - | Fiscal year | 2025 | 4-digit year |
| fiscal_quarter | INTEGER | No | NULL | Fiscal quarter (1-4) | 4 | 1-4 if period_type = Quarter |
| period_number | INTEGER | Yes | - | Period number within year | 11 | 1-12 for months |
| start_date | DATE | Yes | - | Period start date | 2025-11-01 | First day of period |
| end_date | DATE | Yes | - | Period end date | 2025-11-30 | Last day of period |
| status | VARCHAR(50) | Yes | Draft | Period status | Draft, Open, Soft Closed, Closed | Must be from enum |
| is_adjustment_period | BOOLEAN | Yes | false | Whether period allows adjustments | false, true | 13th period for year-end |
| soft_close_date | TIMESTAMPTZ | No | NULL | When soft close executed | 2025-12-05T10:00:00Z | When status → Soft Closed |
| soft_close_by | UUID | No | NULL | User who soft closed | 550e8400-... | Foreign key to users |
| close_date | TIMESTAMPTZ | No | NULL | When hard close executed | 2025-12-15T10:00:00Z | When status → Closed |
| closed_by | UUID | No | NULL | User who hard closed | 550e8400-... | Foreign key to users |
| reopen_count | INTEGER | Yes | 0 | Number of times reopened | 0, 1, 2 | Audit trail |
| last_reopen_date | TIMESTAMPTZ | No | NULL | When last reopened | 2025-12-20T14:00:00Z | If reopened |
| last_reopen_by | UUID | No | NULL | User who last reopened | 550e8400-... | Foreign key to users |
| last_reopen_reason | TEXT | No | NULL | Why period was reopened | Correction required for vendor credit | Max 500 chars |
| entry_count | INTEGER | Yes | 0 | Number of entries in period | 1234 | Denormalized for reporting |
| total_debits | NUMERIC(18,2) | Yes | 0.00 | Sum of all debits in period | 1250000.00 | Denormalized for reporting |
| total_credits | NUMERIC(18,2) | Yes | 0.00 | Sum of all credits in period | 1250000.00 | Denormalized for reporting |
| notes | TEXT | No | NULL | Period notes | Q4 close includes inventory valuation adjustment | Max 2000 chars |
| created_at | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-11-01T00:00:00Z | Immutable |
| created_by | UUID | Yes | - | Creator user ID | 550e8400-... | Foreign key to users |
| updated_at | TIMESTAMPTZ | Yes | NOW() | Last update timestamp | 2025-11-12T10:30:00Z | Auto-updated |
| updated_by | UUID | Yes | - | Last modifier user ID | 550e8400-... | Foreign key to users |

#### Data Constraints

**Primary Key**: `id` (UUID)

**Unique Constraints**:
- `period_code`: Must be unique across all periods
- `(coa_id, fiscal_year, period_number)`: Unique period within fiscal year

**Foreign Keys**:
- `coa_id` → `chart_of_accounts.id` ON DELETE RESTRICT
- `soft_close_by` → `users.id` ON DELETE SET NULL
- `closed_by` → `users.id` ON DELETE SET NULL
- `last_reopen_by` → `users.id` ON DELETE SET NULL

**Check Constraints**:
- `period_type` IN ('Month', 'Quarter', 'Year', 'Adjustment')
- `status` IN ('Draft', 'Open', 'Soft Closed', 'Closed')
- `end_date` > `start_date`
- `fiscal_quarter` BETWEEN 1 AND 4 (if not null)
- `period_number` BETWEEN 1 AND 13 (allows 13th adjustment period)
- `total_debits` = `total_credits` (when period closed)
- If `status` = 'Soft Closed', then `soft_close_date` and `soft_close_by` must be provided
- If `status` = 'Closed', then `close_date` and `closed_by` must be provided

**Business Rules**:
- Only one period can have status = 'Open' at a time
- Periods must be closed sequentially (cannot close Nov before closing Oct)
- Soft Close: Regular users cannot post, controllers can post adjustments
- Closed: No one can post (requires reopen with CFO approval)
- Adjustment periods (13th period) used for year-end entries only
- Period reopen requires CFO approval and audit trail

---

### Entity: account_balances

**Description**: Stores current account balances by dimension combination. Updated automatically when journal entries posted. Provides fast balance queries without summing all transactions.

**Business Purpose**: Enables fast balance reporting and trial balance generation. Supports multi-dimensional financial analysis (balance by department, location, cost center, project).

**Data Ownership**: Posting Engine (automated updates)

**Access Pattern**:
- Primary: Query by account_id + period_id + dimension filters (balance lookup)
- Secondary: Query by period_id (trial balance generation)
- Tertiary: Query by dimension values (dimensional reporting)

**Data Volume**: High (~10K-50K balance records per period), retention: 7 years

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key identifier | 550e8400-... | Unique, Non-null |
| account_id | UUID | Yes | - | GL account | 550e8400-... | Foreign key to gl_accounts |
| period_id | UUID | Yes | - | Accounting period | 550e8400-... | Foreign key to accounting_periods |
| dimension_1_id | UUID | No | NULL | Dimension 1 value | 550e8400-... | Foreign key to dimension_values |
| dimension_2_id | UUID | No | NULL | Dimension 2 value | 550e8400-... | Foreign key to dimension_values |
| dimension_3_id | UUID | No | NULL | Dimension 3 value | 550e8400-... | Foreign key to dimension_values |
| dimension_4_id | UUID | No | NULL | Dimension 4 value | 550e8400-... | Foreign key to dimension_values |
| dimension_5_id | UUID | No | NULL | Dimension 5 value | 550e8400-... | Foreign key to dimension_values |
| dimension_6_id | UUID | No | NULL | Dimension 6 value | 550e8400-... | Foreign key to dimension_values |
| beginning_balance | NUMERIC(18,2) | Yes | 0.00 | Balance at period start | 50000.00 | From previous period ending |
| period_debits | NUMERIC(18,2) | Yes | 0.00 | Sum of debits in period | 25000.00 | Updated with each posting |
| period_credits | NUMERIC(18,2) | Yes | 0.00 | Sum of credits in period | 15000.00 | Updated with each posting |
| ending_balance | NUMERIC(18,2) | Yes | 0.00 | Balance at period end | 60000.00 | Calculated: beginning + debits - credits (or opposite for credit accounts) |
| transaction_count | INTEGER | Yes | 0 | Number of transactions | 234 | For reconciliation |
| last_transaction_date | DATE | No | NULL | Most recent transaction | 2025-11-30 | For activity tracking |
| is_reconciled | BOOLEAN | Yes | false | Whether balance reconciled | false, true | For control accounts |
| reconciliation_date | DATE | No | NULL | When reconciled | 2025-12-01 | If is_reconciled = true |
| reconciliation_variance | NUMERIC(15,2) | No | NULL | Variance if reconciled | 0.00, 125.50 | Should be 0.00 |
| updated_at | TIMESTAMPTZ | Yes | NOW() | Last update timestamp | 2025-11-30T23:59:59Z | Auto-updated with posting |

#### Data Constraints

**Primary Key**: `id` (UUID)

**Unique Constraints**:
- `(account_id, period_id, dimension_1_id, dimension_2_id, dimension_3_id, dimension_4_id, dimension_5_id, dimension_6_id)`: One balance per account-period-dimension combination
- NULL dimensions treated as distinct value in uniqueness

**Foreign Keys**:
- `account_id` → `gl_accounts.id` ON DELETE RESTRICT
- `period_id` → `accounting_periods.id` ON DELETE RESTRICT
- `dimension_1_id` through `dimension_6_id` → `dimension_values.id` ON DELETE RESTRICT

**Check Constraints**:
- For debit normal balance accounts: `ending_balance` = `beginning_balance` + `period_debits` - `period_credits`
- For credit normal balance accounts: `ending_balance` = `beginning_balance` + `period_credits` - `period_debits`
- `transaction_count` >= 0
- If `is_reconciled` = true, then `reconciliation_date` must be provided

**Business Rules**:
- Balances updated atomically with journal entry posting
- Beginning balance of current period = ending balance of previous period
- Control account balances must reconcile with sub-ledger totals
- Dimension balances roll up to parent (NULL dimension) balance

---

### Entity: account_dimensions

**Description**: Defines the dimension types used for multi-dimensional accounting. Each dimension represents a way to categorize and analyze financial data (department, location, cost center, etc.).

**Business Purpose**: Provides the framework for multi-dimensional financial reporting, enabling analysis by business unit, geography, project, product line, and other perspectives.

**Data Ownership**: CFO / Controller (configuration)

**Access Pattern**:
- Primary: Query by is_active = true (active dimensions)
- Secondary: Query by dimension_level (1-6)
- Tertiary: Query by coa_id (dimensions for COA)

**Data Volume**: Very Low (~6-10 dimension types per organization), static configuration

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key identifier | 550e8400-... | Unique, Non-null |
| coa_id | UUID | Yes | - | Chart of Accounts | 550e8400-... | Foreign key to chart_of_accounts |
| dimension_code | VARCHAR(20) | Yes | - | Unique dimension code | DEPT, LOC, CC, PROJ | Unique, 2-20 chars |
| dimension_name | VARCHAR(100) | Yes | - | Display name | Department, Location, Cost Center | Non-empty |
| dimension_level | INTEGER | Yes | - | Which dimension slot (1-6) | 1, 2, 3 | Range: 1-6, unique per COA |
| dimension_type | VARCHAR(50) | Yes | - | Type of dimension | Department, Location, Cost Center, Project, Product Line, Customer Segment | Must be from enum |
| description | TEXT | No | NULL | Detailed description | Organizational departments for expense allocation | Max 500 chars |
| is_active | BOOLEAN | Yes | true | Whether dimension is active | true, false | Cannot deactivate if in use |
| is_required_default | BOOLEAN | Yes | false | Whether required by default | false, true | Can be overridden per account |
| display_order | INTEGER | Yes | - | Display order in UI | 1, 2, 3 | Ascending order |
| created_at | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-01-01T00:00:00Z | Immutable |
| created_by | UUID | Yes | - | Creator user ID | 550e8400-... | Foreign key to users |
| updated_at | TIMESTAMPTZ | Yes | NOW() | Last update timestamp | 2025-11-12T10:30:00Z | Auto-updated |
| updated_by | UUID | Yes | - | Last modifier user ID | 550e8400-... | Foreign key to users |

#### Data Constraints

**Primary Key**: `id` (UUID)

**Unique Constraints**:
- `(coa_id, dimension_code)`: Dimension code unique within COA
- `(coa_id, dimension_level)`: Dimension level unique within COA

**Foreign Keys**:
- `coa_id` → `chart_of_accounts.id` ON DELETE RESTRICT

**Check Constraints**:
- `dimension_level` BETWEEN 1 AND 6
- `dimension_type` IN ('Department', 'Location', 'Cost Center', 'Project', 'Product Line', 'Customer Segment', 'Vendor', 'Fund', 'Grant', 'Custom')

---

### Entity: dimension_values

**Description**: Individual values within each dimension type. Each record represents a specific department, location, cost center, project, etc. that can be assigned to journal entry lines.

**Business Purpose**: Provides the actual dimension values for tagging transactions, enabling detailed financial analysis and reporting by business perspective.

**Data Ownership**: Dimension owners (HR for departments, Operations for locations, etc.)

**Access Pattern**:
- Primary: Query by dimension_id + is_active (active values for dimension)
- Secondary: Query by value_code (user lookup)
- Tertiary: Query by parent_value_id (hierarchical dimensions)

**Data Volume**: Medium (~100-2000 values across all dimensions), grows moderately

#### Field Definitions Table

| Field Name | Data Type | Required | Default | Description | Example Values | Constraints |
|-----------|-----------|----------|---------|-------------|----------------|-------------|
| id | UUID | Yes | Auto-generated | Primary key identifier | 550e8400-... | Unique, Non-null |
| dimension_id | UUID | Yes | - | Parent dimension type | 550e8400-... | Foreign key to account_dimensions |
| value_code | VARCHAR(50) | Yes | - | Unique value code | DEPT-KITCHEN, LOC-MAIN, CC-F&B | Unique within dimension |
| value_name | VARCHAR(255) | Yes | - | Display name | Main Kitchen, Corporate Office | Non-empty |
| parent_value_id | UUID | No | NULL | Parent value (hierarchical) | 550e8400-... | Self-referencing FK |
| hierarchy_level | INTEGER | Yes | 1 | Depth in hierarchy | 1, 2, 3 | 1 for root level |
| hierarchy_path | VARCHAR(500) | Yes | - | Full path from root | /DEPT-F&B/DEPT-KITCHEN | For rollup queries |
| is_active | BOOLEAN | Yes | true | Whether value is active | true, false | Cannot post to inactive |
| effective_date | DATE | Yes | - | Date value became active | 2025-01-01 | Not in future |
| inactive_date | DATE | No | NULL | Date value became inactive | 2025-12-31 | >= effective_date |
| description | TEXT | No | NULL | Detailed description | Main production kitchen for all F&B operations | Max 500 chars |
| external_code | VARCHAR(50) | No | NULL | Code from external system | 1234 | For integrations |
| attributes | JSONB | No | {} | Additional flexible attributes | {"manager": "John Smith", "budget": 500000} | Valid JSON |
| created_at | TIMESTAMPTZ | Yes | NOW() | Creation timestamp | 2025-01-01T00:00:00Z | Immutable |
| created_by | UUID | Yes | - | Creator user ID | 550e8400-... | Foreign key to users |
| updated_at | TIMESTAMPTZ | Yes | NOW() | Last update timestamp | 2025-11-12T10:30:00Z | Auto-updated |
| updated_by | UUID | Yes | - | Last modifier user ID | 550e8400-... | Foreign key to users |

#### Data Constraints

**Primary Key**: `id` (UUID)

**Unique Constraints**:
- `(dimension_id, value_code)`: Value code unique within dimension
- No duplicate active values with same code in same dimension

**Foreign Keys**:
- `dimension_id` → `account_dimensions.id` ON DELETE RESTRICT
- `parent_value_id` → `dimension_values.id` ON DELETE RESTRICT (no orphans)

**Check Constraints**:
- `hierarchy_level` >= 1
- `inactive_date` >= `effective_date` (if not null)
- No circular hierarchy (parent cannot be descendant)

**Business Rules**:
- Cannot deactivate value if used in open period transactions
- Hierarchical rollup: child values roll up to parent for reporting
- Value codes follow dimension-specific naming conventions

---

## Database Indexes

### Performance-Critical Indexes

**journal_entries**:
- `idx_je_period_status` ON (period_id, status)
- `idx_je_source` ON (source_document_type, source_document_id)
- `idx_je_entry_number` ON (entry_number)
- `idx_je_posting_date` ON (posting_date)

**journal_entry_lines**:
- `idx_jel_entry` ON (entry_id)
- `idx_jel_account_date` ON (account_id, entry_id) - for balance calculations
- `idx_jel_dimensions` ON (dimension_1_id, dimension_2_id, dimension_3_id)

**gl_accounts**:
- `idx_acc_code` ON (coa_id, account_code)
- `idx_acc_parent` ON (parent_account_id)
- `idx_acc_type_active` ON (account_type, is_active)

**mapping_rules**:
- `idx_rule_priority` ON (coa_id, priority, is_active)
- `idx_rule_debit_account` ON (debit_account_id)
- `idx_rule_credit_account` ON (credit_account_id)

**account_balances**:
- `idx_bal_account_period` ON (account_id, period_id)
- `idx_bal_period_dims` ON (period_id, dimension_1_id, dimension_2_id)

**accounting_periods**:
- `idx_period_status` ON (coa_id, status)
- `idx_period_dates` ON (start_date, end_date)

---

## Materialized Views

### mv_trial_balance

**Purpose**: Pre-calculated trial balance for current and recent periods
**Refresh Strategy**: After each posting batch (every 5 minutes), on-demand for reports
**Contents**: account_code, account_name, account_type, period_code, debit_balance, credit_balance, net_balance
**Query Performance**: Sub-second for trial balance reports

### mv_account_balances_summary

**Purpose**: Account balances grouped by major dimensions
**Refresh Strategy**: Daily at midnight, on-demand for period close
**Contents**: account_id, period_id, department, location, cost_center, total_debit, total_credit, ending_balance
**Query Performance**: Fast dimensional reporting (< 2 seconds)

### mv_monthly_activity_summary

**Purpose**: Monthly transaction volume and amounts by account
**Refresh Strategy**: Daily at midnight
**Contents**: account_id, month, transaction_count, total_debits, total_credits, net_change
**Query Performance**: Fast trend analysis and forecasting

---

## Appendix

### Related Documents
- [Business Requirements](./BR-account-code-mapping.md)
- [Use Cases](./UC-account-code-mapping.md)
- [Technical Specification](./TS-account-code-mapping.md)
- [Flow Diagrams](./FD-account-code-mapping.md)
- [Validations](./VAL-account-code-mapping.md)

### Data Dictionary Summary

**Total Entities**: 9 core entities
**Total Fields**: ~320 fields across all entities
**Estimated Database Size**: 50-500 MB per year (excluding attachments)
**Retention Policy**: 7 years minimum for financial records, permanent for COA and periods
**Backup Strategy**: Daily full backup, hourly incremental backups, 30-day point-in-time recovery

---

**Document End**
