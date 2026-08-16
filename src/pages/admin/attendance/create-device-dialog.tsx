import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { biometricDevicesApi } from '@/lib/api/biometric'
import type { BiometricDevicePayload, BiometricProviderType } from '@/types/biometric'

const PROVIDER_OPTIONS: { value: BiometricProviderType; label: string; available: boolean }[] = [
  { value: 'MOCK', label: 'Mock (development)', available: true },
  { value: 'ZKTECO', label: 'ZKTeco — pending hardware', available: false },
  { value: 'SUPREMA', label: 'Suprema — pending hardware', available: false },
  { value: 'BIOMAX', label: 'Biomax — pending hardware', available: false },
  { value: 'CUSTOM', label: 'Custom — pending hardware', available: false },
]

const EMPTY_FORM: BiometricDevicePayload = { name: '', device_uid: '', provider: 'MOCK', location: '' }

export function CreateDeviceDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<BiometricDevicePayload>(EMPTY_FORM)

  const mutation = useMutation({
    mutationFn: biometricDevicesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['biometric-devices'] })
      toast.success('Device registered.')
      setForm(EMPTY_FORM)
      onOpenChange(false)
    },
    onError: () => toast.error('Could not register device — check the device UID is unique.'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Register device</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="device-name">Name</Label>
            <Input id="device-name" placeholder="e.g. Front Desk Scanner" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="device-uid">Device UID</Label>
            <Input id="device-uid" placeholder="Unique device identifier" value={form.device_uid} onChange={(e) => setForm((f) => ({ ...f, device_uid: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select value={form.provider} onValueChange={(v) => setForm((f) => ({ ...f, provider: v as BiometricProviderType }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDER_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.provider !== 'MOCK' && (
              <p className="text-xs text-muted-foreground">
                This adapter isn't wired to real hardware yet — connecting/syncing will report a clear error until it is.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="device-location">Location</Label>
            <Input id="device-location" placeholder="e.g. Main entrance" value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!form.name || !form.device_uid || mutation.isPending} onClick={() => mutation.mutate(form)}>
            {mutation.isPending ? 'Saving…' : 'Register device'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
