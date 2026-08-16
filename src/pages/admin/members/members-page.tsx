import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Users } from 'lucide-react'
import { useMemo, useState } from 'react'

import { DataTable } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { membersApi } from '@/lib/api/members'
import { getLowPointThreshold, librarySettingsApi } from '@/lib/api/settings'
import type { MemberProfile, MemberStatus } from '@/types/member'

import { AdjustPointsDialog } from './adjust-points-dialog'
import { AssignMembershipDialog } from './assign-membership-dialog'
import { BlacklistDialog } from './blacklist-dialog'
import { buildMemberColumns } from './columns'
import { CreateMemberDialog } from './create-member-dialog'
import { DeleteMemberAlert } from './delete-member-alert'
import { EditMemberDialog } from './edit-member-dialog'
import { MembershipPlansPanel } from './membership-plans-panel'
import { RegisterBiometricDialog } from './register-biometric-dialog'
import { RestoreMemberAlert } from './restore-member-alert'

const STATUS_OPTIONS: MemberStatus[] = ['ACTIVE', 'SUSPENDED', 'EXPIRED', 'LEFT', 'BLACKLISTED']

export function MembersPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<MemberStatus | 'ALL'>('ALL')
  const [createOpen, setCreateOpen] = useState(false)
  const [editMember, setEditMember] = useState<MemberProfile | null>(null)
  const [blacklistMember, setBlacklistMember] = useState<MemberProfile | null>(null)
  const [restoreMember, setRestoreMember] = useState<MemberProfile | null>(null)
  const [deleteMember, setDeleteMember] = useState<MemberProfile | null>(null)
  const [assignMember, setAssignMember] = useState<MemberProfile | null>(null)
  const [pointsMember, setPointsMember] = useState<MemberProfile | null>(null)
  const [biometricMember, setBiometricMember] = useState<MemberProfile | null>(null)

  const membersQuery = useQuery({
    queryKey: ['members', { search, status }],
    queryFn: () =>
      membersApi.list({
        search: search || undefined,
        status: status === 'ALL' ? undefined : status,
        page_size: 100,
      }),
  })

  const settingsQuery = useQuery({ queryKey: ['settings'], queryFn: librarySettingsApi.list })
  const lowPointThreshold = getLowPointThreshold(settingsQuery.data)

  const columns = useMemo(
    () =>
      buildMemberColumns(
        {
          onEdit: setEditMember,
          onAssignMembership: setAssignMember,
          onAdjustPoints: setPointsMember,
          onRegisterBiometric: setBiometricMember,
          onBlacklist: setBlacklistMember,
          onRestore: setRestoreMember,
          onDelete: setDeleteMember,
        },
        lowPointThreshold,
      ),
    [lowPointThreshold],
  )

  const members = membersQuery.data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        description="Manage member accounts and membership plans."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        }
      />

      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="plans">Membership Plans</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, ID, or mobile…"
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={status} onValueChange={(v) => setStatus(v as MemberStatus | 'ALL')}>
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!membersQuery.isLoading && members.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No members found"
              description={search || status !== 'ALL' ? 'Try a different search or filter.' : 'Add your first member to get started.'}
              action={
                !search && status === 'ALL' ? (
                  <Button onClick={() => setCreateOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Member
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <DataTable columns={columns} data={members} isLoading={membersQuery.isLoading} />
          )}
        </TabsContent>

        <TabsContent value="plans">
          <MembershipPlansPanel />
        </TabsContent>
      </Tabs>

      <CreateMemberDialog open={createOpen} onOpenChange={setCreateOpen} />
      <EditMemberDialog member={editMember} onOpenChange={(open) => !open && setEditMember(null)} />
      <BlacklistDialog member={blacklistMember} onOpenChange={(open) => !open && setBlacklistMember(null)} />
      <RestoreMemberAlert member={restoreMember} onOpenChange={(open) => !open && setRestoreMember(null)} />
      <DeleteMemberAlert member={deleteMember} onOpenChange={(open) => !open && setDeleteMember(null)} />
      <AssignMembershipDialog member={assignMember} onOpenChange={(open) => !open && setAssignMember(null)} />
      <AdjustPointsDialog
        member={pointsMember}
        lowPointThreshold={lowPointThreshold}
        onOpenChange={(open) => !open && setPointsMember(null)}
      />
      <RegisterBiometricDialog member={biometricMember} onOpenChange={(open) => !open && setBiometricMember(null)} />
    </div>
  )
}
