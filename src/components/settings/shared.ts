// Styles and checks shared by the People and Categories tabs in Settings.
// The class strings match the event form and the Home Care History modal.
// Save and Cancel follow the house style in ../styles.ts.

import { raisedPrimaryClass } from '../styles'

export const MAX_NAME_LENGTH = 30

export const inputClass = 'h-11 w-full rounded-2xl border border-muted/30 bg-white px-3 text-base font-normal text-ink'
export const saveButtonClass = `h-11 shrink-0 rounded-2xl px-4 ${raisedPrimaryClass}`
export const cancelButtonClass = 'h-11 shrink-0 cursor-pointer px-3 font-medium text-muted'
export const iconButtonClass = 'flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-muted/30'
export const addButtonClass = 'mt-3 h-[52px] w-full shrink-0 cursor-pointer rounded-full border-2 border-dashed border-muted/40 font-bold'

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
