import type { ReminderItem } from './useRemindersData'
import { addDaysISO, addMonthsISO, daysBetweenISO } from '../lib/dates'

// A reminder is "after this amount of time, remind me to do this". The amount of time is a
// count and a unit: { count: 1, unit: 'day' } is every day, { count: 6, unit: 'month' } every 6 months.
export type IntervalUnit = 'day' | 'week' | 'month'
export type Interval = { count: number; unit: IntervalUnit }

// The choices in the "Repeats" dropdown, shortest first
export const intervalChoices: Interval[] = [
    { count: 1, unit: 'day' },
    { count: 1, unit: 'week' },
    { count: 2, unit: 'week' },
    { count: 1, unit: 'month' },
    { count: 2, unit: 'month' },
    { count: 3, unit: 'month' },
    { count: 4, unit: 'month' },
    { count: 6, unit: 'month' },
    { count: 12, unit: 'month' },
]

export const DEFAULT_INTERVAL: Interval = { count: 6, unit: 'month' }

// How early a reminder starts showing, and how long Snooze hides it, both scaled to how
// often it repeats: a week's notice suits a 6-month filter, but a daily reminder would
// then never stop showing.
const LEAD_DAYS: Record<IntervalUnit, number> = { day: 0, week: 1, month: 7 }
const SNOOZE_DAYS: Record<IntervalUnit, number> = { day: 1, week: 1, month: 7 }

export type DueReminder = {
    item: ReminderItem
    dueDate?: string   // absent = never logged, so there's nothing to count from
    daysLeft: number   // negative = overdue
}

export function getLastDone(item: ReminderItem): string | undefined {
    return [...item.history].sort().at(-1)
}

export function addInterval(iso: string, interval: Interval): string {
    if (interval.unit === 'day') return addDaysISO(iso, interval.count)
    if (interval.unit === 'week') return addDaysISO(iso, interval.count * 7)
    return addMonthsISO(iso, interval.count)
}

// Last done + interval. So logging early (Done before it's due) moves the next one along.
export function getDueDate(item: ReminderItem): string | undefined {
    const lastDone = getLastDone(item)
    if (!item.interval || !lastDone) return undefined
    return addInterval(lastDone, item.interval)
}

export function isSnoozed(item: ReminderItem, todayISO: string): boolean {
    return item.snoozedUntil !== undefined && item.snoozedUntil > todayISO
}

// The reminder to show in the bell's due list today, or null: no interval set, snoozed, or
// not due soon enough yet. Nothing runs in the background: this is worked out each time the
// header draws.
export function getDueReminder(item: ReminderItem, todayISO: string): DueReminder | null {
    if (!item.interval || isSnoozed(item, todayISO)) return null
    const dueDate = getDueDate(item)
    if (!dueDate) return { item, daysLeft: 0 }   // never logged: due now
    const daysLeft = daysBetweenISO(todayISO, dueDate)
    return daysLeft <= LEAD_DAYS[item.interval.unit] ? { item, dueDate, daysLeft } : null
}

export function getSnoozeDays(item: ReminderItem): number {
    return SNOOZE_DAYS[item.interval?.unit ?? 'month']
}

function plural(n: number, word: string): string {
    return `${n} ${word}${n === 1 ? '' : 's'}`
}

export function getDueText(reminder: DueReminder): string {
    if (!reminder.dueDate) return 'Never done'
    if (reminder.daysLeft < 0) return `Overdue ${plural(-reminder.daysLeft, 'day')}`
    if (reminder.daysLeft === 0) return 'Due today'
    return `Due in ${plural(reminder.daysLeft, 'day')}`
}

// "Every day", "Every week", "Every 2 weeks", "Every 6 months"
export function getIntervalText(interval: Interval): string {
    return interval.count === 1 ? `Every ${interval.unit}` : `Every ${plural(interval.count, interval.unit)}`
}

// The short name on the form's "Repeats" choices: "Daily", "2 weeks", "Yearly"
export function getIntervalLabel(interval: Interval): string {
    const { count, unit } = interval
    if (count === 1) return { day: 'Daily', week: 'Weekly', month: 'Monthly' }[unit]
    if (count === 12 && unit === 'month') return 'Yearly'
    return plural(count, unit)
}

export function getSnoozeText(days: number): string {
    return days === 7 ? 'Snooze 1 week' : `Snooze ${plural(days, 'day')}`
}

// One string per interval, for comparing two and for React keys: '6:month'
export function intervalKey(interval: Interval): string {
    return `${interval.count}:${interval.unit}`
}
