"use client";

import { useState } from "react";
import { Check, ChevronDown, Building2, MapPin, UserCog, Users, Eye, EyeOff, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useSimpleUser } from "@/lib/context/simple-user-context";
import type { Role, Department, Location, User } from "@/lib/types/user";

// Demo users based on PR mock data requestorIds
const demoUsers = [
  {
    id: 'user-default-001',
    name: 'John Doe',
    email: 'john@example.com',
    department: 'Administration',
    role: 'Staff',
    avatar: '👤'
  },
  {
    id: 'user-chef-001',
    name: 'Chef Maria Rodriguez',
    email: 'maria.rodriguez@example.com',
    department: 'Food & Beverage',
    role: 'Chef',
    avatar: '👨‍🍳'
  },
  {
    id: 'user-maint-001',
    name: 'David Thompson',
    email: 'david.thompson@example.com',
    department: 'Maintenance',
    role: 'Staff',
    avatar: '🔧'
  },
  {
    id: 'user-hk-001',
    name: 'Sarah Chen',
    email: 'sarah.chen@example.com',
    department: 'Housekeeping',
    role: 'Staff',
    avatar: '🧹'
  },
  {
    id: 'user-bar-001',
    name: 'James Mitchell',
    email: 'james.mitchell@example.com',
    department: 'Food & Beverage',
    role: 'Staff',
    avatar: '🍸'
  },
  {
    id: 'user-fo-001',
    name: 'Emily Davis',
    email: 'emily.davis@example.com',
    department: 'Front Office',
    role: 'Staff',
    avatar: '🏨'
  },
  {
    id: 'user-eng-001',
    name: 'Robert Martinez',
    email: 'robert.martinez@example.com',
    department: 'Maintenance',
    role: 'Staff',
    avatar: '⚡'
  },
  {
    id: 'demo-manager',
    name: 'Demo Manager',
    email: 'manager@example.com',
    department: 'Administration',
    role: 'Department Manager',
    avatar: '👔'
  },
  {
    id: 'demo-finance',
    name: 'Demo Finance Manager',
    email: 'finance@example.com',
    department: 'Administration',
    role: 'Financial Manager',
    avatar: '💰'
  },
  {
    id: 'demo-purchasing',
    name: 'Demo Purchasing Staff',
    email: 'purchasing@example.com',
    department: 'Administration',
    role: 'Purchasing Staff',
    avatar: '📦'
  }
];

export function UserContextSwitcher() {
  const { user, setUser, updateUserContext } = useSimpleUser();
  const [isOpen, setIsOpen] = useState(false);

  if (!user) return null;

  const handleRoleChange = (role: Role) => {
    updateUserContext({ currentRole: role });
    setIsOpen(false);
  };

  const handleDepartmentChange = (department: Department) => {
    updateUserContext({ currentDepartment: department });
    setIsOpen(false);
  };

  const handleLocationChange = (location: Location) => {
    updateUserContext({ currentLocation: location });
    setIsOpen(false);
  };

  const handleDemoUserSwitch = (demoUser: typeof demoUsers[0]) => {
    // Create a new user object with the demo user's properties
    // but keep the same available roles, departments, and locations
    if (!user) return;

    // Determine showPrices based on role - Staff/Requestor roles should not see prices by default
    const staffRoles = ['Staff', 'Requestor', 'Store Staff', 'Chef', 'Counter Staff'];
    const shouldShowPrices = !staffRoles.includes(demoUser.role);

    const updatedUser: User = {
      ...user,
      id: demoUser.id,
      name: demoUser.name,
      email: demoUser.email,
      department: demoUser.department,
      role: demoUser.role,
      // Update current role to match the demo user's role
      context: {
        ...user.context,
        currentRole: user.availableRoles.find(r => r.name === demoUser.role) || user.context.currentRole,
        currentDepartment: user.availableDepartments.find(d => d.name === demoUser.department) || user.context.currentDepartment,
        showPrices: shouldShowPrices,
      }
    };

    setUser(updatedUser);
    setIsOpen(false);
  };

  const handlePriceVisibilityToggle = (showPrices: boolean) => {
    updateUserContext({ showPrices });
  };

  const handleSystemQuantityVisibilityToggle = (showSystemQuantity: boolean) => {
    updateUserContext({ showSystemQuantity });
  };

  const getLocationTypeIcon = (type: string) => {
    switch (type) {
      case 'hotel': return '🏨';
      case 'restaurant': return '🍽️';
      case 'warehouse': return '📦';
      case 'office': return '🏢';
      default: return '📍';
    }
  };

  const getLocationTypeBadge = (type: string) => {
    const variants = {
      'hotel': 'default',
      'restaurant': 'secondary',
      'warehouse': 'outline',
      'office': 'destructive'
    } as const;
    
    return variants[type as keyof typeof variants] || 'default';
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-auto p-2 justify-start">
          <div className="flex items-center space-x-2">
            <UserCog className="h-4 w-4 text-muted-foreground" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">Switch Context</span>
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <span>{user.context.currentRole.name}</span>
                <span>•</span>
                <span>{user.context.currentDepartment.code}</span>
                <span>•</span>
                <span>{user.context.currentLocation.name}</span>
              </div>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end" forceMount>
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium">Current Context</span>
            <div className="flex flex-wrap gap-1">
              <Badge variant="default">{user.context.currentRole.name}</Badge>
              <Badge variant="secondary">{user.context.currentDepartment.name}</Badge>
              <Badge variant={getLocationTypeBadge(user.context.currentLocation.type)}>
                {getLocationTypeIcon(user.context.currentLocation.type)} {user.context.currentLocation.name}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Role Switcher */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <UserCog className="mr-2 h-4 w-4" />
            <span>Switch Role</span>
            <Badge variant="outline" className="ml-auto">
              {user.context.currentRole.name}
            </Badge>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-60">
            <DropdownMenuLabel>Available Roles</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user.availableRoles.map((role) => (
              <DropdownMenuItem
                key={role.id}
                onClick={() => handleRoleChange(role)}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{role.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {role.permissions.length} permissions
                  </span>
                </div>
                {user.context.currentRole.id === role.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Department Switcher */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Building2 className="mr-2 h-4 w-4" />
            <span>Switch Department</span>
            <Badge variant="outline" className="ml-auto">
              {user.context.currentDepartment.code}
            </Badge>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-60">
            <DropdownMenuLabel>Available Departments</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user.availableDepartments.map((department) => (
              <DropdownMenuItem
                key={department.id}
                onClick={() => handleDepartmentChange(department)}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <span className="font-medium">{department.name}</span>
                  <span className="text-xs text-muted-foreground">
                    Code: {department.code}
                  </span>
                </div>
                {user.context.currentDepartment.id === department.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        {/* Location Switcher */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <MapPin className="mr-2 h-4 w-4" />
            <span>Switch Location</span>
            <Badge variant="outline" className="ml-auto">
              {getLocationTypeIcon(user.context.currentLocation.type)} {user.context.currentLocation.name}
            </Badge>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-80">
            <DropdownMenuLabel>Available Locations</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {user.availableLocations.map((location) => (
              <DropdownMenuItem
                key={location.id}
                onClick={() => handleLocationChange(location)}
                className="flex items-center justify-between"
              >
                <div className="flex flex-col">
                  <div className="flex items-center space-x-2">
                    <span>{getLocationTypeIcon(location.type)}</span>
                    <span className="font-medium">{location.name}</span>
                    <Badge variant={getLocationTypeBadge(location.type)} className="text-xs">
                      {location.type}
                    </Badge>
                  </div>
                  {location.address && (
                    <span className="text-xs text-muted-foreground">
                      {location.address}
                    </span>
                  )}
                </div>
                {user.context.currentLocation.id === location.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSeparator />

        {/* Price Visibility Toggle */}
        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {user.context.showPrices ? (
                <Eye className="h-4 w-4 text-muted-foreground" />
              ) : (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              )}
              <span className="text-sm font-medium">Show Prices</span>
            </div>
            <Switch
              checked={user.context.showPrices || false}
              onCheckedChange={handlePriceVisibilityToggle}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Toggle visibility of price information
          </div>
        </div>

        {/* System Quantity Visibility Toggle */}
        <div className="px-2 py-1.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Show System Qty</span>
            </div>
            <Switch
              checked={user.context.showSystemQuantity ?? true}
              onCheckedChange={handleSystemQuantityVisibilityToggle}
            />
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Show system quantities during inventory counts
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Demo User Switcher */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Users className="mr-2 h-4 w-4" />
            <span>Switch to Demo User</span>
            <Badge variant="outline" className="ml-auto">
              Demo
            </Badge>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent className="w-80">
            <DropdownMenuLabel>Available Demo Users</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {demoUsers.map((demoUser) => (
              <DropdownMenuItem
                key={demoUser.id}
                onClick={() => handleDemoUserSwitch(demoUser)}
                className="flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{demoUser.avatar}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{demoUser.name}</span>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{demoUser.role}</span>
                      <span>•</span>
                      <span>{demoUser.department}</span>
                    </div>
                  </div>
                </div>
                {user.id === demoUser.id && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}