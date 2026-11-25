// The app's house style for pop-ups, in one place: titles, close buttons, tabs and buttons.
// Trying "warm and friendly" (November 25, 2026) on Settings first: Fredoka, with buttons
// that have a darker bottom edge so they look raised, and press down when tapped.
//
// The edge is a translucent black border over the button's own color, so it's a darker
// shade of whatever the button is (any color theme's green, the grey neutral) with no
// extra theme colors needed. Pressing thins the edge and nudges the button down, so the
// button stays the same height and nothing around it moves.

// Pop-ups' font; Modal puts it on every pop-up, so everything inside inherits it
export const modalFontClass = 'font-rounded'

export const modalTitleClass = 'text-[28px] font-semibold leading-none'

// The small pop-up under the reminders bell
export const smallTitleClass = 'text-[22px] font-semibold leading-none'

// Widget titles on the dashboard (Home Care, the calendar's month). Sports keeps its
// scoreboard font (font-sports).
export const widgetTitleClass = 'font-rounded text-[26px] font-semibold text-ink'

const raised = 'cursor-pointer border-b-4 transition-[transform,border-width,background-color] active:translate-y-0.5 active:border-b-2'

// The one main action (Save, the selected tab)
export const raisedPrimaryClass = `${raised} border-black/25 bg-primary font-semibold text-white hover:bg-primary-hover`

// Everything else that's a button (unselected tabs, close)
export const raisedNeutralClass = `${raised} border-black/10 bg-muted/15 font-medium text-ink hover:bg-muted/25`

export const closeButtonClass = `flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg ${raisedNeutralClass}`
export const smallCloseButtonClass = `flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${raisedNeutralClass}`

export function tabClass(selected: boolean): string {
    return `h-11 flex-1 rounded-2xl ${selected ? raisedPrimaryClass : raisedNeutralClass}`
}
