'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Tooltip, Legend,
  AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Shield, FileText, AlertTriangle, CheckCircle, Clock,
  ThermometerSun, Droplets, Zap, Users, Eye,
  Download, Calendar, Filter, Search, RefreshCw,
  Award, Target, TrendingUp, Info
} from 'lucide-react';

interface ComplianceStandard {
  id: string;
  name: string;
  category: 'food_safety' | 'quality' | 'labeling' | 'storage' | 'traceability' | 'allergen';
  compliance_score: number;
  last_audit: string;
  next_audit: string;
  status: 'compliant' | 'minor_issues' | 'major_issues' | 'non_compliant';
  critical_points: number;
  violations: ComplianceViolation[];
  requirements: ComplianceRequirement[];
}

interface ComplianceViolation {
  id: string;
  severity: 'critical' | 'major' | 'minor';
  description: string;
  location: string;
  date_identified: string;
  status: 'open' | 'in_progress' | 'resolved';
  assigned_to: string;
  due_date: string;
  corrective_action: string;
}

interface ComplianceRequirement {
  id: string;
  requirement: string;
  status: 'met' | 'partial' | 'not_met';
  evidence: string[];
  last_verified: string;
  next_verification: string;
}

interface QualityMetric {
  id: string;
  metric: string;
  current_value: number;
  target_value: number;
  unit: string;
  trend: 'improving' | 'stable' | 'declining';
  status: 'excellent' | 'good' | 'acceptable' | 'poor';
  measurement_frequency: string;
  last_measured: string;
}

interface TraceabilityRecord {
  id: string;
  item: string;
  batch_number: string;
  source: string;
  received_date: string;
  expiry_date: string;
  current_location: string;
  fractional_portions: number;
  remaining_portions: number;
  temperature_log: TemperaturePoint[];
  quality_checks: QualityCheck[];
}

interface TemperaturePoint {
  timestamp: string;
  temperature: number;
  location: string;
  status: 'safe' | 'warning' | 'critical';
}

interface QualityCheck {
  id: string;
  timestamp: string;
  inspector: string;
  score: number;
  notes: string;
  photos: string[];
}

interface AllergenAlert {
  id: string;
  allergen: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  affected_items: string[];
  detection_method: string;
  timestamp: string;
  action_taken: string;
  verification_status: 'pending' | 'verified' | 'cleared';
}

export default function ComplianceReports() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('month');
  const [refreshing, setRefreshing] = useState(false);

  // Compliance Standards Data
  const complianceStandards: ComplianceStandard[] = [
    {
      id: 'haccp',
      name: 'HACCP (Hazard Analysis Critical Control Points)',
      category: 'food_safety',
      compliance_score: 94,
      last_audit: '2024-01-10',
      next_audit: '2024-04-10',
      status: 'compliant',
      critical_points: 12,
      violations: [
        {
          id: 'v1',
          severity: 'minor',
          description: 'Temperature log missing for cold storage unit #3',
          location: 'Storage Area C',
          date_identified: '2024-01-12',
          status: 'in_progress',
          assigned_to: 'John Smith',
          due_date: '2024-01-19',
          corrective_action: 'Install automated temperature monitoring'
        }
      ],
      requirements: [
        {
          id: 'r1',
          requirement: 'Temperature monitoring at all critical control points',
          status: 'met',
          evidence: ['Temperature logs', 'Monitoring reports'],
          last_verified: '2024-01-10',
          next_verification: '2024-01-17'
        }
      ]
    },
    {
      id: 'iso22000',
      name: 'ISO 22000 Food Safety Management',
      category: 'quality',
      compliance_score: 89,
      last_audit: '2024-01-05',
      next_audit: '2024-07-05',
      status: 'minor_issues',
      critical_points: 18,
      violations: [
        {
          id: 'v2',
          severity: 'major',
          description: 'Incomplete traceability records for fractional products',
          location: 'Packaging Department',
          date_identified: '2024-01-13',
          status: 'open',
          assigned_to: 'Sarah Johnson',
          due_date: '2024-01-20',
          corrective_action: 'Implement barcode tracking system'
        }
      ],
      requirements: [
        {
          id: 'r2',
          requirement: 'Full traceability for all food products',
          status: 'partial',
          evidence: ['Batch records (incomplete)', 'Supplier certificates'],
          last_verified: '2024-01-05',
          next_verification: '2024-01-20'
        }
      ]
    }
  ];

  // Quality Metrics
  const qualityMetrics: QualityMetric[] = [
    {
      id: 'customer_complaints',
      metric: 'Customer Complaints per 1000 orders',
      current_value: 2.1,
      target_value: 5.0,
      unit: 'complaints/1000 orders',
      trend: 'improving',
      status: 'excellent',
      measurement_frequency: 'Daily',
      last_measured: '2024-01-14'
    },
    {
      id: 'product_recalls',
      metric: 'Product Recalls',
      current_value: 0,
      target_value: 0,
      unit: 'recalls',
      trend: 'stable',
      status: 'excellent',
      measurement_frequency: 'Continuous',
      last_measured: '2024-01-14'
    },
    {
      id: 'hygiene_scores',
      metric: 'Average Hygiene Inspection Score',
      current_value: 94.5,
      target_value: 95.0,
      unit: 'score',
      trend: 'stable',
      status: 'good',
      measurement_frequency: 'Weekly',
      last_measured: '2024-01-12'
    },
    {
      id: 'temperature_violations',
      metric: 'Temperature Violations',
      current_value: 3,
      target_value: 0,
      unit: 'violations',
      trend: 'declining',
      status: 'acceptable',
      measurement_frequency: 'Daily',
      last_measured: '2024-01-14'
    }
  ];

  // Traceability Records Sample
  const traceabilityRecords: TraceabilityRecord[] = [
    {
      id: 'tr001',
      item: 'Premium Wagyu Beef',
      batch_number: 'WG-2410-001',
      source: 'Australian Premium Meats',
      received_date: '2024-01-10',
      expiry_date: '2024-01-17',
      current_location: 'Cold Storage A',
      fractional_portions: 24,
      remaining_portions: 8,
      temperature_log: [
        { timestamp: '2024-01-14 08:00', temperature: 2.1, location: 'Cold Storage A', status: 'safe' },
        { timestamp: '2024-01-14 12:00', temperature: 2.3, location: 'Cold Storage A', status: 'safe' },
        { timestamp: '2024-01-14 16:00', temperature: 2.8, location: 'Cold Storage A', status: 'warning' }
      ],
      quality_checks: [
        {
          id: 'qc1',
          timestamp: '2024-01-10 09:00',
          inspector: 'Maria Rodriguez',
          score: 96,
          notes: 'Excellent quality, proper marbling',
          photos: ['beef_quality_1.jpg']
        }
      ]
    }
  ];

  // Allergen Alerts
  const allergenAlerts: AllergenAlert[] = [
    {
      id: 'aa001',
      allergen: 'Tree Nuts',
      risk_level: 'high',
      affected_items: ['Artisan Bread Mix', 'Gourmet Granola'],
      detection_method: 'Routine Testing',
      timestamp: '2024-01-13 14:30',
      action_taken: 'Quarantined affected batches, initiated supplier investigation',
      verification_status: 'pending'
    }
  ];

  // Compliance Trend Data
  const complianceTrend = [
    { month: 'Jul', overall: 91, food_safety: 93, quality: 89, labeling: 88, storage: 92 },
    { month: 'Aug', overall: 92, food_safety: 94, quality: 90, labeling: 90, storage: 93 },
    { month: 'Sep', overall: 93, food_safety: 95, quality: 91, labeling: 91, storage: 94 },
    { month: 'Oct', overall: 94, food_safety: 96, quality: 92, labeling: 92, storage: 95 },
    { month: 'Nov', overall: 93, food_safety: 95, quality: 91, labeling: 93, storage: 94 },
    { month: 'Dec', overall: 95, food_safety: 97, quality: 93, labeling: 94, storage: 96 },
    { month: 'Jan', overall: 94, food_safety: 96, quality: 92, labeling: 93, storage: 95 }
  ];

  // Audit Results Distribution
  const auditResults = [
    { name: 'Compliant', value: 78, color: '#10b981' },
    { name: 'Minor Issues', value: 18, color: '#f59e0b' },
    { name: 'Major Issues', value: 3, color: '#ef4444' },
    { name: 'Non-Compliant', value: 1, color: '#dc2626' }
  ];

  const handleRefresh = async () => {
    setRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setRefreshing(false);
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'text-green-600 bg-green-100';
      case 'minor_issues': return 'text-yellow-600 bg-yellow-100';
      case 'major_issues': return 'text-orange-600 bg-orange-100';
      case 'non_compliant': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'major': return 'text-orange-600 bg-orange-100';
      case 'minor': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getQualityStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'acceptable': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center">
            <Shield className="h-8 w-8 mr-3" />
            Compliance Reports
          </h1>
          <p className="text-muted-foreground">
            Food Safety & Quality Standards Monitoring
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="food_safety">Food Safety</SelectItem>
              <SelectItem value="quality">Quality</SelectItem>
              <SelectItem value="labeling">Labeling</SelectItem>
              <SelectItem value="storage">Storage</SelectItem>
              <SelectItem value="traceability">Traceability</SelectItem>
              <SelectItem value="allergen">Allergen Control</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="quarter">This Quarter</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Compliance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
            <Award className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94.2%</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              +2.1% from last month
            </div>
            <Progress value={94.2} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Violations</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">7</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-red-500" />
              +2 since last week
            </div>
            <div className="mt-2 text-xs">
              <span className="text-red-600">2 Critical</span> • 
              <span className="text-orange-600 ml-1">3 Major</span> • 
              <span className="text-yellow-600 ml-1">2 Minor</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Audits</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">3</div>
            <div className="text-xs text-muted-foreground">Next 30 days</div>
            <div className="mt-2 text-xs">
              <div>HACCP: Jan 20</div>
              <div>ISO 22000: Jan 25</div>
              <div>Local Health: Jan 28</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
            <Target className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">4.8/5.0</div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1" />
              +0.2 improvement
            </div>
            <Progress value={96} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="standards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="standards">Standards</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
          <TabsTrigger value="traceability">Traceability</TabsTrigger>
          <TabsTrigger value="allergens">Allergen Control</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        {/* Standards Tab */}
        <TabsContent value="standards" className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {complianceStandards.map((standard) => (
              <Card key={standard.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{standard.name}</CardTitle>
                      <CardDescription>
                        {standard.critical_points} critical control points
                      </CardDescription>
                    </div>
                    <div className="text-right space-y-2">
                      <Badge className={getComplianceColor(standard.status)}>
                        {standard.status.replace('_', ' ')}
                      </Badge>
                      <div className="text-2xl font-bold text-green-600">
                        {standard.compliance_score}%
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Recent Violations</h4>
                      {standard.violations.length > 0 ? (
                        <div className="space-y-2">
                          {standard.violations.map((violation) => (
                            <div key={violation.id} className="border-l-4 border-orange-500 pl-3 py-2">
                              <div className="flex items-center justify-between">
                                <Badge className={getSeverityColor(violation.severity)}>
                                  {violation.severity}
                                </Badge>
                                <Badge variant={
                                  violation.status === 'resolved' ? 'default' :
                                  violation.status === 'in_progress' ? 'secondary' :
                                  'destructive'
                                }>
                                  {violation.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm mt-1">{violation.description}</p>
                              <p className="text-xs text-gray-500">
                                {violation.location} • Due: {violation.due_date}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-green-600 text-sm flex items-center">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          No active violations
                        </div>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Key Requirements</h4>
                      <div className="space-y-2">
                        {standard.requirements.map((req) => (
                          <div key={req.id} className="text-sm">
                            <div className="flex items-center justify-between">
                              <span>{req.requirement}</span>
                              <Badge variant={
                                req.status === 'met' ? 'default' :
                                req.status === 'partial' ? 'secondary' :
                                'destructive'
                              }>
                                {req.status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Last verified: {req.last_verified}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>Last Audit: {standard.last_audit}</span>
                    <span>Next Audit: {standard.next_audit}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Quality Metrics Tab */}
        <TabsContent value="quality" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {qualityMetrics.map((metric) => (
              <Card key={metric.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{metric.metric}</CardTitle>
                  <CardDescription>
                    Measured {metric.measurement_frequency} • Last: {metric.last_measured}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold">
                        {metric.current_value} {metric.unit}
                      </div>
                      <div className="text-sm text-gray-500">
                        Target: {metric.target_value} {metric.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={`${getQualityStatusColor(metric.status)} bg-opacity-10`}>
                        {metric.status}
                      </Badge>
                      <div className="text-sm text-gray-500 mt-1">
                        {metric.trend}
                      </div>
                    </div>
                  </div>
                  
                  <Progress 
                    value={metric.status === 'excellent' ? 100 : 
                           metric.status === 'good' ? 80 :
                           metric.status === 'acceptable' ? 60 : 40} 
                    className="h-2" 
                  />
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Traceability Tab */}
        <TabsContent value="traceability" className="space-y-4">
          {traceabilityRecords.map((record) => (
            <Card key={record.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>{record.item}</CardTitle>
                    <CardDescription>
                      Batch: {record.batch_number} • Source: {record.source}
                    </CardDescription>
                  </div>
                  <Badge variant="outline">{record.current_location}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Inventory Status</h4>
                    <div className="space-y-2 text-sm">
                      <div>Received: {record.received_date}</div>
                      <div>Expires: {record.expiry_date}</div>
                      <div>Remaining: {record.remaining_portions}/{record.fractional_portions} portions</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Temperature Log</h4>
                    <div className="space-y-1">
                      {record.temperature_log.slice(-3).map((temp, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span>{temp.timestamp.split(' ')[1]}</span>
                          <div className="flex items-center">
                            <ThermometerSun className="h-3 w-3 mr-1" />
                            <span>{temp.temperature}°C</span>
                            <div className={`w-2 h-2 rounded-full ml-2 ${
                              temp.status === 'safe' ? 'bg-green-500' :
                              temp.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                            }`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">Quality Checks</h4>
                    {record.quality_checks.map((check) => (
                      <div key={check.id} className="text-sm space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Score: {check.score}/100</span>
                          <span>{check.timestamp.split(' ')[0]}</span>
                        </div>
                        <div className="text-gray-500">Inspector: {check.inspector}</div>
                        <div className="text-gray-600">{check.notes}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Allergen Control Tab */}
        <TabsContent value="allergens" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Allergen Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {allergenAlerts.map((alert) => (
                  <div key={alert.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge variant={
                            alert.risk_level === 'critical' ? 'destructive' :
                            alert.risk_level === 'high' ? 'destructive' :
                            alert.risk_level === 'medium' ? 'default' : 'secondary'
                          }>
                            {alert.risk_level} risk
                          </Badge>
                          <Badge variant="outline">{alert.allergen}</Badge>
                          <Badge variant={
                            alert.verification_status === 'cleared' ? 'default' :
                            alert.verification_status === 'verified' ? 'secondary' :
                            'destructive'
                          }>
                            {alert.verification_status}
                          </Badge>
                        </div>
                        
                        <h4 className="font-medium mb-2">
                          {alert.allergen} Contamination Detected
                        </h4>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <span className="text-sm text-gray-500">Affected Items:</span>
                            <ul className="list-disc list-inside text-sm">
                              {alert.affected_items.map((item, index) => (
                                <li key={index}>{item}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Detection Method:</span>
                            <div className="text-sm font-medium">{alert.detection_method}</div>
                          </div>
                        </div>
                        
                        <div className="bg-red-50 p-3 rounded border-l-4 border-red-500">
                          <p className="font-medium text-red-900 mb-1">Action Taken:</p>
                          <p className="text-red-800">{alert.action_taken}</p>
                        </div>
                      </div>
                      <div className="ml-4 text-right text-sm text-gray-500">
                        <div>Detected:</div>
                        <div>{alert.timestamp}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Trends Tab */}
        <TabsContent value="trends" className="space-y-4">
          {/* Compliance Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Compliance Trend Analysis</CardTitle>
              <CardDescription>
                Monthly compliance scores across all categories
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={complianceTrend}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[80, 100]} />
                    <Tooltip formatter={(value, name) => [`${value}%`, String(name).replace('_', ' ')]} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="overall" 
                      stroke="#3b82f6" 
                      strokeWidth={3}
                      name="Overall"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="food_safety" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="Food Safety"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="quality" 
                      stroke="#f59e0b" 
                      strokeWidth={2}
                      name="Quality"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="labeling" 
                      stroke="#8b5cf6" 
                      strokeWidth={2}
                      name="Labeling"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="storage" 
                      stroke="#06b6d4" 
                      strokeWidth={2}
                      name="Storage"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Audit Results Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Audit Results Distribution</CardTitle>
              <CardDescription>
                Current compliance status across all locations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-8">
                <div className="h-64 w-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={auditResults}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        dataKey="value"
                        label={({ name, value }) => `${value}%`}
                      >
                        {auditResults.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => [`${value}%`, 'Locations']} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="flex-1 space-y-4">
                  {auditResults.map((result, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-4 h-4 rounded-full mr-3" 
                          style={{ backgroundColor: result.color }} 
                        />
                        <span className="font-medium">{result.name}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold" style={{ color: result.color }}>
                          {result.value}%
                        </div>
                        <div className="text-sm text-gray-500">
                          {Math.round(result.value * 0.42)} locations
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}