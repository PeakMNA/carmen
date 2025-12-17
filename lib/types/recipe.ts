/**
 * Recipe and Operational Planning Types
 * 
 * Types and interfaces for recipe management, ingredients, preparation steps,
 * yield variants, and operational planning functionality.
 */

import { AuditTimestamp, Money, Category } from './common'

// ====== RECIPE CORE TYPES ======

/**
 * Recipe status types
 */
export type RecipeStatus = 'draft' | 'published' | 'archived' | 'under_review' | 'approved' | 'rejected';

/**
 * Recipe complexity levels
 */
export type RecipeComplexity = 'simple' | 'moderate' | 'complex' | 'advanced';

/**
 * Main recipe interface
 */
export interface Recipe {
  id: string;
  recipeCode: string;
  name: string;
  displayName?: string;
  description: string;
  shortDescription?: string;
  categoryId: string;
  cuisineTypeId: string;
  status: RecipeStatus;
  complexity: RecipeComplexity;
  // Basic recipe information
  yield: number;
  yieldUnit: string;
  basePortionSize: number;
  servingSize?: string;
  // Enhanced yield management for fractional sales
  yieldVariants: RecipeYieldVariant[];
  defaultYieldVariantId?: string;
  // Recipe details
  ingredients: Ingredient[];
  preparationSteps: PreparationStep[];
  // Timing information
  prepTime: number; // minutes
  cookTime: number; // minutes
  totalTime: number; // minutes
  restTime?: number; // minutes (for resting/cooling)
  // Costing information
  totalCost: Money;
  costPerPortion: Money;
  foodCostPercentage: number;
  targetFoodCostPercentage?: number;
  laborCostPerPortion?: Money;
  overheadCostPerPortion?: Money;
  // Nutritional information (optional)
  nutritionalInfo?: NutritionalInfo;
  // Equipment and requirements
  requiredEquipment: string[];
  skillLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  // Storage and shelf life
  storageInstructions?: string;
  shelfLife?: number; // hours
  reheatingInstructions?: string;
  // Allergens and dietary
  allergens: string[];
  dietaryRestrictions: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  isHalal: boolean;
  isKosher: boolean;
  // Media and documentation
  image: string;
  additionalImages?: string[];
  videoUrl?: string;
  documentUrls?: string[];
  // Quality control
  qualityStandards?: string;
  platingInstructions?: string;
  garnishInstructions?: string;
  // Business information
  isActive: boolean;
  isMenuActive: boolean;
  seasonality?: string[];
  popularity?: number; // 0-5 rating
  difficultyRating?: number; // 0-5 rating
  // Version control
  version: string;
  parentRecipeId?: string; // For recipe variations
  // Tags and classification
  tags: string[];
  keywords: string[];
  // Audit information
  developedBy: string;
  testedBy?: string[];
  approvedBy?: string;
  approvedAt?: Date;
  lastTestedDate?: Date;
  reviewNotes?: string;
}

// ====== RECIPE INGREDIENTS ======

/**
 * Recipe ingredient
 */
export interface Ingredient {
  id: string;
  recipeId?: string; // Optional for reusable ingredients
  name: string;
  type: 'product' | 'recipe'; // Can be a product or sub-recipe
  productId?: string; // If type is 'product'
  subRecipeId?: string; // If type is 'recipe'
  // Quantity information
  quantity: number;
  unit: string;
  // Yield and waste calculations
  wastage: number; // percentage
  yield: number; // percentage (after processing)
  netQuantity: number; // after wastage and yield
  // Inventory information
  inventoryQty: number;
  inventoryUnit: string;
  conversionFactor: number; // to convert recipe unit to inventory unit
  // Costing
  costPerUnit: Money;
  totalCost: Money;
  // Preparation details
  preparation?: string; // e.g., "diced", "chopped fine"
  processingLoss?: number; // percentage lost during processing
  // Alternatives and substitutions
  isOptional: boolean;
  substitutes: IngredientSubstitute[];
  // Notes and instructions
  notes?: string;
  handlingInstructions?: string;
  // Quality specifications
  qualityGrade?: string;
  brandPreference?: string;
  // Ordering
  displayOrder: number;
  groupName?: string; // For grouping ingredients (e.g., "Marinade", "Sauce")
}

/**
 * Ingredient substitute options
 */
export interface IngredientSubstitute {
  id: string;
  productId?: string;
  subRecipeId?: string;
  name: string;
  conversionRatio: number; // how much substitute to use relative to original
  notes?: string;
  isPreferred: boolean;
}

// ====== PREPARATION STEPS ======

/**
 * Recipe preparation step
 */
export interface PreparationStep {
  id: string;
  recipeId?: string;
  order: number;
  stepNumber: string; // e.g., "1", "1a", "2"
  title?: string;
  description: string;
  detailedInstructions?: string;
  // Timing
  duration?: number; // minutes
  temperature?: number; // celsius
  temperatureRange?: {
    min: number;
    max: number;
  };
  // Equipment and tools
  equipments: string[];
  tools: string[];
  // Media
  image?: string;
  videoUrl?: string;
  // Quality checkpoints
  qualityCheckpoints?: string[];
  criticalControlPoint?: boolean; // For HACCP compliance
  // Dependencies
  dependsOnSteps?: string[]; // Step IDs that must be completed first
  canRunInParallel?: string[]; // Step IDs that can run simultaneously
  // Skill requirements
  skillLevel?: 'basic' | 'intermediate' | 'advanced';
  tips?: string[];
  commonMistakes?: string[];
  // Portioning information
  isPortionable: boolean; // Can this step be scaled with portions?
  scalingFactor?: number;
}

// ====== RECIPE YIELD VARIANTS ======

/**
 * Recipe yield variant for different portion sizes and selling options
 */
export interface RecipeYieldVariant {
  id: string;
  recipeId?: string;
  name: string; // e.g., "Half Portion", "Family Size", "Catering Tray"
  description?: string;
  unit: string;
  quantity: number;
  conversionRate: number; // Portion of base recipe (1.0 = whole recipe, 0.5 = half)
  // Pricing
  sellingPrice: Money;
  costPerUnit: Money;
  marginPercentage: number;
  // Operational details
  isDefault: boolean;
  isMenuAvailable: boolean;
  preparationTime?: number; // if different from base recipe
  // Inventory impact
  shelfLife?: number; // Hours after preparation/opening
  wastageRate?: number; // Expected waste percentage for this variant
  // Ordering constraints
  minOrderQuantity?: number;
  maxOrderQuantity?: number;
  // Packaging
  packagingType?: string;
  packagingCost?: Money;
  // Display information
  displayOrder: number;
  isActive: boolean;
}

// ====== RECIPE CATEGORIES ======

/**
 * Recipe category
 */
export interface RecipeCategory extends Category {
  code?: string;
  image?: string;
  // Category properties
  defaultPrepTime?: number; // minutes
  defaultCookTime?: number; // minutes
  defaultShelfLife?: number; // hours
  // Kitchen workflow
  defaultStation?: string; // Kitchen station/section
  defaultSkillLevel?: string;
  // Food safety
  criticalControlPoints?: string[];
  allergenWarnings?: string[];
  // Menu organization
  menuSection?: string;
  displayOrder?: number;
  // Cost and margin settings (inherited by recipes in this category)
  defaultCostSettings?: {
    laborCostPercentage: number;
    overheadPercentage: number;
    targetFoodCostPercentage: number;
  };
  defaultMargins?: {
    minimumMargin: number;
    targetMargin: number;
  };
}

// ====== CUISINE TYPES ======

/**
 * Cuisine type classification
 */
export interface CuisineType {
  id: string;
  name: string;
  description?: string;
  code?: string;
  region?: string;
  country?: string;
  // Characteristics
  typicalIngredients?: string[];
  cookingMethods?: string[];
  flavorProfile?: string[];
  spiceLevel?: 'mild' | 'medium' | 'hot' | 'very_hot';
  // Presentation
  image?: string;
  flag?: string; // Country flag image
  // Status
  isActive: boolean;
  displayOrder: number;
}

// ====== NUTRITIONAL INFORMATION ======

/**
 * Nutritional information per serving
 */
export interface NutritionalInfo {
  servingSize: string;
  servingSizeGrams: number;
  // Macronutrients
  calories: number;
  totalFat: number; // grams
  saturatedFat: number; // grams
  transFat: number; // grams
  cholesterol: number; // mg
  sodium: number; // mg
  totalCarbohydrates: number; // grams
  dietaryFiber: number; // grams
  sugars: number; // grams
  addedSugars: number; // grams
  protein: number; // grams
  // Vitamins (% daily value)
  vitaminA?: number;
  vitaminC?: number;
  vitaminD?: number;
  vitaminE?: number;
  vitaminK?: number;
  // Minerals (% daily value)
  calcium?: number;
  iron?: number;
  potassium?: number;
  magnesium?: number;
  phosphorus?: number;
  zinc?: number;
  // Additional nutritional data
  omega3?: number; // grams
  omega6?: number; // grams
  caffeine?: number; // mg
  alcohol?: number; // grams
  // Calculated values
  caloriesFromFat: number;
  proteinPercentage: number;
  carbPercentage: number;
  fatPercentage: number;
  // Verification
  verifiedBy?: string;
  verifiedAt?: Date;
  analysisMethod?: 'calculated' | 'laboratory' | 'database';
}

// ====== RECIPE COSTING ======

/**
 * Detailed recipe costing breakdown
 */
export interface RecipeCostBreakdown {
  recipeId: string;
  yieldVariantId?: string;
  calculatedAt: Date;
  // Direct costs
  ingredientCosts: IngredientCostDetail[];
  totalIngredientCost: Money;
  // Labor costs
  laborCostPerHour: Money;
  totalLaborCost: Money;
  laborCostPerPortion: Money;
  // Overhead costs
  utilityCost: Money;
  equipmentDepreciation: Money;
  overheadCostPerPortion: Money;
  // Total costs
  totalDirectCost: Money;
  totalCostPerPortion: Money;
  // Pricing analysis
  suggestedSellingPrice: Money;
  targetMarginPercentage: number;
  actualMarginPercentage: number;
  competitivePrice?: Money;
  // Market analysis
  marketPositioning?: 'budget' | 'standard' | 'premium' | 'luxury';
  pricePoint?: 'low' | 'medium' | 'high';
}

/**
 * Individual ingredient cost detail
 */
export interface IngredientCostDetail {
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  unit: string;
  unitCost: Money;
  totalCost: Money;
  costPerPortion: Money;
  percentageOfTotalCost: number;
  lastPriceUpdate: Date;
  supplier?: string;
}

// ====== RECIPE PRODUCTION ======

/**
 * Recipe production batch
 */
export interface RecipeProductionBatch {
  id: string;
  batchNumber: string;
  recipeId: string;
  yieldVariantId?: string;
  // Production details
  plannedQuantity: number;
  actualQuantity: number;
  unit: string;
  // Timing
  plannedStartTime: Date;
  actualStartTime?: Date;
  plannedEndTime: Date;
  actualEndTime?: Date;
  // Staff
  assignedChef: string;
  assistants?: string[];
  supervisor?: string;
  // Quality control
  qualityChecks: QualityCheck[];
  qualityApproved: boolean;
  qualityApprovedBy?: string;
  qualityApprovedAt?: Date;
  // Costs
  actualIngredientCost: Money;
  actualLaborCost: Money;
  totalActualCost: Money;
  costVariance: Money;
  // Yield analysis
  expectedYield: number;
  actualYield: number;
  yieldVariance: number; // percentage
  wasteGenerated: number;
  wasteReason?: string;
  // Status
  status: 'planned' | 'in_progress' | 'completed' | 'quality_check' | 'approved' | 'rejected';
  notes?: string;
}

/**
 * Quality check for recipe production
 */
export interface QualityCheck {
  id: string;
  checkType: 'visual' | 'taste' | 'temperature' | 'texture' | 'aroma' | 'portion_size';
  description: string;
  expectedValue?: string;
  actualValue?: string;
  passed: boolean;
  checkedBy: string;
  checkedAt: Date;
  notes?: string;
  correctiveAction?: string;
}

// ====== EQUIPMENT MANAGEMENT ======

/**
 * Equipment status types
 */
export type EquipmentStatus = 'active' | 'inactive' | 'maintenance' | 'retired';

/**
 * Equipment category types
 */
export type EquipmentCategory =
  | 'cooking'
  | 'preparation'
  | 'refrigeration'
  | 'storage'
  | 'serving'
  | 'cleaning'
  | 'small_appliance'
  | 'utensil'
  | 'other';

/**
 * Kitchen equipment used in recipe preparation
 */
export interface Equipment {
  id: string;
  code: string;
  name: string;
  description?: string;
  category: EquipmentCategory;
  // Physical details
  brand?: string;
  model?: string;
  serialNumber?: string;
  // Capacity and specifications
  capacity?: string; // e.g., "10 liters", "6 burners"
  powerRating?: string; // e.g., "2000W", "Gas"
  dimensions?: {
    width: number;
    height: number;
    depth: number;
    unit: 'cm' | 'inch';
  };
  // Location and assignment
  locationId?: string;
  station?: string; // Kitchen station (e.g., "Grill Station", "Prep Area")
  // Operational details
  operatingInstructions?: string;
  safetyNotes?: string;
  cleaningInstructions?: string;
  // Maintenance
  maintenanceSchedule?: string; // e.g., "Weekly", "Monthly"
  lastMaintenanceDate?: Date;
  nextMaintenanceDate?: Date;
  // Status and availability
  status: EquipmentStatus;
  isPortable: boolean;
  availableQuantity: number;
  totalQuantity: number;
  // Usage tracking
  usageCount?: number;
  averageUsageTime?: number; // minutes per use
  // Media
  image?: string;
  manualUrl?: string;
  // Display
  displayOrder: number;
  isActive: boolean;
  // Audit
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

// ====== RECIPE UNITS MANAGEMENT ======

/**
 * Recipe unit of measure for ingredients and yields
 */
export interface RecipeUnit {
  id: string;
  code: string; // e.g., "kg", "ml", "pcs", "tbsp"
  name: string; // e.g., "Kilogram", "Milliliter", "Pieces", "Tablespoon"
  pluralName?: string; // e.g., "Kilograms", "Milliliters"
  // Display
  displayOrder: number;
  showInDropdown: boolean;
  // Precision
  decimalPlaces: number; // How many decimal places to display
  roundingMethod: 'round' | 'floor' | 'ceil';
  // Status
  isActive: boolean;
  isSystemUnit: boolean; // System-defined vs user-created
  // Examples for user guidance
  example?: string; // e.g., "1 tbsp = 15ml"
  notes?: string;
  // Audit
  createdAt?: Date;
  updatedAt?: Date;
  createdBy?: string;
  updatedBy?: string;
}

/**
 * Unit conversion definition
 */
export interface UnitConversion {
  id: string;
  fromUnitId: string;
  fromUnitCode: string;
  toUnitId: string;
  toUnitCode: string;
  conversionFactor: number; // fromUnit * factor = toUnit
  // Context-specific conversions
  productId?: string; // For product-specific conversions (e.g., 1 egg = 50g)
  categoryId?: string; // For category-specific conversions
  isApproximate: boolean; // Whether conversion is approximate
  notes?: string;
  isActive: boolean;
}

// ====== RECIPE ANALYTICS ======

/**
 * Recipe performance metrics
 */
export interface RecipeMetrics {
  recipeId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  // Production metrics
  totalBatchesProduced: number;
  totalQuantityProduced: number;
  averageBatchSize: number;
  productionEfficiency: number; // percentage
  // Quality metrics
  qualityPassRate: number; // percentage
  averageYieldVariance: number; // percentage
  wastePercentage: number;
  reworkBatches: number;
  // Cost metrics
  averageCostPerPortion: Money;
  costVariance: Money;
  ingredientCostTrend: number; // percentage change
  // Popularity metrics
  orderFrequency: number;
  customerRating?: number; // 0-5
  returnRate: number; // percentage
  // Profitability
  averageSellingPrice: Money;
  grossMargin: Money;
  grossMarginPercentage: number;
  totalRevenue: Money;
  totalProfit: Money;
  // Staff feedback
  preparationDifficulty: number; // 0-5 rating
  timeAccuracy: number; // actual vs planned time percentage
  lastUpdated: Date;
}