import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { booksApi } from '@/lib/api/books'
import type { Book, BookFormValues, BookLicense } from '@/types/book'

interface BookFormDialogProps {
  book: Book | null | 'new'
  onOpenChange: (open: boolean) => void
}

const EMPTY_FORM: BookFormValues = {
  title: '',
  author: '',
  description: '',
  category: '',
  language: '',
  publication_year: '',
  source_url: '',
  license: 'PUBLIC_DOMAIN',
  license_url: '',
  is_active: true,
  cover_image: null,
  hosted_file: null,
}

const LICENSE_OPTIONS: { value: BookLicense; label: string }[] = [
  { value: 'PUBLIC_DOMAIN', label: 'Public Domain' },
  { value: 'CC', label: 'Creative Commons' },
  { value: 'OPEN_ACCESS', label: 'Open Access' },
  { value: 'OTHER', label: 'Other' },
]

export function BookFormDialog({ book, onOpenChange }: BookFormDialogProps) {
  const queryClient = useQueryClient()
  const isEdit = book && book !== 'new'
  const [form, setForm] = useState<BookFormValues>(EMPTY_FORM)

  const categoriesQuery = useQuery({ queryKey: ['book-categories'], queryFn: booksApi.categories, enabled: !!book })

  useEffect(() => {
    if (isEdit) {
      setForm({
        title: book.title,
        author: book.author,
        description: book.description,
        category: book.category ?? '',
        language: book.language,
        publication_year: book.publication_year ? String(book.publication_year) : '',
        source_url: book.source_url,
        license: book.license,
        license_url: book.license_url,
        is_active: book.is_active,
        cover_image: null,
        hosted_file: null,
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [book, isEdit])

  const mutation = useMutation({
    mutationFn: () => (isEdit ? booksApi.update(book.id, form) : booksApi.create(form)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books'] })
      toast.success(isEdit ? 'Book updated.' : 'Book added.')
      onOpenChange(false)
    },
    onError: () => toast.error('Could not save book. Check the form for errors.'),
  })

  return (
    <Dialog open={!!book} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? `Edit ${book.title}` : 'Add book'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="book-title">Title</Label>
            <Input id="book-title" placeholder="Book title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="book-author">Author</Label>
              <Input id="book-author" placeholder="Optional" value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={form.category} onValueChange={(v) => setForm((f) => ({ ...f, category: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesQuery.data?.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-description">Description</Label>
            <Textarea
              id="book-description"
              rows={2}
              placeholder="A short summary (optional)"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="book-language">Language</Label>
              <Input id="book-language" placeholder="e.g. English, Hindi" value={form.language} onChange={(e) => setForm((f) => ({ ...f, language: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="book-year">Publication year</Label>
              <Input
                id="book-year"
                type="number"
                placeholder="e.g. 2024"
                value={form.publication_year}
                onChange={(e) => setForm((f) => ({ ...f, publication_year: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-source-url">Source URL (external reading link)</Label>
            <Input
              id="book-source-url"
              type="url"
              placeholder="https://example.com/book"
              value={form.source_url}
              onChange={(e) => setForm((f) => ({ ...f, source_url: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>License</Label>
              <Select value={form.license} onValueChange={(v) => setForm((f) => ({ ...f, license: v as BookLicense }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LICENSE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="book-license-url">License URL</Label>
              <Input
                id="book-license-url"
                type="url"
                placeholder="Optional"
                value={form.license_url}
                onChange={(e) => setForm((f) => ({ ...f, license_url: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-cover">Cover image {isEdit && book.cover_image && '(replace)'}</Label>
            <Input
              id="book-cover"
              type="file"
              accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
              onChange={(e) => setForm((f) => ({ ...f, cover_image: e.target.files?.[0] ?? null }))}
            />
            <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP, up to 5MB.</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="book-file">Hosted file {isEdit && book.hosted_file && '(replace)'} — only if legally permitted</Label>
            <Input
              id="book-file"
              type="file"
              accept=".pdf,.epub,.txt,application/pdf,application/epub+zip,text/plain"
              onChange={(e) => setForm((f) => ({ ...f, hosted_file: e.target.files?.[0] ?? null }))}
            />
            <p className="text-xs text-muted-foreground">PDF, EPUB, or TXT, up to 50MB.</p>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <Label htmlFor="book-active">Visible to members</Label>
            <Switch id="book-active" checked={form.is_active} onCheckedChange={(v) => setForm((f) => ({ ...f, is_active: v }))} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button disabled={!form.title || mutation.isPending} onClick={() => mutation.mutate()}>
            {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Add book'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
