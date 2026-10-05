import { formatDate, formatTime, formatShortDate } from '../../lib/dates'
import type { CalendarEvent, Person, Category } from './useCalendarData'
import type { Holiday } from './holidays'
import { User, CalendarDays, Pencil, Trash2, X } from 'lucide-react'
import { useState } from 'react'

type DayModalProps = {
    iso: string
    onClose: () => void
    events: CalendarEvent[]
    people: Person[]
    categories: Category[]
    holiday?: Holiday
    onEdit: (event: CalendarEvent) => void
    onDelete: (id: string) => void
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

function getCategoryColor(categories: Category[], categoryId: string): string | undefined {
    return categories.find(category => category.id === categoryId)?.color
}

export function DayModal({ iso, onClose, events, people, categories, holiday, onEdit, onDelete }: DayModalProps) {

    const [confirmingId, setConfirmingId] = useState<string | null>(null)   // which event is asking "delete?" (null = none)

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
                            {holiday && (
                                <span className="ml-7 text-sm text-muted">
                                    {holiday.name}
                                </span>
                            )}
                        </div>

                    </div>
                    <button
                        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-muted/15 text-lg hover:bg-muted/25 active:bg-muted/35 transition-colors"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                <div className="max-h-[320px] overflow-y-auto mt-4">
                    {events.map((event) => {
                        const hasTitle = Boolean(event.title?.trim())
                        const hasPeople = event.personIds.length > 0
                        return (
                            <div key={event.id} className="flex items-center gap-3 rounded-2xl bg-muted/10 p-4 mb-2 mt-4">
                                <div className="flex flex-col gap-1 flex-1 min-w-0">

                                    {/* row 1: name left, time right */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold">{event.title?.trim() || getCategoryText(categories, event.categoryId)}</span>
                                        {confirmingId === event.id ? (
                                            <span className="font-semibold text-red-600">Delete?</span>
                                        ) : (
                                            <span className="font-semibold text-primary">{getWhenText(event)}</span>
                                        )}
                                    </div>

                                    {/* row 2: people, only if there are any */}
                                    {(hasPeople || hasTitle) && (
                                        <div className="flex items-center gap-2 text-sm text-muted">
                                            {hasTitle && <span style={{ color: getCategoryColor(categories, event.categoryId) }}>{getCategoryText(categories, event.categoryId)}</span>}
                                            {hasTitle && hasPeople && <span>·</span>}
                                            {hasPeople && (
                                                <>
                                                    <User className="w-4 h-4" />
                                                    <span>{getPeopleText(people, event.personIds)}</span>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* edit + delete, same buttons as Home Care's History modal.
                                    The trash asks first: "Delete?" replaces the time, and the buttons swap to
                                    confirm / cancel at the same size, so the card never changes shape.
                                    Cancel sits where the trash was, so a double tap can't delete. */}
                                {confirmingId === event.id ? (
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-red-600 text-white"
                                            onClick={() => { setConfirmingId(null); onDelete(event.id) }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <button
                                            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-muted/30 text-muted"
                                            onClick={() => setConfirmingId(null)}
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-muted/30 text-muted"
                                            onClick={() => onEdit(event)}
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-muted/30 text-red-600"
                                            onClick={() => setConfirmingId(event.id)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}