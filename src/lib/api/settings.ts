import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { Library, LibrarySetting, PublicLibraryBranding } from '@/types/settings'

export const librarySettingsApi = {
  list: () => apiClient.get<ApiSuccess<LibrarySetting[]>>('/settings/').then((res) => res.data.data),

  /** Upserts by key — backend creates or updates the row as needed. */
  save: (key: string, value: string) =>
    apiClient.post<ApiSuccess<LibrarySetting>>('/settings/', { key, value }).then((res) => res.data.data),
}

export const libraryProfileApi = {
  get: () => apiClient.get<ApiSuccess<Library>>('/settings/library/').then((res) => res.data.data),

  /** No auth required — this is what the login page (no session yet) uses. */
  getPublic: () =>
    apiClient.get<ApiSuccess<PublicLibraryBranding>>('/settings/library/public/').then((res) => res.data.data),

  update: (payload: Partial<Pick<Library, 'name' | 'address' | 'phone' | 'email'>>, logo?: File | null) => {
    const form = new FormData()
    for (const [key, value] of Object.entries(payload)) {
      if (value !== undefined) form.append(key, value)
    }
    if (logo) form.append('logo', logo)
    return apiClient
      .patch<ApiSuccess<Library>>('/settings/library/', form, { headers: { 'Content-Type': 'multipart/form-data' } })
      .then((res) => res.data.data)
  },
}

/** Default that matches the backend's DEFAULT_MEMBER_POINTS/LOW_POINT_WARNING_THRESHOLD
 * fallback, used only until the LibrarySetting list has loaded. */
export const DEFAULT_LOW_POINT_THRESHOLD = 3

export function getLowPointThreshold(settings: LibrarySetting[] | undefined): number {
  const setting = settings?.find((s) => s.key === 'low_point_threshold')
  return setting ? Number(setting.value) : DEFAULT_LOW_POINT_THRESHOLD
}
