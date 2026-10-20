import { useEffect } from 'react'
import { Check, X } from 'lucide-react'
import '../styles/ToastNotification.css'

export default function ToastNotification({ mensaje, onClose, duracion = 4000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duracion)

    return () => clearTimeout(timer)
  }, [onClose, duracion])

  return (
    <div className="ls-toast-notification">
      <div className="ls-toast-icon">
        <Check size={16} strokeWidth={3} />
      </div>
      <span className="ls-toast-message">{mensaje}</span>
      <button type="button" className="ls-toast-close" onClick={onClose} aria-label="Cerrar">
        <X size={16} />
      </button>
    </div>
  )
}