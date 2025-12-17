export interface Location {
  id: string;
  name: string;
  type: 'hotel' | 'restaurant' | 'warehouse' | 'office' | 'kitchen';
  address?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  parentLocation?: string;
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive';
  managers?: string[]; // Array of user IDs who are department heads
  costCenter?: string;
  parentDepartment?: string;
  assignedUsers?: string[]; // Array of user IDs assigned to this department
  assignedLocations?: string[]; // Array of location IDs assigned to this department
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  hierarchy?: number;
  isSystem?: boolean;
  parentRoles?: string[];
}

export interface Money {
  amount: number;
  currency: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  // Available options for this user
  availableRoles: Role[];
  availableDepartments: Department[];
  availableLocations: Location[];
  // Permission-related fields
  roles: Role[]; // Multiple roles assigned to user with full role objects
  primaryRole: Role; // Primary role object
  departments: Department[]; // Departments this user has access to
  locations: Location[]; // Locations this user has access to
  approvalLimit?: Money;
  delegatedAuthorities?: string[];
  specialPermissions?: string[];
  clearanceLevel?: 'basic' | 'confidential' | 'secret' | 'top-secret';
  effectiveFrom?: Date;
  effectiveTo?: Date;
  accountStatus?: 'active' | 'inactive' | 'suspended' | 'pending';
  lastLogin?: Date;
  // Head of Department status
  isHod?: boolean;
  hodDepartments?: Department[];
  // Business organization
  businessUnit?: string;
  // Effective permissions computed from roles
  effectivePermissions?: string[];
}

export interface UserContext {
  // Current active context
  currentRole: Role;
  currentDepartment: Department;
  currentLocation: Location;
  // UI preferences
  showPrices?: boolean;
  // Inventory counting preferences
  showSystemQuantity?: boolean; // Show/hide system quantity during physical counts and spot checks
}

export interface User extends UserProfile {
  // Current active selections (for compatibility)
  role: string; // Current active role ID
  department: string; // Current active department ID
  location?: string; // Current active location ID
  // Workflow stages this user can approve
  assignedWorkflowStages?: string[];
  context: UserContext;
  // User preferences
  preferences?: import('./settings').UserPreferences;
  lastPreferencesUpdate?: Date;
}

export interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUserContext: (context: Partial<UserContext>) => void;
  isLoading: boolean;
}
