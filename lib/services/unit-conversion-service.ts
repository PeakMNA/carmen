/**
 * Unit Conversion Service
 *
 * Handles all unit conversion logic for the PR auto-pricing system.
 * Enables comparison of vendor prices across different selling units
 * by normalizing everything to the product's base inventory unit.
 *
 * Key Features:
 * - Convert quantities between units
 * - Normalize prices to base unit for comparison
 * - Convert MOQ to base unit for validation
 * - Validate if quantities meet MOQ requirements
 */

import {
  ProductUnitConfiguration,
  ProductOrderUnit,
  Money
} from '@/lib/types'

// =============================================================================
// Service Types
// =============================================================================

export interface ConversionResult {
  /** Converted value */
  value: number
  /** Unit the value is in */
  unit: string
  /** Original value before conversion */
  originalValue: number
  /** Original unit */
  originalUnit: string
  /** Conversion factor used */
  conversionFactor: number
}

export interface MOQValidationResult {
  /** Whether the quantity meets the MOQ requirement */
  meetsRequirement: boolean
  /** Gap between requested and required (0 if meets requirement) */
  gap: number
  /** Gap expressed in base unit */
  gapInBaseUnit: number
  /** Percentage of MOQ met (0-100+) */
  percentageMet: number
  /** Suggested quantity to meet MOQ */
  suggestedQuantity: number
}

export interface PriceNormalizationResult {
  /** Normalized price per base unit */
  pricePerBaseUnit: Money
  /** Original price */
  originalPrice: Money
  /** Original unit */
  originalUnit: string
  /** Base unit */
  baseUnit: string
  /** Conversion factor used */
  conversionFactor: number
}

// =============================================================================
// Unit Conversion Service
// =============================================================================

class UnitConversionServiceImpl {
  /**
   * Find the order unit configuration for a given unit code.
   */
  findOrderUnit(
    config: ProductUnitConfiguration,
    unitCode: string
  ): ProductOrderUnit | undefined {
    return config.orderUnits.find(
      u => u.unitCode.toLowerCase() === unitCode.toLowerCase()
    )
  }

  /**
   * Get the default order unit for a product.
   */
  getDefaultOrderUnit(config: ProductUnitConfiguration): ProductOrderUnit | undefined {
    return config.orderUnits.find(u => u.isDefault) || config.orderUnits[0]
  }

  /**
   * Get conversion factor from order unit to base unit.
   * Returns 1.0 if unit not found (assumes same as base unit).
   */
  getConversionFactor(
    config: ProductUnitConfiguration,
    unitCode: string
  ): number {
    // If unitCode matches base unit, conversion is 1.0
    if (unitCode.toLowerCase() === config.baseInventoryUnit.toLowerCase()) {
      return 1.0
    }

    const orderUnit = this.findOrderUnit(config, unitCode)
    if (!orderUnit) {
      console.warn(
        `Unit code '${unitCode}' not found in product config. ` +
        `Using conversion factor of 1.0`
      )
      return 1.0
    }

    return orderUnit.conversionToBase
  }

  /**
   * Convert a quantity from one unit to the base inventory unit.
   *
   * Formula: quantity_in_base = quantity × conversionToBase
   *
   * Example:
   *   - Input: 25 units of 500g bags
   *   - Conversion factor: 0.5 (500g = 0.5 KG)
   *   - Output: 25 × 0.5 = 12.5 KG
   */
  convertToBaseUnit(
    quantity: number,
    unitCode: string,
    config: ProductUnitConfiguration
  ): ConversionResult {
    const conversionFactor = this.getConversionFactor(config, unitCode)
    const convertedValue = quantity * conversionFactor

    return {
      value: convertedValue,
      unit: config.baseInventoryUnit,
      originalValue: quantity,
      originalUnit: unitCode,
      conversionFactor
    }
  }

  /**
   * Convert a quantity from base unit to a specific order unit.
   *
   * Formula: quantity_in_unit = quantity_in_base / conversionToBase
   *
   * Example:
   *   - Input: 12.5 KG
   *   - Target unit: 500g bags (conversion: 0.5)
   *   - Output: 12.5 / 0.5 = 25 bags
   */
  convertFromBaseUnit(
    quantityInBase: number,
    targetUnitCode: string,
    config: ProductUnitConfiguration
  ): ConversionResult {
    const conversionFactor = this.getConversionFactor(config, targetUnitCode)
    const convertedValue = quantityInBase / conversionFactor

    return {
      value: convertedValue,
      unit: targetUnitCode,
      originalValue: quantityInBase,
      originalUnit: config.baseInventoryUnit,
      conversionFactor
    }
  }

  /**
   * Convert a quantity between any two units.
   * First converts to base unit, then to target unit.
   */
  convertBetweenUnits(
    quantity: number,
    fromUnitCode: string,
    toUnitCode: string,
    config: ProductUnitConfiguration
  ): ConversionResult {
    // First convert to base unit
    const inBase = this.convertToBaseUnit(quantity, fromUnitCode, config)

    // Then convert from base to target
    const result = this.convertFromBaseUnit(inBase.value, toUnitCode, config)

    // Calculate overall conversion factor
    const fromFactor = this.getConversionFactor(config, fromUnitCode)
    const toFactor = this.getConversionFactor(config, toUnitCode)
    const overallFactor = fromFactor / toFactor

    return {
      value: result.value,
      unit: toUnitCode,
      originalValue: quantity,
      originalUnit: fromUnitCode,
      conversionFactor: overallFactor
    }
  }

  /**
   * Normalize a price to the base inventory unit.
   *
   * Formula: pricePerBaseUnit = unitPrice / conversionToBase
   *
   * Example:
   *   - Input: $16 per 500g bag
   *   - Conversion factor: 0.5 (500g = 0.5 KG)
   *   - Output: $16 / 0.5 = $32 per KG
   */
  normalizePrice(
    price: Money,
    sellingUnitCode: string,
    config: ProductUnitConfiguration
  ): PriceNormalizationResult {
    const conversionFactor = this.getConversionFactor(config, sellingUnitCode)
    const normalizedAmount = price.amount / conversionFactor

    return {
      pricePerBaseUnit: {
        amount: normalizedAmount,
        currency: price.currency
      },
      originalPrice: price,
      originalUnit: sellingUnitCode,
      baseUnit: config.baseInventoryUnit,
      conversionFactor
    }
  }

  /**
   * Convert vendor MOQ to base unit for validation.
   *
   * Formula: moqInBase = moqQuantity × conversionToBase
   *
   * Example:
   *   - Input: MOQ 25 bags (500g bags)
   *   - Conversion factor: 0.5
   *   - Output: 25 × 0.5 = 12.5 KG minimum
   */
  convertMOQToBaseUnit(
    moqQuantity: number,
    moqUnitCode: string,
    config: ProductUnitConfiguration
  ): ConversionResult {
    return this.convertToBaseUnit(moqQuantity, moqUnitCode, config)
  }

  /**
   * Validate if a requested quantity meets the vendor's MOQ requirement.
   *
   * Both quantities are compared in base unit for accuracy.
   */
  validateMOQRequirement(
    requestedQuantity: number,
    requestedUnitCode: string,
    vendorMOQ: number,
    vendorMOQUnitCode: string,
    config: ProductUnitConfiguration
  ): MOQValidationResult {
    // Convert both to base unit
    const requestedInBase = this.convertToBaseUnit(
      requestedQuantity,
      requestedUnitCode,
      config
    )
    const moqInBase = this.convertToBaseUnit(
      vendorMOQ,
      vendorMOQUnitCode,
      config
    )

    const meetsRequirement = requestedInBase.value >= moqInBase.value

    // Calculate gap (how much more is needed)
    const gapInBase = meetsRequirement
      ? 0
      : moqInBase.value - requestedInBase.value

    // Calculate gap in vendor's MOQ unit for display
    const gapConversion = this.convertFromBaseUnit(
      gapInBase,
      vendorMOQUnitCode,
      config
    )

    // Calculate percentage met
    const percentageMet = moqInBase.value > 0
      ? (requestedInBase.value / moqInBase.value) * 100
      : 100

    return {
      meetsRequirement,
      gap: gapConversion.value,
      gapInBaseUnit: gapInBase,
      percentageMet: Math.min(percentageMet, 100), // Cap at 100%
      suggestedQuantity: meetsRequirement ? requestedInBase.value : moqInBase.value
    }
  }

  /**
   * Get MOQ alert severity based on how close the quantity is to MOQ.
   */
  getMOQAlertSeverity(
    percentageMet: number
  ): 'info' | 'warning' | 'error' {
    if (percentageMet >= 90) return 'info'      // 90-100% - close, just info
    if (percentageMet >= 50) return 'warning'   // 50-90% - warning
    return 'error'                               // <50% - error/blocked
  }

  /**
   * Calculate the total cost for a quantity at a given price.
   * Handles unit conversion automatically.
   */
  calculateTotalCost(
    quantity: number,
    quantityUnitCode: string,
    pricePerUnit: Money,
    priceUnitCode: string,
    config: ProductUnitConfiguration
  ): Money {
    // Convert quantity to base unit
    const quantityInBase = this.convertToBaseUnit(
      quantity,
      quantityUnitCode,
      config
    )

    // Normalize price to base unit
    const normalizedPrice = this.normalizePrice(
      pricePerUnit,
      priceUnitCode,
      config
    )

    // Calculate total
    const totalAmount = quantityInBase.value * normalizedPrice.pricePerBaseUnit.amount

    return {
      amount: totalAmount,
      currency: pricePerUnit.currency
    }
  }

  /**
   * Compare two prices after normalizing to base unit.
   * Returns negative if price1 < price2, positive if price1 > price2, 0 if equal.
   */
  comparePrices(
    price1: Money,
    unit1: string,
    price2: Money,
    unit2: string,
    config: ProductUnitConfiguration
  ): number {
    const normalized1 = this.normalizePrice(price1, unit1, config)
    const normalized2 = this.normalizePrice(price2, unit2, config)

    return normalized1.pricePerBaseUnit.amount - normalized2.pricePerBaseUnit.amount
  }

  /**
   * Find the best price among multiple vendor options.
   * Returns the vendor option with the lowest normalized price.
   */
  findBestPrice<T extends { price: Money; unitCode: string }>(
    options: T[],
    config: ProductUnitConfiguration
  ): { option: T; normalizedPrice: Money } | null {
    if (options.length === 0) return null

    let best: { option: T; normalizedPrice: Money } | null = null

    for (const option of options) {
      const normalized = this.normalizePrice(option.price, option.unitCode, config)

      if (
        !best ||
        normalized.pricePerBaseUnit.amount < best.normalizedPrice.amount
      ) {
        best = {
          option,
          normalizedPrice: normalized.pricePerBaseUnit
        }
      }
    }

    return best
  }

  /**
   * Round a quantity to a sensible precision based on the unit.
   * Useful for display and avoiding floating point issues.
   */
  roundQuantity(quantity: number, decimalPlaces: number = 2): number {
    const factor = Math.pow(10, decimalPlaces)
    return Math.round(quantity * factor) / factor
  }

  /**
   * Format a quantity with its unit for display.
   */
  formatQuantityWithUnit(
    quantity: number,
    unitCode: string,
    config: ProductUnitConfiguration
  ): string {
    const orderUnit = this.findOrderUnit(config, unitCode)
    const unitName = orderUnit?.unitName || unitCode
    const roundedQty = this.roundQuantity(quantity)

    return `${roundedQty} ${unitName}`
  }

  /**
   * Format a price per unit for display.
   */
  formatPricePerUnit(
    price: Money,
    unitCode: string,
    config: ProductUnitConfiguration
  ): string {
    const orderUnit = this.findOrderUnit(config, unitCode)
    const unitName = orderUnit?.unitName || unitCode

    return `${price.currency} ${price.amount.toFixed(2)}/${unitName}`
  }

  /**
   * Format a normalized price per base unit for display.
   */
  formatNormalizedPrice(
    price: Money,
    config: ProductUnitConfiguration
  ): string {
    return `${price.currency} ${price.amount.toFixed(2)}/${config.baseInventoryUnit}`
  }
}

// =============================================================================
// Singleton Export
// =============================================================================

export const UnitConversionService = new UnitConversionServiceImpl()

export default UnitConversionService
