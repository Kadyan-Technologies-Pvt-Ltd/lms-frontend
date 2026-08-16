import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { announcementsApi } from '@/lib/api/announcements'
import { membersApi } from '@/lib/api/members'
import type { Announcement, AnnouncementPayload, AnnouncementPriority, AnnouncementTarget } from '@/types/announcement'

interface AnnouncementFormDialogProps {
  announcement: Announcement | null | 'new'
  onOpenChange: (open: boolean) => void
}

function nowForInput() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

function toInputDatetime(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

const emptyForm = (): AnnouncementPayload => ({
  title: '',
  content: '',
  target: 'ALL',
  member: undefined,
  published_at: nowForInput(),
  expires_at: undefined,
  priority: 'NORMAL',
  is_active: true,
})

export function AnnouncementFormDialog({ announcement, onOpenChange }: AnnouncementFormDialogProps) {
  const queryClient = useQueryClient()
  const isEdit = announcement && announcement !== 'new'
  const [form, setForm] = useState<AnnouncementPayload>(emptyForm())

  const membersQuery = useQuery({
    queryKey: ['members', { status: 'ACTIVE' }],
    queryFn: () => membersApi.list({ status: 'ACTIVE', page_size: 100 }),
    enabled: !!announcement && form.target === 'SPECIFIC_MEMBER',
  })

  useEffect(() => {
    if (isEdit) {
      setForm({
        title: announcement.title,
        content: announcement.content,
        target: announcement.target,
        member: announcement.member ?? undefined,
        published_at: toInputDatetime(announcement.published_at),
        expires_at: toInputDatetime(announcement.expires_at) || undefined,
        priority: announcement.priority,
        is_active: announcement.is_active,
      })
    } else {
      setForm(emptyForm())
    }
  }, [announcement, isEdit])

  const mutation = useMutation({
    mutationFn: () => {
      const payload: AnnouncementPayload = {
        ...form,
        published_at: new Date(form.published_at).toISOString(),
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : undefined,
      }
      return isEdit ? announcementsApi.update(announcement.id, payload) : announcementsApi.create(payload)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      toast.success(isEdit ? 'Announcement updated.' : 'Announcement published.')
      onOpenChange(false)
    },
    onError: () => toast.error('Could not save announcement. Check the form for errors.'),
  })

  return (
    <Dialog open={!!announcement} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit announcement' : 'New announcement'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ann-title">Title</Label>
            <Input
              id="ann-title"
              placeholder="e.g. Library closed for maintenance"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ann-content">Content</Label>
            <Textarea
              id="ann-content"
              rows={3}
              placeholder="Write the announcement details here…"
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Target</Label>
              <Select
                value={form.target}
                onValueChange={(v) => setForm((f) => ({ ...f, target: v as AnnouncementTarget, member: undefined }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All members</SelectItem>
                  <SelectItem value="SPECIFIC_MEMBER">Specific member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={form.priority} onValueChange={(v) => setForm((f) => ({ ...f, priority: v as AnnouncementPriority }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">Normal</SelectItem>
                  <SelectItem value="HIGH">High</SelectItem>
                  <SelectItem value="URGENT">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {form.target === 'SPECIFIC_MEMBER' && (
            <div className="space-y-2">
              <Label>Member</Label>
              <Select value={form.member ?? ''} onValueChange={(v) => setForm((f) => ({ ...f, member: v }))}>
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
          )}

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="ann-published">Published at</Label>
              <Input
                id="ann-published"
                type="datetime-local"
                value={form.published_at}
                onChange={(e) => setForm((f) => ({ ...f, published_at: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ann-expires">Expires at (optional)</Label>
              <Input
                id="ann-expires"
                type="datetime-local"
                value={form.expires_at ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, expires_at: e.target.value || undefined }))}
              />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <Label htmlFor="ann-active">Active</Label>
            <Switch id="ann-active" checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!form.title || !form.content || (form.target === 'SPECIFIC_MEMBER' && !form.member) || mutation.isPending}
            onClick={() => mutation.mutate()}
          >
            {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Publish'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
