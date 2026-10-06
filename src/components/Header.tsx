import { useNow } from '../hooks/useNow'
import { Settings } from 'lucide-react'

type HeaderProps = {
    name?: string
}

export function Header({ name }: HeaderProps) {

    const now = useNow()
    const [time, period] = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).split(' ')


    return (
        <header className="grid grid-cols-3 items-center px-4 h-20 text-ink">
            {/* Time and date section */}
            <div className="flex flex-col">
                <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-bold tabular-nums leading-none">{time}</span>
                    <span className="text-lg font-bold">{period}</span>
                </div>
                <span className="text-sm font-semibold text-muted">
                    {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </span>
            </div>

            {/* Household name section */}
            <div className="text-center text-xl font-bold truncate">{name}</div>

            {/* Location and settings section */}
            <div className="flex items-center justify-end gap-2">
                <button 
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full hover:bg-muted/10 active:bg-muted/15 transition-colors"
                    aria-label="Settings"
                >
                    <Settings />
                </button>
            </div>
        </header>
    );
}