import type { CalendarEvent } from './useCalendarData'

export function dayEvents(events: CalendarEvent[], dayISO: string): CalendarEvent[] {
    
    const eventsForDay = events.filter(event => event.start <= dayISO && event.end >= dayISO)
    return eventsForDay
}