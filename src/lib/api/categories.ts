import type { Category, PaginationMeta } from '../types'
import { urls } from '../urls'
import * as axios from '../utils/axios'

export function fetchCategories(token: string) {
  return axios.get<{ success: boolean; data: Category[]; meta: PaginationMeta }>({
    url: urls.categories,
    token,
  })
}
