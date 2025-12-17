/**
 * Permission Service - High-level API for permission management
 * Provides easy-to-use methods for checking permissions throughout the application
 */

import { policyEngine, PolicyEngineConfig } from './policy-engine'
import {
  Policy,
  SubjectAttributes,
  ResourceAttributes,
  EnvironmentAttributes,
  AccessDecision,
  PermissionResult as PermissionType,
  EffectType
} from '@/lib/types/permissions'
import { User, Role, Department, Location } from '@/lib/types/user'
import { allMockPolicies } from '@/lib/mock-data'
import { mockRoles, mockDepartments, mockLocations } from '@/lib/mock-data'

export interface PermissionCheckRequest {
  userId: string
  resourceType: string
  resourceId?: string
  action: string
  context?: {
    department?: string
    location?: string
    ipAddress?: string
    userAgent?: string
    additionalAttributes?: Record<string, any>
  }
}

export interface PermissionResult {
  allowed: boolean
  reason: string
  decision: AccessDecision
  executionTime: number
}

export interface BulkPermissionRequest {
  userId: string
  permissions: Array<{
    resourceType: string
    resourceId?: string
    action: string
  }>
  context?: PermissionCheckRequest['context']
}

export interface BulkPermissionResult {
  userId: string
  results: Array<{
    resourceType: string
    resourceId?: string
    action: string
    allowed: boolean
    reason: string
  }>
  executionTime: number
}

export class PermissionService {
  private policies: Policy[] = allMockPolicies
  
  constructor(policies?: Policy[], engineConfig?: Partial<PolicyEngineConfig>) {
    if (policies) {
      this.policies = policies
    }
    
    // Reinitialize engine if config provided
    if (engineConfig) {
      // Note: In a real implementation, you might want to create a new engine instance
      // For now, we'll use the singleton
    }
  }

  /**
   * Check if a user has permission to perform an action on a resource
   */
  async checkPermission(request: PermissionCheckRequest): Promise<PermissionResult> {
    const startTime = Date.now()
    
    try {
      // Get user information (in real app, fetch from database)
      const user = await this.getUser(request.userId)
      if (!user) {
        return {
          allowed: false,
          reason: 'User not found',
          decision: {
            effect: EffectType.DENY,
            reason: 'User not found',
            obligations: [],
            advice: [],
            requestId: `req-${Date.now()}`,
            evaluatedPolicies: [],
            evaluationTime: 0,
            cacheHit: false,
            timestamp: new Date(),
            evaluatedBy: 'permission-service',
            auditRequired: false
          },
          executionTime: Date.now() - startTime
        }
      }

      // Build subject from user data
      const subject = this.buildSubject(user, request.context)
      
      // Build resource
      const resource = this.buildResource(request.resourceType, request.resourceId)
      
      // Build action
      const action = this.buildAction(request.action)
      
      // Build environment
      const environment = this.buildEnvironment(request.context)

      // Evaluate permission using policy engine
      const decision = await policyEngine.evaluateAccess(
        subject, resource, action, environment, this.policies
      )

      return {
        allowed: decision.effect === 'permit',
        reason: decision.reason,
        decision,
        executionTime: Date.now() - startTime
      }
    } catch (error) {
      return {
        allowed: false,
        reason: `Permission check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        decision: {
          effect: EffectType.DENY,
          reason: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          obligations: [],
          advice: [],
          requestId: `req-${Date.now()}`,
          evaluatedPolicies: [],
          evaluationTime: Date.now() - startTime,
          cacheHit: false,
          timestamp: new Date(),
          evaluatedBy: 'permission-service',
          auditRequired: false
        },
        executionTime: Date.now() - startTime
      }
    }
  }

  /**
   * Check multiple permissions for a user at once
   */
  async checkBulkPermissions(request: BulkPermissionRequest): Promise<BulkPermissionResult> {
    const startTime = Date.now()
    const results = []

    for (const permission of request.permissions) {
      const permissionRequest: PermissionCheckRequest = {
        userId: request.userId,
        resourceType: permission.resourceType,
        resourceId: permission.resourceId,
        action: permission.action,
        context: request.context
      }

      const result = await this.checkPermission(permissionRequest)
      results.push({
        resourceType: permission.resourceType,
        resourceId: permission.resourceId,
        action: permission.action,
        allowed: result.allowed,
        reason: result.reason
      })
    }

    return {
      userId: request.userId,
      results,
      executionTime: Date.now() - startTime
    }
  }

  /**
   * Get all permissions for a user on a specific resource
   */
  async getUserResourcePermissions(
    userId: string, 
    resourceType: string, 
    resourceId?: string,
    context?: PermissionCheckRequest['context']
  ): Promise<Array<{ action: string; allowed: boolean; reason: string }>> {
    // Get all possible actions for this resource type
    const possibleActions = this.getPossibleActionsForResource(resourceType)
    
    const permissions = []
    for (const action of possibleActions) {
      const result = await this.checkPermission({
        userId,
        resourceType,
        resourceId,
        action,
        context
      })
      
      permissions.push({
        action,
        allowed: result.allowed,
        reason: result.reason
      })
    }
    
    return permissions
  }

  /**
   * Get all resources a user can access with a specific action
   */
  async getUserActionResources(
    userId: string, 
    action: string,
    context?: PermissionCheckRequest['context']
  ): Promise<Array<{ resourceType: string; resourceId?: string; allowed: boolean }>> {
    // Get all possible resource types
    const possibleResources = this.getPossibleResources()
    
    const resources = []
    for (const resourceType of possibleResources) {
      const result = await this.checkPermission({
        userId,
        resourceType,
        action,
        context
      })
      
      resources.push({
        resourceType,
        allowed: result.allowed
      })
    }
    
    return resources.filter(r => r.allowed)
  }

  /**
   * Check if user has any of the specified permissions (OR logic)
   */
  async hasAnyPermission(
    userId: string,
    permissions: Array<{ resourceType: string; action: string; resourceId?: string }>,
    context?: PermissionCheckRequest['context']
  ): Promise<boolean> {
    for (const permission of permissions) {
      const result = await this.checkPermission({
        userId,
        resourceType: permission.resourceType,
        resourceId: permission.resourceId,
        action: permission.action,
        context
      })
      
      if (result.allowed) {
        return true
      }
    }
    
    return false
  }

  /**
   * Check if user has all of the specified permissions (AND logic)
   */
  async hasAllPermissions(
    userId: string,
    permissions: Array<{ resourceType: string; action: string; resourceId?: string }>,
    context?: PermissionCheckRequest['context']
  ): Promise<boolean> {
    for (const permission of permissions) {
      const result = await this.checkPermission({
        userId,
        resourceType: permission.resourceType,
        resourceId: permission.resourceId,
        action: permission.action,
        context
      })
      
      if (!result.allowed) {
        return false
      }
    }
    
    return true
  }

  /**
   * Get effective permissions for a user (all permissions they have)
   */
  async getEffectivePermissions(
    userId: string,
    context?: PermissionCheckRequest['context']
  ): Promise<PermissionType[]> {
    const user = await this.getUser(userId)
    if (!user) {
      return []
    }

    const effectivePermissions: PermissionType[] = []
    const possibleResources = this.getPossibleResources()
    
    for (const resourceType of possibleResources) {
      const possibleActions = this.getPossibleActionsForResource(resourceType)
      
      for (const action of possibleActions) {
        const result = await this.checkPermission({
          userId,
          resourceType,
          action,
          context
        })
        
        if (result.allowed) {
          effectivePermissions.push({
            allowed: true,
            reason: 'Permission granted',
            evaluationTime: result.executionTime
          })
        }
      }
    }
    
    return effectivePermissions
  }

  /**
   * Build subject from user data
   */
  private buildSubject(user: User, context?: PermissionCheckRequest['context']): SubjectAttributes {
    // Map user clearance level to permission system clearance level
    const mapClearanceLevel = (level?: 'basic' | 'confidential' | 'secret' | 'top-secret'): 'public' | 'internal' | 'confidential' | 'restricted' | 'top_secret' => {
      switch (level) {
        case 'basic': return 'internal';
        case 'confidential': return 'confidential';
        case 'secret': return 'restricted';
        case 'top-secret': return 'top_secret';
        default: return 'internal';
      }
    };

    // Convert Role objects to Permission Role format
    const convertRoles = (roles: Role[]): import('@/lib/types/permissions').Role[] => {
      return roles.map(r => ({
        id: r.id,
        name: r.name,
        description: r.description,
        permissions: r.permissions,
        hierarchy: r.hierarchy || 0,
        isSystem: r.isSystem
      }));
    };

    const permissionRoles = convertRoles(user.roles);
    const permissionDepartments = user.departments?.map(d => ({
      id: d.id,
      name: d.name,
      code: d.code,
      description: d.description,
      status: d.status,
      parentDepartment: d.parentDepartment,
      costCenter: d.costCenter,
      managers: d.managers,
      assignedUsers: d.assignedUsers
    })) || [];
    const permissionLocations = user.locations?.map(l => ({
      id: l.id,
      name: l.name,
      type: l.type as any,
      address: l.address,
      coordinates: l.coordinates ? {
        latitude: l.coordinates.latitude,
        longitude: l.coordinates.longitude
      } : undefined,
      parentLocation: l.parentLocation
    })) || [];

    return {
      userId: user.id,
      username: user.name,
      email: user.email,
      role: {
        id: user.context.currentRole.id,
        name: user.context.currentRole.name,
        description: user.context.currentRole.description,
        permissions: user.context.currentRole.permissions,
        hierarchy: user.context.currentRole.hierarchy || 0,
        isSystem: user.context.currentRole.isSystem
      },
      roles: permissionRoles,
      department: {
        id: user.context.currentDepartment.id,
        name: user.context.currentDepartment.name,
        code: user.context.currentDepartment.code,
        description: user.context.currentDepartment.description,
        status: user.context.currentDepartment.status,
        parentDepartment: user.context.currentDepartment.parentDepartment,
        costCenter: user.context.currentDepartment.costCenter,
        managers: user.context.currentDepartment.managers,
        assignedUsers: user.context.currentDepartment.assignedUsers
      },
      departments: permissionDepartments,
      location: {
        id: user.context.currentLocation.id,
        name: user.context.currentLocation.name,
        type: user.context.currentLocation.type as any,
        address: user.context.currentLocation.address,
        coordinates: user.context.currentLocation.coordinates ? {
          latitude: user.context.currentLocation.coordinates.latitude,
          longitude: user.context.currentLocation.coordinates.longitude
        } : undefined,
        parentLocation: user.context.currentLocation.parentLocation
      },
      locations: permissionLocations,
      employeeType: 'full-time',
      seniority: 1,
      clearanceLevel: mapClearanceLevel(user.clearanceLevel),
      assignedWorkflowStages: user.assignedWorkflowStages || [],
      delegatedAuthorities: user.delegatedAuthorities || [],
      specialPermissions: user.specialPermissions || [],
      accountStatus: user.accountStatus || 'active',
      onDuty: true,
      approvalLimit: user.approvalLimit
    }
  }

  /**
   * Build resource from resource type and ID
   */
  private buildResource(resourceType: string, resourceId?: string): ResourceAttributes {
    return {
      resourceId: resourceId || resourceType,
      resourceType: resourceType,
      resourceName: resourceType,
      dataClassification: 'internal',
      createdAt: new Date(),
      updatedAt: new Date(),
      requiresAudit: false
    }
  }

  /**
   * Build action from action string
   */
  private buildAction(actionName: string): string {
    return actionName
  }

  /**
   * Build environment from context
   */
  private buildEnvironment(context?: PermissionCheckRequest['context']): EnvironmentAttributes {
    const now = new Date()
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    return {
      currentTime: now,
      dayOfWeek: days[now.getDay()],
      isBusinessHours: now.getHours() >= 8 && now.getHours() < 18,
      isHoliday: false,
      timeZone: 'UTC',
      requestIP: context?.ipAddress || '0.0.0.0',
      isInternalNetwork: true,
      deviceType: 'desktop',
      sessionId: `session-${Date.now()}`,
      authenticationMethod: 'password',
      sessionAge: 0,
      systemLoad: 'normal',
      maintenanceMode: false,
      emergencyMode: false,
      systemVersion: '1.0.0',
      threatLevel: 'low',
      auditMode: false,
      requestSource: 'ui',
      batchOperation: false
    }
  }

  /**
   * Get resource category from resource type
   */
  private getResourceCategory(resourceType: string): string {
    const categoryMap: Record<string, string> = {
      'purchase-request': 'procurement',
      'purchase-order': 'procurement',
      'goods-received-note': 'procurement',
      'vendor': 'procurement',
      'product': 'product-management',
      'recipe': 'operational-planning',
      'inventory-item': 'inventory-management',
      'stock-adjustment': 'inventory-management',
      'user': 'system-administration',
      'role': 'system-administration',
      'policy': 'system-administration',
      'report': 'reporting-analytics',
      'dashboard': 'dashboard',
      'workflow': 'system-administration'
    }
    
    return categoryMap[resourceType] || 'general'
  }

  /**
   * Get action type from action name
   */
  private getActionType(actionName: string): string {
    const typeMap: Record<string, string> = {
      'create': 'write',
      'read': 'read',
      'update': 'write',
      'delete': 'write',
      'approve': 'approve',
      'reject': 'approve',
      'submit': 'submit',
      'cancel': 'write',
      'view': 'read',
      'list': 'read',
      'export': 'export',
      'import': 'import'
    }
    
    return typeMap[actionName] || 'read'
  }

  /**
   * Get possible actions for a resource type
   */
  private getPossibleActionsForResource(resourceType: string): string[] {
    const actionMap: Record<string, string[]> = {
      'purchase-request': ['create', 'read', 'update', 'delete', 'submit', 'approve', 'reject', 'cancel'],
      'purchase-order': ['create', 'read', 'update', 'delete', 'submit', 'approve', 'cancel'],
      'goods-received-note': ['create', 'read', 'update', 'delete', 'submit'],
      'vendor': ['create', 'read', 'update', 'delete'],
      'product': ['create', 'read', 'update', 'delete'],
      'recipe': ['create', 'read', 'update', 'delete'],
      'inventory-item': ['create', 'read', 'update', 'delete'],
      'stock-adjustment': ['create', 'read', 'update', 'delete', 'submit', 'approve'],
      'user': ['create', 'read', 'update', 'delete'],
      'role': ['create', 'read', 'update', 'delete'],
      'policy': ['create', 'read', 'update', 'delete'],
      'report': ['view', 'export'],
      'dashboard': ['view'],
      'workflow': ['create', 'read', 'update', 'delete']
    }
    
    return actionMap[resourceType] || ['read']
  }

  /**
   * Get all possible resource types
   */
  private getPossibleResources(): string[] {
    return [
      'purchase-request',
      'purchase-order',
      'goods-received-note',
      'vendor',
      'product',
      'recipe',
      'inventory-item',
      'stock-adjustment',
      'user',
      'role',
      'policy',
      'report',
      'dashboard',
      'workflow'
    ]
  }

  /**
   * Get user information (mock implementation)
   */
  private async getUser(userId: string): Promise<User | null> {
    // In a real implementation, this would fetch from database
    // For now, create a mock user based on existing patterns
    const mockUser: User = {
      id: userId,
      name: 'Test User',
      email: 'test@example.com',
      avatar: undefined,
      availableRoles: mockRoles,
      availableDepartments: mockDepartments,
      availableLocations: mockLocations,
      roles: mockRoles,
      primaryRole: mockRoles[0],
      departments: mockDepartments,
      locations: mockLocations,
      role: mockRoles[0].id,
      department: mockDepartments[0].id,
      location: mockLocations[0].id,
      context: {
        currentRole: mockRoles[0],
        currentDepartment: mockDepartments[0],
        currentLocation: mockLocations[0],
        showPrices: true
      },
      accountStatus: 'active'
    }

    return mockUser
  }

  /**
   * Update policies (for dynamic policy updates)
   */
  updatePolicies(policies: Policy[]): void {
    this.policies = policies
  }

  /**
   * Add a new policy
   */
  addPolicy(policy: Policy): void {
    this.policies.push(policy)
  }

  /**
   * Remove a policy
   */
  removePolicy(policyId: string): void {
    this.policies = this.policies.filter(p => p.id !== policyId)
  }

  /**
   * Get all current policies
   */
  getPolicies(): Policy[] {
    return [...this.policies]
  }

  /**
   * Get policy engine statistics
   */
  getStats() {
    return policyEngine.getStats()
  }

  /**
   * Get audit log
   */
  getAuditLog(limit?: number) {
    return policyEngine.getAuditLog(limit)
  }

  /**
   * Clear audit log
   */
  clearAuditLog(): void {
    policyEngine.clearAuditLog()
  }
}

// Export singleton instance
export const permissionService = new PermissionService()

// Export convenience functions
export const checkPermission = (request: PermissionCheckRequest) => 
  permissionService.checkPermission(request)

export const hasPermission = async (
  userId: string, 
  resourceType: string, 
  action: string, 
  resourceId?: string,
  context?: PermissionCheckRequest['context']
) => {
  const result = await permissionService.checkPermission({
    userId,
    resourceType,
    resourceId,
    action,
    context
  })
  return result.allowed
}

export const getUserPermissions = (userId: string, context?: PermissionCheckRequest['context']) =>
  permissionService.getEffectivePermissions(userId, context)