import { LayoutGrid } from 'lucide-react'

import { EmptyState } from '@/components/common/empty-state'
import { cn } from '@/lib/utils'
import type { Seat } from '@/types/seat'

import { SeatStatusLegend } from './seat-legend'
import { SEAT_STATUS_META } from './seat-status'

interface SeatFloorPlanProps {
  seats: Seat[]
  isLoading: boolean
  onSelect: (seat: Seat) => void
}

interface SeatStack {
  section: string
  /** Seat positions in the order they physically read, top to bottom. */
  positions: number[]
}

/** Inclusive range that counts either up or down, so a stack can be declared
 *  in the direction it actually runs on the drawing. */
function range(from: number, to: number): number[] {
  const step = from <= to ? 1 : -1
  const out: number[] = []
  for (let i = from; ; i += step) {
    out.push(i)
    if (i === to) break
  }
  return out
}

// Geometry transcribed from the architect's ground-floor drawing (project
// RRGOD, drawing 01) for the 26'-0"x39'-0" hall. Rows A and D run down the
// west and east walls, E runs along the north wall, and B and C are each a
// pair of *facing* columns whose numbering turns around at the bottom of the
// block — B19 sits at the top of its left column and B20 at the top of the
// right, so the two halves count towards each other. Changing the physical
// room means editing these five constants and nothing else.
const A_COLUMN: SeatStack = { section: 'A', positions: range(21, 1) }
const E_ROW: SeatStack = { section: 'E', positions: range(8, 1) }
const D_COLUMN: SeatStack = { section: 'D', positions: range(14, 1) }
const B_BLOCK: SeatStack[] = [
  { section: 'B', positions: range(19, 1) },
  { section: 'B', positions: range(20, 38) },
]
const C_BLOCK: SeatStack[] = [
  { section: 'C', positions: range(17, 1) },
  { section: 'C', positions: range(18, 30) },
]

const ALL_STACKS = [A_COLUMN, E_ROW, D_COLUMN, ...B_BLOCK, ...C_BLOCK]

const slotKey = (section: string, position: number) => `${section.trim().toUpperCase()}#${position}`

/** Where a seat belongs on the plan. Prefers the explicit `position` field and
 *  falls back to the trailing digits of the seat number, so seats created
 *  before `position` existed still land in their slot. */
function seatSlotKey(seat: Seat): string | null {
  const position = seat.position ?? Number(seat.seat_number.match(/(\d+)\s*$/)?.[1])
  if (!Number.isFinite(position)) return null
  return slotKey(seat.section, position as number)
}

function SeatTile({ seat, onSelect }: { seat: Seat | undefined; onSelect: (seat: Seat) => void }) {
  if (!seat) {
    // An empty slot on the plan — the desk exists in the room but no seat
    // record matches it (or the active filter hid it). Drawn as an outline so
    // the room keeps its shape instead of collapsing.
    return <div className="h-9 w-9 rounded-md border border-dashed border-muted-foreground/25" aria-hidden />
  }
  return (
    <button
      type="button"
      title={`${seat.seat_number} — ${SEAT_STATUS_META[seat.status].label}`}
      onClick={() => onSelect(seat)}
      className={cn(
        'h-9 w-9 rounded-md text-[10px] font-semibold leading-none shadow-sm transition-transform hover:scale-110 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1',
        SEAT_STATUS_META[seat.status].chip,
      )}
    >
      {seat.seat_number}
    </button>
  )
}

function Stack({
  stack,
  bySlot,
  onSelect,
  horizontal,
}: {
  stack: SeatStack
  bySlot: Map<string, Seat>
  onSelect: (seat: Seat) => void
  horizontal?: boolean
}) {
  return (
    <div className={cn('flex gap-1.5', horizontal ? 'flex-row' : 'flex-col')}>
      {stack.positions.map((position) => (
        <SeatTile key={position} seat={bySlot.get(slotKey(stack.section, position))} onSelect={onSelect} />
      ))}
    </div>
  )
}

export function SeatFloorPlan({ seats, isLoading, onSelect }: SeatFloorPlanProps) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <SeatStatusLegend />
        <div className="mx-auto h-[40rem] w-full max-w-2xl animate-pulse rounded-xl bg-muted" />
      </div>
    )
  }

  if (seats.length === 0) {
    return (
      <EmptyState
        icon={LayoutGrid}
        title="No seats to show"
        description="Try a different search or filter, or add seats to start building your seating plan."
      />
    )
  }

  const bySlot = new Map<string, Seat>()
  for (const seat of seats) {
    const key = seatSlotKey(seat)
    if (key && !bySlot.has(key)) bySlot.set(key, seat)
  }

  // Anything the drawing has no desk for still has to be reachable, otherwise
  // adding a seat the plan doesn't know about would silently hide it.
  const placedIds = new Set<string>()
  for (const stack of ALL_STACKS) {
    for (const position of stack.positions) {
      const seat = bySlot.get(slotKey(stack.section, position))
      if (seat) placedIds.add(seat.id)
    }
  }
  const unplaced = seats.filter((seat) => !placedIds.has(seat.id))

  return (
    <div className="space-y-6">
      <SeatStatusLegend />

      <div className="overflow-x-auto">
        <div className="mx-auto w-fit rounded-xl border-2 bg-background p-4 shadow-sm">
          <div className="flex items-start gap-4">
            {/* West wall */}
            <Stack stack={A_COLUMN} bySlot={bySlot} onSelect={onSelect} />

            <div className="flex flex-col gap-4">
              {/* North wall */}
              <div className="flex justify-center">
                <Stack stack={E_ROW} bySlot={bySlot} onSelect={onSelect} horizontal />
              </div>

              {/* The two central blocks, each a pair of facing columns */}
              <div className="flex gap-6">
                {[B_BLOCK, C_BLOCK].map((block, blockIndex) => (
                  <div key={blockIndex} className="flex gap-1.5 rounded-md bg-muted/20 p-1.5">
                    {block.map((stack, stackIndex) => (
                      <Stack key={stackIndex} stack={stack} bySlot={bySlot} onSelect={onSelect} />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* East wall */}
            <Stack stack={D_COLUMN} bySlot={bySlot} onSelect={onSelect} />
          </div>
        </div>
      </div>

      {unplaced.length > 0 && (
        <div className="space-y-3 rounded-lg border border-dashed p-4">
          <div>
            <h3 className="text-sm font-semibold">Not on the floor plan</h3>
            <p className="text-xs text-muted-foreground">
              These seats don&#39;t match a desk on the drawing — check their section and position, or view them in the
              grid.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {unplaced.map((seat) => (
              <SeatTile key={seat.id} seat={seat} onSelect={onSelect} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
