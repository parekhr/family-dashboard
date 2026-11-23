import { getTodayISO, getTomorrowISO } from '../../lib/dates'
import type { CalendarEvent, Person, Category } from './useCalendarData'
import { CalendarRange } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '../../components/Modal'
import { EventCard } from './EventCard'

type AllEventsModalProps = {
    onClose: () => void
    events: CalendarEvent[]
    people: Person[]
    categories: Category[]
    onEdit: (event: CalendarEvent) => void
    onDelete: (id: string) => void
}

function formatGroupHeading(iso: string, todayISO: string, tomorrowISO: string): string {
    if (iso === todayISO) return 'Today'
    if (iso === tomorrowISO) return 'Tomorrow'
    const [year, month, day] = iso.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric',
    })
}

// Every event that hasn't ended yet, grouped by day.
// An event already in progress (started before today) is grouped under today,
// so the list never shows a heading for a day that's already gone.
export function AllEventsModal({ onClose, events, people, categories, onEdit, onDelete }: AllEventsModalProps) {

    const [confirmingId, setConfirmingId] = useState<string | null>(null)   // which event is asking "delete?" (null = none)

    const todayISO = getTodayISO()
    const tomorrowISO = getTomorrowISO()
    const groupDay = (event: CalendarEvent) => event.start > todayISO ? event.start : todayISO

    // same order as dayEvents: by day, then all-day before timed, then by start / time
    const upcoming = events
        .filter(event => event.end >= todayISO)
        .sort((a, b) =>
            groupDay(a).localeCompare(groupDay(b))
            || Number(b.allDay) - Number(a.allDay)
            || (a.allDay ? a.start.localeCompare(b.start) : (a.time ?? '').localeCompare(b.time ?? ''))
        )

    // events are already sorted, so each day's group comes out in order
    const groups = new Map<string, CalendarEvent[]>()
    for (const event of upcoming) {
        const day = groupDay(event)
        groups.set(day, [...(groups.get(day) ?? []), event])
    }

    return (
        <Modal onClose={onClose} className="w-[480px]">
            <div className="flex items-center justify-between">
                <h3 className="flex items-center gap-2 text-xl font-extrabold">
                    <CalendarRange className="w-5 h-5 text-muted" />
                    Upcoming Events
                </h3>
                <button
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-muted/15 text-lg hover:bg-muted/25 active:bg-muted/35 transition-colors"
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>
            <div className="max-h-[420px] overflow-y-auto mt-4">
                {upcoming.length === 0 && <p className="py-3 text-sm text-muted">No events</p>}
                {[...groups].map(([day, dayEvents]) => (
                    <div key={day} className="mb-4">
                        <h4 className="text-sm font-bold text-muted">{formatGroupHeading(day, todayISO, tomorrowISO)}</h4>
                        {dayEvents.map((event) => (
                            <EventCard
                                key={event.id}
                                event={event}
                                people={people}
                                categories={categories}
                                confirming={confirmingId === event.id}
                                onConfirmStart={() => setConfirmingId(event.id)}
                                onConfirmCancel={() => setConfirmingId(null)}
                                onEdit={onEdit}
                                onDelete={onDelete}
                            />
                        ))}
                    </div>
                ))}
            </div>
        </Modal>
    )
}
