export type FixedHoliday = {
    name: string
    month: number
    day: number
    color?: string
}

export type FloatingHoliday = {
    name: string
    month: number
    weekday: number
    occurrence: number | 'last'
    color?: string
}

export type Holiday = FixedHoliday | FloatingHoliday

export const fixedHolidays: FixedHoliday[] = [
    { name: "New Year's Day", month: 1, day: 1, color: '#D4A017'},
    { name: "Valentine's Day", month: 2, day: 14, color: '#E75480'},
    { name: "St. Patrick's Day", month: 3, day: 17, color: '#2E8B57'},
    { name: "Independence Day", month: 7, day: 4, color: '#C8102E'},
    { name: "Juneteenth", month: 6, day: 19},
    { name: "Halloween", month: 10, day: 31, color: '#F28C28'},
    { name: "Veterans Day", month: 11, day: 11},
    { name: "Christmas Eve", month: 12, day: 24, color: '#1E7B45' },
    { name: "Christmas Day", month: 12, day: 25, color: '#C8102E'},
    { name: "New Year's Eve", month: 12, day: 31, color: '#D4A017' }
]

// Floating holidays (weekday: 0 = Sun, 1 = Mon, ... 6 = Sat)
// MLK Day             – 3rd Monday of January      (month 1,  weekday 1, occurrence 3)
// Presidents' Day     – 3rd Monday of February     (month 2,  weekday 1, occurrence 3)
// Mother's Day        – 2nd Sunday of May          (month 5,  weekday 0, occurrence 2)
// Memorial Day        – LAST Monday of May         (month 5,  weekday 1, occurrence last)
// Father's Day        – 3rd Sunday of June         (month 6,  weekday 0, occurrence 3)
// Labor Day           – 1st Monday of September    (month 9,  weekday 1, occurrence 1)
// Columbus Day – 2nd Monday of October (month 10, weekday 1, occurrence 2)
// Thanksgiving        – 4th Thursday of November   (month 11, weekday 4, occurrence 4)
// Easter              – moon-based formula, not weekday counting

export const floatingHolidays: FloatingHoliday[] = [
    { name: "Martin Luther King Jr. Day", month: 1, weekday: 1, occurrence: 3, color: '#1E7B45' },
    { name: "Presidents' Day", month: 2, weekday: 1, occurrence: 3, color: '#C8102E' },
    { name: "Mother's Day", month: 5, weekday: 0, occurrence: 2, color: '#E75480' },
    { name: "Memorial Day", month: 5, weekday: 1, occurrence: 'last', color: '#2E8B57' },
    { name: "Father's Day", month: 6, weekday: 0, occurrence: 3, color: '#E75480' },
    { name: "Labor Day", month: 9, weekday: 1, occurrence: 1, color: '#D4A017' },
    { name: "Columbus Day", month: 10, weekday: 1, occurrence: 2, color: '#8E6BBF' },
    { name: "Thanksgiving", month: 11, weekday: 4, occurrence: 4, color: '#F28C28' }
]

// Source: Wikipedia (2026–2037) and Hong Kong Observatory lunar calendar tables (2038–2050)
const chineseNewYearDates: Record<number, { month: number, day: number }> = {
    2026: { month: 2, day: 17 },
    2027: { month: 2, day: 6 },
    2028: { month: 1, day: 26 },
    2029: { month: 2, day: 13 },
    2030: { month: 2, day: 3 },
    2031: { month: 1, day: 23 },
    2032: { month: 2, day: 11 },
    2033: { month: 1, day: 31 },
    2034: { month: 2, day: 19 },
    2035: { month: 2, day: 8 },
    2036: { month: 1, day: 28 },
    2037: { month: 2, day: 15 },
    2038: { month: 2, day: 4 },
    2039: { month: 1, day: 24 },
    2040: { month: 2, day: 12 },
    2041: { month: 2, day: 1 },
    2042: { month: 1, day: 22 },
    2043: { month: 2, day: 10 },
    2044: { month: 1, day: 30 },
    2045: { month: 2, day: 17 },
    2046: { month: 2, day: 6 },
    2047: { month: 1, day: 26 },
    2048: { month: 2, day: 14 },
    2049: { month: 2, day: 2 },
    2050: { month: 1, day: 23 },
}

export function checkHoliday(iso: string): Holiday | undefined {
    const month = Number(iso.slice(-5, -3))
    const day = Number(iso.slice(-2))
    const year = Number(iso.slice(0, 4))
    const weekday = new Date(year, month - 1, day).getDay()
    const occurrence = Math.ceil(day / 7)
    const monthLength = new Date(year, month, 0).getDate()

    const easter = getEaster(year)

    return fixedHolidays.find(holiday => holiday.month === month && holiday.day === day) ?? 
           floatingHolidays.find(holiday => holiday.month === month && holiday.weekday === weekday && (holiday.occurrence === occurrence || (holiday.occurrence === 'last' && day + 7 > monthLength))) ??
           (easter?.month === month && easter?.day === day ? easter : undefined) ??
           (getChineseNewYear(year)?.month === month && getChineseNewYear(year)?.day === day ? getChineseNewYear(year) : undefined)
}

// Calculate the date of Easter for a given year using the Anonymous Gregorian algorithm
export function getEaster(year: number): FixedHoliday {
    const f = Math.floor,
          G = year % 19,
          C = f(year / 100),
          H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30,
          I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11)),
          J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7,
          L = I - J,
          month = 3 + f((L + 40) / 44),
          day = L + 28 - 31 * f(month / 4);
    return { name: "Easter", month, day, color: '#8E6BBF' }
}


export function getChineseNewYear(year: number): FixedHoliday | undefined {
    const date = chineseNewYearDates[year]
    if (!date) return undefined
    return { name: "Chinese New Year", month: date.month, day: date.day, color: '#C8102E' }
}