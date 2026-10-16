export type ColorTheme = {
    key: string
    name: string
    primary: string
    primaryHover: string
}

export const colorThemes: ColorTheme[] = [
    { key: 'sage', name: 'Sage', primary: '#3d7a6a', primaryHover: '#33685a' },
    { key: 'blue', name: 'Blue', primary: '#3a6ea5', primaryHover: '#315e8c' },
    { key: 'plum', name: 'Plum', primary: '#7a4a8c', primaryHover: '#683f77' },
    { key: 'terracotta', name: 'Terracotta', primary: '#b0533c', primaryHover: '#964733' },
    { key: 'slate', name: 'Slate', primary: '#4f5d75', primaryHover: '#434f63' },
    { key: 'blossom', name: 'Blossom', primary: '#b0457e', primaryHover: '#963b6b' },
]

export function getColorTheme(key: string): ColorTheme {
    return colorThemes.find(theme => theme.key === key) ?? colorThemes[0]
}