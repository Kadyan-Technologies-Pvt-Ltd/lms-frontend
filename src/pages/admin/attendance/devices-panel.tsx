import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { History, Plug, Plus, RefreshCw } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/common/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { biometricDevicesApi } from '@/lib/api/biometric'
import { apiErrorMessage } from '@/lib/api/errors'
import type { BiometricDevice, BiometricDeviceStatus } from '@/types/biometric'

import { CreateDeviceDialog } from './create-device-dialog'
import { SyncHistoryDialog } from './sync-history-dialog'

const STATUS_VARIANT: Record<BiometricDeviceStatus, 'default' | 'secondary' | 'destructive'> = {
  ONLINE: 'default',
  OFFLINE: 'secondary',
  ERROR: 'destructive',
}

function DeviceCard({ device, onViewHistory }: { device: BiometricDevice; onViewHistory: (device: BiometricDevice) => void }) {
  const queryClient = useQueryClient()

  const testMutation = useMutation({
    mutationFn: () => biometricDevicesApi.testConnection(device.id),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['biometric-devices'] })
      toast[result.connected ? 'success' : 'error'](result.connected ? 'Connected.' : 'Connection failed.')
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not test connection.')),
  })

  const syncMutation = useMutation({
    mutationFn: () => biometricDevicesApi.sync(device.id),
    onSuccess: (record) => {
      queryClient.invalidateQueries({ queryKey: ['biometric-devices'] })
      queryClient.invalidateQueries({ queryKey: ['biometric-sync-records', device.id] })
      toast.success(`Sync ${record.status.toLowerCase()} — ${record.records_saved}/${record.records_fetched} records saved.`)
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Sync failed.')),
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-base">{device.name}</CardTitle>
        <Badge variant={STATUS_VARIANT[device.status]}>{device.status}</Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-sm text-muted-foreground">
          <p>
            {device.provider} · {device.device_uid}
          </p>
          {device.location && <p>{device.location}</p>}
          <p>{device.last_sync_at ? `Last synced ${new Date(device.last_sync_at).toLocaleString('en-IN')}` : 'Never synced'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={testMutation.isPending} onClick={() => testMutation.mutate()}>
            <Plug className="mr-2 h-3.5 w-3.5" />
            Test
          </Button>
          <Button size="sm" variant="outline" disabled={syncMutation.isPending} onClick={() => syncMutation.mutate()}>
            <RefreshCw className="mr-2 h-3.5 w-3.5" />
            {syncMutation.isPending ? 'Syncing…' : 'Sync Now'}
          </Button>
          <Button size="sm" variant="ghost" onClick={() => onViewHistory(device)}>
            <History className="mr-2 h-3.5 w-3.5" />
            History
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export function DevicesPanel() {
  const [createOpen, setCreateOpen] = useState(false)
  const [historyDevice, setHistoryDevice] = useState<BiometricDevice | null>(null)
  const devicesQuery = useQuery({ queryKey: ['biometric-devices'], queryFn: biometricDevicesApi.list })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Register Device
        </Button>
      </div>

      {devicesQuery.data?.length === 0 ? (
        <EmptyState
          icon={Plug}
          title="No devices registered"
          description="Register a device (Mock for now — real adapters wire in once hardware is confirmed) to start tracking attendance."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {devicesQuery.data?.map((device) => (
            <DeviceCard key={device.id} device={device} onViewHistory={setHistoryDevice} />
          ))}
        </div>
      )}

      <CreateDeviceDialog open={createOpen} onOpenChange={setCreateOpen} />
      <SyncHistoryDialog device={historyDevice} onOpenChange={(open) => !open && setHistoryDevice(null)} />
    </div>
  )
}
