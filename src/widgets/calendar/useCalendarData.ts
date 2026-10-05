import { useState } from "react"

export type Category = {
    id: string
    name: string
    color: string          
}

export type Person = {
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


export function useCalendarData() {
    const [categories, setCategories] = useState<Category[]>([
        { id: "c1", name: "Meeting", color: "#378ADD" },
        { id: "c2", name: "Appointment", color: "#FF5733" },
        { id: "c3", name: "Vacation", color: "#335F57" }
    ])

    const [people] = useState<Person[]>([
        { id: "p1", name: "Alice" },
        { id: "p2", name: "Bob" },
        { id: "p3", name: "Charlie" }
    ])

    const [events, setEvents] = useState<CalendarEvent[]>([
        {
            id: "e1",
            categoryId: "c1",
            title: "Team Meeting",
            start: "2026-09-01",
            end: "2026-09-01",
            allDay: false,
            time: "10:00",
            personIds: ["p1", "p2"]
        },
        {
            id: "e2",
            categoryId: "c2",
            title: "Doctor Appointment",
            start: "2026-09-02",
            end: "2026-09-02",
            allDay: false,
            time: "14:00",
            personIds: ["p3"]
        },
        {
            id: "e3",
            categoryId: "c2",
            title: "Trash Pick Up",
            start: "2026-09-03",
            end: "2026-09-03",
            allDay: true,
            personIds: []
        },
        {
            id: "e4",
            categoryId: "c1",
            title: "Project Kickoff",
            start: "2026-09-03",
            end: "2026-09-03",
            allDay: false,
            time: "09:00",
            personIds: ["p1", "p3"]
        },
        {
            id: "e5",
            categoryId: "c2",
            start: "2026-09-04",
            end: "2026-09-04",
            allDay: false,
            time: "15:00",
            personIds: ["p2"]
        },
        {
            id: "e6",
            categoryId: "c1",
            title: "Team Lunch",
            start: "2026-09-05",
            end: "2026-09-05",
            allDay: false,
            time: "12:30",
            personIds: []
        },
        {
            id: "e7",
            categoryId: "c3",
            title: "Company Retreat",
            start: "2026-10-01",
            end: "2026-10-14",
            allDay: true,
            personIds: ["p1", "p2", "p3"]
        },
        {
            id: "e8",
            categoryId: "c3",
            title: "Vacation",
            start: "2026-08-30",
            end: "2026-09-07",
            allDay: true,
            personIds: ["p2", "p3"]
        },
        {
            id: "e9",
            categoryId: "c2",
            title: "School Starts",
            start: "2026-10-02",
            end: "2026-10-02",
            allDay: true,
            personIds: ["p1", "p3"]
        }
    ])

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

    return { categories, setCategories, people, events, addEvent, deleteEvent, editEvent }
}