// The app's house style for pop-ups, in one place: titles, close buttons, tabs and buttons.
// "Warm and friendly" (November 25, 2026): Fredoka, with buttons that have a darker bottom
// edge so they look raised, and press down when tapped.
//
// Two layers, like the color themes:
// - the values (font, corner size, edge size and darkness) are CSS variables in index.css,
//   under "House style". Tweak the look there; every recipe below follows.
// - the recipes (which pieces make a title, a close button, a tab) are here.
// A second style later would be a second set of those variables, not new recipes.
//
// The edge is a translucent black border over the button's own color, so it's a darker
// shade of whatever the button is (any color theme's green, the grey, the red) with no
// extra theme colors needed. Pressing thins the edge and nudges the button down by the
// difference, so the button stays the same height and nothing around it moves.

// Pop-ups' font; Modal puts it on every pop-up, so everything inside inherits it
export const modalFontClass = 'font-ui'

export const modalTitleClass = 'text-[28px] font-semibold leading-none'

// The small pop-up under the reminders bell
export const smallTitleClass = 'text-[22px] font-semibold leading-none'

// Widget titles on the dashboard (the calendar's month). Sports keeps its
// scoreboard font (font-sports).
export const widgetTitleClass = 'font-ui text-[26px] font-semibold text-ink'

const raised = 'cursor-pointer border-b-[length:var(--edge-size)] transition-[transform,border-width,background-color] active:translate-y-[calc(var(--edge-size)-var(--edge-size-pressed))] active:border-b-[length:var(--edge-size-pressed)]'

// The one main action (Save, the selected tab)
export const raisedPrimaryClass = `${raised} border-edge bg-primary font-semibold text-white hover:bg-primary-hover`

// Everything else that's a button (unselected tabs, close, Cancel)
export const raisedNeutralClass = `${raised} border-edge-soft bg-muted/15 font-medium text-ink hover:bg-muted/25`

// A theme-tinted button: stands out from the cream and grey more than the grey button,
// without being the main action (the bell's ✓ and "Set up reminders")
export const raisedTintClass = `${raised} border-edge-soft bg-primary/15 font-semibold text-primary hover:bg-primary/25`

export const closeButtonClass = `flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-lg ${raisedNeutralClass}`
export const smallCloseButtonClass = `flex h-9 w-9 shrink-0 items-center justify-center rounded-control-sm ${raisedNeutralClass}`

export function tabClass(selected: boolean): string {
    return `h-11 flex-1 rounded-control ${selected ? raisedPrimaryClass : raisedNeutralClass}`
}

// Square icon buttons in rows (pencil, trash, the X that cancels a delete)
const iconButton = `flex h-11 w-11 shrink-0 items-center justify-center rounded-control ${raised}`
export const iconButtonClass = `${iconButton} border-edge-soft bg-muted/15 text-muted hover:bg-muted/25`
export const dangerIconButtonClass = `${iconButton} border-edge-soft bg-red-100 text-red-600 hover:bg-red-200`
// The trash once "Delete X?" is showing: solid red, the one that really deletes
export const confirmDeleteButtonClass = `${iconButton} border-edge bg-red-600 text-white hover:bg-red-700`

// Text buttons beside Save, and the full-width "+ Add ..." under a list
export const cancelButtonClass = `h-11 shrink-0 rounded-control px-4 ${raisedNeutralClass}`
export const addButtonClass = `mt-3 h-[52px] w-full shrink-0 rounded-control ${raisedNeutralClass}`
