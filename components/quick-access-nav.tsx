"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, ShoppingCart, FileText, Database, Users, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface QuickLink {
  name: string
  path: string
  icon: React.ElementType
  description?: string
}

const quickLinks: QuickLink[] = [
  {
    name: "POS Transactions",
    path: "/system-administration/system-integration/pos/transactions",
    icon: FileText,
    description: "View and manage POS transactions"
  },
  {
    name: "User Management",
    path: "/system-administration/user-management",
    icon: Users,
    description: "Manage user accounts and permissions"
  },
  {
    name: "System Settings",
    path: "/system-administration",
    icon: Settings,
    description: "Configure system settings"
  },
  {
    name: "POS Integration",
    path: "/system-administration/system-integration/pos",
    icon: ShoppingCart,
    description: "Configure POS system integrations"
  },
]

export function QuickAccessNav() {
  const pathname = usePathname()
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="ml-2">
          <Menu className="h-4 w-4 mr-1" />
          Quick Access
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[240px]">
        <DropdownMenuLabel>Navigation Shortcuts</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {quickLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.path
          
          return (
            <DropdownMenuItem key={link.path} asChild className={isActive ? "bg-muted" : ""}>
              <Link href={link.path} className="flex items-start gap-2 cursor-pointer">
                <Icon className="h-4 w-4 mt-0.5" />
                <div>
                  <div className="font-medium">{link.name}</div>
                  {link.description && (
                    <div className="text-xs text-muted-foreground">{link.description}</div>
                  )}
                </div>
              </Link>
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 