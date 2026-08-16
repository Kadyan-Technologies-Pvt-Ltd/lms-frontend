import { useQuery } from '@tanstack/react-query'
import { CalendarCheck } from 'lucide-react'
import { useState } from 'react'

import { DataTable } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/common/page-header'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { attendanceApi } from '@/lib/api/attendance'

import { attendanceColumns } from './columns'
import { DevicesPanel } from './devices-panel'

export function AttendancePage() {
  const [date, setDate] = useState('')

  const attendanceQuery = useQuery({
    queryKey: ['attendance', { date }],
    queryFn: () => attendanceApi.list({ date: date || undefined, page_size: 100, ordering: '-date' }),
  })

  const records = attendanceQuery.data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader title="Attendance" description="Biometric attendance records and device management." />

      <Tabs defaultValue="records">
        <TabsList>
          <TabsTrigger value="records">Records</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
        </TabsList>

        <TabsContent value="records" className="space-y-4">
          <div className="max-w-xs space-y-2">
            <Label htmlFor="date-filter">Date</Label>
            <Input id="date-filter" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          {!attendanceQuery.isLoading && records.length === 0 ? (
            <EmptyState
              icon={CalendarCheck}
              title="No attendance records"
              description="Records appear here once members are registered on a device and it's synced."
            />
          ) : (
            <DataTable columns={attendanceColumns} data={records} isLoading={attendanceQuery.isLoading} />
          )}
        </TabsContent>

        <TabsContent value="devices">
          <DevicesPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
