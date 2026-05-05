import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ context }) => {
    const { email } = context
    if (!email) {
      throw Route.redirect({ to: '/' })
    }
  },
  errorComponent: ({ error }) => {
    return <div>{error.message}</div>
  },
  component: () => <Outlet />,
})
