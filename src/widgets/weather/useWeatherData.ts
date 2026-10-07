import forecastHourly from './mock/forecastHourly.json'
import forecast from './mock/forecast.json'

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
        alerts: [
            {
                title: 'Heat Advisory',
                severity: 'Moderate',
                description: 'High temperatures expected throughout the day.',
                start: '2024-06-01T10:00:00Z',
                end: '2024-06-01T18:00:00Z',
                instruction: 'Stay hydrated and avoid prolonged sun exposure.',
            },
        ],
    }
}