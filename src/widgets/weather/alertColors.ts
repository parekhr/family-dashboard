import type { WeatherAlert } from './useWeatherData'

export const severityColors: Record<WeatherAlert['severity'], string> = {
    Extreme: '#F4B0A8',
    Severe: '#F8CC9C',
    Moderate: '#FBEBA5',
    Minor: '#CFE2F3',
    Unknown: '#E4E1DB',
}