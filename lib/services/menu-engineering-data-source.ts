/**
 * Menu Engineering Data Source Adapter
 *
 * Provides the join between Sales Consumption (SC) cost data and POS revenue
 * data for the Menu Engineering analytics module. ME components call these
 * functions exclusively — they never import from SC or POS modules directly.
 */

import type { SalesConsumptionLine } from '@/lib/types/sales-consumption'

/**
 * Aggregates the extended cost from posted SC lines, keyed by POS item ID.
 * Pending and reversed lines are excluded — only 'posted' status lines
 * contribute to the cost roll-up.
 */
export function aggregateSCCostByPOSItem(
  lines: SalesConsumptionLine[]
): Record<string, number> {
  return lines
    .filter(l => l.status === 'posted')
    .reduce((acc, line) => {
      acc[line.posItemId] = (acc[line.posItemId] ?? 0) + line.extendedCost
      return acc
    }, {} as Record<string, number>)
}

/**
 * Computes gross margin as a fraction in [0, 1].
 * Returns 0 when revenue is zero to avoid division by zero.
 * Result is clamped to [0, 1] to guard against data anomalies
 * (e.g. cost exceeding revenue).
 */
export function computeGrossMargin(revenue: number, cost: number): number {
  if (revenue === 0) return 0
  return Math.max(0, Math.min(1, (revenue - cost) / revenue))
}

/**
 * Classifies a menu item into the standard Boston Consulting Group /
 * Menu Engineering quadrant.
 *
 * @param margin       - Item gross margin fraction (0–1)
 * @param avgMargin    - Average gross margin across all items (threshold)
 * @param salesCount   - Unit sales count for this item in the period
 * @param avgSalesCount - Average unit sales count across all items (threshold)
 *
 * @returns 'star' | 'plowhorse' | 'puzzle' | 'dog'
 */
export function classifyMenuItemPerformance(
  margin: number,
  avgMargin: number,
  salesCount: number,
  avgSalesCount: number
): 'star' | 'plowhorse' | 'puzzle' | 'dog' {
  const highMargin = margin >= avgMargin
  const highVolume = salesCount >= avgSalesCount

  if (highMargin && highVolume) return 'star'
  if (!highMargin && highVolume) return 'plowhorse'
  if (highMargin && !highVolume) return 'puzzle'
  return 'dog'
}
