import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { apiErrorMessage } from '@/lib/api/errors'
import { membersApi } from '@/lib/api/members'
import { paymentsApi } from '@/lib/api/payments'
import { libraryProfileApi } from '@/lib/api/settings'
import { openRazorpayCheckout } from '@/lib/razorpay'

interface CollectOnlinePaymentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CollectOnlinePaymentDialog({ open, onOpenChange }: CollectOnlinePaymentDialogProps) {
  const queryClient = useQueryClient()
  const [member, setMember] = useState('')
  const [amount, setAmount] = useState('')
  const [discount, setDiscount] = useState('0')
  const [isProcessing, setIsProcessing] = useState(false)

  const membersQuery = useQuery({
    queryKey: ['members', { status: 'ACTIVE' }],
    queryFn: () => membersApi.list({ status: 'ACTIVE', page_size: 100 }),
    enabled: open,
  })
  const libraryQuery = useQuery({
    queryKey: ['settings', 'library-profile'],
    queryFn: libraryProfileApi.get,
    staleTime: 5 * 60_000,
  })

  const reset = () => {
    setMember('')
    setAmount('')
    setDiscount('0')
    setIsProcessing(false)
  }

  const startCheckout = useMutation({
    mutationFn: async () => {
      const order = await paymentsApi.createOrder({ member, amount, discount: discount || '0' })
      setIsProcessing(true)
      await openRazorpayCheckout({
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        order_id: order.order_id,
        name: libraryQuery.data?.name || 'Library',
        description: 'Library fee payment',
        theme: { color: '#4F46E5' },
        modal: { ondismiss: () => setIsProcessing(false) },
        handler: (response) => {
          verifyMutation.mutate({
            member,
            amount,
            discount: discount || '0',
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          })
        },
      })
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, 'Could not start checkout — online payments may not be configured yet.'))
      setIsProcessing(false)
    },
  })

  const verifyMutation = useMutation({
    mutationFn: paymentsApi.verify,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] })
      toast.success('Payment collected and verified.')
      reset()
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(apiErrorMessage(error, 'Payment verification failed.'))
      setIsProcessing(false)
    },
  })

  const isBusy = startCheckout.isPending || verifyMutation.isPending || isProcessing

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Collect online payment</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Opens Razorpay Checkout for the member to pay by card or UPI at the counter.
          </p>
          <div className="space-y-2">
            <Label>Member</Label>
            <Select value={member} onValueChange={setMember}>
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="online-amount">Amount (₹)</Label>
              <Input
                id="online-amount"
                type="number"
                min={0}
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="online-discount">Discount (₹)</Label>
              <Input id="online-discount" type="number" min={0} step="0.01" value={discount} onChange={(e) => setDiscount(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!member || !amount || isBusy} onClick={() => startCheckout.mutate()}>
            {isBusy ? 'Processing…' : 'Open Checkout'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
