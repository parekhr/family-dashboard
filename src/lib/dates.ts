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