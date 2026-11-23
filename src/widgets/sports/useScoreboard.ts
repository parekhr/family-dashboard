import { useEffect, useState } from 'react'
import { fetchScoreboard, type League, type Scoreboard } from './espn'

const LIVE_REFRESH_MS = 30_000      // a game is on: scores change by the minute
const IDLE_REFRESH_MS = 5 * 60_000  // nothing live: just catch start times and finals

type Result = { key: string; board?: Scoreboard; error?: boolean }

// One league's scoreboard for one day or week (`query`, see fetchScoreboard), refreshed in
// the background: every 30 seconds while a game is live, every 5 minutes otherwise.
export function useScoreboard(league: League, query: string) {
    const key = `${league}?${query}`
    const [result, setResult] = useState<Result | null>(null)
    const [tick, setTick] = useState(0)

    useEffect(() => {
        let ignore = false
        fetchScoreboard(league, query)
            .then(board => { if (!ignore) setResult({ key, board }) })
            .catch(error => {
                console.error(error)
                // a failed refresh keeps the scores already showing; only a first load shows the error
                if (!ignore) setResult(prev => prev?.key === key && prev.board ? prev : { key, error: true })
            })
        return () => { ignore = true }
    }, [league, query, key, tick])

    const current = result?.key === key ? result : null
    const live = current?.board?.games.some(game => game.state === 'in') ?? false

    useEffect(() => {
        const timer = setInterval(() => setTick(n => n + 1), live ? LIVE_REFRESH_MS : IDLE_REFRESH_MS)
        return () => clearInterval(timer)
    }, [live, key])

    if (!current) return { status: 'loading' as const }
    if (current.error || !current.board) return { status: 'error' as const }
    return { status: 'ready' as const, board: current.board }
}
