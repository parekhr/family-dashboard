export function getTodayISO(): string {
  return toISO(new Date())
}

export function getTomorrowISO(): string {
  const today = new Date()
  return toISO(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1))
}

export function formatDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

export function toISO(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

// Adds whole months to an ISO date. A day the target month doesn't have
// (Aug 31 + 6 months) lands on that month's last day (Feb 28) instead of spilling into March.
export function addMonthsISO(iso: string, months: number): string {
  const [year, month, day] = iso.split('-').map(Number)
  const lastDay = new Date(year, month - 1 + months + 1, 0).getDate()
  return toISO(new Date(year, month - 1 + months, Math.min(day, lastDay)))
}

export function addDaysISO(iso: string, days: number): string {
  const [year, month, day] = iso.split('-').map(Number)
  return toISO(new Date(year, month - 1, day + days))
}

// Whole days from one ISO date to another; negative when `to` is earlier.
// Uses UTC so a daylight-saving change can't make a day 23 or 25 hours long.
export function daysBetweenISO(from: string, to: string): number {
  const [y1, m1, d1] = from.split('-').map(Number)
  const [y2, m2, d2] = to.split('-').map(Number)
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000)
}

export function formatTime(time: string): string {
  const [hour, minute] = time.split(':')
  const hour12 = Number(hour) % 12 || 12
  const ampm = Number(hour) >= 12 ? 'PM' : 'AM'
  return `${hour12}:${minute} ${ampm}`
}

export function formatShortDate(iso: string): string {
  const [year, month, day] = iso.split('-').map(Number)
  const date = new Date(year, month - 1, day)

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function formatWeekdayTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    hour: 'numeric',
    minute: 'numeric',
  })
}