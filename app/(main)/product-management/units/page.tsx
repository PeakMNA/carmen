import { UnitListImproved as UnitList } from "./components/unit-list-improved"
import { Button } from "@/components/ui/button"
import { Download, Plus } from "lucide-react"

export default function UnitsPage() {
  return (
    <div className="px-6 px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Unit Management
        </h1>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" className="h-8 px-3 text-xs">
            <Download className="h-3 w-3 mr-1" />
            Export
          </Button>
          <Button className="h-8 px-3 text-xs font-medium">
            <Plus className="h-3 w-3 mr-1" />
            Add Unit
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <main>
        <UnitList />
      </main>
    </div>
  )
} 