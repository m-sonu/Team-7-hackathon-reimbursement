import type { PaginatedResponse, UserBill } from '../types'
import { urls } from '../urls'
import * as axios from '../utils/axios'

export type UserBillsFilters = {
  month?: number
  year?: number
  category_id?: number
  status?: string
  per_page?: number
}

export function fetchUserBills(
  userId: number,
  token: string,
  filters?: UserBillsFilters,
) {
  return axios.get<PaginatedResponse<UserBill>>({
    url: urls.userBills(userId),
    params: filters,
    token,
  })
}
