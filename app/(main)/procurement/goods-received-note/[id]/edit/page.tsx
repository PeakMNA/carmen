'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GoodsReceiveNoteDetail, GRNDetailMode } from '@/app/(main)/procurement/goods-received-note/components/GoodsReceiveNoteDetail'
import { GoodsReceiveNote } from '@/lib/types'
import { mockGoodsReceiveNotes } from '@/lib/mock-data'

export default function EditGoodsReceiveNote({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [mode, setMode] = useState<GRNDetailMode>('edit')
  const [loading, setLoading] = useState(true)
  const [grnData, setGrnData] = useState<GoodsReceiveNote | null>(null)

  useEffect(() => {
    // In a real application, you would fetch the GRN data from an API
    // For this example, we'll use the sample data
    const grn = mockGoodsReceiveNotes.find(grn => grn.id === params.id)
    if (grn) {
      setGrnData(grn)
    } else {
      // Handle case where GRN is not found
      console.error('GRN not found')
      router.push('/procurement/goods-received-note')
    }
    setLoading(false)
  }, [params.id, router])

  const handleModeChange = (newMode: GRNDetailMode) => {
    if (newMode === 'view') {
      // Navigate back to the view page, ensuring mode=view is in the URL
      router.push(`/procurement/goods-received-note/${params.id}?mode=view`)
    } else if (newMode === 'edit' || newMode === 'add') {
      // Only set local state if the new mode is compatible with
      setMode(newMode)
    }
    // 'confirm' mode doesn't directly change the local 'mode' state here
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (!grnData) {
    return <div>GRN not found</div>
  }

  return (
    <div className="p-6">
      <GoodsReceiveNoteDetail 
        id={params.id} 
        mode={mode} 
        onModeChange={handleModeChange}
        initialData={grnData}
      />
    </div>
  )
}