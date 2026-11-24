import type { League } from './espn'

// The header band above the court or field: a solid colour from the same surface, a
// shade that dark text reads well on (like the calendar's tan header band)
export const bandColors: Record<League, string> = {
    nba: '#dfc39b',   // wood
    nfl: '#b3d2a2',   // grass, lighter than the field so the band and field read apart
}
