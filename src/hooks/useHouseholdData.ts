import type { WidgetId } from '../widgets/registry'

type Household = {
    id: string
    widgetLayout: WidgetId[]
}

function useHouseholdData(): Household {
    return {
        id: 'household-1',
        widgetLayout: ['weather', 'homeCare', 'calendar']
    }
}

export default useHouseholdData