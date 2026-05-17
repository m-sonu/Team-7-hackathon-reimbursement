import type {
  AdminCategoryBillsResponse,
  AdminCategoryWiseBillsResponse,
  AdminEmployeeBillsResponse,
} from '../types'
import { urls } from '../urls'
import * as axios from '../utils/axios'

export type EmployeeBillsFilters = {
  start_date?: string
  end_date?: string
  status?: string
  page?: number
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

export type AdminCategoryWiseBillsFilters = {
  month?: number
  status?: string
  page?: number
  per_page?: number
}

export function fetchAdminCategoryWiseBills(
  userId: number,
  token: string,
  filters?: AdminCategoryWiseBillsFilters,
) {
  return axios.get<AdminCategoryWiseBillsResponse>({
    url: urls.adminCategoryWiseBills(userId),
    params: filters,
    token,
  })
}

export function fetchAdminCategoryBills(
  userId: number,
  categoryId: number,
  token: string,
) {
  return axios.get<AdminCategoryBillsResponse>({
    url: urls.adminCategoryBills(userId, categoryId),
    token,
  })
}

export function verifyBill(billId: number, token: string, approveAmount: number) {
  return axios.post<{ success: boolean; message: string }>({
    url: urls.adminVerifyBill(billId),
    data: { status: 'verified', approve_amount: approveAmount },
    token,
  })
}

export function rejectBill(billId: number, token: string) {
  return axios.post<{ success: boolean; message: string }>({
    url: urls.adminRejectBill(billId),
    data: { status: 'rejected' },
    token,
  })
}

export function bulkReimburse(batchId: number, token: string) {
  return axios.post<{ success: boolean; message: string }>({
    url: urls.adminBulkReimburse(batchId),
    data: {},
    token,
  })
}
