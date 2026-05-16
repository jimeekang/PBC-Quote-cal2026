import Decimal from 'decimal.js'
import Link from 'next/link'
import type { QuoteRecord } from '@/lib/dev-data'
import { JobberQuoteSummary } from '@/components/quote-form/customer-panel'
import { FinalSummary } from '@/components/quote-form/final-summary'
import { OptionTotalsSummary } from '@/components/quote-form/option-totals-summary'
import { QuoteDeleteButton } from '@/components/quote-list/quote-delete-button'

interface QuoteDetailViewProps {
  quote: QuoteRecord
}

function itemMaterialTotal(quote: QuoteRecord): Decimal {
  return quote.items.reduce(
    (total, item) => total.add(new Decimal(item.marketPriceSnapshot).mul(item.quantity)),
    new Decimal(0)
  )
}

export function QuoteDetailView({ quote }: QuoteDetailViewProps) {
  const materialTotal = itemMaterialTotal(quote)
  const subtotal = new Decimal(quote.subtotal)
  const finalTotal = new Decimal(quote.finalTotal)
  const labourTotal = Decimal.max(subtotal.sub(materialTotal), 0)
  const optionSummaries = quote.options.map((option) => ({
    id: option.id,
    title: option.title,
    finalTotal: new Decimal(option.finalTotal),
  }))

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/quotes" className="text-sm font-semibold text-slate-400 hover:text-[var(--primary)]">Back to Quotes</Link>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">{quote.customerName || 'Untitled Quote'}</h1>
          <p className="mt-1 text-sm text-slate-500">{quote.customerAddress || 'No address'}</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/quotes/${quote.id}/edit`} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-600 hover:bg-slate-50">
            Edit
          </Link>
          <QuoteDeleteButton quoteId={quote.id} redirectToQuotes />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-white bg-white/90 p-5 shadow-[var(--shadow-soft)]">
          <h2 className="text-sm font-bold uppercase text-slate-400">Summary</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {quote.jobberQuoteId ? (
              <div className="flex justify-between gap-4">
                <dt className="text-slate-500">Jobber ID</dt>
                <dd className="min-w-0 truncate font-mono text-slate-950">{quote.jobberQuoteId}</dd>
              </div>
            ) : null}
            {quote.workType ? (
              <div className="flex justify-between"><dt className="text-slate-500">Work Type</dt><dd className="text-slate-950">{quote.workType}</dd></div>
            ) : null}
            <div className="flex justify-between"><dt className="text-slate-500">Working Days</dt><dd className="font-mono text-slate-950">{quote.workingDays}</dd></div>
            <div className="flex justify-between"><dt className="text-slate-500">Labour Per Day</dt><dd className="font-mono text-slate-950">{quote.labourPerDay}</dd></div>
            <div className="rounded-lg bg-[var(--primary-soft)] px-4 py-3"><dt className="text-xs font-bold uppercase text-[var(--primary)]">Final</dt><dd className="mt-1 font-mono text-3xl font-bold text-slate-950">${quote.finalTotal}</dd></div>
          </dl>
        </section>

        <section className="rounded-lg border border-white bg-white/90 p-5 shadow-[var(--shadow-soft)]">
          <h2 className="text-sm font-bold uppercase text-slate-400">Formula Results</h2>
          <dl className="mt-4 space-y-3 text-sm">
            {[
              ['F1', quote.formula1Total],
              ['F2', quote.formula2Total],
              ['F3', quote.formula3Total],
              ['F4', quote.formula4Total],
              ['F5', quote.formula5Total],
            ].map(([label, total], index) => {
              const num = index + 1
              const marker = quote.selectedMin === num ? 'MIN' : quote.selectedMax === num ? 'MAX' : ''
              return (
                <div key={label} className={`flex justify-between rounded-lg px-3 py-2 ${marker === 'MIN' ? 'bg-emerald-50' : marker === 'MAX' ? 'bg-rose-50' : 'bg-slate-50'}`}>
                  <dt className="font-semibold text-slate-600">{label} {marker ? `- ${marker}` : ''}</dt>
                  <dd className="font-mono font-semibold text-slate-950">${total}</dd>
                </div>
              )
            })}
          </dl>
        </section>

        {quote.jobberSnapshot ? (
          <section className="rounded-lg border border-white bg-white/90 p-5 shadow-[var(--shadow-soft)] lg:col-span-2">
            <h2 className="mb-4 text-sm font-bold uppercase text-slate-400">Jobber Data</h2>
            <JobberQuoteSummary quote={quote.jobberSnapshot} />
          </section>
        ) : null}

        <section className="rounded-lg border border-white bg-white/90 p-5 shadow-[var(--shadow-soft)] lg:col-span-2">
          <h2 className="text-sm font-bold uppercase text-slate-400">Materials</h2>
          <div className="mt-4 divide-y divide-slate-100">
            {quote.items.length === 0 ? <p className="text-sm text-slate-500">No materials saved.</p> : null}
            {quote.items.map((item) => (
              <div key={item.id} className="flex justify-between py-3 text-sm">
                <span className="text-slate-950">
                  {item.productNameSnapshot}
                  {item.areaNameSnapshot ? <span className="ml-2 text-xs text-slate-500">{item.areaNameSnapshot}</span> : null}
                  {item.workingDays && item.labourPerDay ? (
                    <span className="ml-2 text-xs text-slate-500">{item.workingDays} days x {item.labourPerDay} labour</span>
                  ) : null}
                </span>
                <span className="font-mono text-slate-500">{item.quantity} x ${item.marketPriceSnapshot}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-white bg-white/90 p-5 shadow-[var(--shadow-soft)] lg:col-span-2">
          <FinalSummary
            labourTotal={labourTotal}
            materialTotal={materialTotal}
            subtotal={subtotal}
            finalTotal={finalTotal}
            jobberFinancialSummary={quote.jobberSnapshot?.financialSummary ?? null}
          />
          <OptionTotalsSummary options={optionSummaries} />
        </section>
      </div>
    </main>
  )
}
