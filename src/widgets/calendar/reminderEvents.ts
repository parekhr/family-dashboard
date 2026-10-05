import type { CalendarEvent } from "./useCalendarData"

export function reminderEvents(events: CalendarEvent[], todayISO: string, tomorrowISO: string): {today: CalendarEvent[], tomorrow: CalendarEvent[]} {

    const byTime = (a: CalendarEvent, b: CalendarEvent) => (a.time ?? '99:99').localeCompare(b.time ?? '99:99')

    const today = events.filter(event => event.start === todayISO).sort(byTime)
    const tomorrow = events.filter(event => event.start === tomorrowISO).sort(byTime)

    return { today, tomorrow }

}