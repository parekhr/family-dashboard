import type React from 'react'
import HomeCareWidget from './homeCare/HomeCareWidget'

export type Shape = 'full' | 'half'
export type WidgetId = 'weather' | 'calendar' | 'homeCare'

export type WidgetDef = { label: string; shape: Shape; component: React.ComponentType }

export const registry: Record<WidgetId, WidgetDef> = {
  weather: { label: 'Weather', shape: 'full', component: () => null },
  calendar: { label: 'Calendar', shape: 'half', component: () => null },
  homeCare: { label: 'Home Care', shape: 'half', component: HomeCareWidget },
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