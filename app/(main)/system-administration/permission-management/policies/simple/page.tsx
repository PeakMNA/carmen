'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { SimplifiedPolicyCreator } from '../components/simplified-policy-creator'
import { PermissionBreadcrumbs } from '../../components/permission-breadcrumbs'

export default function SimplePolicyCreatorPage() {
  const router = useRouter()

  const handlePolicyCreate = (policy: any) => {
    console.log('Creating simplified policy:', policy)
    
    // Show success message and redirect
    setTimeout(() => {
      router.push('/system-administration/permission-management/policies?created=true')
    }, 1000)
  }

  const handleCancel = () => {
    router.push('/system-administration/permission-management/policies')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button 
            variant="outline" 
            onClick={() => router.push('/system-administration/permission-management/policies')}
            className="bg-white/80 backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Policies
          </Button>
          
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-blue-600" />
              Simple Policy Creator
            </h1>
            <p className="text-muted-foreground">
              Create policies quickly with our template-based approach - no technical expertise required.
            </p>
          </div>
        </div>

        {/* Policy Creator */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg border shadow-lg">
          <SimplifiedPolicyCreator
            onPolicyCreate={handlePolicyCreate}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  )
}