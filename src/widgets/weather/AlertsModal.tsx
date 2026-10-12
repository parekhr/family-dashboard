import type { WeatherAlert } from './useWeatherData'
import { Modal } from '../../components/Modal'

type AlertModalProps = {
    onClose: () => void
    alerts: WeatherAlert[]
}
export function AlertsModal({ onClose, alerts }: AlertModalProps) {
    return (
        <Modal onClose={onClose} className="w-[480px]">
            <div className="flex items-center justify-between">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                        <h3 className="flex items-center gap-2 text-xl font-extrabold">
                            
                        </h3>
                        
                    </div>

                </div>
                <button
                    className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-full bg-muted/15 text-lg hover:bg-muted/25 active:bg-muted/35 transition-colors"
                    onClick={onClose}
                >
                    ✕
                </button>
            </div>
            
            
        </Modal>
    )
}