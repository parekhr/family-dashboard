import { createContext, useContext } from 'react'
import type { useCalendarData } from './useCalendarData'

export type CalendarData = ReturnType<typeof useCalendarData>

// Same pattern as RemindersContext: App loads events, categories and people once,
// and the calendar and Settings both read from here.
export const CalendarContext = createContext<CalendarData | null>(null)

export function useCalendar(): CalendarData {
    const calendar = useContext(CalendarContext)
    if (!calendar) throw new Error('useCalendar must be used inside CalendarContext.Provider')
    return calendar
}
