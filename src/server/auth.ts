import { useAppSession } from '#/lib/utils/session'
import { redirect } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  const session = await useAppSession()
  await session.clear()
  throw redirect({ to: '/' })
})

export const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(
  async () => {
    const session = await useAppSession()
    const userId = session.data.userId

    if (!userId) {
      return null
    }

    // return await getUserById(userId)
    return {}
  },
)
