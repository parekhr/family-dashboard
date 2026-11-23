import { useEffect, useState } from 'react'
import { fetchTeams, type League, type TeamInfo } from './espn'

// Teams barely change, so each league's list is fetched once per page load and shared
const cache = new Map<League, Promise<TeamInfo[]>>()

function loadTeams(league: League): Promise<TeamInfo[]> {
    let teams = cache.get(league)
    if (!teams) {
        teams = fetchTeams(league)
        teams.catch(() => cache.delete(league))   // let a later visit try again
        cache.set(league, teams)
    }
    return teams
}

// Every team in a league, with logo and division, for the Favorite teams page
export function useLeagueTeams(league: League) {
    const [result, setResult] = useState<{ league: League; teams?: TeamInfo[]; error?: boolean } | null>(null)

    useEffect(() => {
        let ignore = false
        loadTeams(league)
            .then(teams => { if (!ignore) setResult({ league, teams }) })
            .catch(error => {
                console.error(error)
                if (!ignore) setResult({ league, error: true })
            })
        return () => { ignore = true }
    }, [league])

    if (result?.league !== league) return { status: 'loading' as const }
    if (result.error || !result.teams) return { status: 'error' as const }
    return { status: 'ready' as const, teams: result.teams }
}
