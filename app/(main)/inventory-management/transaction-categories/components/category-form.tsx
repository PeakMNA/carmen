/**
 * ============================================================================
 * CATEGORY FORM COMPONENT
 * ============================================================================
 *
 * Shared form component for creating and editing transaction categories.
 * Used by both the new category page and the edit category page.
 *
 * FEATURES:
 * - Type selection (IN/OUT) with visual cards
 * - Code and name inputs
 * - GL Account mapping fields
 * - Description (optional)
 * - Sort order
 * - Active/Inactive toggle
 * - Form validation
 *
 * ============================================================================
 */

'use client'

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  ArrowUpCircle,
  ArrowDownCircle,
  Check,
  Save,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type {
  TransactionCategory,
  AdjustmentType,
} from "@/lib/types/transaction-category"

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface CategoryFormProps {
  /** Existing category for edit mode, undefined for create mode */
  category?: TransactionCategory
  /** Pre-selected type from URL query param */
  preselectedType?: AdjustmentType
  /** Called when form is saved */
  onSave?: (data: CategoryFormData) => Promise<void>
}

export interface CategoryFormData {
  code: string
  name: string
  type: AdjustmentType
  glAccountCode: string
  glAccountName: string
  description: string
  sortOrder: number
  isActive: boolean
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CategoryForm({
  category,
  preselectedType,
  onSave,
}: CategoryFormProps) {
  const router = useRouter()
  const isEditMode = !!category

  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [isSaving, setIsSaving] = useState(false)
  const [showDiscardDialog, setShowDiscardDialog] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [formData, setFormData] = useState<CategoryFormData>({
    code: category?.code || "",
    name: category?.name || "",
    type: category?.type || preselectedType || "OUT",
    glAccountCode: category?.glAccountCode || "",
    glAccountName: category?.glAccountName || "",
    description: category?.description || "",
    sortOrder: category?.sortOrder || 1,
    isActive: category?.isActive ?? true,
  })

  // Type is locked in edit mode or when pre-selected from URL
  const isTypeLocked = isEditMode || !!preselectedType

  // ============================================================================
  // VALIDATION
  // ============================================================================

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.code.trim()) {
      newErrors.code = "Code is required"
    } else if (formData.code.length > 10) {
      newErrors.code = "Code must be 10 characters or less"
    }

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.glAccountCode.trim()) {
      newErrors.glAccountCode = "GL Account Code is required"
    }

    if (!formData.glAccountName.trim()) {
      newErrors.glAccountName = "GL Account Name is required"
    }

    if (formData.sortOrder < 1 || formData.sortOrder > 999) {
      newErrors.sortOrder = "Sort order must be between 1 and 999"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      if (onSave) {
        await onSave(formData)
      } else {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        console.log("Saving category:", formData)
      }
      router.push("/inventory-management/transaction-categories")
    } catch (error) {
      console.error("Error saving category:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleTypeChange = (type: AdjustmentType) => {
    if (!isTypeLocked) {
      setFormData(prev => ({ ...prev, type }))
    }
  }

  const hasChanges =
    formData.code !== (category?.code || "") ||
    formData.name !== (category?.name || "") ||
    formData.glAccountCode !== (category?.glAccountCode || "") ||
    formData.glAccountName !== (category?.glAccountName || "") ||
    formData.description !== (category?.description || "") ||
    formData.sortOrder !== (category?.sortOrder || 1) ||
    formData.isActive !== (category?.isActive ?? true)

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() =>
                hasChanges ? setShowDiscardDialog(true) : router.back()
              }
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">
                {isEditMode ? "Edit Category" : "New Category"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isEditMode
                  ? `Editing ${category.name}`
                  : "Create a new transaction category"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() =>
                hasChanges ? setShowDiscardDialog(true) : router.back()
              }
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              <Save className="h-4 w-4 mr-2" />
              {isSaving ? "Saving..." : "Save Category"}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6 max-w-3xl mx-auto w-full">
        {/* Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category Type</CardTitle>
            {isTypeLocked && (
              <p className="text-sm text-muted-foreground">
                Type cannot be changed {isEditMode ? "after creation" : ""}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => handleTypeChange("OUT")}
                disabled={isTypeLocked}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
                  formData.type === "OUT"
                    ? "border-red-500 bg-red-50"
                    : "border-muted hover:border-muted-foreground/30",
                  isTypeLocked && "cursor-not-allowed opacity-60"
                )}
              >
                <div
                  className={cn(
                    "p-3 rounded-lg",
                    formData.type === "OUT" ? "bg-red-100" : "bg-muted"
                  )}
                >
                  <ArrowDownCircle
                    className={cn(
                      "h-6 w-6",
                      formData.type === "OUT"
                        ? "text-red-600"
                        : "text-muted-foreground"
                    )}
                  />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Stock Out</div>
                  <div className="text-sm text-muted-foreground">
                    Decrease inventory
                  </div>
                </div>
                {formData.type === "OUT" && (
                  <Check className="h-5 w-5 text-red-600 ml-auto" />
                )}
              </button>

              <button
                type="button"
                onClick={() => handleTypeChange("IN")}
                disabled={isTypeLocked}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-lg border-2 transition-all",
                  formData.type === "IN"
                    ? "border-green-500 bg-green-50"
                    : "border-muted hover:border-muted-foreground/30",
                  isTypeLocked && "cursor-not-allowed opacity-60"
                )}
              >
                <div
                  className={cn(
                    "p-3 rounded-lg",
                    formData.type === "IN" ? "bg-green-100" : "bg-muted"
                  )}
                >
                  <ArrowUpCircle
                    className={cn(
                      "h-6 w-6",
                      formData.type === "IN"
                        ? "text-green-600"
                        : "text-muted-foreground"
                    )}
                  />
                </div>
                <div className="text-left">
                  <div className="font-semibold">Stock In</div>
                  <div className="text-sm text-muted-foreground">
                    Increase inventory
                  </div>
                </div>
                {formData.type === "IN" && (
                  <Check className="h-5 w-5 text-green-600 ml-auto" />
                )}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Category Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  placeholder="e.g., WST"
                  value={formData.code}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      code: e.target.value.toUpperCase(),
                    }))
                  }
                  maxLength={10}
                  className={cn(
                    "font-mono",
                    errors.code && "border-red-500"
                  )}
                />
                {errors.code && (
                  <p className="text-sm text-red-500">{errors.code}</p>
                )}
              </div>

              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Wastage"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>
            </div>

            {/* GL Account */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="glAccountCode">GL Account Code *</Label>
                <Input
                  id="glAccountCode"
                  placeholder="e.g., 5200"
                  value={formData.glAccountCode}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      glAccountCode: e.target.value,
                    }))
                  }
                  className={cn(
                    "font-mono",
                    errors.glAccountCode && "border-red-500"
                  )}
                />
                {errors.glAccountCode && (
                  <p className="text-sm text-red-500">{errors.glAccountCode}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="glAccountName">GL Account Name *</Label>
                <Input
                  id="glAccountName"
                  placeholder="e.g., Waste Expense"
                  value={formData.glAccountName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      glAccountName: e.target.value,
                    }))
                  }
                  className={errors.glAccountName ? "border-red-500" : ""}
                />
                {errors.glAccountName && (
                  <p className="text-sm text-red-500">{errors.glAccountName}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe when this category should be used..."
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                rows={2}
              />
            </div>

            {/* Sort Order and Active Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sortOrder">Sort Order</Label>
                <Input
                  id="sortOrder"
                  type="number"
                  min={1}
                  max={999}
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      sortOrder: parseInt(e.target.value) || 1,
                    }))
                  }
                  className={errors.sortOrder ? "border-red-500" : ""}
                />
                {errors.sortOrder && (
                  <p className="text-sm text-red-500">{errors.sortOrder}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  Lower numbers appear first in dropdowns
                </p>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, isActive: checked }))
                    }
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    {formData.isActive ? "Active" : "Inactive"}
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground">
                  Inactive categories won&apos;t appear in adjustment forms
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Discard Dialog */}
      <Dialog open={showDiscardDialog} onOpenChange={setShowDiscardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Discard Changes?</DialogTitle>
            <DialogDescription>
              You have unsaved changes. Are you sure you want to leave? Your
              changes will be lost.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDiscardDialog(false)}
            >
              Continue Editing
            </Button>
            <Button variant="destructive" onClick={() => router.back()}>
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
