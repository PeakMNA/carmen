/**
 * Generated Documents Tab Component
 *
 * Displays documents generated from a Store Requisition approval.
 *
 * SUPPORTED DOCUMENT TYPES:
 * - Stock Transfer (ST): Moves stock between inventory locations
 * - Stock Issue (SI): Issues stock to expense/direct locations
 *
 * NOTE: Purchase Request (PR) document type was removed from Store Requisitions.
 * PR generation is now exclusively handled via Stock Replenishment module.
 * The summary, flow diagram, and document type legend only show ST and SI.
 */
'use client'

import React from 'react'
import Link from 'next/link'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  ExternalLink,
  Truck,
  Package,
  FileText,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { GeneratedDocumentType, GeneratedDocumentReference } from '@/lib/types/store-requisition'
import { formatCurrency, formatNumber } from '@/lib/utils/formatters'
import { cn } from '@/lib/utils'

interface GeneratedDocumentsTabProps {
  requisitionId: string
  refNo: string
  generatedDocuments: GeneratedDocumentReference[]
  status: string
}

// Status badge styling
const getStatusBadgeClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'completed':
    case 'received':
    case 'issued':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'pending':
    case 'draft':
      return 'bg-gray-100 text-gray-800 border-gray-200'
    case 'in_progress':
    case 'processing':
    case 'shipped':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'cancelled':
    case 'rejected':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

// Document type icon
// NOTE: PURCHASE_REQUEST case was removed - PR workflow moved to Stock Replenishment
const getDocumentIcon = (type: GeneratedDocumentType) => {
  switch (type) {
    case GeneratedDocumentType.STOCK_TRANSFER:
      return <Truck className="h-4 w-4 text-blue-600" />
    case GeneratedDocumentType.STOCK_ISSUE:
      return <Package className="h-4 w-4 text-purple-600" />
    default:
      return <FileText className="h-4 w-4 text-gray-600" />
  }
}

// Document type label
// NOTE: PURCHASE_REQUEST case was removed - PR workflow moved to Stock Replenishment
const getDocumentTypeLabel = (type: GeneratedDocumentType): string => {
  switch (type) {
    case GeneratedDocumentType.STOCK_TRANSFER:
      return 'Stock Transfer'
    case GeneratedDocumentType.STOCK_ISSUE:
      return 'Stock Issue'
    default:
      return 'Unknown'
  }
}

// Document type badge color
// NOTE: PURCHASE_REQUEST case was removed - PR workflow moved to Stock Replenishment
const getDocumentTypeBadgeClass = (type: GeneratedDocumentType): string => {
  switch (type) {
    case GeneratedDocumentType.STOCK_TRANSFER:
      return 'bg-blue-50 text-blue-700 border-blue-200'
    case GeneratedDocumentType.STOCK_ISSUE:
      return 'bg-purple-50 text-purple-700 border-purple-200'
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200'
  }
}

export function GeneratedDocumentsTab({
  requisitionId,
  refNo,
  generatedDocuments,
  status
}: GeneratedDocumentsTabProps) {
  // Group documents by type
  const stockTransfers = generatedDocuments.filter(d => d.documentType === GeneratedDocumentType.STOCK_TRANSFER)
  const stockIssues = generatedDocuments.filter(d => d.documentType === GeneratedDocumentType.STOCK_ISSUE)

  // Calculate summary
  const summary = {
    total: generatedDocuments.length,
    stockTransfers: stockTransfers.length,
    stockIssues: stockIssues.length,
    completed: generatedDocuments.filter(d =>
      ['completed', 'received', 'issued'].includes(d.status.toLowerCase())
    ).length,
    pending: generatedDocuments.filter(d =>
      ['pending', 'draft', 'submitted'].includes(d.status.toLowerCase())
    ).length,
    inProgress: generatedDocuments.filter(d =>
      ['in_progress', 'processing', 'shipped'].includes(d.status.toLowerCase())
    ).length
  }

  const isApproved = ['approved', 'processing', 'processed', 'completed', 'partial_complete'].includes(status.toLowerCase())

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-medium">Generated Documents</h2>
          <Badge variant="outline" className="bg-blue-50 text-blue-700">
            {refNo}
          </Badge>
        </div>
      </div>

      {/* Document Generation Status */}
      {!isApproved && (
        <div className="p-4 rounded-lg border border-amber-200 bg-amber-50">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">Awaiting Approval</p>
              <p className="text-sm text-amber-600">
                Documents will be generated once the requisition is approved.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary Cards */}
      {generatedDocuments.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border bg-gray-50">
            <div className="text-2xl font-bold text-gray-900">{summary.total}</div>
            <div className="text-sm text-gray-500">Total Documents</div>
          </div>
          <div className="p-4 rounded-lg border bg-green-50 border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <div className="text-2xl font-bold text-green-700">{summary.completed}</div>
            </div>
            <div className="text-sm text-green-600">Completed</div>
          </div>
          <div className="p-4 rounded-lg border bg-blue-50 border-blue-200">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div className="text-2xl font-bold text-blue-700">{summary.inProgress}</div>
            </div>
            <div className="text-sm text-blue-600">In Progress</div>
          </div>
          <div className="p-4 rounded-lg border bg-gray-50">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-gray-500" />
              <div className="text-2xl font-bold text-gray-700">{summary.pending}</div>
            </div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
        </div>
      )}

      {/* Document Flow Diagram */}
      {generatedDocuments.length > 0 && (
        <div className="flex items-center justify-center gap-2 py-4 px-6 bg-gray-50 rounded-lg">
          <Badge variant="outline" className="bg-white">
            <FileText className="h-3 w-3 mr-1" />
            {refNo}
          </Badge>
          <ArrowRight className="h-4 w-4 text-gray-400" />
          {summary.stockTransfers > 0 && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Truck className="h-3 w-3 mr-1" />
              {summary.stockTransfers} ST
            </Badge>
          )}
          {summary.stockIssues > 0 && (
            <>
              {summary.stockTransfers > 0 && <span className="text-gray-400">+</span>}
              <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                <Package className="h-3 w-3 mr-1" />
                {summary.stockIssues} SI
              </Badge>
            </>
          )}
        </div>
      )}

      {/* Documents Table */}
      {generatedDocuments.length > 0 ? (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="w-[150px]">Document Type</TableHead>
                <TableHead className="w-[150px]">Reference</TableHead>
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead className="text-center w-[100px]">Items</TableHead>
                <TableHead className="text-right w-[120px]">Quantity</TableHead>
                <TableHead className="text-right w-[140px]">Value</TableHead>
                <TableHead className="w-[150px]">Created</TableHead>
                <TableHead className="w-[100px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {generatedDocuments.map((doc) => (
                <TableRow key={doc.id} className="hover:bg-muted/30">
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getDocumentIcon(doc.documentType)}
                      <Badge
                        variant="outline"
                        className={cn("border", getDocumentTypeBadgeClass(doc.documentType))}
                      >
                        {getDocumentTypeLabel(doc.documentType)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {doc.refNo}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={cn("border capitalize", getStatusBadgeClass(doc.status))}
                    >
                      {doc.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    {doc.lineItemIds.length}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatNumber(doc.totalQuantity)}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(doc.totalValue.amount)}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {doc.createdAt.toLocaleDateString('en-GB')}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={
                        doc.documentType === GeneratedDocumentType.STOCK_TRANSFER
                          ? `/store-operations/stock-transfers/${doc.documentId}`
                          : doc.documentType === GeneratedDocumentType.STOCK_ISSUE
                            ? `/store-operations/stock-issues/${doc.documentId}`
                            : `/procurement/purchase-requests/${doc.documentId}`
                      }
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-12 border rounded-lg bg-gray-50">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-gray-500 font-medium">No documents generated yet</p>
          <p className="text-sm text-gray-400 mt-1">
            {isApproved
              ? 'Documents will be generated when the requisition is processed.'
              : 'Documents will be generated after approval.'}
          </p>
        </div>
      )}

      {/* Document Type Legend */}
      <div className="p-4 bg-gray-50 rounded-lg border">
        <h4 className="text-sm font-medium mb-3">Document Types</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <Truck className="h-4 w-4 text-blue-600 mt-0.5" />
            <div>
              <p className="font-medium text-blue-800">Stock Transfer (ST)</p>
              <p className="text-gray-500">Moves stock between inventory locations</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Package className="h-4 w-4 text-purple-600 mt-0.5" />
            <div>
              <p className="font-medium text-purple-800">Stock Issue (SI)</p>
              <p className="text-gray-500">Issues stock to expense/direct locations</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
