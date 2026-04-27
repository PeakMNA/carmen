import { Card } from '@/components/ui/card'
import { StoreRequisitionDetailComponent } from '../components/store-requisition-detail'

interface StoreRequisitionDetailPageProps {
  params: {
    id: string
  }
}

export default function StoreRequisitionDetailPage({ params }: StoreRequisitionDetailPageProps) {
  return (
    <div className="px-6 py-6">
      <StoreRequisitionDetailComponent id={params.id} />
    </div>
  )
} 