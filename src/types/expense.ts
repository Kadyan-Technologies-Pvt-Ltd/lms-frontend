export interface ExpenseCategory {
  id: string
  name: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ExpenseCategoryPayload {
  name: string
  is_active?: boolean
}

export interface Expense {
  id: string
  category: string
  category_name: string
  amount: string
  date: string
  description: string
  payment_method: string
  receipt_file: string | null
  recorded_by: string | null
  created_at: string
  updated_at: string
}

export interface ExpensePayload {
  category: string
  amount: string
  date: string
  description?: string
  payment_method?: string
}
