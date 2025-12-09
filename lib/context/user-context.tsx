'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserContextType, UserContext } from '../types/user';
import { mockRoles, mockDepartments, mockLocations } from '../mock-data';


// Mock user data - replace with actual API call
const createMockUser = (): User => {
  const defaultRole = mockRoles[0]; // Staff for testing edit mode
  const defaultDepartment = mockDepartments[0];
  const defaultLocation = mockLocations[0];

  return {
    id: 'user-chef-001',
    name: 'Chef Maria Rodriguez',
    email: 'maria.rodriguez@example.com',
    avatar: '/avatars/default.png',
    availableRoles: mockRoles,
    availableDepartments: mockDepartments,
    availableLocations: mockLocations,
    // Permission-related fields (required by UserProfile)
    roles: mockRoles, // User has access to all roles for testing
    primaryRole: defaultRole, // Primary role object
    departments: mockDepartments, // Departments user has access to
    locations: mockLocations, // Locations user has access to
    // Current active selections
    role: defaultRole.name,
    department: defaultDepartment.name,
    location: defaultLocation.name,
    // Workflow stages this user can approve
    assignedWorkflowStages: ['departmentHeadApproval', 'financeManagerApproval'],
    context: {
      currentRole: defaultRole,
      currentDepartment: defaultDepartment,
      currentLocation: defaultLocation,
      showPrices: true, // Default to showing prices
      showSystemQuantity: true, // Default to showing system quantity during counts
    }
  };
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const updateUserContext = (contextUpdates: Partial<UserContext>) => {
    if (!user) return;

    const updatedUser = { ...user };

    // Update role if provided
    if (contextUpdates.currentRole) {
      updatedUser.context.currentRole = contextUpdates.currentRole;
      updatedUser.role = contextUpdates.currentRole.name;
    }

    // Update department if provided
    if (contextUpdates.currentDepartment) {
      updatedUser.context.currentDepartment = contextUpdates.currentDepartment;
      updatedUser.department = contextUpdates.currentDepartment.name;
    }

    // Update location if provided
    if (contextUpdates.currentLocation) {
      updatedUser.context.currentLocation = contextUpdates.currentLocation;
      updatedUser.location = contextUpdates.currentLocation.name;
    }

    // Update price visibility if provided
    if (contextUpdates.showPrices !== undefined) {
      updatedUser.context.showPrices = contextUpdates.showPrices;
    }

    // Update system quantity visibility if provided
    if (contextUpdates.showSystemQuantity !== undefined) {
      updatedUser.context.showSystemQuantity = contextUpdates.showSystemQuantity;
    }

    setUser(updatedUser);
    
    // Here you would typically also save to localStorage or send to API
    console.log('User context updated:', updatedUser.context);
  };

  useEffect(() => {
    // Simulate API call to get user
    const loadUser = async () => {
      try {
        // Replace with actual API call
        await new Promise(resolve => setTimeout(resolve, 500));
        setUser(createMockUser());
      } catch (error) {
        console.error('Failed to load user:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, []);

  return (
    <UserContext.Provider value={{ user, setUser, updateUserContext, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
