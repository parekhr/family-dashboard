import { Check } from 'lucide-react'
import { nameFonts } from '../../lib/nameFonts'

type NameFontSettingProps = {
    name?: string
    fontKey: string
    onChange: (key: string) => void
}

// The household name's font. Each row draws the real name in that font at the size the header
// uses, so the list is the preview. Tapping one applies it at once, like the color themes.
export function NameFontSetting({ name, fontKey, onChange }: NameFontSettingProps) {
    return (
        <>
            <div className="mt-5 text-sm font-semibold text-muted">Name font</div>

            <div className="mt-1.5 flex flex-col gap-2 p-0.5">{/* p-0.5: room for the selected ring inside the scroll area */}
                {nameFonts.map(font => {
                    const selected = font.key === fontKey
                    return (
                        <button
                            key={font.key}
                            className={`flex h-14 cursor-pointer items-center gap-3 rounded-2xl px-4 text-left transition-colors ${selected ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted/10 hover:bg-muted/15 active:bg-muted/20'}`}
                            aria-pressed={selected}
                            aria-label={font.label}
                            onClick={() => onChange(font.key)}
                        >
                            <span className={`min-w-0 flex-1 truncate text-ink ${font.className}`}>{name || font.label}</span>
                            <span className="shrink-0 text-sm font-semibold text-muted">{font.label}</span>
                            <span className="flex w-6 shrink-0 justify-center text-primary">
                                {selected && <Check className="h-5 w-5" />}
                            </span>
                        </button>
                    )
                })}
            </div>
        </>
    )
}
