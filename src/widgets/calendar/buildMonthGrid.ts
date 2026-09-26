import { toISO } from '../../lib/dates'

export type GridDay = {
    iso: string       // "2026-08-30"
    inMonth: boolean  // false → grayed out
}

export function buildMonthGrid(year: number, month: number): GridDay[] {
    const firstOfMonth = new Date(year, month - 1, 1)
    const startOffset = firstOfMonth.getDay()
    const grid: GridDay[] = []
    for (let i = 0; i < 42; i++) {
        const date = new Date(year, month - 1, 1 - startOffset + i)
        grid.push({
            iso: toISO(date),
            inMonth: date.getMonth() === month - 1
        })
    }
    return grid
}