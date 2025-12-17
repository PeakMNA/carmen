"use client"

/**
 * FOC Badge Component
 *
 * Badge for displaying Free of Charge (FOC) items
 * - Visual indicator for promotional/sample items
 * - Tooltip with explanation
 * - Consistent styling
 *
 * Created: 2025-11-17 - Per ARC-2410-001
 */

import * as React from "react"
import { Gift } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface FOCBadgeProps {
  className?: string
  showIcon?: boolean
  tooltipText?: string
}

export function FOCBadge({
  className,
  showIcon = true,
  tooltipText = "Free of Charge - Promotional or sample item with no cost"
}: FOCBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="secondary"
            className={cn(
              "bg-green-100 text-green-800 hover:bg-green-200 border-green-300",
              "dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/40 dark:border-green-700",
              className
            )}
          >
            {showIcon && <Gift className="mr-1 h-3 w-3" />}
            FOC
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs">{tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

/**
 * Inline FOC indicator (text only, no badge)
 */
export function FOCIndicator({ className }: { className?: string }) {
  return (
    <span className={cn(
      "text-sm font-medium text-green-600 dark:text-green-400",
      className
    )}>
      Free of Charge
    </span>
  )
}
