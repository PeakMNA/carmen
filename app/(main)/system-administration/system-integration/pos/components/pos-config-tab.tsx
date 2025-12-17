"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  CheckCircle2,
  XCircle,
  RefreshCw,
  Settings2,
  Bell,
  Clock,
  Shield,
  Link2,
  AlertTriangle,
  Save,
  TestTube,
  Trash2
} from "lucide-react"
import { formatDistanceToNow, format } from "date-fns"
import type { POSIntegrationConfig } from "@/lib/types/pos-integration"
import { formatNumber } from "@/lib/utils/formatters"

interface POSConfigTabProps {
  config: POSIntegrationConfig
  onUpdateConfig: (updates: Partial<POSIntegrationConfig>) => void
  onTestConnection: () => Promise<boolean>
  onResetConfig: () => void
}

export function POSConfigTab({
  config,
  onUpdateConfig,
  onTestConnection,
  onResetConfig
}: POSConfigTabProps) {
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionTestResult, setConnectionTestResult] = useState<'success' | 'failed' | null>(null)
  const [showResetDialog, setShowResetDialog] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // Local form state
  const [formState, setFormState] = useState({
    posSystem: config.posSystem,
    apiEndpoint: config.apiEndpoint,
    syncEnabled: config.syncEnabled,
    syncFrequency: config.syncFrequency.toString(),
    processingMode: config.processingMode,
    autoApproveThreshold: (config.autoApproveThreshold ?? 500).toString(),
    requireApproval: config.requireApproval,
    emailNotifications: config.emailNotifications,
    notificationRecipients: config.notificationRecipients.join(', '),
    dataRetentionDays: config.dataRetentionDays.toString()
  })

  const handleChange = <K extends keyof typeof formState>(key: K, value: typeof formState[K]) => {
    setFormState(prev => ({ ...prev, [key]: value }))
    setHasUnsavedChanges(true)
  }

  const handleTestConnection = async () => {
    setIsTestingConnection(true)
    setConnectionTestResult(null)
    try {
      const result = await onTestConnection()
      setConnectionTestResult(result ? 'success' : 'failed')
    } catch {
      setConnectionTestResult('failed')
    } finally {
      setIsTestingConnection(false)
    }
  }

  const handleSave = () => {
    onUpdateConfig({
      posSystem: formState.posSystem as POSIntegrationConfig['posSystem'],
      apiEndpoint: formState.apiEndpoint,
      syncEnabled: formState.syncEnabled,
      syncFrequency: parseInt(formState.syncFrequency),
      processingMode: formState.processingMode as POSIntegrationConfig['processingMode'],
      autoApproveThreshold: parseFloat(formState.autoApproveThreshold),
      requireApproval: formState.requireApproval,
      emailNotifications: formState.emailNotifications,
      notificationRecipients: formState.notificationRecipients.split(',').map(e => e.trim()).filter(Boolean),
      dataRetentionDays: parseInt(formState.dataRetentionDays)
    })
    setHasUnsavedChanges(false)
  }

  const handleReset = () => {
    onResetConfig()
    setShowResetDialog(false)
    setFormState({
      posSystem: 'comanche',
      apiEndpoint: '',
      syncEnabled: true,
      syncFrequency: '15',
      processingMode: 'automatic',
      autoApproveThreshold: '500',
      requireApproval: true,
      emailNotifications: true,
      notificationRecipients: '',
      dataRetentionDays: '365'
    })
  }

  return (
    <div className="space-y-6">
      {/* Unsaved Changes Alert */}
      {hasUnsavedChanges && (
        <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-600" />
            <span className="text-amber-800">You have unsaved changes</span>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => {
              setFormState({
                posSystem: config.posSystem,
                apiEndpoint: config.apiEndpoint,
                syncEnabled: config.syncEnabled,
                syncFrequency: config.syncFrequency.toString(),
                processingMode: config.processingMode,
                autoApproveThreshold: (config.autoApproveThreshold ?? 500).toString(),
                requireApproval: config.requireApproval,
                emailNotifications: config.emailNotifications,
                notificationRecipients: config.notificationRecipients.join(', '),
                dataRetentionDays: config.dataRetentionDays.toString()
              })
              setHasUnsavedChanges(false)
            }}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </div>
      )}

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Link2 className="h-5 w-5" />
                POS System Connection
              </CardTitle>
              <CardDescription>Configure connection to your Point of Sale system</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge className={
                config.connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
                config.connectionStatus === 'error' ? 'bg-red-100 text-red-800' :
                'bg-gray-100 text-gray-800'
              }>
                {config.connectionStatus === 'connected' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                {config.connectionStatus === 'error' && <XCircle className="h-3 w-3 mr-1" />}
                {config.connectionStatus}
              </Badge>
              <Button variant="outline" size="sm" onClick={handleTestConnection} disabled={isTestingConnection}>
                {isTestingConnection ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TestTube className="h-4 w-4 mr-2" />
                )}
                Test Connection
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {connectionTestResult && (
            <div className={`p-3 rounded-lg flex items-center gap-2 ${
              connectionTestResult === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              {connectionTestResult === 'success' ? (
                <CheckCircle2 className="h-5 w-5" />
              ) : (
                <XCircle className="h-5 w-5" />
              )}
              {connectionTestResult === 'success'
                ? 'Connection successful! POS system is reachable.'
                : 'Connection failed. Please check your settings.'}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>POS System</Label>
              <Select value={formState.posSystem} onValueChange={(v) => handleChange('posSystem', v as 'comanche' | 'custom')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="comanche">Comanche POS</SelectItem>
                  <SelectItem value="custom">Custom/Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>API Endpoint</Label>
              <Input
                value={formState.apiEndpoint}
                onChange={(e) => handleChange('apiEndpoint', e.target.value)}
                placeholder="https://pos.example.com/api/v2"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <p className="text-sm text-muted-foreground">Last Connection Test</p>
              <p className="font-medium">
                {config.lastConnectionTest
                  ? format(new Date(config.lastConnectionTest), 'PPp')
                  : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Sync</p>
              <p className="font-medium">
                {config.lastSyncAt
                  ? formatDistanceToNow(new Date(config.lastSyncAt), { addSuffix: true })
                  : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">POS Version</p>
              <p className="font-medium">4.2.1</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sync Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Synchronization Settings
          </CardTitle>
          <CardDescription>Configure how and when transactions are synced from POS</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Automatic Sync</Label>
              <p className="text-sm text-muted-foreground">Automatically sync transactions from POS system</p>
            </div>
            <Switch
              checked={formState.syncEnabled}
              onCheckedChange={(checked) => handleChange('syncEnabled', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label>Sync Frequency</Label>
            <Select value={formState.syncFrequency} onValueChange={(v) => handleChange('syncFrequency', v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">Every 5 minutes</SelectItem>
                <SelectItem value="15">Every 15 minutes</SelectItem>
                <SelectItem value="30">Every 30 minutes</SelectItem>
                <SelectItem value="60">Every hour</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Processing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Transaction Processing
          </CardTitle>
          <CardDescription>Configure how transactions are processed and approved</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Processing Mode</Label>
            <Select value={formState.processingMode} onValueChange={(v) => handleChange('processingMode', v as 'automatic' | 'approval' | 'manual')}>
              <SelectTrigger className="w-[250px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="automatic">Automatic (Process immediately)</SelectItem>
                <SelectItem value="approval">Require Approval (All transactions)</SelectItem>
                <SelectItem value="manual">Manual Processing Only</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formState.processingMode === 'approval' && (
            <div className="space-y-2">
              <Label>Auto-Approve Threshold</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">$</span>
                <Input
                  type="number"
                  value={formState.autoApproveThreshold}
                  onChange={(e) => handleChange('autoApproveThreshold', e.target.value)}
                  className="w-[150px]"
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Transactions below this amount will be automatically processed
              </p>
            </div>
          )}

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Require Manager Approval for High-Value Transactions</Label>
              <p className="text-sm text-muted-foreground">
                Transactions above ${formatNumber(parseFloat(formState.autoApproveThreshold))} require approval
              </p>
            </div>
            <Switch
              checked={formState.requireApproval}
              onCheckedChange={(checked) => handleChange('requireApproval', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
          </CardTitle>
          <CardDescription>Configure notification preferences for POS events</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Send email alerts for pending approvals and errors</p>
            </div>
            <Switch
              checked={formState.emailNotifications}
              onCheckedChange={(checked) => handleChange('emailNotifications', checked)}
            />
          </div>

          {formState.emailNotifications && (
            <div className="space-y-2">
              <Label>Notification Recipients</Label>
              <Input
                value={formState.notificationRecipients}
                onChange={(e) => handleChange('notificationRecipients', e.target.value)}
                placeholder="manager@hotel.com, inventory@hotel.com"
              />
              <p className="text-sm text-muted-foreground">Separate multiple emails with commas</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Data Retention
          </CardTitle>
          <CardDescription>Configure data retention policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Transaction History Retention</Label>
            <Select value={formState.dataRetentionDays} onValueChange={(v) => handleChange('dataRetentionDays', v)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="90">90 days</SelectItem>
                <SelectItem value="180">180 days</SelectItem>
                <SelectItem value="365">1 year</SelectItem>
                <SelectItem value="730">2 years</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Transaction data older than this will be archived
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Danger Zone
          </CardTitle>
          <CardDescription>Irreversible actions that affect your POS integration</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 border border-red-200 rounded-lg">
            <div>
              <p className="font-medium">Reset Configuration</p>
              <p className="text-sm text-muted-foreground">
                Reset all POS integration settings to defaults. This cannot be undone.
              </p>
            </div>
            <Button variant="destructive" onClick={() => setShowResetDialog(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset POS Configuration?</DialogTitle>
            <DialogDescription>
              This will reset all POS integration settings to their default values.
              All mappings and configuration will need to be reconfigured. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowResetDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReset}>
              Reset Configuration
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
