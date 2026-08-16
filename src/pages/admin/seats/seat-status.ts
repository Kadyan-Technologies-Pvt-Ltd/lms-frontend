import type { SeatStatus } from '@/types/seat'

export const SEAT_STATUS_META: Record<SeatStatus, { label: string; dot: string; chip: string }> = {
  AVAILABLE: { label: 'Available', dot: 'bg-emerald-500', chip: 'bg-emerald-500 hover:bg-emerald-600 text-white' },
  RESERVED: { label: 'Reserved', dot: 'bg-amber-500', chip: 'bg-amber-500 hover:bg-amber-600 text-white' },
  OCCUPIED: { label: 'Occupied', dot: 'bg-red-500', chip: 'bg-red-500 hover:bg-red-600 text-white' },
  BLOCKED: { label: 'Blocked', dot: 'bg-slate-400', chip: 'bg-slate-400 hover:bg-slate-500 text-white' },
}

// Plain string comparison would sort "A-10" before "A-2" (since '1' < '2'
// lexicographically) — this splits into digit/non-digit chunks and compares
// numeric chunks numerically so seat numbers read in the order admins expect.
export function naturalCompare(a: string, b: string): number {
  const chunks = (s: string) => s.match(/\d+|\D+/g) ?? [s]
  const ac = chunks(a)
  const bc = chunks(b)
  const len = Math.max(ac.length, bc.length)
  for (let i = 0; i < len; i++) {
    const x = ac[i] ?? ''
    const y = bc[i] ?? ''
    if (x === y) continue
    if (/^\d+$/.test(x) && /^\d+$/.test(y)) {
      const diff = Number(x) - Number(y)
      if (diff !== 0) return diff
    } else {
      const cmp = x.localeCompare(y)
      if (cmp !== 0) return cmp
    }
  }
  return 0
}
