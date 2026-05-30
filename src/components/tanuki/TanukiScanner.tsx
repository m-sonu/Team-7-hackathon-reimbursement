import * as React from 'react'

type Phase = 'uploaded' | 'searching' | 'sleeping' | 'excited'

type Props = {
  isScanning: boolean
  onComplete?: () => void
}

const PHASE_ORDER: Phase[] = ['uploaded', 'searching', 'sleeping', 'excited']

const PHASE_DURATION: Record<Phase, number> = {
  uploaded:  2500,
  searching: 4000,
  sleeping:  4000,
  excited:   Infinity,
}

const COPY: Record<Phase, { title: string; sub: string }> = {
  uploaded:  { title: 'ファイルをアップロードしました！',      sub: 'Files uploaded successfully!' },
  searching: { title: '領収書を解析中...',                    sub: 'Scanning your receipts...' },
  sleeping:  { title: 'たぬきが少し眠くなりました...',         sub: 'The tanuki got a little sleepy...' },
  excited:   { title: 'もうすぐ完了！たぬきも興奮中！🎉',     sub: 'Almost done! The tanuki is excited!' },
}

const VIDEO_SRC: Record<Phase, string> = {
  uploaded: '/tanuki%20webm/uploaded.webm',
  searching: '/tanuki%20webm/ai_processing.webm',
  sleeping: '/tanuki%20webm/ai_processing.webm',
  excited: '/tanuki%20webm/ai_process_completed.gif',
}

export function TanukiScanner({ isScanning, onComplete }: Props) {
  const [phase, setPhase] = React.useState<Phase>('uploaded')

  // Advance through phases while scanning
  React.useEffect(() => {
    if (!isScanning) return
    const idx  = PHASE_ORDER.indexOf(phase)
    const next = PHASE_ORDER[idx + 1]
    if (!next) return
    const t = setTimeout(() => setPhase(next), PHASE_DURATION[phase])
    return () => clearTimeout(t)
  }, [phase, isScanning])

  // Fire onComplete shortly after scanning ends
  React.useEffect(() => {
    if (!isScanning) {
      const t = setTimeout(() => onComplete?.(), 520)
      return () => clearTimeout(t)
    }
  }, [isScanning]) // eslint-disable-line react-hooks/exhaustive-deps

  const { title, sub } = COPY[phase]
  const src = VIDEO_SRC[phase]

  return (
    <div className="flex flex-col items-center justify-center gap-5" style={{ minHeight: 280 }}>
      <video
        key={src}
        src={src}
        autoPlay
        loop
        muted
        playsInline
        style={{ maxWidth: 180 }}
      />
      <div className="text-center px-4">
        <p className="text-base font-bold text-gray-800 leading-snug">{title}</p>
        <p className="mt-1 text-sm text-gray-500">{sub}</p>
      </div>
    </div>
  )
}
