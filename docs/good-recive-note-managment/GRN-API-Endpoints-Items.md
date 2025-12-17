# Goods Received Note Module - API Item Endpoints

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
> **Document Status**: Content Migration Complete (Phase 2)  
> **Last Updated**: March 14, 2024  
> **Next Update**: Phase 3 - Content Review and Refinement

> **Note**: This is a consolidated document that combines content from:
> - grn-api-sp.md (API Endpoints - Item Operations)

## Table of Contents
1. [Introduction](#introduction)
2. [Get GRN Items](#get-grn-items)
3. [Get GRN Item by ID](#get-grn-item-by-id)
4. [Add Item to GRN](#add-item-to-grn)
5. [Update GRN Item](#update-grn-item)
6. [Delete GRN Item](#delete-grn-item)
7. [Get Item Stock Movements](#get-item-stock-movements)
8. [Related Documentation](#related-documentation)

## Introduction

This document provides detailed specifications for the item API endpoints of the Goods Received Note (GRN) module. These endpoints allow clients to manage GRN items, including adding, updating, and removing items from a GRN.

## Get GRN Items

Retrieves all items associated with a specific GRN.

### Request

```
GET /api/grns/{id}/items
```

### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | GRN ID (UUID)   |

### Query Parameters

| Parameter | Type   | Required | Description                                      |
|-----------|--------|----------|--------------------------------------------------|
| expand    | string | No       | Comma-separated list of related resources to expand (e.g., "product,uom") |

### Response

```json
{
  "items": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174025",
      "grnId": "123e4567-e89b-12d3-a456-426614174000",
      "poItemId": "123e4567-e89b-12d3-a456-426614174005",
      "productId": "123e4567-e89b-12d3-a456-426614174006",
      "product": {
        "id": "123e4567-e89b-12d3-a456-426614174006",
        "code": "PROD-001",
        "name": "Product A",
        "description": "High-quality Product A",
        "categoryId": "123e4567-e89b-12d3-a456-426614174026",
        "categoryName": "Raw Materials"
      },
      "description": "Product A",
      "uomId": "123e4567-e89b-12d3-a456-426614174007",
      "uom": {
        "id": "123e4567-e89b-12d3-a456-426614174007",
        "code": "KG",
        "name": "Kilogram"
      },
      "orderedQuantity": 10,
      "receivedQuantity": 10,
      "unitPrice": 100.00,
      "discountRate": 10,
      "discountAmount": 100.00,
      "taxRate": 10,
      "taxAmount": 90.00,
      "subtotal": 900.00,
      "total": 990.00,
      "notes": "Item notes",
      "lotNumber": "LOT-12345",
      "expiryDate": "2025-03-15T00:00:00Z",
      "manufacturingDate": "2024-02-15T00:00:00Z",
      "locationId": "123e4567-e89b-12d3-a456-426614174008",
      "location": {
        "id": "123e4567-e89b-12d3-a456-426614174008",
        "code": "WH-MAIN",
        "name": "Main Warehouse"
      },
      "createdBy": "john.doe@example.com",
      "createdAt": "2024-03-15T10:30:00Z",
      "updatedBy": "john.doe@example.com",
      "updatedAt": "2024-03-15T10:30:00Z"
    }
  ],
  "summary": {
    "totalItems": 1,
    "totalQuantity": 10,
    "totalSubtotal": 900.00,
    "totalDiscount": 100.00,
    "totalTax": 90.00,
    "totalAmount": 990.00
  }
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN not found                                    |

## Get GRN Item by ID

Retrieves a specific item from a GRN by its ID.

### Request

```
GET /api/grns/{id}/items/{itemId}
```

### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | GRN ID (UUID)   |
| itemId    | string | Yes      | Item ID (UUID)  |

### Query Parameters

| Parameter | Type   | Required | Description                                      |
|-----------|--------|----------|--------------------------------------------------|
| expand    | string | No       | Comma-separated list of related resources to expand (e.g., "product,uom") |

### Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174025",
  "grnId": "123e4567-e89b-12d3-a456-426614174000",
  "poItemId": "123e4567-e89b-12d3-a456-426614174005",
  "productId": "123e4567-e89b-12d3-a456-426614174006",
  "product": {
    "id": "123e4567-e89b-12d3-a456-426614174006",
    "code": "PROD-001",
    "name": "Product A",
    "description": "High-quality Product A",
    "categoryId": "123e4567-e89b-12d3-a456-426614174026",
    "categoryName": "Raw Materials"
  },
  "description": "Product A",
  "uomId": "123e4567-e89b-12d3-a456-426614174007",
  "uom": {
    "id": "123e4567-e89b-12d3-a456-426614174007",
    "code": "KG",
    "name": "Kilogram"
  },
  "orderedQuantity": 10,
  "receivedQuantity": 10,
  "unitPrice": 100.00,
  "discountRate": 10,
  "discountAmount": 100.00,
  "taxRate": 10,
  "taxAmount": 90.00,
  "subtotal": 900.00,
  "total": 990.00,
  "notes": "Item notes",
  "lotNumber": "LOT-12345",
  "expiryDate": "2025-03-15T00:00:00Z",
  "manufacturingDate": "2024-02-15T00:00:00Z",
  "locationId": "123e4567-e89b-12d3-a456-426614174008",
  "location": {
    "id": "123e4567-e89b-12d3-a456-426614174008",
    "code": "WH-MAIN",
    "name": "Main Warehouse"
  },
  "createdBy": "john.doe@example.com",
  "createdAt": "2024-03-15T10:30:00Z",
  "updatedBy": "john.doe@example.com",
  "updatedAt": "2024-03-15T10:30:00Z"
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN or item not found                            |

## Add Item to GRN

Adds a new item to a GRN. Only GRNs in DRAFT status can have items added.

### Request

```
POST /api/grns/{id}/items
```

### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | GRN ID (UUID)   |

### Request Body

```json
{
  "poItemId": "123e4567-e89b-12d3-a456-426614174027",
  "productId": "123e4567-e89b-12d3-a456-426614174028",
  "description": "Product B",
  "uomId": "123e4567-e89b-12d3-a456-426614174007",
  "receivedQuantity": 5,
  "unitPrice": 200.00,
  "discountRate": 5,
  "taxRate": 10,
  "notes": "Additional item",
  "lotNumber": "LOT-67890",
  "expiryDate": "2025-06-15T00:00:00Z",
  "manufacturingDate": "2024-03-01T00:00:00Z",
  "locationId": "123e4567-e89b-12d3-a456-426614174008"
}
```

### Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174029",
  "grnId": "123e4567-e89b-12d3-a456-426614174000",
  "poItemId": "123e4567-e89b-12d3-a456-426614174027",
  "productId": "123e4567-e89b-12d3-a456-426614174028",
  "description": "Product B",
  "uomId": "123e4567-e89b-12d3-a456-426614174007",
  "orderedQuantity": 5,
  "receivedQuantity": 5,
  "unitPrice": 200.00,
  "discountRate": 5,
  "discountAmount": 50.00,
  "taxRate": 10,
  "taxAmount": 95.00,
  "subtotal": 950.00,
  "total": 1045.00,
  "notes": "Additional item",
  "lotNumber": "LOT-67890",
  "expiryDate": "2025-06-15T00:00:00Z",
  "manufacturingDate": "2024-03-01T00:00:00Z",
  "locationId": "123e4567-e89b-12d3-a456-426614174008",
  "createdBy": "john.doe@example.com",
  "createdAt": "2024-03-15T13:30:00Z"
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 400         | INVALID_REQUEST      | Invalid request body                             |
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN, product, UOM, or location not found         |
| 409         | CONFLICT             | GRN is not in DRAFT status                       |
| 422         | BUSINESS_RULE_VIOLATION | Business rule violation                       |

## Update GRN Item

Updates an existing item in a GRN. Only GRNs in DRAFT status can have items updated.

### Request

```
PUT /api/grns/{id}/items/{itemId}
```

### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | GRN ID (UUID)   |
| itemId    | string | Yes      | Item ID (UUID)  |

### Request Body

```json
{
  "description": "Updated Product B",
  "receivedQuantity": 6,
  "unitPrice": 210.00,
  "discountRate": 5,
  "taxRate": 10,
  "notes": "Updated additional item",
  "lotNumber": "LOT-67890-UPDATED",
  "expiryDate": "2025-06-15T00:00:00Z",
  "manufacturingDate": "2024-03-01T00:00:00Z",
  "locationId": "123e4567-e89b-12d3-a456-426614174008"
}
```

### Response

```json
{
  "id": "123e4567-e89b-12d3-a456-426614174029",
  "grnId": "123e4567-e89b-12d3-a456-426614174000",
  "poItemId": "123e4567-e89b-12d3-a456-426614174027",
  "productId": "123e4567-e89b-12d3-a456-426614174028",
  "description": "Updated Product B",
  "uomId": "123e4567-e89b-12d3-a456-426614174007",
  "orderedQuantity": 5,
  "receivedQuantity": 6,
  "unitPrice": 210.00,
  "discountRate": 5,
  "discountAmount": 63.00,
  "taxRate": 10,
  "taxAmount": 119.70,
  "subtotal": 1197.00,
  "total": 1316.70,
  "notes": "Updated additional item",
  "lotNumber": "LOT-67890-UPDATED",
  "expiryDate": "2025-06-15T00:00:00Z",
  "manufacturingDate": "2024-03-01T00:00:00Z",
  "locationId": "123e4567-e89b-12d3-a456-426614174008",
  "createdBy": "john.doe@example.com",
  "createdAt": "2024-03-15T13:30:00Z",
  "updatedBy": "john.doe@example.com",
  "updatedAt": "2024-03-15T14:30:00Z"
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 400         | INVALID_REQUEST      | Invalid request body                             |
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN, item, or location not found                 |
| 409         | CONFLICT             | GRN is not in DRAFT status                       |
| 422         | BUSINESS_RULE_VIOLATION | Business rule violation                       |

## Delete GRN Item

Deletes an item from a GRN. Only GRNs in DRAFT status can have items deleted.

### Request

```
DELETE /api/grns/{id}/items/{itemId}
```

### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | GRN ID (UUID)   |
| itemId    | string | Yes      | Item ID (UUID)  |

### Response

```json
{
  "success": true,
  "message": "Item deleted successfully"
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN or item not found                            |
| 409         | CONFLICT             | GRN is not in DRAFT status                       |

## Get Item Stock Movements

Retrieves the stock movements associated with a specific GRN item.

### Request

```
GET /api/grns/{id}/items/{itemId}/stock-movements
```

### Path Parameters

| Parameter | Type   | Required | Description     |
|-----------|--------|----------|-----------------|
| id        | string | Yes      | GRN ID (UUID)   |
| itemId    | string | Yes      | Item ID (UUID)  |

### Response

```json
{
  "stockMovements": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174030",
      "transactionNumber": "INV-2401-0001",
      "transactionType": "RECEIPT",
      "productId": "123e4567-e89b-12d3-a456-426614174028",
      "productCode": "PROD-002",
      "productName": "Product B",
      "locationId": "123e4567-e89b-12d3-a456-426614174008",
      "locationCode": "WH-MAIN",
      "locationName": "Main Warehouse",
      "quantity": 6,
      "uomId": "123e4567-e89b-12d3-a456-426614174007",
      "uomCode": "KG",
      "uomName": "Kilogram",
      "lotNumber": "LOT-67890-UPDATED",
      "expiryDate": "2025-06-15T00:00:00Z",
      "manufacturingDate": "2024-03-01T00:00:00Z",
      "unitCost": 210.00,
      "totalCost": 1260.00,
      "transactionDate": "2024-03-15T17:30:00Z",
      "createdBy": "system",
      "createdAt": "2024-03-15T17:30:00Z"
    }
  ]
}
```

### Error Responses

| Status Code | Error Code           | Description                                      |
|-------------|----------------------|--------------------------------------------------|
| 401         | UNAUTHORIZED         | Authentication required                          |
| 403         | FORBIDDEN            | Insufficient permissions                         |
| 404         | RESOURCE_NOT_FOUND   | GRN or item not found                            |

## Related Documentation

For more information about the GRN API, please refer to the following documentation:

1. **API Overview**:
   - [GRN API Endpoints Overview](./GRN-API-Endpoints-Overview.md)
   - [GRN API Overview](./GRN-API-Overview.md)

2. **Other API Endpoints**:
   - [Core Operations](./GRN-API-Endpoints-Core.md)
   - [Workflow Operations](./GRN-API-Endpoints-Workflow.md)
   - [Financial Operations](./GRN-API-Endpoints-Financial.md)
   - [Attachment Operations](./GRN-API-Endpoints-Attachments.md)
   - [Comment Operations](./GRN-API-Endpoints-Comments.md) 