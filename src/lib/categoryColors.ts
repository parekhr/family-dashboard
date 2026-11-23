// The colors a category can have. Fixed on purpose: every one is dark enough to read
// as small text on the cream cards (at least 4.5:1 contrast), and none of them can be
// confused with the holiday rings or monthly themes. A category can also have no color.
export type CategoryColor = { name: string; value: string }

export const categoryColors: CategoryColor[] = [
    { name: 'Red', value: '#C0392B' },
    { name: 'Orange', value: '#B4501A' },
    { name: 'Gold', value: '#8A6108' },
    { name: 'Green', value: '#2E7D32' },
    { name: 'Teal', value: '#0F766E' },
    { name: 'Blue', value: '#2563A8' },
    { name: 'Purple', value: '#7B3FA0' },
    { name: 'Pink', value: '#B0306A' },
    { name: 'Gray', value: '#5F6B7A' },
]
