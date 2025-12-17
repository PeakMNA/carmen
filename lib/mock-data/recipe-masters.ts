/**
 * Mock Data: Recipe Master Data
 *
 * Equipment and Recipe Units used in recipe management
 */

import type { Equipment, RecipeUnit, UnitConversion } from '@/lib/types'

// ============================================================================
// EQUIPMENT MOCK DATA
// ============================================================================

export const mockEquipment: Equipment[] = [
  // Cooking Equipment
  {
    id: 'eq-001',
    code: 'OVEN-CONV-01',
    name: 'Convection Oven',
    description: 'Industrial convection oven for baking and roasting',
    category: 'cooking',
    brand: 'Rational',
    model: 'SCC WE 101',
    capacity: '10 trays',
    powerRating: '18.9 kW',
    station: 'Baking Station',
    status: 'active',
    isPortable: false,
    availableQuantity: 2,
    totalQuantity: 2,
    maintenanceSchedule: 'Monthly',
    displayOrder: 1,
    isActive: true
  },
  {
    id: 'eq-002',
    code: 'STOVE-GAS-01',
    name: 'Gas Range (6 Burner)',
    description: 'Commercial 6-burner gas range with oven',
    category: 'cooking',
    brand: 'Vulcan',
    model: 'V6B36',
    capacity: '6 burners',
    powerRating: 'Gas - 180,000 BTU',
    station: 'Hot Kitchen',
    status: 'active',
    isPortable: false,
    availableQuantity: 3,
    totalQuantity: 3,
    maintenanceSchedule: 'Weekly',
    displayOrder: 2,
    isActive: true
  },
  {
    id: 'eq-003',
    code: 'GRILL-CHAR-01',
    name: 'Charcoal Grill',
    description: 'Commercial charcoal grill for grilling and BBQ',
    category: 'cooking',
    brand: 'Josper',
    model: 'HJX-45',
    capacity: '45 kg/hour',
    powerRating: 'Charcoal',
    station: 'Grill Station',
    status: 'active',
    isPortable: false,
    availableQuantity: 1,
    totalQuantity: 1,
    maintenanceSchedule: 'Weekly',
    displayOrder: 3,
    isActive: true
  },
  {
    id: 'eq-004',
    code: 'FRYER-DEEP-01',
    name: 'Deep Fryer',
    description: 'Commercial deep fryer with dual baskets',
    category: 'cooking',
    brand: 'Frymaster',
    model: 'PH155',
    capacity: '25 liters',
    powerRating: 'Gas - 80,000 BTU',
    station: 'Fry Station',
    status: 'active',
    isPortable: false,
    availableQuantity: 2,
    totalQuantity: 2,
    maintenanceSchedule: 'Daily',
    displayOrder: 4,
    isActive: true
  },
  {
    id: 'eq-005',
    code: 'WOK-RANGE-01',
    name: 'Wok Range',
    description: 'High-power wok range for Asian cooking',
    category: 'cooking',
    brand: 'Town',
    model: 'Y-3-SS-N',
    capacity: '3 wok stations',
    powerRating: 'Gas - 150,000 BTU each',
    station: 'Asian Kitchen',
    status: 'active',
    isPortable: false,
    availableQuantity: 1,
    totalQuantity: 1,
    maintenanceSchedule: 'Weekly',
    displayOrder: 5,
    isActive: true
  },
  // Preparation Equipment
  {
    id: 'eq-006',
    code: 'MIXER-STAND-01',
    name: 'Stand Mixer (20 Qt)',
    description: 'Commercial planetary mixer for dough and batters',
    category: 'preparation',
    brand: 'Hobart',
    model: 'HL200',
    capacity: '20 quarts',
    powerRating: '1.5 HP',
    station: 'Pastry Station',
    status: 'active',
    isPortable: false,
    availableQuantity: 2,
    totalQuantity: 2,
    maintenanceSchedule: 'Monthly',
    displayOrder: 6,
    isActive: true
  },
  {
    id: 'eq-007',
    code: 'PROCESSOR-01',
    name: 'Food Processor',
    description: 'Commercial food processor for chopping and pureeing',
    category: 'preparation',
    brand: 'Robot Coupe',
    model: 'R2N',
    capacity: '3 liters',
    powerRating: '1 HP',
    station: 'Prep Area',
    status: 'active',
    isPortable: true,
    availableQuantity: 3,
    totalQuantity: 3,
    maintenanceSchedule: 'Weekly',
    displayOrder: 7,
    isActive: true
  },
  {
    id: 'eq-008',
    code: 'BLENDER-01',
    name: 'Commercial Blender',
    description: 'High-power blender for smoothies and sauces',
    category: 'preparation',
    brand: 'Vitamix',
    model: 'Vita-Prep 3',
    capacity: '2 liters',
    powerRating: '3 HP',
    station: 'Beverage Station',
    status: 'active',
    isPortable: true,
    availableQuantity: 4,
    totalQuantity: 4,
    maintenanceSchedule: 'Weekly',
    displayOrder: 8,
    isActive: true
  },
  {
    id: 'eq-009',
    code: 'SLICER-01',
    name: 'Meat Slicer',
    description: 'Commercial gravity feed slicer',
    category: 'preparation',
    brand: 'Bizerba',
    model: 'GSP HD',
    capacity: '12 inch blade',
    powerRating: '0.5 HP',
    station: 'Cold Kitchen',
    status: 'active',
    isPortable: false,
    availableQuantity: 1,
    totalQuantity: 1,
    maintenanceSchedule: 'Daily',
    displayOrder: 9,
    isActive: true
  },
  // Refrigeration Equipment
  {
    id: 'eq-010',
    code: 'FRIDGE-REACH-01',
    name: 'Reach-In Refrigerator',
    description: 'Two-door commercial reach-in refrigerator',
    category: 'refrigeration',
    brand: 'True',
    model: 'T-49',
    capacity: '49 cu ft',
    powerRating: '115V/60Hz/1',
    station: 'Cold Storage',
    status: 'active',
    isPortable: false,
    availableQuantity: 4,
    totalQuantity: 4,
    maintenanceSchedule: 'Monthly',
    displayOrder: 10,
    isActive: true
  },
  {
    id: 'eq-011',
    code: 'FREEZER-WALKIN-01',
    name: 'Walk-In Freezer',
    description: 'Walk-in freezer unit for frozen storage',
    category: 'refrigeration',
    brand: 'Kolpak',
    model: 'QS7-1010-FT',
    capacity: '100 cu ft',
    powerRating: '208-230V/60Hz/1',
    station: 'Frozen Storage',
    status: 'active',
    isPortable: false,
    availableQuantity: 1,
    totalQuantity: 1,
    maintenanceSchedule: 'Monthly',
    displayOrder: 11,
    isActive: true
  },
  // Small Appliances
  {
    id: 'eq-012',
    code: 'IMMERSION-01',
    name: 'Immersion Blender',
    description: 'Commercial immersion blender for soups and sauces',
    category: 'small_appliance',
    brand: 'Dynamic',
    model: 'MX91',
    capacity: '50 liters max',
    powerRating: '350W',
    station: 'Hot Kitchen',
    status: 'active',
    isPortable: true,
    availableQuantity: 3,
    totalQuantity: 3,
    maintenanceSchedule: 'Weekly',
    displayOrder: 12,
    isActive: true
  },
  {
    id: 'eq-013',
    code: 'SOUS-VIDE-01',
    name: 'Sous Vide Circulator',
    description: 'Precision immersion circulator for sous vide cooking',
    category: 'small_appliance',
    brand: 'PolyScience',
    model: 'Classic',
    capacity: '30 liters',
    powerRating: '1100W',
    station: 'Hot Kitchen',
    status: 'active',
    isPortable: true,
    availableQuantity: 2,
    totalQuantity: 2,
    maintenanceSchedule: 'Monthly',
    displayOrder: 13,
    isActive: true
  },
  // Utensils
  {
    id: 'eq-014',
    code: 'PAN-SAUTE-01',
    name: 'Sauté Pan (12 inch)',
    description: 'Stainless steel sauté pan with lid',
    category: 'utensil',
    brand: 'All-Clad',
    model: 'D3 Stainless',
    capacity: '12 inch',
    station: 'Hot Kitchen',
    status: 'active',
    isPortable: true,
    availableQuantity: 10,
    totalQuantity: 12,
    maintenanceSchedule: 'As needed',
    displayOrder: 14,
    isActive: true
  },
  {
    id: 'eq-015',
    code: 'POT-STOCK-01',
    name: 'Stock Pot (40 Qt)',
    description: 'Heavy-duty stainless steel stock pot',
    category: 'utensil',
    brand: 'Vollrath',
    model: 'Centurion',
    capacity: '40 quarts',
    station: 'Hot Kitchen',
    status: 'active',
    isPortable: true,
    availableQuantity: 4,
    totalQuantity: 4,
    maintenanceSchedule: 'As needed',
    displayOrder: 15,
    isActive: true
  },
  {
    id: 'eq-016',
    code: 'SCALE-DIGITAL-01',
    name: 'Digital Scale',
    description: 'Precision digital kitchen scale',
    category: 'small_appliance',
    brand: 'Ohaus',
    model: 'Valor 4000',
    capacity: '15 kg',
    powerRating: 'Battery/AC',
    station: 'Prep Area',
    status: 'active',
    isPortable: true,
    availableQuantity: 6,
    totalQuantity: 6,
    maintenanceSchedule: 'Monthly calibration',
    displayOrder: 16,
    isActive: true
  },
  {
    id: 'eq-017',
    code: 'THERMOMETER-01',
    name: 'Digital Thermometer',
    description: 'Instant-read digital thermometer for food safety',
    category: 'utensil',
    brand: 'ThermoWorks',
    model: 'Thermapen ONE',
    capacity: 'N/A',
    station: 'All Stations',
    status: 'active',
    isPortable: true,
    availableQuantity: 8,
    totalQuantity: 10,
    maintenanceSchedule: 'Monthly calibration',
    displayOrder: 17,
    isActive: true
  },
  {
    id: 'eq-018',
    code: 'OVEN-PIZZA-01',
    name: 'Pizza Oven',
    description: 'Wood-fired pizza oven',
    category: 'cooking',
    brand: 'Forno Bravo',
    model: 'Modena',
    capacity: '6 pizzas',
    powerRating: 'Wood-fired',
    station: 'Pizza Station',
    status: 'maintenance',
    isPortable: false,
    availableQuantity: 0,
    totalQuantity: 1,
    maintenanceSchedule: 'Weekly',
    displayOrder: 18,
    isActive: true
  }
]

// ============================================================================
// RECIPE UNITS MOCK DATA
// ============================================================================

export const mockRecipeUnits: RecipeUnit[] = [
  // Weight Units - Metric
  {
    id: 'unit-001',
    code: 'g',
    name: 'Gram',
    pluralName: 'Grams',
    displayOrder: 1,
    showInDropdown: true,
    decimalPlaces: 0,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: 'Base unit for weight'
  },
  {
    id: 'unit-002',
    code: 'kg',
    name: 'Kilogram',
    pluralName: 'Kilograms',
    displayOrder: 2,
    showInDropdown: true,
    decimalPlaces: 2,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: '1 kg = 1000 g'
  },
  {
    id: 'unit-003',
    code: 'mg',
    name: 'Milligram',
    pluralName: 'Milligrams',
    displayOrder: 3,
    showInDropdown: true,
    decimalPlaces: 0,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: '1000 mg = 1 g'
  },
  // Weight Units - Imperial
  {
    id: 'unit-004',
    code: 'oz',
    name: 'Ounce',
    pluralName: 'Ounces',
    displayOrder: 4,
    showInDropdown: true,
    decimalPlaces: 1,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: '1 oz ≈ 28.35 g'
  },
  {
    id: 'unit-005',
    code: 'lb',
    name: 'Pound',
    pluralName: 'Pounds',
    displayOrder: 5,
    showInDropdown: true,
    decimalPlaces: 2,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: '1 lb = 16 oz ≈ 454 g'
  },
  // Volume Units - Metric
  {
    id: 'unit-006',
    code: 'ml',
    name: 'Milliliter',
    pluralName: 'Milliliters',
    displayOrder: 6,
    showInDropdown: true,
    decimalPlaces: 0,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: 'Base unit for volume'
  },
  {
    id: 'unit-007',
    code: 'l',
    name: 'Liter',
    pluralName: 'Liters',
    displayOrder: 7,
    showInDropdown: true,
    decimalPlaces: 2,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: '1 L = 1000 ml'
  },
  // Volume Units - Cooking
  {
    id: 'unit-008',
    code: 'tsp',
    name: 'Teaspoon',
    pluralName: 'Teaspoons',
    displayOrder: 8,
    showInDropdown: true,
    decimalPlaces: 1,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: '1 tsp = 5 ml'
  },
  {
    id: 'unit-009',
    code: 'tbsp',
    name: 'Tablespoon',
    pluralName: 'Tablespoons',
    displayOrder: 9,
    showInDropdown: true,
    decimalPlaces: 1,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: '1 tbsp = 3 tsp = 15 ml'
  },
  {
    id: 'unit-010',
    code: 'cup',
    name: 'Cup',
    pluralName: 'Cups',
    displayOrder: 10,
    showInDropdown: true,
    decimalPlaces: 2,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: '1 cup ≈ 237 ml'
  },
  {
    id: 'unit-011',
    code: 'fl oz',
    name: 'Fluid Ounce',
    pluralName: 'Fluid Ounces',
    displayOrder: 11,
    showInDropdown: true,
    decimalPlaces: 1,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: '1 fl oz ≈ 30 ml'
  },
  // Count Units
  {
    id: 'unit-012',
    code: 'pcs',
    name: 'Piece',
    pluralName: 'Pieces',
    displayOrder: 12,
    showInDropdown: true,
    decimalPlaces: 0,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: 'Individual items'
  },
  {
    id: 'unit-013',
    code: 'doz',
    name: 'Dozen',
    pluralName: 'Dozens',
    displayOrder: 13,
    showInDropdown: true,
    decimalPlaces: 1,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: '1 dozen = 12 pieces'
  },
  {
    id: 'unit-014',
    code: 'bunch',
    name: 'Bunch',
    pluralName: 'Bunches',
    displayOrder: 14,
    showInDropdown: true,
    decimalPlaces: 0,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: 'Bundle of herbs/vegetables'
  },
  {
    id: 'unit-015',
    code: 'clove',
    name: 'Clove',
    pluralName: 'Cloves',
    displayOrder: 15,
    showInDropdown: true,
    decimalPlaces: 0,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: 'Single garlic clove'
  },
  {
    id: 'unit-016',
    code: 'head',
    name: 'Head',
    pluralName: 'Heads',
    displayOrder: 16,
    showInDropdown: true,
    decimalPlaces: 0,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: 'Whole head of lettuce/garlic'
  },
  {
    id: 'unit-017',
    code: 'sprig',
    name: 'Sprig',
    pluralName: 'Sprigs',
    displayOrder: 17,
    showInDropdown: true,
    decimalPlaces: 0,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: 'Single herb sprig'
  },
  // Serving Units
  {
    id: 'unit-018',
    code: 'portion',
    name: 'Portion',
    pluralName: 'Portions',
    displayOrder: 18,
    showInDropdown: true,
    decimalPlaces: 0,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: 'Single serving portion'
  },
  {
    id: 'unit-019',
    code: 'serving',
    name: 'Serving',
    pluralName: 'Servings',
    displayOrder: 19,
    showInDropdown: true,
    decimalPlaces: 0,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: 'Single serving size'
  },
  {
    id: 'unit-020',
    code: 'slice',
    name: 'Slice',
    pluralName: 'Slices',
    displayOrder: 20,
    showInDropdown: true,
    decimalPlaces: 0,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: 'Single slice'
  },
  // Specialty Units
  {
    id: 'unit-021',
    code: 'pinch',
    name: 'Pinch',
    pluralName: 'Pinches',
    displayOrder: 21,
    showInDropdown: true,
    decimalPlaces: 0,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: 'Small amount between fingers'
  },
  {
    id: 'unit-022',
    code: 'dash',
    name: 'Dash',
    pluralName: 'Dashes',
    displayOrder: 22,
    showInDropdown: true,
    decimalPlaces: 0,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: 'Quick shake from container'
  },
  {
    id: 'unit-023',
    code: 'drop',
    name: 'Drop',
    pluralName: 'Drops',
    displayOrder: 23,
    showInDropdown: true,
    decimalPlaces: 0,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: 'Single liquid drop'
  },
  // Additional Serving Units
  {
    id: 'unit-024',
    code: 'bowl',
    name: 'Bowl',
    pluralName: 'Bowls',
    displayOrder: 24,
    showInDropdown: true,
    decimalPlaces: 0,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: 'Single bowl serving'
  },
  {
    id: 'unit-025',
    code: 'plate',
    name: 'Plate',
    pluralName: 'Plates',
    displayOrder: 25,
    showInDropdown: true,
    decimalPlaces: 0,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: 'Single plated serving'
  },
  {
    id: 'unit-026',
    code: 'glass',
    name: 'Glass',
    pluralName: 'Glasses',
    displayOrder: 26,
    showInDropdown: true,
    decimalPlaces: 0,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: 'Single glass serving'
  },
  {
    id: 'unit-027',
    code: 'taco',
    name: 'Taco',
    pluralName: 'Tacos',
    displayOrder: 27,
    showInDropdown: true,
    decimalPlaces: 0,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: 'Single taco'
  },
  {
    id: 'unit-028',
    code: 'burger',
    name: 'Burger',
    pluralName: 'Burgers',
    displayOrder: 28,
    showInDropdown: true,
    decimalPlaces: 0,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: 'Single burger'
  },
  {
    id: 'unit-029',
    code: 'wrap',
    name: 'Wrap',
    pluralName: 'Wraps',
    displayOrder: 29,
    showInDropdown: true,
    decimalPlaces: 0,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: 'Single wrap'
  },
  {
    id: 'unit-030',
    code: 'sandwich',
    name: 'Sandwich',
    pluralName: 'Sandwiches',
    displayOrder: 30,
    showInDropdown: true,
    decimalPlaces: 0,
    roundingMethod: 'round',
    isActive: true,
    isSystemUnit: true,
    example: 'Single sandwich'
  }
]

// ============================================================================
// UNIT CONVERSIONS
// ============================================================================

export const mockUnitConversions: UnitConversion[] = [
  // Weight conversions
  { id: 'conv-001', fromUnitId: 'unit-002', fromUnitCode: 'kg', toUnitId: 'unit-001', toUnitCode: 'g', conversionFactor: 1000, isApproximate: false, isActive: true },
  { id: 'conv-002', fromUnitId: 'unit-004', fromUnitCode: 'oz', toUnitId: 'unit-001', toUnitCode: 'g', conversionFactor: 28.3495, isApproximate: true, isActive: true },
  { id: 'conv-003', fromUnitId: 'unit-005', fromUnitCode: 'lb', toUnitId: 'unit-001', toUnitCode: 'g', conversionFactor: 453.592, isApproximate: true, isActive: true },
  { id: 'conv-004', fromUnitId: 'unit-005', fromUnitCode: 'lb', toUnitId: 'unit-004', toUnitCode: 'oz', conversionFactor: 16, isApproximate: false, isActive: true },
  // Volume conversions
  { id: 'conv-005', fromUnitId: 'unit-007', fromUnitCode: 'l', toUnitId: 'unit-006', toUnitCode: 'ml', conversionFactor: 1000, isApproximate: false, isActive: true },
  { id: 'conv-006', fromUnitId: 'unit-009', fromUnitCode: 'tbsp', toUnitId: 'unit-008', toUnitCode: 'tsp', conversionFactor: 3, isApproximate: false, isActive: true },
  { id: 'conv-007', fromUnitId: 'unit-010', fromUnitCode: 'cup', toUnitId: 'unit-006', toUnitCode: 'ml', conversionFactor: 236.588, isApproximate: true, isActive: true },
  { id: 'conv-008', fromUnitId: 'unit-011', fromUnitCode: 'fl oz', toUnitId: 'unit-006', toUnitCode: 'ml', conversionFactor: 29.5735, isApproximate: true, isActive: true },
  // Count conversions
  { id: 'conv-009', fromUnitId: 'unit-013', fromUnitCode: 'doz', toUnitId: 'unit-012', toUnitCode: 'pcs', conversionFactor: 12, isApproximate: false, isActive: true }
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getEquipmentByCategory(category: string): Equipment[] {
  return mockEquipment.filter(eq => eq.category === category && eq.isActive)
}

export function getEquipmentByStation(station: string): Equipment[] {
  return mockEquipment.filter(eq => eq.station === station && eq.isActive)
}

export function getActiveEquipment(): Equipment[] {
  return mockEquipment.filter(eq => eq.status === 'active' && eq.isActive)
}

export function getActiveRecipeUnits(): RecipeUnit[] {
  return mockRecipeUnits.filter(unit => unit.isActive)
}

export function getRecipeUnitsForDropdown(): RecipeUnit[] {
  return mockRecipeUnits.filter(unit => unit.showInDropdown && unit.isActive)
}

export function convertUnit(value: number, fromUnitCode: string, toUnitCode: string): number | null {
  const conversion = mockUnitConversions.find(
    c => c.fromUnitCode === fromUnitCode && c.toUnitCode === toUnitCode && c.isActive
  )
  if (conversion) {
    return value * conversion.conversionFactor
  }
  // Try reverse conversion
  const reverseConversion = mockUnitConversions.find(
    c => c.fromUnitCode === toUnitCode && c.toUnitCode === fromUnitCode && c.isActive
  )
  if (reverseConversion) {
    return value / reverseConversion.conversionFactor
  }
  return null
}
