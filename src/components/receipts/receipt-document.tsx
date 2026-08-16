import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'

import type { Payment } from '@/types/payment'
import type { PublicLibraryBranding } from '@/types/settings'

// react-pdf's built-in Helvetica is a Standard-14 PDF font with no ₹ glyph —
// rendering it garbles the amount. Noto Sans covers the Indian Rupee sign.
Font.register({
  family: 'Noto Sans',
  fonts: [
    { src: '/fonts/NotoSans-Regular.ttf', fontWeight: 400 },
    { src: '/fonts/NotoSans-Bold.ttf', fontWeight: 700 },
  ],
})

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: 'Noto Sans' },
  header: {
    marginBottom: 24,
    borderBottom: 2,
    borderBottomColor: '#4F46E5',
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logo: { width: 36, height: 36, borderRadius: 6 },
  libraryName: { fontSize: 18, fontWeight: 700, color: '#4F46E5' },
  receiptTitle: { fontSize: 14, marginTop: 4, color: '#555' },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  label: { color: '#666' },
  value: { fontWeight: 700 },
  divider: { borderBottom: 1, borderBottomColor: '#ddd', marginVertical: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 12 },
  totalLabel: { fontSize: 13, fontWeight: 700 },
  totalValue: { fontSize: 13, fontWeight: 700, color: '#4F46E5' },
  footer: { marginTop: 40, fontSize: 9, color: '#999', textAlign: 'center' },
})

export function ReceiptDocument({ payment, library }: { payment: Payment; library?: PublicLibraryBranding }) {
  return (
    <Document>
      <Page size="A5" style={styles.page}>
        <View style={styles.header}>
          {library?.logo && <Image src={library.logo} style={styles.logo} />}
          <View>
            <Text style={styles.libraryName}>{library?.name || 'RR Group of Library'}</Text>
            <Text style={styles.receiptTitle}>Payment Receipt</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Receipt No.</Text>
          <Text style={styles.value}>{payment.receipt?.receipt_number ?? '—'}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{new Date(payment.payment_date).toLocaleDateString('en-IN')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Member</Text>
          <Text style={styles.value}>
            {payment.member_name} ({payment.member_id_display})
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment method</Text>
          <Text style={styles.value}>{payment.payment_method}</Text>
        </View>
        {payment.transaction_id && (
          <View style={styles.row}>
            <Text style={styles.label}>Transaction ID</Text>
            <Text style={styles.value}>{payment.transaction_id}</Text>
          </View>
        )}

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.value}>₹{payment.amount}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Discount</Text>
          <Text style={styles.value}>₹{payment.discount}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total Paid</Text>
          <Text style={styles.totalValue}>₹{payment.net_amount}</Text>
        </View>

        <Text style={styles.footer}>This is a system-generated receipt and does not require a signature.</Text>
      </Page>
    </Document>
  )
}
