import { buildMonthGrid } from './buildMonthGrid'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function CalendarWidget() {

    const today = new Date()

    const [month, setMonth] = useState(today.getMonth() + 1)
    const [year, setYear] = useState(today.getFullYear())

    function handlePrevMonth() {
        if (month === 1) {
            setMonth(12)
            setYear(year - 1)
        } else {
            setMonth(month - 1)
        }
    }

    function handleNextMonth() {
        if (month === 12) {
            setMonth(1)
            setYear(year + 1)
        } else {
            setMonth(month + 1)
        }
    }
    

    const grid = buildMonthGrid(year, month)

    return (
        <div className="flex flex-col flex-1 min-h-0 gap-3">
            <div className="flex justify-between items-center">
                <button onClick={handlePrevMonth} className="p-2 border h-[42px] cursor-pointer"><ChevronLeft /></button>
                <h2 className="text-[22px] font-extrabold text-ink">{monthNames[month - 1]} {year}</h2>
                <button onClick={handleNextMonth} className="p-2 border h-[42px] cursor-pointer"><ChevronRight /></button>
            </div>
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