# Dashboard API Specifications

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0.0 | 2025-11-19 | Documentation Team | Initial version |
## Overview

This document defines the API endpoints, data models, and integration specifications for the Dashboard module. Currently using mock data; this specification serves as the blueprint for backend implementation.

## Base Configuration

### API Base URL
```
Production: https://api.carmen-erp.com/v1
Development: http://localhost:3000/api
```

### Authentication
All endpoints require authentication via JWT token in Authorization header:
```
Authorization: Bearer <jwt_token>
```

### Rate Limiting
- **Default**: 100 requests per minute per user
- **Premium**: 500 requests per minute per user

## Endpoints

### 1. Get Dashboard Metrics

**Endpoint**: `GET /api/dashboard/metrics`

**Description**: Retrieve aggregated metrics for dashboard cards

**Authorization**: Required - All authenticated users

**Query Parameters**:
```typescript
{
  department?: string        // Filter by department ID (optional)
  dateRange?: 'month' | 'quarter' | 'year'  // Default: 'month'
  currency?: string          // Currency code (default: 'USD')
}
```

**Request Example**:
```bash
GET /api/dashboard/metrics?department=kitchen&dateRange=month&currency=USD
Authorization: Bearer eyJhbGc...
```

**Response Schema**:
```typescript
{
  success: boolean
  data: {
    totalOrders: {
      value: number
      change: number        // Percentage change
      trend: 'up' | 'down'
      period: string        // e.g., "June 2024"
    }
    activeSuppliers: {
      value: number
      change: number
      trend: 'up' | 'down'
      verified: number
    }
    inventoryValue: {
      value: number
      change: number
      trend: 'up' | 'down'
      currency: string
    }
    monthlySpend: {
      value: number
      change: number
      trend: 'up' | 'down'
      currency: string
      budget: number        // Budget allocation
      utilization: number   // Percentage used
    }
    criticalStockItems: {
      count: number
      items: Array<{
        id: string
        name: string
        currentQuantity: number
        minimumQuantity: number
        severity: 'critical' | 'warning'
      }>
    }
    pendingApprovals: {
      count: number
      overdue: number
      urgent: number
    }
    completedDeliveries: {
      count: number
      period: 'week' | 'month'
      onTime: number
      delayed: number
    }
  }
  meta: {
    lastUpdated: string     // ISO 8601 timestamp
    cacheExpiry: number     // Seconds until cache expires
  }
}
```

**Response Example**:
```json
{
  "success": true,
  "data": {
    "totalOrders": {
      "value": 1234,
      "change": 12.5,
      "trend": "up",
      "period": "June 2024"
    },
    "activeSuppliers": {
      "value": 89,
      "change": 3.2,
      "trend": "up",
      "verified": 85
    },
    "inventoryValue": {
      "value": 45231,
      "change": -2.4,
      "trend": "down",
      "currency": "USD"
    },
    "monthlySpend": {
      "value": 89432,
      "change": 8.7,
      "trend": "up",
      "currency": "USD",
      "budget": 100000,
      "utilization": 89.4
    },
    "criticalStockItems": {
      "count": 12,
      "items": [
        {
          "id": "INV-001",
          "name": "Organic Milk",
          "currentQuantity": 5,
          "minimumQuantity": 20,
          "severity": "critical"
        }
      ]
    },
    "pendingApprovals": {
      "count": 8,
      "overdue": 2,
      "urgent": 3
    },
    "completedDeliveries": {
      "count": 156,
      "period": "week",
      "onTime": 142,
      "delayed": 14
    }
  },
  "meta": {
    "lastUpdated": "2024-06-15T10:30:00Z",
    "cacheExpiry": 300
  }
}
```

**Error Responses**:
```typescript
// 401 Unauthorized
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}

// 403 Forbidden
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions to view department metrics"
  }
}

// 500 Internal Server Error
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "Failed to calculate metrics",
    "details": "Database connection timeout"
  }
}
```

### 2. Get Chart Data

**Endpoint**: `GET /api/dashboard/charts`

**Description**: Retrieve time-series data for dashboard charts

**Authorization**: Required - All authenticated users

**Query Parameters**:
```typescript
{
  chartType: 'orders' | 'spend' | 'suppliers'  // Required
  period: 'month' | 'quarter' | 'year'          // Default: 'month'
  months?: number                                // Number of months (default: 6)
  department?: string                            // Filter by department
}
```

**Request Example**:
```bash
GET /api/dashboard/charts?chartType=orders&period=month&months=6
Authorization: Bearer eyJhbGc...
```

**Response Schema**:
```typescript
{
  success: boolean
  data: {
    chartType: string
    period: string
    dataPoints: Array<{
      period: string          // e.g., "Jan", "Feb"
      value: number           // Primary metric
      secondaryValue?: number // For dual-metric charts
      label: string
    }>
    aggregation: {
      total: number
      average: number
      min: number
      max: number
      trend: 'increasing' | 'decreasing' | 'stable'
    }
  }
  meta: {
    startDate: string
    endDate: string
    lastUpdated: string
  }
}
```

**Response Example**:
```json
{
  "success": true,
  "data": {
    "chartType": "orders",
    "period": "month",
    "dataPoints": [
      { "period": "Jan", "value": 186, "label": "January 2024" },
      { "period": "Feb", "value": 305, "label": "February 2024" },
      { "period": "Mar", "value": 237, "label": "March 2024" },
      { "period": "Apr", "value": 273, "label": "April 2024" },
      { "period": "May", "value": 209, "label": "May 2024" },
      { "period": "Jun", "value": 214, "label": "June 2024" }
    ],
    "aggregation": {
      "total": 1424,
      "average": 237,
      "min": 186,
      "max": 305,
      "trend": "stable"
    }
  },
  "meta": {
    "startDate": "2024-01-01",
    "endDate": "2024-06-30",
    "lastUpdated": "2024-06-15T10:30:00Z"
  }
}
```

### 3. Get Recent Activities

**Endpoint**: `GET /api/dashboard/activities`

**Description**: Retrieve recent system activities for the activity feed

**Authorization**: Required - All authenticated users

**Query Parameters**:
```typescript
{
  limit?: number           // Number of activities (default: 10, max: 50)
  offset?: number          // Pagination offset (default: 0)
  type?: string            // Filter by activity type
  status?: string          // Filter by status
  priority?: string        // Filter by priority
  dateFrom?: string        // ISO 8601 date
  dateTo?: string          // ISO 8601 date
}
```

**Request Example**:
```bash
GET /api/dashboard/activities?limit=10&offset=0&priority=high
Authorization: Bearer eyJhbGc...
```

**Response Schema**:
```typescript
{
  success: boolean
  data: {
    activities: Array<{
      id: string
      type: string              // 'Purchase Request' | 'Purchase Order' | etc.
      documentNumber: string    // e.g., 'PR-2401-0001'
      status: string
      target: string            // Associated entity
      priority: 'critical' | 'high' | 'medium' | 'low'
      reviewer: {
        id: string
        name: string
        avatar?: string
      }
      metadata: {
        amount?: number
        currency?: string
        items?: number
        location?: string
      }
      createdAt: string         // ISO 8601
      updatedAt: string
      actions: Array<{
        type: 'view' | 'edit' | 'delete'
        url: string
        enabled: boolean
      }>
    }>
    pagination: {
      total: number
      limit: number
      offset: number
      hasMore: boolean
    }
  }
  meta: {
    lastUpdated: string
  }
}
```

**Response Example**:
```json
{
  "success": true,
  "data": {
    "activities": [
      {
        "id": "1",
        "type": "Purchase Request",
        "documentNumber": "PR-2401-0001",
        "status": "Approved",
        "target": "Kitchen Supplies",
        "priority": "high",
        "reviewer": {
          "id": "user-123",
          "name": "Sarah Johnson",
          "avatar": "https://..."
        },
        "metadata": {
          "amount": 1500,
          "currency": "USD",
          "items": 15
        },
        "createdAt": "2024-01-20T08:00:00Z",
        "updatedAt": "2024-01-20T10:30:00Z",
        "actions": [
          { "type": "view", "url": "/procurement/purchase-requests/PR-2401-0001", "enabled": true },
          { "type": "edit", "url": "/procurement/purchase-requests/PR-2401-0001/edit", "enabled": true },
          { "type": "delete", "url": "/api/purchase-requests/PR-2401-0001", "enabled": false }
        ]
      }
    ],
    "pagination": {
      "total": 156,
      "limit": 10,
      "offset": 0,
      "hasMore": true
    }
  },
  "meta": {
    "lastUpdated": "2024-06-15T10:30:00Z"
  }
}
```

### 4. Get User Permissions

**Endpoint**: `GET /api/dashboard/permissions`

**Description**: Retrieve user's dashboard permissions and visibility rules

**Authorization**: Required

**Response Schema**:
```typescript
{
  success: boolean
  data: {
    userId: string
    role: string
    department: string
    permissions: {
      viewMetrics: boolean
      viewCharts: boolean
      viewActivities: boolean
      editActivities: boolean
      deleteActivities: boolean
      exportData: boolean
    }
    dataScope: {
      departments: string[]
      locations: string[]
      suppliers: string[]
    }
    restrictions: {
      maxDataRange: number      // Days
      allowedCharts: string[]
      allowedMetrics: string[]
    }
  }
}
```

### 5. Export Dashboard Data

**Endpoint**: `POST /api/dashboard/export`

**Description**: Export dashboard data to PDF or Excel

**Authorization**: Required - Users with export permission

**Request Body**:
```typescript
{
  format: 'pdf' | 'excel'
  include: {
    metrics: boolean
    charts: boolean
    activities: boolean
  }
  dateRange: {
    from: string    // ISO 8601
    to: string
  }
  filters?: {
    department?: string
    priority?: string
  }
}
```

**Response**:
```typescript
{
  success: boolean
  data: {
    downloadUrl: string
    expiresAt: string
    fileSize: number
    filename: string
  }
}
```

## WebSocket Events

### Real-time Updates

**Connection URL**: `wss://api.carmen-erp.com/ws/dashboard`

**Authentication**: Send JWT token in connection query string
```
wss://api.carmen-erp.com/ws/dashboard?token=<jwt_token>
```

### Event Types

#### 1. Metrics Update
```typescript
{
  event: 'metrics:update',
  data: {
    metric: 'totalOrders' | 'activeSuppliers' | 'inventoryValue' | 'monthlySpend',
    value: number,
    change: number,
    timestamp: string
  }
}
```

#### 2. New Activity
```typescript
{
  event: 'activity:new',
  data: {
    activity: ActivityObject,  // Same as GET /activities response
    timestamp: string
  }
}
```

#### 3. Critical Alert
```typescript
{
  event: 'alert:critical',
  data: {
    type: 'stock_critical' | 'approval_overdue' | 'budget_exceeded',
    severity: 'critical' | 'high',
    message: string,
    actionUrl: string,
    timestamp: string
  }
}
```

#### 4. Status Change
```typescript
{
  event: 'status:change',
  data: {
    activityId: string,
    previousStatus: string,
    newStatus: string,
    timestamp: string
  }
}
```

## Data Models

### Metric Model
```typescript
interface Metric {
  value: number
  change: number
  trend: 'up' | 'down'
  period?: string
  currency?: string
}
```

### Activity Model
```typescript
interface Activity {
  id: string
  type: ActivityType
  documentNumber: string
  status: ActivityStatus
  target: string
  priority: Priority
  reviewer: User
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
  actions: Action[]
}

type ActivityType =
  | 'Purchase Request'
  | 'Purchase Order'
  | 'Goods Receipt'
  | 'Stock Adjustment'
  | 'Vendor Invoice'
  | 'Quality Check'

type ActivityStatus =
  | 'Approved'
  | 'Processing'
  | 'Pending'
  | 'Under Review'
  | 'Complete'
  | 'Failed'
  | 'Rejected'

type Priority = 'critical' | 'high' | 'medium' | 'low'
```

### Chart Data Model
```typescript
interface ChartDataPoint {
  period: string
  value: number
  secondaryValue?: number
  label: string
}

interface ChartData {
  chartType: string
  period: string
  dataPoints: ChartDataPoint[]
  aggregation: {
    total: number
    average: number
    min: number
    max: number
    trend: 'increasing' | 'decreasing' | 'stable'
  }
}
```

## Caching Strategy

### Cache Configuration
```typescript
cacheConfig = {
  metrics: {
    ttl: 300,        // 5 minutes
    key: 'dashboard:metrics:{userId}:{department}',
    invalidateOn: ['order:created', 'order:approved', 'inventory:updated']
  },
  chartData: {
    ttl: 900,        // 15 minutes
    key: 'dashboard:charts:{chartType}:{period}:{department}',
    invalidateOn: ['order:created', 'spend:updated']
  },
  activities: {
    ttl: 60,         // 1 minute
    key: 'dashboard:activities:{userId}:{offset}',
    invalidateOn: ['activity:created', 'activity:updated']
  }
}
```

### Cache Invalidation
```typescript
// Invalidate on specific events
events.on('order:created', () => {
  cache.invalidate('dashboard:metrics:*')
  cache.invalidate('dashboard:charts:orders:*')
  cache.invalidate('dashboard:activities:*')
})

events.on('inventory:updated', () => {
  cache.invalidate('dashboard:metrics:*:inventoryValue')
})
```

## Error Handling

### Error Codes
```typescript
enum DashboardErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_PARAMETER = 'INVALID_PARAMETER',
  METRIC_CALCULATION_FAILED = 'METRIC_CALCULATION_FAILED',
  CHART_DATA_UNAVAILABLE = 'CHART_DATA_UNAVAILABLE',
  ACTIVITY_FETCH_FAILED = 'ACTIVITY_FETCH_FAILED',
  EXPORT_FAILED = 'EXPORT_FAILED',
  INTERNAL_ERROR = 'INTERNAL_ERROR'
}
```

### Error Response Format
```typescript
{
  success: false,
  error: {
    code: DashboardErrorCode,
    message: string,
    details?: string,
    timestamp: string,
    requestId: string
  }
}
```

## Rate Limiting

### Limits by Endpoint
```typescript
rateLimits = {
  '/api/dashboard/metrics': {
    perMinute: 60,
    perHour: 1000
  },
  '/api/dashboard/charts': {
    perMinute: 30,
    perHour: 500
  },
  '/api/dashboard/activities': {
    perMinute: 100,
    perHour: 2000
  },
  '/api/dashboard/export': {
    perMinute: 5,
    perHour: 50
  }
}
```

### Rate Limit Headers
```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 45
X-RateLimit-Reset: 1634567890
```

## Security Considerations

### Data Filtering
All API responses must filter data based on:
1. User role and permissions
2. Department access
3. Location access
4. Data sensitivity level

### Audit Logging
All API calls logged with:
```typescript
{
  userId: string,
  endpoint: string,
  method: string,
  parameters: object,
  responseCode: number,
  timestamp: string,
  ipAddress: string,
  userAgent: string
}
```

### Input Validation
- Sanitize all query parameters
- Validate date ranges
- Limit pagination offsets
- Validate enum values
- Prevent SQL injection
- Rate limit enforcement

## Performance Optimization

### Database Queries
- Use materialized views for metrics
- Index frequently queried columns
- Implement query result caching
- Use connection pooling
- Optimize join operations

### Response Optimization
- Gzip compression enabled
- Minimize payload size
- Use ETags for conditional requests
- Implement HTTP/2 server push
- CDN for static chart images

## Testing Endpoints

### Mock Data Endpoints (Development Only)
```
GET /api/dashboard/mock/metrics
GET /api/dashboard/mock/charts
GET /api/dashboard/mock/activities
```

### Health Check
```
GET /api/dashboard/health
Response: { status: 'healthy', timestamp: string }
```

## Future API Enhancements

1. **GraphQL Support**: Single endpoint with flexible queries
2. **Batch Operations**: Multiple metric requests in single call
3. **Streaming Data**: Server-Sent Events for real-time updates
4. **Advanced Filtering**: Complex query language support
5. **AI Insights**: ML-powered anomaly detection endpoint
6. **Custom Metrics**: User-defined metric calculations
7. **Scheduled Reports**: Automated report generation API
