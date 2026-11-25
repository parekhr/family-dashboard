import { createContext, useContext } from 'react'
import type { useRemindersData } from './useRemindersData'

export type RemindersData = ReturnType<typeof useRemindersData>

// Same pattern as HouseholdContext: App loads the data once and shares it,
// so the bell and the setup pop-up see the same reminders.
export const RemindersContext = createContext<RemindersData | null>(null)

export function useReminders(): RemindersData {
    const reminders = useContext(RemindersContext)
    if (!reminders) throw new Error('useReminders must be used inside RemindersContext.Provider')
    return reminders
}
