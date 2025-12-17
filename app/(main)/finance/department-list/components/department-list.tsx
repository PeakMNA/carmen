'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Department } from '@/lib/types'
import { mockDepartments, mockUsers } from '@/lib/mock-data'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Plus, Search, Eye, Edit, Trash2 } from 'lucide-react'

export function DepartmentList() {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments)
  const [searchTerm, setSearchTerm] = useState('')

  const filteredDepartments = useMemo(() => {
    if (!searchTerm) return departments

    const query = searchTerm.toLowerCase()
    return departments.filter(
      (dept) =>
        dept.code.toLowerCase().includes(query) ||
        dept.name.toLowerCase().includes(query) ||
        dept.description?.toLowerCase().includes(query)
    )
  }, [departments, searchTerm])

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this department?')) {
      setDepartments(prev => prev.filter(dept => dept.id !== id))
    }
  }

  const getManagerNames = (managerIds?: string[]) => {
    if (!managerIds || managerIds.length === 0) return 'Not assigned'
    const managers = mockUsers.filter(user => managerIds.includes(user.id))
    return managers.length > 0 ? managers.map(m => m.name).join(', ') : 'Not assigned'
  }

  return (
    <div className="space-y-6 px-6 pt-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Department List
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage organizational departments and user assignments
          </p>
        </div>
        <Link href="/finance/department-list/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            New Department
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search departments by name, code, or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Department Table */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Code</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Head of Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDepartments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    {searchTerm ? 'No departments found matching your search.' : 'No departments available.'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredDepartments.map((dept) => (
                  <TableRow key={dept.id}>
                    <TableCell>
                      <Badge variant="outline">{dept.code}</Badge>
                    </TableCell>
                    <TableCell className="font-medium">{dept.name}</TableCell>
                    <TableCell className="max-w-md truncate">
                      {dept.description || '-'}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {getManagerNames(dept.managers)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={dept.status === 'active' ? 'default' : 'secondary'}>
                        {dept.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/finance/department-list/${dept.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">View</span>
                          </Button>
                        </Link>
                        <Link href={`/finance/department-list/${dept.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(dept.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600 dark:text-red-400" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Footer Stats */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Showing {filteredDepartments.length} of {departments.length} departments
        </div>
      </div>
    </div>
  )
}
