// File: PRDetailPage.tsx
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  CardDescription,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileIcon,
  FileText,
  PrinterIcon,
  DownloadIcon,
  HashIcon,
  BuildingIcon,
  MapPinIcon,
  UserIcon,
  ShareIcon,
  Edit,
  CheckCircleIcon,
  XCircleIcon,
  RotateCcwIcon,
  CheckCircle,
  X,
  CalendarIcon,
  TagIcon,
  ClipboardListIcon,
  ChevronLeft,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import { PRHeader } from "./PRHeader";
import { CompactWorkflowIndicator } from "./CompactWorkflowIndicator";
import { ItemsTab } from "./tabs/ItemsTab";
import { ResponsiveBudgetScreen } from "./tabs/budget-tab";
import { WorkflowTab } from "./tabs/WorkflowTab";
import { AttachmentsTab } from "./tabs/AttachmentsTab";
import { ActivityTab } from "./tabs/ActivityTab";
import PRCommentsAttachmentsTab from "./tabs/PRCommentsAttachmentsTab";
import { PRRBACService, type WorkflowAction } from "../services/rbac-service";
import { WorkflowDecisionEngine, type WorkflowDecision } from "../services/workflow-decision-engine";
import {
  PurchaseRequest,
  PurchaseRequestItem,
  PRType,
  PRStatus,
  WorkflowStatus,
  WorkflowStage,
  Requestor,
  asMockPurchaseRequest,
  MockPurchaseRequest,
  MockPurchaseRequestItem,
} from "@/lib/types";
import {
  getBadgeVariant,
  handleDocumentAction,
  getNextWorkflowStage,
  getPreviousWorkflowStage,
} from "./utils";
import { samplePRData, samplePRItems } from "@/lib/mock-data/purchase-requests";
import { mockPurchaseRequests as mockPRListData } from "@/lib/mock-data/purchase-requests";
import { useSimpleUser } from "@/lib/context/simple-user-context";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import StatusBadge from "@/components/ui/custom-status-badge";
import SummaryTotal from "./SummaryTotal";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Separator } from "@/components/ui/separator";
import { canEditField, getFieldPermissions, canViewFinancialInfo } from "@/lib/utils/field-permissions";
import { useWorkflow } from "@/lib/context/workflow-context";
import { canViewWorkflowFinancialInfo } from "@/lib/services/workflow-permissions";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface PRDetailPageProps {
  prId?: string;
}

export default function PRDetailPage({ prId: propPrId }: PRDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAddMode = searchParams?.get("mode") === "add";
  const prId = propPrId || searchParams?.get("id");

  const [mode, setMode] = useState<"view" | "edit" | "add">(
    isAddMode ? "add" : "view"
  );

  // Get PR data from mockup list or fallback to sample data
  const getPRData = () => {
    if (isAddMode) return getEmptyPurchaseRequest();
    if (prId) {
      // Case-insensitive lookup for PR ID
      const foundPR = mockPRListData.find(pr => {
        const mockPR = asMockPurchaseRequest(pr);
        return pr.id.toLowerCase() === prId.toLowerCase() ||
          mockPR.requestNumber?.toLowerCase() === prId.toLowerCase();
      });
      if (foundPR) return foundPR;
    }
    return asMockPurchaseRequest(samplePRData);
  };

  const [formData, setFormData] = useState<PurchaseRequest | MockPurchaseRequest>(getPRData());

  // Items state management for proper form button updates
  const [currentItems, setCurrentItems] = useState<PurchaseRequestItem[]>(() => {
    const mockFormData = asMockPurchaseRequest(formData);
    return mockFormData.items && mockFormData.items.length > 0 ? mockFormData.items : samplePRItems;
  });

  // RBAC state
  const [availableActions, setAvailableActions] = useState<WorkflowAction[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const [workflowDecision, setWorkflowDecision] = useState<WorkflowDecision | null>(null);
  const [isReturnStepSelectorOpen, setIsReturnStepSelectorOpen] = useState(false);
  const [returnComment, setReturnComment] = useState("");
  const [selectedReturnStep, setSelectedReturnStep] = useState<any>(null);
  const { user } = useSimpleUser(); // Get current user from context
  const { workflowPermissions, getUserWorkflowRoles } = useWorkflow(); // Get workflow permissions</invoke>

  useEffect(() => {
    setIsMounted(true);
    if (isAddMode) {
      setMode("add");
      setFormData(getEmptyPurchaseRequest());
    }
  }, [isAddMode]);

  // Update data when PR ID changes (for navigation from PR list)
  useEffect(() => {
    if (prId && !isAddMode) {
      // Case-insensitive lookup for PR ID
      const foundPR = mockPRListData.find(pr => {
        const mockPR = asMockPurchaseRequest(pr);
        return pr.id.toLowerCase() === prId.toLowerCase() ||
          mockPR.requestNumber?.toLowerCase() === prId.toLowerCase();
      });
      if (foundPR) {
        const mockFoundPR = asMockPurchaseRequest(foundPR);
        setFormData(foundPR);
        setCurrentItems(mockFoundPR.items && mockFoundPR.items.length > 0 ? mockFoundPR.items : samplePRItems);
        setMode("view");
      }
    }
  }, [prId, isAddMode]);

  // Update available actions when user or formData changes
  useEffect(() => {
    if (user && formData) {
      const actions = PRRBACService.getAvailableActions(user, formData);
      setAvailableActions(actions);
    }
  }, [user, formData]);

  // Update workflow decision when items change
  useEffect(() => {
    if (currentItems && currentItems.length > 0) {
      const decision = WorkflowDecisionEngine.analyzeWorkflowState(currentItems);
      setWorkflowDecision(decision);
    }
  }, [currentItems]);

  const handleModeChange = (newMode: "view" | "edit") => setMode(newMode);

  // RBAC-controlled workflow action handlers
  const handleWorkflowAction = (action: WorkflowAction) => {
    if (!user || !PRRBACService.canPerformAction(user, formData, action)) {
      console.warn(`User ${user?.name} cannot perform action: ${action}`);
      return;
    }

    switch (action) {
      case 'approve':
        handleApprove();
        break;
      case 'reject':
        handleReject();
        break;
      case 'sendBack':
        handleSendBack();
        break;
      case 'edit':
        setMode('edit');
        break;
      case 'delete':
        handleDelete();
        break;
      case 'submit':
        handleSubmitForApproval();
        break;
      default:
        console.warn(`Unknown action: ${action}`);
    }
  };

  const handleApprove = () => {
    if (!workflowDecision || !workflowDecision.canSubmit) {
      console.warn('Cannot approve: workflow decision prevents submission');
      return;
    }

    const mockFormData = asMockPurchaseRequest(formData);
    const currentStageValue = mockFormData.currentWorkflowStage || formData.currentStage;
    const nextStage = WorkflowDecisionEngine.getNextWorkflowStage(
      currentStageValue as string,
      workflowDecision
    );

    const updatedData = asMockPurchaseRequest({
      ...formData,
      status: nextStage === 'completed' ? PRStatus.Completed : PRStatus.InProgress,
      currentStage: nextStage,
      ...(mockFormData.lastModified && { lastModified: new Date().toISOString() }),
    });
    setFormData(updatedData);
    console.log('PR Workflow Action:', workflowDecision.action, updatedData);
  };

  const handleReject = () => {
    if (!workflowDecision || !workflowDecision.canSubmit) {
      console.warn('Cannot reject: workflow decision prevents submission');
      return;
    }

    const mockFormData = asMockPurchaseRequest(formData);
    const currentStageValue = mockFormData.currentWorkflowStage || formData.currentStage;
    const nextStage = WorkflowDecisionEngine.getNextWorkflowStage(
      currentStageValue as string,
      workflowDecision
    );

    const updatedData = asMockPurchaseRequest({
      ...formData,
      status: PRStatus.Cancelled,
      currentStage: nextStage,
      ...(mockFormData.lastModified && { lastModified: new Date().toISOString() }),
    });
    setFormData(updatedData);
    console.log('PR Workflow Action:', workflowDecision.action, updatedData);
  };

  const handleSendBack = () => {
    if (!workflowDecision || !workflowDecision.canSubmit) {
      console.warn('Cannot send back: workflow decision prevents submission');
      return;
    }

    // Open step selector for PR-level return action
    setIsReturnStepSelectorOpen(true);
  };

  const handleReturnWithStep = (step: any) => {
    const mockFormData = asMockPurchaseRequest(formData);
    const updatedData = asMockPurchaseRequest({
      ...formData,
      status: PRStatus.InProgress,
      currentStage: step.targetStage,
      ...(mockFormData.lastModified && { lastModified: new Date().toISOString() }),
    });
    setFormData(updatedData);

    // Reset state
    setIsReturnStepSelectorOpen(false);
    setReturnComment("");
    setSelectedReturnStep(null);

    console.log('PR Returned to:', step.targetStage, 'with comment:', returnComment, updatedData);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this purchase request?')) {
      console.log('PR Deleted:', formData.id);
      router.push('/procurement/purchase-requests');
    }
  };

  const handleSubmitForApproval = () => {
    const mockFormData = asMockPurchaseRequest(formData);
    const updatedData = asMockPurchaseRequest({
      ...formData,
      status: PRStatus.InProgress,
      currentStage: WorkflowStage.departmentHeadApproval,
      ...(mockFormData.lastModified && { lastModified: new Date().toISOString() }),
    });
    setFormData(updatedData);
    console.log('PR Submitted for Approval:', updatedData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    if (mode === "add") {
      // Here you would typically save the new PR to your backend
      console.log("New PR created:", formData);
      router.push("/procurement/purchase-requests"); // Redirect back to the list
    } else {
      setMode("view");
    }
  };


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  };

  const handleOrderUpdate = (orderId: string, updates: Partial<PurchaseRequestItem | MockPurchaseRequestItem>) => {
    console.log("Updating order:", orderId, updates);

    // Update the items state to trigger form button updates
    setCurrentItems(prevItems =>
      prevItems.map(item =>
        item.id === orderId
          ? { ...item, ...updates }
          : item
      )
    );
  };

  // Check if user has any edit permissions based on workflow roles or user role
  const hasEditPermissions = (): boolean => {
    // First check workflow permissions
    const hasWorkflowPermissions = Object.values(workflowPermissions.canEditFields).some(permission => permission === true);
    if (hasWorkflowPermissions) return true;

    // Fallback: Check user role name for edit permissions
    // Almost all roles can edit PRs except viewers
    const userRoleName = user?.context?.currentRole?.name || '';

    // Only exclude view-only roles
    const viewOnlyRoles = ['Auditor', 'Viewer', 'Guest'];
    const isViewOnly = viewOnlyRoles.some(role => userRoleName.toLowerCase().includes(role.toLowerCase()));

    // If user has a role and it's not view-only, they can edit
    return Boolean(userRoleName) && !isViewOnly;
  };

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  // Return steps for PR level actions
  const returnSteps = [
    {
      id: "return-to-requestor",
      label: "Return to Requestor",
      description: "Send back to original requestor for revisions",
      targetStage: "requester"
    },
    {
      id: "return-to-department",
      label: "Return to Department Manager",
      description: "Send back to department manager for review",
      targetStage: "departmentHeadApproval"
    },
    {
      id: "return-to-previous",
      label: "Return to Previous Approver",
      description: "Send back to previous approval stage",
      targetStage: "financialApproval"
    }
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 pb-32">
      <div className="flex flex-col lg:flex-row space-y-6 lg:space-y-0 lg:space-x-6">
        {/* Main Content */}
        <div className={`flex-grow space-y-6 ${isSidebarVisible ? 'lg:w-3/4' : 'w-full'}`}>
          {/* Header Card */}
          <Card className="shadow-sm overflow-hidden">
            <CardHeader className="pb-4 border-b bg-muted/10">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 rounded-full p-0 mr-1"
                      onClick={() => router.back()}
                    >
                      <ChevronLeft className="h-5 w-5" />
                      <span className="sr-only">Back to Purchase Requests</span>
                    </Button>
                    <div className="flex flex-col">
                      <h1 className="text-2xl font-bold">
                        {mode === "add"
                          ? "Create New Purchase Request"
                          : asMockPurchaseRequest(formData).requestNumber || "Purchase Request Details"}
                      </h1>
                      {mode !== "add" && (
                        <p className="text-sm text-muted-foreground mt-1">Purchase Request</p>
                      )}
                    </div>
                    {asMockPurchaseRequest(formData).requestNumber && <StatusBadge status={formData.status} className="h-6" />}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {/* All action buttons in one consistent group */}
                  {mode === "view" ? (
                    user && hasEditPermissions() && (
                      <Button onClick={() => handleModeChange("edit")} size="sm" className="h-9">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    )
                  ) : (
                    <>
                      <Button variant="default" onClick={handleSubmit} size="sm" className="h-9">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Save
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setMode("view");
                          // Reset form data to original if needed
                          if (!isAddMode) setFormData(asMockPurchaseRequest(samplePRData));
                        }}
                        size="sm"
                        className="h-9"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Cancel
                      </Button>
                    </>
                  )}

                  <Button variant="outline" size="sm" className="h-9">
                    <PrinterIcon className="mr-2 h-4 w-4" />
                    Print
                  </Button>
                  <Button variant="outline" size="sm" className="h-9">
                    <DownloadIcon className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                  <Button variant="outline" size="sm" className="h-9">
                    <ShareIcon className="mr-2 h-4 w-4" />
                    Share
                  </Button>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={toggleSidebar}
                          className="h-9 w-9 p-0"
                        >
                          {isSidebarVisible ? (
                            <PanelRightClose className="h-4 w-4" />
                          ) : (
                            <PanelRightOpen className="h-4 w-4" />
                          )}
                          <span className="sr-only">Toggle sidebar</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        {isSidebarVisible ? "Hide Sidebar" : "Show Sidebar"}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardHeader>

            {/* Source Requisition Reference */}
            {asMockPurchaseRequest(formData).sourceRequisitionRefNo && (
              <div className="mx-6 mb-4">
                <Card className="border-blue-200 bg-blue-50/50">
                  <CardContent className="py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <div className="text-sm text-muted-foreground">Source Store Requisition</div>
                          <div className="font-medium">{asMockPurchaseRequest(formData).sourceRequisitionRefNo}</div>
                        </div>
                      </div>
                      <Link href={`/store-operations/store-requisitions/${asMockPurchaseRequest(formData).sourceRequisitionId}`}>
                        <Button variant="outline" size="sm">
                          View Requisition
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Main Content */}
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-6">
                {/* Main Details */}
                <div className="space-y-6">
                  {/* Main Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="requestDate" className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                        <CalendarIcon className="h-4 w-4" />
                        Date
                      </Label>
                      {mode === "view" ? (
                        <div className="text-gray-900 font-medium">
                          {formData.requestDate.toLocaleDateString('en-GB')}
                        </div>
                      ) : (
                        <Input
                          id="requestDate"
                          name="requestDate"
                          type="date"
                          value={formData.requestDate.toISOString().split("T")[0]}
                          onChange={handleInputChange}
                          disabled={!canEditField("date", user?.context.currentRole.name || "")}
                          className={!canEditField("date", user?.context.currentRole.name || "") ? "bg-muted" : ""}
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="requestType" className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                        <TagIcon className="h-4 w-4" />
                        PR Type
                      </Label>
                      {mode === "view" ? (
                        <div className="text-gray-900 font-medium">{formData.requestType}</div>
                      ) : (
                        <Select
                          value={formData.requestType}
                          onValueChange={(value) =>
                            setFormData({ ...formData, requestType: value as typeof formData.requestType })
                          }
                          disabled={!canEditField("type", user?.context.currentRole.name || "")}
                        >
                          <SelectTrigger id="requestType" className={!canEditField("type", user?.context.currentRole.name || "") ? "bg-muted" : ""}>
                            <SelectValue placeholder="Select PR Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="goods">Goods</SelectItem>
                            <SelectItem value="services">Services</SelectItem>
                            <SelectItem value="capital">Capital</SelectItem>
                            <SelectItem value="maintenance">Maintenance</SelectItem>
                            <SelectItem value="emergency">Emergency</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="requestedBy" className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                        <UserIcon className="h-4 w-4" />
                        Requestor
                      </Label>
                      {mode === "view" ? (
                        <div className="text-gray-900 font-medium">{formData.requestedBy}</div>
                      ) : (
                        <Input
                          id="requestedBy"
                          name="requestedBy"
                          value={formData.requestedBy}
                          onChange={handleInputChange}
                          disabled={!canEditField("requestor", user?.context.currentRole.name || "")}
                          className={!canEditField("requestor", user?.context.currentRole.name || "") ? "bg-muted" : ""}
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="departmentId" className="text-sm text-muted-foreground mb-1 block flex items-center gap-1">
                        <BuildingIcon className="h-4 w-4" />
                        Department
                      </Label>
                      {mode === "view" ? (
                        <div className="text-gray-900 font-medium">{formData.departmentId || "Not specified"}</div>
                      ) : (
                        <Input
                          id="departmentId"
                          name="departmentId"
                          value={formData.departmentId}
                          onChange={handleInputChange}
                          disabled={!canEditField("department", user?.context.currentRole.name || "")}
                          className={!canEditField("department", user?.context.currentRole.name || "") ? "bg-muted" : ""}
                        />
                      )}
                    </div>
                  </div>

                  {/* Secondary Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <div className="space-y-2">
                      <Label htmlFor="justification" className="text-sm text-muted-foreground mb-2 block flex items-center gap-1">
                        <FileIcon className="h-4 w-4" />
                        Description
                      </Label>
                      {mode === "view" ? (
                        <div className="text-gray-900 font-medium bg-gray-50 p-3 rounded-md min-h-[60px]">
                          {formData.justification || formData.notes || "No description"}
                        </div>
                      ) : (
                        <Textarea
                          id="justification"
                          name="justification"
                          value={formData.justification || ''}
                          onChange={handleInputChange}
                          disabled={!canEditField("description", user?.context.currentRole.name || "")}
                          className={`min-h-[60px] ${!canEditField("description", user?.context.currentRole.name || "") ? "bg-muted" : ""}}`}
                          placeholder="Add purchase request description..."
                        />
                      )}
                    </div>

                    {/* Workflow Progress - Right Half */}
                    <div className="space-y-2">
                      <Label className="text-sm text-muted-foreground mb-2 block">
                        Workflow Progress
                      </Label>
                      {asMockPurchaseRequest(formData).requestNumber && formData.currentStage ? (
                        <div className="bg-gray-50 p-3 rounded-md min-h-[60px] flex items-center">
                          <CompactWorkflowIndicator
                            currentStage={formData.currentStage as WorkflowStage}
                            prData={formData as PurchaseRequest}
                            className="flex-shrink-0"
                          />
                        </div>
                      ) : (
                        <div className="bg-gray-50 p-3 rounded-md min-h-[60px] flex items-center justify-center text-gray-500 text-sm">
                          No workflow data available
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>


          {/* Tabs and Content */}
          <Card className="shadow-sm">
            <Tabs defaultValue="items" className="w-full">
              <CardHeader className="pb-0 pt-4 px-4">
                <TabsList className="w-full grid grid-cols-3">
                  {["items", "budgets", "workflow"].map(
                    (tab) => (
                      <TabsTrigger
                        key={tab}
                        value={tab}
                        className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                      >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                      </TabsTrigger>
                    )
                  )}
                </TabsList>
              </CardHeader>
              <CardContent className="p-0">
                <form onSubmit={handleSubmit}>
                  <div className="w-full rounded-b-md border-t">
                    <div className="p-6">
                      <TabsContent value="items" className="mt-0">
                        {user && (
                          <ItemsTab
                            items={currentItems}
                            currentUser={user}
                            onOrderUpdate={handleOrderUpdate}
                            formMode={mode}
                          />
                        )}
                      </TabsContent>
                      <TabsContent value="budgets" className="mt-0">
                        <ResponsiveBudgetScreen />
                      </TabsContent>
                      <TabsContent value="workflow" className="mt-0">
                        <WorkflowTab />
                      </TabsContent>
                    </div>
                  </div>
                </form>
              </CardContent>
            </Tabs>
          </Card>

          {/* Transaction Summary - Hidden from Requestors */}
          {user && workflowPermissions.canViewFinancialInfo && (
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Transaction Summary ({asMockPurchaseRequest(formData).baseCurrencyCode || 'USD'})</CardTitle>
              </CardHeader>
              <CardContent className="pb-6">
                <SummaryTotal prData={formData as PurchaseRequest} />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className={`space-y-6 ${isSidebarVisible ? 'lg:w-1/4' : 'w-0 opacity-0 overflow-hidden'} transition-all duration-300`}>
          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Comments & Attachments</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <PRCommentsAttachmentsTab prData={formData as PurchaseRequest} />
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Activity Log</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <ActivityTab activityLog={asMockPurchaseRequest(formData).activityLog || []} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Smart Floating Action Menu - Workflow Decision Based */}
      {mode === "view" && user && workflowDecision && (
        <div className="fixed bottom-6 right-6 flex flex-col space-y-3 z-50">
          {/* Action Buttons */}
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-4 flex space-x-3 border border-gray-200 dark:border-gray-700">
            {(() => {
              // Get the actual role NAME from user context, not the role ID
              const userRoleName = user.context?.currentRole?.name || '';

              // For Requestors - show Delete and Submit buttons
              const requestorRoles = ['Staff', 'Requestor', 'Store Staff', 'Chef', 'Counter Staff', 'Executive Chef', 'Warehouse Staff'];
              if (requestorRoles.includes(userRoleName)) {
                return (
                  <>
                    <Button
                      onClick={handleDelete}
                      variant="destructive"
                      size="sm"
                      className="h-9"
                      disabled={formData.status !== PRStatus.Draft}
                    >
                      <X className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                    <Button
                      onClick={handleSubmitForApproval}
                      variant="default"
                      size="sm"
                      className="h-9"
                      disabled={!workflowDecision.canSubmit || formData.status !== PRStatus.Draft}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Submit
                    </Button>
                  </>
                );
              }

              // For Approvers - show all workflow buttons (Reject, Return, Approve)
              const approverRoles = ['Department Manager', 'Financial Manager', 'Approver', 'General Manager', 'Finance Director'];
              if (approverRoles.includes(userRoleName)) {
                if (workflowDecision.action === 'blocked') {
                  return (
                    <Button
                      variant={workflowDecision.buttonVariant}
                      size="sm"
                      className="h-9"
                      disabled={true}
                    >
                      <ClipboardListIcon className="mr-2 h-4 w-4" />
                      {workflowDecision.buttonText}
                    </Button>
                  );
                }

                return (
                  <>
                    <Button
                      onClick={handleReject}
                      variant="destructive"
                      size="sm"
                      className="h-9"
                      disabled={!workflowDecision.canSubmit}
                    >
                      <XCircleIcon className="mr-2 h-4 w-4" />
                      Reject
                    </Button>

                    <Button
                      onClick={handleSendBack}
                      variant="outline"
                      size="sm"
                      className="h-9"
                      disabled={!workflowDecision.canSubmit}
                    >
                      <RotateCcwIcon className="mr-2 h-4 w-4" />
                      Return
                    </Button>

                    <Button
                      onClick={handleApprove}
                      variant="default"
                      size="sm"
                      className="h-9 bg-green-600 hover:bg-green-700"
                      disabled={!workflowDecision.canSubmit}
                    >
                      <CheckCircleIcon className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                  </>
                );
              }

              // For Purchasing Staff - show all workflow buttons (Reject, Return, Submit)
              const purchaserRoles = ['Purchasing Staff', 'Purchaser', 'Procurement Manager', 'Purchasing Agent'];
              if (purchaserRoles.includes(userRoleName)) {
                if (workflowDecision.action === 'blocked') {
                  return (
                    <Button
                      variant={workflowDecision.buttonVariant}
                      size="sm"
                      className="h-9"
                      disabled={true}
                    >
                      <ClipboardListIcon className="mr-2 h-4 w-4" />
                      {workflowDecision.buttonText}
                    </Button>
                  );
                }

                return (
                  <>
                    <Button
                      onClick={handleReject}
                      variant="destructive"
                      size="sm"
                      className="h-9"
                      disabled={!workflowDecision.canSubmit}
                    >
                      <XCircleIcon className="mr-2 h-4 w-4" />
                      Reject
                    </Button>

                    <Button
                      onClick={handleSendBack}
                      variant="outline"
                      size="sm"
                      className="h-9"
                      disabled={!workflowDecision.canSubmit}
                    >
                      <RotateCcwIcon className="mr-2 h-4 w-4" />
                      Return
                    </Button>

                    <Button
                      onClick={handleSubmitForApproval}
                      variant="default"
                      size="sm"
                      className="h-9 bg-blue-600 hover:bg-blue-700"
                      disabled={!workflowDecision.canSubmit}
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Submit
                    </Button>
                  </>
                );
              }

              // For other roles - no floating actions
              return null;
            })()}
          </div>
        </div>
      )}

      {/* Return Step Selector Dialog for PR-Level Actions */}
      <Dialog open={isReturnStepSelectorOpen} onOpenChange={setIsReturnStepSelectorOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Return Purchase Request - Select Destination</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-sm text-gray-600">
              Choose where to return this purchase request for review:
            </div>

            {/* Step Selection */}
            <div className="space-y-2">
              {returnSteps.map((step) => (
                <Button
                  key={step.id}
                  variant={selectedReturnStep?.id === step.id ? "default" : "outline"}
                  className="w-full justify-start p-4 h-auto"
                  onClick={() => setSelectedReturnStep(step)}
                >
                  <div className="text-left">
                    <div className="font-medium">{step.label}</div>
                    <div className="text-xs text-gray-500 mt-1">{step.description}</div>
                  </div>
                </Button>
              ))}
            </div>

            {/* Comment Section */}
            {selectedReturnStep && (
              <div className="space-y-2 pt-4 border-t">
                <label className="text-sm font-medium text-gray-700">
                  Add a comment explaining the reason for return:
                </label>
                <Textarea
                  placeholder="Enter reason for return..."
                  value={returnComment}
                  onChange={(e) => setReturnComment(e.target.value)}
                  className="min-h-[80px] resize-none"
                />
              </div>
            )}

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => {
                  setIsReturnStepSelectorOpen(false);
                  setReturnComment("");
                  setSelectedReturnStep(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => selectedReturnStep && handleReturnWithStep(selectedReturnStep)}
                disabled={!selectedReturnStep || !returnComment.trim()}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Return to {selectedReturnStep?.label || 'Selected Step'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function getEmptyPurchaseRequest(): PurchaseRequest {
  return {
    id: "",
    requestNumber: "",
    requestDate: new Date(),
    requiredDate: new Date(),
    requestType: 'General',
    priority: 'normal',
    status: PRStatus.Draft,
    departmentId: "",
    locationId: "",
    requestedBy: "",
    totalItems: 0,
    currency: 'THB',
    estimatedTotal: {
      amount: 0,
      currency: 'THB'
    },
    workflowStages: [],
    currentStage: WorkflowStage.requester,
  };
}
