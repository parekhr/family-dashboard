import { buildRows, registry } from './widgets/registry'
import useHouseholdData from './hooks/useHouseholdData'
import { Header } from './components/Header'
import { getColorTheme } from './lib/colorThemes'
import { useState } from 'react'

function App() {

  const [themeKey, setThemeKey] = useState('sage')

  const theme = getColorTheme(themeKey)
  const household = useHouseholdData()
  const rows = buildRows(household.widgetLayout, registry)

  return (
    <div
      id="dashboard"
      className="flex flex-col w-[1280px] h-[800px] bg-page relative"
      style={{ '--color-primary': theme.primary, '--color-primary-hover': theme.primaryHover } as React.CSSProperties}
    >
      <Header
        name={household.name}
        themeKey={themeKey}
        onThemeChange={setThemeKey}
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
    </div>
  )
}

export default App