"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ChevronDown, ChevronRight, Menu, PanelLeftClose, PanelLeftOpen, Cog } from "lucide-react";
import * as LucideIcons from "lucide-react";

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
      { name: "Inventory Adjustments", path: "/inventory-management/inventory-adjustments" },
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
      { name: "Workflow Management", path: "/system-administration/workflow/workflow-configuration" },
      { name: "General Settings", path: "/system-administration/settings" },
      { name: "Notification Preferences", path: "/system-administration/settings/notifications" },
      { name: "License Management", path: "/system-administration/license-management" },
      { 
        name: "Permission Management", 
        path: "/system-administration/permission-management",
        description: "Manage policies, roles, and access control",
        subItems: [
          { 
            name: "Policy Management", 
            path: "/system-administration/permission-management/policies",
            icon: "FileText",
            description: "Create and manage access control policies"
          },
          { 
            name: "Role Management", 
            path: "/system-administration/permission-management/roles",
            icon: "Users",
            description: "Create and manage user roles"
          },
          { 
            name: "Subscription Settings", 
            path: "/system-administration/permission-management/subscription",
            icon: "CreditCard",
            description: "Manage subscription packages and features"
          }
        ]
      },
      {
        name: "System Integrations", 
        path: "/system-administration/system-integrations",
        subItems: [
          { 
            name: "POS Integration", 
            path: "/system-administration/system-integrations/pos",
            subItems: [
              { name: "Dashboard", path: "/system-administration/system-integrations/pos" },
              { name: "Mapping", path: "/system-administration/system-integrations/pos/mapping/recipes" },
              { name: "Transactions", path: "/system-administration/system-integrations/pos/transactions" },
              { name: "Settings", path: "/system-administration/system-integrations/pos/settings" },
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

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onCollapseToggle?: (collapsed: boolean) => void;
}

export function Sidebar({ isOpen, onClose, onCollapseToggle }: SidebarProps) {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <>
      <Sheet open={isOpen && !isLargeScreen} onOpenChange={onClose}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="lg:hidden"
            size="icon"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px] top-[64px]">
          <SidebarContent menuItems={menuItems} />
        </SheetContent>
      </Sheet>

      <aside className={cn(
        "fixed z-40 h-[calc(100vh-64px)] bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-lg transition-all duration-300 ease-in-out",
        "top-[64px]",
        isOpen ? "translate-x-0" : "-translate-x-full",
        "lg:translate-x-0",
        isCollapsed ? "w-[60px]" : "w-[280px]"
      )}>
        <SidebarContent 
          menuItems={menuItems} 
          isCollapsed={isCollapsed}
          onToggleCollapse={() => {
            const newCollapsedState = !isCollapsed;
            setIsCollapsed(newCollapsedState);
            onCollapseToggle?.(newCollapsedState);
          }}
        />
      </aside>
    </>
  );
}

interface SidebarContentProps {
  menuItems: MenuItem[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

function SidebarContent({ menuItems, isCollapsed, onToggleCollapse }: SidebarContentProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [expandedSubItems, setExpandedSubItems] = useState<string[]>([]);

  const isExpanded = (title: string) => expandedItems.includes(title);
  const isSubExpanded = (name: string) => expandedSubItems.includes(name);

  const toggleExpand = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title)
        ? prev.filter((item) => item !== title)
        : [...prev, title]
    );
  };

  const toggleSubExpand = (name: string) => {
    setExpandedSubItems((prev) =>
      prev.includes(name)
        ? prev.filter((item) => item !== name)
        : [...prev, name]
    );
  };

  const handleItemClick = (item: MenuItem) => {
    if (item.subItems?.length > 0) {
      toggleExpand(item.title);
    } else {
      router.push(item.path);
    }
  };

  const handleSubItemClick = (subItem: SubMenuItem, event: React.MouseEvent) => {
    if (subItem.subItems?.length) {
      event.preventDefault();
      toggleSubExpand(subItem.name);
    }
  };

  // Find and remove Dashboard from menuItems
  const dashboardItem = menuItems.find(item => item.title === "Dashboard");
  const otherItems = menuItems.filter(item => item.title !== "Dashboard");

  return (
    <ScrollArea className="h-full">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {/* Dashboard as the first item */}
            {dashboardItem && (
              <div className="space-y-1">
                <Button
                  variant={pathname === dashboardItem.path ? "secondary" : "ghost"}
                  className={cn("w-full justify-between", {
                    "h-9": !isCollapsed,
                    "h-9 w-9 p-0": isCollapsed,
                  })}
                  onClick={() => handleItemClick(dashboardItem)}
                >
                  <span className="flex items-center">
                    <LucideIcons.LayoutDashboard className="h-4 w-4" />
                    {!isCollapsed && <span className="ml-1">{dashboardItem.title}</span>}
                  </span>
                  {!isCollapsed && (
                    isCollapsed ? (
                      <PanelLeftOpen className="h-4 w-4" />
                    ) : (
                      <PanelLeftClose className="h-4 w-4" />
                    )
                  )}
                </Button>

                {/* Show sub-items when expanded and not collapsed */}
                {!isCollapsed && isExpanded(dashboardItem.title) && dashboardItem.subItems?.length > 0 && (
                  <div className="pl-6 space-y-1">
                    {dashboardItem.subItems.map((subItem, subIndex) => {
                      const SubIconComponent = subItem.icon ? (LucideIcons as any)[subItem.icon] : undefined;
                      const isSubActive = pathname === subItem.path;

                      return (
                        <Button
                          key={subIndex}
                          variant={isSubActive ? "secondary" : "ghost"}
                          className="w-full justify-start h-auto p-2"
                          asChild
                        >
                          <Link href={subItem.path} className="flex items-center gap-3">
                            {SubIconComponent && <SubIconComponent className="h-4 w-4 flex-shrink-0" />}
                            <div className="text-left">
                              <span>{subItem.name}</span>
                              {subItem.description && (
                                <p className="text-xs text-muted-foreground">{subItem.description}</p>
                              )}
                            </div>
                          </Link>
                        </Button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Rest of the menu items */}
            {otherItems.map((item, index) => {
              const IconComponent = (LucideIcons as any)[item.icon] || LucideIcons.Circle;
              const isActive = pathname === item.path;
              const isItemExpanded = isExpanded(item.title);

              return (
                <div key={index} className="space-y-1">
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn("w-full justify-between", {
                      "h-9": !isCollapsed,
                      "h-9 w-9 p-0": isCollapsed,
                    })}
                    onClick={() => handleItemClick(item)}
                  >
                    <span className="flex items-center">
                      <IconComponent className="h-4 w-4" />
                      {!isCollapsed && <span className="ml-1">{item.title}</span>}
                    </span>
                    {!isCollapsed && item.subItems?.length > 0 && (
                      isItemExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )
                    )}
                  </Button>

                  {!isCollapsed && isItemExpanded && item.subItems?.length > 0 && (
                    <div className="pl-6 space-y-1">
                      {item.subItems.map((subItem, subIndex) => {
                        const SubIconComponent = subItem.icon ? (LucideIcons as any)[subItem.icon] : undefined;
                        const isSubActive = pathname === subItem.path;
                        const isSubItemExpanded = isSubExpanded(subItem.name);

                        return (
                          <div key={subIndex} className="space-y-1">
                            <Button
                              variant={isSubActive ? "secondary" : "ghost"}
                              className="w-full justify-start h-auto p-2"
                              onClick={(e) => handleSubItemClick(subItem, e)}
                              asChild={!subItem.subItems}
                            >
                              {subItem.subItems ? (
                                <div className="flex items-center justify-between w-full">
                                  <span className="flex items-center gap-3">
                                    {SubIconComponent && <SubIconComponent className="h-4 w-4 flex-shrink-0" />}
                                    <div className="text-left">
                                      <span>{subItem.name}</span>
                                      {subItem.description && (
                                        <p className="text-xs text-muted-foreground">{subItem.description}</p>
                                      )}
                                    </div>
                                  </span>
                                  {isSubItemExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                </div>
                              ) : (
                                <Link href={subItem.path} className="flex items-center gap-3">
                                  {SubIconComponent && <SubIconComponent className="h-4 w-4 flex-shrink-0" />}
                                  <div className="text-left">
                                    <span>{subItem.name}</span>
                                    {subItem.description && (
                                      <p className="text-xs text-muted-foreground">{subItem.description}</p>
                                    )}
                                  </div>
                                </Link>
                              )}
                            </Button>

                            {subItem.subItems && isSubItemExpanded && (
                              <div className="pl-6 space-y-1">
                                {subItem.subItems.map((subSubItem, subSubIndex) => {
                                  const SubSubIconComponent = subSubItem.icon ? (LucideIcons as any)[subSubItem.icon] : undefined;
                                  const isSubSubActive = pathname === subSubItem.path;

                                  return (
                                    <Button
                                      key={subSubIndex}
                                      variant={isSubSubActive ? "secondary" : "ghost"}
                                      className="w-full justify-start h-auto p-2"
                                      asChild
                                    >
                                      <Link href={subSubItem.path} className="flex items-center gap-3">
                                        {SubSubIconComponent && <SubSubIconComponent className="h-4 w-4 flex-shrink-0" />}
                                        <span>{subSubItem.name}</span>
                                      </Link>
                                    </Button>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </ScrollArea>
  );
}

export default Sidebar;
