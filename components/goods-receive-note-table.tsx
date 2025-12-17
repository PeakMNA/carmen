/**
 * Goods Receive Note Table Component
 *
 * Transaction Code Format: GRN-YYMM-NNNN
 * - GRN: Goods Received Note prefix
 * - YY: Two-digit year (e.g., 24 for 2024)
 * - MM: Two-digit month (e.g., 10 for October)
 * - NNNN: Sequential number (e.g., 001, 002, etc.)
 * Example: GRN-2410-001 = Goods Received Note #001 from October 2024
 */

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

// Mock data with transaction codes using format: GRN-YYMM-NNNN
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
    status: "Pending",
    qty: 30,
    units: "boxes",
  },
  {
    grnReference: "GRN-2410-003",
    date: "2024-03-17",
    location: "Branch Office",
    receiver: "Bob Johnson",
    status: "Partial",
    qty: 75,
    units: "kg",
  },
]

export function GoodsReceiveNoteTable() {
  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Goods Receive Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
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
                  <TableHead>Units</TableHead>
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
                      <Badge 
                        variant={
                          grn.status === "Received" ? "default" :
                          grn.status === "Pending" ? "secondary" :
                          "outline"
                        }
                      >
                        {grn.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{grn.qty}</TableCell>
                    <TableCell>{grn.units}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}