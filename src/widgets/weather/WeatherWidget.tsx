import { ChevronDown, ChevronLeft, ChevronRight, Droplet, MapPin, Snowflake } from 'lucide-react'
import { useWeatherData } from './useWeatherData'
import { getWeatherIcon } from './weatherIcons'
import { useState } from 'react'
import { useNow } from '../../hooks/useNow'
import { AlertsModal } from './AlertsModal'
import { getAlertTiming, isAlertActive } from './alertTiming'
import { severityColors } from './alertColors'
import { getBackgroundKind, WeatherBackground } from './WeatherBackground'
import { useHouseholdData, type Location } from '../../hooks/useHouseholdData'
import { LocationPicker } from './LocationPicker'
import { supabase } from '../../lib/supabaseClient'

const timeOfDayTints = {
    Morning: '#FCE4A0',
    Afternoon: '#BEDFF4',
    Evening: '#F4C6B4',
    Night: '#BFC4EA',
}

const iconOutline = 'drop-shadow-[0_0_1px_rgba(0,0,0,0.9)]'

const soonMessages = {
    thunder: 'Chance of storms soon',
    snow: 'Chance of snow soon',
    rain: 'Chance of rain soon',
}

const statusMessages = {
    loading: 'Loading weather…',
    error: "Couldn't load the weather.",
}

function shortCondition(condition: string) {
    return condition.split(' then ')[0].replace('Slight Chance ', '').replace('Chance ', '').replace(' Likely', '')
}

export function WeatherWidget() {
    const [view, setView] = useState<'hourly' | 'weekly'>('hourly')
    const [pageNumber, setPageNumber] = useState(0)
    const [showAlertsModal, setShowAlertsModal] = useState(false)
    const household = useHouseholdData()
    const [location, setLocation] = useState(household.location)
    const [showLocationPicker, setShowLocationPicker] = useState(false)

    const start = pageNumber * 6
    const state = useWeatherData(location)
    const now = useNow()

    function handleChooseLocation(place: Location) {
        setLocation(place)
        supabase.from('households')
            .update({
                location_name: place.name,
                latitude: place.latitude,
                longitude: place.longitude,
            })
            .eq('id', household.id)
            .then(({ error }) => { if (error) console.error(error) })
    }

    if (state.status !== 'ready') {
        return (
            <div className="flex flex-1 min-h-0 items-center justify-center rounded-3xl bg-muted/15 text-sm font-semibold text-muted">
                {state.status === 'noLocation' ? (
                    <button
                        className="flex cursor-pointer items-center gap-1.5 rounded-full bg-card px-4 py-2 text-ink shadow-sm hover:brightness-95"
                        onClick={() => setShowLocationPicker(true)}
                    >
                        <MapPin className="h-4 w-4 text-primary" />
                        Set a location to see the weather
                    </button>
                ) : (
                    statusMessages[state.status]
                )}
                {showLocationPicker && (
                    <LocationPicker
                        current={location}
                        onChoose={handleChooseLocation}
                        onClose={() => setShowLocationPicker(false)}
                    />
                )}
            </div>
        )
    }

    const weather = state.data
    const nowIcon = getWeatherIcon(weather.current.condition, weather.current.isDaytime)
    const pageCount = Math.ceil(weather.hours.length / 6)
    const soonText = `${weather.hours[0].condition} ${weather.hours[1].condition}`.toLowerCase()
    const soonKind = soonText.includes('thunder') ? 'thunder' : soonText.includes('snow') ? 'snow' : 'rain'
    const soonIcon = getWeatherIcon(soonKind, true)
    const precipSoon = weather.hours[0].rainChance >= 30 || weather.hours[1].rainChance >= 30
    const activeAlerts = weather.alerts.filter(alert => isAlertActive(alert, now))
    const topAlert = activeAlerts[0]
    const extraAlerts = activeAlerts.length - 1

    return (
        <div className="relative flex flex-col flex-1 min-h-0 gap-2.5 rounded-3xl overflow-hidden p-3 pb-5 text-ink bg-muted/15">
            <WeatherBackground kind={getBackgroundKind(weather.current.condition, weather.hours[0].rainChance)} />
            {/* top row: now (left), alert (middle), hourly/weekly switch (right) */}
            <div className="relative flex h-14 shrink-0 items-center justify-between">
                {/* Now card */}
                <div className="flex h-full w-[400px] shrink-0 items-center gap-3 rounded-2xl bg-card px-4 shadow-sm">
                    <img src={nowIcon.animated} className={`h-12 w-12 shrink-0 ${nowIcon.outline ? iconOutline : ''}`} alt="" />
                    <span className="text-5xl font-bold leading-none tabular-nums">
                        {weather.current.temperature}°
                    </span>
                    <div className="flex min-w-0 flex-col leading-tight">
                        <span className="truncate text-sm font-bold text-primary">{weather.current.condition}</span>
                        <span className="text-xs font-semibold text-muted">
                            {weather.current.high !== undefined && `H ${weather.current.high}°  `}L {weather.current.low}°
                        </span>
                        {precipSoon && (
                            <span className="flex items-center gap-1 text-xs font-bold text-sky-600">
                                <img src={soonIcon.animated} className={`-my-2 -ml-1 h-7 w-7 shrink-0 ${iconOutline}`} alt="" />
                                {soonMessages[soonKind]}
                            </span>
                        )}
                    </div>
                </div>
                {/* alert */}
                {topAlert && (
                    <button
                        className="absolute left-1/2 flex h-full w-[260px] -translate-x-1/2 cursor-pointer items-center justify-center rounded-2xl transition px-3 hover:brightness-95 gap-2"
                        style={{ backgroundColor: `color-mix(in srgb, ${severityColors[topAlert.severity]} 75%, white)` }}
                        onClick={() => setShowAlertsModal(true)}
                    >
                        <div className="flex flex-col">
                            <span className="text-sm font-bold leading-tight truncate">{topAlert.title}</span>
                            <span className="text-xs font-semibold leading-tight text-muted">{getAlertTiming(topAlert, now)}</span>
                        </div>
                        {extraAlerts > 0 && (
                            <span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/10 px-3 py-0.5 text-xs font-bold tabular-nums">
                                +{extraAlerts}
                            </span>
                        )}
                    </button>
                )}
                {/* alerts modal */}
                {showAlertsModal && (
                    <AlertsModal
                        onClose={() => setShowAlertsModal(false)}
                        alerts={activeAlerts}
                        now={now}
                    />
                )}
                {showLocationPicker && (
                    <LocationPicker
                        current={location}
                        onChoose={handleChooseLocation}
                        onClose={() => setShowLocationPicker(false)}
                    />
                )}
                {/* location and hourly/weekly switch, together at the right end */}
                <div className="flex items-center gap-2">
                    <button
                        className="flex cursor-pointer items-center gap-1 rounded-full px-2 py-1 text-sm font-semibold hover:bg-muted/15"
                        onClick={() => setShowLocationPicker(true)}
                    >
                        <MapPin className="h-3.5 w-3.5 text-primary" />
                        {location?.name}
                        <ChevronDown className="h-3.5 w-3.5 text-muted" />
                    </button>

                    <div className="relative grid h-9 w-[190px] shrink-0 grid-cols-2 rounded-full bg-muted/15 p-1">
                        {/* sliding highlight */}
                        <div
                            className={`absolute inset-y-1 left-1 w-[calc(50%-0.25rem)] rounded-full bg-primary transition-transform duration-200 ${view === 'weekly' ? 'translate-x-full' : ''}`}
                        />
                        <button
                            className={`relative z-10 rounded-full text-sm font-bold cursor-pointer transition-colors ${view === 'hourly' ? 'text-white' : 'text-muted'}`}
                            onClick={() => setView('hourly')}
                        >
                            Hourly
                        </button>
                        <button
                            className={`relative z-10 rounded-full text-sm font-bold cursor-pointer transition-colors ${view === 'weekly' ? 'text-white' : 'text-muted'}`}
                            onClick={() => setView('weekly')}
                        >
                            Weekly
                        </button>
                    </div>
                </div>
            </div>

            {/* bottom row: seven forecast cards (days or hours) */}
            <div className="flex flex-1 min-h-0 gap-2.5 relative">
                {view === 'weekly' && weather.days.map(day => {
                    const icon = getWeatherIcon(day.condition, true)
                    const isSnow = day.condition.toLowerCase().includes('snow')
                    return (
                        <div key={day.label} className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-2xl bg-card shadow-sm p-1.5 pt-2">
                            <span className="text-sm font-bold leading-none">{day.label}</span>
                            <img src={icon.still} className={`h-8 w-8 shrink-0 ${icon.outline ? iconOutline : ''}`} alt="" />
                            <span className="-mb-1 w-full truncate px-1 pb-1 text-center text-sm font-semibold leading-none text-muted">{shortCondition(day.condition)}</span>
                            <span className="text-lg font-bold leading-none tabular-nums">
                                {day.high}°{day.low !== undefined && <span className="text-sm font-semibold text-muted"> / {day.low}°</span>}
                            </span>
                            <span className="flex items-center gap-0.5 text-xs font-semibold leading-none text-sky-600 tabular-nums">
                                {isSnow ? <Snowflake className="h-3 w-3" /> : <Droplet className="h-3 w-3" fill="currentColor" />}
                                {day.rainChance}%
                            </span>
                        </div>
                    )
                })}

                {view === 'hourly' && (
                    <>
                        {/* previous page */}
                        <button
                            className="flex h-8 w-8 shrink-0 self-center items-center justify-center rounded-full bg-card shadow-sm cursor-pointer disabled:cursor-default disabled:opacity-30 enabled:hover:bg-card/50"
                            onClick={() => setPageNumber(pageNumber - 1)}
                            disabled={pageNumber === 0}
                            aria-label="Earlier hours"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>

                        {weather.hours.slice(start, start + 6).map(hour => {
                            const icon = getWeatherIcon(hour.condition, hour.isDaytime)
                            const isSnow = hour.condition.toLowerCase().includes('snow')
                            const tint = timeOfDayTints[hour.timeOfDay]
                            return (
                                <div key={hour.label} style={{ backgroundColor: `color-mix(in srgb, ${tint} 30%, white)` }} className="flex min-w-0 flex-1 flex-col items-center justify-between gap-1 overflow-hidden rounded-2xl pb-1.5 shadow-sm">
                                    <span style={{ backgroundColor: tint }} className="w-full py-1 text-center text-sm font-bold leading-none">
                                        {hour.label}
                                    </span>
                                    <img src={icon.still} className={`h-8 w-8 shrink-0 ${icon.outline ? iconOutline : ''}`} alt="" />
                                    <span className="-mb-1 w-full truncate px-1 pb-1 text-center text-sm font-semibold leading-none text-muted">{shortCondition(hour.condition)}</span>
                                    <span className="text-lg font-bold leading-none tabular-nums">
                                        {hour.temperature}°
                                    </span>
                                    <span className="flex items-center gap-0.5 text-xs font-semibold leading-none text-sky-600 tabular-nums">
                                        {isSnow ? <Snowflake className="h-3 w-3" /> : <Droplet className="h-3 w-3" fill="currentColor" />}
                                        {hour.rainChance}%
                                    </span>
                                </div>
                            )
                        })}

                        {/* next page */}
                        <button
                            className="flex h-8 w-8 shrink-0 self-center items-center justify-center rounded-full bg-card shadow-sm cursor-pointer disabled:cursor-default disabled:opacity-30 enabled:hover:bg-card/50"
                            onClick={() => setPageNumber(pageNumber + 1)}
                            disabled={pageNumber === pageCount - 1}
                            aria-label="Later hours"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </>
                )}
            </div>

            {/* page dots, in the bottom padding */}
            {view === 'hourly' && (
                <div className="absolute inset-x-0 bottom-[7px] flex justify-center gap-1.5">
                    {Array.from({ length: pageCount }, (_, index) => (
                        <span
                            key={index}
                            className={`h-1.5 w-1.5 rounded-full ${index === pageNumber ? 'bg-primary' : 'bg-muted/40'}`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}