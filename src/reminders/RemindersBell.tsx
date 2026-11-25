import { useState } from 'react'
import { Bell, Check, ChevronRight, Clock, X } from 'lucide-react'
import { addDaysISO, formatShortDateWithYear, getTodayISO } from '../lib/dates'
import { useReminders } from './RemindersContext'
import { ReminderIcon } from './ReminderIcon'
import { ReminderSetup } from './ReminderSetup'
import { getDueDate, getDueReminder, getDueText, getIntervalText, getLastDone, getSnoozeDays, getSnoozeText, isSnoozed } from './reminders'
import type { DueReminder } from './reminders'
import type { ReminderItem } from './useRemindersData'
import { ScrollArea } from '../components/ScrollArea'
import { modalFontClass, raisedNeutralClass, raisedPrimaryClass, raisedTintClass, smallCloseButtonClass, smallTitleClass } from '../components/styles'

// One line for a reminder with nothing due, so dates are visible without opening setup
function getQuietText(item: ReminderItem, todayISO: string): string {
    if (!item.interval) return 'Set how often'
    if (isSnoozed(item, todayISO) && item.snoozedUntil) return `Snoozed until ${formatShortDateWithYear(item.snoozedUntil)}`
    const dueDate = getDueDate(item)
    return dueDate ? `Due ${formatShortDateWithYear(dueDate)}` : 'Never done'
}

// The header bell: all of Reminders. A red count when something is due; tapping opens the
// panel, where any reminder can be marked Done (early too: the next one then counts from
// today) and a due one snoozed. "Set up reminders" at the bottom opens the setup pop-up.
export function RemindersBell() {
    const { items, error, logToday, snooze } = useReminders()
    const [panelOpen, setPanelOpen] = useState(false)
    const [setupOpen, setSetupOpen] = useState(false)

    // worked out on every draw; the header redraws each minute (useNow), so reminders roll over at midnight
    const todayISO = getTodayISO()
    const due = items
        .map(item => getDueReminder(item, todayISO))
        .filter((reminder): reminder is DueReminder => reminder !== null)
        .sort((a, b) => a.daysLeft - b.daysLeft)   // most overdue first
    // the rest, soonest first; ones without a "how often" last
    const upcoming = items
        .filter(item => !due.some(reminder => reminder.item.id === item.id))
        .sort((a, b) => (getDueDate(a) ?? '9999').localeCompare(getDueDate(b) ?? '9999'))

    return (
        <div className="relative">
            <button
                className="relative flex h-11 w-11 cursor-pointer items-center justify-center rounded-full hover:bg-muted/10 active:bg-muted/15 transition-colors"
                aria-label="Reminders"
                onClick={() => setPanelOpen(open => !open)}
            >
                {/* the bell's drawing is top-heavy, so centered it looks high next to the gear: nudge it down */}
                <Bell className="translate-y-0.5" />
                {due.length > 0 && (
                    <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-bold text-white">
                        {due.length}
                    </span>
                )}
            </button>

            {panelOpen && (
                <>
                    {/* invisible layer behind the panel: tapping anywhere else closes it */}
                    <div className="fixed inset-0 z-40" onClick={() => setPanelOpen(false)} />

                    <div className={`absolute right-0 top-full z-50 mt-2 flex w-[380px] flex-col rounded-3xl bg-card p-4 text-ink shadow-lg ${modalFontClass}`}>
                        <div className="flex items-center justify-between">
                            <h3 className={smallTitleClass}>Reminders</h3>
                            <button className={smallCloseButtonClass} aria-label="Close" onClick={() => setPanelOpen(false)}>
                                <X size={16} />
                            </button>
                        </div>

                        {/* scrolls once there are more reminders than fit under the header */}
                        <ScrollArea className="max-h-[560px] pr-1">
                            {error && <p className="py-2 text-sm text-muted">Couldn't load reminders.</p>}
                            {!error && items.length === 0 && <p className="py-2 text-sm text-muted">No reminders yet</p>}

                            {due.map((reminder) => {
                                const { item } = reminder
                                const lastDone = getLastDone(item)
                                const snoozeDays = getSnoozeDays(item)

                                return (
                                    <div key={item.id} className="mt-3 rounded-2xl bg-muted/10 p-3">
                                        <div className="flex w-full items-center gap-2">
                                            <ReminderIcon icon={item.icon} size={20} className="shrink-0" />
                                            <span className="flex-1 font-semibold">{item.name}</span>
                                            <span className={`text-sm font-semibold ${reminder.daysLeft < 0 ? 'text-red-600' : 'text-primary'}`}>
                                                {getDueText(reminder)}
                                            </span>
                                        </div>
                                        <div className="ml-7 flex flex-col text-xs text-muted">
                                            {lastDone && <span>Last done {formatShortDateWithYear(lastDone)}</span>}
                                            {item.interval && <span>{getIntervalText(item.interval)}</span>}
                                        </div>
                                        <div className="ml-7 mt-2 flex gap-2">
                                            <button
                                                className={`flex h-11 items-center gap-1.5 rounded-control px-4 ${raisedPrimaryClass}`}
                                                onClick={() => logToday(item.id)}
                                            >
                                                <Check size={16} />
                                                Done
                                            </button>
                                            <button
                                                className={`flex h-11 items-center gap-1.5 rounded-control px-4 ${raisedNeutralClass}`}
                                                onClick={() => snooze(item.id, addDaysISO(todayISO, snoozeDays))}
                                            >
                                                <Clock size={16} />
                                                {getSnoozeText(snoozeDays)}
                                            </button>
                                        </div>
                                    </div>
                                )
                            })}

                            {/* Not due yet: one row each, with a Done for doing it early.
                                No "Nothing due" message: an empty badge already says that. */}
                            {upcoming.length > 0 && (
                                <div className="mt-3 flex flex-col gap-2">
                                    <span className="text-xs font-semibold uppercase tracking-wide text-muted">Upcoming</span>
                                    {upcoming.map(item => {
                                        const doneToday = item.history.includes(todayISO)
                                        return (
                                            <div
                                                key={item.id}
                                                className="flex min-h-14 items-center gap-2 rounded-xl bg-muted/10 py-1.5 pl-3 pr-1.5"
                                            >
                                                <ReminderIcon icon={item.icon} size={18} className="shrink-0" />
                                                {/* name on top, status under it, so a long name and a date
                                                    with its year never fight for one line */}
                                                <span className="ml-1 flex min-w-0 flex-1 flex-col leading-tight">
                                                    <span className="truncate font-semibold">{item.name}</span>
                                                    <span className={`truncate text-sm ${item.interval ? 'text-muted' : 'font-semibold text-red-600'}`}>{getQuietText(item, todayISO)}</span>
                                                </span>
                                                {/* done today already: a plain check instead of the button, so it can't be tapped twice */}
                                                {doneToday ? (
                                                    <span className="flex h-9 w-9 shrink-0 items-center justify-center text-primary" aria-label="Done today">
                                                        <Check size={18} />
                                                    </span>
                                                ) : (
                                                    <button
                                                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-control-sm ${raisedTintClass}`}
                                                        aria-label={`Mark ${item.name} done today`}
                                                        title="Done today"
                                                        onClick={() => logToday(item.id)}
                                                    >
                                                        <Check size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </ScrollArea>

                        <button
                            className={`mt-3 flex h-11 w-full items-center justify-center gap-1 rounded-control ${raisedTintClass}`}
                            onClick={() => { setPanelOpen(false); setSetupOpen(true) }}
                        >
                            Set up reminders
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </>
            )}

            {setupOpen && <ReminderSetup onClose={() => setSetupOpen(false)} />}
        </div>
    )
}
