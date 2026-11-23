import type React from 'react'
import { HomeCareWidget } from './homeCare/HomeCareWidget'
import { CalendarWidget } from './calendar/CalendarWidget'
import { WeatherWidget } from './weather/WeatherWidget'

export type Shape = 'full' | 'half'
export type WidgetId = 'weather' | 'calendar' | 'homeCare'

export type WidgetDef = { label: string; shape: Shape; component: React.ComponentType }

export const registry: Record<WidgetId, WidgetDef> = {
  weather: { label: 'Weather', shape: 'full', component: WeatherWidget },
  calendar: { label: 'Calendar', shape: 'half', component: CalendarWidget },
  homeCare: { label: 'Home Care', shape: 'half', component: HomeCareWidget },
}

// A household's widget settings: every widget in the order they arranged them, and which
// ones are off. Keeping off widgets in the order is what stops rows jumping in Settings.
export type WidgetChoices = { order: WidgetId[]; hidden: WidgetId[] }

// Turns the saved lists into something safe to use:
// - ids the app doesn't know (a typo, a widget since removed) are dropped
// - widgets built after the household saved its order are added at the end, off,
//   so a new widget is an opt-in rather than appearing on everyone's screen
export function resolveWidgets(savedOrder: string[], savedHidden: string[]): WidgetChoices {
  const allIds = Object.keys(registry) as WidgetId[]
  const known = savedOrder.filter((id): id is WidgetId => id in registry)
  const added = allIds.filter(id => !known.includes(id))
  const hidden = [...savedHidden.filter((id): id is WidgetId => id in registry), ...added]
  return { order: [...known, ...added], hidden }
}

export function buildRows(
  widgets: WidgetId[],
  registry: Record<WidgetId, WidgetDef>,
): WidgetId[][] {
  const rows: WidgetId[][] = []

  for (const id of widgets) {
    if (registry[id].shape === 'full') {
      rows.push([id])          // full: always a new row of its own
    } else {
      const openRow = rows.find(row => row.length === 1 && registry[row[0]].shape === 'half')

      if (openRow) {
        openRow.push(id)     // join the open row
      } else {
        rows.push([id])      // no open row: start a new one
      }
    }
  }

  return rows
}