import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { seatCategoriesApi, seatsApi } from '@/lib/api/seats'
import type { Seat, SeatPayload, SeatStatus } from '@/types/seat'

interface SeatFormDialogProps {
  seat: Seat | null | 'new'
  onOpenChange: (open: boolean) => void
}

const STATUS_OPTIONS: SeatStatus[] = ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'BLOCKED']

const EMPTY_FORM: SeatPayload = {
  seat_number: '',
  section: '',
  floor: '',
  room: '',
  category: '',
  notes: '',
  status: 'AVAILABLE',
  position: null,
}

export function SeatFormDialog({ seat, onOpenChange }: SeatFormDialogProps) {
  const queryClient = useQueryClient()
  const isEdit = seat && seat !== 'new'
  const [form, setForm] = useState<SeatPayload>(EMPTY_FORM)

  const categoriesQuery = useQuery({ queryKey: ['seat-categories'], queryFn: seatCategoriesApi.list, enabled: !!seat })

  useEffect(() => {
    if (isEdit) {
      setForm({
        seat_number: seat.seat_number,
        section: seat.section,
        floor: seat.floor,
        room: seat.room,
        category: seat.category ?? '',
        notes: seat.notes,
        status: seat.status,
        position: seat.position,
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [seat, isEdit])

  const mutation = useMutation({
    mutationFn: () => (isEdit ? seatsApi.update(seat.id, form) : seatsApi.create(form)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seats'] })
      toast.success(isEdit ? 'Seat updated.' : 'Seat created.')
      onOpenChange(false)
    },
    onError: () => toast.error('Could not save seat — check the seat number is unique.'),
  })

  return (
    <Dialog open={!!seat} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit seat ${seat.seat_number}` : 'New seat'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="seat_number">Seat number</Label>
            <Input
              id="seat_number"
              placeholder="e.g. A-12"
              value={form.seat_number}
              onChange={(e) => setForm((f) => ({ ...f, seat_number: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label htmlFor="section">Section / Row</Label>
              <Input
                id="section"
                placeholder="e.g. Row A"
                value={form.section}
                onChange={(e) => setForm((f) => ({ ...f, section: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">Floor</Label>
              <Input id="floor" placeholder="Optional" value={form.floor} onChange={(e) => setForm((f) => ({ ...f, floor: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room">Room</Label>
              <Input id="room" placeholder="Optional" value={form.room} onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))} />
            </div>
          </div>
          <p className="-mt-2 text-xs text-muted-foreground">
            Seats sharing the same Section/Row are grouped together in the seating plan grid.
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesQuery.data?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => setForm((f) => ({ ...f, status: v as SeatStatus }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Position in row (optional)</Label>
            <Input
              id="position"
              type="number"
              min={0}
              placeholder="Left-to-right order in the seating plan grid"
              value={form.position ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, position: e.target.value === '' ? null : Number(e.target.value) }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Any internal notes about this seat (optional)"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!form.seat_number || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create seat'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
