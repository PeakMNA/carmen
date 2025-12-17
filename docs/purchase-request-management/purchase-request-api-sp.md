# Purchase Request Module - API and Stored Procedures Documentation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## 0. Authentication and Authorization

All API endpoints in the Purchase Request module require authentication unless explicitly stated otherwise. Authentication is handled via JWT tokens.

### Authentication Requirements
```typescript
// Request Header
Authorization: Bearer <jwt_token>
```

### Authorization Levels
- **Requester**: Can create and view their own PRs
- **Department Head**: Can approve/reject PRs from their department
- **Purchase Coordinator**: Can review all PRs
- **Finance Manager**: Can approve/reject PRs based on budget
- **General Manager**: Can approve/reject high-value PRs

### Permission Checks
The API performs permission checks based on:
- User role
- Department association
- PR ownership
- Workflow stage

## 1. REST API Endpoints

### 1.1 Purchase Request Management

#### Get Purchase Requests
```typescript
GET /api/purchase-requests
Query Parameters: {
  status?: DocumentStatus
  type?: PRType
  department?: string
  fromDate?: string
  toDate?: string
  page?: number
  limit?: number
}
Response: {
  data: PurchaseRequest[]
  total: number
  page: number
  limit: number
}
```

#### Get Purchase Request by ID
```typescript
GET /api/purchase-requests/:id
Response: PurchaseRequest & {
  items: PurchaseRequestItem[]
  attachments: Attachment[]
  comments: Comment[]
  budget: Budget
  approvalHistory: ApprovalHistoryItem[]
}
```

#### Create Purchase Request
```typescript
POST /api/purchase-requests
Body: {
  type: PRType
  description: string
  deliveryDate: Date
  department: string
  location: string
  jobCode: string
  vendor?: string
  vendorId?: number
  currency: string
  items: {
    location: string
    name: string
    description: string
    unit: string
    quantityRequested: number
    price: number
    deliveryDate: Date
    deliveryPoint: string
    itemCategory: string
    itemSubcategory: string
    vendor?: string
    comment?: string
    taxRate?: number
    discountRate?: number
    accountCode?: string
  }[]
}
Response: PurchaseRequest
```

#### Update Purchase Request
```typescript
PUT /api/purchase-requests/:id
Body: Partial<PurchaseRequest>
Response: PurchaseRequest
```

#### Delete Purchase Request
```typescript
DELETE /api/purchase-requests/:id
Response: { success: boolean }
```

### 1.2 Purchase Request Items

#### Get PR Items
```typescript
GET /api/purchase-requests/:prId/items
Response: PurchaseRequestItem[]
```

#### Add PR Item
```typescript
POST /api/purchase-requests/:prId/items
Body: {
  location: string
  name: string
  description: string
  unit: string
  quantityRequested: number
  price: number
  deliveryDate: Date
  deliveryPoint: string
  itemCategory: string
  itemSubcategory: string
  vendor?: string
  comment?: string
  taxRate?: number
  discountRate?: number
  accountCode?: string
}
Response: PurchaseRequestItem
```

#### Update PR Item
```typescript
PUT /api/purchase-requests/:prId/items/:itemId
Body: Partial<PurchaseRequestItem>
Response: PurchaseRequestItem
```

#### Delete PR Item
```typescript
DELETE /api/purchase-requests/:prId/items/:itemId
Response: { success: boolean }
```

### 1.3 Purchase Request Workflow

#### Submit for Approval
```typescript
POST /api/purchase-requests/:id/submit
Response: {
  status: DocumentStatus
  workflowStatus: WorkflowStatus
  currentWorkflowStage: WorkflowStage
}
```

#### Process Workflow Action
```typescript
POST /api/purchase-requests/:id/workflow/action
Body: {
  action: WorkflowAction
  comments?: string
  userId: string
  stage: WorkflowStage
}
Response: {
  status: DocumentStatus
  workflowStatus: WorkflowStatus
  currentWorkflowStage: WorkflowStage
  approvalHistory: ApprovalHistoryItem[]
}
```

#### Get Approval History
```typescript
GET /api/purchase-requests/:id/approval-history
Response: ApprovalHistoryItem[]
```

### 1.4 Budget Validation

#### Check Budget Availability
```typescript
POST /api/purchase-requests/:id/validate-budget
Response: {
  isValid: boolean
  budgetData: BudgetData
  validationMessages: {
    message: string
    type: 'error' | 'warning'
  }[]
}
```

#### Get Budget Summary
```typescript
GET /api/purchase-requests/:id/budget-summary
Response: BudgetData
```

### 1.5 Comments Management

#### Get PR Comments
```typescript
GET /api/purchase-requests/:prId/comments
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
  prId: string
  userId: string
  userName: string
  userRole: string
  content: string
  type: 'general' | 'workflow' | 'system'
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
POST /api/purchase-requests/:prId/comments
Body: {
  content: string
  type: 'general' | 'workflow' | 'system'
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

#### Update Comment
```typescript
PUT /api/purchase-requests/:prId/comments/:commentId
Body: {
  content: string
  visibility?: 'public' | 'private' | 'internal'
  attachments?: {
    id?: string // existing attachment
    fileName?: string // new attachment
    fileType?: string
    fileContent?: Base64String
  }[]
}
Response: Comment
```

#### Delete Comment
```typescript
DELETE /api/purchase-requests/:prId/comments/:commentId
Response: { success: boolean }
```

### 1.6 Activity Log

#### Get Activity Log
```typescript
GET /api/purchase-requests/:prId/activity-log
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
  prId: string
  type: ActivityType
  action: string
  description: string
  metadata: {
    previousValue?: any
    newValue?: any
    workflowStage?: string
    comments?: string
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
  | 'workflow'
  | 'comment'
  | 'attachment'
  | 'budget'
  | 'item'
  | 'system'
```

#### Get Activity Details
```typescript
GET /api/purchase-requests/:prId/activity-log/:activityId
Response: {
  activity: ActivityLogEntry
  relatedActivities: ActivityLogEntry[]
  details: {
    [key: string]: any // Additional context-specific details
  }
}
```

## 2. Stored Procedures

### 2.1 Purchase Request Management

#### sp_CreatePurchaseRequest
```sql
PROCEDURE sp_CreatePurchaseRequest
  @Type nvarchar(50),
  @Description nvarchar(500),
  @DeliveryDate datetime,
  @RequestorId nvarchar(50),
  @Department nvarchar(100),
  @Location nvarchar(100),
  @JobCode nvarchar(50),
  @Currency nvarchar(3),
  @VendorId int = NULL
RETURNS uniqueidentifier
```

#### sp_UpdatePurchaseRequest
```sql
PROCEDURE sp_UpdatePurchaseRequest
  @PRId uniqueidentifier,
  @Description nvarchar(500),
  @DeliveryDate datetime,
  @JobCode nvarchar(50),
  @VendorId int = NULL
RETURNS bit
```

#### sp_DeletePurchaseRequest
```sql
PROCEDURE sp_DeletePurchaseRequest
  @PRId uniqueidentifier
RETURNS bit
```

### 2.2 PR Item Management

#### sp_AddPRItem
```sql
PROCEDURE sp_AddPRItem
  @PRId uniqueidentifier,
  @Location nvarchar(100),
  @Name nvarchar(200),
  @Description nvarchar(500),
  @Unit nvarchar(50),
  @QuantityRequested decimal(10,2),
  @Price decimal(10,2),
  @DeliveryDate datetime,
  @DeliveryPoint nvarchar(200),
  @ItemCategory nvarchar(100),
  @ItemSubcategory nvarchar(100),
  @Vendor nvarchar(200) = NULL,
  @Comment nvarchar(500) = NULL,
  @TaxRate decimal(5,2) = NULL,
  @DiscountRate decimal(5,2) = NULL,
  @AccountCode nvarchar(50) = NULL
RETURNS int
```

#### sp_UpdatePRItem
```sql
PROCEDURE sp_UpdatePRItem
  @ItemId int,
  @QuantityRequested decimal(10,2),
  @Price decimal(10,2),
  @DeliveryDate datetime,
  @Comment nvarchar(500) = NULL
RETURNS bit
```

### 2.3 Workflow Processing

#### sp_SubmitPRForApproval
```sql
PROCEDURE sp_SubmitPRForApproval
  @PRId uniqueidentifier,
  @UserId nvarchar(50)
RETURNS bit
```

#### sp_ProcessPRWorkflowAction
```sql
PROCEDURE sp_ProcessPRWorkflowAction
  @PRId uniqueidentifier,
  @Action nvarchar(20),
  @UserId nvarchar(50),
  @Stage nvarchar(50),
  @Comments nvarchar(500) = NULL
RETURNS bit
```

### 2.4 Budget Management

#### sp_ValidatePRBudget
```sql
PROCEDURE sp_ValidatePRBudget
  @PRId uniqueidentifier
RETURNS TABLE (
  IsValid bit,
  Location nvarchar(100),
  BudgetCategory nvarchar(100),
  TotalBudget decimal(15,2),
  SoftCommitmentPR decimal(15,2),
  SoftCommitmentPO decimal(15,2),
  HardCommitment decimal(15,2),
  AvailableBudget decimal(15,2),
  CurrentPRAmount decimal(15,2)
)
```

### 2.5 Comments Management

#### sp_CreatePRComment
```sql
PROCEDURE sp_CreatePRComment
  @PRId uniqueidentifier,
  @UserId nvarchar(50),
  @Content nvarchar(max),
  @Type nvarchar(20),
  @Visibility nvarchar(20),
  @Mentions nvarchar(max) = NULL
RETURNS uniqueidentifier
```

#### sp_UpdatePRComment
```sql
PROCEDURE sp_UpdatePRComment
  @CommentId uniqueidentifier,
  @UserId nvarchar(50),
  @Content nvarchar(max),
  @Visibility nvarchar(20)
RETURNS bit
```

#### sp_DeletePRComment
```sql
PROCEDURE sp_DeletePRComment
  @CommentId uniqueidentifier,
  @UserId nvarchar(50)
RETURNS bit
```

#### sp_AddCommentAttachment
```sql
PROCEDURE sp_AddCommentAttachment
  @CommentId uniqueidentifier,
  @FileName nvarchar(255),
  @FileType nvarchar(100),
  @FileSize bigint,
  @FileUrl nvarchar(500)
RETURNS uniqueidentifier
```

### 2.6 Activity Logging

#### sp_LogPRActivity
```sql
PROCEDURE sp_LogPRActivity
  @PRId uniqueidentifier,
  @UserId nvarchar(50),
  @Type nvarchar(50),
  @Action nvarchar(100),
  @Description nvarchar(500),
  @Metadata nvarchar(max),
  @IPAddress nvarchar(50) = NULL,
  @UserAgent nvarchar(500) = NULL
RETURNS uniqueidentifier
```

#### sp_GetPRActivityLog
```sql
PROCEDURE sp_GetPRActivityLog
  @PRId uniqueidentifier,
  @FromDate datetime = NULL,
  @ToDate datetime = NULL,
  @Type nvarchar(50) = NULL,
  @UserId nvarchar(50) = NULL,
  @PageNumber int = 1,
  @PageSize int = 50
RETURNS TABLE (
  Id uniqueidentifier,
  Type nvarchar(50),
  Action nvarchar(100),
  Description nvarchar(500),
  Metadata nvarchar(max),
  UserId nvarchar(50),
  UserName nvarchar(100),
  UserRole nvarchar(50),
  UserDepartment nvarchar(100),
  Timestamp datetime,
  IPAddress nvarchar(50),
  UserAgent nvarchar(500)
)
```

## 3. Database Functions

### 3.1 Calculations

#### fn_CalculatePRTotals
```sql
FUNCTION fn_CalculatePRTotals
  @PRId uniqueidentifier
RETURNS TABLE (
  BaseSubTotalPrice decimal(15,2),
  SubTotalPrice decimal(15,2),
  BaseNetAmount decimal(15,2),
  NetAmount decimal(15,2),
  BaseDiscAmount decimal(15,2),
  DiscountAmount decimal(15,2),
  BaseTaxAmount decimal(15,2),
  TaxAmount decimal(15,2),
  BaseTotalAmount decimal(15,2),
  TotalAmount decimal(15,2)
)
```

#### fn_GetPRExchangeRate
```sql
FUNCTION fn_GetPRExchangeRate
  @Currency nvarchar(3),
  @Date datetime
RETURNS decimal(10,4)
```

### 3.2 Validations

#### fn_ValidatePRWorkflowTransition
```sql
FUNCTION fn_ValidatePRWorkflowTransition
  @PRId uniqueidentifier,
  @Action nvarchar(20),
  @UserId nvarchar(50)
RETURNS bit
```

### 3.3 Activity Analysis

#### fn_GetPRActivitySummary
```sql
FUNCTION fn_GetPRActivitySummary
  @PRId uniqueidentifier,
  @FromDate datetime,
  @ToDate datetime
RETURNS TABLE (
  ActivityType nvarchar(50),
  ActivityCount int,
  UniqueUsers int,
  AverageResponseTime decimal(10,2),
  TopUsers nvarchar(max)
)
```

#### fn_CalculateActivityMetrics
```sql
FUNCTION fn_CalculateActivityMetrics
  @PRId uniqueidentifier
RETURNS TABLE (
  MetricName nvarchar(100),
  MetricValue decimal(10,2),
  MetricUnit nvarchar(20)
)
```

## 4. Error Codes and Handling

### 4.1 API Error Codes
- PR001: Invalid purchase request data
- PR002: Item validation failed
- PR003: Budget validation failed
- PR004: Unauthorized workflow action
- PR005: Invalid workflow transition
- PR006: Duplicate reference number
- PR007: Invalid currency conversion
- PR008: Comment operation failed
- PR009: Invalid comment visibility
- PR010: Unauthorized comment action
- PR011: Activity logging failed
- PR012: Invalid activity type
- PR013: Activity retrieval failed
- PR014: Invalid item data
- PR015: Budget limit exceeded
- PR016: Attachment upload failed
- PR017: Invalid file type
- PR018: File size limit exceeded
- PR019: Workflow configuration error
- PR020: Rate limit exceeded

### 4.2 HTTP Status Codes
- 200 OK: Request succeeded
- 201 Created: Resource created successfully
- 400 Bad Request: Invalid request data
- 401 Unauthorized: Authentication required
- 403 Forbidden: Insufficient permissions
- 404 Not Found: Resource not found
- 409 Conflict: Resource conflict (e.g., duplicate reference number)
- 422 Unprocessable Entity: Validation failed
- 429 Too Many Requests: Rate limit exceeded
- 500 Internal Server Error: Server-side error

### 4.3 Error Response Format
```typescript
{
  "error": {
    "code": "PR001",
    "message": "Invalid purchase request data",
    "details": [
      {
        "field": "deliveryDate",
        "message": "Delivery date must be in the future"
      }
    ],
    "requestId": "req-123456",
    "timestamp": "2024-03-20T09:00:00Z"
  }
}
```

### 4.4 Stored Procedure Error Handling
```sql
BEGIN TRY
  -- Procedure logic
END TRY
BEGIN CATCH
  INSERT INTO PurchaseRequestErrors (
    ErrorNumber,
    ErrorSeverity,
    ErrorState,
    ErrorProcedure,
    ErrorLine,
    ErrorMessage,
    PRId,
    ErrorTimestamp
  )
  SELECT
    ERROR_NUMBER(),
    ERROR_SEVERITY(),
    ERROR_STATE(),
    ERROR_PROCEDURE(),
    ERROR_LINE(),
    ERROR_MESSAGE(),
    @PRId,
    GETDATE()
  
  -- Return error to caller
  RETURN 0
END CATCH
```

### 4.5 Activity Log Error Handling
```sql
BEGIN TRY
  -- Activity logging logic
END TRY
BEGIN CATCH
  INSERT INTO ActivityLogErrors (
    ErrorNumber,
    ErrorSeverity,
    ErrorState,
    ErrorProcedure,
    ErrorLine,
    ErrorMessage,
    PRId,
    ActivityType,
    ErrorTimestamp
  )
  SELECT
    ERROR_NUMBER(),
    ERROR_SEVERITY(),
    ERROR_STATE(),
    ERROR_PROCEDURE(),
    ERROR_LINE(),
    ERROR_MESSAGE(),
    @PRId,
    @Type,
    GETDATE()
  
  -- Return error to caller
  RETURN 0
END CATCH
```

## 6. Rate Limiting

The PR API implements rate limiting to prevent abuse:

- Standard endpoints: 100 requests per minute
- Bulk operations: 20 requests per minute
- Export operations: 5 requests per minute

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1616176800
```

## 7. Versioning

The PR API is versioned to ensure backward compatibility:

```
/api/v1/purchase-requests
```

When breaking changes are introduced, a new version will be released:

```
/api/v2/purchase-requests
```

## 8. Webhooks

The PR API supports webhooks for real-time notifications:

### 8.1 Available Events
- `pr.created`: Triggered when a new PR is created
- `pr.updated`: Triggered when a PR is updated
- `pr.status_changed`: Triggered when a PR's status changes
- `pr.workflow_advanced`: Triggered when a PR advances in the workflow
- `pr.comment_added`: Triggered when a comment is added to a PR

### 8.2 Webhook Payload
```typescript
{
  "event": "pr.status_changed",
  "timestamp": "2024-03-20T09:00:00Z",
  "data": {
    "prId": "PR-2401-0001",
    "previousStatus": "Draft",
    "newStatus": "Submitted",
    "userId": "USER123"
  }
}
```

### 8.3 Webhook Configuration
```typescript
POST /api/webhook-subscriptions
{
  "url": "https://example.com/webhook",
  "events": ["pr.created", "pr.status_changed"],
  "secret": "your_webhook_secret"
}
```

## 5. Example Request/Response Payloads

### 5.1 Purchase Request Management

#### Get Purchase Requests
```typescript
// Request
GET /api/purchase-requests?status=Draft&type=GeneralPurchase&department=IT&fromDate=2024-01-01&toDate=2024-03-20&page=1&limit=10

// Response
{
  "data": [
    {
      "id": "PR-2401-0001",
      "refNumber": "PR/2024/03/001",
      "date": "2024-03-20T09:00:00Z",
      "type": "GeneralPurchase",
      "description": "IT Equipment Purchase",
      "requestorId": "USER123",
      "requestor": {
        "name": "John Doe",
        "id": "USER123",
        "department": "IT"
      },
      "status": "Draft",
      "workflowStatus": "Pending",
      "currentWorkflowStage": "DepartmentApproval",
      "location": "HQ",
      "department": "IT",
      "jobCode": "IT-2024-Q1",
      "estimatedTotal": 50000,
      "vendor": "Tech Supplies Co.",
      "vendorId": 1001,
      "currency": "THB",
      "baseCurrencyCode": "THB",
      "baseSubTotalPrice": 45000,
      "subTotalPrice": 45000,
      "baseNetAmount": 48150,
      "netAmount": 48150,
      "baseDiscAmount": 0,
      "discountAmount": 0,
      "baseTaxAmount": 3150,
      "taxAmount": 3150,
      "baseTotalAmount": 48150,
      "totalAmount": 48150
    }
  ],
  "total": 45,
  "page": 1,
  "limit": 10
}
```

#### Get Purchase Request by ID
```typescript
// Request
GET /api/purchase-requests/PR-2401-0001

// Response
{
  "id": "PR-2401-0001",
  // ... PR details as above ...
  "items": [
    {
      "id": "PRITEM-001",
      "location": "HQ",
      "name": "Laptop Dell XPS 13",
      "description": "Developer Laptop",
      "unit": "Units",
      "quantityRequested": 2,
      "price": 22500,
      "totalAmount": 45000,
      "deliveryDate": "2024-04-01T00:00:00Z",
      "deliveryPoint": "IT Department",
      "itemCategory": "Hardware",
      "itemSubcategory": "Laptops",
      "taxRate": 7,
      "taxAmount": 3150,
      "discountRate": 0,
      "discountAmount": 0,
      "netAmount": 48150
    }
  ],
  "attachments": [
    {
      "id": "ATT-001",
      "fileName": "quotation.pdf",
      "fileType": "application/pdf",
      "fileSize": 245760,
      "uploadedBy": "USER123",
      "uploadedAt": "2024-03-20T09:05:00Z",
      "url": "/attachments/PR-2401-0001/quotation.pdf"
    }
  ],
  "comments": [
    {
      "id": "CMT-001",
      "content": "Please expedite this request",
      "userId": "USER123",
      "userName": "John Doe",
      "createdAt": "2024-03-20T09:10:00Z"
    }
  ],
  "budget": {
    "location": "HQ",
    "budgetCategory": "IT Equipment",
    "totalBudget": 1000000,
    "softCommitmentPR": 150000,
    "softCommitmentPO": 300000,
    "hardCommitment": 400000,
    "availableBudget": 150000,
    "currentPRAmount": 48150
  },
  "approvalHistory": [
    {
      "stage": "DepartmentApproval",
      "approver": "USER456",
      "date": "2024-03-20T10:00:00Z",
      "status": "Pending"
    }
  ]
}
```

#### Create Purchase Request
```typescript
// Request
POST /api/purchase-requests
{
  "type": "GeneralPurchase",
  "description": "IT Equipment Purchase",
  "deliveryDate": "2024-04-01T00:00:00Z",
  "department": "IT",
  "location": "HQ",
  "jobCode": "IT-2024-Q1",
  "vendor": "Tech Supplies Co.",
  "vendorId": 1001,
  "currency": "THB",
  "items": [
    {
      "location": "HQ",
      "name": "Laptop Dell XPS 13",
      "description": "Developer Laptop",
      "unit": "Units",
      "quantityRequested": 2,
      "price": 22500,
      "deliveryDate": "2024-04-01T00:00:00Z",
      "deliveryPoint": "IT Department",
      "itemCategory": "Hardware",
      "itemSubcategory": "Laptops",
      "taxRate": 7,
      "discountRate": 0,
      "accountCode": "IT-HW-001"
    }
  ]
}

// Response
{
  "id": "PR-2401-0001",
  // ... full PR details ...
}
```

### 5.2 PR Items Management

#### Add PR Item
```typescript
// Request
POST /api/purchase-requests/PR-2401-0001/items
{
  "location": "HQ",
  "name": "Monitor Dell U2419H",
  "description": "24-inch Developer Monitor",
  "unit": "Units",
  "quantityRequested": 2,
  "price": 8500,
  "deliveryDate": "2024-04-01T00:00:00Z",
  "deliveryPoint": "IT Department",
  "itemCategory": "Hardware",
  "itemSubcategory": "Monitors",
  "taxRate": 7,
  "discountRate": 0,
  "accountCode": "IT-HW-002"
}

// Response
{
  "id": "PRITEM-002",
  // ... full item details ...
}
```

### 5.3 Workflow Actions

#### Submit for Approval
```typescript
// Request
POST /api/purchase-requests/PR-2401-0001/submit

// Response
{
  "status": "Submitted",
  "workflowStatus": "InProgress",
  "currentWorkflowStage": "DepartmentApproval",
  "message": "Purchase request submitted successfully"
}
```

#### Process Workflow Action
```typescript
// Request
POST /api/purchase-requests/PR-2401-0001/workflow/action
{
  "action": "approve",
  "comments": "Equipment specifications and budget are appropriate",
  "userId": "USER456",
  "stage": "DepartmentApproval"
}

// Response
{
  "status": "InProgress",
  "workflowStatus": "Approved",
  "currentWorkflowStage": "FinanceApproval",
  "approvalHistory": [
    {
      "stage": "DepartmentApproval",
      "approver": "USER456",
      "date": "2024-03-20T11:00:00Z",
      "status": "Approved",
      "comments": "Equipment specifications and budget are appropriate"
    }
  ]
}
```

### 5.4 Comments Management

#### Add Comment
```typescript
// Request
POST /api/purchase-requests/PR-2401-0001/comments
{
  "content": "Please attach vendor quotation",
  "type": "general",
  "visibility": "public",
  "attachments": [
    {
      "fileName": "vendor_comparison.xlsx",
      "fileType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "fileContent": "base64_encoded_content..."
    }
  ],
  "mentions": ["USER789"]
}

// Response
{
  "id": "CMT-002",
  "prId": "PR-2401-0001",
  "userId": "USER456",
  "userName": "Jane Smith",
  "userRole": "Department Manager",
  "content": "Please attach vendor quotation",
  "type": "general",
  "visibility": "public",
  "attachments": [
    {
      "id": "ATT-002",
      "fileName": "vendor_comparison.xlsx",
      "fileType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "fileSize": 15360,
      "url": "/attachments/PR-2401-0001/vendor_comparison.xlsx"
    }
  ],
  "mentions": [
    {
      "userId": "USER789",
      "userName": "Bob Wilson"
    }
  ],
  "createdAt": "2024-03-20T11:30:00Z",
  "updatedAt": "2024-03-20T11:30:00Z"
}
```

### 5.5 Activity Log

#### Get Activity Log
```typescript
// Request
GET /api/purchase-requests/PR-2401-0001/activity-log?fromDate=2024-03-20&type=workflow,modification

// Response
{
  "data": [
    {
      "id": "ACT-001",
      "prId": "PR-2401-0001",
      "type": "workflow",
      "action": "submit",
      "description": "Purchase request submitted for approval",
      "metadata": {
        "previousStatus": "Draft",
        "newStatus": "Submitted",
        "workflowStage": "DepartmentApproval"
      },
      "user": {
        "id": "USER123",
        "name": "John Doe",
        "role": "Requestor",
        "department": "IT"
      },
      "timestamp": "2024-03-20T09:15:00Z",
      "ipAddress": "192.168.1.100",
      "userAgent": "Mozilla/5.0..."
    },
    {
      "id": "ACT-002",
      "type": "modification",
      "action": "update_item",
      "description": "Modified item quantity",
      "metadata": {
        "itemId": "PRITEM-001",
        "previousValue": {
          "quantityRequested": 1
        },
        "newValue": {
          "quantityRequested": 2
        }
      },
      // ... other activity details ...
    }
  ],
  "total": 15,
  "page": 1,
  "limit": 10
}
```

### 5.6 Budget Validation

#### Check Budget Availability
```typescript
// Request
POST /api/purchase-requests/PR-2401-0001/validate-budget

// Response
{
  "isValid": true,
  "budgetData": {
    "location": "HQ",
    "budgetCategory": "IT Equipment",
    "totalBudget": 1000000,
    "softCommitmentPR": 150000,
    "softCommitmentPO": 300000,
    "hardCommitment": 400000,
    "availableBudget": 150000,
    "currentPRAmount": 48150
  },
  "validationMessages": [
    {
      "message": "Sufficient budget available",
      "type": "info"
    },
    {
      "message": "Budget utilization will be at 85% after this PR",
      "type": "warning"
    }
  ]
} 
