import { useState } from "react"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { FileDown } from "lucide-react"
import { StockCardData } from "../types"
import { formatCurrency, formatNumber } from "../../inventory-balance/utils"

interface StockCardValuationProps {
  data: StockCardData
}

export function StockCardValuation({ data }: StockCardValuationProps) {
  const { product, valuation } = data
  
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  
  // Pagination
  const totalPages = Math.ceil(valuation.length / itemsPerPage)
  const paginatedRecords = valuation.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  
  // Get transaction type badge - only IN and OUT are valid types
  const getTransactionTypeBadge = (type: string) => {
    switch (type) {
      case 'IN':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">In</Badge>
      case 'OUT':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Out</Badge>
      default:
        return null
    }
  }
  
  // Format quantity with color
  const formatQuantityWithColor = (quantity: number) => {
    if (quantity > 0) {
      return <span className="text-green-600">+{formatNumber(quantity)}</span>
    } else if (quantity < 0) {
      return <span className="text-red-600">{formatNumber(quantity)}</span>
    } else {
      return <span>{formatNumber(quantity)}</span>
    }
  }
  
  // Format value with color
  const formatValueWithColor = (value: number) => {
    if (value > 0) {
      return <span className="text-green-600">+{formatCurrency(value)}</span>
    } else if (value < 0) {
      return <span className="text-red-600">{formatCurrency(value)}</span>
    } else {
      return <span>{formatCurrency(value)}</span>
    }
  }
  
  // Calculate summary - only IN and OUT transaction types
  const summary = {
    currentStock: valuation.length > 0 ? valuation[valuation.length - 1].runningQuantity : 0,
    currentValue: valuation.length > 0 ? valuation[valuation.length - 1].runningValue : 0,
    averageCost: valuation.length > 0 ? valuation[valuation.length - 1].runningAverageCost : 0,
    totalIn: valuation
      .filter(v => v.transactionType === "IN")
      .reduce((sum, v) => sum + v.quantity, 0),
    totalOut: Math.abs(valuation
      .filter(v => v.transactionType === "OUT")
      .reduce((sum, v) => sum + v.quantity, 0))
  }
  
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Current Value</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.currentValue)}</p>
              <p className="text-xs text-muted-foreground">
                {formatNumber(summary.currentStock)} {product.unit}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm text-muted-foreground">Average Cost</p>
              <p className="text-2xl font-bold">{formatCurrency(summary.averageCost)}</p>
              <p className="text-xs text-muted-foreground">
                Per {product.unit}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex justify-end">
        <Button variant="outline">
          <FileDown className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>
      
      {/* Valuation Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/75">
                <TableHead className="py-3 font-medium text-gray-600">Date</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Reference</TableHead>
                <TableHead className="py-3 font-medium text-gray-600">Type</TableHead>
                <TableHead className="py-3 font-medium text-gray-600 text-right">Quantity</TableHead>
                <TableHead className="py-3 font-medium text-gray-600 text-right">Unit Cost</TableHead>
                <TableHead className="py-3 font-medium text-gray-600 text-right">Value</TableHead>
                <TableHead className="py-3 font-medium text-gray-600 text-right">Running Qty</TableHead>
                <TableHead className="py-3 font-medium text-gray-600 text-right">Running Value</TableHead>
                <TableHead className="py-3 font-medium text-gray-600 text-right">Avg Cost</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No valuation records found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRecords.map((record, index) => (
                  <TableRow key={index} className="hover:bg-gray-50/50">
                    <TableCell>{record.date}</TableCell>
                    <TableCell>{record.reference}</TableCell>
                    <TableCell>{getTransactionTypeBadge(record.transactionType)}</TableCell>
                    <TableCell className="text-right">
                      {formatQuantityWithColor(record.quantity)}
                    </TableCell>
                    <TableCell className="text-right">{formatCurrency(record.unitCost)}</TableCell>
                    <TableCell className="text-right">
                      {formatValueWithColor(record.value)}
                    </TableCell>
                    <TableCell className="text-right">{formatNumber(record.runningQuantity)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(record.runningValue)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(record.runningAverageCost)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  )
} 