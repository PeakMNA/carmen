"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { PRDetailTemplate } from "@/components/templates/PRDetailTemplate"
import { Button } from "@/components/ui/button"
import { PurchaseRequest } from "@/lib/types"
import { samplePRData } from "@/lib/mock-data/purchase-requests"
import { mockTemplateItems } from "../types/template-items"
import { ItemsTab } from "../components/ItemsTab"
import { Badge } from "@/components/ui/badge"
import { Copy, FileCheck, ChevronLeft } from "lucide-react"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"

// Create a sample template based on the ID
const getTemplateById = (id: string): PurchaseRequest => {
  return {
    ...samplePRData,
    id,
    requestNumber: `TPL-${id}`,
    notes: `Template ${id}`,
  } as any
}

export default function PRTemplateDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = (searchParams?.get("mode") as "view" | "edit" | "add") || "view"
  const [formData, setFormData] = useState<PurchaseRequest>(
    getTemplateById(params.id)
  )

  const handleModeChange = (newMode: "view" | "edit") => {
    router.push(`/procurement/purchase-request-templates/${params.id}?mode=${newMode}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    handleModeChange("view")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleFormDataChange = (data: Partial<PurchaseRequest>) => {
    setFormData(prev => ({
      ...prev,
      ...data,
    }))
  }

  const handleBack = () => {
    router.push("/procurement/purchase-request-templates")
  }

  const tabs = [
    {
      value: "items",
      label: "Items",
      content: <ItemsTab items={mockTemplateItems} mode={mode} />
    },
    {
      value: "budgets",
      label: "Budgets",
      content: (
        <Card>
          <CardContent className="p-6">
            <div>Budgets Tab Content</div>
          </CardContent>
        </Card>
      )
    },
    {
      value: "activity",
      label: "Activity",
      content: (
        <Card>
          <CardContent className="p-6">
            <div>Activity Tab Content</div>
          </CardContent>
        </Card>
      )
    }
  ]

  const actions = (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        className="h-8"
        onClick={() => console.log("Set as Default")}
      >
        <FileCheck className="h-4 w-4 mr-2" />
        Set as Default
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="h-8"
        onClick={() => console.log("Clone Template")}
      >
        <Copy className="h-4 w-4 mr-2" />
        Clone Template
      </Button>
    </div>
  )

  const headerContent = (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">{(formData as any).notes}</h1>
        <Badge variant="outline" className="h-6">
          {formData.requestNumber}
        </Badge>
      </div>
      <div className="text-sm text-muted-foreground">
        Last modified on {new Date().toLocaleDateString()}
      </div>
    </div>
  )

  const backButton = (
    <Button
      variant="ghost"
      size="sm"
      className="h-8"
      onClick={handleBack}
    >
      <ChevronLeft className="h-4 w-4 mr-2" />
      Back to Templates
    </Button>
  )

  return (
    <div className="px-6 py-6 space-y-6">
      <PRDetailTemplate
        mode={mode}
        title={headerContent}
        formData={formData}
        onModeChange={handleModeChange}
        onSubmit={handleSubmit}
        onInputChange={handleInputChange}
        onFormDataChange={handleFormDataChange}
        tabs={tabs}
        actions={actions}
      />
    </div>
  )
} 