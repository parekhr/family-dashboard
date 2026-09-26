import { buildMonthGrid } from './buildMonthGrid'

export function CalendarWidget() {

    const grid = buildMonthGrid(2026, 9)
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

    return (
        <div className="flex flex-col flex-1 min-h-0 gap-3">
            <h2 className="text-[22px] font-extrabold text-ink">Calendar</h2>
            <div className="grid grid-cols-7 gap-2 flex-1 min-h-0">
                {weekdays.map((weekday) => (
                    <div key={weekday} className="p-2 font-bold text-center">
                        {weekday}
                    </div>
                ))}
                {grid.map((day) => (
                    <div key={day.iso} className={`p-2 border ${day.inMonth ? '' : 'text-muted'}`}>
                        {Number(day.iso.slice(-2))}
                    </div>
                ))}
            </div>
        </div>
    )
}