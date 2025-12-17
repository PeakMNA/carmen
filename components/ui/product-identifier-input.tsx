"use client"

/**
 * Product Identifier Input Component
 *
 * Single input field for combined product identifier
 * Format: "ITEM_CODE - ITEM_NAME"
 * Example: "BE-001 - Beach Umbrella - Large"
 *
 * Features:
 * - Format validation
 * - Real-time format checking
 * - Visual feedback for valid/invalid format
 * - Automatic parsing into code and name parts
 *
 * Created: 2025-11-17 - Per ARC-2410-001
 */

import * as React from "react"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export interface ProductIdentifierValue {
  full: string
  code?: string
  name?: string
  isValid: boolean
}

interface ProductIdentifierInputProps {
  value?: string
  onChange: (value: ProductIdentifierValue) => void
  disabled?: boolean
  className?: string
  label?: string
  placeholder?: string
  required?: boolean
  error?: string
  showValidation?: boolean
}

/**
 * Parse product identifier into code and name
 * Format: "CODE - NAME"
 */
function parseProductIdentifier(value: string): ProductIdentifierValue {
  const trimmed = value.trim()

  if (!trimmed) {
    return { full: "", isValid: false }
  }

  // Check for " - " separator
  const parts = trimmed.split(" - ")

  if (parts.length < 2) {
    return { full: trimmed, isValid: false }
  }

  const code = parts[0].trim()
  const name = parts.slice(1).join(" - ").trim() // Handle multiple " - " in name

  const isValid = code.length > 0 && name.length > 0

  return {
    full: trimmed,
    code,
    name,
    isValid
  }
}

export function ProductIdentifierInput({
  value = "",
  onChange,
  disabled = false,
  className,
  label = "Product Identifier",
  placeholder = "e.g., BE-001 - Beach Umbrella - Large",
  required = false,
  error,
  showValidation = true
}: ProductIdentifierInputProps) {
  const [inputValue, setInputValue] = React.useState(value)
  const [isFocused, setIsFocused] = React.useState(false)

  const parsed = React.useMemo(() => parseProductIdentifier(inputValue), [inputValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange(parseProductIdentifier(newValue))
  }

  const showError = error || (showValidation && inputValue && !isFocused && !parsed.isValid)
  const showSuccess = showValidation && inputValue && !isFocused && parsed.isValid

  return (
    <div className={cn("grid gap-2", className)}>
      <Label htmlFor="product-identifier" className="flex items-center gap-2">
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>

      <div className="relative">
        <Input
          id="product-identifier"
          type="text"
          value={inputValue}
          onChange={handleChange}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder={placeholder}
          className={cn(
            showError && "border-destructive pr-10",
            showSuccess && "border-green-500 pr-10"
          )}
          aria-invalid={!!showError}
          aria-describedby={showError ? "product-identifier-error" : undefined}
        />

        {/* Validation icon */}
        {showValidation && inputValue && !isFocused && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {parsed.isValid ? (
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            ) : (
              <AlertCircle className="h-4 w-4 text-destructive" />
            )}
          </div>
        )}
      </div>

      {/* Error message */}
      {showError && (
        <p id="product-identifier-error" className="text-sm text-destructive">
          {error || "Format must be: CODE - NAME (e.g., BE-001 - Beach Umbrella)"}
        </p>
      )}

      {/* Success/parsed display */}
      {showSuccess && (
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Code:</span> {parsed.code}
          <span className="mx-2">•</span>
          <span className="font-medium text-foreground">Name:</span> {parsed.name}
        </div>
      )}

      {/* Helper text */}
      {!error && !inputValue && (
        <p className="text-sm text-muted-foreground">
          Enter product code and name separated by " - " (space-hyphen-space)
        </p>
      )}
    </div>
  )
}

/**
 * Read-only product identifier display
 */
export function ProductIdentifierDisplay({
  value,
  className,
  showParsed = false
}: {
  value: string
  className?: string
  showParsed?: boolean
}) {
  const parsed = parseProductIdentifier(value)

  if (showParsed && parsed.isValid) {
    return (
      <div className={cn("space-y-1", className)}>
        <div className="font-medium">{parsed.full}</div>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">Code:</span> {parsed.code}
          <span className="mx-2">•</span>
          <span className="font-medium text-foreground">Name:</span> {parsed.name}
        </div>
      </div>
    )
  }

  return (
    <span className={cn("font-medium", className)}>
      {value || "—"}
    </span>
  )
}
