import { AirVent, AlarmSmoke, Battery, Car, Droplet, Fan, Flame, Heater, Lightbulb, Refrigerator, ShowerHead, Sprout, WashingMachine, Wrench } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// The icons an item can have, in the order the picker shows them.
// The `icon` column on home_care_items (the reminders table) stores one of these keys.
export const reminderIcons: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: 'air-vent', label: 'Air vent', Icon: AirVent },
  { key: 'droplet', label: 'Water', Icon: Droplet },
  { key: 'refrigerator', label: 'Refrigerator', Icon: Refrigerator },
  { key: 'flame', label: 'Furnace', Icon: Flame },
  { key: 'heater', label: 'Heater', Icon: Heater },
  { key: 'fan', label: 'Fan', Icon: Fan },
  { key: 'alarm-smoke', label: 'Smoke detector', Icon: AlarmSmoke },
  { key: 'battery', label: 'Battery', Icon: Battery },
  { key: 'lightbulb', label: 'Light', Icon: Lightbulb },
  { key: 'washing-machine', label: 'Washer', Icon: WashingMachine },
  { key: 'shower-head', label: 'Shower', Icon: ShowerHead },
  { key: 'sprout', label: 'Yard', Icon: Sprout },
  { key: 'car', label: 'Car', Icon: Car },
  { key: 'wrench', label: 'General', Icon: Wrench },
]

// An unknown key (a typo in the database, or an icon since removed) falls back to the
// wrench instead of drawing nothing, which would crash the whole dashboard.
export function getReminderIcon(key: string): LucideIcon {
  return reminderIcons.find(icon => icon.key === key)?.Icon ?? Wrench
}
