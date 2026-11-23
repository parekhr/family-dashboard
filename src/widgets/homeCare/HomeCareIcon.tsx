import { createElement } from 'react'
import type { LucideProps } from 'lucide-react'
import { getHomeCareIcon } from './icons'

type HomeCareIconProps = LucideProps & { icon: string }

// An item's icon from its stored key (unknown keys draw the wrench).
// createElement instead of `const Icon = getHomeCareIcon(...)` + <Icon />: React's lint
// reads that as defining a new component on every render.
export function HomeCareIcon({ icon, ...props }: HomeCareIconProps) {
    return createElement(getHomeCareIcon(icon), props)
}
