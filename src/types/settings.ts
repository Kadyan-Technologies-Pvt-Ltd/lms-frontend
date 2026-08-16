export interface LibrarySetting {
  id: string
  library: string
  key: string
  value: string
  created_at: string
  updated_at: string
}

export interface Library {
  id: string
  name: string
  slug: string
  address: string
  phone: string
  email: string
  logo: string | null
}

export type PublicLibraryBranding = Pick<Library, 'name' | 'logo'>
