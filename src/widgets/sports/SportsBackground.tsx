import type { League } from './espn'

// A soft surface behind the Sports widget that matches the tab: a parquet floor for the
// NBA (squares of planks whose direction alternates, like the Boston Garden's), a
// football field for the NFL. Drawn here as SVG (no images, nothing to license) and
// kept pale and low-contrast so the cards on top stay the focus.

const SQUARE = 96              // one parquet square (planks come out ~19px wide)
const PLANKS = 5               // planks per square
const PLANK = SQUARE / PLANKS
// alternating plank tones, with a slightly darker seam between planks and squares
const tones = ['#ead6b6', '#e3cba6', '#ecdabd', '#e0c7a0', '#e8d3b1']
const seam = '#cfb48a'

// One square of planks; `across` turns them sideways for the neighbouring squares
function Square({ x, y, across }: { x: number; y: number; across: boolean }) {
    return (
        <g transform={`translate(${x} ${y})`}>
            {tones.slice(0, PLANKS).map((tone, i) => (
                <rect
                    key={i}
                    x={across ? 0 : i * PLANK}
                    y={across ? i * PLANK : 0}
                    width={across ? SQUARE : PLANK}
                    height={across ? PLANK : SQUARE}
                    fill={tone}
                    stroke={seam}
                    strokeWidth={0.6}
                />
            ))}
            <rect width={SQUARE} height={SQUARE} fill="none" stroke={seam} strokeWidth={1.4} />
        </g>
    )
}

function Parquet() {
    return (
        <svg className="h-full w-full" aria-hidden="true">
            <defs>
                {/* a 2×2 block repeats: up-down planks next to side-to-side planks, checkerboard style */}
                <pattern id="sports-parquet" width={SQUARE * 2} height={SQUARE * 2} patternUnits="userSpaceOnUse">
                    <Square x={0} y={0} across={false} />
                    <Square x={SQUARE} y={0} across={true} />
                    <Square x={0} y={SQUARE} across={true} />
                    <Square x={SQUARE} y={SQUARE} across={false} />
                </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#sports-parquet)" />
        </svg>
    )
}

// ---- NFL: a football field seen from above ----
// Drawn to scale, 10 units per yard: 100 yards of field plus a 10-yard end zone at each
// end (1200 wide) by 53⅓ yards (533 tall). `slice` fills the widget and crops the edges,
// so the middle of the field shows, around the 50. Generic: no logos or team names.
const YARD = 10
const FIELD_W = 120 * YARD
const FIELD_H = 533
const END_ZONE = 10 * YARD

// real grass greens, softened a little; drawn at full strength (the parquet is faded instead)
const turfLight = '#9cc589'
const turfDark = '#8eba7a'       // every other 5-yard mowing stripe
const endZone = '#7fac6b'
const chalk = 'rgba(255, 255, 255, 0.85)'

// yard line positions every 5 yards, goal line to goal line
const fiveYardLines = Array.from({ length: 21 }, (_, i) => END_ZONE + i * 5 * YARD)
// a short hash every yard between them
const yardHashes = Array.from({ length: 99 }, (_, i) => END_ZONE + (i + 1) * YARD).filter(x => (x - END_ZONE) % (5 * YARD) !== 0)
// numbers every 10 yards: 10 20 30 40 50 40 30 20 10
const numbers = [10, 20, 30, 40, 50, 40, 30, 20, 10].map((n, i) => ({ n, x: END_ZONE + (i + 1) * 10 * YARD }))

function Field() {
    return (
        <svg className="h-full w-full" viewBox={`0 0 ${FIELD_W} ${FIELD_H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            {/* turf: mowing stripes every 5 yards, darker end zones */}
            <rect width={FIELD_W} height={FIELD_H} fill={turfLight} />
            {fiveYardLines.slice(0, -1).map((x, i) => i % 2 === 1 && (
                <rect key={x} x={x} y={0} width={5 * YARD} height={FIELD_H} fill={turfDark} />
            ))}
            <rect x={0} y={0} width={END_ZONE} height={FIELD_H} fill={endZone} />
            <rect x={FIELD_W - END_ZONE} y={0} width={END_ZONE} height={FIELD_H} fill={endZone} />

            <g stroke={chalk}>
                {/* sidelines and end lines */}
                <rect x={2} y={2} width={FIELD_W - 4} height={FIELD_H - 4} fill="none" strokeWidth={4} />
                {/* yard lines every 5 yards; the goal lines a little heavier */}
                {fiveYardLines.map((x, i) => (
                    <line key={x} x1={x} y1={4} x2={x} y2={FIELD_H - 4} strokeWidth={i === 0 || i === 20 ? 4 : 2.2} />
                ))}
                {/* hash marks every yard: along both sidelines and the two inbound rows */}
                {yardHashes.map(x => (
                    <g key={x} strokeWidth={1.6}>
                        <line x1={x} y1={8} x2={x} y2={18} />
                        <line x1={x} y1={200} x2={x} y2={210} />
                        <line x1={x} y1={323} x2={x} y2={333} />
                        <line x1={x} y1={FIELD_H - 18} x2={x} y2={FIELD_H - 8} />
                    </g>
                ))}
            </g>

            {/* yard numbers along both sides; the far side reads upside down, as on a real field */}
            <g fill={chalk} className="font-sports" fontSize={44} textAnchor="middle">
                {numbers.map(({ n, x }) => (
                    <g key={x}>
                        {/* both rows sit 90 units in from their sideline; the far row is the near
                            row turned 180° (drawn with its baseline at 134, spun around 112) */}
                        <text x={x} y={FIELD_H - 90}>{n}</text>
                        <text x={x} y={134} transform={`rotate(180 ${x} 112)`}>{n}</text>
                    </g>
                ))}
            </g>
        </svg>
    )
}

export function SportsBackground({ league }: { league: League }) {
    return (
        <div className={`pointer-events-none absolute inset-0 ${league === 'nba' ? 'opacity-60' : ''}`} aria-hidden="true">
            {league === 'nba' ? <Parquet /> : <Field />}
        </div>
    )
}
