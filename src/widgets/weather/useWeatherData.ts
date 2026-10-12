import forecastHourly from './mock/forecastHourly.json'
import forecast from './mock/forecast.json'
import alertsSevere from './mock/alertsSevere.json'

export type TimeOfDay = 'Morning' | 'Afternoon' | 'Evening' | 'Night'

export type CurrentWeather = {
    temperature: number
    condition: string
    high: number
    low: number
    isDaytime: boolean
}

export type DayForecast = {
    label: string
    high: number
    low: number
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

function getTimeOfDay(hour: number): TimeOfDay {
    if (hour >= 5 && hour < 12) return 'Morning'
    if (hour >= 12 && hour < 17) return 'Afternoon'
    if (hour >= 17 && hour < 21) return 'Evening'
    return 'Night'
}

const severityRank = {
    Extreme: 4,
    Severe: 3,
    Moderate: 2,
    Minor: 1,
    Unknown: 0,
}

export function useWeatherData(): WeatherData {
    const now = forecastHourly.properties.periods[0]
    const periods = forecast.properties.periods
    return {
        current: {
            temperature: now.temperature,
            condition: now.shortForecast,
            high: periods.find(period => period.isDaytime)?.temperature ?? now.temperature,
            low: periods.find(period => !period.isDaytime)?.temperature ?? now.temperature,
            isDaytime: now.isDaytime,
        },
        days: periods.filter(period => period.isDaytime).map((period, index) => {
            const date = new Date(period.startTime)
            const label = index === 0 ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })
            const night = periods.find(p => p.number === period.number + 1)
            return {
                label,
                high: period.temperature,
                low: night?.temperature ?? period.temperature,
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
        alerts: alertsSevere.features.map(feature => {
            return {
                title: feature.properties.event,
                severity: feature.properties.severity as WeatherAlert['severity'],
                description: feature.properties.description,
                start: feature.properties.onset,
                end: feature.properties.ends ?? undefined,
                expires: feature.properties.expires,
                instruction: feature.properties.instruction ?? undefined,
            }
        }).sort((a, b) => severityRank[b.severity] - severityRank[a.severity])
    }
}