import type { CalendarEvent } from './useCalendarData'

export function dayEvents(events: CalendarEvent[], dayISO: string): CalendarEvent[] {
    
    const eventsForDay = events.filter(event => event.start <= dayISO && event.end >= dayISO)
    const allDayEvents = eventsForDay.filter(event => event.allDay).sort((a, b) => a.start.localeCompare(b.start))
    const timedEvents = eventsForDay.filter(event => !event.allDay).sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))
    return [...allDayEvents, ...timedEvents]
}