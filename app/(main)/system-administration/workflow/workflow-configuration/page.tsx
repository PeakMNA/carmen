"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Settings } from "lucide-react"
import { WorkflowDataTable } from "./components/workflow-data-table"
import { WorkflowCardView } from "./components/workflow-card-view"
import { createWorkflowColumns } from "./components/workflow-columns"
import { WorkflowTemplates } from "./components/workflow-templates"
import { sampleWorkflows } from '@/lib/mock-data'
import { useSearchParams, useRouter } from "next/navigation"
import { Suspense, useState } from "react"

export default function WorkflowConfigurationPage() {
  return (
    <Suspense>
      <WorkflowConfigurationContent />
    </Suspense>
  )
}

function WorkflowConfigurationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const defaultTab = searchParams.get('tab') || 'workflow'
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')

  const workflows = sampleWorkflows.map((workflow, index) => ({
    id: workflow.id,
    name: workflow.name,
    type: workflow.type,
    status: workflow.status || "Active",
    lastModified: "2024-08-26T12:00:00.000Z",
    description: `${workflow.type} workflow for ${workflow.name}`,
    createdBy: 'System Administrator',
    stageCount: workflow.stages?.length || 3,
    activeUsers: index + 2,
  }))

  // Get notification templates from the first workflow as initial templates
  const initialTemplates = sampleWorkflows[0]?.notificationTemplates || []

  // Workflow action handlers
  const handleView = (workflow: any) => {
    router.push(`/system-administration/workflow/workflow-configuration/${workflow.id}`)
  }

  const handleEdit = (workflow: any) => {
    router.push(`/system-administration/workflow/workflow-configuration/${workflow.id}?mode=edit`)
  }

  const handleDelete = (workflow: any) => {
    console.log('Delete workflow:', workflow)
    // TODO: Implement delete confirmation dialog
  }

  const handleDuplicate = (workflow: any) => {
    console.log('Duplicate workflow:', workflow)
    // TODO: Implement duplicate functionality
  }

  const handleNewWorkflow = () => {
    router.push('/system-administration/workflow/workflow-configuration/new')
  }

  const handleSettings = () => {
    alert('Workflow Settings - To be implemented')
  }

  const columns = createWorkflowColumns({
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
    onDuplicate: handleDuplicate,
  })

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Workflow Management</h1>
          <p className="text-muted-foreground">
            Manage workflow configurations and notification templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleSettings}>
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button size="sm" onClick={handleNewWorkflow}>
            <Plus className="mr-2 h-4 w-4" />
            New Workflow
          </Button>
        </div>
      </div>

      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="templates">Notification Templates</TabsTrigger>
        </TabsList>
        <TabsContent value="workflow" className="space-y-4">
          <WorkflowDataTable
            columns={columns}
            data={workflows}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            cardView={
              <WorkflowCardView
                data={workflows}
                selectedItems={[]}
                onSelectItem={() => {}}
                onSelectAll={() => {}}
                onView={handleView}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onDuplicate={handleDuplicate}
              />
            }
          />
        </TabsContent>
        <TabsContent value="templates">
          <WorkflowTemplates 
            templates={initialTemplates}
            isEditing={true}
            onSave={(templates) => console.log('Templates saved:', templates)}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

