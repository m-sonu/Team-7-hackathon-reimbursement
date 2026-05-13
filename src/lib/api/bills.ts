import type { BatchDetail, BatchPreview, PaginatedResponse, ResponseWrapper, UserBill } from '../types'
import { urls } from '../urls'
import * as axios from '../utils/axios'

export type UserBillsFilters = {
  start_date?: string
  end_date?: string
  month?: number
  year?: number
  category_id?: number
  status?: string
  page?: number
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

export function fetchUserBillDetails(billId: number, token: string) {
  return axios.get<ResponseWrapper<BatchDetail>>({
    url: urls.userBillDetails(billId),
    token,
  })
}

export function createBill(data: FormData, token: string) {
  return axios.formdataPost<{ message: string; batch_id: number; title: string }>({
    url: urls.bills,
    data,
    token,
  })
}

export function fetchBatchPreview(batchId: number, token: string) {
  return axios.get<{ success: boolean; data: BatchPreview }>({
    url: urls.batchPreview(batchId),
    token,
  })
}

export function submitBatch(batchId: number, token: string) {
  return axios.post<{ message: string }>({
    url: urls.batchSubmit(batchId),
    data: {},
    token,
  })
}
