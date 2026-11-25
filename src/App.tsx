import { resolveWidgets, type WidgetChoices } from './widgets/registry'
import { DashboardPages } from './components/DashboardPages'
import { HouseholdContext, useFetchHousehold } from './hooks/useHouseholdData'
import { Header } from './components/Header'
import { getColorTheme } from './lib/colorThemes'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import type { Session } from '@supabase/supabase-js'
import { SignIn } from './components/SignIn'
import { useRemindersData } from './reminders/useRemindersData'
import { RemindersContext } from './reminders/RemindersContext'
import { useCalendarData } from './widgets/calendar/useCalendarData'
import { CalendarContext } from './widgets/calendar/CalendarContext'
import { useAutoReload } from './hooks/useAutoReload'
import { SportsContext } from './widgets/sports/SportsContext'

function App() {
  useAutoReload()   // picks up new deploys (and reloads nightly) on its own, when nobody's using the screen

  const [pickedTheme, setPickedTheme] = useState<string | null>(null)
  const [pickedWidgets, setPickedWidgets] = useState<WidgetChoices | null>(null)   // set from Settings' Widgets tab, like pickedTheme
  const [pickedFavorites, setPickedFavorites] = useState<string[] | null>(null)    // set from Settings' Favorite teams page
  const [pickedName, setPickedName] = useState<string | null>(null)                // set from Settings' Household tab
  const [pickedNameFont, setPickedNameFont] = useState<string | null>(null)        // same tab
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const { household, error } = useFetchHousehold(session?.user.id)
  const reminders = useRemindersData(session?.user.id)   // loaded here for the header's reminders bell
  const calendar = useCalendarData(session?.user.id)   // loaded here so Settings can manage categories and people

  const themeKey = pickedTheme ?? household?.colorTheme ?? 'sage'
  const theme = getColorTheme(themeKey)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  if (session === undefined) return null
  if (session === null) return <SignIn />
  if (error) return <div className="p-6">{error}</div>
  if (!household) return null

  // The saved order and off list, cleaned up by resolveWidgets (unknown ids dropped,
  // widgets newer than the saved order added at the end, off); the ones that are on get drawn
  const widgets = pickedWidgets ?? resolveWidgets(household.widgetLayout, household.hiddenWidgets)
  const onWidgets = widgets.order.filter(id => !widgets.hidden.includes(id))

  function handleWidgetsChange(next: WidgetChoices) {
    setPickedWidgets(next)
    if (!household) return   // can't happen in practice: Settings only shows once it's loaded
    supabase.from('households')
      .update({ widget_layout: next.order, hidden_widgets: next.hidden })
      .eq('id', household.id)
      .then(({ error }) => { if (error) console.error(error) })
  }

  const sports = {
    favorites: pickedFavorites ?? household.favoriteTeams,
    setFavorites(next: string[]) {
      setPickedFavorites(next)
      if (!household) return
      supabase.from('households')
        .update({ favorite_teams: next })
        .eq('id', household.id)
        .then(({ error }) => { if (error) console.error(error) })
    },
  }

  function handleThemeChange(key: string) {
    setPickedTheme(key)
    if (!household) return   // can't happen in practice: the swatches only show once it's loaded
    supabase.from('households')
      .update({ color_theme: key })
      .eq('id', household.id)
      .then(({ error }) => { if (error) console.error(error) })
  }

  function handleNameChange(name: string) {
    setPickedName(name)
    if (!household) return   // can't happen in practice: Settings only shows once it's loaded
    supabase.from('households')
      .update({ name })
      .eq('id', household.id)
      .then(({ error }) => { if (error) console.error(error) })
  }

  function handleNameFontChange(key: string) {
    setPickedNameFont(key)
    if (!household) return   // can't happen in practice: Settings only shows once it's loaded
    supabase.from('households')
      .update({ name_font: key })
      .eq('id', household.id)
      .then(({ error }) => { if (error) console.error(error) })
  }

  return (
    <div
      id="dashboard"
      className="flex flex-col w-[1280px] h-[800px] bg-page relative"
      style={{ '--color-primary': theme.primary, '--color-primary-hover': theme.primaryHover } as React.CSSProperties}
    >
      <HouseholdContext.Provider value={household}>
      <RemindersContext.Provider value={reminders}>
      <CalendarContext.Provider value={calendar}>
      <SportsContext.Provider value={sports}>
        <Header
          name={pickedName ?? household.name}
          onNameChange={handleNameChange}
          nameFont={pickedNameFont ?? household.nameFont}
          onNameFontChange={handleNameFontChange}
          themeKey={themeKey}
          onThemeChange={handleThemeChange}
          widgets={widgets}
          onWidgetsChange={handleWidgetsChange}
        />

        {/* the widgets, on as many pages as they need (see buildPages) */}
        <DashboardPages onWidgets={onWidgets} />
      </SportsContext.Provider>
      </CalendarContext.Provider>
      </RemindersContext.Provider>
      </HouseholdContext.Provider>
    </div>
  )
}

export default App