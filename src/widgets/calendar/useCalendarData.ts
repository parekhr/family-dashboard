import { useState } from "react"

export type EventType = {
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
    typeId: string        
    title?: string         
    start: string          //ISO YYYY-MM-DD
    end: string            //ISO YYYY-MM-DD, inclusive
    allDay: boolean
    time?: string          // 24 hour HH:mm, only when !allDay
    personIds: string[]    
}


export function useCalendarData() {
    const [eventTypes, setEventTypes] = useState<EventType[]>([
        { id: "1", name: "Meeting", color: "#378ADD" },
        { id: "2", name: "Appointment", color: "#FF5733" },
        { id: "3", name: "Holiday", color: "#28A745" }
    ])

    const [people] = useState<Person[]>([
        { id: "1", name: "Alice" },
        { id: "2", name: "Bob" },
        { id: "3", name: "Charlie" }
    ])

    const [events] = useState<CalendarEvent[]>([
        {
            id: "1",
            typeId: "1",
            title: "Team Meeting",
            start: "2024-06-01",
            end: "2024-06-01",
            allDay: false,
            time: "10:00",
            personIds: ["1", "2"]
        },
        {
            id: "2",
            typeId: "2",
            title: "Doctor Appointment",
            start: "2024-06-02",
            end: "2024-06-02",
            allDay: false,
            time: "14:00",
            personIds: ["3"]
        }
    ])
    return { eventTypes, setEventTypes, people, events }
}