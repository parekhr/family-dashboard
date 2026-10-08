import clearDayAnimated from '@meteocons/svg/fill/clear-day.svg'
import clearDayStill from '@meteocons/svg-static/fill/clear-day.svg'

import clearNightAnimated from '@meteocons/svg/fill/clear-night.svg'
import clearNightStill from '@meteocons/svg-static/fill/clear-night.svg'

import cloudyAnimated from '@meteocons/svg/fill/cloudy.svg'
import cloudyStill from '@meteocons/svg-static/fill/cloudy.svg'

import fogAnimated from '@meteocons/svg/fill/fog.svg'
import fogStill from '@meteocons/svg-static/fill/fog.svg'

import rainAnimated from '@meteocons/svg/fill/rain.svg'
import rainStill from '@meteocons/svg-static/fill/rain.svg'

import snowAnimated from '@meteocons/svg/fill/snow.svg'
import snowStill from '@meteocons/svg-static/fill/snow.svg'

import thunderAnimated from '@meteocons/svg/fill/thunderstorms.svg'
import thunderStill from '@meteocons/svg-static/fill/thunderstorms.svg'

import partlyCloudyDayAnimated from '@meteocons/svg/fill/partly-cloudy-day.svg'
import partlyCloudyDayStill from '@meteocons/svg-static/fill/partly-cloudy-day.svg'

import partlyCloudyNightAnimated from '@meteocons/svg/fill/partly-cloudy-night.svg'
import partlyCloudyNightStill from '@meteocons/svg-static/fill/partly-cloudy-night.svg'

export type WeatherIcon = {
    animated: string
    still: string
}

export function getWeatherIcon(condition: string, isDaytime: boolean): WeatherIcon {
    const text = condition.toLowerCase()

    if (text.includes('thunder')) return { animated: thunderAnimated, still: thunderStill }
    if (text.includes('snow')) return { animated: snowAnimated, still: snowStill }
    if (text.includes('rain') || text.includes('shower')) return { animated: rainAnimated, still: rainStill }
    if (text.includes('fog')) return { animated: fogAnimated, still: fogStill }
    if (text.includes('partly') || text.includes('mostly sunny') || text.includes('mostly clear')) {
        return isDaytime
            ? { animated: partlyCloudyDayAnimated, still: partlyCloudyDayStill }
            : { animated: partlyCloudyNightAnimated, still: partlyCloudyNightStill }
    }
    if (text.includes('cloud')) return { animated: cloudyAnimated, still: cloudyStill }
    return isDaytime
        ? { animated: clearDayAnimated, still: clearDayStill }
        : { animated: clearNightAnimated, still: clearNightStill }
}