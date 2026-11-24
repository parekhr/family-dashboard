import { useEffect, useRef, useState } from 'react'

const CHECK_EVERY_MS = 15 * 60_000     // how often to ask whether a new version is live
const IDLE_BEFORE_RELOAD_MS = 3 * 60_000   // never reload while someone's using the screen
const NIGHTLY_HOUR = 3                 // and reload once a night anyway, around 3 AM

// Keeps a wall tablet on the latest version without anyone touching it.
// - Every 15 minutes it fetches /version.json (written by each build, see vite.config.ts).
//   If the live build ID differs from the one this page was built with, an update has
//   been deployed.
// - Once a night (3 AM) it also reloads whether or not there's an update: a backup for a
//   missed check (wifi down), and a fresh start for a browser that runs for weeks.
// Either way it waits until the screen has gone untouched for 3 minutes, then reloads.
// Off while developing (`npm run dev` already reloads on its own and has no version.json).
export function useAutoReload() {
    const lastTouch = useRef(0)   // set when the page starts (below) and on every touch
    const [reloadWanted, setReloadWanted] = useState(false)

    // remember the last time anyone touched or typed
    useEffect(() => {
        const touched = () => { lastTouch.current = Date.now() }
        touched()   // count opening the page as a touch
        const events = ['pointerdown', 'touchstart', 'keydown'] as const
        events.forEach(name => window.addEventListener(name, touched, { passive: true }))
        return () => events.forEach(name => window.removeEventListener(name, touched))
    }, [])

    // check for a new version
    useEffect(() => {
        if (import.meta.env.DEV) return
        async function check() {
            try {
                const response = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' })
                if (!response.ok) return
                const live: { buildId?: string } = await response.json()
                if (live.buildId && live.buildId !== __BUILD_ID__) setReloadWanted(true)
            } catch {
                // offline or a hiccup: try again next time
            }
        }
        const timer = setInterval(check, CHECK_EVERY_MS)
        return () => clearInterval(timer)
    }, [])

    // the nightly reload
    useEffect(() => {
        if (import.meta.env.DEV) return
        const next = new Date()
        next.setHours(NIGHTLY_HOUR, 0, 0, 0)
        if (next.getTime() <= Date.now()) next.setDate(next.getDate() + 1)
        const timer = setTimeout(() => setReloadWanted(true), next.getTime() - Date.now())
        return () => clearTimeout(timer)
    }, [])

    // when a reload is wanted, do it as soon as the screen has been left alone
    useEffect(() => {
        if (!reloadWanted) return
        const timer = setInterval(() => {
            if (Date.now() - lastTouch.current >= IDLE_BEFORE_RELOAD_MS) window.location.reload()
        }, 15_000)
        return () => clearInterval(timer)
    }, [reloadWanted])
}
