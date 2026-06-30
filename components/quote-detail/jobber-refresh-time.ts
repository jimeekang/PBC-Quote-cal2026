const JOBBER_REFRESH_TIME_FORMATTER = new Intl.DateTimeFormat('en-AU', {
  dateStyle: 'medium',
  timeStyle: 'short',
  timeZone: 'Australia/Sydney',
})

export function formatJobberRefreshTime(value: string | null): string {
  if (!value) return 'Not refreshed yet'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Not refreshed yet'
  return JOBBER_REFRESH_TIME_FORMATTER.format(date)
}
