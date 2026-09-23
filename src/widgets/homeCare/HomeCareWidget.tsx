import { useHomeCareData } from './useHomeCareData'
import { AirVent, Droplet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

const icons: Record<string, LucideIcon> = {
  'air-vent': AirVent,
  'droplet': Droplet,
}

function HomeCareWidget() {
  const { items }  = useHomeCareData()

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => {
        const Icon = icons[item.icon]
        const lastChanged = item.history[item.history.length - 1]

        return (
          <div key={item.id} className="flex items-center gap-2">
            <Icon />
            <span>{item.name}</span>
            <span>{lastChanged}</span>
            {item.model && <span>{item.model}</span>}
            {item.size && <span>{item.size}</span>}
          </div>
        )
      })}
    </div>
  )
}

export default HomeCareWidget