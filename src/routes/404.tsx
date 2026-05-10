import NotFound from '#/components/common/NotFound'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/404')({
  component: RouteComponent,
})

function RouteComponent() {
  return <NotFound />
}
