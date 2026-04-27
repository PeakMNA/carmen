import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { SCStatus } from '@/lib/types/sales-consumption'

interface SCStatusBadgeProps {
  status: SCStatus
}

export function SCStatusBadge({ status }: SCStatusBadgeProps) {
  switch (status) {
    case 'draft':
      return <Badge variant="outline">Draft</Badge>
    case 'posted':
      return (
        <Badge className={cn('border-transparent bg-green-600 text-white hover:bg-green-700')}>
          Posted
        </Badge>
      )
    case 'posted_with_exceptions':
      return (
        <Badge variant="outline" className="border-amber-500 text-amber-700">
          Posted with Exceptions
        </Badge>
      )
    case 'blocked':
      return <Badge variant="destructive">Blocked</Badge>
    case 'voided':
      return <Badge variant="outline" className="text-muted-foreground">Voided</Badge>
  }
}
