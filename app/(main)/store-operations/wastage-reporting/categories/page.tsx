'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  ArrowLeft,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Tag,
  Clock,
  DollarSign,
  Shield,
} from 'lucide-react'

// Mock data for wastage categories
const wastageCategories = [
  {
    id: '1',
    name: 'Expiration',
    code: 'EXP',
    description: 'Product past expiry or best-before date',
    color: '#ef4444',
    icon: 'clock',
    requiresApproval: true,
    approvalThreshold: 50,
    isActive: true,
    usageCount: 156,
    totalValue: 12450.00,
    createdAt: '2023-06-15',
  },
  {
    id: '2',
    name: 'Damage',
    code: 'DMG',
    description: 'Physical damage to product packaging or contents',
    color: '#f97316',
    icon: 'alert',
    requiresApproval: true,
    approvalThreshold: 100,
    isActive: true,
    usageCount: 89,
    totalValue: 7820.50,
    createdAt: '2023-06-15',
  },
  {
    id: '3',
    name: 'Quality Issues',
    code: 'QTY',
    description: 'Product quality not meeting standards (discoloration, texture, taste)',
    color: '#eab308',
    icon: 'shield',
    requiresApproval: true,
    approvalThreshold: 75,
    isActive: true,
    usageCount: 67,
    totalValue: 5430.00,
    createdAt: '2023-06-15',
  },
  {
    id: '4',
    name: 'Spoilage',
    code: 'SPL',
    description: 'Product spoiled, rotted, or contaminated',
    color: '#84cc16',
    icon: 'trash',
    requiresApproval: false,
    approvalThreshold: 0,
    isActive: true,
    usageCount: 45,
    totalValue: 3210.75,
    createdAt: '2023-06-15',
  },
  {
    id: '5',
    name: 'Overproduction',
    code: 'OVR',
    description: 'Excess production waste from kitchen operations',
    color: '#8b5cf6',
    icon: 'package',
    requiresApproval: false,
    approvalThreshold: 0,
    isActive: true,
    usageCount: 34,
    totalValue: 2890.00,
    createdAt: '2023-07-20',
  },
  {
    id: '6',
    name: 'Contamination',
    code: 'CTM',
    description: 'Product contaminated by foreign substances or pests',
    color: '#ec4899',
    icon: 'alert',
    requiresApproval: true,
    approvalThreshold: 25,
    isActive: true,
    usageCount: 12,
    totalValue: 980.00,
    createdAt: '2023-08-10',
  },
  {
    id: '7',
    name: 'Temperature Abuse',
    code: 'TMP',
    description: 'Product exposed to incorrect temperature during storage',
    color: '#06b6d4',
    icon: 'thermometer',
    requiresApproval: true,
    approvalThreshold: 100,
    isActive: false,
    usageCount: 8,
    totalValue: 650.00,
    createdAt: '2023-09-05',
  },
  {
    id: '8',
    name: 'Other',
    code: 'OTH',
    description: 'Other reasons not covered by existing categories',
    color: '#6b7280',
    icon: 'file',
    requiresApproval: true,
    approvalThreshold: 50,
    isActive: true,
    usageCount: 23,
    totalValue: 1540.00,
    createdAt: '2023-06-15',
  },
]

// Approval rules
const approvalRules = [
  { id: '1', name: 'High Value Items', condition: 'Total value > $100', action: 'Require Manager Approval', isActive: true },
  { id: '2', name: 'Premium Products', condition: 'Category = Meat & Poultry or Seafood', action: 'Require Manager Approval', isActive: true },
  { id: '3', name: 'Repeated Wastage', condition: '3+ reports for same item in 7 days', action: 'Flag for Review', isActive: true },
  { id: '4', name: 'Bulk Wastage', condition: 'Quantity > 50 units', action: 'Require Manager Approval', isActive: false },
]

export default function WastageCategoriesPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Link href="/store-operations/wastage-reporting">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="h-7 w-7 text-blue-600" />
              Wastage Categories
            </h1>
            <p className="text-muted-foreground">
              Manage wastage reasons and approval workflows
            </p>
          </div>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Category
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add Wastage Category</DialogTitle>
              <DialogDescription>
                Create a new category for classifying wastage reasons.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Category Name</Label>
                <Input id="name" placeholder="e.g., Temperature Abuse" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Code</Label>
                  <Input id="code" placeholder="e.g., TMP" maxLength={4} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="color">Color</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="#ef4444">Red</SelectItem>
                      <SelectItem value="#f97316">Orange</SelectItem>
                      <SelectItem value="#eab308">Yellow</SelectItem>
                      <SelectItem value="#84cc16">Green</SelectItem>
                      <SelectItem value="#06b6d4">Cyan</SelectItem>
                      <SelectItem value="#8b5cf6">Purple</SelectItem>
                      <SelectItem value="#ec4899">Pink</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Describe when this category should be used..."
                  rows={3}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Requires Approval</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable manager approval for this category
                  </p>
                </div>
                <Switch />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="threshold">Approval Threshold ($)</Label>
                <Input id="threshold" type="number" placeholder="e.g., 100" />
                <p className="text-xs text-muted-foreground">
                  Reports above this value will require manager approval
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsAddDialogOpen(false)}>
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Categories Table */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Wastage Categories ({wastageCategories.length})
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-center">Approval</TableHead>
                <TableHead className="text-right">Threshold</TableHead>
                <TableHead className="text-center">Usage</TableHead>
                <TableHead className="text-right">Total Value</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wastageCategories.map((category) => (
                <TableRow key={category.id} className={!category.isActive ? 'opacity-50' : ''}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: category.color }}
                      />
                      <span className="font-medium">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{category.code}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px]">
                    <p className="text-sm text-muted-foreground truncate">
                      {category.description}
                    </p>
                  </TableCell>
                  <TableCell className="text-center">
                    {category.requiresApproval ? (
                      <CheckCircle2 className="h-4 w-4 text-green-600 mx-auto" />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {category.approvalThreshold > 0 ? (
                      `$${category.approvalThreshold}`
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">{category.usageCount}</TableCell>
                  <TableCell className="text-right text-red-600 font-medium">
                    ${category.totalValue.toLocaleString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={category.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-600'
                    }>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Category
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings className="mr-2 h-4 w-4" />
                          Configure Rules
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Category
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Approval Rules */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Approval Rules
            </CardTitle>
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Rule
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {approvalRules.map((rule) => (
              <div
                key={rule.id}
                className={`flex items-center justify-between p-4 border rounded-lg ${
                  rule.isActive ? 'bg-white' : 'bg-gray-50 opacity-60'
                }`}
              >
                <div className="flex items-center gap-4">
                  <Switch checked={rule.isActive} />
                  <div>
                    <p className="font-medium">{rule.name}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">If:</span> {rule.condition}
                      <span className="mx-2">→</span>
                      <span className="font-medium">Then:</span> {rule.action}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Categories</p>
                <p className="text-2xl font-bold">{wastageCategories.length}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {wastageCategories.filter(c => c.isActive).length} active
                </p>
              </div>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Tag className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Requiring Approval</p>
                <p className="text-2xl font-bold">
                  {wastageCategories.filter(c => c.requiresApproval).length}
                </p>
                <p className="text-xs text-muted-foreground mt-1">categories</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Usage</p>
                <p className="text-2xl font-bold">
                  {wastageCategories.reduce((sum, c) => sum + c.usageCount, 0)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">reports filed</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-muted-foreground">Total Wastage Value</p>
                <p className="text-2xl font-bold text-red-600">
                  ${wastageCategories.reduce((sum, c) => sum + c.totalValue, 0).toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">all time</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Help Text */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">About Wastage Categories</p>
              <p className="text-sm text-blue-700 mt-1">
                Categories help classify wastage for reporting and analysis. Configure approval thresholds to require
                manager sign-off for high-value or sensitive items. Approval rules provide additional automation
                based on conditions like item value, category, or frequency.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
