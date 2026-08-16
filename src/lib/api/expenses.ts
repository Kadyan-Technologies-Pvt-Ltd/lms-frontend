import { apiClient } from '@/lib/api/client'
import type { ApiSuccess } from '@/types/api'
import type { Expense, ExpenseCategory, ExpenseCategoryPayload, ExpensePayload } from '@/types/expense'

export interface ExpenseListParams {
  search?: string
  category?: string
  date?: string
  page_size?: number
  ordering?: string
}

export const expensesApi = {
  list: (params: ExpenseListParams = {}) =>
    apiClient.get<ApiSuccess<Expense[]>>('/expenses/', { params }).then((res) => res.data),

  create: (payload: ExpensePayload) => apiClient.post<Expense>('/expenses/', payload).then((res) => res.data),

  update: (id: string, payload: Partial<ExpensePayload>) =>
    apiClient.patch<Expense>(`/expenses/${id}/`, payload).then((res) => res.data),

  remove: (id: string) => apiClient.delete(`/expenses/${id}/`),

  categories: () => apiClient.get<ApiSuccess<ExpenseCategory[]>>('/expenses/categories/').then((res) => res.data.data),

  createCategory: (payload: ExpenseCategoryPayload) =>
    apiClient.post<ExpenseCategory>('/expenses/categories/', payload).then((res) => res.data),
}
