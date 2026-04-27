import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { ArrowRight, Database, RefreshCcw, ShoppingCart, Cable } from "lucide-react";

export default function SystemIntegrationPage() {
  return (
    <div className="px-6 py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">System Integration</h1>
        <p className="text-muted-foreground mt-2">
          Configure and manage integrations with external systems
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* POS Integration Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">POS Integration</CardTitle>
              <ShoppingCart className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Map POS items to recipes and manage transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with point-of-sale systems to sync sales data and recipe mapping.
            </p>
            <Button asChild className="w-full" variant="default">
              <Link href="/system-administration/system-integration/pos" className="flex items-center justify-between">
                Configure POS
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* ERP Integration Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">ERP Integration</CardTitle>
              <Database className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Sync data with enterprise resource planning systems
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Connect with your ERP system to synchronize inventory, finance, and procurement data.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="#" className="flex items-center justify-between">
                Coming Soon
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* API Integration Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">API Management</CardTitle>
              <Cable className="h-5 w-5 text-muted-foreground" />
            </div>
            <CardDescription>
              Manage API keys and external system connections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Configure API credentials and manage external system integrations.
            </p>
            <Button asChild className="w-full" variant="outline">
              <Link href="#" className="flex items-center justify-between">
                Coming Soon
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 