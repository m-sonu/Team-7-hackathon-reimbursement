import { fetchEmployeeDashboard } from '#/lib/api/user'
import type { ApiError, EmployeeDashboardResponse } from '#/lib/types'
import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

export function useEmployeeDashboard(
  userId: number,
  token: string,
  filters?: { start_date?: string; end_date?: string },
) {
  return useQuery<EmployeeDashboardResponse, AxiosError<ApiError>>({
    queryKey: ['employeeDashboard', userId, filters],
    queryFn: () => fetchEmployeeDashboard(userId, token, filters),
    enabled: !!userId && !!token,
  })
}
