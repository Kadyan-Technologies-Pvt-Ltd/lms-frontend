import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { membersApi } from '@/lib/api/members'
import type { MemberProfile } from '@/types/member'

interface BlacklistDialogProps {
  member: MemberProfile | null
  onOpenChange: (open: boolean) => void
}

export function BlacklistDialog({ member, onOpenChange }: BlacklistDialogProps) {
  const [reason, setReason] = useState('')
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (reasonText: string) => membersApi.blacklist(member!.id, reasonText),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success(`${member?.full_name} has been blacklisted.`)
      setReason('')
      onOpenChange(false)
    },
    onError: () => toast.error('Could not blacklist member.'),
  })

  return (
    <Dialog
      open={!!member}
      onOpenChange={(next) => {
        if (!next) setReason('')
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Blacklist {member?.full_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="reason">Reason</Label>
          <Textarea
            id="reason"
            rows={3}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Why is this member being blacklisted?"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            disabled={!reason.trim() || mutation.isPending}
            onClick={() => mutation.mutate(reason.trim())}
          >
            {mutation.isPending ? 'Blacklisting…' : 'Blacklist member'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
