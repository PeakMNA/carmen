/**
 * ============================================================================
 * EDIT TRANSACTION CATEGORY PAGE
 * ============================================================================
 *
 * Page for editing an existing transaction category.
 * Loads category data by ID and pre-populates the form.
 *
 * URL: /inventory-management/transaction-categories/:id/edit
 *
 * ============================================================================
 */

'use client'

import { useRouter } from "next/navigation"
import { CategoryForm } from "../../components/category-form"
import { getCategoryById } from "@/lib/mock-data/transaction-categories"

interface EditCategoryPageProps {
  params: { id: string }
}

export default function EditCategoryPage({ params }: EditCategoryPageProps) {
  const router = useRouter()
  const { id } = params

  // TODO: Replace with API call
  const category = getCategoryById(id)

  // Handle category not found
  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h1 className="text-2xl font-semibold">Category Not Found</h1>
        <p className="text-muted-foreground">
          The category you are looking for does not exist.
        </p>
        <button
          onClick={() => router.push("/inventory-management/transaction-categories")}
          className="text-primary hover:underline"
        >
          Return to Categories List
        </button>
      </div>
    )
  }

  // TODO: Replace with actual API call
  const handleSave = async (data: any) => {
    console.log("Updating category:", id, data)
    // await updateCategory(id, data)
  }

  return (
    <CategoryForm
      category={category}
      onSave={handleSave}
    />
  )
}
