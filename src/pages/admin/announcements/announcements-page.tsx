import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Megaphone, Plus } from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'

import { ConfirmDeleteAlert } from '@/components/common/confirm-delete-alert'
import { DataTable } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { announcementsApi } from '@/lib/api/announcements'
import type { Announcement } from '@/types/announcement'

import { AnnouncementFormDialog } from './announcement-form-dialog'
import { buildAnnouncementColumns } from './columns'

export function AnnouncementsPage() {
  const queryClient = useQueryClient()
  const [formAnnouncement, setFormAnnouncement] = useState<Announcement | null | 'new'>(null)
  const [deleteAnnouncement, setDeleteAnnouncement] = useState<Announcement | null>(null)

  const announcementsQuery = useQuery({ queryKey: ['announcements'], queryFn: () => announcementsApi.list({ page_size: 100 }) })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => announcementsApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['announcements'] })
      toast.success('Announcement deleted.')
      setDeleteAnnouncement(null)
    },
    onError: () => toast.error('Could not delete announcement.'),
  })

  const columns = useMemo(() => buildAnnouncementColumns({ onEdit: setFormAnnouncement, onDelete: setDeleteAnnouncement }), [])
  const announcements = announcementsQuery.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Announcements"
        description="Publish updates that members see on their dashboard."
        actions={
          <Button onClick={() => setFormAnnouncement('new')}>
            <Plus className="mr-2 h-4 w-4" />
            New Announcement
          </Button>
        }
      />

      {!announcementsQuery.isLoading && announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No announcements yet"
          action={
            <Button onClick={() => setFormAnnouncement('new')}>
              <Plus className="mr-2 h-4 w-4" />
              New Announcement
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} data={announcements} isLoading={announcementsQuery.isLoading} />
      )}

      <AnnouncementFormDialog announcement={formAnnouncement} onOpenChange={(open) => !open && setFormAnnouncement(null)} />
      <ConfirmDeleteAlert
        open={!!deleteAnnouncement}
        onOpenChange={(open) => !open && setDeleteAnnouncement(null)}
        title={`Delete "${deleteAnnouncement?.title}"?`}
        description="This announcement will no longer be visible to members. This can't be undone."
        onConfirm={() => deleteAnnouncement && deleteMutation.mutate(deleteAnnouncement.id)}
        isPending={deleteMutation.isPending}
      />
    </div>
  )
}
