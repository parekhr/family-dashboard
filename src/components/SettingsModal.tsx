import { useState } from 'react'
import { Check } from 'lucide-react'
import { Modal } from './Modal'
import { colorThemes } from '../lib/colorThemes'
import { PeopleSettings } from './settings/PeopleSettings'
import { CategorySettings } from './settings/CategorySettings'
import { WidgetSettings } from './settings/WidgetSettings'
import { HomeCareItemsPage } from './settings/HomeCareItemsPage'
import type { WidgetChoices } from '../widgets/registry'

type SettingsModalProps = {
    themeKey: string
    onThemeChange: (key: string) => void
    widgets: WidgetChoices
    onWidgetsChange: (widgets: WidgetChoices) => void
    onClose: () => void
}

type Tab = 'theme' | 'widgets' | 'people' | 'categories'

// A widget's own settings page, opened from its row in the Widgets tab
export type SettingsPage = 'homeCareItems'

const tabs: { key: Tab; label: string }[] = [
    { key: 'theme', label: 'Theme' },
    { key: 'widgets', label: 'Widgets' },
    { key: 'people', label: 'People' },
    { key: 'categories', label: 'Categories' },
]

export function SettingsModal({ themeKey, onThemeChange, widgets, onWidgetsChange, onClose }: SettingsModalProps) {
    const [tab, setTab] = useState<Tab>('theme')
    const [page, setPage] = useState<SettingsPage | null>(null)

    // A widget's settings page replaces the tabs; its back arrow returns to the Widgets tab.
    // Every widget's own settings are reached from its row there, so they're all in one place.
    if (page) {
        return (
            <Modal onClose={onClose} className="flex w-[480px] flex-col">
                {page === 'homeCareItems' && <HomeCareItemsPage onBack={() => setPage(null)} onClose={onClose} />}
            </Modal>
        )
    }

    return (
        <Modal onClose={onClose} className="flex w-[480px] flex-col">
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

            {/* same pill tabs as the day modal's Today / Tomorrow */}
            <div className="mt-4 flex gap-2">
                {tabs.map(({ key, label }) => (
                    <button
                        key={key}
                        className={`h-11 flex-1 cursor-pointer rounded-full font-semibold transition-colors ${tab === key ? 'bg-primary text-white' : 'bg-muted/15 text-ink hover:bg-muted/25'}`}
                        aria-pressed={tab === key}
                        onClick={() => setTab(key)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* fixed height, so switching tabs doesn't make the pop-up jump in size */}
            <div className="mt-4 h-[400px] overflow-y-auto pr-1">
                {tab === 'theme' && (
                    <>
                        <div className="text-sm font-semibold text-muted">Color theme</div>

                        {/* Tapping a color applies it right away; the modal stays open.
                            Tiles fill the tab's width (3 across) now that Settings is a fixed 480px. */}
                        <div className="mt-1.5 grid grid-cols-3 gap-3 p-0.5">{/* p-0.5: room for the selected ring inside the scroll area */}
                            {colorThemes.map((theme) => {
                                const selected = theme.key === themeKey
                                return (
                                    <button
                                        key={theme.key}
                                        className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl py-4 transition-colors ${selected ? 'bg-primary/10 ring-2 ring-primary' : 'bg-muted/10 hover:bg-muted/15 active:bg-muted/20'}`}
                                        aria-pressed={selected}
                                        onClick={() => onThemeChange(theme.key)}
                                    >
                                        <span
                                            className="flex h-14 w-14 items-center justify-center rounded-full text-white"
                                            style={{ backgroundColor: theme.primary }}
                                        >
                                            {selected && <Check className="h-6 w-6" />}
                                        </span>
                                        <span className="text-sm font-semibold text-ink">{theme.name}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </>
                )}
                {tab === 'widgets' && <WidgetSettings widgets={widgets} onChange={onWidgetsChange} onOpenPage={setPage} />}
                {tab === 'people' && <PeopleSettings />}
                {tab === 'categories' && <CategorySettings />}
            </div>
        </Modal>
    )
}
