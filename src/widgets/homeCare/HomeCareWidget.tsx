import { useState } from 'react'
import { useHomeCare } from './HomeCareContext'
import { HomeCareCards, HomeCareHistory } from './HomeCareCards'

// Home Care as a dashboard widget. Households that leave it out of widget_layout
// get the same cards in a pop-up from the header's reminders bell instead.
export function HomeCareWidget() {
  const { error } = useHomeCare()
  const [historyItemId, setHistoryItemId] = useState<string | null>(null)

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">
      <h2 className="text-[22px] font-extrabold text-ink">Home Care</h2>
      {error && <p className="text-sm text-muted">Couldn't load Home Care.</p>}
      <HomeCareCards onOpenHistory={setHistoryItemId} />

      {historyItemId && (
        <HomeCareHistory itemId={historyItemId} onClose={() => setHistoryItemId(null)} />
      )}
    </div>
  )
}
