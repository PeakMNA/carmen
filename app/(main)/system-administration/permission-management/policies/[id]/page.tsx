'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Edit, Copy, Play, AlertTriangle } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PolicyDetailsView } from '@/components/permissions/policy-manager/policy-details-view';
import { allMockPolicies } from '@/lib/mock-data/permission-policies';
import { Policy } from '@/lib/types/permissions';

export default function PolicyDetailsPage() {
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

  const handleEdit = () => {
    router.push(`/system-administration/permission-management/policies/${params.id}/edit`);
  };

  const handleClone = () => {
    router.push(`/system-administration/permission-management/policies/builder?clone=${params.id}`);
  };

  const handleTest = () => {
    // In a real app, this would open a testing modal or navigate to test page
    console.log('Testing policy:', params.id);
  };

  const handleToggleStatus = (enabled: boolean) => {
    // In a real app, this would call an API to update policy status
    console.log('Toggle policy status:', params.id, enabled);
    if (policy) {
      setPolicy({ ...policy, enabled });
    }
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
        <span className="text-sm text-muted-foreground">Policy Details</span>
      </div>

      {/* Policy Details */}
      <PolicyDetailsView
        policy={policy}
        onEdit={handleEdit}
        onClone={handleClone}
        onToggleStatus={handleToggleStatus}
        onTest={handleTest}
      />
    </div>
  );
}