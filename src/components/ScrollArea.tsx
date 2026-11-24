import { useEffect, useState, type ReactNode } from 'react'

type ScrollAreaProps = {
    className?: string      // sizing and layout, as on the plain div it replaces (overflow is added here)
    children: ReactNode
}

const FADE_PX = 36

// A vertically scrolling area whose edges fade out while there's more to scroll that way.
// Tablets (Android, iPhone) hide scrollbars until you're mid-scroll, so without this
// nothing says a list continues. The fade only shows when there's more: at the bottom
// while there's more below, at the top once you've scrolled down. It's a CSS mask, so it
// fades into whatever is behind (a card, the court, the field) without a coloured overlay.
export function ScrollArea({ className = '', children }: ScrollAreaProps) {
    const [element, setElement] = useState<HTMLDivElement | null>(null)
    const [edges, setEdges] = useState({ top: false, bottom: false })

    useEffect(() => {
        if (!element) return
        function update() {
            if (!element) return
            const top = element.scrollTop > 1
            const bottom = element.scrollTop + element.clientHeight < element.scrollHeight - 1
            setEdges(prev => prev.top === top && prev.bottom === bottom ? prev : { top, bottom })
        }
        // checked when scrolled, when the area changes size, and when its content changes
        // (games loading, an item added), which can make it scrollable without a resize
        const frame = requestAnimationFrame(update)
        element.addEventListener('scroll', update, { passive: true })
        const resizes = new ResizeObserver(update)
        resizes.observe(element)
        const changes = new MutationObserver(update)
        changes.observe(element, { childList: true, subtree: true, characterData: true })
        return () => {
            cancelAnimationFrame(frame)
            element.removeEventListener('scroll', update)
            resizes.disconnect()
            changes.disconnect()
        }
    }, [element])

    const mask = edges.top || edges.bottom
        ? `linear-gradient(to bottom, transparent 0, black ${edges.top ? FADE_PX : 0}px, black calc(100% - ${edges.bottom ? FADE_PX : 0}px), transparent 100%)`
        : undefined

    return (
        <div ref={setElement} className={`overflow-y-auto ${className}`} style={{ maskImage: mask, WebkitMaskImage: mask }}>
            {children}
        </div>
    )
}
