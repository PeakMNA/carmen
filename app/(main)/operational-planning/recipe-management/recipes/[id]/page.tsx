"use client"

import { Suspense, useState } from "react"
import { Recipe, Ingredient, PreparationStep } from '@/lib/types'
import { mockRecipes } from '@/lib/mock-data'
import { getCategoryDefaults, getRecipeCategoryById } from '@/lib/mock-data/categories'
import { MarginCalculator } from '../components/margin-calculator'
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  ChevronLeft,
  Clock,
  Edit,
  FileDown,
  Printer,
  Share2,
  History,
  Leaf,
  AlertCircle,
  UploadCloud,
  Thermometer,
  Plus,
  Info,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { RecipeImage } from "../components/recipe-image"

interface RecipeViewPageProps {
  params: {
    id: string
  }
}

interface GroupedIngredients {
  [key: string]: Ingredient[]
}

function groupIngredientsByComponent(ingredients: Ingredient[]): GroupedIngredients {
  return ingredients.reduce((acc: GroupedIngredients, ingredient) => {
    const component = ingredient.type === 'recipe' ? 'Base Recipes' : 'Main Ingredients'
    if (!acc[component]) {
      acc[component] = []
    }
    acc[component].push(ingredient)
    return acc
  }, {})
}

// Helper function to check if an ingredient is in stock
function isInStock(ingredient: Ingredient): boolean {
  return ingredient.inventoryQty > 0
}

function formatMeasurement(quantity: number, unit: string): string {
  return `${quantity} ${unit}`
}

export default function RecipeViewPage({ params }: RecipeViewPageProps) {
  const recipe = mockRecipes.find(r => r.id === params.id)
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null)

  if (!recipe) {
    return (
      <div className="container mx-auto py-12">
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <h2 className="text-2xl font-semibold">Recipe Not Found</h2>
            <p className="text-muted-foreground max-w-md">
              The recipe you&apos;re looking for doesn&apos;t exist or may have been deleted.
            </p>
            <Link href="/operational-planning/recipe-management/recipes">
              <Button>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Recipes
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 px-3 space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Link href="/operational-planning/recipe-management/recipes">
              <Button variant="ghost" size="sm">
                <ChevronLeft className="h-4 w-4 mr-2" />
                Back to Recipes
              </Button>
            </Link>
            <Badge variant={recipe.status === 'published' ? 'default' : 'secondary'}>
              {recipe.status}
            </Badge>
          </div>
          <h1 className="text-3xl font-bold">{recipe.name}</h1>
          <p className="text-sm text-muted-foreground">Recipe Code: {recipe.id}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <History className="h-4 w-4 mr-2" />
            History
          </Button>
          <Button variant="outline" size="sm">
            <Share2 className="h-4 w-4 mr-2" />
            Share
          </Button>
          <Button variant="outline" size="sm">
            <Printer className="h-4 w-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm">
            <FileDown className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Link href={`/operational-planning/recipe-management/recipes/${recipe.id}/edit`}>
            <Button size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit Recipe
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-3 gap-6">
        {/* Left Column - Overview and Image */}
        <div className="space-y-6">
          {/* Recipe Image */}
          <div className="relative">
            <RecipeImage
              src={recipe.image}
              alt={recipe.name}
              aspectRatio="video"
              priority={true}
            />
          </div>

          <Card className="px-3 py-6 space-y-4">
            <h2 className="text-lg font-semibold">Basic Information</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Category</p>
                <p className="font-medium">{recipe.categoryId}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Recipe Unit</p>
                <p className="font-medium">Per Recipe</p>
              </div>
              <div>
                <p className="text-muted-foreground">Unit of Sale</p>
                <p className="font-medium">Per Portion</p>
              </div>
              <div>
                <p className="text-muted-foreground">Number of Portions</p>
                <p className="font-medium">{recipe.yield}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Preparation Time</p>
                <p className="font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {recipe.prepTime} mins
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Total Time</p>
                <p className="font-medium flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {recipe.totalTime} mins
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Developed By</p>
                <p className="font-medium">{recipe.developedBy || 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Last Tested</p>
                <p className="font-medium">{recipe.lastTestedDate ? new Date(recipe.lastTestedDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Status</p>
                <Badge variant={recipe.isActive ? "default" : "secondary"}>
                  {recipe.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="px-3 py-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Dietary Information</h2>
              <Leaf className="h-5 w-5 text-green-500" />
            </div>
            <div className="space-y-2">
              {recipe.isVegetarian && (
                <Badge variant="secondary">Vegetarian</Badge>
              )}
              {recipe.isVegan && (
                <Badge variant="secondary">Vegan</Badge>
              )}
              {recipe.isGlutenFree && (
                <Badge variant="secondary">Gluten Free</Badge>
              )}
              {recipe.isHalal && (
                <Badge variant="secondary">Halal</Badge>
              )}
              {recipe.isKosher && (
                <Badge variant="secondary">Kosher</Badge>
              )}
            </div>
          </Card>
        </div>

        {/* Right Column - Details Tabs */}
        <div className="col-span-2">
          <Tabs defaultValue="ingredients" className="w-full">
            <TabsList>
              <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
              <TabsTrigger value="preparation">Preparation</TabsTrigger>
              <TabsTrigger value="cost">Cost Summary</TabsTrigger>
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="notes">Notes</TabsTrigger>
            </TabsList>

            <TabsContent value="ingredients" className="space-y-4">
              <div className="grid grid-cols-[2fr,1fr] gap-4">
                {/* Left Panel - Ingredients List */}
                <div className="space-y-4">
                  <Card className="px-3 py-6">
                    <div className="flex justify-between items-center mb-6">
                      <div>
                        <h3 className="font-semibold">Recipe Components</h3>
                        <p className="text-sm text-muted-foreground">All measurements are in recipe units</p>
                      </div>
                      <Badge variant="outline">{recipe.yield} {recipe.yieldUnit}</Badge>
                    </div>
                    <div className="space-y-8">
                      {/* Group ingredients by component */}
                      {Object.entries(groupIngredientsByComponent(recipe.ingredients)).map(([component, ingredients]) => (
                        <div key={component} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <h3 className={cn(
                              "text-lg font-semibold text-muted-foreground",
                              component === 'Main Ingredients' && "italic"
                            )}>
                              {component}
                            </h3>
                            <Badge variant="secondary">
                              {ingredients.length} {ingredients.length === 1 ? 'item' : 'items'}
                            </Badge>
                          </div>
                          <div className="space-y-4">
                            {ingredients.map((ingredient, index) => (
                              <div 
                                key={index} 
                                className={cn(
                                  "bg-muted/50 rounded-lg p-4 cursor-pointer hover:bg-muted/70 transition-colors",
                                  selectedIngredient?.id === ingredient.id && "ring-2 ring-primary"
                                )}
                                onClick={() => setSelectedIngredient(ingredient)}
                              >
                                <div className="flex justify-between items-start">
                                  <div>
                                    <h4 className="font-medium">{ingredient.name}</h4>
                                  </div>
                                  <Badge 
                                    variant="secondary"
                                    className="w-24 justify-center"
                                  >
                                    {formatMeasurement(ingredient.quantity, ingredient.unit)}
                                  </Badge>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

                {/* Right Panel - Inventory Details */}
                <div className="space-y-4">
                  {/* Ingredient Details */}
                  <Card className="px-3 py-6">
                    <h3 className="font-semibold mb-4">Ingredient Details</h3>
                    {selectedIngredient ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Status</span>
                          <Badge variant={isInStock(selectedIngredient) ? "secondary" : "destructive"}>
                            {isInStock(selectedIngredient) ? "In Stock" : "Out of Stock"}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Inventory Qty</span>
                            <span>{formatMeasurement(selectedIngredient.inventoryQty, selectedIngredient.inventoryUnit || selectedIngredient.unit)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Wastage</span>
                            <span>{selectedIngredient.wastage}%</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Cost/Unit</span>
                            <span>${selectedIngredient.costPerUnit.amount.toFixed(2)}/{selectedIngredient.unit}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Net Cost</span>
                            <span>${(selectedIngredient.quantity * selectedIngredient.costPerUnit.amount).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Wastage Cost</span>
                            <span>${((selectedIngredient.quantity * selectedIngredient.costPerUnit.amount * selectedIngredient.wastage) / 100).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm font-medium">
                            <span>Total Cost</span>
                            <span>${selectedIngredient.totalCost.amount.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground text-center py-4">
                        Select an ingredient to view details
                      </div>
                    )}
                  </Card>

                  {/* Inventory Status */}
                  <Card className="px-3 py-6">
                    <h3 className="font-semibold mb-4">Inventory Status</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Missing Items</span>
                        <Badge variant="destructive">
                          {recipe.ingredients.filter(i => !isInStock(i)).length} Items
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        {recipe.ingredients
                          .filter(i => !isInStock(i))
                          .slice(0, 3)
                          .map((ingredient, index) => (
                            <div key={index} className="flex items-center justify-between text-sm p-2 bg-muted rounded-lg">
                              <div>
                                <span>{ingredient.name}</span>
                                <div className="text-xs text-muted-foreground">
                                  {formatMeasurement(ingredient.quantity, ingredient.unit)} needed
                                </div>
                              </div>
                              <Badge variant="outline" className="text-destructive border-destructive">
                                Out of Stock
                              </Badge>
                            </div>
                          ))}
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        View All Missing Items
                      </Button>
                    </div>
                  </Card>

                  {/* Recipe Summary */}
                  <Card className="px-3 py-6">
                    <h3 className="font-semibold mb-4">Recipe Summary</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total Ingredients</span>
                          <span>{recipe.ingredients.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Components</span>
                          <span>{Object.keys(groupIngredientsByComponent(recipe.ingredients)).length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">In Stock</span>
                          <Badge variant="secondary">
                            {recipe.ingredients.filter(i => isInStock(i)).length} of {recipe.ingredients.length}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Allergens</span>
                          <Badge variant="secondary">2</Badge>
                        </div>
                      </div>
                      <div className="pt-2 border-t">
                        <h4 className="text-sm font-medium mb-2">Allergen Information</h4>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">Dairy</Badge>
                          <Badge variant="outline">Nuts</Badge>
                        </div>
                      </div>
                    </div>
                  </Card>

                  {/* Ordering Information */}
                  <Card className="px-3 py-6">
                    <h3 className="font-semibold mb-4">Ordering Information</h3>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Last Order</span>
                        <span>2024-02-15</span>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Next Order Due</span>
                        <Badge variant="secondary">2024-02-28</Badge>
                      </div>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-muted-foreground">Preferred Supplier</span>
                        <span>Metro Foods</span>
                      </div>
                      <Button variant="outline" size="sm" className="w-full">
                        Create Purchase Order
                      </Button>
                    </div>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preparation" className="space-y-6">
              {recipe.preparationSteps.map((step) => (
                <Card key={step.id} className="px-3 py-6">
                  <div className="grid grid-cols-[auto,300px,1fr] gap-6">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {step.order}
                    </div>

                    {/* Step Image */}
                    {step.image && (
                      <div className="relative">
                        <RecipeImage
                          src={step.image}
                          alt={`Step ${step.order}`}
                          aspectRatio="4:3"
                          priority={false}
                        />
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2">Instructions</h3>
                        <p className="text-sm">{step.description}</p>
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        {step.duration && (
                          <div>
                            <p className="text-sm text-muted-foreground">Duration</p>
                            <p className="font-medium flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              {step.duration} mins
                            </p>
                          </div>
                        )}
                        {step.temperature && (
                          <div>
                            <p className="text-sm text-muted-foreground">Temperature</p>
                            <p className="font-medium flex items-center">
                              <Thermometer className="h-4 w-4 mr-1" />
                              {step.temperature}°C
                            </p>
                          </div>
                        )}
                        {step.equipments && step.equipments.length > 0 && (
                          <div>
                            <p className="text-sm text-muted-foreground">Equipment</p>
                            <p className="font-medium">{step.equipments.join(', ')}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="cost" className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Cost Analysis</h2>
                <Button variant="outline" size="sm">
                  <Clock className="h-4 w-4 mr-2" />
                  Recalculate
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-6">
                {/* Ingredient Costs */}
                <Card className="px-3 py-6">
                  <h3 className="font-medium mb-4">Ingredient Costs</h3>
                  <div className="space-y-4">
                    <div className="border rounded-lg">
                      <table className="w-full">
                        <thead className="border-b">
                          <tr>
                            <th className="text-left p-3 text-sm font-medium">Item</th>
                            <th className="text-right p-3 text-sm font-medium">Cost</th>
                            <th className="text-right p-3 text-sm font-medium">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recipe.ingredients.length > 0 ? (
                            recipe.ingredients.map((ingredient, index) => (
                              <tr key={index} className="border-b">
                                <td className="p-3 text-sm">{ingredient.name}</td>
                                <td className="p-3 text-sm text-right">${ingredient.totalCost.amount.toFixed(2)}</td>
                                <td className="p-3 text-sm text-right">
                                  {((ingredient.totalCost.amount / recipe.totalCost.amount) * 100).toFixed(1)}%
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={3} className="p-3 text-sm text-center text-muted-foreground">
                                No ingredients added
                              </td>
                            </tr>
                          )}
                        </tbody>
                        <tfoot className="border-t bg-muted/50">
                          <tr>
                            <td className="p-3 text-sm font-medium">Total Ingredient Cost</td>
                            <td colSpan={2} className="p-3 text-sm text-right font-medium">
                              ${recipe.totalCost.amount.toFixed(2)}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </Card>

                {/* Margin Calculator - replaces Cost Summary and Pricing Analysis */}
                <MarginCalculator
                  recipe={recipe}
                  categoryDefaults={getCategoryDefaults(recipe.categoryId)}
                  categoryName={getRecipeCategoryById(recipe.categoryId)?.name}
                />
              </div>

              {/* Competitor Analysis */}
              <Card className="px-3 py-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium">Competitor Analysis</h3>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Competitor
                  </Button>
                </div>
                <div className="border rounded-lg">
                  <table className="w-full">
                    <thead className="border-b">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Competitor</th>
                        <th className="text-right p-3 text-sm font-medium">Price</th>
                        <th className="text-right p-3 text-sm font-medium">Portion</th>
                        <th className="text-right p-3 text-sm font-medium">Price/100g</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td colSpan={4} className="p-3 text-sm text-center text-muted-foreground">
                          No competitor data available
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Card className="px-3 py-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-2">Review Notes</h3>
                    <p className="text-muted-foreground">{recipe.reviewNotes || 'No review notes available.'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Plating Instructions</h3>
                    <p className="text-muted-foreground">{recipe.platingInstructions || 'No plating instructions available.'}</p>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-2">Storage Instructions</h3>
                    <p className="text-muted-foreground">{recipe.storageInstructions || 'No storage instructions available.'}</p>
                  </div>
                  {recipe.reheatingInstructions && (
                    <div>
                      <h3 className="font-semibold mb-2">Reheating Instructions</h3>
                      <p className="text-muted-foreground">{recipe.reheatingInstructions}</p>
                    </div>
                  )}
                  {recipe.garnishInstructions && (
                    <div>
                      <h3 className="font-semibold mb-2">Garnish Instructions</h3>
                      <p className="text-muted-foreground">{recipe.garnishInstructions}</p>
                    </div>
                  )}
                  {recipe.qualityStandards && (
                    <div>
                      <h3 className="font-semibold mb-2">Quality Standards</h3>
                      <p className="text-muted-foreground">{recipe.qualityStandards}</p>
                    </div>
                  )}
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              {/* Recipe Description */}
              <Card className="px-3 py-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Recipe Description</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>A brief description of your recipe</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <p className="text-muted-foreground">
                    {recipe.description || 'No description available.'}
                  </p>
                </div>
              </Card>

              {/* Ingredient Details */}
              <Card className="px-3 py-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Ingredient Details</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Additional details about the ingredients</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Allergens</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {recipe.allergens.length > 0 ? (
                          recipe.allergens.map((allergen, index) => (
                            <Badge key={index} variant="outline">
                              {allergen}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No allergens listed</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>Tags</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {recipe.tags.length > 0 ? (
                          recipe.tags.map((tag, index) => (
                            <Badge key={index} variant="outline">
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <p className="text-sm text-muted-foreground">No tags added</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
} 