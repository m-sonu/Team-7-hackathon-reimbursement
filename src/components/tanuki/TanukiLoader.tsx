import { useEffect, useRef } from 'react'

interface TanukiLoaderProps {
  message?: string
  onComplete?: () => void
}

const FALLBACK_MS = 1500
const MIN_MS = 800

export function TanukiLoader({ message, onComplete }: TanukiLoaderProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    let timer: ReturnType<typeof setTimeout>
    let called = false

    const finish = () => {
      if (called) return
      called = true
      onCompleteRef.current?.()
    }

    const schedule = (durationMs: number) => {
      clearTimeout(timer)
      const wait = Math.max(durationMs, MIN_MS)
      timer = setTimeout(finish, wait)
    }

    const onMeta = () => {
      const d = video.duration
      if (d && isFinite(d)) {
        schedule(d * 1000)
      }
    }

    timer = setTimeout(finish, FALLBACK_MS)

    if (video.readyState >= 1 && video.duration && isFinite(video.duration)) {
      schedule(video.duration * 1000)
    } else {
      video.addEventListener('loadedmetadata', onMeta)
    }

    return () => {
      clearTimeout(timer)
      video.removeEventListener('loadedmetadata', onMeta)
    }
  }, [])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4">
      <video
        ref={videoRef}
        src="/tanuki%20webm/loader.webm"
        autoPlay
        loop
        muted
        playsInline
        style={{ width: 260 }}
      />
      <p className="text-sm text-gray-500">
        {message ?? 'たぬきが頑張っています...'}
      </p>
    </div>
  )
}
