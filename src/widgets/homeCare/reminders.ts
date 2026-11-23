import type { HomeCareItem } from './useHomeCareData'
import { addMonthsISO, daysBetweenISO } from '../../lib/dates'

export const DUE_SOON_DAYS = 7   // start reminding this many days before the due date
export const SNOOZE_DAYS = 7

export type Reminder = {
    item: HomeCareItem
    dueDate?: string   // absent = never logged, so there's nothing to count from
    daysLeft: number   // negative = overdue
}

export function getLastChanged(item: HomeCareItem): string | undefined {
    return [...item.history].sort().at(-1)
}

// Last change + interval. Nothing to work out without both.
export function getDueDate(item: HomeCareItem): string | undefined {
    const lastChanged = getLastChanged(item)
    if (!item.intervalMonths || !lastChanged) return undefined
    return addMonthsISO(lastChanged, item.intervalMonths)
}

export function isSnoozed(item: HomeCareItem, todayISO: string): boolean {
    return item.snoozedUntil !== undefined && item.snoozedUntil > todayISO
}

// The reminder to show for this item today, or null when there's nothing to show:
// no interval set, snoozed, or the due date is more than DUE_SOON_DAYS away.
// Nothing runs in the background: this is worked out each time the header draws.
export function getReminder(item: HomeCareItem, todayISO: string): Reminder | null {
    if (!item.intervalMonths || isSnoozed(item, todayISO)) return null
    const dueDate = getDueDate(item)
    if (!dueDate) return { item, daysLeft: 0 }   // never logged: due now
    const daysLeft = daysBetweenISO(todayISO, dueDate)
    return daysLeft <= DUE_SOON_DAYS ? { item, dueDate, daysLeft } : null
}

function plural(n: number, word: string): string {
    return `${n} ${word}${n === 1 ? '' : 's'}`
}

export function getReminderText(reminder: Reminder): string {
    if (!reminder.dueDate) return 'Never logged'
    if (reminder.daysLeft < 0) return `Overdue ${plural(-reminder.daysLeft, 'day')}`
    if (reminder.daysLeft === 0) return 'Due today'
    return `Due in ${plural(reminder.daysLeft, 'day')}`
}

export const intervalChoices = [1, 2, 3, 4, 6, 12]   // months offered in the Reminder dropdowns

export function getIntervalText(months: number): string {
    return months === 1 ? 'Every month' : `Every ${months} months`
}
