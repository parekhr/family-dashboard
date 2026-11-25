// The fonts the household name can be drawn in (Settings → Household). The household saves
// the key; the fonts themselves are bundled in index.css (@fontsource) and registered there
// as Tailwind theme fonts.
//
// Caveat and Dancing Script have small lowercase letters, so they're drawn at 28px instead of
// 20px to look the same size as the others. The 24-character name limit was measured with
// these sizes: 24 capitals is what fits the narrowest case (Dancing Script) in the header's
// middle column (416px); truncation stays as a backstop.
export const MAX_HOUSEHOLD_NAME_LENGTH = 24

export type NameFont = {
    key: string
    label: string
    className: string   // font family, size and weight, written out in full so Tailwind finds them
}

export const nameFonts: NameFont[] = [
    { key: 'classic', label: 'Classic', className: 'font-sans text-xl font-bold' },
    { key: 'elegant', label: 'Elegant', className: 'font-elegant text-xl font-bold' },
    { key: 'handwritten', label: 'Handwritten', className: 'font-handwritten text-[28px] font-bold' },
    { key: 'script', label: 'Script', className: 'font-script text-[28px] font-bold' },
    { key: 'rounded', label: 'Rounded', className: 'font-rounded text-xl font-semibold' },
]

// Unknown or missing keys (an old tablet, a renamed font) get Classic rather than breaking the header
export function getNameFont(key: string | undefined): NameFont {
    return nameFonts.find(font => font.key === key) ?? nameFonts[0]
}
