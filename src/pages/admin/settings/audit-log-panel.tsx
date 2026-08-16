import { useQuery } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { History, Search } from 'lucide-react'
import { useState } from 'react'

import { DataTable } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/empty-state'
import { Input } from '@/components/ui/input'
import { auditApi } from '@/lib/api/audit'
import type { AuditLog } from '@/types/audit'

const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: 'created_at',
    header: 'When',
    cell: ({ row }) => new Date(row.original.created_at).toLocaleString('en-IN'),
  },
  { accessorKey: 'action', header: 'Action' },
  { accessorKey: 'actor_email', header: 'Actor', cell: ({ row }) => row.original.actor_email ?? '—' },
  { accessorKey: 'description', header: 'Description' },
  {
    accessorKey: 'target_type_name',
    header: 'Target',
    cell: ({ row }) => (row.original.target_type_name ? `${row.original.target_type_name} #${row.original.target_id}` : '—'),
  },
]

export function AuditLogPanel() {
  const [search, setSearch] = useState('')

  const logsQuery = useQuery({
    queryKey: ['audit', { search }],
    queryFn: () => auditApi.list({ search: search || undefined, page_size: 100 }),
  })

  const logs = logsQuery.data?.data ?? []

  return (
    <div className="space-y-4">
      <div className="relative max-w-xs">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search action, actor…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {!logsQuery.isLoading && logs.length === 0 ? (
        <EmptyState icon={History} title="No audit events" description={search ? 'Try a different search.' : 'Sensitive actions will appear here as they happen.'} />
      ) : (
        <DataTable columns={columns} data={logs} isLoading={logsQuery.isLoading} />
      )}
    </div>
  )
}
