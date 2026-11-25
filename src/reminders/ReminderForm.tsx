import { useState } from 'react'
import { MAX_NAME_LENGTH, cancelButtonClass, checkName, inputClass, saveButtonClass } from '../components/settings/shared'
import { raisedNeutralClass, raisedPrimaryClass } from '../components/styles'
import { reminderIcons } from './icons'
import { DEFAULT_INTERVAL, getIntervalLabel, intervalChoices, intervalKey, type Interval } from './reminders'
import type { ReminderDetails, ReminderItem } from './useRemindersData'

type ReminderFormProps = {
    initial?: ReminderItem       // absent = adding a new reminder
    otherNames: string[]         // names already taken, for the duplicate check
    onSave: (details: ReminderDetails) => void
    onCancel: () => void
}

const labelClass = 'flex flex-col gap-1 text-sm font-semibold text-muted'
const MAX_NOTES_LENGTH = 300   // matches the check on home_care_items.notes

// Name, how often, icon and notes. Every reminder repeats: a new one starts at every 6
// months, and an old item saved without a "how often" gets that too once it's edited.
// Any other details (model, size, part number, where to buy it) go in Notes.
export function ReminderForm({ initial, otherNames, onSave, onCancel }: ReminderFormProps) {
    const [name, setName] = useState(initial?.name ?? '')
    const [interval, setIntervalChoice] = useState<Interval>(initial?.interval ?? DEFAULT_INTERVAL)
    const [icon, setIcon] = useState(initial?.icon ?? reminderIcons[0].key)
    const [notes, setNotes] = useState(initial?.notes ?? '')
    const [error, setError] = useState('')

    // An interval saved that isn't one of the choices (say every 5 months) stays one
    const choices = intervalChoices.some(choice => intervalKey(choice) === intervalKey(interval))
        ? intervalChoices
        : [...intervalChoices, interval]

    function handleSave() {
        const problem = checkName(name, otherNames)
        if (problem) {
            setError(problem)
            return
        }
        onSave({
            name: name.trim(),
            interval,
            icon,
            notes: notes.trim() || undefined,
        })
    }

    return (
        <div className="flex flex-col gap-3">
            <label className={labelClass}>
                Name
                <input
                    type="text"
                    className={inputClass}
                    value={name}
                    maxLength={MAX_NAME_LENGTH}
                    placeholder="Furnace filter"
                    autoFocus
                    onChange={(e) => { setName(e.target.value); setError('') }}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                />
                {error && <span className="font-normal text-red-600">{error}</span>}
            </label>

            {/* Tappable choices instead of a dropdown: all visible at once, in the house style,
                and the selected one can't be mistaken for the one under the finger */}
            <div className={labelClass}>
                Repeats
                <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Repeats">
                    {choices.map(choice => {
                        const selected = intervalKey(choice) === intervalKey(interval)
                        return (
                            <button
                                key={intervalKey(choice)}
                                type="button"
                                role="radio"
                                aria-checked={selected}
                                className={`h-11 rounded-control text-base ${selected ? raisedPrimaryClass : raisedNeutralClass}`}
                                onClick={() => setIntervalChoice(choice)}
                            >
                                {getIntervalLabel(choice)}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className={labelClass}>
                Icon
                {/* p-1: room for the selected ring, as with the category colors */}
                <div className="grid grid-cols-7 gap-1.5 p-1">
                    {reminderIcons.map(({ key, label, Icon }) => (
                        <button
                            key={key}
                            type="button"
                            className={`flex h-11 w-11 cursor-pointer items-center justify-center rounded-full transition-colors ${icon === key ? 'bg-primary text-white' : 'bg-muted/10 text-ink hover:bg-muted/20'}`}
                            aria-label={label}
                            aria-pressed={icon === key}
                            title={label}
                            onClick={() => setIcon(key)}
                        >
                            <Icon size={20} />
                        </button>
                    ))}
                </div>
            </div>

            <label className={labelClass}>
                Notes (optional)
                <textarea
                    className={`${inputClass} h-28 resize-none py-2`}
                    value={notes}
                    maxLength={MAX_NOTES_LENGTH}
                    placeholder="Model, size, part number, where to buy it"
                    onChange={(e) => setNotes(e.target.value)}
                />
            </label>

            <div className="flex justify-end gap-2">
                <button className={cancelButtonClass} onClick={onCancel}>Cancel</button>
                <button className={saveButtonClass} onClick={handleSave}>Save</button>
            </div>
        </div>
    )
}
