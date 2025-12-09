"use client"

import { useState, useEffect, useMemo } from "react"
import { useUser } from '@/lib/context/simple-user-context'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import {
  ArrowUpDown,
  Download,
  FileDown,
  Filter,
  Search,
  SlidersHorizontal,
  MapPin,
  List,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Plus,
  RefreshCw,
  Package,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  Grid3X3,
  Eye,
  ArrowRight,
  Activity
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { formatCurrency, formatNumber } from '@/lib/utils/formatters'
import { GroupedTable, useGroupedTable } from '@/components/inventory/GroupedTable'
import { ExportButton } from '@/components/inventory/ExportButton'
import { createExportData, ExportColumn } from '@/lib/utils/export-utils'

// Mock product data for the stock card list
interface Product {
  id: string
  code: string
  name: string
  category: string
  unit: string
  status: "Active" | "Inactive"
  currentStock: number
  minimumStock: number
  maximumStock: number
  value: number
  averageCost: number
  lastMovementDate: string
  locationCount: number
  locations: {
    id: string
    name: string
    stock: number
    value: number
  }[]
}

// Generate mock data
const generateMockProducts = (): Product[] => {
  const products: Product[] = []

  // Define meaningful product data matching the detail page
  const productTemplates = [
    { id: "prod1", code: "P-1001", name: "Fresh Tomatoes", category: "Produce", unit: "kg" },
    { id: "prod2", code: "P-1002", name: "Onions", category: "Produce", unit: "kg" },
    { id: "prod3", code: "M-2001", name: "Chicken Breast", category: "Meat", unit: "kg" },
    { id: "prod4", code: "DG-4001", name: "Rice", category: "Dry Goods", unit: "kg" },
    { id: "prod5", code: "B-3001", name: "Whole Wheat Bread", category: "Bakery", unit: "loaves" },
    { id: "prod6", code: "D-5001", name: "Fresh Milk", category: "Dairy", unit: "liters" },
    { id: "prod7", code: "P-1003", name: "Bell Peppers", category: "Produce", unit: "kg" },
    { id: "prod8", code: "M-2002", name: "Ground Beef", category: "Meat", unit: "kg" },
    { id: "prod9", code: "C-6001", name: "Olive Oil", category: "Condiments", unit: "liters" },
    { id: "prod10", code: "DG-4002", name: "Pasta", category: "Dry Goods", unit: "kg" },
    { id: "prod11", code: "P-1004", name: "Carrots", category: "Produce", unit: "kg" },
    { id: "prod12", code: "D-5002", name: "Cheddar Cheese", category: "Dairy", unit: "kg" },
    { id: "prod13", code: "M-2003", name: "Salmon Fillet", category: "Meat", unit: "kg" },
    { id: "prod14", code: "BV-7001", name: "Orange Juice", category: "Beverages", unit: "liters" },
    { id: "prod15", code: "P-1005", name: "Potatoes", category: "Produce", unit: "kg" },
    { id: "prod16", code: "C-6002", name: "Black Pepper", category: "Condiments", unit: "kg" },
    { id: "prod17", code: "DG-4003", name: "Flour", category: "Dry Goods", unit: "kg" },
    { id: "prod18", code: "D-5003", name: "Greek Yogurt", category: "Dairy", unit: "kg" },
    { id: "prod19", code: "M-2004", name: "Pork Chops", category: "Meat", unit: "kg" },
    { id: "prod20", code: "P-1006", name: "Fresh Herbs Mix", category: "Produce", unit: "kg" },
    { id: "prod21", code: "BV-7002", name: "Sparkling Water", category: "Beverages", unit: "liters" },
    { id: "prod22", code: "C-6003", name: "Sea Salt", category: "Condiments", unit: "kg" },
    { id: "prod23", code: "B-3002", name: "Croissants", category: "Bakery", unit: "pieces" },
    { id: "prod24", code: "M-2005", name: "Shrimp", category: "Meat", unit: "kg" },
    { id: "prod25", code: "P-1007", name: "Mushrooms", category: "Produce", unit: "kg" },
    { id: "prod26", code: "D-5004", name: "Butter", category: "Dairy", unit: "kg" },
    { id: "prod27", code: "DG-4004", name: "Quinoa", category: "Dry Goods", unit: "kg" },
    { id: "prod28", code: "C-6004", name: "Balsamic Vinegar", category: "Condiments", unit: "liters" },
    { id: "prod29", code: "BV-7003", name: "Red Wine", category: "Beverages", unit: "liters" },
    { id: "prod30", code: "P-1008", name: "Spinach", category: "Produce", unit: "kg" },
    { id: "prod31", code: "M-2006", name: "Turkey Breast", category: "Meat", unit: "kg" },
    { id: "prod32", code: "B-3003", name: "Bagels", category: "Bakery", unit: "pieces" },
    { id: "prod33", code: "D-5005", name: "Cream", category: "Dairy", unit: "liters" },
    { id: "prod34", code: "DG-4005", name: "Lentils", category: "Dry Goods", unit: "kg" },
    { id: "prod35", code: "C-6005", name: "Paprika", category: "Condiments", unit: "kg" },
    { id: "prod36", code: "P-1009", name: "Broccoli", category: "Produce", unit: "kg" },
    { id: "prod37", code: "BV-7004", name: "Coffee Beans", category: "Beverages", unit: "kg" },
    { id: "prod38", code: "M-2007", name: "Lamb Chops", category: "Meat", unit: "kg" },
    { id: "prod39", code: "D-5006", name: "Mozzarella", category: "Dairy", unit: "kg" },
    { id: "prod40", code: "DG-4006", name: "Oats", category: "Dry Goods", unit: "kg" },
    { id: "prod41", code: "P-1010", name: "Cucumbers", category: "Produce", unit: "kg" },
    { id: "prod42", code: "C-6006", name: "Garlic Powder", category: "Condiments", unit: "kg" },
    { id: "prod43", code: "B-3004", name: "Dinner Rolls", category: "Bakery", unit: "pieces" },
    { id: "prod44", code: "BV-7005", name: "Tea Leaves", category: "Beverages", unit: "kg" },
    { id: "prod45", code: "M-2008", name: "Duck Breast", category: "Meat", unit: "kg" },
    { id: "prod46", code: "P-1011", name: "Zucchini", category: "Produce", unit: "kg" },
    { id: "prod47", code: "D-5007", name: "Parmesan", category: "Dairy", unit: "kg" },
    { id: "prod48", code: "DG-4007", name: "Barley", category: "Dry Goods", unit: "kg" },
    { id: "prod49", code: "C-6007", name: "Rosemary", category: "Condiments", unit: "kg" },
    { id: "prod50", code: "BV-7006", name: "Apple Juice", category: "Beverages", unit: "liters" }
  ]

  const statuses: ("Active" | "Inactive")[] = ["Active", "Active", "Active", "Active", "Inactive"]

  const mockLocations = [
    { id: 'loc-001', name: 'Main Hotel' },
    { id: 'loc-002', name: 'Restaurant Kitchen' },
    { id: 'loc-003', name: 'Pool Bar' },
    { id: 'loc-004', name: 'Conference Center' },
    { id: 'loc-005', name: 'Spa & Wellness' },
    { id: 'loc-006', name: 'Beach Club' }
  ]

  productTemplates.forEach((template, index) => {
    const status = statuses[index % statuses.length]
    const averageCost = Math.random() * 100 + 5

    // Generate location-specific stock
    const locationCount = Math.floor(Math.random() * 5) + 1
    const selectedLocations = mockLocations
      .sort(() => 0.5 - Math.random())
      .slice(0, locationCount)

    const locations = selectedLocations.map(loc => {
      const stock = Math.floor(Math.random() * 200)
      return {
        id: loc.id,
        name: loc.name,
        stock,
        value: stock * averageCost
      }
    })

    const currentStock = locations.reduce((sum, loc) => sum + loc.stock, 0)
    const minimumStock = Math.floor(Math.random() * 100)
    const maximumStock = minimumStock + Math.floor(Math.random() * 500)
    const value = currentStock * averageCost

    // Generate a random date within the last 30 days
    const now = new Date()
    const randomDays = Math.floor(Math.random() * 30)
    const lastMovementDate = new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0]

    products.push({
      id: template.id,
      code: template.code,
      name: template.name,
      category: template.category,
      unit: template.unit,
      status,
      currentStock,
      minimumStock,
      maximumStock,
      value,
      averageCost,
      lastMovementDate,
      locationCount,
      locations
    })
  })

  return products
}

export default function StockCardListPage() {
  const router = useRouter()
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [stockFilter, setStockFilter] = useState("all")
  const [locationFilter, setLocationFilter] = useState("all")
  const [sortField, setSortField] = useState("name")
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc")
  const [viewMode, setViewMode] = useState<"list" | "grouped" | "cards">("list")
  const [groupedProducts, setGroupedProducts] = useState<Array<{
    locationId: string
    locationName: string
    items: Product[]
    subtotals: Record<string, number>
    isExpanded: boolean
  }>>([])

  const {
    groups,
    setGroups,
    toggleGroup,
    expandAll,
    collapseAll,
    calculateGrandTotals
  } = useGroupedTable(groupedProducts)

  // Export columns configuration
  const exportColumns: ExportColumn[] = [
    { key: 'code', label: 'Product Code', type: 'text' },
    { key: 'name', label: 'Product Name', type: 'text' },
    { key: 'category', label: 'Category', type: 'text' },
    { key: 'unit', label: 'Unit', type: 'text' },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'currentStock', label: 'Current Stock', type: 'number' },
    { key: 'value', label: 'Value', type: 'currency' },
    { key: 'averageCost', label: 'Average Cost', type: 'currency' },
    { key: 'minimumStock', label: 'Min Stock', type: 'number' },
    { key: 'maximumStock', label: 'Max Stock', type: 'number' },
    { key: 'lastMovementDate', label: 'Last Movement', type: 'date' },
    { key: 'locationCount', label: 'Location Count', type: 'number' }
  ]
  
  // Function to group products by location
  const groupProductsByLocation = (products: Product[]) => {
    const locationMap = new Map<string, Product[]>()

    products.forEach(product => {
      product.locations.forEach(location => {
        if (!locationMap.has(location.id)) {
          locationMap.set(location.id, [])
        }

        // Create a product entry for each location it exists in
        const locationProduct: Product = {
          ...product,
          currentStock: location.stock,
          value: location.value,
          averageCost: location.value / location.stock || 0,
          locationCount: 1,
          locations: [location]
        }

        locationMap.get(location.id)!.push(locationProduct)
      })
    })

    const groups = Array.from(locationMap.entries()).map(([locationId, locationProducts]) => {
      const subtotals = {
        totalItems: locationProducts.length,
        currentStock: locationProducts.reduce((sum, p) => sum + p.currentStock, 0),
        value: locationProducts.reduce((sum, p) => sum + p.value, 0),
        averageValue: locationProducts.reduce((sum, p) => sum + p.value, 0) / locationProducts.length || 0
      }

      return {
        locationId,
        locationName: locationProducts[0].locations[0].name,
        items: locationProducts.sort((a, b) => a.name.localeCompare(b.name)),
        subtotals,
        isExpanded: false
      }
    })

    return groups.sort((a, b) => a.locationName.localeCompare(b.locationName))
  }

  // Load mock data
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      const data = generateMockProducts()
      setProducts(data)

      // Also generate grouped data
      const grouped = groupProductsByLocation(data)
      setGroupedProducts(grouped)
      setGroups(grouped)

      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [setGroups])

  // Update grouped data when filters change
  useEffect(() => {
    if (products.length > 0) {
      const filtered = getFilteredProducts()
      const grouped = groupProductsByLocation(filtered)
      setGroupedProducts(grouped)
      setGroups(grouped)
    }
  }, [searchTerm, categoryFilter, statusFilter, stockFilter, locationFilter, user, products, setGroups])

  // Filter products based on user permissions and location access
  const getFilteredProducts = () => {
    let filteredProducts = products

    // Filter by user's accessible locations if not admin
    if (user?.role !== 'System Administrator' && user?.availableLocations) {
      const userLocationIds = user.availableLocations.map(l => l.id)
      filteredProducts = filteredProducts.filter(product =>
        product.locations.some(loc => userLocationIds.includes(loc.id))
      )
    }

    return filteredProducts.filter(product => {
      // Search filter
      if (searchTerm && !product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !product.code.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }

      // Category filter
      if (categoryFilter !== "all" && product.category !== categoryFilter) {
        return false
      }

      // Status filter
      if (statusFilter !== "all" && product.status !== statusFilter) {
        return false
      }

      // Location filter
      if (locationFilter !== "all") {
        if (!product.locations.some(loc => loc.id === locationFilter)) {
          return false
        }
      }

      // Stock level filter
      if (stockFilter === "low" && product.currentStock > product.minimumStock) {
        return false
      }
      if (stockFilter === "high" && product.currentStock < product.maximumStock) {
        return false
      }
      if (stockFilter === "normal" && (product.currentStock <= product.minimumStock || product.currentStock >= product.maximumStock)) {
        return false
      }

      return true
    })
  }

  const filteredProducts = useMemo(() =>
    getFilteredProducts().sort((a, b) => {
      // Sort by selected field
      let comparison = 0
      
      switch (sortField) {
        case "code":
          comparison = a.code.localeCompare(b.code)
          break
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "category":
          comparison = a.category.localeCompare(b.category)
          break
        case "stock":
          comparison = a.currentStock - b.currentStock
          break
        case "value":
          comparison = a.value - b.value
          break
        default:
          comparison = a.name.localeCompare(b.name)
      }
      
      return sortDirection === "asc" ? comparison : -comparison
    }), [products, searchTerm, categoryFilter, statusFilter, stockFilter, locationFilter, sortField, sortDirection, user])
  
  // Get unique categories for filter
  const categories = Array.from(new Set(products.map(p => p.category)))
  
  // Handle sort change
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }
  
  // Handle row click to navigate to stock card
  const handleRowClick = (productId: string) => {
    router.push(`/inventory-management/stock-overview/stock-card?productId=${productId}`)
  }
  
  // Render stock level badge
  const renderStockLevelBadge = (product: Product) => {
    if (product.currentStock <= product.minimumStock) {
      return <Badge variant="destructive">Low</Badge>
    } else if (product.currentStock >= product.maximumStock) {
      return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100">High</Badge>
    } else {
      return <Badge variant="outline" className="bg-green-100 text-green-800">Normal</Badge>
    }
  }

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalProducts = filteredProducts.length
    const activeProducts = filteredProducts.filter(p => p.status === 'Active').length
    const totalValue = filteredProducts.reduce((sum, p) => sum + p.value, 0)
    const totalStock = filteredProducts.reduce((sum, p) => sum + p.currentStock, 0)
    const lowStockProducts = filteredProducts.filter(p => p.currentStock <= p.minimumStock).length
    const highStockProducts = filteredProducts.filter(p => p.currentStock >= p.maximumStock).length
    const normalStockProducts = filteredProducts.filter(p => p.currentStock > p.minimumStock && p.currentStock < p.maximumStock).length
    const avgValue = totalProducts > 0 ? totalValue / totalProducts : 0

    // Category breakdown
    const categoryStats = Array.from(new Set(filteredProducts.map(p => p.category))).map(cat => ({
      category: cat,
      count: filteredProducts.filter(p => p.category === cat).length,
      value: filteredProducts.filter(p => p.category === cat).reduce((sum, p) => sum + p.value, 0)
    })).sort((a, b) => b.value - a.value)

    return {
      totalProducts,
      activeProducts,
      inactiveProducts: totalProducts - activeProducts,
      totalValue,
      totalStock,
      lowStockProducts,
      highStockProducts,
      normalStockProducts,
      avgValue,
      categoryStats
    }
  }, [filteredProducts])

  // Prepare export data
  const exportData = useMemo(() => {
    const filters = {
      search: searchTerm,
      category: categoryFilter,
      status: statusFilter,
      stockLevel: stockFilter,
      location: locationFilter
    }

    const totalProducts = viewMode === 'grouped' ?
      groups.reduce((sum, group) => sum + group.items.length, 0) :
      filteredProducts.length

    const summary = {
      'Total Products': totalProducts,
      'Active Products': viewMode === 'grouped' ?
        groups.reduce((sum, group) => sum + group.items.filter(p => p.status === 'Active').length, 0) :
        filteredProducts.filter(p => p.status === 'Active').length,
      'Total Value': formatCurrency(viewMode === 'grouped' ?
        groups.reduce((sum, group) => sum + group.items.reduce((gsum, p) => gsum + p.value, 0), 0) :
        filteredProducts.reduce((sum, p) => sum + p.value, 0)),
      'View Mode': viewMode === 'grouped' ? 'Grouped by Location' : 'List View'
    }

    const data = createExportData(
      'Stock Cards Report',
      exportColumns,
      viewMode === 'grouped' ? groups : undefined,
      viewMode === 'grouped' ? calculateGrandTotals(['currentStock', 'value', 'averageCost', 'locationCount']) : undefined,
      filters,
      summary
    )

    // Add items for list view
    if (viewMode === 'list') {
      data.items = filteredProducts
    }

    return data
  }, [groups, filteredProducts, viewMode, searchTerm, categoryFilter, statusFilter, stockFilter, locationFilter, exportColumns, calculateGrandTotals])
  
  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48 mt-1" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex justify-between">
                <Skeleton className="h-10 w-[300px]" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 w-[120px]" />
                  <Skeleton className="h-10 w-[120px]" />
                </div>
              </div>
              
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <div className="space-y-2 p-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-7 w-7 text-blue-600" />
            Stock Cards
          </h1>
          <p className="text-sm text-muted-foreground">
            View and manage inventory items across all locations
          </p>
        </div>

        <div className="flex flex-wrap gap-2 self-end md:self-auto">
          <div className="flex items-center bg-muted rounded-md p-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 px-3"
            >
              <List className="h-4 w-4 mr-1" />
              List
            </Button>
            <Button
              variant={viewMode === 'cards' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cards')}
              className="h-8 px-3"
            >
              <Grid3X3 className="h-4 w-4 mr-1" />
              Cards
            </Button>
            <Button
              variant={viewMode === 'grouped' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grouped')}
              className="h-8 px-3"
            >
              <LayoutGrid className="h-4 w-4 mr-1" />
              Grouped
            </Button>
          </div>
          <Button variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Advanced Filters
          </Button>
          <ExportButton
            data={exportData}
            disabled={isLoading}
          />
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Products</p>
                <p className="text-2xl font-bold">{formatNumber(summaryStats.totalProducts)}</p>
                <p className="text-xs text-muted-foreground">{summaryStats.activeProducts} active</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">{formatCurrency(summaryStats.totalValue)}</p>
                <p className="text-xs text-muted-foreground">Avg: {formatCurrency(summaryStats.avgValue)}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Normal Stock</p>
                <p className="text-2xl font-bold text-green-600">{formatNumber(summaryStats.normalStockProducts)}</p>
                <Progress value={(summaryStats.normalStockProducts / summaryStats.totalProducts) * 100} className="h-1.5 mt-2 [&>div]:bg-green-500" />
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Low Stock</p>
                <p className="text-2xl font-bold text-red-600">{formatNumber(summaryStats.lowStockProducts)}</p>
                <Progress value={(summaryStats.lowStockProducts / summaryStats.totalProducts) * 100} className="h-1.5 mt-2 [&>div]:bg-red-500" />
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">High Stock</p>
                <p className="text-2xl font-bold text-amber-600">{formatNumber(summaryStats.highStockProducts)}</p>
                <Progress value={(summaryStats.highStockProducts / summaryStats.totalProducts) * 100} className="h-1.5 mt-2 [&>div]:bg-amber-500" />
              </div>
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Categories</p>
                <p className="text-2xl font-bold">{categories.length}</p>
                <p className="text-xs text-muted-foreground">Top: {summaryStats.categoryStats[0]?.category || 'N/A'}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative w-full md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by name or code..."
                  className="pl-8 w-full md:w-[300px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {viewMode === 'grouped' && (
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={expandAll}
                      className="h-10"
                    >
                      <ChevronDown className="h-4 w-4 mr-1" />
                      Expand All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={collapseAll}
                      className="h-10"
                    >
                      <ChevronUp className="h-4 w-4 mr-1" />
                      Collapse All
                    </Button>
                  </div>
                )}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={stockFilter} onValueChange={setStockFilter}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Stock Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="low">Low Stock</SelectItem>
                    <SelectItem value="normal">Normal Stock</SelectItem>
                    <SelectItem value="high">High Stock</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Products Display */}
            {viewMode === 'cards' ? (
              /* Cards Grid View */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredProducts.length === 0 ? (
                  <div className="col-span-full text-center py-12 text-muted-foreground">
                    No products found.
                  </div>
                ) : (
                  filteredProducts.map((product) => {
                    const stockPercentage = product.maximumStock > 0
                      ? (product.currentStock / product.maximumStock) * 100
                      : 0
                    const isLowStock = product.currentStock <= product.minimumStock
                    const isHighStock = product.currentStock >= product.maximumStock

                    return (
                      <Card
                        key={product.id}
                        className={`cursor-pointer hover:shadow-md transition-shadow ${
                          isLowStock ? 'border-red-200' : isHighStock ? 'border-amber-200' : ''
                        }`}
                        onClick={() => handleRowClick(product.id)}
                      >
                        <CardContent className="pt-4">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{product.code}</Badge>
                                <Badge
                                  variant={product.status === "Active" ? "outline" : "secondary"}
                                  className={product.status === "Active"
                                    ? "bg-green-50 text-green-700 border-green-200 text-xs"
                                    : "bg-gray-100 text-gray-700 text-xs"
                                  }
                                >
                                  {product.status}
                                </Badge>
                              </div>
                              <h3 className="font-semibold mt-2 line-clamp-1">{product.name}</h3>
                              <p className="text-sm text-muted-foreground">{product.category}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-muted-foreground">Stock Level</span>
                              {renderStockLevelBadge(product)}
                            </div>

                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>{formatNumber(product.currentStock)} {product.unit}</span>
                                <span className="text-muted-foreground">Max: {formatNumber(product.maximumStock)}</span>
                              </div>
                              <Progress
                                value={Math.min(stockPercentage, 100)}
                                className={`h-2 ${
                                  isLowStock ? '[&>div]:bg-red-500' :
                                  isHighStock ? '[&>div]:bg-amber-500' :
                                  '[&>div]:bg-green-500'
                                }`}
                              />
                            </div>

                            <div className="flex justify-between pt-2 border-t">
                              <div>
                                <p className="text-xs text-muted-foreground">Value</p>
                                <p className="font-medium">{formatCurrency(product.value)}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs text-muted-foreground">Locations</p>
                                <p className="font-medium flex items-center gap-1">
                                  <MapPin className="h-3 w-3" />
                                  {product.locationCount}
                                </p>
                              </div>
                              <Button size="sm" variant="ghost" className="self-end">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })
                )}
              </div>
            ) : viewMode === 'list' ? (
              <div className="rounded-md border">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gray-50/75">
                        <TableHead
                          className="py-3 font-medium text-gray-600 cursor-pointer"
                          onClick={() => handleSort("code")}
                        >
                          <div className="flex items-center">
                            Code
                            {sortField === "code" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="py-3 font-medium text-gray-600 cursor-pointer"
                          onClick={() => handleSort("name")}
                        >
                          <div className="flex items-center">
                            Name
                            {sortField === "name" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead
                          className="py-3 font-medium text-gray-600 cursor-pointer"
                          onClick={() => handleSort("category")}
                        >
                          <div className="flex items-center">
                            Category
                            {sortField === "category" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="py-3 font-medium text-gray-600">Status</TableHead>
                        <TableHead
                          className="py-3 font-medium text-gray-600 text-right cursor-pointer"
                          onClick={() => handleSort("stock")}
                        >
                          <div className="flex items-center justify-end">
                            Current Stock
                            {sortField === "stock" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                            )}
                          </div>
                        </TableHead>
                        <TableHead className="py-3 font-medium text-gray-600 text-right">Stock Level</TableHead>
                        <TableHead
                          className="py-3 font-medium text-gray-600 text-right cursor-pointer"
                          onClick={() => handleSort("value")}
                        >
                          <div className="flex items-center justify-end">
                            Value
                            {sortField === "value" && (
                              <ArrowUpDown className={`ml-2 h-4 w-4 ${sortDirection === "desc" ? "rotate-180" : ""}`} />
                            )}
                          </div>
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            No products found.
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredProducts.map((product) => (
                          <TableRow
                            key={product.id}
                            className="hover:bg-gray-50/50 cursor-pointer"
                            onClick={() => handleRowClick(product.id)}
                          >
                            <TableCell>{product.code}</TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{product.category}</TableCell>
                            <TableCell>
                              <Badge
                                variant={product.status === "Active" ? "outline" : "secondary"}
                                className={product.status === "Active"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : "bg-gray-100 text-gray-700"
                                }
                              >
                                {product.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              {formatNumber(product.currentStock)} {product.unit}
                            </TableCell>
                            <TableCell className="text-right">
                              {renderStockLevelBadge(product)}
                            </TableCell>
                            <TableCell className="text-right">
                              {formatCurrency(product.value)}
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <GroupedTable
                groups={groups}
                columns={[
                  { key: 'location', label: 'Location', type: 'text' },
                  { key: 'code', label: 'Code', type: 'text' },
                  { key: 'name', label: 'Name', type: 'text' },
                  { key: 'category', label: 'Category', type: 'text' },
                  { key: 'status', label: 'Status', type: 'badge' },
                  { key: 'currentStock', label: 'Current Stock', type: 'number' },
                  { key: 'stockLevel', label: 'Stock Level', type: 'badge' },
                  { key: 'value', label: 'Value', type: 'currency' }
                ]}
                renderRow={(product: Product) => (
                  <TableRow
                    key={product.id}
                    className="hover:bg-gray-50/50 cursor-pointer"
                    onClick={() => handleRowClick(product.id)}
                  >
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        {product.locations[0]?.name}
                      </div>
                    </TableCell>
                    <TableCell>{product.code}</TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      <Badge
                        variant={product.status === "Active" ? "outline" : "secondary"}
                        className={product.status === "Active"
                          ? "bg-green-50 text-green-700 border-green-200"
                          : "bg-gray-100 text-gray-700"
                        }
                      >
                        {product.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(product.currentStock)} {product.unit}
                    </TableCell>
                    <TableCell className="text-right">
                      {renderStockLevelBadge(product)}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatCurrency(product.value)}
                    </TableCell>
                  </TableRow>
                )}
                onToggleGroup={toggleGroup}
                showSubtotals={true}
                getGroupKeyMetrics={(subtotals) => [
                  { label: 'Items', value: subtotals.totalItems, type: 'number' },
                  { label: 'Total Stock', value: formatNumber(subtotals.currentStock), type: 'text' },
                  { label: 'Total Value', value: formatCurrency(subtotals.value), type: 'text' }
                ]}
                grandTotals={calculateGrandTotals(['totalItems', 'currentStock', 'value'])}
              />
            )}
            
            {/* Summary */}
            <div className="flex justify-between text-sm text-muted-foreground">
              <div>
                Showing {filteredProducts.length} of {products.length} products
              </div>
              <div>
                Last updated: {new Date().toLocaleDateString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 