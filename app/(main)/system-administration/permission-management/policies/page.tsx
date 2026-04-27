'use client';

import { useState, useMemo } from 'react';
import { Plus, Sparkles } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PolicyList } from '@/components/permissions/policy-manager/policy-list';
import { PolicyFiltersComponent, PolicyFilters } from '@/components/permissions/policy-manager/policy-filters';
import { allMockPolicies, roleBasedPolicies } from '@/lib/mock-data/permission-index';
import { Policy, EffectType } from '@/lib/types/permissions';
import { ResourceType } from '@/lib/types/permission-resources';

export default function PolicyManagementPage() {
  const [showFilters, setShowFilters] = useState(false);
  const [policyType, setPolicyType] = useState<'rbac' | 'abac'>('rbac'); // Default to role-based
  const [filters, setFilters] = useState<PolicyFilters>({
    search: '',
    effect: 'all',
    status: 'all',
    categories: [],
    resourceTypes: [],
    priorityRange: { min: 0, max: 1000 },
    createdDateRange: { from: '', to: '' }
  });

  // Sample saved filter presets
  const [savedPresets] = useState([
    {
      name: 'High Priority Permits',
      filters: {
        search: '',
        effect: 'permit' as EffectType,
        status: 'enabled' as const,
        categories: [],
        resourceTypes: [],
        priorityRange: { min: 800, max: 1000 },
        createdDateRange: { from: '', to: '' }
      }
    },
    {
      name: 'Procurement Policies',
      filters: {
        search: '',
        effect: 'all' as const,
        status: 'all' as const,
        categories: [],
        resourceTypes: [ResourceType.PURCHASE_REQUEST, ResourceType.PURCHASE_ORDER],
        priorityRange: { min: 0, max: 1000 },
        createdDateRange: { from: '', to: '' }
      }
    }
  ]);

  // Filter policies based on current filters
  const filteredPolicies = useMemo(() => {
    const policies = policyType === 'rbac' ? roleBasedPolicies : allMockPolicies;
    return policies.filter(policy => {
      // Search filter
      if (filters.search && !policy.name.toLowerCase().includes(filters.search.toLowerCase()) &&
          !policy.description.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }

      // Effect filter
      if (filters.effect !== 'all' && policy.effect !== filters.effect) {
        return false;
      }

      // Status filter
      if (filters.status === 'enabled' && !policy.enabled) return false;
      if (filters.status === 'disabled' && policy.enabled) return false;

      // Priority range filter
      if (policy.priority < filters.priorityRange.min || policy.priority > filters.priorityRange.max) {
        return false;
      }

      // Resource types filter (if any resource types are selected)
      if (filters.resourceTypes.length > 0) {
        // This would need to be implemented based on policy structure
        // For now, we'll assume all policies pass this filter
        // In a real implementation, you'd check if the policy applies to any of the selected resource types
      }

      return true;
    });
  }, [filters, policyType]);

  const handleCreatePolicy = () => {
    // Navigate to policy builder
    window.location.href = '/system-administration/permission-management/policies/builder';
  };

  const handleEditPolicy = (policyId: string) => {
    // Navigate to policy builder with edit mode
    window.location.href = `/system-administration/permission-management/policies/builder?edit=${policyId}`;
  };

  const handleViewPolicy = (policyId: string) => {
    // Navigate to policy details view
    window.location.href = `/system-administration/permission-management/policies/${policyId}`;
  };

  const handleTestPolicy = (policyId: string) => {
    // Navigate to policy testing
    console.log('Test policy:', policyId);
    // Could open a modal or navigate to test page
  };

  const handleClonePolicy = (policyId: string) => {
    // Navigate to policy builder with clone mode
    window.location.href = `/system-administration/permission-management/policies/builder?clone=${policyId}`;
  };

  const handleToggleStatus = (policyId: string, enabled: boolean) => {
    // In a real app, this would call an API to update policy status
    console.log('Toggle policy status:', policyId, enabled);
    // Would update local state or refetch data
  };

  const handleSavePreset = (name: string, filters: PolicyFilters) => {
    // In a real app, this would save to backend
    console.log('Save preset:', name, filters);
  };

  const handleLoadPreset = (presetFilters: PolicyFilters) => {
    setFilters(presetFilters);
  };

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Policy Management</h1>
            <p className="text-muted-foreground">
              Create and manage access control policies for Carmen ERP resources.
            </p>
          </div>
          
        </div>
        
        <div className="flex items-center space-x-2 md:mt-0">
          <Button 
            variant="outline" 
            onClick={() => setShowFilters(!showFilters)}
          >
            Filters
          </Button>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/system-administration/permission-management/policies/simple'}
          >
            <Sparkles className="mr-2 h-4 w-4" />
            Simple Creator
          </Button>
          <Button onClick={handleCreatePolicy}>
            <Plus className="mr-2 h-4 w-4" />
            Advanced Builder
          </Button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <PolicyFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          onSavePreset={handleSavePreset}
          onLoadPreset={handleLoadPreset}
          savedPresets={savedPresets}
        />
      )}

      {/* Policy List */}
      <PolicyList
        policyType={policyType}
        onPolicyTypeChange={setPolicyType}
        onCreatePolicy={handleCreatePolicy}
        onEditPolicy={handleEditPolicy}
        onViewPolicy={handleViewPolicy}
        onTestPolicy={handleTestPolicy}
        onClonePolicy={handleClonePolicy}
        onToggleStatus={handleToggleStatus}
      />
    </div>
  );
}