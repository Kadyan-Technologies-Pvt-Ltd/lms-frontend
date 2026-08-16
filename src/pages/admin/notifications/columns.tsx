import type { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Notification, NotificationType } from '@/types/notification'

const TYPE_VARIANT: Record<NotificationType, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  INFO: 'secondary',
  WARNING: 'destructive',
  PAYMENT: 'default',
  MEMBERSHIP: 'default',
  SEAT: 'outline',
  GENERAL: 'secondary',
}

interface NotificationRowActions {
  onDelete: (notification: Notification) => void
}

export function buildNotificationColumns(actions: NotificationRowActions): ColumnDef<Notification>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">{row.original.message}</p>
        </div>
      ),
    },
    {
      accessorKey: 'notification_type',
      header: 'Type',
      cell: ({ row }) => <Badge variant={TYPE_VARIANT[row.original.notification_type]}>{row.original.notification_type}</Badge>,
    },
    {
      id: 'recipient',
      header: 'Recipient',
      cell: ({ row }) => (row.original.member ? `${row.original.member_name} (${row.original.member_id_display})` : 'Broadcast — all members'),
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => (row.original.member ? <Badge variant={row.original.is_read ? 'secondary' : 'default'}>{row.original.is_read ? 'Read' : 'Unread'}</Badge> : <span className="text-xs text-muted-foreground">—</span>),
    },
    {
      accessorKey: 'created_at',
      header: 'Sent',
      cell: ({ row }) => new Date(row.original.created_at).toLocaleString('en-IN'),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => actions.onDelete(row.original)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]
}
