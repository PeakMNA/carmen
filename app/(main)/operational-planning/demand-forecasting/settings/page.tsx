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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  ArrowLeft,
  Settings,
  Save,
  RotateCcw,
  Sliders,
  Bell,
  Zap,
  Database,
  AlertTriangle
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Settings interface
interface DemandForecastingSettings {
  // Default Forecast Parameters
  defaultForecastPeriod: string
  defaultForecastMethod: string
  defaultServiceLevel: string
  historicalDataPeriod: number

  // Smoothing Parameters
  exponentialAlpha: number
  movingAverageWindow: number
  seasonalityPeriod: number

  // Alert Thresholds
  lowAccuracyThreshold: number
  highVariabilityThreshold: number
  stockoutRiskDays: number

  // Notification Settings
  accuracyAlertEnabled: boolean
  stockoutAlertEnabled: boolean
  trendChangeAlertEnabled: boolean
  emailNotificationsEnabled: boolean
  notificationEmail: string
  alertFrequency: string

  // Automation Settings
  autoGenerateForecasts: boolean
  autoRefreshFrequency: string
  autoApplyOptimizations: boolean
  syncWithInventoryPlanning: boolean
}

// Default settings
const defaultSettings: DemandForecastingSettings = {
  defaultForecastPeriod: "14",
  defaultForecastMethod: "exponential_smoothing",
  defaultServiceLevel: "95",
  historicalDataPeriod: 90,

  exponentialAlpha: 0.3,
  movingAverageWindow: 30,
  seasonalityPeriod: 365,

  lowAccuracyThreshold: 70,
  highVariabilityThreshold: 25,
  stockoutRiskDays: 7,

  accuracyAlertEnabled: true,
  stockoutAlertEnabled: true,
  trendChangeAlertEnabled: true,
  emailNotificationsEnabled: true,
  notificationEmail: "inventory@example.com",
  alertFrequency: "daily",

  autoGenerateForecasts: true,
  autoRefreshFrequency: "weekly",
  autoApplyOptimizations: false,
  syncWithInventoryPlanning: true
}

export default function DemandForecastingSettingsPage() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<DemandForecastingSettings>(defaultSettings)
  const [hasChanges, setHasChanges] = useState(false)

  // Update setting
  const updateSetting = <K extends keyof DemandForecastingSettings>(
    key: K,
    value: DemandForecastingSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }))
    setHasChanges(true)
  }

  // Save settings
  const handleSave = () => {
    toast({
      title: "Settings Saved",
      description: "Your demand forecasting settings have been updated."
    })
    setHasChanges(false)
  }

  // Reset to defaults
  const handleReset = () => {
    setSettings(defaultSettings)
    setHasChanges(true)
    toast({
      title: "Settings Reset",
      description: "Settings have been reset to defaults. Click Save to confirm."
    })
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-4">
          <Link href="/operational-planning/demand-forecasting">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <Settings className="h-7 w-7 text-gray-600" />
              Forecasting Settings
            </h1>
            <p className="text-sm text-muted-foreground">
              Configure default parameters and automation for demand forecasting
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Default Forecast Parameters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sliders className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Default Forecast Parameters</CardTitle>
            </div>
            <CardDescription>
              Set default values for new forecasts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="forecastPeriod">Default Forecast Period</Label>
                <Select
                  value={settings.defaultForecastPeriod}
                  onValueChange={(value) => updateSetting("defaultForecastPeriod", value)}
                >
                  <SelectTrigger id="forecastPeriod">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 days</SelectItem>
                    <SelectItem value="14">14 days</SelectItem>
                    <SelectItem value="30">30 days</SelectItem>
                    <SelectItem value="60">60 days</SelectItem>
                    <SelectItem value="90">90 days</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Default period for new forecast generation
                </p>
              </div>

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
                    <SelectItem value="99">99%</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Target service level for safety stock calculations
                </p>
              </div>

              <div className="space-y-3">
                <Label>Default Forecast Method</Label>
                <RadioGroup
                  value={settings.defaultForecastMethod}
                  onValueChange={(value) => updateSetting("defaultForecastMethod", value)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="moving_average" id="ma" />
                    <Label htmlFor="ma" className="font-normal">Moving Average</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="exponential_smoothing" id="es" />
                    <Label htmlFor="es" className="font-normal">Exponential Smoothing</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="linear_regression" id="lr" />
                    <Label htmlFor="lr" className="font-normal">Linear Regression</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="seasonal" id="sd" />
                    <Label htmlFor="sd" className="font-normal">Seasonal Decomposition</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="historicalPeriod">Historical Data Period (days)</Label>
                <Input
                  id="historicalPeriod"
                  type="number"
                  min="30"
                  max="365"
                  value={settings.historicalDataPeriod}
                  onChange={(e) => updateSetting("historicalDataPeriod", parseInt(e.target.value) || 90)}
                />
                <p className="text-xs text-muted-foreground">
                  How much historical data to use for forecasting
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Smoothing Parameters */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-600" />
              <CardTitle className="text-lg">Model Parameters</CardTitle>
            </div>
            <CardDescription>
              Configure algorithm-specific parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="alpha">Exponential Smoothing Alpha (α)</Label>
                <Input
                  id="alpha"
                  type="number"
                  min="0.1"
                  max="0.9"
                  step="0.1"
                  value={settings.exponentialAlpha}
                  onChange={(e) => updateSetting("exponentialAlpha", parseFloat(e.target.value) || 0.3)}
                />
                <p className="text-xs text-muted-foreground">
                  Higher values weight recent data more heavily (0.1-0.9)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maWindow">Moving Average Window (days)</Label>
                <Input
                  id="maWindow"
                  type="number"
                  min="7"
                  max="90"
                  value={settings.movingAverageWindow}
                  onChange={(e) => updateSetting("movingAverageWindow", parseInt(e.target.value) || 30)}
                />
                <p className="text-xs text-muted-foreground">
                  Number of days for moving average calculation
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="seasonality">Seasonality Period (days)</Label>
                <Input
                  id="seasonality"
                  type="number"
                  min="7"
                  max="365"
                  value={settings.seasonalityPeriod}
                  onChange={(e) => updateSetting("seasonalityPeriod", parseInt(e.target.value) || 365)}
                />
                <p className="text-xs text-muted-foreground">
                  Cycle length for seasonal decomposition
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
              Configure when alerts are triggered
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="accuracyThreshold">Low Accuracy Threshold (%)</Label>
                <Input
                  id="accuracyThreshold"
                  type="number"
                  min="50"
                  max="95"
                  className="w-[150px]"
                  value={settings.lowAccuracyThreshold}
                  onChange={(e) => updateSetting("lowAccuracyThreshold", parseInt(e.target.value) || 70)}
                />
                <p className="text-xs text-muted-foreground">
                  Alert when forecast accuracy drops below this
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="variabilityThreshold">High Variability Threshold (%)</Label>
                <Input
                  id="variabilityThreshold"
                  type="number"
                  min="10"
                  max="50"
                  className="w-[150px]"
                  value={settings.highVariabilityThreshold}
                  onChange={(e) => updateSetting("highVariabilityThreshold", parseInt(e.target.value) || 25)}
                />
                <p className="text-xs text-muted-foreground">
                  Alert when demand variability exceeds this
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="stockoutDays">Stockout Risk Days</Label>
                <Input
                  id="stockoutDays"
                  type="number"
                  min="1"
                  max="30"
                  className="w-[150px]"
                  value={settings.stockoutRiskDays}
                  onChange={(e) => updateSetting("stockoutRiskDays", parseInt(e.target.value) || 7)}
                />
                <p className="text-xs text-muted-foreground">
                  Alert when projected stockout is within this many days
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Low Accuracy Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert when forecast accuracy falls below threshold
                  </p>
                </div>
                <Switch
                  checked={settings.accuracyAlertEnabled}
                  onCheckedChange={(checked) => updateSetting("accuracyAlertEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Stockout Risk Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert when items are at risk of running out
                  </p>
                </div>
                <Switch
                  checked={settings.stockoutAlertEnabled}
                  onCheckedChange={(checked) => updateSetting("stockoutAlertEnabled", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Trend Change Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Alert when significant demand trend changes are detected
                  </p>
                </div>
                <Switch
                  checked={settings.trendChangeAlertEnabled}
                  onCheckedChange={(checked) => updateSetting("trendChangeAlertEnabled", checked)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Notification Settings</CardTitle>
            </div>
            <CardDescription>
              Configure how you receive forecasting alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive demand forecasting alerts via email
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
                    <Label htmlFor="email">Notification Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={settings.notificationEmail}
                      onChange={(e) => updateSetting("notificationEmail", e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="frequency">Alert Frequency</Label>
                    <Select
                      value={settings.alertFrequency}
                      onValueChange={(value) => updateSetting("alertFrequency", value)}
                    >
                      <SelectTrigger id="frequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="immediate">Immediate</SelectItem>
                        <SelectItem value="daily">Daily Digest</SelectItem>
                        <SelectItem value="weekly">Weekly Digest</SelectItem>
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
              Configure automated forecasting actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-generate Forecasts</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically generate forecasts on a schedule
                </p>
              </div>
              <Switch
                checked={settings.autoGenerateForecasts}
                onCheckedChange={(checked) => updateSetting("autoGenerateForecasts", checked)}
              />
            </div>

            {settings.autoGenerateForecasts && (
              <div className="pl-4 border-l-2 border-muted">
                <div className="space-y-2">
                  <Label htmlFor="refreshFreq">Refresh Frequency</Label>
                  <Select
                    value={settings.autoRefreshFrequency}
                    onValueChange={(value) => updateSetting("autoRefreshFrequency", value)}
                  >
                    <SelectTrigger id="refreshFreq" className="w-[200px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-apply Low-risk Optimizations</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically apply optimization recommendations with low risk
                </p>
              </div>
              <Switch
                checked={settings.autoApplyOptimizations}
                onCheckedChange={(checked) => updateSetting("autoApplyOptimizations", checked)}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Sync with Inventory Planning</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically update reorder points and safety stock based on forecasts
                </p>
              </div>
              <Switch
                checked={settings.syncWithInventoryPlanning}
                onCheckedChange={(checked) => updateSetting("syncWithInventoryPlanning", checked)}
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
