import type { HomeCareItem } from "./useHomeCareData"
import { Trash2, Pencil } from "lucide-react"
import { formatDate, getTodayISO } from "../../lib/dates"
import { useState } from "react"

type HistoryModalProps = {
    item: HomeCareItem
    onClose: () => void
    onDelete: (date: string) => void
    onAdd: (date: string) => void
    onEdit: (oldDate: string, newDate: string) => void
}

export function HistoryModal({ item, onClose, onDelete, onAdd, onEdit }: HistoryModalProps) {


    const [editingDate, setEditingDate] = useState<string | null>(null)   // which row is being edited (null = none)
    const [editValue, setEditValue] = useState('')                       // the date typed in the edit field
    const [editError, setEditError] = useState('')                       // the red message for the edit field
    const [adding, setAdding] = useState(false)   // is the date field showing?
    const [newDate, setNewDate] = useState('')    // what's typed in the field
    const [error, setError] = useState('')        // the red message ('' means none)

    function handleSave() {
        if (!newDate) {
            setError('Pick a date')
            return
        }
        if (item.history.includes(newDate)) {
            setError('That date is already logged')
            return
        }

        if (newDate > getTodayISO()) {
            setError("Date can't be in the future")
            return
        }
        onAdd(newDate)
        setNewDate('')
        setError('')
        setAdding(false)
    }

    function startEditing(date: string) {
        setAdding(false)   // only one form open at a time: close the add form
        setNewDate('')
        setError('')
        setEditingDate(date)
        setEditValue(date)
        setEditError('')
    }

    function cancelEditing() {
        setEditingDate(null)
        setEditValue('')
        setEditError('')
    }

    function handleEditSave(oldDate: string) {
        if (!editValue) {
            setEditError('Pick a date')
            return
        }
        if (editValue === oldDate) {
            cancelEditing()   // nothing changed, just close
            return
        }
        if (item.history.includes(editValue)) {
            setEditError('That date is already logged')
            return
        }
        if (editValue > getTodayISO()) {
            setEditError("Date can't be in the future")
            return
        }
        onEdit(oldDate, editValue)
        cancelEditing()
    }

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="w-[480px] rounded-3xl bg-card p-6 text-ink">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-extrabold">{item.name} History</h3>
                    <button
                        className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-muted/15 text-lg"
                        onClick={onClose}
                    >
                        ✕
                    </button>
                </div>

                <div className="mt-4 max-h-[320px] overflow-y-auto">
                    {item.history.length === 0 && <p className="py-3 text-sm text-muted">No entries yet</p>}
                    {[...item.history].sort().reverse().map((date) => (
                        <div key={date} className="flex items-center justify-between py-2 border-b border-muted/20">
                            {editingDate === date ? (
                                <div className="flex w-full flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="date"
                                            max={getTodayISO()}
                                            className="h-11 flex-1 rounded-xl border border-muted/40 px-3"
                                            value={editValue}
                                            onChange={(e) => {
                                                setEditValue(e.target.value)
                                                setEditError('')
                                            }}
                                        />
                                        <button
                                            className="h-11 cursor-pointer rounded-xl bg-primary px-4 font-bold text-white"
                                            onClick={() => handleEditSave(date)}
                                        >
                                            Save
                                        </button>
                                        <button
                                            className="h-11 cursor-pointer px-3 text-muted"
                                            onClick={cancelEditing}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                    {editError && <p className="text-sm text-red-600">{editError}</p>}
                                </div>
                            ) : (
                                <>
                                    <span className="text-base font-semibold">{formatDate(date)}</span>

                                    <div className="flex items-center gap-2">
                                        <button
                                            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-muted/30 text-muted"
                                            onClick={() => startEditing(date)}
                                        >
                                            <Pencil size={18} />
                                        </button>
                                        <button
                                            className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-muted/30 text-red-600"
                                            onClick={() => onDelete(date)}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
                {adding ? (
                    <div className="mt-4 flex min-h-[52px] flex-col justify-center gap-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                max={getTodayISO()}
                                className="h-11 flex-1 rounded-xl border border-muted/40 px-3"
                                value={newDate}
                                onChange={(e) => {
                                    setNewDate(e.target.value)
                                    setError('')
                                }}
                            />
                            <button className="h-11 cursor-pointer rounded-xl bg-primary px-4 font-bold text-white" onClick={handleSave}>Save</button>
                            <button className="h-11 cursor-pointer px-3 text-muted" onClick={() => { setAdding(false); setNewDate(''); setError(''); }}>Cancel</button>
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                    </div>
                ) : (
                    <button
                        className="mt-4 h-[52px] w-full cursor-pointer rounded-full border-2 border-dashed border-muted/40 font-bold"
                        onClick={() => {
                            cancelEditing()   // only one form open at a time: close any row edit
                            setAdding(true)
                        }}
                    >
                        + Add Entry
                    </button>
                )}
            </div>
        </div>
    )
}