'use client'

import { useEffect, useState } from 'react'
import { searchProducts } from '@/lib/actions/products'
import type { ProductRecord } from '@/lib/products/types'
import type { MaterialItem } from './types'
import { createCustomMaterialItem, createProductMaterialItem } from './material-item-factory'

interface PaintSearchProps {
  onAdd: (item: MaterialItem) => void
}

export function PaintSearch({ onAdd }: PaintSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ProductRecord[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      if (!query.trim()) {
        setResults([])
        setError(null)
        return
      }

      const result = await searchProducts({ query, limit: 8 })
      if (result.ok) {
        setResults(result.data)
        setError(null)
      } else {
        setResults([])
        setError(result.error)
      }
    }, 200)

    return () => window.clearTimeout(timer)
  }, [query])

  function addProduct(product: ProductRecord) {
    onAdd(createProductMaterialItem(product))
    setQuery('')
    setResults([])
  }

  function addCustom() {
    const name = query.trim()
    if (!name) return
    onAdd(createCustomMaterialItem(name))
    setQuery('')
    setResults([])
  }

  return (
    <div className="relative">
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') {
            event.preventDefault()
            addCustom()
          }
        }}
        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm shadow-sm"
        placeholder="Search paint or material..."
      />
      {error ? <p className="mt-2 text-sm text-red-600">{error}</p> : null}
      {query.trim() ? (
        <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-lg border border-[var(--border)] bg-white shadow-[var(--shadow-soft)]">
          {results.map((product) => (
            <button key={product.id} type="button" onClick={() => addProduct(product)} className="block w-full px-3 py-2 text-left hover:bg-slate-50">
              <span className="block text-sm font-semibold text-slate-950">{product.name}</span>
              <span className="block text-xs font-semibold text-slate-500">RRP ${product.marketPrice}</span>
            </button>
          ))}
          {results.length === 0 ? (
            <button type="button" onClick={addCustom} className="block w-full px-3 py-2 text-left text-sm font-semibold text-[var(--primary)] hover:bg-[var(--primary-soft)]">
              Add &quot;{query.trim()}&quot; as custom item
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
