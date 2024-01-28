import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

import { httpBatchLink } from '@trpc/client'
import { useState } from 'react'
import { trpc } from './utils/trpc'
import { AppBody } from './components/AppBody'

export function App() {
  const [queryClient] = useState(() => new QueryClient())
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: 'http://localhost:5000/trpc',
          async headers() {
            return {
              'x-foo': 'bar',
            }
          },
        }),
      ],
    }),
  )
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AppBody />
      </QueryClientProvider>
    </trpc.Provider>
  )
}
