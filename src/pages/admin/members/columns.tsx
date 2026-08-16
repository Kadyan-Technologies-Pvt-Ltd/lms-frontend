import type { ColumnDef } from '@tanstack/react-table'
import { MoreHorizontal, Trash2 } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { MemberProfile, MemberStatus } from '@/types/member'

const STATUS_VARIANT: Record<MemberStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  ACTIVE: 'default',
  SUSPENDED: 'outline',
  EXPIRED: 'secondary',
  LEFT: 'secondary',
  BLACKLISTED: 'destructive',
}

interface MemberRowActions {
  onEdit: (member: MemberProfile) => void
  onAssignMembership: (member: MemberProfile) => void
  onAdjustPoints: (member: MemberProfile) => void
  onRegisterBiometric: (member: MemberProfile) => void
  onBlacklist: (member: MemberProfile) => void
  onRestore: (member: MemberProfile) => void
  onDelete: (member: MemberProfile) => void
}

export function buildMemberColumns(actions: MemberRowActions, lowPointThreshold: number): ColumnDef<MemberProfile>[] {
  return [
    {
      accessorKey: 'member_id',
      header: 'Member ID',
      cell: ({ row }) => <span className="font-mono text-sm">{row.original.member_id}</span>,
    },
    {
      accessorKey: 'full_name',
      header: 'Name',
      cell: ({ row }) => (
        <div>
          <p className="font-medium">{row.original.full_name}</p>
          <p className="text-xs text-muted-foreground">{row.original.email}</p>
        </div>
      ),
    },
    { accessorKey: 'mobile', header: 'Mobile' },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => <Badge variant={STATUS_VARIANT[row.original.status]}>{row.original.status}</Badge>,
    },
    {
      accessorKey: 'points',
      header: 'Points',
      cell: ({ row }) => {
        const points = row.original.points
        const isLow = points <= lowPointThreshold
        return (
          <span className={isLow ? 'font-semibold text-destructive' : ''}>
            {points}/10{isLow && ' ⚠'}
          </span>
        )
      },
    },
    { accessorKey: 'joining_date', header: 'Joined' },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => {
        const member = row.original
        const isBlacklisted = member.status === 'BLACKLISTED'
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Row actions">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => actions.onEdit(member)}>Edit</DropdownMenuItem>
              <DropdownMenuItem onClick={() => actions.onAssignMembership(member)}>Assign membership</DropdownMenuItem>
              <DropdownMenuItem onClick={() => actions.onAdjustPoints(member)}>Adjust points</DropdownMenuItem>
              <DropdownMenuItem onClick={() => actions.onRegisterBiometric(member)}>
                {member.biometric_uid ? 'Re-register biometric' : 'Register biometric'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isBlacklisted ? (
                <DropdownMenuItem onClick={() => actions.onRestore(member)}>Restore</DropdownMenuItem>
              ) : (
                <DropdownMenuItem className="text-destructive" onClick={() => actions.onBlacklist(member)}>
                  Blacklist
                </DropdownMenuItem>
              )}
              <DropdownMenuItem className="text-destructive" onClick={() => actions.onDelete(member)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete permanently
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]
}
