import { useQuery } from '@tanstack/react-query'
import { BookOpen, Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'

import { DataTable } from '@/components/common/data-table'
import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/common/page-header'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { booksApi } from '@/lib/api/books'
import type { Book } from '@/types/book'

import { BookCategoriesPanel } from './book-categories-panel'
import { BookFormDialog } from './book-form-dialog'
import { buildBookColumns } from './columns'

export function BooksPage() {
  const [search, setSearch] = useState('')
  const [formBook, setFormBook] = useState<Book | null | 'new'>(null)

  const booksQuery = useQuery({
    queryKey: ['books', { search }],
    queryFn: () => booksApi.list({ search: search || undefined, page_size: 100 }),
  })

  const columns = useMemo(() => buildBookColumns({ onEdit: setFormBook }), [])
  const books = booksQuery.data?.data ?? []

  return (
    <div className="space-y-6">
      <PageHeader
        title="Books"
        description="Manage the digital library."
        actions={
          <Button onClick={() => setFormBook('new')}>
            <Plus className="mr-2 h-4 w-4" />
            Add Book
          </Button>
        }
      />

      <Tabs defaultValue="books">
        <TabsList>
          <TabsTrigger value="books">Books</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="books" className="space-y-4">
          <div className="relative max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search title or author…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          {!booksQuery.isLoading && books.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No books found"
              description={search ? 'Try a different search.' : 'Add your first book to get started.'}
              action={
                !search ? (
                  <Button onClick={() => setFormBook('new')}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Book
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <DataTable columns={columns} data={books} isLoading={booksQuery.isLoading} />
          )}
        </TabsContent>

        <TabsContent value="categories">
          <BookCategoriesPanel />
        </TabsContent>
      </Tabs>

      <BookFormDialog book={formBook} onOpenChange={(open) => !open && setFormBook(null)} />
    </div>
  )
}
