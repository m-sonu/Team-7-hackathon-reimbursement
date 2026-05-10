import { loginCookieSchema } from '#/lib/schema'
import { createServerFn } from '@tanstack/react-start'
import { deleteCookie, getCookie, setCookie } from '@tanstack/react-start/server'

export const onLogin = createServerFn({ method: 'POST' })
  .inputValidator((data) => loginCookieSchema.parse(data))
  .handler(async ({ data }) => {
    setCookie('token', data.token, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60,
    })
    setCookie('user', JSON.stringify(data.user), {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60,
    })
  })

export const getAuthToken = createServerFn({ method: 'GET' }).handler(
  async () => {
    const token = getCookie('token')
    const stringifiedUser = getCookie('user')
    const user = JSON.parse(stringifiedUser || '{}')
    return { token, user }
  },
)

export const onLogout = createServerFn({ method: 'POST' }).handler(async () => {
  deleteCookie('token')
  deleteCookie('user')
})
