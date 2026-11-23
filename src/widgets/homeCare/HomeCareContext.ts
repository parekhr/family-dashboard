import { createContext, useContext } from 'react'
import type { useHomeCareData } from './useHomeCareData'

export type HomeCareData = ReturnType<typeof useHomeCareData>

// Same pattern as HouseholdContext: App loads the data once and shares it,
// so the reminders bell, the Home Care pop-up and the widget all see the same items.
export const HomeCareContext = createContext<HomeCareData | null>(null)

export function useHomeCare(): HomeCareData {
    const homeCare = useContext(HomeCareContext)
    if (!homeCare) throw new Error('useHomeCare must be used inside HomeCareContext.Provider')
    return homeCare
}
