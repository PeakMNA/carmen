"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/lib/context/simple-user-context"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  ArrowRight,
  CalendarIcon,
  Check,
  ClipboardCheck,
  Package,
  Search,
  X,
  MapPin,
  User,
  Users,
  Building,
  Layers,
  RefreshCw,
  Calendar as CalendarIconAlt,
  CircleDot,
  RotateCcw,
  DollarSign,
  Filter,
  Plus,
  Trash2
} from "lucide-react"
import type {
  PhysicalCountType,
  PhysicalCountFormData
} from "../types"
import { mockInventoryItems } from "@/lib/mock-data/inventory"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

// Mock data for locations, departments, and users
const mockLocations = [
  { id: "loc-main-kitchen", name: "Main Kitchen" },
  { id: "loc-cold-storage", name: "Cold Storage" },
  { id: "loc-dry-storage", name: "Dry Storage" },
  { id: "loc-pastry", name: "Pastry Kitchen" },
  { id: "loc-bar", name: "Main Bar" },
  { id: "loc-wine-cellar", name: "Wine Cellar" },
  { id: "loc-receiving", name: "Receiving Dock" },
  { id: "loc-banquet", name: "Banquet Kitchen" }
]

const mockDepartments = [
  { id: "dept-kitchen", name: "Kitchen Operations" },
  { id: "dept-storage", name: "Storage & Logistics" },
  { id: "dept-beverage", name: "Beverage & Bar" },
  { id: "dept-pastry", name: "Pastry & Bakery" },
  { id: "dept-banquet", name: "Banquet Operations" }
]

const mockZones = [
  { id: "zone-a", name: "Zone A - Primary Storage" },
  { id: "zone-b", name: "Zone B - Secondary Storage" },
  { id: "zone-c", name: "Zone C - Cold Items" },
  { id: "zone-d", name: "Zone D - Dry Items" },
  { id: "zone-e", name: "Zone E - High Value" }
]

const mockUsers = [
  { id: "user-001", name: "John Smith", role: "supervisor" },
  { id: "user-002", name: "Sarah Johnson", role: "supervisor" },
  { id: "user-003", name: "Mike Chen", role: "counter" },
  { id: "user-004", name: "Emily Davis", role: "counter" },
  { id: "user-005", name: "Robert Wilson", role: "counter" },
  { id: "user-006", name: "Anna Martinez", role: "counter" },
  { id: "user-007", name: "David Lee", role: "verifier" },
  { id: "user-008", name: "Lisa Brown", role: "verifier" }
]

// Type configuration
const typeConfig: Record<PhysicalCountType, { label: string; description: string; icon: React.ReactNode }> = {
  "full": {
    label: "Full Physical Count",
    description: "Complete count of all inventory items in the location",
    icon: <Package className="h-5 w-5" />
  },
  "cycle": {
    label: "Cycle Count",
    description: "Regular scheduled count of specific categories",
    icon: <RefreshCw className="h-5 w-5" />
  },
  "annual": {
    label: "Annual Count",
    description: "Year-end comprehensive inventory verification",
    icon: <CalendarIconAlt className="h-5 w-5" />
  },
  "perpetual": {
    label: "Perpetual Inventory",
    description: "Continuous counting throughout the period",
    icon: <RotateCcw className="h-5 w-5" />
  },
  "partial": {
    label: "Partial Count",
    description: "Count of specific items or areas only",
    icon: <CircleDot className="h-5 w-5" />
  }
}

// Generate mock items for selection
const generateMockItems = () => {
  const categories = ['Grains & Cereals', 'Oils & Fats', 'Spices', 'Stocks & Sauces', 'Pasta & Noodles', 'Beverages', 'Dairy', 'Frozen Foods', 'Fresh Produce', 'Meat & Poultry']
  const units = ['kg', 'L', 'pcs', 'bags', 'bottles', 'packs', 'boxes', 'tins']
  const locations = ['Main Store A1', 'Main Store A2', 'Cold Storage B1', 'Dry Storage C1', 'Kitchen Prep D1', 'Bar Storage E1']

  return Array.from({ length: 100 }, (_, i) => ({
    id: `item-${String(i + 1).padStart(3, '0')}`,
    itemCode: `INV-${String(1000 + i).substring(1)}`,
    itemName: [
      'Basmati Rice Premium', 'Olive Oil Extra Virgin', 'Black Pepper Ground',
      'Chicken Stock Powder', 'Pasta Penne', 'Jasmine Rice', 'Vegetable Oil',
      'Paprika Sweet', 'Beef Stock Cubes', 'Spaghetti', 'Coconut Milk',
      'Garlic Powder', 'Fish Sauce', 'Soy Sauce Dark', 'Tomato Paste',
      'Flour All Purpose', 'Sugar White', 'Salt Sea', 'Cumin Ground',
      'Turmeric Powder', 'Coriander Seeds', 'Cardamom Pods', 'Bay Leaves',
      'Thyme Dried', 'Oregano Dried', 'Basil Dried', 'Rosemary Dried',
      'Chili Flakes', 'Cinnamon Sticks', 'Vanilla Extract', 'Lemon Juice',
      'Wine Vinegar', 'Balsamic Vinegar', 'Mayonnaise', 'Mustard Dijon',
      'Ketchup', 'Hot Sauce', 'Worcestershire Sauce', 'Sesame Oil',
      'Peanut Oil', 'Butter Unsalted', 'Cream Heavy', 'Milk Full Fat',
      'Eggs Large', 'Cheese Parmesan', 'Cheese Cheddar', 'Mozzarella',
      'Bacon Strips', 'Ham Sliced', 'Salmon Fillet', 'Chicken Breast',
      'Beef Tenderloin', 'Lamb Rack', 'Duck Breast', 'Pork Belly',
      'Shrimp Large', 'Lobster Tail', 'Crab Meat', 'Tuna Steak',
      'Spinach Fresh', 'Lettuce Romaine', 'Tomatoes', 'Onions Yellow',
      'Garlic Bulbs', 'Carrots', 'Celery', 'Bell Peppers',
      'Mushrooms', 'Broccoli', 'Asparagus', 'Green Beans',
      'Potatoes', 'Sweet Potatoes', 'Corn Kernels', 'Peas Green',
      'Avocados', 'Lemons', 'Limes', 'Oranges',
      'Apples', 'Bananas', 'Strawberries', 'Blueberries',
      'Ice Cream Vanilla', 'Sorbet Mango', 'Frozen Puff Pastry', 'Frozen Berries',
      'Coffee Beans', 'Tea Leaves', 'Mineral Water', 'Sparkling Water',
      'Orange Juice', 'Apple Juice', 'Cranberry Juice', 'Tonic Water',
      'Cola', 'Lemonade', 'Ginger Ale', 'Energy Drink'
    ][i % 100],
    category: categories[i % categories.length],
    unit: units[i % units.length],
    location: locations[i % locations.length],
    systemQuantity: Math.floor(Math.random() * 200) + 10,
    unitCost: Number((Math.random() * 100 + 5).toFixed(2)),
    lastCountDate: new Date(Date.now() - Math.random() * 86400000 * 90)
  }))
}

const allItems = generateMockItems()

export default function NewPhysicalCountPage() {
  const router = useRouter()
  const { user } = useUser()

  // Form state
  const [step, setStep] = useState(1)
  const [countType, setCountType] = useState<PhysicalCountType>("full")
  const [locationId, setLocationId] = useState("")
  const [departmentId, setDepartmentId] = useState("")
  const [zoneId, setZoneId] = useState("")
  const [supervisorId, setSupervisorId] = useState("")
  const [counterIds, setCounterIds] = useState<string[]>([])
  const [scheduledDate, setScheduledDate] = useState<Date>(new Date())
  const [dueDate, setDueDate] = useState<Date | undefined>(undefined)
  const [priority, setPriority] = useState<"low" | "medium" | "high" | "critical">("medium")
  const [approvalThreshold, setApprovalThreshold] = useState(5)
  const [description, setDescription] = useState("")
  const [instructions, setInstructions] = useState("")
  const [notes, setNotes] = useState("")

  // Category selection for partial/cycle counts
  const [includeCategories, setIncludeCategories] = useState<string[]>([])
  const [excludeCategories, setExcludeCategories] = useState<string[]>([])

  // Item selection state
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")

  // Get unique categories from items
  const categories = useMemo(() => {
    return [...new Set(allItems.map(item => item.category))].sort()
  }, [])

  // Filter available items
  const filteredItems = useMemo(() => {
    let items = [...allItems]

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      items = items.filter(item =>
        item.itemName.toLowerCase().includes(term) ||
        item.itemCode.toLowerCase().includes(term)
      )
    }

    if (categoryFilter !== "all") {
      items = items.filter(item => item.category === categoryFilter)
    }

    // For partial counts, filter by included categories
    if (countType === "partial" && includeCategories.length > 0) {
      items = items.filter(item => includeCategories.includes(item.category))
    }

    // Exclude categories
    if (excludeCategories.length > 0) {
      items = items.filter(item => !excludeCategories.includes(item.category))
    }

    return items
  }, [searchTerm, categoryFilter, countType, includeCategories, excludeCategories])

  // Get selected item details
  const selectedItemDetails = useMemo(() => {
    return allItems.filter(item => selectedItems.includes(item.id))
  }, [selectedItems])

  // Calculate total value of selected items
  const totalValue = useMemo(() => {
    return selectedItemDetails.reduce((sum, item) => sum + (item.systemQuantity * item.unitCost), 0)
  }, [selectedItemDetails])

  // Get supervisors and counters
  const supervisors = mockUsers.filter(u => u.role === 'supervisor')
  const counters = mockUsers.filter(u => u.role === 'counter' || u.role === 'verifier')

  // Toggle counter selection
  const toggleCounter = (counterId: string) => {
    setCounterIds(prev =>
      prev.includes(counterId)
        ? prev.filter(id => id !== counterId)
        : [...prev, counterId]
    )
  }

  // Toggle item selection
  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev =>
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  // Select all filtered items
  const selectAllFiltered = () => {
    const filteredIds = filteredItems.map(item => item.id)
    setSelectedItems(prev => {
      const newSelection = new Set([...prev, ...filteredIds])
      return Array.from(newSelection)
    })
  }

  // Clear selection
  const clearSelection = () => {
    setSelectedItems([])
  }

  // Toggle category inclusion
  const toggleCategoryInclusion = (category: string) => {
    setIncludeCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    )
  }

  // Validate current step
  const isStepValid = (stepNumber: number): boolean => {
    switch (stepNumber) {
      case 1:
        return countType !== undefined
      case 2:
        return locationId !== "" && supervisorId !== "" && counterIds.length > 0
      case 3:
        if (countType === "full" || countType === "annual") {
          return true // All items included by default
        }
        return selectedItems.length > 0 || includeCategories.length > 0
      case 4:
        return description.trim() !== ""
      default:
        return true
    }
  }

  // Handle form submission
  const handleSubmit = () => {
    const formData: PhysicalCountFormData = {
      countType,
      locationId,
      departmentId: departmentId || null,
      zone: zoneId || null,
      supervisorId,
      counterIds,
      scheduledDate,
      dueDate: dueDate || null,
      description,
      instructions,
      notes,
      priority,
      approvalThreshold,
      includeCategories,
      excludeCategories
    }

    console.log("Creating physical count:", formData)
    console.log("Selected items:", selectedItems)

    // Navigate to the physical count detail page
    router.push("/inventory-management/physical-count-management")
  }

  // Navigate between steps
  const nextStep = () => {
    if (step < 4 && isStepValid(step)) {
      setStep(step + 1)
    }
  }

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1)
    }
  }

  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Physical Count</h1>
          <p className="text-muted-foreground">Create a new physical inventory count</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { num: 1, label: "Count Type" },
            { num: 2, label: "Assignment" },
            { num: 3, label: "Scope" },
            { num: 4, label: "Review" }
          ].map((s, index) => (
            <div key={s.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    step === s.num
                      ? "bg-primary text-primary-foreground"
                      : step > s.num
                        ? "bg-green-500 text-white"
                        : "bg-muted text-muted-foreground"
                  )}
                >
                  {step > s.num ? <Check className="h-5 w-5" /> : s.num}
                </div>
                <span className={cn(
                  "text-xs mt-2 font-medium",
                  step === s.num ? "text-foreground" : "text-muted-foreground"
                )}>
                  {s.label}
                </span>
              </div>
              {index < 3 && (
                <div className={cn(
                  "flex-1 h-0.5 mx-2",
                  step > s.num ? "bg-green-500" : "bg-muted"
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>
            {step === 1 && "Select Count Type"}
            {step === 2 && "Assignment & Team"}
            {step === 3 && "Define Scope"}
            {step === 4 && "Review & Create"}
          </CardTitle>
          <CardDescription>
            {step === 1 && "Choose the type of physical count to perform"}
            {step === 2 && "Assign location, supervisor, and counting team"}
            {step === 3 && "Define which items or categories to include in the count"}
            {step === 4 && "Review the details and create the physical count"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Step 1: Count Type */}
          {step === 1 && (
            <div className="space-y-6">
              <RadioGroup
                value={countType}
                onValueChange={(v) => setCountType(v as PhysicalCountType)}
                className="grid gap-4"
              >
                {Object.entries(typeConfig).map(([type, config]) => (
                  <div key={type}>
                    <RadioGroupItem
                      value={type}
                      id={type}
                      className="peer sr-only"
                    />
                    <Label
                      htmlFor={type}
                      className={cn(
                        "flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                        "hover:bg-muted/50",
                        countType === type
                          ? "border-primary bg-primary/5"
                          : "border-muted"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-lg",
                        countType === type ? "bg-primary text-primary-foreground" : "bg-muted"
                      )}>
                        {config.icon}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{config.label}</p>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                      </div>
                      {countType === type && (
                        <Check className="h-5 w-5 text-primary" />
                      )}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              <Separator />

              <div className="space-y-4">
                <Label>Priority Level</Label>
                <RadioGroup
                  value={priority}
                  onValueChange={(v) => setPriority(v as typeof priority)}
                  className="flex flex-wrap gap-4"
                >
                  {[
                    { value: "low", label: "Low", color: "bg-slate-100 text-slate-700" },
                    { value: "medium", label: "Medium", color: "bg-blue-100 text-blue-700" },
                    { value: "high", label: "High", color: "bg-orange-100 text-orange-700" },
                    { value: "critical", label: "Critical", color: "bg-red-100 text-red-700" }
                  ].map((p) => (
                    <div key={p.value} className="flex items-center">
                      <RadioGroupItem value={p.value} id={`priority-${p.value}`} className="peer sr-only" />
                      <Label
                        htmlFor={`priority-${p.value}`}
                        className={cn(
                          "px-4 py-2 rounded-full cursor-pointer transition-all",
                          priority === p.value
                            ? `${p.color} ring-2 ring-offset-2 ring-primary`
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {p.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="approval-threshold">Variance Approval Threshold (%)</Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="approval-threshold"
                    type="number"
                    min={1}
                    max={100}
                    value={approvalThreshold}
                    onChange={(e) => setApprovalThreshold(parseInt(e.target.value) || 5)}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">
                    Variances above {approvalThreshold}% will require supervisor approval
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Assignment */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <Select value={locationId} onValueChange={setLocationId}>
                    <SelectTrigger id="location">
                      <SelectValue placeholder="Select location" />
                    </SelectTrigger>
                    <SelectContent>
                      {mockLocations.map(loc => (
                        <SelectItem key={loc.id} value={loc.id}>
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            {loc.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="department">Department (Optional)</Label>
                  <Select value={departmentId} onValueChange={setDepartmentId}>
                    <SelectTrigger id="department">
                      <SelectValue placeholder="All departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Departments</SelectItem>
                      {mockDepartments.map(dept => (
                        <SelectItem key={dept.id} value={dept.id}>
                          <div className="flex items-center gap-2">
                            <Building className="h-4 w-4" />
                            {dept.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="zone">Zone (Optional)</Label>
                  <Select value={zoneId} onValueChange={setZoneId}>
                    <SelectTrigger id="zone">
                      <SelectValue placeholder="All zones" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Zones</SelectItem>
                      {mockZones.map(zone => (
                        <SelectItem key={zone.id} value={zone.id}>
                          <div className="flex items-center gap-2">
                            <Layers className="h-4 w-4" />
                            {zone.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="supervisor">Supervisor *</Label>
                  <Select value={supervisorId} onValueChange={setSupervisorId}>
                    <SelectTrigger id="supervisor">
                      <SelectValue placeholder="Select supervisor" />
                    </SelectTrigger>
                    <SelectContent>
                      {supervisors.map(u => (
                        <SelectItem key={u.id} value={u.id}>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            {u.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Scheduled Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(scheduledDate, "PPP")}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={scheduledDate}
                        onSelect={(date) => date && setScheduledDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Due Date (Optional)</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dueDate ? format(dueDate, "PPP") : "No due date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={dueDate}
                        onSelect={setDueDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Separator />

              {/* Counter Selection */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Counting Team *</Label>
                    <p className="text-sm text-muted-foreground">Select team members who will perform the count</p>
                  </div>
                  <Badge variant="outline">{counterIds.length} selected</Badge>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {counters.map(counter => (
                    <div
                      key={counter.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                        counterIds.includes(counter.id)
                          ? "border-primary bg-primary/5"
                          : "border-muted hover:bg-muted/50"
                      )}
                      onClick={() => toggleCounter(counter.id)}
                    >
                      <Checkbox
                        checked={counterIds.includes(counter.id)}
                        onCheckedChange={() => toggleCounter(counter.id)}
                      />
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {counter.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium text-sm">{counter.name}</p>
                        <p className="text-xs text-muted-foreground capitalize">{counter.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Scope */}
          {step === 3 && (
            <div className="space-y-6">
              {/* For Full/Annual counts - show simplified view */}
              {(countType === "full" || countType === "annual") && (
                <div className="p-6 bg-muted/50 rounded-lg text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-medium text-lg">All Items Included</h3>
                  <p className="text-muted-foreground mt-2">
                    A {countType === "full" ? "full" : "annual"} count includes all inventory items at the selected location.
                  </p>
                  <div className="mt-4 flex items-center justify-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Package className="h-4 w-4" />
                      {allItems.length} items
                    </span>
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      ${totalValue.toLocaleString()} value
                    </span>
                  </div>
                </div>
              )}

              {/* For Cycle/Partial counts - show category selection */}
              {(countType === "cycle" || countType === "partial") && (
                <>
                  <div className="space-y-4">
                    <Label>Include Categories</Label>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {categories.map(category => (
                        <div
                          key={category}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors",
                            includeCategories.includes(category)
                              ? "border-primary bg-primary/5"
                              : "border-muted hover:bg-muted/50"
                          )}
                          onClick={() => toggleCategoryInclusion(category)}
                        >
                          <Checkbox
                            checked={includeCategories.includes(category)}
                            onCheckedChange={() => toggleCategoryInclusion(category)}
                          />
                          <span className="text-sm">{category}</span>
                          <Badge variant="outline" className="ml-auto text-xs">
                            {allItems.filter(i => i.category === category).length}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  {includeCategories.length > 0 && (
                    <div className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">Selected Categories: {includeCategories.length}</span>
                        <span className="text-sm text-muted-foreground">
                          {filteredItems.length} items will be included
                        </span>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* For Perpetual counts - show item selection */}
              {countType === "perpetual" && (
                <>
                  {/* Search and Filters */}
                  <div className="flex flex-wrap gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search items..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button variant="outline" onClick={selectAllFiltered}>
                      <Plus className="h-4 w-4 mr-1" />
                      Select All
                    </Button>
                    <Button variant="outline" onClick={clearSelection} disabled={selectedItems.length === 0}>
                      <X className="h-4 w-4 mr-1" />
                      Clear ({selectedItems.length})
                    </Button>
                  </div>

                  {/* Item Selection Table */}
                  <div className="rounded-md border">
                    <ScrollArea className="h-[300px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[40px]"></TableHead>
                            <TableHead>Item</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Location</TableHead>
                            <TableHead className="text-right">Qty</TableHead>
                            <TableHead className="text-right">Value</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredItems.map((item) => (
                            <TableRow
                              key={item.id}
                              className="cursor-pointer"
                              onClick={() => toggleItemSelection(item.id)}
                            >
                              <TableCell>
                                <Checkbox
                                  checked={selectedItems.includes(item.id)}
                                  onCheckedChange={() => toggleItemSelection(item.id)}
                                />
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{item.itemName}</p>
                                  <p className="text-xs text-muted-foreground">{item.itemCode}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.category}</Badge>
                              </TableCell>
                              <TableCell className="text-sm">{item.location}</TableCell>
                              <TableCell className="text-right">
                                {item.systemQuantity} {item.unit}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                ${(item.systemQuantity * item.unitCost).toFixed(2)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </ScrollArea>
                  </div>

                  {/* Selection Summary */}
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{selectedItems.length} items selected</span>
                      </div>
                      <Separator orientation="vertical" className="h-5" />
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">${totalValue.toFixed(2)} total value</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Enter a description for this physical count..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="instructions">Instructions for Counters</Label>
                <Textarea
                  id="instructions"
                  placeholder="Special instructions or procedures to follow..."
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes</Label>
                <Textarea
                  id="notes"
                  placeholder="Any additional notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>

              <Separator />

              {/* Summary */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-3">
                  <h4 className="font-medium">Count Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Type</span>
                      <span className="font-medium">{typeConfig[countType].label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Priority</span>
                      <Badge variant="outline" className="capitalize">{priority}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Approval Threshold</span>
                      <span className="font-medium">{approvalThreshold}% variance</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Items</span>
                      <span className="font-medium">
                        {countType === "full" || countType === "annual"
                          ? `${allItems.length} items`
                          : countType === "perpetual"
                            ? `${selectedItems.length} items`
                            : `${filteredItems.length} items`
                        }
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Assignment</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Location</span>
                      <span className="font-medium">
                        {mockLocations.find(l => l.id === locationId)?.name || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Supervisor</span>
                      <span className="font-medium">
                        {mockUsers.find(u => u.id === supervisorId)?.name || "-"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Team Size</span>
                      <span className="font-medium">{counterIds.length} counters</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scheduled</span>
                      <span className="font-medium">{format(scheduledDate, "PPP")}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Team Preview */}
              <div className="space-y-3">
                <h4 className="font-medium">Counting Team</h4>
                <div className="flex flex-wrap gap-2">
                  {counterIds.map(counterId => {
                    const counter = mockUsers.find(u => u.id === counterId)
                    if (!counter) return null
                    return (
                      <Badge key={counterId} variant="secondary" className="gap-2 py-1.5">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs">
                            {counter.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {counter.name}
                      </Badge>
                    )
                  })}
                </div>
              </div>

              {/* Category Preview (for cycle/partial counts) */}
              {(countType === "cycle" || countType === "partial") && includeCategories.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-medium">Included Categories</h4>
                  <div className="flex flex-wrap gap-2">
                    {includeCategories.map(category => (
                      <Badge key={category} variant="outline">
                        {category}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          {step < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!isStepValid(step)}
            >
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid(step)}
            >
              <ClipboardCheck className="h-4 w-4 mr-2" />
              Create Physical Count
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
