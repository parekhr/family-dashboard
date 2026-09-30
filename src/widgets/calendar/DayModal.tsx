import { formatDate, formatTime, formatShortDate } from '../../lib/dates'
import type { CalendarEvent, Person, Category } from './useCalendarData'
import { User, CalendarDays } from 'lucide-react'

type DayModalProps = {
    iso: string
    onClose: () => void
    events: CalendarEvent[]
    people: Person[]
    categories: Category[]
}

function getWhenText(event: CalendarEvent): string {
    if (event.start === event.end && event.allDay) {
        return "All Day"
    }
    else if (event.time) {
        return formatTime(event.time)
    }
    else {
        return `${formatShortDate(event.start)} → ${formatShortDate(event.end)}`
    }
}

function getPeopleText(people: Person[], personIds: string[]): string {
    return personIds.map(id => people.find(person => person.id === id)?.name ?? '').join(', ')
}

function getCategoryText(categories: Category[], categoryId: string): string {
    return categories.find(category => category.id === categoryId)?.name ?? ''
}

export function DayModal({ iso, onClose, events, people, categories }: DayModalProps) {
    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50" onClick={onClose}>
            <div className="w-[480px] rounded-3xl bg-card p-6 text-ink" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col">
                            <h3 className="flex items-center gap-2 text-xl font-extrabold">
                                <CalendarDays className="w-5 h-5 text-muted" />
                                {formatDate(iso)}
                            </h3>
                            <span className="ml-7 text-sm text-muted">
                                {events.length} {events.length === 1 ? 'event' : 'events'}
                            </span>
                        </div>

                    </div>
                    <button
                        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-muted/15 text-lg hover:bg-muted/25 active:bg-muted/35 transition-colors"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                {events.map((event) => {
                    return (
                        <div key={event.id} className="rounded-2xl bg-muted/10 p-4 mb-2 mt-4">
                            <div className="flex flex-col gap-1">

                                {/* row 1: name left, time right */}
                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold">{event.title?.trim() || getCategoryText(categories, event.categoryId)}</span>
                                    <span className="font-semibold text-primary">{getWhenText(event)}</span>
                                </div>

                                {/* row 2: people, only if there are any */}
                                {event.personIds.length > 0 && (
                                    <div className="flex items-center gap-2 text-sm text-muted">
                                        <User className="w-4 h-4" />
                                        <span>{getPeopleText(people, event.personIds)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}