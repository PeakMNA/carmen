'use client'

import { WorkflowProvider } from '@/lib/context/workflow-context'
import { SidebarLayout } from '@/components/Sidebar'
import Header from '@/components/header'

export default function MainLayoutClient({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WorkflowProvider>
      <SidebarLayout>
        <div className="sticky top-0 z-50">
          <Header />
        </div>
        {children}
      </SidebarLayout>
    </WorkflowProvider>
  )
} 