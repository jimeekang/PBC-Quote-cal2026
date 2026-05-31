import Decimal from 'decimal.js'
import Link from 'next/link'
import type { QuoteRecord } from '@/lib/dev-data'
import { getFormulaDescriptions } from '@/lib/calculator'
import { JobberQuoteSummary } from '@/components/quote-form/customer-panel'
import { FinalSummary } from '@/components/quote-form/final-summary'
import { OptionTotalsSummary } from '@/components/quote-form/option-totals-summary'
import { calculateAreaSubtotalBreakdown } from '@/components/quote-form/quote-calculation-totals'
import { mapSavedItemsToMaterials } from '@/components/quote-form/quote-record-mappers'
import { QuoteDeleteButton } from '@/components/quote-list/quote-delete-button'
import { Card, SectionLabel } from '@/components/ui/card'
import { Icons } from '@/components/ui/icons'

interface QuoteDetailViewProps {
  quote: QuoteRecord
}

function itemMaterialTotal(quote: QuoteRecord): Decimal {
  return quote.items.reduce(
    (total, item) => total.add(new Decimal(item.marketPriceSnapshot).mul(item.quantity)),
    new Decimal(0)
  )
}

function jobberLineTotal(line: QuoteRecord['jobberQuoteLines'][number]): string | null {
  if (line.totalPrice) return new Decimal(line.totalPrice).toFixed(2)
  if (!line.quantity || !line.unitPrice) return null
  return new Decimal(line.quantity).mul(line.unitPrice).toFixed(2)
}

function quoteLineItemsTotal(lines: QuoteRecord['jobberQuoteLines']): Decimal {
  return lines.reduce((total, line) => {
    const lineTotal = jobberLineTotal(line)
    return lineTotal ? total.add(lineTotal) : total
  }, new Decimal(0))
}

function formatQuoteDate(value: string): string {
  return new Intl.DateTimeFormat('en-AU', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

function DRow({ label, mono, children }: { label: string; mono?: boolean; children: React.ReactNode }) {
  return (
    <div className="pbc-drow">
      <dt>{label}</dt>
      <dd className={mono ? 'mono' : ''}>{children}</dd>
    </div>
  )
}

export function QuoteDetailView({ quote }: QuoteDetailViewProps) {
  const materialTotal = itemMaterialTotal(quote)
  const subtotal = new Decimal(quote.subtotal)
  const labourTotal = Decimal.max(subtotal.sub(materialTotal), 0)
  const areaBreakdown = calculateAreaSubtotalBreakdown({
    materials: mapSavedItemsToMaterials(quote.items),
    selectedMin: quote.selectedMin,
    selectedMax: quote.selectedMax,
    areaFormulaSelections: {
      interior: {
        selectedMin: quote.interiorSelectedMin ?? quote.selectedMin,
        selectedMax: quote.interiorSelectedMax ?? quote.selectedMax,
      },
      exterior: {
        selectedMin: quote.exteriorSelectedMin ?? quote.selectedMin,
        selectedMax: quote.exteriorSelectedMax ?? quote.selectedMax,
      },
    },
    settings: quote.pricingSettingsSnapshot,
  })
  const jobberFinancialSummary = quote.jobberSnapshot && !quote.jobberSnapshot.jobExpensesError
    ? quote.jobberSnapshot.financialSummary
    : null
  const creatorName = quote.createdByName ?? quote.createdByEmail ?? 'Unknown user'
  const optionSummaries = quote.options.map((option) => {
    const optionAreaBreakdown = calculateAreaSubtotalBreakdown({
      materials: mapSavedItemsToMaterials(option.items),
      selectedMin: option.selectedMin,
      selectedMax: option.selectedMax,
      settings: quote.pricingSettingsSnapshot,
    })

    return {
      id: option.id,
      title: option.title,
      subtotal: new Decimal(option.subtotal),
      finalTotal: new Decimal(option.finalTotal),
      interiorSubtotal: optionAreaBreakdown.interior.subtotal,
      exteriorSubtotal: optionAreaBreakdown.exterior.subtotal,
    }
  })

  const finalSubtotal = areaBreakdown.finalSubtotal
  const formulaDescriptions = getFormulaDescriptions(quote.pricingSettingsSnapshot)
  const lineItemsTotal = quoteLineItemsTotal(quote.jobberQuoteLines)

  const formulaRows = [
    { num: 1, label: 'F1', name: formulaDescriptions.formula1Name, total: quote.formula1Total },
    { num: 2, label: 'F2', name: formulaDescriptions.formula2Name, total: quote.formula2Total },
    { num: 3, label: 'F3', name: formulaDescriptions.formula3Name, total: quote.formula3Total },
    { num: 4, label: 'F4', name: formulaDescriptions.formula4Name, total: quote.formula4Total },
    { num: 5, label: 'F5', name: formulaDescriptions.formula5Name, total: quote.formula5Total },
  ]

  return (
    <main>
      <header className="pbc-topbar">
        <div className="pbc-crumb">
          <Link href="/quotes">Quotes</Link>
          {Icons.arrowDown({ size: 14 })}
          <b className="truncate">{quote.customerName || 'Untitled Quote'}</b>
        </div>
        <div className="pbc-topbar__right">
          <span className="pbc-readonly">{Icons.lock({ size: 15 })} Read-only</span>
          <Link href={`/quotes/${quote.id}/edit`} className="pbc-btn pbc-btn--ghost">
            {Icons.edit({ size: 15 })} Edit quote
          </Link>
        </div>
      </header>

      <div className="pbc-page">
        <div className="pbc-pagehead pbc-pagehead--detail">
          <div className="min-w-0">
            <Link href="/quotes" className="pbc-back">{Icons.back({ size: 15 })} Back to Quotes</Link>
            <h1>{quote.customerName || 'Untitled Quote'}</h1>
            <p className="pbc-detailaddr">{Icons.pin({ size: 15 })} {quote.customerAddress || 'No address'}</p>
          </div>
          <div className="pbc-detailtags">
            <Link href={`/quotes/${quote.id}/edit`} className="pbc-btn pbc-btn--ghost">
              {Icons.edit({ size: 15 })} Edit
            </Link>
            <QuoteDeleteButton quoteId={quote.id} redirectToQuotes />
          </div>
        </div>

        <div className="pbc-dgrid">
          {/* Summary */}
          <Card>
            <SectionLabel icon={Icons.user({ size: 16 })}>Summary</SectionLabel>
            <dl className="pbc-dlist">
              {quote.jobberQuoteId ? <DRow label="Jobber ID" mono>#{quote.jobberQuoteId}</DRow> : null}
              {quote.workType ? <DRow label="Work type">{quote.workType}</DRow> : null}
              <DRow label="Created by">{creatorName}</DRow>
              <DRow label="Created on">{formatQuoteDate(quote.createdAt)}</DRow>
              <DRow label="Total working days" mono>{quote.workingDays}</DRow>
              <DRow label="Total man-days" mono>{quote.labourPerDay}</DRow>
            </dl>
            <div className="pbc-dexgst">
              <span>Final subtotal ex GST</span>
              <b className="mono">${finalSubtotal.toFixed(2)}</b>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <div className="flex justify-between gap-2">
                <span className="text-[var(--muted)]">Interior</span>
                <span className="mono font-semibold">${areaBreakdown.interior.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[var(--muted)]">Exterior</span>
                <span className="mono font-semibold">${areaBreakdown.exterior.subtotal.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Formula results */}
          <Card>
            <SectionLabel
              icon={Icons.layers({ size: 16 })}
              aside={<span className="pbc-chip">Range F{quote.selectedMin}–F{quote.selectedMax}</span>}
            >
              Formula results
            </SectionLabel>
            <div className="pbc-dformulas">
              {formulaRows.map((row) => {
                const mark = quote.selectedMin === row.num ? 'lo' : quote.selectedMax === row.num ? 'hi' : ''
                return (
                  <div key={row.label} className={`pbc-dformula ${mark ? 'pbc-dformula--' + mark : ''}`}>
                    <span className="pbc-dformula__code">{row.label}</span>
                    <span className="pbc-dformula__short">{row.name}</span>
                    {mark ? (
                      <span className={`pbc-dformula__mark pbc-dformula__mark--${mark}`}>{mark === 'lo' ? 'LOW' : 'HIGH'}</span>
                    ) : (
                      <span />
                    )}
                    <span className="mono pbc-dformula__amt">${row.total}</span>
                  </div>
                )
              })}
              {quote.jobberQuoteLines.length > 0 ? (
                <div className="pbc-dlines__total">
                  <span>Line items subtotal</span>
                  <b className="mono">${lineItemsTotal.toFixed(2)}</b>
                </div>
              ) : null}
            </div>
          </Card>

          {/* Jobber data */}
          {quote.jobberSnapshot ? (
            <Card className="pbc-dspan">
              <SectionLabel icon={Icons.template({ size: 16 })}>Jobber Data</SectionLabel>
              <JobberQuoteSummary quote={quote.jobberSnapshot} />
            </Card>
          ) : null}

          {/* Internal memos */}
          <Card className="pbc-dspan">
            <SectionLabel
              icon={Icons.edit({ size: 16 })}
              aside={quote.memos.length ? <span className="pbc-chip">{quote.memos.length} memos</span> : undefined}
            >
              Internal Memos
            </SectionLabel>
            <div className="space-y-3">
              {quote.memos.length === 0 ? <p className="pbc-empty">No internal memos saved.</p> : null}
              {quote.memos.map((memo, index) => (
                <article key={memo.id} className="pbc-dmemo">
                  <h3>Memo {index + 1}</h3>
                  <p>{memo.body}</p>
                </article>
              ))}
            </div>
          </Card>

          {/* Product / service lines */}
          <Card className="pbc-dspan">
            <SectionLabel
              icon={Icons.template({ size: 16 })}
              aside={<span className="pbc-chip">{quote.jobberQuoteLines.length} items</span>}
            >
              App Product / Service
            </SectionLabel>
            <div className="pbc-dlines">
              {quote.jobberQuoteLines.length === 0 ? <p className="pbc-empty">No product or service lines saved.</p> : null}
              {quote.jobberQuoteLines.map((line) => {
                const total = jobberLineTotal(line)
                return (
                  <div className="pbc-dline" key={line.id}>
                    <div className="min-w-0">
                      <span className="pbc-dline__name">
                        {line.name}
                        <span className={`pbc-titem__tag ${line.kind === 'text' ? 'pbc-titem__tag--text' : ''}`}>
                          {line.kind === 'text' ? 'TEXT' : 'LINE'}
                        </span>
                      </span>
                      {line.description ? <p className="pbc-dline__desc">{line.description}</p> : null}
                    </div>
                    <div className="pbc-dline__price mono">
                      {line.kind === 'line_item' && total ? (
                        <>
                          <span>{line.quantity ?? '1'} x ${line.unitPrice ?? '0.00'}</span>
                          <b>${total}</b>
                        </>
                      ) : (
                        <i>Description only</i>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Materials */}
          <Card className="pbc-dspan">
            <SectionLabel
              icon={Icons.palette({ size: 16 })}
              aside={<span className="pbc-chip">{quote.items.length} materials</span>}
            >
              Materials
            </SectionLabel>
            <div className="pbc-dmats">
              {quote.items.length === 0 ? <p className="pbc-empty">No materials saved.</p> : null}
              {quote.items.map((item) => (
                <div className="pbc-dmat" key={item.id}>
                  <span className="pbc-swatch pbc-swatch--sm" data-base={item.productNameSnapshot} />
                  <span className="pbc-dmat__main">
                    <span className="pbc-dmat__name">{item.productNameSnapshot}</span>
                    <span className="pbc-dmat__meta">
                      {item.areaNameSnapshot ?? 'No area'}
                      {item.workingDays && item.labourPerDay ? ` - ${item.workingDays} days x ${item.labourPerDay} labour` : ''}
                    </span>
                  </span>
                  <span className="pbc-dmat__qty mono">{item.quantity} x ${item.marketPriceSnapshot}</span>
                  <span className="pbc-dmat__line mono">${new Decimal(item.marketPriceSnapshot).mul(item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="pbc-dlines__total">
                <span>Material total (RRP)</span>
                <b className="mono">${materialTotal.toFixed(2)}</b>
              </div>
            </div>
          </Card>

          {/* Final summary */}
          <FinalSummary
            labourTotal={labourTotal}
            materialTotal={materialTotal}
            areaBreakdown={areaBreakdown}
            jobberFinancialSummary={jobberFinancialSummary}
            className="pbc-dspan"
          />

          {optionSummaries.length ? (
            <Card className="pbc-dspan">
              <OptionTotalsSummary options={optionSummaries} />
            </Card>
          ) : null}
        </div>
      </div>
    </main>
  )
}
