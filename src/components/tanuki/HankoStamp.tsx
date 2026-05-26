import './animations.css'
import * as React from 'react'
import { TanukiMascot } from './TanukiMascot'

type Props = {
  /** Pass the bill status. The sequence plays once when status becomes 'verified'. */
  status: string
}

type Phase = 'idle' | 'slide-in' | 'stamp' | 'bow' | 'slide-out' | 'done'

export function HankoStamp({ status }: Props) {
  const isVerified = status.toLowerCase() === 'verified'
  const [phase, setPhase] = React.useState<Phase>('idle')
  const [shaking, setShaking] = React.useState(false)
  const [showSplat, setShowSplat] = React.useState(false)
  const hasPlayedRef = React.useRef(false)

  React.useEffect(() => {
    if (!isVerified || hasPlayedRef.current) return
    hasPlayedRef.current = true

    setPhase('slide-in')

    const t1 = setTimeout(() => setPhase('stamp'), 600)
    const t2 = setTimeout(() => {
      setShaking(true)
      setShowSplat(true)
    }, 1400)
    const t3 = setTimeout(() => {
      setShaking(false)
      setShowSplat(false)
      setPhase('bow')
    }, 1700)
    const t4 = setTimeout(() => setPhase('slide-out'), 2200)
    const t5 = setTimeout(() => setPhase('done'), 2600)

    return () => [t1, t2, t3, t4, t5].forEach(clearTimeout)
  }, [isVerified])

  return (
    <>
      {/* Tanuki animator — fixed overlay, slides in from right */}
      {(phase === 'slide-in' || phase === 'stamp' || phase === 'bow' || phase === 'slide-out') && (
        <div
          className={`fixed bottom-8 right-6 z-50 pointer-events-none ${
            phase === 'slide-in'  ? 'tanuki-slide-in'
            : phase === 'slide-out' ? 'tanuki-slide-out'
            : phase === 'bow'       ? 'tanuki-bow'
            : ''
          } ${shaking ? 'tanuki-screen-shake' : ''}`}
        >
          <TanukiMascot mood="stamping" size="lg" />
          {showSplat && (
            <div className="absolute top-12 left-0 tanuki-ink-splat">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                {[0,45,90,135,180,225,270,315].map((deg, i) => (
                  <ellipse
                    key={i}
                    cx={20 + 14 * Math.cos((deg * Math.PI) / 180)}
                    cy={20 + 14 * Math.sin((deg * Math.PI) / 180)}
                    rx="3" ry="2"
                    fill="#dc2626"
                    opacity="0.7"
                    transform={`rotate(${deg} ${20 + 14 * Math.cos((deg * Math.PI) / 180)} ${20 + 14 * Math.sin((deg * Math.PI) / 180)})`}
                  />
                ))}
                <circle cx="20" cy="20" r="5" fill="#dc2626" opacity="0.5" />
              </svg>
            </div>
          )}
        </div>
      )}

      {/* Persistent 承認 badge on the bill card once animation finishes */}
      {(phase === 'done' || (isVerified && hasPlayedRef.current)) && isVerified && (
        <div className="inline-flex items-center justify-center" aria-label="承認済み">
          <svg width="52" height="52" viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="26" r="23" stroke="#dc2626" strokeWidth="2.5" fill="none" />
            <circle cx="26" cy="26" r="20" stroke="#dc2626" strokeWidth="0.8" fill="none" opacity="0.4" />
            <text
              x="26" y="32"
              textAnchor="middle"
              fontSize="13"
              fontWeight="bold"
              fontFamily="serif"
              fill="#dc2626"
              transform="rotate(-8 26 26)"
            >
              承認
            </text>
          </svg>
        </div>
      )}
    </>
  )
}
