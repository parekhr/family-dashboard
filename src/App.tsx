import { buildRows, registry } from './widgets/registry'
import { HouseholdContext, useFetchHousehold } from './hooks/useHouseholdData'
import { Header } from './components/Header'
import { getColorTheme } from './lib/colorThemes'
import { useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import type { Session } from '@supabase/supabase-js'
import { SignIn } from './components/SignIn'

function App() {

  const [pickedTheme, setPickedTheme] = useState<string | null>(null)
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const { household, error } = useFetchHousehold(session?.user.id)

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

  const rows = buildRows(household.widgetLayout, registry)

  function handleThemeChange(key: string) {
    setPickedTheme(key)
    if (!household) return   // can't happen in practice: the swatches only show once it's loaded
    supabase.from('households')
      .update({ color_theme: key })
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
        <Header
          name={household.name}
          themeKey={themeKey}
          onThemeChange={handleThemeChange}
        />

        <div className="flex-1 flex flex-col min-h-0">
          {rows.map((row) => (
            <div key={row.join('-')} className={registry[row[0]].shape === 'full' ? 'flex h-[250px]' : 'flex flex-1 min-h-0'}>
              {row.map((id) => {
                const Component = registry[id].component
                return (
                  <div key={id} className="flex-1 flex flex-col min-h-0 p-4">
                    <Component />
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </HouseholdContext.Provider>
    </div>
  )
}

export default App