import './animations.css'
import * as React from 'react'
import { TanukiMascot, type TanukiMood } from './TanukiMascot'

type TanukiToastProps = {
  mood: TanukiMood
  title: string
  description?: string
  visible: boolean
  onClose: () => void
}

export function TanukiToast({ mood, title, description, visible, onClose }: TanukiToastProps) {
  const [animClass, setAnimClass] = React.useState('tanuki-slide-in')

  React.useEffect(() => {
    if (!visible) return
    setAnimClass('tanuki-slide-in')
  }, [visible])

  const handleClose = () => {
    setAnimClass('tanuki-slide-out')
    setTimeout(onClose, 350)
  }

  if (!visible) return null

  const borderColor =
    mood === 'happy'      ? 'border-emerald-300'
    : mood === 'stamping' ? 'border-red-300'
    : mood === 'embarrassed' ? 'border-amber-300'
    : 'border-indigo-200'

  const bgColor =
    mood === 'happy'         ? 'bg-emerald-50'
    : mood === 'stamping'    ? 'bg-red-50'
    : mood === 'embarrassed' ? 'bg-amber-50'
    : 'bg-white'

  return (
    <div
      className={`fixed bottom-6 right-4 z-50 flex items-center gap-3 rounded-xl border shadow-lg px-4 py-3 max-w-xs ${borderColor} ${bgColor} ${animClass}`}
      role="status"
    >
      <TanukiMascot mood={mood} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800 leading-snug">{title}</p>
        {description && (
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={handleClose}
        className="shrink-0 text-gray-400 hover:text-gray-600 ml-1"
        aria-label="閉じる"
      >
        ✕
      </button>
    </div>
  )
}
