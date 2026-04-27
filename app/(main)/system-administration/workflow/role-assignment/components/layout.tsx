'use client'
import { useState } from "react"
import { RoleList } from "./role-list"
import { ConfigurationPanel } from "./configuration-panel"

export default function RoleAssignmentLayout() {
  const [selectedRoleId, setSelectedRoleId] = useState<string | null>(null)

  return (
    <div className="mx-auto p-4 max-w-7xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Role Assignment Matrix</h1>
        <p className="text-muted-foreground mt-2">
          Configure roles and assign users to create a comprehensive role matrix
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <aside className="md:col-span-1">
          <RoleList 
            selectedRoleId={selectedRoleId} 
            onSelectRole={setSelectedRoleId} 
          />
        </aside>
        <main className="md:col-span-3">
          <ConfigurationPanel selectedRoleId={selectedRoleId} />
        </main>
      </div>
    </div>
  )
}

