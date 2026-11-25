import { useState } from 'react'
import { Check } from 'lucide-react'
import { Modal } from './Modal'
import { colorThemes } from '../lib/colorThemes'
import { formatTimeAgo } from '../lib/dates'
import { PeopleSettings } from './settings/PeopleSettings'
import { CategorySettings } from './settings/CategorySettings'
import { WidgetSettings } from './settings/WidgetSettings'
import { HouseholdNameSetting } from './settings/HouseholdNameSetting'
import { NameFontSetting } from './settings/NameFontSetting'
import type { WidgetChoices } from '../widgets/registry'
import { ScrollArea } from './ScrollArea'
import { closeButtonClass, modalTitleClass, tabClass } from './styles'

type SettingsModalProps = {
    householdName?: string
    onHouseholdNameChange: (name: string) => void
    nameFont: string
    onNameFontChange: (key: string) => void
    themeKey: string
    onThemeChange: (key: string) => void
    widgets: WidgetChoices
    onWidgetsChange: (widgets: WidgetChoices) => void
    onClose: () => void
}

type Tab = 'household' | 'widgets' | 'people' | 'categories'

const tabs: { key: Tab; label: string }[] = [
    { key: 'household', label: 'Household' },
    { key: 'widgets', label: 'Widgets' },
    { key: 'people', label: 'People' },
    { key: 'categories', label: 'Categories' },
]

export function SettingsModal({ householdName, onHouseholdNameChange, nameFont, onNameFontChange, themeKey, onThemeChange, widgets, onWidgetsChange, onClose }: SettingsModalProps) {
    const [tab, setTab] = useState<Tab>('household')

    return (
        <Modal onClose={onClose} className="flex w-[480px] flex-col">
            <div className="flex items-center justify-between gap-10">
                <h3 className={modalTitleClass}>Settings</h3>
                <button
                    className={closeButtonClass}
                    aria-label="Close"
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>

            {/* raised tabs, the house style being tried here first (see styles.ts) */}
            <div className="mt-4 flex gap-2">
                {tabs.map(({ key, label }) => (
                    <button
                        key={key}
                        className={tabClass(tab === key)}
                        aria-pressed={tab === key}
                        onClick={() => setTab(key)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* fixed height, so switching tabs doesn't make the pop-up jump in size */}
            <ScrollArea className="mt-4 h-[400px] pr-1">
                {tab === 'household' && (
                    <>
                        <HouseholdNameSetting name={householdName} onChange={onHouseholdNameChange} />
                        <NameFontSetting name={householdName} fontKey={nameFont} onChange={onNameFontChange} />

                        <div className="mt-5 text-sm font-semibold text-muted">Color theme</div>

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
                {tab === 'widgets' && <WidgetSettings widgets={widgets} onChange={onWidgetsChange} />}
                {tab === 'people' && <PeopleSettings />}
                {tab === 'categories' && <CategorySettings />}
            </ScrollArea>

            {/* which version this tablet is running: the update's date and its git commit,
                for checking a tablet picked up an update (see useAutoReload) */}
            <div className="mt-3 flex justify-between text-xs text-muted">
                <span>Last updated: {formatTimeAgo(__BUILD_TIME__)}</span>
                <span className="font-mono">{__BUILD_COMMIT__}</span>
            </div>
        </Modal>
    )
}
