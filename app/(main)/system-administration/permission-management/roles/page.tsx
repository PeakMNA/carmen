'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, ArrowLeft, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { PermissionBreadcrumbs } from '../components/permission-breadcrumbs';
import { RoleDataTable } from './components/role-data-table';
import { RoleCardView } from './components/role-card-view';
import { createRoleColumns } from './components/role-columns';
import { RoleForm } from '@/components/permissions/role-manager/role-form';
import { mockRoles } from '@/lib/mock-data/permission-index';
import { useRoleStore } from '@/lib/stores/role-store';
import { Role } from '@/lib/types';

type ViewMode = 'list' | 'create' | 'edit' | 'view';

export default function RoleManagementPage() {
  const router = useRouter();
  const [currentView, setCurrentView] = useState<ViewMode>('list');
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [viewType, setViewType] = useState<'table' | 'card'>('table');
  const { roles, addRole, updateRole, getRole } = useRoleStore();

  const handleCreateRole = () => {
    setSelectedRole(null);
    setCurrentView('create');
  };

  const handleEditRole = (roleOrId: string | Role) => {
    let role: Role | undefined = undefined;
    if (typeof roleOrId === 'string') {
      role = getRole(roleOrId);
    } else {
      role = roleOrId;
    }
    setSelectedRole(role || null);
    setCurrentView('edit');
  };

  const handleViewRole = (roleOrId: string | Role) => {
    let roleId: string;
    if (typeof roleOrId === 'string') {
      roleId = roleOrId;
    } else {
      roleId = roleOrId.id;
    }
    // Navigate to the role detail page
    router.push(`/system-administration/permission-management/roles/${roleId}`);
  };

  const handleSaveRole = async (data: any) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      if (selectedRole) {
        // Update existing role
        const success = updateRole(selectedRole.id, data);
        if (success) {
          console.log('Role updated successfully');
        }
      } else {
        // Create new role
        const newRole = addRole(data);
        console.log('Role created:', newRole);
      }
      
      setCurrentView('list');
      setSelectedRole(null);
    } catch (error) {
      console.error('Error saving role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setCurrentView('list');
    setSelectedRole(null);
  };

  const handleAssignUsers = (role: Role) => {
    console.log('Assign users to role:', role);
  };

  const handleDuplicateRole = (role: Role) => {
    console.log('Duplicate role:', role);
  };

  // Create columns for the data table
  const columns = createRoleColumns({
    onView: handleViewRole,
    onEdit: handleEditRole,
    onDelete: (role: Role) => console.log('Delete role:', role),
    onDuplicate: handleDuplicateRole,
    onAssignUsers: handleAssignUsers,
  }) as any;

  const getPageTitle = () => {
    switch (currentView) {
      case 'create': return 'Create New Role';
      case 'edit': return `Edit ${selectedRole?.name || 'Role'}`;
      case 'view': return `View ${selectedRole?.name || 'Role'}`;
      default: return 'Role Management';
    }
  };

  const getPageDescription = () => {
    switch (currentView) {
      case 'create': return 'Define a new role with its permissions and hierarchy';
      case 'edit': return 'Modify role settings, permissions, and hierarchy';
      case 'view': return 'View role details, permissions, and assignments';
      default: return 'Create, modify, and manage user roles with their associated permissions and hierarchy';
    }
  };

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Breadcrumbs */}
      <PermissionBreadcrumbs />
      
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {currentView !== 'list' && (
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <h1 className="text-3xl font-bold tracking-tight">{getPageTitle()}</h1>
          </div>
          <p className="text-muted-foreground">
            {getPageDescription()}
          </p>
        </div>
        
        {currentView === 'list' && (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </Button>
            <Button onClick={handleCreateRole}>
              <Plus className="mr-2 h-4 w-4" />
              Create Role
            </Button>
          </div>
        )}
      </div>

      {/* Dynamic Content Based on View */}
      {currentView === 'list' && (
        <RoleDataTable
          columns={columns}
          data={roles}
          viewMode={viewType}
          onViewModeChange={setViewType}
          cardView={
            <RoleCardView
              data={roles}
              selectedItems={[]}
              onSelectItem={() => {}}
              onSelectAll={() => {}}
              onView={handleViewRole}
              onEdit={handleEditRole}
              onDelete={(role: Role) => console.log('Delete role:', role)}
              onDuplicate={handleDuplicateRole}
              onAssignUsers={handleAssignUsers}
            />
          }
        />
      )}

      {(currentView === 'create' || currentView === 'edit') && (
        <RoleForm
          role={selectedRole || undefined}
          onSave={handleSaveRole}
          onCancel={handleCancel}
          isLoading={isLoading}
        />
      )}

      {currentView === 'view' && selectedRole && (
        <div className="space-y-6">
          {/* Role Details View */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold">{selectedRole.name}</h2>
                    <p className="text-muted-foreground">{selectedRole.description}</p>
                  </div>
                  <Button onClick={() => handleEditRole(selectedRole.id)}>
                    Edit Role
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
                  <div>
                    <div className="text-sm font-medium">Hierarchy Level</div>
                    <div className="text-2xl font-bold">{selectedRole.hierarchy || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Permissions</div>
                    <div className="text-2xl font-bold">{selectedRole.permissions?.length || 0}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium">Parent Roles</div>
                    <div className="text-2xl font-bold">{selectedRole.parentRoles?.length || 0}</div>
                  </div>
                </div>

                {selectedRole.permissions && selectedRole.permissions.length > 0 && (
                  <div className="pt-4">
                    <h3 className="text-lg font-medium mb-2">Permissions</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedRole.permissions.map((permission, index) => (
                        <span key={index} className="px-2 py-1 bg-muted rounded-md text-sm">
                          {permission}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}