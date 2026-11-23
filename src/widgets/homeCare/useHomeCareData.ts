import { useEffect, useState } from 'react'
import { getTodayISO } from '../../lib/dates'
import { supabase } from '../../lib/supabaseClient'

export type HomeCareItem = {
    id: string
    name: string
    icon: string
    history: string[]
    model?: string
    size?: string
    intervalMonths?: number    // change every N months; absent = no reminder
    snoozedUntil?: string      // ISO YYYY-MM-DD; the reminder stays hidden until this day
}

type HomeCareItemRow = {
    id: string
    name: string
    icon: string
    model: string | null
    size: string | null
    interval_months: number | null
    snoozed_until: string | null
    home_care_logs: { logged_on: string }[]
}

function toHomeCareItem(row: HomeCareItemRow): HomeCareItem {
    return {
        id: row.id,
        name: row.name,
        icon: row.icon,
        model: row.model ?? undefined,
        size: row.size ?? undefined,
        intervalMonths: row.interval_months ?? undefined,
        snoozedUntil: row.snoozed_until ?? undefined,
        history: row.home_care_logs.map(log => log.logged_on)
    }
}

// Called once in App (not inside the widget), so the header's reminders and the
// Home Care view share one copy of the data, and it loads even when the widget isn't on screen.
// Waits for the signed-in user, like useFetchHousehold.
export function useHomeCareData(userId: string | undefined) {
    const [items, setItems] = useState<HomeCareItem[]>([])
    const [error, setError] = useState(false)

    useEffect(() => {
        if (!userId) return
        let ignore = false
        supabase
            .from('home_care_items')
            .select('id, name, icon, model, size, interval_months, snoozed_until, home_care_logs(logged_on)')
            .order('sort_order')
            .then(({ data, error }) => {
                if (ignore) return
                if (error) {
                    console.error(error)
                    setError(true)
                    return
                }
                setItems(data.map(toHomeCareItem))
            })
        return () => { ignore = true }
    }, [userId])

    function logToday(id: string) {
        const today = getTodayISO()
        const item = items.find(i => i.id === id)
        if (!item || item.history.includes(today)) return

        setItems(prev => prev.map(i =>
            i.id === id ? { ...i, history: [...i.history, today] } : i
        ))
        supabase.from('home_care_logs')
            .insert({ item_id: id, logged_on: today })
            .then(({ error }) => {
                if (error) {
                    console.error(error)
                }
            })
    }

    function deleteHistoryEntry(id: string, date: string) {
        setItems(prev => prev.map(i =>
            i.id === id
                ? { ...i, history: i.history.filter(d => d !== date) }
                : i
        ))
        supabase.from('home_care_logs')
            .delete()
            .eq('item_id', id)
            .eq('logged_on', date)
            .then(({ error }) => {
                if (error) {
                    console.error(error)
                }
            })
    }

    function addHistoryEntry(id: string, date: string) {
        const item = items.find(i => i.id === id)
        if (!item || item.history.includes(date)) return

        setItems(prev => prev.map(i =>
            i.id === id ? { ...i, history: [...i.history, date] } : i
        ))
        supabase.from('home_care_logs')
            .insert({ item_id: id, logged_on: date })
            .then(({ error }) => {
                if (error) {
                    console.error(error)
                }
            })
    }

    function editHistoryEntry(id: string, oldDate: string, newDate: string) {
        const item = items.find(i => i.id === id)
        if (!item || !item.history.includes(oldDate) || item.history.includes(newDate)) return

        setItems(prev => prev.map(i =>
            i.id === id ? { ...i, history: i.history.map(d => d === oldDate ? newDate : d) } : i
        ))
        supabase.from('home_care_logs')
            .update({ logged_on: newDate })
            .eq('item_id', id)
            .eq('logged_on', oldDate)
            .then(({ error }) => {
                if (error) {
                    console.error(error)
                }
            })
    }

    // months = null turns the reminder off
    function setIntervalMonths(id: string, months: number | null) {
        setItems(prev => prev.map(i =>
            i.id === id ? { ...i, intervalMonths: months ?? undefined } : i
        ))
        supabase.from('home_care_items')
            .update({ interval_months: months })
            .eq('id', id)
            .then(({ error }) => {
                if (error) console.error(error)
            })
    }

    function snooze(id: string, untilISO: string) {
        setItems(prev => prev.map(i =>
            i.id === id ? { ...i, snoozedUntil: untilISO } : i
        ))
        supabase.from('home_care_items')
            .update({ snoozed_until: untilISO })
            .eq('id', id)
            .then(({ error }) => {
                if (error) console.error(error)
            })
    }

    return { items, logToday, deleteHistoryEntry, addHistoryEntry, editHistoryEntry, setIntervalMonths, snooze, error }
}
