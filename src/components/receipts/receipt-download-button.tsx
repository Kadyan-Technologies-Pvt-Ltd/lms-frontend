import { useQuery } from '@tanstack/react-query'
import { Download } from 'lucide-react'
import { useState } from 'react'
import type { ComponentType } from 'react'

import { Button } from '@/components/ui/button'
import { libraryProfileApi } from '@/lib/api/settings'
import type { Payment } from '@/types/payment'
import type { PublicLibraryBranding } from '@/types/settings'

// @react-pdf/renderer (and its transitive deps — fontkit, yoga-layout, etc.)
// is one of the heaviest packages in this app, but a receipt is only needed
// when someone actually clicks to get one. Loading it eagerly meant every
// row of the Payments table and Membership history paid for it on page
// load. Deferred here to the first click instead.
type PdfModule = typeof import('@react-pdf/renderer')
type DocModule = typeof import('./receipt-document')

export function ReceiptDownloadButton({ payment }: { payment: Payment }) {
  const [modules, setModules] = useState<{ pdf: PdfModule; doc: DocModule } | null>(null)
  const [loading, setLoading] = useState(false)

  // Shares its cache with the sidebar/settings-panel queries (same key), so
  // this is usually already-cached rather than a fresh request.
  const libraryQuery = useQuery({
    queryKey: ['settings', 'library-profile'],
    queryFn: libraryProfileApi.get,
    staleTime: 5 * 60_000,
  })
  const library: PublicLibraryBranding | undefined = libraryQuery.data

  if (!payment.receipt) return null

  if (!modules) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={loading}
        onClick={async () => {
          setLoading(true)
          const [pdf, doc] = await Promise.all([import('@react-pdf/renderer'), import('./receipt-document')])
          setModules({ pdf, doc })
          setLoading(false)
        }}
      >
        <Download className="mr-2 h-4 w-4" />
        {loading ? 'Preparing…' : 'Receipt'}
      </Button>
    )
  }

  const { PDFDownloadLink } = modules.pdf
  const ReceiptDocument = modules.doc.ReceiptDocument as ComponentType<{ payment: Payment; library?: PublicLibraryBranding }>

  return (
    <PDFDownloadLink
      document={<ReceiptDocument payment={payment} library={library} />}
      fileName={`${payment.receipt.receipt_number}.pdf`}
    >
      {({ loading: rendering }) => (
        <Button variant="outline" size="sm" disabled={rendering}>
          <Download className="mr-2 h-4 w-4" />
          {rendering ? 'Preparing…' : 'Download'}
        </Button>
      )}
    </PDFDownloadLink>
  )
}
