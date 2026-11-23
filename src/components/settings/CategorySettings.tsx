import { useState } from 'react'
import { Ban, Check, ChevronDown, Pencil, Trash2, X } from 'lucide-react'
import { useCalendar } from '../../widgets/calendar/CalendarContext'
import { categoryColors } from '../../lib/categoryColors'
import { MAX_NAME_LENGTH, addButtonClass, cancelButtonClass, checkName, iconButtonClass, inputClass, plural, saveButtonClass } from './shared'

// The Categories tab: the event types in the event form's Category dropdown.
export function CategorySettings() {
    const { categories, events, addCategory, updateCategory, deleteCategory } = useCalendar()

    // Only one thing open at a time: adding, editing one row, or deleting one row
    const [adding, setAdding] = useState(false)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [draftName, setDraftName] = useState('')
    const [draftColor, setDraftColor] = useState<string | null>(null)
    const [moveToId, setMoveToId] = useState('')   // where a deleted category's events go
    const [error, setError] = useState('')

    function closeAll() {
        setAdding(false)
        setEditingId(null)
        setDeletingId(null)
        setDraftName('')
        setDraftColor(null)
        setMoveToId('')
        setError('')
    }

    function startEditing(id: string, name: string, color: string | undefined) {
        closeAll()
        setEditingId(id)
        setDraftName(name)
        setDraftColor(color ?? null)
    }

    function startDeleting(id: string) {
        closeAll()
        setDeletingId(id)
        // suggest "Other" as the new home for its events, else the first other category
        const others = categories.filter(category => category.id !== id)
        setMoveToId((others.find(category => category.name === 'Other') ?? others[0])?.id ?? '')
    }

    function handleSave() {
        const otherNames = categories.filter(category => category.id !== editingId).map(category => category.name)
        const problem = checkName(draftName, otherNames)
        if (problem) {
            setError(problem)
            return
        }
        if (editingId) updateCategory(editingId, draftName.trim(), draftColor)
        else addCategory(draftName.trim(), draftColor)
        closeAll()
    }

    // A color from before the fixed palette still shows (and stays picked) until it's changed
    const swatches = draftColor && !categoryColors.some(color => color.value === draftColor)
        ? [{ name: 'Current color', value: draftColor }, ...categoryColors]
        : categoryColors

    // name field, color swatches, Save / Cancel: used for adding and for editing a row
    const categoryForm = (
        <div className="flex w-full flex-col gap-2">
            <input
                type="text"
                className={inputClass}
                value={draftName}
                maxLength={MAX_NAME_LENGTH}
                placeholder="Name"
                autoFocus
                onChange={(e) => { setDraftName(e.target.value); setError('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
            />
            {/* p-1: the selected ring sits 4px outside its circle, and the scroll area would clip it */}
            <div className="flex flex-wrap gap-1.5 p-1">
                <button
                    className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-muted/40 text-muted ${draftColor === null ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : ''}`}
                    aria-label="No color"
                    aria-pressed={draftColor === null}
                    onClick={() => setDraftColor(null)}
                >
                    <Ban size={16} />
                </button>
                {swatches.map(color => (
                    <button
                        key={color.value}
                        className={`flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-white ${draftColor === color.value ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : ''}`}
                        style={{ backgroundColor: color.value }}
                        aria-label={color.name}
                        aria-pressed={draftColor === color.value}
                        onClick={() => setDraftColor(color.value)}
                    >
                        {draftColor === color.value && <Check size={16} />}
                    </button>
                ))}
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <div className="flex justify-end gap-2">
                <button className={cancelButtonClass} onClick={closeAll}>Cancel</button>
                <button className={saveButtonClass} onClick={handleSave}>Save</button>
            </div>
        </div>
    )

    return (
        <div className="flex flex-col">
            {categories.length === 0 && !adding && <p className="py-3 text-sm text-muted">No categories yet</p>}

            {categories.map(category => {
                const eventCount = events.filter(event => event.categoryId === category.id).length

                if (editingId === category.id) {
                    return <div key={category.id} className="border-b border-muted/20 py-3">{categoryForm}</div>
                }

                // Same confirm swap as people and event cards: the row keeps its height,
                // the question replaces the name, and the buttons swap to confirm / cancel
                // (cancel sits where the trash was, so a double tap can't delete).
                if (deletingId === category.id) {
                    const others = categories.filter(other => other.id !== category.id)
                    const blocked = eventCount > 0 && others.length === 0   // events must keep a category
                    return (
                        <div key={category.id} className="flex items-center gap-2 border-b border-muted/20 py-2">
                            <div className="flex min-w-0 flex-1 flex-col leading-tight">
                                <span className="truncate font-semibold text-red-600">
                                    {blocked ? `Can't delete ${category.name}` : `Delete ${category.name}?`}
                                </span>
                                <span className="truncate text-sm text-muted">
                                    {blocked
                                        ? `${plural(eventCount, 'event')} need another category`
                                        : eventCount > 0 ? `Move its ${plural(eventCount, 'event')} to` : 'No events use it'}
                                </span>
                            </div>
                            {eventCount > 0 && !blocked && (
                                <div className="relative w-36 shrink-0">
                                    <select
                                        className={`${inputClass} cursor-pointer appearance-none pr-9`}
                                        aria-label="Move events to"
                                        value={moveToId}
                                        onChange={(e) => setMoveToId(e.target.value)}
                                    >
                                        {others.map(other => (
                                            <option key={other.id} value={other.id}>{other.name}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" />
                                </div>
                            )}
                            {!blocked && (
                                <button
                                    className={`${iconButtonClass} border-none bg-red-600 text-white`}
                                    aria-label={eventCount > 0 ? `Move events and delete ${category.name}` : `Delete ${category.name}`}
                                    onClick={() => { deleteCategory(category.id, eventCount > 0 ? moveToId : null); closeAll() }}
                                >
                                    <Trash2 size={18} />
                                </button>
                            )}
                            <button className={`${iconButtonClass} text-muted`} aria-label="Cancel" onClick={closeAll}>
                                <X size={18} />
                            </button>
                        </div>
                    )
                }

                return (
                    <div key={category.id} className="flex items-center gap-2 border-b border-muted/20 py-2">
                        {/* the color dot, or an empty ring for no color */}
                        <span
                            className={`h-4 w-4 shrink-0 rounded-full ${category.color ? '' : 'border-2 border-muted/40'}`}
                            style={category.color ? { backgroundColor: category.color } : undefined}
                        />
                        <span className="flex-1 truncate text-base font-semibold" style={{ color: category.color }}>
                            {category.name}
                        </span>
                        <button className={`${iconButtonClass} text-muted hover:bg-muted/10`} aria-label={`Edit ${category.name}`} onClick={() => startEditing(category.id, category.name, category.color)}>
                            <Pencil size={18} />
                        </button>
                        <button className={`${iconButtonClass} text-red-600 hover:bg-red-100`} aria-label={`Delete ${category.name}`} onClick={() => startDeleting(category.id)}>
                            <Trash2 size={18} />
                        </button>
                    </div>
                )
            })}

            {adding ? (
                <div className="mt-3">{categoryForm}</div>
            ) : (
                <button className={addButtonClass} onClick={() => { closeAll(); setAdding(true) }}>
                    + Add Category
                </button>
            )}
        </div>
    )
}
