'use client'

import { Bell, CheckCircle, Clock, FileText, ShoppingCart, DollarSign, AlertCircle, Users, Calendar, ThumbsUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useRouter } from "next/navigation"

export function DashboardApproval() {

  const router = useRouter();
  const goto_purchase_request = (id: number) =>  {
    router.push(`/procurement/purchase-requests/${id}?mode=edit`)
  }

  return (
    <div className="w-full p-6 bg-gray-50">
      <h1 className="text-3xl font-semibold mb-6 text-gray-800">Department Approval</h1>
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="border-b">
            <CardTitle>Procurement Request Queue</CardTitle>
            <CardDescription>Staff requests awaiting your approval</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Tabs defaultValue="pending-approval" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="pending-approval">Pending Approval</TabsTrigger>
                <TabsTrigger value="flagged">Flagged for Review</TabsTrigger>
              </TabsList>
              <TabsContent value="pending-approval" className="p-4">
                <ScrollArea className="h-[500px] pr-4">
                  <ul className="space-y-4">
                    {[
                      { id: 1, item: "Bed Linens", quantity: 200, urgency: "Medium", total: 5000, requester: "Alice Johnson", department: "Housekeeping" },
                      { id: 2, item: "Coffee Makers", quantity: 50, urgency: "Low", total: 2500, requester: "Bob Smith", department: "F&B" },
                      { id: 3, item: "Desk Chairs", quantity: 30, urgency: "Medium", total: 4500, requester: "Carol Davis", department: "Admin" },
                    ].map((request) => (
                      <li key={request.id} className="bg-white p-4 rounded-md border">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-lg text-gray-800">{request.item}</h3>
                          <Badge variant="outline" className={`
                            ${request.urgency === 'High' ? 'border-red-500 text-red-700' : 
                              request.urgency === 'Medium' ? 'border-yellow-500 text-yellow-700' : 
                              'border-green-500 text-green-700'}
                          `}>
                            {request.urgency}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {request.quantity} units, ${request.total.toLocaleString()} - Requested by {request.requester}
                        </p>
                        <div className="flex justify-between items-center">
                          <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                            <Users className="w-3 h-3 mr-1" />
                            {request.department}
                          </Badge>
                          <div className="space-x-2">
                            <Button size="sm" variant="outline" onClick={() => goto_purchase_request(request.id)}>
                              <FileText className="w-4 h-4 mr-2" />
                              Details
                            </Button>
                            <Button size="sm">
                              <ThumbsUp className="w-4 h-4 mr-2" />
                              Approve
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </TabsContent>
              <TabsContent value="flagged" className="p-4">
                <ScrollArea className="h-[500px] pr-4">
                  <ul className="space-y-4">
                    {[
                      { id: 4, item: "Smart TVs", quantity: 100, urgency: "High", total: 50000, requester: "David Brown", department: "IT", flag: "High value request" },
                      { id: 5, item: "Luxury Toiletries", quantity: 1000, urgency: "Medium", total: 15000, requester: "Eva Prince", department: "Housekeeping", flag: "Exceeds usual quantity" },
                    ].map((request) => (
                      <li key={request.id} className="bg-white p-4 rounded-md border">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-lg text-gray-800">{request.item}</h3>
                          <Badge variant="outline" className="border-red-500 text-red-700">
                            {request.urgency}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          {request.quantity} units, ${request.total.toLocaleString()} - Requested by {request.requester}
                        </p>
                        <div className="flex justify-between items-center">
                          <div>
                            <Badge variant="secondary" className="bg-gray-100 text-gray-800 mr-2">
                              <Users className="w-3 h-3 mr-1" />
                              {request.department}
                            </Badge>
                            <Badge variant="destructive" className="bg-red-100 text-red-800 border border-red-200">
                              {request.flag}
                            </Badge>
                          </div>
                          <div className="space-x-2">
                            <Button size="sm" variant="outline">
                              <FileText className="w-4 h-4 mr-2" />
                              Details
                            </Button>
                            <Button size="sm" variant="secondary">
                              <AlertCircle className="w-4 h-4 mr-2" />
                              Review
                            </Button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle>Recent Approvals</CardTitle>
              <CardDescription>Log of your recent approval actions</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[250px]">
                <ul className="divide-y">
                  {[
                    { action: "Approved", request: "Towels - 500 units", department: "Housekeeping", amount: 3000, time: "2 hours ago" },
                    { action: "Rejected", request: "Luxury Pens - 1000 units", department: "Front Desk", amount: 5000, time: "1 day ago" },
                    { action: "Approved with changes", request: "Desk Lamps - 100 units", department: "Maintenance", amount: 2000, time: "2 days ago" },
                  ].map((activity, index) => (
                    <li key={index} className="p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant={activity.action === "Approved" ? "default" : (activity.action === "Rejected" ? "destructive" : "secondary")}
                               className={`${activity.action === "Approved" ? "bg-green-100 text-green-800" : 
                                             activity.action === "Rejected" ? "bg-red-100 text-red-800" : 
                                             "bg-yellow-100 text-yellow-800"}`}>
                          {activity.action === "Approved" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {activity.action === "Rejected" && <AlertCircle className="w-3 h-3 mr-1" />}
                          {activity.action === "Approved with changes" && <CheckCircle className="w-3 h-3 mr-1" />}
                          {activity.action}
                        </Badge>
                        <span className="text-xs text-gray-500"><Clock className="w-3 h-3 inline mr-1" />{activity.time}</span>
                      </div>
                      <p className="text-sm font-medium text-gray-800 mb-1">{activity.request}</p>
                      <div className="flex items-center text-xs text-gray-500 space-x-2">
                        <span><Users className="w-3 h-3 inline mr-1" />{activity.department}</span>
                        <span><DollarSign className="w-3 h-3 inline mr-1" />{activity.amount.toLocaleString()}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="border-b">
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Recent updates and alerts</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[250px]">
                <ul className="divide-y">
                  {[
                    { message: "Urgent request from Maintenance: 20 A/C units need immediate approval", time: "10 minutes ago" },
                    { message: "Monthly inventory report is ready for review", time: "1 hour ago" },
                    { message: "New supplier added for kitchen equipment", time: "3 hours ago" },
                  ].map((notification, index) => (
                    <li key={index} className="flex items-start p-4 hover:bg-gray-50">
                      <Bell className="w-5 h-5 mt-0.5 text-gray-400 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-800">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}