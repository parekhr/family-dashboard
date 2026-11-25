import { useState } from 'react'
import { ArrowLeft, ChevronRight, Pencil, Trash2, X } from 'lucide-react'
import { useReminders } from './RemindersContext'
import { ReminderIcon } from './ReminderIcon'
import { ReminderForm } from './ReminderForm'
import { ItemHistory } from './ItemHistory'
import { getIntervalText } from './reminders'
import { addButtonClass, confirmDeleteButtonClass, dangerIconButtonClass, iconButtonClass } from '../components/settings/shared'
import { Modal } from '../components/Modal'
import { ScrollArea } from '../components/ScrollArea'
import { closeButtonClass, modalTitleClass } from '../components/styles'

// Every row is this tall, the normal one and its "Delete X?" swap alike, so confirming a
// delete never moves the rows below. Fits the two lines of text with the name button's
// hover padding, and the 44px buttons.
const rowClass = 'flex h-[62px] items-center gap-2 border-b border-muted/20'

type ReminderSetupProps = {
    onClose: () => void
}

// "Set up reminders", opened from the bell: the one place reminders are managed. Add, edit
// (name / how often / icon / model / size / notes) and delete them, and tap one to see or
// fix its history. The bell itself is for using them: Done and Snooze.
export function ReminderSetup({ onClose }: ReminderSetupProps) {
    const { items, error, addItem, updateItem, deleteItem, addHistoryEntry, editHistoryEntry, deleteHistoryEntry } = useReminders()

    // what's open: the list, the add form, or one reminder's edit form
    const [editing, setEditing] = useState<'new' | string | null>(null)
    const [confirmingId, setConfirmingId] = useState<string | null>(null)
    const [historyId, setHistoryId] = useState<string | null>(null)   // whose history is open

    const editingItem = editing && editing !== 'new' ? items.find(item => item.id === editing) : undefined
    const formOpen = editing === 'new' || editingItem !== undefined
    const historyItem = historyId ? items.find(item => item.id === historyId) : undefined

    // A back arrow only inside a form or a history; the list itself just closes
    const header = (
        <div className="flex items-center gap-2">
            {(formOpen || historyItem) && (
                <button className={closeButtonClass} aria-label="Back" onClick={formOpen ? () => setEditing(null) : () => setHistoryId(null)}>
                    <ArrowLeft size={20} />
                </button>
            )}
            <h3 className={`min-w-0 flex-1 truncate ${modalTitleClass}`}>
                {editing === 'new' ? 'Add reminder' : editingItem ? `Edit ${editingItem.name}` : historyItem ? historyItem.name : 'Set up reminders'}
            </h3>
            <button className={closeButtonClass} aria-label="Close" onClick={onClose}>✕</button>
        </div>
    )

    let body
    if (formOpen) {
        // The form takes over the pop-up (like editing an event), so it has room on the tablet
        body = (
            <ReminderForm
                key={editing}
                initial={editingItem}
                otherNames={items.filter(item => item.id !== editingItem?.id).map(item => item.name)}
                onSave={(details) => {
                    if (editingItem) updateItem(editingItem.id, details)
                    else addItem(details)
                    setEditing(null)
                }}
                onCancel={() => setEditing(null)}
            />
        )
    } else if (historyItem) {
        // A reminder's history takes over the same way; back returns to the list
        body = (
            <ItemHistory
                item={historyItem}
                onAdd={(date) => addHistoryEntry(historyItem.id, date)}
                onEdit={(oldDate, newDate) => editHistoryEntry(historyItem.id, oldDate, newDate)}
                onDelete={(date) => deleteHistoryEntry(historyItem.id, date)}
            />
        )
    } else {
        body = (
            <>
                {error && <p className="py-3 text-sm text-muted">Couldn't load reminders.</p>}
                {!error && items.length === 0 && <p className="py-3 text-sm text-muted">No reminders yet</p>}

                {items.map(item => {
                    // Same confirm swap as the other deletes: the question replaces the name,
                    // and cancel sits where the trash was, so a double tap can't delete
                    if (confirmingId === item.id) {
                        return (
                            <div key={item.id} className={rowClass}>
                                <div className="flex min-w-0 flex-1 flex-col leading-tight">
                                    <span className="truncate font-semibold text-red-600">Delete {item.name}?</span>
                                    <span className="truncate text-sm text-muted">Its history is deleted too</span>
                                </div>
                                <button
                                    className={confirmDeleteButtonClass}
                                    aria-label={`Delete ${item.name}`}
                                    onClick={() => { deleteItem(item.id); setConfirmingId(null) }}
                                >
                                    <Trash2 size={18} />
                                </button>
                                <button className={iconButtonClass} aria-label="Cancel" onClick={() => setConfirmingId(null)}>
                                    <X size={18} />
                                </button>
                            </div>
                        )
                    }

                    return (
                        <div key={item.id} className={rowClass}>
                            {/* tapping the reminder opens its history */}
                            <button
                                className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-xl py-1 pl-1 text-left hover:bg-muted/10"
                                onClick={() => { setConfirmingId(null); setHistoryId(item.id) }}
                            >
                                <ReminderIcon icon={item.icon} size={20} className="shrink-0" />
                                <span className="ml-1 flex min-w-0 flex-1 flex-col leading-tight">
                                    <span className="truncate text-base font-semibold">{item.name}</span>
                                    {/* items from before "how often" was required: the pencil sets it */}
                                    <span className={`truncate text-sm ${item.interval ? 'text-muted' : 'font-semibold text-red-600'}`}>
                                        {item.interval ? getIntervalText(item.interval) : 'Set how often'}
                                    </span>
                                </span>
                                <span className="flex shrink-0 items-center text-sm font-bold text-primary">
                                    History
                                    <ChevronRight size={16} />
                                </span>
                            </button>
                            <button className={iconButtonClass} aria-label={`Edit ${item.name}`} onClick={() => { setConfirmingId(null); setEditing(item.id) }}>
                                <Pencil size={18} />
                            </button>
                            <button className={dangerIconButtonClass} aria-label={`Delete ${item.name}`} onClick={() => setConfirmingId(item.id)}>
                                <Trash2 size={18} />
                            </button>
                        </div>
                    )
                })}

                <button className={addButtonClass} onClick={() => { setConfirmingId(null); setEditing('new') }}>
                    + Add Reminder
                </button>
            </>
        )
    }

    return (
        <Modal onClose={onClose} className="flex w-[480px] flex-col">
            {header}
            {/* fixed height, so moving between the list, a form and a history doesn't resize it */}
            <ScrollArea className="mt-4 h-[452px] pr-1">{body}</ScrollArea>
        </Modal>
    )
}
