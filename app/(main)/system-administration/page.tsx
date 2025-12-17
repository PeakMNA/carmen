import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Users, Workflow, Database, Settings, Cable, ShoppingCart } from "lucide-react";

export const dynamic = 'force-dynamic'

export default function SystemAdministrationPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">System Administration</h1>
        <p className="text-muted-foreground mt-2">
          Manage system settings, users, workflows, and integrations
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* User Management Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">User Management</CardTitle>
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Manage user accounts and permissions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create, edit, and manage user accounts and assign role-based permissions.
            </p>
            <Button asChild className="w-full" variant="default">
              <Link href="/system-administration/user-management" className="flex items-center justify-between">
                Manage Users
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Workflow Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Workflow</CardTitle>
              <Workflow className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Configure approval workflows
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Set up and manage approval workflows for purchase requests and other documents.
            </p>
            <Button asChild className="w-full" variant="default">
              <Link href="/system-administration/workflow" className="flex items-center justify-between">
                Configure Workflows
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* System Integration Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">System Integrations</CardTitle>
              <Cable className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Configure external system integrations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Set up integrations with POS, ERP, and other external systems.
            </p>
            <Button asChild className="w-full" variant="default">
              <Link href="/system-administration/system-integration" className="flex items-center justify-between">
                Manage Integrations
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Account Code Mapping Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Account Code Mapping</CardTitle>
              <Database className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Manage financial account codes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Map internal accounts to external accounting system codes.
            </p>
            <Button asChild className="w-full" variant="default">
              <Link href="/system-administration/account-code-mapping" className="flex items-center justify-between">
                Manage Account Codes
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* System Settings Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">System Settings</CardTitle>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Configure global system settings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Manage system-wide configurations and preferences.
            </p>
            <Button asChild className="w-full" variant="default">
              <Link href="/system-administration/settings" className="flex items-center justify-between">
                Configure Settings
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Quick Access Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">Quick Access</CardTitle>
              <Settings className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Frequently used system functions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button asChild variant="outline" className="w-full justify-start text-left" size="sm">
                <Link href="/system-administration/system-integration/pos/transactions" className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    POS Transactions
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start text-left" size="sm">
                <Link href="/system-administration/user-management" className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    User Management
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-start text-left" size="sm">
                <Link href="/system-administration/workflow" className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Workflow className="h-4 w-4 mr-2" />
                    Workflow Management
                  </div>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}