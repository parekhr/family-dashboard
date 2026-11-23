import { useState } from 'react'
import { Bell, Check, Clock, X } from 'lucide-react'
import { addDaysISO, formatShortDate, getTodayISO } from '../../lib/dates'
import { useHomeCare } from './HomeCareContext'
import { HomeCareModal } from './HomeCareModal'
import { HomeCareIcon } from './HomeCareIcon'
import { SNOOZE_DAYS, getDueDate, getIntervalText, getLastChanged, getReminder, getReminderText, isSnoozed } from './reminders'
import type { Reminder } from './reminders'
import type { HomeCareItem } from './useHomeCareData'

// One line for an item with nothing due, so dates are visible without opening Home Care
function getQuietText(item: HomeCareItem, todayISO: string): string {
    if (!item.intervalMonths) return 'No reminder set'
    if (isSnoozed(item, todayISO) && item.snoozedUntil) return `Snoozed until ${formatShortDate(item.snoozedUntil)}`
    const dueDate = getDueDate(item)
    return dueDate ? `Due ${formatShortDate(dueDate)}` : 'Never logged'
}

// Header bell: always there (it's also the way into Home Care when the widget isn't
// on screen), with a red count when something is due. Tapping it opens the reminders panel.
export function RemindersBell() {
    const { items, error, logToday, snooze } = useHomeCare()
    const [panelOpen, setPanelOpen] = useState(false)
    const [homeCareOpen, setHomeCareOpen] = useState<{ historyItemId: string | null } | null>(null)

    // worked out on every draw; the header redraws each minute (useNow), so reminders roll over at midnight
    const todayISO = getTodayISO()
    const reminders = items
        .map(item => getReminder(item, todayISO))
        .filter((reminder): reminder is Reminder => reminder !== null)
        .sort((a, b) => a.daysLeft - b.daysLeft)   // most overdue first
    const quietItems = items.filter(item => !reminders.some(reminder => reminder.item.id === item.id))

    function openHomeCare(historyItemId: string | null) {
        setPanelOpen(false)
        setHomeCareOpen({ historyItemId })
    }

    return (
        <div className="relative">
            <button
                className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full hover:bg-muted/10 active:bg-muted/15 transition-colors"
                aria-label="Reminders"
                onClick={() => setPanelOpen(open => !open)}
            >
                {/* the bell's drawing is top-heavy, so centered it looks high next to the gear: nudge it down */}
                <Bell className="translate-y-0.5" />
                {reminders.length > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                        {reminders.length}
                    </span>
                )}
            </button>

            {panelOpen && (
                <>
                    {/* invisible layer behind the panel: tapping anywhere else closes it */}
                    <div className="fixed inset-0 z-40" onClick={() => setPanelOpen(false)} />

                    <div className="absolute right-0 top-full z-50 mt-2 w-[360px] rounded-3xl bg-card p-4 text-ink shadow-lg">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-extrabold">Reminders</h3>
                            <button
                                className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-muted/15 hover:bg-muted/25 active:bg-muted/35 transition-colors"
                                aria-label="Close"
                                onClick={() => setPanelOpen(false)}
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {error && <p className="py-2 text-sm text-muted">Couldn't load Home Care.</p>}

                        {reminders.map((reminder) => {
                            const { item } = reminder
                            const lastChanged = getLastChanged(item)

                            return (
                                <div key={item.id} className="mt-3 rounded-2xl bg-muted/10 p-3">
                                    {/* tapping the name goes straight to this item's History */}
                                    <button
                                        className="flex w-full cursor-pointer items-center gap-2 text-left"
                                        onClick={() => openHomeCare(item.id)}
                                    >
                                        <HomeCareIcon icon={item.icon} size={20} className="shrink-0" />
                                        <span className="flex-1 font-bold">{item.name}</span>
                                        <span className={`text-sm font-semibold ${reminder.daysLeft < 0 ? 'text-red-600' : 'text-primary'}`}>
                                            {getReminderText(reminder)}
                                        </span>
                                    </button>
                                    <div className="ml-7 flex flex-col text-xs text-muted">
                                        {lastChanged && <span>Last changed {formatShortDate(lastChanged)}</span>}
                                        {item.intervalMonths && <span>{getIntervalText(item.intervalMonths)}</span>}
                                    </div>
                                    <div className="ml-7 mt-2 flex gap-2">
                                        <button
                                            className="flex h-11 cursor-pointer items-center gap-1.5 rounded-full bg-primary px-4 font-semibold text-white hover:bg-primary-hover active:bg-primary-hover"
                                            onClick={() => logToday(item.id)}
                                        >
                                            <Check size={16} />
                                            Done
                                        </button>
                                        <button
                                            className="flex h-11 cursor-pointer items-center gap-1.5 rounded-full border border-muted/30 px-4 font-semibold hover:bg-muted/10"
                                            onClick={() => snooze(item.id, addDaysISO(todayISO, SNOOZE_DAYS))}
                                        >
                                            <Clock size={16} />
                                            Snooze 1 week
                                        </button>
                                    </div>
                                </div>
                            )
                        })}

                        {/* Items with nothing due: one row each, name left and status right.
                            No "Nothing due" message: an empty badge already says that. */}
                        {quietItems.length > 0 && (
                            <div className="mt-3 flex flex-col gap-2">
                                <span className="text-xs font-bold uppercase tracking-wide text-muted">Upcoming</span>
                                {quietItems.map(item => {
                                    return (
                                        <div
                                            key={item.id}
                                            className={`flex h-11 items-center gap-2 rounded-xl bg-muted/10 px-3 ${item.intervalMonths ? '' : 'text-muted'}`}
                                        >
                                            <HomeCareIcon icon={item.icon} size={18} className="shrink-0" />
                                            <span className="flex-1 truncate font-semibold">{item.name}</span>
                                            <span className="shrink-0 text-sm text-muted">{getQuietText(item, todayISO)}</span>
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        <button
                            className="mt-3 w-full cursor-pointer border-t border-muted/20 pt-3 text-left text-sm font-bold text-primary"
                            onClick={() => openHomeCare(null)}
                        >
                            Open Home Care ›
                        </button>
                    </div>
                </>
            )}

            {homeCareOpen && (
                <HomeCareModal
                    initialHistoryItemId={homeCareOpen.historyItemId}
                    onClose={() => setHomeCareOpen(null)}
                />
            )}
        </div>
    )
}
