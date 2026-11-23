import { formatDate } from '../../lib/dates'
import type { CalendarEvent, Person, Category } from './useCalendarData'
import type { Holiday } from './holidays'
import { CalendarDays } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '../../components/Modal'
import { EventCard } from './EventCard'

type DayModalProps = {
    iso: string
    onClose: () => void
    events: CalendarEvent[]
    people: Person[]
    categories: Category[]
    holiday?: Holiday
    onEdit: (event: CalendarEvent) => void
    onDelete: (id: string) => void
    showTabs?: boolean
    activeTab?: 'today' | 'tomorrow'
    onTabChange?: (tab: 'today' | 'tomorrow') => void
}

export function DayModal({ iso, onClose, events, people, categories, holiday, onEdit, onDelete, showTabs, activeTab, onTabChange }: DayModalProps) {

    const [confirmingId, setConfirmingId] = useState<string | null>(null)   // which event is asking "delete?" (null = none)

    return (
        <Modal onClose={onClose} className="w-[480px]">
            <div className="flex items-center justify-between">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <h3 className="flex items-center gap-2 text-xl font-extrabold">
                            <CalendarDays className="w-5 h-5 text-muted" />
                            {formatDate(iso)}
                        </h3>
                        {holiday && (
                            <span className="ml-7 text-sm text-muted">
                                {holiday.name}
                            </span>
                        )}
                    </div>

                </div>
                <button
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-muted/15 text-lg hover:bg-muted/25 active:bg-muted/35 transition-colors"
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>
            {showTabs && (
                <div className="flex gap-2 mt-4">
                    <button
                        className={`flex-1 h-11 rounded-full font-semibold cursor-pointer transition-colors ${activeTab === 'today' ? 'bg-primary text-white' : 'bg-muted/15 text-ink hover:bg-muted/25'}`}
                        onClick={() => onTabChange?.('today')}
                    >
                        Today
                    </button>
                    <button
                        className={`flex-1 h-11 rounded-full font-semibold cursor-pointer transition-colors ${activeTab === 'tomorrow' ? 'bg-primary text-white' : 'bg-muted/15 text-ink hover:bg-muted/25'}`}
                        onClick={() => onTabChange?.('tomorrow')}
                    >
                        Tomorrow
                    </button>
                </div>
            )}
            <div className={`${showTabs ? 'h-[320px]' : 'max-h-[320px]'} overflow-y-auto mt-4`}>
                {events.length === 0 && <p className="py-3 text-sm text-muted">No events</p>}
                {events.map((event) => (
                    <EventCard
                        key={event.id}
                        event={event}
                        people={people}
                        categories={categories}
                        confirming={confirmingId === event.id}
                        onConfirmStart={() => setConfirmingId(event.id)}
                        onConfirmCancel={() => setConfirmingId(null)}
                        onEdit={onEdit}
                        onDelete={onDelete}
                    />
                ))}
            </div>
        </Modal>
    )
}
