import type { ColumnDef } from '@tanstack/react-table'

import { Badge } from '@/components/ui/badge'
import type { AttendanceRecord } from '@/types/attendance'

export const attendanceColumns: ColumnDef<AttendanceRecord>[] = [
  {
    id: 'member',
    header: 'Member',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.member_name}</p>
        <p className="text-xs text-muted-foreground">{row.original.member_id_display}</p>
      </div>
    ),
  },
  { accessorKey: 'date', header: 'Date' },
  { accessorKey: 'entry_time', header: 'Entry', cell: ({ row }) => row.original.entry_time ?? '—' },
  { accessorKey: 'exit_time', header: 'Exit', cell: ({ row }) => row.original.exit_time ?? '—' },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => <Badge variant={row.original.source === 'BIOMETRIC' ? 'default' : 'secondary'}>{row.original.source}</Badge>,
  },
  { accessorKey: 'device_name', header: 'Device', cell: ({ row }) => row.original.device_name ?? '—' },
]
