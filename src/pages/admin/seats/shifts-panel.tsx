import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock, Plus } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/common/empty-state'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { shiftsApi } from '@/lib/api/seats'
import type { ShiftPayload } from '@/types/seat'

function CreateShiftDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<ShiftPayload>({ name: '', start_time: '06:00', end_time: '12:00' })

  const mutation = useMutation({
    mutationFn: shiftsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] })
      toast.success('Shift created.')
      setForm({ name: '', start_time: '06:00', end_time: '12:00' })
      onOpenChange(false)
    },
    onError: () => toast.error('Could not create shift.'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New shift</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="shift-name">Name</Label>
            <Input id="shift-name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="shift-start">Start time</Label>
              <Input
                id="shift-start"
                type="time"
                value={form.start_time}
                onChange={(e) => setForm((f) => ({ ...f, start_time: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shift-end">End time</Label>
              <Input
                id="shift-end"
                type="time"
                value={form.end_time}
                onChange={(e) => setForm((f) => ({ ...f, end_time: e.target.value }))}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!form.name || mutation.isPending} onClick={() => mutation.mutate(form)}>
            {mutation.isPending ? 'Creating…' : 'Create shift'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function ShiftsPanel() {
  const [createOpen, setCreateOpen] = useState(false)
  const shiftsQuery = useQuery({ queryKey: ['shifts'], queryFn: shiftsApi.list })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Shift
        </Button>
      </div>

      {shiftsQuery.data?.length === 0 ? (
        <EmptyState icon={Clock} title="No shifts yet" description="Add shifts (Morning, Evening, ...) so seats can be allocated." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shiftsQuery.data?.map((shift) => (
            <Card key={shift.id}>
              <CardContent className="flex items-center justify-between pt-6">
                <div>
                  <h3 className="font-medium">{shift.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {shift.start_time}–{shift.end_time}
                  </p>
                </div>
                <Badge variant={shift.is_active ? 'default' : 'secondary'}>{shift.is_active ? 'Active' : 'Inactive'}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateShiftDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
