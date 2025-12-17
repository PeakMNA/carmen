"use client"

/**
 * Preferred Vendor Indicator Component
 *
 * Visual indicator for preferred vendor items
 * - Star icon for preferred vendors
 * - Tooltip with explanation
 * - Consistent styling
 *
 * Created: 2025-11-17 - Per ARC-2410-001
 */

import * as React from "react"
import { Star } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface PreferredVendorIndicatorProps {
  isPreferred: boolean
  className?: string
  tooltipText?: string
  size?: "sm" | "md" | "lg"
}

export function PreferredVendorIndicator({
  isPreferred,
  className,
  tooltipText = "Preferred vendor for this item - Recommended for procurement",
  size = "md"
}: PreferredVendorIndicatorProps) {
  if (!isPreferred) return null

  const sizeClasses = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5"
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn("inline-flex items-center", className)}>
            <Star
              className={cn(
                sizeClasses[size],
                "fill-yellow-400 text-yellow-400",
                "dark:fill-yellow-500 dark:text-yellow-500"
              )}
              aria-label="Preferred vendor"
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Preferred vendor badge (with text)
 */
export function PreferredVendorBadge({ className }: { className?: string }) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 text-sm font-medium",
      "text-yellow-700 dark:text-yellow-400",
      className
    )}>
      <Star className="h-3 w-3 fill-current" />
      Preferred
    </span>
  )
}
