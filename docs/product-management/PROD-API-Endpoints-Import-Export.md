# Product Import/Export API Endpoints

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
This document provides detailed information about the Product Import/Export API endpoints in the Procurement & Inventory Management System.

## Authentication

All API endpoints require authentication. Include a valid JWT token in the `Authorization` header:

```
Authorization: Bearer {your_jwt_token}
```

## Base URL

All endpoints are relative to the API base URL: `/api`

## Endpoints

### Export Products

Exports products to a file in the specified format.

**URL**: `/products/export`  
**Method**: `GET`  
**Query Parameters**:

| Parameter     | Type    | Required | Description                                            |
|---------------|---------|----------|--------------------------------------------------------|
| format        | string  | No       | Export format (csv, xlsx, json) - Default: xlsx        |
| categoryId    | string  | No       | Filter products by category ID                         |
| includeSubcategories | boolean | No | Include products from subcategories (default: true)   |
| status        | string  | No       | Filter by product status (active, inactive, all)       |
| withInventory | boolean | No       | Include inventory data (default: false)                |
| withPricing   | boolean | No       | Include pricing information (default: false)           |
| withUnits     | boolean | No       | Include unit conversion data (default: false)          |
| withAttributes| boolean | No       | Include custom attributes (default: true)              |
| fields        | string  | No       | Comma-separated list of fields to include in export    |

**Success Response**: File download

The exported file will contain product data based on the specified parameters. If not specified, the default format is Excel (xlsx).

### Import Products

Imports products from a file.

**URL**: `/products/import`  
**Method**: `POST`  
**Content-Type**: `multipart/form-data`  
**Request Body**:

| Parameter       | Type    | Required | Description                                       |
|-----------------|---------|----------|---------------------------------------------------|
| file            | File    | Yes      | CSV or Excel file containing product data         |
| updateExisting  | boolean | No       | Update existing products if code matches (default: false) |
| createMissing   | boolean | No       | Create categories if they don't exist (default: false) |
| createUnits     | boolean | No       | Create units if they don't exist (default: false) |
| dryRun          | boolean | No       | Validate without importing (default: false)       |

**Success Response**:

```json
{
  "success": true,
  "data": {
    "imported": 32,
    "updated": 5,
    "skipped": 2,
    "failed": 3,
    "errors": [
      {
        "row": 4,
        "code": "PROD-1234",
        "message": "Invalid category specified"
      },
      {
        "row": 7,
        "code": "PROD-5678",
        "message": "Missing required field: name"
      },
      {
        "row": 12,
        "code": "PROD-9012",
        "message": "Invalid unit: gallons"
      }
    ],
    "message": "Product import completed"
  }
}
```

### Export Template

Retrieves a template file for product imports.

**URL**: `/products/export-template`  
**Method**: `GET`  
**Query Parameters**:

| Parameter  | Type   | Required | Description                                     |
|------------|--------|----------|-------------------------------------------------|
| format     | string | No       | File format (csv, xlsx) - Default: xlsx         |
| categoryId | string | No       | Include category-specific attributes if provided|
| type       | string | No       | Template type (basic, full) - Default: basic    |

**Success Response**: Template file download

The template includes headers and example data to guide users on how to format their import files correctly.

### Validate Import File

Validates an import file without importing the data.

**URL**: `/products/validate-import`  
**Method**: `POST`  
**Content-Type**: `multipart/form-data`  
**Request Body**:

| Parameter | Type | Required | Description                           |
|-----------|------|----------|---------------------------------------|
| file      | File | Yes      | CSV or Excel file to validate         |

**Success Response**:

```json
{
  "success": true,
  "data": {
    "valid": false,
    "validRows": 42,
    "invalidRows": 3,
    "errors": [
      {
        "row": 4,
        "code": "PROD-1234",
        "field": "category",
        "message": "Invalid category specified"
      },
      {
        "row": 7,
        "code": "PROD-5678",
        "field": "name",
        "message": "Missing required field"
      },
      {
        "row": 12,
        "code": "PROD-9012",
        "field": "unit",
        "message": "Invalid unit: gallons"
      }
    ],
    "warnings": [
      {
        "row": 15,
        "code": "PROD-3456",
        "field": "description",
        "message": "Description will be truncated to 500 characters"
      }
    ]
  }
}
```

### Import Product Images

Imports multiple product images in bulk.

**URL**: `/products/import-images`  
**Method**: `POST`  
**Content-Type**: `multipart/form-data`  
**Request Body**:

| Parameter   | Type       | Required | Description                                      |
|-------------|------------|----------|--------------------------------------------------|
| images      | File Array | Yes      | ZIP file containing product images               |
| mappingFile | File       | Yes      | CSV file mapping product codes to image filenames|

**Success Response**:

```json
{
  "success": true,
  "data": {
    "processed": 25,
    "successful": 22,
    "failed": 3,
    "errors": [
      {
        "productCode": "PROD-1234",
        "filename": "prod1234.jpg",
        "message": "Product not found"
      },
      {
        "productCode": "PROD-5678",
        "filename": "prod5678.png",
        "message": "Invalid image format"
      },
      {
        "productCode": "PROD-9012",
        "filename": "missing.jpg",
        "message": "Image file not found in ZIP"
      }
    ],
    "message": "Product images import completed"
  }
}
```

### Export Inventory

Exports inventory data for products.

**URL**: `/products/export-inventory`  
**Method**: `GET`  
**Query Parameters**:

| Parameter       | Type    | Required | Description                                      |
|-----------------|---------|----------|--------------------------------------------------|
| format          | string  | No       | Export format (csv, xlsx, json) - Default: xlsx  |
| locationId      | string  | No       | Filter by specific location                      |
| categoryId      | string  | No       | Filter by category                               |
| includeZeroStock| boolean | No       | Include items with zero stock (default: false)   |
| groupBy         | string  | No       | Group by (product, location, category)           |
| asOfDate        | string  | No       | Inventory as of specific date (YYYY-MM-DD)       |

**Success Response**: File download

The exported file will contain inventory data based on the specified parameters.

### Import Inventory Data

Imports inventory data for initial setup or adjustments.

**URL**: `/products/import-inventory`  
**Method**: `POST`  
**Content-Type**: `multipart/form-data`  
**Request Body**:

| Parameter    | Type    | Required | Description                                      |
|--------------|---------|----------|--------------------------------------------------|
| file         | File    | Yes      | CSV or Excel file containing inventory data      |
| adjustmentType| string | Yes      | Type of adjustment (initial, correction, cycle-count) |
| locationId   | string  | Yes      | Location ID for the inventory                    |
| notes        | string  | No       | Notes regarding the inventory import             |
| createAdjustment | boolean | No   | Create inventory adjustment records (default: true) |
| dryRun      | boolean  | No       | Validate without importing (default: false)      |

**Success Response**:

```json
{
  "success": true,
  "data": {
    "processed": 45,
    "updated": 42,
    "failed": 3,
    "adjustmentId": "ADJ-2301-0001",
    "errors": [
      {
        "row": 4,
        "productCode": "PROD-1234",
        "message": "Product not found"
      },
      {
        "row": 7,
        "productCode": "PROD-5678",
        "message": "Invalid quantity: must be a number"
      },
      {
        "row": 12,
        "productCode": "PROD-9012",
        "message": "Missing required field: quantity"
      }
    ],
    "message": "Inventory import completed"
  }
}
```

### Export Product Cost History

Exports cost history data for products.

**URL**: `/products/export-cost-history`  
**Method**: `GET`  
**Query Parameters**:

| Parameter    | Type    | Required | Description                                      |
|--------------|---------|----------|--------------------------------------------------|
| format       | string  | No       | Export format (csv, xlsx, json) - Default: xlsx  |
| productId    | string  | No       | Filter by specific product                       |
| categoryId   | string  | No       | Filter by category                               |
| vendorId     | string  | No       | Filter by vendor                                 |
| startDate    | string  | No       | Filter by start date (YYYY-MM-DD)                |
| endDate      | string  | No       | Filter by end date (YYYY-MM-DD)                  |

**Success Response**: File download

The exported file will contain cost history data based on the specified parameters.

### Import Price Lists

Imports price lists for products from vendors.

**URL**: `/products/import-prices`  
**Method**: `POST`  
**Content-Type**: `multipart/form-data`  
**Request Body**:

| Parameter    | Type    | Required | Description                                      |
|--------------|---------|----------|--------------------------------------------------|
| file         | File    | Yes      | CSV or Excel file containing price data          |
| vendorId     | string  | Yes      | Vendor ID for the price list                     |
| effectiveDate| string  | Yes      | Effective date for prices (YYYY-MM-DD)           |
| expiryDate   | string  | No       | Expiry date for prices (YYYY-MM-DD)              |
| updateExisting | boolean | No     | Update existing prices (default: true)           |
| createMissing | boolean | No      | Create products if missing (default: false)      |
| dryRun       | boolean | No       | Validate without importing (default: false)      |

**Success Response**:

```json
{
  "success": true,
  "data": {
    "processed": 78,
    "updated": 65,
    "skipped": 10,
    "failed": 3,
    "priceListId": "PL-2023-V001",
    "errors": [
      {
        "row": 4,
        "productCode": "PROD-1234",
        "message": "Product not found"
      },
      {
        "row": 7,
        "productCode": "PROD-5678",
        "message": "Invalid price: must be a positive number"
      },
      {
        "row": 12,
        "productCode": "PROD-9012",
        "message": "Missing required field: price"
      }
    ],
    "message": "Price list import completed"
  }
}
```

## Field Mappings

When importing or exporting products, the following fields are available:

### Basic Fields

| Field Name     | Required | Type    | Description                               |
|----------------|----------|---------|-------------------------------------------|
| code           | Yes      | string  | Unique product code                       |
| name           | Yes      | string  | Product name                              |
| description    | No       | string  | Product description                       |
| categoryId     | Yes      | string  | Category ID or code                       |
| status         | Yes      | string  | Product status (active/inactive)          |
| primaryUnit    | Yes      | string  | Primary unit of measurement               |
| barcode        | No       | string  | Product barcode                           |
| taxType        | No       | string  | Tax type (Added/Included/None)            |
| taxRate        | No       | number  | Tax rate percentage                       |

### Inventory Fields

| Field Name         | Required | Type    | Description                           |
|--------------------|----------|---------|---------------------------------------|
| minimumStock       | No       | number  | Minimum stock level                   |
| maximumStock       | No       | number  | Maximum stock level                   |
| reorderPoint       | No       | number  | Reorder point                         |
| reorderQuantity    | No       | number  | Suggested reorder quantity            |
| locationId         | Yes*     | string  | Location ID (for inventory import)    |
| quantity           | Yes*     | number  | Quantity (for inventory import)       |
| lotId              | No       | string  | Lot/batch ID (for inventory import)   |

### Attribute Fields

| Field Name    | Type    | Description                                        |
|---------------|---------|----------------------------------------------------|
| weight        | number  | Product weight                                     |
| shelfLife     | number  | Shelf life in days                                 |
| storageInstructions | string | Storage instructions                          |
| size          | string  | Product size                                       |
| color         | string  | Product color                                      |
| custom_*      | various | Any custom attribute prefixed with "custom_"       |

### Unit Conversion Fields

| Field Name   | Required | Type   | Description                                |
|--------------|----------|--------|--------------------------------------------|
| unitCode     | Yes      | string | Unit code                                  |
| factor       | Yes      | number | Conversion factor relative to primary unit |
| isOrderUnit  | No       | boolean| Whether this is a purchasing unit          |
| isStockUnit  | No       | boolean| Whether this is a storage unit             |
| isCountUnit  | No       | boolean| Whether this is a counting unit            |

## Error Responses

In case of an error, the API will return:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message describing the issue",
    "details": {}  // Optional additional error details
  }
}
```

### Common Error Codes

| Code                   | Description                                          |
|------------------------|------------------------------------------------------|
| INVALID_REQUEST        | The request format is invalid                        |
| INVALID_FILE_FORMAT    | The uploaded file format is not supported            |
| FILE_TOO_LARGE         | The uploaded file exceeds size limits                |
| PRODUCT_NOT_FOUND      | The referenced product does not exist                |
| CATEGORY_NOT_FOUND     | The referenced category does not exist               |
| UNIT_NOT_FOUND         | The referenced unit does not exist                   |
| LOCATION_NOT_FOUND     | The referenced location does not exist               |
| VENDOR_NOT_FOUND       | The referenced vendor does not exist                 |
| VALIDATION_ERROR       | One or more validation errors occurred               |
| UNAUTHORIZED           | Authentication is required or token is invalid       |
| FORBIDDEN              | User does not have permission for the operation      |
| INTERNAL_SERVER_ERROR  | An unexpected error occurred on the server           |

## Rate Limiting

API requests are limited to:
- 50 requests per minute
- 2000 requests per day

Rate limit headers are included in API responses:
- `X-RateLimit-Limit`: Maximum number of requests allowed per time window
- `X-RateLimit-Remaining`: Number of requests remaining in the current time window
- `X-RateLimit-Reset`: Time when the rate limit will reset (Unix timestamp)

## API Versioning

Current API version: v1

Include the version in the API URL: `/api/v1/products/export`

Future versions (when available) will be accessible at `/api/v2/products/export`, etc. 