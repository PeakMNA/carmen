'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  FileText, 
  Search, 
  Users, 
  CreditCard, 
  Plus,
  Settings,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

import { PolicyBuilderWizard } from '@/components/permissions/policy-builder-wizard';

import { PolicyList } from '@/components/permissions/policy-manager/policy-list';
import { PolicyFiltersComponent, PolicyFilters } from '@/components/permissions/policy-manager/policy-filters';

import { RoleList } from '@/components/permissions/role-manager/role-list';
import { RoleForm } from '@/components/permissions/role-manager/role-form';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { mockRoles } from '@/lib/mock-data/permission-roles';
import { useRoleStore } from '@/lib/stores/role-store';

import { PackageSelector } from '@/components/permissions/subscription/package-selector';
import { ResourceActivation } from '@/components/permissions/subscription/resource-activation';
import { BillingPaymentInfo } from '@/components/permissions/subscription/billing-payment-info';
import { UsageAnalytics } from '@/components/permissions/subscription/usage-analytics';
import { mockSubscriptionPackages, mockCurrentSubscription } from '@/lib/mock-data/permission-subscriptions';

// Placeholder components for each view
function PolicyManagementView() {
  const [isPolicyWizardOpen, setIsPolicyWizardOpen] = useState(false);
  const [policyType, setPolicyType] = useState<'rbac' | 'abac'>('rbac');
  const [filters, setFilters] = useState<PolicyFilters>({
    search: '',
    effect: 'all',
    status: 'all',
    categories: [],
    resourceTypes: [],
    priorityRange: { min: 0, max: 1000 },
    createdDateRange: { from: '', to: '' }
  });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Policy Management</h2>
          <p className="text-muted-foreground">
            Create and manage access control policies using attribute-based rules
          </p>
        </div>
        <Button className="gap-2" onClick={() => setIsPolicyWizardOpen(true)}>
          <Plus className="h-4 w-4" />
          New Policy
        </Button>
      </div>

      {/* Policy Filters */}
      <PolicyFiltersComponent 
        filters={filters}
        onFiltersChange={setFilters}
      />

      {/* Policy List */}
      <PolicyList
        policyType={policyType}
        onPolicyTypeChange={setPolicyType}
        onCreatePolicy={() => setIsPolicyWizardOpen(true)}
        onEditPolicy={(policyId) => {
          console.log('Edit policy:', policyId);
          // Handle edit policy
        }}
        onViewPolicy={(policyId) => {
          console.log('View policy:', policyId);
          // Handle view policy
        }}
      />

      {/* Policy Builder Wizard */}
      <PolicyBuilderWizard 
        open={isPolicyWizardOpen}
        onOpenChange={setIsPolicyWizardOpen}
      />
    </div>
  );
}


function RoleManagementView() {
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const { addRole, updateRole, getRole } = useRoleStore();

  const handleCreateRole = () => {
    setIsCreateRoleDialogOpen(true);
  };

  const handleEditRole = (roleId: string) => {
    setSelectedRole(roleId);
    setIsEditRoleDialogOpen(true);
  };

  const handleViewRole = (roleId: string) => {
    console.log('View role:', roleId);
    // Handle view role - could open a detailed view dialog
  };

  const handleSaveRole = (data: any) => {
    console.log('Saving role:', data);
    
    if (selectedRole) {
      // Update existing role
      const success = updateRole(selectedRole, data);
      if (success) {
        console.log('Role updated successfully');
      }
    } else {
      // Create new role
      const newRole = addRole(data);
      console.log('Role created:', newRole);
    }
    
    setIsCreateRoleDialogOpen(false);
    setIsEditRoleDialogOpen(false);
    setSelectedRole(null);
  };

  const handleCancelRole = () => {
    setIsCreateRoleDialogOpen(false);
    setIsEditRoleDialogOpen(false);
    setSelectedRole(null);
  };

  const handleAssignUsers = (roleId: string) => {
    console.log('Assign users to role:', roleId);
    // In a real app, this would open a user assignment dialog
  };

  const handleExportRoles = (roleIds?: string[]) => {
    console.log('Export roles:', roleIds || 'all');
    // In a real app, this would generate and download a CSV/Excel file
  };

  const handleBulkDelete = (roleIds: string[]) => {
    console.log('Bulk delete roles:', roleIds);
    // In a real app, this would show a confirmation dialog and delete multiple roles
  };

  return (
    <div className="space-y-6">
      <RoleList 
        onCreateRole={handleCreateRole}
        onEditRole={handleEditRole}
        onViewRole={handleViewRole}
        onAssignUsers={handleAssignUsers}
        onExportRoles={handleExportRoles}
        onBulkDelete={handleBulkDelete}
      />

      {/* Create Role Dialog */}
      <Dialog open={isCreateRoleDialogOpen} onOpenChange={setIsCreateRoleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <RoleForm
            onSave={handleSaveRole}
            onCancel={handleCancelRole}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleDialogOpen} onOpenChange={setIsEditRoleDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <RoleForm
            role={selectedRole ? getRole(selectedRole) : undefined}
            onSave={handleSaveRole}
            onCancel={handleCancelRole}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SubscriptionManagementView() {
  const [activeTab, setActiveTab] = useState('packages');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Subscription Management</h2>
          <p className="text-muted-foreground">
            Manage subscription packages, resource activation, billing, and usage analytics
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="packages" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Packages</span>
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center space-x-2">
            <Settings className="h-4 w-4" />
            <span>Resources</span>
          </TabsTrigger>
          <TabsTrigger value="billing" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Billing</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="packages" className="space-y-6">
          <PackageSelector
            packages={mockSubscriptionPackages}
            currentSubscription={mockCurrentSubscription}
            onPackageSelect={(pkg) => {
              console.log('Package selected:', pkg);
              // Handle package selection
            }}
            onUpgrade={(comparison) => {
              console.log('Upgrade requested:', comparison);
              // Handle upgrade
            }}
            onDowngrade={(comparison) => {
              console.log('Downgrade requested:', comparison);
              // Handle downgrade
            }}
          />
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <ResourceActivation
            package={mockSubscriptionPackages.find(p => p.type === mockCurrentSubscription.packageType)}
            subscription={mockCurrentSubscription}
            showAnalytics={true}
            onPackageUpdate={(pkg) => {
              console.log('Package updated:', pkg);
              // Handle package update
            }}
            onResourceToggle={(resource, enabled) => {
              console.log(`Resource ${resource} ${enabled ? 'enabled' : 'disabled'}`);
              // Handle resource toggle
            }}
            onLimitUpdate={(resource, limits) => {
              console.log(`Limits updated for ${resource}:`, limits);
              // Handle limit updates
            }}
          />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <BillingPaymentInfo
            subscription={mockCurrentSubscription}
            onPaymentMethodUpdate={(method) => {
              console.log('Payment method updated:', method);
              // Handle payment method update
            }}
            onBillingAddressUpdate={(address) => {
              console.log('Billing address updated:', address);
              // Handle billing address update
            }}
            onInvoiceSettingsUpdate={(settings) => {
              console.log('Invoice settings updated:', settings);
              // Handle invoice settings update
            }}
            onDownloadInvoice={(invoiceId) => {
              console.log('Download invoice:', invoiceId);
              // Handle invoice download
            }}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <UsageAnalytics
            subscription={mockCurrentSubscription}
            onExportData={(period, format) => {
              console.log(`Export data for ${period} in ${format} format`);
              // Handle data export
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function PermissionManagementPage() {
  return (
    <div className="px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">Permission Management</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Comprehensive access control system using attribute-based policies, role management, 
            and subscription-based feature activation for Carmen ERP.
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <Tabs defaultValue="policies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="policies" className="flex items-center space-x-2">
            <FileText className="h-4 w-4" />
            <span>Policies</span>
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Roles</span>
          </TabsTrigger>
          <TabsTrigger value="subscription" className="flex items-center space-x-2">
            <CreditCard className="h-4 w-4" />
            <span>Subscription</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="policies" className="space-y-6">
          <PolicyManagementView />
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <RoleManagementView />
        </TabsContent>

        <TabsContent value="subscription" className="space-y-6">
          <SubscriptionManagementView />
        </TabsContent>
      </Tabs>
    </div>
  );
}