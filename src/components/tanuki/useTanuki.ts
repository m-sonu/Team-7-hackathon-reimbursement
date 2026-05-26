import * as React from 'react'
import type { TanukiMood } from './TanukiMascot'

type TanukiState = {
  visible: boolean
  mood: TanukiMood
  message: string
}

export function useTanuki() {
  const [state, setState] = React.useState<TanukiState>({
    visible: false,
    mood: 'idle',
    message: '',
  })

  const trigger = React.useCallback((mood: TanukiMood, message?: string) => {
    setState({ visible: true, mood, message: message ?? '' })
    if (mood !== 'sleeping') {
      const delay = mood === 'stamping' ? 2500 : 3000
      setTimeout(() => setState((s) => ({ ...s, visible: false })), delay)
    }
  }, [])

  const dismiss = React.useCallback(() => {
    setState((s) => ({ ...s, visible: false }))
  }, [])

  return { ...state, trigger, dismiss }
}
