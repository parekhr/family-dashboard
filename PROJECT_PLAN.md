# Family Dashboard — Project Plan

Status: MVP build in progress. Layout shell, widget registry + `buildRows`, and the Home
Care widget (log today, History modal with add/edit/delete) are built on mock data. Next
up: Calendar widget. Home Care item management (add/rename/delete/reorder) is deferred to
Settings.

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
  - **Note for when we build Weather: iOS-style next-hour precipitation chart.** Idea
    (from the iOS Weather widget): when rain is expected soon, the "Now" card shows a
    small precipitation bar chart ("Now · 15m · 30m…") plus a one-line summary, and
    it's hidden on dry hours. That moves the routine rain heads-up out of the middle
    banner, leaving the banner for real alerts only (wind, storm, tornado…).
    - **Data catch:** NWS's finest resolution is hourly, so it can't drive a
      minute-level chart. MVP keeps the simple "Rain likely next hour" line from NWS.
    - **Likely upgrade path:** Open-Meteo (free, no key) `minutely_15` precipitation →
      4 bars/hour; e.g. next 2 hours as 8 bars, which also reads better from across a
      room than iOS's 60 thin bars. True per-minute sources (OpenWeather, Pirate
      Weather, Apple WeatherKit) need keys/have limits or cost money. Decide when
      building the Weather widget.
- **Calendar**
  - **One model: everything is an event.** A single "+ Add event" button; the event's
    category is picked inside the form (appointment, day off, vacation, etc. are all just
    categories, not separate kinds of record).
  - **Categories control only the look** (name, color, maybe an icon). Households add,
    rename, and delete their own categories in Settings. Categories never define fields.
    Each event points to one category by `categoryId`; many events share a category.
    (Named "category", not "event type", to avoid clashing with TypeScript's `type`
    keyword and to match Outlook's term for the same idea.)
  - **Fields are fixed in code** and identical for every event: start date, end date,
    an all-day flag, and a time when not all-day. Only the developer changes them, and a
    change ships to every household with one push. When a household asks for a new
    field, generalize it into a **generic, optional** field every event can use (e.g. a
    `location` or `notes` rather than "vacation destination"), so events saved before the
    field existed stay valid.
  - **All-day events** may span multiple days; **timed events** are single-day for the
    MVP.
  - **End dates are inclusive**, stored as ISO `YYYY-MM-DD`: a Mon–Fri vacation is
    `start: Mon, end: Fri` (Friday is the last day; Saturday is clear), and a single day
    is `start === end`. "Does this event cover day X?" is `start <= X && X <= end`. Do not
    copy Outlook/Google's exclusive "ends next midnight" storage.
  - **Add Event validation**: a timed (not all-day) event can't be saved without a
    time, and the end date can't be before the start date (either one silently breaks
    display: a missing time has nothing to show, and an end before start makes
    `start <= X && X <= end` match no day at all, so the event vanishes). The type
    (`time?: string`) doesn't enforce the first rule, so the form must; the same rules
    should eventually be enforced in the database too, not just the form. The day
    modal's "when" text has a fallback for a missing time, but that's only a safety
    net. (Later option: make the type itself enforce it with a discriminated union —
    all-day with no time vs. timed with a required time.)
  - **Category choice sets form defaults only** (e.g. "Vacation" shows the end date,
    "Appointment" shows the time); it never changes the data shape.
  - **Title is optional.** An untitled event displays its category name (e.g. "Dad ·
    Appointment"). The fallback is computed at display time (`title || category.name`)
    and never saved into the event, so renaming a category updates old untitled events. Trim
    whitespace before saving so `"   "` counts as no title. A title can be added later by
    editing the event.
  - **People**: each event is for zero or more household members, picked with the
    People picker in the add-event form. Households add, rename, and remove people
    themselves in Settings — like categories, they're data, not code.
    - **Whole family = every person selected.** It's stored as the list of selected
      people, i.e. a snapshot: someone added to the household later is not retroactively
      part of older events.
    - An **"Everyone" chip** in the picker selects all people in one tap. UI shortcut
      only; it stores the same list.
    - **Zero people is allowed**, for household-wide events that aren't about anyone in
      particular (e.g. "Trash pickup", "Halloween").
  - Category colors appear where there's room for text — the "what's expected today" chips
    (surfaced separately from the grid) and the day modal — not on the month grid.
  - **Month grid** (replaces the mockup's split-color chips, which were hard to read
    from a distance and broke down at 3+ events). The grid is a calm summary of the
    month's shape; details live in the Today chips and the day modal.
    - **Always 6 rows (42 days)**, with the previous/next month's days grayed out, so
      the grid never changes size between months.
    - **Spillover days never show events.** The grayed previous/next-month days are
      context for the grid's shape only; the viewed month is only about that month
      (same rule as the Today markers). A spillover cell treats its event list as
      empty, so chips, bands, and badges all disappear there from one check. A
      multi-day event that crosses the month edge (e.g. Vacation Aug 30 → Sep 7)
      therefore draws its band only on the in-month days, with a rounded end at the
      1st; the day modal still shows its full date range.
    - **Single-day events**: the day number sits on a solid chip in the **theme accent**,
      identical for every category.
    - **Multi-day events**: one soft tint of the theme accent, **1 lane**. A day gets band
      color if *any* multi-day event covers it; the band's ends are rounded and inset
      where the neighboring day has no band and at the week-row edges (Sun/Sat), and
      square/flush otherwise. Back-to-back or overlapping multi-day events merge into one
      shape — accepted; the badge and day modal tell them apart.
    - **Holidays**: a colored **ring** around the date. **Every ring is the same fixed
      outer size**, whether or not the day has an event: on a plain day it circles the
      number with empty space inside; on a chip day the chip shrinks to fit inside the
      ring with a small gap (chips on non-holiday days stay normal size). Sizing the ring
      around whatever is inside made chip-day rings visibly bigger than neighbors. Ring
      color depends on the
      holiday (e.g. Halloween orange), from a **developer-owned list** in code
      (`{ name, date rule, color }`) with a default ring color for any holiday without
      one. Moving holidays (e.g. Thanksgiving, Labor Day) need a date rule, not a fixed
      date. Test each ring color against the chip accent at real size. Holidays are code,
      not household settings.
      - **The list**: the 11 US federal holidays plus the common observances most
        calendars show. Only holidays with a strong color association get their own
        color; the rest use the default ring (slate `#6B7B8C`), so colored rings stay
        meaningful and never need a key.

        | Holiday | Date rule | Ring |
        |---|---|---|
        | New Year's Day | Jan 1 | Gold `#D4A017` |
        | MLK Jr. Day | 3rd Mon of Jan | default |
        | Valentine's Day | Feb 14 | Pink `#E75480` |
        | Presidents' Day | 3rd Mon of Feb | default |
        | St. Patrick's Day | Mar 17 | Green `#2E8B57` |
        | Easter | computed (lunar) | Lavender `#A58BD8` |
        | Mother's Day | 2nd Sun of May | Pink `#E75480` |
        | Memorial Day | last Mon of May | default |
        | Father's Day | 3rd Sun of Jun | default |
        | Juneteenth | Jun 19 | default |
        | Independence Day | Jul 4 | Red `#C8102E` |
        | Labor Day | 1st Mon of Sep | default |
        | Columbus / Indigenous Peoples' Day | 2nd Mon of Oct | default |
        | Halloween | Oct 31 | Orange `#F28C28` |
        | Veterans Day | Nov 11 | default |
        | Thanksgiving | 4th Thu of Nov | Harvest brown `#B5651D` |
        | Christmas Eve | Dec 24 | Green `#1E7B45` |
        | Christmas Day | Dec 25 | Red `#C8102E` |
        | New Year's Eve | Dec 31 | Gold `#D4A017` |

      - **Date rules**: 9 of these are "Nth (or last) weekday of a month", so that helper
        is needed regardless. Easter is the only hard one; leaning toward a date library
        for it (see Open).
      - **Ring the actual date, never the "observed" day off** (e.g. July 4 on a Saturday
        still rings Saturday, not Friday). Not everyone gets the federal day off.
      - **Ring colors are fixed and ignore the household theme.** No secondary/fallback
        ring colors. Themes are a developer-owned list (households pick from pre-built
        themes, never a custom color), so any ring-vs-theme clash is caught once at
        design time: when adding or changing a theme, check it next to the rings that
        fall in its months. The gap between ring and chip (showing the cell background)
        keeps a ring readable even over a similar-colored chip; widen the gap if testing
        shows it's too subtle.
    - **Badge**: one per day, on the date's corner, showing the **total** number of
      events that day. Shown only when there's more than the cell can show (2+
      single-day events or 2+ multi-day events). Holidays are **not** counted.
      Colored with its own theme color, `--color-badge: #60584F` (`bg-badge`, cream
      `text-card`), a warm gray between `ink` and `muted`: `ink` read as a heavy black
      dot that out-shouted the chips, `muted` risked being too faint from across the
      room, and darker green blended into adjacent chips.
    - **Layers never compete**: band (background), chip (fill), ring (outline), badge
      (corner). A cell never grows, however busy the day is.
    - **Today**: two light red (`#E5484D`) markers, nothing heavier. The red is its own
      theme color (`--color-today` in `@theme` → `text-today` / `bg-today`), separate
      from the holiday-ring reds, so it can be tuned without touching holidays:
      - today's **weekday label** in the header row (e.g. "Sun") turns red instead of
        `muted`, pointing the eye down the right column;
      - a **short red underline** under today's date number (bottom of the cell)
        picks out which day in that column.
      Every other in-cell style was already taken (filled circle = chip, ring =
      holiday, tint = band) or crowded the grid, and the always-visible clock/date
      header already says what today is, so the grid only needs a light "you are here"
      hint. The underline is the one style no other layer uses, and it stays visible
      over chips and bands. Both show **only when viewing today's month**, or navigating
      to another month would leave a red weekday with no matching day. Uses
      `getTodayISO()` (local time) like everything else.
    - **Tapping**: any day with a chip, band, or holiday opens a **day modal** listing
      the holiday first, then every event on that day. Multi-day events always show
      their **full date range** (e.g. "Vacation · Sep 21–25 · Mom, Dad"), even when the
      tapped day is in the middle of the event. (Later, maybe: tapping an empty day opens
      "+ Add event" with that date prefilled.)
    - **No color key**: bands share one tint, so there's nothing to decode, and the space
      goes to the grid. The day modal and Today chips answer "what is this?" (A
      non-color "This month" list of multi-day events could be added later if missed.)
  - The "today" reminder banner also fires **the day before** an event, labeled
    "Tomorrow" instead of "Today" (currently only fires on the event's own day).
    Implies checking a date range (today or today+1) rather than an exact match, and a
    label that depends on which of the two matched. Decide later whether both a
    today-event and a tomorrow-event can show at once, or only the nearer one.
  - **Seasonal theming covers all 12 months.** Each month's calendar card gets a subtle
    tinted **background**, a slightly stronger tinted **header**, and one large, faint
    **watermark icon** in the bottom-right corner (from the icon library, never
    hand-drawn in CSS; a faint repeating icon pattern was tried and rejected as too
    busy/hard to see).

    | Months | Theme | Watermark |
    |---|---|---|
    | Jan–Mar | Winter | Snowman (snowflake if the icon set lacks one) |
    | Apr–May | Spring | Flower |
    | Jun–Aug | Summer | Sun |
    | Sep, Nov | Fall | Autumn leaf |
    | Oct | Halloween | Pumpkin |
    | Dec | Christmas | Tree |

    - Stored in `seasonalThemes.ts` as a small set of named themes (`winter`, `spring`,
      `summer`, `fall`, `halloween`, `christmas`), each `{ background, header,
      watermarkIcon }` with **light and dark** values, plus a **12-entry month → theme
      lookup**. Every month has an entry, so there's no "is this month themed?" check;
      October and December are just entries pointing at a different theme.
    - Developer-owned code, not a household setting (same as holidays).
  - **Grid numbers use tabular digits** (`font-variant-numeric: tabular-nums` /
    Tailwind `tabular-nums`) so "11" and "28" don't look like different sizes.
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
    custom fields per item — the model itself is intentionally simple. **Item management
    lives in Settings, not on the widget face**: the wall widget only logs taps and opens
    History; adding/renaming/deleting/reordering items (and editing `model`/`size`) is a
    rare admin task done from Settings on the device. If item data ever
    needs to diverge more (different "kinds" of item with structurally different extra
    fields), model it as a discriminated union (`type: 'filter' | 'generic'`, etc.)
    rather than a free-form schema. **The rule this all serves**: a widget's outer shape
    (full/half, on the dashboard) never changes to accommodate its data — only the
    widget's *internal* layout adapts (e.g. how an item's card lays out its optional
    fields). Same discipline one level down: an item's varying data changes how its card
    looks inside the widget, never the widget's footprint on the dashboard.
- **Settings**
  - Pre-built themes, layout control (see Widget System below), family members list,
    event categories. Expected to grow over time.
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
  event) is handled by the existing People picker in the UI, not by per-person
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
  seeded as data and passes through `buildRows()` like any custom layout. Changing
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
│   │   ├── dates.ts              # toISO(), getTodayISO(), formatDate() (local time, never UTC)
│   │   └── supabaseClient.ts
│   ├── auth/
│   │   └── useDeviceSession.ts   # setup-code exchange + persisted session
│   ├── hooks/
│   │   └── useHouseholdData.ts   # realtime subscription to this household's data
│   ├── widgets/
│   │   ├── registry.ts           # widget id -> { component, shape, label } + buildRows()
│   │   ├── weather/
│   │   │   ├── WeatherWidget.tsx
│   │   │   ├── useWeatherData.ts     # NWS fetch/normalize
│   │   │   └── severeBackgrounds.tsx
│   │   ├── calendar/
│   │   │   ├── CalendarWidget.tsx
│   │   │   ├── buildMonthGrid.ts     # 42-day Sun-first grid for a month (month is 1-based)
│   │   │   ├── useCalendarData.ts    # mock categories, people, and events
│   │   │   ├── EventForm.tsx
│   │   │   └── seasonalThemes.ts
│   │   └── homeCare/
│   │       ├── HomeCareWidget.tsx
│   │       ├── HistoryModal.tsx      # per-item history: add/edit/delete dates
│   │       └── useHomeCareData.ts    # mock items + log/add/edit/delete history
│   ├── settings/
│   │   ├── SettingsPanel.tsx
│   │   ├── WidgetToggleList.tsx
│   │   ├── ThemePicker.tsx
│   │   └── PeopleAndCategories.tsx
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

- Whether a date library computes Easter (leaning yes) or it's hand-written.
- Exact seasonal theme color values (the rendered mockup values are a starting point).
- Full Supabase schema details (exact tables/columns beyond `household_id` + RLS).
- Which kiosk browser APK to sideload on the Fire HD 10.
- Any widgets beyond the MVP three (Weather, Calendar, Home Care).
- Exact settings UI for widget catalog / reordering (toggle list is agreed; visual
  treatment not designed yet).
