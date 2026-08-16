import type { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Announcement, AnnouncementPriority } from '@/types/announcement'

const PRIORITY_VARIANT: Record<AnnouncementPriority, 'default' | 'secondary' | 'destructive'> = {
  NORMAL: 'secondary',
  HIGH: 'default',
  URGENT: 'destructive',
}

interface AnnouncementRowActions {
  onEdit: (announcement: Announcement) => void
  onDelete: (announcement: Announcement) => void
}

export function buildAnnouncementColumns(actions: AnnouncementRowActions): ColumnDef<Announcement>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          <p className="line-clamp-1 text-xs text-muted-foreground">{row.original.content}</p>
        </div>
      ),
    },
    { accessorKey: 'target', header: 'Target', cell: ({ row }) => (row.original.target === 'ALL' ? 'All members' : 'Specific member') },
    {
      accessorKey: 'priority',
      header: 'Priority',
      cell: ({ row }) => <Badge variant={PRIORITY_VARIANT[row.original.priority]}>{row.original.priority}</Badge>,
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => <Badge variant={row.original.is_active ? 'default' : 'secondary'}>{row.original.is_active ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      accessorKey: 'published_at',
      header: 'Published',
      cell: ({ row }) => new Date(row.original.published_at).toLocaleDateString('en-IN'),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={() => actions.onEdit(row.original)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => actions.onDelete(row.original)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]
}
