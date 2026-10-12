import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'

type ModalProps = {
    onClose: () => void
    className?: string
    children: ReactNode
}

// Draws into the dashboard root (see App.tsx), so the overlay always covers the whole
// dashboard no matter which widget opened it.
export function Modal({ onClose, className = '', children }: ModalProps) {
    return createPortal(
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
            <div className={`rounded-3xl bg-card p-6 text-ink ${className}`} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>,
        document.getElementById('dashboard')!
    )
}
