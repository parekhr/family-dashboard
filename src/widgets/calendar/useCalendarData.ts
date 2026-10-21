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

function toCalendarEvent(row: CalendarEventRow): CalendarEvent {
    return {
        id: row.id,
        categoryId: row.category_id,
        title: row.title ?? undefined,
        start: row.start_date,
        end: row.end_date,
        allDay: row.all_day,
        time: row.time?.slice(0, 5),
        personIds: row.event_people.map(ep => ep.person_id)
    }
}


export function useCalendarData() {
    const [categories, setCategories] = useState<Category[]>([])
    const [people, setPeople] = useState<Person[]>([])
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [error, setError] = useState(false)

    useEffect(() => {
        let ignore = false
        Promise.all([
            supabase.from('categories').select('id, name, color').order('name'),
            supabase.from('people').select('id, name').order('name'),
            supabase.from('events').select('id, category_id, title, start_date, end_date, all_day, time, event_people(person_id)')
        ]).then(([categoriesResult, peopleResult, eventsResult]) => {
            if (ignore) return
            if (categoriesResult.error || peopleResult.error || eventsResult.error) {
                console.error(categoriesResult.error ?? peopleResult.error ?? eventsResult.error)
                setError(true)
                return
            }
            setCategories(categoriesResult.data.map(toCategory))
            setPeople(peopleResult.data.map(toPerson))
            setEvents(eventsResult.data.map(toCalendarEvent))
            if (categoriesResult.data) setCategories(categoriesResult.data.map(toCategory))
            if (peopleResult.data) setPeople(peopleResult.data.map(toPerson))
            if (eventsResult.data) setEvents(eventsResult.data.map(toCalendarEvent))
        })
        return () => { ignore = true }
    }, [])

    function addEvent(newEvent: Omit<CalendarEvent, 'id'>) {
        const id = crypto.randomUUID()
        setEvents(prevEvents => [...prevEvents, { ...newEvent, id }])
        supabase.from('events').insert({
            id: id,
            category_id: newEvent.categoryId,
            title: newEvent.title ?? null,
            start_date: newEvent.start,
            end_date: newEvent.end,
            all_day: newEvent.allDay,
            time: newEvent.time ?? null,
        }).then(({ error }) => {
            if (error) {
                console.error(error)
                return
            }
            if (newEvent.personIds.length === 0) return
            supabase.from('event_people')
                .insert(newEvent.personIds.map(person_id => ({ event_id: id, person_id })))
                .then(({ error }) => {
                    if (error) console.error(error)
                })
        })
    }

    function deleteEvent(id: string) {
        setEvents(prevEvents => prevEvents.filter(event => event.id !== id))
        supabase.from('events')
            .delete()
            .eq('id', id)
            .then(({ error }) => {
                if (error) console.error(error)
            })
    }

    function editEvent(id: string, updatedEvent: Omit<CalendarEvent, 'id'>) {
        setEvents(prevEvents => prevEvents.map(event =>
            event.id === id ? { ...updatedEvent, id } : event
        ))
        supabase.from('events')
            .update({
                category_id: updatedEvent.categoryId,
                title: updatedEvent.title ?? null,
                start_date: updatedEvent.start,
                end_date: updatedEvent.end,
                all_day: updatedEvent.allDay,
                time: updatedEvent.time ?? null,
            })
            .eq('id', id)
            .then(({ error }) => {
                if (error) {
                    console.error(error)
                    return
                }
                supabase.from('event_people')
                    .delete()
                    .eq('event_id', id)
                    .then(({ error }) => {
                        if (error) {
                            console.error(error)
                            return
                        }
                        if (updatedEvent.personIds.length === 0) return
                        supabase.from('event_people')
                            .insert(updatedEvent.personIds.map(person_id => ({ event_id: id, person_id })))
                            .then(({ error }) => {
                                if (error) console.error(error)
                            })
                    })
            })
    }


    return { categories, setCategories, people, setPeople, events, addEvent, deleteEvent, editEvent, error }
}