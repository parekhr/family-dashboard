// Styles and checks shared by the People and Categories tabs in Settings.
// The class strings match the event form and a reminder's history.
// The buttons are the house style's (../styles.ts), re-exported here so the tabs' imports stay put.

import { raisedPrimaryClass } from '../styles'
export { addButtonClass, cancelButtonClass, confirmDeleteButtonClass, dangerIconButtonClass, iconButtonClass } from '../styles'

export const MAX_NAME_LENGTH = 30

export const inputClass = 'h-11 w-full rounded-control border border-muted/30 bg-white px-3 text-base font-normal text-ink'
export const saveButtonClass = `h-11 shrink-0 rounded-control px-4 ${raisedPrimaryClass}`

// '' means the name is fine. `otherNames` are the names already taken (not counting the
// one being renamed), compared ignoring case so "mom" can't sit next to "Mom".
export function checkName(name: string, otherNames: string[]): string {
    const trimmed = name.trim()
    if (!trimmed) return 'Enter a name'
    if (otherNames.some(other => other.toLowerCase() === trimmed.toLowerCase())) return 'That name is already used'
    return ''
}

export function plural(n: number, word: string): string {
    return `${n} ${word}${n === 1 ? '' : 's'}`
}
