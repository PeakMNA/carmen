"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Link2,
  Link2Off,
  MapPin,
  Slice,
  RefreshCw,
  Upload,
  Download,
  Filter,
  DollarSign
} from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import type { POSMapping, POSItem, FractionalVariant, RecipeSearchResult } from "@/lib/types/pos-integration"
import type { POSLocationMapping } from "@/lib/mock-data/pos-integration"
import { formatNumber, formatCurrency } from "@/lib/utils/formatters"

interface POSMappingTabProps {
  mappings: POSMapping[]
  unmappedItems: POSItem[]
  locationMappings: POSLocationMapping[]
  fractionalVariants: FractionalVariant[]
  recipeSearchResults: RecipeSearchResult[]
  onCreateMapping: (mapping: Partial<POSMapping>) => void
  onUpdateMapping: (id: string, mapping: Partial<POSMapping>) => void
  onDeleteMapping: (id: string) => void
  onSyncPOSItems: () => void
}

export function POSMappingTab({
  mappings,
  unmappedItems,
  locationMappings,
  fractionalVariants,
  recipeSearchResults,
  onCreateMapping,
  onUpdateMapping,
  onDeleteMapping,
  onSyncPOSItems
}: POSMappingTabProps) {
  const [subTab, setSubTab] = useState<'recipe' | 'location' | 'fractional'>('recipe')
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [outletFilter, setOutletFilter] = useState<string>('all')

  // Get mapped outlets from location mappings (only locations that have POS outlet assigned)
  const mappedOutlets = useMemo(() => {
    return locationMappings
      .filter(loc => loc.posOutletId !== null)
      .map(loc => ({
        id: loc.posOutletId!,
        name: loc.posOutletName!,
        locationId: loc.locationId,
        locationName: loc.locationName
      }))
  }, [locationMappings])

  // Create Mapping Dialog state
  const [showMappingDialog, setShowMappingDialog] = useState(false)
  const [selectedUnmappedItem, setSelectedUnmappedItem] = useState<POSItem | null>(null)
  const [selectedRecipe, setSelectedRecipe] = useState<string>('')
  const [selectedOutletId, setSelectedOutletId] = useState<string>('')
  const [portionSize, setPortionSize] = useState<string>('1')
  const [portionUnit, setPortionUnit] = useState<string>('serving')
  const [unitPrice, setUnitPrice] = useState<string>('')

  // Edit Mapping Dialog state
  const [showEditMappingDialog, setShowEditMappingDialog] = useState(false)
  const [editingMapping, setEditingMapping] = useState<POSMapping | null>(null)
  const [editRecipe, setEditRecipe] = useState<string>('')
  const [editOutletId, setEditOutletId] = useState<string>('')
  const [editPortionSize, setEditPortionSize] = useState<string>('1')
  const [editPortionUnit, setEditPortionUnit] = useState<string>('serving')
  const [editUnitPrice, setEditUnitPrice] = useState<string>('')

  // Location Mapping Dialog state
  const [showLocationDialog, setShowLocationDialog] = useState(false)
  const [editingLocation, setEditingLocation] = useState<POSLocationMapping | null>(null)
  const [selectedOutlet, setSelectedOutlet] = useState<string>('')

  // Fractional Variant Dialog state
  const [showVariantDialog, setShowVariantDialog] = useState(false)
  const [editingVariant, setEditingVariant] = useState<FractionalVariant | null>(null)
  const [variantBaseRecipe, setVariantBaseRecipe] = useState<string>('')
  const [variantTotalYield, setVariantTotalYield] = useState<string>('')
  const [variantYieldUnit, setVariantYieldUnit] = useState<string>('slice')
  const [variantRoundingRule, setVariantRoundingRule] = useState<string>('round_down')

  // Add Variant Item Dialog state
  const [showAddVariantItemDialog, setShowAddVariantItemDialog] = useState(false)
  const [variantItemPosId, setVariantItemPosId] = useState<string>('')
  const [variantItemPosName, setVariantItemPosName] = useState<string>('')
  const [variantItemUnit, setVariantItemUnit] = useState<string>('')
  const [variantItemDeduction, setVariantItemDeduction] = useState<string>('')
  const [variantItemPrice, setVariantItemPrice] = useState<string>('')
  const [parentVariantId, setParentVariantId] = useState<string>('')

  // Statistics
  const stats = useMemo(() => ({
    totalMapped: mappings.filter(m => m.isActive).length,
    totalUnmapped: unmappedItems.length,
    mappedLocations: locationMappings.filter(l => l.posOutletId).length,
    unmappedLocations: locationMappings.filter(l => !l.posOutletId).length,
    totalFractional: fractionalVariants.length,
    activeFractional: fractionalVariants.filter(v => v.isActive).length
  }), [mappings, unmappedItems, locationMappings, fractionalVariants])

  // Filtered data
  const filteredMappings = useMemo(() => {
    return mappings.filter(mapping => {
      const matchesSearch = searchQuery === '' ||
        mapping.posItemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mapping.recipeName.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = categoryFilter === 'all' || mapping.posItemCategory === categoryFilter
      const matchesOutlet = outletFilter === 'all' || mapping.posOutletId === outletFilter
      return matchesSearch && matchesCategory && matchesOutlet
    })
  }, [mappings, searchQuery, categoryFilter, outletFilter])

  const filteredLocations = useMemo(() => {
    return locationMappings.filter(location => {
      return searchQuery === '' ||
        location.locationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        location.locationCode.toLowerCase().includes(searchQuery.toLowerCase())
    })
  }, [locationMappings, searchQuery])

  const filteredVariants = useMemo(() => {
    return fractionalVariants.filter(variant => {
      return searchQuery === '' ||
        variant.baseRecipeName.toLowerCase().includes(searchQuery.toLowerCase())
    })
  }, [fractionalVariants, searchQuery])

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(mappings.map(m => m.posItemCategory))
    return Array.from(cats).sort()
  }, [mappings])

  const handleCreateMapping = () => {
    if (!selectedUnmappedItem || !selectedRecipe || !selectedOutletId) return

    const recipe = recipeSearchResults.find(r => r.id === selectedRecipe)
    const outlet = mappedOutlets.find(o => o.id === selectedOutletId)
    if (!recipe || !outlet) return

    onCreateMapping({
      posItemId: selectedUnmappedItem.posItemId,
      posItemName: selectedUnmappedItem.name,
      posItemCategory: selectedUnmappedItem.category,
      posOutletId: outlet.id,
      posOutletName: outlet.name,
      locationId: outlet.locationId,
      locationName: outlet.locationName,
      recipeId: recipe.id,
      recipeName: recipe.name,
      recipeCategory: recipe.category,
      portionSize: parseFloat(portionSize),
      unit: portionUnit,
      unitPrice: {
        amount: parseFloat(unitPrice) || selectedUnmappedItem.price.amount,
        currency: 'USD'
      },
      isActive: true
    })

    setShowMappingDialog(false)
    setSelectedUnmappedItem(null)
    setSelectedRecipe('')
    setSelectedOutletId('')
    setPortionSize('1')
    setPortionUnit('serving')
    setUnitPrice('')
  }

  // Open Edit Mapping Dialog
  const handleOpenEditMapping = (mapping: POSMapping) => {
    setEditingMapping(mapping)
    setEditRecipe(mapping.recipeId)
    setEditOutletId(mapping.posOutletId)
    setEditPortionSize(mapping.portionSize.toString())
    setEditPortionUnit(mapping.unit)
    setEditUnitPrice(mapping.unitPrice?.amount?.toString() || '')
    setShowEditMappingDialog(true)
  }

  // Save Edit Mapping
  const handleSaveEditMapping = () => {
    if (!editingMapping || !editRecipe || !editOutletId) return

    const recipe = recipeSearchResults.find(r => r.id === editRecipe)
    const outlet = mappedOutlets.find(o => o.id === editOutletId)
    if (!recipe || !outlet) return

    onUpdateMapping(editingMapping.id, {
      recipeId: recipe.id,
      recipeName: recipe.name,
      recipeCategory: recipe.category,
      posOutletId: outlet.id,
      posOutletName: outlet.name,
      locationId: outlet.locationId,
      locationName: outlet.locationName,
      portionSize: parseFloat(editPortionSize),
      unit: editPortionUnit,
      unitPrice: {
        amount: parseFloat(editUnitPrice) || editingMapping.unitPrice?.amount || 0,
        currency: 'USD'
      }
    })

    setShowEditMappingDialog(false)
    setEditingMapping(null)
    setEditRecipe('')
    setEditOutletId('')
    setEditPortionSize('1')
    setEditPortionUnit('serving')
    setEditUnitPrice('')
  }

  // Open Location Mapping Dialog
  const handleOpenLocationMapping = (location: POSLocationMapping) => {
    setEditingLocation(location)
    setSelectedOutlet(location.posOutletId || '')
    setShowLocationDialog(true)
  }

  // Save Location Mapping
  const handleSaveLocationMapping = () => {
    if (!editingLocation) return
    // In a real app, this would call an API to save the location mapping
    // For now, we'll just close the dialog
    setShowLocationDialog(false)
    setEditingLocation(null)
    setSelectedOutlet('')
  }

  // Open Add/Edit Variant Dialog
  const handleOpenVariantDialog = (variant?: FractionalVariant) => {
    if (variant) {
      setEditingVariant(variant)
      setVariantBaseRecipe(variant.baseRecipeId)
      setVariantTotalYield(variant.totalYield.toString())
      setVariantYieldUnit(variant.yieldUnit)
      setVariantRoundingRule(variant.roundingRule)
    } else {
      setEditingVariant(null)
      setVariantBaseRecipe('')
      setVariantTotalYield('')
      setVariantYieldUnit('slice')
      setVariantRoundingRule('round_down')
    }
    setShowVariantDialog(true)
  }

  // Save Variant
  const handleSaveVariant = () => {
    // In a real app, this would call an API to save the variant
    setShowVariantDialog(false)
    setEditingVariant(null)
    setVariantBaseRecipe('')
    setVariantTotalYield('')
    setVariantYieldUnit('slice')
    setVariantRoundingRule('round_down')
  }

  // Open Add Variant Item Dialog
  const handleOpenAddVariantItem = (variantId: string) => {
    setParentVariantId(variantId)
    setVariantItemPosId('')
    setVariantItemPosName('')
    setVariantItemUnit('')
    setVariantItemDeduction('')
    setVariantItemPrice('')
    setShowAddVariantItemDialog(true)
  }

  // Save Variant Item
  const handleSaveVariantItem = () => {
    // In a real app, this would call an API to add the variant item
    setShowAddVariantItemDialog(false)
    setParentVariantId('')
    setVariantItemPosId('')
    setVariantItemPosName('')
    setVariantItemUnit('')
    setVariantItemDeduction('')
    setVariantItemPrice('')
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mapped Items</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.totalMapped}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Unmapped Items</CardDescription>
            <CardTitle className="text-2xl text-amber-600">{stats.totalUnmapped}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Mapped Locations</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats.mappedLocations}/{locationMappings.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Fractional Variants</CardDescription>
            <CardTitle className="text-2xl text-purple-600">{stats.activeFractional}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Sub-tabs */}
      <Tabs value={subTab} onValueChange={(v) => setSubTab(v as typeof subTab)}>
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="recipe" className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              Recipe Mapping
            </TabsTrigger>
            <TabsTrigger value="location" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Location Mapping
            </TabsTrigger>
            <TabsTrigger value="fractional" className="flex items-center gap-2">
              <Slice className="h-4 w-4" />
              Fractional Variants
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onSyncPOSItems}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sync POS Items
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex items-center gap-4 mb-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {subTab === 'recipe' && (
            <>
              <Select value={outletFilter} onValueChange={setOutletFilter}>
                <SelectTrigger className="w-[200px]">
                  <MapPin className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Outlets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Outlets</SelectItem>
                  {mappedOutlets.map(outlet => (
                    <SelectItem key={outlet.id} value={outlet.id}>{outlet.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        {/* Recipe Mapping Tab */}
        <TabsContent value="recipe" className="space-y-6">
          {/* Unmapped Items Alert */}
          {unmappedItems.length > 0 && (
            <Card className="border-amber-200 bg-amber-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link2Off className="h-5 w-5 text-amber-600" />
                  Unmapped POS Items ({unmappedItems.length})
                </CardTitle>
                <CardDescription>These items need to be mapped to recipes for inventory deduction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {unmappedItems.map(item => (
                    <Badge
                      key={item.id}
                      variant="outline"
                      className="cursor-pointer hover:bg-amber-100"
                      onClick={() => {
                        setSelectedUnmappedItem(item)
                        setShowMappingDialog(true)
                      }}
                    >
                      {item.name}
                      <Plus className="h-3 w-3 ml-1" />
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Mappings Table */}
          <Card>
            <CardHeader>
              <CardTitle>POS Item to Recipe Mappings</CardTitle>
              <CardDescription>
                Configure how POS items map to recipes for stock deduction.
                <span className="text-muted-foreground"> Same item can have different prices per outlet.</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>POS Item</TableHead>
                    <TableHead>Outlet / Location</TableHead>
                    <TableHead>Recipe</TableHead>
                    <TableHead>Portion</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMappings.map(mapping => (
                    <TableRow key={mapping.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{mapping.posItemName}</p>
                          <p className="text-xs text-muted-foreground">{mapping.posItemCategory}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <div>
                            <p className="text-sm">{mapping.locationName}</p>
                            <p className="text-xs text-muted-foreground">{mapping.posOutletName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm">{mapping.recipeName}</p>
                          <p className="text-xs text-muted-foreground">{mapping.recipeCategory}</p>
                        </div>
                      </TableCell>
                      <TableCell>{mapping.portionSize} {mapping.unit}</TableCell>
                      <TableCell className="text-right font-medium tabular-nums">
                        {mapping.unitPrice ? formatCurrency(mapping.unitPrice.amount) : '-'}
                      </TableCell>
                      <TableCell>
                        {mapping.isActive ? (
                          <Badge className="bg-green-100 text-green-800">Active</Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenEditMapping(mapping)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Mapping
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onUpdateMapping(mapping.id, { lastVerifiedAt: new Date().toISOString() })}
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Verify Mapping
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onUpdateMapping(mapping.id, { isActive: !mapping.isActive })}
                            >
                              {mapping.isActive ? (
                                <>
                                  <XCircle className="h-4 w-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => onDeleteMapping(mapping.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
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
        </TabsContent>

        {/* Location Mapping Tab */}
        <TabsContent value="location" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Location to POS Outlet Mapping</CardTitle>
              <CardDescription>Link Carmen locations to POS system outlets for transaction routing</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>POS Outlet</TableHead>
                    <TableHead>Sync Status</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLocations.map(location => (
                    <TableRow key={location.id}>
                      <TableCell className="font-medium">{location.locationName}</TableCell>
                      <TableCell>
                        <code className="text-sm bg-muted px-1 py-0.5 rounded">{location.locationCode}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {location.locationType.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {location.posOutletName ? (
                          <span className="flex items-center gap-2">
                            <Link2 className="h-4 w-4 text-green-600" />
                            {location.posOutletName}
                          </span>
                        ) : (
                          <span className="flex items-center gap-2 text-muted-foreground">
                            <Link2Off className="h-4 w-4" />
                            Not mapped
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={
                          location.syncStatus === 'synced' ? 'bg-green-100 text-green-800' :
                          location.syncStatus === 'error' ? 'bg-red-100 text-red-800' :
                          location.syncStatus === 'pending' ? 'bg-amber-100 text-amber-800' :
                          'bg-gray-100 text-gray-800'
                        }>
                          {location.syncStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatNumber(location.transactionCount)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenLocationMapping(location)}>
                              <Link2 className="h-4 w-4 mr-2" />
                              {location.posOutletId ? 'Change Mapping' : 'Map to Outlet'}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RefreshCw className="h-4 w-4 mr-2" />
                              Test Connection
                            </DropdownMenuItem>
                            {location.posOutletId && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  className="text-red-600"
                                  onClick={() => handleOpenLocationMapping({ ...location, posOutletId: null, posOutletName: null })}
                                >
                                  <Link2Off className="h-4 w-4 mr-2" />
                                  Remove Mapping
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Fractional Variants Tab */}
        <TabsContent value="fractional" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Fractional Variants</h3>
              <p className="text-sm text-muted-foreground">Configure fractional sales mapping (slices, glasses, portions)</p>
            </div>
            <Button onClick={() => handleOpenVariantDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Variant
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredVariants.map(variant => (
              <Card key={variant.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{variant.baseRecipeName}</CardTitle>
                    <Badge className={variant.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                      {variant.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <CardDescription>
                    Total yield: {variant.totalYield} {variant.yieldUnit} • Rounding: {variant.roundingRule}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {variant.variants.map((v, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{v.posItemName}</p>
                          <p className="text-xs text-muted-foreground">
                            {v.fractionalUnit} = {(v.deductionAmount * 100).toFixed(1)}% deduction
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${formatNumber(v.price.amount)}</p>
                          <code className="text-xs text-muted-foreground">{v.posItemId}</code>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 flex justify-end gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleOpenVariantDialog(variant)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleOpenAddVariantItem(variant.id)}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Variant
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Mapping Dialog */}
      <Dialog open={showMappingDialog} onOpenChange={setShowMappingDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Create Recipe Mapping</DialogTitle>
            <DialogDescription>
              Map POS item to a recipe for automatic inventory deduction at a specific outlet
            </DialogDescription>
          </DialogHeader>

          {selectedUnmappedItem && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">POS Item</p>
                <p className="font-medium">{selectedUnmappedItem.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedUnmappedItem.category} • Default price: {formatCurrency(selectedUnmappedItem.price.amount)}
                </p>
              </div>

              <div className="space-y-2">
                <Label>POS Outlet <span className="text-red-500">*</span></Label>
                <Select value={selectedOutletId} onValueChange={setSelectedOutletId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select outlet..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mappedOutlets.map(outlet => (
                      <SelectItem key={outlet.id} value={outlet.id}>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{outlet.name}</span>
                          <span className="text-muted-foreground">→ {outlet.locationName}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Same item can be mapped to multiple outlets with different prices
                </p>
              </div>

              <div className="space-y-2">
                <Label>Select Recipe <span className="text-red-500">*</span></Label>
                <Select value={selectedRecipe} onValueChange={setSelectedRecipe}>
                  <SelectTrigger>
                    <SelectValue placeholder="Search and select recipe..." />
                  </SelectTrigger>
                  <SelectContent>
                    {recipeSearchResults.map(recipe => (
                      <SelectItem key={recipe.id} value={recipe.id}>
                        {recipe.name} ({recipe.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Portion Size</Label>
                  <Input
                    type="number"
                    value={portionSize}
                    onChange={(e) => setPortionSize(e.target.value)}
                    min="0.1"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={portionUnit} onValueChange={setPortionUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serving">Serving</SelectItem>
                      <SelectItem value="whole">Whole</SelectItem>
                      <SelectItem value="slice">Slice</SelectItem>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="g">Grams (g)</SelectItem>
                      <SelectItem value="ml">Milliliters (ml)</SelectItem>
                      <SelectItem value="can">Can</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Price at Outlet</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      type="number"
                      value={unitPrice}
                      onChange={(e) => setUnitPrice(e.target.value)}
                      placeholder={selectedUnmappedItem.price.amount.toString()}
                      min="0"
                      step="0.01"
                      className="pl-7"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMappingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateMapping} disabled={!selectedRecipe || !selectedOutletId}>
              Create Mapping
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Mapping Dialog */}
      <Dialog open={showEditMappingDialog} onOpenChange={setShowEditMappingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Recipe Mapping</DialogTitle>
            <DialogDescription>
              Update the mapping configuration for this POS item
            </DialogDescription>
          </DialogHeader>

          {editingMapping && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">POS Item</p>
                <p className="font-medium">{editingMapping.posItemName}</p>
                <p className="text-sm text-muted-foreground">
                  {editingMapping.posItemCategory}
                </p>
              </div>

              <div className="space-y-2">
                <Label>POS Outlet <span className="text-destructive">*</span></Label>
                <Select value={editOutletId} onValueChange={setEditOutletId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select POS outlet..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mappedOutlets.map(outlet => (
                      <SelectItem key={outlet.id} value={outlet.id}>
                        {outlet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {editOutletId && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    Maps to: {mappedOutlets.find(o => o.id === editOutletId)?.locationName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Select Recipe <span className="text-destructive">*</span></Label>
                <Select value={editRecipe} onValueChange={setEditRecipe}>
                  <SelectTrigger>
                    <SelectValue placeholder="Search and select recipe..." />
                  </SelectTrigger>
                  <SelectContent>
                    {recipeSearchResults.map(recipe => (
                      <SelectItem key={recipe.id} value={recipe.id}>
                        {recipe.name} ({recipe.category})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Unit Price <span className="text-destructive">*</span></Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={editUnitPrice}
                    onChange={(e) => setEditUnitPrice(e.target.value)}
                    className="pl-9"
                    min="0"
                    step="0.01"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Price at this specific outlet
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Portion Size</Label>
                  <Input
                    type="number"
                    value={editPortionSize}
                    onChange={(e) => setEditPortionSize(e.target.value)}
                    min="0.1"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit</Label>
                  <Select value={editPortionUnit} onValueChange={setEditPortionUnit}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="serving">Serving</SelectItem>
                      <SelectItem value="whole">Whole</SelectItem>
                      <SelectItem value="slice">Slice</SelectItem>
                      <SelectItem value="piece">Piece</SelectItem>
                      <SelectItem value="g">Grams (g)</SelectItem>
                      <SelectItem value="ml">Milliliters (ml)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditMappingDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEditMapping} disabled={!editRecipe || !editOutletId || !editUnitPrice}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Location Mapping Dialog */}
      <Dialog open={showLocationDialog} onOpenChange={setShowLocationDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingLocation?.posOutletId ? 'Change Location Mapping' : 'Map Location to POS Outlet'}
            </DialogTitle>
            <DialogDescription>
              Link this Carmen location to a POS system outlet for transaction routing
            </DialogDescription>
          </DialogHeader>

          {editingLocation && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground">Carmen Location</p>
                <p className="font-medium">{editingLocation.locationName}</p>
                <p className="text-sm text-muted-foreground">
                  {editingLocation.locationCode} • {editingLocation.locationType.replace('_', ' ')}
                </p>
              </div>

              <div className="space-y-2">
                <Label>Select POS Outlet</Label>
                <Select value={selectedOutlet} onValueChange={setSelectedOutlet}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a POS outlet..." />
                  </SelectTrigger>
                  <SelectContent>
                    {mappedOutlets.map(outlet => (
                      <SelectItem key={outlet.id} value={outlet.id}>
                        {outlet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {editingLocation.posOutletId && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm text-amber-800">
                    <strong>Currently mapped to:</strong> {editingLocation.posOutletName}
                  </p>
                  <p className="text-xs text-amber-600 mt-1">
                    Changing this will affect how transactions are routed for this location.
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowLocationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveLocationMapping} disabled={!selectedOutlet}>
              {editingLocation?.posOutletId ? 'Update Mapping' : 'Create Mapping'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Fractional Variant Dialog */}
      <Dialog open={showVariantDialog} onOpenChange={setShowVariantDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingVariant ? 'Edit Fractional Variant' : 'Create Fractional Variant'}
            </DialogTitle>
            <DialogDescription>
              Configure how fractional sales (slices, glasses, portions) map to recipe inventory deductions
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Base Recipe</Label>
              <Select value={variantBaseRecipe} onValueChange={setVariantBaseRecipe}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a recipe..." />
                </SelectTrigger>
                <SelectContent>
                  {recipeSearchResults.map(recipe => (
                    <SelectItem key={recipe.id} value={recipe.id}>
                      {recipe.name} ({recipe.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Total Yield</Label>
                <Input
                  type="number"
                  value={variantTotalYield}
                  onChange={(e) => setVariantTotalYield(e.target.value)}
                  placeholder="e.g., 8"
                  min="1"
                />
                <p className="text-xs text-muted-foreground">
                  How many portions does one recipe yield?
                </p>
              </div>
              <div className="space-y-2">
                <Label>Yield Unit</Label>
                <Select value={variantYieldUnit} onValueChange={setVariantYieldUnit}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="slice">Slice</SelectItem>
                    <SelectItem value="piece">Piece</SelectItem>
                    <SelectItem value="glass">Glass</SelectItem>
                    <SelectItem value="portion">Portion</SelectItem>
                    <SelectItem value="serving">Serving</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Rounding Rule</Label>
              <Select value={variantRoundingRule} onValueChange={setVariantRoundingRule}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round_down">Round Down (Conservative)</SelectItem>
                  <SelectItem value="round_up">Round Up</SelectItem>
                  <SelectItem value="round_nearest">Round to Nearest</SelectItem>
                  <SelectItem value="exact">Exact (No Rounding)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How to handle fractional deductions that don&apos;t divide evenly
              </p>
            </div>

            {editingVariant && editingVariant.variants.length > 0 && (
              <div className="space-y-2">
                <Label>Current Variant Items</Label>
                <div className="border rounded-lg divide-y">
                  {editingVariant.variants.map((v, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3">
                      <div>
                        <p className="font-medium text-sm">{v.posItemName}</p>
                        <p className="text-xs text-muted-foreground">
                          {v.fractionalUnit} = {(v.deductionAmount * 100).toFixed(1)}% deduction
                        </p>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-600 h-8">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVariantDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveVariant} disabled={!variantBaseRecipe || !variantTotalYield}>
              {editingVariant ? 'Save Changes' : 'Create Variant'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Variant Item Dialog */}
      <Dialog open={showAddVariantItemDialog} onOpenChange={setShowAddVariantItemDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Variant Item</DialogTitle>
            <DialogDescription>
              Add a new POS item variant to this fractional configuration
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>POS Item ID</Label>
                <Input
                  value={variantItemPosId}
                  onChange={(e) => setVariantItemPosId(e.target.value)}
                  placeholder="e.g., POS-001"
                />
              </div>
              <div className="space-y-2">
                <Label>POS Item Name</Label>
                <Input
                  value={variantItemPosName}
                  onChange={(e) => setVariantItemPosName(e.target.value)}
                  placeholder="e.g., Pizza Slice"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Fractional Unit</Label>
              <Input
                value={variantItemUnit}
                onChange={(e) => setVariantItemUnit(e.target.value)}
                placeholder="e.g., 1 slice, half portion"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Deduction Amount</Label>
                <div className="relative">
                  <Input
                    type="number"
                    value={variantItemDeduction}
                    onChange={(e) => setVariantItemDeduction(e.target.value)}
                    placeholder="e.g., 12.5"
                    min="0"
                    max="100"
                    step="0.1"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Percentage of recipe to deduct per sale
                </p>
              </div>
              <div className="space-y-2">
                <Label>Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={variantItemPrice}
                    onChange={(e) => setVariantItemPrice(e.target.value)}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                    className="pl-7"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddVariantItemDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveVariantItem}
              disabled={!variantItemPosId || !variantItemPosName || !variantItemDeduction}
            >
              Add Variant Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
