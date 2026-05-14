import { notFound } from 'next/navigation'
import { getQuote } from '@/lib/actions/quotes'
import { QuoteDetailView } from '@/components/quote-detail/quote-detail-view'

interface QuoteDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function QuoteDetailPage({ params }: QuoteDetailPageProps) {
  const { id } = await params
  const result = await getQuote(id)
  if (!result.ok || !result.data) notFound()

  const quote = result.data

  return <QuoteDetailView quote={quote} />
}
