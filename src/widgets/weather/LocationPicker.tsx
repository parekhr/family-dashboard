import { useState, useEffect } from 'react'
import { Check, Search } from 'lucide-react'
import { Modal } from '../../components/Modal'
import type { Location } from '../../hooks/useHouseholdData'
import { searchLocations } from './searchLocations'

type LocationPickerProps = {
    current: Location | undefined
    onChoose: (location: Location) => void
    onClose: () => void
}

export function LocationPicker({ current, onChoose, onClose }: LocationPickerProps) {
    const [query, setQuery] = useState('')

    const [results, setResults] = useState<Location[] | null>(null)
    const [failed, setFailed] = useState(false)

    useEffect(() => {
        const text = query.trim()
        if (text.length < 2) return

        let stale = false
        const timer = setTimeout(() => {
            searchLocations(text)
                .then(places => {
                    if (stale) return
                    setResults(places)
                    setFailed(false)
                })
                .catch(() => {
                    if (!stale) setFailed(true)
                })
        }, 300)

        return () => {
            stale = true
            clearTimeout(timer)
        }
    }, [query])

    return (
        <Modal onClose={onClose} className="w-[420px]">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold">Weather location</h3>
                <button
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-muted/15 text-lg hover:bg-muted/25 active:bg-muted/35 transition-colors"
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>

            <label className="mt-4 flex items-center gap-2 rounded-xl border border-muted/30 bg-white px-3 py-2">
                <Search className="h-4 w-4 text-muted" />
                <input
                    className="w-full bg-transparent text-sm outline-none"
                    placeholder="ZIP code or city"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    autoFocus
                />
            </label>
            <p className="mt-2 text-xs text-muted">US only. Currently {current?.name ?? 'not set'}.</p>
            <div className="mt-3 flex h-[220px] flex-col gap-1.5 overflow-y-auto">
                {query.trim().length >= 2 && (
                    <>
                        {failed && <p className="text-sm text-muted">Couldn't search right now. Try again in a moment.</p>}
                        {!failed && results?.length === 0 && <p className="text-sm text-muted">No US places match.</p>}
                        {!failed && results?.map(place => (
                            <button
                                key={`${place.latitude},${place.longitude}`}
                                className="flex cursor-pointer items-center justify-between rounded-xl bg-muted/10 px-3 py-2.5 text-left text-sm font-semibold hover:bg-muted/20"
                                onClick={() => {
                                    onChoose(place)
                                    onClose()
                                }}
                            >
                                {place.name}
                                {place.name === current?.name && <Check className="h-4 w-4 text-primary" />}
                            </button>
                        ))}
                    </>
                )}
            </div>
            {/* Open-Meteo credits */}
            <p className="mt-3 text-center text-[11px] text-muted">
                Location search by <a href="https://open-meteo.com/" target="_blank" rel="noreferrer" className="underline">Open-Meteo</a>, data from GeoNames
            </p>
        </Modal>
    )
}