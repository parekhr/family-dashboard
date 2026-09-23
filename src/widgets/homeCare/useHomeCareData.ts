import { useState } from 'react'
import { getTodayISO } from '../../lib/dates'
type HomeCareItem = {
    id: string
    name: string
    icon: string
    history: string[]
    model?: string
    size?: string
}

export function useHomeCareData() {
    const [items, setItems] = useState<HomeCareItem[]>([
        { id: '1', name: 'Air Filter', icon: 'air-vent', history: ['2024-06-01', '2024-06-02'], model: 'XGRF14PA', size: '16X16' },
        { id: '2', name: 'Refrigerator Filter', icon: 'droplet', history: ['2024-06-03', '2024-06-04'], model: 'WF1234', size: '10X10' }
    ])

    function logToday(id: string) {
        // get today's date in ISO format
        // check the history of that item from its id
        // if today is in there, then do nothing
        // if today is not in there, then append to that history list

        const today = getTodayISO()

        const item = items.find(i => i.id === id)

        if (item && !item.history.includes(today)) {
            setItems(items.map(i =>
                i.id === id
                    ? { ...i, history: [...i.history, today] }
                    : i
            ))
        }
    }

    return { items, logToday }
}

