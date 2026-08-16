import { useQuery } from '@tanstack/react-query'
import { LayoutGrid, List, Map, Plus, Search, Sofa } from 'lucide-react'
import { useMemo, useState } from 'react'

import { DataTable } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { seatsApi } from '@/lib/api/seats'
import type { Seat, SeatStatus } from '@/types/seat'

import { buildSeatColumns } from './columns'
import { ManageAllocationsDialog } from './manage-allocations-dialog'
import { SeatCategoriesPanel } from './seat-categories-panel'
import { SeatDetailDialog } from './seat-detail-dialog'
import { SeatFloorPlan } from './seat-floor-plan'
import { SeatFormDialog } from './seat-form-dialog'
import { SeatMapView } from './seat-map-view'
import { ShiftsPanel } from './shifts-panel'

const STATUS_OPTIONS: SeatStatus[] = ['AVAILABLE', 'OCCUPIED', 'RESERVED', 'BLOCKED']

export function SeatsPage() {
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<SeatStatus | 'ALL'>('ALL')
  const [view, setView] = useState<'plan' | 'grid' | 'table'>('plan')
  const [formSeat, setFormSeat] = useState<Seat | null | 'new'>(null)
  const [allocationsSeat, setAllocationsSeat] = useState<Seat | null>(null)
  const [detailSeatId, setDetailSeatId] = useState<string | null>(null)

  const seatsQuery = useQuery({
    queryKey: ['seats', { search, status }],
    queryFn: () => seatsApi.list({ search: search || undefined, status: status === 'ALL' ? undefined : status, page_size: 500 }),
  })

  const columns = useMemo(() => buildSeatColumns({ onEdit: setFormSeat, onManageAllocations: setAllocationsSeat }), [])
  const seats = seatsQuery.data?.data ?? []

  // Track the open seat by id and re-derive it from the query on every render,
  // rather than holding the Seat object captured at click time — a snapshot
  // goes stale the moment the detail dialog changes the seat's status, leaving
  // the dialog showing the old status while the grid behind it shows the new
  // one. If the change pushes the seat out of the active status filter it
  // drops out of `seats` and the dialog closes, which matches the tile
  // disappearing from the grid.
  const detailSeat = detailSeatId ? (seats.find((s) => s.id === detailSeatId) ?? null) : null

  // A seat map that quietly drops seats is worse than no map: the page asks
  // for one big page rather than paginating, so if the library ever outgrows
  // the endpoint's ceiling, say so instead of drawing an incomplete room.
  const totalCount = seatsQuery.data?.pagination?.count
  const isTruncated = totalCount != null && totalCount > seats.length

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seats"
        description="Manage seats, shifts, and seat categories."
        actions={
          <Button onClick={() => setFormSeat('new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Seat
          </Button>
        }
      />

      <Tabs defaultValue="seats">
        <TabsList>
          <TabsTrigger value="seats">Seats</TabsTrigger>
          <TabsTrigger value="shifts">Shifts</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="seats" className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search seat, section, room…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            <Select value={status} onValueChange={(v) => setStatus(v as SeatStatus | 'ALL')}>
              <SelectTrigger className="sm:w-48">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All statuses</SelectItem>
                {STATUS_OPTIONS.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1 rounded-md border p-1 sm:ml-auto">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className={cn('h-8 px-2.5', view === 'plan' && 'bg-secondary')}
                onClick={() => setView('plan')}
              >
                <Map className="mr-1.5 h-4 w-4" />
                Floor plan
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className={cn('h-8 px-2.5', view === 'grid' && 'bg-secondary')}
                onClick={() => setView('grid')}
              >
                <LayoutGrid className="mr-1.5 h-4 w-4" />
                Grid
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                className={cn('h-8 px-2.5', view === 'table' && 'bg-secondary')}
                onClick={() => setView('table')}
              >
                <List className="mr-1.5 h-4 w-4" />
                Table
              </Button>
            </div>
          </div>

          {isTruncated && (
            <p className="rounded-md border border-amber-500/50 bg-amber-500/10 px-3 py-2 text-sm text-amber-700 dark:text-amber-400">
              Showing {seats.length} of {totalCount} seats — this view can&#39;t display them all. Narrow the results with
              search or a status filter to see the rest.
            </p>
          )}

          {!seatsQuery.isLoading && seats.length === 0 ? (
            <EmptyState
              icon={Sofa}
              title="No seats found"
              description={search || status !== 'ALL' ? 'Try a different search or filter.' : 'Add your first seat to get started.'}
              action={
                !search && status === 'ALL' ? (
                  <Button onClick={() => setFormSeat('new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Seat
                  </Button>
                ) : undefined
              }
            />
          ) : view === 'plan' ? (
            <SeatFloorPlan seats={seats} isLoading={seatsQuery.isLoading} onSelect={(seat) => setDetailSeatId(seat.id)} />
          ) : view === 'grid' ? (
            <SeatMapView seats={seats} isLoading={seatsQuery.isLoading} onSelect={(seat) => setDetailSeatId(seat.id)} />
          ) : (
            <DataTable columns={columns} data={seats} isLoading={seatsQuery.isLoading} />
          )}
        </TabsContent>

        <TabsContent value="shifts">
          <ShiftsPanel />
        </TabsContent>

        <TabsContent value="categories">
          <SeatCategoriesPanel />
        </TabsContent>
      </Tabs>

      <SeatDetailDialog
        seat={detailSeat}
        onOpenChange={(open) => !open && setDetailSeatId(null)}
        onEdit={(seat) => {
          setDetailSeatId(null)
          setFormSeat(seat)
        }}
        onManageAllocations={(seat) => {
          setDetailSeatId(null)
          setAllocationsSeat(seat)
        }}
      />
      <SeatFormDialog seat={formSeat} onOpenChange={(open) => !open && setFormSeat(null)} />
      <ManageAllocationsDialog seat={allocationsSeat} onOpenChange={(open) => !open && setAllocationsSeat(null)} />
    </div>
  )
}
