export type Holiday = {
    name: string
    month: number
    day: number
    color?: string
}

const fixedHolidays: Holiday[] = [
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

