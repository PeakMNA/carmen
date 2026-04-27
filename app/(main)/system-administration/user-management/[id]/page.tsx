"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  User,
  Building2,
  Users,
  Mail,
  Briefcase,
  UserCog,
  ArrowLeft,
  Save,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Building,
  UserCircle,
  ScrollText,
  Edit
} from "lucide-react"
import { useRoleStore } from "@/lib/stores/role-store"

// Mock data
const businessUnits = ["Sales", "Engineering", "Marketing", "Finance", "HR"]
const departments = {
  Sales: ["Enterprise Sales", "SMB Sales", "Sales Operations"],
  Engineering: ["Frontend", "Backend", "DevOps", "QA"],
  Marketing: ["Digital Marketing", "Content", "Brand"],
  Finance: ["Accounting", "Treasury", "Tax"],
  HR: ["Recruitment", "Training", "Employee Relations"],
}
// Roles will be loaded dynamically from role store
const locations = ["HQ", "Branch 1", "Branch 2", "Branch 3", "Remote"]

// Mock data for demonstration
const mockUsers = {
  "1": {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    businessUnit: "Sales",
    department: "Enterprise Sales",
    roles: ["role-010", "role-011"], // Financial Manager, Purchasing Staff
    locations: ["HQ", "Branch 1"],
    hodStatus: true,
    hodDepartments: ["Enterprise Sales", "SMB Sales"],
    inviteStatus: "accepted",
    lastLogin: "2024-02-20T10:00:00Z",
    accountStatus: "active",
  },
  "2": {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    businessUnit: "Engineering",
    department: "Frontend",
    roles: ["role-012", "role-020"], // IT Support, Contractor
    locations: ["HQ", "Remote"],
    hodStatus: true,
    hodDepartments: ["Frontend", "QA"],
    inviteStatus: "accepted",
    lastLogin: "2024-02-19T15:30:00Z",
    accountStatus: "active",
  },
}

export default function UserDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get("mode") || "view"
  const isNewUser = params.id === "new"
  const isViewMode = mode === "view" && !isNewUser
  const { roles } = useRoleStore()

  const [formData, setFormData] = useState(() => {
    if (isNewUser) {
      return {
        name: "",
        email: "",
        businessUnit: "",
        department: "",
        roles: [] as string[],
        locations: [] as string[],
        hodStatus: false,
        hodDepartments: [] as string[],
        inviteStatus: "pending",
        accountStatus: "inactive",
      }
    }
    // Load mock data for existing user
    return mockUsers[params.id as keyof typeof mockUsers] || {
      name: "",
      email: "",
      businessUnit: "",
      department: "",
      roles: [] as string[],
      locations: [] as string[],
      hodStatus: false,
      hodDepartments: [] as string[],
      inviteStatus: "pending",
      accountStatus: "inactive",
    }
  })

  const handleSave = async () => {
    try {
      // In a real application, this would be an API call
      console.log("Saving user:", formData)
      // Navigate back to the list after successful save
      router.replace("/system-administration/user-management")
    } catch (error) {
      console.error("Error saving user:", error)
      // Handle error case
    }
  }

  const handleCancel = () => {
    // Navigate back to the list
    router.replace("/system-administration/user-management")
  }

  const handleMultiSelect = (field: "roles" | "locations" | "hodDepartments", value: string) => {
    const currentValues = formData[field]
    const newValues = currentValues.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...currentValues, value]
    setFormData({ ...formData, [field]: newValues })
  }

  const removeItem = (field: "roles" | "locations" | "hodDepartments", value: string) => {
    setFormData({
      ...formData,
      [field]: formData[field].filter((v) => v !== value)
    })
  }

  return (
    <div className="px-6 py-10">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <h1 className="text-3xl font-bold">
                {isNewUser ? "Add New User" : isViewMode ? "User Details" : "Edit User"}
              </h1>
            </div>
            <p className="text-gray-500">
              {isNewUser
                ? "Create a new user account"
                : isViewMode
                ? "View user account details"
                : "Update user account details"}
            </p>
          </div>
          <div className="flex gap-2">
            {isViewMode ? (
              <Button onClick={() => router.push(`/system-administration/user-management/${params.id}?mode=edit`)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            ) : (
              <>
                <Button variant="outline" onClick={handleCancel}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCircle className="h-5 w-5" />
                Basic Information
              </CardTitle>
              <CardDescription>User&apos;s personal and contact details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Full Name
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Enter full name"
                  disabled={isViewMode}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="Enter email address"
                  disabled={isViewMode}
                />
              </div>
            </CardContent>
          </Card>

          {/* Organization Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Organization Details
              </CardTitle>
              <CardDescription>User&apos;s position and department information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building className="h-4 w-4" />
                  Business Unit
                </label>
                <Select
                  value={formData.businessUnit}
                  onValueChange={(value) =>
                    setFormData({
                      ...formData,
                      businessUnit: value,
                      department: "",
                    })
                  }
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select business unit" />
                  </SelectTrigger>
                  <SelectContent>
                    {businessUnits.map((unit) => (
                      <SelectItem key={unit} value={unit}>
                        {unit}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Briefcase className="h-4 w-4" />
                  Assigned Department
                </label>
                <Select
                  value={formData.department}
                  onValueChange={(value) =>
                    setFormData({ ...formData, department: value })
                  }
                  disabled={isViewMode || !formData.businessUnit}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select assigned department" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.businessUnit &&
                      departments[formData.businessUnit as keyof typeof departments].map(
                        (dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        )
                      )}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Access Control */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Access Control
              </CardTitle>
              <CardDescription>User&apos;s roles and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <UserCog className="h-4 w-4" />
                  Roles
                </label>
                <Select
                  value=""
                  onValueChange={(value) => handleMultiSelect("roles", value)}
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select roles" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map((role) => (
                      <SelectItem key={role.id} value={role.id}>
                        {role.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.roles.map((roleId) => {
                    const role = roles.find(r => r.id === roleId);
                    return role ? (
                      <Badge
                        key={roleId}
                        variant="secondary"
                        className={isViewMode ? undefined : "cursor-pointer pr-1.5"}
                      >
                        {role.name}
                        {!isViewMode && (
                          <button
                            onClick={() => removeItem("roles", roleId)}
                            className="ml-1 hover:text-red-500"
                          >
                            ×
                          </button>
                        )}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Assigned Locations
                </label>
                <Select
                  value=""
                  onValueChange={(value) => handleMultiSelect("locations", value)}
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select locations" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.locations.map((location) => (
                    <Badge
                      key={location}
                      variant="secondary"
                      className={isViewMode ? undefined : "cursor-pointer pr-1.5"}
                    >
                      {location}
                      {!isViewMode && (
                        <button
                          onClick={() => removeItem("locations", location)}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Head of Department
                  </label>
                  <Switch
                    checked={formData.hodStatus}
                    onCheckedChange={(checked) => {
                      setFormData({
                        ...formData,
                        hodStatus: checked,
                        hodDepartments: checked ? formData.hodDepartments : []
                      })
                    }}
                    disabled={isViewMode}
                  />
                </div>

                {formData.hodStatus && (
                  <div className="space-y-2 ml-6">
                    <label className="text-sm font-medium">
                      Department Head Of
                    </label>
                    <Select
                      value=""
                      onValueChange={(value) => handleMultiSelect("hodDepartments", value)}
                      disabled={isViewMode}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select departments" />
                      </SelectTrigger>
                      <SelectContent>
                        {formData.businessUnit &&
                          departments[formData.businessUnit as keyof typeof departments].map(
                            (dept) => (
                              <SelectItem key={dept} value={dept}>
                                {dept}
                              </SelectItem>
                            )
                          )}
                      </SelectContent>
                    </Select>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.hodDepartments.map((dept) => (
                        <Badge
                          key={dept}
                          variant="secondary"
                          className={isViewMode ? undefined : "cursor-pointer pr-1.5"}
                        >
                          {dept}
                          {!isViewMode && (
                            <button
                              onClick={() => removeItem("hodDepartments", dept)}
                              className="ml-1 hover:text-red-500"
                            >
                              ×
                            </button>
                          )}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Account Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ScrollText className="h-5 w-5" />
                Account Status
              </CardTitle>
              <CardDescription>User&apos;s account and invitation status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4" />
                  Account Status
                </label>
                <Select
                  value={formData.accountStatus}
                  onValueChange={(value) =>
                    setFormData({ ...formData, accountStatus: value })
                  }
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">
                      <div className="flex items-center">
                        <CheckCircle2 className="h-4 w-4 mr-2 text-green-500" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="inactive">
                      <div className="flex items-center">
                        <XCircle className="h-4 w-4 mr-2 text-gray-500" />
                        Inactive
                      </div>
                    </SelectItem>
                    <SelectItem value="suspended">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-yellow-500" />
                        Suspended
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Invite Status
                </label>
                <Select
                  value={formData.inviteStatus}
                  onValueChange={(value) =>
                    setFormData({ ...formData, inviteStatus: value })
                  }
                  disabled={isViewMode}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select invite status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="sent">Sent</SelectItem>
                    <SelectItem value="accepted">Accepted</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 