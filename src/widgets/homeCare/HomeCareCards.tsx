import { formatDate } from '../../lib/dates'
import { useHomeCare } from './HomeCareContext'
import { HistoryModal } from './HistoryModal'
import { homeCareIcons } from './icons'
import { getDueDate, getLastChanged } from './reminders'

type HomeCareCardsProps = {
  onOpenHistory: (itemId: string) => void
}

// The item cards, shared by the Home Care widget and the Home Care pop-up
export function HomeCareCards({ onOpenHistory }: HomeCareCardsProps) {
  const { items, logToday } = useHomeCare()

  return (
    <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto">
      {items.map((item) => {
        const Icon = homeCareIcons[item.icon]
        const lastChanged = getLastChanged(item)
        const dueDate = getDueDate(item)

        return (
          <div key={item.id} className="flex flex-col gap-2 rounded-2xl p-4 shadow-sm text-ink bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Icon size={20} />
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
    </div>
  )
}

type HomeCareHistoryProps = {
  itemId: string
  onClose: () => void
}

// HistoryModal wired to the shared Home Care data, so callers only pass which item
export function HomeCareHistory({ itemId, onClose }: HomeCareHistoryProps) {
  const { items, deleteHistoryEntry, addHistoryEntry, editHistoryEntry, setIntervalMonths } = useHomeCare()
  const item = items.find((i) => i.id === itemId)
  if (!item) return null

  return (
    <HistoryModal
      item={item}
      onClose={onClose}
      onDelete={(date) => deleteHistoryEntry(item.id, date)}
      onAdd={(date) => addHistoryEntry(item.id, date)}
      onEdit={(oldDate, newDate) => editHistoryEntry(item.id, oldDate, newDate)}
      onIntervalChange={(months) => setIntervalMonths(item.id, months)}
    />
  )
}
