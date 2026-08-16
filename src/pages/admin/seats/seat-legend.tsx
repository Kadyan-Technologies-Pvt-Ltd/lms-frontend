import { cn } from '@/lib/utils'
import type { SeatStatus } from '@/types/seat'

import { SEAT_STATUS_META } from './seat-status'

const LEGEND_STATUSES: SeatStatus[] = ['AVAILABLE', 'RESERVED', 'OCCUPIED', 'BLOCKED']

/** Shared by the floor-plan and grid views so the two can't drift apart. */
export function SeatStatusLegend() {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
      {LEGEND_STATUSES.map((status) => (
        <div key={status} className="flex items-center gap-1.5">
          <span className={cn('h-3 w-3 rounded-sm', SEAT_STATUS_META[status].dot)} />
          <span className="text-muted-foreground">{SEAT_STATUS_META[status].label}</span>
        </div>
      ))}
    </div>
  )
}
