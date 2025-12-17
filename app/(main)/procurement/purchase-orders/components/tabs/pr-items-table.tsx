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

const mockRelatedPRItems = [
  {
    id: 'PR001',
    prNumber: 'PR-2410-001',
    location: 'Human Resources',
    requestedQuantity: 10,
    approvedQuantity: 8,
    requestDate: '2024-09-15',
    jobCode: 'HR-001',
    comment: "Urgent request for new employee onboarding"
  },
  {
    id: 'PR002',
    prNumber: 'PR-2410-002',
    location: 'IT',
    requestedQuantity: 20,
    approvedQuantity: 20,
    requestDate: '2024-09-16',
    jobCode: 'IT-003',
    comment: "Replacement chairs needed for software development team"
  },
  {
    id: 'PR003',
    prNumber: 'PR-2410-003',
    location: 'Marketing',
    requestedQuantity: 15,
    approvedQuantity: 10,
    requestDate: '2024-09-17',
    jobCode: 'MKT-002',
    comment: "Chairs for new creative workspace"
  },
]

export function PrItemsTable() {
  return (
    <div className="container mx-auto py-4">
      <div className="bg-muted p-4 rounded-lg mb-6">
        <h3 className="text-lg font-semibold mb-2">Office Chair</h3>
        <p className="text-muted-foreground">Ergonomic office chair with lumbar support</p>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>PR Number</TableHead>
            <TableHead>Locations</TableHead>
            <TableHead className="text-right">Requested Qty</TableHead>
            <TableHead className="text-right">Approved Qty</TableHead>
            <TableHead>Request Date</TableHead>
            <TableHead>Job Code</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockRelatedPRItems.map((item) => (
            <>
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.prNumber}</TableCell>
              <TableCell>{item.location}</TableCell>
              <TableCell className="text-right">{item.requestedQuantity}</TableCell>
              <TableCell className="text-right">{item.approvedQuantity}</TableCell>
              <TableCell>{item.requestDate}</TableCell>
              <TableCell>{item.jobCode}</TableCell>
            </TableRow>
            {/* <TableRow key={`${item.id}-comment`} >
            <TableCell >
              {item.comment}
            </TableCell>
            </TableRow> */}

              <TableRow key={`${item.id}-comment`} className="bg-muted/50">
                <TableCell colSpan={11} className="py-2">
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