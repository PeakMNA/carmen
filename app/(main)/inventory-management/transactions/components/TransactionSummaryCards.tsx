"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Activity, ArrowDownRight, ArrowUpRight, TrendingUp, TrendingDown, Scale } from "lucide-react"
import { TransactionSummary } from "../types"

interface TransactionSummaryCardsProps {
  summary: TransactionSummary
  isLoading?: boolean
}

export function TransactionSummaryCards({ summary, isLoading }: TransactionSummaryCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value)
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('en-US').format(value)
  }

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-24 mb-2" />
                <div className="h-8 bg-muted rounded w-32 mb-1" />
                <div className="h-3 bg-muted rounded w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const netIsPositive = summary.netValueChange >= 0

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {/* Total Transactions */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Transactions</p>
              <p className="text-2xl font-bold">{formatNumber(summary.totalTransactions)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {summary.adjustmentCount} adjustments
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total In Value */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Inbound</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalInValue)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatNumber(summary.totalInQuantity)} units received
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
              <ArrowDownRight className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Total Out Value */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Outbound</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(summary.totalOutValue)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatNumber(summary.totalOutQuantity)} units issued
              </p>
            </div>
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <ArrowUpRight className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Net Change */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Net Change</p>
              <p className={`text-2xl font-bold ${netIsPositive ? 'text-green-600' : 'text-red-600'}`}>
                {netIsPositive ? '+' : ''}{formatCurrency(summary.netValueChange)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {netIsPositive ? '+' : ''}{formatNumber(summary.netQuantityChange)} units net
              </p>
            </div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center ${netIsPositive ? 'bg-green-100' : 'bg-red-100'}`}>
              {netIsPositive ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
