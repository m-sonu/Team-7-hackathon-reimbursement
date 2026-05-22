import { createBill, deleteBill, fetchBatchPreview, fetchUserBillDetails, fetchUserBills, submitBatch, updateBill, type UserBillsFilters } from '#/lib/api/bills'
import type { ApiError, BatchDetailResponse, BatchPreview, PaginatedResponse, UserBill } from '#/lib/types'
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

export function useUserBillDetails(billId: number, token: string) {
  return useQuery<BatchDetailResponse, AxiosError<ApiError>>({
    queryKey: ['userBillDetails', billId],
    queryFn: () => fetchUserBillDetails(billId, token),
    enabled: !!billId && !!token,
  })
}

export function useCreateBill() {
  return useMutation<
    { success: boolean; message: string; data: { batch_id: number; title: string } },
    AxiosError<ApiError>,
    { data: FormData; token: string }
  >({
    mutationFn: ({ data, token }) => createBill(data, token),
  })
}

export function useBatchPreview(batchId: number, token: string) {
  return useQuery<{ success: boolean; data: BatchPreview }, AxiosError<ApiError>>({
    queryKey: ['batchPreview', batchId],
    queryFn: () => fetchBatchPreview(batchId, token),
    enabled: !!batchId && !!token,
    refetchInterval: (query) =>
      query.state.data?.data?.ai_processing === 'processing' ? 3000 : false,
  })
}

export function useSubmitBatch() {
  return useMutation<
    { message: string },
    AxiosError<ApiError>,
    { batchId: number; token: string }
  >({
    mutationFn: ({ batchId, token }) => submitBatch(batchId, token),
  })
}

export function useUpdateBill() {
  return useMutation<
    { success: boolean; message: string },
    AxiosError<ApiError>,
    { billId: number; data: { bill_no?: string | null; vat_no?: string | null; amount?: string }; token: string }
  >({
    mutationFn: ({ billId, data, token }) => updateBill(billId, data, token),
  })
}

export function useDeleteBill() {
  return useMutation<
    { success: boolean; message: string },
    AxiosError<ApiError>,
    { billId: number; token: string }
  >({
    mutationFn: ({ billId, token }) => deleteBill(billId, token),
  })
}
