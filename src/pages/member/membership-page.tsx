import { useQuery } from '@tanstack/react-query'
import { Receipt as ReceiptIcon, Wallet } from 'lucide-react'

import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/common/page-header'
import { ReceiptDownloadButton } from '@/components/receipts/receipt-download-button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { membersApi } from '@/lib/api/members'
import { membershipsApi } from '@/lib/api/memberships'
import { paymentsApi } from '@/lib/api/payments'
import type { MembershipStatus } from '@/types/membership'

import { RenewMembershipCard } from './renew-membership-card'

const STATUS_VARIANT: Record<MembershipStatus, 'default' | 'secondary' | 'destructive'> = {
  ACTIVE: 'default',
  EXPIRED: 'secondary',
  CANCELLED: 'destructive',
}

export function MemberMembershipPage() {
  const profileQuery = useQuery({ queryKey: ['members', 'me'], queryFn: membersApi.me })
  const profile = profileQuery.data

  const membershipsQuery = useQuery({
    queryKey: ['memberships', 'member', profile?.id],
    queryFn: () => membershipsApi.listForMember(profile!.id),
    enabled: !!profile,
  })
  // Matches the backend's own definition of "current" (Membership.objects
  // .order_by("-end_date").first()) so the due/renew UI and what the server
  // will actually act on can never disagree.
  const currentMembership = [...(membershipsQuery.data ?? [])].sort((a, b) => (a.end_date < b.end_date ? 1 : -1))[0]

  const paymentsQuery = useQuery({
    queryKey: ['payments', 'me'],
    queryFn: () => paymentsApi.list({ page_size: 50, ordering: '-payment_date' }),
    enabled: !!profile,
  })

  return (
    <div className="space-y-6">
      <PageHeader title="My Membership" description="Your membership history and payment receipts." />

      {profile && <RenewMembershipCard profile={profile} currentMembership={currentMembership} />}

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Memberships</h2>
        {membershipsQuery.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : membershipsQuery.data?.length === 0 ? (
          <EmptyState icon={Wallet} title="No memberships yet" description="Visit the front desk to set one up." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {membershipsQuery.data?.map((m) => (
              <Card key={m.id} className="hover-lift hover:shadow-elevated">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-base">{m.plan_detail.name}</CardTitle>
                  <Badge variant={STATUS_VARIANT[m.status]}>{m.status}</Badge>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>
                    {m.start_date} — {m.end_date}
                  </p>
                  <p>₹{m.plan_detail.price}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-medium">Payments &amp; receipts</h2>
        {paymentsQuery.isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : paymentsQuery.data?.data.length === 0 ? (
          <EmptyState icon={ReceiptIcon} title="No payments yet" />
        ) : (
          <div className="space-y-2">
            {paymentsQuery.data?.data.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ReceiptIcon className="h-4 w-4" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium">₹{payment.net_amount}</p>
                    <p className="text-muted-foreground">
                      {payment.payment_method} · {new Date(payment.payment_date).toLocaleDateString('en-IN')}
                    </p>
                  </div>
                </div>
                <ReceiptDownloadButton payment={payment} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
