import { Suspense } from "react"
import { RecipeUnitList } from "./components/recipe-unit-list"
import { Skeleton } from "@/components/ui/skeleton"

function RecipeUnitListSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-48" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>

      {/* Search Skeleton */}
      <div className="flex flex-col md:flex-row gap-4">
        <Skeleton className="h-10 w-full" />
      </div>

      {/* Table Skeleton */}
      <div className="border rounded-lg">
        <div className="p-4">
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <Skeleton className="h-6 w-1/4" />
                <Skeleton className="h-6 w-1/6" />
                <Skeleton className="h-6 w-1/6" />
                <Skeleton className="h-6 w-1/6" />
                <Skeleton className="h-6 w-1/6" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function RecipeUnitsPage() {
  return (
    <div className="h-full flex flex-col gap-4 p-4 md:p-6">
      <Suspense fallback={<RecipeUnitListSkeleton />}>
        <RecipeUnitList />
      </Suspense>
    </div>
  )
}
