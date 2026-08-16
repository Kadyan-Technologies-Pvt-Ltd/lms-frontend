import { LayoutGrid } from 'lucide-react'

import { EmptyState } from '@/components/common/empty-state'
import { cn } from '@/lib/utils'
import type { Seat } from '@/types/seat'

import { SeatStatusLegend } from './seat-legend'
import { naturalCompare, SEAT_STATUS_META } from './seat-status'

interface SeatMapViewProps {
  seats: Seat[]
  isLoading: boolean
  onSelect: (seat: Seat) => void
}

function groupBySection(seats: Seat[]): [string, Seat[]][] {
  const groups = new Map<string, Seat[]>()
  for (const seat of seats) {
    const key = seat.section.trim() || 'Unassigned'
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key)!.push(seat)
  }
  // position (when set) wins as the manual override; unset seats fall back
  // to a natural sort of seat_number and sort after any explicitly-placed ones.
  for (const group of groups.values()) {
    group.sort((a, b) => {
      if (a.position != null && b.position != null) return a.position - b.position
      if (a.position != null) return -1
      if (b.position != null) return 1
      return naturalCompare(a.seat_number, b.seat_number)
    })
  }
  return [...groups.entries()].sort(([a], [b]) => naturalCompare(a, b))
}

export function SeatMapView({ seats, isLoading, onSelect }: SeatMapViewProps) {
  if (!isLoading && seats.length === 0) {
    return (
      <EmptyState
        icon={LayoutGrid}
        title="No seats to show"
        description="Try a different search or filter, or add seats to start building your seating plan."
      />
    )
  }

  const groups = groupBySection(seats)

  return (
    <div className="space-y-6">
      <SeatStatusLegend />

      {isLoading ? (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-2">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="aspect-square animate-pulse rounded-lg bg-muted" />
          ))}
        </div>
      ) : (
        groups.map(([section, sectionSeats]) => (
          <div key={section} className="space-y-3 rounded-lg border p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">{section}</h3>
              <span className="text-xs text-muted-foreground">
                {sectionSeats.length} seat{sectionSeats.length === 1 ? '' : 's'}
              </span>
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-2">
              {sectionSeats.map((seat) => (
                <button
                  key={seat.id}
                  type="button"
                  title={`${seat.seat_number} — ${SEAT_STATUS_META[seat.status].label}`}
                  onClick={() => onSelect(seat)}
                  className={cn(
                    'flex aspect-square items-center justify-center rounded-lg px-1 text-[11px] font-semibold shadow-sm transition-transform hover:scale-105 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
                    SEAT_STATUS_META[seat.status].chip,
                  )}
                >
                  {seat.seat_number}
                </button>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
