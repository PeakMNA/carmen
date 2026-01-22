# Data Dictionary: System Monitoring

## Module Information
- **Module**: System Administration
- **Sub-Module**: System Monitoring
- **Route**: `/system-administration/monitoring`
- **Version**: 1.0.0
- **Last Updated**: 2026-01-17

---

## Data Structures

### HealthCheck

```typescript
interface HealthCheck {
  name: string
  status: 'healthy' | 'degraded' | 'unhealthy'
  latency: number
  message: string
}
```

### SystemMetric

```typescript
interface SystemMetric {
  timestamp: string
  cpu: number
  memory: number
  disk: number
}
```

### PerformanceMetric

```typescript
interface PerformanceMetric {
  name: string
  value: number
  threshold: number
  unit: string
}
```

### Alert

```typescript
interface Alert {
  id: string
  name: string
  severity: 'critical' | 'warning' | 'info'
  status: 'firing' | 'acknowledged' | 'resolved'
  source: string
  currentValue: number
  threshold: number
  startsAt: Date
  escalationLevel: number
  acknowledgedBy?: string
}
```

### BusinessMetrics

```typescript
interface BusinessMetrics {
  totalUsers: number
  activeUsers: number
  sessionCount: number
  averageSessionDuration: number
  workflowCompletionRate: number
  systemUptime: number
  errorRate: number
  performanceScore: number
}
```

### LogEntry

```typescript
interface LogEntry {
  time: string
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG'
  message: string
  source: string
}
```

---

## Component State

| State | Type | Default |
|-------|------|---------|
| isLoading | boolean | false |
| lastUpdated | Date | new Date() |
| selectedTimeRange | string | '1h' |

---

## Status Mappings

| Health Status | Color Class |
|---------------|-------------|
| healthy | bg-green-500 |
| degraded | bg-yellow-500 |
| unhealthy | bg-red-500 |

| Alert Severity | Badge Class |
|----------------|-------------|
| critical | bg-red-500 text-white |
| warning | bg-yellow-500 text-black |
| info | bg-blue-500 text-white |

---

**Document End**
