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

export type BillStatus = 'pending' | 'verified' | 'rejected' | 'paid'

export type UserBill = {
  id: number
  title: string
  category: string | null
  created_date: string
  approved_amount: string
  amount: string
  status: BillStatus
  bills_count: number
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
