import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { membersApi } from '@/lib/api/members'
import { notificationsApi } from '@/lib/api/notifications'
import type { NotificationType } from '@/types/notification'

const NONE = '__broadcast__'

const EMPTY_FORM = {
  title: '',
  message: '',
  notification_type: 'GENERAL' as NotificationType,
  member: NONE,
}

export function ComposeNotificationDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState(EMPTY_FORM)

  const membersQuery = useQuery({
    queryKey: ['members', { status: 'ACTIVE' }],
    queryFn: () => membersApi.list({ status: 'ACTIVE', page_size: 100 }),
    enabled: open,
  })

  const mutation = useMutation({
    mutationFn: () =>
      notificationsApi.create({
        title: form.title,
        message: form.message,
        notification_type: form.notification_type,
        member: form.member === NONE ? undefined : form.member,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      toast.success(form.member === NONE ? 'Notification broadcast to all members.' : 'Notification sent.')
      setForm(EMPTY_FORM)
      onOpenChange(false)
    },
    onError: () => toast.error('Could not send notification.'),
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setForm(EMPTY_FORM)
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Send notification</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notif-title">Title</Label>
            <Input
              id="notif-title"
              placeholder="e.g. Payment reminder"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notif-message">Message</Label>
            <Textarea
              id="notif-message"
              rows={3}
              placeholder="Write the notification message here…"
              value={form.message}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.notification_type} onValueChange={(v) => setForm((f) => ({ ...f, notification_type: v as NotificationType }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="GENERAL">General</SelectItem>
                  <SelectItem value="INFO">Info</SelectItem>
                  <SelectItem value="WARNING">Warning</SelectItem>
                  <SelectItem value="PAYMENT">Payment</SelectItem>
                  <SelectItem value="MEMBERSHIP">Membership</SelectItem>
                  <SelectItem value="SEAT">Seat</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Recipient</Label>
              <Select value={form.member} onValueChange={(v) => setForm((f) => ({ ...f, member: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder={membersQuery.isLoading ? 'Loading…' : 'Select'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NONE}>Broadcast — all members</SelectItem>
                  {membersQuery.data?.data.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.full_name} ({m.member_id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!form.title || !form.message || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? 'Sending…' : 'Send'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
