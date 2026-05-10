import { fetchUserBills, type UserBillsFilters } from '#/lib/api/bills'
import type { ApiError, PaginatedResponse, UserBill } from '#/lib/types'
import { useQuery } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

export function useUserBills(
  userId: number,
  token: string,
  filters?: UserBillsFilters,
) {
  return useQuery<PaginatedResponse<UserBill>, AxiosError<ApiError>>({
    queryKey: ['userBills', userId, filters],
    queryFn: () => fetchUserBills(userId, token, filters),
    enabled: !!userId && !!token,
  })
}
