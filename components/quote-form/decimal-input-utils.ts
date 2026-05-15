export const DECIMAL_INPUT_WARNING = 'Only numbers and one decimal point are allowed.'

export function isDecimalInputValue(value: string): boolean {
  return /^\d*(?:\.\d*)?$/.test(value)
}

export function isCompleteDecimalInputValue(value: string): boolean {
  return /^\d+(?:\.\d*)?$/.test(value)
}

export function getNextDecimalInputValue(
  currentValue: string,
  insertedValue: string,
  selectionStart: number | null,
  selectionEnd: number | null
): string {
  const start = selectionStart ?? currentValue.length
  const end = selectionEnd ?? start
  return `${currentValue.slice(0, start)}${insertedValue}${currentValue.slice(end)}`
}
