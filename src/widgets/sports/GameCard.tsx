import { Star } from 'lucide-react'
import type { Game, GameTeam, League } from './espn'

type GameCardProps = {
    game: Game
    league: League
    favorites: string[]
}

// Column headings for the quarter-by-quarter table: 1–4, then OT, 2OT, ... only when played
function periodLabels(count: number): string[] {
    return Array.from({ length: Math.max(4, count) }, (_, i) => i < 4 ? String(i + 1) : i === 4 ? 'OT' : `${i - 3}OT`)
}

function formatStart(iso: string, league: League): string {
    const date = new Date(iso)
    const time = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    // NFL lists a whole week, so the day matters; NBA lists one day
    return league === 'nfl' ? `${date.toLocaleDateString('en-US', { weekday: 'short' })} ${time}` : time
}

function TeamLabel({ team, favorite }: { team: GameTeam; favorite: boolean }) {
    return (
        <span className="flex min-w-0 items-center gap-2">
            {team.logo
                ? <img src={team.logo} alt="" className="h-6 w-6 shrink-0 object-contain" />
                : <span className="h-6 w-6 shrink-0" />}
            <span className="truncate font-semibold">{team.name}</span>
            {favorite && <Star className="h-3 w-3 shrink-0 text-amber-500" fill="currentColor" aria-label="Favorite" />}
        </span>
    )
}

// One game: before it starts, the teams with the start time and channel; once it has
// started, a small table of points per quarter with the total. Results only, no stats.
export function GameCard({ game, league, favorites }: GameCardProps) {
    const { away, home } = game
    const isFavorite = (team: GameTeam) => favorites.includes(team.key)

    if (game.state === 'pre') {
        return (
            <div className="flex items-center gap-3 rounded-2xl bg-card px-3 py-2 shadow-sm">
                <div className="flex min-w-0 flex-1 flex-col gap-1.5 text-sm">
                    <TeamLabel team={away} favorite={isFavorite(away)} />
                    <TeamLabel team={home} favorite={isFavorite(home)} />
                </div>
                <div className="flex shrink-0 flex-col items-end text-right">
                    <span className="text-sm font-bold tabular-nums">{formatStart(game.start, league)}</span>
                    {game.broadcast && <span className="text-xs font-semibold text-muted">{game.broadcast}</span>}
                </div>
            </div>
        )
    }

    const labels = periodLabels(Math.max(away.periods.length, home.periods.length))
    const live = game.state === 'in'
    const currentPeriod = live ? game.period - 1 : -1   // highlighted column while live
    // a finished game greys out the loser (both stay dark for a tie or a game with no result)
    const lost = (team: GameTeam, other: GameTeam) => game.state === 'post' && other.winner && !team.winner

    function row(team: GameTeam, other: GameTeam) {
        const dim = lost(team, other)
        return (
            <tr className={dim ? 'text-muted' : ''}>
                <td className="py-0.5 pr-2"><TeamLabel team={team} favorite={isFavorite(team)} /></td>
                {labels.map((_, i) => (
                    <td key={i} className={`text-center text-xs tabular-nums ${i === currentPeriod ? 'font-bold text-red-600' : 'text-muted'}`}>
                        {team.periods[i] ?? '–'}
                    </td>
                ))}
                <td className={`text-center font-sports text-[22px] leading-none tracking-wide ${dim ? 'text-muted' : ''}`}>{team.score ?? '–'}</td>
            </tr>
        )
    }

    // Three rows. The header's first cell says "Live" with the clock while a game is on.
    // A finished game shows nothing there (the scores speak for themselves), except an
    // unusual ending ESPN reports instead of "Final", like "Postponed" or "Canceled".
    const status = live
        ? <><span className="text-red-600">Live</span> <span className="tabular-nums">{game.detail}</span></>
        : game.detail.startsWith('Final') ? null : game.detail

    return (
        <div className="rounded-2xl bg-card px-3 py-2 shadow-sm">
            <table className="w-full table-fixed text-sm">
                <colgroup>
                    <col />
                    {labels.map((_, i) => <col key={i} className="w-7" />)}
                    <col className="w-11" />
                </colgroup>
                <thead>
                    <tr className="text-xs font-bold text-ink">
                        {/* the live status on the left; a "Q" on the right, labelling the
                            quarter columns that follow (1 2 3 4, then OT if there was one) */}
                        <th className="pr-1 text-xs font-semibold text-muted">
                            <span className="flex items-center justify-between gap-2">
                                <span className="truncate text-left">{status}</span>
                                <span className="shrink-0 font-bold text-ink">Q</span>
                            </span>
                        </th>
                        {labels.map(label => <th key={label} className="text-center font-bold">{label}</th>)}
                        {/* centered over the totals, which are centered too */}
                        <th className="text-center font-bold">T</th>
                    </tr>
                </thead>
                <tbody>
                    {row(away, home)}
                    {row(home, away)}
                </tbody>
            </table>
        </div>
    )
}
