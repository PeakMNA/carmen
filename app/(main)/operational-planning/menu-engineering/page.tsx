'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { 
  ResponsiveContainer, 
  ScatterChart, 
  Scatter, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Cell,
  PieChart,
  Pie,
  BarChart,
  Bar,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
  Target,
  DollarSign,
  Calendar as CalendarIcon,
  Download,
  Settings,
  Filter,
  RefreshCw,
  Bell,
  BellRing,
  BarChart3,
  PieChart as PieChartIcon,
  FileSpreadsheet,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

// Import our custom components
import CostAlertManagement from './components/cost-alert-management';
import RecipePerformanceMetrics from './components/recipe-performance-metrics';

// Mock data for demonstration
const mockMenuItems = [
  {
    recipeId: '1',
    recipeName: 'Grilled Salmon',
    category: 'Main Course',
    totalSales: 450,
    totalRevenue: { amount: 13500, currency: 'USD' },
    grossProfit: { amount: 8100, currency: 'USD' },
    grossMarginPercentage: 60,
    popularityScore: 85,
    profitabilityScore: 90,
    classification: 'star' as const,
    salesTrend: 12,
    profitTrend: 8,
    unitContribution: { amount: 18, currency: 'USD' }
  },
  {
    recipeId: '2',
    recipeName: 'Caesar Salad',
    category: 'Appetizer',
    totalSales: 320,
    totalRevenue: { amount: 4800, currency: 'USD' },
    grossProfit: { amount: 1920, currency: 'USD' },
    grossMarginPercentage: 40,
    popularityScore: 75,
    profitabilityScore: 25,
    classification: 'plow_horse' as const,
    salesTrend: 5,
    profitTrend: -3,
    unitContribution: { amount: 6, currency: 'USD' }
  },
  {
    recipeId: '3',
    recipeName: 'Wagyu Steak',
    category: 'Main Course',
    totalSales: 85,
    totalRevenue: { amount: 6800, currency: 'USD' },
    grossProfit: { amount: 4760, currency: 'USD' },
    grossMarginPercentage: 70,
    popularityScore: 25,
    profitabilityScore: 85,
    classification: 'puzzle' as const,
    salesTrend: -5,
    profitTrend: 15,
    unitContribution: { amount: 56, currency: 'USD' }
  },
  {
    recipeId: '4',
    recipeName: 'House Bread',
    category: 'Appetizer',
    totalSales: 180,
    totalRevenue: { amount: 900, currency: 'USD' },
    grossProfit: { amount: 270, currency: 'USD' },
    grossMarginPercentage: 30,
    popularityScore: 40,
    profitabilityScore: 15,
    classification: 'dog' as const,
    salesTrend: -8,
    profitTrend: -12,
    unitContribution: { amount: 1.5, currency: 'USD' }
  }
];

const classificationColors = {
  star: '#22c55e', // Green
  plow_horse: '#3b82f6', // Blue  
  puzzle: '#f59e0b', // Yellow
  dog: '#ef4444' // Red
};

const classificationLabels = {
  star: 'Stars',
  plow_horse: 'Plow Horses',
  puzzle: 'Puzzles', 
  dog: 'Dogs'
};

const classificationDescriptions = {
  star: 'High popularity, High profitability - Promote these items',
  plow_horse: 'High popularity, Low profitability - Increase prices or reduce costs',
  puzzle: 'Low popularity, High profitability - Increase marketing or reposition',
  dog: 'Low popularity, Low profitability - Consider removing or reformulating'
};

export default function MenuEngineeringPage() {
  const [dateRange, setDateRange] = useState({
    from: new Date(2024, 0, 1),
    to: new Date()
  });
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);

  // Portfolio composition data
  const portfolioData = useMemo(() => {
    const composition = mockMenuItems.reduce((acc, item) => {
      acc[item.classification] = (acc[item.classification] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(composition).map(([classification, count]) => ({
      classification,
      count,
      percentage: (count / mockMenuItems.length) * 100,
      fill: classificationColors[classification as keyof typeof classificationColors]
    }));
  }, []);

  // Performance matrix scatter data
  const scatterData = mockMenuItems.map(item => ({
    ...item,
    x: item.popularityScore,
    y: item.profitabilityScore,
    fill: classificationColors[item.classification]
  }));

  // Alert statistics
  const alertStats = {
    total: 8,
    active: 3,
    critical: 1,
    resolved: 4
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Menu Engineering Dashboard</h1>
          <p className="text-muted-foreground">
            Analyze menu performance using popularity vs profitability matrix
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockMenuItems.length}</div>
            <p className="text-xs text-muted-foreground">
              Active menu items
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockMenuItems.reduce((sum, item) => sum + item.totalRevenue.amount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +8.2% from last period
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Contribution</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${(mockMenuItems.reduce((sum, item) => sum + item.unitContribution.amount, 0) / mockMenuItems.length).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per item contribution
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{alertStats.active}</div>
            <p className="text-xs text-muted-foreground">
              {alertStats.critical} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Health</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">75%</div>
            <p className="text-xs text-muted-foreground">
              Optimization score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="matrix" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="matrix">Performance Matrix</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio Analysis</TabsTrigger>
          <TabsTrigger value="recipe-details">Recipe Details</TabsTrigger>
          <TabsTrigger value="alerts">Cost Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="matrix" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <span className="font-medium">Filters</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Range</label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !dateRange && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange?.from ? (
                          dateRange.to ? (
                            <>
                              {format(dateRange.from, "LLL dd, y")} -{" "}
                              {format(dateRange.to, "LLL dd, y")}
                            </>
                          ) : (
                            format(dateRange.from, "LLL dd, y")
                          )
                        ) : (
                          <span>Pick a date</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        defaultMonth={dateRange?.from}
                        selected={dateRange}
                        onSelect={setDateRange as any}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="appetizer">Appetizer</SelectItem>
                      <SelectItem value="main">Main Course</SelectItem>
                      <SelectItem value="dessert">Dessert</SelectItem>
                      <SelectItem value="beverage">Beverage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      <SelectItem value="downtown">Downtown</SelectItem>
                      <SelectItem value="uptown">Uptown</SelectItem>
                      <SelectItem value="mall">Mall Location</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Quick Actions</label>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1 gap-1.5">
                      <Target className="h-4 w-4" />
                      Targets
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Performance Matrix Scatter Plot */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Menu Performance Matrix</CardTitle>
                <CardDescription>
                  Items plotted by popularity (x-axis) vs profitability (y-axis)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    star: { label: "Stars", color: classificationColors.star },
                    plow_horse: { label: "Plow Horses", color: classificationColors.plow_horse },
                    puzzle: { label: "Puzzles", color: classificationColors.puzzle },
                    dog: { label: "Dogs", color: classificationColors.dog }
                  }}
                  className="h-[400px]"
                >
                  <ScatterChart data={scatterData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="x" 
                      name="Popularity" 
                      unit="%" 
                      domain={[0, 100]}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="y" 
                      name="Profitability" 
                      unit="%" 
                      domain={[0, 100]}
                    />
                    {/* Quadrant dividers */}
                    <line x1="50%" y1="0%" x2="50%" y2="100%" stroke="#e5e7eb" strokeDasharray="2,2" />
                    <line x1="0%" y1="50%" x2="100%" y2="50%" stroke="#e5e7eb" strokeDasharray="2,2" />
                    <Scatter 
                      dataKey="y" 
                      fill="#8884d8"
                    >
                      {scatterData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Scatter>
                    <ChartTooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                              <p className="font-medium">{data.recipeName}</p>
                              <p className="text-sm text-muted-foreground">{data.category}</p>
                              <Separator className="my-2" />
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Popularity:</span>
                                  <span>{data.popularityScore}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Profitability:</span>
                                  <span>{data.profitabilityScore}%</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Sales:</span>
                                  <span>{data.totalSales}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Revenue:</span>
                                  <span>${data.totalRevenue.amount.toLocaleString()}</span>
                                </div>
                              </div>
                              <Separator className="my-2" />
                              <div className="flex gap-2">
                                <Badge 
                                  variant="secondary" 
                                  style={{ backgroundColor: data.fill + '20', color: data.fill }}
                                >
                                  {classificationLabels[data.classification as keyof typeof classificationLabels]}
                                </Badge>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => setSelectedRecipe(data.recipeId)}
                                >
                                  View Details
                                </Button>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </ScatterChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </div>

          {/* Classification Legend */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Object.entries(classificationLabels).map(([key, label]) => (
              <Card key={key}>
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-4 h-4 rounded-full" 
                      style={{ backgroundColor: classificationColors[key as keyof typeof classificationColors] }}
                    />
                    <CardTitle className="text-base">{label}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {classificationDescriptions[key as keyof typeof classificationDescriptions]}
                  </p>
                  <div className="mt-2">
                    <span className="text-lg font-semibold">
                      {portfolioData.find(d => d.classification === key)?.count || 0}
                    </span>
                    <span className="text-sm text-muted-foreground ml-1">items</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* Portfolio Composition */}
            <Card>
              <CardHeader>
                <CardTitle>Portfolio Composition</CardTitle>
                <CardDescription>Distribution of menu items by classification</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    star: { label: "Stars", color: classificationColors.star },
                    plow_horse: { label: "Plow Horses", color: classificationColors.plow_horse },
                    puzzle: { label: "Puzzles", color: classificationColors.puzzle },
                    dog: { label: "Dogs", color: classificationColors.dog }
                  }}
                  className="h-[300px]"
                >
                  <PieChart>
                    <Pie
                      data={portfolioData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      label={({ classification, percentage }) => 
                        `${classificationLabels[classification as keyof typeof classificationLabels]} (${percentage.toFixed(0)}%)`
                      }
                    >
                      {portfolioData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartTooltip />
                    <Legend />
                  </PieChart>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Top Performers */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performers</CardTitle>
                <CardDescription>Highest contributing menu items</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockMenuItems
                    .sort((a, b) => b.unitContribution.amount - a.unitContribution.amount)
                    .slice(0, 5)
                    .map((item, index) => (
                      <div key={item.recipeId} className="flex items-center gap-3 cursor-pointer hover:bg-muted/50 p-2 rounded-lg" onClick={() => setSelectedRecipe(item.recipeId)}>
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-muted text-sm font-medium">
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.recipeName}</p>
                          <p className="text-xs text-muted-foreground">{item.category}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">
                            ${item.unitContribution.amount.toFixed(2)}
                          </p>
                          <Badge 
                            variant="secondary" 
                            className="text-xs"
                            style={{ 
                              backgroundColor: classificationColors[item.classification] + '20', 
                              color: classificationColors[item.classification] 
                            }}
                          >
                            {classificationLabels[item.classification]}
                          </Badge>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recipe-details">
          {selectedRecipe ? (
            <RecipePerformanceMetrics 
              recipeId={selectedRecipe} 
              recipeName={mockMenuItems.find(item => item.recipeId === selectedRecipe)?.recipeName || 'Recipe'} 
            />
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <PieChartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-medium mb-2">Select a Recipe</h3>
                <p className="text-sm text-muted-foreground">
                  Click on a recipe from the performance matrix or portfolio analysis to view detailed metrics.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="alerts">
          <CostAlertManagement />
        </TabsContent>

      </Tabs>
    </div>
  );
}