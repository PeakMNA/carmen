"use client"

import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { toast } from 'sonner'
import { Unit } from '@/lib/types'

// Enhanced validation schema
export const unitFormSchema = z.object({
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
  category: z.enum(["weight", "volume", "length", "count", "time", "temperature", "serving"], {
    required_error: "Please select a unit category",
    invalid_type_error: "Invalid unit category selected",
  }),
  isActive: z.boolean().default(true),
})

export type UnitFormData = z.infer<typeof unitFormSchema>

export interface UseUnitFormOptions {
  unit?: Unit
  mode?: 'create' | 'edit' | 'view'
  onSuccess?: (data: UnitFormData) => void
  onCancel?: () => void
  autoSave?: boolean
  validateOnBlur?: boolean
}

export interface UseUnitFormReturn {
  form: ReturnType<typeof useForm<UnitFormData>>
  isSubmitting: boolean
  hasUnsavedChanges: boolean
  fieldErrors: Record<string, boolean>
  validationTouched: Record<string, boolean>
  handleSubmit: (data: UnitFormData) => Promise<void>
  handleCancel: () => void
  handleFieldBlur: (fieldName: string) => void
  resetForm: () => void
  validateField: (fieldName: keyof UnitFormData) => Promise<boolean>
  getFieldState: (fieldName: keyof UnitFormData) => {
    hasError: boolean
    isValid: boolean
    isTouched: boolean
    errorMessage?: string
  }
}

export function useUnitForm(options: UseUnitFormOptions): UseUnitFormReturn {
  const { 
    unit, 
    mode = 'create', 
    onSuccess, 
    onCancel, 
    autoSave = false, 
    validateOnBlur = true 
  } = options

  // State management
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({})
  const [validationTouched, setValidationTouched] = useState<Record<string, boolean>>({})

  // Form configuration
  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitFormSchema),
    mode: validateOnBlur ? 'onBlur' : 'onChange',
    defaultValues: {
      name: unit?.name || "",
      symbol: unit?.symbol || "",
      category: unit?.category || "weight",
      isActive: unit?.isActive ?? true,
    },
  })

  // Watch form values for unsaved changes detection
  const watchedValues = form.watch()

  // Track unsaved changes
  useEffect(() => {
    if (!unit) {
      // New unit - check if any fields have values
      const hasChanges = Object.entries(watchedValues).some(([key, value]) => {
        if (key === 'isActive' && typeof value === 'boolean') return value !== true
        if (typeof value === 'string') return value.length > 0
        return false
      })
      setHasUnsavedChanges(hasChanges)
    } else {
      // Existing unit - compare with original values
      const hasChanges = (
        watchedValues.name !== unit.name ||
        watchedValues.symbol !== unit.symbol ||
        watchedValues.category !== unit.category ||
        watchedValues.isActive !== unit.isActive
      )
      setHasUnsavedChanges(hasChanges)
    }
  }, [watchedValues, unit])

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && hasUnsavedChanges && form.formState.isValid) {
      const timer = setTimeout(() => {
        handleSubmit(watchedValues)
      }, 2000) // Auto-save after 2 seconds of inactivity

      return () => clearTimeout(timer)
    }
  }, [autoSave, hasUnsavedChanges, form.formState.isValid, watchedValues])

  // Enhanced submit handler
  const handleSubmit = useCallback(async (data: UnitFormData) => {
    if (isSubmitting) return

    try {
      setIsSubmitting(true)

      // Simulate API call with validation
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Check for duplicate symbols (mock validation)
      if (data.symbol === 'DUPLICATE') {
        form.setError('symbol', {
          type: 'manual',
          message: 'This symbol already exists. Please choose a different symbol.'
        })
        return
      }

      onSuccess?.(data)
      setHasUnsavedChanges(false)

      toast.success(
        unit ? 'Unit updated successfully!' : 'Unit created successfully!',
        {
          duration: 3000,
          description: `${data.symbol} - ${data.name} has been saved.`
        }
      )
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      toast.error('Failed to save unit', {
        description: errorMessage
      })
      console.error('Form submission error:', error)
    } finally {
      setIsSubmitting(false)
    }
  }, [isSubmitting, onSuccess, unit, form])

  // Enhanced cancel handler
  const handleCancel = useCallback(() => {
    onCancel?.()
  }, [onCancel])

  // Field validation on blur
  const handleFieldBlur = useCallback((fieldName: string) => {
    setValidationTouched(prev => ({ ...prev, [fieldName]: true }))
    form.trigger(fieldName as keyof UnitFormData)
    
    // Update field error state
    const fieldError = form.formState.errors[fieldName as keyof UnitFormData]
    setFieldErrors(prev => ({ 
      ...prev, 
      [fieldName]: !!fieldError 
    }))
  }, [form])

  // Reset form to initial state
  const resetForm = useCallback(() => {
    form.reset({
      name: unit?.name || "",
      symbol: unit?.symbol || "",
      category: unit?.category || "weight",
      isActive: unit?.isActive ?? true,
    })
    setHasUnsavedChanges(false)
    setFieldErrors({})
    setValidationTouched({})
  }, [form, unit])

  // Validate specific field
  const validateField = useCallback(async (fieldName: keyof UnitFormData): Promise<boolean> => {
    return await form.trigger(fieldName)
  }, [form])

  // Get field state information
  const getFieldState = useCallback((fieldName: keyof UnitFormData) => {
    const error = form.formState.errors[fieldName]
    const isTouched = validationTouched[fieldName] || form.formState.touchedFields[fieldName]

    return {
      hasError: !!error,
      isValid: !error && !!isTouched,
      isTouched: !!isTouched,
      errorMessage: error?.message,
    }
  }, [form.formState.errors, form.formState.touchedFields, validationTouched])

  return {
    form,
    isSubmitting,
    hasUnsavedChanges,
    fieldErrors,
    validationTouched,
    handleSubmit,
    handleCancel,
    handleFieldBlur,
    resetForm,
    validateField,
    getFieldState,
  }
}

// Validation utilities
export const unitValidationUtils = {
  // Check if symbol format is valid
  isValidSymbol: (symbol: string): boolean => {
    return /^[A-Za-z0-9_-]+$/.test(symbol) && symbol.trim() === symbol
  },

  // Format symbol
  formatSymbol: (symbol: string): string => {
    return symbol.trim().replace(/[^A-Za-z0-9_-]/g, '')
  },

  // Check if name has valid length and content
  isValidName: (name: string): boolean => {
    return name.trim().length > 0 && name.length <= 50
  },

  // Get unit category display info
  getUnitCategoryInfo: (category: UnitFormData['category']) => {
    const categoryInfo = {
      weight: {
        label: 'Weight',
        description: 'Mass and weight measurements',
        icon: '⚖️',
      },
      volume: {
        label: 'Volume',
        description: 'Volume and capacity measurements',
        icon: '🧪',
      },
      length: {
        label: 'Length',
        description: 'Distance and length measurements',
        icon: '📏',
      },
      count: {
        label: 'Count',
        description: 'Discrete counting units',
        icon: '🔢',
      },
      time: {
        label: 'Time',
        description: 'Time duration measurements',
        icon: '⏱️',
      },
      temperature: {
        label: 'Temperature',
        description: 'Temperature measurements',
        icon: '🌡️',
      },
      serving: {
        label: 'Serving',
        description: 'Portion/serving measurements',
        icon: '🍽️',
      },
    }
    return categoryInfo[category]
  },

  // Character count helper
  getCharacterCount: (value: string, max: number) => {
    const current = value.length
    const percentage = (current / max) * 100
    return {
      current,
      max,
      percentage,
      isNearLimit: percentage >= 80,
      isOverLimit: percentage >= 100,
      remaining: max - current,
    }
  },
}

// Form field configurations
export const unitFormFields = {
  name: {
    label: 'Unit Name',
    placeholder: 'e.g., Kilogram, Liter, Piece',
    helpText: 'Full descriptive name of the unit (e.g., Kilogram, Liter, Piece). Used in user interfaces and reports.',
    maxLength: 50,
    required: true,
  },
  symbol: {
    label: 'Unit Symbol',
    placeholder: 'e.g., kg, L, pc',
    helpText: 'A short identifier for the unit (e.g., kg, L, pc). Letters, numbers, hyphens, and underscores allowed.',
    maxLength: 10,
    required: true,
  },
  category: {
    label: 'Unit Category',
    helpText: 'Category that determines the measurement type: Weight, Volume, Length, Count, Time, or Temperature.',
    required: true,
    options: [
      { value: 'weight', label: 'Weight', description: 'Mass and weight measurements' },
      { value: 'volume', label: 'Volume', description: 'Volume and capacity measurements' },
      { value: 'length', label: 'Length', description: 'Distance and length measurements' },
      { value: 'count', label: 'Count', description: 'Discrete counting units' },
      { value: 'time', label: 'Time', description: 'Time duration measurements' },
      { value: 'temperature', label: 'Temperature', description: 'Temperature measurements' },
      { value: 'serving', label: 'Serving', description: 'Portion/serving measurements' },
    ],
  },
  isActive: {
    label: 'Active Status',
    helpText: 'Active units can be used throughout the system. Inactive units are hidden from selection lists but preserved for historical data.',
    required: false,
  },
} as const