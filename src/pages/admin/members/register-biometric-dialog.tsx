import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { biometricDevicesApi } from '@/lib/api/biometric'
import { apiErrorMessage } from '@/lib/api/errors'
import { membersApi } from '@/lib/api/members'
import type { MemberProfile } from '@/types/member'

interface RegisterBiometricDialogProps {
  member: MemberProfile | null
  onOpenChange: (open: boolean) => void
}

export function RegisterBiometricDialog({ member, onOpenChange }: RegisterBiometricDialogProps) {
  const queryClient = useQueryClient()
  const [deviceId, setDeviceId] = useState('')

  const devicesQuery = useQuery({ queryKey: ['biometric-devices'], queryFn: biometricDevicesApi.list, enabled: !!member })

  const mutation = useMutation({
    mutationFn: () => membersApi.registerBiometric(member!.id, deviceId),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['members'] })
      toast.success(`${updated.full_name} enrolled — biometric ID ${updated.biometric_uid}.`)
      setDeviceId('')
      onOpenChange(false)
    },
    onError: (error) => toast.error(apiErrorMessage(error, 'Could not register on that device.')),
  })

  return (
    <Dialog
      open={!!member}
      onOpenChange={(next) => {
        if (!next) setDeviceId('')
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Register biometric — {member?.full_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {member?.biometric_uid && (
            <p className="text-sm text-muted-foreground">Currently enrolled as {member.biometric_uid}.</p>
          )}
          <div className="space-y-2">
            <Label>Device</Label>
            <Select value={deviceId} onValueChange={setDeviceId}>
              <SelectTrigger>
                <SelectValue placeholder={devicesQuery.isLoading ? 'Loading…' : 'Select device'} />
              </SelectTrigger>
              <SelectContent>
                {devicesQuery.data?.map((device) => (
                  <SelectItem key={device.id} value={device.id}>
                    {device.name} ({device.provider})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!deviceId || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? 'Registering…' : 'Register'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
