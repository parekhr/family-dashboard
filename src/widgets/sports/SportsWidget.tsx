import { useState } from 'react'
import { ChevronLeft, ChevronRight, Star } from 'lucide-react'
import { addDaysISO, getTodayISO } from '../../lib/dates'
import { useNow } from '../../hooks/useNow'
import { leagues, type Game, type League, type NflWeek } from './espn'
import { useScoreboard } from './useScoreboard'
import { useSports } from './SportsContext'
import { GameCard } from './GameCard'
import { SportsBackground } from './SportsBackground'
import { FavoriteTeamsModal } from './FavoriteTeamsModal'

const leagueKeys = Object.keys(leagues) as League[]
// the calendar's month arrows: no circle at rest, a soft one only on hover / press
const arrowClass = 'flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-ink cursor-pointer enabled:hover:bg-muted/10 enabled:active:bg-muted/15 disabled:cursor-default disabled:opacity-30'

// Live games first, then ones still to come (by start time), then finished ones
function stateRank(game: Game): number {
    return game.state === 'in' ? 0 : game.state === 'pre' ? 1 : 2
}

// "Tonight" for today (NBA games are evening games), otherwise just the date
function dayLabel(offset: number, iso: string): string {
    if (offset === 0) return 'Tonight'
    const [year, month, day] = iso.split('-').map(Number)
    return new Date(year, month - 1, day).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

// Scores for every NBA and NFL game, one league per tab. NBA steps a day at a time,
// NFL a week at a time (its games are mostly on Sun, Mon and Thu). Favorite teams'
// games come first; favorites are picked from the star in the header.
export function SportsWidget() {
    useNow()   // redraws each minute, so "Today" rolls over at midnight
    const { favorites } = useSports()
    const [favoritesOpen, setFavoritesOpen] = useState(false)
    const [league, setLeague] = useState<League>('nba')
    const [dayOffset, setDayOffset] = useState(0)
    const [nflWeek, setNflWeek] = useState<(NflWeek & { year: number }) | null>(null)   // null = this week

    const dayISO = addDaysISO(getTodayISO(), dayOffset)
    const query = league === 'nba'
        ? `dates=${dayISO.replaceAll('-', '')}`
        : nflWeek ? `seasontype=${nflWeek.seasonType}&week=${nflWeek.week}&dates=${nflWeek.year}` : ''
    const scoreboard = useScoreboard(league, query)
    const board = scoreboard.status === 'ready' ? scoreboard.board : undefined

    // where the arrows go
    const weeks = board?.weeks ?? []
    const weekIndex = board?.weekIndex
    const neighborWeek = (by: -1 | 1) => weekIndex === undefined ? undefined : weeks[weekIndex + by]
    function stepWeek(by: -1 | 1) {
        const week = neighborWeek(by)
        if (week && board?.year) setNflWeek({ ...week, year: board.year })
    }
    const currentWeek = weekIndex !== undefined ? weeks[weekIndex] : undefined
    const label = league === 'nba'
        ? dayLabel(dayOffset, dayISO)
        : currentWeek ? currentWeek.label : 'This week'

    // favorites' games first, then the rest; each group live → upcoming → final
    const sorted = [...(board?.games ?? [])].sort((a, b) => stateRank(a) - stateRank(b) || a.start.localeCompare(b.start))
    const isFavoriteGame = (game: Game) => favorites.includes(game.away.key) || favorites.includes(game.home.key)
    const favoriteGames = sorted.filter(isFavoriteGame)
    const otherGames = sorted.filter(game => !isFavoriteGame(game))

    return (
        <div className="relative flex flex-1 min-h-0 flex-col overflow-hidden rounded-3xl bg-muted/15 text-ink">
            <SportsBackground league={league} />
            {/* `relative` so the content draws above the background lines */}
            <div className="relative flex flex-1 min-h-0 flex-col gap-2 p-3">
            <div className="flex items-center justify-between">
                <h2 className="font-sports text-[30px] leading-none tracking-wide">Sports</h2>
                <div className="flex items-center gap-1">
                {/* favorite teams: same plain style as the arrows (no circle at rest) */}
                <button className={arrowClass} aria-label="Favorite teams" onClick={() => setFavoritesOpen(true)}>
                    <Star />
                </button>
                {/* league tabs, styled like the weather's Hourly / Weekly switch */}
                <div className="relative grid h-9 w-[160px] shrink-0 grid-cols-2 rounded-full bg-muted/15 p-1">
                    <div className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-primary transition-transform duration-200 ${league === 'nfl' ? 'translate-x-full' : ''}`} />
                    {leagueKeys.map(key => (
                        <button
                            key={key}
                            className={`relative z-10 cursor-pointer rounded-full font-sports text-lg leading-none tracking-wider transition-colors ${league === key ? 'text-white' : 'text-muted'}`}
                            onClick={() => setLeague(key)}
                        >
                            {leagues[key].label}
                        </button>
                    ))}
                </div>
                </div>
            </div>
            {favoritesOpen && <FavoriteTeamsModal onClose={() => setFavoritesOpen(false)} />}

            {/* Same layout as the calendar's header: Today on the left, always there; the
                arrows hug a fixed-width date in the middle so they don't shift as it changes */}
            <div className="grid grid-cols-[1fr_auto_1fr] items-center">
                <button
                    className="justify-self-start h-9 cursor-pointer rounded-lg px-2 font-semibold text-primary hover:bg-muted/10 active:bg-muted/15"
                    onClick={() => league === 'nba' ? setDayOffset(0) : setNflWeek(null)}
                >
                    Today
                </button>
                <div className="flex items-center gap-2">
                    <button
                        className={arrowClass}
                        aria-label={league === 'nba' ? 'Previous day' : 'Previous week'}
                        disabled={league === 'nfl' && !neighborWeek(-1)}
                        onClick={() => league === 'nba' ? setDayOffset(dayOffset - 1) : stepWeek(-1)}
                    >
                        <ChevronLeft />
                    </button>
                    <div className="flex w-[130px] flex-col items-center leading-tight">
                        <span className="truncate text-base font-bold">{label}</span>
                        {league === 'nfl' && currentWeek?.detail && <span className="text-xs font-semibold text-muted">{currentWeek.detail}</span>}
                    </div>
                    <button
                        className={arrowClass}
                        aria-label={league === 'nba' ? 'Next day' : 'Next week'}
                        disabled={league === 'nfl' && !neighborWeek(1)}
                        onClick={() => league === 'nba' ? setDayOffset(dayOffset + 1) : stepWeek(1)}
                    >
                        <ChevronRight />
                    </button>
                </div>
            </div>

            <div className="flex flex-1 min-h-0 flex-col gap-2 overflow-y-auto pr-1">
                {scoreboard.status === 'loading' && <p className="py-6 text-center text-sm font-semibold text-muted">Loading scores…</p>}
                {scoreboard.status === 'error' && <p className="py-6 text-center text-sm font-semibold text-muted">Scores unavailable right now</p>}
                {board && sorted.length === 0 && (
                    <p className="py-6 text-center text-sm font-semibold text-muted">No games {league === 'nba' ? 'on this day' : 'this week'}</p>
                )}

                {favoriteGames.length > 0 && (
                    <>
                        <span className="text-xs font-bold uppercase tracking-wide text-muted">Favorites</span>
                        {favoriteGames.map(game => <GameCard key={game.id} game={game} league={league} favorites={favorites} />)}
                        {otherGames.length > 0 && <span className="mt-1 text-xs font-bold uppercase tracking-wide text-muted">All games</span>}
                    </>
                )}
                {otherGames.map(game => <GameCard key={game.id} game={game} league={league} favorites={favorites} />)}
            </div>
            </div>
        </div>
    )
}
