import { buildRows, registry } from './widgets/registry'
import useHouseholdData from './hooks/useHouseholdData'

function App() {
  const household = useHouseholdData()
  const rows = buildRows(household.widgetLayout, registry)

  return (
    <div className="flex flex-col w-[1280px] h-[800px]">
      <div className="bg-blue-200">Header</div>

      <div className="flex-1 flex flex-col">
        {rows.map((row) => (
          <div key={row.join('-')} className={registry[row[0]].shape === 'full' ? 'flex h-[200px]' : 'flex flex-1'}>
            {row.map((id) => {
              const Component = registry[id].component
              return (
                <div key={id} className="flex-1 bg-gray-200">
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