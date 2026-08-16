import type { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Book } from '@/types/book'

interface BookRowActions {
  onEdit: (book: Book) => void
}

export function buildBookColumns(actions: BookRowActions): ColumnDef<Book>[] {
  return [
    {
      accessorKey: 'title',
      header: 'Title',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.title}</p>
          {row.original.author && <p className="text-xs text-muted-foreground">{row.original.author}</p>}
        </div>
      ),
    },
    { accessorKey: 'language', header: 'Language', cell: ({ row }) => row.original.language || '—' },
    { accessorKey: 'license', header: 'License', cell: ({ row }) => row.original.license.replace('_', ' ') },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => <Badge variant={row.original.is_active ? 'default' : 'secondary'}>{row.original.is_active ? 'Active' : 'Inactive'}</Badge>,
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={() => actions.onEdit(row.original)}>
            Edit
          </Button>
        </div>
      ),
    },
  ]
}
