import type { AdminEmployeeBillsResponse } from '../types'
import { urls } from '../urls'
import * as axios from '../utils/axios'

export type EmployeeBillsFilters = {
  month?: number
  status?: string
  per_page?: number
}

export function fetchEmployeeBills(
  token: string,
  filters?: EmployeeBillsFilters,
) {
  return axios.get<AdminEmployeeBillsResponse>({
    url: urls.employeeBills,
    params: filters,
    token,
  })
}
