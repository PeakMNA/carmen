import { RecipeCategory } from '@/lib/types'

// Type for category cost defaults returned by getCategoryDefaults
export interface CategoryCostDefaults {
  laborCostPercentage: number;
  overheadPercentage: number;
  targetFoodCostPercentage: number;
  minimumMargin: number;
  targetMargin: number;
}

// System-wide default values when category has no specific settings
export const SYSTEM_COST_DEFAULTS: CategoryCostDefaults = {
  laborCostPercentage: 30,
  overheadPercentage: 20,
  targetFoodCostPercentage: 30,
  minimumMargin: 60,
  targetMargin: 70
};

export const mockCategories: RecipeCategory[] = [
  {
    // Base Category fields
    id: "1",
    name: "Appetizers",
    description: "Small dishes served before main courses",
    parentId: undefined,
    level: 1,
    isActive: true,
    // RecipeCategory specific fields
    code: "APP",
    defaultPrepTime: 15,
    defaultCookTime: 10,
    defaultShelfLife: 2,
    defaultStation: "Cold Station",
    defaultSkillLevel: "intermediate",
    menuSection: "Starters",
    displayOrder: 1,
    // Cost and margin settings
    defaultCostSettings: {
      laborCostPercentage: 30,
      overheadPercentage: 20,
      targetFoodCostPercentage: 30
    },
    defaultMargins: {
      minimumMargin: 65,
      targetMargin: 70
    }
  },
  {
    id: "1-1",
    name: "Cold Appetizers",
    description: "Appetizers served cold or at room temperature",
    parentId: "1",
    level: 2,
    isActive: true,
    code: "APP-COLD",
    defaultPrepTime: 10,
    defaultCookTime: 0,
    defaultShelfLife: 4,
    defaultStation: "Cold Station",
    defaultSkillLevel: "beginner",
    menuSection: "Starters",
    displayOrder: 1,
    // Inherits from parent but with lower labor (simpler prep)
    defaultCostSettings: {
      laborCostPercentage: 25,
      overheadPercentage: 18,
      targetFoodCostPercentage: 28
    },
    defaultMargins: {
      minimumMargin: 65,
      targetMargin: 72
    }
  },
  {
    id: "1-2",
    name: "Hot Appetizers",
    description: "Appetizers served hot",
    parentId: "1",
    level: 2,
    isActive: true,
    code: "APP-HOT",
    defaultPrepTime: 15,
    defaultCookTime: 15,
    defaultShelfLife: 1,
    defaultStation: "Hot Station",
    defaultSkillLevel: "intermediate",
    criticalControlPoints: ["Temperature control - keep above 140°F"],
    menuSection: "Starters",
    displayOrder: 2,
    // Higher overhead due to cooking equipment
    defaultCostSettings: {
      laborCostPercentage: 32,
      overheadPercentage: 22,
      targetFoodCostPercentage: 30
    },
    defaultMargins: {
      minimumMargin: 63,
      targetMargin: 68
    }
  },
  {
    id: "2",
    name: "Main Courses",
    description: "Primary dishes for a meal",
    parentId: undefined,
    level: 1,
    isActive: true,
    code: "MAIN",
    defaultPrepTime: 20,
    defaultCookTime: 30,
    defaultShelfLife: 2,
    defaultStation: "Main Kitchen",
    defaultSkillLevel: "advanced",
    menuSection: "Entrées",
    displayOrder: 2,
    // Higher labor for complex dishes
    defaultCostSettings: {
      laborCostPercentage: 35,
      overheadPercentage: 25,
      targetFoodCostPercentage: 32
    },
    defaultMargins: {
      minimumMargin: 60,
      targetMargin: 65
    }
  },
  {
    id: "2-1",
    name: "Meat Dishes",
    description: "Main courses featuring meat as primary ingredient",
    parentId: "2",
    level: 2,
    isActive: true,
    code: "MAIN-MEAT",
    defaultPrepTime: 15,
    defaultCookTime: 35,
    defaultShelfLife: 2,
    defaultStation: "Grill Station",
    defaultSkillLevel: "advanced",
    criticalControlPoints: ["Internal temperature - minimum 165°F for poultry, 145°F for beef"],
    menuSection: "Entrées",
    displayOrder: 1,
    // Premium ingredients, higher food cost
    defaultCostSettings: {
      laborCostPercentage: 32,
      overheadPercentage: 25,
      targetFoodCostPercentage: 35
    },
    defaultMargins: {
      minimumMargin: 55,
      targetMargin: 62
    }
  },
  {
    id: "2-2",
    name: "Seafood",
    description: "Main courses featuring seafood",
    parentId: "2",
    level: 2,
    isActive: true,
    code: "MAIN-FISH",
    defaultPrepTime: 10,
    defaultCookTime: 20,
    defaultShelfLife: 1,
    defaultStation: "Seafood Station",
    defaultSkillLevel: "advanced",
    criticalControlPoints: ["Internal temperature - minimum 145°F", "Freshness check"],
    allergenWarnings: ["Shellfish", "Fish"],
    menuSection: "Entrées",
    displayOrder: 2,
    // Premium seafood, highest food cost but also highest markup potential
    defaultCostSettings: {
      laborCostPercentage: 30,
      overheadPercentage: 22,
      targetFoodCostPercentage: 38
    },
    defaultMargins: {
      minimumMargin: 52,
      targetMargin: 60
    }
  },
  {
    id: "2-3",
    name: "Vegetarian",
    description: "Vegetarian main courses",
    parentId: "2",
    level: 2,
    isActive: true,
    code: "MAIN-VEG",
    defaultPrepTime: 20,
    defaultCookTime: 25,
    defaultShelfLife: 3,
    defaultStation: "Vegetable Station",
    defaultSkillLevel: "intermediate",
    menuSection: "Entrées",
    displayOrder: 3,
    // Lower ingredient costs, good margins
    defaultCostSettings: {
      laborCostPercentage: 35,
      overheadPercentage: 22,
      targetFoodCostPercentage: 25
    },
    defaultMargins: {
      minimumMargin: 65,
      targetMargin: 72
    }
  },
  {
    id: "3",
    name: "Desserts",
    description: "Sweet dishes served after main courses",
    parentId: undefined,
    level: 1,
    isActive: true,
    code: "DES",
    defaultPrepTime: 30,
    defaultCookTime: 25,
    defaultShelfLife: 24,
    defaultStation: "Pastry Station",
    defaultSkillLevel: "advanced",
    menuSection: "Desserts",
    displayOrder: 3,
    // High labor (pastry skills), excellent margins
    defaultCostSettings: {
      laborCostPercentage: 40,
      overheadPercentage: 25,
      targetFoodCostPercentage: 25
    },
    defaultMargins: {
      minimumMargin: 70,
      targetMargin: 75
    }
  },
  {
    id: "3-1",
    name: "Cakes & Pastries",
    description: "Baked desserts including cakes and pastries",
    parentId: "3",
    level: 2,
    isActive: true,
    code: "DES-CAKE",
    defaultPrepTime: 45,
    defaultCookTime: 30,
    defaultShelfLife: 48,
    defaultStation: "Pastry Station",
    defaultSkillLevel: "advanced",
    allergenWarnings: ["Gluten", "Eggs", "Dairy", "Nuts"],
    menuSection: "Desserts",
    displayOrder: 1,
    // Highest labor due to artisan work
    defaultCostSettings: {
      laborCostPercentage: 45,
      overheadPercentage: 28,
      targetFoodCostPercentage: 22
    },
    defaultMargins: {
      minimumMargin: 72,
      targetMargin: 78
    }
  },
  {
    id: "3-2",
    name: "Frozen Desserts",
    description: "Ice cream, sorbets, and frozen treats",
    parentId: "3",
    level: 2,
    isActive: true,
    code: "DES-FROZEN",
    defaultPrepTime: 15,
    defaultCookTime: 0,
    defaultShelfLife: 720, // 30 days
    defaultStation: "Pastry Station",
    defaultSkillLevel: "intermediate",
    criticalControlPoints: ["Storage temperature - maintain below 0°F"],
    allergenWarnings: ["Dairy", "Eggs"],
    menuSection: "Desserts",
    displayOrder: 2,
    // Lower labor, higher overhead (freezer equipment)
    defaultCostSettings: {
      laborCostPercentage: 25,
      overheadPercentage: 30,
      targetFoodCostPercentage: 20
    },
    defaultMargins: {
      minimumMargin: 75,
      targetMargin: 80
    }
  },
  {
    id: "4",
    name: "Beverages",
    description: "Hot and cold drinks",
    parentId: undefined,
    level: 1,
    isActive: true,
    code: "BEV",
    defaultPrepTime: 5,
    defaultCookTime: 0,
    defaultShelfLife: 2,
    defaultStation: "Bar",
    defaultSkillLevel: "beginner",
    menuSection: "Beverages",
    displayOrder: 4,
    // Lowest labor, highest margins in F&B
    defaultCostSettings: {
      laborCostPercentage: 15,
      overheadPercentage: 15,
      targetFoodCostPercentage: 20
    },
    defaultMargins: {
      minimumMargin: 75,
      targetMargin: 82
    }
  },
  {
    id: "5",
    name: "Salads",
    description: "Fresh salads and cold dishes",
    parentId: undefined,
    level: 1,
    isActive: true,
    code: "SAL",
    defaultPrepTime: 10,
    defaultCookTime: 0,
    defaultShelfLife: 4,
    defaultStation: "Cold Station",
    defaultSkillLevel: "beginner",
    criticalControlPoints: ["Wash all vegetables thoroughly", "Keep refrigerated until service"],
    menuSection: "Salads",
    displayOrder: 5,
    // Low labor, low overhead, good margins
    defaultCostSettings: {
      laborCostPercentage: 22,
      overheadPercentage: 15,
      targetFoodCostPercentage: 28
    },
    defaultMargins: {
      minimumMargin: 68,
      targetMargin: 73
    }
  }
]

/**
 * Get category cost defaults for a given category ID.
 * Returns the merged cost settings and margins, or system defaults if not found.
 */
export function getCategoryDefaults(categoryId: string): CategoryCostDefaults {
  const category = mockCategories.find(c => c.id === categoryId);

  if (!category) {
    return SYSTEM_COST_DEFAULTS;
  }

  // Merge category settings with system defaults (category values take precedence)
  return {
    laborCostPercentage: category.defaultCostSettings?.laborCostPercentage ?? SYSTEM_COST_DEFAULTS.laborCostPercentage,
    overheadPercentage: category.defaultCostSettings?.overheadPercentage ?? SYSTEM_COST_DEFAULTS.overheadPercentage,
    targetFoodCostPercentage: category.defaultCostSettings?.targetFoodCostPercentage ?? SYSTEM_COST_DEFAULTS.targetFoodCostPercentage,
    minimumMargin: category.defaultMargins?.minimumMargin ?? SYSTEM_COST_DEFAULTS.minimumMargin,
    targetMargin: category.defaultMargins?.targetMargin ?? SYSTEM_COST_DEFAULTS.targetMargin,
  };
}

/**
 * Get recipe category by ID
 */
export function getRecipeCategoryById(categoryId: string): RecipeCategory | undefined {
  return mockCategories.find(c => c.id === categoryId);
}
