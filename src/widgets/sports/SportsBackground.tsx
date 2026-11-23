import type { CSSProperties } from 'react'
import type { League } from './espn'

// A soft surface behind the Sports widget that matches the tab: hardwood floor for the
// NBA, mowed turf stripes for the NFL. Pure CSS gradients (no images, nothing to license),
// kept pale and low-contrast so the cards on top stay the focus.

const surfaces: Record<League, CSSProperties> = {
    // Planks: two alternating warm tones with a thin darker seam between boards
    nba: {
        backgroundColor: '#e8d5b7',
        backgroundImage: 'repeating-linear-gradient(90deg, #ead8bc 0 30px, #d9c19b 30px 31px, #e4cfae 31px 61px, #d9c19b 61px 62px)',
    },
    // Mowing stripes: wide alternating bands of two pale greens
    nfl: {
        backgroundColor: '#d3dfc9',
        backgroundImage: 'repeating-linear-gradient(90deg, #d6e2cc 0 48px, #c8d7bc 48px 96px)',
    },
}

export function SportsBackground({ league }: { league: League }) {
    return (
        <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={surfaces[league]}
            aria-hidden="true"
        />
    )
}
