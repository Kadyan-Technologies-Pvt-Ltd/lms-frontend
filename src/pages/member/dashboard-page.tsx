import { useQuery } from '@tanstack/react-query'
import { Bell, Megaphone, Wallet } from 'lucide-react'
import { Link } from 'react-router-dom'

import { EmptyState } from '@/components/common/empty-state'
import { StaggerGrid, StaggerItem } from '@/components/common/stagger-grid'
import { StatCard } from '@/components/common/stat-card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { announcementsApi } from '@/lib/api/announcements'
import { DEFAULT_LOW_POINT_THRESHOLD } from '@/lib/api/settings'
import { membersApi } from '@/lib/api/members'
import { membershipsApi } from '@/lib/api/memberships'
import { notificationsApi } from '@/lib/api/notifications'

export function MemberDashboardPage() {
  const profileQuery = useQuery({ queryKey: ['members', 'me'], queryFn: membersApi.me })
  const profile = profileQuery.data

  const membershipsQuery = useQuery({
    queryKey: ['memberships', 'member', profile?.id],
    queryFn: () => membershipsApi.listForMember(profile!.id),
    enabled: !!profile,
  })
  const currentMembership = membershipsQuery.data?.find((m) => m.status === 'ACTIVE')

  const unreadQuery = useQuery({
    queryKey: ['notifications', { is_read: false }],
    queryFn: () => notificationsApi.list({ is_read: false, page_size: 1 }),
  })
  const unreadCount = unreadQuery.data?.pagination?.count ?? 0

  const announcementsQuery = useQuery({ queryKey: ['announcements'], queryFn: () => announcementsApi.list({ page_size: 5 }) })

  const isLowPoints = profile ? profile.points <= DEFAULT_LOW_POINT_THRESHOLD : false

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Welcome, {profile?.full_name ?? '…'}</h1>

      <StaggerGrid className="grid gap-4 sm:grid-cols-3">
        <StaggerItem>
          <StatCard
            label="Points"
            icon={Wallet}
            isLoading={profileQuery.isLoading}
            value={profile ? `${profile.points}/10` : '—'}
            hint={isLowPoints ? 'Low — contact the admin desk if this seems wrong.' : undefined}
            className={isLowPoints ? 'border-destructive/50' : undefined}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard
            label="Membership"
            icon={Wallet}
            isLoading={membershipsQuery.isLoading}
            value={currentMembership ? currentMembership.plan_detail.name : 'None active'}
            hint={currentMembership ? `Until ${currentMembership.end_date}` : undefined}
          />
        </StaggerItem>
        <StaggerItem>
          <StatCard label="Unread Notifications" icon={Bell} isLoading={unreadQuery.isLoading} value={unreadCount} />
        </StaggerItem>
      </StaggerGrid>

      <Card>
        <CardHeader>
          <CardTitle>Membership status</CardTitle>
        </CardHeader>
        <CardContent>
          {membershipsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : currentMembership ? (
            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Plan: </span>
                {currentMembership.plan_detail.name}
              </p>
              <p>
                <span className="text-muted-foreground">Valid: </span>
                {currentMembership.start_date} — {currentMembership.end_date}
              </p>
              <Badge>{currentMembership.status}</Badge>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You don't have an active membership. Pay online to activate one now, or visit the front desk.
              </p>
              <Button size="sm" asChild>
                <Link to="/member/membership">Pay for membership</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Announcements</CardTitle>
        </CardHeader>
        <CardContent>
          {announcementsQuery.data?.length === 0 ? (
            <EmptyState icon={Megaphone} title="No announcements" />
          ) : (
            <div className="space-y-4">
              {announcementsQuery.data?.map((a) => (
                <div key={a.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{a.title}</p>
                    {a.priority !== 'NORMAL' && (
                      <Badge variant={a.priority === 'URGENT' ? 'destructive' : 'secondary'}>{a.priority}</Badge>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{a.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
