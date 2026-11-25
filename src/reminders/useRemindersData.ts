import { useEffect, useState } from 'react'
import { getTodayISO } from '../lib/dates'
import { supabase } from '../lib/supabaseClient'
import type { Interval, IntervalUnit } from './reminders'

// The tables are still called home_care_items / home_care_logs: Home Care became Reminders
// on November 25, 2026, and renaming tables waits until every tablet runs the new version.

export type ReminderItem = {
    id: string
    name: string
    icon: string
    history: string[]          // the dates it was done (ISO YYYY-MM-DD)
    notes?: string             // any details: model, size, part number, where to buy it, where it's kept
    sortOrder: number
    interval?: Interval        // how often; absent only on items from before it was required
    snoozedUntil?: string      // ISO YYYY-MM-DD; the reminder stays hidden until this day
}

// What the add / edit form fills in (empty optional fields = undefined)
export type ReminderDetails = Pick<ReminderItem, 'name' | 'icon' | 'notes'> & { interval: Interval }

type ReminderRow = {
    id: string
    name: string
    icon: string
    notes?: string | null      // model and size were folded in (they're old columns, not read any more)
    sort_order: number
    interval_months: number | null
    interval_count?: number | null
    interval_unit?: IntervalUnit | null
    snoozed_until: string | null
    home_care_logs: { logged_on: string }[]
}

function toReminderItem(row: ReminderRow): ReminderItem {
    // interval_count / unit came with the reminders migration; interval_months is the old,
    // months-only column, read as a fallback for rows saved before it
    const interval: Interval | undefined = row.interval_count && row.interval_unit
        ? { count: row.interval_count, unit: row.interval_unit }
        : row.interval_months ? { count: row.interval_months, unit: 'month' } : undefined
    return {
        id: row.id,
        name: row.name,
        icon: row.icon,
        notes: row.notes ?? undefined,
        sortOrder: row.sort_order,
        interval,
        snoozedUntil: row.snoozed_until ?? undefined,
        history: row.home_care_logs.map(log => log.logged_on)
    }
}

// The columns an item's details are saved to. interval_months is still filled in for
// monthly reminders so tablets on the old version show them right; it's dropped later.
function toDetailsColumns(details: ReminderDetails) {
    return {
        name: details.name,
        icon: details.icon,
        notes: details.notes ?? null,
        interval_count: details.interval.count,
        interval_unit: details.interval.unit,
        interval_months: details.interval.unit === 'month' ? details.interval.count : null,
    }
}

// Called once in App, so the bell and the setup pop-up share one copy of the data.
// Waits for the signed-in user, like useFetchHousehold.
export function useRemindersData(userId: string | undefined) {
    const [items, setItems] = useState<ReminderItem[]>([])
    const [error, setError] = useState(false)

    useEffect(() => {
        if (!userId) return
        let ignore = false
        supabase
            .from('home_care_items')
            .select('*, home_care_logs(logged_on)')
            .order('sort_order')
            .then(({ data, error }) => {
                if (ignore) return
                if (error) {
                    console.error(error)
                    setError(true)
                    return
                }
                setItems((data as ReminderRow[]).map(toReminderItem))
            })
        return () => { ignore = true }
    }, [userId])

    // Logging clears any snooze: once it's done, the next reminder counts from today
    function clearSnooze(id: string) {
        supabase.from('home_care_items')
            .update({ snoozed_until: null })
            .eq('id', id)
            .then(({ error }) => { if (error) console.error(error) })
    }

    // Done, whether it's due or early: the next reminder counts from today (see getDueDate)
    function logToday(id: string) {
        addHistoryEntry(id, getTodayISO())
    }

    function addHistoryEntry(id: string, date: string) {
        const item = items.find(i => i.id === id)
        if (!item || item.history.includes(date)) return

        setItems(prev => prev.map(i =>
            i.id === id ? { ...i, history: [...i.history, date], snoozedUntil: undefined } : i
        ))
        supabase.from('home_care_logs')
            .insert({ item_id: id, logged_on: date })
            .then(({ error }) => { if (error) console.error(error) })
        if (item.snoozedUntil) clearSnooze(id)
    }

    function deleteHistoryEntry(id: string, date: string) {
        setItems(prev => prev.map(i =>
            i.id === id ? { ...i, history: i.history.filter(d => d !== date) } : i
        ))
        supabase.from('home_care_logs')
            .delete()
            .eq('item_id', id)
            .eq('logged_on', date)
            .then(({ error }) => { if (error) console.error(error) })
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
            .then(({ error }) => { if (error) console.error(error) })
    }

    function snooze(id: string, untilISO: string) {
        setItems(prev => prev.map(i =>
            i.id === id ? { ...i, snoozedUntil: untilISO } : i
        ))
        supabase.from('home_care_items')
            .update({ snoozed_until: untilISO })
            .eq('id', id)
            .then(({ error }) => { if (error) console.error(error) })
    }

    // ---- Setting reminders up (from the bell's "Set up reminders") ----

    // New ones go to the end of the list
    function addItem(details: ReminderDetails) {
        const id = crypto.randomUUID()
        const sortOrder = Math.max(0, ...items.map(i => i.sortOrder)) + 1
        setItems(prev => [...prev, { id, history: [], sortOrder, ...details }])
        supabase.from('home_care_items')
            .insert({ id, sort_order: sortOrder, ...toDetailsColumns(details) })
            .then(({ error }) => { if (error) console.error(error) })
    }

    function updateItem(id: string, details: ReminderDetails) {
        setItems(prev => prev.map(i => i.id === id ? { ...i, ...details } : i))
        supabase.from('home_care_items')
            .update(toDetailsColumns(details))
            .eq('id', id)
            .then(({ error }) => { if (error) console.error(error) })
    }

    // The database deletes its history too (home_care_logs cascades)
    function deleteItem(id: string) {
        setItems(prev => prev.filter(i => i.id !== id))
        supabase.from('home_care_items')
            .delete()
            .eq('id', id)
            .then(({ error }) => { if (error) console.error(error) })
    }

    return {
        items, error,
        logToday, addHistoryEntry, editHistoryEntry, deleteHistoryEntry, snooze,
        addItem, updateItem, deleteItem,
    }
}
