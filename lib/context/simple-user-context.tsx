'use client';

/**
 * Simple User Context Provider
 *
 * Provides mock user context without authentication for prototype development.
 * Uses centralized mock data to simulate user roles and permissions.
 *
 * @author Carmen ERP Team
 */

import { createContext, useContext, useState, useCallback } from 'react'
import type { User, UserContextType, UserContext } from '../types/user'
import type { Role } from '../types/user'
import { mockDepartments, mockLocations, mockUsers } from '../mock-data'

// Use the first mock user as default (can be changed for testing)
const DEFAULT_MOCK_USER = mockUsers[0]

interface SimpleUserContextType extends UserContextType {
  user: User | null
  setUser: (user: User | null) => void
  switchUser: (userId: string) => void
  switchRole: (roleName: string) => void
  switchDepartment: (departmentName: string) => void
  switchLocation: (locationName: string) => void
  isLoading: false // Always false for prototype
}

const SimpleUserContext = createContext<SimpleUserContextType | undefined>(undefined)

export function SimpleUserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(DEFAULT_MOCK_USER)

  const updateUserContext = useCallback((contextUpdates: Partial<UserContext>) => {
    if (!user) return

    const updatedUser = { ...user }

    // Update role if provided
    if (contextUpdates.currentRole) {
      updatedUser.context.currentRole = contextUpdates.currentRole
      updatedUser.role = contextUpdates.currentRole.id
    }

    // Update department if provided
    if (contextUpdates.currentDepartment) {
      updatedUser.context.currentDepartment = contextUpdates.currentDepartment
      updatedUser.department = contextUpdates.currentDepartment.name
    }

    // Update location if provided
    if (contextUpdates.currentLocation) {
      updatedUser.context.currentLocation = contextUpdates.currentLocation
      updatedUser.location = contextUpdates.currentLocation.name
    }

    // Update price visibility if provided
    if (contextUpdates.showPrices !== undefined) {
      updatedUser.context.showPrices = contextUpdates.showPrices
    }

    // Update system quantity visibility if provided
    if (contextUpdates.showSystemQuantity !== undefined) {
      updatedUser.context.showSystemQuantity = contextUpdates.showSystemQuantity
    }

    setUser(updatedUser)
    console.log('User context updated:', updatedUser.context)
  }, [user])

  const switchUser = useCallback((userId: string) => {
    const mockUser = mockUsers.find(u => u.id === userId)
    if (mockUser) {
      setUser(mockUser)
      console.log('Switched to user:', mockUser.name)
    }
  }, [])

  const switchRole = useCallback((roleName: string) => {
    if (!user) return

    const availableRole = user.availableRoles.find(r => r.name === roleName)
    if (availableRole) {
      updateUserContext({ currentRole: availableRole })
    }
  }, [user, updateUserContext])

  const switchDepartment = useCallback((departmentName: string) => {
    const department = mockDepartments.find(d => d.name === departmentName)
    if (department) {
      updateUserContext({ currentDepartment: department })
    }
  }, [updateUserContext])

  const switchLocation = useCallback((locationName: string) => {
    const location = mockLocations.find(l => l.name === locationName)
    if (location) {
      updateUserContext({ currentLocation: location })
    }
  }, [updateUserContext])

  const contextValue: SimpleUserContextType = {
    user,
    setUser,
    updateUserContext,
    switchUser,
    switchRole,
    switchDepartment,
    switchLocation,
    isLoading: false,
  }

  return (
    <SimpleUserContext.Provider value={contextValue}>
      {children}
    </SimpleUserContext.Provider>
  )
}

export function useSimpleUser() {
  const context = useContext(SimpleUserContext)
  if (context === undefined) {
    throw new Error('useSimpleUser must be used within a SimpleUserProvider')
  }
  return context
}

// Export with same name as before for backward compatibility
export const useKeycloakUser = useSimpleUser
export const useUser = useSimpleUser