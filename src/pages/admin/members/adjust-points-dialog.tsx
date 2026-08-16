import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { membersApi } from '@/lib/api/members'
import type { MemberProfile } from '@/types/member'

interface AdjustPointsDialogProps {
  member: MemberProfile | null
  lowPointThreshold: number
  onOpenChange: (open: boolean) => void
}

export function AdjustPointsDialog({ member, lowPointThreshold, onOpenChange }: AdjustPointsDialogProps) {
  const queryClient = useQueryClient()
  const [delta, setDelta] = useState(0)
  const [reason, setReason] = useState('')

  const currentPoints = member?.points ?? 0
  const previewPoints = Math.max(0, Math.min(10, currentPoints + delta))

  const mutation = useMutation({
    mutationFn: () => membersApi.adjustPoints(member!.id, delta, reason.trim()),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success(`${updated.full_name}'s points are now ${updated.points}.`)
      reset()
      onOpenChange(false)
    },
    onError: () => toast.error('Could not adjust points.'),
  })

  const reset = () => {
    setDelta(0)
    setReason('')
  }

  return (
    <Dialog
      open={!!member}
      onOpenChange={(next) => {
        if (!next) reset()
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adjust points — {member?.full_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-4">
            <Button type="button" variant="outline" size="icon" onClick={() => setDelta((d) => d - 1)}>
              <Minus className="h-4 w-4" />
            </Button>
            <div className="text-center">
              <p className="text-3xl font-bold">{previewPoints}</p>
              <p className="text-xs text-muted-foreground">
                {currentPoints} {delta !== 0 && (delta > 0 ? `+ ${delta}` : `- ${Math.abs(delta)}`)}
              </p>
            </div>
            <Button type="button" variant="outline" size="icon" onClick={() => setDelta((d) => d + 1)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {previewPoints <= lowPointThreshold && (
            <p className="text-center text-sm text-destructive">
              At or below the low-points threshold ({lowPointThreshold}) — the member will get a warning notification.
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="points-reason">Reason</Label>
            <Textarea
              id="points-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why is this adjustment being made?"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => {
              reset()
              onOpenChange(false)
            }}
          >
            Cancel
          </Button>
          <Button
            disabled={delta === 0 || !reason.trim() || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? 'Saving…' : 'Save adjustment'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
