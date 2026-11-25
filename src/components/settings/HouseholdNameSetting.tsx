import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { MAX_HOUSEHOLD_NAME_LENGTH } from '../../lib/nameFonts'
import { cancelButtonClass, checkName, iconButtonClass, inputClass, saveButtonClass } from './shared'

type HouseholdNameSettingProps = {
    name?: string
    onChange: (name: string) => void
}

// The household's name (shown in the middle of the header), with the same
// pencil-then-Save/Cancel rename as a row in the People tab.
export function HouseholdNameSetting({ name, onChange }: HouseholdNameSettingProps) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState('')
    const [error, setError] = useState('')

    function startEditing() {
        setDraft(name ?? '')
        setError('')
        setEditing(true)
    }

    function handleSave() {
        const problem = checkName(draft, [])   // only one household name, so nothing to clash with
        if (problem) {
            setError(problem)
            return
        }
        onChange(draft.trim())
        setEditing(false)
    }

    return (
        <>
            <div className="text-sm font-semibold text-muted">Household name</div>

            {editing ? (
                <div className="mt-1.5 flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                        <input
                            type="text"
                            className={inputClass}
                            value={draft}
                            maxLength={MAX_HOUSEHOLD_NAME_LENGTH}
                            placeholder="Household name"
                            autoFocus
                            onChange={(e) => { setDraft(e.target.value); setError('') }}
                            onKeyDown={(e) => { if (e.key === 'Enter') handleSave() }}
                        />
                        <button className={saveButtonClass} onClick={handleSave}>Save</button>
                        <button className={cancelButtonClass} onClick={() => setEditing(false)}>Cancel</button>
                    </div>
                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
            ) : (
                <div className="mt-1.5 flex items-center gap-2">
                    <span className={`flex-1 truncate text-base font-semibold ${name ? '' : 'text-muted'}`}>{name || 'No name yet'}</span>
                    <button className={iconButtonClass} aria-label="Rename household" onClick={startEditing}>
                        <Pencil size={18} />
                    </button>
                </div>
            )}
        </>
    )
}
