"use client"

import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Recipe, Ingredient } from '@/lib/types'
import { mockIngredients, mockBaseRecipes } from '@/lib/mock-data'
import { Plus, Trash2, UploadCloud, Clock, ChevronLeft, History, Share2, Printer, Download, Search, Info, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface RecipeFormProps {
  initialData?: Recipe
  onSubmit: (data: Recipe) => void
}

export function RecipeForm({ initialData, onSubmit }: RecipeFormProps) {
  const [formData, setFormData] = useState<Recipe>(initialData || {
    id: '',
    recipeCode: '',
    name: '',
    displayName: '',
    description: '',
    shortDescription: '',
    categoryId: '',
    cuisineTypeId: '',
    status: 'draft',
    complexity: 'simple',
    yield: 0,
    yieldUnit: 'portions',
    basePortionSize: 0,
    servingSize: '',
    yieldVariants: [],
    defaultYieldVariantId: '',
    ingredients: [],
    preparationSteps: [],
    prepTime: 0,
    cookTime: 0,
    totalTime: 0,
    restTime: 0,
    totalCost: { amount: 0, currency: 'USD' },
    costPerPortion: { amount: 0, currency: 'USD' },
    foodCostPercentage: 0,
    targetFoodCostPercentage: 33,
    laborCostPerPortion: { amount: 0, currency: 'USD' },
    overheadCostPerPortion: { amount: 0, currency: 'USD' },
    requiredEquipment: [],
    skillLevel: 'beginner',
    storageInstructions: '',
    shelfLife: 0,
    reheatingInstructions: '',
    allergens: [],
    dietaryRestrictions: [],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    isHalal: false,
    isKosher: false,
    image: '',
    additionalImages: [],
    videoUrl: '',
    documentUrls: [],
    qualityStandards: '',
    platingInstructions: '',
    garnishInstructions: '',
    isActive: true,
    isMenuActive: false,
    seasonality: [],
    popularity: 0,
    difficultyRating: 0,
    version: '1.0',
    parentRecipeId: '',
    tags: [],
    keywords: [],
    developedBy: 'Current User',
    testedBy: [],
    approvedBy: '',
    lastTestedDate: new Date(),
    reviewNotes: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddIngredient = () => {
    const newIngredient: Ingredient = {
      id: '',
      name: '',
      type: 'product',
      quantity: 0,
      unit: '',
      wastage: 0,
      yield: 100,
      netQuantity: 0,
      inventoryQty: 0,
      inventoryUnit: '',
      conversionFactor: 1,
      costPerUnit: { amount: 0, currency: 'USD' },
      totalCost: { amount: 0, currency: 'USD' },
      isOptional: false,
      substitutes: [],
      displayOrder: formData.ingredients.length
    }
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }))
  }

  const handleIngredientChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newIngredients = [...prev.ingredients]
      newIngredients[index] = {
        ...newIngredients[index],
        [field]: value
      }
      return {
        ...prev,
        ingredients: newIngredients
      }
    })
  }

  const handleRemoveIngredient = (index: number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }))
  }

  const handleIngredientDetailedSize = (index: number, checked: boolean) => {
    setFormData(prev => {
      const newIngredients = [...prev.ingredients]
      if (checked) {
        newIngredients[index] = {
          ...newIngredients[index],
          notes: ''
        }
      } else {
        const { notes, ...rest } = newIngredients[index]
        newIngredients[index] = rest
      }
      return {
        ...prev,
        ingredients: newIngredients
      }
    })
  }

  const handleAddStep = () => {
    const newStep = {
      id: '',
      order: formData.preparationSteps.length + 1,
      stepNumber: (formData.preparationSteps.length + 1).toString(),
      description: '',
      duration: 0,
      temperature: undefined,
      equipments: [],
      tools: [],
      image: '',
      isPortionable: false
    }
    setFormData(prev => ({
      ...prev,
      preparationSteps: [...prev.preparationSteps, newStep]
    }))
  }

  const handleStepChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newSteps = [...prev.preparationSteps]
      newSteps[index] = {
        ...newSteps[index],
        [field]: value
      }
      return {
        ...prev,
        preparationSteps: newSteps
      }
    })
  }

  const handleRemoveStep = (index: number) => {
    setFormData(prev => {
      const newSteps = prev.preparationSteps.filter((_, i) => i !== index)
      newSteps.forEach((step, i) => {
        step.order = i + 1
        step.stepNumber = (i + 1).toString()
      })
      return {
        ...prev,
        preparationSteps: newSteps
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="px-6 py-6 px-3 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold">{initialData ? 'Edit Recipe' : 'Create new recipe'}</h1>
          <p className="text-sm text-muted-foreground">{initialData ? 'Update your recipe details' : 'Add a new recipe to your collection'}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" type="button">
            See preview
          </Button>
          <Button type="submit">
            {initialData ? 'Save changes' : 'Publish recipe'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-[350px,1fr] gap-8">
        {/* Left Column - Recipe General Information */}
        <div className="space-y-6">
          {/* Image Upload Card */}
          <Card className="p-6">
            <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary/50 transition-colors">
              <UploadCloud className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-1">Upload Photo</p>
              <p className="text-xs text-muted-foreground">PNG or JPEG (max. 10MB)</p>
            </div>
          </Card>

          {/* Basic Information Card */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              {/* Recipe Name */}
              <div>
                <Label>Recipe Name</Label>
                <Input 
                  placeholder="eg: Savory Stuffed Bell Peppers" 
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>

              {/* Category */}
              <div>
                <Label>Category</Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => handleInputChange('categoryId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="appetizer">Appetizer</SelectItem>
                    <SelectItem value="main-course">Main Course</SelectItem>
                    <SelectItem value="dessert">Dessert</SelectItem>
                    <SelectItem value="beverage">Beverage</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Recipe Unit */}
              <div>
                <Label>Recipe Unit</Label>
                <Select 
                  value={formData.yieldUnit}
                  onValueChange={(value) => handleInputChange('yieldUnit', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select unit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portions">Portions</SelectItem>
                    <SelectItem value="servings">Servings</SelectItem>
                    <SelectItem value="pieces">Pieces</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* # of Portions */}
              <div>
                <Label># of Portions</Label>
                <Input 
                  type="number"
                  value={formData.yield}
                  onChange={(e) => handleInputChange('yield', parseInt(e.target.value))}
                />
              </div>

              {/* Preparation Time */}
              <div>
                <Label>Preparation Time</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number"
                    value={formData.prepTime}
                    onChange={(e) => handleInputChange('prepTime', parseInt(e.target.value))}
                  />
                  <span className="flex items-center text-muted-foreground px-3">minutes</span>
                </div>
              </div>

              {/* Total Time */}
              <div>
                <Label>Total Time</Label>
                <div className="flex gap-2">
                  <Input 
                    type="number"
                    value={formData.totalTime}
                    onChange={(e) => handleInputChange('totalTime', parseInt(e.target.value))}
                  />
                  <span className="flex items-center text-muted-foreground px-3">minutes</span>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => handleInputChange('isActive', e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="isActive">Active Recipe</Label>
              </div>

            </div>
          </Card>

        </div>

        {/* Right Column - Recipe Detail */}
        <div className="space-y-6">
          <Card className="p-6">
            <Tabs defaultValue="ingredients" className="space-y-4">
              <TabsList className="grid grid-cols-4 w-full">
                <TabsTrigger value="ingredients">Ingredients</TabsTrigger>
                <TabsTrigger value="preparation">Preparation</TabsTrigger>
                <TabsTrigger value="cost">Cost</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              {/* Ingredients Tab */}
              <TabsContent value="ingredients" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Ingredients</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>List all ingredients needed for this recipe</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddIngredient}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add ingredients
                  </Button>
                </div>

                {/* Ingredient List */}
                <div className="space-y-2">
                  {formData.ingredients.map((ingredient, index) => (
                    <Card key={index} className="p-3 relative">
                      <div className="grid grid-cols-[2fr,1fr,1fr,1fr,1fr,1fr,1fr,1fr,auto] gap-3 items-center">
                        {/* Type and Name */}
                        <div className="space-y-1.5">
                          <Select
                            value={ingredient.type}
                            onValueChange={(value) => handleIngredientChange(index, 'type', value)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="product">Product</SelectItem>
                              <SelectItem value="recipe">Recipe</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Select
                            value={ingredient.id}
                            onValueChange={(value) => handleIngredientChange(index, 'id', value)}
                          >
                            <SelectTrigger className="h-8">
                              <SelectValue placeholder="Search..." />
                            </SelectTrigger>
                            <SelectContent>
                              <div className="flex items-center gap-2 px-2 py-1.5 border-b">
                                <Search className="h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="Search..."
                                  className="h-8 border-0 focus-visible:ring-0"
                                />
                              </div>
                              {(ingredient.type === 'product' ? mockIngredients : mockBaseRecipes).map((item) => (
                                <SelectItem key={item.id} value={item.id}>
                                  {item.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Recipe Qty */}
                        <div className="space-y-1.5">
                          <Label className="text-xs">Recipe Qty</Label>
                          <div className="flex gap-1">
                            <Input
                              type="number"
                              value={ingredient.quantity}
                              onChange={(e) => handleIngredientChange(index, 'quantity', parseFloat(e.target.value))}
                              className="h-8 w-16"
                            />
                            <Select
                              value={ingredient.unit}
                              onValueChange={(value) => handleIngredientChange(index, 'unit', value)}
                            >
                              <SelectTrigger className="h-8 w-16">
                                <SelectValue placeholder="Unit" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="g">g</SelectItem>
                                <SelectItem value="kg">kg</SelectItem>
                                <SelectItem value="ml">ml</SelectItem>
                                <SelectItem value="L">L</SelectItem>
                                <SelectItem value="pcs">pcs</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {/* Inventory Qty */}
                        <div className="space-y-1.5">
                          <Label className="text-xs">Inventory Qty</Label>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={ingredient.inventoryQty}
                              onChange={(e) => handleIngredientChange(index, 'inventoryQty', parseFloat(e.target.value))}
                              className="h-8 w-16"
                              disabled
                            />
                            <span className="text-xs text-muted-foreground">{ingredient.inventoryUnit || ingredient.unit}</span>
                          </div>
                        </div>

                        {/* Wastage */}
                        <div className="space-y-1.5">
                          <Label className="text-xs">Wastage</Label>
                          <div className="flex items-center gap-1">
                            <Input
                              type="number"
                              value={ingredient.wastage}
                              onChange={(e) => handleIngredientChange(index, 'wastage', parseFloat(e.target.value))}
                              className="h-8 w-16"
                            />
                            <span className="text-xs text-muted-foreground">%</span>
                          </div>
                        </div>

                        {/* Cost/Unit */}
                        <div className="space-y-1.5">
                          <Label className="text-xs">Cost/Unit</Label>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-muted-foreground">$</span>
                            <Input
                              type="number"
                              value={ingredient.costPerUnit.amount}
                              onChange={(e) => handleIngredientChange(index, 'costPerUnit', parseFloat(e.target.value))}
                              className="h-8 w-16"
                              disabled
                            />
                            <span className="text-xs text-muted-foreground">/{ingredient.unit}</span>
                          </div>
                        </div>

                        {/* Net Cost */}
                        <div className="space-y-1.5">
                          <Label className="text-xs">Net Cost</Label>
                          <div className="text-xs text-muted-foreground">
                            ${(ingredient.quantity * ingredient.costPerUnit.amount).toFixed(2)}
                          </div>
                        </div>

                        {/* Wastage Cost */}
                        <div className="space-y-1.5">
                          <Label className="text-xs">Wastage Cost</Label>
                          <div className="text-xs text-muted-foreground">
                            ${((ingredient.quantity * ingredient.costPerUnit.amount * ingredient.wastage) / 100).toFixed(2)}
                          </div>
                        </div>

                        {/* Total Cost */}
                        <div className="space-y-1.5">
                          <Label className="text-xs">Total Cost</Label>
                          <div className="text-xs font-medium">
                            ${(ingredient.quantity * ingredient.costPerUnit.amount * (1 + ingredient.wastage / 100)).toFixed(2)}
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleRemoveIngredient(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Preparation Tab */}
              <TabsContent value="preparation" className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Directions</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Step by step instructions to prepare this recipe</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleAddStep}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add step
                  </Button>
                </div>

                {/* Steps List */}
                <div className="space-y-4">
                  {formData.preparationSteps.map((step, index) => (
                    <Card key={index} className="p-6 relative">
                      <div className="grid grid-cols-[auto,300px,1fr] gap-6">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                          {index + 1}
                        </div>

                        {step.image ? (
                          <div className="relative aspect-[4/3] rounded-lg overflow-hidden group">
                            <Image
                              src={step.image}
                              alt={`Step ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-white"
                                onClick={() => handleStepChange(index, 'image', '')}
                              >
                                Remove Image
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full aspect-[4/3] rounded-lg border-2 border-dashed border-muted-foreground/20 flex items-center justify-center bg-muted/50 cursor-pointer hover:bg-muted/70 transition-colors" onClick={() => {/* TODO: Add image upload handler */}}>
                            <div className="text-center">
                              <UploadCloud className="h-6 w-6 mx-auto mb-1 text-muted-foreground" />
                              <p className="text-xs text-muted-foreground">Upload image</p>
                            </div>
                          </div>
                        )}

                        <div className="space-y-4">
                          <div>
                            <h3 className="font-medium mb-2">Instructions</h3>
                            <Textarea
                              value={step.description}
                              onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                              placeholder="eg: Preheat your oven to 375°F (190°C). Grease a baking dish with non-stick spray and set it aside."
                            />
                          </div>
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <Label className="text-sm text-muted-foreground">Duration</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={step.duration}
                                  onChange={(e) => handleStepChange(index, 'duration', parseInt(e.target.value))}
                                  className="w-20"
                                />
                                <span className="text-sm text-muted-foreground">mins</span>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Temperature</Label>
                              <div className="flex items-center gap-2">
                                <Input
                                  type="number"
                                  value={step.temperature}
                                  onChange={(e) => handleStepChange(index, 'temperature', parseInt(e.target.value))}
                                  className="w-20"
                                />
                                <span className="text-sm text-muted-foreground">°C</span>
                              </div>
                            </div>
                            <div>
                              <Label className="text-sm text-muted-foreground">Equipment</Label>
                              <Select
                                value={step.equipments?.[0]}
                                onValueChange={(value) => handleStepChange(index, 'equipments', [value])}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select equipment" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="oven">Oven</SelectItem>
                                  <SelectItem value="stove">Stove</SelectItem>
                                  <SelectItem value="grill">Grill</SelectItem>
                                  <SelectItem value="mixer">Mixer</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-4 right-4 h-8 w-8 hover:bg-destructive hover:text-destructive-foreground"
                          onClick={() => handleRemoveStep(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Cost Tab */}
              <TabsContent value="cost" className="space-y-6">
                {/* Cost Analysis */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold">Cost Analysis</h2>
                    <Button variant="outline" size="sm">
                      <Clock className="h-4 w-4 mr-2" />
                      Recalculate
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Ingredient Costs */}
                    <Card className="p-6">
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
                              {formData.ingredients.length > 0 ? (
                                formData.ingredients.map((ingredient, index) => (
                                  <tr key={index} className="border-b">
                                    <td className="p-3 text-sm">{ingredient.name}</td>
                                    <td className="p-3 text-sm text-right">${ingredient.totalCost.amount.toFixed(2)}</td>
                                    <td className="p-3 text-sm text-right">
                                      {((ingredient.totalCost.amount / formData.totalCost.amount) * 100).toFixed(1)}%
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
                                  ${formData.ingredients.reduce((sum, ing) => sum + ing.totalCost.amount, 0).toFixed(2)}
                                </td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </Card>

                    {/* Cost Summary */}
                    <Card className="p-6">
                      <h3 className="font-medium mb-4">Cost Summary</h3>
                      <div className="space-y-6">
                        <div className="space-y-3">
                          <div className="flex justify-between py-2">
                            <span className="text-sm">Total Ingredient Cost:</span>
                            <span className="font-medium">
                              ${formData.ingredients.reduce((sum, ing) => sum + ing.totalCost.amount, 0).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-sm">Labor Cost Per Portion:</span>
                            <span className="font-medium">
                              ${formData.laborCostPerPortion?.amount.toFixed(2) || '0.00'}
                            </span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="text-sm">Overhead Cost Per Portion:</span>
                            <span className="font-medium">
                              ${formData.overheadCostPerPortion?.amount.toFixed(2) || '0.00'}
                            </span>
                          </div>
                          <div className="flex justify-between py-2 border-t">
                            <span className="font-medium">Cost Per Portion:</span>
                            <span className="font-medium">
                              ${formData.costPerPortion.amount.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between py-2">
                            <span className="font-medium">Total Recipe Cost:</span>
                            <span className="font-medium">
                              ${formData.totalCost.amount.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  </div>
                </div>

                {/* Competitor Analysis */}
                <Card className="p-6">
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

              {/* Details Tab */}
              <TabsContent value="details" className="space-y-6">
                {/* Recipe Summary */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Recipe Summary</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Additional details about the recipe</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <div>
                    <Label>Tags</Label>
                    <div className="space-y-4">
                      <Select
                        value={formData.tags[formData.tags.length - 1] || ""}
                        onValueChange={(value) => {
                          if (!formData.tags.includes(value)) {
                            handleInputChange('tags', [...formData.tags, value])
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Add tags..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="vegetarian">Vegetarian</SelectItem>
                          <SelectItem value="vegan">Vegan</SelectItem>
                          <SelectItem value="spicy">Spicy</SelectItem>
                          <SelectItem value="healthy">Healthy</SelectItem>
                          <SelectItem value="gluten-free">Gluten Free</SelectItem>
                          <SelectItem value="low-carb">Low Carb</SelectItem>
                          <SelectItem value="keto">Keto</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className="flex flex-wrap gap-2">
                        {formData.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="secondary"
                            className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                            onClick={() => {
                              const newTags = formData.tags.filter((_, i) => i !== index)
                              handleInputChange('tags', newTags)
                            }}
                          >
                            {tag}
                            <X className="h-3 w-3 ml-1" />
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recipe Description */}
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
                  <Textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    placeholder="Describe your recipe..."
                    className="h-[100px]"
                  />
                </div>

                {/* Additional Notes */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">Additional Notes</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info className="h-4 w-4 text-muted-foreground" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Any extra notes or tips for this recipe</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Textarea
                    value={formData.reviewNotes}
                    onChange={(e) => handleInputChange('reviewNotes', e.target.value)}
                    placeholder="Add any additional notes..."
                    className="h-[100px]"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </form>
  )
} 