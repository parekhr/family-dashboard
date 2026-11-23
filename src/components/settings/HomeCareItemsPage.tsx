import { useState } from 'react'
import { ArrowLeft, ChevronRight, Pencil, Trash2, X } from 'lucide-react'
import { useHomeCare } from '../../widgets/homeCare/HomeCareContext'
import { HomeCareIcon } from '../../widgets/homeCare/HomeCareIcon'
import { ItemDetailsForm } from '../../widgets/homeCare/ItemDetailsForm'
import { ItemHistory } from '../../widgets/homeCare/ItemHistory'
import { getIntervalText } from '../../widgets/homeCare/reminders'
import { addButtonClass, iconButtonClass } from './shared'

type HomeCareItemsPageProps = {
    onBack: () => void
    onClose: () => void
}

const closeButtonClass = 'flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted/15 text-lg hover:bg-muted/25 active:bg-muted/35 transition-colors'

// Settings → Widgets → Home Care → Home Care items: the one place Home Care is managed,
// whether the widget is on or off. Add, edit (name / icon / model / size / reminder) and
// delete items, and tap an item to see or fix its history. The widget is only for using
// items ("I changed this today"), and the bell only for reminders.
export function HomeCareItemsPage({ onBack, onClose }: HomeCareItemsPageProps) {
    const { items, error, addItem, updateItem, setIntervalMonths, deleteItem, addHistoryEntry, editHistoryEntry, deleteHistoryEntry } = useHomeCare()

    // what's open: the list, the add form, or one item's edit form
    const [editing, setEditing] = useState<'new' | string | null>(null)
    const [confirmingId, setConfirmingId] = useState<string | null>(null)
    const [historyId, setHistoryId] = useState<string | null>(null)   // whose history is open

    const editingItem = editing && editing !== 'new' ? items.find(item => item.id === editing) : undefined
    const formOpen = editing === 'new' || editingItem !== undefined
    const historyItem = historyId ? items.find(item => item.id === historyId) : undefined

    const header = (
        <div className="flex items-center gap-2">
            <button className={closeButtonClass} aria-label="Back" onClick={formOpen ? () => setEditing(null) : historyItem ? () => setHistoryId(null) : onBack}>
                <ArrowLeft size={20} />
            </button>
            <h3 className="min-w-0 flex-1 truncate text-xl font-extrabold">
                {editing === 'new' ? 'Add item' : editingItem ? `Edit ${editingItem.name}` : historyItem ? historyItem.name : 'Home Care items'}
            </h3>
            <button className={closeButtonClass} aria-label="Close" onClick={onClose}>✕</button>
        </div>
    )

    // The form takes over the page (like editing an event), so it has room on the tablet
    if (formOpen) {
        return (
            <>
                {header}
                <div className="mt-4 h-[452px] overflow-y-auto pr-1">
                    <ItemDetailsForm
                        key={editing}
                        initial={editingItem}
                        otherNames={items.filter(item => item.id !== editingItem?.id).map(item => item.name)}
                        showReminder
                        onSave={(details) => {
                            if (editingItem) {
                                updateItem(editingItem.id, details)
                                if (details.intervalMonths !== editingItem.intervalMonths) {
                                    setIntervalMonths(editingItem.id, details.intervalMonths ?? null)
                                }
                            } else {
                                addItem(details)
                            }
                            setEditing(null)
                        }}
                        onCancel={() => setEditing(null)}
                    />
                </div>
            </>
        )
    }

    // An item's history takes over the page the same way; back returns to the list
    if (historyItem) {
        return (
            <>
                {header}
                <div className="mt-4 h-[452px] overflow-y-auto pr-1">
                    <ItemHistory
                        item={historyItem}
                        onAdd={(date) => addHistoryEntry(historyItem.id, date)}
                        onEdit={(oldDate, newDate) => editHistoryEntry(historyItem.id, oldDate, newDate)}
                        onDelete={(date) => deleteHistoryEntry(historyItem.id, date)}
                    />
                </div>
            </>
        )
    }

    return (
        <>
            {header}
            {/* same height as the Settings tabs this page replaces */}
            <div className="mt-4 h-[452px] overflow-y-auto pr-1">
                {error && <p className="py-3 text-sm text-muted">Couldn't load Home Care.</p>}
                {!error && items.length === 0 && <p className="py-3 text-sm text-muted">No items yet</p>}

                {items.map(item => {
                    // Same confirm swap as the other deletes: the question replaces the name,
                    // and cancel sits where the trash was, so a double tap can't delete
                    if (confirmingId === item.id) {
                        return (
                            <div key={item.id} className="flex items-center gap-2 border-b border-muted/20 py-2">
                                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                                    <span className="truncate font-semibold text-red-600">Delete {item.name}?</span>
                                    <span className="truncate text-sm text-muted">Its history is deleted too</span>
                                </div>
                                <button
                                    className={`${iconButtonClass} border-none bg-red-600 text-white`}
                                    aria-label={`Delete ${item.name}`}
                                    onClick={() => { deleteItem(item.id); setConfirmingId(null) }}
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button className={`${iconButtonClass} text-muted`} aria-label="Cancel" onClick={() => setConfirmingId(null)}>
                                    <X size={18} />
                                </button>
                            </div>
                        )
                    }

                    return (
                        <div key={item.id} className="flex items-center gap-2 border-b border-muted/20 py-2">
                            {/* tapping the item opens its history */}
                            <button
                                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-xl py-1 pl-1 text-left hover:bg-muted/10"
                                onClick={() => { setConfirmingId(null); setHistoryId(item.id) }}
                            >
                                <HomeCareIcon icon={item.icon} size={20} className="shrink-0" />
                                <span className="ml-1 flex min-w-0 flex-1 flex-col leading-tight">
                                    <span className="truncate text-base font-semibold">{item.name}</span>
                                    <span className="truncate text-sm text-muted">
                                        {item.intervalMonths ? getIntervalText(item.intervalMonths) : 'No reminder'}
                                    </span>
                                </span>
                                <span className="flex shrink-0 items-center text-sm font-bold text-primary">
                                    History
                                    <ChevronRight size={16} />
                                </span>
                            </button>
                            <button className={`${iconButtonClass} text-muted hover:bg-muted/10`} aria-label={`Edit ${item.name}`} onClick={() => { setConfirmingId(null); setEditing(item.id) }}>
                                <Pencil size={18} />
                            </button>
                            <button className={`${iconButtonClass} text-red-600 hover:bg-red-100`} aria-label={`Delete ${item.name}`} onClick={() => setConfirmingId(item.id)}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )
                })}

                <button className={addButtonClass} onClick={() => { setConfirmingId(null); setEditing('new') }}>
                    + Add Item
                </button>
            </div>
        </>
    )
}
