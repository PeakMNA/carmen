# Lot Transfer Module - API and Stored Procedures Documentation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## 1. Overview

This document outlines the API endpoints and stored procedures for managing lot transfers between locations, including validation rules and workflow.

### 1.1 Transfer Types

- **Internal Transfer**: Between warehouses/locations within the same facility
- **Inter-facility Transfer**: Between different facilities
- **Quality Hold Transfer**: To/from quality control areas
- **Return Transfer**: To return/rejected items area
- **Quarantine Transfer**: To/from quarantine areas

## 2. Stored Procedures

### 2.1 Transfer Management

#### sp_InitiateLotTransfer
```sql
PROCEDURE sp_InitiateLotTransfer
  @TransferId uniqueidentifier,
  @ItemId uniqueidentifier,
  @LotNumber nvarchar(50),
  @FromLocationId uniqueidentifier,
  @ToLocationId uniqueidentifier,
  @Quantity decimal(18,2),
  @TransferType nvarchar(50),
  @RequestedBy nvarchar(50),
  @ExpectedDate datetime,
  @QualityCheckRequired bit = 0,
  @Notes nvarchar(500) = NULL
RETURNS uniqueidentifier
```

#### sp_ValidateLotTransfer
```sql
PROCEDURE sp_ValidateLotTransfer
  @TransferId uniqueidentifier
RETURNS TABLE (
  IsValid bit,
  ValidationCode nvarchar(50),
  ValidationMessage nvarchar(500),
  Details nvarchar(max)
)
```

#### sp_ProcessLotTransfer
```sql
PROCEDURE sp_ProcessLotTransfer
  @TransferId uniqueidentifier,
  @ProcessedBy nvarchar(50),
  @ActualQuantity decimal(18,2),
  @TransferDate datetime,
  @QualityCheckResults nvarchar(max) = NULL
RETURNS TABLE (
  TransactionId uniqueidentifier,
  Status nvarchar(50),
  FromLocationBalance decimal(18,2),
  ToLocationBalance decimal(18,2),
  TransferDetails nvarchar(max)
)
```

#### sp_CancelLotTransfer
```sql
PROCEDURE sp_CancelLotTransfer
  @TransferId uniqueidentifier,
  @CancelledBy nvarchar(50),
  @Reason nvarchar(500)
RETURNS bit
```

### 2.2 Quality Control

#### sp_QualityCheckForTransfer
```sql
PROCEDURE sp_QualityCheckForTransfer
  @TransferId uniqueidentifier,
  @CheckedBy nvarchar(50),
  @Parameters nvarchar(max), -- JSON with quality parameters
  @Status nvarchar(50),
  @Notes nvarchar(500) = NULL
RETURNS TABLE (
  CheckId uniqueidentifier,
  Status nvarchar(50),
  NextActions nvarchar(max)
)
```

### 2.3 Transfer Tracking

#### sp_GetTransferHistory
```sql
PROCEDURE sp_GetTransferHistory
  @ItemId uniqueidentifier = NULL,
  @LotNumber nvarchar(50) = NULL,
  @LocationId uniqueidentifier = NULL,
  @FromDate datetime = NULL,
  @ToDate datetime = NULL
RETURNS TABLE (
  TransferId uniqueidentifier,
  TransferType nvarchar(50),
  Status nvarchar(50),
  FromLocation nvarchar(100),
  ToLocation nvarchar(100),
  Quantity decimal(18,2),
  TransferDate datetime,
  CompletionDate datetime,
  QualityStatus nvarchar(50),
  TransferDetails nvarchar(max)
)
```

## 3. API Endpoints

### 3.1 Transfer Management

#### Initiate Transfer
```typescript
// Request
POST /api/lot-transfers
{
  "itemId": "ITEM-001",
  "lotNumber": "LOT-2401-0001",
  "fromLocationId": "LOC-001",
  "toLocationId": "LOC-002",
  "quantity": 50,
  "transferType": "Internal",
  "expectedDate": "2024-03-28T10:00:00Z",
  "qualityCheckRequired": true,
  "notes": "Regular stock rotation",
  "storageConditions": {
    "temperature": "20-25°C",
    "humidity": "45-55%",
    "specialInstructions": "Handle with care"
  }
}

// Response
{
  "transferId": "TRF-2401-0001",
  "status": "Pending",
  "validations": {
    "isValid": true,
    "checks": [
      {
        "type": "QuantityAvailable",
        "status": "Passed",
        "details": {
          "availableQuantity": 98,
          "requestedQuantity": 50
        }
      },
      {
        "type": "LocationCompatibility",
        "status": "Passed",
        "details": {
          "fromLocation": {
            "type": "Main Warehouse",
            "conditions": { "temperature": "20-25°C" }
          },
          "toLocation": {
            "type": "Distribution Center",
            "conditions": { "temperature": "20-25°C" }
          }
        }
      },
      {
        "type": "LotValidity",
        "status": "Passed",
        "details": {
          "expiryDate": "2025-01-15T00:00:00Z",
          "remainingShelfLife": "290 days"
        }
      }
    ]
  },
  "transferDetails": {
    "item": {
      "id": "ITEM-001",
      "name": "Laptop Dell XPS 13",
      "lotNumber": "LOT-2401-0001"
    },
    "locations": {
      "from": {
        "id": "LOC-001",
        "name": "Main Warehouse",
        "type": "Storage"
      },
      "to": {
        "id": "LOC-002",
        "name": "Distribution Center",
        "type": "Distribution"
      }
    },
    "quantity": 50,
    "scheduledDate": "2024-03-28T10:00:00Z",
    "qualityCheck": {
      "required": true,
      "parameters": [
        "visualInspection",
        "packagingCheck",
        "temperatureLog"
      ]
    }
  }
}
```

#### Process Transfer
```typescript
// Request
POST /api/lot-transfers/TRF-2401-0001/process
{
  "actualQuantity": 50,
  "transferDate": "2024-03-28T10:00:00Z",
  "qualityCheck": {
    "status": "Passed",
    "checkedBy": "USER456",
    "parameters": {
      "visualInspection": "Pass",
      "packagingCheck": "Pass",
      "temperatureLog": {
        "min": 22,
        "max": 24,
        "status": "Within Range"
      }
    },
    "notes": "All items in good condition"
  },
  "transportDetails": {
    "method": "Internal Transport",
    "conditions": {
      "temperature": 23,
      "humidity": 50
    }
  }
}

// Response
{
  "transactionId": "TRF-TXN-001",
  "status": "Completed",
  "locations": {
    "from": {
      "locationId": "LOC-001",
      "previousBalance": 98,
      "newBalance": 48
    },
    "to": {
      "locationId": "LOC-002",
      "previousBalance": 0,
      "newBalance": 50
    }
  },
  "qualityCheck": {
    "status": "Passed",
    "checkId": "QC-001",
    "timestamp": "2024-03-28T09:45:00Z"
  },
  "lotStatus": {
    "lotNumber": "LOT-2401-0001",
    "qualityStatus": "Good",
    "shelfLifeStatus": "Valid"
  }
}
```

### 3.2 Transfer Tracking

#### Get Transfer History
```typescript
// Request
GET /api/lot-transfers/history?lotNumber=LOT-2401-0001

// Response
{
  "lotNumber": "LOT-2401-0001",
  "itemDetails": {
    "id": "ITEM-001",
    "name": "Laptop Dell XPS 13"
  },
  "transfers": [
    {
      "transferId": "TRF-2401-0001",
      "type": "Internal",
      "status": "Completed",
      "fromLocation": {
        "id": "LOC-001",
        "name": "Main Warehouse"
      },
      "toLocation": {
        "id": "LOC-002",
        "name": "Distribution Center"
      },
      "quantity": 50,
      "dates": {
        "requested": "2024-03-27T15:00:00Z",
        "scheduled": "2024-03-28T10:00:00Z",
        "completed": "2024-03-28T10:15:00Z"
      },
      "qualityCheck": {
        "status": "Passed",
        "checkId": "QC-001"
      }
    }
  ],
  "locationHistory": [
    {
      "locationId": "LOC-001",
      "period": {
        "from": "2024-03-26T10:00:00Z",
        "to": "2024-03-28T10:00:00Z"
      },
      "quantity": 98
    },
    {
      "locationId": "LOC-002",
      "period": {
        "from": "2024-03-28T10:15:00Z",
        "to": null
      },
      "quantity": 50
    }
  ]
}
```

## 4. Validation Rules

### 4.1 Pre-Transfer Validations

1. **Quantity Validation**
   - Available quantity check
   - Minimum transfer quantity check
   - Maximum transfer quantity check

2. **Location Validation**
   - Location compatibility check
   - Storage condition compatibility
   - Location status check (active/inactive)
   - Transfer path validation

3. **Lot Validation**
   - Lot existence check
   - Expiry date validation
   - Quality status check
   - Hold status check
   - Quarantine status check

4. **Quality Check Requirements**
   - Based on item category
   - Based on transfer type
   - Based on storage condition changes
   - Based on transport duration

### 4.2 Transfer Process Validations

1. **Documentation Requirements**
   - Quality check documentation
   - Transport condition logs
   - Handler certifications
   - Special handling requirements

2. **Condition Monitoring**
   - Temperature monitoring
   - Humidity monitoring
   - Shock monitoring (if applicable)
   - Time monitoring

3. **Quantity Reconciliation**
   - Quantity match check
   - Damage assessment
   - Loss assessment
   - Variance reporting

## 5. Error Handling

```typescript
// Location Incompatibility Error
{
  "error": "LocationIncompatibilityError",
  "message": "Destination location not compatible with item storage requirements",
  "details": {
    "itemRequirements": {
      "temperature": "20-25°C",
      "humidity": "45-55%"
    },
    "locationConditions": {
      "temperature": "15-20°C",
      "humidity": "60-70%"
    }
  }
}

// Insufficient Quantity Error
{
  "error": "InsufficientQuantityError",
  "message": "Available quantity less than requested transfer quantity",
  "details": {
    "lotNumber": "LOT-2401-0001",
    "availableQuantity": 48,
    "requestedQuantity": 50,
    "locationId": "LOC-001"
  }
}

// Quality Hold Error
{
  "error": "QualityHoldError",
  "message": "Lot is currently under quality hold",
  "details": {
    "lotNumber": "LOT-2401-0001",
    "holdType": "Quality Investigation",
    "holdReference": "QH-2401-0001",
    "holdDate": "2024-03-27T09:00:00Z"
  }
}

// Transfer Path Error
{
  "error": "InvalidTransferPathError",
  "message": "Direct transfer not allowed between these locations",
  "details": {
    "fromLocation": "Production",
    "toLocation": "Distribution",
    "requiredPath": ["Production", "QC", "Warehouse", "Distribution"]
  }
}
``` 