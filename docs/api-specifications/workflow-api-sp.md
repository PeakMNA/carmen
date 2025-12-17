# Workflow Module - API and Stored Procedures Documentation

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## 1. REST API Endpoints

### 1.1 Workflow Configuration

#### Get Workflows
```typescript
GET /api/workflows
Response: Workflow[]
```

#### Get Workflow by ID
```typescript
GET /api/workflows/:id
Response: Workflow
```

#### Create Workflow
```typescript
POST /api/workflows
Body: {
  name: string
  type: string
  description: string
  documentReferencePattern: string
  status: string
  stages: Stage[]
  routingRules: RoutingRule[]
  notifications: WorkflowNotification[]
  notificationTemplates: Template[]
  products: Product[]
}
Response: Workflow
```

#### Update Workflow
```typescript
PUT /api/workflows/:id
Body: Partial<Workflow>
Response: Workflow
```

#### Delete Workflow
```typescript
DELETE /api/workflows/:id
Response: { success: boolean }
```

### 1.2 Stage Management

#### Get Stages
```typescript
GET /api/workflows/:workflowId/stages
Response: Stage[]
```

#### Get Stage by ID
```typescript
GET /api/workflows/:workflowId/stages/:id
Response: Stage
```

#### Create Stage
```typescript
POST /api/workflows/:workflowId/stages
Body: {
  name: string
  description: string
  sla: string
  slaUnit: string
  availableActions: string[]
  hideFields: {
    pricePerUnit: boolean
    totalPrice: boolean
  }
  assignedUsers: {
    id: number
    name: string
    department: string
    location: string
  }[]
}
Response: Stage
```

#### Update Stage
```typescript
PUT /api/workflows/:workflowId/stages/:id
Body: Partial<Stage>
Response: Stage
```

#### Delete Stage
```typescript
DELETE /api/workflows/:workflowId/stages/:id
Response: { success: boolean }
```

### 1.3 Routing Rules

#### Get Rules
```typescript
GET /api/workflows/:workflowId/rules
Response: RoutingRule[]
```

#### Get Rule by ID
```typescript
GET /api/workflows/:workflowId/rules/:id
Response: RoutingRule
```

#### Create Rule
```typescript
POST /api/workflows/:workflowId/rules
Body: {
  name: string
  description: string
  triggerStage: string
  condition: RoutingCondition
  action: RoutingAction
}
Response: RoutingRule
```

#### Update Rule
```typescript
PUT /api/workflows/:workflowId/rules/:id
Body: Partial<RoutingRule>
Response: RoutingRule
```

#### Delete Rule
```typescript
DELETE /api/workflows/:workflowId/rules/:id
Response: { success: boolean }
```

### 1.4 Workflow Execution

#### Start Workflow
```typescript
POST /api/workflows/:workflowId/execute
Body: {
  documentId: string
  initiator: string
  initialData: Record<string, any>
}
Response: {
  instanceId: string
  currentStage: Stage
  status: string
}
```

#### Process Stage Action
```typescript
POST /api/workflows/:workflowId/instances/:instanceId/action
Body: {
  action: string
  userId: string
  comments?: string
  data?: Record<string, any>
}
Response: {
  nextStage: Stage
  status: string
}
```

#### Get Instance Status
```typescript
GET /api/workflows/:workflowId/instances/:instanceId
Response: {
  instanceId: string
  workflow: Workflow
  currentStage: Stage
  status: string
  history: {
    stage: Stage
    action: string
    actionBy: string
    actionDate: string
    comments?: string
  }[]
}
```

## 2. Stored Procedures

### 2.1 Workflow Configuration

#### sp_CreateWorkflow
```sql
PROCEDURE sp_CreateWorkflow
  @Name nvarchar(100),
  @Type nvarchar(50),
  @Description nvarchar(500),
  @DocumentPattern nvarchar(50),
  @Status nvarchar(20)
RETURNS UNIQUEIDENTIFIER
```

#### sp_UpdateWorkflow
```sql
PROCEDURE sp_UpdateWorkflow
  @WorkflowId uniqueidentifier,
  @Name nvarchar(100),
  @Description nvarchar(500),
  @Status nvarchar(20)
RETURNS bit
```

#### sp_DeleteWorkflow
```sql
PROCEDURE sp_DeleteWorkflow
  @WorkflowId uniqueidentifier
RETURNS bit
```

### 2.2 Stage Management

#### sp_CreateStage
```sql
PROCEDURE sp_CreateStage
  @WorkflowId uniqueidentifier,
  @Name nvarchar(100),
  @Description nvarchar(500),
  @SLA nvarchar(20),
  @SLAUnit nvarchar(10),
  @AvailableActions nvarchar(max),
  @HideFields nvarchar(max)
RETURNS int
```

#### sp_UpdateStage
```sql
PROCEDURE sp_UpdateStage
  @StageId int,
  @Name nvarchar(100),
  @Description nvarchar(500),
  @SLA nvarchar(20),
  @SLAUnit nvarchar(10),
  @AvailableActions nvarchar(max),
  @HideFields nvarchar(max)
RETURNS bit
```

#### sp_AssignUsersToStage
```sql
PROCEDURE sp_AssignUsersToStage
  @StageId int,
  @Users nvarchar(max)
RETURNS bit
```

### 2.3 Routing Rules

#### sp_CreateRoutingRule
```sql
PROCEDURE sp_CreateRoutingRule
  @WorkflowId uniqueidentifier,
  @Name nvarchar(100),
  @Description nvarchar(500),
  @TriggerStage nvarchar(100),
  @Condition nvarchar(max),
  @Action nvarchar(max)
RETURNS int
```

#### sp_UpdateRoutingRule
```sql
PROCEDURE sp_UpdateRoutingRule
  @RuleId int,
  @Name nvarchar(100),
  @Description nvarchar(500),
  @Condition nvarchar(max),
  @Action nvarchar(max)
RETURNS bit
```

### 2.4 Workflow Execution

#### sp_InitiateWorkflow
```sql
PROCEDURE sp_InitiateWorkflow
  @WorkflowId uniqueidentifier,
  @DocumentId nvarchar(50),
  @Initiator nvarchar(50),
  @InitialData nvarchar(max)
RETURNS uniqueidentifier
```

#### sp_ProcessStageAction
```sql
PROCEDURE sp_ProcessStageAction
  @InstanceId uniqueidentifier,
  @Action nvarchar(50),
  @UserId nvarchar(50),
  @Comments nvarchar(500),
  @ActionData nvarchar(max)
RETURNS bit
```

#### sp_GetWorkflowStatus
```sql
PROCEDURE sp_GetWorkflowStatus
  @InstanceId uniqueidentifier
RETURNS TABLE (
  InstanceId uniqueidentifier,
  WorkflowId uniqueidentifier,
  CurrentStage int,
  Status nvarchar(50),
  LastUpdated datetime
)
```

### 2.5 Notification Management

#### sp_CreateNotification
```sql
PROCEDURE sp_CreateNotification
  @WorkflowId uniqueidentifier,
  @Event nvarchar(100),
  @EventTrigger nvarchar(50),
  @Description nvarchar(500),
  @Recipients nvarchar(max),
  @Channels nvarchar(max)
RETURNS int
```

#### sp_SendNotification
```sql
PROCEDURE sp_SendNotification
  @NotificationId int,
  @InstanceId uniqueidentifier,
  @Recipients nvarchar(max),
  @TemplateData nvarchar(max)
RETURNS bit
```

## 3. Database Functions

### 3.1 Workflow Validation

#### fn_ValidateWorkflowStages
```sql
FUNCTION fn_ValidateWorkflowStages
  @WorkflowId uniqueidentifier
RETURNS bit
```

#### fn_ValidateRoutingRules
```sql
FUNCTION fn_ValidateRoutingRules
  @WorkflowId uniqueidentifier
RETURNS bit
```

### 3.2 SLA Calculations

#### fn_CalculateSLADeadline
```sql
FUNCTION fn_CalculateSLADeadline
  @StartTime datetime,
  @SLA nvarchar(20),
  @SLAUnit nvarchar(10)
RETURNS datetime
```

#### fn_CheckSLABreached
```sql
FUNCTION fn_CheckSLABreached
  @InstanceId uniqueidentifier
RETURNS bit
```

## 4. Error Codes and Handling

### 4.1 API Error Codes
- WF001: Invalid workflow configuration
- WF002: Stage not found
- WF003: Invalid routing rule
- WF004: Unauthorized action
- WF005: Invalid workflow state transition
- WF006: SLA breach detected
- WF007: Notification delivery failure

### 4.2 Stored Procedure Error Handling
```sql
BEGIN TRY
  -- Procedure logic
END TRY
BEGIN CATCH
  INSERT INTO WorkflowErrors (
    ErrorNumber,
    ErrorSeverity,
    ErrorState,
    ErrorProcedure,
    ErrorLine,
    ErrorMessage,
    ErrorTimestamp
  )
  SELECT
    ERROR_NUMBER(),
    ERROR_SEVERITY(),
    ERROR_STATE(),
    ERROR_PROCEDURE(),
    ERROR_LINE(),
    ERROR_MESSAGE(),
    GETDATE()
  
  -- Return error to caller
  RETURN 0
END CATCH
```

## 5. Example Request/Response Payloads

### 5.1 Workflow Configuration Examples

#### Create Workflow
```typescript
// Request
POST /api/workflows
{
  "name": "Purchase Request Workflow",
  "type": "PURCHASE_REQUEST",
  "description": "Standard purchase request approval workflow",
  "documentReferencePattern": "PR-{YYYY}-{MM}-{0000}",
  "status": "Draft",
  "stages": [
    {
      "name": "Department Approval",
      "description": "Initial approval by department head",
      "sla": "24",
      "slaUnit": "hours",
      "availableActions": ["Approve", "Reject", "Send Back"],
      "hideFields": {
        "pricePerUnit": false,
        "totalPrice": false
      },
      "assignedUsers": [
        {
          "id": 101,
          "name": "John Smith",
          "department": "IT",
          "location": "Bangkok"
        }
      ]
    },
    {
      "name": "Finance Review",
      "description": "Financial review and budget verification",
      "sla": "48",
      "slaUnit": "hours",
      "availableActions": ["Approve", "Reject", "Send Back"],
      "hideFields": {
        "pricePerUnit": false,
        "totalPrice": false
      },
      "assignedUsers": [
        {
          "id": 102,
          "name": "Jane Doe",
          "department": "Finance",
          "location": "Bangkok"
        }
      ]
    }
  ],
  "routingRules": [
    {
      "name": "High Value Purchase",
      "description": "Route high value purchases to finance",
      "triggerStage": "Department Approval",
      "condition": {
        "field": "totalAmount",
        "operator": "gt",
        "value": "50000"
      },
      "action": {
        "type": "NEXT_STAGE",
        "parameters": {
          "targetStage": "Finance Review"
        }
      }
    }
  ],
  "notifications": [
    {
      "id": 1,
      "event": "Request Submitted",
      "eventTrigger": "onSubmit",
      "description": "Notify when request is submitted",
      "recipients": ["Requester", "Department Head"],
      "channels": ["Email", "System"]
    }
  ],
  "products": [
    {
      "id": 1,
      "name": "Office Supplies",
      "code": "OS-001",
      "category": "Supplies",
      "subCategory": "Office"
    }
  ]
}

// Response
{
  "id": "WF-2401-0001",
  "name": "Purchase Request Workflow",
  "type": "PURCHASE_REQUEST",
  // ... rest of the workflow data ...
  "status": "Draft"
}
```

### 5.2 Workflow Execution Examples

#### Start Workflow
```typescript
// Request
POST /api/workflows/WF-2401-0001/execute
{
  "documentId": "PR-2403-0001-0001",
  "initiator": "user123",
  "initialData": {
    "requestType": "Purchase",
    "department": "IT",
    "totalAmount": 75000,
    "currency": "THB",
    "items": [
      {
        "productId": 1,
        "quantity": 10,
        "unitPrice": 7500
      }
    ]
  }
}

// Response
{
  "instanceId": "WFI-2401-0001",
  "currentStage": {
    "id": 1,
    "name": "Department Approval",
    "description": "Initial approval by department head",
    // ... rest of stage data ...
  },
  "status": "Pending_Approval"
}
```

#### Process Stage Action
```typescript
// Request
POST /api/workflows/WF-2401-0001/instances/WFI-2401-0001/action
{
  "action": "Approve",
  "userId": "dept_head_123",
  "comments": "Approved based on budget allocation",
  "data": {
    "approvalDate": "2024-03-20T10:30:00Z",
    "budgetCode": "IT-2024-Q1"
  }
}

// Response
{
  "nextStage": {
    "id": 2,
    "name": "Finance Review",
    // ... rest of stage data ...
  },
  "status": "In_Progress"
}
```

#### Get Instance Status
```typescript
// Request
GET /api/workflows/WF-2401-0001/instances/WFI-2401-0001

// Response
{
  "instanceId": "WFI-2401-0001",
  "workflow": {
    "id": "WF-2401-0001",
    "name": "Purchase Request Workflow",
    // ... rest of workflow data ...
  },
  "currentStage": {
    "id": 2,
    "name": "Finance Review",
    // ... rest of stage data ...
  },
  "status": "In_Progress",
  "history": [
    {
      "stage": {
        "id": 1,
        "name": "Department Approval"
      },
      "action": "Approve",
      "actionBy": "dept_head_123",
      "actionDate": "2024-03-20T10:30:00Z",
      "comments": "Approved based on budget allocation"
    }
  ]
}
```

### 5.3 Error Response Examples

#### Validation Error
```typescript
// Response (400 Bad Request)
{
  "error": {
    "code": "WF001",
    "message": "Invalid workflow configuration",
    "details": [
      {
        "field": "stages",
        "error": "Workflow must have at least one stage"
      }
    ]
  }
}
```

#### Authorization Error
```typescript
// Response (403 Forbidden)
{
  "error": {
    "code": "WF004",
    "message": "Unauthorized action",
    "details": {
      "requiredRole": "WORKFLOW_ADMIN",
      "action": "DELETE_WORKFLOW"
    }
  }
}
```

#### SLA Breach Error
```typescript
// Response (400 Bad Request)
{
  "error": {
    "code": "WF006",
    "message": "SLA breach detected",
    "details": {
      "stage": "Department Approval",
      "sla": "24 hours",
      "elapsed": "26 hours"
    }
  }
} 