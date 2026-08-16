import { useQuery } from '@tanstack/react-query'
import { History } from 'lucide-react'

import { EmptyState } from '@/components/common/empty-state'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { biometricSyncRecordsApi } from '@/lib/api/biometric'
import type { BiometricDevice, BiometricSyncStatus } from '@/types/biometric'

const STATUS_VARIANT: Record<BiometricSyncStatus, 'default' | 'secondary' | 'destructive'> = {
  SUCCESS: 'default',
  PARTIAL: 'secondary',
  FAILED: 'destructive',
}

export function SyncHistoryDialog({ device, onOpenChange }: { device: BiometricDevice | null; onOpenChange: (open: boolean) => void }) {
  const historyQuery = useQuery({
    queryKey: ['biometric-sync-records', device?.id],
    queryFn: () => biometricSyncRecordsApi.listForDevice(device!.id),
    enabled: !!device,
  })

  return (
    <Dialog open={!!device} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[75vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sync history — {device?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {historyQuery.isLoading && <Skeleton className="h-10 w-full" />}
          {historyQuery.data?.length === 0 && <EmptyState icon={History} title="No syncs yet" description="Run Sync Now to fetch attendance from this device." />}
          {historyQuery.data?.map((record) => (
            <div key={record.id} className="flex items-center justify-between rounded-md border p-3 text-sm">
              <div>
                <p className="font-medium">{new Date(record.sync_started_at).toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">
                  {record.records_saved}/{record.records_fetched} records saved
                  {record.error_message && ` — ${record.error_message}`}
                </p>
              </div>
              <Badge variant={STATUS_VARIANT[record.status]}>{record.status}</Badge>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
