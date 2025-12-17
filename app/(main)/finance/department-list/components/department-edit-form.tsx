'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'
import { Department, User } from '@/lib/types'
import { mockUsers } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { UserAssignment } from './user-assignment'
import { LocationAssignment } from './location-assignment'
import { Save, X, Users, MapPin } from 'lucide-react'

const departmentSchema = z.object({
  code: z.string().min(1, 'Code is required').max(10, 'Code must be 10 characters or less'),
  name: z.string().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
  description: z.string().optional(),
  managers: z.array(z.string()).optional(),
  costCenter: z.string().optional(),
  status: z.enum(['active', 'inactive']),
})

type DepartmentFormData = z.infer<typeof departmentSchema>

interface DepartmentEditFormProps {
  department?: Department
  onSave: (department: Partial<Department>) => void
  onCancel: () => void
}

export function DepartmentEditForm({ department, onSave, onCancel }: DepartmentEditFormProps) {
  const router = useRouter()
  const [assignedUserIds, setAssignedUserIds] = useState<string[]>(
    department?.assignedUsers || []
  )
  const [assignedLocationIds, setAssignedLocationIds] = useState<string[]>(
    department?.assignedLocations || []
  )

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      code: department?.code || '',
      name: department?.name || '',
      description: department?.description || '',
      managers: department?.managers || [],
      costCenter: department?.costCenter || '',
      status: department?.status || 'active',
    },
  })

  const status = watch('status')

  const onSubmit = (data: DepartmentFormData) => {
    const updatedDepartment: Partial<Department> = {
      ...data,
      assignedUsers: assignedUserIds,
      assignedLocations: assignedLocationIds,
    }

    if (department?.id) {
      updatedDepartment.id = department.id
    }

    onSave(updatedDepartment)
  }

  // Get list of users who can be managers
  const availableManagers = useMemo(() => {
    const currentManagerIds = department?.managers || []
    return mockUsers.filter(user =>
      // Include users already assigned as managers
      currentManagerIds.includes(user.id) ||
      // Include users with manager/director/head roles
      (user.roles && user.roles.some(role =>
        role && role.name && (
          role.name.toLowerCase().includes('manager') ||
          role.name.toLowerCase().includes('director') ||
          role.name.toLowerCase().includes('head') ||
          role.name.toLowerCase().includes('chef')
        )
      ))
    )
  }, [department?.managers])

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          {department?.id ? 'Edit Department' : 'New Department'}
        </h2>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button type="submit">
            <Save className="h-4 w-4 mr-2" />
            Save Department
          </Button>
        </div>
      </div>

      {/* Basic Information Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Basic Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Department Name *</Label>
            <Input
              id="name"
              {...register('name')}
              className="mt-1"
              placeholder="Enter department name"
            />
            {errors.name && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.name.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="code">Department Code *</Label>
            <Input
              id="code"
              {...register('code')}
              className="mt-1"
              placeholder="e.g., FIN, PROC"
              disabled={!!department?.id} // Disable editing code for existing departments
            />
            {errors.code && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.code.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
              className="mt-1"
              placeholder="Enter department description"
              rows={3}
            />
            {errors.description && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Management Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Management
        </h3>
        <div className="grid grid-cols-1 gap-4">
          <div>
            <Label>Department Heads</Label>
            <p className="text-sm text-muted-foreground mb-2">
              Select one or more users to be department heads
            </p>
            <div className="border rounded-md p-3 max-h-48 overflow-y-auto space-y-2 mt-1">
              {availableManagers.length === 0 ? (
                <p className="text-sm text-muted-foreground">No eligible managers found</p>
              ) : (
                availableManagers.map(user => {
                  const managers = watch('managers') || []
                  const isSelected = managers.includes(user.id)
                  return (
                    <div key={user.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`manager-${user.id}`}
                        checked={isSelected}
                        onCheckedChange={(checked) => {
                          const currentManagers = watch('managers') || []
                          if (checked) {
                            setValue('managers', [...currentManagers, user.id])
                          } else {
                            setValue('managers', currentManagers.filter(id => id !== user.id))
                          }
                        }}
                      />
                      <Label htmlFor={`manager-${user.id}`} className="cursor-pointer text-sm font-normal">
                        {user.name} <span className="text-muted-foreground">({user.email})</span>
                      </Label>
                    </div>
                  )
                })
              )}
            </div>
            {errors.managers && (
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {errors.managers.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="costCenter">Cost Center</Label>
              <Input
                id="costCenter"
                {...register('costCenter')}
                className="mt-1"
                placeholder="e.g., CC-001"
              />
              {errors.costCenter && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                  {errors.costCenter.message}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 mt-6">
              <Checkbox
                id="status"
                checked={status === 'active'}
                onCheckedChange={(checked) =>
                  setValue('status', checked ? 'active' : 'inactive')
                }
              />
              <Label htmlFor="status" className="cursor-pointer">
                Active
              </Label>
            </div>
          </div>
        </div>
      </div>

      {/* Users & Locations Assignment Section */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Assignments
        </h3>
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md">
            <TabsTrigger value="users" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Users ({assignedUserIds.length})
            </TabsTrigger>
            <TabsTrigger value="locations" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Locations ({assignedLocationIds.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="mt-6">
            <UserAssignment
              assignedUserIds={assignedUserIds}
              onAssignedUsersChange={setAssignedUserIds}
            />
          </TabsContent>

          <TabsContent value="locations" className="mt-6">
            <LocationAssignment
              assignedLocationIds={assignedLocationIds}
              onAssignedLocationsChange={setAssignedLocationIds}
            />
          </TabsContent>
        </Tabs>
      </div>

    </form>
  )
}
