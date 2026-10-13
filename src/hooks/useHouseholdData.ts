import type { WidgetId } from '../widgets/registry'

type Household = {
    id: string
    widgetLayout: WidgetId[]
    name?: string
    location?: {
        latitude: number
        longitude: number
        name: string
    }
}

function useHouseholdData(): Household {
    return {
        id: 'household-1',
        widgetLayout: ['weather', 'homeCare', 'calendar'],
        name: 'Parekh Household',
        location: {
            latitude: 42.2555,
            longitude: -71.034,
            name: 'Quincy, MA'
        }
    }
}

export default useHouseholdData