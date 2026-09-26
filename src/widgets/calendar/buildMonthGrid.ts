export type GridDay = {
    iso: string       // "2026-08-30"
    inMonth: boolean  // false → grayed out
}

export function buildMonthGrid(year: number, month: number): GridDay[] {
    // 1. Find the 1st of the month and which weekday it falls on (0 = Sunday)
    // 2. Step back that many days to get the grid's first Sunday
    // 3. Loop 42 times, one day per step, recording iso + inMonth
    return [{ iso: "2026-08-30", inMonth: false }]
}