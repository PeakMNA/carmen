"use client"

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Users, 
  FileText, 
  DollarSign, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Info
} from "lucide-react";
import { UpdatedEnhancedItemsTab, UserRole, EnhancedPRItem } from "../components/tabs/UpdatedEnhancedItemsTab";

export default function EnhancedPRDemoPage() {
  const [currentUserRole, setCurrentUserRole] = useState<UserRole>("staff");
  const [items, setItems] = useState<EnhancedPRItem[]>([]);

  // Mock PR data
  const prData = {
    id: "PR-2410-001",
    refNumber: "PR-2410-001",
    title: "Q1 Office Supplies & Equipment",
    requestor: "John Doe",
    department: "Operations",
    status: "In Progress",
    totalEstimatedValue: 3250.75,
    createdDate: "2024-01-15",
    requiredDate: "2024-02-28"
  };

  // Handle item updates
  const handleItemUpdate = async (itemId: string, updates: Partial<EnhancedPRItem>) => {
    try {
      // In real implementation, this would call the API
      console.log('Updating item:', itemId, updates);
      
      // Mock API call
      const response = await fetch(`/api/pr/${prData.id}/items/${itemId}?userRole=${currentUserRole}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const result = await response.json();
        // Update local state
        setItems(prev => prev.map(item => 
          item.id === itemId ? { ...item, ...updates } : item
        ));
      }
    } catch (error) {
      console.error('Error updating item:', error);
    }
  };

  // Handle bulk actions
  const handleBulkAction = async (action: string, itemIds: string[]) => {
    try {
      console.log('Bulk action:', action, itemIds);
      
      // Mock API call
      const response = await fetch(`/api/pr/${prData.id}/items/bulk?userRole=${currentUserRole}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          itemIds,
          applyTo: 'selected'
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Bulk action result:', result);
        // In real implementation, would refresh items from API
      }
    } catch (error) {
      console.error('Error performing bulk action:', error);
    }
  };

  // Get role-specific dashboard stats
  const getDashboardStats = () => {
    const stats = [
      {
        title: "Total Items",
        value: "12",
        icon: FileText,
        color: "text-blue-600"
      },
      {
        title: currentUserRole === "staff" ? "My Items" : "Pending Approval",
        value: currentUserRole === "staff" ? "8" : "5",
        icon: Clock,
        color: "text-orange-600"
      },
      {
        title: "Approved",
        value: "7",
        icon: CheckCircle,
        color: "text-green-600"
      }
    ];

    if (currentUserRole !== "staff") {
      stats.push({
        title: "Est. Total Value",
        value: "$3,250.75",
        icon: DollarSign,
        color: "text-purple-600"
      });
    }

    return stats;
  };

  // Get role-specific info panel
  const getRoleInfo = () => {
    const roleInfo = {
      staff: {
        title: "Staff/Requestor View",
        description: "You can create and edit items in draft status, and revise items sent back for review.",
        permissions: [
          "Create new items",
          "Edit draft items",
          "Submit items for approval",
          "Revise items in review status"
        ],
        restrictions: [
          "Cannot see financial information",
          "Cannot edit approved items",
          "Cannot see vendor details"
        ]
      },
      hd: {
        title: "Head of Department View",
        description: "You can review and approve items submitted by your department staff.",
        permissions: [
          "View all department items",
          "Approve/reject pending items",
          "Set approved quantities",
          "Send items for review",
          "View financial estimates",
          "Perform bulk operations"
        ],
        restrictions: [
          "Cannot edit basic item details",
          "Cannot modify vendor assignments"
        ]
      },
      purchase_staff: {
        title: "Purchase Staff View",
        description: "You can manage vendor assignments, update pricing, and process approved items.",
        permissions: [
          "View all financial information",
          "Assign/change vendors",
          "Update estimated prices",
          "Edit delivery details",
          "Record actual purchase prices",
          "Submit to managers",
          "Split approved items to new PR"
        ],
        restrictions: [
          "Cannot edit basic request details",
          "Cannot approve items"
        ]
      },
      finance_manager: {
        title: "Finance Manager View",
        description: "You review financial aspects and budget compliance before final approval.",
        permissions: [
          "Review financial information",
          "Approve/reject from finance perspective",
          "View budget impact",
          "Send items for review",
          "Perform bulk finance approvals"
        ],
        restrictions: [
          "Cannot edit item details",
          "Cannot modify vendor assignments",
          "Cannot give final approval"
        ]
      },
      gm: {
        title: "General Manager View", 
        description: "You provide final approval for items that have passed all previous stages.",
        permissions: [
          "Final approve items",
          "View complete workflow history",
          "Send items for review",
          "Reject items",
          "Perform bulk final approvals"
        ],
        restrictions: [
          "Cannot edit item details",
          "Cannot modify vendor assignments"
        ]
      }
    };

    return roleInfo[currentUserRole];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to PR List
              </Button>
              <div>
                <h1 className="text-xl font-semibold">{prData.refNumber}</h1>
                <p className="text-sm text-gray-500">{prData.title}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-sm font-medium">Role Simulation</div>
                <Select value={currentUserRole} onValueChange={(value: UserRole) => setCurrentUserRole(value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="staff">Staff/Requestor</SelectItem>
                    <SelectItem value="hd">Head of Department</SelectItem>
                    <SelectItem value="purchase_staff">Purchase Staff</SelectItem>
                    <SelectItem value="finance_manager">Finance Manager</SelectItem>
                    <SelectItem value="gm">General Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Badge variant="outline" className="ml-2">
                Demo Mode
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Role Information Panel */}
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {getRoleInfo().title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-700 mb-4">{getRoleInfo().description}</p>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-green-700 mb-2">✅ Permissions</h4>
                <ul className="text-sm space-y-1">
                  {getRoleInfo().permissions.map((permission, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <CheckCircle className="h-3 w-3 text-green-600" />
                      {permission}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-red-700 mb-2">❌ Restrictions</h4>
                <ul className="text-sm space-y-1">
                  {getRoleInfo().restrictions.map((restriction, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <AlertTriangle className="h-3 w-3 text-red-600" />
                      {restriction}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {getDashboardStats().map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="items" className="space-y-4">
          <TabsList>
            <TabsTrigger value="items">Items</TabsTrigger>
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="activity">Activity Log</TabsTrigger>
          </TabsList>

          <TabsContent value="items" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  PR Detail Items
                  <Badge variant="outline" className="ml-2">
                    Enhanced UI Demo
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UpdatedEnhancedItemsTab
                  userRole={currentUserRole}
                  onItemUpdate={handleItemUpdate}
                  onBulkAction={handleBulkAction}
                  onStageAction={(itemId, stage, action, data) => {
                    console.log('Stage action:', { itemId, stage, action, data });
                  }}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflow" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Workflow Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Info className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Workflow Demo</h4>
                      <p className="text-sm text-gray-600">
                        This tab would show the overall PR workflow status, approval chain, and progress tracking.
                        The enhanced items tab above demonstrates the item-level workflow management.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attachments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attachments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Info className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Attachments Demo</h4>
                      <p className="text-sm text-gray-600">
                        This tab would show PR-level attachments and documents.
                        Individual item attachments are managed within the enhanced items tab.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Activity Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                    <Info className="h-5 w-5 text-blue-600" />
                    <div>
                      <h4 className="font-medium">Activity Log Demo</h4>
                      <p className="text-sm text-gray-600">
                        This tab would show the complete audit trail for the PR and all its items.
                        Item-level changes are tracked within the enhanced items workflow.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* API Information */}
        <Card className="mt-6 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5" />
              API Implementation Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-green-700 mb-2">✅ Implemented APIs</h4>
                <ul className="text-sm space-y-1">
                  <li>GET /api/pr/[prId]/items - List items with role filtering</li>
                  <li>GET /api/pr/[prId]/items/[itemId] - Get single item</li>
                  <li>PUT /api/pr/[prId]/items/[itemId] - Update item</li>
                  <li>POST /api/pr/[prId]/items/[itemId]/transition - Status changes</li>
                  <li>PUT /api/pr/[prId]/items/bulk - Bulk operations</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium text-blue-700 mb-2">📋 Features Demonstrated</h4>
                <ul className="text-sm space-y-1">
                  <li>Role-based field visibility and editing</li>
                  <li>Workflow status management</li>
                  <li>Bulk operations with user choice</li>
                  <li>Expandable detail panels</li>
                  <li>Financial data protection</li>
                  <li>Responsive design patterns</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}