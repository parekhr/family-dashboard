import { useState } from 'react'
import { Modal } from '../../components/Modal'
import { useHomeCare } from './HomeCareContext'
import { HomeCareCards, HomeCareHistory } from './HomeCareCards'

type HomeCareModalProps = {
  onClose: () => void
  initialHistoryItemId?: string | null   // open straight to this item's History
}

// The Home Care cards as a pop-up, opened from the reminders bell.
export function HomeCareModal({ onClose, initialHistoryItemId = null }: HomeCareModalProps) {
  const { error } = useHomeCare()
  const [historyItemId, setHistoryItemId] = useState(initialHistoryItemId)

  // Like the calendar's day modal and edit form: History takes this pop-up's place
  // while it's open (no stacked overlays), and closing History comes back here.
  if (historyItemId) {
    return <HomeCareHistory itemId={historyItemId} onClose={() => setHistoryItemId(null)} />
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
        <HomeCareCards onOpenHistory={setHistoryItemId} />
      </div>
    </Modal>
  )
}
