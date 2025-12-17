'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

const orders = [
  {
    id: "ORD-2410-001",
    supplier: "Global Foods Inc.",
    items: 12,
    total: 2450.00,
    status: "Processing",
    delivery: "2024-03-25",
  },
  {
    id: "ORD-2410-002",
    supplier: "Fresh Produce Co.",
    items: 8,
    total: 1850.75,
    status: "Shipped",
    delivery: "2024-03-23",
  },
  {
    id: "ORD-2410-003",
    supplier: "Premium Meats Ltd.",
    items: 15,
    total: 3200.50,
    status: "Pending",
    delivery: "2024-03-28",
  },
  {
    id: "ORD-2410-004",
    supplier: "Beverage Distributors",
    items: 6,
    total: 980.25,
    status: "Processing",
    delivery: "2024-03-26",
  },
  {
    id: "ORD-2410-005",
    supplier: "Kitchen Supplies Co.",
    items: 20,
    total: 4500.00,
    status: "Shipped",
    delivery: "2024-03-24",
  },
]

const orderStats = {
  total: 42,
  processing: 15,
  shipped: 18,
  pending: 9,
  value: 89750.50
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'processing':
      return 'bg-blue-500/10 text-blue-500'
    case 'shipped':
      return 'bg-green-500/10 text-green-500'
    case 'pending':
      return 'bg-yellow-500/10 text-yellow-500'
    default:
      return 'bg-gray-500/10 text-gray-500'
  }
}

export function ActiveOrders() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Active Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.total}</div>
            <p className="text-xs text-muted-foreground">Across all suppliers</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.processing}</div>
            <p className="text-xs text-muted-foreground">Orders in progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shipped</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStats.shipped}</div>
            <p className="text-xs text-muted-foreground">In transit</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${orderStats.value.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Active orders value</p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expected Delivery</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{order.supplier}</TableCell>
                  <TableCell>{order.items}</TableCell>
                  <TableCell>${order.total.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(order.status)}>
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.delivery}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 