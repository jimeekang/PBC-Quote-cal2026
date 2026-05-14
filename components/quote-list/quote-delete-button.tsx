'use client'

import { useState, useTransition } from 'react'
import { deleteQuote } from '@/lib/actions/quotes'

interface QuoteDeleteButtonProps {
  quoteId: string
  redirectToQuotes?: boolean
}

export function QuoteDeleteButton({ quoteId, redirectToQuotes = false }: QuoteDeleteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleDelete() {
    setError(null)
    if (!window.confirm('Delete this quote? This cannot be undone.')) return

    startTransition(async () => {
      const result = await deleteQuote(quoteId)
      if (!result.ok) {
        setError(result.error)
        return
      }

      if (redirectToQuotes) {
        window.location.href = '/quotes'
        return
      }
      window.location.reload()
    })
  }

  return (
    <span className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="text-sm text-red-600 hover:text-red-700 disabled:opacity-50"
      >
        {isPending ? 'Deleting...' : 'Delete'}
      </button>
      {error ? <span className="text-xs text-red-600">{error}</span> : null}
    </span>
  )
}
