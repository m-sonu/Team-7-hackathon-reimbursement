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
  category: { en: string; jp: string }
  approved_amount: string
  amount: string
  bill_count: number
}

export type EmployeeDashboardResponse = {
  success: boolean
  message: string
  meta: PaginationMeta
  data: {
    total_bills: number
    total_approved_amount: string
    amount: string
    approved_amount: string
    current_month_verified_bills: number
    category_wise_amounts: CategoryAmount[]
  }
}

export type BillStatus =
  | 'pending'
  | 'under review'
  | 'verified'
  | 'rejected'
  | 'reimbursed'

export type UserBill = {
  id: number
  title: string
  category: { en: string; jp: string } | null
  created_date: string
  approved_amount: string
  amount: string
  ai_processing: 'processing' | 'success' | 'failed'
  status: BillStatus
  bills_count: number
}

export type PaginationMeta = {
  current_page: number
  last_page: number
  total: number
  next: string | null
  prev: string | null
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: PaginationMeta
}

export type EmployeeBill = {
  id: number
  name: string
  email: string
  bills_count: number
  total_amount: number
  approved_amount: number
}

export type Category = {
  id: number
  name: string
  jp_name?: string | null
  locale?: { en: string; jp: string }
  monthly_limit?: number | null
  is_active?: boolean
}

export type BillDetailItem = {
  id: number
  category_monthly_pivot_id: number | null
  bill_no: string | null
  vat_no: string | null
  amount: string
  amount_raw: number
  approved_amount: string
  status: string
  is_valid: boolean
  validation_error: string | null
  reason_for_action: string | null
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

export type BatchDetailResponse = {
  success: boolean
  message: string
  meta: PaginationMeta
  data: {
    id: number
    title: string
    category: string | null
    created_date: string
    approved_amount: string
    data: BillDetailItem[]
  }
}

export type BatchPreviewBill = {
  id: number
  bill_no: string | null
  vat_no: string | null
  amount: string
  amount_raw: number
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
  ai_processing: 'processing' | 'success' | 'failed'
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
  message: string
  meta: PaginationMeta
  data: {
    month: number
    year: number
    start_date: string
    end_date: string
    data: EmployeeBill[]
  }
}

export type CategoryBill = {
  category_id: number
  category: { en: string; jp: string }
  total_amount: string
  approved_amount: string
  bill_count: number
  status: BillStatus
  updated_at: string
}

export type AdminCategoryWiseBillsResponse = {
  success: boolean
  message: string
  data: {
    user_id: number
    data: CategoryBill[]
  }
}

export type AdminBillItem = BillDetailItem

export type AdminCategoryBillsResponse = {
  success: boolean
  message: string
  meta: PaginationMeta
  data: {
    total_amount: string
    approve_amount: string
    bill_count: number
    data: AdminBillItem[]
  }
}
