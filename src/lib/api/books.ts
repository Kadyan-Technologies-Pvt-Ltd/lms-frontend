import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { Book, BookCategory, BookCategoryPayload, BookFormValues } from '@/types/book'

function toFormData(values: BookFormValues): FormData {
  const formData = new FormData()
  formData.append('title', values.title)
  // is_active must always be sent explicitly: DRF's multipart parser treats
  // an omitted BooleanField as False (HTML-checkbox semantics), not "use
  // the model default" — silently deactivating every new book otherwise.
  formData.append('is_active', String(values.is_active))

  const optionalText: [string, string][] = [
    ['author', values.author],
    ['description', values.description],
    ['category', values.category],
    ['language', values.language],
    ['publication_year', values.publication_year],
    ['source_url', values.source_url],
    ['license', values.license],
    ['license_url', values.license_url],
  ]
  for (const [key, value] of optionalText) {
    if (value) formData.append(key, value)
  }

  if (values.cover_image) formData.append('cover_image', values.cover_image)
  if (values.hosted_file) formData.append('hosted_file', values.hosted_file)

  return formData
}

export const booksApi = {
  list: (params: { search?: string; category?: string; page_size?: number } = {}) =>
    apiClient.get<ApiSuccess<Book[]>>('/books/', { params }).then((res) => res.data),

  create: (values: BookFormValues) =>
    apiClient
      .post<Book>('/books/', toFormData(values), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => res.data),

  update: (id: string, values: BookFormValues) =>
    apiClient
      .patch<Book>(`/books/${id}/`, toFormData(values), { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => res.data),

  categories: () => apiClient.get<ApiSuccess<BookCategory[]>>('/books/categories/').then((res) => res.data.data),

  createCategory: (payload: BookCategoryPayload) =>
    apiClient.post<BookCategory>('/books/categories/', payload).then((res) => res.data),
}
