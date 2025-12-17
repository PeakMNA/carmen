/**
 * ============================================================================
 * REASON LIST COMPONENT
 * ============================================================================
 *
 * Displays a table of transaction reasons within a category.
 * Used on the category detail page to manage reasons.
 *
 * FEATURES:
 * - Table view with code, name, description, status
 * - Status toggle (inline)
 * - Edit and delete actions
 * - Empty state
 *
 * ============================================================================
 */

'use client'

import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { MoreHorizontalIcon, Pencil, Trash2 } from "lucide-react"
import type { TransactionReason } from "@/lib/types/transaction-category"

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface ReasonListProps {
  /** List of reasons to display */
  reasons: TransactionReason[]
  /** Called when edit action is clicked */
  onEdit?: (reason: TransactionReason) => void
  /** Called when delete action is confirmed */
  onDelete?: (reasonId: string) => void
  /** Called when status is toggled */
  onStatusChange?: (reasonId: string, isActive: boolean) => void
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function ReasonList({
  reasons,
  onEdit,
  onDelete,
  onStatusChange,
}: ReasonListProps) {
  const [deleteReason, setDeleteReason] = useState<TransactionReason | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Sort reasons by sortOrder
  const sortedReasons = [...reasons].sort((a, b) => a.sortOrder - b.sortOrder)

  const handleDelete = async () => {
    if (!deleteReason) return

    setIsDeleting(true)
    try {
      await onDelete?.(deleteReason.id)
    } finally {
      setIsDeleting(false)
      setDeleteReason(null)
    }
  }

  const handleStatusToggle = (reason: TransactionReason) => {
    onStatusChange?.(reason.id, !reason.isActive)
  }

  // Empty state
  if (reasons.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No reasons defined for this category.</p>
        <p className="text-sm mt-1">Click &quot;Add Reason&quot; to create one.</p>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Code</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="w-[100px]">Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedReasons.map((reason) => (
              <TableRow key={reason.id}>
                <TableCell className="font-mono font-medium">
                  {reason.code}
                </TableCell>
                <TableCell>
                  <span className="font-medium">{reason.name}</span>
                  {/* Show description on mobile */}
                  {reason.description && (
                    <p className="text-xs text-muted-foreground md:hidden truncate max-w-[200px]">
                      {reason.description}
                    </p>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm text-muted-foreground truncate max-w-[300px] block">
                    {reason.description || "-"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={reason.isActive}
                      onCheckedChange={() => handleStatusToggle(reason)}
                      aria-label={`Toggle ${reason.name} status`}
                    />
                    <span className="text-xs text-muted-foreground sr-only sm:not-sr-only">
                      {reason.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontalIcon className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit?.(reason)}>
                        <Pencil className="h-4 w-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteReason(reason)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteReason} onOpenChange={() => setDeleteReason(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Reason?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteReason?.name}&quot;?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteReason(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Reason"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
