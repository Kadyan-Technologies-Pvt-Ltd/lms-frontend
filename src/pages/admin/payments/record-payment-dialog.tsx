import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { membersApi } from '@/lib/api/members'
import { membershipsApi } from '@/lib/api/memberships'
import { paymentsApi } from '@/lib/api/payments'
import type { PaymentMethod, PaymentStatus, RecordPaymentPayload } from '@/types/payment'

interface RecordPaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const NONE = '__none__'

function nowForInput() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

const EMPTY_FORM = {
  member: '',
  membership: '',
  amount: '',
  discount: '0',
  payment_method: 'CASH' as PaymentMethod,
  status: 'COMPLETED' as PaymentStatus,
  payment_date: nowForInput(),
  transaction_id: '',
  notes: '',
}

export function RecordPaymentDialog({ open, onOpenChange }: RecordPaymentDialogProps) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(EMPTY_FORM)
  // Distinguishes "nothing selected yet, still eligible for the due-balance
  // default below" from "admin explicitly picked a value" (including
  // explicitly picking "Not linked") — both of those look like "" otherwise.
  const [membershipTouched, setMembershipTouched] = useState(false)

  const membersQuery = useQuery({
    queryKey: ['members', { status: 'ACTIVE' }],
    queryFn: () => membersApi.list({ status: 'ACTIVE', page_size: 100 }),
    enabled: open,
  })
  const membershipsQuery = useQuery({
    queryKey: ['memberships', 'member', form.member],
    queryFn: () => membershipsApi.listForMember(form.member),
    enabled: open && !!form.member,
  })

  // A cash/UPI/card payment recorded for a member is, in this app, almost
  // always a membership fee — but the membership link was opt-in, easy to
  // forget, and a forgotten link makes the payment invisible to due-balance
  // tracking on both this panel and the member's own portal even though the
  // member's full payment history still shows it (confusing: money paid,
  // balance not moving). Default to linking whichever membership currently
  // owes the most, while still letting the admin explicitly pick "Not
  // linked" for genuinely unrelated payments.
  useEffect(() => {
    if (membershipTouched || !membershipsQuery.data?.length) return
    const withDue = [...membershipsQuery.data]
      .filter((m) => Number(m.amount_due) > 0)
      .sort((a, b) => Number(b.amount_due) - Number(a.amount_due))[0]
    if (withDue) setForm((f) => ({ ...f, membership: withDue.id }))
  }, [membershipsQuery.data, membershipTouched])

  const mutation = useMutation({
    mutationFn: (payload: RecordPaymentPayload) => paymentsApi.record(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      toast.success('Payment recorded.')
      setForm(EMPTY_FORM)
      onOpenChange(false)
    },
    onError: () => toast.error('Could not record payment — check the form for errors.'),
  })

  const handleSubmit = () => {
    mutation.mutate({
      member: form.member,
      membership: form.membership && form.membership !== NONE ? form.membership : undefined,
      amount: form.amount,
      discount: form.discount || '0',
      payment_method: form.payment_method,
      status: form.status,
      payment_date: new Date(form.payment_date).toISOString(),
      transaction_id: form.transaction_id || undefined,
      notes: form.notes || undefined,
    })
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setForm(EMPTY_FORM)
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Record payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Member</Label>
            <Select
              value={form.member}
              onValueChange={(v) => {
                setForm((f) => ({ ...f, member: v, membership: '' }))
                setMembershipTouched(false)
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder={membersQuery.isLoading ? 'Loading…' : 'Select member'} />
              </SelectTrigger>
              <SelectContent>
                {membersQuery.data?.data.map((m) => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.full_name} ({m.member_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {form.member && (
            <div className="space-y-2">
              <Label>Membership</Label>
              <Select
                value={form.membership || NONE}
                onValueChange={(v) => {
                  setForm((f) => ({ ...f, membership: v }))
                  setMembershipTouched(true)
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Not linked to a membership" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Not linked</SelectItem>
                  {membershipsQuery.data?.map((m) => {
                    const due = Number(m.amount_due)
                    return (
                      <SelectItem key={m.id} value={m.id}>
                        {m.plan_detail.name} ({m.start_date} – {m.end_date}){due > 0 ? ` — ₹${m.amount_due} due` : ' — paid in full'}
                      </SelectItem>
                    )
                  })}
                </SelectContent>
              </Select>
              {form.membership && form.membership !== NONE && !membershipTouched && (
                <p className="text-xs text-muted-foreground">
                  Automatically linked to the membership with a pending balance — change this if the payment isn't for
                  that.
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (₹)</Label>
              <Input
                id="amount"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="discount">Discount (₹)</Label>
              <Input
                id="discount"
                type="number"
                min={0}
                step="0.01"
                value={form.discount}
                onChange={(e) => setForm((f) => ({ ...f, discount: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Payment method</Label>
              <Select
                value={form.payment_method}
                onValueChange={(v) => setForm((f) => ({ ...f, payment_method: v as PaymentMethod }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">Cash</SelectItem>
                  <SelectItem value="UPI">UPI</SelectItem>
                  <SelectItem value="CARD">Card</SelectItem>
                  <SelectItem value="ONLINE">Online</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as PaymentStatus }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="FAILED">Failed</SelectItem>
                  <SelectItem value="REFUNDED">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_date">Payment date &amp; time</Label>
            <Input
              id="payment_date"
              type="datetime-local"
              value={form.payment_date}
              onChange={(e) => setForm((f) => ({ ...f, payment_date: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="transaction_id">Transaction / reference ID (optional)</Label>
            <Input
              id="transaction_id"
              placeholder="e.g. UPI reference number"
              value={form.transaction_id}
              onChange={(e) => setForm((f) => ({ ...f, transaction_id: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Any internal notes about this payment (optional)"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!form.member || !form.amount || mutation.isPending} onClick={handleSubmit}>
            {mutation.isPending ? 'Saving…' : 'Record payment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
