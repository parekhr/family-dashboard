import type { WeatherAlert } from './useWeatherData'
import { formatWeekdayTime } from '../../lib/dates'

export function getAlertTiming(alert: WeatherAlert, now: Date) {
    if (now < new Date(alert.start)) return `Starts ${formatWeekdayTime(alert.start)}`
    if (alert.end) return `Until ${formatWeekdayTime(alert.end)}`
    return `Since ${formatWeekdayTime(alert.start)}`
}

export function isAlertActive(alert: WeatherAlert, now: Date) {
    return now < new Date(alert.end ?? alert.expires)
}