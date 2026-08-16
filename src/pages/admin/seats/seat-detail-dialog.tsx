import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { seatsApi } from '@/lib/api/seats'
import type { Seat, SeatStatus } from '@/types/seat'

import { SEAT_STATUS_META } from './seat-status'

interface SeatDetailDialogProps {
  seat: Seat | null
  onOpenChange: (open: boolean) => void
  onEdit: (seat: Seat) => void
  onManageAllocations: (seat: Seat) => void
}

// Same order as the seating-plan legend. OCCUPIED is settable by hand (for
// walk-ins and anyone sitting without a formal allocation record), but unlike
// RESERVED/BLOCKED it isn't sticky — see the caveat rendered below.
const QUICK_STATUSES: SeatStatus[] = ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'BLOCKED']

export function SeatDetailDialog({ seat, onOpenChange, onEdit, onManageAllocations }: SeatDetailDialogProps) {
  const queryClient = useQueryClient()

  const statusMutation = useMutation({
    mutationFn: (status: SeatStatus) => seatsApi.update(seat!.id, { status }),
    onSuccess: (_data, status) => {
      queryClient.invalidateQueries({ queryKey: ['seats'] })
      toast.success(`Seat ${seat?.seat_number} marked ${SEAT_STATUS_META[status].label.toLowerCase()}.`)
    },
    onError: () => toast.error('Could not update seat status.'),
  })

  if (!seat) return null

  const location = [seat.section, seat.floor && `Floor ${seat.floor}`, seat.room].filter(Boolean).join(' · ')

  return (
    <Dialog open={!!seat} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex flex-wrap items-center gap-2">
            Seat {seat.seat_number}
            <Badge variant="outline" className="font-normal">
              <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${SEAT_STATUS_META[seat.status].dot}`} />
              {SEAT_STATUS_META[seat.status].label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {location && <p className="text-sm text-muted-foreground">{location}</p>}
          {seat.notes && <p className="rounded-md bg-muted p-2 text-sm">{seat.notes}</p>}

          <div className="space-y-2">
            <p className="text-xs font-medium uppercase text-muted-foreground">Set status</p>
            <div className="grid grid-cols-2 gap-2">
              {QUICK_STATUSES.map((s) => (
                <Button
                  key={s}
                  size="sm"
                  variant={seat.status === s ? 'default' : 'outline'}
                  disabled={statusMutation.isPending}
                  onClick={() => statusMutation.mutate(s)}
                >
                  <span className={`mr-1.5 inline-block h-2 w-2 rounded-full ${SEAT_STATUS_META[s].dot}`} />
                  {SEAT_STATUS_META[s].label}
                </Button>
              ))}
            </div>
            {seat.status === 'OCCUPIED' && (
              <p className="text-xs text-muted-foreground">
                Occupied is normally derived from active allocations. Setting it by hand sticks, but it will be
                recalculated the next time this seat is allocated or released.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 border-t pt-4">
            <Button variant="outline" size="sm" onClick={() => onManageAllocations(seat)}>
              Manage allocations
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEdit(seat)}>
              Edit details
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
