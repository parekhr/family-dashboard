import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { MAX_NAME_LENGTH, cancelButtonClass, checkName, inputClass, saveButtonClass } from '../../components/settings/shared'
import { homeCareIcons } from './icons'
import { getIntervalText, intervalChoices } from './reminders'
import type { HomeCareItemDetails } from './useHomeCareData'

type ItemDetailsFormProps = {
    initial?: HomeCareItemDetails       // absent = adding a new item
    otherNames: string[]                // names already taken, for the duplicate check
    showReminder: boolean               // the details page has its own Reminder dropdown
    onSave: (details: HomeCareItemDetails) => void
    onCancel: () => void
}

const labelClass = 'flex flex-col gap-1 text-sm font-semibold text-muted'

// Name, icon, model, size (and the reminder, when adding). Used by the Add Item pop-up
// and by the pencil on an item's details page.
export function ItemDetailsForm({ initial, otherNames, showReminder, onSave, onCancel }: ItemDetailsFormProps) {
    const [name, setName] = useState(initial?.name ?? '')
    const [icon, setIcon] = useState(initial?.icon ?? homeCareIcons[0].key)
    const [model, setModel] = useState(initial?.model ?? '')
    const [size, setSize] = useState(initial?.size ?? '')
    const [intervalMonths, setIntervalMonths] = useState<number | undefined>(initial?.intervalMonths ?? 6)
    const [error, setError] = useState('')

    function handleSave() {
        const problem = checkName(name, otherNames)
        if (problem) {
            setError(problem)
            return
        }
        onSave({
            name: name.trim(),
            icon,
            model: model.trim() || undefined,
            size: size.trim() || undefined,
            intervalMonths: showReminder ? intervalMonths : initial?.intervalMonths,
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

            <div className={labelClass}>
                Icon
                {/* p-1: room for the selected ring, as with the category colors */}
                <div className="grid grid-cols-7 gap-1.5 p-1">
                    {homeCareIcons.map(({ key, label, Icon }) => (
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

            <div className="grid grid-cols-2 gap-3">
                <label className={labelClass}>
                    Model (optional)
                    <input type="text" className={inputClass} value={model} maxLength={40} onChange={(e) => setModel(e.target.value)} />
                </label>
                <label className={labelClass}>
                    Size (optional)
                    <input type="text" className={inputClass} value={size} maxLength={40} onChange={(e) => setSize(e.target.value)} />
                </label>
            </div>

            {showReminder && (
                <label className={labelClass}>
                    Reminder
                    <div className="relative">
                        <select
                            className={`${inputClass} cursor-pointer appearance-none pr-10`}
                            value={intervalMonths ?? ''}
                            onChange={(e) => setIntervalMonths(e.target.value ? Number(e.target.value) : undefined)}
                        >
                            <option value="">Off</option>
                            {intervalChoices.map(months => (
                                <option key={months} value={months}>{getIntervalText(months)}</option>
                            ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink" />
                    </div>
                </label>
            )}

            <div className="flex justify-end gap-2">
                <button className={cancelButtonClass} onClick={onCancel}>Cancel</button>
                <button className={saveButtonClass} onClick={handleSave}>Save</button>
            </div>
        </div>
    )
}
