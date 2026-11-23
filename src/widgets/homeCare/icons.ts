import { AirVent, Droplet } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

// The `icon` column on home_care_items must be one of these keys
export const homeCareIcons: Record<string, LucideIcon> = {
  'air-vent': AirVent,
  'droplet': Droplet,
}
