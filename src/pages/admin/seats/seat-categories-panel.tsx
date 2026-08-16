import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Tag } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { EmptyState } from '@/components/common/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { seatCategoriesApi } from '@/lib/api/seats'
import type { SeatCategoryPayload } from '@/types/seat'

function CreateCategoryDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const queryClient = useQueryClient()
  const [form, setForm] = useState<SeatCategoryPayload>({ name: '', description: '' })

  const mutation = useMutation({
    mutationFn: seatCategoriesApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seat-categories'] })
      toast.success('Seat category created.')
      setForm({ name: '', description: '' })
      onOpenChange(false)
    },
    onError: () => toast.error('Could not create category.'),
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>New seat category</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Name</Label>
            <Input id="cat-name" placeholder="e.g. AC Cabin, General Hall" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cat-description">Description</Label>
            <Textarea
              id="cat-description"
              rows={2}
              placeholder="Optional"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!form.name || mutation.isPending} onClick={() => mutation.mutate(form)}>
            {mutation.isPending ? 'Creating…' : 'Create category'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function SeatCategoriesPanel() {
  const [createOpen, setCreateOpen] = useState(false)
  const categoriesQuery = useQuery({ queryKey: ['seat-categories'], queryFn: seatCategoriesApi.list })

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Category
        </Button>
      </div>

      {categoriesQuery.data?.length === 0 ? (
        <EmptyState icon={Tag} title="No seat categories yet" description="Create one so seats can be grouped and filtered." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {categoriesQuery.data?.map((cat) => (
            <Card key={cat.id}>
              <CardContent className="pt-6">
                <h3 className="font-medium">{cat.name}</h3>
                {cat.description && <p className="mt-1 text-sm text-muted-foreground">{cat.description}</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <CreateCategoryDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
