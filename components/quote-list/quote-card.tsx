import Link from 'next/link'
import type { QuoteRecord } from '@/lib/dev-data'
import { QuoteDeleteButton } from './quote-delete-button'

export function QuoteCard({ quote }: { quote: QuoteRecord }) {
  const title = quote.customerName || 'Untitled Quote'
  const savedDate = new Intl.DateTimeFormat('en-AU', { dateStyle: 'medium' }).format(new Date(quote.createdAt))

  return (
    <article className="rounded-md border border-gray-200 bg-white p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <p className="mt-1 text-sm text-gray-500">
            {quote.customerAddress || 'No address'} - {quote.workingDays} days x {quote.labourPerDay} labour - {savedDate}
          </p>
        </div>
        <div className="text-right">
          <div className="font-mono text-sm font-semibold text-gray-900">${quote.finalTotal}</div>
          <div className="mt-2 flex flex-wrap items-center justify-end gap-3">
            <Link href={`/quotes/${quote.id}`} className="text-sm text-blue-600 hover:text-blue-700">
              View
            </Link>
            <Link href={`/quotes/${quote.id}/edit`} className="text-sm text-gray-700 hover:text-gray-900">
              Edit
            </Link>
            <QuoteDeleteButton quoteId={quote.id} />
          </div>
        </div>
      </div>
    </article>
  )
}
