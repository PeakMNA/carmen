/**
 * ============================================================================
 * TRANSACTION CATEGORY DETAIL PAGE
 * ============================================================================
 *
 * Displays detailed view of a transaction category including:
 * - Category information (code, name, type, GL account, status)
 * - List of associated reasons with management actions
 *
 * URL: /inventory-management/transaction-categories/:id
 *
 * ============================================================================
 */

'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Pencil,
  Trash2,
  PlusIcon,
  ArrowUpCircle,
  ArrowDownCircle,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ReasonList } from "../components/reason-list"
import { ReasonDialog } from "../components/reason-dialog"
import {
  getCategoryById,
  getReasonsByCategoryId,
} from "@/lib/mock-data/transaction-categories"
import type { TransactionReason } from "@/lib/types/transaction-category"

interface CategoryDetailPageProps {
  params: { id: string }
}

export default function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const router = useRouter()
  const { id } = params

  // Dialog states
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showReasonDialog, setShowReasonDialog] = useState(false)
  const [editingReason, setEditingReason] = useState<TransactionReason | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // TODO: Replace with API calls
  const category = getCategoryById(id)
  const reasons = getReasonsByCategoryId(id)

  // Handle category not found
  if (!category) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <h1 className="text-2xl font-semibold">Category Not Found</h1>
        <p className="text-muted-foreground">
          The category you are looking for does not exist.
        </p>
        <button
          onClick={() => router.push("/inventory-management/transaction-categories")}
          className="text-primary hover:underline"
        >
          Return to Categories List
        </button>
      </div>
    )
  }

  // Event handlers
  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      // TODO: Replace with actual API call
      console.log("Deleting category:", id)
      // await deleteCategory(id)
      await new Promise(resolve => setTimeout(resolve, 1000))
      router.push("/inventory-management/transaction-categories")
    } catch (error) {
      console.error("Error deleting category:", error)
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  const handleAddReason = () => {
    setEditingReason(null)
    setShowReasonDialog(true)
  }

  const handleEditReason = (reason: TransactionReason) => {
    setEditingReason(reason)
    setShowReasonDialog(true)
  }

  const handleSaveReason = async (data: any) => {
    if (editingReason) {
      // TODO: Update existing reason
      console.log("Updating reason:", editingReason.id, data)
    } else {
      // TODO: Create new reason
      console.log("Creating new reason for category:", id, data)
    }
    setShowReasonDialog(false)
    setEditingReason(null)
  }

  const handleDeleteReason = async (reasonId: string) => {
    // TODO: Replace with actual API call
    console.log("Deleting reason:", reasonId)
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.push("/inventory-management/transaction-categories")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold">{category.name}</h1>
                <Badge
                  variant={category.type === "OUT" ? "destructive" : "default"}
                  className={category.type === "IN" ? "bg-green-100 text-green-800" : ""}
                >
                  {category.type === "OUT" ? (
                    <ArrowDownCircle className="h-3 w-3 mr-1" />
                  ) : (
                    <ArrowUpCircle className="h-3 w-3 mr-1" />
                  )}
                  Stock {category.type}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground font-mono">
                {category.code}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => router.push(`/inventory-management/transaction-categories/${id}/edit`)}
            >
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-6 max-w-5xl mx-auto w-full">
        {/* Category Details Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Code</p>
                <p className="font-mono font-medium">{category.code}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-medium">{category.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <Badge
                  variant={category.type === "OUT" ? "destructive" : "default"}
                  className={category.type === "IN" ? "bg-green-100 text-green-800" : ""}
                >
                  Stock {category.type}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <Badge variant={category.isActive ? "default" : "secondary"}>
                  {category.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">GL Account</p>
                <p className="font-medium">
                  <span className="font-mono">{category.glAccountCode}</span>
                  {" - "}
                  {category.glAccountName}
                </p>
              </div>
              {category.description && (
                <div className="col-span-2">
                  <p className="text-sm text-muted-foreground">Description</p>
                  <p className="text-sm">{category.description}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Reasons List Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">
              Reasons ({reasons.length})
            </CardTitle>
            <Button onClick={handleAddReason}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Reason
            </Button>
          </CardHeader>
          <CardContent>
            <ReasonList
              reasons={reasons}
              onEdit={handleEditReason}
              onDelete={handleDeleteReason}
            />
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category?</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{category.name}&quot;? This will also
              delete all {reasons.length} associated reasons. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reason Add/Edit Dialog */}
      <ReasonDialog
        open={showReasonDialog}
        onOpenChange={setShowReasonDialog}
        reason={editingReason}
        categoryId={id}
        onSave={handleSaveReason}
      />
    </div>
  )
}
