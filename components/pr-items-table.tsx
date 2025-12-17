/**
 * Purchase Request Items Table Component
 *
 * Transaction Code Format: PR-YYMM-NNNN
 * - PR: Purchase Request prefix
 * - YY: Two-digit year (e.g., 24 for 2024)
 * - MM: Two-digit month (e.g., 10 for October)
 * - NNNN: Sequential number (e.g., 001, 002, etc.)
 * Example: PR-2410-001 = Purchase Request #001 from October 2024
 */

"use client";

import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ItemDetailsEditForm } from "@/app/(main)/procurement/purchase-requests/components/item-details-edit-form";
import { useUser } from "@/lib/context/user-context";

// Mock data with transaction codes using format: PR-YYMM-NNNN
const mockRelatedPRItems = [
  {
    id: 'PR001',
    prNumber: 'PR-2410-001',
    department: 'Human Resources',
    requestedQuantity: 10,
    approvedQuantity: 8,
    unit: 'pcs',
    requestDate: '2024-09-15',
    jobCode: 'HR-001',
    status: 'Pending',
    location: 'Main Office',
    name: 'Office Chair',
    description: 'Ergonomic office chair',
    deliveryDate: new Date(),
    deliveryPoint: 'Main Office',
    currency: 'USD',
    price: 150,
  },
  {
    id: 'PR002',
    prNumber: 'PR-2410-002',
    department: 'IT',
    requestedQuantity: 20,
    approvedQuantity: 20,
    unit: 'pcs',
    requestDate: '2024-09-16',
    jobCode: 'IT-003',
    status: 'Approved',
    location: 'Data Center',
    name: 'Server Rack',
    description: '42U Server Rack',
    deliveryDate: new Date(),
    deliveryPoint: 'Data Center',
    currency: 'USD',
    price: 800,
  },
];

export function PrItemsTable() {
  const { user } = useUser();
  const [items, setItems] = useState(mockRelatedPRItems);
  const [editMode, setEditMode] = useState(false);
  const [isAddItemDialogOpen, setIsAddItemDialogOpen] = useState(false);
  const [isEditItemDialogOpen, setIsEditItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const userRole = user?.role;

  const isRequestor = userRole === 'Staff';
  const isApprover = userRole === 'Department Manager' || userRole === 'Financial Manager';
  const isPurchaser = userRole === 'Purchasing Staff';

  const handleQuantityChange = (id: string, newQuantity: number) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, approvedQuantity: newQuantity } : item
    );
    setItems(updatedItems);
  };

  const handleUnitChange = (id: string, newUnit: string) => {
    const updatedItems = items.map((item) =>
      item.id === id ? { ...item, unit: newUnit } : item
    );
    setItems(updatedItems);
  };

  const handleAddItem = (newItem: any) => {
    setItems([...items, { ...newItem, id: `PR${items.length + 1}` }]);
    setIsAddItemDialogOpen(false);
  };

  const handleEditItem = (updatedItem: any) => {
    const updatedItems = items.map((item) =>
      item.id === updatedItem.id ? updatedItem : item
    );
    setItems(updatedItems);
    setIsEditItemDialogOpen(false);
  };
  
  const openEditDialog = (item: any) => {
    setSelectedItem(item);
    setIsEditItemDialogOpen(true);
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Related Requests</h2>
        <div>
          {(isRequestor || isPurchaser) && (
            <Button onClick={() => setIsAddItemDialogOpen(true)}>Add Item</Button>
          )}
          {(isApprover || isPurchaser) && (
            <Button onClick={() => {
              if (editMode) {
                // Save logic here
              }
              setEditMode(!editMode);
            }} className="ml-2">
              {editMode ? "Save" : "Edit"}
            </Button>
          )}
        </div>
      </div>
      <div className="bg-muted p-4 rounded-lg mb-6">
        <h3 className="text-xl font-semibold mb-2">Office Chair</h3>
        <p className="text-muted-foreground">Ergonomic office chair with lumbar support</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 border-b-2 border-muted">
            <TableHead className="font-semibold text-left">PR Number</TableHead>
            <TableHead className="font-semibold text-left">Department</TableHead>
            <TableHead className="font-semibold text-center">Requested Qty</TableHead>
            <TableHead className="font-semibold text-center">Approved Qty</TableHead>
            <TableHead className="font-semibold text-center">Unit</TableHead>
            <TableHead className="font-semibold text-left">Request Date</TableHead>
            <TableHead className="font-semibold text-left">Job Code</TableHead>
            {(isPurchaser) && <TableHead className="font-semibold text-center">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} className="hover:bg-muted/30 transition-colors border-b">
              <TableCell className="font-medium py-3">{item.prNumber}</TableCell>
              <TableCell className="py-3">{item.department}</TableCell>
              <TableCell className="text-center py-3">{item.requestedQuantity}</TableCell>
              <TableCell className="text-center py-3">
                {editMode && isApprover ? (
                  <Input
                    type="number"
                    value={item.approvedQuantity}
                    onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value))}
                    className="w-24 text-center"
                  />
                ) : (
                  item.approvedQuantity
                )}
              </TableCell>
              <TableCell className="text-center py-3">
                {editMode && isApprover ? (
                  <Input
                    type="text"
                    value={item.unit}
                    onChange={(e) => handleUnitChange(item.id, e.target.value)}
                    className="w-24 text-center"
                  />
                ) : (
                  item.unit
                )}
              </TableCell>
              <TableCell className="py-3">{item.requestDate}</TableCell>
              <TableCell className="py-3">{item.jobCode}</TableCell>
              {(isPurchaser) && (
                <TableCell className="text-center py-3">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(item)} className="hover:bg-muted/60">
                    Edit
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={isAddItemDialogOpen} onOpenChange={setIsAddItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Item</DialogTitle>
          </DialogHeader>
          <ItemDetailsEditForm
            onSave={handleAddItem}
            onCancel={() => setIsAddItemDialogOpen(false)}
            mode="add"
            onModeChange={() => {}}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isEditItemDialogOpen} onOpenChange={setIsEditItemDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item</DialogTitle>
          </DialogHeader>
          <ItemDetailsEditForm
            initialData={selectedItem || undefined}
            onSave={handleEditItem}
            onCancel={() => setIsEditItemDialogOpen(false)}
            mode="edit"
            onModeChange={() => {}}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
