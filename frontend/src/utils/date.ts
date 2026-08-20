import { format, isValid, parseISO } from 'date-fns'

export function formatDate(value: string | Date): string {
  const date = value instanceof Date ? value : parseISO(value)
  return isValid(date) ? format(date, 'MMM d, yyyy') : 'Invalid date'
}

export function fromDateOnly(value: string): Date {
  const parsed = parseISO(value)
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

export function toDateOnlyIso(date: Date): string {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    12,
  ).toISOString()
}

export function startOfTomorrow(): Date {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  date.setHours(0, 0, 0, 0)
  return date
}
