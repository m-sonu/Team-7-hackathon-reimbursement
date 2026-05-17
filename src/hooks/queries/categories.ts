import { fetchCategories } from '#/lib/api/categories'
import type { ApiError, Category, PaginationMeta } from '#/lib/types'
import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

export function useCategories(token: string) {
  return useQuery<{ success: boolean; data: Category[]; meta: PaginationMeta }, AxiosError<ApiError>>({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(token),
    enabled: !!token,
    staleTime: Infinity,
  })
}
