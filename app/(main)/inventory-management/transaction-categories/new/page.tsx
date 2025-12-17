/**
 * ============================================================================
 * NEW TRANSACTION CATEGORY PAGE
 * ============================================================================
 *
 * Page for creating a new transaction category.
 * Supports pre-selection of type via URL query parameter.
 *
 * URL: /inventory-management/transaction-categories/new
 * Query params:
 *   - type=in  → Pre-select Stock In type
 *   - type=out → Pre-select Stock Out type
 *
 * ============================================================================
 */

'use client'

import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { CategoryForm } from "../components/category-form"
import type { AdjustmentType } from "@/lib/types/transaction-category"

function NewCategoryContent() {
  const searchParams = useSearchParams()

  // Get pre-selected type from URL query param
  const typeParam = searchParams.get("type")?.toUpperCase()
  const preselectedType: AdjustmentType | undefined =
    typeParam === "IN" || typeParam === "OUT" ? typeParam : undefined

  // TODO: Replace with actual API call
  const handleSave = async (data: any) => {
    console.log("Creating new category:", data)
    // await createCategory(data)
  }

  return (
    <CategoryForm
      preselectedType={preselectedType}
      onSave={handleSave}
    />
  )
}

export default function NewCategoryPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64">Loading...</div>}>
      <NewCategoryContent />
    </Suspense>
  )
}
