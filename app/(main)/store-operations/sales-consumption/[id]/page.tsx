import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { mockSalesConsumptions, mockSCLines } from '@/lib/mock-data'
import { formatCurrency } from '@/lib/utils/formatters'
import { SCStatusBadge } from '@/app/(main)/store-operations/sales-consumption/components/sc-status-badge'
import { SCExceptionBanner } from '@/app/(main)/store-operations/sales-consumption/components/sc-exception-banner'
import { SCLineTable } from '@/app/(main)/store-operations/sales-consumption/components/sc-line-table'

const POS_EXCEPTIONS_HREF = '/system-administration/system-integration/pos/operate/exceptions'

interface Props {
  params: { id: string }
}

export default function SCDetailPage({ params }: Props) {
  const sc = mockSalesConsumptions.find((s) => s.id === params.id)

  if (!sc) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="py-12 text-center">
            <h2 className="text-lg font-medium">SC Not Found</h2>
            <p className="mt-1 text-muted-foreground">
              The Sales Consumption record you&apos;re looking for doesn&apos;t exist.
            </p>
            <Link
              href="/store-operations/sales-consumption"
              className="mt-4 inline-flex items-center gap-1 text-sm text-primary underline-offset-4 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Sales Consumption
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const lines = mockSCLines.filter((l) => l.scId === sc.id)

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Back link */}
      <Link
        href="/store-operations/sales-consumption"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Sales Consumption
      </Link>

      {/* Page title */}
      <div className="flex items-center gap-3">
        <h1 className="text-2xl font-bold">{sc.docNumber}</h1>
        <SCStatusBadge status={sc.status} />
      </div>

      {/* Header info grid */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="text-muted-foreground">Business Date</div>
              <div className="font-medium">{sc.businessDate}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Shift</div>
              <div className="font-medium">{sc.shiftId}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Location ID</div>
              <div className="font-medium">{sc.locationId}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Posted By</div>
              <div className="font-medium">{sc.postedBy}</div>
            </div>
            <div>
              <div className="text-muted-foreground">Created At</div>
              <div className="font-medium">{new Date(sc.createdAt).toLocaleString('en-GB')}</div>
            </div>
            {sc.voidedAt && (
              <div>
                <div className="text-muted-foreground">Voided At</div>
                <div className="font-medium text-red-600">
                  {new Date(sc.voidedAt).toLocaleString('en-GB')}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary stats */}
      <Card>
        <CardContent className="py-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold">{sc.transactionCount}</div>
              <div className="text-sm text-muted-foreground">Transaction Count</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">{sc.postedLineCount}</div>
              <div className="text-sm text-muted-foreground">Posted Lines</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-amber-600">{sc.pendingLineCount}</div>
              <div className="text-sm text-muted-foreground">Pending Lines</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{formatCurrency(sc.totalCostPosted.amount)}</div>
              <div className="text-sm text-muted-foreground">Cost Posted</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{formatCurrency(sc.totalRevenue.amount)}</div>
              <div className="text-sm text-muted-foreground">Revenue</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exception banner — renders nothing when pendingLineCount === 0 */}
      <SCExceptionBanner
        pendingLineCount={sc.pendingLineCount}
        posExceptionsHref={POS_EXCEPTIONS_HREF}
      />

      {/* Lines table */}
      <SCLineTable lines={lines} />
    </div>
  )
}
