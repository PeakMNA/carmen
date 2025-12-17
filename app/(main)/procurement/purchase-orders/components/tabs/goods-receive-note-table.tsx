'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import StatusBadge from "@/components/ui/custom-status-badge"

const mockGRNData = [
  {
    grnReference: "GRN-2410-001",
    date: "2024-03-15",
    location: "Main Warehouse",
    receiver: "John Doe",
    status: "Received",
    qty: 50,
    units: "pcs",
  },
  {
    grnReference: "GRN-2410-002",
    date: "2024-03-16",
    location: "IT Department",
    receiver: "Jane Smith",
    status: "Void",
    qty: 30,
    units: "boxes",
  },
  {
    grnReference: "GRN-2410-003",
    date: "2024-03-17",
    location: "Branch Office",
    receiver: "Bob Johnson",
    status: "Committed",
    qty: 75,
    units: "kg",
  },
]

export function GoodsReceiveNoteTable() {
  return (
    <div className="container mx-auto p-4">
          <div className="mb-6 bg-muted p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Office Chair</h3>
            <p className="text-muted-foreground">Ergonomic office chair with lumbar support</p>
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>GRN Reference</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Receiver</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>Inventory Units</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockGRNData.map((grn) => (
                  <TableRow key={grn.grnReference}>
                    <TableCell className="font-medium">{grn.grnReference}</TableCell>
                    <TableCell>{grn.date}</TableCell>
                    <TableCell>{grn.location}</TableCell>
                    <TableCell>{grn.receiver}</TableCell>
                    <TableCell>
                      <StatusBadge status={grn.status} />
                    </TableCell>
                    <TableCell className="text-right">{grn.qty}</TableCell>
                    <TableCell>{grn.units}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
    </div>
  )
}