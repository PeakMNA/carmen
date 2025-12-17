'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Department } from '@/lib/types'
import { mockUsers, mockLocations } from '@/lib/mock-data'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Edit, Trash2, ArrowLeft, Users, Building2, MapPin } from 'lucide-react'

interface DepartmentDetailProps {
  department: Department
  onEdit: () => void
  onDelete: () => void
}

export function DepartmentDetail({ department, onEdit, onDelete }: DepartmentDetailProps) {
  // Get department managers (heads)
  const managers = useMemo(() => {
    if (!department.managers || department.managers.length === 0) return []
    return mockUsers.filter(user => department.managers?.includes(user.id))
  }, [department.managers])

  // Get assigned users
  const assignedUsers = useMemo(() => {
    if (!department.assignedUsers || department.assignedUsers.length === 0) return []
    return mockUsers.filter(user => department.assignedUsers?.includes(user.id))
  }, [department.assignedUsers])

  // Get assigned locations
  const assignedLocations = useMemo(() => {
    if (!department.assignedLocations || department.assignedLocations.length === 0) return []
    return mockLocations.filter(location => department.assignedLocations?.includes(location.id))
  }, [department.assignedLocations])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/finance/department-list">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to List
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {department.name}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline">{department.code}</Badge>
              <Badge variant={department.status === 'active' ? 'default' : 'secondary'}>
                {department.status}
              </Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Department Name
              </p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                {department.name}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Department Code
              </p>
              <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                {department.code}
              </p>
            </div>
          </div>
          {department.description && (
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Description
              </p>
              <p className="text-base text-gray-900 dark:text-gray-100 mt-1">
                {department.description}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Management Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Management
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Department Heads ({managers.length})
              </p>
              {managers.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {managers.map(manager => (
                    <div key={manager.id} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-md">
                      <div className="flex-shrink-0 h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                          {manager.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {manager.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {manager.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-base text-gray-500 dark:text-gray-400 mt-1">
                  Not assigned
                </p>
              )}
            </div>
            {department.costCenter && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  Cost Center
                </p>
                <p className="text-base font-medium text-gray-900 dark:text-gray-100 mt-1">
                  {department.costCenter}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs for Users and Locations */}
      <Card>
        <CardContent className="pt-6">
          <Tabs defaultValue="users">
            <TabsList className="grid w-full grid-cols-2 max-w-md">
              <TabsTrigger value="users" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Users ({assignedUsers.length})
              </TabsTrigger>
              <TabsTrigger value="locations" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Locations ({assignedLocations.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="mt-6">
              {assignedUsers.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No users assigned to this department
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {assignedUsers.map(user => (
                    <div
                      key={user.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                          {user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {user.name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="locations" className="mt-6">
              {assignedLocations.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                  No locations assigned to this department
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {assignedLocations.map(location => (
                    <div
                      key={location.id}
                      className="flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg"
                    >
                      <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-green-700 dark:text-green-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {location.name}
                        </p>
                        <Badge variant="outline" className="text-xs capitalize">
                          {location.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
