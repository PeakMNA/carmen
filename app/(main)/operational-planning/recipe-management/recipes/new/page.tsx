"use client"

import { RecipeForm } from "../components/recipe-form"
import { useRouter } from "next/navigation"
import { Recipe } from '@/lib/types'

export default function CreateRecipePage() {
  const router = useRouter()

  const handleSubmit = async (recipe: Recipe) => {
    try {
      // TODO: Implement API call to create recipe
      console.log('Creating recipe:', recipe)
      router.push('/operational-planning/recipe-management/recipes')
    } catch (error) {
      console.error('Error creating recipe:', error)
    }
  }

  return (
    <div className="px-6 py-6">
      <RecipeForm
        onSubmit={handleSubmit}
      />
    </div>
  )
} 