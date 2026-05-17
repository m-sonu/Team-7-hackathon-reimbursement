import type { EmployeeDashboardResponse } from '../types'
import { urls } from '../urls'
import * as axios from '../utils/axios'

export function fetchEmployeeDashboard(userId: number, token: string) {
  return axios.get<EmployeeDashboardResponse>({
    url: urls.userDashboard(userId),
    token,
  })
}

export function logout(token: string) {
  return axios.post<{ message: string }>({
    url: urls.logout,
    token,
  })
}
