/**
 * Inventory Audit Service
 * 
 * Handles audit trails, compliance reporting, and comprehensive
 * tracking for all inventory-related activities and changes.
 */

import { prisma, type PrismaClient } from '@/lib/db'
import type {
  InventoryTransaction,
  PhysicalCount,
  InventoryAdjustment,
  StockMovement
} from '@/lib/types/inventory'
import { TransactionType } from '@/lib/types/inventory'
import type { Money } from '@/lib/types/common'

/**
 * Audit log entry types
 */
export enum AuditEventType {
  ITEM_CREATED = 'ITEM_CREATED',
  ITEM_UPDATED = 'ITEM_UPDATED',
  ITEM_DELETED = 'ITEM_DELETED',
  STOCK_RECEIVED = 'STOCK_RECEIVED',
  STOCK_ISSUED = 'STOCK_ISSUED',
  STOCK_ADJUSTED = 'STOCK_ADJUSTED',
  STOCK_TRANSFERRED = 'STOCK_TRANSFERRED',
  COUNT_STARTED = 'COUNT_STARTED',
  COUNT_COMPLETED = 'COUNT_COMPLETED',
  COUNT_FINALIZED = 'COUNT_FINALIZED',
  MOVEMENT_CREATED = 'MOVEMENT_CREATED',
  MOVEMENT_EXECUTED = 'MOVEMENT_EXECUTED',
  ADJUSTMENT_CREATED = 'ADJUSTMENT_CREATED',
  ADJUSTMENT_APPROVED = 'ADJUSTMENT_APPROVED',
  VALUATION_CALCULATED = 'VALUATION_CALCULATED',
  COSTING_METHOD_CHANGED = 'COSTING_METHOD_CHANGED'
}

/**
 * Audit log entry
 */
export interface AuditLogEntry {
  id: string
  eventType: AuditEventType
  entityType: 'inventory_item' | 'stock_balance' | 'transaction' | 'physical_count' | 'adjustment' | 'movement'
  entityId: string
  userId: string
  userName?: string
  timestamp: Date
  changes: Record<string, {
    oldValue: any
    newValue: any
  }>
  metadata: {
    itemId?: string
    itemName?: string
    locationId?: string
    locationName?: string
    transactionType?: TransactionType
    quantity?: number
    value?: Money
    referenceNo?: string
    ipAddress?: string
    userAgent?: string
  }
  description: string
  severity: 'low' | 'medium' | 'high' | 'critical'
}

/**
 * Compliance report
 */
export interface ComplianceReport {
  reportId: string
  reportType: 'inventory_valuation' | 'stock_movements' | 'adjustments' | 'physical_counts' | 'comprehensive'
  periodFrom: Date
  periodTo: Date
  generatedAt: Date
  generatedBy: string
  summary: {
    totalTransactions: number
    totalValue: Money
    itemsTracked: number
    locationsTracked: number
    discrepanciesFound: number
    adjustmentsMade: number
    complianceScore: number
  }
  sections: {
    inventoryValuation: {
      totalValue: Money
      valuationMethod: string
      lastValuationDate: Date
      discrepancies: any[]
    }
    stockMovements: {
      totalMovements: number
      transfersIn: number
      transfersOut: number
      adjustments: number
      unusualActivities: any[]
    }
    physicalCounts: {
      countsPerformed: number
      accuracyRate: number
      varianceValue: Money
      pendingReconciliations: any[]
    }
    auditTrail: {
      totalEvents: number
      criticalEvents: number
      dataIntegrityIssues: any[]
      accessViolations: any[]
    }
  }
  recommendations: string[]
  exceptions: any[]
  attachments: string[]
}

/**
 * Audit trail query filters
 */
export interface AuditTrailFilters {
  eventTypes?: AuditEventType[]
  entityTypes?: string[]
  entityIds?: string[]
  userIds?: string[]
  itemIds?: string[]
  locationIds?: string[]
  dateFrom?: Date
  dateTo?: Date
  severity?: ('low' | 'medium' | 'high' | 'critical')[]
  search?: string
}

/**
 * Service result wrapper
 */
export interface ServiceResult<T> {
  success: boolean
  data?: T
  error?: string
  metadata?: {
    total?: number
    page?: number
    limit?: number
    totalPages?: number
  }
}

/**
 * Pagination options
 */
export interface PaginationOptions {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export class InventoryAuditService {
  private db: any

  constructor(prismaClient?: any) {
    this.db = prismaClient || prisma
  }

  /**
   * Log an audit event
   */
  async logEvent(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): Promise<ServiceResult<AuditLogEntry>> {
    try {
      const auditEntry: AuditLogEntry = {
        ...entry,
        id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date()
      }

      // In a real implementation, you'd save to database
      // For now, we'll return the created entry
      console.log('Audit event logged:', auditEntry)

      return {
        success: true,
        data: auditEntry
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to log audit event: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get audit trail with filtering and pagination
   */
  async getAuditTrail(
    filters: AuditTrailFilters = {},
    pagination: PaginationOptions = {}
  ): Promise<ServiceResult<AuditLogEntry[]>> {
    try {
      const {
        page = 1,
        limit = 50,
        sortBy = 'timestamp',
        sortOrder = 'desc'
      } = pagination

      // Mock audit trail data
      const mockAuditEntries: AuditLogEntry[] = [
        {
          id: 'audit-001',
          eventType: AuditEventType.STOCK_RECEIVED,
          entityType: 'transaction',
          entityId: 'txn-001',
          userId: 'user-001',
          userName: 'John Doe',
          timestamp: new Date('2024-01-15T10:30:00Z'),
          changes: {
            quantity: { oldValue: 0, newValue: 100 },
            stockValue: { oldValue: { amount: 0, currency: 'USD' }, newValue: { amount: 2500, currency: 'USD' } }
          },
          metadata: {
            itemId: 'item-001',
            itemName: 'Raw Material A',
            locationId: 'loc-001',
            locationName: 'Main Warehouse',
            transactionType: TransactionType.RECEIVE,
            quantity: 100,
            value: { amount: 2500, currency: 'USD' },
            referenceNo: 'PO-2410-001',
            ipAddress: '192.168.1.100'
          },
          description: 'Stock received from purchase order PO-2410-001',
          severity: 'medium'
        },
        {
          id: 'audit-002',
          eventType: AuditEventType.STOCK_ADJUSTED,
          entityType: 'adjustment',
          entityId: 'adj-001',
          userId: 'user-002',
          userName: 'Jane Smith',
          timestamp: new Date('2024-01-16T14:15:00Z'),
          changes: {
            quantity: { oldValue: 100, newValue: 95 },
            reason: { oldValue: null, newValue: 'COUNT_VARIANCE' }
          },
          metadata: {
            itemId: 'item-001',
            itemName: 'Raw Material A',
            locationId: 'loc-001',
            locationName: 'Main Warehouse',
            transactionType: TransactionType.ADJUST_DOWN,
            quantity: 5,
            value: { amount: 125, currency: 'USD' },
            referenceNo: 'ADJ-2410-001'
          },
          description: 'Stock adjustment due to physical count variance',
          severity: 'high'
        }
      ]

      // Apply filters (simplified)
      let filteredEntries = mockAuditEntries

      if (filters.eventTypes && filters.eventTypes.length > 0) {
        filteredEntries = filteredEntries.filter(entry => 
          filters.eventTypes!.includes(entry.eventType)
        )
      }

      if (filters.severity && filters.severity.length > 0) {
        filteredEntries = filteredEntries.filter(entry => 
          filters.severity!.includes(entry.severity)
        )
      }

      if (filters.dateFrom) {
        filteredEntries = filteredEntries.filter(entry => 
          entry.timestamp >= filters.dateFrom!
        )
      }

      if (filters.dateTo) {
        filteredEntries = filteredEntries.filter(entry => 
          entry.timestamp <= filters.dateTo!
        )
      }

      if (filters.search) {
        filteredEntries = filteredEntries.filter(entry =>
          entry.description.toLowerCase().includes(filters.search!.toLowerCase()) ||
          entry.metadata.itemName?.toLowerCase().includes(filters.search!.toLowerCase())
        )
      }

      // Apply pagination
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit
      const paginatedEntries = filteredEntries.slice(startIndex, endIndex)

      return {
        success: true,
        data: paginatedEntries,
        metadata: {
          total: filteredEntries.length,
          page,
          limit,
          totalPages: Math.ceil(filteredEntries.length / limit)
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to get audit trail: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Generate compliance report
   */
  async generateComplianceReport(
    reportType: ComplianceReport['reportType'],
    periodFrom: Date,
    periodTo: Date,
    generatedBy: string
  ): Promise<ServiceResult<ComplianceReport>> {
    try {
      const reportId = `compliance-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      
      // Mock compliance report
      const report: ComplianceReport = {
        reportId,
        reportType,
        periodFrom,
        periodTo,
        generatedAt: new Date(),
        generatedBy,
        summary: {
          totalTransactions: 1250,
          totalValue: { amount: 875000.00, currency: 'USD' },
          itemsTracked: 450,
          locationsTracked: 15,
          discrepanciesFound: 8,
          adjustmentsMade: 12,
          complianceScore: 96.5
        },
        sections: {
          inventoryValuation: {
            totalValue: { amount: 875000.00, currency: 'USD' },
            valuationMethod: 'WEIGHTED_AVERAGE',
            lastValuationDate: new Date(),
            discrepancies: []
          },
          stockMovements: {
            totalMovements: 325,
            transfersIn: 165,
            transfersOut: 148,
            adjustments: 12,
            unusualActivities: []
          },
          physicalCounts: {
            countsPerformed: 4,
            accuracyRate: 97.2,
            varianceValue: { amount: 1250.00, currency: 'USD' },
            pendingReconciliations: []
          },
          auditTrail: {
            totalEvents: 2500,
            criticalEvents: 3,
            dataIntegrityIssues: [],
            accessViolations: []
          }
        },
        recommendations: [
          'Consider implementing more frequent cycle counts for high-value items',
          'Review access controls for critical inventory operations',
          'Implement automated alerts for significant stock variances',
          'Enhance vendor performance tracking for better cost control'
        ],
        exceptions: [],
        attachments: []
      }

      return {
        success: true,
        data: report
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to generate compliance report: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Track inventory transaction for audit
   */
  async trackTransaction(transaction: InventoryTransaction, userId: string): Promise<void> {
    try {
      await this.logEvent({
        eventType: this.getTransactionEventType(transaction.transactionType),
        entityType: 'transaction',
        entityId: transaction.id,
        userId,
        changes: {
          quantity: { oldValue: null, newValue: transaction.quantity },
          unitCost: { oldValue: null, newValue: transaction.unitCost },
          balanceAfter: { oldValue: null, newValue: transaction.balanceAfter }
        },
        metadata: {
          itemId: transaction.itemId,
          locationId: transaction.locationId,
          transactionType: transaction.transactionType,
          quantity: transaction.quantity,
          value: transaction.totalCost,
          referenceNo: transaction.referenceNo
        },
        description: `${transaction.transactionType} transaction: ${transaction.quantity} units`,
        severity: this.getTransactionSeverity(transaction.transactionType, transaction.quantity)
      })
    } catch (error) {
      console.error('Failed to track transaction:', error)
    }
  }

  /**
   * Track physical count for audit
   */
  async trackPhysicalCount(count: PhysicalCount, eventType: AuditEventType, userId: string): Promise<void> {
    try {
      await this.logEvent({
        eventType,
        entityType: 'physical_count',
        entityId: count.id,
        userId,
        changes: {
          status: { oldValue: null, newValue: count.status },
          itemsCounted: { oldValue: null, newValue: count.itemsCounted },
          discrepancies: { oldValue: null, newValue: count.discrepanciesFound }
        },
        metadata: {
          locationId: count.locationId,
          quantity: count.totalItems,
          value: count.totalVarianceValue,
          referenceNo: count.countNumber
        },
        description: `Physical count ${eventType.toLowerCase().replace('_', ' ')}: ${count.countNumber}`,
        severity: count.discrepanciesFound > 0 ? 'high' : 'medium'
      })
    } catch (error) {
      console.error('Failed to track physical count:', error)
    }
  }

  /**
   * Track inventory adjustment for audit
   */
  async trackAdjustment(adjustment: InventoryAdjustment, eventType: AuditEventType, userId: string): Promise<void> {
    try {
      await this.logEvent({
        eventType,
        entityType: 'adjustment',
        entityId: adjustment.id,
        userId,
        changes: {
          status: { oldValue: null, newValue: adjustment.status },
          adjustmentType: { oldValue: null, newValue: adjustment.adjustmentType },
          reason: { oldValue: null, newValue: adjustment.reason }
        },
        metadata: {
          locationId: adjustment.locationId,
          quantity: adjustment.totalItems,
          value: adjustment.totalValue,
          referenceNo: adjustment.adjustmentNumber
        },
        description: `Inventory adjustment ${eventType.toLowerCase().replace('_', ' ')}: ${adjustment.adjustmentNumber}`,
        severity: 'high'
      })
    } catch (error) {
      console.error('Failed to track adjustment:', error)
    }
  }

  /**
   * Track stock movement for audit
   */
  async trackStockMovement(movement: StockMovement, eventType: AuditEventType, userId: string): Promise<void> {
    try {
      await this.logEvent({
        eventType,
        entityType: 'movement',
        entityId: movement.id,
        userId,
        changes: {
          status: { oldValue: null, newValue: movement.status },
          movementType: { oldValue: null, newValue: movement.movementType }
        },
        metadata: {
          locationId: movement.fromLocationId,
          quantity: movement.totalItems,
          value: movement.totalValue,
          referenceNo: movement.movementNumber
        },
        description: `Stock movement ${eventType.toLowerCase().replace('_', ' ')}: ${movement.movementNumber}`,
        severity: movement.priority === 'emergency' ? 'critical' : 'medium'
      })
    } catch (error) {
      console.error('Failed to track stock movement:', error)
    }
  }

  /**
   * Validate data integrity
   */
  async validateDataIntegrity(): Promise<ServiceResult<{
    issues: any[]
    summary: {
      totalChecks: number
      passedChecks: number
      failedChecks: number
      warningChecks: number
    }
  }>> {
    try {
      const issues: any[] = []
      const checks = [
        'Stock balance consistency',
        'Transaction balance verification',
        'Cost calculation accuracy',
        'Reference integrity',
        'Date consistency',
        'User access validation'
      ]

      // Mock validation results
      const summary = {
        totalChecks: checks.length,
        passedChecks: 5,
        failedChecks: 0,
        warningChecks: 1
      }

      // Mock warning issue
      if (summary.warningChecks > 0) {
        issues.push({
          type: 'warning',
          check: 'Date consistency',
          description: 'Found 2 transactions with future dates',
          details: 'Transactions TXN-001, TXN-002 have future transaction dates',
          recommendation: 'Review and correct transaction dates'
        })
      }

      return {
        success: true,
        data: {
          issues,
          summary
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Failed to validate data integrity: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Get transaction event type for audit
   */
  private getTransactionEventType(transactionType: TransactionType): AuditEventType {
    const mapping: Record<TransactionType, AuditEventType> = {
      [TransactionType.RECEIVE]: AuditEventType.STOCK_RECEIVED,
      [TransactionType.ISSUE]: AuditEventType.STOCK_ISSUED,
      [TransactionType.TRANSFER_IN]: AuditEventType.STOCK_TRANSFERRED,
      [TransactionType.TRANSFER_OUT]: AuditEventType.STOCK_TRANSFERRED,
      [TransactionType.ADJUST_UP]: AuditEventType.STOCK_ADJUSTED,
      [TransactionType.ADJUST_DOWN]: AuditEventType.STOCK_ADJUSTED,
      [TransactionType.COUNT]: AuditEventType.STOCK_ADJUSTED,
      [TransactionType.WASTE]: AuditEventType.STOCK_ADJUSTED,
      [TransactionType.CONVERSION]: AuditEventType.STOCK_ADJUSTED
    }

    return mapping[transactionType] || AuditEventType.STOCK_ADJUSTED
  }

  /**
   * Get transaction severity for audit
   */
  private getTransactionSeverity(transactionType: TransactionType, quantity: number): 'low' | 'medium' | 'high' | 'critical' {
    if (quantity > 1000) return 'critical'
    if (quantity > 500) return 'high'
    if ([TransactionType.ADJUST_UP, TransactionType.ADJUST_DOWN].includes(transactionType)) return 'high'
    if (quantity > 100) return 'medium'
    return 'low'
  }
}

// Export singleton instance
export const inventoryAuditService = new InventoryAuditService()