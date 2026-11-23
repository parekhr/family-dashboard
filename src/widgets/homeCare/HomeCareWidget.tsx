import { useHomeCare } from './HomeCareContext'
import { HomeCareCards } from './HomeCareCards'

// Home Care on the dashboard, for households that turn it on. It's for using items;
// they're set up in Settings → Widgets → Home Care, and reminders come to the header bell
// whether this widget is on or off.
export function HomeCareWidget() {
  const { error } = useHomeCare()

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">
      <h2 className="text-[22px] font-extrabold text-ink">Home Care</h2>
      {error && <p className="text-sm text-muted">Couldn't load Home Care.</p>}
      <HomeCareCards />
    </div>
  )
}
