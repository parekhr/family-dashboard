import { buildRows, registry, type WidgetId } from './widgets/registry'

const layout: WidgetId[] = ['weather', 'calendar', 'homeCare']

function App() {
  const rows = buildRows(layout, registry)

  return (
    <div className="flex flex-col w-[1280px] h-[800px]">
      <div className="bg-blue-200">Header</div>

      <div className="flex-1 flex flex-col">
        {rows.map((row) => (
          <div key={row.join('-')} className={registry[row[0]].shape === 'full' ? 'flex h-[200px]' : 'flex flex-1'}>
            {row.map((id) => (
              <div key={id} className="flex-1 bg-gray-200">
                {registry[id].label}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default App