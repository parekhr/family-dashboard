import { createElement } from 'react'
import type { LucideProps } from 'lucide-react'
import { getReminderIcon } from './icons'

type ReminderIconProps = LucideProps & { icon: string }

// An item's icon from its stored key (unknown keys draw the wrench).
// createElement instead of `const Icon = getReminderIcon(...)` + <Icon />: React's lint
// reads that as defining a new component on every render.
export function ReminderIcon({ icon, ...props }: ReminderIconProps) {
    return createElement(getReminderIcon(icon), props)
}
