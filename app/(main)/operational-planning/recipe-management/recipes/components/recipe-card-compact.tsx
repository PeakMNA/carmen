"use client"

import { Recipe } from '@/lib/types'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, Users, TrendingUp, ChefHat, Utensils } from "lucide-react"
import { cn } from "@/lib/utils"
import { RecipeImage } from "./recipe-image"
import { getRecipeCategoryById } from "@/lib/mock-data/categories"
import { mockCuisines } from "@/lib/mock-data/cuisines"

interface RecipeCardCompactProps {
  recipe: Recipe
}

function getMarginColor(margin: number | undefined) {
  if (!margin) return "text-muted-foreground"
  if (margin >= 70) return "text-emerald-600 dark:text-emerald-400"
  if (margin >= 60) return "text-green-600 dark:text-green-400"
  if (margin >= 50) return "text-amber-600 dark:text-amber-400"
  return "text-red-600 dark:text-red-400"
}

function getMarginBg(margin: number | undefined) {
  if (!margin) return "bg-muted"
  if (margin >= 70) return "bg-emerald-50 dark:bg-emerald-950/50"
  if (margin >= 60) return "bg-green-50 dark:bg-green-950/50"
  if (margin >= 50) return "bg-amber-50 dark:bg-amber-950/50"
  return "bg-red-50 dark:bg-red-950/50"
}

export function RecipeCardCompact({ recipe }: RecipeCardCompactProps) {
  const margin = recipe.yieldVariants[0]?.marginPercentage
  const sellingPrice = recipe.yieldVariants[0]?.sellingPrice?.amount
  const category = getRecipeCategoryById(recipe.categoryId)
  const cuisine = mockCuisines.find(c => c.id === recipe.cuisineTypeId)

  return (
    <Card className="group overflow-hidden transition-all duration-200 hover:shadow-lg hover:border-primary/30">
      {/* Image Section */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <RecipeImage
          src={recipe.image}
          alt={recipe.name}
          aspectRatio="video"
          priority={false}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Status Badge */}
        <Badge
          variant={recipe.status === "published" ? "default" : "secondary"}
          className={cn(
            "absolute top-3 right-3 text-xs font-medium shadow-sm",
            recipe.status === "published"
              ? "bg-emerald-500/90 hover:bg-emerald-500 text-white border-0"
              : "bg-slate-500/90 hover:bg-slate-500 text-white border-0"
          )}
        >
          {recipe.status === "published" ? "Published" : "Draft"}
        </Badge>

        {/* Recipe Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="font-semibold text-white text-lg leading-tight line-clamp-2 drop-shadow-md">
            {recipe.name}
          </h3>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 space-y-4">
        {/* Margin Highlight */}
        <div className={cn(
          "flex items-center justify-between rounded-lg p-3 transition-colors",
          getMarginBg(margin)
        )}>
          <div className="flex items-center gap-2">
            <TrendingUp className={cn("h-4 w-4", getMarginColor(margin))} />
            <span className="text-sm font-medium text-muted-foreground">Margin</span>
          </div>
          <span className={cn("text-xl font-bold tabular-nums", getMarginColor(margin))}>
            {margin ? `${margin.toFixed(0)}%` : 'N/A'}
          </span>
        </div>

        {/* Price Info */}
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Cost</span>
            <p className="font-semibold text-foreground">
              ${recipe.costPerPortion.amount.toFixed(2)}
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-muted-foreground uppercase tracking-wide">Price</span>
            <p className="font-semibold text-foreground">
              {sellingPrice ? `$${sellingPrice.toFixed(2)}` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Prep Info */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1 border-t">
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            <span>{(recipe.prepTime || 0) + (recipe.cookTime || 0)} min</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            <span>{recipe.yield} portions</span>
          </div>
        </div>

        {/* Category & Cuisine Tags */}
        <div className="flex flex-wrap items-center gap-1.5">
          {category && (
            <Badge variant="outline" className="text-xs font-normal bg-background">
              <ChefHat className="h-3 w-3 mr-1" />
              {category.name}
            </Badge>
          )}
          {cuisine && (
            <Badge variant="outline" className="text-xs font-normal bg-background">
              <Utensils className="h-3 w-3 mr-1" />
              {cuisine.name}
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
} 