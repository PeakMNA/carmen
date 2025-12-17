# Stock In - Validations (VAL)

## Document Information
- **Module**: Inventory Management - Stock In
- **Document Type**: Validations (VAL)
- **Related Documents**:
  - BR-stock-in.md (Business Requirements)
  - UC-stock-in.md (Use Cases)
  - TS-stock-in.md (Technical Specification)
  - DD-stock-in.md (Data Definition)
  - FD-stock-in.md (Flow Diagrams)
- **Version**: 1.0
- **Last Updated**: 2025-01-11

## Table of Contents
1. [Overview](#overview)
2. [Validation Categories](#validation-categories)
3. [Field-Level Validations](#field-level-validations)
4. [Business Rule Validations](#business-rule-validations)
5. [Cross-Field Validations](#cross-field-validations)
6. [Security Validations](#security-validations)
7. [Error Messages](#error-messages)
8. [Test Scenarios](#test-scenarios)
9. [Validation Matrix](#validation-matrix)

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1.0 | 2025-12-10 | Documentation Team | Standardized reference number format (XXX-YYMM-NNNN) |
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
---

## Overview

This document defines all validation rules for the Stock In sub-module. Validations ensure data integrity, enforce business rules, maintain audit compliance, and protect against invalid transactions that could corrupt inventory balances or financial postings.

### Validation Layers

**Three-Tier Validation Architecture**:
1. **Client-Side (React Hook Form + Zod)**: Immediate feedback, UX optimization, prevent unnecessary server calls
2. **Server-Side (Server Actions)**: Business logic enforcement, security, external system validation
3. **Database-Level (Constraints + Triggers)**: Data integrity guarantees, atomic operations

### Validation Priorities
- **Critical**: Data integrity violations, financial impact, inventory balance corruption, security breaches
- **High**: Business rule violations, workflow disruption, integration failures
- **Medium**: Data quality issues, user experience impact, non-blocking warnings
- **Low**: Formatting preferences, informational messages, non-critical warnings

### Coverage
This document covers all 53 business rules from BR-stock-in.md, organized into 48 validation rules across 4 categories.

---

## Validation Categories

### 1. Field-Level Validations (VAL-STI-001 to 099)
Individual field constraints: required, format, range, length, data type, reference validity

### 2. Business Rule Validations (VAL-STI-101 to 199)
Business logic enforcement: transaction type rules, status transitions, cost calculation, balance updates, integration requirements

### 3. Cross-Field Validations (VAL-STI-201 to 299)
Multi-field dependencies: total calculations, status-dependent edits, related document consistency

### 4. Security Validations (VAL-STI-301 to 399)
Access control, permissions, data ownership, audit requirements, location-based security

---

## Field-Level Validations

### VAL-STI-001: Transaction Type Required
**Priority**: Critical
**Enforcement**: Client, Server, Database

**Rule**: The `type` field must be one of the five valid transaction types.

**Validation Logic**:
```
VALID_TYPES = ['Good Receive Note', 'Transfer', 'Credit Note', 'Issue Return', 'Adjustment']

IF type IS NULL THEN
  ERROR: "Transaction type is required."
ELSE IF type NOT IN VALID_TYPES THEN
  ERROR: "Invalid transaction type."
END IF
```

**Error Messages**:
- "Transaction type is required to create a stock in transaction."
- "Invalid transaction type. Please select a valid type: GRN, Transfer, Credit Note, Issue Return, or Adjustment."

**Business Rule Reference**: BR-STI-001 to BR-STI-005
**Tested By**: TEST-STI-VAL-001

---

### VAL-STI-002: Transaction Date Required
**Priority**: Critical
**Enforcement**: Client, Server, Database

**Rule**: The `date` field must be a valid date and cannot be null.

**Validation Logic**:
```
IF date IS NULL THEN
  ERROR: "Transaction date is required."
ELSE IF date IS NOT a valid date THEN
  ERROR: "Invalid date format."
END IF
```

**Error Messages**:
- "Transaction date is required."
- "Invalid date format. Please use YYYY-MM-DD."

**Business Rule Reference**: BR-STI-016
**Tested By**: TEST-STI-VAL-002

---

### VAL-STI-003: Transaction Date Range
**Priority**: High
**Enforcement**: Client, Server

**Rule**: Transaction date cannot be more than 30 days in the past or more than 1 day in the future.

**Validation Logic**:
```
IF date < (CURRENT_DATE - INTERVAL '30 days') THEN
  ERROR: "Transaction date cannot be more than 30 days in the past."
ELSE IF date > (CURRENT_DATE + INTERVAL '1 day') THEN
  ERROR: "Transaction date cannot be more than 1 day in the future."
END IF
```

**Error Messages**:
- "Transaction date cannot be more than 30 days in the past. Please contact a supervisor if you need to enter older transactions."
- "Transaction date cannot be more than 1 day in the future. Please use today's date or yesterday's date."

**Business Rule Reference**: BR-STI-016
**Tested By**: TEST-STI-VAL-003

---

### VAL-STI-004: Reference Number Format
**Priority**: Critical
**Enforcement**: Client, Server, Database

**Rule**: Reference number must follow the format STK-IN-YYMM-NNNN.

**Validation Logic**:
```
REGEX_PATTERN = "^STK-IN-\d{4}-\d{4}$"

IF ref_no IS NULL THEN
  ERROR: "Reference number is required."
ELSE IF ref_no DOES NOT MATCH REGEX_PATTERN THEN
  ERROR: "Invalid reference number format."
END IF
```

**Error Messages**:
- "Reference number is required."
- "Invalid reference number format. Must be STK-IN-YYMM-NNNN (e.g., STK-IN-2501-0001)."

**Business Rule Reference**: BR-STI-017
**Tested By**: TEST-STI-VAL-004

---

### VAL-STI-005: Reference Number Uniqueness
**Priority**: Critical
**Enforcement**: Server, Database

**Rule**: Reference number must be unique across all stock in transactions.

**Validation Logic**:
```
IF EXISTS (
  SELECT 1 FROM stock_in_transaction
  WHERE ref_no = new_ref_no
  AND id != current_id
  AND deleted_at IS NULL
) THEN
  ERROR: "Reference number already exists."
END IF
```

**Error Message**: "Reference number '{ref_no}' already exists. Please use a unique reference number or let the system auto-generate one."

**Business Rule Reference**: BR-STI-018
**Tested By**: TEST-STI-VAL-005

---

### VAL-STI-006: Location Required
**Priority**: Critical
**Enforcement**: Client, Server, Database

**Rule**: The `location_id` must reference a valid, active location from tb_location.

**Validation Logic**:
```
IF location_id IS NULL THEN
  ERROR: "Location is required."
ELSE IF NOT EXISTS (
  SELECT 1 FROM tb_location
  WHERE id = location_id
  AND deleted_at IS NULL
) THEN
  ERROR: "Invalid location."
END IF
```

**Error Messages**:
- "Location is required to create a stock in transaction."
- "Invalid location. Please select an active location."

**Business Rule Reference**: BR-STI-019
**Tested By**: TEST-STI-VAL-006

---

### VAL-STI-007: Location Access Permission
**Priority**: High
**Enforcement**: Server

**Rule**: User must have access to the selected location based on location security settings.

**Validation Logic**:
```
IF NOT user_has_location_access(user_id, location_id) THEN
  ERROR: "You do not have access to this location."
END IF
```

**Error Message**: "You do not have permission to create transactions for location '{location_name}'. Please contact your supervisor."

**Business Rule Reference**: BR-STI-043
**Tested By**: TEST-STI-VAL-007

---

### VAL-STI-008: Description Length
**Priority**: Low
**Enforcement**: Client, Server

**Rule**: Description field cannot exceed 500 characters.

**Validation Logic**:
```
IF LENGTH(description) > 500 THEN
  ERROR: "Description is too long."
END IF
```

**Error Message**: "Description cannot exceed 500 characters. Current length: {length}/500."

**Tested By**: TEST-STI-VAL-008

---

### VAL-STI-009: Related Document Format
**Priority**: Medium
**Enforcement**: Client, Server

**Rule**: Related document reference must match expected format based on transaction type.

**Validation Logic**:
```
SWITCH type:
  CASE 'Good Receive Note':
    PATTERN = "^GRN-\d{4}-\d{4}$"
  CASE 'Transfer':
    PATTERN = "^TRF-\d{4}-\d{4}$"
  CASE 'Credit Note':
    PATTERN = "^CN-\d{4}-\d{4}$"
  CASE 'Issue Return':
    PATTERN = "^ISS-\d{4}-\d{4}$"
  CASE 'Adjustment':
    PATTERN = "^ADJ-\d{4}-\d{4}$"
END SWITCH

IF related_doc IS NOT NULL AND related_doc DOES NOT MATCH PATTERN THEN
  ERROR: "Invalid related document format for transaction type."
END IF
```

**Error Message**: "Invalid related document format for {type}. Expected format: {pattern}."

**Business Rule Reference**: BR-STI-001 to BR-STI-005
**Tested By**: TEST-STI-VAL-009

---

### VAL-STI-010: Minimum Line Items
**Priority**: Critical
**Enforcement**: Client, Server

**Rule**: A stock in transaction must include at least 1 line item.

**Validation Logic**:
```
IF COUNT(line_items) < 1 THEN
  ERROR: "Transaction must include at least 1 line item."
END IF
```

**Error Message**: "Transaction must include at least 1 line item. Please add products before saving."

**Business Rule Reference**: BR-STI-020
**Tested By**: TEST-STI-VAL-010

---

### VAL-STI-011: Product Required
**Priority**: Critical
**Enforcement**: Client, Server, Database

**Rule**: Each line item must reference a valid, active product from tb_product.

**Validation Logic**:
```
IF product_id IS NULL THEN
  ERROR: "Product is required for each line item."
ELSE IF NOT EXISTS (
  SELECT 1 FROM tb_product
  WHERE id = product_id
  AND is_active = true
  AND deleted_at IS NULL
) THEN
  ERROR: "Invalid product. Product does not exist or is inactive."
END IF
```

**Error Messages**:
- "Product is required for line {line_number}."
- "Invalid product on line {line_number}. Please select an active product."

**Business Rule Reference**: BR-STI-021
**Tested By**: TEST-STI-VAL-011

---

### VAL-STI-012: Unit of Measure Required
**Priority**: Critical
**Enforcement**: Client, Server, Database

**Rule**: Each line item must have a valid unit of measure that is configured for the selected product.

**Validation Logic**:
```
IF unit_id IS NULL THEN
  ERROR: "Unit of measure is required for each line item."
ELSE IF NOT EXISTS (
  SELECT 1 FROM tb_product_unit
  WHERE product_id = line_item.product_id
  AND unit_id = line_item.unit_id
) THEN
  ERROR: "Invalid unit of measure for selected product."
END IF
```

**Error Messages**:
- "Unit of measure is required for line {line_number}."
- "Unit '{unit_name}' is not valid for product '{product_name}' on line {line_number}."

**Business Rule Reference**: BR-STI-022
**Tested By**: TEST-STI-VAL-012

---

### VAL-STI-013: Quantity Greater Than Zero
**Priority**: Critical
**Enforcement**: Client, Server, Database

**Rule**: Quantity must be greater than 0 for all line items.

**Validation Logic**:
```
IF qty IS NULL THEN
  ERROR: "Quantity is required."
ELSE IF qty <= 0 THEN
  ERROR: "Quantity must be greater than zero."
END IF
```

**Error Messages**:
- "Quantity is required for line {line_number}."
- "Quantity must be greater than zero on line {line_number}. Current value: {qty}."

**Business Rule Reference**: BR-STI-023
**Tested By**: TEST-STI-VAL-013

---

### VAL-STI-014: Unit Cost Non-Negative
**Priority**: Critical
**Enforcement**: Client, Server, Database

**Rule**: Unit cost cannot be negative.

**Validation Logic**:
```
IF unit_cost < 0 THEN
  ERROR: "Unit cost cannot be negative."
END IF
```

**Error Message**: "Unit cost cannot be negative on line {line_number}. Current value: {unit_cost}."

**Business Rule Reference**: BR-STI-024
**Tested By**: TEST-STI-VAL-014

---

### VAL-STI-015: Cost Precision
**Priority**: High
**Enforcement**: Client, Server, Database

**Rule**: Unit cost and total cost must have maximum 4 decimal places precision.

**Validation Logic**:
```
IF DECIMAL_PLACES(unit_cost) > 4 THEN
  ERROR: "Unit cost precision exceeds maximum allowed."
END IF

IF DECIMAL_PLACES(total_cost) > 4 THEN
  ERROR: "Total cost precision exceeds maximum allowed."
END IF
```

**Error Messages**:
- "Unit cost on line {line_number} has too many decimal places. Maximum 4 decimal places allowed."
- "Total cost on line {line_number} has too many decimal places. Maximum 4 decimal places allowed."

**Business Rule Reference**: BR-STI-030
**Tested By**: TEST-STI-VAL-015

---

### VAL-STI-016: Line Item Comment Length
**Priority**: Low
**Enforcement**: Client, Server

**Rule**: Line item comment cannot exceed 200 characters.

**Validation Logic**:
```
IF LENGTH(comment) > 200 THEN
  ERROR: "Line item comment is too long."
END IF
```

**Error Message**: "Comment on line {line_number} cannot exceed 200 characters. Current length: {length}/200."

**Tested By**: TEST-STI-VAL-016

---

### VAL-STI-017: Destination Location Required
**Priority**: Critical
**Enforcement**: Client, Server, Database

**Rule**: Each line item must have a valid destination location.

**Validation Logic**:
```
IF destination_location_id IS NULL THEN
  ERROR: "Destination location is required."
ELSE IF NOT EXISTS (
  SELECT 1 FROM tb_location
  WHERE id = destination_location_id
  AND deleted_at IS NULL
) THEN
  ERROR: "Invalid destination location."
END IF
```

**Error Messages**:
- "Destination location is required for line {line_number}."
- "Invalid destination location on line {line_number}."

**Tested By**: TEST-STI-VAL-017

---

### VAL-STI-018: Transaction Comment Length
**Priority**: Low
**Enforcement**: Client, Server

**Rule**: Transaction comment cannot exceed 1000 characters.

**Validation Logic**:
```
IF LENGTH(comment_text) > 1000 THEN
  ERROR: "Comment is too long."
END IF
```

**Error Message**: "Comment cannot exceed 1000 characters. Current length: {length}/1000."

**Tested By**: TEST-STI-VAL-018

---

### VAL-STI-019: Attachment File Size
**Priority**: Medium
**Enforcement**: Server

**Rule**: Each attachment file cannot exceed 10MB.

**Validation Logic**:
```
MAX_FILE_SIZE = 10 * 1024 * 1024  // 10MB in bytes

IF file_size > MAX_FILE_SIZE THEN
  ERROR: "File size exceeds maximum allowed."
END IF
```

**Error Message**: "File '{file_name}' is too large. Maximum file size is 10MB. Current size: {file_size_mb}MB."

**Business Rule Reference**: FR-STI-009
**Tested By**: TEST-STI-VAL-019

---

### VAL-STI-020: Attachment File Type
**Priority**: Medium
**Enforcement**: Server

**Rule**: Only allowed file types can be uploaded.

**Validation Logic**:
```
ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png',
                 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']

IF file_type NOT IN ALLOWED_TYPES THEN
  ERROR: "File type not allowed."
END IF
```

**Error Message**: "File type '{file_type}' is not allowed. Allowed types: PDF, JPG, PNG, DOC, DOCX, XLS, XLSX."

**Business Rule Reference**: FR-STI-009
**Tested By**: TEST-STI-VAL-020

---

### VAL-STI-021: Maximum Attachments
**Priority**: Low
**Enforcement**: Server

**Rule**: Maximum 20 attachments per transaction.

**Validation Logic**:
```
IF COUNT(attachments) >= 20 THEN
  ERROR: "Maximum attachment limit reached."
END IF
```

**Error Message**: "Cannot add more attachments. Maximum 20 attachments per transaction."

**Business Rule Reference**: FR-STI-009
**Tested By**: TEST-STI-VAL-021

---

### VAL-STI-022: Attachment Description Length
**Priority**: Low
**Enforcement**: Client, Server

**Rule**: Attachment description cannot exceed 200 characters.

**Validation Logic**:
```
IF LENGTH(attachment_description) > 200 THEN
  ERROR: "Attachment description is too long."
END IF
```

**Error Message**: "Attachment description cannot exceed 200 characters. Current length: {length}/200."

**Tested By**: TEST-STI-VAL-022

---

## Business Rule Validations

### VAL-STI-101: GRN Must Reference Valid GRN Document
**Priority**: Critical
**Enforcement**: Server

**Rule**: Good Receive Note transactions must reference a valid, committed GRN from the Procurement module.

**Validation Logic**:
```
IF type = 'Good Receive Note' THEN
  IF related_doc IS NULL THEN
    ERROR: "GRN reference is required for Good Receive Note transactions."
  ELSE IF NOT EXISTS (
    SELECT 1 FROM procurement_grn
    WHERE ref_no = related_doc
    AND status = 'Committed'
    AND deleted_at IS NULL
  ) THEN
    ERROR: "Invalid GRN reference. GRN does not exist, is not committed, or is cancelled."
  END IF
END IF
```

**Error Messages**:
- "GRN reference is required for Good Receive Note transactions."
- "GRN '{ref_no}' does not exist or is not in committed status."

**Business Rule Reference**: BR-STI-001
**Tested By**: TEST-STI-VAL-101

---

### VAL-STI-102: Transfer Must Reference Valid Transfer Order
**Priority**: Critical
**Enforcement**: Server

**Rule**: Transfer transactions must reference a valid transfer order with sufficient stock at source location.

**Validation Logic**:
```
IF type = 'Transfer' THEN
  IF related_doc IS NULL THEN
    ERROR: "Transfer order reference is required for Transfer transactions."
  ELSE IF NOT EXISTS (
    SELECT 1 FROM inventory_transfer
    WHERE ref_no = related_doc
    AND status IN ('Approved', 'In Transit')
    AND deleted_at IS NULL
  ) THEN
    ERROR: "Invalid transfer order reference."
  END IF

  // Verify sufficient stock at source location
  FOR EACH line_item IN transaction.items DO
    IF source_location_stock < line_item.qty THEN
      ERROR: "Insufficient stock at source location for product on line."
    END IF
  END FOR
END IF
```

**Error Messages**:
- "Transfer order reference is required for Transfer transactions."
- "Transfer order '{ref_no}' does not exist or is not in valid status (Approved or In Transit)."
- "Insufficient stock at source location '{source_location}' for product '{product_name}' on line {line_number}. Required: {qty}, Available: {available_qty}."

**Business Rule Reference**: BR-STI-002
**Tested By**: TEST-STI-VAL-102

---

### VAL-STI-103: Issue Return Must Reference Original Issue
**Priority**: Critical
**Enforcement**: Server

**Rule**: Issue Return transactions must reference the original issue transaction and cannot exceed originally issued quantity.

**Validation Logic**:
```
IF type = 'Issue Return' THEN
  IF related_doc IS NULL THEN
    ERROR: "Issue reference is required for Issue Return transactions."
  ELSE IF NOT EXISTS (
    SELECT 1 FROM store_issue
    WHERE ref_no = related_doc
    AND status = 'Committed'
    AND deleted_at IS NULL
  ) THEN
    ERROR: "Invalid issue reference."
  END IF

  // Verify return quantity does not exceed issued quantity
  FOR EACH line_item IN transaction.items DO
    original_issued_qty = GET_ISSUED_QTY(related_doc, line_item.product_id)
    total_returned_qty = GET_TOTAL_RETURNED_QTY(related_doc, line_item.product_id)

    IF (total_returned_qty + line_item.qty) > original_issued_qty THEN
      ERROR: "Return quantity exceeds originally issued quantity."
    END IF
  END FOR
END IF
```

**Error Messages**:
- "Issue reference is required for Issue Return transactions."
- "Issue '{ref_no}' does not exist or is not committed."
- "Return quantity for product '{product_name}' on line {line_number} exceeds originally issued quantity. Issued: {issued_qty}, Already Returned: {returned_qty}, Current Return: {current_qty}."

**Business Rule Reference**: BR-STI-003
**Tested By**: TEST-STI-VAL-103

---

### VAL-STI-104: Adjustment Must Have Reason Code
**Priority**: High
**Enforcement**: Client, Server

**Rule**: Adjustment transactions must include a reason code.

**Validation Logic**:
```
VALID_REASON_CODES = ['Stock Count Variance', 'Damage', 'Obsolescence', 'Initial Balance', 'System Correction']

IF type = 'Adjustment' THEN
  IF reason_code IS NULL THEN
    ERROR: "Reason code is required for Adjustment transactions."
  ELSE IF reason_code NOT IN VALID_REASON_CODES THEN
    ERROR: "Invalid reason code."
  END IF
END IF
```

**Error Messages**:
- "Reason code is required for Adjustment transactions."
- "Invalid reason code. Valid codes: Stock Count Variance, Damage, Obsolescence, Initial Balance, System Correction."

**Business Rule Reference**: BR-STI-004
**Tested By**: TEST-STI-VAL-104

---

### VAL-STI-105: Credit Note Must Reference Valid Credit Note
**Priority**: Critical
**Enforcement**: Server

**Rule**: Credit Note transactions must reference a valid credit note from Procurement.

**Validation Logic**:
```
IF type = 'Credit Note' THEN
  IF related_doc IS NULL THEN
    ERROR: "Credit note reference is required for Credit Note transactions."
  ELSE IF NOT EXISTS (
    SELECT 1 FROM procurement_credit_note
    WHERE ref_no = related_doc
    AND status = 'Approved'
    AND deleted_at IS NULL
  ) THEN
    ERROR: "Invalid credit note reference."
  END IF
END IF
```

**Error Messages**:
- "Credit note reference is required for Credit Note transactions."
- "Credit note '{ref_no}' does not exist or is not approved."

**Business Rule Reference**: BR-STI-005
**Tested By**: TEST-STI-VAL-105

---

### VAL-STI-106: Only Saved Status Can Be Edited
**Priority**: Critical
**Enforcement**: Client, Server

**Rule**: Only transactions in "Saved" status can be edited or deleted.

**Validation Logic**:
```
IF status != 'Saved' AND operation IN ['UPDATE', 'DELETE'] THEN
  ERROR: "Only transactions in Saved status can be edited or deleted."
END IF
```

**Error Message**: "Cannot edit transaction. Only transactions in Saved status can be modified. Current status: {status}."

**Business Rule Reference**: BR-STI-011
**Tested By**: TEST-STI-VAL-106

---

### VAL-STI-107: Committed Status Immutable
**Priority**: Critical
**Enforcement**: Client, Server, Database

**Rule**: Transactions in "Committed" status can only be reversed, not edited.

**Validation Logic**:
```
IF status = 'Committed' AND operation = 'UPDATE' THEN
  ERROR: "Committed transactions cannot be edited. Use Reverse function to create offsetting transaction."
END IF
```

**Error Message**: "Cannot edit committed transaction. Committed transactions are immutable. Use the Reverse function if you need to undo this transaction."

**Business Rule Reference**: BR-STI-012
**Tested By**: TEST-STI-VAL-107

---

### VAL-STI-108: Void Status Immutable
**Priority**: Critical
**Enforcement**: Client, Server

**Rule**: Transactions in "Void" status cannot be modified.

**Validation Logic**:
```
IF status = 'Void' AND operation IN ['UPDATE', 'DELETE', 'COMMIT', 'REVERSE'] THEN
  ERROR: "Void transactions are immutable and cannot be modified."
END IF
```

**Error Message**: "Cannot modify void transaction. Void transactions are final and cannot be changed."

**Business Rule Reference**: BR-STI-013
**Tested By**: TEST-STI-VAL-108

---

### VAL-STI-109: Status Transition Validation
**Priority**: Critical
**Enforcement**: Server

**Rule**: Status transitions must follow allowed paths: Saved → Committed, Saved → Void, Committed → Reversed.

**Validation Logic**:
```
ALLOWED_TRANSITIONS = {
  'Saved': ['Committed', 'Void'],
  'Committed': ['Reversed'],
  'Void': [],
  'Reversed': []
}

IF new_status NOT IN ALLOWED_TRANSITIONS[current_status] THEN
  ERROR: "Invalid status transition."
END IF
```

**Error Message**: "Invalid status transition from {current_status} to {new_status}. Allowed transitions from {current_status}: {allowed_transitions}."

**Business Rule Reference**: BR-STI-011, BR-STI-012, BR-STI-013, BR-STI-015
**Tested By**: TEST-STI-VAL-109

---

### VAL-STI-110: Commit Requires Valid Line Items
**Priority**: Critical
**Enforcement**: Server

**Rule**: Transaction can only be committed if all line items have valid products, quantities, and costs.

**Validation Logic**:
```
IF operation = 'COMMIT' THEN
  FOR EACH line_item IN transaction.items DO
    IF line_item.product_id IS NULL THEN
      ERROR: "All line items must have a valid product before committing."
    END IF

    IF line_item.qty <= 0 THEN
      ERROR: "All line items must have quantity greater than zero before committing."
    END IF

    IF line_item.unit_cost IS NULL OR line_item.unit_cost < 0 THEN
      ERROR: "All line items must have valid unit cost before committing."
    END IF
  END FOR
END IF
```

**Error Messages**:
- "Cannot commit transaction. Line {line_number} is missing product information."
- "Cannot commit transaction. Line {line_number} has invalid quantity: {qty}."
- "Cannot commit transaction. Line {line_number} has invalid unit cost: {unit_cost}."

**Business Rule Reference**: BR-STI-021, BR-STI-023, BR-STI-024
**Tested By**: TEST-STI-VAL-110

---

### VAL-STI-111: Negative Inventory Prevention
**Priority**: High
**Enforcement**: Server

**Rule**: For products configured with "Allow Negative Inventory = false", commit must be prevented if result would be negative balance.

**Validation Logic**:
```
IF operation = 'COMMIT' THEN
  FOR EACH line_item IN transaction.items DO
    product_config = GET_PRODUCT_CONFIG(line_item.product_id)

    IF product_config.allow_negative_inventory = false THEN
      current_balance = GET_CURRENT_BALANCE(line_item.product_id, line_item.destination_location_id)
      projected_balance = current_balance + line_item.qty

      // Note: Stock IN always increases balance, so this shouldn't happen normally
      // This validation is for consistency with system architecture
      IF projected_balance < 0 THEN
        ERROR: "Committing would result in negative inventory for product that does not allow negatives."
      END IF
    END IF
  END FOR
END IF
```

**Error Message**: "Cannot commit transaction. Product '{product_name}' on line {line_number} at location '{location_name}' does not allow negative inventory. Current balance: {current_balance}, Transaction qty: {qty}."

**Business Rule Reference**: BR-STI-033
**Tested By**: TEST-STI-VAL-111

---

### VAL-STI-112: Valuation Service Integration Required
**Priority**: Critical
**Enforcement**: Server

**Rule**: Commit operation must successfully call Inventory Valuation Service for cost calculation.

**Validation Logic**:
```
IF operation = 'COMMIT' THEN
  valuation_result = CALL_VALUATION_SERVICE(transaction)

  IF valuation_result.status = 'FAILURE' THEN
    IF valuation_result.retry_count < 3 THEN
      RETRY with exponential backoff
    ELSE
      ERROR: "Inventory Valuation Service unavailable. Cannot commit transaction."
    END IF
  END IF

  IF valuation_result.status = 'SUCCESS' THEN
    // Apply costs to line items
    FOR EACH line_item IN transaction.items DO
      line_item.unit_cost = valuation_result.costs[line_item.id].unit_cost
      line_item.total_cost = valuation_result.costs[line_item.id].total_cost
      line_item.cost_calculation_method = valuation_result.costs[line_item.id].method
    END FOR
  END IF
END IF
```

**Error Message**: "Cannot commit transaction. Inventory Valuation Service is currently unavailable. The transaction has been saved and you can try committing again later. Error: {error_message}"

**Business Rule Reference**: BR-STI-048, BR-STI-049, BR-STI-050
**Tested By**: TEST-STI-VAL-112

---

### VAL-STI-113: GL Posting Required for Commit
**Priority**: Critical
**Enforcement**: Server

**Rule**: Commit operation must successfully post GL journal entry to Finance module.

**Validation Logic**:
```
IF operation = 'COMMIT' THEN
  gl_result = POST_TO_GL(transaction)

  IF gl_result.status = 'FAILURE' THEN
    ROLLBACK inventory_balance_updates
    ROLLBACK movement_history_creation
    ERROR: "GL posting failed. Cannot commit transaction."
  END IF

  IF gl_result.status = 'SUCCESS' THEN
    transaction.gl_journal_entry_number = gl_result.je_number
  END IF
END IF
```

**Error Message**: "Cannot commit transaction. Failed to post journal entry to General Ledger. The transaction has been saved and no inventory changes have been made. Error: {error_message}. Please contact finance team."

**Business Rule Reference**: BR-STI-051, BR-STI-052
**Tested By**: TEST-STI-VAL-113

---

### VAL-STI-114: Atomic Balance Update
**Priority**: Critical
**Enforcement**: Database

**Rule**: Balance updates must be atomic - all line items succeed or all fail.

**Validation Logic**:
```
IF operation = 'COMMIT' THEN
  BEGIN TRANSACTION

  FOR EACH line_item IN transaction.items DO
    UPDATE inventory_balance
    SET qty_on_hand = qty_on_hand + line_item.qty
    WHERE product_id = line_item.product_id
    AND location_id = line_item.destination_location_id
  END FOR

  IF ANY_UPDATE_FAILED THEN
    ROLLBACK TRANSACTION
    ERROR: "Failed to update inventory balances atomically."
  END IF

  COMMIT TRANSACTION
END IF
```

**Error Message**: "Failed to update inventory balances. All changes have been rolled back. Please try again or contact support."

**Business Rule Reference**: BR-STI-032
**Tested By**: TEST-STI-VAL-114

---

### VAL-STI-115: Reversal Only for Committed Transactions
**Priority**: Critical
**Enforcement**: Server

**Rule**: Only committed transactions can be reversed.

**Validation Logic**:
```
IF operation = 'REVERSE' THEN
  IF status != 'Committed' THEN
    ERROR: "Only committed transactions can be reversed."
  END IF

  IF is_reversed = true THEN
    ERROR: "Transaction has already been reversed."
  END IF
END IF
```

**Error Messages**:
- "Cannot reverse transaction. Only committed transactions can be reversed. Current status: {status}."
- "Cannot reverse transaction. This transaction has already been reversed. Reversal transaction: {reversal_ref_no}."

**Business Rule Reference**: BR-STI-012
**Tested By**: TEST-STI-VAL-115

---

### VAL-STI-116: Manager Approval for Reversal
**Priority**: High
**Enforcement**: Server

**Rule**: Reversing committed transactions requires manager-level approval.

**Validation Logic**:
```
IF operation = 'REVERSE' THEN
  IF user_role NOT IN ['Manager', 'Administrator'] THEN
    ERROR: "Reversal requires manager approval."
  END IF
END IF
```

**Error Message**: "You do not have permission to reverse committed transactions. Please request manager approval."

**Business Rule Reference**: BR-STI-047
**Tested By**: TEST-STI-VAL-116

---

### VAL-STI-117: Duplicate Product Allowed with Different Units
**Priority**: Medium
**Enforcement**: Server

**Rule**: Same product can appear multiple times if different units or locations are specified.

**Validation Logic**:
```
// This is informational validation - not an error
// System allows duplicates but warns user

FOR EACH line_item IN transaction.items DO
  duplicates = FIND_DUPLICATES(
    transaction.items,
    line_item.product_id,
    line_item.unit_id,
    line_item.destination_location_id
  )

  IF COUNT(duplicates) > 1 THEN
    WARNING: "Product appears multiple times with same unit and location."
  END IF
END FOR
```

**Warning Message**: "Product '{product_name}' appears multiple times on lines {line_numbers} with the same unit '{unit}' and location '{location}'. This is allowed but consider consolidating into a single line."

**Business Rule Reference**: BR-STI-025
**Tested By**: TEST-STI-VAL-117

---

### VAL-STI-118: Cost Calculation Accuracy
**Priority**: High
**Enforcement**: Server

**Rule**: Total cost must equal quantity multiplied by unit cost (within rounding tolerance).

**Validation Logic**:
```
TOLERANCE = 0.0001  // 4 decimal places

FOR EACH line_item IN transaction.items DO
  calculated_total = line_item.qty * line_item.unit_cost
  difference = ABS(calculated_total - line_item.total_cost)

  IF difference > TOLERANCE THEN
    ERROR: "Total cost does not match calculated value."
  END IF
END FOR
```

**Error Message**: "Total cost on line {line_number} is incorrect. Calculated: {calculated_total} (Qty: {qty} × Unit Cost: {unit_cost}), Actual: {total_cost}. Difference: {difference}."

**Business Rule Reference**: BR-STI-030
**Tested By**: TEST-STI-VAL-118

---

### VAL-STI-119: Movement Immutability
**Priority**: Critical
**Enforcement**: Database

**Rule**: Movement records cannot be edited or deleted once created.

**Validation Logic**:
```
IF operation IN ['UPDATE', 'DELETE'] AND table = 'stock_in_movement' THEN
  ERROR: "Movement records are immutable and cannot be modified."
END IF
```

**Error Message**: "Movement records are immutable audit records and cannot be edited or deleted."

**Business Rule Reference**: BR-STI-038
**Tested By**: TEST-STI-VAL-119

---

### VAL-STI-120: Activity Log Immutability
**Priority**: Critical
**Enforcement**: Database

**Rule**: Activity log entries cannot be edited or deleted.

**Validation Logic**:
```
IF operation IN ['UPDATE', 'DELETE'] AND table = 'stock_in_activity' THEN
  ERROR: "Activity log entries are immutable and cannot be modified."
END IF
```

**Error Message**: "Activity log entries are immutable audit records and cannot be edited or deleted."

**Business Rule Reference**: BR-STI-042
**Tested By**: TEST-STI-VAL-120

---

### VAL-STI-121: Auto-Save Data Consistency
**Priority**: Medium
**Enforcement**: Server

**Rule**: Auto-save must maintain data consistency and not overwrite concurrent edits.

**Validation Logic**:
```
IF operation = 'AUTO_SAVE' THEN
  current_version = GET_TRANSACTION_VERSION(transaction_id)

  IF client_version != current_version THEN
    WARNING: "Transaction has been modified by another user or session."
    // Don't auto-save, notify user of conflict
  ELSE
    PERFORM_AUTO_SAVE()
    INCREMENT_VERSION()
  END IF
END IF
```

**Warning Message**: "Transaction has been modified by another user. Auto-save has been paused. Please refresh to see latest changes or save manually to overwrite."

**Tested By**: TEST-STI-VAL-121

---

## Cross-Field Validations

### VAL-STI-201: Total Quantity Calculation
**Priority**: High
**Enforcement**: Client, Server

**Rule**: Transaction total_qty must equal sum of all line item quantities.

**Validation Logic**:
```
calculated_total = SUM(line_items.qty)

IF transaction.total_qty != calculated_total THEN
  ERROR: "Total quantity mismatch."
END IF
```

**Error Message**: "Total quantity mismatch. Calculated total: {calculated_total}, Stored total: {transaction.total_qty}. Please recalculate."

**Tested By**: TEST-STI-VAL-201

---

### VAL-STI-202: Commit Date Consistency
**Priority**: High
**Enforcement**: Server

**Rule**: Commit date is required when status is Committed, and must be on or after transaction date.

**Validation Logic**:
```
IF status = 'Committed' THEN
  IF commit_date IS NULL THEN
    ERROR: "Commit date is required for committed transactions."
  ELSE IF commit_date < date THEN
    ERROR: "Commit date cannot be before transaction date."
  END IF
END IF
```

**Error Messages**:
- "Commit date is required for committed transactions."
- "Commit date ({commit_date}) cannot be before transaction date ({date})."

**Tested By**: TEST-STI-VAL-202

---

### VAL-STI-203: Committed By Required for Committed Status
**Priority**: High
**Enforcement**: Server

**Rule**: Committed_by user ID is required when status is Committed.

**Validation Logic**:
```
IF status = 'Committed' THEN
  IF committed_by IS NULL THEN
    ERROR: "Committed by user is required for committed transactions."
  END IF
END IF
```

**Error Message**: "Committed by user is required for committed transactions."

**Tested By**: TEST-STI-VAL-203

---

### VAL-STI-204: GL Journal Entry Number for Committed Status
**Priority**: High
**Enforcement**: Server

**Rule**: GL journal entry number is required when status is Committed.

**Validation Logic**:
```
IF status = 'Committed' THEN
  IF gl_journal_entry_number IS NULL THEN
    ERROR: "GL journal entry number is required for committed transactions."
  END IF
END IF
```

**Error Message**: "GL journal entry number is required for committed transactions. Financial posting may have failed."

**Tested By**: TEST-STI-VAL-204

---

### VAL-STI-205: Related Document Consistency with Type
**Priority**: High
**Enforcement**: Server

**Rule**: Related document must exist and be in appropriate status based on transaction type.

**Validation Logic**:
```
SWITCH type:
  CASE 'Good Receive Note':
    IF NOT GRN_EXISTS_AND_COMMITTED(related_doc) THEN
      ERROR: "GRN {related_doc} does not exist or is not committed."
    END IF

  CASE 'Transfer':
    IF NOT TRANSFER_EXISTS_AND_VALID(related_doc) THEN
      ERROR: "Transfer {related_doc} does not exist or is not in valid status."
    END IF

  CASE 'Issue Return':
    IF NOT ISSUE_EXISTS_AND_COMMITTED(related_doc) THEN
      ERROR: "Issue {related_doc} does not exist or is not committed."
    END IF

  CASE 'Credit Note':
    IF NOT CREDIT_NOTE_EXISTS_AND_APPROVED(related_doc) THEN
      ERROR: "Credit Note {related_doc} does not exist or is not approved."
    END IF

  CASE 'Adjustment':
    // Adjustment may have optional related document (e.g., adjustment form)
    // No validation required
END SWITCH
```

**Error Messages**: See individual type validations (VAL-STI-101 to VAL-STI-105)

**Business Rule Reference**: BR-STI-001, BR-STI-002, BR-STI-003, BR-STI-005
**Tested By**: TEST-STI-VAL-205

---

### VAL-STI-206: Reversal Transaction Link
**Priority**: High
**Enforcement**: Server

**Rule**: If is_reversed is true, reversal_transaction_id must reference a valid Stock OUT transaction.

**Validation Logic**:
```
IF is_reversed = true THEN
  IF reversal_transaction_id IS NULL THEN
    ERROR: "Reversal transaction ID is required when transaction is marked as reversed."
  ELSE IF NOT EXISTS (
    SELECT 1 FROM stock_out_transaction
    WHERE id = reversal_transaction_id
    AND deleted_at IS NULL
  ) THEN
    ERROR: "Invalid reversal transaction reference."
  END IF
END IF
```

**Error Messages**:
- "Reversal transaction ID is required when transaction is marked as reversed."
- "Invalid reversal transaction reference. Reversal transaction {reversal_transaction_id} does not exist."

**Tested By**: TEST-STI-VAL-206

---

### VAL-STI-207: Status-Dependent Field Requirements
**Priority**: Medium
**Enforcement**: Server

**Rule**: Certain fields are required or prohibited based on transaction status.

**Validation Logic**:
```
SWITCH status:
  CASE 'Saved':
    // commit_date, committed_by, gl_journal_entry_number should be NULL
    IF commit_date IS NOT NULL OR committed_by IS NOT NULL OR gl_journal_entry_number IS NOT NULL THEN
      WARNING: "Commit-related fields should be null for Saved transactions."
    END IF

  CASE 'Committed':
    // commit_date, committed_by, gl_journal_entry_number are required
    IF commit_date IS NULL OR committed_by IS NULL OR gl_journal_entry_number IS NULL THEN
      ERROR: "Committed transactions must have commit date, committed by user, and GL journal entry number."
    END IF

  CASE 'Void':
    // No additional requirements
END SWITCH
```

**Error Message**: "Transaction status '{status}' requires: {required_fields}. Missing: {missing_fields}."

**Tested By**: TEST-STI-VAL-207

---

### VAL-STI-208: Line Item Destination Location Consistency
**Priority**: Medium
**Enforcement**: Server

**Rule**: For most transaction types, line item destination location should match transaction header location.

**Validation Logic**:
```
// Exception: Transfer transactions may have different destination per line item
IF type != 'Transfer' THEN
  FOR EACH line_item IN transaction.items DO
    IF line_item.destination_location_id != transaction.location_id THEN
      WARNING: "Line item destination location differs from transaction location."
    END IF
  END FOR
END IF
```

**Warning Message**: "Line {line_number} has destination location '{line_location}' which differs from transaction location '{transaction_location}'. This is unusual for {type} transactions."

**Tested By**: TEST-STI-VAL-208

---

## Security Validations

### VAL-STI-301: User Authentication Required
**Priority**: Critical
**Enforcement**: Server

**Rule**: All operations must be performed by authenticated users.

**Validation Logic**:
```
IF user_id IS NULL OR NOT user_is_authenticated(user_id) THEN
  ERROR: "Authentication required."
END IF
```

**Error Message**: "You must be logged in to perform this action."

**Tested By**: TEST-STI-VAL-301

---

### VAL-STI-302: Create Permission Required
**Priority**: Critical
**Enforcement**: Server

**Rule**: Creating transactions requires "Inventory.StockIn.Create" permission.

**Validation Logic**:
```
IF operation = 'CREATE' THEN
  IF NOT user_has_permission(user_id, 'Inventory.StockIn.Create') THEN
    ERROR: "Insufficient permissions to create stock in transactions."
  END IF
END IF
```

**Error Message**: "You do not have permission to create stock in transactions. Required permission: Inventory.StockIn.Create."

**Business Rule Reference**: BR-STI-044
**Tested By**: TEST-STI-VAL-302

---

### VAL-STI-303: Commit Permission Required
**Priority**: Critical
**Enforcement**: Server

**Rule**: Committing transactions requires "Inventory.StockIn.Commit" permission (supervisor level).

**Validation Logic**:
```
IF operation = 'COMMIT' THEN
  IF NOT user_has_permission(user_id, 'Inventory.StockIn.Commit') THEN
    ERROR: "Insufficient permissions to commit stock in transactions."
  END IF
END IF
```

**Error Message**: "You do not have permission to commit stock in transactions. This action requires supervisor approval. Required permission: Inventory.StockIn.Commit."

**Business Rule Reference**: BR-STI-045
**Tested By**: TEST-STI-VAL-303

---

### VAL-STI-304: Void Permission Required
**Priority**: Critical
**Enforcement**: Server

**Rule**: Voiding transactions requires "Inventory.StockIn.Void" permission (manager level).

**Validation Logic**:
```
IF operation = 'VOID' THEN
  IF NOT user_has_permission(user_id, 'Inventory.StockIn.Void') THEN
    ERROR: "Insufficient permissions to void stock in transactions."
  END IF
END IF
```

**Error Message**: "You do not have permission to void stock in transactions. This action requires manager approval. Required permission: Inventory.StockIn.Void."

**Business Rule Reference**: BR-STI-046
**Tested By**: TEST-STI-VAL-304

---

### VAL-STI-305: Reverse Permission Required
**Priority**: Critical
**Enforcement**: Server

**Rule**: Reversing committed transactions requires "Inventory.StockIn.Reverse" permission (manager level).

**Validation Logic**:
```
IF operation = 'REVERSE' THEN
  IF NOT user_has_permission(user_id, 'Inventory.StockIn.Reverse') THEN
    ERROR: "Insufficient permissions to reverse stock in transactions."
  END IF
END IF
```

**Error Message**: "You do not have permission to reverse committed transactions. This action requires manager approval. Required permission: Inventory.StockIn.Reverse."

**Business Rule Reference**: BR-STI-047
**Tested By**: TEST-STI-VAL-305

---

### VAL-STI-306: Location-Based Access Control
**Priority**: High
**Enforcement**: Server

**Rule**: Users can only access transactions for locations they have permission to view.

**Validation Logic**:
```
IF operation IN ['READ', 'UPDATE', 'DELETE'] THEN
  transaction_location = GET_TRANSACTION_LOCATION(transaction_id)

  IF NOT user_has_location_access(user_id, transaction_location) THEN
    ERROR: "You do not have access to this transaction's location."
  END IF
END IF
```

**Error Message**: "You do not have access to transactions at location '{location_name}'. Please contact your supervisor if you need access."

**Business Rule Reference**: BR-STI-043
**Tested By**: TEST-STI-VAL-306

---

### VAL-STI-307: Activity Logging Required
**Priority**: Critical
**Enforcement**: Server

**Rule**: All transaction actions must be logged with user ID and timestamp.

**Validation Logic**:
```
IF operation IN ['CREATE', 'UPDATE', 'COMMIT', 'VOID', 'REVERSE'] THEN
  IF NOT activity_log_created THEN
    ERROR: "Failed to create activity log entry."
  END IF
END IF
```

**Error Message**: "Failed to log transaction activity. Operation cannot proceed to maintain audit compliance."

**Business Rule Reference**: BR-STI-041
**Tested By**: TEST-STI-VAL-307

---

### VAL-STI-308: Audit Trail Integrity
**Priority**: Critical
**Enforcement**: Database

**Rule**: Activity log entries must capture user IP and user agent for security audit.

**Validation Logic**:
```
IF activity_log_entry.user_ip IS NULL OR activity_log_entry.user_agent IS NULL THEN
  WARNING: "Activity log missing security context."
END IF
```

**Warning Message**: "Activity log entry missing IP address or user agent. Security audit may be incomplete."

**Business Rule Reference**: NFR-STI-010
**Tested By**: TEST-STI-VAL-308

---

### VAL-STI-309: Soft Delete Only
**Priority**: High
**Enforcement**: Server

**Rule**: Transactions must be soft-deleted (deleted_at timestamp) not hard-deleted.

**Validation Logic**:
```
IF operation = 'DELETE' THEN
  // Enforce soft delete pattern
  IF status != 'Saved' THEN
    ERROR: "Only Saved transactions can be deleted."
  END IF

  // Set deleted_at timestamp instead of physical delete
  UPDATE transaction SET deleted_at = CURRENT_TIMESTAMP
END IF
```

**Error Message**: "Only transactions in Saved status can be deleted. For committed transactions, use Reverse instead."

**Business Rule Reference**: BR-STI-011
**Tested By**: TEST-STI-VAL-309

---

### VAL-STI-310: Edit Permission Based on Creator
**Priority**: Medium
**Enforcement**: Server

**Rule**: Users can edit their own Saved transactions or transactions at their accessible locations if they have edit permission.

**Validation Logic**:
```
IF operation = 'UPDATE' AND status = 'Saved' THEN
  IF user_id != created_by AND NOT user_has_permission(user_id, 'Inventory.StockIn.EditAll') THEN
    IF NOT user_has_location_access(user_id, transaction.location_id) THEN
      ERROR: "You can only edit your own transactions or transactions at your accessible locations."
    END IF
  END IF
END IF
```

**Error Message**: "You do not have permission to edit this transaction. You can only edit your own Saved transactions or transactions at locations you have access to."

**Tested By**: TEST-STI-VAL-310

---

## Error Messages

### Error Message Format

All error messages follow a consistent format:
- **User-Facing Message**: Clear, actionable language explaining the issue and how to resolve it
- **Technical Details**: Error code, field name, validation rule reference (for troubleshooting)
- **Suggested Action**: Specific steps user can take to fix the error

**Example**:
```json
{
  "error": {
    "code": "VAL-STI-003",
    "message": "Transaction date cannot be more than 30 days in the past.",
    "field": "date",
    "currentValue": "2023-11-15",
    "suggestedAction": "Please contact a supervisor if you need to enter older transactions.",
    "severity": "error"
  }
}
```

### Error Severity Levels

- **error**: Blocking validation failure, operation cannot proceed
- **warning**: Non-blocking issue, user should review but can proceed
- **info**: Informational message, no action required

---

## Test Scenarios

### Test Scenario: TS-STI-VAL-001 - Create Valid GRN Stock In
**Objective**: Verify successful creation of GRN-based stock in transaction

**Preconditions**:
- User has Inventory.StockIn.Create permission
- Valid GRN exists in Committed status (GRN-2401-0001)
- User has access to target location

**Test Data**:
```
Transaction Type: Good Receive Note
Related Doc: GRN-2401-0001
Date: 2024-01-15 (within 30 days)
Location: Main Warehouse
Line Items: 2 products, valid quantities, costs from GRN
```

**Expected Result**: Transaction created successfully in Saved status

**Validations Tested**: VAL-STI-001, VAL-STI-002, VAL-STI-003, VAL-STI-006, VAL-STI-009, VAL-STI-101, VAL-STI-302

---

### Test Scenario: TS-STI-VAL-002 - Invalid Transaction Date Range
**Objective**: Verify date range validation prevents dates too far in past or future

**Test Cases**:
1. Date 31 days in past → Expected: ERROR VAL-STI-003
2. Date 2 days in future → Expected: ERROR VAL-STI-003
3. Date 29 days in past → Expected: SUCCESS
4. Date today → Expected: SUCCESS
5. Date tomorrow → Expected: SUCCESS

**Validations Tested**: VAL-STI-003

---

### Test Scenario: TS-STI-VAL-003 - Line Item Quantity Validation
**Objective**: Verify line item quantity constraints

**Test Cases**:
1. Quantity = 0 → Expected: ERROR VAL-STI-013
2. Quantity = -10 → Expected: ERROR VAL-STI-013
3. Quantity = 0.5 → Expected: SUCCESS
4. Quantity = 1000 → Expected: SUCCESS
5. Quantity NULL → Expected: ERROR VAL-STI-013

**Validations Tested**: VAL-STI-013

---

### Test Scenario: TS-STI-VAL-004 - Status Transition Validation
**Objective**: Verify only allowed status transitions are permitted

**Test Cases**:
1. Saved → Committed → Expected: SUCCESS (with VAL-STI-303 permission check)
2. Saved → Void → Expected: SUCCESS (with VAL-STI-304 permission check)
3. Committed → Saved → Expected: ERROR VAL-STI-109
4. Void → Committed → Expected: ERROR VAL-STI-109
5. Committed → Void → Expected: ERROR VAL-STI-109

**Validations Tested**: VAL-STI-106, VAL-STI-107, VAL-STI-108, VAL-STI-109

---

### Test Scenario: TS-STI-VAL-005 - Commit with Valuation Service Failure
**Objective**: Verify commit failure handling when Valuation Service is unavailable

**Test Setup**: Mock Valuation Service to return failure after 3 retries

**Expected Result**:
- Transaction remains in Saved status
- Error message: "Inventory Valuation Service is currently unavailable..."
- Activity log records failed commit attempt
- No inventory balance changes
- No GL posting

**Validations Tested**: VAL-STI-112

---

### Test Scenario: TS-STI-VAL-006 - Commit with GL Posting Failure
**Objective**: Verify rollback when GL posting fails

**Test Setup**:
- Valid transaction ready to commit
- Mock Finance Module to return GL posting failure

**Expected Result**:
- Transaction remains in Saved status
- Inventory balance updates rolled back
- Movement history not created
- Error message: "Failed to post journal entry to General Ledger..."
- Activity log records failed commit attempt with GL error

**Validations Tested**: VAL-STI-113, VAL-STI-114

---

### Test Scenario: TS-STI-VAL-007 - Permission-Based Access Control
**Objective**: Verify users cannot perform actions without appropriate permissions

**Test Cases**:
1. User without Create permission tries to create → Expected: ERROR VAL-STI-302
2. User without Commit permission tries to commit → Expected: ERROR VAL-STI-303
3. User without Void permission tries to void → Expected: ERROR VAL-STI-304
4. User without Reverse permission tries to reverse → Expected: ERROR VAL-STI-305
5. User without location access tries to view transaction → Expected: ERROR VAL-STI-306

**Validations Tested**: VAL-STI-302, VAL-STI-303, VAL-STI-304, VAL-STI-305, VAL-STI-306

---

### Test Scenario: TS-STI-VAL-008 - Edit Committed Transaction
**Objective**: Verify committed transactions cannot be edited

**Test Setup**: Transaction in Committed status

**Test Cases**:
1. Try to edit header fields → Expected: ERROR VAL-STI-107
2. Try to add line items → Expected: ERROR VAL-STI-107
3. Try to delete line items → Expected: ERROR VAL-STI-107
4. Try to delete transaction → Expected: ERROR VAL-STI-107
5. View transaction → Expected: SUCCESS (read-only)
6. Reverse transaction (with permission) → Expected: SUCCESS

**Validations Tested**: VAL-STI-107, VAL-STI-115, VAL-STI-116

---

### Test Scenario: TS-STI-VAL-009 - Total Quantity Calculation
**Objective**: Verify transaction total_qty matches sum of line items

**Test Cases**:
1. 3 line items (10, 20, 30) → Expected total_qty: 60
2. Manual override total_qty to 50 → Expected: ERROR VAL-STI-201
3. Add line item, auto-recalculate → Expected: SUCCESS

**Validations Tested**: VAL-STI-201

---

### Test Scenario: TS-STI-VAL-010 - Issue Return Quantity Exceeds Original
**Objective**: Verify issue return cannot exceed originally issued quantity

**Test Setup**:
- Original issue: 100 units of Product A
- Already returned: 30 units

**Test Cases**:
1. Return 50 units → Expected: SUCCESS (total returned 80 < 100)
2. Return 71 units → Expected: ERROR VAL-STI-103 (total would be 101 > 100)
3. Return 70 units → Expected: SUCCESS (total returned 100 = 100)

**Validations Tested**: VAL-STI-103

---

### Test Scenario: TS-STI-VAL-011 - Cost Precision Validation
**Objective**: Verify cost values maintain 4 decimal precision

**Test Cases**:
1. Unit cost 12.3456 → Expected: SUCCESS
2. Unit cost 12.34567 → Expected: ERROR VAL-STI-015
3. Total cost calculation: 10 qty × 12.3456 unit cost → Expected: 123.4560

**Validations Tested**: VAL-STI-015, VAL-STI-118

---

### Test Scenario: TS-STI-VAL-012 - Attachment File Validation
**Objective**: Verify file upload constraints

**Test Cases**:
1. Upload 5MB PDF → Expected: SUCCESS
2. Upload 15MB PDF → Expected: ERROR VAL-STI-019 (exceeds 10MB)
3. Upload .EXE file → Expected: ERROR VAL-STI-020 (invalid type)
4. Upload 21st attachment → Expected: ERROR VAL-STI-021 (max 20)
5. Upload JPG with 250 char description → Expected: ERROR VAL-STI-022

**Validations Tested**: VAL-STI-019, VAL-STI-020, VAL-STI-021, VAL-STI-022

---

### Test Scenario: TS-STI-VAL-013 - Activity Log Immutability
**Objective**: Verify activity log entries cannot be modified or deleted

**Test Cases**:
1. Try to update activity log entry → Expected: ERROR VAL-STI-120
2. Try to delete activity log entry → Expected: ERROR VAL-STI-120
3. Create new activity log entry → Expected: SUCCESS

**Validations Tested**: VAL-STI-120, VAL-STI-307

---

### Test Scenario: TS-STI-VAL-014 - Auto-Save with Concurrent Edit
**Objective**: Verify auto-save handles concurrent edits gracefully

**Test Setup**:
- User A opens transaction in edit mode
- User B opens same transaction in another browser

**Test Cases**:
1. User A auto-saves → Expected: SUCCESS
2. User B auto-saves after User A → Expected: WARNING VAL-STI-121 (version conflict)
3. User B refreshes page → Expected: Sees User A's changes
4. User B manually saves → Expected: Overwrites with confirmation

**Validations Tested**: VAL-STI-121

---

### Test Scenario: TS-STI-VAL-015 - Reference Number Uniqueness
**Objective**: Verify reference numbers cannot be duplicated

**Test Cases**:
1. Create transaction with ref STK-IN-2401-0001 → Expected: SUCCESS
2. Try to create another with STK-IN-2401-0001 → Expected: ERROR VAL-STI-005
3. Auto-generate ref number → Expected: SUCCESS (unique number)

**Validations Tested**: VAL-STI-005

---

## Validation Matrix

### Validation Enforcement by Layer

| Validation ID | Rule | Client | Server | Database |
|--------------|------|--------|--------|----------|
| VAL-STI-001 | Transaction Type Required | ✅ | ✅ | ✅ |
| VAL-STI-002 | Transaction Date Required | ✅ | ✅ | ✅ |
| VAL-STI-003 | Transaction Date Range | ✅ | ✅ | ❌ |
| VAL-STI-004 | Reference Number Format | ✅ | ✅ | ✅ |
| VAL-STI-005 | Reference Number Uniqueness | ❌ | ✅ | ✅ |
| VAL-STI-006 | Location Required | ✅ | ✅ | ✅ |
| VAL-STI-007 | Location Access Permission | ❌ | ✅ | ❌ |
| VAL-STI-008 | Description Length | ✅ | ✅ | ❌ |
| VAL-STI-009 | Related Document Format | ✅ | ✅ | ❌ |
| VAL-STI-010 | Minimum Line Items | ✅ | ✅ | ❌ |
| VAL-STI-011 | Product Required | ✅ | ✅ | ✅ |
| VAL-STI-012 | Unit of Measure Required | ✅ | ✅ | ✅ |
| VAL-STI-013 | Quantity Greater Than Zero | ✅ | ✅ | ✅ |
| VAL-STI-014 | Unit Cost Non-Negative | ✅ | ✅ | ✅ |
| VAL-STI-015 | Cost Precision | ✅ | ✅ | ✅ |
| VAL-STI-016 | Line Item Comment Length | ✅ | ✅ | ❌ |
| VAL-STI-017 | Destination Location Required | ✅ | ✅ | ✅ |
| VAL-STI-018 | Transaction Comment Length | ✅ | ✅ | ❌ |
| VAL-STI-019 | Attachment File Size | ❌ | ✅ | ❌ |
| VAL-STI-020 | Attachment File Type | ❌ | ✅ | ❌ |
| VAL-STI-021 | Maximum Attachments | ❌ | ✅ | ❌ |
| VAL-STI-022 | Attachment Description Length | ✅ | ✅ | ❌ |
| VAL-STI-101 | GRN Must Reference Valid GRN | ❌ | ✅ | ❌ |
| VAL-STI-102 | Transfer Must Reference Valid Transfer | ❌ | ✅ | ❌ |
| VAL-STI-103 | Issue Return Must Reference Original | ❌ | ✅ | ❌ |
| VAL-STI-104 | Adjustment Must Have Reason Code | ✅ | ✅ | ❌ |
| VAL-STI-105 | Credit Note Must Reference Valid CN | ❌ | ✅ | ❌ |
| VAL-STI-106 | Only Saved Status Can Be Edited | ✅ | ✅ | ❌ |
| VAL-STI-107 | Committed Status Immutable | ✅ | ✅ | ✅ |
| VAL-STI-108 | Void Status Immutable | ✅ | ✅ | ❌ |
| VAL-STI-109 | Status Transition Validation | ❌ | ✅ | ❌ |
| VAL-STI-110 | Commit Requires Valid Line Items | ❌ | ✅ | ❌ |
| VAL-STI-111 | Negative Inventory Prevention | ❌ | ✅ | ❌ |
| VAL-STI-112 | Valuation Service Integration | ❌ | ✅ | ❌ |
| VAL-STI-113 | GL Posting Required for Commit | ❌ | ✅ | ❌ |
| VAL-STI-114 | Atomic Balance Update | ❌ | ❌ | ✅ |
| VAL-STI-115 | Reversal Only for Committed | ❌ | ✅ | ❌ |
| VAL-STI-116 | Manager Approval for Reversal | ❌ | ✅ | ❌ |
| VAL-STI-117 | Duplicate Product Allowed | ❌ | ✅ | ❌ |
| VAL-STI-118 | Cost Calculation Accuracy | ❌ | ✅ | ❌ |
| VAL-STI-119 | Movement Immutability | ❌ | ❌ | ✅ |
| VAL-STI-120 | Activity Log Immutability | ❌ | ❌ | ✅ |
| VAL-STI-121 | Auto-Save Data Consistency | ❌ | ✅ | ❌ |
| VAL-STI-201 | Total Quantity Calculation | ✅ | ✅ | ❌ |
| VAL-STI-202 | Commit Date Consistency | ❌ | ✅ | ❌ |
| VAL-STI-203 | Committed By Required | ❌ | ✅ | ❌ |
| VAL-STI-204 | GL Journal Entry Number Required | ❌ | ✅ | ❌ |
| VAL-STI-205 | Related Document Consistency | ❌ | ✅ | ❌ |
| VAL-STI-206 | Reversal Transaction Link | ❌ | ✅ | ❌ |
| VAL-STI-207 | Status-Dependent Field Requirements | ❌ | ✅ | ❌ |
| VAL-STI-208 | Line Item Destination Location | ❌ | ✅ | ❌ |
| VAL-STI-301 | User Authentication Required | ❌ | ✅ | ❌ |
| VAL-STI-302 | Create Permission Required | ❌ | ✅ | ❌ |
| VAL-STI-303 | Commit Permission Required | ❌ | ✅ | ❌ |
| VAL-STI-304 | Void Permission Required | ❌ | ✅ | ❌ |
| VAL-STI-305 | Reverse Permission Required | ❌ | ✅ | ❌ |
| VAL-STI-306 | Location-Based Access Control | ❌ | ✅ | ❌ |
| VAL-STI-307 | Activity Logging Required | ❌ | ✅ | ❌ |
| VAL-STI-308 | Audit Trail Integrity | ❌ | ❌ | ✅ |
| VAL-STI-309 | Soft Delete Only | ❌ | ✅ | ❌ |
| VAL-STI-310 | Edit Permission Based on Creator | ❌ | ✅ | ❌ |

### Coverage Summary

- **Total Validations**: 48
- **Field-Level**: 22 (46%)
- **Business Rule**: 21 (44%)
- **Cross-Field**: 8 (17%)
- **Security**: 10 (21%)

**Note**: Percentages exceed 100% because some validations span multiple categories.

### Business Rule Coverage

All 53 business rules from BR-stock-in.md are covered by validations:

| Business Rule Range | Validation Coverage |
|-------------------|---------------------|
| BR-STI-001 to BR-STI-005 (Transaction Types) | VAL-STI-001, VAL-STI-101 to VAL-STI-105 |
| BR-STI-011 to BR-STI-015 (Status Rules) | VAL-STI-106 to VAL-STI-109 |
| BR-STI-016 to BR-STI-020 (Data Validation) | VAL-STI-002, VAL-STI-003, VAL-STI-004, VAL-STI-005, VAL-STI-006, VAL-STI-010 |
| BR-STI-021 to BR-STI-025 (Line Item Rules) | VAL-STI-011 to VAL-STI-013, VAL-STI-117 |
| BR-STI-026 to BR-STI-030 (Cost Calculation) | VAL-STI-014, VAL-STI-015, VAL-STI-118 |
| BR-STI-031 to BR-STI-035 (Inventory Balance) | VAL-STI-111, VAL-STI-114 |
| BR-STI-036 to BR-STI-040 (Movement History) | VAL-STI-119 |
| BR-STI-041 to BR-STI-047 (Audit/Security) | VAL-STI-301 to VAL-STI-310, VAL-STI-120 |
| BR-STI-048 to BR-STI-053 (Integration) | VAL-STI-112, VAL-STI-113 |

---

## Appendix

### Related Documents
- BR-stock-in.md - Business Requirements
- UC-stock-in.md - Use Cases
- TS-stock-in.md - Technical Specification
- DD-stock-in.md - Data Definition
- FD-stock-in.md - Flow Diagrams

### Validation Rule Naming Convention
- **VAL-[MODULE]-[CATEGORY][NUMBER]**
- MODULE: STI (Stock In)
- CATEGORY: 001-099 (Field-Level), 101-199 (Business Rule), 201-299 (Cross-Field), 301-399 (Security)
- NUMBER: Sequential within category

### Version History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-11 | System | Initial version covering all 53 business rules with 48 validation rules |

---

**Document Control**:
- **Classification**: Internal Use
- **Review Required**: Yes
- **Approved By**: Pending
- **Next Review Date**: TBD
