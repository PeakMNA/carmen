/**
 * Product Unit Configuration Mock Data
 *
 * Defines how products can be ordered in different units and their
 * conversion factors to the base inventory unit.
 *
 * This data enables:
 * - Price normalization across different vendor selling units
 * - MOQ validation with unit conversion
 * - Proper comparison of vendor pricing
 */

import { ProductUnitConfiguration, ProductOrderUnit } from '@/lib/types'

// =============================================================================
// Common Order Unit Templates
// =============================================================================

/**
 * Pre-defined order unit templates for common packaging types.
 * These can be reused across multiple products.
 */
export const commonOrderUnits = {
  // Weight-based units (base: KG)
  weight: {
    bag100g: { unitCode: 'BAG-100G', unitName: '100g Bag', conversionToBase: 0.1, isDefault: false },
    bag250g: { unitCode: 'BAG-250G', unitName: '250g Bag', conversionToBase: 0.25, isDefault: false },
    bag500g: { unitCode: 'BAG-500G', unitName: '500g Bag', conversionToBase: 0.5, isDefault: false },
    bag1kg: { unitCode: 'BAG-1KG', unitName: '1kg Bag', conversionToBase: 1.0, isDefault: true },
    bag2kg: { unitCode: 'BAG-2KG', unitName: '2kg Bag', conversionToBase: 2.0, isDefault: false },
    box5kg: { unitCode: 'BOX-5KG', unitName: '5kg Box', conversionToBase: 5.0, isDefault: false },
    box10kg: { unitCode: 'BOX-10KG', unitName: '10kg Box', conversionToBase: 10.0, isDefault: false },
    box20kg: { unitCode: 'BOX-20KG', unitName: '20kg Box', conversionToBase: 20.0, isDefault: false },
    sack25kg: { unitCode: 'SACK-25KG', unitName: '25kg Sack', conversionToBase: 25.0, isDefault: false },
    sack50kg: { unitCode: 'SACK-50KG', unitName: '50kg Sack', conversionToBase: 50.0, isDefault: false }
  },

  // Volume-based units (base: L)
  volume: {
    bottle250ml: { unitCode: 'BTL-250ML', unitName: '250ml Bottle', conversionToBase: 0.25, isDefault: false },
    bottle500ml: { unitCode: 'BTL-500ML', unitName: '500ml Bottle', conversionToBase: 0.5, isDefault: false },
    bottle750ml: { unitCode: 'BTL-750ML', unitName: '750ml Bottle', conversionToBase: 0.75, isDefault: false },
    bottle1l: { unitCode: 'BTL-1L', unitName: '1L Bottle', conversionToBase: 1.0, isDefault: true },
    can330ml: { unitCode: 'CAN-330ML', unitName: '330ml Can', conversionToBase: 0.33, isDefault: false },
    jug2l: { unitCode: 'JUG-2L', unitName: '2L Jug', conversionToBase: 2.0, isDefault: false },
    gallon4l: { unitCode: 'GAL-4L', unitName: '4L Gallon', conversionToBase: 4.0, isDefault: false },
    drum20l: { unitCode: 'DRUM-20L', unitName: '20L Drum', conversionToBase: 20.0, isDefault: false }
  },

  // Piece-based units (base: PC)
  piece: {
    single: { unitCode: 'PC', unitName: 'Piece', conversionToBase: 1, isDefault: true },
    pair: { unitCode: 'PAIR', unitName: 'Pair', conversionToBase: 2, isDefault: false },
    pack6: { unitCode: 'PACK-6', unitName: 'Pack of 6', conversionToBase: 6, isDefault: false },
    pack12: { unitCode: 'PACK-12', unitName: 'Pack of 12', conversionToBase: 12, isDefault: false },
    pack24: { unitCode: 'PACK-24', unitName: 'Pack of 24', conversionToBase: 24, isDefault: false },
    case48: { unitCode: 'CASE-48', unitName: 'Case of 48', conversionToBase: 48, isDefault: false },
    carton100: { unitCode: 'CTN-100', unitName: 'Carton of 100', conversionToBase: 100, isDefault: false }
  },

  // Dozen-based units (base: DOZ)
  dozen: {
    half: { unitCode: 'HALF-DOZ', unitName: 'Half Dozen', conversionToBase: 0.5, isDefault: false },
    single: { unitCode: 'DOZ', unitName: 'Dozen', conversionToBase: 1, isDefault: true },
    double: { unitCode: 'DBL-DOZ', unitName: 'Double Dozen', conversionToBase: 2, isDefault: false },
    tray30: { unitCode: 'TRAY-30', unitName: 'Tray (30 eggs)', conversionToBase: 2.5, isDefault: false }
  }
} as const

// =============================================================================
// Product Unit Configurations
// =============================================================================

/**
 * Complete product unit configurations for all products.
 * Maps product IDs to their unit configuration.
 */
export const productUnitConfigs: ProductUnitConfiguration[] = [
  // ---------------------------------------------------------------------
  // Coffee & Beverages
  // ---------------------------------------------------------------------
  {
    productId: 'coffee-001',
    baseInventoryUnit: 'KG',
    baseUnitDisplayName: 'Kilogram',
    orderUnits: [
      { unitCode: 'BAG-250G', unitName: '250g Bag', conversionToBase: 0.25, isDefault: false },
      { unitCode: 'BAG-500G', unitName: '500g Bag', conversionToBase: 0.5, isDefault: false },
      { unitCode: 'BAG-1KG', unitName: '1kg Bag', conversionToBase: 1.0, isDefault: true },
      { unitCode: 'BOX-5KG', unitName: '5kg Box', conversionToBase: 5.0, isDefault: false }
    ]
  },
  {
    productId: 'tea-001',
    baseInventoryUnit: 'KG',
    baseUnitDisplayName: 'Kilogram',
    orderUnits: [
      { unitCode: 'BAG-100G', unitName: '100g Bag', conversionToBase: 0.1, isDefault: false },
      { unitCode: 'BAG-250G', unitName: '250g Bag', conversionToBase: 0.25, isDefault: true },
      { unitCode: 'BOX-1KG', unitName: '1kg Box', conversionToBase: 1.0, isDefault: false }
    ]
  },
  {
    productId: 'juice-001',
    baseInventoryUnit: 'L',
    baseUnitDisplayName: 'Liter',
    orderUnits: [
      { unitCode: 'BTL-250ML', unitName: '250ml Bottle', conversionToBase: 0.25, isDefault: false },
      { unitCode: 'BTL-1L', unitName: '1L Bottle', conversionToBase: 1.0, isDefault: true },
      { unitCode: 'JUG-2L', unitName: '2L Jug', conversionToBase: 2.0, isDefault: false },
      { unitCode: 'CASE-12X1L', unitName: 'Case (12x1L)', conversionToBase: 12.0, isDefault: false }
    ]
  },

  // ---------------------------------------------------------------------
  // Dairy Products
  // ---------------------------------------------------------------------
  {
    productId: 'milk-001',
    baseInventoryUnit: 'L',
    baseUnitDisplayName: 'Liter',
    orderUnits: [
      { unitCode: 'BTL-500ML', unitName: '500ml Bottle', conversionToBase: 0.5, isDefault: false },
      { unitCode: 'BTL-1L', unitName: '1L Bottle', conversionToBase: 1.0, isDefault: true },
      { unitCode: 'CTN-2L', unitName: '2L Carton', conversionToBase: 2.0, isDefault: false },
      { unitCode: 'CRATE-12L', unitName: 'Crate (12L)', conversionToBase: 12.0, isDefault: false }
    ]
  },
  {
    productId: 'butter-001',
    baseInventoryUnit: 'KG',
    baseUnitDisplayName: 'Kilogram',
    orderUnits: [
      { unitCode: 'BLOCK-250G', unitName: '250g Block', conversionToBase: 0.25, isDefault: true },
      { unitCode: 'BLOCK-500G', unitName: '500g Block', conversionToBase: 0.5, isDefault: false },
      { unitCode: 'BLOCK-1KG', unitName: '1kg Block', conversionToBase: 1.0, isDefault: false },
      { unitCode: 'CASE-10KG', unitName: '10kg Case', conversionToBase: 10.0, isDefault: false }
    ]
  },
  {
    productId: 'cheese-001',
    baseInventoryUnit: 'KG',
    baseUnitDisplayName: 'Kilogram',
    orderUnits: [
      { unitCode: 'BLOCK-200G', unitName: '200g Block', conversionToBase: 0.2, isDefault: false },
      { unitCode: 'BLOCK-500G', unitName: '500g Block', conversionToBase: 0.5, isDefault: true },
      { unitCode: 'WHEEL-2KG', unitName: '2kg Wheel', conversionToBase: 2.0, isDefault: false },
      { unitCode: 'WHEEL-5KG', unitName: '5kg Wheel', conversionToBase: 5.0, isDefault: false }
    ]
  },
  {
    productId: 'eggs-001',
    baseInventoryUnit: 'DOZ',
    baseUnitDisplayName: 'Dozen',
    orderUnits: [
      { unitCode: 'HALF-DOZ', unitName: 'Half Dozen (6)', conversionToBase: 0.5, isDefault: false },
      { unitCode: 'DOZ', unitName: 'Dozen (12)', conversionToBase: 1, isDefault: true },
      { unitCode: 'TRAY-30', unitName: 'Tray (30 eggs)', conversionToBase: 2.5, isDefault: false },
      { unitCode: 'CASE-180', unitName: 'Case (180 eggs)', conversionToBase: 15, isDefault: false }
    ]
  },

  // ---------------------------------------------------------------------
  // Meats & Proteins
  // ---------------------------------------------------------------------
  {
    productId: 'chicken-001',
    baseInventoryUnit: 'KG',
    baseUnitDisplayName: 'Kilogram',
    orderUnits: [
      { unitCode: 'KG', unitName: 'Kilogram', conversionToBase: 1.0, isDefault: true },
      { unitCode: 'BOX-10KG', unitName: '10kg Box', conversionToBase: 10.0, isDefault: false },
      { unitCode: 'CASE-20KG', unitName: '20kg Case', conversionToBase: 20.0, isDefault: false }
    ]
  },
  {
    productId: 'beef-001',
    baseInventoryUnit: 'KG',
    baseUnitDisplayName: 'Kilogram',
    orderUnits: [
      { unitCode: 'KG', unitName: 'Kilogram', conversionToBase: 1.0, isDefault: true },
      { unitCode: 'PACK-5KG', unitName: '5kg Pack', conversionToBase: 5.0, isDefault: false },
      { unitCode: 'PRIMAL-CUT', unitName: 'Primal Cut (~15kg)', conversionToBase: 15.0, isDefault: false }
    ]
  },
  {
    productId: 'salmon-001',
    baseInventoryUnit: 'KG',
    baseUnitDisplayName: 'Kilogram',
    orderUnits: [
      { unitCode: 'FILLET-200G', unitName: '200g Fillet', conversionToBase: 0.2, isDefault: false },
      { unitCode: 'KG', unitName: 'Kilogram', conversionToBase: 1.0, isDefault: true },
      { unitCode: 'WHOLE-3KG', unitName: 'Whole Fish (~3kg)', conversionToBase: 3.0, isDefault: false },
      { unitCode: 'CASE-10KG', unitName: '10kg Case', conversionToBase: 10.0, isDefault: false }
    ]
  },

  // ---------------------------------------------------------------------
  // Grains & Dry Goods
  // ---------------------------------------------------------------------
  {
    productId: 'rice-001',
    baseInventoryUnit: 'KG',
    baseUnitDisplayName: 'Kilogram',
    orderUnits: [
      { unitCode: 'BAG-1KG', unitName: '1kg Bag', conversionToBase: 1.0, isDefault: false },
      { unitCode: 'BAG-5KG', unitName: '5kg Bag', conversionToBase: 5.0, isDefault: true },
      { unitCode: 'SACK-25KG', unitName: '25kg Sack', conversionToBase: 25.0, isDefault: false },
      { unitCode: 'SACK-50KG', unitName: '50kg Sack', conversionToBase: 50.0, isDefault: false }
    ]
  },
  {
    productId: 'flour-001',
    baseInventoryUnit: 'KG',
    baseUnitDisplayName: 'Kilogram',
    orderUnits: [
      { unitCode: 'BAG-1KG', unitName: '1kg Bag', conversionToBase: 1.0, isDefault: false },
      { unitCode: 'BAG-5KG', unitName: '5kg Bag', conversionToBase: 5.0, isDefault: true },
      { unitCode: 'SACK-25KG', unitName: '25kg Sack', conversionToBase: 25.0, isDefault: false }
    ]
  },
  {
    productId: 'pasta-001',
    baseInventoryUnit: 'KG',
    baseUnitDisplayName: 'Kilogram',
    orderUnits: [
      { unitCode: 'PACK-500G', unitName: '500g Pack', conversionToBase: 0.5, isDefault: true },
      { unitCode: 'CASE-5KG', unitName: '5kg Case', conversionToBase: 5.0, isDefault: false },
      { unitCode: 'CASE-10KG', unitName: '10kg Case', conversionToBase: 10.0, isDefault: false }
    ]
  },
  {
    productId: 'sugar-001',
    baseInventoryUnit: 'KG',
    baseUnitDisplayName: 'Kilogram',
    orderUnits: [
      { unitCode: 'BAG-1KG', unitName: '1kg Bag', conversionToBase: 1.0, isDefault: true },
      { unitCode: 'BAG-2KG', unitName: '2kg Bag', conversionToBase: 2.0, isDefault: false },
      { unitCode: 'SACK-25KG', unitName: '25kg Sack', conversionToBase: 25.0, isDefault: false },
      { unitCode: 'SACK-50KG', unitName: '50kg Sack', conversionToBase: 50.0, isDefault: false }
    ]
  },

  // ---------------------------------------------------------------------
  // Oils & Condiments
  // ---------------------------------------------------------------------
  {
    productId: 'olive-oil-001',
    baseInventoryUnit: 'L',
    baseUnitDisplayName: 'Liter',
    orderUnits: [
      { unitCode: 'BTL-250ML', unitName: '250ml Bottle', conversionToBase: 0.25, isDefault: false },
      { unitCode: 'BTL-500ML', unitName: '500ml Bottle', conversionToBase: 0.5, isDefault: false },
      { unitCode: 'BTL-1L', unitName: '1L Bottle', conversionToBase: 1.0, isDefault: true },
      { unitCode: 'TIN-3L', unitName: '3L Tin', conversionToBase: 3.0, isDefault: false },
      { unitCode: 'TIN-5L', unitName: '5L Tin', conversionToBase: 5.0, isDefault: false }
    ]
  },
  {
    productId: 'vegetable-oil-001',
    baseInventoryUnit: 'L',
    baseUnitDisplayName: 'Liter',
    orderUnits: [
      { unitCode: 'BTL-1L', unitName: '1L Bottle', conversionToBase: 1.0, isDefault: true },
      { unitCode: 'JUG-5L', unitName: '5L Jug', conversionToBase: 5.0, isDefault: false },
      { unitCode: 'DRUM-20L', unitName: '20L Drum', conversionToBase: 20.0, isDefault: false }
    ]
  },
  {
    productId: 'soy-sauce-001',
    baseInventoryUnit: 'L',
    baseUnitDisplayName: 'Liter',
    orderUnits: [
      { unitCode: 'BTL-150ML', unitName: '150ml Bottle', conversionToBase: 0.15, isDefault: false },
      { unitCode: 'BTL-500ML', unitName: '500ml Bottle', conversionToBase: 0.5, isDefault: true },
      { unitCode: 'BTL-1L', unitName: '1L Bottle', conversionToBase: 1.0, isDefault: false },
      { unitCode: 'GAL-4L', unitName: '4L Gallon', conversionToBase: 4.0, isDefault: false }
    ]
  },

  // ---------------------------------------------------------------------
  // Produce
  // ---------------------------------------------------------------------
  {
    productId: 'tomatoes-001',
    baseInventoryUnit: 'KG',
    baseUnitDisplayName: 'Kilogram',
    orderUnits: [
      { unitCode: 'KG', unitName: 'Kilogram', conversionToBase: 1.0, isDefault: true },
      { unitCode: 'CRATE-5KG', unitName: '5kg Crate', conversionToBase: 5.0, isDefault: false },
      { unitCode: 'CRATE-10KG', unitName: '10kg Crate', conversionToBase: 10.0, isDefault: false }
    ]
  },
  {
    productId: 'onions-001',
    baseInventoryUnit: 'KG',
    baseUnitDisplayName: 'Kilogram',
    orderUnits: [
      { unitCode: 'KG', unitName: 'Kilogram', conversionToBase: 1.0, isDefault: true },
      { unitCode: 'BAG-5KG', unitName: '5kg Bag', conversionToBase: 5.0, isDefault: false },
      { unitCode: 'SACK-20KG', unitName: '20kg Sack', conversionToBase: 20.0, isDefault: false }
    ]
  },
  {
    productId: 'lettuce-001',
    baseInventoryUnit: 'PC',
    baseUnitDisplayName: 'Head',
    orderUnits: [
      { unitCode: 'PC', unitName: 'Head', conversionToBase: 1, isDefault: true },
      { unitCode: 'CASE-12', unitName: 'Case of 12', conversionToBase: 12, isDefault: false },
      { unitCode: 'CASE-24', unitName: 'Case of 24', conversionToBase: 24, isDefault: false }
    ]
  },

  // ---------------------------------------------------------------------
  // Cleaning & Supplies
  // ---------------------------------------------------------------------
  {
    productId: 'detergent-001',
    baseInventoryUnit: 'L',
    baseUnitDisplayName: 'Liter',
    orderUnits: [
      { unitCode: 'BTL-500ML', unitName: '500ml Bottle', conversionToBase: 0.5, isDefault: false },
      { unitCode: 'BTL-1L', unitName: '1L Bottle', conversionToBase: 1.0, isDefault: true },
      { unitCode: 'GAL-5L', unitName: '5L Gallon', conversionToBase: 5.0, isDefault: false },
      { unitCode: 'DRUM-20L', unitName: '20L Drum', conversionToBase: 20.0, isDefault: false }
    ]
  },
  {
    productId: 'napkins-001',
    baseInventoryUnit: 'PC',
    baseUnitDisplayName: 'Piece',
    orderUnits: [
      { unitCode: 'PACK-100', unitName: 'Pack of 100', conversionToBase: 100, isDefault: true },
      { unitCode: 'PACK-500', unitName: 'Pack of 500', conversionToBase: 500, isDefault: false },
      { unitCode: 'CASE-5000', unitName: 'Case of 5000', conversionToBase: 5000, isDefault: false }
    ]
  },
  {
    productId: 'gloves-001',
    baseInventoryUnit: 'PC',
    baseUnitDisplayName: 'Pair',
    orderUnits: [
      { unitCode: 'PAIR', unitName: 'Pair', conversionToBase: 1, isDefault: false },
      { unitCode: 'BOX-50', unitName: 'Box of 50 pairs', conversionToBase: 50, isDefault: true },
      { unitCode: 'CASE-500', unitName: 'Case of 500 pairs', conversionToBase: 500, isDefault: false }
    ]
  }
]

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get unit configuration for a product by ID.
 */
export function getProductUnitConfig(productId: string): ProductUnitConfiguration | undefined {
  return productUnitConfigs.find(c => c.productId === productId)
}

/**
 * Get all products with a specific base unit.
 */
export function getProductsByBaseUnit(baseUnit: string): ProductUnitConfiguration[] {
  return productUnitConfigs.filter(
    c => c.baseInventoryUnit.toLowerCase() === baseUnit.toLowerCase()
  )
}

/**
 * Get the default order unit for a product.
 */
export function getDefaultOrderUnit(productId: string): ProductOrderUnit | undefined {
  const config = getProductUnitConfig(productId)
  if (!config) return undefined
  return config.orderUnits.find(u => u.isDefault) || config.orderUnits[0]
}

/**
 * Get a specific order unit for a product.
 */
export function getOrderUnit(
  productId: string,
  unitCode: string
): ProductOrderUnit | undefined {
  const config = getProductUnitConfig(productId)
  if (!config) return undefined
  return config.orderUnits.find(
    u => u.unitCode.toLowerCase() === unitCode.toLowerCase()
  )
}

/**
 * Check if a product has a specific order unit.
 */
export function hasOrderUnit(productId: string, unitCode: string): boolean {
  return getOrderUnit(productId, unitCode) !== undefined
}

/**
 * Create a product unit config with common templates.
 * Useful for quickly setting up new products.
 */
export function createProductUnitConfig(
  productId: string,
  baseUnit: 'KG' | 'L' | 'PC' | 'DOZ',
  unitTemplates: (keyof typeof commonOrderUnits.weight | keyof typeof commonOrderUnits.volume | keyof typeof commonOrderUnits.piece | keyof typeof commonOrderUnits.dozen)[]
): ProductUnitConfiguration {
  const baseUnitNames: Record<string, string> = {
    KG: 'Kilogram',
    L: 'Liter',
    PC: 'Piece',
    DOZ: 'Dozen'
  }

  const templateMap: Record<string, Record<string, ProductOrderUnit>> = {
    KG: commonOrderUnits.weight,
    L: commonOrderUnits.volume,
    PC: commonOrderUnits.piece,
    DOZ: commonOrderUnits.dozen
  }

  const templates = templateMap[baseUnit] || {}
  const orderUnits: ProductOrderUnit[] = unitTemplates
    .map(key => templates[key as keyof typeof templates])
    .filter(Boolean) as ProductOrderUnit[]

  return {
    productId,
    baseInventoryUnit: baseUnit,
    baseUnitDisplayName: baseUnitNames[baseUnit] || baseUnit,
    orderUnits
  }
}

// =============================================================================
// Export
// =============================================================================

export type {
  ProductUnitConfiguration,
  ProductOrderUnit
}
