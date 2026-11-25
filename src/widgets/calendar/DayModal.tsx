import { formatDate } from '../../lib/dates'
import type { CalendarEvent, Person, Category } from './useCalendarData'
import type { Holiday } from './holidays'
import { CalendarDays } from 'lucide-react'
import { useState } from 'react'
import { Modal } from '../../components/Modal'
import { EventCard } from './EventCard'
import { ScrollArea } from '../../components/ScrollArea'
import { closeButtonClass, modalTitleClass, tabClass } from '../../components/styles'

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
                        <h3 className={`flex items-center gap-2 ${modalTitleClass}`}>
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
                    className={closeButtonClass}
                    aria-label="Close"
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>
            {showTabs && (
                <div className="flex gap-2 mt-4">
                    <button
                        className={tabClass(activeTab === 'today')}
                        onClick={() => onTabChange?.('today')}
                    >
                        Today
                    </button>
                    <button
                        className={tabClass(activeTab === 'tomorrow')}
                        onClick={() => onTabChange?.('tomorrow')}
                    >
                        Tomorrow
                    </button>
                </div>
            )}
            <ScrollArea className={`${showTabs ? 'h-[320px]' : 'max-h-[320px]'} mt-4`}>
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
            </ScrollArea>
        </Modal>
    )
}
