import { PageHeader } from '@/components/common/page-header'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { AuditLogPanel } from './audit-log-panel'
import { LibraryProfilePanel } from './library-profile-panel'
import { MyAccountPanel } from './my-account-panel'
import { SystemSettingsPanel } from './system-settings-panel'

export function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Library profile, system configuration, and account security." />

      <Tabs defaultValue="library">
        <TabsList>
          <TabsTrigger value="library">Library Profile</TabsTrigger>
          <TabsTrigger value="system">System Settings</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
          <TabsTrigger value="account">My Account</TabsTrigger>
        </TabsList>

        <TabsContent value="library">
          <LibraryProfilePanel />
        </TabsContent>

        <TabsContent value="system">
          <SystemSettingsPanel />
        </TabsContent>

        <TabsContent value="audit">
          <AuditLogPanel />
        </TabsContent>

        <TabsContent value="account">
          <MyAccountPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
