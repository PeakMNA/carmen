'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PolicyEdit } from '@/components/permissions/policy-manager/policy-edit';
import { allMockPolicies } from '@/lib/mock-data/permission-policies';
import { Policy } from '@/lib/types/permissions';

export default function PolicyEditPage() {
  const params = useParams();
  const router = useRouter();
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      // In a real app, this would fetch from API
      const foundPolicy = allMockPolicies.find(p => p.id === params.id);
      setPolicy(foundPolicy || null);
      setLoading(false);
    }
  }, [params.id]);

  const handleSave = (updatedPolicy: Policy, saveAsNew = false) => {
    // In a real app, this would call an API to save the policy
    console.log('Saving policy:', updatedPolicy, 'as new:', saveAsNew);
    
    // Simulate API call
    setTimeout(() => {
      if (saveAsNew) {
        // Navigate to new policy details
        router.push(`/system-administration/permission-management/policies/${updatedPolicy.id}`);
      } else {
        // Navigate back to policy details
        router.push(`/system-administration/permission-management/policies/${params.id}`);
      }
    }, 500);
  };

  const handleCancel = () => {
    router.push(`/system-administration/permission-management/policies/${params.id}`);
  };

  const handleTest = (policyToTest: Policy) => {
    // In a real app, this would open a testing modal or navigate to test page
    console.log('Testing policy:', policyToTest);
  };

  const handleBack = () => {
    router.push('/system-administration/permission-management/policies');
  };

  if (loading) {
    return (
      <div className="px-6 py-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Policies
          </Button>
        </div>
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-2/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="h-32 bg-muted rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="px-6 py-6">
        <div className="flex items-center space-x-4 mb-6">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Policies
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Policy not found. The policy may have been deleted or the ID is invalid.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="px-6 py-6">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Policies
        </Button>
        <span className="text-muted-foreground">/</span>
        <Button 
          variant="ghost" 
          onClick={() => router.push(`/system-administration/permission-management/policies/${params.id}`)}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          {policy.name}
        </Button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm text-muted-foreground">Edit</span>
      </div>

      {/* Policy Edit */}
      <PolicyEdit
        policy={policy}
        onSave={handleSave}
        onCancel={handleCancel}
        onTest={handleTest}
      />
    </div>
  );
}