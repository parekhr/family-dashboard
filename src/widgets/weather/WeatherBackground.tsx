import type { CSSProperties } from 'react'
import { Wind } from 'lucide-react'

export type BackgroundKind = 'none' | 'rain' | 'snow' | 'thunder' | 'wind' | 'blizzard'

export function getBackgroundKind(condition: string, rainChance: number): BackgroundKind {
    const text = condition.toLowerCase()
    const likely = rainChance >= 50

    if (likely && text.includes('blizzard')) return 'blizzard'
    if (text.includes('thunder')) return 'thunder'
    if (likely && text.includes('snow')) return 'snow'
    if (likely && (text.includes('rain') || text.includes('shower'))) return 'rain'
    if (text.includes('wind')) return 'wind'
    return 'none'
}

const backgroundSettings = {
    rain: { count: 40, shape: 'h-3 w-0.5 bg-sky-600/50', speed: 0.8, across: false, drift: 30, sway: 0 },
    snow: { count: 26, shape: 'h-1.5 w-1.5 bg-white', speed: 5, across: false, drift: 40, sway: 12 },
    thunder: { count: 55, shape: 'h-4 w-0.5 bg-slate-600/60', speed: 0.6, across: false, drift: 60, sway: 0 },
    wind: { count: 9, shape: 'h-9 w-9 text-slate-500/40', speed: 2.6, across: true, drift: 30, sway: 6 },
    blizzard: { count: 100, shape: 'h-1.5 w-1.5 bg-white', speed: 1.5, across: true, drift: 90, sway: 14 },
}

export function WeatherBackground({ kind }: { kind: BackgroundKind }) {
    if (kind === 'none') return null
    const settings = backgroundSettings[kind]

    return (
        <div className="pointer-events-none absolute inset-0">
            {Array.from({ length: settings.count }, (_, index) => {
                const spread = `${(index * 37) % 100}%`
                const duration = settings.speed * (1 + (index % 5) * 0.15)
                const drift = settings.drift * (0.4 + ((index * 53) % 10) / 8)
                const swayTime = 1.5 + (index % 4) * 0.4
                return (
                    <span
                        key={index}
                        className={`absolute rounded-full ${settings.across ? 'left-0' : 'top-0'} ${settings.shape}`}
                        style={{
                            '--drift': `${drift}px`,
                            '--sway': `${settings.sway}px`,
                            left: settings.across ? undefined : spread,
                            top: settings.across ? spread : undefined,
                            animation: `${settings.across ? 'weather-blow' : 'weather-fall'} ${duration}s linear infinite, ${settings.across ? 'weather-bob' : 'weather-sway'} ${swayTime}s ease-in-out infinite alternate`,
                            animationDelay: `-${((index * 0.37) % 1) * settings.speed * 1.6}s`,
                        } as CSSProperties}
                    >
                        {kind === 'wind' && <Wind className="h-full w-full" strokeWidth={1.5} />}
                    </span>
                )
            })}
            {kind === 'thunder' && (
                <>
                    <div className="absolute inset-0 bg-white opacity-0" style={{ animation: 'weather-flash 7s linear infinite' }} />
                    <svg
                        className="absolute top-0 h-full w-16 opacity-0 drop-shadow-[0_0_6px_rgba(255,255,255,0.9)]"
                        style={{ left: '31%', animation: 'weather-bolt 7s linear infinite' }}
                        viewBox="0 0 60 220"
                        preserveAspectRatio="none"
                        fill="none"
                    >
                        <polyline
                            points="34,0 22,48 36,56 14,112 30,120 8,220"
                            stroke="#FFD84A"
                            strokeWidth="5"
                            strokeLinejoin="round"
                            strokeLinecap="round"
                        />
                    </svg>
                </>
            )}
        </div>
    )
}