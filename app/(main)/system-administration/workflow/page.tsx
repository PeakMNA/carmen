// app/(main)/system-administration/workflow/page.tsx
"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { WorkflowList } from "./workflow-configuration/components/workflow-list"
import RoleAssignmentLayout from "./role-assignment/components/layout"
import { sampleWorkflows } from '@/lib/mock-data'
import { useSearchParams } from "next/navigation"
import { Suspense } from "react"

export default function WorkflowPage() {
  return (
    <Suspense>
      <WorkflowContent />
    </Suspense>
  )
}

function WorkflowContent() {
  const searchParams = useSearchParams()
  const defaultTab = searchParams.get('tab') || 'configuration'

  const workflows = sampleWorkflows.map(workflow => ({
    id: workflow.id,
    name: workflow.name,
    type: workflow.type,
    status: workflow.status || "Active",
    lastModified: new Date().toISOString(),
  }))

  return (
    <div className="px-6 py-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Workflow Management</h1>
      <Tabs defaultValue={defaultTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configuration">Workflow Configuration</TabsTrigger>
          <TabsTrigger value="approvers">Role Assignment</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>
        <TabsContent value="configuration">
          <WorkflowList workflows={workflows} />
        </TabsContent>
        <TabsContent value="approvers">
          <RoleAssignmentLayout />
        </TabsContent>
        <TabsContent value="users">
          <div className="rounded-lg border p-8 text-center">
            <h2 className="text-2xl font-semibold mb-2">User Management</h2>
            <p className="text-muted-foreground">Coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}