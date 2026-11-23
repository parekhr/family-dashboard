import { ChevronDown, ChevronUp } from 'lucide-react'
import { registry, type WidgetId } from '../../widgets/registry'

type WidgetSettingsProps = {
    layout: WidgetId[]                          // the widgets that are on, in screen order
    onChange: (layout: WidgetId[]) => void
}

// Shown under a widget that's off, when it's still reachable somewhere else
const offHints: Partial<Record<WidgetId, string>> = {
    homeCare: 'Still available from the bell',
}

const arrowClass = 'flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink enabled:hover:bg-muted/10 enabled:active:bg-muted/15 disabled:cursor-default disabled:opacity-25'

// The Widgets tab. Turning a widget on or off, or moving it, changes the household's
// widget_layout right away: the dashboard behind the pop-up is the preview, as with themes.
export function WidgetSettings({ layout, onChange }: WidgetSettingsProps) {
    const offIds = (Object.keys(registry) as WidgetId[]).filter(id => !layout.includes(id))

    function move(index: number, by: -1 | 1) {
        const next = [...layout]
        ;[next[index], next[index + by]] = [next[index + by], next[index]]
        onChange(next)
    }

    function toggle(id: WidgetId) {
        if (layout.includes(id)) {
            if (layout.length === 1) return   // an empty dashboard would look broken
            onChange(layout.filter(other => other !== id))
        } else {
            onChange([...layout, id])          // turned on: goes to the end
        }
    }

    function row(id: WidgetId, index: number | null) {
        const on = index !== null
        const isLastOn = on && layout.length === 1
        const def = registry[id]
        const note = on
            ? (isLastOn ? 'Keep at least one widget on' : def.shape === 'full' ? 'Full width' : 'Half width')
            : offHints[id] ?? 'Off'

        return (
            <div key={id} className="flex items-center gap-1 border-b border-muted/20 py-2">
                {/* arrows only for widgets that are on, since only those have a place on screen */}
                {on ? (
                    <>
                        <button className={arrowClass} aria-label={`Move ${def.label} up`} disabled={index === 0} onClick={() => move(index, -1)}>
                            <ChevronUp size={20} />
                        </button>
                        <button className={arrowClass} aria-label={`Move ${def.label} down`} disabled={index === layout.length - 1} onClick={() => move(index, 1)}>
                            <ChevronDown size={20} />
                        </button>
                    </>
                ) : (
                    <span className="w-[92px] shrink-0" />
                )}

                <div className={`ml-2 flex min-w-0 flex-1 flex-col leading-tight ${on ? '' : 'opacity-60'}`}>
                    <span className="truncate text-base font-semibold">{def.label}</span>
                    <span className="truncate text-sm text-muted">{note}</span>
                </div>

                {/* on/off switch */}
                <button
                    role="switch"
                    aria-checked={on}
                    aria-label={`Show ${def.label}`}
                    disabled={isLastOn}
                    className={`relative h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors disabled:cursor-default disabled:opacity-50 ${on ? 'bg-primary' : 'bg-muted/30'}`}
                    onClick={() => toggle(id)}
                >
                    <span className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${on ? 'translate-x-6' : ''}`} />
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col">
            {layout.map((id, index) => row(id, index))}
            {offIds.map(id => row(id, null))}
        </div>
    )
}
