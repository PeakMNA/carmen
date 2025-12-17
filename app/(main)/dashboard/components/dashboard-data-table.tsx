"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

/**
 * Recent Activities Mock Data
 * Transaction Code Format: PREFIX-YYMM-NNNN
 * - PREFIX: Document type (PR = Purchase Request, PO = Purchase Order, GRN = Goods Receipt, etc.)
 * - YY: Two-digit year (e.g., 24 for 2024)
 * - MM: Two-digit month (e.g., 10 for October)
 * - NNNN: Sequential number
 */
const recentActivities = [
  {
    id: 1,
    type: "Purchase Request",
    header: "PR-2410-001", // Purchase Request #001, October 2024
    status: "Approved",
    target: "Kitchen Supplies",
    limit: "15",
    reviewer: "Sarah Johnson",
    priority: "high",
    date: "2024-01-20",
  },
  {
    id: 2,
    type: "Purchase Order",
    header: "PO-2410-089",
    status: "Processing",
    target: "Fresh Produce Co.",
    limit: "25",
    reviewer: "Mike Chen",
    priority: "medium",
    date: "2024-01-19",
  },
  {
    id: 3,
    type: "Goods Receipt",
    header: "GRN-2410-045",
    status: "Complete",
    target: "Premium Meats Ltd.",
    limit: "12",
    reviewer: "Emma Davis",
    priority: "low",
    date: "2024-01-18",
  },
  {
    id: 4,
    type: "Stock Adjustment",
    header: "ADJ-2410-012",
    status: "Pending",
    target: "Beverage Inventory",
    limit: "8",
    reviewer: "Alex Rodriguez",
    priority: "medium",
    date: "2024-01-17",
  },
  {
    id: 5,
    type: "Vendor Invoice",
    header: "INV-2410-278",
    status: "Under Review",
    target: "Global Foods Inc.",
    limit: "35",
    reviewer: "Lisa Wong",
    priority: "high",
    date: "2024-01-16",
  },
  {
    id: 6,
    type: "Quality Check",
    header: "QC-2410-067",
    status: "Failed",
    target: "Dairy Products",
    limit: "22",
    reviewer: "James Wilson",
    priority: "critical",
    date: "2024-01-15",
  },
]

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'approved':
    case 'complete':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    case 'processing':
    case 'pending':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'under review':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    case 'failed':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

function getPriorityColor(priority: string) {
  switch (priority.toLowerCase()) {
    case 'critical':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    case 'high':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    case 'low':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
  }
}

export function DashboardDataTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
        <CardDescription>
          Latest procurement and inventory activities across all departments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Document</TableHead>
              <TableHead>Target</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Reviewer</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentActivities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell className="font-medium">
                  {activity.type}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{activity.header}</span>
                    <span className="text-sm text-muted-foreground">
                      ID: {activity.id}
                    </span>
                  </div>
                </TableCell>
                <TableCell>{activity.target}</TableCell>
                <TableCell>
                  <Badge 
                    variant="secondary" 
                    className={getStatusColor(activity.status)}
                  >
                    {activity.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant="outline"
                    className={getPriorityColor(activity.priority)}
                  >
                    {activity.priority}
                  </Badge>
                </TableCell>
                <TableCell>{activity.reviewer}</TableCell>
                <TableCell className="text-muted-foreground">
                  {activity.date}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>
                        <Eye className="mr-2 h-4 w-4" />
                        View details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}