export type CurrentWeather = {
    temperature: number
    condition: string
    high: number
    low: number
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