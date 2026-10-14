import hourlyMock from './mock/forecastHourly.json'
import forecastMock from './mock/forecast.json'
import alertsMock from './mock/alertsSevere.json'
import { useEffect, useState } from 'react'
import useHouseholdData from '../../hooks/useHouseholdData'
import { getTodayISO, toISO } from '../../lib/dates'

type ForecastResponse = typeof forecastMock
type HourlyResponse = typeof hourlyMock
type AlertsResponse = typeof alertsMock

export type WeatherState =
    | { status: 'loading' }
    | { status: 'noLocation' }
    | { status: 'error' }
    | { status: 'ready'; data: WeatherData }

export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night'

export type CurrentWeather = {
    temperature: number
    condition: string
    high?: number
    low: number
    isDaytime: boolean
}

export type DayForecast = {
    label: string
    high: number
    low?: number
    condition: string
    rainChance: number
}

export type HourForecast = {
    label: string
    temperature: number
    condition: string
    rainChance: number
    timeOfDay: TimeOfDay
    isDaytime: boolean
}

export type WeatherAlert = {
    title: string
    severity: 'Extreme' | 'Severe' | 'Moderate' | 'Minor' | 'Unknown'
    description: string
    start: string
    end?: string
    expires: string
    instruction?: string
}

export type WeatherData = {
    current: CurrentWeather
    days: DayForecast[]
    hours: HourForecast[]
    alerts: WeatherAlert[]
}

const severityRank = {
    Extreme: 4,
    Severe: 3,
    Moderate: 2,
    Minor: 1,
    Unknown: 0,
}

function getTimeOfDay(hour: number): TimeOfDay {
    if (hour >= 5 && hour < 12) return 'Morning'
    if (hour >= 12 && hour < 17) return 'Afternoon'
    if (hour >= 17 && hour < 21) return 'Evening'
    return 'Night'
}

async function fetchJson(url: string) {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`NWS request failed (${response.status})`)
    return response.json()
}

async function fetchWeather(latitude: number, longitude: number) {
    const point = `${latitude},${longitude}`
    const points = await fetchJson(`https://api.weather.gov/points/${point}`)

    const [forecast, forecastHourly, alerts] = await Promise.all([
        fetchJson(points.properties.forecast),
        fetchJson(points.properties.forecastHourly),
        fetchJson(`https://api.weather.gov/alerts/active?point=${point}`),
    ])

    return { forecast, forecastHourly, alerts }
}

function buildWeatherData(forecast: ForecastResponse, forecastHourly: HourlyResponse, alerts: AlertsResponse): WeatherData {
    const isToday = (time: string) => toISO(new Date(time)) === getTodayISO()
    const now = forecastHourly.properties.periods[0]
    const periods = forecast.properties.periods

    return {
        current: {
            temperature: now.temperature,
            condition: now.shortForecast,
            high: periods.find(period => period.isDaytime && isToday(period.startTime))?.temperature,
            low: periods.find(period => !period.isDaytime)?.temperature ?? now.temperature,
            isDaytime: now.isDaytime,
        },
        days: periods.filter(period => period.isDaytime).map((period, index) => {
            const date = new Date(period.startTime)
            const label = isToday(period.startTime) ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })
            const night = periods.find(p => p.number === period.number + 1)
            return {
                label,
                high: period.temperature,
                low: night?.temperature,
                condition: period.shortForecast,
                rainChance: period.probabilityOfPrecipitation.value ?? 0,
            }
        }),
        hours: forecastHourly.properties.periods.slice(0, 24).map(period => {
            const hour = Number(period.startTime.slice(11, 13))
            const hour12 = hour % 12 || 12
            const ampm = hour >= 12 ? 'PM' : 'AM'
            return {
                label: `${hour12} ${ampm}`,
                temperature: period.temperature,
                condition: period.shortForecast,
                rainChance: period.probabilityOfPrecipitation.value ?? 0,
                timeOfDay: getTimeOfDay(hour),
                isDaytime: period.isDaytime,
            }
        }),
        alerts: alerts.features.map(feature => {
            return {
                title: feature.properties.event,
                severity: feature.properties.severity as WeatherAlert['severity'],
                description: feature.properties.description,
                start: feature.properties.onset,
                end: feature.properties.ends ?? undefined,
                expires: feature.properties.expires,
                instruction: feature.properties.instruction ?? undefined,
            }
        }).sort((a, b) => severityRank[b.severity] - severityRank[a.severity]),
    }
}

export function useWeatherData(): WeatherState {
    const location = useHouseholdData().location
    const [state, setState] = useState<WeatherState>({ status: 'loading' })

    useEffect(() => {
        if (!location) return
        const { latitude, longitude } = location

        function load() {
            fetchWeather(latitude, longitude)
                .then(raw => setState({ status: 'ready', data: buildWeatherData(raw.forecast, raw.forecastHourly, raw.alerts) }))
                .catch(() => setState(previous => previous.status === 'ready' ? previous : { status: 'error' }))
        }

        function loadIfVisible() {
            if (document.visibilityState === 'visible') load()
        }

        load()
        const timer = setInterval(load, 10 * 60_000)
        document.addEventListener('visibilitychange', loadIfVisible)

        return () => {
            clearInterval(timer)
            document.removeEventListener('visibilitychange', loadIfVisible)
        }
    }, [location?.latitude, location?.longitude])

    if (!location) return { status: 'noLocation' }
    return state
}

