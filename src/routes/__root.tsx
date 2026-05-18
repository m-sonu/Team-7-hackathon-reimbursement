import { TanStackDevtools } from '@tanstack/react-devtools'
import {
  HeadContent,
  Scripts,
  createRootRouteWithContext,
} from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { ToastContainer } from 'react-toastify'
import TanStackQueryDevtools from '../integrations/tanstack-query/devtools'

import appCss from '../styles.css?url'

import NotFound from '#/components/common/NotFound'
import { I18nProvider } from '#/lib/i18n'
import type { QueryClient } from '@tanstack/react-query'
import { getAuthToken } from '#/server/cookies'

interface MyRouterContext {
  queryClient: QueryClient
  token?: string
  user?: {
    id: number
    name: string
    email: string
    role: 'Admin' | 'Employee'
  }
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Harateku Tanuki',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
      {
        rel: 'icon',
        type: 'image/svg+xml',
        href: '/favicon.svg',
      },
    ],
  }),
  beforeLoad: async () => {
    const response = await getAuthToken()
    return { token: response.token, user: response.user }
  },
  shellComponent: RootDocument,
  notFoundComponent: () => <NotFound />,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <I18nProvider>{children}</I18nProvider>
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
            TanStackQueryDevtools,
          ]}
        />
        <ToastContainer
          stacked
          newestOnTop
          closeButton
          position="top-right"
          autoClose={3000}
        />
        <Scripts />
      </body>
    </html>
  )
}
