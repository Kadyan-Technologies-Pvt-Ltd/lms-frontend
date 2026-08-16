import { PageHeader } from '@/components/common/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AttendanceReportPanel } from './attendance-report-panel'
import { ExportsPanel } from './exports-panel'
import { MembersReportPanel } from './members-report-panel'
import { RevenueReportPanel } from './revenue-report-panel'

export function ReportsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Reports" description="Trends across revenue, members, and attendance, plus data exports." />

      <Tabs defaultValue="revenue">
        <TabsList>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="exports">Exports</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue">
          <RevenueReportPanel />
        </TabsContent>

        <TabsContent value="members">
          <MembersReportPanel />
        </TabsContent>

        <TabsContent value="attendance">
          <AttendanceReportPanel />
        </TabsContent>

        <TabsContent value="exports">
          <ExportsPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
