import { supabase } from '../lib/supabaseClient'
import type { WidgetId } from '../widgets/registry'
import { createContext, useContext, useEffect, useState } from 'react'

export type Location = {
    latitude: number
    longitude: number
    name: string
}

type Household = {
    id: string
    widgetLayout: WidgetId[]
    name?: string
    location?: Location
    colorTheme: string
}

type HouseholdRow = {
    id: string
    name: string | null
    location_name: string | null
    latitude: number | null
    longitude: number | null
    widget_layout: string[]
    color_theme: string
}

export const HouseholdContext = createContext<Household | null>(null)

export function useHouseholdData(): Household {
    const household = useContext(HouseholdContext)
    if (!household) throw new Error('useHouseholdData must be used inside HouseholdContext.Provider')
    return household
}

export function toHousehold(row: HouseholdRow): Household {
    return {
        id: row.id,
        name: row.name ?? undefined,
        widgetLayout: row.widget_layout as WidgetId[],
        location: row.latitude !== null && row.longitude !== null && row.location_name !== null
            ? { latitude: row.latitude, longitude: row.longitude, name: row.location_name }
            : undefined,
        colorTheme: row.color_theme
    }
}

export function useFetchHousehold(userId: string | undefined) {
    const [household, setHousehold] = useState<Household | null>(null)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!userId) return
        let ignore = false

        supabase.from('households').select('*').single().then(({ data, error }) => {
            if (ignore) return
            if (error) setError("Couldn't load your household.")
            else setHousehold(toHousehold(data))
        })

        return () => { ignore = true }
    }, [userId])

    return { household, error }
}



