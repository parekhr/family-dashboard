import { useHomeCareData } from './useHomeCareData'
import { AirVent, Droplet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const icons: Record<string, LucideIcon> = {
  'air-vent': AirVent,
  'droplet': Droplet,
}

function HomeCareWidget() {
  const { items, logToday } = useHomeCareData()

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[22px] font-extrabold text-ink">Home Care</h2>

      {items.map((item) => {
        const Icon = icons[item.icon]
        const lastChanged = item.history[item.history.length - 1]

        return (
          <div key={item.id} className="flex flex-col gap-2 rounded-2xl p-4 shadow-sm text-ink bg-card">
            <div className="flex items-center gap-2">
              <Icon size={20} />
              <span className="text-lg font-extrabold">{item.name}</span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-xs font-semibold text-muted">Last changed:</span>
              <span className="text-[15px] font-bold">{lastChanged}</span>
            </div>

            {item.model && <span className="text-xs text-muted">Model: {item.model}</span>}
            {item.size && <span className="text-xs text-muted">Size: {item.size}</span>}

            <button
              className="h-[42px] w-full rounded-xl font-bold text-white bg-primary hover:bg-primary/80 cursor-pointer"
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

export default HomeCareWidget