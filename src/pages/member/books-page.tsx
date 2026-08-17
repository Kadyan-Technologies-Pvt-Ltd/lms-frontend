import { useQuery } from '@tanstack/react-query'
import { BookOpen, ExternalLink, Search } from 'lucide-react'
import { useState } from 'react'

import { EmptyState } from '@/components/common/empty-state'
import { PageHeader } from '@/components/common/page-header'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { booksApi } from '@/lib/api/books'

export function MemberBooksPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')

  const categoriesQuery = useQuery({ queryKey: ['book-categories'], queryFn: booksApi.categories })
  const booksQuery = useQuery({
    queryKey: ['books', { search, category }],
    queryFn: () => booksApi.list({ search: search || undefined, category: category === 'ALL' ? undefined : category, page_size: 100 }),
  })

  const books = booksQuery.data?.data ?? []
  // The hosted copy wins over source_url. These were the wrong way round: for
  // an imported book, source_url is *provenance* (the publisher's catalogue
  // page, identical across every NCERT title) — not somewhere to read it. So
  // every imported book sent members to the same external page instead of the
  // PDF this library actually holds. source_url is now only the fallback, for
  // books catalogued as a link with no file attached.
  const readLink = (book: (typeof books)[number]) => book.hosted_file || book.source_url || undefined

  return (
    <div className="space-y-6">
      <PageHeader title="Books" description="Browse the digital library." />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search title or author…" className="pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-48">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All categories</SelectItem>
            {categoriesQuery.data?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {booksQuery.isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-40 w-full" />
          ))}
        </div>
      ) : books.length === 0 ? (
        <EmptyState icon={BookOpen} title="No books found" description="Try a different search or category." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((book) => (
            <Card key={book.id} className="hover-lift hover:shadow-elevated">
              <CardContent className="space-y-2 pt-6">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-medium leading-tight">{book.title}</h3>
                    {book.author && <p className="text-sm text-muted-foreground">{book.author}</p>}
                  </div>
                  <Badge variant="secondary">{book.license.replace('_', ' ')}</Badge>
                </div>
                {book.description && <p className="line-clamp-2 text-sm text-muted-foreground">{book.description}</p>}
                <Button size="sm" variant="outline" disabled={!readLink(book)} asChild={!!readLink(book)}>
                  {readLink(book) ? (
                    <a href={readLink(book)} target="_blank" rel="noreferrer">
                      <ExternalLink className="mr-2 h-3.5 w-3.5" />
                      Read
                    </a>
                  ) : (
                    <span>Unavailable</span>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
