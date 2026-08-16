import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { CalendarCheck } from 'lucide-react'
import { useState } from 'react'

import { DataTable } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/common/page-header'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { attendanceApi } from '@/lib/api/attendance'
import type { AttendanceRecord } from '@/types/attendance'

const columns: ColumnDef<AttendanceRecord>[] = [
  { accessorKey: 'date', header: 'Date' },
  { accessorKey: 'entry_time', header: 'Entry', cell: ({ row }) => row.original.entry_time ?? '—' },
  { accessorKey: 'exit_time', header: 'Exit', cell: ({ row }) => row.original.exit_time ?? '—' },
  {
    accessorKey: 'source',
    header: 'Source',
    cell: ({ row }) => <Badge variant={row.original.source === 'BIOMETRIC' ? 'default' : 'secondary'}>{row.original.source}</Badge>,
  },
]

export function MemberAttendancePage() {
  const [date, setDate] = useState('')

  const attendanceQuery = useQuery({
    queryKey: ['attendance', 'me', { date }],
    queryFn: () => attendanceApi.list({ date: date || undefined, page_size: 100, ordering: '-date' }),
  })

  const records = attendanceQuery.data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader title="My Attendance" description="Your check-in and check-out history." />

      <div className="max-w-xs space-y-2">
        <Label htmlFor="date-filter">Date</Label>
        <Input id="date-filter" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      {!attendanceQuery.isLoading && records.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No attendance records"
          description="Records appear here once you're registered on a biometric device and it's synced."
        />
      ) : (
        <DataTable columns={columns} data={records} isLoading={attendanceQuery.isLoading} />
      )}
    </div>
  )
}
