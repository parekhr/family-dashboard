import { useState } from 'react'
import { Check } from 'lucide-react'
import { Modal } from '../../components/Modal'
import { leagues, type League, type TeamInfo } from './espn'
import { useLeagueTeams } from './useLeagueTeams'
import { useSports } from './SportsContext'
import { ScrollArea } from '../../components/ScrollArea'

type FavoriteTeamsModalProps = {
    onClose: () => void
}

type Sort = 'az' | 'division'
const SORT_KEY = 'familyDashboard.teamSort'   // a viewing preference, so it's kept on this tablet only

function readSort(): Sort {
    try {
        return localStorage.getItem(SORT_KEY) === 'division' ? 'division' : 'az'
    } catch {
        return 'az'
    }
}

const leagueKeys = Object.keys(leagues) as League[]
const closeButtonClass = 'flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full bg-muted/15 text-lg hover:bg-muted/25 active:bg-muted/35 transition-colors'

// Opened by the star in the Sports widget's header: every team in a league as a grid of
// logos. Tapping one favorites it (saved right away); favorites' games show first.
export function FavoriteTeamsModal({ onClose }: FavoriteTeamsModalProps) {
    const { favorites, setFavorites } = useSports()
    const [league, setLeague] = useState<League>('nba')
    const [sort, setSort] = useState<Sort>(readSort)
    const teams = useLeagueTeams(league)

    function changeSort(next: Sort) {
        setSort(next)
        try { localStorage.setItem(SORT_KEY, next) } catch { /* not saved; still works for now */ }
    }

    function toggle(key: string) {
        setFavorites(favorites.includes(key) ? favorites.filter(other => other !== key) : [...favorites, key])
    }

    function tile(team: TeamInfo) {
        const on = favorites.includes(team.key)
        return (
            <button
                key={team.key}
                className={`relative flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl px-1 pb-2 pt-3 transition-colors ${on ? 'bg-primary/10 ring-2 ring-primary ring-inset' : 'bg-muted/10 hover:bg-muted/15'}`}
                aria-pressed={on}
                onClick={() => toggle(team.key)}
            >
                {on && (
                    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-white">
                        <Check size={13} strokeWidth={3} />
                    </span>
                )}
                {team.logo ? <img src={team.logo} alt="" className="h-10 w-10 object-contain" /> : <span className="h-10 w-10" />}
                {/* sized so the longest nicknames (Timberwolves, Trail Blazers) fit without "…" */}
                <span className="whitespace-nowrap text-[13px] font-semibold leading-tight">{team.name}</span>
            </button>
        )
    }

    // One division per row: NBA divisions have 5 teams, NFL divisions 4. A–Z uses the
    // same columns, so tiles stay the same size when switching sort
    function grid(list: TeamInfo[]) {
        return <div className={`grid gap-1.5 ${league === 'nba' ? 'grid-cols-5' : 'grid-cols-4'}`}>{list.map(tile)}</div>
    }

    let body
    if (teams.status === 'loading') body = <p className="py-6 text-center text-sm text-muted">Loading teams…</p>
    else if (teams.status === 'error') body = <p className="py-6 text-center text-sm text-muted">Couldn't load teams. Try again later.</p>
    else if (sort === 'az') body = grid([...teams.teams].sort((a, b) => a.fullName.localeCompare(b.fullName)))
    else {
        // divisions in the order ESPN lists them (conference by conference)
        const divisions = [...new Set(teams.teams.map(team => team.division))]
        body = divisions.map(division => (
            <div key={division} className="mb-3">
                <h4 className="mb-1.5 text-sm font-bold text-muted">{division}</h4>
                {grid(teams.teams.filter(team => team.division === division).sort((a, b) => a.fullName.localeCompare(b.fullName)))}
            </div>
        ))
    }

    // 620px wide so five tiles fit across with the longest name (Timberwolves)
    return (
        <Modal onClose={onClose} className="flex w-[620px] flex-col">
            <div className="flex items-center gap-2">
                <h3 className="flex-1 font-sports text-[28px] leading-none tracking-wide">Favorite teams</h3>
                <button className={closeButtonClass} aria-label="Close" onClick={onClose}>✕</button>
            </div>

            <div className="mt-4 flex gap-2">
                {leagueKeys.map(key => (
                    <button
                        key={key}
                        className={`h-11 flex-1 cursor-pointer rounded-full font-semibold transition-colors ${league === key ? 'bg-primary text-white' : 'bg-muted/15 text-ink hover:bg-muted/25'}`}
                        aria-pressed={league === key}
                        onClick={() => setLeague(key)}
                    >
                        {leagues[key].label}
                    </button>
                ))}
            </div>

            {/* sort: quieter than the league tabs so the two don't compete */}
            <div className="mt-3 flex justify-end">
                <div className="grid grid-cols-2 rounded-full border border-muted/30 p-0.5">
                    {([['az', 'A–Z'], ['division', 'Division']] as const).map(([key, text]) => (
                        <button
                            key={key}
                            className={`cursor-pointer rounded-full px-3 py-1 text-sm transition-colors ${sort === key ? 'bg-muted/15 font-bold text-ink' : 'text-muted'}`}
                            aria-pressed={sort === key}
                            onClick={() => changeSort(key)}
                        >
                            {text}
                        </button>
                    ))}
                </div>
            </div>

            <ScrollArea className="mt-2 h-[400px] p-0.5 pr-1">{body}</ScrollArea>
        </Modal>
    )
}
