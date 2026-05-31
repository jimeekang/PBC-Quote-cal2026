import Link from 'next/link'
import { OverviewQuoteRow } from '@/components/quote-list/quote-card'
import { SearchInput } from '@/components/quote-list/search-input'
import { Icons } from '@/components/ui/icons'
import { searchQuotes } from '@/lib/actions/quotes'

interface QuotesPageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function money0(value: number): string {
  return value.toLocaleString('en-AU', { maximumFractionDigits: 0 })
}

export default async function QuotesPage({ searchParams }: QuotesPageProps) {
  const params = await searchParams
  const q = typeof params?.q === 'string' ? params.q : ''
  const result = await searchQuotes(q)
  const quotes = result.ok ? result.data : []

  const pipeline = quotes.reduce((sum, quote) => sum + Number(quote.finalTotal || 0), 0)
  const avg = quotes.length ? pipeline / quotes.length : 0
  const now = new Date()
  const thisMonth = quotes.filter((quote) => {
    const created = new Date(quote.createdAt)
    return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth()
  }).length

  return (
    <main>
      <header className="pbc-topbar">
        <div className="pbc-crumb"><span>Admin</span>{Icons.arrowDown({ size: 14 })}<b>Overview</b></div>
        <div className="pbc-topbar__right">
          <Link href="/quotes/new" className="pbc-btn pbc-btn--primary">{Icons.plus({ size: 15 })} New Quote</Link>
        </div>
      </header>

      <div className="pbc-page">
        <div className="pbc-pagehead">
          <h1>Quotes</h1>
          <p>Every quote your team has built. Search and open one to view or edit.</p>
          {!result.ok ? <p className="text-[var(--danger)]">{result.error}</p> : null}
        </div>

        <div className="pbc-stats">
          <div className="pbc-stat">
            <span className="pbc-stat__label">Total quotes</span>
            <span className="pbc-stat__value mono">{quotes.length}</span>
            <span className="pbc-stat__sub">all time</span>
          </div>
          <div className="pbc-stat">
            <span className="pbc-stat__label">Pipeline value</span>
            <span className="pbc-stat__value mono">${money0(pipeline)}</span>
            <span className="pbc-stat__sub">inc GST</span>
          </div>
          <div className="pbc-stat">
            <span className="pbc-stat__label">Average quote</span>
            <span className="pbc-stat__value mono">${money0(avg)}</span>
            <span className="pbc-stat__sub">inc GST</span>
          </div>
          <div className="pbc-stat">
            <span className="pbc-stat__label">This month</span>
            <span className="pbc-stat__value mono">{thisMonth}</span>
            <span className="pbc-stat__sub">{now.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        <div className="pbc-listcard">
          <div className="pbc-listbar">
            <SearchInput />
          </div>

          <div className="pbc-qhead">
            <span /><span>Customer</span><span>Type</span><span>Labour</span><span>Created</span><span>Total</span><span />
          </div>
          <div className="pbc-qlist">
            {quotes.length === 0 ? (
              <p className="pbc-empty m-4">No quotes match your search.</p>
            ) : (
              quotes.map((quote) => <OverviewQuoteRow key={quote.id} quote={quote} />)
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
