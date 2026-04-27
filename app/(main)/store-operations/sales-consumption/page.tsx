import { ShoppingCart, AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { mockSalesConsumptions } from '@/lib/mock-data'
import { SCList } from './components/sc-list'

export default function SalesConsumptionPage() {
  const total = mockSalesConsumptions.length
  const posted = mockSalesConsumptions.filter(
    (sc) => sc.status === 'posted' || sc.status === 'posted_with_exceptions'
  ).length
  const blocked = mockSalesConsumptions.filter((sc) => sc.status === 'blocked').length
  const pendingLines = mockSalesConsumptions.reduce((sum, sc) => sum + sc.pendingLineCount, 0)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <ShoppingCart className="h-6 w-6 text-primary" />
          Sales Consumption
        </h1>
        <p className="text-muted-foreground mt-1">
          System-generated consumption records from POS transactions. Read-only.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-muted-foreground">Total SCs</p>
            <p className="text-2xl font-bold mt-1">{total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-muted-foreground">Posted</p>
            <p className="text-2xl font-bold mt-1 text-green-700">{posted}</p>
          </CardContent>
        </Card>

        <Card className={blocked > 0 ? 'border-destructive' : undefined}>
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-muted-foreground">Blocked</p>
            <p className={`text-2xl font-bold mt-1 ${blocked > 0 ? 'text-destructive' : ''}`}>
              {blocked}
            </p>
          </CardContent>
        </Card>

        <Card className={pendingLines > 0 ? 'border-amber-400' : undefined}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">Pending Lines</p>
              {pendingLines > 0 && <AlertTriangle className="h-4 w-4 text-amber-500" />}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className={`text-2xl font-bold ${pendingLines > 0 ? 'text-amber-700' : ''}`}>
                {pendingLines}
              </p>
              {pendingLines > 0 && (
                <Badge variant="destructive" className="text-xs">
                  Action needed
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <SCList scs={mockSalesConsumptions} />
    </div>
  )
}
