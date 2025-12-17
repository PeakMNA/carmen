// Core Permission Management Types for Carmen ERP
// Based on Attribute-Based Access Control (ABAC) principles

// ============================================================================
// Core Enums
// ============================================================================

export enum Operator {
  EQUALS = '==',
  NOT_EQUALS = '!=',
  GREATER_THAN = '>',
  LESS_THAN = '<',
  GREATER_THAN_OR_EQUAL = '>=',
  LESS_THAN_OR_EQUAL = '<=',
  IN = 'in',
  NOT_IN = 'not_in',
  CONTAINS = 'contains',
  NOT_CONTAINS = 'not_contains',
  MATCHES = 'matches',
  EXISTS = 'exists',
  NOT_EXISTS = 'not_exists',
  STARTS_WITH = 'starts_with',
  ENDS_WITH = 'ends_with'
}

export enum EffectType {
  PERMIT = 'permit',
  DENY = 'deny'
}

export enum LogicalOperator {
  AND = 'AND',
  OR = 'OR',
  NOT = 'NOT'
}

export enum CombiningAlgorithm {
  DENY_OVERRIDES = 'deny_overrides',
  PERMIT_OVERRIDES = 'permit_overrides',
  FIRST_APPLICABLE = 'first_applicable',
  ONLY_ONE_APPLICABLE = 'only_one_applicable'
}

// ============================================================================
// Attribute Interfaces
// ============================================================================

export interface SubjectAttributes {
  // Identity
  userId: string;
  username: string;
  email: string;
  
  // Organizational Structure
  role: Role;
  roles: Role[];
  department: Department;
  departments: Department[];
  location: Location;
  locations: Location[];
  
  // Employment Details
  employeeType: 'full-time' | 'part-time' | 'contractor' | 'temporary' | 'intern';
  seniority: number; // Years of service
  clearanceLevel: 'public' | 'internal' | 'confidential' | 'restricted' | 'top_secret';
  
  // Permissions & Capabilities
  assignedWorkflowStages: string[];
  delegatedAuthorities: string[];
  specialPermissions: string[];
  
  // Status & Availability
  accountStatus: 'active' | 'suspended' | 'locked' | 'inactive' | 'pending';
  onDuty: boolean;
  shiftTiming?: {
    start: Date;
    end: Date;
  };
  
  // Financial & Approval Limits
  approvalLimit?: Money;
  budgetAccess?: BudgetScope[];
  
  // Session Context
  currentSession?: {
    sessionId: string;
    loginTime: Date;
    lastActivity: Date;
    ipAddress: string;
    deviceType: string;
  };
}

export interface ResourceAttributes {
  // Identity
  resourceId: string;
  resourceType: string;
  resourceName: string;
  
  // Ownership & Classification
  owner?: string; // User ID of owner
  ownerDepartment?: string;
  ownerLocation?: string;
  dataClassification: 'public' | 'internal' | 'confidential' | 'restricted' | 'top_secret';
  
  // Business Context
  documentStatus?: PermissionDocumentStatus;
  workflowStage?: string;
  approvalLevel?: number;
  priority?: 'low' | 'normal' | 'high' | 'urgent' | 'critical';
  
  // Financial Context
  totalValue?: Money;
  budgetCategory?: string;
  costCenter?: string;
  
  // Temporal Context
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  effectiveDate?: Date;
  
  // Compliance & Audit
  requiresAudit: boolean;
  regulatoryFlags?: string[];
  retentionPeriod?: number; // Days
  complianceRequirements?: string[];
  
  // Relationships
  parentResource?: string;
  relatedResources?: string[];
  dependencies?: string[];
  
  // Location Context
  physicalLocation?: string;
  accessLocation?: string;
  
  // Custom Attributes
  customAttributes?: Record<string, any>;
}

export interface EnvironmentAttributes {
  // Temporal Context
  currentTime: Date;
  dayOfWeek: string;
  isBusinessHours: boolean;
  isHoliday: boolean;
  timeZone: string;
  
  // Location Context
  requestIP: string;
  requestLocation?: GeoLocation;
  isInternalNetwork: boolean;
  facility?: string;
  country?: string;
  region?: string;
  
  // Device & Session Context
  deviceType: 'desktop' | 'mobile' | 'tablet' | 'api' | 'system';
  deviceId?: string;
  userAgent?: string;
  sessionId: string;
  authenticationMethod: 'password' | 'sso' | 'mfa' | 'biometric' | 'api_key' | 'service_account';
  sessionAge: number; // Minutes since login
  
  // System State
  systemLoad: 'low' | 'normal' | 'high' | 'critical';
  maintenanceMode: boolean;
  emergencyMode: boolean;
  systemVersion: string;
  
  // Risk & Compliance Context
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  complianceMode?: string[];
  auditMode: boolean;
  
  // Request Context
  requestMethod?: string;
  requestSource: 'ui' | 'api' | 'webhook' | 'scheduled' | 'system';
  batchOperation: boolean;
  
  // Custom Environment
  customEnvironment?: Record<string, any>;
}

// ============================================================================
// Expression & Rule Interfaces
// ============================================================================

export interface Expression {
  type: 'simple' | 'composite';
  
  // For simple expressions
  attribute?: string;
  operator?: Operator;
  value?: any;
  
  // For composite expressions
  expressions?: Expression[];
  logicalOperator?: LogicalOperator;
}

export interface AttributeCondition {
  attribute: string;
  operator: Operator;
  value: any;
  description?: string;
}

export interface Rule {
  id: string;
  description: string;
  condition: Expression;
  combiningAlgorithm?: CombiningAlgorithm;
  weight?: number; // For weighted decisions
}

// ============================================================================
// Policy Interfaces
// ============================================================================

export interface PolicyTarget {
  subjects?: AttributeCondition[];
  resources?: AttributeCondition[];
  actions?: string[];
  environment?: AttributeCondition[];
}

export interface Obligation {
  id: string;
  type: 'audit' | 'notification' | 'logging' | 'approval' | 'encryption' | 'custom';
  attributes: Record<string, any>;
  description?: string;
}

export interface Advice {
  id: string;
  type: 'recommendation' | 'warning' | 'information' | 'best_practice';
  message: string;
  attributes?: Record<string, any>;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  priority: number; // Higher number = higher priority
  enabled: boolean;
  
  // Policy Target - When this policy applies
  target: PolicyTarget;
  
  // Rules - Conditions that must be met
  rules: Rule[];
  
  // Effect - What happens when conditions are met
  effect: EffectType;
  
  // Additional Requirements
  obligations?: Obligation[];
  advice?: Advice[];
  
  // Metadata
  version: string;
  createdBy: string;
  createdAt: Date;
  updatedBy?: string;
  updatedAt?: Date;
  tags?: string[];
  category?: string;
  
  // Lifecycle Management
  effectiveFrom?: Date;
  effectiveTo?: Date;
  
  // Testing & Validation
  testScenarios?: PolicyTestScenario[];
  validationRules?: string[];
}

export interface PolicyTestScenario {
  id: string;
  name: string;
  description: string;
  subjectAttributes: Partial<SubjectAttributes>;
  resourceAttributes: Partial<ResourceAttributes>;
  environmentAttributes: Partial<EnvironmentAttributes>;
  action: string;
  expectedResult: EffectType;
}

// ============================================================================
// Access Request & Decision Interfaces
// ============================================================================

export interface AccessRequest {
  // Required fields
  userId: string;
  resourceId: string;
  action: string;
  
  // Optional context
  resourceType?: string;
  additionalAttributes?: Record<string, any>;
  source?: string;
  requestId?: string;
  timestamp?: Date;
  
  // Batch request support
  batchRequest?: boolean;
  batchItems?: AccessRequest[];
}

export interface PolicyResult {
  policyId: string;
  effect: EffectType | 'not_applicable' | 'indeterminate';
  obligations?: Obligation[];
  advice?: Advice[];
  evaluationTime?: number;
  ruleResults?: Record<string, boolean>;
  reason?: string;
}

export interface AccessDecision {
  effect: EffectType;
  reason: string;
  obligations: Obligation[];
  advice: Advice[];
  
  // Evaluation Details
  requestId: string;
  evaluatedPolicies: PolicyResult[];
  evaluationTime: number;
  cacheHit: boolean;
  
  // Metadata
  timestamp: Date;
  evaluatedBy: string; // System/service that made the decision
  
  // Audit Information
  auditRequired: boolean;
  confidenceLevel?: number; // 0-100
}

// ============================================================================
// Context & Evaluation Interfaces
// ============================================================================

export interface EvaluationContext {
  subject: SubjectAttributes;
  resource: ResourceAttributes;
  environment: EnvironmentAttributes;
  action: string;
  
  // Metadata
  requestId: string;
  timestamp: Date;
  source: string;
  
  // Additional Context
  customContext?: Record<string, any>;
  
  // Cache Information
  cacheKey?: string;
  cacheable?: boolean;
}

export interface PermissionResult {
  allowed: boolean;
  reason: string;
  obligations?: Obligation[];
  advice?: Advice[];
  
  // Additional Information
  policies?: string[]; // IDs of policies that contributed to decision
  evaluationTime?: number;
  cacheHit?: boolean;
  confidenceLevel?: number;
}

// ============================================================================
// System & Configuration Interfaces
// ============================================================================

export interface PermissionSystemConfig {
  // Combining algorithm for conflicting policies
  defaultCombiningAlgorithm: CombiningAlgorithm;
  
  // Cache settings
  cacheEnabled: boolean;
  cacheTTL: number; // seconds
  
  // Audit settings
  auditEnabled: boolean;
  auditLevel: 'none' | 'errors' | 'decisions' | 'all';
  
  // Performance settings
  evaluationTimeout: number; // milliseconds
  maxPolicyEvaluation: number;
  
  // Security settings
  requireSecureConnection: boolean;
  allowAnonymousAccess: boolean;
  
  // Subscription settings
  subscriptionRequired: boolean;
  defaultSubscriptionLevel: string;
}

// ============================================================================
// Supporting Interfaces (imported from other type files)
// ============================================================================

export interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
  parentRole?: string; // Single parent role (legacy)
  parentRoles?: string[]; // Multiple parent roles for complex hierarchies
  hierarchy: number; // Level in role hierarchy
  isSystem?: boolean; // System-defined role that cannot be deleted
  childRoles?: string[]; // Child roles that inherit from this role
  effectivePermissions?: string[]; // Computed permissions including inherited ones
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'active' | 'inactive';
  parentDepartment?: string;
  costCenter?: string;
  managers?: string[]; // Array of user IDs who are department heads
  assignedUsers?: string[]; // Array of user IDs assigned to this department
  assignedLocations?: string[]; // Array of location IDs assigned to this department
}

export interface Location {
  id: string;
  name: string;
  type: 'hotel' | 'restaurant' | 'warehouse' | 'office' | 'kitchen' | 'store';
  address?: string;
  coordinates?: GeoLocation;
  parentLocation?: string;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
}

export interface Money {
  amount: number;
  currency: string;
}

export interface BudgetScope {
  budgetId: string;
  category: string;
  amount: Money;
  period: string;
}

export interface PermissionDocumentStatus {
  status: string;
  stage: string;
  approvalRequired: boolean;
  nextApprover?: string;
}

// ============================================================================
// Utility Types
// ============================================================================

export type AttributePath = string; // e.g., 'subject.department.name'
export type ResourceAction = string; // e.g., 'purchase_request:approve'
export type PermissionString = `${string}:${string}`; // resourceType:action

// ============================================================================
// Error & Exception Types
// ============================================================================

export interface PermissionError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: Date;
  requestId?: string;
}

export class PermissionEvaluationError extends Error {
  code: string;
  details?: Record<string, any>;
  
  constructor(code: string, message: string, details?: Record<string, any>) {
    super(message);
    this.name = 'PermissionEvaluationError';
    this.code = code;
    this.details = details;
  }
}

// ============================================================================
// Type Guards
// ============================================================================

export function isPolicy(obj: any): obj is Policy {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.priority === 'number' &&
    typeof obj.enabled === 'boolean' &&
    obj.target &&
    Array.isArray(obj.rules) &&
    (obj.effect === 'permit' || obj.effect === 'deny')
  );
}

export function isAccessRequest(obj: any): obj is AccessRequest {
  return (
    obj &&
    typeof obj.userId === 'string' &&
    typeof obj.resourceId === 'string' &&
    typeof obj.action === 'string'
  );
}

export function isPermissionResult(obj: any): obj is PermissionResult {
  return (
    obj &&
    typeof obj.allowed === 'boolean' &&
    typeof obj.reason === 'string'
  );
}