'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { ArrowLeft } from 'lucide-react'
import type { POSModel, ConnectorMode } from '@/lib/types/pos-integration'
import { POS_MODEL_CONNECTOR_MODES } from '@/lib/types/pos-integration'

const POS_MODEL_LABELS: Record<POSModel, string> = {
  square: 'Square',
  toast: 'Toast',
  lightspeed: 'Lightspeed',
  micros: 'Micros',
  generic_csv: 'Generic CSV',
  generic_xml: 'Generic XML',
}

const CONNECTOR_MODE_LABELS: Record<ConnectorMode, string> = {
  api: 'API',
  file_import: 'File Import',
  webhook: 'Webhook',
}

const SETUP_PATH = '/system-administration/system-integration/pos/setup'

export default function NewConnectionPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [posModel, setPosModel] = useState<POSModel | ''>('')
  const [mode, setMode] = useState<ConnectorMode | ''>('')

  const availableModes = posModel ? POS_MODEL_CONNECTOR_MODES[posModel] : []

  const handleModelChange = (value: string) => {
    setPosModel(value as POSModel)
    setMode('')
  }

  const handleSave = () => {
    if (!posModel || !mode) return
    toast({
      title: 'Connection Saved',
      description: `${POS_MODEL_LABELS[posModel]} (${CONNECTOR_MODE_LABELS[mode]}) connection added.`,
    })
    router.push(SETUP_PATH)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href={SETUP_PATH}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back
          </Link>
        </Button>
        <div>
          <h2 className="text-xl font-semibold">Add Connection</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Connect a POS system to start syncing transactions
          </p>
        </div>
      </div>

      {/* Step 1 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Step 1 of 3
          </CardTitle>
          <CardDescription className="text-base font-semibold text-foreground">
            Select POS system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>POS Model</Label>
            <Select value={posModel} onValueChange={handleModelChange}>
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Choose a POS system..." />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(POS_MODEL_LABELS) as POSModel[]).map(model => (
                  <SelectItem key={model} value={model}>
                    {POS_MODEL_LABELS[model]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Step 2 */}
      <Card className={!posModel ? 'opacity-50 pointer-events-none' : ''}>
        <CardHeader>
          <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Step 2 of 3
          </CardTitle>
          <CardDescription className="text-base font-semibold text-foreground">
            Choose connector mode
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Mode</Label>
            <Select
              value={mode}
              onValueChange={v => setMode(v as ConnectorMode)}
              disabled={!posModel}
            >
              <SelectTrigger className="w-full max-w-xs">
                <SelectValue placeholder="Choose a mode..." />
              </SelectTrigger>
              <SelectContent>
                {availableModes.map(m => (
                  <SelectItem key={m} value={m}>
                    {CONNECTOR_MODE_LABELS[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {posModel && (
              <p className="text-xs text-muted-foreground">
                {POS_MODEL_LABELS[posModel]} supports:{' '}
                {availableModes.map(m => CONNECTOR_MODE_LABELS[m]).join(', ')}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 3 */}
      <Card className={!mode ? 'opacity-50 pointer-events-none' : ''}>
        <CardHeader>
          <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Step 3 of 3
          </CardTitle>
          <CardDescription className="text-base font-semibold text-foreground">
            {mode === 'file_import' ? 'Import configuration' : 'API credentials'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {mode === 'file_import' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Upload schedule</Label>
                <Select disabled>
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue placeholder="Daily at 6:00 AM" />
                  </SelectTrigger>
                  <SelectContent />
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="endpoint">API Endpoint</Label>
                <Input
                  id="endpoint"
                  placeholder="https://api.example.com"
                  className="max-w-sm"
                  disabled={!mode}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="••••••••••••"
                  className="max-w-sm"
                  disabled={!mode}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button onClick={handleSave} disabled={!posModel || !mode}>
          Save Connection
        </Button>
        <Button variant="outline" asChild>
          <Link href={SETUP_PATH}>Cancel</Link>
        </Button>
      </div>
    </div>
  )
}
