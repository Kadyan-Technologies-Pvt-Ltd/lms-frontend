import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarClock, CheckCircle2, CreditCard } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { apiErrorMessage } from '@/lib/api/errors'
import { membershipPlansApi } from '@/lib/api/memberships'
import { paymentsApi } from '@/lib/api/payments'
import { libraryProfileApi } from '@/lib/api/settings'
import { openRazorpayCheckout } from '@/lib/razorpay'
import type { MemberProfile } from '@/types/member'
import type { Membership } from '@/types/membership'
import type { MemberCreateOrderPayload } from '@/types/payment'

interface RenewMembershipCardProps {
  profile: MemberProfile
  /** The member's most recent membership by end date, if any — matches how
   * the backend picks "current" when resolving a renewal's start date. */
  currentMembership: Membership | undefined
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function daysUntil(iso: string) {
  const diffMs = new Date(iso).setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0)
  return Math.round(diffMs / (1000 * 60 * 60 * 24))
}

export function RenewMembershipCard({ profile, currentMembership }: RenewMembershipCardProps) {
  const queryClient = useQueryClient()
  const [payingPlanId, setPayingPlanId] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const plansQuery = useQuery({
    queryKey: ['membership-plans', 'active'],
    queryFn: () => membershipPlansApi.list({ is_active: true }),
  })
  const libraryQuery = useQuery({
    queryKey: ['settings', 'library-profile'],
    queryFn: libraryProfileApi.get,
    staleTime: 5 * 60_000,
  })

  const amountDue = currentMembership ? Number(currentMembership.amount_due) : 0
  const hasPendingDue = amountDue > 0
  const endDate = currentMembership?.end_date
  const daysLeft = endDate ? daysUntil(endDate) : null

  const invalidateAfterPayment = () => {
    queryClient.invalidateQueries({ queryKey: ['memberships', 'member', profile.id] })
    queryClient.invalidateQueries({ queryKey: ['payments', 'me'] })
    queryClient.invalidateQueries({ queryKey: ['members', 'me'] })
  }

  const verifyMutation = useMutation({
    mutationFn: (payload: MemberCreateOrderPayload & { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) =>
      paymentsApi.verifySelf(payload),
    onSuccess: () => {
      invalidateAfterPayment()
      toast.success('Payment successful.')
      setPayingPlanId(null)
      setIsProcessing(false)
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, 'Payment verification failed. If money was deducted, contact the front desk.'))
      setIsProcessing(false)
    },
  })

  const checkoutMutation = useMutation({
    mutationFn: async ({ payload, description, amountLabel }: { payload: MemberCreateOrderPayload; description: string; amountLabel: string }) => {
      const order = await paymentsApi.createSelfOrder(payload)
      setIsProcessing(true)
      await openRazorpayCheckout({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: libraryQuery.data?.name || 'Library',
        description,
        prefill: { name: profile.full_name, email: profile.email, contact: profile.mobile },
        theme: { color: '#4F46E5' },
        modal: { ondismiss: () => setIsProcessing(false) },
        handler: (response) => {
          verifyMutation.mutate({
            ...payload,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
        },
      })
      return amountLabel
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, 'Could not start checkout — online payments may not be configured yet.'))
      setIsProcessing(false)
    },
  })

  const isBusy = checkoutMutation.isPending || verifyMutation.isPending || isProcessing

  const payPendingDue = () => {
    if (!currentMembership) return
    checkoutMutation.mutate({
      payload: { membership: currentMembership.id },
      description: `${currentMembership.plan_detail.name} — pending balance`,
      amountLabel: currentMembership.amount_due,
    })
  }

  const payForPlan = (planId: string, planName: string, price: string) => {
    setPayingPlanId(planId)
    checkoutMutation.mutate(
      { payload: { plan: planId }, description: `${planName} membership`, amountLabel: price },
      { onSettled: () => setPayingPlanId(null) },
    )
  }

  return (
    <div className="space-y-4">
      {currentMembership && (
        <Card className={hasPendingDue ? 'border-destructive/50' : 'border-primary/30'}>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="flex items-center gap-2">
                <CalendarClock className="h-5 w-5 text-primary" />
                {currentMembership.plan_detail.name}
              </CardTitle>
              <Badge variant={currentMembership.status === 'ACTIVE' ? 'default' : 'secondary'}>
                {currentMembership.status}
              </Badge>
            </div>
            <CardDescription>
              {formatDate(currentMembership.start_date)} — {formatDate(currentMembership.end_date)}
              {daysLeft !== null && daysLeft >= 0 && ` · ${daysLeft === 0 ? 'ends today' : `${daysLeft} day${daysLeft === 1 ? '' : 's'} left`}`}
              {daysLeft !== null && daysLeft < 0 && ' · expired'}
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-xs text-muted-foreground">Paid</p>
              <p className="text-lg font-semibold">₹{currentMembership.amount_paid}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className={`text-lg font-semibold ${hasPendingDue ? 'text-destructive' : ''}`}>
                ₹{currentMembership.amount_due}
              </p>
            </div>
          </CardContent>
          {hasPendingDue && (
            <CardFooter>
              <Button disabled={isBusy} onClick={payPendingDue}>
                {isBusy ? 'Processing…' : `Pay pending ₹${currentMembership.amount_due}`}
              </Button>
            </CardFooter>
          )}
        </Card>
      )}

      {!hasPendingDue && (
        <div className="space-y-3">
          <h2 className="flex items-center gap-2 text-lg font-medium">
            <CreditCard className="h-5 w-5 text-primary" />
            {currentMembership ? 'Renew or switch plan' : 'Choose a plan to get started'}
          </h2>
          {plansQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading plans…</p>
          ) : plansQuery.data?.length === 0 ? (
            <p className="text-sm text-muted-foreground">No membership plans are available yet — check back later.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plansQuery.data?.map((plan) => {
                const isCurrentPlan = currentMembership?.plan === plan.id
                const isPayingThis = isBusy && payingPlanId === plan.id
                return (
                  <Card key={plan.id} className={`hover-lift hover:shadow-elevated ${isCurrentPlan ? 'border-primary/50' : ''}`}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between gap-2">
                        <CardTitle className="text-base">{plan.name}</CardTitle>
                        {isCurrentPlan && (
                          <Badge variant="outline" className="gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Current
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{plan.duration_days} days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-2xl font-bold">₹{plan.price}</p>
                      {plan.description && <p className="mt-1 text-sm text-muted-foreground">{plan.description}</p>}
                    </CardContent>
                    <CardFooter>
                      <Button
                        className="w-full"
                        variant={isCurrentPlan ? 'default' : 'outline'}
                        disabled={isBusy}
                        onClick={() => payForPlan(plan.id, plan.name, plan.price)}
                      >
                        {isPayingThis ? 'Processing…' : isCurrentPlan ? `Renew for ₹${plan.price}` : `Pay ₹${plan.price}`}
                      </Button>
                    </CardFooter>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
