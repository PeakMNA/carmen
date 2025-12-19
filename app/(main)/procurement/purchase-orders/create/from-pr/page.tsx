/**
 * Create PO from Purchase Requests Page
 *
 * @description Dedicated page for creating Purchase Orders from approved
 * Purchase Requests. Provides a full-page experience with workflow guidance.
 *
 * @implementation
 * - Uses CreatePOFromPR component for PR selection and summary
 * - Groups PRs by vendor + currency for automatic PO creation
 * - Stores grouped data in localStorage for cross-page navigation
 * - Routes to single PO create or bulk create based on group count
 *
 * @design-language (consistent with PO Summary dialog)
 * - Header with Package icon in bg-primary/10 circle
 * - Info banner (bg-blue-50, border-blue-200): Explains automatic grouping
 * - Workflow indicator (bg-muted/50): Shows 3-step process visually
 * - Main card with border-l-4 border-l-primary accent
 *
 * @workflow
 * 1. User navigates from "New PO" > "Create from Purchase Requests"
 * 2. Page shows info banner explaining automatic grouping
 * 3. Workflow indicator shows: Select PRs → Review Summary → Create PO(s)
 * 4. User selects PRs in the embedded CreatePOFromPR component
 * 5. On create, data is stored and user is routed to appropriate create page
 *
 * @navigation
 * - Single vendor+currency group → /procurement/purchase-orders/create?mode=fromPR&grouped=true
 * - Multiple groups → /procurement/purchase-orders/create/bulk
 *
 * @see UC-PO-001 in docs/app/procurement/purchase-orders/UC-purchase-orders.md
 */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, FileText, Package, ChevronRight, Info } from "lucide-react";
import CreatePOFromPR from "../../components/createpofrompr";
import { PurchaseRequest } from "@/lib/types";

export default function CreatePOFromPRPage() {
  const router = useRouter();

  /**
   * Handle PR selection callback from CreatePOFromPR component
   *
   * Groups selected PRs by vendor + currency, stores in localStorage,
   * and navigates to the appropriate creation page.
   *
   * @param selectedPRs - Array of selected Purchase Requests
   *
   * @note Uses localStorage for cross-page state management since
   * URL parameters would become unwieldy with complex PR data.
   */
  const handleSelectPRs = (selectedPRs: PurchaseRequest[]) => {
    if (selectedPRs.length > 0) {
      // Group PRs by vendor + currency - each unique combination becomes a separate PO
      // This ensures each PO has consistent vendor and currency for proper invoicing
      const groupedPRs = selectedPRs.reduce((groups, pr) => {
        const prData = pr as any;
        const key = `${prData.vendor}-${prData.currency}`;
        if (!groups[key]) {
          groups[key] = {
            vendor: prData.vendor,
            vendorId: prData.vendorId,
            currency: prData.currency,
            deliveryDate: prData.deliveryDate,
            prs: [],
            totalAmount: 0,
            sourcePRs: [] as string[]
          };
        }
        groups[key].prs.push(prData);
        groups[key].totalAmount += prData.totalAmount || 0;
        groups[key].sourcePRs.push(prData.refNumber);
        return groups;
      }, {} as Record<string, {
        vendor: string;
        vendorId: number;
        currency: string;
        deliveryDate: Date;
        prs: any[];
        totalAmount: number;
        sourcePRs: string[];
      }>);

      // Store grouped PRs for PO creation
      try {
        if (typeof window !== 'undefined') {
          localStorage.setItem('groupedPurchaseRequests', JSON.stringify(groupedPRs));
          localStorage.setItem('selectedPurchaseRequests', JSON.stringify(selectedPRs));
        }
      } catch (error) {
        console.error('Error storing grouped PRs:', error);
      }

      // Navigate to PO creation page with grouped data
      const groupCount = Object.keys(groupedPRs).length;
      if (groupCount === 1) {
        // Single PO - go directly to creation page
        router.push('/procurement/purchase-orders/create?mode=fromPR&grouped=true');
      } else {
        // Multiple POs - go to bulk creation page
        router.push('/procurement/purchase-orders/create/bulk');
      }
    }
  };

  const handleBack = () => {
    router.push('/procurement/purchase-orders');
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header Section */}
      <div className="mb-6">
        <Button variant="ghost" size="sm" onClick={handleBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Purchase Orders
        </Button>

        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Package className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create PO from Purchase Requests</h1>
            <p className="text-muted-foreground mt-1">
              Select approved Purchase Requests to convert into Purchase Orders
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded-lg mb-6">
        <Info className="h-5 w-5 flex-shrink-0" />
        <div className="text-sm">
          <span className="font-medium">Automatic Grouping:</span> Selected PRs will be automatically grouped by{" "}
          <span className="font-medium">vendor</span> and <span className="font-medium">currency</span> to create separate Purchase Orders.
        </div>
      </div>

      {/* Workflow Indicator */}
      <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground bg-muted/50 px-4 py-3 rounded-lg mb-6">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          <span>Select PRs</span>
        </div>
        <ChevronRight className="h-4 w-4" />
        <div className="flex items-center gap-2">
          <span>Review Summary</span>
        </div>
        <ChevronRight className="h-4 w-4" />
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4" />
          <span>Create PO(s)</span>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <h2 className="font-semibold">Approved Purchase Requests</h2>
          </div>
          <CreatePOFromPR onSelectPRs={handleSelectPRs} />
        </CardContent>
      </Card>
    </div>
  );
}