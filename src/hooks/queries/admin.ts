import { fetchEmployeeBills, type EmployeeBillsFilters } from '#/lib/api/admin'
import type { AdminEmployeeBillsResponse, ApiError } from '#/lib/types'
import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

export function useEmployeeBills(token: string, filters?: EmployeeBillsFilters) {
  return useQuery<AdminEmployeeBillsResponse, AxiosError<ApiError>>({
    queryKey: ['employeeBills', filters],
    queryFn: () => fetchEmployeeBills(token, filters),
    enabled: !!token,
  })
}
