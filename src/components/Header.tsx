import { useNow } from '../hooks/useNow'
import { Settings } from 'lucide-react'
import { SettingsModal } from './SettingsModal'
import { useState } from 'react'
import { RemindersBell } from '../widgets/homeCare/RemindersBell'
import type { WidgetChoices } from '../widgets/registry'
import { getNameFont } from '../lib/nameFonts'

type HeaderProps = {
    name?: string
    onNameChange: (name: string) => void
    nameFont: string
    onNameFontChange: (key: string) => void
    themeKey: string
    onThemeChange: (key: string) => void
    widgets: WidgetChoices
    onWidgetsChange: (widgets: WidgetChoices) => void
}

export function Header({ name, onNameChange, nameFont, onNameFontChange, themeKey, onThemeChange, widgets, onWidgetsChange }: HeaderProps) {

    const now = useNow()
    const [time, period] = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).split(' ')
    const [settingsOpen, setSettingsOpen] = useState(false)

    return (
        <header className="grid grid-cols-3 items-center px-4 h-20 text-ink">
            {/* Time and date section */}
            <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold tabular-nums leading-none">{time}</span>
                    <span className="text-lg font-bold">{period}</span>
                </div>
                <span className="text-sm font-semibold text-muted">
                    {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
            </div>

            {/* Household name section */}
            <div className={`text-center truncate ${getNameFont(nameFont).className}`}>{name}</div>

            {/* Location and settings section */}
            <div className="flex items-center justify-end gap-2">
                <RemindersBell />
                <button
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full hover:bg-muted/10 active:bg-muted/15 transition-colors"
                    aria-label="Settings"
                    onClick={() => setSettingsOpen(true)}
                >
                    <Settings />
                </button>
            </div>
            {settingsOpen && (
                <SettingsModal
                    householdName={name}
                    onHouseholdNameChange={onNameChange}
                    nameFont={nameFont}
                    onNameFontChange={onNameFontChange}
                    themeKey={themeKey}
                    onThemeChange={onThemeChange}
                    widgets={widgets}
                    onWidgetsChange={onWidgetsChange}
                    onClose={() => setSettingsOpen(false)}
                /> 
            )}
        </header>
    );
}