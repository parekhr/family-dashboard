import type React from 'react'
import { CalendarWidget } from './calendar/CalendarWidget'
import { WeatherWidget } from './weather/WeatherWidget'
import { SportsWidget } from './sports/SportsWidget'

export type Shape = 'full' | 'half'
export type WidgetId = 'weather' | 'calendar' | 'sports'

export type WidgetDef = { label: string; shape: Shape; component: React.ComponentType }

export const registry: Record<WidgetId, WidgetDef> = {
  weather: { label: 'Weather', shape: 'full', component: WeatherWidget },
  calendar: { label: 'Calendar', shape: 'half', component: CalendarWidget },
  sports: { label: 'Sports', shape: 'half', component: SportsWidget },
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

// ---- Pages ----
// The screen is 800px; the header takes 80, leaving this much for widget rows per page
export const PAGE_HEIGHT = 720

// The least height a row can have and still look right. A full-width row (Weather) is a
// 250px band; a half-width row needs about 400 for a month of calendar or a few game cards.
const ROW_MIN_HEIGHT: Record<Shape, number> = { full: 250, half: 400 }

// Splits the rows into pages, in order: a row that wouldn't fit on the current page
// starts the next one. So Weather plus one row of half-width widgets fill page 1, and
// anything after that goes on page 2 (and so on), instead of everything being squeezed.
// Each page then stretches its rows to fill the screen, as a single page always did.
export function buildPages(rows: WidgetId[][]): WidgetId[][][] {
  const pages: WidgetId[][][] = []
  let page: WidgetId[][] = []
  let used = 0
  for (const row of rows) {
    const height = ROW_MIN_HEIGHT[registry[row[0]].shape]
    if (page.length > 0 && used + height > PAGE_HEIGHT) {
      pages.push(page)
      page = []
      used = 0
    }
    page.push(row)
    used += height
  }
  if (page.length > 0) pages.push(page)
  return pages
}

// Which page (1, 2, ...) each widget that's on lands on, for the note in Settings
export function pageOf(onWidgets: WidgetId[]): Partial<Record<WidgetId, number>> {
  const result: Partial<Record<WidgetId, number>> = {}
  buildPages(buildRows(onWidgets, registry)).forEach((page, index) => {
    for (const row of page) for (const id of row) result[id] = index + 1
  })
  return result
}