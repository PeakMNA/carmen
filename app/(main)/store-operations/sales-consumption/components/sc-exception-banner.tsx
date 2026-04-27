import Link from 'next/link'
import { AlertTriangle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SCExceptionBannerProps {
  pendingLineCount: number
  posExceptionsHref: string
}

export function SCExceptionBanner({ pendingLineCount, posExceptionsHref }: SCExceptionBannerProps) {
  if (pendingLineCount === 0) return null

  return (
    <Card className="border-amber-300 bg-amber-50">
      <CardContent className="p-4 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            This SC has{' '}
            <span className="font-semibold">{pendingLineCount}</span> pending exception line(s).
            Resolve them in POS Integration → Operate → Exceptions.
          </p>
        </div>
        <Button asChild variant="outline" size="sm" className="border-amber-400 text-amber-800 hover:bg-amber-100 shrink-0">
          <Link href={posExceptionsHref}>Go to Exception Queue →</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
