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

// Alphabetical, with "Other" always last. Also used after adds and renames in Settings,
// so the list stays in order without reloading.
function sortCategories(categories: Category[]): Category[] {
    return [...categories].sort((a, b) =>
        Number(a.name === 'Other') - Number(b.name === 'Other') || a.name.localeCompare(b.name)
    )
}

function sortPeople(people: Person[]): Person[] {
    return [...people].sort((a, b) => a.name.localeCompare(b.name))
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


// Called once in App (like useHomeCareData), so the calendar and Settings share one copy:
// renaming a category or person in Settings shows up in the calendar straight away.
// Waits for the signed-in user.
export function useCalendarData(userId: string | undefined) {
    const [categories, setCategories] = useState<Category[]>([])
    const [people, setPeople] = useState<Person[]>([])
    const [events, setEvents] = useState<CalendarEvent[]>([])
    const [error, setError] = useState(false)

    useEffect(() => {
        if (!userId) return
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
            setCategories(sortCategories(categoriesResult.data.map(toCategory)))
            setPeople(sortPeople(peopleResult.data.map(toPerson)))
            setEvents(eventsResult.data.map(toCalendarEvent))
        })
        return () => { ignore = true }
    }, [userId])

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


    // ---- Categories and people, managed from Settings ----
    // Same optimistic pattern as events: update the screen first, then save.

    function addCategory(name: string, color: string | null) {
        const id = crypto.randomUUID()
        setCategories(prev => sortCategories([...prev, { id, name, color: color ?? undefined }]))
        supabase.from('categories')
            .insert({ id, name, color })
            .then(({ error }) => { if (error) console.error(error) })
    }

    function updateCategory(id: string, name: string, color: string | null) {
        setCategories(prev => sortCategories(prev.map(category =>
            category.id === id ? { ...category, name, color: color ?? undefined } : category
        )))
        supabase.from('categories')
            .update({ name, color })
            .eq('id', id)
            .then(({ error }) => { if (error) console.error(error) })
    }

    // Events can't be left without a category (the database blocks it), so any events
    // using this one move to `moveToId` first. The delete waits for the move to save.
    function deleteCategory(id: string, moveToId: string | null) {
        setCategories(prev => prev.filter(category => category.id !== id))
        if (moveToId) {
            setEvents(prev => prev.map(event => event.categoryId === id ? { ...event, categoryId: moveToId } : event))
        }
        const moveEvents = moveToId
            ? supabase.from('events').update({ category_id: moveToId }).eq('category_id', id)
            : Promise.resolve({ error: null })
        moveEvents.then(({ error }) => {
            if (error) {
                console.error(error)
                return
            }
            supabase.from('categories')
                .delete()
                .eq('id', id)
                .then(({ error }) => { if (error) console.error(error) })
        })
    }

    function addPerson(name: string) {
        const id = crypto.randomUUID()
        setPeople(prev => sortPeople([...prev, { id, name }]))
        supabase.from('people')
            .insert({ id, name })
            .then(({ error }) => { if (error) console.error(error) })
    }

    function renamePerson(id: string, name: string) {
        setPeople(prev => sortPeople(prev.map(person => person.id === id ? { ...person, name } : person)))
        supabase.from('people')
            .update({ name })
            .eq('id', id)
            .then(({ error }) => { if (error) console.error(error) })
    }

    // The database removes them from their events too (event_people cascades)
    function deletePerson(id: string) {
        setPeople(prev => prev.filter(person => person.id !== id))
        setEvents(prev => prev.map(event => ({ ...event, personIds: event.personIds.filter(personId => personId !== id) })))
        supabase.from('people')
            .delete()
            .eq('id', id)
            .then(({ error }) => { if (error) console.error(error) })
    }

    return {
        categories, people, events, error,
        addEvent, deleteEvent, editEvent,
        addCategory, updateCategory, deleteCategory,
        addPerson, renamePerson, deletePerson,
    }
}