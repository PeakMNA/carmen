# Credit Note API - Financial Operations

**Document Status:** Draft  
**Last Updated:** March 27, 2024

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Table of Contents
- [Introduction](#introduction)
- [Data Models](#data-models)
- [Endpoints](#endpoints)
  - [Get Journal Entries](#get-journal-entries)
  - [Get Tax Entries](#get-tax-entries)
  - [Get Financial Summary](#get-financial-summary)
  - [Process Financial Posting](#process-financial-posting)
- [Error Responses](#error-responses)
- [Related Documentation](#related-documentation)

## Introduction

This document describes the API endpoints for managing financial aspects of Credit Notes, including journal entries, tax entries, and financial calculations.

## Data Models

### JournalEntry

```typescript
interface JournalEntry {
  id: string
  creditNoteId: string
  entryNumber: string
  postingDate: string
  description: string
  status: 'Draft' | 'Posted' | 'Reversed'
  lines: JournalEntryLine[]
  createdBy: {
    id: string
    name: string
  }
  createdAt: string
  postedBy?: {
    id: string
    name: string
  }
  postedAt?: string
  reversedBy?: {
    id: string
    name: string
  }
  reversedAt?: string
  reversalReason?: string
}

interface JournalEntryLine {
  id: string
  accountCode: string
  accountName: string
  description: string
  debit: number
  credit: number
  costCenter?: string
  department?: string
  currency: string
  exchangeRate: number
  baseDebit: number
  baseCredit: number
}
```

### TaxEntry

```typescript
interface TaxEntry {
  id: string
  creditNoteId: string
  taxCode: string
  taxName: string
  taxRate: number
  taxableAmount: number
  taxAmount: number
  currency: string
  baseTaxableAmount: number
  baseTaxAmount: number
  postingDate: string
  status: 'Draft' | 'Posted' | 'Reversed'
  createdAt: string
  postedAt?: string
  reversedAt?: string
}
```

### FinancialSummary

```typescript
interface FinancialSummary {
  creditNoteId: string
  currency: string
  baseCurrency: string
  exchangeRate: number
  subTotal: number
  baseSubTotal: number
  taxTotal: number
  baseTaxTotal: number
  total: number
  baseTotal: number
  taxBreakdown: {
    taxCode: string
    taxRate: number
    taxableAmount: number
    taxAmount: number
    baseTaxableAmount: number
    baseTaxAmount: number
  }[]
  accountingStatus: 'Pending' | 'Posted' | 'Partially Posted' | 'Reversed'
  journalEntryCount: number
  postedJournalEntryCount: number
}
```

## Endpoints

### Get Journal Entries

Retrieves journal entries associated with a credit note.

**Request:**
```
GET /api/credit-notes/:creditNoteId/journal-entries
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note

**Query Parameters:**
```typescript
{
  status?: 'Draft' | 'Posted' | 'Reversed'
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
}
```

**Response:**
```typescript
{
  data: JournalEntry[]
  total: number
  page: number
  limit: number
}
```

**Example:**
```
GET /api/credit-notes/CN-2401-0001/journal-entries?status=Posted
```

### Get Tax Entries

Retrieves tax entries associated with a credit note.

**Request:**
```
GET /api/credit-notes/:creditNoteId/tax-entries
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note

**Query Parameters:**
```typescript
{
  status?: 'Draft' | 'Posted' | 'Reversed'
  page?: number
  limit?: number
}
```

**Response:**
```typescript
{
  data: TaxEntry[]
  total: number
  page: number
  limit: number
}
```

**Example:**
```
GET /api/credit-notes/CN-2401-0001/tax-entries
```

### Get Financial Summary

Retrieves a financial summary for a credit note.

**Request:**
```
GET /api/credit-notes/:creditNoteId/financial-summary
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note

**Response:**
```typescript
FinancialSummary
```

**Example:**
```
GET /api/credit-notes/CN-2401-0001/financial-summary
```

### Process Financial Posting

Posts the financial transactions for a credit note to the accounting system.

**Request:**
```
POST /api/credit-notes/:creditNoteId/post-financial
```

**Path Parameters:**
- `creditNoteId`: The unique identifier of the credit note

**Request Body:**
```typescript
{
  postingDate: string
  description?: string
  referenceNumber?: string
}
```

**Response:**
```typescript
{
  success: boolean
  journalEntries: {
    id: string
    entryNumber: string
    status: 'Posted'
  }[]
  taxEntries: {
    id: string
    status: 'Posted'
  }[]
  postingDate: string
  postedBy: {
    id: string
    name: string
  }
  postedAt: string
}
```

**Example Request:**
```json
POST /api/credit-notes/CN-2401-0001/post-financial
{
  "postingDate": "2024-03-27T00:00:00Z",
  "description": "Credit note posting for damaged laptop return",
  "referenceNumber": "REF-CN-001"
}
```

## Error Responses

### Common Error Responses

```typescript
// Not Found Error
{
  "error": "NotFoundError",
  "message": "Credit note not found",
  "details": {
    "id": "CN-2401-0999"
  }
}

// Status Conflict Error
{
  "error": "StatusConflictError",
  "message": "Cannot post financial entries for credit note in current status",
  "details": {
    "id": "CN-2401-0001",
    "currentStatus": "Draft",
    "requiredStatus": ["Completed"]
  }
}

// Posting Error
{
  "error": "FinancialPostingError",
  "message": "Failed to post journal entries to accounting system",
  "details": {
    "systemError": "Connection timeout",
    "journalEntryIds": ["JE-001", "JE-002"]
  }
}
```

## Related Documentation

- [Credit Note API Overview](./CN-API-Endpoints-Overview.md)
- [Credit Note API - Core Operations](./CN-API-Endpoints-Core.md)
- [Credit Note API - Item Operations](./CN-API-Endpoints-Items.md)
- [Credit Note API - Attachment Operations](./CN-API-Endpoints-Attachments.md)
- [Credit Note API - Comment Operations](./CN-API-Endpoints-Comments.md)
- [Credit Note API - Inventory Operations](./CN-API-Endpoints-Inventory.md) 