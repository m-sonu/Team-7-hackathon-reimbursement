import { onLogout } from '#/server/cookies'
import { ROLES } from '#/lib/utils/constant'
import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/_admin')({
  beforeLoad: async ({ context }) => {
    if (!context.token) {
      await onLogout()
      throw redirect({ to: '/' })
    }
    if (context.user?.role !== ROLES.Admin) {
      throw redirect({ to: '/dashboard' })
    }
  },
  errorComponent: ({ error }) => {
    return <div>{error.message}</div>
  },
  component: () => <Outlet />,
})
