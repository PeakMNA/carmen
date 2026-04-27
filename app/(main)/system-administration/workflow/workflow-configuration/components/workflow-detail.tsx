'use client'
import React, { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkflowHeader } from "./workflow-header"
import { WorkflowGeneral } from "./workflow-general"
import { WorkflowStages } from "./workflow-stages"
import { WorkflowRouting } from "./workflow-routing"
import { sampleWorkflows } from '@/lib/mock-data'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle,ChevronLeft } from 'lucide-react'
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Workflow } from "../types/workflow"

interface WorkflowDetailProps {
  workflowId: string
}

export function WorkflowDetail({ workflowId }: WorkflowDetailProps) {
  const [workflow, setWorkflow] = useState<Workflow | undefined>(sampleWorkflows.find(w => w.id === workflowId))
  const [isEditing, setIsEditing] = useState(false)

  if (!workflow) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Workflow not found. Please check the provided workflow ID: {workflowId}
        </AlertDescription>
      </Alert>
    )
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
  }

  const handleSave = (updatedWorkflow: Workflow) => {
    setWorkflow(updatedWorkflow)
    setIsEditing(false)
  }

  const stageNames = workflow.stages.map(stage => stage.name)

  return (
    <div className="px-6 py-6">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/system-administration/workflow/workflow-configuration">
          <ChevronLeft className="mr-2 h-4 w-4" /> Back to Workflows
        </Link>
      </Button>
      <WorkflowHeader workflow={workflow} isEditing={isEditing} onEditToggle={handleEditToggle} onSave={handleSave} />
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="stages">Stages</TabsTrigger>
          <TabsTrigger value="routing">Routing</TabsTrigger>
        </TabsList>
        <TabsContent value="general">
          <WorkflowGeneral workflow={workflow} isEditing={isEditing} onSave={(updatedWorkflow) => handleSave({...workflow, ...updatedWorkflow})} />
        </TabsContent>
        <TabsContent value="stages">
          <WorkflowStages stages={workflow.stages} isEditing={isEditing} onSave={(stages) => handleSave({...workflow, stages})} />
        </TabsContent>
        <TabsContent value="routing">
          <WorkflowRouting
            rules={workflow.routingRules || []}
            stages={stageNames}
            isEditing={isEditing}
            onSave={(routingRules) => handleSave({...workflow, routingRules})}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

