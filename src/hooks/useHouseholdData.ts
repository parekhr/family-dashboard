import type { WidgetId } from '../widgets/registry'

type Household = {
    id: string
    widgetLayout: WidgetId[]
    name?: string
}

function useHouseholdData(): Household {
    return {
        id: 'household-1',
        widgetLayout: ['weather', 'homeCare', 'calendar'],
        name: 'Parekh Household'
    }
}

export default useHouseholdData