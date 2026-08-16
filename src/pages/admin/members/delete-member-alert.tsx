import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { ConfirmDeleteAlert } from '@/components/common/confirm-delete-alert'
import { membersApi } from '@/lib/api/members'
import type { MemberProfile } from '@/types/member'

interface DeleteMemberAlertProps {
  member: MemberProfile | null
  onOpenChange: (open: boolean) => void
}

export function DeleteMemberAlert({ member, onOpenChange }: DeleteMemberAlertProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => membersApi.remove(member!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success(`${member?.full_name} has been permanently deleted.`)
      onOpenChange(false)
    },
    onError: () => toast.error('Could not delete member.'),
  })

  return (
    <ConfirmDeleteAlert
      open={!!member}
      onOpenChange={onOpenChange}
      title={`Delete ${member?.full_name}?`}
      description="This permanently deletes the member and cannot be undone — it also erases their payment, membership, attendance, and seat history. To remove someone from active use while keeping their records, use Blacklist instead."
      onConfirm={() => mutation.mutate()}
      isPending={mutation.isPending}
    />
  )
}
