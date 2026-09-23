import { useHomeCareData } from './useHomeCareData'
import { AirVent, Droplet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { formatDate } from '../../lib/dates'
import { useState } from 'react'
import { HistoryModal } from './HistoryModal'

const icons: Record<string, LucideIcon> = {
  'air-vent': AirVent,
  'droplet': Droplet,
}

function HomeCareWidget() {
  const { items, logToday, deleteHistoryEntry, addHistoryEntry } = useHomeCareData()
  const [historyItemId, setHistoryItemId] = useState<string | null>(null)
  const historyItem = items.find((i) => i.id === historyItemId)

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">
      <h2 className="text-[22px] font-extrabold text-ink">Home Care</h2>

      <div className="flex flex-col gap-3 flex-1 min-h-0 overflow-y-auto">
        {items.map((item) => {
          const Icon = icons[item.icon]
          const lastChanged = [...item.history].sort().at(-1)

          return (
            <div key={item.id} className="flex flex-col gap-2 rounded-2xl p-4 shadow-sm text-ink bg-card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon size={20} />
                  <span className="text-lg font-extrabold">{item.name}</span>
                </div>
                <button
                  className="cursor-pointer text-sm font-bold text-primary"
                  onClick={() => setHistoryItemId(item.id)}
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

      {historyItem && (
        <HistoryModal
          item={historyItem}
          onClose={() => setHistoryItemId(null)}
          onDelete={(date) => deleteHistoryEntry(historyItem.id, date)}
          onAdd={(date) => addHistoryEntry(historyItem.id, date)}
        />
      )}
    </div>
  )
}

export default HomeCareWidget