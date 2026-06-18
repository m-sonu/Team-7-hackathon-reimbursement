import { useI18n } from '#/lib/i18n'
import * as React from 'react'

type Phase = 'uploaded' | 'searching' | 'sleeping' | 'excited'

type Props = {
  isScanning: boolean
  onComplete?: () => void
}

const PHASE_ORDER: Phase[] = ['uploaded', 'searching', 'sleeping', 'excited']

const PHASE_DURATION: Record<Phase, number> = {
  uploaded: 2500,
  searching: 4000,
  sleeping: 4000,
  excited: Infinity,
}

const COPY: Record<Phase, { en: string; ja: string }> = {
  uploaded: {
    en: 'Files uploaded successfully!',
    ja: 'ファイルをアップロードしました！',
  },
  searching: { en: 'Scanning your receipts...', ja: '領収書を解析中...' },
  sleeping: {
    en: 'The tanuki got a little sleepy...',
    ja: 'たぬきが少し眠くなりました...',
  },
  excited: {
    en: 'Almost done! The tanuki is excited! 🎉',
    ja: 'もうすぐ完了！たぬきも興奮中！🎉',
  },
}

// Using animated WebP for transparent background support
const VIDEO_SRC: Record<Phase, string> = {
  uploaded:  '/tanuki%20webm/uploaded.webp',
  // searching and sleeping intentionally share the same clip
  searching: '/tanuki%20webm/ai_processing.webp',
  sleeping:  '/tanuki%20webm/ai_processing.webp',
  excited:   '/tanuki%20webm/ai_process_completed.webp',
}

export function TanukiScanner({ isScanning, onComplete }: Props) {
  const { lang } = useI18n()
  const [phase, setPhase] = React.useState<Phase>('uploaded')
  const reducedMotion = React.useMemo(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    [],
  )

  React.useEffect(() => {
    if (!isScanning) return
    const idx = PHASE_ORDER.indexOf(phase)
    const next = PHASE_ORDER[idx + 1]
    if (!next) return
    const t = setTimeout(() => setPhase(next), PHASE_DURATION[phase])
    return () => clearTimeout(t)
  }, [phase, isScanning])

  React.useEffect(() => {
    if (!isScanning) {
      const t = setTimeout(() => onComplete?.(), 520)
      return () => clearTimeout(t)
    }
  }, [isScanning]) // eslint-disable-line react-hooks/exhaustive-deps

  const src  = VIDEO_SRC[phase]
  const text = COPY[phase][lang]

  const [visible, setVisible]     = React.useState(true)
  const [displayed, setDisplayed] = React.useState({ src, text })

  React.useEffect(() => {
    setVisible(false)
    const t = setTimeout(() => {
      setDisplayed({ src, text })
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)))
    }, 220)
    return () => clearTimeout(t)
  }, [phase])

  return (
    <div
      className="flex flex-col items-center justify-center gap-5"
      style={{ minHeight: 280 }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.22s ease-in-out',
        }}
      >
        <img
          key={displayed.src}
          src={displayed.src}
          alt={displayed.text}
          className="max-w-[180px] w-auto h-auto"
          style={reducedMotion ? { animationPlayState: 'paused' } : undefined}
        />
        {displayed.text && (
          <div className="text-center px-4" aria-live="polite" aria-atomic="true">
            <p className="text-base font-bold text-gray-800 leading-snug">
              {displayed.text}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
