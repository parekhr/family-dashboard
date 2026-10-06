

export function WeatherWidget() {
    return (
        <div className="relative flex flex-col flex-1 min-h-0 gap-2.5 rounded-3xl overflow-hidden bg-card p-3 text-ink">

            {/* top row: now (left), alert (middle), hourly/weekly switch (right) */}
            <div className="flex h-16 shrink-0 items-center justify-between">
                <div className="flex h-full w-[260px] items-center rounded-2xl bg-red-100 px-4">Now</div>
                <div className="flex h-full w-[220px] items-center justify-center rounded-2xl bg-yellow-100">Alert</div>
                <div className="flex h-9 w-[190px] items-center justify-center rounded-full bg-blue-100">Hourly / Weekly</div>
            </div>

            {/* bottom row: seven forecast cards (days or hours) */}
            <div className="flex flex-1 min-h-0 gap-2.5">
                {Array.from({ length: 7 }, (_, index) => (
                    <div key={index} className="flex flex-1 items-center justify-center rounded-2xl bg-green-100">
                        Card {index + 1}
                    </div>
                ))}
            </div>
        </div>
    )
}