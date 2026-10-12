import { ChevronLeft, ChevronRight, Droplet, Snowflake } from 'lucide-react'
import { useWeatherData, type WeatherAlert } from './useWeatherData'
import { getWeatherIcon } from './weatherIcons'
import { useState } from 'react'
import { useNow } from '../../hooks/useNow'
import { AlertsModal } from './AlertsModal'
import { getAlertTiming } from './alertTiming'
import { severityColors } from './alertColors'

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

export function WeatherWidget() {
    const [view, setView] = useState<'hourly' | 'weekly'>('hourly')
    const [pageNumber, setPageNumber] = useState(0)
    const [showAlertsModal, setShowAlertsModal] = useState(false)
    const start = pageNumber * 6

    const weather = useWeatherData()
    const now = useNow()
    const nowIcon = getWeatherIcon(weather.current.condition, weather.current.isDaytime)
    const pageCount = Math.ceil(weather.hours.length / 6)
    const soonText = `${weather.hours[0].condition} ${weather.hours[1].condition}`.toLowerCase()
    const soonKind = soonText.includes('thunder') ? 'thunder' : soonText.includes('snow') ? 'snow' : 'rain'
    const soonIcon = getWeatherIcon(soonKind, true)
    const precipSoon = weather.hours[0].rainChance >= 30 || weather.hours[1].rainChance >= 30
    const topAlert = weather.alerts[0]
    const extraAlerts = weather.alerts.length - 1

    return (
        <div className="relative flex flex-col flex-1 min-h-0 gap-2.5 rounded-3xl overflow-hidden p-3 pb-5 text-ink bg-muted/15">
            {/* top row: now (left), alert (middle), hourly/weekly switch (right) */}
            <div className="relative flex h-14 shrink-0 items-center justify-between">
                {/* Now card */}
                <div className="flex h-full w-[320px] shrink-0 items-center gap-3 rounded-2xl bg-card px-4 shadow-sm">
                    <img src={nowIcon.animated} className={`h-12 w-12 shrink-0 ${nowIcon.outline ? iconOutline : ''}`} alt="" />
                    <span className="text-5xl font-bold leading-none tabular-nums">
                        {weather.current.temperature}°
                    </span>
                    <div className="flex flex-col leading-tight">
                        <span className="text-sm font-bold">{weather.current.condition}</span>
                        <span className="text-xs font-semibold text-muted">
                            H {weather.current.high}°  L {weather.current.low}°
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
                {showAlertsModal && <AlertsModal onClose={() => setShowAlertsModal(false)} alerts={weather.alerts} now={now} />}
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

            {/* bottom row: seven forecast cards (days or hours) */}
            <div className="flex flex-1 min-h-0 gap-2.5">
                {view === 'weekly' && weather.days.map(day => {
                    const icon = getWeatherIcon(day.condition, true)
                    const isSnow = day.condition.toLowerCase().includes('snow')
                    return (
                        <div key={day.label} className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl bg-card shadow-sm p-1.5 pt-2">
                            <span className="text-sm font-bold leading-none">{day.label}</span>
                            <img src={icon.still} className={`h-8 w-8 shrink-0 ${icon.outline ? iconOutline : ''}`} alt="" />
                            <span className="text-sm font-semibold leading-none text-muted">{day.condition}</span>
                            <span className="text-lg font-bold leading-none tabular-nums">
                                {day.high}° <span className="text-sm font-semibold text-muted">/ {day.low}°</span>
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
                            className="flex h-8 w-8 shrink-0 self-center items-center justify-center rounded-full bg-card shadow-sm cursor-pointer disabled:cursor-default disabled:opacity-30 hover:bg-card/50"
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
                                <div key={hour.label} style={{ backgroundColor: `color-mix(in srgb, ${tint} 30%, white)` }} className="flex flex-1 flex-col items-center justify-between gap-1 overflow-hidden rounded-2xl pb-1.5 shadow-sm">
                                    <span style={{ backgroundColor: tint }} className="w-full py-1 text-center text-sm font-bold leading-none">
                                        {hour.label}
                                    </span>
                                    <img src={icon.still} className={`h-8 w-8 shrink-0 ${icon.outline ? iconOutline : ''}`} alt="" />
                                    <span className="text-sm font-semibold leading-none text-muted">{hour.condition}</span>
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
                            className="flex h-8 w-8 shrink-0 self-center items-center justify-center rounded-full bg-card shadow-sm cursor-pointer disabled:cursor-default disabled:opacity-30 hover:bg-card/50"
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