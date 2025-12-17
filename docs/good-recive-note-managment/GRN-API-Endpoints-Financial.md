# Goods Received Note Module - API Financial Endpoints

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
> **Document Status**: Content Migration Complete (Phase 2)  
> **Last Updated**: March 14, 2024  
> **Next Update**: Phase 3 - Content Review and Refinement

> **Note**: This is a consolidated document that combines content from:
> - grn-api-sp.md (API Endpoints - Financial Operations)

## Table of Contents
1. [Introduction](#introduction)
2. [Get Journal Entries](#get-journal-entries)
3. [Get Tax Entries](#get-tax-entries)
4. [Get Extra Costs](#get-extra-costs)
5. [Add Extra Cost](#add-extra-cost)
6. [Update Extra Cost](#update-extra-cost)
7. [Delete Extra Cost](#delete-extra-cost)
8. [Related Documentation](#related-documentation)

## Introduction

This document provides detailed specifications for the financial API endpoints of the Goods Received Note (GRN) module. These endpoints allow clients to manage financial aspects of GRNs, including journal entries, tax calculations, and extra costs.

## Get Journal Entries

Retrieves the journal entries associated with a specific GRN.

### Request

```
GET /api/grns/{id}/journal-entries
```

### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | GRN ID (UUID)   |

### Response

```json
{
  "journalEntries": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174013",
      "journalNumber": "JV-2401-0001",
      "status": "POSTED",
      "postingDate": "2024-03-15T17:30:00Z",
      "description": "GRN-2401-0001 - Inventory Receipt",
      "currencyCode": "USD",
      "exchangeRate": 1,
      "totalDebit": 1040.00,
      "totalCredit": 1040.00,
      "createdBy": "system",
      "createdAt": "2024-03-15T17:30:00Z",
      "lines": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174018",
          "accountCode": "1200",
          "accountName": "Inventory",
          "description": "Inventory Receipt - Product A",
          "debit": 1000.00,
          "credit": 0.00,
          "departmentId": "123e4567-e89b-12d3-a456-426614174003",
          "departmentName": "Kitchen",
          "productId": "123e4567-e89b-12d3-a456-426614174006",
          "productName": "Product A"
        },
        {
          "id": "123e4567-e89b-12d3-a456-426614174019",
          "accountCode": "1210",
          "accountName": "Freight In",
          "description": "Freight Charges",
          "debit": 40.00,
          "credit": 0.00,
          "departmentId": "123e4567-e89b-12d3-a456-426614174003",
          "departmentName": "Kitchen"
        },
        {
          "id": "123e4567-e89b-12d3-a456-426614174020",
          "accountCode": "2100",
          "accountName": "Accounts Payable",
          "description": "Vendor: ABC Supplies",
          "debit": 0.00,
          "credit": 1040.00,
          "vendorId": "123e4567-e89b-12d3-a456-426614174002",
          "vendorName": "ABC Supplies"
        }
      ]
    }
  ]
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN not found                                    |

## Get Tax Entries

Retrieves the tax entries associated with a specific GRN.

### Request

```
GET /api/grns/{id}/tax-entries
```

### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | GRN ID (UUID)   |

### Response

```json
{
  "taxEntries": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174021",
      "taxCode": "VAT",
      "taxName": "Value Added Tax",
      "taxRate": 10,
      "taxableAmount": 900.00,
      "taxAmount": 90.00,
      "isRecoverable": true,
      "recoverableAmount": 90.00,
      "nonRecoverableAmount": 0.00
    },
    {
      "id": "123e4567-e89b-12d3-a456-426614174022",
      "taxCode": "VAT",
      "taxName": "Value Added Tax",
      "taxRate": 10,
      "taxableAmount": 50.00,
      "taxAmount": 5.00,
      "isRecoverable": true,
      "recoverableAmount": 5.00,
      "nonRecoverableAmount": 0.00,
      "extraCostId": "123e4567-e89b-12d3-a456-426614174023"
    }
  ],
  "summary": {
    "totalTaxableAmount": 950.00,
    "totalTaxAmount": 95.00,
    "totalRecoverableAmount": 95.00,
    "totalNonRecoverableAmount": 0.00
  }
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN not found                                    |

## Get Extra Costs

Retrieves the extra costs associated with a specific GRN.

### Request

```
GET /api/grns/{id}/extra-costs
```

### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | GRN ID (UUID)   |

### Response

```json
{
  "extraCosts": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174023",
      "costTypeId": "123e4567-e89b-12d3-a456-426614174009",
      "costTypeName": "Freight",
      "description": "Shipping from vendor warehouse",
      "amount": 50.00,
      "taxRate": 10,
      "taxAmount": 5.00,
      "totalAmount": 55.00,
      "allocationMethod": "BY_VALUE",
      "notes": "Standard shipping charges",
      "createdBy": "john.doe@example.com",
      "createdAt": "2024-03-15T10:30:00Z",
      "updatedBy": "john.doe@example.com",
      "updatedAt": "2024-03-15T10:30:00Z"
    }
  ],
  "summary": {
    "totalExtraCosts": 50.00,
    "totalTaxAmount": 5.00,
    "totalAmount": 55.00
  }
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN not found                                    |

## Add Extra Cost

Adds a new extra cost to a GRN. Only GRNs in DRAFT status can have extra costs added.

### Request

```
POST /api/grns/{id}/extra-costs
```

### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | GRN ID (UUID)   |

### Request Body

```json
{
  "costTypeId": "123e4567-e89b-12d3-a456-426614174009",
  "description": "Customs Duty",
  "amount": 75.00,
  "taxRate": 10,
  "allocationMethod": "BY_QUANTITY",
  "notes": "Import duties for international shipment"
}
```

### Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174024",
  "costTypeId": "123e4567-e89b-12d3-a456-426614174009",
  "costTypeName": "Customs Duty",
  "description": "Customs Duty",
  "amount": 75.00,
  "taxRate": 10,
  "taxAmount": 7.50,
  "totalAmount": 82.50,
  "allocationMethod": "BY_QUANTITY",
  "notes": "Import duties for international shipment",
  "createdBy": "john.doe@example.com",
  "createdAt": "2024-03-15T11:30:00Z"
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 400         | INVALID_REQUEST      | Invalid request body                             |
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN or cost type not found                       |
| 409         | CONFLICT             | GRN is not in DRAFT status                       |
| 422         | BUSINESS_RULE_VIOLATION | Business rule violation                       |

## Update Extra Cost

Updates an existing extra cost for a GRN. Only GRNs in DRAFT status can have extra costs updated.

### Request

```
PUT /api/grns/{id}/extra-costs/{extraCostId}
```

### Path Parameters

| Parameter   | Type   | Required | Description         |
|-------------|--------|----------|---------------------|
| id          | string | Yes      | GRN ID (UUID)       |
| extraCostId | string | Yes      | Extra Cost ID (UUID)|

### Request Body

```json
{
  "costTypeId": "123e4567-e89b-12d3-a456-426614174009",
  "description": "Updated Customs Duty",
  "amount": 80.00,
  "taxRate": 10,
  "allocationMethod": "BY_QUANTITY",
  "notes": "Updated import duties for international shipment"
}
```

### Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174024",
  "costTypeId": "123e4567-e89b-12d3-a456-426614174009",
  "costTypeName": "Customs Duty",
  "description": "Updated Customs Duty",
  "amount": 80.00,
  "taxRate": 10,
  "taxAmount": 8.00,
  "totalAmount": 88.00,
  "allocationMethod": "BY_QUANTITY",
  "notes": "Updated import duties for international shipment",
  "createdBy": "john.doe@example.com",
  "createdAt": "2024-03-15T11:30:00Z",
  "updatedBy": "john.doe@example.com",
  "updatedAt": "2024-03-15T12:30:00Z"
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 400         | INVALID_REQUEST      | Invalid request body                             |
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN, extra cost, or cost type not found          |
| 409         | CONFLICT             | GRN is not in DRAFT status                       |
| 422         | BUSINESS_RULE_VIOLATION | Business rule violation                       |

## Delete Extra Cost

Deletes an extra cost from a GRN. Only GRNs in DRAFT status can have extra costs deleted.

### Request

```
DELETE /api/grns/{id}/extra-costs/{extraCostId}
```

### Path Parameters

| Parameter   | Type   | Required | Description         |
|-------------|--------|----------|---------------------|
| id          | string | Yes      | GRN ID (UUID)       |
| extraCostId | string | Yes      | Extra Cost ID (UUID)|

### Response

```json
{
  "success": true,
  "message": "Extra cost deleted successfully"
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN or extra cost not found                      |
| 409         | CONFLICT             | GRN is not in DRAFT status                       |

## Related Documentation

For more information about the GRN API, please refer to the following documentation:

1. **API Overview**:
   - [GRN API Endpoints Overview](./GRN-API-Endpoints-Overview.md)
   - [GRN API Overview](./GRN-API-Overview.md)

2. **Other API Endpoints**:
   - [Core Operations](./GRN-API-Endpoints-Core.md)
   - [Workflow Operations](./GRN-API-Endpoints-Workflow.md)
   - [Item Operations](./GRN-API-Endpoints-Items.md)
   - [Attachment Operations](./GRN-API-Endpoints-Attachments.md)
   - [Comment Operations](./GRN-API-Endpoints-Comments.md) 