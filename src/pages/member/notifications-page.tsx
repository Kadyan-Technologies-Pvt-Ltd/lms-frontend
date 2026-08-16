import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Bell } from 'lucide-react'

import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/common/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { notificationsApi } from '@/lib/api/notifications'
import type { Notification, NotificationType } from '@/types/notification'

const TYPE_VARIANT: Record<NotificationType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  INFO: 'secondary',
  WARNING: 'destructive',
  PAYMENT: 'default',
  MEMBERSHIP: 'default',
  SEAT: 'outline',
  GENERAL: 'secondary',
}

function NotificationRow({ notification }: { notification: Notification }) {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: () => notificationsApi.markRead(notification.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const isBroadcast = notification.member === null

  return (
    <div
      className={`flex items-start justify-between gap-3 rounded-lg border p-3 shadow-sm transition-colors ${!notification.is_read && !isBroadcast ? 'bg-accent/50' : 'hover:bg-accent/20'}`}
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <p className="font-medium">{notification.title}</p>
          <Badge variant={TYPE_VARIANT[notification.notification_type]}>{notification.notification_type}</Badge>
          {isBroadcast && <Badge variant="outline">Broadcast</Badge>}
          {!notification.is_read && !isBroadcast && <span className="h-2 w-2 rounded-full bg-primary" />}
        </div>
        <p className="text-sm text-muted-foreground">{notification.message}</p>
        <p className="text-xs text-muted-foreground">{new Date(notification.created_at).toLocaleString('en-IN')}</p>
      </div>
      {/* Broadcast notifications are a single row shared by every member — marking one
          read here would mark it read for everyone, so there's no per-recipient action. */}
      {!notification.is_read && !isBroadcast && (
        <Button size="sm" variant="outline" disabled={mutation.isPending} onClick={() => mutation.mutate()}>
          Mark read
        </Button>
      )}
    </div>
  )
}

export function MemberNotificationsPage() {
  const notificationsQuery = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsApi.list({ page_size: 100 }),
  })

  const notifications = notificationsQuery.data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader title="Notifications" description="Updates about your membership, payments, and account." />

      {notificationsQuery.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <EmptyState icon={Bell} title="No notifications" />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <NotificationRow key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  )
}
