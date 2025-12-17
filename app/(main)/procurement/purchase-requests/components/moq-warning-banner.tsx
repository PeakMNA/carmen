"use client"

import { useState } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible"
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Package,
  RefreshCw,
  X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { MOQAlert, PRItemPriceComparison } from "@/lib/types"

// =============================================================================
// Component Types
// =============================================================================

interface MOQWarningBannerProps {
  /** The price comparison containing MOQ alerts */
  comparison: PRItemPriceComparison

  /** Callback when user clicks to adjust quantity */
  onAdjustQuantity?: (suggestedQuantity: number) => void

  /** Callback when user dismisses the warning */
  onDismiss?: () => void

  /** Whether to show the dismiss button */
  dismissible?: boolean

  /** Compact mode for inline display */
  compact?: boolean

  /** Custom class name */
  className?: string
}

// =============================================================================
// Helper Functions
// =============================================================================

function getSeverityStyles(severity: MOQAlert['severity']) {
  switch (severity) {
    case 'error':
      return {
        container: 'bg-red-50 border-red-200 text-red-800',
        icon: 'text-red-600',
        badge: 'bg-red-100 text-red-700 border-red-200'
      }
    case 'warning':
      return {
        container: 'bg-amber-50 border-amber-200 text-amber-800',
        icon: 'text-amber-600',
        badge: 'bg-amber-100 text-amber-700 border-amber-200'
      }
    case 'info':
    default:
      return {
        container: 'bg-blue-50 border-blue-200 text-blue-800',
        icon: 'text-blue-600',
        badge: 'bg-blue-100 text-blue-700 border-blue-200'
      }
  }
}

function getOverallSeverity(alerts: MOQAlert[]): MOQAlert['severity'] {
  if (alerts.some(a => a.severity === 'error')) return 'error'
  if (alerts.some(a => a.severity === 'warning')) return 'warning'
  return 'info'
}

// =============================================================================
// Sub-Components
// =============================================================================

interface AlertItemProps {
  alert: MOQAlert
  onAdjust?: (quantity: number) => void
  compact?: boolean
}

function AlertItem({ alert, onAdjust, compact }: AlertItemProps) {
  const styles = getSeverityStyles(alert.severity)

  if (compact) {
    return (
      <div className="flex items-center justify-between py-1.5 text-sm">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={styles.badge}>
            {alert.vendorName}
          </Badge>
          <span>
            Need <strong>{alert.gapInBaseUnit.toFixed(1)} {alert.baseUnit}</strong> more
          </span>
        </div>
        {onAdjust && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => onAdjust(alert.suggestedQuantity)}
          >
            Adjust to {alert.suggestedQuantity} {alert.baseUnit}
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-start justify-between p-3 bg-white/50 rounded-lg border border-current/10">
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full",
          alert.severity === 'error' ? 'bg-red-100' :
          alert.severity === 'warning' ? 'bg-amber-100' : 'bg-blue-100'
        )}>
          <Package className={cn("h-4 w-4", styles.icon)} />
        </div>
        <div>
          <div className="font-medium">{alert.vendorName}</div>
          <div className="text-sm opacity-80">
            Minimum order: <strong>{alert.suggestedQuantity} {alert.baseUnit}</strong>
          </div>
          <div className="text-sm opacity-80">
            Gap: <strong>{alert.gapInBaseUnit.toFixed(2)} {alert.baseUnit}</strong> needed
          </div>
        </div>
      </div>
      {onAdjust && (
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => onAdjust(alert.suggestedQuantity)}
        >
          <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
          Adjust to {alert.suggestedQuantity} {alert.baseUnit}
        </Button>
      )}
    </div>
  )
}

// =============================================================================
// Main Component
// =============================================================================

export function MOQWarningBanner({
  comparison,
  onAdjustQuantity,
  onDismiss,
  dismissible = false,
  compact = false,
  className
}: MOQWarningBannerProps) {
  const [isDismissed, setIsDismissed] = useState(false)
  const [isExpanded, setIsExpanded] = useState(!compact)

  // Don't render if no warnings or dismissed
  if (isDismissed || !comparison.hasMOQWarnings || comparison.moqAlerts.length === 0) {
    return null
  }

  const alerts = comparison.moqAlerts
  const overallSeverity = getOverallSeverity(alerts)
  const styles = getSeverityStyles(overallSeverity)

  // Find the minimum quantity to satisfy at least one vendor
  const minSuggested = Math.min(...alerts.map(a => a.suggestedQuantity))

  const handleDismiss = () => {
    setIsDismissed(true)
    onDismiss?.()
  }

  const handleAdjust = (quantity: number) => {
    onAdjustQuantity?.(quantity)
  }

  // Compact inline version
  if (compact) {
    return (
      <div className={cn(
        "rounded-lg border p-3",
        styles.container,
        className
      )}>
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className={cn("h-4 w-4", styles.icon)} />
              <span className="font-medium text-sm">
                Quantity Alert
              </span>
              <Badge variant="outline" className={cn("text-xs", styles.badge)}>
                {alerts.length} vendor{alerts.length !== 1 ? 's' : ''}
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              {onAdjustQuantity && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleAdjust(minSuggested)}
                >
                  Quick adjust to {minSuggested} {comparison.baseUnit}
                </Button>
              )}
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              {dismissible && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={handleDismiss}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>

          <CollapsibleContent>
            <div className="mt-2 pt-2 border-t border-current/10 space-y-1">
              {alerts.map((alert) => (
                <AlertItem
                  key={alert.vendorId}
                  alert={alert}
                  onAdjust={onAdjustQuantity ? handleAdjust : undefined}
                  compact
                />
              ))}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    )
  }

  // Full banner version
  return (
    <Alert className={cn(styles.container, "border", className)}>
      <AlertTriangle className={cn("h-5 w-5", styles.icon)} />

      <div className="flex-1">
        <AlertTitle className="flex items-center gap-2">
          Quantity Alert
          {comparison.allVendorsFailMOQ && (
            <Badge variant="outline" className={cn("text-xs", styles.badge)}>
              All vendors affected
            </Badge>
          )}
        </AlertTitle>

        <AlertDescription className="mt-2">
          <p className="mb-3">
            Your requested quantity (<strong>{comparison.requestedQuantityInBaseUnit.toFixed(1)} {comparison.baseUnit}</strong>)
            does not meet the minimum order for {alerts.length === comparison.totalVendors ? 'any' : 'some'} vendors:
          </p>

          <div className="space-y-2">
            {alerts.map((alert) => (
              <AlertItem
                key={alert.vendorId}
                alert={alert}
                onAdjust={onAdjustQuantity ? handleAdjust : undefined}
              />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-current/10">
            {onAdjustQuantity && (
              <Button
                variant="default"
                size="sm"
                onClick={() => handleAdjust(minSuggested)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Adjust to {minSuggested} {comparison.baseUnit}
              </Button>
            )}

            {comparison.vendorsMeetingMOQ > 0 && (
              <Button variant="outline" size="sm">
                Show {comparison.vendorsMeetingMOQ} alternative vendor{comparison.vendorsMeetingMOQ !== 1 ? 's' : ''}
              </Button>
            )}

            {dismissible && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={handleDismiss}
              >
                Dismiss
              </Button>
            )}
          </div>
        </AlertDescription>
      </div>
    </Alert>
  )
}

// =============================================================================
// Critical MOQ Block Banner
// =============================================================================

interface CriticalMOQBlockProps {
  comparison: PRItemPriceComparison
  onAdjustQuantity?: (quantity: number) => void
  className?: string
}

/**
 * A blocking banner shown when ALL vendors fail MOQ and submission should be blocked.
 */
export function CriticalMOQBlock({
  comparison,
  onAdjustQuantity,
  className
}: CriticalMOQBlockProps) {
  if (!comparison.allVendorsFailMOQ) return null

  const minRequired = Math.min(...comparison.moqAlerts.map(a => a.suggestedQuantity))

  return (
    <Alert className={cn(
      "bg-red-50 border-red-300 text-red-800",
      className
    )}>
      <AlertTriangle className="h-5 w-5 text-red-600" />

      <AlertTitle className="flex items-center gap-2 text-red-800">
        Cannot Submit - Minimum Order Not Met
      </AlertTitle>

      <AlertDescription className="mt-2 text-red-700">
        <p>
          Your requested quantity of <strong>{comparison.requestedQuantityInBaseUnit.toFixed(1)} {comparison.baseUnit}</strong> does
          not meet the minimum order requirement for any available vendor.
        </p>

        <p className="mt-2">
          The minimum quantity required is <strong>{minRequired} {comparison.baseUnit}</strong>.
        </p>

        {onAdjustQuantity && (
          <Button
            variant="default"
            size="sm"
            className="mt-4 bg-red-600 hover:bg-red-700"
            onClick={() => onAdjustQuantity(minRequired)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Adjust Quantity to {minRequired} {comparison.baseUnit}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}

export default MOQWarningBanner
