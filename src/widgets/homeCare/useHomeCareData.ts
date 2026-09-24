import { useState } from 'react'
import { getTodayISO } from '../../lib/dates'

export type HomeCareItem = {
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
        { id: '2', name: 'Refrigerator Filter', icon: 'droplet', history: ['2024-06-03', '2024-06-04'], model: 'WF1234', size: '10X10' },
        { id: '3', name: 'Water Filter', icon: 'droplet', history: ['2024-06-05'], model: 'WF5678', size: '12X12' },
        { id: '4', name: 'Humidifier Filter', icon: 'droplet', history: ['2024-06-06'], model: 'HF9012', size: '14X14' },
        { id: '5', name: 'Dehumidifier Filter', icon: 'droplet', history: ['2024-06-07'], model: 'DF3456', size: '16X16' },
        { id: '6', name: 'Vacuum Filter', icon: 'droplet', history: ['2024-06-08'], model: 'VF7890', size: '18X18' }
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

    function deleteHistoryEntry(id: string, date: string) {
        setItems(items.map(i =>
            i.id === id
                ? { ...i, history: i.history.filter(d => d !== date) }
                : i
        ))
    }

    function addHistoryEntry(id: string, date: string) {
        setItems(items.map(i =>
            i.id === id && !i.history.includes(date)
                ? { ...i, history: [...i.history, date] }
                : i
        ))
    }

    function editHistoryEntry(id: string, oldDate: string, newDate: string) {
        setItems(items.map(i =>
            i.id === id && i.history.includes(oldDate) && !i.history.includes(newDate)
                ? { ...i, history: i.history.map(d => d === oldDate ? newDate : d) }
                : i
        ))
    }

    return { items, logToday, deleteHistoryEntry, addHistoryEntry, editHistoryEntry }
}

