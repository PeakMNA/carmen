"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useEffect, useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Loader2,
  Save,
  X,
  AlertTriangle,
  Info,
  CheckCircle2,
  HelpCircle,
  Eye,
  EyeOff
} from "lucide-react"
import { Unit } from "@/lib/types"
import { toast } from "sonner"

// Enhanced validation schema with comprehensive rules (BR-UNIT aligned)
const unitSchema = z.object({
  code: z.string()
    .min(1, "Unit code is required")
    .max(10, "Code must not exceed 10 characters")
    .regex(/^[A-Z0-9_]+$/, "Code must be uppercase letters, numbers, and underscores only")
    .transform(val => val.trim().toUpperCase()),
  name: z.string()
    .min(1, "Unit name is required")
    .max(50, "Name must not exceed 50 characters")
    .refine(val => val.trim().length > 0, "Name cannot be only whitespace")
    .transform(val => val.trim()),
  symbol: z.string()
    .min(1, "Unit symbol is required")
    .max(10, "Symbol must not exceed 10 characters")
    .regex(/^[A-Za-z0-9_-]+$/, "Symbol must contain only letters, numbers, hyphens, and underscores")
    .refine(val => val.trim() === val, "Symbol cannot have leading or trailing spaces")
    .transform(val => val.trim()),
  description: z.string()
    .max(200, "Description must not exceed 200 characters")
    .optional(),
  type: z.enum(["INVENTORY", "ORDER", "RECIPE", "MEASURE"], {
    required_error: "Please select a unit type",
    invalid_type_error: "Invalid unit type selected",
  }),
  category: z.enum(["weight", "volume", "length", "count", "time", "temperature", "serving"], {
    required_error: "Please select a unit category",
    invalid_type_error: "Invalid unit category selected",
  }),
  baseUnit: z.string().optional(),
  conversionFactor: z.number().positive().optional(),
  isActive: z.boolean().default(true),
})

type UnitFormValues = z.infer<typeof unitSchema>
type UnitFormData = UnitFormValues

interface UnitFormProps {
  unit?: Unit
  onSuccess: (data: UnitFormValues) => void
  onCancel: () => void
  isLoading?: boolean
  mode?: 'create' | 'edit' | 'view'
  showAdvancedOptions?: boolean
}

// Character count component for real-time feedback
const CharacterCount = ({ current, max, className = "" }: { current: number, max: number, className?: string }) => {
  const percentage = (current / max) * 100
  const isNearLimit = percentage >= 80
  const isOverLimit = percentage >= 100

  return (
    <span className={`text-xs ${isOverLimit ? 'text-destructive' :
        isNearLimit ? 'text-amber-600' :
          'text-muted-foreground'
      } ${className}`}>
      {current}/{max}
    </span>
  )
}

// Field help tooltip
const FieldHelp = ({ content }: { content: string }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
      </TooltipTrigger>
      <TooltipContent>
        <p className="max-w-xs">{content}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
)

export function EnhancedUnitForm({
  unit,
  onSuccess,
  onCancel,
  isLoading = false,
  mode = 'create',
  showAdvancedOptions = false
}: UnitFormProps) {
  // Form state management
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(showAdvancedOptions)
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({})
  const [validationTouched, setValidationTouched] = useState<Record<string, boolean>>({})

  const formRef = useRef<HTMLFormElement>(null)
  const codeInputRef = useRef<HTMLInputElement>(null)

  // Enhanced form with proper defaults and validation
  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    mode: 'onBlur', // Validate on blur for better UX
    defaultValues: {
      code: unit?.code || "",
      name: unit?.name || "",
      symbol: unit?.symbol || "",
      description: unit?.description || "",
      type: unit?.type || "INVENTORY",
      category: unit?.category || "weight",
      baseUnit: unit?.baseUnit || "",
      conversionFactor: unit?.conversionFactor || undefined,
      isActive: unit?.isActive ?? true,
    },
  })

  // Watch form values for unsaved changes detection
  const watchedValues = form.watch()

  // Auto-focus code input on mount for new units
  useEffect(() => {
    if (!unit && codeInputRef.current) {
      codeInputRef.current.focus()
    }
  }, [])

  // Track unsaved changes
  useEffect(() => {
    if (!unit) {
      // New unit - check if any fields have values
      const hasChanges = Object.values(watchedValues).some(value => {
        if (typeof value === 'boolean') return value !== true // isActive defaults to true
        if (typeof value === 'string') return value.length > 0
        if (typeof value === 'number') return true
        return false
      })
      setHasUnsavedChanges(hasChanges)
    } else {
      // Existing unit - compare with original values
      const hasChanges = (
        watchedValues.code !== unit.code ||
        watchedValues.name !== unit.name ||
        watchedValues.symbol !== unit.symbol ||
        watchedValues.description !== (unit.description || "") ||
        watchedValues.type !== unit.type ||
        watchedValues.category !== unit.category ||
        watchedValues.baseUnit !== (unit.baseUnit || "") ||
        watchedValues.conversionFactor !== unit.conversionFactor ||
        watchedValues.isActive !== unit.isActive
      )
      setHasUnsavedChanges(hasChanges)
    }
  }, [watchedValues, unit])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (form.formState.isValid && !isSubmitting) {
          form.handleSubmit(onSubmit)()
        }
      }
      // Escape to cancel
      if (e.key === 'Escape') {
        handleCancel()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [form.formState.isValid, isSubmitting])

  // Enhanced submit handler with loading and error states
  const onSubmit = useCallback(async (data: UnitFormValues) => {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)

      // Simulate API delay for demo
      await new Promise(resolve => setTimeout(resolve, 1000))

      onSuccess(data)
      setHasUnsavedChanges(false)

      toast.success(
        unit ? 'Unit updated successfully!' : 'Unit created successfully!',
        { duration: 3000 }
      )
    } catch (error) {
      toast.error('Failed to save unit. Please try again.')
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, onSuccess, unit])

  // Enhanced cancel handler with unsaved changes protection
  const handleCancel = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowUnsavedDialog(true)
    } else {
      onCancel()
    }
  }, [hasUnsavedChanges, onCancel])

  // Confirm discard changes
  const handleDiscardChanges = () => {
    setShowUnsavedDialog(false)
    setHasUnsavedChanges(false)
    onCancel()
  }

  // Field validation on blur
  const handleFieldBlur = (fieldName: keyof UnitFormData) => {
    setValidationTouched(prev => ({ ...prev, [fieldName]: true }))
    form.trigger(fieldName)
  }

  const isViewMode = mode === 'view'

  // Get form state for UI feedback
  const { errors, isValid, isDirty } = form.formState
  const hasErrors = Object.keys(errors).length > 0

  return (
    <>
      <TooltipProvider>
        <Card className="w-full max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-semibold">
                  {isViewMode ? 'View Unit' : unit ? 'Edit Unit' : 'Create New Unit'}
                </CardTitle>
                {unit && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {unit.category}
                    </Badge>
                    <Badge
                      variant={unit.isActive ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {unit.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Form status indicator */}
              {!isViewMode && (
                <div className="flex items-center gap-2 text-sm">
                  {hasUnsavedChanges && (
                    <Badge variant="outline" className="text-amber-600">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Unsaved changes
                    </Badge>
                  )}
                  {isValid && isDirty && !hasUnsavedChanges && (
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Ready to save
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent>
            <Form {...form}>
              <form ref={formRef} onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">Basic Information</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Unit Code Field (BR-UNIT-001) */}
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel className="text-sm font-medium">Unit Code *</FormLabel>
                            <FieldHelp content="Unique, immutable code for the unit (e.g., KG, ML, BOX). Uppercase letters, numbers, and underscores only." />
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                ref={codeInputRef}
                                disabled={isViewMode || isLoading || !!unit}
                                placeholder="e.g., KG, ML, BOX"
                                className={`uppercase font-mono
                                  ${errors.code ? 'border-destructive' : ''}
                                  ${validationTouched.code && !errors.code ? 'border-green-500' : ''}
                                `}
                                onBlur={() => handleFieldBlur('code')}
                                maxLength={10}
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <CharacterCount current={field.value?.length || 0} max={10} />
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs">
                            {unit ? "Code cannot be changed after creation" : "Unique identifier for the unit (cannot be changed later)"}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Unit Symbol Field */}
                    <FormField
                      control={form.control}
                      name="symbol"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel className="text-sm font-medium">Display Symbol *</FormLabel>
                            <FieldHelp content="A short symbol shown in UI (e.g., kg, L, pc). Letters, numbers, hyphens, and underscores allowed." />
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Input
                                {...field}
                                disabled={isViewMode || isLoading}
                                placeholder="e.g., kg, L, pc"
                                className={`
                                  ${errors.symbol ? 'border-destructive' : ''}
                                  ${validationTouched.symbol && !errors.symbol ? 'border-green-500' : ''}
                                `}
                                onBlur={() => handleFieldBlur('symbol')}
                                maxLength={10}
                              />
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <CharacterCount current={field.value.length} max={10} />
                              </div>
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs">
                            Used in reports and product specifications
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Unit Name Field */}
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel className="text-sm font-medium">Unit Name *</FormLabel>
                          <FieldHelp content="Full descriptive name of the unit (e.g., Kilogram, Liter, Piece). Used in user interfaces and reports." />
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              disabled={isViewMode || isLoading}
                              placeholder="e.g., Kilogram, Liter, Piece"
                              className={`
                                ${errors.name ? 'border-destructive' : ''}
                                ${validationTouched.name && !errors.name ? 'border-green-500' : ''}
                              `}
                              onBlur={() => handleFieldBlur('name')}
                              maxLength={50}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <CharacterCount current={field.value.length} max={50} />
                            </div>
                          </div>
                        </FormControl>
                        <FormDescription className="text-xs">
                          Displayed to users throughout the system
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description Field (BR-UNIT-007) */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center gap-2">
                          <FormLabel className="text-sm font-medium">Description</FormLabel>
                          <FieldHelp content="Optional detailed description of the unit's purpose and usage." />
                        </div>
                        <FormControl>
                          <div className="relative">
                            <Textarea
                              {...field}
                              disabled={isViewMode || isLoading}
                              placeholder="Describe the unit's purpose and common usage..."
                              className={`resize-none
                                ${errors.description ? 'border-destructive' : ''}
                              `}
                              rows={2}
                              maxLength={200}
                            />
                            <div className="absolute right-3 bottom-2">
                              <CharacterCount current={field.value?.length || 0} max={200} />
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Type and Category Row */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Unit Type Field (BR-UNIT-006) */}
                    <FormField
                      control={form.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel className="text-sm font-medium">Unit Type *</FormLabel>
                            <FieldHelp content="Determines where this unit can be used: Inventory (stock tracking), Order (purchasing), or Recipe (food preparation)." />
                          </div>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isViewMode || isLoading}
                          >
                            <FormControl>
                              <SelectTrigger className={errors.type ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select unit type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="INVENTORY">
                                <div className="flex flex-col items-start">
                                  <span className="flex items-center gap-2">📦 Inventory</span>
                                  <span className="text-xs text-muted-foreground">For stock tracking (KG, L, PC)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="ORDER">
                                <div className="flex flex-col items-start">
                                  <span className="flex items-center gap-2">🛒 Order</span>
                                  <span className="text-xs text-muted-foreground">For purchasing (BOX, CASE, CTN)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="RECIPE">
                                <div className="flex flex-col items-start">
                                  <span className="flex items-center gap-2">🍽️ Recipe</span>
                                  <span className="text-xs text-muted-foreground">Serving units (SERVING, PORTION)</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="MEASURE">
                                <div className="flex flex-col items-start">
                                  <span className="flex items-center gap-2">🥄 Measure</span>
                                  <span className="text-xs text-muted-foreground">For food prep (TSP, TBSP, CUP)</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs">
                            Determines where this unit can be used in the system
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Unit Category Field */}
                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel className="text-sm font-medium">Measurement Category *</FormLabel>
                            <FieldHelp content="Physical measurement category: Weight, Volume, Length, Count, Time, Temperature, or Serving." />
                          </div>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            disabled={isViewMode || isLoading}
                          >
                            <FormControl>
                              <SelectTrigger className={errors.category ? 'border-destructive' : ''}>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="weight">
                                <div className="flex flex-col items-start">
                                  <span>Weight</span>
                                  <span className="text-xs text-muted-foreground">Mass measurements</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="volume">
                                <div className="flex flex-col items-start">
                                  <span>Volume</span>
                                  <span className="text-xs text-muted-foreground">Capacity measurements</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="length">
                                <div className="flex flex-col items-start">
                                  <span>Length</span>
                                  <span className="text-xs text-muted-foreground">Distance measurements</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="count">
                                <div className="flex flex-col items-start">
                                  <span>Count</span>
                                  <span className="text-xs text-muted-foreground">Discrete units</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="time">
                                <div className="flex flex-col items-start">
                                  <span>Time</span>
                                  <span className="text-xs text-muted-foreground">Duration measurements</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="temperature">
                                <div className="flex flex-col items-start">
                                  <span>Temperature</span>
                                  <span className="text-xs text-muted-foreground">Temperature measurements</span>
                                </div>
                              </SelectItem>
                              <SelectItem value="serving">
                                <div className="flex flex-col items-start">
                                  <span>Serving</span>
                                  <span className="text-xs text-muted-foreground">Portion/serving measurements</span>
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-xs">
                            Physical measurement type
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Conversion Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Base Unit Field */}
                    <FormField
                      control={form.control}
                      name="baseUnit"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel className="text-sm font-medium">Base Unit</FormLabel>
                            <FieldHelp content="Reference unit for conversions. Leave empty if this is a base unit." />
                          </div>
                          <FormControl>
                            <Input
                              {...field}
                              disabled={isViewMode || isLoading}
                              placeholder="e.g., KG, L (leave empty if base unit)"
                              className="uppercase font-mono"
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Reference unit for conversion calculations
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Conversion Factor Field */}
                    <FormField
                      control={form.control}
                      name="conversionFactor"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex items-center gap-2">
                            <FormLabel className="text-sm font-medium">Conversion Factor</FormLabel>
                            <FieldHelp content="Multiplier to convert this unit to the base unit. E.g., 1000 for g→kg." />
                          </div>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.0001"
                              disabled={isViewMode || isLoading}
                              placeholder="e.g., 0.001 for g→kg"
                              onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                              value={field.value || ''}
                            />
                          </FormControl>
                          <FormDescription className="text-xs">
                            Factor to convert to base unit
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Status Section */}
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="text-lg font-medium">Status & Settings</h3>

                  <FormField
                    control={form.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/20">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <FormLabel className="text-base font-medium">Active Status</FormLabel>
                              <FieldHelp content="Active units can be used throughout the system. Inactive units are hidden from selection lists but preserved for historical data." />
                            </div>
                            <FormDescription className="text-sm">
                              {field.value
                                ? "This unit is available for use in the system"
                                : "This unit is hidden from new transactions"}
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              disabled={isViewMode || isLoading}
                              className="data-[state=checked]:bg-green-600"
                            />
                          </FormControl>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Form Actions */}
                {!isViewMode && (
                  <div className="flex flex-col sm:flex-row justify-end gap-3 pt-6 border-t">
                    <div className="flex-1 sm:flex-initial">
                      {hasErrors && (
                        <div className="flex items-center gap-2 text-sm text-destructive mb-3 sm:mb-0">
                          <AlertTriangle className="h-4 w-4" />
                          <span>Please fix the errors above</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleCancel}
                        disabled={isSubmitting || isLoading}
                        className="flex-1 sm:flex-initial min-w-[100px]"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Cancel
                      </Button>

                      <Button
                        type="submit"
                        disabled={isSubmitting || isLoading || !isValid || !isDirty}
                        className="flex-1 sm:flex-initial min-w-[120px]"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4 mr-2" />
                            {unit ? 'Update Unit' : 'Create Unit'}
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                {/* Keyboard shortcuts help */}
                {!isViewMode && (
                  <div className="text-xs text-muted-foreground text-center pt-2 border-t">
                    <div className="flex items-center justify-center gap-4">
                      <span><kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Ctrl+S</kbd> Save</span>
                      <span><kbd className="px-1.5 py-0.5 text-xs bg-muted rounded">Esc</kbd> Cancel</span>
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </TooltipProvider>

      {/* Unsaved Changes Dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Unsaved Changes
            </AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes that will be lost if you continue.
              Are you sure you want to discard these changes?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Editing</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDiscardChanges}
              className="bg-destructive hover:bg-destructive/90"
            >
              Discard Changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}