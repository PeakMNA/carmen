# Inventory Adjustment API - Endpoints Overview

**Document Status:** Draft  
**Last Updated:** March 27, 2024

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Table of Contents

1. [Introduction](#1-introduction)
2. [API Conventions](#2-api-conventions)
3. [Authentication and Authorization](#3-authentication-and-authorization)
4. [Endpoint Categories](#4-endpoint-categories)
5. [Common Request Parameters](#5-common-request-parameters)
6. [Common Response Formats](#6-common-response-formats)
7. [Error Handling](#7-error-handling)
8. [Rate Limiting](#8-rate-limiting)
9. [Related Documentation](#9-related-documentation)

## 1. Introduction

This document provides an overview of the API endpoints available for the Inventory Adjustment module within the Carmen F&B Management System. These endpoints enable programmatic interaction with inventory adjustments, including creating, retrieving, updating, and processing adjustments, as well as managing related data such as reason codes and approval workflows.

## 2. API Conventions

### 2.1 Base URL

All API endpoints are relative to the base URL:

```
https://api.carmenfb.com/v1
```

### 2.2 HTTP Methods

The API uses standard HTTP methods:

- `GET`: Retrieve resources
- `POST`: Create new resources
- `PUT`: Update existing resources (full update)
- `PATCH`: Update existing resources (partial update)
- `DELETE`: Remove resources

### 2.3 Content Type

All requests and responses use JSON format:

```
Content-Type: application/json
```

### 2.4 Date Format

All dates and timestamps use ISO 8601 format with UTC timezone:

```
YYYY-MM-DDTHH:MM:SSZ
```

### 2.5 Pagination

List endpoints support pagination with the following parameters:

- `page`: Page number (1-based)
- `limit`: Number of items per page
- `sort`: Field to sort by
- `order`: Sort direction (`asc` or `desc`)

Pagination response includes:

```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 100,
    "totalPages": 5
  }
}
```

## 3. Authentication and Authorization

### 3.1 Authentication

All API requests require authentication using JWT tokens:

```
Authorization: Bearer {token}
```

Tokens can be obtained through the authentication API.

### 3.2 Authorization

Access to endpoints is controlled by user permissions:

- `inventory.adjustment.view`: View adjustments
- `inventory.adjustment.create`: Create adjustments
- `inventory.adjustment.edit`: Edit adjustments
- `inventory.adjustment.delete`: Delete adjustments
- `inventory.adjustment.post`: Post adjustments
- `inventory.adjustment.void`: Void adjustments

## 4. Endpoint Categories

### 4.1 Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/inventory/adjustments` | GET | List inventory adjustments |
| `/inventory/adjustments/{id}` | GET | Get adjustment by ID |
| `/inventory/adjustments` | POST | Create new adjustment |
| `/inventory/adjustments/{id}` | PUT | Update adjustment |
| `/inventory/adjustments/{id}` | DELETE | Delete adjustment |
| `/inventory/adjustments/{id}/post` | POST | Post adjustment |
| `/inventory/adjustments/{id}/void` | POST | Void adjustment |

### 4.2 Item Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/inventory/adjustments/{id}/items` | GET | List adjustment items |
| `/inventory/adjustments/{id}/items` | POST | Add item to adjustment |
| `/inventory/adjustments/{id}/items/{itemId}` | PUT | Update adjustment item |
| `/inventory/adjustments/{id}/items/{itemId}` | DELETE | Remove item from adjustment |
| `/inventory/adjustments/{id}/items/bulk` | POST | Bulk add items to adjustment |

### 4.3 Lot Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/inventory/adjustments/{id}/items/{itemId}/lots` | GET | List lots for adjustment item |
| `/inventory/adjustments/{id}/items/{itemId}/lots` | POST | Add lot to adjustment item |
| `/inventory/adjustments/{id}/items/{itemId}/lots/{lotId}` | PUT | Update lot for adjustment item |
| `/inventory/adjustments/{id}/items/{itemId}/lots/{lotId}` | DELETE | Remove lot from adjustment item |

### 4.4 Financial Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/inventory/adjustments/{id}/journal` | GET | Get journal entries for adjustment |
| `/inventory/adjustments/{id}/cost-impact` | GET | Get cost impact analysis for adjustment |
| `/inventory/adjustments/{id}/financial-summary` | GET | Get financial summary for adjustment |

### 4.5 Document Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/inventory/adjustments/{id}/documents` | GET | List documents for adjustment |
| `/inventory/adjustments/{id}/documents` | POST | Upload document for adjustment |
| `/inventory/adjustments/{id}/documents/{documentId}` | GET | Get document by ID |
| `/inventory/adjustments/{id}/documents/{documentId}` | DELETE | Delete document |

### 4.6 Comment Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/inventory/adjustments/{id}/comments` | GET | List comments for adjustment |
| `/inventory/adjustments/{id}/comments` | POST | Add comment to adjustment |
| `/inventory/adjustments/{id}/comments/{commentId}` | PUT | Update comment |
| `/inventory/adjustments/{id}/comments/{commentId}` | DELETE | Delete comment |

### 4.7 Activity Log Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/inventory/adjustments/{id}/activity` | GET | Get activity log for adjustment |

### 4.8 Reference Data Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/inventory/adjustment-reasons` | GET | List adjustment reason codes |
| `/inventory/adjustment-reasons/{id}` | GET | Get reason code by ID |
| `/inventory/adjustment-reasons` | POST | Create new reason code |
| `/inventory/adjustment-reasons/{id}` | PUT | Update reason code |
| `/inventory/adjustment-reasons/{id}` | DELETE | Delete reason code |

### 4.9 Reporting Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/reports/inventory/adjustments` | GET | Generate adjustment report |
| `/reports/inventory/adjustments/summary` | GET | Generate adjustment summary report |
| `/reports/inventory/adjustments/by-reason` | GET | Generate report by reason code |
| `/reports/inventory/adjustments/by-location` | GET | Generate report by location |
| `/reports/inventory/adjustments/by-item` | GET | Generate report by item |

## 5. Common Request Parameters

### 5.1 Filtering Parameters

Most list endpoints support the following filtering parameters:

- `status`: Filter by adjustment status
- `type`: Filter by adjustment type (IN/OUT)
- `location`: Filter by location ID
- `reason`: Filter by reason code
- `dateFrom`: Filter by date range start
- `dateTo`: Filter by date range end
- `createdBy`: Filter by creator user ID
- `search`: Search term for text search

### 5.2 Include Parameters

Many endpoints support including related data:

- `include`: Comma-separated list of related data to include

Example:
```
GET /inventory/adjustments/123?include=items,journal,comments
```

### 5.3 Field Selection

Endpoints support selecting specific fields:

- `fields`: Comma-separated list of fields to include in response

Example:
```
GET /inventory/adjustments?fields=id,date,status,type,location
```

## 6. Common Response Formats

### 6.1 Single Resource Response

```json
{
  "data": {
    "id": "ADJ-2401-0001",
    "date": "2024-03-27T10:00:00Z",
    "type": "IN",
    "status": "Draft",
    "location": "Main Warehouse",
    "locationCode": "WH-001",
    "reason": "Physical Count Variance",
    "description": "Adjustment based on monthly physical inventory count",
    "department": "Warehouse",
    "totals": {
      "inQty": 100,
      "outQty": 0,
      "totalCost": 1500.00
    },
    "createdBy": "john.doe",
    "createdAt": "2024-03-27T09:30:00Z"
  }
}
```

### 6.2 Collection Response

```json
{
  "data": [
    {
      "id": "ADJ-2401-0001",
      "date": "2024-03-27T10:00:00Z",
      "type": "IN",
      "status": "Draft",
      "location": "Main Warehouse",
      "reason": "Physical Count Variance",
      "totals": {
        "inQty": 100,
        "outQty": 0,
        "totalCost": 1500.00
      }
    },
    {
      "id": "ADJ-2401-0002",
      "date": "2024-03-26T14:30:00Z",
      "type": "OUT",
      "status": "Posted",
      "location": "Main Warehouse",
      "reason": "Damaged Goods",
      "totals": {
        "inQty": 0,
        "outQty": 50,
        "totalCost": 750.00
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "totalItems": 2,
    "totalPages": 1
  }
}
```

### 6.3 Action Response

```json
{
  "success": true,
  "message": "Adjustment successfully posted",
  "data": {
    "id": "ADJ-2401-0001",
    "status": "Posted",
    "postedBy": "john.doe",
    "postedAt": "2024-03-27T11:15:00Z"
  }
}
```

## 7. Error Handling

### 7.1 Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": [
      {
        "field": "date",
        "message": "Date cannot be in the future"
      },
      {
        "field": "items",
        "message": "At least one item is required"
      }
    ]
  }
}
```

### 7.2 Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Permission denied |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Validation failed |
| `BUSINESS_RULE_VIOLATION` | 422 | Business rule violation |
| `CONFLICT` | 409 | Resource conflict |
| `INTERNAL_ERROR` | 500 | Internal server error |

### 7.3 Business Rule Errors

Business rule violations return specific error codes:

```json
{
  "error": {
    "code": "BUSINESS_RULE_VIOLATION",
    "message": "Cannot post adjustment",
    "details": {
      "rule": "ADJ_PRC_001",
      "message": "Negative stock balance is not allowed"
    }
  }
}
```

## 8. Rate Limiting

### 8.1 Rate Limit Headers

The API includes rate limit headers in responses:

```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 99
X-RateLimit-Reset: 1616979600
```

### 8.2 Rate Limit Exceeded

When rate limit is exceeded, the API returns:

```
HTTP/1.1 429 Too Many Requests
```

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 60 seconds.",
    "retryAfter": 60
  }
}
```

## 9. Related Documentation

- [INV-ADJ-API-Endpoints-Core](./INV-ADJ-API-Endpoints-Core.md)
- [INV-ADJ-API-Endpoints-Items](./INV-ADJ-API-Endpoints-Items.md)
- [INV-ADJ-API-Endpoints-Financial](./INV-ADJ-API-Endpoints-Financial.md)
- [INV-ADJ-API-Endpoints-Documents](./INV-ADJ-API-Endpoints-Documents.md)
- [INV-ADJ-API-Endpoints-Comments](./INV-ADJ-API-Endpoints-Comments.md)
- [API Authentication](../api-authentication.md)
- [API Conventions](../api-conventions.md) 