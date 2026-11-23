// Reading ESPN's public scoreboard and team data.
// These feeds are what espn.com itself uses; they're free and need no key, but they're
// unofficial, so they could change without notice. Everything that knows their shape lives
// in this file, so if ESPN changes something only this file (and the Sports widget) breaks.

export type League = 'nba' | 'nfl'

export const leagues: Record<League, { label: string; path: string }> = {
    nba: { label: 'NBA', path: 'basketball/nba' },
    nfl: { label: 'NFL', path: 'football/nfl' },
}

const BASE = 'https://site.api.espn.com/apis/site/v2/sports'

// ---- What the app uses ----

export type GameTeam = {
    key: string            // 'nba:2': league + ESPN team id, the same key favorites use
    abbr: string
    name: string           // nickname, e.g. "Celtics"
    logo?: string
    score?: number
    periods: number[]      // points per quarter (plus overtimes), only once the game has started
    winner: boolean
}

export type Game = {
    id: string
    start: string                      // ISO date-time
    state: 'pre' | 'in' | 'post'
    detail: string                     // ESPN's short status, e.g. "2:31 - 4th", "Final/OT", "Postponed"
    period: number                     // current quarter while live
    broadcast?: string                 // TV channel(s), when ESPN lists them
    away: GameTeam
    home: GameTeam
}

// An NFL week (or a playoff round); the NFL tab steps through these instead of days
export type NflWeek = { seasonType: number; week: number; label: string; detail?: string }

export type Scoreboard = {
    games: Game[]
    // NFL only: every week of the season and which one this scoreboard is
    weeks?: NflWeek[]
    weekIndex?: number
    year?: number
}

export type TeamInfo = {
    key: string
    name: string           // nickname
    fullName: string       // "Boston Celtics": sorting A–Z by this puts them in city order
    logo?: string
    division: string
}

// ---- The parts of ESPN's JSON we read ----

type RawTeam = { id: string; abbreviation: string; shortDisplayName: string; displayName?: string; logo?: string; logos?: { href: string; rel?: string[] }[] }
type RawCompetitor = { homeAway: 'home' | 'away'; score?: string; winner?: boolean; linescores?: { value: number }[]; team: RawTeam }
type RawEvent = {
    id: string
    date: string
    status: { period: number; type: { state: 'pre' | 'in' | 'post'; shortDetail: string } }
    competitions: { competitors: RawCompetitor[]; broadcast?: string }[]
}
type RawCalendar = { label: string; value: string; entries?: { label: string; value: string; detail?: string }[] }
type RawScoreboard = {
    events?: RawEvent[]
    leagues?: { calendar?: RawCalendar[] | string[] }[]
    season?: { type: number; year: number }
    week?: { number: number }
}
type RawGroups = { groups?: { children?: { name: string; teams?: RawTeam[] }[] }[] }

function toGameTeam(league: League, raw: RawCompetitor, started: boolean): GameTeam {
    return {
        key: `${league}:${raw.team.id}`,
        abbr: raw.team.abbreviation,
        name: raw.team.shortDisplayName,
        logo: raw.team.logo,
        score: started && raw.score !== undefined ? Number(raw.score) : undefined,
        periods: started ? (raw.linescores ?? []).map(line => line.value) : [],
        winner: raw.winner === true,
    }
}

function toGame(league: League, raw: RawEvent): Game | null {
    const competition = raw.competitions[0]
    const away = competition?.competitors.find(c => c.homeAway === 'away')
    const home = competition?.competitors.find(c => c.homeAway === 'home')
    if (!away || !home) return null
    const state = raw.status.type.state
    const started = state !== 'pre'
    return {
        id: raw.id,
        start: raw.date,
        state,
        detail: raw.status.type.shortDetail,
        period: raw.status.period,
        broadcast: competition.broadcast?.trim() || undefined,
        away: toGameTeam(league, away, started),
        home: toGameTeam(league, home, started),
    }
}

// The NFL's preseason, regular season and playoffs as one list of weeks
function toWeeks(calendar: RawCalendar[]): NflWeek[] {
    return calendar
        .filter(part => ['1', '2', '3'].includes(part.value))
        .flatMap(part => (part.entries ?? []).map(entry => ({
            seasonType: Number(part.value),
            week: Number(entry.value),
            label: part.value === '1' ? `Preseason ${entry.label}` : entry.label,
            detail: entry.detail,
        })))
}

// `query` is the part after "?", e.g. "dates=20261123" or "seasontype=2&week=12&dates=2026";
// empty means ESPN's current day (NBA) or week (NFL)
export async function fetchScoreboard(league: League, query: string): Promise<Scoreboard> {
    const response = await fetch(`${BASE}/${leagues[league].path}/scoreboard${query ? `?${query}` : ''}`)
    if (!response.ok) throw new Error(`ESPN scoreboard: ${response.status}`)
    const raw: RawScoreboard = await response.json()

    const games = (raw.events ?? []).map(event => toGame(league, event)).filter((game): game is Game => game !== null)
    if (league !== 'nfl') return { games }

    const calendar = raw.leagues?.[0]?.calendar
    const weeks = Array.isArray(calendar) && typeof calendar[0] === 'object' ? toWeeks(calendar as RawCalendar[]) : []
    const weekIndex = weeks.findIndex(week => week.seasonType === raw.season?.type && week.week === raw.week?.number)
    return { games, weeks, weekIndex: weekIndex === -1 ? undefined : weekIndex, year: raw.season?.year }
}

export async function fetchTeams(league: League): Promise<TeamInfo[]> {
    const response = await fetch(`${BASE}/${leagues[league].path}/groups`)
    if (!response.ok) throw new Error(`ESPN teams: ${response.status}`)
    const raw: RawGroups = await response.json()
    return (raw.groups ?? []).flatMap(conference => (conference.children ?? []).flatMap(division =>
        (division.teams ?? []).map(team => ({
            key: `${league}:${team.id}`,
            name: team.shortDisplayName,
            fullName: team.displayName ?? team.shortDisplayName,
            logo: team.logos?.find(logo => logo.rel?.includes('default'))?.href ?? team.logos?.[0]?.href,
            division: division.name,
        }))
    ))
}
