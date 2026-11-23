import { useEffect, useState } from 'react'
import { ChevronDown, ChevronRight, ChevronUp } from 'lucide-react'
import { registry, type WidgetChoices, type WidgetId } from '../../widgets/registry'
import type { SettingsPage } from '../SettingsModal'

type WidgetSettingsProps = {
    widgets: WidgetChoices                      // every widget in order, and which are off
    onChange: (widgets: WidgetChoices) => void
    onOpenPage: (page: SettingsPage) => void
}

// A widget with settings of its own gets a link under its row to its own page. This is
// the one place a widget's settings are reached from, whether the widget is on or off.
const pageLinks: Partial<Record<WidgetId, { label: string; page: SettingsPage }>> = {
    homeCare: { label: 'Home Care items', page: 'homeCareItems' },
}

const arrowClass = 'flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink enabled:hover:bg-muted/10 enabled:active:bg-muted/15 disabled:cursor-default disabled:opacity-25'

// The Widgets tab. Every widget keeps its row whether it's on or off: the switch only
// turns it on or off, and only the arrows move rows. Changes apply at once (the dashboard
// behind the pop-up is the preview, as with themes) and are saved on the household.
export function WidgetSettings({ widgets, onChange, onOpenPage }: WidgetSettingsProps) {
    const { order, hidden } = widgets
    const onCount = order.filter(id => !hidden.includes(id)).length

    // The widget whose "keep one on" note is showing: only after someone tries to turn
    // off the last widget, and only for a few seconds, so it isn't on screen all the time
    const [warningId, setWarningId] = useState<WidgetId | null>(null)
    useEffect(() => {
        if (!warningId) return
        const timer = setTimeout(() => setWarningId(null), 3000)
        return () => clearTimeout(timer)
    }, [warningId])

    // Moving an off widget sets where it'll appear when it's turned back on
    function move(index: number, by: -1 | 1) {
        const next = [...order]
        ;[next[index], next[index + by]] = [next[index + by], next[index]]
        onChange({ order: next, hidden })
    }

    // Any combination works (the layout makes whatever is on fill the screen);
    // the only rule is that something stays on
    function toggle(id: WidgetId) {
        setWarningId(null)
        if (hidden.includes(id)) {
            onChange({ order, hidden: hidden.filter(other => other !== id) })
        } else if (onCount === 1) {
            setWarningId(id)   // an empty dashboard would look broken
        } else {
            onChange({ order, hidden: [...hidden, id] })
        }
    }

    return (
        <div className="flex flex-col">
            {order.map((id, index) => {
                const def = registry[id]
                const on = !hidden.includes(id)
                const warning = warningId === id
                const note = warning ? 'Keep at least one widget on' : def.shape === 'full' ? 'Full width' : 'Half width'

                return (
                    <div key={id} className="flex items-center gap-1 border-b border-muted/20 py-2">
                        <button className={arrowClass} aria-label={`Move ${def.label} up`} disabled={index === 0} onClick={() => move(index, -1)}>
                            <ChevronUp size={20} />
                        </button>
                        <button className={arrowClass} aria-label={`Move ${def.label} down`} disabled={index === order.length - 1} onClick={() => move(index, 1)}>
                            <ChevronDown size={20} />
                        </button>

                        <div className="ml-2 flex min-w-0 flex-1 flex-col leading-tight">
                            {/* a widget that's off greys out its name and note, but not its
                                settings link: those settings work whether it's on or not */}
                            <div className={`flex min-w-0 flex-col ${on ? '' : 'opacity-60'}`}>
                                <span className="truncate text-base font-semibold">{def.label}</span>
                                <span className={`truncate text-sm ${warning ? 'font-semibold text-red-600' : 'text-muted'}`}>{note}</span>
                            </div>
                            {pageLinks[id] && (
                                <button
                                    className="mt-1 flex w-fit cursor-pointer items-center text-sm font-bold text-primary hover:underline"
                                    onClick={() => onOpenPage(pageLinks[id]!.page)}
                                >
                                    {pageLinks[id]!.label}
                                    <ChevronRight size={16} />
                                </button>
                            )}
                        </div>

                        {/* on/off switch */}
                        <button
                            role="switch"
                            aria-checked={on}
                            aria-label={`Show ${def.label}`}
                            className={`relative h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors ${on ? 'bg-primary' : 'bg-muted/30'}`}
                            onClick={() => toggle(id)}
                        >
                            <span className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${on ? 'translate-x-6' : ''}`} />
                        </button>
                    </div>
                )
            })}
        </div>
    )
}
