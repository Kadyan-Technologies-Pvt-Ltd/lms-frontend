import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { membersApi } from '@/lib/api/members'
import type { MemberProfile } from '@/types/member'

interface RestoreMemberAlertProps {
  member: MemberProfile | null
  onOpenChange: (open: boolean) => void
}

export function RestoreMemberAlert({ member, onOpenChange }: RestoreMemberAlertProps) {
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: () => membersApi.restore(member!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success(`${member?.full_name} has been restored to active status.`)
      onOpenChange(false)
    },
    onError: () => toast.error('Could not restore member.'),
  })

  return (
    <AlertDialog open={!!member} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Restore {member?.full_name}?</AlertDialogTitle>
          <AlertDialogDescription>
            This clears the blacklist and sets the member's status back to Active.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? 'Restoring…' : 'Restore'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
