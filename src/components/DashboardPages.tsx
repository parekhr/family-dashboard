import { useEffect, useRef, useState } from 'react'
import { buildPages, buildRows, registry, type WidgetId } from '../widgets/registry'

type DashboardPagesProps = {
    onWidgets: WidgetId[]   // the widgets that are on, in the household's order
}

const SWIPE_DISTANCE = 80               // px sideways before a drag counts as a swipe
const BACK_TO_FIRST_MS = 60_000         // with no touches for a minute, return to page 1

// The widget area below the header. Widgets that don't fit on one screen go onto more
// pages (see buildPages); swipe sideways or tap the dots to move between them. After a
// minute untouched it slides back to page 1, so the main page is what's on the wall.
export function DashboardPages({ onWidgets }: DashboardPagesProps) {
    const pages = buildPages(buildRows(onWidgets, registry))
    const [chosenPage, setChosenPage] = useState(0)
    const [touchCount, setTouchCount] = useState(0)   // bumped on every touch, restarting the idle timer
    const dragStart = useRef<{ x: number; y: number } | null>(null)

    // turning widgets off can leave fewer pages than the one that was showing
    const page = Math.min(chosenPage, pages.length - 1)

    useEffect(() => {
        if (page === 0) return
        const timer = setTimeout(() => setChosenPage(0), BACK_TO_FIRST_MS)
        return () => clearTimeout(timer)
    }, [page, touchCount])

    function handlePointerDown(e: React.PointerEvent) {
        setTouchCount(n => n + 1)
        dragStart.current = { x: e.clientX, y: e.clientY }
    }

    // A mostly sideways drag far enough turns the page; anything else (taps, scrolling a
    // list up and down) is left alone for the widgets
    function handlePointerUp(e: React.PointerEvent) {
        const start = dragStart.current
        dragStart.current = null
        if (!start || pages.length < 2) return
        const dx = e.clientX - start.x
        const dy = e.clientY - start.y
        if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return
        setChosenPage(Math.max(0, Math.min(pages.length - 1, page + (dx < 0 ? 1 : -1))))
    }

    return (
        <div
            className="relative flex-1 min-h-0 overflow-hidden"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={() => { dragStart.current = null }}
        >
            {/* every page side by side; sliding the strip shows one at a time */}
            <div
                className="flex h-full transition-transform duration-300 ease-out"
                style={{ transform: `translateX(-${page * 100}%)` }}
            >
                {pages.map((rows, index) => {
                    // Half-width rows stretch to fill the page, with full-width rows at a fixed
                    // 250px. With no half-width row on a page, its full-width rows share it.
                    const hasHalfRow = rows.some(row => registry[row[0]].shape === 'half')
                    return (
                        <div key={index} className="flex h-full w-full shrink-0 flex-col" aria-hidden={index !== page}>
                            {rows.map(row => (
                                <div key={row.join('-')} className={registry[row[0]].shape === 'full' && hasHalfRow ? 'flex h-[250px]' : 'flex flex-1 min-h-0'}>
                                    {row.map(id => {
                                        const Component = registry[id].component
                                        return (
                                            <div key={id} className="flex-1 flex flex-col min-h-0 p-4">
                                                <Component />
                                            </div>
                                        )
                                    })}
                                </div>
                            ))}
                        </div>
                    )
                })}
            </div>

            {/* page dots, only when there's more than one page; drawn over the bottom
                padding so they take no room from the widgets */}
            {pages.length > 1 && (
                <div className="absolute inset-x-0 bottom-0 flex justify-center">
                    {pages.map((_, index) => (
                        <button
                            key={index}
                            className="flex h-4 w-6 cursor-pointer items-center justify-center"
                            aria-label={`Page ${index + 1}`}
                            aria-current={index === page}
                            onClick={() => setChosenPage(index)}
                        >
                            <span className={`h-2 w-2 rounded-full transition-colors ${index === page ? 'bg-primary' : 'bg-muted/40'}`} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    )
}
