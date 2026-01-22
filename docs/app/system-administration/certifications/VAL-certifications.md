# Validation Rules: Certifications

## Module Information
- **Module**: System Administration
- **Sub-Module**: Certifications
- **Route**: `/system-administration/certifications`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-17
- **Owner**: System Administration Team
- **Status**: Active

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2026-01-17 | Documentation Team | Initial version |

---

## Overview

This document defines the validation rules for the Certifications module. Validation is performed using Zod schemas on the server side.

**Related Documents**:
- [Business Requirements](./BR-certifications.md)
- [Use Cases](./UC-certifications.md)
- [Data Dictionary](./DD-certifications.md)
- [Technical Specification](./TS-certifications.md)
- [Flow Diagrams](./FD-certifications.md)

---

## Validation Summary

| Rule ID | Field | Rule | Implemented |
|---------|-------|------|-------------|
| VAL-CERT-001 | name | Required string | Yes |
| VAL-CERT-002 | description | Optional string | Yes |
| VAL-CERT-003 | icon_url | Optional string | Yes |
| VAL-CERT-004 | certificate_number | Optional string | Yes |
| VAL-CERT-005 | issue_date | Optional string | Yes |
| VAL-CERT-006 | expiry_date | Optional string | Yes |
| VAL-CERT-007 | document_url | Optional string | Yes |

---

## Zod Schemas

### CertificationSchema

**Location**: `actions/certification-actions.ts`

```typescript
const CertificationSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  icon_url: z.string().optional(),
})

const CreateCertification = CertificationSchema.omit({ id: true })
```

### VendorCertificationSchema

```typescript
z.object({
  certificate_number: z.string().optional(),
  issue_date: z.string().optional(),
  expiry_date: z.string().optional(),
  document_url: z.string().optional(),
})
```

### ProductCertificationSchema

```typescript
z.object({
  certificate_number: z.string().optional(),
  issue_date: z.string().optional(),
  expiry_date: z.string().optional(),
  document_url: z.string().optional(),
})
```

---

## Field Validations

### VAL-CERT-001: Name Required

**Rule ID**: VAL-CERT-001
**Field**: name
**Type**: Required

**Description**: Certification name must be provided.

**Schema**: `z.string()`

**HTML Attribute**: `required` on input

**Error Handling**: Zod throws validation error if name is missing.

---

### VAL-CERT-002: Description Optional

**Rule ID**: VAL-CERT-002
**Field**: description
**Type**: Optional

**Description**: Description is optional additional information.

**Schema**: `z.string().optional()`

---

### VAL-CERT-003: Icon URL Optional

**Rule ID**: VAL-CERT-003
**Field**: icon_url
**Type**: Optional

**Description**: Icon URL is optional for display purposes.

**Schema**: `z.string().optional()`

---

### VAL-CERT-004: Certificate Number Optional

**Rule ID**: VAL-CERT-004
**Field**: certificate_number
**Type**: Optional

**Description**: Certificate reference number for tracking.

**Schema**: `z.string().optional()`

---

### VAL-CERT-005: Issue Date Optional

**Rule ID**: VAL-CERT-005
**Field**: issue_date
**Type**: Optional

**Description**: Date when certificate was issued.

**Schema**: `z.string().optional()`

---

### VAL-CERT-006: Expiry Date Optional

**Rule ID**: VAL-CERT-006
**Field**: expiry_date
**Type**: Optional

**Description**: Certificate expiration date for renewal tracking.

**Schema**: `z.string().optional()`

---

### VAL-CERT-007: Document URL Optional

**Rule ID**: VAL-CERT-007
**Field**: document_url
**Type**: Optional

**Description**: URL to certificate document for reference.

**Schema**: `z.string().optional()`

---

## Validation Flow

### Create Certification Validation

```
FormData received
    |
    v
Parse with CreateCertification schema
    |
    v
Check: name is string? ----No----> Zod error thrown
    |
    Yes
    v
Extract validated values
    |
    v
Proceed with database insert
```

### Update Certification Validation

```
FormData received
    |
    v
Parse with CreateCertification schema
    |
    v
Check: name is string? ----No----> Zod error thrown
    |
    Yes
    v
Extract validated values
    |
    v
Proceed with database update
```

---

## Input Specifications

### Name Input

| Property | Value |
|----------|-------|
| Type | text |
| Required | Yes (HTML + Zod) |
| Max Length | Not enforced |
| Placeholder | None |

### Description Input

| Property | Value |
|----------|-------|
| Type | textarea |
| Required | No |
| Max Length | Not enforced |

### Icon URL Input

| Property | Value |
|----------|-------|
| Type | text |
| Required | No |
| Format | URL (not validated) |

---

## Error Handling

### Current Implementation

Validation errors from Zod will cause the server action to fail. The current implementation does not display user-friendly error messages.

### Recommended Improvements (Phase 2)

| Scenario | Recommended Message |
|----------|-------------------|
| Empty name | "Certification name is required" |
| Duplicate name | "A certification with this name already exists" |
| Invalid URL format | "Please enter a valid URL" |

---

## Business Rule Validations

### BR-CERT-001: Name Required

**Rule**: Every certification must have a name.
**Validation**: Zod `z.string()` schema
**Status**: Implemented

### BR-CERT-002: Unique Names (Future)

**Rule**: Certification names should be unique.
**Validation**: Database constraint (not yet implemented)
**Status**: Planned for Phase 2

### BR-CERT-003: Valid Date Format (Future)

**Rule**: Issue and expiry dates should be valid dates.
**Validation**: Date parsing (not yet implemented)
**Status**: Planned for Phase 2

---

## Test Scenarios

### Valid Input Tests

| Test | Input | Expected Result |
|------|-------|-----------------|
| Create with name only | name: "Halal" | Certification created |
| Create with all fields | name, description, icon_url | Certification created |
| Update name | name: "Organic" | Certification updated |

### Invalid Input Tests

| Test | Input | Expected Result |
|------|-------|-----------------|
| Create without name | name: undefined | Zod validation error |
| Create with empty name | name: "" | May pass (string is valid) |

### Edge Cases

| Test | Input | Expected Result |
|------|-------|-----------------|
| Very long name | 1000 character string | Accepted (no max length) |
| Special characters in name | "Halal (JAKIM)" | Accepted |
| Unicode in name | "ISO 9001 - Quality" | Accepted |

---

**Document End**
