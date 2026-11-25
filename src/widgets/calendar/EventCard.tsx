import { formatTime, formatShortDate } from '../../lib/dates'
import type { CalendarEvent, Person, Category } from './useCalendarData'
import { getCategoryText, getCategoryColor } from './categories'
import { User, Pencil, Trash2, X } from 'lucide-react'
import { confirmDeleteButtonClass, dangerIconButtonClass, iconButtonClass } from '../../components/styles'

type EventCardProps = {
    event: CalendarEvent
    people: Person[]
    categories: Category[]
    confirming: boolean                 // is this card asking "delete?"
    onConfirmStart: () => void
    onConfirmCancel: () => void
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

// One event row, shared by the Day modal and the All Events modal.
// The parent owns which card is confirming a delete, so only one can ask at a time.
export function EventCard({ event, people, categories, confirming, onConfirmStart, onConfirmCancel, onEdit, onDelete }: EventCardProps) {
    const hasTitle = Boolean(event.title?.trim())
    const hasPeople = event.personIds.length > 0

    return (
        <div className="flex items-center gap-3 rounded-2xl bg-muted/10 p-4 mb-2 mt-4">
            <div className="flex flex-col gap-1 flex-1 min-w-0">

                {/* row 1: name left, time right */}
                <div className="flex items-center justify-between gap-3">
                    <span className="text-lg font-bold min-w-0 break-words">{event.title?.trim() || getCategoryText(categories, event.categoryId)}</span>
                    {confirming ? (
                        <span className="font-semibold text-red-600 whitespace-nowrap shrink-0">Delete?</span>
                    ) : (
                        <span className="font-semibold text-primary whitespace-nowrap shrink-0">{getWhenText(event)}</span>
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
            {confirming ? (
                <div className="flex items-center gap-2">
                    <button
                        className={confirmDeleteButtonClass}
                        onClick={() => { onConfirmCancel(); onDelete(event.id) }}
                    >
                        <Trash2 size={18} />
                    </button>
                    <button
                        className={iconButtonClass}
                        onClick={onConfirmCancel}
                    >
                        <X size={18} />
                    </button>
                </div>
            ) : (
                <div className="flex items-center gap-2">
                    <button
                        className={iconButtonClass}
                        onClick={() => onEdit(event)}
                    >
                        <Pencil size={18} />
                    </button>
                    <button
                        className={dangerIconButtonClass}
                        onClick={onConfirmStart}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )}
        </div>
    )
}
