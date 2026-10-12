import type { WeatherAlert } from './useWeatherData'
import { Modal } from '../../components/Modal'
import { getAlertTiming } from './alertTiming'

type AlertModalProps = {
    onClose: () => void
    alerts: WeatherAlert[]
    now: Date
}

function splitLabel(paragraph: string) {
    const body = paragraph.startsWith('* ') ? paragraph.slice(2) : paragraph
    const cut = body.indexOf('...')
    const label = body.slice(0, cut)

    if (cut > 0 && cut < 30 && label === label.toUpperCase()) {
        return { label: label[0] + label.slice(1).toLowerCase(), text: body.slice(cut + 3) }
    }
    return { label: '', text: paragraph }
}

function getParagraphs(text: string) {
    return text.split('\n\n').map(paragraph => paragraph.replaceAll('\n', ' ')).map(splitLabel)
}

export function AlertsModal({ onClose, alerts, now }: AlertModalProps) {
    return (
        <Modal onClose={onClose} className="w-[600px]">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-extrabold">Weather Alerts</h3>
                <button
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-muted/15 text-lg hover:bg-muted/25 active:bg-muted/35 transition-colors"
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>

            <div className="mt-4 h-[480px] overflow-y-auto">
                {alerts.map((alert, index) => (
                    <div key={index} className="mb-4 rounded-2xl bg-muted/10 p-4">
                        <h4 className="text-lg font-bold">{alert.title}</h4>
                        <p className="text-sm font-semibold text-muted">{getAlertTiming(alert, now)}</p>
                        {getParagraphs(alert.description).map((paragraph, index) => (
                            <p key={index} className="mt-2 text-sm">
                                {paragraph.label && <span className="font-bold">{paragraph.label}: </span>}
                                {paragraph.text}
                            </p>
                        ))}
                        {alert.instruction && (
                            <div className="mt-2">
                                <p className="text-sm font-bold underline underline-offset-2">What to do:</p>
                                {getParagraphs(alert.instruction).map((paragraph, index) => (
                                    <p key={index} className="mt-1 text-sm">{paragraph.text}</p>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </Modal>
    )
}