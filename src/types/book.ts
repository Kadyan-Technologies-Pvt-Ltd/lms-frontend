export type BookLicense = 'PUBLIC_DOMAIN' | 'CC' | 'OPEN_ACCESS' | 'OTHER'

export interface BookCategory {
  id: string
  name: string
  slug: string
  description: string
}

export interface Book {
  id: string
  title: string
  author: string
  description: string
  category: string | null
  language: string
  publication_year: number | null
  cover_image: string | null
  source_url: string
  hosted_file: string | null
  license: BookLicense
  license_url: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BookCategoryPayload {
  name: string
  description?: string
}

export interface BookFormValues {
  title: string
  author: string
  description: string
  category: string
  language: string
  publication_year: string
  source_url: string
  license: BookLicense
  license_url: string
  is_active: boolean
  cover_image: File | null
  hosted_file: File | null
}
