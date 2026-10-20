import { useEffect, useState } from "react"
import { supabase } from "../../lib/supabaseClient"

export type Category = {
    id: string
    name: string
    color?: string
}
type CategoryRow = {
    id: string
    name: string
    color: string | null
}

export type Person = {
    id: string
    name: string
}

type PersonRow = {
    id: string
    name: string
}

export type CalendarEvent = {
    id: string
    categoryId: string
    title?: string
    start: string          //ISO YYYY-MM-DD
    end: string            //ISO YYYY-MM-DD, inclusive
    allDay: boolean
    time?: string          // 24 hour HH:mm, only when !allDay
    personIds: string[]
}

type CalendarEventRow = {
    id: string
    category_id: string
    title: string | null
    start_date: string
    end_date: string
    all_day: boolean
    time: string | null
    event_people: { person_id: string }[]
}

function toCategory(row: CategoryRow): Category {
    return {
        id: row.id,
        name: row.name,
        color: row.color ?? undefined
    }
}

function toPerson(row: PersonRow): Person {
    return {
        id: row.id,
        name: row.name
    }
}


export function useCalendarData() {
    const [categories, setCategories] = useState<Category[]>([])
    const [people, setPeople] = useState<Person[]>([])
    const [events, setEvents] = useState<CalendarEvent[]>([])

    useEffect(() => {
        let ignore = false
        Promise.all([
            supabase.from('categories').select('*'),
            supabase.from('people').select('*'),
            supabase.from('events').select('*')
        ]).then(([categoriesResult, peopleResult, eventsResult]) => {
            if (ignore) return
            if (categoriesResult.error) console.error(categoriesResult.error)
            if (peopleResult.error) console.error(peopleResult.error)
            if (eventsResult.error) console.error(eventsResult.error)
            if (categoriesResult.data) setCategories(categoriesResult.data.map(toCategory))
            if (peopleResult.data) setPeople(peopleResult.data.map(toPerson))
            if (eventsResult.data) setEvents(eventsResult.data)
        })
        return () => { ignore = true }
    }, [])

    function addEvent(newEvent: Omit<CalendarEvent, 'id'>) {
        setEvents(prevEvents => [...prevEvents, { ...newEvent, id: crypto.randomUUID() }])
    }

    function deleteEvent(id: string) {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== id))
    }

    function editEvent(id: string, updatedEvent: Omit<CalendarEvent, 'id'>) {
        setEvents(prevEvents => prevEvents.map(event =>
            event.id === id ? { ...updatedEvent, id } : event
        ))
    }


    return { categories, setCategories, people, setPeople, events, addEvent, deleteEvent, editEvent }
}