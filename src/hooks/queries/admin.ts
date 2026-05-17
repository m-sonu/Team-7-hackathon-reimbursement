import { fetchEmployeeBills, fetchAdminCategoryWiseBills, fetchAdminCategoryBills, verifyBill, rejectBill, bulkReimburse, bulkReimburseUser } from '#/lib/api/admin'
import type { EmployeeBillsFilters, AdminCategoryWiseBillsFilters } from '#/lib/api/admin'
import type { AdminCategoryBillsResponse, AdminCategoryWiseBillsResponse, AdminEmployeeBillsResponse, ApiError } from '#/lib/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import type { AxiosError } from 'axios'

export function useEmployeeBills(
  token: string,
  filters?: EmployeeBillsFilters,
) {
  return useQuery<AdminEmployeeBillsResponse, AxiosError<ApiError>>({
    queryKey: ['employeeBills', filters],
    queryFn: () => fetchEmployeeBills(token, filters),
    enabled: !!token,
  })
}

export function useAdminCategoryWiseBills(
  userId: number,
  token: string,
  filters?: AdminCategoryWiseBillsFilters,
) {
  return useQuery<AdminCategoryWiseBillsResponse, AxiosError<ApiError>>({
    queryKey: ['adminCategoryWiseBills', userId, filters],
    queryFn: () => fetchAdminCategoryWiseBills(userId, token, filters),
    enabled: !!userId && !!token,
  })
}

export function useAdminCategoryBills(
  userId: number,
  categoryId: number,
  token: string,
) {
  return useQuery<AdminCategoryBillsResponse, AxiosError<ApiError>>({
    queryKey: ['adminCategoryBills', userId, categoryId],
    queryFn: () => fetchAdminCategoryBills(userId, categoryId, token),
    enabled: !!userId && !!categoryId && !!token,
  })
}

export function useVerifyBill(userId: number, categoryId: number) {
  const queryClient = useQueryClient()
  return useMutation<
    { success: boolean; message: string },
    AxiosError<ApiError>,
    { billId: number; token: string; approveAmount: number }
  >({
    mutationFn: ({ billId, token, approveAmount }) => verifyBill(billId, token, approveAmount),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['adminCategoryBills', userId, categoryId],
      })
      queryClient.invalidateQueries({
        queryKey: ['adminCategoryWiseBills', userId],
      })
    },
  })
}

export function useRejectBill(userId: number, categoryId: number) {
  const queryClient = useQueryClient()
  return useMutation<
    { success: boolean; message: string },
    AxiosError<ApiError>,
    { billId: number; token: string }
  >({
    mutationFn: ({ billId, token }) => rejectBill(billId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['adminCategoryBills', userId, categoryId],
      })
      queryClient.invalidateQueries({
        queryKey: ['adminCategoryWiseBills', userId],
      })
    },
  })
}

export function useUserBulkReimburse(userId: number) {
  const queryClient = useQueryClient()
  return useMutation<
    { success: boolean; message: string },
    AxiosError<ApiError>,
    { token: string; month?: number }
  >({
    mutationFn: ({ token, month }) => bulkReimburseUser(userId, token, month),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['adminCategoryWiseBills', userId],
      })
      queryClient.invalidateQueries({
        queryKey: ['employeeBills'],
      })
    },
  })
}

export function useBulkReimburse(userId?: number, categoryId?: number) {
  const queryClient = useQueryClient()
  return useMutation<
    { success: boolean; message: string },
    AxiosError<ApiError>,
    { batchId: number; token: string }
  >({
    mutationFn: ({ batchId, token }) => bulkReimburse(batchId, token),
    onSuccess: () => {
      if (userId && categoryId) {
        queryClient.invalidateQueries({
          queryKey: ['adminCategoryBills', userId, categoryId],
        })
        queryClient.invalidateQueries({
          queryKey: ['adminCategoryWiseBills', userId],
        })
      }
    },
  })
}
