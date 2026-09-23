import type { HomeCareItem } from "./useHomeCareData"
import { Trash2, Pencil } from "lucide-react"
import { formatDate } from "../../lib/dates"
import { useState } from "react"

type HistoryModalProps = {
    item: HomeCareItem
    onClose: () => void
    onDelete: (date: string) => void
    onAdd: (date: string) => void
}

export function HistoryModal({ item, onClose, onDelete, onAdd }: HistoryModalProps) {


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
        onAdd(newDate)
        setNewDate('')
        setError('')
        setAdding(false)
    }

    return (
        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <div className="w-[480px] rounded-3xl bg-card p-6 text-ink">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-extrabold">{item.name} History</h3>
                    <button className="cursor-pointer" onClick={onClose}>✕</button>
                </div>

                <div className="mt-4 max-h-[320px] overflow-y-auto">
                    {[...item.history].sort().reverse().map((date) => (
                        <div key={date} className="flex items-center justify-between py-1 border-b border-muted/20">
                            <span className="text-sm">{formatDate(date)}</span>

                            <div className="flex items-center gap-2">
                                <button
                                    className="cursor-pointer text-muted"
                                    onClick={() => console.log("Edit", date)}
                                >
                                    <Pencil size={18} />
                                </button>
                                <button
                                    className="cursor-pointer text-red-600"
                                    onClick={() => onDelete(date)}
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
                {adding ? (
                    <div className="mt-4 flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <input
                                type="date"
                                className="flex-1 rounded-xl border border-muted/40 px-3 py-2"
                                value={newDate}
                                onChange={(e) => {
                                    setNewDate(e.target.value)
                                    setError('')
                                }}
                            />
                            <button className="cursor-pointer rounded-xl bg-primary px-4 py-2 font-bold text-white" onClick={handleSave}>Save</button>
                            <button className="cursor-pointer px-2 text-muted" onClick={() => setAdding(false)}>Cancel</button>
                        </div>
                        {error && <p className="text-sm text-red-600">{error}</p>}
                    </div>
                ) : (
                    <button
                        className="mt-4 h-[42px] w-full cursor-pointer rounded-xl border-2 border-dashed border-muted/40 font-bold"
                        onClick={() => setAdding(true)}
                    >
                        + Add Entry
                    </button>
                )}
            </div>
        </div>
    )
}