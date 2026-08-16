import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { membersApi } from '@/lib/api/members'
import { seatAllocationsApi, shiftsApi } from '@/lib/api/seats'
import type { Seat } from '@/types/seat'

interface ManageAllocationsDialogProps {
  seat: Seat | null
  onOpenChange: (open: boolean) => void
}

function ShiftRow({ seat, shiftId, shiftLabel }: { seat: Seat; shiftId: string; shiftLabel: string }) {
  const queryClient = useQueryClient()
  const [selectedMember, setSelectedMember] = useState('')

  const allocationsQuery = useQuery({
    queryKey: ['seat-allocations', seat.id],
    queryFn: () => seatAllocationsApi.listForSeat(seat.id),
  })
  const membersQuery = useQuery({
    queryKey: ['members', { status: 'ACTIVE' }],
    queryFn: () => membersApi.list({ status: 'ACTIVE', page_size: 100 }),
  })

  const allocation = allocationsQuery.data?.find((a) => a.shift === shiftId)

  const assignMutation = useMutation({
    mutationFn: () => seatAllocationsApi.create({ seat: seat.id, member: selectedMember, shift: shiftId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seat-allocations', seat.id] })
      queryClient.invalidateQueries({ queryKey: ['seats'] })
      toast.success(`Seat ${seat.seat_number} assigned for ${shiftLabel}.`)
      setSelectedMember('')
    },
    onError: () => toast.error('Could not assign — that shift may already be taken.'),
  })

  const releaseMutation = useMutation({
    mutationFn: () => seatAllocationsApi.release(allocation!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seat-allocations', seat.id] })
      queryClient.invalidateQueries({ queryKey: ['seats'] })
      toast.success(`${shiftLabel} allocation released.`)
    },
    onError: () => toast.error('Could not release allocation.'),
  })

  if (allocationsQuery.isLoading) {
    return <Skeleton className="h-10 w-full" />
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border p-3">
      <span className="text-sm font-medium">{shiftLabel}</span>
      {allocation ? (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {allocation.member_name} ({allocation.member_id_display})
          </span>
          <Button size="sm" variant="outline" disabled={releaseMutation.isPending} onClick={() => releaseMutation.mutate()}>
            {releaseMutation.isPending ? 'Releasing…' : 'Release'}
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Select value={selectedMember} onValueChange={setSelectedMember}>
            <SelectTrigger className="h-9 w-48">
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
          <Button size="sm" disabled={!selectedMember || assignMutation.isPending} onClick={() => assignMutation.mutate()}>
            {assignMutation.isPending ? 'Assigning…' : 'Assign'}
          </Button>
        </div>
      )}
    </div>
  )
}

export function ManageAllocationsDialog({ seat, onOpenChange }: ManageAllocationsDialogProps) {
  const shiftsQuery = useQuery({ queryKey: ['shifts'], queryFn: shiftsApi.list, enabled: !!seat })

  return (
    <Dialog open={!!seat} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Allocations — Seat {seat?.seat_number}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {shiftsQuery.isLoading && <Skeleton className="h-10 w-full" />}
          {shiftsQuery.data?.length === 0 && (
            <p className="text-sm text-muted-foreground">No shifts configured yet — add one in the Shifts tab first.</p>
          )}
          {seat &&
            shiftsQuery.data
              ?.filter((s) => s.is_active)
              .map((shift) => (
                <ShiftRow
                  key={shift.id}
                  seat={seat}
                  shiftId={shift.id}
                  shiftLabel={`${shift.name} (${shift.start_time}–${shift.end_time})`}
                />
              ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
