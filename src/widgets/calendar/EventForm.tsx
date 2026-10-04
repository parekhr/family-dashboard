import { useState } from 'react'
import type { CalendarEvent, Category, Person } from './useCalendarData'
import { getTodayISO } from '../../lib/dates'
import { Users } from 'lucide-react'

type EventFormProps = {
    onClose: () => void
    onSave: (event: Omit<CalendarEvent, 'id'>) => void
    categories: Category[]
    people: Person[]
    event?: CalendarEvent      // present = editing this event, absent = adding a new one
}

const labelClass = 'flex flex-col gap-1 text-sm font-semibold text-muted'
const inputClass = 'h-11 w-full rounded-xl border border-muted/30 bg-white px-3 text-base font-normal text-ink'

export function EventForm({ onClose, onSave, categories, people, event }: EventFormProps) {

    const [categoryId, setCategoryId] = useState(event?.categoryId ?? categories[0]?.id ?? '')
    const [title, setTitle] = useState(event?.title ?? '')
    const [start, setStart] = useState(event?.start ?? getTodayISO())
    const [end, setEnd] = useState(event?.end ?? getTodayISO())
    const [allDay, setAllDay] = useState(event?.allDay ?? false)
    const [time, setTime] = useState(event?.time ?? '')
    const [personIds, setPersonIds] = useState<string[]>(event?.personIds ?? [])
    const [error, setError] = useState('')

    const everyoneSelected = people.length > 0 && personIds.length === people.length

    function togglePerson(id: string) {
        if (personIds.includes(id)) {
            setPersonIds(personIds.filter(personId => personId !== id))
        } else {
            setPersonIds([...personIds, id])
        }
    }

    function toggleEveryone() {
        setPersonIds(everyoneSelected ? [] : people.map(person => person.id))
    }

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        if (!categoryId) {
            setError('Choose a category')
            return
        }
        if (!allDay && !time) {
            setError('Choose a time, or mark the event as all day')
            return
        }
        if (allDay && end < start) {
            setError("The end date can't be before the start date")
            return
        }

        onSave({
            categoryId,
            title: title.trim() || undefined,
            start,
            end: allDay ? end : start,      // timed events are single-day
            allDay,
            time: allDay ? undefined : time,
            personIds
        })
        onClose()
    }

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40 z-50" onClick={onClose}>
            <div className="w-[480px] max-h-[calc(100%-2rem)] flex flex-col rounded-3xl bg-card p-6 text-ink" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-extrabold">{event ? 'Edit Event' : 'Add Event'}</h3>
                    <button
                        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-muted/15 text-lg hover:bg-muted/25 active:bg-muted/35 transition-colors"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>
                <div className="mt-4 flex-1 min-h-0 overflow-y-auto pr-1">
                    <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-2 gap-3">
                            <label className={labelClass}>
                                Title (optional)
                                <input type="text" className={inputClass} value={title} onChange={(e) => setTitle(e.target.value)} />
                            </label>

                            <label className={labelClass}>
                                Category
                                <select className={inputClass} value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                                    {categories.map(category => (
                                        <option key={category.id} value={category.id}>{category.name}</option>
                                    ))}
                                </select>
                            </label>
                        </div>

                        <label className="flex items-center gap-3 h-11 font-semibold w-fit cursor-pointer">
                            <input type="checkbox" className="h-5 w-5 accent-primary" checked={allDay} onChange={(e) => setAllDay(e.target.checked)} />
                            All Day
                        </label>

                        <div className="grid grid-cols-2 gap-3">
                            <label className={labelClass}>
                                {allDay ? 'Start' : 'Date'}
                                <input type="date" className={inputClass} value={start} onChange={(e) => setStart(e.target.value)} />
                            </label>
                            {allDay ? (
                                <label className={labelClass}>
                                    End
                                    <input type="date" className={inputClass} value={end} min={start} onChange={(e) => setEnd(e.target.value)} />
                                </label>
                            ) : (
                                <label className={labelClass}>
                                    Time
                                    <input type="time" className={inputClass} value={time} onChange={(e) => setTime(e.target.value)} />
                                </label>
                            )}
                        </div>

                        <div className="flex flex-col gap-1">
                            <span className="text-sm font-semibold text-muted">People</span>
                            <div className="flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    className={`h-11 px-4 rounded-full font-semibold cursor-pointer transition-colors border-2 border-primary flex items-center gap-2 ${everyoneSelected ? 'bg-primary text-white' : 'text-primary hover:bg-primary/10'}`}
                                    onClick={toggleEveryone}
                                >
                                    <Users className="w-4 h-4" />   
                                    Everyone
                                </button>
                                <span className="w-px h-6 self-center bg-muted/30"></span>
                                {people.map(person => (
                                    <button
                                        key={person.id}
                                        type="button"
                                        className={`h-11 px-4 rounded-full font-semibold cursor-pointer transition-colors ${personIds.includes(person.id) ? 'bg-primary text-white' : 'bg-muted/15 text-ink hover:bg-muted/25'}`}
                                        onClick={() => togglePerson(person.id)}
                                    >
                                        {person.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <span className="text-sm font-semibold text-today">{error}</span>
                        )}

                        <button type="submit" className="h-11 rounded-xl bg-primary font-semibold text-white cursor-pointer hover:bg-primary-hover active:bg-primary-hover transition-colors">Save</button>
                    </form>
                </div>
            </div>
        </div>
    )
}