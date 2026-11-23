import { useState } from 'react'
import { Modal } from '../../components/Modal'
import { useHomeCare } from './HomeCareContext'
import { AddItemModal, HomeCareCards, HomeCareHistory } from './HomeCareCards'
import type { HomeCareView } from './HomeCareWidget'

type HomeCareModalProps = {
  onClose: () => void
  initialHistoryItemId?: string | null   // open straight to this item's page
}

// The Home Care cards as a pop-up, opened from the reminders bell.
export function HomeCareModal({ onClose, initialHistoryItemId = null }: HomeCareModalProps) {
  const { error } = useHomeCare()
  const [view, setView] = useState<HomeCareView>(initialHistoryItemId ? { historyItemId: initialHistoryItemId } : null)

  // Like the calendar's day modal and edit form: an item's page or Add Item takes this
  // pop-up's place while open (no stacked overlays), and closing it comes back here.
  if (view === 'add') {
    return <AddItemModal onClose={() => setView(null)} />
  }
  if (view) {
    return <HomeCareHistory itemId={view.historyItemId} onClose={() => setView(null)} />
  }

  return (
    <Modal onClose={onClose} className="flex max-h-[calc(100%-2rem)] w-[480px] flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-extrabold">Home Care</h3>
        <button
          className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-muted/15 text-lg hover:bg-muted/25 active:bg-muted/35 transition-colors"
          onClick={onClose}
        >
          ✕
        </button>
      </div>
      {error && <p className="mt-4 text-sm text-muted">Couldn't load Home Care.</p>}
      <div className="mt-4 flex min-h-0 flex-1 flex-col p-1">
        <HomeCareCards
          onOpenHistory={(historyItemId) => setView({ historyItemId })}
          onAddItem={() => setView('add')}
          inModal
        />
      </div>
    </Modal>
  )
}
