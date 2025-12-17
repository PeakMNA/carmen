import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { GoodsReceiveNote, GRNStatus } from '@/lib/types';
import StatusBadge from '@/components/ui/custom-status-badge';

interface GoodsReceiveNoteTabProps {
  poData: {
    id: string;
    ref: string;
    date: Date;
    status: GRNStatus;
    orderedQuantity: number;
    receivedQuantity: number;
    remarks: string;
    unit: string;
  }
}

interface GoodsReceiveNoteItem {
  id: string;
  ref: string;
  date: Date;
  status: GRNStatus;
  receivedQuantity: number;
  remarks: string;
  unit: string;
}

// Mock items received
const mockItemsReceived: GoodsReceiveNoteItem[] = [
  {
    id: "GRN001",
    ref: "GRN-2310-001",
    date: new Date("2023-05-15"),
    status: GRNStatus.RECEIVED,
    receivedQuantity: 50,
    remarks: "All items in good condition",
    unit: "unit"
  },
  {
    id: "GRN002",
    ref: "GRN-2310-002",
    date: new Date("2023-05-20"),
    status: GRNStatus.COMMITTED,
    receivedQuantity: 30,
    remarks: "Some items backordered",
    unit: "unit"
  },
  {
    id: "GRN003",
    ref: "GRN-2310-003",
    date: new Date("2023-05-25"),
    status: GRNStatus.COMMITTED,
    receivedQuantity: 0,
    remarks: "Awaiting delivery",
    unit: "unit"
  },
];

function GoodsReceiveNoteTab({ poData }: GoodsReceiveNoteTabProps) {
  // Use the mock data
  const grnItems: GoodsReceiveNoteItem[] = mockItemsReceived;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Goods Receive Notes</h2>
        <Button>Create New GRN</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>GRN Number</TableHead>
            <TableHead>Receive Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Received Quantity</TableHead>
            <TableHead>Remarks</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {grnItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.ref}</TableCell>
              <TableCell>{item.date.toLocaleDateString()}</TableCell>
              <TableCell>
                <StatusBadge status={item.status} />
              </TableCell>
              <TableCell>{item.receivedQuantity}</TableCell>
              <TableCell>{item.remarks}</TableCell>
              <TableCell>
                <Button variant="outline" size="sm">View Details</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default GoodsReceiveNoteTab;
