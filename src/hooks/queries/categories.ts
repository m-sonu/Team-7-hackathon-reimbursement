import { fetchCategories } from '#/lib/api/categories'
import type { ApiError, Category } from '#/lib/types'
import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

export function useCategories(token: string) {
  return useQuery<{ data: Category[] }, AxiosError<ApiError>>({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(token),
    enabled: !!token,
    staleTime: Infinity,
  })
}
