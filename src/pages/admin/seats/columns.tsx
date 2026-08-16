import type { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Seat } from '@/types/seat'

import { SEAT_STATUS_META } from './seat-status'

interface SeatRowActions {
  onEdit: (seat: Seat) => void
  onManageAllocations: (seat: Seat) => void
}

export function buildSeatColumns(actions: SeatRowActions): ColumnDef<Seat>[] {
  return [
    { accessorKey: 'seat_number', header: 'Seat', cell: ({ row }) => <span className="font-mono text-sm">{row.original.seat_number}</span> },
    {
      id: 'location',
      header: 'Location',
      cell: ({ row }) => {
        const { section, floor, room } = row.original
        const parts = [section, floor && `Floor ${floor}`, room].filter(Boolean)
        return <span className="text-sm text-muted-foreground">{parts.join(' · ') || '—'}</span>
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      // Same dot colours as the seating-plan grid, so a seat reads the same
      // way whichever view the admin happens to be in.
      cell: ({ row }) => {
        const meta = SEAT_STATUS_META[row.original.status]
        return (
          <Badge variant="outline" className="font-normal">
            <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${meta.dot}`} />
            {meta.label}
          </Badge>
        )
      },
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={() => actions.onManageAllocations(row.original)}>
            Allocations
          </Button>
          <Button variant="ghost" size="sm" onClick={() => actions.onEdit(row.original)}>
            Edit
          </Button>
        </div>
      ),
    },
  ]
}
