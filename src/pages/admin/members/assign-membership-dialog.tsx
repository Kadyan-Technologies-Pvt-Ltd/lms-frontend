import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { membershipPlansApi, membershipsApi } from '@/lib/api/memberships'
import type { MemberProfile } from '@/types/member'

interface AssignMembershipDialogProps {
  member: MemberProfile | null
  onOpenChange: (open: boolean) => void
}

export function AssignMembershipDialog({ member, onOpenChange }: AssignMembershipDialogProps) {
  const queryClient = useQueryClient()
  const [planId, setPlanId] = useState('')
  const [startDate, setStartDate] = useState(new Date().toISOString().slice(0, 10))

  const plansQuery = useQuery({
    queryKey: ['membership-plans', 'active'],
    queryFn: () => membershipPlansApi.list({ is_active: true }),
    enabled: !!member,
  })

  const mutation = useMutation({
    mutationFn: () => membershipsApi.create({ member: member!.id, plan: planId, start_date: startDate }),
    onSuccess: (membership) => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      queryClient.invalidateQueries({ queryKey: ['memberships', 'member', member?.id] })
      toast.success(`${member?.full_name} is now on ${membership.plan_detail.name} until ${membership.end_date}.`)
      setPlanId('')
      onOpenChange(false)
    },
    onError: () => toast.error('Could not assign membership.'),
  })

  return (
    <Dialog
      open={!!member}
      onOpenChange={(next) => {
        if (!next) setPlanId('')
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Assign membership — {member?.full_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Plan</Label>
            <Select value={planId} onValueChange={setPlanId}>
              <SelectTrigger>
                <SelectValue placeholder={plansQuery.isLoading ? 'Loading plans…' : 'Select a plan'} />
              </SelectTrigger>
              <SelectContent>
                {plansQuery.data?.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} — {plan.duration_days} days — ₹{plan.price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {plansQuery.data?.length === 0 && (
              <p className="text-sm text-muted-foreground">No active plans yet — create one in the Plans tab first.</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="start_date">Start date</Label>
            <Input id="start_date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!planId || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? 'Assigning…' : 'Assign membership'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
