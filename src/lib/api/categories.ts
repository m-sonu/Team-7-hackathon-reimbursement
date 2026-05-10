import type { Category } from '../types'
import { urls } from '../urls'
import * as axios from '../utils/axios'

export function fetchCategories(token: string) {
  return axios.get<{ data: Category[] }>({ url: urls.categories, token })
}
