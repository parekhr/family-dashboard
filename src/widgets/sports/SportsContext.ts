import { createContext, useContext } from 'react'

export type SportsData = {
    favorites: string[]                           // team keys like 'nba:2', saved on the household
    setFavorites: (favorites: string[]) => void
}

// Same pattern as the other contexts: App owns the favorites (they're saved on the
// household), and the Sports widget and the Favorite teams page both read them from here.
export const SportsContext = createContext<SportsData | null>(null)

export function useSports(): SportsData {
    const sports = useContext(SportsContext)
    if (!sports) throw new Error('useSports must be used inside SportsContext.Provider')
    return sports
}
