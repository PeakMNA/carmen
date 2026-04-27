'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { useRoleStore } from '@/lib/stores/role-store';
import { Role } from '@/lib/types';

const roleSchema = z.object({
  name: z.string().min(2, {
    message: "Role name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  hierarchy: z.number().min(1).max(1000).default(100),
  parentRoles: z.array(z.string()).optional(),
});

type RoleFormValues = z.infer<typeof roleSchema>;

export default function NewRolePage() {
  const router = useRouter();
  const { addRole, getAllRoles } = useRoleStore();
  const [isLoading, setIsLoading] = useState(false);
  const allRoles = getAllRoles();

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
      hierarchy: 100,
      parentRoles: [],
    },
  });

  const onSubmit = async (data: RoleFormValues) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newRole = {
        ...data,
        permissions: [],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const createdRole = addRole(newRole);
      
      // Navigate to the new role detail page
      router.push(`/system-administration/permission-management/roles/${createdRole.id}`);
    } catch (error) {
      console.error('Error creating role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const getHierarchyLabel = (level: number) => {
    if (level >= 900) return 'Executive';
    if (level >= 700) return 'Senior';
    if (level >= 500) return 'Supervisor';
    return 'Staff';
  };

  // Available parent roles (roles with higher hierarchy level)
  const hierarchyValue = form.watch('hierarchy');
  const availableParentRoles = allRoles.filter(role => 
    role.hierarchy !== undefined && 
    hierarchyValue !== undefined &&
    role.hierarchy > hierarchyValue
  );

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">Create New Role</h1>
          </div>
          <p className="text-muted-foreground">
            Define a new role with specific permissions and hierarchy
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isLoading}
          >
            <Save className="mr-2 h-4 w-4" />
            {isLoading ? 'Creating...' : 'Create Role'}
          </Button>
        </div>
      </div>

      {/* Create Form */}
      <Card>
        <CardHeader>
          <CardTitle>Role Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter role name" {...field} />
                      </FormControl>
                      <FormDescription>
                        A unique name to identify this role
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hierarchy"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hierarchy Level *</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input 
                            type="number" 
                            min="1" 
                            max="1000" 
                            placeholder="100"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">
                              {getHierarchyLabel(field.value)}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Higher numbers = higher authority
                            </span>
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Determines role authority and permission inheritance
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Describe the role's purpose and responsibilities..." 
                        className="min-h-[100px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Optional description to help users understand this role
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Parent Roles Selection */}
              {availableParentRoles.length > 0 && (
                <FormField
                  control={form.control}
                  name="parentRoles"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Roles</FormLabel>
                      <FormDescription>
                        This role will inherit permissions from selected parent roles
                      </FormDescription>
                      <div className="space-y-2">
                        {field.value && field.value.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {field.value.map((parentId) => {
                              const parentRole = availableParentRoles.find(r => r.id === parentId);
                              return parentRole ? (
                                <Badge key={parentId} variant="secondary" className="flex items-center gap-1">
                                  {parentRole.name}
                                  <X 
                                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                                    onClick={() => {
                                      const newValue = field.value?.filter(id => id !== parentId) || [];
                                      field.onChange(newValue);
                                    }}
                                  />
                                </Badge>
                              ) : null;
                            })}
                          </div>
                        )}
                        <Select
                          onValueChange={(value) => {
                            const currentValues = field.value || [];
                            if (!currentValues.includes(value)) {
                              field.onChange([...currentValues, value]);
                            }
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select parent roles..." />
                          </SelectTrigger>
                          <SelectContent>
                            {availableParentRoles
                              .filter(r => !field.value?.includes(r.id))
                              .map((parentRole) => (
                                <SelectItem key={parentRole.id} value={parentRole.id}>
                                  <div className="flex items-center justify-between w-full">
                                    <span>{parentRole.name}</span>
                                    <Badge variant="outline" className="text-xs ml-2">
                                      Level {parentRole.hierarchy}
                                    </Badge>
                                  </div>
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Preview Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Role Preview</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Role Name:</span>
                    <div className="mt-1 font-medium">
                      {form.watch('name') || 'Untitled Role'}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Authority Level:</span>
                    <div className="mt-1">
                      <Badge variant="outline">
                        Level {form.watch('hierarchy')} - {getHierarchyLabel(form.watch('hierarchy'))}
                      </Badge>
                    </div>
                  </div>
                  {form.watch('description') && (
                    <div className="md:col-span-2">
                      <span className="text-sm font-medium text-muted-foreground">Description:</span>
                      <div className="mt-1 text-sm">
                        {form.watch('description')}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}