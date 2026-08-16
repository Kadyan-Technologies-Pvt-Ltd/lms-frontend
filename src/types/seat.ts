export type SeatStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'BLOCKED'

export interface Shift {
  id: string
  name: string
  start_time: string
  end_time: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ShiftPayload {
  name: string
  start_time: string
  end_time: string
  is_active?: boolean
}

export interface SeatCategory {
  id: string
  name: string
  description: string
  created_at: string
  updated_at: string
}

export interface SeatCategoryPayload {
  name: string
  description?: string
}

export interface Seat {
  id: string
  seat_number: string
  section: string
  floor: string
  room: string
  category: string | null
  status: SeatStatus
  notes: string
  position: number | null
  created_at: string
  updated_at: string
}

export interface SeatPayload {
  seat_number: string
  section?: string
  floor?: string
  room?: string
  category?: string
  status?: SeatStatus
  notes?: string
  position?: number | null
}

export interface SeatAllocation {
  id: string
  seat: string
  member: string
  member_name: string
  member_id_display: string
  shift: string
  shift_detail: Shift
  allocated_at: string
  released_at: string | null
  allocated_by: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SeatAllocationPayload {
  seat: string
  member: string
  shift: string
}
