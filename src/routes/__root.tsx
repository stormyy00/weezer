import { HeadContent, Scripts, createRootRouteWithContext, useRouterState } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { TanStackDevtools } from '@tanstack/react-devtools'

import appCss from '../styles.css?url'
import Navigation from '@/components/navigation'
import { SearchProvider } from '@/hooks/use-search'
import { ThemeProvider } from '@/hooks/use-theme'
import type { QueryClient } from '@tanstack/react-query';

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
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
        title: 'UCR Events',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  const state = useRouterState()
  const hideNav = state.location.pathname.startsWith('/adminlogin') || state.location.pathname.startsWith('/admin');
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
         <ThemeProvider>
          {!hideNav &&
      <SearchProvider>
<Navigation />
      </SearchProvider>
      }
        {children}
         </ThemeProvider>


        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: "TanStack Query",
              render: <ReactQueryDevtoolsPanel />,
            },
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
