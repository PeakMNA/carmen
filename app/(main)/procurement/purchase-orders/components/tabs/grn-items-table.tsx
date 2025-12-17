'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MessageSquareIcon } from "lucide-react"

const mockRelatedGRNItems = [
  {
    id: 'GRN001',
    grnNumber: 'GRN-2410-001',
    receivedDate: '2024-10-15',
    receivedQuantity: 5,
    rejectedQuantity: 0,
    inspectedBy: 'John Smith',
    location: 'Main Warehouse',
    comment: "Items received in good condition"
  },
  {
    id: 'GRN002',
    grnNumber: 'GRN-2410-002',
    receivedDate: '2024-10-20',
    receivedQuantity: 3,
    rejectedQuantity: 2,
    inspectedBy: 'Mary Johnson',
    location: 'Main Warehouse',
    comment: "2 items rejected due to damage during transport"
  }
]

interface GrnItemsTableProps {
  itemData?: {
    name: string;
    description: string;
  };
}

export function GrnItemsTable({ itemData }: GrnItemsTableProps) {
  return (
    <div className="container mx-auto py-4">
      <div className="bg-muted p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">{itemData?.name || "Item"}</h3>
        <p className="text-muted-foreground">{itemData?.description || "Item description"}</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>GRN Number</TableHead>
            <TableHead>Received Date</TableHead>
            <TableHead className="text-right">Received Qty</TableHead>
            <TableHead className="text-right">Rejected Qty</TableHead>
            <TableHead>Inspected By</TableHead>
            <TableHead>Location</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockRelatedGRNItems.map((item) => (
            <>
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.grnNumber}</TableCell>
              <TableCell>{item.receivedDate}</TableCell>
              <TableCell className="text-right">{item.receivedQuantity}</TableCell>
              <TableCell className="text-right">{item.rejectedQuantity}</TableCell>
              <TableCell>{item.inspectedBy}</TableCell>
              <TableCell>{item.location}</TableCell>
            </TableRow>

              <TableRow key={`${item.id}-comment`} className="bg-muted/50">
                <TableCell colSpan={6} className="py-2">
                  <div className="flex items-center space-x-2">
                    <MessageSquareIcon className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{item.comment}</span>
                  </div>
                </TableCell>
              </TableRow>
            </>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}