# Credit Note Module - API and Stored Procedures Documentation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## 1. API Endpoints

### 1.1 Credit Note Management

#### Get Credit Notes
```typescript
GET /api/credit-notes
Query Parameters: {
  status?: CreditNoteStatus
  poId?: string
  grnId?: string
  department?: string
  fromDate?: string
  toDate?: string
  vendor?: string
  page?: number
  limit?: number
  sortBy?: string
  order?: 'asc' | 'desc'
}
Response: {
  data: CreditNote[]
  total: number
  page: number
  limit: number
}

interface CreditNote {
  id: string
  refNumber: string
  date: string
  poId: string
  poRefNumber: string
  grnId?: string
  grnRefNumber?: string
  status: CreditNoteStatus
  type: CreditNoteType
  reason: string
  location: string
  department: string
  vendor: string
  vendorId: number
  requestedBy: {
    id: string
    name: string
    department: string
  }
  currency: string
  baseCurrencyCode: string
  exchangeRate: number
  items: CreditNoteItem[]
  attachments: Attachment[]
  comments: Comment[]
  totalQuantity: number
  baseSubTotalAmount: number
  subTotalAmount: number
  baseTaxAmount: number
  taxAmount: number
  baseTotalAmount: number
  totalAmount: number
  createdAt: string
  updatedAt: string
}

interface CreditNoteItem {
  id: string
  poItemId: string
  grnItemId?: string
  name: string
  description: string
  unit: string
  quantityReturned: number
  price: number
  taxRate: number
  taxAmount: number
  totalAmount: number
  reason: string
  condition: ItemCondition
  location: string
  warehouseLocation?: string
}

type CreditNoteStatus = 'Draft' | 'Cancelled' | 'Completed'
type CreditNoteType = 'Return' | 'Price Adjustment' | 'Quality Issue' | 'Quantity Discrepancy'
type ItemCondition = 'Damaged' | 'Wrong Item' | 'Quality Issue' | 'Excess Quantity' | 'Other'
```

#### Get Credit Note by ID
```typescript
GET /api/credit-notes/:id
Response: CreditNote
```

#### Create Credit Note
```typescript
POST /api/credit-notes
Body: {
  poId: string
  grnId?: string
  type: CreditNoteType
  reason: string
  date: string
  location: string
  items: {
    poItemId: string
    grnItemId?: string
    quantityReturned: number
    price: number
    reason: string
    condition: ItemCondition
    warehouseLocation?: string
  }[]
  attachments?: {
    fileName: string
    fileType: string
    fileContent: Base64String
  }[]
}
Response: CreditNote
```

### 1.3 Comments Management

#### Get Credit Note Comments
```typescript
GET /api/credit-notes/:creditNoteId/comments
Query Parameters: {
  page?: number
  limit?: number
  sortBy?: 'createdAt' | 'updatedAt'
  order?: 'asc' | 'desc'
}
Response: {
  data: Comment[]
  total: number
  page: number
  limit: number
}

interface Comment {
  id: string
  creditNoteId: string
  userId: string
  userName: string
  userRole: string
  content: string
  type: 'general' | 'system' | 'return'
  visibility: 'public' | 'private' | 'internal'
  attachments?: {
    id: string
    fileName: string
    fileType: string
    fileSize: number
    url: string
  }[]
  mentions?: {
    userId: string
    userName: string
  }[]
  createdAt: string
  updatedAt: string
}
```

#### Add Comment
```typescript
POST /api/credit-notes/:creditNoteId/comments
Body: {
  content: string
  type: 'general' | 'system' | 'return'
  visibility: 'public' | 'private' | 'internal'
  attachments?: {
    fileName: string
    fileType: string
    fileContent: Base64String
  }[]
  mentions?: string[] // userIds
}
Response: Comment
```

### 1.4 Activity Log

#### Get Activity Log
```typescript
GET /api/credit-notes/:creditNoteId/activity-log
Query Parameters: {
  fromDate?: string
  toDate?: string
  type?: ActivityType[]
  user?: string
  page?: number
  limit?: number
}
Response: {
  data: ActivityLogEntry[]
  total: number
  page: number
  limit: number
}

interface ActivityLogEntry {
  id: string
  creditNoteId: string
  type: ActivityType
  action: string
  description: string
  metadata: {
    previousValue?: any
    newValue?: any
    returnDetails?: {
      items: {
        itemId: string
        quantityReturned: number
        condition: ItemCondition
      }[]
    }
    [key: string]: any
  }
  user: {
    id: string
    name: string
    role: string
    department: string
  }
  timestamp: string
  ipAddress?: string
  userAgent?: string
}

type ActivityType = 
  | 'creation'
  | 'modification'
  | 'comment'
  | 'attachment'
  | 'return'
  | 'system'
```

## 2. Stored Procedures

### 2.1 Credit Note Management

#### sp_CreateCreditNote
```sql
PROCEDURE sp_CreateCreditNote
  @POId uniqueidentifier,
  @GRNId uniqueidentifier = NULL,
  @Type nvarchar(50),
  @Reason nvarchar(500),
  @Date datetime,
  @Location nvarchar(100),
  @UserId uniqueidentifier,
  @Items nvarchar(max), -- JSON array of items
  @Output uniqueidentifier OUTPUT
AS
BEGIN
  -- Implementation details
END
```

#### sp_GetCreditNotes
```sql
PROCEDURE sp_GetCreditNotes
  @Status nvarchar(50) = NULL,
  @POId uniqueidentifier = NULL,
  @GRNId uniqueidentifier = NULL,
  @Department nvarchar(100) = NULL,
  @FromDate datetime = NULL,
  @ToDate datetime = NULL,
  @Vendor nvarchar(100) = NULL,
  @Page int = 1,
  @Limit int = 20,
  @SortBy nvarchar(50) = 'date',
  @Order nvarchar(4) = 'desc'
AS
BEGIN
  -- Implementation details
END
```

#### sp_GetCreditNoteById
```sql
PROCEDURE sp_GetCreditNoteById
  @CreditNoteId uniqueidentifier
AS
BEGIN
  -- Implementation details
END
```

#### sp_UpdateCreditNote
```sql
PROCEDURE sp_UpdateCreditNote
  @CreditNoteId uniqueidentifier,
  @Type nvarchar(50) = NULL,
  @Reason nvarchar(500) = NULL,
  @Date datetime = NULL,
  @Location nvarchar(100) = NULL,
  @UserId uniqueidentifier,
  @Items nvarchar(max) = NULL -- JSON array of items
AS
BEGIN
  -- Implementation details
END
```

#### sp_CancelCreditNote
```sql
PROCEDURE sp_CancelCreditNote
  @CreditNoteId uniqueidentifier,
  @UserId uniqueidentifier,
  @Reason nvarchar(500)
AS
BEGIN
  -- Implementation details
END
```

#### sp_CompleteCreditNote
```sql
PROCEDURE sp_CompleteCreditNote
  @CreditNoteId uniqueidentifier,
  @UserId uniqueidentifier
AS
BEGIN
  -- Implementation details
END
```

### 2.3 Comments Management

#### sp_GetCreditNoteComments
```sql
PROCEDURE sp_GetCreditNoteComments
  @CreditNoteId uniqueidentifier,
  @Page int = 1,
  @Limit int = 20,
  @SortBy nvarchar(50) = 'createdAt',
  @Order nvarchar(4) = 'desc'
AS
BEGIN
  -- Implementation details
END
```

#### sp_AddCreditNoteComment
```sql
PROCEDURE sp_AddCreditNoteComment
  @CreditNoteId uniqueidentifier,
  @UserId uniqueidentifier,
  @Content nvarchar(max),
  @Type nvarchar(50),
  @Visibility nvarchar(50),
  @Attachments nvarchar(max) = NULL, -- JSON array of attachments
  @Mentions nvarchar(max) = NULL, -- JSON array of user IDs
  @Output uniqueidentifier OUTPUT
AS
BEGIN
  -- Implementation details
END
```

### 2.4 Activity Log

#### sp_LogCreditNoteActivity
```sql
PROCEDURE sp_LogCreditNoteActivity
  @CreditNoteId uniqueidentifier,
  @Type nvarchar(50),
  @Action nvarchar(100),
  @Description nvarchar(500),
  @Metadata nvarchar(max), -- JSON object with additional data
  @UserId uniqueidentifier,
  @IPAddress nvarchar(50) = NULL,
  @UserAgent nvarchar(500) = NULL
AS
BEGIN
  -- Implementation details
END
```

#### sp_GetCreditNoteActivityLog
```sql
PROCEDURE sp_GetCreditNoteActivityLog
  @CreditNoteId uniqueidentifier,
  @FromDate datetime = NULL,
  @ToDate datetime = NULL,
  @Type nvarchar(max) = NULL, -- JSON array of activity types
  @User nvarchar(100) = NULL,
  @Page int = 1,
  @Limit int = 20
AS
BEGIN
  -- Implementation details
END
```

### 2.5 Inventory Management

#### sp_ProcessCreditNoteInventory
```sql
PROCEDURE sp_ProcessCreditNoteInventory
  @CreditNoteId uniqueidentifier,
  @UserId uniqueidentifier
AS
BEGIN
  -- Implementation details
END
```

#### sp_GetInventoryImpact
```sql
PROCEDURE sp_GetInventoryImpact
  @CreditNoteId uniqueidentifier
AS
BEGIN
  -- Implementation details
END
```

### 2.6 Financial Processing

#### sp_ProcessCreditNoteFinancials
```sql
PROCEDURE sp_ProcessCreditNoteFinancials
  @CreditNoteId uniqueidentifier,
  @UserId uniqueidentifier
AS
BEGIN
  -- Implementation details
END
```

#### sp_GetFinancialImpact
```sql
PROCEDURE sp_GetFinancialImpact
  @CreditNoteId uniqueidentifier
AS
BEGIN
  -- Implementation details
END
```

## 3. Example Request/Response Payloads

### 3.1 Create Credit Note

#### Request
```json
POST /api/credit-notes
{
  "poId": "550e8400-e29b-41d4-a716-446655440000",
  "grnId": "550e8400-e29b-41d4-a716-446655440001",
  "type": "Return",
  "reason": "Damaged items received",
  "date": "2024-03-15T10:00:00Z",
  "location": "Main Warehouse",
  "items": [
    {
      "poItemId": "550e8400-e29b-41d4-a716-446655440002",
      "grnItemId": "550e8400-e29b-41d4-a716-446655440003",
      "quantityReturned": 5,
      "price": 10.50,
      "reason": "Items damaged during shipping",
      "condition": "Damaged",
      "warehouseLocation": "Shelf A-123"
    },
    {
      "poItemId": "550e8400-e29b-41d4-a716-446655440004",
      "grnItemId": "550e8400-e29b-41d4-a716-446655440005",
      "quantityReturned": 2,
      "price": 25.75,
      "reason": "Wrong items sent",
      "condition": "Wrong Item",
      "warehouseLocation": "Shelf B-456"
    }
  ],
  "attachments": [
    {
      "fileName": "damage_photo.jpg",
      "fileType": "image/jpeg",
      "fileContent": "base64encodedcontent..."
    }
  ]
}
```

#### Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440006",
  "refNumber": "CN-2401-0001",
  "date": "2024-03-15T10:00:00Z",
  "poId": "550e8400-e29b-41d4-a716-446655440000",
  "poRefNumber": "PO-2401-0001",
  "grnId": "550e8400-e29b-41d4-a716-446655440001",
  "grnRefNumber": "GRN-2401-0001",
  "status": "Draft",
  "type": "Return",
  "reason": "Damaged items received",
  "location": "Main Warehouse",
  "department": "Purchasing",
  "vendor": "Acme Supplies",
  "vendorId": 12345,
  "requestedBy": {
    "id": "550e8400-e29b-41d4-a716-446655440007",
    "name": "John Doe",
    "department": "Purchasing"
  },
  "currency": "USD",
  "baseCurrencyCode": "USD",
  "exchangeRate": 1,
  "items": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440008",
      "poItemId": "550e8400-e29b-41d4-a716-446655440002",
      "grnItemId": "550e8400-e29b-41d4-a716-446655440003",
      "name": "Widget A",
      "description": "Standard Widget Type A",
      "unit": "EA",
      "quantityReturned": 5,
      "price": 10.50,
      "taxRate": 7,
      "taxAmount": 3.68,
      "totalAmount": 56.18,
      "reason": "Items damaged during shipping",
      "condition": "Damaged",
      "location": "Main Warehouse",
      "warehouseLocation": "Shelf A-123"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440009",
      "poItemId": "550e8400-e29b-41d4-a716-446655440004",
      "grnItemId": "550e8400-e29b-41d4-a716-446655440005",
      "name": "Widget B",
      "description": "Premium Widget Type B",
      "unit": "EA",
      "quantityReturned": 2,
      "price": 25.75,
      "taxRate": 7,
      "taxAmount": 3.61,
      "totalAmount": 55.11,
      "reason": "Wrong items sent",
      "condition": "Wrong Item",
      "location": "Main Warehouse",
      "warehouseLocation": "Shelf B-456"
    }
  ],
  "attachments": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440010",
      "fileName": "damage_photo.jpg",
      "fileType": "image/jpeg",
      "fileSize": 256000,
      "url": "/api/attachments/550e8400-e29b-41d4-a716-446655440010"
    }
  ],
  "comments": [],
  "totalQuantity": 7,
  "baseSubTotalAmount": 104.00,
  "subTotalAmount": 104.00,
  "baseTaxAmount": 7.29,
  "taxAmount": 7.29,
  "baseTotalAmount": 111.29,
  "totalAmount": 111.29,
  "createdAt": "2024-03-15T10:05:23Z",
  "updatedAt": "2024-03-15T10:05:23Z"
}
```

### 3.2 Complete Credit Note

#### Request
```json
POST /api/credit-notes/550e8400-e29b-41d4-a716-446655440006/complete
{}
```

#### Response
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440006",
  "refNumber": "CN-2401-0001",
  "status": "Completed",
  "updatedAt": "2024-03-15T14:30:45Z",
  "message": "Credit note has been completed successfully"
}
```

### 3.3 Get Inventory Impact

#### Request
```json
GET /api/credit-notes/550e8400-e29b-41d4-a716-446655440006/inventory-impact
```

#### Response
```json
{
  "creditNoteId": "550e8400-e29b-41d4-a716-446655440006",
  "refNumber": "CN-2401-0001",
  "items": [
    {
      "itemId": "550e8400-e29b-41d4-a716-446655440008",
      "itemCode": "WID-A",
      "itemName": "Widget A",
      "quantityReturned": 5,
      "unit": "EA",
      "warehouseLocation": "Shelf A-123",
      "lotNumber": "LOT-2401-0001",
      "expiryDate": "2025-12-31",
      "currentStock": 50,
      "newStock": 55,
      "costImpact": 52.50
    },
    {
      "itemId": "550e8400-e29b-41d4-a716-446655440009",
      "itemCode": "WID-B",
      "itemName": "Widget B",
      "quantityReturned": 2,
      "unit": "EA",
      "warehouseLocation": "Shelf B-456",
      "lotNumber": "LOT-2401-0002",
      "expiryDate": "2025-10-15",
      "currentStock": 25,
      "newStock": 27,
      "costImpact": 51.50
    }
  ],
  "totalQuantityReturned": 7,
  "totalCostImpact": 104.00,
  "processingDate": "2024-03-15T14:30:45Z",
  "processedBy": {
    "id": "550e8400-e29b-41d4-a716-446655440007",
    "name": "John Doe"
  }
}
```

### 3.4 Get Financial Impact

#### Request
```json
GET /api/credit-notes/550e8400-e29b-41d4-a716-446655440006/financial-impact
```

#### Response
```json
{
  "creditNoteId": "550e8400-e29b-41d4-a716-446655440006",
  "refNumber": "CN-2401-0001",
  "journalEntries": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440011",
      "accountCode": "2100",
      "accountName": "Accounts Payable",
      "debit": 111.29,
      "credit": 0,
      "description": "Credit note CN-2401-0001 for vendor Acme Supplies"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440012",
      "accountCode": "1200",
      "accountName": "Inventory",
      "debit": 0,
      "credit": 104.00,
      "description": "Inventory return for credit note CN-2401-0001"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440013",
      "accountCode": "2200",
      "accountName": "Sales Tax Payable",
      "debit": 0,
      "credit": 7.29,
      "description": "Tax adjustment for credit note CN-2401-0001"
    }
  ],
  "taxEntries": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440014",
      "taxCode": "VAT-7",
      "taxRate": 7,
      "taxableAmount": 104.00,
      "taxAmount": 7.29,
      "description": "VAT on returned items"
    }
  ],
  "totalDebit": 111.29,
  "totalCredit": 111.29,
  "processingDate": "2024-03-15T14:35:12Z",
  "processedBy": {
    "id": "550e8400-e29b-41d4-a716-446655440007",
    "name": "John Doe"
  }
}
``` 