# Family Dashboard — Project Plan

Status: MVP build in progress. Layout shell, widget registry + `buildRows`, and the Home
Care widget (log today, History modal with add/edit/delete) are built on mock data. Home
Care item management (add/rename/delete/reorder) is deferred to Settings.

The Calendar widget is mostly built on mock data: month grid (chips, bands, badge, today
markers), monthly themes, holiday rings (fixed, floating, Easter, Chinese New Year), the
day modal, and add/edit/delete events through `EventForm`. **Still to build for
Calendar**: the today/tomorrow reminder strip (designed, see Calendar) and
category-based form defaults. The day modal shows each event's category in the mock
data's colors; picking colors is deferred to Settings. After that: Weather.

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
  - **Categories control only the look** (name, an optional color, maybe an icon). Households add,
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
  - **The event form** (`EventForm.tsx`, built). One modal for both adding and editing.
    - **Fields**: Title and Category share the first row; an All Day checkbox; then a
      two-column row that depends on All Day: **timed** = Date + Time, **all-day** =
      Start + End. That is how "timed events are single-day" is enforced: a timed event
      has no End field and saves `end = start`; an all-day event saves no `time`. Then
      the People chips and Save. Sharing rows keeps the form short enough to fit inside
      the calendar widget without scrolling (the modal is confined to the widget).
    - **Defaults**: today for both dates, the first category, not all-day, no people.
    - **Validation** runs on Save and shows one red message above the button: a category
      is required, a timed event needs a time, and an all-day end can't be before its
      start (the End picker also sets `min` to the start date).
    - **Category** is a `<select>` built from the household's categories; the form
      stores the category's id.
    - **People** are toggle chips, one per person. The **Everyone** chip looks different
      from the name chips (green outline + `Users` icon, with a thin divider after it)
      so it reads as an action; it fills in when everyone is selected, and tapping it
      again clears the selection.
    - **Data flow**: the form builds an event without an `id` (`Omit<CalendarEvent,
      'id'>`) and hands it to `onSave`. The hook owns ids: `addEvent` creates one with
      `crypto.randomUUID()`. The form never knows where data is stored, so swapping in
      Supabase only changes the hook's function bodies.
  - **Edit and delete events** (built). Both live in the **day modal**, on each event's
    card, mirroring Home Care's History modal (pencil + trash per entry).
    - **Delete asks first.** Tapping the trash puts that card into a confirm state
      without changing its size: the "when" text becomes a red "Delete?", and the two
      round buttons become a filled red trash (confirm) and an ✕ (cancel). **Cancel sits
      where the trash was**, so an accidental double tap cancels rather than deletes.
      (Text "Delete / Cancel" buttons were tried first; they were wider than the icons,
      wrapped the title, and made the card grow.) Only one card can be asking at a time.
    - `deleteEvent(id)` in the hook filters the event out. Deleting a multi-day event
      removes the whole event, whichever day's modal it was deleted from.
    - **Edit**: the pencil opens `EventForm` prefilled with the event's values (heading
      "Edit Event"). The form takes an optional `event` prop: present = editing, absent
      = adding. Saving calls `editEvent(id, updatedEvent)` in the hook, which replaces
      the event and keeps its `id`. The same validation applies. This is also how a
      title gets added to an untitled event later.
    - **The day modal hides while the edit form is open** and returns when it closes, so
      two dark backdrops never stack.
    - **After an edit or delete, the day modal closes itself if its day has nothing left
      to show** (no events and not a holiday), e.g. when the last event is deleted or an
      edit moves it to another day.
  - **Category choice sets form defaults only** (e.g. "Vacation" shows the end date,
    "Appointment" shows the time); it never changes the data shape. **Not built yet**,
    and needs a design decision first: categories are household data, so a category
    would need its own field saying which default it wants (e.g. `defaultAllDay`).
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
  - **Category color is optional; picking one is deferred to Settings.** A category will
    start with **no color**, and a household can pick one later from a color picker in
    Settings.
    - **For now the day modal shows the mock data's colors.** The three mock categories
      have hardcoded colors in `useCalendarData.ts` (Meeting `#378ADD`, Appointment
      `#FF5733`, Vacation `#335F57`), standing in for what Settings will provide.
    - **Day modal (built)**: an event card's second row shows the **category name in its
      category's color**, then a `·`, then the people: e.g. `Meeting · 👤 Alice, Bob`.
      The name is looked up with `getCategoryText` and the color with
      `getCategoryColor`; the color is applied with `style` (it comes from data), and a
      category with no color just shows in the row's muted gray.
      - The category label shows **only when the event has a title**; an untitled event
        already shows the category name as its title.
      - The row appears if there's a label or people; the `·` only when both are there.
    - **Reminder chips** (not built) show the title, or the category name when untitled,
      all in the theme accent.
    - A color is always shown **with** its category's name, never alone (there is no
      color key), and **never on the month grid**.
    - **Pick text-safe colors**: the color is used as small text on the cream card, so
      it has to be dark enough to read (the mock Vacation green was darkened from
      `#33FF57` for this). Something for the Settings picker to enforce.
    - The `Category` type's `color` field becomes optional (`color?`) when Settings
      arrives.
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
    - **Holidays**: a colored **ring** around the date. The ring is an `outline-4
      outline-offset-2` on the date's existing number chip (normal size), so it sits just
      outside the chip with a small gap; on an event day it outlines the filled accent
      chip, and it scales with the chip on hover. An outline (not a border) takes no
      space, so the number never shifts. Ring color depends on the holiday (e.g.
      Halloween orange), from a **developer-owned list** in code (`holidays.ts`) with a
      default ring color (slate `#6B7B8C`) for any holiday without one. The color comes
      from data, so it's applied with React's `style` (`outlineColor`), not a Tailwind
      class. Holidays are code, not household settings.
      - **Spillover days never show rings** (same rule as events): the cell's holiday
        lookup is skipped when `!day.inMonth`.
      - **Lookup**: `checkHoliday(iso)` returns the matching `Holiday` or `undefined`,
        trying each kind in turn with `??`: fixed → floating → Easter → Chinese New Year.
        `Holiday` is a union, `FixedHoliday | FloatingHoliday`; the UI only reads `name`
        and `color`, which both share.
      - **Four kinds of date rule**:
        - *Fixed* (`fixedHolidays`): `{ name, month, day, color? }`.
        - *Floating* (`floatingHolidays`): `{ name, month, weekday, occurrence, color? }`,
          where `weekday` matches `getDay()` (0 = Sun) and `occurrence` is `1`–`5` or
          `'last'`. A date's occurrence is `Math.ceil(day / 7)`; it is the last of its
          weekday when `day + 7` exceeds the month length
          (`new Date(year, month, 0).getDate()`). The weekday is computed from
          `new Date(year, month - 1, day)` (local), never `new Date(iso)` (UTC).
        - *Easter*: hand-written Anonymous Gregorian algorithm (`getEaster(year)`), no
          date library. Returns a `FixedHoliday` for that year.
        - *Chinese New Year*: follows the real lunar calendar, so no formula — a hardcoded
          lookup table of dates for **2026–2050** (`getChineseNewYear(year)`, sourced from
          Wikipedia and the Hong Kong Observatory). Years outside the table show no ring.
      - **The list**: US federal holidays plus the common observances a family cares
        about (not strictly federal).

        | Holiday | Date rule | Ring |
        |---|---|---|
        | New Year's Day | Jan 1 | Gold `#D4A017` |
        | MLK Jr. Day | 3rd Mon of Jan | Green `#1E7B45` |
        | Chinese New Year | lookup table (2026–2050) | Red `#C8102E` |
        | Valentine's Day | Feb 14 | Pink `#E75480` |
        | Presidents' Day | 3rd Mon of Feb | Red `#C8102E` |
        | St. Patrick's Day | Mar 17 | Green `#2E8B57` |
        | Easter | computed (Anonymous Gregorian) | Purple `#8E6BBF` |
        | Mother's Day | 2nd Sun of May | Pink `#E75480` |
        | Memorial Day | last Mon of May | Green `#2E8B57` |
        | Father's Day | 3rd Sun of Jun | Pink `#E75480` |
        | Juneteenth | Jun 19 | default |
        | Independence Day | Jul 4 | Red `#C8102E` |
        | Labor Day | 1st Mon of Sep | Gold `#D4A017` |
        | Columbus Day | 2nd Mon of Oct | Purple `#8E6BBF` |
        | Halloween | Oct 31 | Orange `#F28C28` |
        | Veterans Day | Nov 11 | default |
        | Thanksgiving | 4th Thu of Nov | Orange `#F28C28` |
        | Christmas Eve | Dec 24 | Green `#1E7B45` |
        | Christmas Day | Dec 25 | Red `#C8102E` |
        | New Year's Eve | Dec 31 | Gold `#D4A017` |
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
    - **Tapping**: any in-month day with a chip, band, or holiday opens a **day modal**.
      The holiday's name shows as a subtitle under the date, then every event on that day
      is listed. (The modal has no "N events" count line; the event cards show it.) The
      event list scrolls inside a fixed max height (320px) while the header stays put,
      so a very busy day can't push the modal past the widget and hide its close button. Multi-day events always show
      their **full date range** (e.g. "Vacation · Sep 21–25 · Mom, Dad"), even when the
      tapped day is in the middle of the event. (Later, maybe: tapping an empty day opens
      "+ Add event" with that date prefilled.)
    - **No color key**: bands share one tint, so there's nothing to decode, and the space
      goes to the grid. The day modal and Today chips answer "what is this?" (A
      non-color "This month" list of multi-day events could be added later if missed.)
  - **Reminder strip** (not built yet): the "what's expected today" chips.
    - **Where**: inside the calendar widget, between the month/year header and the
      grid, as in the mockup. A **fixed-height, single-row strip**: it never grows with
      the number of events (same rule as a grid cell never growing).
    - **What shows**: one chip per event whose **start date is today or tomorrow**,
      labeled "Today" or "Tomorrow". That is the whole rule; no time comparison.
      - A **multi-day event reminds only at its start**: a Sep 24 – Oct 8 vacation shows
        "Tomorrow" on Sep 23 and "Today" on Sep 24, then nothing for the rest of it.
      - A reminder **stays for the whole day**, even after a timed event's time has
        passed, so one that was missed at the time can still be seen later. It clears
        itself at midnight. (Timed events store only a start time, so there is no end
        time to expire on anyway.)
      - Today's and tomorrow's reminders can show together.
      - A chip shows the event's title, or its category name when untitled (same
        fallback as the day modal).
    - **Order** decides which chips get the visible slots: today before tomorrow;
      within a day, timed events in time order.
    - **Overflow**: the strip shows a small fixed number of chips (about 2–3; settle by
      testing), then a **"+N more"** chip counting everything that didn't fit, **today's
      and tomorrow's together**.
    - **Tapping "+N more"** opens the existing day modal on today, with **Today /
      Tomorrow tabs** at the top to switch days. It reuses the day modal (scrolling,
      edit, delete) rather than adding a new one. The modal lists every event on that
      day, including multi-day events already in progress, so it can show more than
      the chip counted.
    - **Empty**: when nothing starts today or tomorrow, the strip stays in place with a
      quiet message (e.g. "Nothing today") so the grid doesn't change size. Revisit if
      it looks tacky on the real screen.
    - **No dismissing** on the wall for the MVP. Reminders clear themselves at midnight
      and the overflow handles a crowded strip; a per-chip ✕ would need remembered state
      and a tap target that makes every chip wider. Add later if the strip feels
      cluttered in real use.
    - **Needs a "current time" tick**: React only redraws on a state change and the
      tablet can sit untouched for hours, so the strip (and the red today markers, which
      would otherwise stay on yesterday after midnight) need a timer. A small shared hook
      (e.g. `useNow()`: a `useEffect` with a one-minute `setInterval`, cleared on
      unmount) that the dashboard clock can use too.
  - **Every month has its own theme** (changed from six shared seasonal themes). Each
    month's calendar card gets a tinted **background**, a stronger tinted **header**,
    and a small **scene of faint watermark icons** tucked into the bottom corners of the
    grid area (a faint repeating icon pattern was tried and rejected as too
    busy/hard to see). Hex values below are the starting values from the design pass;
    tune on the real screen.

    | Month | Theme | Header / body | Watermark scene |
    |---|---|---|---|
    | Jan | Snowflake flurry | icy blue `#D3E2EE` / `#EFF4F8` | 3 × `Snowflake` (big BR, two small drifting above), blue `#4A7FA8` |
    | Feb | Rose | blush `#E9CBC6` / `#FBF1EE` | `Rose` BR + 2 small `Heart` BL, berry `#B0324A` |
    | Mar | Clover cluster | shamrock `#D4E6D0` / `#F0F6EC` | 3 × `Clover` cluster, green `#3E8E4F` |
    | Apr | Cherry blossom | blossom pink `#EFCAD3` / `#FBEFF1` | 3 × `Flower` cluster at slight angles, sakura `#D67892` |
    | May | Birdhouse garden | garden green `#E3E9CC` / `#F7F8EC` | `Birdhouse` BR with `Bird` perched on its roof (brown `#8C643C` / blue `#4678A0`); `Sprout` (green) + `Flower2` (coral `#D66E50`) BL |
    | Jun | Beach | aqua `#CDE5E1` / sand `#FAF3E4` | `TreePalm` BR (teal `#288C82`); `Shell` (coral) + `Star` as a starfish (orange `#E28C32`) BL |
    | Jul | Firework festival | violet `#B8ABE0` / `#E9E4F7` | `Sparkles` + 4 × `Sparkle` bursts across both corners in red `#CE3C46`, cyan `#2896BE`, gold `#D6A01E`, pink `#DC5AA0` |
    | Aug | Summer fruit | coral red `#EFBBAA` / `#FCEEE7` | `Citrus` BR (orange), `Grape` (purple), `Apple`; `Cherry` + 2nd `Citrus` in lemon yellow, rotated, BL |
    | Sep | Squirrel & maple | pumpkin `#EDB983` / peach `#F8ECDD` | `Squirrel` BR + 2 × `Nut` (acorns), brown; 3 × **maple leaf** (custom) in rust/orange/gold |
    | Oct | Halloween | plum `#C3B2D1` / pumpkin `#F5DFC6` | `Ghost` BR in cream at `/50` + **pumpkin** (custom, orange) + `Skull` (charcoal); cropped **spider web** in the BL corner with a **spider** hanging off it (custom, charcoal) + `Candy` in plum `#6B4F8A` |
    | Nov | Thanksgiving dinner | rust `#DDB59C` / `#F7ECE3` | `Ham` BR (main) + smaller `Drumstick`; `UtensilsCrossed` + `Wheat` BL; a `Leaf` above |
    | Dec | Christmas | pine `#C2D4C0` / cranberry `#F6E6E1` | `TreePine` BR (holly `#2E9E5B` at `/25`) with a gold `Star` on its tip; 2 × `Gift` under it (red + green); `CandyCane` BL; 2 small cream `Snowflake`s drifting |

    (BR = bottom-right, BL = bottom-left.)

    - **Data shape:** `seasonalThemes.ts` holds 12 theme objects (one per month) and a
      12-entry month → theme array, looked up with `[month - 1]`. Each theme is
      `{ background, header, watermarks }`, where `watermarks` is a **list** of
      `{ icon, className }` entries (icon component + full Tailwind classes for size,
      position, rotation and color). This replaces the earlier fixed
      `watermarkIcon` / `secondaryIcon` fields, since most months now use 3–7 icons.
      Tailwind classes must be written out in full in the data (never built with
      `${…}`), or Tailwind won't generate them.
    - **Paired icons** (icons that touch: May's bird on the birdhouse roof, December's
      star on the tree tip) only line up at their exact sizes/positions. Keep each pair
      next to each other in the list with a comment. Align to the icon's *visible* edge:
      a big icon's scaled-up stroke makes its visible tip sit well above its geometric
      point (the first star placement was off because of this).
    - **Custom icons** are allowed only where Lucide has no match: **maple leaf**
      (Sep), **pumpkin**, **spider**, **spider web** (Oct). Draw them on Lucide's 24×24
      grid with 2px round-capped outline strokes and build them with lucide-react's
      `createLucideIcon`, so they behave exactly like Lucide icons (same `className`
      handling and `LucideIcon` type). A custom turkey was tried and dropped (it read
      as a generic bird); a turkey, maple leaf, pumpkin and spider don't exist in
      Lucide as of v1.47.
    - Developer-owned code, not a household setting (same as holidays).
    - **Layout:** the tinted header runs **full-width** (edge to edge across the top
      of the card, no inset strip or divider line) in the stronger `header` tint; the
      area below it (weekday row + grid) is the lighter `background` tint, and the
      watermarks sit in that lower area. Compared against a cream header with only a
      seasonal body (calmer, but loses seasonal color) and a divider line between the
      two (unneeded; the tint step is the edge).
    - Colors are `@theme` tokens per month (e.g. `--color-sep-bg`, `--color-sep-header`,
      `--color-sep-icon`, plus extra icon tokens for multi-color scenes), not Tailwind's
      stock palette, so they match the app's warm palette and can be tuned in one
      place. Icons are drawn in the month's colors at low opacity, not gray. Watch that
      the green "+ Add Event" button stays pleasant on every header tint (green headers
      in Mar/May/Dec especially), and that gray spillover numbers stay readable on the
      deeper bodies (Jul, Oct, Dec).
    - **Watermark strength is per icon**, set by the color's `/` opacity in the class
      (e.g. `text-sep-icon/20`), never also an `opacity-*` on the element (the two
      multiply: 10% of 10% = invisible, which is how the Halloween candy disappeared).
      Typical range `/15`–`/25`. Exceptions: **light icons on a light body need much
      more** (Halloween's cream ghost `/50`, Christmas snowflakes `/70`), and **a green
      icon on a red body** cancels toward muddy gray, so it needs a brighter, more
      saturated color and a higher value (Christmas tree `/25` in `#2E9E5B`).
    - Neighboring months must look different when arrowing between them (e.g. Sep's
      pumpkin header vs. Oct's plum vs. Nov's rust; Aug's coral vs. Sep's orange).
    - Lessons from the design pass: bright mint + pink reads as "watermelon" (keep
      Christmas tints muted and warm); purple as a *body* felt foreign to the palette,
      but as a *header* (Oct) or twilight (Jul) it works.
  - **Grid numbers use tabular digits** (`font-variant-numeric: tabular-nums` /
    Tailwind `tabular-nums`) so "11" and "28" don't look like different sizes. Built:
    the class is on the number chip. It has no visible effect with the current system
    font on Windows (Segoe UI's digits are already equal-width, 9.2px each); it's there
    as a safeguard for the tablet's font or a bundled font later.
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
│   │   │   ├── dayEvents.ts          # events covering a given day
│   │   │   ├── useCalendarData.ts    # mock categories, people, events + add/edit/delete event
│   │   │   ├── DayModal.tsx          # a day's holiday + events; edit/delete per event
│   │   │   ├── EventForm.tsx         # add + edit event form
│   │   │   ├── holidays.ts           # holiday lists, Easter, Chinese New Year, checkHoliday()
│   │   │   ├── seasonalThemes.ts     # one theme per month
│   │   │   └── customIcons.ts        # maple leaf, pumpkin, spider, spider web
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

- Phone companion: its "today's appointments (dismissible)" list predates the wall's
  reminder-strip design (no dismissing on the wall); revisit the phone's version later.
- The category color picker in Settings: which colors are offered (a fixed palette
  avoids clashes with holiday rings and monthly themes; free choice doesn't, and every color must
  be readable as small text), and whether reminder chips show the color too.
- How a category declares its form defaults (e.g. a `defaultAllDay` field), needed
  before "category choice sets form defaults" can be built.
- Exact seasonal theme color values (the rendered mockup values are a starting point).
- Full Supabase schema details (exact tables/columns beyond `household_id` + RLS).
- Which kiosk browser APK to sideload on the Fire HD 10.
- Any widgets beyond the MVP three (Weather, Calendar, Home Care).
- Exact settings UI for widget catalog / reordering (toggle list is agreed; visual
  treatment not designed yet).
