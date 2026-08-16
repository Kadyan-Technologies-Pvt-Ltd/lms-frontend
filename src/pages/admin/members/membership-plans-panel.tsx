import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Layers, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/common/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { membershipPlansApi } from '@/lib/api/memberships'
import type { MembershipPlanPayload } from '@/types/membership'

function CreatePlanDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<MembershipPlanPayload>({ name: '', duration_days: 30, price: '0' })

  const mutation = useMutation({
    mutationFn: membershipPlansApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['membership-plans'] })
      toast.success('Membership plan created.')
      setForm({ name: '', duration_days: 30, price: '0' })
      onOpenChange(false)
    },
    onError: () => toast.error('Could not create plan.'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>New membership plan</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="plan-name">Name</Label>
            <Input
              id="plan-name"
              placeholder="e.g. Monthly Reading Room"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plan-duration">Duration (days)</Label>
              <Input
                id="plan-duration"
                type="number"
                min={1}
                value={form.duration_days}
                onChange={(e) => setForm((f) => ({ ...f, duration_days: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan-price">Price (₹)</Label>
              <Input
                id="plan-price"
                type="number"
                min={0}
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="plan-description">Description</Label>
            <Textarea
              id="plan-description"
              rows={2}
              placeholder="What's included in this plan? (optional)"
              value={form.description ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!form.name || mutation.isPending} onClick={() => mutation.mutate(form)}>
            {mutation.isPending ? 'Creating…' : 'Create plan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function MembershipPlansPanel() {
  const [createOpen, setCreateOpen] = useState(false)
  const plansQuery = useQuery({ queryKey: ['membership-plans'], queryFn: () => membershipPlansApi.list() })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Plan
        </Button>
      </div>

      {plansQuery.data?.length === 0 ? (
        <EmptyState icon={Layers} title="No membership plans yet" description="Create one so it can be assigned to members." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {plansQuery.data?.map((plan) => (
            <Card key={plan.id}>
              <CardContent className="space-y-2 pt-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{plan.name}</h3>
                  <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                    {plan.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {plan.duration_days} days — ₹{plan.price}
                </p>
                {plan.description && <p className="text-sm text-muted-foreground">{plan.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreatePlanDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
