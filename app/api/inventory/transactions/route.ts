/**
 * Inventory Transactions API Routes
 *
 * API endpoints for recording and querying inventory transactions
 * including stock receipts, issues, adjustments, and transfers.
 *
 * Transaction Code Format: PREFIX-YYMM-NNNN
 * - PREFIX: Document type (PO = Purchase Order, REQ = Requisition, ADJ = Adjustment, etc.)
 * - YY: Two-digit year (e.g., 24 for 2024)
 * - MM: Two-digit month (e.g., 10 for October)
 * - NNNN: Sequential number (e.g., 001, 002, etc.)
 * Example: PO-2410-001 = Purchase Order #001 from October 2024
 */

import { NextRequest, NextResponse } from 'next/server'
import { inventoryService } from '@/lib/services/db/inventory-service'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { z } from 'zod'

// Validation schemas
const createTransactionSchema = z.object({
  itemId: z.string().min(1, 'Item ID is required'),
  locationId: z.string().min(1, 'Location ID is required'),
  transactionType: z.enum([
    'RECEIVE', 'ISSUE', 'TRANSFER_OUT', 'TRANSFER_IN', 
    'ADJUST_UP', 'ADJUST_DOWN', 'COUNT', 'WASTE', 'CONVERSION'
  ]),
  quantity: z.number().positive('Quantity must be positive'),
  unitCost: z.object({
    amount: z.number().min(0, 'Unit cost amount must be non-negative'),
    currency: z.string().length(3, 'Currency code must be 3 characters')
  }),
  transactionDate: z.string().optional(),
  referenceNo: z.string().optional(),
  referenceType: z.string().optional(),
  batchNo: z.string().optional(),
  lotNo: z.string().optional(),
  expiryDate: z.string().optional(),
  notes: z.string().optional()
})

const transactionFiltersSchema = z.object({
  itemId: z.string().optional(),
  locationId: z.string().optional(),
  transactionType: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  referenceNo: z.string().optional(),
  referenceType: z.string().optional(),
  batchNo: z.string().optional(),
  lotNo: z.string().optional(),
  userId: z.string().optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional()
})

/**
 * GET /api/inventory/transactions
 * Get inventory transactions with filtering and pagination
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams.entries())
    
    const validation = transactionFiltersSchema.safeParse(params)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid query parameters',
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    const {
      itemId,
      locationId,
      transactionType,
      dateFrom,
      dateTo,
      referenceNo,
      referenceType,
      batchNo,
      lotNo,
      userId,
      page,
      limit,
      sortBy,
      sortOrder
    } = validation.data

    // Build filters - for this example, we'll use a simplified approach
    // In a real implementation, you'd have a dedicated transaction service
    
    // Mock response for now - would be replaced with actual transaction query
    const mockTransactions = [
      {
        id: 'txn-001',
        transactionId: 'TXN-001',
        itemId: itemId || 'item-001',
        locationId: locationId || 'loc-001',
        transactionType: transactionType || 'RECEIVE',
        quantity: 100,
        unitCost: { amount: 10.50, currency: 'USD' },
        totalCost: { amount: 1050.00, currency: 'USD' },
        balanceAfter: 100,
        transactionDate: new Date('2024-01-15'),
        referenceNo: 'PO-2410-001',
        referenceType: 'PURCHASE_ORDER',
        userId: 'user-001',
        notes: 'Received goods from supplier',
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-01-15'),
        createdBy: 'user-001'
      }
    ]

    const totalCount = 1
    const pageNum = page ? parseInt(page) : 1
    const limitNum = limit ? parseInt(limit) : 50

    return NextResponse.json({
      success: true,
      data: mockTransactions,
      metadata: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum)
      }
    })
  } catch (error) {
    console.error('Error in GET /api/inventory/transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory/transactions
 * Record new inventory transaction
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      )
    }

    const body = await request.json()
    
    const validation = createTransactionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validation.error.issues 
        },
        { status: 400 }
      )
    }

    const {
      itemId,
      locationId,
      transactionType,
      quantity,
      unitCost,
      transactionDate,
      referenceNo,
      referenceType,
      batchNo,
      lotNo,
      expiryDate,
      notes
    } = validation.data

    const input = {
      itemId,
      locationId,
      transactionType: transactionType as any,
      quantity,
      unitCost,
      transactionDate: transactionDate ? new Date(transactionDate) : undefined,
      referenceNo,
      referenceType,
      batchNo,
      lotNo,
      expiryDate: expiryDate ? new Date(expiryDate) : undefined,
      notes,
      userId: session.user.id
    }

    const result = await inventoryService.recordInventoryTransaction(input)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data
    }, { status: 201 })
  } catch (error) {
    console.error('Error in POST /api/inventory/transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}