export type PaymentMethod = 'CASH' | 'UPI' | 'CARD' | 'ONLINE'
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export interface Receipt {
  id: string
  receipt_number: string
  payment: string
  generated_at: string
  pdf_file: string | null
  is_void: boolean
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  member: string
  member_name: string
  member_id_display: string
  membership: string | null
  amount: string
  discount: string
  net_amount: string
  payment_method: PaymentMethod
  transaction_id: string
  gateway_order_id: string
  gateway_payment_id: string
  status: PaymentStatus
  payment_date: string
  recorded_by: string | null
  notes: string
  receipt: Receipt | null
  created_at: string
  updated_at: string
}

export interface RecordPaymentPayload {
  member: string
  membership?: string
  amount: string
  discount?: string
  payment_method: PaymentMethod
  status: PaymentStatus
  payment_date: string
  transaction_id?: string
  notes?: string
}

export interface CreateOrderPayload {
  member: string
  membership?: string
  amount: string
  discount?: string
}

export interface CreateOrderResponse {
  order_id: string
  amount: string
  currency: string
  key_id: string
}

export interface VerifyPaymentPayload extends CreateOrderPayload {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}

/** Exactly one of the two: `plan` to buy/renew, `membership` to pay off an
 * existing membership's remaining balance. */
export type MemberCreateOrderPayload = { plan: string; membership?: never } | { plan?: never; membership: string }

export type MemberVerifyPaymentPayload = MemberCreateOrderPayload & {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}
