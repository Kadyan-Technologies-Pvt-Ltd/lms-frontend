import type { ColumnDef } from '@tanstack/react-table'

import { ReceiptDownloadButton } from '@/components/receipts/receipt-download-button'
import { Badge } from '@/components/ui/badge'
import type { Payment, PaymentStatus } from '@/types/payment'

const STATUS_VARIANT: Record<PaymentStatus, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  PENDING: 'outline',
  COMPLETED: 'default',
  FAILED: 'destructive',
  REFUNDED: 'secondary',
}

export const paymentColumns: ColumnDef<Payment>[] = [
  {
    id: 'member',
    header: 'Member',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">{row.original.member_name}</p>
        <p className="text-xs text-muted-foreground">{row.original.member_id_display}</p>
      </div>
    ),
  },
  {
    accessorKey: 'net_amount',
    header: 'Amount',
    cell: ({ row }) => (
      <div>
        <p className="font-medium">₹{row.original.net_amount}</p>
        {Number(row.original.discount) > 0 && (
          <p className="text-xs text-muted-foreground">₹{row.original.amount} − ₹{row.original.discount} discount</p>
        )}
      </div>
    ),
  },
  { accessorKey: 'payment_method', header: 'Method' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <Badge variant={STATUS_VARIANT[row.original.status]}>{row.original.status}</Badge>,
  },
  {
    accessorKey: 'payment_date',
    header: 'Date',
    cell: ({ row }) => new Date(row.original.payment_date).toLocaleDateString('en-IN'),
  },
  {
    id: 'receipt',
    header: '',
    cell: ({ row }) => <ReceiptDownloadButton payment={row.original} />,
  },
]
