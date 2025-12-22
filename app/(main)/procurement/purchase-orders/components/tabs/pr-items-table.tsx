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

interface RelatedPRItem {
  id: string
  prNumber: string
  detailNumber: number
  requestLocation: string
  businessDimensions: {
    department: string
    costCenter: string
    project?: string
  }
  approvedQty: number
  approvedUnit: string
  itemComments: string
}

const mockRelatedPRItems: RelatedPRItem[] = [
  {
    id: 'PR001-1',
    prNumber: 'PR-2410-001',
    detailNumber: 1,
    requestLocation: 'HR Office - Floor 3',
    businessDimensions: {
      department: 'Human Resources',
      costCenter: 'CC-HR-001',
      project: 'New Hire Onboarding'
    },
    approvedQty: 8,
    approvedUnit: 'EA',
    itemComments: "Urgent request for new employee onboarding"
  },
  {
    id: 'PR002-1',
    prNumber: 'PR-2410-002',
    detailNumber: 1,
    requestLocation: 'IT Department - Floor 4',
    businessDimensions: {
      department: 'IT',
      costCenter: 'CC-IT-003',
      project: 'Office Renovation'
    },
    approvedQty: 20,
    approvedUnit: 'EA',
    itemComments: "Replacement chairs needed for software development team"
  },
  {
    id: 'PR002-2',
    prNumber: 'PR-2410-002',
    detailNumber: 2,
    requestLocation: 'IT Department - Floor 4',
    businessDimensions: {
      department: 'IT',
      costCenter: 'CC-IT-003',
    },
    approvedQty: 5,
    approvedUnit: 'EA',
    itemComments: "Additional monitors for new workstations"
  },
  {
    id: 'PR003-1',
    prNumber: 'PR-2410-003',
    detailNumber: 1,
    requestLocation: 'Marketing Studio - Floor 2',
    businessDimensions: {
      department: 'Marketing',
      costCenter: 'CC-MKT-002',
      project: 'Creative Studio Setup'
    },
    approvedQty: 10,
    approvedUnit: 'EA',
    itemComments: "Chairs for new creative workspace"
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
            <TableHead>PR#</TableHead>
            <TableHead>Details #</TableHead>
            <TableHead>Request Location</TableHead>
            <TableHead>Business Dimensions</TableHead>
            <TableHead className="text-right">Approved Qty</TableHead>
            <TableHead>Units</TableHead>
            <TableHead>Item Comments</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockRelatedPRItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>
                <button className="text-blue-600 hover:text-blue-800 hover:underline font-medium">
                  {item.prNumber}
                </button>
              </TableCell>
              <TableCell className="text-gray-700">{item.detailNumber}</TableCell>
              <TableCell className="text-gray-700">{item.requestLocation}</TableCell>
              <TableCell>
                <div className="space-y-0.5">
                  <div className="font-medium">{item.businessDimensions.department}</div>
                  <div className="text-xs text-muted-foreground">{item.businessDimensions.costCenter}</div>
                  {item.businessDimensions.project && (
                    <Badge variant="outline" className="text-xs">
                      {item.businessDimensions.project}
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right font-medium">{item.approvedQty}</TableCell>
              <TableCell>{item.approvedUnit}</TableCell>
              <TableCell className="max-w-[250px]">
                <span className="text-sm text-muted-foreground line-clamp-2" title={item.itemComments}>
                  {item.itemComments}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}