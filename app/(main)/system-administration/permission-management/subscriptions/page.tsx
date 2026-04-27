'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, 
  Settings, 
  BarChart3, 
  TrendingUp,
  Shield,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

import { PackageSelector } from '@/components/permissions/subscription/package-selector';
import { ResourceActivation } from '@/components/permissions/subscription/resource-activation';
import { BillingPaymentInfo } from '@/components/permissions/subscription/billing-payment-info';
import { UsageAnalytics } from '@/components/permissions/subscription/usage-analytics';
import { mockSubscriptionPackages, mockCurrentSubscription } from '@/lib/mock-data/permission-subscriptions';

export default function SubscriptionsPage() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="px-6 py-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/system-administration/permission-management">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Permissions
            </Button>
          </Link>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold tracking-tight">Subscription Management</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl">
              Complete subscription management interface for Carmen ERP - manage packages, 
              activate resources, handle billing, and analyze usage patterns.
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Plan</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCurrentSubscription.packageName}</div>
            <p className="text-xs text-muted-foreground">
              ${mockCurrentSubscription.currentPrice.amount}/month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCurrentSubscription.currentUsage.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              {((mockCurrentSubscription.currentUsage.activeUsers / 50) * 100).toFixed(0)}% capacity
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockCurrentSubscription.currentUsage.storageUsedGB.toFixed(1)} GB
            </div>
            <p className="text-xs text-muted-foreground">
              {((mockCurrentSubscription.currentUsage.storageUsedGB / 25) * 100).toFixed(0)}% of limit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">API Usage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(mockCurrentSubscription.currentUsage.apiCallsMade / 1000).toFixed(0)}K
            </div>
            <p className="text-xs text-muted-foreground">
              {((mockCurrentSubscription.currentUsage.apiCallsMade / 300000) * 100).toFixed(0)}% of monthly limit
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Subscription</CardTitle>
                <CardDescription>
                  Your active subscription package and key metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Package:</span>
                  <span className="text-sm">{mockCurrentSubscription.packageName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Status:</span>
                  <span className="text-sm capitalize">{mockCurrentSubscription.status}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Billing Cycle:</span>
                  <span className="text-sm capitalize">{mockCurrentSubscription.billingCycle}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Next Billing:</span>
                  <span className="text-sm">{mockCurrentSubscription.nextBillingDate.toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Auto Renewal:</span>
                  <span className="text-sm">{mockCurrentSubscription.autoRenewal ? 'Enabled' : 'Disabled'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Common subscription management tasks
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab('packages')}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Change Package
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab('resources')}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Manage Resources
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab('billing')}
                >
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Update Billing
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => setActiveTab('analytics')}
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  View Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="packages" className="space-y-6">
          <PackageSelector
            packages={mockSubscriptionPackages}
            currentSubscription={mockCurrentSubscription}
            onPackageSelect={(pkg) => {
              console.log('Package selected:', pkg);
              // In a real app, this would trigger package selection logic
            }}
            onUpgrade={(comparison) => {
              console.log('Upgrade requested:', comparison);
              // In a real app, this would trigger upgrade workflow
            }}
            onDowngrade={(comparison) => {
              console.log('Downgrade requested:', comparison);
              // In a real app, this would trigger downgrade workflow
            }}
          />
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <ResourceActivation
            package={mockSubscriptionPackages.find(p => p.type === mockCurrentSubscription.packageType)}
            subscription={mockCurrentSubscription}
            showAnalytics={true}
            onPackageUpdate={(pkg) => {
              console.log('Package updated:', pkg);
              // In a real app, this would update the package configuration
            }}
            onResourceToggle={(resource, enabled) => {
              console.log(`Resource ${resource} ${enabled ? 'enabled' : 'disabled'}`);
              // In a real app, this would toggle resource activation
            }}
            onLimitUpdate={(resource, limits) => {
              console.log(`Limits updated for ${resource}:`, limits);
              // In a real app, this would update resource limits
            }}
          />
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <BillingPaymentInfo
            subscription={mockCurrentSubscription}
            onPaymentMethodUpdate={(method) => {
              console.log('Payment method updated:', method);
              // In a real app, this would update the payment method
            }}
            onBillingAddressUpdate={(address) => {
              console.log('Billing address updated:', address);
              // In a real app, this would update the billing address
            }}
            onInvoiceSettingsUpdate={(settings) => {
              console.log('Invoice settings updated:', settings);
              // In a real app, this would update invoice settings
            }}
            onDownloadInvoice={(invoiceId) => {
              console.log('Download invoice:', invoiceId);
              // In a real app, this would trigger invoice download
            }}
          />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <UsageAnalytics
            subscription={mockCurrentSubscription}
            onExportData={(period, format) => {
              console.log(`Export data for ${period} in ${format} format`);
              // In a real app, this would export analytics data
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}