import type z from 'zod'
import type { loginSchema } from './schema'

export type LoginSchema = z.infer<typeof loginSchema>

export type ApiError = {
  message: string
  success: boolean
}

export type ResponseWrapper<T> = {
  data: T
  message: string
  success: boolean
}

export type LoginResponse = {
  user: {
    id: number
    name: string
    email: string
    email_verified_at: null | string
    created_at: string
    updated_at: string
    provider_name: null
    provider_id: null
    provider_token: null
    provider_refresh_token: null
    role: 'Admin' | 'Employee'
  }
  token: string
}

export type CategoryAmount = {
  category_id: number
  category: string
  approved_amount: string
  amount: string
  bill_count: number
}

export type DashboardData = {
  total_bills: number
  total_approved_amount: string
  amount: string
  approved_amount: string
  current_month_verified_bills: number
  category_wise_amounts: CategoryAmount[]
}

export type BillStatus =
  | 'pending'
  | 'under review'
  | 'verified'
  | 'rejected'
  | 'reimbursed'

export type UserBill = {
  approved_amount: string
  id: number
  bill_count: number
  category_id: number
  category_name: string | null
  status: BillStatus
  total_amount: string
  created_date: string
  reject_reason?: string | null
}

export type PaginationMeta = {
  current_page: number
  from: number | null
  last_page: number
  per_page: number
  to: number | null
  total: number
}

export type PaginationLinks = {
  first: string
  last: string
  next: string | null
  prev: string | null
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: PaginationMeta
  links: PaginationLinks
}

export type EmployeeBill = {
  id: number
  name: string
  email: string
  amount: string
  approved_amount: string
  status: BillStatus
  currency?: string
}

export type Category = {
  id: number
  name: string
}

export type BillDetailItem = {
  id: number
  bill_no: string | null
  vat_no: string | null
  amount: string
  approved_amount: string
  status: string
  is_valid: boolean
  validation_error: string | null
  file_preview_url: string | null
  category: { id: number; name: string } | null
  billUploadBatch: {
    id: number
    title: string
    currency: string
    category: string | null
  } | null
  vendorContact: {
    id: number
    company_name: string | null
    phone: string | null
  } | null
  created_at: string
  updated_at: string
}

export type BatchDetail = {
  id: number
  title: string
  category: string | null
  created_date: string
  approved_amount: string
  bills: BillDetailItem[]
}

export type BatchPreviewBill = {
  id: number
  bill_no: string | null
  vat_no: string | null
  amount: string
  approved_amount: string
  status: string
  is_valid: boolean
  validation_error: string | null
  file_preview_url: string | null
  created_at: string
  updated_at: string
}

export type BatchPreview = {
  id: number
  title: string
  currency: string
  category: string | null
  submitted_at: string
  ai_processing: boolean
  totals: {
    valid: number
    invalid: number
    combined: number
  }
  valid_bills: BatchPreviewBill[]
  invalid_bills: BatchPreviewBill[]
}

export type AdminEmployeeBillsResponse = {
  success: boolean
  month: number
  year: number
  start_date: string
  end_date: string
  data: {
    data: EmployeeBill[]
    links: PaginationLinks
    meta: PaginationMeta
  }
}

export type AdminBillItem = {
  id: number
  amount: string
  title: string
  status: string
  is_valid: boolean
  validation_error: string | null
  file_preview_url: string | null
}

export type AdminCategoryBillsResponse = {
  success: boolean
  data: AdminBillItem[]
}
