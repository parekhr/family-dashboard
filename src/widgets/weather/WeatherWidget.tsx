import { ChevronLeft, ChevronRight, Droplet, Snowflake } from 'lucide-react'
import { useWeatherData } from './useWeatherData'
import { getWeatherIcon } from './weatherIcons'
import { useState } from 'react'

export function WeatherWidget() {
    const [view, setView] = useState<'hourly' | 'weekly'>('hourly')
    const [pageNumber, setPageNumber] = useState(0)
    const start = pageNumber * 6

    const weather = useWeatherData()
    const nowIcon = getWeatherIcon(weather.current.condition, weather.current.isDaytime)
    const pageCount = Math.ceil(weather.hours.length / 6)

    return (
        <div className="relative flex flex-col flex-1 min-h-0 gap-2.5 rounded-3xl overflow-hidden bg-card p-3 pb-5 text-ink bg-muted/15">

            {/* top row: now (left), alert (middle), hourly/weekly switch (right) */}
            <div className="flex h-14 shrink-0 items-center justify-between">
                {/* Now card */}
                <div className="flex h-full w-[320px] shrink-0 items-center gap-3 rounded-2xl bg-card px-4 shadow-sm">
                    <img src={nowIcon.animated} className="h-12 w-12 shrink-0" alt="" />
                    <span className="text-5xl font-bold leading-none tabular-nums">
                        {weather.current.temperature}°
                    </span>
                    <div className="flex flex-col leading-tight">
                        <span className="text-sm font-bold">{weather.current.condition}</span>
                        <span className="text-xs font-semibold text-muted">
                            H {weather.current.high}°  L {weather.current.low}°
                        </span>
                    </div>
                </div>
                <div className="flex h-full w-[220px] items-center justify-center rounded-2xl bg-yellow-100">Alert</div>
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
                        <div key={day.label} className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl bg-card p-1.5 shadow-sm pt-2">
                            <span className="text-sm font-bold leading-none">{day.label}</span>
                            <img src={icon.still} className="h-8 w-8 shrink-0" alt="" />
                            <span className="text-sm font-semibold text-muted">{day.condition}</span>
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
                            className="flex h-8 w-8 shrink-0 self-center items-center justify-center rounded-full rounded-2xl bg-card shadow-sm cursor-pointer disabled:cursor-default disabled:opacity-30 hover:bg-card/50"
                            onClick={() => setPageNumber(pageNumber - 1)}
                            disabled={pageNumber === 0}
                        >
                            <ChevronLeft className="h-5 w-5 hover" />
                        </button>

                        {weather.hours.slice(start, start + 6).map(hour => {
                            const icon = getWeatherIcon(hour.condition, hour.isDaytime)
                            const isSnow = hour.condition.toLowerCase().includes('snow')
                            return (
                                <div key={hour.label} className="flex flex-1 flex-col items-center justify-center gap-1 rounded-2xl bg-card p-1.5 shadow-sm pt-2">
                                    <span className="text-sm font-bold leading-none">{hour.label}</span>
                                    <img src={icon.still} className="h-8 w-8 shrink-0" alt="" />
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
                            className="flex h-8 w-8 shrink-0 self-center items-center justify-center rounded-full rounded-2xl bg-card shadow-sm cursor-pointer disabled:cursor-default disabled:opacity-30 hover:bg-card/50"
                            onClick={() => setPageNumber(pageNumber + 1)}
                            disabled={pageNumber === pageCount - 1}
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