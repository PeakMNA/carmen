'use client';

import { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Palette, Type, Layout, Zap, AlertCircle, CheckCircle, InfoIcon, XCircle, Moon, Sun, Monitor, Sparkles, Info, X, ShoppingCart, Package, Users, Factory } from 'lucide-react';

export default function StyleGuidePage() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [switchValue, setSwitchValue] = useState(false);
  const [checkboxValue, setCheckboxValue] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [selectValue, setSelectValue] = useState('');
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Ensure component is mounted for theme switching
  useEffect(() => {
    setMounted(true);
    
    // Animate progress bars
    const timer = setTimeout(() => setAnimatedProgress(75), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return null;
  }

  const ThemeToggle = () => (
    <div className="flex items-center gap-2 p-2 rounded-lg border bg-background/50 backdrop-blur-sm transition-all duration-300 hover:bg-background/80">
      <div className="text-xs text-muted-foreground mr-2">
        Current: {theme || 'loading...'}
      </div>
      <Button
        variant={theme === 'light' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => {
          console.log('Setting theme to light');
          setTheme('light');
        }}
        className="transition-all duration-200 hover:scale-105"
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => {
          console.log('Setting theme to dark');
          setTheme('dark');
        }}
        className="transition-all duration-200 hover:scale-105"
      >
        <Moon className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === 'system' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => {
          console.log('Setting theme to system');
          setTheme('system');
        }}
        className="transition-all duration-200 hover:scale-105"
      >
        <Monitor className="h-4 w-4" />
      </Button>
    </div>
  );

  return (
    <div className="px-6 py-6 space-y-8 transition-colors duration-300">
      {/* Header */}
      <div className="space-y-4 animate-in slide-in-from-top duration-500">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent animate-in slide-in-from-left duration-500">
              Design System Style Guide
            </h1>
            <p className="text-lg text-muted-foreground animate-in slide-in-from-left duration-700 delay-100">
              Comprehensive design guidelines and UI components for Carmen ERP
            </p>
          </div>
          
          <div className="animate-in slide-in-from-right duration-500 delay-200">
            <ThemeToggle />
          </div>
        </div>
      </div>

      <Tabs defaultValue="colors" className="space-y-6 animate-in fade-in duration-700 delay-300">
        <TabsList className="grid w-full grid-cols-7 transition-all duration-200">
          <TabsTrigger value="colors" className="transition-all duration-200 hover:scale-105">Colors</TabsTrigger>
          <TabsTrigger value="typography" className="transition-all duration-200 hover:scale-105">Typography</TabsTrigger>
          <TabsTrigger value="components" className="transition-all duration-200 hover:scale-105">Components</TabsTrigger>
          <TabsTrigger value="forms" className="transition-all duration-200 hover:scale-105">Forms</TabsTrigger>
          <TabsTrigger value="layout" className="transition-all duration-200 hover:scale-105">Layout</TabsTrigger>
          <TabsTrigger value="animations" className="transition-all duration-200 hover:scale-105">
            <Sparkles className="h-4 w-4 mr-1" />
            Animations
          </TabsTrigger>
          <TabsTrigger value="icons" className="transition-all duration-200 hover:scale-105">Icons</TabsTrigger>
        </TabsList>

        {/* Colors Tab */}
        <TabsContent value="colors" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              <h2 className="text-2xl font-semibold">Color Palette</h2>
            </div>

            {/* Primary Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Primary Colors</CardTitle>
                <CardDescription>Main brand colors used throughout the application</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2 group animate-in slide-in-from-bottom duration-500">
                  <div className="w-full h-20 bg-primary rounded-md border transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg cursor-pointer"></div>
                  <div className="text-sm transition-colors duration-200">
                    <p className="font-medium group-hover:text-primary">Primary</p>
                    <p className="text-muted-foreground">--primary</p>
                  </div>
                </div>
                <div className="space-y-2 group animate-in slide-in-from-bottom duration-500 delay-75">
                  <div className="w-full h-20 bg-primary/80 rounded-md border transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg cursor-pointer"></div>
                  <div className="text-sm transition-colors duration-200">
                    <p className="font-medium group-hover:text-primary">Primary 80%</p>
                    <p className="text-muted-foreground">--primary/80</p>
                  </div>
                </div>
                <div className="space-y-2 group animate-in slide-in-from-bottom duration-500 delay-150">
                  <div className="w-full h-20 bg-primary/60 rounded-md border transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg cursor-pointer"></div>
                  <div className="text-sm transition-colors duration-200">
                    <p className="font-medium group-hover:text-primary">Primary 60%</p>
                    <p className="text-muted-foreground">--primary/60</p>
                  </div>
                </div>
                <div className="space-y-2 group animate-in slide-in-from-bottom duration-500 delay-200">
                  <div className="w-full h-20 bg-primary/20 rounded-md border transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg cursor-pointer"></div>
                  <div className="text-sm transition-colors duration-200">
                    <p className="font-medium group-hover:text-primary">Primary 20%</p>
                    <p className="text-muted-foreground">--primary/20</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Secondary Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Secondary Colors</CardTitle>
                <CardDescription>Supporting colors and neutral tones</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="w-full h-20 bg-purple-500 rounded-md border"></div>
                  <div className="text-sm">
                    <p className="font-medium">Secondary</p>
                    <p className="text-muted-foreground">bg-purple-500</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 bg-muted rounded-md border"></div>
                  <div className="text-sm">
                    <p className="font-medium">Muted</p>
                    <p className="text-muted-foreground">--muted</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 bg-accent rounded-md border"></div>
                  <div className="text-sm">
                    <p className="font-medium">Accent</p>
                    <p className="text-muted-foreground">--accent</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 bg-border rounded-md border"></div>
                  <div className="text-sm">
                    <p className="font-medium">Border</p>
                    <p className="text-muted-foreground">--border</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Status Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Status Colors</CardTitle>
                <CardDescription>Colors for different states and feedback</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <div className="w-full h-20 bg-green-500 rounded-md border"></div>
                  <div className="text-sm">
                    <p className="font-medium">Success</p>
                    <p className="text-muted-foreground">bg-green-500</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 bg-destructive rounded-md border"></div>
                  <div className="text-sm">
                    <p className="font-medium">Destructive</p>
                    <p className="text-muted-foreground">--destructive</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 bg-yellow-500 rounded-md border"></div>
                  <div className="text-sm">
                    <p className="font-medium">Warning</p>
                    <p className="text-muted-foreground">bg-yellow-500</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="w-full h-20 bg-blue-500 rounded-md border"></div>
                  <div className="text-sm">
                    <p className="font-medium">Info</p>
                    <p className="text-muted-foreground">bg-blue-500</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badge Colors */}
            <Card>
              <CardHeader>
                <CardTitle>Badge Colors</CardTitle>
                <CardDescription>Badge variants with different semantic meanings and color schemes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Default Badge Variants */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Default Badge Variants</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="default">Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge variant="outline">Outline</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Basic badge variants: default, secondary, destructive, outline
                  </p>
                </div>

                {/* Status Badges with Icons */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Status Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-green-500 hover:bg-green-600 text-white">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                    <Badge className="bg-red-500 hover:bg-red-600 text-white">
                      <XCircle className="w-3 h-3 mr-1" />
                      Inactive
                    </Badge>
                    <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      Pending
                    </Badge>
                    <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                      <Info className="w-3 h-3 mr-1" />
                      Info
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Status badges with icons: active, inactive, pending, info
                  </p>
                </div>

                {/* Business Context Badges */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Business Context</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-purple-500 hover:bg-purple-600 text-white">Premium</Badge>
                    <Badge className="bg-orange-500 hover:bg-orange-600 text-white">Priority</Badge>
                    <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white">Approved</Badge>
                    <Badge className="bg-rose-500 hover:bg-rose-600 text-white">Urgent</Badge>
                    <Badge className="bg-cyan-500 hover:bg-cyan-600 text-white">New</Badge>
                    <Badge className="bg-indigo-500 hover:bg-indigo-600 text-white">Featured</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Business context badges: premium, priority, approved, urgent, new, featured
                  </p>
                </div>

                {/* Department/Category Badges */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Department Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="bg-amber-600 hover:bg-amber-700 text-white">
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Procurement
                    </Badge>
                    <Badge className="bg-teal-600 hover:bg-teal-700 text-white">
                      <Package className="w-3 h-3 mr-1" />
                      Inventory
                    </Badge>
                    <Badge className="bg-violet-600 hover:bg-violet-700 text-white">
                      <Users className="w-3 h-3 mr-1" />
                      Vendors
                    </Badge>
                    <Badge className="bg-slate-600 hover:bg-slate-700 text-white">
                      <Factory className="w-3 h-3 mr-1" />
                      Production
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Department badges with icons: procurement, inventory, vendors, production
                  </p>
                </div>

                {/* Numeric/Count Badges */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Numeric & Count Badges</h4>
                  <div className="flex flex-wrap gap-2 items-center">
                    <div className="flex items-center gap-2">
                      <span>Notifications</span>
                      <Badge className="bg-red-500 text-white rounded-full px-2 py-1 text-xs">3</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Messages</span>
                      <Badge className="bg-blue-500 text-white rounded-full px-2 py-1 text-xs">12</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>Items</span>
                      <Badge className="bg-gray-500 text-white rounded-full px-2 py-1 text-xs">99+</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Numeric badges for counts, notifications, and quantities
                  </p>
                </div>

                {/* Size Variants */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Size Variants</h4>
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Small:</span>
                      <Badge className="text-xs px-2 py-0.5">Small Badge</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Default:</span>
                      <Badge>Default Badge</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Large:</span>
                      <Badge className="text-sm px-3 py-1">Large Badge</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Different badge sizes: small (text-xs px-2 py-0.5), default, large (text-sm px-3 py-1)
                  </p>
                </div>

                {/* Interactive Badges */}
                <div>
                  <h4 className="text-lg font-semibold mb-4">Interactive Badges</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge className="cursor-pointer hover:bg-primary/80 transition-colors">
                      Clickable Badge
                    </Badge>
                    <Badge className="cursor-pointer group" variant="outline">
                      <X className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                      Removable Badge
                    </Badge>
                    <Badge className="cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      Gradient Badge
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Interactive badges: clickable, removable with close icon, gradient backgrounds
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Typography Tab */}
        <TabsContent value="typography" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              <h2 className="text-2xl font-semibold">Typography</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Headings</CardTitle>
                <CardDescription>Heading hierarchy and usage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h1 className="text-4xl font-bold">Heading 1</h1>
                    <p className="text-sm text-muted-foreground">text-4xl font-bold</p>
                  </div>
                  <div>
                    <h2 className="text-3xl font-semibold">Heading 2</h2>
                    <p className="text-sm text-muted-foreground">text-3xl font-semibold</p>
                  </div>
                  <div>
                    <h3 className="text-2xl font-semibold">Heading 3</h3>
                    <p className="text-sm text-muted-foreground">text-2xl font-semibold</p>
                  </div>
                  <div>
                    <h4 className="text-xl font-medium">Heading 4</h4>
                    <p className="text-sm text-muted-foreground">text-xl font-medium</p>
                  </div>
                  <div>
                    <h5 className="text-lg font-medium">Heading 5</h5>
                    <p className="text-sm text-muted-foreground">text-lg font-medium</p>
                  </div>
                  <div>
                    <h6 className="text-base font-medium">Heading 6</h6>
                    <p className="text-sm text-muted-foreground">text-base font-medium</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Body Text</CardTitle>
                <CardDescription>Text styles for content and descriptions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-base">Regular body text - used for main content</p>
                  <p className="text-sm text-muted-foreground">text-base</p>
                </div>
                <div>
                  <p className="text-sm">Small text - used for secondary information</p>
                  <p className="text-sm text-muted-foreground">text-sm</p>
                </div>
                <div>
                  <p className="text-xs">Extra small text - used for captions and labels</p>
                  <p className="text-sm text-muted-foreground">text-xs</p>
                </div>
                <div>
                  <p className="text-base text-muted-foreground">Muted text - used for secondary content</p>
                  <p className="text-sm text-muted-foreground">text-muted-foreground</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Components Tab */}
        <TabsContent value="components" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              <h2 className="text-2xl font-semibold">UI Components</h2>
            </div>

            {/* Buttons */}
            <Card>
              <CardHeader>
                <CardTitle>Buttons</CardTitle>
                <CardDescription>Button variants and sizes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Variants</h4>
                  <div className="flex flex-wrap gap-2">
                    <Button className="transition-all duration-200 hover:scale-105 hover:shadow-md animate-in slide-in-from-left duration-500">
                      Primary
                    </Button>
                    <Button variant="secondary" className="transition-all duration-200 hover:scale-105 hover:shadow-md animate-in slide-in-from-left duration-500 delay-75">
                      Secondary
                    </Button>
                    <Button variant="outline" className="transition-all duration-200 hover:scale-105 hover:shadow-md animate-in slide-in-from-left duration-500 delay-150">
                      Outline
                    </Button>
                    <Button variant="ghost" className="transition-all duration-200 hover:scale-105 hover:shadow-md animate-in slide-in-from-left duration-500 delay-200">
                      Ghost
                    </Button>
                    <Button variant="destructive" className="transition-all duration-200 hover:scale-105 hover:shadow-md animate-in slide-in-from-left duration-500 delay-300">
                      Destructive
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Sizes</h4>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" className="transition-all duration-200 hover:scale-105 hover:shadow-md animate-in slide-in-from-right duration-500">
                      Small
                    </Button>
                    <Button size="default" className="transition-all duration-200 hover:scale-105 hover:shadow-md animate-in slide-in-from-right duration-500 delay-75">
                      Default
                    </Button>
                    <Button size="lg" className="transition-all duration-200 hover:scale-105 hover:shadow-md animate-in slide-in-from-right duration-500 delay-150">
                      Large
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Badges */}
            <Card>
              <CardHeader>
                <CardTitle>Badges</CardTitle>
                <CardDescription>Status indicators and labels</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge>Default</Badge>
                  <Badge variant="secondary">Secondary</Badge>
                  <Badge variant="outline">Outline</Badge>
                  <Badge variant="destructive">Destructive</Badge>
                </div>
              </CardContent>
            </Card>

            {/* Alerts */}
            <Card>
              <CardHeader>
                <CardTitle>Alerts</CardTitle>
                <CardDescription>Messages and notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <InfoIcon className="h-4 w-4" />
                  <AlertTitle>Info</AlertTitle>
                  <AlertDescription>
                    This is an informational alert message.
                  </AlertDescription>
                </Alert>
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertTitle className="text-green-800">Success</AlertTitle>
                  <AlertDescription className="text-green-700">
                    This is a success alert message.
                  </AlertDescription>
                </Alert>
                <Alert className="border-yellow-200 bg-yellow-50">
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  <AlertTitle className="text-yellow-800">Warning</AlertTitle>
                  <AlertDescription className="text-yellow-700">
                    This is a warning alert message.
                  </AlertDescription>
                </Alert>
                <Alert variant="destructive">
                  <XCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>
                    This is an error alert message.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Progress */}
            <Card>
              <CardHeader>
                <CardTitle>Progress</CardTitle>
                <CardDescription>Progress indicators</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>25%</span>
                  </div>
                  <Progress value={25} />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>75%</span>
                  </div>
                  <Progress value={75} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Responsive Table</CardTitle>
                <CardDescription>A table that transforms into a card layout on smaller screens.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table className="responsive-table">
                  <TableHeader>
                    <TableRow>
                      <TableHead>Header 1</TableHead>
                      <TableHead>Header 2</TableHead>
                      <TableHead>Header 3</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      <TableCell data-label="Header 1">Data 1.1</TableCell>
                      <TableCell data-label="Header 2">Data 1.2</TableCell>
                      <TableCell data-label="Header 3">Data 1.3</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell data-label="Header 1">Data 2.1</TableCell>
                      <TableCell data-label="Header 2">Data 2.2</TableCell>
                      <TableCell data-label="Header 3">Data 2.3</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

          </div>
        </TabsContent>

        {/* Forms Tab */}
        <TabsContent value="forms" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Form Components</CardTitle>
              <CardDescription>Input fields, controls, and form elements</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="text-input">Text Input</Label>
                    <Input id="text-input" placeholder="Enter text..." />
                  </div>
                  
                  <div>
                    <Label htmlFor="textarea">Textarea</Label>
                    <Textarea id="textarea" placeholder="Enter description..." />
                  </div>
                  
                  <div>
                    <Label htmlFor="select">Select</Label>
                    <Select value={selectValue} onValueChange={setSelectValue}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="option1">Option 1</SelectItem>
                        <SelectItem value="option2">Option 2</SelectItem>
                        <SelectItem value="option3">Option 3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="switch"
                      checked={switchValue}
                      onCheckedChange={setSwitchValue}
                    />
                    <Label htmlFor="switch">Switch</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="checkbox"
                      checked={checkboxValue}
                      onCheckedChange={(checked) => setCheckboxValue(checked as boolean)}
                    />
                    <Label htmlFor="checkbox">Checkbox</Label>
                  </div>
                  
                  <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option1" id="r1" />
                      <Label htmlFor="r1">Radio Option 1</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="option2" id="r2" />
                      <Label htmlFor="r2">Radio Option 2</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Form Design Principles</CardTitle>
              <CardDescription>Guidelines for creating user-friendly and effective forms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-medium">Layout</h4>
                <p className="text-sm text-muted-foreground">Labels should be placed above their corresponding input fields for clarity. Group related fields together using sections or separators.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Required Fields</h4>
                <p className="text-sm text-muted-foreground">Clearly mark required fields with an asterisk (*). Provide a clear indication of what is required in the form description.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Validation</h4>
                <p className="text-sm text-muted-foreground">Provide real-time, inline validation where possible. Error messages should be clear, concise, and positioned near the field in error.</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Buttons</h4>
                <p className="text-sm text-muted-foreground">The primary action button (e.g., "Submit", "Save") should be visually distinct. Secondary actions (e.g., "Cancel") should have less visual weight.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Layout Tab */}
        <TabsContent value="layout" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              <h2 className="text-2xl font-semibold">Layout Principles</h2>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Spacing System</CardTitle>
                <CardDescription>Consistent spacing using Tailwind scale</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="font-medium">Common Spacing Values:</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="w-full h-4 bg-primary/20"></div>
                      <span>1 (4px)</span>
                    </div>
                    <div>
                      <div className="w-full h-8 bg-primary/20"></div>
                      <span>2 (8px)</span>
                    </div>
                    <div>
                      <div className="w-full h-12 bg-primary/20"></div>
                      <span>3 (12px)</span>
                    </div>
                    <div>
                      <div className="w-full h-16 bg-primary/20"></div>
                      <span>4 (16px)</span>
                    </div>
                    <div>
                      <div className="w-full h-20 bg-primary/20"></div>
                      <span>5 (20px)</span>
                    </div>
                    <div>
                      <div className="w-full h-24 bg-primary/20"></div>
                      <span>6 (24px)</span>
                    </div>
                    <div>
                      <div className="w-full h-32 bg-primary/20"></div>
                      <span>8 (32px)</span>
                    </div>
                    <div>
                      <div className="w-full h-40 bg-primary/20"></div>
                      <span>10 (40px)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Grid System</CardTitle>
                <CardDescription>Responsive grid layouts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-primary/10 p-4 rounded">Column 1</div>
                  <div className="bg-primary/10 p-4 rounded">Column 2</div>
                  <div className="bg-primary/10 p-4 rounded">Column 3</div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  grid-cols-1 md:grid-cols-2 lg:grid-cols-3
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cards & Containers</CardTitle>
                <CardDescription>Content containers and card layouts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Simple Card</h4>
                  <p className="text-sm text-muted-foreground">Basic card with border and padding</p>
                </div>
                
                <div className="bg-muted/50 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Muted Background Card</h4>
                  <p className="text-sm text-muted-foreground">Card with subtle background</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Animations Tab */}
        <TabsContent value="animations" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              <h2 className="text-2xl font-semibold">Animation Principles</h2>
            </div>

            {/* Animation Demos */}
            <Card>
              <CardHeader>
                <CardTitle>Hover Effects</CardTitle>
                <CardDescription>Interactive hover animations and micro-interactions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-6 border rounded-lg bg-gradient-to-br from-primary/5 to-purple-500/5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:bg-gradient-to-br hover:from-primary/10 hover:to-purple-500/10 cursor-pointer">
                    <h4 className="font-medium mb-2">Scale on Hover</h4>
                    <p className="text-sm text-muted-foreground">hover:scale-105</p>
                  </div>
                  <div className="p-6 border rounded-lg transition-all duration-300 hover:translate-y-[-4px] hover:shadow-xl cursor-pointer">
                    <h4 className="font-medium mb-2">Lift on Hover</h4>
                    <p className="text-sm text-muted-foreground">hover:translate-y-[-4px]</p>
                  </div>
                  <div className="p-6 border rounded-lg transition-all duration-500 hover:rotate-2 hover:bg-accent/20 cursor-pointer">
                    <h4 className="font-medium mb-2">Rotate on Hover</h4>
                    <p className="text-sm text-muted-foreground">hover:rotate-2</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Loading Animations */}
            <Card>
              <CardHeader>
                <CardTitle>Loading States</CardTitle>
                <CardDescription>Progress indicators and loading animations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Animated Progress</span>
                    <span>{animatedProgress}%</span>
                  </div>
                  <Progress value={animatedProgress} className="transition-all duration-1000" />
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm">Spinning loader</span>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                  <span className="text-sm">Bouncing dots</span>
                </div>
              </CardContent>
            </Card>

            {/* Entrance Animations */}
            <Card>
              <CardHeader>
                <CardTitle>Page Entrance</CardTitle>
                <CardDescription>Content reveal animations and transitions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg animate-in slide-in-from-left duration-700">
                    <h4 className="font-medium mb-2">Slide from Left</h4>
                    <p className="text-sm text-muted-foreground">animate-in slide-in-from-left</p>
                  </div>
                  <div className="p-4 border rounded-lg animate-in slide-in-from-right duration-700 delay-200">
                    <h4 className="font-medium mb-2">Slide from Right</h4>
                    <p className="text-sm text-muted-foreground">with delay-200</p>
                  </div>
                  <div className="p-4 border rounded-lg animate-in fade-in duration-1000">
                    <h4 className="font-medium mb-2">Fade In</h4>
                    <p className="text-sm text-muted-foreground">animate-in fade-in</p>
                  </div>
                  <div className="p-4 border rounded-lg animate-in slide-in-from-bottom duration-500 delay-300">
                    <h4 className="font-medium mb-2">Slide from Bottom</h4>
                    <p className="text-sm text-muted-foreground">slide-in-from-bottom</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Animation Guidelines */}
            <Card>
              <CardHeader>
                <CardTitle>Animation Guidelines</CardTitle>
                <CardDescription>Best practices for smooth and meaningful animations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-medium mb-2">Duration Guidelines</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <span className="font-mono">duration-200</span> - Micro-interactions (hover, focus)</li>
                        <li>• <span className="font-mono">duration-300</span> - UI state changes</li>
                        <li>• <span className="font-mono">duration-500</span> - Page transitions</li>
                        <li>• <span className="font-mono">duration-700+</span> - Complex animations</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Easing Functions</h4>
                      <ul className="text-sm text-muted-foreground space-y-1">
                        <li>• <span className="font-mono">ease-in</span> - Start slow, accelerate</li>
                        <li>• <span className="font-mono">ease-out</span> - Start fast, decelerate</li>
                        <li>• <span className="font-mono">ease-in-out</span> - Smooth both ends</li>
                        <li>• <span className="font-mono">linear</span> - Constant speed</li>
                      </ul>
                    </div>
                  </div>
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Animation Principles</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div>
                        <p><strong>Performance:</strong> Use transform and opacity for smooth animations</p>
                        <p><strong>Accessibility:</strong> Respect prefers-reduced-motion settings</p>
                      </div>
                      <div>
                        <p><strong>Purpose:</strong> Animations should guide attention and provide feedback</p>
                        <p><strong>Subtlety:</strong> Less is more - avoid overwhelming users</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Icons Tab */}
        <TabsContent value="icons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lucide Icons</CardTitle>
              <CardDescription>Icon library used throughout the application</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle className="h-6 w-6" />
                  <span className="text-xs text-center">CheckCircle</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <XCircle className="h-6 w-6" />
                  <span className="text-xs text-center">XCircle</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <AlertCircle className="h-6 w-6" />
                  <span className="text-xs text-center">AlertCircle</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <InfoIcon className="h-6 w-6" />
                  <span className="text-xs text-center">Info</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Palette className="h-6 w-6" />
                  <span className="text-xs text-center">Palette</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Type className="h-6 w-6" />
                  <span className="text-xs text-center">Type</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Layout className="h-6 w-6" />
                  <span className="text-xs text-center">Layout</span>
                </div>
                <div className="flex flex-col items-center gap-2">
                  <Zap className="h-6 w-6" />
                  <span className="text-xs text-center">Zap</span>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <h4 className="font-medium">Usage Guidelines</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Use h-4 w-4 for small icons in buttons and inline text</li>
                  <li>• Use h-5 w-5 for medium icons in headers and navigation</li>
                  <li>• Use h-6 w-6 for larger icons in prominent locations</li>
                  <li>• Always import icons from 'lucide-react'</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}