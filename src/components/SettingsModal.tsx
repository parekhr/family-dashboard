import { Check } from 'lucide-react'
import { Modal } from './Modal'
import { colorThemes } from '../lib/colorThemes'

type SettingsModalProps = {
    themeKey: string
    onThemeChange: (key: string) => void
    onClose: () => void
}

export function SettingsModal({ themeKey, onThemeChange, onClose }: SettingsModalProps) {
    return (
        <Modal onClose={onClose}>
            <div className="flex items-center justify-between gap-10">
                <h3 className="text-xl font-extrabold">Settings</h3>
                <button
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-muted/15 text-lg hover:bg-muted/25 active:bg-muted/35 transition-colors"
                    aria-label="Close"
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>

            <div className="mt-4 text-sm font-semibold text-muted">Color theme</div>

            {/* Tapping a color applies it right away; the modal stays open */}
            <div className="mt-2 grid grid-cols-[repeat(3,76px)] gap-0.5">
                {colorThemes.map((theme) => {
                    const selected = theme.key === themeKey
                    return (
                        <button
                            key={theme.key}
                            className="flex cursor-pointer flex-col items-center gap-1 rounded-xl py-1 hover:bg-muted/10 active:bg-muted/15 transition-colors"
                            aria-pressed={selected}
                            onClick={() => onThemeChange(theme.key)}
                        >
                            <span
                                className={`flex h-10 w-10 items-center justify-center rounded-full text-white ${selected ? 'ring-2 ring-primary ring-offset-2 ring-offset-card' : ''}`}
                                style={{ backgroundColor: theme.primary }}
                            >
                                {selected && <Check className="h-5 w-5" />}
                            </span>
                            <span className="text-sm font-semibold text-ink">{theme.name}</span>
                        </button>
                    )
                })}
            </div>
        </Modal>
    )
}