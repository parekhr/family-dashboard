import { useState } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import { useCalendar } from '../../widgets/calendar/CalendarContext'
import { MAX_NAME_LENGTH, addButtonClass, cancelButtonClass, checkName, iconButtonClass, inputClass, plural, saveButtonClass } from './shared'

// The People tab: the names shown as chips in the event form and on event cards.
export function PeopleSettings() {
    const { people, events, addPerson, renamePerson, deletePerson } = useCalendar()

    // Only one thing open at a time: adding, renaming one row, or confirming one delete
    const [adding, setAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [confirmingId, setConfirmingId] = useState<string | null>(null)
    const [draft, setDraft] = useState('')
    const [error, setError] = useState('')

    function closeAll() {
        setAdding(false)
        setEditingId(null)
        setConfirmingId(null)
        setDraft('')
        setError('')
    }

    function startEditing(id: string, name: string) {
        closeAll()
        setEditingId(id)
        setDraft(name)
    }

    function handleSave() {
        const otherNames = people.filter(person => person.id !== editingId).map(person => person.name)
        const problem = checkName(draft, otherNames)
        if (problem) {
            setError(problem)
            return
        }
        if (editingId) renamePerson(editingId, draft.trim())
        else addPerson(draft.trim())
        closeAll()
    }

    // the name field with Save / Cancel, used both for adding and for renaming a row
    const nameForm = (
        <div className="flex w-full flex-col gap-1">
            <div className="flex items-center gap-2">
                <input
                    type="text"
                    className={inputClass}
                    value={draft}
                    maxLength={MAX_NAME_LENGTH}
                    placeholder="Name"
                    autoFocus
                    onChange={(e) => { setDraft(e.target.value); setError('') }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                />
                <button className={saveButtonClass} onClick={handleSave}>Save</button>
                <button className={cancelButtonClass} onClick={closeAll}>Cancel</button>
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
    )

    return (
        <div className="flex flex-col">
            {people.length === 0 && !adding && <p className="py-3 text-sm text-muted">No people yet</p>}

            {people.map(person => {
                const eventCount = events.filter(event => event.personIds.includes(person.id)).length

                if (editingId === person.id) {
                    return <div key={person.id} className="border-b border-muted/20 py-2">{nameForm}</div>
                }

                // Same confirm swap as the event cards: the question replaces the name's
                // right side, and cancel sits where the trash was so a double tap can't delete.
                if (confirmingId === person.id) {
                    return (
                        <div key={person.id} className="flex items-center gap-2 border-b border-muted/20 py-2">
                            <span className="flex-1 font-semibold text-red-600">
                                Delete {person.name}?
                                {eventCount > 0 && (
                                    <span className="block text-sm font-normal text-muted">
                                        They'll be removed from {plural(eventCount, 'event')}.
                                    </span>
                                )}
                            </span>
                            <button
                                className={`${iconButtonClass} border-none bg-red-600 text-white`}
                                aria-label={`Delete ${person.name}`}
                                onClick={() => { deletePerson(person.id); closeAll() }}
                            >
                                <Trash2 size={18} />
                            </button>
                            <button className={`${iconButtonClass} text-muted`} aria-label="Cancel" onClick={closeAll}>
                                <X size={18} />
                            </button>
                        </div>
                    )
                }

                return (
                    <div key={person.id} className="flex items-center gap-2 border-b border-muted/20 py-2">
                        <span className="flex-1 truncate text-base font-semibold">{person.name}</span>
                        <button className={`${iconButtonClass} text-muted hover:bg-muted/10`} aria-label={`Rename ${person.name}`} onClick={() => startEditing(person.id, person.name)}>
                            <Pencil size={18} />
                        </button>
                        <button className={`${iconButtonClass} text-red-600 hover:bg-red-100`} aria-label={`Delete ${person.name}`} onClick={() => { closeAll(); setConfirmingId(person.id) }}>
                            <Trash2 size={18} />
                        </button>
                    </div>
                )
            })}

            {adding ? (
                <div className="mt-3">{nameForm}</div>
            ) : (
                <button className={addButtonClass} onClick={() => { closeAll(); setAdding(true) }}>
                    + Add Person
                </button>
            )}
        </div>
    )
}
