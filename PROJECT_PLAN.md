# Family Dashboard — Project Plan

Status: MVP build in progress. Layout shell, widget registry + `buildRows`, and the Home
Care widget (log today, History modal with add/edit/delete) are built; Home Care now
loads and saves through Supabase. Home Care item management (add/rename/delete/reorder)
is a later feature.

**MVP trimmed (October 16, 2026)** to get to real daily use sooner. With the three
widgets built, what's left is **Supabase → deploy → tablet**, plus a small Settings
screen whose only setting is the **color theme** (see "Settings (MVP): color theme").
Everything else that was planned for the MVP is now listed under "Later features".

**In progress: Supabase** (build order step 4; see "Supabase build stages"). The
project, client and sign-in are done, the `households` and `household_members` tables
exist with RLS and grants, and the dashboard loads the household (name, location,
widget layout, color theme) from Supabase, shared through React context. Choosing a
color theme or a weather location saves it back (stage 3 is done). Home Care items and
their history load from Supabase and all four history writes save (stage 4 is done).
Calendar categories, people and events load from Supabase, and adding, editing and
deleting events (with their people) save (stage 5 is done). Every widget now uses real
data. Next: migrations (build order step 6), then the setup template, deploy and tablet.

**Built: Settings (color theme).** The header's gear opens a Settings modal with a 3×2
grid of color swatches; tapping one recolors the dashboard's accent at once and the
modal stays open. The choice is saved to the household's `color_theme` in Supabase and
loads back on reload.

The Calendar widget is built and loads and saves through Supabase: month grid (chips, bands, badge, today
markers), monthly themes, holiday rings (fixed, floating, Easter, Chinese New Year), the
day modal, add/edit/delete events through `EventForm`, and the today/tomorrow reminder
strip. Nothing is left to build for the widget itself; managing categories and people
and picking category colors in Settings is a later feature (they're admin-managed in
Supabase until then).

The header is built except for the parts that depend on other work: date and time,
household name, and a settings button that opens Settings (see "Header and household
settings").

**Built: Weather.** The widget runs on live data from the National Weather
Service, refreshed every ten minutes and whenever the screen wakes: the Now card with
its note for rain, snow or storms coming soon, the Hourly / Weekly switch, the day and
hour cards, the alert banner and alerts modal with colors by severity, and the
animated weather backgrounds. Alerts hide themselves when they end, and "Today" is
decided by date, so evening forecasts are labeled correctly. The place name in the
widget opens a **location picker** that searches by town or ZIP code (Open-Meteo) and
reloads the weather for the chosen place. The chosen place is saved to the household
in Supabase and loads back on reload. All seven build
stages are done (see the build stages under Weather).

**Modals** all go through one shared `Modal` component (`src/components/Modal.tsx`) and
open centered over the whole dashboard. It draws its overlay into the dashboard's root
element (`id="dashboard"` in `App.tsx`) with a portal, so it doesn't matter which widget
opened it. Before this, each modal filled its nearest positioned ancestor: the day modal
and event form only covered the calendar card, which left the rest of the dashboard
tappable and let a second modal open at the same time; and the alerts modal was trapped
in the 250px weather band.

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
- **Location picker** — inside the Weather widget (see "Setting the location").
- **Settings** — opened from the header's gear button; for the MVP its only setting is
  the color theme (see "Settings (MVP): color theme").
- **Real data and a real device** — Supabase persistence, deployed, running on the
  tablet. See "Build order".
- **Weather**
  - **Weather is the dominant widget**: it's the one looked at most, so it gets the top
    band and more height than a first guess would give it.
  - **Height: the weather row is 250px** (`h-[250px]` in `App.tsx`; the card inside is
    1248×218). The mockup's band is about 310px, which left the calendar cut off after
    its fourth week; 200px forced everything into one cramped row. 250px keeps the
    mockup's two rows with shorter forecast cards. The three were compared on the live
    layout before choosing.
  - **Layout**: the mockup's two rows, with the changes below. Each was previewed on
    the live dashboard before being decided.
    - **Top row** (56px, `h-14`): the Now card on the left, the alert banner in the
      middle, the Hourly / Weekly switch on the right. The banner sits outside the
      row's flow, so the Now card and the switch don't move when an alert appears or
      clears. It was 64px at first; 8px went to the forecast cards, which were cramped
      with five lines each. The alert banner has not been built at this height yet.
    - **Bottom row** (about 120px): forecast cards, switched between hours and days.
    - **Padding**: 12px, except 20px at the bottom (`p-3 pb-5`), which is where the
      page dots sit.
  - **Now card**: icon (animated), large temperature, condition, and today's high and
    low. **Fixed width** (400px), so it never changes size. It was 320px; real
    conditions such as "Slight Chance Rain Showers" didn't fit. The condition is one
    line in the theme green (`text-primary`) and is cut off with "…" if still too long.
    - **The "soon" note lives here** (built), as a third line under the high/low,
      shown only when precipitation may be on the way. It needs no data of its own.
      - **When it shows**: the rain chance of the current hour or the next one
        (`hours[0]` or `hours[1]`) is 30% or more. 30% and not 50%, because knowing
        there is a chance at all is the useful part.
      - **What it says** depends on those two hours' condition text, checked in this
        order: thunder → "Chance of storms soon", snow → "Chance of snow soon",
        otherwise "Chance of rain soon". "Chance of" and "soon" (not "Rain likely
        next hour") because 30% isn't likely and two hours are covered.
      - **Icon**: the matching animated Meteocons icon, small, beside the words. It is
        drawn larger than its line with negative margins (the icons have a wide empty
        border) and has the cloud outline described under "Icons" below.
  - **Hourly / Weekly switch**: a pill with both words always visible and a highlight
    that slides behind the selected one. The widget opens on Hourly.
  - **Alert banner: one banner, official alerts only.** The mockup stacked two things in
    one box (an alert on top, a rain note with a tiny bar chart below); that was dropped
    as janky: two kinds of information in one box, a shape that changed with what was
    active, and text too small for a row that short.
    - It shows the **single most serious** active alert: the alert's `event` as the
      title, and a timing line under it (see "The timing line" below). A **"+1"** chip
      shows when more are active. On a calm day there is no banner.
    - **Built.** It is a button, 260px wide, **centered on the widget** (absolutely
      positioned in the top row, not spaced between the Now card and the switch). That
      puts it on the same center line as the household name above and the page dots
      below; the gaps to its two neighbors are uneven, which was accepted. The count
      chip is pinned to the banner's right edge, outside the text's flow, so the title
      stays centered whether or not the chip shows.
    - **Color by severity** (built): Extreme `#F4B0A8` (red), Severe `#F8CC9C`
      (orange), Moderate `#FBEBA5` (yellow), Minor `#CFE2F3` (blue), Unknown `#E4E1DB`
      (grey). They live in `severityColors` in `alertColors.ts`, shared by the banner
      and the modal, not in `useWeatherData.ts`.
      - **Both show the color at 75%**, mixed with white (`color-mix`): the banner as
        its background, and each modal card as a 6px strip down its left edge. The
        full-strength red was too heavy as a banner background.
      - These are the first set tried and were accepted "for now"; still adjustable.
      - Hover darkens whatever color the banner has (`hover:brightness-95`).
    - **Only real NWS fields are shown.** A short summary like "Gusts to 35 mph" is not
      a field anywhere, so it isn't displayed; text is never made up.
    - **Tapping the banner** (the whole banner, not just the chip) opens the alerts
      modal, even when there is only one alert.
  - **Alerts modal**: opens **over the whole dashboard**, centered (about 600px wide),
    not inside the weather card, which is far too short. It is the first
    dashboard-level modal. Read-only. It lists every active alert, most serious first;
    each card has the title, the timing line, the description, and the instruction as
    "What to do", in a scrolling list.
    - **Built** (`AlertsModal.tsx`): 600px wide, a 480px scrolling list, one card per
      alert. `severity` shows only as the color of the card's left strip; `expires` is
      not shown.
    - **NWS alert fields** (checked on live alerts): `event`, `severity` (Extreme /
      Severe / Moderate / Minor / Unknown), `onset`, `ends`, `expires`, `instruction`,
      and `areaDesc` are separate fields. What / where / when / impacts are **not**:
      they arrive together in `description` as one string, often with markers
      (`* WHAT...`, `* WHERE...`, `* WHEN...`, `* IMPACTS...`). Not every alert uses
      the markers: an Air Quality Alert was one plain block of text, with no
      `instruction` and no `ends`.
    - **The description is tidied, never parsed into fixed sections** (chosen over
      showing it raw, hiding it behind a "Show details" button, and not showing it at
      all; previewed with two real alerts, one of each kind). One renderer for every
      alert: break the text into paragraphs; if a paragraph starts with a capitalized
      label and `...` (e.g. `WHAT...`), show the label in bold ("What:") and the rest
      as normal text; otherwise show it as a plain paragraph. Nothing is thrown away,
      and it doesn't break when an alert is worded differently. A "details on tap"
      version was rejected because an alert with no `instruction` collapsed to just a
      title and a button.
    - **Clean-ups, each one safe on its own** (it clearly applies or it's skipped; none
      tries to understand the alert). When unsure, show the text as it came. Accepted
      as not perfect.
      - Treat a single line break as a space and a blank line as a new paragraph: NWS
        hard-wraps its text at about 70 characters. **Built** (`getParagraphs`), and
        used for the instruction text too.
      - A leading label is recognized when the text before the first `...` is all
        capitals and under 30 characters, after an optional `* `. It is shown bold as
        "What:". **Built** (`splitLabel`). Anything else stays a plain paragraph.
      - Drop a first paragraph that is one short all-capitals word with no spaces (a
        product code such as "AQAFWD"). Confirm against raw saved text. **Not built.**
      - Leave trailing web addresses alone; there's no safe way to tell them from
        useful text.
      - If a description is very long, cut it off after a set number of lines with a
        "Show more". **Not built.**
      - **Tested only on marker-style text.** All 22 saved Wind Advisories use the
        `* WHAT...` markers (What, Where, When, Impacts, and Additional details on
        two). The plain-paragraph path has not met a real unmarked alert yet.
    - **The timing line** (on the banner and on each modal card) has three cases:
      not started yet → "Starts Thu 10:00 AM" (an alert can be issued days before its
      `onset`, and still shows, since a heads-up is the point of a watch); under way
      with an `ends` → "Until Fri 7:00 AM"; under way with no `ends` → "Since today
      3:12 PM".
    - **`expires` is not the end of the weather.** It's when the message goes stale; on
      a real High Wind Watch it was a day *before* the wind started. Never display it
      as an end time.
    - **When an alert stops showing**: two mechanisms, both needed.
      - **Refetching.** `/alerts/active` only returns alerts in effect now, so an ended
        or cancelled alert is simply missing from the next response. This is the only
        way to learn about an early cancellation.
      - **A time check when drawing**, as a safety net between fetches and when a fetch
        fails (e.g. wifi drops): skip an alert whose `ends` has passed, or whose
        `expires` has passed when it has no `ends`. It compares against `useNow()`, so
        it stays current on an idle tablet.
      - **Both are built** (see "Real fetching"). Everything refetches every ten
        minutes for now.
    - **Collect real alerts as test samples.** Save alerts of different kinds into
      `mock/` as they come up (with markers, plain text, a flood warning, a winter
      storm), and check the tidy-up code against all of them whenever it changes.
  - **Hourly view**: **24 hours, six cards per page**, with an arrow button at each end
    (the mockup's paging), and **page dots centered under the cards**, as in the
    mockup. Built.
    - **Arrows** are small round buttons, vertically centered beside the cards. Each
      is disabled and faded at its end of the range (with no hover effect while
      disabled). Wrapping around like a carousel was considered and rejected.
    - **Dots** sit inside the band's bottom padding, which was deepened from 12px to
      20px for them: 6px dots in a 12px strip looked squished.
    - **Each card**: time, icon, condition, temperature, rain chance. No high/low (an
      hour has one temperature). The icon uses the hour's `isDaytime`, so night hours
      get night icons.
    - **Time of day is shown by the card's color**, not the mockup's NIGHT / MORNING
      tag on every card, which cost a line of height on a 120px card.
      Ranges: **Night 9 PM–4 AM, Morning 5–11 AM, Afternoon 12–4 PM, Evening 5–8 PM**.
      Tints: Morning `#FCE4A0`, Afternoon `#BEDFF4`, Evening `#F4C6B4`, Night
      `#BFC4EA` (`timeOfDayTints` in `WeatherWidget.tsx`, looked up by the hour's
      `timeOfDay`). Evening is a warm peach so it doesn't blur into night's indigo.
      The colors live with the drawing code, not in `useWeatherData.ts`.
    - **Two strengths of the same tint**: the time sits in a full-strength band across
      the top of the card, and the body below is a 30% mix of the tint with white
      (`color-mix`). Arrived at in three tries:
      - The whole card at full strength: the yellow sun icon was hard to see on it.
      - A white disc behind the icon: looked like a patch.
      - The band over a plain card-colored body: read as a header stuck on a white
        card.
    - **No label naming the tint** ("EVENING" on the first card of a page and wherever
      the time of day changes) — planned, then dropped. The time is printed in the
      band, the color change already marks where one part of the day ends, and the
      label needed a sixth line on a card that is full at five.
    - A sun or moon icon beside the time was considered and rejected: it sits right
      above the weather icon, which is often a sun or moon itself, and the two read as
      one condition. The weather icon already switches to a night version after dark.
  - **Weekly view** (built): seven day cards, each with the day name, icon, condition,
    high and low, and rain chance, on five lines.
    - **High and low share a line** as "61° / 42°": the high large and dark, the slash
      and the low smaller and muted. Low and rain chance on one line was tried and
      looked wrong (two unrelated numbers joined together).
    - **No single "day temperature".** The mockup's large number is the average of the
      high and low, which isn't a forecast value and would disagree with the Now card
      on today's card. The high is the large number instead.
    - **The condition text is kept from the mockup**, under the icon.
    - **On the day and hour cards the condition is shortened** (`shortCondition` in
      `WeatherWidget.tsx`): only the part before " then " is kept ("Rain Showers then
      Partly Sunny" becomes "Rain Showers"), and "Slight Chance ", "Chance " and
      " Likely" are removed, because the rain chance shown just below already says how
      likely it is. The Now card keeps the full text. Anything still too long is cut
      off with "…"; the span has a little bottom padding so `truncate` doesn't clip
      letters like "y".
      - **All cards keep equal widths** (`min-w-0` on each card). Without it, a long
        one-line condition made its card wider than the others.
      - **Two lines of condition text was tried and dropped**: the cards had no room,
        so it meant smaller text, a smaller icon and tighter gaps, and it looked
        cramped.
      - **Next nice-to-have: tap a day for the full forecast.** NWS sends a
        `detailedForecast` for every period ("Rain showers likely before noon, then
        partly sunny. High near 50."). Tapping a day card could open it in a modal.
        Needs the hook to carry `detailedForecast` through and the cards to become
        buttons.
  - **Rain chance** (both views) is its own line, in blue, with a droplet icon. The
    value is NWS's `probabilityOfPrecipitation`, the chance of any precipitation, so
    the droplet becomes a snowflake when the condition mentions snow. The field is
    still named `rainChance`.
  - **Icons are chosen from the condition text** at draw time; they are not stored in
    the data. `getWeatherIcon(condition, isDaytime)` in `weatherIcons.ts` matches
    keywords (thunder, snow, rain or shower, fog, partly / mostly sunny / mostly clear,
    cloud; otherwise clear) and returns an animated and a still version of a
    **Meteocons** icon (`@meteocons/svg` and `@meteocons/svg-static`), not Lucide. The
    Now card uses the animated one and the forecast cards the still one; day cards
    always use the daytime icon. NWS's own `icon` field is a link to a dated image
    and isn't used. Lucide is still used for the droplet, snowflake and arrows.
    The icons are Meteocons' `fill` style. The `line` style was tried for clearer
    clouds and rejected: it is outline-only, and the suns became thin rings.
    - **Cloud icons get a dark outline; suns don't.** The pale clouds faded into the
      near-white cards. Each icon `getWeatherIcon` returns carries an `outline` flag:
      true for everything with a cloud in it (thunder, snow, rain, fog, partly cloudy,
      cloudy), false for clear day and clear night. The widget applies one class,
      `iconOutline` in `WeatherWidget.tsx` (a 1px drop shadow at 0.9 black, which
      follows the drawing's shape), wherever the flag is true: the Now icon, the day
      and hour cards, and the "soon" note. An outline on every icon was tried first;
      it made the suns look tacky.
  - **Built so far**: `WeatherWidget.tsx` is registered as a full-width widget, first
    in the layout, with everything above marked built. `useWeatherData.ts` has the
    types (`CurrentWeather`, `DayForecast`, `HourForecast`, `WeatherAlert` and
    `WeatherData`, which is `{ current, days, hours, alerts }`) and builds all four
    from live NWS responses (see "Real fetching" below). `HourForecast` has `timeOfDay`
    and `isDaytime`. Temperatures and rain chance are numbers; the "°" and "%" are
    added when drawing.
    - **Alerts in the hook**: each NWS feature becomes a `WeatherAlert`: `title` from
      `event` (not `headline`, which is a full sentence), `start` from `onset` (not
      `effective`, which is when the message was issued), `end` from `ends`, plus
      `expires`, `severity`, `description` and `instruction`. `end` and `instruction`
      can be missing. The list is sorted most serious first (`severityRank`: Extreme,
      Severe, Moderate, Minor, Unknown), so the banner takes the first one and the
      modal shows them in order.
    - **The timing sentence** is `getAlertTiming(alert, now)` in `alertTiming.ts`, shared
      by the banner and the modal. Times are formatted by `formatWeekdayTime` in
      `src/lib/dates.ts` and shown in the device's time zone.
  - **What the NWS data looks like** (checked against real responses):
    - Two steps: `/points/{lat},{lon}` returns links, not weather; follow its
      `forecast` (7-day) and `forecastHourly` links. Grid numbers can't be guessed (a
      wrong one can land on water and return "Marine Forecast Not Supported"). At most
      four decimal places, and no space after the comma. Alerts are separate:
      `/alerts/active?point={lat},{lon}`.
    - The 7-day forecast is 14 periods, a day and a night each, and the first can be
      either depending on the time of day. A daily high/low has to be paired from them.
    - The hourly forecast is ~156 one-hour periods with the same fields plus dewpoint
      and humidity. **"Now" comes from the first hourly period**; there is no separate
      current-conditions entry in these responses.
    - `windSpeed` is text ("5 to 10 mph"), not a number. There is no condition code:
      the condition is words in `shortForecast` ("Mostly Sunny", "Chance Rain
      Showers"), so icons and weather backgrounds are chosen by keyword.
    - Errors come back as JSON with `status`, `title` and `detail`.
  - **Mock data**: four saved real responses in `src/widgets/weather/mock/`
    (`forecast.json`, `forecastHourly.json`, `alerts.json`, `alertsSevere.json`).
    `alerts.json` is a calm day with an empty list. `alertsSevere.json` is every Wind
    Advisory active nationwide on October 11, 2026
    (`/alerts/active?event=Wind%20Advisory`): 22 alerts, all Moderate as fetched. **The saved
    file has been hand-edited for testing**: one alert's severity is set to Extreme
    and one to Minor, so the sort and the colors have something to show. It is no
    longer an exact NWS response.
    - **The app no longer reads these files at runtime**; it fetches live. They are
      kept as test samples, for working offline, and as the source of the raw
      response types. To test alerts, pass `alertsMock` in place of `raw.alerts` in
      the hook temporarily, and reload the page.
    - **Limits of this sample**: one alert type and one severity, so it can't test
      ranking; and 22 alerts is far more than one location would get, so the chip
      reads "+21". A mixed sample (e.g. `/alerts/active?area=` plus a state code) and
      an unmarked plain-text alert are still worth saving.
    The files contain the location they were fetched for.
  - **Build stages**: (1) look at real data and save it — done; (2) decide the tidy
    data shape and types — done; (3) `useWeatherData()` returning that shape from the
    mock files — done; (4) the layout — done; (5) alerts — done; (6) weather
    backgrounds — done; (7) real fetching with loading and error states, using the
    household's location — done.
  - **Real fetching** (stage 7), built in steps that each left the app working:
    1. **The location lives on the household.** `useHouseholdData()` returns an
       optional `location: { latitude, longitude, name }`; the mock household is
       42.2555, -71.034, "Quincy, MA". It is optional because a new household starts
       without one. Moved first, ahead of the fetch, so nothing had to be rewired.
    2. **Building is separate from loading.** `buildWeatherData(forecast,
       forecastHourly, alerts)` turns the three raw NWS responses into `WeatherData`.
       Its parameter types come from the saved mock files (`typeof forecastMock` and
       so on), which is one reason the mock files are kept.
    3. **Fetching.** `fetchWeather(latitude, longitude)` calls `/points/{lat},{lon}`,
       then fetches the forecast, the hourly forecast and
       `/alerts/active?point={lat},{lon}` together (`Promise.all`). `fetchJson` throws
       when a response isn't OK, since `fetch` doesn't treat 404 or 500 as failures.
    4. **The hook reports a state, not just data.** `useWeatherData()` returns a
       `WeatherState`: `loading`, `noLocation`, `error`, or `ready` with `data`. The
       widget checks the status first and shows a short message for the other three
       ("Loading weather…", "Set a location to see the weather.", "Couldn't load the
       weather."), in the same grey box so the row doesn't change size. The check is
       an early return after the widget's hooks, not a separate wrapper component.
    5. **Keeping it fresh.** The fetch runs once on load, then every ten minutes
       (`setInterval`), and again whenever the page becomes visible
       (`visibilitychange`), which covers the screen waking up. Everything is
       refetched together; splitting alerts (5–10 minutes) from forecasts (30–60) was
       left for later. A **failed refresh keeps the last data** on screen; only a
       failure with nothing loaded yet shows the error message. The effect re-runs
       only when the location's latitude or longitude changes.
    6. **Ended alerts and "Today".**
       - `isAlertActive(alert, now)` in `alertTiming.ts`: an alert is over once its
         `end` has passed, or its `expires` when it has no `end`. The widget filters
         with it once (`activeAlerts`), and the banner, the count and the modal all
         use that list. It re-checks every minute via `useNow()`, so an alert
         disappears within a minute of ending without a fetch. Tested by feeding in
         the saved October 11 advisories with the clock set to that evening: 19 of
         the 22 showed, the three that had ended didn't.
       - **"Today" is decided by date**, not by position: `isToday` compares a
         period's date with `getTodayISO()` from `src/lib/dates.ts`. In the evening
         the 7-day forecast starts with tonight, so the first day card is correctly
         tomorrow's weekday. The Now card's high only uses a daytime period that is
         today, so after dark it shows only the low (`high` is optional in
         `CurrentWeather`). The last day card can have no night after it; its low is
         now left out instead of copying the high (`low` is optional in
         `DayForecast`). The widget skips a missing high or low (`!== undefined`, so a
         temperature of 0 still shows).
    7. **The location picker.** Built. See "Setting the location" for the design.
       - **The widget owns the location while running**: `WeatherWidget` keeps it in
         `useState`, starting from `useHouseholdData().location`, and passes it to
         `useWeatherData(location)`. The `Location` type is exported from
         `useHouseholdData.ts`. The hook's effect now depends on `[location]`: state
         keeps the same object until it is replaced, so this refetches exactly when a
         new place is chosen. (Earlier it watched latitude and longitude, because
         `useHouseholdData()` builds a new object on every call.)
    - **Two things that cost time**: the dev server keeps a component's state when a
      file is saved, so a change to what the next fetch does only shows after a page
      reload; and the widget showed no alert banner on live data simply because
      Quincy had no active alerts, which is correct.
  - Alerts are ranked so the banner shows the most serious one (the mockup's logic
    ranks rain < wind < storm < tornado; NWS's own `severity` field is the starting
    point). Built on `severity` alone; alerts of equal severity keep NWS's order.
  - **Animated weather backgrounds** (built, `WeatherBackground.tsx`): rain, snow,
    thunderstorm, wind and blizzard, in plain CSS with no library. Tornado, from the
    original list, was not built. On an ordinary day nothing is drawn and the widget
    keeps its plain grey. Called "weather" and not "severe" backgrounds because
    "severe" already means an alert's severity, which has nothing to do with this.
    - **Animated or nothing.** Static versions (a color and a pattern per condition)
      were mocked up and rejected: the patterns only show in the gaps between cards
      and added little.
    - **How one is chosen**: `getBackgroundKind(condition, rainChance)` reads the
      current condition text, the same text `getWeatherIcon` reads, and returns one
      kind. Checked in this order, first match wins: blizzard, thunder, snow, rain
      (or "shower"), wind, otherwise none.
      - **Blizzard, snow and rain need a rain chance of 50% or more** for the current
        hour (`weather.hours[0].rainChance`), so "Chance Rain Showers" at 30% doesn't
        rain on screen. Thunder shows whenever the condition mentions it, at any
        chance. Wind ignores the rain chance.
      - **One background at a time.** A design that combined separate ingredients
        (rain, snow, lightning, wind, heavy) was worked out and set aside as too many
        rules for the first version. Known costs: a thunderstorm always shows rain,
        even a dry one, and rain during a wind advisory falls straight.
      - **Wind is triggered by the condition text only**, which rarely says "wind".
        Triggering it from an active wind alert was discussed and not built; the
        saved sample's 22 wind advisories show no wind.
      - An unrecognized word turns nothing on, so the fallback is the plain
        background, never a wrong one. It is a forecast, not a sensor: the screen can
        show rain while the window is dry.
    - **Where it sits**: one layer, first inside the widget's outer div, filling it
      (`absolute inset-0`) and ignoring taps (`pointer-events-none`). The cards are
      solid, so it shows only in the gaps and around the edges. The bottom row needed
      `relative` added so its cards draw in front of the layer.
    - **How it's drawn**: each kind has one line in `backgroundSettings`: `count`,
      `shape` (size and color classes), `speed` (seconds for one pass, so smaller is
      faster), `across` (false = falls, true = blows left to right), `drift` and
      `sway`. One loop draws `count` pieces from those settings.
      - Each piece's position, speed, drift and rhythm are worked out from its index,
        not `Math.random()`, because the widget re-renders every minute and random
        values would make every piece jump.
      - **Drift and sway** were added because pieces moving in dead straight parallel
        lines looked mechanical. Drift: each piece ends a different distance off its
        axis. Sway: a second, slower back-and-forth runs alongside the main movement
        (rain and thunder have none).
      - **Wind** pieces are lucide's `Wind` icon, not straight bars, which didn't read
        as wind. **Blizzard** is 100 white dots blown sideways, tuned to be harsh.
      - **Thunderstorm** adds a white sheet that flickers and a jagged yellow bolt (an
        SVG `polyline`) in the gap beside the banner, both on a 7-second cycle. The
        bolt has its own animation (`weather-bolt`) that holds at full strength
        across the sheet's flicker.
    - **The animations** are six `@keyframes` rules at the end of `src/index.css`:
      `weather-fall`, `weather-blow`, `weather-sway`, `weather-bob`, `weather-flash`
      and `weather-bolt`.
    - **Two things that cost time while building**:
      - An element that names an animation which doesn't exist gives no error; it
        just doesn't move.
      - Editing one element's animation while the page is open restarts only that
        element's clock, so the bolt and the flash drifted apart until the page was
        reloaded. Reload before judging timing.
    - **Not yet done**: tried on the real tablet (smoothness on a Fire HD 10 is
      untested), and seen against real weather. All tuning so far was done with a
      kind forced on over the sunny mock.
  - **Chosen data source: National Weather Service API (`api.weather.gov`)** — free,
    no API key, and the mockup's own code comments already model its hourly data on
    NWS's gridpoint forecast fields, so this is a close match rather than a rework.
  - **Note for when we build Weather: iOS-style next-hour precipitation chart.** Idea
    (from the iOS Weather widget): when rain is expected soon, the "Now" card shows a
    small precipitation bar chart ("Now · 15m · 30m…") plus a one-line summary, and
    it's hidden on dry hours. That moves the routine rain heads-up out of the middle
    banner, leaving the banner for real alerts only (wind, storm, tornado…).
    - **Decided for the MVP:** no bar chart. The rain heads-up is the one-line note in
      the Now card (see above), and the hourly cards show each hour's rain chance.
    - **Data catch:** NWS's finest resolution is hourly, so it can't drive a
      minute-level chart. MVP keeps the simple "Chance of rain soon" line from NWS.
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
      the People chips and Save. Sharing rows keeps the form short enough to fit
      without scrolling. (It was sized to fit inside the calendar widget, which the
      modal was confined to; it now opens over the whole dashboard like every modal.)
    - **Defaults**: today for both dates, the first category, not all-day, no people.
      **The defaults are the same for every category** (see "No category-based
      defaults" below).
    - **Validation** runs on Save and shows one red message above the button: a category
      is required, a timed event needs a time, and an all-day end can't be before its
      start (the End picker also sets `min` to the start date).
    - **End follows Start**: changing the start date to one after the end date moves the
      end date to match, so the form never sits in an invalid state. A later end date is
      left alone, so adjusting a vacation's start doesn't wipe its end.
    - **Title is limited to 60 characters** (`maxLength` on the input), so a title can
      wrap to two lines at most in the day modal. `maxLength` only guards typing in the
      form; the same limit should be enforced in the database later.
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
      edit moves it to another day. The exception is when the modal is showing its
      Today / Tomorrow tabs (opened from the reminder strip): it stays open on the empty
      tab so the other day is still reachable.
    - Edit and delete work the same whether the modal was opened from the grid or from
      the reminder strip; there is no read-only version.
  - **No category-based defaults** (scrapped). The earlier idea that a category would
    set the form's defaults (e.g. "Vacation" turns on All Day, "Appointment" shows the
    time) is dropped. The form offers the same options and the same defaults whatever
    the category; every category is equal. A category is a name and an optional color,
    nothing more.
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
    - **Real categories start with no color** (`color` is nullable since Supabase
      stage 5); until Settings has a picker, a color can be set by hand in the SQL
      Editor. The mock data's colors (Meeting `#378ADD`, Appointment `#FF5733`,
      Vacation `#335F57`) are gone with the mock data.
    - **Day modal (built)**: an event card's second row shows the **category name in its
      category's color**, then a `·`, then the people: e.g. `Meeting · 👤 Alice, Bob`.
      The name is looked up with `getCategoryText` and the color with
      `getCategoryColor` (both in `categories.ts`, shared by the day modal and the
      reminder strip); the color is applied with `style` (it comes from data), and a
      category with no color just shows in the row's muted gray.
      - The category label shows **only when the event has a title**; an untitled event
        already shows the category name as its title.
      - The row appears if there's a label or people; the `·` only when both are there.
    - **Reminder chips** (built) show the title, or the category name when untitled, all
      in the theme accent, with no category color.
    - A color is always shown **with** its category's name, never alone (there is no
      color key), and **never on the month grid**.
    - **Pick text-safe colors**: the color is used as small text on the cream card, so
      it has to be dark enough to read (the mock Vacation green was darkened from
      `#33FF57` for this). Something for the Settings picker to enforce.
    - The `Category` type's `color` field is optional (`color?`) since Supabase
      stage 5, ahead of the Settings picker.
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
      events that day. Shown whenever the day has **2 or more events of any kind**
      (`cellEvents.length >= 2`). Holidays are **not** counted. (The earlier rule, "2+
      single-day or 2+ multi-day events", hid the badge on a day with one of each, which
      read as a bug; the simpler rule costs a few more badges during long multi-day
      events.)
      Colored with its own theme color, `--color-badge: #60584F` (`bg-badge`, cream
      `text-card`), a warm gray between `ink` and `muted`: `ink` read as a heavy black
      dot that out-shouted the chips, `muted` risked being too faint from across the
      room, and darker green blended into adjacent chips.
    - **Layers never compete**: band (background), chip (fill), ring (outline), badge
      (corner). A cell never grows, however busy the day is.
    - **Vertical budget.** With an 80px header and a 250px weather row, the calendar
      widget is 438px tall, and the grid fits exactly. Day cells stay at **48px** (`p-2`
      around the 32px number chip), because a holiday ring is 44px tall and rings in
      the same column in consecutive weeks (Dec 24 and Dec 31) need the 4px between
      them; 44px cells were tried and the rings touched. The space comes from around the
      cells instead: no gap between week rows (`gap-y-0`), a 36px reminder strip
      (`h-9`), a 28px weekday row (`py-1`), and 8px of padding under the grid (`pb-2`).
      Any change to the header or weather height has to be re-checked against this.
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
      so a very busy day can't push the modal off the dashboard and hide its close
      button.
      A long title wraps inside its card (and a single unbroken word breaks) while the
      "when" text and the buttons stay on one line. Multi-day events always show
      their **full date range** (e.g. "Vacation · Sep 21–25 · Mom, Dad"), even when the
      tapped day is in the middle of the event. (Later, maybe: tapping an empty day opens
      "+ Add event" with that date prefilled.)
    - **No color key**: bands share one tint, so there's nothing to decode, and the space
      goes to the grid. The day modal and Today chips answer "what is this?" (A
      non-color "This month" list of multi-day events could be added later if missed.)
  - **Reminder strip** (built): the "what's expected today" chips.
    - **Where**: inside the calendar widget, between the month/year header and the
      grid, as in the mockup, on the month's tinted background. A **fixed-height,
      single-row strip** (`h-9`): it never grows with the number of events (same rule
      as a grid cell never growing). Its contents are **centered**.
    - **Look**: a "Today" chip is solid accent with white text; a "Tomorrow" chip is a
      lighter tint (`bg-primary/30`) with accent text, so the two days read differently
      at a glance. The chip's title is capped at 140px and cut off with "…".
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
      within a day, timed events in time order, then all-day events. `reminderEvents()`
      returns the two sorted lists (`{ today, tomorrow }`).
    - **Overflow**: the strip shows at most **2 chips** (`MAX_REMINDER_CHIPS`); today's
      events take the slots first and tomorrow's get what's left. Then a **"+N more"**
      chip (outlined) counts everything that didn't fit, **today's and tomorrow's
      together**.
    - **Tapping "+N more"** opens the existing day modal on today, with **Today /
      Tomorrow tabs** at the top to switch days. It reuses the day modal (scrolling,
      edit, delete) rather than adding a new one. The modal lists every event on that
      day, including multi-day events already in progress, so it can show more than
      the chip counted.
      - The tabs appear **only** when the modal was opened from "+N more"; a day tapped
        on the grid opens the same modal without them. Closing the modal turns the tabs
        off again.
      - With tabs, the event list has a **fixed height** (320px) so the modal doesn't
        change size when switching between days with different numbers of events; an
        empty day shows "No events".
      - Only "+N more" is tappable; the event chips themselves are not.
    - **Empty**: when nothing starts today or tomorrow, the strip stays in place with a
      quiet message ("Nothing today or tomorrow") so the grid doesn't change size.
      Revisit if it looks tacky on the real screen.
    - **No dismissing** on the wall for the MVP. Reminders clear themselves at midnight
      and the overflow handles a crowded strip; a per-chip ✕ would need remembered state
      and a tap target that makes every chip wider. Add later if the strip feels
      cluttered in real use.
    - **A "current time" tick** (built): React only redraws on a state change and the
      tablet can sit untouched for hours, so the strip (and the red today markers, which
      would otherwise stay on yesterday after midnight) need a timer. `useNow()` in
      `src/hooks` is a `useEffect` with a one-minute `setInterval`, cleared on unmount;
      the calendar's `today` comes from it. The dashboard clock can use it too.
    - **"Tomorrow" is a calendar day, not 24 hours**: `getTomorrowISO()` builds the date
      as today's day + 1 and lets `Date` roll over months and years. Adding 24 hours to
      the clock is wrong for an hour on the two daylight-saving days each year.
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
    - **Anchor a watermark to the corner it belongs to.** Bottom-corner icons use
      `bottom-[…]`; anything meant for a top corner uses `top-[…]`. October's small web
      and spider were once placed with large `bottom-[…]` offsets, and drifted up over
      the header each time the calendar got shorter; they now use `top-[-4px]` and
      `top-[72px]`. When the calendar's height changes, flip through all twelve months.
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
  - **Later feature.** For the MVP there is one household and one Supabase account,
    signed in once on the tablet; the session stays saved on the device, which gives
    nearly the same result. Tables still carry `household_id` with RLS from the start,
    since adding it later would be painful.
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
- **Settings** (later feature; the MVP's widget list is fixed in code): a toggle list
  of every widget in the catalog, plus up/down reorder.
  Enabling a widget that would overflow the fixed 800px height is disabled, with a
  reason ("Turn something off to make room"). The same layout calculation answers
  "does this fit?", so no separate logic is needed.
- **Settings preview** (later feature): a miniature 16:10 frame next to the toggle list that renders the
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
  the household name centered, the settings entry on the right. A grid,
  not flex `justify-between`, so the name stays centered whatever the sides contain. With
  no household name the middle column is rendered empty (not removed) so the left and
  right zones don't shift. Long names truncate with an ellipsis.
- **Built so far** (`src/components/Header.tsx`, fixed height `h-20`, `text-ink`):
  - **Left**: the time, large (`text-5xl`, `tabular-nums` so it doesn't shift as the
    minutes change), with a smaller AM/PM beside it on the same baseline; under it the
    date with weekday and year in muted text, e.g. "Tuesday, October 6, 2026". The
    time string is split at its space to style the digits and AM/PM separately. **No
    time zone** is shown (the mockup had one; the tablet stays in one house).
  - It reads the time from the shared `useNow()` hook, so the clock updates each minute.
  - **Middle**: the household name, centered, one line, `truncate`. It comes from an
    optional `name` on the mock household (`useHouseholdData.ts`), passed in by `App`.
  - **Right**: a settings gear button, with no resting background (a soft circle shows
    only on hover/press, like the calendar's month arrows) and an `aria-label`. It
    opens the Settings modal.
- **Still to come**: the name's font choice and length limit (later features).
- **Settings (MVP): color theme.** The only setting in the MVP. A handful (about 4–6)
  of hardcoded presets shown as swatches; tapping one applies it.
  - **What it changes: the green accent only**, i.e. everything drawn with
    `--color-primary` / `--color-primary-hover` (`src/index.css`): the Now card's
    condition text, the location pin, the Hourly / Weekly switch and page dots, the
    calendar's Today button, "+ Add Event", single-day event squares and multi-day
    bands (`bg-primary/20`), Home Care's History link and "I changed this today"
    buttons, and the modal buttons, tabs and pickers. Checked: every one of these
    already uses the `primary` token, with no hardcoded greens, so a preset is just
    those two values.
  - **Not touched**: the monthly calendar themes (`--color-jan-*` etc.), which are
    designed per month; the page and card backgrounds, text, today red and alert
    colors.
  - **Called "color theme"** in the UI and plan, to keep it apart from the monthly
    calendar themes.
  - **Saved on the household** in Supabase as a key (e.g. `color_theme: "blue"`), like
    the name font, not as CSS. Unknown or missing keys fall back to the current green.
    Saved and loaded since Supabase stage 3.4.
  - **Behavior** (agreed October 16, 2026): the gear opens a "Settings" modal (the
    shared `Modal`) with one "Color theme" section. **Tapping a swatch applies it at
    once**, with no Save and no preview: the dashboard behind the overlay is the
    preview, still easy to read through the 40% dim. **The modal stays open** after a
    tap so colors can be compared; it closes only from the X (same button as the
    location picker's) or a tap outside. A preview window inside the modal was
    considered and dropped for that reason.
  - **Layout** (mocked up and agreed): a compact 3×2 grid, fixed columns about 76px
    wide with almost no gap, and the modal shrinks to fit it. Each option is a 40px
    color circle with its name underneath (`text-sm font-semibold text-ink`; lighter
    names were hard to read). The selected one gets a white check inside and a ring
    around it. A list of rows was compared and rejected (taller, smaller targets).
    Checked on the live app: "Terracotta", the longest name, fits its 76px column on
    one line.
  - **Presets** (starting values; confirm each against white text at 4.5:1 with a
    contrast checker before calling them final):

    | Key          | Name       | Primary   | Hover     |
    | ------------ | ---------- | --------- | --------- |
    | `sage`       | Sage       | `#3d7a6a` | `#33685a` |
    | `blue`       | Blue       | `#3a6ea5` | `#315e8c` |
    | `plum`       | Plum       | `#7a4a8c` | `#683f77` |
    | `terracotta` | Terracotta | `#b0533c` | `#964733` |
    | `slate`      | Slate      | `#4f5d75` | `#434f63` |
    | `blossom`    | Blossom    | `#b0457e` | `#963b6b` |

    Sage is the current green and the default. Hover shades are about 15% darker.
    Blossom replaced an earlier Rose (`#b04a6a`): a cherry-blossom pink was wanted, and
    real blossom pink is far too pale for white button text, so it's the deeper,
    cooler pink from a blossom's center. Rose was dropped rather than kept as a
    seventh, since the two looked alike and seven would break the 3×2 grid.
  - **Built** (October 16, 2026):
    - `src/lib/colorThemes.ts`: the `ColorTheme` type, the `colorThemes` array (Sage
      first, as the default), and `getColorTheme(key)`, which falls back to
      `colorThemes[0]` with `??` so it always returns a preset.
    - `App.tsx` keeps `themeKey` in `useState('sage')` and sets `--color-primary` and
      `--color-primary-hover` with an inline `style` on `#dashboard` (cast
      `as React.CSSProperties`, since React's style type doesn't know `--` names).
      CSS variables inherit, so everything inside, including modals portaled into
      `#dashboard`, uses the theme. No effect needed.
    - `Header` takes `themeKey` and `onThemeChange`, holds `settingsOpen`, and renders
      `src/components/SettingsModal.tsx` (outside any widget, so in `components/`).
    - `SettingsModal`: each circle's color is an inline `style` (Tailwind can't build
      classes from runtime values); the selected one shows a `Check` and
      `ring-2 ring-primary ring-offset-2 ring-offset-card`, the offset matching the
      cream card instead of Tailwind's white default. `aria-pressed` marks it.
- **Household name**: optional `name` field on the household. Display label only;
  `household_id` remains the identifier. For the MVP it's set in Supabase's table
  editor; editing it in Settings is a later feature.
- **Name length** (later feature): hard character limit in the Settings field (tentatively ~24; confirm
  by testing the widest font at the real size in one header column, about 427px wide).
  Ellipsis truncation stays as a backstop, since font widths vary.
- **Name font** (later feature): a dropdown of a short curated list (4-6 fonts) with a live preview in
  Settings. Store a key on the household (e.g. `name_font: "handwritten"`), not CSS;
  the app maps keys to font-families and falls back to the default for unknown or
  missing keys. Fonts are bundled with the app (e.g. `@fontsource`) rather than loaded
  from a CDN, since the tablet's wifi may be flaky. Register them as Tailwind theme
  fonts. Test every listed font with a maximum-length name.
- **The location picker lives in the Weather widget, not the header.** The plan and the
  mockup first put it in the header beside the settings button; it was moved because:
  - it then only exists when the Weather widget does, so no "is Weather enabled?" check
    (or `usesLocation` registry flag) is needed;
  - only the widget reads the location, so the state can live in the widget, with no
    React context to share it with the header;
  - the "no location" message is in the widget, so the fix sits next to the problem.
  - Cost: the header no longer shows the place name. If a second widget ever needs the
    location, it would have to move up again.
- **Location is household-level** (latitude, longitude, display name on the household
  row), shared by every device. The phone view has no weather and ignores it.
- **Setting the location**: manual entry (ZIP or city, geocoded to lat/long) is the
  primary path at setup and for later edits. Browser geolocation is an optional
  "use my location" shortcut only, since the Fire tablet has no GPS and may not support it
  in a kiosk browser. Test on the real device. IP lookup may prefill the field but never
  sets the location silently. NWS is US-only, so a non-US location needs a clear error.
  - **Built**: `LocationPicker.tsx` (the modal) and `searchLocations.ts` (the only file
    that knows about Open-Meteo; it returns the app's own `Location` type).
  - **Layout** (mocked up and agreed): the place name is a small text button in the
    widget's top row, just left of the Hourly / Weekly switch, in the gap after the
    alert banner: a green pin, the name, and a small down arrow, with no background.
    With no location set, the widget's "Set a location to see the weather." message is
    itself a button. Both open the same picker modal (the shared `Modal`).
  - **The picker**: one search field ("ZIP code or city", with a "US only" hint), and a
    list of matches as you type, since town names repeat (Quincy, MA / IL / FL). The
    current place is ticked. Tapping a match calls `setLocation` and closes the modal;
    no Save button. The weather then reloads by itself, because the hook watches
    `location`.
    - **Up to ten results**, in a results area of fixed height (220px) that scrolls.
      The fixed height stops the modal jumping: the shared `Modal` keeps the card
      centered, so a list that grew and shrank moved the card on every keystroke.
    - **Search accepts both** a town name and a ZIP code through the same field.
      ZIP-only was considered (some apps do it); with Open-Meteo there's no cost to
      supporting both.
    - **The no-location button** sits in the widget's early return, which also draws
      its own copy of the picker, since the main one is further down.
  - **Geocoding service: Open-Meteo's geocoding API** (free, no key, callable from the
    browser, can be limited to the US). NWS can't do it: `/points` turns coordinates
    into a place (`properties.relativeLocation` has city and state) but has no search
    from a name. Rejected: Nominatim (forbids search-as-you-type, one request a
    second), the Census geocoder (built for full street addresses), Google and Mapbox
    (need keys and billing), and a bundled Census ZIP-to-coordinates file (no outside
    service, but ZIP only and about a megabyte).
    - **Checked against the live API**: `https://geocoding-api.open-meteo.com/v1/search`
      with `name`, `count` and `countryCode=US`. "Quincy" returned towns in IL, MA, FL,
      CA and WA; "02169" returned only Quincy, MA; nonsense text returned a reply with
      no `results` field at all (not an empty list). States come back as full names
      (`admin1`). Their docs credit "Location data based on GeoNames"; the free service
      is for non-commercial use. A credit line in the picker is worth adding.
  - **Details to handle**: wait for a pause in typing before searching (debounce, about
    300ms); ignore a reply for text no longer in the field, since replies can arrive out
    of order; states come back as full names, so show them or map them to the
    two-letter code; round coordinates to four decimals for NWS; a "No US places match"
    line for no results; a short error if the search fails, leaving the current
    location unchanged. **All built**: the debounce and the stale-reply check are both
    done by the clean-up function of one `useEffect`; states map to two-letter codes
    with a lookup in `searchLocations.ts`.
  - **Left out for now**: the "use my location" button (may not work on the tablet),
    and "Updated N minutes ago" under the place name (the row is tight).
  - **Saved in Supabase** since stage 3.4 (see "Supabase build stages"). Before that,
    a chosen place reset to the mock household's location on reload. Browser storage (`localStorage`) was considered as
    a stand-in and skipped: it would save per device, not per household, and nothing
    is used for real until the project is fully built. With Supabase, the location
    loads from the household like its name, and choosing a place writes it back.

## Build order

1. Layout shell (fixed 1280x800 box, header + body, rows) with placeholder widgets and
   the registry.
2. Mock data hook: `useHouseholdData()` returns mock data shaped exactly like the future
   Supabase rows (ids, `household_id`, ISO date strings). Mock writes update local state
   so interactions work. Weather mock = saved real NWS payloads, including a severe
   sample. Widgets only ever talk to the hook, so swapping in Supabase changes nothing
   in the widgets.
3. Widgets one at a time: Home Care, Calendar, Weather.
4. **Supabase**: schema with `household_id` + RLS, one household and one account, and
   the hooks swapped from mock to real. This also saves the chosen weather location
   and color theme. Done (October 16–21, 2026); see "Supabase build stages" below.
5. **Settings with the color theme** — done (built before Supabase; saved since
   Supabase stage 3.4).
6. **Migrations** (after Calendar, decided October 20, 2026): switch from one hand-run
   `schema.sql` to versioned migrations with the Supabase CLI, so each schema change is
   its own file instead of hunting for the new parts to paste into the SQL Editor.
   - One-time setup (about an hour, no app code changes): `npx supabase init`, `login`,
     `link` to the existing project, then a **baseline** migration describing the
     tables that already exist, either `supabase db pull` (needs Docker running) or
     `schema.sql` copied into `supabase/migrations/<timestamp>_initial.sql` and marked
     as run with `supabase migration repair --status applied <timestamp>`, so it's never
     run again. Then retire `schema.sql` (delete it, or keep it read-only) so there's
     one source of truth.
   - From then on: `supabase migration new <name>`, write the SQL, `supabase db push`.
     A pushed migration is never edited; fixes are new migrations (`alter table ...`).
     Unpushed ones are drafts and can be edited. Same idea as Django's
     `makemigrations` / `migrate` and `prisma migrate dev`, except the SQL is
     hand-written.
7. **New-household setup template**: `supabase/new_household.sql`, a fill-in-the-blanks
   SQL file (placeholders for the email, household name, people, categories and Home
   Care items) run once in the SQL Editor to set up another household. Written after
   stages 4 and 5, once all tables exist. It's data, not schema, so it's kept apart from
   the schema and migrations and holds no real names.
8. **Deploy** (Vercel or similar).
9. **Tablet**: kiosk browser on the Fire HD 10, signed in once, in daily use.

Steps 1–5 are done. Anything else is under "Later features".

### Supabase build stages

Built in small stages that each leave the app working, like Weather's stage 7.

1. **Setup** — done (October 16–17, 2026).
   - Reused an empty project created earlier ("parekhr's Project", East US / Ohio): no
     tables, no users, so as good as new. Free plan; projects pause after about a week
     with no activity, which the tablet's daily use prevents.
   - `.env.local` in the project root (ignored by git through `*.local`) holds
     `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Vite only exposes
     variables with the `VITE_` prefix to the browser, and only reads `.env` files
     when the dev server starts. The URL needs the full `https://<project id>.supabase.co`.
   - **Publishable key, not the legacy anon key**: both work in the browser, but the
     dashboard labels anon/service_role "Legacy", so the new key avoids a later switch.
     Never the secret / `service_role` key in front-end code: it bypasses RLS, and
     anything in the bundle is public.
   - `src/lib/supabaseClient.ts` creates the one client with `createClient` and exports
     it as `supabase`; every hook imports it from there.
2. **Sign-in** — done.
   - One user created in the dashboard (Authentication → Users, auto-confirmed), and
     **"Allow new users to sign up" turned off**, since the publishable key is public.
   - `App` keeps `session` in state with three values: `undefined` (still checking,
     render nothing, so the sign-in screen doesn't flash on reload), `null` (show
     `SignIn`), or a `Session` (show the dashboard). One `useEffect` calls
     `supabase.auth.getSession()` and subscribes to `onAuthStateChange`, unsubscribing
     in its clean-up.
   - `src/components/SignIn.tsx`: email and password in a `<form>` (so Enter submits),
     `signInWithPassword`, "Wrong email or password." on error. Nothing happens on
     success: `onAuthStateChange` sets the session and `App` switches by itself. It
     sits outside `#dashboard`, so its button is always Sage.
   - supabase-js keeps the session in `localStorage` and refreshes it, which is what
     "signed in once on the tablet" relies on. No sign-out button (not needed on a wall
     tablet); `localStorage.clear()` in DevTools signs out for testing.
3. **Household** — done (October 17–19, 2026).
   1. **Tables, function, RLS, grants** in `supabase/schema.sql` (kept in the repo and
      pasted into the SQL Editor to run):
      - `households`: `id` (uuid, `gen_random_uuid()`), `name`, `location_name`,
        `latitude`, `longitude` (nullable, like `name?` / `location?`),
        `widget_layout text[]` defaulting to `{weather,homeCare,calendar}`,
        `color_theme` defaulting to `'sage'`, `created_at`.
      - `household_members`: `user_id` (primary key, references `auth.users`, so one
        household per user) and `household_id`, both `on delete cascade`.
      - `my_household_id()`: returns the signed-in user's household from
        `household_members` via `auth.uid()`. `security definer` (so it can read the
        membership table without tripping that table's own RLS), `stable`, and
        `set search_path = ''` (hence the `public.` prefix).
      - Policies: read and update your own household; read your own membership. No
        insert or delete policies on purpose: households and memberships are created
        by the admin in the SQL Editor, which runs as the owner and bypasses RLS.
      - **Grants**: `select, update` on `households`, `select` on `household_members`,
        `execute` on `my_household_id()`, all to `authenticated` only.
        **Lesson: policies alone gave a 403 Forbidden.** Postgres checks grants
        (may this role use the table at all?) before RLS (which rows?), and this
        project doesn't grant new tables to `authenticated` automatically. Every new
        table needs RLS, policies *and* grants.
   2. **Data**: our household and membership inserted in the SQL Editor (not in
      `schema.sql`, since it's data). One statement: a `with ... returning id` insert
      into `households`, then the membership row looking the user up in `auth.users`
      by email, so no UUIDs are copied by hand.
   3. **Loading the household** — done.
      - **Fetch once in `App`, share through React context.** Two components called
        `useHouseholdData()` (`App` and `WeatherWidget`); with a real fetch that would
        have meant two requests and two copies that could disagree.
      - `src/hooks/useHouseholdData.ts` now has: `HouseholdRow` (the table's columns,
        `snake_case`, `null` for empty) and `toHousehold` (the only place that knows
        column names: `widget_layout` → `widgetLayout`, the three location columns →
        one `location` or `undefined`, `null` → `undefined`); `useFetchHousehold(userId)`
        (fetches with `.select('*').single()` and no filter, since RLS returns only our
        row; `ignore` guards stale replies; returns `{ household, error }`);
        `HouseholdContext`; and `useHouseholdData()`, which reads the context and throws
        if it's used outside the provider, so callers always get a real `Household`.
      - The hook takes the **user's id**, not the session: the session object is
        replaced on each hourly token refresh, which would refetch for nothing.
      - `App` order: all hooks → session checks → `if (error)` message →
        `if (!household) return null` → `buildRows`. Waiting for the household before
        rendering means `WeatherWidget`'s `useState(useHouseholdData().location)` gets
        the real location on its first render, so the widget didn't change. The
        provider wraps `Header` and the rows inside `#dashboard`; portaled modals still
        see it.
      - **Named export**: `useHouseholdData` was the one default export among the
        hooks; it's now named like everything else (only `App` keeps a default export,
        from Vite's template).
      - Tested: renaming the household in Table Editor changes the header after a
        reload.
   4. **Saving the location and color theme** — done.
      - **Optimistic saves**: the screen changes at once and the `update` runs in the
        background; a failed save is only logged (`console.error`), so the worst case
        is the old value coming back on the next reload. Reverting or showing an error
        can come later if failures actually happen.
      - **Saves go in the click handlers, not in a `useEffect`**: the save is caused by
        a user action, not by the state changing, and an effect would also run on the
        first render and write back the value just loaded.
      - **Color theme** (in `App`): `HouseholdRow` gets `color_theme: string` (the
        column is `not null default 'sage'`), `Household` gets `colorTheme: string`, and
        `toHousehold` copies it. `App` keeps only `pickedTheme` (`string | null`) in
        state and works out `themeKey = pickedTheme ?? household?.colorTheme ?? 'sage'`,
        because `useState`'s starting value is used only on the first render, before
        the household has loaded (copying it in with an effect was the alternative).
        `handleThemeChange(key)` sets `pickedTheme`, returns early if there's no
        household (narrowing for TypeScript; can't happen, since the swatches only show
        once it has loaded), then updates `color_theme` with `.eq('id', household.id)`.
        It saves `key`, not `themeKey`, which still holds the old value until the next
        render. `SettingsModal` and `Header` didn't change.
      - **No `ThemeKey` type for now**: keys stay plain `string`s everywhere, and
        `getColorTheme` already falls back to Sage for unknown keys. A `ThemeKey` union
        (from the list with `as const`) would catch typos at compile time; possible
        cleanup later.
      - **Location** (in `WeatherWidget`, which owns the location state):
        `handleChooseLocation(place)` sets the location and updates the three columns
        (`location_name: place.name`, `latitude`, `longitude`), the reverse of
        `toHousehold`. No `undefined` check is needed there, since `useHouseholdData()`
        throws outside the provider. Both `LocationPicker`s (the "Set a location" button
        and the place name) use it. `LocationPicker` didn't change.
      - Tested: both survive a reload and show up in Table Editor.
      - **Hourly labels are in the location's time zone**, read straight from the NWS
        `startTime`, while the header clock uses the device's. They only differ when
        testing a place in another time zone (Cresco, IA showed 9 AM as the current
        hour at 10:49 Eastern); for the tablet's own town they match, so this stays.
4. **Home Care** — done (October 19, 2026).
   1. **Tables** in `supabase/schema.sql`:
      - `home_care_items`: `id`, `household_id` (references `households`), `name`,
        `icon`, `sort_order` (all `not null`), `model` and `size` (nullable, like
        `model?` / `size?`), `created_at`, and **`unique (id, household_id)`**, which
        exists only as the target of the logs' composite foreign key (`id` is already
        unique on its own). `sort_order` has no default, so every insert must place
        the item.
      - `home_care_logs`: `id`, `household_id` **`default my_household_id()`** (the app
        never sends it), `item_id`, **`logged_on date`** (a day, not a timestamp:
        `created_at` is shown in UTC, so a 9 PM log would read as the next day),
        `created_at`, a **composite foreign key** `(item_id, household_id)` →
        `home_care_items (id, household_id)` `on delete cascade`, and
        **`unique (item_id, logged_on)`**, which replaces the mock's `includes` checks.
      - **Why composite**: a plain `item_id` foreign key only checks that the item
        exists, and foreign key checks ignore RLS, so a log could point at another
        household's item. The pair makes the log's household equal its item's; it also
        covers `household_id` pointing at a real household, so that column has no
        separate `references`.
      - **`my_household_id()` moved above the Home Care tables**: a column default that
        calls a function needs the function to exist when the table is created.
   2. **Policies and grants**: items are **read-only** (one select policy, `select`
      grant); they're added in the SQL Editor like people and categories will be.
      Logs get **four separate policies** (select and delete with `using`, insert with
      `with check`, update with both) and all four grants. `for all` would also have
      worked; separate ones spell out each action. **Lesson**: with RLS on, an action
      with a grant but no policy is still blocked.
   3. **Running it**: only the new parts were pasted into the SQL Editor, since
      `schema.sql` describes a fresh database and rerunning `create table households`
      fails. (Migrations, one numbered file per change, are the usual answer once this
      gets annoying.)
   4. **Data**: our 4 items inserted in the SQL Editor (not saved in the repo) with
      `insert ... select h.id, v.* from households h cross join (values ...) as v (...)`,
      looking up `household_id` by household name, since `my_household_id()` returns
      null in the SQL Editor. History starts empty; the widget already shows "Never"
      and "No entries yet". `icon` must be a key in `HomeCareWidget`'s `icons` map
      (`air-vent`, `droplet`), or the widget would render `undefined`.
   5. **Loading** (`useHomeCareData`): only `HomeCareWidget` uses the hook, so it
      fetches inside itself (no context). One request with **embedding**:
      `.select('id, name, icon, model, size, home_care_logs(logged_on)')`,
      `.order('sort_order')`, no filter (RLS returns only our rows). `items` starts as
      `[]`; `ignore` guards stale replies. `HomeCareItemRow` (database shape) and
      `toHomeCareItem` (`null` → `undefined`, logs → `history: string[]`) follow the
      `HouseholdRow` / `toHousehold` pattern. A failed load sets an `error`
      boolean (state, since it's discovered after render) and the widget shows
      "Couldn't load Home Care." instead of looking empty.
   6. **Writes**: no log ids are needed in state, since `(item_id, logged_on)` is
      unique: `logToday` and `addHistoryEntry` insert `{ item_id, logged_on }`,
      `deleteHistoryEntry` deletes and `editHistoryEntry` updates with
      `.eq('item_id', ...).eq('logged_on', ...)`. All optimistic like the theme and
      location: an **early return** if the change isn't needed (duplicate date, or
      the old date missing), then `setItems`, then the call; failures are only
      `console.error`ed (not the load-error flag, whose message would be wrong).
      `HistoryModal` also blocks duplicates, but the hook doesn't rely on it.
   7. Tested: log today, add, edit (same row id, so a real update) and delete all
      show up in Table Editor and survive a reload.
5. **Calendar** — done (October 20–21, 2026).
   1. **Tables** in `supabase/schema.sql`, run in this order since each points at the
      ones before it:
      - `categories`: `id`, `household_id`, `name`, **`color` nullable** (no color until
        the Settings picker; text-safe dark colors only, since it's small text on the
        cream card), `created_at`, `unique (id, household_id)`.
      - `people`: `id`, `household_id`, `name`, `created_at`, `unique (id, household_id)`.
        No `sort_order` for either: both are shown **alphabetically** (`.order('name')`).
      - `events`: `id`, `household_id` `default my_household_id()`, `category_id`,
        `title` with `check (char_length(title) <= 60)` (a null title passes: a check
        that comes out null counts as passing), `start_date`, `end_date`, `all_day
        boolean`, `time time` (Postgres returns `'14:30:00'`), `created_at`; table
        rules `check (end_date >= start_date)`, a **strict time check**
        `check ((all_day and time is null) or (not all_day and time is not null))`
        (all-day events have no time, timed events must have one; `EventForm` already
        saves `time: undefined` for all-day events), a composite foreign key
        `(category_id, household_id)` → `categories` **`on delete restrict`**, and
        `unique (id, household_id)` as the target for `event_people`.
      - `event_people`: `household_id` `default my_household_id()`, `event_id`,
        `person_id`, `created_at`, **`primary key (event_id, person_id)`** (no `id`
        column: nothing ever points at a single link, and the pair also blocks adding
        someone to the same event twice; a primary key is needed anyway, since Table
        Editor can't edit or delete rows without one), and composite foreign keys to
        `events` and `people`, both **`on delete cascade`**.
      - **Deleting a category** that events use is **refused** (`restrict`): `cascade`
        would silently wipe its events, and `set null` would break the required
        `categoryId`. To delete one, move its events first. **Deleting a person or an
        event** removes only the links (`cascade`): the event stays, minus that person,
        since zero people is allowed.
      - Check constraints: a rule on one column goes on that column's line; a rule
        comparing columns goes at the bottom with the other table rules.
   2. **Policies and grants**: `categories` and `people` read-only (admin-managed, like
      Home Care items); `events` gets all four policies and grants; `event_people` gets
      select, insert and delete only, since links are never updated (a changed link is
      a different link).
   3. **Data**: categories Appointment and Vacation (no colors; Meeting dropped) and four
      people, inserted with the `cross join (values ...)` pattern, `household_id` from
      `h.id` looked up by household name. Events start empty.
   4. **Loading** (`useCalendarData`): one effect with **`Promise.all`** running the
      three queries at once, since the widget needs all three before it can draw; one
      `ignore` guard and one error check (any of the three failing counts as a failed
      load, so nothing loads half-way). Events use embedding:
      `.select('id, category_id, title, start_date, end_date, all_day, time, event_people(person_id)')`.
      Row types `CategoryRow`, `PersonRow`, `CalendarEventRow` (app type name + `Row`)
      and converters `toCategory`, `toPerson`, `toCalendarEvent`: `null` → `undefined`,
      `snake_case` → camelCase, `time?.slice(0, 5)` (trims the seconds and passes null
      through as undefined), and `event_people` → `personIds`. The hook no longer
      returns `setCategories`. `CalendarWidget` shows **"Couldn't load events."** in
      place of the reminder strip's text (fixed-height row, so the grid doesn't move)
      and disables "+ Add Event" (no categories to pick from). The grid itself still
      shows, since dates, holidays and themes come from code, not the database.
   5. **Writes**:
      - `addEvent` makes the id in the app with `crypto.randomUUID()` (Postgres only
        uses its default when no id is sent), so the optimistic event already has its
        real id and the links can use it right away. Insert the event, then, only if
        that succeeded and there are people, insert one `event_people` row per person.
        Inserts don't nest the way embedded selects do.
      - `editEvent` updates the event row, then deletes all its links, then inserts the
        new ones, each step inside the previous step's `.then` (so the old links are
        gone before the new ones arrive).
      - `deleteEvent` deletes only the event; the cascade removes its links.
      - Writes use **`?? null`**, the reverse of loading: `undefined` fields are dropped
        from the request, which in an update means "don't change", so clearing a title
        would otherwise keep the old one.
      - A Supabase query only sends when it's `.then`ed or awaited.
      - **Known gap**: `editEvent` is three requests, so if the link insert fails after
        the delete, the event loses its people in the database. Rare; the fix is a
        transaction (see "Later features").
   6. Tested: add with and without people, edit fields and people, delete (links
      cascade), all surviving a reload, plus the load-error state.

**Schema conventions (decided October 17, 2026)**: every table has a uuid `id` from
`gen_random_uuid()` and a `household_id`, including the join tables, so one rule fits
all policies (`household_id = my_household_id()`); columns are `snake_case` and each hook
converts rows to the existing camelCase types, so widgets don't change. **Separate
tables** were chosen over arrays for Home Care history and event people: the database
then rejects duplicate dates and links to people who don't exist, and it's standard
relational design. (Arrays would have matched the current hook types more closely and
been a little quicker.) `widget_layout` stays an array: it's one ordered list, not
related records. Realtime waits until there's a second device. **Exception (October 20,
2026)**: the join table `event_people` has no `id`; its pair `(event_id, person_id)` is
the primary key, since nothing points at a single link. Tables that others point at
with a composite foreign key have `unique (id, household_id)`; a table the app inserts
into has `household_id default my_household_id()`, one filled in the SQL Editor doesn't
(the function returns null there).

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
├── .env.example              # VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY placeholders (not created yet; real values live in .env.local)
├── src/
│   ├── main.tsx
│   ├── App.tsx                # top-level shell; switches wall vs. phone layout
│   ├── lib/
│   │   ├── dates.ts              # toISO(), getTodayISO(), getTomorrowISO(), formatDate() (local time, never UTC)
│   │   └── supabaseClient.ts
│   ├── auth/
│   │   └── useDeviceSession.ts   # setup-code exchange + persisted session
│   ├── hooks/
│   │   ├── useHouseholdData.ts   # realtime subscription to this household's data
│   │   └── useNow.ts             # current time, re-rendering once a minute
│   ├── widgets/
│   │   ├── registry.ts           # widget id -> { component, shape, label } + buildRows()
│   │   ├── weather/
│   │   │   ├── WeatherWidget.tsx
│   │   │   ├── mock/                 # saved NWS responses: forecast, forecastHourly, alerts, alertsSevere
│   │   │   ├── useWeatherData.ts     # NWS fetch/normalize
│   │   │   ├── weatherIcons.ts       # condition text -> Meteocons icon (animated + still)
│   │   │   ├── AlertsModal.tsx       # every active alert; tidies the description text
│   │   │   ├── alertTiming.ts        # "Starts / Until / Since ..." sentence for an alert
│   │   │   ├── alertColors.ts        # severity -> color, for the banner and the modal
│   │   │   ├── WeatherBackground.tsx  # animated layer behind the cards + its picker (stage 6)
│   │   │   ├── LocationPicker.tsx    # search modal for the weather location
│   │   │   └── searchLocations.ts    # Open-Meteo geocoding -> Location[]
│   │   ├── calendar/
│   │   │   ├── CalendarWidget.tsx
│   │   │   ├── buildMonthGrid.ts     # 42-day Sun-first grid for a month (month is 1-based)
│   │   │   ├── dayEvents.ts          # events covering a given day
│   │   │   ├── reminderEvents.ts     # events starting today / tomorrow, sorted for the strip
│   │   │   ├── categories.ts         # getCategoryText(), getCategoryColor()
│   │   │   ├── useCalendarData.ts    # categories, people, events from Supabase + add/edit/delete event
│   │   │   ├── DayModal.tsx          # a day's holiday + events; edit/delete per event
│   │   │   ├── EventForm.tsx         # add + edit event form
│   │   │   ├── holidays.ts           # holiday lists, Easter, Chinese New Year, checkHoliday()
│   │   │   ├── seasonalThemes.ts     # one theme per month
│   │   │   └── customIcons.ts        # maple leaf, pumpkin, spider, spider web
│   │   └── homeCare/
│   │       ├── HomeCareWidget.tsx
│   │       ├── HistoryModal.tsx      # per-item history: add/edit/delete dates
│   │       └── useHomeCareData.ts    # items + history from Supabase; log/add/edit/delete history
│   ├── settings/
│   │   ├── SettingsPanel.tsx
│   │   ├── WidgetToggleList.tsx
│   │   ├── ThemePicker.tsx
│   │   └── PeopleAndCategories.tsx
│   ├── phone/
│   │   └── QuickActionsView.tsx
│   ├── components/               # shared/generic UI (buttons, modals, date picker)
│   │   ├── Header.tsx            # date + time, household name, settings button
│   │   └── Modal.tsx             # shared overlay + card, drawn into the dashboard root
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
  - **Bought October 17, 2026** for our household: $72.99 on sale (ASIN
    B0GVTPKJVT), 32 GB, with lockscreen ads (cheaper; the kiosk browser keeps the
    dashboard on screen, so the ads rarely show), linked to the Amazon account.
- **Stand**: varies per household, all roughly similar cost —
  countertop stand (~$10–20), magnetic fridge mount (~$15–40, **verify the fridge
  front is actually magnetic first** — some stainless finishes aren't), or wall
  mount (~$15–25).
  - **Bought October 17, 2026** for our household: a Vnicstick bamboo slot stand,
    $11.69 (ASIN B0GVYHY5SJ), for the kitchen counter. It's light (about 4 oz against
    the tablet's 15 oz) and shallow (about 2.7" deep), which is fine only because it
    sits against the wall and the tablet leans on it; out on an open counter it would
    tip when the top of the screen is tapped. Check when it arrives that the
    charging cable on the short side isn't pinched, and move it an inch from the
    wall if the screen is too upright to read.
- **Per-household hardware cost**: roughly **$85–160** all-in. No recurring cost —
  Supabase and hosting both stay on free tiers at this scale. Ours came to about
  $85.

## Later features

Moved out of the MVP on October 16, 2026. The designs written up elsewhere in this plan
still stand; they're just not needed for daily use. Until they're built, the
"management" ones are done by hand in Supabase's table editor or SQL Editor: people,
calendar categories and Home Care items are admin-managed, set up per household before
handing over a tablet (see the new-household setup template in the build order). Events,
Home Care history, the color theme and the location are edited in the app.

- **Device pairing** with short-lived setup codes (see "Architecture").
- **More than one household.** The schema supports it from the start.
- **Phone view** (the single scrolling column).
- **Settings beyond the color theme**:
  - widget catalog toggles and reordering, the Settings preview and the overflow
    warning (see "Layout decisions");
  - household name editing, its length limit and the name font;
  - managing Home Care items (add / rename / delete / reorder);
  - managing calendar categories and people, and the category color picker.
- **Paged screens** for households that outgrow one screen.
- **Atomic event edits**: move `editEvent`'s update, link delete and link insert into
  one Postgres function called with `supabase.rpc(...)`, so they save together or not
  at all (see Supabase stage 5's known gap). Saving an event with its people in
  `addEvent` could use the same function.
- **Tell the user when a save fails**: today failed writes are only logged; a small
  "Couldn't save" message (or undoing the optimistic change) could come later.
- **Weather**: tap a day card for NWS's `detailedForecast`; the "use my location"
  button; "Updated N minutes ago" under the place name.
- **Portfolio presentation** (after the MVP, so interviewers can see and use it):
  - **README**: a GIF or screenshots at the top, one paragraph on what it is and that
    it's in daily family use, the stack and a small architecture diagram, and a
    "Design decisions" section drawn from this plan (the reasons are the selling
    point).
  - **Demo video** (60–90s) of the real tablet on the kitchen counter, linked at the
    top.
  - **Live demo account** (chosen over a mock-data demo mode, so visitors use the
    real Supabase + RLS path): a "Try the demo" button on the sign-in screen signs in
    as a shared demo user whose membership points at a seeded sample household. The
    demo credentials sit in the front end on purpose; RLS confines them to the demo
    household, and public sign-ups stay off. A scheduled job (`pg_cron`) runs a
    reset function nightly that restores the sample data.
    - **To handle**: the demo user could change its own password or email through
      Supabase Auth and lock everyone else out, so the reset also restores its
      credentials (or block it another way); visitors can deface the sample data
      between resets; keep the sample data free of anything personal.

## Open / not yet decided

- Weather: the tint colors for the four times of day and the alert colors per
  severity are both in use on the live app and looked acceptable, but neither set has
  been called final.
- Phone companion: its "today's appointments (dismissible)" list predates the wall's
  reminder-strip design (no dismissing on the wall); revisit the phone's version later.
- The category color picker in Settings: which colors are offered (a fixed palette
  avoids clashes with holiday rings and monthly themes; free choice doesn't, and every color must
  be readable as small text), and whether reminder chips show the color too.
- Exact seasonal theme color values (the rendered mockup values are a starting point).
- Full Supabase schema details (exact tables/columns beyond `household_id` + RLS).
- Which kiosk browser APK to sideload on the Fire HD 10.
- Any widgets beyond the MVP three (Weather, Calendar, Home Care).
- Exact settings UI for widget catalog / reordering (toggle list is agreed; visual
  treatment not designed yet).
