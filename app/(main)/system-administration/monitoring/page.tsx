'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Database, 
  Gauge, 
  RefreshCw, 
  Server, 
  TrendingUp,
  Users,
  Zap,
  AlertTriangle,
  Bell,
  Eye,
  Settings
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts'

// Mock data - in production this would come from monitoring APIs
const mockHealthChecks = [
  { name: 'Database', status: 'healthy', latency: 45, message: 'All connections healthy' },
  { name: 'Authentication', status: 'healthy', latency: 120, message: 'Keycloak responding normally' },
  { name: 'Cache', status: 'degraded', latency: 250, message: 'High response times detected' },
  { name: 'External APIs', status: 'healthy', latency: 300, message: 'All external services operational' }
]

const mockSystemMetrics = [
  { timestamp: '10:00', cpu: 45, memory: 62, disk: 75 },
  { timestamp: '10:05', cpu: 52, memory: 64, disk: 75 },
  { timestamp: '10:10', cpu: 48, memory: 66, disk: 76 },
  { timestamp: '10:15', cpu: 55, memory: 68, disk: 76 },
  { timestamp: '10:20', cpu: 42, memory: 65, disk: 77 },
  { timestamp: '10:25', cpu: 38, memory: 63, disk: 77 }
]

const mockPerformanceMetrics = [
  { name: 'Load Time', value: 1.2, threshold: 3.0, unit: 's' },
  { name: 'First Contentful Paint', value: 0.8, threshold: 1.5, unit: 's' },
  { name: 'Largest Contentful Paint', value: 2.1, threshold: 2.5, unit: 's' },
  { name: 'First Input Delay', value: 85, threshold: 100, unit: 'ms' },
  { name: 'Cumulative Layout Shift', value: 0.05, threshold: 0.1, unit: '' }
]

const mockActiveAlerts = [
  {
    id: 'alert-1',
    name: 'High Memory Usage',
    severity: 'warning' as const,
    status: 'firing' as const,
    source: 'system-monitor',
    currentValue: 85,
    threshold: 80,
    startsAt: new Date(Date.now() - 30 * 60 * 1000),
    escalationLevel: 1
  },
  {
    id: 'alert-2', 
    name: 'Database Slow Queries',
    severity: 'critical' as const,
    status: 'acknowledged' as const,
    source: 'database-monitor',
    currentValue: 1500,
    threshold: 1000,
    startsAt: new Date(Date.now() - 15 * 60 * 1000),
    escalationLevel: 2,
    acknowledgedBy: 'admin@carmen.com'
  }
]

const mockBusinessMetrics = {
  totalUsers: 1250,
  activeUsers: 320,
  sessionCount: 450,
  averageSessionDuration: 1800000, // 30 minutes in ms
  workflowCompletionRate: 94.5,
  systemUptime: 99.8,
  errorRate: 0.2,
  performanceScore: 87
}

const mockWorkflowAnalytics = {
  totalWorkflows: 145,
  completedWorkflows: 137,
  abandonedWorkflows: 8,
  averageDuration: 450000, // 7.5 minutes in ms
  completionRate: 94.5,
  bottlenecks: [
    { stepName: 'Approval Process', averageDuration: 180000, failureRate: 5.2 },
    { stepName: 'Document Upload', averageDuration: 120000, failureRate: 2.1 },
    { stepName: 'Vendor Validation', averageDuration: 90000, failureRate: 1.8 }
  ]
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8']

export default function MonitoringDashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h')

  const refreshData = async () => {
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setLastUpdated(new Date())
    setIsLoading(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'bg-green-500'
      case 'degraded': return 'bg-yellow-500'
      case 'unhealthy': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case 'unhealthy': return <AlertCircle className="h-4 w-4 text-red-600" />
      default: return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white'
      case 'warning': return 'bg-yellow-500 text-black'
      case 'info': return 'bg-blue-500 text-white'
      default: return 'bg-gray-500 text-white'
    }
  }

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`
  }

  const formatUptime = (percentage: number) => {
    if (percentage >= 99.9) return 'Excellent'
    if (percentage >= 99.5) return 'Good'
    if (percentage >= 99.0) return 'Fair'
    return 'Poor'
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time monitoring and observability for Carmen ERP
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={refreshData}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">
              3/4 services operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockBusinessMetrics.systemUptime}%</div>
            <p className="text-xs text-muted-foreground">
              {formatUptime(mockBusinessMetrics.systemUptime)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{mockActiveAlerts.length}</div>
            <p className="text-xs text-muted-foreground">
              1 critical, 1 warning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance Score</CardTitle>
            <Gauge className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockBusinessMetrics.performanceScore}</div>
            <p className="text-xs text-muted-foreground">
              Good performance
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="business">Business</TabsTrigger>
          <TabsTrigger value="logs">Logs</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Health Checks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Health Checks
              </CardTitle>
              <CardDescription>
                Current status of all system components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockHealthChecks.map((check) => (
                  <div key={check.name} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <div className="font-medium">{check.name}</div>
                        <div className="text-sm text-muted-foreground">{check.message}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">{check.latency}ms</Badge>
                      <div className={`h-2 w-2 rounded-full ${getStatusColor(check.status)}`} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Active Alerts */}
          {mockActiveAlerts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                  Active Alerts
                </CardTitle>
                <CardDescription>
                  Current system alerts requiring attention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockActiveAlerts.map((alert) => (
                    <Alert key={alert.id} className="border-l-4 border-l-red-500">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle className="flex items-center justify-between">
                        <span>{alert.name}</span>
                        <div className="flex items-center space-x-2">
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline">
                            Level {alert.escalationLevel}
                          </Badge>
                        </div>
                      </AlertTitle>
                      <AlertDescription>
                        <div className="mt-2 space-y-1">
                          <p>Current value: {alert.currentValue} (threshold: {alert.threshold})</p>
                          <p>Started: {formatDuration(Date.now() - alert.startsAt.getTime())} ago</p>
                          {alert.acknowledgedBy && (
                            <p className="text-blue-600">Acknowledged by {alert.acknowledgedBy}</p>
                          )}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Infrastructure Tab */}
        <TabsContent value="infrastructure" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Server className="h-5 w-5" />
                  System Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">CPU Usage</span>
                      <span className="text-sm text-muted-foreground">42%</span>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Memory Usage</span>
                      <span className="text-sm text-muted-foreground">63%</span>
                    </div>
                    <Progress value={63} className="h-2" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Disk Usage</span>
                      <span className="text-sm text-muted-foreground">77%</span>
                    </div>
                    <Progress value={77} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Database Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Connection Pool</span>
                    <span className="text-sm text-muted-foreground">5/20 active</span>
                  </div>
                  <Progress value={25} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Query Performance</span>
                    <span className="text-sm text-muted-foreground">45ms avg</span>
                  </div>
                  <Progress value={80} className="h-2" />

                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Transactions/sec</span>
                    <span className="text-sm text-muted-foreground">25 TPS</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Metrics Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Resource Usage Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockSystemMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="timestamp" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU %" />
                  <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory %" />
                  <Line type="monotone" dataKey="disk" stroke="#ffc658" name="Disk %" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          {/* Core Web Vitals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Core Web Vitals
              </CardTitle>
              <CardDescription>
                Key performance metrics for user experience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {mockPerformanceMetrics.map((metric) => (
                  <div key={metric.name} className="space-y-2">
                    <div className="text-sm font-medium">{metric.name}</div>
                    <div className="text-2xl font-bold">
                      {metric.value}{metric.unit}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Target: {metric.threshold}{metric.unit}
                    </div>
                    <Progress 
                      value={Math.min((metric.value / metric.threshold) * 100, 100)} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics Over Time</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockPerformanceMetrics}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alert Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Alert Statistics (24h)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Alerts</span>
                    <Badge variant="outline">12</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Critical</span>
                    <Badge className="bg-red-500">3</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Warning</span>
                    <Badge className="bg-yellow-500 text-black">7</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Info</span>
                    <Badge className="bg-blue-500">2</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Avg Resolution Time</span>
                    <Badge variant="outline">18m</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Alert Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Alert Sources</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'System', value: 40, fill: COLORS[0] },
                        { name: 'Database', value: 25, fill: COLORS[1] },
                        { name: 'Application', value: 20, fill: COLORS[2] },
                        { name: 'External', value: 15, fill: COLORS[3] }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      dataKey="value"
                      label
                    >
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Alert Rules */}
          <Card>
            <CardHeader>
              <CardTitle>Alert Rules</CardTitle>
              <CardDescription>
                Currently configured alert rules and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'High CPU Usage', enabled: true, severity: 'warning', threshold: '> 80%' },
                  { name: 'Memory Exhaustion', enabled: true, severity: 'critical', threshold: '> 90%' },
                  { name: 'Database Slow Queries', enabled: true, severity: 'warning', threshold: '> 1000ms' },
                  { name: 'API Response Time', enabled: false, severity: 'warning', threshold: '> 500ms' }
                ].map((rule) => (
                  <div key={rule.name} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{rule.name}</div>
                      <div className="text-sm text-muted-foreground">
                        Trigger when {rule.threshold}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(rule.severity)}>
                        {rule.severity}
                      </Badge>
                      <Badge variant={rule.enabled ? "default" : "secondary"}>
                        {rule.enabled ? "Enabled" : "Disabled"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Business Metrics Tab */}
        <TabsContent value="business" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockBusinessMetrics.totalUsers.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +5.2% from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockBusinessMetrics.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Currently online
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Workflow Completion</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockBusinessMetrics.workflowCompletionRate}%</div>
                <p className="text-xs text-muted-foreground">
                  +2.1% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{mockBusinessMetrics.errorRate}%</div>
                <p className="text-xs text-muted-foreground">
                  Within acceptable limits
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Analytics */}
          <Card>
            <CardHeader>
              <CardTitle>Workflow Performance</CardTitle>
              <CardDescription>
                Analysis of workflow efficiency and bottlenecks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Total Workflows</span>
                    <Badge variant="outline">{mockWorkflowAnalytics.totalWorkflows}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Completed</span>
                    <Badge className="bg-green-500">{mockWorkflowAnalytics.completedWorkflows}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Abandoned</span>
                    <Badge className="bg-red-500">{mockWorkflowAnalytics.abandonedWorkflows}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Average Duration</span>
                    <Badge variant="outline">{formatDuration(mockWorkflowAnalytics.averageDuration)}</Badge>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Top Bottlenecks</h4>
                  {mockWorkflowAnalytics.bottlenecks.map((bottleneck, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{bottleneck.stepName}</span>
                        <Badge variant="outline">{formatDuration(bottleneck.averageDuration)}</Badge>
                      </div>
                      <Progress value={bottleneck.failureRate} className="h-2" />
                      <span className="text-xs text-muted-foreground">
                        {bottleneck.failureRate}% failure rate
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Log Events
              </CardTitle>
              <CardDescription>
                Real-time system logs and events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {[
                  { time: '10:25:14', level: 'INFO', message: 'User authentication successful', source: 'auth-service' },
                  { time: '10:25:12', level: 'WARN', message: 'High memory usage detected', source: 'system-monitor' },
                  { time: '10:25:10', level: 'ERROR', message: 'Database query timeout', source: 'api-service' },
                  { time: '10:25:08', level: 'INFO', message: 'Purchase order created', source: 'procurement' },
                  { time: '10:25:06', level: 'DEBUG', message: 'Cache hit for product lookup', source: 'cache-service' }
                ].map((log, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded text-sm font-mono">
                    <span className="text-muted-foreground w-16">{log.time}</span>
                    <Badge 
                      variant={log.level === 'ERROR' ? 'destructive' : log.level === 'WARN' ? 'secondary' : 'outline'}
                      className="w-16 text-center"
                    >
                      {log.level}
                    </Badge>
                    <span className="text-muted-foreground w-24">{log.source}</span>
                    <span className="flex-1">{log.message}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}