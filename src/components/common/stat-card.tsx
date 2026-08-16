import type { LucideIcon } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  icon?: LucideIcon
  hint?: string
  isLoading?: boolean
  className?: string
}

export function StatCard({ label, value, icon: Icon, hint, isLoading, className }: StatCardProps) {
  return (
    <Card className={cn('hover-lift hover:shadow-elevated', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        {Icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary/15 to-[hsl(var(--primary-glow))]/15 text-primary">
            <Icon className="h-4 w-4" />
          </div>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <p className="text-3xl font-bold">{value}</p>
        )}
        {/* Always render this line, even blank — so cards with and without a
            hint stay the same height and line up cleanly within a row. */}
        <p className={cn('mt-1 text-xs text-muted-foreground', (!hint || isLoading) && 'invisible')}>
          {hint || ' '}
        </p>
      </CardContent>
    </Card>
  )
}
