import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/admin/review/$batchId')({
  beforeLoad: () => {
    throw redirect({ to: '/admin/dashboard' })
  },
  component: () => null,
})
