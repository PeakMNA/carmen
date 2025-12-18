"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import * as LucideIcons from "lucide-react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Collapsible as CollapsibleRoot, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface MenuItem {
  title: string;
  path: string;
  icon: string;
  subItems: Array<SubMenuItem>;
}

interface SubMenuItem {
  name: string;
  path: string;
  icon?: string;
  description?: string;
  subItems?: Array<{
    name: string;
    path: string;
    icon?: string;
    description?: string;
    subItems?: Array<{
      name: string;
      path: string;
      icon?: string;
      description?: string;
    }>;
  }>;
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    path: "/dashboard",
    icon: "LayoutDashboard",
    subItems: [],
  },
  {
    title: "Procurement",
    path: "/procurement",
    icon: "ShoppingCart",
    subItems: [
      { name: "My Approvals", path: "/procurement/my-approvals" },
      { name: "Purchase Requests", path: "/procurement/purchase-requests" },
      { name: "Purchase Orders", path: "/procurement/purchase-orders" },
      { name: "Goods Received Note", path: "/procurement/goods-received-note" },
      { name: "Credit Notes", path: "/procurement/credit-note" },
      { name: "Purchase Request Templates", path: "/procurement/purchase-request-templates" },
    ],
  },
  {
    title: "Product Management",
    path: "/product-management",
    icon: "Package",
    subItems: [
      { name: "Products", path: "/product-management/products" },
      { name: "Categories", path: "/product-management/categories" },
      { name: "Units", path: "/product-management/units" },
      { name: "Reports", path: "/product-management/reports" },
    ],
  },
  {
    title: "Vendor Management",
    path: "/vendor-management",
    icon: "Users",
    subItems: [
      { 
        name: "Vendor Directory", 
        path: "/vendor-management/manage-vendors",
        icon: "Users"
      },
      { 
        name: "Pricelist Templates", 
        path: "/vendor-management/templates",
        icon: "FileText"
      },
      { 
        name: "Requests for Pricing", 
        path: "/vendor-management/campaigns",
        icon: "Mail"
      },
      { 
        name: "Price Lists", 
        path: "/vendor-management/pricelists",
        icon: "ListChecks"
      },
      { 
        name: "Vendor Entry", 
        path: "/vendor-management/vendor-portal/sample",
        icon: "ExternalLink",
        description: "Simple vendor price entry interface"
      },
    ],
  },
  {
    title: "Store Operations",
    path: "/store-operations",
    icon: "Store",
    subItems: [
      { name: "Store Requisitions", path: "/store-operations/store-requisitions" },
      { name: "Stock Replenishment", path: "/store-operations/stock-replenishment" },
      { name: "Stock Transfers", path: "/store-operations/stock-transfers" },
      { name: "Stock Issues", path: "/store-operations/stock-issues" },
      { name: "Wastage Reporting", path: "/store-operations/wastage-reporting" },
    ],
  },
  {
    title: "Inventory Management",
    path: "/inventory-management",
    icon: "Package",
    subItems: [
      { 
        name: "Stock Overview", 
        path: "/inventory-management/stock-overview",
        subItems: [
          { name: "Overview", path: "/inventory-management/stock-overview" },
          { name: "Inventory Balance", path: "/inventory-management/stock-overview/inventory-balance" },
          { name: "Stock Cards", path: "/inventory-management/stock-overview/stock-cards" },
          { name: "Slow Moving", path: "/inventory-management/stock-overview/slow-moving" },
          { name: "Inventory Aging", path: "/inventory-management/stock-overview/inventory-aging" }
        ]
      },
      { name: "Transactions", path: "/inventory-management/transactions" },
      { name: "Inventory Adjustments", path: "/inventory-management/inventory-adjustments" },
      { name: "Transaction Categories", path: "/inventory-management/transaction-categories" },
      { name: "Spot Check", path: "/inventory-management/spot-check" },
      { name: "Physical Count", path: "/inventory-management/physical-count-management" },
      { name: "Period End", path: "/inventory-management/period-end" },
    ],
  },
  {
    title: "Operational Planning",
    path: "/operational-planning",
    icon: "CalendarClock",
    subItems: [
      {
        name: "Recipe Management",
        path: "/operational-planning/recipe-management",
        subItems: [
          { name: "Recipe Library", path: "/operational-planning/recipe-management/recipes" },
          { name: "Categories", path: "/operational-planning/recipe-management/categories" },
          { name: "Cuisine Types", path: "/operational-planning/recipe-management/cuisine-types" },
          { name: "Equipment", path: "/operational-planning/recipe-management/equipment" },
          { name: "Recipe Units", path: "/operational-planning/recipe-management/units" },
        ]
      },
      { name: "Menu Engineering", path: "/operational-planning/menu-engineering" },
      { name: "Demand Forecasting", path: "/operational-planning/demand-forecasting" },
      { name: "Inventory Planning", path: "/operational-planning/inventory-planning" },
    ],
  },
  {
    title: "Reporting & Analytics",
    path: "/reporting-analytics",
    icon: "BarChart2",
    subItems: [
      { name: "Operational Reports", path: "/reporting-analytics/operational-reports" },
      { name: "Financial Reports", path: "/reporting-analytics/financial-reports" },
      { name: "Inventory Reports", path: "/reporting-analytics/inventory-reports" },
      { name: "Vendor Performance", path: "/reporting-analytics/vendor-performance" },
      { name: "Cost Analysis", path: "/reporting-analytics/cost-analysis" },
      { name: "Sales Analysis", path: "/reporting-analytics/sales-analysis" },
    ],
  },
  {
    title: "Finance",
    path: "/finance",
    icon: "DollarSign",
    subItems: [
      { name: "Account Code Mapping", path: "/finance/account-code-mapping" },
      { name: "Currency Management", path: "/finance/currency-management" },
      { name: "Exchange Rates", path: "/finance/exchange-rates" },
      { name: "Department and Cost Center", path: "/finance/department-list" },
      { name: "Budget Planning and Control", path: "/finance/budget-planning-and-control" },
    ],
  },
  {
    title: "System Administration",
    path: "/system-administration",
    icon: "Settings",
    subItems: [
      { name: "User Management", path: "/system-administration/user-management" },
      { name: "Location Management", path: "/system-administration/location-management" },
      { name: "Delivery Points", path: "/system-administration/delivery-points" },
      { name: "Workflow Management", path: "/system-administration/workflow/workflow-configuration" },
      { name: "General Settings", path: "/system-administration/settings" },
      { name: "Notification Preferences", path: "/system-administration/settings/notifications" },
      { name: "License Management", path: "/system-administration/license-management" },
      { 
        name: "Permission Management", 
        path: "/system-administration/permission-management",
        subItems: [
          { 
            name: "Policy Management", 
            path: "/system-administration/permission-management/policies",
            icon: "FileText"
          },
          { 
            name: "Role Management", 
            path: "/system-administration/permission-management/roles",
            icon: "Users"
          },
          { 
            name: "Subscription Settings", 
            path: "/system-administration/permission-management/subscription",
            icon: "CreditCard"
          }
        ]
      },
      {
        name: "System Integrations",
        path: "/system-administration/system-integration",
        subItems: [
          {
            name: "POS Integration",
            path: "/system-administration/system-integration/pos",
            subItems: [
              { name: "Dashboard", path: "/system-administration/system-integration/pos" },
              { name: "Mapping", path: "/system-administration/system-integration/pos?tab=mapping" },
              { name: "Transactions", path: "/system-administration/system-integration/pos?tab=transactions" },
              { name: "Configuration", path: "/system-administration/system-integration/pos?tab=config" },
              { name: "Reports", path: "/system-administration/system-integration/pos?tab=reports" },
            ]
          },
        ]
      },
    ],
  },
  {
    title: "Help & Support",
    path: "/help-support",
    icon: "HelpCircle",
    subItems: [
      { name: "User Manuals", path: "/help-support/user-manuals" },
      { name: "Video Tutorials", path: "/help-support/video-tutorials" },
      { name: "FAQs", path: "/help-support/faqs" },
      { name: "Support Ticket System", path: "/help-support/support-ticket-system" },
      { name: "System Updates and Release Notes", path: "/help-support/system-updates-and-release-notes" },
    ],
  },
  {
    title: "Style Guide",
    path: "/style-guide",
    icon: "Palette",
    subItems: [],
  },
];

// Recursive component for nested menu items
function MenuItemComponent({ item, level = 0 }: { item: MenuItem | SubMenuItem; level?: number }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = React.useState(false);

  // Helper to get the label (title for MenuItem, name for SubMenuItem)
  const getLabel = (item: MenuItem | SubMenuItem): string => {
    return 'title' in item ? item.title : item.name;
  };

  const IconComponent = item.icon ? (LucideIcons as any)[item.icon] || LucideIcons.Circle : LucideIcons.Circle;
  const isActive = pathname === item.path;
  const hasSubItems = 'subItems' in item && item.subItems && item.subItems.length > 0;

  // Check if any sub-item is active to keep parent expanded
  const isParentOfActive = hasSubItems && item.subItems?.some((subItem: any) => 
    pathname === subItem.path || 
    (subItem.subItems && subItem.subItems.some((subSubItem: any) => pathname === subSubItem.path))
  );

  React.useEffect(() => {
    if (isParentOfActive) {
      setIsOpen(true);
    }
  }, [isParentOfActive]);

  if (!hasSubItems) {
    // Simple menu item without sub-items
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={isActive} tooltip={getLabel(item)}>
          <Link href={item.path} className="flex items-center gap-2">
            {level === 0 && <IconComponent className="w-4 h-4" />}
            <span>{getLabel(item)}</span>
            {'description' in item && item.description && (
              <span className="text-xs text-muted-foreground ml-auto max-w-[100px] truncate">
                {item.description}
              </span>
            )}
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // Menu item with sub-items
  return (
    <SidebarMenuItem>
      <CollapsibleRoot open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <SidebarMenuButton isActive={isActive} className="w-full justify-between">
            <div className="flex items-center gap-2">
              {level === 0 && <IconComponent className="w-4 h-4" />}
              <span>{getLabel(item)}</span>
            </div>
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.subItems?.map((subItem, index) => (
              <MenuItemComponent key={index} item={subItem} level={level + 1} />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </CollapsibleRoot>
    </SidebarMenuItem>
  );
}

// App Sidebar Component
export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="border-b border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="text-sm font-medium text-muted-foreground">
            Navigation
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {menuItems.map((item, index) => (
              <MenuItemComponent key={index} item={item} />
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <div className="px-2 py-1">
          <div className="text-xs text-muted-foreground">
            © 2024 Carmen ERP
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

// Layout wrapper with SidebarProvider
export function SidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-1 flex-col">
          {children}
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

// Default export for backward compatibility
export default AppSidebar;