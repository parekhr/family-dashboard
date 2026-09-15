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
  - Seasonal theming (color/decoration) for a **few key months only** (e.g. Halloween
    in October, winter holidays in December) — not all 12 months for the MVP.
- **Home Care tracking**
  - Each tracked item = name + icon + a history log of dates.
  - Interaction is a single "I did this today" action → confirmation → date appended
    to that item's history. No due-date/cadence logic in the MVP.
  - Full CRUD on which items exist (add/rename/delete/reorder), not on custom fields
    per item — the model itself is intentionally simple.
- **Settings**
  - Pre-built themes, layout control (see Widget System below), family members list,
    appointment types, event types. Expected to grow over time.
- **Phone companion ("Quick Actions")**
  - Matches the mockup's Phone artboard: add-to-calendar button, today's appointments
    (dismissible), and the Home Care list with the same "did this today" action.
  - Shares the same underlying data/components as the wall dashboard (one responsive
    codebase, not a second app) — the mockup's own comments call this out explicitly.

## Architecture

- **Frontend**: React + Vite.
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

## Proposed folder structure

Not final — a starting point to build from and adjust as the widget system proves
itself out in practice.

```
family-dashboard/
├── PROJECT_PLAN.md
├── index.html
├── package.json
├── vite.config.js
├── .env.example              # SUPABASE_URL / SUPABASE_ANON_KEY placeholders
├── src/
│   ├── main.jsx
│   ├── App.jsx                # top-level shell; switches wall vs. phone layout
│   ├── lib/
│   │   └── supabaseClient.js
│   ├── auth/
│   │   └── useDeviceSession.js   # setup-code exchange + persisted session
│   ├── hooks/
│   │   └── useHouseholdData.js   # realtime subscription to this household's data
│   ├── widgets/
│   │   ├── registry.js           # widget id -> { component, shape, label }
│   │   ├── weather/
│   │   │   ├── WeatherWidget.jsx
│   │   │   ├── useWeatherData.js     # NWS fetch/normalize
│   │   │   └── severeBackgrounds.jsx
│   │   ├── calendar/
│   │   │   ├── CalendarWidget.jsx
│   │   │   ├── AppointmentForm.jsx
│   │   │   └── seasonalThemes.js
│   │   └── homeCare/
│   │       ├── HomeCareWidget.jsx
│   │       └── ConfirmModal.jsx
│   ├── dashboard/
│   │   ├── DashboardLayout.jsx   # renders enabled widgets per shape rules
│   │   └── layoutEngine.js       # ordered widget list -> rows/columns
│   ├── settings/
│   │   ├── SettingsPanel.jsx
│   │   ├── WidgetToggleList.jsx
│   │   ├── ThemePicker.jsx
│   │   └── PeopleAndTypes.jsx
│   ├── phone/
│   │   └── QuickActionsView.jsx
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
