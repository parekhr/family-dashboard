# Family Dashboard — Project Plan

Status: planning complete for MVP scope and architecture. No code written yet.

## Working agreement

This is a learning project. Claude acts only when explicitly asked to do a specific
piece of work in that turn — it answers questions, explains tradeoffs, and reviews
ideas, but does not write code, create files, or otherwise build things on its own
initiative. The person building this project is doing the implementation themselves.

## Origin

The design/UX reference for this project is a Claude Code "design canvas" artifact
(a wall-tablet mockup, 1280x800, plus a phone companion mockup, 390x844) built before
this plan existed. It's a fully interactive prototype with realistic state/interaction
logic, but it is a mockup — not a real backend, not real data persistence, not a real
weather API. This plan describes turning that design into an actual running app.

## MVP feature scope

- **Date & time** — top-left of the wall dashboard.
- **Location picker** — current location as the default/most prominent option.
- **Weather**
  - "Now" view plus weekly and hourly forecasts.
  - Alert banner sourced from a real weather API (primary/secondary alert ranking
    already exists in the mockup's logic: rain < wind < storm < tornado, etc.).
  - Animated backgrounds for certain severe conditions (thunderstorm, tornado, wind,
    snow, blizzard) — pure CSS/DOM animation in the mockup, no external library.
  - **Chosen data source: National Weather Service API (`api.weather.gov`)** — free,
    no API key, and the mockup's own code comments already model its hourly data on
    NWS's gridpoint forecast fields, so this is a close match rather than a rework.
- **Calendar**
  - Add appointments (single-day, timed) and events (multi-day, e.g. vacations).
  - Color coding by type; "what's expected today" surfaced separately from the grid.
  - The "today" reminder banner also fires **the day before** an event, labeled
    "Tomorrow" instead of "Today" (currently only fires on the event's own day).
    Implies checking a date range (today or today+1) rather than an exact match, and a
    label that depends on which of the two matched. Decide later whether both a
    today-event and a tomorrow-event can show at once, or only the nearer one.
  - Seasonal theming (color/decoration) for a **few key months only** (e.g. Halloween
    in October, winter holidays in December) — not all 12 months for the MVP.
- **Home Care tracking**
  - Each tracked item = name + icon + a history log of dates, plus two **fixed, optional**
    text fields available on every item: `model` (e.g. a filter's part number) and `size`
    (e.g. `16x16` or `20x25x1`) — free text, not validated, blank for items that don't
    need them (e.g. a lightbulb). This is not the same as arbitrary custom fields per
    item (see below) — it's two specific optional fields every item shares.
  - Interaction is a single "I did this today" tap with **no confirmation step** — a
    stray tap is fixed afterward in the item's History view (see below), not prevented
    up front. The tap appends the date to that item's
    history. If today's date is already in that item's history, the action silently
    no-ops (no gray/disabled button state, no error) rather than adding a duplicate
    entry. No due-date/cadence logic in the MVP.
  - **History view** (per the mockup): a modal opened from each item's "History" link,
    listing that item's dates with an edit (pencil) and delete (trash) button on each,
    plus an "Add Entry" button for backdated entries. This is the safety net for stray
    taps. Editing or adding a date that already exists in that item's history is
    rejected with a red inline message ("That date is already logged") — unlike the
    Log button, which silently no-ops, since here the person is deliberately entering a
    date. When editing, compare against the other entries so saving an unchanged date
    doesn't flag itself. Dates are stored as ISO `YYYY-MM-DD` and formatted for display
    (e.g. "August 12, 2026").
  - "Today" must be computed from the device's **local** date (`getFullYear`/
    `getMonth`/`getDate`), never `Date.toISOString()` (UTC) — the tablet is a fixed
    physical device in one household, so local time is simply correct, but a
    UTC-based date string can be a day off for several hours around local midnight
    (US timezones are behind UTC). Same rule applies to the Calendar "today/tomorrow"
    banner. Shared as a `getTodayISO()` helper in `src/lib/dates.ts` rather than
    duplicated per widget.
  - Full CRUD on which items exist (add/rename/delete/reorder), not on user-defined
    custom fields per item — the model itself is intentionally simple. If item data ever
    needs to diverge more (different "kinds" of item with structurally different extra
    fields), model it as a discriminated union (`type: 'filter' | 'generic'`, etc.)
    rather than a free-form schema. **The rule this all serves**: a widget's outer shape
    (full/half, on the dashboard) never changes to accommodate its data — only the
    widget's *internal* layout adapts (e.g. how an item's card lays out its optional
    fields). Same discipline one level down: an item's varying data changes how its card
    looks inside the widget, never the widget's footprint on the dashboard.
- **Settings**
  - Pre-built themes, layout control (see Widget System below), family members list,
    appointment types, event types. Expected to grow over time.
- **Phone companion ("Quick Actions")**
  - Matches the mockup's Phone artboard: add-to-calendar button, today's appointments
    (dismissible), and the Home Care list with the same "did this today" action.
  - Shares the same underlying data/components as the wall dashboard (one responsive
    codebase, not a second app) — the mockup's own comments call this out explicitly.

## Architecture

- **Frontend**: React + Vite + TypeScript (strict mode). Tailwind CSS v4 for styling.
- **Backend**: Supabase (Postgres + Auth + Realtime), **one shared project** for all
  households.
- **Multi-tenancy / household isolation**: every table carries a `household_id`;
  Row-Level Security policies restrict each authenticated session to its own
  household's rows. The project owner (via the Supabase dashboard / service role)
  retains full visibility across households — this was an explicit, accepted
  tradeoff, not an oversight.
- **Hosting**: one shared Vercel (or similar) deployment. A single `git push` updates
  every household's dashboard at once — there is only one deployment target.
- **Device pairing (no traditional login)**: the admin generates a short-lived,
  single-use setup code per household. Entering it once on a tablet/phone exchanges
  it for a long-lived session stored on that device — no email/password, no login
  screen ever again on that device. Per-person attribution (e.g. "Mom" vs "Dad" on an
  appointment) is handled by the existing People picker in the UI, not by per-person
  authentication.
- **Weather API**: National Weather Service (`api.weather.gov`) — free, no key,
  covers both forecast (hourly/weekly) and active alerts by lat/long.

## Widget system

The dashboard is composed of independent "widgets" (Weather, Calendar, Home Care,
and whatever gets added later). Each household controls which widgets are enabled
and in what order — a settings change, not a code change or a per-household fork.

- **Catalog**: every household sees every widget that has ever been built, and
  toggles each on/off. Building a new widget makes it available to everyone as an
  opt-in; it does not force it onto anyone.
- **Ordering**: a single ordered list of enabled widgets per household (toggle +
  up/down reorder in Settings — not free-form drag-and-place).
- **Shapes**: each widget declares one of two shapes for the MVP:
  - *Full-width band* (e.g. Weather) — stacks vertically, one per row.
  - *Half-width column* (e.g. Calendar, Home Care) — pairs up two-at-a-time into a
    shared row, in list order; an odd one out expands to fill the full row.
- **The rule that makes it work**: the wall dashboard is a fixed 1280x800 box, so
  at least one thing in the layout must always be able to absorb leftover vertical
  space. Concretely: full-width widgets have a sensible intrinsic height; half-width
  widgets sharing a row stretch/scroll to match whatever height that row ends up
  being. Every widget built going forward must follow this so that any combination
  of enabled widgets fills the screen exactly, with no dead gap and nothing clipped.
- Future widgets with a genuinely different footprint would need a third shape —
  the model isn't infinitely flexible, it's "a few known shapes that combine
  predictably."

### Layout decisions

- **Default layout**: every new household starts with `[weather, calendar, homeCare]`
  (Weather as a full-width band, Calendar and Home Care side by side). That list is
  seeded as data and passes through `layoutEngine.js` like any custom layout. Changing
  the default later only affects households created afterward.
- **Weather is optional but on by default.** It is the only widget with external
  dependencies (location, NWS, US-only coverage), so it must be removable. A separate
  always-on alert banner is a possible later addition, not part of the MVP.
- **Only two shapes for the MVP: full and half.** The mockup's lower section is a fixed
  420px Home Care column beside a flexible Calendar; that becomes an even half/half split
  (~594px each). No fixed-width or fill-width behavior, no width arithmetic. If a widget
  ever truly needs a fixed width, add a third shape then. Widgets are designed fluidly for
  half (~594px), full (1280px), and phone (~390px) widths; a second design is added only
  if a widget looks bad at one width. Container queries (Tailwind v4 `@container`) are the
  preferred way to adapt, with a `layout` prop as the fallback if the kiosk browser's
  engine is too old (check once chosen).
- **Row-building rule (look-back packing)**: walk the ordered list. A full widget always
  gets its own row, in list order. A half widget goes into the earliest half-row that
  still has a free slot, anywhere earlier in the list; if none exists it starts a new
  half-row. A lone half widget expands to the full row width (`flex-1`). Example:
  `[calendar, weather, homeCare]` -> `[calendar, homeCare]`, `[weather]`. This wastes
  less height and raises fit capacity. Because a half widget's list position only matters
  relative to full widgets and other half widgets, some arrow presses would not change the
  layout, so the reorder arrows skip to the next position that does. The Settings preview
  shows the result after every move.
- **Settings**: a toggle list of every widget in the catalog, plus up/down reorder.
  Enabling a widget that would overflow the fixed 800px height is disabled, with a
  reason ("Turn something off to make room"). The same layout calculation answers
  "does this fit?", so no separate logic is needed.
- **Settings preview**: a miniature 16:10 frame next to the toggle list that renders the
  same rows the layout engine produces (labeled boxes, or the real layout scaled down
  with placeholders), so it cannot disagree with the real dashboard. It shows where a
  widget will land, why a toggle is disabled (frame is full), and how ordering changes
  rows. Interaction: tap a box in the preview to select it, then use arrow buttons to move
  it one place in the ordered list; the preview redraws immediately. No drag-and-drop for
  the MVP (rows are computed from the list, so drops don't map cleanly, and touch
  dragging is fiddly). Drag-to-swap could be added later on top of the same list. Build
  after the layout engine and the toggle list.
- **Overflow fallback**: if a saved layout no longer fits (e.g. a widget's minimum height
  changes), the layout engine renders rows in order until the next one wouldn't fit and
  hides the rest; Settings flags it ("Some widgets are hidden"). Nothing is deleted.
- **Fit limit**: each widget declares a minimum height; the engine sums row minimums
  plus the header against 800px. Expect roughly Weather + four half-width widgets, or
  about six half-width widgets without Weather (illustrative, depends on final design).
- **No free-form scrolling** on the wall dashboard (glanceable, out of reach, and it
  would let widgets ignore the fill-the-screen rule). If households outgrow one screen,
  add **paged screens**: each page is a full 1280x800 layout following the same rules,
  with page 2 appearing only when needed. Post-MVP. The phone view is a single scrolling
  column.
- **"Enabled" only hides a widget**; its data stays in the database.

## Header and household settings

- **Header** is a three-column grid (`grid grid-cols-3`): date and time on the left,
  the household name centered, location picker and settings entry on the right. A grid,
  not flex `justify-between`, so the name stays centered whatever the sides contain. With
  no household name the middle column is rendered empty (not removed) so the left and
  right zones don't shift. Long names truncate with an ellipsis.
- **Household name**: optional `name` field on the household, edited in Settings. Display
  label only; `household_id` remains the identifier.
- **Name length**: hard character limit in the Settings field (tentatively ~24; confirm
  by testing the widest font at the real size in one header column, about 427px wide).
  Ellipsis truncation stays as a backstop, since font widths vary.
- **Name font**: a dropdown of a short curated list (4-6 fonts) with a live preview in
  Settings. Store a key on the household (e.g. `name_font: "handwritten"`), not CSS;
  the app maps keys to font-families and falls back to the default for unknown or
  missing keys. Fonts are bundled with the app (e.g. `@fontsource`) rather than loaded
  from a CDN, since the tablet's wifi may be flaky. Register them as Tailwind theme
  fonts. Test every listed font with a maximum-length name.
- **Location** is only used by Weather, so the header shows the location picker only when
  Weather is enabled. If a second location-using widget appears, replace that check with a
  `usesLocation` flag in the registry.
- **Location is household-level** (latitude, longitude, display name on the household
  row), shared by every device. The phone view has no weather and ignores it.
- **Setting the location**: manual entry (ZIP or city, geocoded to lat/long) is the
  primary path at setup and for later edits. Browser geolocation is an optional
  "use my location" shortcut only, since the Fire tablet has no GPS and may not support it
  in a kiosk browser. Test on the real device. IP lookup may prefill the field but never
  sets the location silently. NWS is US-only, so a non-US location needs a clear error.

## Build order

1. Layout shell (fixed 1280x800 box, header + body, rows) with placeholder widgets and
   the registry.
2. Mock data hook: `useHouseholdData()` returns mock data shaped exactly like the future
   Supabase rows (ids, `household_id`, ISO date strings). Mock writes update local state
   so interactions work. Weather mock = saved real NWS payloads, including a severe
   sample. Widgets only ever talk to the hook, so swapping in Supabase changes nothing
   in the widgets.
3. Widgets one at a time: Home Care, Calendar, Weather.
4. Settings, phone view, Supabase, device pairing.

## Proposed folder structure

Not final — a starting point to build from and adjust as the widget system proves
itself out in practice.

Stack is TypeScript (see Architecture above), so this tree uses `.ts`/`.tsx`, not
`.js`/`.jsx`.

```
family-dashboard/
├── PROJECT_PLAN.md
├── index.html
├── package.json
├── vite.config.ts
├── .env.example              # SUPABASE_URL / SUPABASE_ANON_KEY placeholders
├── src/
│   ├── main.tsx
│   ├── App.tsx                # top-level shell; switches wall vs. phone layout
│   ├── lib/
│   │   └── supabaseClient.ts
│   ├── auth/
│   │   └── useDeviceSession.ts   # setup-code exchange + persisted session
│   ├── hooks/
│   │   └── useHouseholdData.ts   # realtime subscription to this household's data
│   ├── widgets/
│   │   ├── registry.ts           # widget id -> { component, shape, label }
│   │   ├── weather/
│   │   │   ├── WeatherWidget.tsx
│   │   │   ├── useWeatherData.ts     # NWS fetch/normalize
│   │   │   └── severeBackgrounds.tsx
│   │   ├── calendar/
│   │   │   ├── CalendarWidget.tsx
│   │   │   ├── AppointmentForm.tsx
│   │   │   └── seasonalThemes.ts
│   │   └── homeCare/
│   │       ├── HomeCareWidget.tsx
│   │       └── ConfirmModal.tsx
│   ├── dashboard/
│   │   ├── DashboardLayout.tsx   # renders enabled widgets per shape rules
│   │   └── layoutEngine.ts       # ordered widget list -> rows/columns
│   ├── settings/
│   │   ├── SettingsPanel.tsx
│   │   ├── WidgetToggleList.tsx
│   │   ├── ThemePicker.tsx
│   │   └── PeopleAndTypes.tsx
│   ├── phone/
│   │   └── QuickActionsView.tsx
│   ├── components/               # shared/generic UI (buttons, modals, date picker)
│   └── styles/
│       └── tokens.css            # design tokens ported from the mockup
└── supabase/
    ├── schema.sql                 # tables + RLS policies
    └── functions/                 # e.g. setup-code exchange as a Postgres function
```

## Hardware

- **Tablet**: Amazon Fire HD 10 (13th gen, 2023), 10.1" 1920x1200 — confirmed
  ~$77 at time of planning (list $154.99, frequently discounted). No Google Play
  Store; a kiosk browser is sideloaded once per device by the admin during setup,
  not something the household ever touches.
- **Stand**: varies per household, all roughly similar cost —
  countertop stand (~$10–20), magnetic fridge mount (~$15–40, **verify the fridge
  front is actually magnetic first** — some stainless finishes aren't), or wall
  mount (~$15–25).
- **Per-household hardware cost**: roughly **$85–160** all-in. No recurring cost —
  Supabase and hosting both stay on free tiers at this scale.

## Open / not yet decided

- Exact months to theme for the calendar (beyond "a few key ones").
- Full Supabase schema details (exact tables/columns beyond `household_id` + RLS).
- Which kiosk browser APK to sideload on the Fire HD 10.
- Any widgets beyond the MVP three (Weather, Calendar, Home Care).
- Exact settings UI for widget catalog / reordering (toggle list is agreed; visual
  treatment not designed yet).
