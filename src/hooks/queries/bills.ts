import { createBill, fetchUserBills, type UserBillsFilters } from '#/lib/api/bills'
import type { ApiError, PaginatedResponse, UserBill } from '#/lib/types'
import { useMutation, useQuery } from '@tanstack/react-query'
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

export function useCreateBill() {
  return useMutation<
    { message: string },
    AxiosError<ApiError>,
    { data: FormData; token: string }
  >({
    mutationFn: ({ data, token }) => createBill(data, token),
  })
}
