import { Download, Receipt, UserRound, Wallet, CalendarCheck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { reportsApi } from '@/lib/api/reports'
import type { ExportKind } from '@/types/reports'

const EXPORTS: { kind: ExportKind; label: string; description: string; icon: typeof UserRound; dateFiltered: boolean }[] = [
  { kind: 'members', label: 'Members', description: 'All member profiles.', icon: UserRound, dateFiltered: false },
  { kind: 'payments', label: 'Payments', description: 'Payment transactions.', icon: Wallet, dateFiltered: true },
  { kind: 'expenses', label: 'Expenses', description: 'Recorded expenses.', icon: Receipt, dateFiltered: true },
  { kind: 'attendance', label: 'Attendance', description: 'Attendance punches.', icon: CalendarCheck, dateFiltered: true },
]

export function ExportsPanel() {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [downloading, setDownloading] = useState<ExportKind | null>(null)

  async function handleDownload(kind: ExportKind, dateFiltered: boolean) {
    setDownloading(kind)
    try {
      await reportsApi.downloadExport(kind, dateFiltered ? { from, to } : undefined)
    } catch {
      toast.error('Could not generate export.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Date range</CardTitle>
          <CardDescription>Applies to Payments, Expenses, and Attendance exports. Leave blank for all-time.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <div className="space-y-2">
            <Label htmlFor="export-from">From</Label>
            <Input id="export-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="export-to">To</Label>
            <Input id="export-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {EXPORTS.map(({ kind, label, description, icon: Icon, dateFiltered }) => (
          <Card key={kind}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-xs text-muted-foreground">{description}</p>
              <Button
                size="sm"
                variant="outline"
                className="w-full"
                disabled={downloading === kind}
                onClick={() => handleDownload(kind, dateFiltered)}
              >
                <Download className="mr-2 h-4 w-4" />
                {downloading === kind ? 'Preparing…' : 'Download CSV'}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
