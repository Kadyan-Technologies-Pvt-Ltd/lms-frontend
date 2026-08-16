import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { ConfirmDeleteAlert } from '@/components/common/confirm-delete-alert'
import { DataTable } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { notificationsApi } from '@/lib/api/notifications'
import type { Notification } from '@/types/notification'

import { buildNotificationColumns } from './columns'
import { ComposeNotificationDialog } from './compose-notification-dialog'

export function NotificationsPage() {
  const queryClient = useQueryClient()
  const [composeOpen, setComposeOpen] = useState(false)
  const [deleteNotification, setDeleteNotification] = useState<Notification | null>(null)

  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list({ page_size: 100, ordering: '-created_at' }),
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success('Notification deleted.')
      setDeleteNotification(null)
    },
    onError: () => toast.error('Could not delete notification.'),
  })

  const columns = useMemo(() => buildNotificationColumns({ onDelete: setDeleteNotification }), [])
  const notifications = notificationsQuery.data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Send in-app notifications to a member or broadcast to everyone."
        actions={
          <Button onClick={() => setComposeOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Send Notification
          </Button>
        }
      />

      {!notificationsQuery.isLoading && notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No notifications sent yet"
          action={
            <Button onClick={() => setComposeOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Send Notification
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={notifications} isLoading={notificationsQuery.isLoading} />
      )}

      <ComposeNotificationDialog open={composeOpen} onOpenChange={setComposeOpen} />
      <ConfirmDeleteAlert
        open={!!deleteNotification}
        onOpenChange={(open) => !open && setDeleteNotification(null)}
        title={`Delete "${deleteNotification?.title}"?`}
        description="This can't be undone."
        onConfirm={() => deleteNotification && deleteMutation.mutate(deleteNotification.id)}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
