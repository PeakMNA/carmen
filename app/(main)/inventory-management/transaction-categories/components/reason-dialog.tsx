/**
 * ============================================================================
 * REASON DIALOG COMPONENT
 * ============================================================================
 *
 * Modal dialog for creating or editing transaction reasons.
 * Used within the category detail page to manage reasons.
 *
 * FEATURES:
 * - Create new reason with all fields
 * - Edit existing reason
 * - Form validation
 * - Controlled open state
 *
 * ============================================================================
 */

'use client'

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
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
import type { TransactionReason } from "@/lib/types/transaction-category"

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface ReasonDialogProps {
  /** Whether the dialog is open */
  open: boolean
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void
  /** Existing reason for edit mode, null for create mode */
  reason: TransactionReason | null
  /** Parent category ID */
  categoryId: string
  /** Called when form is saved */
  onSave: (data: ReasonFormData) => Promise<void>
}

export interface ReasonFormData {
  code: string
  name: string
  description: string
  sortOrder: number
  isActive: boolean
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ReasonDialog({
  open,
  onOpenChange,
  reason,
  categoryId,
  onSave,
}: ReasonDialogProps) {
  const isEditMode = !!reason

  // Form state
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formData, setFormData] = useState<ReasonFormData>({
    code: "",
    name: "",
    description: "",
    sortOrder: 1,
    isActive: true,
  })

  // Reset form when dialog opens/closes or reason changes
  useEffect(() => {
    if (open) {
      if (reason) {
        setFormData({
          code: reason.code,
          name: reason.name,
          description: reason.description || "",
          sortOrder: reason.sortOrder,
          isActive: reason.isActive,
        })
      } else {
        setFormData({
          code: "",
          name: "",
          description: "",
          sortOrder: 1,
          isActive: true,
        })
      }
      setErrors({})
    }
  }, [open, reason])

  // Validation
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

    if (formData.sortOrder < 1 || formData.sortOrder > 999) {
      newErrors.sortOrder = "Sort order must be between 1 and 999"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle save
  const handleSave = async () => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (error) {
      console.error("Error saving reason:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Reason" : "Add Reason"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Update the reason details below."
              : "Fill in the details to create a new reason."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Code */}
          <div className="space-y-2">
            <Label htmlFor="reason-code">Code *</Label>
            <Input
              id="reason-code"
              placeholder="e.g., DMG"
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
            <Label htmlFor="reason-name">Name *</Label>
            <Input
              id="reason-name"
              placeholder="e.g., Damaged Goods"
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

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="reason-description">Description</Label>
            <Textarea
              id="reason-description"
              placeholder="Describe when this reason should be used..."
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
              <Label htmlFor="reason-sortOrder">Sort Order</Label>
              <Input
                id="reason-sortOrder"
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
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <div className="flex items-center space-x-2 pt-2">
                <Switch
                  id="reason-isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({ ...prev, isActive: checked }))
                  }
                />
                <Label htmlFor="reason-isActive" className="cursor-pointer">
                  {formData.isActive ? "Active" : "Inactive"}
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving
              ? "Saving..."
              : isEditMode
                ? "Save Changes"
                : "Add Reason"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
