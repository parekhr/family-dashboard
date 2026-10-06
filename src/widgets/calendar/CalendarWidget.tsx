import { buildMonthGrid } from './buildMonthGrid'
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { getTodayISO, getTomorrowISO } from '../../lib/dates'
import { useCalendarData, type CalendarEvent } from './useCalendarData'
import { dayEvents } from './dayEvents'
import { DayModal } from './DayModal'
import { checkHoliday } from '../../widgets/calendar/holidays'
import { getDefaultSeasonalTheme } from './seasonalThemes'
import { EventForm } from './EventForm'
import { reminderEvents } from './reminderEvents'
import { getCategoryText } from './categories'
import { useNow } from '../../hooks/useNow'

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const MAX_REMINDER_CHIPS = 2

export function CalendarWidget() {

    const today = useNow()
    const { events, people, categories, addEvent, deleteEvent, editEvent } = useCalendarData()
    const [month, setMonth] = useState(today.getMonth() + 1)
    const [year, setYear] = useState(today.getFullYear())
    const [selectedDay, setSelectedDay] = useState<string | null>(null)
    const [showEventModal, setShowEventModal] = useState(false)
    const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)   // which event is being edited (null = none)
    const [showReminderTabs, setShowReminderTabs] = useState(false)

    // after an edit or delete, close the day modal if its day has nothing left to show
    function closeDayIfEmpty(nextEvents: CalendarEvent[]) {
        if (showReminderTabs) return
        if (selectedDay && dayEvents(nextEvents, selectedDay).length === 0 && !checkHoliday(selectedDay)) {
            setSelectedDay(null)
        }
    }

    function handleDeleteEvent(id: string) {
        deleteEvent(id)
        closeDayIfEmpty(events.filter(event => event.id !== id))
    }

    function handleEditSave(updatedEvent: Omit<CalendarEvent, 'id'>) {
        if (!editingEvent) return
        const id = editingEvent.id
        editEvent(id, updatedEvent)
        closeDayIfEmpty(events.map(event => event.id === id ? { ...updatedEvent, id } : event))
    }

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

    function handleOnTabChange(tab: 'today' | 'tomorrow') {
        setSelectedDay(tab === 'today' ? todayISO : getTomorrowISO())
    }

    const grid = buildMonthGrid(year, month)
    const todayISO = getTodayISO()
    const seasonalTheme = getDefaultSeasonalTheme(month)
    const isViewingTodaysMonth = month === (today.getMonth() + 1) && year === today.getFullYear()
    const reminders = reminderEvents(events, todayISO, getTomorrowISO())
    const anyReminders = reminders.today.length > 0 || reminders.tomorrow.length > 0
    const bandDays = grid.map(day =>
        day.inMonth && dayEvents(events, day.iso).some(event => event.start !== event.end)
    )
    const visibleToday = reminders.today.slice(0, MAX_REMINDER_CHIPS)
    const visibleTomorrow = reminders.tomorrow.slice(0, MAX_REMINDER_CHIPS - visibleToday.length)
    const hiddenCount = (reminders.today.length + reminders.tomorrow.length) - (visibleToday.length + visibleTomorrow.length)


    return (
        <div className="relative flex flex-col flex-1 min-h-0 rounded-3xl overflow-hidden">
            <div className={`grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2 ${seasonalTheme.header}`}>
                <button className="justify-self-start px-2 h-11 rounded-lg cursor-pointer text-primary font-semibold active:bg-muted/15 hover:bg-muted/10"
                    onClick={() => { setMonth(today.getMonth() + 1); setYear(today.getFullYear()); }}>
                    Today
                </button>
                <div className="flex items-center gap-2">
                    <button onClick={handlePrevMonth} className="flex items-center justify-center cursor-pointer text-ink w-11 h-11 rounded-full active:bg-muted/15 hover:bg-muted/10">
                        <ChevronLeft />
                    </button>
                    <h2 className="w-[200px] text-center text-[22px] font-extrabold text-ink">
                        {monthNames[month - 1]} {year}
                    </h2>
                    <button onClick={handleNextMonth} className="flex items-center justify-center cursor-pointer text-ink w-11 h-11 rounded-full active:bg-muted/15 hover:bg-muted/10">
                        <ChevronRight />
                    </button>
                </div>
                <button
                    className="justify-self-end px-3 h-11 rounded-xl cursor-pointer bg-primary text-white active:bg-primary-hover hover:bg-primary-hover whitespace-nowrap"
                    onClick={() => setShowEventModal(true)}
                >+ Add Event
                </button>
            </div>
            <div className={`relative flex flex-col flex-1 min-h-0 px-4 pt-4 pb-2 ${seasonalTheme.background}`}>
                {seasonalTheme.watermarks.map((watermark, index) => {
                    const Icon = watermark.icon
                    return (
                        <Icon key={index} className={`absolute pointer-events-none ${watermark.className}`} />
                    )
                })}
                <div className="flex items-center gap-2 h-9 shrink-0 justify-center">
                    {anyReminders ? (
                        <>
                            {visibleToday.map((event) => (
                                <div key={event.id} className="h-8 px-3 rounded-full bg-primary text-white text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
                                    <span className="opacity-75">Today:</span>
                                    <span className="max-w-[140px] truncate">
                                        {event.title?.trim() || getCategoryText(categories, event.categoryId)}
                                    </span>
                                </div>
                            ))}
                            {visibleTomorrow.map((event) => (
                                <div key={event.id} className="h-8 px-3 rounded-full bg-primary/30 text-primary text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
                                    <span className="opacity-75">Tomorrow:</span>
                                    <span className="max-w-[140px] truncate">
                                        {event.title?.trim() || getCategoryText(categories, event.categoryId)}
                                    </span>
                                </div>
                            ))}
                            {hiddenCount > 0 && (
                                <button
                                    className="h-8 px-3 rounded-full border-2 border-primary text-primary text-sm font-semibold cursor-pointer whitespace-nowrap"
                                    onClick={() => {
                                        setSelectedDay(todayISO)
                                        setShowReminderTabs(true)
                                    }}
                                >
                                    +{hiddenCount} more
                                </button>
                            )}
                        </>
                    ) : <span className="text-sm text-muted">Nothing today or tomorrow</span>}
                </div>
                <div className="grid grid-cols-7 gap-x-0 gap-y-0 flex-1 min-h-0">
                    {weekdays.map((weekday) => (
                        <div key={weekday} className={`${isViewingTodaysMonth && weekday === weekdays[today.getDay()] ? 'text-today' : 'text-muted'} px-2 py-1 text-center font-bold text-sm`}>
                            {weekday}
                        </div>
                    ))}
                    {grid.map((day, index) => {
                        const cellEvents = day.inMonth ? dayEvents(events, day.iso) : []
                        const singleDayCount = cellEvents.filter(event => event.start === event.end).length
                        const multiDayCount = cellEvents.filter(event => event.start !== event.end).length
                        const hasSingleDayEvent = singleDayCount > 0
                        const hasMultiDayEvent = multiDayCount > 0
                        const showBadge = cellEvents.length >= 2
                        const column = index % 7
                        const isSaturdayEdge = column === 6
                        const isSundayEdge = column === 0
                        const roundLeft = isSundayEdge || !bandDays[index - 1]
                        const roundRight = isSaturdayEdge || !bandDays[index + 1]
                        const hasEvent = hasSingleDayEvent || hasMultiDayEvent
                        const holiday = day.inMonth ? checkHoliday(day.iso) : undefined
                        const isClickable = hasEvent || holiday
                        return (
                            <div key={day.iso} className={`p-2 text-center font-bold relative ${day.inMonth ? '' : 'text-muted'} ${isClickable ? 'group cursor-pointer' : ''}`} onClick={() => { if (isClickable) setSelectedDay(day.iso) }}>
                                {hasMultiDayEvent && (
                                    <span className={`absolute inset-x-0 top-1 h-10 bg-primary/20 ${roundLeft ? 'rounded-l-full' : ''} ${roundRight ? 'rounded-r-full' : ''}`}></span>
                                )}
                                <span
                                    className={`relative inline-flex items-center justify-center w-8 h-8 rounded-lg transition-transform group-hover:scale-112 group-active:scale-95 tabular-nums ${hasSingleDayEvent ? 'bg-primary text-card' : ''} ${holiday ? 'outline-4 outline-offset-2' : ''}`}
                                    style={holiday ? { outlineColor: holiday.color ?? '#6B7B8C' } : undefined}>
                                    {Number(day.iso.slice(-2))}
                                </span>
                                {day.iso === todayISO && day.inMonth && (
                                    <span className="absolute bottom-2.5 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-today"></span>
                                )}
                                {showBadge && (
                                    <span className="absolute top-[-0.25rem] right-[0.5rem] inline-flex items-center justify-center w-5 h-5 rounded-full bg-badge text-card text-xs">{cellEvents.length}</span>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>
            {selectedDay && !editingEvent && (
                <DayModal iso={selectedDay} onClose={() => {setShowReminderTabs(false); setSelectedDay(null)}} events={dayEvents(events, selectedDay)} people={people} categories={categories} holiday={checkHoliday(selectedDay)} onEdit={setEditingEvent} onDelete={handleDeleteEvent} showTabs={showReminderTabs} activeTab={selectedDay === todayISO ? 'today' : 'tomorrow'} onTabChange={handleOnTabChange} />
            )}
            {showEventModal && (
                <EventForm onClose={() => setShowEventModal(false)} onSave={addEvent} categories={categories} people={people} />
            )}
            {editingEvent && (
                <EventForm event={editingEvent} onClose={() => setEditingEvent(null)} onSave={handleEditSave} categories={categories} people={people} />
            )}
        </div>
    )
}