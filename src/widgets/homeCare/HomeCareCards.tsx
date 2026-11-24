import { formatDate } from '../../lib/dates'
import { useHomeCare } from './HomeCareContext'
import { HomeCareIcon } from './HomeCareIcon'
import { getDueDate, getLastChanged } from './reminders'
import { ScrollArea } from '../../components/ScrollArea'

// The Home Care widget's item cards: what's due, and the one button used day to day.
// Everything else (adding, editing, deleting items, and their history) is in
// Settings → Widgets → Home Care → Home Care items.
export function HomeCareCards() {
  const { items, logToday, error } = useHomeCare()

  return (
    <ScrollArea className="flex flex-col gap-3 flex-1 min-h-0">
      {!error && items.length === 0 && (
        <p className="py-3 text-sm text-muted">No items yet. Add them in Settings, under Widgets, Home Care items.</p>
      )}

      {items.map((item) => {
        const lastChanged = getLastChanged(item)
        const dueDate = getDueDate(item)

        return (
          <div key={item.id} className="flex flex-col gap-2 rounded-2xl bg-card p-4 text-ink shadow-sm">
            <div className="flex items-center gap-2">
              <HomeCareIcon icon={item.icon} size={20} />
              <span className="text-lg font-extrabold">{item.name}</span>
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
    </ScrollArea>
  )
}
