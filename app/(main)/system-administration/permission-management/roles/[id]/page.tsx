'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Settings, Download } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RoleHeader } from '../components/role-header';
import { PermissionDetailsTab } from '../components/permission-details-tab';
import { UserAssignmentTab } from '../components/user-assignment-tab';
import { PolicyAssignmentTab } from '../components/policy-assignment-tab';
import { mockRoles } from '@/lib/mock-data/permission-index';
import { useRoleStore } from '@/lib/stores/role-store';
import { Role } from '@/lib/types';

export default function RoleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { getRole } = useRoleStore();
  const [activeTab, setActiveTab] = useState('permissions');
  
  const roleId = params.id as string;
  const role = getRole(roleId);

  if (!role) {
    return (
      <div className="px-6 py-6">
        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-2xl font-bold mb-4">Role Not Found</h2>
          <p className="text-muted-foreground mb-4">
            The role you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    router.push(`/system-administration/permission-management/roles/edit/${roleId}`);
  };

  const handleExport = () => {
    const exportData = {
      role: role.name,
      roleId: role.id,
      exportDate: new Date().toISOString(),
      permissions: role.permissions || [],
      hierarchy: role.hierarchy,
      parentRoles: role.parentRoles || []
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `role-${role.name.toLowerCase().replace(/\s+/g, '-')}-details.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{role.name}</h1>
          </div>
          <p className="text-muted-foreground">
            {role.description || 'Manage role permissions, user assignments, and policy configurations'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <Button onClick={handleEdit}>
            Edit Role
          </Button>
        </div>
      </div>

      {/* Role Header with Stats */}
      <RoleHeader role={role} />

      {/* Tab Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="policies">Policies</TabsTrigger>
        </TabsList>

        <TabsContent value="permissions" className="space-y-4">
          <PermissionDetailsTab role={role} />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <UserAssignmentTab role={role} />
        </TabsContent>

        <TabsContent value="policies" className="space-y-4">
          <PolicyAssignmentTab role={role} />
        </TabsContent>
      </Tabs>
    </div>
  );
}