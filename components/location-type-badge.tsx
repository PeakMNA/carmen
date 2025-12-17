/**
 * Location Type Badge Component
 *
 * Displays a badge indicating the inventory location type with appropriate
 * styling and optional icon. Used throughout Store Operations modules to
 * provide visual indication of how inventory is handled at each location.
 *
 * Location Types:
 * - INVENTORY: Full tracking (default badge, Package icon)
 * - DIRECT: Immediate expense (secondary badge, DollarSign icon)
 * - CONSIGNMENT: Vendor-owned (outline badge, Truck icon)
 */

import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { InventoryLocationType } from '@/lib/types/location-management'
import {
  getLocationTypeLabel,
  getLocationTypeDescription,
  getLocationTypeBehaviorSummary,
  getLocationTypeBadgeVariant,
} from '@/lib/utils/location-type-helpers'
import { Package, DollarSign, Truck, type LucideIcon } from 'lucide-react'

/**
 * Props for LocationTypeBadge component
 */
interface LocationTypeBadgeProps {
  /** The location type to display */
  locationType: InventoryLocationType
  /** Whether to show the icon (default: true) */
  showIcon?: boolean
  /** Whether to show a tooltip with description (default: false) */
  showTooltip?: boolean
  /** Whether to show full description instead of label (default: false) */
  showDescription?: boolean
  /** Additional CSS classes */
  className?: string
  /** Size variant */
  size?: 'sm' | 'default' | 'lg'
}

/**
 * Icon mapping for location types
 */
const LOCATION_TYPE_ICONS: Record<InventoryLocationType, LucideIcon> = {
  [InventoryLocationType.INVENTORY]: Package,
  [InventoryLocationType.DIRECT]: DollarSign,
  [InventoryLocationType.CONSIGNMENT]: Truck,
}

/**
 * Size classes for icons
 */
const ICON_SIZE_CLASSES = {
  sm: 'h-3 w-3',
  default: 'h-3.5 w-3.5',
  lg: 'h-4 w-4',
}

/**
 * LocationTypeBadge Component
 *
 * Renders a styled badge indicating the inventory location type.
 * Optionally includes an icon and tooltip with detailed description.
 *
 * @example
 * // Basic usage
 * <LocationTypeBadge locationType={InventoryLocationType.INVENTORY} />
 *
 * @example
 * // With tooltip
 * <LocationTypeBadge
 *   locationType={InventoryLocationType.DIRECT}
 *   showTooltip
 * />
 *
 * @example
 * // Without icon
 * <LocationTypeBadge
 *   locationType={InventoryLocationType.CONSIGNMENT}
 *   showIcon={false}
 * />
 */
export function LocationTypeBadge({
  locationType,
  showIcon = true,
  showTooltip = false,
  showDescription = false,
  className = '',
  size = 'default',
}: LocationTypeBadgeProps) {
  const Icon = LOCATION_TYPE_ICONS[locationType]
  const variant = getLocationTypeBadgeVariant(locationType)
  const label = getLocationTypeLabel(locationType)
  const description = getLocationTypeDescription(locationType)
  const iconSizeClass = ICON_SIZE_CLASSES[size]

  const badgeContent = (
    <Badge variant={variant} className={`flex items-center gap-1 ${className}`}>
      {showIcon && <Icon className={iconSizeClass} />}
      <span>{showDescription ? description : label}</span>
    </Badge>
  )

  if (showTooltip) {
    const behaviorSummary = getLocationTypeBehaviorSummary(locationType)
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{badgeContent}</TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p className="font-medium">{label}</p>
            <p className="text-xs text-muted-foreground mt-1">{behaviorSummary}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return badgeContent
}

/**
 * LocationTypeIndicator Component
 *
 * A more detailed indicator showing location type with description.
 * Used in detail views and forms where more context is helpful.
 */
interface LocationTypeIndicatorProps {
  /** The location type to display */
  locationType: InventoryLocationType
  /** Additional CSS classes */
  className?: string
}

export function LocationTypeIndicator({
  locationType,
  className = '',
}: LocationTypeIndicatorProps) {
  const Icon = LOCATION_TYPE_ICONS[locationType]
  const label = getLocationTypeLabel(locationType)
  const description = getLocationTypeDescription(locationType)
  const variant = getLocationTypeBadgeVariant(locationType)

  return (
    <div className={`flex items-start gap-2 ${className}`}>
      <Badge variant={variant} className="flex items-center gap-1">
        <Icon className="h-3.5 w-3.5" />
        <span>{label}</span>
      </Badge>
      <span className="text-sm text-muted-foreground">{description}</span>
    </div>
  )
}

/**
 * LocationTypeAlert Component
 *
 * An alert-style component for showing location type behavior warnings.
 * Used when the location type affects how an operation will be processed.
 */
interface LocationTypeAlertProps {
  /** The location type */
  locationType: InventoryLocationType
  /** The operation context (e.g., 'issue', 'grn', 'wastage') */
  operationContext: 'issue' | 'grn' | 'credit_note' | 'wastage' | 'transfer'
  /** Additional CSS classes */
  className?: string
}

/**
 * Alert messages for different operations by location type
 */
const ALERT_MESSAGES: Record<
  LocationTypeAlertProps['operationContext'],
  Record<InventoryLocationType, { title: string; message: string } | null>
> = {
  issue: {
    [InventoryLocationType.INVENTORY]: null, // No alert needed for standard
    [InventoryLocationType.DIRECT]: {
      title: 'Direct Expense Location',
      message: 'Items will be recorded for metrics only. No inventory movement will be created as items were already expensed on receipt.',
    },
    [InventoryLocationType.CONSIGNMENT]: {
      title: 'Consignment Location',
      message: 'Vendor will be notified of consumption. Vendor liability will be updated.',
    },
  },
  grn: {
    [InventoryLocationType.INVENTORY]: null,
    [InventoryLocationType.DIRECT]: {
      title: 'Direct Expense Location',
      message: 'Items will be expensed immediately. No inventory balance will be created.',
    },
    [InventoryLocationType.CONSIGNMENT]: {
      title: 'Consignment Location',
      message: 'Items will be recorded as vendor-owned inventory. Vendor liability will be created.',
    },
  },
  credit_note: {
    [InventoryLocationType.INVENTORY]: null,
    [InventoryLocationType.DIRECT]: {
      title: 'Direct Expense Location',
      message: 'Expense reversal only. No inventory adjustment will be made.',
    },
    [InventoryLocationType.CONSIGNMENT]: {
      title: 'Consignment Location',
      message: 'Vendor liability will be reduced. Consignment balance will be adjusted.',
    },
  },
  wastage: {
    [InventoryLocationType.INVENTORY]: null,
    [InventoryLocationType.DIRECT]: {
      title: 'Direct Expense Location',
      message: 'Wastage will be recorded for metrics only. No inventory adjustment needed (items already expensed).',
    },
    [InventoryLocationType.CONSIGNMENT]: {
      title: 'Consignment Location',
      message: 'Vendor charge-back will be created. Vendor will be notified of wastage.',
    },
  },
  transfer: {
    [InventoryLocationType.INVENTORY]: null,
    [InventoryLocationType.DIRECT]: {
      title: 'Direct Expense Location',
      message: 'Cannot transfer to/from Direct Expense locations. Items are expensed immediately on receipt.',
    },
    [InventoryLocationType.CONSIGNMENT]: {
      title: 'Consignment Location',
      message: 'Vendor notification required for consignment inventory transfers.',
    },
  },
}

export function LocationTypeAlert({
  locationType,
  operationContext,
  className = '',
}: LocationTypeAlertProps) {
  const alertConfig = ALERT_MESSAGES[operationContext][locationType]

  // No alert needed for this combination
  if (!alertConfig) return null

  const Icon = LOCATION_TYPE_ICONS[locationType]
  const variant = locationType === InventoryLocationType.DIRECT ? 'secondary' : 'outline'

  return (
    <div
      className={`rounded-lg border p-4 ${
        locationType === InventoryLocationType.DIRECT
          ? 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950'
          : 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950'
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`h-5 w-5 mt-0.5 ${
            locationType === InventoryLocationType.DIRECT
              ? 'text-amber-600 dark:text-amber-400'
              : 'text-blue-600 dark:text-blue-400'
          }`}
        />
        <div>
          <p
            className={`font-medium ${
              locationType === InventoryLocationType.DIRECT
                ? 'text-amber-800 dark:text-amber-200'
                : 'text-blue-800 dark:text-blue-200'
            }`}
          >
            {alertConfig.title}
          </p>
          <p
            className={`text-sm mt-1 ${
              locationType === InventoryLocationType.DIRECT
                ? 'text-amber-700 dark:text-amber-300'
                : 'text-blue-700 dark:text-blue-300'
            }`}
          >
            {alertConfig.message}
          </p>
        </div>
      </div>
    </div>
  )
}

export default LocationTypeBadge
