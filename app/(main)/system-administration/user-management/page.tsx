"use client"

import React, { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UserDataTable } from "./components/user-data-table"
import { UserCardView } from "./components/user-card-view"
import { createUserColumns } from "./components/user-columns"
import { BulkActions } from "./components/bulk-actions"
import { EnhancedUserFormDialog } from "./components/enhanced-user-form-dialog"
import { 
  UserPlus, 
  Download,
  Printer,
  Shield,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface User {
  id: string
  name: string
  email: string
  businessUnit: string
  department: string
  roles: string[]
  primaryRole?: string
  hodStatus: boolean
  inviteStatus?: string
  lastLogin?: string
  accountStatus: string
  approvalLimit?: {
    amount: number
    currency: string
  }
  clearanceLevel?: string
  locations?: string[]
  effectivePermissions?: string[]
  departments?: string[]
  specialPermissions?: string[]
  delegatedAuthorities?: string[]
  effectiveFrom?: Date
  effectiveTo?: Date
  isHod?: boolean
  businessUnitName?: string
}

// Mock data for demonstration  
const mockUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    businessUnit: "management",
    businessUnitName: "Management",
    department: "Administration",
    departments: ["dept-001", "dept-006"],
    roles: ["role-002", "role-005"],
    primaryRole: "role-002",
    hodStatus: true,
    isHod: true,
    inviteStatus: "accepted",
    lastLogin: "2024-02-20T10:00:00Z",
    accountStatus: "active",
    approvalLimit: {
      amount: 50000,
      currency: "USD"
    },
    clearanceLevel: "confidential",
    locations: ["loc-001", "loc-002"],
    effectivePermissions: [
      "purchase_request:*", "purchase_order:*", "budget:*", "financial_report:*",
      "user:create", "user:update", "user:assign_role", "workflow:configure"
    ],
    specialPermissions: ["emergency-access-override", "cross-department-access"],
    delegatedAuthorities: ["purchase-request-approval", "user-management"],
    effectiveFrom: new Date('2024-01-01'),
    effectiveTo: new Date('2025-12-31')
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    businessUnit: "operations",
    businessUnitName: "Operations",
    department: "Procurement",
    departments: ["dept-002"],
    roles: ["role-009"],
    primaryRole: "role-009",
    hodStatus: false,
    isHod: false,
    inviteStatus: "accepted",
    lastLogin: "2024-02-19T15:30:00Z",
    accountStatus: "active",
    approvalLimit: {
      amount: 10000,
      currency: "USD"
    },
    clearanceLevel: "basic",
    locations: ["loc-001", "loc-004"],
    effectivePermissions: [
      "purchase_order:create", "purchase_order:update", "purchase_order:send",
      "vendor:view", "vendor_quotation:create", "goods_receipt_note:create"
    ],
    effectiveFrom: new Date('2024-01-15'),
    effectiveTo: new Date('2025-12-31')
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    businessUnit: "operations",
    businessUnitName: "Operations",
    department: "Kitchen Operations",
    departments: ["dept-003"],
    roles: ["role-007", "role-011"],
    primaryRole: "role-007",
    hodStatus: true,
    isHod: true,
    inviteStatus: "accepted",
    lastLogin: "2024-02-21T08:00:00Z",
    accountStatus: "active",
    approvalLimit: {
      amount: 25000,
      currency: "USD"
    },
    clearanceLevel: "confidential",
    locations: ["loc-002", "loc-003"],
    effectivePermissions: [
      "recipe:*", "menu_item:*", "recipe_category:*", "cuisine_type:*",
      "production_order:*", "batch_production:*", "quality_control:*",
      "recipe_report:*"
    ],
    specialPermissions: ["recipe-confidential-access"],
    delegatedAuthorities: ["recipe-modifications", "quality-control-override"],
    effectiveFrom: new Date('2024-01-01')
  },
  {
    id: "4",
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    businessUnit: "finance",
    businessUnitName: "Finance",
    department: "Accounting",
    departments: ["dept-005"],
    roles: ["role-006"],
    primaryRole: "role-006",
    hodStatus: false,
    isHod: false,
    inviteStatus: "accepted",
    lastLogin: "2024-02-22T09:30:00Z",
    accountStatus: "active",
    approvalLimit: {
      amount: 15000,
      currency: "USD"
    },
    clearanceLevel: "confidential",
    locations: ["loc-001"],
    effectivePermissions: [
      "financial_report:view", "budget:view", "invoice:*", "payment:*"
    ],
    effectiveFrom: new Date('2024-01-10'),
    effectiveTo: new Date('2025-12-31')
  },
  {
    id: "5",
    name: "David Chen",
    email: "david.chen@example.com",
    businessUnit: "operations",
    businessUnitName: "Operations",
    department: "IT Support",
    departments: ["dept-007"],
    roles: ["role-012"],
    primaryRole: "role-012",
    hodStatus: false,
    isHod: false,
    inviteStatus: "pending",
    lastLogin: "2024-02-18T14:00:00Z",
    accountStatus: "pending",
    approvalLimit: {
      amount: 5000,
      currency: "USD"
    },
    clearanceLevel: "basic",
    locations: ["loc-001", "loc-002"],
    effectivePermissions: [
      "system:maintenance", "user:support", "equipment:*"
    ],
    effectiveFrom: new Date('2024-02-01'),
    effectiveTo: new Date('2025-12-31')
  }
]

export default function UserManagementPage() {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table')

  // Use the existing mock data
  const data = useMemo(() => users, [users])

  const handleSelectItem = (id: string) => {
    setSelectedUsers(prev =>
      prev.includes(id)
        ? prev.filter(item => item !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    setSelectedUsers(prev =>
      prev.length === data.length ? [] : data.map(item => item.id)
    )
  }

  const handleView = (user: User) => {
    router.push(`/system-administration/user-management/${user.id}?mode=view`)
  }

  const handleEdit = (user: User) => {
    router.push(`/system-administration/user-management/${user.id}?mode=edit`)
  }

  const handleDelete = (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
      setUsers(users.filter(u => u.id !== user.id))
      setSelectedUsers(selectedUsers.filter(id => id !== user.id))
    }
  }

  const handleBulkAction = async (action: string, data: any) => {
    // Implement bulk action logic here
    console.log("Bulk action:", action, data, "for users:", selectedUsers)
    
    switch (action) {
      case 'role':
        // Open role assignment dialog for selected users
        const selectedRoles = prompt('Enter role IDs (comma separated):');
        if (selectedRoles) {
          const roleIds = selectedRoles.split(',').map(r => r.trim());
          setUsers(users.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, roles: [...new Set([...user.roles, ...roleIds])] }
              : user
          ));
          setSelectedUsers([]);
        }
        break;
      case 'status':
        const newStatus = prompt('Enter new status (active/inactive/suspended/pending):');
        if (newStatus && ['active', 'inactive', 'suspended', 'pending'].includes(newStatus)) {
          setUsers(users.map(user => 
            selectedUsers.includes(user.id) 
              ? { ...user, accountStatus: newStatus }
              : user
          ));
          setSelectedUsers([]);
        }
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete ${selectedUsers.length} users?`)) {
          setUsers(users.filter(user => !selectedUsers.includes(user.id)));
          setSelectedUsers([]);
        }
        break;
      default:
        console.log("Action not implemented:", action);
    }
  }

  const handleUserSubmit = async (userData: Omit<User, "id"> | any) => {
    // In a real application, this would be an API call
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      // Ensure all required User properties are present
      businessUnit: userData.businessUnit || '',
      department: userData.department || '',
      roles: userData.roles || [],
      hodStatus: userData.hodStatus || false,
      accountStatus: userData.accountStatus || 'active',
    };
    setUsers([...users, newUser]);
  }

  const handleExport = () => {
    // Convert users data to CSV
    const headers = ['Name', 'Email', 'Business Unit', 'Department', 'Roles', 'Status'];
    const csvData = users.map(user => [
      user.name,
      user.email,
      user.businessUnitName || user.businessUnit,
      user.department,
      user.roles.join('; '),
      user.accountStatus
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  const handlePrint = () => {
    window.print();
  }

  const handleInviteUser = () => {
    alert('Invite User dialog - To be implemented');
  }

  const handleImportCSV = () => {
    alert('Import CSV dialog - To be implemented');
  }

  const handleBulkSetup = () => {
    alert('Bulk User Setup wizard - To be implemented');
  }

  const columns = createUserColumns({
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete
  })

  const cardView = (
    <UserCardView
      data={data}
      selectedItems={selectedUsers}
      onSelectItem={handleSelectItem}
      onSelectAll={handleSelectAll}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  )

  return (
    <div className="px-6 py-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage users, roles, and permissions across the Carmen ERP system.
          </p>
        </div>
        
        {/* Action Buttons - Top aligned with title */}
        <div className="flex items-center space-x-2 md:mt-0">
          <Button variant="outline" onClick={() => router.push("/system-administration/permission-management/roles")}>
            <Shield className="h-4 w-4 mr-2" />
            Manage Roles
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button>
                <UserPlus className="mr-2 h-4 w-4" />
                New User
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <EnhancedUserFormDialog
                onSubmit={handleUserSubmit}
                trigger={
                  <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                    Create New User
                  </DropdownMenuItem>
                }
              />
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
              <DropdownMenuItem onSelect={handleInviteUser}>Invite User</DropdownMenuItem>
              <DropdownMenuItem onSelect={handleImportCSV}>Import from CSV</DropdownMenuItem>
              <DropdownMenuItem onSelect={handleBulkSetup}>Bulk User Setup</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>

          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="mr-2 h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedUsers.length > 0 && (
        <BulkActions
          selectedCount={selectedUsers.length}
          onAction={handleBulkAction}
        />
      )}

      <UserDataTable
        columns={columns}
        data={data}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        cardView={cardView}
      />
    </div>
  )
} 