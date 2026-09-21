import { buildRows, registry } from './widgets/registry'

function App() {
  return (
    <div className="flex flex-col w-[1280px] h-[800px]">
      <div className="bg-blue-200">Header</div>

      <div className="flex-1 flex flex-col">
        <div className="h-[200px] bg-yellow-200">Weather</div>

        <div className="flex-1 flex">
          <div className="flex-1 bg-purple-200">Home Care</div>
          <div className="flex-1 bg-red-200">Calendar</div>
        </div>
      </div>
    </div>
  )
}

export default App