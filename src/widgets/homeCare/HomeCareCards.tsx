import { formatDate } from '../../lib/dates'
import { useHomeCare } from './HomeCareContext'
import { HistoryModal } from './HistoryModal'
import { HomeCareIcon } from './HomeCareIcon'
import { getDueDate, getLastChanged } from './reminders'
import { Modal } from '../../components/Modal'
import { ItemDetailsForm } from './ItemDetailsForm'

type HomeCareCardsProps = {
  onOpenHistory: (itemId: string) => void
  onAddItem: () => void
  inModal?: boolean   // drawn inside a pop-up rather than on the dashboard
}

// The item cards, shared by the Home Care widget and the Home Care pop-up
export function HomeCareCards({ onOpenHistory, onAddItem, inModal = false }: HomeCareCardsProps) {
  const { items, logToday } = useHomeCare()

  // On the dashboard a cream card stands out against the page. Inside the cream pop-up it
  // would vanish, so there each item gets the soft grey card the event cards use in modals.
  const cardClass = inModal ? 'bg-muted/10' : 'bg-card shadow-sm'

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto">
      {items.map((item) => {
        const lastChanged = getLastChanged(item)
        const dueDate = getDueDate(item)

        return (
          <div key={item.id} className={`flex flex-col gap-2 rounded-2xl p-4 text-ink ${cardClass}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HomeCareIcon icon={item.icon} size={20} />
                <span className="text-lg font-extrabold">{item.name}</span>
              </div>
              <button
                className="cursor-pointer text-sm font-bold text-primary"
                onClick={() => onOpenHistory(item.id)}
              >
                History ›
              </button>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xs font-semibold text-muted">Last changed:</span>
              <span className="text-[15px] font-bold">
                {lastChanged ? formatDate(lastChanged) : 'Never'}
              </span>
            </div>

            {dueDate && (
              <div className="flex items-baseline gap-2">
                <span className="text-xs font-semibold text-muted">Next due:</span>
                <span className="text-[15px] font-bold">{formatDate(dueDate)}</span>
              </div>
            )}

            {item.model && <span className="text-xs text-muted">Model: {item.model}</span>}
            {item.size && <span className="text-xs text-muted">Size: {item.size}</span>}

            <button
              className="h-[42px] w-full rounded-xl font-bold text-white bg-primary hover:bg-primary-hover active:bg-primary-hover cursor-pointer"
              onClick={() => logToday(item.id)}
            >
              I changed this today
            </button>
          </div>
        )
      })}

      <button
        className="h-[52px] w-full shrink-0 cursor-pointer rounded-full border-2 border-dashed border-muted/40 font-bold text-ink"
        onClick={onAddItem}
      >
        + Add Item
      </button>
    </div>
  )
}

type HomeCareHistoryProps = {
  itemId: string
  onClose: () => void
}

// HistoryModal wired to the shared Home Care data, so callers only pass which item
export function HomeCareHistory({ itemId, onClose }: HomeCareHistoryProps) {
  const { items, deleteHistoryEntry, addHistoryEntry, editHistoryEntry, setIntervalMonths, updateItem, deleteItem } = useHomeCare()
  const item = items.find((i) => i.id === itemId)
  if (!item) return null

  return (
    <HistoryModal
      item={item}
      otherNames={items.filter((i) => i.id !== item.id).map((i) => i.name)}
      onClose={onClose}
      onDelete={(date) => deleteHistoryEntry(item.id, date)}
      onAdd={(date) => addHistoryEntry(item.id, date)}
      onEdit={(oldDate, newDate) => editHistoryEntry(item.id, oldDate, newDate)}
      onIntervalChange={(months) => setIntervalMonths(item.id, months)}
      onUpdateDetails={(details) => updateItem(item.id, details)}
      onDeleteItem={() => { deleteItem(item.id); onClose() }}   // the page closes with the item
    />
  )
}

type AddItemModalProps = {
  onClose: () => void
}

// "+ Add Item": the same form as editing, plus the reminder (defaults to every 6 months)
export function AddItemModal({ onClose }: AddItemModalProps) {
  const { items, addItem } = useHomeCare()

  return (
    <Modal onClose={onClose} className="w-[480px]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-xl font-extrabold">Add Item</h3>
        <button
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-muted/15 text-lg hover:bg-muted/25 active:bg-muted/35 transition-colors"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      <ItemDetailsForm
        otherNames={items.map((i) => i.name)}
        showReminder
        onSave={(details) => { addItem(details); onClose() }}
        onCancel={onClose}
      />
    </Modal>
  )
}
