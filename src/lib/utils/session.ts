// utils/session.ts
import { useSession } from '@tanstack/react-start/server'

type SessionData = {
  userId?: string
  email?: string
  role?: string
}

export function useAppSession() {
  return useSession<SessionData>({
    name: 'reimbursement-session',
    password: process.env.SESSION_SECRET!,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      httpOnly: true,
    },
  })
}
