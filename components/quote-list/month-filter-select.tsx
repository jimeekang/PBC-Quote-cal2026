'use client'

import { useRouter } from 'next/navigation'

export interface MonthFilterOption {
  key: string
  label: string
  year: string
  count: number
}

interface MonthFilterSelectProps {
  currentMonth: string
  currentSearch: string
  totalCount: number
  options: MonthFilterOption[]
}

function getMonthSelectHref(monthKey: string, currentSearch: string): string {
  const params = new URLSearchParams(currentSearch)

  if (monthKey) {
    params.set('month', monthKey)
  } else {
    params.delete('month')
  }

  const nextSearch = params.toString()
  return `/quotes${nextSearch ? `?${nextSearch}` : ''}`
}

export function MonthFilterSelect({ currentMonth, currentSearch, totalCount, options }: MonthFilterSelectProps) {
  const router = useRouter()

  return (
    <label className="pbc-monthselect">
      <span>Month</span>
      <select
        aria-label="Filter quotes by month"
        value={currentMonth}
        onChange={(event) => router.push(getMonthSelectHref(event.target.value, currentSearch))}
      >
        <option value="">All months ({totalCount})</option>
        {options.map((option) => (
          <option key={option.key} value={option.key}>
            {option.year} - {option.label} ({option.count})
          </option>
        ))}
      </select>
    </label>
  )
}
