import { fetchEmployeeDashboard } from '#/lib/api/user'
import type { ApiError, EmployeeDashboardResponse } from '#/lib/types'
import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

export function useEmployeeDashboard(userId: number, token: string) {
  return useQuery<EmployeeDashboardResponse, AxiosError<ApiError>>({
    queryKey: ['employeeDashboard', userId],
    queryFn: () => fetchEmployeeDashboard(userId, token),
    enabled: !!userId && !!token,
  })
}
