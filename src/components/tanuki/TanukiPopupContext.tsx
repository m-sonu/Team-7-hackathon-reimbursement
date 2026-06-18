import './animations.css'
import * as React from 'react'
import { TanukiStepHead } from './TanukiStepHead'
import type { StepEmotion } from './TanukiStepHead'
import { CloudBubbleSVG } from './CloudBubbleSVG'

// ── Types ───────────────────────────────────────────────────────────────────

type PopupMood = 'excited' | 'sad'

type PopupState = {
  visible: boolean
  mood: PopupMood
  title: string
  subtitle?: string
}

type TanukiPopupContextType = {
  showSuccess: (title: string, subtitle?: string) => void
  showError:   (title: string, subtitle?: string) => void
  dismiss:     () => void
}

// ── Module-level bridge for non-React contexts (e.g. axios interceptor) ─────

let _globalShowError: ((title: string, subtitle?: string) => void) | null = null

export function tanukiShowError(title: string, subtitle?: string) {
  _globalShowError?.(title, subtitle)
}

// ── Context ─────────────────────────────────────────────────────────────────

const TanukiPopupContext = React.createContext<TanukiPopupContextType | null>(null)

// ── Popup component ──────────────────────────────────────────────────────────

type TanukiStickerPopupProps = PopupState & { onClose: () => void }

function TanukiStickerPopup({ visible, mood, title, subtitle, onClose }: TanukiStickerPopupProps) {
  const [phase, setPhase] = React.useState<'in' | 'out' | 'hidden'>('hidden')

  React.useEffect(() => {
    if (visible) {
      setPhase('in')
    } else if (phase === 'in') {
      setPhase('out')
      const t = setTimeout(() => setPhase('hidden'), 220)
      return () => clearTimeout(t)
    }
  }, [visible]) // eslint-disable-line react-hooks/exhaustive-deps

  if (phase === 'hidden') return null

  const emotion: StepEmotion = mood === 'excited' ? 'proud' : 'sleepy'
  const variant              = mood === 'excited' ? 'success' : 'error'
  const wrapperClass  = phase === 'in' ? 'tanuki-sticker-entry' : 'tanuki-sticker-exit'
  const overlayClass  = phase === 'in' ? 'tanuki-overlay-in'    : 'tanuki-overlay-out'

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center ${overlayClass}`}
      style={{ backgroundColor: 'rgba(0,0,0,0.12)', backdropFilter: 'blur(2px)' }}
      onClick={onClose}
    >
      {/* Cloud wrapper — animated, head peeks above */}
      <div
        className={wrapperClass}
        style={{ position: 'relative', paddingTop: '28px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tanuki head overlapping the cloud top */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
          }}
        >
          <TanukiStepHead emotion={emotion} state="completed" size={100} />
        </div>

        {/* Cloud bubble with title, subtitle, dismiss button */}
        <CloudBubbleSVG
          title={title}
          subtitle={subtitle}
          onClose={onClose}
          variant={variant}
        />
      </div>
    </div>
  )
}

// ── Provider ─────────────────────────────────────────────────────────────────

const DURATION_SUCCESS = 2500
const DURATION_ERROR   = 4000

export function TanukiPopupProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<PopupState>({
    visible: false,
    mood: 'excited',
    title: '',
  })

  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  const dismiss = React.useCallback(() => {
    setState((s) => ({ ...s, visible: false }))
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  const show = React.useCallback(
    (mood: PopupMood, title: string, subtitle?: string, duration = DURATION_SUCCESS) => {
      if (timerRef.current) clearTimeout(timerRef.current)
      setState({ visible: true, mood, title, subtitle })
      timerRef.current = setTimeout(dismiss, duration)
    },
    [dismiss],
  )

  const showSuccess = React.useCallback(
    (title: string, subtitle?: string) => show('excited', title, subtitle, DURATION_SUCCESS),
    [show],
  )

  const showError = React.useCallback(
    (title: string, subtitle?: string) => show('sad', title, subtitle, DURATION_ERROR),
    [show],
  )

  React.useEffect(() => {
    _globalShowError = showError
    return () => { _globalShowError = null }
  }, [showError])

  const ctx = React.useMemo(
    () => ({ showSuccess, showError, dismiss }),
    [showSuccess, showError, dismiss],
  )

  return (
    <TanukiPopupContext.Provider value={ctx}>
      {children}
      <TanukiStickerPopup {...state} onClose={dismiss} />
    </TanukiPopupContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useTanukiPopup(): TanukiPopupContextType {
  const ctx = React.useContext(TanukiPopupContext)
  if (!ctx) throw new Error('useTanukiPopup must be used inside TanukiPopupProvider')
  return ctx
}
