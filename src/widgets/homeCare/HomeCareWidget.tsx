import { useState } from 'react'
import { useHomeCare } from './HomeCareContext'
import { AddItemModal, HomeCareCards, HomeCareHistory } from './HomeCareCards'

// Which pop-up is open over the cards: nothing, one item's page, or Add Item
export type HomeCareView = null | { historyItemId: string } | 'add'

// Home Care as a dashboard widget. Households that leave it out of widget_layout
// get the same cards in a pop-up from the header's reminders bell instead.
export function HomeCareWidget() {
  const { error } = useHomeCare()
  const [view, setView] = useState<HomeCareView>(null)

  return (
    <div className="flex flex-col flex-1 min-h-0 gap-3">
      <h2 className="text-[22px] font-extrabold text-ink">Home Care</h2>
      {error && <p className="text-sm text-muted">Couldn't load Home Care.</p>}
      <HomeCareCards
        onOpenHistory={(historyItemId) => setView({ historyItemId })}
        onAddItem={() => setView('add')}
      />

      {view === 'add' && <AddItemModal onClose={() => setView(null)} />}
      {view && view !== 'add' && (
        <HomeCareHistory itemId={view.historyItemId} onClose={() => setView(null)} />
      )}
    </div>
  )
}
