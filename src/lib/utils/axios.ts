import axios from 'axios'
import type { AxiosError, AxiosInstance } from 'axios'
import { toast } from 'react-toastify'
import { onLogout } from '#/server/cookies'
import { getT } from '#/lib/i18n'
import { cleanData } from '.'

interface RequestParams {
  url: string
  params?: unknown
  data?: unknown
  type?: 'formData' | 'json'
  token?: string
}

const authHeader = (token?: string) =>
  token ? { Authorization: `Bearer ${token}` } : {}

const axiosInstance: AxiosInstance = axios.create({
  baseURL: 'http://localhost:80/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    if (typeof window !== 'undefined' && (status === 401 || status === 403)) {
      toast.error(getT().auth.sessionExpired)
      await onLogout()
      window.location.href = '/'
      return new Promise(() => {})
    }
    return Promise.reject(error)
  },
)

const get = async <T>({ url, params, token }: RequestParams) => {
  const response = await axiosInstance.get<T>(url, {
    params: cleanData(params),
    headers: authHeader(token),
  })
  return response.data
}

const post = async <T>({ url, data, token }: RequestParams) => {
  const response = await axiosInstance.post<T>(url, cleanData(data), {
    headers: authHeader(token),
  })
  return response.data
}

const formdataPost = async <T>({ url, data, token }: RequestParams) => {
  const response = await axiosInstance.post<T>(url, data, {
    headers: { 'Content-Type': 'multipart/form-data', ...authHeader(token) },
  })
  return response.data
}

const put = async <T>({ url, data, token }: RequestParams) => {
  const response = await axiosInstance.put<T>(url, data, {
    headers: authHeader(token),
  })
  return response.data
}

const patch = async <T>({ url, data, token }: RequestParams) => {
  const response = await axiosInstance.patch<T>(url, data, {
    headers: authHeader(token),
  })
  return response.data
}

const del = async <T>({ url, token }: RequestParams) => {
  const response = await axiosInstance.delete<T>(url, {
    headers: authHeader(token),
  })
  return response.data
}

export { del, get, patch, post, put, formdataPost }
