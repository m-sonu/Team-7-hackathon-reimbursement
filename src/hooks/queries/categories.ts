import { fetchCategories, createCategory, updateCategory, deleteCategory } from '#/lib/api/categories'
import type { CategoryPayload } from '#/lib/api/categories'
import type { ApiError, Category, PaginationMeta } from '#/lib/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

export function useCategories(token: string) {
  return useQuery<{ success: boolean; data: Category[]; meta: PaginationMeta }, AxiosError<ApiError>>({
    queryKey: ['categories'],
    queryFn: () => fetchCategories(token),
    enabled: !!token,
    staleTime: Infinity,
  })
}

export function useCreateCategory(token: string) {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean; data: Category }, AxiosError<ApiError>, CategoryPayload>({
    mutationFn: (data) => createCategory(token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useUpdateCategory(token: string) {
  const queryClient = useQueryClient()
  return useMutation<
    { success: boolean; data: Category },
    AxiosError<ApiError>,
    { id: number } & CategoryPayload
  >({
    mutationFn: ({ id, ...data }) => updateCategory(id, token, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}

export function useDeleteCategory(token: string) {
  const queryClient = useQueryClient()
  return useMutation<{ success: boolean; message: string }, AxiosError<ApiError>, number>({
    mutationFn: (id) => deleteCategory(id, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] })
    },
  })
}
