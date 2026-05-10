import { DEFAULT_GC_TIME, DEFAULT_STALE_TIME } from '#/lib/utils/constant'
import { QueryClient } from '@tanstack/react-query'

export function getContext() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME,
        gcTime: DEFAULT_GC_TIME,
        retry: (failureCount, error: any) => {
          const status = error?.response?.status
          if (status === 401 || status === 403) return false
          return failureCount < 1
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        onSettled: (_data, error, _variables, _context, mutation) => {
          if (error) return
          if (mutation.meta?.invalidateQueries) {
            queryClient.invalidateQueries({
              queryKey: mutation.meta.invalidateQueries,
            })
          }
        },
      },
    },
  })

  return {
    queryClient,
  }
}
export default function TanstackQueryProvider() {}
