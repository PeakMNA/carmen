'use client'

import React, { useRef, useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  PenLine,
  Eraser,
  CheckCircle2,
  Package,
  User,
  Calendar,
  ClipboardCheck
} from 'lucide-react'
import { formatNumber } from '@/lib/utils/formatters'

interface IssuedItem {
  id: number
  description: string
  qtyIssued: number
  unit: string
}

interface ReceiptSignatureDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requisitionId: string
  requisitionRefNo: string
  requestedBy: string
  items: IssuedItem[]
  onConfirm: (signatureData: string, timestamp: Date) => void
  onCancel: () => void
}

/**
 * Receipt Signature Dialog
 *
 * @description Captures requestor's signature for confirming receipt of issued items.
 * Used in the Issue workflow stage to ensure items are properly handed over.
 *
 * @features
 * - Item summary table showing issued items
 * - Signature canvas with drawing and clear functionality
 * - Requestor name display
 * - Timestamp capture on confirm
 * - Confirm disabled until signature is drawn
 *
 * @workflow
 * 1. Store staff clicks Issue button in Issue stage
 * 2. Dialog opens showing items to be issued
 * 3. Requestor signs on the canvas
 * 4. Store staff clicks Confirm to complete the issue
 * 5. Signature and timestamp are captured with the issue action
 */
export function ReceiptSignatureDialog({
  open,
  onOpenChange,
  requisitionId,
  requisitionRefNo,
  requestedBy,
  items,
  onConfirm,
  onCancel
}: ReceiptSignatureDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)
  const [lastPos, setLastPos] = useState<{ x: number; y: number } | null>(null)

  // Initialize canvas
  useEffect(() => {
    if (open && canvasRef.current) {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      if (ctx) {
        // Set canvas size
        const rect = canvas.getBoundingClientRect()
        canvas.width = rect.width
        canvas.height = rect.height

        // Configure drawing style
        ctx.strokeStyle = '#1f2937'
        ctx.lineWidth = 2
        ctx.lineCap = 'round'
        ctx.lineJoin = 'round'

        // Clear canvas with background
        ctx.fillStyle = '#f9fafb'
        ctx.fillRect(0, 0, canvas.width, canvas.height)

        // Draw signature line
        ctx.strokeStyle = '#e5e7eb'
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(20, canvas.height - 30)
        ctx.lineTo(canvas.width - 20, canvas.height - 30)
        ctx.stroke()

        // Reset stroke style
        ctx.strokeStyle = '#1f2937'
        ctx.lineWidth = 2
      }
    }
  }, [open])

  // Get position from mouse or touch event
  const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return null
    const canvas = canvasRef.current
    const rect = canvas.getBoundingClientRect()

    if ('touches' in e) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      }
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    }
  }

  // Start drawing
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault()
    const pos = getPosition(e)
    if (pos) {
      setIsDrawing(true)
      setLastPos(pos)
    }
  }

  // Draw line
  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !canvasRef.current || !lastPos) return
    e.preventDefault()

    const ctx = canvasRef.current.getContext('2d')
    const pos = getPosition(e)
    if (!ctx || !pos) return

    ctx.beginPath()
    ctx.moveTo(lastPos.x, lastPos.y)
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()

    setLastPos(pos)
    setHasSignature(true)
  }

  // Stop drawing
  const stopDrawing = () => {
    setIsDrawing(false)
    setLastPos(null)
  }

  // Clear signature
  const clearSignature = () => {
    if (!canvasRef.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Clear and redraw background
    ctx.fillStyle = '#f9fafb'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Redraw signature line
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(20, canvas.height - 30)
    ctx.lineTo(canvas.width - 20, canvas.height - 30)
    ctx.stroke()

    // Reset stroke style
    ctx.strokeStyle = '#1f2937'
    ctx.lineWidth = 2

    setHasSignature(false)
  }

  // Handle confirm
  const handleConfirm = () => {
    if (!canvasRef.current || !hasSignature) return

    const signatureData = canvasRef.current.toDataURL('image/png')
    const timestamp = new Date()
    onConfirm(signatureData, timestamp)
  }

  // Handle cancel
  const handleCancel = () => {
    clearSignature()
    onCancel()
  }

  // Calculate totals
  const totalItems = items.length
  const totalQuantity = items.reduce((sum, item) => sum + (item.qtyIssued || 0), 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-green-600" />
            Confirm Receipt of Items
          </DialogTitle>
          <DialogDescription>
            Please review the items below and sign to confirm receipt
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Requisition Info */}
          <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="gap-1">
                <Package className="h-3 w-3" />
                {requisitionRefNo}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <User className="h-3 w-3" />
                <span>{requestedBy}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>{new Date().toLocaleDateString()}</span>
            </div>
          </div>

          {/* Items Summary */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Items to Receive</span>
                <Badge variant="secondary">
                  {totalItems} items | {formatNumber(totalQuantity)} units
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[160px]">
                <table className="w-full">
                  <thead className="bg-muted/50 sticky top-0">
                    <tr>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Item</th>
                      <th className="text-right p-2 text-xs font-medium text-muted-foreground">Qty Issued</th>
                      <th className="text-left p-2 text-xs font-medium text-muted-foreground">Unit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="p-2 text-sm">{item.description}</td>
                        <td className="p-2 text-sm text-right tabular-nums font-medium">
                          {formatNumber(item.qtyIssued || 0)}
                        </td>
                        <td className="p-2 text-sm text-muted-foreground">{item.unit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>

          <Separator />

          {/* Signature Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium">
                <PenLine className="h-4 w-4" />
                Requestor Signature
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSignature}
                className="h-7 text-xs"
              >
                <Eraser className="h-3 w-3 mr-1" />
                Clear
              </Button>
            </div>

            {/* Signature Canvas */}
            <div className="border rounded-lg overflow-hidden bg-gray-50">
              <canvas
                ref={canvasRef}
                className="w-full h-[120px] cursor-crosshair touch-none"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <p className="text-xs text-muted-foreground text-center">
              Draw signature above the line
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!hasSignature}
            className="bg-green-600 hover:bg-green-700"
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Confirm Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
