import { useQuery } from '@tanstack/react-query'
import { CreditCard, Plus, Receipt, Search } from 'lucide-react'
import { useState } from 'react'

import { DataTable } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { paymentsApi } from '@/lib/api/payments'
import type { PaymentStatus } from '@/types/payment'

import { paymentColumns } from './columns'
import { CollectOnlinePaymentDialog } from './collect-online-payment-dialog'
import { RecordPaymentDialog } from './record-payment-dialog'

const STATUS_OPTIONS: PaymentStatus[] = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED']

export function PaymentsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<PaymentStatus | 'ALL'>('ALL')
  const [recordOpen, setRecordOpen] = useState(false)
  const [collectOpen, setCollectOpen] = useState(false)

  const paymentsQuery = useQuery({
    queryKey: ['payments', { search, status }],
    queryFn: () =>
      paymentsApi.list({
        search: search || undefined,
        status: status === 'ALL' ? undefined : status,
        page_size: 100,
        ordering: '-payment_date',
      }),
  })

  const payments = paymentsQuery.data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments"
        description="Record fees and collect online payments."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCollectOpen(true)}>
              <CreditCard className="mr-2 h-4 w-4" />
              Collect Online Payment
            </Button>
            <Button onClick={() => setRecordOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Record Payment
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search member, transaction ID…"
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={status} onValueChange={(v) => setStatus(v as PaymentStatus | 'ALL')}>
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

      {!paymentsQuery.isLoading && payments.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title="No payments found"
          description={search || status !== 'ALL' ? 'Try a different search or filter.' : 'Record your first payment to get started.'}
          action={
            !search && status === 'ALL' ? (
              <Button onClick={() => setRecordOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            ) : undefined
          }
        />
      ) : (
        <DataTable columns={paymentColumns} data={payments} isLoading={paymentsQuery.isLoading} />
      )}

      <RecordPaymentDialog open={recordOpen} onOpenChange={setRecordOpen} />
      <CollectOnlinePaymentDialog open={collectOpen} onOpenChange={setCollectOpen} />
    </div>
  )
}
