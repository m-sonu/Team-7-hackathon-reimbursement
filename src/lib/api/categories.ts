import type { Category, PaginationMeta } from '../types'
import { urls } from '../urls'
import * as axios from '../utils/axios'

export function fetchCategories(token: string) {
  return axios.get<{ success: boolean; data: Category[]; meta: PaginationMeta }>({
    url: urls.categories,
    token,
  })
}

export type CategoryPayload = {
  name: string
  jp_name?: string | null
  monthly_limit?: number | null
  is_active?: boolean
}

export function createCategory(token: string, data: CategoryPayload) {
  return axios.post<{ success: boolean; data: Category }>({
    url: urls.categoryCreate,
    token,
    data,
  })
}

export function updateCategory(id: number, token: string, data: CategoryPayload) {
  return axios.put<{ success: boolean; data: Category }>({
    url: urls.categoryUpdate(id),
    token,
    data,
  })
}

export function deleteCategory(id: number, token: string) {
  return axios.del<{ success: boolean; message: string }>({
    url: urls.categoryDelete(id),
    token,
  })
}
