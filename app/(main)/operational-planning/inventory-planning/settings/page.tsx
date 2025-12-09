"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import {
  ArrowLeft,
  Settings,
  Save,
  RotateCcw,
  Bell,
  Zap,
  Sliders,
  AlertTriangle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Settings interface
interface InventoryPlanningSettings {
  // Default Parameters
  defaultServiceLevel: string
  orderCostPerOrder: number
  holdingCostRate: number
  defaultLeadTime: number

  // Alert Thresholds
  deadStockThreshold: number
  lowStockAlertEnabled: boolean
  deadStockAlertEnabled: boolean
  overstockAlertEnabled: boolean

  // Notification Settings
  emailNotificationsEnabled: boolean
  notificationEmail: string
  digestFrequency: string

  // Automation Settings
  autoApplyLowRisk: boolean
  autoGenerateWeekly: boolean
  syncWithProcurement: boolean
}

// Default settings
const defaultSettings: InventoryPlanningSettings = {
  defaultServiceLevel: "95",
  orderCostPerOrder: 50.00,
  holdingCostRate: 22,
  defaultLeadTime: 7,
  deadStockThreshold: 90,
  lowStockAlertEnabled: true,
  deadStockAlertEnabled: true,
  overstockAlertEnabled: true,
  emailNotificationsEnabled: true,
  notificationEmail: "inventory@example.com",
  digestFrequency: "weekly",
  autoApplyLowRisk: false,
  autoGenerateWeekly: true,
  syncWithProcurement: true,
}

export default function SettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<InventoryPlanningSettings>(defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)

  // Update setting
  const updateSetting = <K extends keyof InventoryPlanningSettings>(
    key: K,
    value: InventoryPlanningSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  // Save settings
  const handleSave = () => {
    // In a real app, this would save to an API
    toast({
      title: "Settings Saved",
      description: "Your inventory planning settings have been updated.",
    })
    setHasChanges(false)
  }

  // Reset to defaults
  const handleReset = () => {
    setSettings(defaultSettings)
    setHasChanges(true)
    toast({
      title: "Settings Reset",
      description: "Settings have been reset to defaults. Click Save to confirm.",
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/operational-planning/inventory-planning">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Settings className="h-7 w-7 text-gray-600" />
              Inventory Planning Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure default parameters and automation for inventory optimization
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Default Parameters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Default Parameters</CardTitle>
            </div>
            <CardDescription>
              Set default values for inventory calculations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="serviceLevel">Default Service Level</Label>
                <Select
                  value={settings.defaultServiceLevel}
                  onValueChange={(value) => updateSetting("defaultServiceLevel", value)}
                >
                  <SelectTrigger id="serviceLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="90">90%</SelectItem>
                    <SelectItem value="95">95%</SelectItem>
                    <SelectItem value="97">97%</SelectItem>
                    <SelectItem value="99">99%</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Target service level for safety stock calculations
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="orderCost">Order Cost per Order ($)</Label>
                <Input
                  id="orderCost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={settings.orderCostPerOrder}
                  onChange={(e) => updateSetting("orderCostPerOrder", parseFloat(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Fixed cost per purchase order for EOQ calculation
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="holdingRate">Holding Cost Rate (%)</Label>
                <Input
                  id="holdingRate"
                  type="number"
                  min="0"
                  max="100"
                  value={settings.holdingCostRate}
                  onChange={(e) => updateSetting("holdingCostRate", parseInt(e.target.value) || 0)}
                />
                <p className="text-xs text-muted-foreground">
                  Annual holding cost as percentage of inventory value
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="leadTime">Default Lead Time (days)</Label>
                <Input
                  id="leadTime"
                  type="number"
                  min="1"
                  value={settings.defaultLeadTime}
                  onChange={(e) => updateSetting("defaultLeadTime", parseInt(e.target.value) || 1)}
                />
                <p className="text-xs text-muted-foreground">
                  Default supplier lead time for reorder calculations
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert Thresholds */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <CardTitle className="text-lg">Alert Thresholds</CardTitle>
            </div>
            <CardDescription>
              Configure when inventory alerts are triggered
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="deadStockThreshold">Dead Stock Threshold (days)</Label>
              <Input
                id="deadStockThreshold"
                type="number"
                min="30"
                max="365"
                className="w-[200px]"
                value={settings.deadStockThreshold}
                onChange={(e) => updateSetting("deadStockThreshold", parseInt(e.target.value) || 90)}
              />
              <p className="text-xs text-muted-foreground">
                Items without movement for this many days are flagged as dead stock
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Stock Warning</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert when stock falls below reorder point
                  </p>
                </div>
                <Switch
                  checked={settings.lowStockAlertEnabled}
                  onCheckedChange={(checked) => updateSetting("lowStockAlertEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dead Stock Warning</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert when items exceed dead stock threshold
                  </p>
                </div>
                <Switch
                  checked={settings.deadStockAlertEnabled}
                  onCheckedChange={(checked) => updateSetting("deadStockAlertEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Overstock Warning</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert when stock exceeds optimal levels
                  </p>
                </div>
                <Switch
                  checked={settings.overstockAlertEnabled}
                  onCheckedChange={(checked) => updateSetting("overstockAlertEnabled", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Notification Settings</CardTitle>
            </div>
            <CardDescription>
              Configure how you receive inventory planning notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive inventory planning alerts via email
                </p>
              </div>
              <Switch
                checked={settings.emailNotificationsEnabled}
                onCheckedChange={(checked) => updateSetting("emailNotificationsEnabled", checked)}
              />
            </div>

            {settings.emailNotificationsEnabled && (
              <>
                <Separator />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="notificationEmail">Notification Email</Label>
                    <Input
                      id="notificationEmail"
                      type="email"
                      value={settings.notificationEmail}
                      onChange={(e) => updateSetting("notificationEmail", e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="digestFrequency">Digest Frequency</Label>
                    <Select
                      value={settings.digestFrequency}
                      onValueChange={(value) => updateSetting("digestFrequency", value)}
                    >
                      <SelectTrigger id="digestFrequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Automation Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              <CardTitle className="text-lg">Automation Settings</CardTitle>
            </div>
            <CardDescription>
              Configure automated inventory planning actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-apply Low Risk Recommendations</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically apply recommendations with low risk score
                </p>
              </div>
              <Switch
                checked={settings.autoApplyLowRisk}
                onCheckedChange={(checked) => updateSetting("autoApplyLowRisk", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-generate Weekly Analysis</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically run optimization analysis every week
                </p>
              </div>
              <Switch
                checked={settings.autoGenerateWeekly}
                onCheckedChange={(checked) => updateSetting("autoGenerateWeekly", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sync with Procurement</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically update purchase request defaults based on recommendations
                </p>
              </div>
              <Switch
                checked={settings.syncWithProcurement}
                onCheckedChange={(checked) => updateSetting("syncWithProcurement", checked)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4 justify-end pt-4 border-t">
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset to Defaults
        </Button>
        <Button onClick={handleSave} disabled={!hasChanges}>
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </Button>
      </div>

      {/* Unsaved Changes Warning */}
      {hasChanges && (
        <div className="fixed bottom-4 right-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow-lg flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <span className="text-sm text-yellow-800">You have unsaved changes</span>
          <Button size="sm" onClick={handleSave}>
            Save Now
          </Button>
        </div>
      )}
    </div>
  )
}
