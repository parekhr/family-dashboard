import { buildMonthGrid } from './buildMonthGrid'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getTodayISO } from '../../lib/dates'
import { useCalendarData } from './useCalendarData'
import { dayEvents } from './dayEvents'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export function CalendarWidget() {

    const today = new Date()
    const { events } = useCalendarData()
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

    const todayISO = getTodayISO()

    console.log(dayEvents(events, "2026-09-03"))

    const isViewingTodaysMonth = month === (today.getMonth() + 1) && year === today.getFullYear()

    return (
        <div className="flex flex-col flex-1 min-h-0 gap-3">
            <div className="grid grid-cols-[1fr_auto_1fr] items-center">
                <button className="justify-self-start p-2 border h-[42px] rounded-xl cursor-pointer text-white bg-blue-500 hover:bg-blue-600" onClick={() => { setMonth(today.getMonth() + 1); setYear(today.getFullYear()); }}>Today</button>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrevMonth} className="p-2 border h-[42px] rounded-xl cursor-pointer text-ink hover:bg-muted/10">
                        <ChevronLeft />
                    </button>
                    <h2 className="w-[200px] text-center text-[22px] font-extrabold text-ink">
                        {monthNames[month - 1]} {year}
                    </h2>
                    <button onClick={handleNextMonth} className="p-2 border h-[42px] rounded-xl cursor-pointer text-ink hover:bg-muted/10">
                        <ChevronRight />
                    </button>
                </div>
                <button className="justify-self-end p-2 border h-[42px] rounded-xl cursor-pointer bg-primary text-white">+ Add Event</button>
            </div>
            <div className="grid grid-cols-7 gap-2 flex-1 min-h-0">
                {weekdays.map((weekday) => (
                    <div key={weekday} className={`${ isViewingTodaysMonth && weekday === weekdays[today.getDay()] ? 'text-today' : 'text-muted' } p-2 text-center font-bold text-sm`}>
                        {weekday}
                    </div>
                ))}
                {grid.map((day) => {
                    const hasSingleDayEvent = dayEvents(events, day.iso).some(event => event.start === event.end)
                    return (
                        <div key={day.iso} className={`p-2 text-center font-bold relative ${day.inMonth ? '' : 'text-muted'}`}>

                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-lg ${hasSingleDayEvent ? 'bg-primary text-card' : ''}`}>{Number(day.iso.slice(-2))}</span>
                            {day.iso === todayISO && day.inMonth && (
                                <span className="absolute bottom-3.5 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-today"></span>
                            )}
                            
                        </div>
                    )
                })}
            </div>
        </div>
    )
}