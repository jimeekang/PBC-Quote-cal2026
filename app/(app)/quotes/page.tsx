import Link from 'next/link'
import { QuoteCard } from '@/components/quote-list/quote-card'
import { SearchInput } from '@/components/quote-list/search-input'
import { searchQuotes } from '@/lib/actions/quotes'

interface QuotesPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function QuotesPage({ searchParams }: QuotesPageProps) {
  const params = await searchParams
  const q = typeof params?.q === 'string' ? params.q : ''
  const result = await searchQuotes(q)
  const quotes = result.ok ? result.data : []

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-bold uppercase text-slate-400">Overview</p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">Quotes</h1>
          {!result.ok ? <p className="mt-1 text-sm text-red-600">{result.error}</p> : null}
        </div>
        <Link href="/quotes/new" className="rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-[var(--primary-strong)]">
          New Quote
        </Link>
      </div>
      <div className="mb-5">
        <SearchInput />
      </div>
      <div className="space-y-3">
        {quotes.map((quote) => (
          <QuoteCard key={quote.id} quote={quote} />
        ))}
        {quotes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-200 bg-white/90 px-6 py-10 text-center shadow-sm">
            <p className="text-sm text-slate-500">No quotes yet.</p>
            <Link href="/quotes/new" className="mt-3 inline-block text-sm font-bold text-[var(--primary)] hover:text-[var(--primary-strong)]">
              Create the first quote
            </Link>
          </div>
        ) : null}
      </div>
    </main>
  )
}
